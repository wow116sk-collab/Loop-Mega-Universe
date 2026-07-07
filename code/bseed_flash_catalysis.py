#!/usr/bin/env python3
"""B_seed -- the last uncomputed piece. Does the survivor's terminal flash catalyse
the relighting nucleation within one interlude? Uses the Gregory-Moss-Withers result
(the seeded static-instanton action = the seed-minus-remnant black-hole entropy),
Burda-Gregory-Moss (small black holes seed rapid decay), with the Strumia 2022
counter flagged. Run to reproduce. All borrowed; only the application is LMU's.

  GMW: B_seed = S_seed - S_remnant.  For a black hole consumed by the bubble
  (topology-changing, remnant -> 0):  B_seed = S_seed = 4 pi (M/M_Pl)^2.
"""
import math
MPl = 1.22e19           # GeV, non-reduced Planck mass
Msun = 1.989e30; c=299792458.0
g_to_GeV = (1e-3*c**2)/1.602176634e-10   # 1 gram in GeV (E=mc^2)
yr=3.156e7; tPl_s=5.39e-44

def S_bh(M_over_MPl):    # black-hole entropy in units of kB
    return 4*math.pi*M_over_MPl**2

print("== The interlude threshold: how small must B_seed be to fire in ~1e100 yr? ==")
tau_Pl = 1e100*yr/tPl_s                              # interlude in Planck times
B_thresh = math.log(tau_Pl)                          # need exp(-B) * tau > 1
print(f"  interlude ~1e100 yr = {tau_Pl:.0e} Planck times -> need B_seed < ln(that) = {B_thresh:.0f}")
print(f"  (spontaneous CDL B~1e3-1e6 and Hawking-Moss B~1e12 both FAIL this by far.)\n")

print("== GMW seeded action as the survivor evaporates (B_seed = 4 pi (M/M_Pl)^2) ==")
print(f"  {'M (seed)':>16} {'M/M_Pl':>10} {'B_seed=S_seed':>14} {'fires in interlude?':>20}")
one_g = g_to_GeV/MPl                                  # 1 gram in Planck masses
for label, M_MPl in [("1.5 g endpoint", 1.5*one_g), ("1e6 M_Pl", 1e6),
                     ("100 M_Pl", 100), ("10 M_Pl", 10), ("5 M_Pl", 5), ("2 M_Pl", 2)]:
    B = S_bh(M_MPl)
    fires = "YES" if B < B_thresh else "no"
    print(f"   {label:>16} {M_MPl:>10.1e} {B:>14.1e} {fires:>20}")
Mc = math.sqrt(B_thresh/(4*math.pi))
print(f"  -> B_seed drops below {B_thresh:.0f} only when M < {Mc:.1f} M_Pl.")
print(f"     So the relighting fires in the survivor's LAST ~{Mc:.0f} Planck masses of evaporation")
print(f"     -- literally the terminal flash. That is where GMW makes nucleation unsuppressed.\n")

print("== HONEST boundary (three caveats, all real) ==")
print(f"  (1) QUANTUM-GRAVITY EDGE: M ~ {Mc:.0f} M_Pl is right at the Planck scale, where the")
print("      semiclassical B_seed = S formula is at the edge of validity. The number is")
print("      order-of-magnitude; the exact endpoint action needs quantum gravity.")
print("  (2) CONTESTED: Burda-Gregory-Moss (2015/16) say small black holes seed RAPID decay;")
print("      Strumia 2022 argues it is negligible for SMALL quartic coupling (non-perturbative")
print("      suppression). LMU's barrier has lambda~O(1) (V=(lambda/4)(phi^2-v^2)^2), which is")
print("      the GMW-FAVOURABLE regime, not Strumia's small-coupling one -- but the debate is live.")
print("  (3) [Hypo] BARRIER: all of this assumes the Phi_gen false vacuum EXISTS to decay into")
print("      (the de Sitter-stability / swampland question). B_seed only matters if P>0 at all.\n")

print("== NET -- the last piece, scored ==")
print("  The flash CAN relight within the interlude: as the survivor evaporates to ~few Planck")
print("  masses, the GMW seeded action B_seed = S_seed falls below the ~350 threshold, so the")
print("  terminal flash nucleates the bubble -- converting the astronomically-slow spontaneous")
print("  rate (B~1e3-1e12) into a per-interlude event. This is the mechanism LMU needs, and it")
print("  is BORROWED (Gregory-Moss-Withers 2014; Burda-Gregory-Moss 2015/16).")
print("  BUT it fires at the Planck/QG edge, is contested (Strumia vs GMW; LMU's lambda~1 favours")
print("  GMW), and still assumes the Phi_gen barrier exists. So: PLAUSIBLE, borrowed, not proven.")
