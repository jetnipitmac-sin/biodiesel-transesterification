/* ==========================================================================
   3-D keyframes for base-catalysed transesterification (one ester linkage).

   Nothing here is hand-placed: every atom comes from bond lengths, bond
   angles and dihedrals (NeRF placement), so the carbonyl carbon really goes
   sp2 (trigonal, 120 deg) -> sp3 (tetrahedral, 109.5 deg) -> sp2.

   States
     A  ester + CH3O-              (methoxide approaches at the Burgi-Dunitz angle)
     B  tetrahedral intermediate   (C is sp3, carbonyl O carries the - charge)
     C  methyl ester (FAME) + R'O- (C-OR' bond broken, leaving group drifts away)
     D  R'OH + CH3O-               (proton transfer from methanol regenerates CH3O-)

   Run `npm run check:geometry` after editing: it prints bond lengths, the
   angles round the carbonyl carbon and the closest non-bonded contacts in
   every state and at every morph midpoint.
   ========================================================================== */

const DEG = Math.PI / 180

/* ---------- tiny vector kit ---------------------------------------------- */
export const v = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const L = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / L, a[1] / L, a[2] / L] },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
}

/** Place d bonded to c: |cd| = L, angle b-c-d = theta, dihedral a-b-c-d = phi (degrees). */
export function nerf(a, b, c, L, thetaDeg, phiDeg) {
  const th = thetaDeg * DEG
  const ph = phiDeg * DEG
  const bc = v.norm(v.sub(c, b))
  const n = v.norm(v.cross(v.sub(b, a), bc))
  const m = v.cross(n, bc)
  const d2 = [-L * Math.cos(th), L * Math.sin(th) * Math.cos(ph), L * Math.sin(th) * Math.sin(ph)]
  return v.add(c, v.add(v.mul(bc, d2[0]), v.add(v.mul(m, d2[1]), v.mul(n, d2[2]))))
}

export function dihedral(a, b, c, d) {
  const b0 = v.sub(a, b)
  const b1 = v.norm(v.sub(c, b))
  const b2 = v.sub(d, c)
  const p = v.sub(b0, v.mul(b1, v.dot(b0, b1)))
  const q = v.sub(b2, v.mul(b1, v.dot(b2, b1)))
  const x = v.dot(p, q)
  const y = v.dot(v.cross(b1, p), q)
  return Math.atan2(y, x) / DEG
}

export function angle(a, b, c) {
  const u = v.norm(v.sub(a, b))
  const w = v.norm(v.sub(c, b))
  return Math.acos(Math.max(-1, Math.min(1, v.dot(u, w)))) / DEG
}

/* ---------- atom table ----------------------------------------------------
   Same pieces as the 2-D drawing so the two views read the same way:
   R  = fatty-acid chain, shown as ONE green ball (el 'R')
   R' = rest of the glyceride, ONE gold ball on the ester oxygen (el 'Rp')  */
export const ATOMS = {
  Cc: { el: 'C' },                          // carbonyl carbon (electrophile)
  Oc: { el: 'O' },                          // carbonyl oxygen
  Oe: { el: 'O' },                          // ester oxygen -> leaving group R'O-
  Om: { el: 'O' },                          // methoxide oxygen (nucleophile)
  Cm: { el: 'C' }, Hm1: { el: 'H' }, Hm2: { el: 'H' }, Hm3: { el: 'H' },
  R1: { el: 'R', label: 'R' },
  Cg: { el: 'Rp', label: 'R′' },
  Os: { el: 'O' }, Hs: { el: 'H' },        // methanol that gives up its proton
  Cs: { el: 'C' }, Hs1: { el: 'H' }, Hs2: { el: 'H' }, Hs3: { el: 'H' },
}

/* ---------- building blocks ---------------------------------------------- */
function tetDir(azDeg) {
  // tetrahedral partner of a bond along +z: 109.47 deg from +z
  const T = 109.4712 * DEG
  const az = azDeg * DEG
  return [Math.sin(T) * Math.cos(az), Math.sin(T) * Math.sin(az), Math.cos(T)]
}
const planeDir = (azDeg) => [Math.cos(azDeg * DEG), Math.sin(azDeg * DEG), 0]

