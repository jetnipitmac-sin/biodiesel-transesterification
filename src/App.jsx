import React, { useEffect, useReducer, useState } from 'react'
import Hero from './sections/Hero.jsx'
import Roadmap from './sections/Roadmap.jsx'
import ReactionPage from './sections/ReactionPage.jsx'
import PlantSection from './sections/PlantSection.jsx'
import ThankYou from './sections/ThankYou.jsx'
import { MECHS } from './mechanism/mechs.js'
import { UNITS } from './plant/units.js'
import CREDITS from './data/credits.json'
import { QUIZ } from './data/quiz.js'
import BgFx from './components/BgFx.jsx'

/* ==========================================================================
   The presentation is the dashboard: one topic per page, numbered pills on
   top, progress bar, footer that names the next topic.
   → / PageDown / Space = next (steps inside the mechanism and the plant tour
   first), ← / PageUp = back, Shift+→/← = skip a whole page, N = speaker notes
   (hidden by default), F = full screen. The page is kept in the URL: #/3
   ========================================================================== */

const R1 = (p) => <ReactionPage n={1} {...p} />
const R2 = (p) => <ReactionPage n={2} {...p} />
const R3 = (p) => <ReactionPage n={3} {...p} />
const capNotes = (mech) => (s) => { const c = MECHS[mech].captions[s]; return c ? `${c.tag}: ${c.title}` : '' }

const SECTIONS = [
  { id: 'start', nav: 'เริ่มที่นี่', C: Hero, notes: 'แนะนำหัวข้อ · บอกว่าในโรงงานมีปฏิกิริยา 3 ตัว เล่าตามลำดับที่เกิด: 1 Fischer (เตรียมน้ำมัน) → 2 Transesterification (ตัวหลัก) → 3 Saponification (ตัวร้าย)' },
  { id: 'roadmap', nav: 'Roadmap', C: Roadmap, notes: 'ไล่ 8 สถานีจากน้ำมันปาล์มถึง B7 · ชี้กล่องสีว่าเป็นจุดที่มีปฏิกิริยา · ปฏิกิริยาที่ 3 แอบเกิดในสถานี 3 ถ้ามีน้ำ/FFA และถูกล้างออกที่สถานี 6' },
  { id: 'r1', nav: '1 · Fischer', C: R1, steps: 11, notes: capNotes('fischer') },
  { id: 'r2', nav: '2 · Transesterification', C: R2, steps: 7, notes: capNotes('trans') },
  { id: 'r3', nav: '3 · Saponification', C: R3, steps: 7, notes: capNotes('sapon') },
  { id: 'plant', nav: 'โรงงาน 3D', C: PlantSection, steps: 11,
    notes: (s) => (s === 0 ? 'ภาพรวมโรงงาน 10 หน่วย · ป้ายสีบอกว่าปฏิกิริยาที่ 1/2/3 เกิดที่หน่วยไหน · ถ้าเวลาน้อย เดินแค่หน่วย 1, 3, 4, 5, 7, 9' : `${UNITS[s - 1].name}: ${UNITS[s - 1].role}`) },
  { id: 'thanks', nav: 'Thank you', C: ThankYou, steps: QUIZ.length,
    notes: (s) => `ข้อ ${s + 1} · เฉลย ${'ABCD'[QUIZ[s].ans]}: ${QUIZ[s].ch[QUIZ[s].ans]}` },
]

function reducer(st, a) {
  const stepsOf = (k) => SECTIONS[k].steps || 1
  const clamp = (k) => Math.max(0, Math.min(SECTIONS.length - 1, k))
  switch (a.type) {
    case 'next':
      if (st.step < stepsOf(st.i) - 1) return { ...st, step: st.step + 1 }
      return st.i < SECTIONS.length - 1 ? { i: st.i + 1, step: 0 } : st
    case 'prev':
      if (st.step > 0) return { ...st, step: st.step - 1 }
      return st.i > 0 ? { i: st.i - 1, step: 0 } : st
    case 'go': return { i: clamp(a.i), step: a.step || 0 }
    case 'skip': return { i: clamp(st.i + a.d), step: 0 }
    case 'step': return { ...st, step: Math.max(0, Math.min(stepsOf(st.i) - 1, a.step)) }
    default: return st
  }
}

