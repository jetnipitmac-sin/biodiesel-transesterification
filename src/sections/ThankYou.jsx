import React from 'react'
import { CREDITS } from '../components/ui.jsx'
import Quiz from '../components/Quiz.jsx'
import { META } from '../meta.js'

export default function ThankYou({ step, setStep }) {
  return (
    <>
      <div className="ty">
        <div className="thanks rev">
          <img className="thanks-bg" src={`${import.meta.env.BASE_URL}images/palm-mill.jpg`} alt="" />
          <div className="thanks-in">
            <div className="sh-k light">{META.course}</div>
            <h1>Thank you</h1>
            <p>Questions &amp; Answers</p>
            {META.members.length > 0 && <div className="thanks-team">{META.members.join(' · ')}</div>}
          </div>
        </div>
        <Quiz q={step} setQ={setStep} />
      </div>
      <div className="refs rev">
        <div>
          <b>อ้างอิง</b>
          <span>เอกสารประกอบการสอน EGCH265 · CH10 Carboxylic Acids and Their Derivatives · CH13 Lipids</span>
          <span>T. W. G. Solomons, C. B. Fryhle, S. A. Snyder · Organic Chemistry (Wiley)</span>
          <span>อุปกรณ์ประกอบฉาก 3D: <a href="https://huggingface.co/datasets/nvidia/simready-assets" target="_blank" rel="noreferrer">NVIDIA SimReady Assets</a> (CC BY 4.0) · ไฟล์ GLB จาก <a href="https://huggingface.co/datasets/codepawl/simready-glb" target="_blank" rel="noreferrer">codepawl/simready-glb</a></span>
          <span>โมเดล 3D: Three.js · ภาพกลไก 2D/3D และโรงงานสร้างด้วยโค้ดโดยกลุ่มผู้นำเสนอ</span>
        </div>
        <div>
          <b>ภาพถ่าย (Wikimedia Commons)</b>
          {CREDITS.map((c) => <a key={c.file} href={c.source} target="_blank" rel="noreferrer">{c.title.replace(/\.(jpe?g)$/i, '')} · {c.author} · {c.license}</a>)}
        </div>
      </div>
    </>
  )
}
