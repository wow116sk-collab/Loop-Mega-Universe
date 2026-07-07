#!/usr/bin/env python3
"""The user's argument: the tiny values we measure are UNIFORM across the whole
observable universe; if the vacuum decayed catastrophically it would have decayed
long ago -- so the uniformity is evidence, not a problem. Quantified. Run to reproduce.
Standard metastable-vacuum reasoning (Coleman-De Luccia; Guth-Weinberg); the survivor
clock is Hawking/Page. Nothing new.
"""
import math
t0 = 1.4e10             # yr, age of the universe
tau_relight = 1e100     # yr, survivor evaporation = the endpoint relighting time

print("== We are at the very START of our aeon (why the universe looks uniform) ==")
frac = t0/tau_relight
print(f"  age t0 = {t0:.1e} yr ; relighting (survivor evaporation) tau ~ {tau_relight:.0e} yr")
print(f"  fraction elapsed t0/tau = {frac:.0e}  -> we sit at ~10^{math.log10(frac):.0f} of the way to the endpoint")
print(f"  the uniform tiny values (Lambda, T_CMB) are the STILL-INTACT metastable state:")
print(f"  no endpoint decay could have happened yet -- we are 10^90 times too early.\n")

print("== The uniformity RULES OUT fast decay, and is CONSISTENT with LMU's slow relight ==")
print("  metastability bound: for NO bubble to have hit our past light cone, the vacuum")
print("  lifetime must exceed ~ our exposure, i.e. Gamma^-1 >> t0 ~ 1e10 yr.")
print(f"  LMU relighting lifetime ~ {tau_relight:.0e} yr  >>  1e10 yr  by ~10^{math.log10(tau_relight/t0):.0f}")
print("  -> a vacuum that relights at ~1e100 yr looks PERFECTLY uniform now. The user is right:")
print("     'if it decayed it decayed long ago' -- and since the decay is at the endpoint, we")
print("     are far too early to see it; the uniformity is EXPECTED, not a puzzle.\n")

print("== The honest limit: uniformity does NOT decide Gamma>0 vs Gamma=0 ==")
print("  a uniform universe is consistent with BOTH:")
print("    - LMU: Gamma>0 but slow (relight at 1e100 yr) -> uniform now because too early;")
print("    - stable de Sitter: Gamma=0 (never decays)   -> uniform forever.")
print("  the observation cannot separate them -- both look identical today. So:")
print("    RULED OUT by uniformity: fast/catastrophic decay (would have hit us).  [good for LMU]")
print("    NOT decided by uniformity: whether the tiny de Sitter EVER decays (Gamma>0 vs 0).")
print("  => the data does not DISFAVOUR LMU (it is fully consistent, even expected); it just")
print("     cannot CONFIRM the relighting either. Joint #1 stays [open], but LMU is not hurt by")
print("     the uniformity -- the uniformity is exactly what LMU's timeline predicts.\n")

print("== Net (the user's point, scored) ==")
print("  CORRECT: the leftover tiny values are components of our aeon's metastable state; the")
print("    relevant 'decay' is the endpoint relighting (~1e100 yr), not a spontaneous decay now;")
print("    and the observed uniformity confirms no premature decay -- exactly as expected if we")
print("    sit at 10^-90 of the way to the endpoint. LMU is consistent with, even explains, the")
print("    uniformity. The persistent-de-Sitter worry is bounded (persistence ends at the flash).")
print("  UNCHANGED: whether the endpoint flash actually relights (Gamma>0 for the catalysed")
print("    nucleation, B_seed uncomputed) -- present uniformity cannot reach that. [open]")
