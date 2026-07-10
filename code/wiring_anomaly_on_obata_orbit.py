#!/usr/bin/env python3
"""ATTEMPT E1 -- Does the ANOMALY-INDUCED (Riegert/Q-curvature) action lift the
Round-3 Obata degeneracy (the conformal-group orbit u_s of the round sphere)?

HONEST TEST, not assumed. We build the anomaly / Q-curvature (Polyakov-type)
effective action as an explicit functional of the conformal factor sigma, evaluate
it ALONG the Obata orbit u_s, and ask numerically: does d(action)/ds have an
ISOLATED ZERO (=> selects a unique Omega) or is it IDENTICALLY FLAT (=> selects
nothing, a clean NEGATIVE)?

Framing (owners, do-not-reinvent):
  * The trace anomaly is a 4D object: <T^mu_mu> = c*W^2 - a*E4 + b*box R
    (Type B / Weyl^2, Type A / Euler, trivial / total-deriv). [Deser-Schwimmer 93]
  * On S^3 itself (odd d) there is NO local trace anomaly; the substitute is the
    finite F = -log Z_{S^3}, a CONFORMAL INVARIANT (F-theorem, JKPS 2011) -> also
    orbit-constant. So we realize the anomaly action on the 4D conformally-flat
    sphere S^4 (the Euclidean cap / R x S^3 Einstein universe, Antoniadis-Mottola),
    where the a-part is the Riegert/Branson Q-curvature (Paneitz) functional.
  * Obata orbit u_s: g_s = e^{2 sigma_s} g_round with
        sigma_s(theta) = -log( cosh s + cos(theta) sinh s ),
    the conformal factor of an SO(n+1,1) transformation about a pole. Every g_s is
    ISOMETRIC to g_round (Obata 1971). To O(s): sigma_s ~ -s cos(theta) = the l=1
    harmonic = the conformal-Killing / flat direction.

Method:
  A) VALIDATE the machinery on S^2 (Onofri): reproduce that the FULL Onofri
     functional is flat (=0) on the Moebius orbit, while its naive quadratic
     Dirichlet piece ALONE is NOT flat. This proves the log-volume term is the
     load-bearing piece and validates our harmonic quadrature.
  B) S^4 (Beckner/Q-curvature): action(s) = c1*<sigma,P4 sigma> + c2*<Q,sigma>
     - log(avg e^{4 sigma}). Report whether action(s) is flat and whether the naive
     Riegert QUADRATIC piece <sigma,P4 sigma> alone (the object one might mistake
     for a 'potential on conformal factors') has an apparent extremum -- the trap.
  C) OFF-orbit: turn on a York-shear datum phi_2 -> Weyl^2 != 0 -> the c-term
     switches on. Show it PENALIZES anisotropy (min at phi_2=0), relocating, not
     selecting a point within the round orbit.

Owners: Riegert 84; Fradkin-Tseytlin 84; Antoniadis-Mottola 92; Deser-Schwimmer 93;
Obata 71; Paneitz/Branson/GJMS; Onofri 82/Beckner 93/Osgood-Phillips-Sarnak 88;
Jafferis-Klebanov-Pufu-Safdi 11. Nothing here is re-derived; we EVALUATE their
functionals on the orbit. Run to reproduce (<90s).
"""
import numpy as np
from numpy.polynomial.legendre import leggauss
from scipy.special import eval_gegenbauer, eval_legendre

np.set_printoptions(suppress=True)

# ---------------------------------------------------------------- quadrature
# Zonal integration on S^n uses x = cos(theta) in [-1,1] with measure:
#   S^2:  dV = 2*pi * dx                        (vol S^2 = 4 pi)
#   S^4:  dV = 2*pi^2 * (1 - x^2) dx            (vol S^4 = 8 pi^2 / 3)
NQ = 400
xq, wq = leggauss(NQ)                    # nodes/weights on [-1,1]

def orbit_sigma(x, s):
    """Obata conformal factor sigma_s(theta), x=cos(theta)."""
    return -np.log(np.cosh(s) + x * np.sinh(s))

# ================================================================ (A) S^2 Onofri
def onofri_pieces(s, Lmax=80):
    """Return (dirichlet, lin, logvol) for w_s on S^2.
       Onofri: E = (1/4pi)*(1/2)||grad w||^2 + (1/2pi)*<K0,w> - log<e^{2w}>  >= 0,
       equality on the Moebius orbit. K0 = 1, vol=4pi, -Delta eig = l(l+1)."""
    w = orbit_sigma(xq, s)
    meas = 2*np.pi * wq                      # dV on S^2 (zonal)
    V = meas.sum()                            # = 4 pi
    # harmonic (Legendre) projection; norm ||P_l||^2 on S^2 = 4pi/(2l+1)
    diri = 0.0
    for l in range(1, Lmax+1):
        Pl = eval_legendre(l, xq)
        cl = (meas * w * Pl).sum() / (meas * Pl * Pl).sum()   # coefficient
        norm2 = (meas * Pl * Pl).sum()
        diri += l*(l+1) * cl*cl * norm2       # <w,-Delta w> contribution
    lin = (meas * w).sum()                     # <K0=1, w>
    logvol = np.log((meas * np.exp(2*w)).sum() / V)
    return diri, lin, logvol, V                # diri = INT |grad w|^2

