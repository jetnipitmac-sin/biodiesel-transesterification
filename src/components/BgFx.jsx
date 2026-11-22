import React from 'react'

/* Neon theme background: a scrolling synthwave grid floor plus slow-floating
   chemistry doodles (benzene ring, fatty-acid zigzag, ester, droplet ...).
   Only transform/opacity animate, so it stays cheap next to the WebGL panes.
   Hidden in the other themes (CSS). */
const D = {
  hex: <><path d="M20 2 38 12.5v21L20 44 2 33.5v-21z" /><circle cx="20" cy="23" r="9" /></>,
  zig: <path d="M2 30 10 14 18 30 26 14 34 30 42 14 50 30" />,
  plus: <path d="M20 6v28M6 20h28" />,
  ring: <circle cx="20" cy="20" r="14" />,
  drop: <path d="M20 4C20 4 7 20 7 28a13 13 0 0 0 26 0C33 20 20 4 20 4z" />,
  star: <path d="M20 3l4 12 12 5-12 5-4 12-4-12-12-5 12-5z" />,
  ester: <><path d="M4 30 16 22 28 30" /><path d="M16 22V8M20 22V8" /><path d="M28 30h10" /></>,
  tri: <path d="M20 5 36 33H4z" />,
}
const ITEMS = [
  ['hex', '1.5%', '30%', 'c1', 56, 26],
  ['zig', '84%', '10%', 'c2', 76, 31],
  ['plus', '12%', '62%', 'c3', 34, 18],
  ['drop', '92%', '48%', 'c4', 46, 24],
  ['star', '50%', '3%', 'c4', 26, 15],
  ['ester', '72%', '74%', 'c1', 60, 29],
  ['ring', '28%', '86%', 'c2', 40, 21],
  ['tri', '58%', '40%', 'c3', 30, 34],
  ['hex', '96%', '86%', 'c3', 44, 27],
  ['star', '3%', '40%', 'c2', 24, 19],
]

export default function BgFx() {
  return (
    <div className="bg-fx" aria-hidden="true">
      <div className="bg-sun" />
      <div className="bg-floor"><i /></div>
      {ITEMS.map(([k, x, y, c, size, dur], i) => (
        <svg key={i} className={`bg-dd ${c}`} viewBox="0 0 52 46"
          style={{ left: x, top: y, width: size, '--dur': `${dur}s`, '--del': `${-i * 3.1}s` }}>{D[k]}</svg>
      ))}
    </div>
  )
}
