#!/usr/bin/env python3
"""HONESTY AUDIT of code/aeon_seam_construction.py: which "matches" are real
computations and which are the observed inputs read back out (a fit, not a
prediction). This script PERTURBS the inputs to prove which outputs merely follow
them. Run to reproduce. No new physics -- this is a self-audit of the seam claims.

Verdict up front:
  - CMB (n_s, r, A_s) "== Planck": ALGEBRAIC IDENTITIES. The observed values are
    INPUTS; they fix (N, alpha, V); the script reads them back out. NOT predicted.
  - S ~ 1e90: a GENUINE forward computation -- but of a STANDARD textbook quantity
    (radiation entropy from the measured T and size). Real arithmetic, not a novel
    prediction.
  - 1e-122 "convergence": the SOFTEST. Rests on an un-derived dilution exponent
    (e^-5N); a defensible alternative exponent breaks the N~57 convergence.
"""
import math
Mp = 2.435e18
As_obs, ns_obs, r_obs = 2.1e-9, 0.9649, 0.009    # Planck -- INPUTS

print("== 1. Are the CMB 'matches' identities? (recompute, compare to input) ==")
def cmb_readback(ns_in, r_in, As_in):
    N   = 2.0/(1.0-ns_in)                          # N fixed FROM observed n_s
    alpha = r_in*N**2/12.0                         # alpha fixed FROM observed r
    eps = r_in/16.0
    V   = 1.5*math.pi**2*r_in*As_in*Mp**4          # V fixed FROM observed r, A_s
    ns_out = 1.0 - 2.0/N                           # read back
    r_out  = 12.0*alpha/N**2                       # read back
    As_out = V/(24*math.pi**2*eps*Mp**4)           # read back
    return N, alpha, ns_out, r_out, As_out
N, alpha, ns_out, r_out, As_out = cmb_readback(ns_obs, r_obs, As_obs)
print(f"   inputs : n_s={ns_obs}, r={r_obs}, A_s={As_obs}")
print(f"   N=2/(1-n_s)={N:.2f}, alpha=r N^2/12={alpha:.3f}")
print(f"   n_s_out - n_s_in = {ns_out-ns_obs:+.2e}   (identity: 1-2/N inverts N=2/(1-n_s))")
print(f"   r_out   - r_in   = {r_out-r_obs:+.2e}   (identity: 12 alpha/N^2 inverts alpha=r N^2/12)")
print(f"   A_s_out / A_s_in = {As_out/As_obs:.10f}    (EXACT identity: the Mp^4 and pi^2 cancel)")
print(f"   -> all three 'matches' are the inputs read back out. NOT predictions.\n")

print("== 2. Perturbation test: feed a FAKE n_s, watch the 'prediction' follow it ==")
for ns_fake in (0.9649, 0.9500, 0.9800):
    Nf, af, ns_o, r_o, As_o = cmb_readback(ns_fake, r_obs, As_obs)
    tag = "  <- real Planck" if ns_fake==0.9649 else "  <- fabricated input"
    print(f"   input n_s={ns_fake} -> 'predicted' n_s={ns_o:.4f} (N={Nf:.1f}){tag}")
print(f"   -> the 'prediction' tracks whatever n_s you feed it. It is a FIT, not a forecast.")
print(f"      (The alpha-attractor FORM is borrowed, Kallosh-Linde 2013; within it, n_s picks N.)\n")

print("== 3. The genuine forward computation: S ~ 1e90 (but a standard quantity) ==")
kB=1.380649e-23; hbar=1.054571817e-34; c=299792458.0
T=2.72548                                         # MEASURED
s=(2*math.pi**2/45)*3.909*(kB*T/(hbar*c))**3
R=46.5*9.461e24; S=s*(4/3)*math.pi*R**3           # R measured
print(f"   from measured T={T} K and R=46.5 Gly: S={S:.2e} kB")
print(f"   -> REAL arithmetic (no input read-back). But it is the textbook radiation entropy")
print(f"      of the observable universe; 'matches the ledger' means the ledger uses the")
print(f"      correct standard number -- a consistency check, not a novel prediction.\n")

print("== 4. The softest claim: 1e-122 'convergence' depends on an un-derived exponent ==")
target = 122*math.log(10)                          # want e^{-k N} = 10^-122
print(f"   the seam asserts spread ~ e^(-5N). But '5' = 2 (per-point) + 3 (spread) is a")
print(f"   hand-wave; statistical averaging over e^3N patches gives e^-1.5N, i.e. exponent 3.5.")
print(f"   {'exponent k':>12} {'N to reach 1e-122':>18} {'converges with N_CMB=57?':>26}")
for k in (3.5, 5.0, 6.0):
    Nk = target/k
    conv = "YES (~57)" if 50<Nk<64 else "NO"
    print(f"   {k:>12.1f} {Nk:>18.0f} {conv:>26}")
print(f"   -> only k=5 lands near 57. A defensible k=3.5 gives N=80 and BREAKS the convergence.")
print(f"      The '10^-122 at the same N as the CMB' is engineered by the exponent choice. SOFT.\n")

print("== CLASSIFICATION (what the seam numbers actually are) ==")
rows = [
    ("V^1/4, T_reheat",  "forward from r,A_s", "real, but rests on r as an input"),
    ("n_s = 0.9649",     "INPUT read back",    "identity -- not predicted"),
    ("r = 0.009",        "INPUT read back",    "identity -- not predicted"),
    ("A_s = 2.1e-9",     "INPUT read back",    "EXACT identity -- not predicted"),
    ("alpha = 2.44",     "fit parameter",      "chosen to match r (O(1), 'reasonable')"),
    ("2.725 K",          "MEASURED",           "script says so: 'not derived'"),
    ("S ~ 1.03e90",      "forward, genuine",   "standard quantity from measured T,R"),
    ("1e-122 at N~57",   "SOFT",               "rests on un-derived exponent e^-5N"),
    ("r prop scale^4",   "genuine structure",  "the real falsifiable content (F4)"),
]
print(f"   {'number':>18} {'status':>20}  note")
for n_, st, nt in rows:
    print(f"   {n_:>18} {st:>20}  {nt}")
print("\n   BOTTOM LINE: nothing is random -- every number traces to a constant or an")
print("   observation through this code. BUT 'matches the CMB' = the inputs read back out")
print("   (a fit on a borrowed alpha-attractor form), NOT a prediction; the 1e90 is genuine")
print("   but standard; the 1e-122 is the softest (engineered by the dilution exponent).")
print("   The only genuinely FORWARD, falsifiable content is F4: r ~ (scale)^4.")
