// Checks for the display layout (3-D laid out like the 2-D drawing).
//   node tools/check_align.mjs
import { DISPLAY, PX, morphDisplay } from '../src/mechanism/align3d.js'
import { STATES, ATOMS, v, angle } from '../src/mechanism/geometry3d.js'
import { STATES2D } from '../src/mechanism/geometry2d.js'
const MAP = { Cc: 'Cc', Oc: 'Oc', Oe: 'Oe', Om: 'Om', Cm: 'Cm', R1: 'R', Cg: 'Rp', Os: 'Os', Hs: 'Hs', Cs: 'Cs' }
const ids = Object.keys(ATOMS)
let bad = 0
DISPLAY.forEach((D, k) => {
  const s = STATES[k]
  const hid = s.hidden || []
  const off = Object.entries(MAP).filter(([id]) => !hid.includes(id)).map(([id3, id2]) => {
    const p2 = STATES2D[k].pos[id2]
    return `${id3} ${Math.hypot(D[id3][0] / PX - p2[0], -D[id3][1] / PX - p2[1]).toFixed(0)}px/z${D[id3][2].toFixed(1)}`
  })
  console.log(`state ${'ABCD'[k]}: ${off.join('  ')}`)
  s.bonds.forEach((b) => {
    if (hid.includes(b.a) || hid.includes(b.b)) return
    const L = v.len(v.sub(D[b.a], D[b.b]))
    if (L < 0.9 || L > 1.6) { console.log(`  ! bond ${b.a}-${b.b} ${L.toFixed(2)}`); bad++ }
  })
  const subs = s.bonds.filter((q) => q.a === 'Cc' || q.b === 'Cc').map((q) => (q.a === 'Cc' ? q.b : q.a))
  const angs = []
  for (let i = 0; i < subs.length; i++) for (let j = i + 1; j < subs.length; j++) angs.push(angle(D[subs[i]], D.Cc, D[subs[j]]).toFixed(1))
  console.log(`  angles at C: ${angs.join(' ')}`)
})
// morph: bond lengths and contacts at midpoints (display space, hierarchical slerp)
for (let k = 0; k < 3; k++) {
  const s0 = STATES[k], s1 = STATES[k + 1]
  for (const t of [0.25, 0.5, 0.75]) {
    const P = morphDisplay(k, k + 1, t)
    const both = s0.bonds.filter((b) => s1.bonds.some((c) => [c.a, c.b].sort().join() === [b.a, b.b].sort().join()))
    both.forEach((b) => {
      const L0 = v.len(v.sub(DISPLAY[k][b.a], DISPLAY[k][b.b]))
      const L = v.len(v.sub(P[b.a], P[b.b]))
      const faint = (s0.hidden || []).includes(b.a) && t < 0.6
      if (!faint && Math.abs(L / L0 - 1) > 0.12) { console.log(`  ! morph ${'ABCD'[k]}->${'ABCD'[k + 1]} @${t} bond ${b.a}-${b.b} ${L0.toFixed(2)}->${L.toFixed(2)}`); bad++ }
    })
    const hidden = [...(s0.hidden || []).filter(() => t < 0.6), ...(s1.hidden || []).filter(() => t > 0.4)]
    const bonded = new Set([...s0.bonds, ...s1.bonds].map((b) => [b.a, b.b].sort().join('|')))
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i], c = ids[j]
      if (hidden.includes(a) || hidden.includes(c) || bonded.has([a, c].sort().join('|'))) continue
      const d = v.len(v.sub(P[a], P[c]))
      const heavy = ATOMS[a].el !== 'H' && ATOMS[c].el !== 'H'
      if (d < (heavy ? 1.9 : 1.2)) { console.log(`  ! morph ${'ABCD'[k]}->${'ABCD'[k + 1]} @${t} close ${a}-${c} ${d.toFixed(2)}`); bad++ }
    }
  }
}
console.log(bad ? `${bad} issue(s)` : 'display layout OK')
