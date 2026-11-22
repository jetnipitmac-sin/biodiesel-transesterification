import React, { useMemo, useSyncExternalStore } from 'react'
import Structure2D, { boxFor } from './Structure2D.jsx'

/* Live 2-D mechanism for any mechanism definition (see mechs.js).
   The view pans with the action at constant scale: every state gets its
   own tight box, all boxes share the largest size, the centre glides. */
export default function Mechanism2D({ mech, timeline }) {
  const pos = useSyncExternalStore(timeline.subscribe, () => timeline.pos)
  const view = useMemo(() => {
    const boxes = mech.states2d.map((_, k) => boxFor(mech, [k], k < mech.steps ? [k] : [], 26))
    const W = Math.max(...boxes.map((b) => b[2]))
    const H = Math.max(...boxes.map((b) => b[3]))
    const C = boxes.map((b) => [b[0] + b[2] / 2, b[1] + b[3] / 2])
    return (k, n, m) => [C[k][0] + (C[n][0] - C[k][0]) * m - W / 2, C[k][1] + (C[n][1] - C[k][1]) * m - H / 2, W, H]
  }, [mech])
  const ph = timeline.phase()
  const st = mech.states3d[ph.morph < 0.5 ? ph.k : ph.next]
  return (
    <div className="m2d">
      <Structure2D mech={mech} k={ph.k} next={ph.next} m={ph.morph} arrow={ph.arrow} arrowAlpha={ph.arrowAlpha}
        travel={ph.travel} viewBox={view(ph.k, ph.next, ph.morph)} idPrefix={`live-${mech.id}`} />
      {st.carbon && <span className="hyb">คาร์บอนของ C=O · <b>{st.carbon}</b> {st.angleText}</span>}
      <i hidden>{pos}</i>
    </div>
  )
}
