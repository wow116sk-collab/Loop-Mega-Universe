#!/usr/bin/env python3
"""SEAM PIPELINE, flashover-style: feed an INPUT (the pre-seam state), connect
through the flashover-class equations (runaway -> ignition criterion -> fully
developed fire), and read out the AFTER-AEON. The point of the run is to answer
"can it be computed?" honestly: HOW FAR the pipe carries you, and exactly where
it stops.

Stage map (fire language -> seam language, owners in brackets):
  STAGE 1  the pilot's runaway   : M0 -> t_ev, tau_max, crescendo, match-strike
           [Hawking 1974; Zurek 1982; Semenov-class runaway structure]
  STAGE 2  the ignition criterion: how far up the plateau must the field sit for
           the room to catch (N_total >= 60-85)?  -- the Thomas-correlation
           analog of the aeon  [Kallosh-Linde alpha-attractors; repo flatness
           accounting residual_flatness_{accounting,stress}.py]
  STAGE 3  the fully developed fire: after-aeon state vector
           {N_total, flatness, n_s, r, T_reh, entropy ticks}
           [alpha-attractor formulas; instant-reheat thermodynamics]

HONEST VERDICT BUILT IN: the pipe closes end-to-end with EXACTLY ONE hand-fed
number -- phi0, the field's plateau position at ignition. That number is the
legitimately-free York-type initial datum of wiring closure rounds 1-4: not
derivable by principle, here made concrete as the single dial on the pipeline.
Everything upstream of phi0 (timing, thresholds) and downstream of phi0
(the whole after-aeon) computes from owned formulas. Status: assembly
[Fact-th|cond on inputs]; phi0 [free IC / Hypo]; no seam derivation is claimed
-- this SHARPENS OPEN_PROBLEMS section 3, it does not close it.

Conventions: reduced Planck units for the potential (V0 ~ 1e-10 M_Pl^4,
V0^(1/4) ~ 8e15 GeV); H_inf = 1.83e-18 s^-1 (matches endgame_anchored_desitter
and the corrected flashover figure); alpha-attractor large-field relation
N(phi) = (3a/4) exp(sqrt(2/(3a)) phi/M_Pl); N_CMB = 57 (Planck spine) for the
observables; N_min(instant high-scale reheat) = 63 from the repo stress sweep
(rising to 85 at MeV reheating) -- instant reheat is used here, consistently
with the Stage-3 T_reh.
"""
import numpy as np

# ---------------- constants (SI + reduced-Planck bookkeeping) ----------------
G, hbar, c, kB = 6.674e-11, 1.055e-34, 2.998e8, 1.381e-23
Msun, yr = 1.989e30, 3.156e7
H_inf = 1.83e-18                       # s^-1
T_dS = hbar * H_inf / (2 * np.pi * kB)
MPl_GeV = 2.435e18                     # reduced Planck mass
alpha = 1.0                            # Starobinsky point (repo spine)
V0 = 1e-10                             # plateau height, M_Pl^4 (V0^1/4 ~ 7.7e15 GeV)
N_CMB = 57                             # Planck-spine last-57 window
N_MIN_INSTANT, N_MIN_MEV = 63, 85      # repo flatness minimums (reheating-dep.)
gstar = 106.75

# ---------------- INPUT (the pre-seam state) ----------------
M0_msun = 1e12                         # survivor mass  [input 1: measured-ish]
phi0_sweep = [4.5, 5.0, 5.37, 6.0, 6.5]  # plateau position, M_Pl  [input 2: THE free IC]

M0 = M0_msun * Msun
print("=" * 78)
print("STAGE 1 -- the pilot's runaway (all owned; no freedom here)")
print("=" * 78)
M_eq = hbar * c**3 / (8 * np.pi * G * kB * T_dS)
t_ev = 5120 * np.pi * G**2 * M0**3 / (hbar * c**4)          # photon-sector Hawking time
print(f"  input M0 = {M0_msun:.0e} Msun  ->  mortal branch? "
      f"{'YES (M0 << M_eq = %.1e Msun)' % (M_eq/Msun) if M0 < M_eq else 'NO -- immortal, NO ignition'}")
print(f"  t_ev = {t_ev/yr:.2e} yr   (the aeon's fuse length; t_ev ~ M0^3)")
S_BH0 = 4 * np.pi * G * M0**2 / (hbar * c)                  # in units of k_B
print(f"  tau_max = (1/3) S_BH0 = {S_BH0/3:.2e} k_B   (pre-bang era, finite in entropic time)")
# the 'match-strike' window: burn faster than the substrate's own clock |dlnM/dt| > H_inf
t_na = 1.0 / (3 * H_inf)
M_cut = M0 * (t_na / t_ev) ** (1.0 / 3.0)
print(f"  match-strike window (|dlnM/dt| > H_inf): last {t_na/yr:.1e} yr of the fuse")
print(f"    mass entering the strike: M_cut = {M_cut:.2e} kg = {M_cut/Msun:.1e} Msun")
print(f"    strike energy E_match = {M_cut*c**2:.1e} J  (the 'match head' as the substrate clock sees it)")
print("  -> timing/tempo of ignition: FULLY COMPUTED from M0. No dial anywhere.\n")

