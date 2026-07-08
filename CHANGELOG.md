# Changelog

Public-deposit milestones for the **Loop Mega Universe (LMU)**.
Dates are `YYYY-MM-DD`. The consolidated `.tex` is the source of truth; this file
records deposit events, not the document's internal revision history (that lives in
the `.tex`).

---

## v3.28 — 2026-07-08

Release consolidation of the post-3.27 run (all append-only revision entries in
the `.tex`, gathered under one version). No new equation, axiom, or falsifier;
net epistemic direction down (open items reduced/localized); the Planck spine
(N=57, r=0.0037) stays the reference.

- **CEAW reinstated** as an in-aeon, descent-side L2 **state-diagnostic** (Cosmic
  Entropy Acoustic Waves; present in V3.4 §12.1.4, trimmed in the 3.4→3.27
  consolidation) — stress-tested and repaired to fuel-state-discriminated +
  population-statistical; a consistency re-check, *not* a growth knob or a
  reset-joint item. (`code/ceaw_*.py`, `review/CEAW_L2_diagnostic.md`.)
- **External-cosmology refresh (2024–2026)** folded in as *drift records*, tagged
  at true level: ACT DR6 / SPT-3G n_s up ~1.5–2σ (recompute N, r — LMU still
  passes); the negative-Σmν anomaly (favourable to evolving DE); CCBH strengthened
  but scoped off; DESI DR2 phantom crossing sharpening F1. No hard contradiction.
  (`review/EXTERNAL_COSMOLOGY_2026-07-08.md`.)
- **ACT-tension resolution:** an extended α-attractor (modified reheating / a
  δ-deformation) removes the plateau-vs-ACT tension — borrowed, at the cost of one
  tuned parameter; field-wide, not LMU-specific. (`code/act_alpha_extension.py`.)
- **Wiring bridge tightened + selection argument:** ω = the prior aeon's CCC
  conformal factor Ω = the α-attractor inflaton is demarcated to one irreducible
  line, now **naturalness-favoured** (trace anomaly → Starobinsky plateau + a
  massless-early scalar = inflaton, not the erebon mass): [Hypo] → **[Hypo→soft/
  favoured]**. (`review/WIRING_bridge_2026-07-08.md`.)
- **The "+3 spread" re-derived to the standard flatness problem** (verified,
  SURVIVES-WITH-CAVEATS): the old "residual energy must reach the floor within 57
  e-folds / 63 orders short" was an **epoch-mismatch bookkeeping artifact**;
  correct accounting (curvature fraction Ω_k, diluted to today) makes it the
  standard flatness problem, solved by N_total ≈ 60–85 total e-folds. Its residue
  (the residual's equation of state + flash e-fold delivery) is **relocated into
  the wiring's flash→plateau IC family** — a reduction, not a closure.
  (`code/residual_flatness_accounting.py`, `code/residual_flatness_stress.py`.)
- **Net open-item status:** the LMU-specific gaps collapse to **one linked
  initial-condition question** — the flash→plateau wiring (now [Hypo→soft/
  favoured], carrying item-1's relocated residue). Closing it is CCC's own
  field-wide "fix Ω uniquely" problem (Tod 2023) — inherited, not created; nobody
  has closed it. SSOT: `review/LMU_SYNTHESIS_2026-07-07.md`; run log:
  `review/LOG_post_3.27_2026-07-08.md`.

Files: `LMU_V3_28_consolidated.tex`, `LMU_V3_28_consolidated.pdf` (108 pp, 0
errors, XeLaTeX ×2; 22 figures, unchanged set). `LMU_V3_27_consolidated.*`
retained as the rollback point (`LMU_V3_26_consolidated.*` older rollback).
`code/verify_all.py` still ALL PASS (spine unchanged).

---

## v3.27 — 2026-07-07

Deterministic-flash reset + doc-consistency deposit. The reset joint is re-read
as a *deterministic flash* (the survivor's evaporation is certain → its terminal
flash triggers a field already on the α-attractor plateau), superseding the 3.26
"Volovik/P>0 collapse" reading:

- **Reset = deterministic flash, not a probabilistic decay.** No metastable
  barrier, no tunnelling. Supersedes the 3.26 open-joint (ii)(b) collapse into
  "is de Sitter stable?"; the 3.26 (ii)(a) result (V_min≠0 via quintessence)
  still stands.
- **Endgame chosen = tiny nonzero de Sitter** (V_min = ρ_Λ = (2.3 meV)⁴,
  anchored to the measured Λ) → finite horizon ceiling S = A/4G ~ 10¹²²;
  supersedes the Part II "V_min=0 / asymptotic Minkowski / infinite ceiling"
  wording.
- **LMU-specific open items reduced to exactly two:** the "+3" spread [soft] and
  the ω=inflaton wiring [Hypo]. de Sitter stability / swampland / P>0 / V_min=0
  reframed as field-wide questions LMU shares, not LMU closure-blockers.
- **Doc-loop fix:** `review/LMU_SYNTHESIS_2026-07-07.md` named the single source
  of truth for open-item status; JOINT2 / PROOF_STATUS_LEDGER / LMU_SYNTHESIS
  corrected; six older review records banner-marked as superseded layers; a
  standing rule added to the working-rules file.
- Split into its own file; V3.26 kept pristine as a rollback point.

Files: `LMU_V3_27_consolidated.tex`, `LMU_V3_27_consolidated.pdf` (105 pp, 0
errors, XeLaTeX ×2; 22 figures, unchanged set). `LMU_V3_26_consolidated.*`
retained as the previous version. No new equation, axiom, or falsifier.

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
