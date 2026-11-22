import { STATES, v, nerf } from './geometry3d.js'
import { STATES2D } from './geometry2d.js'

/* ==========================================================================
   3-D positions laid out like the 2-D board drawing ("display frame":
   x right, y up, z toward the viewer, 1 px of the drawing = PX angstrom).

   - Covalently bonded frameworks keep their REAL 3-D shape (bond lengths,
     120 / 109.5 deg angles from geometry3d.js); each is turned with a rigid
     best fit (Horn's quaternion method) so it sits like the drawing.
       A: the ester            B: the whole tetrahedral intermediate
       C, D: the methyl ester (FAME)
   - Free molecules (CH3O- before it attacks, R'O- after it leaves, the
     methanol) can be anywhere in solution, so they are put exactly where
     the drawing has them, built with real bond lengths and angles.
   The result reads like the 2-D picture, and the real depth shows only
   where it matters (the sp3 carbon in B).
   ========================================================================== */

export const PX = 1 / 62
const MAP = { Cc: 'Cc', Oc: 'Oc', Oe: 'Oe', Om: 'Om', Cm: 'Cm', R1: 'R', Cg: 'Rp', Os: 'Os', Hs: 'Hs', Cs: 'Cs' }

export function qrot(q, p) {
  const [w, x, y, z] = q
  const u = [x, y, z]
  const t = v.mul(v.cross(u, p), 2)
  return v.add(v.add(p, v.mul(t, w)), v.cross(u, t))
}

/** Horn (1987): unit quaternion + translation minimising sum |R p + t - q|^2. */
function horn(P, Q) {
  const n = P.length
  const pc = v.mul(P.reduce((a, p) => v.add(a, p), [0, 0, 0]), 1 / n)
  const qc = v.mul(Q.reduce((a, q) => v.add(a, q), [0, 0, 0]), 1 / n)
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  P.forEach((p0, i) => {
    const p = v.sub(p0, pc)
    const q = v.sub(Q[i], qc)
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) S[a][b] += p[a] * q[b]
  })
  const [[xx, xy, xz], [yx, yy, yz], [zx, zy, zz]] = S
  const N = [
    [xx + yy + zz, yz - zy, zx - xz, xy - yx],
    [yz - zy, xx - yy - zz, xy + yx, zx + xz],
    [zx - xz, xy + yx, -xx + yy - zz, yz + zy],
    [xy - yx, zx + xz, yz + zy, -xx - yy + zz],
  ]
  const shift = N.flat().reduce((a, b) => a + Math.abs(b), 0) + 1
  let e = [1, 0.1, 0.1, 0.1]
  for (let it = 0; it < 500; it++) {
    const m = [0, 1, 2, 3].map((r) => N[r].reduce((a, c, j) => a + c * e[j], 0) + shift * e[r])
    const L = Math.hypot(...m)
    e = m.map((x) => x / L)
  }
  const t = v.sub(qc, qrot(e, pc))
  let err = 0
  P.forEach((p, i) => { err += v.len(v.sub(v.add(qrot(e, p), t), Q[i])) ** 2 })
  return { q: e, t, err }
}

const to3 = (p, z = 0) => [p[0] * PX, -p[1] * PX, z]
const dir2 = (a, b) => v.norm([b[0] - a[0], -(b[1] - a[1]), 0])
const mirrorX = (p) => [-p[0], p[1], p[2]]

/** Rigidly place the listed atoms of 3-D state k onto the 2-D layout of state k.
 *  Tries the mirror image too (= attack from the other face, chemically the same). */
function placeFramework(k, fitIds, moveIds) {
  const s = STATES[k]
  const Q = fitIds.map((id) => to3(STATES2D[k].pos[MAP[id]]))
  let best = null
  ;[false, true].forEach((mir) => {
    const P = fitIds.map((id) => (mir ? mirrorX(s.pos[id]) : s.pos[id]))
    const f = horn(P, Q)
    if (!best || f.err < best.err - 1e-6) best = { ...f, mir }
  })
  const out = {}
  moveIds.forEach((id) => {
    const p = best.mir ? mirrorX(s.pos[id]) : s.pos[id]
    out[id] = v.add(qrot(best.q, p), best.t)
  })
  return out
}

function methyl(out, prefix, center, from, ref) {
  ;[180, 60, -60].forEach((phi, i) => { out[`${prefix}${i + 1}`] = nerf(ref, from, center, 1.09, 109.5, phi) })
}

/** pick the in-plane NeRF placement closest to a 2-D target */
function inPlane(a, b, c, L, theta, target) {
  const p0 = nerf(a, b, c, L, theta, 0)
  const p1 = nerf(a, b, c, L, theta, 180)
  return v.len(v.sub(p0, target)) < v.len(v.sub(p1, target)) ? p0 : p1
}

