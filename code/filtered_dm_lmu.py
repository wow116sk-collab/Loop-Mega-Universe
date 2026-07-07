#!/usr/bin/env python3
"""The user's idea = FILTERED / BUBBLE-WALL dark matter (Baker-Kopp-Long 2019 et seq.),
applied to LMU's GUT-scale CDL bubble. Order-of-magnitude; the detailed relic uses the
borrowed machinery (cited in review/JOINT3_filtered_dm.md), not redone here.

Question: if DM is produced/filtered at the LMU bubble wall (T ~ T_reh ~ 1e15 GeV),
what is its mass, and does it converge with Penrose's Planck-mass erebon?
"""
import math
T_reh = 2.8e15          # GeV, LMU reheat / transition scale (alpha=1 case)
Mpl   = 1.22e19         # GeV
Msun_g_planck = 1e-5    # Penrose erebon ~ 1e-5 g ~ Planck mass

print("== Filtered-DM mass scale for the LMU GUT-scale bubble ==")
print(f"  transition/reheat scale T ~ {T_reh:.0e} GeV")
print(f"  filtered-DM survival ~ exp(-M_chi/(2 gamma_w T)); relic match needs M/(2 gamma_w T) ~ 25-40")
print(f"  {'gamma_w (wall boost)':>20} {'M_chi ~ (65) gamma_w T [GeV]':>30}")
for gw in (1, 1e1, 1e2, 1e3):
    M = 65*gw*T_reh
    flag = "  <-- super-Planckian, excluded" if M>Mpl else ""
    print(f"   {gw:>20.0e} {M:>30.1e}{flag}")
print(f"  -> viable window M_chi ~ 1e17-1e18 GeV (super-heavy / WIMPzilla), for gamma_w ~ 1-10.\n")

print("== Convergence with Penrose's erebon ==")
print(f"  Penrose erebon: ~1e-5 g ~ Planck mass ~ {Mpl:.0e} GeV (dark matter = quantized Omega).")
print(f"  LMU filtered DM (GUT wall): ~1e17-1e18 GeV -- within ~1-2 orders of the Planck mass.")
print(f"  => BOTH give ~Planck-scale dark matter, by DIFFERENT mechanisms (Omega-quantum vs wall-filter).")
print(f"     The SCALE agrees; the ORIGIN differs. LMU can take the wall-filter origin and keep")
print(f"     Omega as the inflaton -- no need to make Omega the dark matter (which is the conflict).\n")

print("== What this does for joint #3 (honest) ==")
print("  RESOLVES the conflict by REMOVING the need for Omega=DM: DM is filtered at the wall")
print("    (Baker-Kopp-Long 2019; Azatov 2021; Giudice 2024), an INDEPENDENT source, so Omega is")
print("    free to be the inflaton. Penrose's erebon is simply not adopted; LMU uses filtered DM.")
print("  CONSISTENT with LMU re-minting (B4'): filtered DM is PRODUCED AT the transition/hot start,")
print("    NOT carried from the old aeon -- a concrete realization of 'DM minted fresh at reheating'.")
print("  DOES NOT prove the wiring (Omega=inflaton stays [Hypo]); requires DM to COUPLE to Phi_gen")
print("    (get its mass at the transition) -- a model-building input, not automatic.")
print("  ONE-BUBBLE caveat: LMU's single-bubble convention keeps the single-WALL filtering channel")
print("    (Azatov/Ai expansion) but NOT the bubble-COLLISION production (needs many bubbles).")
print("  BORROWED: the mechanism is filtered/bubble-wall DM (2019-2026), not new -- only the")
print("    application to the LMU crossing is the wiring.")
