// Sanity checks for src/mechanism/geometry3d.js
//   node tools/check_geometry.mjs
import { STATES, ATOMS, v, angle } from '../src/mechanism/geometry3d.js'

const ids = Object.keys(ATOMS)
let bad = 0
const f = (x) => x.toFixed(2)

function contacts(pos, bonds, label, hidden = []) {
  const bonded = new Set(bonds.map((q) => [q.a, q.b].sort().join('|')))
  // also skip 1-3 pairs (share a bonded neighbour)
  const nb = {}
  bonds.forEach((q) => { (nb[q.a] ||= []).push(q.b); (nb[q.b] ||= []).push(q.a) })
  const one3 = new Set()
  Object.values(nb).forEach((list) => list.forEach((x) => list.forEach((y) => { if (x < y) one3.add(`${x}|${y}`) })))
  const one4 = new Set()
  bonds.forEach((q) => {
    ;(nb[q.a] || []).forEach((x) => (nb[q.b] || []).forEach((y) => { if (x !== q.b && y !== q.a && x !== y) one4.add([x, y].sort().join('|')) }))
  })
  const out = []
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i]; const c = ids[j]
      const key = [a, c].sort().join('|')
      if (hidden.includes(a) || hidden.includes(c)) continue
      if (bonded.has(key) || one3.has(key)) continue
      const d = v.len(v.sub(pos[a], pos[c]))
      const heavy = ATOMS[a].el !== 'H' && ATOMS[c].el !== 'H'
      let lim = heavy ? (one4.has(key) ? 2.45 : 2.6) : (ATOMS[a].el === 'H' && ATOMS[c].el === 'H') ? 1.7 : 2.0
      if (key === 'Hs|Oe') lim = 1.6            // intended O-H...O hydrogen bond before the proton hops
      if (d < lim) out.push(`${a}-${c} ${f(d)}`)
    }
  }
  if (out.length) { console.log(`  ! close contacts in ${label}: ${out.join(', ')}`); bad += out.length }
}

STATES.forEach((s) => {
  const P = s.pos
  console.log(`State ${s.key}  (${s.carbon})`)
  const subs = s.bonds.filter((q) => q.a === 'Cc' || q.b === 'Cc').map((q) => (q.a === 'Cc' ? q.b : q.a))
  console.log('  Cc bonds: ' + subs.map((x) => `${x} ${f(v.len(v.sub(P[x], P.Cc)))}`).join('  '))
  const angs = []
  for (let i = 0; i < subs.length; i++) for (let j = i + 1; j < subs.length; j++) angs.push(`${subs[i]}-C-${subs[j]} ${angle(P[subs[i]], P.Cc, P[subs[j]]).toFixed(1)}`)
  console.log('  angles : ' + angs.join('  '))
  if (s.key === 'A') console.log(`  Burgi-Dunitz Om-Cc-Oc = ${angle(P.Om, P.Cc, P.Oc).toFixed(1)}  (target ~107)   Om..Cc ${f(v.len(P.Om))}`)
  if (s.key === 'C' || s.key === 'D') console.log(`  Oe..Cc ${f(v.len(v.sub(P.Oe, P.Cc)))}   Hs..Oe ${f(v.len(v.sub(P.Hs, P.Oe)))}   Hs..Os ${f(v.len(v.sub(P.Hs, P.Os)))}`)
  // every bond length sane
  s.bonds.forEach((q) => {
    const d = v.len(v.sub(P[q.a], P[q.b]))
    const isX = false
    if (!isX && (d < 0.9 || d > 1.6)) { console.log(`  ! bond ${q.a}-${q.b} = ${f(d)}`); bad++ }
  })
  contacts(P, s.bonds, `state ${s.key}`, s.hidden || [])
})

// morph midpoints: union of bonds of both ends counts as bonded
for (let k = 0; k + 1 < STATES.length; k++) {
  const s0 = STATES[k]; const s1 = STATES[k + 1]
  for (const t of [0.25, 0.5, 0.75]) {
    const P = {}
    ids.forEach((id) => { P[id] = v.lerp(s0.pos[id], s1.pos[id], t) })
    // an atom hidden at one end is faint until the second half of the morph
    const faint = [...(s0.hidden || []).filter(() => t < 0.6), ...(s1.hidden || []).filter(() => t > 0.4)]
    contacts(P, [...s0.bonds, ...s1.bonds], `morph ${s0.key}->${s1.key} @${t}`, faint)
  }
}
console.log(bad ? `\n${bad} issue(s)` : '\nall checks passed')
