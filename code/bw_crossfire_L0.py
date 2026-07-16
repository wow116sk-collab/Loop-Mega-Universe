#!/usr/bin/env python3
"""Breit-Wheeler crossfire in L0: if the aeon "sends" the STAR/RHIC condition
(photons crossing -> e+e- pairs) into the substrate, does matter get created?

Answer computed here: NO in bulk L0 (four independent gates kill it, starting
with the premise itself); at the terminal flash matter IS created -- but
dominantly by DIRECT Hawking emission of e+e- (same threshold mass), with BW
photon-photon conversion a ~1e-5 sideshow even there; and NOTHING of either
survives into the new aeon's census (inflationary dilution e^-4N). Which is
exactly why the aeon-filler must be a w=-1 FIELD (rho ~ a^0, dilution-proof),
not radiation crossfire (rho ~ a^-4). The mechanism itself is fine: gamma-gamma
<-> e+e- runs at full blast in the new aeon's own hot plasma after reheating --
it fails only in the dilute substrate, not in principle.

Owned ingredients (mechanism = owner's; ours = only the wiring onto L0):
  * Breit & Wheeler, PR 46, 1087 (1934): gamma gamma -> e+e-; threshold
    s = 2 E1 E2 (1-cos th) >= 4 (m_e c^2)^2 (head-on equal-E: E >= 0.511 MeV
    each); their own remark: hopeless with lab beams, feasible via the fields
    of fast charged nuclei passing one another -- i.e. STAR's recipe, 1934.
  * Weizsacker (1934)/Williams (1935) equivalent photons; STAR collab.,
    PRL 127, 052302 (2021), arXiv:1910.12400 (6085 pairs, quasi-real caveat:
    Brandenburg-Seger-Xu-Zha, Rep. Prog. Phys. 2023, arXiv:2208.14943).
  * Cosmic gamma-gamma opacity: Nikishov, Sov. Phys. JETP 14, 393 (1961/62);
    Gould & Schreder, PRL 16, 252 (1966) + PR 155, 1404 & 1408 (1967) [the
    tau_gg formalism used below]; measured TeV/EBL horizon: Fermi-LAT,
    Science 338, 1190 (2012); H.E.S.S., Nature 440, 1018 (2006).
  * Hawking 1974/75; Page, PRD 13, 198 (1976) [photon spectral peak ~5.7 kT];
    MacGibbon & Webber, PRD 41, 3052 (1990) [fragmentation above Lambda_QCD];
    Gibbons & Hawking, PRD 15, 2738 (1977) [T_dS bath = detector response];
    Gibbons, CMP 44, 245 (1975) [charged BHs Schwinger-discharge].
  * Photosphere episode (endpoint self-interaction): Heckler PRD 55, 480 +
    PRL 78, 3430 (1997) claim (bremsstrahlung/e-gamma pair prod., NOT BW);
    Daghigh & Kapusta PRD 65, 064028 (2002); rebuttal MacGibbon-Carr-Page
    PRD 78, 064043 (2008) (causality + formation length ~E/m_e^2); consensus
    since = NO photosphere (Auffinger review, PPNP 131, 104040 (2023)).
  * Matter creation vs dS dilution: Mottola PRD 31, 754 (1985) [exp(-#m/H)];
    Kobayashi & Afshordi JHEP 10 (2014) 166 + Frob et al. JCAP 04 (2014) 009
    [dS Schwinger: stationary, dilution-balanced]; Adams & Laughlin RMP 69,
    337 (1997) [deep-future census: Dark Era = annihilation, not creation].
  * Historical echo: Hoyle MNRAS 108, 372 (1948) C-field; Hoyle & Narlikar
    PRSA 273, 1 (1963); QSSC cyclic (Narlikar et al., JAA 28, 67 (2007)) --
    every cyclic prior art mints cycle-start matter from a FIELD; Penrose CCC
    (2010) = nearest neighbor: old-aeon light crosses, matter via conformal
    rescaling, never BW; Tolman 1934 adjacent.

STATUS: assembly [Fact-th|cond on repo conventions]; magnitudes order-of-level
(greybody/species prefactors bracketed inline); no new mechanism claimed; no
falsifier moved. Conventions match sibling scripts: H_inf = 1.83e-18 s^-1,
survivor band 1e10-1e12 Msun, N_min(instant) = 63. Red-team + lit verified
2026-07-16 (2 advisers + 3 lit agents + batch verifier).
"""
import numpy as np

