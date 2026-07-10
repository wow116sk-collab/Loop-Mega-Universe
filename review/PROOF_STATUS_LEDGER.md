# Proof-status ledger — what can and cannot be claimed
### สถานะการพิสูจน์: อันไหนเคลมได้ อันไหนห้าม (2026-07-07)

**Answer to "is it all proven?" — NO.** Nothing new was proven this session. Every *equation* is borrowed and correctly applied; every candidate-original piece is the *wiring/assembly*, which stays **[Hypo]**; the one *prediction* (r≈0.0037) is **Starobinsky's**, not LMU's; and the core problems are **open field-wide**. This document says exactly what may be claimed when using the material, and the overclaims to avoid.

**Categories.** `[borrowed-standard]` established physics, correctly used — proven, but *not yours*. `[fit]` accommodates data, *not* a prediction. `[factth|cond]` follows from theory *given* the wiring/assumptions. `[hypo]` the wiring/assembly, unclaimed on the evidence searched. `[soft]` rests on an un-derived assumption. `[open]` unsolved field-wide.

> **Correction (2026-07-07, deterministic-flash reset).** An earlier version of §2/§4 below listed **de Sitter stability (P>0)** and **V_min = 0** as LMU open items and equated them with "the sharp form of Problem A." Both framings are **corrected**: (a) the reset is **deterministic** — the survivor *will* evaporate (Hawking, certain) and its flash *triggers* a field already on the α-attractor plateau — so LMU does **not** need de Sitter to decay; **de Sitter stability / P>0 are field-wide questions LMU shares, not LMU closure-blockers.** (b) The endgame is $V_{\min}\neq0$ (tiny de Sitter), reached via **quintessence + "no true zero"**, which evades Weinberg's *exact-0* no-go — so "$V_{\min}=0$" is **not** an LMU requirement. The genuinely **LMU-specific** open items reduce to **two**: the **"+3" spread** [soft] and the **wiring** [Hypo]. §2 and §4 are updated to match; the §1 rows that still say "V_min=0 endgame" are the old Minkowski reading, superseded by the tiny-de-Sitter endgame (`LMU_SYNTHESIS_2026-07-07.md` §2).

