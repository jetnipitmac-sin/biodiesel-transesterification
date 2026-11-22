import { v, nerf } from './geometry3d.js'

/* ==========================================================================
   Build a 3-D mechanism from its 2-D board drawing.

   - every 2-D atom becomes a 3-D atom at (x, -y) * PX, so the 3-D view has
     exactly the layout of the drawing
   - bond lengths are relaxed to real values (C-C 1.52, C-O 1.43, C=O 1.22,
     O-H 0.97 A ...) while the atoms stay close to their drawn positions
   - a tetrahedral carbon drawn as a "+" cross gets real depth: its four
     substituents are pushed to z = +/- L/sqrt(3), which makes every bond
     angle 109.47 deg (a tetrahedron seen along an S4 axis looks like a "+")
   - "CH3" / "H3C" labels become a carbon with three real H atoms
   - morphing walks a spanning tree from the central carbon and slerps every
     parent->child vector, so bonds never stretch while groups swing round
   ========================================================================== */

export const PX = 1 / 62

const elOf = (t) => {
  if (t === 'R') return 'R'
  if (t.startsWith('R′')) return 'Rp'
  if (t.startsWith('O')) return 'O'
  if (t.startsWith('H') && !t.includes('C')) return 'H'
  if (t.startsWith('Na')) return 'Na'
  return 'C'
}
const isMethyl = (t) => /CH₃|H₃C/.test(t)

function ideal(e1, e2, order) {
  const k = [e1, e2].sort().join('-')
  if (k === 'H-O') return 0.97
  if (k === 'C-H') return 1.09
  if (k === 'C-O') return order >= 2 ? 1.22 : 1.40
  if (k === 'C-C') return 1.52
  if (k.includes('R')) return 1.55
  return 1.45
}

/**
 * spec: { atoms2d, states2d, tetra: [{ state, center, up, down, left, right }], root }
 * returns { atoms3d, display, states3d-bonds, morph }
 */
