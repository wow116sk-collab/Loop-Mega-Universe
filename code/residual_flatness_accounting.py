#!/usr/bin/env python3
"""ATTEMPT to close the '+3 spread' (item 1). Find where it sticks.

The pinned script residual_dilution_to_floor.py compares
    rho_curv(after N=57 e-folds of inflation)  vs  Lambda/M_Pl^4 (TODAY's floor)
and finds curvature (a^-2) short by ~63 orders. This script asks whether that
'63 orders' is physics or a BOOKKEEPING choice, by doing the full accounting the
standard flatness problem uses: dilute the residual curvature ALL THE WAY TO TODAY
(inflation + the whole post-inflation history) and compare to TODAY's critical
density. Run to reproduce.
"""
import math
ln10 = math.log(10)
def order(x): return math.log10(x)

# --- constants (reduced Planck units throughout; flag the convention) ---
MPl   = 2.435e18                      # reduced Planck mass, GeV
V14   = 8e15                          # inflaton scale V^(1/4), GeV
T0    = 2.35e-13                      # present photon temperature kT0, GeV (2.725 K)
greh  = 106.75; g0 = 3.91             # entropic dof at reheating / today
rho_inf = (V14/MPl)**4                # inflaton energy in M_Pl^4  (~1e-10)
# present critical density in reduced-Planck units: rho_crit = 3 H0^2 M_Pl^2
H0    = 1.44e-42                       # 67.4 km/s/Mpc in GeV
rho_crit0 = 3*H0**2*MPl**2 / MPl**4   # = 3 (H0/MPl)^2
OmLam = 0.68

print("== setup (reduced Planck units) ==")
print(f"  rho_inf/M_Pl^4      = 1e{order(rho_inf):.1f}   (drives inflation)")
print(f"  rho_crit,today/MPl^4= 1e{order(rho_crit0):.1f}   (= today's floor; rho_Lambda = {OmLam}x this)")
print(f"  [note] the pin writes '1e-122' using the NON-reduced M_Pl; in reduced units")
print(f"         the floor is ~1e-120. The argument below is identical either way.\n")

# --- worst case: curvature is as large as it can be at the onset of inflation ---
# (for slow roll to START, curvature must be <= inflaton energy; take equality = worst case)
rho_curv_onset = rho_inf

print("== (A) the pin's accounting: 57 e-folds of inflation, stop at inflation's end ==")
N_CMB = 57.0
rho_curv_end = rho_curv_onset*math.exp(-2*N_CMB)
print(f"  rho_curv after {N_CMB:.0f} e-folds (a^-2): 1e{order(rho_curv_onset):.1f} -> 1e{order(rho_curv_end):.1f}")
print(f"  vs today's floor 1e{order(rho_crit0):.1f}: short by {order(rho_curv_end)-order(rho_crit0):.0f} orders")
print(f"  --> this is the '63-ish orders short'. But it stopped the clock at inflation's END\n")

# --- (B) the standard flatness accounting: keep diluting to TODAY ---
# post-inflation expansion: instant reheating at T_reh set by rho_rad = rho_inf
rho_inf_GeV4 = rho_inf*MPl**4
Treh = (30*rho_inf_GeV4/(math.pi**2*greh))**0.25
a_ratio_post = (greh/g0)**(1/3) * Treh/T0        # a_today/a_reh (entropy conservation)
N_post = math.log(a_ratio_post)
print("== (B) standard flatness accounting: dilute curvature ALL THE WAY TO TODAY ==")
print(f"  reheating T_reh = {Treh:.2e} GeV ; post-inflation e-folds N_post = ln(a0/a_reh) = {N_post:.1f}")
print(f"  curvature keeps going a^-2 through the radiation+matter eras (it does not stop)\n")

def OmegaK_today(N_total):
    rho_curv_today = rho_curv_onset*math.exp(-2*(N_total+N_post))
    return rho_curv_today/rho_crit0

for N_total in (57,60,63,66,69,81):
    Ok = OmegaK_today(N_total)
    tag = "FLAT ok (<0.01)" if Ok<0.01 else ("subdominant (<1)" if Ok<1 else "OVER-curved")
    print(f"  N_total={N_total:2d}: Omega_k,today = 1e{order(Ok):+.1f}   {tag}")

# solve for the minimum total e-folds
# rho_curv_onset e^-2(N+Npost) = bound * rho_crit0
def Nmin(bound):
    return (math.log(rho_curv_onset/(bound*rho_crit0)))/2 - N_post
print(f"\n  N_total needed for Omega_k<1     : {Nmin(1.0):.1f}")
print(f"  N_total needed for Omega_k<0.01  : {Nmin(0.01):.1f}   (the OBSERVED flatness bound)\n")

print("== reading (framed by Omega_k, the curvature FRACTION -- the thing that matters) ==")
print("  * The '63 orders short' is a BOOKKEEPING artifact of EPOCH mismatch: the pin compared")
print("    rho_curv at inflation's END (1e-59) to the floor's value TODAY. The clean quantity is")
print("    the ratio Omega_k = rho_curv/rho_crit at ONE epoch. Inflation drives Omega_k DOWN ~a^-2")
print("    (to ~1e-49..1e-57 at inflation's end); then post-inflation Omega_k GROWS BACK ~a^+2")
print("    (radiation)/a^+1 (matter) by ~53 orders (rho_crit falls FASTER than a^-2). Inflation")
print("    must PRE-PAY: enough e-folds that AFTER the re-growth Omega_k,today < 0.01. (Post-")
print("    inflation expansion ERODES flatness; it is inflation that must over-flatten up front.)")
print("  * So item 1 IS the standard FLATNESS problem. Among the diluting components curvature")
print("    a^-2 is the SLOWEST (radiation a^-4, shear a^-6 faster) -> the HARDEST of the three,")
print("    needing the MOST e-folds. The pin was RIGHT that curvature is the slow one; its ONLY")
print("    error was the epoch. Curvature is the canonical case inflation is built to solve, and")
print(f"    enough TOTAL e-folds solve it: N_total >~ {Nmin(0.01):.0f} (worst case here).")
print("  * The observed N_CMB=57 (Planck tilt) is only the LAST 57 e-folds; N_total can be")
print("    larger (extra pre-pivot e-folds). Under ACT DR6 the tilt gives N_CMB=69-81, which")
print("    ALREADY exceeds N_total,min -> flatness solved with room to spare, no extra e-folds.")
print("  * alpha-attractor plateau has super-Planckian field range -> N_total >> 66 is generic.")
print()
print("== where it STICKS (the honest residue) ==")
print("  1. It needs the flash to kick the omega-inflaton HIGH ENOUGH on the plateau to give")
print("     N_total >~ 63. That 'how high does the flash place the field' = the flash->plateau")
print("     initial condition = MERGES INTO item 2 (the wiring). It is not a separate open item.")
print("  2. Finer point (Pitrou-Pereira-Uzan 2008): the largest-scale (low-l) CMB modes that")
print("     exited during any early shear-dominated phase can carry IC-dependent imprints. That")
print("     is a low-l anomaly question, separate from the 'born on the floor' ENERGY question,")
print("     and it is the 1e-5 CONTRAST channel (already handled), not the energy channel.")
print("  3. Assumes no component slower than a^-2 (e.g. domain walls a^-1). LMU posits none in")
print("     the residual; a wall network would reopen it, but nothing in the picture makes them.")
