import React from 'react'
import { SectionHead } from '../components/ui.jsx'
import { ROADMAP } from '../data/story.js'

const img = (f) => `${import.meta.env.BASE_URL}images/${f}`

/* a thin version for the top of each reaction page: "you are here" */
export function MiniRoadmap({ here, go }) {
  return (
    <div className="mini-rm rev">
      {ROADMAP.map((s, k) => (
        <React.Fragment key={s.id}>
          <button className="mrm" data-on={s.id === here ? 1 : 0} data-rx={s.rx || (s.rx3 ? 3 : 0)} onClick={() => go(s.page || 1)}>
            {s.rx ? <b className={`rx${s.rx}`}>{s.rx}</b> : <i>{k + 1}</i>}
            <span>{s.rx ? s.t : s.t}</span>
          </button>
          {k < ROADMAP.length - 1 && <em />}
        </React.Fragment>
      ))}
      <span className="mrm-here">คุณอยู่ตรงนี้</span>
    </div>
  )
}

function Station({ s, k, go }) {
  return (
    <button className={`st rev${s.rx ? ` rx${s.rx}` : ''}`} data-rx={s.rx || 0} data-click={s.page ? 1 : 0} onClick={() => s.page && go(s.page)}>
      <span className="st-n">{k + 1}</span>
      {s.img && <span className="st-img"><img src={img(s.img)} alt="" /></span>}
      {s.rx && <span className="st-rx">ปฏิกิริยาที่ {s.rx}</span>}
      <b className="st-t">{s.t}</b>
      <span className="st-where">ที่ไหน · {s.where}</span>
      <span className="st-out"><i>ได้</i>{s.out}</span>
      {s.rx3 && <span className="st-warn">เกี่ยวกับปฏิกิริยาที่ 3 →</span>}
      {s.page && s.rx && <span className="st-go">ดูปฏิกิริยานี้ →</span>}
    </button>
  )
}

export default function Roadmap({ go }) {
  return (
    <>
      <SectionHead n="01" kicker="Roadmap · Palm fruit → B7"
        title={<>เส้นทางของ<em>น้ำมันปาล์ม</em> จนเป็นไบโอดีเซล</>}
        sub="8 สถานีในโรงงาน · กล่องสีคือจุดที่มีปฏิกิริยาเคมี กดเพื่อเปิดหน้าของปฏิกิริยานั้น" />
      <div className="rm">
        {ROADMAP.slice(0, 4).map((s, k) => (
          <React.Fragment key={s.id}><Station s={s} k={k} go={go} />{k < 3 && <i className="rm-a" />}</React.Fragment>
        ))}
      </div>
      <div className="rm-turn rev"><span>ต่อแถวล่าง</span></div>
      <div className="rm">
        {ROADMAP.slice(4).map((s, k) => (
          <React.Fragment key={s.id}><Station s={s} k={k + 4} go={go} />{k < 3 && <i className="rm-a" />}</React.Fragment>
        ))}
      </div>
      <div className="rm-notes">
        <button className="rm-note rx3 rev" onClick={() => go(4)}>
          <b>ปฏิกิริยาที่ 3 · Saponification (ตัวร้าย)</b>
          <span>แอบเกิดในสถานี 3 ถ้าน้ำมันมีน้ำหรือ FFA → ได้สบู่แทนไบโอดีเซล · โรงงานกันด้วยสถานี 2 และล้างสบู่ออกที่สถานี 6</span>
        </button>
        <div className="rm-note rev"><b>ผลพลอยได้: glycerol</b><span>ออกจากสถานี 4 (ชั้นล่าง) ไปทำสบู่ เครื่องสำอาง ยา</span></div>
        <div className="rm-note rev"><b>วนกลับ: เมทานอล</b><span>สถานี 5 กลั่นเมทานอลที่ใส่เกินไว้ แล้วส่งกลับไปสถานี 3</span></div>
      </div>
    </>
  )
}
