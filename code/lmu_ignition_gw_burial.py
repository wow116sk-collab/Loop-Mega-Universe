#!/usr/bin/env python3
"""[Hypo] Two corrections to the ignition-GW picture, both from the author's point:
  (1) a SINGLE small O(4) bubble is a WEAK GW source -- not because it is small, but
      because of symmetry: LMU's 'one-flash-one-aeon' convention (doc L1529 rev iv,
      Coleman-De Luccia O(4)->O(3,1)) means ONE spherical bubble, no collisions, and
      it nucleates into COLD vacuum (no plasma ahead) -> the collision + sound-wave
      channels that gave Omega_GW~1e-9 in code/lmu_ignition_gw.py are SYMMETRY-SUPPRESSED.
      That [B] estimate assumed a multi-bubble transition; for LMU it is an overestimate.
  (2) whatever stochastic GW ignition leaves is BURIED by the astrophysical/structure-
      formation GW background (SMBH binaries etc.) in every direct-detection band.

The one signal that survives both: the inflationary tensor [A], because it is a CMB
B-mode polarization imprint at recombination, NOT a stochastic background competing
in a detector band. Structure enters there only as delensable lensing-B + dust.

Numbers are standard/order-of-magnitude (NANOGrav 2023; LISA; ET projections; Planck).
Run to reproduce. Mechanisms borrowed; nothing claimed novel.
"""
import math

print("== [1] One-bubble symmetry suppression: why 'small single bubble' is right ==")
print("   GW from a first-order transition needs one of:")
print("     - bubble COLLISIONS (break sphericity)   -> LMU has ONE bubble -> none")
print("     - plasma SOUND WAVES (wall stirs plasma)  -> LMU nucleates into COLD L0 vacuum,")
print("                                                  no plasma AHEAD of the wall -> suppressed")
print("     - TURBULENCE (same, needs plasma)         -> suppressed")
print("   a single exactly-O(3)-symmetric bubble has NO quadrupole -> ~zero GW (Birkhoff-like).")
print("   => the collision estimate Omega_GW~1e-9..1e-11 (prev script [B]) is a MULTI-bubble")
print("      formula; for LMU's one-flash-one-aeon convention channel [B] ~ 0. The user is right:")
print("      the residual asymmetry is only the O(1) prior-aeon inhomogeneity we back-calculated,")
print("      which the inflaton then dilutes by e^-2N -- a tiny, not a strong, source.\n")

print("== [2] Burial: structure-formation (astrophysical) GW vs the primordial plateau ==")
Ogw_prim = 1e-16          # inflationary tensor plateau, r=0.009 (order 1e-17..1e-16)
bands = [
    # (name, freq Hz, Omega_GW h^2 astrophysical/structure background, source)
    ("PTA / nHz",   1e-8, 1e-9,  "SMBH binaries (galaxy mergers = structure formation)"),
    ("LISA / mHz",  1e-3, 1e-11, "galactic + extragalactic compact binaries (confusion)"),
    ("LIGO-ET / Hz",1e2,  1e-9,  "stellar compact-binary background (projected)"),
]
print(f"   primordial ignition plateau: Omega_GW h^2 ~ {Ogw_prim:.0e}  (all bands, ~scale-invariant)")
print(f"   {'band':>14} {'f [Hz]':>8} {'astro Omega_GW h^2':>19} {'buried by':>11}  source")
for name, f, Ogw_a, src in bands:
    orders = math.log10(Ogw_a/Ogw_prim)
    print(f"   {name:>14} {f:>8.0e} {Ogw_a:>19.0e} {orders:>10.0f}x  {src}")
print(f"   -> in EVERY direct-detection band the structure-formation background is ~7 orders")
print(f"      LOUDER than the primordial ignition signal. The user is right: it is buried.\n")

print("== [3] The escape: CMB B-modes are NOT a stochastic background ==")
r_obs = 0.009
print(f"   the inflationary tensor shows up TWICE:")
print(f"     (a) as a stochastic GW background -> BURIED (section 2), unusable.")
print(f"     (b) as a CMB B-mode POLARIZATION imprint at recombination (z~1100), r={r_obs}.")
print(f"   route (b) does not compete in a detector band -- it is a pattern on the sky at one")
print(f"   epoch. Structure enters there only as:")
print(f"     - lensing B-modes (from structure along the line of sight) ~ r_eff few x1e-3,")
print(f"       DELENSABLE with high-res maps -> removable, unlike a stochastic burial;")
print(f"     - galactic dust -> multi-frequency foreground separation (Planck/LiteBIRD).")
print(f"   so r={r_obs} survives as the observable; CMB-S4/LiteBIRD reach sigma(r)~1e-3.")
print(f"   => the ONLY ignition GW you can ever see is the CMB B-mode, precisely because it")
print(f"      escapes the structure-formation burial that kills every direct-detection route.\n")

print("== NET (revised) ==")
print("   [B] bubble/plasma GW at ignition: ~0 for LMU (one O(4) bubble into cold vacuum) --")
print("       your 'small single bubble -> weak' is correct AND stronger than that (symmetry).")
print("   direct stochastic background (any channel): buried by ~1e-9 structure-formation GW.")
print("   surviving observable: CMB B-mode r=0.009 -- imprint not background, so not buried;")
print("       lensing/dust are removable foregrounds, not a floor.")