export function build3d(spec) {
  const { atoms2d, states2d, tetra = [], root = 'Cc' } = spec
  const atoms3d = {}
  const methyls = []
  Object.entries(atoms2d).forEach(([id, a]) => {
    const el = elOf(a.t)
    atoms3d[id] = { el: el === 'Na' ? 'Na' : el }
    if (el === 'R') atoms3d[id].label = 'R'
    if (el === 'Rp') atoms3d[id].label = 'R′'
    if (el === 'Na') atoms3d[id].label = 'Na⁺'
    if (isMethyl(a.t)) { methyls.push(id); [1, 2, 3].forEach((n) => { atoms3d[`${id}_h${n}`] = { el: 'H' } }) }
  })

  const display = states2d.map((st, k) => {
    const P = {}
    const anchor = {}
    Object.keys(atoms2d).forEach((id) => { const p = st.pos[id]; P[id] = [p[0] * PX, -p[1] * PX, 0]; anchor[id] = P[id].slice() })
    const zHint = {}
    tetra.filter((t) => t.state === k).forEach((t) => {
      // a tetrahedron seen along its S4 axis: two bonds tilt toward the viewer, two away
      const L = 1.43
      ;['left', 'right'].forEach((s) => { if (t[s]) zHint[t[s]] = L / Math.sqrt(3) })
      ;['up', 'down'].forEach((s) => { if (t[s]) zHint[t[s]] = -L / Math.sqrt(3) })
    })
    Object.entries(zHint).forEach(([id, z]) => { P[id][2] = z; anchor[id][2] = z })
    // carry the depth onto groups hanging off a tilted atom (e.g. the CH3 of O-CH3)
    st.bonds.forEach((b) => {
      ;[[b.a, b.b], [b.b, b.a]].forEach(([x, y]) => {
        if (zHint[x] !== undefined && zHint[y] === undefined && y !== root) { P[y][2] = zHint[x] * 1.3; anchor[y][2] = P[y][2] }
      })
    })
    const els = (id) => atoms3d[id].el
    // pairs that must keep apart: not bonded and not sharing a neighbour (1-3)
    const ids = Object.keys(P)
    const bondSet = new Set(st.bonds.map((q) => [q.a, q.b].sort().join('|')))
    const nbr = {}
    st.bonds.forEach((q) => { (nbr[q.a] ||= []).push(q.b); (nbr[q.b] ||= []).push(q.a) })
    const one3 = new Set()
    Object.values(nbr).forEach((l) => l.forEach((x) => l.forEach((y) => { if (x < y) one3.add(`${x}|${y}`) })))
    const pairs = []
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const key = [ids[i], ids[j]].sort().join('|')
      if (bondSet.has(key) || one3.has(key)) continue
      const e1 = els(ids[i]); const e2 = els(ids[j])
      const min = e1 === 'Na' || e2 === 'Na' ? 2.4 : e1 === 'H' && e2 === 'H' ? 1.6 : e1 === 'H' || e2 === 'H' ? 1.75 : 2.5
      pairs.push([ids[i], ids[j], min])
    }
    for (let it = 0; it < 160; it++) {
      pairs.forEach(([a, b, min]) => {
        const d = v.sub(P[b], P[a]); const L = v.len(d) || 1e-6
        if (L >= min) return
        const wa = els(a) === 'H' ? 0.8 : els(b) === 'H' ? 0.2 : 0.5
        const corr = v.mul(d, (L - min) / L)
        P[a] = v.add(P[a], v.mul(corr, wa))
        P[b] = v.sub(P[b], v.mul(corr, 1 - wa))
      })
      st.bonds.forEach((b) => {
        const A = P[b.a]; const B = P[b.b]
        const d = v.sub(B, A); const L = v.len(d) || 1e-6
        const L0 = ideal(els(b.a), els(b.b), b.o)
        const f = (L - L0) / L
        const wa = els(b.a) === 'H' ? 0.85 : els(b.b) === 'H' ? 0.15 : 0.5
        const corr = v.mul(d, f)
        P[b.a] = v.add(A, v.mul(corr, wa))
        P[b.b] = v.sub(B, v.mul(corr, 1 - wa))
      })
      // keep the drawing's layout (and the tetrahedral depth)
      Object.keys(P).forEach((id) => { P[id] = v.lerp(P[id], anchor[id], id === root ? 0.2 : 0.04) })
    }
    // make each drawn "+" an exact tetrahedron: in-plane 0.816 L along the drawn arm,
    // depth +/-0.577 L, then carry whatever hangs off that atom along with it
    tetra.filter((t) => t.state === k).forEach((t) => {
      const c = t.center || root
      ;[['left', 1], ['right', 1], ['up', -1], ['down', -1]].forEach(([side, sgn]) => {
        const id = t[side]
        if (!id) return
        const b = st.bonds.find((q) => (q.a === c && q.b === id) || (q.b === c && q.a === id))
        const L = ideal(els(c), els(id), b ? b.o : 1)
        const arm = v.norm([st.pos[id][0] - st.pos[c][0], -(st.pos[id][1] - st.pos[c][1]), 0])
        const target = v.add(P[c], v.add(v.mul(arm, L * Math.sqrt(2 / 3)), [0, 0, sgn * L / Math.sqrt(3)]))
        const shift = v.sub(target, P[id])
        P[id] = target
        st.bonds.forEach((q) => {
          const other = q.a === id ? q.b : q.b === id ? q.a : null
          if (other && other !== c) P[other] = v.add(P[other], shift)
        })
      })
    })
    // three H atoms on every CH3, staggered against the atom it is bonded to
    methyls.forEach((id) => {
      const b = st.bonds.find((q) => q.a === id || q.b === id)
      if (!b) return
      const nb = b.a === id ? b.b : b.a
      const ref = v.add(P[nb], [0.3, 0.9, 0.4])
      ;[180, 60, -60].forEach((phi, n) => { P[`${id}_h${n + 1}`] = nerf(ref, P[nb], P[id], 1.09, 109.5, phi) })
    })
    return P
  })

  const states3d = states2d.map((st) => ({
    bonds: [...st.bonds, ...methyls.flatMap((id) => [1, 2, 3].map((n) => ({ a: id, b: `${id}_h${n}`, o: 1 })))],
    charges: st.charges || {},
    hidden: (st.hide || []).flatMap((id) => (methyls.includes(id) ? [id, `${id}_h1`, `${id}_h2`, `${id}_h3`] : [id])),
    carbon: st.carbon,
    angleText: st.angleText,
  }))

  /* one spanning tree per step (k -> k+1), walking first along bonds that exist
     in BOTH states, so an H that hops between oxygens hangs off the right one */
  const keyOf = (q) => [q.a, q.b].sort().join('|')
  const trees = states3d.map((_, k) => {
    if (k === states3d.length - 1) return null
    const s0 = new Set(states3d[k].bonds.map(keyOf))
    const s1 = new Set(states3d[k + 1].bonds.map(keyOf))
    const edges = [...states3d[k].bonds, ...states3d[k + 1].bonds]
    const common = edges.filter((q) => s0.has(keyOf(q)) && s1.has(keyOf(q)))
    const parent = {}
    const order = []
    const seen = new Set([root])
    const grow = (list) => {
      let changed = true
      while (changed) {
        changed = false
        list.forEach((q) => {
          ;[[q.a, q.b], [q.b, q.a]].forEach(([x, y]) => {
            if (seen.has(x) && !seen.has(y)) { seen.add(y); parent[y] = x; order.push(y); changed = true }
          })
        })
      }
    }
    grow(common)
    grow(edges.filter((q) => s0.has(keyOf(q))))
    grow(edges)
    Object.keys(atoms3d).forEach((id) => { if (!seen.has(id)) { parent[id] = root; order.push(id) } })
    return { parent, order }
  })

  const slerpDir = (a, b, t) => {
    const d = Math.max(-1, Math.min(1, v.dot(a, b)))
    const th = Math.acos(d)
    if (th < 1e-4) return v.norm(v.lerp(a, b, t))
    if (Math.PI - th < 1e-3) {
      let perp = v.cross(a, [0, 0, 1]); if (v.len(perp) < 1e-3) perp = v.cross(a, [0, 1, 0])
      perp = v.norm(perp)
      return v.norm(v.add(v.mul(a, Math.cos(th * t)), v.mul(perp, Math.sin(th * t))))
    }
    const s = Math.sin(th)
    return v.add(v.mul(a, Math.sin((1 - t) * th) / s), v.mul(b, Math.sin(t * th) / s))
  }
  const morph = (k, next, t) => {
    const A = display[k]; const B = display[next]
    if (k === next || t <= 0) return A
    if (t >= 1) return B
    const { parent, order } = trees[Math.min(k, next)]
    const P = { [root]: v.lerp(A[root], B[root], t) }
    order.forEach((id) => {
      const p = parent[id]
      const a = v.sub(A[id], A[p]); const b = v.sub(B[id], B[p])
      const L = v.len(a) + (v.len(b) - v.len(a)) * t
      P[id] = v.add(P[p], v.mul(slerpDir(v.norm(a), v.norm(b), t), L))
    })
    return P
  }

  return { atoms3d, display, states3d, morph }
}
