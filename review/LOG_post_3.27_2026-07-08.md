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

---

## 7) Watch items (2026-07-12): five external developments touching the watch-lines

Post-v3.29-merge news sweep (WebSearch; Consensus quota still 0 until 2026-08-01). None moves a falsifier today; two pressure directions are building. All [watch], statuses dated.

1. **CCC school upgrade — F5 pressure incoming.** Meissner & Penrose, *"The Physics of Conformal Cyclic Cosmology"* (arXiv:2503.24263; research paper, not a review — verified in the 2026-07-11 gap-fill): claims a **mass-energy conservation law across the crossover** (spinor/twistor methods), places the crossover in a **gravitational-wave epoch**, and **renews the Hawking-spot claim** (spot temperatures said to agree with observed galactic-cluster masses). The transmit camp is building a second-generation argument after the 2023–24 nulls → expect a new observational round on Hawking points. **F5 will be re-tested with higher stakes** — favourable position: our threshold is pre-registered and immutable (CN3B4).
2. **CCC-family output continues:** a fresh aeon/conformal-transformation paper, May 2026 (arXiv:2605.15374), still working the mass-vanishing crossover condition — consistent with the ownership-sweep verdict that the seam space remains open field-wide.
3. **Crunch/bounce successor family active — F6-adjacent:** *"Crunching, Bouncing, and Cyclical Cosmologies from Dark Sector Interactions"* (arXiv:2603.02332, Mar 2026) — the family that would inherit if V_min flips negative has current tooling. Records the F6 stake as live, not hypothetical.
4. **DESI — F1 tension rising:** evolving-DE preference now quoted at **2.8–4.2σ depending on data combination** (3-yr data, ~15M galaxies/quasars; below 5σ), with explicit SN-compilation dependence (DESI DR2 BAO × Pantheon+/DES-Dovekie/Union3: arXiv:2508.10514). Decisive question for F1 unchanged: genuine phantom **crossing** (kills) vs thawing without crossing (passes). Next waypoint: DR3 BAO ~2027, then Y5.
5. **F4 instrument queue firming:** SPT-3G D1 standalone B-mode bound published (arXiv:2505.02827; weak alone, delensing machinery building) + ACT DR6 delensing out; tightest combined bound still r < 0.032–0.034. **LiteBIRD launch target ~2029** (δr < 0.001; PTEP design 2101.12449) — earlier than the "early 2030s" carried in chat; the decisive window for the 0.0018–0.009 band may open ~2032–33. CMB-S4 unchanged (2030s).

**Net:** F5 heading into a live contest (erase vs transmit measured again), F1 heating toward its 2027–2030 decision, F4 hardware on schedule. Nothing to change in the docs; falsifier table statuses in `OPEN_PROBLEMS.md` §5 remain accurate as dated (2026-07).

---

## 8) Watch items (2026-07-12, evening): the conformal-reset extension cluster — incl. possible adjacent prior art for the gauge reading

Follow-up to item 7. Someone IS building on the conformal reset — a small 2025–26 cluster, three grades. Deep-read attempted on the key item; PhilArchive blocks direct fetch (403), so it was read through the search layer only — **[unverified-fulltext]: before CITING it in any doc, pull the PDF manually and pin the author/date.**

1. **"A Conceptual Analysis of Cyclic Cosmology" (PhilArchive ID SVOOTC, ~Jan 2026, author unpinned)** — deflationary critique of CCC: *conformal smoothness ≠ physical continuity*; the conformal transition "relabels coordinates but does not generate new physical content"; CCC models "cycles of geometric description rather than cycles of physical reality." **Assessment vs our framings:** (a) this is **adjacent prior art for the GAUGE reading** of the bare conformal map — their "relabeling, not physics" is the philosophical twin of our Rounds 3–4 result (the conformal-diffeo zero-mode = gauge copies) and it predates our rounds by ~6 months → **cite it when the gauge reading or the seam bottleneck is folded into doc text**; (b) it does NOT cover the erase-vs-transmit observable dial (no Hawking-point/CMB discussion surfaced), the gauge-vs-free-York-datum split, or any entropy clock — **the τ_aeon slot and the F5-axis framing remain ours**; (c) it arguably overshoots: collapsing the ENTIRE seam to relabeling ignores that the York datum φ₂ is legitimately physical freedom; (d) **LMU-relevant twist:** the critique bites *bare* CCC (reset by rescaling alone) much harder than LMU — LMU's reset hangs on a physical transaction (the survivor's terminal flash: real energy transfer, entropy surge, the loudest τ-tick), with the conformal map as the *description*, not the *agent*. The deflationary argument is, read carefully, a reason FOR the flash-anchored design. [reading: Hypo]
2. **"CCC Under the Light of TNA" (Medium, May 2026, Cbresciano)** — blog-tier, personal axiomatic framework, not citable. Conclusion ("the conformal transition functions as a **non-derivable reset operator**") is structurally convergent with Rounds 1–4 (reset not derivable from principle) — independent route, same landing zone, no mechanism offered.
3. **Bonus strata surfaced by the same sweep:** Le Bihan, *"The Great Loop: From CCC to Aeon Monism"* (PhilArchive — professional philosophy-of-physics, same deflationary family: aeons as one structure); *"Conformal Conscious Cyclic Cosmology (C4)"* (PhilArchive — fringe consciousness×CCC crossover, the exact page-fodder hybrid predicted in conversation); a "Cyclic–Emergent Cosmology" synthesis. A philosophical cottage industry is forming around the reset — none of it touches the entropic-clock slot.

**Net:** ownership verdicts unchanged; one new credit obligation conditionally opened (item 1, IF its distinction covers the bottleneck ground — resolve by manual PDF pull before any doc use); the convergence of independent voices on "reset not derivable" corroborates the *shape* of the Rounds 1–4 verdict.

---

## 9) Breit–Wheeler crossfire in L0 (2026-07-16): "what if the aeon sends the STAR condition into the substrate?" — computed, negative in bulk, and the negative is load-bearing

Trigger: the STAR/RHIC news (light→matter via near-missing Au ions) + the question "if L0 held that condition — photons crossing rapidly in all directions — would matter get created?" Team: declared ง่าย/10, used 6 (head + 2 advisers + 3 lit + 1 batch verifier, 20/20 CONFIRMED). Script: `code/bw_crossfire_L0.py` (commit 7b80547).

**Verdict — four independent gates kill it in bulk L0:**
- **Gate 0 (premise):** STAR's photons are Weizsäcker–Williams quanta *carried by boosted charges* (Z=79, 99.995% c). L0 has no free charges (charged survivors Schwinger-discharge — Gibbons, CMP 44, 245 (1975)) and no boosts (peculiar velocities ∝1/a). "Crossing rapidly in all directions" is kinematically unavailable as a steady state, before counting photons.
- **Gate 1 (energy):** pair threshold 0.511 MeV/photon (head-on; isotropic average costs only √2). Survivor Hawking photons sit 29 orders below; GH bath 39 orders; hard-on-bath (TeV-on-EBL geometry) needs E ≥ (m_ec²)²/kT_dS ≈ 10¹⁷ E_Pl — trans-Planckian. GH bath is a detector response, not an objective gas (Gibbons–Hawking, PRD 15, 2738) — the naive-gas estimate only *overstates* the rate; the honest exponent is exp(−2πm_ec²/ħH) = exp(−2.7×10³⁹).
- **Gate 2 (supply):** a 10¹² M_☉ survivor emits ~1 photon per ~10³ yr (⟨E⟩≈5kT_H, Page, PRD 13, 198); sustainable density R/(3HV_H) ≈ 2×10⁻⁷³ /m³. Neutrino channel Boltzmann-dead (m_ν/kT_H ~ 10²²) → photon+graviton fuse. Different survivors: exponentially alone per horizon — no inter-source beams ever.
- **Gate 3 (erasure):** even a Planck-energy photon redshifts below threshold in ln(E_Pl/m_e c²) ≈ 52 e-folds ≈ 9×10¹¹ yr = first ~10⁻⁹¹ of the fuse; and dS free-streaming *collimates* — (1−cosθ)→0 → s→0. The amniotic property of L0 IS the erasure of this condition.

**At the endpoint (the only place it fires):** window opens at M ~ 2×10¹³–1.2×10¹⁴ kg (kT_H vs spectral-peak crossing of m_e c²), tail ~10¹⁶–10¹⁸ yr ≈ 10⁻⁸⁷–10⁻⁸⁵ of the fuse; M_cut (match-strike) sits inside it. **Channel ranking correction (adviser catch):** the dominant matter-minting channel there is *direct* Hawking emission of e⁺e⁻ (no collision needed); BW conversion among the hole's own photons has τ_γγ ≈ 2×10⁻⁶ at kT=m_e, plateauing at ~10⁻⁵–10⁻⁴ to Planck (exact σ_BW: peak 1.70×10⁻²⁹ m² = 0.256σ_T at √s=1.40× threshold, falling as (m²/s)ln s) — **never τ=1**; direct beats BW by ≥5×10⁴. A draft claim "τ=1 at ~0.34 GeV → QCD-band onset" was a fixed-cross-section artifact — caught by adviser A, deleted. Photosphere postscript: the "does the outflow self-thermalize" contest is **resolved against** — Heckler PRD 55, 480 + PRL 78, 3430 (1997; mechanism = bremsstrahlung/e-γ pair production, *not* γγ) and Daghigh–Kapusta PRD 65, 064028 (2002) vs MacGibbon–Carr–Page PRD 78, 064043 (2008; causality + formation length ~E/m_e²); consensus per Auffinger, PPNP 131, 104040 (2023): "definitely settled", MacGibbon–Webber (PRD 41, 3052) fragmentation standard. Do not present it as live.

**Why the negative is load-bearing (the punchline):** crossfire radiation dilutes a⁻⁴ and always loses to dS; the only dilution-proof store is a w=−1 field (ρ∝a⁰ — the τ_aeon identity), converted everywhere at once at reheating. Even the flash's own direct pairs sit upstream of inflation → e^(−4N) ≈ 10⁻¹⁰⁹ → absent from the new census (erase-type seam, consistent with the relic-discrimination note). The mechanism itself is standard and *measured operating inside the current aeon* (TeV/EBL horizon: Nikishov 1961/62; Gould–Schréder PRL 16, 252 (1966) + PR 155, 1404 & 1408 (1967); Fermi-LAT, Science 338, 1190 (2012)) and runs at full blast in the new aeon's post-reheating plasma — it fails only in the dilute substrate, not in principle.

**Ownership/void (lit sweep, refs pinned in the script header):** process = Breit & Wheeler, PR 46, 1087 (1934) — whose own closing remark ("hopeless with lab beams; use the fields of fast charged nuclei passing one another") is STAR's recipe *and* Gate 0's reason. Lab realization = STAR, PRL 127, 052302 (2021), arXiv:1910.12400 (6085 pairs; quasi-real caveat: Brandenburg–Seger–Xu–Zha, RPP 2023, arXiv:2208.14943). Cosmic-crossfire formalism = Nikishov/Gould–Schréder. Deep-future census = Adams & Laughlin, RMP 69, 337 (1997) (Dark Era: annihilation, not creation). dS creation channels = Mottola PRD 31, 754 (1985); Kobayashi–Afshordi JHEP 10 (2014) 166; Fröb et al. JCAP 04 (2014) 009 — all steady-state, dilution-balanced. Cyclic prior art mints cycle-start matter from a FIELD every time: Hoyle MNRAS 108, 372 (1948) C-field; Hoyle–Narlikar PRSA 273, 1 (1963); QSSC (JAA 28, 67 (2007)); CCC = light crosses, matter via conformal rescaling, never BW; Tolman 1934 adjacent. **Void check (7 phrasings): nobody has proposed BW crossfire as a cycle's matter-genesis mechanism — and the niche is empty because the physics forbids it, not because it was missed.** No falsifier moved; nothing enters the .tex from this item without a fresh citation pass on the two abstract-level refs flagged by the sweep (arXiv:2201.11021, 2311.13376).


---

## 10) The baryon-asymmetry arc (2026-07-16/17): from "gravity made the excess" to the fertility condition — graded claim-by-claim, three landings on owned mechanisms

Conversation arc following item 9 (BW crossfire). All mechanisms = owners' ([borrowed-standard]); no falsifier moved; one deferred doc-candidate at the end. Solo turns (conversational grading), no team.

