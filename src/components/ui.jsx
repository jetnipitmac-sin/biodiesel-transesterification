import React from 'react'
import CREDITS from '../data/credits.json'

/* Small building blocks shared by every section of the dashboard. */

export function SectionHead({ n, kicker, title, sub }) {
  return (
    <header className="sh rev">
      {n && <span className="sh-n">{n}</span>}
      <div>
        {kicker && <div className="sh-k">{kicker}</div>}
        <h2 className="sh-t">{title}</h2>
        {sub && <p className="sh-s">{sub}</p>}
      </div>
    </header>
  )
}

/* "just remember this" box */
export function Tldr({ children, extra, className = '' }) {
  return (
    <div className={`tldr rev ${className}`}>
      <span className="tldr-k">จำแค่นี้ก็รอด</span>
      <div className="tldr-b">{children}</div>
      {extra && <div className="tldr-x">{extra}</div>}
    </div>
  )
}

const credit = (file) => CREDITS.find((c) => c.file === file)

/* photo with caption and a small licence credit (Wikimedia Commons) */
export function Photo({ file, caption, sub, className = '', pos = 'center', children }) {
  const c = credit(file)
  return (
    <figure className={`photo rev ${className}`}>
      <img src={`${import.meta.env.BASE_URL}images/${file}`} alt={caption || ''} style={{ objectPosition: pos }} decoding="async" />
      {(caption || sub) && (
        <figcaption>
          {caption && <b>{caption}</b>}
          {sub && <span>{sub}</span>}
        </figcaption>
      )}
      {c && <a className="photo-cr" href={c.source} target="_blank" rel="noreferrer">ภาพ: {c.author} · {c.license}</a>}
      {children}
    </figure>
  )
}

export function Stat({ v, children, tone }) {
  return (
    <div className="stat rev" data-tone={tone}>
      <b>{v}</b>
      <span>{children}</span>
    </div>
  )
}

export function Card({ title, children, className = '' }) {
  return (
    <section className={`card rev ${className}`}>
      {title && <h3 className="card-t">{title}</h3>}
      {children}
    </section>
  )
}

export function Note({ kind = 'info', head, children }) {
  return (
    <div className="note" data-kind={kind}>
      {head && <b>{head}</b>}
      <div>{children}</div>
    </div>
  )
}

export { CREDITS }