# ---------------- constants (SI) ----------------
G, hbar, c, kB = 6.674e-11, 1.055e-34, 2.998e8, 1.381e-23
Msun, yr, Gyr = 1.989e30, 3.156e7, 3.156e16
me = 9.109e-31
mec2 = me * c**2                      # 8.187e-14 J = 0.511 MeV
eV, GeV = 1.602e-19, 1.602e-10
sigT = 6.652e-29                      # Thomson cross-section, m^2
sig_bw_peak = 1.7e-29                 # BW peak = 0.256 sigma_T at sqrt(s)=1.40x threshold (script-verified)
H = 1.83e-18                          # s^-1 (repo spine)
T_dS = hbar * H / (2 * np.pi * kB)    # Gibbons-Hawking bath
M0 = 1e12 * Msun                      # survivor anchor (repo)
E_Pl = np.sqrt(hbar * c**5 / G)

def T_H(M):   return hbar * c**3 / (8 * np.pi * G * M * kB)
def t_ev(M):  return 5120 * np.pi * G**2 * M**3 / (hbar * c**4)  # photon-sector
def L_H(M):   return hbar * c**6 / (15360 * np.pi * G**2 * M**2)

print("=" * 78)
print("THE CONDITION: BW needs s = 2 E1 E2 (1-cos th) >= 4 (m_e c^2)^2")
print("               head-on, equal energies -> E >= m_e c^2 = 0.511 MeV each")
print("               (isotropic-average angles raise this only by ~sqrt(2))")
print("=" * 78)

# ---------------- GATE 0: the premise itself ----------------
print("\nGATE 0 -- STAR's condition is not 'free photons crossing'")
print("  the RHIC photon clouds are Weizsacker-Williams quanta CARRIED by Z=79")
print("  nuclei boosted to ~99.995% c. L0 has no counterpart of either half:")
print("  no free charges (charged survivors Schwinger-discharge, Gibbons 1975),")
print("  no boosts (peculiar velocities decay ~1/a; dS motion = recession),")
print("  no bound structures at all (Adams-Laughlin Dark Era census).")
print("  -> 'things flying past each other rapidly in all directions' is not")
print("     merely dilute in L0 -- as a steady state it is kinematically gone.")

# ---------------- GATE 1: energy ----------------
print("\nGATE 1 -- energy: what photons does bulk L0 actually hold?")
E_bath = kB * T_dS
E_hawk = kB * T_H(M0)
print(f"  GH bath (T_dS = {T_dS:.2e} K):      E ~ {E_bath/eV:.1e} eV  "
      f"-> {np.log10(mec2/E_bath):.0f} orders BELOW threshold")
print(f"  survivor Hawking (1e12 Msun):       E ~ {E_hawk/eV:.1e} eV  "
      f"-> {np.log10(mec2/E_hawk):.0f} orders BELOW threshold")
N_gap = H * 1e103 * yr
print(f"  old-aeon relic light: redshifted e^-N over the gap, N ~ {N_gap:.1e} -> zero")
E_hard = mec2**2 / E_bath
print(f"  mixed channel (TeV-on-EBL geometry): a photon pairing off the GH bath")
print(f"    needs E >= (m_e c^2)^2/kT_dS = {E_hard/GeV:.1e} GeV = {E_hard/E_Pl:.0e} E_Pl"
      f"  -> trans-Planckian, dead")