/** Project three bond directions onto the plane normal to n and spread them to 120 deg,
 *  keeping their cyclic order and the least overall rotation. */
function planarize(dirs, n) {
  const proj = dirs.map((d) => v.norm(v.sub(d, v.mul(n, v.dot(d, n)))))
  const e1 = proj[0]
  const e2 = v.cross(n, e1)
  const th = proj.map((p) => (Math.atan2(v.dot(p, e2), v.dot(p, e1)) + 2 * Math.PI) % (2 * Math.PI))
  const order = [0, 1, 2].sort((i, j) => th[i] - th[j])          // index 0 has th = 0 -> first
  let sx = 0
  let sy = 0
  order.forEach((idx, k) => {
    const a = th[idx] - (k * 2 * Math.PI) / 3
    sx += Math.cos(a); sy += Math.sin(a)
  })
  const phi0 = Math.atan2(sy, sx)
  const out = []
  order.forEach((idx, k) => {
    const a = phi0 + (k * 2 * Math.PI) / 3
    out[idx] = v.add(v.mul(e1, Math.cos(a)), v.mul(e2, Math.sin(a)))
  })
  return out
}

function addMethyl(P, center, from, ref, prefix) {
  ;[180, 60, -60].forEach((phi, i) => {
    P[`${prefix}${i + 1}`] = nerf(ref, from, center, 1.09, 109.5, phi)
  })
}

/** R'O group: the ester oxygen carries the R' ball (Z ester: syn to C=O when phi = 0). */
function addGlyceride(P, cgTheta, cgPhi) {
  P.Cg = nerf(P.Oc, P.Cc, P.Oe, 1.44, cgTheta, cgPhi)
}

const GLY = ['Oe', 'Cg']
const METHANOL_U = [0.372, -0.501, 0.781]
const MEOH = ['Os', 'Hs', 'Cs', 'Hs1', 'Hs2', 'Hs3']

/* ---------- the four states ---------------------------------------------- */
function build() {
  /* B first: it defines the frame (Om along +z). */
  const B = { Cc: [0, 0, 0] }
  B.Om = [0, 0, 1.43]
  B.Oc = v.mul(tetDir(90), 1.37)
  B.R1 = v.mul(tetDir(210), 1.53)
  B.Oe = v.mul(tetDir(330), 1.45)
  // staggered: put both O-alkyl groups in the gap between Oc and R1
  const midOcR1 = (axisAtom) => dihedral(B.Oc, B.Cc, B[axisAtom], B.R1) / 2
  B.Cm = nerf(B.Oc, B.Cc, B.Om, 1.43, 113, midOcR1('Om'))
  addMethyl(B, B.Cm, B.Om, B.Cc, 'Hm')
  addGlyceride(B, 113, midOcR1('Oe'))

  /* A: planar ester in z = 0, methoxide 3.0 A away at the Burgi-Dunitz angle (107 deg to C=O). */
  const A = { Cc: [0, 0, 0] }
  A.Oc = v.mul(planeDir(90), 1.21)
  A.R1 = v.mul(planeDir(210), 1.51)
  A.Oe = v.mul(planeDir(330), 1.34)
  const bd = 107 * DEG
  A.Om = v.mul([0, Math.cos(bd), Math.sin(bd)], 3.0)
  A.Cm = nerf(A.Oc, A.Cc, A.Om, 1.42, 150, 30)
  addMethyl(A, A.Cm, A.Om, A.Cc, 'Hm')
  addGlyceride(A, 116, 0)                    // Z (s-cis) ester: O-CH2 syn to C=O

  /* C: Oe leaves along its own bond axis; Oc, R1, Om flatten into the plane normal to it. */
  const n = v.norm(B.Oe)
  const [dOc, dR1, dOm] = planarize([v.norm(B.Oc), v.norm(B.R1), v.norm(B.Om)], n)
  const C = { Cc: [0, 0, 0] }
  C.Oc = v.mul(dOc, 1.21)
  C.R1 = v.mul(dR1, 1.51)
  C.Om = v.mul(dOm, 1.34)
  C.Cm = nerf(C.Oc, C.Cc, C.Om, 1.44, 116, 0)   // methyl ester is Z too
  addMethyl(C, C.Cm, C.Om, C.Cc, 'Hm')
  const shift = v.sub(v.mul(n, 3.05), B.Oe)
  GLY.forEach((id) => { C[id] = v.add(B[id], shift) })

  /* Methanol: in C it H-bonds to the leaving R'O- (O-H...O 1.78 A) along METHANOL_U.
     In A and B it is hidden (as in the 2-D drawing) and fades in at the same spot. */
  const u = v.norm(METHANOL_U)
  const M = {}
  M.Os = v.add(C.Oe, v.mul(u, 2.75))
  M.Hs = v.sub(M.Os, v.mul(u, 0.97))
  M.Cs = nerf(C.Cg, M.Hs, M.Os, 1.43, 108.5, 180)
  addMethyl(M, M.Cs, M.Os, M.Hs, 'Hs')
  MEOH.forEach((id) => { C[id] = M[id]; A[id] = M[id]; B[id] = M[id] })

  /* D: proton on R'O, methoxide regenerated and backing off a little. */
  const D = { ...C }
  D.Hs = v.add(C.Oe, v.mul(u, 0.97))
  const back = v.mul(u, 0.55)
  ;['Os', 'Cs', 'Hs1', 'Hs2', 'Hs3'].forEach((id) => { D[id] = v.add(C[id], back) })

  return { A, B, C, D }
}

