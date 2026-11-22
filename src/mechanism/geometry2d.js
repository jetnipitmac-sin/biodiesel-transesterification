/* ==========================================================================
   2-D "textbook" keyframes — the way the mechanism is drawn on the board.
   SVG pixels in an 820 x 340 box.  Same atom ids and the same four states as
   geometry3d.js, collapsed: R = fatty-acid chain, R' = rest of the glyceride.
   ========================================================================== */

export const VIEW = { w: 820, h: 340 }

/* role -> colour comes from the active theme (CSS variables --o2d, --r2d, --rp2d, --ink2d) */
export const ATOMS2D = {
  Cc: { t: 'C' },
  Oc: { t: 'O', role: 'o' },
  Oe: { t: 'O', role: 'o' },
  Om: { t: 'O', role: 'o' },
  Cm: { t: 'H₃C' },
  R: { t: 'R', role: 'r' },
  Rp: { t: 'R′', role: 'rp' },
  Os: { t: 'O', role: 'o' },
  Hs: { t: 'H' },
  Cs: { t: 'CH₃' },
}

const P = (x, y) => [x, y]
const MEOH_NEAR = { Hs: P(600, 238), Os: P(662, 284), Cs: P(742, 284) }

const b = (list) => list.map(([a, c, o = 1]) => ({ a, b: c, o }))
const COMMON = [['Cc', 'R'], ['Om', 'Cm'], ['Oe', 'Rp'], ['Os', 'Cs']]

export const STATES2D = [
  { // A — ester + methoxide
    pos: { Cm: P(150, 96), Om: P(232, 122), Cc: P(400, 176), Oc: P(400, 92), R: P(316, 224), Oe: P(486, 224), Rp: P(572, 176), ...MEOH_NEAR },
    charges: { Om: -1 },
    hide: ['Os', 'Hs', 'Cs'],          // methanol only matters from step 3 on: keep the picture simple
    chargeSide: { Om: 'below' },        // keep the badge off the arrow's starting point
    bonds: b([...COMMON, ['Cc', 'Oc', 2], ['Cc', 'Oe'], ['Os', 'Hs']]),
  },
  { // B — tetrahedral intermediate
    pos: { Cm: P(222, 180), Om: P(310, 180), Cc: P(400, 180), Oc: P(400, 96), R: P(400, 266), Oe: P(490, 180), Rp: P(576, 180), ...MEOH_NEAR },
    charges: { Oc: -1 },
    hide: ['Os', 'Hs', 'Cs'],
    bonds: b([...COMMON, ['Cc', 'Oc'], ['Cc', 'Oe'], ['Cc', 'Om'], ['Os', 'Hs']]),
  },
  { // C — methyl ester + R'O-
    pos: { Cm: P(160, 180), Om: P(246, 226), Cc: P(330, 180), Oc: P(330, 96), R: P(414, 226), Oe: P(560, 158), Rp: P(642, 124), ...MEOH_NEAR },
    charges: { Oe: -1 },
    bonds: b([...COMMON, ['Cc', 'Oc', 2], ['Cc', 'Om'], ['Os', 'Hs']]),
  },
  { // D — R'OH + CH3O-
    pos: { Cm: P(160, 180), Om: P(246, 226), Cc: P(330, 180), Oc: P(330, 96), R: P(414, 226), Oe: P(560, 158), Rp: P(642, 124), Hs: P(588, 234), Os: P(694, 300), Cs: P(774, 300) },
    charges: { Os: -1 },
    bonds: b([...COMMON, ['Cc', 'Oc', 2], ['Cc', 'Om'], ['Oe', 'Hs']]),
  },
]

/* bow: how far the curve bulges, signed (see Mechanism2D arrowPath). */
export const ARROWS2D = [
  [
    { from: 'Om', to: 'Cc', kind: 'lp', color: 'nuc', bow: -0.34 },
    { from: ['Cc', 'Oc'], to: 'Oc', kind: 'bond', color: 'push', bow: 0.95 },
  ],
  [
    { from: 'Oc', to: ['Cc', 'Oc'], kind: 'lp', color: 'nuc', bow: 0.95 },
    { from: ['Cc', 'Oe'], to: 'Oe', kind: 'bond', color: 'push', bow: 0.85 },
  ],
  [
    { from: 'Oe', to: 'Hs', kind: 'lp', color: 'nuc', bow: -0.42 },
    { from: ['Hs', 'Os'], to: 'Os', kind: 'bond', color: 'push', bow: 0.8 },
  ],
]
