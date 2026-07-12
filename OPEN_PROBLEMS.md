# OPEN_PROBLEMS — the research map (V3.29 · snapshot 2026-07-11)

LMU in its current state is a **map, not a finished theory**: a hybrid assembly of owned
mechanisms (CCC · Starobinsky/α-attractors · ekpyrotic smoothing · anomaly-inflation program)
wired into one cyclic picture, with every claim status-tagged and every dead-end kept.
This file is the outsider-facing index of **what is open, what would move it, and where to look**.
It contains no new physics — it condenses the internal ledgers for a reader arriving cold.

- **Single source of truth** for open-item status: [`review/LMU_SYNTHESIS_2026-07-07.md`](review/LMU_SYNTHESIS_2026-07-07.md)
- Claim-by-claim ledger (may say / may NOT say): [`review/PROOF_STATUS_LEDGER.md`](review/PROOF_STATUS_LEDGER.md)
- Pre-registered falsifiers (immutable): [doi.org/10.17605/OSF.IO/CN3B4](https://doi.org/10.17605/OSF.IO/CN3B4) · [`FALSIFIERS_preregistration_V3.28.pdf`](FALSIFIERS_preregistration_V3.28.pdf)

---

## 0. What already stands (NOT open — for contrast)

| Piece | Status | Where |
|---|---|---|
| CMB compatibility (n_s, A_s) via a standard α-attractor | **[fit]** — accommodation, not a prediction | ledger §1 |
| Entropy bookkeeping (S_BH, S_rad = 4/3·S_BH, finite 10¹²² horizon ceiling, ρ_S→0 with S_total↑) | **[borrowed-standard / Fact-th\|cond]** | `code/lmu_entropy_ceiling.py`, `code/entropy_budget_clarify.py` |
| Matter ladder + empirical anchors (relic compilation, JWST over-massive BHs, GW231123, PTA background) | consistency layer, live-verified 2026-07 | README §Empirical anchors |
| The old "+3 spread" → reduced to the **standard flatness problem** (needs N_total ≈ 60–85 total e-folds; ACT DR6 already gives 69–81) | **verified 2026-07-08**; residue relocated to §2 below | `code/residual_flatness_accounting.py`, `code/residual_flatness_stress.py` |
| Falsifier framework F1–F6 | **pre-registered, immutable** | OSF DOI above |

---

## 1. The one genuinely-LMU open problem: the wiring

**Claim:** ω — the prior aeon's CCC conformal factor Ω, made physical after the crossover — **is** the α-attractor inflaton, and the terminal flash deposits it on the plateau (not as a heavy "erebon").

**Status: `[Hypo → soft/favoured]`.** Four adversarial closure rounds (2026-07-08/09) established that this
**cannot be promoted to [Fact] by any local, dynamical, entropic, or geometric principle tried**:
least action · entropy production · aeon-map dynamics (Markwell–Stevens, area-preserving) ·
anomaly-amplitude · Yamabe/Lichnerowicz–York · trace anomaly on the Obata orbit ·
einselection · Landauer cost. The residual is **not a physical hole**: a conformal-diffeomorphism
zero-mode (gauge), one legitimately-free York initial datum (φ₂), and the field-wide amplitude input.

Two independent naturalness pushes favour the plateau reading: the hot-flash lock-out
(crossover blueshift ⇒ m_eff/H ~ 10⁻²¹–10⁻⁴⁵ ≪ 1 — too light to oscillate as matter at the flash)
and the anomaly's off-orbit isotropy penalty.

**What decides it: measurement, not derivation** — F4 (tensor band) and F5 (Hawking-point absence), §5.

| Needed expertise | Why |
|---|---|
| CMB B-mode experiment (LiteBIRD / CMB-S4) | the r-band 0.0018–0.009 is the decisive test |
| Conformal geometry / GR | only if you believe a selection principle was missed — read the dead-end log first (§7) |

**Where:** [`review/WIRING_closure_attempts_2026-07-09.md`](review/WIRING_closure_attempts_2026-07-09.md) ·
[`review/WIRING_bridge_2026-07-08.md`](review/WIRING_bridge_2026-07-08.md) · `code/wiring_*.py` (all runnable)

---

## 2. The seam initial-condition family (the relocated residue)

Everything below is one family: *what exactly does the flash hand the new aeon?* All `[Hypo]`.

| Question | What is assumed today | What would settle it |
|---|---|---|
| Residual equation of state — is the hand-off really smooth homogeneous curvature (a⁻², w = −1/3), not shear/inhomogeneity (a⁻⁶, high Weyl)? | smoothness (WCH-aligned) | semiclassical / numerical-relativity model of the flash |
| Does the flash deliver **N_total ≈ 60–85** total e-folds (reheating-dependent minimum)? | yes (α-attractors generically give N_total ≫ 66) | a first-principles seam calculation (§3) |
| Flash **sparsity** — are survivors rare enough that neighbouring aeons stay horizon-exiled? | yes | survivor-population statistics |
| Survivor-mass distribution → aeon-lifetime distribution (t ∝ M³; mortality window M ≲ 10²² M_☉, above which T_H < T_dS and the survivor never evaporates) | realistic masses sit ~10 orders below the ceiling | BH population synthesis into the deep future |

| Needed expertise | Where |
|---|---|
| numerical relativity · semiclassical gravity · BH population synthesis | `code/residual_flatness_accounting.py` · `code/residual_flatness_stress.py` · SSOT §5 |

---

## 3. The derivation gap (framework → theory)

The single biggest scientific gap. The document states what the seam **must** deliver
(necessary conditions); nobody — here or in the field — has the calculation that shows it **does**:

- **Input** (M_survivor, substrate state) → **output** (new-aeon initial conditions: amplitude A_s,
  spectrum, N_total). Absent. The trans-Planckian endpoint of evaporation sits directly under it (field-wide).
- **Amplitude:** the anomaly-induced route needs ~10¹¹–10¹³ light fields (Duff obstruction) —
  the scale remains an input, not a derivation. (`code/wiring_attemptD_amplitude.py`)

**Needed expertise:** QFT in curved spacetime · quantum gravity · numerical relativity.

---

## 4. The empirical gap: an LMU-unique positive observable

Honest accounting: **no measurement yet separates LMU from one-shot inflation + ΛCDM.**
F5's null separates LMU from bare CCC (and came out favourable, §5) — but ΛCDM predicts the
same absence. F4's band is α-attractor-generic, not LMU-specific. The closest unique handle
is F2 (BH-spin dichotomy), which is weak. This thinness is **by design** — the erase-type seam
that buys consistency also erases the evidence of cycling.

**Wanted:** any observable that distinguishes "this aeon had a predecessor" from "there was no
predecessor". **Needed expertise:** phenomenology · BH population synthesis.

---

## 5. Falsifier watch-lines (pre-registered; observational snapshot 2026-07)

| F | Pre-registered claim | Deciding data | Status (2026-07) |
|---|---|---|---|
| F1 | dark energy = canonical thawing quintessence; **no phantom crossing** | DESI Y5 | pending; DR2 consistent so far |
| F2 | BH-spin dichotomy (isolated relics high, BCG centres low) | spin populations | open — needs population studies |
| F3 | *(retired)* | — | retired |
| F4 | tensor band **r ≈ 0.0018–0.009** | LiteBIRD (δr ~ 0.001) · CMB-S4 | r < 0.034 (2025 combined bound) and ACT DR6 n_s consistent with the plateau; the band becomes decisive next decade |
| F5 | **absence** of CCC-style Hawking points / concentric low-variance circles | CMB statistics | 2023–24 reanalyses of the 2018 claim find **no significant signal** — consistent with F5 (note: shared with ΛCDM; see arXiv:2208.06021 and follow-ups) |
| F6 | tiny-**positive**-de-Sitter endgame (V_min > 0) | future DE / CMB data | watch-line; a confirmed V_min < 0 (future-AdS) kills the model as registered — no re-tuning |

Thresholds are **immutable** (OSF registration above). Argue with data, not with edits.

*Label-scope note (2026-07-12): the pre-registration's internal-label mapping note ("the document's internal F-labels differ — e.g. its internal 'F4' is the Hawking-point test = F5 here") applies only to pre-3.26 tex strata; from the 3.26 revision entries onward the tex uses this public F-numbering (F4 = tensor band, F5 = Hawking-point absence).*

---

## 6. Field-wide problems LMU shares (NOT LMU-specific — do not re-list as LMU knots)

The Λ value (cosmological-constant problem) · de Sitter stability / swampland ·
the measure on an infinite substrate (mitigated by the deterministic reset, not formalized) ·
α = 1 uniqueness (closed only to EFT-naturalness) · the evaporation endpoint / information.
See [`review/PROOF_STATUS_LEDGER.md`](review/PROOF_STATUS_LEDGER.md) §2 and SSOT §5.3.

---

## 7. Dead-ends (kept on purpose)

Tried-and-failed routes are retained so nobody re-digs the same holes:

- Part VIII dead-ends inside the main document (C1 …).
- Four adversarial wiring-closure rounds (2026-07-08/09) with runnable scripts:
  least action, entropy production, aeon-map, amplitude, Yamabe, anomaly-on-orbit,
  einselection, Landauer — all logged with verdicts in
  [`review/WIRING_closure_attempts_2026-07-09.md`](review/WIRING_closure_attempts_2026-07-09.md).

If you are about to try a selection principle on the wiring — **read that log first.**

---

## 8. Superseded-layer guard (for readers of older strata)

Older text still visible in the body and logs that is **no longer the current reading**:

1. *de Sitter stability / P>0 / V_min = 0 as LMU-specific items* → since V3.27 these are
   **field-wide**, not LMU closure-blockers (the reset is a deterministic flash, not a decay).
2. *the "+3 spread" as "63 orders short in 57 e-folds" (k≈5)* → an **epoch-mismatch artifact**;
   re-derived 2026-07-08 as the standard flatness problem (§0, §2).
3. *ignition as Coleman–De Luccia nucleation from a metastable Φ_gen false vacuum* →
   retained in the body as an earlier stratum; the current reading (V3.27+) needs
   **no metastable barrier and no tunnelling** — the flash triggers a field already on the plateau.

Authority order: `review/LMU_SYNTHESIS_2026-07-07.md` → this file → older body text.

---

## 9. Contributing

Fork it, open an issue, or take any row above — each names the expertise it needs.
The useful contribution modes, in order: (a) the seam calculation (§3), (b) an LMU-unique
observable (§4), (c) data on any watch-line (§5), (d) a proof that one of the dead-ends
in §7 was closed wrongly.

*Author of the framework: Pitarn Rungsiyapornratana. Map assembled 2026-07-10, updated 2026-07-11 alongside v3.29.*
