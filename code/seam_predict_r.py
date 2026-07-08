#!/usr/bin/env python3
"""Do it the right way: INPUT the genuinely-measured values, FIX the shape parameter
by a principle, and PREDICT the remaining observable. Run to reproduce.

The seam script FITS alpha to r, which makes r an input (the honesty audit showed
this). The correct move: r is NOT yet measured (only bounded, r<0.036); it should be
PREDICTED. If the wiring omega = CCC conformal factor is taken seriously, the
conformal/Starobinsky case fixes alpha=1 -- and then, with the measured n_s and A_s
as inputs, r is a genuine falsifiable prediction, distinct from the fitted 0.009.

  INPUTS (measured, Planck):   n_s = 0.9649,  A_s = 2.1e-9
  PRINCIPLE (fixes shape):     alpha  (alpha=1 = pure conformal / Starobinsky / Higgs)
  PREDICTED (was fitted):      r,  V^1/4,  T_reheat   <- test against CMB-S4/LiteBIRD
"""
import math
Mp = 2.435e18
ns_obs, As_obs = 0.9649, 2.1e-9        # MEASURED inputs
r_bound = 0.036                        # current 95% upper limit (Planck+BICEP/Keck) -- r NOT yet measured

N = 2.0/(1.0-ns_obs)                   # e-fold count fixed by the measured tilt (input)
print(f"INPUT  n_s={ns_obs}  ->  N = 2/(1-n_s) = {N:.1f}")
print(f"INPUT  A_s={As_obs:.2e}")
print(f"NOTE   r is NOT measured -- only bounded r < {r_bound}. So r must be PREDICTED, not input.\n")

print(f"{'principle (alpha)':>26} {'PREDICTED r':>12} {'V^1/4 [GeV]':>13} {'T_reh [GeV]':>12}  verdict")
cases = [
    ("alpha=1  (conformal/Starobinsky)", 1.0),
    ("alpha=2.44 (the seam's FIT)",       2.44),
    ("alpha=10 (large-modulus)",          10.0),
]
for label, alpha in cases:
    r_pred = 12.0*alpha/N**2                       # PREDICTION (alpha fixed by principle, N by n_s)
    eps    = r_pred/16.0
    V      = 24*math.pi**2*eps*As_obs*Mp**4        # V fixed by measured A_s
    V14    = V**0.25
    Treh   = (30*V/(math.pi**2*200))**0.25
    verdict = "excluded" if r_pred>r_bound else "allowed, testable"
    print(f"   {label:>26} {r_pred:>12.4f} {V14:>13.2e} {Treh:>12.2e}  {verdict}")

print()
print("== What is genuinely predicted vs what is generic ==")
r_star = 12.0*1.0/N**2
print(f"   n_s ~ 0.965: PREDICTED by N~57, but GENERIC to all inflation -- not LMU-specific.")
print(f"   r: if the wiring fixes alpha=1 (the conformal case), r = 12/N^2 = {r_star:.4f}")
print(f"      -- a SPECIFIC, LMU-committing number, distinct from the fitted 0.009 (alpha=2.44).")
print(f"   V^1/4, T_reheat then follow from the measured A_s -- also predicted, not tuned.\n")

print("== The falsifier this creates (this is the real F4) ==")
print(f"   CMB-S4 / LiteBIRD target sigma(r) ~ 1e-3. That RESOLVES the three cases:")
print(f"     r ~ 0.004  -> conformal alpha=1 confirmed  (the natural LMU prediction)")
print(f"     r ~ 0.009  -> needs alpha=2.44 (a choice, less natural, but allowed)")
print(f"     r  = 0     -> no tensor -> the omega=inflaton wiring fails (ekpyrotic-like reset)")
print(f"   So the honest scientific statement is NOT 'LMU matches the CMB' but:")
print(f"     'INPUT (n_s, A_s) + the conformal principle (alpha=1) PREDICTS r={r_star:.4f};")
print(f"      CMB-S4 tests it.' That is a real prediction of the remaining value.\n")

print("== Caveat (do not overclaim) ==")
print("   alpha=1 is the prediction ONLY IF the omega=CCC-conformal-factor wiring truly")
print("   fixes the Kahler curvature to the conformal value. That identification is the")
print("   [Hypo] wiring itself (unclaimed on the evidence searched). alpha is otherwise a")
print("   free modulus. So: the METHOD (input measured, fix alpha by principle, predict r)")
print("   is correct and gives r~0.004; the PRINCIPLE (alpha=1) rests on the [Hypo] wiring.")
print("   Fixing alpha from the conformal geometry rigorously is the open task that would")
print("   turn this from 'fit' into 'prediction' -- exactly the right next step.")
