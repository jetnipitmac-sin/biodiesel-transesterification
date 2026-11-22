import { ATOMS2D, STATES2D, ARROWS2D } from './geometry2d.js'
import { ATOMS, STATES, ARROWS } from './geometry3d.js'
import { DISPLAY, morphDisplay } from './align3d.js'
import { CAPTIONS } from './steps.js'
import { build3d } from './from2d.js'

/* ==========================================================================
   The three reactions of the story, each as one mechanism definition that
   the 2-D renderer, the 3-D scene and the step card all understand.
   ========================================================================== */

const P = (x, y) => [x, y]
const B = (list) => list.map(([a, b, o = 1]) => ({ a, b, o }))

/* ---------- Transesterification (hand-built true 3-D geometry) ---------- */
export const TRANS = {
  id: 'trans', steps: 3,
  atoms2d: ATOMS2D, states2d: STATES2D, arrows2d: ARROWS2D,
  atoms3d: ATOMS, states3d: STATES, arrows3d: ARROWS, display: DISPLAY, morph: morphDisplay,
  piPlane: ['Cc', 'Oc', 'R1'],
  captions: CAPTIONS,
  labels3d: [
    { text: 'CH₃O⁻', atom: 'Cm', states: [1, 0, 0, 0], color: '--label-nuc', dy: 0.85 },
    { text: 'CH₃OH', atom: 'Cs', states: [0, 0, 1, 0], color: '--label-plain', dy: 0.8 },
    { text: 'CH₃O⁻ ตัวใหม่', atom: 'Cs', states: [0, 0, 0, 1], color: '--label-nuc', dy: 0.85 },
    { text: 'ไบโอดีเซล · FAME', atom: 'Oc', states: [0, 0, 1, 1], color: '--label-main', dy: 0.62 },
  ],
}

