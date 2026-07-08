#!/usr/bin/env python3
"""Adversarial stress-test of ATTACK #2: swampland de Sitter conjecture vs LMU relighting.
[Hypo] throughout -- the whole attack is conditional on the (contested) de Sitter
swampland conjecture. Every number below is recomputed from scratch; run to reproduce.

Sections mirror the investigation:
  [1] DE side satisfies the dS conjecture (fixes the O(1) bridge constant c)
  [2] structural arm: the CDL false-vacuum MINIMUM violates both arms (sign-flip / bridge)
  [3] TCC lifetime arm and its V->0 DEFUSAL
  [4] Hawking-Moss keeps Gamma>0  (P != 0 suffices over unbounded L0)
  [5] the flash-trigger wall for the swampland-ALLOWED hilltop (too cold / no barrier)
  [6] the F4 plateau also violates swampland -> unification: swampland-vs-inflation
Verdict: not a kill. Reduces to the framework's own open Problem A + the generic
swampland-vs-inflation tension; via B-alt (the conformal flip) LMU's exposure equals
standard slow-roll inflation's, no more.
"""
import math

Mp   = 2.435e18          # reduced Planck mass, GeV
MPl  = 1.22e19           # non-reduced Planck mass, GeV (for Hawking T)
v    = 1e16              # GUT / ignition scale (F4: r~0.009 <-> V^1/4 ~ 1e16 GeV)
lam  = 1.0               # doc: V=(lam/4)(phi^2-v^2)^2, lam~1
GeV_s= 6.582119569e-25   # 1 GeV^-1 in seconds
yr   = 3.156e7           # s

print("== [1] DE side: fixes the O(1) bridge constant ==")
Ai  = 2.70               # A_i in units of Mp (doc L382)
c   = 2.0/Ai             # Mp|grad V|/V for V=1/2 m^2 A^2  == the dS gradient bound value
eps = 0.5*c**2
w0  = -1 + (2/3)*eps
print(f"  c = 2Mp/A_i = {c:.3f} (~O(1)); eps={eps:.3f} (doc 0.27); w0={w0:+.3f} (doc -0.82)")
print(f"  -> thawing DE SATISFIES arm A. Swampland favours it.\n")

print("== [2] structural arm: the CDL false-vacuum MINIMUM (sign-flip / bridge) ==")
Vtop = (lam/4)*v**4
r_top = Mp**2*(lam*(3*0.0**2 - v**2))/Vtop          # phi=0 tachyonic top
print(f"  swampland needs curvature <= -{c:.2f} (tachyonic, sign -)")
print(f"  CDL needs a metastable MINIMUM (curvature +, sign +)  -> OVER-DETERMINED, opposite signs")
for delta in (0.30, 0.01):
    r_min = Mp**2*(2*lam*v**2)/(delta*Vtop)          # phi=+/-v false minimum, raised by tilt
    print(f"    false-min (tilt {delta}): Mp^2 V''/V = +{r_min:.2e}  -> both arms VIOLATED (CDL-able, forbidden)")
print(f"    sym-top phi=0          : Mp^2 V''/V = {r_top:.2e}  -> arm B satisfied, but a MAX (Hawking-Moss, not CDL)\n")

print("== [3] TCC lifetime arm and its V->0 defusal ==")
for label, V in [("GUT false vacuum (persistent)", (1e16)**4), ("V->0 endgame (doc Fork Y)", 0.0)]:
    if V > 0:
        H = math.sqrt(V/3)/Mp
        tau = math.log(Mp/H)/H*GeV_s
        print(f"  {label}: tau_max~{tau:.1e}s vs need 1e100yr={1e100*yr:.0e}s -> "
              f"{math.log10(1e100*yr/tau):.0f} orders too long -> TCC BITES")
    else:
        print(f"  {label}: H->0, not a dS phase -> TCC has nothing to bound -> ARM DEFUSED")
print()

print("== [4] Hawking-Moss keeps Gamma>0 (P != 0 suffices over unbounded L0) ==")
for delta in (0.30, 0.01):
    dS = 24*math.pi**2*Mp**4*(1/(delta*Vtop) - 1/Vtop)
    print(f"  tilt {delta}: HM exponent |dS|={dS:.2e} -> Gamma~exp(-{dS:.1e}) : tiny but STRICTLY > 0")
print("  over unbounded L0, any Gamma>0 -> ignition happens. P=0 needs a SEPARATE (non-swampland) argument.\n")

print("== [5] flash-trigger wall for the swampland-ALLOWED hilltop ==")
Mend = 7e4*MPl                                        # 1.5 g endpoint = 7e4 Planck masses
T_flash = MPl**2/(8*math.pi*Mend)
print(f"  T_flash = {T_flash:.2e} GeV vs hilltop scale v={v:.0e} GeV -> ~{v/T_flash:.0e}x too cold")
print(f"  and a hilltop has no barrier -> Gregory-Moss-Withers gravitational catalysis has nothing to grab")
print(f"  -> the allowed hilltop ignites on its own but the flash has no clear finger to press it\n")

print("== [6] the F4 plateau also violates swampland -> unification ==")
r, ns = 0.009, 0.9649
eps_i = r/16.0
gradV = math.sqrt(2*eps_i)
eta   = (ns - 1 + 6*eps_i)/2.0
print(f"  plateau for F4 (r={r}, n_s={ns}): eps={eps_i:.2e}, eta={eta:+.4f}")
print(f"  arm A: |grad V|/V={gradV:.3f} < c={c}  -> VIOLATED ({c/gradV:.0f}x)")
print(f"  arm B: eta={eta:+.4f} not <= -{c:.2f} -> VIOLATED (|eta| {c/abs(eta):.0f}x too small)")
print("  => minimum OR plateau: swampland forbids EVERY flat/trapped V>0 region a bang needs.")
print("     This is the textbook swampland-vs-inflation tension; it hits ALL slow-roll inflation.")
print("     Via B-alt (the conformal flip) LMU keeps only the plateau -> exposure = standard inflation's.")
