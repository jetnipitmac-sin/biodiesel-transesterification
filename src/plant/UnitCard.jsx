import React from 'react'

/* The info card for one plant unit (used by the plant page and the plant slide). */
export default function UnitCard({ u, compact = false }) {
  return (
    <div className={`info${compact ? ' compact' : ''}`} key={u.id}>
      <div className="info-top">
        <span className="info-n">{u.n}</span>
        <div>
          <div className="info-tag">{u.tag} · {u.en}</div>
          <h3>{u.name}</h3>
        </div>
      </div>
      {u.rx && <div className={`rxtag big rx${u.rx}`}>{u.rx === 3 ? 'ที่นี่ล้างผลของปฏิกิริยาที่ 3 (สบู่) ออก' : `ปฏิกิริยาที่ ${u.rx} เกิดที่นี่`}</div>}
      <p className="info-role">{u.role}</p>
      <div className="info-rx"><span>เคมีที่เกี่ยวข้อง</span>{u.reaction}</div>
      <ul className="info-facts">{u.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
      {!compact && <div className="info-qa"><span>ถ้าอาจารย์ถาม</span><b>{u.qa.q}</b><p>{u.qa.a}</p></div>}

    </div>
  )
}
