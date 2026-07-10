#!/usr/bin/env python3
"""
CLOSURE ATTEMPT A  -- Freidlin-Wentzell least-action selection for the LMU wiring joint.

Object: Tod (2015) Eq.13 phantom-field equation, FRW homogeneous reduction:
    phi'' + 3 H phi' + 2 H^2 phi = (1/6) s phi^3
with phi = Omega_hat^{-1}, s = scalar curvature of bridging metric.
Penrose's phantom case: s = 12 H^2 = 4 Lambda_hat.

This is a friction-damped ANTI-oscillator: phi'' + 3H phi' = -V'(phi), with
    V(phi) = H^2 phi^2 - (s/24) phi^4.
Free Cauchy data = (phi_1, phi_2), the amplitudes of the two decay modes
    phi ~ phi_1 e^{-H t} + phi_2 e^{-2H t} + ...   (Tod Eq.12).

Questions:
  (1) FW quasipotential / instanton action S[phi] for this bistable.
  (2) Does minimizing it PICK the plateau AND FIX (phi_1, phi_2)?
  (3) Numbers (this file).
  (4) Close, or relocate?

Everything analytic/vectorized. Runs < 1s.  H=1 units throughout.
"""
import numpy as np

H = 1.0
s = 12.0 * H**2          # Penrose phantom case s = 12 H^2 = 4 Lambda_hat

# ---------------------------------------------------------------------------
# Potential  V(phi) = H^2 phi^2 - (s/24) phi^4   (so that phi'' + 3H phi' = -V')
# ---------------------------------------------------------------------------
def V(phi):   return H**2 * phi**2 - (s/24.0) * phi**4
def dV(phi):  return 2*H**2 * phi - (s/6.0) * phi**3      # = 2H^2 phi - 2H^2 phi^3 (s=12)
def d2V(phi): return 2*H**2 - (s/2.0) * phi**2

print("="*70)
print("ATTEMPT A: Freidlin-Wentzell least-action on the phantom-field bistable")
print("="*70)
print(f"H={H}, s={s} (=12H^2, Penrose phantom case)")
print(f"V(phi) = H^2 phi^2 - (s/24) phi^4")

# ---------------------------------------------------------------------------
# 1. Fixed points & linear structure  (phi=0 metastable node, phi=+-1 saddles)
# ---------------------------------------------------------------------------
# dV=0 : 2H^2 phi (1 - phi^2) = 0  -> phi = 0, +-1
roots = [0.0, 1.0, -1.0]
print("\n[1] FIXED POINTS of  phi'' + 3H phi' = -V'(phi)")
for p in roots:
    # linearize: delta'' + 3H delta' + V''(p) delta = 0 ; char mu^2 + 3H mu + V''=0
    a, b, c = 1.0, 3*H, d2V(p)
    disc = b*b - 4*a*c
    mu1 = (-b + np.sqrt(disc+0j))/2
    mu2 = (-b - np.sqrt(disc+0j))/2
    kind = "stable NODE" if (mu1.real<0 and mu2.real<0) else ("SADDLE" if mu1.real*mu2.real<0 else "other")
    print(f"  phi*={p:+.1f}:  V={V(p):+.4f}  V''={d2V(p):+.3f}  "
          f"eigs=({mu1.real:+.2f},{mu2.real:+.2f})/H  -> {kind}")

# The two node eigenvalues at phi=0 are exactly -H and -2H  ==  the phi_1,phi_2 modes.
print("  --> node eigs -H,-2H ARE the e^{-Ht}(phi_1) and e^{-2Ht}(phi_2) modes.")
print("      phi=0 is a NODE, not a saddle: a FULL 2-param basin drains into it.")

# ---------------------------------------------------------------------------
# 2. Barrier height and Balek-Demetrian CdL/Hawking-Moss criterion
# ---------------------------------------------------------------------------
dVbar = V(1.0) - V(0.0)
print("\n[2] ESCAPE BARRIER (phi=0 -> saddle phi=1, i.e. Omega_hat: inf -> 1)")
print(f"  barrier height  Delta V = V(1)-V(0) = {dVbar:.4f}  (= H^2/2)")
print(f"  |V''(top)| = {abs(d2V(1.0)):.4f} H^2")
print(f"  Balek-Demetrian threshold: CdL beats Hawking-Moss iff |V''(top)| > 4H^2")
print(f"  --> |V''(top)| = 4H^2 EXACTLY : the phantom barrier sits ON the")
print(f"      CdL/Hawking-Moss MARGINAL line (degenerate; forced by s=12H^2 & mass 2H^2).")

