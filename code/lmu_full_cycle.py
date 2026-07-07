#!/usr/bin/env python3
"""The full LMU cycle, pre-aeon -> new aeon, computed in ONE pass so every value in
review/LMU_full_cycle_equations.md is reproducible in sequence. Nothing new: this
ASSEMBLES the equations already established (and attributed) across this session's
scripts. Every mechanism is borrowed (owner in the .md); only the wiring is [Hypo].

v3.27 picture (DETERMINISTIC FLASH): the survivor's evaporation is CERTAIN (Hawking) ->
its terminal flash TRIGGERS the roll of the omega-inflaton already sitting on the
alpha-attractor plateau -> the free lunch supplies the GUT energy -> inflation dilutes
the residual to a TINY NONZERO de Sitter floor (V_min = rho_Lambda, anchored to the
measured Lambda). No metastable barrier, no tunnelling, no probabilistic decay -- so
de Sitter stability / P>0 / V_min=0 are FIELD-WIDE questions LMU shares, NOT LMU-
specific open items. The LMU-specific open items are exactly TWO: the '+3' spread
[soft] and the wiring omega=inflaton [Hypo]. SSOT: review/LMU_SYNTHESIS_2026-07-07.md.
"""
import math
Mp=2.435e18; MPl=1.22e19; Msun=1.989e30
c=299792458.0; G=6.67430e-11; hbar=1.054571817e-34; kB=1.380649e-23
GeV_J=1.602176634e-10; yr=3.156e7
As_obs, ns_obs = 2.1e-9, 0.9649      # Planck INPUTS (measured)
H0=2.20e-18; OmL=0.6889              # measured today (1/s ; Planck)

def head(s): print("\n"+s)

head("STAGE 0 -- PRE-AEON COLD END (L0 shallow well) ==========================")
m_over_H0=0.804                                        # A-field mass (doc Run 2)
rho_L=OmL*3*H0**2/(8*math.pi*G)                        # measured Lambda density
H_inf=H0*math.sqrt(OmL)                                # asymptotic de Sitter rate
print(f"  A-field: V=1/2 m^2 A^2, KG: A'' +3H A' +m^2 A=0 -> thaws to a TINY NONZERO floor")
print(f"    endgame = tiny de Sitter: V_min=rho_Lambda={rho_L:.2e} kg/m^3=(2.3 meV)^4,")
print(f"      H_inf=H0 sqrt(OmL)={H_inf:.2e}/s > 0  (anchored to measured Lambda; NOT V_min=0/Minkowski)")
print(f"    m={m_over_H0} H0, A_i=2.70 Mp (start)")
tau=1e100                                              # interlude ~ evaporation time
M_sol=(tau/2.1e67)**(1/3); M_kg=M_sol*Msun
print(f"  survivor L1: tau_evap=2.1e67 (M/Msun)^3 yr = interlude {tau:.0e} yr -> M={M_sol:.1e} Msun")
S_BH=4*math.pi*G*M_kg**2/(hbar*c)
print(f"    carried entropy S_BH=4 pi G M^2/(hbar c) = {S_BH:.1e} kB")
rho_BH=3*c**6/(32*math.pi*G**3*M_kg**2)
print(f"  shallow well: rho_BH=3c^6/(32 pi G^3 M^2)={rho_BH:.1e} kg/m^3 (less dense than air, doc L1364)")
print(f"    -> anti-concentration: the pile does NOT collapse to a BH; calm, low-Weyl, delta~O(1)")

head("STAGE 1 -- THE FLASH (deterministic trigger) ============================")
M_end_kg=1.5e-3                                        # ~1.5 g endpoint
T_flash=MPl**2/(8*math.pi*7e4*MPl)                     # endpoint Hawking T
E_burst=M_end_kg*c**2
print(f"  the survivor WILL evaporate (Hawking -- CERTAIN, ~10^100 yr) to endpoint ~1.5 g:")
print(f"    T_flash=MPl^2/(8 pi M_end)={T_flash:.1e} GeV, burst E=M_end c^2={E_burst:.1e} J")
print(f"  the flash is only the TRIGGER, not the fuel (doc L828 'one-way flash, not self-ignition')")

head("STAGE 2 -- IGNITION = the field is already on the plateau ================")
N=2/(1-ns_obs); alpha=1.0
phi_N=math.sqrt(1.5*alpha)*math.log(4*N/(3*alpha))
print(f"  the omega-inflaton (= prior aeon's conformal factor, the [Hypo] wiring) sits at")
print(f"    phi_N=sqrt(3a/2) ln(4N/3a)={phi_N:.1f} Mp on the alpha-attractor plateau (alpha={alpha:.0f}).")
print(f"  the plateau is an infinitely long flat valley -> 'large phi' is NATURAL, not tuned")
print(f"    (Carrasco-Kallosh-Linde 2015); the flash's radiation kicks it into slow-roll")
print(f"    (Bastero-Gil 2016). NO metastable barrier, NO tunnelling -> the reset is CERTAIN,")
print(f"    not a probabilistic decay.  [replaces the old CDL-nucleation / P>0 step]")

