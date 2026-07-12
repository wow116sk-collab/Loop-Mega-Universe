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

- **N_total,min ≈ 60–85 e-folds** (reheating-dependent: ~63 at instant high-scale reheating T_reh≈3.3×10¹⁵ GeV, rising to ~85 at MeV-scale reheating), worst case (curvature = full inflaton energy at onset). Range from `code/residual_flatness_stress.py`. **NOT a single tidy 63** — all values within an α-attractor's super-Planckian reach.
- **Item 1 IS the standard flatness problem.** Framed by the curvature *fraction* Ω_k=ρ_curv/ρ_crit (the thing that matters): inflation drives Ω_k **down** ∝a⁻² (to ~10⁻⁵⁵ at inflation's end); post-inflation Ω_k **grows back** ∝a⁺² (rad)/a⁺¹ (matter) by ~53 orders (ρ_crit falls faster than a⁻²); inflation must **pre-pay** so that after the re-growth Ω_k,today<0.01. Curvature a⁻² is the **slowest** of the diluting components (radiation a⁻⁴, shear a⁻⁶ are faster) → the **hardest of the three**, needing the most e-folds — **the pin was RIGHT that curvature is the slow component; its ONLY error was the epoch** (it compared end-of-inflation *energy* to *today's* floor). Curvature is the canonical case inflation is built to solve.
- **N_CMB=57 (Planck tilt) is only the LAST 57 e-folds**; N_total can be larger (extra pre-pivot e-folds). Under **ACT DR6** the tilt gives N_CMB=69–81 which **already exceeds N_total,min** → flatness solved with room to spare. α-attractor's super-Planckian range gives N_total≫66 generically.

**Where it sticks (honest residue):**
1. Needs the flash to place the ω-inflaton high enough on the plateau for N_total in [60,85] — the flash→plateau **initial condition**, in the **same family as item 2 (the wiring)**. The hard part is **relocated, not closed**.
2. **The reduction swaps the requirement** from "residual *energy* < floor" to "Ω_k<0.01 flatness" — valid **only if** the L0 residual is well-described as smooth homogeneous spatial curvature (a⁻², w=−1/3). The genuine open question the pin gestured at — *what IS the residual, and does its true equation of state dilute at least as fast as a⁻²?* — is **relabeled into the item-2 IC family, not answered.**
3. Finer (Pitrou 2008): the largest-scale (low-ℓ) modes exiting during any early shear phase can carry IC-dependent imprints — a low-ℓ / 10⁻⁵-*contrast* question (already handled), separate from the energy channel.
4. Assumes no component slower than a⁻² (walls a⁻¹ would need N_total~192, a stretch). LMU posits none in the residual; a wall network would reopen it, but nothing makes them.

**Verification (2026-07-08): SURVIVES-WITH-CAVEATS.** Independent adversarial verifier (batch, whole finding) reran both scripts + hand-derived via the (aH)² route → **all numbers reproduce, no numerical error; the accounting IS the textbook flatness formula.** Two over-claims caught and **corrected before propagation**: *(i)* "curvature-heavy = easiest / worry backwards" was wrong — curvature is the *slowest/hardest* of the three components (fixed above); *(ii)* the "post-inflation dilution helps" prose inverted the causality — post-inflation *erodes* flatness (Ω_k grows 53 orders), inflation pre-pays (fixed in the script prose + above). Net: a **legitimate reduction** (real epoch/bookkeeping error in the pin corrected), **not a closure** — item 1's flatness bookkeeping is standard-and-solved; its residue is an EoS/IC assumption living in the item-2 family.

**Applied (ก, 2026-07-08):** after the verification above, propagated to the SSOT (`LMU_SYNTHESIS` §5/§7/§8), the `CLAUDE.md` pin, and a `.tex` revision entry. Item 1 restated: **"+3 spread" = standard flatness, solved by N_total≈60–85 total e-folds; residue = the residual's equation of state + flash e-fold delivery, in the item-2 IC family.** The LMU-specific open items go from "two independent" to **"item 1's flatness content solved; its residue relocated into the item-2 (flash→plateau IC) family"** — stated as a reduction, not "now only one open item."

