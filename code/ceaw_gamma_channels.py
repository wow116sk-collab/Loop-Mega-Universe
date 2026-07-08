#!/usr/bin/env python3
"""Item (ka): the CEAW channel weight Gamma_sound -- how much of AGN feedback goes into
the acoustic (sound-wave) channel vs the cavity/buoyancy (pdV) channel. Reproduces the
METHOD and shows WHY Gamma_j is [Open]: single-cluster estimates scatter by ~x5.

  Gamma_sound = P_CEAW / (P_cav + P_CEAW)
  P_CEAW from the textbook acoustic power (see code/ceaw_perseus.py);
  P_cav from published X-ray cavity samples (Birzan et al. 2008; Rafferty et al. 2006).

IMPORTANT: the per-cluster numbers below are REPRESENTATIVE order-of-magnitude values
from the cluster-feedback literature, NOT a curated/measured dataset. The point is the
METHOD and the SCATTER, not a precise Gamma. A real value needs a uniform stacked survey
(Chandra/XMM cavities + XRISM ripple/turbulence). Run to reproduce the method.
"""
import math
kpc=3.086e21; keV=1.602e-9; mp=1.6726e-24
mu=0.61; gamma_a=5.0/3.0

def P_ceaw(r_kpc, kT_keV, ne, dPoP):
    kT=kT_keV*keV; P0=1.92*ne*kT
    cs=math.sqrt(gamma_a*kT/(mu*mp))
    return 4*math.pi*(r_kpc*kpc)**2*(dPoP*P0)**2/(2*gamma_a*P0)*cs

# cluster : (r_kpc, kT_keV, ne_cm3, dP/P, P_cav_ergs)  -- REPRESENTATIVE literature scales
clusters = {
    "Perseus"   : (35, 3.5, 0.050, 0.08, 1.0e44),
    "Virgo/M87" : (10, 2.0, 0.100, 0.10, 1.0e43),
    "Centaurus" : (15, 2.0, 0.050, 0.05, 5.0e42),
    "A2052"     : (10, 3.0, 0.030, 0.05, 2.0e43),
    "A2199"     : (20, 4.0, 0.020, 0.05, 3.0e43),
}

print("== Gamma_sound = P_CEAW / (P_cav + P_CEAW), per cluster (REPRESENTATIVE inputs) ==")
gam=[]
for name,(r,kT,ne,dp,Pcav) in clusters.items():
    Pc=P_ceaw(r,kT,ne,dp)
    g=Pc/(Pcav+Pc)
    gam.append(g)
    print(f"  {name:10s}: P_CEAW={Pc:.1e}  P_cav={Pcav:.1e} erg/s  ->  Gamma_sound = {100*g:4.1f}%")

lo,hi=100*min(gam),100*max(gam)
print(f"\n  range across the sample: Gamma_sound ~ {lo:.0f}-{hi:.0f}%  (scatter ~{max(gam)/min(gam):.1f}x)")
print(f"  median ~ {100*sorted(gam)[len(gam)//2]:.0f}%\n")

print("== why Gamma_j is [Open] ==")
print("  the sound-wave fraction comes out order ~10% (range above, median a few-to-~14%), BUT:")
print("  (i) it depends on dP/P and r, measured per-cluster with LARGE uncertainty (P_CEAW ~ dP^2 r^2,")
print("  so a 2x error in dP/P is a 4x error in Gamma); (ii) the sample above is heterogeneous")
print("  (different instruments, extraction radii, ripple methods). So no single Gamma_sound is")
print("  pinned -- the ~10x scatter across this sample IS the open item, and it is input-driven.")
print("  To CLOSE it needs a UNIFORM stacked survey: Chandra/XMM cavity powers + XRISM ripple")
print("  amplitudes & turbulent velocities (Hitomi 2016 gave sigma_v~150 km/s in Perseus alone),")
print("  measured with one pipeline across a controlled cool-core sample.")
print("  Owners: Birzan et al. 2008; Rafferty et al. 2006 (cavities); Fabian et al. 2006 (ripples);")
print("  Hitomi 2016 / XRISM (velocities). The channel decomposition is the author's [Hybrid].")
print("  NOTE: this constrains the DESCENT-side diagnostic only; it does NOT touch the reset")
print("  (items 1/2), and acoustic dissipation INJECTS entropy (heats gas) -- it does not dilute it.")
