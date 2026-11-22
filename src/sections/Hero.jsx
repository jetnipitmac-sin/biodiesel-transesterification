import React from 'react'
import { Photo } from '../components/ui.jsx'
import { META } from '../meta.js'
import { REACTIONS } from '../data/story.js'
import { Equation } from '../components/chem.jsx'
import Mascot from '../components/Mascot.jsx'

export default function Hero({ go }) {
  return (
    <div className="hero">
      <div className="hero-txt">
        <div className="sh-k rev">{META.course}</div>
        <h1 className="hero-h rev">จากผลปาล์ม<br />สู่<em>ไบโอดีเซล</em></h1>
        <p className="hero-en rev">{META.title}</p>
        <p className="lede rev">โรงงานเดียว มีปฏิกิริยาเคมี 3 ตัวที่ต้องรู้ เล่าตามลำดับที่เกิดในโรงงาน</p>
        <div className="rx-cards">
          {[1, 2, 3].map((n) => {
            const R = REACTIONS[n]
            return (
              <button key={n} className={`rx-card rev rx${n}`} onClick={() => go(n + 1)}>
                <span className="rx-card-n">{n}</span>
                <span className="rx-card-b">
                  <i>{R.role}</i>
                  <b>{R.name}</b>
                  <span className="rx-card-eq"><Equation kind={R.eq} /></span>
                </span>
                <span className="rx-card-go">→</span>
              </button>
            )
          })}
        </div>
        <button className="hero-rm rev" onClick={() => go(1)}>ดูเส้นทางทั้งกระบวนการ (Roadmap) →</button>
      </div>
      <div className="hero-art">
        <Photo file="hero-palm-fruit.jpg" className="hero-photo" caption="ทะลายปาล์มน้ำมัน (Elaeis guineensis)" sub="ผลสีส้มแดงนี้คือแหล่งของ triglyceride" />
        <div className="hero-float rev">
          <img src={`${import.meta.env.BASE_URL}images/biodiesel-flask.jpg`} alt="" />
          <div><b>ปลายทาง</b><span>ไบโอดีเซล B100 → ผสมเป็นดีเซล B7 ที่ปั๊ม</span></div>
        </div>
        <div className="hero-mascot">
          <span className="bubble">ผมคือหยดน้ำมันปาล์ม! มาดูกันว่าผมจะกลายเป็นไบโอดีเซลได้ยังไง</span>
          <Mascot mood="happy" />
        </div>
      </div>
    </div>
  )
}
