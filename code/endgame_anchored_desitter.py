#!/usr/bin/env python3
"""'Plug in V_min ~ 0, de Sitter ~ 0' -- but anchored to the MEASURED Lambda, not
invented. Shows the tiny-nonzero endgame values are FIXED by present-day data, and
states precisely what that anchoring does and does NOT fix. Run to reproduce.
Borrowed throughout (Gibbons-Hawking; the measured Lambda); nothing new.
"""
import math
G=6.67430e-11; c=299792458.0; hbar=1.054571817e-34; kB=1.380649e-23
H0=2.20e-18            # 1/s (measured)
OmL=0.69              # measured dark-energy fraction
eV=1.602176634e-19

print("== The endgame is not a free 'exactly 0' -- it is fixed by the measured Lambda ==")
rho_crit=3*H0**2/(8*math.pi*G)
rho_L=OmL*rho_crit                                    # kg/m^3
V_min=rho_L*c**2                                      # J/m^3 (energy density)
scale_J=(V_min*(hbar*c)**3)**0.25                     # (energy density)^1/4 -> J
scale_eV=scale_J/eV                                   # -> eV (dark-energy scale ~2.3 meV)
scale_eV=scale_J/eV
Hinf=H0*math.sqrt(OmL)                                 # asymptotic de Sitter rate
T_dS=hbar*Hinf/(2*math.pi*kB)                          # Gibbons-Hawking temperature
S_dS=math.pi*c**5/(hbar*G*Hinf**2)                    # A/4G in units of kB (= pi c^5/(hbar G H^2))
print(f"  V_min = rho_Lambda  = {rho_L:.2e} kg/m^3 = ({scale_eV*1e3:.1f} meV)^4   -> tiny but NONZERO")
print(f"  H_inf = H0 sqrt(OmL) = {Hinf:.2e} /s        (the asymptotic de Sitter rate)")
print(f"  T_dS  = hbar H/2pi/kB = {T_dS:.2e} K         (Gibbons-Hawking; NONZERO -> not truly dead)")
print(f"  S_dS  = A/4G          = {S_dS:.1e} kB        (the ceiling)")
print(f"  -> every endgame value is ANCHORED to the measured Lambda. 'V_min~0, de Sitter~0'")
print(f"     means tiny-but-nonzero, at the OBSERVED scale -- a fit to data, not a free choice.\n")

print("== What anchoring to the present DOES fix (the integrable line) ==")
print("  fit (n_s, A_s, T_cmb, Omega_Lambda, H0) at today -> integrate the borrowed equations")
print("  backward to just-after-the-bang and forward to this tiny de Sitter. The whole LINE")
print("  (flow, mass, heat, energy) is pinned by data. This is a valid RETRODICTION.\n")

print("== What anchoring does NOT fix (the joints) ==")
print("  (1) DECAY / stability: anchoring fixes the tiny de Sitter's VALUE (H_inf, T_dS, S),")
print("      but NOT whether it DECAYS (Gamma>0, relights) or is stable (Gamma=0, dead). No")
print("      present measurement pins that -- it is the de Sitter-stability question (Volovik")
print("      vs Boddy-Carroll-Pollack). Joint #1 stays open even with V_min anchored.")
print("  (2) the WIRING: Penrose's Omega=dark-matter objection is REMOVED (dark matter now")
print("      from the bubble wall, filtered DM) -- but that only frees Omega to be the inflaton;")
print("      it does NOT prove Omega=inflaton. 'Kicked Penrose's Omega out' = conflict gone,")
print("      not identity proven. Joint #3 wiring stays [Hypo].\n")

print("== Net ==")
print("  YES: plug borrowed equations, fit the measured present, integrate back, use the")
print("       measured-Lambda tiny de Sitter as the floor. That LINE is consistent and data-")
print("       pinned, and Penrose's Omega conflict is gone.")
print("  BUT: it is a RETRODICTION (built to match today), not a proof; and two things no")
print("       measurement fixes remain -- does the tiny de Sitter DECAY (P>0), and is Omega")
print("       really the inflaton. Those are the [open]/[Hypo] joints, unchanged.")
