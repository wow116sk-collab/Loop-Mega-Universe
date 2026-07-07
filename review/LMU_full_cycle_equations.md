# The LMU cycle in equations — pre-aeon → new aeon

> **⚠️ ชั้นเก่า (pre-2026-07-07 "deterministic flash") — อ่านตัวปัจจุบันเท่านั้น.** สถานะเปิดของ LMU ปัจจุบัน = **2 ปม** เท่านั้น: **"+3" spread** [soft] + **wiring ω=inflaton** [Hypo]. **de Sitter stability / P>0 / V_min=0 / swampland-minimum = คำถาม field-wide ที่ LMU แชร์ ไม่ใช่ปม/ตัวปิดวงของ LMU** (reset เป็น deterministic flash แล้ว ไม่ใช่ probabilistic decay). **Single source of truth = `review/LMU_SYNTHESIS_2026-07-07.md`.** ข้อความ/ไดอะแกรมด้านล่างที่ยัง frame `P>0 OPEN` / de Sitter เป็นปมของ LMU = **superseded** เก็บเป็นประวัติ ห้ามยกกลับ.
### Every equation, what it connects to, the value it carries, its owner, and its status

**What this is.** The full chain from one aeon's cold dead end to the birth of the next, written as a sequence of equations with the value flowing through each. **Nothing here is new** — it *assembles* borrowed, individually-owned equations (R7); the only LMU-specific move is the *wiring* (how they connect), flagged **[Hypo]**. Reproduce every number in one pass: `code/lmu_full_cycle.py`.

**Status legend.** `[Fact]` measured · `[Fact-th]` from established theory · `[Fact-eq]` arithmetic from inputs · `[fit]` input read back out · `[Hypo]` the wiring/assembly · `[soft]` rests on an un-derived step · `[open]` unsolved field-wide.

**Honest scope (from `PROOF_STATUS_LEDGER.md`).** The CMB is a **fit**, not a prediction; the one prediction r=0.0037 is **Starobinsky's** α=1 value; the loop's ignition (P>0) and V_min=0 are **open**. This ledger shows the machinery, not a proof that the loop closes.

---

## Value-flow map (how the chain threads)

```
interlude time τ ──► survivor mass M ──► S_BH (carried entropy)
                          │
                          ▼
                    terminal flash (T_flash, E_burst) ──► seeds nucleation
                          │
         Φ_gen false vacuum ──► CDL bounce B ──► Γ>0  [P>0 OPEN]
                          │
        ω = conformal factor ──[Hypo wiring]──► α-attractor inflaton, α=1
                          │
   INPUT n_s ──► N=57 ─┬─► n_s (identity)   ─┬─► CMB
   INPUT A_s ──► V   ──┼─► r = 12/N² = 0.0037 │
                       └─► A_s (identity)     ┘
                          │
        V ──► T_reh ──► (66 e-folds) ──► 2.725 K [measured] ──► S_rad ~1e90
                          │
     old residual ──► e^−2N dilution ──► 1e−49  [soft: e^−5N → 1e−122]
                          │
        structure re-forms ──► black holes ──► new survivor ──► τ  (loop closes)
```

---

## STAGE 0 — pre-aeon cold end (the L0 basin)

| Equation | connects (in → out) | value | owner | status |
|---|---|---|---|---|
| $\ddot A + 3H\dot A + m^2A = 0$, $V=\tfrac12 m^2A^2$ | the A-field thaws → $V_{\min}=0$, $A\to0$, $H\to0$ (asymptotic Minkowski) | $m\!\approx\!0.80H_0$, $A_i\!\approx\!2.70M_p$ | Ratra–Peebles 1988; Wetterich 1988 | [Fact-th] |
| $\tau_{\rm evap}=2.1\times10^{67}(M/M_\odot)^3$ yr | interlude $\tau$ → survivor mass $M$ | $\tau\!\sim\!10^{100}$yr → $M\!\approx\!7.8\times10^{10}M_\odot$ | Hawking 1975; Page 1976 | [Fact-th] |
| $S_{\rm BH}=\dfrac{4\pi k_B GM^2}{\hbar c}$ | $M$ → carried entropy | $S_{\rm BH}\approx6\times10^{98}\,k_B$ | Bekenstein 1973; Hawking 1975 | [Fact-th] |
| $\delta\rho/\rho\sim O(1)$ | old aeon fully clumped (all matter in black holes) | O(1) | BKL 1970 (growing anisotropy) | [Fact-th] |