print("  [GH-bath caveat: T_dS is a detector response (Gibbons-Hawking 1977), not an")
print("   objective photon gas; treating it as one only OVERSTATES the BW rate.")
print(f"   equivalent dS pair-creation exponent: exp(-2 pi m_e c^2/hbar H) = "
      f"exp(-{2*np.pi*mec2/(hbar*H):.1e})]")

# ---------------- GATE 2: supply ----------------
print("\nGATE 2 -- supply: is there anything to 'cross rapidly in all directions'?")
rate = L_H(M0) / (5.0 * kB * T_H(M0))     # <E> ~ 5 kT (greybody peak, Page 1976)
n_bath = 0.244 * (kB * T_dS / (hbar * c))**3
V_h = (4/3) * np.pi * (c / H)**3
n_ss = rate / (3 * H * V_h)
print(f"  survivor photon emission rate: {rate:.1e} /s -> one photon per {1/rate/yr:.0e} yr")
print(f"  steady-state density it sustains: n = R/(3 H V_horizon) = {n_ss:.1e} /m^3")
print(f"  GH-bath photon density (naive gas): {n_bath:.1e} /m^3 -> one photon per "
      f"({(1/n_bath)**(1/3)/9.46e15:.0e} ly)^3 box")
print(f"  neutrinos: m_nu/k_B T_H ~ {0.05*eV/(kB*T_H(M0)):.0e} -> Boltzmann-dead until the")
print("    endpoint; the fuse is photon+graviton only (certifies the estimates above)")
print("  other survivors: after ~5.8e92 e-folds each flash is exponentially alone in")
print("    its horizon -> no inter-survivor crossing beams, ever")
print("    -> the 'crossfire' has of order ZERO bullets from every source.")

# ---------------- GATE 3: geometry + redshift ----------------
print("\nGATE 3 -- the substrate actively erases the condition")
N_kill = np.log(E_Pl / mec2)
print(f"  e-fold time 1/H = {1/H/Gyr:.1f} Gyr; photon energy dies as e^(-Ht)")
print(f"  even a PLANCK-energy photon falls below threshold in {N_kill:.0f} e-folds "
      f"= {N_kill/H/yr:.1e} yr")
print(f"    (vs the 1e103-yr fuse: within the first ~1e-91 of it)")
print("  collimation: free streaming in de Sitter -> beams turn radial/receding,")
print("    (1-cos th) -> 0 -> s -> 0: BW needs CROSSING beams; expansion combs them out")
print("    -> the amniotic property of L0 is precisely the ERASURE of this condition.")

# ---------------- THE ENDPOINT: where matter IS created ----------------
print("\n" + "=" * 78)
print("THE ENDPOINT -- matter IS created there, but the headline channel is DIRECT")
print("=" * 78)
M_bw = hbar * c / (8 * np.pi * G * me)          # kT_H = m_e c^2
M_bw_peak = 5.7 * M_bw                          # photon spectral peak ~5.7 kT (Page 1976)
print(f"  window opens (order-of-magnitude bracket, greybody spectral peak ~5.7 kT):")
print(f"    M ~ {M_bw:.1e} kg (kT_H = m_e c^2) .. {M_bw_peak:.1e} kg (spectral peak = m_e c^2)")
print(f"    tail duration t_ev = {t_ev(M_bw)/yr:.1e} .. {t_ev(M_bw_peak)/yr:.1e} yr"
      f"  = ~1e-87..1e-85 of the fuse")
