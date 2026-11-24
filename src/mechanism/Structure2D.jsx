import React from 'react'
import { labelPad, arrowPath, boxFor } from './layout2d.js'

export { labelPad, arrowPath, boxFor }

/* ==========================================================================
   Pure 2-D renderer: draws one moment of the mechanism.
     k, next  state indices (equal = resting state)
     m        morph progress 0..1 between them
     arrow    0..1 how much of step k's curved arrows is drawn
     arrowAlpha, travel   fade of the arrows / position of the electron pairs
   Used live by <Mechanism2D> (timeline) and frozen by the overview strip.
   ========================================================================== */

/* every colour is a theme variable, so the drawing follows the theme switcher */
export const C2D = {
  ink: 'var(--ink2d)',
  hot: 'var(--hot2d)',
  nuc: 'var(--nuc)',
  push: 'var(--push)',
  charge: 'var(--charge)',          // negative charge marker
  chargePos: 'var(--charge-pos)',   // positive charge marker
  dot: 'var(--dot2d)',
}

const lerp = (a, b, t) => a + (b - a) * t
const lerp2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)]
const keyOf = (q) => [q.a, q.b].sort().join('|')

const bez = ({ p, c, q }, t) => [
  (1 - t) * (1 - t) * p[0] + 2 * (1 - t) * t * c[0] + t * t * q[0],
  (1 - t) * (1 - t) * p[1] + 2 * (1 - t) * t * c[1] + t * t * q[1],
]
const bezTan = ({ p, c, q }, t) => [
  2 * (1 - t) * (c[0] - p[0]) + 2 * t * (q[0] - c[0]),
  2 * (1 - t) * (c[1] - p[1]) + 2 * t * (q[1] - c[1]),
]

function Bond({ mech, A, B, idA, idB, sigma, pi, offSide, alpha }) {
  const padA = labelPad(mech, idA)
  const padB = labelPad(mech, idB)
  const dx = B[0] - A[0]
  const dy = B[1] - A[1]
  const L = Math.hypot(dx, dy) || 1
  const ux = dx / L
  const uy = dy / L
  const p = [A[0] + ux * padA, A[1] + uy * padA]
  const q = [B[0] - ux * padB, B[1] - uy * padB]
  const nx = -uy * offSide
  const ny = ux * offSide
  const changing = (s) => s > 0.02 && s < 0.98
  const line = (key, off, amount) => (
    <line key={key} x1={p[0] + nx * off} y1={p[1] + ny * off} x2={q[0] + nx * off} y2={q[1] + ny * off}
      style={{ stroke: changing(amount) ? C2D.hot : C2D.ink }} strokeWidth={changing(amount) ? 3.6 : 3}
      strokeLinecap="round" opacity={amount * alpha} strokeDasharray={changing(amount) && key === 's' ? '7 6' : undefined} />
  )
  return (
    <g>
      {sigma > 0.01 && line('s', pi > 0.01 ? -3.6 * pi : 0, sigma)}
      {pi > 0.01 && line('p', 3.6 * pi + 3.4, pi)}
    </g>
  )
}

