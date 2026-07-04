# สรุปการตรวจสอบเอกสาร Loop Mega Universe (LMU) V3.25

**วันที่:** 2026-07-04 · **ตรวจจาก:** commit `c007d48` · **branch งาน:** `claude/document-review-650vor` (PR #1)

---

## 1) ตรวจอย่างไร

- **ตัวรีวิว 19 ชุด**: ตรวจรายไฟล์ 7 ไฟล์ + ไฟล์หลัก `.tex` แบ่งตรวจ 7 ช่วงตามโครงสร้าง Part + ตรวจข้ามไฟล์ 5 มุม (ความสอดคล้อง metadata, คำกล่าวอ้างเรื่อง repo เทียบของจริง, glossary เทียบการใช้จริง, คำนวณฟิสิกส์ซ้ำจาก CODATA, ความสมบูรณ์เชิงโครงสร้าง LaTeX)
- **ตรวจทานซ้ำแบบ batch**: verifier 1 ตัวไล่ตัดสินทั้ง 136 ข้อ (ตามกติกา CLAUDE.md) — ข้อเชิงตัวเลขทุกข้อแนบคำสั่งรันซ้ำได้ รวมถึงรัน integrate Klein–Gordon + Friedmann ใหม่เองเพื่อเช็คภาค dark energy
- ผลดิบทั้งหมด (พร้อมหลักฐาน + suggested fix รายข้อ) อยู่ใน `findings_raw.md` ใน PR #1

## 2) ผลรวม

| Verdict | จำนวน |
|---|---|
| ยืนยันจริง (confirmed) | 117 |
| จริงแต่ปรับรายละเอียด/ระดับ (adjusted) | 11 |
| ตกไป — ไม่ใช่ defect จริง (refuted) | 7 |
| ไม่ได้ตรวจ (unchecked) | 1 |
| **รวม** | **136** |

**ข้อที่ยืนจริงหลังปรับระดับ: 128 ข้อ = critical 1 · major 31 · minor 67 · nit 29**

**จุดแข็งที่ทุกตัวรีวิวเห็นตรงกัน:** เลขคณิตเกือบทั้งหมดใน [Fact-eq] คำนวณซ้ำแล้วตรง (Hawking lifetime, Nariai, entropy rates, w₀/wₐ, มวล relic galaxies), การอ้างวรรณกรรม/arXiv ID/ORCID ถูกต้อง, ระบบ tag และ dead-end log มีวินัยสูงผิดปกติสำหรับเอกสารผู้เขียนคนเดียว

## 3) เจออะไรบ้าง (กลุ่มหลัก)

### 🔴 Critical (1 ข้อ — ยังไม่แก้ รอ ruling)
- **`tex:418` (Result 2, ภาค dark energy):** ตัวเลข endgame ที่ a=20.6 ซึ่งติดป้าย [Fact] ไม่ตรงกับผล integrate จริงของ run ใดเลย (ρ_DE จริง 6.6×10⁻³ [pinned] / 1.4×10⁻³ [m=1.0] เทียบที่อ้าง 2.6×10⁻⁴; H จริง 0.047/0.0225 เทียบที่อ้าง 0.011) — ค่าที่พิมพ์คือ extrapolation อย่างง่าย a⁻³ᐟ²/a⁻³ จากค่า a=1 และขัดกับ "first A=0 crossing at a=9.4" ของ Run 2 เอง

### 🟠 Major (31 ข้อ) — ธีมหลัก
1. **คำกล่าวอ้างเรื่อง repo ไม่ตรงของจริง** — README อ้างโฟลเดอร์ 6 ตัวที่ไม่มี, สคริปต์ตรวจใน `/code` ไม่มี, CHANGELOG หยุดที่ v3.17 ทั้งที่ฝาก v3.25 ไปแล้ว *(แก้แล้ว)*
2. **การอ้างอิงตายที่ V3_13** — companion, glossary, LICENSE-docs ชี้ไฟล์ `LMU_V3_13_consolidated.tex` ที่ถูกลบไปแล้ว *(แก้แล้ว)*
3. **ลิงก์ภายใน PDF เสียทั้งเล่ม** — counter reset ทุก \part โดยไม่ตั้ง `\theH*` → destination ชนกัน (`section.2` ซ้ำ 35 ครั้งใน PDF จริง) คลิก TOC แล้วไปผิดที่ *(แก้ที่ .tex แล้ว — ต้อง rebuild)*
4. **โฆษณา tag ไม่ตรงเอกสารจริง** — README/CITATION.cff โฆษณา `[Fact-eq]` แต่ tag จริงใน tex คือ `[Fact-theory]` ซึ่งความหมายต่างกัน (id110) *(ยังไม่แก้ — รอ ruling)*
5. **Glossary ข้อ Frobenius กลับตรรกะ** จากที่ tex derive จริง (id126) *(ยังไม่แก้ — รอ ruling)*
6. ป้าย [Fact] ที่ reviewer เห็นว่าไม่คู่ควรใน prologue (จุด no-collapse, single-survivor) — ถูกลดเป็น minor หลัง verify แต่ยังเป็นประเด็นเนื้อหา *(ยังไม่แก้)*

### 🟡 Minor / nit (96 ข้อ) — ตัวอย่างที่สำคัญ
- checksum "26 numbered equations" นับจริงได้ 33 *(แก้แล้ว)* · คำแนะนำ build ขัดกับ source เรื่องตำแหน่งรูปและ lmodern/pdfTeX *(แก้แล้ว)*
- บทคัดย่อไทยสะกด "aeon" เป็น **อิออน** (= ion) และใช้ "ข้อเรียกร้อง" แทน "ข้อกล่าวอ้าง" *(แก้แล้ว)*
- คำเตือน license "ก่อน first release" ค้างอยู่ทั้งที่ release แล้ว (README, CITATION.cff, ABOUT_AND_TAGS) *(แก้แล้ว)*
- section ชื่อ "Attribution" ซ้ำ 4 ที่ *(แก้แล้ว)* · hyperref option `hidelinks` ขัดกับ `colorlinks=true` *(แก้แล้ว)*
- ความไม่สอดคล้องเชิงตัวเลขเล็ก ๆ ใน tex เช่น Nariai 1.7e22 vs spine 1.789e22, ceiling "+11.8 dex", "~10⁻²⁰ K flash" (id130–132) *(ยังไม่แก้ — เป็นตัวเลขเนื้อหา)*
- companion: "w = +1.24 at a = 10" ไม่ derive ได้จากพารามิเตอร์ชุดไหนที่ไฟล์พิมพ์เอง (id21) *(ยังไม่แก้)*

### ⚪ ตัวอย่างข้อที่ตกไปหลัง verify (7 ข้อ)
- "21 figures" ใน CHANGELOG → บรรยาย deposit ประวัติศาสตร์ v3.17 ไม่ผิด
- g = 2×10¹⁶ vs 7.4×10¹⁶ → เอกสารเชื่อมสองค่าไว้เองแล้ว ("V3.7 recompute, OoM-stable")
- 'aeon'/L0–L4 หายจาก glossary → อยู่นอกสโคปที่ glossary ประกาศเอง

## 4) แก้ไปแล้ว (push ขึ้น PR #1 ครบ)

| Commit | เนื้อหา |
|---|---|
| `16896f3` | เพิ่ม `findings_raw.md` — ผลดิบ 115 ข้อแรก (ก่อนรอบ resume) |
| `14567ce` | เพิ่ม `CLAUDE.md` กติกาการทำงาน (ตามที่คุณสั่ง) |
| `7e050d7` | **แก้เชิงกลไก 18 ข้อใน 8 ไฟล์ markdown/metadata**: README (layout, /code, build notes, equation count, license, บทคัดย่อไทย), CHANGELOG (+entry v3.25), CITATION.cff, ABOUT_AND_TAGS, LICENSE-docs, companion+glossary (pointer V3_13→V3_25 พร้อม provenance note, tag rule — appendix ยัง verbatim ตรงกับ glossary, diff = 0), CONNECTION_MAP (ชื่อไฟล์ RM) |
| `bb5993f` | **แก้ LaTeX plumbing 3 จุดใน .tex** (ไม่แตะเนื้อหา): `\theH*` ผูกเลข part แก้ลิงก์ชน, ตัด `hidelinks`, ตั้งชื่อ Attribution 4 section ให้แยกกัน |

**หลักการที่ใช้แบ่ง:** แก้เฉพาะข้อที่ไม่ต้องตัดสินใจเชิงวิชาการ — ไม่แตะตัวเลขฟิสิกส์ ป้ายกำกับ [Fact]/[Hypo] หรือตรรกะเนื้อหาใด ๆ

## 5) ค้างอยู่ — รอคุณ ruling (ผมร่าง diff เสนอทีละข้อได้)

1. **id65 (critical)** `tex:418` — เลือก: pin ตัวเลขจาก run จริง (ผมมีผล integration + สคริปต์แล้ว) / ลดป้ายเป็น [Hypo]-extrapolation / เขียน caveat
2. **id110 (major)** README+CITATION โฆษณา `[Fact-eq]` — เปลี่ยนเป็น `[Fact-theory]` ตาม tex หรือปรับคำอธิบาย legend
3. **id126 (major)** glossary Frobenius — เขียน gloss ใหม่ให้ตรงทิศ derivation
4. **id130–132, id21, id24, id67** — ตัวเลขความสอดคล้องเล็ก ๆ ใน tex/companion
5. ป้าย [Fact] ใน prologue (id50 และเครือ) + ประเด็น Robotic notes (§9.8 dangling, one-way vs round-trip latency)

## 6) สิ่งที่ต้องทำก่อนฝาก PDF รุ่นใหม่

- **rebuild ด้วย `xelatex` 2 รอบ** (เครื่องที่ผมทำงานไม่มี TeX — การแก้ .tex ยังไม่ผ่านการ compile จริง) แล้วสุ่มคลิกลิงก์ TOC/สมการข้าม part เพื่อยืนยันว่า anchor fix ทำงาน
- เลขบรรทัด `.tex` หลังบรรทัด 20 เลื่อน **+6** จากที่อ้างใน `findings_raw.md` (ไฟล์นั้น pin ที่ `c007d48`)

---

## Adjudication outcome (2026-07-04) — appended per R16

- Independent TeX-session adjudication: `LMU_PR1_RULINGS.md` (R1–R10) + `LMU_PR1_RULINGS_ADDENDUM.md` (R11–R16), both in this directory.
- **id65 critical → OVERTURNED** (reclassified minor missing-run-spec): the L418 endgame numbers are genuine m=6 H₀ integration output — reproduction script `code/lmu_endgame_repro.py`, rerun and confirmed in both sessions. **Post-adjudication count: critical 0.**
- Applied in `ee06708` (R1–R3, R6) and the commit carrying this note (R11–R14): run-spec provenance at L418 and Result 3, eight-tag legend across README/CITATION/ABOUT_AND_TAGS, Frobenius gloss direction, two prologue [Fact]→[Fact-theory] relabels, companion "to 4%"→"~10%", RM §9.8 → name-based reference.
- R4/R5: no numeric changes (ruled leave). R15: V3.26 bundle deferred to the certified rebuild. 
- Build certification now done **in this session** (TeX installed): XeLaTeX ×2, 0 errors, 104 pages, section destinations 26 → 82 distinct (part-prefixed).
- The historical body above reflects the pre-adjudication state and is intentionally unmodified.
