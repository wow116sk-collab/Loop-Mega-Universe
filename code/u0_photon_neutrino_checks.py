#!/usr/bin/env python3
"""Rerunnable numbers behind LOG item 17 (2026-11-15, second sitting): photons, neutrinos,
pair creation in a photon pile, entropy carried by a newborn patch.  Every formula has an
owner (named inline); the script only prices the author's statements against them.

Usage:  python3 u0_photon_neutrino_checks.py      (stdlib only; exits non-zero on failure)
"""
import math
import sys

hbar, h, c, G, kB = 1.054571817e-34, 6.62607015e-34, 2.99792458e8, 6.67430e-11, 1.380649e-23
e, m_e, eps0 = 1.602176634e-19, 9.1093837015e-31, 8.8541878128e-12
Msun, yr, ly = 1.98847e30, 3.15576e7, 9.4607e15
m_e_eV = 0.51099895e6

ok = True


def check(label, value, expect, rtol):
    global ok
    good = abs(value - expect) <= rtol * abs(expect)
    ok &= good
    print(f"[{'PASS' if good else 'FAIL'}] {label}: {value:.4g} (expect {expect:.4g})")


print("== 1. neutrino radiative decay, Standard-Model rate ==")
# tau ~ 6.2e43 s / (|U_tau,i|^2 |U_tau,f|^2) * (eV/m_i)^5   (Giunti & Studenikin, arXiv:1403.6344, eq. 5.10)
mix = 0.1                       # order-of-magnitude mixing factor (not pinned)
for name, m in (("nu3", 0.050), ("nu2", 0.0087)):
    tau_yr = 6.2e43 / mix * (1.0 / m) ** 5 / yr
    print(f"       {name}: m >= {m} eV -> tau ~ {tau_yr:.1e} yr")
check("nu3 lifetime [yr], order", 6.2e43 / mix * (1 / 0.050) ** 5 / yr, 6.3e43, 0.05)
check("nu2 lifetime [yr], order", 6.2e43 / mix * (1 / 0.0087) ** 5 / yr, 3.9e47, 0.05)
E_gamma = (0.050**2 - 0.0**2) / (2 * 0.050)     # eV, nu3 -> nu1 + gamma with m1 ~ 0
check("photon energy from nu3 decay [eV]", E_gamma, 0.025, 1e-9)
check("its wavelength [micron]", 1.23984 / E_gamma, 49.6, 1e-3)

print("== 2. two-photon pair creation with flash-bath photons (Breit & Wheeler 1934) ==")
kT_eV = 5.8e-28 * kB / e                         # energy-weighted flash temperature, LOG 15g
check("kT of the bath [eV]", kT_eV, 5.0e-32, 0.01)
have, need = kT_eV**2, 2 * m_e_eV**2
check("orders of magnitude short of threshold (E1*E2)", math.log10(need / have), 74.3, 0.01)

print("== 3. field route (Sauter 1931; Heisenberg-Euler 1936; Schwinger 1951) ==")
E_c = m_e**2 * c**3 / (e * hbar)
check("critical field E_c [V/m]", E_c, 1.323e18, 1e-3)
u_c = eps0 * E_c**2
check("energy density at E_c [J/m^3]", u_c, 1.55e25, 5e-3)
check("as mass density [kg/m^3]", u_c / c**2, 1.73e8, 5e-3)
R_own = c / math.sqrt(8 * math.pi * G * (u_c / c**2) / 3)
check("size at which that density is its own horizon [m]", R_own, 9.65e8, 5e-3)
check("its mass [Msun]", c**2 * R_own / (2 * G) / Msun, 3.27e5, 1e-2)
u_cmb = 7.5657e-16 * 2.7255**4
E_rms = math.sqrt(u_cmb / eps0)
check("exponent pi*E_c/E for a pile as dense as today's CMB", math.pi * E_c / E_rms, 6.1e19, 0.02)

print("== 4. entropy: newborn patch vs the pile it ignites in (Bekenstein 1973; Gibbons-Hawking 1977) ==")
H_inf = 2.46e37                                  # from u0_chain_gapfinder.py (r = 0.0037 plateau)
S_seed = math.pi * c**5 / (G * hbar * H_inf**2)
S_bh = lambda M: 4 * math.pi * G * M**2 / (hbar * c)
check("entropy of one inflating Hubble patch [k_B]", S_seed, 1.8e12, 0.03)
check("entropy of a 1.4e23 Msun pile hole [k_B]", S_bh(1.4e23 * Msun), 2.1e123, 0.03)
check("log10(seed / pile)", math.log10(S_seed / S_bh(1.4e23 * Msun)), -111.0, 0.005)

print("== 5. smallest pile that can hold flash photons from a 1e11 Msun survivor ==")
T1 = hbar * c**3 / (8 * math.pi * G * 1e11 * Msun * kB)
lam = h * c / (5 * kB * T1)                      # <E> ~ 5 kT_H (Page 1976)
check("minimum pile mass / M_L1 (R > wavelength)", c**2 * lam / (2 * G) / (1e11 * Msun), 15.8, 0.01)

print("== 6. old photons after inflation ==")
check("log10 dilution of radiation over 60 e-folds (a^-4)", -240 / math.log(10), -104.2, 1e-3)

print("== 7. why a neutrino crosses matter and a photon does not (1 MeV, lead) ==")
n_e = 11340.0 / 1.66054e-27 * (82 / 207.2)       # electrons per m^3
sigma_nu = 9.2e-49                               # m^2, nu_e - e elastic at 1 MeV (order; not pinned)
mfp_nu = 1 / (n_e * sigma_nu)
mfp_gamma = 1 / (0.071 * 11.34) * 1e-2           # m, mass attenuation 0.071 cm^2/g at 1 MeV (order; not pinned)
print(f"       neutrino mean free path ~ {mfp_nu / ly:.0f} light-years; photon ~ {mfp_gamma * 100:.1f} cm")
check("log10 ratio of mean free paths", math.log10(mfp_nu / mfp_gamma), 19.5, 0.02)

print("\nALL PASS" if ok else "\nFAILURES")
sys.exit(0 if ok else 1)
