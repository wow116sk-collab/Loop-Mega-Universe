import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import pdfWorkerSrc from "./pdfworker.txt";

/* ------------------------------------------------------------------ */
/*  Double-entry accounting + Inventory (ระบบบัญชีคู่) — Thai/English  */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "doubleentry:v1";

const TYPE_ORDER = ["asset", "liability", "equity", "revenue", "expense"];

const TYPE_LABEL = {
  asset: ["สินทรัพย์", "Assets"],
  liability: ["หนี้สิน", "Liabilities"],
  equity: ["ส่วนของเจ้าของ", "Equity"],
  revenue: ["รายได้", "Revenue"],
  expense: ["ค่าใช้จ่าย", "Expenses"],
};

// debit-normal accounts increase with debits; the rest increase with credits
const DEBIT_NORMAL = { asset: true, expense: true };
const isDebitNormal = (type) => !!DEBIT_NORMAL[type];

const DEFAULT_ACCOUNTS = [
  { id: "a1010", code: "1010", th: "เงินสด", en: "Cash", type: "asset" },
  { id: "a1020", code: "1020", th: "เงินฝากธนาคาร", en: "Bank", type: "asset" },
  { id: "a1030", code: "1030", th: "ลูกหนี้การค้า", en: "Accounts Receivable", type: "asset" },
  { id: "a1035", code: "1035", th: "เงินรอรับ-ขายออนไลน์ (Shopee/Lazada)", en: "Marketplace settlement receivable", type: "asset" },
  { id: "a1040", code: "1040", th: "สินค้าคงเหลือ", en: "Inventory", type: "asset" },
  { id: "a1170", code: "1170", th: "เงินจ่ายล่วงหน้า/มัดจำซัพพลายเออร์", en: "Advances to suppliers", type: "asset" },
  { id: "a1150", code: "1150", th: "ภาษีซื้อ (VAT)", en: "VAT Input", type: "asset" },
  { id: "a1500", code: "1500", th: "อุปกรณ์", en: "Equipment", type: "asset" },
  { id: "a2010", code: "2010", th: "เจ้าหนี้การค้า", en: "Accounts Payable", type: "liability" },
  { id: "a2020", code: "2020", th: "เงินกู้", en: "Loans Payable", type: "liability" },
  { id: "a2100", code: "2100", th: "ภาษีขาย (VAT) ค้างชำระ", en: "VAT Output Payable", type: "liability" },
  { id: "a3010", code: "3010", th: "ทุน-เจ้าของ", en: "Owner's Capital", type: "equity" },
  { id: "a3020", code: "3020", th: "ถอนใช้ส่วนตัว", en: "Owner's Drawings", type: "equity" },
  { id: "a4010", code: "4010", th: "รายได้จากการขาย", en: "Sales Revenue", type: "revenue" },
  { id: "a4020", code: "4020", th: "รายได้ค่าบริการ", en: "Service Revenue", type: "revenue" },
  { id: "a5010", code: "5010", th: "ต้นทุนขาย", en: "Cost of Goods Sold", type: "expense" },
  { id: "a5020", code: "5020", th: "เงินเดือน", en: "Salaries Expense", type: "expense" },
  { id: "a5030", code: "5030", th: "ค่าเช่า", en: "Rent Expense", type: "expense" },
  { id: "a5040", code: "5040", th: "ค่าสาธารณูปโภค", en: "Utilities Expense", type: "expense" },
  { id: "a5050", code: "5050", th: "ค่าใช้จ่ายเบ็ดเตล็ด", en: "Miscellaneous Expense", type: "expense" },
  { id: "a5080", code: "5080", th: "ค่าธรรมเนียมขายออนไลน์", en: "Online marketplace fees", type: "expense" },
  { id: "a5090", code: "5090", th: "ค่าธรรมเนียมธนาคาร", en: "Bank charges", type: "expense" },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const APP_VERSION = "V1.6.2"; // shown next to the app title on the ledger home page; bump on each release
const todayISO = () => new Date().toISOString().slice(0, 10);
// all scan/lookup codes for a product: explicit codes[] + legacy barcode + sku, de-duplicated
function prodCodes(p) {
  if (!p) return [];
  const arr = [];
  (p.codes || []).forEach((c) => { if (c) arr.push(String(c)); });
  if (p.barcode) arr.push(String(p.barcode));
  if (p.sku) arr.push(String(p.sku));
  const seen = new Set(); const out = [];
  arr.forEach((c) => { const k = c.trim().toLowerCase(); if (c.trim() && !seen.has(k)) { seen.add(k); out.push(c); } });
  return out;
}
// return a NEW products array with a sale's stock added back (FIFO layer / serials restored) — pure, no state
function restoreSaleStock(products, sale) {
  const items = Array.isArray(sale && sale.items) ? sale.items : [];
  return (products || []).map((p) => {
    const its = items.filter((l) => l.productId === p.id);
    if (!its.length) return p;
    if (p.tracksSerial) {
      const back = new Set(its.map((l) => l.serial).filter(Boolean));
      return { ...p, serials: (p.serials || []).map((s) => (back.has(s.serial) ? { ...s, status: "in" } : s)) };
    }
    const qtyBack = its.reduce((a, l) => a + (Number(l.qty) || 0), 0);
    const layers = [...(p.layers || [])];
    const consumed = sale && sale.fifo && Array.isArray(sale.fifo[p.id]) ? sale.fifo[p.id] : null;
    if (consumed && consumed.length) {
      // restore the exact FIFO slices this sale consumed (front of queue, original costs) — no cost drift on void/edit
      let backQty = 0;
      for (let i = consumed.length - 1; i >= 0; i--) { const cq = Number(consumed[i].qty) || 0; if (cq > 0) { layers.unshift({ qty: cq, unitCost: Number(consumed[i].unitCost) || 0 }); backQty += cq; } }
      return { ...p, layers, qty: (Number(p.qty) || 0) + backQty };
    }
    const unitCost = (its[0] && Number(its[0].cost)) ? Number(its[0].cost) : (Number(p.cost) || 0);
    if (qtyBack > 0) layers.unshift({ qty: qtyBack, unitCost });
    return { ...p, layers, qty: (Number(p.qty) || 0) + qtyBack };
  });
}
const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n) => nf.format(Math.abs(Number(n) || 0));
const num = (v) => {
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
};
// FIFO cost layers: a non-serial product holds layers [{qty, unitCost}] oldest-first.
// Products without layers fall back to a single synthetic layer from qty + cost.
const prodLayers = (p) =>
  Array.isArray(p.layers) && p.layers.length
    ? p.layers
    : [{ qty: Number(p.qty) || 0, unitCost: Number(p.cost) || 0 }];
// on-hand quantity: serial products count in-stock serials, others use layers (or qty)
const productOnHand = (p) =>
  p.tracksSerial
    ? (p.serials || []).filter((s) => s.status === "in").length
    : (Array.isArray(p.layers) && p.layers.length ? p.layers.reduce((s, l) => s + (Number(l.qty) || 0), 0) : Number(p.qty) || 0);
// stock value: serial -> sum of in-stock serial costs; else FIFO layers (or on-hand x cost)
const productValue = (p) => {
  if (p.tracksSerial)
    return (p.serials || []).filter((s) => s.status === "in").reduce((s, x) => s + (Number(x.cost != null ? x.cost : p.cost) || 0), 0);
  if (Array.isArray(p.layers) && p.layers.length)
    return p.layers.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitCost) || 0), 0);
  return productOnHand(p) * (Number(p.cost) || 0);
};
const avgCost = (p) => { const oh = productOnHand(p); return oh > 0 ? productValue(p) / oh : Number(p.cost) || 0; };
// Build the paper-stock boards LIVE from real product stock (category "กระดาษฉากถ่ายภาพ"),
// pivoting colour-number x paper type. No Excel needed — quantities follow on-hand stock.
const PAPER_CATEGORY = "กระดาษฉากถ่ายภาพ";
function paperColorName(th) { const m = String(th || "").match(/-\s*\d+\s+(.+?)\s*$/); return m ? m[1].trim() : ""; }
function buildPaperBoards(products) {
  const paper = (products || []).filter((p) => (p.category || "") === PAPER_CATEGORY);
  if (!paper.length) return [];
  // cross-tab columns for the main board (order matters); SU regex also absorbs any 1.35 Superior
  const COLS = [
    { key: "LIMBO27", label: "Limbo", re: /^27LIMBO(\d+)$/i },
    { key: "PLIMBO", label: "Premium Limbo", re: /^27LIMBO(\d+)P$/i },
    { key: "EM", label: "Emaily", re: /^27EM(\d+)$/i },
    { key: "SH", label: "Shirley", re: /^27SH(\d+)$/i },
    { key: "LIMBO135", label: "Limbo 1.35", re: /^135LIMBO(\d+)$/i },
    { key: "SU", label: "Superior", re: /^(?:27|135)SU(\d+)$/i },
  ];
  const rowsMap = {};
  paper.forEach((p) => {
    const code = p.en || "";
    for (const c of COLS) {
      const m = code.match(c.re);
      if (m) {
        const k = parseInt(m[1], 10);
        if (!rowsMap[k]) rowsMap[k] = { num: k, names: {}, counts: {} };
        rowsMap[k].counts[c.key] = (rowsMap[k].counts[c.key] || 0) + productOnHand(p);
        const nm = paperColorName(p.th); if (nm) rowsMap[k].names[nm] = (rowsMap[k].names[nm] || 0) + 1;
        break;
      }
    }
  });
  const order = COLS.map((c) => c.key);
  const mainRows = Object.values(rowsMap).sort((a, b) => a.num - b.num).map((r) => {
    const name = Object.keys(r.names).sort((a, b) => r.names[b] - r.names[a])[0] || "";
    const code = String(r.num).padStart(2, "0");
    return { color: name || code, code, counts: order.map((k) => r.counts[k] || 0) };
  });
  const brandBoard = (re, name, id) => {
    const rows = paper.map((p) => { const m = (p.en || "").match(re); if (!m) return null; return { num: parseInt(m[1], 10), color: paperColorName(p.th) || String(m[1]), code: String(m[1]).padStart(2, "0"), counts: [productOnHand(p)] }; })
      .filter(Boolean).sort((a, b) => a.num - b.num).map(({ color, code, counts }) => ({ color, code, counts }));
    return { id, name, sheet: name, sizes: [name], rows };
  };
  const boards = [];
  if (mainRows.length) boards.push({ id: "pb_limbo", name: "Limbo · Emaily · Shirley · Superior", sheet: "LIMBO", sizes: COLS.map((c) => c.label), rows: mainRows });
  const sv = brandBoard(/^27SV(\d+)$/i, "Savage", "pb_savage"); if (sv.rows.length) boards.push(sv);
  const co = brandBoard(/^27COLO(\d+)$/i, "Colorama", "pb_colorama"); if (co.rows.length) boards.push(co);
  return boards;
}
// consume `qty` from FIFO layers; returns the remaining layers and the cost of goods sold
function consumeFIFO(layers, qty) {
  let need = qty, cogs = 0;
  const out = [];
  const consumed = []; // exact slices taken [{qty, unitCost}] — stored on the sale so void/edit restores true costs
  for (const L of layers) {
    const lq = Number(L.qty) || 0, lc = Number(L.unitCost) || 0;
    if (need <= 0) { out.push({ ...L, qty: lq, unitCost: lc }); continue; } // spread keeps srcId thread intact
    const take = Math.min(lq, need);
    cogs += take * lc;
    if (take > 0) consumed.push({ qty: take, unitCost: lc });
    const rem = lq - take;
    need -= take;
    if (rem > 0) out.push({ ...L, qty: rem, unitCost: lc });
  }
  return { layers: out, cogs, consumed };
}
const norm = (s) => String(s == null ? "" : s).trim().toLowerCase();
// multi-token search: "lim 93" matches anything containing BOTH "lim" and "93", any order/position
const tokMatch = (hay, q) => { const h = norm(hay); const toks = norm(q).split(/\s+/).filter(Boolean); return !toks.length || toks.every((tk) => h.includes(tk)); };

// Lazily make window.BarcodeDetector available. Returns true if usable.
// The wasm-backed polyfill is imported only here (on demand) — never at startup —
// so just opening the page never tries to fetch the wasm.
async function ensureBarcodeDetector() {
  if (typeof window === "undefined") return false;
  if ("BarcodeDetector" in window) return true;
  try { await import("barcode-detector/side-effects"); } catch (e) { return false; }
  return "BarcodeDetector" in window;
}

// ---- sales / invoicing helpers ----
const VAT_RATE = 0.07;
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
function formOverrideCss(fs) {
  if (!fs || typeof fs !== "object") return "";
  const variants = { tax: "tax-sheet", doc: "doc-sheet", wht: "wht-sheet" };
  const num = (v) => v !== "" && v != null && isFinite(Number(v));
  let css = "";
  Object.keys(variants).forEach((k) => {
    const s = fs[k]; if (!s || typeof s !== "object") return;
    const sel = ".inv-sheet." + variants[k];
    const r = [];
    if (num(s.topMm)) r.push("margin-top:" + Number(s.topMm) + "mm !important");
    if (num(s.leftMm)) r.push("margin-left:" + Number(s.leftMm) + "mm !important");
    if (num(s.padMm)) r.push("padding:" + Number(s.padMm) + "mm !important");
    if (num(s.fontPx)) r.push("font-size:" + Number(s.fontPx) + "px !important");
    if (num(s.lineH)) r.push("line-height:" + Number(s.lineH) + " !important");
    if (num(s.heightMm) && Number(s.heightMm) > 0) { r.push("height:" + Number(s.heightMm) + "mm !important"); r.push("min-height:0 !important"); }
    if (r.length) css += "@media print{" + sel + "{" + r.join(";") + ";}}";
  });
  return css;
}
const CHANNELS = [
  { k: "cash", th: "เงินสด", en: "Cash" },
  { k: "transfer", th: "เงินโอนธนาคาร", en: "Bank transfer" },
  { k: "shopee", th: "Shopee", en: "Shopee" },
  { k: "lazada", th: "Lazada", en: "Lazada" },
  { k: "cheque", th: "เช็ค", en: "Cheque" },
  { k: "credit", th: "เครดิต (ลูกหนี้)", en: "Credit (A/R)" },
];
const channelLabel = (k, lang) => { const c = CHANNELS.find((x) => x.k === k); return c ? (lang === "en" ? c.en : c.th) : k; };
const CURRENCIES = ["THB", "USD", "EUR", "JPY", "CNY", "GBP", "HKD", "SGD", "AUD", "KRW", "TWD"];
// prices are treated as VAT-inclusive when vatEnabled
// per-line discount (sale lines): l.disc (value) + l.discKind ('amount'|'percent'); absent => no discount (back-compat)
function saleLineDiscAmt(l) {
  if (!l) return 0;
  const gross = (Number(l.qty) || 0) * (Number(l.price) || 0);
  const d = Number(l.disc) || 0;
  if (!d) return 0;
  let amt = l.discKind === "percent" ? round2(gross * d / 100) : round2(d);
  if (amt > gross) amt = gross;
  if (amt < 0) amt = 0;
  return amt;
}
function saleLineNet(l) { return round2((Number(l.qty) || 0) * (Number(l.price) || 0) - saleLineDiscAmt(l)); }

function computeSaleTotals({ items, discountType, discountValue, vatEnabled, vatRate = VAT_RATE }) {
  const subtotal = round2((items || []).reduce((s, l) => s + saleLineNet(l), 0));
  let discountAmt = discountType === "percent" ? round2(subtotal * (Number(discountValue) || 0) / 100) : round2(Number(discountValue) || 0);
  if (discountAmt > subtotal) discountAmt = subtotal;
  if (discountAmt < 0) discountAmt = 0;
  const net = round2(subtotal - discountAmt);
  let base = net, vat = 0;
  if (vatEnabled) { base = round2(net / (1 + vatRate)); vat = round2(net - base); }
  return { subtotal, discountAmt, net, base, vat, total: net };
}
// bump the trailing number of a doc string by 1, keeping prefix/separator/zero-padding ("06/031"->"06/032", "QO2606-009"->"QO2606-010")
function incDocNo(s) {
  const m = String(s == null ? "" : s).match(/^([\s\S]*?)(\d+)(\D*)$/);
  if (!m) return null;
  return m[1] + String(Number(m[2]) + 1).padStart(m[2].length, "0") + m[3];
}
// next bill number = the LAST issued bill's number + 1 (keeps whatever format you last used). Empty ledger -> MM/001.
function nextBillNo(sales, date) {
  const arr = sales || [];
  if (arr.length) {
    const last = arr[arr.length - 1];
    const bumped = last && last.billNo ? incDocNo(last.billNo) : null;
    if (bumped) return bumped;
  }
  const mm = String(date || todayISO()).slice(5, 7) || "00";
  return mm + "/001";
}

// WHT certificate running number, e.g. month 6 / 3rd cert -> "06/003" (excludeId skips the record being edited)
function whtCertNo(whts, date, excludeId) {
  const ym = String(date || "").slice(0, 7);
  const mm = String(date || "").slice(5, 7) || "00";
  const n = (whts || []).filter((w) => w.id !== excludeId && String(w.date || "").slice(0, 7) === ym).length + 1;
  return mm + "/" + String(n).padStart(3, "0");
}

// Type-ahead name picker: suggests saved names as you type. Caller wraps it in a .field + <label>.
function NameSuggest({ value, onChange, options = [], onPick, placeholder, inputMode, mono, max = 8 }) {
  const [open, setOpen] = useState(false);
  const nq = norm(value || "");
  const seen = new Set();
  const matches = nq.length >= 1
    ? options.filter((o) => {
        const lbl = (o.label || "").trim();
        if (!lbl) return false;
        const key = norm(lbl);
        if (seen.has(key)) return false;
        if (!tokMatch([o.label, o.meta].filter(Boolean).join(" "), nq)) return false;
        seen.add(key); return true;
      }).slice(0, max)
    : [];
  return (
    <div className="sug-wrap">
      <input className="input" value={value} inputMode={inputMode}
        style={mono ? { fontFamily: "'IBM Plex Mono',monospace" } : null}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder} />
      {open && matches.length > 0 && (
        <div className="sug-list">
          {matches.map((o, i) => (
            <div key={i} className="sug-item" onMouseDown={(e) => { e.preventDefault(); setOpen(false); onPick ? onPick(o) : onChange(o.label); }}>
              <span className="sug-name">{o.label}</span>
              {o.meta ? <span className="sug-meta">{o.meta}</span> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Head office / branch picker for Thai tax invoices ("สำนักงานใหญ่" or "สาขาที่ 00001"); individuals have no branch (blank)
function BranchPicker({ t, value, onChange }) {
  const v = String(value || "").trim();
  const isBr = v.startsWith("สาขา");
  const isNone = v === "";                 // individual / not a registered establishment -> nothing shown on the bill
  const isHead = !isBr && !isNone;         // "สำนักงานใหญ่"
  const no = isBr ? (v.match(/\d+/) || [""])[0] : "";
  return (
    <div>
      <label>{t("ประเภทผู้ซื้อ / สาขา (แสดงบนบิล)", "Buyer type / branch (shown on the bill)")}</label>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", minHeight: 42 }}>
        <label className="checkrow" style={{ margin: 0 }}>
          <input type="radio" checked={isNone} onChange={() => onChange("")} />{t("บุคคลธรรมดา (ไม่มีสาขา)", "Individual (no branch)")}
        </label>
        <label className="checkrow" style={{ margin: 0 }}>
          <input type="radio" checked={isHead} onChange={() => onChange("สำนักงานใหญ่")} />{t("สำนักงานใหญ่", "Head office")}
        </label>
        <label className="checkrow" style={{ margin: 0 }}>
          <input type="radio" checked={isBr} onChange={() => onChange("สาขาที่ " + (no || ""))} />{t("สาขา", "Branch")}
        </label>
        {isBr && (
          <input className="input" style={{ width: 120 }} inputMode="numeric"
            value={no}
            onChange={(e) => onChange("สาขาที่ " + e.target.value.replace(/\D/g, "").slice(0, 5))}
            onBlur={(e) => { const d = e.target.value.replace(/\D/g, ""); if (d) onChange("สาขาที่ " + d.padStart(5, "0")); }}
            placeholder="00001" />
        )}
      </div>
    </div>
  );
}

function sampleEntries(accounts) {
  const id = (code) => (accounts.find((a) => a.code === code) || {}).id;
  const mk = (date, desc, lines) => ({ id: uid(), date, desc, lines });
  return [
    mk("2025-01-05", "เจ้าของนำเงินสดมาลงทุน / Owner invests cash", [
      { accountId: id("1010"), debit: 100000, credit: 0 },
      { accountId: id("3010"), debit: 0, credit: 100000 },
    ]),
    mk("2025-01-08", "ซื้ออุปกรณ์ด้วยเงินสด / Buy equipment for cash", [
      { accountId: id("1500"), debit: 30000, credit: 0 },
      { accountId: id("1010"), debit: 0, credit: 30000 },
    ]),
    mk("2025-01-15", "ขายสินค้าเป็นเงินสด / Cash sale", [
      { accountId: id("1010"), debit: 15000, credit: 0 },
      { accountId: id("4010"), debit: 0, credit: 15000 },
    ]),
    mk("2025-01-20", "ให้บริการเป็นเงินเชื่อ / Service on credit", [
      { accountId: id("1030"), debit: 5000, credit: 0 },
      { accountId: id("4020"), debit: 0, credit: 5000 },
    ]),
    mk("2025-01-31", "จ่ายค่าเช่าสำนักงาน / Pay office rent", [
      { accountId: id("5030"), debit: 8000, credit: 0 },
      { accountId: id("1010"), debit: 0, credit: 8000 },
    ]),
  ];
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

* { box-sizing: border-box; }
:root {
  --paper:#F3F5F9; --card:#FFFFFF; --ink:#16202B; --soft:#5A6573; --faint:#94A0AE;
  --line:#E5EAF1; --line2:#F1F4F9; --green:#10B07E; --green-soft:#E6F7F0;
  --red:#DC3A3A; --red-soft:#FCEDED; --gold:#C98A1E;
  font-family:'Prompt','IBM Plex Sans Thai','IBM Plex Sans',system-ui,sans-serif; color:var(--ink);
}
.acc-root {
  --paper:#F3F5F9; --card:#FFFFFF; --ink:#16202B; --soft:#5A6573; --faint:#94A0AE;
  --line:#E5EAF1; --line2:#F1F4F9; --green:#10B07E; --green-soft:#E6F7F0;
  --red:#DC3A3A; --red-soft:#FCEDED; --gold:#C98A1E;
  font-family:'Prompt','IBM Plex Sans Thai','IBM Plex Sans',system-ui,sans-serif;
  color:var(--ink);
  background:
    radial-gradient(circle at 14% -10%, #EAF6F1 0%, transparent 42%),
    radial-gradient(circle at 100% 0%, #EEF2F8 0%, transparent 40%),
    var(--paper);
  min-height:100vh;
}
.acc-num { font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; }
.wrap { max-width:1040px; margin:0 auto; padding:0 16px 64px; }

/* top bar */
.topbar { display:flex; align-items:flex-end; justify-content:space-between; gap:16px;
  padding:26px 0 16px; border-bottom:1px solid var(--line); flex-wrap:wrap; }
.brand-th { font-size:25px; font-weight:700; letter-spacing:-.01em; line-height:1.05; }
.brand-en { font-family:'IBM Plex Sans',sans-serif; font-size:12px; font-weight:500;
  letter-spacing:.22em; text-transform:uppercase; color:var(--soft); margin-top:6px; }
.brand-accent { color:var(--green); }
.langtoggle { display:flex; border:1.5px solid var(--ink); border-radius:999px; overflow:hidden; }
.langbtn { font:inherit; font-size:12px; font-weight:600; padding:7px 13px; background:transparent;
  border:0; cursor:pointer; color:var(--soft); }
.langbtn.on { background:var(--ink); color:var(--paper); }

/* tabs */
.tabs { display:flex; gap:4px; overflow-x:auto; padding:14px 0 0; margin-bottom:22px;
  scrollbar-width:thin; }
.tab { font:inherit; font-size:14px; font-weight:600; white-space:nowrap; padding:9px 15px;
  border:1px solid transparent; border-radius:10px; background:transparent; color:var(--soft);
  cursor:pointer; transition:.15s; }
.tab:hover { color:var(--ink); background:var(--line2); }
.tab.active { color:var(--green); background:var(--card); border-color:var(--line);
  box-shadow:0 1px 0 var(--green) inset, 0 2px 8px rgba(31,35,29,.05); }

/* generic */
.section-title { font-size:18px; font-weight:700; margin:6px 0 4px; }
.section-sub { font-family:'IBM Plex Sans',sans-serif; font-size:12.5px; color:var(--soft);
  margin-bottom:18px; }
.muted { color:var(--soft); }
.faint { color:var(--faint); }
.pos { color:var(--green); }
.neg { color:var(--red); }
.empty { text-align:center; padding:40px 16px; color:var(--soft); font-size:14px;
  border:1.5px dashed var(--line); border-radius:14px; background:rgba(255,255,255,.4); }

/* cards */
.card { background:var(--card); border:1px solid var(--line); border-radius:16px;
  box-shadow:0 1px 2px rgba(16,24,40,.04), 0 6px 16px rgba(16,24,40,.03); }
.card-pad { padding:18px 20px; }
.card-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(168px,1fr)); gap:12px; }
.stat { padding:16px 18px; position:relative; overflow:hidden; }
.stat::before { content:""; position:absolute; left:0; top:14px; bottom:14px; width:3px;
  border-radius:3px; background:var(--accentbar,var(--line)); }
.stat-label { font-family:'IBM Plex Sans',sans-serif; font-size:11px; font-weight:600;
  letter-spacing:.08em; text-transform:uppercase; color:var(--soft); }
.stat-th { font-size:13px; font-weight:600; color:var(--ink); margin-bottom:8px; }
.stat-value { font-family:'IBM Plex Mono',monospace; font-size:22px; font-weight:600;
  font-variant-numeric:tabular-nums; letter-spacing:-.02em; }
.stat-cur { font-size:13px; color:var(--soft); margin-right:3px; }

/* banner */
.banner { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:12px;
  font-size:13.5px; font-weight:500; margin-bottom:18px; }
.banner-ok { background:var(--green-soft); color:var(--green); border:1px solid #BCD8C4; }
.banner-warn { background:var(--red-soft); color:var(--red); border:1px solid #E3C2B6; }
.banner .dot { width:8px; height:8px; border-radius:50%; background:currentColor; flex:0 0 auto; }

/* buttons */
.btn { font:inherit; font-size:13.5px; font-weight:600; padding:9px 16px; border-radius:10px;
  border:1.5px solid var(--line); background:#fff; color:var(--ink); cursor:pointer;
  transition:.15s; }
.btn:hover { background:var(--line2); color:var(--ink); border-color:var(--soft); }
.btn-primary { background:var(--green); border-color:var(--green); color:#fff; }
.btn-primary:hover { background:#0C9268; border-color:#0C9268; color:#fff; }
.btn-danger { border-color:var(--red); color:var(--red); }
.btn-danger:hover { background:var(--red); color:#fff; }
.btn-sm { padding:6px 11px; font-size:12.5px; border-radius:8px; }
.btn-row { display:flex; gap:10px; flex-wrap:wrap; }
.icon-btn { font:inherit; border:0; background:transparent; cursor:pointer; color:var(--faint);
  padding:4px 7px; border-radius:7px; font-size:16px; line-height:1; }
.icon-btn:hover { color:var(--red); background:var(--red-soft); }

/* table */
.table-scroll { overflow-x:auto; border:1px solid var(--line); border-radius:14px; background:var(--card); }
table.t { width:100%; border-collapse:collapse; font-size:13.5px; min-width:520px; }
table.t thead th { font-family:'IBM Plex Sans',sans-serif; font-size:11px; font-weight:600;
  letter-spacing:.05em; text-transform:uppercase; color:var(--soft); text-align:left;
  padding:12px 14px; border-bottom:1px solid var(--line); background:#F7F9FC; white-space:nowrap; }
table.t tbody td { padding:11px 14px; border-bottom:1px solid var(--line2); vertical-align:top; }
table.t tbody tr:nth-child(even) { background:rgba(16,24,40,.018); }
table.t tbody tr:last-child td { border-bottom:0; }
.r { text-align:right; }
.c { text-align:center; }
.foot td { font-weight:700; border-top:1.5px solid var(--line); background:#F7F9FC; }
.code { font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:var(--soft); }

/* type badge */
.badge { font-family:'IBM Plex Sans',sans-serif; font-size:10.5px; font-weight:600; padding:3px 8px;
  border-radius:999px; white-space:nowrap; display:inline-block; }
.b-asset { background:#E6F0E8; color:#2C6A4E; }
.b-liability { background:#FBEAD7; color:#9A6512; }
.b-equity { background:#E7E9F2; color:#3C4673; }
.b-revenue { background:#E4F0EF; color:#1F6E66; }
.b-expense { background:#F3E2DB; color:#A23E28; }

/* forms */
.field { margin-bottom:13px; }
.field label { display:block; font-family:'IBM Plex Sans',sans-serif; font-size:12px;
  font-weight:600; color:var(--soft); margin-bottom:5px; }
.input, .select { width:100%; font:inherit; font-size:14px; padding:9px 11px; border-radius:9px;
  border:1.5px solid var(--line); background:#fff; color:var(--ink); }
.input:focus, .select:focus { outline:none; border-color:var(--green);
  box-shadow:0 0 0 3px rgba(44,106,78,.12); }
.input.r { text-align:right; font-family:'IBM Plex Mono',monospace; }
.row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

/* journal line editor */
.line-grid { display:grid; grid-template-columns:1fr 116px 116px 32px; gap:8px; align-items:center;
  margin-bottom:8px; }
.line-head { font-family:'IBM Plex Sans',sans-serif; font-size:11px; font-weight:600;
  letter-spacing:.04em; text-transform:uppercase; color:var(--faint); }
.totbar { display:flex; justify-content:flex-end; gap:24px; padding:12px 0 4px;
  font-family:'IBM Plex Mono',monospace; font-size:13.5px; }
.totbar b { font-weight:600; }
@media (max-width:560px){
  .line-grid { grid-template-columns:1fr 1fr 28px; }
  .line-acc { grid-column:1 / -1; }
}

.entry-card { padding:14px 16px; margin-bottom:10px; }
.entry-top { display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom:8px; }
.entry-date { font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--soft); }
.entry-desc { font-weight:600; font-size:14px; }
.entry-line { display:grid; grid-template-columns:1fr 96px 96px; gap:8px; font-size:13px;
  padding:3px 0; }
.entry-line.dr { padding-left:0; }
.entry-line.cr .acc { padding-left:22px; color:var(--soft); }

.foot-note { font-family:'IBM Plex Sans',sans-serif; font-size:11.5px; color:var(--faint);
  text-align:center; margin-top:28px; line-height:1.6; }
.statwrap { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
@media (max-width:740px){ .statwrap { grid-template-columns:1fr; } }
.stmt-title { font-size:15px; font-weight:700; padding:14px 16px 4px; }
.stmt-sub { font-family:'IBM Plex Sans',sans-serif; font-size:11px; color:var(--soft);
  padding:0 16px 10px; letter-spacing:.04em; text-transform:uppercase; }
.stmt-sec { font-size:12px; font-weight:700; color:var(--soft); letter-spacing:.04em;
  text-transform:uppercase; padding:12px 16px 4px; }
.stmt-row { display:flex; justify-content:space-between; gap:12px; padding:6px 16px; font-size:13.5px; }
.stmt-row .stmt-amt { font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; }
.stmt-sub-row { border-top:1px solid var(--line); font-weight:600; margin-top:4px; }
.stmt-total { border-top:1.5px solid var(--ink); font-weight:700; font-size:14.5px; padding:11px 16px;
  background:#F6F1E4; }
.stmt-total .stmt-amt { font-family:'IBM Plex Mono',monospace; }

/* inventory + scan + import */
.toolbar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:16px; }
.scanbox { display:flex; gap:10px; align-items:stretch; margin-bottom:6px; }
.scan-input { flex:1; min-width:0; font-family:'IBM Plex Mono',monospace; font-size:18px; padding:14px 16px;
  border:2px solid var(--green); border-radius:12px; background:#fff; letter-spacing:.02em; color:var(--ink); }
.scan-input:focus { outline:none; box-shadow:0 0 0 4px rgba(44,106,78,.15); }
.scan-hint { font-family:'IBM Plex Sans',sans-serif; font-size:12px; color:var(--soft); margin:0 0 16px; }
.sug-wrap { position:relative; }
.sug-list { position:absolute; left:0; right:0; top:100%; margin-top:4px; background:var(--paper); border:1px solid var(--line);
  border-radius:10px; box-shadow:0 10px 28px rgba(20,18,14,.22); z-index:60; max-height:300px; overflow:auto; }
.sug-item { display:flex; justify-content:space-between; gap:10px; align-items:center; padding:9px 12px; cursor:pointer; border-bottom:1px solid var(--faint); }
.sug-item:last-child { border-bottom:none; }
.sug-item:hover { background:rgba(44,106,78,.10); }
.sug-name { font-weight:600; }
.sug-meta { font-size:12px; color:var(--soft); white-space:nowrap; }
.login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; background:var(--paper); }
.login-card { width:100%; max-width:360px; background:#fff; border:1px solid var(--line); border-radius:16px; box-shadow:0 12px 40px rgba(20,18,14,.18); padding:26px 22px; display:flex; flex-direction:column; gap:10px; }
.login-brand { font-family:'IBM Plex Sans Thai','IBM Plex Sans',sans-serif; font-size:22px; font-weight:700; color:var(--green); }
.login-sub { font-size:13px; color:var(--soft); margin-bottom:6px; }
.paper-tabs { display:flex; gap:6px; flex-wrap:wrap; margin:12px 0; }
.paper-tab { font:inherit; font-size:13px; padding:7px 12px; border:1px solid var(--line); background:var(--paper); border-radius:999px; cursor:pointer; }
.paper-tab.on { background:var(--green); color:#fff; border-color:var(--green); }
.paper-cell-in { width:54px; text-align:center; }
.paper-zero { color:var(--faint); }
.home-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:12px; margin-top:14px; }
.home-card { display:flex; flex-direction:column; align-items:flex-start; gap:3px; text-align:left; padding:16px; border:1px solid var(--line); border-radius:18px;
  background:linear-gradient(180deg,#FFFDF7,#FAF6EC); cursor:pointer; font:inherit; color:var(--ink); transition:transform .06s ease, box-shadow .15s ease; box-shadow:0 1px 0 rgba(0,0,0,.03); min-height:104px; }
.home-card:hover { box-shadow:0 6px 20px rgba(20,18,14,.12); }
.home-card:active { transform:scale(.97); }
.home-card.accent { background:linear-gradient(180deg,#EAF3EC,#DCEbe0); border-color:#BFD9C7; }
.home-ic { font-size:26px; line-height:1; }
.home-tt { font-weight:700; font-size:15.5px; }
.home-sub { font-size:12px; color:var(--soft); }
.cart-total { display:flex; justify-content:space-between; align-items:center; padding:14px 16px;
  background:#F6F1E4; border-top:1.5px solid var(--ink); border-radius:0 0 14px 14px; }
.cart-total .amt { font-family:'IBM Plex Mono',monospace; font-size:22px; font-weight:700; }
.flash { padding:9px 14px; border-radius:10px; font-size:13px; font-weight:500; margin-bottom:12px; }
.flash-ok { background:var(--green-soft); color:var(--green); border:1px solid #BCD8C4; }
.flash-err { background:var(--red-soft); color:var(--red); border:1px solid #E3C2B6; }
.flash-info { background:#EEF1E6; color:var(--soft); border:1px solid var(--line); }
.checkrow { display:flex; align-items:center; gap:9px; font-size:13.5px; margin:14px 0; cursor:pointer; }
.checkrow input { width:17px; height:17px; accent-color:var(--green); }
.qty-input { width:62px; font-family:'IBM Plex Mono',monospace; text-align:center; font-size:14px;
  padding:6px; border:1.5px solid var(--line); border-radius:8px; }
.serial-chip { font-family:'IBM Plex Mono',monospace; font-size:11.5px; padding:3px 8px; border-radius:7px;
  background:#fff; border:1px solid var(--line); display:inline-flex; align-items:center; gap:6px; }
.s-in { color:var(--green); }
.s-sold { color:var(--faint); text-decoration:line-through; }
.serial-wrap { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.map-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px 16px; }
@media (max-width:560px){ .map-grid { grid-template-columns:1fr; } }
.file-zone { border:2px dashed var(--line); border-radius:14px; padding:20px; text-align:center;
  background:rgba(255,255,255,.45); margin-bottom:16px; font-size:13.5px; color:var(--soft); }
.file-zone input { display:block; margin:10px auto 0; font-size:13px; max-width:100%; }
.radio-row { display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
.radio-pill { padding:9px 16px; border:1.5px solid var(--line); border-radius:999px; cursor:pointer;
  font-size:13.5px; font-weight:600; color:var(--soft); background:#fff; }
.radio-pill.on { border-color:var(--green); color:var(--green); background:var(--green-soft); }
.note-box { font-size:12.5px; color:var(--soft); background:rgba(255,255,255,.55);
  border:1px solid var(--line); border-radius:12px; padding:12px 14px; line-height:1.65; margin-top:14px; }
.expand-panel { background:#FAF6EC; border:1px solid var(--line); border-radius:12px;
  padding:14px 16px; margin:10px 0; }
.tag-serial { background:#E7E9F2; color:#3C4673; }
.tag-normal { background:#EEF1E6; color:#5E6155; }
.lowstock { color:var(--red); font-weight:600; }
.totbox { margin:14px 0 6px; border-top:1px dashed var(--line); padding-top:10px; }
.totbox > div { display:flex; justify-content:space-between; padding:3px 0; font-size:14px; color:var(--soft); }
.totbox .grand { border-top:1px solid var(--line); margin-top:6px; padding-top:8px; font-size:18px; font-weight:700; color:var(--ink); }
.pos-enter { background:var(--green); color:#fff; border-color:var(--green); }
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.kpi { background:#fff; border:1px solid var(--line); border-radius:14px; padding:14px 16px; }
.kpi-label { font-size:12px; color:var(--soft); margin-bottom:6px; }
.kpi-val { font-size:22px; font-weight:700; color:var(--ink); font-family:'IBM Plex Mono',monospace; }
@media (max-width:640px){ .kpi-grid { grid-template-columns:repeat(2,1fr); } .row2 { grid-template-columns:1fr; } }
/* printable invoice overlay — tuned for dot-matrix (Epson LQ-310) + Letter tractor paper */
.inv-overlay { position:fixed; inset:0; background:rgba(20,18,14,.55); z-index:9999; overflow:auto; padding:20px 12px; }
.inv-sheet { background:#fff; color:#000; width:8in; max-width:100%; min-height:10.6in; margin:0 auto; padding:0.4in 0.4in;
  box-shadow:0 10px 40px rgba(0,0,0,.3); font-family:'IBM Plex Sans Thai','IBM Plex Sans',sans-serif; box-sizing:border-box; font-size:13px; line-height:1.4;
  display:flex; flex-direction:column; }
.inv-fill { flex:1 1 auto; min-height:16px; }
/* document sheets stay in the original typeface/colors regardless of app theme */
.inv-sheet { font-family:'IBM Plex Sans Thai','IBM Plex Sans',system-ui,sans-serif; color:#000;
  --ink:#1F231D; --soft:#5E6155; --faint:#8E8F82; --line:#DCD4C2; --line2:#ECE6D6; --green:#2C6A4E; --card:#FFFFFF; }
.inv-sheet table.t thead th, .inv-sheet table.t .foot td { background:#F6F1E4 !important; }
.inv-sheet table.t tbody tr:nth-child(even) { background:transparent !important; }
.inv-toolbar { width:8in; max-width:100%; margin:0 auto 8px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }
.inv-hint { width:8in; max-width:100%; margin:0 auto 10px; font-size:12px; line-height:1.5; color:#EFE8D8; background:rgba(0,0,0,.18); border-radius:8px; padding:8px 12px; }
.inv-hint b { color:#FFD98A; }
.inv-sheet h1 { font-size:18px; margin:0 0 2px; }
.inv-row { display:flex; justify-content:space-between; gap:16px; }
.inv-box { border:1px solid #000; padding:7px 9px; font-size:12.5px; line-height:1.45; }
.inv-tbl { width:100%; border-collapse:collapse; margin-top:10px; font-size:12.5px; }
.inv-tbl th, .inv-tbl td { border:1px solid #000; padding:4px 7px; }
.inv-tbl th { background:transparent; text-align:left; font-weight:700; }
.inv-tbl td.r, .inv-tbl th.r { text-align:right; }
.inv-tbl td.c, .inv-tbl th.c { text-align:center; }
@media print {
  html, body { margin:0 !important; padding:0 !important; background:#fff !important; height:auto !important; min-height:0 !important; }
  #root, .acc-root, .login-wrap { background:#fff !important; min-height:0 !important; height:auto !important; }
  /* hide the ENTIRE app (display:none reclaims the space — visibility:hidden left blank pages); only the invoice prints */
  .wrap, .tc-banner { display:none !important; }
  .inv-toolbar, .inv-hint { display:none !important; }
  .inv-overlay { position:static !important; inset:auto !important; display:block !important; background:#fff !important; padding:0 !important; margin:0 !important; overflow:visible !important; height:auto !important; }
  .inv-overlay * { color:#000 !important; }
  /* one Letter page: width ~7.6in keeps the 80-column LQ-310 from clipping; small left margin so it isn't cramped on the left edge */
  .inv-sheet { box-shadow:none !important; width:7.6in !important; max-width:none !important; margin:0.35in 0 0 0.28in !important; padding:0.3in 0.3in !important; min-height:9.3in !important; overflow:hidden !important; page-break-inside:avoid !important; break-inside:avoid !important; }
  .inv-sheet.tax-sheet { height:10.2in !important; min-height:0 !important; overflow:hidden !important; }
  .inv-sheet.wht-sheet { width:8in !important; margin:0.25in auto !important; padding:0.35in 0.4in !important; min-height:10.3in !important; }
  .inv-sheet.stock-sheet { width:7.6in !important; margin:0.3in auto !important; padding:0.35in 0.4in !important; min-height:0 !important; overflow:visible !important; page-break-inside:auto !important; break-inside:auto !important; display:block !important; }
  .inv-sheet.stock-sheet table { page-break-inside:auto; }
  .inv-sheet.stock-sheet thead { display:table-header-group; }
  .inv-sheet.stock-sheet tr { page-break-inside:avoid; break-inside:avoid; }
  @page { size:Letter; margin:0; }
}

/* ===== iOS / macOS feel + mobile ergonomics ===== */
.acc-root { font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","IBM Plex Sans Thai","IBM Plex Sans",system-ui,sans-serif; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
.acc-root, .login-wrap { -webkit-tap-highlight-color:transparent; }
.btn, .btn-sm, .input, .select, .qty-input, .scan-input { border-radius:12px; }
.card { border-radius:16px; }
.btn { transition:transform .05s ease, background .15s ease, box-shadow .15s ease; }
.btn:active { transform:scale(.97); }
.tab { border-radius:999px; white-space:nowrap; flex:0 0 auto; }
.wrap { padding-left:max(16px, env(safe-area-inset-left)); padding-right:max(16px, env(safe-area-inset-right)); }
/* sticky translucent header + scrollable pill tabs, like iOS */
.topbar { position:sticky; top:0; z-index:30; background:rgba(247,243,233,.84); -webkit-backdrop-filter:saturate(170%) blur(14px); backdrop-filter:saturate(170%) blur(14px); padding-top:max(12px, env(safe-area-inset-top)); }
.tabs { position:sticky; top:58px; z-index:20; overflow-x:auto; flex-wrap:nowrap; scrollbar-width:none; -ms-overflow-style:none; -webkit-overflow-scrolling:touch; background:linear-gradient(rgba(242,237,224,.96),rgba(242,237,224,.65)); -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); padding-bottom:6px; }
.tabs::-webkit-scrollbar { display:none; }

@media (max-width:640px) {
  .wrap { padding-bottom:calc(28px + env(safe-area-inset-bottom)); }
  .btn, .btn-sm { min-height:44px; }
  .icon-btn { min-width:40px; min-height:40px; }
  .input, .select, .qty-input { min-height:44px; font-size:16px; }
  .scan-input { font-size:18px; }
  .tab { padding:9px 14px; font-size:14px; }
  .section-title { font-size:20px; }
  .login-card { border-radius:22px; }
  table.t th, table.t td { padding:11px 8px; }
}

/* ===== Sidebar layout on wide screens (tabs on the left); top strip on mobile/portrait ===== */
.layout { display:block; }
.page { min-width:0; }
@media (min-width: 900px) {
  .layout { display:flex; gap:22px; align-items:flex-start; }
  .tabs {
    position:sticky; top:74px; align-self:flex-start;
    flex:0 0 208px; width:208px; display:flex; flex-direction:column; gap:4px;
    overflow:visible; overflow-y:auto; max-height:calc(100vh - 92px);
    background:transparent; -webkit-backdrop-filter:none; backdrop-filter:none;
    padding:4px 0 8px; margin:0 0 8px;
  }
  .tabs::-webkit-scrollbar { width:6px; }
  .tab { width:100%; text-align:left; border-radius:10px; flex:0 0 auto; padding:10px 14px; }
  .tab.active { background:var(--green); color:#fff; }
  .page { flex:1 1 auto; }
}
.themetoggle { display:inline-flex; border:1px solid var(--line); border-radius:999px; overflow:hidden; }
.themetoggle button { font:inherit; font-size:12.5px; border:0; background:transparent; color:var(--soft); padding:6px 12px; cursor:pointer; }
.themetoggle button.on { background:var(--green); color:#fff; }
.bc-cell { max-width:46px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* ===== ดีไซน์ v3: สบายตา + ใช้สะดวกทั้งคอม / iPad / มือถือ ===== */
@media (prefers-reduced-motion: reduce){ *, *::before, *::after { animation:none !important; transition:none !important; } }

/* แสงนวลด้านบนหน้า ให้กระดาษดูมีมิติ ไม่แบน */
.acc-root { background: radial-gradient(1100px 380px at 50% -170px, rgba(44,106,78,.06), transparent 70%), var(--paper); }

/* การ์ด: เงานุ่มขึ้น อ่านสบายตา */
.card { box-shadow: 0 1px 2px rgba(31,27,18,.05), 0 12px 30px -20px rgba(31,27,18,.25); }

/* ตาราง: เลขเรียงตรงคอลัมน์ + แถวสลับโทนอ่อนมาก อ่านไล่บรรทัดง่าย */
table.t { font-variant-numeric: tabular-nums; }
table.t tbody tr:nth-child(even) td { background: rgba(31,27,18,.02); }
.table-scroll { -webkit-overflow-scrolling: touch; }

/* เมาส์/จอคอม: ไฮไลต์เบาๆ ตอนชี้ ให้รู้ว่ากดได้ */
@media (hover:hover) and (pointer:fine){
  .tab:hover:not(.active) { background: rgba(44,106,78,.08); }
  table.t tbody tr:hover td { background: rgba(44,106,78,.05); }
  .home-card { transition: transform .12s ease, box-shadow .12s ease; }
  .home-card:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(31,27,18,.08), 0 18px 36px -22px rgba(31,27,18,.35); }
  .table-scroll::-webkit-scrollbar { height:10px; }
  .table-scroll::-webkit-scrollbar-thumb { background: rgba(31,27,18,.18); border-radius:999px; border:3px solid var(--card); }
}
.home-card:active { transform: scale(.985); }

/* โฟกัสชัดเจนเวลาใช้คีย์บอร์ด/สวิตช์ */
.btn:focus-visible, .tab:focus-visible, .input:focus-visible, .select:focus-visible,
.icon-btn:focus-visible, .home-card:focus-visible, .langbtn:focus-visible {
  outline: 3px solid rgba(44,106,78,.4); outline-offset: 2px;
}

/* iPad แนวตั้ง (760–899px): เมนูข้างแบบย่อ — ไม่ต้องปาดแถบบนเหมือนมือถือ */
@media (min-width:760px) and (max-width:899px){
  .layout { display:flex; gap:16px; align-items:flex-start; }
  .tabs {
    position:sticky; top:74px; align-self:flex-start;
    flex:0 0 178px; width:178px; display:flex; flex-direction:column; gap:4px;
    overflow:visible; overflow-y:auto; max-height:calc(100vh - 92px);
    background:transparent; -webkit-backdrop-filter:none; backdrop-filter:none;
    padding:4px 0 8px; margin:0 0 8px;
  }
  .tab { width:100%; text-align:left; border-radius:10px; flex:0 0 auto; padding:10px 12px; font-size:13px; }
  .tab.active { background:var(--green); color:#fff; }
  .page { flex:1 1 auto; min-width:0; }
}

/* จอกว้าง: เพิ่มพื้นที่หายใจ ตารางโปร่งขึ้นนิด */
@media (min-width:1100px){
  .wrap { max-width:1140px; }
  table.t th, table.t td { padding:11px 12px; }
  .section-title { font-size:21px; }
}

/* อุปกรณ์จอสัมผัสทุกขนาด (รวม iPad แนวนอน): ปุ่ม/ช่องกรอกใหญ่พอแตะ + กัน iOS ซูมเอง */
@media (pointer:coarse){
  .btn { min-height:44px; }
  .btn-sm { min-height:38px; }
  .input, .select, .qty-input { min-height:44px; font-size:16px; }
}

/* ตัวเลขการ์ดสรุป: ย่อ/ตัดบรรทัดเองตามกล่อง ไม่ล้นทับกัน */
.kpi { min-width:0; overflow:hidden; }
.kpi-val { font-size:clamp(15px, 0.7rem + 1.2vw, 22px); line-height:1.25; overflow-wrap:anywhere; word-break:break-word; }
.kpi-label { line-height:1.35; }
@media (max-width:640px){
  .kpi { padding:11px 12px; }
  .kpi-val { font-size:16px; }
  .kpi-label { font-size:11.5px; }
}
`;

/* tiny IndexedDB key-value store — used to remember a linked data-file handle across reloads */
function idbOpen() {
  return new Promise((res, rej) => {
    try {
      const r = indexedDB.open("seniorbooks", 1);
      r.onupgradeneeded = () => { try { r.result.createObjectStore("kv"); } catch (e) {} };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
}
async function idbSet(k, v) { try { const db = await idbOpen(); await new Promise((res, rej) => { const tx = db.transaction("kv", "readwrite"); tx.objectStore("kv").put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); db.close(); } catch (e) {} }
async function idbGet(k) { try { const db = await idbOpen(); const v = await new Promise((res, rej) => { const tx = db.transaction("kv", "readonly"); const rq = tx.objectStore("kv").get(k); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); }); db.close(); return v; } catch (e) { return null; } }
async function idbDel(k) { try { const db = await idbOpen(); await new Promise((res) => { const tx = db.transaction("kv", "readwrite"); tx.objectStore("kv").delete(k); tx.oncomplete = res; tx.onerror = res; }); db.close(); } catch (e) {} }

/* LEGACY password hash (FNV-1a 32-bit) — kept ONLY to verify hashes created by older versions.
   New/changed passwords use PBKDF2-SHA256 below; a legacy hash upgrades the next time the password is set. */
function hashPw(s) {
  let h = 2166136261 >>> 0;
  const str = "tc-salt-v1:" + String(s == null ? "" : s);
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return ("00000000" + h.toString(16)).slice(-8);
}
/* v2 password hash: PBKDF2-SHA256, 150k iterations, per-user random salt — stored as "v2:<saltHex>:<hashHex>".
   Still a LOCAL soft-gate (client-side data is readable with dev tools), but the stored hash is no longer
   reversible in milliseconds like the 32-bit FNV. */
const PW_ITER = 150000;
const bytesToHex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
async function hashPwStrong(pw, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex
    ? Uint8Array.from(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)))
    : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(String(pw == null ? "" : pw)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PW_ITER }, key, 256);
  return "v2:" + bytesToHex(salt) + ":" + bytesToHex(bits);
}
async function makePwHash(pw) {
  try { return await hashPwStrong(pw); } catch (e) { return hashPw(pw); } // no WebCrypto -> legacy fallback
}
async function verifyPw(pw, stored) {
  const st = String(stored || "");
  if (st.startsWith("v2:")) {
    const parts = st.split(":");
    try { return (await hashPwStrong(pw, parts[1])) === st; } catch (e) { return false; }
  }
  return st === hashPw(pw); // legacy FNV hash from older data
}

export default function AccountingApp() {
  const [lang, setLang] = useState("th"); // 'th' | 'en'
  const [vatRate, setVatRate] = useState(VAT_RATE); // configurable VAT rate (e.g. 0.07)
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // custom product groups (incl. empty ones)
  const [paperBoardsV, setPaperBoardsV] = useState(0);
  const [paperStockV, setPaperStockV] = useState(0);
  const [movements, setMovements] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);   // shop operating costs (salary, utilities, equipment) — separate from stock
  const [docs, setDocs] = useState([]);           // sales documents: quotation -> sales order -> delivery note
  const [payments, setPayments] = useState([]);   // receipts against credit sales (AR)
  const [apPayments, setApPayments] = useState([]); // payments against credit purchases (AP)
  const [assets, setAssets] = useState([]);       // fixed assets register (for depreciation)
  const [whts, setWhts] = useState([]);           // withholding-tax certificates (ภ.ง.ด.1/3/53)
  const [banks, setBanks] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]); // import/purchase records with input VAT + FX
  const [profile, setProfile] = useState({ shopName: "", shopAddress: "", taxId: "", branch: "สำนักงานใหญ่", phone: "", logo: "" });
  const [auth, setAuth] = useState({ enabled: false, users: [] }); // { enabled, users:[{id,username,name,level,pwHash}] }
  const [history, setHistory] = useState([]); // document audit trail: create/edit/cancel versions for every doc type
  const [advances, setAdvances] = useState([]); // supplier prepayments / T-T deposits paid before goods+invoice arrive — booked to asset 1170, applied to a purchase on arrival
  const [custDeposits, setCustDeposits] = useState([]); // customer deposits received before sale — reminder/tracker only (no journal); user issues one full invoice at sale
  const [payees, setPayees] = useState([]); // saved beneficiaries (suppliers' T/T bank details) — reused/auto-filled on supplier advances
  const [pendingSales, setPendingSales] = useState([]); // parked sales "waiting to bill" — stock already cut; journal + bill number happen when billed
  const [hsTable, setHsTable] = useState([]); // [{ hs, rate }] — HS code → import-duty % lookup, so same HS = same rate
  const [paperBoards, setPaperBoards] = useState([]); // [{id,name,sizes:[],rows:[{color,code,counts:[]}]}]
  const [tab, setTab] = useState("dashboard");
  const [posMode, setPosMode] = useState(false);     // salesperson-only view
  const [invoiceSale, setInvoiceSale] = useState(null); // sale shown in the printable invoice overlay
  const [voucherPurch, setVoucherPurch] = useState(null); // purchase shown in the printable payment-voucher overlay
  const [histView, setHistView] = useState(null); // { entity, id, rec } for the audit-history timeline modal
  const openHistory = (entity, rec) => setHistView({ entity, id: rec.id, rec: cloneRec(rec) });
  const [prefill, setPrefill] = useState(null); // sale being edited -> preload into checkout
  // --- login session (NOT persisted) ---
  const [sessionUser, setSessionUser] = useState(null); // who signed in (layer 1) -> {id,username,name,level}
  const [acctUnlock, setAcctUnlock] = useState(null);   // accounting unlock (layer 2, level>=2)
  const [acctLoginOpen, setAcctLoginOpen] = useState(false);
  const [paperLookupOpen, setPaperLookupOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(false);
  const [linkedFileName, setLinkedFileName] = useState(null); // name of the auto-save data file (File System Access API)
  const [fileSaveErr, setFileSaveErr] = useState("");
  const fileHandleRef = useRef(null);
  const fileBusyRef = useRef(false);
  const filePendingRef = useRef(null);
  const localSavedAtRef = useRef(""); // when this machine's data was last saved (for cross-machine check)
  // "unsaved changes" tracking: dirty until the latest data is flushed to the linked file OR exported
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState(false); // primary autosave (window.storage) failed — data lives only in memory/IndexedDB
  const dirtyRef = useRef(false);
  const firstSaveRunRef = useRef(true);
  const idbSaveTimer = useRef(null); // debounce full-data writes to IndexedDB (local autosave for file:// use)
  const markDirty = () => { if (!dirtyRef.current) { dirtyRef.current = true; setDirty(true); } };
  const markSaved = () => { if (dirtyRef.current) { dirtyRef.current = false; setDirty(false); } };

  const t = (th, en) => (lang === "th" ? th : lang === "en" ? en : `${th} / ${en}`);
  const accName = (a) => (lang === "th" ? a.th : lang === "en" ? a.en : `${a.th} / ${a.en}`);

  /* ---- load ---- */
  useEffect(() => {
    let active = true;
    (async () => {
      const hasStore = typeof window !== "undefined" && window.storage && window.storage.get;
      try {
        if (hasStore) {
          const r = await window.storage.get(STORAGE_KEY);
          if (active && r && r.value) {
            const d = JSON.parse(r.value);
            localSavedAtRef.current = d.savedAt || "";
            if (Array.isArray(d.accounts) && d.accounts.length) setAccounts(d.accounts);
            if (Array.isArray(d.entries)) setEntries(d.entries);
            if (Array.isArray(d.products)) setProducts(d.products);
            if (Array.isArray(d.categories)) setCategories(d.categories);
            if (typeof d.paperBoardsV === "number") setPaperBoardsV(d.paperBoardsV);
            if (typeof d.paperStockV === "number") setPaperStockV(d.paperStockV);
            if (Array.isArray(d.movements)) setMovements(d.movements);
            if (Array.isArray(d.customers)) setCustomers(d.customers);
            if (Array.isArray(d.expenses)) setExpenses(d.expenses);
            if (Array.isArray(d.docs)) setDocs(d.docs);
            if (Array.isArray(d.payments)) setPayments(d.payments);
            if (Array.isArray(d.apPayments)) setApPayments(d.apPayments);
            if (Array.isArray(d.assets)) setAssets(d.assets);
            if (Array.isArray(d.whts)) setWhts(d.whts);
            if (Array.isArray(d.banks)) setBanks(d.banks);
            if (Array.isArray(d.sales)) setSales(d.sales);
            if (Array.isArray(d.purchases)) setPurchases(d.purchases);
            if (d.profile && typeof d.profile === "object") setProfile((p) => ({ ...p, ...d.profile }));
            if (d.auth && typeof d.auth === "object") setAuth({ enabled: !!d.auth.enabled, users: Array.isArray(d.auth.users) ? d.auth.users : [] });
            if (Array.isArray(d.history)) setHistory(d.history);
            if (Array.isArray(d.advances)) setAdvances(d.advances);
            if (Array.isArray(d.custDeposits)) setCustDeposits(d.custDeposits);
            if (Array.isArray(d.payees)) setPayees(d.payees);
            if (Array.isArray(d.pendingSales)) setPendingSales(d.pendingSales);
            if (Array.isArray(d.hsTable)) setHsTable(d.hsTable);
            if (Array.isArray(d.paperBoards)) setPaperBoards(d.paperBoards);
            if (d.lang) setLang(d.lang === "both" ? "th" : d.lang);
            if (typeof d.vatRate === "number" && d.vatRate > 0) setVatRate(d.vatRate);
          }
        }
        // standalone (file://) has no window.storage — fall back to the local IndexedDB autosave so data reloads with no file picking
        if (active && !hasStore) {
          try { const raw = await idbGet("appData"); if (raw) { const d = JSON.parse(raw); restoreAll(d); localSavedAtRef.current = d.savedAt || ""; } } catch (e) {}
        }
      } catch (e) {
        /* first run / missing key — keep defaults */
      } finally {
        if (active) {
          setStorageOk(!!hasStore);
          setLoaded(true);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  /* ---- save ---- */
  useEffect(() => {
    if (!loaded) return;
    const savedAt = new Date().toISOString();
    const payload = { accounts, entries, products, categories, movements, customers, banks, sales, purchases, expenses, docs, payments, apPayments, assets, whts, history, advances, custDeposits, payees, pendingSales, hsTable, profile, auth, paperBoards, lang, vatRate, paperBoardsV, paperStockV, savedAt };
    localSavedAtRef.current = savedAt;
    if (firstSaveRunRef.current) firstSaveRunRef.current = false; else markDirty();
    (async () => {
      try {
        if (typeof window !== "undefined" && window.storage && window.storage.set) {
          await window.storage.set(STORAGE_KEY, JSON.stringify(payload));
          setSaveError(false);
        }
      } catch (e) { setSaveError(true); }
    })();
    // local autosave to IndexedDB — persists on file:// so reopening loads data instantly (no file picker needed)
    clearTimeout(idbSaveTimer.current);
    idbSaveTimer.current = setTimeout(() => { try { idbSet("appData", JSON.stringify(payload)); } catch (e) {} }, 700);
    if (fileHandleRef.current) writeLinkedFile(JSON.stringify(payload, null, 2));
    if (backupDirRef.current) writeDailyBackup(JSON.stringify(payload, null, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, entries, products, categories, movements, customers, banks, sales, purchases, expenses, docs, payments, apPayments, assets, whts, history, advances, custDeposits, payees, pendingSales, hsTable, profile, auth, paperBoards, lang, vatRate, paperBoardsV, paperStockV, loaded]);

  // Warn before closing the tab/window or reloading IF there are unsaved changes (browser shows its own generic message)
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!dirtyRef.current) return undefined;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // serialize + write to the linked data file, coalescing rapid changes
  const writeLinkedFile = async (json) => {
    const h = fileHandleRef.current;
    if (!h) return;
    if (fileBusyRef.current) { filePendingRef.current = json; return; }
    fileBusyRef.current = true;
    let ok = false;
    try {
      const w = await h.createWritable();
      await w.write(json);
      await w.close();
      setFileSaveErr(""); ok = true;
    } catch (e) {
      setFileSaveErr(t("เซฟลงไฟล์ไม่สำเร็จ — กด \"เชื่อมต่อใหม่\"", "Couldn't write the file — click \"Reconnect\"") + " (" + String((e && e.message) || e) + ")");
    } finally {
      fileBusyRef.current = false;
      if (filePendingRef.current != null) { const next = filePendingRef.current; filePendingRef.current = null; writeLinkedFile(next); }
      else if (ok) markSaved();
    }
  };

  const dataPayloadJSON = () => JSON.stringify({ accounts, entries, products, categories, movements, customers, banks, sales, purchases, expenses, docs, payments, apPayments, assets, whts, history, advances, custDeposits, payees, pendingSales, hsTable, profile, auth, paperBoards, lang, vatRate, paperBoardsV, paperStockV, savedAt: new Date().toISOString() }, null, 2);

  // restore a previously linked file handle on startup (Chrome/Edge)
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined" || !window.showOpenFilePicker) return;
      const h = await idbGet("dataFileHandle");
      if (!h) return;
      fileHandleRef.current = h;
      setLinkedFileName(h.name || t("ไฟล์ข้อมูล", "data file"));
      try {
        const perm = h.queryPermission ? await h.queryPermission({ mode: "readwrite" }) : "prompt";
        if (perm !== "granted") setFileSaveErr(t("ไฟล์ข้อมูลเชื่อมไว้แล้ว — กด \"เชื่อมต่อใหม่\" เพื่อให้เซฟอัตโนมัติทำงานต่อ", "Data file linked — click \"Reconnect\" to resume auto-save"));
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const linkDataFile = async () => {
    if (typeof window === "undefined" || !window.showOpenFilePicker) { window.alert(t("ใช้ได้บน Chrome หรือ Edge เท่านั้น", "Available on Chrome or Edge only")); return; }
    try {
      const [h] = await window.showOpenFilePicker({ multiple: false, types: [{ description: "JSON", accept: { "application/json": [".json"] } }] });
      const perm = await h.requestPermission({ mode: "readwrite" });
      if (perm !== "granted") { setFileSaveErr(t("ไม่ได้รับสิทธิ์เขียนไฟล์", "Write permission denied")); return; }
      try {
        const file = await h.getFile();
        const text = await file.text();
        if (text && text.trim()) {
          const obj = JSON.parse(text);
          if (window.confirm(t("ไฟล์นี้มีข้อมูลอยู่แล้ว — โหลดข้อมูลจากไฟล์นี้มาใช้แทนของในเครื่องไหม? (เลือก OK ถ้านี่คือไฟล์ข้อมูลหลักของคุณบน Drive)", "This file already has data — load it and replace what's on this device? (OK if this is your main data file on Drive.)"))) {
            restoreAll(obj);
          }
        }
      } catch (e) { /* empty or non-JSON file — will be overwritten on next save */ }
      fileHandleRef.current = h;
      setLinkedFileName(h.name);
      await idbSet("dataFileHandle", h);
      writeLinkedFile(dataPayloadJSON());
    } catch (e) { /* user cancelled the picker */ }
  };

  const linkNewDataFile = async () => {
    if (typeof window === "undefined" || !window.showSaveFilePicker) { window.alert(t("ใช้ได้บน Chrome หรือ Edge เท่านั้น", "Available on Chrome or Edge only")); return; }
    try {
      const h = await window.showSaveFilePicker({ suggestedName: "thaicolor-data.json", types: [{ description: "JSON", accept: { "application/json": [".json"] } }] });
      const perm = await h.requestPermission({ mode: "readwrite" });
      if (perm !== "granted") { setFileSaveErr(t("ไม่ได้รับสิทธิ์เขียนไฟล์", "Write permission denied")); return; }
      fileHandleRef.current = h;
      setLinkedFileName(h.name);
      await idbSet("dataFileHandle", h);
      writeLinkedFile(dataPayloadJSON());
    } catch (e) { /* cancelled */ }
  };

  const reconnectDataFile = async () => {
    const h = fileHandleRef.current;
    if (!h) return;
    try {
      const perm = await h.requestPermission({ mode: "readwrite" });
      if (perm === "granted") { setFileSaveErr(""); writeLinkedFile(dataPayloadJSON()); }
      else setFileSaveErr(t("ยังไม่ได้รับสิทธิ์", "Permission not granted"));
    } catch (e) {}
  };

  const unlinkDataFile = async () => {
    fileHandleRef.current = null;
    setLinkedFileName(null);
    setFileSaveErr("");
    await idbDel("dataFileHandle");
  };

  /* ---- daily auto-backup to folder(s): in-device + Google Drive — keep last 7 days, with cross-machine check ---- */
  const backupDirRef = useRef(null);   // in-device folder
  const driveDirRef = useRef(null);    // a folder inside Google Drive (synced by Google Drive for Desktop)
  const backupBusyRef = useRef(false);
  const backupLastWriteRef = useRef(0);
  const [backupDirName, setBackupDirName] = useState("");
  const [driveDirName, setDriveDirName] = useState("");
  const [backupErr, setBackupErr] = useState("");
  const [backupLastDate, setBackupLastDate] = useState("");
  const crossCheckedRef = useRef(false);
  const [newerBackup, setNewerBackup] = useState(null); // { savedAt, data, where }

  const backupFileName = () => { const d = todayISO(); const n = new Date(); const p = (x) => String(x).padStart(2, "0"); const hms = p(n.getHours()) + p(n.getMinutes()) + p(n.getSeconds()); return "thaicolor-backup-" + (Number(d.slice(0, 4)) + 543) + d.slice(4) + "_" + hms + ".json"; };

  // write one dated snapshot into a directory, then prune to the latest 7
  const writeOneDir = async (dir, json) => {
    if ((await dir.queryPermission({ mode: "readwrite" })) !== "granted") throw new Error("perm");
    const fh = await dir.getFileHandle(backupFileName(), { create: true });
    const w = await fh.createWritable(); await w.write(json); await w.close();
    const names = [];
    for await (const entry of dir.keys()) { if (/^thaicolor-backup-\d{4}-\d{2}-\d{2}(_\d{6})?\.json$/.test(entry)) names.push(entry); }
    names.sort().reverse();
    for (const n of names.slice(30)) { try { await dir.removeEntry(n); } catch (e) {} }
  };

  const writeDailyBackup = async (json, force) => {
    if (!backupDirRef.current && !driveDirRef.current) return;
    const now = Date.now();
    if (!force && now - backupLastWriteRef.current < 15 * 60 * 1000) return; // at most every 15 min
    if (backupBusyRef.current) return;
    backupBusyRef.current = true;
    let wrote = false, err = "";
    try {
      for (const dir of [backupDirRef.current, driveDirRef.current]) {
        if (!dir) continue;
        try { await writeOneDir(dir, json); wrote = true; }
        catch (e) { err = t("บางโฟลเดอร์ยังไม่ได้สิทธิ์ — กดเชื่อมต่อสำรองใหม่", "A folder needs permission — tap reconnect"); }
      }
      if (wrote) { backupLastWriteRef.current = now; setBackupLastDate(todayISO()); }
      setBackupErr(err);
    } finally { backupBusyRef.current = false; }
  };

  // read the newest dated snapshot in a folder -> { savedAt, data } | null
  const readLatestFromDir = async (dir) => {
    try {
      if (!dir || (await dir.queryPermission({ mode: "readwrite" })) !== "granted") return null;
      const names = [];
      for await (const entry of dir.keys()) { if (/^thaicolor-backup-\d{4}-\d{2}-\d{2}(_\d{6})?\.json$/.test(entry)) names.push(entry); }
      if (!names.length) return null;
      names.sort().reverse();
      const fh = await dir.getFileHandle(names[0]); const file = await fh.getFile();
      const data = JSON.parse(await file.text());
      return { savedAt: data.savedAt || new Date(file.lastModified).toISOString(), data };
    } catch (e) { return null; }
  };

  // before use: compare this machine's data with the newest backup across folders; offer to load the latest
  const crossCheck = async () => {
    if (crossCheckedRef.current) return;
    const targets = [[t("ในเครื่อง", "in-device"), backupDirRef.current], ["Google Drive", driveDirRef.current]].filter((x) => x[1]);
    if (!targets.length) return;
    crossCheckedRef.current = true;
    let best = null;
    for (const [where, dir] of targets) {
      const r = await readLatestFromDir(dir);
      if (r && r.savedAt && (!best || r.savedAt > best.savedAt)) best = { ...r, where };
    }
    if (!best) return;
    const local = localSavedAtRef.current || "";
    const bestHasData = best.data && ((best.data.sales || []).length + (best.data.products || []).length + (best.data.customers || []).length) > 0;
    const localEmpty = (sales.length + products.length + customers.length) === 0;
    const newer = best.savedAt > local && (new Date(best.savedAt) - new Date(local || 0)) > 60 * 1000;
    // prompt if a backup is clearly newer, OR this device is empty while a backup has data
    if (bestHasData && (newer || localEmpty)) {
      setNewerBackup({ savedAt: best.savedAt, data: best.data, where: best.where });
    }
  };
  const acceptNewerBackup = () => { if (newerBackup && newerBackup.data) { restoreAll(newerBackup.data); localSavedAtRef.current = newerBackup.savedAt; } setNewerBackup(null); };

  const pickDir = async (which) => {
    try {
      if (typeof window === "undefined" || !window.showDirectoryPicker) { window.alert(t("เบราว์เซอร์นี้ไม่รองรับการสำรองอัตโนมัติ — ใช้ Chrome หรือ Edge (ใช้ได้ทั้ง Mac และ PC)", "Auto-backup needs Chrome or Edge (works on both Mac and PC)")); return; }
      const dir = await window.showDirectoryPicker({ id: which === "drive" ? "tc-backup-drive" : "tc-backup-local", mode: "readwrite" });
      if (which === "drive") { driveDirRef.current = dir; setDriveDirName(dir.name || "Google Drive"); await idbSet("driveDirHandle", dir); }
      else { backupDirRef.current = dir; setBackupDirName(dir.name || "backup"); await idbSet("backupDirHandle", dir); }
      setBackupErr("");
      await writeDailyBackup(dataPayloadJSON(), true);
      crossCheckedRef.current = false; crossCheck();
    } catch (e) { /* cancelled */ }
  };
  const pickBackupDir = () => pickDir("local");
  const pickDriveDir = () => pickDir("drive");

  const reconnectBackupDir = async () => {
    try {
      for (const dir of [backupDirRef.current, driveDirRef.current]) { if (dir && dir.requestPermission) await dir.requestPermission({ mode: "readwrite" }); }
      setBackupErr(""); await writeDailyBackup(dataPayloadJSON(), true);
      crossCheckedRef.current = false; crossCheck();
    } catch (e) {}
  };

  const backupNow = () => writeDailyBackup(dataPayloadJSON(), true);
  const unlinkBackupDir = async () => { backupDirRef.current = null; setBackupDirName(""); setBackupErr(""); setBackupLastDate(""); await idbDel("backupDirHandle"); };
  const unlinkDriveDir = async () => { driveDirRef.current = null; setDriveDirName(""); await idbDel("driveDirHandle"); };

  // restore folder handles on startup, then cross-check once data has loaded & permission is granted
  useEffect(() => {
    (async () => {
      try {
        const dh = await idbGet("backupDirHandle");
        if (dh) { backupDirRef.current = dh; setBackupDirName(dh.name || "backup"); const p = await dh.queryPermission({ mode: "readwrite" }); if (p !== "granted") setBackupErr(t("กดเพื่อเปิดสำรอง/ตรวจข้อมูลล่าสุดต่อ", "Tap to resume backup / latest-data check")); }
        const gh = await idbGet("driveDirHandle");
        if (gh) { driveDirRef.current = gh; setDriveDirName(gh.name || "Google Drive"); }
        if (loaded) crossCheck();
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const forceSyncNow = () => { if (fileHandleRef.current) writeLinkedFile(dataPayloadJSON()); };

  // list daily snapshots in the connected folders (newest first) for manual "load a past backup"
  const listBackups = async () => {
    const out = [];
    const dirs = [["local", t("ในเครื่อง", "in-device"), backupDirRef.current], ["drive", "Google Drive", driveDirRef.current]];
    for (const [dirKey, where, dir] of dirs) {
      if (!dir) continue;
      try {
        if ((await dir.queryPermission({ mode: "readwrite" })) !== "granted") continue;
        for await (const entry of dir.keys()) {
          const m = /^thaicolor-backup-(\d{4})-(\d{2})-(\d{2})(?:_(\d{6}))?\.json$/.exec(entry);
          if (!m) continue;
          let lastModified = 0, savedAt = "", counts = null, size = 0;
          try {
            const fh = await dir.getFileHandle(entry); const f = await fh.getFile(); lastModified = f.lastModified; size = f.size;
            const j = JSON.parse(await f.text());
            savedAt = j.savedAt || "";
            counts = { sales: (j.sales || []).length, products: (j.products || []).length, customers: (j.customers || []).length };
          } catch (e) {}
          out.push({ dirKey, where, name: entry, dateISO: (parseInt(m[1], 10) - 543) + "-" + m[2] + "-" + m[3], time: m[4] || "", lastModified, savedAt, counts, size });
        }
      } catch (e) {}
    }
    out.sort((a, b) => (b.name + b.lastModified).localeCompare(a.name + a.lastModified));
    return out;
  };
  const loadBackup = async (item) => {
    if (gateOn && acctLevel < 3) { window.alert(t("กู้คืนข้อมูลได้เฉพาะผู้ดูแล (ระดับ 3)", "Only an admin (level 3) can restore data.")); return false; }
    const dir = item.dirKey === "drive" ? driveDirRef.current : backupDirRef.current;
    if (!dir) return false;
    try {
      const fh = await dir.getFileHandle(item.name); const f = await fh.getFile();
      const data = JSON.parse(await f.text());
      restoreAll(data); localSavedAtRef.current = data.savedAt || new Date(f.lastModified).toISOString();
      return true;
    } catch (e) { window.alert(t("โหลดไฟล์สำรองไม่สำเร็จ", "Couldn't load that backup")); return false; }
  };

  // ---- login / roles ----
  const gateOn = auth.enabled && (auth.users || []).length > 0;
  const acctLevel = !gateOn ? 3 : (acctUnlock ? acctUnlock.level : 1); // level used by accounting screens
  const showCost = acctLevel >= 3; // cost & profit & sales-totals are level-3 only
  const findUser = (u) => (auth.users || []).find((x) => (x.username || "").trim().toLowerCase() === String(u || "").trim().toLowerCase());
  // on a successful login with a LEGACY (FNV) hash, silently upgrade the stored hash to PBKDF2 v2
  const upgradeHashIfLegacy = async (usr, pw) => {
    if (String(usr.pwHash || "").startsWith("v2:")) return;
    try { const nh = await hashPwStrong(pw); setAuth((prev) => ({ ...prev, users: (prev.users || []).map((x) => (x.id === usr.id ? { ...x, pwHash: nh } : x)) })); } catch (e) {}
  };
  const signIn = async (u, pw) => {
    const usr = findUser(u);
    if (usr && (await verifyPw(pw, usr.pwHash))) { await upgradeHashIfLegacy(usr, pw); setSessionUser({ id: usr.id, username: usr.username, name: usr.name, level: usr.level }); setAcctUnlock(null); setPosMode(true); return true; }
    return false;
  };
  const acctSignIn = async (u, pw) => {
    const usr = findUser(u);
    if (usr && usr.level >= 2 && (await verifyPw(pw, usr.pwHash))) { await upgradeHashIfLegacy(usr, pw); setAcctUnlock({ id: usr.id, username: usr.username, name: usr.name, level: usr.level }); setAcctLoginOpen(false); setPosMode(false); setTab(usr.level >= 3 ? "dashboard" : "inventory"); return true; }
    return false;
  };
  const lockToPos = () => { setAcctUnlock(null); setPosMode(true); setTab("dashboard"); };
  const logout = () => { setAcctUnlock(null); setSessionUser(null); setPosMode(false); };

  const saveUser = async (u) => {
    if (gateOn && acctLevel < 3) { window.alert(t("ต้องเป็นผู้ดูแล (ระดับ 3) เท่านั้น", "Admin (level 3) only.")); return; }
    // hash outside the state updater (PBKDF2 is async); new/changed passwords get the v2 hash
    const newHash = u.password ? await makePwHash(u.password) : null;
    const blankHash = await makePwHash("");
    setAuth((prev) => {
      const users = [...(prev.users || [])];
      const i = u.id ? users.findIndex((x) => x.id === u.id) : -1;
      const rec = {
        id: u.id || uid(), username: (u.username || "").trim(), name: (u.name || "").trim(), level: Number(u.level) || 1,
        pwHash: newHash != null ? newHash : (i >= 0 ? users[i].pwHash : blankHash),
      };
      if (i >= 0) users[i] = rec; else users.push(rec);
      return { ...prev, users };
    });
  };
  const deleteUser = (id) => { if (gateOn && acctLevel < 3) { window.alert(t("ต้องเป็นผู้ดูแล (ระดับ 3) เท่านั้น", "Admin (level 3) only.")); return; } setAuth((prev) => ({ ...prev, users: (prev.users || []).filter((x) => x.id !== id) })); };
  const setAuthEnabled = (on) => { if (gateOn && acctLevel < 3) { window.alert(t("ต้องเป็นผู้ดูแล (ระดับ 3) เท่านั้น", "Admin (level 3) only.")); return; } setAuth((prev) => ({ ...prev, enabled: !!on })); };

  // ---- paper-stock boards ----
  const savePaperBoards = (boards) => setPaperBoards(boards);
  const paperBoardsLive = buildPaperBoards(products); // pivot of REAL product stock (updates with sales/receipts)
  const updatePaperCount = (boardId, rowIdx, sizeIdx, val) => {
    setPaperBoards((prev) => prev.map((b) => {
      if (b.id !== boardId) return b;
      const rows = b.rows.map((r, ri) => {
        if (ri !== rowIdx) return r;
        const counts = [...(r.counts || [])]; counts[sizeIdx] = Math.max(0, Math.floor(Number(val) || 0));
        return { ...r, counts };
      });
      return { ...b, rows };
    }));
  };

  /* ---- derived ---- */
  const acctById = useMemo(() => {
    const m = {};
    accounts.forEach((a) => (m[a.id] = a));
    return m;
  }, [accounts]);

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => a.code.localeCompare(b.code)),
    [accounts]
  );

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) =>
        a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1
      ),
    [entries]
  );

  // {debit, credit} totals per account id
  // documents excluding cancelled ones — fed to array-based reports (GL reports self-correct via reversing entries)
  const activeSales = useMemo(() => sales.filter((s) => !s.voided), [sales]);
  const activePurchases = useMemo(() => purchases.filter((p) => !p.voided), [purchases]);
  const activeExpenses = useMemo(() => expenses.filter((e) => !e.voided), [expenses]);
  const totals = useMemo(() => {
    const m = {};
    accounts.forEach((a) => (m[a.id] = { debit: 0, credit: 0 }));
    entries.forEach((e) =>
      e.lines.forEach((l) => {
        if (!m[l.accountId]) m[l.accountId] = { debit: 0, credit: 0 };
        m[l.accountId].debit += Number(l.debit) || 0;
        m[l.accountId].credit += Number(l.credit) || 0;
      })
    );
    return m;
  }, [accounts, entries]);

  // balance in account's normal direction
  const balanceOf = (a) => {
    const tt = totals[a.id] || { debit: 0, credit: 0 };
    return isDebitNormal(a.type) ? tt.debit - tt.credit : tt.credit - tt.debit;
  };

  const sumByType = (type) =>
    accounts.filter((a) => a.type === type).reduce((s, a) => s + balanceOf(a), 0);

  const totalAssets = sumByType("asset");
  const totalLiab = sumByType("liability");
  const totalEquityAccts = sumByType("equity");
  const totalRevenue = sumByType("revenue");
  const totalExpense = sumByType("expense");
  const netIncome = totalRevenue - totalExpense;
  const totalEquity = totalEquityAccts + netIncome;

  // trial balance grand totals
  const tbDebit = accounts.reduce((s, a) => {
    const tt = totals[a.id]; const net = (tt.debit - tt.credit);
    return s + (net > 0 ? net : 0);
  }, 0);
  const tbCredit = accounts.reduce((s, a) => {
    const tt = totals[a.id]; const net = (tt.debit - tt.credit);
    return s + (net < 0 ? -net : 0);
  }, 0);
  const balanced = Math.abs(tbDebit - tbCredit) < 0.005;
  const bsBalanced = Math.abs(totalAssets - (totalLiab + totalEquity)) < 0.005;

  /* ---- actions ---- */
  const addEntry = (entry) => setEntries((p) => [...p, entry]);

  // ---- document version & audit history (shared by every doc type) ----
  const nowTS = () => new Date().toISOString();
  const cloneRec = (x) => { try { return JSON.parse(JSON.stringify(x)); } catch (e) { return x; } };
  const docNoOf = (rec) => (rec && (rec.billNo || rec.docNo || rec.no || rec.number || rec.refNo || rec.name)) || "";
  // stamp version metadata onto a record before saving (old = existing record if editing)
  const stampVer = (rec, old) => {
    const now = nowTS();
    if (old) return { ...rec, rev: (Number(old.rev) || 0) + 1, createdAt: old.createdAt || rec.date || now, updatedAt: now, voided: !!old.voided, voidedAt: old.voidedAt || null, voidRev: Number(old.voidRev) || 0 };
    return { ...rec, rev: Number(rec.rev) || 0, createdAt: rec.createdAt || rec.date || now, updatedAt: now };
  };
  // append a history event; backfills a "create" snapshot for records made before this system existed
  const logEvent = (action, entity, rec, old) => {
    const ev = { id: uid(), ts: nowTS(), action, entity, entityId: rec.id, docNo: docNoOf(rec), rev: Number(rec.rev) || 0, snapshot: cloneRec(rec) };
    setHistory((prev) => {
      let base = prev;
      if (action !== "create" && old && !prev.some((h) => h.entity === entity && h.entityId === rec.id)) {
        base = [...prev, { id: uid(), ts: old.createdAt || old.date || ev.ts, action: "create", entity, entityId: rec.id, docNo: docNoOf(old), rev: Number(old.rev) || 0, snapshot: cloneRec(old), backfilled: true }];
      }
      return [...base, ev];
    });
  };
  // negate a journal entry's lines (debit<->credit) to build a reversing entry
  const reverseLines = (lines) => (Array.isArray(lines) ? lines : []).map((l) => ({ accountId: l.accountId, debit: Number(l.credit) || 0, credit: Number(l.debit) || 0 }));

  const deleteEntry = (id) => {
    const ent = entries.find((e) => e.id === id);
    if (!ent) return;
    if (ent.voided) { window.alert(t("รายการนี้ถูกยกเลิกแล้ว", "This entry is already cancelled.")); return; }
    if (!window.confirm(t("ยกเลิกรายการบัญชีนี้? ระบบจะตั้งรายการกลับให้อัตโนมัติ (เก็บของเดิมไว้ดูย้อนหลัง)", "Cancel this journal entry? A reversing entry will be posted automatically (original kept on record)."))) return;
    let voidJournalId = null;
    if (Array.isArray(ent.lines) && ent.lines.length) {
      voidJournalId = uid();
      addEntry({ id: voidJournalId, date: todayISO(), desc: "กลับรายการ / Reversal — " + (ent.desc || ""), lines: reverseLines(ent.lines), reversalOf: ent.id });
    }
    const voided = { ...ent, voided: true, voidedAt: nowTS(), voidRev: (Number(ent.voidRev) || 0) + 1, voidJournalId };
    setEntries((prev) => prev.map((e) => (e.id === id ? voided : e)));
    logEvent("cancel", "entry", voided, ent);
  };
  const addAccount = (acc) => setAccounts((p) => [...p, acc]);
  const deleteAccount = (id) => setAccounts((p) => p.filter((a) => a.id !== id));

  // inventory
  const addProduct = (prod) => setProducts((p) => [...p, prod]);
  const addCategory = (name) => { const n = String(name || "").trim(); if (!n) return; setCategories((c) => (c.includes(n) ? c : [...c, n])); };
  const deleteCategory = (name) => { setCategories((c) => c.filter((x) => x !== name)); };
  const updateProduct = (id, patch) =>
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, ...(typeof patch === "function" ? patch(x) : patch) } : x)));
  const deleteProduct = (id) => {
    setProducts((p) => p.filter((x) => x.id !== id));
    setMovements((m) => m.filter((x) => x.productId !== id));
  };
  const addMovement = (mv) => setMovements((m) => [...m, { id: uid(), date: todayISO(), ...mv }]);

  // commit a scanned cart: reduce stock (FIFO), log movements, optionally post journal
  const sellCart = (lines, { postJournal }) => {
    let totalCogs = 0;
    const next = products.map((p) => {
      const ls = lines.filter((l) => l.productId === p.id);
      if (!ls.length) return p;
      if (p.tracksSerial) {
        const sold = new Set(ls.map((l) => l.serial));
        (p.serials || []).forEach((s) => { if (sold.has(s.serial)) totalCogs += Number(s.cost != null ? s.cost : p.cost) || 0; });
        return { ...p, serials: (p.serials || []).map((s) => (sold.has(s.serial) ? { ...s, status: "sold", soldAt: todayISO() } : s)) };
      }
      const qtySold = ls.reduce((s, l) => s + (Number(l.qty) || 0), 0);
      const startLayers = (Array.isArray(p.layers) && p.layers.length)
        ? p.layers.map((x) => ({ qty: Number(x.qty) || 0, unitCost: Number(x.unitCost) || 0 }))
        : [{ qty: Number(p.qty) || 0, unitCost: Number(p.cost) || 0 }];
      const { layers: newLayers, cogs } = consumeFIFO(startLayers, qtySold);
      totalCogs += cogs;
      const newQty = newLayers.reduce((s, x) => s + x.qty, 0);
      return { ...p, layers: newLayers, qty: newQty };
    });
    setProducts(next);
    setMovements((prev) => [
      ...prev,
      ...lines.map((l) => ({ id: uid(), date: todayISO(), type: "out", productId: l.productId, qty: Number(l.qty) || 1, serial: l.serial || null, note: "ขาย / Sale" })),
    ]);
    if (postJournal) {
      const rev = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
      const cost = Math.round(totalCogs * 100) / 100;
      const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
      const jl = [];
      if (rev > 0 && accId("1010") && accId("4010")) {
        jl.push({ accountId: accId("1010"), debit: rev, credit: 0 });
        jl.push({ accountId: accId("4010"), debit: 0, credit: rev });
      }
      if (cost > 0 && accId("5010") && accId("1040")) {
        jl.push({ accountId: accId("5010"), debit: cost, credit: 0 });
        jl.push({ accountId: accId("1040"), debit: 0, credit: cost });
      }
      if (jl.length >= 2) addEntry({ id: uid(), date: todayISO(), desc: "ขายสินค้า ตัดสต๊อค FIFO / Sale (FIFO stock out)", lines: jl });
    }
  };

  // master data CRUD
  const saveCustomer = (c) => {
    let id = c.id;
    setCustomers((prev) => {
      if (id && prev.some((x) => x.id === id)) return prev.map((x) => (x.id === id ? { ...x, ...c } : x));
      id = id || uid();
      return [...prev, { ...c, id }];
    });
    return id;
  };
  const deleteCustomer = (id) => setCustomers((prev) => prev.filter((x) => x.id !== id));
  const addCustDeposit = (p) => { const rec = { id: uid(), date: p.date || todayISO(), customer: p.customer || "", customerId: p.customerId || null, address: p.address || "", taxId: p.taxId || "", amount: round2(p.amount), channel: p.channel || "transfer", bankId: p.bankId || null, chequeNo: p.chequeNo || "", chequeDate: p.chequeDate || "", note: p.note || "", status: "open", bill: "", createdAt: new Date().toISOString() }; setCustDeposits((prev) => [rec, ...prev]); };
  const markCustDepositUsed = (id, billNo) => setCustDeposits((prev) => prev.map((d) => d.id === id ? (d.status === "used" ? { ...d, status: "open", bill: "" } : { ...d, status: "used", bill: billNo || "" }) : d));
  const deleteCustDeposit = (id) => { if (!window.confirm(t("ลบรายการมัดจำลูกค้านี้?", "Delete this customer deposit?"))) return; setCustDeposits((prev) => prev.filter((d) => d.id !== id)); };
  const saveExpense = (e) => { const id = e.id || uid(); const old = expenses.find((x) => x.id === id); const rec = stampVer({ ...e, id }, old); setExpenses((prev) => { const i = prev.findIndex((x) => x.id === id); if (i >= 0) { const n = [...prev]; n[i] = rec; return n; } return [...prev, rec]; }); logEvent(old ? "edit" : "create", "expense", rec, old); };
  const deleteExpense = (id) => { const rec = expenses.find((x) => x.id === id); if (!rec) return; if (rec.voided) { window.alert(t("รายการนี้ถูกยกเลิกแล้ว", "Already cancelled.")); return; } if (!window.confirm(t("ยกเลิกรายการค่าใช้จ่ายนี้? (เก็บไว้ดูย้อนหลังได้ ไม่ถูกลบ)", "Cancel this expense? (kept on record, not deleted)"))) return; const voided = { ...rec, voided: true, voidedAt: nowTS(), voidRev: (Number(rec.voidRev) || 0) + 1 }; setExpenses((prev) => prev.map((x) => (x.id === id ? voided : x))); logEvent("cancel", "expense", voided, rec); };
  const saveDoc = (d) => { const id = d.id || uid(); const old = docs.find((x) => x.id === id); const rec = stampVer({ ...d, id }, old); setDocs((prev) => { const i = prev.findIndex((x) => x.id === id); if (i >= 0) { const n = [...prev]; n[i] = rec; return n; } return [...prev, rec]; }); logEvent(old ? "edit" : "create", "doc", rec, old); };
  const deleteDoc = (id) => { const rec = docs.find((x) => x.id === id); if (!rec) return; if (rec.voided) { window.alert(t("เอกสารนี้ถูกยกเลิกแล้ว", "This document is already cancelled.")); return; } if (!window.confirm(t("ยกเลิกเอกสารนี้? (เก็บไว้ดูย้อนหลังได้ ไม่ถูกลบ)", "Cancel this document? (kept on record, not deleted)"))) return; const voided = { ...rec, voided: true, voidedAt: nowTS(), voidRev: (Number(rec.voidRev) || 0) + 1 }; setDocs((prev) => prev.map((x) => (x.id === id ? voided : x))); logEvent("cancel", "doc", voided, rec); };
  // A/R receipt: Dr cash/bank, Cr 1030 — journaled only when the source bill itself posted a journal
  const addPayment = (p) => {
    const sale = sales.find((s) => s.id === p.refId);
    let journalId = null;
    const amt = round2(Number(p.amount) || 0);
    if (sale && sale.journalId && amt > 0) {
      ensureAccounts(["1010", "1020", "1030"]);
      const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
      const drCode = p.channel === "cash" ? "1010" : "1020";
      const dr = accId(drCode) || "a" + drCode;
      const ar = accId("1030") || "a1030";
      journalId = uid();
      addEntry({ id: journalId, date: p.date || todayISO(), desc: "รับชำระลูกหนี้ บิล " + (sale.billNo || "") + " / A/R receipt " + (sale.billNo || ""), lines: [{ accountId: dr, debit: amt, credit: 0 }, { accountId: ar, debit: 0, credit: amt }] });
    }
    setPayments((prev) => [...prev, { ...p, journalId }]);
  };
  const deletePayment = (id) => {
    const pay = payments.find((x) => x.id === id);
    if (pay && pay.journalId) setEntries((prev) => prev.filter((e) => e.id !== pay.journalId));
    setPayments((prev) => prev.filter((x) => x.id !== id));
  };
  // A/P payment: Dr 2010, Cr cash/bank — journaled only when the source purchase posted a journal
  const addApPayment = (p) => {
    const purch = purchases.find((x) => x.id === p.refId);
    let journalId = null;
    const amt = round2(Number(p.amount) || 0);
    if (purch && purch.journalId && amt > 0) {
      ensureAccounts(["1010", "1020", "2010"]);
      const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
      const crCode = p.channel === "cash" ? "1010" : "1020";
      const cr = accId(crCode) || "a" + crCode;
      const ap = accId("2010") || "a2010";
      journalId = uid();
      addEntry({ id: journalId, date: p.date || todayISO(), desc: "จ่ายชำระเจ้าหนี้ " + (purch.docNo || purch.supplier || "") + " / A/P payment " + (purch.docNo || ""), lines: [{ accountId: ap, debit: amt, credit: 0 }, { accountId: cr, debit: 0, credit: amt }] });
    }
    setApPayments((prev) => [...prev, { ...p, journalId }]);
  };
  const deleteApPayment = (id) => {
    const pay = apPayments.find((x) => x.id === id);
    if (pay && pay.journalId) setEntries((prev) => prev.filter((e) => e.id !== pay.journalId));
    setApPayments((prev) => prev.filter((x) => x.id !== id));
  };
  const saveAsset = (a2) => { const id = a2.id || uid(); const old = assets.find((x) => x.id === id); const rec = stampVer({ ...a2, id }, old); setAssets((prev) => { const i = prev.findIndex((x) => x.id === id); if (i >= 0) { const n = [...prev]; n[i] = rec; return n; } return [...prev, rec]; }); logEvent(old ? "edit" : "create", "asset", rec, old); };
  const deleteAsset = (id) => { const rec = assets.find((x) => x.id === id); if (!rec) return; if (rec.voided) { window.alert(t("ทรัพย์สินนี้ถูกยกเลิกแล้ว", "This asset is already cancelled.")); return; } if (!window.confirm(t("ยกเลิก/ตัดรายการทรัพย์สินนี้? (เก็บไว้ดูย้อนหลังได้ ไม่ถูกลบ)", "Cancel/dispose this asset? (kept on record, not deleted)"))) return; const voided = { ...rec, voided: true, voidedAt: nowTS(), voidRev: (Number(rec.voidRev) || 0) + 1 }; setAssets((prev) => prev.map((x) => (x.id === id ? voided : x))); logEvent("cancel", "asset", voided, rec); };
  const saveWht = (w) => { const id = w.id || uid(); const old = whts.find((x) => x.id === id); const rec = stampVer({ ...w, id }, old); setWhts((prev) => { const i = prev.findIndex((x) => x.id === id); if (i >= 0) { const n = [...prev]; n[i] = rec; return n; } return [...prev, rec]; }); logEvent(old ? "edit" : "create", "wht", rec, old); };
  const deleteWht = (id) => { const rec = whts.find((x) => x.id === id); if (!rec) return; if (rec.voided) { window.alert(t("หนังสือรับรองนี้ถูกยกเลิกแล้ว", "This certificate is already cancelled.")); return; } if (!window.confirm(t("ยกเลิกหนังสือรับรองหัก ณ ที่จ่ายนี้? (เก็บไว้ดูย้อนหลังได้ ไม่ถูกลบ)", "Cancel this withholding-tax certificate? (kept on record, not deleted)"))) return; const voided = { ...rec, voided: true, voidedAt: nowTS(), voidRev: (Number(rec.voidRev) || 0) + 1 }; setWhts((prev) => prev.map((x) => (x.id === id ? voided : x))); logEvent("cancel", "wht", voided, rec); };
  const issueDocAsBill = (d) => {
    setPrefill({ _token: uid(), items: (d.items || []).map((l) => ({ productId: l.productId, serial: l.serial || null, qty: l.qty, price: l.price, cost: l.cost, name: l.name })), customerId: d.customerId || "", customer: d.customer || null, vatEnabled: !!d.vatEnabled, discountType: d.discountType || "amount", discountValue: d.discountValue || 0, channel: "cash" });
    setTab("sell");
  };
  // POS "enter serial manually": save it into the product's stock, then the sale marks it sold
  const attachSerialToProduct = (pid, serial) => setProducts((prev) => prev.map((p) => p.id === pid
    // never flip a qty-tracked product with stock on hand into serial mode (would hide its qty/layers)
    ? { ...p, tracksSerial: p.tracksSerial || !((Number(p.qty) || 0) > 0 || (p.layers || []).some((l) => (Number(l.qty) || 0) > 0)), serials: [...(p.serials || []).filter((sr) => norm(sr.serial) !== norm(serial)), { serial, status: "in", addedAt: todayISO(), cost: Number(p.cost) || 0 }] }
    : p));
  // warranty claim: link old serial -> a new in-stock serial (same product), carry original sale info onto the replacement
  const claimSerial = ({ productId, oldSerial, newSerial, origSoldAt, origCustomer }) => {
    if (!productId || !oldSerial || !newSerial) return;
    setProducts((prev) => prev.map((p) => {
      if (p.id !== productId) return p;
      const serials = (p.serials || []).map((s) => {
        if (norm(s.serial) === norm(oldSerial)) return { ...s, claimedAt: todayISO(), replacedBy: newSerial };
        if (norm(s.serial) === norm(newSerial)) return { ...s, status: "sold", replaces: oldSerial, claimedAt: todayISO(), replaceSoldAt: origSoldAt || s.soldAt || null, replaceCustomer: origCustomer || null };
        return s;
      });
      return { ...p, serials };
    }));
    setMovements((prev) => [...prev, { id: uid(), date: todayISO(), type: "out", productId, qty: 1, serial: newSerial, note: "เคลมแทน " + oldSerial + " / Warranty replacement" }]);
  };
  const saveBank = (b) => setBanks((prev) => (b.id && prev.some((x) => x.id === b.id) ? prev.map((x) => (x.id === b.id ? { ...x, ...b } : x)) : [...prev, { ...b, id: b.id || uid() }]));
  const deleteBank = (id) => setBanks((prev) => prev.filter((x) => x.id !== id));

  // commit a full sale: FIFO stock-out, journal (channel + VAT + discount + COGS), store sale record, return it
  const commitSale = (payload) => {
    const { lines, date, discountType, discountValue, vatEnabled, channel, bankId, chequeNo, platformFee, customer, customerId, postJournal, docType, billNo: billNoIn, editingId } = payload;
    // when editing an existing bill: restore that bill's stock & drop its old journal as part of THIS commit (atomic)
    const orig = editingId ? sales.find((s) => s.id === editingId) : null;
    if (orig && orig.voided) { window.alert(t("บิลนี้ถูกยกเลิกแล้ว แก้ไขไม่ได้ (สต๊อกถูกคืนไปแล้วตอนยกเลิก)", "This bill is cancelled and cannot be edited (its stock was already restored).")); return null; }
    if (orig && orig.journalId) setEntries((prev) => prev.filter((e) => e.id !== orig.journalId));
    const srcProducts = orig ? restoreSaleStock(products, orig) : products;
    // 1) FIFO stock reduction + COGS (same engine as sellCart)
    let totalCogs = 0;
    const fifoMap = {}; // productId -> consumed FIFO slices, stored on the sale for exact restore
    const nextProducts = srcProducts.map((p) => {
      const ls = lines.filter((l) => l.productId === p.id);
      if (!ls.length) return p;
      if (p.tracksSerial) {
        const sold = new Set(ls.map((l) => l.serial));
        (p.serials || []).forEach((s) => { if (sold.has(s.serial) && s.status === "in") totalCogs += Number(s.cost != null ? s.cost : p.cost) || 0; });
        return { ...p, serials: (p.serials || []).map((s) => (sold.has(s.serial) && s.status === "in" ? { ...s, status: "sold", soldAt: date } : s)) };
      }
      const qtySold = ls.reduce((s, l) => s + (Number(l.qty) || 0), 0);
      const startLayers = (Array.isArray(p.layers) && p.layers.length)
        ? p.layers.map((x) => ({ ...x, qty: Number(x.qty) || 0, unitCost: Number(x.unitCost) || 0 }))
        : [{ qty: Number(p.qty) || 0, unitCost: Number(p.cost) || 0 }];
      const { layers, cogs, consumed } = consumeFIFO(startLayers, qtySold);
      totalCogs += cogs;
      if (consumed.length) fifoMap[p.id] = consumed;
      return { ...p, layers, qty: layers.reduce((s, x) => s + x.qty, 0) };
    });
    setProducts(nextProducts);
    setMovements((prev) => [...prev, ...lines.map((l) => ({ id: uid(), date, type: "out", productId: l.productId, qty: Number(l.qty) || 1, serial: l.serial || null, note: "ขาย / Sale" }))]);

    // 2) totals
    const items = lines.map((l) => ({ productId: l.productId, name: l.name, qty: Number(l.qty) || 0, price: Number(l.price) || 0, cost: Number(l.cost) || 0, serial: l.serial || null, disc: Number(l.disc) || 0, discKind: l.discKind || "amount" }));
    const tot = computeSaleTotals({ items, discountType, discountValue, vatEnabled, vatRate });
    const cogs = round2(totalCogs);

    // 3) customer (link existing or create)
    let custId = customerId || null;
    let custSnap = customer || null;
    if (!custId && customer && (customer.name || customer.taxId)) custId = saveCustomer(customer);
    else if (custId && customer) saveCustomer({ ...customer, id: custId });
    if (custId && !custSnap) { const c = customers.find((x) => x.id === custId); if (c) custSnap = c; }

    // 4) bill number + record
    const billNo = (billNoIn && String(billNoIn).trim()) || nextBillNo(sales, date);
    const saleId = editingId || uid();
    const journalId = uid();
    const sale0 = {
      id: saleId, journalId: postJournal ? journalId : null, billNo, date, docType: docType || (vatEnabled ? "tax" : "receipt"),
      customerId: custId, customer: custSnap || null,
      channel, bankId: bankId || null, chequeNo: chequeNo || "",
      platformFee: (channel === "shopee" || channel === "lazada") ? (Number(platformFee) || 0) : 0,
      items, subtotal: tot.subtotal, discountType, discountValue: Number(discountValue) || 0, discountAmt: tot.discountAmt,
      vatEnabled: !!vatEnabled, base: tot.base, vat: tot.vat, total: tot.total, cogs, postJournal: !!postJournal,
      fifo: Object.keys(fifoMap).length ? fifoMap : null,
    };
    const sale = stampVer(sale0, orig);
    setSales((prev) => (editingId ? prev.map((s) => (s.id === editingId ? sale : s)) : [...prev, sale]));
    logEvent(editingId ? "edit" : "create", "sale", sale, orig);

    // 5) journal (channel -> asset; Sales at base; VAT output; FIFO COGS)
    if (postJournal) {
      if (vatEnabled && tot.vat > 0) importAccounts([{ id: "a2100", code: "2100", th: "ภาษีขาย (VAT) ค้างชำระ", en: "VAT Output Payable", type: "liability" }]);
      if (channel === "shopee" || channel === "lazada") importAccounts([{ id: "a1035", code: "1035", th: "เงินรอรับ-ขายออนไลน์ (Shopee/Lazada)", en: "Marketplace settlement receivable", type: "asset" }]);
      ensureAccounts(["1010", "1020", "1030", "1035", "1040", "4010", "5010"]);
      const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
      const assetCode = channel === "cash" ? "1010" : channel === "credit" ? "1030" : (channel === "shopee" || channel === "lazada") ? "1035" : "1020";
      const asset = accId(assetCode) || "a" + assetCode, sales4010 = accId("4010") || "a4010", vatAcc = accId("2100") || "a2100", cogsAcc = accId("5010") || "a5010", inv = accId("1040") || "a1040";
      const jl = [];
      if (tot.total > 0 && asset && sales4010) {
        jl.push({ accountId: asset, debit: tot.total, credit: 0 });
        jl.push({ accountId: sales4010, debit: 0, credit: tot.base });
        if (tot.vat > 0) jl.push({ accountId: vatAcc, debit: 0, credit: tot.vat });
      }
      if (cogs > 0 && cogsAcc && inv) {
        jl.push({ accountId: cogsAcc, debit: cogs, credit: 0 });
        jl.push({ accountId: inv, debit: 0, credit: cogs });
      }
      if (jl.length >= 2) addEntry({ id: journalId, date, desc: "ขาย " + billNo + (custSnap && custSnap.name ? " — " + custSnap.name : "") + " / Sale " + billNo, lines: jl });
    }
    return sale;
  };

  // ---- void / edit a posted sale (restore stock + reverse journal) ----
  const voidSale = (saleId) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.voided) return;
    setProducts((prev) => restoreSaleStock(prev, sale));
    // reversing journal entry (keep the original posted entry; GL nets to zero)
    let voidJournalId = null;
    if (sale.journalId) {
      const origJ = entries.find((e) => e.id === sale.journalId);
      if (origJ && Array.isArray(origJ.lines) && origJ.lines.length) {
        voidJournalId = uid();
        addEntry({ id: voidJournalId, date: todayISO(), desc: "กลับรายการ ยกเลิกบิล " + sale.billNo + " / Reversal of " + sale.billNo, lines: reverseLines(origJ.lines), reversalOf: sale.journalId });
      }
    }
    // also reverse any A/R receipt journals recorded against this bill — the sale reversal credits 1030
    // in full, so leaving receipt entries in place would strand a negative A/R balance
    payments.filter((x) => x.refId === saleId && x.journalId).forEach((x) => {
      const pj = entries.find((e) => e.id === x.journalId);
      if (pj && Array.isArray(pj.lines) && pj.lines.length) addEntry({ id: uid(), date: todayISO(), desc: "กลับรายการรับชำระ (ยกเลิกบิล " + sale.billNo + ") / Reversal of receipt on voided " + sale.billNo, lines: reverseLines(pj.lines), reversalOf: x.journalId });
    });
    setMovements((prev) => [...prev, ...(Array.isArray(sale.items) ? sale.items : []).map((l) => ({ id: uid(), date: todayISO(), type: "in", productId: l.productId, qty: Number(l.qty) || 1, serial: l.serial || null, note: "ยกเลิกบิล " + sale.billNo + " / Void " + sale.billNo }))]);
    const voided = { ...sale, voided: true, voidedAt: nowTS(), voidRev: (Number(sale.voidRev) || 0) + 1, voidJournalId };
    setSales((prev) => prev.map((s) => (s.id === saleId ? voided : s)));
    logEvent("cancel", "sale", voided, sale);
  };
  const deleteSale = (sale) => {
    if (gateOn && acctLevel < 3) { window.alert(t("ยกเลิกบิลได้เฉพาะผู้ดูแล (ระดับ 3)", "Only an admin (level 3) can cancel bills.")); return; }
    if (sale && sale.voided) { window.alert(t("บิลนี้ถูกยกเลิกไปแล้ว", "This bill is already cancelled.")); return; }
    if (!window.confirm(t("ยกเลิกบิล " + sale.billNo + " ?\nบิลจะถูกทำเครื่องหมาย \"ยกเลิก\" (เก็บไว้ดูย้อนหลังได้) คืนสต๊อก และตั้งรายการบัญชีกลับให้อัตโนมัติ — เลขบิลเดิมจะไม่ถูกนำกลับมาใช้", "Cancel bill " + sale.billNo + "?\nIt will be marked \"cancelled\" (kept on record), stock restored, and a reversing journal posted automatically."))) return;
    voidSale(sale.id);
    setInvoiceSale(null);
  };

  // ---- "รอออกบิล": park a sale (cut stock now, journal + bill number later) ----
  const parkSale = (payload) => {
    const { lines, date, discountType, discountValue, vatEnabled, channel, bankId, chequeNo, platformFee, customer, customerId, postJournal, note } = payload;
    // 1) FIFO / serial stock reduction + COGS (same engine as commitSale)
    let totalCogs = 0;
    const fifoMap = {}; // productId -> consumed FIFO slices (exact restore on cancel/billing edit)
    const nextProducts = products.map((p) => {
      const ls = lines.filter((l) => l.productId === p.id);
      if (!ls.length) return p;
      if (p.tracksSerial) {
        const sold = new Set(ls.map((l) => l.serial));
        (p.serials || []).forEach((s) => { if (sold.has(s.serial) && s.status === "in") totalCogs += Number(s.cost != null ? s.cost : p.cost) || 0; });
        return { ...p, serials: (p.serials || []).map((s) => (sold.has(s.serial) && s.status === "in" ? { ...s, status: "sold", soldAt: date } : s)) };
      }
      const qtySold = ls.reduce((s, l) => s + (Number(l.qty) || 0), 0);
      const startLayers = (Array.isArray(p.layers) && p.layers.length)
        ? p.layers.map((x) => ({ ...x, qty: Number(x.qty) || 0, unitCost: Number(x.unitCost) || 0 }))
        : [{ qty: Number(p.qty) || 0, unitCost: Number(p.cost) || 0 }];
      const { layers, cogs, consumed } = consumeFIFO(startLayers, qtySold);
      totalCogs += cogs;
      if (consumed.length) fifoMap[p.id] = consumed;
      return { ...p, layers, qty: layers.reduce((s, x) => s + x.qty, 0) };
    });
    setProducts(nextProducts);
    setMovements((prev) => [...prev, ...lines.map((l) => ({ id: uid(), date, type: "out", productId: l.productId, qty: Number(l.qty) || 1, serial: l.serial || null, note: "รอออกบิล / Parked sale" }))]);

    // 2) totals + cogs (stored so billing uses these exact numbers — no re-run)
    const items = lines.map((l) => ({ productId: l.productId, name: l.name, qty: Number(l.qty) || 0, price: Number(l.price) || 0, cost: Number(l.cost) || 0, serial: l.serial || null, disc: Number(l.disc) || 0, discKind: l.discKind || "amount" }));
    const tot = computeSaleTotals({ items, discountType, discountValue, vatEnabled, vatRate });
    const cogs = round2(totalCogs);

    // 3) customer (link existing or create)
    let custId = customerId || null;
    let custSnap = customer || null;
    if (!custId && customer && (customer.name || customer.taxId)) custId = saveCustomer(customer);
    else if (custId && customer) saveCustomer({ ...customer, id: custId });
    if (custId && !custSnap) { const c = customers.find((x) => x.id === custId); if (c) custSnap = c; }

    // 4) draft record — NO billNo, NO journal yet
    const rec = {
      id: uid(), date, customerId: custId, customer: custSnap || null,
      channel, bankId: bankId || null, chequeNo: chequeNo || "",
      platformFee: (channel === "shopee" || channel === "lazada") ? (Number(platformFee) || 0) : 0,
      items, subtotal: tot.subtotal, discountType, discountValue: Number(discountValue) || 0, discountAmt: tot.discountAmt,
      vatEnabled: !!vatEnabled, base: tot.base, vat: tot.vat, total: tot.total, cogs,
      fifo: Object.keys(fifoMap).length ? fifoMap : null,
      postJournal: !!postJournal, note: note || "", status: "pending", createdAt: new Date().toISOString(),
    };
    setPendingSales((prev) => [rec, ...prev]);
    return rec;
  };

  // cancel a parked draft (stock was already cut -> restore it)
  const deletePending = (id) => {
    const rec = pendingSales.find((r) => r.id === id);
    if (!rec) return;
    setProducts((prev) => restoreSaleStock(prev, rec));
    setMovements((prev) => [...prev, ...(Array.isArray(rec.items) ? rec.items : []).map((l) => ({ id: uid(), date: todayISO(), type: "in", productId: l.productId, qty: Number(l.qty) || 1, serial: l.serial || null, note: "ยกเลิกร่างรอออกบิล / Cancel parked" }))]);
    setPendingSales((prev) => prev.filter((r) => r.id !== id));
  };

  // issue real bill(s) from parked drafts: assign bill number + post journal, NO stock change (already cut)
  // mode "merge" = one combined bill (same customer); mode "separate" = one bill per draft
  const issueBillsFromPending = (ids, mode) => {
    const chosen = ids.map((id) => pendingSales.find((r) => r.id === id)).filter(Boolean);
    if (!chosen.length) return null;
    const today = todayISO();

    // post a journal for a bill from its stored base/vat/total/cogs (no stock)
    const postBillJournal = (rec, billNo, journalId) => {
      if (!rec.postJournal) return null;
      if (rec.vatEnabled && rec.vat > 0) importAccounts([{ id: "a2100", code: "2100", th: "ภาษีขาย (VAT) ค้างชำระ", en: "VAT Output Payable", type: "liability" }]);
      if (rec.channel === "shopee" || rec.channel === "lazada") importAccounts([{ id: "a1035", code: "1035", th: "เงินรอรับ-ขายออนไลน์ (Shopee/Lazada)", en: "Marketplace settlement receivable", type: "asset" }]);
      ensureAccounts(["1010", "1020", "1030", "1035", "1040", "4010", "5010"]);
      const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
      const assetCode = rec.channel === "cash" ? "1010" : rec.channel === "credit" ? "1030" : (rec.channel === "shopee" || rec.channel === "lazada") ? "1035" : "1020";
      const asset = accId(assetCode) || "a" + assetCode, sales4010 = accId("4010") || "a4010", vatAcc = accId("2100") || "a2100", cogsAcc = accId("5010") || "a5010", inv = accId("1040") || "a1040";
      const jl = [];
      if (rec.total > 0 && asset && sales4010) {
        jl.push({ accountId: asset, debit: rec.total, credit: 0 });
        jl.push({ accountId: sales4010, debit: 0, credit: rec.base });
        if (rec.vat > 0) jl.push({ accountId: vatAcc, debit: 0, credit: rec.vat });
      }
      if (rec.cogs > 0 && cogsAcc && inv) {
        jl.push({ accountId: cogsAcc, debit: rec.cogs, credit: 0 });
        jl.push({ accountId: inv, debit: 0, credit: rec.cogs });
      }
      if (jl.length >= 2) { addEntry({ id: journalId, date: today, desc: "ขาย " + billNo + (rec.customer && rec.customer.name ? " — " + rec.customer.name : "") + " / Sale " + billNo, lines: jl }); return journalId; }
      return null;
    };

    // running bill number (thread manually so a batch increments correctly)
    let curNo = nextBillNo(sales, today);
    const takeNo = () => { const n = curNo; curNo = incDocNo(curNo) || curNo; return n; };
    const sum = (arr, k) => round2(arr.reduce((a, r) => a + (Number(r[k]) || 0), 0));

    const created = [];
    const removeIds = new Set();
    const buildBill = (rec) => {
      const billNo = takeNo();
      const journalId = uid();
      const posted = postBillJournal(rec, billNo, journalId);
      const sale = stampVer({
        id: uid(), journalId: posted, billNo, date: today, docType: rec.vatEnabled ? "tax" : "receipt",
        customerId: rec.customerId, customer: rec.customer || null,
        channel: rec.channel, bankId: rec.bankId || null, chequeNo: rec.chequeNo || "",
        platformFee: Number(rec.platformFee) || 0, items: rec.items || [],
        subtotal: rec.subtotal, discountType: rec.discountType || "amount", discountValue: Number(rec.discountValue) || 0, discountAmt: rec.discountAmt,
        vatEnabled: !!rec.vatEnabled, base: rec.base, vat: rec.vat, total: rec.total, cogs: rec.cogs, postJournal: !!rec.postJournal,
        fifo: rec.fifo || null,
        fromPending: rec.fromPending || null,
      }, null);
      created.push(sale);
    };

    if (mode === "merge") {
      const f = chosen[0];
      const merged = {
        customerId: f.customerId, customer: f.customer, channel: f.channel, bankId: f.bankId, chequeNo: f.chequeNo,
        platformFee: chosen.reduce((a, r) => a + (Number(r.platformFee) || 0), 0),
        items: chosen.flatMap((r) => r.items || []),
        subtotal: sum(chosen, "subtotal"), discountType: "amount", discountValue: 0, discountAmt: sum(chosen, "discountAmt"),
        vatEnabled: chosen.some((r) => r.vatEnabled), base: sum(chosen, "base"), vat: sum(chosen, "vat"), total: sum(chosen, "total"), cogs: sum(chosen, "cogs"),
        fifo: (() => { const m = {}; chosen.forEach((r) => { const f = r.fifo || {}; Object.keys(f).forEach((pid) => { m[pid] = [...(m[pid] || []), ...f[pid]]; }); }); return Object.keys(m).length ? m : null; })(),
        postJournal: !!f.postJournal, fromPending: chosen.map((r) => r.id),
      };
      buildBill(merged);
    } else {
      chosen.forEach((r) => buildBill({ ...r, fromPending: [r.id] }));
    }
    chosen.forEach((r) => removeIds.add(r.id));
    setSales((prev) => [...prev, ...created]);
    created.forEach((s) => logEvent("create", "sale", s, null));
    setPendingSales((prev) => prev.filter((r) => !removeIds.has(r.id)));
    return created;
  };
  const editSale = (sale) => {
    if (sale && sale.voided) { window.alert(t("บิลนี้ถูกยกเลิกแล้ว แก้ไขไม่ได้", "This bill is cancelled and cannot be edited.")); return; }
    // do NOT void here — the original stays intact until the edit is actually re-saved,
    // so switching pages before committing no longer loses the bill.
    const editCredit = {}; // qty of each non-serial product the original bill already holds (freed for re-sale while editing)
    (Array.isArray(sale.items) ? sale.items : []).forEach((l) => {
      const p = products.find((x) => x.id === l.productId);
      if (p && !p.tracksSerial) editCredit[l.productId] = (editCredit[l.productId] || 0) + (Number(l.qty) || 0);
    });
    setPrefill({
      items: (Array.isArray(sale.items) ? sale.items : []).map((l) => ({ ...l })),
      date: sale.date, billNo: sale.billNo, discountType: sale.discountType, discountValue: sale.discountValue,
      vatEnabled: sale.vatEnabled, channel: sale.channel, bankId: sale.bankId, chequeNo: sale.chequeNo, platformFee: sale.platformFee,
      customerId: sale.customerId, customer: sale.customer, editingId: sale.id, editCredit, _token: uid(),
    });
    setInvoiceSale(null);
    setPosMode(false);
    setTab("sell");
  };

  // ---- Shopee/Lazada batch settlement: one lump deposit clears many bills; reconcile vs fees entered at sale ----
  const settleMarketplaceBatch = (saleIds, info) => {
    const picked = (saleIds || []).map((id) => sales.find((s) => s.id === id)).filter((s) => s && !s.settle);
    if (!picked.length) return;
    const received = round2(Number(info.received) || 0);
    const date = info.date || todayISO();
    const bankId = info.bankId || null;
    const sumBill = round2(picked.reduce((a, s) => a + (Number(s.total) || 0), 0));
    const totalFee = round2(sumBill - received); // actual fee = bills − deposit (keeps the entry balanced)
    const batchId = uid();
    let journalId = null;
    const anyPosted = picked.some((s) => s.journalId);
    if (anyPosted) {
      importAccounts([
        { id: "a1035", code: "1035", th: "เงินรอรับ-ขายออนไลน์ (Shopee/Lazada)", en: "Marketplace settlement receivable", type: "asset" },
        { id: "a5080", code: "5080", th: "ค่าธรรมเนียมขายออนไลน์", en: "Online marketplace fees", type: "expense" },
      ]);
      const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
      const bank = accId("1020") || "a1020", clearing = accId("1035") || "a1035", feeAcc = accId("5080") || "a5080";
      const clearedTotal = round2(picked.filter((s) => s.journalId).reduce((a, s) => a + (Number(s.total) || 0), 0));
      // journal covers the POSTED portion only: allocate the deposit to posted bills pro-rata,
      // so an off-book (unposted) bill in the batch neither inflates the bank debit nor distorts the fee
      const postedReceived = round2(sumBill > 0 ? received * (clearedTotal / sumBill) : 0);
      const feePosted = round2(clearedTotal - postedReceived); // fee on the posted portion
      const jl = [];
      if (postedReceived !== 0) jl.push({ accountId: bank, debit: postedReceived, credit: 0 });
      if (feePosted > 0) jl.push({ accountId: feeAcc, debit: feePosted, credit: 0 });
      else if (feePosted < 0) jl.push({ accountId: feeAcc, debit: 0, credit: -feePosted });
      if (clearedTotal !== 0) jl.push({ accountId: clearing, debit: 0, credit: clearedTotal });
      if (jl.length >= 2) { const jid = uid(); addEntry({ id: jid, date, desc: "รับเงินรวบยอด " + (picked[0].channel === "lazada" ? "Lazada" : "Shopee") + " " + picked.length + " บิล / Batch settlement", lines: jl }); journalId = jid; }
    }
    // allocate the deposit + fee across bills (proportional; residual goes to the LAST bill so
    // per-bill allocations sum back exactly to the deposit that was entered and journaled)
    const pickedIds = new Set(picked.map((s) => s.id));
    const allocs = {};
    let accRecv = 0;
    picked.forEach((s, idx) => {
      const share = sumBill > 0 ? (Number(s.total) || 0) / sumBill : 1 / picked.length;
      const r = idx === picked.length - 1 ? round2(received - accRecv) : round2(received * share);
      accRecv = round2(accRecv + r);
      allocs[s.id] = r;
    });
    setSales((prev) => prev.map((s) => {
      if (!pickedIds.has(s.id)) return s;
      const recv_i = allocs[s.id];
      const fee_i = round2((Number(s.total) || 0) - recv_i);
      return { ...s, settle: { date, batchId, bankId, received: recv_i, fee: fee_i, journalId } };
    }));
  };
  const unsettleBatch = (batchId) => {
    const inBatch = sales.filter((s) => s.settle && s.settle.batchId === batchId);
    if (!inBatch.length) return;
    const jid = inBatch[0].settle.journalId;
    if (jid) setEntries((prev) => prev.filter((e) => e.id !== jid));
    setSales((prev) => prev.map((s) => (s.settle && s.settle.batchId === batchId ? { ...s, settle: null } : s)));
  };

  // ---- purchases / imports (input VAT + foreign currency) ----
  const commitPurchase = (payload) => {
    const { docNo, date, supplier, supplierId, supplierTaxId, supplierAddress, currency, fxRate, lines, dutyThb, freightThb, vatThb, vatBaseThb, payChannel, bankId, receiveStock, expenseCode, postJournal, isVat, appliedAdvances, feeThb, feeMode } = payload;
    const billId = uid(); // stable id used both as the record id and as the srcId thread on each stock layer/serial
    const rate = currency === "THB" ? 1 : (Number(fxRate) || 0);
    const items = (lines || []).map((l) => {
      const qty = Number(l.qty) || 0;
      const unitFx = Number(l.unitCostFx) || 0;
      const unitThb = round2(unitFx * rate);
      // line total from full-precision qty*unit*rate (matches the Purchases screen preview) — NOT qty * rounded-unit
      return { productId: l.productId || null, name: l.name, qty, unitCostFx: unitFx, unitCostThb: unitThb, lineThb: round2(qty * unitFx * rate), useSerial: !!l.useSerial, serials: Array.isArray(l.serials) ? l.serials.slice() : [], shipRatio: Number(l.shipRatio) || 1, dutyRate: Number(l.dutyRate) || 0, dutyThb: round2(Number(l.dutyThb) || 0) };
    });
    const goodsThb = round2(items.reduce((s, i) => s + i.lineThb, 0));
    const freight = round2(Number(freightThb) || 0);
    const feeNum = round2(Number(feeThb) || 0);
    const feeToCost = feeMode !== "expense";
    const dutyTotal = round2(items.reduce((s, i) => s + (Number(i.dutyThb) || 0), 0));
    const freightPool = round2(freight + (feeToCost ? feeNum : 0)); // freight (+fee if capitalised) — allocated by weight
    const landedExtra = round2(dutyTotal + freightPool);
    const duty = dutyTotal;
    const totalWeight = items.reduce((s, i) => s + (i.qty * (Number(i.shipRatio) || 1)), 0);
    const _appliedAdv = Array.isArray(appliedAdvances) ? appliedAdvances : [];
    const appliedTotal = round2(_appliedAdv.reduce((s, a) => s + (Number(a.amountThb) || 0), 0));
    const vat = round2(Number(vatThb) || 0);
    const totalThb = round2(goodsThb + landedExtra + vat);
    const payTotal = round2(totalThb + (feeToCost ? 0 : feeNum));

    if (receiveStock && goodsThb > 0) {
      setProducts((prev) => prev.map((p) => {
        const its = items.filter((i) => i.productId === p.id);
        if (!its.length) return p;
        const landedUnitOf = (i) => { const w = i.qty * (Number(i.shipRatio) || 1); const freightAlloc = totalWeight > 0 ? (w / totalWeight) * freightPool : (goodsThb > 0 ? (i.lineThb / goodsThb) * freightPool : 0); return i.qty > 0 ? round2((i.lineThb + (Number(i.dutyThb) || 0) + freightAlloc) / i.qty) : i.unitCostThb; };
        const serialIts = its.filter((i) => i.useSerial);
        const qtyIts = its.filter((i) => !i.useSerial);
        let np = { ...p };
        if (serialIts.length) {
          const hasQtyStock = !np.tracksSerial && ((Number(np.qty) || 0) > 0 || (np.layers || []).some((x) => (Number(x.qty) || 0) > 0));
          if (hasQtyStock) {
            // qty-tracked product with stock on hand: DON'T flip to serial mode (that would hide the existing
            // qty/layers from on-hand & value) — receive these units as ordinary FIFO layers instead
            const layers = [...(np.layers || [])];
            let addQty = 0;
            serialIts.forEach((i) => { const c = landedUnitOf(i); const n = (i.serials || []).length; if (n > 0) { layers.push({ qty: n, unitCost: c, srcId: billId }); addQty += n; } });
            np = { ...np, layers, qty: (Number(np.qty) || 0) + addQty };
          } else {
            const existing = new Set((np.serials || []).map((s) => norm(s.serial)));
            const add = [];
            serialIts.forEach((i) => { const c = landedUnitOf(i); (i.serials || []).forEach((sn) => { const v = String(sn).trim(); if (v && !existing.has(norm(v))) { existing.add(norm(v)); add.push({ serial: v, status: "in", addedAt: date, cost: c, srcId: billId }); } }); });
            np = { ...np, tracksSerial: true, serials: [...(np.serials || []), ...add] };
          }
        }
        if (qtyIts.length) {
          const layers = [...(np.layers || [])];
          let addQty = 0; let lastUnit = Number(np.cost) || 0;
          qtyIts.forEach((i) => { const lu = landedUnitOf(i); layers.push({ qty: i.qty, unitCost: lu, srcId: billId }); addQty += i.qty; lastUnit = lu; });
          np = { ...np, layers, qty: (Number(np.qty) || 0) + addQty, cost: lastUnit };
        }
        return np;
      }));
      setMovements((prev) => [...prev, ...items.filter((i) => i.productId).map((i) => ({ id: uid(), date, type: "in", productId: i.productId, qty: i.qty, serial: null, note: "ซื้อ/นำเข้า " + (docNo || "") + " / Purchase" }))]);
    }

    const journalId = uid();
    if (postJournal) {
      importAccounts([
        { id: "a1150", code: "1150", th: "ภาษีซื้อ (VAT)", en: "VAT Input", type: "asset" },
        { id: "a2010", code: "2010", th: "เจ้าหนี้การค้า", en: "Accounts Payable", type: "liability" },
      ]);
      ensureAccounts(["1010", "1020", "1040", "1170", "5050", "5090"]);
      const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
      const debitAcc = receiveStock ? (accId("1040") || "a1040") : (accId(expenseCode || "5050") || accId("5050") || "a5050");
      const vatAcc = accId("1150") || "a1150";
      const credCode = payChannel === "cash" ? "1010" : payChannel === "transfer" ? "1020" : "2010";
      const cred = accId(credCode) || "a" + credCode;
      const jl = [];
      const debitGoods = round2(goodsThb + landedExtra);
      if (debitGoods > 0 && debitAcc) jl.push({ accountId: debitAcc, debit: debitGoods, credit: 0 });
      if (vat > 0 && vatAcc) jl.push({ accountId: vatAcc, debit: vat, credit: 0 });
      if (!feeToCost && feeNum > 0) { const feeAcc = accId("5090") || "a5090"; jl.push({ accountId: feeAcc, debit: feeNum, credit: 0 }); }
      const advApplyAcc = accId("1170") || "a1170";
      const advUse = round2(Math.min(appliedTotal, payTotal));
      if (advUse > 0 && advApplyAcc) jl.push({ accountId: advApplyAcc, debit: 0, credit: advUse });
      const remain = round2(payTotal - advUse);
      if (remain > 0 && cred) jl.push({ accountId: cred, debit: 0, credit: remain });
      if (jl.length >= 2) addEntry({ id: journalId, date, desc: "ซื้อ/นำเข้า " + (docNo ? docNo + " " : "") + (supplier ? "— " + supplier : "") + " / Purchase", lines: jl });
    }

    const rec0 = {
      id: billId, journalId: postJournal ? journalId : null, docNo: docNo || "", date, supplier: supplier || "",
      supplierId: supplierId || null, supplierTaxId: supplierTaxId || "", supplierAddress: supplierAddress || "",
      currency, fxRate: rate, items, goodsThb, dutyThb: duty, freightThb: freight,
      vatBaseThb: round2(Number(vatBaseThb) || (goodsThb + landedExtra)), vatThb: vat, totalThb: payTotal, feeThb: feeNum, feeMode: feeToCost ? "cost" : "expense", isVat: (isVat !== undefined ? !!isVat : vat > 0),
      payChannel, bankId: (payChannel === "transfer") ? (bankId || null) : null,
      receiveStock: !!receiveStock, expenseCode: receiveStock ? null : (expenseCode || "5050"), postJournal: !!postJournal,
      appliedAdvances: _appliedAdv,
      layered: true, // stamped by this version: stock layers carry a durable srcId thread (see deletePurchase fallback)
    };
    const rec = stampVer(rec0, null);
    setPurchases((prev) => [...prev, rec]);
    if (_appliedAdv.length) setAdvances((prev) => prev.map((a) => {
      const hit = _appliedAdv.find((x) => x.advanceId === a.id);
      if (!hit) return a;
      const amt = round2(Number(hit.amountThb) || 0);
      const appliedThb = round2((Number(a.appliedThb) || 0) + amt);
      return { ...a, appliedThb, appliedTo: [...(a.appliedTo || []), { purchaseId: rec.id, amountThb: amt }], status: appliedThb >= (Number(a.advanceThb) || 0) - 0.005 ? "applied" : "partial" };
    }));
    logEvent("create", "purchase", rec, null);
    return rec;
  };
  // Retroactively add/adjust freight & duty on an existing purchase, using the srcId thread on stock layers.
  // Remaining (unsold) layers get their unitCost corrected precisely; the already-sold portion is booked as one
  // "ปรับราคาทุน" COGS adjustment (no restatement of past sales). newLineDuties aligns to rec.items order.
  const adjustPurchaseLanded = (billId, newFreightThb, newLineDuties, payCode) => {
    const rec = purchases.find((p) => p.id === billId);
    if (!rec) return;
    if (rec.voided) { window.alert(t("บิลนี้ถูกยกเลิกแล้ว", "This bill is cancelled.")); return; }
    const items = Array.isArray(rec.items) ? rec.items : [];
    const nd = Array.isArray(newLineDuties) ? newLineDuties : [];
    const oldFreight = round2(Number(rec.freightThb) || 0);
    const newFreight = round2(Number(newFreightThb) || 0);
    const freightDelta = round2(newFreight - oldFreight);
    const totalWeight = items.reduce((s, i) => s + ((Number(i.qty) || 0) * (Number(i.shipRatio) || 1)), 0);
    const newDutyOf = (i, idx) => round2(Number(nd[idx] != null ? nd[idx] : i.dutyThb) || 0);
    // per-line extra-cost delta = freight reallocated by weight + duty change
    const lineDelta = items.map((i, idx) => {
      const w = (Number(i.qty) || 0) * (Number(i.shipRatio) || 1);
      const freightAllocDelta = totalWeight > 0 ? round2(freightDelta * (w / totalWeight)) : (items.length ? round2(freightDelta / items.length) : 0);
      return round2(freightAllocDelta + (newDutyOf(i, idx) - round2(Number(i.dutyThb) || 0)));
    });
    // READ phase (from current products) — reprice only this bill's REMAINING layers (via srcId thread)
    let inventoryDelta = 0;
    const prodDelta = {};
    items.forEach((i, idx) => {
      if (!i.productId) return; // non-stock line: no layers to reprice; its share flows to COGS via the balancing plug
      const d = prodDelta[i.productId] || { extra: 0, qty: 0 };
      d.extra = round2(d.extra + lineDelta[idx]); d.qty += Number(i.qty) || 0;
      prodDelta[i.productId] = d;
    });
    Object.keys(prodDelta).forEach((pid) => {
      const p = products.find((x) => x.id === pid); const d = prodDelta[pid];
      if (!p || d.qty <= 0) return;
      const perUnit = round2(d.extra / d.qty);
      let remainQty = 0;
      remainQty += (p.serials || []).filter((s) => s.srcId === billId && s.status === "in").length;
      remainQty += (p.layers || []).filter((l) => l.srcId === billId).reduce((s, l) => s + (Number(l.qty) || 0), 0);
      inventoryDelta = round2(inventoryDelta + perUnit * remainQty);
    });
    // totals + guards (before mutating anything)
    const dutyDeltaTotal = round2(items.reduce((s, i, idx) => s + (newDutyOf(i, idx) - round2(Number(i.dutyThb) || 0)), 0));
    const addAmt = round2(freightDelta + dutyDeltaTotal);
    const cogsDelta = round2(addAmt - inventoryDelta); // already-sold portion + rounding residual → DR=CR guaranteed
    if (Math.abs(addAmt) < 0.005 && Math.abs(inventoryDelta) < 0.005) { window.alert(t("ไม่มีการเปลี่ยนแปลง", "Nothing changed.")); return; }
    if (Math.abs(inventoryDelta) < 0.005 && Math.abs(addAmt) >= 0.005 && items.some((i) => i.productId)) {
      if (!window.confirm(t("ไม่พบของจากบิลนี้เหลือในสต๊อก (บิลเก่าก่อน V1.2 หรือขายหมดแล้ว)\nยอดที่เพิ่ม ฿" + money(addAmt) + " จะลงต้นทุนขายทั้งก้อน — ดำเนินการต่อ?", "No remaining stock traced to this bill (pre-V1.2, or fully sold)\nThe added ฿" + money(addAmt) + " will go entirely to COGS. Continue?"))) return;
    }
    // WRITE phase — pure updater, applies per-unit delta to this bill's layers/serials only
    setProducts((prev) => prev.map((p) => {
      const d = prodDelta[p.id]; if (!d || d.qty <= 0) return p;
      const perUnit = round2(d.extra / d.qty); if (Math.abs(perUnit) < 0.0001) return p;
      let np = { ...p };
      if ((np.serials || []).some((s) => s.srcId === billId)) np.serials = np.serials.map((s) => (s.srcId === billId ? { ...s, cost: round2((Number(s.cost) || 0) + perUnit) } : s));
      if ((np.layers || []).some((l) => l.srcId === billId)) np.layers = np.layers.map((l) => (l.srcId === billId ? { ...l, unitCost: round2((Number(l.unitCost) || 0) + perUnit) } : l));
      const lastLayer = (np.layers || []).filter((l) => (Number(l.qty) || 0) > 0).slice(-1)[0]; if (lastLayer) np.cost = lastLayer.unitCost;
      return np;
    }));
    // one "ปรับราคาทุน" journal
    const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
    const invAcc = accId("1040"), cogsAcc = accId("5010");
    const credCode = payCode === "cash" ? "1010" : payCode === "transfer" ? "1020" : "2010";
    const credAcc = accId(credCode);
    const jl = [];
    const pushSided = (acc, amt) => { if (!acc || Math.abs(amt) < 0.005) return; if (amt >= 0) jl.push({ accountId: acc, debit: round2(amt), credit: 0 }); else jl.push({ accountId: acc, debit: 0, credit: round2(-amt) }); };
    pushSided(invAcc, inventoryDelta);
    pushSided(cogsAcc, cogsDelta);
    if (credAcc && Math.abs(addAmt) >= 0.005) { if (addAmt >= 0) jl.push({ accountId: credAcc, debit: 0, credit: round2(addAmt) }); else jl.push({ accountId: credAcc, debit: round2(-addAmt), credit: 0 }); }
    const adjJournalId = uid();
    const posted = jl.length >= 2;
    if (posted) addEntry({ id: adjJournalId, date: todayISO(), desc: "ปรับราคาทุน (ค่าเรือ/อากรเพิ่ม) บิล " + (rec.docNo || "") + " / Landed-cost adjustment", lines: jl });
    // update the purchase record (freight + per-line duty + totals + adjustment log)
    const newItems = items.map((i, idx) => ({ ...i, dutyThb: newDutyOf(i, idx) }));
    const newDutyTotal = round2(newItems.reduce((s, i) => s + (Number(i.dutyThb) || 0), 0));
    const rec1 = stampVer({ ...rec, freightThb: newFreight, items: newItems, dutyThb: newDutyTotal, totalThb: round2((Number(rec.totalThb) || 0) + addAmt), landedAdjustedAt: nowTS(), adjJournalIds: posted ? [...(rec.adjJournalIds || []), adjJournalId] : (rec.adjJournalIds || []) }, rec);
    setPurchases((prev) => prev.map((p) => (p.id === billId ? rec1 : p)));
    logEvent("edit", "purchase", rec1, rec);
    window.alert(t("ปรับราคาทุนแล้ว บิล " + (rec.docNo || "") + "\nเข้าสต๊อกคงเหลือ ฿" + money(inventoryDelta) + "\nเข้าต้นทุนขาย (ของที่ขายไปแล้ว) ฿" + money(cogsDelta), "Landed cost adjusted for " + (rec.docNo || "") + "\nto remaining inventory ฿" + money(inventoryDelta) + "\nto COGS (already sold) ฿" + money(cogsDelta)));
  };

  const deletePurchase = (rec) => {
    if (rec && rec.voided) { window.alert(t("บิลซื้อนี้ถูกยกเลิกไปแล้ว", "This purchase is already cancelled.")); return; }
    if (!window.confirm(t("ยกเลิกบิลซื้อ " + (rec.docNo || "") + " ?\nจะทำเครื่องหมาย \"ยกเลิก\" (เก็บไว้ดูย้อนหลังได้) คืนสต๊อก และตั้งรายการบัญชีกลับให้อัตโนมัติ", "Cancel purchase " + (rec.docNo || "") + "?\nIt will be marked \"cancelled\" (kept on record), stock restored, and a reversing journal posted."))) return;
    if (rec.receiveStock) {
      setProducts((prev) => prev.map((p) => {
        const its = (Array.isArray(rec.items) ? rec.items : []).filter((i) => i.productId === p.id);
        if (!its.length) return p;
        let np = { ...p };
        const serialIts = its.filter((i) => i.useSerial);
        const qtyIts = its.filter((i) => !i.useSerial);
        if (serialIts.length) {
          const remove = new Set();
          serialIts.forEach((i) => (i.serials || []).forEach((s) => remove.add(norm(s))));
          const before = (np.serials || []).length;
          const kept = (np.serials || []).filter((s) => !(remove.has(norm(s.serial)) && s.status === "in"));
          np = { ...np, serials: kept };
          // serial lines received as FIFO layers (qty product with stock at receive time) have no serial rows —
          // pull the residual units back out of this bill's own layers so cancel matches the reversing journal
          const wantQty = serialIts.reduce((s, i) => s + ((i.serials || []).length || Number(i.qty) || 0), 0);
          let residual = wantQty - (before - kept.length);
          if (residual > 0) {
            let layers2 = [...(np.layers || [])];
            let toRm = residual;
            for (let k = 0; k < layers2.length && toRm > 0; k++) {
              if (layers2[k].srcId !== rec.id) continue;
              const take = Math.min(layers2[k].qty, toRm);
              layers2[k] = { ...layers2[k], qty: layers2[k].qty - take };
              toRm -= take;
            }
            const rmq = residual - toRm;
            if (rmq > 0) {
              layers2 = layers2.filter((l) => (Number(l.qty) || 0) > 0);
              np = { ...np, layers: layers2, qty: Math.max(0, (Number(np.qty) || 0) - rmq) };
            }
          }
        }
        if (qtyIts.length) {
          const qtyBack = qtyIts.reduce((s, i) => s + (Number(i.qty) || 0), 0);
          let layers = [...(np.layers || [])];
          if (!layers.length) {
            // legacy qty-only product (stock never held in layers): old direct-subtract behavior
            return { ...np, qty: Math.max(0, (Number(np.qty) || 0) - qtyBack) };
          }
          let toRemove = qtyBack;
          const hasOwn = layers.some((l) => l.srcId === rec.id);
          // remove this bill's own layers first (srcId thread — precise)
          for (let k = 0; k < layers.length && toRemove > 0; k++) {
            if (layers[k].srcId !== rec.id) continue;
            const take = Math.min(layers[k].qty, toRemove);
            layers[k] = { ...layers[k], qty: layers[k].qty - take };
            toRemove -= take;
          }
          // Fallback when this bill has no surviving srcId layer:
          // - rec.layered (stamped at commit by this version, where consumeFIFO preserves srcId): its tags
          //   survive sales, so no surviving layer means the units were SOLD — remove nothing more.
          // - older records (incl. layers whose srcId the old consumeFIFO erased): remove from UNTAGGED
          //   layers newest-first; NEVER strip another bill's srcId-tagged layers.
          if (!hasOwn && !rec.layered) {
            for (let k = layers.length - 1; k >= 0 && toRemove > 0; k--) {
              if (layers[k].srcId != null) continue;
              const take = Math.min(layers[k].qty, toRemove);
              layers[k] = { ...layers[k], qty: layers[k].qty - take };
              toRemove -= take;
            }
          }
          const removed = qtyBack - toRemove; // subtract only what was actually taken out of layers
          layers = layers.filter((l) => (Number(l.qty) || 0) > 0);
          np = { ...np, layers, qty: Math.max(0, (Number(np.qty) || 0) - removed) };
        }
        return np;
      }));
    }
    let voidJournalId = null;
    if (rec.journalId) {
      const origJ = entries.find((e) => e.id === rec.journalId);
      if (origJ && Array.isArray(origJ.lines) && origJ.lines.length) {
        voidJournalId = uid();
        addEntry({ id: voidJournalId, date: todayISO(), desc: "กลับรายการ ยกเลิกบิลซื้อ " + (rec.docNo || "") + " / Reversal of purchase " + (rec.docNo || ""), lines: reverseLines(origJ.lines), reversalOf: rec.journalId });
      }
    }
    // if this bill had landed-cost adjustments, reverse those entries too
    (Array.isArray(rec.adjJournalIds) ? rec.adjJournalIds : []).forEach((jid) => {
      const aj = entries.find((e) => e.id === jid);
      if (aj && Array.isArray(aj.lines) && aj.lines.length) addEntry({ id: uid(), date: todayISO(), desc: "กลับรายการปรับราคาทุน (ยกเลิกบิลซื้อ " + (rec.docNo || "") + ") / Reversal of landed-cost adjustment", lines: reverseLines(aj.lines), reversalOf: jid });
    });
    // reverse any A/P payment journals recorded against this bill (mirror of the A/R receipt reversal on voidSale)
    apPayments.filter((x) => x.refId === rec.id && x.journalId).forEach((x) => {
      const pj = entries.find((e) => e.id === x.journalId);
      if (pj && Array.isArray(pj.lines) && pj.lines.length) addEntry({ id: uid(), date: todayISO(), desc: "กลับรายการจ่ายชำระ (ยกเลิกบิลซื้อ " + (rec.docNo || "") + ") / Reversal of payment on voided purchase", lines: reverseLines(pj.lines), reversalOf: x.journalId });
    });
    const voided = { ...rec, voided: true, voidedAt: nowTS(), voidRev: (Number(rec.voidRev) || 0) + 1, voidJournalId };
    setPurchases((prev) => prev.map((x) => (x.id === rec.id ? voided : x)));
    if (Array.isArray(rec.appliedAdvances) && rec.appliedAdvances.length) setAdvances((prev) => prev.map((a) => {
      const hit = rec.appliedAdvances.find((x) => x.advanceId === a.id);
      if (!hit) return a;
      const amt = round2(Number(hit.amountThb) || 0);
      const appliedThb = round2(Math.max(0, (Number(a.appliedThb) || 0) - amt));
      return { ...a, appliedThb, appliedTo: (a.appliedTo || []).filter((p) => p.purchaseId !== rec.id), status: appliedThb <= 0.005 ? "open" : "partial" };
    }));
    logEvent("cancel", "purchase", voided, rec);
  };

  // ---- supplier advances / deposits (T/T paid before goods+invoice arrive) ----
  const commitAdvance = (payload) => {
    const { date, supplier, supplierId, supplierTaxId, currency, fxRate, foreignAmt, feeThb, feeMode, payChannel, bankId, note, postJournal, beneAddress, swift, accountNo, bankName, bankAddress } = payload;
    const rate = currency === "THB" ? 1 : (Number(fxRate) || 0);
    const principalThb = round2((Number(foreignAmt) || 0) * rate);
    const fee = round2(Number(feeThb) || 0);
    const feeToCost = feeMode !== "expense"; // default: fold the transfer fee into landed cost
    const advanceThb = round2(principalThb + (feeToCost ? fee : 0)); // asset balance available to apply to a purchase
    const cashOut = round2(principalThb + fee);
    const journalId = uid();
    if (postJournal) {
      importAccounts([
        { id: "a1170", code: "1170", th: "เงินจ่ายล่วงหน้า/มัดจำซัพพลายเออร์", en: "Advances to suppliers", type: "asset" },
        { id: "a5090", code: "5090", th: "ค่าธรรมเนียมธนาคาร", en: "Bank charges", type: "expense" },
      ]);
      const accId = (code) => (accounts.find((a) => a.code === code) || {}).id;
      const adv = accId("1170") || "a1170";
      const cred = accId(payChannel === "cash" ? "1010" : "1020");
      const jl = [];
      if (advanceThb > 0 && adv) jl.push({ accountId: adv, debit: advanceThb, credit: 0 });
      if (!feeToCost && fee > 0) { const fe = accId("5090") || "a5090"; jl.push({ accountId: fe, debit: fee, credit: 0 }); }
      if (cashOut > 0 && cred) jl.push({ accountId: cred, debit: 0, credit: cashOut });
      if (jl.length >= 2) addEntry({ id: journalId, date, desc: "จ่ายล่วงหน้า/มัดจำ " + (supplier ? "— " + supplier : "") + (note ? " (" + note + ")" : "") + " / Supplier advance", lines: jl });
    }
    const rec0 = {
      id: uid(), journalId: postJournal ? journalId : null, date, supplier: supplier || "",
      supplierId: supplierId || null, supplierTaxId: supplierTaxId || "",
      currency, fxRate: rate, foreignAmt: round2(Number(foreignAmt) || 0),
      principalThb, feeThb: fee, feeMode: feeToCost ? "cost" : "expense", advanceThb,
      payChannel: payChannel === "cash" ? "cash" : "transfer", bankId: (payChannel === "cash") ? null : (bankId || null),
      note: note || "", appliedThb: 0, appliedTo: [], status: "open", postJournal: !!postJournal,
      beneAddress: beneAddress || "", swift: swift || "", accountNo: accountNo || "", bankName: bankName || "", bankAddress: bankAddress || "",
    };
    const rec = stampVer(rec0, null);
    setAdvances((prev) => [...prev, rec]);
    if (supplier && (beneAddress || swift || accountNo || bankName || bankAddress)) {
      const nm = supplier.trim().toLowerCase();
      const data = { name: supplier.trim(), taxId: supplierTaxId || "", address: beneAddress || "", swift: swift || "", accountNo: accountNo || "", bankName: bankName || "", bankAddress: bankAddress || "", updatedAt: new Date().toISOString() };
      setPayees((prev) => { const ex = prev.find((p) => (p.name || "").trim().toLowerCase() === nm); return ex ? prev.map((p) => (p.name || "").trim().toLowerCase() === nm ? { ...p, ...data } : p) : [...prev, { id: uid(), ...data }]; });
    }
    logEvent("create", "advance", rec, null);
    return rec;
  };
  const cancelAdvance = (rec) => {
    if (rec && rec.voided) { window.alert(t("รายการมัดจำนี้ถูกยกเลิกไปแล้ว", "This advance is already cancelled.")); return; }
    if ((Number(rec.appliedThb) || 0) > 0 || rec.status === "applied") { window.alert(t("มัดจำนี้ถูกเชื่อมกับบิลซื้อแล้ว — ยกเลิกบิลซื้อนั้นก่อน", "This advance is already applied to a purchase — cancel that purchase first.")); return; }
    if (!window.confirm(t("ยกเลิกรายการจ่ายล่วงหน้า/มัดจำ " + (rec.supplier || "") + " ?\nจะทำเครื่องหมาย \"ยกเลิก\" (เก็บไว้ดูย้อนหลังได้) และตั้งรายการบัญชีกลับให้อัตโนมัติ", "Cancel this supplier advance " + (rec.supplier || "") + "?\nIt will be marked \"cancelled\" (kept on record) and a reversing journal posted."))) return;
    let voidJournalId = null;
    if (rec.journalId) {
      const origJ = entries.find((e) => e.id === rec.journalId);
      if (origJ && Array.isArray(origJ.lines) && origJ.lines.length) {
        voidJournalId = uid();
        addEntry({ id: voidJournalId, date: todayISO(), desc: "กลับรายการ ยกเลิกมัดจำ " + (rec.supplier || "") + " / Reversal of advance", lines: reverseLines(origJ.lines), reversalOf: rec.journalId });
      }
    }
    const voided = { ...rec, voided: true, voidedAt: nowTS(), voidRev: (Number(rec.voidRev) || 0) + 1, voidJournalId };
    setAdvances((prev) => prev.map((x) => (x.id === rec.id ? voided : x)));
    logEvent("cancel", "advance", voided, rec);
  };

  // bulk imports
  const importEntries = (list) => setEntries((p) => [...p, ...list]);
  const importAccounts = (list) =>
    setAccounts((prev) => {
      const have = new Set(prev.map((a) => a.code));
      const add = list.filter((a) => !have.has(a.code));
      return add.length ? [...prev, ...add] : prev;
    });
  // re-add any missing core account (deleted from the chart / restored old backup) before journaling to it;
  // pair with the "a"+code id fallback at each accId call — DEFAULT ids are exactly "a"+code
  const ensureAccounts = (codes) => importAccounts(DEFAULT_ACCOUNTS.filter((a) => codes.includes(a.code)));
  const importProducts = (incoming) =>
    setProducts((prev) => {
      const out = [...prev];
      const indexByBarcode = {};
      out.forEach((p, i) => { if (p.barcode) indexByBarcode[norm(p.barcode)] = i; });
      incoming.forEach((np) => {
        const key = norm(np.barcode);
        if (key && indexByBarcode[key] != null) {
          const i = indexByBarcode[key];
          const cur = out[i];
          const addQty = Number(np.qty) || 0;
          // products already on FIFO layers count on-hand from layers — imported qty must land as a layer too,
          // otherwise it is invisible and gets erased when the next sale recomputes qty from layers
          const layers = (Array.isArray(cur.layers) && cur.layers.length && addQty > 0)
            ? [...cur.layers, { qty: addQty, unitCost: Number(np.cost) || Number(cur.cost) || 0 }]
            : cur.layers;
          out[i] = { ...cur, qty: (Number(cur.qty) || 0) + addQty, layers, cost: np.cost || cur.cost, price: np.price || cur.price };
        } else {
          out.push(np);
          if (key) indexByBarcode[key] = out.length - 1;
        }
      });
      return out;
    });

  const loadSample = () => {
    if (gateOn && acctLevel < 3) { window.alert(t("ต้องเป็นผู้ดูแล (ระดับ 3) เท่านั้น", "Admin (level 3) only.")); return; }
    if (entries.length && !window.confirm(t("จะแทนที่ข้อมูลเดิมด้วยตัวอย่าง?", "Replace current data with sample data?"))) return;
    setEntries(sampleEntries(accounts));
    setTab("dashboard");
  };
  const clearAll = () => {
    if (gateOn && acctLevel < 3) { window.alert(t("ต้องเป็นผู้ดูแล (ระดับ 3) เท่านั้น", "Admin (level 3) only.")); return; }
    if (!window.confirm(t("ลบรายการบันทึกทั้งหมด? (ผังบัญชีจะยังอยู่)", "Delete all journal entries? (chart of accounts stays)"))) return;
    setEntries([]);
  };

  // full-data backup / restore (.json)
  const exportAll = () => {
    try {
      const data = { accounts, entries, products, categories, movements, customers, banks, sales, purchases, expenses, docs, payments, apPayments, assets, whts, history, advances, custDeposits, payees, pendingSales, hsTable, profile, auth, paperBoards, lang, vatRate, paperBoardsV, paperStockV };
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const n = new Date(); const p = (x) => String(x).padStart(2, "0");
      const stamp = n.getFullYear() + "-" + p(n.getMonth() + 1) + "-" + p(n.getDate()) + "_" + p(n.getHours()) + p(n.getMinutes());
      a.href = url; a.download = "thaicolor-data-" + stamp + ".json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      markSaved();
    } catch (e) { alert("Export failed"); }
  };
  // NOTE: no level guard here — restoreAll is also used by SYSTEM flows (initial IndexedDB load,
  // "newer backup found" prompt). User-initiated restore entry points carry the admin guard instead.
  const restoreAll = (obj) => {
    if (!obj || typeof obj !== "object") { alert(t("ไฟล์ไม่ถูกต้อง", "Invalid file")); return; }
    if (Array.isArray(obj.accounts) && obj.accounts.length) setAccounts(obj.accounts);
    setEntries(Array.isArray(obj.entries) ? obj.entries : []);
    setProducts(Array.isArray(obj.products) ? obj.products : []);
    setCategories(Array.isArray(obj.categories) ? obj.categories : []);
    setMovements(Array.isArray(obj.movements) ? obj.movements : []);
    setCustomers(Array.isArray(obj.customers) ? obj.customers : []);
    setBanks(Array.isArray(obj.banks) ? obj.banks : []);
    setSales(Array.isArray(obj.sales) ? obj.sales : []);
    setPurchases(Array.isArray(obj.purchases) ? obj.purchases : []);
    setExpenses(Array.isArray(obj.expenses) ? obj.expenses : []);
    setDocs(Array.isArray(obj.docs) ? obj.docs : []);
    setPayments(Array.isArray(obj.payments) ? obj.payments : []);
    setApPayments(Array.isArray(obj.apPayments) ? obj.apPayments : []);
    setAssets(Array.isArray(obj.assets) ? obj.assets : []);
    setWhts(Array.isArray(obj.whts) ? obj.whts : []);
    setHistory(Array.isArray(obj.history) ? obj.history : []);
    setAdvances(Array.isArray(obj.advances) ? obj.advances : []);
    setCustDeposits(Array.isArray(obj.custDeposits) ? obj.custDeposits : []);
    setPayees(Array.isArray(obj.payees) ? obj.payees : []);
    setPendingSales(Array.isArray(obj.pendingSales) ? obj.pendingSales : []);
    setHsTable(Array.isArray(obj.hsTable) ? obj.hsTable : []);
    if (obj.profile && typeof obj.profile === "object") setProfile((p) => ({ ...p, ...obj.profile }));
    if (obj.auth && typeof obj.auth === "object") setAuth({ enabled: !!obj.auth.enabled, users: Array.isArray(obj.auth.users) ? obj.auth.users : [] });
    if (Array.isArray(obj.paperBoards)) setPaperBoards(obj.paperBoards);
    if (obj.lang) setLang(obj.lang === "both" ? "th" : obj.lang);
    if (typeof obj.vatRate === "number" && obj.vatRate > 0) setVatRate(obj.vatRate);
    if (typeof obj.paperBoardsV === "number") setPaperBoardsV(obj.paperBoardsV);
    if (typeof obj.paperStockV === "number") setPaperStockV(obj.paperStockV);
    setTab("dashboard");
  };

  const TABS = [
    ["dashboard", "แดชบอร์ด", "Dashboard"],
    ["accounts", "ผังบัญชี", "Chart of Accounts"],
    ["journal", "สมุดรายวัน", "Journal"],
    ["ledger", "แยกประเภท", "Ledger"],
    ["trial", "งบทดลอง", "Trial Balance"],
    ["statements", "งบการเงิน", "Statements"],
    ["inventory", "สินค้า/สต๊อค", "Inventory"],
    ["paper", "สต๊อกกระดาษ", "Paper stock"],
    ["serials", "ทะเบียน Serial / ประกัน", "Serial registry"],
    ["sell", "ขาย / ออกบิล", "Sell / Invoice"],
    ["bills", "บิลขาย", "Bills"],
    ["purchases", "ซื้อ / นำเข้า", "Purchases"],
    ["purchasebills", "บิลซื้อ", "Purchase bills"],
    ["advances", "มัดจำ / จ่ายล่วงหน้า", "Supplier advances"],
    ["custdeposits", "มัดจำลูกค้า", "Customer deposits"],
    ["pending", "รอออกบิล", "Pending bills"],
    ["docs", "เอกสารขาย", "Sales documents"],
    ["receivables", "ลูกหนี้ / เจ้าหนี้", "Receivables / Payables"],
    ["marketplace", "ขายออนไลน์ Shopee/Lazada", "Online sales (Shopee/Lazada)"],
    ["wht", "หัก ณ ที่จ่าย", "Withholding tax"],
    ["assets", "สินทรัพย์ถาวร", "Fixed assets"],
    ["yearend", "ปิดสต๊อกปลายปี", "Year-end stock"],
    ["scandoc", "สแกนเอกสาร", "Scan document"],
    ["customers", "ลูกค้า", "Customers"],
    ["reports", "รายงานขาย", "Sales reports"],
    ["expenses", "ค่าใช้จ่ายร้าน", "Shop expenses"],
    ["acctsum", "สรุปบัญชี/ภาษี", "Tax & summary"],
    ["insights", "วิเคราะห์สินค้า", "Product insights"],
    ["import", "นำเข้าข้อมูล", "Import"],
    ["settings", "ตั้งค่าร้าน", "Shop settings"],
    ["formedit", "ตั้งค่าฟอร์มเอกสาร", "Document form layout"],
    ["readpdf", "อ่าน PDF", "Read PDF"],
  ];
  // level 2 sees operations only (no cost / profit / sales totals / accounting books)
  const L2_TABS = ["inventory", "paper", "serials", "sell", "bills", "customers", "docs", "advances"];
  const L3_ONLY = ["expenses", "acctsum", "receivables", "marketplace", "wht", "assets", "yearend", "scandoc"]; // pages visible to level 3 only
  const baseTabs = TABS.filter(([k]) => acctLevel >= 3 || !L3_ONLY.includes(k));
  const visibleTabs = (gateOn && acctLevel === 2) ? baseTabs.filter(([k]) => L2_TABS.includes(k)) : baseTabs;
  useEffect(() => {
    if (gateOn && acctLevel === 2 && !L2_TABS.includes(tab)) setTab("inventory");
    if (acctLevel < 3 && L3_ONLY.includes(tab)) setTab("dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acctLevel, gateOn, tab]);

  if (!loaded) {
    return (
      <div className="acc-root">
        <style>{CSS}</style>
        <div className="wrap"><div style={{ padding: "80px 0", textAlign: "center", color: "var(--soft)" }}>กำลังโหลด… / Loading…</div></div>
      </div>
    );
  }

  // login gate (layer 1): must sign in before using the app
  if (gateOn && !sessionUser) {
    return (
      <div className="acc-root">
        <style>{CSS}</style>
        <SignIn t={t} shopName={profile.shopName} onSignIn={signIn} />
      </div>
    );
  }

  const invoiceOverlay = invoiceSale ? (
    <InvoiceModal t={t} lang={lang} sale={invoiceSale} profile={profile} banks={banks} money={money}
      onClose={() => { setInvoiceSale(null); forceSyncNow(); }} onEdit={acctLevel >= 3 ? editSale : null} onDelete={acctLevel >= 3 ? deleteSale : null} />
  ) : null;

  const acctLoginOverlay = acctLoginOpen ? (
    <AcctLogin t={t} onLogin={acctSignIn} onCancel={() => setAcctLoginOpen(false)} hasLinkedFile={!!linkedFileName} />
  ) : null;

  const fmtStamp = (iso) => { try { const d = new Date(iso); return fmtDate(d.toISOString().slice(0, 10)) + " " + d.toTimeString().slice(0, 5); } catch (e) { return ""; } };
  const newerBackupOverlay = newerBackup ? (
    <Portal>
      <div style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.62)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div className="card card-pad" style={{ maxWidth: 460, width: "100%", background: "#FBF8F0", color: "#1F231D", boxShadow: "0 16px 50px rgba(20,18,14,.4)" }}>
          <div style={{ fontSize: 26, marginBottom: 4 }}>🔄</div>
          <div className="line-head" style={{ marginBottom: 6 }}>{t("พบข้อมูลที่ใหม่กว่าในโฟลเดอร์สำรอง", "A newer backup was found")}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 12 }}>
            {t("โฟลเดอร์ ", "Folder ")}<b>{newerBackup.where}</b>{t(" มีข้อมูลที่บันทึกล่าสุดเมื่อ ", " has data last saved on ")}<b>{fmtStamp(newerBackup.savedAt)}</b>
            {t(" ซึ่งใหม่กว่าข้อมูลในเครื่องนี้ (", " — newer than this device (")}{localSavedAtRef.current ? fmtStamp(localSavedAtRef.current) : t("ไม่มีข้อมูล", "no data")}{")"}
            {newerBackup.data && <div style={{ marginTop: 8, fontWeight: 600 }}>{t("ข้อมูลในไฟล์นั้น: ", "That backup has: ")}{(newerBackup.data.sales || []).length} {t("ขาย", "sales")} · {(newerBackup.data.products || []).length} {t("สินค้า", "products")} · {(newerBackup.data.customers || []).length} {t("ลูกค้า", "customers")}</div>}
            <div style={{ marginTop: 8, color: "var(--soft)" }}>{t("น่าจะมาจากการใช้งานบนอีกเครื่อง — แนะนำให้โหลดตัวล่าสุดมาใช้ก่อนเริ่มงาน", "Likely from using another device — load the latest before you start.")}</div>
            <div style={{ marginTop: 6, color: "var(--soft)", fontSize: 12 }}>{t("อยากเลือกไฟล์อื่นเอง: ตั้งค่าร้าน → เลือกแหล่งข้อมูลที่จะใช้", "To pick a different one: Shop settings → Choose which data to load.")}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={acceptNewerBackup}>⬇️ {t("โหลดตัวล่าสุดมาใช้", "Load the latest")}</button>
            <button className="btn" onClick={() => setNewerBackup(null)}>{t("ใช้ข้อมูลในเครื่องนี้", "Keep this device's data")}</button>
          </div>
        </div>
      </div>
    </Portal>
  ) : null;

  const saveBadge = (saveError || dirty) ? (
    <button className="btn btn-sm" style={saveError
      ? { borderColor: "#b3261e", color: "#b3261e", fontWeight: 700 }
      : { borderColor: "#c79100", color: "#8a6500", fontWeight: 700 }} onClick={exportAll}
      title={saveError
        ? t("บันทึกอัตโนมัติล้มเหลว (พื้นที่เก็บอาจเต็ม) — กดส่งออกไฟล์สำรองทันที", "Autosave FAILED (storage may be full) — tap to export a backup now")
        : t("มีข้อมูลที่ยังไม่ได้บันทึกลงไฟล์ — กดเพื่อส่งออกไฟล์สำรองทันที", "Changes not yet saved to a file — tap to export a backup now")}>
      ● {saveError ? t("บันทึกไม่สำเร็จ!", "Save FAILED!") : t("ยังไม่ได้บันทึก", "Unsaved")}
    </button>
  ) : null;

  if (posMode) {
    return (
      <div className="acc-root">
        <style>{CSS}</style>
        <div className="wrap">
          <div className="topbar">
            <div>
              <div className="brand-th">โหมดขาย <span className="brand-accent">POS</span></div>
              <div className="brand-en">{profile.shopName || "Sales terminal"}{sessionUser ? " · " + (sessionUser.name || sessionUser.username) : ""}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {saveBadge}
              {linkedFileName && (fileSaveErr
                ? <button className="btn btn-sm" style={{ borderColor: "var(--red)", color: "var(--red)" }} title={fileSaveErr} onClick={reconnectDataFile}>⚠ {t("กดเพื่อซิงค์ต่อ", "Tap to resync")}</button>
                : <span className="muted" style={{ fontSize: 12 }}>{"☁ " + t("ซิงค์อัตโนมัติ", "auto-sync")}</span>)}
              {backupDirName && backupErr && <button className="btn btn-sm" style={{ borderColor: "var(--red)", color: "var(--red)" }} title={backupErr} onClick={reconnectBackupDir}>🗂 {t("สำรองต่อ", "Resume backup")}</button>}
              <button className="btn btn-sm" onClick={() => setPaperLookupOpen(true)}>📄 {t("เช็คกระดาษ", "Paper")}</button>
              {gateOn ? (
                <>
                  {Number((sessionUser || {}).level) >= 2 && <button className="btn btn-sm" onClick={() => setAcctLoginOpen(true)}>🔒 {t("เข้าโหมดบัญชี", "Accounting")}</button>}
                  <button className="btn btn-sm" onClick={logout}>{t("ออกจากระบบ", "Sign out")}</button>
                </>
              ) : (
                <button className="btn btn-sm" onClick={() => setPosMode(false)}>← {t("ออกจากโหมดขาย", "Exit POS")}</button>
              )}
            </div>
          </div>
          <SellScan
            t={t} lang={lang} products={products} customers={customers} banks={banks} profile={profile} sales={sales}
            onCommit={commitSale} onPark={parkSale} onShowInvoice={setInvoiceSale} onSaveCustomer={saveCustomer}
            prefill={prefill} onPrefillDone={() => setPrefill(null)} acctLevel={acctLevel} onAttachSerial={attachSerialToProduct}
            setTab={setTab} money={money} vatRate={vatRate} posMode
          />
        </div>
        {invoiceOverlay}
        {acctLoginOverlay}
        {newerBackupOverlay}
        {paperLookupOpen && <PaperLookup t={t} boards={paperBoardsLive} onClose={() => setPaperLookupOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="acc-root">
      <style>{CSS}</style>
      <style>{formOverrideCss(profile.formSettings)}</style>
      <div className="wrap">
        {/* top bar */}
        <div className="topbar">
          <div>
            <div className="brand-th">สมุดบัญชี<span className="brand-accent">คู่</span><span style={{ fontSize: 11, fontWeight: 500, opacity: 0.5, marginLeft: 7, verticalAlign: "middle", letterSpacing: 0 }}>{APP_VERSION}</span></div>
            <div className="brand-en">Double-Entry Ledger{gateOn && acctUnlock ? " · " + (acctUnlock.name || acctUnlock.username) + " (" + t("ระดับ", "L") + acctLevel + ")" : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {saveBadge}
            {gateOn ? (
              <>
                <button className="btn btn-sm" onClick={lockToPos} title={t("กลับหน้าขาย (ล็อกบัญชี)", "Back to POS (lock)")}>🔒 {t("กลับหน้าขาย", "Lock")}</button>
                <button className="btn btn-sm" onClick={logout}>{t("ออกจากระบบ", "Sign out")}</button>
              </>
            ) : (
              <button className="btn btn-sm pos-enter" onClick={() => setPosMode(true)} title={t("เปิดหน้าขายสำหรับพนักงาน", "Open salesperson screen")}>🧾 {t("โหมดขาย", "POS")}</button>
            )}
            <div className="langtoggle" role="group" aria-label="language">
              {[["th", "ไทย"], ["en", "EN"]].map(([k, lbl]) => (
                <button key={k} className={"langbtn" + (lang === k ? " on" : "")} onClick={() => setLang(k)}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        {/* tabs + content — sidebar on wide screens, top strip on mobile/portrait */}
        <div className="layout">
        <div className="tabs">
          {visibleTabs.map(([key, th, en]) => (
            <button key={key} className={"tab" + (tab === key ? " active" : "")} onClick={() => setTab(key)}>
              {t(th, en)}
            </button>
          ))}
        </div>

        <div className="page">
        {tab === "dashboard" && (
          <Dashboard acctLevel={acctLevel}
            t={t} totals={{ totalAssets, totalLiab, totalEquity, totalRevenue, totalExpense, netIncome }}
            balanced={balanced} bsBalanced={bsBalanced}
            available={visibleTabs.map((x) => x[0])} setTab={setTab} money={money}
          />
        )}

        {tab === "accounts" && (
          <Accounts
            t={t} accName={accName} accounts={sortedAccounts} totals={totals}
            balanceOf={balanceOf} onAdd={addAccount} onDelete={deleteAccount} money={money}
          />
        )}

        {tab === "journal" && (
          <Journal
            t={t} lang={lang} accName={accName} accounts={sortedAccounts} acctById={acctById}
            entries={sortedEntries} onAdd={addEntry} onDelete={deleteEntry} money={money} onHistory={(e) => openHistory("entry", e)}
          />
        )}

        {tab === "ledger" && (
          <Ledger
            t={t} accName={accName} accounts={sortedAccounts} entries={sortedEntries}
            totals={totals} balanceOf={balanceOf} money={money}
          />
        )}

        {tab === "trial" && (
          <TrialBalance
            t={t} accName={accName} accounts={sortedAccounts} totals={totals}
            tbDebit={tbDebit} tbCredit={tbCredit} balanced={balanced} money={money}
          />
        )}

        {tab === "statements" && (
          <Statements
            t={t} accName={accName} accounts={sortedAccounts} balanceOf={balanceOf}
            sums={{ totalAssets, totalLiab, totalEquityAccts, totalRevenue, totalExpense, netIncome, totalEquity }}
            bsBalanced={bsBalanced} money={money}
          />
        )}

        {tab === "inventory" && (
          <Inventory
            t={t} lang={lang} accName={accName} products={products} sales={sales}
            categories={categories} onAddCategory={addCategory} onDeleteCategory={deleteCategory}
            onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} hsTable={hsTable} onSaveHsTable={setHsTable}
            addMovement={addMovement} money={money} showCost={showCost}
          />
        )}

        {tab === "paper" && (
          <PaperStock t={t} boards={paperBoardsLive} />
        )}

        {tab === "serials" && (
          <SerialRegistry
            t={t} lang={lang} products={products} sales={sales} customers={customers}
            money={money} showCost={showCost} onClaim={claimSerial} onUpdateProduct={updateProduct}
          />
        )}

        {tab === "sell" && (
          <SellScan
            t={t} lang={lang} products={products} customers={customers} banks={banks} profile={profile} sales={sales}
            onCommit={commitSale} onPark={parkSale} onShowInvoice={setInvoiceSale} onSaveCustomer={saveCustomer}
            prefill={prefill} onPrefillDone={() => setPrefill(null)} acctLevel={acctLevel} onAttachSerial={attachSerialToProduct}
            setTab={setTab} money={money} vatRate={vatRate}
          />
        )}

        {tab === "bills" && (
          <BillsList
            t={t} lang={lang} sales={sales} money={money} showTotal={showCost}
            onShowInvoice={setInvoiceSale} onEdit={acctLevel >= 3 ? editSale : null} onDelete={acctLevel >= 3 ? deleteSale : null} onHistory={(s) => openHistory("sale", s)}
          />
        )}

        {tab === "purchases" && (
          <Purchases
            t={t} lang={lang} products={products} banks={banks} accounts={sortedAccounts}
            customers={customers} onSaveCustomer={saveCustomer}
            purchases={purchases} advances={advances} money={money} vatRate={vatRate} onCommit={commitPurchase} onDelete={deletePurchase} onPrintVoucher={setVoucherPurch} onAdjustLanded={adjustPurchaseLanded} hsTable={hsTable}
          />
        )}

        {tab === "purchasebills" && (
          <PurchaseBillsList
            t={t} lang={lang} purchases={purchases} banks={banks} money={money}
            onDelete={deletePurchase} canDelete={acctLevel >= 3} onPrintVoucher={setVoucherPurch} onHistory={(p) => openHistory("purchase", p)} />
        )}

        {tab === "advances" && (
          <Advances
            t={t} lang={lang} advances={advances} banks={banks} purchases={purchases} payees={payees} money={money}
            onCommit={commitAdvance} onCancel={cancelAdvance} onHistory={(a) => openHistory("advance", a)} />
        )}

        {tab === "insights" && (
          <ProductInsights t={t} lang={lang} sales={activeSales} products={products} money={money} />
        )}

        {tab === "customers" && (
          <Customers
            t={t} lang={lang} customers={customers} sales={activeSales} products={products}
            onSave={saveCustomer} onDelete={deleteCustomer} onShowInvoice={setInvoiceSale} money={money}
          />
        )}

        {tab === "reports" && (
          <Reports t={t} lang={lang} sales={activeSales} purchases={activePurchases} expenses={activeExpenses} products={products} customers={customers} money={money} />
        )}

        {tab === "expenses" && acctLevel >= 3 && (
          <Expenses t={t} lang={lang} expenses={expenses} banks={banks} purchases={purchases} customers={customers} onSave={saveExpense} onDelete={deleteExpense} money={money} vatRate={vatRate} onHistory={(e) => openHistory("expense", e)} />
        )}

        {tab === "acctsum" && acctLevel >= 3 && (
          <AcctSummary t={t} sales={activeSales} purchases={activePurchases} expenses={activeExpenses} money={money} vatRate={vatRate} />
        )}

        {tab === "docs" && (
          <SalesDocs t={t} lang={lang} docs={docs} customers={customers} products={products} profile={profile} banks={banks} money={money} vatRate={vatRate}
            onSave={saveDoc} onDelete={deleteDoc} onSaveCustomer={saveCustomer} onIssueBill={issueDocAsBill} acctLevel={acctLevel} onHistory={(d) => openHistory("doc", d)} />
        )}

        {tab === "receivables" && acctLevel >= 3 && (
          <Receivables t={t} lang={lang} sales={activeSales} payments={payments} purchases={activePurchases} apPayments={apPayments} customers={customers} banks={banks} money={money}
            onAddPayment={addPayment} onDeletePayment={deletePayment} onAddApPayment={addApPayment} onDeleteApPayment={deleteApPayment} onShowInvoice={setInvoiceSale} />
        )}

        {tab === "marketplace" && acctLevel >= 3 && (
          <Marketplace t={t} lang={lang} sales={activeSales} banks={banks} money={money}
            onSettleBatch={settleMarketplaceBatch} onUnsettleBatch={unsettleBatch} onCancel={(s) => voidSale(s.id)} onShowInvoice={setInvoiceSale} />
        )}

        {tab === "wht" && acctLevel >= 3 && (
          <WHT t={t} lang={lang} whts={whts} customers={customers} profile={profile} money={money} onSave={saveWht} onDelete={deleteWht} onHistory={(w) => openHistory("wht", w)} />
        )}

        {tab === "assets" && acctLevel >= 3 && (
          <FixedAssets t={t} lang={lang} assets={assets} accounts={sortedAccounts} money={money} onSave={saveAsset} onDelete={deleteAsset} onPostDepreciation={addEntry} onEnsureAccounts={importAccounts} onHistory={(a) => openHistory("asset", a)} />
        )}

        {tab === "yearend" && acctLevel >= 3 && (
          <YearEnd t={t} lang={lang} products={products} sales={activeSales} purchases={activePurchases} accounts={sortedAccounts} money={money} productValue={productValue} onPost={addEntry} onEnsureAccounts={importAccounts} />
        )}

        {tab === "scandoc" && acctLevel >= 3 && (
          <ScanDoc t={t} lang={lang} banks={banks} onSaveExpense={saveExpense} />
        )}

        {tab === "import" && (
          <ImportData
            t={t} lang={lang} accounts={sortedAccounts} acctById={acctById}
            onImportEntries={importEntries} onImportProducts={importProducts} onImportAccounts={importAccounts} money={money}
          />
        )}

        {tab === "custdeposits" && (
          <CustDeposits t={t} lang={lang} custDeposits={custDeposits} customers={customers} banks={banks} sales={sales} money={money} onAdd={addCustDeposit} onToggle={markCustDepositUsed} onDelete={deleteCustDeposit} />
        )}

        {tab === "pending" && (
          <PendingBills t={t} lang={lang} pendingSales={pendingSales} banks={banks} money={money} onIssue={issueBillsFromPending} onDelete={deletePending} onShowInvoice={setInvoiceSale} setTab={setTab} />
        )}

        {tab === "formedit" && (
          <FormSettings t={t} lang={lang} profile={profile} money={money} onSave={(fs) => setProfile((p) => ({ ...p, formSettings: fs }))} />
        )}

        {tab === "readpdf" && <PdfReader t={t} lang={lang} />}

        {tab === "settings" && (
          <ShopSettings t={t} lang={lang} profile={profile} onProfile={setProfile} banks={banks} onSaveBank={saveBank} onDeleteBank={deleteBank} onExportData={exportAll} onRestoreData={(obj) => { if (gateOn && acctLevel < 3) { window.alert(t("กู้คืนข้อมูลได้เฉพาะผู้ดูแล (ระดับ 3)", "Only an admin (level 3) can restore data.")); return; } restoreAll(obj); }}
            fsSupported={typeof window !== "undefined" && !!window.showOpenFilePicker} linkedFileName={linkedFileName} fileSaveErr={fileSaveErr}
            onLinkData={linkDataFile} onLinkNewData={linkNewDataFile} onReconnectData={reconnectDataFile} onUnlinkData={unlinkDataFile}
            backupDirName={backupDirName} backupErr={backupErr} backupLastDate={backupLastDate} driveDirName={driveDirName}
            onPickBackupDir={pickBackupDir} onReconnectBackup={reconnectBackupDir} onUnlinkBackup={unlinkBackupDir} onBackupNow={backupNow}
            onPickDriveDir={pickDriveDir} onUnlinkDrive={unlinkDriveDir} onListBackups={listBackups} onLoadBackup={loadBackup}
            dataCounts={{ sales: sales.length, products: products.length, customers: customers.length }} dataSavedAt={localSavedAtRef.current}
            auth={auth} onSaveUser={saveUser} onDeleteUser={deleteUser} onToggleAuth={setAuthEnabled} currentLevel={acctLevel} vatRate={vatRate} onVatRate={setVatRate} />
        )}

        <div className="foot-note">
          เดบิต = เครดิตเสมอในทุกรายการ · บันทึกข้อมูลอัตโนมัติ{storageOk ? "" : " (เฉพาะระหว่างเปิดหน้านี้)"}<br />
          Every entry must balance (debits = credits){storageOk ? " · saved automatically" : " · session only on this device"}
        </div>
        </div>{/* .page */}
        </div>{/* .layout */}
      </div>
      {invoiceOverlay}
      {tab === "stockreport" && <StockReport t={t} lang={lang} products={products} profile={profile} money={money} onClose={() => setTab("inventory")} />}
      {voucherPurch && <PaymentVoucher t={t} lang={lang} purchase={voucherPurch} profile={profile} money={money} onClose={() => setVoucherPurch(null)} />}
      {histView && <HistoryModal t={t} lang={lang} view={histView} history={history} money={money} onClose={() => setHistView(null)} />}
      {newerBackupOverlay}
    </div>
  );
}

/* ============================ Dashboard ============================ */
function Dashboard({ t, totals, balanced, bsBalanced, available, setTab, money, acctLevel = 3 }) {
  const [cat, setCat] = useState(null);
  const has = (k) => !available || available.includes(k);
  const CATS = [
    { id: "sell", icon: "🧾", th: "ขาย / ลูกค้า", en: "Sell / Customers", items: [["sell", "ออกบิล / ขาย", "Sell / Invoice"], ["docs", "เอกสารขาย (เสนอราคา/ส่งของ)", "Sales docs"], ["pending", "รอออกบิล", "Pending bills"], ["bills", "บิลขาย", "Bills"], ["customers", "ลูกค้า / ผู้ติดต่อ", "Customers"], ["custdeposits", "มัดจำลูกค้า", "Customer deposits"]] },
    { id: "stock", icon: "📦", th: "สต๊อก / รับเข้า", en: "Stock", items: [["inventory", "สินค้า / สต๊อก", "Inventory"], ["paper", "สต๊อกกระดาษ", "Paper stock"], ["serials", "ทะเบียน Serial / ประกัน", "Serial registry"], ["stockreport", "สรุปสต๊อก", "Stock report"], ["purchases", "ซื้อ / นำเข้า", "Purchases"], ["purchasebills", "บิลซื้อ", "Purchase bills"], ["advances", "มัดจำ / จ่ายล่วงหน้า", "Supplier advances"]] },
    { id: "books", icon: "📒", th: "บัญชี", en: "Accounting", items: [["journal", "สมุดรายวัน", "Journal"], ["ledger", "แยกประเภท", "Ledger"], ["trial", "งบทดลอง", "Trial Balance"], ["statements", "งบการเงิน", "Statements"], ["accounts", "ผังบัญชี", "Chart of Accounts"]] },
    { id: "reports", icon: "📊", th: "รายงาน", en: "Reports", items: [["reports", "รายงานขาย", "Sales reports"], ["insights", "วิเคราะห์สินค้า", "Product insights"]] },
    ...(acctLevel >= 3 ? [{ id: "money", icon: "🧾", th: "ค่าใช้จ่าย / ภาษี", en: "Expenses / Tax", items: [["expenses", "ค่าใช้จ่ายร้าน", "Shop expenses"], ["receivables", "ลูกหนี้ / เจ้าหนี้", "Receivables / Payables"], ["wht", "หัก ณ ที่จ่าย", "Withholding tax"], ["acctsum", "สรุปบัญชี/ภาษี", "Tax & summary"]] }, { id: "fin", icon: "🏛", th: "สินทรัพย์ / ปิดงวด", en: "Assets / Closing", items: [["assets", "สินทรัพย์ถาวร", "Fixed assets"], ["yearend", "ปิดสต๊อกปลายปี", "Year-end stock"], ["scandoc", "สแกนเอกสาร (AI)", "Scan document (AI)"]] }] : []),
    { id: "system", icon: "⚙️", th: "ระบบ / ตั้งค่า", en: "System", items: [["import", "นำเข้าข้อมูล", "Import"], ["settings", "ตั้งค่าร้าน", "Settings"], ["formedit", "ตั้งค่าฟอร์มเอกสาร", "Form layout"], ["readpdf", "อ่าน PDF (ดึงข้อความ)", "Read PDF"]] },
  ];
  const cats = CATS.map((c) => ({ ...c, items: c.items.filter(([k]) => has(k)) })).filter((c) => c.items.length);
  const current = cat && cat !== "__fin" ? cats.find((c) => c.id === cat) : null;
  const finCards = [
    ["สินทรัพย์", "Assets", totals.totalAssets, "var(--green)"],
    ["หนี้สิน", "Liabilities", totals.totalLiab, "var(--gold)"],
    ["ส่วนของเจ้าของ", "Equity", totals.totalEquity, "#3C4673"],
    ["รายได้", "Revenue", totals.totalRevenue, "#1F6E66"],
    ["ค่าใช้จ่าย", "Expenses", totals.totalExpense, "var(--red)"],
    ["กำไร(ขาดทุน)สุทธิ", "Net income", totals.netIncome, totals.netIncome >= 0 ? "var(--green)" : "var(--red)"],
  ];
  return (
    <div>
      {!cat ? (
        <>
          <div className="section-title">{t("เมนูหลัก", "Home")}</div>
          <div className="section-sub">{t("เลือกหัวข้อที่ต้องการ", "Pick what you want to do")}</div>
          <div className="home-grid">
            <button className="home-card accent" onClick={() => setCat("__fin")}>
              <span className="home-ic">📈</span>
              <span className="home-tt">{t("ภาพรวมการเงิน", "Financial overview")}</span>
              <span className="home-sub">{t("สินทรัพย์/รายได้/กำไร", "assets / revenue / profit")}</span>
            </button>
            {cats.map((c) => (
              <button key={c.id} className="home-card" onClick={() => setCat(c.id)}>
                <span className="home-ic">{c.icon}</span>
                <span className="home-tt">{t(c.th, c.en)}</span>
                <span className="home-sub">{c.items.length} {t("รายการ", "items")}</span>
              </button>
            ))}
          </div>
        </>
      ) : cat === "__fin" ? (
        <>
          <button className="btn btn-sm" onClick={() => setCat(null)}>← {t("กลับเมนูหลัก", "Back")}</button>
          <div className="section-title" style={{ marginTop: 10 }}>📈 {t("ภาพรวมการเงิน", "Financial overview")}</div>
          <div className="kpi-grid" style={{ marginTop: 8 }}>
            {finCards.map(([th, en, val, color]) => (
              <div className="kpi" key={en}><div className="kpi-label">{t(th, en)}</div><div className="kpi-val" style={{ color }}>฿{money(val)}</div></div>
            ))}
          </div>
          <div className="card card-pad" style={{ marginTop: 12, fontSize: 14 }}>
            {balanced ? <span style={{ color: "var(--green)" }}>✓ {t("เดบิต = เครดิต ทุกรายการสมดุล", "All entries balanced (debits = credits)")}</span>
              : <span style={{ color: "var(--red)" }}>⚠ {t("มีรายการไม่สมดุล", "Some entries are out of balance")}</span>}
            {" · "}
            {bsBalanced ? <span style={{ color: "var(--green)" }}>{t("งบดุลสมดุล", "Balance sheet balances")}</span>
              : <span style={{ color: "var(--red)" }}>{t("งบดุลไม่สมดุล", "Balance sheet off")}</span>}
          </div>
        </>
      ) : (
        <>
          <button className="btn btn-sm" onClick={() => setCat(null)}>← {t("กลับเมนูหลัก", "Back")}</button>
          <div className="section-title" style={{ marginTop: 10 }}>{current.icon} {t(current.th, current.en)}</div>
          <div className="home-grid">
            {current.items.map(([k, th, en]) => (
              <button key={k} className="home-card" onClick={() => setTab(k)}>
                <span className="home-tt">{t(th, en)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ========================= Chart of Accounts ========================= */
function Accounts({ t, accName, accounts, totals, balanceOf, onAdd, onDelete, money }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", th: "", en: "", type: "asset" });

  const submit = () => {
    if (!form.code.trim() || !form.th.trim()) {
      alert(t("กรุณากรอกรหัสบัญชีและชื่อบัญชี (ไทย)", "Please enter an account code and Thai name"));
      return;
    }
    if (accounts.some((a) => a.code === form.code.trim())) {
      alert(t("รหัสบัญชีนี้มีอยู่แล้ว", "That account code already exists"));
      return;
    }
    onAdd({ id: uid(), code: form.code.trim(), th: form.th.trim(), en: (form.en.trim() || form.th.trim()), type: form.type });
    setForm({ code: "", th: "", en: "", type: "asset" });
    setOpen(false);
  };

  const tryDelete = (a) => {
    const tt = totals[a.id];
    if (tt && (tt.debit !== 0 || tt.credit !== 0)) {
      alert(t("ลบไม่ได้: บัญชีนี้มีรายการเคลื่อนไหวแล้ว", "Can't delete: this account has transactions"));
      return;
    }
    if (window.confirm(t(`ลบบัญชี "${a.th}"?`, `Delete account "${a.en}"?`))) onDelete(a.id);
  };

  return (
    <div>
      <div className="section-title">{t("ผังบัญชี", "Chart of Accounts")}</div>
      <div className="section-sub">{t("รายการบัญชีทั้งหมด แบ่งตามหมวด สินทรัพย์ · หนี้สิน · ทุน · รายได้ · ค่าใช้จ่าย", "All accounts grouped by Assets · Liabilities · Equity · Revenue · Expenses")}</div>

      <div className="btn-row" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setOpen((o) => !o)}>{open ? t("ปิด", "Close") : "+ " + t("เพิ่มบัญชี", "Add account")}</button>
      </div>

      {open && (
        <div className="card card-pad" style={{ marginBottom: 18 }}>
          <div className="row2">
            <div className="field">
              <label>{t("รหัสบัญชี", "Code")}</label>
              <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="1060" />
            </div>
            <div className="field">
              <label>{t("หมวดบัญชี", "Type")}</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPE_ORDER.map((ty) => <option key={ty} value={ty}>{TYPE_LABEL[ty][0]} / {TYPE_LABEL[ty][1]}</option>)}
              </select>
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>{t("ชื่อบัญชี (ไทย)", "Name (Thai)")}</label>
              <input className="input" value={form.th} onChange={(e) => setForm({ ...form, th: e.target.value })} placeholder="เงินสดย่อย" />
            </div>
            <div className="field">
              <label>{t("ชื่อบัญชี (อังกฤษ)", "Name (English)")}</label>
              <input className="input" value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} placeholder="Petty Cash" />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={submit}>{t("บันทึกบัญชี", "Save account")}</button>
        </div>
      )}

      <div className="table-scroll">
        <table className="t">
          <thead>
            <tr>
              <th style={{ width: 70 }}>{t("รหัส", "Code")}</th>
              <th>{t("ชื่อบัญชี", "Account")}</th>
              <th style={{ width: 130 }}>{t("หมวด", "Type")}</th>
              <th className="r" style={{ width: 130 }}>{t("ยอดคงเหลือ", "Balance")}</th>
              <th style={{ width: 44 }}></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => {
              const bal = balanceOf(a);
              return (
                <tr key={a.id}>
                  <td className="code">{a.code}</td>
                  <td>{accName(a)}</td>
                  <td><span className={"badge b-" + a.type}>{TYPE_LABEL[a.type][0]}</span></td>
                  <td className="r acc-num">{bal < 0 ? "(" + money(bal) + ")" : money(bal)}</td>
                  <td className="c"><button className="icon-btn" title={t("ลบ", "Delete")} onClick={() => tryDelete(a)}>×</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================= Journal ============================= */
function emptyLine() { return { accountId: "", debit: "", credit: "" }; }

function Journal({ t, lang, accName, accounts, acctById, entries, onAdd, onDelete, money, onHistory }) {
  const [date, setDate] = useState(todayISO());
  const [desc, setDesc] = useState("");
  const [lines, setLines] = useState([emptyLine(), emptyLine()]);

  const setLine = (i, patch) => setLines((p) => p.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addLine = () => setLines((p) => [...p, emptyLine()]);
  const removeLine = (i) => setLines((p) => (p.length <= 2 ? p : p.filter((_, idx) => idx !== i)));

  const totDr = lines.reduce((s, l) => s + num(l.debit), 0);
  const totCr = lines.reduce((s, l) => s + num(l.credit), 0);
  const diff = totDr - totCr;
  const ok = totDr > 0 && Math.abs(diff) < 0.005;

  const save = () => {
    const used = lines
      .filter((l) => l.accountId && (num(l.debit) !== 0 || num(l.credit) !== 0))
      .map((l) => ({ accountId: l.accountId, debit: num(l.debit), credit: num(l.credit) }));
    if (used.length < 2) { alert(t("ต้องมีอย่างน้อย 2 บรรทัดที่มีบัญชีและจำนวนเงิน", "Need at least two lines with an account and an amount")); return; }
    if (!ok) { alert(t("เดบิตและเครดิตต้องเท่ากัน และมากกว่า 0", "Debits and credits must be equal and greater than zero")); return; }
    onAdd({ id: uid(), date, desc: desc.trim(), lines: used });
    setDesc(""); setLines([emptyLine(), emptyLine()]); setDate(todayISO());
  };

  return (
    <div>
      <div className="section-title">{t("สมุดรายวันทั่วไป", "General Journal")}</div>
      <div className="section-sub">{t("บันทึกรายการแบบบัญชีคู่ — ระบบตรวจให้เดบิตเท่ากับเครดิตก่อนบันทึก", "Record double-entry transactions — the form checks debits = credits before saving")}</div>

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div className="row2">
          <div className="field">
            <label>{t("วันที่", "Date")}</label>
            <DateInput className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>{t("คำอธิบายรายการ", "Description")}</label>
            <input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("เช่น ขายสินค้าเป็นเงินสด", "e.g. Cash sale")} />
          </div>
        </div>

        <div className="line-grid line-head" style={{ marginTop: 4 }}>
          <div className="line-acc">{t("บัญชี", "Account")}</div>
          <div className="r">{t("เดบิต", "Debit")}</div>
          <div className="r">{t("เครดิต", "Credit")}</div>
          <div></div>
        </div>

        {lines.map((l, i) => (
          <div className="line-grid" key={i}>
            <div className="line-acc">
              <select className="select" value={l.accountId} onChange={(e) => setLine(i, { accountId: e.target.value })}>
                <option value="">{t("— เลือกบัญชี —", "— select account —")}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} · {lang === "en" ? a.en : a.th}</option>
                ))}
              </select>
            </div>
            <input className="input r" inputMode="decimal" value={l.debit}
              onChange={(e) => setLine(i, { debit: e.target.value, credit: e.target.value ? "" : l.credit })}
              placeholder="0.00" />
            <input className="input r" inputMode="decimal" value={l.credit}
              onChange={(e) => setLine(i, { credit: e.target.value, debit: e.target.value ? "" : l.debit })}
              placeholder="0.00" />
            <button className="icon-btn" onClick={() => removeLine(i)} title={t("ลบบรรทัด", "Remove line")}>×</button>
          </div>
        ))}

        <button className="btn btn-sm" style={{ marginTop: 4 }} onClick={addLine}>+ {t("เพิ่มบรรทัด", "Add line")}</button>

        <div className="totbar">
          <span>{t("รวมเดบิต", "Total debit")} <b className="pos">฿{money(totDr)}</b></span>
          <span>{t("รวมเครดิต", "Total credit")} <b className="pos">฿{money(totCr)}</b></span>
          <span>{t("ผลต่าง", "Diff")} <b className={Math.abs(diff) < 0.005 ? "pos" : "neg"}>฿{money(diff)}</b></span>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 10, opacity: ok ? 1 : 0.55 }} onClick={save} disabled={!ok}>
          {t("บันทึกรายการ", "Post entry")}
        </button>
        {!ok && <div className="section-sub" style={{ marginTop: 8, marginBottom: 0 }}>{t("เดบิตต้องเท่ากับเครดิตจึงจะบันทึกได้", "Debits must equal credits to post")}</div>}
      </div>

      <div className="section-title" style={{ fontSize: 16 }}>{t("รายการที่บันทึกแล้ว", "Posted entries")}</div>
      <div className="section-sub">{entries.length} {t("รายการ", "entries")}</div>

      {entries.length === 0 ? (
        <div className="empty">{t("ยังไม่มีรายการ", "No entries yet")}</div>
      ) : (
        [...entries].reverse().map((e) => (
          <div className="card entry-card" key={e.id}>
            <div className="entry-top">
              <div>
                <span className="entry-date">{fmtDate(e.date)}</span>
                {e.voided ? <span style={{ marginLeft: 8, color: "#fff", background: "#c0392b", borderRadius: 5, padding: "0 6px", fontSize: 11 }}>{t("ยกเลิก", "Cancelled")}</span> : null}
                {e.reversalOf ? <span style={{ marginLeft: 8, color: "#fff", background: "#7a869a", borderRadius: 5, padding: "0 6px", fontSize: 11 }}>{t("รายการกลับ", "Reversal")}</span> : null}
                <div className="entry-desc">{e.desc || <span className="faint">{t("(ไม่มีคำอธิบาย)", "(no description)")}</span>}</div>
              </div>
              <div style={{ whiteSpace: "nowrap" }}>
                {onHistory && <button className="icon-btn" onClick={() => onHistory(e)} title={t("ดูประวัติย้อนหลัง", "History")}>🕘</button>}
                {!e.voided && onDelete && <button className="icon-btn" onClick={() => onDelete(e.id)} title={t("ยกเลิกรายการ", "Cancel entry")}>×</button>}
              </div>
            </div>
            <div className="entry-line line-head" style={{ marginBottom: 2 }}>
              <span>{t("บัญชี", "Account")}</span><span className="r">{t("เดบิต", "Debit")}</span><span className="r">{t("เครดิต", "Credit")}</span>
            </div>
            {e.lines.map((l, i) => {
              const a = acctById[l.accountId];
              const isDr = Number(l.debit) > 0;
              return (
                <div className={"entry-line " + (isDr ? "dr" : "cr")} key={i}>
                  <span className="acc">{a ? accName(a) : <span className="faint">?</span>}</span>
                  <span className="r acc-num">{Number(l.debit) ? money(l.debit) : ""}</span>
                  <span className="r acc-num">{Number(l.credit) ? money(l.credit) : ""}</span>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

/* ============================== Ledger ============================== */
function Ledger({ t, accName, accounts, entries, totals, balanceOf, money }) {
  const active = accounts.filter((a) => { const tt = totals[a.id]; return tt && (tt.debit || tt.credit); });
  const [sel, setSel] = useState("");
  const current = sel || (active[0] && active[0].id) || (accounts[0] && accounts[0].id) || "";
  const acc = accounts.find((a) => a.id === current);

  const rows = [];
  if (acc) {
    let running = 0;
    entries.forEach((e) => {
      e.lines.forEach((l) => {
        if (l.accountId !== acc.id) return;
        const dr = Number(l.debit) || 0;
        const cr = Number(l.credit) || 0;
        running += isDebitNormal(acc.type) ? dr - cr : cr - dr;
        rows.push({ date: e.date, desc: e.desc, dr, cr, running });
      });
    });
  }

  return (
    <div>
      <div className="section-title">{t("บัญชีแยกประเภท", "General Ledger")}</div>
      <div className="section-sub">{t("เลือกบัญชีเพื่อดูการเคลื่อนไหวและยอดคงเหลือสะสม", "Pick an account to see its postings and running balance")}</div>

      <div className="field" style={{ maxWidth: 420 }}>
        <label>{t("เลือกบัญชี", "Account")}</label>
        <select className="select" value={current} onChange={(e) => setSel(e.target.value)}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} · {accName(a)}</option>)}
        </select>
      </div>

      {acc && (
        <div style={{ marginBottom: 10, marginTop: 4 }}>
          <span className={"badge b-" + acc.type}>{TYPE_LABEL[acc.type][0]} / {TYPE_LABEL[acc.type][1]}</span>
          <span className="muted" style={{ fontSize: 12, marginLeft: 10 }}>
            {t("ยอดปกติด้าน", "Normal balance")}: {isDebitNormal(acc.type) ? t("เดบิต", "Debit") : t("เครดิต", "Credit")}
          </span>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="empty">{t("บัญชีนี้ยังไม่มีรายการเคลื่อนไหว", "No postings to this account yet")}</div>
      ) : (
        <div className="table-scroll">
          <table className="t">
            <thead>
              <tr>
                <th style={{ width: 92 }}>{t("วันที่", "Date")}</th>
                <th>{t("คำอธิบาย", "Description")}</th>
                <th className="r" style={{ width: 100 }}>{t("เดบิต", "Debit")}</th>
                <th className="r" style={{ width: 100 }}>{t("เครดิต", "Credit")}</th>
                <th className="r" style={{ width: 120 }}>{t("คงเหลือ", "Balance")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="code">{fmtDate(r.date)}</td>
                  <td>{r.desc || <span className="faint">—</span>}</td>
                  <td className="r acc-num">{r.dr ? money(r.dr) : ""}</td>
                  <td className="r acc-num">{r.cr ? money(r.cr) : ""}</td>
                  <td className="r acc-num">{r.running < 0 ? "(" + money(r.running) + ")" : money(r.running)}</td>
                </tr>
              ))}
              <tr className="foot">
                <td colSpan={4} className="r">{t("ยอดคงเหลือสุทธิ", "Ending balance")}</td>
                <td className="r acc-num">{acc && (balanceOf(acc) < 0 ? "(" + money(balanceOf(acc)) + ")" : money(balanceOf(acc)))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================== Trial Balance =========================== */
function TrialBalance({ t, accName, accounts, totals, tbDebit, tbCredit, balanced, money }) {
  const rows = accounts
    .map((a) => {
      const tt = totals[a.id]; const net = tt.debit - tt.credit;
      return { a, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0, active: tt.debit || tt.credit };
    })
    .filter((r) => r.active);

  return (
    <div>
      <div className="section-title">{t("งบทดลอง", "Trial Balance")}</div>
      <div className="section-sub">{t("ยอดคงเหลือของทุกบัญชี — ผลรวมเดบิตต้องเท่ากับผลรวมเครดิต", "Closing balance of every active account — total debits must equal total credits")}</div>

      <div className={"banner " + (balanced ? "banner-ok" : "banner-warn")}>
        <span className="dot" />
        {balanced ? t("งบทดลองสมดุล ✓", "In balance ✓") : t("ไม่สมดุล — ตรวจสอบรายการบันทึก", "Out of balance — check your entries")}
      </div>

      {rows.length === 0 ? (
        <div className="empty">{t("ยังไม่มีรายการเคลื่อนไหว", "No activity yet")}</div>
      ) : (
        <div className="table-scroll">
          <table className="t">
            <thead>
              <tr>
                <th style={{ width: 64 }}>{t("รหัส", "Code")}</th>
                <th>{t("ชื่อบัญชี", "Account")}</th>
                <th className="r" style={{ width: 130 }}>{t("เดบิต", "Debit")}</th>
                <th className="r" style={{ width: 130 }}>{t("เครดิต", "Credit")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.a.id}>
                  <td className="code">{r.a.code}</td>
                  <td>{accName(r.a)}</td>
                  <td className="r acc-num">{r.debit ? money(r.debit) : ""}</td>
                  <td className="r acc-num">{r.credit ? money(r.credit) : ""}</td>
                </tr>
              ))}
              <tr className="foot">
                <td colSpan={2} className="r">{t("รวม", "Total")}</td>
                <td className="r acc-num">฿{money(tbDebit)}</td>
                <td className="r acc-num">฿{money(tbCredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ========================= Financial Statements ========================= */
function Statements({ t, accName, accounts, balanceOf, sums, bsBalanced, money }) {
  const byType = (ty) => accounts.filter((a) => a.type === ty && Math.abs(balanceOf(a)) > 0.005);

  const revenues = byType("revenue");
  const expenses = byType("expense");
  const assets = byType("asset");
  const liabilities = byType("liability");
  const equityAccts = byType("equity");

  const Line = ({ a }) => (
    <div className="stmt-row">
      <span>{accName(a)}</span>
      <span className="stmt-amt">{balanceOf(a) < 0 ? "(" + money(balanceOf(a)) + ")" : money(balanceOf(a))}</span>
    </div>
  );

  return (
    <div>
      <div className="section-title">{t("งบการเงิน", "Financial Statements")}</div>
      <div className="section-sub">{t("คำนวณอัตโนมัติจากบัญชีแยกประเภท", "Calculated automatically from the ledger")}</div>

      <div className="statwrap">
        {/* Income statement */}
        <div className="card">
          <div className="stmt-title">{t("งบกำไรขาดทุน", "Income Statement")}</div>
          <div className="stmt-sub">{t("รายได้ − ค่าใช้จ่าย", "Revenue − Expenses")}</div>

          <div className="stmt-sec">{t("รายได้", "Revenue")}</div>
          {revenues.length ? revenues.map((a) => <Line key={a.id} a={a} />) : <div className="stmt-row faint"><span>{t("— ไม่มี —", "— none —")}</span><span></span></div>}
          <div className="stmt-row stmt-sub-row"><span>{t("รวมรายได้", "Total revenue")}</span><span className="stmt-amt">{money(sums.totalRevenue)}</span></div>

          <div className="stmt-sec">{t("ค่าใช้จ่าย", "Expenses")}</div>
          {expenses.length ? expenses.map((a) => <Line key={a.id} a={a} />) : <div className="stmt-row faint"><span>{t("— ไม่มี —", "— none —")}</span><span></span></div>}
          <div className="stmt-row stmt-sub-row"><span>{t("รวมค่าใช้จ่าย", "Total expenses")}</span><span className="stmt-amt">{money(sums.totalExpense)}</span></div>

          <div className="stmt-total" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{t("กำไร(ขาดทุน)สุทธิ", "Net income")}</span>
            <span className={"stmt-amt " + (sums.netIncome >= 0 ? "pos" : "neg")}>
              {sums.netIncome < 0 ? "(" + money(sums.netIncome) + ")" : money(sums.netIncome)}
            </span>
          </div>
        </div>

        {/* Balance sheet */}
        <div className="card">
          <div className="stmt-title">{t("งบแสดงฐานะการเงิน", "Balance Sheet")}</div>
          <div className="stmt-sub">{t("สินทรัพย์ = หนี้สิน + ส่วนของเจ้าของ", "Assets = Liabilities + Equity")}</div>

          <div className="stmt-sec">{t("สินทรัพย์", "Assets")}</div>
          {assets.length ? assets.map((a) => <Line key={a.id} a={a} />) : <div className="stmt-row faint"><span>{t("— ไม่มี —", "— none —")}</span><span></span></div>}
          <div className="stmt-row stmt-sub-row"><span>{t("รวมสินทรัพย์", "Total assets")}</span><span className="stmt-amt">{money(sums.totalAssets)}</span></div>

          <div className="stmt-sec">{t("หนี้สิน", "Liabilities")}</div>
          {liabilities.length ? liabilities.map((a) => <Line key={a.id} a={a} />) : <div className="stmt-row faint"><span>{t("— ไม่มี —", "— none —")}</span><span></span></div>}
          <div className="stmt-row stmt-sub-row"><span>{t("รวมหนี้สิน", "Total liabilities")}</span><span className="stmt-amt">{money(sums.totalLiab)}</span></div>

          <div className="stmt-sec">{t("ส่วนของเจ้าของ", "Equity")}</div>
          {equityAccts.map((a) => <Line key={a.id} a={a} />)}
          <div className="stmt-row"><span>{t("กำไร(ขาดทุน)สะสม", "Retained earnings / net income")}</span>
            <span className="stmt-amt">{sums.netIncome < 0 ? "(" + money(sums.netIncome) + ")" : money(sums.netIncome)}</span></div>
          <div className="stmt-row stmt-sub-row"><span>{t("รวมส่วนของเจ้าของ", "Total equity")}</span><span className="stmt-amt">{money(sums.totalEquity)}</span></div>

          <div className="stmt-total" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{t("หนี้สิน + ส่วนของเจ้าของ", "Liabilities + Equity")}</span>
            <span className="stmt-amt">{money(sums.totalLiab + sums.totalEquity)}</span>
          </div>
          <div className={"banner " + (bsBalanced ? "banner-ok" : "banner-warn")} style={{ margin: "12px 16px 16px" }}>
            <span className="dot" />
            {bsBalanced ? t("งบดุลสมดุล ✓", "Balance sheet balances ✓") : t("ไม่สมดุล", "Does not balance")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Inventory ============================== */
function parseSerials(text) {
  return Array.from(new Set(String(text || "").split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)));
}
// generate a run of serials: prefix + (start, start+1, ...) zero-padded to `pad` digits
function genSerials(prefix, start, count, pad) {
  const s = parseInt(start, 10); const n = parseInt(count, 10); const p = parseInt(pad, 10) || 0;
  if (!Number.isFinite(s) || !Number.isFinite(n) || n <= 0) return [];
  const out = [];
  for (let i = 0; i < n && i < 2000; i++) {
    const numStr = p > 0 ? String(s + i).padStart(p, "0") : String(s + i);
    out.push((prefix || "") + numStr);
  }
  return out;
}

function Inventory({ t, lang, accName, products, sales = [], categories = [], onAddCategory, onDeleteCategory, onAdd, onUpdate, onDelete, addMovement, money, showCost = true, hsTable = [], onSaveHsTable }) {
  const dutyForHs = (hs) => { if (!hs) return null; const r = (hsTable || []).find((x) => norm(x.hs) === norm(hs)); return r ? (Number(r.rate) || 0) : null; };
  const [showHs, setShowHs] = useState(false);
  const [hsDraft, setHsDraft] = useState({ hs: "", rate: "" });
  const pname = (p) => (lang === "th" ? p.th : lang === "en" ? p.en : `${p.th} / ${p.en}`);
  const UNCAT = t("ไม่ระบุหมวด", "Uncategorized");
  const [activeCat, setActiveCat] = useState(null); // null = show groups; else a category name
  const [q, setQ] = useState(""); // search within a group
  const [showForm, setShowForm] = useState(false);
  const [serialQ, setSerialQ] = useState(""); // find a serial inside the Manage panel
  const [attachText, setAttachText] = useState(""); // attach serials to existing (legacy) stock
  // serial -> last sale info (date, billNo) from the sales history
  const serialSaleInfo = {};
  (sales || []).forEach((sl) => (Array.isArray(sl.items) ? sl.items : []).forEach((it) => { if (it.serial) serialSaleInfo[it.serial] = { date: sl.date, billNo: sl.billNo, productId: it.productId }; }));
  const [form, setForm] = useState({ barcode: "", sku: "", th: "", en: "", category: "", cost: "", price: "", tracksSerial: false, qty: "", serialsText: "", warrantyMonths: "", hsCode: "", dutyRate: "", shipRatio: "" });
  const [expanded, setExpanded] = useState(null);
  const [serialInput, setSerialInput] = useState("");
  const [recvQty, setRecvQty] = useState("");
  const [recvCost, setRecvCost] = useState("");
  const [serialPending, setSerialPending] = useState([]); // serials queued before "receive all"
  const [gen, setGen] = useState({ prefix: "", start: "", count: "", pad: "" });
  const [recvSerial, setRecvSerial] = useState(false); // receive-with-serial toggle for the open product
  const [editForm, setEditForm] = useState(null); // edit name/price/codes for the expanded product
  const [editMsg, setEditMsg] = useState(null); // product id briefly flagged as saved
  useEffect(() => {
    setSerialPending([]); setSerialInput(""); setRecvQty(""); setRecvCost(""); setGen({ prefix: "", start: "", count: "", pad: "" });
    const ep = products.find((x) => x.id === expanded);
    setRecvSerial(!!(ep && ep.tracksSerial));
    setEditForm(ep ? { th: ep.th || "", en: ep.en || "", price: ep.price != null ? String(ep.price) : "", codes: (ep.codes && ep.codes.length) ? ep.codes.slice() : (ep.barcode ? [ep.barcode] : []), newCode: "", hsCode: ep.hsCode || "", dutyRate: ep.dutyRate != null ? String(ep.dutyRate) : "", shipRatio: ep.shipRatio != null ? String(ep.shipRatio) : "" } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);
  // barcode camera scanner (for the Add-product form)
  const [scanOn, setScanOn] = useState(false);
  const [scanErr, setScanErr] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const detRef = useRef(null);

  const reset = () => setForm({ barcode: "", sku: "", th: "", en: "", category: "", cost: "", price: "", tracksSerial: false, qty: "", serialsText: "", warrantyMonths: "", hsCode: "", dutyRate: "", shipRatio: "" });

  const stopScan = () => {
    if (loopRef.current) { clearTimeout(loopRef.current); loopRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((tr) => tr.stop()); streamRef.current = null; }
    setScanOn(false);
  };
  const scanLoop = () => {
    const tick = async () => {
      if (!streamRef.current || !videoRef.current || !detRef.current) return;
      try {
        const codes = await detRef.current.detect(videoRef.current);
        if (codes && codes.length) {
          const val = String(codes[0].rawValue || "").trim();
          if (val) { setForm((f) => ({ ...f, barcode: val })); stopScan(); return; }
        }
      } catch (e) { /* ignore frame errors */ }
      loopRef.current = setTimeout(tick, 350);
    };
    tick();
  };
  const startScan = async () => {
    setScanErr("");
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setScanErr(t("กล้องใช้ได้เฉพาะเมื่อเปิดผ่าน https หรือ localhost (ดู README) — หรือพิมพ์บาร์โค้ดเองได้", "Camera needs https or localhost (see README) — or type the barcode."));
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanErr(t("เข้าถึงกล้องไม่ได้บนหน้านี้ — พิมพ์บาร์โค้ดแทนได้", "Camera not accessible here — type the barcode instead."));
      return;
    }
    // 1) open the camera FIRST — if this fails we never touch the scanner engine
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } }); }
    catch (e1) {
      try { stream = await navigator.mediaDevices.getUserMedia({ video: true }); }
      catch (e2) { setScanErr(t("เปิดกล้องไม่ได้ — ในแอป Claude กล้องถูกปิด ลองเปิดผ่านเบราว์เซอร์ (localhost) หรือพิมพ์บาร์โค้ดแทน", "Couldn't open the camera — it's blocked in the Claude app. Open via a browser (localhost) or type the barcode.")); return; }
    }
    // 2) now load the barcode engine (wasm) on demand
    const ready = await ensureBarcodeDetector();
    if (!ready) {
      stream.getTracks().forEach((tr) => tr.stop());
      setScanErr(t("เบราว์เซอร์นี้สแกนด้วยกล้องไม่ได้ — พิมพ์บาร์โค้ด หรือใช้เครื่องสแกน USB แทน", "This browser can't camera-scan — type the barcode or use a USB scanner."));
      return;
    }
    try {
      detRef.current = new window.BarcodeDetector({ formats: ["qr_code", "data_matrix", "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "codabar"] });
    } catch (e) {
      stream.getTracks().forEach((tr) => tr.stop());
      setScanErr(t("เริ่มตัวสแกนไม่ได้ — พิมพ์บาร์โค้ดแทน", "Couldn't start the scanner — type the barcode."));
      return;
    }
    streamRef.current = stream;
    setScanOn(true);
  };
  useEffect(() => {
    if (scanOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const pl = videoRef.current.play();
      if (pl && pl.catch) pl.catch(() => {});
      scanLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanOn]);
  useEffect(() => () => stopScan(), []);

  const submit = () => {
    if (!form.th.trim()) { alert(t("กรุณากรอกชื่อสินค้า", "Please enter a product name")); return; }
    if (form.barcode.trim() && products.some((p) => norm(p.barcode) === norm(form.barcode))) {
      alert(t("บาร์โค้ดนี้มีอยู่แล้ว", "That barcode already exists")); return;
    }
    const id = uid();
    const c = num(form.cost);
    const base = { id, barcode: form.barcode.trim(), sku: form.sku.trim(), th: form.th.trim(), en: form.en.trim() || form.th.trim(), category: (form.category || "").trim(), cost: c, price: num(form.price), tracksSerial: form.tracksSerial, warrantyMonths: num(form.warrantyMonths) || 0, hsCode: (form.hsCode || "").trim(), dutyRate: num(form.dutyRate) || 0, shipRatio: num(form.shipRatio) || 1 };
    if (form.tracksSerial) {
      const serials = parseSerials(form.serialsText).map((s) => ({ serial: s, status: "in", addedAt: todayISO(), cost: c }));
      onAdd({ ...base, qty: 0, layers: [], serials });
      if (serials.length) addMovement({ type: "in", productId: id, qty: serials.length, note: "ตั้งต้น / Opening" });
    } else {
      const q = num(form.qty);
      onAdd({ ...base, qty: q, layers: q > 0 ? [{ qty: q, unitCost: c }] : [], serials: [] });
      if (q) addMovement({ type: "in", productId: id, qty: q, note: "ตั้งต้น / Opening" });
    }
    reset(); setShowForm(false); stopScan();
  };

  const receive = (p) => {
    const q = num(recvQty);
    if (q <= 0) return;
    const c = recvCost !== "" ? num(recvCost) : (Number(p.cost) || 0);
    onUpdate(p.id, (x) => {
      const layers = (Array.isArray(x.layers) && x.layers.length)
        ? x.layers.map((l) => ({ qty: Number(l.qty) || 0, unitCost: Number(l.unitCost) || 0 }))
        : ((Number(x.qty) || 0) > 0 ? [{ qty: Number(x.qty) || 0, unitCost: Number(x.cost) || 0 }] : []);
      layers.push({ qty: q, unitCost: c });
      return { layers, qty: layers.reduce((s, l) => s + l.qty, 0), cost: c };
    });
    addMovement({ type: "in", productId: p.id, qty: q, note: "รับเข้า / Receive @ " + c });
    setRecvQty(""); setRecvCost("");
  };

  const existsSerial = (p, s) => (p.serials || []).some((x) => norm(x.serial) === norm(s));
  const addToPending = (p, arr) => {
    setSerialPending((prev) => {
      const seen = new Set(prev.map((x) => norm(x)));
      const add = [];
      arr.forEach((s) => { const v = String(s).trim(); if (!v || seen.has(norm(v)) || existsSerial(p, v)) return; seen.add(norm(v)); add.push(v); });
      return [...prev, ...add];
    });
  };
  const addOnePending = (p) => { const v = serialInput.trim(); if (!v) return; addToPending(p, parseSerials(v)); setSerialInput(""); };
  const genAddPending = (p) => { const arr = genSerials(gen.prefix, gen.start, gen.count, gen.pad); if (!arr.length) { alert(t("กรอกเลขเริ่มต้นและจำนวนก่อน", "Enter a start number and a count first")); return; } addToPending(p, arr); };
  const rmPending = (s) => setSerialPending((prev) => prev.filter((x) => x !== s));
  const commitPending = (p) => {
    if (!serialPending.length) { alert(t("ยังไม่มี serial ที่จะรับเข้า", "No serials queued yet")); return; }
    const c = recvCost !== "" ? num(recvCost) : (Number(p.cost) || 0);
    const hasQtyStock = !p.tracksSerial && ((Number(p.qty) || 0) > 0 || (p.layers || []).some((l) => (Number(l.qty) || 0) > 0));
    if (hasQtyStock) {
      // qty-tracked product with stock on hand: DON'T flip to serial mode (would hide existing qty/layers) —
      // receive as an ordinary FIFO layer; the serial numbers are kept on the movement note
      const n = serialPending.length;
      onUpdate(p.id, (x) => {
        const layers = (Array.isArray(x.layers) && x.layers.length)
          ? x.layers.map((l) => ({ ...l, qty: Number(l.qty) || 0, unitCost: Number(l.unitCost) || 0 }))
          : ((Number(x.qty) || 0) > 0 ? [{ qty: Number(x.qty) || 0, unitCost: Number(x.cost) || 0 }] : []);
        layers.push({ qty: n, unitCost: c });
        return { layers, qty: layers.reduce((s, l) => s + l.qty, 0), cost: c };
      });
      addMovement({ type: "in", productId: p.id, qty: n, note: "รับเข้า / Receive @ " + c + " · SN: " + serialPending.join(", ") });
      window.alert(t("สินค้านี้นับสต๊อกแบบจำนวนและมีของอยู่แล้ว — รับเข้าเป็นจำนวนแทน (serial ถูกจดไว้ในประวัติ)", "This product is qty-tracked with stock on hand — received as quantity instead (serials noted in history)."));
    } else {
      onUpdate(p.id, (x) => ({ tracksSerial: true, serials: [...(x.serials || []), ...serialPending.map((s) => ({ serial: s, status: "in", addedAt: todayISO(), cost: c }))] }));
      addMovement({ type: "in", productId: p.id, qty: serialPending.length, note: "รับเข้า / Receive @ " + c });
    }
    setSerialPending([]); setSerialInput(""); setRecvCost(""); setGen({ prefix: "", start: "", count: "", pad: "" });
  };

  const removeSerial = (p, serial) => onUpdate(p.id, (x) => ({ serials: (x.serials || []).filter((s) => s.serial !== serial) }));

  // edit product master: name / price / multiple codes
  const addEditCode = () => {
    const v = (editForm && editForm.newCode || "").trim();
    if (!v) return;
    if ((editForm.codes || []).some((c) => norm(c) === norm(v))) { setEditForm({ ...editForm, newCode: "" }); return; }
    setEditForm({ ...editForm, codes: [...(editForm.codes || []), v], newCode: "" });
  };
  const rmEditCode = (i) => setEditForm({ ...editForm, codes: (editForm.codes || []).filter((_, j) => j !== i) });
  const saveEdit = (p) => {
    if (!editForm) return;
    const seen = new Set(); const codes = [];
    (editForm.codes || []).forEach((c) => { const v = String(c).trim(); const k = v.toLowerCase(); if (v && !seen.has(k)) { seen.add(k); codes.push(v); } });
    for (const c of codes) {
      if (products.some((x) => x.id !== p.id && prodCodes(x).some((cc) => norm(cc) === norm(c)))) {
        alert(t("โค้ด \"" + c + "\" ซ้ำกับสินค้าอื่น — เปลี่ยนก่อนบันทึก", "Code \"" + c + "\" is already used by another product")); return;
      }
    }
    const th = (editForm.th || "").trim();
    const en = (editForm.en || "").trim();
    onUpdate(p.id, () => ({ th: th || p.th, en: en || th || p.en, price: num(editForm.price), codes, barcode: codes[0] || "", hsCode: (editForm.hsCode || "").trim(), dutyRate: num(editForm.dutyRate) || 0, shipRatio: num(editForm.shipRatio) || 1 }));
    setEditMsg(p.id); setTimeout(() => setEditMsg((m) => (m === p.id ? null : m)), 1800);
  };

  // Attach serials to stock that already exists (legacy ProMaxx data never stored in-stock serials).
  // Quantity stays the same; per-unit costs follow FIFO layers oldest-first; the product switches to serial tracking.
  const attachSerials = (p, list) => {
    const need = productOnHand(p);
    if (!list.length || list.length !== need) return;
    const units = [];
    prodLayers(p).forEach((l) => { for (let i = 0; i < (Number(l.qty) || 0); i++) units.push(Number(l.unitCost) || Number(p.cost) || 0); });
    while (units.length < need) units.push(Number(p.cost) || 0);
    onUpdate(p.id, (x) => ({
      tracksSerial: true,
      serials: [...(x.serials || []).filter((sr) => sr.status !== "in"), ...list.map((sn, i) => ({ serial: sn, status: "in", addedAt: todayISO(), cost: units[i] }))],
      layers: [],
      qty: list.length,
    }));
    setAttachText("");
  };

  const totalValue = products.reduce((s, p) => s + productValue(p), 0);

  // ----- grouping (big group = category) -----
  const catOf = (p) => (p.category || "").trim() || UNCAT;
  const groupsMap = {};
  products.forEach((p) => { const c = catOf(p); (groupsMap[c] = groupsMap[c] || []).push(p); });
  (categories || []).forEach((c) => { const n = (c || "").trim(); if (n && !groupsMap[n]) groupsMap[n] = []; });
  const groups = Object.keys(groupsMap).sort((a, b) => a.localeCompare(b, "th")).map((name) => {
    const items = groupsMap[name];
    return { name, count: items.length, onhand: items.reduce((s, p) => s + productOnHand(p), 0), value: items.reduce((s, p) => s + productValue(p), 0) };
  });
  const inGroup = activeCat ? (groupsMap[activeCat] || []) : [];
  const needle = norm(q);
  const shownProducts = inGroup.filter((p) => tokMatch([p.th, p.en, p.sku, p.barcode, ...(p.codes || [])].filter(Boolean).join(" "), needle));
  const addGroup = () => { const n = (window.prompt(t("ชื่อกลุ่มใหม่ (เช่น กล้อง, เลนส์, ไฟสตูดิโอ)", "New group name (e.g. Cameras, Lenses, Lighting)")) || "").trim(); if (!n) return; if (onAddCategory) onAddCategory(n); setActiveCat(n); };
  const deleteGroup = (name) => {
    const n = (groupsMap[name] || []).length;
    if (n > 0) { window.alert(t(`กลุ่มนี้มีสินค้า ${n} รายการ — ย้าย/ลบสินค้าออกก่อนจึงจะลบกลุ่มได้`, `This group has ${n} product(s) — move/delete them before removing the group`)); return; }
    if (!window.confirm(t(`ลบกลุ่ม "${name}"?`, `Delete group "${name}"?`))) return;
    if (onDeleteCategory) onDeleteCategory(name);
    setActiveCat(null);
  };
  const addProductHere = () => { reset(); setForm((ff) => ({ ...ff, category: activeCat && activeCat !== UNCAT ? activeCat : "" })); setShowForm(true); setExpanded(null); };

  return (
    <div>
      <div className="section-title">{t("สินค้าและสต๊อค", "Inventory")}</div>
      <div className="section-sub">{t("ทะเบียนสินค้า บาร์โค้ด ต้นทุน/ราคาขาย และจำนวนคงเหลือ — เปิดติดตาม Serial เฉพาะบางสินค้าได้ · ต้นทุนในระบบเป็น “ก่อน VAT” (ราคาขายที่ตั้งควรบวกกำไรจากยอดนี้ แล้วค่อยคิด VAT 7% เพิ่มให้ลูกค้า)", "Product master with barcode, cost/price and on-hand — enable serial tracking per item · costs are stored ex-VAT (add margin to this, then charge 7% VAT on top)")}</div>
      {showCost && onSaveHsTable && (
        <div className="card" style={{ padding: "8px 12px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setShowHs((v) => !v)}>
            <b style={{ fontSize: 13.5 }}>📋 {t("ตาราง HS Code / อัตราอากร", "HS code / duty-rate table")}</b>
            <span className="faint" style={{ fontSize: 12 }}>{(hsTable || []).length} {t("รายการ", "rows")} {showHs ? "▲" : "▼"}</span>
          </div>
          {showHs && (
            <div style={{ marginTop: 8 }}>
              <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>{t("ตั้งอัตราอากรตาม HS ไว้ล่วงหน้า — พอกรอก HS ให้สินค้า ระบบดึงอัตราให้อัตโนมัติ สินค้าที่ HS เดียวกันจึงได้อัตราเดียวกัน", "Preset duty rates by HS — entering an HS on a product auto-pulls the rate, so same-HS products share it")}</div>
              {(hsTable || []).map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <input className="input" style={{ flex: "1 1 120px" }} value={row.hs} onChange={(e) => onSaveHsTable((hsTable || []).map((r, j) => (j === i ? { ...r, hs: e.target.value } : r)))} placeholder="4805.91" />
                  <input className="input r" style={{ width: 74 }} inputMode="decimal" value={row.rate} onChange={(e) => onSaveHsTable((hsTable || []).map((r, j) => (j === i ? { ...r, rate: e.target.value } : r)))} placeholder="0" />
                  <span className="faint" style={{ fontSize: 12 }}>%</span>
                  <button className="icon-btn" title={t("ลบ", "remove")} onClick={() => onSaveHsTable((hsTable || []).filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                <input className="input" style={{ flex: "1 1 120px" }} value={hsDraft.hs} onChange={(e) => setHsDraft({ ...hsDraft, hs: e.target.value })} placeholder={t("HS code ใหม่", "new HS code")} />
                <input className="input r" style={{ width: 74 }} inputMode="decimal" value={hsDraft.rate} onChange={(e) => setHsDraft({ ...hsDraft, rate: e.target.value })} placeholder="0" />
                <span className="faint" style={{ fontSize: 12 }}>%</span>
                <button className="btn btn-sm btn-primary" onClick={() => { const hs = (hsDraft.hs || "").trim(); if (!hs) return; if ((hsTable || []).some((r) => norm(r.hs) === norm(hs))) { alert(t("HS นี้มีในตารางแล้ว", "That HS is already listed")); return; } onSaveHsTable([...(hsTable || []), { hs, rate: num(hsDraft.rate) || 0 }]); setHsDraft({ hs: "", rate: "" }); }}>+ {t("เพิ่ม", "Add")}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!activeCat ? (
        <>
          <div className="toolbar">
            <button className="btn btn-primary" onClick={addGroup}>+ {t("เพิ่มกลุ่ม", "Add group")}</button>
            <span className="muted" style={{ fontSize: 13 }}>{groups.length} {t("กลุ่ม", "groups")} · {products.length} {t("รายการ", "items")}{showCost && <> · {t("มูลค่าสต๊อค", "Stock value")} <b className="acc-num">฿{money(totalValue)}</b></>}</span>
          </div>
          {groups.length === 0 ? (
            <div className="empty">{t("ยังไม่มีสินค้า/กลุ่ม — กด “เพิ่มกลุ่ม” หรือไปแท็บ “นำเข้าข้อมูล”", "No products/groups yet — tap “Add group” or use the Import tab")}</div>
          ) : (
            <div className="home-grid">
              {groups.map((g) => (
                <button key={g.name} className="home-card" onClick={() => { setActiveCat(g.name); setQ(""); setExpanded(null); setShowForm(false); }}>
                  <span className="home-ic">📦</span>
                  <span className="home-tt">{g.name}</span>
                  <span className="home-sub">{g.count} {t("รายการ", "items")} · {t("คงเหลือ", "on-hand")} {g.onhand}{showCost ? " · ฿" + money(g.value) : ""}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <button className="btn btn-sm" onClick={() => { setActiveCat(null); setShowForm(false); setExpanded(null); setQ(""); }}>← {t("กลับกลุ่มทั้งหมด", "All groups")}</button>
          <div className="toolbar" style={{ marginTop: 10 }}>
            <span className="section-title" style={{ margin: 0, fontSize: 18 }}>📦 {activeCat}</span>
            <button className="btn btn-primary btn-sm" onClick={() => (showForm ? setShowForm(false) : addProductHere())}>{showForm ? t("ปิด", "Close") : "+ " + t("เพิ่มสินค้า", "Add product")}</button>
            {(groupsMap[activeCat] || []).length === 0 && <button className="btn btn-sm btn-danger" onClick={() => deleteGroup(activeCat)}>{t("ลบกลุ่มนี้", "Delete group")}</button>}
            <span className="muted" style={{ fontSize: 13 }}>{inGroup.length} {t("รายการ", "items")}{showCost && <> · ฿<b className="acc-num">{money(inGroup.reduce((s, p) => s + productValue(p), 0))}</b></>}</span>
          </div>
          {inGroup.length > 6 && <input className="input" style={{ marginBottom: 12, maxWidth: 320 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("ค้นหาในกลุ่มนี้", "Search in this group")} />}

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: 18 }}>
          <div className="row2">
            <div className="field">
              <label>{t("บาร์โค้ด", "Barcode")}</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="input" style={{ flex: 1, minWidth: 0 }} value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder={t("พิมพ์ หรือสแกน", "type or scan")} />
                {!scanOn
                  ? <button type="button" className="btn btn-sm" style={{ whiteSpace: "nowrap" }} onClick={startScan}>📷 {t("สแกน", "Scan")}</button>
                  : <button type="button" className="btn btn-sm btn-danger" onClick={stopScan}>■</button>}
              </div>
            </div>
            <div className="field"><label>SKU</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" /></div>
          </div>
          {scanErr && <div className="flash flash-info" style={{ marginBottom: 12 }}>{scanErr}</div>}
          {scanOn && (
            <div style={{ position: "relative", marginBottom: 12, borderRadius: 12, overflow: "hidden", border: "2px solid var(--green)", background: "#000", maxWidth: 360 }}>
              <video ref={videoRef} playsInline muted style={{ width: "100%", display: "block", maxHeight: 240, objectFit: "cover" }} />
              <div style={{ position: "absolute", left: "10%", right: "10%", top: "40%", height: "20%", border: "2px solid rgba(255,255,255,.85)", borderRadius: 8 }} />
            </div>
          )}
          <div className="row2">
            <div className="field"><label>{t("ชื่อสินค้า (ไทย)", "Name (Thai)")}</label><input className="input" value={form.th} onChange={(e) => setForm({ ...form, th: e.target.value })} placeholder="น้ำดื่ม 600ml" /></div>
            <div className="field"><label>{t("ชื่อสินค้า (อังกฤษ)", "Name (English)")}</label><input className="input" value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} placeholder="Water 600ml" /></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("ประเภทสินค้า (สำหรับรายงาน)", "Category (for reports)")}</label><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={t("เช่น กล้อง, เลนส์, อุปกรณ์เสริม", "e.g. Cameras, Lenses, Accessories")} /></div>
            <div className="field"></div>
          </div>
          <div className="row2">
            {showCost && <div className="field"><label>{t("ต้นทุน/หน่วย", "Cost / unit")}</label><input className="input r" inputMode="decimal" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0.00" /></div>}
            <div className="field"><label>{t("ราคาขาย/หน่วย", "Price / unit")}</label><input className="input r" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></div>
            <div className="field"><label>{t("ประกัน (เดือน)", "Warranty (mo.)")}</label><input className="input r" inputMode="numeric" value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: e.target.value })} placeholder="0" /></div>
          </div>
          {showCost && (
            <div className="row2">
              <div className="field"><label>{t("HS Code (พิกัดศุลกากร)", "HS code")}</label><input className="input" value={form.hsCode} onChange={(e) => { const hs = e.target.value; const r = dutyForHs(hs); setForm((ff) => ({ ...ff, hsCode: hs, ...(r != null ? { dutyRate: String(r) } : {}) })); }} placeholder={t("เช่น 4805.91", "e.g. 4805.91")} /></div>
              <div className="field"><label>{t("อัตราอากรขาเข้า %", "Import duty %")}</label><input className="input r" inputMode="decimal" value={form.dutyRate} onChange={(e) => setForm({ ...form, dutyRate: e.target.value })} placeholder="0" /></div>
              <div className="field"><label>{t("อัตราส่วนขนส่ง (น้ำหนัก/ขนาด, default 1)", "Freight ratio (size/weight, default 1)")}</label><input className="input r" inputMode="decimal" value={form.shipRatio} onChange={(e) => setForm({ ...form, shipRatio: e.target.value })} placeholder="1" /></div>
            </div>
          )}
          <label className="checkrow"><input type="checkbox" checked={form.tracksSerial} onChange={(e) => setForm({ ...form, tracksSerial: e.target.checked })} />{t("ติดตามทีละชิ้นด้วย Serial number (สำหรับสินค้าที่ต้องระบุหมายเลขเครื่อง)", "Track each unit by serial number")}</label>
          {form.tracksSerial ? (
            <div className="field"><label>{t("Serial เริ่มต้น (พิมพ์/สแกนทีละบรรทัด)", "Initial serials (one per line)")}</label><textarea className="input" rows={3} value={form.serialsText} onChange={(e) => setForm({ ...form, serialsText: e.target.value })} placeholder={"SN-0001\nSN-0002"} /></div>
          ) : (
            <div className="field" style={{ maxWidth: 220 }}><label>{t("จำนวนเริ่มต้น", "Opening quantity")}</label><input className="input r" inputMode="decimal" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="0" /></div>
          )}
          <button className="btn btn-primary btn-sm" onClick={submit}>{t("บันทึกสินค้า", "Save product")}</button>
        </div>
      )}

      {shownProducts.length === 0 ? (
        <div className="empty">{q ? t("ไม่พบสินค้าที่ค้นหา", "No matching products") : t("ยังไม่มีสินค้าในกลุ่มนี้ — กด “เพิ่มสินค้า”", "No products in this group yet — tap “Add product”")}</div>
      ) : (
        <div className="table-scroll">
          <table className="t">
            <thead>
              <tr>
                <th style={{ width: 46 }}>{t("บาร์โค้ด", "Barcode")}</th>
                <th>{t("สินค้า", "Product")}</th>
                <th className="r" style={{ width: 78 }}>{t("คงเหลือ", "On-hand")}</th>
                {showCost && <th className="r" style={{ width: 88 }}>{t("ต้นทุน (ก่อน VAT)", "Cost (ex-VAT)")}</th>}
                <th className="r" style={{ width: 88 }}>{t("ราคาขาย", "Price")}</th>
                {showCost && <th className="r" style={{ width: 96 }}>{t("มูลค่า", "Value")}</th>}
                <th style={{ width: 118 }}></th>
              </tr>
            </thead>
            <tbody>
              {shownProducts.map((p) => {
                const oh = productOnHand(p);
                return (
                  <React.Fragment key={p.id}>
                    <tr>
                      <td className="code bc-cell" title={p.barcode || ""}>{p.barcode || <span className="faint">—</span>}</td>
                      <td>{pname(p)} <span className={"badge " + (p.tracksSerial ? "tag-serial" : "tag-normal")} style={{ marginLeft: 4 }}>{p.tracksSerial ? "Serial" : t("ทั่วไป", "Std")}</span></td>
                      <td className={"r acc-num " + (oh <= 0 ? "lowstock" : "")}>{oh}</td>
                      {showCost && <td className="r acc-num">{money(avgCost(p))}</td>}
                      <td className="r acc-num">{money(p.price)}</td>
                      {showCost && <td className="r acc-num">{money(productValue(p))}</td>}
                      <td className="c" style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-sm" onClick={() => { setExpanded(expanded === p.id ? null : p.id); setSerialInput(""); setRecvQty(""); setSerialQ(""); setAttachText(""); }}>{t("จัดการ", "Manage")}</button>
                        <button className="icon-btn" title={t("ลบ", "Delete")} onClick={() => { if (window.confirm(t(`ลบสินค้า "${p.th}"?`, `Delete "${p.en}"?`))) onDelete(p.id); }}>×</button>
                      </td>
                    </tr>
                    {expanded === p.id && (
                      <tr>
                        <td colSpan={showCost ? 7 : 5} style={{ background: "#FAF6EC" }}>
                          {editForm && (
                            <div style={{ marginBottom: 12, padding: "10px 12px", border: "1px solid #e6ddc4", borderRadius: 8, background: "#fffdf5" }}>
                              <div className="line-head" style={{ marginBottom: 8 }}>{t("แก้ไขข้อมูลสินค้า", "Edit product")}</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                <div className="field" style={{ margin: 0, flex: "1 1 180px" }}><label>{t("ชื่อสินค้า (ไทย)", "Name (TH)")}</label><input className="input" value={editForm.th} onChange={(e) => setEditForm({ ...editForm, th: e.target.value })} /></div>
                                <div className="field" style={{ margin: 0, flex: "1 1 180px" }}><label>{t("ชื่อสินค้า (อังกฤษ)", "Name (EN)")}</label><input className="input" value={editForm.en} onChange={(e) => setEditForm({ ...editForm, en: e.target.value })} /></div>
                                <div className="field" style={{ margin: 0, width: 130 }}><label>{t("ราคาขาย", "Price")}</label><input className="input r" inputMode="decimal" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="0.00" /></div>
                                {showCost && <div className="field" style={{ margin: 0, width: 130 }}><label>{t("HS Code", "HS code")}</label><input className="input" value={editForm.hsCode} onChange={(e) => { const hs = e.target.value; const r = dutyForHs(hs); setEditForm((ef) => ({ ...ef, hsCode: hs, ...(r != null ? { dutyRate: String(r) } : {}) })); }} placeholder="4805.91" /></div>}
                                {showCost && <div className="field" style={{ margin: 0, width: 110 }}><label>{t("อากร %", "Duty %")}</label><input className="input r" inputMode="decimal" value={editForm.dutyRate} onChange={(e) => setEditForm({ ...editForm, dutyRate: e.target.value })} placeholder="0" /></div>}
                                {showCost && <div className="field" style={{ margin: 0, width: 120 }}><label>{t("อัตราส่วนขนส่ง", "Freight ratio")}</label><input className="input r" inputMode="decimal" value={editForm.shipRatio} onChange={(e) => setEditForm({ ...editForm, shipRatio: e.target.value })} placeholder="1" /></div>}
                              </div>
                              <div style={{ marginTop: 10 }}>
                                <label className="line-head">{t("บาร์โค้ด / โค้ด QR / โค้ดอื่น (ใส่ได้หลายตัว)", "Barcodes / QR / other codes (multiple)")}</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "6px 0" }}>
                                  {(editForm.codes || []).map((c, i) => (
                                    <span key={i} className="serial-chip s-in" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{c}
                                      <button className="icon-btn" style={{ width: 18, height: 18, lineHeight: "15px", padding: 0 }} title={t("ลบโค้ด", "remove")} onClick={() => rmEditCode(i)}>×</button>
                                    </span>
                                  ))}
                                  {(!editForm.codes || editForm.codes.length === 0) && <span className="faint" style={{ fontSize: 12 }}>{t("ยังไม่มีโค้ด", "no codes yet")}</span>}
                                </div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                  <input className="input" style={{ flex: "1 1 160px" }} value={editForm.newCode} onChange={(e) => setEditForm({ ...editForm, newCode: e.target.value })}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEditCode(); } }}
                                    placeholder={t("พิมพ์/สแกนโค้ดแล้วกด Enter", "type/scan a code then Enter")} />
                                  <button className="btn btn-sm" onClick={addEditCode}>+ {t("เพิ่มโค้ด", "Add code")}</button>
                                </div>
                                <div className="faint" style={{ fontSize: 11, marginTop: 6 }}>{t("โค้ดตัวแรกจะเป็นบาร์โค้ดหลัก สแกนโค้ดไหนก็เจอสินค้านี้", "The first code is the primary barcode; scanning any code finds this item")}</div>
                              </div>
                              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                                <button className="btn btn-sm btn-primary" onClick={() => saveEdit(p)}>{t("บันทึกข้อมูลสินค้า", "Save product")}</button>
                                {editMsg === p.id && <span style={{ color: "#2f6b35", fontWeight: 600, fontSize: 12.5 }}>✓ {t("บันทึกแล้ว", "Saved")}</span>}
                              </div>
                            </div>
                          )}
                          <label className="checkrow" style={{ marginBottom: 10 }}><input type="checkbox" checked={recvSerial} onChange={(e) => setRecvSerial(e.target.checked)} />{t("รับเข้าแบบระบุ Serial รายชิ้น (ติ๊กเพื่อเปิดช่องกรอก serial)", "Receive with individual serials (tick to open serial entry)")}</label>
                          {recvSerial ? (
                            <div>
                              <div className="line-head" style={{ marginBottom: 8 }}>{t("รับเข้า Serial", "Receive serials")} · {t("คงเหลือ", "in stock")} {oh}</div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                                <input className="input" style={{ flex: 1, minWidth: 160 }} value={serialInput}
                                  onChange={(e) => setSerialInput(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOnePending(p); } }}
                                  placeholder={t("ยิง/พิมพ์ serial ทีละชิ้นแล้วกด Enter (วางหลายตัวก็ได้)", "scan/type one serial then Enter (or paste many)")} />
                                <button className="btn btn-sm" onClick={() => addOnePending(p)}>+ {t("เข้าคิว", "Queue")}</button>
                              </div>
                              <div className="card" style={{ padding: "8px 10px", marginBottom: 8, background: "transparent" }}>
                                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{t("หรือสร้างเลขเรียงอัตโนมัติ", "Or auto-generate a running sequence")}</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                                  <div className="field" style={{ margin: 0 }}><label>{t("นำหน้า", "Prefix")}</label><input className="input" style={{ width: 100 }} value={gen.prefix} onChange={(e) => setGen({ ...gen, prefix: e.target.value })} placeholder="TC-" /></div>
                                  <div className="field" style={{ margin: 0 }}><label>{t("เริ่มที่", "Start")}</label><input className="qty-input" inputMode="numeric" value={gen.start} onChange={(e) => setGen({ ...gen, start: e.target.value })} placeholder="1" /></div>
                                  <div className="field" style={{ margin: 0 }}><label>{t("จำนวน", "Count")}</label><input className="qty-input" inputMode="numeric" value={gen.count} onChange={(e) => setGen({ ...gen, count: e.target.value })} placeholder="10" /></div>
                                  <div className="field" style={{ margin: 0 }}><label>{t("เติม 0", "Pad")}</label><input className="qty-input" inputMode="numeric" value={gen.pad} onChange={(e) => setGen({ ...gen, pad: e.target.value })} placeholder="4" /></div>
                                  <button className="btn btn-sm" onClick={() => genAddPending(p)}>↳ {t("สร้างเข้าคิว", "Generate")}</button>
                                </div>
                                {gen.start !== "" && gen.count !== "" && <div className="faint" style={{ fontSize: 11, marginTop: 6 }}>{t("ตัวอย่าง", "preview")}: {genSerials(gen.prefix, gen.start, Math.min(3, parseInt(gen.count, 10) || 0), gen.pad).join(", ")}{(parseInt(gen.count, 10) || 0) > 3 ? " …" : ""}</div>}
                              </div>
                              {serialPending.length > 0 && (
                                <div style={{ marginBottom: 10 }}>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                                    <b>{t("รอรับเข้า", "Queued")}: {serialPending.length}</b>
                                    {showCost && <input className="qty-input" style={{ width: 110 }} inputMode="decimal" value={recvCost} onChange={(e) => setRecvCost(e.target.value)} placeholder={t("ต้นทุน/ชิ้น", "cost/unit")} />}
                                    <button className="btn btn-sm btn-primary" onClick={() => commitPending(p)}>✓ {t("รับเข้าทั้งหมด", "Receive all")} ({serialPending.length})</button>
                                    <button className="btn btn-sm" onClick={() => setSerialPending([])}>{t("ล้างคิว", "Clear")}</button>
                                  </div>
                                  <div className="serial-wrap">
                                    {serialPending.map((s) => (
                                      <span className="serial-chip" key={s}><span className="s-in">{s}</span><button className="icon-btn" style={{ padding: "0 4px", fontSize: 13 }} onClick={() => rmPending(s)}>×</button></span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 10 }}>
                                <div className="field" style={{ margin: 0 }}><label>{t("รับเข้า จำนวน", "Receive qty")}</label><input className="qty-input" inputMode="decimal" value={recvQty} onChange={(e) => setRecvQty(e.target.value)} placeholder="0" /></div>
                                {showCost && <div className="field" style={{ margin: 0 }}><label>{t("ต้นทุน/หน่วย (ล็อตนี้)", "Cost/unit (this lot)")}</label><input className="qty-input" style={{ width: 96 }} inputMode="decimal" value={recvCost} onChange={(e) => setRecvCost(e.target.value)} placeholder={String(Number(p.cost) || 0)} /></div>}
                                <button className="btn btn-sm btn-primary" onClick={() => receive(p)}>+ {t("รับเข้า", "Receive")}</button>
                              </div>
                              {showCost && <>
                              <div className="line-head" style={{ marginBottom: 4 }}>{t("ล็อตต้นทุน FIFO (เก่า → ใหม่)", "FIFO cost lots (old → new)")}</div>
                              <div className="serial-wrap">
                                {prodLayers(p).filter((l) => (Number(l.qty) || 0) > 0).length === 0
                                  ? <span className="faint" style={{ fontSize: 12 }}>{t("ไม่มีสต๊อก", "no stock")}</span>
                                  : prodLayers(p).filter((l) => (Number(l.qty) || 0) > 0).map((l, i) => (
                                      <span className="serial-chip" key={i}><b className="acc-num">{l.qty}</b>&nbsp;@&nbsp;<span className="acc-num">฿{money(l.unitCost)}</span></span>
                                    ))}
                              </div>
                              </>}
                              <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("ตัดสต๊อกทำที่แท็บ “ตัดสต๊อค” — ระบบตัดต้นทุนล็อตเก่าก่อน (FIFO)", "Stock-out is in the Sell/Scan tab — oldest lots are used first (FIFO)")}</div>
                              {!p.tracksSerial && productOnHand(p) > 0 && (
                                <div style={{ marginTop: 12, borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
                                  <div className="line-head" style={{ fontSize: 13, marginBottom: 4 }}>🏷 {t("ติด Serial ให้สต๊อกที่มีอยู่", "Attach serials to existing stock")} <span className="acc-num">({productOnHand(p)} {t("ชิ้น", "pcs")})</span></div>
                                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{t("ข้อมูลเก่าจาก ProMaxx ไม่มีบันทึก serial คงเหลือ — วาง/พิมพ์ serial ให้ครบเท่าจำนวนคงเหลือ (เว้นวรรค จุลภาค หรือขึ้นบรรทัดใหม่) ระบบจะเปิดติดตามรายชิ้นให้ จำนวนสต๊อกไม่เปลี่ยน ต้นทุนผูกตามล็อตเดิม", "Legacy ProMaxx data has no in-stock serials — paste one serial per unit on hand (space, comma or newline separated). The product switches to per-piece tracking; quantity and costs are preserved.")}</div>
                                  <textarea className="input" rows={3} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14 }} value={attachText} onChange={(e) => setAttachText(e.target.value)} placeholder="SN001 SN002 SN003 …" />
                                  {(() => {
                                    const list = parseSerials(attachText);
                                    const uniq = Array.from(new Set(list.map((x) => String(x).trim()).filter(Boolean)));
                                    const need = productOnHand(p);
                                    const dup = list.length !== uniq.length;
                                    const ok = uniq.length === need && need > 0;
                                    return (
                                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                                        <span className="acc-num" style={{ fontSize: 13, fontWeight: 600, color: ok ? "var(--green)" : "inherit" }}>{uniq.length}/{need}</span>
                                        {dup && <span style={{ color: "var(--red)", fontSize: 12 }}>{t("มี serial ซ้ำ — ตัดให้เหลือตัวเดียวแล้ว", "duplicates were removed")}</span>}
                                        <button className="btn btn-sm btn-primary" disabled={!ok} onClick={() => attachSerials(p, uniq)}>{t("บันทึกและเปิดติดตาม Serial", "Save & enable serial tracking")}</button>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                          {(() => {
                            const own = p.serials || [];
                            // sold = serials marked sold on the product + serials of this product found in past bills
                            const soldMap = {};
                            own.forEach((sr) => { if (sr.status !== "in") soldMap[sr.serial] = serialSaleInfo[sr.serial] || null; });
                            Object.keys(serialSaleInfo).forEach((sn) => {
                              const inf = serialSaleInfo[sn];
                              if (inf.productId === p.id && !own.some((x) => x.serial === sn && x.status === "in")) soldMap[sn] = inf;
                            });
                            const inStock = own.filter((sr) => sr.status === "in");
                            const soldList = Object.keys(soldMap).map((sn) => ({ serial: sn, info: soldMap[sn] }));
                            if (inStock.length === 0 && soldList.length === 0) return null;
                            const nq = norm(serialQ);
                            const mt = (sn) => tokMatch(sn, nq);
                            const inF = inStock.filter((sr) => mt(sr.serial));
                            const soldF = soldList.filter((x) => mt(x.serial)).sort((a, b) => (((b.info && b.info.date) || "")).localeCompare(((a.info && a.info.date) || "")));
                            return (
                              <div style={{ marginTop: 12, borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
                                <div className="line-head" style={{ marginBottom: 6, fontSize: 13 }}>{t("เช็คสต๊อก Serial", "Serial stock check")}</div>
                                {(inStock.length + soldList.length) > 6 && (
                                  <input className="input" style={{ maxWidth: 250, marginBottom: 8 }} value={serialQ} onChange={(e) => setSerialQ(e.target.value)} placeholder={t("พิมพ์/ยิง serial เพื่อค้นหา", "Type/scan a serial to find it")} />
                                )}
                                <div style={{ fontSize: 12.5, fontWeight: 600, margin: "2px 0 4px" }}>{t("คงเหลือในสต๊อก", "In stock")} <span className="acc-num">({inStock.length})</span></div>
                                <div className="serial-wrap">
                                  {inF.length === 0 && <span className="faint" style={{ fontSize: 12 }}>{nq ? t("ไม่พบในกลุ่มนี้", "no match here") : t("ไม่มีคงเหลือ", "none in stock")}</span>}
                                  {inF.map((sr) => (
                                    <span className="serial-chip" key={sr.serial}>
                                      <span className="s-in">{sr.serial}</span>
                                      <button className="icon-btn" style={{ padding: "0 4px", fontSize: 13 }} title={t("ลบออกจากสต๊อก", "remove from stock")} onClick={() => removeSerial(p, sr.serial)}>×</button>
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, margin: "10px 0 4px" }}>{t("ขายแล้ว — พร้อมวันที่ขาย", "Sold — with sale date")} <span className="acc-num">({soldList.length})</span></div>
                                <div className="serial-wrap">
                                  {soldF.length === 0 && <span className="faint" style={{ fontSize: 12 }}>{nq ? t("ไม่พบในกลุ่มนี้", "no match here") : t("ยังไม่มีที่ขายไป", "none sold yet")}</span>}
                                  {soldF.map(({ serial, info }) => (
                                    <span className="serial-chip" key={serial} title={info ? t("บิลเลขที่ ", "Bill ") + info.billNo : t("ไม่พบบิลในระบบ", "no bill on file")}>
                                      <span className="s-sold">{serial}</span>
                                      <span style={{ fontSize: 10.5, color: "var(--soft)", whiteSpace: "nowrap" }}>{info ? t("ขาย ", "sold ") + fmtDate(info.date) : t("ขายแล้ว", "sold")}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="note-box">
        {t("เคล็ดลับ: เปิด “ติดตาม Serial” เฉพาะสินค้าราคาสูงหรือที่ต้องระบุหมายเลขเครื่อง เช่น อุปกรณ์อิเล็กทรอนิกส์ ส่วนของกินของใช้ทั่วไปใช้แบบนับจำนวนปกติจะเร็วกว่า",
          "Tip: enable serial tracking only for high-value or serialised goods (e.g. electronics). Use plain quantity for fast-moving items.")}
      </div>
        </>
      )}
    </div>
  );
}

/* ============================== Sell / Scan ============================== */
function SellScan({ t, lang, products, customers, banks, profile, sales = [], acctLevel = 3, onAttachSerial, onCommit, onPark, onShowInvoice, onSaveCustomer, prefill, onPrefillDone, setTab, money, vatRate = VAT_RATE, posMode }) {
  const vatPct = +(vatRate * 100).toFixed(2);
  const pname = (p) => (lang === "th" ? p.th : lang === "en" ? p.en : `${p.th} / ${p.en}`);
  const [code, setCode] = useState("");
  const [cart, setCart] = useState([]);
  const [flash, setFlash] = useState(null);
  const [postJournal, setPostJournal] = useState(true);
  const [waitBill, setWaitBill] = useState(false); // park as "waiting to bill" instead of issuing a bill now
  const [manualOpen, setManualOpen] = useState(false);
  const [mProd, setMProd] = useState("");
  const [mSerial, setMSerial] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [camErr, setCamErr] = useState("");
  // checkout fields
  const [saleDate, setSaleDate] = useState(todayISO());
  const [discType, setDiscType] = useState("amount"); // 'amount' | 'percent'
  const [discVal, setDiscVal] = useState("");
  const [vatEnabled, setVatEnabled] = useState(!!(profile && profile.vatRegistered));
  const [channel, setChannel] = useState("cash");
  const [bankId, setBankId] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [custId, setCustId] = useState("");
  const [saveNewCust, setSaveNewCust] = useState(true);
  const [custForm, setCustForm] = useState({ name: "", taxId: "", branch: "สำนักงานใหญ่", address: "", phone: "" });
  const [billNoOv, setBillNoOv] = useState(""); // edit the bill number before issuing (blank = auto)
  const [editingId, setEditingId] = useState(null);   // id of the sale being edited (null = new sale)
  const [editCredit, setEditCredit] = useState({});   // {productId: qty} stock the edited bill already holds, available for re-sale
  const [snPick, setSnPick] = useState(null);   // product id whose serial picker is open
  const [snCustom, setSnCustom] = useState(""); // manual serial input in the picker
  const [snQ, setSnQ] = useState("");           // filter inside the picker
  const openSnPick = (p) => { setSnPick(p.id); setSnCustom(""); setSnQ(""); };
  // products whose sales history contains serials — they deserve the serial picker even before per-piece tracking is on
  const serialHistIds = (() => { const st = new Set(); (sales || []).forEach((sl) => (Array.isArray(sl.items) ? sl.items : []).forEach((it) => { if (it.serial && it.productId) st.add(it.productId); })); return st; })();
  const wantsSerial = (p) => p.tracksSerial || serialHistIds.has(p.id);
  const fillCustForm = (c) => setCustForm(c ? { name: c.name || "", taxId: c.taxId || "", branch: c.branch ?? "สำนักงานใหญ่", address: c.address || "", phone: c.phone || "" } : { name: "", taxId: "", branch: "สำนักงานใหญ่", address: "", phone: "" });
  const [showCust, setShowCust] = useState(false);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const detRef = useRef(null);
  const lastHitRef = useRef({ code: "", time: 0 });
  const cartRef = useRef(cart);
  const productsRef = useRef(products);
  useEffect(() => { cartRef.current = cart; }, [cart]);
  useEffect(() => { productsRef.current = products; }, [products]);

  // suggestion dropdowns (autocomplete)
  const [showProdSug, setShowProdSug] = useState(false);
  const [showCustSug, setShowCustSug] = useState(false);

  // load a bill being edited into the checkout (one-shot per token)
  const prefillRef = useRef(null);
  useEffect(() => {
    if (!prefill || !prefill._token || prefillRef.current === prefill._token) return;
    prefillRef.current = prefill._token;
    setCart((prefill.items || []).map((l) => ({
      key: uid(), productId: l.productId, serial: l.serial || null,
      qty: Number(l.qty) || 1, price: Number(l.price) || 0, cost: Number(l.cost) || 0,
      name: l.name, isSerial: !!l.serial,
      disc: l.disc != null ? l.disc : "", discKind: l.discKind || "amount",
    })));
    if (prefill.date) setSaleDate(prefill.date);
    setBillNoOv(prefill.billNo || "");
    setEditingId(prefill.editingId || null);
    setEditCredit(prefill.editCredit || {});
    setDiscType(prefill.discountType || "amount");
    setDiscVal(prefill.discountValue ? String(prefill.discountValue) : "");
    setVatEnabled(!!prefill.vatEnabled);
    setChannel(prefill.channel || "cash");
    setBankId(prefill.bankId || "");
    setPlatformFee(prefill.platformFee != null ? String(prefill.platformFee) : "");
    setChequeNo(prefill.chequeNo || "");
    setShowCust(true);
    if (prefill.customerId) { setCustId(prefill.customerId); fillCustForm(customers.find((x) => x.id === prefill.customerId)); }
    else if (prefill.customer) { setCustId(""); setCustForm({ name: prefill.customer.name || "", taxId: prefill.customer.taxId || "", branch: prefill.customer.branch ?? "สำนักงานใหญ่", address: prefill.customer.address || "", phone: prefill.customer.phone || "" }); }
    flashMsg("info", t("กำลังแก้ไขบิล — ปรับรายการแล้วกดออกบิลเพื่อบันทึกใหม่", "Editing bill — adjust items then issue to re-save"));
    if (onPrefillDone) onPrefillDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const focus = () => { if (inputRef.current && !camOn) inputRef.current.focus(); };
  useEffect(() => { focus(); }, []);

  const byId = (id) => products.find((p) => p.id === id);
  // count every qty-consuming line: plain qty lines AND serial-note lines (isSerial=false but serial noted) —
  // filtering on !l.serial let serial-note lines bypass the stock guard and oversell silently
  const cartQtyForProduct = (pid) => cartRef.current.filter((l) => l.productId === pid && !l.isSerial).reduce((s, l) => s + (Number(l.qty) || 0), 0);
  const flashMsg = (type, msg) => setFlash({ type, msg });

  const addSerialLine = (p, serial) => {
    if (cartRef.current.some((l) => l.serial && norm(l.serial) === norm(serial))) { flashMsg("err", t("สแกน serial นี้ไปแล้ว", "Serial already in cart")); return; }
    setCart((c) => [...c, { key: uid(), productId: p.id, serial, qty: 1, price: Number(p.price) || 0, cost: Number(p.cost) || 0, name: pname(p), isSerial: true, disc: "", discKind: "amount" }]);
    flashMsg("ok", "+ " + pname(p) + " · " + serial);
  };

  // sell one unit of a qty-tracked product while noting the unit's serial on the bill
  const addQtyLineSerialNote = (p, sn) => {
    if (cartRef.current.some((l) => l.serial && norm(l.serial) === norm(sn))) { flashMsg("err", t("serial นี้อยู่ในบิลแล้ว", "Serial already in cart")); return; }
    const oh = productOnHand(p);
    if (cartQtyForProduct(p.id) + 1 > oh) { flashMsg("err", t("สต๊อกไม่พอ (เหลือ " + oh + ")", "Not enough stock (only " + oh + ")")); return; }
    setCart((c) => [...c, { key: uid(), productId: p.id, serial: sn, qty: 1, price: Number(p.price) || 0, cost: Number(p.cost) || 0, name: pname(p), isSerial: false, disc: "", discKind: "amount" }]);
    flashMsg("ok", "+ " + pname(p) + " · " + sn);
  };

  const addQtyLine = (p) => {
    const oh = productOnHand(p);
    if (cartQtyForProduct(p.id) + 1 > oh) { flashMsg("err", t("สต๊อกไม่พอ (เหลือ " + oh + ")", "Not enough stock (only " + oh + ")")); return; }
    setCart((c) => {
      const ex = c.find((l) => l.productId === p.id && !l.serial);
      if (ex) return c.map((l) => (l.key === ex.key ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { key: uid(), productId: p.id, serial: null, qty: 1, price: Number(p.price) || 0, cost: Number(p.cost) || 0, name: pname(p), isSerial: false, disc: "", discKind: "amount" }];
    });
    flashMsg("ok", "+ " + pname(p));
  };

  const process = (raw) => {
    const v = String(raw || "").trim();
    if (!v) return;
    const list = productsRef.current;
    for (const p of list) {
      if (!p.tracksSerial) continue;
      const hit = (p.serials || []).find((s) => norm(s.serial) === norm(v));
      if (hit) {
        if (hit.status === "in") { addSerialLine(p, hit.serial); return; }
        flashMsg("err", t("serial นี้ขายไปแล้ว", "That serial is already sold")); return;
      }
    }
    const byCode = list.find((p) => !p.tracksSerial && prodCodes(p).some((c) => norm(c) === norm(v)));
    if (byCode) { if (serialHistIds.has(byCode.id)) { openSnPick(byCode); } else addQtyLine(byCode); return; }
    const serialProd = list.find((p) => p.tracksSerial && prodCodes(p).some((c) => norm(c) === norm(v)));
    if (serialProd) { openSnPick(serialProd); return; }
    flashMsg("err", t("ไม่พบสินค้า/serial: " + v, "No product/serial found: " + v));
  };

  const onKey = (e) => { if (e.key === "Enter") { e.preventDefault(); process(code); setCode(""); focus(); } };

  const scanLoop = () => {
    const tick = async () => {
      if (!streamRef.current || !videoRef.current || !detRef.current) return;
      try {
        const codes = await detRef.current.detect(videoRef.current);
        if (codes && codes.length) {
          const val = String(codes[0].rawValue || "").trim();
          const now = Date.now();
          if (val && !(val === lastHitRef.current.code && now - lastHitRef.current.time < 1500)) {
            lastHitRef.current = { code: val, time: now };
            process(val);
          }
        }
      } catch (e) { /* ignore per-frame errors */ }
      loopRef.current = setTimeout(tick, 350);
    };
    tick();
  };

  const stopCam = () => {
    if (loopRef.current) { clearTimeout(loopRef.current); loopRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((tr) => tr.stop()); streamRef.current = null; }
    setCamOn(false);
  };

  const startCam = async () => {
    setCamErr("");
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setCamErr(t("กล้องเปิดได้เฉพาะเมื่อหน้าเว็บรันผ่าน https หรือ localhost — ตอนนี้กำลังเปิดจากไฟล์โดยตรง (file://) ซึ่งเบราว์เซอร์บล็อกกล้อง ดูวิธีเปิดผ่าน localhost ในไฟล์ README หรือพิมพ์บาร์โค้ดทดสอบแทนได้",
        "The camera only works over https or localhost. You're opening the file directly (file://), which browsers block. See the README to run it via localhost, or type a barcode to test."));
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamErr(t("เข้าถึงกล้องไม่ได้ในหน้านี้ — ในแอป Claude กล้องถูกปิด ใช้เครื่องสแกนหรือพิมพ์บาร์โค้ดแทนได้", "Camera isn't accessible here — it's blocked in the Claude app. Use a hardware scanner or type the barcode."));
      return;
    }
    // 1) open the camera FIRST — if blocked (e.g. inside the Claude app) we stop here, before touching the wasm engine
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } }); }
    catch (e1) {
      try { stream = await navigator.mediaDevices.getUserMedia({ video: true }); }
      catch (e2) {
        const denied = e2 && (e2.name === "NotAllowedError" || e2.name === "SecurityError");
        setCamErr(denied
          ? t("ถูกปฏิเสธสิทธิ์กล้อง — ในแอป Claude กล้องถูกปิด ลองเปิดผ่านเบราว์เซอร์ (localhost/https) แล้วกดอนุญาต หรือพิมพ์บาร์โค้ดแทน", "Camera permission denied / blocked in the Claude app. Open via a browser (localhost/https) and allow access, or type the barcode.")
          : t("เปิดกล้องไม่ได้ — ตรวจว่ามีกล้องและไม่มีโปรแกรมอื่นใช้อยู่ แล้วลองใหม่", "Couldn't open the camera — check a camera exists and isn't used by another app, then retry."));
        return;
      }
    }
    // 2) load the scanner engine (wasm) on demand
    const ready = await ensureBarcodeDetector();
    if (!ready) {
      stream.getTracks().forEach((tr) => tr.stop());
      setCamErr(t("เบราว์เซอร์นี้สแกนด้วยกล้องไม่ได้ — ใช้เครื่องสแกน USB หรือพิมพ์บาร์โค้ดแทนได้", "This browser can't camera-scan — use a USB scanner or type the barcode."));
      return;
    }
    try {
      detRef.current = new window.BarcodeDetector({ formats: ["qr_code", "data_matrix", "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "codabar"] });
    } catch (e) {
      stream.getTracks().forEach((tr) => tr.stop());
      setCamErr(t("เริ่มตัวสแกนไม่ได้ — พิมพ์บาร์โค้ดแทน", "Couldn't start the scanner — type the barcode."));
      return;
    }
    streamRef.current = stream;
    setCamOn(true);
  };

  useEffect(() => {
    if (camOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const pl = videoRef.current.play();
      if (pl && pl.catch) pl.catch(() => {});
      scanLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camOn]);

  useEffect(() => () => stopCam(), []);

  const setLineQty = (key, q) => {
    setCart((c) => c.map((l) => {
      if (l.key !== key) return l;
      const p = byId(l.productId); const oh = p ? productOnHand(p) : 0;
      let qty = Math.max(1, Math.floor(num(q)) || 1);
      // cap includes the edited bill's own freed stock (editCredit); never clamp below 1 —
      // the aggregate guard in confirmSale still blocks a genuinely overselling cart
      const cap = oh + (editCredit[l.productId] || 0);
      if (qty > cap) qty = Math.max(1, cap);
      return { ...l, qty };
    }));
  };
  const removeLine = (key) => setCart((c) => c.filter((l) => l.key !== key));
  const setLineField = (key, patch) => setCart((c) => c.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const totals = computeSaleTotals({ items: cart, discountType: discType, discountValue: discVal, vatEnabled, vatRate });
  const total = totals.total;

  const confirmSale = () => {
    if (!cart.length) return;
    for (const p of products) {
      if (p.tracksSerial) continue;
      if (cartQtyForProduct(p.id) > productOnHand(p) + (editCredit[p.id] || 0)) { flashMsg("err", t("สต๊อก " + pname(p) + " ไม่พอ", "Not enough stock for " + pname(p))); return; }
    }
    if ((channel === "transfer" || channel === "cheque") && banks.length && !bankId) { flashMsg("err", t("เลือกบัญชีธนาคารก่อน", "Pick a bank account first")); return; }
    const lines = cart.map((l) => ({ productId: l.productId, serial: l.serial, qty: l.qty, price: l.price, cost: l.cost, name: l.name, disc: l.disc, discKind: l.discKind }));
    let customer = null;
    let useCustId = custId || null;
    if (!custId && (custForm.name.trim() || custForm.taxId.trim())) {
      const snap = { name: custForm.name.trim(), taxId: custForm.taxId.trim(), branch: custForm.branch ?? "สำนักงานใหญ่", address: custForm.address || "", phone: custForm.phone || "" };
      customer = snap;
      if (saveNewCust && snap.name) { useCustId = onSaveCustomer(snap); } // add new company to the contacts database
    } else if (custId) {
      const base = customers.find((c) => c.id === custId) || {};
      customer = { name: (custForm.name || "").trim() || base.name || "", taxId: (custForm.taxId || "").trim(), branch: custForm.branch ?? base.branch ?? "สำนักงานใหญ่", address: custForm.address || "", phone: custForm.phone || "" };
    }
    if (waitBill && !editingId) {
      onPark({
        lines, date: saleDate, discountType: discType, discountValue: num(discVal), vatEnabled,
        channel, bankId: (channel === "transfer" || channel === "cheque") ? bankId : null, chequeNo: channel === "cheque" ? chequeNo : "",
        platformFee: (channel === "shopee" || channel === "lazada") ? (num(platformFee) || 0) : 0,
        customer, customerId: useCustId, postJournal: acctLevel >= 3 ? postJournal : true, note: "",
      });
      setCart([]); setDiscVal(""); setChequeNo(""); setPlatformFee("");
      setCustForm({ name: "", taxId: "", branch: "สำนักงานใหญ่", address: "", phone: "" }); setCustId(""); setBillNoOv(""); setEditCredit({}); setWaitBill(false);
      flashMsg("ok", t("เก็บเป็นร่างรอออกบิลแล้ว (ตัดสต๊อกแล้ว) — ไปออกบิลรวมทีหลังได้ที่เมนู “รอออกบิล”", "Parked — stock deducted, issue the bill later from the “Pending bills” menu"));
      return;
    }
    const ovBill = billNoOv.trim();
    if (ovBill && sales.some((x) => x.billNo === ovBill && x.id !== editingId)) { flashMsg("err", t("เลขที่บิล " + ovBill + " มีอยู่แล้ว — ใช้เลขอื่นหรือปล่อยว่าง", "Bill no. " + ovBill + " already exists — pick another or leave blank")); return; }
    const sale = onCommit({
      lines, date: saleDate, discountType: discType, discountValue: num(discVal), vatEnabled,
      channel, bankId: (channel === "transfer" || channel === "cheque") ? bankId : null, chequeNo: channel === "cheque" ? chequeNo : "",
      platformFee: (channel === "shopee" || channel === "lazada") ? (num(platformFee) || 0) : 0,
      customer, customerId: useCustId, postJournal: acctLevel >= 3 ? postJournal : true, docType: vatEnabled ? "tax" : "receipt",
      billNo: ovBill || undefined, editingId,
    });
    setCart([]); setDiscVal(""); setChequeNo(""); setPlatformFee("");
    setCustForm({ name: "", taxId: "", branch: "สำนักงานใหญ่", address: "", phone: "" }); setCustId(""); setBillNoOv(""); setEditingId(null); setEditCredit({});
    flashMsg("ok", t("บันทึกการขายแล้ว เลขที่บิล " + (sale ? sale.billNo : ""), "Sale saved — bill " + (sale ? sale.billNo : "")));
    if (sale) onShowInvoice(sale);
    focus();
  };

  const selProd = byId(mProd);

  // ---- autocomplete matches ----
  const pq = code.trim().toLowerCase();
  const prodMatches = pq.length >= 2 ? products.filter((p) => {
    const hay = [p.th, p.en, p.sku, p.barcode, ...(p.codes || [])].filter(Boolean).join(" ");
    return tokMatch(hay, pq);
  }).slice(0, 10) : [];
  const pickProduct = (p) => {
    if (wantsSerial(p)) openSnPick(p); // let the seller choose (or type) the serial
    else addQtyLine(p);
    setCode(""); setShowProdSug(false); focus();
  };
  const cq = (custForm.name || "").trim().toLowerCase();
  const custMatches = (!custId && cq.length >= 1) ? customers.filter((c) => {
    const hay = [c.name, c.taxId, c.phone].filter(Boolean).join(" ");
    return tokMatch(hay, cq);
  }).slice(0, 8) : [];
  const pickCustomer = (c) => { setCustId(c.id); fillCustForm(c); setShowCustSug(false); };

  if (products.length === 0) {
    return (
      <div>
        <div className="section-title">{t("ตัดสต๊อค / ขาย", "Sell / Scan")}</div>
        <div className="empty" style={{ marginTop: 12 }}>
          {t("ยังไม่มีสินค้าให้ขาย — เพิ่มสินค้าที่แท็บสินค้า หรือนำเข้าข้อมูลก่อน", "No products to sell yet — add products in Inventory or import them first")}
          <div style={{ marginTop: 14 }}><button className="btn btn-primary" onClick={() => setTab("inventory")}>{t("ไปที่สินค้า", "Go to Inventory")}</button></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">{t("ตัดสต๊อค / ขายสินค้า", "Sell / Scan")}</div>
      <div className="section-sub">{t("สแกนบาร์โค้ดเพื่อตัดสต๊อก — เครื่องสแกนทำงานเหมือนคีย์บอร์ด ใช้ได้ทั้ง Mac/PC หรือพิมพ์รหัสแล้วกด Enter", "Scan a barcode to deduct stock — hardware scanners type like a keyboard on Mac/PC, or type a code and press Enter")}</div>
      {editingId && (
        <div className="card" style={{ marginTop: 8, padding: "10px 12px", background: "#FFF7E6", border: "1px solid #E8C97A" }}>
          ✏️ {t("กำลังแก้ไขบิลเลขที่ ", "Editing bill ")}<b className="acc-num">{billNoOv || "—"}</b> — {t("บิลเดิมยังอยู่ครบจนกว่าจะกด \u201cบันทึกการขาย\u201d ถ้าเปลี่ยนหน้าก่อนกดบันทึก บิลเดิมจะไม่หาย", "the original bill stays intact until you press \u201cSave\u201d — leaving this page before saving will NOT lose it")}
        </div>
      )}

      <div className="sug-wrap">
        <div className="scanbox">
          <input ref={inputRef} className="scan-input" value={code}
            onChange={(e) => { setCode(e.target.value); setShowProdSug(true); }}
            onFocus={() => setShowProdSug(true)} onKeyDown={onKey}
            placeholder={t("สแกน/พิมพ์ บาร์โค้ด ชื่อ หรือ serial …", "Scan / type barcode, name, or serial …")} autoFocus />
          <button className="btn btn-primary" onClick={() => { process(code); setCode(""); focus(); }}>{t("เพิ่ม", "Add")}</button>
        </div>
        {showProdSug && prodMatches.length > 0 && (
          <div className="sug-list">
            {prodMatches.map((p) => (
              <div key={p.id} className="sug-item" onMouseDown={(e) => { e.preventDefault(); pickProduct(p); }}>
                <span className="sug-name">{pname(p)}</span>
                <span className="sug-meta">{p.sku ? "#" + p.sku + " · " : ""}฿{money(p.price)} · {t("เหลือ", "stk")} {productOnHand(p)}{p.tracksSerial ? " · S/N" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="scan-hint">
        {t("สินค้าทั่วไป: สแกนบาร์โค้ด · สินค้าที่ติดตาม serial: สแกนหมายเลข serial ของชิ้นนั้น", "Standard items: scan the barcode · serial items: scan the unit's serial")}
        {" · "}
        <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setManualOpen((s) => !s)}>{t("เพิ่มด้วยมือ", "add manually")}</span>
      </div>

      <div className="toolbar" style={{ marginBottom: camOn || camErr ? 10 : 16 }}>
        {!camOn
          ? <button className="btn" onClick={startCam}>📷 {t("สแกนด้วยกล้อง", "Scan with camera")}</button>
          : <button className="btn btn-danger" onClick={stopCam}>■ {t("ปิดกล้อง", "Stop camera")}</button>}
        {camOn && <span className="muted" style={{ fontSize: 12 }}>{t("เล็งกล้องไปที่บาร์โค้ด ระบบจะเพิ่มลงตะกร้าให้อัตโนมัติ", "Point at a barcode — items are added to the cart automatically")}</span>}
      </div>
      {camErr && <div className="flash flash-info" style={{ marginBottom: 14 }}>{camErr}</div>}
      {camOn && (
        <div style={{ position: "relative", marginBottom: 14, borderRadius: 14, overflow: "hidden", border: "2px solid var(--green)", background: "#000", maxWidth: 460 }}>
          <video ref={videoRef} playsInline muted style={{ width: "100%", display: "block", maxHeight: 340, objectFit: "cover" }} />
          <div style={{ position: "absolute", left: "12%", right: "12%", top: "38%", height: "24%", border: "2px solid rgba(255,255,255,.85)", borderRadius: 10, boxShadow: "0 0 0 100vmax rgba(0,0,0,.25)" }} />
        </div>
      )}

      {manualOpen && (
        <div className="expand-panel" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select className="select" style={{ flex: 1, minWidth: 180 }} value={mProd} onChange={(e) => { setMProd(e.target.value); setMSerial(""); }}>
            <option value="">{t("— เลือกสินค้า —", "— select product —")}</option>
            {products.map((p) => <option key={p.id} value={p.id}>{(p.barcode ? p.barcode + " · " : "") + pname(p)}</option>)}
          </select>
          {selProd && selProd.tracksSerial && (
            <select className="select" style={{ flex: 1, minWidth: 140 }} value={mSerial} onChange={(e) => setMSerial(e.target.value)}>
              <option value="">{t("— เลือก serial —", "— select serial —")}</option>
              {(selProd.serials || []).filter((s) => s.status === "in").map((s) => <option key={s.serial} value={s.serial}>{s.serial}</option>)}
            </select>
          )}
          {selProd && selProd.tracksSerial && (() => {
            const av = (selProd.serials || []).filter((sr) => sr.status === "in" && !cart.some((cl) => cl.serial === sr.serial));
            return (
              <div style={{ flexBasis: "100%", marginTop: 4 }}>
                <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{t("Serial คงเหลือ", "Serials in stock")} ({av.length}) — {t("แตะตัวที่ขายเพื่อหยิบใส่บิล", "tap one to add it to the bill")}</div>
                <div className="serial-wrap">
                  {av.length === 0 && <span className="faint" style={{ fontSize: 12 }}>{t("ไม่มีคงเหลือ (หรืออยู่ในบิลแล้ว)", "none left (or already on the bill)")}</span>}
                  {av.map((sr) => (
                    <span key={sr.serial} className="serial-chip" role="button" tabIndex={0} style={{ cursor: "pointer" }}
                      onClick={() => { addSerialLine(selProd, sr.serial); setMSerial(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addSerialLine(selProd, sr.serial); setMSerial(""); } }}>
                      <span className="s-in">{sr.serial}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
          <button className="btn btn-sm btn-primary" onClick={() => {
            if (!selProd) return;
            if (selProd.tracksSerial) { if (!mSerial) { openSnPick(selProd); return; } addSerialLine(selProd, mSerial); setMSerial(""); }
            else if (serialHistIds.has(selProd.id)) openSnPick(selProd);
            else addQtyLine(selProd);
          }}>+ {t("เพิ่ม", "Add")}</button>
        </div>
      )}

      {flash && <div className={"flash flash-" + (flash.type === "ok" ? "ok" : flash.type === "err" ? "err" : "info")}>{flash.msg}</div>}

      {snPick && (() => {
        const p = byId(snPick);
        if (!p) return null;
        const tracked = !!p.tracksSerial;
        const inCart = (sn) => cart.some((l) => l.serial && norm(l.serial) === norm(sn));
        const avail = (p.serials || []).filter((sr) => sr.status === "in" && !inCart(sr.serial));
        const q = norm(snQ);
        const show = avail.filter((sr) => tokMatch(sr.serial, q));
        const take = (sn) => { addSerialLine(p, sn); setSnPick(null); focus(); };
        const saveCustom = () => {
          const sn = snCustom.trim();
          if (!sn) return;
          if (inCart(sn)) { flashMsg("err", t("serial นี้อยู่ในบิลแล้ว", "Already on this bill")); return; }
          if (tracked) {
            if ((p.serials || []).some((sr) => norm(sr.serial) === norm(sn) && sr.status !== "in")) { flashMsg("err", t("serial นี้ขายไปแล้ว", "That serial was already sold")); return; }
            if (!(p.serials || []).some((sr) => norm(sr.serial) === norm(sn))) onAttachSerial && onAttachSerial(p.id, sn); // save into the system
            addSerialLine(p, sn);
          } else {
            addQtyLineSerialNote(p, sn); // qty product: serial rides on the bill line; stock cut by FIFO as usual
          }
          setSnPick(null); focus();
        };
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "8vh 14px 14px", overflow: "auto" }} onClick={() => setSnPick(null)}>
            <div className="card card-pad" style={{ width: "100%", maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
              <div className="line-head" style={{ marginBottom: 2 }}>{t("เลือก Serial", "Pick a serial")} — {pname(p)}</div>
              {tracked ? (
                <>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t("คงเหลือ ", "In stock ")}{avail.length} {t("ชิ้น — แตะตัวที่จะขาย", "— tap the unit being sold")}</div>
                  {avail.length > 6 && <input className="input" style={{ marginBottom: 8 }} value={snQ} onChange={(e) => setSnQ(e.target.value)} placeholder={t("พิมพ์/ยิงเพื่อกรองลิสต์", "type/scan to filter")} />}
                  <div className="serial-wrap" style={{ maxHeight: 224, overflow: "auto", marginBottom: 10 }}>
                    {show.length === 0 && <span className="faint" style={{ fontSize: 12.5 }}>{avail.length === 0 ? t("ไม่มี serial คงเหลือในระบบ — ใส่เองด้านล่างได้เลย", "no serials on file — enter one below") : t("ไม่พบที่ค้นหา", "no match")}</span>}
                    {show.map((sr) => (
                      <span key={sr.serial} className="serial-chip" role="button" tabIndex={0} style={{ cursor: "pointer", fontSize: 13.5, padding: "7px 11px" }}
                        onClick={() => take(sr.serial)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); take(sr.serial); } }}>
                        <span className="s-in">{sr.serial}</span>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: 10 }}>
                  <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.55, marginBottom: 8 }}>
                    {t("สินค้านี้ยังนับสต๊อกแบบจำนวนรวม (ของเดิมจาก ProMaxx ไม่มีลิสต์ serial คงเหลือ) — ใส่ serial ของชิ้นที่ขายด้านล่างเพื่อบันทึกลงบิลและประวัติได้เลย", "This product is still quantity-tracked (legacy data has no in-stock serial list) — enter the unit's serial below to record it on the bill & history")}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-sm" onClick={() => { addQtyLine(p); setSnPick(null); focus(); }}>{t("ขายโดยไม่ระบุ serial", "Sell without a serial")}</button>
                    {setTab && <button className="btn btn-sm" onClick={() => { setSnPick(null); setTab("inventory"); }}>🏷 {t("ไปติด serial คงเหลือที่หน้าสินค้า", "Attach stock serials in Inventory")}</button>}
                  </div>
                </div>
              )}
              <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>➕ {t("ใส่ serial เอง (ไม่มีในลิสต์)", "Enter a serial manually")}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input className="input" style={{ flex: 1, minWidth: 160, fontFamily: "'IBM Plex Mono',monospace" }} value={snCustom}
                    onChange={(e) => setSnCustom(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveCustom(); } }}
                    placeholder={t("พิมพ์หรือยิง serial", "type or scan the serial")} />
                  <button className="btn btn-sm btn-primary" disabled={!snCustom.trim()} onClick={saveCustom}>{t("บันทึก + ใส่ในบิล", "Save & add")}</button>
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>{tracked ? t("serial ที่ใส่เองจะถูกบันทึกเข้าสต๊อกสินค้านี้อัตโนมัติ แล้วตัดเป็นขายแล้วเมื่อออกบิล", "Saved into this product's stock, then marked sold when the bill is issued") : t("serial จะติดไปกับบรรทัดบิลและประวัติการขาย — สต๊อกตัดตามจำนวนเหมือนเดิม", "The serial rides on the bill line & history — stock is still cut by quantity")}</div>
              </div>
              <div style={{ marginTop: 10, textAlign: "right" }}><button className="btn btn-sm" onClick={() => setSnPick(null)}>{t("ปิด", "Close")}</button></div>
            </div>
          </div>
        );
      })()}

      <div className="card" style={{ marginTop: 4 }}>
        {cart.length === 0 ? (
          <div style={{ padding: "26px 16px", textAlign: "center", color: "var(--soft)", fontSize: 14 }}>{t("ตะกร้ายังว่าง — สแกนสินค้าเพื่อเริ่ม", "Cart is empty — scan an item to start")}</div>
        ) : (
          <div className="table-scroll" style={{ border: 0 }}>
            <table className="t" style={{ minWidth: 520 }}>
              <thead>
                <tr><th>{t("สินค้า", "Item")}</th><th className="c" style={{ width: 84 }}>{t("จำนวน", "Qty")}</th><th className="r" style={{ width: 96 }}>{t("ราคา", "Price")}</th><th className="c" style={{ width: 116 }}>{t("ส่วนลด", "Disc.")}</th><th className="r" style={{ width: 104 }}>{t("รวม", "Total")}</th><th style={{ width: 36 }}></th></tr>
              </thead>
              <tbody>
                {cart.map((l) => (
                  <tr key={l.key}>
                    <td>{l.name}{l.serial && <span className="serial-chip s-in" style={{ marginLeft: 6 }}>{l.serial}</span>}</td>
                    <td className="c">{l.isSerial ? <span className="acc-num">1</span> : <input className="qty-input" inputMode="numeric" value={l.qty} onChange={(e) => setLineQty(l.key, e.target.value)} />}</td>
                    <td className="r"><input className="qty-input" style={{ width: 84, textAlign: "right" }} inputMode="decimal" value={l.price} onChange={(e) => setLineField(l.key, { price: e.target.value })} title={t("แก้ราคาขายต่อหน่วยได้ (เช่น ต่างแพลตฟอร์ม)", "edit unit price (e.g. per platform)")} /></td>
                    <td className="c">
                      <div style={{ display: "flex", gap: 3, alignItems: "center", justifyContent: "center" }}>
                        <input className="qty-input" style={{ width: 56 }} inputMode="decimal" value={l.disc != null ? l.disc : ""} onChange={(e) => setLineField(l.key, { disc: e.target.value })} placeholder="0" />
                        <button className="btn btn-sm" style={{ padding: "2px 7px", minWidth: 26 }} title={t("สลับ บาท/เปอร์เซ็นต์", "toggle baht / percent")} onClick={() => setLineField(l.key, { discKind: l.discKind === "percent" ? "amount" : "percent" })}>{l.discKind === "percent" ? "%" : "฿"}</button>
                      </div>
                    </td>
                    <td className="r acc-num">{money(saleLineNet(l))}</td>
                    <td className="c"><button className="icon-btn" onClick={() => removeLine(l.key)} title={t("ลบ", "remove")}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="cart-total">
          <span style={{ fontWeight: 600 }}>{t("ยอดก่อนส่วนลด", "Subtotal")}</span>
          <span className="amt">฿{money(totals.subtotal)}</span>
        </div>
      </div>

      {/* checkout */}
      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="line-head" style={{ marginBottom: 10 }}>{t("ข้อมูลการขาย / ออกบิล", "Sale & invoice details")}</div>

        <div className="row2">
          <div className="field">
            <label>{t("ลูกค้า (เลือกจากที่มี)", "Customer (existing)")}</label>
            <select className="select" value={custId} onChange={(e) => { const id = e.target.value; setCustId(id); fillCustForm(customers.find((x) => x.id === id)); }}>
              <option value="">{t("— ลูกค้าทั่วไป / กรอกใหม่ —", "— walk-in / new —")}</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name || c.taxId}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t("วันที่ (แก้ไขได้)", "Date (editable)")}</label>
            <DateInput className="input" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label>{t("เลขที่บิล (แก้ไขได้ก่อนออกบิล)", "Bill no. (editable before issuing)")}</label>
            <input className="input" value={billNoOv} onChange={(e) => setBillNoOv(e.target.value)} placeholder={nextBillNo(sales, saleDate)} />
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <div className="muted" style={{ fontSize: 12.5, paddingTop: 12 }}>{t("ปล่อยว่าง = รันอัตโนมัติเป็น ", "Leave blank for auto: ")}<b className="acc-num">{nextBillNo(sales, saleDate)}</b></div>
          </div>
        </div>

        {(
          <div>
            <div className="row2">
              <div className="field sug-wrap">
                <label>{custId ? t("ชื่อลูกค้า (แก้ไขได้ — บันทึกทับข้อมูลเดิมตอนออกบิล)", "Customer name (editable — saved over the record on issue)") : t("ชื่อลูกค้า / บริษัท (พิมพ์เพื่อค้นหาที่เคยมี)", "Customer / company (type to search saved)")}</label>
                <input className="input" value={custForm.name}
                  onChange={(e) => { setCustForm({ ...custForm, name: e.target.value }); setShowCustSug(true); }}
                  onFocus={() => setShowCustSug(true)} onBlur={() => setTimeout(() => setShowCustSug(false), 150)}
                  placeholder={t("ชื่อสำหรับออกใบกำกับภาษี", "name for the tax invoice")} />
                {!custId && showCustSug && custMatches.length > 0 && (
                  <div className="sug-list">
                    {custMatches.map((c) => (
                      <div key={c.id} className="sug-item" onMouseDown={(e) => { e.preventDefault(); pickCustomer(c); }}>
                        <span className="sug-name">{c.name || c.taxId}</span>
                        <span className="sug-meta">{c.taxId || ""}{c.phone ? " · " + c.phone : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="field"><label>{t("เลขผู้เสียภาษี (13 หลัก)", "Tax ID (13 digits)")}</label><input className="input" inputMode="numeric" value={custForm.taxId} onChange={(e) => setCustForm({ ...custForm, taxId: e.target.value })} placeholder="0000000000000" /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{t("ที่อยู่", "Address")}</label><textarea className="input" rows={4} style={{ resize: "vertical", lineHeight: 1.5, fontFamily: "inherit" }} value={custForm.address} onChange={(e) => setCustForm({ ...custForm, address: e.target.value })} placeholder={t("พิมพ์ที่อยู่ ข้อความยาวจะตัดขึ้นบรรทัดใหม่เอง กด Enter เพื่อขึ้นบรรทัดใหม่ได้", "type the address — long text wraps automatically; press Enter for a new line")} /></div>
              <div className="field"><label>{t("โทรศัพท์", "Phone")}</label><input className="input" value={custForm.phone} onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })} placeholder={t("เบอร์โทร", "phone")} /></div>
            </div>
            <div className="field" style={{ marginTop: 2 }}>
              <BranchPicker t={t} value={custForm.branch} onChange={(b) => setCustForm({ ...custForm, branch: b })} />
            </div>
            {!custId
              ? <label className="checkrow"><input type="checkbox" checked={saveNewCust} onChange={(e) => setSaveNewCust(e.target.checked)} />{t("บันทึกลูกค้า/บริษัทนี้เข้าระบบ (ครั้งหน้าค้นหาเจอเลย)", "Save this customer/company to the database (findable next time)")}</label>
              : <div className="muted" style={{ fontSize: 12 }}>{t("✓ ถ้าแก้ไขข้อมูลด้านบน ระบบจะบันทึกทับข้อมูลลูกค้ารายนี้ให้อัตโนมัติตอนออกบิล", "✓ Edits above are saved over this customer's record when the bill is issued")}</div>}
          </div>
        )}

        <div className="row2">
          <div className="field">
            <label>{t("ช่องทางรับเงิน", "Payment channel")}</label>
            <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
              {CHANNELS.map((c) => <option key={c.k} value={c.k}>{lang === "en" ? c.en : c.th}</option>)}
            </select>
          </div>
          {(channel === "transfer" || channel === "cheque") && (
            <div className="field">
              <label>{t("บัญชีธนาคาร", "Bank account")}</label>
              <select className="select" value={bankId} onChange={(e) => setBankId(e.target.value)}>
                <option value="">{banks.length ? t("— เลือกบัญชี —", "— select —") : t("(ยังไม่มี — เพิ่มในตั้งค่าร้าน)", "(none — add in Shop settings)")}</option>
                {banks.map((b) => <option key={b.id} value={b.id}>{b.bankName + (b.accountNo ? " · " + b.accountNo : "")}</option>)}
              </select>
            </div>
          )}
          {(channel === "shopee" || channel === "lazada") && (
            <div className="field">
              <label>{t("ค่าธรรมเนียม " + (channel === "lazada" ? "Lazada" : "Shopee") + " (ประมาณ)", (channel === "lazada" ? "Lazada" : "Shopee") + " fee (estimate)")}</label>
              <input className="input r" inputMode="decimal" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} placeholder="0.00" />
            </div>
          )}
        </div>
        {channel === "cheque" && (
          <div className="field" style={{ maxWidth: 260 }}><label>{t("เลขที่เช็ค", "Cheque no.")}</label><input className="input" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} /></div>
        )}

        <div className="row2">
          <div className="field">
            <label>{t("ส่วนลด", "Discount")}</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="input r" inputMode="decimal" style={{ flex: 1, minWidth: 0 }} value={discVal} onChange={(e) => setDiscVal(e.target.value)} placeholder="0" />
              <select className="select" style={{ width: 84 }} value={discType} onChange={(e) => setDiscType(e.target.value)}>
                <option value="amount">฿</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <label className="checkrow" style={{ marginTop: 0 }}><input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} />{t("ออกใบกำกับภาษี VAT " + vatPct + "% (ราคารวม VAT แล้ว)", "Tax invoice — VAT " + vatPct + "% (prices incl. VAT)")}</label>
          </div>
        </div>

        <div className="totbox">
          <div><span>{t("ยอดรวม", "Subtotal")}</span><span className="acc-num">฿{money(totals.subtotal)}</span></div>
          {totals.discountAmt > 0 && <div><span>{t("ส่วนลด", "Discount")}</span><span className="acc-num">−฿{money(totals.discountAmt)}</span></div>}
          {vatEnabled && <div><span>{t("มูลค่าก่อน VAT", "Pre-VAT")}</span><span className="acc-num">฿{money(totals.base)}</span></div>}
          {vatEnabled && <div><span>{t("ภาษีมูลค่าเพิ่ม " + vatPct + "%", "VAT " + vatPct + "%")}</span><span className="acc-num">฿{money(totals.vat)}</span></div>}
          <div className="grand"><span>{t("ยอดสุทธิ", "Net total")}</span><span className="acc-num">฿{money(totals.total)}</span></div>
        </div>

        {acctLevel >= 3
          ? <label className="checkrow"><input type="checkbox" checked={postJournal} onChange={(e) => setPostJournal(e.target.checked)} />{t("บันทึกลงบัญชี (เดบิตเงินสด/ธนาคาร, เครดิตรายได้ + VAT, ตัดต้นทุนขาย FIFO)", "Post to the books (Dr Cash/Bank, Cr Sales + VAT, FIFO COGS)")}</label>
          : <div className="muted" style={{ fontSize: 12 }}>{t("✓ บันทึกลงบัญชีอัตโนมัติ", "✓ Posted to the books automatically")}</div>}

        {!editingId && (
          <label className="checkrow" style={{ marginTop: 4 }}><input type="checkbox" checked={waitBill} onChange={(e) => setWaitBill(e.target.checked)} />{t("รอออกบิล — ตัดสต๊อกไว้ก่อน ยังไม่ออกเลขบิล/ยังไม่ลงบัญชี (ไปออกบิลรวมทีหลังที่เมนู “รอออกบิล”)", "Wait to bill — deduct stock now, issue the numbered bill & post the journal later from “Pending bills”")}</label>
        )}

        <div className="btn-row">
          <button className="btn btn-primary" onClick={confirmSale} disabled={!cart.length} style={{ opacity: cart.length ? 1 : 0.55 }}>{waitBill && !editingId ? t("เก็บรอออกบิล", "Park (wait to bill)") : t("บันทึกการขาย + ออกบิล", "Save sale + invoice")}</button>
          {cart.length > 0 && <button className="btn" onClick={() => setCart([])}>{t("ล้างตะกร้า", "Clear cart")}</button>}
        </div>
      </div>
    </div>
  );
}


/* ============================== Import ============================== */
const JOURNAL_FIELDS = [
  { k: "date", th: "วันที่", en: "Date", req: true, kw: ["date", "วันที่", "วันเดือนปี", "วันที"] },
  { k: "ref", th: "เลขที่เอกสาร", en: "Doc/Ref no.", req: false, kw: ["ref", "เลขที่", "เอกสาร", "voucher", "doc", "เลขที"] },
  { k: "desc", th: "คำอธิบาย", en: "Description", req: false, kw: ["desc", "รายการ", "คำอธิบาย", "รายละเอียด", "memo", "particular"] },
  { k: "account", th: "บัญชี (รหัส/ชื่อ)", en: "Account (code/name)", req: true, kw: ["account", "บัญชี", "รหัสบัญชี", "ผังบัญชี", "acc"] },
  { k: "debit", th: "เดบิต", en: "Debit", req: true, kw: ["debit", "เดบิต", "dr"] },
  { k: "credit", th: "เครดิต", en: "Credit", req: true, kw: ["credit", "เครดิต", "cr"] },
];
const PRODUCT_FIELDS = [
  { k: "barcode", th: "บาร์โค้ด", en: "Barcode", req: false, kw: ["barcode", "บาร์โค้ด", "บาโค้ด", "upc", "ean", "รหัสสินค้า", "code"] },
  { k: "sku", th: "SKU", en: "SKU", req: false, kw: ["sku"] },
  { k: "th", th: "ชื่อสินค้า (ไทย)", en: "Name", req: true, kw: ["ชื่อ", "name", "สินค้า", "รายการ", "description"] },
  { k: "en", th: "ชื่อ (อังกฤษ)", en: "Name (EN)", req: false, kw: ["english", "name(en)"] },
  { k: "qty", th: "จำนวน", en: "Quantity", req: false, kw: ["qty", "จำนวน", "จํานวน", "คงเหลือ", "stock", "quantity"] },
  { k: "cost", th: "ต้นทุน", en: "Cost", req: false, kw: ["cost", "ต้นทุน", "ทุน"] },
  { k: "price", th: "ราคาขาย", en: "Price", req: false, kw: ["price", "ราคา", "ขาย"] },
  { k: "serial", th: "ติดตาม Serial (yes/no)", en: "Serial flag", req: false, kw: ["serial", "ซีเรียล", "sn"] },
];

// extra expense accounts created when importing an income/expense sheet
const EXTRA_EXPENSE_ACCOUNTS = [
  { id: "a5060", code: "5060", th: "ค่าเดินทาง", en: "Travel", type: "expense" },
  { id: "a5070", code: "5070", th: "ค่าขนส่งและบรรจุภัณฑ์", en: "Shipping & packaging", type: "expense" },
];

const TH_MONTH = { "มกราคม": 1, "กุมภาพันธ์": 2, "มีนาคม": 3, "เมษายน": 4, "พฤษภาคม": 5, "มิถุนายน": 6, "กรกฎาคม": 7, "สิงหาคม": 8, "กันยายน": 9, "ตุลาคม": 10, "พฤศจิกายน": 11, "ธันวาคม": 12 };
const pad2 = (n) => String(n).padStart(2, "0");

async function parseWorkbook(file) {
  const name = file.name.toLowerCase();
  let wb;
  if (name.endsWith(".csv") || name.endsWith(".txt")) {
    const text = await file.text();
    wb = XLSX.read(text, { type: "string" });
  } else {
    const buf = await file.arrayBuffer();
    wb = XLSX.read(buf, { type: "array" });
  }
  return wb.SheetNames.map((n) => ({ name: n, aoa: XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "" }) }));
}

function autoGuess(headers, fields) {
  const m = {};
  fields.forEach((f) => {
    let idx = -1;
    headers.forEach((h, i) => {
      if (idx >= 0) return;
      const hn = norm(h);
      if (hn && f.kw.some((k) => hn.includes(norm(k)))) idx = i;
    });
    m[f.k] = idx;
  });
  return m;
}

function excelDateToISO(v) {
  if (typeof v === "number" && v > 59) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return String(v == null ? "" : v).trim();
}

// ---- income/expense ("รายรับรายจ่าย") sheet support ----
function detectMonthYear(aoa) {
  for (const row of (aoa || []).slice(0, 6)) {
    for (const cell of row) {
      const s = String(cell || "");
      for (const th in TH_MONTH) {
        if (s.indexOf(th) >= 0) {
          const ym = s.match(/(25\d\d|20\d\d)/);
          let year = ym ? parseInt(ym[1], 10) : null;
          if (year && year > 2400) year -= 543; // Buddhist -> Gregorian
          return { month: TH_MONTH[th], year };
        }
      }
    }
  }
  return { month: null, year: null };
}
function findLedgerHeader(aoa) {
  for (let i = 0; i < Math.min((aoa || []).length, 12); i++) {
    const r = aoa[i].map(norm);
    if (r.includes("วันที่") && r.includes("รายการ") && r.some((c) => c.indexOf("จำนวนเงิน") >= 0 || c.indexOf("จํานวนเงิน") >= 0)) return i;
  }
  return -1;
}
function colIdx(H, keys) {
  for (let i = 0; i < H.length; i++) { const h = norm(H[i]); if (keys.some((k) => h === norm(k) || h.indexOf(norm(k)) >= 0)) return i; }
  return -1;
}
function parseLedger(aoa) {
  const my = detectMonthYear(aoa);
  const hi = findLedgerHeader(aoa);
  if (hi < 0) return { my, rows: [], cols: {}, headerRow: -1, isIncome: false };
  const H = aoa[hi];
  const c = {
    date: colIdx(H, ["วันที่"]), item: colIdx(H, ["รายการ"]), amt: colIdx(H, ["จำนวนเงิน", "จํานวนเงิน"]),
    profit: colIdx(H, ["กำไร", "กําไร"]), cash: colIdx(H, ["เงินสด"]), transfer: colIdx(H, ["เงินโอน"]),
    shopee: colIdx(H, ["shopee"]), lazada: colIdx(H, ["lazada"]), bill: colIdx(H, ["เลขที่บิล", "บิล"]),
  };
  const rows = []; let last = null;
  for (let i = hi + 1; i < aoa.length; i++) {
    const r = aoa[i];
    const item = String(r[c.item] || "").trim();
    const amt = num(r[c.amt]);
    if (!item && !amt) continue;
    let d = (c.date >= 0 && r[c.date] !== "" && r[c.date] != null) ? parseInt(num(r[c.date]), 10) : null;
    if (d) last = d; else d = last;
    rows.push({
      day: d, item, amount: amt, profit: c.profit >= 0 ? num(r[c.profit]) : 0,
      cash: c.cash >= 0 ? r[c.cash] : "", transfer: c.transfer >= 0 ? r[c.transfer] : "",
      shopee: c.shopee >= 0 ? num(r[c.shopee]) : 0, lazada: c.lazada >= 0 ? num(r[c.lazada]) : 0,
      bill: c.bill >= 0 ? r[c.bill] : "",
    });
  }
  return { my, rows, cols: c, headerRow: hi, isIncome: c.cash >= 0 || c.shopee >= 0 || c.transfer >= 0 };
}
function ledDate(my, day) {
  const y = my.year || new Date().getFullYear();
  const m = my.month || 1;
  return y + "-" + pad2(m) + "-" + pad2(day || 1);
}
function expenseCode(item) {
  const n = norm(item);
  if (n.indexOf("เงินเดือน") >= 0 || n.indexOf("ค่าจ้าง") >= 0 || n.indexOf("ค่าแรง") >= 0) return "5020";
  if (n.indexOf("ค่าเช่า") >= 0) return "5030";
  if (n.indexOf("ค่าไฟ") >= 0 || n.indexOf("ค่าน้ำ") >= 0 || n.indexOf("ค่าโทร") >= 0 || n.indexOf("เน็ต") >= 0 || n.indexOf("อินเทอร์เน็ต") >= 0) return "5040";
  if (n.indexOf("ค่ารถ") >= 0 || n.indexOf("น้ำมัน") >= 0 || n.indexOf("ทางด่วน") >= 0 || n.indexOf("เดินทาง") >= 0 || n.indexOf("แท็กซี่") >= 0 || n.indexOf("วิน") >= 0) return "5060";
  if (n.indexOf("ค่าส่ง") >= 0 || n.indexOf("ems") >= 0 || n.indexOf("ขนส่ง") >= 0 || n.indexOf("พัสดุ") >= 0 || n.indexOf("กล่อง") >= 0 || n.indexOf("รัด") >= 0 || n.indexOf("แพ็ค") >= 0 || n.indexOf("ไปรษณีย์") >= 0) return "5070";
  return "5050";
}
function buildIncomeEntries(rows, my, rid) {
  const sales = rid("4010", "a4010");
  return rows.map((r) => {
    let code = "1010";
    if (r.cash !== "" && num(r.cash) !== 0) code = "1010";
    else if (String(r.transfer || "").trim() !== "") code = "1020";
    else if (r.shopee > 0) code = "1020";
    else if (r.lazada > 0) code = "1020";
    const acct = rid(code, "a" + code);
    const amt = r.amount;
    const desc = r.item + (r.bill !== "" && r.bill != null ? " (บิล " + r.bill + ")" : "");
    return { id: uid(), date: ledDate(my, r.day), desc, lines: [{ accountId: acct, debit: amt, credit: 0 }, { accountId: sales, debit: 0, credit: amt }] };
  });
}
function buildExpenseEntries(rows, my, payCode, rid) {
  const pay = rid(payCode, "a" + payCode);
  return rows.map((r) => {
    const code = expenseCode(r.item);
    const acct = rid(code, "a" + code);
    return { id: uid(), date: ledDate(my, r.day), desc: r.item, lines: [{ accountId: acct, debit: r.amount, credit: 0 }, { accountId: pay, debit: 0, credit: r.amount }] };
  });
}

function downloadTemplate(type) {
  let aoa;
  if (type === "journal") {
    aoa = [
      ["วันที่ / Date", "เลขที่เอกสาร / Ref", "คำอธิบาย / Description", "รหัสบัญชี / Account code", "เดบิต / Debit", "เครดิต / Credit"],
      ["2025-02-01", "JV001", "ขายสินค้าเป็นเงินสด / Cash sale", "1010", 15000, 0],
      ["2025-02-01", "JV001", "ขายสินค้าเป็นเงินสด / Cash sale", "4010", 0, 15000],
      ["2025-02-02", "JV002", "จ่ายค่าไฟ / Pay utilities", "5040", 1200, 0],
      ["2025-02-02", "JV002", "จ่ายค่าไฟ / Pay utilities", "1010", 0, 1200],
    ];
  } else {
    aoa = [
      ["บาร์โค้ด / Barcode", "SKU", "ชื่อสินค้า / Name", "Name (EN)", "จำนวน / Qty", "ต้นทุน / Cost", "ราคาขาย / Price", "Serial (yes/no)"],
      ["8851234567890", "SKU-001", "น้ำดื่ม 600ml", "Water 600ml", 120, 5, 10, "no"],
      ["8857654321098", "SKU-002", "โน้ตบุ๊ก รุ่น X", "Laptop X", 5, 18000, 22900, "yes"],
    ];
  }
  try {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, type === "journal" ? "journal-template.xlsx" : "products-template.xlsx");
  } catch (e) { alert("ดาวน์โหลดไม่สำเร็จ / Download failed"); }
}

function ImportData({ t, lang, accounts, acctById, onImportEntries, onImportProducts, onImportAccounts, money }) {
  const [importType, setImportType] = useState("ledger");
  const [sheets, setSheets] = useState([]);          // [{name, aoa}]
  const [sheetIdx, setSheetIdx] = useState(0);
  const [mapping, setMapping] = useState({});
  const [fileName, setFileName] = useState("");
  const [flash, setFlash] = useState(null);
  const [ledgerType, setLedgerType] = useState("income"); // 'income' | 'expense'
  const [ledMonth, setLedMonth] = useState("");
  const [ledYear, setLedYear] = useState("");
  const [payFrom, setPayFrom] = useState("1020");

  const flashMsg = (ty, msg) => setFlash({ type: ty, msg });
  const aoa = sheets[sheetIdx] ? sheets[sheetIdx].aoa : null;
  const headers = aoa ? (aoa[0] || []).map((c) => String(c)) : [];
  const rows = aoa ? aoa.slice(1).filter((r) => r.some((c) => String(c).trim() !== "")) : [];
  const fields = importType === "journal" ? JOURNAL_FIELDS : PRODUCT_FIELDS;
  const rid = (code, fallback) => (accounts.find((a) => a.code === code) || {}).id || fallback;
  const ledger = importType === "ledger" && aoa ? parseLedger(aoa) : null;

  useEffect(() => {
    if (!aoa) return;
    if (importType !== "ledger") {
      setMapping(autoGuess(headers, importType === "journal" ? JOURNAL_FIELDS : PRODUCT_FIELDS));
    } else {
      const det = parseLedger(aoa);
      setLedgerType(det.isIncome ? "income" : "expense");
      if (det.my.month) setLedMonth(String(det.my.month));
      if (det.my.year) setLedYear(String(det.my.year));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetIdx, importType, sheets]);

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const all = await parseWorkbook(file);
      const ne = all.filter((s) => s.aoa && s.aoa.length);
      if (!ne.length) { flashMsg("err", t("ไม่พบข้อมูลในไฟล์", "No data found in the file")); return; }
      setSheets(ne);
      let idx = ne.findIndex((s) => !/สรุป|summary/i.test(s.name));
      if (idx < 0) idx = 0;
      setSheetIdx(idx);
      setFileName(file.name + (ne.length > 1 ? "  ·  " + ne.length + " " + t("ชีต", "sheets") : ""));
      flashMsg("info", t("อ่านไฟล์แล้ว — ตรวจค่าด้านล่างแล้วกดนำเข้า", "File read — check the settings below then import"));
    } catch (err) {
      flashMsg("err", t("อ่านไฟล์ไม่สำเร็จ ลองไฟล์ .xlsx หรือ .csv", "Couldn't read the file — try .xlsx or .csv"));
    }
    e.target.value = "";
  };

  const matchAccount = (cell) => {
    const v = String(cell == null ? "" : cell).trim();
    if (!v) return null;
    const first = v.split(/\s+/)[0];
    let a = accounts.find((x) => x.code === v) || accounts.find((x) => x.code === first);
    if (a) return a.id;
    a = accounts.find((x) => norm(x.th) === norm(v) || norm(x.en) === norm(v));
    if (a) return a.id;
    a = accounts.find((x) => x.th && norm(v).indexOf(norm(x.th)) >= 0) || accounts.find((x) => x.en && norm(v).indexOf(norm(x.en)) >= 0);
    return a ? a.id : null;
  };
  const getCell = (row, k) => { const i = mapping[k]; return i != null && i >= 0 ? row[i] : ""; };

  const doImport = () => {
    if (importType === "ledger") {
      const p = parseLedger(aoa);
      if (!p.rows.length) { flashMsg("err", t("ไม่พบรายการในชีตนี้ (ต้องมีคอลัมน์ วันที่/รายการ/จำนวนเงิน)", "No rows found (needs Date/Item/Amount columns)")); return; }
      const my = { month: parseInt(ledMonth, 10) || p.my.month || 1, year: parseInt(ledYear, 10) || p.my.year || new Date().getFullYear() };
      if (ledgerType === "income") {
        const entries = buildIncomeEntries(p.rows, my, rid);
        onImportEntries(entries);
        const tot = entries.reduce((s, e) => s + e.lines[0].debit, 0);
        flashMsg("ok", t("นำเข้ารายรับ " + entries.length + " รายการ รวม ฿" + money(tot), "Imported " + entries.length + " income entries, total ฿" + money(tot)));
      } else {
        onImportAccounts(EXTRA_EXPENSE_ACCOUNTS);
        const entries = buildExpenseEntries(p.rows, my, payFrom, rid);
        onImportEntries(entries);
        const tot = entries.reduce((s, e) => s + e.lines[0].debit, 0);
        flashMsg("ok", t("นำเข้ารายจ่าย " + entries.length + " รายการ รวม ฿" + money(tot), "Imported " + entries.length + " expense entries, total ฿" + money(tot)));
      }
      return;
    }
    if (importType === "journal") {
      const need = ["date", "account", "debit", "credit"];
      if (need.some((k) => mapping[k] == null || mapping[k] < 0)) { flashMsg("err", t("กรุณาจับคู่คอลัมน์: วันที่ บัญชี เดบิต เครดิต", "Please map: Date, Account, Debit, Credit")); return; }
      const groups = {}; const orderMap = {}; let order = 0; let unmatched = 0;
      rows.forEach((row) => {
        const accId = matchAccount(getCell(row, "account"));
        const dr = num(getCell(row, "debit")); const cr = num(getCell(row, "credit"));
        if (!accId) { if (dr || cr) unmatched++; return; }
        if (dr === 0 && cr === 0) return;
        const date = excelDateToISO(getCell(row, "date"));
        const desc = String(getCell(row, "desc") || "").trim();
        const refVal = mapping.ref >= 0 ? String(getCell(row, "ref") || "").trim() : "";
        const key = refVal || (date + "|" + desc);
        if (!groups[key]) { groups[key] = { date, desc, lines: [] }; orderMap[key] = order++; }
        groups[key].lines.push({ accountId: accId, debit: dr, credit: cr });
      });
      const list = Object.keys(groups).sort((a, b) => orderMap[a] - orderMap[b])
        .map((k) => ({ id: uid(), date: groups[k].date || todayISO(), desc: groups[k].desc, lines: groups[k].lines }))
        .filter((e) => e.lines.length);
      if (!list.length) { flashMsg("err", t("ไม่พบรายการที่นำเข้าได้ — ตรวจการจับคู่บัญชี", "Nothing importable — check account mapping")); return; }
      const unbalanced = list.filter((e) => Math.abs(e.lines.reduce((s, l) => s + l.debit, 0) - e.lines.reduce((s, l) => s + l.credit, 0)) > 0.005).length;
      onImportEntries(list);
      let msg = t("นำเข้า " + list.length + " รายการสำเร็จ", "Imported " + list.length + " entries");
      if (unmatched) msg += t(" · ข้าม " + unmatched + " บรรทัด (จับคู่บัญชีไม่ได้)", " · skipped " + unmatched + " lines (account not matched)");
      if (unbalanced) msg += t(" · ⚠ " + unbalanced + " รายการเดบิต≠เครดิต", " · ⚠ " + unbalanced + " unbalanced");
      flashMsg(unmatched || unbalanced ? "info" : "ok", msg);
    } else {
      if (mapping.th == null || mapping.th < 0) { flashMsg("err", t("กรุณาจับคู่คอลัมน์ชื่อสินค้า", "Please map the product name column")); return; }
      const truthy = (x) => ["yes", "y", "true", "1", "ใช่", "serial", "sn"].includes(norm(x));
      const list = [];
      rows.forEach((row) => {
        const nm = String(getCell(row, "th") || "").trim();
        const bc = String(getCell(row, "barcode") || "").trim();
        if (!nm && !bc) return;
        list.push({ id: uid(), barcode: bc, sku: String(getCell(row, "sku") || "").trim(), th: nm || bc, en: String(getCell(row, "en") || "").trim() || nm || bc, qty: num(getCell(row, "qty")), cost: num(getCell(row, "cost")), price: num(getCell(row, "price")), tracksSerial: truthy(getCell(row, "serial")), serials: [] });
      });
      if (!list.length) { flashMsg("err", t("ไม่พบสินค้าในไฟล์", "No products found")); return; }
      onImportProducts(list);
      flashMsg("ok", t("นำเข้า/อัปเดตสินค้า " + list.length + " รายการ", "Imported/updated " + list.length + " products"));
    }
  };

  return (
    <div>
      <div className="section-title">{t("นำเข้าข้อมูลจาก Excel / CSV", "Import from Excel / CSV")}</div>
      <div className="section-sub">{t("อัปโหลดไฟล์ Excel/CSV ของคุณ แล้วเลือกชนิดข้อมูลที่จะนำเข้า", "Upload your Excel/CSV file, then pick what to import")}</div>

      <div className="radio-row">
        <span className={"radio-pill" + (importType === "ledger" ? " on" : "")} onClick={() => setImportType("ledger")}>{t("รายรับ-รายจ่าย (แบบสมุดของฉัน)", "Income–Expense sheet")}</span>
        <span className={"radio-pill" + (importType === "journal" ? " on" : "")} onClick={() => setImportType("journal")}>{t("รายการบัญชีคู่", "Journal entries")}</span>
        <span className={"radio-pill" + (importType === "products" ? " on" : "")} onClick={() => setImportType("products")}>{t("สินค้า / สต๊อค", "Products / stock")}</span>
      </div>

      {importType !== "ledger" && (
        <div className="toolbar"><button className="btn btn-sm" onClick={() => downloadTemplate(importType)}>⬇ {t("ดาวน์โหลดเทมเพลต", "Download template")}</button></div>
      )}

      <div className="file-zone">
        {t("เลือกไฟล์ .xlsx หรือ .csv", "Choose an .xlsx or .csv file")}
        <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={onFile} />
        {fileName && <div style={{ marginTop: 8, fontSize: 12 }} className="muted">{fileName}</div>}
      </div>

      {flash && <div className={"flash flash-" + (flash.type === "ok" ? "ok" : flash.type === "err" ? "err" : "info")}>{flash.msg}</div>}

      {sheets.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 16 }}>
          {sheets.length > 1 && (
            <div className="field" style={{ maxWidth: 360 }}>
              <label>{t("เลือกชีต (sheet)", "Sheet")}</label>
              <select className="select" value={sheetIdx} onChange={(e) => setSheetIdx(parseInt(e.target.value, 10))}>
                {sheets.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
              </select>
            </div>
          )}

          {importType === "ledger" ? (
            <div>
              <div className="row2">
                <div className="field">
                  <label>{t("ชนิดข้อมูลในชีตนี้", "This sheet is")}</label>
                  <select className="select" value={ledgerType} onChange={(e) => setLedgerType(e.target.value)}>
                    <option value="income">{t("รายรับ (เครดิตรายได้ขาย)", "Income (credit Sales)")}</option>
                    <option value="expense">{t("รายจ่าย (เดบิตค่าใช้จ่าย)", "Expense (debit expense)")}</option>
                  </select>
                </div>
                {ledgerType === "expense" && (
                  <div className="field">
                    <label>{t("จ่ายค่าใช้จ่ายจากบัญชี", "Expenses paid from")}</label>
                    <select className="select" value={payFrom} onChange={(e) => setPayFrom(e.target.value)}>
                      <option value="1020">{t("เงินฝากธนาคาร", "Bank")}</option>
                      <option value="1010">{t("เงินสด", "Cash")}</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="row2">
                <div className="field"><label>{t("เดือน (1-12)", "Month (1-12)")}</label><input className="input r" inputMode="numeric" value={ledMonth} onChange={(e) => setLedMonth(e.target.value)} placeholder="3" /></div>
                <div className="field"><label>{t("ปี ค.ศ.", "Year (CE)")}</label><input className="input r" inputMode="numeric" value={ledYear} onChange={(e) => setLedYear(e.target.value)} placeholder="2026" /></div>
              </div>
              <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
                {ledger && ledger.headerRow >= 0
                  ? t("พบ " + ledger.rows.length + " รายการในชีตนี้", "Found " + ledger.rows.length + " rows in this sheet")
                  : t("ไม่พบหัวคอลัมน์ วันที่/รายการ/จำนวนเงิน ในชีตนี้ — ลองเลือกชีตอื่น", "Couldn't find Date/Item/Amount headers — try another sheet")}
              </div>
              <button className="btn btn-primary" onClick={doImport} disabled={!ledger || ledger.rows.length === 0} style={{ opacity: ledger && ledger.rows.length ? 1 : 0.55 }}>
                {t("นำเข้าข้อมูล", "Import")}
              </button>
            </div>
          ) : (
            <div>
              <div className="line-head" style={{ marginBottom: 10 }}>{t("จับคู่คอลัมน์", "Map columns")} · {rows.length} {t("แถว", "rows")}</div>
              <div className="map-grid">
                {fields.map((f) => (
                  <div className="field" key={f.k} style={{ marginBottom: 4 }}>
                    <label>{t(f.th, f.en)}{f.req ? " *" : ""}</label>
                    <select className="select" value={mapping[f.k] != null ? mapping[f.k] : -1} onChange={(e) => setMapping({ ...mapping, [f.k]: parseInt(e.target.value, 10) })}>
                      <option value={-1}>{t("— ไม่ใช้ —", "— none —")}</option>
                      {headers.map((h, i) => <option key={i} value={i}>{h || (t("คอลัมน์ ", "Col ") + (i + 1))}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={doImport}>{t("นำเข้าข้อมูล", "Import")}</button>
            </div>
          )}
        </div>
      )}

      <div className="note-box">
        {importType === "ledger"
          ? t("รองรับไฟล์แบบสมุดรายรับ-รายจ่ายของคุณ: หัวคอลัมน์ วันที่ · รายการ · จำนวนเงิน (รายรับมี กำไร/เงินสด/เงินโอน/Shopee/Lazada เพิ่ม) ระบบจะเติมวันที่ที่เว้นว่างให้อัตโนมัติ และอ่านเดือน/ปีจากหัวกระดาษ · รายรับ → เดบิตเงินสด/ธนาคารตามช่องที่กรอก, เครดิตรายได้ขาย · รายจ่าย → จับหมวดให้อัตโนมัติ (เงินเดือน, ค่าเดินทาง, ค่าขนส่ง ฯลฯ) · ไฟล์ที่มีหลายชีตให้เลือกชีตด้านบน แล้วนำเข้าทีละชีต",
              "Reads your income/expense workbook: headers Date · Item · Amount (income also has Profit/Cash/Transfer/Shopee/Lazada). Blank dates are carried forward, month/year detected from the title. Income → debit Cash/Bank, credit Sales. Expense → auto-categorised (salary, travel, shipping…). For multi-sheet files, pick the sheet above and import one at a time.")
          : importType === "journal"
            ? t("หนึ่งแถว = หนึ่งบรรทัดบัญชี (วันที่ บัญชี เดบิต เครดิต) จับกลุ่มตามเลขที่เอกสาร · จับคู่บัญชีด้วยรหัสจะแม่นสุด", "One row = one posting line; grouped by Doc/Ref no. Matching accounts by code is most reliable.")
            : t("หนึ่งแถว = หนึ่งสินค้า ใส่คอลัมน์ Serial = yes สำหรับสินค้าที่ติดตามทีละชิ้น · บาร์โค้ดซ้ำจะบวกจำนวนเพิ่ม", "One row = one product. Set Serial = yes for serial-tracked items. Duplicate barcodes add to quantity.")}
      </div>
    </div>
  );
}

/* ===================== Invoice / Customers / Reports / Settings ===================== */
function fmtDate(d) {
  if (!d) return "";
  const p = String(d).split("-");
  if (p.length < 3) return d;
  return p[2] + "/" + p[1] + "/" + (parseInt(p[0], 10) + 543);
}
// Thai-format date field: shows วว/ดด/ปปปป (Buddhist year) but keeps the native calendar and stores ISO YYYY-MM-DD.
// onChange is called with { target: { value } } so it drops into existing `(e) => setX(e.target.value)` handlers unchanged.
function DateInput({ value, onChange, className = "input", style, ...rest }) {
  const ref = useRef(null);
  const open = () => { const el = ref.current; if (!el) return; try { if (el.showPicker) el.showPicker(); else el.focus(); } catch (e) {} };
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", verticalAlign: "middle", width: "100%", ...style }}>
      <input className={className} readOnly value={value ? fmtDate(value) : ""} placeholder="วว/ดด/ปปปป"
        onMouseDown={(e) => { e.preventDefault(); open(); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
        style={{ cursor: "pointer", width: "100%", minWidth: 0, boxSizing: "border-box" }} />
      <input ref={ref} type="date" value={value || ""} onChange={(e) => onChange({ target: { value: e.target.value } })} {...rest}
        tabIndex={-1} aria-hidden="true"
        style={{ position: "absolute", right: 4, bottom: 0, width: 1, height: 1, opacity: 0, pointerEvents: "none", border: 0, padding: 0, margin: 0 }} />
    </span>
  );
}
function bahtText(amount) {
  const a = (Number(amount) || 0).toFixed(2);
  const [baht, satang] = a.split(".");
  const num = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const unit = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];
  const conv = (n) => {
    let r = ""; const len = n.length;
    for (let i = 0; i < len; i++) {
      const d = +n.charAt(i), place = len - i - 1;
      if (d === 0) continue;
      if (place === 0 && d === 1 && len > 1) r += "เอ็ด";
      else if (place === 1 && d === 1) r += "สิบ";
      else if (place === 1 && d === 2) r += "ยี่สิบ";
      else r += num[d] + unit[place];
    }
    return r;
  };
  const readBig = (s) => {
    s = s.replace(/^0+/, "") || "0";
    if (s === "0") return "";
    if (s.length > 6) { const head = s.slice(0, s.length - 6), tail = s.slice(-6); return readBig(head) + "ล้าน" + (tail === "000000" ? "" : conv(tail.replace(/^0+/, "") || "0")); }
    return conv(s);
  };
  let txt = baht === "0" ? "ศูนย์บาท" : readBig(baht) + "บาท";
  txt += satang === "00" ? "ถ้วน" : readBig(satang) + "สตางค์";
  return txt;
}

function SignIn({ t, shopName, onSignIn }) {
  const [u, setU] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const pwRef = useRef(null);
  const go = async () => { if (!(await onSignIn(u, pw))) { setErr(t("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "Wrong username or password")); setPw(""); } };
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">{shopName || "ไทยคัลเลอร์"}</div>
        <div className="login-sub">{t("เข้าสู่ระบบเพื่อเริ่มขาย", "Sign in to start selling")}</div>
        <input className="input" placeholder={t("ชื่อผู้ใช้", "Username")} value={u} onChange={(e) => { setU(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter" && pwRef.current) pwRef.current.focus(); }} autoFocus />
        <input ref={pwRef} className="input" type="password" placeholder={t("รหัสผ่าน", "Password")} value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") go(); }} />
        {err && <div className="flash err" style={{ marginTop: 2 }}>{err}</div>}
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 6 }} onClick={go}>{t("เข้าสู่ระบบ", "Sign in")}</button>
      </div>
    </div>
  );
}

function AcctLogin({ t, onLogin, onCancel }) {
  const [u, setU] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const go = async () => { if (!(await onLogin(u, pw))) { setErr(t("เข้าไม่ได้ — ต้องเป็นผู้ใช้ระดับ 2 ขึ้นไป และรหัสถูกต้อง", "Denied — needs a level-2+ account with the right password")); setPw(""); } };
  return (
    <div className="inv-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="login-card" style={{ margin: "60px auto" }}>
        <div className="login-brand">{t("เข้าโหมดบัญชี", "Accounting login")}</div>
        <div className="login-sub">{t("ใช้รหัสผู้ดูแล/ผู้จัดการ (คนละชุดกับรหัสเข้าขาย)", "Use a manager/admin account (different from the POS login)")}</div>
        <input className="input" placeholder={t("ชื่อผู้ใช้", "Username")} value={u} onChange={(e) => { setU(e.target.value); setErr(""); }} autoFocus />
        <input className="input" type="password" placeholder={t("รหัสผ่าน", "Password")} value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") go(); }} />
        {err && <div className="flash err" style={{ marginTop: 2 }}>{err}</div>}
        <div className="btn-row" style={{ marginTop: 6 }}>
          <button className="btn btn-primary" onClick={go}>{t("เข้าสู่ระบบ", "Enter")}</button>
          <button className="btn" onClick={onCancel}>{t("ยกเลิก", "Cancel")}</button>
        </div>
      </div>
    </div>
  );
}

function PaperBoardsView({ t, boards, active, setActive }) {
  const list = boards || [];
  if (list.length === 0) return null;
  const idx = Math.min(active || 0, Math.max(0, list.length - 1));
  const board = list[idx] || null;
  const colTotals = board ? board.sizes.map((_, si) => board.rows.reduce((s, r) => s + (Number(r.counts[si]) || 0), 0)) : [];
  const grand = colTotals.reduce((s, x) => s + x, 0);
  return (
    <div>
      {list.length > 1 && (
        <div className="paper-tabs">
          {list.map((b, i) => (
            <button key={b.id} className={"paper-tab" + (i === idx ? " on" : "")} onClick={() => setActive(i)}>{b.name}</button>
          ))}
        </div>
      )}
      {board && (
        <div className="card card-pad">
          <div className="line-head" style={{ marginBottom: 8 }}>{board.name} · {t("รวมทั้งหมด", "Total")} <b className="acc-num">{grand}</b> {t("ม้วน/แผ่น", "rolls/sheets")}</div>
          <div className="table-scroll">
            <table className="t">
              <thead>
                <tr>
                  <th>{t("สี", "Colour")}</th>
                  <th>{t("รหัส", "Code")}</th>
                  {board.sizes.map((s, i) => <th key={i} className="r">{s}</th>)}
                  <th className="r">{t("รวม", "Sum")}</th>
                </tr>
              </thead>
              <tbody>
                {board.rows.map((r, ri) => {
                  const sum = (r.counts || []).reduce((s, x) => s + (Number(x) || 0), 0);
                  return (
                    <tr key={ri} style={sum <= 0 ? { opacity: 0.5 } : undefined}>
                      <td>{r.color}</td>
                      <td className="code">{r.code}</td>
                      {board.sizes.map((_, si) => {
                        const v = Number(r.counts[si]) || 0;
                        return <td key={si} className="r"><span className={v === 0 ? "paper-zero" : "acc-num"}>{v === 0 ? "–" : v}</span></td>;
                      })}
                      <td className="r acc-num"><b>{sum}</b></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ fontWeight: 700 }}>{t("รวมแต่ละขนาด", "Per-size total")}</td>
                  {colTotals.map((c, i) => <td key={i} className="r acc-num"><b>{c}</b></td>)}
                  <td className="r acc-num"><b>{grand}</b></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PaperStock({ t, boards }) {
  const [active, setActive] = useState(0);
  const list = boards || [];
  return (
    <div>
      <div className="section-title">{t("สต๊อกกระดาษ", "Paper stock")}</div>
      <div className="section-sub">{t("ดึงจากสต๊อกสินค้าจริงในระบบ (อ่านอย่างเดียว) — จำนวนขยับอัตโนมัติเมื่อขาย/รับเข้า แก้จำนวนได้ที่แท็บสินค้า", "Live from real product stock (read-only) — updates automatically on sales/receipts; edit quantities in the Inventory tab")}</div>
      {list.length === 0 ? (
        <div className="empty" style={{ marginTop: 14 }}>{t("ยังไม่มีสินค้าหมวดกระดาษฉากถ่ายภาพในระบบ", "No photo-background-paper products in the system yet")}</div>
      ) : (
        <PaperBoardsView t={t} boards={list} active={active} setActive={setActive} />
      )}
    </div>
  );
}

function PaperLookup({ t, boards, onClose }) {
  const [active, setActive] = useState(0);
  return (
    <div className="inv-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="login-card" style={{ maxWidth: 680, margin: "24px auto", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div className="login-brand" style={{ fontSize: 18 }}>{t("สต๊อกกระดาษ", "Paper stock")}</div>
          <button className="btn btn-sm" onClick={onClose}>{t("ปิด", "Close")}</button>
        </div>
        <div style={{ overflow: "auto" }}>
          {(boards || []).length === 0 ? <div className="empty">{t("ยังไม่มีข้อมูลสต๊อกกระดาษ", "No paper data yet")}</div>
            : <PaperBoardsView t={t} boards={boards} active={active} setActive={setActive} />}
        </div>
      </div>
    </div>
  );
}

function Pager({ t, page, pageCount, total, onPage }) {
  if (!total) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
      <button className="btn btn-sm" disabled={page <= 0} style={{ opacity: page <= 0 ? 0.45 : 1 }} onClick={() => onPage(Math.max(0, page - 1))}>{"\u2039 "}{t("ก่อนหน้า", "Prev")}</button>
      <span className="muted" style={{ fontSize: 12.5 }}>{t("หน้า ", "Page ")}{page + 1}/{pageCount}{" \u00b7 "}{t("รวม ", "")}{total}{t(" ใบ", "")}</span>
      <button className="btn btn-sm" disabled={page >= pageCount - 1} style={{ opacity: page >= pageCount - 1 ? 0.45 : 1 }} onClick={() => onPage(Math.min(pageCount - 1, page + 1))}>{t("ถัดไป", "Next")}{" \u203a"}</button>
    </div>
  );
}

function BillsList({ t, lang, sales, money, onShowInvoice, onEdit, onDelete, onHistory, showTotal = true }) {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const PAGE = 50;
  const rows = [...sales].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.billNo || "").localeCompare(a.billNo || ""));
  const qq = q.trim().toLowerCase();
  const filt = rows.filter((s) => {
    if (qq && !tokMatch([s.billNo, s.customer && s.customer.name, channelLabel(s.channel, lang)].filter(Boolean).join(" "), qq)) return false;
    const d = (s.date || "").slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
  useEffect(() => { setPage(0); }, [q, from, to]);
  const pageCount = Math.max(1, Math.ceil(filt.length / PAGE));
  const pg = Math.min(page, pageCount - 1);
  const shown = filt.slice(pg * PAGE, pg * PAGE + PAGE);
  return (
    <div>
      <div className="section-title">{t("บิลขาย / จัดการบิล", "Bills")}</div>
      <div className="section-sub">{t("เปิดดู พิมพ์ซ้ำ แก้ไข หรือลบบิลที่ออกไปแล้ว — การลบจะคืนสต๊อกและลบรายการบัญชีของบิลนั้นให้อัตโนมัติ", "Open, reprint, edit, or delete issued bills — deleting restores stock and removes that bill's journal entry")}</div>
      <div className="card card-pad" style={{ marginTop: 12 }}>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("ค้นหา เลขที่บิล / ลูกค้า / ช่องทาง", "Search bill no. / customer / channel")} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
          <span className="muted" style={{ fontSize: 12.5 }}>{t("ช่วงวันที่", "Dates")}</span>
          <DateInput className="input" style={{ flex: "1 1 130px", minWidth: 120 }} value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="muted">–</span>
          <DateInput className="input" style={{ flex: "1 1 130px", minWidth: 120 }} value={to} onChange={(e) => setTo(e.target.value)} />
          {(from || to) && <button className="btn btn-sm" onClick={() => { setFrom(""); setTo(""); }}>{t("ล้าง", "Clear")}</button>}
        </div>
        {filt.length === 0 ? (
          <div className="empty" style={{ marginTop: 12 }}>{rows.length === 0 ? t("ยังไม่มีบิล", "No bills yet") : t("ไม่พบบิลตามเงื่อนไข", "No matching bills")}</div>
        ) : (
          <>
            <div className="table-scroll" style={{ marginTop: 12 }}>
              <table className="t">
                <thead><tr><th>{t("เลขที่", "No.")}</th><th>{t("วันที่", "Date")}</th><th>{t("ลูกค้า", "Customer")}</th><th>{t("ช่องทาง", "Channel")}</th>{showTotal && <th className="r">{t("ยอดสุทธิ", "Total")}</th>}<th className="r">{t("จัดการ", "Actions")}</th></tr></thead>
                <tbody>
                  {shown.map((s) => (
                    <tr key={s.id}>
                      <td className="code">{s.billNo}{s.voided ? <span style={{ marginLeft: 6, color: "#fff", background: "#c0392b", borderRadius: 5, padding: "0 6px", fontSize: 11 }}>{t("ยกเลิก", "Cancelled")}</span> : null}</td>
                      <td>{fmtDate(s.date)}</td>
                      <td>{(s.customer && s.customer.name) || t("ลูกค้าทั่วไป", "Walk-in")}</td>
                      <td>{channelLabel(s.channel, lang)}</td>
                      {showTotal && <td className="r">฿{money(s.total)}</td>}
                      <td className="r" style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-sm" onClick={() => onShowInvoice(s)}>{t("เปิด", "Open")}</button>{" "}
                        {onHistory && <button className="btn btn-sm" title={t("ดูประวัติย้อนหลัง", "History")} onClick={() => onHistory(s)}>🕘</button>}{" "}
                        {!s.voided && onEdit && <button className="btn btn-sm" onClick={() => onEdit(s)}>{t("แก้ไข", "Edit")}</button>}{" "}
                        {!s.voided && onDelete && <button className="btn btn-sm btn-danger" onClick={() => onDelete(s)}>{t("ยกเลิก", "Cancel")}</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager t={t} page={pg} pageCount={pageCount} total={filt.length} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

function PurchaseModal({ t, lang, rec, banks, money, onClose, onDelete, onAdjustLanded }) {
  const [adj, setAdj] = useState(false);
  const [af, setAf] = useState(String(Number(rec.freightThb) || 0));
  const [ad, setAd] = useState((Array.isArray(rec.items) ? rec.items : []).map((i) => String(Number(i.dutyThb) || 0)));
  const [apay, setApay] = useState('ap');
  if (!rec) return null;
  const bank = (banks || []).find((b) => b.id === rec.bankId);
  const pay = rec.payChannel === "transfer" ? (t("โอน ", "Transfer ") + (bank ? bank.bank + " " + (bank.last4 || "") : "")) : t("เงินสด", "Cash");
  const fx = rec.currency && rec.currency !== "THB";
  const landed = (Number(rec.dutyThb) || 0) + (Number(rec.freightThb) || 0);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 14px 14px", overflow: "auto" }} onClick={onClose}>
      <div className="card card-pad" style={{ width: "100%", maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div className="line-head" style={{ marginBottom: 2 }}>{t("บิลซื้อ", "Purchase")} {rec.docNo ? "· " + rec.docNo : ""}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{fmtDate(rec.date)} · {rec.receiveStock ? t("เข้าสต๊อกสินค้า", "received into stock") : t("ลงเป็นค่าใช้จ่าย", "booked as expense")}</div>
          </div>
          <span className={"pill " + (rec.postJournal ? "" : "")} style={{ fontSize: 11.5, background: "var(--faint)", padding: "3px 9px", borderRadius: 999 }}>{rec.postJournal ? t("ลงบัญชีแล้ว", "posted") : t("ไม่ลงบัญชี", "not posted")}</span>
        </div>

        <div style={{ margin: "10px 0", padding: "8px 10px", background: "var(--faint)", borderRadius: 8, fontSize: 13 }}>
          <div><b>{rec.supplier || t("ไม่ระบุผู้ขาย", "no supplier")}</b></div>
          {rec.supplierTaxId ? <div className="muted" style={{ fontSize: 12 }}>{t("เลขผู้เสียภาษี ", "Tax ID ")}{rec.supplierTaxId}</div> : null}
          {rec.supplierAddress ? <div className="muted" style={{ fontSize: 12 }}>{rec.supplierAddress}</div> : null}
        </div>

        <div className="table-scroll">
          <table className="t">
            <thead><tr><th>{t("รายการ", "Item")}</th><th className="r">{t("จำนวน", "Qty")}</th>{fx && <th className="r">{rec.currency}/{t("หน่วย", "unit")}</th>}<th className="r">{t("ทุน/หน่วย (บาท)", "Unit (THB)")}</th><th className="r">{t("รวม (บาท)", "Line (THB)")}</th></tr></thead>
            <tbody>
              {(Array.isArray(rec.items) ? rec.items : []).map((it, i) => (
                <tr key={i}>
                  <td>{it.name || "—"}{it.useSerial && (it.serials || []).length ? <div className="faint" style={{ fontSize: 11 }}>S/N: {(it.serials || []).join(", ")}</div> : null}</td>
                  <td className="r acc-num">{it.qty}</td>
                  {fx && <td className="r acc-num">{money(it.unitCostFx)}</td>}
                  <td className="r acc-num">{money(it.unitCostThb)}</td>
                  <td className="r acc-num">{money(it.lineThb)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cart-total" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("มูลค่าสินค้า", "Goods")}{fx ? " (" + rec.currency + " @" + rec.fxRate + ")" : ""}</span><span className="acc-num">฿{money(rec.goodsThb)}</span></div>
          {landed > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("อากร + ขนส่ง", "Duty + freight")}</span><span className="acc-num">฿{money(landed)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("ภาษีซื้อ", "Input VAT")}</span><span className="acc-num">฿{money(rec.vatThb)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", borderTop: "1px solid var(--line)", marginTop: 4, fontWeight: 700, fontSize: 16 }}><span>{t("รวมจ่ายทั้งสิ้น", "Total paid")}</span><span className="acc-num">฿{money(rec.totalThb)}</span></div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{t("ชำระโดย ", "Paid by ")}{pay}</div>
        </div>

        {adj && onAdjustLanded && !rec.voided && (
          <div className="card" style={{ padding: "10px 12px", marginTop: 10 }}>
            <b style={{ fontSize: 13.5 }}>✏️ {t("แก้ค่าเรือ/อากร (บิลมาทีหลัง)", "Adjust freight/duty (bill arrived later)")}</b>
            <div className="faint" style={{ fontSize: 12, margin: "4px 0 8px" }}>{t("ปรับต้นทุนเข้าของล็อตนี้ — ของที่ยังไม่ขายจะแก้ต้นทุนให้ตรง ส่วนที่ขายไปแล้วลงเป็น “ปรับราคาทุน” ให้อัตโนมัติ", "Corrects this lot's landed cost — unsold stock is repriced, the already-sold part is booked as a cost adjustment")}</div>
            <div className="field" style={{ marginBottom: 8 }}><label>{t("ค่าขนส่ง/เรือ รวม (บาท)", "Total freight (THB)")}</label><input className="input r" inputMode="decimal" value={af} onChange={(e) => setAf(e.target.value)} placeholder="0.00" /></div>
            {(Array.isArray(rec.items) ? rec.items : []).map((i, idx) => (
              <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name || i.productId} · {i.qty} {t("ชิ้น", "pcs")}</span>
                <span className="faint" style={{ fontSize: 11.5 }}>{t("อากร ฿", "duty ฿")}</span>
                <input className="input r" style={{ width: 90 }} inputMode="decimal" value={ad[idx] != null ? ad[idx] : ""} onChange={(e) => setAd((arr) => arr.map((v, j) => (j === idx ? e.target.value : v)))} placeholder="0" />
              </div>
            ))}
            <div className="field" style={{ margin: "8px 0" }}><label>{t("จ่ายค่าส่วนที่เพิ่มโดย", "Pay the added amount by")}</label>
              <select className="input" value={apay} onChange={(e) => setApay(e.target.value)}>
                <option value="ap">{t("ตั้งเป็นเจ้าหนี้ (ยังไม่จ่าย)", "Payable (unpaid)")}</option>
                <option value="cash">{t("เงินสด", "Cash")}</option>
                <option value="transfer">{t("โอน/ธนาคาร", "Bank transfer")}</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-sm" onClick={() => setAdj(false)}>{t("ยกเลิก", "Cancel")}</button>
              <button className="btn btn-sm btn-primary" onClick={() => { const p = (v) => { const n = parseFloat(String(v).replace(/,/g, "")); return isNaN(n) ? 0 : n; }; onAdjustLanded(rec.id, p(af), ad.map(p), apay); onClose(); }}>{t("บันทึกปรับต้นทุน", "Apply adjustment")}</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {onDelete && !rec.voided ? <button className="btn btn-sm btn-danger" onClick={() => { onDelete(rec); onClose(); }}>{t("ยกเลิกบิลซื้อ", "Cancel purchase")}</button> : (rec.voided ? <span style={{ background: "#c0392b", color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: 12 }}>{t("ยกเลิกแล้ว", "Cancelled")}</span> : <span />)}
            {onAdjustLanded && !rec.voided && !adj && <button className="btn btn-sm" onClick={() => setAdj(true)}>✏️ {t("แก้ค่าเรือ/อากร", "Freight/duty")}</button>}
          </div>
          <button className="btn btn-sm" onClick={onClose}>{t("ปิด", "Close")}</button>
        </div>
      </div>
    </div>
  );
}

function PurchaseBillsList({ t, lang, purchases, banks, money, onDelete, canDelete, onPrintVoucher, onHistory }) {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [view, setView] = useState(null);
  const PAGE = 50;
  const rows = [...(purchases || [])].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.docNo || "").localeCompare(a.docNo || ""));
  const qq = norm(q);
  const filt = rows.filter((p) => {
    if (qq && !tokMatch([p.docNo, p.supplier, p.supplierTaxId, p.currency, p.receiveStock ? "สต๊อก stock" : "ค่าใช้จ่าย expense"].filter(Boolean).join(" "), qq)) return false;
    const d = (p.date || "").slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
  useEffect(() => { setPage(0); }, [q, from, to]);
  const pageCount = Math.max(1, Math.ceil(filt.length / PAGE));
  const pg = Math.min(page, pageCount - 1);
  const shown = filt.slice(pg * PAGE, pg * PAGE + PAGE);
  const totalVat = filt.filter((p) => !p.voided).reduce((a, p) => a + (Number(p.vatThb) || 0), 0);
  const totalPaid = filt.filter((p) => !p.voided).reduce((a, p) => a + (Number(p.totalThb) || 0), 0);
  return (
    <div>
      <div className="section-title">{t("บิลซื้อ / นำเข้า", "Purchase bills")}</div>
      <div className="section-sub">{t("รายการบิลซื้อและนำเข้าทั้งหมด — แตะเพื่อดูรายละเอียดสินค้า ต้นทุน ภาษีซื้อ และผู้ขาย", "All purchase & import bills — tap to view items, costs, input VAT, and the supplier")}</div>
      <div className="kpi-grid" style={{ margin: "12px 0" }}>
        <div className="kpi"><div className="kpi-label">{t("จำนวนบิล", "Bills")}</div><div className="kpi-val acc-num">{filt.length}</div></div>
        <div className="kpi"><div className="kpi-label">{t("ภาษีซื้อรวม", "Total input VAT")}</div><div className="kpi-val">฿{money(totalVat)}</div></div>
        <div className="kpi"><div className="kpi-label">{t("ยอดจ่ายรวม", "Total paid")}</div><div className="kpi-val">฿{money(totalPaid)}</div></div>
      </div>
      <div className="card card-pad">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("ค้นหา เลขที่บิล / ผู้ขาย / สกุลเงิน", "Search doc no. / supplier / currency")} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
          <span className="muted" style={{ fontSize: 12.5 }}>{t("ช่วงวันที่", "Dates")}</span>
          <DateInput className="input" style={{ flex: "1 1 130px", minWidth: 120 }} value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="muted">–</span>
          <DateInput className="input" style={{ flex: "1 1 130px", minWidth: 120 }} value={to} onChange={(e) => setTo(e.target.value)} />
          {(from || to) && <button className="btn btn-sm" onClick={() => { setFrom(""); setTo(""); }}>{t("ล้าง", "Clear")}</button>}
        </div>
        {filt.length === 0 ? (
          <div className="empty" style={{ marginTop: 12 }}>{rows.length === 0 ? t("ยังไม่มีบิลซื้อ", "No purchase bills yet") : t("ไม่พบบิลซื้อตามเงื่อนไข", "No matching purchase bills")}</div>
        ) : (
          <>
            <div className="table-scroll" style={{ marginTop: 12 }}>
              <table className="t">
                <thead><tr><th>{t("วันที่", "Date")}</th><th>{t("เลขที่", "No.")}</th><th>{t("ผู้ขาย", "Supplier")}</th><th className="r">{t("สกุล", "Cur.")}</th><th className="r">{t("ภาษีซื้อ", "VAT")}</th><th className="r">{t("รวม (บาท)", "Total")}</th><th className="r">{t("จัดการ", "Actions")}</th></tr></thead>
                <tbody>
                  {shown.map((p) => (
                    <tr key={p.id}>
                      <td>{fmtDate(p.date)}</td>
                      <td className="code">{p.docNo || "—"}{p.voided ? <span style={{ marginLeft: 6, color: "#fff", background: "#c0392b", borderRadius: 5, padding: "0 6px", fontSize: 11 }}>{t("ยกเลิก", "Cancelled")}</span> : null}</td>
                      <td>{p.supplier || "—"}{p.receiveStock ? "" : " · " + t("ค่าใช้จ่าย", "expense")}</td>
                      <td className="r">{p.currency}{p.currency !== "THB" ? " @" + p.fxRate : ""}</td>
                      <td className="r acc-num">฿{money(p.vatThb)}</td>
                      <td className="r acc-num">฿{money(p.totalThb)}</td>
                      <td className="r" style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-sm" onClick={() => setView(p)}>{t("เปิด", "Open")}</button>{" "}
                        {onHistory && <button className="btn btn-sm" title={t("ดูประวัติย้อนหลัง", "History")} onClick={() => onHistory(p)}>🕘</button>}{" "}
                        {!p.voided && (p.isVat !== undefined ? !p.isVat : !(Number(p.vatThb) > 0)) && onPrintVoucher && <><button className="btn btn-sm" onClick={() => onPrintVoucher(p)}>🧾 {t("ใบสำคัญรับเงิน", "Voucher")}</button>{" "}</>}
                        {!p.voided && canDelete && <button className="btn btn-sm btn-danger" onClick={() => onDelete(p)}>{t("ยกเลิก", "Cancel")}</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager t={t} page={pg} pageCount={pageCount} total={filt.length} onPage={setPage} />
          </>
        )}
      </div>
      {view && <PurchaseModal t={t} lang={lang} rec={view} banks={banks} money={money} onClose={() => setView(null)} onDelete={canDelete ? onDelete : null} onAdjustLanded={onAdjustLanded} />}
    </div>
  );
}

function ClaimPicker({ t, options, onPick }) {
  const [sel, setSel] = useState("");
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <select className="input" style={{ flex: "1 1 220px" }} value={sel} onChange={(e) => setSel(e.target.value)}>
        <option value="">{t("— เลือก serial ตัวใหม่ —", "— pick replacement serial —")}</option>
        {options.map((s) => <option key={s.serial} value={s.serial}>{s.serial}</option>)}
      </select>
      <button className="btn btn-sm btn-primary" disabled={!sel} onClick={() => onPick(sel)}>{t("ยืนยันเคลม", "Confirm claim")}</button>
    </div>
  );
}

function SerialRegistry({ t, lang, products, sales, customers, money, showCost, onClaim, onUpdateProduct }) {
  const [prodId, setProdId] = useState("all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [claimRow, setClaimRow] = useState(null);
  const [wmEdit, setWmEdit] = useState("");

  const serialProducts = (products || []).filter((p) => p.tracksSerial && (p.serials || []).length);

  // serial -> sale info (date / bill / customer) from sales history
  const saleInfo = {};
  (sales || []).forEach((sl) => (Array.isArray(sl.items) ? sl.items : []).forEach((it) => {
    if (it.serial) {
      const k = norm(it.serial);
      if (!saleInfo[k]) {
        const cust = sl.customer && (sl.customer.name || sl.customer.th) ? (sl.customer.name || sl.customer.th) : "";
        saleInfo[k] = { date: sl.date, billNo: sl.billNo, customer: cust };
      }
    }
  }));

  const today = todayISO();
  const monthsAdd = (iso, m) => { if (!iso || !m) return null; const d = new Date(iso); if (isNaN(d.getTime())) return null; d.setMonth(d.getMonth() + Number(m)); return d.toISOString().slice(0, 10); };
  const daysLeft = (endIso) => { if (!endIso) return null; return Math.round((new Date(endIso).getTime() - new Date(today).getTime()) / 86400000); };

  const rows = [];
  serialProducts.forEach((p) => {
    if (prodId !== "all" && p.id !== prodId) return;
    const wm = Number(p.warrantyMonths) || 0;
    const pname = lang === "en" ? (p.en || p.th) : (p.th || p.en);
    (p.serials || []).forEach((s) => {
      const si = saleInfo[norm(s.serial)];
      const soldAt = s.soldAt || (si && si.date) || s.replaceSoldAt || null;
      const customer = (si && si.customer) || s.replaceCustomer || "";
      const wEnd = soldAt && wm ? monthsAdd(soldAt, wm) : null;
      const dleft = wEnd ? daysLeft(wEnd) : null;
      const inStock = s.status === "in";
      rows.push({
        p, serial: s.serial, productName: pname, addedAt: s.addedAt, cost: (s.cost != null ? s.cost : p.cost),
        soldAt, customer, wEnd, dleft, inStock, sold: !inStock, inWarranty: wEnd ? dleft >= 0 : false,
        isReplacement: !!s.replaces, wasClaimed: !!s.replacedBy, replacedBy: s.replacedBy, replaces: s.replaces,
      });
    });
  });

  const qq = norm(q);
  const filtered = rows.filter((r) => {
    if (qq && !tokMatch([r.serial, r.productName, r.customer].filter(Boolean).join(" "), qq)) return false;
    if (status === "in" && !r.inStock) return false;
    if (status === "sold" && !r.sold) return false;
    if (status === "inwarranty" && !(r.sold && r.inWarranty)) return false;
    if (status === "expired" && !(r.sold && r.wEnd && !r.inWarranty)) return false;
    if (status === "claimed" && !(r.wasClaimed || r.isReplacement)) return false;
    return true;
  }).sort((a, b) => (b.soldAt || b.addedAt || "").localeCompare(a.soldAt || a.addedAt || ""));

  const cIn = rows.filter((r) => r.inStock).length;
  const cSold = rows.filter((r) => r.sold).length;
  const cWar = rows.filter((r) => r.sold && r.inWarranty).length;

  const selProduct = prodId !== "all" ? serialProducts.find((p) => p.id === prodId) : null;
  useEffect(() => { setWmEdit(selProduct ? String(selProduct.warrantyMonths || "") : ""); /* eslint-disable-next-line */ }, [prodId]);

  const replacementOptions = claimRow ? (claimRow.p.serials || []).filter((s) => s.status === "in" && norm(s.serial) !== norm(claimRow.serial)) : [];
  const doClaim = (newSerial) => {
    if (!newSerial || !claimRow) return;
    onClaim({ productId: claimRow.p.id, oldSerial: claimRow.serial, newSerial, origSoldAt: claimRow.soldAt, origCustomer: claimRow.customer });
    setClaimRow(null);
  };

  const chip = (bg, col) => ({ background: bg, color: col, padding: "2px 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" });
  const badge = (r) => {
    if (r.inStock) return <span style={chip("#E7F0E7", "#2f6b35")}>{t("ในสต๊อก", "In stock")}</span>;
    if (r.wasClaimed) return <span style={chip("#F3E7E7", "#8a3b3b")}>{t("เคลมแล้ว", "Claimed")} → {r.replacedBy}</span>;
    return <span style={chip("#E7E9F2", "#3C4673")}>{t("ขายแล้ว", "Sold")}{r.isReplacement ? " (" + t("ตัวเปลี่ยน", "repl.") + ")" : ""}</span>;
  };
  const warBadge = (r) => {
    if (!r.sold) return <span className="faint">—</span>;
    if (!r.wEnd) return <span className="faint">{t("ไม่ได้ตั้งประกัน", "no warranty")}</span>;
    return r.inWarranty
      ? <span style={{ color: "#2f6b35", fontWeight: 600 }}>{t("ในประกัน", "In warranty")} · {fmtDate(r.wEnd)} <span className="faint">({r.dleft} {t("วัน", "d")})</span></span>
      : <span style={{ color: "#8a3b3b", fontWeight: 600 }}>{t("หมดประกัน", "Expired")} · {fmtDate(r.wEnd)}</span>;
  };

  return (
    <div>
      <div className="section-title">{t("ทะเบียน Serial / ประกัน", "Serial registry / warranty")}</div>
      <div className="section-sub">{t("ตามรอยสินค้ารายเครื่อง: เข้า → ทุน → ขายเมื่อไร → ขายใคร → ประกัน → เคลม", "Track each unit: received → cost → sold when/to whom → warranty → claims")}</div>

      <div className="kpi-grid" style={{ margin: "12px 0" }}>
        <div className="kpi"><div className="kpi-label">{t("ในสต๊อก", "In stock")}</div><div className="kpi-val acc-num">{cIn}</div></div>
        <div className="kpi"><div className="kpi-label">{t("ขายแล้ว", "Sold")}</div><div className="kpi-val acc-num">{cSold}</div></div>
        <div className="kpi"><div className="kpi-label">{t("ยังอยู่ในประกัน", "In warranty")}</div><div className="kpi-val acc-num">{cWar}</div></div>
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <select className="input" style={{ flex: "1 1 200px" }} value={prodId} onChange={(e) => setProdId(e.target.value)}>
            <option value="all">{t("ทุกสินค้าที่มี serial", "All serial products")}</option>
            {serialProducts.map((p) => <option key={p.id} value={p.id}>{lang === "en" ? (p.en || p.th) : (p.th || p.en)}</option>)}
          </select>
          <input className="input" style={{ flex: "1 1 160px" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("ค้นหา serial / ลูกค้า", "Search serial / customer")} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {[["all", "ทั้งหมด", "All"], ["in", "ในสต๊อก", "In stock"], ["sold", "ขายแล้ว", "Sold"], ["inwarranty", "ในประกัน", "In warranty"], ["expired", "หมดประกัน", "Expired"], ["claimed", "เคลม", "Claims"]].map(([k, th, en]) => (
            <button key={k} className={"btn btn-sm" + (status === k ? " btn-primary" : "")} onClick={() => setStatus(k)}>{t(th, en)}</button>
          ))}
        </div>

        {selProduct && (
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "#f3f3f6", padding: "8px 10px", borderRadius: 8 }}>
            <span style={{ fontSize: 13 }}>{t("ประกันของรุ่นนี้", "Warranty for this model")}:</span>
            <input className="input r" style={{ width: 80 }} inputMode="numeric" value={wmEdit} onChange={(e) => setWmEdit(e.target.value)} placeholder="0" />
            <span style={{ fontSize: 13 }}>{t("เดือน (นับจากวันขาย)", "months (from sale date)")}</span>
            <button className="btn btn-sm btn-primary" onClick={() => onUpdateProduct(selProduct.id, () => ({ warrantyMonths: Number(wmEdit) || 0 }))}>{t("บันทึก", "Save")}</button>
            {selProduct.warrantyMonths ? <span className="faint" style={{ fontSize: 12 }}>{t("ตอนนี้", "now")}: {selProduct.warrantyMonths} {t("เดือน", "mo.")}</span> : <span className="faint" style={{ fontSize: 12 }}>{t("ยังไม่ตั้ง", "not set")}</span>}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty" style={{ marginTop: 12 }}>{serialProducts.length === 0 ? t("ยังไม่มีสินค้าที่ติดตาม serial", "No serial-tracked products yet") : t("ไม่พบรายการตามเงื่อนไข", "No matching units")}</div>
        ) : (
          <div className="table-scroll" style={{ marginTop: 12 }}>
            <table className="t">
              <thead><tr>
                <th>Serial</th>
                <th>{t("สินค้า", "Product")}</th>
                <th>{t("เข้าเมื่อ", "In")}</th>
                {showCost && <th className="r">{t("ทุน", "Cost")}</th>}
                <th>{t("ขายเมื่อ", "Sold")}</th>
                <th>{t("ขายใคร", "Customer")}</th>
                <th>{t("ประกัน", "Warranty")}</th>
                <th>{t("สถานะ", "Status")}</th>
                <th className="r"></th>
              </tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.p.id + "|" + r.serial}>
                    <td className="code">{r.serial}{r.replaces ? <div className="faint" style={{ fontSize: 11 }}>← {r.replaces}</div> : null}</td>
                    <td>{r.productName}</td>
                    <td>{fmtDate(r.addedAt)}</td>
                    {showCost && <td className="r acc-num">฿{money(r.cost)}</td>}
                    <td>{r.soldAt ? fmtDate(r.soldAt) : <span className="faint">—</span>}</td>
                    <td>{r.customer || <span className="faint">—</span>}</td>
                    <td>{warBadge(r)}</td>
                    <td>{badge(r)}</td>
                    <td className="r">{r.sold && !r.wasClaimed && <button className="btn btn-sm" onClick={() => setClaimRow(r)}>🔧 {t("เคลม", "Claim")}</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {claimRow && (
        <Portal>
          <div className="inv-overlay" style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "8vh 12px 12px", overflow: "auto" }} onClick={() => setClaimRow(null)}>
            <div onClick={(e) => e.stopPropagation()} className="card card-pad" style={{ background: "#fff", width: "100%", maxWidth: 470, borderRadius: 10 }}>
              <div className="section-title" style={{ marginTop: 0 }}>{t("เคลมสินค้า", "Warranty claim")}</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
                {t("ตัวเดิม", "Old unit")}: <b className="code">{claimRow.serial}</b><br />
                {t("ลูกค้า", "Customer")}: {claimRow.customer || "—"} · {t("ขายเมื่อ", "sold")} {claimRow.soldAt ? fmtDate(claimRow.soldAt) : "—"}<br />
                <span className="faint">{t("เลือก serial ตัวใหม่ที่ส่งให้ลูกค้าแทน — ประกันนับต่อจากวันขายเดิม และตัดสต๊อกตัวใหม่ออกให้", "Pick the replacement serial sent to the customer — warranty continues from the original sale date; the new unit leaves stock")}</span>
              </div>
              {replacementOptions.length === 0 ? (
                <div className="empty">{t("ไม่มี serial ในสต๊อกของรุ่นนี้ให้เปลี่ยน — รับเข้าสต๊อกก่อน", "No in-stock serials of this model — receive stock first")}</div>
              ) : (
                <ClaimPicker t={t} options={replacementOptions} onPick={doClaim} />
              )}
              <div style={{ marginTop: 12, textAlign: "right" }}>
                <button className="btn btn-sm" onClick={() => setClaimRow(null)}>{t("ปิด", "Close")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function PaymentVoucher({ t, lang, purchase, profile, money, onClose }) {
  const p = purchase || {};
  const [name, setName] = useState(p.supplier || "");
  const [addr, setAddr] = useState(p.supplierAddress || "");
  const [idno, setIdno] = useState(p.supplierTaxId || "");
  const items = Array.isArray(p.items) ? p.items : [];
  const goods = (Number(p.goodsThb) || 0) || items.reduce((a, it) => a + (Number(it.lineThb) || 0), 0);
  const duty = Number(p.dutyThb) || 0;
  const freight = Number(p.freightThb) || 0;
  const total = Number(p.totalThb) || (goods + duty + freight);
  const line = "____________________";
  const td = { border: "1px solid #444", padding: "5px 7px", fontSize: 12.5, verticalAlign: "top" };
  const tdR = { ...td, textAlign: "right", whiteSpace: "nowrap" };
  const tdC = { ...td, textAlign: "center", whiteSpace: "nowrap" };
  const inp = { border: "none", borderBottom: "1px dotted #888", background: "transparent", color: "#111", font: "inherit", padding: "0 3px" };
  return (
    <Portal>
    <div className="inv-overlay" style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "4vh 12px 12px", overflow: "auto" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 820 }}>
        <div className="inv-toolbar" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <span className="inv-hint" style={{ marginRight: "auto", fontSize: 12, color: "#fff", opacity: .9 }}>{t("กรอกเลขบัตร/ที่อยู่ผู้รับเงินให้ครบ → พิมพ์ → ให้ผู้รับเซ็น แล้วแนบสลิปโอนเงิน", "Fill in the recipient's ID/address → print → have them sign → attach the transfer slip")}</span>
          <button className="btn btn-sm btn-primary" onClick={() => window.print()}>🖨 {t("พิมพ์ / บันทึก PDF", "Print / Save PDF")}</button>
          <button className="btn btn-sm" onClick={onClose}>{t("ปิด", "Close")}</button>
        </div>
        <div className="inv-sheet doc-sheet" style={{ background: "#fff", color: "#111", padding: "0.45in 0.5in", borderRadius: 8, fontSize: 12.5, lineHeight: 1.55, minHeight: "9.8in", display: "flex", flexDirection: "column" }}>

          {/* payer header (company) */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{profile.shopName || "บริษัท ไทยคัลเลอร์ จำกัด"}</div>
            {profile.shopAddress ? <div style={{ fontSize: 11.5, marginTop: 2 }}>{profile.shopAddress}</div> : null}
            <div style={{ fontSize: 11.5, marginTop: 2 }}>
              {profile.taxId ? "เลขประจำตัวผู้เสียภาษี " + profile.taxId : ""}{profile.taxId && profile.phone ? "   " : ""}{profile.phone ? "โทร. " + profile.phone : ""}
            </div>
          </div>

          {/* title */}
          <div style={{ textAlign: "center", margin: "12px 0 2px" }}>
            <div style={{ fontWeight: 700, fontSize: 19 }}>ใบสำคัญรับเงิน</div>
            <div style={{ fontSize: 11.5 }}>(ใช้แทนใบเสร็จรับเงิน กรณีผู้รับเงินไม่สามารถออกใบเสร็จได้)</div>
          </div>

          {/* doc no + date */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginTop: 8 }}>
            <div>เลขที่บิล {p.docNo || "—"}</div>
            <div>วันที่ {fmtDate(p.date)}</div>
          </div>

          {/* recipient */}
          <div style={{ marginTop: 8, border: "1px solid #444", padding: "8px 10px" }}>
            <div style={{ marginBottom: 5 }}><b>ข้าพเจ้า (ผู้รับเงิน)</b></div>
            <div style={{ marginBottom: 5 }}>ชื่อ <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...inp, minWidth: 280 }} /></div>
            <div style={{ marginBottom: 5 }}>ที่อยู่ <input value={addr} onChange={(e) => setAddr(e.target.value)} style={{ ...inp, minWidth: 420 }} placeholder="—" /></div>
            <div>เลขบัตรประชาชน / เลขผู้เสียภาษี <input value={idno} onChange={(e) => setIdno(e.target.value)} style={{ ...inp, minWidth: 220 }} placeholder="—" /></div>
          </div>

          {/* items table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th style={{ ...tdC, width: "8%" }}>ลำดับ</th>
                <th style={{ ...td, textAlign: "left" }}>รายการ</th>
                <th style={{ ...tdR, width: "12%" }}>จำนวน</th>
                <th style={{ ...tdR, width: "20%" }}>จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map((it, i) => (
                <tr key={i}>
                  <td style={tdC}>{i + 1}</td>
                  <td style={td}>{it.name || "—"}</td>
                  <td style={tdR}>{it.qty != null ? it.qty : ""}</td>
                  <td style={tdR}>{money(Number(it.lineThb) || 0)}</td>
                </tr>
              )) : (
                <tr><td style={tdC}>1</td><td style={td}>{p.supplier ? "ค่าสินค้า/บริการ จาก " + p.supplier : "ค่าสินค้า/บริการ"}</td><td style={tdR}></td><td style={tdR}>{money(goods)}</td></tr>
              )}
              {duty > 0 ? <tr><td style={tdC}></td><td style={{ ...td, textAlign: "right" }}>ภาษีนำเข้า / อากร</td><td style={tdR}></td><td style={tdR}>{money(duty)}</td></tr> : null}
              {freight > 0 ? <tr><td style={tdC}></td><td style={{ ...td, textAlign: "right" }}>ค่าขนส่ง</td><td style={tdR}></td><td style={tdR}>{money(freight)}</td></tr> : null}
              <tr style={{ fontWeight: 700, background: "#f6f6f6" }}>
                <td style={{ ...td, textAlign: "right" }} colSpan={3}>รวมเงินทั้งสิ้น</td>
                <td style={tdR}>{money(total)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ border: "1px solid #444", borderTop: "none", padding: "5px 8px", fontSize: 12.5 }}>
            จำนวนเงิน (ตัวอักษร) <b>( {bahtText(total)} )</b>
          </div>

          {/* certification (รับรองแทนใบเสร็จ) */}
          <div style={{ marginTop: 12, fontSize: 11.5, border: "1px dashed #888", padding: "8px 10px", background: "#fafafa", lineHeight: 1.5 }}>
            ข้าพเจ้าผู้รับเงินขอรับรองว่าได้รับเงินตามรายการข้างต้นไว้ถูกต้องครบถ้วนจริง และในกรณีที่ไม่สามารถออกใบเสร็จรับเงินได้ ผู้จ่ายเงิน (บริษัทฯ) ขอรับรองว่ารายจ่ายนี้ได้จ่ายไปเพื่อกิจการจริง และไม่อาจเรียกใบเสร็จรับเงินจากผู้รับเงินได้
          </div>

          {/* signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: "auto", paddingTop: 30, textAlign: "center", fontSize: 12.5 }}>
            <div style={{ flex: 1 }}>
              <div>ลงชื่อ {line}</div>
              <div style={{ marginTop: 4 }}>( {name || line} )</div>
              <div>ผู้รับเงิน</div>
              <div style={{ marginTop: 4 }}>วันที่ {line}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div>ลงชื่อ {line}</div>
              <div style={{ marginTop: 4 }}>( {line} )</div>
              <div>ผู้จ่ายเงิน / ผู้อนุมัติ</div>
              <div style={{ marginTop: 4 }}>วันที่ {line}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </Portal>
  );
}

function Portal({ children }) { return (typeof document !== "undefined" && document.body) ? createPortal(children, document.body) : children; }

/* ============ Sales documents: Quotation -> Sales Order -> Delivery Note ============ */
const DOC_KINDS = {
  quote: { th: "ใบเสนอราคา", en: "Quotation", abbr: "QT", next: "order" },
  order: { th: "ใบสั่งขาย", en: "Sales Order", abbr: "SO", next: "delivery" },
  delivery: { th: "ใบส่งของ / ใบกำกับการขนส่ง", en: "Delivery Note", abbr: "DN", next: "invoice" },
  invoice: { th: "ใบแจ้งหนี้", en: "Invoice", abbr: "INV", next: null },
};
function docNoGen(docs, kind, date) {
  const sameKind = (docs || []).filter((d) => d.kind === kind);
  if (sameKind.length) {
    const last = sameKind[sameKind.length - 1];
    const bumped = last && last.no ? incDocNo(last.no) : null;
    if (bumped) return bumped;
  }
  const ab = DOC_KINDS[kind].abbr;
  const ym = String(date || todayISO()).slice(2, 7).replace("-", "");
  return ab + ym + "-001";
}

function DocModal({ t, lang, doc, profile, money, vatRate = VAT_RATE, onClose }) {
  if (!doc) return null;
  const K = DOC_KINDS[doc.kind] || DOC_KINDS.quote;
  const title = lang === "en" ? K.en : K.th;
  const tot = computeSaleTotals({ items: doc.items || [], discountType: doc.discountType, discountValue: doc.discountValue, vatEnabled: doc.vatEnabled, vatRate });
  const blankRows = Math.max(0, 10 - (doc.items || []).length);
  return (
    <Portal>
    <div className="inv-overlay" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "4vh 12px 12px", overflow: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 800 }}>
        <div className="inv-toolbar" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
          <button className="btn btn-sm btn-primary" onClick={() => window.print()}>🖨 {t("พิมพ์ / บันทึก PDF", "Print / Save PDF")}</button>
          <button className="btn btn-sm" onClick={onClose}>{t("ปิด", "Close")}</button>
        </div>
        <div className="inv-sheet doc-sheet" style={{ background: "#fff", color: "#1c1b16", padding: "0.3in", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{profile.shopName || "บริษัท ไทยคัลเลอร์ จำกัด"}</div>
              {profile.shopAddress ? <div>{profile.shopAddress}</div> : null}
              {profile.taxId ? <div>{t("เลขประจำตัวผู้เสียภาษี ", "Tax ID ")}{profile.taxId}{profile.branch ? " · " + profile.branch : ""}</div> : null}
              {profile.phone ? <div>{t("โทร ", "Tel ")}{profile.phone}</div> : null}
            </div>
            {profile.logo ? <img src={profile.logo} alt="logo" style={{ maxWidth: 150, maxHeight: 80, objectFit: "contain" }} /> : null}
          </div>
          <div style={{ textAlign: "center", fontSize: 19, fontWeight: 700, margin: "16px 0 4px" }}>{title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 14, fontSize: 12.5 }}>
            <div style={{ border: "1px solid #d8d2c4", borderRadius: 6, padding: "8px 10px", flex: 1 }}>
              <div style={{ color: "#7a7464", fontSize: 11 }}>{t("ลูกค้า", "Customer")}</div>
              <div style={{ fontWeight: 600 }}>{(doc.customer && doc.customer.name) || "—"}</div>
              {doc.customer && doc.customer.taxId ? <div>{t("เลขผู้เสียภาษี ", "Tax ID ")}{doc.customer.taxId}{doc.customer.branch ? " · " + doc.customer.branch : ""}</div> : null}
              {doc.customer && doc.customer.address ? <div>{doc.customer.address}</div> : null}
            </div>
            <div style={{ fontSize: 12.5, textAlign: "right", minWidth: 150 }}>
              <div>{t("เลขที่ ", "No. ")}<b>{doc.no}</b></div>
              <div>{t("วันที่ ", "Date ")}{fmtDate(doc.date)}</div>
              {doc.kind === "quote" && doc.validDays ? <div>{t("ยืนราคา ", "Valid ")}{doc.validDays} {t("วัน", "days")}</div> : null}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14, fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "#f1ede1" }}>
                <th style={{ border: "1px solid #d8d2c4", padding: "6px 8px", width: 34 }}>#</th>
                <th style={{ border: "1px solid #d8d2c4", padding: "6px 8px", textAlign: "left" }}>{t("รายการ", "Description")}</th>
                <th style={{ border: "1px solid #d8d2c4", padding: "6px 8px", width: 60 }}>{t("จำนวน", "Qty")}</th>
                <th style={{ border: "1px solid #d8d2c4", padding: "6px 8px", width: 90, textAlign: "right" }}>{t("ราคา/หน่วย", "Unit")}</th>
                <th style={{ border: "1px solid #d8d2c4", padding: "6px 8px", width: 100, textAlign: "right" }}>{t("จำนวนเงิน", "Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {(doc.items || []).map((l, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #d8d2c4", padding: "6px 8px", textAlign: "center" }}>{i + 1}</td>
                  <td style={{ border: "1px solid #d8d2c4", padding: "6px 8px" }}>{l.name}{l.serial ? " (S/N " + l.serial + ")" : ""}</td>
                  <td style={{ border: "1px solid #d8d2c4", padding: "6px 8px", textAlign: "center" }}>{l.qty}</td>
                  <td style={{ border: "1px solid #d8d2c4", padding: "6px 8px", textAlign: "right" }}>{money(l.price)}</td>
                  <td style={{ border: "1px solid #d8d2c4", padding: "6px 8px", textAlign: "right" }}>{money((Number(l.qty) || 0) * (Number(l.price) || 0))}</td>
                </tr>
              ))}
              {Array.from({ length: blankRows }).map((_, i) => (
                <tr key={"b" + i}><td style={{ border: "1px solid #d8d2c4", padding: "6px 8px", height: 22 }}>&nbsp;</td><td style={{ border: "1px solid #d8d2c4" }}></td><td style={{ border: "1px solid #d8d2c4" }}></td><td style={{ border: "1px solid #d8d2c4" }}></td><td style={{ border: "1px solid #d8d2c4" }}></td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <div style={{ width: 260, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("รวมเป็นเงิน", "Subtotal")}</span><span>{money(tot.subtotal)}</span></div>
              {tot.discountAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("ส่วนลด", "Discount")}</span><span>-{money(tot.discountAmt)}</span></div>}
              {doc.vatEnabled && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("มูลค่าก่อน VAT", "Before VAT")}</span><span>{money(tot.base)}</span></div>}
              {doc.vatEnabled && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>VAT {+(vatRate * 100).toFixed(2)}%</span><span>{money(tot.vat)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", borderTop: "2px solid #1c1b16", marginTop: 4, fontWeight: 700, fontSize: 15 }}><span>{t("ยอดรวมสุทธิ", "Total")}</span><span>฿{money(tot.total)}</span></div>
            </div>
          </div>
          {doc.note ? <div style={{ marginTop: 12, fontSize: 12, color: "#555" }}>{t("หมายเหตุ: ", "Note: ")}{doc.note}</div> : null}
          <div style={{ display: "flex", justifyContent: doc.kind === "delivery" ? "space-between" : "center", marginTop: 120, fontSize: 12 }}>
            {doc.kind === "delivery" && <div style={{ textAlign: "center", flex: 1 }}>____________________<div>{t("ผู้รับสินค้า / Received by", "Received by")}</div></div>}
            <div style={{ textAlign: "center", flex: doc.kind === "delivery" ? 1 : "0 0 auto", minWidth: 230 }}>____________________<div>{doc.kind === "delivery" ? t("ผู้ส่งสินค้า / Delivered by", "Delivered by") : (doc.kind === "quote" ? t("ผู้เสนอราคา / Quoted by", "Quoted by") : t("ผู้มีอำนาจลงนาม / Authorized", "Authorized"))}</div></div>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}

function SalesDocs({ t, lang, docs, customers, products, profile, banks, money, vatRate = VAT_RATE, onSave, onDelete, onSaveCustomer, onIssueBill, acctLevel = 3, onHistory }) {
  const pname = (p) => (lang === "th" ? p.th : lang === "en" ? p.en : `${p.th} / ${p.en}`);
  const blankLine = () => ({ key: uid(), productId: null, name: "", qty: 1, price: "", _sug: false });
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [kind, setKind] = useState("quote");
  const [date, setDate] = useState(todayISO());
  const [custId, setCustId] = useState("");
  const [custForm, setCustForm] = useState({ name: "", taxId: "", branch: "สำนักงานใหญ่", address: "", phone: "" });
  const [vatEnabled, setVatEnabled] = useState(true);
  const [discType, setDiscType] = useState("amount");
  const [discVal, setDiscVal] = useState("");
  const [note, setNote] = useState("");
  const [validDays, setValidDays] = useState("7");
  const [lines, setLines] = useState([blankLine()]);
  const [flash, setFlash] = useState(null);

  const setLine = (k, patch) => setLines((ls) => ls.map((l) => (l.key === k ? { ...l, ...patch } : l)));
  const addLine = () => setLines((ls) => [...ls, blankLine()]);
  const delLine = (k) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== k) : ls));
  const pickProd = (k, p) => setLine(k, { productId: p.id, name: pname(p), price: Number(p.price) || 0, _sug: false });
  const reset = () => { setKind("quote"); setDate(todayISO()); setCustId(""); setCustForm({ name: "", taxId: "", branch: "สำนักงานใหญ่", address: "", phone: "" }); setVatEnabled(true); setDiscType("amount"); setDiscVal(""); setNote(""); setValidDays("7"); setLines([blankLine()]); };

  const itemsOf = () => lines.filter((l) => (l.name || "").trim() && (Number(l.qty) || 0) > 0).map((l) => ({ productId: l.productId, name: l.name.trim(), qty: Number(l.qty) || 0, price: Number(String(l.price).replace(/,/g, "")) || 0, cost: (products.find((p) => p.id === l.productId) || {}).cost || 0 }));

  const save = () => {
    const items = itemsOf();
    if (!items.length) { setFlash({ type: "err", msg: t("ใส่รายการอย่างน้อย 1 บรรทัด", "Add at least one line") }); return; }
    let customer = null, cid = custId || "";
    if (custId) customer = customers.find((c) => c.id === custId) || null;
    else if ((custForm.name || "").trim()) {
      customer = { name: custForm.name.trim(), taxId: (custForm.taxId || "").trim(), branch: custForm.branch ?? "สำนักงานใหญ่", address: custForm.address || "", phone: custForm.phone || "" };
      const saved = onSaveCustomer ? onSaveCustomer({ id: uid(), ...customer }) : null;
      if (saved && saved.id) cid = saved.id;
    }
    const d = { id: uid(), kind, no: docNoGen(docs, kind, date), date, customerId: cid, customer, items, vatEnabled, discountType: discType, discountValue: Number(discVal) || 0, note: note.trim(), validDays: kind === "quote" ? (Number(validDays) || 0) : 0, status: "open", createdAt: todayISO() };
    onSave(d);
    setFlash({ type: "ok", msg: t("บันทึก ", "Saved ") + DOC_KINDS[kind][lang === "en" ? "en" : "th"] + " " + d.no });
    reset(); setOpen(false);
  };

  const convertNext = (d) => {
    const nk = DOC_KINDS[d.kind].next;
    if (!nk) return;
    const nd = { ...d, id: uid(), kind: nk, no: docNoGen(docs, nk, todayISO()), date: todayISO(), sourceId: d.id, sourceNo: d.no, status: "open", createdAt: todayISO() };
    onSave(nd);
    onSave({ ...d, status: "converted", convertedTo: nd.no });
    setFlash({ type: "ok", msg: t("สร้าง ", "Created ") + DOC_KINDS[nk][lang === "en" ? "en" : "th"] + " " + nd.no + t(" จาก ", " from ") + d.no });
  };

  const rows = [...docs].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.no || "").localeCompare(a.no || ""));
  const filt = filter === "all" ? rows : rows.filter((d) => d.kind === filter);
  const totOf = (d) => computeSaleTotals({ items: d.items || [], discountType: d.discountType, discountValue: d.discountValue, vatEnabled: d.vatEnabled, vatRate }).total;

  return (
    <div>
      <div className="section-title">{t("เอกสารขาย", "Sales documents")}</div>
      <div className="section-sub">{t("ใบเสนอราคา → ใบสั่งขาย → ใบส่งของ — สร้าง พิมพ์ แปลงเป็นเอกสารถัดไป หรือออกเป็นบิลขายจริง (ยังไม่ลงบัญชีจนกว่าจะออกบิล)", "Quotation → Sales Order → Delivery Note — create, print, convert to the next step, or issue as a real bill (no journal until billed)")}</div>

      <div className="toolbar" style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => { setOpen((o) => !o); setFlash(null); }}>{open ? t("ปิดฟอร์ม", "Close") : "+ " + t("สร้างเอกสารใหม่", "New document")}</button>
        <span className="muted" style={{ fontSize: 13 }}>{docs.length} {t("ฉบับ", "docs")}</span>
      </div>

      {flash && <div className={"flash " + (flash.type === "err" ? "err" : "")} style={{ marginTop: 10 }}>{flash.msg}</div>}

      {open && (
        <div className="card card-pad" style={{ marginTop: 12, marginBottom: 16 }}>
          <div className="row2">
            <div className="field"><label>{t("ประเภทเอกสาร", "Document type")}</label>
              <select className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
                {Object.keys(DOC_KINDS).map((k) => <option key={k} value={k}>{DOC_KINDS[k][lang === "en" ? "en" : "th"]}</option>)}
              </select>
            </div>
            <div className="field"><label>{t("วันที่", "Date")}</label><DateInput className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          </div>
          <div className="field"><label>{t("ลูกค้า (พิมพ์เพื่อค้นหารายเดิม หรือกรอกใหม่)", "Customer (type to search or fill new)")}</label>
            <NameSuggest value={custForm.name}
              onChange={(v) => { setCustForm({ ...custForm, name: v }); setCustId(""); }}
              options={(customers || []).map((c) => ({ label: c.name, meta: [c.taxId, c.phone].filter(Boolean).join(" · "), c }))}
              onPick={(o) => { setCustId(o.c.id); setCustForm({ name: o.c.name || "", taxId: o.c.taxId || "", branch: o.c.branch ?? "สำนักงานใหญ่", address: o.c.address || "", phone: o.c.phone || "" }); }}
              placeholder={t("ชื่อลูกค้า / บริษัท", "customer / company")} />
          </div>
          <div className="row2">
            <div className="field"><label>{t("เลขผู้เสียภาษี", "Tax ID")}</label><input className="input" inputMode="numeric" value={custForm.taxId} onChange={(e) => setCustForm({ ...custForm, taxId: e.target.value })} placeholder="0000000000000" /></div>
            <div className="field"><label>{t("โทรศัพท์", "Phone")}</label><input className="input" value={custForm.phone} onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })} /></div>
          </div>
          <div className="field"><label>{t("ที่อยู่ลูกค้า", "Customer address")}</label><input className="input" value={custForm.address} onChange={(e) => setCustForm({ ...custForm, address: e.target.value })} /></div>

          <div className="line-head" style={{ margin: "10px 0 6px", fontSize: 14 }}>{t("รายการ", "Line items")}</div>
          <div className="table-scroll">
            <table className="t">
              <thead><tr><th>{t("สินค้า / รายการ", "Item")}</th><th style={{ width: 70 }}>{t("จำนวน", "Qty")}</th><th style={{ width: 110 }}>{t("ราคา/หน่วย", "Unit price")}</th><th className="r" style={{ width: 100 }}>{t("รวม", "Amount")}</th><th style={{ width: 34 }}></th></tr></thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.key}>
                    <td>
                      <div className="sug-wrap">
                        <input className="input" value={l.name} onChange={(e) => setLine(l.key, { name: e.target.value, productId: null, _sug: true })} onFocus={() => setLine(l.key, { _sug: true })} onBlur={() => setTimeout(() => setLine(l.key, { _sug: false }), 150)} placeholder={t("พิมพ์เพื่อค้นหาสินค้า หรือพิมพ์ชื่อรายการเอง", "type to find a product or free text")} />
                        {l._sug && !l.productId && (l.name || "").trim().length >= 1 && (() => {
                          const nq = norm(l.name);
                          const pm = products.filter((p) => tokMatch([p.th, p.en, p.sku, p.barcode].filter(Boolean).join(" "), nq)).slice(0, 8);
                          return pm.length ? <div className="sug-list" style={{ position: "static", marginTop: 4 }}>{pm.map((p) => <div key={p.id} className="sug-item" onMouseDown={(e) => { e.preventDefault(); pickProd(l.key, p); }}><span className="sug-name">{pname(p)}</span><span className="sug-meta">฿{money(p.price)}</span></div>)}</div> : null;
                        })()}
                      </div>
                    </td>
                    <td><input className="input qty-input" inputMode="decimal" value={l.qty} onChange={(e) => setLine(l.key, { qty: e.target.value })} /></td>
                    <td><input className="input r" inputMode="decimal" value={l.price} onChange={(e) => setLine(l.key, { price: e.target.value })} placeholder="0.00" /></td>
                    <td className="r acc-num">{money((Number(l.qty) || 0) * (Number(String(l.price).replace(/,/g, "")) || 0))}</td>
                    <td className="c"><button className="icon-btn" onClick={() => delLine(l.key)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={addLine}>+ {t("เพิ่มบรรทัด", "Add line")}</button>

          <div className="row2" style={{ marginTop: 10 }}>
            <div className="field"><label>{t("ส่วนลด", "Discount")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select className="select" style={{ maxWidth: 110 }} value={discType} onChange={(e) => setDiscType(e.target.value)}><option value="amount">{t("บาท", "THB")}</option><option value="percent">%</option></select>
                <input className="input r" inputMode="decimal" value={discVal} onChange={(e) => setDiscVal(e.target.value)} placeholder="0" />
              </div>
            </div>
            {kind === "quote" ? <div className="field"><label>{t("ยืนราคา (วัน)", "Valid (days)")}</label><input className="input" inputMode="numeric" value={validDays} onChange={(e) => setValidDays(e.target.value.replace(/\D/g, ""))} /></div> : <div className="field" />}
          </div>
          <label className="checkrow"><input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} />{t("รวมภาษีมูลค่าเพิ่ม (VAT)", "Include VAT")}</label>
          <div className="field"><label>{t("หมายเหตุ", "Note")}</label><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("เงื่อนไขการชำระเงิน ฯลฯ", "payment terms, etc.")} /></div>
          <button className="btn btn-primary" style={{ marginTop: 4 }} onClick={save}>💾 {t("บันทึกเอกสาร", "Save document")}</button>
        </div>
      )}

      <div className="langtoggle" role="group" style={{ width: "fit-content", margin: "4px 0 12px" }}>
        {[["all", t("ทั้งหมด", "All")], ["quote", t("เสนอราคา", "Quotes")], ["order", t("สั่งขาย", "Orders")], ["delivery", t("ส่งของ", "Delivery")], ["invoice", t("ใบแจ้งหนี้", "Invoices")]].map(([k, lbl]) => (
          <button key={k} className={"langbtn" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{lbl}</button>
        ))}
      </div>

      <div className="card card-pad">
        {filt.length === 0 ? <div className="empty">{t("ยังไม่มีเอกสาร", "No documents yet")}</div> : (
          <div className="table-scroll">
            <table className="t">
              <thead><tr><th>{t("ประเภท", "Type")}</th><th>{t("เลขที่", "No.")}</th><th>{t("วันที่", "Date")}</th><th>{t("ลูกค้า", "Customer")}</th><th className="r">{t("ยอดรวม", "Total")}</th><th>{t("สถานะ", "Status")}</th><th className="r">{t("จัดการ", "Actions")}</th></tr></thead>
              <tbody>
                {filt.slice(0, 300).map((d) => (
                  <tr key={d.id}>
                    <td>{DOC_KINDS[d.kind] ? DOC_KINDS[d.kind][lang === "en" ? "en" : "th"] : d.kind}</td>
                    <td className="code">{d.no}{d.voided ? <span style={{ marginLeft: 6, color: "#fff", background: "#c0392b", borderRadius: 5, padding: "0 6px", fontSize: 11 }}>{t("ยกเลิก", "Cancelled")}</span> : null}</td>
                    <td>{fmtDate(d.date)}</td>
                    <td>{(d.customer && d.customer.name) || "—"}</td>
                    <td className="r acc-num">฿{money(totOf(d))}</td>
                    <td>{d.status === "converted" ? <span className="faint">{t("แปลงแล้ว→", "converted→")}{d.convertedTo}</span> : <span style={{ color: "var(--green)" }}>{t("เปิดอยู่", "open")}</span>}</td>
                    <td className="r" style={{ whiteSpace: "nowrap" }}>
                      <button className="btn btn-sm" onClick={() => setView(d)}>{t("เปิด", "Open")}</button>{" "}
                      {onHistory && <button className="btn btn-sm" title={t("ดูประวัติย้อนหลัง", "History")} onClick={() => onHistory(d)}>🕘</button>}{" "}
                      {!d.voided && DOC_KINDS[d.kind].next && <button className="btn btn-sm" title={t("สร้าง", "create") + " " + DOC_KINDS[DOC_KINDS[d.kind].next][lang === "en" ? "en" : "th"]} onClick={() => convertNext(d)}>→ {DOC_KINDS[DOC_KINDS[d.kind].next].abbr}</button>}{" "}
                      {!d.voided && <button className="btn btn-sm btn-primary" title={t("ออกเป็นบิลขาย", "issue as a bill")} onClick={() => onIssueBill(d)}>{t("ออกบิล", "Bill")}</button>}{" "}
                      {!d.voided && <button className="btn btn-sm btn-danger" onClick={() => onDelete(d.id)}>{t("ยกเลิก", "Cancel")}</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {view && <DocModal t={t} lang={lang} doc={view} profile={profile} money={money} vatRate={vatRate} onClose={() => setView(null)} />}
    </div>
  );
}

/* ================== Marketplace (Shopee/Lazada) settlement ================== */
function Marketplace({ t, lang, sales, banks, money, onSettleBatch, onUnsettleBatch, onCancel, onShowInvoice }) {
  const [tabp, setTabp] = useState("pending");
  const [sel, setSel] = useState([]);
  const [recv, setRecv] = useState("");
  const [bankId, setBankId] = useState("");
  const [date, setDate] = useState(todayISO());

  const mp = (sales || []).filter((s) => s && (s.channel === "shopee" || s.channel === "lazada"));
  const pending = mp.filter((s) => !s.settle).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const settledBills = mp.filter((s) => s.settle);
  const heldShopee = pending.filter((s) => s.channel === "shopee").reduce((a, s) => a + (Number(s.total) || 0), 0);
  const heldLazada = pending.filter((s) => s.channel === "lazada").reduce((a, s) => a + (Number(s.total) || 0), 0);
  const plat = (s) => (s.channel === "lazada" ? "Lazada" : "Shopee");
  const bankName = (id) => { const b = (banks || []).find((x) => x.id === id); return b ? (b.bank || b.bankName || "") + " " + (b.last4 || b.accountNo || "") : "—"; };
  const bill = (s) => Number(s.total) || 0;
  const estFee = (s) => Number(s.platformFee) || 0;

  const selSet = new Set(sel);
  const toggle = (id) => setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const allSel = pending.length > 0 && pending.every((s) => selSet.has(s.id));
  const toggleAll = () => setSel(allSel ? [] : pending.map((s) => s.id));
  const selBills = pending.filter((s) => selSet.has(s.id));
  const sumBill = round2(selBills.reduce((a, s) => a + bill(s), 0));
  const sumFee = round2(selBills.reduce((a, s) => a + estFee(s), 0));
  const expected = round2(sumBill - sumFee);
  const recvNum = parseFloat(String(recv).replace(/,/g, "")) || 0;
  const diff = round2(expected - recvNum);
  const matched = Math.abs(diff) <= 1;

  const save = () => {
    if (!selBills.length) { window.alert(t("เลือกบิลที่อยู่ในรอบโอนนี้ก่อน", "Select the bills in this payout first")); return; }
    if (!isFinite(parseFloat(String(recv).replace(/,/g, "")))) { window.alert(t("ใส่ยอดเงินที่เข้าบัญชีจริง", "Enter the amount actually deposited")); return; }
    if (!matched && !window.confirm(t("⚠️ ยอดเข้าจริงไม่ตรงกับที่คาดไว้\n\nคาดว่าจะเข้า ฿" + money(expected) + "\n(ยอดบิลรวม ฿" + money(sumBill) + " − ค่าธรรมเนียมที่กรอกตอนขาย ฿" + money(sumFee) + ")\nเงินเข้าจริงที่กรอก ฿" + money(recvNum) + " — ต่าง ฿" + money(Math.abs(diff)) + "\n\nยืนยันบันทึกตามเงินเข้าจริงไหม? ระบบจะลงค่าธรรมเนียมจริง = ฿" + money(round2(sumBill - recvNum)), "⚠️ Deposit doesn't match expected. Continue with the actual amount?"))) return;
    onSettleBatch(sel, { received: parseFloat(String(recv).replace(/,/g, "")), bankId, date });
    setSel([]); setRecv("");
  };

  const batches = {};
  settledBills.forEach((s) => {
    const b = (s.settle && s.settle.batchId) || s.id;
    if (!batches[b]) batches[b] = { batchId: b, date: s.settle.date, bankId: s.settle.bankId, plat: plat(s), bills: [], sumBill: 0, received: 0, fee: 0 };
    batches[b].bills.push(s); batches[b].sumBill += bill(s); batches[b].received += Number(s.settle.received) || 0; batches[b].fee += Number(s.settle.fee) || 0;
  });
  const batchList = Object.values(batches).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div>
      <div className="section-title">{t("ขายออนไลน์ Shopee / Lazada", "Online sales — Shopee / Lazada")}</div>
      <div className="section-sub">{t("แพลตฟอร์มโอนรวบหลายบิลมาเป็นก้อน — เลือกบิลในรอบโอน กรอกเงินเข้าจริง ระบบรีเช็คกับค่าธรรมเนียมที่กรอกตอนขาย ถ้าไม่ตรงจะเตือน", "Platforms pay out many bills in one lump — pick the bills, enter the real deposit, and it reconciles against the fees you entered at sale.")}</div>

      <div className="kpi-grid" style={{ margin: "12px 0 14px" }}>
        <div className="kpi" style={{ borderLeft: "4px solid var(--green)" }}><div className="kpi-label">{t("ยอดรอรับรวม", "Total awaiting")}</div><div className="kpi-val">฿{money(heldShopee + heldLazada)}</div><div className="faint" style={{ fontSize: 11.5 }}>{pending.length} {t("ออเดอร์", "orders")}</div></div>
        <div className="kpi"><div className="kpi-label">Shopee</div><div className="kpi-val">฿{money(heldShopee)}</div></div>
        <div className="kpi"><div className="kpi-label">Lazada</div><div className="kpi-val">฿{money(heldLazada)}</div></div>
      </div>

      <div className="langtoggle" role="group" style={{ width: "fit-content", margin: "10px 0" }}>
        {[["pending", t("รอรับเงิน", "Awaiting") + " (" + pending.length + ")"], ["settled", t("รับเงินแล้ว", "Settled") + " (" + batchList.length + ")"]].map(([k, lbl]) => (
          <button key={k} className={"langbtn" + (tabp === k ? " on" : "")} onClick={() => { setTabp(k); setSel([]); }}>{lbl}</button>
        ))}
      </div>

      {tabp === "pending" ? (
        <div className="card card-pad">
          <div className="line-head" style={{ marginBottom: 8 }}>{t("ติ๊กเลือกบิลที่อยู่ในรอบโอนเดียวกัน", "Tick the bills paid out together")}</div>
          {pending.length === 0 ? <div className="empty">{t("ไม่มีออเดอร์รอรับเงิน", "Nothing awaiting settlement")}</div> : (
            <>
              <div className="table-scroll">
                <table className="t">
                  <thead><tr>
                    <th style={{ width: 30 }}><input type="checkbox" checked={allSel} onChange={toggleAll} /></th>
                    <th>{t("บิล", "Bill")}</th><th>{t("วันที่", "Date")}</th><th>{t("ช่องทาง", "Platform")}</th><th>{t("ลูกค้า", "Customer")}</th>
                    <th className="r">{t("ยอดบิล", "Bill")}</th><th className="r">{t("ค่าธรรมเนียม", "Fee")}</th><th className="r"></th>
                  </tr></thead>
                  <tbody>
                    {pending.map((s) => (
                      <tr key={s.id} style={{ background: selSet.has(s.id) ? "var(--green-soft)" : "transparent" }}>
                        <td><input type="checkbox" checked={selSet.has(s.id)} onChange={() => toggle(s.id)} /></td>
                        <td><button className="btn btn-sm" style={{ padding: "2px 8px" }} onClick={() => onShowInvoice(s)}>{s.billNo}</button></td>
                        <td>{fmtDate(s.date)}</td>
                        <td>{plat(s)}</td>
                        <td>{(s.customer && s.customer.name) || t("ลูกค้าทั่วไป", "Walk-in")}</td>
                        <td className="r acc-num">฿{money(bill(s))}</td>
                        <td className="r acc-num faint">฿{money(estFee(s))}</td>
                        <td className="r"><button className="btn btn-sm btn-danger" onClick={() => { if (window.confirm(t("ลูกค้ายกเลิกออเดอร์นี้? บิลจะถูกยกเลิก สต๊อกคืน และบัญชีย้อนกลับ", "Customer cancelled? The bill is voided, stock restored and the entry reversed."))) onCancel(s); }}>{t("ยกเลิก", "Cancel")}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selBills.length > 0 && (
                <div style={{ marginTop: 12, border: "1px solid var(--green)", borderRadius: 10, padding: "12px 14px", background: "var(--green-soft)" }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{t("รับเงินรวบยอด", "Record lump settlement")} — {selBills.length} {t("บิล", "bills")}</div>
                  <div style={{ fontSize: 13, marginBottom: 10 }}>
                    {t("ยอดบิลรวม", "Total bills")} <b>฿{money(sumBill)}</b> − {t("ค่าธรรมเนียม(กรอกตอนขาย)", "fees (from sale)")} <b>฿{money(sumFee)}</b> = {t("คาดว่าจะเข้า", "expected deposit")} <b style={{ color: "var(--green)" }}>฿{money(expected)}</b>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="field" style={{ margin: 0 }}><label>{t("เงินเข้าบัญชีจริง (ยอดก้อน)", "Actual lump deposit")}</label><input className="input r" style={{ width: 150 }} inputMode="decimal" value={recv} onChange={(e) => setRecv(e.target.value)} placeholder={money(expected)} /></div>
                    <div className="field" style={{ margin: 0 }}><label>{t("เข้าบัญชี", "Bank")}</label><select className="select" style={{ width: 160 }} value={bankId} onChange={(e) => setBankId(e.target.value)}><option value="">—</option>{(banks || []).map((b) => <option key={b.id} value={b.id}>{(b.bank || b.bankName || "")} {b.last4 || b.accountNo || ""}</option>)}</select></div>
                    <div className="field" style={{ margin: 0 }}><label>{t("วันที่เงินเข้า", "Date")}</label><DateInput className="input" style={{ width: 150 }} value={date} onChange={(e) => setDate(e.target.value)} /></div>
                    <button className="btn btn-primary" onClick={save}>{t("บันทึกรับเงินรวบยอด", "Save settlement")}</button>
                  </div>
                  {recv !== "" && (
                    <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, color: matched ? "var(--green)" : "var(--red)" }}>
                      {matched
                        ? "✓ " + t("เงินเข้าจริงตรงกับที่คาด", "Deposit matches expected")
                        : "⚠️ " + t("ต่างจากที่คาด ฿", "Differs from expected ฿") + money(Math.abs(diff)) + " — " + (diff > 0 ? t("เข้าน้อยกว่าคาด (ค่าธรรมเนียมจริงมากกว่าที่กรอก?)", "less than expected (actual fee higher?)") : t("เข้ามากกว่าคาด", "more than expected")) + " — " + t("เช็คยอดโอนอีกครั้ง", "re-check the payout")}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="card card-pad">
          <div className="line-head" style={{ marginBottom: 8 }}>{t("รอบที่รับเงินแล้ว (รวบยอด)", "Settled payouts")}</div>
          {batchList.length === 0 ? <div className="empty">{t("ยังไม่มีรายการรับเงิน", "Nothing settled yet")}</div> : (
            <div className="table-scroll">
              <table className="t">
                <thead><tr><th>{t("วันรับเงิน", "Settled")}</th><th>{t("ช่องทาง", "Platform")}</th><th className="r">{t("จำนวนบิล", "Bills")}</th><th className="r">{t("ยอดบิลรวม", "Bills")}</th><th className="r">{t("เงินเข้า", "Deposit")}</th><th className="r">{t("ค่าธรรมเนียม", "Fee")}</th><th>{t("บัญชี", "Bank")}</th><th className="r"></th></tr></thead>
                <tbody>
                  {batchList.map((b) => (
                    <tr key={b.batchId}>
                      <td>{fmtDate(b.date)}</td>
                      <td>{b.plat}</td>
                      <td className="r acc-num">{b.bills.length}</td>
                      <td className="r acc-num">฿{money(round2(b.sumBill))}</td>
                      <td className="r acc-num">฿{money(round2(b.received))}</td>
                      <td className="r acc-num">฿{money(round2(b.fee))}</td>
                      <td>{bankName(b.bankId)}</td>
                      <td className="r"><button className="btn btn-sm" onClick={() => { if (window.confirm(t("ยกเลิกการรับเงินรอบนี้? (" + b.bills.length + " บิลกลับไปสถานะรอรับ)", "Undo this payout? (" + b.bills.length + " bills back to awaiting)"))) onUnsettleBatch(b.batchId); }}>{t("ยกเลิกรับเงิน", "Undo")}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================== Receivables (A/R) & Payables (A/P) with aging ================== */
function Receivables({ t, lang, sales, payments, purchases, apPayments, customers, banks, money, onAddPayment, onDeletePayment, onAddApPayment, onDeleteApPayment, onShowInvoice }) {
  const [side, setSide] = useState("ar"); // 'ar' | 'ap'
  const [expand, setExpand] = useState(null);
  const [payAmt, setPayAmt] = useState("");
  const [payDate, setPayDate] = useState(todayISO());
  const [payChan, setPayChan] = useState("transfer");
  const [payBank, setPayBank] = useState("");
  const bankName = (id) => { const b = (banks || []).find((x) => x.id === id); return b ? b.bank + " " + (b.last4 || "") : ""; };
  const ageDays = (d) => Math.max(0, Math.floor((Date.parse(todayISO()) - Date.parse(String(d || todayISO()).slice(0, 10))) / 86400000));
  const bucketOf = (days) => days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3;
  const BUCKETS = [t("1–30 วัน", "1–30 d"), t("31–60 วัน", "31–60 d"), t("61–90 วัน", "61–90 d"), t("เกิน 90 วัน", "90+ d")];

  const isAR = side === "ar";
  const docs = isAR
    ? (sales || []).filter((s) => s.channel === "credit").map((s) => ({ id: s.id, no: s.billNo, date: s.date, who: (s.customer && s.customer.name) || t("ลูกค้าทั่วไป", "Walk-in"), total: Number(s.total) || 0, raw: s }))
    : (purchases || []).filter((p) => p.payChannel === "credit").map((p) => ({ id: p.id, no: p.docNo || "—", date: p.date, who: p.supplier || "—", total: Number(p.totalThb) || 0, raw: p }));
  const paidOf = (id) => (isAR ? payments : apPayments).filter((x) => x.refId === id);
  const sumPaid = (id) => paidOf(id).reduce((a, x) => a + (Number(x.amount) || 0), 0);

  const open = docs.map((d) => ({ ...d, paid: sumPaid(d.id), out: Math.max(0, d.total - sumPaid(d.id)) })).filter((d) => d.out > 0.005);
  const open2 = [...open].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const totalOut = open.reduce((a, d) => a + d.out, 0);
  const aging = [0, 0, 0, 0];
  open.forEach((d) => { aging[bucketOf(ageDays(d.date))] += d.out; });

  const recordPay = (d) => {
    const amt = parseFloat(String(payAmt).replace(/,/g, ""));
    if (!isFinite(amt) || amt <= 0) { window.alert(t("ใส่จำนวนเงิน", "Enter an amount")); return; }
    if (amt > d.out + 0.005) { if (!window.confirm(t("จำนวนมากกว่ายอดค้าง รับเกิน?", "More than outstanding. Continue?"))) return; }
    const rec = { id: uid(), refId: d.id, date: payDate || todayISO(), amount: amt, channel: payChan, bankId: payChan === "transfer" ? payBank : "" };
    (isAR ? onAddPayment : onAddApPayment)(rec);
    setPayAmt(""); setExpand(null);
  };

  return (
    <div>
      <div className="section-title">{t("ลูกหนี้ / เจ้าหนี้การค้า", "Receivables / Payables")}</div>
      <div className="section-sub">{t("ติดตามยอดค้างชำระจากการขายเชื่อและซื้อเชื่อ พร้อมรายงานอายุหนี้ และบันทึกรับ/จ่ายชำระ", "Track outstanding from credit sales & purchases, with aging and receipt/payment recording")}</div>

      <div className="langtoggle" role="group" style={{ width: "fit-content", margin: "10px 0" }}>
        {[["ar", t("ลูกหนี้ (ขายเชื่อ)", "Receivables")], ["ap", t("เจ้าหนี้ (ซื้อเชื่อ)", "Payables")]].map(([k, lbl]) => (
          <button key={k} className={"langbtn" + (side === k ? " on" : "")} onClick={() => { setSide(k); setExpand(null); }}>{lbl}</button>
        ))}
      </div>

      <div className="kpi-grid" style={{ marginBottom: 14 }}>
        <div className="kpi" style={{ borderLeft: "4px solid var(--" + (isAR ? "green" : "red") + ")" }}>
          <div className="kpi-label">{isAR ? t("ลูกหนี้คงค้างรวม", "Total receivable") : t("เจ้าหนี้คงค้างรวม", "Total payable")}</div>
          <div className="kpi-val">฿{money(totalOut)}</div>
          <div className="faint" style={{ fontSize: 11.5 }}>{open.length} {t("รายการ", "items")}</div>
        </div>
        {aging.map((v, i) => <div className="kpi" key={i}><div className="kpi-label">{BUCKETS[i]}</div><div className="kpi-val">฿{money(v)}</div></div>)}
      </div>

      <div className="card card-pad">
        <div className="line-head" style={{ marginBottom: 8 }}>{isAR ? t("รายการลูกหนี้คงค้าง", "Outstanding receivables") : t("รายการเจ้าหนี้คงค้าง", "Outstanding payables")}</div>
        {open2.length === 0 ? <div className="empty">{t("ไม่มียอดค้างชำระ", "Nothing outstanding")}</div> : (
          <div className="table-scroll">
            <table className="t">
              <thead><tr><th>{t("เลขที่", "No.")}</th><th>{t("วันที่", "Date")}</th><th>{isAR ? t("ลูกค้า", "Customer") : t("ผู้ขาย", "Supplier")}</th><th className="r">{t("อายุ(วัน)", "Age")}</th><th className="r">{t("ยอดบิล", "Total")}</th><th className="r">{t("ชำระแล้ว", "Paid")}</th><th className="r">{t("คงค้าง", "Outstanding")}</th><th className="r"></th></tr></thead>
              <tbody>
                {open2.map((d) => (
                  <React.Fragment key={d.id}>
                    <tr>
                      <td className="code">{isAR ? <a style={{ color: "var(--green)", cursor: "pointer" }} onClick={() => onShowInvoice && onShowInvoice(d.raw)}>{d.no}</a> : d.no}</td>
                      <td>{fmtDate(d.date)}</td>
                      <td>{d.who}</td>
                      <td className="r acc-num">{ageDays(d.date)}</td>
                      <td className="r acc-num">฿{money(d.total)}</td>
                      <td className="r acc-num">{d.paid ? money(d.paid) : "—"}</td>
                      <td className="r acc-num" style={{ fontWeight: 700, color: "var(--" + (isAR ? "green" : "red") + ")" }}>฿{money(d.out)}</td>
                      <td className="r"><button className="btn btn-sm btn-primary" onClick={() => { setExpand(expand === d.id ? null : d.id); setPayAmt(String(d.out.toFixed(2))); setPayDate(todayISO()); }}>{isAR ? t("รับชำระ", "Receive") : t("จ่ายชำระ", "Pay")}</button></td>
                    </tr>
                    {expand === d.id && (
                      <tr><td colSpan={8} style={{ background: "var(--faint)" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", padding: "8px 4px" }}>
                          <div className="field" style={{ margin: 0 }}><label>{t("จำนวนเงิน", "Amount")}</label><input className="input r" style={{ width: 120 }} inputMode="decimal" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} /></div>
                          <div className="field" style={{ margin: 0 }}><label>{t("วันที่", "Date")}</label><DateInput className="input" style={{ width: 150 }} value={payDate} onChange={(e) => setPayDate(e.target.value)} /></div>
                          <div className="field" style={{ margin: 0 }}><label>{t("ช่องทาง", "Method")}</label><select className="select" style={{ width: 130 }} value={payChan} onChange={(e) => setPayChan(e.target.value)}><option value="transfer">{t("โอน", "Transfer")}</option><option value="cash">{t("เงินสด", "Cash")}</option><option value="cheque">{t("เช็ค", "Cheque")}</option></select></div>
                          {payChan === "transfer" && <div className="field" style={{ margin: 0 }}><label>{t("บัญชี", "Bank")}</label><select className="select" style={{ width: 150 }} value={payBank} onChange={(e) => setPayBank(e.target.value)}><option value="">—</option>{(banks || []).map((b) => <option key={b.id} value={b.id}>{b.bank} {b.last4 || ""}</option>)}</select></div>}
                          <button className="btn btn-sm btn-primary" onClick={() => recordPay(d)}>{t("บันทึกชำระ", "Save payment")}</button>
                        </div>
                        {paidOf(d.id).length > 0 && (
                          <div style={{ padding: "0 4px 8px", fontSize: 12.5 }}>
                            <div className="muted" style={{ marginBottom: 4 }}>{t("ประวัติการชำระ", "Payment history")}</div>
                            {paidOf(d.id).map((x) => (
                              <div key={x.id} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid var(--line)" }}>
                                <span>{fmtDate(x.date)} · {x.channel === "transfer" ? t("โอน ", "transfer ") + bankName(x.bankId) : x.channel === "cheque" ? t("เช็ค", "cheque") : t("เงินสด", "cash")}</span>
                                <span className="acc-num">฿{money(x.amount)} <button className="icon-btn" title={t("ลบ", "delete")} onClick={() => { if (window.confirm(t("ลบรายการชำระนี้?", "Delete this payment?"))) (isAR ? onDeletePayment : onDeleteApPayment)(x.id); }}>×</button></span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{isAR ? t("ลูกหนี้มาจากบิลขายที่เลือกช่องทาง “เครดิต (ลูกหนี้)” ในหน้าขาย", "Receivables come from bills issued with the “Credit (A/R)” channel") : t("เจ้าหนี้มาจากบิลซื้อที่เลือกชำระแบบ “เครดิต (เจ้าหนี้การค้า)” ในหน้าบันทึกซื้อ", "Payables come from purchases recorded with the “Credit (A/P)” payment")}</div>
      </div>
    </div>
  );
}

/* ================== Withholding tax (ภ.ง.ด.1 / 3 / 53) ================== */
const WHT_FORMS = { pnd3: { th: "ภ.ง.ด.3 (บุคคลธรรมดา)", en: "PND.3 (individuals)" }, pnd53: { th: "ภ.ง.ด.53 (นิติบุคคล)", en: "PND.53 (companies)" }, pnd1: { th: "ภ.ง.ด.1 (เงินเดือน/ค่าจ้าง)", en: "PND.1 (salary/wages)" } };
const WHT_TYPES = [
  { th: "ค่าบริการ / รับเหมา", en: "Service / contractor", rate: 3 },
  { th: "ค่าจ้างทำของ", en: "Hire of work", rate: 3 },
  { th: "ค่าวิชาชีพอิสระ", en: "Professional fees", rate: 3 },
  { th: "ค่าเช่าทรัพย์สิน", en: "Rental", rate: 5 },
  { th: "ค่าโฆษณา", en: "Advertising", rate: 2 },
  { th: "ค่าขนส่ง", en: "Transport", rate: 1 },
  { th: "ค่าจ้างแรงงาน (เงินเดือน)", en: "Wages/Salary", rate: 0 },
  { th: "อื่นๆ", en: "Other", rate: 3 },
];
function TaxIdBoxes({ value, n = 13, cw = 16, ch = 20, fs = 12 }) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, n).split("");
  const cells = [];
  for (let i = 0; i < n; i++) cells.push(<span key={i} style={{ display: "inline-block", width: cw, height: ch, border: "1px solid #555", borderRight: i === n - 1 ? "1px solid #555" : "none", textAlign: "center", lineHeight: ch + "px", fontSize: fs }}>{digits[i] || ""}</span>);
  return <span style={{ display: "inline-flex", verticalAlign: "middle" }}>{cells}</span>;
}
function WHTCertModal({ t, lang, rec, profile, money, onClose }) {
  if (!rec) return null;
  const Chk = ({ on, label }) => (<span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 13, fontSize: 12 }}><span style={{ display: "inline-block", width: 13, height: 13, border: "1px solid #333", textAlign: "center", lineHeight: "12px", fontSize: 12 }}>{on ? "✓" : ""}</span>{label}</span>);
  // each income line maps to one official numbered category (1..6) per the 50-bis form
  const catOf = (it) => {
    if (/เงินเดือน|ค่าจ้างแรงงาน|wage|salary/i.test(it)) return 1;
    if (/นายหน้า|ค่าธรรมเนียม|commission|brokerage|^fee/i.test(it)) return 2;
    if (/ลิขสิทธิ์|royalty/i.test(it)) return 3;
    if (/ดอกเบี้ย|เงินปันผล|interest|dividend/i.test(it)) return 4;
    if (/เช่า|วิชาชีพ|โฆษณา|ขนส่ง|บริการ|รับเหมา|จ้างทำของ|รางวัล|ส่วนลด|rent|professional|transport|advertis|service|hire/i.test(it)) return 5;
    return 6;
  };
  const recLines = (rec.lines && rec.lines.length) ? rec.lines : [{ incomeType: rec.incomeType || "", rate: rec.rate || 0, base: rec.base || 0, amount: rec.amount || 0 }];
  const catAgg = {};
  recLines.forEach((ln) => { const c = catOf(ln.incomeType || ""); if (!catAgg[c]) catAgg[c] = { base: 0, amount: 0, txt: [] }; catAgg[c].base += Number(ln.base) || 0; catAgg[c].amount += Number(ln.amount) || 0; if (c === 6 && ln.incomeType) catAgg[c].txt.push(ln.incomeType); });
  const td = { border: "1px solid #444", padding: "7px 7px", fontSize: 11.5, verticalAlign: "top" };
  const tdR = { ...td, textAlign: "right" }, tdC = { ...td, textAlign: "center" };
  const cell = (c) => catAgg[c] || null;
  const Row = ({ no, desc, cat, small }) => { const a = cell(cat); return (
    <tr>
      <td style={{ ...td, fontSize: small ? 11 : 11.5 }}>{no} {desc}{cat === 6 && a && a.txt.length ? a.txt.join(", ") : ""}</td>
      <td style={tdC}>{a ? fmtDate(rec.date) : ""}</td>
      <td style={tdR}>{a ? money(a.base) : ""}</td>
      <td style={tdR}>{a ? money(a.amount) : ""}</td>
    </tr>
  ); };
  const line = "________________________";
  return (
    <Portal>
    <div className="inv-overlay" style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "4vh 12px 12px", overflow: "auto" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 820 }}>
        <div className="inv-toolbar" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
          <button className="btn btn-sm btn-primary" onClick={() => window.print()}>🖨 {t("พิมพ์ / บันทึก PDF", "Print / Save PDF")}</button>
          <button className="btn btn-sm" onClick={onClose}>{t("ปิด", "Close")}</button>
        </div>
        <div className="inv-sheet doc-sheet wht-sheet" style={{ background: "#fff", color: "#111", padding: "0.4in 0.45in", borderRadius: 8, fontSize: 12, lineHeight: 1.5, minHeight: "9.8in", display: "flex", flexDirection: "column" }}>

          {/* header: withholder (left) + เล่ม/เลขที่ (right) */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div><b>ผู้มีหน้าที่หักภาษี ณ ที่จ่าย :</b></div>
              <div style={{ marginTop: 2 }}>ชื่อ {profile.shopName || "บริษัท ไทยคัลเลอร์ จำกัด"}</div>
                <div style={{ marginTop: 2 }}>ที่อยู่ {profile.shopAddress || line + line}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 5 }}>เลขประจำตัวผู้เสียภาษีอากร (13 หลัก) <TaxIdBoxes value={profile.taxId} cw={19} ch={25} fs={14} /></div>
            </div>
            <div style={{ textAlign: "left", fontSize: 13, whiteSpace: "nowrap", paddingTop: 2 }}>
              <div>เลขที่ <b>{rec.certNo || ""}</b></div>
            </div>
          </div>

          {/* title */}
          <div style={{ textAlign: "center", margin: "10px 0 6px" }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>หนังสือรับรองการหักภาษี ณ ที่จ่าย</div>
            <div style={{ fontSize: 12.5 }}>ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร</div>
          </div>

          {/* payee */}
          <div style={{ borderTop: "1px solid #444", paddingTop: 6 }}>
            <div><b>ผู้ถูกหักภาษี ณ ที่จ่าย :</b></div>
            <div style={{ marginTop: 2 }}>ชื่อ {rec.payee || line + line}</div>
            <div style={{ marginTop: 2 }}>ที่อยู่ {rec.payeeAddress || line + line}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 5 }}>เลขประจำตัวผู้เสียภาษีอากร (13 หลัก) <TaxIdBoxes value={rec.payeeTaxId} cw={19} ch={25} fs={14} /></div>
          </div>

          {/* form-type row */}
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontWeight: 600, marginRight: 10 }}>ลำดับที่ ในแบบ</span>
            <Chk on={rec.form === "pnd1"} label="(1) ภ.ง.ด.1ก" />
            <Chk on={false} label="(2) ภ.ง.ด.1ก พิเศษ" />
            <Chk on={false} label="(3) ภ.ง.ด.2" />
            <Chk on={rec.form === "pnd3"} label="(4) ภ.ง.ด.3" />
            <Chk on={false} label="(5) ภ.ง.ด.2ก" />
            <Chk on={false} label="(6) ภ.ง.ด.3ก" />
            <Chk on={rec.form === "pnd53"} label="(7) ภ.ง.ด.53" />
          </div>

          {/* main table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th style={{ ...td, textAlign: "left", width: "58%" }}>ประเภทเงินได้พึงประเมินที่จ่าย</th>
                <th style={{ ...tdC, width: "15%" }}>วัน เดือน<br />ปีภาษี ที่จ่าย</th>
                <th style={{ ...tdR, width: "14%" }}>จำนวนเงิน<br />ที่จ่าย</th>
                <th style={{ ...tdR, width: "13%" }}>ภาษีที่หัก<br />และนำส่งไว้</th>
              </tr>
            </thead>
            <tbody>
              <Row no="1." desc="เงินเดือน ค่าจ้าง เบี้ยเลี้ยง โบนัส ฯลฯ ตามมาตรา 40(1)" cat={1} />
              <Row no="2." desc="ค่าธรรมเนียม ค่านายหน้า ฯลฯ ตามมาตรา 40(2)" cat={2} />
              <Row no="3." desc="ค่าแห่งลิขสิทธิ์ ฯลฯ ตามมาตรา 40(3)" cat={3} />
              <Row no="4." desc="(ก) ดอกเบี้ย ฯลฯ ตามมาตรา 40(4)(ก)  (ข) เงินปันผล เงินส่วนแบ่งกำไร ฯลฯ ตามมาตรา 40(4)(ข)" cat={4} small />
              <Row no="5." desc="การจ่ายเงินได้ที่ต้องหักภาษี ณ ที่จ่าย ตามคำสั่งกรมสรรพากรที่ออกตามมาตรา 3 เตรส เช่น รางวัล ส่วนลด ค่าจ้างทำของ ค่าโฆษณา ค่าเช่า ค่าขนส่ง ค่าบริการ ค่าเบี้ยประกันวินาศภัย ฯลฯ" cat={5} small />
              <Row no="6." desc="อื่นๆ (ระบุ) " cat={6} />
              <tr style={{ fontWeight: 700 }}>
                <td style={{ ...td, textAlign: "right" }}>รวมเงินที่จ่ายและภาษีที่หักนำส่ง</td>
                <td style={td}></td>
                <td style={tdR}>{money(rec.base)}</td>
                <td style={tdR}>{money(rec.amount)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ border: "1px solid #444", borderTop: "none", padding: "5px 7px", fontSize: 12 }}>
            รวมเงินภาษีที่หักนำส่ง (ตัวอักษร) <b>( {bahtText(rec.amount)} )</b>
          </div>

          {/* payer options + funds */}
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontWeight: 600, marginRight: 10 }}>ผู้จ่ายเงิน</span>
            <Chk on={true} label="(1) หัก ณ ที่จ่าย" />
            <Chk on={false} label="(2) ออกให้ตลอดไป" />
            <Chk on={false} label="(3) ออกให้ครั้งเดียว" />
            <Chk on={false} label="(4) อื่นๆ (ระบุ)" />
          </div>
          <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>เงินที่จ่ายเข้า กบข./กสจ./กองทุนสงเคราะห์ครูโรงเรียนเอกชน __________ บาท  กองทุนประกันสังคม __________ บาท  กองทุนสำรองเลี้ยงชีพ __________ บาท</div>

          {/* flexible spacer fills the page down to the footer */}
          <div style={{ flex: "1 1 auto", minHeight: 24 }} />

          {/* warning + certification + signature */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1, fontSize: 10, color: "#555", border: "1px solid #999", padding: "6px 8px" }}>
              <b>คำเตือน</b> ผู้มีหน้าที่ออกหนังสือรับรองการหักภาษี ณ ที่จ่าย ฝ่าฝืนไม่ปฏิบัติตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร ต้องรับโทษทางอาญาตามมาตรา 35 แห่งประมวลรัษฎากร
            </div>
            <div style={{ textAlign: "center", fontSize: 12, minWidth: 280 }}>
              <div style={{ marginBottom: 22 }}>ขอรับรองว่าข้อความและตัวเลขดังกล่าวข้างต้นถูกต้องตรงกับความจริงทุกประการ</div>
              <div>ลงชื่อ ________________________________ ผู้จ่ายเงิน</div>
              <div style={{ marginTop: 12 }}>________ / ________ / ________</div>
              <div style={{ border: "1px dashed #999", width: 130, height: 60, margin: "12px auto 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, color: "#999", textAlign: "center", lineHeight: 1.3 }}>ประทับตรา<br />นิติบุคคล (ถ้ามี)</div>
            </div>
          </div>

          {/* footnote */}
          <div style={{ fontSize: 9.5, color: "#666", marginTop: 12, borderTop: "1px solid #ccc", paddingTop: 6 }}>
            <b>หมายเหตุ</b> เลขประจำตัวผู้เสียภาษีอากร (13 หลัก) หมายถึง 1. กรณีบุคคลธรรมดาไทย ให้ใช้เลขประจำตัวประชาชนของกรมการปกครอง · 2. กรณีนิติบุคคล ให้ใช้เลขทะเบียนนิติบุคคลของกรมพัฒนาธุรกิจการค้า · 3. กรณีอื่นๆ ให้ใช้เลขประจำตัวผู้เสียภาษีอากร (13 หลัก) ของกรมสรรพากร
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}
function WHT({ t, lang, whts, customers, profile, money, onSave, onDelete, onHistory }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [filter, setFilter] = useState("all");
  const [m, setM] = useState(todayISO().slice(0, 7));
  const blankLine = () => ({ key: uid(), typeIdx: 0, rate: WHT_TYPES[0].rate, base: "" });
  const blank = { date: todayISO(), form: "pnd53", certNo: whtCertNo(whts, todayISO()), payee: "", payeeTaxId: "", payeeAddress: "", note: "", lines: [blankLine()] };
  const [f, setF] = useState(blank);
  const [certEdited, setCertEdited] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  // changing the date re-suggests the cert number, unless the user typed their own
  const setDate = (v) => setF((x) => ({ ...x, date: v, certNo: certEdited ? x.certNo : whtCertNo(whts, v) }));
  const num = (v) => { const n = parseFloat(String(v).replace(/,/g, "")); return isFinite(n) ? n : 0; };
  const lineAmt = (ln) => Math.round(num(ln.base) * (Number(ln.rate) || 0)) / 100;
  const setLine = (key, patch) => setF((x) => ({ ...x, lines: x.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)) }));
  const addLine = () => setF((x) => ({ ...x, lines: [...x.lines, blankLine()] }));
  const delLine = (key) => setF((x) => ({ ...x, lines: x.lines.length > 1 ? x.lines.filter((l) => l.key !== key) : x.lines }));
  const totBase = f.lines.reduce((a, l) => a + num(l.base), 0);
  const totAmt = f.lines.reduce((a, l) => a + lineAmt(l), 0);
  const save = () => {
    if (!f.payee.trim()) { window.alert(t("ใส่ชื่อผู้รับเงิน", "Enter the payee")); return; }
    const valid = f.lines.filter((l) => num(l.base) > 0);
    if (!valid.length) { window.alert(t("ใส่จำนวนเงินอย่างน้อย 1 ประเภท", "Enter at least one income line")); return; }
    const lines = valid.map((l) => ({ incomeType: WHT_TYPES[l.typeIdx].th, incomeTypeEn: WHT_TYPES[l.typeIdx].en, rate: Number(l.rate) || 0, base: num(l.base), amount: lineAmt(l) }));
    onSave({ id: uid(), date: f.date || todayISO(), form: f.form, certNo: (f.certNo || "").trim() || whtCertNo(whts, f.date), payee: f.payee.trim(), payeeTaxId: f.payeeTaxId.trim(), payeeAddress: f.payeeAddress.trim(), lines, incomeType: lines.map((l) => l.incomeType + (l.rate ? " " + l.rate + "%" : "")).join(" + "), base: lines.reduce((a, l) => a + l.base, 0), amount: lines.reduce((a, l) => a + l.amount, 0), note: f.note.trim() });
    setF({ ...blank, lines: [blankLine()], date: f.date, form: f.form, certNo: whtCertNo(whts, f.date) }); setCertEdited(false); setOpen(false);
  };
  const rows = [...whts].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const filt = filter === "all" ? rows : rows.filter((w) => w.form === filter);
  const monthRows = whts.filter((w) => !w.voided && String(w.date || "").slice(0, 7) === m);
  const sumByForm = {};
  monthRows.forEach((w) => { const k = w.form; if (!sumByForm[k]) sumByForm[k] = { base: 0, amt: 0, n: 0 }; sumByForm[k].base += Number(w.base) || 0; sumByForm[k].amt += Number(w.amount) || 0; sumByForm[k].n += 1; });

  return (
    <div>
      <div className="section-title">{t("ภาษีหัก ณ ที่จ่าย", "Withholding tax")}</div>
      <div className="section-sub">{t("บันทึกการหักภาษี ณ ที่จ่าย ออกหนังสือรับรอง และสรุปยอดรายเดือนสำหรับยื่น ภ.ง.ด.1 / 3 / 53", "Record withholding, issue certificates, and summarize monthly totals for filing PND.1 / 3 / 53")}</div>

      <div className="toolbar" style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => { const wasOpen = open; setOpen((o) => !o); if (!wasOpen) { setCertEdited(false); setF((x) => ({ ...x, certNo: whtCertNo(whts, x.date) })); } }}>{open ? t("ปิดฟอร์ม", "Close") : "+ " + t("บันทึกการหักภาษี", "Record withholding")}</button>
        <span className="muted" style={{ fontSize: 13 }}>{whts.length} {t("รายการ", "records")}</span>
      </div>

      {open && (
        <div className="card card-pad" style={{ marginTop: 12, marginBottom: 16 }}>
          <div className="row2">
            <div className="field"><label>{t("วันที่จ่าย", "Date paid")}</label><DateInput className="input" value={f.date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="field"><label>{t("แบบยื่น", "Form")}</label><select className="select" value={f.form} onChange={(e) => set("form", e.target.value)}>{Object.keys(WHT_FORMS).map((k) => <option key={k} value={k}>{WHT_FORMS[k][lang === "en" ? "en" : "th"]}</option>)}</select></div>
          </div>
          <div className="field" style={{ maxWidth: 220 }}><label>{t("เลขที่หนังสือรับรอง", "Certificate no.")}</label><input className="input" value={f.certNo} onChange={(e) => { setCertEdited(true); set("certNo", e.target.value); }} placeholder="06/003" /><div className="faint" style={{ fontSize: 11, marginTop: 3 }}>{t("ใส่ให้อัตโนมัติ (เดือน/ลำดับ) — แก้เองได้", "auto-filled (month/running) — editable")}</div></div>
          <div className="field"><label>{t("ผู้รับเงิน (พิมพ์เพื่อค้นหารายเดิม)", "Payee (type to search)")}</label>
            <NameSuggest value={f.payee} onChange={(v) => set("payee", v)}
              options={(customers || []).map((c) => ({ label: c.name, meta: c.taxId || "", c }))}
              onPick={(o) => setF((x) => ({ ...x, payee: o.c.name || "", payeeTaxId: o.c.taxId || "", payeeAddress: o.c.address || "" }))}
              placeholder={t("ชื่อผู้รับเงิน / บริษัท", "payee / company")} />
          </div>
          <div className="row2">
            <div className="field"><label>{t("เลขผู้เสียภาษีผู้รับ", "Payee Tax ID")}</label><input className="input" inputMode="numeric" value={f.payeeTaxId} onChange={(e) => set("payeeTaxId", e.target.value)} placeholder="0000000000000" /></div>
            <div className="field"><label>{t("ที่อยู่ผู้รับ", "Payee address")}</label><input className="input" value={f.payeeAddress} onChange={(e) => set("payeeAddress", e.target.value)} /></div>
          </div>
          <div className="line-head" style={{ margin: "10px 0 6px", fontSize: 13.5 }}>{t("ประเภทเงินได้ (เพิ่มได้หลายอัตรา เช่น ขนส่ง 1% + บริการ 3% — ระบบหักแยกบรรทัดให้)", "Income lines (add several rates, e.g. transport 1% + service 3% — each withheld separately)")}</div>
          <div className="table-scroll">
            <table className="t">
              <thead><tr><th>{t("ประเภทเงินได้", "Income type")}</th><th style={{ width: 78 }}>{t("อัตรา %", "Rate %")}</th><th style={{ width: 120 }}>{t("ฐานเงินได้", "Base")}</th><th className="r" style={{ width: 100 }}>{t("ภาษีที่หัก", "Withheld")}</th><th style={{ width: 34 }}></th></tr></thead>
              <tbody>
                {f.lines.map((ln) => (
                  <tr key={ln.key}>
                    <td>
                      <select className="select" value={ln.typeIdx} onChange={(e) => { const i = Number(e.target.value); setLine(ln.key, { typeIdx: i, rate: WHT_TYPES[i].rate }); }}>
                        {WHT_TYPES.map((ty, i) => <option key={i} value={i}>{lang === "en" ? ty.en : ty.th}{ty.rate ? " (" + ty.rate + "%)" : ""}</option>)}
                      </select>
                    </td>
                    <td><input className="input r" inputMode="decimal" value={ln.rate} onChange={(e) => setLine(ln.key, { rate: e.target.value })} /></td>
                    <td><input className="input r" inputMode="decimal" value={ln.base} onChange={(e) => setLine(ln.key, { base: e.target.value })} placeholder="0.00" /></td>
                    <td className="r acc-num" style={{ fontWeight: 600 }}>{money(lineAmt(ln))}</td>
                    <td className="c"><button className="icon-btn" title={t("ลบบรรทัด", "remove")} onClick={() => delLine(ln.key)}>×</button></td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700 }}>
                  <td className="r" colSpan={2}>{t("รวม", "Total")}</td>
                  <td className="r acc-num">฿{money(totBase)}</td>
                  <td className="r acc-num" style={{ color: "var(--green)" }}>฿{money(totAmt)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={addLine}>+ {t("เพิ่มประเภทเงินได้ / อัตรา", "Add income type / rate")}</button>
          <div style={{ marginTop: 12 }}><button className="btn btn-primary" onClick={save}>💾 {t("บันทึก", "Save")}</button></div>
        </div>
      )}

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13.5, fontWeight: 600 }}>{t("สรุปยื่นภาษีเดือน", "Filing summary for")}</label>
          <input className="input" type="month" style={{ maxWidth: 170 }} value={m} onChange={(e) => setM(e.target.value)} />
        </div>
        {Object.keys(sumByForm).length === 0 ? <div className="faint" style={{ fontSize: 13 }}>{t("ไม่มีรายการในเดือนนี้", "No records this month")}</div> : (
          <div className="kpi-grid">
            {Object.keys(sumByForm).map((k) => (
              <div className="kpi" key={k}><div className="kpi-label">{WHT_FORMS[k][lang === "en" ? "en" : "th"]}</div><div className="kpi-val">฿{money(sumByForm[k].amt)}</div><div className="faint" style={{ fontSize: 11.5 }}>{t("ฐาน ฿", "base ฿")}{money(sumByForm[k].base)} · {sumByForm[k].n} {t("ราย", "items")}</div></div>
            ))}
          </div>
        )}
      </div>

      <div className="langtoggle" role="group" style={{ width: "fit-content", margin: "4px 0 12px" }}>
        {[["all", t("ทั้งหมด", "All")], ["pnd3", "ภ.ง.ด.3"], ["pnd53", "ภ.ง.ด.53"], ["pnd1", "ภ.ง.ด.1"]].map(([k, lbl]) => (
          <button key={k} className={"langbtn" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{lbl}</button>
        ))}
      </div>
      <div className="card card-pad">
        {filt.length === 0 ? <div className="empty">{t("ยังไม่มีรายการ", "No records yet")}</div> : (
          <div className="table-scroll">
            <table className="t">
              <thead><tr><th>{t("วันที่", "Date")}</th><th>{t("แบบ", "Form")}</th><th>{t("ผู้รับเงิน", "Payee")}</th><th>{t("ประเภท", "Type")}</th><th className="r">{t("ฐาน", "Base")}</th><th className="r">{t("หักภาษี", "Withheld")}</th><th className="r">{t("จัดการ", "Actions")}</th></tr></thead>
              <tbody>
                {filt.slice(0, 300).map((w) => (
                  <tr key={w.id}>
                    <td>{fmtDate(w.date)}{w.voided ? <span style={{ marginLeft: 6, color: "#fff", background: "#c0392b", borderRadius: 5, padding: "0 6px", fontSize: 11 }}>{t("ยกเลิก", "Cancelled")}</span> : null}</td>
                    <td>{w.form === "pnd3" ? "ภ.ง.ด.3" : w.form === "pnd53" ? "ภ.ง.ด.53" : "ภ.ง.ด.1"}</td>
                    <td>{w.payee}{w.payeeTaxId ? <div className="faint" style={{ fontSize: 11 }}>{w.payeeTaxId}</div> : null}</td>
                    <td>{w.incomeType}{w.rate ? " " + w.rate + "%" : ""}</td>
                    <td className="r acc-num">฿{money(w.base)}</td>
                    <td className="r acc-num" style={{ fontWeight: 700 }}>฿{money(w.amount)}</td>
                    <td className="r" style={{ whiteSpace: "nowrap" }}><button className="btn btn-sm" onClick={() => setView(w.certNo ? w : { ...w, certNo: whtCertNo(whts.filter((x) => String(x.date || "").slice(0, 7) === String(w.date || "").slice(0, 7)).slice(0, whts.filter((x) => String(x.date || "").slice(0, 7) === String(w.date || "").slice(0, 7)).findIndex((x) => x.id === w.id) + 1), w.date, w.id) })}>{t("ใบรับรอง", "Cert")}</button>{" "}{onHistory && <button className="btn btn-sm" title={t("ดูประวัติย้อนหลัง", "History")} onClick={() => onHistory(w)}>🕘</button>}{" "}{!w.voided && <button className="btn btn-sm btn-danger" onClick={() => onDelete(w.id)}>{t("ยกเลิก", "Cancel")}</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {view && <WHTCertModal t={t} lang={lang} rec={view} profile={profile} money={money} onClose={() => setView(null)} />}
    </div>
  );
}

/* ================== Fixed assets + straight-line depreciation ================== */
const ASSET_CATS = ["อุปกรณ์สำนักงาน", "เครื่องพิมพ์/เครื่องจักร", "คอมพิวเตอร์/ไอที", "เฟอร์นิเจอร์", "ยานพาหนะ", "เครื่องมือช่าง", "อื่นๆ"];
function monthsBetween(fromISO, toISO) {
  const a = new Date(String(fromISO || "").slice(0, 10) + "T00:00:00Z");
  const b = new Date(String(toISO || "").slice(0, 10) + "T00:00:00Z");
  if (isNaN(a) || isNaN(b) || b < a) return 0;
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
}
function depState(as, asOf) {
  const cost = Number(as.cost) || 0, salvage = Number(as.salvage) || 0, life = Number(as.lifeYears) || 0;
  const base = Math.max(0, cost - salvage);
  const perYear = life > 0 ? base / life : 0;
  const perMonth = perYear / 12;
  const end = as.disposed && as.disposeDate ? as.disposeDate : asOf;
  const m = Math.min(monthsBetween(as.acquireDate, end), life * 12);
  const accum = Math.min(base, perMonth * m);
  return { cost, salvage, base, perYear, perMonth, accum, nbv: cost - accum, monthsUsed: m, fullyDep: m >= life * 12 };
}
function FixedAssets({ t, lang, assets, accounts, money, onSave, onDelete, onPostDepreciation, onEnsureAccounts, onHistory }) {
  const [open, setOpen] = useState(false);
  const [asOf, setAsOf] = useState(todayISO());
  const [year, setYear] = useState(todayISO().slice(0, 4));
  const [expand, setExpand] = useState(null);
  const blank = { id: "", name: "", category: ASSET_CATS[0], acquireDate: todayISO(), cost: "", salvage: "", lifeYears: "5", note: "" };
  const [f, setF] = useState(blank);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const num = (v) => { const n = parseFloat(String(v).replace(/,/g, "")); return isFinite(n) ? n : 0; };
  const edit = (a) => { setF({ id: a.id, name: a.name, category: a.category || ASSET_CATS[0], acquireDate: a.acquireDate, cost: String(a.cost), salvage: String(a.salvage || ""), lifeYears: String(a.lifeYears), note: a.note || "" }); setOpen(true); };
  const save = () => {
    if (!f.name.trim()) { window.alert(t("ใส่ชื่อสินทรัพย์", "Enter the asset name")); return; }
    if (num(f.cost) <= 0) { window.alert(t("ใส่ราคาทุน", "Enter the cost")); return; }
    onSave({ id: f.id || uid(), name: f.name.trim(), category: f.category, acquireDate: f.acquireDate || todayISO(), cost: num(f.cost), salvage: num(f.salvage), lifeYears: num(f.lifeYears) || 1, method: "sl", note: f.note.trim(), disposed: false });
    setF(blank); setOpen(false);
  };
  const live = (assets || []).filter((a) => !a.disposed);
  const tot = live.filter((a) => !a.voided).reduce((s, a) => { const d = depState(a, asOf); s.cost += d.cost; s.accum += d.accum; s.nbv += d.nbv; return s; }, { cost: 0, accum: 0, nbv: 0 });
  // depreciation expense within the selected calendar year
  const yearDep = live.filter((a) => !a.voided).reduce((s, a) => {
    const d1 = depState(a, (Number(year) - 1) + "-12-31"), d2 = depState(a, year + "-12-31");
    return s + Math.max(0, d2.accum - d1.accum);
  }, 0);
  const postDep = () => {
    if (yearDep <= 0) { window.alert(t("ปีนี้ไม่มีค่าเสื่อมราคา", "No depreciation for this year")); return; }
    if (!window.confirm(t("ลงบัญชีค่าเสื่อมราคาปี ", "Post depreciation for ") + (Number(year) + 543) + " ฿" + money(yearDep) + "?")) return;
    onEnsureAccounts && onEnsureAccounts([
      { id: "a1600", code: "1600", th: "ที่ดิน อาคาร และอุปกรณ์", en: "Property, Plant & Equipment", type: "asset" },
      { id: "a1690", code: "1690", th: "ค่าเสื่อมราคาสะสม", en: "Accumulated Depreciation", type: "asset" },
      { id: "a5400", code: "5400", th: "ค่าเสื่อมราคา", en: "Depreciation Expense", type: "expense" },
    ]);
    const accId = (code) => (accounts.find((a) => a.code === code) || {}).id || ("a" + code);
    onPostDepreciation({ id: uid(), date: year + "-12-31", desc: "ค่าเสื่อมราคาประจำปี " + (Number(year) + 543) + " / Depreciation " + year, lines: [{ accountId: accId("5400"), debit: round2(yearDep), credit: 0 }, { accountId: accId("1690"), debit: 0, credit: round2(yearDep) }] });
    window.alert(t("ลงบัญชีแล้ว — ดูได้ในสมุดรายวัน", "Posted — see the Journal"));
  };

  return (
    <div>
      <div className="section-title">{t("สินทรัพย์ถาวร", "Fixed assets")}</div>
      <div className="section-sub">{t("ทะเบียนสินทรัพย์ + คำนวณค่าเสื่อมราคาแบบเส้นตรงอัตโนมัติ พร้อมลงบัญชีค่าเสื่อมรายปี (เดบิตค่าเสื่อม เครดิตค่าเสื่อมสะสม)", "Asset register + automatic straight-line depreciation, with annual posting (Dr expense, Cr accumulated)")}</div>

      <div className="toolbar" style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => { setOpen((o) => !o); if (open) setF(blank); }}>{open ? t("ปิดฟอร์ม", "Close") : "+ " + t("เพิ่มสินทรัพย์", "Add asset")}</button>
        <label style={{ fontSize: 13 }}>{t("ณ วันที่", "As of")}</label>
        <DateInput className="input" style={{ maxWidth: 160 }} value={asOf} onChange={(e) => setAsOf(e.target.value)} />
      </div>

      {open && (
        <div className="card card-pad" style={{ marginTop: 12, marginBottom: 16 }}>
          <div className="row2">
            <div className="field"><label>{t("ชื่อสินทรัพย์", "Asset name")}</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder={t("เช่น เครื่องพิมพ์ Epson", "e.g. Epson printer")} /></div>
            <div className="field"><label>{t("หมวด", "Category")}</label><select className="select" value={f.category} onChange={(e) => set("category", e.target.value)}>{ASSET_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("วันที่ได้มา", "Acquired")}</label><DateInput className="input" value={f.acquireDate} onChange={(e) => set("acquireDate", e.target.value)} /></div>
            <div className="field"><label>{t("อายุการใช้งาน (ปี)", "Useful life (yrs)")}</label><input className="input" inputMode="numeric" value={f.lifeYears} onChange={(e) => set("lifeYears", e.target.value.replace(/\D/g, ""))} /></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("ราคาทุน (บาท)", "Cost (THB)")}</label><input className="input r" inputMode="decimal" value={f.cost} onChange={(e) => set("cost", e.target.value)} placeholder="0.00" /></div>
            <div className="field"><label>{t("มูลค่าซาก (บาท)", "Salvage value")}</label><input className="input r" inputMode="decimal" value={f.salvage} onChange={(e) => set("salvage", e.target.value)} placeholder="0.00" /></div>
          </div>
          <div className="field"><label>{t("หมายเหตุ", "Note")}</label><input className="input" value={f.note} onChange={(e) => set("note", e.target.value)} /></div>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>{t("ค่าเสื่อม/ปี โดยประมาณ ", "Approx. depreciation/yr ")}<b className="acc-num">฿{money((num(f.cost) - num(f.salvage)) / (num(f.lifeYears) || 1))}</b></div>
          <button className="btn btn-primary" onClick={save}>💾 {f.id ? t("บันทึกการแก้ไข", "Save changes") : t("เพิ่มสินทรัพย์", "Add asset")}</button>
        </div>
      )}

      <div className="kpi-grid" style={{ marginBottom: 14 }}>
        <div className="kpi"><div className="kpi-label">{t("ราคาทุนรวม", "Total cost")}</div><div className="kpi-val">฿{money(tot.cost)}</div></div>
        <div className="kpi"><div className="kpi-label">{t("ค่าเสื่อมสะสม", "Accum. depreciation")}</div><div className="kpi-val">฿{money(tot.accum)}</div></div>
        <div className="kpi" style={{ borderLeft: "4px solid var(--green)" }}><div className="kpi-label">{t("มูลค่าสุทธิตามบัญชี (NBV)", "Net book value")}</div><div className="kpi-val">฿{money(tot.nbv)}</div></div>
        <div className="kpi"><div className="kpi-label">{t("จำนวนสินทรัพย์", "Assets")}</div><div className="kpi-val acc-num">{live.length}</div></div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="line-head" style={{ margin: 0 }}>{t("ลงบัญชีค่าเสื่อมราคาประจำปี", "Post annual depreciation")}</div>
          <input className="input" inputMode="numeric" style={{ width: 90 }} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          <span className="muted" style={{ fontSize: 13 }}>{t("ค่าเสื่อมปี ", "Depreciation for ")}{Number(year) + 543} = <b className="acc-num">฿{money(yearDep)}</b></span>
          <button className="btn btn-sm btn-primary" onClick={postDep}>{t("ลงบัญชีปีนี้", "Post this year")}</button>
        </div>
      </div>

      <div className="card card-pad">
        {live.length === 0 ? <div className="empty">{t("ยังไม่มีสินทรัพย์", "No assets yet")}</div> : (
          <div className="table-scroll">
            <table className="t">
              <thead><tr><th>{t("สินทรัพย์", "Asset")}</th><th>{t("ได้มา", "Acquired")}</th><th className="r">{t("ราคาทุน", "Cost")}</th><th className="r">{t("ค่าเสื่อม/ปี", "Dep/yr")}</th><th className="r">{t("ค่าเสื่อมสะสม", "Accum")}</th><th className="r">{t("มูลค่าสุทธิ", "NBV")}</th><th className="r"></th></tr></thead>
              <tbody>
                {live.map((a) => { const d = depState(a, asOf); return (
                  <React.Fragment key={a.id}>
                    <tr>
                      <td>{a.name}{a.voided ? <span style={{ marginLeft: 6, color: "#fff", background: "#c0392b", borderRadius: 5, padding: "0 6px", fontSize: 11 }}>{t("ยกเลิก", "Cancelled")}</span> : null}<div className="faint" style={{ fontSize: 11 }}>{a.category}{d.fullyDep ? " · " + t("หักครบแล้ว", "fully depreciated") : ""}</div></td>
                      <td>{fmtDate(a.acquireDate)}</td>
                      <td className="r acc-num">฿{money(d.cost)}</td>
                      <td className="r acc-num">{money(d.perYear)}</td>
                      <td className="r acc-num">{money(d.accum)}</td>
                      <td className="r acc-num" style={{ fontWeight: 700 }}>฿{money(d.nbv)}</td>
                      <td className="r" style={{ whiteSpace: "nowrap" }}><button className="btn btn-sm" onClick={() => setExpand(expand === a.id ? null : a.id)}>{expand === a.id ? "▲" : t("ตาราง", "Sched")}</button>{" "}{onHistory && <button className="btn btn-sm" title={t("ดูประวัติย้อนหลัง", "History")} onClick={() => onHistory(a)}>🕘</button>}{" "}{!a.voided && <button className="btn btn-sm" onClick={() => edit(a)}>{t("แก้", "Edit")}</button>}{" "}{!a.voided && <button className="btn btn-sm btn-danger" onClick={() => onDelete(a.id)}>{t("ยกเลิก", "Cancel")}</button>}</td>
                    </tr>
                    {expand === a.id && (() => {
                      const y0 = Number(String(a.acquireDate).slice(0, 4)); const life = Number(a.lifeYears) || 0;
                      const sched = []; for (let i = 0; i <= life; i++) { const yy = y0 + i; const da = depState(a, (yy - 1) + "-12-31"), db = depState(a, yy + "-12-31"); const dep = Math.max(0, db.accum - da.accum); if (dep > 0.005 || i === 0) sched.push({ yy, dep, nbv: db.nbv }); }
                      return <tr><td colSpan={7} style={{ background: "var(--faint)" }}>
                        <div style={{ padding: "6px 4px", fontSize: 12.5 }}>
                          <div className="muted" style={{ marginBottom: 4 }}>{t("ตารางค่าเสื่อมราคา (เส้นตรง)", "Depreciation schedule (straight-line)")}</div>
                          {sched.map((r) => <div key={r.yy} style={{ display: "flex", justifyContent: "space-between", padding: "1px 0" }}><span>{Number(r.yy) + 543}</span><span className="acc-num">{t("ค่าเสื่อม ฿", "dep ฿")}{money(r.dep)} · {t("คงเหลือ ฿", "NBV ฿")}{money(r.nbv)}</span></div>)}
                        </div>
                      </td></tr>;
                    })()}
                  </React.Fragment>
                ); })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== Year-end inventory closing ================== */
function YearEnd({ t, lang, products, sales, purchases, accounts, money, productValue, onPost, onEnsureAccounts }) {
  const now = todayISO();
  const [asOf, setAsOf] = useState(now.slice(0, 4) + "-12-31");
  const [bookBal, setBookBal] = useState("");
  const num = (v) => { const n = parseFloat(String(v).replace(/,/g, "")); return isFinite(n) ? n : 0; };
  const closing = (products || []).reduce((s, p) => s + productValue(p), 0);
  // by category
  const byCat = {};
  (products || []).forEach((p) => { const v = productValue(p); if (v <= 0) return; const k = p.category || t("ไม่ระบุหมวด", "Uncategorized"); byCat[k] = (byCat[k] || 0) + v; });
  const cats = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a]);
  const diff = num(bookBal) ? closing - num(bookBal) : 0;
  const postAdj = () => {
    if (!num(bookBal)) { window.alert(t("ใส่ยอดสินค้าคงเหลือตามบัญชี (จากงบทดลอง บัญชี 1040) ก่อน", "Enter the book inventory balance (acct 1040 from the trial balance) first")); return; }
    if (Math.abs(diff) < 0.005) { window.alert(t("ยอดตรงกันแล้ว ไม่ต้องปรับ", "Already matches — no adjustment needed")); return; }
    const up = diff > 0;
    if (!window.confirm(t("ปรับปรุงสินค้าคงเหลือปลายงวด ", "Post inventory adjustment ") + (up ? "+" : "−") + "฿" + money(Math.abs(diff)) + "?")) return;
    onEnsureAccounts && onEnsureAccounts([{ id: "a5010", code: "5010", th: "ต้นทุนขาย", en: "Cost of Goods Sold", type: "expense" }, { id: "a1040", code: "1040", th: "สินค้าคงเหลือ", en: "Inventory", type: "asset" }]);
    const accId = (code) => (accounts.find((a) => a.code === code) || {}).id || ("a" + code);
    const amt = round2(Math.abs(diff));
    const lines = up
      ? [{ accountId: accId("1040"), debit: amt, credit: 0 }, { accountId: accId("5010"), debit: 0, credit: amt }]
      : [{ accountId: accId("5010"), debit: amt, credit: 0 }, { accountId: accId("1040"), debit: 0, credit: amt }];
    onPost({ id: uid(), date: asOf, desc: "ปรับปรุงสินค้าคงเหลือปลายงวด / Year-end inventory adjustment", lines });
    window.alert(t("ลงบัญชีปรับปรุงแล้ว — ดูในสมุดรายวัน", "Adjustment posted — see the Journal"));
    setBookBal("");
  };
  return (
    <div>
      <div className="section-title">{t("ปิดสต๊อกปลายปี", "Year-end inventory")}</div>
      <div className="section-sub">{t("คำนวณมูลค่าสินค้าคงเหลือปลายงวดตามต้นทุนจริง (FIFO) และปรับปรุงให้ตรงกับยอดในบัญชีโดยอัตโนมัติ", "Value closing stock at actual (FIFO) cost and reconcile it to the books automatically")}</div>

      <div className="toolbar" style={{ marginTop: 8 }}>
        <label style={{ fontSize: 13 }}>{t("ณ วันที่ปิดงวด", "Closing date")}</label>
        <DateInput className="input" style={{ maxWidth: 160 }} value={asOf} onChange={(e) => setAsOf(e.target.value)} />
      </div>

      <div className="kpi-grid" style={{ margin: "14px 0" }}>
        <div className="kpi" style={{ borderLeft: "4px solid var(--green)" }}><div className="kpi-label">{t("มูลค่าสินค้าคงเหลือ (ต้นทุนจริง)", "Closing inventory (actual cost)")}</div><div className="kpi-val">฿{money(closing)}</div><div className="faint" style={{ fontSize: 11.5 }}>{(products || []).filter((p) => productValue(p) > 0).length} {t("รายการมีของ", "items in stock")}</div></div>
        <div className="kpi"><div className="kpi-label">{t("จำนวน SKU ทั้งหมด", "Total SKUs")}</div><div className="kpi-val acc-num">{(products || []).length}</div></div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="line-head" style={{ marginBottom: 8 }}>{t("ปรับยอดให้ตรงกับบัญชี", "Reconcile to the books")}</div>
        <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>{t("ถ้ายอดสินค้าคงเหลือในงบทดลอง (บัญชี 1040) ไม่ตรงกับมูลค่าจริงด้านบน ใส่ยอดตามบัญชีเพื่อให้ระบบลงรายการปรับปรุงเข้าต้นทุนขายให้อัตโนมัติ", "If the inventory balance in the trial balance (acct 1040) differs from the actual value above, enter the book balance and the system posts the adjustment to COGS")}</div>
        <div className="row2">
          <div className="field"><label>{t("ยอดคงเหลือตามบัญชี 1040 (บาท)", "Book balance, acct 1040 (THB)")}</label><input className="input r" inputMode="decimal" value={bookBal} onChange={(e) => setBookBal(e.target.value)} placeholder="0.00" /></div>
          <div className="field"><label>{t("ผลต่าง (จริง − บัญชี)", "Difference (actual − book)")}</label><input className="input r" readOnly value={(diff >= 0 ? "" : "-") + money(Math.abs(diff))} style={{ background: "var(--faint)", fontWeight: 700, color: diff >= 0 ? "var(--green)" : "var(--red)" }} /></div>
        </div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{diff > 0.005 ? t("สินค้าจริงมากกว่าบัญชี → เพิ่มสินค้าคงเหลือ ลดต้นทุนขาย", "Actual exceeds book → increase inventory, reduce COGS") : diff < -0.005 ? t("สินค้าจริงน้อยกว่าบัญชี → ลดสินค้าคงเหลือ เพิ่มต้นทุนขาย (ของขาด/เสียหาย)", "Actual below book → reduce inventory, increase COGS (shrinkage)") : ""}</div>
        <button className="btn btn-primary" onClick={postAdj}>{t("ลงบัญชีปรับปรุงปลายงวด", "Post year-end adjustment")}</button>
      </div>

      <div className="card card-pad">
        <div className="line-head" style={{ marginBottom: 8 }}>{t("มูลค่าคงเหลือแยกตามหมวด", "Closing value by category")}</div>
        {cats.length === 0 ? <div className="empty">{t("ไม่มีสินค้าคงเหลือ", "No stock on hand")}</div> : (
          <div className="table-scroll">
            <table className="t">
              <thead><tr><th>{t("หมวดสินค้า", "Category")}</th><th className="r">{t("มูลค่า (ต้นทุน)", "Value (cost)")}</th><th className="r">{t("สัดส่วน", "Share")}</th></tr></thead>
              <tbody>
                {cats.map((c) => <tr key={c}><td>{c}</td><td className="r acc-num">฿{money(byCat[c])}</td><td className="r acc-num">{closing ? (byCat[c] / closing * 100).toFixed(1) : "0"}%</td></tr>)}
                <tr style={{ fontWeight: 700 }}><td>{t("รวม", "Total")}</td><td className="r acc-num">฿{money(closing)}</td><td className="r">100%</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== Scan a document (photo) -> AI analyse -> confirm -> save ================== */
function ScanDoc({ t, lang, banks, onSaveExpense }) {
  const AI_KEY_LS = "thaicolor:aiKey";
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [img, setImg] = useState(null);      // { dataUrl, media, b64 }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [stage, setStage] = useState("capture"); // capture | confirm
  const fileRef = useRef(null);
  const camFileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camOn, setCamOn] = useState(false);
  const [form, setForm] = useState(null);

  // default = session-only (cleared when the browser closes); persisting to localStorage is an explicit opt-in —
  // on a shared shop terminal a persisted key is readable by every user of the machine
  const [keyPersist, setKeyPersist] = useState(false);
  useEffect(() => { try { const ls = localStorage.getItem(AI_KEY_LS); const ss = sessionStorage.getItem(AI_KEY_LS); if (ls) { setApiKey(ls); setKeyPersist(true); } else if (ss) setApiKey(ss); } catch (e) {} }, []);
  const saveKey = (k, persist = keyPersist) => {
    setApiKey(k);
    try {
      if (persist) { localStorage.setItem(AI_KEY_LS, k); sessionStorage.removeItem(AI_KEY_LS); }
      else { sessionStorage.setItem(AI_KEY_LS, k); localStorage.removeItem(AI_KEY_LS); }
    } catch (e) {}
  };
  const togglePersist = (v) => { setKeyPersist(v); saveKey(apiKey, v); };

  // live camera (getUserMedia): attach stream when on, always stop on unmount
  useEffect(() => {
    if (camOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const pl = videoRef.current.play(); if (pl && pl.catch) pl.catch(() => {});
    }
  }, [camOn]);
  useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop()); }, []);

  const stopCam = () => { if (streamRef.current) { streamRef.current.getTracks().forEach((tr) => tr.stop()); streamRef.current = null; } setCamOn(false); };
  const startCam = async () => {
    setErr("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { if (camFileRef.current) camFileRef.current.click(); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false }); }
    catch (e) { try { stream = await navigator.mediaDevices.getUserMedia({ video: true }); } catch (e2) { if (camFileRef.current) camFileRef.current.click(); return; } }
    streamRef.current = stream; setImg(null); setCamOn(true);
  };
  const capturePhoto = () => {
    const v = videoRef.current; if (!v) return;
    const cv = document.createElement("canvas");
    cv.width = v.videoWidth || 1280; cv.height = v.videoHeight || 720;
    const cx = cv.getContext("2d"); if (cx) cx.drawImage(v, 0, 0, cv.width, cv.height);
    const url = cv.toDataURL("image/jpeg", 0.92);
    const m = url.match(/^data:([^;]+);base64,(.*)$/);
    if (m) setImg({ dataUrl: url, media: m[1], b64: m[2] });
    stopCam();
  };

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setErr("");
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      const m = url.match(/^data:([^;]+);base64,(.*)$/);
      if (!m) { setErr(t("อ่านไฟล์ภาพไม่ได้", "Couldn't read the image")); return; }
      setImg({ dataUrl: url, media: m[1], b64: m[2] });
    };
    reader.readAsDataURL(f);
  };

  const blankForm = (over) => ({ dest: "expense", date: todayISO(), cat: EXP_CATS[0], desc: "", vendor: "", vendorTaxId: "", amount: "", vatThb: "", pay: "cash", bankId: "", ...over });

  const analyse = async () => {
    if (!img) { setErr(t("เลือกหรือถ่ายรูปเอกสารก่อน", "Pick or take a photo first")); return; }
    if (!apiKey) { setErr(t("ยังไม่ได้ใส่ AI API key — ใส่ด้านล่าง หรือกด “กรอกเอง”", "No AI API key — add it below, or use “Fill in manually”")); return; }
    setBusy(true); setErr("");
    const prompt = "You are a Thai bookkeeping assistant. Read this scanned business document (likely a Thai purchase bill, tax invoice, or expense receipt) and return ONLY a JSON object, no markdown, no commentary. Fields: docType (one of \"expense\",\"purchase\",\"sale\",\"other\"), vendor (shop/company name), vendorTaxId (13-digit tax id or \"\"), date (Gregorian ISO YYYY-MM-DD; if the document shows a Thai Buddhist year e.g. 2567, subtract 543), category (best match among: " + EXP_CATS.join(", ") + "), description (short summary in Thai of what was bought), items (array of {name, qty, amount}), subtotal (number), vat (number, the VAT amount or 0), total (number, grand total). Use 0 for unknown numbers and \"\" for unknown text.";
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1200, messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: img.media, data: img.b64 } }, { type: "text", text: prompt }] }] }),
      });
      if (!r.ok) { const tx = await r.text(); throw new Error("API " + r.status + " " + tx.slice(0, 140)); }
      const data = await r.json();
      const txt = (data.content || []).filter((x) => x.type === "text").map((x) => x.text).join("\n");
      const clean = txt.replace(/```json/gi, "").replace(/```/g, "").trim();
      const j = JSON.parse(clean);
      const cat = EXP_CATS.includes(j.category) ? j.category : EXP_CATS[0];
      setForm(blankForm({
        dest: j.docType === "purchase" ? "expense" : "expense",
        date: /^\d{4}-\d{2}-\d{2}$/.test(j.date) ? j.date : todayISO(),
        cat, desc: j.description || (Array.isArray(j.items) ? j.items.map((it) => it.name).filter(Boolean).join(", ") : ""),
        vendor: j.vendor || "", vendorTaxId: j.vendorTaxId || "",
        amount: j.total ? String(j.total) : (j.subtotal ? String(j.subtotal) : ""),
        vatThb: j.vat ? String(j.vat) : "",
      }));
      setStage("confirm");
    } catch (e) {
      setErr(t("วิเคราะห์ไม่สำเร็จ: ", "Analysis failed: ") + String((e && e.message) || e));
    } finally { setBusy(false); }
  };

  const manual = () => { setForm(blankForm({})); setStage("confirm"); };

  const num = (v) => { const n = parseFloat(String(v).replace(/,/g, "")); return isFinite(n) ? n : 0; };
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    if (num(form.amount) <= 0) { setErr(t("ใส่จำนวนเงิน", "Enter the amount")); return; }
    if (!form.desc.trim() && !form.vendor.trim()) { setErr(t("ใส่รายละเอียดหรือผู้ขาย", "Enter a description or vendor")); return; }
    onSaveExpense({ id: uid(), date: form.date || todayISO(), cat: form.cat, desc: form.desc.trim(), vendor: form.vendor.trim(), purpose: form.vendorTaxId ? t("เลขภาษี ", "TaxID ") + form.vendorTaxId : "", amount: num(form.amount), vatThb: num(form.vatThb), pay: form.pay, bankId: form.pay === "transfer" ? form.bankId : "" });
    setStage("capture"); setImg(null); setForm(null); if (fileRef.current) fileRef.current.value = "";
    setErr(""); window.alert(t("บันทึกเข้าค่าใช้จ่ายร้านแล้ว ✓", "Saved to shop expenses ✓"));
  };

  return (
    <div>
      <div className="section-title">{t("สแกนเอกสารเข้าระบบ", "Scan a document")}</div>
      <div className="section-sub">{t("ถ่ายรูปบิลซื้อ/ใบเสร็จ → ระบบ AI อ่านและวิเคราะห์ให้ว่าควรลงเป็นค่าใช้จ่ายแบบไหน → ยืนยัน/แก้ไขก่อนบันทึกจริง (บันทึกเข้า “ค่าใช้จ่ายร้าน”)", "Photograph a bill/receipt → AI reads & classifies it → review/edit before it's saved (into Shop expenses)")}</div>

      {stage === "capture" && (
        <>
          <div className="card card-pad" style={{ marginTop: 12 }}>
            <div className="line-head" style={{ marginBottom: 8 }}>1 · {t("ถ่ายรูป / เลือกไฟล์เอกสาร", "Photograph / pick the document")}</div>
            <input ref={camFileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: "none" }} />
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
            {!camOn && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={startCam}>📷 {t("เปิดกล้อง", "Open camera")}</button>
                <button className="btn" onClick={() => fileRef.current && fileRef.current.click()}>🖼 {t("เลือกไฟล์", "Choose file")}</button>
                {img && <button className="btn" onClick={() => { setImg(null); if (fileRef.current) fileRef.current.value = ""; if (camFileRef.current) camFileRef.current.value = ""; }}>{t("ลบภาพ", "Clear")}</button>}
              </div>
            )}
            {camOn && (
              <div>
                <div style={{ maxWidth: 420, borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <video ref={videoRef} playsInline muted style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover", background: "#000" }} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  <button className="btn btn-primary" onClick={capturePhoto}>📸 {t("ถ่ายภาพ", "Capture")}</button>
                  <button className="btn btn-danger" onClick={stopCam}>■ {t("ปิดกล้อง", "Stop camera")}</button>
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>{t("วางบิลให้อยู่ในกรอบ แสงสว่างพอ แล้วกดถ่ายภาพ", "Frame the bill with good lighting, then capture")}</div>
              </div>
            )}
            {!camOn && img && <div style={{ marginTop: 10 }}><img src={img.dataUrl} alt="doc" style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 10, border: "1px solid var(--line)" }} /></div>}
            <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>{t("ℹ️ ถ้าเปิดกล้องสดไม่ได้ (เช่นเปิดไฟล์จากเครื่องโดยตรงบน iPhone) ระบบจะสลับไปเรียกกล้องของเครื่องให้ — หรือกด “เลือกไฟล์” เพื่อถ่าย/เลือกรูปก็ได้", "ℹ️ If the live camera can't open (e.g. opening the file directly on iPhone), it falls back to the device camera — or tap “Choose file” to shoot/pick a photo.")}</div>
          </div>

          <div className="card card-pad" style={{ marginTop: 12 }}>
            <div className="line-head" style={{ marginBottom: 8 }}>2 · {t("วิเคราะห์ด้วย AI", "Analyse with AI")}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn btn-primary" disabled={busy || !img} onClick={analyse}>{busy ? t("กำลังอ่านเอกสาร…", "Reading…") : "🔎 " + t("วิเคราะห์เอกสาร", "Analyse document")}</button>
              <button className="btn" onClick={manual}>{t("กรอกเอง (ไม่ใช้ AI)", "Fill in manually")}</button>
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600 }}>{t("AI API key (Anthropic) — เก็บในเครื่องนี้เท่านั้น", "AI API key (Anthropic) — stored on this device only")}</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input className="input" type={showKey ? "text" : "password"} value={apiKey} onChange={(e) => saveKey(e.target.value)} placeholder="sk-ant-..." style={{ fontFamily: "monospace", fontSize: 13 }} />
                <button className="btn btn-sm" onClick={() => setShowKey((v) => !v)}>{showKey ? t("ซ่อน", "Hide") : t("แสดง", "Show")}</button>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginTop: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={keyPersist} onChange={(e) => togglePersist(e.target.checked)} />
                {t("จำคีย์ถาวรบนเครื่องนี้ (ถ้าไม่ติ๊ก คีย์หายเมื่อปิดเบราว์เซอร์ — ปลอดภัยกว่าบนเครื่องที่ใช้ร่วมกัน)", "Remember key on this device (unchecked = cleared when the browser closes — safer on a shared machine)")}
              </label>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>{t("ขอคีย์ได้ที่ console.anthropic.com · ตอนขึ้นเซิร์ฟเวอร์จริง ระบบจะเก็บคีย์ไว้ฝั่งเซิร์ฟเวอร์ให้ปลอดภัยกว่า ผู้ใช้ไม่ต้องกรอกเอง", "Get a key at console.anthropic.com · on the live server the key is kept server-side, so staff won't need to enter it")}</div>
            </div>
            {err && <div className="flash err" style={{ marginTop: 10 }}>{err}</div>}
          </div>
        </>
      )}

      {stage === "confirm" && form && (
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <div className="line-head" style={{ marginBottom: 4 }}>3 · {t("ตรวจสอบและยืนยันก่อนบันทึก", "Review & confirm before saving")}</div>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>{t("AI วิเคราะห์เป็นข้อมูลตั้งต้น — แก้ไขให้ถูกต้องแล้วกดบันทึก ระบบจะลงเข้า “ค่าใช้จ่ายร้าน”", "AI-suggested values — fix anything wrong, then save into Shop expenses")}</div>
          {img && <img src={img.dataUrl} alt="doc" style={{ maxWidth: 180, borderRadius: 8, border: "1px solid var(--line)", float: lang === "th" ? "right" : "right", marginLeft: 12, marginBottom: 8 }} />}
          <div className="row2">
            <div className="field"><label>{t("วันที่", "Date")}</label><DateInput className="input" value={form.date} onChange={(e) => setF("date", e.target.value)} /></div>
            <div className="field"><label>{t("หมวดค่าใช้จ่าย", "Category")}</label><select className="select" value={form.cat} onChange={(e) => setF("cat", e.target.value)}>{EXP_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="field"><label>{t("รายละเอียด", "Description")}</label><input className="input" value={form.desc} onChange={(e) => setF("desc", e.target.value)} /></div>
          <div className="row2">
            <div className="field"><label>{t("ผู้ขาย / ร้าน", "Vendor")}</label><input className="input" value={form.vendor} onChange={(e) => setF("vendor", e.target.value)} /></div>
            <div className="field"><label>{t("เลขผู้เสียภาษีผู้ขาย", "Vendor Tax ID")}</label><input className="input" inputMode="numeric" value={form.vendorTaxId} onChange={(e) => setF("vendorTaxId", e.target.value)} /></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("จำนวนเงินรวม (บาท)", "Total (THB)")}</label><input className="input r" inputMode="decimal" value={form.amount} onChange={(e) => setF("amount", e.target.value)} /></div>
            <div className="field"><label>{t("VAT ในบิล (ถ้ามี)", "VAT (if any)")}</label><input className="input r" inputMode="decimal" value={form.vatThb} onChange={(e) => setF("vatThb", e.target.value)} /></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("จ่ายโดย", "Paid by")}</label><select className="select" value={form.pay} onChange={(e) => setF("pay", e.target.value)}><option value="cash">{t("เงินสด", "Cash")}</option><option value="transfer">{t("โอนธนาคาร", "Bank transfer")}</option></select></div>
            {form.pay === "transfer" && <div className="field"><label>{t("บัญชีธนาคาร", "Bank")}</label><select className="select" value={form.bankId} onChange={(e) => setF("bankId", e.target.value)}><option value="">—</option>{(banks || []).map((b) => <option key={b.id} value={b.id}>{b.bank} {b.last4 || ""}</option>)}</select></div>}
          </div>
          {err && <div className="flash err" style={{ marginTop: 8 }}>{err}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={save}>✓ {t("ยืนยันและบันทึกเข้าระบบ", "Confirm & save")}</button>
            <button className="btn" onClick={() => { setStage("capture"); setErr(""); }}>{t("ย้อนกลับ", "Back")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductInsights({ t, lang, sales, products, money }) {
  const pname = (p) => (lang === "th" ? p.th : lang === "en" ? p.en : `${p.th} / ${p.en}`);
  const [mode, setMode] = useState("product"); // 'product' | 'category'
  const [pid, setPid] = useState("");
  const [psearch, setPsearch] = useState("");
  const [showPS, setShowPS] = useState(false);
  const [cat, setCat] = useState("");
  const [group, setGroup] = useState("month"); // month | quarter | year
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
  const prodSel = mode === "product" ? products.filter((p) => p.id === pid) : products.filter((p) => p.category === cat);
  const selIds = new Set(prodSel.map((p) => p.id));
  const selValid = selIds.size > 0;

  const bucketOf = (date) => {
    const d = String(date || ""); const y = d.slice(0, 4); const m = parseInt(d.slice(5, 7), 10) || 0;
    if (group === "year") return y;
    if (group === "quarter") return y + "-Q" + (Math.floor((m - 1) / 3) + 1);
    return d.slice(0, 7);
  };
  const labelBucket = (b) => {
    if (group === "year") return t("ปี ", "Year ") + bToBE(b);
    if (group === "quarter") { const [y, q] = b.split("-Q"); return "Q" + q + "/" + (parseInt(y, 10) + 543); }
    const [y, m] = b.split("-"); const th = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]; return (th[(parseInt(m, 10) || 1) - 1] || m) + " " + (parseInt(y, 10) + 543);
  };
  function bToBE(y) { return String((parseInt(y, 10) || 0) + 543); }
  const inRange = (date) => (!from || date >= from) && (!to || date <= to);

  const buckets = {}; let tQty = 0, tSales = 0, tProfit = 0, nBills = 0;
  if (selValid) {
    sales.forEach((s) => {
      if (!inRange(s.date)) return;
      let touched = false;
      (Array.isArray(s.items) ? s.items : []).forEach((l) => {
        if (!selIds.has(l.productId)) return;
        touched = true;
        const b = bucketOf(s.date);
        const qty = Number(l.qty) || 0, amt = qty * (Number(l.price) || 0), prof = qty * ((Number(l.price) || 0) - (Number(l.cost) || 0));
        const o = buckets[b] || (buckets[b] = { qty: 0, sales: 0, profit: 0 });
        o.qty += qty; o.sales += amt; o.profit += prof;
        tQty += qty; tSales += amt; tProfit += prof;
      });
      if (touched) nBills += 1;
    });
  }
  const keys = Object.keys(buckets).sort();
  const maxQty = Math.max(1, ...keys.map((k) => buckets[k].qty));
  const peak = keys.reduce((best, k) => (buckets[k].qty > (buckets[best] ? buckets[best].qty : -1) ? k : best), keys[0] || null);
  const margin = tSales > 0 ? (tProfit / tSales * 100) : 0;

  const pq = psearch.trim().toLowerCase();
  const pmatch = pq.length >= 1 ? products.filter((p) => tokMatch([p.th, p.en, p.sku, p.barcode].filter(Boolean).join(" "), pq)).slice(0, 10) : [];

  return (
    <div>
      <div className="section-title">{t("วิเคราะห์สินค้า", "Product insights")}</div>
      <div className="section-sub">{t("เลือกสินค้าหรือชนิด แล้วดูยอดขาย/กำไรตามช่วงเวลา — เช่น กระดาษเบอร์นี้ปีนี้ขายกี่ม้วน เดือนไหนขายดี กำไรกี่ %", "Pick a product or category to see units, sales, and profit over time — peak periods and margin")}</div>

      <div className="card card-pad" style={{ marginTop: 12 }}>
        <div className="row2">
          <div className="field">
            <label>{t("วิเคราะห์แบบ", "Analyze by")}</label>
            <div className="btn-row">
              <button className={"btn btn-sm" + (mode === "product" ? " btn-primary" : "")} onClick={() => setMode("product")}>{t("รายสินค้า", "Product")}</button>
              <button className={"btn btn-sm" + (mode === "category" ? " btn-primary" : "")} onClick={() => setMode("category")}>{t("รายชนิด", "Category")}</button>
            </div>
          </div>
          <div className="field">
            <label>{t("แบ่งช่วงเวลา", "Group by")}</label>
            <div className="btn-row">
              <button className={"btn btn-sm" + (group === "month" ? " btn-primary" : "")} onClick={() => setGroup("month")}>{t("รายเดือน", "Month")}</button>
              <button className={"btn btn-sm" + (group === "quarter" ? " btn-primary" : "")} onClick={() => setGroup("quarter")}>{t("ราย 3 เดือน", "Quarter")}</button>
              <button className={"btn btn-sm" + (group === "year" ? " btn-primary" : "")} onClick={() => setGroup("year")}>{t("รายปี", "Year")}</button>
            </div>
          </div>
        </div>

        {mode === "product" ? (
          <div className="field sug-wrap">
            <label>{t("เลือกสินค้า (พิมพ์ชื่อ/รหัสเพื่อค้นหา)", "Pick a product (type name/code)")}</label>
            <input className="input" value={psearch}
              onChange={(e) => { setPsearch(e.target.value); setShowPS(true); if (!e.target.value) setPid(""); }}
              onFocus={() => setShowPS(true)} onBlur={() => setTimeout(() => setShowPS(false), 150)}
              placeholder={t("เช่น กระดาษ, Calibrite, รหัสสินค้า …", "e.g. paper, Calibrite, SKU …")} />
            {showPS && pmatch.length > 0 && (
              <div className="sug-list">
                {pmatch.map((p) => (
                  <div key={p.id} className="sug-item" onMouseDown={(e) => { e.preventDefault(); setPid(p.id); setPsearch(pname(p)); setShowPS(false); }}>
                    <span className="sug-name">{pname(p)}</span>
                    <span className="sug-meta">{p.sku ? "#" + p.sku + " · " : ""}{p.category || ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="field">
            <label>{t("เลือกชนิดสินค้า", "Pick a category")}</label>
            <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">{t("— เลือกชนิด —", "— choose —")}</option>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <div className="row2">
          <div className="field"><label>{t("ตั้งแต่วันที่ (เว้นว่าง = ทั้งหมด)", "From (blank = all)")}</label><DateInput className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="field"><label>{t("ถึงวันที่", "To")}</label><DateInput className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
      </div>

      {!selValid ? (
        <div className="empty" style={{ marginTop: 14 }}>{t("เลือกสินค้าหรือชนิดด้านบนเพื่อดูผลวิเคราะห์", "Choose a product or category above to see the analysis")}</div>
      ) : keys.length === 0 ? (
        <div className="empty" style={{ marginTop: 14 }}>{t("ไม่พบยอดขายของสินค้านี้ในช่วงที่เลือก", "No sales found for this selection in the chosen range")}</div>
      ) : (
        <>
          <div className="kpi-grid" style={{ marginTop: 14 }}>
            <div className="kpi"><div className="kpi-val">{tQty.toLocaleString()}</div><div className="kpi-label">{t("จำนวนที่ขาย (หน่วย/ชิ้น)", "Units sold")}</div></div>
            <div className="kpi"><div className="kpi-val">฿{money(tSales)}</div><div className="kpi-label">{t("ยอดขายรวม", "Total sales")}</div></div>
            <div className="kpi"><div className="kpi-val">฿{money(tProfit)}</div><div className="kpi-label">{t("กำไรขั้นต้น", "Gross profit")}</div></div>
            <div className="kpi"><div className="kpi-val">{margin.toFixed(1)}%</div><div className="kpi-label">{t("อัตรากำไร", "Margin")}</div></div>
          </div>
          <div className="card card-pad" style={{ marginTop: 12, fontSize: 14 }}>
            {t("ขายดีที่สุด: ", "Peak period: ")}<b>{peak ? labelBucket(peak) : "—"}</b>{peak ? " (" + buckets[peak].qty.toLocaleString() + " " + t("หน่วย", "units") + ")" : ""}
            {" · "}{t("จำนวนบิลที่มีสินค้านี้ ", "Bills with this item ")}<b>{nBills}</b>
          </div>

          <div className="card card-pad" style={{ marginTop: 12 }}>
            <div className="line-head" style={{ marginBottom: 10 }}>{t("แยกตามช่วงเวลา", "By period")}</div>
            <div className="table-scroll">
              <table className="t">
                <thead><tr><th>{t("ช่วงเวลา", "Period")}</th><th className="r">{t("จำนวน", "Units")}</th><th>{t("สัดส่วน", "")}</th><th className="r">{t("ยอดขาย", "Sales")}</th><th className="r">{t("กำไร", "Profit")}</th><th className="r">{t("กำไร%", "Margin%")}</th></tr></thead>
                <tbody>
                  {keys.map((k) => {
                    const o = buckets[k]; const m = o.sales > 0 ? (o.profit / o.sales * 100) : 0;
                    return (
                      <tr key={k}>
                        <td>{labelBucket(k)}{k === peak ? "  ★" : ""}</td>
                        <td className="r">{o.qty.toLocaleString()}</td>
                        <td style={{ minWidth: 120 }}><div style={{ background: "rgba(44,106,78,.18)", height: 10, borderRadius: 5, width: Math.round(o.qty / maxQty * 100) + "%", minWidth: 4 }} /></td>
                        <td className="r">฿{money(o.sales)}</td>
                        <td className="r">฿{money(o.profit)}</td>
                        <td className="r">{m.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Purchases({ t, lang, products, banks, accounts, customers, onSaveCustomer, purchases, advances, money, vatRate = VAT_RATE, onCommit, onDelete, onPrintVoucher, onAdjustLanded, hsTable = [] }) {
  const dutyForHs = (hs) => { if (!hs) return null; const r = (hsTable || []).find((x) => norm(x.hs) === norm(hs)); return r ? (Number(r.rate) || 0) : null; };
  const vatPct = +(vatRate * 100).toFixed(2);
  const pname = (p) => (lang === "th" ? p.th : lang === "en" ? p.en : `${p.th} / ${p.en}`);
  const blankLine = () => ({ key: uid(), productId: "", name: "", qty: "", unitCostFx: "", useSerial: false, serials: [], shipRatio: "1", dutyRate: "", _draft: "", _gen: { prefix: "", start: "", count: "", pad: "" } });
  const [docNo, setDocNo] = useState("");
  const [date, setDate] = useState(todayISO());
  const [supplierId, setSupplierId] = useState("");
  const [supForm, setSupForm] = useState({ name: "", taxId: "", address: "", phone: "" });
  const [showSupSug, setShowSupSug] = useState(false);
  const [saveNewSup, setSaveNewSup] = useState(true);
  const [currency, setCurrency] = useState("THB");
  const [fxRate, setFxRate] = useState("");
  const [lines, setLines] = useState([blankLine()]);
  const [freight, setFreight] = useState("");
  const [vatAuto, setVatAuto] = useState(true);
  const [vatManual, setVatManual] = useState("");
  const [priceVatIncl, setPriceVatIncl] = useState(false); // false = unit cost is BEFORE VAT, true = INCLUDES VAT
  const [billVat, setBillVat] = useState(true); // true = VAT bill (มีใบกำกับ) · false = non-VAT bill (ไม่มีใบกำกับ)
  const [payChannel, setPayChannel] = useState("transfer");
  const [bankId, setBankId] = useState("");
  const [receiveStock, setReceiveStock] = useState(true);
  const [expenseCode, setExpenseCode] = useState("5050");
  const [feeThb, setFeeThb] = useState("");
  const [feeMode, setFeeMode] = useState("cost");
  const [applyAdv, setApplyAdv] = useState({}); // { advanceId: "amountThb" } — advances applied to this bill
  const [flash, setFlash] = useState(null);

  const expenseAccts = accounts.filter((a) => a.type === "expense");
  // user-typed money/qty fields go through num() so "1,115.50" parses instead of silently becoming 0
  const rate = currency === "THB" ? 1 : (num(fxRate) || 0);
  const effQty = (l) => (l.useSerial ? (l.serials || []).length : (num(l.qty) || 0));
  const lineThb = (l) => round2(effQty(l) * (num(l.unitCostFx) || 0) * rate);
  const goodsFx = lines.reduce((s, l) => s + effQty(l) * (num(l.unitCostFx) || 0), 0);
  const goodsEntered = round2(lines.reduce((s, l) => s + lineThb(l), 0)); // as typed (incl VAT if toggle on)
  const useVatCalc = billVat && priceVatIncl;
  const netGoods = useVatCalc ? round2(goodsEntered / (1 + vatRate)) : goodsEntered; // goods value before VAT
  const vatGoodsAuto = !billVat ? 0 : (priceVatIncl ? round2(goodsEntered - netGoods) : round2(netGoods * vatRate));
  const lineNetThb = (l) => round2(effQty(l) * (useVatCalc ? (num(l.unitCostFx) || 0) / (1 + vatRate) : (num(l.unitCostFx) || 0)) * rate);
  // Thai customs assesses import duty on the CIF value — allocate freight to lines by weight and
  // include it in each line's duty base (was: ex-VAT goods value only, understating the duty)
  const totalWeightUI = lines.reduce((s, l) => s + effQty(l) * (num(l.shipRatio) || 1), 0);
  const freightNum = num(freight) || 0;
  const lineFreightAlloc = (l) => { const w = effQty(l) * (num(l.shipRatio) || 1); return totalWeightUI > 0 ? round2(freightNum * (w / totalWeightUI)) : 0; };
  const lineDuty = (l) => round2((lineNetThb(l) + lineFreightAlloc(l)) * (num(l.dutyRate) || 0) / 100);
  const dutyTotal = round2(lines.reduce((s, l) => s + lineDuty(l), 0));
  const landedExtra = round2(dutyTotal + freightNum);
  const vatBase = netGoods; // VAT base = net goods (duty/freight handled as cost, not VATed here)
  const vat = !billVat ? 0 : (vatAuto ? vatGoodsAuto : round2(num(vatManual) || 0));
  const totalThb = round2(netGoods + landedExtra + vat); // = goods(incl VAT) + duty + freight
  const feeN = round2(num(feeThb) || 0);
  const grossPay = round2(totalThb + feeN); // total cash out (fee adds either to cost or expense, both increase cash out)
  const supNameNow = (supplierId ? ((customers.find((x) => x.id === supplierId) || {}).name || "") : (supForm.name || "")).trim().toLowerCase();
  const candAdv = (advances || []).filter((a) => !a.voided && a.status !== "applied" && round2((Number(a.advanceThb) || 0) - (Number(a.appliedThb) || 0)) > 0.005 && ((a.supplierId && supplierId && a.supplierId === supplierId) || (a.supplier && supNameNow && a.supplier.trim().toLowerCase() === supNameNow)));
  const appliedList = candAdv.map((a) => ({ advanceId: a.id, amountThb: round2(num(applyAdv[a.id]) || 0) })).filter((x) => x.amountThb > 0);
  const appliedTotal = round2(appliedList.reduce((s, x) => s + x.amountThb, 0));
  const netPay = round2(Math.max(0, grossPay - appliedTotal));
  // net unit cost (ex-VAT) passed to the ledger so inventory is capitalised without VAT
  const netUnitFx = (l) => { const u = num(l.unitCostFx) || 0; return useVatCalc ? u / (1 + vatRate) : u; };

  const setLine = (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const onPickProduct = (key, pid) => { const p = products.find((x) => x.id === pid); const hsRate = p ? dutyForHs(p.hsCode) : null; setLine(key, { productId: pid, name: p ? pname(p) : "", useSerial: !!(p && p.tracksSerial), shipRatio: p && p.shipRatio != null ? String(p.shipRatio) : "1", dutyRate: hsRate != null ? String(hsRate) : (p && p.dutyRate != null ? String(p.dutyRate) : "") }); };
  const addLineSerials = (key, arr) => setLines((ls) => ls.map((l) => {
    if (l.key !== key) return l;
    const seen = new Set((l.serials || []).map((x) => norm(x)));
    const add = []; arr.forEach((s) => { const v = String(s).trim(); if (v && !seen.has(norm(v))) { seen.add(norm(v)); add.push(v); } });
    return { ...l, serials: [...(l.serials || []), ...add] };
  }));
  const addDraft = (key) => { const l = lines.find((x) => x.key === key); if (!l) return; const arr = parseSerials(l._draft || ""); if (arr.length) addLineSerials(key, arr); setLine(key, { _draft: "" }); };
  const genLine = (key) => { const l = lines.find((x) => x.key === key); if (!l) return; const g = l._gen || {}; const arr = genSerials(g.prefix, g.start, g.count, g.pad); if (!arr.length) { window.alert(t("กรอกเลขเริ่มต้นและจำนวนก่อน", "Enter a start number and a count first")); return; } addLineSerials(key, arr); };
  const rmLineSerial = (key, s) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, serials: (l.serials || []).filter((x) => x !== s) } : l)));
  const addLine = () => setLines((ls) => [...ls, blankLine()]);
  const rmLine = (key) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls));

  const save = () => {
    const valid = lines.filter((l) => effQty(l) > 0 && (l.name.trim() || l.productId));
    if (!valid.length) { setFlash({ type: "err", msg: t("ใส่รายการสินค้าอย่างน้อย 1 บรรทัด (ถ้าเป็นสินค้า serial ต้องใส่ serial อย่างน้อย 1 ตัว)", "Add at least one line item (serial items need at least one serial)") }); return; }
    if (currency !== "THB" && rate <= 0) { setFlash({ type: "err", msg: t("ใส่เรตแลกเงิน (บาทต่อ 1 หน่วยเงินต่างประเทศ)", "Enter the FX rate (THB per 1 unit)") }); return; }
    if (receiveStock && valid.some((l) => !l.productId)) { setFlash({ type: "err", msg: t("จะรับเข้าสต๊อกต้องเลือกสินค้าทุกบรรทัด (หรือปิดรับเข้าสต๊อก)", "To receive stock, pick a product on every line (or turn off receive-to-stock)") }); return; }
    // resolve supplier from the shared contacts DB (or save a new one)
    let supId = supplierId || null;
    let supName = "", supTax = "", supAddr = "";
    if (supplierId) {
      const c = customers.find((x) => x.id === supplierId);
      if (c) { supName = c.name || ""; supTax = c.taxId || ""; supAddr = c.address || ""; }
    } else if (supForm.name.trim() || supForm.taxId.trim()) {
      supName = supForm.name.trim(); supTax = supForm.taxId.trim(); supAddr = (supForm.address || "").trim();
      if (saveNewSup && supName) { supId = onSaveCustomer({ name: supName, taxId: supTax, address: supAddr, branch: "สำนักงานใหญ่", phone: (supForm.phone || "").trim(), isSupplier: true }); }
    }
    if (appliedTotal > grossPay + 0.005) { setFlash({ type: "err", msg: t("ยอดหักมัดจำมากกว่ายอดบิล — ลดจำนวนที่เชื่อม", "Applied advances exceed the bill total — reduce the amount") }); return; }
    const rec = onCommit({
      docNo, date, supplier: supName, supplierId: supId, supplierTaxId: supTax, supplierAddress: supAddr, currency, fxRate: rate,
      lines: valid.map((l) => ({ productId: l.productId || null, name: (l.name || "").trim() || (products.find((p) => p.id === l.productId) || {}).th || "", qty: effQty(l), unitCostFx: netUnitFx(l), useSerial: !!l.useSerial, serials: l.useSerial ? (l.serials || []) : [], shipRatio: num(l.shipRatio) || 1, dutyRate: num(l.dutyRate) || 0, dutyThb: lineDuty(l) })),
      dutyThb: dutyTotal, freightThb: freightNum, vatThb: vat, vatBaseThb: vatBase, isVat: billVat,
      payChannel, bankId, receiveStock, expenseCode, postJournal: true, feeThb: feeN, feeMode, appliedAdvances: appliedList,
    });
    setDocNo(""); setSupplierId(""); setSupForm({ name: "", taxId: "", address: "", phone: "" }); setLines([blankLine()]); setFreight(""); setVatManual(""); setFeeThb(""); setApplyAdv({});
    setFlash({ type: "ok", msg: t("บันทึกบิลซื้อแล้ว", "Purchase saved") + (rec ? " · ฿" + money(rec.totalThb) : "") });
  };

  const sorted = [...purchases].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const inputVatAll = round2(purchases.filter((p) => !p.voided).reduce((s, p) => s + (Number(p.vatThb) || 0), 0));
  const fxc = currency === "THB" ? "" : currency;
  const sq = (supForm.name || "").trim().toLowerCase();
  const supMatches = (!supplierId && sq.length >= 1) ? (customers || []).filter((c) => tokMatch([c.name, c.taxId, c.phone].filter(Boolean).join(" "), sq)).slice(0, 8) : [];
  const pickSupplier = (c) => { setSupplierId(c.id); setSupForm({ name: c.name || "", taxId: c.taxId || "", address: c.address || "", phone: c.phone || "" }); setShowSupSug(false); };
  const clearSupplier = () => { setSupplierId(""); setSupForm({ name: "", taxId: "", address: "", phone: "" }); };

  return (
    <div>
      <div className="section-title">{t("ซื้อ / นำเข้าสินค้า (ภาษีซื้อ)", "Purchases / imports (input VAT)")}</div>
      <div className="section-sub">{t("บันทึกบิลซื้อแบบละเอียด รองรับสกุลเงินต่างประเทศ + เรตแลกเงิน, อากร/ค่าขนส่ง, ภาษีซื้อ " + vatPct + "% และรับเข้าสต๊อกพร้อมต้นทุนนำเข้า (FIFO)", "Detailed purchases with foreign currency + FX, duty/freight, " + vatPct + "% input VAT, and stock receiving at landed cost (FIFO)")}</div>

      <div className="card card-pad" style={{ marginTop: 12 }}>
        <div className="line-head" style={{ marginBottom: 10 }}>{t("บันทึกบิลซื้อ", "New purchase")}</div>
        <div className="row2">
          <div className="field"><label>{t("เลขที่เอกสาร/Invoice", "Doc / Invoice no.")}</label><input className="input" value={docNo} onChange={(e) => setDocNo(e.target.value)} placeholder="INV-2024-001" /></div>
          <div className="field"><label>{t("วันที่", "Date")}</label><DateInput className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field sug-wrap">
            <label>{t("ผู้ขาย / ซัพพลายเออร์ (พิมพ์เพื่อค้นหารายเดิม)", "Supplier (type to search saved)")}</label>
            <input className="input" value={supForm.name}
              onChange={(e) => { setSupForm({ ...supForm, name: e.target.value }); setSupplierId(""); setShowSupSug(true); }}
              onFocus={() => setShowSupSug(true)} onBlur={() => setTimeout(() => setShowSupSug(false), 150)}
              placeholder={t("เช่น Savage Universal", "e.g. Savage Universal")} />
            {showSupSug && supMatches.length > 0 && (
              <div className="sug-list">
                {supMatches.map((c) => (
                  <div key={c.id} className="sug-item" onMouseDown={(e) => { e.preventDefault(); pickSupplier(c); }}>
                    <span className="sug-name">{c.name || c.taxId}</span>
                    <span className="sug-meta">{c.taxId || ""}{c.phone ? " · " + c.phone : ""}</span>
                  </div>
                ))}
              </div>
            )}
            {supplierId && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>✓ {t("เลือกจากระบบแล้ว", "linked from contacts")} · <a style={{ color: "var(--green)", cursor: "pointer" }} onClick={clearSupplier}>{t("ล้าง", "clear")}</a></div>}
          </div>
          <div className="row2" style={{ gap: 12 }}>
            <div className="field"><label>{t("สกุลเงิน", "Currency")}</label>
              <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {currency !== "THB" && <div className="field"><label>{t("เรต (บาท/1 " + currency + ")", "Rate (THB/1 " + currency + ")")}</label><input className="input r" inputMode="decimal" value={fxRate} onChange={(e) => setFxRate(e.target.value)} placeholder="36.50" /></div>}
          </div>
        </div>
        <div className="row2">
          <div className="field"><label>{t("เลขประจำตัวผู้เสียภาษี (13 หลัก)", "Tax ID (13 digits)")}</label><input className="input" inputMode="numeric" value={supForm.taxId} onChange={(e) => { setSupForm({ ...supForm, taxId: e.target.value }); setSupplierId(""); }} placeholder="0000000000000" /></div>
          <div className="field"><label>{t("โทร", "Phone")}</label><input className="input" value={supForm.phone} onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })} placeholder={t("เบอร์โทร", "phone")} /></div>
        </div>
        <div className="field"><label>{t("ที่อยู่ผู้ขาย", "Supplier address")}</label><input className="input" value={supForm.address} onChange={(e) => setSupForm({ ...supForm, address: e.target.value })} placeholder={t("ที่อยู่สำหรับใบกำกับ/บันทึกซื้อ", "address for the purchase record")} /></div>
        {!supplierId && (supForm.name.trim() || supForm.taxId.trim()) && (
          <label className="checkrow"><input type="checkbox" checked={saveNewSup} onChange={(e) => setSaveNewSup(e.target.checked)} />{t("บันทึกผู้ขายรายนี้เข้าระบบ (ใช้ฐานข้อมูลร่วมกับลูกค้า — ครั้งหน้าค้นหาเจอ)", "Save this supplier to the database (shared with customers — findable next time)")}</label>
        )}

        <div className="line-head" style={{ margin: "8px 0 6px", fontSize: 14 }}>{t("รายการสินค้า", "Line items")}</div>
        <div className="table-scroll">
          <table className="t">
            <thead><tr>
              <th>{t("สินค้า (เลือกเพื่อรับเข้าสต๊อก)", "Product (to receive stock)")}</th>
              <th className="r" style={{ width: 70 }}>{t("จำนวน", "Qty")}</th>
              <th className="r" style={{ width: 110 }}>{t("ทุน/หน่วย", "Unit cost")}{fxc ? " (" + fxc + ")" : ""}</th>
              <th className="r" style={{ width: 110 }}>{t("รวม (บาท)", "Total (THB)")}</th>
              <th style={{ width: 34 }}></th>
            </tr></thead>
            <tbody>
              {lines.map((l) => {
                const serial = !!l.useSerial;
                return (
                  <React.Fragment key={l.key}>
                    <tr>
                      <td>
                        <select className="select" style={{ marginBottom: 4 }} value={l.productId} onChange={(e) => onPickProduct(l.key, e.target.value)}>
                          <option value="">{t("— ไม่ผูกสินค้า (พิมพ์ชื่อเอง) —", "— no product (type name) —")}</option>
                          {products.map((p) => <option key={p.id} value={p.id}>{pname(p)}{p.tracksSerial ? " · S/N" : ""}</option>)}
                        </select>
                        <div className="sug-wrap">
                          <input className="input" value={l.name}
                            onChange={(e) => setLine(l.key, { name: e.target.value, _sug: true })}
                            onFocus={() => setLine(l.key, { _sug: true })}
                            onBlur={() => setTimeout(() => setLine(l.key, { _sug: false }), 150)}
                            placeholder={t("ชื่อรายการ (พิมพ์เพื่อค้นหาสินค้า)", "item name (type to find a product)")} />
                          {!l.productId && l._sug && (l.name || "").trim().length >= 1 && (() => {
                            const nq = norm(l.name);
                            const pm = products.filter((p) => tokMatch([p.th, p.en, p.sku, p.barcode].filter(Boolean).join(" "), nq)).slice(0, 8);
                            return pm.length ? (
                              <div className="sug-list" style={{ position: "static", marginTop: 4 }}>
                                {pm.map((p) => (
                                  <div key={p.id} className="sug-item" onMouseDown={(e) => { e.preventDefault(); onPickProduct(l.key, p.id); }}>
                                    <span className="sug-name">{pname(p)}{p.tracksSerial ? " · S/N" : ""}</span>
                                    <span className="sug-meta">{t("คงเหลือ ", "on hand ")}{productOnHand(p)}{Number(p.cost) ? " · ฿" + money(p.cost) : ""}</span>
                                  </div>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                        <label className="checkrow" style={{ marginTop: 6 }}><input type="checkbox" checked={serial} onChange={(e) => setLine(l.key, { useSerial: e.target.checked })} />{t("บันทึก Serial รายชิ้น", "Record serials")}</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap", fontSize: 12 }}>
                          <span className="faint">{t("อัตราส่วนขนส่ง", "freight ratio")}</span>
                          <input className="qty-input" style={{ width: 56 }} inputMode="decimal" value={l.shipRatio} onChange={(e) => setLine(l.key, { shipRatio: e.target.value })} placeholder="1" />
                          <span className="faint">{t("อากร%", "duty%")}</span>
                          <input className="qty-input" style={{ width: 56 }} inputMode="decimal" value={l.dutyRate} onChange={(e) => setLine(l.key, { dutyRate: e.target.value })} placeholder="0" />
                          {Number(l.dutyRate) > 0 && <span className="faint">= ฿{money(lineDuty(l))}</span>}
                        </div>
                      </td>
                      <td className="r">
                        {serial
                          ? <span className="acc-num" title={t("จำนวน = ตามจำนวน serial ที่ใส่", "qty = number of serials entered")}>{(l.serials || []).length}</span>
                          : <input className="qty-input" inputMode="decimal" value={l.qty} onChange={(e) => setLine(l.key, { qty: e.target.value })} placeholder="0" />}
                      </td>
                      <td className="r"><input className="qty-input" style={{ width: 100 }} inputMode="decimal" value={l.unitCostFx} onChange={(e) => setLine(l.key, { unitCostFx: e.target.value })} placeholder="0.00" /></td>
                      <td className="r acc-num">{money(lineThb(l))}</td>
                      <td className="c"><button className="icon-btn" title={t("ลบ", "Remove")} onClick={() => rmLine(l.key)}>×</button></td>
                    </tr>
                    {serial && (
                      <tr>
                        <td colSpan={5} style={{ background: "rgba(44,106,78,.05)" }}>
                          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{t("ใส่ Serial ของสินค้านี้ (จำนวนจะนับตาม serial)", "Enter serials for this item (qty follows the serial count)")}</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
                            <input className="input" style={{ flex: 1, minWidth: 150 }} value={l._draft || ""}
                              onChange={(e) => setLine(l.key, { _draft: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDraft(l.key); } }}
                              placeholder={t("ยิง/พิมพ์ serial ทีละชิ้นแล้ว Enter", "scan/type one serial then Enter")} />
                            <button className="btn btn-sm" onClick={() => addDraft(l.key)}>+ {t("เพิ่ม", "Add")}</button>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 6 }}>
                            <input className="input" style={{ width: 90 }} value={(l._gen || {}).prefix || ""} onChange={(e) => setLine(l.key, { _gen: { ...(l._gen || {}), prefix: e.target.value } })} placeholder={t("นำหน้า", "prefix")} />
                            <input className="qty-input" inputMode="numeric" value={(l._gen || {}).start || ""} onChange={(e) => setLine(l.key, { _gen: { ...(l._gen || {}), start: e.target.value } })} placeholder={t("เริ่ม", "start")} />
                            <input className="qty-input" inputMode="numeric" value={(l._gen || {}).count || ""} onChange={(e) => setLine(l.key, { _gen: { ...(l._gen || {}), count: e.target.value } })} placeholder={t("จำนวน", "count")} />
                            <input className="qty-input" inputMode="numeric" value={(l._gen || {}).pad || ""} onChange={(e) => setLine(l.key, { _gen: { ...(l._gen || {}), pad: e.target.value } })} placeholder={t("เติม0", "pad")} />
                            <button className="btn btn-sm" onClick={() => genLine(l.key)}>↳ {t("เรียงอัตโนมัติ", "Auto-seq")}</button>
                          </div>
                          {(l.serials || []).length > 0 && (
                            <div className="serial-wrap">
                              {(l.serials || []).map((s) => (
                                <span className="serial-chip" key={s}><span className="s-in">{s}</span><button className="icon-btn" style={{ padding: "0 4px", fontSize: 13 }} onClick={() => rmLineSerial(l.key, s)}>×</button></span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={addLine}>+ {t("เพิ่มบรรทัด", "Add line")}</button>

        <div className="row2" style={{ marginTop: 12 }}>
          <div className="field"><label>{t("อากรขาเข้า (คิดจากอัตรา% ต่อรายการ)", "Import duty (from per-item %)")}</label><input className="input r" value={money(dutyTotal)} readOnly title={t("มาจากอัตราอากร% ของแต่ละสินค้า × มูลค่า — แก้อัตราได้ที่ช่องอากร%ในแต่ละบรรทัด", "From each product's duty % × value — edit the % on each line")} style={{ background: "rgba(0,0,0,.04)" }} /></div>
          <div className="field"><label>{t("ค่าขนส่ง/อื่นๆ (บาท)", "Freight/other (THB)")}</label><input className="input r" inputMode="decimal" value={freight} onChange={(e) => setFreight(e.target.value)} placeholder="0.00" /></div>
          <div className="field"><label>{t("ค่าธรรมเนียมโอน/ธนาคาร (บาท)", "Transfer/bank fee (THB)")}</label><input className="input r" inputMode="decimal" value={feeThb} onChange={(e) => setFeeThb(e.target.value)} placeholder="0.00" /></div>
          <div className="field"><label>{t("ค่าธรรมเนียมลงเป็น", "Fee booked as")}</label><select className="select" value={feeMode} onChange={(e) => setFeeMode(e.target.value)}><option value="cost">{t("รวมเข้าต้นทุนสินค้า", "Into product cost")}</option><option value="expense">{t("ค่าใช้จ่าย (ค่าธรรมเนียมธนาคาร)", "Expense (bank charges)")}</option></select></div>
        </div>

        <div className="card" style={{ padding: "8px 10px", marginTop: 12, background: "transparent" }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{t("ประเภทบิลซื้อ (ภาษี):", "Purchase bill type (tax):")}</div>
          <div className="themetoggle" role="group" aria-label="bill-vat">
            <button className={billVat ? "on" : ""} onClick={() => setBillVat(true)}>{t("มี VAT (มีใบกำกับ)", "VAT (tax invoice)")}</button>
            <button className={!billVat ? "on" : ""} onClick={() => setBillVat(false)}>{t("ไม่มี VAT (ไม่มีใบกำกับ)", "Non-VAT (no invoice)")}</button>
          </div>
          {!billVat && <div className="muted" style={{ fontSize: 11.5, marginTop: 6, lineHeight: 1.5 }}>{t("บิลนี้ไม่มีภาษีซื้อให้เครดิต — ถูกแยกไว้ในชุด \"ไม่มี VAT\" ของรายงาน (ใช้คู่กับใบรับรองแทนใบเสร็จ + สลิปโอน เพื่อหักเป็นต้นทุนทางภาษีเงินได้)", "No input VAT to claim — kept in the report's \"Non-VAT\" set (pair with a payment voucher + transfer slip to deduct for income tax)")}</div>}
        </div>

        {billVat && (
          <div className="card" style={{ padding: "8px 10px", marginTop: 12, background: "transparent" }}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{t("ราคาทุน/หน่วยที่กรอกด้านบนเป็นแบบ:", "The unit cost typed above is:")}</div>
            <div className="themetoggle" role="group" aria-label="vat-mode">
              <button className={!priceVatIncl ? "on" : ""} onClick={() => setPriceVatIncl(false)}>{t("ราคาก่อน VAT", "Before VAT")}</button>
              <button className={priceVatIncl ? "on" : ""} onClick={() => setPriceVatIncl(true)}>{t("ราคารวม VAT แล้ว", "Includes VAT")}</button>
            </div>
          </div>
        )}

        {billVat && <label className="checkrow" style={{ marginTop: 8 }}><input type="checkbox" checked={vatAuto} onChange={(e) => setVatAuto(e.target.checked)} />{t("คำนวณภาษีซื้อ " + vatPct + "% อัตโนมัติ", "Auto " + vatPct + "% input VAT")}</label>}
        {billVat && !vatAuto && <div className="field"><label>{t("ภาษีซื้อ (บาท) — กรอกเอง", "Input VAT (THB) — manual")}</label><input className="input r" inputMode="decimal" value={vatManual} onChange={(e) => setVatManual(e.target.value)} placeholder="0.00" /></div>}

        <div className="row2" style={{ marginTop: 4 }}>
          <div className="field"><label>{t("ชำระโดย", "Pay by")}</label>
            <select className="select" value={payChannel} onChange={(e) => setPayChannel(e.target.value)}>
              <option value="cash">{t("เงินสด", "Cash")}</option>
              <option value="transfer">{t("เงินโอนธนาคาร", "Bank transfer")}</option>
              <option value="credit">{t("เครดิต (เจ้าหนี้การค้า)", "Credit (Accounts Payable)")}</option>
            </select>
          </div>
          {payChannel === "transfer" && banks.length > 0 && (
            <div className="field"><label>{t("บัญชีธนาคาร", "Bank account")}</label>
              <select className="select" value={bankId} onChange={(e) => setBankId(e.target.value)}>
                <option value="">{t("— เลือก —", "— select —")}</option>
                {banks.map((b) => <option key={b.id} value={b.id}>{b.bankName}{b.accountNo ? " " + b.accountNo : ""}</option>)}
              </select>
            </div>
          )}
        </div>

        <label className="checkrow"><input type="checkbox" checked={receiveStock} onChange={(e) => setReceiveStock(e.target.checked)} />{t("รับเข้าสต๊อก (เพิ่มจำนวน + ต้นทุนนำเข้าแบบ FIFO ให้สินค้าที่เลือก)", "Receive into stock (add qty + landed FIFO cost to selected products)")}</label>
        {!receiveStock && (
          <div className="field"><label>{t("ลงเป็นค่าใช้จ่าย — บัญชี", "Record as expense — account")}</label>
            <select className="select" value={expenseCode} onChange={(e) => setExpenseCode(e.target.value)}>
              {expenseAccts.map((a) => <option key={a.id} value={a.code}>{a.code} · {lang === "en" ? a.en : a.th}</option>)}
            </select>
          </div>
        )}

        {candAdv.length > 0 && (
          <div className="card card-pad" style={{ marginTop: 12, background: "#f6faf6", border: "1px solid #cfe3cf" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>💵 {t("เชื่อมเงินมัดจำ / จ่ายล่วงหน้า ของซัพพลายเออร์นี้", "Apply this supplier's advances / deposits")}</div>
            {candAdv.map((a) => {
              const remain = round2((Number(a.advanceThb) || 0) - (Number(a.appliedThb) || 0));
              const on = (Number(applyAdv[a.id]) || 0) > 0;
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, flex: 1, minWidth: 190 }}>
                    <input type="checkbox" checked={on} onChange={(e) => setApplyAdv((s) => { const n = { ...s }; if (e.target.checked) { const need = round2(grossPay - appliedTotal + (Number(s[a.id]) || 0)); n[a.id] = String(round2(Math.min(remain, Math.max(0, need)))); } else { delete n[a.id]; } return n; })} />
                    <span>{fmtDate(a.date)} · {a.note || a.currency} · {t("คงเหลือ", "open")} ฿{money(remain)}</span>
                  </label>
                  {on && <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>฿ <input className="input r" style={{ width: 110, display: "inline-block" }} inputMode="decimal" value={applyAdv[a.id]} onChange={(e) => setApplyAdv((s) => ({ ...s, [a.id]: e.target.value }))} /></span>}
                </div>
              );
            })}
            {appliedTotal > grossPay + 0.01 && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>⚠ {t("ยอดหักมัดจำมากกว่ายอดบิล — ลดจำนวนลง", "Applied advances exceed the bill — reduce the amount")}</div>}
          </div>
        )}

        <div className="cart-total" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("มูลค่าสินค้า (ก่อน VAT)", "Goods (ex-VAT)")}{fxc ? " (" + fxc + " " + goodsFx.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ")" : ""}</span><span className="acc-num">฿{money(netGoods)}</span></div>
          {landedExtra > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("อากร+ขนส่ง", "Duty+freight")}</span><span className="acc-num">฿{money(landedExtra)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("ภาษีซื้อ " + vatPct + "%", "Input VAT " + vatPct + "%")}</span><span className="acc-num">฿{money(vat)}</span></div>
          {feeN > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("ค่าธรรมเนียมโอน/ธนาคาร", "Transfer/bank fee")} <span className="muted" style={{ fontSize: 11 }}>({feeMode === "expense" ? t("ค่าใช้จ่าย", "expense") : t("เข้าต้นทุน", "into cost")})</span></span><span className="acc-num">฿{money(feeN)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", borderTop: "1px solid var(--line)", marginTop: 4, fontWeight: 700, fontSize: 16 }}><span>{t("รวมจ่ายทั้งสิ้น", "Total payable")}</span><span className="acc-num">฿{money(grossPay)}</span></div>
          {appliedTotal > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0 0", color: "var(--green)" }}><span>− {t("หักมัดจำ/จ่ายล่วงหน้า", "Less advances applied")}</span><span className="acc-num">−฿{money(appliedTotal)}</span></div>}
          {appliedTotal > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 0", fontWeight: 700, fontSize: 15 }}><span>{t("คงเหลือต้องจ่ายจริง", "Net to pay now")}</span><span className="acc-num">฿{money(netPay)}</span></div>}
        </div>

        {flash && <div className={"flash " + (flash.type === "err" ? "err" : "")} style={{ marginTop: 10 }}>{flash.msg}</div>}
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={save}>💾 {t("บันทึกบิลซื้อ", "Save purchase")}</button>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="line-head" style={{ marginBottom: 8 }}>{t("บิลซื้อล่าสุด", "Recent purchases")} · {t("ภาษีซื้อรวม", "Total input VAT")} <b className="acc-num">฿{money(inputVatAll)}</b></div>
        {sorted.length === 0 ? (
          <div className="empty">{t("ยังไม่มีบิลซื้อ", "No purchases yet")}</div>
        ) : (
          <div className="table-scroll">
            <table className="t">
              <thead><tr><th>{t("วันที่", "Date")}</th><th>{t("เลขที่", "No.")}</th><th>{t("ผู้ขาย", "Supplier")}</th><th className="r">{t("สกุล", "Cur.")}</th><th className="r">{t("ภาษีซื้อ", "VAT")}</th><th className="r">{t("รวม (บาท)", "Total")}</th><th className="r"></th></tr></thead>
              <tbody>
                {sorted.slice(0, 200).map((p) => (
                  <tr key={p.id}>
                    <td>{fmtDate(p.date)}</td>
                    <td className="code">{p.docNo || "—"}</td>
                    <td>{p.supplier || "—"}{p.receiveStock ? "" : " · " + t("ค่าใช้จ่าย", "expense")}</td>
                    <td className="r">{p.currency}{p.currency !== "THB" ? " @" + p.fxRate : ""}</td>
                    <td className="r acc-num">฿{money(p.vatThb)}</td>
                    <td className="r acc-num">฿{money(p.totalThb)}</td>
                    <td className="r" style={{ whiteSpace: "nowrap" }}>
                      {(p.isVat !== undefined ? !p.isVat : !(Number(p.vatThb) > 0)) && onPrintVoucher && <button className="btn btn-sm" style={{ marginRight: 6 }} onClick={() => onPrintVoucher(p)}>🧾 {t("ใบสำคัญรับเงิน", "Voucher")}</button>}
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(p)}>{t("ลบ", "Del")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StockReport({ t, lang, products, profile, money, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [asOf, setAsOf] = useState(today);
  const pname = (p) => (lang === "th" ? p.th : lang === "en" ? p.en : `${p.th} / ${p.en}`);
  const nf0 = (n) => (Number(n) || 0).toLocaleString("en-US");
  const rows = (products || []).filter((p) => productOnHand(p) > 0.0000001);
  const zeroCount = (products || []).length - rows.length;
  const byCat = {};
  rows.forEach((p) => { const c = p.category || t("ไม่ระบุหมวด", "Uncategorized"); (byCat[c] = byCat[c] || []).push(p); });
  const cats = Object.keys(byCat).sort((a, b) => (a === PAPER_CATEGORY ? 1 : b === PAPER_CATEGORY ? -1 : a.localeCompare(b, "th")));
  const grand = rows.reduce((s, p) => s + productValue(p), 0);
  const grandQty = rows.reduce((s, p) => s + productOnHand(p), 0);
  return (
    <div className="inv-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="inv-toolbar">
        <label style={{ color: "#EFE8D8", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          {t("ณ วันที่", "As of")}
          <DateInput value={asOf} onChange={(e) => setAsOf(e.target.value)} style={{ borderRadius: 8, border: "1px solid #888", padding: "4px 8px" }} />
        </label>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨 {t("พิมพ์ / บันทึก PDF", "Print / Save PDF")}</button>
        <button className="btn" onClick={onClose}>{t("ปิด", "Close")}</button>
      </div>
      <div className="inv-hint">{t("รายงานนี้แสดงสินค้าคงเหลือ ณ ปัจจุบัน — พิมพ์ในวันสิ้นปีเพื่อใช้แนบงบ ยอดรวมตรงกับบัญชีสินค้าคงเหลือ (1040)", "Shows current on-hand stock — print on the year-end date to attach to your accounts. The total matches the Inventory account (1040).")}</div>
      <div className="inv-sheet stock-sheet">
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <h1>{profile.shopName || "บริษัท ไทยคัลเลอร์ จำกัด"}</h1>
          {profile.taxId ? <div style={{ fontSize: 12.5 }}>{t("เลขประจำตัวผู้เสียภาษี", "Tax ID")}: {profile.taxId}{profile.branch ? " · " + profile.branch : ""}</div> : null}
          {profile.shopAddress ? <div style={{ fontSize: 12 }}>{profile.shopAddress}</div> : null}
          <div style={{ fontWeight: 700, marginTop: 8, fontSize: 15 }}>{t("รายงานสินค้าคงเหลือ", "Inventory Report")}</div>
          <div style={{ fontSize: 12.5 }}>{t("ณ วันที่", "As of")} {fmtDate(asOf)}</div>
        </div>
        {cats.map((c) => {
          const items = byCat[c].slice().sort((a, b) => String(a.sku || a.en || a.th || "").localeCompare(String(b.sku || b.en || b.th || "")));
          const cv = items.reduce((s, p) => s + productValue(p), 0);
          const cq = items.reduce((s, p) => s + productOnHand(p), 0);
          return (
            <div key={c} style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13.5 }}>{c} <span style={{ fontWeight: 400, fontSize: 12 }}>({nf0(items.length)} {t("รายการ", "items")})</span></div>
              <table className="inv-tbl">
                <thead><tr>
                  <th style={{ width: "14%" }}>{t("รหัส", "Code")}</th>
                  <th>{t("รายการสินค้า", "Item")}</th>
                  <th className="r" style={{ width: "11%" }}>{t("คงเหลือ", "Qty")}</th>
                  <th className="r" style={{ width: "16%" }}>{t("ทุน/หน่วย", "Unit cost")}</th>
                  <th className="r" style={{ width: "18%" }}>{t("มูลค่ารวม", "Value")}</th>
                </tr></thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td className="code">{p.sku || p.barcode || p.en || "—"}</td>
                      <td>{pname(p)}</td>
                      <td className="r">{nf0(productOnHand(p))}</td>
                      <td className="r">{money(avgCost(p))}</td>
                      <td className="r">{money(productValue(p))}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700 }}>
                    <td className="r" colSpan={2}>{t("รวมหมวด", "Subtotal")}</td>
                    <td className="r">{nf0(cq)}</td>
                    <td></td>
                    <td className="r">฿{money(cv)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
        <table className="inv-tbl" style={{ marginTop: 16 }}>
          <tbody>
            <tr style={{ fontWeight: 700, fontSize: 14.5 }}>
              <td>{t("มูลค่าสินค้าคงเหลือรวมทั้งสิ้น", "TOTAL INVENTORY VALUE")}</td>
              <td className="r">{nf0(grandQty)} {t("หน่วย", "units")} · {nf0(rows.length)} {t("รายการ", "items")}</td>
              <td className="r" style={{ width: "22%" }}>฿{money(grand)}</td>
            </tr>
          </tbody>
        </table>
        {zeroCount > 0 ? <div style={{ fontSize: 11.5, marginTop: 6, color: "#444" }}>{t("หมายเหตุ: ไม่รวมรายการที่คงเหลือ 0", "Note: items with zero stock are excluded")} ({nf0(zeroCount)} {t("รายการ", "items")})</div> : null}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 12.5 }}>
          <div>{t("ผู้จัดทำ", "Prepared by")} _____________________</div>
          <div>{t("ผู้ตรวจสอบ", "Verified by")} _____________________</div>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({ t, lang, view, history, money, onClose }) {
  const evs = (history || []).filter((h) => h.entity === view.entity && h.entityId === view.id).sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  const rec = view.rec || {};
  const docNo = rec.billNo || rec.docNo || rec.no || rec.number || rec.name || rec.supplier || (evs[0] && evs[0].docNo) || "";
  const nEdit = evs.filter((e) => e.action === "edit").length;
  const nCancel = evs.filter((e) => e.action === "cancel").length;
  const created = (evs.find((e) => e.action === "create") || {}).ts || rec.createdAt || rec.date || "";
  const fmt = (s) => { if (!s) return "—"; const d = new Date(s); return isNaN(d.getTime()) ? String(s) : d.toLocaleString(lang === "en" ? "en-GB" : "th-TH"); };
  const label = (a) => a === "create" ? t("สร้าง", "Created") : a === "edit" ? t("แก้ไข", "Edited") : a === "cancel" ? t("ยกเลิก", "Cancelled") : a;
  const color = (a) => a === "cancel" ? "#c0392b" : a === "edit" ? "#b9770e" : "#1e7e34";
  const amtOf = (s) => { if (!s) return null; const v = s.total != null ? s.total : s.totalThb != null ? s.totalThb : s.advanceThb != null ? s.advanceThb : s.amount != null ? s.amount : s.netAmount != null ? s.netAmount : (s.taxAmount != null ? s.taxAmount : null); return v; };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, maxWidth: 560, width: "100%", maxHeight: "85vh", overflow: "auto", padding: 20, boxShadow: "0 10px 40px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>🕘 {t("ประวัติเอกสาร", "Document history")}</div>
          <button onClick={onClose} style={{ border: "none", background: "#eee", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ color: "#555", marginBottom: 12 }}>{docNo ? t("เลขที่ ", "No. ") + docNo : ""}{rec.voided ? <span style={{ marginLeft: 8, color: "#fff", background: "#c0392b", borderRadius: 6, padding: "1px 8px", fontSize: 12 }}>{t("ยกเลิกแล้ว", "Cancelled")}</span> : null}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontSize: 13 }}>
          <span>📅 {t("สร้างเมื่อ", "Created")}: <b>{fmt(created)}</b></span>
          <span>✏️ {t("แก้ไข", "Edits")}: <b>{nEdit}</b></span>
          <span>🚫 {t("ยกเลิก", "Cancels")}: <b>{nCancel}</b></span>
        </div>
        {evs.length === 0 ? (
          <div style={{ color: "#888", padding: "12px 0" }}>{t("ยังไม่มีการแก้ไขหรือยกเลิก (เอกสารต้นฉบับ)", "No edits or cancellations recorded (original document).")}</div>
        ) : (
          <div style={{ borderLeft: "2px solid #ddd", paddingLeft: 14 }}>
            {evs.map((e, i) => {
              const a = amtOf(e.snapshot);
              return (
                <div key={e.id || i} style={{ marginBottom: 14, position: "relative" }}>
                  <div style={{ position: "absolute", left: -21, top: 4, width: 12, height: 12, borderRadius: 6, background: color(e.action) }} />
                  <div style={{ fontWeight: 700, color: color(e.action) }}>{label(e.action)} {e.rev != null ? <span style={{ color: "#999", fontWeight: 400 }}>(v{e.rev})</span> : null}{e.backfilled ? <span style={{ color: "#bbb", fontWeight: 400, fontSize: 11 }}> ~{t("ประมาณ", "approx")}</span> : null}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{fmt(e.ts)}</div>
                  {a != null ? <div style={{ fontSize: 12, color: "#444" }}>{t("ยอด", "Total")}: {money ? money(a) : a}</div> : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PendingBills({ t, lang, pendingSales = [], banks = [], money, onIssue, onDelete, onShowInvoice, setTab }) {
  const [sel, setSel] = useState({});     // { id: true }
  const [view, setView] = useState(null); // pending record being viewed
  const list = (pendingSales || []).slice();
  const chosen = list.filter((r) => sel[r.id]);
  const ids = chosen.map((r) => r.id);
  const cname = (r) => (r.customer && (r.customer.name || r.customer)) || t("ไม่ระบุลูกค้า", "No customer");
  const custKey = (r) => r.customerId || (r.customer && (r.customer.name || r.customer)) || "";
  const sameCustomer = chosen.length > 0 && chosen.every((r) => custKey(r) === custKey(chosen[0]));
  const selTotal = chosen.reduce((a, r) => a + (Number(r.total) || 0), 0);
  const allOn = list.length > 0 && list.every((r) => sel[r.id]);
  const toggle = (id) => setSel((s) => ({ ...s, [id]: !s[id] }));
  const toggleAll = () => setSel(allOn ? {} : Object.fromEntries(list.map((r) => [r.id, true])));

  const doIssue = (mode) => {
    if (!chosen.length) return;
    if (mode === "merge" && !sameCustomer) { window.alert(t("ออกบิลรวมใบเดียวได้เฉพาะลูกค้ารายเดียวกัน — เลือกเฉพาะของลูกค้าคนเดียว หรือกด \u201cออกทีละใบ\u201d", "One combined bill requires a single customer — select one customer only, or use \u201cSeparate bills\u201d.")); return; }
    const head = mode === "merge"
      ? t("ออกบิลรวมเป็นใบเดียวจาก " + chosen.length + " ร่าง ?", "Issue ONE combined bill from " + chosen.length + " drafts?")
      : t("ออกบิลแยกทีละใบ " + chosen.length + " ใบ ?", "Issue " + chosen.length + " separate bills?");
    if (!window.confirm(head + "\n" + t("ระบบจะออกเลขบิล + ลงบัญชี (รายได้/VAT/ต้นทุน) ให้ (สต๊อกถูกตัดไปตอนขายแล้ว)", "Bill numbers will be assigned and the journal (revenue/VAT/COGS) posted. Stock was already deducted when parked."))) return;
    const created = onIssue(ids, mode);
    setSel({});
    if (Array.isArray(created) && created.length === 1) onShowInvoice(created[0]);
    else if (Array.isArray(created) && created.length > 1) window.alert(t("ออกบิลแล้ว " + created.length + " ใบ — เปิดดู/พิมพ์ได้ที่เมนู \u201cบิลขาย\u201d", created.length + " bills issued — open/print them from the \u201cBills\u201d menu."));
  };

  return (
    <div>
      <div className="section-title">{t("รอออกบิล", "Pending bills")}</div>
      <div className="section-sub">{t("รายการขายที่กด \u201cรอออกบิล\u201d ไว้ (ตัดสต๊อกแล้ว ยังไม่ออกเลขบิล/ยังไม่ลงบัญชี) — เลือกหลายรายการแล้ว \u201cออกบิลรวมเป็นใบเดียว\u201d (ลูกค้าคนเดียว) หรือ \u201cออกทีละใบ\u201d", "Sales parked as \u201cwait to bill\u201d (stock already cut, no bill/journal yet) — select several then issue \u201cone combined bill\u201d (single customer) or \u201cseparate bills\u201d.")}</div>

      {!list.length ? (
        <div className="muted" style={{ padding: "18px 2px", fontSize: 13.5 }}>{t("ยังไม่มีร่างรอออกบิล — ที่หน้าขาย ติ๊ก \u201cรอออกบิล\u201d ก่อนกดบันทึก", "No parked drafts yet — on the Sell screen, tick \u201cWait to bill\u201d before saving.")}</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "6px 0 14px", flexWrap: "wrap" }}>
            <button className="btn btn-sm" onClick={toggleAll}>{allOn ? t("ไม่เลือกทั้งหมด", "Unselect all") : t("เลือกทั้งหมด", "Select all")}</button>
            <span className="muted" style={{ fontSize: 12.5 }}>{t("เลือก ", "Selected ")}<b>{chosen.length}</b>{chosen.length ? " · ฿" + money(selTotal) : ""}</span>
            <span style={{ flex: 1 }} />
            <button className="btn btn-sm btn-primary" disabled={!chosen.length || !sameCustomer} title={chosen.length && !sameCustomer ? t("ต้องเป็นลูกค้ารายเดียวกัน", "Same customer only") : ""} onClick={() => doIssue("merge")}>{t("ออกบิลรวมเป็นใบเดียว", "One combined bill")}</button>
            <button className="btn btn-sm btn-primary" disabled={!chosen.length} onClick={() => doIssue("separate")}>{t("ออกทีละใบ", "Separate bills")}</button>
          </div>

          <table className="t">
            <thead><tr>
              <th style={{ width: 34 }}></th>
              <th>{t("วันที่", "Date")}</th>
              <th>{t("ลูกค้า", "Customer")}</th>
              <th className="r">{t("รายการ", "Items")}</th>
              <th className="r">{t("ยอดสุทธิ", "Total")}</th>
              <th>VAT</th>
              <th></th>
            </tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} style={sel[r.id] ? { background: "rgba(44,106,78,.06)" } : null}>
                  <td><input type="checkbox" checked={!!sel[r.id]} onChange={() => toggle(r.id)} /></td>
                  <td className="acc-num">{fmtDate(r.date)}</td>
                  <td>{cname(r)}</td>
                  <td className="r">{(r.items || []).length}</td>
                  <td className="r acc-num">฿{money(r.total)}</td>
                  <td>{r.vatEnabled ? <span style={{ background: "#e8f5ee", color: "#2C6A4E", padding: "2px 8px", borderRadius: 999, fontSize: 11 }}>VAT</span> : <span className="muted" style={{ fontSize: 11 }}>—</span>}</td>
                  <td className="r" style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-sm" style={{ marginRight: 6 }} onClick={() => setView(r)}>{t("ดู", "View")}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => { if (window.confirm(t("ยกเลิกร่างนี้? สต๊อกจะถูกคืนเข้าคลัง", "Cancel this draft? Stock will be restored."))) onDelete(r.id); }}>{t("ยกเลิกร่าง", "Cancel")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {view && <PendingDetail t={t} r={view} banks={banks} money={money} onClose={() => setView(null)} />}
    </div>
  );
}

function PendingDetail({ t, r, banks = [], money, onClose }) {
  const bank = (banks || []).find((b) => b.id === r.bankId);
  const chLabel = { cash: t("เงินสด", "Cash"), transfer: t("โอน", "Transfer"), cheque: t("เช็ค", "Cheque"), credit: t("เครดิต/ค้างชำระ", "Credit"), shopee: "Shopee", lazada: "Lazada" }[r.channel] || r.channel;
  return (
    <div className="inv-overlay" style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "4vh 12px 12px", overflow: "auto" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card card-pad" style={{ width: "100%", maxWidth: 560, background: "var(--card)" }}>
        <div className="section-title">{t("ร่างรอออกบิล", "Parked draft")}</div>
        <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>{fmtDate(r.date)} · {(r.customer && (r.customer.name || r.customer)) || t("ไม่ระบุลูกค้า", "No customer")} · {chLabel}{bank ? " (" + (bank.bankName || "") + " " + (bank.accountNo || "") + ")" : ""}</div>
        <table className="t">
          <thead><tr><th>{t("สินค้า", "Item")}</th><th className="r">{t("จำนวน", "Qty")}</th><th className="r">{t("ราคา", "Price")}</th><th className="r">{t("รวม", "Amount")}</th></tr></thead>
          <tbody>{(r.items || []).map((it, i) => (<tr key={i}><td>{it.name}{it.serial ? <span className="muted" style={{ fontSize: 11 }}> · {it.serial}</span> : ""}</td><td className="r acc-num">{it.qty}</td><td className="r acc-num">{money(it.price)}</td><td className="r acc-num">{money((Number(it.qty) || 0) * (Number(it.price) || 0))}</td></tr>))}</tbody>
        </table>
        <div style={{ marginTop: 10, textAlign: "right", fontSize: 13.5 }}>
          <div>{t("ก่อน VAT", "Base")}: <b className="acc-num">฿{money(r.base)}</b></div>
          {r.vatEnabled && <div>VAT: <b className="acc-num">฿{money(r.vat)}</b></div>}
          <div style={{ fontSize: 15, marginTop: 3 }}>{t("ยอดสุทธิ", "Total")}: <b className="acc-num">฿{money(r.total)}</b></div>
        </div>
        <div className="btn-row" style={{ marginTop: 14 }}><button className="btn" onClick={onClose}>{t("ปิด", "Close")}</button></div>
      </div>
    </div>
  );
}

function CustDeposits({ t, lang, custDeposits, customers, banks, sales, money, onAdd, onToggle, onDelete }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState("transfer");
  const [bankId, setBankId] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [note, setNote] = useState("");
  const [linkRow, setLinkRow] = useState(null);
  const [pickBill, setPickBill] = useState("");
  const list = (custDeposits || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const openSum = list.filter((d) => d.status !== "used").reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const pickCustomer = (val) => { setCustomer(val); const c = (customers || []).find((x) => x.name === val.trim()); if (c) { setAddress(c.address || ""); setTaxId(c.taxId || ""); } };
  const billOptions = (sales || []).map((s) => ({ id: s.id, billNo: s.billNo || "", date: s.date, total: Number(s.total) || 0, cname: (s.customer && (s.customer.name || s.customer)) || "" })).filter((s) => s.billNo).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const submit = () => {
    const amt = round2(amount);
    if (!customer.trim()) { window.alert(t("ใส่ชื่อลูกค้า", "Enter customer name")); return; }
    if (!(amt > 0)) { window.alert(t("ใส่จำนวนเงินมัดจำ", "Enter the deposit amount")); return; }
    const c = (customers || []).find((x) => x.name === customer.trim());
    onAdd({ date, customer: customer.trim(), customerId: c ? c.id : null, address, taxId, amount: amt, channel, bankId: (channel === "cash" ? null : (bankId || null)), chequeNo: channel === "cheque" ? chequeNo : "", chequeDate: channel === "cheque" ? chequeDate : "", note });
    setCustomer(""); setAddress(""); setTaxId(""); setAmount(""); setNote(""); setBankId(""); setChannel("transfer"); setChequeNo(""); setChequeDate(""); setDate(todayISO()); setOpen(false);
  };
  return (
    <div>
      <div className="section-title">{t("เงินมัดจำรับจากลูกค้า (ตัวเตือน)", "Customer deposits (tracker)")}</div>
      <div className="section-sub">{t("จดไว้เตือนว่าลูกค้าโอนมัดจำมาแล้วเท่าไร — ไม่ลงบัญชี (ออกใบกำกับรวมทีเดียวตอนขาย แล้วค่อยกด \"ใช้แล้ว\")", "A reminder of deposits customers have transferred — no journal is posted (you issue one full invoice at the sale, then mark it \"used\").")}</div>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => setOpen((s) => !s)}>{open ? t("ปิด", "Close") : "+ " + t("บันทึกมัดจำลูกค้า", "New customer deposit")}</button>
        <span className="muted" style={{ fontSize: 13 }}>{t("มัดจำค้าง (ยังไม่ใช้)", "Open deposits")}: <b>฿{money(openSum)}</b></span>
      </div>
      {open && (
        <div className="card card-pad" style={{ marginBottom: 16, maxWidth: 640 }}>
          <div className="row2">
            <div className="field"><label>{t("วันที่รับ", "Date")}</label><DateInput className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="field"><label>{t("ลูกค้า", "Customer")}</label><input className="input" list="cd-cust" value={customer} onChange={(e) => pickCustomer(e.target.value)} placeholder={t("ชื่อลูกค้า", "Customer name")} /><datalist id="cd-cust">{(customers || []).map((c) => <option key={c.id} value={c.name} />)}</datalist></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("ที่อยู่ลูกค้า", "Customer address")}</label><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("ที่อยู่", "address")} /></div>
            <div className="field"><label>{t("เลขผู้เสียภาษี", "Tax ID")}</label><input className="input" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="0000000000000" /></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("จำนวนมัดจำ (บาท)", "Deposit (THB)")}</label><input className="input r" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
            <div className="field"><label>{t("ช่องทาง", "Channel")}</label><select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}><option value="transfer">{t("เงินโอน", "Transfer")}</option><option value="cheque">{t("เช็ค", "Cheque")}</option><option value="cash">{t("เงินสด", "Cash")}</option></select></div>
          </div>
          {channel === "cheque" && (
            <div className="row2">
              <div className="field"><label>{t("หมายเลขเช็ค", "Cheque no.")}</label><input className="input" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} placeholder="0000000" /></div>
              <div className="field"><label>{t("วันที่เช็ค", "Cheque date")}</label><DateInput className="input" value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} /></div>
            </div>
          )}
          {channel !== "cash" && (
            <div className="field"><label>{t("เข้าบัญชี", "Into account")}</label><select className="select" value={bankId} onChange={(e) => setBankId(e.target.value)}><option value="">{t("— เลือกบัญชี —", "— select account —")}</option>{(banks || []).map((b) => <option key={b.id} value={b.id}>{b.bankName} {b.accountNo || ""}</option>)}</select></div>
          )}
          <div className="field"><label>{t("หมายเหตุ", "Note")}</label><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("เช่น มัดจำสั่งจอง", "e.g. deposit for order")} /></div>
          <button className="btn btn-primary btn-sm" onClick={submit}>{t("บันทึก", "Save")}</button>
        </div>
      )}
      {list.length === 0 ? <div className="empty">{t("ยังไม่มีรายการมัดจำลูกค้า", "No customer deposits yet")}</div> : (
        <div className="table-scroll">
          <table className="t">
            <thead><tr><th>{t("วันที่", "Date")}</th><th>{t("ลูกค้า", "Customer")}</th><th className="r">{t("จำนวน", "Amount")}</th><th>{t("ช่องทาง", "Channel")}</th><th>{t("สถานะ", "Status")}</th><th></th></tr></thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} style={d.status === "used" ? { opacity: .55 } : null}>
                  <td className="code">{fmtDate(d.date)}</td>
                  <td>{d.customer}{d.note ? <div className="faint" style={{ fontSize: 11.5 }}>{d.note}</div> : null}</td>
                  <td className="r acc-num">฿{money(d.amount)}</td>
                  <td>{d.channel === "cash" ? t("เงินสด", "Cash") : d.channel === "cheque" ? (t("เช็ค", "Cheque") + (d.chequeNo ? " #" + d.chequeNo : "")) : t("เงินโอน", "Transfer")}</td>
                  <td>{d.status === "used" ? <span style={{ color: "var(--soft)", fontWeight: 600, fontSize: 12 }}>✓ {t("ใช้แล้ว", "Used")}{d.bill ? " · " + d.bill : ""}</span> : <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 12 }}>● {t("ค้าง", "Open")}</span>}</td>
                  <td className="r" style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-sm" onClick={() => { if (d.status === "used") { onToggle(d.id); } else { setLinkRow(d); setPickBill(""); } }}>{d.status === "used" ? t("ทำเป็นค้าง", "Reopen") : t("ใช้กับบิล", "Apply to bill")}</button>{" "}
                    <button className="icon-btn" title={t("ลบ", "Delete")} onClick={() => onDelete(d.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {linkRow && (
        <div className="inv-overlay" style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "8vh 12px 12px", overflow: "auto" }} onClick={(e) => { if (e.target === e.currentTarget) setLinkRow(null); }}>
          <div className="card card-pad" style={{ width: "100%", maxWidth: 460, background: "var(--card)" }}>
            <div className="section-title" style={{ marginTop: 0 }}>{t("ใช้มัดจำกับบิลขาย", "Apply deposit to a bill")}</div>
            <div className="section-sub">{linkRow.customer} · ฿{money(linkRow.amount)}</div>
            <div className="field"><label>{t("เลือกบิลขาย", "Sales bill")}</label>
              <select className="select" value={pickBill} onChange={(e) => setPickBill(e.target.value)}>
                <option value="">{t("— ไม่ระบุบิล —", "— no specific bill —")}</option>
                {billOptions.map((s) => <option key={s.id} value={s.billNo}>{s.billNo} · {fmtDate(s.date)}{s.cname ? " · " + s.cname : ""} · ฿{money(s.total)}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn btn-sm" onClick={() => setLinkRow(null)}>{t("ยกเลิก", "Cancel")}</button>
              <button className="btn btn-primary btn-sm" onClick={() => { onToggle(linkRow.id, pickBill); setLinkRow(null); setPickBill(""); }}>{t("ยืนยันใช้แล้ว", "Confirm used")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PdfReader({ t, lang }) {
  const [status, setStatus] = useState(t("เลือกไฟล์ PDF เพื่อเริ่ม", "Choose a PDF to start"));
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const wsRef = useRef(false);
  const taRef = useRef(null);
  const ensureWorker = () => {
    if (wsRef.current) return;
    try { pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSrc], { type: "application/javascript" })); } catch (e) { /* falls back to main-thread worker */ }
    wsRef.current = true;
  };
  const handle = async (file) => {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name || "")) { setStatus(t("กรุณาเลือกไฟล์ .pdf", "Please choose a .pdf file")); return; }
    setBusy(true); setOut(""); setStatus(t("กำลังอ่าน: ", "Reading: ") + file.name + " …");
    try {
      ensureWorker();
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let all = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        setStatus(t("กำลังอ่านหน้า ", "Reading page ") + p + "/" + pdf.numPages + " …");
        const page = await pdf.getPage(p);
        const tc = await page.getTextContent();
        let txt = "";
        for (let k = 0; k < tc.items.length; k++) { const it = tc.items[k]; txt += (it.str || ""); if (it.hasEOL) txt += "\n"; }
        all += "===== " + t("หน้า ", "page ") + p + "/" + pdf.numPages + " =====\n" + txt.replace(/\n{3,}/g, "\n\n").trim() + "\n\n";
      }
      setOut(all.trim() || t("(ไม่พบข้อความ — ไฟล์นี้อาจเป็นรูปสแกน ซึ่งต้องใช้ OCR แยกต่างหาก)", "(No text found — this PDF may be a scan, which needs OCR.)"));
      setStatus(t("เสร็จ — ", "Done — ") + pdf.numPages + t(" หน้า · กด \u201cคัดลอกทั้งหมด\u201d ได้เลย", " pages · use Copy all below"));
    } catch (e) {
      setStatus(t("อ่านไม่สำเร็จ: ", "Failed: ") + (e && e.message ? e.message : String(e)));
      setOut("");
    } finally { setBusy(false); }
  };
  const copy = () => {
    if (!out) { setStatus(t("ยังไม่มีข้อความให้คัดลอก", "Nothing to copy yet")); return; }
    if (taRef.current) { taRef.current.focus(); taRef.current.select(); }
    let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out).then(
        () => setStatus(t("คัดลอกแล้ว ✓ ไปวางใน Notepad ได้เลย", "Copied ✓ — paste into Notepad")),
        () => setStatus(ok ? t("คัดลอกแล้ว ✓", "Copied ✓") : t("คัดลอกอัตโนมัติไม่ได้ — เลือกข้อความแล้วกด Ctrl/Cmd + C", "Auto-copy blocked — select and press Ctrl/Cmd + C"))
      );
    } else { setStatus(ok ? t("คัดลอกแล้ว ✓", "Copied ✓") : t("เลือกข้อความแล้วกด Ctrl/Cmd + C", "Select and press Ctrl/Cmd + C")); }
  };
  return (
    <div>
      <div className="section-title">{t("อ่านข้อความจาก PDF", "Read text from PDF")}</div>
      <div className="section-sub">{t("อัปโหลด PDF → ดึงข้อความ → คัดลอกไปวาง Notepad · ทำงานในเครื่องล้วน ไม่ส่งไฟล์ออกอินเทอร์เน็ต", "Upload a PDF → extract its text → copy. Runs entirely on your device; nothing is uploaded.")}</div>
      <div className="card card-pad" style={{ maxWidth: 820 }}>
        <input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(e) => handle(e.target.files && e.target.files[0])} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "12px 0" }}>
          <button className="btn btn-primary btn-sm" onClick={copy} disabled={busy || !out}>{t("คัดลอกทั้งหมด", "Copy all")}</button>
          <button className="btn btn-sm" onClick={() => { setOut(""); setStatus(t("ล้างแล้ว — เลือกไฟล์ใหม่ได้", "Cleared")); }} disabled={busy}>{t("ล้าง", "Clear")}</button>
          <span className="muted" style={{ fontSize: 13 }}>{status}</span>
        </div>
        <textarea ref={taRef} readOnly value={out} placeholder={t("ข้อความจาก PDF จะมาขึ้นที่นี่…", "Extracted text appears here…")} style={{ width: "100%", minHeight: "46vh", border: "1px solid var(--line)", borderRadius: 12, padding: 12, fontFamily: "'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace", fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-wrap", color: "#000", boxSizing: "border-box" }} />
        <div className="faint" style={{ fontSize: 11.5, marginTop: 6 }}>{t("อ่านได้เฉพาะ PDF ที่เป็นตัวอักษรดิจิทัล (ลากคลุมก๊อปได้) — ถ้าเป็นรูปสแกนจะไม่มีข้อความออกมา", "Works on digital-text PDFs only (selectable text) — scans produce no text.")}</div>
      </div>
    </div>
  );
}

function FormSettings({ t, lang, profile, money, onSave }) {
  const TYPES = [["tax", t("ใบกำกับภาษี/ใบเสร็จเต็มรูป", "Tax invoice / full receipt")], ["doc", t("ใบเสร็จ/ใบส่งของ/ใบเสนอราคา", "Receipt / Delivery / Quotation")], ["wht", t("หนังสือรับรองหัก ณ ที่จ่าย", "Withholding tax cert")]];
  const HINTS = { tax: { topMm: "9", leftMm: "7", padMm: "8", fontPx: "12.5", lineH: "1.4", heightMm: "259" }, doc: { topMm: "9", leftMm: "7", padMm: "8", fontPx: "12.5", lineH: "1.4", heightMm: "0" }, wht: { topMm: "6", leftMm: "0", padMm: "9", fontPx: "12.5", lineH: "1.4", heightMm: "262" } };
  const cur = () => (profile && profile.formSettings) || {};
  const [which, setWhich] = useState("tax");
  const [vals, setVals] = useState(cur().tax || {});
  const pick = (w) => { setWhich(w); setVals(cur()[w] || {}); };
  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));
  const v = (k) => (vals[k] != null ? vals[k] : "");
  const eff = (k) => { const x = vals[k]; return (x !== "" && x != null && isFinite(Number(x))) ? Number(x) : Number(HINTS[which][k]); };
  const save = () => { const next = { ...cur() }; const clean = {}; Object.keys(vals).forEach((k) => { if (vals[k] !== "" && vals[k] != null) clean[k] = vals[k]; }); next[which] = clean; onSave(next); window.alert(t("บันทึกการตั้งค่าฟอร์มแล้ว", "Form layout saved")); };
  const reset = () => { const next = { ...cur() }; delete next[which]; onSave(next); setVals({}); };
  const fld = (k, label) => (<div className="field"><label>{label}</label><input className="input r" inputMode="decimal" value={v(k)} onChange={(e) => set(k, e.target.value)} placeholder={t("เดิม ~", "def ~") + HINTS[which][k]} /></div>);
  const ph = eff("heightMm") > 0 ? eff("heightMm") : 200;
  const title = which === "wht" ? t("หนังสือรับรองการหักภาษี ณ ที่จ่าย", "WHT Certificate") : which === "tax" ? t("ใบกำกับภาษี / ใบเสร็จรับเงิน", "Tax Invoice / Receipt") : t("ใบเสร็จรับเงิน / ใบส่งของ", "Receipt / Delivery note");
  return (
    <div>
      <div className="section-title">{t("ตั้งค่าฟอร์มเอกสาร (สำหรับเครื่องพิมพ์)", "Document form layout")}</div>
      <div className="section-sub">{t("ปรับตำแหน่งเริ่มพิมพ์ / ขอบ / ขนาดฟอนต์ ให้ตรงกับกระดาษ — เหมาะกับเครื่องดอตเมทริกซ์ LQ-310 และกระดาษต่อเนื่อง · เว้นว่าง = ใช้ค่าเดิม ใส่เฉพาะช่องที่อยากปรับ", "Adjust print start position / margins / font to fit your paper — ideal for the LQ-310 dot-matrix on continuous forms. Leave a field blank to keep the current value.")}</div>
      <div className="field" style={{ maxWidth: 440 }}><label>{t("เลือกฟอร์มที่จะปรับ", "Form to adjust")}</label><select className="select" value={which} onChange={(e) => pick(e.target.value)}>{TYPES.map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}</select></div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div className="card card-pad" style={{ flex: "1 1 320px", minWidth: 280 }}>
          <div className="row2">{fld("topMm", t("ขอบบน / เลื่อนลง (มม.)", "Top offset (mm)"))}{fld("leftMm", t("ขอบซ้าย / เลื่อนขวา (มม.)", "Left offset (mm)"))}</div>
          <div className="row2">{fld("padMm", t("ขอบใน (มม.)", "Inner padding (mm)"))}{fld("heightMm", t("ความสูงหน้า (มม., 0=อัตโนมัติ)", "Page height (mm, 0=auto)"))}</div>
          <div className="row2">{fld("fontPx", t("ขนาดฟอนต์ (px)", "Font size (px)"))}{fld("lineH", t("ระยะบรรทัด", "Line height"))}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={save}>{t("บันทึก", "Save")}</button>
            <button className="btn btn-sm" onClick={reset}>{t("คืนค่าเริ่มต้น", "Reset to default")}</button>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("ทิป: ตัวอักษรเลื่อนขึ้นทับหัวกระดาษ → เพิ่ม 'ขอบบน'; ล้นซ้าย → เพิ่ม 'ขอบซ้าย'. ดอตเมทริกซ์ควรฟอนต์ ≥ 12px", "Tip: text prints too high → raise Top; runs off left → raise Left. For dot-matrix keep font ≥ 12px.")}</div>
        </div>
        <div style={{ flex: "1 1 300px" }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{t("ตัวอย่าง (ย่อส่วน ~40%)", "Preview (scaled ~40%)")}</div>
          <div style={{ border: "1px solid var(--line)", background: "#e9e9e9", padding: 8, overflow: "hidden", borderRadius: 6 }}>
            <div style={{ transform: "scale(0.4)", transformOrigin: "top left", width: "8in", height: (ph * 0.4 + 6) + "mm" }}>
              <div style={{ background: "#fff", color: "#000", width: "8in", boxSizing: "border-box", marginTop: eff("topMm") + "mm", marginLeft: eff("leftMm") + "mm", padding: eff("padMm") + "mm", fontSize: eff("fontPx") + "px", lineHeight: eff("lineH"), height: eff("heightMm") > 0 ? eff("heightMm") + "mm" : "auto", boxShadow: "0 0 0 1px #bbb" }}>
                <div style={{ textAlign: "center", fontWeight: 700, fontSize: (eff("fontPx") + 4) + "px" }}>{profile.shopName || "บริษัท ไทยคัลเลอร์ จำกัด"}</div>
                <div style={{ textAlign: "center", fontSize: (eff("fontPx") - 1) + "px" }}>{profile.shopAddress || t("ที่อยู่ร้าน…", "shop address…")}</div>
                <div style={{ textAlign: "center", fontWeight: 700, margin: "6px 0" }}>{title}</div>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }}><tbody>
                  {[1, 2, 3].map((i) => <tr key={i}><td style={{ borderBottom: "1px solid #ccc", padding: "3px 4px" }}>{t("รายการสินค้า", "Item")} {i}</td><td style={{ borderBottom: "1px solid #ccc", padding: "3px 4px", textAlign: "right" }}>฿{money(i * 1000)}</td></tr>)}
                </tbody></table>
                <div style={{ textAlign: "right", fontWeight: 700, marginTop: 8 }}>{t("รวมทั้งสิ้น", "Total")} ฿{money(6000)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Advances({ t, lang, advances, banks, purchases, payees, money, onCommit, onCancel, onHistory }) {
  const blank = { date: todayISO(), supplier: "", supplierTaxId: "", currency: "CNY", fxRate: "", foreignAmt: "", feeThb: "", feeMode: "cost", payChannel: "transfer", bankId: (banks && banks[0] ? banks[0].id : ""), note: "", beneAddress: "", swift: "", accountNo: "", bankName: "", bankAddress: "", postJournal: true };
  const [f, setF] = useState(blank);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const pickSupplier = (val) => { const pe = (payees || []).find((p) => (p.name || "").trim().toLowerCase() === val.trim().toLowerCase()); setF((s) => ({ ...s, supplier: val, ...(pe ? { supplierTaxId: pe.taxId || s.supplierTaxId || "", beneAddress: pe.address || "", swift: pe.swift || "", accountNo: pe.accountNo || "", bankName: pe.bankName || "", bankAddress: pe.bankAddress || "" } : {}) })); };
  const rate = f.currency === "THB" ? 1 : (Number(f.fxRate) || 0);
  const principal = round2((Number(f.foreignAmt) || 0) * rate);
  const fee = round2(Number(f.feeThb) || 0);
  const cashOut = round2(principal + fee);
  const supList = [...new Set([...(purchases || []).map((p) => p.supplier), ...(payees || []).map((p) => p.name)].filter(Boolean))];
  const submit = () => {
    if (!f.supplier.trim()) { window.alert(t("ใส่ชื่อซัพพลายเออร์", "Enter supplier")); return; }
    if (cashOut <= 0) { window.alert(t("ใส่จำนวนเงิน", "Enter amount")); return; }
    onCommit({ ...f, supplier: f.supplier.trim(), foreignAmt: Number(f.foreignAmt) || 0, fxRate: rate });
    setF(blank); setOpen(false);
  };
  const live = (advances || []).filter((a) => !a.voided);
  const openSum = round2(live.reduce((s, a) => s + Math.max(0, (Number(a.advanceThb) || 0) - (Number(a.appliedThb) || 0)), 0));
  const pill = (a) => a.voided ? [t("ยกเลิก", "Cancelled"), "#c0392b"] : a.status === "applied" ? [t("เชื่อมแล้ว", "Applied"), "#2e7d32"] : a.status === "partial" ? [t("เชื่อมบางส่วน", "Partial"), "#b8860b"] : [t("คงเหลือ", "Open"), "#1565c0"];
  return (
    <div>
      <div className="section-title">{t("เงินจ่ายล่วงหน้า / มัดจำซัพพลายเออร์", "Supplier advances / deposits")}</div>
      <div className="section-sub">{t("เงินที่โอนไปก่อนของ/ใบกำกับมา (เช่น T/T มัดจำโรงงานจีน) เก็บเป็นสินทรัพย์ — พอออกบิลซื้อค่อยกด \"เชื่อมมัดจำ\" ในฟอร์มซื้อเพื่อหักออก", "Money sent before goods/invoice arrive (e.g. T/T deposit) is held as an asset — apply it on the purchase bill when the goods arrive")}</div>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setOpen((s) => !s)}>{open ? t("ปิด", "Close") : "+ " + t("บันทึกมัดจำ / จ่ายล่วงหน้า", "New advance")}</button>
        <span className="muted" style={{ fontSize: 13 }}>{t("มัดจำคงเหลือ (ยังไม่เชื่อม)", "Open advances")}: <b>฿{money(openSum)}</b></span>
      </div>
      {open && (
        <div className="card card-pad" style={{ marginBottom: 16 }}>
          <div className="row2">
            <div className="field"><label>{t("วันที่โอน", "Date paid")}</label><DateInput className="input" value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
            <div className="field"><label>{t("ซัพพลายเออร์", "Supplier")}</label><input className="input" list="adv-sup" value={f.supplier} onChange={(e) => pickSupplier(e.target.value)} placeholder={t("เช่น LIMBO factory", "e.g. LIMBO factory")} /><datalist id="adv-sup">{supList.map((s, i) => <option key={i} value={s} />)}</datalist></div>
          </div>
          <div className="row2">
            <div className="row2" style={{ gap: 12 }}>
              <div className="field"><label>{t("สกุลเงิน", "Currency")}</label><select className="select" value={f.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="field"><label>{t("เรต (บาท/หน่วย)", "FX rate")}</label><input className="input r" inputMode="decimal" value={f.fxRate} disabled={f.currency === "THB"} onChange={(e) => set("fxRate", e.target.value)} placeholder="36.50" /></div>
            </div>
            <div className="field"><label>{t("จำนวนเงิน (สกุลต่างประเทศ)", "Amount (foreign)")}</label><input className="input r" inputMode="decimal" value={f.foreignAmt} onChange={(e) => set("foreignAmt", e.target.value)} placeholder="0.00" /><div className="muted" style={{ fontSize: 12, marginTop: 3 }}>= ฿{money(principal)}</div></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("ค่าธรรมเนียมโอน/ธนาคาร (บาท)", "Transfer/bank fee (THB)")}</label><input className="input r" inputMode="decimal" value={f.feeThb} onChange={(e) => set("feeThb", e.target.value)} placeholder="0" /></div>
            <div className="field"><label>{t("ค่าธรรมเนียมลงเป็น", "Fee booked as")}</label><select className="select" value={f.feeMode} onChange={(e) => set("feeMode", e.target.value)}><option value="cost">{t("รวมเข้าต้นทุนสินค้า", "Into product cost")}</option><option value="expense">{t("ค่าใช้จ่าย (ค่าธรรมเนียมธนาคาร)", "Expense (bank charges)")}</option></select></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("จ่ายจาก", "Paid from")}</label><select className="select" value={f.payChannel} onChange={(e) => set("payChannel", e.target.value)}><option value="transfer">{t("โอนธนาคาร", "Bank transfer")}</option><option value="cash">{t("เงินสด", "Cash")}</option></select></div>
            {f.payChannel === "transfer" && <div className="field"><label>{t("บัญชีธนาคาร", "Bank account")}</label><select className="select" value={f.bankId} onChange={(e) => set("bankId", e.target.value)}><option value="">{t("— เลือก —", "— select —")}</option>{(banks || []).map((b) => <option key={b.id} value={b.id}>{b.bankName} {b.accountNo || ""}</option>)}</select></div>}
          </div>
          <div className="field"><label>{t("หมายเหตุ / อ้างอิง (เลข PI, ออร์เดอร์)", "Note / ref (PI no., order)")}</label><input className="input" value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="PI-2026-001" /></div>
          <div style={{ marginTop: 10, padding: "10px 12px", border: "1px dashed var(--line)", borderRadius: 10, background: "rgba(0,0,0,.015)" }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("ข้อมูลผู้รับเงิน (สำหรับโอนต่างประเทศ T/T)", "Beneficiary bank details (overseas T/T)")}</div>
            <div className="field"><label>{t("ที่อยู่ผู้รับเงิน", "Beneficiary address")}</label><input className="input" value={f.beneAddress} onChange={(e) => set("beneAddress", e.target.value)} placeholder={t("ที่อยู่บริษัทผู้รับเงิน", "beneficiary company address")} /></div>
            <div className="row2">
              <div className="field"><label>{t("SWIFT / BIC", "SWIFT / BIC")}</label><input className="input" value={f.swift} onChange={(e) => set("swift", e.target.value)} placeholder={t("เว้นว่างได้ถ้าในไทย", "leave blank if domestic")} /></div>
              <div className="field"><label>{t("เลขบัญชี", "Account no.")}</label><input className="input" value={f.accountNo} onChange={(e) => set("accountNo", e.target.value)} placeholder="0000000000" /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{t("ชื่อธนาคาร", "Bank name")}</label><input className="input" value={f.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder={t("เช่น Bank of China", "e.g. Bank of China")} /></div>
              <div className="field"><label>{t("ที่อยู่ธนาคาร", "Bank address")}</label><input className="input" value={f.bankAddress} onChange={(e) => set("bankAddress", e.target.value)} placeholder={t("ที่อยู่สาขาธนาคาร", "bank branch address")} /></div>
            </div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>{t("กรอกครั้งเดียว — ครั้งหน้าพิมพ์ชื่อซัพเดิม ระบบเติมให้อัตโนมัติ · ในไทยเว้น SWIFT ได้", "Fill once — next time the same supplier auto-fills · SWIFT optional for domestic")}</div>
          </div>
          <div className="row2" style={{ alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><input type="checkbox" checked={f.postJournal} onChange={(e) => set("postJournal", e.target.checked)} />{t("ลงบัญชี (เดบิตเงินจ่ายล่วงหน้า 1170 / เครดิตธนาคาร)", "Post journal (Dr 1170 / Cr bank)")}</label>
            <div style={{ textAlign: "right", fontSize: 13 }}>{t("เงินออกจากบัญชีรวม", "Total cash out")}: <b>฿{money(cashOut)}</b></div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={submit}>{t("บันทึกมัดจำ", "Save advance")}</button>
        </div>
      )}
      {(advances || []).length === 0 ? (
        <div className="empty">{t("ยังไม่มีรายการมัดจำ — กดปุ่มด้านบนเพื่อบันทึกเงินที่โอนไปก่อนของมา", "No advances yet — record money sent before the goods arrive")}</div>
      ) : (
        <div className="table-scroll">
          <table className="t">
            <thead><tr><th>{t("วันที่", "Date")}</th><th>{t("ซัพพลายเออร์", "Supplier")}</th><th>{t("สกุล/เรต", "Cur/Rate")}</th><th className="r">{t("มัดจำ (บาท)", "Advance THB")}</th><th className="r">{t("เชื่อมแล้ว", "Applied")}</th><th className="r">{t("คงเหลือ", "Open")}</th><th>{t("สถานะ", "Status")}</th><th style={{ width: 150 }}></th></tr></thead>
            <tbody>
              {[...(advances || [])].reverse().map((a) => {
                const p = pill(a);
                const remain = round2(Math.max(0, (Number(a.advanceThb) || 0) - (Number(a.appliedThb) || 0)));
                return (
                  <tr key={a.id} style={a.voided ? { opacity: .55 } : null}>
                    <td>{fmtDate(a.date)}</td>
                    <td>{a.supplier}{a.note ? <span className="muted" style={{ fontSize: 11 }}> · {a.note}</span> : null}</td>
                    <td>{a.currency}{a.currency !== "THB" ? " @" + a.fxRate : ""}</td>
                    <td className="r">{money(a.advanceThb)}</td>
                    <td className="r">{money(a.appliedThb || 0)}</td>
                    <td className="r">{a.voided ? "—" : money(remain)}</td>
                    <td><span style={{ color: "#fff", background: p[1], borderRadius: 5, padding: "1px 7px", fontSize: 11, whiteSpace: "nowrap" }}>{p[0]}</span></td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button className="btn btn-sm" onClick={() => setDetail(a)}>{t("ดู", "View")}</button>{" "}
                      {onHistory && <button className="icon-btn" onClick={() => onHistory(a)} title={t("ประวัติ", "History")}>🕘</button>}
                      {!a.voided && (Number(a.appliedThb) || 0) <= 0.005 && <button className="btn btn-sm btn-danger" onClick={() => onCancel(a)}>{t("ยกเลิก", "Cancel")}</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {detail && <AdvanceDetail t={t} a={detail} banks={banks} money={money} onClose={() => setDetail(null)} />}
    </div>
  );
}

function AdvanceDetail({ t, a, banks, money, onClose }) {
  const bank = a.bankId ? (banks || []).find((b) => b.id === a.bankId) : null;
  const remain = round2(Math.max(0, (Number(a.advanceThb) || 0) - (Number(a.appliedThb) || 0)));
  const Row = ({ k, v }) => (v || v === 0) ? (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "5px 0", borderBottom: "1px solid var(--line2)", fontSize: 13.5 }}>
      <span className="muted">{k}</span><span style={{ textAlign: "right", fontWeight: 500 }}>{v}</span>
    </div>
  ) : null;
  const hasBene = a.beneAddress || a.swift || a.accountNo || a.bankName || a.bankAddress;
  return (
    <div className="inv-overlay" style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,.55)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "4vh 12px 12px", overflow: "auto" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card card-pad" style={{ width: "100%", maxWidth: 520, background: "var(--card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div className="section-title" style={{ margin: 0 }}>{t("รายละเอียดมัดจำ", "Advance details")}{a.voided ? " · " + t("ยกเลิกแล้ว", "Cancelled") : ""}</div>
          <button className="icon-btn" onClick={onClose} title={t("ปิด", "Close")}>✕</button>
        </div>
        <Row k={t("วันที่โอน", "Date paid")} v={fmtDate(a.date)} />
        <Row k={t("ซัพพลายเออร์", "Supplier")} v={a.supplier} />
        <Row k={t("สกุลเงิน / เรต", "Currency / rate")} v={a.currency + (a.currency !== "THB" ? " @ " + a.fxRate : "")} />
        <Row k={t("จำนวน (สกุลต่างประเทศ)", "Amount (foreign)")} v={a.currency !== "THB" ? money(a.foreignAmt) + " " + a.currency : null} />
        <Row k={t("เงินต้น (บาท)", "Principal THB")} v={"฿" + money(a.principalThb)} />
        <Row k={t("ค่าธรรมเนียม (บาท)", "Fee THB")} v={Number(a.feeThb) > 0 ? "฿" + money(a.feeThb) + (a.feeMode === "expense" ? " · " + t("ค่าใช้จ่าย", "expense") : " · " + t("เข้าต้นทุน", "into cost")) : null} />
        <Row k={t("มัดจำรวม (บาท)", "Advance THB")} v={"฿" + money(a.advanceThb)} />
        <Row k={t("เชื่อมแล้ว / คงเหลือ", "Applied / open")} v={"฿" + money(a.appliedThb || 0) + "  /  ฿" + money(remain)} />
        <Row k={t("จ่ายจาก", "Paid from")} v={a.payChannel === "cash" ? t("เงินสด", "Cash") : (t("โอนธนาคาร", "Bank transfer") + (bank ? " — " + bank.bankName + (bank.accountNo ? " " + bank.accountNo : "") : ""))} />
        <Row k={t("หมายเหตุ / อ้างอิง", "Note / ref")} v={a.note} />
        {hasBene ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("ข้อมูลผู้รับเงิน (T/T)", "Beneficiary (T/T)")}</div>
            <Row k={t("ที่อยู่ผู้รับเงิน", "Beneficiary address")} v={a.beneAddress} />
            <Row k="SWIFT / BIC" v={a.swift} />
            <Row k={t("เลขบัญชี", "Account no.")} v={a.accountNo} />
            <Row k={t("ชื่อธนาคาร", "Bank name")} v={a.bankName} />
            <Row k={t("ที่อยู่ธนาคาร", "Bank address")} v={a.bankAddress} />
          </div>
        ) : null}
        <div style={{ marginTop: 14, textAlign: "right" }}><button className="btn btn-sm" onClick={onClose}>{t("ปิด", "Close")}</button></div>
      </div>
    </div>
  );
}

function InvoiceModal({ t, lang, sale, profile, banks, money, onClose, onEdit, onDelete }) {
  const isTax = sale.docType === "tax";
  const bank = sale.bankId ? (banks || []).find((b) => b.id === sale.bankId) : null;
  const cust = sale.customer || {};
  const maskXfer = sale.channel === "transfer" && bank && bank.showOnBill === false; // this account is set to hide on bills → print "cash"; the books keep the real transfer
  const payText = maskXfer ? channelLabel("cash", lang) : channelLabel(sale.channel, lang) + (bank ? " — " + bank.bankName + (bank.accountNo ? " " + bank.accountNo : "") : "") + (sale.chequeNo ? " #" + sale.chequeNo : "");
  const blankRows = Math.max(0, 13 - sale.items.length);
  return (
    <div className="inv-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="inv-toolbar">
        <button className="btn btn-primary" onClick={() => window.print()}>🖨 {t("พิมพ์ / บันทึก PDF", "Print / Save PDF")}</button>
        {onEdit && !sale.voided && <button className="btn" onClick={() => onEdit(sale)}>✏️ {t("แก้ไขบิล", "Edit")}</button>}
        {onDelete && <button className="btn btn-danger" onClick={() => onDelete(sale)}>🗑 {t("ลบบิล", "Delete")}</button>}
        <button className="btn" onClick={onClose}>{t("ปิด", "Close")}</button>
      </div>
      <div className="inv-hint">
        <div style={{ fontWeight: 700, marginBottom: 4 }}>🖨 {t("ก่อนพิมพ์ครั้งแรก ตั้งค่าครั้งเดียว (เบราว์เซอร์จะจำให้ตลอด)", "First time only — set once (the browser remembers)")}</div>
        <div>1. {t("ในหน้าต่างพิมพ์ กด", "In the print dialog, open")} <b>“More settings / ตัวเลือกเพิ่มเติม”</b></div>
        <div>2. {t("เอาติ๊ก", "Uncheck")} <b>“Headers and footers / หัวและท้ายกระดาษ”</b> {t("ออก", "")} <span style={{ opacity: .85 }}>← {t("ตัวนี้คือต้นเหตุข้อความ file:/// / วันที่ / เลขหน้า ที่ติดมา", "this is what prints the file:/// / date / page-number text")}</span></div>
        <div>3. <b>Margins = None</b> · <b>Scale = 100%</b> · {t("กระดาษ", "Paper")} <b>Letter</b> · {t("เครื่องพิมพ์ Epson LQ-310", "Epson LQ-310")}</div>
        <div style={{ opacity: .8, marginTop: 4, fontSize: 11 }}>{t("โปรแกรมตั้งขอบกระดาษ = 0 ให้แล้ว แต่หัว/ท้ายเป็นการตั้งค่าของเบราว์เซอร์ จึงต้องติ๊กออกเองหนึ่งครั้ง · 3 ชั้นพิมพ์ครั้งเดียวติดทุกชั้น", "The app sets page margin = 0, but headers/footers are a browser setting you must turn off once · 3-ply prints in one pass")}</div>
      </div>
      <div className="inv-sheet tax-sheet">
        <div className="inv-row" style={{ alignItems: "flex-start" }}>
          <div>
            <h1>{profile.shopName || t("(ตั้งชื่อร้านในเมนูตั้งค่าร้าน)", "(set your shop name in Settings)")}</h1>
            <div style={{ fontSize: 12.5, lineHeight: 1.45, whiteSpace: "pre-line" }}>{profile.shopAddress}</div>
            <div style={{ fontSize: 12.5 }}>{profile.taxId ? t("เลขประจำตัวผู้เสียภาษี ", "Tax ID ") + profile.taxId : ""}{profile.branch ? " · " + profile.branch : ""}</div>
            {profile.phone && <div style={{ fontSize: 12.5 }}>{t("โทร ", "Tel ") + profile.phone}</div>}
          </div>
          {profile.logo ? <img src={profile.logo} alt="logo" style={{ maxWidth: 165, maxHeight: 92, objectFit: "contain", marginLeft: 12 }} /> : null}
        </div>

        <div style={{ textAlign: "center", margin: "26px 0 4px" }}>
          <div style={{ fontSize: 19, fontWeight: 700 }}>{isTax ? "ใบกำกับภาษี/ใบเสร็จรับเงิน" : "ใบเสร็จรับเงิน"}</div>
          <div style={{ fontSize: 14 }}>{isTax ? "TAX INVOICE / RECEIPT" : "RECEIPT"}</div>
        </div>

        <div className="inv-row" style={{ alignItems: "flex-start", gap: 12, marginTop: 22 }}>
          <div className="inv-box" style={{ flex: 1 }}>
            <div style={{ fontSize: 11, marginBottom: 1 }}>{t("ลูกค้า / Customer", "Customer")}</div>
            <div style={{ fontWeight: 600 }}>{cust.name || t("ลูกค้าทั่วไป", "Walk-in customer")}</div>
            {cust.address && <div style={{ whiteSpace: "pre-line" }}>{cust.address}</div>}
            <div style={{ fontSize: 12, color: "#000" }}>
              {cust.taxId ? t("เลขผู้เสียภาษี ", "Tax ID ") + cust.taxId : ""}{cust.branch ? " · " + cust.branch : ""}{cust.phone ? " · " + t("โทร ", "Tel ") + cust.phone : ""}
            </div>
          </div>
          <div style={{ fontSize: 13, minWidth: 150, textAlign: "right", paddingTop: 2 }}>
            <div>{t("เลขที่ ", "No. ")}<b>{sale.billNo}</b></div>
            <div>{t("วันที่ ", "Date ")}{fmtDate(sale.date)}</div>
          </div>
        </div>

        <table className="inv-tbl">
          <thead>
            <tr><th className="c" style={{ width: 36 }}>#</th><th>{t("รายการ", "Description")}</th><th className="c" style={{ width: 60 }}>{t("จำนวน", "Qty")}</th><th className="r" style={{ width: 96 }}>{t("ราคา/หน่วย", "Unit price")}</th><th className="r" style={{ width: 104 }}>{t("จำนวนเงิน", "Amount")}</th></tr>
          </thead>
          <tbody>
            {(Array.isArray(sale.items) ? sale.items : []).map((l, i) => (
              <tr key={i}>
                <td className="c">{i + 1}</td>
                <td>{l.name}{l.serial ? "  (S/N: " + l.serial + ")" : ""}{saleLineDiscAmt(l) > 0 ? <span style={{ fontSize: 11, color: "#666" }}> — {t("ส่วนลด", "less disc.")} {l.discKind === "percent" ? ((Number(l.disc) || 0) + "% = ") : ""}{money(saleLineDiscAmt(l))}</span> : null}</td>
                <td className="c">{l.qty}</td>
                <td className="r">{money(l.price)}</td>
                <td className="r">{money(saleLineNet(l))}</td>
              </tr>
            ))}
            {Array.from({ length: blankRows }).map((_, i) => (
              <tr key={"e" + i}><td className="c">&nbsp;</td><td></td><td></td><td></td><td></td></tr>
            ))}
          </tbody>
        </table>

        <div className="inv-row" style={{ marginTop: 10, alignItems: "flex-start" }}>
          <div style={{ flex: 1, fontSize: 12.5 }}>
            <div style={{ fontSize: 11 }}>{t("จำนวนเงินเป็นตัวอักษร", "Amount in words")}</div>
            <div style={{ fontWeight: 600 }}>({bahtText(sale.total)})</div>
            <div style={{ marginTop: 8 }}>{t("ชำระโดย ", "Paid by ")}{payText}</div>
          </div>
          <div style={{ minWidth: 210, fontSize: 12.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("ยอดรวม", "Subtotal")}</span><span>{money(sale.subtotal)}</span></div>
            {sale.discountAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("ส่วนลด", "Discount")}</span><span>−{money(sale.discountAmt)}</span></div>}
            {sale.vatEnabled && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("มูลค่าก่อนภาษี", "Pre-VAT")}</span><span>{money(sale.base)}</span></div>}
            {sale.vatEnabled && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{t("ภาษีมูลค่าเพิ่ม ", "VAT ") + (sale.base > 0 ? Math.round((sale.vat / sale.base) * 100) : 7) + "%"}</span><span>{money(sale.vat)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "1px solid #000", marginTop: 4, fontWeight: 700, fontSize: 14 }}><span>{t("ยอดสุทธิ", "Total")}</span><span>฿{money(sale.total)}</span></div>
          </div>
        </div>

        <div className="inv-fill" />

        <div style={{ height: "4.4em" }} aria-hidden="true" />
        <div className="inv-row" style={{ marginTop: 0, marginBottom: 14, justifyContent: "center" }}>
          <div style={{ textAlign: "center", minWidth: 300 }}>
            <div style={{ borderTop: "1px dotted #000", width: 260, margin: "0 auto" }} />
            <div style={{ fontSize: 12, marginTop: 4 }}>{t("ลงชื่อผู้รับเงิน / ประทับตรา", "Received by / Company stamp")}</div>
            <div style={{ fontSize: 11.5, marginTop: 2 }}>{t("ในนาม ", "for ")}{profile.shopName || ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Customers({ t, lang, customers, sales, products, onSave, onDelete, onShowInvoice, money }) {
  const blank = { id: "", name: "", taxId: "", branch: "สำนักงานใหญ่", address: "", phone: "" };
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const pname = (p) => (lang === "th" ? p.th : lang === "en" ? p.en : `${p.th} / ${p.en}`);
  const salesOf = (cid) => sales.filter((s) => s.customerId === cid);
  const submit = () => {
    if (!form.name.trim() && !form.taxId.trim()) { alert(t("กรอกชื่อหรือเลขผู้เสียภาษี", "Enter a name or Tax ID")); return; }
    onSave({ ...form, name: form.name.trim(), taxId: form.taxId.trim() });
    setForm(blank); setOpen(false);
  };
  const prodName = (pid, fallback) => { const p = products.find((x) => x.id === pid); return p ? pname(p) : (fallback || pid); };
  return (
    <div>
      <div className="section-title">{t("ลูกค้า", "Customers")}</div>
      <div className="section-sub">{t("ทะเบียนลูกค้าที่เคยซื้อ พร้อมประวัติการซื้อ (ดูได้ว่าซื้ออะไร วันไหน เพื่อคาดการณ์ออร์เดอร์)", "Customer registry with full purchase history (what & when — useful for forecasting)")}</div>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setOpen((s) => !s)}>{open ? t("ปิด", "Close") : "+ " + t("เพิ่มลูกค้า", "Add customer")}</button>
        <span className="muted" style={{ fontSize: 13 }}>{customers.length} {t("ราย", "customers")}</span>
      </div>

      {open && (
        <div className="card card-pad" style={{ marginBottom: 16 }}>
          <div className="row2">
            <div className="field"><label>{t("ชื่อลูกค้า / บริษัท (พิมพ์เพื่อค้นหารายเดิม)", "Customer / company (type to find existing)")}</label>
              <NameSuggest value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                options={(customers || []).map((c) => ({ label: c.name, meta: [c.taxId, c.phone].filter(Boolean).join(" · "), c }))}
                onPick={(o) => setForm({ id: o.c.id, name: o.c.name || "", taxId: o.c.taxId || "", branch: o.c.branch ?? "สำนักงานใหญ่", address: o.c.address || "", phone: o.c.phone || "" })} />
            </div>
            <div className="field"><label>{t("เลขผู้เสียภาษี (13 หลัก)", "Tax ID (13 digits)")}</label><input className="input" inputMode="numeric" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="0000000000000" /></div>
          </div>
          <div className="row2">
            <div className="field"><label>{t("ที่อยู่", "Address")}</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="row2" style={{ gap: 12 }}>
              <div className="field"><BranchPicker t={t} value={form.branch} onChange={(b) => setForm({ ...form, branch: b })} /></div>
              <div className="field"><label>{t("โทร", "Phone")}</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={submit}>{t("บันทึกลูกค้า", "Save customer")}</button>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="empty">{t("ยังไม่มีลูกค้า — ลูกค้าจะถูกบันทึกอัตโนมัติเมื่อออกบิล หรือเพิ่มเองได้", "No customers yet — they're saved automatically when you issue an invoice, or add them here")}</div>
      ) : (
        <div className="table-scroll">
          <table className="t">
            <thead><tr><th>{t("ลูกค้า", "Customer")}</th><th>{t("เลขผู้เสียภาษี", "Tax ID")}</th><th className="r" style={{ width: 70 }}>{t("บิล", "Bills")}</th><th className="r" style={{ width: 110 }}>{t("ยอดซื้อรวม", "Total spent")}</th><th style={{ width: 150 }}></th></tr></thead>
            <tbody>
              {customers.map((c) => {
                const ss = salesOf(c.id);
                const spent = ss.reduce((s, x) => s + (Number(x.total) || 0), 0);
                const byProd = {};
                ss.forEach((s) => (Array.isArray(s.items) ? s.items : []).forEach((it) => { const k = it.productId || it.name; if (!byProd[k]) byProd[k] = { name: it.name, qty: 0, last: s.date }; byProd[k].qty += Number(it.qty) || 0; if (s.date > byProd[k].last) byProd[k].last = s.date; }));
                return (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td>{c.name || <span className="faint">—</span>}{c.phone && <div className="muted" style={{ fontSize: 11 }}>{c.phone}</div>}</td>
                      <td className="code">{c.taxId || <span className="faint">—</span>}{String(c.branch || "").trim().startsWith("สาขา") ? <div className="faint" style={{ fontSize: 11 }}>{c.branch}</div> : null}</td>
                      <td className="r acc-num">{ss.length}</td>
                      <td className="r acc-num">฿{money(spent)}</td>
                      <td className="c" style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-sm" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>{t("ประวัติ", "History")}</button>
                        <button className="icon-btn" title={t("ลบ", "Delete")} onClick={() => { if (window.confirm(t("ลบลูกค้านี้?", "Delete this customer?"))) onDelete(c.id); }}>×</button>
                      </td>
                    </tr>
                    {expanded === c.id && (
                      <tr><td colSpan={5} style={{ background: "#FAF6EC" }}>
                        {ss.length === 0 ? <span className="faint" style={{ fontSize: 12 }}>{t("ยังไม่มีประวัติการซื้อ", "no purchases yet")}</span> : (
                          <div>
                            <div className="line-head" style={{ marginBottom: 6 }}>{t("ประวัติบิล", "Invoices")}</div>
                            <div className="table-scroll" style={{ border: 0, marginBottom: 12 }}>
                              <table className="t"><thead><tr><th style={{ width: 84 }}>{t("เลขที่", "No.")}</th><th style={{ width: 96 }}>{t("วันที่", "Date")}</th><th>{t("รายการ", "Items")}</th><th className="r" style={{ width: 96 }}>{t("ยอด", "Total")}</th><th style={{ width: 70 }}></th></tr></thead>
                                <tbody>{ss.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).map((s) => (
                                  <tr key={s.id}><td className="code">{s.billNo}</td><td>{fmtDate(s.date)}</td><td style={{ fontSize: 12 }}>{(Array.isArray(s.items) ? s.items : []).map((it) => it.name + "×" + it.qty).join(", ")}</td><td className="r acc-num">฿{money(s.total)}</td><td className="c"><button className="btn btn-sm" onClick={() => onShowInvoice(s)}>{t("บิล", "Open")}</button></td></tr>
                                ))}</tbody>
                              </table>
                            </div>
                            <div className="line-head" style={{ marginBottom: 6 }}>{t("สรุปสินค้าที่ซื้อ (ไว้คาดการณ์ออร์เดอร์)", "Products bought (for forecasting)")}</div>
                            <div className="serial-wrap">
                              {Object.keys(byProd).map((k) => <span className="serial-chip" key={k}>{byProd[k].name} · <b className="acc-num">{byProd[k].qty}</b> · {t("ล่าสุด ", "last ")}{fmtDate(byProd[k].last)}</span>)}
                            </div>
                          </div>
                        )}
                      </td></tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function monthStart() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01"; }

const EXP_CATS = ["เงินเดือน", "ค่าเช่า", "ค่าไฟฟ้า", "ค่าน้ำประปา", "อินเทอร์เน็ต/โทรศัพท์", "อุปกรณ์/เครื่องมือ", "ซ่อมบำรุง", "ขนส่ง", "การตลาด/โฆษณา", "ค่าธรรมเนียม/ภาษี", "อื่นๆ"];

// ===== ค่าใช้จ่ายร้าน (level 3) — separate register, never touches stock or the journal =====
function Expenses({ t, lang, expenses, banks, purchases = [], customers = [], onSave, onDelete, money, onHistory, vatRate = VAT_RATE }) {
  const blank = { date: todayISO(), cat: EXP_CATS[0], desc: "", vendor: "", vendorTaxId: "", vendorAddress: "", purpose: "", amount: "", vatThb: "", currency: "THB", foreignAmt: "", fxRate: "", revCharge: false, pay: "cash", bankId: "", cardBank: "", cardNo: "" };
  const [form, setForm] = useState(blank);
  const [m, setM] = useState(todayISO().slice(0, 7));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onCcy = (v) => setForm((f) => ({ ...f, currency: v, ...(v === "THB" ? { foreignAmt: "", fxRate: "" } : {}) }));
  const onFx = (k, v) => setForm((f) => {
    const nf = { ...f, [k]: v };
    const fa = num(k === "foreignAmt" ? v : f.foreignAmt);
    const fr = num(k === "fxRate" ? v : f.fxRate);
    if (f.currency !== "THB" && fa > 0 && fr > 0) nf.amount = String(round2(fa * fr)); // auto-fill THB (still editable if the card charged a different figure)
    return nf;
  });
  const num = (v) => { const n = parseFloat(String(v).replace(/,/g, "")); return isFinite(n) ? n : 0; };
  // one vendor directory merged from customers + purchase suppliers + past expenses (name ⇄ taxId ⇄ address)
  const vendorBook = (() => {
    const map = new Map();
    const add = (name, taxId, address) => {
      const nm = (name || "").trim(); if (!nm) return;
      const key = norm(nm); const cur = map.get(key);
      if (!cur) { map.set(key, { name: nm, taxId: (taxId || "").trim(), address: (address || "").trim() }); return; }
      if (!cur.taxId && (taxId || "").trim()) cur.taxId = taxId.trim();
      if (!cur.address && (address || "").trim()) cur.address = address.trim();
    };
    (customers || []).forEach((c) => add(c.name, c.taxId, c.address));
    (purchases || []).forEach((p) => add(p.supplier, p.supplierTaxId, p.supplierAddress));
    (expenses || []).forEach((e) => add(e.vendor, e.vendorTaxId, e.vendorAddress));
    return Array.from(map.values());
  })();
  const vendorOpts = vendorBook.map((v) => ({ label: v.name, meta: v.taxId || "", taxId: v.taxId, address: v.address }));
  const pickVendor = (o) => setForm((f) => ({ ...f, vendor: o.label, vendorTaxId: o.taxId || f.vendorTaxId, vendorAddress: o.address || f.vendorAddress }));
  const save = () => {
    if (!form.desc.trim() && !form.vendor.trim()) { window.alert(t("ใส่รายละเอียดหรือผู้ขายอย่างน้อย 1 ช่อง", "Enter a description or a vendor")); return; }
    if (num(form.amount) <= 0) { window.alert(t("ใส่จำนวนเงินก่อน", "Enter an amount")); return; }
    onSave({ id: uid(), date: form.date || todayISO(), cat: form.cat, desc: form.desc.trim(), vendor: form.vendor.trim(), vendorTaxId: (form.vendorTaxId || "").trim(), vendorAddress: (form.vendorAddress || "").trim(), purpose: form.purpose.trim(), amount: num(form.amount), vatThb: form.revCharge ? 0 : num(form.vatThb), currency: form.currency || "THB", foreignAmt: form.currency !== "THB" ? num(form.foreignAmt) : 0, fxRate: form.currency !== "THB" ? num(form.fxRate) : 0, revCharge: !!form.revCharge, revChargeVat: form.revCharge ? round2(num(form.amount) * vatRate) : 0, pay: form.pay, bankId: form.pay === "transfer" ? form.bankId : "", cardBank: form.pay === "card" ? (form.cardBank || "").trim() : "", cardNo: form.pay === "card" ? (form.cardNo || "").trim() : "" });
    setForm({ ...blank, date: form.date, cat: form.cat });
  };
  const rows = (expenses || []).filter((e) => String(e.date || "").slice(0, 7) === m).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const sumAmt = rows.filter((e) => !e.voided).reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const sumVat = rows.filter((e) => !e.voided).reduce((a, e) => a + (Number(e.vatThb) || 0), 0);
  const bankName = (id) => { const b = (banks || []).find((x) => x.id === id); return b ? ((b.bankName || b.bank || "") + " " + (b.accountNo || b.last4 || "")).trim() : ""; };
  return (
    <div>
      <div className="section-title">{t("ค่าใช้จ่ายร้าน", "Shop expenses")}</div>
      <div className="section-sub">{t("เงินเดือน ค่าน้ำ ค่าไฟ อุปกรณ์ ฯลฯ — แยกจากสต๊อกสินค้า ไม่ลงสมุดรายวันอัตโนมัติ ใช้ประกอบสรุปภาษี/งบการเงิน", "Salary, utilities, equipment — kept apart from stock; feeds the tax & statement summaries")}</div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="line-head" style={{ marginBottom: 8 }}>＋ {t("บันทึกค่าใช้จ่ายใหม่", "Record an expense")}</div>
        <div className="row2">
          <div className="field"><label>{t("วันที่", "Date")}</label><DateInput className="input" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div className="field"><label>{t("หมวดค่าใช้จ่าย", "Category")}</label>
            <select className="select" value={form.cat} onChange={(e) => set("cat", e.target.value)}>{EXP_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div className="field"><label>{t("รายละเอียด (จ่ายค่าอะไร)", "Description (what was paid)")}</label><input className="input" value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder={t("เช่น ค่าไฟเดือน พ.ค. / โต๊ะตัดกระดาษ", "e.g. May electricity / paper-cutting table")} /></div>
        <div className="row2">
          <div className="field"><label>{t("ซื้อจาก / จ่ายให้ใคร", "Vendor / paid to")}</label>
            <NameSuggest value={form.vendor}
              onChange={(v) => set("vendor", v)}
              onPick={pickVendor}
              options={vendorOpts}
              placeholder={t("ร้าน/บริษัท/ชื่อพนักงาน", "shop / company / employee")} />
          </div>
          <div className="field"><label>{t("เลขกำกับภาษีผู้ขาย", "Vendor tax ID")}</label><input className="input" inputMode="numeric" value={form.vendorTaxId} onChange={(e) => set("vendorTaxId", e.target.value)} placeholder={t("13 หลัก (ถ้ามี)", "13 digits (optional)")} style={{ fontFamily: "'IBM Plex Mono',monospace" }} /></div>
        </div>
        <div className="field"><label>{t("ที่อยู่ผู้ขาย", "Vendor address")}</label><input className="input" value={form.vendorAddress} onChange={(e) => set("vendorAddress", e.target.value)} placeholder={t("เลือกชื่อที่มีอยู่แล้วระบบจะเติมให้ หรือพิมพ์เอง", "auto-filled when picking a saved name, or type it")} /></div>
        <div className="field"><label>{t("ใช้ทำอะไร", "Used for")}</label><input className="input" value={form.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder={t("เช่น ใช้ในแผนกพิมพ์", "e.g. for the print room")} /></div>
        <div className="row2">
          <div className="field"><label>{t("สกุลเงิน", "Currency")}</label>
            <select className="select" value={form.currency} onChange={(e) => onCcy(e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="field"><label>{t("จำนวนเงิน THB (รวม VAT ถ้ามี)", "Amount THB (VAT-incl. if any)")}</label><input className="input" inputMode="decimal" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00" /></div>
        </div>
        {form.currency !== "THB" && (
          <>
            <div className="row2">
              <div className="field"><label>{t("ยอดสกุล ", "Amount in ") + form.currency}</label><input className="input" inputMode="decimal" value={form.foreignAmt} onChange={(e) => onFx("foreignAmt", e.target.value)} placeholder="0.00" /></div>
              <div className="field"><label>{t("เรท (บาท/1 ", "Rate (THB per 1 ") + form.currency + ")"}</label><input className="input" inputMode="decimal" value={form.fxRate} onChange={(e) => onFx("fxRate", e.target.value)} placeholder={t("เช่น 36.50", "e.g. 36.50")} /></div>
            </div>
            <div className="faint" style={{ fontSize: 11.5, marginTop: -4, marginBottom: 8 }}>{t("แนะนำ: ใส่ยอด THB ที่บัตร/ธนาคารหักจริงตามสเตทเมนต์ (แม่นสุด) — หรือกรอกยอดต่างประเทศ×เรท ให้ระบบคำนวณ THB ให้", "Tip: use the actual THB your card/bank charged (most accurate) — or enter foreign×rate to auto-calc THB.")}</div>
          </>
        )}
        {!form.revCharge && (
          <div className="field"><label>{t("VAT ในบิล (ถ้ามีใบกำกับภาษีไทย)", "VAT on the bill (Thai tax invoice)")}</label><input className="input" inputMode="decimal" value={form.vatThb} onChange={(e) => set("vatThb", e.target.value)} placeholder="0.00" style={{ maxWidth: 220 }} /></div>
        )}
        <label className="checkrow" style={{ margin: "2px 0 4px" }}><input type="checkbox" checked={!!form.revCharge} onChange={(e) => set("revCharge", e.target.checked)} />{t("บริการต่างประเทศ — VAT reverse charge 7% (ยื่น ภ.พ.36)", "Foreign service — reverse-charge VAT 7% (file PP.36)")}</label>
        {form.revCharge && num(form.amount) > 0 && <div className="faint" style={{ fontSize: 11.5, marginTop: -2, marginBottom: 8 }}>{t("ต้องนำส่ง VAT 7% = ฿", "Remit 7% VAT = ฿") + money(round2(num(form.amount) * vatRate)) + t(" ผ่าน ภ.พ.36 ภายในวันที่ 7 เดือนถัดไป แล้วเครดิตกลับเป็นภาษีซื้อใน ภ.พ.30 — ยอดค่าใช้จ่ายด้านบนไม่รวม VAT นี้", " via PP.36 by the 7th of next month, then claim it back as input VAT in PP.30 — the expense amount above excludes this VAT.")}</div>}
        <div className="row2">
          <div className="field"><label>{t("จ่ายโดย", "Paid by")}</label>
            <select className="select" value={form.pay} onChange={(e) => set("pay", e.target.value)}>
              <option value="cash">{t("เงินสด", "Cash")}</option>
              <option value="transfer">{t("โอนธนาคาร", "Bank transfer")}</option>
              <option value="card">{t("บัตรเครดิต", "Credit card")}</option>
            </select></div>
          {form.pay === "transfer" && (
            <div className="field"><label>{t("บัญชีธนาคาร (เลขบัญชี)", "Bank account (no.)")}</label>
              <select className="select" value={form.bankId} onChange={(e) => set("bankId", e.target.value)}>
                <option value="">—</option>{(banks || []).map((b) => <option key={b.id} value={b.id}>{(b.bankName || b.bank || "")} {(b.accountNo || b.last4 || "")}</option>)}
              </select></div>
          )}
          {form.pay === "card" && (
            <div className="field"><label>{t("ธนาคาร / บัตร", "Bank / card")}</label><input className="input" value={form.cardBank} onChange={(e) => set("cardBank", e.target.value)} placeholder={t("เช่น กสิกร Visa Business", "e.g. KBank Visa Business")} /></div>
          )}
        </div>
        {form.pay === "card" && (
          <div className="field"><label>{t("เลขบัตร (4 ตัวท้าย)", "Card number (last 4)")}</label><input className="input" inputMode="numeric" value={form.cardNo} onChange={(e) => set("cardNo", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1234" style={{ maxWidth: 140, fontFamily: "'IBM Plex Mono',monospace" }} /></div>
        )}
        <button className="btn btn-primary" onClick={save}>{t("บันทึกค่าใช้จ่าย", "Save expense")}</button>
      </div>

      <div className="toolbar" style={{ marginBottom: 10, alignItems: "center" }}>
        <label style={{ fontSize: 13.5, fontWeight: 600 }}>{t("ดูเดือน", "Month")}</label>
        <input className="input" type="month" style={{ maxWidth: 170 }} value={m} onChange={(e) => setM(e.target.value)} />
        <span className="muted" style={{ fontSize: 13 }}>{t("รวม ", "Total ")}<b className="acc-num">฿{money(sumAmt)}</b>{sumVat ? " · VAT ฿" + money(sumVat) : ""}</span>
      </div>
      <div className="table-scroll">
        <table className="t">
          <thead><tr><th style={{ width: 92 }}>{t("วันที่", "Date")}</th><th style={{ width: 120 }}>{t("หมวด", "Category")}</th><th>{t("รายละเอียด", "Details")}</th><th className="r" style={{ width: 90 }}>VAT</th><th className="r" style={{ width: 110 }}>{t("จำนวนเงิน", "Amount")}</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={6} className="faint" style={{ textAlign: "center", padding: 16 }}>{t("ยังไม่มีรายการในเดือนนี้", "no expenses this month")}</td></tr>
              : rows.map((e) => (
                <tr key={e.id}>
                  <td className="acc-num">{fmtDate(e.date)}{e.voided ? <span style={{ marginLeft: 6, color: "#fff", background: "#c0392b", borderRadius: 5, padding: "0 6px", fontSize: 11 }}>{t("ยกเลิก", "Cancelled")}</span> : null}</td>
                  <td>{e.cat}</td>
                  <td>{e.desc}{(() => {
                    const parts = [];
                    if (e.vendor) parts.push(t("จาก ", "from ") + e.vendor);
                    if (e.purpose) parts.push(t("ใช้ ", "for ") + e.purpose);
                    if (e.currency && e.currency !== "THB") parts.push(e.currency + " " + money(e.foreignAmt || 0) + (Number(e.fxRate) ? " @" + e.fxRate : ""));
                    if (e.pay === "transfer") parts.push("🏦 " + (bankName(e.bankId) || t("โอน", "transfer")));
                    if (e.pay === "card") parts.push("💳 " + (e.cardBank || t("บัตร", "card")) + (e.cardNo ? " ••" + e.cardNo : ""));
                    if (e.revCharge) parts.push("RC 7% ภ.พ.36" + (Number(e.revChargeVat) ? " ฿" + money(e.revChargeVat) : ""));
                    return parts.length ? <div className="faint" style={{ fontSize: 11.5 }}>{parts.join(" · ")}</div> : null;
                  })()}</td>
                  <td className="r acc-num">{Number(e.vatThb) ? money(e.vatThb) : ""}</td>
                  <td className="r acc-num">฿{money(e.amount)}</td>
                  <td className="c" style={{ whiteSpace: "nowrap" }}>{onHistory && <button className="icon-btn" title={t("ดูประวัติย้อนหลัง", "History")} onClick={() => onHistory(e)}>🕘</button>}{!e.voided && <button className="icon-btn" title={t("ยกเลิก", "Cancel")} onClick={() => onDelete(e.id)}>×</button>}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== สรุปบัญชี/ภาษี (level 3) — reference pack for ภ.พ.30, ภ.ง.ด.50/51, monthly & annual statements =====
function AcctSummary({ t, sales, purchases, expenses, money, vatRate = VAT_RATE }) {
  const now = todayISO();
  const [mode, setMode] = useState("month"); // 'month' | 'year'
  const [vatFilter, setVatFilter] = useState("all"); // 'all' | 'vat' | 'novat'
  const [m, setM] = useState(now.slice(0, 7));
  // years that actually exist in the data (sales + purchases + expenses)
  const years = (() => {
    const set = new Set();
    [...(sales || []), ...(purchases || []), ...(expenses || [])].forEach((x) => { const yy = String(x.date || "").slice(0, 4); if (/^\d{4}$/.test(yy)) set.add(yy); });
    if (set.size === 0) set.add(now.slice(0, 4));
    return Array.from(set).sort().reverse();
  })();
  const [y, setY] = useState(years[0]);
  const keepVat = (isV) => vatFilter === "all" || (vatFilter === "vat" ? isV : !isV);
  const saleIsVat = (x) => !!x.vatEnabled;
  const purchIsVat = (x) => (x.isVat !== undefined ? !!x.isVat : (Number(x.vatThb) || 0) > 0);
  const expIsVat = (x) => (Number(x.vatThb) || 0) > 0;
  const agg = (test) => {
    const S = (sales || []).filter((x) => test(String(x.date || "")) && keepVat(saleIsVat(x)));
    const P = (purchases || []).filter((x) => test(String(x.date || "")) && keepVat(purchIsVat(x)));
    const E = (expenses || []).filter((x) => test(String(x.date || "")) && keepVat(expIsVat(x)));
    const r = { bills: S.length };
    r.saleVatBase = S.reduce((a, x) => a + (x.vatEnabled ? (Number(x.base) || 0) : 0), 0);
    r.outVat = S.reduce((a, x) => a + (Number(x.vat) || 0), 0);
    r.saleNoVat = S.reduce((a, x) => a + (!x.vatEnabled ? (Number(x.total) || 0) : 0), 0);
    r.revenue = r.saleVatBase + r.saleNoVat;
    r.cogs = S.reduce((a, x) => a + (Number(x.cogs) || 0), 0);
    r.purchVat = P.reduce((a, x) => a + (Number(x.vatThb) || 0), 0);
    r.purchBase = P.reduce((a, x) => a + (Number(x.vatBaseThb) || 0), 0);
    r.expVat = E.reduce((a, x) => a + (Number(x.vatThb) || 0), 0);
    r.expAmt = E.reduce((a, x) => a + (Number(x.amount) || 0), 0);
    r.expBase = r.expAmt - r.expVat;
    r.inVat = r.purchVat + r.expVat;
    // marketplace fees (Shopee/Lazada): actual per-bill fee once the payout batch is settled,
    // otherwise the estimate typed at sale — deducted so "net" is the REAL take-home profit
    r.mktFee = round2(S.reduce((a, x) => a + ((x.channel === "shopee" || x.channel === "lazada")
      ? (x.settle ? (Number(x.settle.fee) || 0) : (Number(x.platformFee) || 0)) : 0), 0));
    r.gross = r.revenue - r.cogs;
    r.net = r.gross - r.mktFee - r.expBase;
    return r;
  };
  const smeTax = (p) => { if (p <= 0) return { t1: 0, t2: 0, t3: 0, total: 0 }; const t2 = Math.min(Math.max(p - 300000, 0), 2700000) * 0.15; const t3 = Math.max(p - 3000000, 0) * 0.20; return { t1: 0, t2, t3, total: t2 + t3 }; };
  const M = agg((d) => d.slice(0, 7) === m);
  const Y = agg((d) => d.slice(0, 4) === y);
  const H1 = agg((d) => d.slice(0, 4) === y && d.slice(5, 7) <= "06");
  const estAnnual = H1.net * 2;
  const tax51 = smeTax(estAnnual);
  const tax50 = smeTax(Y.net);
  const beM = (mm) => mm.slice(5, 7) + "/" + (Number(mm.slice(0, 4)) + 543);
  const TH_M = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const monthsOfYear = Array.from({ length: 12 }, (_, i) => { const mm = y + "-" + String(i + 1).padStart(2, "0"); return { lbl: TH_M[i], ...agg((d) => d.slice(0, 7) === mm) }; });
  const Kpi = ({ label, val, sub }) => (<div className="kpi"><div className="kpi-label">{label}</div><div className="kpi-val">฿{money(val)}</div>{sub ? <div className="faint" style={{ fontSize: 11.5 }}>{sub}</div> : null}</div>);
  const off = { opacity: 0.4, pointerEvents: "none", filter: "grayscale(0.7)" };
  return (
    <div>
      <div className="section-title">{t("สรุปบัญชี / ภาษี", "Accounting & tax summary")}</div>
      <div className="section-sub">{t("เลือกดูแบบรายเดือน (ภ.พ.30 + งบเดือน) หรือรายปี (งบปี + ภ.ง.ด.51/50)", "Monthly view (PP.30 + monthly P&L) or annual view (annual statement + PND.51/50)")}</div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="langtoggle" role="group" aria-label="summary mode" style={{ width: "fit-content", marginBottom: 12 }}>
          {[["month", t("รายเดือน", "Monthly")], ["year", t("รายปี", "Annual")]].map(([k, lbl]) => (
            <button key={k} className={"langbtn" + (mode === k ? " on" : "")} onClick={() => setMode(k)}>{lbl}</button>
          ))}
        </div>
        <div className="langtoggle" role="group" aria-label="vat set" style={{ width: "fit-content", marginBottom: 8 }}>
          {[["all", t("รวมทั้งหมด", "All")], ["vat", t("มี VAT", "VAT")], ["novat", t("ไม่มี VAT", "Non-VAT")]].map(([k, lbl]) => (
            <button key={k} className={"langbtn" + (vatFilter === k ? " on" : "")} onClick={() => setVatFilter(k)}>{lbl}</button>
          ))}
        </div>
        <div className="muted" style={{ fontSize: 11.5, marginBottom: 12, lineHeight: 1.5 }}>
          {vatFilter === "all" ? t("📊 ทุกบิล — ภาพรวมจริงเพื่อบริหาร (VAT + ไม่ VAT รวมกัน)", "📊 All bills — real management view") : vatFilter === "vat" ? t("🧾 เฉพาะบิลมี VAT — ชุดที่ตรงกับงบ/ภ.พ.30 ที่ยื่นสรรพากร", "🧾 VAT bills only — matches the tax filing") : t("📦 เฉพาะบิลไม่มี VAT — นอกระบบภาษี (ส่วนต่างที่ต้องชดเชยต้นทุน)", "📦 Non-VAT bills only — outside the tax system")}
        </div>
        <div className="row2">
          <div className="field" style={mode === "year" ? off : null} aria-disabled={mode === "year"}>
            <label>{t("เดือน (ภ.พ.30 / งบรายเดือน)", "Month (PP.30 / monthly)")}</label>
            <input className="input" type="month" value={m} disabled={mode === "year"} onChange={(e) => setM(e.target.value)} />
          </div>
          <div className="field" style={mode === "month" ? off : null} aria-disabled={mode === "month"}>
            <label>{t("ปี (งบปี / ภ.ง.ด.50/51)", "Year (annual / PND.50/51)")}</label>
            <select className="select" value={y} disabled={mode === "month"} onChange={(e) => setY(e.target.value)}>
              {years.map((yy) => <option key={yy} value={yy}>{Number(yy) + 543} ({yy})</option>)}
            </select>
          </div>
        </div>
      </div>

      {mode === "month" && (
        <>
          <div className="line-head" style={{ margin: "4px 0 8px" }}>🧾 {t("ภ.พ.30 — ภาษีมูลค่าเพิ่ม เดือน ", "PP.30 — VAT for ")}{beM(m)}</div>
          <div className="kpi-grid" style={{ marginBottom: 6 }}>
            <Kpi label={t("ยอดขายที่มี VAT (ฐานภาษี)", "VAT sales (base)")} val={M.saleVatBase} sub={M.saleNoVat ? t("ขายไม่เข้า VAT อีก ฿", "non-VAT sales ฿") + money(M.saleNoVat) : null} />
            <Kpi label={t("ภาษีขาย (Output)", "Output VAT")} val={M.outVat} />
            <Kpi label={t("ฐานซื้อ + ค่าใช้จ่ายมีภาษีซื้อ", "Purchases & expenses base")} val={M.purchBase + (M.expVat ? M.expBase : 0)} />
            <Kpi label={t("ภาษีซื้อ (Input)", "Input VAT")} val={M.inVat} sub={t("ซื้อสินค้า ฿", "goods ฿") + money(M.purchVat) + t(" + ค่าใช้จ่าย ฿", " + expenses ฿") + money(M.expVat)} />
          </div>
          <div className="kpi-grid" style={{ marginBottom: 18 }}>
            <div className="kpi" style={{ borderLeft: "4px solid var(--green)" }}>
              <div className="kpi-label">{M.outVat - M.inVat >= 0 ? t("ภาษีต้องนำส่ง (ขาย − ซื้อ)", "VAT payable (out − in)") : t("ภาษีชำระเกิน ขอคืน/ยกไป", "VAT credit (carry/refund)")}</div>
              <div className="kpi-val">฿{money(Math.abs(M.outVat - M.inVat))}</div>
            </div>
          </div>
          <div className="line-head" style={{ margin: "4px 0 8px" }}>📅 {t("งบกำไรขาดทุนรายเดือน ", "Monthly P&L ")}{beM(m)}</div>
          <div className="kpi-grid" style={{ marginBottom: 8 }}>
            <Kpi label={t("รายได้จากการขาย", "Revenue")} val={M.revenue} sub={M.bills + t(" บิล", " bills")} />
            <Kpi label={t("ต้นทุนขาย (FIFO)", "COGS (FIFO)")} val={M.cogs} />
            <Kpi label={t("กำไรขั้นต้น", "Gross profit")} val={M.gross} />
            <Kpi label={t("ค่าธรรมเนียม Shopee/Lazada", "Marketplace fees")} val={M.mktFee} sub={t("ใช้ค่าหักจริงเมื่อเคลียร์รอบโอนแล้ว", "actual once the payout is settled")} />
            <Kpi label={t("กำไรสุทธิจริง (หักค่าธรรมเนียม + ค่าใช้จ่ายร้าน)", "TRUE net (after fees + expenses)")} val={M.net} sub={t("ค่าใช้จ่ายร้าน ฿", "expenses ฿") + money(M.expBase)} />
          </div>
        </>
      )}

      {mode === "year" && (
        <>
          <div className="line-head" style={{ margin: "4px 0 8px" }}>📘 {t("งบประจำปี ", "Annual statement ")}{Number(y) + 543}</div>
          <div className="kpi-grid" style={{ marginBottom: 10 }}>
            <Kpi label={t("รายได้ทั้งปี", "Annual revenue")} val={Y.revenue} sub={Y.bills + t(" บิล", " bills")} />
            <Kpi label={t("ต้นทุนขายทั้งปี", "Annual COGS")} val={Y.cogs} />
            <Kpi label={t("กำไรขั้นต้น", "Gross profit")} val={Y.gross} />
            <Kpi label={t("ค่าธรรมเนียม Shopee/Lazada ทั้งปี", "Annual marketplace fees")} val={Y.mktFee} />
            <Kpi label={t("กำไรสุทธิก่อนภาษี (หักค่าธรรมเนียม + ค่าใช้จ่ายร้าน)", "Net before tax (after fees + expenses)")} val={Y.net} sub={t("ค่าใช้จ่ายร้าน ฿", "expenses ฿") + money(Y.expBase)} />
          </div>
          <div className="kpi-grid" style={{ marginBottom: 18 }}>
            <Kpi label={t("ภาษีขายทั้งปี", "Annual output VAT")} val={Y.outVat} />
            <Kpi label={t("ภาษีซื้อทั้งปี", "Annual input VAT")} val={Y.inVat} />
            <Kpi label={t("ขายไม่เข้า VAT", "Non-VAT sales")} val={Y.saleNoVat} />
            <Kpi label={t("ซื้อสินค้า (ฐานภาษี)", "Goods purchased (base)")} val={Y.purchBase} />
          </div>
          <div className="line-head" style={{ margin: "4px 0 8px" }}>{t("รายเดือนภายในปี ", "Month-by-month ")}{Number(y) + 543}</div>
          <div className="table-scroll" style={{ marginBottom: 18 }}>
            <table className="t">
              <thead><tr><th>{t("เดือน", "Month")}</th><th className="r">{t("ยอดขาย", "Sales")}</th><th className="r">{t("กำไรขั้นต้น", "Gross")}</th><th className="r">{t("ค่าธรรมเนียม", "Fees")}</th><th className="r">{t("ค่าใช้จ่าย", "Expenses")}</th><th className="r">{t("กำไรสุทธิ", "Net")}</th></tr></thead>
              <tbody>{monthsOfYear.map((r, i) => (
                <tr key={i}><td>{r.lbl}</td><td className="r acc-num">{r.revenue ? money(r.revenue) : <span className="faint">—</span>}</td><td className="r acc-num">{r.revenue ? money(r.gross) : ""}</td><td className="r acc-num">{r.mktFee ? money(r.mktFee) : ""}</td><td className="r acc-num">{r.expBase ? money(r.expBase) : ""}</td><td className="r acc-num">{r.revenue || r.expBase || r.mktFee ? money(r.net) : ""}</td></tr>
              ))}</tbody>
            </table>
          </div>

          <div className="line-head" style={{ margin: "4px 0 8px" }}>🌓 {t("ภ.ง.ด.51 — ครึ่งปีแรก (ม.ค.–มิ.ย. ", "PND.51 — first half (Jan–Jun ")}{Number(y) + 543})</div>
          <div className="kpi-grid" style={{ marginBottom: 18 }}>
            <Kpi label={t("กำไรสุทธิจริงครึ่งปีแรก", "Actual H1 net profit")} val={H1.net} />
            <Kpi label={t("ประมาณการกำไรทั้งปี (×2)", "Estimated annual (×2)")} val={estAnnual} />
            <Kpi label={t("ภาษีจากประมาณการ (อัตรา SME)", "Tax on estimate (SME rates)")} val={tax51.total} />
            <Kpi label={t("ชำระตาม ภ.ง.ด.51 (กึ่งหนึ่ง)", "PND.51 payment (half)")} val={tax51.total / 2} />
          </div>

          <div className="line-head" style={{ margin: "4px 0 8px" }}>🏛 {t("ภ.ง.ด.50 — ภาษีเงินได้นิติบุคคล ", "PND.50 — corporate income tax ")}{Number(y) + 543}</div>
          <div className="table-scroll" style={{ marginBottom: 8 }}>
            <table className="t">
              <tbody>
                <tr><td>{t("กำไรสุทธิก่อนภาษี (จากระบบ)", "Net profit before tax (from this system)")}</td><td className="r acc-num">฿{money(Y.net)}</td></tr>
                <tr><td>{t("ช่วง 0 – 300,000 (ยกเว้น SME)", "0 – 300,000 (SME exempt)")}</td><td className="r acc-num">฿0.00</td></tr>
                <tr><td>{t("ช่วง 300,001 – 3,000,000 × 15%", "300,001 – 3,000,000 × 15%")}</td><td className="r acc-num">฿{money(tax50.t2)}</td></tr>
                <tr><td>{t("ส่วนที่เกิน 3,000,000 × 20%", "over 3,000,000 × 20%")}</td><td className="r acc-num">฿{money(tax50.t3)}</td></tr>
                <tr><td><b>{t("ประมาณการภาษีทั้งปี", "Estimated annual tax")}</b></td><td className="r acc-num"><b>฿{money(tax50.total)}</b></td></tr>
                <tr><td>{t("หักที่ชำระแล้วตาม ภ.ง.ด.51", "Less PND.51 already paid")}</td><td className="r acc-num">−฿{money(tax51.total / 2)}</td></tr>
                <tr><td><b>{t("คงเหลือชำระตอนยื่น ภ.ง.ด.50 (ประมาณ)", "Balance due with PND.50 (approx)")}</b></td><td className="r acc-num"><b>฿{money(Math.max(0, tax50.total - tax51.total / 2))}</b></td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
        {t("* อัตรา SME (ทุนชำระแล้ว ≤ 5 ล้าน และรายได้ ≤ 30 ล้าน/ปี) · กำไรสุทธิ = ยอดขาย − ต้นทุนสินค้า − ค่าธรรมเนียม Shopee/Lazada (ค่าหักจริงเมื่อเคลียร์รอบโอนแล้ว ไม่งั้นใช้ค่าประเมินที่กรอกตอนขาย) − ค่าใช้จ่ายร้าน · ยังไม่รวมรายการปรับปรุงทางบัญชี เช่น ค่าเสื่อมราคา สต๊อกปลายปี — ใช้อ้างอิงประกอบการจัดทำงบ ควรให้ผู้ทำบัญชีตรวจทานก่อนยื่นจริง",
           "* SME rates (paid-up ≤ 5M, revenue ≤ 30M) · Net = sales − COGS − marketplace fees (actual once settled, else the estimate typed at sale) − shop expenses · accounting adjustments (depreciation, closing stock) are not included — have your accountant review before filing")}
      </div>
    </div>
  );
}

function Reports({ t, lang, sales, purchases, expenses = [], products, customers, money }) {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(todayISO());
  const [vatFilter, setVatFilter] = useState("all"); // 'all' | 'vat' | 'novat'
  const keepVat = (isV) => vatFilter === "all" || (vatFilter === "vat" ? isV : !isV);
  const pIsVat = (x) => (x.isVat !== undefined ? !!x.isVat : (Number(x.vatThb) || 0) > 0);
  const pname = (p) => (lang === "th" ? p.th : lang === "en" ? p.en : `${p.th} / ${p.en}`);
  const prodCat = (pid) => { const p = products.find((x) => x.id === pid); return (p && p.category && p.category.trim()) ? p.category.trim() : t("ไม่ระบุประเภท", "Uncategorised"); };
  const inRange = sales.filter((s) => (!from || s.date >= from) && (!to || s.date <= to) && keepVat(!!s.vatEnabled));
  const purchIn = (purchases || []).filter((p) => (!from || p.date >= from) && (!to || p.date <= to) && keepVat(pIsVat(p)));
  const expIn = (expenses || []).filter((e) => (!from || e.date >= from) && (!to || e.date <= to) && keepVat((Number(e.vatThb) || 0) > 0));
  const inputVat = purchIn.reduce((a, p) => a + (Number(p.vatThb) || 0), 0) + expIn.reduce((a, e) => a + (Number(e.vatThb) || 0), 0);

  const totalSales = inRange.reduce((a, s) => a + (Number(s.total) || 0), 0);
  const totalBase = inRange.reduce((a, s) => a + (Number(s.base) || 0), 0);
  const totalVat = inRange.reduce((a, s) => a + (Number(s.vat) || 0), 0);
  const totalDisc = inRange.reduce((a, s) => a + (Number(s.discountAmt) || 0), 0);
  const totalCogs = inRange.reduce((a, s) => a + (Number(s.cogs) || 0), 0);

  const byProduct = {}; const byChannel = {}; const byCat = {};
  inRange.forEach((s) => {
    byChannel[s.channel] = (byChannel[s.channel] || 0) + (Number(s.total) || 0);
    (Array.isArray(s.items) ? s.items : []).forEach((it) => {
      const amt = (Number(it.qty) || 0) * (Number(it.price) || 0);
      const prof = (Number(it.qty) || 0) * ((Number(it.price) || 0) - (Number(it.cost) || 0));
      const k = it.productId || it.name;
      if (!byProduct[k]) byProduct[k] = { name: it.name, qty: 0, amt: 0, profit: 0 };
      byProduct[k].qty += Number(it.qty) || 0; byProduct[k].amt += amt; byProduct[k].profit += prof;
      const c = prodCat(it.productId);
      if (!byCat[c]) byCat[c] = { qty: 0, amt: 0 };
      byCat[c].qty += Number(it.qty) || 0; byCat[c].amt += amt;
    });
  });
  const ranking = Object.values(byProduct).sort((a, b) => b.amt - a.amt);
  const cats = Object.entries(byCat).sort((a, b) => b[1].amt - a[1].amt);

  // daily series for the chart (auto-switches to monthly when the range is long)
  const spanDays = (() => { const A = new Date(from + "T00:00:00Z"), B = new Date(to + "T00:00:00Z"); const d = Math.round((B - A) / 86400000) + 1; return isFinite(d) && d > 0 ? d : 1; })();
  const byMonthChart = spanDays > 70;
  const chartMap = {};
  inRange.forEach((sl) => {
    const k = byMonthChart ? String(sl.date || "").slice(0, 7) : String(sl.date || "").slice(0, 10);
    if (!k) return;
    if (!chartMap[k]) chartMap[k] = { sales: 0, profit: 0 };
    chartMap[k].sales += Number(sl.total) || 0;
    chartMap[k].profit += (Number(sl.base) || 0) - (Number(sl.cogs) || 0);
  });
  const chartSeries = [];
  if (byMonthChart) {
    Object.keys(chartMap).sort().forEach((k) => chartSeries.push({ k, ...chartMap[k] }));
  } else {
    const A = new Date(from + "T00:00:00Z");
    for (let i = 0; i < spanDays && i < 370; i++) {
      const k = new Date(A.getTime() + i * 86400000).toISOString().slice(0, 10);
      chartSeries.push({ k, sales: (chartMap[k] || {}).sales || 0, profit: (chartMap[k] || {}).profit || 0 });
    }
  }
  const chartHasData = chartSeries.some((d) => d.sales > 0 || d.profit !== 0);

  const setThisYear = () => { const y = new Date().getFullYear(); setFrom(y + "-01-01"); setTo(y + "-12-31"); };
  const setThisMonth = () => { setFrom(monthStart()); setTo(todayISO()); };

  return (
    <div>
      <div className="section-title">{t("รายงานการขาย", "Sales reports")}</div>
      <div className="section-sub">{t("สรุปยอดขายแยกตามประเภทสินค้า ช่องทาง และอันดับสินค้าขายดี — เลือกช่วงเวลาได้", "Sales by category, channel, and best-selling products — pick any date range")}</div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="row2">
          <div className="field"><label>{t("ตั้งแต่วันที่", "From")}</label><DateInput className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="field"><label>{t("ถึงวันที่", "To")}</label><DateInput className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
        <div className="toolbar" style={{ marginTop: 4 }}>
          <button className="btn btn-sm" onClick={setThisMonth}>{t("เดือนนี้", "This month")}</button>
          <button className="btn btn-sm" onClick={setThisYear}>{t("ทั้งปีนี้", "This year")}</button>
        </div>
        <div className="langtoggle" role="group" aria-label="vat set" style={{ width: "fit-content", marginTop: 10 }}>
          {[["all", t("รวมทั้งหมด", "All")], ["vat", t("มี VAT", "VAT")], ["novat", t("ไม่มี VAT", "Non-VAT")]].map(([k, lbl]) => (
            <button key={k} className={"langbtn" + (vatFilter === k ? " on" : "")} onClick={() => setVatFilter(k)}>{lbl}</button>
          ))}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="line-head" style={{ marginBottom: 2 }}>📊 {byMonthChart ? t("กราฟงบรายเดือน (ช่วงยาวกว่า 70 วัน)", "Monthly chart (range over 70 days)") : t("กราฟงบรายวัน", "Daily chart")}</div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t("แท่งเขียว = ยอดขาย · เส้นทอง = กำไรขั้นต้น (ประมาณ)", "Green bars = sales · gold line = gross profit (approx)")}</div>
        {!chartHasData ? (
          <div className="faint" style={{ fontSize: 13, padding: "14px 0" }}>{t("ยังไม่มียอดขายในช่วงที่เลือก", "No sales in the selected range")}</div>
        ) : (() => {
          const n = chartSeries.length;
          const padL = 10, padR = 10, padT = 16, padB = 26, H = 200;
          const step = Math.max(14, Math.min(46, Math.floor(640 / n)));
          const W = padL + padR + step * n;
          const maxV = Math.max(1, ...chartSeries.map((d) => Math.max(d.sales, d.profit)));
          const minP = Math.min(0, ...chartSeries.map((d) => d.profit));
          const y = (v) => padT + (1 - (v - minP) / (maxV - minP)) * (H - padT - padB);
          const bw = Math.max(6, step - 6);
          const lblEvery = Math.max(1, Math.ceil(n / 14));
          const fmtK = (k) => byMonthChart ? (k.slice(5, 7) + "/" + String((+k.slice(0, 4) + 543) % 100).padStart(2, "0")) : String(+k.slice(8, 10));
          const tipK = (k) => byMonthChart ? (k.slice(5, 7) + "/" + (+k.slice(0, 4) + 543)) : fmtDate(k);
          const pts = chartSeries.map((d, i) => (padL + i * step + step / 2) + "," + y(d.profit)).join(" ");
          return (
            <div className="table-scroll">
              <svg viewBox={"0 0 " + W + " " + H} width={W} height={H} style={{ display: "block" }} role="img" aria-label={t("กราฟยอดขายและกำไร", "Sales & profit chart")}>
                <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="var(--line)" strokeWidth="1" />
                {chartSeries.map((d, i) => (
                  <g key={d.k}>
                    <rect x={padL + i * step + (step - bw) / 2} y={Math.min(y(d.sales), y(0))} width={bw} height={Math.max(1, Math.abs(y(0) - y(d.sales)))} rx="2" fill="var(--green)" opacity={d.sales > 0 ? 0.85 : 0.15}>
                      <title>{tipK(d.k) + "\n" + t("ยอดขาย ฿", "Sales ฿") + money(d.sales) + "\n" + t("กำไรขั้นต้น ฿", "Gross profit ฿") + money(d.profit)}</title>
                    </rect>
                    {(i % lblEvery === 0) && <text x={padL + i * step + step / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--soft)">{fmtK(d.k)}</text>}
                  </g>
                ))}
                <polyline points={pts} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {chartSeries.map((d, i) => (
                  <circle key={"p" + d.k} cx={padL + i * step + step / 2} cy={y(d.profit)} r="2.6" fill="var(--gold)">
                    <title>{tipK(d.k) + " · " + t("กำไร ฿", "Profit ฿") + money(d.profit)}</title>
                  </circle>
                ))}
                <text x={padL} y={12} fontSize="10" fill="var(--soft)">{t("สูงสุด ฿", "max ฿") + money(maxV)}</text>
              </svg>
            </div>
          );
        })()}
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi"><div className="kpi-label">{t("ยอดขายรวม", "Total sales")}</div><div className="kpi-val">฿{money(totalSales)}</div></div>
        <div className="kpi"><div className="kpi-label">{t("จำนวนบิล", "Invoices")}</div><div className="kpi-val">{inRange.length}</div></div>
        <div className="kpi"><div className="kpi-label">{t("กำไรขั้นต้น (ประมาณ)", "Gross profit (approx)")}</div><div className="kpi-val">฿{money(totalBase - totalCogs)}</div></div>
        <div className="kpi"><div className="kpi-label">{t("VAT / ส่วนลด", "VAT / discount")}</div><div className="kpi-val" style={{ fontSize: 16 }}>฿{money(totalVat)} / ฿{money(totalDisc)}</div></div>
      </div>

      <div className="line-head" style={{ margin: "4px 0 8px" }}>{t("สรุปภาษีมูลค่าเพิ่ม (ช่วงที่เลือก)", "VAT summary (selected range)")}</div>
      <div className="kpi-grid" style={{ marginBottom: 18 }}>
        <div className="kpi"><div className="kpi-label">{t("ภาษีขาย (Output)", "Output VAT")}</div><div className="kpi-val">฿{money(totalVat)}</div></div>
        <div className="kpi"><div className="kpi-label">{t("ภาษีซื้อ (Input)", "Input VAT")}</div><div className="kpi-val">฿{money(inputVat)}</div></div>
        <div className="kpi">
          <div className="kpi-label">{totalVat - inputVat >= 0 ? t("ต้องนำส่ง (ขาย−ซื้อ)", "VAT payable (out−in)") : t("ขอคืน/ยกไป (ซื้อ>ขาย)", "VAT credit (in>out)")}</div>
          <div className="kpi-val">฿{money(Math.abs(totalVat - inputVat))}</div>
        </div>
      </div>

      <div className="line-head" style={{ margin: "4px 0 8px" }}>{t("ยอดขายแยกตามประเภทสินค้า", "Sales by product category")}</div>
      <div className="table-scroll" style={{ marginBottom: 18 }}>
        <table className="t"><thead><tr><th>{t("ประเภท", "Category")}</th><th className="r" style={{ width: 90 }}>{t("จำนวน", "Qty")}</th><th className="r" style={{ width: 130 }}>{t("ยอดขาย", "Sales")}</th></tr></thead>
          <tbody>{cats.length === 0 ? <tr><td colSpan={3} className="faint" style={{ textAlign: "center", padding: 16 }}>{t("ยังไม่มีการขายในช่วงนี้", "no sales in this range")}</td></tr>
            : cats.map(([name, v]) => <tr key={name}><td>{name}</td><td className="r acc-num">{v.qty}</td><td className="r acc-num">฿{money(v.amt)}</td></tr>)}</tbody>
        </table>
      </div>

      <div className="line-head" style={{ margin: "4px 0 8px" }}>{t("ยอดขายแยกตามช่องทาง", "Sales by channel")}</div>
      <div className="table-scroll" style={{ marginBottom: 18 }}>
        <table className="t"><thead><tr><th>{t("ช่องทาง", "Channel")}</th><th className="r" style={{ width: 130 }}>{t("ยอดขาย", "Sales")}</th></tr></thead>
          <tbody>{Object.keys(byChannel).length === 0 ? <tr><td colSpan={2} className="faint" style={{ textAlign: "center", padding: 16 }}>—</td></tr>
            : CHANNELS.filter((c) => byChannel[c.k]).map((c) => <tr key={c.k}><td>{lang === "en" ? c.en : c.th}</td><td className="r acc-num">฿{money(byChannel[c.k])}</td></tr>)}</tbody>
        </table>
      </div>

      <div className="line-head" style={{ margin: "4px 0 8px" }}>{t("สินค้าขายดี (เรียงตามยอดขาย)", "Best-selling products (by sales)")}</div>
      <div className="table-scroll">
        <table className="t"><thead><tr><th style={{ width: 40 }}>#</th><th>{t("สินค้า", "Product")}</th><th className="r" style={{ width: 80 }}>{t("ขายได้", "Qty")}</th><th className="r" style={{ width: 120 }}>{t("ยอดขาย", "Sales")}</th><th className="r" style={{ width: 120 }}>{t("กำไร~", "Profit~")}</th></tr></thead>
          <tbody>{ranking.length === 0 ? <tr><td colSpan={5} className="faint" style={{ textAlign: "center", padding: 16 }}>{t("ยังไม่มีการขายในช่วงนี้", "no sales in this range")}</td></tr>
            : ranking.map((r, i) => <tr key={i}><td className="c">{i + 1}</td><td>{r.name}</td><td className="r acc-num">{r.qty}</td><td className="r acc-num">฿{money(r.amt)}</td><td className="r acc-num">฿{money(r.profit)}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("* กำไรเป็นค่าประมาณจากต้นทุนตั้งต้นของสินค้า (ต้นทุนขายจริงใช้ FIFO บันทึกในสมุดรายวัน)", "* Profit is approximate from the product's base cost (actual COGS uses FIFO in the journal)")}</div>
    </div>
  );
}

function ShopSettings({ t, lang, profile, onProfile, banks, onSaveBank, onDeleteBank, onExportData, onRestoreData, fsSupported, linkedFileName, fileSaveErr, onLinkData, onLinkNewData, onReconnectData, onUnlinkData, backupDirName, backupErr, backupLastDate, driveDirName, onPickBackupDir, onReconnectBackup, onUnlinkBackup, onBackupNow, onPickDriveDir, onUnlinkDrive, onListBackups, onLoadBackup, dataCounts, dataSavedAt, auth, onSaveUser, onDeleteUser, onToggleAuth, currentLevel, vatRate = VAT_RATE, onVatRate }) {
  const [bkList, setBkList] = useState(null);   // recent daily snapshots for manual restore
  const [bkBusy, setBkBusy] = useState(false);
  const openBackupList = async () => { setBkBusy(true); try { const l = await onListBackups(); setBkList(l || []); } finally { setBkBusy(false); } };
  const fmtStampLocal = (ms) => { try { const d = new Date(ms); return d.toTimeString().slice(0, 5); } catch (e) { return ""; } };
  const loadOne = async (item) => { if (window.confirm(t("โหลดข้อมูลของวันที่ ", "Load the backup from ") + fmtDate(item.dateISO) + " (" + item.where + ")? " + t("ข้อมูลปัจจุบันจะถูกแทนที่", "Current data will be replaced."))) { await onLoadBackup(item); } };
  const [bank, setBank] = useState({ bankName: "", accountNo: "", accountName: "" });
  const [uForm, setUForm] = useState({ id: "", username: "", name: "", level: 1, password: "" });
  const [vatDraft, setVatDraft] = useState(String(+(vatRate * 100).toFixed(2)));
  useEffect(() => { setVatDraft(String(+(vatRate * 100).toFixed(2))); }, [vatRate]);
  const saveVat = () => { const pct = parseFloat(vatDraft); if (!Number.isFinite(pct) || pct < 0 || pct > 100) { window.alert(t("ใส่อัตรา VAT เป็นเปอร์เซ็นต์ เช่น 7 หรือ 10", "Enter a VAT percent, e.g. 7 or 10")); return; } onVatRate && onVatRate(round2(pct) / 100); window.alert(t("บันทึกอัตรา VAT = " + pct + "% แล้ว", "VAT rate saved: " + pct + "%")); };
  const fileRef = useRef(null);
  const set = (k, v) => onProfile((p) => ({ ...p, [k]: v }));
  const users = (auth && auth.users) || [];
  const hasAdmin = users.some((u) => u.level >= 3);
  const levelName = (lv) => lv >= 3 ? t("3 · ผู้ดูแล (เห็นทุกอย่าง)", "3 · Admin (sees all)") : lv === 2 ? t("2 · สต๊อก/บิล (ไม่เห็นทุน-กำไร)", "2 · Stock/bills (no cost/profit)") : t("1 · ขายอย่างเดียว", "1 · Sell only");
  const resetU = () => setUForm({ id: "", username: "", name: "", level: 1, password: "" });
  const submitU = () => {
    if (!uForm.username.trim()) { window.alert(t("กรอกชื่อผู้ใช้", "Enter a username")); return; }
    if (!uForm.id && !uForm.password) { window.alert(t("ตั้งรหัสผ่านสำหรับผู้ใช้ใหม่", "Set a password for the new user")); return; }
    if (users.some((u) => u.username.trim().toLowerCase() === uForm.username.trim().toLowerCase() && u.id !== uForm.id)) { window.alert(t("ชื่อผู้ใช้นี้มีอยู่แล้ว", "That username already exists")); return; }
    onSaveUser({ ...uForm });
    resetU();
  };
  const editU = (u) => setUForm({ id: u.id, username: u.username, name: u.name || "", level: u.level, password: "" });
  const addBank = () => { if (!bank.bankName.trim()) { alert(t("กรอกชื่อธนาคาร", "Enter a bank name")); return; } onSaveBank({ ...bank }); setBank({ bankName: "", accountNo: "", accountName: "" }); };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const obj = JSON.parse(rd.result);
        if (window.confirm(t("กู้คืน/แทนที่ข้อมูลทั้งหมดด้วยไฟล์นี้? (ข้อมูลปัจจุบันจะถูกทับ)", "Replace ALL current data with this file?"))) onRestoreData(obj);
      } catch (err) { alert(t("อ่านไฟล์ไม่ได้ — ต้องเป็นไฟล์ .json ที่ส่งออกจากระบบนี้ หรือไฟล์แปลงข้อมูล", "Couldn't read the file — must be a .json export/converted file")); }
      e.target.value = "";
    };
    rd.readAsText(f);
  };
  return (
    <div>
      <div className="section-title">{t("ตั้งค่าร้าน", "Shop settings")}</div>
      <div className="section-sub">{t("ข้อมูลร้านจะไปแสดงบนหัวใบกำกับภาษี/ใบเสร็จ และจัดการบัญชีธนาคารสำหรับรับเงินโอน/เช็ค", "Shop details appear on the invoice header; manage bank accounts for transfers/cheques")}</div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="line-head" style={{ marginBottom: 10 }}>{t("ข้อมูลร้าน (ผู้ขาย)", "Shop (seller) details")}</div>
        <div className="row2">
          <div className="field"><label>{t("ชื่อร้าน / บริษัท", "Shop / company name")}</label><input className="input" value={profile.shopName || ""} onChange={(e) => set("shopName", e.target.value)} /></div>
          <div className="field"><label>{t("เลขประจำตัวผู้เสียภาษี", "Tax ID")}</label><input className="input" inputMode="numeric" value={profile.taxId || ""} onChange={(e) => set("taxId", e.target.value)} placeholder="0000000000000" /></div>
        </div>
        <div className="field"><label>{t("ที่อยู่ (สำหรับออกบิล)", "Address (for invoices)")}</label><textarea className="input" rows={2} value={profile.shopAddress || ""} onChange={(e) => set("shopAddress", e.target.value)} /></div>
        <div className="row2">
          <div className="field"><label>{t("สาขา", "Branch")}</label><input className="input" value={profile.branch || ""} onChange={(e) => set("branch", e.target.value)} placeholder={t("สำนักงานใหญ่", "Head office")} /></div>
          <div className="field"><label>{t("โทรศัพท์", "Phone")}</label><input className="input" value={profile.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
        </div>
        <div className="field">
          <label>{t("โลโก้ร้าน (แสดงมุมขวาบนของบิล)", "Shop logo (top-right of invoices)")}</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {profile.logo
              ? <img src={profile.logo} alt="logo" style={{ height: 52, maxWidth: 180, objectFit: "contain", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: 4 }} />
              : <span className="faint">{t("ยังไม่มีโลโก้", "No logo")}</span>}
            <label className="btn btn-sm" style={{ cursor: "pointer" }}>
              {profile.logo ? t("เปลี่ยนรูป", "Change") : t("อัปโหลดรูป", "Upload")}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => set("logo", r.result); r.readAsDataURL(f); e.target.value = ""; }} />
            </label>
            {profile.logo && <button className="btn btn-sm btn-danger" onClick={() => set("logo", "")}>{t("ลบโลโก้", "Remove")}</button>}
          </div>
          <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>{t("แนะนำ PNG พื้นหลังโปร่งใสหรือขาว กว้างราว 300px", "PNG with transparent or white background, ~300px wide")}</div>
        </div>
        <label className="checkrow"><input type="checkbox" checked={!!profile.vatRegistered} onChange={(e) => set("vatRegistered", e.target.checked)} />{t("ร้านจดทะเบียนภาษีมูลค่าเพิ่ม (VAT) — ตั้งต้นออกใบกำกับภาษี/ใบเสร็จรับเงินทุกบิล", "VAT-registered — default every sale to a tax invoice/receipt")}</label>
        <div className="muted" style={{ fontSize: 12 }}>{t("บันทึกอัตโนมัติ", "Saved automatically")}</div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="line-head" style={{ marginBottom: 10 }}>{t("อัตราภาษีมูลค่าเพิ่ม (VAT)", "VAT rate")}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="field" style={{ margin: 0, maxWidth: 160 }}><label>{t("อัตรา VAT (%)", "VAT rate (%)")}</label>
            <input className="input r" inputMode="decimal" value={vatDraft} onChange={(e) => setVatDraft(e.target.value)} placeholder="7" />
          </div>
          <button className="btn btn-sm btn-primary" onClick={saveVat}>{t("บันทึกอัตรา", "Save rate")}</button>
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("ใช้กับทั้งภาษีขาย (บิลขาย) และภาษีซื้อ (บิลซื้อ) — ปัจจุบัน 7% ปรับเป็น 10% ในอนาคตได้ที่นี่ บิลเก่าที่บันทึกไว้แล้วไม่เปลี่ยน", "Applies to both output VAT (sales) and input VAT (purchases). Currently 7% — change to 10% here when needed. Past saved bills are unaffected.")}</div>
      </div>

      <div className="card card-pad">
        <div className="line-head" style={{ marginBottom: 10 }}>{t("บัญชีธนาคาร (รับเงินโอน / เช็ค)", "Bank accounts (transfers / cheques)")}</div>
        {banks.length > 0 && (
          <div className="table-scroll" style={{ marginBottom: 12 }}>
            <table className="t"><thead><tr><th>{t("ธนาคาร", "Bank")}</th><th>{t("เลขที่บัญชี", "Account no.")}</th><th>{t("ชื่อบัญชี", "Account name")}</th><th className="c" style={{ width: 92 }}>{t("โชว์บนบิล", "On bill")}</th><th style={{ width: 40 }}></th></tr></thead>
              <tbody>{banks.map((b) => <tr key={b.id}><td>{b.bankName}</td><td className="code">{b.accountNo}</td><td>{b.accountName}</td><td className="c"><input type="checkbox" checked={b.showOnBill !== false} onChange={(e) => onSaveBank({ ...b, showOnBill: e.target.checked })} title={t("ติ๊กออก = บิลที่รับโอนเข้าบัญชีนี้พิมพ์เป็น “เงินสด”", "untick = bills paid into this account print as Cash")} /></td><td className="c"><button className="icon-btn" onClick={() => { if (window.confirm(t("ลบบัญชีนี้?", "Delete this account?"))) onDeleteBank(b.id); }}>×</button></td></tr>)}</tbody>
            </table>
          </div>
        )}
        {banks.length > 0 && <div className="faint" style={{ fontSize: 11.5, marginTop: -6, marginBottom: 10 }}>{t("“โชว์บนบิล”: ติ๊กออกแล้ว บิลขายที่รับโอนเข้าบัญชีนั้นจะพิมพ์ว่า “เงินสด” — หลังบ้าน (ประวัติ/สมุดบัญชี) ยังบันทึกเป็นเงินโอนตามจริง", "“On bill”: untick and sales bills paid into that account print “Cash” — the books still record the actual transfer")}</div>}
        <div className="row2">
          <div className="field"><label>{t("ธนาคาร", "Bank")}</label><input className="input" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} placeholder={t("เช่น กสิกรไทย", "e.g. KBank")} /></div>
          <div className="row2" style={{ gap: 12 }}>
            <div className="field"><label>{t("เลขที่บัญชี", "Account no.")}</label><input className="input" value={bank.accountNo} onChange={(e) => setBank({ ...bank, accountNo: e.target.value })} /></div>
            <div className="field"><label>{t("ชื่อบัญชี", "Account name")}</label><input className="input" value={bank.accountName} onChange={(e) => setBank({ ...bank, accountName: e.target.value })} /></div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={addBank}>+ {t("เพิ่มบัญชีธนาคาร", "Add bank account")}</button>
      </div>

      {currentLevel >= 3 && (
        <div className="card card-pad" style={{ marginTop: 18 }}>
          <div className="line-head" style={{ marginBottom: 10 }}>{t("ผู้ใช้งาน & รหัสผ่าน (ระดับสิทธิ์)", "Users & passwords (roles)")}</div>
          <label className="checkrow"><input type="checkbox" checked={!!(auth && auth.enabled)} onChange={(e) => onToggleAuth(e.target.checked)} />{t("เปิดระบบล็อกอิน — เปิดโปรแกรมต้องเข้าสู่ระบบก่อน แล้วเริ่มที่โหมดขาย", "Require login — app opens to a sign-in, then starts in POS")}</label>
          {auth && auth.enabled && !hasAdmin && (
            <div className="flash err" style={{ marginBottom: 10 }}>{t("⚠ ยังไม่มีผู้ใช้ระดับ 3 (ผู้ดูแล) — สร้างก่อน ไม่งั้นอาจเข้าโหมดบัญชีไม่ได้", "⚠ No level-3 admin yet — create one or you may lock yourself out of accounting")}</div>
          )}

          {users.length > 0 && (
            <div className="table-scroll" style={{ marginBottom: 12 }}>
              <table className="t">
                <thead><tr><th>{t("ชื่อ", "Name")}</th><th>{t("ชื่อผู้ใช้", "Username")}</th><th>{t("ระดับสิทธิ์", "Level")}</th><th style={{ width: 96 }}></th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name || <span className="faint">—</span>}</td>
                      <td className="code">{u.username}</td>
                      <td>{levelName(u.level)}</td>
                      <td className="c" style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-sm" onClick={() => editU(u)}>{t("แก้ไข", "Edit")}</button>
                        <button className="icon-btn" title={t("ลบ", "Delete")} onClick={() => { if (window.confirm(t("ลบผู้ใช้ " + u.username + "?", "Delete user " + u.username + "?"))) onDeleteUser(u.id); }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="line-head" style={{ marginBottom: 8, fontSize: 14 }}>{uForm.id ? t("แก้ไขผู้ใช้", "Edit user") : t("เพิ่มผู้ใช้ใหม่", "Add a user")}</div>
          <div className="row2">
            <div className="field"><label>{t("ชื่อผู้ใช้ (สำหรับล็อกอิน)", "Username")}</label><input className="input" value={uForm.username} onChange={(e) => setUForm({ ...uForm, username: e.target.value })} placeholder="cashier1" /></div>
            <div className="field"><label>{t("ชื่อ-สกุล (แสดงผล)", "Display name")}</label><input className="input" value={uForm.name} onChange={(e) => setUForm({ ...uForm, name: e.target.value })} placeholder={t("เช่น สมชาย", "e.g. Somchai")} /></div>
          </div>
          <div className="row2">
            <div className="field">
              <label>{t("ระดับสิทธิ์", "Authority level")}</label>
              <select className="select" value={uForm.level} onChange={(e) => setUForm({ ...uForm, level: Number(e.target.value) })}>
                <option value={1}>{t("1 · ขายอย่างเดียว", "1 · Sell only")}</option>
                <option value={2}>{t("2 · สต๊อก/รับเข้า/ออกบิล/แก้บิล (ไม่เห็นทุน-กำไร)", "2 · Stock/receive/bills (no cost/profit)")}</option>
                <option value={3}>{t("3 · ผู้ดูแล — เห็นทุกอย่าง", "3 · Admin — sees everything")}</option>
              </select>
            </div>
            <div className="field"><label>{uForm.id ? t("รหัสผ่านใหม่ (เว้นว่าง = คงเดิม)", "New password (blank = keep)") : t("รหัสผ่าน", "Password")}</label><input className="input" type="password" value={uForm.password} onChange={(e) => setUForm({ ...uForm, password: e.target.value })} placeholder="••••••" /></div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary btn-sm" onClick={submitU}>{uForm.id ? t("บันทึกผู้ใช้", "Save user") : "+ " + t("เพิ่มผู้ใช้", "Add user")}</button>
            {uForm.id && <button className="btn btn-sm" onClick={resetU}>{t("ยกเลิก", "Cancel")}</button>}
          </div>
          <div className="faint" style={{ fontSize: 12, marginTop: 10 }}>
            {t("ระดับ 1 = เข้าได้แค่โหมดขาย · ระดับ 2 = จัดการสต๊อก/บิล/ลูกค้า แต่ไม่เห็นต้นทุนและกำไร · ระดับ 3 = เห็นและตั้งค่าได้ทุกอย่าง · ปุ่ม \"เข้าโหมดบัญชี\" ในหน้าขายต้องใช้ผู้ใช้ระดับ 2 ขึ้นไป",
              "Level 1 = POS only · Level 2 = stock/bills/customers but no cost or profit · Level 3 = full access · the POS \"Accounting\" button needs a level-2+ user.")}
          </div>
          <div className="faint" style={{ fontSize: 12, marginTop: 6 }}>
            {t("ℹ️ บนไฟล์ standalone นี่คือการป้องกันระดับ \"กันเผลอ\" (ข้อมูลอยู่ในเครื่อง) — ถ้าต้องการบังคับสิทธิ์อย่างแท้จริง ใช้เวอร์ชันออนไลน์ที่กรองข้อมูลฝั่งเซิร์ฟเวอร์", "ℹ️ On the standalone this is a soft gate (data lives on the device). For truly enforced roles, use the online server version.")}
          </div>
        </div>
      )}

      <div className="card card-pad" style={{ marginTop: 18 }}>
        <div className="line-head" style={{ marginBottom: 10 }}>{t("สำรอง / กู้คืน / นำเข้าข้อมูล (.json)", "Backup / Restore / Import (.json)")}</div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          {t("ส่งออกข้อมูลทั้งหมดเป็นไฟล์ไว้สำรอง หรือโหลดไฟล์ .json (รวมถึงไฟล์ข้อมูลร้านที่แปลงมาจากระบบเดิม) เพื่อแทนที่ข้อมูลปัจจุบัน",
            "Export everything as a backup file, or load a .json file (including data converted from your old system) to replace current data.")}
        </div>
        <div className="btn-row">
          <button className="btn" onClick={onExportData}>⬇ {t("ส่งออกข้อมูลทั้งหมด", "Export all data")}</button>
          <button className="btn btn-primary" onClick={() => fileRef.current && fileRef.current.click()}>⬆ {t("นำเข้า / กู้คืนจากไฟล์", "Import / Restore from file")}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={onFile} />
        </div>
        <div className="faint" style={{ fontSize: 12, marginTop: 8 }}>{t("⚠ การนำเข้าจะแทนที่ข้อมูลทั้งหมดในเครื่อง/บัญชีนี้ — ควรส่งออกสำรองไว้ก่อน", "⚠ Importing replaces all data on this device/account — export a backup first")}</div>
      </div>

      <div className="card card-pad" style={{ marginTop: 18 }}>
        <div className="line-head" style={{ marginBottom: 10 }}>{t("เซฟอัตโนมัติลงไฟล์ใน Google Drive (ใช้ทีละเครื่อง)", "Auto-save to a Google Drive file (one device at a time)")}</div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          {t("เชื่อมไฟล์ .json ที่อยู่ในโฟลเดอร์ Google Drive (ที่ลง Google Drive for desktop ให้ sync ลงเครื่องแล้ว) จากนั้นโปรแกรมจะเซฟทับไฟล์นั้นให้อัตโนมัติทุกครั้งที่มีการเปลี่ยนแปลง — ไม่ต้องกดส่งออก/นำเข้าเอง",
            "Link a .json file inside your Google Drive folder (synced to this PC via Google Drive for desktop). The app then auto-writes that file on every change — no manual export/import needed.")}
        </div>

        {!fsSupported ? (
          <div className="faint" style={{ fontSize: 13 }}>{t("ฟีเจอร์นี้ใช้ได้บน Chrome หรือ Edge (บนคอมพิวเตอร์) เท่านั้น — บน Safari/มือถือให้ใช้ปุ่มส่งออก/นำเข้าด้านบนแทน", "This feature works on desktop Chrome or Edge only — on Safari/mobile use Export/Import above.")}</div>
        ) : linkedFileName ? (
          <div>
            <div style={{ fontSize: 14, marginBottom: 10 }}>
              {t("เชื่อมแล้ว: ", "Linked: ")}<b>{linkedFileName}</b> {fileSaveErr ? "" : <span style={{ color: "var(--green)" }}>· {t("กำลังเซฟอัตโนมัติ", "auto-saving")}</span>}
            </div>
            {fileSaveErr && (
              <div className="flash err" style={{ marginBottom: 10 }}>{fileSaveErr}</div>
            )}
            <div className="btn-row">
              {fileSaveErr && <button className="btn btn-primary" onClick={onReconnectData}>🔄 {t("เชื่อมต่อใหม่", "Reconnect")}</button>}
              <button className="btn btn-danger" onClick={onUnlinkData}>{t("ยกเลิกการเชื่อมไฟล์", "Unlink file")}</button>
            </div>
          </div>
        ) : (
          <div className="btn-row">
            <button className="btn btn-primary" onClick={onLinkData}>🔗 {t("เชื่อมไฟล์ข้อมูลที่มีอยู่", "Link existing file")}</button>
            <button className="btn" onClick={onLinkNewData}>✚ {t("สร้างไฟล์ข้อมูลใหม่", "Create new file")}</button>
          </div>
        )}

        <div className="faint" style={{ fontSize: 12, marginTop: 10 }}>
          {t("⚠ ปลอดภัยเมื่อใช้ทีละเครื่องเท่านั้น — อย่าเปิดแก้ไขพร้อมกันหลายเครื่องผ่าน Drive (ไฟล์จะทับกัน) · ถ้าต้องการหลายเครื่องพร้อมกันให้ใช้เวอร์ชันออนไลน์ (เซิร์ฟเวอร์+ฐานข้อมูล) · หลังเปิดโปรแกรมใหม่ อาจต้องกด \"เชื่อมต่อใหม่\" 1 ครั้ง",
            "⚠ Safe for one device at a time only — don't edit from multiple devices via Drive simultaneously (files overwrite each other). For concurrent multi-device use the online server version. After reopening the app you may need to click \"Reconnect\" once.")}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="line-head" style={{ marginBottom: 4 }}>🗂 {t("สำรองอัตโนมัติ (ไฟล์ใหม่ทุกครั้ง ไม่ทับกัน · เก็บ 30 ชุดล่าสุด)", "Automatic backup (a new file each time, never overwrites · keeps last 30)")}</div>
        <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
          {t("เลือกได้ 2 ที่: โฟลเดอร์ในเครื่อง และโฟลเดอร์ที่ซิงค์กับ Google Drive — ระบบเขียนไฟล์ thaicolor-backup-วันที่_เวลา.json ทุกครั้งที่สำรอง (ไม่ทับของเดิม) เก็บ 30 ชุดล่าสุด และทุกครั้งที่เปิดจะ \u0022ตรวจหาข้อมูลล่าสุด\u0022 ข้ามเครื่องให้ ถ้าพบของใหม่กว่าจะถามก่อนโหลด", "Pick up to 2 places: an in-device folder and a Google-Drive-synced folder. It writes a timestamped thaicolor-backup-<date>_<time>.json on each save (never overwrites, keeps the last 30), and on every open it checks for the latest data across devices and asks before loading anything newer.")}
        </div>
        {!fsSupported ? (
          <div className="muted">{t("เบราว์เซอร์นี้ไม่รองรับ — ใช้ Chrome หรือ Edge (ใช้ได้ทั้ง Mac และ PC)", "Not supported here — use Chrome or Edge (works on Mac and PC)")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* in-device folder */}
            <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>💻 {t("โฟลเดอร์ในเครื่อง", "In-device folder")}</div>
              {backupDirName ? (
                <>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>{t("โฟลเดอร์: ", "Folder: ")}<b>{backupDirName}</b>
                    {backupLastDate ? <span style={{ color: "var(--green)" }}> · {t("ล่าสุด ", "last ")}{fmtDate(backupLastDate)}</span> : <span className="faint"> · {t("รอรอบแรก", "waiting")}</span>}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-sm" onClick={onBackupNow}>{t("สำรองตอนนี้", "Back up now")}</button>
                    <button className="btn btn-sm" onClick={onPickBackupDir}>{t("เปลี่ยนโฟลเดอร์", "Change")}</button>
                    <button className="btn btn-sm btn-danger" onClick={onUnlinkBackup}>{t("ปิด", "Off")}</button>
                  </div>
                </>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={onPickBackupDir}>📁 {t("เลือกโฟลเดอร์ในเครื่อง", "Choose in-device folder")}</button>
              )}
            </div>
            {/* Google Drive folder */}
            <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>☁️ {t("โฟลเดอร์ Google Drive", "Google Drive folder")}</div>
              {driveDirName ? (
                <>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>{t("โฟลเดอร์: ", "Folder: ")}<b>{driveDirName}</b></div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-sm" onClick={onPickDriveDir}>{t("เปลี่ยนโฟลเดอร์", "Change")}</button>
                    <button className="btn btn-sm btn-danger" onClick={onUnlinkDrive}>{t("ปิด", "Off")}</button>
                  </div>
                </>
              ) : (
                <>
                  <button className="btn btn-primary btn-sm" onClick={onPickDriveDir}>☁️ {t("เลือกโฟลเดอร์ใน Google Drive", "Choose a Google Drive folder")}</button>
                  <div className="faint" style={{ fontSize: 11.5, marginTop: 6 }}>{t("ต้องติดตั้ง \u0022Google Drive for desktop\u0022 ก่อน แล้วเลือกโฟลเดอร์ที่อยู่ในไดรฟ์ (เช่น My Drive/ThaiColor-Backup) — ไฟล์จะซิงค์ขึ้นคลาวด์ให้อัตโนมัติ", "Install \u0022Google Drive for desktop\u0022, then pick a folder inside your Drive (e.g. My Drive/ThaiColor-Backup) — files sync to the cloud automatically.")}</div>
                </>
              )}
            </div>
            {backupErr && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "var(--red)", fontSize: 13 }}>{backupErr}</span><button className="btn btn-sm btn-primary" onClick={onReconnectBackup}>🔄 {t("เชื่อมต่อ/ตรวจข้อมูลใหม่", "Reconnect / re-check")}</button></div>}

            {/* choose a data source to load — shows how many records each one has */}
            <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>📂 {t("เลือกแหล่งข้อมูลที่จะใช้", "Choose which data to load")}</div>
              <div className="faint" style={{ fontSize: 11.5, marginBottom: 8 }}>{t("กดดูรายการสำรองในโฟลเดอร์ที่เชื่อมไว้ — ระบบจะบอกจำนวนข้อมูลในแต่ละไฟล์ ให้เลือกอันที่มีข้อมูลครบมาโหลดเองได้", "List the backups in your connected folders — each shows how many records it has, so you can load the one with the data you want.")}</div>
              <button className="btn btn-sm" disabled={bkBusy} onClick={openBackupList}>{bkBusy ? t("กำลังอ่าน…", "Reading…") : "🔍 " + t("ดูไฟล์สำรองที่มี", "Show available backups")}</button>
              {dataCounts && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "1px solid var(--green)", background: "var(--green-soft)", borderRadius: 8, padding: "7px 10px" }}>
                  <div style={{ fontSize: 13 }}>
                    <b>💻 {t("เครื่องนี้ตอนนี้", "This device now")}</b>
                    <span className="faint"> · {dataSavedAt ? fmtDate(String(dataSavedAt).slice(0, 10)) : t("ยังไม่บันทึก", "unsaved")}</span>
                    <div style={{ fontSize: 12, color: "var(--soft)" }}>{dataCounts.sales} {t("ขาย", "sales")} · {dataCounts.products} {t("สินค้า", "products")} · {dataCounts.customers} {t("ลูกค้า", "customers")}</div>
                  </div>
                  <span className="faint" style={{ fontSize: 11.5 }}>{t("กำลังใช้อยู่", "in use")}</span>
                </div>
              )}
              {bkList && (bkList.length ? (
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  {bkList.map((it, i) => {
                    const empty = it.counts && (it.counts.sales + it.counts.products + it.counts.customers) === 0;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "1px solid var(--line)", borderRadius: 8, padding: "7px 10px", opacity: empty ? 0.6 : 1 }}>
                        <div style={{ fontSize: 13 }}>
                          <b>{fmtDate(it.dateISO)}</b>
                          <span className="faint"> · {it.where === "Google Drive" ? "☁️" : "💻"} {it.where}{it.lastModified ? " · " + fmtStampLocal(it.lastModified) : ""}</span>
                          <div style={{ fontSize: 12, color: empty ? "var(--red)" : "var(--soft)" }}>
                            {it.counts ? <>{it.counts.sales} {t("ขาย", "sales")} · {it.counts.products} {t("สินค้า", "products")} · {it.counts.customers} {t("ลูกค้า", "customers")}{empty ? " — " + t("ว่าง", "empty") : ""}</> : t("อ่านจำนวนไม่ได้", "count unavailable")}{it.size ? <span className="faint"> · {it.size >= 1048576 ? (it.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(it.size / 1024)) + " KB"}</span> : null}
                          </div>
                        </div>
                        <button className="btn btn-sm btn-primary" onClick={() => loadOne(it)}>⬇️ {t("โหลด", "Load")}</button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>{t("ยังไม่พบไฟล์สำรองในโฟลเดอร์ที่เชื่อมไว้ (อาจต้องกดอนุญาต/เชื่อมต่อใหม่ก่อน)", "No backups found in the connected folders (you may need to grant/reconnect first).")}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
