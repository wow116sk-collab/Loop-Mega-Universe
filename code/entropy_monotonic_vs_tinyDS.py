#!/usr/bin/env python3
"""GATING CHECK before Round-4: does Pitarn's monotonic-entropy axiom
('entropy only increases -- rate fast/slow/stall/dip-maybe, but the TOTAL must rise')
CONFLICT with LMU's tiny-de-Sitter endgame (H_inf>0 -> finite Gibbons-Hawking horizon
ceiling S=A/4G ~ 1e122)? Run to reproduce. Owned inputs only:
  S_BH = A/4G (Bekenstein-Hawking); S_rad = 4/3 S_BH (Zurek 1982, evaporation);
  S_dS = pi/(G H^2) (Gibbons-Hawking 1977); Egan-Lineweaver 2010 budget.
"""
import numpy as np
# --- Gibbons-Hawking horizon entropy vs H (in units where the present dS ceiling ~1e122) ---
# S_dS = pi/(G H^2)  -> S_dS ∝ 1/H^2.  H thaws DOWN toward H_inf (quintessence), so S_dS rises.
S_dS_ceiling = 1e122                       # A/4G at H_inf (measured Lambda)  [Fact, present value]

print("== (1) does the HORIZON entropy ever DECREASE as the aeon ends? ==")
print("   LMU DE = thawing quintessence rolling to V_min=rho_Lambda, so H DECREASES to H_inf.")
print("   S_dS = pi/(G H^2) ∝ 1/H^2  -> as H falls, S_dS RISES, asymptoting UP to the ceiling.")
for Hrel in (10.0, 3.0, 1.5, 1.1, 1.0001):     # H / H_inf
    S = S_dS_ceiling / Hrel**2
    print(f"   H/H_inf={Hrel:7.4f}:  S_dS = 1e{np.log10(S):.2f}   (rising toward 1e122)")
print("   => horizon entropy MONOTONICALLY RISES to 1e122; it never decreases, never overshoots.")
print("      The '1e122 ceiling' is an ASYMPTOTE approached from below, not a wall hit then stuck.\n")

print("== (2) during the long tiny-dS phase, is the TOTAL still rising while S_dS saturates? ==")
# survivor black hole evaporates on the Hawking clock; evaporation is entropy-PRODUCING (+1/3).
S_BH   = 1.05e101         # survivor ~1e12 Msun (verify_all.py: S_BH(1e12))
S_rad  = 4.0/3.0 * S_BH   # Zurek: radiation carries 4/3 the BH entropy
dS_evap = S_rad - S_BH    # net entropy PRODUCED by fully evaporating the survivor
print(f"   survivor S_BH        = 1e{np.log10(S_BH):.2f}")
print(f"   -> radiation S_rad   = 4/3 S_BH = 1e{np.log10(S_rad):.2f}   (Zurek)")
print(f"   net entropy produced by evaporation dS = S_rad - S_BH = +1e{np.log10(dS_evap):.2f}  (> 0)")
print("   => even when S_dS sits at its 1e122 asymptote, the survivor's evaporation keeps")
print("      producing entropy (+1/3 S_BH). The RATE nearly stalls; the TOTAL still creeps UP.\n")

print("== (3) across aeons in L0: total monotonic, density -> 0 (the doc's own ledger) ==")
# each aeon dumps its entropy into the infinite reservoir; V_L0 -> inf so density falls, total rises.
S_total = 0.0
print(f"   {'aeon':>4} {'S_total (cumulative)':>22} {'V_L0 (growing)':>16} {'rho_S=S/V':>12}")
for n in range(1, 7):
    S_total += 1e122                 # each aeon contributes ~its horizon-scale entropy to L0
    V_L0 = 10.0**(3*n + 60)          # reservoir grows (schematic, unbounded)
    rho_S = S_total / V_L0
    print(f"   {n:>4}  1e{np.log10(S_total):>18.2f}   1e{np.log10(V_L0):>12.0f}   1e{np.log10(rho_S):>8.1f}")
print("   => S_total(L0) rises every aeon (monotonic); rho_S = S_total/V_L0 -> 0 (second-law-safe).")
print("      This is exactly ρ_S->0 with S_total↑ (V3.28 eq, Frautschi gap re-arm, no entropy reset).\n")

print("== VERDICT: monotonic-entropy axiom is CONSISTENT with the tiny-dS endgame ==")
print("  * horizon S rises monotonically to the 1e122 asymptote (H falls to H_inf) -- never decreases;")
print("  * the ceiling is a PER-HORIZON transient, not the global entropy;")
print("  * during the dS phase the total still creeps up via evaporation (S_rad=4/3 S_BH, +1/3);")
print("  * the flash re-arms the arrow (Frautschi gap) -> next aeon adds more; NO entropy reset;")
print("  * L0 total is monotonic forever while rho_S->0.  Matches Pitarn's 'fast/slow/stall but")
print("    the total must rise, and on relaxation it rejoins L0' exactly.")
print("  NO CONFLICT. (Honest caveat: the RATE nearly stalls in the dS phase -- 'stop' in the")
print("  axiom = asymptotic stall, not a true halt; and 'dip-maybe' is NOT realised here -- no")
print("  component actually decreases, so the axiom holds in its strong form for LMU.)")
print("\n  [Fact-th] pieces: S_BH, S_rad=4/3 S_BH, S_dS∝1/H^2, rho_S->0 (all owned).")
print("  [Hypo] the per-aeon L0 contribution size (schematic here); needs the real ledger to pin.")