/* ---------- Saponification: ester + OH- -> carboxylate (soap) + R'OH ---------- */
const SAP_ATOMS = {
  Cc: { t: 'C' }, Oc: { t: 'O', role: 'o' }, Oe: { t: 'O', role: 'o' }, Om: { t: 'O', role: 'o' }, Hm: { t: 'H' },
  R: { t: 'R', role: 'r' }, Rp: { t: 'R′', role: 'rp' }, Na: { t: 'Na⁺', role: 'na' },
}
const SAP_STATES = [
  { pos: { Hm: P(158, 100), Om: P(232, 122), Cc: P(400, 176), Oc: P(400, 92), R: P(486, 224), Oe: P(316, 224), Rp: P(232, 266), Na: P(122, 172) },
    charges: { Om: -1 }, chargeSide: { Om: 'below' }, carbon: 'sp²', angleText: '120°',
    bonds: B([['Om', 'Hm'], ['Cc', 'Oc', 2], ['Cc', 'R'], ['Cc', 'Oe'], ['Oe', 'Rp']]) },
  { pos: { Hm: P(232, 180), Om: P(310, 180), Cc: P(400, 180), Oc: P(400, 96), R: P(490, 180), Oe: P(400, 266), Rp: P(470, 312), Na: P(122, 172) },
    charges: { Oc: -1 }, carbon: 'sp³', angleText: '109.5°',
    bonds: B([['Om', 'Hm'], ['Cc', 'Oc'], ['Cc', 'Om'], ['Cc', 'R'], ['Cc', 'Oe'], ['Oe', 'Rp']]) },
  { pos: { Cc: P(380, 170), Oc: P(380, 86), R: P(466, 216), Om: P(296, 216), Hm: P(300, 272), Oe: P(322, 326), Rp: P(250, 366), Na: P(122, 172) },
    charges: { Oe: -1 }, carbon: 'sp²', angleText: '120°',
    bonds: B([['Cc', 'Oc', 2], ['Cc', 'R'], ['Cc', 'Om'], ['Om', 'Hm'], ['Oe', 'Rp']]) },
  { pos: { Cc: P(380, 170), Oc: P(380, 86), R: P(466, 216), Om: P(296, 216), Hm: P(318, 280), Oe: P(322, 330), Rp: P(250, 368), Na: P(206, 196) },
    charges: { Om: -1 }, carbon: 'sp²', angleText: '120°',
    bonds: B([['Cc', 'Oc', 2], ['Cc', 'R'], ['Cc', 'Om'], ['Oe', 'Hm'], ['Oe', 'Rp']]) },
]
const SAP_ARROWS = [
  [{ from: 'Om', to: 'Cc', color: 'nuc', bow: -0.34 }, { from: ['Cc', 'Oc'], to: 'Oc', color: 'push', bow: 0.95 }],
  [{ from: 'Oc', to: ['Cc', 'Oc'], color: 'nuc', bow: 0.95 }, { from: ['Cc', 'Oe'], to: 'Oe', color: 'push', bow: -0.9 }],
  [{ from: 'Oe', to: 'Hm', color: 'nuc', bow: 0.6 }, { from: ['Hm', 'Om'], to: 'Om', color: 'push', bow: -0.9 }],
]
const sap3d = build3d({ atoms2d: SAP_ATOMS, states2d: SAP_STATES, tetra: [{ state: 1, up: 'Oc', down: 'Oe', left: 'Om', right: 'R' }] })
export const SAPON = {
  id: 'sapon', steps: 3,
  atoms2d: SAP_ATOMS, states2d: SAP_STATES, arrows2d: SAP_ARROWS, arrows3d: SAP_ARROWS,
  ...sap3d, piPlane: ['Cc', 'Oc', 'R'],
  labels3d: [
    { text: 'OH⁻', atom: 'Hm', states: [1, 0, 0, 0], color: '--label-nuc', dy: 0.6 },
    { text: 'R′O⁻ หลุดออก', atom: 'Rp', states: [0, 0, 1, 0], color: '--label-plain', dy: 0.75 },
    { text: 'สบู่ R–COO⁻ Na⁺', atom: 'Oc', states: [0, 0, 0, 1], color: '--label-main', dy: 0.62 },
  ],
  captions: [
    { tag: 'สารตั้งต้น', step: 0, phase: 'start', title: 'เอสเทอร์ + OH⁻',
      text: 'ถ้ามี<b>น้ำ</b>ปนอยู่กับเบส หรือใช้ NaOH จะมี <b>OH⁻</b> ซึ่งเป็น nucleophile แรง เข้าชนคาร์บอน δ+ ของเอสเทอร์ได้เหมือน CH₃O⁻' },
    { tag: 'ขั้นที่ 1 · Addition', step: 1, phase: 'arrows', title: 'OH⁻ เข้าชนคาร์บอน',
      text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> อิเล็กตรอนคู่ของ OH⁻ สร้างพันธะกับคาร์บอน · <span class="k-push">ลูกศรแดง</span> อิเล็กตรอน π ขึ้นไปอยู่บน O' },
    { tag: 'Tetrahedral intermediate', step: 1, phase: 'result', title: 'C เป็น sp³ (เหมือนในไบโอดีเซล)',
      text: 'กลไกช่วงแรก<b>เหมือน transesterification ทุกอย่าง</b> ต่างแค่ตัวเข้าชนเป็น OH⁻ แทน CH₃O⁻' },
    { tag: 'ขั้นที่ 2 · Elimination', step: 2, phase: 'arrows', title: 'C=O กลับมา · R′O⁻ หลุด',
      text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> O⁻ ดันกลับสร้าง C=O · <span class="k-push">ลูกศรแดง</span> พันธะ C–OR′ แตก ได้ <b>กรดคาร์บอกซิลิก</b> กับ R′O⁻' },
    { tag: 'ได้กรด + alkoxide', step: 2, phase: 'result', title: 'R–COOH + R′O⁻',
      text: 'กรดคาร์บอกซิลิก (pKa ≈ 5) อยู่ใกล้ ๆ เบสแรงอย่าง R′O⁻ (กรดคอนจูเกต pKa ≈ 16)' },
    { tag: 'ขั้นที่ 3 · กรด–เบส', step: 3, phase: 'arrows', title: 'R′O⁻ ดึง H⁺ จาก –COOH',
      text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> R′O⁻ คว้า H⁺ · <span class="k-push">ลูกศรแดง</span> อิเล็กตรอนตกไปอยู่บน O ของ carboxylate' },
    { tag: 'ได้สบู่', step: 3, phase: 'result', title: 'R–COO⁻ Na⁺ = สบู่ (ย้อนกลับไม่ได้)',
      text: 'ต่าง pKa กัน ~11 หน่วย สมดุลจึงไปทางขวาเกือบหมด · <b>กินเบสที่เป็นตัวเร่ง</b> และสบู่ทำให้แยกชั้นไม่ออก' },
  ],
}

/* ---------- Fischer esterification (acid catalysed, 5 steps) ---------- */
const FIS_ATOMS = {
  Cc: { t: 'C' }, O1: { t: 'O', role: 'o' }, O2: { t: 'O', role: 'o' }, H2: { t: 'H' }, R: { t: 'R', role: 'r' },
  Hp: { t: 'H' }, Om: { t: 'O', role: 'o' }, Cm: { t: 'H₃C' }, Hm: { t: 'H' },
}
const FIS_STATES = [
  { pos: { R: P(316, 224), Cc: P(400, 176), O1: P(400, 92), O2: P(486, 224), H2: P(560, 250), Hp: P(500, 60), Om: P(232, 122), Cm: P(150, 96), Hm: P(226, 58) },
    charges: { Hp: 1 }, carbon: 'sp²', angleText: '120°',
    bonds: B([['Cc', 'O1', 2], ['Cc', 'R'], ['Cc', 'O2'], ['O2', 'H2'], ['Om', 'Cm'], ['Om', 'Hm']]) },
  { pos: { R: P(316, 224), Cc: P(400, 176), O1: P(400, 92), O2: P(486, 224), H2: P(560, 250), Hp: P(462, 60), Om: P(232, 122), Cm: P(150, 96), Hm: P(226, 58) },
    charges: { O1: 1 }, chargeSide: { O1: 'below' }, carbon: 'sp²', angleText: '120°',
    bonds: B([['Cc', 'O1', 2], ['O1', 'Hp'], ['Cc', 'R'], ['Cc', 'O2'], ['O2', 'H2'], ['Om', 'Cm'], ['Om', 'Hm']]) },
  { pos: { Cc: P(400, 180), O1: P(400, 96), Hp: P(466, 66), R: P(490, 180), Om: P(310, 180), Cm: P(236, 148), Hm: P(300, 250), O2: P(400, 266), H2: P(468, 300) },
    charges: { Om: 1 }, carbon: 'sp³', angleText: '109.5°',
    bonds: B([['Cc', 'O1'], ['O1', 'Hp'], ['Cc', 'R'], ['Cc', 'Om'], ['Om', 'Cm'], ['Om', 'Hm'], ['Cc', 'O2'], ['O2', 'H2']]) },
  { pos: { Cc: P(400, 180), O1: P(400, 96), Hp: P(466, 66), R: P(490, 180), Om: P(310, 180), Cm: P(236, 148), Hm: P(336, 302), O2: P(400, 266), H2: P(468, 300) },
    charges: { O2: 1 }, chargeSide: { O2: 'below' }, carbon: 'sp³', angleText: '109.5°',
    bonds: B([['Cc', 'O1'], ['O1', 'Hp'], ['Cc', 'R'], ['Cc', 'Om'], ['Om', 'Cm'], ['Cc', 'O2'], ['O2', 'H2'], ['O2', 'Hm']]) },
  { pos: { Cc: P(360, 170), O1: P(360, 86), Hp: P(424, 58), R: P(444, 216), Om: P(276, 216), Cm: P(196, 176), O2: P(392, 330), H2: P(458, 352), Hm: P(334, 360) },
    charges: { O1: 1 }, chargeSide: { O1: 'below' }, carbon: 'sp²', angleText: '120°',
    bonds: B([['Cc', 'O1', 2], ['O1', 'Hp'], ['Cc', 'R'], ['Cc', 'Om'], ['Om', 'Cm'], ['O2', 'H2'], ['O2', 'Hm']]) },
  { pos: { Cc: P(360, 170), O1: P(360, 86), Hp: P(452, 40), R: P(444, 216), Om: P(276, 216), Cm: P(196, 176), O2: P(392, 330), H2: P(458, 352), Hm: P(334, 360) },
    charges: { Hp: 1 }, carbon: 'sp²', angleText: '120°',
    bonds: B([['Cc', 'O1', 2], ['Cc', 'R'], ['Cc', 'Om'], ['Om', 'Cm'], ['O2', 'H2'], ['O2', 'Hm']]) },
]
const FIS_ARROWS = [
  [{ from: 'O1', to: 'Hp', color: 'nuc', bow: -0.4 }],
  [{ from: 'Om', to: 'Cc', color: 'nuc', bow: -0.34 }, { from: ['Cc', 'O1'], to: 'O1', color: 'push', bow: 0.95 }],
  [{ from: 'O2', to: 'Hm', color: 'nuc', bow: -0.4 }, { from: ['Om', 'Hm'], to: 'Om', color: 'push', bow: -0.9 }],
  [{ from: 'O1', to: ['Cc', 'O1'], color: 'nuc', bow: 0.95 }, { from: ['Cc', 'O2'], to: 'O2', color: 'push', bow: -0.9 }],
  [{ from: ['O1', 'Hp'], to: 'O1', color: 'push', bow: 0.9 }],
]
const fis3d = build3d({
  atoms2d: FIS_ATOMS, states2d: FIS_STATES,
  tetra: [{ state: 2, up: 'O1', down: 'O2', left: 'Om', right: 'R' }, { state: 3, up: 'O1', down: 'O2', left: 'Om', right: 'R' }],
})
export const FISCHER = {
  id: 'fischer', steps: 5,
  atoms2d: FIS_ATOMS, states2d: FIS_STATES, arrows2d: FIS_ARROWS, arrows3d: FIS_ARROWS,
  ...fis3d, piPlane: ['Cc', 'O1', 'R'],
  labels3d: [
    { text: 'H⁺ จาก H₂SO₄', atom: 'Hp', states: [1, 0, 0, 0, 0, 0], color: '--label-nuc', dy: 0.55 },
    { text: 'CH₃OH', atom: 'Cm', states: [1, 1, 0, 0, 0, 0], color: '--label-plain', dy: 0.7 },
    { text: 'H₂O หลุดออก', atom: 'O2', states: [0, 0, 0, 0, 1, 1], color: '--label-plain', dy: 0.6 },
    { text: 'H⁺ กลับมา', atom: 'Hp', states: [0, 0, 0, 0, 0, 1], color: '--label-nuc', dy: 0.55 },
    { text: 'methyl ester (FAME)', atom: 'Cc', states: [0, 0, 0, 0, 0, 1], color: '--label-main', dy: -1.1 },
  ],
  captions: [
    { tag: 'สารตั้งต้น', step: 0, phase: 'start', title: 'กรดไขมันอิสระ + CH₃OH + H⁺',
      text: '<b>FFA (R–COOH)</b> ในน้ำมัน เจอเมทานอล โดยมีกรด <b>H₂SO₄</b> ให้ H⁺ · เมทานอลเป็น nucleophile อ่อน จึงต้องกระตุ้น C=O ก่อน' },
    { tag: 'ขั้นที่ 1 · Protonation', step: 1, phase: 'arrows', title: 'O ของ C=O รับ H⁺',
      text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> อิเล็กตรอนคู่ของ O บน C=O ไปจับ H⁺ จากกรด' },
    { tag: 'C=O ถูกโปรตอน', step: 1, phase: 'result', title: 'คาร์บอนขาดอิเล็กตรอนมากขึ้น',
      text: 'C=O⁺–H ดึงอิเล็กตรอนแรงขึ้น คาร์บอนจึงเป็น δ+ มาก <b>นี่คือเหตุผลที่ต้องใช้กรดเร่ง</b>' },
    { tag: 'ขั้นที่ 2 · Addition', step: 2, phase: 'arrows', title: 'CH₃OH เข้าชนคาร์บอน',
      text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> O ของเมทานอลสร้างพันธะกับคาร์บอน · <span class="k-push">ลูกศรแดง</span> อิเล็กตรอน π ไปลบประจุบน O' },
    { tag: 'Tetrahedral intermediate', step: 2, phase: 'result', title: 'C เป็น sp³ · O ของเมทานอลมีประจุ +',
      text: 'คาร์บอนมี 4 พันธะ: –OH, –OH, –O⁺(H)CH₃ และ R' },
    { tag: 'ขั้นที่ 3 · Proton transfer', step: 3, phase: 'arrows', title: 'ย้าย H⁺ ไปที่ –OH',
      text: '<span class="k-push">ลูกศรแดง</span> H⁺ หลุดจาก O ของเมทานอล · <span class="k-nuc">ลูกศรน้ำเงิน</span> –OH อีกตัวรับ H⁺ (ในจริงส่งต่อผ่านตัวทำละลาย)' },
    { tag: 'ได้ –OH₂⁺', step: 3, phase: 'result', title: '–OH กลายเป็น –OH₂⁺',
      text: '–OH เป็นหมู่ออกที่แย่ แต่ –OH₂⁺ หลุดออกไปเป็น <b>น้ำ</b> ได้ง่าย' },
    { tag: 'ขั้นที่ 4 · Elimination', step: 4, phase: 'arrows', title: 'C=O กลับมา · H₂O หลุด',
      text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> –OH ดันอิเล็กตรอนลงมาสร้าง C=O · <span class="k-push">ลูกศรแดง</span> พันธะ C–OH₂⁺ แตก น้ำหลุดออก' },
    { tag: 'ได้เอสเทอร์ที่มี H⁺', step: 4, phase: 'result', title: 'R–C(=O⁺H)–OCH₃ + H₂O',
      text: 'โครงเอสเทอร์ครบแล้ว เหลือ H⁺ ที่ติดบน O ของ C=O' },
    { tag: 'ขั้นที่ 5 · Deprotonation', step: 5, phase: 'arrows', title: 'ปล่อย H⁺ คืน',
      text: '<span class="k-push">ลูกศรแดง</span> อิเล็กตรอนของพันธะ O–H กลับไปที่ O · H⁺ กลับไปเป็นตัวเร่ง' },
    { tag: 'ได้ไบโอดีเซล', step: 5, phase: 'result', title: 'R–COOCH₃ (FAME) + H₂O',
      text: 'FFA กลายเป็น methyl ester แล้ว · <b>ผันกลับได้</b> โรงงานจึงต้องแยกน้ำออกเพื่อดันสมดุล (Le Chatelier)' },
  ],
}

export const MECHS = { trans: TRANS, sapon: SAPON, fischer: FISCHER }
