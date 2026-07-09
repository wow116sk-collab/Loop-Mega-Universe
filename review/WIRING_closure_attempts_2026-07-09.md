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

## Scripts (reproducible)
- `code/wiring_attemptA_leastaction.py` — phantom-field bistable: node eigenvalues, action flat in φ₁ (the negative theorem).
- `code/wiring_attemptB_entropyprod.py` — plateau-vs-erebon entropy production; monotone-unbounded (no interior extremum).
- `code/wiring_attemptC_msmap.py` — MS aeon-map: det J=1, P=λ·m conserved, parabolic fixed point, backward-attractor falsified.
- `code/wiring_attemptD_amplitude.py` — anomaly-coefficient → R² amplitude field count (8–11 order shortfall + Duff obstruction).