> **Correction (2026-07-10, flatness reduction).** The "+3 spread" entry above is itself superseded: re-derived and verified 2026-07-08, it is the **standard flatness problem** (residual curvature as Ω_k, bound Ω_k<0.01 *today*, solved by **N_total ≈ 60–85 total e-folds** — reheating-dependent; ACT DR6's 69–81 already exceeds the minimum). The old "k≈5 within 57 e-folds / 63 orders short" framing was an **epoch-mismatch artifact** (end-of-inflation energy compared against today's floor, clock stopped at reheating). It no longer stands as an independent LMU knot; its honest **residue** (the residual's equation of state / smoothness, and whether the flash delivers enough total e-folds) is **relocated into the wiring's flash→plateau IC family**. LMU-specific open items therefore reduce to **one linked question: the wiring** [Hypo → soft/favoured]. §2 and §4 below are updated to match. Scripts: `code/residual_flatness_accounting.py`, `code/residual_flatness_stress.py` (the older `residual_dilution_to_floor.py` reproduces the artifact).

---

## 1. The one-line status of each result

| Result | Category | You MAY say | You may NOT say |
|---|---|---|---|
| CMB match (n_s, r, A_s) | **[fit]** | "compatible with Planck via a standard α-attractor" | ~~"LMU predicts the CMB"~~ — A_s is the input read back out *exactly* (identity) |
| r ≈ 0.0037 | **[borrowed-standard]** | "if the wiring holds, LMU inherits Starobinsky's r=12/N²≈0.0037, testable by CMB-S4" | ~~"LMU's own prediction"~~ — it is Starobinsky's/Higgs's α=1 value, shared, not LMU-specific |
| α = 1 (from the ghost) | **[factth\|cond]** | "the minimal healthy completion (R²) gives α=1" | ~~"proven that α=1"~~ — closed only to EFT-naturalness, not a theorem |
| Trace anomaly grounds the scalaron | **[borrowed-standard]** | "the α=1 *shape* is anomaly-natural at a conformal boundary (Shapiro program)" | ~~"grounds the amplitude"~~ — A_s needs ~10¹³ fields; scale stays input |
| S ≈ 1.03×10⁹⁰ entropy | **[borrowed-standard]** | "the ledger uses the correct standard radiation entropy" | ~~"a prediction"~~ — textbook quantity from measured T and size |
| Entropy ceiling (finite, S~10¹²²) | **[factth\|cond]** | "consistent *given* the tiny-de-Sitter endgame ($V_{\min}\neq0$): the horizon ceiling is finite, $S=A/4G\sim10^{122}$" | ~~"infinite ceiling / total S→∞"~~ — that was the old $V_{\min}=0$/Minkowski reading, superseded by the tiny de Sitter (`LMU_SYNTHESIS_2026-07-07.md` §2) |
| residual energy → measured floor (the "+3 spread") | **[soft → standard flatness]** | "= the **standard flatness problem** (re-derived + verified 2026-07-08): residual curvature Ω_k<0.01 *today*, solved by N_total≈60–85 *total* e-folds (ACT DR6's N_CMB 69–81 already exceeds the minimum); residue (the residual's equation of state + flash e-fold delivery) relocated into the wiring's flash→plateau IC family" | ~~"63 orders short in 57 e-folds / k≈5"~~ — that was an **epoch-mismatch artifact** (end-of-inflation energy vs today's floor); ~~"closed"~~ — a reduction, not a closure; and NOT the observable 10⁻⁵ *contrast* (separate, easy). `code/residual_flatness_accounting.py` |
| Loop closes (back-calc) | **[factth\|cond]** | "internally consistent — the inverted exit matches the cold-clumpy start" | ~~"proves the cycle"~~ — a consistency demo on soft absolute energies |
| GW: B-mode is the only observable | **[factth\|cond]** | "direct-detection GW is symmetry-suppressed + buried; F4 is the CMB B-mode" | ~~"LMU is confirmed by GW"~~ — nothing detected; r=0.0037 shared with Starobinsky |
| Swampland tension | **field-wide, not LMU** | "the generic swampland-vs-inflation tension every plateau model shares (contested strong conjecture); LMU's thawing DE is swampland-*favoured*, and the deterministic flash needs no metastable minimum" | ~~"an LMU-specific open item / LMU beats the swampland"~~ — it is neither a closure-blocker of LMU nor an LMU win |
| Time reframe (arrow inherited) | **[factth\|cond]** | "the arrow-reset worry dissolves; Problem A is energy-shaped" | ~~"solves the arrow / Problem A"~~ — a reframe, not a solution |
| The wiring (ω = conformal factor = inflaton) | **[hypo → soft/favoured]** | "a candidate identification, now *naturalness-favoured* (trace anomaly → plateau + massless-early scalar = inflaton, not erebon); most machinery borrowed/owned, one irreducible line" | ~~"novel / proven / closed"~~ — amplitude still tuned, erebon not forbidden; the plateau is *favoured*, not forced |

---

## 2. What is genuinely OPEN (do not present as solved)

**LMU-specific open item — one linked question (updated 2026-07-10; see the correction note in the preamble):**
- **The wiring** — **[hypo → soft/favoured]**. ω = CCC conformal factor = the inflaton/scalaron, and the trigger→plateau coupling. Unclaimed; *against* Penrose's own reading (CCC is inflaton-free; his dynamical Ω is dark matter). The Penrose DM-conflict is *removed* (post-reheating super-heavy DM; `JOINT3_filtered_dm.md`); the plateau reading is now *naturalness-favoured* (hot-flash lock-out + anomaly off-orbit penalty), but the identification itself stays hypothetical — four adversarial closure rounds show it is **not promotable to [Fact] by principle** (residual = conformal-gauge zero-mode + free York datum φ₂; `WIRING_closure_attempts_2026-07-09.md`); it is decided by measurement (F4/F5). This item **also carries the relocated seam-IC residue** of the old "+3 spread" (now the standard flatness problem, §1 row): is the hand-off really smooth homogeneous curvature (a⁻², w=−1/3), and does the flash deliver N_total ≈ 60–85 total e-folds? (`code/residual_flatness_accounting.py`, `code/residual_flatness_stress.py`.)

**Field-wide problems LMU SHARES (not LMU closure-blockers — do not list as LMU-specific):**
- **Problem A** (Tolman/entropy + measure) — how a cold, high-entropy remnant becomes a hot, low-entropy start. Its *reset* half is handled deterministically in LMU (certain evaporation → flash trigger → plateau); its *smoothness* half is the seam-IC residue now carried by the wiring above (formerly the "+3" spread, reduced 2026-07-08 to the standard flatness problem).
- **de Sitter stability (P=0 vs P>0)** — **not** an LMU requirement. The deterministic flash means LMU does not need de Sitter to decay; this is the field-wide Volovik-vs-BCP question every cosmology faces. (`JOINT2_no_zero_unification.md`, corrected.)
- **The tiny Λ (~10⁻¹²²) value** — the standard cosmological-constant problem, shared by every model. LMU needs $V_{\min}\neq0$ (tiny de Sitter, via quintessence + "no true zero"), **not** $V_{\min}=0$; Weinberg's *exact-0* no-go does not apply.
- **α = 1 uniqueness** — closed only to EFT-naturalness (natural R³ shifts α by ~10⁻¹⁹), not proven; a fine-tuned coefficient or an external field reopens it.
- **The infinite L0 reservoir** — the single load-bearing premise; the toll every eternal/cyclic cosmology pays. Not derived.

---

## 3. Every EQUATION is borrowed (owners) — nothing new was written

Einstein 1915 · Friedmann 1922 · Klein–Gordon · Vikman 2005 (w≥−1) · Bekenstein 1973 / Hawking 1975 / Zurek 1982 (BH entropy) · Gibbons–Hawking 1977 (dS entropy) · Penrose 1979 (WCH) / 2010 (CCC) · Starobinsky 1980 (R²/scalaron, r=12/N²) · Bezrukov–Shaposhnikov 2008 (Higgs inflation) · Kallosh–Linde 2013 (α-attractors) · Guth 1981 (free lunch) · Coleman–De Luccia 1980 (bounce) · KOST 2001 / Erickson 2004 (ekpyrotic smoothing) · Tolman 1931 / Frautschi 1982 (entropy conundrum) · Ijjas–Steinhardt 2019 (dilution) · Wald 1984 (no global energy) · Olum 2012 (measure no-go) · Caprini et al. 2016 (transition GW) · Kosowsky–Turner–Watkins 1992 · NANOGrav 2023 · Hawking–Hertog–Reall 2000 / Fabris–Pelinson–Shapiro / Netto 2015 / Silva–Shapiro 2025 (anomaly-induced inflation & bounce). **The only candidate-original content is the wiring/assembly — all [Hypo].**

---

## 4. The honest headline for any presentation

> LMU is a **hybrid assembly** of established mechanisms (Penrose CCC + Starobinsky + ekpyrotic + Coleman–De Luccia + the anomaly-inflation program) wired into one cyclic picture. It is **compatible with the CMB** via a standard α-attractor, from which — *if* the wiring holds — it inherits **Starobinsky's r≈0.0037** (testable by CMB-S4). It **does not** predict the CMB (that is a fit) and **does not** contain a new equation. Its **LMU-specific** open items reduce to **one linked question**: the **wiring** [Hypo → soft/favoured], which also carries the relocated seam-IC residue of the old "+3 spread" (re-derived 2026-07-08 to the **standard flatness problem**, solved by N_total ≈ 60–85 total e-folds). The reset is **deterministic** (certain evaporation → flash trigger → field on the α-attractor plateau), so **de Sitter stability / P>0 / V_min=0 are NOT LMU closure-blockers** — they are field-wide questions every inflationary cosmology shares (LMU needs only $V_{\min}\neq0$, a tiny de Sitter, which quintessence supplies). Its one candidate-original element is the **wiring**, which stays a hypothesis and conflicts with some source authors' own readings.

**Usable now:** the framework, the falsifiers (F1–F4), the consistency, the honest scope. 
**Not usable as "proven":** any prediction as LMU's own, any mechanism as novel, any of the open problems as solved.

*Reproduce the underlying checks:* `code/seam_honesty_audit.py`, `code/seam_predict_r.py`, `code/conformal_alpha_derivation.py`, `code/close_nonminimal_loophole.py`, `code/trace_anomaly_scalaron.py`, `code/lmu_entropy_ceiling.py`, `code/lmu_ignition_gw*.py`, `code/lmu_preaeon_backcalc.py`.
