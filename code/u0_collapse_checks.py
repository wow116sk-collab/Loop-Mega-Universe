#!/usr/bin/env python3
"""Rerunnable numbers behind LOG item 16b (2026-11-15): the "U1 expands through a
collapse" picture.  Nothing here is new physics -- every formula has an owner; the
script only prices the user's picture against them (R6: recompute, do not inherit).

Checks
  1. In-space infall (river flow v = sqrt(2GM/r), Gullstrand 1922 / Painleve 1921):
     radial vs transverse stretch rates and the sky fraction that would be redshifted.
  2. 4+1 Schwarzschild-Tangherlini interior (Tangherlini 1963): the 3-sphere of
     radius r shrinks r_s -> 0 in proper time tau = r_s/c (3+1 comparator: pi r_s/2).
  3. Measured bulk flow as a fraction of the Hubble velocity at the same depth
     (Watkins et al., MNRAS 524, 1885 (2023): 395 +/- 29 km/s at 150 h^-1 Mpc).
  4. Hawking temperature (Hawking 1974): hole mass at which kT = m_e c^2, and the
     share of a 1e11 Msun survivor's energy emitted after that point.
  5. Compton ("internal clock") frequency of the electron (de Broglie 1924).

Usage:  python3 u0_collapse_checks.py        (stdlib only; exits non-zero on failure)
"""
import math
import sys

# CODATA 2018 / IAU
hbar = 1.054571817e-34      # J s
h = 6.62607015e-34          # J s
c = 2.99792458e8            # m/s
G = 6.67430e-11             # m^3 kg^-1 s^-2
MeV = 1.602176634e-13       # J
m_e_c2 = 0.51099895 * MeV   # J
Msun = 1.98847e30           # kg

ok = True


def check(label, value, expect, rtol):
    global ok
    good = abs(value - expect) <= rtol * abs(expect)
    ok &= good
    print(f"[{'PASS' if good else 'FAIL'}] {label}: {value:.6g} (expect {expect:.6g})")


print("== 1. in-space infall: stretch pattern on the sky ==")
# v(r) = -sqrt(2GM/r).  Radial neighbours: H_r = dv/dr = +(1/2) sqrt(2GM/r^3).
# Transverse neighbours (same r, angle delta): H_t = v/r = -sqrt(2GM/r^3).
# In units of sqrt(2GM/r^3):
H_r, H_t = 0.5, -1.0
check("H_t / H_r", H_t / H_r, -2.0, 1e-12)
check("expansion scalar H_r + 2 H_t (negative = net contraction)", H_r + 2 * H_t, -1.5, 1e-12)
# Line-of-sight rate at angle theta from the infall axis: H_r cos^2 + H_t sin^2 > 0
theta = math.atan(math.sqrt(-H_r / H_t))          # tan^2(theta) = 1/2
check("redshift cone half-angle [deg]", math.degrees(theta), 35.2644, 1e-5)
frac = 1.0 - math.cos(theta)                        # two polar caps / 4 pi
check("sky fraction redshifted", frac, 0.183503, 1e-5)
print(f"       -> {100*frac:.1f}% redshift, {100*(1-frac):.1f}% blueshift; "
      "observed: redshift in every direction")

print("== 2. Tangherlini (4+1) interior: lifetime of the shrinking 3-sphere ==")
# ds^2 = -f dt^2 + dr^2/f + r^2 dOmega_3^2,  f = 1 - r_s^2/r^2.  Inside, along t = const:
# dtau = r dr / sqrt(r_s^2 - r^2)  ->  tau = r_s  (units c = 1, r_s = 1).
N = 2_000_000
# substitution r = sin(u): dtau = sin(u) du, u in [0, pi/2]  (removes the endpoint singularity)
tau5 = sum(math.sin((i + 0.5) * (math.pi / 2) / N) for i in range(N)) * (math.pi / 2) / N
check("tau_max / (r_s/c), 4+1", tau5, 1.0, 1e-9)
# 3+1 comparator: dtau = dr / sqrt(r_s/r - 1); r = sin^2(u): dtau = 2 sin^2(u) du
tau4 = sum(2 * math.sin((i + 0.5) * (math.pi / 2) / N) ** 2 for i in range(N)) * (math.pi / 2) / N
check("tau_max / (r_s/c), 3+1", tau4, math.pi / 2, 1e-9)
print("       -> the isotropic 3-space inside a 4+1 collapse CONTRACTS (blueshift); "
      "its expanding twin is the time-reversed (white-hole) branch")

print("== 3. bulk flow vs Hubble velocity at 150 h^-1 Mpc ==")
v_bulk = 395.0                       # km/s, Watkins et al. 2023
v_hubble = 100.0 * 150.0             # km/s: H0 = 100 h km/s/Mpc times 150 h^-1 Mpc
check("bulk flow / Hubble velocity", v_bulk / v_hubble, 0.02633, 1e-3)

print("== 4. Hawking flash: how much of the output can carry rest mass ==")
# kT_H = hbar c^3 / (8 pi G M)
M_e = hbar * c**3 / (8 * math.pi * G * m_e_c2)      # kg
check("M where kT_H = m_e c^2 [g]", M_e * 1e3, 2.07e16, 5e-3)
kT_at_1e10kg_GeV = hbar * c**3 / (8 * math.pi * G * 1e10) / (1e3 * MeV)
check("kT_H at M = 1e13 g [GeV]", kT_at_1e10kg_GeV, 1.058, 5e-3)
M_L1 = 1e11 * Msun
check("energy share emitted below that mass (1e11 Msun survivor)", M_e / M_L1, 1.04e-28, 1e-2)

print("== 5. electron Compton frequency ==")
check("m_e c^2 / h [Hz]", m_e_c2 / h, 1.2356e20, 1e-4)

print("\nALL PASS" if ok else "\nFAILURES")
sys.exit(0 if ok else 1)
