/* Captions for every stop of the timeline (index = position in STOPS). */
export const CAPTIONS = [
  {
    tag: 'สารตั้งต้น', step: 0, phase: 'start',
    title: 'พันธะเอสเทอร์ + CH₃O⁻',
    text: 'พันธะเอสเทอร์ 1 ใน 3 พันธะของ triglyceride เจอกับ <b>CH₃O⁻</b> (ตัวเร่ง จาก NaOCH₃ หรือ CH₃OH + NaOH) · คาร์บอนของ C=O <b>ขาดอิเล็กตรอน (δ+)</b> เพราะ O ดึงไป จึงเป็นเป้าให้ CH₃O⁻ เข้าชน',
  },
  {
    tag: 'ขั้นที่ 1 · Addition', step: 1, phase: 'arrows',
    title: 'CH₃O⁻ เข้าชนคาร์บอน',
    text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> อิเล็กตรอนคู่โดดเดี่ยวของ CH₃O⁻ สร้างพันธะใหม่กับคาร์บอน δ+ · <span class="k-push">ลูกศรแดง</span> อิเล็กตรอน π ของ C=O เด้งขึ้นไปอยู่บน O',
  },
  {
    tag: 'Tetrahedral intermediate', step: 1, phase: 'result',
    title: 'C เปลี่ยนจาก sp² เป็น sp³',
    text: 'คาร์บอนเปลี่ยนจาก <b>แบน 120° (sp²)</b> เป็น <b>ทรงสี่หน้า 109.5° (sp³)</b> มี 4 พันธะ · O ตัวบนถือประจุลบไว้ · เป็นสภาพชั่วคราว อยู่ได้ไม่นาน',
  },
  {
    tag: 'ขั้นที่ 2 · Elimination', step: 2, phase: 'arrows',
    title: 'C=O กลับมา · R′O⁻ หลุดออก',
    text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> O⁻ ดันอิเล็กตรอนกลับลงมาสร้าง C=O ใหม่ · <span class="k-push">ลูกศรแดง</span> คาร์บอนจะมี 5 พันธะไม่ได้ พันธะ C–OR′ จึงแตก อิเล็กตรอนตามไปอยู่กับ O ของ R′',
  },
  {
    tag: 'ได้ไบโอดีเซล', step: 2, phase: 'result',
    title: 'R–COOCH₃ = methyl ester (FAME)',
    text: 'ได้ <b>ไบโอดีเซล 1 โมเลกุล</b> · คาร์บอนกลับเป็น sp² แบน 120° · ส่วน glycerol หลุดออกไปเป็น <b>R′O⁻</b> (alkoxide)',
  },
  {
    tag: 'ขั้นที่ 3 · Proton transfer', step: 3, phase: 'arrows',
    title: 'R′O⁻ ดึง H⁺ จาก methanol',
    text: '<span class="k-nuc">ลูกศรน้ำเงิน</span> R′O⁻ เป็นเบส คว้า H⁺ จาก CH₃OH · <span class="k-push">ลูกศรแดง</span> อิเล็กตรอนของพันธะ O–H ตกไปอยู่กับ O ของ methanol',
  },
  {
    tag: 'ตัวเร่งกลับมา', step: 3, phase: 'result',
    title: 'ได้ R′OH + CH₃O⁻ ตัวใหม่',
    text: 'ได้ <b>R′OH</b> (diglyceride) และ <b>CH₃O⁻ ตัวใหม่</b> = ตัวเร่งไม่ถูกใช้หมด · วนซ้ำอีก 2 รอบ: triglyceride → diglyceride → monoglyceride → <b>glycerol</b>',
  },
]


export const STEP_NAMES = [
  { en: 'Addition', th: 'CH₃O⁻ เข้าชน C=O' },
  { en: 'Elimination', th: 'R′O⁻ หลุดออก' },
  { en: 'Proton transfer', th: 'คืนตัวเร่ง CH₃O⁻' },
]

export const OVERVIEW_CARDS = [
  { title: 'สารตั้งต้น', sub: 'ester + CH₃O⁻' },
  { title: 'Tetrahedral intermediate', sub: 'C เป็น sp³' },
  { title: 'ได้ FAME + R′O⁻', sub: 'ไบโอดีเซล 1 โมเลกุล' },
  { title: 'R′OH + CH₃O⁻', sub: 'ตัวเร่งกลับมา' },
]
