# CEAW — Cosmic Entropy Acoustic Waves — the L2→L1 state-diagnostic (reinstated)

**Date:** 2026-07-08 · **Reproduce:** `code/ceaw_perseus.py` · **Status:** `[Fact-eq]` formula+number · `[Hybrid]` the channel framing · `[Open]` the weights Γ_j · **Lit-checked.**

> **Provenance.** CEAW was in `LMU_V3_4.pdf` §12.1.4 and was **trimmed in the 3.4 → 3.27 consolidation** (a minor channel; the consolidated doc kept the *load-bearing* cluster feedback — the M_σ / King self-regulation, the real growth knob — and dropped this secondary diagnostic). **Reinstated here** as an in-aeon **descent-side** diagnostic, explicitly *not* a growth knob and *not* relevant to the L0→aeon reset (items 1/2). This doc is the record; the main `.tex` carries a pointer via a 3.27-continuation revision entry.

## What it is (one line)

CEAW = the **acoustic / weak-shock channel** by which AGN-feedback energy dissipates in the hot **intracluster medium (ICM)** — a real, observed process (Perseus ripples). In LMU it is used as a **state-diagnostic for L2 black holes on the ladder**, not as a regulator of growth.

## The equation

$$P_{\rm CEAW} \;\approx\; 4\pi r^2 \cdot \frac{(\delta P)^2}{2\,\gamma_a\,P_0}\cdot c_s\,,\qquad \gamma_a=\tfrac53$$

Standard textbook acoustic power ($P=\langle\delta P^2\rangle/2\rho c_s$ times the surface area $4\pi r^2$), rewritten with the adiabatic relation $\gamma_a P_0=\rho c_s^2$. **[Fact-eq]** — not new physics.

## Verification (Perseus core, `code/ceaw_perseus.py`)

Fiducial (Fabian et al. 2006; standard ICM values: $r\approx35$ kpc, $kT\approx3.5$ keV, $n_e\approx0.05$ cm⁻³, $\delta P/P\approx8\%$):

- $c_s\approx957$ km/s, $P_0\approx5.4\times10^{-10}$ erg/cm³
- $P_{\rm CEAW}\approx\mathbf{1.45\times10^{43}}$ **erg/s** — matches the doc's quoted $\sim1.4\times10^{43}$ erg/s to $\sim1.04\times$. **[Fact-eq]**
- Spanning plausible geometry ($r=25$–$55$ kpc, $\delta P/P=5$–$12\%$) offsets **~5–47%** of the cool-core cooling luminosity — **real but sub-dominant**, consistent with the doc.

## Role — the L2→L1 state-diagnostic (descent side of the ladder)

| condition | reading |
|---|---|
| hot ICM present (L2 BCG, cool cores) | $P_{\rm CEAW}>0$ |
| L3 dwarfs / spirals (no hot ICM) | $P_{\rm CEAW}\approx0$ |
| **rippled** core | L2 still **active** (feedback heating) |
| **quiet** core | **approaching the lone L1 survivor** (feedback fading) |

So the ripple state is a **consistency signal** for where a cluster BCG sits on the L2→L1 descent — the quietest cool cores should host the most massive, most isolated (near-survivor) holes.

## Status labels (per the working rules)

- **[Fact]** — acoustic dissipation in cluster gas is *observed*: Fabian et al. 2006 (Perseus ripples), Hitomi Collaboration 2016 (X-ray spectroscopy), continuing XRISM data.
- **[Fact-eq]** — the acoustic-power formula and the Perseus number reproduce (textbook acoustics + standard ICM values).
- **[Hybrid]** — the name "CEAW" and the *channel-decomposition* framing are the author's (Pitarn), **not** from Fabian directly; Fabian supplies the sound-wave physics, not this decomposition.
- **[Open]** — the channel weights $\Gamma_j$ still need stacked cluster **X-ray surveys** to pin (open-item provenance: `Codex_Session_12_Phase5_Reframe.md`, per LMU_V3_4). The method + why it is open (the sound-wave fraction $\Gamma_{\rm sound}=P_{\rm CEAW}/(P_{\rm cav}+P_{\rm CEAW})$ comes out order ~10% but scatters ~10× across a heterogeneous sample, input-driven by the poorly-known $\delta P/P$ and $r$) is in `code/ceaw_gamma_channels.py`. Closing it needs one uniform pipeline over a controlled cool-core sample (Chandra/XMM cavities + XRISM ripple/turbulence).

## Scope limits (do not over-extend — the session's standing discipline)

- CEAW is **descent-side** (in-aeon, L2 cluster, hot ICM). It does **not** bear on the L0→aeon **reset** (the "+3 spread" smoothing / the ω-inflaton wiring — items 1/2 are untouched).
- It is **not** the growth-regulating knob — that is the **P_cav–L_cool self-regulation** (see the next section), a separate mechanism (also carried in the main doc's M_σ/King feedback, L174–L355).

## The real self-regulation knob (separate from CEAW — P_cav–L_cool)

Per `LMU_V3_4` §12.1.4, the *growth-regulating* self-regulation is **not** CEAW but the **cavity-power–cooling** relation (the X-ray-cavity, pdV-work channel):

$$P_{\rm cav}\propto L_{\rm cool}^{\,0.69\pm0.13}\,,\qquad R^2=0.51,\quad N=29$$

with **median $P_{\rm cav}/L_{\rm cool}\approx26$** — cavity power meets or exceeds the cooling luminosity in every sampled system: a direct, quantitative self-regulating loop (more cooling → more accretion → more feedback → offsets the cooling) with **no environment-dependent efficiency**. This relation **replaced the four η (efficiency) parameters that V3.2 dropped**. **[Fact]** (Rafferty, McNamara, Nulsen & Wise 2006; Bîrzan et al. 2008). CEAW rides *alongside* this as a sub-dominant channel + diagnostic — never the knob.

## Possible falsifier hook (testable, [Open])

A stacked X-ray survey correlating **cool-core ripple amplitude** with **BCG black-hole mass / isolation**: LMU predicts the *quietest* cores host the *most near-survivor* (most massive, most isolated) holes. A reversed or null correlation would pressure the L2→L1 diagnostic reading. Depends on pinning $\Gamma_j$.

## References

- **Fabian et al. (2006)** — Perseus ripples (acoustic dissipation).
- **Hitomi Collaboration (2016)** — X-ray spectroscopic confirmation of ICM dynamics.
- **Rafferty, McNamara, Nulsen & Wise (2006); Bîrzan et al. (2008)** — the P_cav–L_cool relation (the *separate* growth knob).
- Borrowed acoustics: standard (Landau–Lifshitz *Fluid Mechanics*). The CEAW name/decomposition is the author's assembly (R7).
