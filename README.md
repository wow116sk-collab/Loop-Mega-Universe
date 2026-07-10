# Loop Mega Universe (LMU) — a cyclic black-hole cosmology framework

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20692157.svg)](https://doi.org/10.5281/zenodo.20692157)

**Current version: V3.28 (2026-07-08) — 108 pp, XeLaTeX.**
Author: Pitarn Rungsiyapornratana ([ORCID 0009-0004-6411-2201](https://orcid.org/0009-0004-6411-2201)) · [Zenodo (all versions)](https://doi.org/10.5281/zenodo.20692157) · [OSF](https://osf.io/2ac8x) · [OSF pre-registration — falsifiers](https://doi.org/10.17605/OSF.IO/CN3B4)

**New here?** Read [**STORY.md**](STORY.md) first — the whole cycle in five acts, plain language, no equations, five minutes.

## What this is

LMU is a **worldview-level synthesis, not a new predictive theory**: it wires *established, cited* physics into one coherent cyclic picture and then subjects the wiring to falsifiers. Every mechanism belongs to its published owner (attribution rule R7 is enforced throughout the document); the framework's own contributions are the conventions, the read-acrosses, and the wiring.

**The cycle in one paragraph.** An aeon ends cold, dilute, and clumpy: structure funnels through a black-hole size ladder (L4 gas/stars → L3 galactic BH → L2 BCG BH → L1 the last survivor). The survivor stops spinning (Page), evaporates, and its terminal Hawking flash — at the post-evaporation Planck-scale endpoint, not the 10¹¹ M☉ body — seeds a catalyzed Coleman–De Luccia bounce (Gregory–Moss–Withers). One flash = one bubble = one aeon: on the interior slicing the hot start is simultaneous across the new aeon, homogeneous by instanton symmetry, with density arriving by in-place conversion of the latent vacuum energy (ρ ≈ ΔV; Guth's free lunch). The re-opened entropy gap (Frautschi) — the aeon's fresh negentropy budget — re-arms the thermodynamic arrow, and dilution into the unbounded substrate keeps the total ledger second-law-safe (Ijjas–Steinhardt-type resolution, strengthened to an actually infinite L0).

**Two axioms only:** the substrate (q) and Λ (a constant; no origin mechanism sought). Dark matter is *not* a given — it is re-created each aeon at the hot boundary as a collisionless thermal relic, symmetric with baryons.

## Methodology (labels or it didn't happen)

Every load-bearing statement in the document carries a label:

- **[Fact]** — measured / peer-reviewed,
- **[Fact-theory]** — established theory,
- **[Hypothesis]** — an assumption with literature support (the framework's own machinery included),
- **[Speculation]** — no equations yet,
- **[Design]** — structural choice,
- **[Open]** — unsolved,
- **[Dead-end]** — failed (kept as failure logs),
- **[Auditor]** — editor addition.

*(Working alias in session logs: Fact-eq ≡ Fact-theory with the checkable numbers shown.)*

Dead ends are kept, not deleted (failure logs); rebuttals are tested for wrong-population sampling (R8); "verdict right, numbers wrong" is treated as the worst failure mode (R6).

## Verification culture

Independent recomputation, not self-citation: the physics-constant spine is re-derived from CODATA (Hawking temperature, evaporation time, Bekenstein–Hawking and Zurek 4/3 entropies, Nariai ceiling); the dark-energy sector is re-integrated from the Klein–Gordon equation (6/6 (w₀, wₐ) rows reproduced to three decimals, no phantom crossing — Vikman); dimensional audits pass 13/13; the relic-galaxy statistics reproduce exactly from the published dynamical masses. Verification scripts live in `/code`: `verify_all.py` (CODATA spine, Klein–Gordon m-scan, relic statistics, N_Q budget, tex integrity) and `lmu_endgame_repro.py` (Result-2 endgame run provenance).

## Pre-registered falsifier lines

- **F1 — dark energy:** a canonical thawing field can match DESI DR2's w₀ *or* wₐ, not both (document shows the full m-scan); **DESI-Y5 (~2027)** sharpens or breaks this.
- **F2 — black-hole spin:** survivor/BCG spin history; next-generation EHT / **BHEX era (2030s)**. Current inventory already logs M87* polarimetry (Wong et al. 2025) disfavouring high spin as an *offsetting* flag.
- **F3 —** re-scoped: the P(k) re-initialization falsifier was ruled and re-scoped at V3.12 (see in-document revision history).
- **F4 — single-instanton origin signature** ("Open, flat, smooth by one instanton — and a clean F4"): the 10¹⁶ GeV ignition scale gives r ≈ 0.009 (ε ≈ 5.7×10⁻⁴) against the current bound r < 0.036 (BICEP/Keck); **LiteBIRD-class** sensitivity tests it.

These lines (plus **F5** — the predicted *absence* of CCC-style Hawking points / concentric circles — and **F6** — a tiny-positive-de-Sitter endgame, falsified by a future AdS transition) are **pre-registered on OSF** with fixed, immutable thresholds, before the deciding data: **[doi.org/10.17605/OSF.IO/CN3B4](https://doi.org/10.17605/OSF.IO/CN3B4)** (see `FALSIFIERS_preregistration_V3.28.pdf`).

## The open problem (owned, not hidden)

Since V3.27 the reset is read as a **deterministic flash** (the survivor's evaporation is *certain* → its terminal flash triggers a field already on the α-attractor plateau — no metastable barrier, no tunnelling). That collapses the LMU-specific gaps to **one linked initial-condition question**:

- **The wiring** `[Hypo → soft/favoured]` — ω (the prior aeon's CCC conformal factor Ω) *is* the α-attractor inflaton. Most of the machinery is borrowed/owned (Ω becomes a physical scalar post-crossover — Penrose's own construction; conformal scalars α-attract — Kallosh–Linde, Tang); the one irreducible line (the post-crossover scalar's potential is the α=1 **plateau**, not the erebon **mass**) is now *naturalness-favoured* (trace anomaly → plateau + a massless-early scalar = inflaton). This same flash→plateau IC family now also carries the **relocated residue of the old "+3 spread"** (V3.28 re-derives it to the **standard flatness problem**, solved by enough *total* e-folds — the earlier "63 orders short in 57 e-folds" was an epoch-mismatch artifact). Closing it is CCC's own field-wide *"fix Ω uniquely"* problem (Tod 2023) — inherited, not created; **nobody has closed it.**

**Field-wide, not LMU-private (homed, not hidden):** de Sitter stability (Volovik P>0 vs Boddy–Carroll–Pollack P=0), the eternal-inflation **measure problem** (Olum 2012, fork-5 / unbounded L0), the swampland, and V_min=0-exactly are questions *every* inflationary cosmology shares — the deterministic-flash reset needs no metastable minimum, so they are **not LMU closure-blockers**. Single source of truth for open-item status: `review/LMU_SYNTHESIS_2026-07-07.md`.

**The full research map — every open problem with its status, the expertise it needs, and where to look:** [`OPEN_PROBLEMS.md`](OPEN_PROBLEMS.md).

## Empirical anchors in the current inventory (live-verified July 2026)

DESI DR2 (arXiv:2503.14738) · six-relic compilation Cohn et al. 2025 (arXiv:2504.00172) + Walsh 2015–17, Cohn 2021–24 ALMA masses · NGC 384 · JWST over-massive BHs incl. A2744-QSO1 (Juodžbalis et al. 2026) · UHZ1 (contested) · **GW231123** (LVK 2025: 137+103 → 225 M☉, χ ~ 0.9/0.8 — mass-gap, merger-built; caveats logged) · nanohertz GW background, five concordant PTAs incl. MPTA (Miles et al. 2025) · Planck 2018 · BICEP/Keck.

## Recent versions

| Version | Date | One-liner |
|---|---|---|
| 3.28 | 2026-07-08 | Release consolidation of the post-3.27 run: CEAW reinstated (L2 state-diagnostic); external-cosmology refresh (ACT DR6 n_s↑, ν-anomaly, CCBH, DESI DR2) folded in as drift; ACT-tension resolved via extended α-attractor (borrowed, one tuned parameter); wiring bridge tightened + selection argument → ω=inflaton now [Hypo→soft/favoured]; the "+3 spread" **re-derived to the standard flatness problem** (verified), its residue relocated into the wiring's flash→plateau IC family → LMU-specific gaps collapse to one linked question. V3.27 kept as a rollback point |
| 3.27 | 2026-07-07 | Deterministic-flash reset (supersedes the Volovik/P>0 collapse); tiny de Sitter endgame → finite 10¹²² ceiling; LMU-specific open items reduced to two (the "+3" spread [soft], the ω=inflaton wiring [Hypo]); de Sitter stability / swampland / P>0 reframed as field-wide, not LMU closure-blockers. Split into its own file; V3.26 kept as a rollback point |
| 3.26 | 2026-07-04 | External-review + adjudication pass (PR #1, rulings R1–R29): PDF link plumbing repaired (104→103 pp), ε_DESI 4.6×10⁻² adopted body-wide, M87* spin [Open — contested], verification suite in /code |
| 3.25 | 2026-07-02 | + GW231123 and five-array PTA rows (looked-at, not load-bearing) |
| 3.24 | 2026-07-02 | Negentropy/arrow homing (Frautschi gap, Eddington arrow, timeless Coleman bridge, Page-returned scramble); one-flash-one-aeon convention; Boddy–Carroll–Pollack citation repair |
| 3.23 | 2026-07-01 | Catalysis endpoint sharpened; the two open premises homed to the measure problem (Olum) and the Tolman conundrum (Steinhardt–Turok / Ijjas–Steinhardt / Pavlović–Sossich); Problem A sharpened to Volovik-P>0 vs Carroll-P=0 |

Full chain 3.4 → 3.28 lives inside the document's revision history.

## Repository layout

```
LMU_V3_28_consolidated.tex    LaTeX source (current)
LMU_V3_28_consolidated.pdf    compiled PDF (current)
LMU_V3_27_consolidated.tex    LaTeX source (previous — rollback point)
LMU_V3_27_consolidated.pdf    compiled PDF (previous — rollback point)
LMU_V3_26_consolidated.tex    LaTeX source (older rollback)
LMU_V3_26_consolidated.pdf    compiled PDF (older rollback)
figs/                         the 22 PNG figures (read via \graphicspath{{figs/}})
code/                         verification / run-provenance scripts
LMU_Companion_draft_v0.1.md   plain-language companion (draft)
LMU_companion_glossary.md     plain-language glossary
CONNECTION_MAP.md             cross-document connection map
ABOUT_AND_TAGS.md             copy-paste release pack (GitHub/Zenodo metadata)
CHANGELOG.md                  public-deposit milestones
Robotic_Mining_Architecture_Notes.md   standalone notes (not part of the LMU cosmology)
```

## Building

XeLaTeX, **twice** (TOC/refs settle on pass 2). XeLaTeX is the recommended engine (`fontspec` + Latin Modern OpenType fonts); the preamble also carries a pdfTeX fallback branch that loads `lmodern`. Keep the figure PNGs in `figs/` next to the `.tex` (`\graphicspath{{figs/}}` is set in the preamble).

```
xelatex LMU_V3_28_consolidated.tex
xelatex LMU_V3_28_consolidated.tex
```

Expected: 0 errors, 108 pages, 26 equation environments (33 numbered display equations including align rows).

## Cite

See `CITATION.cff` (GitHub's "Cite this repository" button), or cite the concept DOI, which always resolves to the latest version:

> Rungsiyapornratana, P. (2026). *Loop Mega Universe (LMU): a cyclic black-hole cosmology framework* (V3.28). Zenodo. https://doi.org/10.5281/zenodo.20692157

## บทคัดย่อ (ไทย)

**Loop Mega Universe (LMU)** คือกรอบสังเคราะห์จักรวาลวิทยาเชิงวัฏจักรบนฟิสิกส์หลุมดำ: อีออน (aeon) จบที่สภาพเย็น–เจือจาง–เป็นก้อน หลุมดำผู้รอด (L1) หยุดหมุน ระเหย และแฟลชสุดท้ายของมันจุดชนวน bounce แบบ Coleman–De Luccia ที่ปลายทางการระเหยระดับพลังค์ — หนึ่งแฟลช หนึ่งฟอง หนึ่งอีออนใหม่ ร้อน–เรียบ–หนาแน่นพร้อมกันทั้งใบบนผิวเวลาภายใน ช่องว่างเอนโทรปีที่เปิดใหม่ (งบเนเกนโทรปีของอีออน) ติดลูกศรเวลาอีกครั้ง กรอบนี้ประกาศตัวเป็น "เลนส์มอง" ไม่ใช่ทฤษฎีทำนายใหม่ ทุกกลไกอ้างเจ้าของในวรรณกรรม มีป้ายกำกับสถานะ 8 แบบ ([Fact]/[Fact-theory]/[Hypothesis]/[Speculation]/[Design]/[Open]/[Dead-end]/[Auditor]) ทุกข้อกล่าวอ้าง และแนบตัวชี้ขาดล่วงหน้า (DESI-Y5, BHEX, LiteBIRD)

## License

Documents and figures: **CC-BY-4.0** (see `LICENSE-docs`). Code: **MIT** (see `LICENSE`).