def run_S2():
    ss = np.linspace(0.0, 2.0, 21)
    full, quad = [], []
    for s in ss:
        diri, lin, lv, V = onofri_pieces(s)   # diri = INT|grad w|^2
        # Onofri: E = (1/4pi) INT|grad w|^2 + (1/2pi)<K0,w> - log<e^{2w}> >= 0
        E = (1.0/(4*np.pi))*diri + (1.0/(2*np.pi))*lin - lv
        full.append(E); quad.append((1.0/(4*np.pi))*diri)
    full = np.array(full); quad = np.array(quad)
    return ss, full, quad

# ================================================================ (B) S^4 anomaly
def s4_pieces(s, Lmax=60):
    """Return A=<sigma,P4 sigma>, B=<Q,sigma>, C=log<e^{4 sigma}> for sigma_s on S^4.
       Paneitz eig on degree-l zonal harmonic (GJMS, n=4): lam_l = l(l+1)(l+2)(l+3).
       Q_4 (round unit S^4) = 6 (=> int Q dV = 6 * 8pi^2/3 = 16 pi^2 = 8 pi^2 chi)."""
    sig = orbit_sigma(xq, s)
    meas = 2*np.pi**2 * (1 - xq**2) * wq      # dV on S^4 (zonal)
    V = meas.sum()                             # = 8 pi^2 / 3
    Q4 = 6.0
    A = 0.0
    for l in range(1, Lmax+1):
        Gl = eval_gegenbauer(l, 1.5, xq)       # zonal harmonic ~ C_l^{3/2}(x)
        norm2 = (meas * Gl * Gl).sum()
        cl = (meas * sig * Gl).sum() / norm2
        lam = l*(l+1)*(l+2)*(l+3)
        A += lam * cl*cl * norm2               # <sigma, P4 sigma>
    B = Q4 * (meas * sig).sum()                # <Q, sigma>, Q const
    C = np.log((meas * np.exp(4*sig)).sum() / V)
    return A, B, C, V

def run_S4():
    ss = np.linspace(0.0, 2.0, 21)
    A = np.array([s4_pieces(s)[0] for s in ss])
    B = np.array([s4_pieces(s)[1] for s in ss])
    C = np.array([s4_pieces(s)[2] for s in ss])
    # Theorem (Beckner/Branson): there exist constants (c1,c2) with
    #   action(s) = c1*A + c2*B - C  IDENTICALLY 0 on the orbit.
    # We do NOT assume them: solve the OVER-determined linear system c1*A+c2*B = C
    # (21 equations, 2 unknowns). If a single (c1,c2) kills the residual to
    # numerical precision, the full anomaly action is FLAT on the orbit (invariant).
    # If the anomaly could select, no 2-parameter fit could flatten 21 s-values.
    M = np.column_stack([A, B])
    coef, res, rank, sv = np.linalg.lstsq(M, C, rcond=None)
    c1, c2 = coef
    action = c1*A + c2*B - C
    return ss, A, B, C, c1, c2, action

# ================================================================ (C) off-orbit Weyl^2
def weyl_penalty(phi2_grid, c_coeff=1.0):
    """SCHEMATIC leading order. On the round orbit Weyl == 0 identically (conformally
    flat), so the Type-B (c*W^2) anomaly action is 0 for ALL s. A York TT/shear datum
    phi_2 induces 4D Weyl curvature at leading order W ~ phi_2, so
        S_c(phi_2) = c * INT W^2 ~ c * kappa * phi_2^2 + O(phi_2^3),
    an even, positive penalty MINIMIZED at phi_2 = 0. The coefficient (c, kappa) is set
    by matter content, NOT by LMU, and it selects the ROUND point (phi_2=0), i.e. it
    penalizes DEPARTURE from conformal flatness -- it does not pick a point WITHIN the
    round-S^4 conformal orbit. [labeled schematic: leading-order structure, not a
    first-principles Weyl integral of a named squashed metric]"""
    kappa = 1.0
    return c_coeff * kappa * phi2_grid**2