head("STAGE 3 -- HOT START (energy half, free lunch) ===========================")
r=12*alpha/N**2                                        # Starobinsky alpha=1 value
eps=r/16
V=24*math.pi**2*eps*As_obs*Mp**4                       # fixed by A_s
V14=V**0.25
Treh=(30*V/(math.pi**2*200))**0.25
print(f"  V=V0(1-e^-sqrt(2/3a) phi/Mp)^2; the well is cold+diffuse so the energy is the FREE LUNCH")
print(f"  INPUT A_s={As_obs:.1e} -> V=24 pi^2 eps A_s Mp^4 -> V^1/4={V14:.2e} GeV")
print(f"  reheating (free lunch, Guth 1981): T_reh=(30V/pi^2 g*)^1/4={Treh:.2e} GeV")

head("STAGE 4 -- CMB (observables) ============================================")
print(f"  n_s = 1-2/N = {1-2/N:.4f}       [= input, identity ; N={N:.0f}]")
print(f"  r   = 12 alpha/N^2 = {r:.4f}   [Starobinsky's alpha=1 value, conditional on the wiring]")
print(f"  A_s = V/(24 pi^2 eps Mp^4) = {V/(24*math.pi**2*eps*Mp**4):.2e}  [= input, a FIT]")
print(f"  dT/T = sqrt(A_s) = {As_obs**0.5:.1e}")

head("STAGE 5 -- SMOOTH HALF (dilution) =======================================")
resid=math.exp(-2*N)
k_req=122*math.log(10)/N
print(f"  per-point Weyl diluted: e^-2N = {resid:.1e} (44 orders below 1e-5)")
print(f"  reaching the 10^-122 floor needs exponent k=122 ln10/N={k_req:.2f}:")
print(f"    hand-wave '+3 spread' 2+3=5 HITS ({abs(5-k_req)/k_req*100:.0f}%); rigorous 2+1.5=3.5 MISSES")
print(f"    -> the '+3 spread' is LMU-specific OPEN ITEM #1 [soft]")

head("STAGE 6 -- THERMAL BRIDGE ===============================================")
T_cmb_K=2.72548; T_cmb_GeV=kB*T_cmb_K/GeV_J   # kB*T in J, /( J/GeV ) -> GeV
N_post=math.log((Treh/T_cmb_GeV)*(106.75/3.909)**(1/3))
print(f"  T_reh={Treh:.1e} GeV -> T_CMB={T_cmb_K} K over ~{N_post:.0f} post-reheat e-folds (T ~ 1/a)")
print(f"    2.725 K is MEASURED (boundary condition), NOT derived")

head("STAGE 7 -- ENTROPY (closing the budget) =================================")
s=(2*math.pi**2/45)*3.909*(kB*T_cmb_K/(hbar*c))**3
R=46.5*9.461e24; S_rad=s*(4/3)*math.pi*R**3
S_hor=(4*math.pi*(c/H_inf)**2)/(4*(hbar*G/c**3))       # ceiling at the tiny de Sitter endgame
print(f"  radiation: S=s(T) V_obs={S_rad:.1e} kB (CMB piece)")
print(f"  horizon (tiny de Sitter endgame): S=A/4G={S_hor:.1e} kB -- the ceiling is FINITE, not infinite")
print(f"  Frautschi gap S_max - S = fresh negentropy budget for the next aeon")

head("STAGE 8 -- BACK TO COLD (loop closes) ===================================")
print(f"  structure forms -> black holes -> merge -> new survivor; A-field thaws to the tiny")
print(f"  de Sitter floor (V_min=rho_Lambda, H->H_inf>0) -> returns to STAGE 0 (shallow well).")
print(f"  the tiny universal values we measure today ARE our own aeon's dilute components.")
print(f"\n  LMU-specific OPEN items = exactly TWO: (1) the '+3' spread [soft] (STAGE 5);")
print(f"  (2) the wiring omega=inflaton [Hypo] (STAGE 2). de Sitter stability / P>0 / V_min=0 /")
print(f"  swampland = FIELD-WIDE questions LMU shares, NOT LMU closure-blockers (the flash is a")
print(f"  certain trigger -- no barrier, no decay needed). SSOT: review/LMU_SYNTHESIS_2026-07-07.md")
