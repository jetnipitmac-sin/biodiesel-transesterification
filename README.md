# Transesterification of Palm Oil (Biodiesel Production)

**แดชบอร์ดที่ใช้นำเสนอได้เลย** สำหรับ presentation ครั้งที่ 2 วิชา Organic Chemistry (EGCH265) · 24 พ.ย. 2026

**เปิดเล่นได้เลย:** https://jetnipitmac-sin.github.io/biodiesel-transesterification/

ธีมเดียว **Neon**: พื้นดำ สีนีออน (เขียวมะนาว ชมพู ฟ้า เหลือง) สไตล์การ์ตูน (ขอบดำหนา เงาสีแข็ง สติกเกอร์เอียง) ฟอนต์ Mitr + Bungee
แอนิเมชัน: พื้นกริดเคลื่อนที่ + ภาพเคมีลอย, แถบสีกวาดตอนเปลี่ยนหน้า, การ์ดเด้งเข้า, ลูกศร roadmap วิ่ง,
ป้าย Thank you แบบไฟนีออน, มาสคอต "หยดน้ำมันปาล์ม" (หน้าแรก + quiz: ตอบถูกกระโดด ตอบผิดเหงื่อตก), confetti ตอนตอบถูก
โมเลกุล 3D เป็นแบบการ์ตูน (toon shading + เส้นขอบ) · โรงงาน 3D พื้นม่วงเข้มมีกริดนีออน + ป้ายเครดิต NVIDIA SimReady

เล่าเป็นเรื่องตามลำดับที่เกิดในโรงงาน: **ใคร → ทำอะไร → ที่ไหน → อย่างไร → ได้อะไร → ผลลัพธ์ไปไหนต่อ**

| # | หน้า | มีอะไร |
|---|---|---|
| 00 | เริ่มที่นี่ | ภาพทะลายปาล์ม + การ์ดปฏิกิริยา 3 ตัว (สีประจำแต่ละตัว) กดไปหน้านั้นได้ |
| 01 | Roadmap | 8 สถานีจากน้ำมันปาล์มถึง B7 · สถานีไหนมีปฏิกิริยา ได้อะไร · glycerol / เมทานอลวนกลับ / ปฏิกิริยาที่ 3 แอบเกิดที่ไหน |
| 02 | ปฏิกิริยาที่ 1 · Fischer esterification | ตัวช่วย (เตรียมน้ำมัน) · เรื่อง 6 ช่อง + กลไก 2D/3D 5 ขั้น (เร่งด้วยกรด) |
| 03 | ปฏิกิริยาที่ 2 · Transesterification | ตัวหลัก · เรื่อง 6 ช่อง + กลไก 2D/3D 3 ขั้น |
| 04 | ปฏิกิริยาที่ 3 · Saponification | ตัวร้าย · เรื่อง 6 ช่อง + กลไก 2D/3D 3 ขั้น (ทำไมย้อนกลับไม่ได้) |
| 05 | โรงงาน 3D | ทัวร์ 10 หน่วย · ป้ายบอกว่าปฏิกิริยาที่ 1/2/3 อยู่หน่วยไหน |
| 06 | Thank you | Thank you + **Quiz 10 ข้อแบบเลือกตอบ** พื้นฐาน: ชื่อปฏิกิริยา กลไก และเกิดที่หน่วยไหน (บอกถูก/ผิด + เหตุผล + “ดูได้ที่หน้า…” + นับคะแนน) + อ้างอิง + เครดิต |

ทุกหน้าปฏิกิริยามี Roadmap ย่อด้านบน ("คุณอยู่ตรงนี้") · เนื้อเรื่องอยู่ที่ `src/data/story.js`
กลไกทั้ง 3 อยู่ที่ `src/mechanism/mechs.js` · Fischer กับ saponification สร้าง 3D จากภาพ 2D ด้วย `src/mechanism/from2d.js`
(ความยาวพันธะจริง, คาร์บอน sp³ เป็นทรงสี่หน้า 109.47° พอดี, อะตอมไม่ชนกัน) ตรวจด้วย `npm run check:mechs`

**ปุ่ม** (ใช้รีโมตพรีเซนต์ได้): `→` `PageDown` `Space` ถัดไป (หน้า 02–05 เดินทีละจังหวะก่อน) · `←` ย้อน ·
`Shift`+`→`/`←` ข้ามทั้งหน้า · `F` เต็มจอ · `L` (หน้าโรงงาน) สลับป้ายชื่อหน่วย: ชื่อ (สั้น เต็มเมื่อชี้/เลือก) → แค่เลข → ซ่อน · `N` บทพูด (ซ่อนไว้ ไม่แสดงบนหน้าเว็บ) · URL จำหน้าไว้ `#/4`

**Quiz** (หน้า Thank you): `→`/`←` เปลี่ยนข้อ · คลิกคำตอบ หรือกด `1`–`4` / `A`–`D` · ตอบแล้วล็อกข้อนั้น · ปุ่ม "เริ่มใหม่" ล้างทั้งหมด ·
กด `N` เห็นเฉลยของข้อที่เปิดอยู่ (เฉพาะคนพรีเซนต์) · แก้คำถามที่ `src/data/quiz.js` (`ans` = ข้อที่ถูก, 0 = A)

**ภาพถ่าย**: Wikimedia Commons (CC BY / CC BY-SA / public domain) 6 ภาพใน `public/images/`
เครดิตอยู่ใน `src/data/credits.json` และแสดงบนภาพ + หน้า Thank you · ชื่อสมาชิกใส่ที่ `src/meta.js`

