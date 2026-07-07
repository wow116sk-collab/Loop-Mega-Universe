#!/usr/bin/env python3
"""Do the equations break if we drop 'a = constant' (exact de Sitter)? NO -- the de
Sitter thermodynamics generalises to time-varying H via the APPARENT HORIZON. This
script shows where the constant-H (Gibbons-Hawking) formulas are valid and where the
general (apparent-horizon) form is needed, via the slow-roll parameter |Hdot/H^2|.
Run to reproduce. Standard; owners in the .md.

Key fact (Akbar-Cai 2006): the Friedmann equation ITSELF can be written as the first
law dE=TdS+WdV at the apparent horizon, with S=A/4G and T=kappa/2pi, for ANY FRW a(t).
So 'a=constant' is only the LIMIT; dropping it means using the always-valid general
form, not breaking anything. (Frolov-Kofman 2002: dE=TdS at the quasi-de Sitter apparent
horizon reproduces the Friedmann equation for a slowly-rolling scalar.)
"""
import math

# |Hdot/H^2| = (3/2)(1+w_eff): 0 = exact de Sitter (a=const-ish), >>1 = fast, GH formulas fail
def slow(w): return abs(1.5*(1+w))

print("== |Hdot/H^2| by epoch: how far from 'a=constant' is each state? ==")
print(f"  0 = exact de Sitter (H const) ; <<1 = quasi-de Sitter (GH formulas OK) ; ~1+ = fast")
rows = [
    ("inflation slow-roll (w~-1+2e/3, e~6e-4)", -1+2*6e-4/3, "GH/apparent-horizon OK"),
    ("dark energy today (thawing, w~-0.9)",      -0.9,        "GH/apparent-horizon OK"),
    ("tiny de Sitter endgame (w->-1)",           -0.999,      "GH/apparent-horizon OK"),
    ("matter era (w=0)",                          0.0,        "NOT de Sitter -> use FRW (apparent-horizon still exact)"),
    ("radiation era (w=1/3)",                     1/3,        "NOT de Sitter -> use FRW (apparent-horizon still exact)"),
    ("flash / reheat (fast)",                     None,       "Hdot/H^2 ~ O(1)+ -> transition eqs, NOT GH"),
]
for name, w, note in rows:
    s = f"{slow(w):.3f}" if w is not None else " ~1+ "
    print(f"   |Hdot/H^2|={s:>6}  {name:<42} {note}")
print()

print("== The point: dropping a=constant does NOT break anything ==")
print("  - The APPARENT-HORIZON first law dE=TdS+WdV (Akbar-Cai 2006) IS the Friedmann")
print("    equation, EXACT for any a(t). It never breaks -- it is not an approximation.")
print("  - S=A/4G and T=kappa/2pi at the apparent horizon are the time-varying generalisation")
print("    (Kodama-Hayward temperature) of Gibbons-Hawking; they REDUCE to G-H when H=const.")
print("  - Every place LMU uses the 'de Sitter' formulas (the 1e122 ceiling, T=H/2pi, the slow")
print("    thaw, inflation) is in the |Hdot/H^2|<<1 regime, where the constant-H limit is fine.")
print("  - Where H varies FAST (flash/reheat), LMU already uses DIFFERENT equations (nucleation,")
print("    reheating, conformal flip) -- not the de Sitter formulas. No inconsistency.\n")

print("== The one real breakdown, and how the no-zero principle rescues it ==")
print("  at EXACT H=0 (true Minkowski) there is NO horizon -> S=A/4G diverges, T=H/2pi=0,")
print("  the de Sitter formulas genuinely break. THIS is the 'a=constant~0' danger the user")
print("  flagged. The 'no exact zero' principle (H tiny but never 0) keeps H>0, so a valid")
print("  (huge) apparent horizon always exists and the formulas stay finite. The user's own")
print("  no-zero postulate is exactly what prevents this breakdown.\n")

print("== HONEST caveats ==")
print("  - The apparent-horizon thermodynamic INTERPRETATION is not valid for ALL parameter")
print("    values or the entire evolution (Sanchez et al. 2022) -- conditions apply; the")
print("    first law as an identity always holds, the 'nice thermodynamics' reading does not.")
print("  - Fast transitions (Hdot/H^2 ~ 1) are outside the quasi-de Sitter regime; there the")
print("    horizon 'temperature/entropy' story is not clean, and LMU leans on transition")
print("    physics instead. Owners: Akbar-Cai 2006; Frolov-Kofman 2002; Kodama-Hayward;")
print("    Komatsu 2023; Sanchez et al. 2022.")
