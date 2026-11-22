/* ==========================================================================
   Biodiesel plant (base-catalysed, with acid pretreatment), in process order.
   Coordinates in metres: x east (process flows left -> right), z south, y up.
   Each unit: what it does, which reaction from the course happens there,
   two facts, and a likely question from the professor with a short answer.
   ========================================================================== */

export const UNITS = [
  {
    id: 'feed', short: 'น้ำมันปาล์ม', n: 1, tag: 'T-101', name: 'ถังน้ำมันปาล์ม', en: 'Palm oil storage',
    kind: 'tank', x: -34, z: -4, d: 8, h: 9, band: '#f59e0b', ladder: 1.2,
    role: 'เก็บน้ำมันปาล์ม (triglyceride) วัตถุดิบหลักของโรงงาน',
    reaction: 'Triglyceride = เอสเทอร์ของ glycerol กับกรดไขมัน 3 สาย (CH13)',
    facts: [
      'ต้องอุ่นถังไว้ราว 50 °C เพราะน้ำมันปาล์มเริ่มแข็งตัวที่ประมาณ 35 °C',
      'ตรวจกรดไขมันอิสระ (FFA) ก่อน: ถ้าเกินราว 0.5–1% ต้องผ่านหน่วยเตรียมน้ำมัน (หน่วย 3)',
    ],
    qa: { q: 'ทำไมต้องคุม FFA?', a: 'FFA เจอเบสจะกลายเป็นสบู่ แย่งตัวเร่ง แล้วทำให้แยกชั้นไม่ออก' },
  },
  {
    id: 'meoh', short: 'เมทานอล', n: 2, tag: 'T-102', name: 'เมทานอล + ตัวเร่ง', en: 'Methanol & catalyst',
    kind: 'tank', x: -25, z: 12, d: 4.5, h: 6.5, band: '#3b82f6', ladder: 1.9,
    role: 'เก็บเมทานอล (สารตั้งต้น) และตัวเร่ง NaOCH₃ ในถัง IBC ข้าง ๆ',
    reaction: 'CH₃OH + NaOH ⇌ CH₃O⁻ + H₂O → โรงงานจึงนิยมซื้อ NaOCH₃ สำเร็จรูป (ไม่มีน้ำเกิด)',
    facts: [
      'ใส่เมทานอลเกิน 6:1 (ทฤษฎีใช้ 3:1) เพื่อดันสมดุลไปทางผลิตภัณฑ์ (Le Chatelier)',
      'เมทานอลไวไฟ: ถังคลุมด้วยไนโตรเจน มีฝักบัวล้างตัวฉุกเฉินและตู้เก็บสารไวไฟ',
    ],
    qa: { q: 'ทำไมไม่ใช้ NaOH ตรง ๆ?', a: 'NaOH + CH₃OH ให้น้ำ น้ำทำให้เอสเทอร์กลายเป็นสบู่ (saponification)' },
  },
  {
    id: 'pre', short: 'เตรียมน้ำมัน', n: 3, tag: 'R-101', name: 'ถังเตรียมน้ำมัน (Esterification)', en: 'Acid pretreatment',
    kind: 'reactor', x: -20, z: -6, d: 2.2, h: 3, legs: 2.6, rx: 1,
    role: 'เปลี่ยนกรดไขมันอิสระ (FFA) ให้เป็นไบโอดีเซลก่อน โดยใช้กรด H₂SO₄ เป็นตัวเร่ง',
    reaction: 'R–COOH + CH₃OH ⇌ R–COOCH₃ + H₂O · Fischer esterification (CH10 สไลด์ 35, CH13 สไลด์ 47)',
    facts: [
      'ใช้กรดเป็นตัวเร่ง เพราะถ้าใช้เบส FFA จะกลายเป็นสบู่',
      'ประมาณ 60–65 °C · ต้องแยกน้ำที่เกิดขึ้นออกก่อนเข้าขั้นต่อไป',
    ],
    qa: { q: 'ทำไมขั้นนี้ใช้กรด แต่ขั้นหลักใช้เบส?', a: 'กรดเปลี่ยน FFA เป็นเอสเทอร์ได้โดยไม่เกิดสบู่ ส่วนเบสเร่ง transesterification ได้เร็วกว่ามาก' },
  },
  {
    id: 'rx', short: 'ปฏิกิริยาหลัก', n: 4, tag: 'R-201 / R-202', name: 'ถังปฏิกิริยาหลัก (Transesterification)', en: 'Transesterification reactors',
    kind: 'reactors', x: -4.75, z: -6, d: 2.6, h: 3.4, platform: 3.2, rx: 2,
    role: 'ปฏิกิริยาหลัก: น้ำมัน + เมทานอล → ไบโอดีเซล + glycerol ในถังกวน 2 ถังต่อกัน',
    reaction: 'TG + 3 CH₃OH → 3 FAME + glycerol · ตัวเร่ง CH₃O⁻ · nucleophilic acyl substitution (ดูหน้ากลไก)',
    facts: [
      '60 °C (ต่ำกว่าจุดเดือดเมทานอล 64.7 °C) · 1 atm · ประมาณ 1 ชม. · กวนแรงเพราะน้ำมันกับเมทานอลไม่ผสมกัน',
      'แยก glycerol ออกระหว่าง 2 ถัง เพื่อดันสมดุลไปข้างหน้า (Le Chatelier)',
    ],
    qa: { q: 'ทำไมต้องกวนแรง?', a: 'น้ำมันไม่มีขั้ว เมทานอลมีขั้ว เลยแยกชั้นกัน ปฏิกิริยาเกิดตรงผิวสัมผัส ยิ่งกวนยิ่งเร็ว' },
    mechanismLink: true,
  },
  {
    id: 'settle', short: 'แยกชั้น', n: 5, tag: 'S-301', name: 'ถังแยกชั้น (Settler)', en: 'Glycerol settler',
    kind: 'horizontal', x: 10, z: -6, d: 2.4, L: 8,
    role: 'ตั้งทิ้งไว้ให้ glycerol จมลงชั้นล่าง ไบโอดีเซลลอยอยู่ชั้นบน',
    reaction: 'ไม่มีปฏิกิริยา · แยกด้วยความต่างของขั้วและความหนาแน่น',
    facts: [
      'glycerol มี –OH 3 หมู่ มีขั้วมาก จึงไม่ผสมกับ FAME ที่ไม่มีขั้ว',
      'glycerol หนาแน่นประมาณ 1.26 g/mL ส่วน FAME ประมาณ 0.88 g/mL จึงอยู่ชั้นล่าง',
    ],
    qa: { q: 'ถ้ามีสบู่เยอะจะเกิดอะไร?', a: 'สบู่ทำให้เกิดอิมัลชัน สองชั้นแยกกันไม่ออก' },
  },
  {
    id: 'mrec', short: 'กู้เมทานอล', n: 6, tag: 'C-401', name: 'หอกู้คืนเมทานอล', en: 'Methanol recovery column',
    kind: 'column', x: 13, z: 9, d: 1.1, h: 13,
    role: 'กลั่นเมทานอลส่วนเกินออก แล้วส่งกลับไปใช้ใหม่ (ท่อสีน้ำเงินกลับไปถัง T-102)',
    reaction: 'ไม่มีปฏิกิริยา · แยกด้วยจุดเดือด (CH₃OH เดือดที่ 64.7 °C ต่ำกว่า FAME มาก)',
    facts: [
      'เมทานอลที่ใส่เกินไว้ดันสมดุล ต้องเอากลับมาใช้ ไม่งั้นแพงและอันตราย',
      'ไอเมทานอลควบแน่นที่ condenser ด้านบน แล้วไหลกลับถังเก็บ',
    ],
    qa: { q: 'ทำไมไม่ใส่เมทานอลพอดี 3:1?', a: 'ปฏิกิริยาย้อนกลับได้ ใส่เกินแล้วค่อยกู้คืน จะได้ conversion สูงกว่า' },
  },
  {
    id: 'wash', short: 'ล้างน้ำ', n: 7, tag: 'W-501', name: 'หอล้างด้วยน้ำ', en: 'Water wash',
    kind: 'column', x: 22, z: -6, d: 1.6, h: 8, rx: 3,
    role: 'ล้างสบู่ ตัวเร่ง และ glycerol ที่หลงเหลือออกจากไบโอดีเซล',
    reaction: 'ตัวร้ายที่ต้องกำจัด: ester + OH⁻ → สบู่ (saponification · CH10 สไลด์ 39)',
    facts: [
      'สบู่ละลายน้ำได้ จึงออกไปกับน้ำล้าง',
      'ใช้น้ำอุ่น ช่วยให้แยกชั้นได้เร็วขึ้น',
    ],
    qa: { q: 'สบู่มาจากไหน?', a: 'จากน้ำหรือ FFA ที่ไปทำปฏิกิริยากับเบส' },
  },
  {
    id: 'dry', short: 'อบแห้ง', n: 8, tag: 'D-601', name: 'ถังอบแห้งสุญญากาศ', en: 'Vacuum dryer',
    kind: 'reactor', x: 29, z: -6, d: 1.8, h: 3.2, legs: 2, noMotor: true,
    role: 'ไล่น้ำออกจนเหลือไม่เกิน 500 mg/kg ตามมาตรฐานไบโอดีเซล',
    reaction: 'กันปฏิกิริยาย้อนกลับ: FAME + H₂O → กรดไขมัน + CH₃OH (hydrolysis)',
    facts: [
      'สุญญากาศทำให้น้ำระเหยได้ที่อุณหภูมิต่ำ ไบโอดีเซลไม่เสื่อม',
      'น้ำที่ค้างทำให้เครื่องยนต์เป็นสนิม และจุลินทรีย์เติบโตในถังน้ำมัน',
    ],
    qa: { q: 'ทำไมต้องใช้สุญญากาศ?', a: 'ลดจุดเดือดของน้ำ ไล่น้ำได้โดยไม่ต้องใช้ความร้อนสูง' },
  },
  {
    id: 'product', short: 'ไบโอดีเซล', n: 9, tag: 'T-701', name: 'ถังไบโอดีเซล B100', en: 'Biodiesel (B100) storage',
    kind: 'tank', x: 42, z: -4, d: 8, h: 9, band: '#eab308', ladder: 1.9,
    role: 'เก็บไบโอดีเซล 100% ก่อนส่งไปผสมเป็นดีเซล B7 ที่คลังน้ำมัน',
    reaction: 'ผลิตภัณฑ์: methyl ester ของกรดไขมันปาล์ม (FAME)',
    facts: [
      'B7 = ดีเซล 93% + ไบโอดีเซล 7% ที่ขายตามปั๊มในไทย',
      'ไบโอดีเซลจากปาล์มมีไขมันอิ่มตัวเยอะ จึงเริ่มขุ่นที่ประมาณ 15 °C (เรื่องพันธะคู่/cis ใน CH13)',
    ],
    qa: { q: 'ทำไมไม่ใช้น้ำมันปาล์มเติมรถตรง ๆ?', a: 'น้ำมันปาล์มหนืดกว่าดีเซลมาก การแปลงเป็น methyl ester ลดความหนืดลงจนใช้กับเครื่องยนต์ได้' },
  },
  {
    id: 'glyc', short: 'glycerol', n: 10, tag: 'T-702', name: 'ถัง glycerol', en: 'Crude glycerol',
    kind: 'tank', x: 34, z: 11, d: 4.5, h: 6, band: '#a16207', ladder: 1.2,
    role: 'เก็บ glycerol ซึ่งเป็นผลพลอยได้ ราว 10% ของน้ำหนักน้ำมัน',
    reaction: 'C₃H₅(OH)₃ = แกนของ triglyceride ที่หลุดออกมา',
    facts: [
      'ทำให้บริสุทธิ์แล้วขายต่อให้อุตสาหกรรมสบู่ เครื่องสำอาง และยา',
      'รายได้จาก glycerol ช่วยให้โรงงานคุ้มทุนขึ้น',
    ],
    qa: { q: 'glycerol มาจากส่วนไหนของโมเลกุล?', a: 'จากแกน 3 คาร์บอนของ triglyceride (R′ ในกลไก) หลังกรดไขมันทั้ง 3 สายถูกแทนด้วย CH₃' },
  },
]

