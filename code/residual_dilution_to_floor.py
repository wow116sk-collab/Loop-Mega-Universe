#!/usr/bin/env python3
"""The '+3 spread' open item, PINNED so it stops flip-flopping. Run to reproduce.

THE DEFINITION THAT WAS MISSING (this is why the reading kept bouncing):
  the 'residual' is the old-aeon inhomogeneity ENERGY DENSITY rho_res, compared
  energy-to-energy against the MEASURED vacuum floor Lambda/M_Pl^4 ~ 1e-122 (the
  present dark-energy density in Planck units -- a constant, measured today).
  It is NOT the observable density contrast delta rho/rho (~1e-5, the CMB smoothness);
  that is a separate, easily-met quantity (slow a^-2 dilution already gives ~1e-50).

THE REQUIREMENT:
  for the new aeon to be born on the clean vacuum floor, the old residual ENERGY must
  redshift below Lambda within the N=57 e-folds fixed by the CMB tilt (n_s=0.9649).

THE MECHANISM (NOT a statistical 'spread' / sqrt-of-patches -- that framing was wrong):
  it is the real GR redshift of whatever the residual IS. Different components dilute
  at different OWNED rates, the 'lost' energy redshifting into the expansion (there is
  no global energy conservation in an expanding spacetime, Wald 1984):
    spatial curvature / clump   rho ~ a^-2  (slow)   -- Hervik-Mota-Thorsrud 2011
    radiation                   rho ~ a^-4
    shear / anisotropy (Weyl)   rho ~ a^-6  (fast)   -- Bianchi I; Wald 1983 no-hair
"""
import math
N=57.0                                   # e-folds, fixed by the CMB tilt
floor=122.0                              # Lambda/M_Pl^4 ~ 1e-122 (MEASURED, present, constant)
V14_GeV=8e15; MPl_GeV=2.435e18           # inflaton scale and reduced Planck mass
rho_res0 = (V14_GeV/MPl_GeV)**4          # residual energy starts ~ inflaton energy / M_Pl^4

def order(x): return math.log10(x)
print("== the residual ENERGY must reach the MEASURED vacuum floor ==")
print(f"  start:  rho_res/M_Pl^4 ~ (V^1/4/M_Pl)^4 = 1e{order(rho_res0):.0f}   (inflaton scale)")
print(f"  target: Lambda/M_Pl^4 = 1e-{floor:.0f}   (measured present dark energy, constant)")
k_need = (order(rho_res0)+floor)*math.log(10)/N      # orders to fall = (target - start) = 122-10 = 112
k_contrast = floor*math.log(10)/N                    # if instead the start is an O(1) contrast
print(f"  needed effective redshift exponent k = {k_need:.2f}  over N={N:.0f} e-folds")
print(f"    (from the inflaton-scale start; from an O(1) start it is k={k_contrast:.2f} -- both ~5,")
print(f"     the exact value tracks the residual's starting energy, itself soft.)\n")

print("== real GR component rates: does each reach the floor from the inflaton scale? ==")
for name,k in [("curvature/clump  a^-2",2),("radiation        a^-4",4),("shear (Weyl)     a^-6",6)]:
    reached = order(rho_res0) - k*N/math.log(10)
    tag = "OVERSHOOTS" if reached < -floor else f"short by {reached+floor:.0f} orders,"
    print(f"  {name}:  1e{order(rho_res0):.0f} x e^-{k}N -> 1e{reached:.0f}   ({tag} the 1e-122 floor)")
print(f"\n  the needed k={k_need:.1f} sits between radiation(4) and shear(6): the residual must be")
print(f"  SHEAR/radiation-heavy (fast) to land on the floor in the 57 e-folds the CMB allows.\n")

print("== the open [soft] item, stated so it cannot flip-flop ==")
print("  a calm, low-Weyl, laminar clump (the L0 accumulation picture) is CURVATURE-heavy")
print("  (a^-2, slow) -> from the inflaton scale it reaches only ~1e-60, UNDERSHOOTING 1e-122.")
print("  so the [soft] open question is: does the L0 residual carry enough FAST-diluting")
print("  (shear/anisotropy/radiation) energy to redshift to the vacuum floor in 57 e-folds,")
print("  or are 'calm / low-Weyl' and 'reach the floor in N=57' in genuine tension?")
print("  ('+3 spread' was a crude proxy for this real GR redshift, NOT a statistical average.)\n")

print("== NOT to be confused with (kept separate to stop the bouncing) ==")
print("  observable CMB smoothness = a density CONTRAST ~1e-5; met easily (slow a^-2 -> 1e-50),")
print("  and the CMB fluctuations we see are the NEW inflationary ones (A_s, a fit). That is a")
print("  DIFFERENT quantity from the old residual ENERGY reaching the vacuum floor above.")