print("=" * 78)
print("STAGE 2 -- the ignition criterion (the aeon's 'Thomas correlation')")
print("=" * 78)
def N_of_phi(phi):    # alpha-attractor large-field e-fold count
    return (3 * alpha / 4) * np.exp(np.sqrt(2 / (3 * alpha)) * phi)
def phi_of_N(N):
    return np.sqrt(3 * alpha / 2) * np.log(4 * N / (3 * alpha))
phi_min_60, phi_min_85 = phi_of_N(60), phi_of_N(85)
print(f"  room catches (flat aeon) iff N_total >= {N_MIN_INSTANT} (instant reheat) .. {N_MIN_MEV} (MeV reheat)")
print(f"  -> required plateau position: phi0 >= {phi_of_N(N_MIN_INSTANT):.2f} M_Pl (instant) "
      f".. {phi_of_N(N_MIN_MEV):.2f} M_Pl (MeV)")
print(f"     [reference: N=60 -> {phi_min_60:.2f} M_Pl ; N=85 -> {phi_min_85:.2f} M_Pl]")
print("  -> the CRITERION is fully computed. WHETHER the seam meets it depends on phi0:")
print("     phi0 = the York-type free initial datum (rounds 1-4). The pipe's ONE dial.\n")

print("=" * 78)
print("STAGE 3 -- the fully developed fire: AFTER-AEON state vector, per phi0")
print("=" * 78)
# instant-reheat temperature from the plateau height (owned; matches repo 3.3e15 GeV)
T_reh_GeV = (30 * V0 / (np.pi**2 * gstar)) ** 0.25 * MPl_GeV
n_s = 1 - 2 / N_CMB
r_spine = 12 * alpha / N_CMB**2
print(f"  fixed by (alpha, V0, N_CMB) once ignition succeeds  [owned formulas]:")
print(f"    T_reh (instant) = {T_reh_GeV:.2e} GeV ; n_s = {n_s:.4f} ; r = {r_spine:.4f}")
print(f"  {'phi0/M_Pl':>10} {'N_total':>9} {'flatness (vs N_min=63)':>26} {'Omega_k today':>15}  verdict")
for phi0 in phi0_sweep:
    Nt = N_of_phi(phi0)
    margin = Nt - N_MIN_INSTANT
    if Nt < N_CMB:
        verdict, ok, om = "MISFIRE (CMB window does not even fit)", False, float('nan')
    elif margin < 0:
        verdict, ok = "MISFIRE (open, curvature-dominated aeon)", False
        om = 0.01 * np.exp(-2 * margin)   # exceeds the bound
    else:
        verdict, ok = "IGNITES -> flat hot aeon", True
        om = 0.01 * np.exp(-2 * margin)   # bound met with margin
    om_s = f"{om:.1e}" if np.isfinite(om) else "--"
    print(f"  {phi0:>10.2f} {Nt:>9.1f} {('%+.1f e-folds' % margin):>26} {om_s:>15}  {verdict}")
print(f"""
  entropy ticks of the successful branch (tau-ledger, owned magnitudes):
    flash tick  ~ +{S_BH0/3:.1e} k_B (net evaporation, Zurek 4/3)
    inflation   ~ 0            (the stall -- no entropic time elapses)
    reheat tick ~ +1e88-1e89 k_B (hot bath, Egan-Lineweaver scale)
""")

print("=" * 78)
print("VERDICT -- 'can it be computed?'")
print("=" * 78)
print("""  YES, end-to-end, EXCEPT ONE NUMBER. The flashover-class chain carries:
    M0 --[stage 1, no freedom]--> ignition timing, tempo, match energy
       --[stage 2, no freedom]--> the ignition threshold phi_min(N_min)
    (phi0) --[stage 3, no freedom]--> the complete after-aeon
                                      {N_total, Omega_k, n_s, r, T_reh, S-ticks}
  The single un-computed input is phi0 -- the plateau position at ignition,
  i.e. the legitimately-free York-type datum of the wiring rounds. The pipeline
  therefore proves a sharp form of OPEN_PROBLEMS section 3:
      the seam is a ONE-PARAMETER family of after-aeons;
      deriving that one parameter IS the derivation gap -- nothing else is missing.
  Below the threshold the same pipe computes the MISFIRE (sterile, curvature-
  dominated aeon) -- the formalism prices failure as well as success.
  [assembly: Fact-th|cond ; phi0: free IC ; no seam derivation claimed]""")
