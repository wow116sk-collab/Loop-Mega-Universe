#!/usr/bin/env python3
"""The full LMU cycle, pre-aeon -> new aeon, computed in ONE pass so every value in
review/LMU_full_cycle_equations.md is reproducible in sequence. Nothing new: this
ASSEMBLES the equations already established (and attributed) across this session's
scripts. Every mechanism is borrowed (owner in the .md); only the wiring is [Hypo].
"""
import math
Mp=2.435e18; MPl=1.22e19; Msun=1.989e30
c=299792458.0; G=6.67430e-11; hbar=1.054571817e-34; kB=1.380649e-23
GeV_J=1.602176634e-10; yr=3.156e7
As_obs, ns_obs = 2.1e-9, 0.9649      # Planck INPUTS (measured)

def head(s): print("\n"+s)

head("STAGE 0 -- PRE-AEON COLD END (L0 basin) ==================================")
m_over_H0=0.804                                        # A-field mass (doc Run 2)
print(f"  A-field: V=1/2 m^2 A^2, KG: A'' +3H A' +m^2 A=0 -> thaws to V_min=0, A->0, H->0")
print(f"    endgame: asymptotic Minkowski (H->0). m={m_over_H0} H0, A_i=2.70 Mp (start)")
tau=1e100                                              # interlude ~ evaporation time
M_sol=(tau/2.1e67)**(1/3); M_kg=M_sol*Msun
print(f"  survivor L1: tau_evap=2.1e67 (M/Msun)^3 yr = interlude {tau:.0e} yr -> M={M_sol:.1e} Msun")
S_BH=4*math.pi*G*M_kg**2/(hbar*c)
print(f"    carried entropy S_BH=4 pi G M^2/(hbar c) = {S_BH:.1e} kB")
print(f"  old-aeon residual: delta rho/rho ~ O(1) (fully clumped into black holes)")

head("STAGE 1 -- THE FLASH (trigger) ==========================================")
M_end_kg=1.5e-3                                        # ~1.5 g endpoint
T_flash=MPl**2/(8*math.pi*7e4*MPl)                     # endpoint Hawking T
E_burst=M_end_kg*c**2
print(f"  survivor evaporates to endpoint ~1.5 g: T_flash=MPl^2/(8 pi M_end)={T_flash:.1e} GeV")
print(f"    burst energy E=M_end c^2={E_burst:.1e} J  (seeds one inflating patch)")

head("STAGE 2 -- NUCLEATION / RELIGHTING ======================================")
for d in (0.5,0.3):
    B=27*math.pi**2/(2*d**3)
    print(f"  CDL bounce (tilt {d}): B=27 pi^2 sigma^4/(2 dV^3)={B:.0f} -> Gamma=A e^-B >0 (strictly)")
print(f"  flash-catalysed (Gregory-Moss-Withers): B_seed<B_vac (not computed) -> fires per interlude")
print(f"  interior: O(4)->O(3,1) instanton, open FRW (Omega_k<0), homogeneous  [P>0 = OPEN]")

head("STAGE 3 -- HOT START (energy half) ======================================")
N=2/(1-ns_obs)                                         # e-folds fixed by n_s
alpha=1.0                                              # ghost -> minimal completion (R^2)
r=12*alpha/N**2                                        # PREDICTED (Starobinsky value)
eps=r/16
V=24*math.pi**2*eps*As_obs*Mp**4                       # fixed by A_s
V14=V**0.25
Treh=(30*V/(math.pi**2*200))**0.25
print(f"  wiring: omega=conformal factor -> alpha-attractor inflaton; V=V0(1-e^-sqrt(2/3a) phi/Mp)^2")
print(f"  INPUT n_s={ns_obs} -> N=2/(1-n_s)={N:.0f};  alpha={alpha:.0f} (minimal completion)")
print(f"  INPUT A_s={As_obs:.1e} -> V=24 pi^2 eps A_s Mp^4 -> V^1/4={V14:.2e} GeV")
print(f"  reheating (free lunch, Guth): T_reh=(30V/pi^2 g*)^1/4={Treh:.2e} GeV")

head("STAGE 4 -- CMB (observables) ============================================")
print(f"  n_s = 1-2/N = {1-2/N:.4f}       [= input, identity]")
print(f"  r   = 12 alpha/N^2 = {r:.4f}   [PREDICTED at alpha=1 = Starobinsky; fit alpha=2.44 -> 0.009]")
print(f"  A_s = V/(24 pi^2 eps Mp^4) = {V/(24*math.pi**2*eps*Mp**4):.2e}  [= input, identity]")
print(f"  dT/T = sqrt(A_s) = {As_obs**0.5:.1e}")

head("STAGE 5 -- SMOOTH HALF (dilution) =======================================")
resid=math.exp(-2*N)
print(f"  old residual diluted: delta_new = delta_old x e^-2N = {resid:.1e} per point (44 orders below 1e-5)")
print(f"  spread e^-5N ~ 1e-124 -> de Sitter floor 1e-122  [SOFT: exponent 5 un-derived]")

head("STAGE 6 -- THERMAL BRIDGE ===============================================")
T_cmb_K=2.72548; T_cmb_GeV=kB*T_cmb_K/GeV_J   # kB*T in J, /( J/GeV ) -> GeV
N_post=math.log((Treh/T_cmb_GeV)*(106.75/3.909)**(1/3))
print(f"  T_reh={Treh:.1e} GeV -> T_CMB={T_cmb_K} K over ~{N_post:.0f} post-reheat e-folds (T ~ 1/a)")
print(f"    2.725 K is MEASURED (boundary condition), NOT derived")

head("STAGE 7 -- ENTROPY (closing the budget) =================================")
s=(2*math.pi**2/45)*3.909*(kB*T_cmb_K/(hbar*c))**3
R=46.5*9.461e24; S_rad=s*(4/3)*math.pi*R**3
H0=2.20e-18; S_hor=(4*math.pi*(c/H0)**2)/(4*(hbar*G/c**3))
print(f"  radiation: S=s(T) V_obs={S_rad:.1e} kB (CMB piece)")
print(f"  horizon:   S=A/4G={S_hor:.1e} kB (dominant term; the ceiling)  [split: matter-only vs horizon-incl]")
print(f"  Frautschi gap S_max - S = fresh negentropy budget for the next aeon")

head("STAGE 8 -- BACK TO COLD (loop closes) ===================================")
print(f"  structure forms -> black holes -> merge -> new survivor; A-field thaws again V_min=0, H->0")
print(f"  -> returns to STAGE 0. The inverted exit matches the cold-clumpy start (back-calc).")
print(f"\n  OPEN joints (not closed by any equation above): P>0 nucleation (STAGE 2) = de Sitter")
print(f"  stability; V_min=0 (Weinberg wall); the wiring omega=inflaton [Hypo]. See PROOF_STATUS_LEDGER.md")
