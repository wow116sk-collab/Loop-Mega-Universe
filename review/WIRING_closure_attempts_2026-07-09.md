# Wiring joint — Round-2 closure attempts (2026-07-09)

**What this is.** A logged record of a serious, adversarially-verified attempt to **close** the one genuinely-LMU-specific joint — the wiring (ω = the prior aeon's CCC conformal factor Ω = the α-attractor inflaton, plateau-not-erebon). **Outcome: NOT closed** (`ADVANCED-BUT-OPEN`). Kept as a dead-end-with-structure: the round did not close the joint but it (a) proved *why* a whole class of methods cannot, (b) defused an over-strong objection from the prior round, and (c) sharpened the remaining obstacle to a concrete open problem. Every mechanism is attributed to its owner (R7); LMU's move is only the read-across.

**SSOT for open-item status:** `review/LMU_SYNTHESIS_2026-07-07.md` — the wiring stays **`[Hypo → soft/favoured]`**. **Method:** 11-agent workflow (5 world-literature searches → 4 independent closure attempts, each with a runnable script → 1 batch adversarial verifier → synthesis). All four scripts reproduce; two load-bearing ones re-run by the editor.

---

## Verdict (adversarially verified)

`ADVANCED-BUT-OPEN`. Independent batch verifier + editor re-run: **fixes Ω Cauchy data = false · derives amplitude = false · selects plateau by derivation = false · reproduced = true.** The joint is unchanged in status but the *shape of what would close it* is now sharp.

## What the round produced (script-backed)

### 1. A clean negative theorem — no asymptotic/least-action principle can pin Ω  ⭐
The CCC conformal factor obeys Tod's phantom-field equation; its FRW-homogeneous plateau vacuum **φ=0 is a stable NODE, not a saddle**: the Jacobian eigenvalues are **(−H, −2H)** — which *are* the two free Cauchy modes (φ₁ ∼ e^{−Ht}, φ₂ ∼ e^{−2Ht}), and **both already decay**. Consequences (`code/wiring_attemptA_leastaction.py`, editor-reproduced):
- There is **no isolated stable manifold** to select against — a full 2-parameter basin drains into the plateau.
- **φ₁ is a time-translation zero-mode of the action:** the on-shell escape action is **S·D = 1.5, flat across ≥4 decades of φ₁** (1.5000 → 1.4702). So minimising the action cannot pick φ₁.
- Therefore **no least-action / Freidlin–Wentzell / instanton / regularity / entropy-max principle that asymptotes to the plateau can pin Ω's Cauchy data** — including the Hartle–Hawking/Vilenkin no-boundary template ("regularity kills φ̇"), which does *not* bite here because both modes already decay.
- This is the generic reason every route below **relocates** the freedom (into the flash-IC / φ₁ family) rather than **removing** it. Pinning must come from **outside** the asymptotic ODE. `[Fact-th, script-backed]`. Owners: Freidlin–Wentzell (quasipotential); Coleman–De Luccia, Balek–Demetrian (CdL/Hawking–Moss); Hartle–Hawking / Vilenkin–Linde (no-boundary/tunneling); Tod 2015 (the phantom equation).
- *Banked coincidence (does not decide):* the barrier top sits **exactly on |V″|=4H²**, the Balek–Demetrian CdL-vs-Hawking–Moss marginal line — but it is degenerate (marginal, not decisive) and is *forced* by the assumed s=12H², so it is not an independent selection. And φ₂=0 is obtained only by overdamped adiabatic elimination = Penrose's Delayed-Rest-Mass Hypothesis re-inserted by hand, not derived.

### 2. The prior round's "unstable fixed point" objection is DEFUSED
The aeon-to-aeon map (λ_{i+1}=4λ_i²m_i/9k², m_{i+1}=9k²/4λ_i) is **area-preserving** — **det J = 1 at every point** — with **P = λ·m conserved** (relative drift 2×10⁻¹⁵). So the fixed line m·λ=9k²/4 is a **defective parabolic** point (both eigenvalues exactly 1), **not an exponential repeller** (`code/wiring_attemptC_msmap.py`, editor-reproduced). Consequences:
- The Round-1 reading "the LMU solution sits on an *unstable* fixed point → fatal fine-tuning" is **wrong/over-strong**; it downgrades to a **single marginal matching condition on a conserved quantity** (bounded/cyclic ⟺ P = 9k²/4). The joint is *less* pathological than the prior round implied.
- The "run the map backward so the repeller becomes an attractor" rescue is **falsified** — a conservative (det=1) map has no attractors or repellers in *either* time direction. `[Fact-th, script-backed]`. Owners: Markwell–Stevens 2022/2023 (the map); Wald (area-preservation reading).
- **Honest attribution caveat:** the literature search did **not** confirm the fixed-point relation m·Λ=9k²/4 verbatim in the Markwell–Stevens PDF; pending a direct PDF check it stands as an **LMU-internal `[Hypo]`**, not an owner-verified quote.

### 3. The entropy angle ranks, it does not select
Entropy production of the plateau (inflate→reheat) vs the erebon (a mass term): **S_A/S_B ≈ 1.2×10⁴** (plateau ≫ erebon) — but S_A is **monotone-unbounded in e-folds** (2.9×10⁸⁸ at N=60 → 3.8×10¹⁴⁰ at N=100), so there is **provably no interior extremum** to pin the finite φ₁ (`code/wiring_attemptB_entropyprod.py`). This is a **ranking, not a selection**: MEPP is an unproven heuristic (Martyushev–Seleznev; Dewar), and the only rigorous residue (the Freidlin–Wentzell most-probable *path*) selects a trajectory *given* the potential, never the potential/IC. So the S_rad=4/3·S_BH laundering (Zurek) supplies the *irreversibility/arrow*, not the *selection*. `[Fact-th ranking / Hypo selection]`.

### 4. The amplitude cannot be counted (field-wide, not LMU's knot)
Matching the R² coefficient (~5×10⁸ / A_s / M/M_Pl) needs **N_eff ≈ 10¹¹–10¹³ conformal fields** vs ~10² real (an 8–11 order shortfall; real content gives A_s ∼ O(1)), and hits **Duff's in-principle obstruction** that R² is not a genuine Weyl anomaly (`code/wiring_attemptD_amplitude.py`). The amplitude is **tuned, not counted** — a **field-wide** naturalness problem, not an LMU-specific closure-blocker. Owners: Riegert, Duff, Shapiro, Hawking–Hertog–Reall.

---

## The remaining obstacle, stated concretely (the sharpened open problem)
Pinning (φ₁, φ₂) has **no interior extremum and no isolated stable manifold** to attach to inside the asymptotic dynamics (result 1). A genuine closure needs a **derived (not imposed) external condition** — a first-principles version of **Tod's external 3-geometry Yamabe prescription** — that supplies an isolated stable manifold or a real interior extremum, **simultaneously** selects the plateau over the erebon by that same principle, **and** fixes the R² coefficient. No least-action / entropy / map-stability principle of the kinds tried can do it; this is why the joint stays open.

## Net / status
- **Wiring: `[Hypo → soft/favoured]`, unchanged in label** — but the obstacle is now sharp and one bad objection is removed.
- **New in the ledger this round:** result 1 (node-theorem) is a `[Fact-th, script-backed]` *reason* the whole asymptotic class fails → a genuine dead-end, kept. Result 2 (MS map area-preserving) **corrects** the Round-1 record. Results 3–4 confirm entropy=ranking and amplitude=field-wide-tuned.
- **de Sitter stability, the measure problem, the swampland, and the amplitude remain field-wide** — not LMU closure-blockers (unchanged).

---

## Addendum (2026-07-09) — Pitarn's reframe + the hot-flash test: the node is a *feature*, and the erebon is locked out at the flash

Two moves after the round above **change the reading of the negative theorem** and strengthen the selection. Both are Pitarn's read-across (R7).

### (1) The node-erasure is required, not an obstacle — so "fix (φ₁,φ₂)" was the wrong demand
The negative theorem (result 1) says the plateau is a stable node that **erases** the Cauchy data. Re-read: **a clean rebirth *requires* an information-erasing basin** (the new aeon must be memoryless/smooth — Penrose's WCH), and ignition is **external** (the deterministic flash — "one-way flash, not self-ignition", already in the body). So demanding that the *internal* dynamics *derive* (φ₁,φ₂) is the wrong demand: they are a **legitimate contingent initial condition** — the image of the previous aeon's endpoint delivered through the crossover, then erased into the node — not a gap to be closed. This is the same status as the Standard Model's input parameters: an *input*, not a *failure*. It also **vindicates the fertilization mapping**: "relocating the freedom to the external trigger" (the Round-1 refutation) is not a cheat — for an externally-ignited rebirth it is the correct physics (the egg does not self-select; the trigger is external and contingent). Net: the "(φ₁,φ₂) unpinned" half of the joint is **dissolved as illegitimate**, leaving only the plateau-vs-erebon *selection*.

### (2) The hot flash dynamically locks out the erebon — plateau selection strengthened `[Hypo → favoured, script-backed]`
Test (`code/wiring_hot_flash_vs_erebon.py`, editor-run): the discriminator is the frame-robust ratio **m_eff/H at the flash**.
- At the crossover Ω→∞ the rest mass is suppressed, **m_eff = m₀/Ω** (Penrose's delayed-rest-mass hypothesis, owned). With LMU's own crossover blueshift **Ω_flash ~ 10²⁶–10⁴⁷** (V3.28 in=out-ledger note), a Planck/GUT bare mass gives **m_eff/H ~ 10⁻²¹ … 10⁻⁴⁵ ≪ 1**.
- The standard frozen-vs-oscillating dichotomy (script-confirmed, test scalar in de Sitter, amplitude-independent): **m/H ≪ 1 → ⟨w⟩→−1** (frozen, vacuum-like, *inflating* = plateau); **m/H ≳ 3 → ⟨w⟩→0** (coherent oscillation, matter = the *erebon*); transition at m/H ~ 1–3.
- So at the flash the field sits **~21–45 orders deep in the frozen (w=−1) regime** → it inflates (plateau). The erebon (w=0 matter) would need **m/H ≳ 1 ⇒ Ω_flash ≲ 10⁵** — i.e. essentially *no* crossover blueshift — which contradicts Ω_flash ~ 10²⁶⁺ by ~20+ orders. **The erebon reading is dynamically locked out *at the flash*.**
- **Honest residue:** `[Hypo → favoured]`, *not* exclusion — it shows the flash **cannot deposit** the field as an erebon; it does not forbid an erebon existing *later* (as Ω→1 and the mass turns on), which is fine — that is exactly LMU's Ω=inflaton **+ DM-separate** split. Assumes m~m₀/Ω (Penrose DRMH) and H_flash~√(V₀/3); m/H is frame-schematic, but the 21–45-order hierarchy is far too large for conformal-frame factors to overturn.

### Net after the addendum
The wiring joint re-reads as: **(a) (φ₁,φ₂) = a legitimate contingent IC** (dissolved as a "gap", per the reframe) **+ (b) plateau-over-erebon = now dynamically favoured** (erebon locked out at the flash, not merely trace-anomaly-favoured) **+ (c) amplitude = field-wide-tuned** (untouched). This does **not** produce a `[Fact]` closure — but it downgrades the joint from "[Hypo] with an unpinned-data obstacle" to **"legitimate IC + a quantitatively-favoured selection"** — arguably the honest endpoint short of solving CCC's field-wide Ω-uniqueness. **Status label: `[Hypo → soft/favoured]`, unchanged in kind but materially stronger.**

---

## Addendum 2 (2026-07-09) — Rounds 3–4 + the convergent reading: the residual is *gauge + IC*, not a physical gap

Two more adversarially-verified closure attempts (Yamabe/Lichnerowicz-York; entropic selection) and one gating check. Neither closes the wiring, but together with Rounds 1–2 they **converge on a single structural answer** for *why* the wiring cannot be closed to `[Fact]` by any local/dynamical/entropic principle — and that answer is a **positive clarification**, not just another negative.

### Round-3 — Yamabe / Lichnerowicz-York (does solving the crossover 3-geometry uniquely fix Ω?) → `ADVANCED-BUT-OPEN`
Existence of a constant-scalar-curvature (Yamabe) metric is settled (Yamabe–Trudinger–Aubin–Schoen); **uniqueness is governed by the sign of the Yamabe invariant** = sign(k): Y<0 (open) unique, Y=0 (flat) unique-up-to-scale, **Y>0 (closed S³) non-unique** (Obata conformal orbit; Schoen; Pollack). `fixes_omega_uniquely=false`. The elliptic solve fixes only **φ₁** (given the York free data); **φ₂ is the second Cauchy datum of the hyperbolic phantom equation — the York momentum/TT slot — which no Einstein constraint fixes** (Penrose's Delayed-Rest-Mass hypothesis φ₂=0 is a *separate* physical postulate). LMU's near-flatness (Ω_k~0 → k=0) sits on the **Yamabe-zero borderline** (the *favourable* side), not the non-unique positive interior. Residual (fully decomposed): φ₂ (=DRMH), a global scale (=Λ̌=Λ̂), a compact slice (T³), and the borderline sign. **This confirms the Round-2 reframe with standard GR:** one of (φ₁,φ₂) is legitimately-free York data. Owners: Yamabe/Trudinger/Aubin/Schoen; Obata; Lee–Parker; Tod 2015/2023; Markwell–Stevens. `[Fact-th]` (script-backed: positive-case non-uniqueness reproduced; the "φ₂ free" reading is `[soft/structural]`, not derived).

### Gating check — Pitarn's monotonic-entropy axiom vs the tiny-dS endgame → **CONSISTENT** (`code/entropy_monotonic_vs_tinyDS.py`)
"Entropy only increases (rate fast/slow/stall, dip-maybe, but the total rises)" does **not** conflict with the finite tiny-dS ceiling: S_dS ∝ 1/H² **rises monotonically to the 10¹²² asymptote** as H→H_∞ (never decreases — the ceiling is an asymptote from below, not a wall hit); during the dS phase evaporation (S_rad=4/3 S_BH) still produces +1/3; L0 total rises forever while ρ_S→0. The axiom holds in its **strong form** for LMU (no component actually decreases). `[Fact-th]` pieces owned; per-aeon L0 contribution schematic `[Hypo]`.

### Round-4 — entropic selection (Pitarn's "selection = entropy production", formalizable core only) → `ADVANCED-BUT-OPEN`, **RULED OUT as a closer**
Tested whether the conformal anomaly + Zurek einselection + Landauer erasure lift the Obata degeneracy / fix φ₂. **Triple clean negative** (`fixes_omega_or_phi2=false`, reproduced, scope clean — no consciousness in any equation; consciousness stayed motivation-only, `[Speculation]`, out of the math):
- **Anomaly = FLAT on the Obata orbit** `[Fact-th, script-backed: code/wiring_anomaly_on_obata_orbit.py]` — the Riegert/Paneitz–Q-curvature action is identically constant along the round-S³ conformal orbit (editor-reproduced: max|d(action)/ds|≈3×10⁻¹⁴). Three independent owner-backed reasons: (i) odd-d S³ has no local trace anomaly (JKPS/F-theorem); (ii) conformally-flat ⇒ Weyl²=0 pointwise, ∫E₄=32π²χ topological, ∫□R=0 ⇒ topological constant (Deser–Schwimmer); (iii) **the u_s family is an isometry orbit and Γ[g] is diffeomorphism-invariant, so the conformal-Killing directions are exact zero-modes** (Obata; Onofri/Beckner/OPS). It grounds the plateau *shape* but selects no Ω; **only off-orbit** does a York shear φ₂ (Weyl²≠0) turn on the c-term, penalizing anisotropy toward φ₂=0 — a *relocation* (second, independent push toward the smooth/plateau reading, alongside the hot-flash lock-out).
- **Einselection = relocates φ₂** `[Fact-th, script-backed: code/wiring_einselection_phi2.py]` — the predictability sieve selects a pointer *basis/shape*, not a *value*; entropy production is **provably blind to the mean** (ΔS=0 exactly; covariance decouples from the mean for any quadratic H). Free φ₂ → free system-environment split-angle θ + stochastic draw; re-derives DRMH φ₂→0 only as a slow-manifold *approximation*.
- **Landauer = cost, not selection** `[Fact-th, script-backed: code/wiring_landauer_selection.py]` — erasing the orbit costs ~ln N nats (~276), affordable to ~10⁻⁹⁷ of the flash budget S_rad=4/3 S_BH, but **no minimum-cost member** exists (all members conformally isometric) — a consistent cost, not a selector.

### The convergent reading (the payoff of Rounds 1–4)
Every principle failed for the **same structural reason**, now explicit:
> **The wiring's residual freedom is a diffeomorphism/conformal-group symmetry zero-mode (= GAUGE) plus a legitimately-free York initial datum (φ₂). Neither is a physical gap.**
- Round-1/2: φ₁ = time-translation zero-mode (action flat). Round-3: the Obata "non-uniqueness" is the conformal-group orbit = **isometric metrics = gauge copies** (physically one metric); φ₂ = free York momentum. Round-4: the anomaly is flat on the orbit *because* it is diffeo-invariant and the orbit is isometric.
- **Consequence (positive):** the Round-3 positive-case non-uniqueness is **gauge** → Ω is physically unique up to gauge; the residual physical freedom is φ₂ (contingent York IC, SM-input-like) + the field-wide amplitude. **No LMU-specific physical hole remains.** No principle that respects diffeomorphism invariance (all physical principles do) can lift a diffeo zero-mode — that is the definition of gauge. This is *why* the seam cannot be closed by derivation, in any cyclic model.
- **Pitarn's entropy concept genuinely contributed:** it did not close the knot but it *reached* this reading — entropy is diffeo-invariant too, so its inability to select (only price/relocate) is itself the proof that the mode is gauge.

**Status after four rounds:** wiring `[Hypo → soft/favoured]`, **unchanged in label** — but the residual is now understood as **gauge + legitimate IC + field-wide amplitude**, and the plateau-over-erebon selection carries **two independent favouring pushes** (hot-flash mass-suppression lock-out; the anomaly's off-orbit isotropy penalty). What genuinely stays undetermined is the amplitude (field-wide) and the plateau-vs-erebon *reading* (favoured, not forced) — the latter decided ultimately by **measurement** (F4 tensor band, F5 Hawking-point absence), not derivation.

### The seam bottleneck (meta, `[Hypo]`)
The wiring is LMU's instance of a **bottleneck universal to cyclic cosmology**: the inter-aeon seam must simultaneously **erase** (memoryless/low-Weyl rebirth — WCH, avoids the Tolman entropy pile-up) and **transmit** (something must cross, or it is not a cycle). Erase-vs-transmit is intrinsically in tension. Every family hits it at its own joint — Tolman (entropy accumulation), Steinhardt–Turok (perturbation matching through the bounce), Penrose CCC (fix Ω uniquely), LQC (IC across the bounce), **LMU (the wiring)** — and each *tunes the erase↔transmit dial to a different position, which is the observable that distinguishes them* (CCC transmits → predicts Hawking points; LMU erases → predicts their absence, F5, + a plateau-sourced r-band, F4). Landauer ties the two faces together: erasing information *is* producing entropy, so the information bottleneck and the entropy engine are one object. This organizes all four rounds under one roof but is a cross-family pattern with per-point owners, not a proved theorem — `[Hypo]`.

## Scripts (reproducible)
- `code/wiring_attemptA_leastaction.py` — phantom-field bistable: node eigenvalues, action flat in φ₁ (the negative theorem).
- `code/wiring_attemptB_entropyprod.py` — plateau-vs-erebon entropy production; monotone-unbounded (no interior extremum).
- `code/wiring_attemptC_msmap.py` — MS aeon-map: det J=1, P=λ·m conserved, parabolic fixed point, backward-attractor falsified.
- `code/wiring_attemptD_amplitude.py` — anomaly-coefficient → R² amplitude field count (8–11 order shortfall + Duff obstruction).
- `code/wiring_hot_flash_vs_erebon.py` — **addendum:** m_eff/H at the flash (rest-mass suppression × crossover blueshift) locks out the erebon; frozen-vs-oscillating (w) confirmation.
- `code/wiring_anomaly_on_obata_orbit.py` — **Round-4:** the anomaly/Q-curvature action is flat on the round-S³ Obata orbit (diffeo zero-mode) — cannot lift the degeneracy.
- `code/wiring_einselection_phi2.py` — **Round-4:** decoherence selects a pointer basis but is mean-blind — relocates φ₂, does not fix it.
- `code/wiring_landauer_selection.py` — **Round-4:** erasure cost of the orbit (≪ flash budget) but no minimum-cost member — a cost, not a selector.
- `code/entropy_monotonic_vs_tinyDS.py` — **gating check:** the monotonic-entropy axiom is consistent (strong form) with the tiny-dS endgame; S_dS rises to the 10¹²² asymptote.
