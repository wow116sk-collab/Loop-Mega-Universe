#!/usr/bin/env python3
"""Close (as far as it honestly closes) the non-minimal-completion loophole that
kept alpha=1 'minimal' rather than 'unique'. Two gates; the residual is stated.
Run to reproduce. Standard EFT/higher-curvature physics; owners in-line. The only
LMU-specific input is the wiring omega = the metric's own conformal (trace) mode.

  GATE 1 (ghost-freedom, ~automatic given the wiring): omega is the TRACE (conformal)
    mode of the metric, so making it dynamical means adding a function of R (the trace
    curvature) -> f(R). The massive-spin-2 Stelle ghost lives in the WEYL (traceless)
    sector C_uvrs^2, which omega does not touch. So the completion is f(R), ghost-free,
    with no extra assumption -- it is what 'omega dynamical' means. (Stelle 1977;
    Woodard 2015 Ostrogradsky review.)
  GATE 2 (EFT naturalness): within f(R)=R+R^2/(6M^2)+c3 R^3/Mp^4+..., the higher terms
    are suppressed at the inflationary curvature R_inf/Mp^2 ~ 1e-10. Quantify: the
    alpha-shift is ~1e-19. To reach alpha=2.44 (r=0.009) one needs c3 ~ 1e19 (fine-
    tuning) OR an external field (which is no longer omega). Both are excluded by
    naturalness / the wiring.
Result: alpha=1 to ~19 decimals unless one fine-tunes or abandons the wiring. The
continuous-alpha freedom is gone; r=0.0037 is a hard prediction modulo (wiring, EFT).
"""
import math
Mp = 1.0                                   # work in Planck units
As_obs, ns_obs = 2.1e-9, 0.9649
N = 2.0/(1.0-ns_obs)

print("== GATE 1: the wiring restricts the completion to f(R) (no Stelle ghost) ==")
print("   omega = TRACE (conformal) mode of g_uv  -> dynamics from f(R) (trace-curvature sector)")
print("   massive spin-2 Stelle ghost lives in the WEYL sector C_uvrs^2 -- NOT touched by omega")
print("   => completion is f(R), automatically ghost-free. Not an assumption: it is what")
print("      'make the conformal mode dynamical' means. (Stelle 1977; Ostrogradsky/Woodard 2015.)")
print("   f(R) propagates exactly ONE extra scalar = the scalaron = the healthy conformal mode.\n")

print("== GATE 2: within f(R), higher-curvature terms are negligible at the inflation scale ==")
# inflation scale from the predicted r (alpha=1)
r1   = 12.0/N**2
H_inf = math.pi*math.sqrt(As_obs*r1/2.0)               # H_inf/Mp = pi sqrt(A_s r /2)
R_inf = 12.0*H_inf**2                                   # R ~ 12 H^2 (Planck units)
M_scal = 1.3e-5                                         # scalaron mass /Mp (Starobinsky, A_s-fixed)
print(f"   predicted r(alpha=1) = {r1:.4f} -> H_inf/Mp = {H_inf:.2e}, R_inf/Mp^2 = {R_inf:.2e}")
print(f"   scalaron mass M/Mp = {M_scal:.1e} (fixed by A_s); R^2 coeff 1/(6M^2) = {1/(6*M_scal**2):.1e}/Mp^2")
# ratio of the R^3 term to the R^2 term at R_inf, for a natural c3 ~ O(1)
for c3 in (1.0, 1e6, 1e19):
    ratio = c3 * 6.0*M_scal**2 * R_inf                 # (c3 R^3/Mp^4) / (R^2/6M^2) = 6 c3 M^2 R
    dalpha = ratio                                      # alpha-shift ~ this ratio
    tag = "  natural" if c3==1.0 else ("  needs to reach alpha=2.44" if c3==1e19 else "")
    print(f"   c3={c3:>6.0e}: R^3/R^2 at R_inf = {ratio:.1e}  -> delta_alpha ~ {dalpha:.1e}{tag}")
print(f"   -> with a NATURAL c3~O(1), higher terms shift alpha by ~1e-19. alpha=1 to ~19 decimals.")
print(f"      Reaching alpha=2.44 (r=0.009) needs c3~1e19 -- a 19-order fine-tuning.\n")

print("== The only two escapes, both excluded ==")
print("   (A) fine-tune c3 ~ 1e19 (or a tower of higher terms): violates EFT naturalness.")
print("   (B) add an EXTERNAL scalar with non-minimal coupling (general alpha-attractor):")
print("       then the inflaton is NOT omega = the metric's conformal mode -- it violates")
print("       the wiring. Penrose's Omega is intrinsically the metric factor, not an added field.\n")

print("== RESULT ==")
print(f"   alpha = 1 to ~19 decimals, hence r = 12/N^2 = {r1:.4f}, UNLESS one either")
print(f"   fine-tunes a higher-curvature coefficient by ~19 orders (unnatural) or abandons")
print(f"   the wiring (external field). The continuous-alpha FREEDOM IS CLOSED.")
print(f"   Residual assumptions, stated: (a) the wiring omega=conformal-mode [Hypo, unchanged];")
print(f"   (b) EFT naturalness of higher-curvature coefficients [standard, but an assumption].")
print(f"   Status of r=0.0037: [Fact-th | conditional on (a)+(b)] -- no longer a free fit and")
print(f"   no longer merely 'minimal', now 'natural-and-unique-up-to-EFT'. This is the honest")
print(f"   close: not a theorem that alpha=1 (naturalness is not a proof), but the loophole is")
print(f"   shut to the same standard every inflation model is held to.")
