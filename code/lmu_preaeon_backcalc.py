#!/usr/bin/env python3
"""[Hypo] Reverse ledger: take the EXIT numbers (the computed hot-start of a new
aeon) and run them BACKWARD to see what the pre-aeon state must have contained.

Exit numbers are from code/aeon_seam_construction.py (robust unless flagged soft):
  V^1/4 ~ 1e16 GeV, T_reh ~ 3.5e15 GeV, N ~ 57 e-folds, residual e^-2N ~ 1e-49,
  S_local ~ 1e90 (entropy triangle), CMB (A_s,n_s,r).

For each exit number we state what MUST have been present before ignition, and
separate what is genuinely back-outable from what stays a free pre-aeon input
(carried from the previous aeon). Every value recomputed from constants; run to
reproduce. Absolute energies are SOFT (time-picture doc §7 auditor flag) -- ratios
and scales are the robust content.
"""
import math
Mp   = 2.435e18          # reduced Planck mass, GeV
Msun = 1.989e30          # kg
c    = 299792458.0
G    = 6.67430e-11
hbar = 1.054571817e-34
kB   = 1.380649e-23
GeV_J= 1.602176634e-10
yr   = 3.156e7
r_obs, ns_obs, As_obs = 0.009, 0.9649, 2.1e-9

print("== [1] INHOMOGENEITY backward: exit residual 1e-49 <- O(1) clumpy pre-aeon ==")
N = 57
resid = math.exp(-2*N)
print(f"   exit per-point residual e^-2N (N={N}) = {resid:.1e}")
print(f"   backward: pre-inflation amplitude = residual x e^+2N = {resid*math.exp(2*N):.1f} = O(1)")
print(f"   -> the pre-aeon end was MAXIMALLY clumpy: delta rho/rho ~ 1, everything collapsed")
print(f"      into black holes (the cold-clumpy end). Inflation multiplies by e^-2N=1e-49.\n")

print("== [2] INFLATON state backward: V^1/4=1e16 GeV, N=57 <- parked on the plateau ==")
V   = 1.5*math.pi**2*r_obs*As_obs*Mp**4
V14 = V**0.25
alpha = r_obs*N**2/12
print(f"   exit r={r_obs} -> V^1/4 = {V14:.2e} GeV ; alpha-attractor alpha = {alpha:.2f}")
print(f"   backward: the pre-aeon must hold the omega-inflaton PARKED on its plateau at")
print(f"      V ~ ({V14:.1e} GeV)^4, field range Delta phi ~ few M_p (alpha-attractor), ready to roll.")
print(f"   -> NOT a stored hot bath -- a cold field on a high plateau (potential, not kinetic).\n")

print("== [3] SEED energy backward: the hot patch is GROWN, not pre-stored (free lunch) ==")
H_inf = math.sqrt(V/3.0)/Mp                       # GeV
R_H   = 1.0/H_inf                                  # GeV^-1
E_seed_GeV = V*(4*math.pi/3.0)*R_H**3              # energy in one initial Hubble patch
E_seed_J   = E_seed_GeV*GeV_J
print(f"   H_inf = {H_inf:.2e} GeV ; initial Hubble patch energy E_seed ~ {E_seed_J:.1e} J")
print(f"   backward: to START the aeon you need only ONE inflating Hubble patch ~ {E_seed_J:.0e} J,")
print(f"      NOT the full hot patch (E_hot ~ 1e71-1e80 J, soft). Inflation's free lunch")
print(f"      (E=rho V at no net GR cost, Guth 1981) grows the seed to the hot aeon.")
print(f"   -> pre-aeon needs a SMALL trigger + a plateau, not a large energy reservoir.\n")