export const UNIT = Object.fromEntries(UNITS.map((u) => [u.id, u]))

/* fluid colours (also used by the legend) */
export const FLUIDS = {
  oil: { color: '#f59e0b', th: 'น้ำมันปาล์ม' },
  meoh: { color: '#3b82f6', th: 'เมทานอล' },
  cat: { color: '#8b5cf6', th: 'ตัวเร่ง NaOCH₃' },
  mix: { color: '#f97316', th: 'ของผสมที่กำลังทำปฏิกิริยา' },
  fame: { color: '#eab308', th: 'ไบโอดีเซล (FAME)' },
  glyc: { color: '#a16207', th: 'glycerol' },
  water: { color: '#06b6d4', th: 'น้ำล้าง' },
}

/* Pipes. 'rack' pipes rise from a pump, run along the pipe rack and drop to
   their destination; 'path' pipes follow explicit points. Lanes on the rack
   are assigned automatically so parallel pipes never overlap. */
export const RACK = { y: 8.5, zLeg: 9.6, z: -15.5, x0: -40, x1: 47, lane: 0.42 }

/* The rack runs along the NORTH edge, behind every unit, so the camera
   (south side) sees the equipment unobstructed. Pumps sit on the north side
   of their unit; every riser / z-leg was checked against tank footprints. */
