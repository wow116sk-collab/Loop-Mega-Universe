#!/usr/bin/env python3
"""Does the identification omega = (the metric's own conformal factor) FIX the
alpha-attractor parameter alpha, and hence PREDICT r? Worked honestly; the answer
is not assumed. Run to reproduce. All formulae standard (owners in-line); the only
LMU-specific step is the identification of Penrose's Omega with the conformal mode.

Chain:
  [1] the BARE conformal factor of the metric, made dynamical, is a GHOST
      (wrong-sign kinetic term) -- so Omega cannot be a naive inflaton. It NEEDS a
      healthy UV completion. (conformal-factor problem: Gibbons-Hawking-Perry 1978.)
  [2] the MINIMAL healthy completion of the metric's conformal mode is R^2 gravity;
      its Einstein-frame scalaron has a FIXED kinetic normalization -> alpha = 1
      exactly (Starobinsky 1980 == the alpha=1 point of Kallosh-Linde 2013).
  [3] alpha <-> Kahler curvature: R_K = -2/(3 alpha); alpha=1 <-> R_K = -2/3.
  [4] therefore r = 12/N^2 is FORCED by the minimal completion -- a prediction, not
      a fit. Non-minimal completions reopen alpha; the honest boundary is stated.
"""
import math

print("== [1] The bare conformal factor is a GHOST (why Omega is not a free inflaton) ==")
print("   Weyl rescaling g~_uv = e^(2 omega) g_uv, in n=4 dimensions:")
print("     sqrt(-g~) R~ = sqrt(-g) e^(2 omega) [ R - 6 (grad omega)^2 - 6 box(omega) ]")
c_kin = -6.0     # coefficient of (grad omega)^2 in the Einstein-Hilbert action
print(f"   => kinetic coefficient of (grad omega)^2 is {c_kin:+.0f} e^(2 omega) x (Mp^2/2)  --> WRONG SIGN.")
print(f"   the conformal mode of the metric is a GHOST (Gibbons-Hawking-Perry 1978). So you")
print(f"   CANNOT promote Penrose's Omega to a healthy inflaton with a free alpha 'by choice';")
print(f"   it must be UV-completed into a healthy scalar first. That completion picks alpha.\n")

print("== [2] Minimal healthy completion = R^2 gravity -> the scalaron -> alpha = 1 ==")
print("   L = (Mp^2/2)(R + R^2/(6 M^2)); Einstein-frame canonical scalar phi:")
print("     V(phi) = (3/4) Mp^2 M^2 ( 1 - exp(-sqrt(2/3) phi/Mp) )^2")
expo = math.sqrt(2.0/3.0)
print(f"   the plateau exponent is sqrt(2/3) = {expo:.4f}.")
print(f"   general alpha-attractor exponent is sqrt(2/(3 alpha)); matching:")
for alpha in (0.5, 1.0, 2.44, 10.0):
    e_alpha = math.sqrt(2.0/(3.0*alpha))
    hit = "  <-- Starobinsky / R^2 (the metric's own conformal mode)" if abs(alpha-1.0)<1e-9 else ""
    print(f"     alpha={alpha:>5.2f} -> exponent sqrt(2/(3a)) = {e_alpha:.4f}{hit}")
print(f"   the R^2 exponent {expo:.4f} matches alpha=1 EXACTLY. The scalaron IS the healthy")
print(f"   conformal mode, and its normalization is fixed (not chosen) -> alpha=1.")
print(f"   (Starobinsky 1980; Whitt 1984; = the alpha=1 point of Kallosh-Linde 2013.)\n")

print("== [3] alpha <-> curvature of the moduli space ==")
for alpha in (0.5, 1.0, 2.44):
    R_K = -2.0/(3.0*alpha)
    tag = "  <-- conformal / unit-disk point" if abs(alpha-1.0)<1e-9 else ""
    print(f"   alpha={alpha:>5.2f} -> Kahler scalar curvature R_K = -2/(3a) = {R_K:+.4f}{tag}")
print(f"   alpha=1 is the Poincare-disk-with-unit-curvature point -- the conformal case.\n")

print("== [4] Therefore r is PREDICTED by the minimal completion ==")
ns_obs = 0.9649
N = 2.0/(1.0-ns_obs)
r_pred = 12.0*1.0/N**2
print(f"   INPUT n_s={ns_obs} -> N={N:.1f};  alpha=1 (forced by minimal completion)")
print(f"   => r = 12 alpha / N^2 = 12/N^2 = {r_pred:.4f}   (a PREDICTION, not a fit)")
print(f"   the seam's r=0.009 needed alpha=2.44 -- which requires a NON-minimal completion.\n")

print("== HONEST BOUNDARY -- what is now firm, what is still open ==")
print("   FIRMED: promoting Omega is NOT free -- the bare conformal mode is a ghost, and the")
print("     MINIMAL cure (R^2) forces alpha=1 -> r=0.0037. This is Starobinsky's theorem, not")
print("     a fit. The residual freedom is the CHOICE OF COMPLETION, not a continuous alpha.")
print("   WHY alpha=1 is the natural pick: Penrose's Omega is the metric's OWN conformal mode,")
print("     not an external compensator; its healthy dynamical form is the scalaron (alpha=1).")
print("     A general alpha needs an EXTERNAL compensator field -- less natural for Omega.")
print("   STILL OPEN [Hypo]: (a) the identification Omega = scalaron itself (the wiring);")
print("     (b) non-minimal completions (R^3, extra non-minimal couplings) CAN shift alpha")
print("     away from 1 -- so alpha=1 is 'minimal-completion', not 'unique'. Ruling those out")
print("     needs a UV argument. Status: r=0.0037 is now [Fact-th | conditional on the wiring")
print("     + minimal completion], up from [Hypo | free fit]. A genuine tightening, not a proof.")
