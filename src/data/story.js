/* ==========================================================================
   The story of the process: the roadmap (palm fruit -> B7) and the three
   reactions, each told as who / what / where / how / result / what next.
   Reactions are numbered in the order they happen in the plant.
   ========================================================================== */

/* reaction colours live in global.css (.rx1 / .rx2 / .rx3), so each theme can restyle them */

/* stations of the roadmap, in process order (page = dashboard page to open) */
export const ROADMAP = [
  { id: 'oil', t: 'น้ำมันปาล์ม', where: 'ถัง T-101', out: 'triglyceride (+ FFA เล็กน้อย)', img: 'palm-oil-bottles.jpg' },
  { id: 'r1', rx: 1, t: 'Fischer esterification', where: 'R-101 · เตรียมน้ำมัน', out: 'FFA → FAME + H₂O', page: 2 },
  { id: 'r2', rx: 2, t: 'Transesterification', where: 'R-201/202 · ปฏิกิริยาหลัก', out: 'TG → 3 FAME + glycerol', page: 3 },
  { id: 'sep', t: 'แยกชั้น', where: 'S-301', out: 'FAME ชั้นบน · glycerol ชั้นล่าง' },
  { id: 'meoh', t: 'กู้เมทานอล', where: 'C-401', out: 'CH₃OH ส่วนเกินวนกลับไปใช้' },
  { id: 'wash', rx3: true, t: 'ล้างน้ำ', where: 'W-501', out: 'ล้างสบู่จากปฏิกิริยาที่ 3 ออก', page: 4 },
  { id: 'dry', t: 'อบแห้ง', where: 'D-601', out: 'น้ำเหลือ ≤ 500 mg/kg' },
  { id: 'b7', t: 'B100 → B7', where: 'ถัง T-701 → ปั๊ม', out: 'ไบโอดีเซลในถังรถ', img: 'ptt-station.jpg' },
]

export const REACTIONS = {
  1: {
    n: 1, mech: 'fischer', name: 'Fischer esterification', role: 'ตัวช่วย · เตรียมน้ำมัน', station: 'r1',
    eq: 'fischer', cond: ['ตัวเร่ง H₂SO₄ (กรด)', '60–65 °C', 'ผันกลับได้ ต้องแยกน้ำ', 'CH10 สไลด์ 35 · CH13 สไลด์ 47'],
    story: {
      who: 'กรดไขมันอิสระ (FFA, R–COOH) ที่ปนในน้ำมันปาล์ม + เมทานอล · มีกรด H₂SO₄ เป็นตัวเร่ง',
      what: 'เปลี่ยน FFA ให้กลายเป็น methyl ester (ไบโอดีเซล) ก่อน จะได้ไม่เหลือไปเป็นสบู่',
      where: 'หน่วย 3 · ถังเตรียมน้ำมัน R-101 ก่อนเข้าถังปฏิกิริยาหลัก',
      how: 'กรดให้ H⁺ กระตุ้น C=O → เมทานอลเข้าชน → น้ำหลุดออก (5 ขั้น ดูกลไกด้านล่าง)',
      result: 'น้ำมันที่ FFA ต่ำ (ต่ำกว่าราว 0.5–1%) + FAME ส่วนหนึ่ง + น้ำ',
      next: 'น้ำมันที่เตรียมแล้วไปถังปฏิกิริยาหลัก (ปฏิกิริยาที่ 2) · น้ำถูกแยกออกก่อน',
    },
  },
  2: {
    n: 2, mech: 'trans', name: 'Transesterification', role: 'ตัวหลัก · ได้ไบโอดีเซล', station: 'r2',
    eq: 'trans', cond: ['ตัวเร่ง CH₃O⁻ (NaOCH₃)', '60 °C · 1 atm · ~1 ชม.', 'เมทานอล 6 : 1', 'CH10 · nucleophilic acyl substitution'],
    story: {
      who: 'triglyceride (น้ำมันปาล์ม) + เมทานอลเกิน 6 : 1 · มี CH₃O⁻ จาก NaOCH₃ เป็นตัวเร่ง',
      what: 'ตัดพันธะเอสเทอร์ทั้ง 3 ของ triglyceride แล้วต่อ –CH₃ เข้าไปแทน “แลกคู่เอสเทอร์”',
      where: 'หน่วย 4 · ถังกวน R-201 และ R-202 ต่อกัน 2 ถัง',
      how: 'CH₃O⁻ เข้าชน C=O → tetrahedral intermediate → R′O⁻ หลุด (3 ขั้น วนซ้ำ 3 รอบ) · ดึง glycerol ออกระหว่างถัง',
      result: 'FAME 3 โมเลกุล (ไบโอดีเซล) + glycerol 1 โมเลกุล (ราว 10% ของน้ำหนัก)',
      next: 'แยกชั้น → FAME ไปกู้เมทานอล ล้าง อบ → B100 → ผสมเป็น B7 · glycerol ไปทำสบู่ เครื่องสำอาง',
    },
  },
  3: {
    n: 3, mech: 'sapon', name: 'Saponification', role: 'ตัวร้าย · ต้องกัน', station: 'wash',
    eq: 'sapon', cond: ['เกิดเมื่อมีน้ำหรือ FFA', 'กินเบสที่เป็นตัวเร่ง', 'ย้อนกลับไม่ได้', 'CH10 สไลด์ 39'],
    story: {
      who: 'เอสเทอร์ (น้ำมันหรือไบโอดีเซล) + OH⁻ ที่มาจากน้ำปนหรือจาก NaOH',
      what: 'เปลี่ยนเอสเทอร์เป็นสบู่ (เกลือของกรดไขมัน R–COO⁻ Na⁺) แทนที่จะเป็นไบโอดีเซล',
      where: 'แอบเกิดในถังปฏิกิริยาหลักถ้าน้ำมันไม่แห้ง · ล้างสบู่ออกที่หน่วย 7 (W-501)',
      how: 'OH⁻ เข้าชนแบบเดียวกับ CH₃O⁻ แต่ขั้นสุดท้ายเป็นกรด–เบส (pKa 5 กับ 16) จึงย้อนกลับไม่ได้',
      result: 'สบู่ + แอลกอฮอล์ · ตัวเร่งหมด · เกิดอิมัลชัน glycerol แยกชั้นไม่ออก · ไบโอดีเซลน้อยลง',
      next: 'กันไว้ก่อน: น้ำมันต้องแห้ง ทำ Fischer ก่อน และใช้ NaOCH₃ แทน NaOH · ที่หลุดมาล้างออกด้วยน้ำ',
    },
  },
}

export const STORY_KEYS = [
  ['who', 'ใคร', 'สารที่เข้าทำปฏิกิริยา'],
  ['what', 'ทำอะไร', 'เปลี่ยนอะไรเป็นอะไร'],
  ['where', 'ที่ไหน', 'หน่วยในโรงงาน'],
  ['how', 'อย่างไร', 'สภาวะ + กลไก'],
  ['result', 'ได้อะไร', 'ผลิตภัณฑ์'],
  ['next', 'ไปไหนต่อ', 'ผลลัพธ์ถูกใช้ยังไง'],
]