**(a) "Universe builds itself from energy waves" — YES with one lock.** Matter content + its distribution map both come from the coherent ω-field wave: field oscillation at plateau bottom → particle pairs (preheating: Kofman–Linde–Starobinsky 1994/97; perturbative: Dolgov–Linde 1982, Abbott–Farhi–Wise 1982); quantum ripples on the same wave → the 10⁻⁵ CMB contrast (n_s = 0.9649 = the ripples' measured spectrum). The lock (from item 9): the wave must be a w=−1 *field* wave (ρ∝a⁰) — radiation waves (a⁻⁴) can never fill a universe. Deepest layer is textbook QFT anyway: proton mass ~99% field energy (lattice QCD), matter *is* organized field excitation.

**(b) F4 epistemology check — "couldn't a skeptic call measured primordial GW just waves from far away?"** No — four independent blocks: (i) CMB B-modes respond to GW at ~10⁻¹⁷ Hz, wavelength ~ horizon-size — no sub-universe-sized source exists (astrophysical sources emit ≥ nHz, 8+ orders away); (ii) the recombination bump (ℓ~80) is imprinted at z≈1100 — waves passing *now* cannot paint it; (iii) the signal is an isotropic stochastic scale-invariant background, not a directional one; (iv) the imprinting modes were super-horizon — no causal post-bang source (same logic that killed causal-seed/cosmic-string anisotropy via TE anticorrelation). Real impostors and their handling: galactic dust (the BICEP2 2014 retraction — multi-frequency separation), lensing E→B (delensing), defects/magnetic/chiral (n_t = −r/8 consistency, Gaussianity, TB/EB parity). Contrast: at nHz (PTA band) the objection IS live (SMBH binaries vs cosmological — why PTA sits at anchor-grade, not falsifier-grade). The objection that survives is one level up and already conceded in OPEN_PROBLEMS §4: in-band r is α-attractor-generic — F4 is asymmetric (outside band = kills; inside = passes + favours wiring, not proof of a predecessor aeon).

**(c) User claim: "excess matter was there from the start; gravity forces merging" — REFUTED, kernel saved.** Blocks: gravity is matter/antimatter-blind (ALPHA-g 2023: antihydrogen falls down, ~1g); gravity+fusion conserve B — a symmetric start + annihilation leaves η~10⁻¹⁸ (10⁹× short) or antimatter domains with annihilation edges (excluded: Cohen–De Rújula–Glashow 1998); and internally, inherited asymmetry is forbidden by LMU's own erase-seam (e^(−3N) ~ 10⁻⁸²) — **every aeon must re-mint its asymmetry after reheating**. Kernel: "it can't sit still" = Sakharov condition 3 (out-of-equilibrium, supplied free by expansion); gravity-as-engine exists as gravitational baryogenesis (Davoudiasl–Kitano–Kribs–Murayama–Steinhardt, PRL 93, 201301 (2004), Ṙ-coupling).

**(d) User claim: four-column zero-sum ledger (mat + anti + mass + entropy-carried = 0).** The strategy "visible ledger fails because a compensating column is hidden; true total = 0" is owned three ways: (1) **leptogenesis** — B alone is not conserved in the SM (quantum anomaly: 't Hooft 1976; sphalerons: Kuzmin–Rubakov–Shaposhnikov 1985); real ledger is B−L; compensating entry in the neutrino column (Fukugita–Yanagida 1986); (2) **asymmetric DM / hylogenesis** — total B = 0 exactly, missing antibaryons sequestered dark (Kaplan–Luty–Zurek PRD 79, 115016 (2009); Davoudiasl–Morrissey–Sigurdson–Tulin PRL 105, 211304 (2010)); explains Ω_DM ≈ 5Ω_b at ~5 GeV; (3) **horizon column** — gravity does not protect B (no-hair; evaporation shreds it into B=0 Hawking quanta); PBH-evaporation baryogenesis (Zeldovich 1976; Toussaint–Treiman–Wilczek–Zee / Turner 1979). Two blocks on the version as stated: **entropy cannot hold charge** (grows, unsigned, non-conserved — the balancer must be actual −B/−(B−L) carriers; entropy is the truck, not the account holder); "persistence of mass creates entropy" lacked a mechanism → upgraded in (e). Decisive measurements this decade: ν δ_CP (DUNE/Hyper-K), 0νββ, ~5 GeV direct detection.

**(e) User refinement: "a static mass doesn't produce entropy — it pins its position+time, written into the universe" — UPGRADED to [owned], three stacked layers.** (i) GR: Gauss/ADM constraint (mass cannot hide from its own field) + permanent imprints via gravitational memory (Zel'dovich–Polnarev 1974; Christodoulou 1991; memory↔BMS↔soft-theorem triangle, Strominger program; Hawking–Perry–Strominger soft hair 2016). (ii) Quantum Darwinism / einselection (Zurek): position-classicality = redundant environmental records. (iii) Sharpest: **Danielson–Satishchandran–Wald 2022–23** (PRD 108, 025007) — any Killing horizon, *including the cosmological horizon of a Λ-universe*, continuously decoheres superposed masses via soft gravitons ("the horizon is always watching"); holding a superposition pays a calculable, growing record cost; a classical mass = record already written (one-time payment). **Partial retraction logged:** the (d)-verdict "no mechanism" was half-wrong — for superpositions the mechanism exists and is theorem-grade. **Charge gate unchanged:** all three record layers carry B=0 — an inscription column stores information, never charge; the four-column ledger still cannot close on it. LMU tie: DSW's dS case is L0 verbatim — the substrate horizon writes every survivor's position for 10¹⁰³ yr; those records are horizon-side and die at the seam with all other data (the "written into the universe" ledger is aeon-local; consistent with the user's own erase-seam statement).

**(f) Side question: can an electron decay to light?** Solo: doubly forbidden (lightest charged particle → charge conservation; fermion → bosons-only → spin). Measured: Borexino 2015, τ > 6.6×10²⁸ yr. In pairs: yes — annihilation = BW reversed (PET scans). Deep-future disposal (Adams–Laughlin): positronium spiral-in; plus the proton-decay route if GUTs are right (Super-K τ_p > 2.4×10³⁴ yr) — net-zero electric charge of the universe guarantees every electron eventually meets a canceller. This is the mechanism-level reason the substrate ends radiation+BH only.

**(g) User claim: "it didn't start from 0 — the roll-down sweeps a slight positive-charge excess" — LANDED on the roll-generated-asymmetry families.** (1) **Affleck–Dine 1985** (Nucl. Phys. B 249, 361): a B-carrying condensate high on its potential twists (CP phase) as it rolls — the twist *is* stored baryon number, dumped into the plasma at decay; (2) **spontaneous baryogenesis** (Cohen–Kaplan 1987): the rolling itself creates a transient chemical potential — matter cheaper than antimatter *while* rolling. Both operate at/after the end of inflation → pass the re-mint gate. Two corrections applied: the swept charge must be **baryon number, not electric charge** (net electric charge = 0 exactly; Gauss would announce any excess); and "didn't start from 0" is true for **energy** (inherited through the seam) but false for **B** — the excess is *manufactured by the roll* (post-eraser), not *carried in the lump* (pre-eraser → would be deleted). Would-be new wiring if ever imported: "ω or a companion field couples to the baryon current" = [Hypo], NOT added to any doc.

**(h) Synthesis (user's, confirmed with one inversion): the asymmetry is a FERTILITY condition, not an ignition condition.** The roll needs no charge (a B=0 aeon inflates and reheats normally) — but it is *sterile*: annihilation to ~10⁻¹⁸, no gas → no stars → no SMBHs → **no survivor → no next match**. The chain dies one generation later, not this one. Structural picture now symmetric, per the user's framing ("even dying has conditions"): **death-side conditions** (mortality window M < M_eq ≈ 2.8×10²² M_☉ — §2) ↔ **birth-side conditions** (flatness N_total ≥ 60–85; baryon fertility). The cycle's continuation is a condition checklist at both ends. Honesty note: the fertility condition is generic to any cyclic cosmology (not LMU-unique); LMU borrows a standard baryogenesis mechanism per R7 like everyone else.

**Deferred doc-candidate (do not apply until instructed):** a "fertility" row ("does the new aeon mint a baryon asymmetry?" — settled by borrowed baryogenesis + the decade's ν/DM measurements) could join the seam-IC family table in OPEN_PROBLEMS §2 alongside flatness delivery.


---

## 11) Seam-derivation ownership sweep (2026-07-18/19): "has anyone done item 3?" — void STANDS after adversarial pass; §3 upgraded from "absent" to "swept, with field-internal admissions"

Trigger: user challenge "seam calc มีคนทำแล้วนี่". First disambiguated three look-alikes (our pipeline = assembly with φ₀ as input; Tod's CCC equations = matching under ansatz; item 3 proper = INPUT (M_survivor, substrate) → OUTPUT (A_s, spectrum shape, N_total/φ₀) with no dial fit to data), then swept. Team: declared ปานกลาง/20, used 10 (head + 2 advisers + 6 lit axes + 1 adversarial batch verifier). Coverage: ~26 sweep phrasings + 9 fresh verifier phrasings + 2 targeted author audits; all 6 load-bearing claims verified at source (6/6 CONFIRMED).

**Rubric (adviser-refined):** A = input is a causal predecessor state, tested by traceability d(output)/d(predecessor) ≠ 0, not narrative framing; B = outputs the amplitude A_s (a derived distribution over (A_s, N) also passes; retro-fit direction A_s→scale fails); C = dial ledger — every choice classified fit-to-data / convention / forced-by-predecessor; D = seam *mediated* by the evaporation radiation, not merely temporally adjacent; E-tag "asserted-not-derived" when no equation exists to cite.

**VERDICT: nobody closes item 3. No paper passes two rubric letters.** Near-misses, each ≤ 1 letter:
- **Oshita–Yokoyama** (1601.03929; PLB 785, 197 (2018)) — only genuinely flash-*mediated* mechanism found (terminal-evaporation heating nucleates a false-vacuum bubble → wormhole → daughter inflates); outputs a nucleation scenario, zero ICs; tunnelling (the road LMU dropped).
- **Sueto–Yoshimoto–Cano** (2604.04601, 2026) — only paper where a BH scale quantitatively fixes an e-fold count, N ~ f(r_g/√α); brane-in-bulk construction, no A_s, no flash, higher-curvature tower of dials.
- **Turok–Boyle** (2302.00344) — the field's loudest "no free parameters" amplitude claim (A_s + tilt from SM couplings; verified verbatim); input is a CPT/analyticity boundary condition at the bang, not a predecessor → A-fail. *Sets the bar item 3 must beat; proves a zero-fit-parameter A_s computation is at least formulable.*
- **Meissner–Penrose** (2503.24263) — predecessor data genuinely crosses (cluster masses → Hawking-point temperatures) but outputs a conservation law + localized anomalies, no A_s/spectrum/N → B-fail.
- **Rovelli–Vidotto** (1805.03224) — predecessor BH remnants cross the bounce as dark-matter *content*, not as ICs.
- **Gaztañaga et al.** (2505.23877; PRD 111, 103537) — the June-2025 "universe born in a black hole" press wave: what is derived is a bounce radius; IC claims are asserted-not-derived (E-fail). Press false positive, as pre-flagged.
- **Bastero-Gil–Berera–Brandenberger et al.** (1612.04726; verifier find) — closest existing φ₀-derivation: plateau-field localization from a *preceding thermal era*; generic era (not a BH/aeon state), coupling dials, no A_s.

**School-by-school failure mode (one line each):** CCC — Tod (1309.7248): matching under reciprocity with residual conformal freedom (*the same φ₂-type freedom our wiring rounds isolated*), zero occurrences of "perturbation"; CCC's own literature admits the post-bang spectrum calculation "hasn't been done". Bounce family — through-bounce transfer machinery exists but amplitude is normalized to observation. LQC — deterministic bounce evolution, but bounce-vacuum choice is a dial and A_s is fit. Wavefunction programs — the ansatz swings the answer (no-boundary → minimal N, 0803.1663; tunnelling → maximal N), FLT (1703.02076/1705.00192/1708.05104) prove contour-dependence with unsuppressed perturbations. Holography — McFadden–Skenderis (0907.5542) genuinely outputs A_s from the dual, but the dual's parameters are fit to Planck (1607.04878/1703.05385). Correction pinned during sweep: arXiv 2511.11808 ("Inflation without an Inflaton II") is the Matarrese/Padova group, NOT Boyle–Turok, and its verified normalization sentence uses observed A_s as *input* to fix H_inf.

**The real yield — two structural upgrades for §3:**
1. **Absolute "zero dials" is unattainable in principle for any framework** — hypersurface choice + York datum, vacuum prescription, and (path-integral) contour are choices that move A_s. Honest formulation of item 3 = a **dial ledger**: closure means every entry is forced-by-predecessor-dynamics or a declared axiom, none fit to data. This re-grades the wiring rounds' "φ₂ legitimately free" verdict as a *field-wide* structural feature, not an LMU-specific weakness.
2. **The best output nature may permit is a distribution, not a point:** no-hair ⇒ the flash plausibly forgets everything but total energy ⇒ the target is P(A_s, N) via stochastic first-passage on the plateau (Vennin–Starobinsky machinery) seeded by the flash. This is the concrete attack route for anyone taking §3.

Fresh no-go momentum: Easson 2606.25023 (June 2026) — obstructions to minimal regular-BH cosmologies (Darmois-matching mismatch; flat/open daughters geodesically incomplete): the newest literature moves toward no-gos, not closures.

**Net:** OPEN_PROBLEMS §3 stands unchanged in content, upgraded in evidence: from "nobody has it" to "six schools swept + adversarial pass + the CCC school's own admission." Candidate doc-note (deferred until instructed): restate §3 in dial-ledger + distribution form per the two upgrades. No falsifier moved. (The base-12 representation exercise from the same sitting is intentionally NOT logged — numerology-grade, zero physical content.)


---

## 12) PEER-review sweep (2026-07-20): watch-lines re-swept with journal-status flags + first external-engagement audit — zero engagement, two stale-log corrections, no falsifier moved

Team: declared ง่าย/10, used 9 (head + 2 advisers + 6 axes + 1 adversarial batch verifier). Window 2026-07-13→20 (8 days incl. weekend arXiv gap — thin haul pre-graded as the correct outcome). Verifier: **17/18 CONFIRMED, 1 ADJUSTED, 0 REFUTED** — every date checked against arXiv API/Crossref/agency pages, incl. two decoy cases (CQG online-first illusion; ApJL online-vs-print boundary).

**(a) External engagement with LMU: ZERO, cleanly.** No citation/mention/fork/star/discussion anywhere: OpenCitations empty on all three DOIs (concept 10.5281/zenodo.20692157, v3.29 10.5281/zenodo.21322939, OSF 10.17605/OSF.IO/CN3B4); HN Algolia 0; GitHub 0 forks/0 stars/0 watchers, 0 external issues; Thai-language searches null; DataCite's 24 events all self-relations (the concept-vs-version double-count trap — present, correctly excluded). Scholar/Semantic-Scholar unreachable (429) but their week-scale lag makes a zero there uninformative either way. Observed en route: **Zenodo v3.29 record live since 2026-07-12** (17 views / 0 downloads at sweep time) — the release checklist's Zenodo step is done. Also surfaced our own **PR #12** (CONNECTION_MAP three-repo sync, opened 2026-07-12 by the companion session) still open → merged 2026-07-20 on instruction; companion PRs in CoE/SBA remain the other repos' business.

**(b) Stale-log corrections (supersede item 7 on these points — change pre-dates the window):**
1. **LiteBIRD "~2029" is DEAD.** ISAS/JAXA official page: "aiming for a launch in JFY2036" (KDP2 approved at ISAS Sept 2025; mission definition review planned summer 2026; Kavli IPMU release says "launch in the 2030s"). → **F4's decisive band test slides to the mid/late-2030s**; CMB-S4 also 2030s. Any "~2029" left in files is superseded.
2. SPT-3G D1 IGW bound (arXiv:2505.02827, logged as preprint) was already **PRD 112, 123520 (2025-12-08)** — arXiv journal-ref lag masked it. Numbers unchanged: r < 0.25 standalone, σ(r)=0.067; combined bound still r < 0.032–0.034.
3. The evolving-DE evidence paper logged as arXiv:2508.10514 has been **EPJC 86, 564 (2026-05-22)** since May.

**(c) In-window items (peer-review flags per verifier):**
- **F1:** [PRD 2026-07-16] Dark Acoustic Oscillations (arXiv:2512.15870): "evolving DE" possibly an *artifact* of early dark-matter–dark-radiation decoupling biasing the BAO scale — favorable-to-F1 if it wins; [CQG 43(14), 07-16] Sahoo: conditional **no-phantom-crossing theorem** for single-clock cosmology (invariant-manifold argument) — reinforces the logic F1 leans on; [PRD 114, 023532, 07-14] two-field quintessence ΔlnB≈4 over flat ΛCDM — **non-phantom quintessence family** (verifier adjustment: not "thawing"-specific; DESY5 SN, CMB via shift parameters); [preprint 07-14] arXiv:2607.13009: localized 3.5σ anomaly at z≈0.47 (DESI DR2 BAO + DES-Dovekie, no CMB) — localized hint, does not move F1; [preprint 07-17] Khoury–Lin–Trodden follow-up (2607.16191, Δχ²=−14.48); [RAA 26(8), 07-15] five-paper dark-energy review section. **F1 untouched; DAO line goes on watch.**
- **F4:** [PRD 114, 023534, 07-17] SPT-3G Compton-y maps (no tensor bearing); [preprint 07-16] "Tunnelling out of Starobinsky inflation" (2607.15354: hybrid exit raises n_s toward ACT-favored while keeping small r).
- **F5:** Meissner–Penrose 2503.24263 **unchanged** — still v1, no journal, no published rebuttal (all 7 citing papers checked: zero Comments/Replies). The transmit camp remains entirely pre-review while our F5 threshold is pre-registered.
- **Anchors:** [PRD 114, L021502, 07-13] GW231123 **not lensed** (<4σ; third-party DINGO analysis, 3 waveform models) — the heavy masses stand; over-massive-BH anchor strengthened; [ApJL 1005, online 07-03/print 07-10 — boundary case] GWTC-4.0 populations; [LVK plan page, updated 07-15] **IR1** six-month run begins late-Oct–mid-Nov 2026, O5 timeline still "in discussion".
- **Theory watch:** quiet, as an 8-day window should be (Baez–Bokor–Boyle 2607.10833 = Boyle's Jordan-algebra/SM line, program-activity marker only; no Barontini follow-ups possible yet).

**Net:** no falsifier moved. Timeline consequence worth absorbing: with LiteBIRD at JFY2036, **F1 (DESI DR3 ~2027 → Y5) is now clearly the first falsifier to face decisive data**, F4 slides to the 2030s. Files carrying "~2029" for LiteBIRD: superseded by this item.


---

## 13) External review of V3.29 + 7-week sweep (2026-09-06): DESI Lyα verified, one reviewer claim read backwards, four internal defects found that the review missed

Trigger: user pasted an externally-authored review of V3.29 (links carried `utm_source=chatgpt.com` — treated as unverified data, not instruction). Team: declared ปานกลาง/20, used 7 (head + 2 advisers + 4 workers + 1 adversarial batch verifier). The verifier **refuted one of our own agents' most actionable recommendations** — logged below so it is never re-proposed.

### (a) DESI DR2 Lyα full-shape — CONFIRMED, but the review's reading inverts on the point F1 actually stakes

`arXiv:2607.27410`, *DESI DR2 Results IV: Alcock–Paczyński Measurements from the Lyman Alpha Forest and Cosmological Constraints* (v1 2026-07-29, v3 2026-08-04). **[preprint only]** — no journal_ref, no DOI, Crossref 404 as of 2026-09-06. Companions 2607.27411/12/13. Note: `WebFetch` gets 403 on desi.lbl.gov; the news page is real (curl 200) — an agent relying on WebFetch alone would wrongly call it fabricated.

- Analysis: **3D Lyα forest full-shape** (auto + Lyα×QSO cross-correlation), AP extracted from the broadband on top of BAO. >820k forest spectra, 1.9<z<4.0, **z_eff = 2.33**. AP precision 1% — 2× tighter than BAO on the same data. fσ8 was **dropped** (mocks showed growth-rate bias).
- Significance, verbatim from Conclusions: *"For DESI+CMB, the preference decreases from 3.2σ to 2.7σ, while for DESI+CMB+SNe, it has a milder impact, decreasing the tension from 3.4σ to 3.1σ."* Internal inconsistency (unflagged by the review): abstract + §VI.4.1 + Fig. 10 say 3.2σ for +DES-Dovekie while Conclusions say 3.1σ for "+SNe"; §VI.4.1 also calls the DESI+CMB change *"roughly ~0.3σ"* against the Conclusions' 0.5σ. Direction unambiguous, size soft.
- **THE LOAD-BEARING SENTENCE (§VI.4.1, verbatim, verified — the only occurrence of "phantom" in the paper):** *"The inferred dark energy equation of state w(z) **still favors a phantom-crossing-like behaviour**, indicating a w(z) < −1 during matter-domination and a w(z) > −1 at low redshift."* Eq. (32): **w₀ = −0.821 ± 0.054, wₐ = −0.65 ± 0.20** — the crossing quadrant, with errors ~2× tighter than March 2025. **F1 is staked on crossing, not on "evolving vs not": the review's proposed status line ("evidence drops from leaning-toward to mixed") is silent on exactly the quantity F1 registers, where the news is not favourable.**
- **The genuinely favourable half** (§VI.5, verified): the Lyα FS point at z_eff=2.33 is *"consistent with the Planck ΛCDM model within 0.5σ"* while *"the best-fit for w₀wₐCDM being around 2σ apart"* — the new high-z anchor disfavours the **phantom end specifically**, which is the end a thawing model must disown. Supports the doc's existing `\Theorem` reading (tex:416, w ≥ −1 identically; crossing as CPL artefact, Dinda–Maartens).
- **DO NOT PROPAGATE:** the claim "most of the drop from 4.2σ is the DES SN recalibration, not Lyα" is an **agent inference, not the paper's** — the paper never states 4.2σ, never says "recalibration", and changed the CMB combination (added ACT DR6 + SPT-3G D1) at the same time. Single-cause attribution is not established by the source.
- In-window attacks on the *inference*: `2607.28918` (anytime-valid e-process) localizes essentially all DDE evidence in the **LRG2 bin** alone; dropping it gives M=0.49 (mildly favours ΛCDM) and it fails look-elsewhere across 7 bins — and notably a **thawing-quintessence** alternative there rejects ΛCDM *more strongly than any agnostic choice*. `2608.21405` argues DESI establishes only (w₀,wₐ)≠(−1,0) within CPL+GR+smooth-fluid, not a physical DE degree of freedom. Counter-direction: `2608.25278` reaches 3.0–3.6σ crossing significance but **by construction** (optimizing redshift/dataset) and explicitly declines to call it intrinsic. DESI five-year result still 2027 (verified verbatim on the 2026-04-15 page); survey extended through 2028.

### (b) α-attractor status — the review's citation is real and published; its paraphrase dropped the decisive clause

`arXiv:2510.18656` = **Ellis, Garcia, Olive & Verner, Phys. Rev. D 113, 063571 (2026)**, DOI 10.1103/d35r-7bn8 (published 2026-03-30). Verified verbatim: E-models accommodated to **α ≲ 25**, T-models only **α ≲ 11** (T-models predict n_s = 0.956–0.961, *"in some tension with Planck 2018"*). **The clause the review omitted:** α=1 is *"within the 95% CL region determined by the Planck-ACT-SPT combination, **but below the 95% confidence region of the Planck-ACT-DESI combination**"* — the verdict is dataset-dependent, and the pressure comes from adding **DESI BAO**, not from ACT itself (German & Hidalgo: *"ACT DR6 alone is fully compatible with Planck regarding n_s"*).

n_s tension for our pin (0.9649): ≤1.2σ against every CMB-only combination; **2.76σ** vs P-ACT-LB-BK18 (0.9743±0.0034); **3.43σ** vs P-ACT-LB2. Drees & Xu (**Phys. Lett. B 867, 139612 (2025)**): Starobinsky *"for N⋆ ≳ 58 … remains consistent with current observational constraints at the 2σ level"*, and their ACT-allowed region predicts r ≈ 2–3×10⁻³ — **inside our F4 band**. Haque–Pal–Paul (PRD 114, 023521 (2026)) say α=1 is "excluded at 2σ" but **only for w_φ=0 matter-like reheating**, not our instant-reheat case.

**REFUTED — do not re-propose (verifier finding):** an agent recommended moving N_CMB 57 → 60–61 to buy ~0.6σ, claiming instant reheating naturally yields N⋆≈60–61. **Wrong.** Ellis et al. Eq. (B.35) for the α=1 E-model gives **N⋆ ≈ 55.8–56.0**, and they define instantaneous reheating at **2×10¹⁵ GeV** (Γ_φ=H). The N⋆≈59–61.5 figure belongs to generalized **k=10 T-model** attractors at T_RH=10²–10¹⁰ GeV — a different model. Their Table 2 for α=1, N⋆=55 gives n_s=0.9649, r=0.00355. **Our N_CMB=57 is already in line with what instant reheating delivers; there is no free e-fold to harvest.** (Arithmetic, retained as reference: r=12/N² gives 0.00369/0.00357/0.00333/0.00323 at N=57/58/60/61 — all inside 0.0018–0.009.)

r bound: **r < 0.034** (95% CL, k=0.05 Mpc⁻¹) — Balkenhol et al., *Inflation at the End of 2025*, OJAp 9 (2026), DOI 10.33232/001c.164435. Verifier correction: this is the most recent and most data-inclusive bound but **not the numerically tightest** — the same paper flags Tristram et al. (2022) at r<0.032, same pivot, using Planck BB spectra it excludes.

### (c) The review's six priorities, graded (advisers + doc audit)

1. **Flash→inflaton coupling = "#1 gap"** → RE-DISCOVERY of `OPEN_PROBLEMS §1` + four logged closure rounds. Not a new find; the gap was already named and adversarially attacked.
2. **IC + reheating closure as a second box** → RE-DISCOVERY, and **our ledger is finer**: we separate §1 (wiring) / §2 (seam IC family) / §3 (derivation gap: input→A_s/spectrum/N_total absent) — three entries, not the reviewer's two. The target list (n_s, A_s, r, f_NL) is already tex item (D) at `tex:1330`, riderized to include N_total≈60–85.
3. **"L0 existence/unboundedness is a framework-level failure point"** → RE-DISCOVERY of our own declaration, stated four times: `tex:105` *"The single declared framework-level point of failure is **fork 5** (unbounded L0); every result that rides on it says so."* (also tex:93, 75, 631), with the measure-problem homing already at `tex:1541` (Olum 2012) and `OPEN_PROBLEMS §6`. Adviser caveat retained: **if any future argument runs "infinite trials rescue P>0 relighting", that is the superseded stratum** — post-3.27 ignition needs no infinite-trial probability.
4. **Update DESI** → valid, status-refresh only (F1 threshold frozen, CN3B4), but must be written per (a) above, not per the review's wording.
5. **Ladder discriminator** → the *principle* is already ours: `tex:153` ranks rungs by *"position in the eating process rather than by its mass"*, and the fate map `tex:1018` notes M87 vs NGC 1277 at near-identical masses on different rungs. **Genuinely new content:** casting it as P(overmassive | relic/stalled) vs P(overmassive | high-z gas-rich) — a candidate observable for §4. **Must not become a new F-threshold** (registered set frozen).
6. **Prologue nucleation drift** → **PARTIALLY-DONE and the proposed remedy is out of policy.** The prologue (`tex:79`) is already guarded by the rider at `tex:84` applied 2026-07-12 (stress-test fix #4, commit 94aec86). "Move nucleation to [Retired-primary/Alt]" is a **rewrite**, which the document forbids for body text at `tex:827` (*"retained verbatim as the V3.21 record"*) — that is a policy-change request, not a fix. The in-policy version (extend riders) is valid.

Review also **mis-mapped Open joint 2**: it is the V_min sign question (`tex:1222`), not "spin-model magnitude" (that lives at `tex:1035`/`1185`).

### (d) What the review missed — four internal defects found by our own audit

1. **The strongest surviving UNGUARDED superseded stratum:** `LMU_V3_29_consolidated.tex:1222–1229` (Open joint 2) still asserts *"The closure of Part III needs V_min=0 (Minkowski reservoir, no contraction)"* (`:1223`), books the swampland dS-disfavour leg (`:1226`), and concludes *"the framework is **singularly** committed to the V=0 knife-edge … on **naturalness** the framework is worse off **specifically here**"* (`:1228`). Against canon since V3.27 (tiny **positive** dS; swampland field-wide). The six append-only riders sit at tex:84, 633, 853, 1318, 1392, 1573 — **none covers 1222–1229.**
2. **Genuine error in the ledger:** `review/PROOF_STATUS_LEDGER.md:57` states the usable falsifier set as **"F1–F4"**; the registered set is **F1–F6** (`OPEN_PROBLEMS.md:103–108`, `README.md:46`, `FALSIFIERS_preregistration_V3.28.md:18`). Self-inconsistent with `:36` in the same file, which cites F4/F5.
3. **E-model vs T-model is stated NOWHERE:** grep for `E-model|T-model|E-type|T-type` across the .tex, README, OPEN_PROBLEMS and review/ returns **0**. We pin α=1 but never name the potential family — and per (b), **ours is an E-model, the branch current data favours**. One sentence closes it.
4. **Stale parenthetical:** `review/LMU_SYNTHESIS_2026-07-07.md:51` says the .tex fix is *"(pending approval)"* — riders were applied 2026-07-12. Verifier adjustment: only the parenthetical is stale; the main clause (the .tex still carries old V_min=0 / B-primary wordings) remains **true by append-only design**, and (d)(1) shows reconciliation is genuinely incomplete. Also `PROOF_STATUS_LEDGER.md:8` carries a dangling pointer to *"§1 rows that still say V_min=0"* — no such row survives in §1.

### (e) Watch-line sweep 2026-07-20 → 09-06 (peer-review flags)

- **F4 — the most consequential item of the window:** LiteBIRD **passed Mission Definition Review #2** (held June 2026, announced 2026-08-07 by Kavli IPMU) → Phase A. The reformed mission's stated objective is **δr < 0.002 (68% CL) total**, including foregrounds, systematics and margin (`arXiv:2607.25285`, SPIE proceedings). **Consequence for us: that covers the TOP of the F4 band (r=0.009) at ~4.5σ but the BOTTOM (r=0.0018) at only ~0.9σ — LiteBIRD alone will not decide the lower half of our band.** Path to the bottom half: SPT-3G+ (receivers early 2029, goal σ(r)=0.001) and BICEP Array (σ(r)≈0.001 projected by 2034). CMB-S4 remains dead (DOE+NSF ended support 2025-07-09). **No new r bound in window** — BICEP Array states its next analysis (data through 2024) is still unpublished.
- **F5 — static, and that is the headline:** Meissner–Penrose `2503.24263` still **v1 after 17 months**, no journal_ref, no DOI, no Crossref record, **no published rebuttal**; zero Gurzadyan/Penrose/Meissner postings in window; zero new Hawking-point or concentric-circle analyses. The one new CCC paper (`2608.27014`, bimetric varying-constants) has no CMB content and does not test F5.
- **F6 — nothing.** No in-window result constrains the sign of V_min; the future-AdS/big-crunch coverage circulating dates to Feb 2026.
- **A peer-reviewed competitor landed on the derivation-gap ground (§3):** Khaldieh, Rosenzweig & Steinhardt, **Phys. Lett. B 880, 140851** (DOI 10.1016/j.physletb.2026.140851; arXiv:2607.07815) — slow contraction with a stable **past attractor asymptoting to Minkowski** that *"generates an initial spectrum of vacuum-like quantum fluctuations on all wavelengths"*, hands the contracting end-state forward as the expanding phase's ICs, and explicitly claims to **evade BGV**. **Graded against the item-11 rubric: fails all four letters.** A: the "past attractor" is the t→−∞ limit of the *same* solution (and only generic for **open** universes; in flat ones it needs exactly homogeneous-isotropic data), with the vacuum prescribed — the paper itself calls it *"often referred to as a Bunch-Davies vacuum"*. B: **zero occurrences of A_s / "amplitude" / "normaliz"** in the paper; the near-scale-invariant spectrum is outsourced to citations and needs two kinetically-coupled fields. C: dials undetermined (ε>3, ε′, both potentials, bounce scale). D: smooth non-singular bounce (or S-brane), not an evaporation flash. **The item-11 void verdict stands — but this is now the strongest published neighbour and must be cited whenever the void is declared.**
- **Anchors:** LVK **IR1** narrowed to early–mid **November 2026** (six-month run, not started). InPTA DR2 III is the only PTA data release — non-competitive (A_GWB < 3.4×10⁻¹⁴, ~10× above other PTAs, no HD correlation). JWST: Skyfire spectroscopic census (34 broad-line sources, 18 LRDs at 2.7<z<6.5) — a **population census, no new record over-massive object**. **Fertility row entirely static**: T2K+NOvA (Nature, Oct 2025) and LEGEND-200 (PRL 136, 022701, Jan 2026) both pre-date the window; nothing replaced them.

**Net:** nothing in the window falsifies F1/F4/F5/F6. Timeline picture updated: **F1 (DESI DR3 ~2027 → five-year 2027+) remains the first falsifier to meet decisive data**; F4's decisive test is now known to need more than LiteBIRD for the band's lower half.

**Deferred candidates (NOT applied — one scope each, awaiting instruction):** (i) rider over tex:1222–1229; (ii) F1–F4 → F1–F6 in ledger:57; (iii) name the E-model in one sentence; (iv) fix SSOT:51 parenthetical + ledger:8 dangling pointer; (v) F1/F4 status refresh in OPEN_PROBLEMS §5 per (a) and (e); (vi) ladder discriminator as a §4 candidate observable.


---

## 14) DEAD-END — the rotating-form route (2026-09-07): rotation as the acceleration engine, and accumulation-to-collapse in L0. Both priced and closed; A2 now quantified

Trigger: an externally-authored survey of rotating/anisotropic cosmologies (AI-written, tracking-tagged links, and it referenced our own "L0" — i.e. an attempt to graft a rotating-universe model onto our substrate), followed by Pitarn's own sharper restatement of the idea. Script: `code/rotating_form_L0.py` (runnable). Team: ง่าย/10, used 4 (3 workers + head; the decisive arithmetic was run directly rather than spending a fifth agent).

**Grading correction, recorded so it is not repeated:** the first pass mis-assigned the proposal, reading it as "L0 has a boundary" and raising 12 collision points. **Five of those (bounded L0, the need for an 'outside', the outside-resists pressure balance, and the finite-L0 walls) are void** — the proposal keeps L0 infinite and unbounded (fork 5 untouched); what curves is the **form condensing inside it**. Only the rotation and no-inflation objections survived, plus the two new items priced below.

### What was already ours (not a new proposal)

- **The accumulation picture** is `review/L0_SHALLOW_WELL_accumulation.md` (2026-07-07, still current): only *cold* matter accumulates (hot/turbulent free-streams away) → a broad, shallow, low-Weyl, **non-collapsing** well in an infinite L0.
- **"The form is slightly curved"** is canon: the aeon is born an **open FRW patch, Ω_k < 0** (`tex:851`), flattened by inflation.
- **"The form has an axis"** is the **C5 spin-axis carry-through** (`tex:838`): the child *"inherits a preferred spin-axis direction carried on those lumps"* — [Hyp], and pinned at `tex:1250` as **"directly unobservable in principle."**
- **"Thaw"** is already F1's registered word — but there the thawing object is a **field beginning to roll**, not a rotation.

### The two new pieces, priced

**(i) Rotation as the engine of the observed acceleration — DEAD, two independent ways.**
- *Size.* To let the +ω² Raychaudhuri term rival Λ needs ω² ~ 3Ω_Λ H₀², i.e. **ω/H₀ = 1.43**. Bounds: (ω/H)₀ < 7.6×10⁻¹⁰ (Planck 2015 XVIII, Bianchi VII_h) and (σ_V/H)₀ < 4.7×10⁻¹¹ (Saadeh+ 2016 PRL, Planck T+E over all Bianchi d.o.f., odds 121,000:1). **Over by 9.3 and 10.5 orders.**
- *Timing — the decisive one.* Angular-momentum conservation on a comoving patch (L ~ MR²ω, R ~ a) gives **ω ∝ a⁻²**, so the rotational term goes as **ω² ∝ a⁻⁴**, radiation-like. Granting rotation the **entire** dark-energy budget today, at recombination it was **~10¹² × larger** — it would have dominated the early universe and wrecked the CMB. Acceleration switching on only ~5 Gyr ago is the signature of a component that does **not** dilute (w=−1, ρ∝a⁰) finally overtaking ones that do. **Same failure class as the photon-crossfire result in `code/bw_crossfire_L0.py` (log item 9): a⁻⁴ always loses to expansion; only a w=−1 field is dilution-proof.** Pitarn derived that lesson himself in the crossfire arc and it applies here unchanged.
- This **quantifies dead-end A2** (`tex:1355`: *"DE/Λ origin: rotation/vorticity (Saadeh et al. 2016 kills)"*; `tex:1438`), which previously carried the verdict without the numbers.

**(ii) Accumulation continuing until the form collapses — DEAD, and self-defeating if forced.**
- At the L0 floor density (ρ_dS = 6.0×10⁻²⁷ kg/m³) a pile reaches its own Schwarzschild radius only at **M = 5.55×10²² M_☉ = 1.00× the mass inside one de Sitter horizon** — it must gather material that is already receding faster than it can fall in.
- Even granting it: that mass sits at the **mortality ceiling M_eq = 2.8×10²² M_☉** (T_H = T_dS), above which the hole **never evaporates** — no terminal flash, **no next aeon**. The collapse route does not open a cycle, it ends one.
- **Bonus — an internal consistency check that passes:** the collapse mass reached here from *mass accumulation* and the mortality ceiling derived in the document from *temperature* land on the same de Sitter mass scale, a factor 2 apart. Two independent routes to the same wall.

### What honestly survives (watch-line only)

**Verma, Aluri, Mota & Obukhov, JCAP 06 (2026) 047** (arXiv:2506.00860) — a Gödel-class cosmographic preference from Pantheon+: Ω₀ = 0.29 (+0.21/−0.15) at z ≤ 0.2, axis ≈ (243°, −49°), ΔAIC = −2.23 — i.e. **~1.9σ, and the authors do not claim a detection**. It survives only because Gödel-type rotation is a model class the Bianchi CMB bounds do not cover, which also makes it correspondingly hard to falsify. Watch only.

### Citation hygiene on the source survey (all checked at primary sources)

Stale or refuted, and must not be carried into any doc: **"r < 0.06 from Planck"** is 8 years stale and mis-sourced (needs Planck+BK14; Planck alone gives 0.10; current r < 0.032 Tristram 2022 / 0.034 Balkenhol OJAp 2026) — and the survey's entire "no PGW ⇒ no inflation" leg rests on it; **"ω/H < 7.6×10⁻¹⁰"** presented as a 2024 result is an intro citation to superseded Planck 2013/2015, ~15× looser than Saadeh 2016; **"Szapudi et al. 2024"** should be **Pál, Goh, Rácz & Szapudi**, EPJ ST (2025); the survey's **~1% polar/equatorial expansion difference "consistent with CMB limits"** requires ω/H ≈ 1.4×10⁻², i.e. **10⁷–10⁸× the bounds**, and that paper's own discussion calls it *"a significant deviation from the concordance model"*; **Birch (1982)** is cited with its refutation history omitted (Phinney & Webster 1983; Bietenholz & Kronberg 1984; no alignment in Joshi+ 2007); **Shamir's galaxy-spin asymmetry** collapses on duplicate catalogue entries — 4.00σ → **0.29σ** after cleaning (Iye, Yagi & Fukumoto, ApJ 907, 123 (2021)), with three independent isotropy-favouring analyses since (Patel & Desmond 2024; Stiskalek & Desmond 2024; Iye & Yagi 2026) and no independent replication; **cosmic filament "solid-body" spin** actually rises then falls to zero past ~2 Mpc, at 1.3–1.7σ for most subsamples (4.2σ only for a triply-selected one; the title says "Possible").

Supporting CMB-anomaly landscape as of 2026-09, for the record: Axis of Evil swings 1.5σ–3.3σ on mask choice with no look-elsewhere correction and no polarization counterpart; **S₁/₂ (missing large-angle correlations) largely dissolved** — better cleaning moves p from 0.2% to 6–9% (Herold et al., ApJ 1005, 146 (2026)); Cold Spot dead both ways (supervoid ruled out by lensing, Owusu+ JCAP 2023; the anomaly itself a filter-choice artefact, Zhang & Huterer 2010); direction-dependent H₀ claims have mutually near-orthogonal axes and are absorbed by bulk flow (Stiskalek, Desmond & Lavaux, MNRAS 2026). **Primordial vorticity as the origin of galactic spin is a historical dead end**: vorticity decays (ω ∝ a⁻¹ to a⁻²) in linear theory, and the replacement — tidal torque theory — is now measured at **~7σ** (Sheng et al., Nature Astronomy 2026).

**Net:** no falsifier moved; A2 upgraded from verdict to priced verdict; one new wall recorded (the de Sitter accumulation budget, coinciding with the mortality ceiling). If a rotating-form idea returns, it must first clear ω/H ≈ 1.43 against 4.7×10⁻¹¹ and explain how an a⁻⁴ component switches on at z ≈ 0.5.

---

## 15) Watch sweep (2026-10-14): window 2026-07-20 → 10-14 — LZ 2.6σ event, an F1 scoring gap (coupled-sector crossing), M87 polarimetry downgrade; no falsifier moved

*Filed 2026-11-15. Written on 2026-10-14 as "item 13" against a project copy of this log that ended at item 12; the repo already had items 13–14 (2026-09-06/07), so it is renumbered **15** (sub-items 15b–15j). Text otherwise unchanged; "L0" below is the arena now called U0 (V3.30).*

Solo sweep (head only; WebSearch/WebFetch). Absence from the docs grep-verified against the V3.29 text + LOG items 1–12. Claims checked at abstract / press-release level; **journal status of preprints NOT checked** — pin before any `.tex` use.

**(a) Dark matter — B4′ minting text (not a falsifier line)**
- **LZ single unexplained event.** Announced at TeVPA 2026 (Japan, ~2026-08-31/09-01); paper "to arXiv + PRL" (arXiv ID **not yet pinned**). 220 live days (Mar 2023–Apr 2024), 10 t LXe. One nuclear-recoil event that known backgrounds do not explain; **2.6σ** (~0.5% background chance); if WIMP: m ≳ 200 GeV with a non-minimal interaction. The collaboration does **not** claim a detection. [Fact] the event + significance / [Hypo] DM origin (n = 1, < 3σ).
- Recoil ≈ 248 keV (per the follow-up below). Follow-up: Yang, Wu, Duan, Xia, Tsai & Fan, arXiv:2609.06640 (v2 2026-10-05) — leptophobic **inelastic** DM; endothermic branch ≳ 400 GeV or exothermic branch at tens of GeV (~55 GeV, also fitting the Galactic-Centre GeV excess and AMS-02 antiprotons). Also seen: arXiv:2609.21011 (endothermic Z′-portal, LZ–LHC) — title-level only.
- **Doc impact:** B4′ says LZ 2024 nulls close the classic WIMP corridor, so the relic must live in still-open corridors. Inelastic DM *is* such a corridor (the mass splitting suppresses low-energy recoils), so a growing signal would land inside what the text already allows — consistent with "collisionless thermal relic, symmetric with baryons". It does **not** serve the ~5 GeV asymmetric-DM option in the OPEN_PROBLEMS §2 fertility row. Watch: LZ continued exposure; XENONnT / PandaX cross-check.

**(b) F1 — dark energy**
- **Dinda, Maartens & Saito, arXiv:2605.13546 (v2 2026-05-20)** — sequel to the Dinda–Maartens 2025 defence the docs already cite. w0wa gains only a local goodness-of-fit edge (ΔDIC < 0) that does not survive the full prior volume (Δln Z does not favour it); **ΛCDM, w0wa and thawing quintessence are statistically indistinguishable**; no consistent cross-dataset evidence for dynamical DE or phantom crossing. Datasets not pinned from the abstract. [Fact] (preprint). Favourable to F1 not firing; does not change the threshold.
- **Pompeu, Rebouças & Rosenfeld, arXiv:2608.23712 (v1 2026-08-24, v2 09-10)** — DM mass coupled to the DE field (m ∝ φ^α, V ∝ φ^−β); CMB + BAO + SNIa give goodness-of-fit similar to w0wa and an apparent low-z phantom crossing with no field going phantom. [Fact] (preprint).
- **Scoring gap — flagged, NOT applied:** F1 fires iff the crossing survives a physical non-CPL reanalysis. A coupled-sector model *is* non-CPL and *keeps* an apparent crossing. If DESI-Y5 prefers this class, the registration does not say whether F1 fires — yet the spine (A uncoupled, DM an independent relic) would still need a new DM–A coupling. [Hypo] (reading of the wording). Candidate action: record an interpretation note **before** Y5 data. Do not touch the OSF thresholds (R6). Deferred until instructed.
- **DES Y6 3x2pt** (results webinar 2026-01-22; framework paper arXiv:2601.14859): S8 = 0.789 ± 0.012; wCDM w = −1.12 (+0.26/−0.20), consistent with −1; w0wa deferred to later papers. Neutral for F1. [Fact] (numbers via Astronomy.com + DES Y6 papers page).

**(c) F2 — black-hole spin**
- **Wong, Palumbo, Gelles & Chael, arXiv:2607.14218 (2026-07-15)** — current EHT polarimetry constrains magnetic-field geometry, variability, orientation and flux state more robustly than spin magnitude or sense. Effect on the M87 row: the "polarimetry disfavours high spin (Wong et al. 2025)" side weakens. The row moves from "two methods disagree" toward "no robust spin measurement yet". Still [Open — contested]. **R9 check pending:** confirm this G. N. Wong is the "Wong et al. 2025" first author before merging the two in prose. [Fact] (preprint).
- **García, Connors, Brenneman & Steiner, arXiv:2607.14368 (2026-07-15)** — community quality criteria for X-ray-reflection spins: detectability / uniqueness / robustness, giving a robust / provisional / not-assessable classification and a reporting checklist; calibration deferred to a companion paper. F2 is decided by this method, so any future relic-spin claim should be graded against these criteria. [Fact].

**(d) F6 — endgame sign**
- **Luu, Qiu & Tye, "The Lifespan of our Universe", arXiv:2506.24011 (v2 2025-08-26)** — ultralight-axion DE plus Λ; "high probability Λ < 0", leading to a big crunch with total lifespan ~33 Gyr; uses DES + DESI. Journal ref per press = JCAP 2025(09) 055 [unverified on the arXiv page]. The docs carry only Gialamas et al. 93.8%, so this is a **second named group on the future-AdS side**. [Fact] they claim it / [Hypo] the Λ < 0 inference (model adds a field). F6 stays a watch-line, leaning rival.

**(e) Timelines (supersede item 12 where they overlap)**
- **Euclid slipped:** DR-Foundation (LE1 + LE2) in Nov 2026; full DR1 (adds LE3) ~mid-2027 (probably June); **no official Euclid cosmology before mid-2027** (original DR1 date: Oct 2026). Source: P. Coles' blog, 2026-06-16 (secondary); ESA DR1 timeline page. The F6 decider "DESI DR3 / Euclid / Roman" now arrives roughly together, ~2027.
- **LVK IR1:** six-month run starting **early–mid Nov 2026**; Virgo joins with possible interruptions; KAGRA later; O5 timeline still under discussion. Source: plan page update of 2026-09-03 (next update due 2026-10-15). Supersedes item 12's "late-Oct–mid-Nov".

**(f) Anchors / consistency**
- **Iani et al., arXiv:2603.17967** — two over-massive BH candidates (Pelias z ≈ 0.71; Neleus z ≈ 0.75) in ~10⁷ M☉ dwarfs; log M_BH ≈ 5.7–6.7; M_BH/M* ≈ 6–60%. Masses come from SED fitting plus an Eddington-limited assumption, with no X-ray detection. **Not anchor-grade** under the docs' dynamical-mass rule. [Fact] candidates / [Hypo] masses.
- **InPTA DR2 GWB, arXiv:2608.02808 (2026-08-03)** — weak common red process (Bayes factor 2.5); A_GWB < 3.4×10⁻¹⁴ (γ = 13/3); no Hellings–Downs detection. Consistency-only; PTA stays anchor-grade via NANOGrav/EPTA.
- **H0 Distance Network** (A&A, 2026-04-10, DOI 10.1051/0004-6361/202557993): H0 = 73.50 ± 0.81. Against Planck 2018 (67.36 ± 0.54): Δ = 6.14, σ = √(0.81² + 0.54²) = 0.97, so ≈ 6.3σ. [Fact-eq]. KBC watch-line only, not LMU-core.

**(g) Swept, nothing new**
- Meissner–Penrose 2503.24263: still v1, no journal ref (checked 2026-10-14). F5 unchanged.
- Barontini: no follow-up beyond press.
- No new r bound.
- DESI: no new cosmology release. The planned survey map was completed per the Apr 2026 FNAL/DESI news (headline-level only); DR3 BAO ~2027.
- CCBH: two theory papers only, both exact solutions with no new observational k — context only (Λ/A spine does not lean on CCBH):
  - Cadoni, de Lima, Pitzalis, Rodrigues & Sanna, 2601.03296 — regular-horizon CCBH.
  - Wu, Chu & Hu, 2603.24609 — CCBH in an anisotropic dark sector.

---

### 15b) User idea (2026-10-14): "thawing no longer looks right — each universe collapses itself by twisting spacetime, then expands by gathering the surrounding energy" — graded

Solo, conversational grading. The idea is [Hypo]. Brakes carry labels.

1. **Data do not kill thawing.** Per (b), Dinda–Maartens–Saito find thawing ≡ ΛCDM ≡ w0wa statistically. There is no measured push to drop it. [Fact]
2. **Different epochs.** The idea addresses *birth* (collapse → bounce → expansion). Thawing addresses *today's* acceleration. Observed acceleration (Riess et al. 1998; Perlmutter et al. 1999) needs a component with w < −1/3 now, whatever happened at birth. If thawing is dropped, the fallback is constant Λ (the V2.0 axiom). F1's kill line (a genuine crossing below −1) is unchanged under Λ, but Λ is *more* exposed: a non-crossing evolving w would pass thawing and tension Λ. [Fact-eq] (logic on the registered wording)
3. **"Expands by gathering energy" — contradicts GR at ordinary densities.** The acceleration equation is ä/a = −(4πG/3)(ρ + 3p). Gathered matter adds +ρ, and radiation adds +2ρ, so both decelerate; acceleration needs w < −1/3. [Fact-eq]
   - It is valid only near critical density with quantum corrections. LQC: H² = (8πG/3)ρ(1 − ρ/ρ_c) (Ashtekar–Pawlowski–Singh, PRL 96, 141301 (2006)); the docs already compute the (ρ + 3p)_eff sign flip (K7, closed-box handoff). Torsion: Popławski, PLB 694, 181 (2010); PRD 85, 107502 (2012).
   - So it is legitimate *as a bounce mechanism* (owned, already the K8 fork) and **not** as a replacement for late-time dark energy.
4. **"Collapses by twisting" — sign is inverted if "twist" means rotation or torsion.** Raychaudhuri (1955): dθ/dτ = −θ²/3 − σ_abσ^ab + ω_abω^ab − R_ab u^a u^b. Vorticity ω² enters with a **+** sign and *resists* focusing. What drives collapse is ρ + 3p and shear. [Fact-eq]
   - Torsion (Einstein–Cartan; Kibble 1961, Sciama 1964; Popławski) gives *repulsion* at extreme density — the bounce agent, not the collapse agent.
   - Global rotation of our aeon is already dead-end A2 (Saadeh et al. 2016). [Fact]
   - If "twist" means curvature (warping), it is ordinary gravitational collapse (Oppenheimer–Snyder 1939): standard, fine. → Clarification asked of the user.
5. **Ownership of the skeleton** ("a region collapses → bounces → becomes a new expanding universe"):
   - Black-hole cosmology: Pathria, Nature 240, 298 (1972); Smolin, CQG 9, 173 (1992); Popławski 2010/2012.
   - LMU's L0 "tiny-region collapse" picture is the Pitarn layer on top → **hybrid**.
   - Nothing here is a new Pitarn origination yet.

**Net:** no doc change. Thawing stays the spine (F1 as registered). The idea's live content (energy → bounce at ρ_c) already exists in the K7/K8 fork. Open question to the user: what "บิด" (twist) means.

---

### 15c) Clarification + correction (2026-10-14, same sitting) — NO bounce anywhere; L0 is not a Λ background

**User clarification (supersedes the bounce reading in 15b items 3–4):** there is **no rebound anywhere** in the infinite system. Picture:
- a region of L0 collapses;
- our universe's mass is enclosed in a rotating ellipsoid ("twist") that travels through L0;
- the object slowly dissolves back into L0, with no rebound.

[Hypo]

**Ownership map (hybrid):**
- **Universe = collapsed object seen from outside:** Pathria, Nature 240, 298 (1972). The Hubble-volume mass M_H = c³/(2GH₀) ≈ 9.2×10⁵² kg ≈ 4.65×10²² M☉ has r_S = c/H₀ exactly. [Fact-eq]
- **"Expanding inside its own Schwarzschild radius, after a cloud collapsed":** Gaztañaga, *The Cosmological Constant as Event Horizon*, Symmetry 14, 300 (2022), arXiv:2202.00641 — nearest owner of the whole picture. The later PRD version (2505.23877, LOG item 11) derives a bounce radius; the user's no-bounce reading departs from that.
- **Outside collapsed, inside expanding, no bounce:** false-vacuum bubble / baby universe — Sato–Sasaki–Kodama–Maeda, PTP 65, 1443 (1981); Blau–Guendelman–Guth, PRD 35, 1747 (1987); Garriga–Vilenkin–Zhang, JCAP 02 (2016) 064. Inside expansion is driven by w = −1 vacuum; the exterior is a BH that evaporates with no rebound.
- **Rotating ellipsoid:** Kerr (1963); oblate horizon geometry, Smarr, PRD 7, 289 (1973).
- **Observational status of rotation:**
  - Saadeh et al. 2016: no global vorticity. [Fact]
  - Shamir, MNRAS (2025; DOI 10.1093/mnras/staf292): 263 JADES galaxies, ~2/3 clockwise. [Fact] count; cause contested (Doppler bias possible).
  - Szigeti–Szapudi–Barna–Barnaföldi, arXiv:2503.13525: ω₀ ≈ 2×10⁻³ Gyr⁻¹ claimed to ease H₀. [Hypo], preprint.
- **Pitarn layer:** the arrangement — a universe-object travelling in L0 and dissolving back, with no bounce anywhere in the system.

**Auditor error — Λ-import, second occurrence** (first: V3.5 "Correction 1"):
- In this sitting the auditor assumed L0 carries our Λ and braked with the Nariai / M_eq limits (M_H/M_eq = 2√Ω_Λ = 1.66; M_H/M_Nariai = 2.15).
- Per the docs, A is **per-zone**, and L0 is the A ≈ 0 baseline (glossary). **Brake withdrawn.**
- In an A ≈ 0 background there is no Nariai ceiling and T_bath ≈ 0, so the object evaporates. Numbers: T_H(M_H) ≈ 1.3×10⁻³⁰ K; t_evap ≈ 2.1×10⁶⁷ yr·(M/M☉)³ ≈ 2.1×10¹³⁵ yr (photon + graviton scaling). [Fact-eq]
- The brake returns only if the exterior zone carries A ≥ 0.37 × ours.
- Doc tension noted, not touched: the F6 tiny-dS floor (V_min = ρ_Λ, a zone endgame) vs the glossary's L0 = A ≈ 0. [Open]

**"A at each point scales with the universe's mass":**
- The owned relation is Gaztañaga's Λ = 3/r_S² = 3c⁴/(2GM)², i.e. **Λ ∝ 1/M²** (bigger universe → smaller A).
- Check with M_H: it gives Ω_Λ = 1.00 vs measured 0.685 — an order-unity match. [Fact-eq]
- Direction pending from the user. If they mean A ∝ M (bigger → more), the nearest owner is CCBH-type sourcing (Croker–Weiner–Farrah), which the docs log as retired Fork X / Dead "BH by-product is the source of A".

**Still standing:**
- (i) Spin alone cannot translate the object (linear-momentum conservation). Travel needs asymmetric emission — merger superkicks: Campanelli et al., ApJL 659, L5 (2007); González et al., PRL 98, 231101 (2007). Uniform motion through L0 is unobservable from inside. [Fact-eq]
- (ii) Spin is shed faster than mass (Page, PRD 14, 3260 (1976)), so the ellipsoid rounds off before dissolution. [Fact-th]

**Net:** no doc change. The no-bounce universe-object picture is coherent in an A ≈ 0 L0. Its nearest single owner is Gaztañaga 2022 (BHU) plus the baby-universe family. Open to the user: the direction of A vs mass.

### 15d) Resolution (2026-10-14, same sitting): "A runs on the time of its own spacetime"

**User statement:** A at each place differs because A evolves on that spacetime's own clock. [Hypo → maps onto the existing spine]

**Mapping:** this *is* per-zone thawing. The Klein–Gordon equation Ä + 3HȦ + V′(A) = 0 is driven by the zone's own H(t) and proper time:
- A stays frozen while H ≫ m;
- it rolls once H ≲ m (Scherrer–Sen 2008; Caldwell–Linder 2005; field equation Ratra–Peebles 1988 / Wetterich 1988; per-zone choice = LMU linkage).

[Fact-eq]

**Mass dependence comes out by itself, through the clock.** H² = (8πG/3)ρ, so a denser zone keeps H above m longer and thaws later. Different zones therefore sit at different A at the same L0 moment, ordered by their mass/density history. No direct A(M) formula is needed, and the 15c direction question (Gaztañaga's Λ ∝ 1/M² vs CCBH-type ∝ M) is **moot**.

**Consequence for 15b:** the user's doubt about thawing dissolves — the picture *requires* thawing, run per zone. The spine and F1 are unchanged.

**Caveat:** comparing A across zones "at the same moment" uses the L0 foliation, which is a postulated clock, not an observable (ledger). [Hypo]

**L0 = A ≈ 0** is consistent: a zone's A has run down once its clock ends, which is also what lets the universe-object of 15c evaporate.

### 15e) A central A_L0 (2026-10-14, same sitting) — and a correction to 15c

**User statement:** L0 carries one central value A_L0. Every zone's A — which was compressed and stretched until its clock slowed — recovers and speeds back up as the universe-object dissolves, and merges into A_L0 exactly. [Hypo, hybrid]

**What holds:**
- **"Merges exactly" needs no tuning.** If every zone shares one potential V(A), the Klein–Gordon equation with Hubble friction carries each A to the same V_min — an attractor. The nearest owner for "different starting A end on one common track" is Zlatev–Wang–Steinhardt, PRL 82, 896 (1999). [Fact-eq]
- **A_L0 is already named in the SSOT:** V_min = ρ_Λ = (2.3 meV)⁴, the 3.27 tiny-de-Sitter floor.
- **"Clock speeds back up":** the dilation factor relative to L0 is √(1 − r_s/r) → 1 as M → 0, and evaporation runs away (dM/dt ∝ −1/M²) (Schwarzschild 1916; Hawking 1974). Dilation is a relation between clocks; local clocks inside tick normally. [Fact-eq]

**Correction to 15c:**
- 15c withdrew the M_eq / Nariai brake using the glossary's "L0 = A ≈ 0". That reading is **superseded** by the SSOT's 3.27 tiny-dS floor. With A_L0 = floor, L0 has H_L0 = H₀√Ω_Λ, so the brake is re-evaluated.
- **Mass accounting corrected:** the Kottler (Schwarzschild–de Sitter, 1918) mass parameter counts only the excess over the background vacuum. If the inside vacuum equals A_L0, only matter counts: M = Ω_m × 4.65×10²² ≈ 1.47×10²² M☉.
- Then M/M_Nariai = 0.68 and M/M_eq = 0.52, so T_H ≈ 1.9 T_dS: the object **exists and evaporates**. [Fact-eq]
- **Size limit:** the enclosed matter region must stay ≲ 1.14 Hubble radii (today's density). That is just inside L0's dS horizon, c/H∞ = 1.21 R_H. Anything larger cannot dissolve. [Fact-eq]

**Tension raised:**
- A_L0 > 0 means L0 itself expands (H∞ > 0). Debris beyond the zero-gravity radius r₀ = (3GM/Λc²)^{1/3} ≈ 1.1 Mpc (for 10¹² M☉; Chernin 2001) never gathers — the doc's own dead-end B.
- The glossary's "L0 has no deadline, any density clusters given time" required A ≈ 0.
- So A_L0 = floor buys the dissolve-back step but taxes the gathering step. [Fact-eq]
- Decision pending from the user.

### 15f) User's simplification (2026-10-14, same sitting): "L0 is empty space where things pile up — like dry leaves: pile, decompose, compact into soil"

**User statement:** L0 is plain empty space. Things dissolve wherever they are; where dissolutions overlap enough, the region collapses. [Hypo]

This matches the SSOT's "remnants pile into a shallow L0 well" and the stated intent that a new universe forms where debris gathers to threshold. It answers 15e: **A_L0 ≈ 0 (empty)**.

**Ownership (hybrid):**
- Collapse threshold: Jeans, Phil. Trans. A 199, 1 (1902).
- An infinite space with patchy piles and mean density → 0 (avoids Seeliger's 1895 gravitational paradox and Olbers): Charlier (1908, 1922).
- Pitarn layer: the dissolve → pile → collapse loop in L0.

**Brakes:**
1. **Radiation does not pile like leaves.** [Fact-eq] Evaporation output is almost all radiation; it moves at c and overlapping streams pass through each other (γγ crossfire negligible — LOG item 9). Radiation collapses only with overdensity δ ≳ 0.3–0.5 on its own Schwarzschild scale (Carr, ApJ 201, 1 (1975)) — not by gentle accumulation. The "soil" must come from **slow massive debris** (ejected stars, gas, DM) lost before the zone dies.
2. **A uniform static infinite pile is not allowed in GR without Λ.** [Fact-eq] The Einstein static solution needs Λ and is unstable (Eddington 1930); a uniform medium collapses globally. The way through is that piles stay patchy with mean density → 0 (Charlier), which is exactly the leaf-pile picture. Consistent with the SSOT's "shallow, non-collapsing L0 well".

**Consequence of A_L0 ≈ 0:**
- Gathering has no deadline: no zero-gravity radius in L0.
- Dissolve-back works: no Nariai cap, T_bath ≈ 0 (15c numbers).
- **Cost — a doc change, pre-data:** the SSOT/F6 floor V_min = ρ_Λ must be re-read as a quasi-floor inside zones, with the true minimum V = 0 being L0.
  - The CCC/flash reset still has H > 0 inside the dying zone (the reason the SSOT chose dS), provided A's roll from ρ_Λ to 0 is slower than the survivor's ~10¹⁰⁰ yr evaporation. [Hypo]
  - F6's kill line (V_min < 0) is unaffected, but its "not to zero" wording would change. This is a model change and must be logged as such.

**Not applied to any doc.** Awaiting the user's decision on rewording the SSOT/F6 floor.

### 15g) "Dissolved universes radiate in all directions non-stop; the streams cross again and again until, by chance, something builds itself" (2026-10-14, same sitting)

[Hypo, hybrid]

**What changes with A_L0 ≈ 0:**
- In a static L0, photons no longer redshift, so they accumulate instead of being erased.
- LOG item 9's Gate 3 (dS erasure) is gone. Repeated crossing is real. [Fact-eq]

**Owned mechanism — "a bath builds an object by chance":** thermal black-hole nucleation in hot flat space, Gross–Perry–Yaffe, PRD 25, 330 (1982). The rate goes as exp(−B) with B = (T_P/T)²/16π, and the nucleated BH has M = ħc³/(8πGkT).

**Numbers [Fact-eq]:**
- A 1.47×10²² M☉ object radiates at T_H ≈ 4.2×10⁻³⁰ K.
- The energy-weighted mean over its whole evaporation is ×ln(M₀/M_P) = ×138, giving ≈ 5.8×10⁻²⁸ K.
- At that temperature, B ≈ 10¹¹⁷ and the nucleated BH has M ≈ 1×10²⁰ M☉.
- In an eternal, infinite L0 any nonzero rate happens somewhere, so "by chance" is legitimate in principle.

**Brakes:**
1. **No matter from the crossings themselves.** [Fact-eq] kT ≈ 5×10⁻³² eV, which is 10³⁷× below m_e c². Repeated crossing never raises per-photon energy (LOG 9 Gate 1 holds without expansion). Only gravity, acting on total energy, can do it — so what forms is a **black hole** (GPY), not matter directly.
2. **A black hole is not yet an expanding universe.** [Fact-eq] The interior needs a w = −1 region to inflate. Getting one from a BH or fluctuation is Farhi–Guth–Guven tunnelling, NPB 339, 417 (1990) — also exponentially suppressed. The full chain is bath → BH (GPY) → baby universe (FGG), and both steps are owned.
3. **A uniform non-stop bath filling infinite L0 cannot stay static.** [Fact-eq] For radiation, ä/a = −(8πG/3)ρ. The dead-universe population must stay sparse and hierarchical (Charlier, 15f), so "from all directions" holds only up to some scale.
4. **WARNING — the Boltzmann problem** (Dyson–Kleban–Susskind 2002; Albrecht–Sorbo 2004).
   - If "chance" means an equilibrium fluctuation, a 1 kg fluctuation costs e^(−10⁶⁷) while a GPY universe-scale object costs e^(−10¹¹⁷). Small objects are favoured by a factor of e^(10¹¹⁷). [Fact-eq] (both exponents)
   - That this makes our kind of observer atypical is [Hypo]: it depends on the measure, and on whether equilibrium statistics apply to a collisionless bath.
   - **Way out within the user's own picture:** let "chance" be only the seed. Random overdensities from overlapping non-equilibrium streams plus slow debris, then amplified **deterministically** by gravity (Jeans growth, as in 15f), which favours large scales.
   - That is structure formation, not an equilibrium fluctuation, so the Boltzmann weighting does not apply.

**Net:** coherent if "chance" means a seed and gravity grows it; exposed to the Boltzmann problem if "chance" means an equilibrium fluctuation. No doc change.

### 15h) User adopts the seed reading (2026-10-14, same sitting): "butterfly effect — one small nudge knocks it out of stable / formless energy"

**Term precision:**
- The butterfly effect (Lorenz 1963) is sensitive dependence of a chaotic flow on initial conditions.
- What acts here is **gravitational instability** (Jeans 1902). The uniform "formless" state was never stable: above the Jeans scale any nudge grows exponentially. [Fact]

**Why "formless" is not the resting state:** self-gravitating systems have negative heat capacity, so clumping *raises* entropy (Antonov 1962; Lynden-Bell & Wood, MNRAS 138, 495 (1968)). Formless → form is the gravitational arrow, not a violation of it. [Fact]

**Numbers [Fact-eq]:**
- Growth e-folding time is t ≈ 1/√(4πGρ). At today's mean matter density (2.7×10⁻²⁷ kg/m³) this gives ≈ 2×10¹⁰ yr, and it scales as ρ^(−1/2).
- A nudge of δ₀ = 10⁻⁵⁰ needs only ln(10⁵⁰) ≈ 115 e-folds to reach order unity, which is trivial on L0's unbounded clock. So "just a small nudge" is quantitatively right.

**Caveats:**
- In a radiation-dominated bath, pressure stabilises everything below λ_J ~ c/√(Gρ). Only near-horizon-scale nudges grow, and the end product is a BH; the interior still needs a w = −1 region (FGG, 15g).
- Holds only with patchy L0 (15f).

**Ownership:** hybrid — Jeans / Antonov / Lynden-Bell–Wood for the mechanism; Pitarn for the L0 loop (dissolve → stream → seed → gravitational growth → new universe-object). No doc change.

### 15i) Small-lump path (2026-10-14, same sitting): "small masses curve spacetime a little, attract passers-by like magnetic beads, accumulate, flow faster — but never reach universe-making; they just grow and flow faster"

[Hypo]

**What holds:**
- **Bigger grows faster:** Bondi–Hoyle–Lyttleton accretion, Ṁ ∝ M²/(v² + c_s²)^{3/2} (Hoyle–Lyttleton 1939; Bondi–Hoyle 1944; Bondi 1952). Gravitational focusing gives runaway growth (Safronov 1969; Wetherill–Stewart 1989). [Fact-eq]
- **More mass alone never makes a universe.** Compacting to r_s gives a black hole of any mass; an expanding interior needs a w = −1 region (15g). The small-lump path is therefore the L4 → L1 ladder re-forming inside L0. [Fact-eq]

**Brake — magnetic-bead analogy:**
- Beads stick because contact dissipates energy.
- Under gravity alone, two bodies passing on an unbound orbit (E = ½μv² − Gm₁m₂/r > 0) stay unbound, since energy is conserved. [Fact-eq]
- Capture needs a sink:
  - gas collisions plus radiative cooling (baryons);
  - a third body;
  - dynamical friction (Chandrasekhar 1943);
  - gravitational-wave capture (compact objects only).
- Collisionless DM cannot stick pairwise; it binds only through collective collapse (violent relaxation, Lynden-Bell 1967).

**Minor clarification [Fact]:** attraction is not "built up gradually". A mass's field is set by the mass present, propagating at c; what grows gradually is the accumulated mass.

**Ownership:** hybrid (accretion and dynamics owned; the L0 small-lump reading is Pitarn's). No doc change.

### 15j) Evidence tiering of the 15c–15i loop (2026-10-14, same sitting) — "is it doable, by the evidence?"

**Verdict:** after the brakes above, no step is forbidden by known physics. Evidence covers only the within-aeon steps; the L0 steps are theory-allowed but unmeasured, and mostly unmeasurable in principle (beyond our horizon).

**Tier 1 — measured [Fact]:**
- Tiny seeds grow into structure under gravity: CMB δ ~ 10⁻⁵ (Planck 2018) → galaxies and BAO.
- Hierarchical merging and BH growth: LVK mergers incl. GW231123; PTA background (NANOGrav 2023 and partners); JWST over-massive BHs.
- Accretion onto SMBHs (AGN).

**Tier 2 — established theory, never measured directly [Fact-eq / theory]:**
- Hawking evaporation. Only lab analogues exist: Steinhauer, Nat. Phys. 12, 959 (2016); Muñoz de Nova et al., Nature 569, 688 (2019).
- Thermal BH nucleation (Gross–Perry–Yaffe 1982).
- Baby universes behind BH horizons (Sato et al. 1981; Blau–Guendelman–Guth 1987; Farhi–Guth–Guven 1990).
- Per-zone thawing A: the field equations are standard. Data are consistent but not confirmatory — DESI DR2 2.8–4.2σ evolving-DE hint; thawing ≡ ΛCDM in evidence terms (Dinda–Maartens–Saito 2026).

**Tier 3 — hypothesis, no evidence [Hypo]:**
- Our universe as a rotating collapsed object seen from L0. No rotation has been detected (Saadeh 2016); the Shamir 2025 spin asymmetry is contested.
- Travel and dissolution in L0.
- L0 as empty space with patchy piles.

**Not evidence (honesty pin):** the Pathria coincidence r_s(M_H) = c/H is an identity of any flat FRW universe at every epoch, since ρ = ρ_c = 3H²/8πG. [Fact-eq]

**Testable doors remain the within-aeon falsifiers** (F1, F2, F4, F5), per OPEN_PROBLEMS §4.

---

## 16) Watch sweep + user-idea grading (2026-11-15): window 2026-10-14 → 11-15 — one F1 pressure item, one contested anchor, five missed papers; no falsifier moved. Then the "U1 expands through a collapse along the 4th spatial dimension of U0" picture, graded

Solo sweep (head only; WebSearch/WebFetch). Absence from the docs grep-verified against the V3.29 text + LOG items 1–14. Claims checked at abstract / press / search-snippet level; **journal status of preprints NOT checked** — pin before any `.tex` use. Naming: this item uses **U0** (V3.30); items ≤ 15 say L0 for the same object.

**(a) F1 — dark energy**
- **Özülker, Di Valentino & Giarè, "Quantifying and testing the evidence for a phantom crossing"**, Phys. Rev. D, *accepted 2026-10-29* (DOI 10.1103/x55b-1cfv; the accepted-paper page could not be fetched — read from the abstract in the search result). CPL fits to CMB + BAO + SNe Ia exclude ΛCDM at ≳ 3σ; **"no crossing anywhere in the expansion history" is excluded at 3.1σ–5.2σ**; two crossing-forbidden CPL variants (CPL>a_c, CPL<a_c — thawing-like and freezing-like) are tested: the thawing-like one does not match CPL, a freezing phantom-like one comes close only in a few combinations; standard CPL is best everywhere. **R9 pending:** probably the journal version of arXiv:2506.19053 (Giarè et al., "Dark Energy Crosses the Line…") — not confirmed. [Fact] the numbers / [Hypo] that the crossing is physical.
  - *Doc impact:* the most adverse F1-side result so far for the thawing spine. **F1 does not fire** on the registered wording: (i) DR2, not DESI-Y5; (ii) the alternatives are still CPL-family parametrisations, not a physical non-CPL reanalysis; (iii) the SN-compilation spread is unresolved (next bullet). Pressure up, threshold untouched.
- **Zhang (single author, independent), MNRAS 552, stag1868 (published 2026-09-30)** — truncation test: drop SNe below z_cut, refit CPL with DESI DR2 BAO + Planck 2018. DES-Dovekie 2.9σ → ~1.1–1.6σ for z_cut ≥ 0.08; DESY5 4.0σ → ~1.4–1.9σ; Pantheon+ flat at ~2.0–2.5σ. Decomposition: Δχ² ≈ 7.6 photometric calibration, ≈ 7.4 other low-z effects, ≈ 4 residual surviving removal of all z ≤ 0.12 SNe. Conclusion: not calibration alone; the ~2σ remainder is either real evolution or a shared SN-standardisation systematic. Does not analyse crossing. Neutral for F1; weakens "it is all SN calibration". [Fact] (published; in the item-15 window, missed there).
- Rippentrop, Ishak & Gonzalez, arXiv:2608.25278 — already logged (item 13).
- **Timelines.** DESI finished its planned five-year survey 2026-04-15; first five-year dark-energy results "expected in 2027" (LBNL release via phys.org); DR3 public release late 2026 / early 2027 (DOE HEP slide, Dec 2025). **Euclid DR1-Foundation was released ~2026-11-11/12 with no cosmology; no official Euclid cosmology before mid-2027** (P. Coles' blog, 2026-11-12) — confirms 15(e). F1 and the F6 watch-line stay pending.

**(b) Anchor — high-z over-massive BHs (the read-across at V3.30 `tex:1559`)**
- **Sun, Naidu et al., arXiv:2609.09274 (2026-09-08, v1 preprint), "Overmassive No More…"** — LRD continua modelled as a pseudo-photosphere ("BH*"); four non-virial mass estimates (surface gravity, super-Eddington analogy, escape velocity, variability bound) agree on **~10⁴–10⁵ M☉** for the typical object, inside the scatter of the local M_BH–M_* relation; offered as the alternative to "2–3 dex over-massive". [Fact] they claim it / [Hypo] which mass scale is right.
- **Nature (2026), s41586-025-09900-4, "Little red dots as young supermassive black holes in dense ionized cocoons"** (first author Rusakov per press coverage — **not pinned on the paper page**): broad lines are electron-scattering wings on narrow cores → M_BH ~10⁵–10⁷ M☉, ~100× below earlier virial values. Not in the docs before this item.
- **Counterweight:** a direct (gas-dynamical) mass in an LRD seen ~700 Myr after the bang, Nature 2026-05-27, agreeing with the earlier indirect estimate (Live Science summary). **R9 pending:** very likely the Juodžbalis et al. 2026 (A2744-QSO1) paper the docs already cite — not confirmed this sitting.
- *Doc impact:* the **population-level** over-massive claim (Maiolino et al. 2024 row) is now contested by two independent mass re-derivations; what stands is **one** direct measurement (R2: n too small for a cross-cosmic-time pattern). The relic-six local anchor (dynamical masses) is untouched. **Candidate action, NOT applied:** flag the row "contested (virial scale)" and rest the read-across on the direct measurement only.

**(c) F2 — M87 row.** Conroy, Bauböck, Bernshteyn, Tiede, Joshi, Prather & Gammie, arXiv:2606.11322 (v2 2026-09-30; journal status not shown): ring brightness-asymmetry position angle + magnitude "mildly disfavor low-magnitude spins" and "strongly disfavor" spin vectors pointing toward Earth; no σ quoted. A third method next to Drew et al. 2025 and the polarimetry line (15c). Row stays [Open — contested]. [Fact] (preprint).

**(d) Ladder / GW231123 (looked-at, not load-bearing).** Plunkett, Callister, Zevin & Vitale, PRL 137, 021404 (2026-07-06): decisive evidence for a transition at m₁ = 46.2 (+12.6/−7.2) M☉ above which the BBH population is almost entirely hierarchical; companion Banagiri, Thrane & Lasky, PRL 137, 021403. Supports the "merger-built" tag. Stellar-mass scale only — the read-across to the SMBH ladder is [Hypo]. Published before 3.29 shipped; missed until now.

**(e) CCBH — context only.** Calzà, Pedrotti, Rinaldi & Vagnozzi, "Evaporating cosmologically coupled black holes", PRD 114, 084014 (2026-10-05), arXiv:2607.13857: cosmological coupling keeps a hole away from the evaporation end-point for longer. Consistent with the Fork-Y finding (V3.3/V3.4 era) that the coupling has to be off before the flash; in the current text CCBH is "the rival strengthened, still scoped off" (V3.30 `tex:1573`). Missed by item 15(g), which listed two CCBH theory papers only. No doc change.

**(f) Swept, nothing new found:** no new r bound (F4); nothing new on Hawking points (F5); no new DESI cosmology release.

**(g) Housekeeping.** V3.30 (L0 → U0) built on 2026-11-01 had not been pushed; it enters the repo with this item. The 2026-10-14 block was written as "item 13" against a project copy that lacked items 13–14; it is filed above as **item 15**. Still open from 15f / 15b, unchanged: the F6 wording vs the author's A-U0 = 0, and the F1 scoring note for coupled-sector crossings — both await the author. The first is a wording-consistency note on a field-wide question (SSOT), not a new LMU knot.

---

### 16b) User ideas (2026-11-15, one sitting), graded. Numbers: `code/u0_collapse_checks.py` (runnable)

Citations marked † were given from recall and **not re-verified at a primary source this sitting** — pin before any `.tex` use. Unmarked ones were checked (abstract / publisher page).

**1. "Our sub-universe expands *through* the collapse — that is why most things run the same way; the few running against it come from another collapse passing through; close passers merge and the stronger one sets the direction."** [Hypo]
- *Brake, in-space reading [Fact-eq]:* if the collapse direction lies inside our three dimensions the sky pattern is wrong. Free-fall flow v = √(2GM/r) gives H_radial = +½√(2GM/r³), H_transverse = −√(2GM/r³) = −2 H_radial: redshift only within 35.3° of the infall axis = **18.4% of the sky**, blueshift on the other 81.6%. A self-collapsing uniform ball (Oppenheimer–Snyder 1939†) is isotropic but has H < 0. Measured: redshift in every direction; anisotropic expansion disfavoured 121,000:1 (Saadeh et al., PRL 117, 131302 (2016)).
- *"Most run the same way", as measured [Fact]:* bulk flow 395 ± 29 km/s in a 150 h⁻¹ Mpc sphere vs 139 km/s expected (Watkins et al., MNRAS 524, 1885 (2023)) = **2.6%** of the Hubble velocity at that depth; contested downward (315 ± 40 km/s, ~1.7σ: Courtois et al. 2025, as summarised in arXiv:2608.14265). A small correction on isotropic recession, and it has ordinary competitors (Shapley; the KBC/HBK void watch-line).
- *User's resolution: the motion is along the **4th spatial dimension** of U0* (U0 = 4+1). Then no direction is picked out on our sky and the brake does not apply. **Owner:** Pourhasan, Afshordi & Mann, JCAP 04 (2014) 005 (arXiv:1309.1487) — a 4D star collapses to a black hole and our universe is a spherical 3-brane outside its 3D horizon. The U0/U1 arrangement is the author's → **hybrid**.
- *Condition it must meet [Fact]:* gravity is not seen leaking off three dimensions — D = 4.02 (+0.07/−0.10) or 3.98 (+0.07/−0.09) from GW170817, screening scale ≳ 20 Mpc (Pardo, Fishbach, Holz & Spergel, JCAP 07 (2018) 048); inverse-square law holds from 52 µm to 3 mm (Lee et al., PRL 124, 101101 (2020)). So the 4th spatial dimension needs a confinement mechanism with an owner: Randall–Sundrum 1999† (warped) or Dvali–Gabadadze–Porrati 2000† (the one PAM uses).
- *"Counter-movers come from another collapse":* nearest owners are the bubble-collision searches — none found (N̄_s < 1.6 at 68%: Feeney, Johnson, Mortlock & Peiris, PRL 107, 071301 (2011)) — and Gpc-scale bulk flow — none found, < 254 km/s at 95% (Planck intermediate results XIII, A&A 561, A97 (2014)). Blueshifted galaxies are local and gravitationally explained. [Hypo], no evidence.
- *Merge direction:* momentum conservation, v = (m₁v₁ + m₂v₂)/(m₁ + m₂). [Fact-eq]

**2. "Every mass in U0, sub-universes included, bends spacetime, more or less by its mass; small ones barely feel the collapse and ride the big one's."** Standard GR + the equivalence principle (Einstein 1915†) — [Fact], no new origination. Two precisions: what a body *feels* in free fall is the tide, Δa = 2GM·d/r³, set by its **size** d, not its mass [Fact-eq]; and if "twist" means frame dragging it scales with angular momentum, not mass (Lense–Thirring 1918†; Gravity Probe B 2011†).

**3. "Every object has its own timeline; the last level is the time inside atoms or smaller; the central time is U0's."**
- Proper time per worldline — [Fact].
- "Last level" has an owner: a massive particle is a clock, ν = mc²/h (de Broglie 1924†); electron 1.236×10²⁰ Hz [Fact-eq]. **Precision:** massless quanta have dτ = 0 — no timeline; write "every *massive* object".
- Link to the U1 end-state: Penrose's CCC argument (no mass → no clock)† is the owner of "the internal time of U1 lapses and only U0's remains". Known weak spot inherited with it: protons and electrons have never been seen to decay (Super-Kamiokande proton-lifetime limits > 10³⁴ yr† — exact figure not pinned).
- U0 central time = the postulated foliation already in the ledger [Hypo]; unmeasurable, as the author states. Tie; proceeds.

**4. "The 11 dimensions physicists talk about — are they collapse dimensions inside nested black holes?"** No. 11 = 10 space + 1 time from 11-dimensional supergravity (Cremmer, Julia & Scherk 1978†) and M-theory (Witten 1995†); 11 is the supergravity ceiling (Nahm 1978†); the extra ones are compactified at every point (Kaluza 1921†; Klein 1926†). [Hypo] status — no measurement. Nested black-hole universes are a separate literature (Pathria 1972; Smolin 1992; Popławski 2010) and stay 3+1 at every level. "One nesting = one more dimension" has no owner known to the auditor; if kept it is the author's own [Hypo] and must not be presented as the string-theory count.

**5. Analogy: "a bubble skin pressed until it dimples, pops through, rounds into a sphere, then spreads in all directions like a drop in a pond."** Step-by-step owners: neck pinch-off = Rayleigh–Plateau (Plateau 1873†; Rayleigh 1878†) and its gravitational twin, the Gregory–Laflamme instability (1993†; shown to be the same instability by Cardoso & Dias 2006†; simulated to a chain of spherical black holes by Lehner & Pretorius 2010†); the pinched-off baby universe = Blau, Guendelman & Guth 1987; "rounds into a sphere" = Young–Laplace, Δp = 2γ/R, in GR the Israel junction conditions (1966†); "a growing brane radius is isotropic expansion for those inside" = Kraus 1999†; Kehagias & Kiritsis 1999† (mirage cosmology). The term the author was missing for "surface tension of spacetime": **brane tension**.
- *Brake [Fact-eq]:* tension only pulls inward (Δp = 2γ/R). A pond ripple is a surface wave, not the drop growing. Expansion needs the inside to out-push the wall.

**6. "U0 itself has no surface tension — when enough energy gathers it simply collapses."** Accepted; simpler. Owners: hoop conjecture (Thorne 1972†); 4+1 horizon radius r_s² = 8G₅M/(3πc²) (Tangherlini 1963†); threshold behaviour with a massless field (Choptuik 1993†).
- *The tension does not leave the model, it moves to the wall of U1 [Fact-eq]:* any boundary across which A differs carries σ = ∫√(2V(A)) dA > 0 (Coleman 1977†). With A(U1) > 0 and A-U0 = 0 the wall tension is automatic, and the author's end-state ("U1 dissolves once its inner energy loses to the tension") stands with the tension re-assigned from U0 to U1's wall.
- *Brake [Fact-eq]:* pure 4+1 collapse does give an isotropic 3-space (the S³ of radius r inside a Tangherlini horizon) but it **shrinks**, r_s → 0 in proper time τ = r_s/c — blueshift everywhere. The expanding twin is the time-reversed (white-hole) branch, unreachable from collapse without a bounce. So the expansion must come from A > 0 inside. **[Open]: how the collapse loads A > 0.** Quantum-side owners for that slot: Frolov, Markov & Mukhanov, PRD 41, 383 (1990) (limiting curvature → de Sitter interior; passes through a deflation stage — the author must rule whether that counts as the forbidden bounce) and Farhi, Guth & Guven 1990 (tunnelling; item 15g). Farhi & Guth 1987† (no classical route from non-singular data) is proved in 3+1; its transfer to a brane in 4+1 was not checked → [Hypo], no brake.

**7. "What if, once collapsed, it travels as a spinning doughnut?"** It exists, and only in 4+1: the black ring (Emparan & Reall 2002†); a ring horizon is forbidden in 3+1 (Hawking 1972†). The pond analogy is literal — a drop falling into water becomes a travelling vortex ring (Thomson & Newall 1885†). Hybrid.
- *Item 14 still closes rotation as the engine:* ω/H₀ = 1.43 needed vs (σ_V/H)₀ < 4.7×10⁻¹¹; and ω ∝ a⁻² puts it at the wrong epoch. The same scaling helps the shape-only reading: birth spin dilutes below every bound and is unobservable from inside — the existing C5 line.
- Item 14(ii) (accumulation cannot reach collapse) was priced on the de Sitter floor; under A-U0 = 0 that wall lifts (15f) — pending the F6 wording decision, not re-derived here.
- *Brakes on the ring itself:* unstable — thin rings pinch into beads, fat ones collapse to a sphere (Santos & Way 2015†; Figueras, Kunesch & Tunyasuvunakool 2016†) [Fact, numerical]; lifetime relative to U1's age not computed. Spin does not propel it (linear momentum is conserved; 15c). It does not address the expansion problem.

**8. "The doughnut is only the starter: it sets the sub-universe expanding in all directions and then dissolves."** Coherent with the instability above. Chain with owners: ring (Emparan–Reall†) → pinch-off, where curvature grows without bound in finite time (Figueras et al. 2016†; Lehner–Pretorius 2010†) [Fact, numerical] → the pinch as a candidate ignition point, where classical GR ends and FMM's de Sitter transition could set A > 0 [Hypo — this is the open slot of idea 6, now with a location] → isotropy from the A > 0 phase, not from the ring (cosmic no-hair, Wald 1983 — already cited in the docs; proved for 3+1 homogeneous models, transfer to 4+1 unchecked) → fragments round off and evaporate. Hybrid; the "ring = igniter" wiring is the author's.

**9. "The flash is part of the ignition — mass has to be made before it starts to collapse."** Re-worded, it holds: the flash is the fuel supply, not something the U0 route replaces.
- *Precision 1 [Fact-eq]:* the flash makes almost no rest mass. kT_H = ħc³/(8πGM) reaches m_e c² only at M ≈ 2.07×10¹⁶ g; for a 10¹¹ M☉ survivor that is the last **1.0×10⁻²⁸** of its energy. Everything earlier leaves as radiation, and radiation crossing itself in U0 does not mint matter (item 9).
- *Precision 2 [Fact-eq]:* collapse does not need rest mass — all energy gravitates; Choptuik's threshold collapse used a massless field. Correct sentence: "the flash feeds energy into U0; once enough has gathered, collapse starts".
- *Standing conditions (15f–15h):* radiation does not pile like leaves — it needs δ ≳ 0.3–0.5 on its own horizon scale (Carr 1975†); A-U0 = 0 removes the redshift erasure so accumulation has no deadline; U0 must stay patchy (Charlier†) or it collapses as a whole.

**Chain as it stands after this sitting** (all [Hypo]; mechanism = owners', wiring = author's): L1 evaporates → flash → energy into U0 → gathers to threshold → collapse along the 4th spatial dimension → transient spinning ring → pinch-off = ignition (A > 0) → U1 expands isotropically, wall tension σ > 0 → A thaws → tension wins → U1 dissolves back into U0.

**Doc consequence — recorded, NOT applied.** Intra-U1 physics (ladder, F1, F2, F4, F5) is untouched and the flash is kept. What this route would change is the joint *after* the flash: the registered reset (deterministic flash acting on the plateau, with ω = the prior aeon's conformal factor as the inflaton) would become one joint option beside "flash → U0 → collapse → ignition", and the conformal-gluing items (G1/G2) would attach to the former only. `LMU_V4_0_BUILD_SPEC.md` already drafts a selectable-joint layer that could host it. That is an architecture decision for the author, not a wording edit; no `.tex`, falsifier, or SSOT line was changed.

**Net:** no falsifier moved; F1 pressure up (Özülker et al.); one anchor row to flag (LRD mass scale); five papers added to the watch record; the U0-collapse birth picture is coherent as a hybrid with one open slot (how collapse loads A > 0) and one hard condition (gravity confined to three dimensions).

---

## 17) Second sitting (2026-11-15, evening): photons and neutrinos as the end-products, pair creation in a photon pile, a forward gap-finder for the U0 birth chain, and three author replies graded — no falsifier moved, no `.tex` touched

*Filed 2026-11-15, same day as item 16. Conversational grading, head only. Scripts: `code/u0_photon_neutrino_checks.py` (numbers, ALL PASS) and `code/u0_chain_gapfinder.py` (the chain run link by link). Citations marked † were given from recall and **not re-verified at a primary source this sitting** — pin before any `.tex` use; unmarked ones were checked at abstract / publisher level.*

### 17a) "If a neutrino decays, what comes out?"
- Never observed. [Fact]
- Standard Model: a heavier mass state → a lighter one + a photon, ν_i → ν_f + γ, with τ ≃ 6.2×10⁴³ s · (eV/m_i)⁵ / (|U_τi|²|U_τf|²) (Giunti & Studenikin, arXiv:1403.6344, eq. 5.10). With a mixing factor ~0.1 (order only, not pinned): ν₃ (m ≥ 0.05 eV) ~6×10⁴³ yr; ν₂ (m ≥ 0.0087 eV) ~4×10⁴⁷ yr. Photon from ν₃ → ν₁: ~0.025 eV, ~50 µm. [Fact-eq, order of magnitude]
- Beyond the SM: ν_i → ν_f + a massless invisible boson ("invisible decay"). [Hypo]
- The lightest state cannot decay: it is the lightest fermion and angular momentum needs a fermion in the final state. Its mass is unmeasured (oscillations give only differences) and may be zero. [Fact-theory]
- Bounds: radiative, τ > few×10¹⁹ – 5×10²⁰ s from the COBE/FIRAS spectrum (Mirizzi, Montanino & Serpico, PRD 76, 053007 (2007)); invisible, τ₀ ≳ (4×10⁵ – 4×10⁶)(m_ν/50 meV)⁵ s from Planck 2018 free-streaming (arXiv:2203.09075). Measured bounds sit > 30 orders below the SM prediction.
- *Auditor's linkage to 16b-3 [Hypo]:* relic neutrinos are massive clocks that outlive black-hole evaporation; SM decay (10⁴⁴–10⁴⁸ yr) is far shorter than the survivor's ~10¹⁰⁰ yr, so by the flash only the lightest state is left, and whether any clock remains reduces to one unmeasured number — is the lightest mass zero.

### 17b) "Then photons come from light — light decays?"
- A photon *is* the quantum of light, not a decay product of it. A massless photon cannot decay: stability in QED is purely kinematic, and dτ = 0. [Fact-theory]
- If it had a mass at the experimental ceiling (< 10⁻¹⁸ eV) it could decay; the CMB blackbody shape then gives a rest-frame lifetime > 3 yr, i.e. ≥ 10¹⁸ yr for visible light in our frame (Heeck, PRL 111, 021801 (2013)). [Fact]
- What light does do, none of it decay: redshift under expansion (absent in an A = 0 U0); two-photon pair creation above threshold; no single-photon splitting in vacuum (energy–momentum). "Tired light" (Zwicky 1929†) is excluded by supernova time dilation and the CMB spectrum†.

### 17c) "In the U0 basin, piled-up photons keep a chance of making electrons, because with A = 0 they can pile"
- *Collision channel — still closed [Fact-eq]:* piling raises the number of photons, not the energy of each. E₁E₂ ≈ (5.0×10⁻³² eV)² vs threshold 2(m_e c²)² = 5.2×10¹¹ eV²: 74 orders short. Gate 1 of item 9 stands with or without expansion.
- *Field channel — open in principle; not covered by item 9.* A dense superposition of very soft photons is a classical field, and field strength does grow with the pile. Pair creation from the vacuum goes as exp(−πE_c/E), E_c = m_e²c³/(eħ) = 1.32×10¹⁸ V/m (Sauter 1931†; Heisenberg & Euler 1936†; Schwinger 1951†; never yet observed in vacuum). Numbers: a pile as dense as today's CMB has E_rms = 0.069 V/m → exponent 6×10¹⁹; reaching E_c needs 1.55×10²⁵ J/m³ = 1.7×10⁸ kg/m³, and a region at that density larger than ~9.7×10⁸ m (3.3×10⁵ M☉) is already inside its own horizon. [Fact-eq]
- *Owned dividing line:* below that scale concentrated light turns into pairs instead of a black hole — radii 10⁻²⁹ to 10⁸ m (Álvarez-Domínguez, Garay, Martín-Martínez & Polo-Gómez, PRL 133, 041401 (2024)); disputed for rapidly varying inflow (Page, PRL 135, 261402 (2025)). So: small piles → pair fireball; universe-scale piles → horizon first.
- *Standing conditions:* radiation does not compress itself (only gravity gets it to 10⁸ kg/m³); pairs come out as equal e⁺e⁻, so no net matter (item 10); bulk electrons still come thermally once collapse heats the gas to m_e c²/k = 5.9×10⁹ K — consistent with dead-end B.
- **Correction to 16b-9:** "radiation crossing itself in U0 does not mint matter (item 9)" is true of the collision channel only. The field channel exists and was not priced before this item.

### 17d) "The first instant of the Big Bang, as we know it, is a blinding flash — so photons must have done something"
- Not what is measured. The oldest light seen is the CMB (~380,000 yr, ~3000 K); the earliest tested epoch is light-element synthesis (~1 s – 3 min); nothing earlier is observed. The picture is a heat bath filling space, not a flash from a point. [Fact]
- The photon does not exist as a separate particle above the electroweak scale (~160 GeV, ~10⁻¹¹ s) (Glashow, Weinberg, Salam†). In the standard picture photons are a *product* of reheating (Dolgov & Linde 1982†; Abbott, Farhi & Wise 1982†; Kofman, Linde & Starobinsky 1994†), not its cause. [Fact-theory / Hypo at the inflation level]
- For the author's chain: with the documents' own 60–85 e-folds, pre-existing radiation is diluted by e^(−240) ≈ 10⁻¹⁰⁴ [Fact-eq]. Old photons are fuel (their total energy drives the collapse); the bright bath is new photons from the decay of A. A direct "old photons = the hot bath" reading fails twice: compressed radiation is contracting [Fact-eq], and it would drop the inflation the documents use for flatness [Fact, by the text].

### 17e) "Can you infer the birth of the universe from everything known?"
No — and combining fields adds no evidence. What data force (hot phase ≥ MeV; flat and smooth; ~10⁻⁵ near-scale-invariant seeds already present on super-horizon scales; the baryon excess; no primordial tensor signal yet) fixes a *pre-hot phase*, not its identity; direct tests stop at ~1 s, laboratory physics at ~10⁻¹³ s. Surviving families (all [Hypo]; owners given in chat from recall): inflation from an unknown initial state; bounce; conformal cyclic; from-nothing; bubble in an eternally inflating parent; black-hole interior / brane. No data-based reason to rank them. The U0 chain sits in the last family plus the documents' inflation; its U0 part is beyond the horizon by construction — the lens statement the documents already make.

### 17f) Forward gap-finder — "use my ideas as variables in existing equations and see what is missing" (`code/u0_chain_gapfinder.py`, 3+1 throughout)
| Link | Verdict | Number | Owner |
|---|---|---|---|
| A. flash feeds U0 | PASS | 10¹¹ M☉ survivor: T_H = 6.2×10⁻¹⁹ K, λ ≈ 15.8 r_s, 2.1×10¹⁰⁰ yr | Hawking 1974†; Page 1976† |
| B. pile mass at threshold | NEEDS INPUT | ρ_U0 = 10⁻³⁰ / 10⁻²⁷ / 10⁻²⁰ kg/m³ → 4.3×10²⁴ / 1.4×10²³ / 4.3×10¹⁹ M☉ | Schwarzschild 1916† |
| C1. compression to ignition density | PASS | ρ_inf = 1.1×10⁸⁴ kg/m³ (V^¼ = 8.3×10¹⁵ GeV at r = 0.0037); 111 orders short at the horizon, supplied inside it | Oppenheimer–Snyder 1939† |
| C2. radiation → vacuum energy (A > 0) | **GAP** | at ρ_inf the gas is still w = +⅓ (kT = 3.4×10¹⁵ GeV) | candidates: Frolov–Markov–Mukhanov 1990; Farhi–Guth–Guven 1990† |
| D. energy the seed needs | PASS | one inflating Hubble patch = **8.2 g** | Guth 1981†; Farhi–Guth 1987† |
| E1. energy back to U0 | PASS | exterior mass returned exactly | Hawking 1974† |
| E2. entropy growth of U0 | PASS (after 17g) | seed 1.8×10¹² k_B vs pile 2.1×10¹²³ k_B | Carroll & Chen 2004† |
| E2b. fuel softening / floor on pile mass | **GAP** (hangs on E3) | floor ≈ 15.8 × the smallest hole feeding U0 | — |
| E3. "U1 dissolves back into U0" | **GAP** | U0 only ever receives the exterior mass | — |
| F. the 4+1 layer | NEEDS INPUT | no G₅ / crossover scale, wall tension σ, or V(A) fixed | only bound: screening scale ≳ 20 Mpc (Pardo et al. 2018) |

Readings: (1) the amount of fuel is not the constraint — grams suffice; density and the *form* of the energy are. (2) C2 is the same kind of knot the SSOT already keeps as the single LMU-specific one (what puts the field on the plateau); the U0 route relocates it to the pinch, it does not add a new kind. (3) The Schwinger fork of 17c does not arise in a dilute U0: every threshold pile is far above 3×10⁵ M☉ unless ρ_U0 > 1.8×10⁹ kg/m³.

### 17g) Author replies — accepted
- *"Entropy can go up forever; a newborn takes only its starting entropy; the dead ones hand theirs to U0; entropy runs along with time, without end."* Owner of the same structure: Carroll & Chen 2004† (unbounded entropy in an infinite arena; new universes as small low-entropy starts). Numbers support "takes only its starting entropy": seed/pile = 10⁻¹¹¹ [Fact-eq]. This also answers the relocated Problem A at the level of bookkeeping — the hot low-entropy start is a gram-scale piece, not the whole remnant. "Entropy runs with time" is the τ_aeon reading applied to U0 → hybrid. **The E2 "steady state" demand is withdrawn.**
- *"The pile need not be the same pile nor the same size each time; only a minimum exists, the rest is timing."* Accepted; the minimum has a number: a pile must be larger than the wavelength it holds → ≥ 1.6×10¹² M☉ for flash photons from a 10¹¹ M☉ survivor (15.8 × M_L1) [Fact-eq, order]. Pile mass becomes a distribution with a floor. **Condition:** the floor stays put only if hard radiation from U1's interior survivors actually reaches U0; if U0 receives only the exterior hole's radiation the fuel softens each round and the floor creeps up. E3 decides it.

### 17h) Author reply — braked: *"at birth it may well press in; contracting it heats; then it bangs"*
[Fact-eq] Hot radiation accelerates the contraction: ä/a = −(8πG/3)ρ < 0 for every ρ > 0, and ρ ∝ a⁻⁴ grows as it shrinks; vacuum energy placed by heat stays constant while the radiation outgrows it. The same material turning round is a bounce by definition; the owned ways to get one (loop quantum cosmology, Ashtekar–Pawlowski–Singh 2006; torsion, Popławski 2010/2012) are the K7/K8 fork — and 15c records the author's rule "no rebound anywhere". The two cannot both stand. **Author's decision pending:** allow a bounce at birth (rule narrows to "no rebound at the end"), or keep the rule and drop "heats, then bangs". The non-bounce route remains the interior gram-scale ignition, in which heat is not the igniter.

### 17i) Author idea: *"only the core contracts; it makes an energy source so the surroundings build themselves, and it spreads outward in one sweep — so it looks like everything expands together; what has not been swept yet sits still; the energy was already floating there, waiting"*
- **Owner, exactly:** the Coleman–De Luccia bubble (1980†). From outside: a front spreading from one point at nearly c, unswept regions untouched. From inside: a homogeneous universe with no centre in which the bang is simultaneous everywhere — the inside "same moment" is a surface that chases the wall. Bubble universes built on it: Gott 1982†; Bucher, Goldhaber & Turok 1995†. The author's sentence is correct in that model. Hybrid.
- **Brake [Fact-eq]:** the front runs by itself only if the outside holds latent energy: wall cost 4πR²σ against volume gain (4π/3)R³ε, growth for R > 3σ/ε, requiring ε = V_out − V_in > 0 (Coleman 1977†). Radiation floating in U0 is ash, not fuel (5×10⁻³² eV per photon; converting it to matter costs energy).
- **Three ways out, each priced:** (1) latent energy = vacuum energy of U0 → the front works, but U0 then expands (H² = 8πGV/3), contradicting A-U0 = 0 and the still basin, losing debris accumulation (dead-end B), and turning the picture into eternal inflation (Vilenkin 1983†; Linde 1986†). (2) Keep A-U0 = 0 and a still U0 → no front into U0; birth stays the interior ignition, and those inside still see expansion everywhere at once, so the thing to be explained survives. (3) Read it as an explosion with coasting ejecta → Milne 1935†, excluded by flatness and helium. **Author's decision pending** between (1) and (2).

### 17j) Author inference: *"so light must carry some energy we do not know yet; a neutrino keeps splitting into smaller neutrinos plus a photon and an unknown bond; so the neutrino is tied to light, and does something that lets it pass through all matter"*
- *Hidden energy in light:* none seen; E = hν accounts for it and no photon substructure is known. [Fact] / the hidden part [Hypo, no evidence].
- *Endless splitting:* there are three light neutrino states (invisible Z width at LEP†; N_eff from the CMB†), so the chain is ν₃ → ν₂ → ν₁ and stops. Decay is a transformation through a loop of known particles (W boson + charged lepton), not the release of a constituent; the photon's energy is the mass difference, (m_i² − m_f²)c²/2m_i. No unknown bond is needed. [Fact-theory]
- *Tie to light:* real but indirect — photon, W and Z are one electroweak family†. The neutrino has no electric charge, so it does not couple to the photon directly; that absence, plus the heaviness of W/Z (80–91 GeV) which suppresses the weak force at low energy, is why it passes through. It is what the neutrino lacks, not something it does. Numbers (cross-sections from recall, order only): at 1 MeV in lead, neutrino mean free path ~43 light-years vs ~1.2 cm for a photon — 19.5 orders. [Fact-eq, order] Not unstoppable: at TeV–PeV energies the Earth absorbs neutrinos (IceCube 2017†).

### Net of item 17
- Chain as of this item: L1 flash → energy into a still, A = 0 U0 (entropy unbounded, 17g) → piles above a floor (~16 × the smallest feeding hole) → horizon → **[GAP C2] conversion to A > 0 at gram scale** → inflation erases the old photons, A's decay makes the hot bath → exterior hole returns its mass to U0 → **[GAP E3] how U1's interior content gets back**.
- Withdrawn: the steady-state demand on U0. Corrected: 16b-9 (field channel). Braked: "heats, then bangs" (17h); a self-propagating front into an A = 0 U0 (17i).
- Awaiting the author: bounce at birth or not (17h); latent energy in U0 or not (17i); a value or range for ρ_U0; the 4+1 numbers. Unchanged from item 16: the joint architecture question, the F6 wording, the F1 scoring note.
- No `.tex`, falsifier, or SSOT line changed.

---

## 18) Collision check of the 2026-11-15 ideas (items 16b, 17) against the dead-end registers — DEAD / PARKED / LIVE

*Filed 2026-11-15 at the author's request ("does anything hit the dead-end log? add what does not; put the dead ones under dead"). Registers checked: Part VIII §2 "Dead-end pointers" of the consolidated `.tex` (V3.30 lines 1355–1388, read by entry, not whole-file), OPEN_PROBLEMS §7–§8, the SSOT spine choices (`review/LMU_SYNTHESIS_2026-07-07.md` §2), and LOG items 9, 10, 14.*

**Auditor error, recorded.** Items 16b and 17 graded the U0-collapse birth chain as "coherent as a hybrid with one open slot" after checking only the memory copy of the dead-end log and item 14. Part VIII §2 was not opened until this item. It already closes most of the chain. The standing rule (check the dead-end pointers before extending anything) was not followed; the verdicts below supersede the "Net" lines of 16b and 17 wherever they differ.

### A. DEAD — re-entered an existing dead-end (already closed in the documents; nothing new was dug)
| Idea of 2026-11-15 | Existing dead-end it re-enters | Why it stays dead (the H-independent part) |
|---|---|---|
| Flash radiation gathers in U0, collapses, and that collapse lights the hot start (16b-6, 16b-9, the chain in 17) | **"Energy/event-based ignition"** (Part VIII §2, sweep 2026-06-22): (a) leak-and-spark, (c) spacetime "dump" | Past the hoop the pile forms a horizon — a cold hole, "it does not spill"; compression to R_s has a mass-independent virial ceiling kT ≈ m_p c²/10 (1.09×10¹² K); the energy of a hot start is supplied by geometry/vacuum, never by the radiation. The gap-finder of 17f reproduces this from the other side (8.2 g seed; old photons diluted 10⁻¹⁰⁴; link C2 has no equation). An A = 0 arena lifts only the *dilution* clause, not these. |
| Universe-scale piles (10¹⁹–10²⁴ M☉) as the igniting object (17f link B) | **Nucleation-route (ii) "hold a large patch to ignite"** | ρ_crit ∝ 1/r²: a large region reaches the Buchdahl–Penrose ceiling and forms a cold black hole before it can start hot; the igniting patch must be small. 17f found the same (111 orders short at the horizon). |
| "Counter-movers come from another collapse passing through; close passers merge with us" (16b-1) | **Nucleation-route (i) colliding-bubble / domino** | Causally separated; and the CMB bubble-collision search is null (Feeney et al. 2011). |
| "The 11 dimensions are collapse dimensions inside nested black holes" (16b-4); "each generation's pile must be ≥ 16× heavier" (17f E2b) | **Nucleation-route (iii) unbounded L-ladder nesting** | Nesting adds no dimension and no rung; a ladder that must grow every generation is the unbounded-nesting pattern. |
| "At birth it presses in, heats as it contracts, then bangs" (17h) | **Finite-U0 (closed-box bounce)**, dead on the Weyl channel; also event-ignition (b) "flipping collapse into expansion needs NEC violation" | ä/a = −(8πG/3)ρ < 0 for radiation; a turnaround is a bounce import (item L), and 15c records the author's no-rebound rule. |
| Doughnut spin as what drives the expansion (16b-7) | **A2 / LOG item 14** (rotation as the engine) | ω/H₀ = 1.43 needed vs 4.7×10⁻¹¹ allowed; ω² ∝ a⁻⁴ is the wrong epoch. |
| "Piled photons in U0 keep making electrons" (17c) | **LOG item 9** (Breit–Wheeler crossfire) and **dead-end B** (matter only at the hot boundary) | Collision channel: 74 orders below threshold, independent of expansion. The field (Schwinger) channel newly priced in 17c is real in principle but does not arise for any threshold pile in a dilute arena and yields equal e⁺e⁻. |

### B. DEAD — new today (not previously in the registers). Numbers: `code/u0_collapse_checks.py`, `code/u0_photon_neutrino_checks.py`
1. **In-space infall as the Hubble expansion.** Free-fall flow gives H_transverse = −2 H_radial: redshift on 18.4% of the sky only; a uniform collapsing ball gives H < 0 everywhere. Measured: redshift in all directions; anisotropic expansion disfavoured 121,000:1 (Saadeh et al. 2016). [Fact-eq + Fact]
2. **The interior of a pure 4+1 collapse as our expanding 3-space.** The isotropic S³ inside a Tangherlini horizon shrinks to zero in τ = r_s/c; the expanding twin is the white-hole branch. [Fact-eq]
3. **Surface tension, or the pond ripple, as the driver of expansion.** Δp = 2γ/R acts inward; a ripple is a surface wave. [Fact-eq]
4. **A self-propagating conversion front into a still, A = 0 arena.** Needs ε = V_out − V_in > 0 (R > 3σ/ε); floating radiation is ash, not fuel. With latent vacuum energy outside the arena expands and the picture becomes the superseded CDL/false-vacuum stratum (OPEN_PROBLEMS §8.3). [Fact-eq]
5. **An explosion with coasting ejecta as the expansion** (Milne 1935†): excluded by flatness and helium. [Fact]
6. **"The first flash was made by photons doing something."** Photons are a product of reheating and do not exist as such above the electroweak scale; pre-existing photons are diluted 10⁻¹⁰⁴ over 60 e-folds. [Fact-theory + Fact-eq]
7. **Hidden energy inside light; endless neutrino splitting; an unknown "bond".** E = hν closes the photon's account; there are three light neutrino states and the chain ν₃ → ν₂ → ν₁ stops; decay is a loop of known particles. [Fact]
8. **"Mass must be made before collapse can start."** All energy gravitates; threshold collapse works for a massless field (Choptuik 1993†). [Fact-eq] (a correction, kept here so it is not re-raised)

### C. PARKED — collides with a spine choice or is an unpriced import; not added as live, not ruled dead. Needs the author
- **A-U0 = 0, a still arena that lets debris collapse.** SSOT §2 chose the opposite on both counts: endgame = tiny nonzero de Sitter ("V_min = 0 → Minkowski" superseded), and the remnants sit in a shallow, **non-collapsing** well. The author's stated position since 2026-10 is A-U0 = 0 (15f). This is a spine change, pre-data, and only the author can make it; until then the registered spine stands. Note that section A's verdicts do not depend on which way this goes.
- **A 4th spatial dimension for U0 (16b-1 resolution), and with it the black ring as a transient birth shape (16b-7, 16b-8).** The only extra-dimension route the documents priced is listed among the dead imports ("a brane collision (imports extra dimensions — dead)"). A 4+1 arena is a new import with no parameter fixed (17f link F) and one hard bound (gravity confined to three dimensions: Pardo et al. 2018; Lee et al. 2020). It rescues nothing in section A: the hot start still needs vacuum conversion.
- **Ignition inside the collapsed pile / at the ring's pinch (16b-8).** As a mechanism this is the barrier-framed nucleation family (CDL/FGG, hole-catalysed) that SSOT §2 option (A) superseded with the deterministic flash. Re-opening it re-opens "a rate to compute".

### D. LIVE — no collision found; added to the record as [Hypo] / numeric notes (no `.tex` change)
1. **One flash, one seed — a numeric match.** The terminal flash of SSOT §3 (T ≈ 7×10¹² GeV) is the last ≈ 1.5 g of the survivor, emitted in ≈ 3×10⁻²⁵ s; one inflating Hubble patch on the documents' plateau weighs 8.2 g. Same order in mass-energy (the energy per quantum differs by ~10³). It is compatible with the registered reading ("one flash = one ignition", flash as direct trigger) and shows no pile is needed; it does **not** show that the flash can load the plateau. [Fact-eq; the trigger→plateau coupling stays the wiring, Hypo]
2. **Entropy bookkeeping, with numbers.** A newborn patch carries ≈ 1.8×10¹² k_B; a single survivor ≈ 10⁹⁹ k_B. "The newborn takes only its starting entropy; the dead hand theirs to the arena; entropy climbs with arena time" is already canon (Frautschi; Ijjas–Steinhardt-type, SSOT §1/§4); the author's 17g statement restates it. The attribution to Carroll & Chen in 17g should read as a parallel owner, not the documents' one. [Fact-eq]
3. **Clocks.** "Every *massive* object has its own timeline; massless quanta have none (dτ = 0)"; the smallest clock is ν = mc²/h (de Broglie 1924†); the arena's central time is the postulated foliation already in the ledger. Consistent with the τ_aeon layer. [Fact-eq / Hypo for the foliation]
4. **A sharpened watch-line: the lightest neutrino mass.** Standard-Model radiative decay (10⁴⁴–10⁴⁸ yr) clears the heavier states long before a survivor's ~10¹⁰⁰ yr, so whether any massive clock outlives the aeon reduces to one unmeasured number — whether the lightest mass is zero. Decided by absolute-mass experiments and cosmological Σm_ν, not by LMU. [Hypo linkage; inputs Fact-eq]
5. **Wall tension is automatic wherever A differs across a boundary** (σ = ∫√(2V) dA > 0, Coleman 1977†). Relevant to per-zone A; no new mechanism claimed. [Fact-eq]
6. **Interior simultaneity.** "It spreads from one place yet looks like everything expands together" is the Coleman–De Luccia interior geometry the documents already keep; the author's 17i sentence is correct in that model. Canon, not new.
7. **The gap-finder's reading of the knot.** Link C2 (what puts the field on the plateau and starts the roll) is the same single LMU-specific item the SSOT lists — the wiring; nothing found today adds a second one.

### E. What this does to the chain of items 16b / 17
Struck: "energy gathers in U0 → collapse → ignition" as the birth route (section A, rows 1–2), and with it the pile-mass floor of 17g and the E3 "return channel" as load-bearing items. Standing: the registered chain — survivor evaporates → terminal flash (≈ 1.5 g at ≈ 7×10¹² GeV) triggers the field on the plateau [wiring, Hypo] → 60–85 e-folds → reheating at ≈ 2.8×10¹⁵ GeV → standard thermal history to 380,000 yr. The evidence sweep of item 16 (a–f) is unaffected.

**Net:** no falsifier moved; no `.tex`, SSOT or pre-registration line changed. Seven ideas re-entered closed routes, eight new dead-ends recorded, three items parked for the author, seven notes added as live.