const fromHash = () => {
  const m = window.location.hash.match(/^#\/(\d+)/)
  return { i: m ? Math.max(0, Math.min(SECTIONS.length - 1, parseInt(m[1], 10) - 1)) : 0, step: 0 }
}

export default function App() {
  const [{ i, step }, dispatch] = useReducer(reducer, undefined, fromHash)
  const [notes, setNotes] = useState(false)
  const s = SECTIONS[i]
  const Current = s.C
  const go = (k) => dispatch({ type: 'go', i: k })
  const setStep = (n) => dispatch({ type: 'step', step: n })

  // preload every photo once, so switching pages never shows an empty frame
  useEffect(() => {
    CREDITS.forEach((c) => { const im = new Image(); im.src = `${import.meta.env.BASE_URL}images/${c.file}` })
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', `#/${i + 1}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [i])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return
      const d = (type, extra = {}) => { e.preventDefault(); dispatch({ type, ...extra }) }
      if ((e.key === 'ArrowRight' || e.key === 'PageDown') && e.shiftKey) d('skip', { d: 1 })
      else if ((e.key === 'ArrowLeft' || e.key === 'PageUp') && e.shiftKey) d('skip', { d: -1 })
      else if (['ArrowRight', 'PageDown', ' '].includes(e.key)) d('next')
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) d('prev')
      else if (e.key === 'Home') d('go', { i: 0 })
      else if (e.key === 'End') d('go', { i: SECTIONS.length - 1 })
      else if (e.key === 'n' || e.key === 'N') setNotes((x) => !x)
      else if (e.key === 'f' || e.key === 'F') { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const steps = s.steps || 1
  const progress = (i + (steps > 1 ? step / (steps - 1) : 1)) / SECTIONS.length
  const next = SECTIONS[i + 1]

  return (
    <div className="app" data-sec={s.id}>
      <BgFx />
      <div className="wipe" key={`wipe-${s.id}`} aria-hidden="true" />
      <header className="bar">
        <button className="brand" onClick={() => go(0)}>
          <svg className="hex" viewBox="0 0 40 46"><path d="M20 2 38 12.5v21L20 44 2 33.5v-21z" /><path d="M20 10 31 16.5v13L20 36 9 29.5v-13z" /></svg>
          <span><b>Biodiesel Lab</b><i>Transesterification of Palm Oil</i></span>
        </button>
        <nav className="pills">
          {SECTIONS.map((x, k) => (
            <button key={x.id} className="pill" data-on={k === i ? 1 : 0} data-done={k < i ? 1 : 0} onClick={() => go(k)}>
              <span className="pill-n">{String(k).padStart(2, '0')}</span>{x.nav}
            </button>
          ))}
        </nav>
        <div className="bar-prog"><i style={{ transform: `scaleX(${Math.min(1, progress)})` }} /></div>
      </header>

      <main className="page" key={s.id}>
        <Current step={step} setStep={setStep} go={go} />
      </main>

      <nav className="foot">
        <button className="foot-b" onClick={() => dispatch({ type: 'prev' })} disabled={i === 0 && step === 0}>← ก่อนหน้า</button>
        <div className="foot-dots">
          {SECTIONS.map((x, k) => <i key={x.id} data-on={k === i ? 1 : 0} onClick={() => go(k)} title={x.nav} />)}
        </div>
        <button className="foot-b main" onClick={() => dispatch({ type: 'next' })} disabled={!next && step >= steps - 1}>
          {step < steps - 1 ? `ถัดไป (${step + 1}/${steps}) →` : next ? `${next.nav} →` : 'จบแล้ว ✓'}
        </button>
      </nav>

      {notes && (
        <div className="notes">
          <b>{String(i).padStart(2, '0')} · {s.nav}{steps > 1 ? ` · ${step + 1}/${steps}` : ''}</b>
          <p>{typeof s.notes === 'function' ? s.notes(step) : s.notes}</p>
        </div>
      )}
    </div>
  )
}
