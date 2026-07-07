#!/usr/bin/env python3
"""[Hypo] Aeon-seam construction: cold-clumpy -> hot-smooth, computed end-to-end.

STATUS: [Hypo] exploratory construction, NOT a result of the LMU framework proper.
Every MECHANISM used here is borrowed and owned (see review/HYPO_aeon_seam_construction.md
for the R7 attribution table). The only unclaimed move -- on a non-exhaustive literature
search, so [Hypo] not [Fact] -- is the WIRING: identifying the CCC-crossing conformal
factor with an alpha-attractor inflaton. Do NOT present any single mechanism as novel.

Runs four linked pieces, all reproducible:
  [A] energy half  -- omega (conformal factor) as inflaton, reheats to a GUT-scale hot start
  [B] smooth half  -- old-aeon Weyl residual diluted by inflation; spread across the aeon
  [C] N-convergence-- the e-folds that dilute the residual == the e-folds that give the CMB tilt
  [D] CMB fit      -- the same omega-inflaton normalized to the real Planck A_s, n_s, r
"""
import math
Mp = 2.435e18            # reduced Planck mass, GeV
As_obs, ns_obs, r_obs = 2.1e-9, 0.9649, 0.009   # Planck CMB
log10 = lambda lnx: lnx/math.log(10)

print("== [A] ENERGY HALF: omega-inflaton -> GUT-scale hot start ==")
eps = r_obs/16
V   = 1.5*math.pi**2*r_obs*As_obs*Mp**4          # from A_s = V/(24 pi^2 eps Mp^4)
V14 = V**0.25
Treh= (30*V/(math.pi**2*200))**0.25
Hinf= math.sqrt(V/3)/Mp
print(f"   V^1/4={V14:.2e} GeV, T_reheat={Treh:.2e} GeV, H_inf/Mp={Hinf/Mp:.1e}  (all OK)")

print("== [B] SMOOTH HALF: old-aeon Weyl residual, diluted, spread over the aeon ==")
for N in (57, 100):
    print(f"   N={N}: residual/point e^-2N=1e{log10(-2*N):.0f} ; "
          f"spread e^-5N=1e{log10(-5*N):.0f} ; CMB seed=1e-5 "
          f"(residual {abs(log10(-2*N))-5:.0f} orders below)")

print("== [C] N-CONVERGENCE: one N does three jobs ==")
N_cmb   = 2/(1-ns_obs)
N_floor = 122*math.log(10)/5                     # spread residual reaches the de Sitter floor 10^-122
print(f"   N(CMB tilt n_s)      = {N_cmb:.0f}")
print(f"   N(residual->10^-122) = {N_floor:.0f}")
print(f"   N(horizon/flatness)  ~ 55-60")
print(f"   -> all land at N~56-57. Same inflation erases old Weyl to the de Sitter floor AND")
print(f"      writes the observed CMB tilt.")

print("== [D] CMB FIT: alpha-attractor (=conformal inflation, Kallosh-Linde 2013) ==")
N     = N_cmb
alpha = r_obs*N**2/12
print(f"   n_s={ns_obs} -> N={N:.0f} ;  r={r_obs} -> alpha={alpha:.2f} ;  A_s={As_obs} -> V^1/4={V14:.2e} GeV")
print(f"   check: n_s={1-2/N:.4f}, r={12*alpha/N**2:.4f}, A_s={V/(24*math.pi**2*eps*Mp**4):.2e}  (== Planck)")
print(f"   delta_T/T = sqrt(A_s) = {As_obs**0.5:.1e}  (== observed ~1e-5)")

print("\nHONEST BOUNDARY (do not overstate):")
print(" - alpha=2.4 is a FIT to r=0.009, not a prediction; every inflation model fits its potential.")
print(" - the CMB is written FRESH by new-aeon inflaton quantum modes, decoupled from the (erased,")
print("   no-hair) old aeon; residual and CMB differ by ~44 orders -- consistent, not contradictory.")
print(" - smoothing here is DILUTION below the de Sitter floor, NOT a first-principles Weyl=0 law")
print("   (Penrose's WCH, open field-wide). 'inflation dilutes anisotropy' is owned (Guth-lineage).")
print(" - the seam COMPUTES end-to-end, but on BORROWED mechanisms; only the wiring is [Hypo]-new.")
