#!/usr/bin/env python3
"""Gap-finder for the U0 birth chain (LOG item 16b, author's wiring; every equation has an owner).

Feeds the author's picture through existing equations, one link at a time, and labels each
link PASS (existing equation carries it), GAP (an equation is missing), or NEEDS INPUT
(a parameter the documents do not fix).  It decides nothing about nature.

Collision check (LOG item 18): links B and C1 re-enter the closed routes "energy/event-based
ignition" and "hold a large patch to ignite" (Part VIII sec. 2). Keep this script as the
audit trail of why, not as a live route.

Chain:  L1 flash -> radiation in U0 (A = 0, static) -> pile reaches threshold -> collapse
        -> ignition (A > 0) -> inflation -> hot bath;  exterior hole evaporates back into U0.

Usage:  python3 u0_chain_gapfinder.py        (stdlib only)
"""
import math

hbar, h, c, G, kB = 1.054571817e-34, 6.62607015e-34, 2.99792458e8, 6.67430e-11, 1.380649e-23
Msun, yr, GeV = 1.98847e30, 3.15576e7, 1.602176634e-10
GeV4_to_J_m3 = GeV**4 / (hbar * c) ** 3

# ---- author-side inputs (defaults = values already used in the documents) -------------
M_L1 = 1e11 * Msun          # survivor mass
r_tensor = 0.0037           # plateau prediction carried by the documents (F4 band centre)
rho_U0_scan = [1e-30, 1e-27, 1e-24, 1e-20]   # kg/m^3 -- NOT fixed anywhere in the documents

rows = []


def T_H(M):                 # Hawking 1974
    return hbar * c**3 / (8 * math.pi * G * M * kB)


def r_s(M):                 # Schwarzschild 1916
    return 2 * G * M / c**2


def t_evap_yr(M):           # photon+graviton scaling used in LOG 15c
    return 2.1e67 * (M / Msun) ** 3


print("== A. fuel: one flash ==")
T1 = T_H(M_L1)
lam1 = h * c / (5 * kB * T1)                      # <E> ~ 5 kT_H (Page 1976, as in LOG item 9)
print(f"T_H = {T1:.2e} K, mean photon wavelength = {lam1:.2e} m = {lam1 / r_s(M_L1):.1f} r_s, "
      f"t_evap = {t_evap_yr(M_L1):.1e} yr")
rows.append(("A fuel supply", "PASS", "Hawking 1974; Page 1976"))

print("\n== B. threshold: when does a radiation pile close on itself? ==")
print("   uniform density rho inside its own Schwarzschild radius: R = c*sqrt(3/(8 pi G rho))")
print(f"   {'rho_U0 [kg/m3]':>15} {'R [m]':>10} {'M_pile [Msun]':>14} {'flashes needed':>15} "
      f"{'e-fold time [yr]':>17}")
for rho in rho_U0_scan:
    R = c * math.sqrt(3 / (8 * math.pi * G * rho))
    M = c**2 * R / (2 * G)
    tfold = 1 / math.sqrt(32 * math.pi * G * rho / 3) / yr      # radiation: a'' = -(8 pi G/3) rho a ... order
    print(f"   {rho:15.0e} {R:10.2e} {M / Msun:14.2e} {M / M_L1:15.2e} {tfold:17.2e}")
rho_line = (c**3 / (2 * G * 1e5 * Msun)) ** 2 * 3 / (8 * math.pi * G)
print(f"   pile mass falls to the 1e5 Msun Schwinger line only if rho_U0 > {rho_line:.1e} kg/m3")
rows.append(("B threshold mass", "NEEDS INPUT", "rho_U0 (population density of dead U1s) is not fixed"))

print("\n== C. ignition density vs what collapse delivers ==")
V14 = 1.06e16 * (r_tensor / 0.01) ** 0.25          # GeV; standard r <-> energy-scale relation
rho_inf = V14**4 * GeV4_to_J_m3 / c**2             # kg/m^3
T_rad = V14 * (30 / (math.pi**2 * 106.75)) ** 0.25
print(f"plateau scale V^(1/4) = {V14:.2e} GeV  ->  rho_inf = {rho_inf:.1e} kg/m3")
rho_demo = 1e-27
print(f"density of a pile at horizon formation (rho_U0 = {rho_demo:.0e}): {rho_demo:.0e} kg/m3 "
      f"-> {math.log10(rho_inf / rho_demo):.0f} orders short at the horizon")
print("classical GR supplies the rest of the compression inside the horizon (density is unbounded there)")
print(f"radiation compressed to rho_inf has kT = {T_rad:.1e} GeV: still a gas with w = +1/3, not w = -1")
rows.append(("C1 compression to rho_inf", "PASS", "interior collapse (Oppenheimer-Snyder 1939; Tangherlini 1963 in 4+1)"))
rows.append(("C2 radiation -> vacuum energy (A > 0)", "GAP", "no equation in the documents; owners of candidates: "
             "Frolov-Markov-Mukhanov 1990, Farhi-Guth-Guven 1990"))

print("\n== D. how much energy does the seed need? ==")
H_inf = math.sqrt(8 * math.pi * G * rho_inf / 3)
M_seed = c**3 / (2 * G * H_inf)
print(f"H_inf = {H_inf:.2e} 1/s; one inflating Hubble patch weighs M_seed = {M_seed * 1e3:.2f} g")
rows.append(("D energy for the seed", "PASS", "grams suffice (Guth 1981; Farhi-Guth 1987) -- amount of fuel is not the constraint"))

print("\n== E. ledger seen from U0: what comes back, and in what form ==")
rho = rho_demo
R = c * math.sqrt(3 / (8 * math.pi * G * rho)); Mp = c**2 * R / (2 * G); N = Mp / M_L1
T2 = T_H(Mp); lam2 = h * c / (5 * kB * T2)
print(f"pile of {Mp / Msun:.1e} Msun (= {N:.1e} flashes) evaporates in {t_evap_yr(Mp):.1e} yr at T_H = {T2:.1e} K")
print(f"energy returned to U0 = M c^2 exactly (exterior mass is conserved) -> PASS for energy")
print(f"returned wavelength = {lam2 / r_s(Mp):.1f} r_s(pile): the next pile must be > {lam2 / r_s(Mp):.0f}x heavier to hold it")
print(f"horizon entropy: one pile / the {N:.1e} survivors that fed it = {N:.1e}x  (S ~ M^2)")
rows.append(("E1 energy returned to U0", "PASS", "exterior (ADM) mass; Hawking 1974"))
# Author's reply (LOG 17g): U0 need not be a steady state -- entropy may grow without bound in an
# infinite arena (owner: Carroll & Chen 2004), and a newborn takes only its seed entropy.
rows.append(("E2 entropy growth of U0", "PASS", "no steady state required (Carroll-Chen 2004); numbers in "
             "u0_photon_neutrino_checks.py"))
rows.append(("E2b fuel softening / floor on pile mass", "GAP", "floor = ~16x the smallest hole feeding U0 ONLY IF "
             "U1's interior radiation gets back out -- hangs on E3"))
rows.append(("E3 'U1 dissolves back into U0'", "GAP", "U0 only ever receives the exterior mass; the return channel for "
             "U1's interior content has no equation"))

print("\n== F. the 4+1 layer ==")
rows.append(("F 4+1 numbers (G_5 / crossover scale, wall tension sigma, V(A))", "NEEDS INPUT",
             "none fixed in the documents; only bound in hand: screening scale > ~20 Mpc (Pardo et al. 2018)"))

print("\n== verdict table ==")
for name, verdict, note in rows:
    print(f"[{verdict:11}] {name}: {note}")
