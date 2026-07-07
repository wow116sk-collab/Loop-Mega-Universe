#!/usr/bin/env python3
"""Clarify the 10^90 vs 10^122 confusion: they are DIFFERENT entropies, not
'ceiling vs what we actually get'. The full entropy budget of the observable
universe (Egan & Lineweaver 2010) has several components spanning 30+ orders.
Run to reproduce. Standard numbers; this is a bookkeeping clarification.
"""
import math
kB=1.380649e-23; hbar=1.054571817e-34; c=299792458.0; G=6.67430e-11
H0=2.20e-18

print("== The entropy budget of the observable universe (Egan-Lineweaver 2010) ==")
# radiation (what the seam 'entropy triangle' computes):
T=2.72548
s=(2*math.pi**2/45)*3.909*(kB*T/(hbar*c))**3
R=46.5*9.461e24
S_rad = s*(4/3)*math.pi*R**3
# de Sitter / cosmic event horizon:
R_H=c/H0; S_hor = (4*math.pi*R_H**2)/(4*(hbar*G/c**3))
budget = [
    ("CMB photons + neutrinos (RADIATION)", S_rad, "= the seam's 'entropy triangle' number"),
    ("stellar black holes",                 2e97,  "Egan-Lineweaver"),
    ("supermassive black holes",            1.2e103,"Egan-Lineweaver -- dominant MATTER term"),
    ("cosmic event horizon (de Sitter)",    S_hor, "Gibbons-Hawking -- dominant OVERALL term"),
]
print(f"   {'component':>38} {'S / kB':>10}   note")
for name,S,note in budget:
    print(f"   {name:>38} {S:>10.1e}   {note}")
print()
print(f"   -> the '10^90' is ONLY the radiation piece. The '10^122' is the HORIZON piece.")
print(f"      they differ by ~{math.log10(S_hor/S_rad):.0f} orders because they are DIFFERENT entropies,")
print(f"      not 'ceiling vs actual'. In between sits the black-hole entropy (~10^103).\n")

print("== So which is 'the total', and is it near the ceiling? (honest, interpretation-split) ==")
print(f"   TOTAL today, horizon INCLUDED : ~{S_hor:.0e} kB -- already ~= the ceiling 10^122,")
print(f"      because the cosmic-horizon term dominates (Egan-Lineweaver). Then the doc L1529")
print(f"      'arrow stalls near S~=S_max' is CORRECT under horizon-inclusive counting.")
print(f"   TOTAL today, MATTER only      : ~1e103 kB (SMBH-dominated), ~19 orders below 10^122.")
print(f"      Under matter-only counting the stall is 'fuel-limited', far below the ceiling.")
print(f"   -> WHICH is right depends on whether the horizon entropy counts as real thermodynamic")
print(f"      entropy -- itself a debated question. My earlier 'fuel-limited, 32 orders below'")
print(f"      used RADIATION-only (10^90); that understated it. Matter-only is ~10^103 (19 below);")
print(f"      horizon-included is ~10^122 (AT the ceiling). The honest statement is the SPLIT,")
print(f"      not a single verdict.\n")

print("== 'ของเรา' -- are these our universe's numbers? ==")
print(f"   YES, all of them are our observable universe (measured T, size, BH demographics,")
print(f"   Hubble horizon). 10^90 = our radiation entropy [Fact-th, standard]. 10^122 = our")
print(f"   horizon entropy [Fact-th, Gibbons-Hawking, never measured]. Neither is 'wrong' --")
print(f"   the seam just labelled the RADIATION sub-total as 'the entropy', which is imprecise.")
print(f"   The correct reading: 10^90 is one component; the TOTAL is horizon-dominated ~10^122.")
