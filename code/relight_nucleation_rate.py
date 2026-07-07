#!/usr/bin/env python3
"""[Hypo] P>0? Compute the relighting nucleation rate from the cold end -- concretely.
Two channels (CDL tunnelling, Hawking-Moss climb), the waiting time, and the
conversion 'tiny rate + infinite L0 -> certain ignition'. Run to reproduce.
Standard vacuum-decay physics (Coleman-De Luccia 1980; Hawking-Moss 1982; Guth-
Weinberg 1983; catalysis Gregory-Moss-Withers 2014). Everything is CONDITIONAL on a
metastable Phi_gen false vacuum existing (swampland-contested) -- see the caveat.
"""
import math
Mp   = 2.435e18          # reduced Planck mass, GeV
v    = 1e16              # GUT / ignition scale
Vtop = 0.25*v**4         # barrier height ~ (lambda/4) v^4, lambda~1
GeV_s= 6.582119569e-25   # s per GeV^-1
yr   = 3.156e7
tPl_s= 5.39e-44          # Planck time, s

print("== [1] CDL tunnelling: bounce action B and rate Gamma = A exp(-B) ==")
print("   thin-wall B = 27 pi^2 sigma^4 / (2 (Delta V)^3), sigma~v^3, Delta V = delta * v^4")
print(f"   {'tilt delta':>11} {'B_CDL':>12} {'Gamma/vol ~ exp(-B)':>22}")
for delta in (0.5, 0.3, 0.1, 0.03):
    B = 27*math.pi**2/(2*delta**3)                 # sigma=v^3, eps=delta v^4 -> v^12/v^12 cancels
    print(f"   {delta:>11.2f} {B:>12.0f} {'exp(-%.0f)'%B:>22}")
print("   -> B_CDL ~ 1e2-1e6 (tilt-dependent). Strictly finite => Gamma strictly > 0.")
print("      gravity correction ~ (V/Mp^4) = %.0e (negligible at GUT scale).\n" % (Vtop/Mp**4))

print("== [2] Hawking-Moss climb (needs a de Sitter phase, H>0): exponent ~ M_p^4/V ==")
for delta in (0.3, 0.01):
    B_HM = 24*math.pi**2*Mp**4*(1/(delta*Vtop) - 1/Vtop)
    print(f"   tilt {delta}: B_HM = 24 pi^2 Mp^4 (1/(d Vtop) - 1/Vtop) = {B_HM:.1e} -> Gamma~exp(-{B_HM:.0e})")
print("   -> B_HM ~ 1e12: FAR more suppressed than CDL (climbing loses to tunnelling), but still > 0.")
print("      NOTE: HM needs a de Sitter temperature T=H/2pi. At the H->0 Minkowski endgame HM->0;")
print("      it operates only in the transient de Sitter (current acceleration) phase.\n")

print("== [3] Waiting time for one nucleation in ONE horizon (rate is astronomically slow) ==")
for label, B in [("CDL, delta=0.3", 27*math.pi**2/(2*0.3**3)), ("Hawking-Moss", 8e11)]:
    # one nucleation per ~exp(B) horizon-4-volumes; time ~ exp(B) Planck times (order of magnitude)
    log10_t_yr = B/math.log(10) + math.log10(tPl_s/yr)
    print(f"   {label:>16}: B={B:.0e} -> waiting time ~ 10^{log10_t_yr:.0f} yr (finite, but astronomical)")
print("   (for scale: the aeon interlude is ~1e100 yr; a survivor-flash CATALYSED rate is needed")
print("    to fire within one interlude -- see [5]. Spontaneous CDL/HM alone is far too slow.)\n")

print("== [4] The conversion: any Gamma>0 over an INFINITE L0 -> ignition is CERTAIN ==")
print("   expected nucleations  N = Gamma x V_4 (4-volume).  Over infinite L0, V_4 -> infinity,")
print("   so for ANY finite B (Gamma = e^-B > 0):  N -> infinity  and  P(>=1) = 1 - e^-N -> 1.")
print("   this is the framework's actual claim: not that the rate is large (it is tiny), but that")
print("   P>0 x infinite reservoir = certain. (Guth-Weinberg 1983 percolation; fork-5 infinite L0.)\n")

print("== [5] Flash catalysis lowers the barrier (why it fires within an interlude) ==")
print("   the survivor's terminal Hawking flash seeds nucleation at the black hole (Gregory-Moss-")
print("   Withers 2014): the seed reduces the bounce action B_seed < B_vacuum, often by a large")
print("   factor, so the CATALYSED rate near the flash is exponentially higher than spontaneous.")
print("   LMU's trigger is this catalysed channel, not spontaneous decay -- which is how a")
print("   tiny-Gamma process becomes a per-interlude event. (Order-of-magnitude only; B_seed is")
print("   model-dependent and NOT computed here -- flagged.)\n")

print("== CAVEAT / honest scope ==")
print("   ALL of the above assumes a metastable Phi_gen false vacuum EXISTS to decay from.")
print("   That is exactly what the swampland dS conjecture contests (attack #2). If the false")
print("   vacuum does not exist / de Sitter is ABSOLUTELY stable, then Gamma = 0 EXACTLY, and")
print("   infinity x 0 = 0 -- the infinite reservoir cannot rescue it (merged-doc s8).")
print("   So this computes: IF a barrier exists, P>0 strictly (CDL/HM give Gamma>0) and infinite")
print("   L0 makes ignition certain. It does NOT prove the barrier exists. P=0 (the loop-killer)")
print("   needs a separate absolute-stability argument; P>0 is the generic case. de Sitter")
print("   stability = precisely the question of whether Gamma>0 or Gamma=0 here.")