export const FLOWS = [
  { id: 'f1', fluid: 'oil', from: 'feed', to: 'pre', rack: [[-31, 0.9, -9.6], [-19.5, 6.6, -6]] },
  { id: 'f2', fluid: 'meoh', from: 'meoh', to: 'pre', rack: [[-23.5, 0.9, 9.2], [-20.5, 6.6, -6]] },
  { id: 'f3', fluid: 'meoh', from: 'meoh', to: 'rx', rack: [[-22.5, 0.9, 9.2], [-8.6, 7.8, -6]] },
  { id: 'f4', fluid: 'oil', from: 'pre', to: 'rx', rack: [[-18.2, 0.9, -9], [-7.4, 7.8, -6]] },
  { id: 'f5', fluid: 'cat', from: 'meoh', to: 'rx', rack: [[-27.4, 0.9, 10], [-8, 7.8, -5.3]] },
  { id: 'f6', fluid: 'mix', from: 'rx', to: 'rx', path: [[-6.7, 5.6, -6], [-2.8, 5.6, -6]] },
  { id: 'f7', fluid: 'mix', from: 'rx', to: 'settle', path: [[1.2, 0.9, -9], [1.2, 5.2, -9], [7, 5.2, -9], [7, 5.2, -6], [7, 3.45, -6]] },
  { id: 'f8', fluid: 'fame', from: 'settle', to: 'mrec', rack: [[14.6, 0.9, -8.8], [13, 8, 8.45]] },
  { id: 'f9', fluid: 'glyc', from: 'settle', to: 'glyc', rack: [[12.2, 0.9, -8.8], [34, 5.5, 8.8]] },
  { id: 'f10', fluid: 'meoh', from: 'mrec', to: 'mrec', path: [[13, 14.7, 9], [13, 15.4, 9], [15.6, 15.4, 9], [15.6, 13.1, 9]] },
  { id: 'f11', fluid: 'meoh', from: 'mrec', to: 'meoh', rack: [[18.6, 12.4, 9], [-25, 6, 9.75]], recycle: true },
  { id: 'f12', fluid: 'fame', from: 'mrec', to: 'wash', rack: [[11, 0.9, 11.5], [22, 8, -6.8]] },
  { id: 'f13', fluid: 'water', from: 'wash', to: 'wash', path: [[19.6, 0.6, -11], [19.6, 4, -11], [19.6, 4, -6], [21.2, 4, -6]] },
  { id: 'f14', fluid: 'fame', from: 'wash', to: 'dry', path: [[24.5, 0.9, -9], [24.5, 7, -9], [29.4, 7, -9], [29.4, 7, -6], [29.4, 6, -6]] },
  { id: 'f15', fluid: 'fame', from: 'dry', to: 'product', rack: [[31.4, 0.9, -9], [42, 8.6, -8]] },
]

/** Pump skids sit where a rack pipe starts at grade. */
export const PUMPS = FLOWS.filter((f) => f.rack && f.rack[0][1] < 1.5).map((f) => ({ x: f.rack[0][0], z: f.rack[0][2], fluid: f.fluid }))
  .concat([{ x: 1.2, z: -9 }, { x: 24.5, z: -9 }])
