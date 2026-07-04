#!/usr/bin/env python3
"""
LMU verify_all.py -- consolidated numeric verification suite.
Baseline: V3.26 (post PR #1; epsilon_DESI = 4.6e-2 chain convention).

Sections
  [1] CODATA spine (12 checks)     constants-only recomputation of doc anchors
  [2] KG thawing m-scan (6 rows)   fresh integration vs doc table (Part on F1)
                                   convention: shoot phi_i so Omega_DE(a=1)=0.69;
                                   w0=w(1), wa=-dw/da|_{a=1}
  [3] Relic-six statistics         (f_halo, Delta) table + NGC384 out-of-sample
  [4] N_Q quantum-breaking budget  E4 of the V3.26 epsilon changeset (both tiers)
  [5] TeX integrity                unescaped-brace balance, $ parity (asserted);
                                   equation/part/section counts (reported only --
                                   they legitimately change between versions)
  [6] endgame m=6 (--full only)    delegates to code/lmu_endgame_repro.py (slow)

Usage:  python3 verify_all.py [--tex FILE] [--full]
Exit 0 = all asserted checks PASS.

Tolerances (stated, not hidden): spine 0.5% (CODATA/rounding); KG |dw0|<=0.004,
|dwa|<=0.02 (doc table is 3-decimal; an independent integrator + finite-diff wa
agrees at that level -- verified this suite reproduces all 6 rows); stats 0.005.
"""
import argparse, math, re, sys

G    = 6.67430e-11        # m^3 kg^-1 s^-2 (CODATA)
c    = 299792458.0        # m/s
hbar = 1.054571817e-34    # J s
kB   = 1.380649e-23       # J/K
Msun = 1.989e30           # kg (doc convention)
me   = 9.1093837015e-31   # kg
yr   = 3.156e7            # s
H0   = 67.4*1000/3.0857e22            # s^-1  (doc spine value)
Mpl_red_GeV = 2.435e18                # reduced Planck mass
GeV_per_s   = 6.582119569e-25        # hbar in GeV*s

FAILS = []
def check(name, got, exp, rtol, anchor):
    ok = abs(got-exp) <= rtol*abs(exp)
    print(f"[{'PASS' if ok else 'FAIL'}] {name}: got {got:.4g}, doc {exp:.4g} ({anchor})")
    if not ok: FAILS.append(name)

# ---------------------------------------------------------------- [1] spine
def spine():
    print("== [1] CODATA spine ==")
    K = hbar*c**3/(8*math.pi*G*kB)                       # T_H = K/M
    check("T_H(1e12 Msun) [K]",      K/(1e12*Msun), 6.169e-20, 5e-3, "Hawking clock row")
    check("T_H(seed 1.524 g) [K]",   K/1.524e-3,    8.05e25,   2e-2, "flash endpoint, id82")
    tau = lambda M: 5120*math.pi*G**2*M**3/(hbar*c**4)/yr
    check("tau_evap(1e12) [yr]",     tau(1e12*Msun), 2.10e103, 5e-3, "evaporation ladder")
    check("tau_evap(1e11) [yr]",     tau(1e11*Msun), 2.10e100, 5e-3, "survivor clock")
    S = lambda M: 4*math.pi*G*M**2/(hbar*c)              # S_BH / kB
    check("S_BH(1e12) [kB]",         S(1e12*Msun),  1.049e101, 5e-3, "entropy ledger")
    check("S_BH(1e11) [kB]",         S(1e11*Msun),  1.049e99,  5e-3, "entropy ledger")
    check("S_rad = 4/3 S_BH (1e11)", 4/3*S(1e11*Msun), 1.40e99, 8e-3, "Zurek 1982 pair")
    check("T_pair = 2 m_e c^2/kB",   2*me*c**2/kB,  1.186e10,  5e-3, "pair threshold")
    MN = c**3/(3*math.sqrt(3)*G*H0)/Msun
    check("M_Nariai(H0=67.4) [Msun]", MN,           1.789e22,  5e-3, "Nariai bound")
    check("naive/exact Nariai ratio", 3*math.sqrt(3)/2, 2.598, 1e-3, "sqrt(27)/2 factor")
    check("R_s(1e11 Msun) [m]",      2*G*1e11*Msun/c**2, 2.95e14, 5e-3, "catalysis body")
    check("seed 7e4 m_Pl [g]",       7e4*math.sqrt(hbar*c/G)*1e3, 1.524, 5e-3, "V3.23 endpoint")

# ------------------------------------------------------- [2] KG thawing scan
DOC_ROWS = [(0.3,-0.987,-0.019),(0.5,-0.964,-0.054),(0.8,-0.908,-0.144),
            (1.0,-0.857,-0.233),(1.5,-0.681,-0.588),(2.0,-0.445,-1.176)]