**Convention note:** reduced Planck units give the floor ρ_crit,today/M_Pl⁴≈10⁻¹²⁰ (the pin's "10⁻¹²²" uses the non-reduced M_Pl); the argument is identical either way, shifts N_min by ≤2.

---

## Provenance / scripts touched this block
- `code/residual_dilution_to_floor.py` — the OLD pinned single-rate script (kept; reproduces the "63 orders short" that the epoch-mismatch produced).
- `code/residual_flatness_accounting.py` — **new**; the full flatness accounting (dilute to today, compare to today's ρ_crit). Prose corrected post-verification (Ω_k framing, curvature = slowest/hardest).
- `code/residual_flatness_stress.py` — **new**; the adversarial stress-test (reheating sweep → N_min range 60–85, worst-case curvature, slower components, born-hot, shear re-growth).
- Commits after 3.27: `9ace7cd` (wiring bridge), `6461516` (wiring selection argument), `24e0fbc` (this log + accounting script), `2fbf259` (stress script), then the item-1 propagation (ก) commit.

---

## 5) Watch item (2026-07-11): tabletop entropic-time / Wheeler–DeWitt experiment (Barontini, Birmingham)

**What:** G. Barontini (U. Birmingham), *"Testing the problem of time with cold atoms"* (earlier title: *Emergence of Entropic Time in a Tabletop Wheeler-DeWitt Universe*), arXiv:2509.07745 (v1 2025-09-09; revised 2026-03/06), **published Phys. Rev. Research, June 2026** (DOI 10.1103/1h9j-df4k). BEC of ~24,000 ⁸⁷Rb atoms in a conservative trap, thin optical barrier partitioning an observed ("bright") and unobserved ("dark") sector; negligible dissipation on the experimental timescale.

**The move:** start from the timeless constraint Ĥ|Ψ⟩=0 (Wheeler–DeWitt), split Ĥ = Ĥ_bright + Ĥ_dark + Ĥ_coupling, then define an **entropic time** from an experimentally measured coarse-grained (Shannon, macropixel) entropy, τ(λ) ∝ ∫ (dS/dφ)|dφ| with φ = a centre-of-mass "clock field" — time advances only while entropy flows between sectors. Deriving in this internal parameter gives an **effective Schrödinger equation** iħ∂_τψ = Φ(τ)ψ + Λ(τ)Ĥ_geom ψ, whose entropy-dependent factor Λ acts as an "energy pump" into the radial (scale-factor-analogue) mode. Numerical solutions of that equation reproduce the measured condensate-width ("analogue universe size") evolution across repeated expansion–recollapse cycles, ~5% statistical uncertainty per point; entropic time robustly *orders* events across cycles.

**Why we care (mapping to LMU rows, [conceptual-support] ONLY, not evidence):**
- Same family as the ledger's **"time reframe (arrow inherited)"** row and the timeless Coleman bridge (V3.24): time = relational/entropic, arrow = entropy flow, **τ stalls when entropy stops flowing** — the lab realisation of the "fast/slow/stall" reading of the monotonic-entropy axiom (cf. `code/entropy_monotonic_vs_tinyDS.py`, the dS-tail asymptotic stall).
- Page–Wootters conditioning made quantitative in a *matter-wave* system (photonic tests existed, e.g. Moreva 2013); the bright/dark **sector split with exchange through a barrier** is structurally the observed-aeon/substrate bookkeeping in miniature (an analogy, not a mechanism).
- **Status discipline:** an analogue/tabletop internal-consistency test of the *mechanism class*. It moves NO LMU falsifier and proves nothing about cosmological time; do not cite it as support for the cycle. It belongs on the watch-line for the emergent-time literature maturing (a second group reproducing with a different clock field / larger systems would strengthen the class).

**Press-layer corrections (for future readers who arrive via news):** "proved time emerges" → the paper *tests a construction*; "first ever" → first cold-atom/entropic variant, not first Page–Wootters test; "completely sealed" → negligible dissipation on the run timescale; "London" dateline → it's Birmingham. Paper's own stated limits: M(φ)=αφ assumption, τ undefined where entropy does not flow, results concentrated at V≃0 (pump-dominant regime), minisuperspace analogue only.

---

## 6) The τ_aeon layer (2026-07-11): entropic aeon-clock — ownership swept, seam computed, bridge drafted

One-day arc, all committed: (i) **ownership sweep** — 26-agent + 8-agent gap-fill (34 total, twice batch-verified, ~90 papers): defining an aeon-internal entropic time τ ∝ ∫dS_cg inside a cyclic/BH-generated cosmology (dS-tail crawl, deterministic flash re-arm) is **unoccupied among cosmological models**; nearest neighbors (must-cite): Barontini PRR 8 L022047 (2026, lab precedent — his clock crosses analogue crunch/bang cycles), Weberszpil–Sotolongo-Costa IJTP 65:15 (2026, single-history cosmological τ(ΔS) + SSRN companion), Martyushev & Shaiapin Entropy 18, 233 (2016), Bojowald–Tavakol 0803.4484. CCC school = clean null (Tod: they *delete* the tail's clock; LMU slows it). Shape dynamics *disowns* entropy (complexity arrow, flips at Janus). → `review/ENTROPIC_TIME_ownership_2026-07-11.md`. (ii) **seam trends** — energy = sawtooth, τ = staircase; pre-bang closed form τ(t)=τ_max[1−(1−t/t_ev)^{2/3}], τ_max=⅓S_BH,0; flash→hot-bang = one thick tick; Clausius: cold transfers ~10⁴⁷× louder per joule → `code/entropic_time_vs_energy_seam.py`. (iii) **bridge note** [Hypo, wiring-only, staged for V3.29] — definition (coarse-grained ledger pinned against the Page-curve trap), the w=−1 ⟺ undiluting ⟺ timeless identity (compresses cold→hot), why F4/F5 are the only two observational doors (Landauer), 7 caveats incl. ledger fork (matter vs +horizon, ~18 orders) and near-seam clock reliability, 3 contrast lines → `review/ENTROPIC_TIME_bridge_2026-07-11.md`. Moves no falsifier; independent of (does not close) the ω=inflaton knot.
