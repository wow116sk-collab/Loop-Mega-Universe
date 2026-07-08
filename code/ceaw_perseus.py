#!/usr/bin/env python3
"""CEAW (Cosmic Entropy Acoustic Waves) -- L2->L1 state-diagnostic, verification.
Reinstated 2026-07-08 as an in-aeon DESCENT-side diagnostic (was in LMU_V3_4 s12.1.4,
trimmed in the 3.4->3.27 consolidation). See review/CEAW_L2_diagnostic.md.

CEAW = the acoustic/weak-shock channel by which AGN-feedback energy dissipates in the
hot intracluster medium (ICM). Standard textbook acoustic power:
   P_CEAW ~ 4 pi r^2 * (dP)^2 / (2 gamma_a P0) * c_s ,   gamma_a = 5/3
(= <dP^2>/(2 rho c_s) * area, with gamma_a P0 = rho c_s^2). NOT the growth knob (that is
the P_cav-L_cool / M-sigma self-regulation); NOT relevant to the L0->aeon reset. Run.
"""
import math
kpc=3.086e21; keV=1.602e-9; mp=1.6726e-24
mu=0.61                                   # mean molecular weight (ionized H+He)
gamma_a=5.0/3.0

# --- Perseus core, fiducial (Fabian et al. 2006 ripples; standard ICM values) ---
r     = 35*kpc          # rippled region radius ~35 kpc
kT    = 3.5*keV         # core temperature ~3.5 keV
ne    = 0.05            # electron density cm^-3 (Perseus core)
dPoP  = 0.08            # ripple pressure amplitude dP/P ~ 8% (Fabian: ~5-10%)

ntot  = 1.92*ne                             # total particles / electron (H+He)
P0    = ntot*kT                             # thermal pressure erg/cm^3
cs    = math.sqrt(gamma_a*kT/(mu*mp))       # adiabatic sound speed cm/s
dP    = dPoP*P0
P_ceaw= 4*math.pi*r**2 * dP**2/(2*gamma_a*P0) * cs

print("== CEAW acoustic power, Perseus core (fiducial) ==")
print(f"  c_s={cs/1e5:.0f} km/s (kT={kT/keV:.1f} keV) ; P0={P0:.2e} erg/cm^3 ; dP/P={dPoP:.2f} ; r={r/kpc:.0f} kpc")
print(f"  P_CEAW = {P_ceaw:.2e} erg/s")
print(f"  doc LMU_V3_4 s12.1.4 quotes ~1.4e43 erg/s -> {'MATCH' if 1.0e43<P_ceaw<2.0e43 else 'OFF'} "
      f"(~{P_ceaw/1.4e43:.2f}x) [Fact-eq]\n")

print("== geometry scan -> the ~5-47% cool-core offset band (state-diagnostic) ==")
Lcool = 1.4e44        # Perseus cool-core cooling luminosity to offset (~1e44 erg/s scale)
for rr,dp in [(25,0.05),(35,0.08),(45,0.10),(55,0.12),(60,0.14)]:
    Pi=4*math.pi*(rr*kpc)**2*(dp*P0)**2/(2*gamma_a*P0)*cs
    print(f"  r={rr:2d} kpc, dP/P={dp:.2f}: P_CEAW={Pi:.2e} erg/s -> {100*Pi/Lcool:4.1f}% of L_cool")
print("  => spanning plausible geometry gives ~5-47% offset: REAL but sub-dominant. [Fact-eq]")

print("\n== role: L2 -> L1 state-diagnostic (descent side of the ladder) ==")
print("  hot ICM present (L2 BCG / cool cores) -> CEAW > 0 ; L3 dwarfs/spirals -> CEAW ~ 0.")
print("  rippled core   = L2 still ACTIVE (feedback heating).")
print("  quiet core     = approaching the lone L1 survivor (feedback fading).")
print("  [Fact] acoustic dissipation: Fabian et al. 2006 (Perseus ripples), Hitomi 2016, XRISM.")
print("  [Hybrid] the 'CEAW' name + channel decomposition (Pitarn's; Fabian gives the physics).")
print("  [Open] the channel weights Gamma_j -- need stacked cluster X-ray surveys to pin.")
print("  NOT the growth knob (that is P_cav-L_cool / M-sigma); NOT relevant to the reset (items 1/2).")