def kg_scan():
    print("== [2] KG thawing m-scan (units H0=1, 8piG/3=1; Om=0.31) ==")
    from scipy.integrate import solve_ivp
    Om, ai = 0.31, 1e-3
    def run(m, phi0):
        def rhs(t, y):
            a, ph, dph = y
            H = math.sqrt(Om*a**-3 + 0.5*dph**2 + 0.5*(m*ph)**2)
            return [a*H, dph, -3*H*dph - m*m*ph]
        ev = lambda t, y: y[0] - 1.06; ev.terminal, ev.direction = True, 1
        return solve_ivp(rhs, (0, 20), [ai, phi0, 0.0], events=ev,
                         dense_output=True, rtol=1e-9, atol=1e-12)
    def at_a(sol, a_t):                     # invert a(t) by bisection
        lo, hi = sol.t[0], sol.t[-1]
        for _ in range(80):
            mid = 0.5*(lo+hi)
            if sol.sol(mid)[0] < a_t: lo = mid
            else: hi = mid
        return sol.sol(0.5*(lo+hi))
    def omega_de(sol, m):
        a, ph, dph = at_a(sol, 1.0)
        rho = 0.5*dph**2 + 0.5*(m*ph)**2
        return rho/(rho + Om)
    for m, w0d, wad in DOC_ROWS:
        lo, hi = 1e-3, 120.0                # Omega_DE monotone in phi0
        for _ in range(60):
            mid = 0.5*(lo+hi)
            s = run(m, mid)
            if omega_de(s, m) < 0.69: lo = mid
            else: hi = mid
        s = run(m, 0.5*(lo+hi))
        def w(a_t):
            a, ph, dph = at_a(s, a_t)
            Kk, V = 0.5*dph**2, 0.5*(m*ph)**2
            return (Kk-V)/(Kk+V)
        w0 = w(1.0); wa = -(w(1.03)-w(0.97))/0.06
        ok = abs(w0-w0d) <= 0.004 and abs(wa-wad) <= 0.02
        print(f"[{'PASS' if ok else 'FAIL'}] m={m}: w0={w0:+.3f} (doc {w0d:+.3f}), "
              f"wa={wa:+.3f} (doc {wad:+.3f})")
        if not ok: FAILS.append(f"KG m={m}")

# ------------------------------------------------------ [3] relic statistics
def relics():
    print("== [3] relic-six + NGC384 ==")
    pairs = {"NGC1277":(0.05,0.24),"NGC1271":(0.19,0.21),"Mrk1216":(0.21,0.31),
             "PGC11179":(0.05,0.26),"UGC2698":(0.38,0.04),"NGC384":(0.14,0.30)}
    f = [v[0] for v in pairs.values()]; d = [v[1] for v in pairs.values()]
    n = len(d); mu = sum(d)/n
    sd = math.sqrt(sum((x-mu)**2 for x in d)/(n-1))
    def pearson(x, y):
        mx, my = sum(x)/len(x), sum(y)/len(y)
        cov = sum((a-mx)*(b-my) for a, b in zip(x, y))
        return cov/math.sqrt(sum((a-mx)**2 for a in x)*sum((b-my)**2 for b in y))
    check("mean Delta [dex]", mu, 0.227, 0.005/0.227, "Part V table")
    check("sample sd [dex]",  sd, 0.099, 0.01,        "Part V table")
    check("r(f,Delta) all 6", pearson(f, d), -0.724, 0.007, "halo-starvation scan")
    f5 = [v[0] for k, v in pairs.items() if k != "UGC2698"]
    d5 = [v[1] for k, v in pairs.items() if k != "UGC2698"]
    check("r drop-UGC2698",   pearson(f5, d5), 0.242, 0.03, "leverage check")
    pred = 8.32 + 5.64*math.log10(221/200)   # McConnell-Ma 2013 at sigma=221
    check("NGC384 M-sigma pred [dex]", pred, 8.565, 1e-3, "out-of-sample line")
    check("NGC384 Delta [dex]", 8.861-pred, 0.296, 0.02, "8.861-8.565=+0.30")

# ------------------------------------------------- [4] N_Q budget (E4, V3.26)
def nq():
    print("== [4] quantum-breaking budget N_Q=(Mp_red/H_inf)^2 ==")
    def NQ(eps):
        Hinf = H0*math.sqrt(0.69*eps)*GeV_per_s   # GeV
        return (Mpl_red_GeV/Hinf)**2
    check("N_Q at eps=3.0e-2 (retired)", NQ(3.0e-2), 1.39e122, 6e-3, "pre-changeset anchor")
    check("N_Q at eps=4.6e-2 (E4 NEW)",  NQ(4.6e-2), 9.03e121, 6e-3, "V3.26 changeset")
    check("N_Q at eps'_crit=6.3e-181",   NQ(6.3e-181), 6.60e300, 6e-3, "crit tier, unchanged")

# --------------------------------------------------------- [5] tex integrity
def integrity(path):
    print(f"== [5] tex integrity: {path} ==")
    try: s = open(path, encoding="utf-8").read()
    except OSError as e:
        print(f"[FAIL] cannot read tex: {e}"); FAILS.append("tex read"); return
    ob = len(re.findall(r"(?<!\\)\{", s)); cb = len(re.findall(r"(?<!\\)\}", s))
    dl = len(re.findall(r"(?<!\\)\$", s))
    ok1, ok2 = ob == cb, dl % 2 == 0
    print(f"[{'PASS' if ok1 else 'FAIL'}] brace balance: {ob} open / {cb} close")
    print(f"[{'PASS' if ok2 else 'FAIL'}] dollar parity: {dl} (even required)")
    if not ok1: FAILS.append("braces")
    if not ok2: FAILS.append("dollars")
    print(f"[info] counts (report only): equation={len(re.findall(chr(92)+chr(92)+'begin{equation}', s))}, "
          f"part={len(re.findall(chr(92)+chr(92)+'part'+chr(123), s))}, "
          f"section={len(re.findall(chr(92)+chr(92)+'section'+chr(123), s))}")

# ------------------------------------------------------------------- driver
if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--tex", default=None, help="tex file for integrity checks")
    ap.add_argument("--full", action="store_true", help="also run endgame m=6 (slow)")
    a = ap.parse_args()
    spine(); kg_scan(); relics(); nq()
    if a.tex: integrity(a.tex)
    if a.full:
        print("== [6] endgame m=6 (delegated) =="); import subprocess
        r = subprocess.run([sys.executable, "code/lmu_endgame_repro.py"])
        if r.returncode: FAILS.append("endgame")
    print("\n" + ("ALL PASS" if not FAILS else f"FAILURES: {FAILS}"))
    sys.exit(1 if FAILS else 0)
