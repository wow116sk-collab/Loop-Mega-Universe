# Changelog

Public-deposit milestones for the **Loop Mega Universe (LMU)**.
Dates are `YYYY-MM-DD`. The consolidated `.tex` is the source of truth; this file
records deposit events, not the document's internal revision history (that lives in
the `.tex`).

---

## v3.26 — 2026-07-04

External-review + adjudication deposit. A full document review (136 verified
findings; raw ledger in `findings_raw.md`) was adjudicated across rulings
R1–R29 (records in `/review`) and applied with rerun verification:

- PDF link plumbing repaired (hyperref anchors made part-unique; the V3.25
  build reused destination names across parts, so TOC clicks landed in
  Part I). Page count 104 → 103 after the revision-history small-print
  group repair.
- ε_DESI = 4.6×10⁻² (chain covariance, V3.8 pull) adopted body-wide;
  N_Q = 9.03×10¹²¹ at the new threshold (rerun-verified changeset in `/review`).
- M87* spin status adjudicated [Open — contested]: Drew et al. 2025 (ApJL 984
  L31, Doppler beaming, lower limit) vs Wong et al. 2025 (polarimetry).
- Verification suite deposited: `code/verify_all.py` + `code/lmu_endgame_repro.py`.
- Metadata: eight-tag legend synchronised across README/CITATION/companions;
  licenses stated (MIT code, CC-BY-4.0 docs); CITATION.cff preferred-citation.

Files: `LMU_V3_26_consolidated.tex`, `LMU_V3_26_consolidated.pdf` (22 figures,
unchanged set). Zenodo: new version DOI under concept DOI `10.5281/zenodo.20692157`.

---

## v3.25 — 2026-07-02

Consolidated deposit; the document-internal revision chain 3.18 → 3.25 lives in the
`.tex` revision history. Highlights (per the README version table): catalysis endpoint
sharpened and the two open premises homed to named field-wide problems (3.23);
negentropy/arrow homing and the one-flash-one-aeon convention (3.24); GW231123 and
five-array PTA rows added, looked-at not load-bearing (3.25).

Files: `LMU_V3_25_consolidated.tex`, `LMU_V3_25_consolidated.pdf` (22 figures — adds
`lmu_v321_loop_cascade.png` to the v3.17 set). Zenodo: new version DOI under concept
DOI `10.5281/zenodo.20692157`.

---

## v3.17 — 2026-06-24

Consolidated mathematical & empirical pass. Supersedes v3.13 for all physics content.
**No spine / axiom / falsifier change** across 3.13 → 3.17 — the additions are dead-end
logs, interpretive consolidation, and measured-fact citations (net epistemic direction
neutral-to-down).

- **Live-front fact pins:** DESI/SN "Dovekie" recalibration (Popovic et al. 2026);
  M87 polarimetry-vs-twisted-light spin split; MRG-M0138 (Newman et al. 2026);
  GW250114 area-theorem anchor; JWST over-massive black holes.
- **Dead-ends logged:** energy/event-based ignition (C4); GW-tidal-stretch-as-dark-energy
  (A2-GW); finite-L0 / closed-box-bounce fork (three converging walls — temperature
  obstruction, GSL/ρ_cross, no-hair).
- **Item (M) opened** — island/aggregation-site mass function — with extreme-value
  machinery cited (Harrison & Coles 2011; Behroozi & Silk 2018).
- **Cosmic-no-hair grounding** for the smoothness premise (Wald 1983; Friedrich 1986;
  Carroll & Chatwin-Davies 2018).

Files: `LMU_V3_17_consolidated.tex`, `LMU_V3_17_consolidated.pdf` (21 figures, unchanged
set). Zenodo: new version DOI under concept DOI `10.5281/zenodo.20692157`.

---

## v3.13 — 2026-06-14

First public deposit. Consolidated mathematical & empirical pass.

- GitHub repository created and cleaned (duplicate nested folder removed).
- Zenodo archival: concept DOI `10.5281/zenodo.20692157`, version DOI
  `10.5281/zenodo.20692158`.
- OSF preregistration of falsifiers F1–F4 at `osf.io/2ac8x` (CC BY 4.0).

Files: `LMU_V3_13_consolidated.tex` (+ companion, glossary, 21 figures).

> Date shown is the deposit session; if your Zenodo record lists a different
> publication date, use that.

---

*Author: Pitarn Rungsiyapornratana (ORCID 0009-0004-6411-2201).
Documents CC-BY-4.0; code MIT.*
