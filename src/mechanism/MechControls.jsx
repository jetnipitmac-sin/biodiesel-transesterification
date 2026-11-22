import React, { useEffect, useSyncExternalStore } from 'react'
import { STOPS, stopIndex } from './timeline.js'
import { CAPTIONS, STEP_NAMES } from './steps.js'

/* Step card + transport. Keyboard works with a presentation clicker:
   → / PageDown / Space = next, ← / PageUp = back, Home / R = reset, P = play all. */
export function useMechKeys(timeline) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); timeline.next() }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); timeline.back() }
      else if (e.key === 'Home' || e.key === 'r' || e.key === 'R') timeline.reset()
      else if (e.key === 'p' || e.key === 'P') timeline.playAll()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [timeline])
}

const usePos = (timeline) => useSyncExternalStore(timeline.subscribe, () => timeline.pos)

const ROMAN = ['', 'I', 'II', 'III']

export function StepCard({ timeline, captions = CAPTIONS }) {
  const pos = usePos(timeline)
  const c = captions[stopIndex(pos, timeline.stops)]
  return (
    <div className="stepcard" data-phase={c.phase}>
      <div className="sc-num" key={`n${c.step}`}>
        {c.step === 0
          ? <><svg className="sc-hex" viewBox="0 0 40 46"><path d="M20 2 38 12.5v21L20 44 2 33.5v-21z" /></svg><span className="sc-start">เริ่ม</span></>
          : <><span className="sc-n roman">{ROMAN[c.step]}</span><span className="sc-n arabic">{c.step}</span><span className="sc-of">ขั้นที่ {c.step} จาก {Math.max(...captions.map((x) => x.step))}</span></>}
      </div>
      <div className="sc-body" key={`b${stopIndex(pos, timeline.stops)}`}>
        <div className="sc-tag">{c.tag}</div>
        <h3 className="sc-title">{c.title}</h3>
        <p className="sc-text" dangerouslySetInnerHTML={{ __html: c.text }} />
      </div>
    </div>
  )
}

/* progress drawn as a little chain: atoms = resting states, bonds = steps */
export function Progress({ timeline }) {
  const pos = usePos(timeline)
  return (
    <div className="chain">
      {[0, 1, 2, 3].map((k) => (
        <React.Fragment key={k}>
          <button className="chain-atom" data-on={pos >= k - 1e-6 ? 1 : 0} data-here={Math.abs(pos - k) < 1e-6 ? 1 : 0}
            onClick={() => timeline.goto(2 * k)} title={`สภาพ ${'ABCD'[k]}`}>{'ABCD'[k]}</button>
          {k < 3 && (
            <button className="chain-bond" onClick={() => timeline.goto(2 * k + 1)} title={STEP_NAMES[k].en}>
              <span className="chain-track"><span className="chain-fill" style={{ transform: `scaleX(${Math.max(0, Math.min(1, pos - k))})` }} /></span>
              <span className="chain-lbl"><i>{ROMAN[k + 1]}</i> {STEP_NAMES[k].en}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export function Transport({ timeline }) {
  const pos = usePos(timeline)
  const atEnd = pos >= STOPS[STOPS.length - 1] - 1e-6
  return (
    <div className="transport">
      <button className="ib" onClick={() => timeline.reset()} title="เริ่มใหม่ (Home)" aria-label="เริ่มใหม่">
        <svg viewBox="0 0 24 24"><path d="M6 5v14M19 6l-9 6 9 6z" /></svg>
      </button>
      <button className="ib" onClick={() => timeline.back()} disabled={pos <= 0} title="ย้อน (←)" aria-label="ย้อน">
        <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button className="next" onClick={() => timeline.next()} disabled={atEnd} title="ขั้นถัดไป (→ / Space)">
        ถัดไป
        <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
      </button>
      <button className="ib" onClick={() => timeline.playAll()} title="เล่นทั้งหมด (P)" aria-label="เล่นทั้งหมด">
        <svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" /></svg>
      </button>
      <button className="ib speed" onClick={() => timeline.setSpeed(timeline.speed === 1 ? 0.5 : 1)} title="ความเร็ว">
        {timeline.speed === 1 ? '1×' : '½×'}
      </button>
    </div>
  )
}
