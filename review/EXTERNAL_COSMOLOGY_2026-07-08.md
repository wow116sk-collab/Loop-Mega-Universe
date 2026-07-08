# External cosmology refresh (2026-07-08) — what post-3.4-era data does to LMU

**Scope:** the measured/observational cosmology developments (2024–2026) that touch LMU's spine or falsifiers and were **not yet in V3.27**, each tagged at its true level. Nothing here rewrites the spine; it records the drift. **Reproduce:** `code/act_dr6_ns_shift.py`. **Verdict up front: no hard contradiction; one tension (F1) sharpens; one item is favourable.**

`[Fact]` measured/peer-reviewed · `[Fact-eq]` follows numerically, conditional on the input · `[Fact-th]` from theory · `[Hypo]`/`[contested]` unsettled.

## 1. ACT DR6 (2025) + SPT-3G — the CMB anchor has moved up  ⭐ spine-relevant

- **[Fact]** measured n_s: Planck 0.9649; **ACT DR6 0.9666±0.0077; Planck+ACT 0.9709±0.0038; P-ACT-LB2 (+DESI DR2) 0.9752±0.0030** — up ~1.5–2σ from Planck (the doc's anchor). SPT-3G bundles in the same combined analyses.
- **[Fact-eq, conditional]** LMU spine under the new n_s: N = 2/(1−n_s) → 57 → **69–81**; r = 12α/N² (α=1) → 0.0037 → **0.0018**; (α=2.44) 0.009 → 0.0045. **Still under the r<0.038 bound and above the r<10⁻³ "favours-ekpyrotic" line** — LMU passes.
- **[Fact-th, field-wide]** the vanilla α-attractor/Starobinsky at reheating-allowed N~50–60 predicts n_s ~0.960–0.967 — now ~1.5–2σ **below** ACT's 0.971–0.975; matching ACT needs N~69–81, which over-shoots reheating. A mild plateau-vs-ACT tension, **shared by every plateau model** (extended α-Starobinsky / modified reheating fixes exist: [2606.24131](https://arxiv.org/abs/2606.24131), [2510.18656](https://arxiv.org/pdf/2510.18656)). LMU inherits the fix; it does not create the problem.
- **Not a contradiction:** the doc uses n_s as a measured *input*, not a locked prediction. Honest caveat: the ACT shift is ~2σ, not a definitive overturn of Planck.

## 2. Negative-neutrino-mass anomaly (DESI DR2 + CMB lensing, 2024–25) — favourable to LMU

- **[Fact]** DESI+CMB constrains Σmν **below** the oscillation floor (~0.06 eV), with the max-likelihood drifting into formally **negative** territory at ~2–3σ ([PRD 111 083507](https://link.aps.org/doi/10.1103/PhysRevD.111.083507); [2503.14744](https://arxiv.org/abs/2503.14744)). "Negative neutrino mass" is **unphysical — an anomaly, not a fact of nature.**
- **[Hypo, favourable]** the anomaly relaxes under **evolving DE** (w0waCDM → Σmν<0.163 eV). LMU's thawing A-field *is* an evolving-w model, so it sits on the relaxing side — a **potential plus**, not a clash. (Consistency, not proof.)
- **Not in the doc** (V3.27 is silent on neutrinos) → no conflict.

## 3. CCBH — Croker et al. 2024 strengthens the rival BH-dark-energy  [contested]

- **[contested]** "DESI dark-energy time-evolution is **recovered** by cosmologically coupled black holes" (Croker et al. 2024, JCAP 10, 094; k=3 coupling), building on Farrah et al. 2023 (ApJL 944 L31). A **rival black-hole cosmology** that reproduces DESI's evolving DE. The BH-mass-growth observation is data but **contested**; the "BHs = dark energy" reading has GR rebuttals and GW/other constraints ([2507.03408](https://arxiv.org/pdf/2507.03408) rules out non-singular-BH DE with Planck+DESI+Union3).
- **Doc status is already correct:** V3.27 scopes CCBH (Farrah 2023) **off the spine** ("R8 applies to rebuttals", L1353) and uses M∝a only at k=1 for BH-through-bounce survival (Pérez–Romero 2022), **not** k=3-as-DE. **Update needed:** note the 2024 result strengthens the rival, and keep the distinction sharp — **LMU's DE is the A-field (quintessence), not BH-coupling.** No contradiction.

## 4. DESI DR2 evolving DE / phantom crossing — the sharpest tension (= LMU's own F1)  ⚔️

- **[Fact]** DESI DR2 rejects ΛCDM at **2.8–4.2σ** (SN-dataset dependent); best fit w0≈−0.7, wa≈−1, **crossing w=−1 at z~0.5** (~3σ). (The doc already carries 2.8σ/4.2σ, L376/500/513.)
- **The tension:** LMU's A-field is **canonical, w≥−1, cannot cross −1** (Vikman 2005) — and F1, LMU's own falsifier, says a phantom crossing pressures it. **But the doc already defends it:** the crossing is a **CPL-parametrization artifact**, and physical non-phantom thawing fits comparably (Dinda–Maartens 2025; de Souza et al. 2025, L515/L580). **Not a contradiction** — a known, addressed tension.
- **What changed:** DR2's push to 4.2σ **sharpens** it. If it reaches 5σ **and** survives a physical (non-CPL) reanalysis with systematics resolved, F1 fires. This is the one item to **watch**; the defence holds for now.

## Net

| item | in doc? | contradiction? | tag / action |
|---|---|---|---|
| ACT DR6 / SPT-3G n_s | no | **no** (input, not prediction) | [Fact] + [Fact-eq] recompute; note plateau-vs-ACT tension [Fact-th, field-wide] |
| neutrino anomaly | no | **no** — **favourable** | [Fact] anomaly; LMU evolving-DE relaxes it [Hypo] |
| CCBH Croker 2024 | 2023 only | **no** (scoped off) | [contested]; update the rival note, keep A-field≠BH-coupling |
| DESI DR2 phantom crossing | yes | **tension = F1** (defended) | [Fact]; sharpen the F1 note per DR2 4.2σ |

**No hard contradiction anywhere.** The Planck spine (N=57, r=0.0037) stays the reference; the CMB anchor has drifted up (ACT), the DE falsifier (F1) has sharpened (DESI DR2), one rival strengthened (CCBH, scoped off), and one anomaly is favourable (neutrinos).