## STAGE 1 — the flash (the trigger)

| Equation | connects | value | owner | status |
|---|---|---|---|---|
| $T_{\rm flash}=\dfrac{M_{\rm Pl}^2}{8\pi M_{\rm end}}$ | survivor evaporates to endpoint (~1.5 g) → flash temperature | $T_{\rm flash}\approx7\times10^{12}$ GeV | Hawking 1975 | [Fact-th] |
| $E_{\rm burst}=M_{\rm end}c^2$ | endpoint mass → burst energy (seeds one inflating patch) | $E_{\rm burst}\approx1.3\times10^{14}$ J | (rest energy) | [Fact-eq] |

## STAGE 2 — nucleation / relighting  **← the OPEN joint**

| Equation | connects | value | owner | status |
|---|---|---|---|---|
| $B_{\rm CDL}=\dfrac{27\pi^2\sigma^4}{2(\Delta V)^3}$, $\Gamma=Ae^{-B}$ | false-vacuum barrier → nucleation rate | $B\!\sim\!10^3$–$10^6$, $\Gamma>0$ strictly | Coleman–De Luccia 1980 | [Hypo] (needs the barrier) |
| $B_{\rm seed}<B_{\rm vac}$ (flash catalysis) | survivor flash → lowers the barrier, fires per interlude | $B_{\rm seed}$ **not computed** | Gregory–Moss–Withers 2014 | [Hypo] (uncomputed) |
| $O(4)\to O(3,1)$, $\Omega_k<0$ | instanton → open, homogeneous interior | $\Omega_k<0$ | Coleman–De Luccia 1980; Gott 1982 | [Fact-th] |
| **$P>0$ vs $P=0$** | whether the cold end can ignite at all | **the de Sitter stability question** | Boddy–Carroll–Pollack 2014 (P=0) vs Volovik 2020 (P>0) | **[open]** |

## STAGE 3 — hot start (the energy half)

| Equation | connects | value | owner | status |
|---|---|---|---|---|
| $\omega=e^\omega\Rightarrow$ α-attractor inflaton | **the wiring**: conformal factor → inflaton | — | Penrose 2010 (Ω) + Kallosh–Linde 2013 (α-attr) — **welded here** | **[Hypo]** |
| $\langle T^\mu_\mu\rangle\to R^2\to$ scalaron | (optional grounding) anomaly at the conformal boundary → scalaron | needs ~$10^{13}$ fields for $A_s$ | Starobinsky 1980; Hawking–Hertog–Reall 2000 | [Fact-th] shape / [open] scale |
| ghost of the conformal mode → $R^2$ → $\alpha=1$ | why the shape is fixed | $\alpha=1$ (to $\sim\!10^{-19}$, EFT) | Gibbons–Hawking–Perry 1978; Starobinsky 1980 | [Fact-th\|cond] |
| $V=24\pi^2\varepsilon A_s M_p^4$, $\varepsilon=r/16$ | INPUT $A_s$ → potential scale | $V^{1/4}\approx8\times10^{15}$ GeV | (slow-roll normalization) | [Fact-eq] |
| $T_{\rm reh}=\big(\tfrac{30V}{\pi^2 g_*}\big)^{1/4}$ | $V$ → reheat temperature (free lunch: $E=\rho V$) | $T_{\rm reh}\approx2.8\times10^{15}$ GeV | Guth 1981; Albrecht et al. 1982 | [Fact-eq] |

## STAGE 4 — CMB (the observables)

| Equation | connects | value | owner | status |
|---|---|---|---|---|
| $n_s=1-2/N$ | $N$ → tilt | $0.9649$ | α-attractor / Starobinsky | **[fit]** (N fixed *by* $n_s$) |
| $r=12\alpha/N^2$ | $\alpha,N$ → tensors | **$0.0037$** ($\alpha{=}1$); $0.009$ ($\alpha{=}2.44$ fit) | Starobinsky 1980 (the value) | [Fact-eq\|Hypo wiring] |
| $A_s=V/(24\pi^2\varepsilon M_p^4)$ | $V$ → amplitude | $2.1\times10^{-9}$ | (normalization) | **[fit]** (exact identity) |
| $\delta T/T=\sqrt{A_s}$ | → temperature anisotropy | $4.6\times10^{-5}$ | (definition) | [Fact-eq] |

