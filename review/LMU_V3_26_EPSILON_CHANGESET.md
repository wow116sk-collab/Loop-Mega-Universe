# LMU V3.26 — ε_DESI RECOMPUTE CHANGESET (R25 stage 2, rerun-verified)

**From adjudicator, 2026-07-04.** Executes the body-wide adoption of the chain-covariance detectability threshold. Physics edit — every number below was recomputed this session; arithmetic shown.

## 0. The physics (one paragraph)

The doc's convention (body, `$0.1\sigma_{w_0}$ convention` line): a constant floor $V_{\min}=\epsilon\,\rho_{\rm DE}$ shifts today's observables by $|\Delta w_0|\approx0.185\,\epsilon$; the detectability threshold is $\epsilon_{\rm DESI}=0.1\,\sigma_{w_0}/0.185$. The V3.8 chain pull (revision entry 3.7→3.8, item (i) — grep `4.6` in main to find it) replaced the pre-chain $\sigma_{w_0}$ with the released-DR2 chain value, giving $\epsilon_{\rm DESI}=4.6\times10^{-2}$ (implied chain $\sigma_{w_0}=0.185\times0.046=8.5\times10^{-2}$ — cross-check this against the V3.8 entry's stated σ before applying; if it disagrees, STOP and flag). The body was never updated (id97). This changeset updates it.

**Global consequences audited — nothing else moves:**
- Grid rows are ε-generic and untouched: turnarounds $a=5.8/13.9/30.4$ at $\epsilon=10^{-1}/10^{-2}/10^{-3}$; $|\Delta A|<4.6\times10^{-3}$ at $\epsilon=10^{-2}$. ⚠ **The $4.6\times10^{-3}$ ΔA value is a coincidental look-alike of the new threshold — DO NOT touch it.**
- All "for any relevant ε on the grid" guard statements remain valid verbatim: the grid extends to $10^{-1}>4.6\times10^{-2}$, so the new threshold is already inside the certified range. ($H_\infty\propto\sqrt{\epsilon}$ shifts only ×1.238; guards $T_H/T_{\rm dS}\ge10^{12}$, $M_{\rm Nariai}\ge10^{23}M_\odot$ have 12+ and 1+ orders of margin.)
- Independent ceilings untouched: $4.3\times10^{-3}$ (intra-island), $2.2\times10^{-26}(k/2)^{-3.5}$ (cross-island), $3.1\times10^{-181}$ (colonization), $\epsilon'_{\rm crit}=6.3\times10^{-181}$.
- $t_{\rm freeze}$ and $a_{\rm dom}/t_{\rm dom}$ appear only symbolically (no printed evaluation at ε_DESI) — formulas untouched.

## 1. The five edit sites (anchor by quoted context, NOT by line number — main has moved; at each site also DELETE the "(retired V3.8 convention)" label added by PR #1)

**E1 — body headline** (anchor: `at the $0.1\sigma_{w_0}$ convention`):
`\textbf{$\epsilon_{\rm DESI}=3.0\times10^{-2}$}` → `\textbf{$\epsilon_{\rm DESI}=4.6\times10^{-2}$}` and append once, after "convention": `(chain-covariance value, V3.8 pull; supersedes the pre-chain $3.0\times10^{-2}$)`. This is the ONLY place the old value is kept, as provenance.

**E2 — +ε survival ceilings** (anchor: `(the DESI ceiling`):
`$\epsilon<3\times10^{-2}$ (the DESI ceiling` → `$\epsilon<4.6\times10^{-2}$ (the DESI ceiling`. (The strict-B2′ ceiling IS the observational bound, so it widens with it.)

**E3 — trichotomy caption** (anchor: `fig:drvminfork`):
`invisibility below $\epsilon_{\rm DESI}=3\times10^{-2}$` → `invisibility below $\epsilon_{\rm DESI}=4.6\times10^{-2}$`.

**E4 — quantum-breaking budget, THE DERIVED NUMBER** (anchor: `at $\epsilon'=\epsilon_{\rm DESI}=`):
`$1.39\times10^{122}$ at $\epsilon'=\epsilon_{\rm DESI}=3\times10^{-2}$` → `$9.03\times10^{121}$ at $\epsilon'=\epsilon_{\rm DESI}=4.6\times10^{-2}$`.
*Arithmetic (from scratch, convention recovered exactly):* $N_Q=(M_p^{\rm red}/H_\infty)^2$, $H_\infty=H_0\sqrt{0.69\,\epsilon'}$, $H_0=67.4$, $M_p^{\rm red}=2.435\times10^{18}$ GeV.
At $3\times10^{-2}$: $H_\infty=3.144\times10^{-19}\,{\rm s^{-1}}=2.069\times10^{-43}$ GeV → $N_Q=1.385\times10^{122}$ ✓ reproduces doc's 1.39e122.
At crit $6.3\times10^{-181}$: scaling $N_Q\propto1/\epsilon'$ → $6.60\times10^{300}$ ✓ reproduces doc's second value.
At $4.6\times10^{-2}$: $1.385\times10^{122}\times(3.0/4.6)=9.03\times10^{121}$. (Same exponent class; the "margin ≳10^{120}" sentence and the crit-tier value are unchanged.)

**E5 — item (J2)** (anchor: `identical today below`):
`below $\epsilon_{\rm DESI}=3\times10^{-2}$` → `below $\epsilon_{\rm DESI}=4.6\times10^{-2}$`.

**Item (K)** (anchor: `branch-blind below $\epsilon_{\rm DESI}$`): symbolic only — no numeral. If PR #1 placed a retired-label here, delete the label; otherwise no edit.

## 2. Agent checklist
1. `grep -n "retired V3.8" *.tex` → visit every hit; apply E1–E5 by context anchor; delete all labels.
2. Residual audit: `grep -n "3\.0\\\\times10\^{-2}\|3\\\\times10\^{-2}" *.tex` — remaining hits must be either (a) E1's provenance clause, or (b) non-ε contexts. Anything else = missed site, report.
3. Confirm the ΔA look-alike untouched: `grep -c "4.6\\\\times10\^{-3}"` unchanged before/after.
4. Rerun proof: `python3 code/verify_all.py --tex <file>` — section [4] pins N_Q(4.6e-2)=9.03e121 and N_Q(crit)=6.60e300.
5. Revision entry (V3.26) should cite: id97 / R25 stage-2, this changeset, and the E4 recompute.

## 3. Adjudicator's rerun record (this session)
```
eps=3.0e-02: t_freeze=6.72e+10 yr | a_dom(if tied)=3.643      # shown only to prove
eps=4.6e-02: t_freeze=5.43e+10 yr | a_dom(if tied)=3.159      # no printed number
ratio t_freeze = 0.808, ratio a_dom = 0.867, widening = 1.533 # depends on these
N_Q: 1.385e122 @3.0e-2 | 9.03e121 @4.6e-2 | 6.60e300 @6.3e-181  # E4, twice-anchored
```
