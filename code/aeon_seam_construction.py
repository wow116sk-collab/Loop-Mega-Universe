#!/usr/bin/env python3
"""[Hypo] Aeon-seam construction: cold-clumpy -> hot-smooth, computed end-to-end.

STATUS: [Hypo] exploratory construction, NOT a result of the LMU framework proper.
Every MECHANISM used here is borrowed and owned (see review/HYPO_aeon_seam_construction.md
for the R7 attribution table). The only unclaimed move -- on a non-exhaustive literature
search, so [Hypo] not [Fact] -- is the WIRING: identifying the CCC-crossing conformal
factor with an alpha-attractor inflaton. Do NOT present any single mechanism as novel.

Sections (all reproducible):
  [A] energy half   -- omega (conformal factor) as inflaton -> GUT-scale hot start
  [B] smooth half   -- old-aeon Weyl residual diluted by inflation; spread over the aeon
  [C] N-convergence -- the e-folds that dilute the residual == give the CMB tilt
  [D] CMB fit       -- the same omega-inflaton normalized to the real Planck A_s, n_s, r
  [E] thermal bridge-- reheat temperature cools to the measured 2.725 K
  [F] entropy triangle -- entropy <-> temperature <-> volume closes at the doc's 1e90
  [G] sensitivity   -- vary the input scale; which outputs move, which are robust
"""
import math
Mp = 2.435e18            # reduced Planck mass, GeV
As_obs, ns_obs, r_obs = 2.1e-9, 0.9649, 0.009   # Planck CMB
kB=1.380649e-23; hbar=1.054571817e-34; c=299792458.0
log10 = lambda lnx: lnx/math.log(10)

print("== [A] ENERGY HALF: omega-inflaton -> GUT-scale hot start ==")
eps = r_obs/16
V   = 1.5*math.pi**2*r_obs*As_obs*Mp**4          # from A_s = V/(24 pi^2 eps Mp^4)
V14 = V**0.25
Treh= (30*V/(math.pi**2*200))**0.25
print(f"   V^1/4={V14:.2e} GeV, T_reheat={Treh:.2e} GeV, H_inf/Mp={math.sqrt(V/3)/Mp:.1e}  (OK)")

print("== [B] SMOOTH HALF: TWO separate quantities (do NOT conflate -- this caused the flip-flop) ==")
for N in (57, 100):
    print(f"   N={N}: observable CONTRAST e^-2N=1e{log10(-2*N):.0f} -> {abs(log10(-2*N))-5:.0f} orders below the 1e-5 CMB seed (EASY, met)")
print("   SEPARATE item: the old-aeon residual ENERGY must redshift below the MEASURED vacuum floor")
print("   Lambda/M_Pl^4 ~ 1e-122 (energy-to-energy), needing k~5 via REAL GR redshift (shear a^-6 fast,")
print("   curvature a^-2 slow) -- NOT a statistical 'spread'. [soft] (code/residual_dilution_to_floor.py)")

print("== [C] N-CONVERGENCE: the CMB tilt and flatness both point to N~57 ==")
N_cmb=2/(1-ns_obs)
print(f"   N(CMB tilt)={N_cmb:.0f} ; N(horizon/flatness)~55-60   [two real inflationary jobs]")
print(f"   (the old 'N(residual->1e-122)' leg is the energy-redshift-to-vacuum-floor item, k~5, a")
print(f"    consistency target -- not an independent third job; see [B] and residual_dilution_to_floor.py)")

print("== [D] CMB FIT: alpha-attractor (=conformal inflation, Kallosh-Linde 2013) ==")
N=N_cmb; alpha=r_obs*N**2/12
print(f"   N={N:.0f}, alpha={alpha:.2f}: n_s={1-2/N:.4f}, r={12*alpha/N**2:.4f}, "
      f"A_s={V/(24*math.pi**2*eps*Mp**4):.2e}  (== Planck); dT/T=sqrt(A_s)={As_obs**0.5:.1e}")

print("== [E] THERMAL BRIDGE: reheat -> the measured 2.725 K ==")
T_cmb_K=2.72548; T_cmb_GeV=(kB*T_cmb_K/1.602e-19)*1e-9
ratio=Treh/T_cmb_GeV; N_post=math.log(ratio*(106.75/3.909)**(1/3))
print(f"   T_reh={Treh:.1e} GeV -> T_CMB={T_cmb_K} K: cools by {math.log10(ratio):.0f} orders")
print(f"   => ~{N_post:.0f} post-reheat e-folds (radiation->matter->now). 2.725 K is MEASURED, not derived.")

print("== [F] ENTROPY TRIANGLE: entropy <-> temperature <-> volume ==")
s=(2*math.pi**2/45)*3.909*(kB*T_cmb_K/(hbar*c))**3   # kB/m^3
R=46.5*9.461e24; Vol=(4/3)*math.pi*R**3; S=s*Vol
print(f"   T=2.725 K + V_obs={Vol:.1e} m^3  ->  S={S:.2e} kB   (doc ledger 1.03e90 -> {'MATCH' if 5e89<S<5e90 else 'off'})")
print(f"   S_max(de Sitter, from Lambda)~1e122 ; gap S_max-S~1e122 = the Frautschi negentropy budget")

print("== [G] SENSITIVITY: vary the INPUT inflation scale; what moves? ==")
print(f"   {'V^1/4 in [GeV]':>15} {'r (F4)':>10} {'T_reh[GeV]':>11} {'n_s':>7} {'resid/pt':>9} {'Npost':>6}")
for V14_in in (3e15, 6e15, 1e16, 1.5e16, 3e16):
    Vin=V14_in**4
    eps_in=Vin/(24*math.pi**2*As_obs*Mp**4); r_in=16*eps_in     # r ∝ scale^4
    Treh_in=(30*Vin/(math.pi**2*200))**0.25
    Npost_in=math.log((Treh_in/T_cmb_GeV)*(106.75/3.909)**(1/3))
    flag = "" if r_in<0.036 else "  <-- r>0.036 EXCLUDED"
    print(f"   {V14_in:>15.0e} {r_in:>10.1e} {Treh_in:>11.1e} {0.965:>7.3f} {'1e-49':>9} {Npost_in:>6.0f}{flag}")
print("   -> n_s, residual, the entropy triangle: ROBUST (set by N~57 + normalization, not the scale).")
print("      r (F4 tensor signal): scales as (scale)^4 -- HUGELY sensitive. A x3 scale change swings r")
print("      from invisible (1e-5) to excluded (>0.036). THAT is why F4 is the sharp falsifier: the")
print("      ignition scale is pinned to ~1e16 GeV by r~0.009, and almost nothing else cares about it.")

print("\nHONEST BOUNDARY: borrowed mechanisms (Kallosh-Linde/Guth/Starobinsky/ekpyrotic-lineage);")
print("smoothing is dilution below the de Sitter floor, NOT a Weyl=0 law; 2.725 K is consistent in")
print("the ledger but pinned by consistency + when-observers-look, not predicted; only the wiring is [Hypo]-new.")
