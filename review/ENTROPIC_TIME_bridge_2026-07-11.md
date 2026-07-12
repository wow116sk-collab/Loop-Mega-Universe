# ENTROPIC_TIME bridge — τ_aeon: the aeon's internal clock built from its own entropy flow
**Status: [Hypo], wiring-only.** Every equation below is borrowed (owners in §5); the only candidate-original content is the assembly. **Staged for V3.29** — not yet in the `.tex`.
**Grounding:** ownership sweep `review/ENTROPIC_TIME_ownership_2026-07-11.md` (34 agents over two passes, ~90 papers, twice-verified: the combination is **unoccupied among cosmological models**, with Barontini as the operational lab precedent). Numerics: `code/entropic_time_vs_energy_seam.py`.

---

## 0. The claim (phrased per the verifier's rule)

> Define the aeon's internal time as the accumulated **coarse-grained** entropy flow of the aeon's own ledger. Nothing else is added: the clock's crawl on the tiny-de-Sitter tail, its crescendo into the terminal flash, its stall through inflation, and its re-arm at reheating are then *read off* the entropy bookkeeping LMU already carries. No cosmological model in the literature does this (twice-swept, adversarially verified); the operational construction exists in the laboratory (Barontini 2026) and single-history cosmological parametrizations exist (Weberszpil–Sotolongo-Costa 2026; Martyushev 2016; Hauret–Magain 2017) — LMU's addition is wiring it into a **cyclic, BH-generated** cosmology with a **deterministic re-arm**.

## 1. Definition

$$\tau_{\rm aeon}(\lambda)\;=\;\frac{\sigma}{k_B}\int_{\lambda_0}^{\lambda} dS_{\rm cg}$$

- **σ** — arbitrary entropic time unit (Barontini's convention, his Eq. 3).
- **S_cg** — the **coarse-grained / thermodynamic** entropy of the aeon's ledger. *Coarse-grained is load-bearing, not a nicety:* under unitary evaporation the fine-grained radiation entropy is **non-monotonic** (Page curve — it peaks at ~54% of the survivor's lifetime and then falls; Page arXiv:1301.4995). A fine-grained τ would run **backward** through the second half of the evaporation. The clock integrates Zurek's ledger, by definition.
- **Ledger declaration (the fork):** the **matter ledger** (S_rad + S_BH + baths) is used throughout this note. Adding the horizon term (S_dS = π/GH²) gives a second admissible clock whose de-Sitter-tail crawl (→ 2.6×10¹²²) outweighs every matter step by ~18 orders. The two clocks **order events identically** (both monotone) but weight epochs differently; *choosing the ledger is choosing the clock* — this choice is part of the hypothesis (§6.1).

## 2. The aeon profile (all inputs owned; magnitudes: Egan–Lineweaver 2010, Zurek 1982, Gibbons–Hawking 1977)

| phase | energy ρ | dS source | τ behaviour |
|---|---|---|---|
| flash → plateau | jumps to ~10⁻¹⁰ | prior survivor's S_rad = 4/3·S_BH crossing the seam | **the loudest tick of the cycle** |
| inflation (60–85 e-folds) | flat at max | frozen field: dS ≈ 0 | **stall** (no time elapses) |
| reheating | a⁻⁴ fall begins | hot bath created (~10⁸⁹) | tick |
| radiation → matter era | falls ~110 orders | adiabatic ≈ 0; then clumping → SMBHs (~3×10¹⁰⁴) | slow accumulation |
| DE / tiny-dS tail | flat at floor 10⁻¹²⁰ | evaporation + GH bath keep dS > 0 | **crawl — slow, never zero** |
| evaporation completion | flat at floor | S_BH → 4/3·S_BH out; net +⅓S_BH | **crescendo → the next flash** |

**Pre-bang closed form** (single dominant source ⇒ one equation; from M(t)=M₀(1−t/t_{ev})^{1/3}, S_BH ∝ M²):

$$\tau(t)\;=\;\tau_{\max}\Big[1-\big(1-\tfrac{t}{t_{ev}}\big)^{2/3}\Big],\qquad
\tau_{\max}=\tfrac{1}{3}S_{BH,0}\;\approx\;3.5\times10^{100}\ \ (10^{12}M_\odot\ {\rm survivor})$$

