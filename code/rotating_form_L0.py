#!/usr/bin/env python3
"""Can the forming aeon's ROTATION drive the observed accelerated expansion, and can
accumulation in L0 proceed until the form collapses?  Both answers are NO, and this
script prices them.  It is the quantified version of the document's dead-end A2
("DE/Lambda origin: rotation/vorticity -- Saadeh et al. 2016 kills", tex:1355/1438),
extended to the accumulation half, which A2 did not cover.

THE PROPOSAL BEING PRICED (Pitarn, 2026-09-07 -- stated carefully, since an earlier
grading pass mis-assigned it):  L0 stays INFINITE and unbounded (fork 5 untouched).
What curves is the FORM that condenses inside it: mass accumulates, the region sags,
accumulation continues until it can compress L0 spacetime, then it collapses, matter
flows in to a critical point, and the form begins to ROTATE.  The rotation spins up
during the "thaw" (build-up) -- read as the cause of the observed acceleration -- and
spins down again as mass decays through sub-black-holes, "freezing" back into L0 when
the last hole evaporates.

WHAT WAS ALREADY IN THE REPO (not re-derived here):
  * the accumulation picture itself: review/L0_SHALLOW_WELL_accumulation.md (2026-07-07,
    current) -- only COLD matter accumulates, giving a broad, shallow, low-Weyl,
    NON-collapsing well in an infinite L0;
  * the aeon is born CURVED and flattened by inflation: open FRW patch, Omega_k < 0
    (tex:851), so "the form has slight curvature" is canon;
  * the form inherits a preferred spin AXIS: the C5 carry-through channel (tex:838),
    tagged [Hyp] and pinned as "directly unobservable in principle" (tex:1250);
  * "thawing" is already F1's registered physics -- but there the thaw is a FIELD
    beginning to roll, not a rotation.
The two genuinely new pieces are the ones priced below: (i) accumulation continuing to
collapse, (ii) rotation as the engine of acceleration.

OWNED INGREDIENTS (mechanism = owner's; ours = only the wiring onto L0):
  * Raychaudhuri equation: vorticity enters as +omega^2, opposing focusing.
  * Angular-momentum conservation on a comoving patch, L ~ M R^2 omega with R ~ a
    => omega ~ a^-2 => the rotational term in the acceleration budget ~ a^-4.
  * Saadeh, Feeney, Pontzen, Peiris & McEwen, PRL 117, 131302 (2016): Planck T+E over
    ALL Bianchi degrees of freedom; vector (vorticity-carrying) mode (sigma_V/H)_0 <
    4.7e-11 (95% CL); odds against anisotropic expansion 121,000:1.
  * Planck 2015 XVIII, A&A 594, A18: Bianchi VII_h coupled to LCDM, (omega/H)_0 < 7.6e-10.
  * Hawking 1974/75 (T_H); Gibbons & Hawking, PRD 15, 2738 (1977) (T_dS) -> the
    mortality ceiling M_eq where T_H = T_dS (OPEN_PROBLEMS section 2).
  * What honestly survives on the other side: Verma, Aluri, Mota & Obukhov, JCAP 06
    (2026) 047 -- a Goedel-class cosmographic preference, 0.29 (+0.21/-0.15) at z<=0.2,
    axis ~(243 deg, -49 deg), i.e. ~1.9 sigma with Delta-AIC = -2.23. The authors do
    not claim a detection, and the Goedel class is one the CMB bounds do not cover.

STATUS: assembly [Fact-th|cond on repo conventions]; order-of-magnitude throughout;
no new mechanism claimed; no falsifier moved. Conventions match sibling scripts
(H_inf = 1.83e-18 s^-1; survivor band 1e10-1e12 Msun). Verified 2026-09-07.
"""
import math

# ---------------- constants (SI) ----------------
G, c, hbar, kB = 6.674e-11, 2.998e8, 1.055e-34, 1.381e-23
Msun, Mpc, Gyr = 1.989e30, 3.086e22, 3.156e16
H0 = 67.66e3 / Mpc                     # today, s^-1
OmL, Om_m, Om_r, Om_k = 0.685, 0.315, 9.2e-5, 1e-3
H_inf = 1.83e-18                       # L0 de Sitter rate (repo spine)

BOUNDS = [("Planck 2015 XVIII, Bianchi VII_h", 7.6e-10),
          ("Saadeh+ 2016 PRL, T+E vector mode", 4.7e-11)]

print("=" * 74)
print("CHECK 1 -- how much rotation would it take to BE the acceleration?")
print("=" * 74)
# to supply the observed acceleration the +omega^2 term must rival the Lambda term:
#   omega^2 ~ Lambda ~ 3 Omega_L H0^2
w_need = math.sqrt(3 * OmL) * H0
print(f"  required omega = sqrt(3*Om_L)*H0 = {w_need:.3e} s^-1   ->  omega/H0 = {w_need/H0:.2f}")
for nm, b in BOUNDS:
    r = w_need / H0 / b
    print(f"    vs {nm:35s} {b:.1e}  ->  exceeds by {r:.1e}x ({math.log10(r):.1f} orders)")