print("== [4] SURVIVOR backward: the trigger, its mass, its two 'flash' energies ==")
# interlude ~ tau_evap sets the survivor mass (Hawking clock)
tau = 1e100                                        # yr, loop interlude ~ evaporation time
M_sol = (tau/2.1e67)**(1.0/3.0)                    # tau_evap = 2.1e67 (M/Msun)^3 yr
M_kg  = M_sol*Msun
Mc2   = M_kg*c**2                                  # total rest energy
MPl   = 1.22e19                                    # non-reduced Planck mass, GeV
Mend_kg = 1.5e-3                                   # ~1.5 g endpoint (7e4 Planck masses)
E_burst = Mend_kg*c**2
T_flash = (MPl**2/(8*math.pi*(7e4*MPl)))           # GeV, endpoint temperature
print(f"   from interlude ~{tau:.0e} yr: survivor mass M ~ {M_sol:.1e} Msun (Gumbel band 1e10-1e11)")
print(f"   total evaporation energy  Mc^2 = {Mc2:.1e} J  (~ doc E_flash ~3e60 J, the ratio-Omega numerator's denom)")
print(f"   final burst (last ~1.5 g)      = {E_burst:.1e} J at T_flash ~ {T_flash:.1e} GeV  (the TRIGGER)")
print(f"   -> note E_seed ~ {E_seed_J:.0e} J  ~  final burst {E_burst:.0e} J : the burst can seed one patch.")
print(f"      TWO distinct 'flash' energies: total Mc^2 (~1e58-60 J, diluted into L0 over 1e100 yr)")
print(f"      vs the final Planckian burst (~1e14 J, the high-T nucleation trigger).\n")

print("== [5] ENTROPY backward: survivor carries 1e97-1e99, new aeon mints fresh 1e90 ==")
for Ms in (1e10, 1e11):
    Mk = Ms*Msun
    S_BH = 4*math.pi*G*Mk**2/(hbar*c)              # in units of kB
    print(f"   M={Ms:.0e} Msun -> S_BH = {S_BH:.1e} kB ; S_rad=4/3 S_BH = {4/3*S_BH:.1e} kB")
print(f"   exit local radiation entropy (entropy triangle) S_local ~ 1e90 kB")
print(f"   backward: the survivor's ~1e97-1e99 kB is RELEASED as Hawking radiation, DILUTED into")
print(f"      the infinite L0 (density drops ~7-9 orders), and the new aeon MINTS a fresh 1e90")
print(f"      locally at reheating. The old entropy is not inherited as usable local S -- it")
print(f"      adds to the ever-growing GLOBAL total (the fuel-limited / total->inf picture).\n")

print("== [6] TEMPERATURE backward: reheat needs 3.5e15 GeV; the burst reaches only ~7e12 GeV ==")
Treh = (30*V/(math.pi**2*200))**0.25
print(f"   exit T_reh = {Treh:.1e} GeV ; trigger burst T_flash ~ {T_flash:.1e} GeV -> ~{Treh/T_flash:.0e}x short")
print(f"   -> the flash TRIGGERS but does not itself supply the hot-start temperature; the free")
print(f"      lunch / conformal factor bridges the ~500x gap (the 'flash is too cold' wall, redteam).\n")

print("== [7] PRE-AEON SHOPPING LIST (what must have been there, back-calculated) ==")
print("   robust from exit numbers:")
print("     - O(1) inhomogeneity (fully clumped, matter in black holes)")
print(f"     - omega-inflaton parked on an alpha-attractor plateau at V^1/4 ~ {V14:.0e} GeV")
print("     - a low-entropy field configuration (potential-dominated, cold, not a hot bath)")
print(f"     - one inflating seed patch ~ {E_seed_J:.0e} J (free lunch grows it; NO 1e80 J reservoir)")
print("     - a trigger: the survivor's final Planckian burst (high-T flash)")
print("   free pre-aeon inputs (carried, exit does not fix):")
print(f"     - survivor mass ~1e10-1e11 Msun (Gumbel from the previous aeon's merger tree)")
print("     - the dilute cold L0 background (A~0, H->0, asymptotic Minkowski)")
print("   entropy bookkeeping:")
print("     - survivor S_BH ~1e97-1e99 kB -> diluted into infinite L0 -> new local S minted fresh ~1e90")
print("\n   SOFT (do not lean on absolutes): E_hot, E_flash absolute normalization (doc §7 auditor).")
print("   The robust backward content is: O(1) clumpiness, the 1e16 GeV plateau, N~57, and the")
print("   1e99->1e90 entropy dilution. The pre-aeon is a COLD, CLUMPY, LOW-LOCAL-ENTROPY seed +")
print("   a trigger -- exactly the cold-clumpy end the forward seam starts from. The loop closes.")