with inversion $t(\tau)=t_{ev}\big[1-(1-\tau/\tau_{\max})^{3/2}\big]$ and rate $d\tau/dt\propto 1/M \propto (1-t/t_{ev})^{-1/3}$ — **divergent (integrably) into the flash**. Three readings: (i) the pre-bang evaporation era is **finite** in τ — at the $10^{12}M_\odot$ anchor above ($S_{BH,0}=1.05\times10^{101}\,k_B$) the era is ~2×10¹⁰³ yr; at the $10^{11}M_\odot$ band top ($\tau_{\max}\approx3.5\times10^{98}$) it is ~2×10¹⁰⁰ yr; (ii) the clock approaches the bang as a **crescendo**, not a countdown; (iii) with the inflation stall appended, flash → hot bang is **one thick tick** — in entropic time the seam is nearly a single instant, however many e-folds sit inside it.

**The trend pair:** energy = **sawtooth** (falls ~110 orders in-aeon, one reset jump at the seam, remembers nothing); entropic time = **staircase** (monotone, never resets; steps at energy *transactions*, treads at stasis). Clausius weighting dS = dE/T makes cold transfers ~10⁴⁷× louder per joule than reheating — the silent evaporation era dominates the matter-ledger clock.

## 3. The identity that compresses cold→hot into one line

The seam works because the energy crosses it in the **unique form that neither disperses nor ticks**:

$$w=-1 \iff \rho\propto a^{0}\ \text{(expansion cannot dilute it)} \iff dS\approx 0\ \text{(no entropy written; }\tau\text{ stalled)}$$

