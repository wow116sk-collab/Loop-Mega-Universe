#!/usr/bin/env python3
"""
CLOSURE ATTEMPT D -- can the R^2 plateau amplitude be COUNTED from field content
(via the conformal/trace anomaly coefficient) instead of TUNED to A_s?

Chain:  anomaly coeff (counts N_scalar,N_fermion,N_vector)
          -> R^2 coefficient  (dimensionless, Planck units)
          -> scalaron mass M  -> A_s.

Owners (build ON, do not reinvent):
  Starobinsky 1980            : S=(1/2)int sqrt(-g)[M_Pl^2 R + R^2/(6 M^2)]
  Netto-Pelinson-Shapiro-Staro: coeff[R^2] = N_efolds^2 / (288 pi^2 A_s)   (arXiv:1509.08882)
  Hawking-Hertog-Reall 2001   : anomaly gives the PLATEAU SHAPE, magnitude free
  Duff 1977/1994              : R^2 is NOT a genuine Weyl anomaly (scheme-dependent)
  Shapiro                     : anomaly c-coeff = (2N0+12N_{1/2}-36N1)/(360(4pi)^2)

All numbers reproducible; runtime << 1s.
"""
import math

pi = math.pi
M_Pl_GeV = 2.435e18   # reduced Planck mass (GeV)

# ---------------------------------------------------------------------------
# (0) Observed target
# ---------------------------------------------------------------------------
A_s   = 2.2e-9        # Planck scalar amplitude (pivot 0.05/Mpc)
N_ef  = 55.0          # e-folds at CMB pivot

print("="*74)
print("ATTEMPT D : is the R^2 plateau amplitude COUNTED or TUNED?")
print("="*74)
print(f"target A_s = {A_s:.2e},  N_efolds = {N_ef:.0f}\n")

# ---------------------------------------------------------------------------
# (1) The R^2 coefficient the data demands  (NPSS closed form)
#     coeff[R^2] = N^2 / (288 pi^2 A_s)
# ---------------------------------------------------------------------------
coeff_R2 = N_ef**2 / (288 * pi**2 * A_s)
print("-"*74)
print("(1) R^2 coefficient FIXED BY the observed amplitude (NPSS 1509.08882)")
print("-"*74)
print(f"    coeff[R^2] = N^2/(288 pi^2 A_s) = {coeff_R2:.3e}   (~5e8, the 'tuned' number)")

# cross-check via scalaron mass:  coeff = 1/(12 M^2) in reduced-Planck units
# => M/M_Pl = 1/sqrt(12*coeff)
M_over_MPl = 1.0/math.sqrt(12*coeff_R2)
M_GeV      = M_over_MPl*M_Pl_GeV
print(f"    <=> M/M_Pl = 1/sqrt(12*coeff) = {M_over_MPl:.3e}")
print(f"    <=> scalaron M = {M_GeV:.2e} GeV   (Starobinsky's ~3e13 GeV)")

# independent cross-check: A_s = (N^2/24 pi^2)(M/M_Pl)^2  should reproduce A_s
A_s_check = (N_ef**2/(24*pi**2))*M_over_MPl**2
print(f"    self-consistency A_s(from M) = {A_s_check:.2e}  (target {A_s:.2e})\n")

# ---------------------------------------------------------------------------
# (2) Anomaly coefficients from a DEFINITE field content
#     Weyl^2 :  b  = (N0 + 6 N_{1/2} + 12 N1)/(120(4pi)^2)
#     Euler  :  b' = -(N0 + 11 N_{1/2} + 62 N1)/(360(4pi)^2)
#     Shapiro c (the R^2-ish / box-R piece):
#               c  = (2 N0 + 12 N_{1/2} - 36 N1)/(360(4pi)^2)
#     (N_{1/2} counts Dirac fermions)
# ---------------------------------------------------------------------------
def anomaly_coeffs(N0, Nhalf, N1):
    fourpi2 = (4*pi)**2
    b  =  (N0 + 6*Nhalf + 12*N1)/(120*fourpi2)
    bp = -(N0 + 11*Nhalf + 62*N1)/(360*fourpi2)
    c  =  (2*N0 + 12*Nhalf - 36*N1)/(360*fourpi2)
    return b, bp, c

