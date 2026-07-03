# Loop Mega Universe (LMU) — a cyclic black-hole cosmology framework

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20692157.svg)](https://doi.org/10.5281/zenodo.20692157)

**Current version: V3.25 (2026-07-02) — 104 pp, XeLaTeX.**
Author: Pitarn Rungsiyapornratana ([ORCID 0009-0004-6411-2201](https://orcid.org/0009-0004-6411-2201)) · [Zenodo (all versions)](https://doi.org/10.5281/zenodo.20692157) · [OSF](https://osf.io/2ac8x)

## What this is

LMU is a **worldview-level synthesis, not a new predictive theory**: it wires *established, cited* physics into one coherent cyclic picture and then subjects the wiring to falsifiers. Every mechanism belongs to its published owner (attribution rule R7 is enforced throughout the document); the framework's own contributions are the conventions, the read-acrosses, and the wiring.

**The cycle in one paragraph.** An aeon ends cold, dilute, and clumpy: structure funnels through a black-hole size ladder (L4 gas/stars → L3 galactic BH → L2 BCG BH → L1 the last survivor). The survivor stops spinning (Page), evaporates, and its terminal Hawking flash — at the post-evaporation Planck-scale endpoint, not the 10¹¹ M☉ body — seeds a catalyzed Coleman–De Luccia bounce (Gregory–Moss–Withers). One flash = one bubble = one aeon: on the interior slicing the hot start is simultaneous across the new aeon, homogeneous by instanton symmetry, with density arriving by in-place conversion of the latent vacuum energy (ρ ≈ ΔV; Guth's free lunch). The re-opened entropy gap (Frautschi) — the aeon's fresh negentropy budget — re-arms the thermodynamic arrow, and dilution into the unbounded substrate keeps the total ledger second-law-safe (Ijjas–Steinhardt-type resolution, strengthened to an actually infinite L0).

**Two axioms only:** the substrate (q) and Λ (a constant; no origin mechanism sought). Dark matter is *not* a given — it is re-created each aeon at the hot boundary as a collisionless thermal relic, symmetric with baryons.

## Methodology (labels or it didn't happen)

Every load-bearing statement in the document carries a label:

- **[Fact]** — measured / peer-reviewed / proven,
- **[Fact-eq]** — derived from Fact with the checkable numbers shown,
- **[Hypo]** — any assumption (the framework's own machinery included).

Dead ends are kept, not deleted (failure logs); rebuttals are tested for wrong-population sampling (R8); "verdict right, numbers wrong" is treated as the worst failure mode (R6).

## Verification culture

Independent recomputation, not self-citation: the physics-constant spine is re-derived from CODATA (Hawking temperature, evaporation time, Bekenstein–Hawking and Zurek 4/3 entropies, Nariai ceiling); the dark-energy sector is re-integrated from the Klein–Gordon equation (6/6 (w₀, wₐ) rows reproduced to three decimals, no phantom crossing — Vikman); dimensional audits pass 14/14; the relic-galaxy statistics reproduce exactly from the published dynamical masses. Verification scripts live in `/code`.

## Pre-registered falsifier lines

- **F1 — dark energy:** a canonical thawing field can match DESI DR2's w₀ *or* wₐ, not both (document shows the full m-scan); **DESI-Y5 (~2027)** sharpens or breaks this.
- **F2 — black-hole spin:** survivor/BCG spin history; next-generation EHT / **BHEX era (2030s)**. Current inventory already logs M87* polarimetry (Wong et al. 2025) disfavouring high spin as an *offsetting* flag.
- **F3 —** re-scoped: the P(k) re-initialization falsifier was ruled and re-scoped at V3.12 (see in-document revision history).
- **F4 — single-instanton origin signature** ("Open, flat, smooth by one instanton — and a clean F4"): the 10¹⁶ GeV ignition scale gives r ≈ 0.009 (ε ≈ 5.7×10⁻⁴) against the current bound r < 0.036 (BICEP/Keck); **LiteBIRD-class** sensitivity tests it.

## Two load-bearing open problems (owned, not hidden)

- **Problem A — relighting / de Sitter stability:** does the raised phase re-arm each cycle? Sharp form: Volovik (P>0, arXiv:2007.05988) vs Boddy–Carroll–Pollack (P=0, arXiv:1405.0298) — a field-wide unresolved question.
- **fork-5 — unbounded L0:** the eternal-inflation **measure problem** (Olum 2012 no-go, arXiv:1202.3376; still open in the PDG Inflation review).

Both are deliberately homed to named field-wide problems (V3.23), not treated as LMU-private gaps.

## Empirical anchors in the current inventory (live-verified July 2026)

DESI DR2 (arXiv:2503.14738) · six-relic compilation Cohn et al. 2025 (arXiv:2504.00172) + Walsh 2015–17, Cohn 2021–24 ALMA masses · NGC 384 · JWST over-massive BHs incl. A2744-QSO1 (Juodžbalis et al. 2026) · UHZ1 (contested) · **GW231123** (LVK 2025: 137+103 → 225 M☉, χ ~ 0.9/0.8 — mass-gap, merger-built; caveats logged) · nanohertz GW background, five concordant PTAs incl. MPTA (Miles et al. 2025) · Planck 2018 · BICEP/Keck.

## Recent versions

| Version | Date | One-liner |
|---|---|---|
| 3.25 | 2026-07-02 | + GW231123 and five-array PTA rows (looked-at, not load-bearing) |
| 3.24 | 2026-07-02 | Negentropy/arrow homing (Frautschi gap, Eddington arrow, timeless Coleman bridge, Page-returned scramble); one-flash-one-aeon convention; Boddy–Carroll–Pollack citation repair |
| 3.23 | 2026-07-01 | Catalysis endpoint sharpened; the two open premises homed to the measure problem (Olum) and the Tolman conundrum (Steinhardt–Turok / Ijjas–Steinhardt / Pavlović–Sossich); Problem A sharpened to Volovik-P>0 vs Carroll-P=0 |

Full chain 3.4 → 3.25 lives inside the document's revision history.

## Repository layout

```
/tex         LaTeX source (LMU_V3_25_consolidated.tex and priors)
/pdf         compiled PDFs
/figures     the 22 PNG figures the build expects beside the .tex
/logs        session handoff logs (.md) — decisions, failure logs
/changesets  minimal-diff changeset specs per version
/code        verification / stress-test scripts
```

## Building

XeLaTeX, **twice** (TOC/refs settle on pass 2). Requires `fontspec` + Latin Modern OpenType fonts (do **not** use pdflatex; `lmodern.sty` is not assumed). Place the figure PNGs in the same directory as the `.tex`.

```
xelatex LMU_V3_25_consolidated.tex
xelatex LMU_V3_25_consolidated.tex
```

Expected: 0 errors, 104 pages, 26 numbered equations.

## Cite

See `CITATION.cff` (GitHub's "Cite this repository" button), or cite the concept DOI, which always resolves to the latest version:

> Rungsiyapornratana, P. (2026). *Loop Mega Universe (LMU): a cyclic black-hole cosmology framework* (V3.25). Zenodo. https://doi.org/10.5281/zenodo.20692157

## บทคัดย่อ (ไทย)

**Loop Mega Universe (LMU)** คือกรอบสังเคราะห์จักรวาลวิทยาเชิงวัฏจักรบนฟิสิกส์หลุมดำ: อิออนจบที่สภาพเย็น–เจือจาง–เป็นก้อน หลุมดำผู้รอด (L1) หยุดหมุน ระเหย และแฟลชสุดท้ายของมันจุดชนวน bounce แบบ Coleman–De Luccia ที่ปลายทางการระเหยระดับพลังค์ — หนึ่งแฟลช หนึ่งฟอง หนึ่งอิออนใหม่ ร้อน–เรียบ–หนาแน่นพร้อมกันทั้งใบบนผิวเวลาภายใน ช่องว่างเอนโทรปีที่เปิดใหม่ (งบเนเกนโทรปีของอิออน) ติดลูกศรเวลาอีกครั้ง กรอบนี้ประกาศตัวเป็น "เลนส์มอง" ไม่ใช่ทฤษฎีทำนายใหม่ ทุกกลไกอ้างเจ้าของในวรรณกรรม มีป้ายกำกับ [Fact]/[Fact-eq]/[Hypo] ทุกข้อเรียกร้อง และแนบตัวชี้ขาดล่วงหน้า (DESI-Y5, BHEX, LiteBIRD)

## License

CC-BY-4.0 *(⚠ confirm/replace before first release — see ABOUT_AND_TAGS.md)*