print("  -> the engine has to be ~10 orders stronger than the sky allows. Dead on size alone.")

print()
print("=" * 74)
print("CHECK 2 -- the dilution race: why the TIMING is backwards")
print("=" * 74)
print("  L ~ M R^2 omega conserved, R ~ a  =>  omega ~ a^-2  =>  omega^2 ~ a^-4 (radiation-like)")
print()
print(f"  {'component':24s} {'scales as':>10s} {'today':>10s} {'at z=1':>10s} {'at z=1000':>12s}")
rows = [("matter", -3, Om_m, ""), ("radiation", -4, Om_r, ""),
        ("curvature", -2, Om_k, ""), ("Lambda / dS floor", 0, OmL, ""),
        ("rotation (omega^2)", -4, OmL, "  <- GRANTED the whole DE budget today")]
for nm, n, o0, tag in rows:
    print(f"  {nm:24s} {('a^%+d' % n):>10s} {o0:10.2e} {o0*2.0**(-n):10.2e} {o0*1001.0**(-n):12.2e}{tag}")
print(f"""
  -> even granting rotation the entire dark-energy budget TODAY, at recombination it
     was ~{1001.0**4:.0e}x larger -- it would have dominated the early universe and wrecked
     the CMB.  A component diluting as a^-4 cannot switch ON late.  Observed
     acceleration began only ~5 Gyr ago: that is the signature of something that does
     NOT dilute (w = -1, rho ~ a^0) finally overtaking the ones that do.
     [same failure class as photon crossfire in code/bw_crossfire_L0.py: a^-4 always
      loses to expansion; only a w=-1 field is dilution-proof.]""")

print("=" * 74)
print("CHECK 3 -- is there a ceiling on 'accumulate until it presses L0 spacetime'?")
print("=" * 74)
rho_dS = 3 * H_inf**2 / (8 * math.pi * G)
R_H = c / H_inf
M_horizon = rho_dS * (4 / 3.) * math.pi * R_H**3
def M_collapse(rho):                   # pile of density rho reaches its own R_s
    return math.sqrt(3 * c**6 / (32 * math.pi * G**3 * rho))
T_dS = hbar * H_inf / (2 * math.pi * kB)
M_eq = hbar * c**3 / (8 * math.pi * G * kB * T_dS)      # T_H = T_dS, mortality ceiling

print(f"  L0 substrate: H = {H_inf:.2e} s^-1, horizon c/H = {R_H/Mpc:.2e} Mpc")
print(f"    floor density rho_dS    = {rho_dS:.2e} kg/m^3")
print(f"    mass inside one horizon = {M_horizon/Msun:.2e} Msun")
print()
print("  collapse mass vs the density the pile actually has:")
for nm, rho in [("L0 de Sitter floor", rho_dS), ("1000x the floor", 1e3 * rho_dS),
                ("IGM today ~1e-27", 1e-27)]:
    Mc = M_collapse(rho)
    print(f"    rho = {rho:9.2e} kg/m^3  ->  needs M = {Mc/Msun:9.2e} Msun "
          f"({Mc/M_horizon:.2f}x the horizon mass)")
print()
print("  the two ceilings, derived independently, land on the same scale:")
print(f"    collapse mass at the floor   = {M_collapse(rho_dS)/Msun:.2e} Msun")
print(f"    mortality ceiling M_eq       = {M_eq/Msun:.2e} Msun   [OPEN_PROBLEMS section 2]")
print(f"    ratio = {M_collapse(rho_dS)/M_eq:.2f}   (both are the de Sitter mass scale)")
print(f"""
  -> TWO independent walls, and the second is self-defeating:
     (i) to collapse at the floor the pile must gather ~1x the mass inside its own
         de Sitter horizon -- material beyond c/H recedes faster than it can fall in;
     (ii) even granting it, at that mass T_H < T_dS: the object is IMMORTAL. It never
         evaporates, so there is no terminal flash and no next aeon.  The collapse
         route does not open a cycle, it ends one.
     This is the same ceiling the repo derived for the mortality window, reached here
     from mass-accumulation instead of from temperature -- an internal consistency
     check that passes.""")

print("=" * 74)
print("VERDICT")
print("=" * 74)
print("""  The accumulation / curved-form / thaw-freeze skeleton is ALREADY the repo's
  (L0_SHALLOW_WELL 2026-07-07; tex:851 open FRW; C5 spin axis tex:838; F1 thawing).
  The two additions fail:
    * rotation as the acceleration engine -> DEAD, ~10 orders over the CMB bound and
      diluting a^-4 when the data demand a^0. Quantifies dead-end A2.
    * accumulation to collapse -> DEAD, blocked by the de Sitter horizon budget and,
      if forced, produces an immortal hole (no flash, no cycle).
  What survives is narrow and belongs to someone else: a ~1.9 sigma Goedel-class
  cosmographic preference (Verma+ JCAP 2026) in a model class the CMB bounds do not
  reach. Watch-line only; no falsifier moved.
  [assembly Fact-th|cond ; rotation-as-DE: dead-end A2, now priced]""")
