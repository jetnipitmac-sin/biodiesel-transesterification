// Checks for every mechanism definition: bond lengths, sp3 angles, morph stretch, arrow refs.
//   node tools/check_mechs.mjs
import { MECHS } from '../src/mechanism/mechs.js'
import { v, angle } from '../src/mechanism/geometry3d.js'
let bad = 0
for (const [name, M] of Object.entries(MECHS)) {
  const issues = []
  if (M.states2d.length !== M.steps + 1 || M.arrows2d.length !== M.steps) issues.push('state/arrow count')
  if (M.captions.length !== 2 * M.steps + 1) issues.push(`captions ${M.captions.length} != ${2 * M.steps + 1}`)
  M.arrows2d.forEach((list, k) => list.forEach((ar) => [ar.from, ar.to].flat().forEach((id) => { if (!M.states2d[k].pos[id] || !M.display[k][id]) issues.push(`arrow ref ${id} @${k}`) })))
  M.display.forEach((D, k) => {
    const st = M.states3d[k]
    st.bonds.forEach((b) => {
      if ((st.hidden || []).includes(b.a)) return
      const L = v.len(v.sub(D[b.a], D[b.b]))
      if (L < 0.85 || L > 1.75) issues.push(`state ${k} bond ${b.a}-${b.b} ${L.toFixed(2)}`)
    })
    if (st.carbon === 'sp³') {
      const subs = st.bonds.filter((b) => b.a === 'Cc' || b.b === 'Cc').map((b) => (b.a === 'Cc' ? b.b : b.a))
      const angs = []
      for (let i = 0; i < subs.length; i++) for (let j = i + 1; j < subs.length; j++) angs.push(angle(D[subs[i]], D.Cc, D[subs[j]]))
      const worst = Math.max(...angs.map((a) => Math.abs(a - 109.47)))
      if (worst > 6) issues.push(`state ${k} sp3 angles off by ${worst.toFixed(1)} (${angs.map((a) => a.toFixed(0)).join(',')})`)
      else console.log(`  ${name} state ${k} sp3 angles ${angs.map((a) => a.toFixed(1)).join(', ')}`)
    }
  })
  for (let k = 0; k < M.steps; k++) {
    const both = M.states3d[k].bonds.filter((b) => M.states3d[k + 1].bonds.some((c) => [c.a, c.b].sort().join() === [b.a, b.b].sort().join()))
    for (const t of [0.25, 0.5, 0.75]) {
      const P = M.morph(k, k + 1, t)
      both.forEach((b) => {
        const L0 = v.len(v.sub(M.display[k][b.a], M.display[k][b.b]))
        const L = v.len(v.sub(P[b.a], P[b.b]))
        if (Math.abs(L / L0 - 1) > 0.15 && !(M.states3d[k].hidden || []).includes(b.a)) issues.push(`morph ${k}->${k + 1} @${t} ${b.a}-${b.b} ${L0.toFixed(2)}->${L.toFixed(2)}`)
      })
    }
  }
  // formal charges: every drawn charge must match the bonds (O: 1 bond = -1, 2 = 0, 3 = +1;
  // a free H = H+, a bonded H = 0; C = 4 bonds; CH3 / R groups = 1 bond)
  M.states2d.forEach((st, k) => {
    const hidden = new Set(st.hide || [])
    const sum = {}
    st.bonds.forEach((b) => { sum[b.a] = (sum[b.a] || 0) + (b.o || 1); sum[b.b] = (sum[b.b] || 0) + (b.o || 1) })
    Object.entries(M.atoms2d).forEach(([id, at]) => {
      if (hidden.has(id) || !st.pos[id]) return
      const t = at.t
      const n = sum[id] || 0
      let fc = 0
      if (t === 'O') fc = n - 2
      else if (t === 'H') fc = n === 0 ? 1 : n - 1
      else if (t === 'C') fc = n === 4 ? 0 : NaN
      else if (/CH₃|H₃C|^R/.test(t)) fc = n === 1 ? 0 : NaN
      else if (t.startsWith('Na')) fc = 0          // the label itself says Na+
      const drawn = st.charges?.[id] || 0
      if (fc !== drawn) issues.push(`state ${k} ${id} (${t}, ${n} bonds) formal ${fc} but drawn ${drawn}`)
      else if (drawn) console.log(`  ${name} state ${k} ${id} (${t}) charge ${drawn > 0 ? '+' : '−'} ✓`)
    })
  })
  console.log(`${name}: ${issues.length ? issues.slice(0, 8).join(' | ') : 'OK'}`)
  bad += issues.length
}
console.log(bad ? `${bad} issue(s)` : 'all mechanisms OK')