function build() {
  const L2 = STATES2D
  const ESTER_MOL = ['Cc', 'Oc', 'Om', 'Cm', 'R1', 'Hm1', 'Hm2', 'Hm3']

  /* C and D first: the methanol positions are reused (hidden) in A and B. */
  const C = placeFramework(2, ['Cc', 'Oc', 'Om', 'Cm', 'R1'], ESTER_MOL)
  C.Oe = to3(L2[2].pos.Oe)
  C.Cg = v.add(C.Oe, v.mul(dir2(L2[2].pos.Oe, L2[2].pos.Rp), 1.44))
  C.Hs = v.add(C.Oe, v.mul(dir2(L2[2].pos.Oe, L2[2].pos.Hs), 1.78))      // O-H...O hydrogen bond
  C.Os = v.add(C.Hs, v.mul(dir2(L2[2].pos.Hs, L2[2].pos.Os), 0.97))
  C.Cs = inPlane(C.Oe, C.Hs, C.Os, 1.43, 108.5, to3(L2[2].pos.Cs))
  methyl(C, 'Hs', C.Cs, C.Os, C.Hs)

  const D = { ...C }
  D.Hs = v.add(C.Oe, v.mul(v.norm(v.sub(C.Hs, C.Oe)), 0.97))             // proton now on R'O
  D.Os = to3(L2[3].pos.Os)
  D.Cs = v.add(D.Os, v.mul(dir2(L2[3].pos.Os, L2[3].pos.Cs), 1.42))
  methyl(D, 'Hs', D.Cs, D.Os, D.Hs)

  const MEOH = ['Os', 'Hs', 'Cs', 'Hs1', 'Hs2', 'Hs3']

  /* B: the whole tetrahedral intermediate keeps its real sp3 shape. */
  const B = placeFramework(1, ['Cc', 'Oc', 'Oe', 'Om', 'Cm', 'R1', 'Cg'], ['Cc', 'Oc', 'Oe', 'Om', 'Cm', 'R1', 'Cg', 'Hm1', 'Hm2', 'Hm3'])
  MEOH.forEach((id) => { B[id] = C[id] })

  /* A: the flat ester as drawn; CH3O- waits up-left, a little in front of the plane. */
  const A = placeFramework(0, ['Cc', 'Oc', 'Oe', 'R1', 'Cg'], ['Cc', 'Oc', 'Oe', 'R1', 'Cg'])
  A.Om = to3(L2[0].pos.Om, 0.9)
  A.Cm = v.add(A.Om, v.mul(v.norm(v.add(dir2(L2[0].pos.Om, L2[0].pos.Cm), [0, 0, 0.2])), 1.42))
  methyl(A, 'Hm', A.Cm, A.Om, A.Cc)
  MEOH.forEach((id) => { A[id] = C[id] })

  return [A, B, C, D]
}

/** Display-frame positions of every atom, per state (A, B, C, D). */
export const DISPLAY = build()

/* ---------- morphing without stretching bonds ------------------------------
   Straight-line interpolation shortens any bond that swings round (the R
   ball, the methyl H's). Instead every atom swings about its parent: the
   parent->child vector is slerped in direction and lerped in length, walking
   a fixed tree from the carbonyl carbon outwards.                          */
const PARENT = {
  Oc: 'Cc', R1: 'Cc', Om: 'Cc', Oe: 'Cc',
  Cm: 'Om', Hm1: 'Cm', Hm2: 'Cm', Hm3: 'Cm',
  Cg: 'Oe', Hs: 'Oe', Os: 'Hs', Cs: 'Os', Hs1: 'Cs', Hs2: 'Cs', Hs3: 'Cs',
}
const ORDER = ['Oc', 'R1', 'Om', 'Oe', 'Cm', 'Hm1', 'Hm2', 'Hm3', 'Cg', 'Hs', 'Os', 'Cs', 'Hs1', 'Hs2', 'Hs3']

function slerpDir(a, b, t) {
  const d = Math.max(-1, Math.min(1, v.dot(a, b)))
  const th = Math.acos(d)
  if (th < 1e-4) return v.norm(v.lerp(a, b, t))
  if (Math.PI - th < 1e-3) {
    // antiparallel: rotate through any perpendicular
    let perp = v.cross(a, [0, 0, 1])
    if (v.len(perp) < 1e-3) perp = v.cross(a, [0, 1, 0])
    perp = v.norm(perp)
    return v.norm(v.add(v.mul(a, Math.cos(th * t)), v.mul(perp, Math.sin(th * t))))
  }
  const s = Math.sin(th)
  return v.add(v.mul(a, Math.sin((1 - t) * th) / s), v.mul(b, Math.sin(t * th) / s))
}

/** Display positions between state k and state next at progress t (0..1). */
export function morphDisplay(k, next, t) {
  const A = DISPLAY[k]
  const B = DISPLAY[next]
  if (k === next || t <= 0) return A
  if (t >= 1) return B
  const P = { Cc: v.lerp(A.Cc, B.Cc, t) }
  ORDER.forEach((id) => {
    const p = PARENT[id]
    const a = v.sub(A[id], A[p])
    const b = v.sub(B[id], B[p])
    const L = v.len(a) + (v.len(b) - v.len(a)) * t
    P[id] = v.add(P[p], v.mul(slerpDir(v.norm(a), v.norm(b), t), L))
  })
  return P
}