export default function Structure2D({ mech, k, next = k, m = 0, arrow = 0, arrowAlpha = 1, travel = 0, viewBox, dots = true, halos = true, idPrefix = 'm' }) {
  const ATOMS2D = mech.atoms2d
  const s0 = mech.states2d[k]
  const s1 = mech.states2d[next]
  const resting = k === next

  const P = {}
  const vis = {}
  Object.keys(ATOMS2D).forEach((id) => {
    P[id] = lerp2(s0.pos[id], s1.pos[id], m)
    const v0 = (s0.hide || []).includes(id) ? 0 : 1
    const v1 = (s1.hide || []).includes(id) ? 0 : 1
    vis[id] = resting ? v0 : lerp(v0, v1, m)
  })

  const map = new Map()
  s0.bonds.forEach((q) => map.set(keyOf(q), { a: q.a, b: q.b, o0: q.o, o1: resting ? q.o : 0 }))
  if (!resting) {
    s1.bonds.forEach((q) => {
      const kk = keyOf(q)
      if (map.has(kk)) map.get(kk).o1 = q.o
      else map.set(kk, { a: q.a, b: q.b, o0: 0, o1: q.o })
    })
  }

  const arrows = k < mech.steps && arrow > 0 ? mech.arrows2d[k].map((ar) => ({ ...ar, geo: arrowPath(mech, s0, ar) })) : []
  const haloAtoms = halos && arrows.length && m < 0.02
    ? arrows.flatMap((ar) => [ar.from, ar.to].filter((x) => !Array.isArray(x)).map((id) => ({ id, color: C2D[ar.color] })))
    : []

  return (
    <svg className="s2d" viewBox={viewBox.join(' ')} preserveAspectRatio="xMidYMid meet">
      <defs>
        {['nuc', 'push'].map((c) => (
          <marker key={c} id={`${idPrefix}-head-${c}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.4" markerHeight="5.4" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: C2D[c] }} />
          </marker>
        ))}
      </defs>

      {haloAtoms.map((h, i) => (
        <circle key={i} cx={P[h.id][0]} cy={P[h.id][1]} r={labelPad(mech, h.id) + 11} style={{ fill: h.color }} opacity={0.16 * arrow} />
      ))}

      {[...map.values()].map((r) => {
        const sigma = lerp(r.o0 >= 1 ? 1 : 0, r.o1 >= 1 ? 1 : 0, m)
        const pi = lerp(r.o0 >= 2 ? 1 : 0, r.o1 >= 2 ? 1 : 0, m)
        if (sigma < 0.01 && pi < 0.01) return null
        return <Bond key={keyOf(r)} mech={mech} A={P[r.a]} B={P[r.b]} idA={r.a} idB={r.b} sigma={sigma} pi={pi}
          offSide={mech.piSide?.[keyOf(r)] ?? (r.a === 'Cc' && r.b === 'Oc' ? -1 : 1)} alpha={Math.min(vis[r.a], vis[r.b])} />
      })}

      {Object.entries(ATOMS2D).map(([id, a]) => {
        if (vis[id] < 0.01) return null
        const [x, y] = P[id]
        const c0 = s0.charges[id] ? 1 : 0
        const c1 = s1.charges[id] ? 1 : 0
        const ch = resting ? c0 : lerp(c0, c1, m)
        const w = a.t.length > 2 ? 50 : 30
        const below = (m < 0.5 ? s0 : s1).chargeSide?.[id] === 'below'
        const pos = (s0.charges[id] || s1.charges[id] || 0) > 0
        return (
          <g key={id} opacity={vis[id]}>
            <rect className="atom-bg" x={x - w / 2} y={y - 15} width={w} height={30} rx="9" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="atom-label" style={{ fill: a.role ? `var(--${a.role}2d)` : C2D.ink }}>{a.t}</text>
            {ch > 0.01 && (
              <g opacity={ch} transform={`translate(${x + w / 2 + 3} ${below ? y + 17 : y - 17})`}>
                <circle r="10" style={{ fill: pos ? C2D.chargePos : C2D.charge }} />
                <rect x="-5" y="-1.4" width="10" height="2.8" rx="1.2" fill="#fff" />
                {pos && <rect x="-1.4" y="-5" width="2.8" height="10" rx="1.2" fill="#fff" />}
              </g>
            )}
          </g>
        )
      })}

      {arrows.map((ar, i) => {
        const g = ar.geo
        const col = C2D[ar.color]
        const d = `M ${g.p[0]} ${g.p[1]} Q ${g.c[0]} ${g.c[1]} ${g.q[0]} ${g.q[1]}`
        const e = bez(g, travel)
        const tg = bezTan(g, travel)
        const tl = Math.hypot(tg[0], tg[1]) || 1
        const nx = -tg[1] / tl
        const ny = tg[0] / tl
        const dotAlpha = Math.min(arrow, 1 - Math.max(0, (travel - 0.8) / 0.2))
        return (
          <g key={i}>
            <path d={d} fill="none" style={{ stroke: col }} strokeWidth="3.4" strokeLinecap="round"
              pathLength="1" strokeDasharray="1" strokeDashoffset={1 - arrow}
              opacity={arrowAlpha} markerEnd={arrow > 0.97 ? `url(#${idPrefix}-head-${ar.color})` : undefined} />
            {dots && dotAlpha > 0.01 && (
              <g opacity={dotAlpha * arrowAlpha + (travel > 0 ? dotAlpha * (1 - arrowAlpha) : 0)}>
                <circle cx={e[0] + nx * 4.2} cy={e[1] + ny * 4.2} r="3.6" style={{ fill: C2D.dot }} />
                <circle cx={e[0] - nx * 4.2} cy={e[1] - ny * 4.2} r="3.6" style={{ fill: C2D.dot }} />
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
