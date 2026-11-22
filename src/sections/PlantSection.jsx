import React, { useEffect, useState } from 'react'
import { SectionHead, Photo } from '../components/ui.jsx'
import Plant3D from '../plant/Plant3D.jsx'
import UnitCard from '../plant/UnitCard.jsx'
import { UNITS, FLUIDS } from '../plant/units.js'

/* unit-label modes: full name / number only (name pops up on hover or when selected) / hidden.
   Kept for the session, so coming back to this page keeps the choice. */
const NAME_MODES = [['full', 'ชื่อเต็ม'], ['num', 'แค่เลข'], ['hide', 'ซ่อน']]
let savedNames = 'full'

/* The 3-D plant. step 0 = overview, step k = unit k (the clicker walks the tour). */
export default function PlantSection({ step, setStep }) {
  const u = step > 0 ? UNITS[step - 1] : null
  const [names, setNamesState] = useState(savedNames)
  const setNames = (m) => { savedNames = m; setNamesState(m) }
  // L = next label mode
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target && /input|textarea|select/i.test(e.target.tagName))) return
      if (e.key === 'l' || e.key === 'L') {
        const k = NAME_MODES.findIndex(([m]) => m === savedNames)
        setNames(NAME_MODES[(k + 1) % NAME_MODES.length][0])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <>
      <SectionHead n="05" kicker="Industry · 3D plant"
        title={<>โรงงาน<em>ไบโอดีเซล</em> 10 หน่วย</>}
        sub="กด → เดินทัวร์ทีละหน่วย หรือคลิกอุปกรณ์ในภาพ · ท่อสีบอกชนิดสาร ลูกศรในท่อบอกทิศการไหล" />
      <div className="plant-grid rev">
        <section className="pane pl-3d" data-names={names}>
          <Plant3D selected={u ? u.id : null} onSelect={(id) => setStep(UNITS.findIndex((x) => x.id === id) + 1)} flows labels={names !== 'hide'} />
          <div className="pl-names" role="group" aria-label="ป้ายชื่อหน่วย" title="ป้ายชื่อหน่วย (กด L เพื่อสลับ)">
            <span>ป้าย</span>
            {NAME_MODES.map(([m, th]) => <button key={m} data-on={names === m ? 1 : 0} onClick={() => setNames(m)}>{th}</button>)}
          </div>
          <a className="nv-badge" href="https://huggingface.co/datasets/nvidia/simready-assets" target="_blank" rel="noreferrer"
            title="อุปกรณ์ประกอบฉาก 3D 11 ชิ้น (IBC tank, ถังสารเคมี, รถยก, ที่ล้างตาฉุกเฉิน, ป้ายความปลอดภัย) จาก NVIDIA SimReady · CC BY 4.0">
            <span className="nv-cube"><svg viewBox="0 0 24 24"><path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9z" /><path d="M3 7.5l9 5 9-5M12 12.5v9" /></svg></span>
            <span className="nv-txt"><small>3D props by</small><b>NVIDIA <em>SimReady</em></b></span>
            <span className="nv-lic">CC BY 4.0</span>
          </a>
          <div className="pl-legend">
            {Object.entries(FLUIDS).map(([k, f]) => <span key={k}><i style={{ background: f.color }} />{f.th}</span>)}
          </div>
        </section>
        <aside className="plant-side">
          {u ? <UnitCard u={u} /> : (
            <div className="info intro">
              <div className="info-tag">ภาพรวมกระบวนการ</div>
              <h3>โรงงานเดียว ใช้ 3 ปฏิกิริยาจาก CH10</h3>
              <div className="intro-rx">
                <button className="rx1" onClick={() => setStep(3)}><b>1 · Fischer esterification</b><span>ตัวช่วย · หน่วย 3</span></button>
                <button className="rx2" onClick={() => setStep(4)}><b>2 · Transesterification</b><span>ตัวหลัก · หน่วย 4</span></button>
                <button className="rx3" onClick={() => setStep(7)}><b>3 · Saponification</b><span>ตัวร้าย · ล้างออกที่หน่วย 7</span></button>
              </div>
              <div className="real-photos">
                <Photo file="biodiesel-plant.jpg" caption="โรงงานไบโอดีเซลจริง" sub="ท่าเรือ Castellón, สเปน" />
                <Photo file="palm-mill.jpg" caption="โรงสกัดน้ำมันปาล์ม" sub="ต้นทางของวัตถุดิบ กลางสวนปาล์ม" />
              </div>
            </div>
          )}
        </aside>
      </div>
      <div className="tour rev">
        <button className="tour-step" data-on={step === 0 ? 1 : 0} onClick={() => setStep(0)}><b>◎</b><span>ภาพรวม</span></button>
        {UNITS.map((x, k) => (
          <React.Fragment key={x.id}>
            <i className="tour-arrow" />
            <button className="tour-step" data-on={step === k + 1 ? 1 : 0} data-done={step > k + 1 ? 1 : 0} onClick={() => setStep(k + 1)}>
              <b>{x.n}</b><span>{x.short}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </>
  )
}
