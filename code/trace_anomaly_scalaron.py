#!/usr/bin/env python3
"""Lead #1: can the quantum trace anomaly at the conformal (massless-radiation)
boundary GENERATE the scalaron (R^2), grounding the wiring omega=scalaron in
Starobinsky's ACTUAL mechanism rather than a relabelling? Worked honestly. Run to
reproduce. Standard anomaly-induced-inflation physics (owners in-line).

What the anomaly does and does NOT fix:
  - the genuinely anomalous, scheme-INDEPENDENT coefficients are a (Euler E4) and c
    (Weyl C^2). The R^2 term is a LOCAL, scheme-DEPENDENT counterterm whose coupling
    RUNS with a beta-function ~ N_eff but whose VALUE is a free renormalization
    condition. So the anomaly grounds the EXISTENCE + RUNNING of R^2 (hence the
    scalaron, hence alpha=1 shape) but NOT its coefficient (the amplitude / A_s).
  - test the 'natural' magnitude: if the R^2 coupling were set purely by N_eff
    conformal fields, what N_eff reproduces the observed scalaron mass? Answer below.
"""
import math
Mp = 1.0
As_obs, ns_obs = 2.1e-9, 0.9649
N_efold = 2.0/(1.0-ns_obs)
M_scal = 1.3e-5                      # scalaron mass /Mp, fixed by A_s (Starobinsky)

print("== [1] The anomaly grounds the SHAPE: R^2 -> scalaron -> alpha=1 ==")
print("   massless (conformal) fields have <T^mu_mu> = (1/(4pi)^2)[c C^2 - a E4 + b box R].")
print("   integrating them out generates an R^2 term in the gravitational action; the metric's")
print("   trace mode becomes the dynamical scalaron. Shape is FIXED: f(R)=R+beta R^2 -> alpha=1")
print(f"   -> r = 12/N^2 = {12/N_efold**2:.4f}, independent of beta. The anomaly NATURALLY sits at")
print("      the LMU boundary because that boundary is massless-radiation dominated (conformal).")
print("   (Starobinsky 1980; Riegert 1984; anomaly-induced inflation: Hawking-Hertog-Reall 2001,")
print("    Shapiro-Pelinson, Netto-Pelinson-Shapiro-Starobinsky 2016.)\n")

print("== [2] The anomaly does NOT fix the SCALE: how many fields would it take? ==")
# scalaron mass <-> R^2 coefficient beta:  (Mp^2/2)(R + R^2/(6M^2))  =>  beta = Mp^2/(12 M^2)
beta_needed = Mp**2/(12*M_scal**2)
# natural anomaly magnitude: beta ~ N_eff/(2880 pi^2) (one conformal scalar ~ 1/2880pi^2)
coef = 1.0/(2880*math.pi**2)
N_needed = beta_needed/coef
print(f"   scalaron mass M/Mp={M_scal:.1e} needs R^2 coefficient beta = Mp^2/(12M^2) = {beta_needed:.2e}")
print(f"   one conformal field contributes ~ 1/(2880 pi^2) = {coef:.2e} to beta")
print(f"   => N_eff needed = beta / (per-field) = {N_needed:.1e} conformal fields")
print(f"   the Standard Model has O(100) dof -> beta_SM ~ {100*coef:.2e} -> M/Mp ~ "
      f"{1/math.sqrt(12*100*coef):.1f} (TRANS-PLANCKIAN, useless)")
print(f"   -> to get the observed amplitude from the anomaly ALONE you need ~1e13 fields,")
print(f"      ~1e11x the SM. The anomaly does NOT naturally deliver A_s.\n")

print("== [3] Honest verdict on the lead ==")
print("   GROUNDED by the anomaly: the SHAPE -- that an R^2/scalaron appears at a conformal")
print("     boundary, giving alpha=1 and r=0.0037. This is Starobinsky's real mechanism, and")
print("     the LMU boundary (massless radiation) is exactly where the anomaly lives. So the")
print("     wiring omega=scalaron gains a PHYSICAL reason, not just a relabelling -- for the shape.")
print("   NOT grounded: the SCALE (A_s / scalaron mass). The R^2 coefficient is a scheme-")
print("     dependent free counterterm; the anomaly's natural magnitude needs ~1e13 fields.")
print("     So A_s stays an INPUT (as it is for every inflation model). No free lunch on amplitude.")
print("   NET: lead #1 upgrades the wiring's SHAPE from [Hypo, relabel] to [Fact-th, anomaly-")
print("     natural at a conformal boundary]; the AMPLITUDE remains input. Partial grounding --")
print("     real, but does not close A_s. The originality question (has anyone tied the anomaly")
print("     to a CCC/conformal crossing specifically?) is the lit-search, run separately.")
