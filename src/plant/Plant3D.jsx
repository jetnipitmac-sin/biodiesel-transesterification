import React, { useEffect, useRef } from 'react'
import { PlantScene } from './PlantScene.js'

/* React shell around the plant scene (one stable mount div). */
export default function Plant3D({ selected, onSelect, flows, labels }) {
  const mount = useRef(null)
  const scene = useRef(null)
  const sel = useRef(onSelect)
  sel.current = onSelect

  useEffect(() => {
    const s = new PlantScene(mount.current, { onSelect: (id) => sel.current(id) })
    scene.current = s
    return () => { s.dispose(); scene.current = null }
  }, [])

  useEffect(() => { scene.current?.select(selected) }, [selected])
  useEffect(() => { scene.current?.setFlows(flows) }, [flows])
  useEffect(() => { scene.current?.setLabels(labels) }, [labels])

  return <div className="pl-mount" ref={mount} />
}