"Doesn't disperse" and "no time elapses" are not two effects — they are **one state** (the frozen field). Reheating then converts the stored potential to heat faster than dilution (Γ > H). The flash remains **the match, not the fuel** (the document's own line): what takes 10¹⁰⁰ years is the burn schedule reaching its divergent endpoint, not a heat reservoir filling — radiation emitted along the way redshifts into L0 and is gone.

## 4. What the clock explains (it predicts nothing new)

1. **Why the pre-bang has exactly two observational doors.** A record requires entropy production (Landauer; `code/wiring_landauer_selection.py`). Where τ stalls, no records are written (inflation); where τ crawls, records are written but erased/exiled (tail → dilution + horizon exile). The only survivor is **structure preserved by the freeze itself** — the frozen field's fluctuation spectrum. Hence F4 (read the frozen structure: n_s, r) and F5 (confirm the erasure: no Hawking points) are not two tests we happened to pick; they are the **only two windows the physics leaves open**. The 2023–24 null on Hawking points and the r-band watch are the two faces of the clock.
2. **The arrow's re-arm, in clock language.** The new aeon's arrow is not made by lowering S (nothing decreases, ever) but by the **Frautschi–Davies gap re-opening**: at inflation, capacity S_max explodes while actual S sits at the flash deposit — dτ > 0 has room again. (Frautschi, Science 217, 593 (1982); Davies, "Stirring up trouble", CUP 1994.)
3. **The monotonic-entropy axiom, quantified.** "Fast / slow / stall — but the total must rise": fast = flash/reheat surges; slow = the tail crawl; stall = inflation (exactly dS = 0, the one true stop); the total = the staircase, monotone by construction, never reset (ρ_S → 0 in infinite L0 while S_total ↑; `code/entropy_monotonic_vs_tinyDS.py`).

## 5. Credit block (paste-ready)

> The timeless constraint is Wheeler–DeWitt (1967). Relational time from subsystem correlations is Page–Wootters (1983), made rigorous by Dolby (gr-qc/0406034), Giovannetti–Lloyd–Maccone (1504.04215) and Höhn–Smith–Lock (1912.00033; 2007.00580), and applied to quantum cosmology through minisuperspace, Bianchi I (2605.06093) and GFT-bounce settings (2407.03432). State-dependent thermal time is Connes–Rovelli (gr-qc/9406019), with Rovelli's CMB-state computation (CQG 10, 1567 (1993)) as the cosmological anchor. Matter clocks through a bounce are Ashtekar–Pawlowski–Singh (gr-qc/0607039) and the Brown–Kuchař line (gr-qc/9409001). Entropy-as-clock has term-level owners: Caticha (inference; 1011.0746), Martyushev & Shaiapin (Δτ ∝ ΔS; Entropy 18, 233 (2016), arXiv:1605.06969; follow-ups 2017/2019/2025), Erker et al. (entropy per tick; 1609.06704, PRX 7, 031022), Hauret–Magain–Biernaux (Entropy 19, 357 (2017), arXiv:1707.07542), and — closest — Weberszpil & Sotolongo-Costa (IJTP 65:15 (2026), DOI 10.1007/s10773-025-06212-1: foundations/parametrization, with the cosmological-epochs application in their SSRN companion, abstract 5319941; single history, explicit dS/dt=0 stall) and Barontini (PRR 8, L022047 (2026), arXiv:2509.07745: the operational entropic clock, τ(λ)=(σ/k_B)∫(dS/dφ)|dφ|, ordering events across analogue big-bang/big-crunch cycles and stalling between crunch and bang). Monotone-through-a-cycle quantum clocks were anticipated by Bojowald–Tavakol (0803.4484, squeezing — proposal-level). Evaporation entropy bookkeeping: Zurek (PRL 49, 1683 (1982); cf. Page PRL 50, 1013 (1983) and the Page curve, 1301.4995). Horizon entropy: Gibbons–Hawking (1977); budget: Egan–Lineweaver (0909.3983). The arrow's re-arm: Frautschi (Science 217, 593 (1982)) and Davies (CUP 1994). **LMU's only addition is the wiring: identifying the aeon's internal time with the coarse-grained entropy flow of its own ledger, crawling on the tiny-dS tail, diverging integrably into the deterministic terminal flash, stalling through inflation, and re-arming at reheating, on an infinite substrate where ρ_S → 0 while S_total ↑.**

## 6. Caveats the wiring carries (all seven — none optional)

1. **Clock-choice dependence:** bounce/seam physics can depend on which relational clock is quantized (Gielen–Menéndez-Pidal 2005.05357, CQG 37, 205018; 2205.15387). The matter-vs-horizon **ledger fork** (§1) is LMU's concrete instance: same ordering, ~18-order reweighting. Declare the ledger in every quantitative statement.
2. **The dS-tail attack:** Dyson–Kleban–Susskind (hep-th/0208013) — recurrences erase any persistent arrow in an eternal causal patch. Standing answer, to be restated wherever "τ crawls but never stops" appears: the tail is **cut deterministically** at ~10¹⁰⁰ yr ≪ e^(10¹²²) recurrence.
3. **Rival monotone:** complexity keeps growing after entropy saturates (Brown–Susskind 1701.01107, PRD 97, 086015) — the canonical alternative late-tail clock; adjacent-owner menu, not adopted.
4. **Kiefer–Zeh is the opposite family:** their arrow **reverses** at the recollapse turning point and WKB time cannot cross it (gr-qc/9402036) — contrast citation only, never a template.
5. **Barontini's own limits:** τ undefined where entropy does not flow (LMU dodges: dS > 0 on the tail; the one true stop is inflation, and there the stall *is* the physics); minisuperspace analogue; V ≃ 0 regime.
6. **Coarse-grained only (Page trap):** fine-grained S_rad runs the clock backward after the Page time — the definition in §1 pins Zurek's ledger for this reason.
7. **Near-seam clock reliability:** relational clocks can become unreliable near a bounce from their own quantum fluctuations (Marchetti–Oriti 2010.09700) — the τ surge at the flash sits exactly in that regime; any future quantitative seam claim must check it.

## 7. Three contrast lines (the differentiators)

1. **CCC deletes the tail's clock; LMU slows it.** Tod, verbatim: *"Once all particles are massless… there can be no clocks, and proper time disappears from the world."* The CCC school answers the Very Boring Era by removing time; LMU's τ keeps ticking on evaporation + the GH bath — same phenomenon, opposite strategy, and only one of them yields a seam with a **finite, computable** pre-bang duration (§2).
2. **Shape dynamics swapped entropy for complexity; LMU keeps entropy.** Barbour–Koslowski–Mercati's arrow variable (complexity) *flips* at the Janus point, and their "entaxy" **decreases** (1507.06498) — a two-headed clock. LMU's staircase is one-headed by construction.
3. **Barontini's seam is silent; LMU's seam is the loudest tick.** His analogue: *"no entropic time elapses between a big crunch and the subsequent big bang, because no entropy is exchanged there."* LMU's transition IS an entropy transaction (evaporation crescendo + flash + reheat). One rule — τ ticks iff entropy flows — two seam physics, opposite signatures.

## 8. Status and non-claims

- **[Hypo], wiring-only.** All equations borrowed; the assembly unoccupied among cosmological models (twice-verified); Barontini = lab precedent, cited, not evidence for LMU.
- **Moves no falsifier.** F1–F6 unchanged; §4.1 is an *explanation* of F4/F5's form, not a new test.
- **Independent of the main wiring knot.** τ_aeon does not close ω = inflaton (that stays [Hypo → soft/favoured], gauge + free IC, measurement-decided); the two interlock — the plateau reading supplies the stall, the deterministic flash supplies the surge — but each stands or falls separately.
- **The ledger choice (§1) and the seam-regime reliability (§6.7) are the two places this layer could be attacked first.** They are stated as parts of the hypothesis, not hidden.
