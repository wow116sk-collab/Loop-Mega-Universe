# Working log — everything after the V3.27 release (2026-07-08)

**What this is.** A running record of the discussion/work done *after* the V3.27 consolidation was cut, so the thread is not lost. Append-only within the session. Dry record, not a rewrite of any spine. **SSOT for open-item status stays `review/LMU_SYNTHESIS_2026-07-07.md`.** Nothing here changes an axiom, spine equation, or falsifier.

Order = chronological. Each block: what was asked → what was done → status.

---

## 1. Wiring selection argument (committed `6461516`)

**Ask:** find a selection/naturalness argument that pushes the plateau over the erebon (the wiring's last `[Hypo]` line).

**Done:** the conformal/trace anomaly *naturally produces* the Starobinsky plateau (Hawking–Hertog–Reall 2001; Shapiro anomaly-induced action) **and** the anomaly framework *requires the associated scalar to be massless in the early universe* → a massless-early scalar with a plateau **is** the inflaton, not the ~Planck-mass erebon. Masslessness-at-the-boundary is independently demanded by the CCC crossover (rest-mass suppression as Ω→∞), and the Weyl-R² split (Tang 2020) already places the conformal mode at the inflaton with DM separate. Three consistent pointers → **plateau favoured**.

**Honest residue:** plateau *shape* favoured, *amplitude* (R²-coeff ~5×10⁸ / ~10¹³ fields) still tuned; erebon reading not forbidden.

**Status:** wiring's last line moves `[Hypo] → [Hypo→soft/favoured]`, **not** closed. Propagated to `WIRING_bridge_2026-07-08.md` (§Selection argument), SSOT §5 item 1 + §7 ledger, and a `.tex` revision entry; PDF rebuilt (107 pp, 0 err).

---

## 2. Two-open-items summary + "has anyone closed them?" literature sweep

**Ask:** summarise both open items in plain language; search whether anyone has closed them.

**Plain statement**
- **Item 1 — "+3 spread" `[soft]`:** the old aeon's *residual energy* must GR-redshift below the *measured* vacuum floor Λ/M_Pl⁴≈10⁻¹²² within the N≈57 e-folds the CMB tilt fixes. Fast components (shear a⁻⁶, radiation a⁻⁴) reach it; slow curvature (a⁻²) undershoots. Open question (as pinned): does a *calm/low-Weyl* (curvature-heavy) L0 clump carry enough fast component? Distinct from the observable 10⁻⁵ contrast (easy).
- **Item 2 — wiring `[Hypo→soft/favoured]`:** the trigger/inflaton = the prior aeon's CCC conformal factor Ω, read as the α=1 plateau inflaton rather than Penrose's erebon (dark matter mass).

**Literature verdict (nobody has closed either):**
- **Item 1 generic** (does inflation dilute residual below the floor) = essentially *settled yes* for large-field/plateau + ≳60 e-folds — cosmic no-hair (Wald; Kitada–Maeda 1993; Jensen 1988), robustness to inhomogeneous ICs (Clough 2016; Corman 2022), quantum no-hair (Kaloper 2018). Caveats: fails without SEC (Barrow 1987); anisotropy can grow transiently (Maleknejad 2012). **The LMU-specific corner (calm clump's component budget) is not posed by anyone** → open but `[soft]`.
- **Item 2** = an **acknowledged field-wide open problem of CCC itself**: "fix Ω uniquely" has *competing* proposals that disagree (Newman 2014, Tod 2015, Nurowski 2021; tested in arXiv:2212.06914, 2023 — only one candidate survives). The Mar-2025 "Physics of CCC" (arXiv:2503.24263) does **not** touch it. LMU's plateau reading sits in the **Tod–Nurowski Starobinsky-expansion camp**, against Penrose's erebon. Nobody has closed it.

**Net:** both un-closed, but different in kind — item 1 mostly covered by generic results + one un-posed corner; item 2 genuinely open field-wide with LMU on the Tod–Nurowski side.

---

## 3. "Elastic snap-back" idea + the "do we live in a void?" question

**Ask (a):** what if the residual relaxes like an elastic snap-back — very curved early, stretches fast as the drive weakens, tail slow — connecting to item 2 (the plateau/"flat-bottomed bowl" is the pre-existing IC waiting for the flash)?

**Verdict (a):** the idea is *real and owned* — it maps to the **BKL/bounce-isotropization** picture (shear grows in contraction, dominates early, dilutes a⁻⁶ fast after the bounce; Agulló 2020). The effective redshift exponent IS time-varying (high early, tailing to k=2). **But it cuts both ways and does not close item 1:** "calm/low-Weyl" ⟹ curvature-dominated ⟹ *shear-poor* (curvature can dominate shear at a bounce for reasonable amplitudes) — the very calmness starves the fast component. And at N≈57 the outcome is IC-dependent (Pitrou–Pereira–Uzan 2008: "less robust for small N"). The item-2 link is genuinely literature-backed (Ling–Piubelli–Senovilla 2024: anisotropic ICs with Λ-domination at the bang generate inflation) → "plateau already there, waiting for the flash" is a real construction. Item 1 stays `[soft]` after this; it reframes, doesn't close.

**Ask (b):** are we (solar system / local group) really in a void vs other galaxy groups?

**Verdict (b):** real, current, **contested**. = the **KBC void** (~20% underdense to ~300 Mpc); Banik et al. 2025 test it against 20 yr of BAO (2501.17934) and direct distance tracers (2506.10518) as a **Hubble-tension** fix, but ΛCDM disfavours a void that deep (they invoke MOND — MNRAS 499, 2845). **Not related to the L0 clump:** the void is a *late-time, within-aeon* structure (z≲0.1) grown from the ordinary 10⁻⁵ contrast — downstream of the *easy* item, not the pre-aeon residual. Category-distinct; do not wire them. Bucket: watch / not LMU-specific / no contradiction.

---

## 4. Item-1 attempt — the "63 orders" is a bookkeeping artifact; item 1 reduces to the standard flatness problem  ⭐ NEW FINDING (pending decision)

**Ask:** actually try to solve item 1; show where it sticks.

**Done (script `code/residual_flatness_accounting.py`, reproducible):** the pinned script `residual_dilution_to_floor.py` compares `rho_curv` *after 57 e-folds of inflation* to *today's* floor and finds curvature short by ~61–63 orders. That comparison **stops the clock at inflation's end** but compares to a **present-day** floor. Curvature does not stop diluting at reheating — it keeps going a⁻² through the whole radiation+matter history (~66 more e-folds of expansion). Doing the **full standard flatness accounting** (dilute to *today*, compare to *today's* ρ_crit):

| N_total (onset→end of inflation) | Ω_k today | reading |
|---|---|---|
| 57 | ~10³·³ | over-curved |
| 60 | ~10⁰·⁷ | over-curved |
| 63 | ~10⁻¹·⁹ | subdominant |
| 66 | ~10⁻⁴·⁵ | flat ✓ |
| 69–81 | 10⁻⁷–10⁻¹⁸ | flat ✓✓ |

- **N_total,min ≈ 61 (Ω_k<1) to 63 (Ω_k<0.01, the observed bound)** — worst case (curvature = full inflaton energy at onset), instant high-scale reheating (T_reh≈3.3×10¹⁵ GeV, N_post≈66).
- **Item 1 IS the standard flatness problem**, and *curvature-heavy is the EASIEST case for it* (inflation is built to flatten curvature). The "calm clump can't reach the floor" worry was **backwards** — it's the flatness problem, solved by e-folds, not by needing shear.
- **N_CMB=57 (Planck tilt) is only the LAST 57 e-folds**; N_total can be larger (extra pre-pivot e-folds). Under **ACT DR6** the tilt gives N_CMB=69–81 which **already exceeds N_total,min** → flatness solved with room to spare, **no extra e-folds needed**. α-attractor's super-Planckian range gives N_total≫66 generically.

**Where it sticks (honest residue):**
1. Needs the flash to place the ω-inflaton high enough on the plateau for N_total≳63 — the flash→plateau **initial condition = MERGES INTO item 2 (the wiring)**, not a separate open item.
2. Finer (Pitrou 2008): the largest-scale (low-ℓ) modes exiting during any early shear phase can carry IC-dependent imprints — a low-ℓ / 10⁻⁵-*contrast* question (already handled), separate from the energy channel.
3. Assumes no component slower than a⁻² (e.g. domain-wall a⁻¹). LMU posits none in the residual; a wall network would reopen it, but nothing makes them.

**Implication (NOT yet applied — needs user's OK):** this **revises the pinned "+3 spread" definition** in `CLAUDE.md` and the SSOT (which say "needs k≈5 within 57 e-folds"). Correct accounting: real k=2 (curvature) + N_total≳63 total e-folds + full post-inflation dilution solves it; the residue folds into item 2. If accepted, the **LMU-specific open items drop from 2 → effectively 1** (the wiring), with item 1 becoming "standard flatness, solved by enough total e-folds." **The pin exists to stop flip-flopping, so this is recorded here as a computed finding pending an explicit decision to update the pin/SSOT/.tex — not applied unilaterally.**

**Convention note:** reduced Planck units give the floor ρ_crit,today/M_Pl⁴≈10⁻¹²⁰ (the pin's "10⁻¹²²" uses the non-reduced M_Pl); the argument is identical either way, shifts N_min by ≤2.

---

## Provenance / scripts touched this block
- `code/residual_dilution_to_floor.py` — the pinned single-rate script (unchanged; reproduces the "63 orders short").
- `code/residual_flatness_accounting.py` — **new**; the full flatness accounting above.
- Commits after 3.27: `9ace7cd` (wiring bridge), `6461516` (wiring selection argument). Items 2–4 of this log are discussion/analysis, not yet committed as doc changes (except this log + the new script).