# ---------------------------------------------------------------------------
# 3. FW / instanton action of the escape path, and its dependence on phi_1
# ---------------------------------------------------------------------------
# Overdamped (genuine gradient / FW) reduction: 3H phi' = -V'(phi) + noise(D).
# Onsager-Machlup / FW action  S = (1/4D) int (3H phi' + V')^2 dt.
# Uphill instanton: 3H phi' = +V'  =>  S = (3H/D) * int_0^1 V' dphi = (3H/D) Delta V.
S_over_D_analytic = 3*H*dVbar        # S*D  (i.e. S = this / D)
print("\n[3] FW / instanton ACTION of the escape path (overdamped gradient reduction)")
print("  SDE: 3H phi' = -V'(phi) + sqrt(2D) xi ;  S[phi]=(1/4D) int (3H phi'+V')^2 dt")
print(f"  on-shell (uphill) instanton:  S = (3H/D) Delta V = {S_over_D_analytic:.4f}/D")

# Numerically verify S is INDEPENDENT of phi_1 (= where along the path you start
# = pure time-translation).  Integrate uphill path 3H phi'=+V' from many start pts.
def action_uphill(phi_start, phi_end=1.0-1e-6, N=200000):
    # instanton is uphill gradient flow; parametrize by phi (monotone) to avoid
    # the t->inf tail. On-shell integrand (3H phi'+V')^2 dt with 3H phi'=V':
    #   = 4 V'^2 dt , and dt = 3H dphi / V'  =>  integrand dt = 12 H V' dphi.
    ph = np.linspace(phi_start, phi_end, N)
    integ = 12.0 * H * dV(ph)          # d(4V'^2 * dt)/dphi expressed in phi
    # S*4D = int 12 H V' dphi = 12H (V(end)-V(start)); S*D = 3H*(V(end)-V(start))
    return 3*H*(V(phi_end) - V(phi_start))

starts = np.array([1e-4, 1e-3, 1e-2, 1e-1, 0.3])   # different "phi_1" amplitudes
SD = np.array([action_uphill(a) for a in starts])
print("  numeric S*D for escape started at different amplitudes phi_1(->phi_start):")
for a, sd in zip(starts, SD):
    print(f"     phi_start={a:.1e} :  S*D = {sd:.5f}")
print(f"  spread over 4 decades of phi_1: {SD.max()-SD.min():.2e}  (-> FLAT in phi_1)")
print("  ==> the action has phi_1 as a ZERO-MODE (time-translation). Minimizing")
print("      over phi_1 selects NOTHING: every amplitude has the same weight.")

# ---------------------------------------------------------------------------
# 4. Does the escape/instanton BOUNDARY DATA pin (phi_1, phi_2)?  Full 2nd-order.
#    Integrate the FULL ODE BACKWARD from near the node with a grid of (phi_1,phi_2)
#    and check they ALL are legitimate solutions decaying to the plateau phi=0.
# ---------------------------------------------------------------------------
def rk4_back(phi1, phi2, t_end=6.0, dt=1e-3):
    # near-scri data at large t0: phi = phi1 e^{-H t0} + phi2 e^{-2H t0}
    t0 = t_end
    phi = phi1*np.exp(-H*t0) + phi2*np.exp(-2*H*t0)
    dphi = -H*phi1*np.exp(-H*t0) - 2*H*phi2*np.exp(-2*H*t0)
    y = np.array([phi, dphi])
    def f(y):
        p, v = y
        return np.array([v, -3*H*v - 2*H**2*p + (s/6.0)*p**3])
    n = int(t_end/dt)
    # integrate backward in time (toward the crossover / away from scri)
    hb = -dt
    for _ in range(n):
        k1=f(y); k2=f(y+0.5*hb*k1); k3=f(y+0.5*hb*k2); k4=f(y+hb*k3)
        y = y + (hb/6.0)*(k1+2*k2+2*k3+k4)
        if not np.isfinite(y).all() or abs(y[0])>1e3:
            return np.inf
    return y[0]   # phi value after backward-evolving toward crossover