## STAGE 5 — smooth half (dilution)

| Equation | connects | value | owner | status |
|---|---|---|---|---|
| $\delta_{\rm new}=\delta_{\rm old}\,e^{-2N}$ | O(1) residual → diluted per point | $\sim\!10^{-49}$ (44 orders below the $10^{-5}$ seed) | Guth-lineage inflationary smoothing | [Fact-eq] |
| spread $\sim e^{-5N}\to10^{-122}$ | → de Sitter floor | $\sim\!10^{-124}$ | (assembled) | **[soft]** (exponent 5 un-derived; $e^{-3.5N}$ breaks it) |

## STAGE 6 — thermal bridge

| Equation | connects | value | owner | status |
|---|---|---|---|---|
| $T\propto 1/a$, $N_{\rm post}=\ln\!\big[\tfrac{T_{\rm reh}}{T_0}(\tfrac{g_*}{g_{*0}})^{1/3}\big]$ | $T_{\rm reh}$ → today over post-reheat e-folds | $\sim\!66$ e-folds to **2.725 K** | standard thermal cosmology | [Fact-eq] |
| $T_0=2.72548$ K | the endpoint | measured | Planck / FIRAS | **[Fact]** (measured, *not* derived) |

## STAGE 7 — entropy (closing the budget)

| Equation | connects | value | owner | status |
|---|---|---|---|---|
| $S_{\rm rad}=\tfrac{2\pi^2}{45}g_*\big(\tfrac{k_BT}{\hbar c}\big)^3 V_{\rm obs}$ | $T$, volume → radiation entropy | $\sim\!1.0\times10^{90}\,k_B$ | standard | [Fact-eq] |
| $S_{\rm hor}=A/4G$ | horizon → ceiling (dominant term) | $\sim\!2.2\times10^{122}\,k_B$ | Gibbons–Hawking 1977 | [Fact-th] (never measured) |
| $S_{\max}-S$ (Frautschi gap) | → fresh negentropy budget | $\sim\!10^{122}$ | Frautschi 1982; Tolman 1931 | [Fact-th] |

*(10^90 = radiation piece; 10^122 = horizon piece — different entropies. Whether the total "stalls at the ceiling" splits on whether horizon entropy counts; see `code/entropy_budget_clarify.py`.)*

## STAGE 8 — back to cold (the loop closes)

Structure re-forms (the $10^{-5}$ seed grows) → black holes form and merge → a new survivor $L1$ → the A-field thaws again to $V_{\min}=0$, $H\to0$ → **returns to STAGE 0**. The inverted exit matches the cold-clumpy start (`code/lmu_preaeon_backcalc.py`) — the arithmetic closes; the *physics* closure hinges on the open joints below.

---

## The joints no equation above closes (do not present as solved)

1. **STAGE 2, $P>0$** — the cold end must nucleate a hot phase. $\Gamma>0$ strictly *if* a metastable $\Phi_{\rm gen}$ false vacuum exists — but that existence is the **de Sitter stability** question, [open]/contested (swampland). Spontaneous $\Gamma$ is astronomically slow ($\sim\!10^{2092}$ yr $\gg 10^{100}$ yr interlude), so per-interlude firing needs flash catalysis ($B_{\rm seed}$, uncomputed).
2. **$V_{\min}=0$** — why the A-field floor is *exactly* zero (the Weinberg wall). [open]. The whole "Minkowski endgame → infinite ceiling" rests on it.
3. **The wiring** — $\omega$ (Penrose's conformal factor) $=$ the α-attractor inflaton. [Hypo], unclaimed, and *against* Penrose's own reading (his dynamical Ω is dark matter, not the inflaton).

**Bottom line:** every equation above is borrowed and correctly chained; the values thread consistently pre-aeon → CMB → back to cold; but the cycle's closure is **conditional** on three items that no equation here settles. The machinery runs; the proof does not exist. Reproduce: `code/lmu_full_cycle.py`.
