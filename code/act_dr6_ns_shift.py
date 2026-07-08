#!/usr/bin/env python3
"""External-data refresh (2026-07-08): what the post-Planck CMB (ACT DR6, SPT-3G) does to
the LMU spine numbers. The doc anchors on Planck n_s=0.9649 -> N=57, r=0.0037. The current
combined CMB best-fit n_s has moved UP ~1.5-2 sigma. This recomputes N and r; it does NOT
replace the Planck reference -- it records how far the anchor has drifted. Run to reproduce.

n_s [Fact, measured]:
  Planck 2018      0.9649 +/- 0.0042   (doc's anchor)
  ACT DR6 alone    0.9666 +/- 0.0077
  Planck+ACT       0.9709 +/- 0.0038
  P-ACT-LB2(+DESI) 0.9752 +/- 0.0030   (current combined best-fit)
"""
def N_of(ns): return 2.0/(1.0-ns)
def r_of(N,alpha=1.0): return 12.0*alpha/N**2

cases=[("Planck 2018 (doc anchor)",0.9649),("ACT DR6 alone",0.9666),
       ("Planck+ACT",0.9709),("P-ACT-LB2 (+DESI DR2)",0.9752)]

print("== [Fact-eq, conditional on adopting each n_s] N and r under the shifting CMB anchor ==")
print(f"  {'combination':26s} {'n_s':7s} {'N':4s}  {'r(a=1)':7s} {'r(a=2.44)':9s}")
for name,ns in cases:
    N=N_of(ns)
    print(f"  {name:26s} {ns:.4f} {N:4.0f}  {r_of(N):.4f}  {r_of(N,2.44):.4f}")
print("  bounds: Planck+ACT gives r<0.038 -> LMU passes at every n_s above.")
print("  danger: doc's 'r<1e-3 favours ekpyrotic' -> LMU r stays 0.0018-0.009, ABOVE 1e-3 (safe).\n")

print("== the alpha-attractor <-> ACT tension (field-wide, LMU shares it) ==")
print("  Starobinsky/alpha-attractor: n_s = 1 - 2/N. Reheating allows N ~ 50-60.")
for N in (50,57,60):
    print(f"    N={N}: n_s = 1-2/N = {1-2/N:.4f}")
print("  -> at reheating-allowed N, the plateau predicts n_s ~ 0.960-0.967, now ~1.5-2 sigma BELOW")
print("     ACT's 0.971-0.975. To reach ACT's n_s you need N ~ 69-81, which OVER-shoots reheating.")
print("  => mild tension: the vanilla plateau under-predicts n_s vs ACT DR6 at reheating N.")
print("     Resolutions exist (extended alpha-Starobinsky, modified reheating: arXiv 2606.24131,")
print("     2510.18656) -- borrowed, field-wide; LMU inherits the fix, does not create the problem.\n")

print("== net (honest, labelled) ==")
print("  [Fact]      : ACT DR6 / SPT-3G measured n_s ~0.971-0.975 (up ~1.5-2 sigma from Planck).")
print("  [Fact-eq]   : IF adopted, LMU's N -> ~69-81, r -> ~0.0018-0.0045 (still under bounds).")
print("  [Fact-th]   : plateau-vs-ACT-at-reheating-N tension -- field-wide, LMU shares, fixable.")
print("  the Planck spine (N=57, r=0.0037) stays the reference; this records the drift, not a rewrite.")
