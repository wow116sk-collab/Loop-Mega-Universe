# LMU — the framework as it stands (synthesis, 2026-07-07)

**What this is.** A single, honest statement of the Loop Mega Universe framework after this session's work — the cycle, the two axes, the three joints (now reduced), the "no-barrier / no-zero" stance, and a strict ledger of what is proven, fitted, predicted, and open. It supersedes nothing in the main document (`LMU_V3_26_consolidated.tex`); it is the plain synthesis to read alongside it. **Every mechanism is borrowed and owned (R7); the only LMU-specific content is the wiring/assembly, which is flagged [Hypo] throughout.**

**Label legend.** `[Fact]` measured · `[Fact-th]` from established theory · `[fit]` a measured value plugged in and read back out · `[Hypo]` the wiring/assembly, unclaimed · `[open]` unsolved field-wide.

---

## 1. The picture in one paragraph

The universe runs in aeons on an eternal, infinite substrate **L0**. An aeon begins hot and smooth, forms structure and black holes, and its dark-energy field **A** thaws toward a tiny floor so the aeon dilutes into a cold, near-empty, *tiny-but-nonzero* de Sitter state. One black hole — the survivor **L1** — wins every merger and evaporates over ~10¹⁰⁰ yr; its terminal Hawking **flash** triggers a **new hot start**, and the loop repeats. Time is one continuous L0 axis (the bang re-zeros the internal clock, it does not reset the background); entropy climbs monotonically along it. The framework is an **assembly** of established mechanisms — Penrose's conformal crossing, Starobinsky/α-attractor inflation, the ekpyrotic/inflationary smoothing, Coleman–De Luccia or the conformal flip for the reset, Gibbons–Hawking horizon thermodynamics, the trace-anomaly-induced scalaron — wired into one cycle.

## 2. The cycle, pre-aeon → new aeon (the equation spine)

Read from **our own aeon backward**: fit the measured present (n_s, A_s, T_CMB, Ω_Λ, H₀), integrate the borrowed equations back to the bang and forward to the endgame. The whole line is data-pinned; the joints are where the line meets a premise no measurement fixes. (Full chain + values: `code/lmu_full_cycle.py`, `review/LMU_full_cycle_equations.md`.)