# ================================================================ main
if __name__ == "__main__":
    print("="*74)
    print("ATTEMPT E1: anomaly / Q-curvature action along the Obata orbit u_s")
    print("="*74)

    # ---- (A) validation on S^2 --------------------------------------------
    ss2, full2, quad2 = run_S2()
    print("\n[A] VALIDATION on S^2 (Onofri functional) -- machinery check")
    print("    s      Onofri_full      naive_quadratic_only")
    for i in (0, 5, 10, 15, 20):
        print(f"  {ss2[i]:4.2f}   {full2[i]: .3e}      {quad2[i]: .3e}")
    print(f"  full: max|E|            = {np.max(np.abs(full2)):.2e}  (should be ~0: FLAT on orbit)")
    print(f"  full: max|dE/ds|        = {np.max(np.abs(np.gradient(full2, ss2))):.2e}")
    print(f"  quadratic-only: range   = {quad2.max()-quad2.min():.3e}  (NOT flat: rises with s)")
    onofri_flat = np.max(np.abs(full2)) < 1e-6

    # ---- (B) S^4 anomaly action -------------------------------------------
    ss, A, B, C, c1, c2, action = run_S4()
    print("\n[B] S^4 anomaly (Riegert/Beckner Q-curvature) action on the orbit")
    print("    action(s) = c1*<sigma,P4 sigma> + c2*<Q,sigma> - log<e^{4 sigma}>")
    print(f"    over-determined fit (21 eqns, 2 unknowns): c1={c1:.6f}  c2={c2:.6f}")
    print("    s      <sig,P4 sig>   <Q,sig>     log<e4s>    action(s)")
    for i in (0, 5, 10, 15, 20):
        print(f"  {ss[i]:4.2f}  {A[i]: .4e}  {B[i]: .3e}  {C[i]: .3e}  {action[i]: .3e}")
    dact = np.gradient(action, ss)
    print(f"\n  max|action(s)|          = {np.max(np.abs(action)):.2e}")
    print(f"  max|d action/ds|        = {np.max(np.abs(dact)):.2e}")
    print(f"  NAIVE quadratic <sig,P4 sig> range = {A.max()-A.min():.3e}  (rises ~s^2; the trap)")
    # residual of the flatness fit = the decisive number
    resid = action - action.mean()
    print(f"  fit residual RMS        = {np.sqrt(np.mean(resid**2)):.2e}")

    # Is there an ISOLATED zero of d(action)/ds, or is it identically flat?
    flat = np.max(np.abs(dact)) < 1e-5 and np.max(np.abs(resid)) < 1e-5
    # count sign changes of dact (an isolated extremum would give exactly one, with
    # non-vanishing curvature); flat gives noise-level derivative everywhere
    signch = np.sum(np.diff(np.sign(dact + 1e-30)) != 0)

    # ---- (C) off-orbit Weyl^2 penalty -------------------------------------
    phi2 = np.linspace(-1, 1, 9)
    Sc = weyl_penalty(phi2)
    print("\n[C] OFF-orbit: York shear phi_2 -> Weyl^2 != 0 -> Type-B c-anomaly switches on")
    print("    phi_2:", np.round(phi2, 2))
    print("    S_c :", np.round(Sc, 3), " [schematic ~ c*kappa*phi_2^2]")
    print(f"    argmin S_c = phi_2 = {phi2[np.argmin(Sc)]:.2f}  (the ROUND point; penalizes anisotropy)")
    print("    -> selects phi_2=0 (round), does NOT pick a point WITHIN the round orbit;")
    print("       coefficient set by matter content, not by LMU. RELOCATES, not closes.")

    # ---- verdict -----------------------------------------------------------
    print("\n" + "="*74)
    print("VERDICT")
    print("="*74)
    print(f"  S^2 Onofri machinery validated (full flat, quadratic not): {onofri_flat}")
    print(f"  S^4 anomaly action on Obata orbit is IDENTICALLY FLAT     : {flat}")
    print(f"  d(action)/ds sign-changes (isolated extremum would be 1)  : {signch}")
    print(f"  max|d(action)/ds| = {np.max(np.abs(dact)):.1e}  (numerical-zero => no isolated extremum)")
    if flat:
        print("\n  => The anomaly-induced (Riegert/Q-curvature) action is CONSTANT along the")
        print("     entire Obata conformal orbit. d(action)/ds has NO isolated zero; it is")
        print("     numerically zero everywhere. The apparent curvature of the naive quadratic")
        print("     <sigma,P4 sigma> (which rises ~s^2) is EXACTLY cancelled by the log-volume")
        print("     term -- that cancellation IS the Obata degeneracy / conformal invariance.")
        print("     CLEAN NEGATIVE: the anomaly does NOT select a unique Omega on the round S^3.")
        print("     It can only vary OFF the orbit (via Weyl^2, part C), penalizing anisotropy")
        print("     with a matter-fixed coefficient -- a relocation of the question, not closure.")
    else:
        print("\n  => action(s) has structure; inspect for an isolated extremum (would be a")
        print("     genuine selection). Check coefficients / normalization before claiming it.")
