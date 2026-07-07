#!/usr/bin/env python3
"""Reverse ledger, anchored on the TWO measured values -- the CMB and the 1e-122 de
Sitter floor -- computed backward to the pre-aeon (L0 shallow-well) state, like the
first back-calc (code/lmu_preaeon_backcalc.py). Run to reproduce.

Key result: anchoring on BOTH measured anchors PINS the dilution exponent that was
'soft' (un-derived) before -- but only pins what it MUST be, not that the physics
delivers it. Honest throughout.
"""
import math
ns_obs, As_obs, r_obs = 0.9649, 2.1e-9, 0.0037    # CMB anchors (r at alpha=1)
floor = 122.0                                      # de Sitter floor: residual -> 10^-122 (measured Lambda)

print("== ANCHORS (both measured) ==")
print(f"  CMB: n_s={ns_obs}, A_s={As_obs:.1e}, r={r_obs}")
print(f"  de Sitter floor: residual must reach 10^-{floor:.0f} (the measured Lambda scale)\n")

print("== BACKWARD [1]: N from the CMB tilt ==")
N = 2.0/(1.0-ns_obs)
print(f"  N = 2/(1-n_s) = {N:.1f}\n")

print("== BACKWARD [2]: the floor sets the required ENERGY-redshift exponent ==")
k_req = floor*math.log(10)/N                        # e^{-k N} = 10^{-122} -> k = 122 ln10 / N
print(f"  PINNED definition (so this stops flip-flopping): the 'residual' is the old-aeon")
print(f"    inhomogeneity ENERGY density, compared energy-to-energy against the MEASURED vacuum")
print(f"    floor Lambda/M_Pl^4 ~ 10^-{floor:.0f} (present dark energy, a constant). It is NOT a density")
print(f"    contrast -- that is the 10^-5 CMB smoothness, met easily and kept SEPARATE.")
print(f"  from an O(1) residual to 10^-{floor:.0f} in N={N:.0f} e-folds needs k = 122 ln10/N = {k_req:.2f}")
print(f"    (from the inflaton-scale start ~10^-10 it is k~4.5; both ~5).")
print(f"  this is REAL GR component redshift, NOT a statistical 'spread' over patches:")
print(f"    curvature/clump a^-2 (slow) | radiation a^-4 | shear/anisotropy a^-6 (fast);")
print(f"    the 'lost' energy redshifts into the expansion (no global conservation, Wald 1984).")
print(f"  -> k~5 = a SHEAR/radiation-heavy residual. A calm, low-Weyl clump is curvature-heavy")
print(f"     (a^-2, slow) and UNDERSHOOTS -> that is the open [soft] item. See")
print(f"     code/residual_dilution_to_floor.py. (The old '2+3 vs 2+1.5 spread' framing was wrong.)\n")

print("== BACKWARD [3]: the pre-aeon initial inhomogeneity the shallow well must supply ==")
d_final = 10**(-floor)
d_init = d_final*math.exp(k_req*N)                  # invert the dilution
print(f"  delta_initial = 10^-{floor:.0f} * e^(+k N) = {d_init:.2f}  (i.e. O(1))")
print(f"  -> the L0 shallow-well accumulation must start at O(1) inhomogeneity; inflation (N={N:.0f})")
print(f"     dilutes it to the de Sitter floor. (Per-point e^-2N = {math.exp(-2*N):.0e}.)\n")

print("== BACKWARD [4]: the shallow well itself (doc-anchored, not collapsing) ==")
print(f"  in infinite L0 the accumulation stays a SHALLOW well -- it does NOT collapse to a black")
print(f"  hole: black holes anti-concentrate, rho_BH = 3c^6/(32 pi G^3 M^2) proto 1/M^2, so a")
print(f"  10^11 Msun survivor is ~1.8e-3 kg/m^3 (LESS DENSE THAN AIR), ~99 orders below rho_c")
print(f"  (doc L1364). Broad + less-dense-than-air => LOW initial Weyl (calm, one laminar clump),")
print(f"  which is why delta_init ~ O(1), not >>1: the shallow well is already gentle.\n")

print("== BACKWARD [5]: the energy (not from the well) ==")
Mp=2.435e18
eps=r_obs/16.0; V=24*math.pi**2*eps*As_obs*Mp**4
print(f"  the well is cold + diffuse (far below GUT density), so the hot energy is NOT from it:")
print(f"  V^1/4 = {V**0.25:.1e} GeV from the free lunch (E=rho V, Guth), triggered by the flash.\n")

print("== NET (the reverse ledger, anchored on CMB + 1e-122) ==")
print(f"  measured anchors: n_s -> N={N:.0f} ; de Sitter floor -> dilution exponent k~{k_req:.2f}")
print(f"  pre-aeon state they imply: an O(1)-inhomogeneity, less-dense-than-air, non-collapsing L0")
print(f"  shallow well (calm, low-Weyl), lit by a flash trigger + free-lunch inflation, whose N~{N:.0f}")
print(f"  e-folds simultaneously (a) give the CMB tilt and (b) dilute the residual to 10^-122.")
print(f"  HONEST: the anchors PIN the required energy-redshift exponent (k~{k_req:.2f}), which real GR")
print(f"  redshift CAN supply (shear a^-6 overshoots, radiation a^-4 nearly). The open [soft] item is")
print(f"  the residual's COMPOSITION: a calm, low-Weyl clump is curvature-heavy (a^-2, slow) and")
print(f"  undershoots, so 'calm/low-Weyl' and 'reach the vacuum floor in N=57' may be in tension.")
print(f"  This is a consistency/retrodiction, not a derivation. (Observable smoothness = a 10^-5")
print(f"  CONTRAST, met easily by the slow rate -- a DIFFERENT quantity, kept separate.)")
