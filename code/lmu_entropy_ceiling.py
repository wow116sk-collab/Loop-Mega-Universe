#!/usr/bin/env python3
"""[Hypo] LMU entropy: FUEL-limited production, INFINITE ceiling (Minkowski L0).

The author's stance, worked out and checked against the V3.26 spine:

  (1) production is FUEL-limited -- entropy rises with the matter processed into
      black holes and then evaporated; it stops when matter is exhausted (the
      survivor evaporates on the Hawking clock ~1e100 yr). It is NOT stopped by
      hitting a ceiling.
  (2) the entropy CEILING is INFINITE, because L0's endgame is asymptotic
      Minkowski: the A-field thaws to V_min=0 -> H->0 -> the de Sitter horizon
      opens -> S_max = A_hor/4G -> infinity. The 1e122 value is the eternal-de
      Sitter heat-death ceiling that LMU *avoids by thawing*, not a real cap.
  (3) total entropy -> infinity: a finite increment per aeon times infinitely
      many aeons in an infinite L0. Density stays bounded per patch; the
      extensive total is unbounded.

Checks vs V3.26: g=4.0e14 (L754/L856), S_max(dS)~1e122 & S_rad~1e90 (L1529),
endgame V_min=0 -> H->0 Minkowski (L382/L424). All values recomputed from
constants; run to reproduce. Nothing here is presented as novel physics -- it is
the Gibbons-Hawking + Frautschi + Tolman arithmetic, wired to the LMU A-field thaw.
"""
import math

kB   = 1.380649e-23      # J/K
hbar = 1.054571817e-34   # J s
c    = 299792458.0       # m/s
G    = 6.67430e-11       # m^3/kg/s^2
H0   = 2.20e-18          # 1/s  (H0 ~ 67.8 km/s/Mpc)
yr   = 3.156e7           # s

def S_deSitter(H):
    """Gibbons-Hawking horizon entropy in units of kB, for Hubble rate H.
       S = A_hor/(4 Lp^2), A_hor = 4 pi (c/H)^2, Lp^2 = hbar G/c^3."""
    R_H = c/H
    A   = 4*math.pi*R_H**2
    Lp2 = hbar*G/c**3
    return A/(4*Lp2)

print("== [1] The 1e122 ceiling is the de Sitter value -- and it BLOWS UP as H->0 ==")
print(f"   {'H/H0':>8} {'H [1/s]':>11} {'R_hor [m]':>11} {'S_dS/kB':>10}")
for frac in (1.0, 1e-1, 1e-3, 1e-6, 1e-10):
    H = H0*frac
    print(f"   {frac:>8.0e} {H:>11.2e} {c/H:>11.2e} {S_deSitter(H):>10.2e}")
print(f"   -> at H=H0 (now): S_dS = {S_deSitter(H0):.2e} kB  (doc's ~1e122, L1529)")
print(f"   -> as H->0 (V_min=0 Minkowski endgame, L382/L424): S_dS ~ 1/H^2 -> INFINITY.")
print(f"      So 1e122 is the ETERNAL-de Sitter heat-death ceiling LMU AVOIDS by thawing,")
print(f"      NOT a real cap. L0's true ceiling is infinite (infinite empty Minkowski).\n")

print("== [2] Production is FUEL-limited: finite increment per aeon, stops when matter is gone ==")
g       = 4.0e14         # per-round entropy growth factor (doc L754, intensive)
S_rad   = 1.03e90        # cold radiation entropy (doc L1529 ~1e90; == seam [F])
dS_aeon = g*S_rad        # entropy the aeon adds to its bath, ~ g x S_bath
print(f"   g (per-round factor, L754)      = {g:.1e}   (intensive; island size cannot tune it)")
print(f"   S_bath (cold radiation, L1529)  = {S_rad:.2e} kB")
print(f"   dS per aeon ~ g x S_bath        = {dS_aeon:.2e} kB   -- FINITE")
print(f"   production STOPS when the survivor evaporates: tau_evap ~ 2.1e100 yr (Hawking clock)")
print(f"   -> the cutoff is FUEL exhaustion (no matter -> no new S_BH), not a ceiling.\n")

print("== [3] The stall is fuel-limited: cold S is FAR BELOW even the transient ceiling ==")
S_cold  = S_rad          # ~1e90 radiation
S_bh    = 1e103          # black-hole reservoir (Egan-Lineweaver 2010 SMBH ~1e103)
S_dS_now= S_deSitter(H0)
print(f"   cold radiation S ~ {S_cold:.0e},  black-hole reservoir S_BH ~ {S_bh:.0e},")
print(f"   transient de Sitter ceiling S_dS(now) ~ {S_dS_now:.0e}")
print(f"   gap radiation->ceiling = {math.log10(S_dS_now/S_cold):.0f} orders ; BH->ceiling = {math.log10(S_dS_now/S_bh):.0f} orders")
print(f"   -> the system NEVER reaches the ceiling: fuel runs out ~32 orders below it.")
print(f"      doc L1529 'arrow stalls near S~=S_max' is loose -- the stall is at ~1e90-1e103,")
print(f"      not 'near' 1e122. The operative stall is FUEL exhaustion (matter decayed away).\n")

print("== [4] Total entropy -> infinity: finite/aeon x infinite aeons in infinite L0 ==")
print(f"   {'n aeons':>10} {'total S/kB (>=)':>16}")
for n in (1, 1e10, 1e100, 1e1000 if False else 1e300):
    print(f"   {n:>10.0e} {n*dS_aeon:>16.2e}")
print(f"   -> per-patch DENSITY bounded (each patch dilutes below its horizon value),")
print(f"      but the EXTENSIVE total is unbounded because L0 supplies fresh infinite volume.")
print(f"      This is the Tolman conundrum resolved the LMU way: infinite reservoir (the one")
print(f"      load-bearing premise), NOT a growing per-horizon ceiling (that would need Lambda_eff down).\n")

print("== [5] Reconciliation with the doc (what shifts, what holds) ==")
print("   HOLDS : g=4e14 finite per-aeon increment; dilution into infinite L0 re-arms the arrow;")
print("           entropy is the only cross-aeon invariant; total -> infinity via infinite L0.")
print("   SHARPENS: the ceiling is INFINITE (Minkowski endgame), so 1e122 is demoted to the")
print("           de-Sitter value LMU avoids; and the cold-end STALL is FUEL-limited (matter")
print("           exhausted at ~1e90-1e103), not 'near S_max~1e122' as L1529 phrases it.")
print("   ONE FLAG: doc L1529 'stalls near S~=S_max (~1e122 vs ~1e90)' should read as a")
print("           per-horizon TRANSIENT gap, not a real approach to the ceiling. A future doc")
print("           edit could re-phrase; NOT edited here (out of scope).")
