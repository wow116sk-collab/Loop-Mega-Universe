# LMU — the framework as it stands (synthesis, 2026-07-07, stress-tested)

**What this is.** A single, honest statement of the Loop Mega Universe framework after this session's work — the cycle, the two axes, the three joints, the two spine choices, and a strict ledger of what is proven, fitted, predicted, and open. It supersedes nothing in the main document (`LMU_V3_26_consolidated.tex`); it is the plain synthesis to read alongside it. **Every mechanism is borrowed and owned (R7); the only LMU-specific content is the wiring/assembly, flagged [Hypo] throughout.** This version incorporates the fixes from `STRESS_TEST_synthesis_2026-07-07.md` — the first draft over-claimed internal consistency; corrected below.

**Label legend.** `[Fact]` measured · `[Fact-th]` from established theory · `[fit]` a measured value plugged in and read back out · `[Hypo]` the wiring/assembly, unclaimed · `[open]` unsolved field-wide.

---

## 1. The picture in one paragraph

The universe runs in aeons on an eternal, infinite substrate **L0**. An aeon begins hot and smooth, forms structure and black holes, and its dark-energy field **A** thaws toward a *tiny, nonzero* floor, so the aeon dilutes into a cold, near-empty, **tiny de Sitter** state (H small but never exactly 0). One black hole — the survivor **L1** — wins every merger and evaporates over ~10¹⁰⁰ yr; a **reset** then lights a new hot start, and the loop repeats. Time is one continuous L0 axis (the bang re-zeros the internal clock; it does not reset the background); entropy climbs along it. The framework is an **assembly** of established mechanisms — Penrose's conformal crossing, Starobinsky/α-attractor inflation, ekpyrotic/inflationary smoothing, Coleman–De Luccia or the conformal flip for the reset, Gibbons–Hawking / apparent-horizon thermodynamics, the trace-anomaly-induced scalaron — wired into one cycle.

## 2. Two spine choices, made explicit (this is where the stress test bit)

The framework has two forks that earlier drafts left ambiguous. They are now chosen, and the choice is stated:

- **Endgame = tiny nonzero de Sitter, NOT exact Minkowski.** The A-field floor is tiny-but-nonzero (V_min = ρ_Λ = (2.3 meV)⁴, anchored to the measured Λ), so H_∞ > 0, T_dS = H_∞/2π > 0, and the entropy ceiling S = A/4G ~ **10¹²² is finite** (not infinite). The older "V_min=0 → Minkowski → infinite ceiling" reading is **superseded** — it is incompatible with a de-Sitter reset (which needs H>0), and it is the reading that makes the apparent-horizon formulas diverge. (`code/endgame_anchored_desitter.py`, `code/aconstant_consistency.py`.)
- **Reset channel — two options, one uncomputed.** (A) **CDL nucleation + black-hole (GMW) catalysis:** computed (`Γ=Ae^{−B}`; `B_seed` falls below the interlude threshold at ~5 Planck masses), but *needs a metastable barrier* (Φ_gen) whose existence is the swampland/de-Sitter-stability question. (B) **Conformal flip** (Ω→1/Ω at the flash; Penrose B-alt): *no barrier*, so it dissolves the swampland-minimum and tunneling issues — but it has **no computed reset rate**; it is an uncomputed hand-wave paid by the Ω-injection + the infinite L0. **"No barrier" means choosing (B) — trading a computed mechanism for an uncomputed one, not eliminating the problem.**

## 3. The cycle, pre-aeon → new aeon (the equation spine)

Read from **our own aeon backward**: fit the measured present (n_s, A_s, T_CMB, Ω_Λ, H₀), integrate the borrowed equations back to the bang and forward to the endgame. The line is data-pinned; the joints are where it meets a premise no measurement fixes. (`code/lmu_full_cycle.py`, `review/LMU_full_cycle_equations.md`.)

1. **Cold end (tiny de Sitter).** A-field thaws to the tiny floor; survivor mass from $\tau_{\rm evap}=2.1\times10^{67}(M/M_\odot)^3$ yr ⇒ $M\!\sim\!8\times10^{10}M_\odot$; its Bekenstein–Hawking $S_{\rm BH}\!\sim\!6\times10^{98}$.
2. **Flash / reset.** Evaporation endpoint $T_{\rm flash}\!\sim\!7\times10^{12}$ GeV — the trigger for channel (A) or (B) of §2.
3. **Hot start.** The conformal factor $\omega$ as an α-attractor inflaton (the wiring), $\alpha=1$; $V^{1/4}\!\sim\!8\times10^{15}$ GeV; reheat via the free lunch.
4. **CMB (fit).** $n_s=1-2/N=0.965$, $A_s=2.1\times10^{-9}$ — inputs read back out. $r=12/N^2=0.0037$ — Starobinsky's α=1 value, **conditional on the wiring**.
5. **Smooth half.** Old inhomogeneity diluted $e^{-2N}\!\sim\!10^{-49}$/point.
6. **Thermal bridge.** ~66 e-folds to the **measured 2.725 K**.
7. **Entropy.** New-aeon radiation $S\!\sim\!10^{90}$ (minted fresh); horizon $S=A/4G\!\sim\!10^{122}$ (finite ceiling).
8. **Back to cold.** Structure re-forms → new survivor → A thaws → returns to step 1.

