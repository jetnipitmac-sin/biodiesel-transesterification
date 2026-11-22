
/* Plain helpers for the 2-D layout (no React), shared by the 2-D renderer,
   the overview strip and the 3-D scene (which borrows the 2-D arrow shapes). */

export const labelPad = (mech, id) => (mech.atoms2d[id].t.length > 2 ? 25 : 16)

function pointOf(state, ref) {
  if (Array.isArray(ref)) {
    const p = state.pos[ref[0]]
    const q = state.pos[ref[1]]
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  }
  return state.pos[ref]
}

/** Quadratic curve for an electron-pushing arrow, trimmed clear of the atom labels. */
export function arrowPath(mech, state, ar) {
  let p = pointOf(state, ar.from)
  let q = pointOf(state, ar.to)
  const dx = q[0] - p[0]
  const dy = q[1] - p[1]
  const L = Math.hypot(dx, dy) || 1
  const c = [(p[0] + q[0]) / 2 - (dy / L) * L * ar.bow, (p[1] + q[1]) / 2 + (dx / L) * L * ar.bow]
  const pull = (from, to, d) => {
    const u = [to[0] - from[0], to[1] - from[1]]
    const ul = Math.hypot(u[0], u[1]) || 1
    return [from[0] + (u[0] / ul) * d, from[1] + (u[1] / ul) * d]
  }
  if (!Array.isArray(ar.from)) p = pull(p, c, labelPad(mech, ar.from) + 2)
  if (!Array.isArray(ar.to)) q = pull(q, c, labelPad(mech, ar.to) + 6)
  return { p, c, q }
}

/** Tight viewBox around the visible atoms (and arrows) of the given states. */
export function boxFor(mech, states, withArrows = [], pad = 34) {
  let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity
  const add = (p, r = 0) => { x0 = Math.min(x0, p[0] - r); y0 = Math.min(y0, p[1] - r); x1 = Math.max(x1, p[0] + r); y1 = Math.max(y1, p[1] + r) }
  states.forEach((k) => {
    const s = mech.states2d[k]
    Object.keys(mech.atoms2d).forEach((id) => { if (!(s.hide || []).includes(id)) add(s.pos[id], labelPad(mech, id) + 6) })
  })
  withArrows.forEach((k) => (mech.arrows2d[k] || []).forEach((ar) => add(arrowPath(mech, mech.states2d[k], ar).c)))
  return [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad]
}

