/* ==========================================================================
   One clock drives BOTH the 2-D and the 3-D mechanism, so they always show
   the same moment and can be compared side by side.

   pos runs 0 -> 3.  Integer = a resting state (A, B, C, D).
   Inside step k (k < pos < k+1):
     u in [0, .35)   curved arrows draw in
     u in [.35, .45) arrows held
     u in [.45, 1]   atoms morph to the next state, electron pairs travel
   "Stops" are where the presenter's click pauses: every state, and every
   moment the arrows are fully drawn (so there is time to explain them).
   ========================================================================== */

/** stops for a mechanism with `last` steps: every state + every "arrows drawn" moment */
export const stopsFor = (last) => { const s = []; for (let k = 0; k < last; k++) s.push(k, k + 0.45); s.push(last); return s }
export const STOPS = stopsFor(3)
export const LAST = 3
const DRAW_END = 0.35
const MORPH_START = 0.45

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Decode a timeline position into what to draw. */
export function phaseAt(pos, last = LAST) {
  const p = Math.max(0, Math.min(last, pos))
  if (p >= last) return { k: last, next: last, arrow: 0, morph: 0, arrowAlpha: 0, travel: 0 }
  const k = Math.floor(p + 1e-9)
  const u = p - k
  if (u < 1e-6) return { k, next: k, arrow: 0, morph: 0, arrowAlpha: 0, travel: 0 }
  const arrow = Math.min(1, u / DRAW_END)
  const m = u <= MORPH_START ? 0 : (u - MORPH_START) / (1 - MORPH_START)
  return {
    k,
    next: k + 1,
    arrow,
    morph: easeInOut(m),
    arrowAlpha: m === 0 ? 1 : Math.max(0, 1 - easeInOut(m) * 1.4),
    travel: easeInOut(Math.min(1, m * 1.15)),
  }
}

/** Index of the caption to show: the last stop at or before pos. */
export function stopIndex(pos, stops = STOPS) {
  let idx = 0
  stops.forEach((s, i) => { if (pos >= s - 1e-6) idx = i })
  return idx
}

export function createTimeline(nSteps = 3) {
  const STOPS = stopsFor(nSteps)
  const LAST = nSteps
  const subs = new Set()
  const st = { pos: 0, target: 0, playAll: false, hold: 0, speed: 1 }
  let last = 0
  let raf = 0

  const emit = () => subs.forEach((f) => f())
  const UNITS_PER_SEC = 1 / 3.4

  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    if (st.hold > 0) {
      st.hold -= dt
    } else if (st.pos !== st.target) {
      const dir = Math.sign(st.target - st.pos)
      let next = st.pos + dir * dt * UNITS_PER_SEC * st.speed
      // in play-all mode pause briefly at every stop we cross
      if (st.playAll) {
        const crossed = STOPS.find((s) => (dir > 0 ? s > st.pos + 1e-6 && s <= next : false))
        if (crossed !== undefined && crossed !== st.target) { next = crossed; st.hold = 0.9 }
      }
      if ((dir > 0 && next >= st.target) || (dir < 0 && next <= st.target)) {
        next = st.target
        st.playAll = false
      }
      st.pos = next
      emit()
    }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  const api = {
    get pos() { return st.pos },
    get last() { return LAST },
    get stops() { return STOPS },
    phase() { return phaseAt(st.pos, LAST) },
    get target() { return st.target },
    get playing() { return st.pos !== st.target || st.playAll },
    get speed() { return st.speed },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn) },
    next() {
      const s = STOPS.find((x) => x > st.target + 1e-6)
      if (s !== undefined) { st.target = s; st.playAll = false; st.hold = 0; emit() }
    },
    back() {
      // jump (no reverse animation): previous stop before the current position
      const prev = [...STOPS].reverse().find((x) => x < st.pos - 1e-6)
      st.pos = prev ?? 0; st.target = st.pos; st.playAll = false; st.hold = 0; emit()
    },
    goto(i) { st.pos = STOPS[i]; st.target = st.pos; st.playAll = false; st.hold = 0; emit() },
    playAll() {
      if (st.pos >= LAST) st.pos = 0
      st.target = LAST; st.playAll = true; st.hold = 0.4; emit()
    },
    reset() { st.pos = 0; st.target = 0; st.playAll = false; st.hold = 0; emit() },
    setSpeed(x) { st.speed = x; emit() },
    destroy() { cancelAnimationFrame(raf); subs.clear() },
  }
  return api
}
