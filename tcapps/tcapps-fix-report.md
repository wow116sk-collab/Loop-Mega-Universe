# รายงานการแก้ไข accounting-app-peak-v1.6.jsx (fix pass)

## สรุป

- แก้ครบทั้ง 26 findings จากรอบตรวจ (แก้ที่ซอร์ส .jsx — ไฟล์ .html เป็น build ที่ minify แล้ว ต้อง rebuild จากซอร์สนี้ด้วย pipeline ของโปรเจกต์)
- รีเช็ค 2 รอบด้วย batch verifier + regression hunter (อิสระจากคนแก้):
  - รอบ 1: ยืนยัน FIXED 23/26, PARTIAL 3 และพบ regression จากการแก้ 4 ตัว → แก้ทั้งหมด
  - รอบ 2: ยืนยัน 6 รายการที่แก้เพิ่มผ่านหมด + ของเดิม 23 ข้อไม่ถูกกระทบ และพบ regression 1 ตัว (void บิลซื้อ legacy) → แก้แล้ว ยืนยันด้วย simulation 4 เคส (สคริปต์ท้ายรายงาน)
- parse ผ่าน (esbuild) ทุกรอบ

## ผล verify รายข้อ (รอบ 1 — 26 findings เดิม)

- [FIXED] #0 A/R receipt / A/P payment posts no journal
- [FIXED] #1 commitPurchase pre-rounds FX unit cost
- [FIXED] #2 Batch settlement fee credits 5080 with unposted proceeds
- [FIXED] #3 commitPurchase debit-only entry when 2010 missing
- [FIXED] #4 commitSale missing a1035 fallback drops revenue
- [FIXED] #5 Input-VAT KPI counts voided purchases
- [FIXED] #6 Expenses sumVat counts voided
- [FIXED] #7 Serial-note lines bypass stock guard
- [FIXED] #8 Cancel purchase strips other bills' layers
- [FIXED] #9 Editing a voided bill double-restores stock
- [FIXED] #10 restoreSaleStock uses header cost not consumed cost
- [PARTIAL] #11 Serial receive hides existing qty stock
- [FIXED] #12 Product import qty invisible with FIFO layers
- [FIXED] #13 setLineQty clamps below editCredit / to 0
- [FIXED] #14 Load path drops 6 slices, autosave erases them
- [FIXED] #15 Save-effect deps omit 6 slices
- [FIXED] #16 exportAll omits 4 slices, restore wipes them
- [FIXED] #17 Autosave failure silently swallowed
- [PARTIAL] #18 32-bit FNV password hash brute-forceable
- [PARTIAL] #19 Level gate is client-side; data cleartext
- [FIXED] #20 Anthropic key persisted in localStorage
- [FIXED] #21 Phantom a5090/a1170 unbalance trial balance
- [FIXED] #22 Duty base excludes freight (CIF)
- [FIXED] #23 Number() zeroes comma-formatted amounts
- [FIXED] #24 Per-bill allocation does not sum to deposit
- [FIXED] #25 Printed VAT label rounds to whole percent

