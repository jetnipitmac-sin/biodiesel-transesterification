import React, { useEffect, useMemo, useRef } from 'react'
import { createTimeline } from '../mechanism/timeline.js'
import Mechanism2D from '../mechanism/Mechanism2D.jsx'
import Mechanism3D from '../mechanism/Mechanism3D.jsx'
import { StepCard } from '../mechanism/MechControls.jsx'
import { MECHS } from '../mechanism/mechs.js'
import { Equation } from '../components/chem.jsx'
import { MiniRoadmap } from './Roadmap.jsx'
import { REACTIONS, STORY_KEYS } from '../data/story.js'

const ICONS = {
  who: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0" />,
  what: <path d="M4 12h12M12 6l6 6-6 6" />,
  where: <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  how: <path d="M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />,
  result: <path d="M5 13l4 4L19 7" />,
  next: <path d="M5 12h14M13 5l7 7-7 7M5 5v14" />,
}

/* One page per reaction: where it sits in the process, the story
   (who / what / where / how / result / what next), then the mechanism. */
export default function ReactionPage({ n, step, setStep, go }) {
  const R = REACTIONS[n]
  const mech = MECHS[R.mech]
  const timeline = useMemo(() => createTimeline(mech.steps), [mech])
  const last = useRef(0)
  const mechRef = useRef(null)
  const total = 2 * mech.steps + 1
  useEffect(() => () => timeline.destroy(), [timeline])
  useEffect(() => {
    if (step === last.current + 1) timeline.next()
    else if (step !== last.current) timeline.goto(step)
    if (step > 0 && last.current === 0) mechRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    last.current = step
  }, [step, timeline])

  return (
    <div className={`rxp rx${n}`}>
      <MiniRoadmap here={R.station} go={go} />
      <header className="rx-head rev">
        <div className="rx-badge"><small>ปฏิกิริยาที่</small><b>{n}</b></div>
        <div className="rx-title">
          <div className="rx-role">{R.role}</div>
          <h2>{R.name}</h2>
          <div className="rx-eq"><Equation kind={R.eq} /></div>
          <div className="rx-cond">{R.cond.map((c) => <span key={c}>{c}</span>)}</div>
        </div>
      </header>
      <div className="story">
        {STORY_KEYS.map(([k, th, sub], i) => (
          <div key={k} className="story-t rev" data-k={k}>
            <div className="story-h">
              <span className="story-i"><svg viewBox="0 0 24 24">{ICONS[k]}</svg></span>
              <div><b>{th}</b><i>{sub}</i></div>
              <span className="story-n">{i + 1}</span>
            </div>
            <p>{R.story[k]}</p>
          </div>
        ))}
      </div>
      <div className="rx-mech" ref={mechRef}>
        <div className="rx-mech-h rev"><b>กลไก {mech.steps} ขั้น</b><span>กด → ทีละจังหวะ · ซ้ายแบบที่เขียนบนกระดาน · ขวารูปทรงจริง</span></div>
        <div className="mech-panes rev">
          <section className="pane pane-2d"><div className="pane-tag"><b>2D</b> แบบที่เขียนบนกระดาน</div><Mechanism2D mech={mech} timeline={timeline} /></section>
          <section className="pane pane-3d"><div className="pane-tag"><b>3D</b> รูปทรงจริง</div><Mechanism3D mech={mech} timeline={timeline} /></section>
        </div>
        <div className="mech-dock rev">
          <StepCard timeline={timeline} captions={mech.captions} />
          <div className="mech-ctl">
            <div className="transport">
              <button className="ib" onClick={() => setStep(0)} aria-label="เริ่มใหม่"><svg viewBox="0 0 24 24"><path d="M6 5v14M19 6l-9 6 9 6z" /></svg></button>
              <button className="ib" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} aria-label="ย้อน"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg></button>
              <button className="next" onClick={() => setStep(Math.min(total - 1, step + 1))} disabled={step === total - 1}>ถัดไป<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button>
            </div>
            <div className="dots-steps">
              {Array.from({ length: total }, (_, k) => <i key={k} data-kind={k % 2 ? 'arrow' : 'state'} data-on={k === step ? 1 : 0} data-done={k < step ? 1 : 0} onClick={() => setStep(k)} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
