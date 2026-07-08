"""Piece #2 -- the trigger->GUT-plateau coupling -- is NOT un-equationed. It is the
well-studied 'initial conditions for plateau inflation' problem, and for alpha-attractors
(our omega-inflaton) the plateau is a natural attractor. Computed + honest. Run to reproduce.

Borrowed answers (lit-checked):
  - alpha-attractor plateau is an infinitely long dS valley -> the field sits at large phi
    GENERICALLY; natural initial conditions (Carrasco-Kallosh-Linde 2015).
  - a radiation epoch coupling to the inflaton can LOCALIZE it on the plateau -> the flash's
    radiation is the thermal trigger (Bastero-Gil et al. 2016; thermal inflation).
  - graceful ENTRY to inflation in a quasicyclic universe via dissipation (Matsui et al. 2023)
    -- the LMU-matching structure (cyclic + plateau + bounce -> inflation).
"""
import math
Mp=1.0; alpha=1.0; ns=0.9649
N=2.0/(1.0-ns)

print("== The field naturally sits on the plateau (alpha-attractor) ==")
# E-model V=V0(1-e^{-sqrt(2/3a) phi})^2 ; field value N e-folds before end:
phi_N=math.sqrt(1.5*alpha)*math.log(4.0*N/(3.0*alpha))    # phi_N ~ sqrt(3a/2) ln(4N/3a)
phi_end=math.sqrt(1.5*alpha)*math.log(1.0+math.sqrt(2.0)) # roughly where slow-roll ends
print(f"  alpha={alpha:.0f}, N={N:.0f}: the inflaton sits at phi_N = {phi_N:.1f} Mp on the plateau,")
print(f"  rolls down to phi_end ~ {phi_end:.1f} Mp. The plateau (dS valley) extends to large phi,")
print(f"  so a field placed anywhere at large phi inflates -- NATURAL initial conditions")
print(f"  (Carrasco-Kallosh-Linde 2015; the valley is infinitely long and flat).")
print(f"  => the 'hilltop' the field needs is just 'large phi', which is generic, not tuned.\n")

print("== The flash's role: trigger, via the radiation localizing the field ==")
print("  a radiation epoch coupled to the inflaton can hold/localize it on the plateau, then")
print("  release it into slow-roll (Bastero-Gil et al. 2016). The survivor's flash IS the")
print("  radiation burst -- so 'the flash triggers the roll' has a literature mechanism, not")
print("  just an assertion. The flash need not lift the field (it is already at large phi); it")
print("  supplies the perturbation/thermal kick that starts the roll. Consistent with doc L824.\n")

print("== Where the field-on-plateau comes FROM in LMU (the wiring) ==")
print("  the field value is INHERITED from the prior aeon's endgame: omega = the CCC conformal")
print("  factor loaded by the prior aeon's dilute end (the seam's [Hypo] wiring). So 'the field")
print("  is on the plateau' reduces to the same single wiring hypothesis -- not a new open item.\n")

print("== HONEST verdict on piece #2 ==")
print("  I over-stated it as 'un-equationed'. It is the initial-conditions-for-plateau-inflation")
print("  problem, well-studied, and for alpha-attractors NATURAL (the plateau is an attractor).")
print("  RESOLVED by borrowing: Carrasco-Kallosh-Linde 2015 (natural IC) + Bastero-Gil 2016")
print("  (radiation/thermal trigger = the flash) + Matsui 2023 (graceful entry in a quasicyclic")
print("  universe -- the LMU structure). BUT: (a) all borrowed (reinforces hybrid); (b) the")
print("  LMU-specific step -- the field's plateau value inherited as the prior aeon's conformal")
print("  factor -- is the SAME [Hypo] wiring already flagged, not a separate gap.")
print("  => piece #2 collapses into the existing wiring; the only genuinely-open reset item")
print("     left is the '+3 spread' (piece #1), plus the field-wide de Sitter-stability question.")