1. **Cold end (L0 basin).** A-field: $\ddot A+3H\dot A+m^2A=0$ → thaws to a tiny floor; survivor mass from $\tau_{\rm evap}=2.1\times10^{67}(M/M_\odot)^3$ yr ⇒ $M\!\sim\!8\times10^{10}M_\odot$; carried $S_{\rm BH}\!\sim\!10^{99}$.
2. **Flash.** Evaporation endpoint: $T_{\rm flash}\!\sim\!7\times10^{12}$ GeV, burst $\sim\!10^{14}$ J — the trigger.
3. **Hot start.** The conformal factor $\omega$ acts as an α-attractor inflaton (the wiring), $\alpha=1$; $V^{1/4}\!\sim\!8\times10^{15}$ GeV, reheat $T\!\sim\!3\times10^{15}$ GeV via the inflationary free lunch.
4. **CMB (fit).** $n_s=1-2/N=0.965$, $A_s=2.1\times10^{-9}$ — inputs read back out. **$r=12/N^2=0.0037$** — the one predicted number (Starobinsky's α=1 value).
5. **Smooth half.** Old inhomogeneity diluted $e^{-2N}\!\sim\!10^{-49}$/point.
6. **Thermal bridge.** Reheat cools over ~66 e-folds to the **measured 2.725 K**.
7. **Entropy.** Radiation $S\!\sim\!10^{90}$; horizon $S=A/4G\!\sim\!10^{122}$ (the ceiling); the Frautschi gap re-arms the arrow.
8. **Back to cold.** Structure re-forms → new survivor → A thaws → returns to step 1.

## 3. The two axes (why they connect)

- **Time axis:** L0 carries one continuous time; the bang re-zeros the internal clock and re-mints content — it does **not** reset the background. The arrow is inherited from L0, so it needs no separate reset. This dissolves the "arrow reset at the bang" worry and locates the open problem in the **energy/entropy** sector.
- **Energy/entropy axis:** the cold→hot transition computed end-to-end (§2, steps 3–7).
- **The join:** entropy is conformally balanced across the boundary ($S_{\rm rad}=\tfrac43 S_{\rm BH}$), so the residual is purely energetic — the single thread tying the two axes. (`review/LMU_seam_time_energy_merged.md`.)

## 4. The three joints — reduced this session

The loop leaves three premises no equation closes. This session reduced them:

1. **The wiring (Ω = inflaton)** — [Hypo], unchanged in status but with its **Penrose-conflict removed**: dark matter is sourced at the nucleation bubble wall (**filtered DM**, Baker–Kopp–Long 2019), an independent channel, so Ω is free to be the inflaton and need not be Penrose's erebon. The filtered DM is super-heavy (~10¹⁷–10¹⁸ GeV), converging with the erebon's Planck-mass scale. (`review/JOINT3_filtered_dm.md`.)
2. **The V_min floor + the reset probability P>0** — **collapsed into one question.** Under the **"no exact zero"** postulate, the A-field (quintessence) evades Weinberg's constant-Λ no-go, so V_min need never be *exactly* 0; the endgame is a **tiny, unstable de Sitter** ($T=H_\infty/2\pi>0$; unstable per Volovik ⇒ Γ>0, the P>0 the reset needs). Both joints reduce to: **is de Sitter stable (Γ=0, Boddy–Carroll–Pollack) or unstable (Γ>0, Volovik)?** The postulate picks Volovik. [open]. (`review/JOINT2_no_zero_unification.md`.)
3. **"No barrier" (the reset channel).** Committing to the **conformal flip** (Ω→1/Ω at the flash, the framework's B-alt) rather than CDL tunneling **dissolves** the swampland-minimum objection, the tunneling form of de Sitter stability, and the black-hole-catalysis (GMW/B_seed) machinery — none of which apply without a barrier. It relocates the question to the barrier-free de-Sitter-decay (Volovik) + the Ω-injection (paid by the free lunch) + entropy via the infinite L0.

## 5. Consistency checks passed this session

- **The endgame is anchored, not invented:** V_min = ρ_Λ = (2.3 meV)⁴, H_∞, T_dS, S all fixed by the measured Λ (`code/endgame_anchored_desitter.py`).
- **The uniformity is expected, not a puzzle:** we sit at ~10⁻⁹⁰ of the way to the endpoint, so no premature decay could have happened; LMU is consistent with (even predicts) the observed uniformity, though it cannot distinguish Γ>0-slow from Γ=0 (`code/uniformity_and_decay.py`).
- **Dropping a=constant does not break the equations:** the de Sitter thermodynamics generalises to time-varying H via the apparent horizon (Akbar–Cai 2006); the only breakdown is at exact H=0, which the no-zero principle forbids (`code/aconstant_consistency.py`).
- **B_seed (the last computable piece):** the flash relights via GMW when the survivor reaches ~5 Planck masses — plausible, borrowed, at the QG edge, contested, barrier-dependent (`code/bseed_flash_catalysis.py`).

## 6. The honest ledger (what may / may not be claimed)

| Claim | Status | May say | May NOT say |
|---|---|---|---|
| CMB (n_s, A_s) | **[fit]** | "consistent with Planck via a standard α-attractor" | "predicts the CMB" |
| r ≈ 0.0037 | **[Fact-th, borrowed]** | "inherits Starobinsky's r=12/N²; CMB-S4 can test it" | "LMU's own prediction" (it's Starobinsky's) |
| 2.725 K | **[Fact]** | "measured; consistent in the ledger" | "derived" |
| the cycle closes | **[Hypo/open]** | "a consistent, data-pinned retrodiction" | "proven" |
| de Sitter stability | **[open]** | "the single contested question the loop rests on" | "solved" |
| the wiring | **[Hypo]** | "a candidate identification, Penrose-conflict removed" | "novel / proven" |

**Every equation is borrowed** (Penrose, Starobinsky, Kallosh–Linde, Guth, Coleman–De Luccia, Gibbons–Hawking, Frautschi, Tolman, Wald, Volovik, Baker–Kopp–Long, Gregory–Moss–Withers, Akbar–Cai, …). The only candidate-original content is the wiring/assembly — [Hypo].

## 7. Falsifiers (pre-registered)

- **F4:** the ω-inflaton predicts CMB B-modes at **r ≈ 0.0037** (α=1). CMB-S4 / LiteBIRD (σ(r)~10⁻³) can reach it; r=0, or r far from this, hurts the inflationary-reset reading. (r=0.0037 is shared with Starobinsky/Higgs, so a detection supports but does not uniquely select LMU.)
- **F1:** DESI-Y5 (~2027) — sustained w(z)<−1 at ≳3σ falsifies the canonical thawing A-field; the evolving-w hint currently *supports* the transient-acceleration (Minkowski-not-eternal-dS) reading.
- **The single decisive theory question:** is de Sitter stable or unstable? — settles the loop, field-wide open.

## 8. Bottom line

LMU is a **hybrid assembly** that is internally consistent, data-pinned as a retrodiction of our own aeon, compatible with the CMB (via a standard α-attractor), and free of the Penrose dark-matter conflict. It contains **no new equation**; its one testable prediction (r=0.0037) is Starobinsky's; and its closure rests on **one** field-wide open question (de Sitter stability) plus the [Hypo] wiring. The machinery runs; the proof does not yet exist — and that is stated plainly, not hidden.
