import React, { useEffect, useState } from 'react'
import { QUIZ } from '../data/quiz.js'
import Mascot from './Mascot.jsx'

/* Multiple-choice quiz. The current question is the page "step", so → / ←
   and the footer move between questions; pick with a click or 1-4 / A-D.
   Answers are kept for the session (until reload), so leaving the page to
   show a mechanism again does not lose them. */

const L = 'ABCD'
let saved = {}

export default function Quiz({ q, setQ }) {
  const [picked, setPicked] = useState(saved)
  const Q = QUIZ[q]
  const mine = picked[q]
  const answered = mine !== undefined
  const right = answered && mine === Q.ans
  const done = Object.keys(picked).length
  const score = Object.entries(picked).filter(([k, v]) => QUIZ[k].ans === v).length

  const pick = (k) => {
    if (answered) return
    const nx = { ...picked, [q]: k }
    saved = nx
    setPicked(nx)
  }
  const reset = () => { saved = {}; setPicked({}); setQ(0) }

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase())
      if (k >= 0 && e.key.length === 1) pick(k)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <section className="quiz rev">
      <header className="qz-top">
        <Mascot mood={!answered ? 'idle' : right ? 'happy' : 'sad'} />
        <div>
          <div className="qz-k">Quiz · Prepared questions</div>
          <h3 className="qz-h">ตอบได้ไหม? เลือก 1 ข้อ</h3>
        </div>
        <div className="qz-score" title="ตอบถูก / จำนวนข้อ">
          <b>{score}</b><span>/ {QUIZ.length}</span>
          <i>ตอบแล้ว {done} ข้อ</i>
        </div>
        <button className="qz-reset" onClick={reset} disabled={done === 0}>เริ่มใหม่</button>
      </header>

      <nav className="qz-nav">
        {QUIZ.map((x, k) => {
          const st = picked[k] === undefined ? '' : picked[k] === x.ans ? 'ok' : 'bad'
          return <button key={k} data-on={k === q ? 1 : 0} data-st={st} onClick={() => setQ(k)}>{k + 1}</button>
        })}
      </nav>

      <div className={`qz-q rx${Q.rx}`} key={`q${q}`}>
        <div className="qz-meta">
          <span className="qz-no">ข้อ {q + 1}</span>
          <span className="qz-tag">ปฏิกิริยาที่ {Q.rx} · {Q.tag}</span>
        </div>
        <p className="qz-text">{Q.q}</p>
      </div>

      <div className="qz-ch" key={`c${q}`}>
        {Q.ch.map((c, k) => {
          const st = !answered ? '' : k === Q.ans ? 'ok' : k === mine ? 'bad' : 'dim'
          return (
            <button key={k} className="qz-c" data-st={st} onClick={() => pick(k)} disabled={answered}>
              <span className="qz-l">{L[k]}</span>
              <span className="qz-ct">{c}</span>
              {st === 'ok' && <i className="qz-mark">✓</i>}
              {st === 'ok' && k === mine && <span className="confetti">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</span>}
              {st === 'bad' && <i className="qz-mark">✕</i>}
            </button>
          )
        })}
      </div>

      <div className="qz-ex" data-st={!answered ? '' : right ? 'ok' : 'bad'}>
        {!answered
          ? <span className="qz-hint">คลิกคำตอบ หรือกดปุ่ม 1–4 · คำตอบทุกข้ออยู่ในหน้าก่อน ๆ · กด → ไปข้อถัดไป</span>
          : (
            <>
              <b>{right ? 'ถูกต้อง!' : `ยังไม่ใช่ · คำตอบคือ ${L[Q.ans]}`}</b>
              <span>{Q.why} <i className="qz-see">ดูได้ที่ {Q.see}</i></span>
            </>
          )}
      </div>
    </section>
  )
}
