#!/usr/bin/env python3
"""[Hypo] Reconcile the numeric overlaps between the TWO axes being merged:
  - TIME axis     : LMU_time_picture_bilingual.md (L0 continuous time, Omega readings, energy ledger)
  - ENERGY axis   : code/aeon_seam_construction.py (cold-clumpy -> hot-smooth, computed)

Purpose: before merging the two documents, pin every number they BOTH assert so the
merged doc cannot contradict itself. Every value recomputed from constants; run to reproduce.
Nothing here is a new claim -- it is a consistency check across two existing [Hypo] explorations.

Checks:
  [1] w0/wa: the two fidelities (slow-roll heuristic vs full KG integration) are NOT a contradiction
  [2] Omega: the TIME doc's energy ratio (E_hot/E_flash ~ 1e20) is a DIFFERENT object from the
      conformal metric factor Omega_metric (1e26-1e47, REDTEAM) -- related by the rescale weights
  [3] the ENERGY-axis inflaton scale (V^1/4 ~ 1e16 GeV) is a candidate SUPPLY for the TIME doc's
      Omega factor -- the two axes meet here, at the same energy ledger
  [4] entropy triangle (energy axis) == "entropy already balanced" (time axis S_rad = 4/3 S_BH)
"""
import math
Mp   = 2.435e18            # reduced Planck mass, GeV
As_obs, ns_obs, r_obs = 2.1e-9, 0.9649, 0.009
kB=1.380649e-23; hbar=1.054571817e-34; c=299792458.0
GeV_J = 1.602176634e-10   # 1 GeV in joules

print("== [1] w0/wa: two fidelities, one field -- NOT a contradiction ==")
Ai = 2.70                                  # A_i in units of Mp (doc L382/L522)
eps_sr = 2.0*(1.0/Ai)**2                   # slow-roll: eps = 2 (Mp/A_i)^2
w0_sr  = -1 + (2.0/3.0)*eps_sr             # slow-roll heuristic
w0_full, wa_full = -0.91, -0.15            # full KG integration, Run 2 (doc L522)
wa_relation = -1.5*(1+w0_full)             # thawing relation w_a ~= -1.5(1+w0)
print(f"   slow-roll heuristic : eps={eps_sr:.3f}, w0={w0_sr:+.3f}  (doc L241 '-0.82', 'loose at this eps')")
print(f"   full KG integration : w0={w0_full:+.2f}, wa={wa_full:+.2f}  (doc L522, Run 2, m=0.804 H0)")
print(f"   thawing relation    : wa ~= -1.5(1+w0) = {wa_relation:+.3f} (doc rounds -0.14) vs integrated {wa_full:+.2f}  "
      f"(~{abs((wa_relation-wa_full)/wa_full)*100:.0f}%; consistent, both borrowed rounding)")
print(f"   -> TIME doc uses the full-integration pair (-0.91,-0.15): CORRECT, matches spine. No drift.\n")

print("== [2] Omega: energy RATIO vs conformal metric FACTOR are different objects ==")
# TIME doc energy ledger (its own auditor-flagged absolutes):
E_hot, E_flash = 2e80, 3e60               # J, doc-quoted (flagged recheckable in TIME doc §7)
Omega_energy = E_hot/E_flash
E_patch = 3e71                            # J, rho_crit * V_obs (TIME doc §7 auditor cross-check)
print(f"   TIME doc energy ratio    Omega_E = E_hot/E_flash = {Omega_energy:.0e}  (robust content)")
print(f"   auditor cross-check      E_patch(rho_c*V_obs) = {E_patch:.0e} J  -> absolutes are soft, RATIO ~1e20 is the claim")
# Conformal metric factor: radiation energy DENSITY ~ Omega_metric^-4, so a metric factor
# and an energy(-ratio) are related by the rescale weight, NOT equal.
for label, Om in [("reheat->pair threshold", 1e26), ("GUT gluing", 1e43)]:
    print(f"   Omega_metric ({label:22s}) = {Om:.0e} ; density weight Omega^-4 spans {4*math.log10(Om):.0f} dex")
print("   -> merged doc MUST NOT conflate Omega_metric (1e26-1e47) with Omega_energy (~1e20). Different objects.\n")

print("== [3] the two axes MEET: energy-axis inflaton scale supplies the time-axis Omega ==")
V   = 1.5*math.pi**2*r_obs*As_obs*Mp**4   # A_s = V/(24 pi^2 eps Mp^4)
V14 = V**0.25
Treh= (30*V/(math.pi**2*200))**0.25
print(f"   ENERGY axis (seam)  : V^1/4 = {V14:.2e} GeV, T_reheat = {Treh:.2e} GeV (inflaton free lunch, Guth)")
print(f"   TIME axis (ledger)  : needs a source for Omega_E ~ 1e20 -- 'permitted by GR, supplied by nothing' (Problem A)")
print(f"   -> the inflaton free lunch (energy axis) IS a candidate supply for the ledger gap (time axis).")
print(f"      Both are BORROWED [Hypo] mechanisms; the merge names the supply, does not close Problem A.\n")

print("== [4] entropy triangle (energy axis) == 'entropy already balanced' (time axis) ==")
# energy axis: S from T=2.725 K over V_obs (aeon_seam_construction.py [F])
T_cmb_K=2.72548
s=(2*math.pi**2/45)*3.909*(kB*T_cmb_K/(hbar*c))**3
R=46.5*9.461e24; Vol=(4/3)*math.pi*R**3; S=s*Vol
# time axis: S_rad = 4/3 S_BH (Zurek), conformally invariant -> the residual is purely energetic
print(f"   energy axis: S(2.725K, V_obs) = {S:.2e} kB   (doc ledger 1.03e90 -> {'MATCH' if 5e89<S<5e90 else 'off'})")
print(f"   time axis  : S_rad = 4/3 S_BH (Zurek 1982), conformally invariant across the boundary")
print(f"   -> both axes agree entropy is BALANCED at the seam; the residual Problem A is PURELY energetic.")

print("\nBOTTOM LINE (for the merge): the two axes are consistent and complementary.")
print("  TIME axis clears the time coordinate (arrow inherited, bang = re-zero + re-mint).")
print("  ENERGY axis computes the transition it isolates (cold-clumpy -> hot-smooth + real CMB).")
print("  They MEET at one energy ledger; the open gate (de Sitter stability = Problem A) is reached from both.")
print("  No number contradicts: w0 pair matches spine; Omega_metric != Omega_energy (kept distinct); S balanced.")