## วิธีรัน

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"   # node ตัว default ในเครื่องนี้เสีย
npm install
npm run dev          # http://localhost:5300
```

แต่ละขั้นของกลไกมี 2 จุดหยุด: **ลูกศรวาดเสร็จ** (หยุดให้อธิบาย) → **สภาพถัดไป** (อะตอมเคลื่อน + คู่อิเล็กตรอนวิ่งตามลูกศร)

## เคมีที่แสดง

- **ปฏิกิริยาที่ 2 Transesterification (ตัวหลัก, เร่งด้วยเบส)**: CH₃O⁻ เข้าชน C=O → tetrahedral intermediate (sp² → sp³) → R′O⁻ หลุด ได้ FAME → R′O⁻ ดึง H⁺ จาก CH₃OH (ตัวเร่งไม่หมด) · วน 3 รอบ TG → DG → MG → glycerol
- **ปฏิกิริยาที่ 1 Fischer esterification (เร่งด้วยกรด)**: protonation → addition → proton transfer → elimination of water → deprotonation
- **ปฏิกิริยาที่ 3 Saponification**: addition → elimination → กรด–เบส (pKa ≈ 5 กับ 16) จึงย้อนกลับไม่ได้

R = สายกรดไขมัน · R′ = ส่วนที่เหลือของ triglyceride

## ตรวจความถูกต้อง

```bash
npm run check:mechs      # ทั้ง 3 กลไก: ความยาวพันธะ, sp³ = 109.5°, อะตอมไม่ชนกัน
npm run check:geometry   # transesterification: ความยาว/มุม/การชนทุกสภาพ + ระหว่าง morph
npm run check:align      # 3D ที่จัดวางเหมือน 2D: ระยะจาก 2D, พันธะไม่ยืด/หดระหว่าง morph
npm run check:plant      # โรงงาน: ท่อ/rack ไม่บังถัง
```

## โครงสร้างไฟล์

```
src/
  App.jsx                 ตัวเดินหน้า (7 หน้า), แถบบน + ปุ่มสลับธีม, ปุ่มล่าง, บทพูด (N)
  theme.js                ตั้งธีม neon + token() ให้ภาพ 2D/3D อ่านสี
  meta.js                 ชื่อเรื่อง วิชา วันที่ ชื่อสมาชิก
  data/story.js           roadmap 8 สถานี + เรื่องของปฏิกิริยา 3 ตัว (ใคร/ทำอะไร/ที่ไหน/อย่างไร/ได้อะไร/ไปไหนต่อ)
  data/quiz.js            คำถาม 10 ข้อ 4 ตัวเลือก + เฉลย + เหตุผล
  data/credits.json       เครดิตภาพ
  sections/               Hero, Roadmap, ReactionPage (ใช้ซ้ำ 3 ปฏิกิริยา), PlantSection, ThankYou
  components/             ui.jsx (หัวข้อ ภาพ การ์ด), chem.jsx (สมการ), Quiz.jsx, Mascot.jsx (หยดน้ำมัน), BgFx.jsx (พื้นหลังเคลื่อนไหว)
  mechanism/
    mechs.js              นิยามกลไกทั้ง 3 (อะตอม 2D, สภาพ, ลูกศร, คำบรรยาย)
    from2d.js             สร้าง 3D จากภาพ 2D (ความยาวพันธะจริง, ทรงสี่หน้า, CH₃ มี H จริง, morph ไม่ยืดพันธะ)
    geometry2d/3d.js      transesterification แบบละเอียด (NeRF, Bürgi–Dunitz 107°)
    align3d.js            จัด 3D ให้วางเหมือน 2D (Horn quaternion fit)
    timeline.js           นาฬิกาเดียวขับทั้ง 2D และ 3D + จุดหยุด
    Structure2D / Mechanism2D / Mechanism3D / MechScene3D / MechControls
  plant/                  units.js (10 หน่วย ท่อ สีสาร), builders.js, PlantScene.js (Three.js + SimReady GLB), UnitCard.jsx
  styles/global.css       ดีไซน์หลัก: token ของแต่ละธีม, สีปฏิกิริยา .rx1/.rx2/.rx3 (เปลี่ยนตามธีม), quiz
  styles/neon.css         ธีม Neon ทั้งหมด: การ์ตูน + แอนิเมชัน (ปิดเองถ้าเครื่องตั้ง reduce motion)
tools/                    สคริปต์ตรวจ geometry / mechs / plant
```

## เครดิต

Three.js (MIT) · ฟอนต์ Mitr, Bungee, Noto Serif Thai, Cormorant Garamond, IBM Plex Sans Thai, IBM Plex Mono (OFL, bundle ผ่าน @fontsource ใช้ออฟไลน์ได้)

## ออนไลน์ (GitHub Pages)

ทุกครั้งที่ push ขึ้น `main` GitHub Actions (`.github/workflows/deploy.yml`) จะ build แล้ว deploy ให้เอง
ที่ https://jetnipitmac-sin.github.io/biodiesel-transesterification/ (vite `base: './'` ใช้ได้ทั้ง localhost และ Pages)

สคริปต์นำเสนอ 4 คน (`Biodiesel-Script-4-presenters.pdf`, สร้างจาก `script/build_script.py`) เก็บไว้ในเครื่อง ไม่ได้อัปขึ้น repo
