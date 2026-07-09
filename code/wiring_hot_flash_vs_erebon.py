#!/usr/bin/env python3
"""Does the HOT external flash (at the crossover Omega->inf) EXCLUDE the erebon
(heavy static-mass) reading in favour of the plateau (inflating) reading?

The discriminator is a single frame-robust number: m_eff / H at the flash.
  * m_eff/H << 1  -> field is ULTRALIGHT vs the ambient Hubble -> frozen / slow-roll
                     = de Sitter-like = INFLATION -> the PLATEAU reading is realised.
  * m_eff/H >> 1  -> field oscillates as a massive particle (rho ~ a^-3), NO inflation
                     = the EREBON reading.
Physics (all owned): at the crossover Omega->inf, rest mass is SUPPRESSED
  m_eff = m0 / Omega   (Penrose's delayed/suppressed-rest-mass hypothesis, CCC).
The flash's own blueshift factor is Omega_flash ~ 1e26 (pair threshold) .. 1e47 (GUT
gluing) -- LMU's OWN numbers (V3.28 body, in=out ledger note). So we do not choose
'start on the plateau'; we ask what m_eff/H the crossover geometry FORCES.
Run to reproduce. NOT a proof -- a quantitative [Hypo->favoured] test.
"""
import numpy as np

MPl = 1.0                         # reduced Planck units
V0  = 1e-10                       # plateau height (V^1/4 ~ 8e15 GeV)/MPl^4
H_flash = np.sqrt(V0/3.0)        # Hubble at the hot start ~ sqrt(V0/3)

print("== the discriminator: m_eff/H at the flash (crossover Omega->inf) ==")
print(f"  H_flash = sqrt(V0/3) = {H_flash:.3e} MPl   (V0={V0:.0e})\n")
print(f"  {'m0 (bare)':>12} {'Omega_flash':>12} {'m_eff=m0/Om':>14} {'m_eff/H':>12}  reading")
verdicts=[]
for m0,tag in [(1.0,'Planck erebon'), (1e-3,'GUT ~1e16')]:
    for Om in (1e26, 1e35, 1e47):
        meff = m0/Om
        ratio = meff/H_flash
        reading = 'PLATEAU (light->inflate)' if ratio<1 else 'EREBON (heavy->oscillate)'
        verdicts.append(ratio)
        print(f"  {m0:12.0e} {Om:12.0e} {meff:14.2e} {ratio:12.2e}  {reading}")
print(f"\n  ALL m_eff/H = {min(verdicts):.0e} .. {max(verdicts):.0e}  << 1  -> field is ULTRALIGHT at the flash.\n")

# threshold: how small would Omega_flash have to be for the erebon (m_eff/H>=1) to win?
print("== how much would the crossover have to WEAKEN for the erebon reading to win? ==")
for m0 in (1.0, 1e-3):
    Om_crit = m0/H_flash          # m_eff/H=1
    print(f"  m0={m0:.0e}: need Omega_flash <= m0/H = {Om_crit:.2e} for the erebon (m_eff>=H).")
print(f"  But the crossover blueshift is Omega_flash ~ 1e26..1e47 -- {1e26/ (1.0/H_flash):.0e}x too large.")
print("  => the erebon (heavy, oscillating) reading is DYNAMICALLY LOCKED OUT at the flash:")
print("     a Planck/GUT mass is suppressed ~26-47 orders below the ambient H.\n")

# ---- confirm the physics: m/H controls FROZEN(vacuum,w=-1) vs OSCILLATING(matter,w=0) ----
# Amplitude-independent test: a scalar V=1/2 m^2 chi^2 in a FIXED de Sitter background H.
#   m/H << 1 -> Hubble-overdamped -> frozen -> w -> -1  (vacuum-like = inflating = PLATEAU-like)
#   m/H >> 1 -> underdamped -> coherent oscillation -> <w> -> 0 (matter = the EREBON)
# This is the standard frozen-vs-oscillating dichotomy and does NOT depend on the start amplitude.
def mean_w(m_over_H, H=1.0, chi0=1.0, n_efold=8):
    m = m_over_H*H
    chi, pi = chi0, 0.0
    dt = 0.02/max(H, m); T = n_efold/H; steps = int(T/dt)
    ws=[]; t=0.0
    for i in range(steps):
        V = 0.5*m*m*chi*chi; K = 0.5*pi*pi
        w = (K - V)/(K + V + 1e-300)
        dpi = -(3*H*pi + m*m*chi)*dt
        chi += pi*dt; pi += dpi; t += dt
        if t > 0.5*T: ws.append(w)      # average over the second half (settled)
    return float(np.mean(ws))

print("== confirm the dichotomy: m/H sets FROZEN(w=-1, vacuum/inflate) vs OSCILLATING(w=0, erebon) ==")
print("   (test scalar in a fixed de Sitter background; amplitude-independent)")
for r in (1e-2, 1e-1, 1.0, 3.0, 10.0, 100.0):
    w = mean_w(r)
    tag = 'FROZEN -> vacuum/inflate (PLATEAU-like)' if w<-0.5 else ('mixed' if w<-0.05 else 'OSCILLATING -> matter (EREBON)')
    print(f"  m/H = {r:7.0e}:  <w> = {w:+6.3f}   {tag}")
print("  -> at the flash m_eff/H ~ 1e-21..1e-45 sits DEEP in the frozen (w=-1) regime")
print("     = vacuum-like/inflating (plateau), the OPPOSITE of the erebon's w=0 matter.")

print("\n== reading (honest) ==")
print("  * At the crossover (Omega->inf) the field's rest mass is suppressed ~26-47 orders")
print("    below the ambient Hubble -> m_eff/H << 1 -> it is a LIGHT field -> it inflates on")
print("    the (anomaly-induced) flat direction = the PLATEAU reading.")
print("  * The EREBON reading (a Planck-mass field oscillating as matter, m_eff/H >> 1) would")
print("    require Omega_flash ~ O(1e5) or less -- i.e. essentially NO crossover blueshift. The")
print("    crossover is 1e26..1e47, so the erebon-at-the-flash is dynamically locked out.")
print("  * So the HOT flash favours plateau NOT by choosing it, but because the crossover")
print("    geometry (rest-mass suppression, Penrose) makes the field too light to be an erebon")
print("    AT the flash. The erebon can only re-appear LATER as Omega->1 and mass turns on --")
print("    i.e. as a SEPARATE late d.o.f. (exactly LMU's Omega=inflaton + DM-separate split).")
print("\n== honest residue (NOT a proof) ==")
print("  - [Hypo->favoured], not exclusion: shows the flash CANNOT deposit the field as an")
print("    erebon; it does not forbid an erebon existing later. That is fine -- it is the split.")
print("  - assumes rest-mass suppression m~m0/Omega (Penrose DRMH, owned) and H_flash~sqrt(V0/3).")
print("  - m/H is frame-schematic; exact conformal-frame bookkeeping is subtle, but the 26-47")
print("    order hierarchy is far too large for frame factors to overturn.")
