# รายงานตรวจสอบ accounting-app-peak-v1.6.jsx (Thai Color)

- ขอบเขต: 2 ไฟล์ในซิป — `accounting-app-peak-v1.6.jsx` (ซอร์ส, 8,722 บรรทัด) และ `thaicolor-app-peak-v1.6.html` (build ของแอปเดียวกัน)
- วิธีตรวจ: parse check (esbuild) + workflow 7 agents (finder 6 เลนส์ + batch verifier 1 ตัวต่อ findings ทั้งชุด)
- ผล: findings ดิบ 31 → ซ้ำ 5 → **ยืนยัน 26** (critical 1, high 5, medium 9, low 11) — ทุกข้อเชิงตัวเลขมีสคริปต์ node รันซ้ำได้แนบท้ายข้อ

## เช็คพื้นฐาน

- Syntax: ผ่าน (esbuild แปลง JSX ได้ ไม่มี error)
- HTML build: self-contained, ตรงกับซอร์ส v1.6, ไม่มี API key ฝังในไฟล์; external ที่แตะมีแค่ fonts.googleapis.com และ api.anthropic.com (ฟีเจอร์สแกนเอกสาร ผู้ใช้กรอกคีย์เอง)
- Model ID `claude-sonnet-4-6` ในฟีเจอร์ AI: ถูกต้องตาม Messages API

## Findings (เรียงตามความรุนแรง)

### 1. [CRITICAL] window.storage load path never restores history, advances, custDeposits, payees, pendingSales, hsTable — the very next autosave then overwrites the stored copy with empty arrays, permanently destroying those six slices on every reload

