#!/usr/bin/env python3
"""Entropic time tau ~ integral dS vs ENERGY DENSITY rho across the aeon transition:
what TREND does each follow through the seam (dS tail -> evaporation -> flash ->
plateau/inflation -> reheating -> new aeon)?

Run to reproduce. All magnitudes are OWNED standard values:
  S_BH = A/4G (Bekenstein-Hawking); S_rad = 4/3 S_BH released by full evaporation
  (Zurek PRL 49,1683 (1982); Page PRL 50,1013 (1983): species-dependent ~1.5);
  M(t) = M0 (1 - t/t_ev)^(1/3) (Hawking mass-loss integration, standard);
  S_dS = pi/(G H^2) (Gibbons-Hawking 1977), ceiling ~2.6e122 (Egan-Lineweaver 2010);
  entropy budget shares (SMBHs ~3e104 dominate matter entropy today; photons ~1e89)
  from Egan-Lineweaver 2010 (arXiv:0909.3983); Clausius dS = dE/T.
The tau_aeon ~ integral dS WIRING is [Hypo] (ours); every equation is borrowed.
STATUS NOTE: tau depends on WHICH entropy ledger the clock integrates (matter vs
horizon) -- a concrete instance of the clock-choice caveat (Gielen-Menendez-Pidal).
"""
import numpy as np

MPl4 = 1.0                        # reduced Planck units for energy density
print("=" * 76)
print("(1) THE TWO TRACKS THROUGH ONE AEON  (schematic, owned magnitudes)")
print("=" * 76)
# phase table: (phase, energy density rho [M_Pl^4], dS ledger event, DeltaS magnitude)
# rho: plateau V0~1e-10; radiation falls a^-4; floor = measured Lambda 1e-120 (reduced)
rows = [
    # phase                        rho trend            main dS source                DeltaS
    ("flash -> plateau (onset)",   "jump to ~1e-10",    "flash deposit (fast)",       "~1e101 (prior aeon's S_rad=4/3 S_BH)"),
    ("inflation (~60-85 efolds)",  "flat ~1e-10",       "frozen field: ~none",        "~1e11-1e12 (tiny inf. horizon)"),
    ("reheating",                  "starts a^-4 fall",  "hot bath created",           "~1e89 (photon/nu bath, EL2010)"),
    ("radiation/matter era",       "falls ~110 orders", "adiabatic: dS~0; clumping",  "-> ~3e104 (SMBH formation, EL2010)"),
    ("DE / tiny-dS tail",          "flat at ~1e-120",   "horizon S_dS = pi/GH^2 up",  "-> ~2.6e122 asymptote (GH/EL2010)"),
    ("survivor evaporation end",   "flat at ~1e-120",   "S_BH -> 4/3 S_BH out",       "net +1/3 S_BH ~ +3e100"),
]
print(f"{'phase':<28} {'rho (energy) trend':<20} {'entropy source':<28} DeltaS")
for r in rows:
    print(f"{r[0]:<28} {r[1]:<20} {r[2]:<28} {r[3]}")
print("  NOTE (no double count): the first and last rows are the SAME transaction --")
print("  the prior survivor's evaporation output, seen from the two sides of the seam.")
print("  Per cycle it is booked ONCE: S_BH -> 4/3 S_BH out, net new = +1/3 S_BH.")

print("""
TREND VERDICT (the point):
  * ENERGY  rho(t)  = SAWTOOTH : falls monotonically ~110 orders inside the aeon
    (a^-4 -> a^-3 -> floor 1e-120), then ONE reset jump (+~110 orders) at the seam.
    It resets every cycle. It remembers nothing.
  * TIME    tau ~ int dS = STAIRCASE : rises monotonically, NEVER resets. Steps are
    where energy CHANGES HANDS; treads (flats) are where energy sits still:
       - inflation: rho at max, but dS~0  -> the clock nearly STALLS at max energy;
       - dS tail  : rho at min, dS>0 slow -> the clock CRAWLS at min energy;
       - flash    : rho jumps, dS surges  -> the LOUDEST tick is the seam itself.
  => tau tracks |energy FLOW|, not the energy LEVEL: dtau ~ dS = dE_transferred/T
     (Clausius). The seam = energy's reset AND time's biggest step, same event,
     opposite roles.  [Fact-th pieces; the aeon-clock ASSEMBLY is Hypo]""")