/* ---------- bonds and charges per state ----------------------------------- */
const COMMON = [
  ['Cc', 'R1'],
  ['Om', 'Cm'], ['Cm', 'Hm1'], ['Cm', 'Hm2'], ['Cm', 'Hm3'],
  ['Oe', 'Cg'],
  ['Os', 'Cs'], ['Cs', 'Hs1'], ['Cs', 'Hs2'], ['Cs', 'Hs3'],
]
const b = (list) => list.map(([a, c, o = 1]) => ({ a, b: c, o }))

const P = build()
export const STATES = [
  {
    key: 'A', pos: P.A, charges: { Om: -1 }, hidden: MEOH,
    bonds: b([...COMMON, ['Cc', 'Oc', 2], ['Cc', 'Oe'], ['Os', 'Hs']]),
    carbon: 'sp²', angleText: '120°',
  },
  {
    key: 'B', pos: P.B, charges: { Oc: -1 }, hidden: MEOH,
    bonds: b([...COMMON, ['Cc', 'Oc'], ['Cc', 'Oe'], ['Cc', 'Om'], ['Os', 'Hs']]),
    carbon: 'sp³', angleText: '109.5°',
  },
  {
    key: 'C', pos: P.C, charges: { Oe: -1 },
    bonds: b([...COMMON, ['Cc', 'Oc', 2], ['Cc', 'Om'], ['Os', 'Hs']]),
    carbon: 'sp²', angleText: '120°',
  },
  {
    key: 'D', pos: P.D, charges: { Os: -1 },
    bonds: b([...COMMON, ['Cc', 'Oc', 2], ['Cc', 'Om'], ['Oe', 'Hs']]),
    carbon: 'sp²', angleText: '120°',
  },
]

/* Curved arrows drawn on state k before it morphs into state k+1.
   from/to: atom id, or [atomId, atomId] = midpoint of that bond.        */
export const ARROWS = [
  [
    { from: 'Om', to: 'Cc', kind: 'lp', color: 'nuc' },          // lone pair attacks C=O carbon
    { from: ['Cc', 'Oc'], to: 'Oc', kind: 'bond', color: 'push' }, // pi electrons move onto O
  ],
  [
    { from: 'Oc', to: ['Cc', 'Oc'], kind: 'lp', color: 'nuc' },  // O- pushes back down, C=O reforms
    { from: ['Cc', 'Oe'], to: 'Oe', kind: 'bond', color: 'push' }, // C-OR' breaks, R'O- leaves
  ],
  [
    { from: 'Oe', to: 'Hs', kind: 'lp', color: 'nuc' },          // R'O- takes the proton
    { from: ['Hs', 'Os'], to: 'Os', kind: 'bond', color: 'push' }, // O-H electrons stay on methanol O
  ],
]

export const ATOM_IDS = Object.keys(ATOMS)
export const MEOH_IDS = MEOH
