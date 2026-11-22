import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { MechScene3D } from './MechScene3D.js'

/* React shell around the Three.js scene. The canvas mount is ONE stable div
   that is always rendered (re-parenting a live canvas gives a black frame). */
export default function Mechanism3D({ mech, timeline, solo = false }) {
  const mount = useRef(null)
  const sceneRef = useRef(null)
  const [spin, setSpin] = useState(false)
  const pos = useSyncExternalStore(timeline.subscribe, () => timeline.pos)

  useEffect(() => {
    const s = new MechScene3D(mount.current, timeline, mech)
    sceneRef.current = s
    return () => { s.dispose(); sceneRef.current = null }
  }, [timeline, mech])

  useEffect(() => { sceneRef.current?.setAutoRotate(spin) }, [spin])

  const ph = timeline.phase()
  const st = mech.states3d[ph.morph < 0.5 ? ph.k : ph.next]

  return (
    <div className="stage3d">
      <div className="stage3d-mount" ref={mount} />
      {solo && (
        <div className="stage3d-hud">
          <span className="hud-chip">คาร์บอนของ C=O · <b>{st.carbon} {st.angleText}</b></span>
        </div>
      )}
      <div className="stage3d-tools">
        <button className="tool" onClick={() => sceneRef.current?.home()} title="มุมกล้องเริ่มต้น">⟲ มุมเดิม</button>
        <button className="tool" data-on={spin ? 1 : 0} onClick={() => setSpin(!spin)}>↻ หมุน</button>
      </div>
      <div className="stage3d-hint">ลากเพื่อหมุน · scroll เพื่อซูม</div>
    </div>
  )
}