- เลนส์: persistence/ข้อมูล · บรรทัด ~878
- โค้ด: `if (d.lang) setLang(d.lang === "both" ? "th" : d.lang);             if (typeof d.vatRate === "number" && d.vatRate > 0) setVatRate(d.vatRate);           }         }`
- สถานการณ์ที่พัง: The save effect (line 901) persists 28 keys including history, advances, custDeposits, payees, pendingSales, hsTable. But the load block for the window.storage backend (lines 857-878) only calls setters for 22 of them — there is no setHistory/setAdvances/setCustDeposits/setPayees/setPendingSales/setHsTable call anywhere in that branch (they exist only in restoreAll, line 2109-2114, used by the file:// IndexedDB fallback at line 883). Concrete flow on the hosted platform: user parks a POS sale in pendingSales (stock already deducted), records a supplier T/T advance (booked to asset 1170), reloads the page → those slices load as []. Then the save effect fires on any state change and writes the payload with the empty arrays back to window.storage, so the audit trail, supplier prepayments, customer deposits, saved payees, parked sales, and the HS-duty lookup are irrecoverably erased while the stock deduction and journal entries they referenced remain.
- ผล verify: Load block lines 857-878 has no setHistory/setAdvances/setCustDeposits/setPayees/setPendingSales/setHsTable; save payload (line 901) includes them; save effect fires on loaded flip and overwrites store with empty arrays. Repro lists all 6 as saved-but-never-restored.
- สคริปต์รันซ้ำ:

```sh
node -e "const saved=['accounts','entries','products','categories','movements','customers','banks','sales','purchases','expenses','docs','payments','apPayments','assets','whts','history','advances','custDeposits','payees','pendingSales','hsTable','profile','auth','paperBoards','lang','vatRate','paperBoardsV','paperStockV']; /* keys written at line 901 */ const restored=['accounts','entries','products','categories','paperBoardsV','paperStockV','movements','customers','expenses','docs','payments','apPayments','assets','whts','banks','sales','purchases','profile','auth','paperBoards','lang','vatRate']; /* setters called lines 857-878 */ console.log('saved but never restored:', saved.filter(k=>!restored.includes(k)));"
```

### 2. [HIGH] Save effect dependency array omits categories, auth, paperBoards, vatRate, paperBoardsV, paperStockV — changes to only these slices are never persisted and never set the dirty flag, so closing the tab silently loses them

- เลนส์: persistence/ข้อมูล · บรรทัด ~917
- โค้ด: `}, [accounts, entries, products, movements, customers, banks, sales, purchases, expenses, docs, payments, apPayments, assets, whts, history, advances, custDeposits, payees, pending`
- สถานการณ์ที่พัง: The payload built at line 901 includes categories, auth, paperBoards, vatRate, paperBoardsV, paperStockV, but none of the six appear in the effect deps at line 917. saveUser/deleteUser/setAuthEnabled (lines 1199-1212) mutate only auth; addCategory/deleteCategory (1342-1343) mutate only categories; savePaperBoards/updatePaperCount (1215-1226) mutate only paperBoards; saveVat (line 8433) calls only setVatRate. Concrete flow: admin creates the user accounts and enables the login gate, or counts paper stock into a board, or changes VAT to 10%, then closes the tab without touching any other slice → the effect never re-ran, nothing was written to window.storage/IndexedDB/linked file, and markDirty() was never called so the beforeunload guard (line 922, checks dirtyRef) does not even warn. On next open the users/gate/paper counts/VAT rate are back to the previous state.
- ผล verify: Save effect deps (line 917) omit categories,auth,paperBoards,vatRate,paperBoardsV,paperStockV that are in payload (line 901); only persistence writer. markDirty never fires so beforeunload guard silent. Repro confirms the 6 missing deps.
- สคริปต์รันซ้ำ:

```sh
node -e "const payloadKeys=['accounts','entries','products','categories','movements','customers','banks','sales','purchases','expenses','docs','payments','apPayments','assets','whts','history','advances','custDeposits','payees','pendingSales','hsTable','profile','auth','paperBoards','lang','vatRate','paperBoardsV','paperStockV']; const deps=['accounts','entries','products','movements','customers','banks','sales','purchases','expenses','docs','payments','apPayments','assets','whts','history','advances','custDeposits','payees','pendingSales','hsTable','profile','lang']; console.log('in payload but not in deps (change never triggers save):', payloadKeys.filter(k=>!deps.includes(k)));"
```

### 3. [HIGH] Recording an AR receipt or AP payment posts no journal entry, so GL Accounts Receivable/Payable and Cash/Bank are permanently misstated after any settlement of a credit sale or credit purchase

- เลนส์: บัญชี/journal · บรรทัด ~1412
- โค้ด: `const addPayment = (p) => setPayments((prev) => [...prev, p]);`
- สถานการณ์ที่พัง: Credit sale of 1,070 THB posts Dr 1030 A/R 1,070 / Cr 4010 1,000 / Cr 2100 70 (commitSale lines 1509-1512). The customer later pays in full via Receivables > recordPay (line 5826 calls onAddPayment -> addPayment), which only appends to the `payments` array — no entry is pushed to `entries` and there is no other code path that journals it (same for apPayments, line 1414). The GL account 1030 stays at 1,070 forever and bank/cash is never debited, while the Receivables page shows the bill fully paid. Trial balance, balance sheet and dashboard (all computed from `entries`) permanently overstate A/R and understate cash; mirror-image for A/P (2010 credited at purchase, never debited on payment).
- ผล verify: addPayment/addApPayment (lines 1412-1415) only setPayments/setApPayments; recordPay (line 5826) calls onAddPayment with no addEntry. Credit sale posts Dr1030 (lines 1509-1512) but the receipt never journals cash/AR. Repro shows GL 1030 stuck at 1070 while subledger shows 0 outstanding. Genuine GL misstatement, not intentional for a TB-producing app.
- สคริปต์รันซ้ำ:

```sh
node -e 'const entries=[];entries.push({lines:[{a:"a1030",debit:1070,credit:0},{a:"a4010",debit:0,credit:1000},{a:"a2100",debit:0,credit:70}]});/* recordPay -> addPayment (line 1412): setPayments only, no entry pushed */const payments=[{refId:"s1",amount:1070}];const bal1030=entries.reduce((s,e)=>s+e.lines.filter(l=>l.a==="a1030").reduce((x,l)=>x+l.debit-l.credit,0),0);console.log("app GL A/R after full receipt:",bal1030,"correct:",0,"subledger outstanding:",1070-payments[0].amount);'
```

### 4. [HIGH] Editing a voided (cancelled) sale restores its stock a second time — commitSale never checks orig.voided and InvoiceModal offers Edit on cancelled bills

- เลนส์: สต็อก · บรรทัด ~1451
- โค้ด: `const srcProducts = orig ? restoreSaleStock(products, orig) : products;`
- สถานการณ์ที่พัง: voidSale (line 1527) already restores the bill's stock. BillsList's 'Open' button works on voided bills (line 4878) and InvoiceModal's Edit button has no voided guard (line 7745: {onEdit && <button ... onEdit(sale)}), unlike the list row (line 4880). Editing a voided bill and re-issuing runs commitSale, whose editingId path restores the original's stock AGAIN before re-cutting. Example: 10 on hand, sell 5, void (back to 10), edit the voided bill down to qty 3 and re-issue: stock becomes 12 — more units than ever existed. Serial products get their voided-bill serials flipped back 'in' then 'sold' again while stampVer (line 1306) keeps the bill flagged voided, and the void's reversal journal is left dangling after line 1450 deletes the original journal.
- ผล verify: commitSale line 1451 restoreSaleStock(orig) with no orig.voided check; voidSale (line 1527) already restored; InvoiceModal Edit (line 7745) has no voided guard unlike list row (line 4880). Repro: void then edit-reissue at qty3 -> 12 units when only 10 existed.
- สคริปต์รันซ้ำ:

```sh
node -e 'function restoreSaleStock(products,sale){const items=sale.items;return products.map(p=>{const its=items.filter(l=>l.productId===p.id);if(!its.length)return p;const qtyBack=its.reduce((a,l)=>a+(Number(l.qty)||0),0);const unitCost=(its[0]&&Number(its[0].cost))?Number(its[0].cost):(Number(p.cost)||0);const layers=[...(p.layers||[])];if(qtyBack>0)layers.unshift({qty:qtyBack,unitCost});return{...p,layers,qty:(Number(p.qty)||0)+qtyBack};});} function consumeFIFO(layers,qty){let need=qty,cogs=0;const out=[];for(const L of layers){if(need<=0){out.push({qty:L.qty,unitCost:L.unitCost});continue;}const take=Math.min(L.qty,need);cogs+=take*L.unitCost;const rem=L.qty-take;need-=take;if(rem>0)out.push({qty:rem,unitCost:L.unitCost});}return{layers:out,cogs};} let products=[{id:"p1",cost:10,qty:10,layers:[{qty:10,unitCost:10}]}]; const sale={items:[{productId:"p1",qty:5,cost:10}]}; let r=consumeFIFO(products[0].layers,5);products=[{...products[0],layers:r.layers,qty:r.layers.reduce((s,l)=>s+l.qty,0)}]; products=restoreSaleStock(products,sale); console.log("after void:",products[0].qty); products=restoreSaleStock(products,sale); r=consumeFIFO(products[0].layers,3);products=[{...products[0],layers:r.layers,qty:r.layers.reduce((s,l)=>s+l.qty,0)}]; console.log("after re-issuing voided bill at qty 3:",products[0].qty,"(only 10 units ever existed)");'
```

### 5. [HIGH] Cancelling a partially-sold purchase removes other purchases' FIFO layers via the unconditional newest-first fallback loop

- เลนส์: สต็อก · บรรทัด ~1945
- โค้ด: `// legacy bills (no srcId): fall back to newest-first removal           for (let k = layers.length - 1; k >= 0 && toRemove > 0; k--) {             const take = Math.min(layers[k].q`
- สถานการณ์ที่พัง: deletePurchase removes qtyBack (the bill's FULL original qty) from layers: first the bill's own srcId layers, then a fallback loop that runs whenever toRemove > 0 — including when the bill's layers were merely partially sold, not legacy. Example: bill B delivered 10 (8 already sold, 2 left in its layer), bill C later delivered 5 (untouched). Cancel bill B: srcId loop removes B's 2, fallback removes C's 5, leaving on-hand 0 (qty field Math.max(0,7-10)=0 at line 1951 agrees). Bill C's 5 physical units vanish from stock silently.
- ผล verify: deletePurchase (lines 1934-1949): qtyBack=full bill qty; srcId loop removes bill's own, then unconditional newest-first fallback loop removes any remaining. Repro: cancel B removes C's 5 units, on-hand 0 (should be 5).
- สคริปต์รันซ้ำ:

```sh
node -e 'function cancelLayers(layersIn,recId,qtyBack){let layers=layersIn.map(l=>({...l}));let toRemove=qtyBack; for(let k=0;k<layers.length&&toRemove>0;k++){if(layers[k].srcId!==recId)continue;const take=Math.min(layers[k].qty,toRemove);layers[k]={...layers[k],qty:layers[k].qty-take};toRemove-=take;} for(let k=layers.length-1;k>=0&&toRemove>0;k--){const take=Math.min(layers[k].qty,toRemove);layers[k]={...layers[k],qty:layers[k].qty-take};toRemove-=take;} return layers.filter(l=>(Number(l.qty)||0)>0);} const layers=[{qty:2,unitCost:10,srcId:"B"},{qty:5,unitCost:11,srcId:"C"}]; const after=cancelLayers(layers,"B",10); console.log("layers:",JSON.stringify(after),"on-hand:",after.reduce((s,l)=>s+l.qty,0),"correct: 5 (bill C untouched)");'
```

### 6. [HIGH] exportAll omits custDeposits, payees, pendingSales, hsTable from the manual .json backup, and restoreAll resets those slices to [] — so an export/restore round-trip wipes them

- เลนส์: persistence/ข้อมูล · บรรทัด ~2080
- โค้ด: `const data = { accounts, entries, products, categories, movements, customers, banks, sales, purchases, expenses, docs, payments, apPayments, assets, whts, history, advances, profil`
- สถานการณ์ที่พัง: The autosave payload (line 901) has 4 keys that exportAll's data object lacks: custDeposits, payees, pendingSales, hsTable. restoreAll (lines 2111-2114) does setCustDeposits(Array.isArray(obj.custDeposits) ? obj.custDeposits : []) etc., defaulting missing keys to empty arrays. Concrete flow: user clicks export to get thaicolor-data-*.json as their backup, later restores that file via the settings import (line 8454 → onRestoreData → restoreAll) or via linkDataFile — all customer deposits, saved supplier payees, parked pending sales (whose stock deductions already happened), and the HS-code duty table are replaced with empty arrays even though they existed at export time. The 'full-data backup' therefore does not round-trip, and the user only discovers it after restoring over their live data.
- ผล verify: exportAll data object (line 2080) omits custDeposits,payees,pendingSales,hsTable; restoreAll defaults missing to []. Repro confirms 4 missing keys.
- สคริปต์รันซ้ำ:

```sh
node -e "const payloadKeys=['accounts','entries','products','categories','movements','customers','banks','sales','purchases','expenses','docs','payments','apPayments','assets','whts','history','advances','custDeposits','payees','pendingSales','hsTable','profile','auth','paperBoards','lang','vatRate','paperBoardsV','paperStockV']; const exported=['accounts','entries','products','categories','movements','customers','banks','sales','purchases','expenses','docs','payments','apPayments','assets','whts','history','advances','profile','auth','paperBoards','lang','vatRate','paperBoardsV','paperStockV']; const missing=payloadKeys.filter(k=>!exported.includes(k)); console.log('missing from export:', missing); const obj=Object.fromEntries(exported.map(k=>[k,[1]])); console.log('after restoreAll, custDeposits =', Array.isArray(obj.custDeposits)?obj.custDeposits:[]);"
```

### 7. [HIGH] Stock guard excludes serial-note cart lines, allowing silent oversell of qty-tracked products (stock absorbed to 0, COGS understated)

- เลนส์: สต็อก · บรรทัด ~3679
- โค้ด: `const cartQtyForProduct = (pid) => cartRef.current.filter((l) => l.productId === pid && !l.serial).reduce((s, l) => s + (Number(l.qty) || 0), 0);`
- สถานการณ์ที่พัง: A qty-tracked product with serial history (serialHistIds) opens the serial picker; each 'Save & add' calls addQtyLineSerialNote (line 3689), which creates a cart line with l.serial set. cartQtyForProduct filters out every line with l.serial, so both the add-time guard (line 3692: cartQtyForProduct(p.id)+1 > oh) and the confirmSale guard (line 3827) count these lines as zero. With 1 unit on hand you can add 5 serial-note lines and commit; commitSale's qtySold (line 1462) counts ALL lines, consumeFIFO (line 157) silently caps at available stock, so 5 units are billed, stock hits 0 (4 phantom units sold), and COGS covers only 1 unit.
- ผล verify: cartQtyForProduct (line 3679) filters !l.serial; addQtyLineSerialNote (line 3689) sets l.serial, so guards at 3692 and confirmSale 3827 count these as 0. Repro: 5 serial-note lines added over oh=1, not blocked, billed 5 COGS 100 stock 0.
- สคริปต์รันซ้ำ:

```sh
node -e 'function consumeFIFO(layers,qty){let need=qty,cogs=0;const out=[];for(const L of layers){if(need<=0){out.push({qty:Number(L.qty)||0,unitCost:Number(L.unitCost)||0});continue;}const take=Math.min(Number(L.qty)||0,need);cogs+=take*(Number(L.unitCost)||0);const rem=(Number(L.qty)||0)-take;need-=take;if(rem>0)out.push({qty:rem,unitCost:Number(L.unitCost)||0});}return{layers:out,cogs};} const cart=[];const oh=1; const cartQtyForProduct=()=>cart.filter(l=>!l.serial).reduce((s,l)=>s+(Number(l.qty)||0),0); for(const sn of["SN1","SN2","SN3","SN4","SN5"]){ if(!(cartQtyForProduct()+1>oh)) cart.push({productId:"p1",serial:sn,qty:1,price:500}); } console.log("lines added:",cart.length,"confirm blocked?",cartQtyForProduct()>oh); const qtySold=cart.reduce((s,l)=>s+l.qty,0); const r=consumeFIFO([{qty:1,unitCost:100}],qtySold); console.log("billed:",qtySold,"COGS:",r.cogs,"(correct 500 if stock existed) stock left:",r.layers.reduce((s,l)=>s+l.qty,0));'
```

### 8. [MEDIUM] restoreSaleStock restores the FIFO layer at the sale line's header cost, not the cost actually consumed — void inflates inventory value and every edit silently changes COGS

- เลนส์: สต็อก · บรรทัด ~77
- โค้ด: `const unitCost = (its[0] && Number(its[0].cost)) ? Number(its[0].cost) : (Number(p.cost) || 0);`
- สถานการณ์ที่พัง: Cart lines store cost as the product HEADER cost p.cost (lines 3684/3693/3703 — the newest lot's cost, updated at line 1788 on each purchase), while the sale consumed FIFO layers at their own unitCost. Example: layer 5@10 THB, header cost 12. Sale posts COGS 50; void restores a layer 5@12 → stock value 60, but the reversing journal only moves 50 back to inventory: the stock report and GL inventory account diverge by 10. Worse, editing a bill (commitSale line 1451 restore + re-cut) re-consumes that 12-baht layer first, so re-saving the SAME bill unchanged reposts COGS as 60 instead of 50. It also uses its[0].cost for all of a product's lines even when lines carry different costs.
- ผล verify: restoreSaleStock line 77 uses its[0].cost (header cost) not FIFO-consumed cost. Repro: layer 5@10 consumed COGS 50, void restores 5@12 -> value 60 phantom 10; re-save COGS 60 vs 50.
- สคริปต์รันซ้ำ:

```sh
node -e 'function restoreSaleStock(products,sale){const items=sale.items;return products.map(p=>{const its=items.filter(l=>l.productId===p.id);if(!its.length)return p;const qtyBack=its.reduce((a,l)=>a+(Number(l.qty)||0),0);const unitCost=(its[0]&&Number(its[0].cost))?Number(its[0].cost):(Number(p.cost)||0);const layers=[...(p.layers||[])];if(qtyBack>0)layers.unshift({qty:qtyBack,unitCost});return{...p,layers,qty:(Number(p.qty)||0)+qtyBack};});} function consumeFIFO(layers,qty){let need=qty,cogs=0;const out=[];for(const L of layers){if(need<=0){out.push({qty:L.qty,unitCost:L.unitCost});continue;}const take=Math.min(L.qty,need);cogs+=take*L.unitCost;const rem=L.qty-take;need-=take;if(rem>0)out.push({qty:rem,unitCost:L.unitCost});}return{layers:out,cogs};} let p={id:"p1",cost:12,qty:5,layers:[{qty:5,unitCost:10}]}; const {layers,cogs}=consumeFIFO(p.layers,5); p={...p,layers,qty:0}; const sale={items:[{productId:"p1",qty:5,cost:12}]}; p=restoreSaleStock([p],sale)[0]; const value=p.layers.reduce((s,l)=>s+l.qty*l.unitCost,0); console.log("COGS at sale:",cogs,"inventory value after void:",value,"phantom:",value-cogs); console.log("COGS if bill re-saved unchanged:",consumeFIFO(p.layers,5).cogs,"vs original",cogs);'
```

### 9. [MEDIUM] Primary autosave failure (window.storage.set, e.g. QuotaExceededError from the base64 logo in profile) is swallowed with no user-visible detection, so saves are silently lost

- เลนส์: persistence/ข้อมูล · บรรทัด ~909
- โค้ด: `await window.storage.set(STORAGE_KEY, JSON.stringify(payload));         }       } catch (e) { /* ignore */ }`
- สถานการณ์ที่พัง: The payload includes profile.logo, a base64 data-URL set from an uploaded image, plus every transaction ever recorded, so JSON.stringify(payload) can exceed the backend's quota. When window.storage.set rejects (quota or any other error), the catch at line 909 discards it: no state is set, no alert, and the dirty indicator is not affected because markDirty/markSaved (lines 840-841, 948) only track the optional linked-file path — a user with no linked file gets no signal at all. Every subsequent autosave fails the same way, so the user keeps entering sales for days while nothing is persisted, and the loss is only discovered after a reload restores the last successful snapshot. The IndexedDB fallback write at line 913 has the same silent-swallow pattern (idbSet itself is wrapped in try{...}catch(e){} at line 774).
- ผล verify: window.storage.set wrapped in try/catch{ignore} at line 909; markDirty/markSaved only track linked-file path (lines 840-841,948); idbSet self-swallows (line 774). Quota/errors silently lost, no user signal. Code-evident.

### 10. [MEDIUM] settleMarketplaceBatch computes the fee as clearedTotal − received over the FULL deposit, so a batch mixing posted and unposted bills credits marketplace-fee expense (5080) with the unposted bills' proceeds instead of debiting the actual fee

- เลนส์: บัญชี/journal · บรรทัด ~1718
- โค้ด: `const feePosted = round2(clearedTotal - received); // fee on the posted portion`
- สถานการณ์ที่พัง: Level-3 user parks one marketplace sale with postJournal off (500 THB, no journalId) and one with it on (1,000 THB, journalId set); the platform pays both in one lump: actual fee 150, received = 1,350. clearedTotal (posted bills only, line 1717) = 1,000, so feePosted = 1,000 − 1,350 = −350 and lines 1721-1722 CREDIT 5080 by 350. The correct posted-portion fee per the code's own comment is a DEBIT of ~100. The entry balances (Dr bank 1,350 / Cr 1035 1,000 / Cr 5080 350) but marketplace-fee expense is misstated by 450 and the off-book sale's revenue enters the GL as negative expense.
- ผล verify: Line 1717-1718: clearedTotal filters journalId but feePosted=clearedTotal-received where received is full deposit; sale.journalId=null when postJournal false (line 1490), and picked (line 1700) has no journalId filter. Repro: feePosted -350 -> Cr 5080 350 instead of Dr ~100.
- สคริปต์รันซ้ำ:

```sh
node -e 'const round2=n=>Math.round((Number(n)||0)*100)/100;const picked=[{total:1000,journalId:"j1"},{total:500,journalId:null}];const actualFee=150;const received=1500-actualFee;const clearedTotal=round2(picked.filter(s=>s.journalId).reduce((a,s)=>a+s.total,0));const feePosted=round2(clearedTotal-received);console.log("app feePosted:",feePosted,"-> Cr 5080",-feePosted);console.log("correct posted-portion fee: Dr 5080",round2(actualFee*(1000/1500)));'
```

### 11. [MEDIUM] commitPurchase rounds the FX unit cost to 2 decimals before multiplying by qty, so the booked goods amount, inventory cost and rec.totalThb can differ by baht-level amounts from the supplier invoice and from the totals the Purchases screen displayed for confirmation

- เลนส์: บัญชี/journal · บรรทัด ~1752
- โค้ด: `const unitThb = round2(unitFx * rate);       return { ... lineThb: round2(qty * unitThb), ... };`
- สถานการณ์ที่พัง: FX purchase: qty 500, unit cost CNY 1.234, rate 4.876. The Purchases UI (line 6793: `lineThb = (l) => round2(effQty(l) * (Number(l.unitCostFx) || 0) * rate)`) shows the line as 3,008.49 and computes VAT 210.59 from it. commitPurchase re-derives the same line as round2(500 * round2(1.234*4.876)) = round2(500*6.02) = 3,010.00 — 1.51 THB higher. The journal debits inventory 3,010.00 and the stored bill total becomes 3,220.59 while the screen the user confirmed showed 3,219.08; inventory layers, the input-VAT base vs goods relationship, and AP/cash-out all carry the drift. The entry still balances internally, so the error is invisible in the trial balance.
- ผล verify: Line 1752 rounds unitThb=round2(unitFx*rate) then lineThb=round2(qty*unitThb); UI (line 6793) does round2(qty*unitFx*rate). Repro: booked 3010 vs UI 3008.49, diff 1.51. Preview/commit divergence real.
- สคริปต์รันซ้ำ:

```sh
node -e 'const round2=n=>Math.round((Number(n)||0)*100)/100;const qty=500,unitFx=1.234,rate=4.876;const unitThb=round2(unitFx*rate);const booked=round2(qty*unitThb);const ui=round2(qty*unitFx*rate);const vat=round2(ui*0.07);console.log("booked line:",booked,"UI/invoice line:",ui,"diff:",round2(booked-ui));console.log("booked totalThb:",round2(booked+vat),"UI-shown total:",round2(ui+vat));'
```

### 12. [MEDIUM] Receiving serials on a previously qty-tracked product flips tracksSerial without converting existing layers/qty, hiding all prior stock from on-hand and value

- เลนส์: สต็อก · บรรทัด ~1782
- โค้ด: `np = { ...np, tracksSerial: true, serials: [...(np.serials || []), ...add] };`
- สถานการณ์ที่พัง: productOnHand (line 96) counts ONLY in-stock serials once tracksSerial is true, ignoring layers/qty. Both commitPurchase's serial branch (line 1782, any purchase line with useSerial ticked) and the Inventory receive flow's commitPending (line 3191, the 'Receive with individual serials' checkbox at line 3447 is offered on every product) set tracksSerial: true while leaving the product's existing FIFO layers and qty in place. A qty product with 5 units on hand that receives 2 serialised units drops to on-hand 2 / value 24 instead of 7 / 74 — 5 units and their cost vanish from stock, the stock report (line 7135 filters productOnHand > 0), and the paper boards. Only attachSerials (line 3223) does the conversion correctly.
- ผล verify: Line 1782 sets tracksSerial:true keeping existing layers/qty; productOnHand (line 96) then counts only serials. Repro: 5-unit product +2 serials -> on-hand 2/value 24 instead of 7/74.
- สคริปต์รันซ้ำ:

```sh
node -e 'const productOnHand=p=>p.tracksSerial?(p.serials||[]).filter(s=>s.status==="in").length:(Array.isArray(p.layers)&&p.layers.length?p.layers.reduce((s,l)=>s+(Number(l.qty)||0),0):Number(p.qty)||0); const productValue=p=>{if(p.tracksSerial)return(p.serials||[]).filter(s=>s.status==="in").reduce((s,x)=>s+(Number(x.cost!=null?x.cost:p.cost)||0),0);if(Array.isArray(p.layers)&&p.layers.length)return p.layers.reduce((s,l)=>s+(Number(l.qty)||0)*(Number(l.unitCost)||0),0);return productOnHand(p)*(Number(p.cost)||0);}; let p={id:"x",tracksSerial:false,qty:5,cost:10,layers:[{qty:5,unitCost:10}],serials:[]}; console.log("before: on-hand",productOnHand(p),"value",productValue(p)); p={...p,tracksSerial:true,serials:[{serial:"A",status:"in",cost:12},{serial:"B",status:"in",cost:12}]}; console.log("after receiving 2 serials: on-hand",productOnHand(p),"value",productValue(p),"expected 7 / 74");'
```

### 13. [MEDIUM] Excel/CSV product import adds quantity only to the legacy qty field, so imported units are invisible for any product that already has FIFO layers and are erased by the next sale

- เลนส์: สต็อก · บรรทัด ~2058
- โค้ด: `out[i] = { ...out[i], qty: (Number(out[i].qty) || 0) + (Number(np.qty) || 0), cost: np.cost || out[i].cost, price: np.price || out[i].price };`
- สถานการณ์ที่พัง: importProducts merges an incoming row into an existing product (matched by barcode) by incrementing qty, but never touches layers. productOnHand (line 96) and the sale engines (lines 1463-1465) use layers whenever layers.length > 0, so for any product that has ever been received via purchase/receive (which create layers), the imported quantity never shows up on hand, in stock value, or as sellable stock — the import UI still reports success (line 4532). The next sale then overwrites qty from the layer sum (line 1468), permanently discarding the imported units: product with layers [5@10] + import of 3 → on-hand stays 5, and after selling 1 the qty field becomes 4, not 7.
- ผล verify: Line 2058 merges qty only, never layers; productOnHand/sale engines use layers when present. Repro: layers[5@10]+import 3 -> on-hand stays 5, qty resynced to 4 after selling 1.
- สคริปต์รันซ้ำ:

```sh
node -e 'const productOnHand=p=>Array.isArray(p.layers)&&p.layers.length?p.layers.reduce((s,l)=>s+(Number(l.qty)||0),0):Number(p.qty)||0; let existing={id:"x",barcode:"123",qty:5,cost:10,layers:[{qty:5,unitCost:10}]}; existing={...existing,qty:(Number(existing.qty)||0)+3}; console.log("qty field:",existing.qty,"on-hand used everywhere:",productOnHand(existing),"expected 8"); function consumeFIFO(layers,qty){let need=qty,cogs=0;const out=[];for(const L of layers){if(need<=0){out.push({qty:L.qty,unitCost:L.unitCost});continue;}const take=Math.min(L.qty,need);cogs+=take*L.unitCost;need-=take;const rem=L.qty-take;if(rem>0)out.push({qty:rem,unitCost:L.unitCost});}return{layers:out,cogs};} console.log("qty after selling 1 (line 1468 resync):",consumeFIFO(existing.layers,1).layers.reduce((s,l)=>s+l.qty,0),"— imported 3 gone");'
```

### 14. [MEDIUM] setLineQty clamps to current on-hand without editCredit, silently rewriting an edited bill's line qty — down to 0, violating its own minimum of 1

- เลนส์: สต็อก · บรรทัด ~3813
- โค้ด: `let qty = Math.max(1, Math.floor(num(q)) || 1);       if (qty > oh) qty = oh;`
- สถานการณ์ที่พัง: During bill editing, stock is NOT restored (comment at line 1680); the freed quantity is tracked in editCredit and correctly added in confirmSale's guard (line 3827: productOnHand(p) + (editCredit[p.id] || 0)), but setLineQty clamps to bare productOnHand. Editing a bill whose 5 units consumed all remaining stock (on-hand now 0): touching the qty field turns the line into qty 0 (the Math.max(1,...) floor is defeated by the subsequent clamp), and re-issuing commits a 0-qty line — the bill silently loses those 5 units of revenue/COGS while restoreSaleStock inside commitSale puts all 5 back into stock. With on-hand 2 and editCredit 5, typing 5 silently becomes 2.
- ผล verify: setLineQty lines 3812-3813: Math.max(1,...) then clamp to oh ignoring editCredit. Repro: oh0 -> 0 (defeats min 1); oh2 editCredit5 typing 5 -> 2.
- สคริปต์รันซ้ำ:

```sh
node -e 'const num=v=>{const n=parseFloat(String(v).replace(/,/g,""));return isNaN(n)?0:n;}; const setLineQty=(q,oh)=>{let qty=Math.max(1,Math.floor(num(q))||1);if(qty>oh)qty=oh;return qty;}; console.log("editing 5-unit bill, on-hand 0 (editCredit 5 ignored), user types 5 ->",setLineQty("5",0)); console.log("on-hand 2, editCredit 5, user types 5 ->",setLineQty("5",2),"(should stay 5)");'
```

### 15. [MEDIUM] Purchase-entry money fields (unit cost, freight, manual VAT, fee) are parsed with raw Number() instead of the app's comma-stripping helpers, so a value typed with thousands separators like "1,115.50" silently becomes 0

- เลนส์: ตัวเลข/FX · บรรทัด ~6793
- โค้ด: `const lineThb = (l) => round2(effQty(l) * (Number(l.unitCostFx) || 0) * rate);`
- สถานการณ์ที่พัง: User types unit cost "1,115.50" or freight "1,200" into the purchase form (both are free-text inputs with inputMode=decimal; paste and desktop typing allow commas). Number("1,115.50") is NaN, so `|| 0` turns it into 0: the line books at zero cost, stock is received with unit cost consisting only of duty/freight allocation, and freight "1,200" silently drops to 0 in landedExtra (line 6802) with no error. Everywhere else the app deliberately strips commas — the global num() helper at line 86, the sale price parser at line 5501, the landed-cost adjust dialog at line 4969 — so purchases are inconsistently the one place where a comma zeroes the amount.
- ผล verify: unitCostFx input (line 6968) is free-text inputMode=decimal storing raw string; lineThb (line 6793) uses Number()||0, not num() (line 86). Repro: '1,115.50'->0, '1,200'->0. Commas reachable via paste/desktop. Confirmed.
- สคริปต์รันซ้ำ:

```sh
node -e 'const uiParse=v=>Number(v)||0;/*lines 6793,6802,6804,6806*/const appNum=v=>{const n=parseFloat(String(v).replace(/,/g,""));return isNaN(n)?0:n;};/*line 86 helper used elsewhere*/console.log({unitCost_ui:uiParse("1,115.50"),unitCost_expected:appNum("1,115.50"),freight_ui:uiParse("1,200"),freight_expected:appNum("1,200")});'
```

### 16. [MEDIUM] Auto-calculated import duty uses the ex-VAT goods value only, excluding freight/insurance, whereas Thai customs assesses duty on the CIF value — the freight entered on the same bill never enters the duty base, so the suggested per-line duty understates the real duty

- เลนส์: ตัวเลข/FX · บรรทัด ~6800
- โค้ด: `const lineDuty = (l) => round2(lineNetThb(l) * (Number(l.dutyRate) || 0) / 100);`
- สถานการณ์ที่พัง: Import bill: goods 100,000 THB, sea freight 8,000 THB (the app's own adjust dialog calls this field "ค่าเรือ" = ocean freight, line 4950), HS duty rate 5%. The app shows and commits duty = 5,000 THB (line 6800/6801 uses lineNetThb which is goods only; freight from line 6802 is added to landed cost but never to the duty base). Customs computes duty = 5% x CIF = 5% x 108,000 = 5,400 THB — the auto value understates by 400 THB, so landed cost, stock unit cost and the purchase journal are short unless the user notices and hand-corrects each line's dutyThb afterwards. Assumption stated: this claim holds for genuine imports where the freight field is international freight (as the UI wording suggests); for a domestic-freight interpretation the formula would be defensible.
- ผล verify: lineDuty (line 6800) = lineNetThb(goods only) * dutyRate; freight (line 6802) added to landed cost but not duty base. Repro: appDuty 5000 vs CIF 5400, understated 400. Holds under the stated ocean-freight assumption; duty is an editable auto-suggestion.
- สคริปต์รันซ้ำ:

```sh
node -e 'const round2=n=>Math.round(n*100)/100;const goods=100000,freight=8000,rate=5;/*app line 6800: duty base = lineNetThb (goods only)*/const appDuty=round2(goods*rate/100);/*Thai customs: duty = rate x CIF (goods+freight+insurance)*/const cifDuty=round2((goods+freight)*rate/100);console.log({appDuty,cifDuty,understated:round2(cifDuty-appDuty)});'
```

### 17. [LOW] Passwords are hashed with a non-cryptographic, per-app-constant 32-bit FNV-1a, so an admin PIN is recoverable in milliseconds from the cleartext stored hash, enabling privilege escalation on a shared terminal

- เลนส์: security/auth · บรรทัด ~779
- โค้ด: `function hashPw(s) {   let h = 2166136261 >>> 0;   const str = "tc-salt-v1:" + String(s == null ? "" : s);   for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math`
- สถานการณ์ที่พัง: Shared shop PC, multi-user. The full app state — including auth.users[].pwHash — is persisted in cleartext to IndexedDB key "appData" (line 901/913) and written as JSON into the chosen backup folder (line 1037). The 'salt' is a single hardcoded constant ('tc-salt-v1:'), not per-user, and output is only 32 bits (8 hex). A level-1 cashier who can read that one JSON field recovers the level-3 admin's numeric PIN by brute force in ~0.1s, then signs in normally at the login screen as admin, gaining cost/profit, shop settings, and user management. Identical passwords across users also produce identical hashes (equal-password detection). This is the app's actual auth mechanism, not just UI hiding.
- ผล verify: hashPw (line 779) is 32-bit FNV-1a, constant salt; repro recovers 6-digit PIN in ~119ms. Technically true, but code comment (line 778) explicitly declares it a soft-gate obfuscation not real security — intentional for local-first; severity lowered.
- สคริปต์รันซ้ำ:

```sh
function hashPw(s){let h=2166136261>>>0;const str='tc-salt-v1:'+String(s==null?'':s);for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return('00000000'+h.toString(16)).slice(-8);}
const secret='247913';const stored=hashPw(secret);
console.log('stored pwHash =',stored);
let t0=Date.now(),found=null;
for(let n=0;n<1000000;n++){const p=String(n).padStart(6,'0');if(hashPw(p)===stored){found=p;break;}}
console.log('recovered PIN =',found,'in',Date.now()-t0,'ms');
// prints: stored pwHash = 4c843b5d ; recovered PIN = 247913 in ~115 ms
```

### 18. [LOW] Authority levels are enforced only in UI rendering/state, not on data or persistence; cost/profit data and the auth-enabled flag live in the same cleartext store, so the gate is bypassable without any password

- เลนส์: security/auth · บรรทัด ~1184
- โค้ด: `const showCost = acctLevel >= 3; // cost & profit & sales-totals are level-3 only`
- สถานการณ์ที่พัง: showCost / L3_ONLY / visibleTabs (lines 1184, 2161-2163) only decide what is rendered; the underlying products[] cost fields are fully loaded into client state for every level and persisted, so a level-1/2 user reading React state or the persisted 'appData' JSON sees cost and profit despite the level restriction. Separately, the whole sign-in gate keys off auth.enabled, which is saved into that same cleartext appData/backup (line 901); editing it to false (or clearing auth.users) disables the login screen entirely on next load with no password. Acknowledged in-code as a soft gate at line 8580, reported for completeness because in the shared-computer multi-user model it means the level system provides no real confidentiality against a local user. Non-numeric: no repro script.
- ผล verify: showCost=acctLevel>=3 (line 1184) is render-only; cost fields loaded into state and persisted for all levels; auth.enabled in same cleartext store. Accurate but describes acknowledged local-first soft-gate (line 8580); informational.

### 19. [LOW] commitSale's marketplace-sale journal has no "a1035" fallback for the clearing account (unlike the identical code in issueBillsFromPending, line 1621), so with 1035 absent from the chart the entry posts COGS only — revenue and output VAT never reach the GL although the sale is marked posted

- เลนส์: บัญชี/journal · บรรทัด ~1507
- โค้ด: `const asset = accId(assetCode), sales4010 = accId("4010"), vatAcc = accId("2100") || "a2100", cogsAcc = accId("5010"), inv = accId("1040");`
- สถานการณ์ที่พัง: Chart lacks 1035 (deleted at zero balance, or restored from a pre-1035 backup — the reason line 1504 importAccounts re-creates it, invisibly to the stale `accId` lookup). A Shopee sale of 1,070 (base 1,000, VAT 70, COGS 600) then skips the whole revenue block at line 1509 (`asset` is undefined) but still posts the COGS pair (Dr 5010 600 / Cr 1040 600, jl.length = 2) under the sale's journalId. GL shows zero sales revenue and zero output VAT for the bill; later settleMarketplaceBatch sees journalId set and credits 1035 for the full 1,070 that was never debited, driving 1035 negative. The sibling path issueBillsFromPending guards exactly this with `accId(assetCode) || (assetCode === "1035" ? "a1035" : null)` (line 1621).
- ผล verify: Line 1507: asset=accId(assetCode) with no a1035 fallback; sibling issueBillsFromPending line 1621 has ||(assetCode==='1035'?'a1035':null). Stale accounts closure after importAccounts (line 1504). 1035 is in DEFAULT_ACCOUNTS so requires deletion/old backup — narrow. Confirmed low.
- สคริปต์รันซ้ำ:

```sh
node -e 'const accounts=[{id:"a4010",code:"4010"},{id:"a2100",code:"2100"},{id:"a5010",code:"5010"},{id:"a1040",code:"1040"}];const accId=c=>(accounts.find(a=>a.code===c)||{}).id;const tot={total:1070,base:1000,vat:70},cogs=600;const asset=accId("1035");const jl=[];if(tot.total>0&&asset&&accId("4010")){jl.push({credit:tot.base});}if(cogs>0){jl.push({debit:cogs});jl.push({credit:cogs});}console.log("entry posted:",jl.length>=2,"GL sales credited:",jl.filter(l=>l.credit===1000).length?1000:0,"correct:",1000);'
```

### 20. [LOW] Marketplace batch settlement allocates the deposit per bill with round2(received*share) and no residual assignment, so the per-bill allocations do not sum back to the actual deposit; the Settled-batches view re-sums these allocations and displays a deposit/fee total that differs from what was entered and journaled

- เลนส์: ตัวเลข/FX · บรรทัด ~1731
- โค้ด: `const recv_i = round2(received * share);       const fee_i = round2((Number(s.total) || 0) - recv_i);`
- สถานการณ์ที่พัง: Settle 3 Shopee bills of 100.00 THB each with a real deposit of 250.00 (fee 50.00). Each bill's share is 1/3, so recv_i = round2(83.333...) = 83.33 for all three; the stored allocations sum to 249.99 received / 50.01 fee. The journal (lines 1720-1723) correctly posts 250.00, but the batch list (line 5691: batches[b].received += s.settle.received; batches[b].fee += s.settle.fee) shows this batch as received 249.99 / fee 50.01 — a 1-satang mismatch against the bank statement the user is reconciling, and per-bill fee reports carry the same drift.
- ผล verify: Lines 1731-1732 recv_i=round2(received*share) with no residual assignment; batch list re-sums (line ~5691). Repro: 3x100 deposit 250 -> allocations sum 249.99/fee 50.01 vs 250/50. 1-satang display drift.
- สคริปต์รันซ้ำ:

```sh
node -e 'const round2=n=>Math.round(n*100)/100;const totals=[100,100,100],received=250;const sumBill=round2(totals.reduce((a,b)=>a+b,0));const alloc=totals.map(t=>{const share=t/sumBill;const recv_i=round2(received*share);return{recv_i,fee_i:round2(t-recv_i)};});console.log({perBill:alloc,recvSum:round2(alloc.reduce((a,x)=>a+x.recv_i,0)),actualDeposit:received,feeSum:round2(alloc.reduce((a,x)=>a+x.fee_i,0)),actualFee:round2(sumBill-received)});'
```

### 21. [LOW] commitPurchase posts a debit-only (unbalanced) journal entry when the credit-side account code (2010/1010/1020) is missing from the chart — `cred` has no fallback id unlike vatAcc/advApplyAcc, and the `jl.length >= 2` guard still passes

- เลนส์: บัญชี/journal · บรรทัด ~1805
- โค้ด: `const cred = accId(credCode);       ...       if (remain > 0 && cred) jl.push({ accountId: cred, debit: 0, credit: remain });       if (jl.length >= 2) addEntry({ id: journalId, da`
- สถานการณ์ที่พัง: The chart-of-accounts page allows deleting any zero-balance account (tryDelete, line 2608-2614), and restored backups from older versions may lack 2010. importAccounts on line 1797 adds a2010 in the same commit, but `accId` reads the stale `accounts` closure so it returns undefined — the same stale-read that lines 1803 (`accId("1150") || "a1150"`) and 1811 (`accId("1170") || "a1170"`) defend against with a hard-coded fallback; `cred` has none. A VAT credit purchase (goods 10,000 + VAT 700) then posts an entry with Dr 1040 10,000 / Dr 1150 700 and NO credit line (jl.length = 2 passes the guard), permanently unbalancing the trial balance by 10,700.
- ผล verify: Lines 1804-1816: cred=accId(credCode) has no fallback (unlike vatAcc||a1150, advApplyAcc||a1170); guard jl.length>=2 (line 1816) passes with debit-only entry. Repro: posted true, debits 10700 credits 0. But 2010 is in DEFAULT_ACCOUNTS (line ~), so requires prior deletion — narrow, hence low.
- สคริปต์รันซ้ำ:

```sh
node -e 'const round2=n=>Math.round((Number(n)||0)*100)/100;const accounts=[{id:"a1040",code:"1040"},{id:"a1150",code:"1150"}];const accId=c=>(accounts.find(a=>a.code===c)||{}).id;const jl=[];const debitGoods=round2(10000);const vat=700;const debitAcc=accId("1040");const vatAcc=accId("1150")||"a1150";const cred=accId("2010");if(debitGoods>0&&debitAcc)jl.push({debit:debitGoods,credit:0});if(vat>0&&vatAcc)jl.push({debit:vat,credit:0});const remain=round2(10700);if(remain>0&&cred)jl.push({debit:0,credit:remain});console.log("posted:",jl.length>=2,"debits:",jl.reduce((s,l)=>s+l.debit,0),"credits:",jl.reduce((s,l)=>s+l.credit,0));'
```

### 22. [LOW] commitPurchase journal lines can reference phantom account ids 'a5090'/'a1170' that importAccounts never ensures, making the trial balance silently unbalanced and dropping the amount from the P&L

- เลนส์: React state · บรรทัด ~1810
- โค้ด: `if (!feeToCost && feeNum > 0) { const feeAcc = accId("5090") || "a5090"; jl.push({ accountId: feeAcc, debit: feeNum, credit: 0 }); }`
- สถานการณ์ที่พัง: The importAccounts call in commitPurchase (lines 1797-1800) ensures only 1150 and 2010, yet lines 1810-1811 fall back to hardcoded ids "a5090" (bank fee as expense) and "a1170" (advance applied) — unlike postDep (line 6244) which ensures 1600/1690/5400 before using the same fallback ids. If account 5090 was deleted in Chart of Accounts (deleteAccount line 1338) or the loaded save predates it, the posted entry references an accountId that exists in no accounts row: the entry itself is balanced, but tbDebit/tbCredit (lines 1285-1292) and sumByType (line 1273) iterate `accounts` only, so the debit disappears — trial balance shows debit 1,070 vs credit 1,100 for a 1,000+70 VAT purchase with a 30-baht expensed fee (balanced flag false), the fee never appears in expenses, and the journal line renders account '?'. Same mechanism for a1170 when an advance recorded with postJournal=false (commitAdvance imports 1170 only inside `if (postJournal)`, line 1991) is later applied to a purchase.
- ผล verify: Lines 1810-1811: feeAcc=accId('5090')||'a5090', advApplyAcc=accId('1170')||'a1170'; importAccounts (1797-1800) ensures only 1150/2010. If 5090 deleted, entry references phantom id absent from accounts; tbDebit/tbCredit iterate accounts only. Repro: tb debit 1070 vs credit 1100, balanced flag false. Narrow (requires deletion), hence low.
- สคริปต์รันซ้ำ:

```sh
node -e 'const accounts=[{id:"a1040",code:"1040",type:"asset"},{id:"a1150",code:"1150",type:"asset"},{id:"a2010",code:"2010",type:"liability"}];const accId=(c)=>(accounts.find((a)=>a.code===c)||{}).id;const jl=[{accountId:accId("1040"),debit:1000,credit:0},{accountId:accId("1150")||"a1150",debit:70,credit:0},{accountId:accId("5090")||"a5090",debit:30,credit:0},{accountId:accId("2010"),debit:0,credit:1100}];const entries=[{id:"j1",lines:jl}];const m={};accounts.forEach((a)=>(m[a.id]={debit:0,credit:0}));entries.forEach((e)=>e.lines.forEach((l)=>{if(!m[l.accountId])m[l.accountId]={debit:0,credit:0};m[l.accountId].debit+=Number(l.debit)||0;m[l.accountId].credit+=Number(l.credit)||0;}));const tbDebit=accounts.reduce((s,a)=>{const tt=m[a.id];const net=tt.debit-tt.credit;return s+(net>0?net:0);},0);const tbCredit=accounts.reduce((s,a)=>{const tt=m[a.id];const net=tt.debit-tt.credit;return s+(net<0?-net:0);},0);console.log("entry balanced:",jl.reduce((s,l)=>s+l.debit,0)===jl.reduce((s,l)=>s+l.credit,0));console.log("trial balance debit",tbDebit,"vs credit",tbCredit,"-> app balanced flag:",Math.abs(tbDebit-tbCredit)<0.005);'
```

### 23. [LOW] Printed document footer labels the VAT rate with Math.round(vatRate*100), so a configured fractional rate (e.g. 6.5%) prints as "VAT 7%" while the amount next to it is computed at 6.5% — inconsistent with the toFixed(2) formatting used everywhere else

- เลนส์: ตัวเลข/FX · บรรทัด ~5461
- โค้ด: `<span>VAT {Math.round(vatRate * 100)}%</span><span>{money(tot.vat)}</span>`
- สถานการณ์ที่พัง: Settings accepts any VAT percent 0-100 including decimals (line 8433: round2(pct)/100). With vatRate saved as 6.5%, a customer-facing printed quotation/receipt shows the label "VAT 7%" while tot.vat is extracted at 6.5% of the total — the printed rate contradicts the printed amount. Other displays of the same rate use +(vatRate*100).toFixed(2) (lines 3594, 6764, 8431) and render 6.5 correctly; only this print path truncates to a whole percent.
- ผล verify: Line 5461 prints VAT {Math.round(vatRate*100)}% while amount uses actual rate; other displays use toFixed(2). Repro: 6.5% prints '7%'.
- สคริปต์รันซ้ำ:

```sh
node -e 'const round2=n=>Math.round(n*100)/100;const vatRate=round2(6.5)/100;/*settings path line 8433*/console.log({printedLabel:Math.round(vatRate*100)+"%",actualRate:+(vatRate*100).toFixed(2)+"%"});'
```

### 24. [LOW] Anthropic API key is stored in localStorage in cleartext and is not scoped by user level, exposing a billable credential to any local user on a shared terminal

- เลนส์: security/auth · บรรทัด ~6427
- โค้ด: `const saveKey = (k) => { setApiKey(k); try { localStorage.setItem(AI_KEY_LS, k); } catch (e) {} };`
- สถานการณ์ที่พัง: The scan-document feature stores an Anthropic secret (sk-ant-...) under localStorage key 'thaicolor:aiKey' in plaintext (line 6412/6427) and renders it into an input whose type can be toggled to visible text (line 6560, showKey). The key is global to the browser profile, not tied to the level-3 gate that controls the scandoc tab. On a shared shop PC any user (including level 1) with devtools / localStorage access reads and exfiltrates the key and can run up charges on the owner's Anthropic account. Non-numeric: no repro script.
- ผล verify: saveKey (line 6427) writes Anthropic key to localStorage cleartext; loaded at 6426; not scoped to level-3. Billable credential exposed on shared terminal. Confirmed.

### 25. [LOW] Purchases page "Total input VAT" KPI sums vatThb over ALL purchases including cancelled (voided) bills, overstating claimable input VAT after any purchase cancellation

- เลนส์: บัญชี/journal · บรรทัด ~6857
- โค้ด: `const inputVatAll = round2(purchases.reduce((s, p) => s + (Number(p.vatThb) || 0), 0));`
- สถานการณ์ที่พัง: The Purchases component receives the full `purchases` array (line 2394, not activePurchases) so voided rows can render with their cancelled badge. deletePurchase marks a bill voided and reverses its journal, but the KPI at line 7099 keeps counting its vatThb: with an active bill of VAT 700 and a cancelled bill of VAT 70, the page shows input VAT 770 while the correct figure (and what AcctSummary/ภ.พ.30 shows from activePurchases) is 700.
- ผล verify: Line 6857 inputVatAll sums all purchases with no !voided filter; rendered line 7099; Purchases gets full purchases array (line 2394). Repro app 770 vs correct 700.
- สคริปต์รันซ้ำ:

```sh
node -e 'const round2=n=>Math.round((Number(n)||0)*100)/100;const purchases=[{vatThb:700},{vatThb:70,voided:true}];const inputVatAll=round2(purchases.reduce((s,p)=>s+(Number(p.vatThb)||0),0));const correct=round2(purchases.filter(p=>!p.voided).reduce((s,p)=>s+(Number(p.vatThb)||0),0));console.log("app:",inputVatAll,"correct:",correct);'
```

### 26. [LOW] Expenses month toolbar: sumAmt excludes voided expenses but sumVat does not, so the displayed monthly VAT total keeps counting cancelled expenses' input VAT

- เลนส์: บัญชี/journal · บรรทัด ~7981
- โค้ด: `const sumAmt = rows.filter((e) => !e.voided).reduce((a, e) => a + (Number(e.amount) || 0), 0);   const sumVat = rows.reduce((a, e) => a + (Number(e.vatThb) || 0), 0);`
- สถานการณ์ที่พัง: Month has a cancelled expense (amount 1,000, VAT 65.42) and an active one (amount 500, VAT 32.71). The toolbar shows Total ฿500.00 (voided correctly excluded, line 7980) alongside VAT ฿98.13 (voided incorrectly included, line 7981); the consistent figure is 32.71. Anyone reconciling the page against the ภ.พ.30 input-VAT summary (which uses activeExpenses) sees a phantom 65.42 difference.
- ผล verify: Lines 7980-7981: sumAmt filters !voided, sumVat does not. Repro sumVat 98.13 vs correct 32.71.
- สคริปต์รันซ้ำ:

```sh
node -e 'const round2=n=>Math.round((Number(n)||0)*100)/100;const rows=[{amount:1000,vatThb:65.42,voided:true},{amount:500,vatThb:32.71}];const sumAmt=rows.filter(e=>!e.voided).reduce((a,e)=>a+(Number(e.amount)||0),0);const sumVat=rows.reduce((a,e)=>a+(Number(e.vatThb)||0),0);console.log("app sumAmt:",sumAmt,"app sumVat:",round2(sumVat),"correct sumVat:",32.71);'
```