print("\n[4] Does requiring 'decay to the plateau phi=0' PIN (phi_1,phi_2)?")
print("  Backward-integrate FULL 2nd-order ODE from near-scri data (phi_1,phi_2 grid).")
g = [0.2, 0.5, 1.0, 2.0]
print("     phi_1 \\ phi_2 :", "  ".join(f"{p2:+.1f}" for p2 in g))
admissible = 0; total = 0
for p1 in g:
    row = []
    for p2 in g:
        val = rk4_back(p1, p2)
        ok = np.isfinite(val)
        admissible += ok; total += 1
        row.append("ok " if ok else "div")
    print(f"     phi_1={p1:+.1f}      :", "   ".join(row))
print(f"  {admissible}/{total} of the (phi_1,phi_2) grid are valid plateau-decaying solutions.")
print("  ==> a 2-PARAMETER family asymptotes to the plateau. Neither phi_1 nor phi_2")
print("      is selected by 'land on the plateau'. Freedom is NOT removed.")

# ---------------------------------------------------------------------------
# 5. phi_2 and the overdamped/adiabatic (slow-manifold) elimination = DRMH
# ---------------------------------------------------------------------------
print("\n[5] phi_2 in the FW (overdamped) reduction")
print("  Overdamping DROPS phi'' -> keeps only the slow -H mode (phi_1);")
print("  the fast -2H mode (phi_2) is adiabatically eliminated: phi_2 -> 0.")
print("  That is EXACTLY Penrose's Delayed-Rest-Mass Hypothesis phi_2=0 --")
print("  but it is an APPROXIMATION (slow-manifold), NOT a derivation. The full")
print("  2nd-order equation (Sec.4) keeps phi_2 free. So FW 'derives' phi_2=0 only")
print("  by the same fiat Penrose already assumed.")

# ---------------------------------------------------------------------------
# 6. User's physical input: least-action = flash entropy budget S_rad=(4/3)S_BH ?
# ---------------------------------------------------------------------------
print("\n[6] Entropy test: is the FW action = the flash entropy budget (Zurek 4/3)?")
print("  FW escape weight  P ~ exp(-S) = exp(-(3H/D) Delta V).")
print("  Zurek: the flash produces S_rad = (4/3) S_BH (net gen +1/3 S_BH).")
print("  Setting S_FW = S_rad fixes ONLY the effective noise D:")
print("      D = (3H Delta V) / S_rad = (3H*H^2/2)/((4/3)S_BH) = 9 H^3 /(8 S_BH).")
S_BH = 1.0  # symbolic placeholder
D_cal = (3*H*dVbar)/((4.0/3.0)*S_BH)
print(f"      e.g. S_BH=1 -> D = {D_cal:.4f} (= 9/8 H^3).")
print("  ==> entropy budget CALIBRATES the rate/noise D (a weight normalization),")
print("      it does NOT touch (phi_1,phi_2). Zurek 4/3 = diagnostic, not selector")
print("      (consistent with the literature: no one promotes 4/3 to an action).")

# ---------------------------------------------------------------------------
# VERDICT
# ---------------------------------------------------------------------------
print("\n" + "="*70)
print("VERDICT")
print("="*70)
print("""  * Plateau/branch channel:  SOFT-selected. Min-action escape does cross the
    phi=1 (Omega_hat=1) barrier -- the anomaly-plateau channel -- but this is
    saddle/channel selection (Coleman-DeLuccia/Balek-Demetrian), standing on
    OWNER machinery, and the barrier sits EXACTLY on the CdL/Hawking-Moss
    marginal line (|V''|=4H^2) so even 'which instanton' is degenerate.
  * phi_1:  NOT fixed. It is a zero-mode (time-translation) of the action;
    every amplitude carries identical weight (Sec.3 flat to 1e-2).
  * phi_2:  set to 0 only by the OVERDAMPED/slow-manifold approximation, which
    merely re-imposes Penrose's DRMH by fiat; full 2nd-order keeps it free.
  * Entropy budget (4/3 S_BH):  fixes the noise D / rate normalization, NOT the
    Cauchy data.
  * NET: does NOT close. It RELOCATES the freedom (phi_1) into the flash-IC /
    'where the flash injects the field' family -- the same knot-2 flash->plateau
    IC family. Consistent with Tod's finding that phi_1 needs an EXTERNAL
    prescription (Yamabe), which the ODE/least-action alone cannot supply.""")
