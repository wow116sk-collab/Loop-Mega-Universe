#!/usr/bin/env python3
"""CEAW stress-test + REPAIR. Adversarially refute each load-bearing claim, then show the
fix that makes the diagnostic robust. Reproduce. (Companion: code/ceaw_perseus.py,
code/ceaw_gamma_channels.py; record: review/CEAW_L2_diagnostic.md.)
"""
import math
kpc=3.086e21; keV=1.602e-9; mp=1.6726e-24; yr=3.156e7
mu=0.61; gamma_a=5.0/3.0
kT=3.5*keV; ne=0.05
cs=math.sqrt(gamma_a*kT/(mu*mp))
P0=1.92*ne*kT
def P(r_kpc,dp): return 4*math.pi*(r_kpc*kpc)**2*(dp*P0)**2/(2*gamma_a*P0)*cs

print("############ STRESS ############\n")

print("R1 -- formula gives POWER CARRIED, not HEATING")
lam=11*kpc
T8=(kT/keV)*1.16e7/1e8
mfp=15*T8**2/(ne/1e-3)*kpc
l_damp=lam**2/((2*math.pi)**2*mfp)
print(f"  full-Spitzer acoustic damping length ~ lambda^2/(4pi^2 mfp) ~ {l_damp/kpc:.0f} kpc ~ core scale")
print(f"  (Fabian's case) BUT magnetic suppression x10-100 -> ~{l_damp/kpc*30:.0f} kpc: waves ESCAPE.")
print(f"  => local heating is Spitzer-suppression-dependent. [SOFT hidden 'full dissipation']\n")

print("R2 -- number is order-of-magnitude only")
lo,hi=P(25,0.05),P(50,0.11)
print(f"  P_CEAW ~ (dP/P)^2 r^2 -> {lo:.1e}-{hi:.1e} erg/s = factor {hi/lo:.0f} -> 2-40% of L_cool. [= Open]\n")

print("R3 -- diagnostic 'quiet core = near L1' -- MAIN CASUALTY")
t_duty=lam/cs; t_secular=3e9*yr
print(f"  duty cycle ~ lambda/c_s ~ {t_duty/yr:.1e} yr ; L2->L1 secular ~ {t_secular/yr:.0e} yr")
print(f"  ratio ~ {t_secular/t_duty:.0f} -> a ripple SNAPSHOT samples the DUTY CYCLE, not the stage.")
print(f"  a quiet core is most likely AGN-between-outbursts (~30-70% of the time), NOT near-survivor.")
print(f"  => 'quiet = near L1' FAILS per-object.\n")

print("R4 -- domain: L3~0 mostly holds; groups/giant ellipticals keep hot halos (not strictly 0).\n")

print("############ REPAIR (how to make it complete) ############\n")

t_cool_cc=0.5e9*yr; t_cool_exh=20e9*yr
print("(1) PRESENCE, not heating [fixes R1]: read CEAW as ripple DETECTION/amplitude = 'AGN active',")
print("    NOT as the local heating rate. The heating BUDGET stays with P_cav-L_cool. So the")
print("    carried-vs-dissipated ambiguity no longer sits under the diagnostic.")
print("(2) FUEL-STATE discriminator [fixes R3 -- removes the duty-cycle confounder]:")
print(f"    quiet + FUEL PRESENT (central t_cool~{t_cool_cc/yr:.0e} yr, cold gas, companions) = DUTY-off,")
print(f"      will re-ignite  -> NOT near L1.")
print(f"    quiet + FUEL EXHAUSTED (t_cool>~{t_cool_exh/yr:.0e} yr, high central entropy, no cold gas,")
print(f"      isolated n_gal->0) = SECULAR-off -> near L1.")
print("    the robust tag is 'quiet AND fuel-exhausted AND isolated', never 'quiet' alone.")
print("(3) POPULATION-STATISTICAL [also R3]: test the duty-cycle-AVERAGED feedback (mean ripple")
print("    power, or the quiet+fuel-exhausted fraction) vs BCG mass/isolation across a LARGE sample,")
print("    never a single core -- so the ~%d duty cycles per descent average out." % round(t_secular/t_duty))
print("(4) DOMAIN [fixes R4]: state 'hot X-ray halos' (clusters, groups, giant ellipticals).")
print("(5) NUMBER [R2]: use P_CEAW as an order-of-magnitude consistency check only; pin the channel")
print("    weight Gamma_j with a uniform survey (code/ceaw_gamma_channels.py).\n")

print("HONEST RESIDUE (do not over-claim after repair):")
print("  even repaired, 'fuel-exhausted, isolated BCG = near L1' largely COINCIDES with standard")
print("  cool-core / BCG fuel-exhaustion evolution. So CEAW becomes a robust CONSISTENCY diagnostic")
print("  ([Hybrid]), NOT a unique falsifier -- the true L1 endpoint (~1e100 yr) is unobservable.")
print("  Net after repair: (1) formula ok [Fact-eq], role = presence-diagnostic; (2) number = ")
print("  consistency; (3) diagnostic = duty-averaged + fuel-discriminated + statistical [robust,")
print("  consistency-level]; (4) domain fixed. The [Hybrid]/[Open Gamma_j] labels carry the rest.")