print(f"    [match-strike window M_cut ~ 1.3e11 kg sits INSIDE this era]")
print("  channel ranking in that window:")
print("    1. DIRECT Hawking emission of e+e- (then mu, pi, quark jets): the hole")
print("       mints matter with NO collision needed -- same threshold mass;")
# BW among the hole's own photons: naive isotropic optical depth near horizon,
# tau(T) = 0.244 (kT/hbar c)^3 sigma_BW(s_typ) r_s(T), r_s = hbar c/(4 pi kT);
# exact Breit-Wheeler cross-section (peak 1.70e-29 m^2 at sqrt(s)=1.40x threshold,
# falling as (m^2/s) ln s above it -> tau PLATEAUS, never -> 1)
def sig_bw(s):
    eps = 4 * mec2**2 / s                       # = 1 - beta^2, computed exactly
    if eps >= 1: return 0.0
    b = np.sqrt(1 - eps)
    logterm = 2 * np.log1p(b) - np.log(eps)     # = ln((1+b)/(1-b)), stable for b -> 1
    return (3 * sigT / 16) * eps * ((3 - b**4) * logterm - 2 * b * (2 - b**2))
def tau_gg(kT):
    return 0.244 * sig_bw((3.0 * kT)**2) * kT**2 / (4 * np.pi * (hbar * c)**2)
tau_me = tau_gg(mec2)
print(f"    2. BW among its own photons: tau_gg = {tau_me:.1e} at kT = m_e c^2;")
print(f"       sigma falls as (m^2/s) ln s above the peak, so tau plateaus:")
for kT, tag in [(mec2, 'm_e'), (0.34 * GeV, '0.34 GeV'), (45 * GeV, '45 GeV'), (E_Pl, 'E_Pl')]:
    print(f"         kT = {tag:>9}: tau_gg ~ {tau_gg(kT):.0e}")
print(f"       -> BW NEVER reaches tau = 1; direct emission beats BW conversion by")
print(f"          ~0.1/tau ~ {0.1/tau_me:.0e}. BW is a ~ppm sideshow even at the flash.")
print("  photosphere postscript [owned, resolved]: whether the outflow self-thermalizes")
print("  was contested -- Heckler 1997 (QED, onset ~45 GeV, via bremsstrahlung + e-gamma")
print("  pair production, NOT gamma-gamma) and Daghigh-Kapusta 2002 (plasma shell) vs")
print("  MacGibbon-Carr-Page 2008 (causality + formation length ~E/m_e^2: no photosphere).")
print("  Consensus since 2008: NO photosphere (Auffinger 2023 review); fragmentation")
print("  above Lambda_QCD (MacGibbon-Webber 1990) is standard and is not a photosphere.")

# ---------------- PUNCHLINE ----------------
print("\n" + "=" * 78)
print("PUNCHLINE -- why the aeon-filler must be a FIELD, not crossfire")
print("=" * 78)
N_inf = 63
print(f"""  radiation crossfire:  rho ~ a^-4 -> loses to de Sitter dilution, always
  plateau field (w=-1): rho ~ a^0  -> the ONLY dilution-proof store (repo identity
                                      w=-1 <=> rho~a^0 <=> dS~0)
  every dS creation channel settles to steady state (production vs 3H dilution)
  and the production rates are exponentially dead (Mottola/Schwinger-in-dS);
  and even the pairs the flash mints directly sit UPSTREAM of inflation:
    dilution e^(-4N), N >= {N_inf} -> ~1e-{4*N_inf*0.4343:.0f} -> absent from the new census.
  The mechanism is NOT wrong -- gamma-gamma <-> e+e- runs at full blast inside the
  new aeon's plasma after reheating (and sets today's MEASURED TeV/EBL horizon,
  Fermi-LAT 2012). It fails only in the dilute substrate, not in principle.
  Historical echo: every cyclic/steady-state prior art mints cycle-start matter
  from a FIELD (Hoyle 1948 C-field; QSSC; CCC uses conformal rescaling, not BW).
  VERDICT: the condition exists in LMU only inside the match head -- and even
  there as the spark's minor channel; bulk L0 kills it four independent ways.
  [assembly Fact-th|cond ; no falsifier moved ; photosphere episode = resolved]""")
