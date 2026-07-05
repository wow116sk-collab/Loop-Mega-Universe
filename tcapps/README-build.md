# วิธี build ไฟล์ .html สำหรับใช้งาน (Thai Color)

ไฟล์ `.html` ที่ใช้เปิดโปรแกรม คือผลจากการ bundle ซอร์ส `accounting-app-peak-v1.6.jsx`
รวม React / SheetJS / pdf.js ทั้งหมดลงไฟล์เดียว (เปิดแบบ file:// ได้ ไม่ต้องมีเซิร์ฟเวอร์)

## ขั้นตอน (ทำครั้งแรก)

ต้องมี Node.js 18+ แล้วรันในโฟลเดอร์นี้:

```sh
npm install react@18 react-dom@18 xlsx pdfjs-dist@3.11.174 barcode-detector@2 esbuild
cp node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js pdfworker.txt
node build.mjs
```

ได้ไฟล์ `thaicolor-app-peak-v1.6.1.html` — คัดลอกไปเปิดที่เครื่องไหนก็ได้

## รอบถัดไป (แก้ซอร์สแล้ว build ใหม่)

```sh
node build.mjs
```

## ไฟล์ที่เกี่ยวข้อง

- `accounting-app-peak-v1.6.jsx` — ซอร์สหลัก (แก้โค้ดที่นี่)
- `entry.jsx` — จุดเริ่ม render `<AccountingApp />` ลง `#root`
- `build.mjs` — สคริปต์ bundle + ประกอบ HTML
- `pdfworker.txt` — worker ของ pdf.js (generate จาก node_modules ตามคำสั่งข้างบน ไม่ต้อง commit)

หมายเหตุ: แอปเรียก fonts.googleapis.com ตอนออนไลน์ (ออฟไลน์ใช้ฟอนต์ระบบแทน)
และฟีเจอร์สแกนเอกสาร AI เรียก api.anthropic.com ด้วยคีย์ที่ผู้ใช้กรอกเอง