## 4. The two axes, and the honest thread between them

- **Time axis:** L0 carries one continuous time; the bang re-zeros the internal clock and re-mints content — it does not reset the background. The arrow is inherited from L0. This dissolves the "arrow reset at the bang" worry and locates the open problem in the **energy/entropy** sector.
- **Energy/entropy axis:** the cold→hot transition (§3, steps 3–7).
- **The thread (corrected).** The link is **the conformal invariance of massless-radiation entropy** (Penrose): entropy crosses the conformal boundary without being created or destroyed. This is *not* the numerical relation $S_{\rm rad}=\tfrac43 S_{\rm BH}$ (that is Zurek's black-hole *evaporation* ratio, a different statement). Concretely: the survivor's evaporation entropy (~$8.5\times10^{98}$) dilutes into the infinite L0, and the new aeon's CMB entropy (~$1.03\times10^{90}$) is minted fresh — the two are **different and not 4/3-related**. The honest thread is "entropy is not lost at the conformal crossing," not a matching of these two numbers.

## 5. The three joints — status (not "resolved")

1. **The wiring (Ω = inflaton)** — [Hypo], unchanged. Its **Penrose-conflict is removed**: dark matter is made **at the hot start** (post-reheating super-heavy production — thermal/gravitational, super-heavy ~10¹⁷–10¹⁸ GeV), an independent channel, so Ω need not be Penrose's dark-matter erebon. *(Note: this is post-reheating production, NOT Baker–Kopp–Long wall-*filtering*, which needs a hot exterior LMU's cold→hot crossing does not have — corrected per stress test. `review/JOINT3_filtered_dm.md`.)*
2. **V_min floor + reset probability P>0** — **unified into ONE open question, not reduced.** The "no-zero" postulate (nothing reaches exact 0) gives V_min≠0 (quintessence also evades Weinberg's exact-0 no-go), and a tiny de Sitter that — *if* Volovik is right — is unstable (Γ>0). But the postulate is *motivated* by wanting activity to continue, so using it to conclude P>0 is close to question-begging; and Volovik (Γ>0) vs Boddy–Carroll–Pollack (Γ=0) is **contested**. Recognizing that both joints share the root **"is de Sitter stable?"** is a *clarification of the question*, not a closure. **[open].** (`review/JOINT2_no_zero_unification.md`.)
3. **The reset channel** — see §2: barrier (computed, swampland-exposed) vs no-barrier flip (uncomputed). Choosing "no barrier" dissolves the swampland/tunneling apparatus at the cost of having no computed reset rate.

## 6. Consistency — where it holds, where it does not

- **Holds (data-pinned line):** the endgame is anchored to the measured Λ, not invented; dropping a=constant does not break the equations (apparent-horizon thermodynamics, Akbar–Cai 2006), with the no-zero principle keeping H>0 so nothing diverges.
- **Consistent-but-not-decisive:** the observed uniformity is *consistent with* LMU (we sit at ~10⁻⁹⁰ of the way to the endpoint) — but it **cannot distinguish** slow-decay LMU from a stable de Sitter, so it is not a prediction.
- **NOT yet consistent (the honest debits):** the two spine choices of §2 were previously left contradictory (Minkowski vs tiny de Sitter; barrier vs no-barrier). They are now *chosen*, but the main `.tex` still carries the old "V_min=0 / Minkowski" and "B-primary nucleation" wordings — so the document set is **not yet internally reconciled** until those are updated (flagged, `.tex` edit pending approval).

## 7. The honest ledger (what may / may not be claimed)

| Claim | Status | May say | May NOT say |
|---|---|---|---|
| CMB (n_s, A_s) | **[fit]** | "consistent with Planck via a standard α-attractor" | "predicts the CMB" |
| r ≈ 0.0037 | **[Fact-th, borrowed, conditional]** | "IF the wiring holds, inherits Starobinsky's r=12/N²; CMB-S4 can test it" | "LMU's own prediction" |
| 2.725 K | **[Fact]** | "measured; consistent in the ledger" | "derived" |
| the cycle closes | **[Hypo/open]** | "a data-pinned retrodiction of our aeon" | "proven / internally contradiction-free" |
| de Sitter stability | **[open]** | "the single question the loop rests on" | "solved (either way)" |
| the wiring | **[Hypo]** | "candidate identification, Penrose-conflict removed" | "novel / proven / automatic" |

## 8. Bottom line

LMU is a **hybrid assembly** that is data-pinned as a retrodiction of our own aeon and compatible with the CMB via a standard α-attractor. It contains **no new equation**; its one testable number (r=0.0037) is Starobinsky's, inherited conditional on the wiring. Its closure rests on **one** field-wide open question — is de Sitter stable? — **plus** the [Hypo] wiring, **plus** two spine choices (tiny-de-Sitter endgame; which reset channel) that must be made explicitly and then propagated into the main `.tex`. The machinery runs and the values thread; the framework is **not** contradiction-free until those choices are reconciled in the main document, and no proof of closure exists. That is the honest state — including the parts the first draft of this synthesis glossed, which the stress test caught.