หมายเหตุ PARTIAL ทั้งสามได้รับการแก้เพิ่มในรอบ 2 (ดูด้านล่าง) ยกเว้นส่วนที่เป็นข้อจำกัดโดยธรรมชาติของแอป client-side (ข้อ #19)

## รอบ 2 — regression fixes + partial upgrades

- [FIXED] 1. Cancel-purchase removes stock for serial lines received as FIFO layers (residual pulled from this bill's srcId layers)
- [FIXED] 2. restoreAll guard moved off the function to user entry points (system flows work at any level)
- [FIXED] 3. Cancel-purchase legacy qty-only products (no layers) fall back to direct qty subtraction
- [FIXED] 4. voidSale reverses A/R receipt journals; purchase-void reverses A/P payment journals
- [FIXED] 5. commitPending no longer flips tracksSerial on a qty product with stock; attachSerialToProduct keeps tracksSerial false when qty stock exists
- [FIXED] 6. signIn/acctSignIn upgrade legacy FNV pwHash to PBKDF2 v2 on successful login
- [FIXED] Earlier 23 FIXED verdicts not undone by round-2 edits (spot-check of touched functions)

## Regression ตัวสุดท้าย (แก้หลังรอบ 2)

- **void บิลซื้อ legacy ไม่ตัดสต็อกเมื่อสินค้ามี layer ติด srcId**: เปลี่ยน fallback เป็น "ลบจาก layer ที่ไม่ติดแท็กเท่านั้น (ใหม่สุดก่อน) และไม่แตะ layer ของบิลอื่น" + ประทับ `layered: true` บนบิลซื้อรุ่นใหม่ (แท็ก srcId คงอยู่ข้ามการขายแล้ว เพราะ consumeFIFO เก็บ srcId ไว้) — บิล layered ที่ไม่มี layer เหลือ = ขายไปแล้ว ไม่ลบอะไรเพิ่ม

สคริปต์ยืนยัน (รันซ้ำได้):

```sh
node -e "$(cat <<EOF
function cancelQty(layersIn, rec, qtyBack, qtyField){let layers=[...layersIn.map(l=>({...l}))];if(!layers.length)return{layers,qty:Math.max(0,qtyField-qtyBack)};let toRemove=qtyBack;const hasOwn=layers.some(l=>l.srcId===rec.id);for(let k=0;k<layers.length&&toRemove>0;k++){if(layers[k].srcId!==rec.id)continue;const take=Math.min(layers[k].qty,toRemove);layers[k]={...layers[k],qty:layers[k].qty-take};toRemove-=take;}if(!hasOwn&&!rec.layered){for(let k=layers.length-1;k>=0&&toRemove>0;k--){if(layers[k].srcId!=null)continue;const take=Math.min(layers[k].qty,toRemove);layers[k]={...layers[k],qty:layers[k].qty-take};toRemove-=take;}}const removed=qtyBack-toRemove;layers=layers.filter(l=>(Number(l.qty)||0)>0);return{layers,qty:Math.max(0,qtyField-removed)};}
console.log(JSON.stringify([cancelQty([{qty:10},{qty:5,srcId:"B"}],{id:"A"},10,15),cancelQty([{qty:7}],{id:"B",layered:true},3,7),cancelQty([{qty:5,srcId:"C"},{qty:2,srcId:"B"}],{id:"B",layered:true},10,7),cancelQty([],{id:"A"},4,10)]));
EOF
)"
```

ผลที่คาด: [layers B=5 คงอยู่/qty 5], [ไม่ลบอะไร/qty 7], [ลบเฉพาะของ B/qty 5], [qty 6]

## ข้อจำกัดที่เหลือ (ยอมรับโดยแจ้งไว้ — แก้ไม่ได้ในสถาปัตยกรรม client-side)

1. **#19 authz**: เพิ่ม guard ระดับ action แล้ว (deleteSale/restoreAll-entry/clearAll/loadSample/user-mgmt) แต่ข้อมูล cost/profit และ flag `auth.enabled` ยังอยู่ใน JSON ฝั่ง client ที่ผู้ใช้เครื่องแก้ได้เอง — ต้องมี backend จริงจึงบังคับได้สมบูรณ์ (ตรงกับหมายเหตุในแอปเรื่อง "ตอนขึ้นเซิร์ฟเวอร์จริง")
2. **#18 รหัสผ่านเก่า**: hash เก่า (FNV) จะถูกอัปเกรดเป็น PBKDF2 อัตโนมัติเมื่อ login สำเร็จครั้งถัดไป — ผู้ใช้ที่ไม่เคย login อีกเลยจะยังถือ hash เก่าอยู่
3. **บิลขายที่บันทึกก่อนอัปเดต** ไม่มีข้อมูล `sale.fifo` — การ void/แก้บิลเก่าใช้วิธีคืนสต็อกแบบเดิม (ต้นทุนหัวบิล) เฉพาะบิลเก่าเท่านั้น
4. **.html build เก่ายังมีบั๊กครบทุกข้อ** — ต้อง rebuild จากซอร์สที่แก้แล้ว