contents = {
    "Standard Model (real dof ~118)":      dict(N0=4,   Nhalf=45,  N1=12),
    "MSSM (~ a few x 100)":                dict(N0=104, Nhalf=61,  N1=12),
    "SU(5) GUT (~200 dof)":                dict(N0=34,  Nhalf=45,  N1=24),
    "SO(10) GUT (~300 dof)":               dict(N0=100, Nhalf=48,  N1=45),
}

print("-"*74)
print("(2) Anomaly coefficients from real field contents")
print("-"*74)
hdr = "|bprime|"
print(f"{'content':38s} {'|b|':>9s} {hdr:>9s} {'|c|':>9s}")
for name, f in contents.items():
    b, bp, c = anomaly_coeffs(**f)
    print(f"{name:38s} {abs(b):9.2e} {abs(bp):9.2e} {abs(c):9.2e}")
print("    -> every real content gives anomaly coeff of order 1e-2 -- 1e0.")
print("       (the 1/(360*16pi^2) suppression keeps them tiny)\n")

# ---------------------------------------------------------------------------
# (3) INVERT: how many fields N_eff to make an ANOMALY-TYPE coeff hit ~5e8 ?
#     Model the driving coeff as N_eff * (per-field anomaly weight).
#     Two bracketing per-field weights:
#       (a) full anomaly suppression : w = 1/(360*(4pi)^2)   (Shapiro-normalised)
#       (b) crude / optimistic       : w = 1/(4pi)^2         (no 360, best case)
# ---------------------------------------------------------------------------
w_anom  = 1.0/(360*(4*pi)**2)   # ~ 1.76e-5
w_crude = 1.0/((4*pi)**2)       # ~ 6.33e-3

N_needed_anom  = coeff_R2 / w_anom
N_needed_crude = coeff_R2 / w_crude

print("-"*74)
print("(3) INVERT: fields needed so an anomaly-type coeff reaches ~5e8")
print("-"*74)
print(f"    per-field weight (full anomaly 1/(360*16pi^2)) = {w_anom:.2e}")
print(f"        -> N_eff = coeff/w = {N_needed_anom:.2e} fields")
print(f"    per-field weight (crude best-case 1/16pi^2)    = {w_crude:.2e}")
print(f"        -> N_eff = coeff/w = {N_needed_crude:.2e} fields")
real_max = 300
print(f"    largest real content considered ~ {real_max} dof")
print(f"    shortfall (full anomaly)  : {N_needed_anom/real_max:.1e}x  (~{math.log10(N_needed_anom/real_max):.0f} orders)")
print(f"    shortfall (crude best)    : {N_needed_crude/real_max:.1e}x  (~{math.log10(N_needed_crude/real_max):.0f} orders)\n")

# ---------------------------------------------------------------------------
# (4) FORWARD: implied A_s if the coeff were only what a real content supplies
#     (using the crude best-case weight -- most generous to 'counting')
# ---------------------------------------------------------------------------
print("-"*74)
print("(4) FORWARD: A_s predicted if coeff = N_dof * (best-case weight)")
print("-"*74)
print(f"{'content':38s} {'coeff_pred':>11s} {'A_s_pred':>11s} {'A_s/A_s_obs':>12s}")
for name, f in contents.items():
    Ndof = f['N0'] + 4*f['Nhalf'] + 4*f['N1']   # rough propagating dof (Dirac=4, vector=4)
    coeff_pred = Ndof * w_crude
    # invert NPSS: A_s = N^2/(288 pi^2 coeff)
    A_s_pred = N_ef**2/(288*pi**2*coeff_pred)
    print(f"{name:38s} {coeff_pred:11.2e} {A_s_pred:11.2e} {A_s_pred/A_s:12.2e}")
print("    -> real contents give coeff ~ O(1), hence A_s_pred ~ O(1):")
print("       ~9 orders of magnitude TOO LARGE (universe far too inhomogeneous).\n")

print("="*74)
print("VERDICT")
print("="*74)
print(f"  Need coeff ~ {coeff_R2:.1e}  <=>  N_eff ~ 1e11 - 3e13 conformal fields.")
print( "  Real content (SM/MSSM/GUT) ~ 1e2 dof  =>  short by ~9-11 orders.")
print( "  Anomaly gives the plateau SHAPE for free; the AMPLITUDE is NOT counted.")
print( "  RESULT: amplitude stays TUNED. Smallest residue = ONE dimensionless")
print( "          number, coeff[R^2] ~ 5e8 (== A_s == M/M_Pl). Field-wide, not LMU-specific.")
