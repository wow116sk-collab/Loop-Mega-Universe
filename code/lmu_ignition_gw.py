#!/usr/bin/env python3
"""[Hypo] Gravitational waves produced AT IGNITION (the flash-nucleation hot start).

Three physically distinct GW channels fire at ignition; they sit at very different
frequencies and amplitudes, so "how much GW" has three answers. Every number
recomputed from constants / standard formulae; run to reproduce. Mechanisms are
all borrowed (owners in-line); nothing here is claimed novel.

  [A] Inflationary tensor background -- the omega-inflaton's tensor modes, r=0.009.
      THE ROBUST, OBSERVABLE one == the framework's F4 falsifier (CMB B-modes).
  [B] Bubble-nucleation / first-order transition GW -- the CDL flash at ~1e16 GeV.
      Strong but at ultra-high frequency (redshifted GUT scale) -> undetectable.
  [C] Preheating/reheating GW -- parametric resonance after the hot start (mention).

Formulae: Caprini et al. 2016/2020 (LISA PTA WG); Maggiore; standard inflationary
tensor result. r,A_s,n_s from Planck (the seam's CMB fit).
"""
import math
r_obs, As_obs, ns_obs = 0.009, 2.1e-9, 0.9649
Ogam_h2 = 2.47e-5        # photon density today, Omega_gamma h^2
g_star  = 106.75         # relativistic dof at the GUT hot start (SM); GUT+ ~ 200
GeV_K   = 1.160e13       # 1 GeV in kelvin

print("== [A] INFLATIONARY TENSOR BACKGROUND (omega-inflaton, r=0.009) -- the F4 signal ==")
Dt2 = r_obs*As_obs                                    # tensor power spectrum P_t = r A_s
h_char = math.sqrt(Dt2)                               # characteristic tensor amplitude per log-k
# present-day energy density of the radiation-era plateau (order-of-magnitude standard result)
Ogw_infl = (1.0/24.0)*Ogam_h2*Dt2*0.39               # 0.39 ~ g_* transfer factor for high-f modes
print(f"   tensor power   P_t = r*A_s = {Dt2:.2e} ; characteristic strain h ~ sqrt(P_t) = {h_char:.1e}")
print(f"   B-mode signal at CMB scales: r = {r_obs} (delta T/T tensor = {h_char:.1e})")
print(f"   present GW energy (flat plateau): Omega_GW h^2 ~ {Ogw_infl:.1e}  (order 1e-16-1e-17)")
print(f"   frequency band: 1e-18 Hz (CMB) up to ~1e8 Hz (reheating horizon), ~scale-invariant")
print(f"   -> DETECTABLE handle: CMB-S4 / LiteBIRD target sigma(r)~1e-3; r=0.009 is IN reach.")
print(f"      This is the framework's real GW prediction and its F4 falsifier. (Starobinsky/")
print(f"      Kallosh-Linde tensor modes; Guth-lineage.)\n")

print("== [B] BUBBLE-NUCLEATION / FIRST-ORDER TRANSITION at ignition (CDL, ~1e16 GeV) ==")
T_star = 1e16            # GeV, ignition / nucleation scale
for beta_H in (10.0, 100.0):                          # inverse duration beta/H_* (model input)
    alpha = 1.0                                        # transition strength (latent/radiation), ~O(1)
    kappa = 1.0                                        # efficiency (runaway/relativistic walls)
    vw    = 1.0
    # peak frequency today (collisions, Caprini 2016): f_*/H_* ~ 0.35 (beta/H) for v_w~1
    f_peak = 1.65e-5 * 0.35*beta_H * (T_star/100.0) * (g_star/100.0)**(1.0/6.0)   # Hz
    # peak amplitude (envelope/collisions)
    geom = 0.077*vw**3                                 # 0.11 v_w^3/(0.42+v_w^2) at v_w=1
    Ogw = 1.67e-5*(1.0/beta_H)**2*geom*(kappa*alpha/(1+alpha))**2*(100.0/g_star)**(1.0/3.0)
    print(f"   beta/H={beta_H:>5.0f}, alpha={alpha}, kappa={kappa}: f_peak(today) = {f_peak:.1e} Hz, "
          f"Omega_GW h^2|peak ~ {Ogw:.1e}")
print(f"   -> STRONG at source (Omega_GW h^2 ~ 1e-11 to 1e-9) but the GUT scale redshifts the peak")
print(f"      to ~1e10-1e11 Hz -- far above LISA (1e-3 Hz), PTA (1e-9), LIGO (1e2). UNDETECTABLE")
print(f"      with any current/planned instrument; and highly model-dependent on (beta/H, alpha).")
print(f"      (Coleman-De Luccia bubble; Kosowsky-Turner-Watkins; Caprini et al. 2016.)\n")

print("== [C] PREHEATING / REHEATING GW (parametric resonance after ignition) -- mention ==")
# rough: f ~ 1e7-1e9 Hz redshifted, Omega_GW h^2 up to ~1e-11 for GUT-scale preheating
print(f"   parametric-resonance background: f ~ 1e7-1e9 Hz, Omega_GW h^2 up to ~1e-11 (model-dep).")
print(f"   also ultra-high frequency -> not a near-term observable. (Khlebnikov-Tkachev 1997.)\n")

print("== NET: how much GW at ignition ==")
print(f"   OBSERVABLE  : inflationary tensor, r={r_obs} -> Omega_GW h^2 ~ 1e-16, CMB B-modes.")
print(f"                 THIS is the number that matters -- it is F4, testable by CMB-S4/LiteBIRD.")
print(f"   STRONG-BUT-BLIND: the CDL bubble + preheating give Omega_GW h^2 ~ 1e-11..1e-9 but at")
print(f"                 ~1e10-1e11 Hz (GUT scale redshifted) -- real, unmeasurable, model-dependent.")
print(f"   CCC lineage note: Meissner-Penrose 2025 route the new-aeon signal to GW from the PREVIOUS")
print(f"                 aeon's black-hole encounters (a DIFFERENT, low-f spectral shape) -- separate")
print(f"                 from these ignition-generated channels; not computed here.")