print("=" * 76)
print("(2) SEAM CLOSE-UP: evaporation rate diverges (integrably) INTO the flash")
print("=" * 76)
# M(x)=M0(1-x)^(1/3), x=t/t_ev;  S_BH ~ M^2;  net S produced ~ (1/3)(S_BH0 - S_BH(t))
# rate: dS/dt ~ (1/3)|dS_BH/dt| ~ M|Mdot| ~ 1/M ~ (1-x)^(-1/3)  -> diverges at x->1
S_BH0 = 1.05e101                   # survivor 1e12 Msun (verify_all convention)
print(f"  survivor S_BH0 = 1.05e101 ;  net dS_evap(total) = +1/3 S_BH0 = {S_BH0/3:.2e}")
print(f"  {'t/t_ev':>8} {'M/M0':>8} {'dS/dt (rel)':>12} {'% of net dS out':>16}")
for x in (0.0, 0.5, 0.9, 0.99, 0.999, 0.999999):
    M = (1.0 - x) ** (1.0 / 3.0)
    rate = 1.0 / M                              # relative units
    frac = 1.0 - M**2                           # fraction of (S_BH0-S_BH) released
    print(f"  {x:>8} {M:>8.4f} {rate:>12.1f} {100*frac:>15.2f}%")
print("""  -> the RATE dS/dt ~ (1-t/t_ev)^(-1/3) DIVERGES at completion (integrably):
     in lab time the clock's loudest tick sharpens into the flash; the energy
     density stays pinned at the 1e-120 floor the whole while, then jumps.
     Time surges FIRST (entropy out), energy resets AT the surge's endpoint.""")

print("=" * 76)
print("(3) CLAUSIUS WEIGHTING: cold transfers tick the clock harder per joule")
print("=" * 76)
# dS = dE/T: per unit energy moved, the tick ~ 1/T.
kB_K_per_MPl = None  # not needed: use ratios only
T_H_1e12Msun = 6.2e-8 / 1e12       # K  (T_H = 6.2e-8 K * Msun/M, standard)
T_reh        = 1e28                 # K  (~1e15 GeV high-scale reheating)
ratio = T_reh / T_H_1e12Msun
print(f"  T_Hawking(1e12 Msun survivor) ~ {T_H_1e12Msun:.1e} K   (coldest transfer in the cycle)")
print(f"  T_reheating (high-scale)      ~ {T_reh:.0e} K   (hottest transfer in the cycle)")
print(f"  per-joule tick ratio  (1/T_H)/(1/T_reh) = T_reh/T_H ~ 1e{np.log10(ratio):.0f}")
print("""  -> the SAME joule moved by evaporation ticks the entropic clock ~10^47-10^48
     times louder than moved by reheating. That is WHY the cold, slow, invisible
     evaporation phase dominates the aeon's matter-ledger tau, while the hot,
     violent reheating is (entropically) a modest step: the clock is a ledger of
     transactions weighted by 1/T, not a thermometer and not an energy meter.""")

print("=" * 76)
print("(4) WHICH LEDGER? (the honest fork -- concrete clock-choice caveat)")
print("=" * 76)
print("""  tau integrates dS -- but WHICH S?  Two defensible ledgers, different seams:
  * MATTER ledger (S_rad + S_BH + bath): staircase above; seam tick ~ +3e100 (net
    evaporation) after a ~3e104 clumping era; inflation ~ mute; total per aeon ~1e105.
  * +HORIZON ledger (add S_dS = pi/GH^2): the DE-tail crawl to ~2.6e122 DWARFS every
    matter step by ~18 orders -- tau becomes almost entirely 'horizon time', and the
    seam tick is a rounding error on the tail.
  The two ledgers ORDER events identically (both monotone) but weight epochs
  ~18 orders apart. Choosing the ledger IS choosing the clock: this is the
  Gielen-Menendez-Pidal clock-dependence caveat made concrete for tau_aeon.
  [The choice is part of the Hypo wiring; nothing owned forces either ledger.]""")

print("=" * 76)
print("(5) CONTRAST WITH BARONTINI'S ANALOGUE SEAM (owned quote-level fact)")
print("=" * 76)
print("""  Barontini (PRR 8, L022047 2026): 'no entropic time elapses between a big
  crunch and the subsequent big bang, because no entropy is exchanged there' --
  his analogue seam is SILENT (a tau-gap).
  LMU's seam is the OPPOSITE: the transition IS an entropy transaction
  (evaporation completion + flash deposit + reheating), so the aeon boundary is
  the clock's loudest neighborhood, not a gap. Both behaviors are the same rule
  -- tau ticks iff entropy flows -- applied to different seam physics.  [Hypo wiring]""")

print("\nSUMMARY: energy = sawtooth (level, resets at seam); entropic time = staircase")
print("(flow, never resets; steps at transactions, stalls at stasis); seam = energy's")
print("reset co-located with time's loudest tick; per-joule loudness ~ 1/T (Clausius).")
