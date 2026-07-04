# What the math is doing — a plain-language glossary for LMU V3.13

**Governance rule:** this glossary *describes* `LMU_V3_25_consolidated.tex` (it was
drafted against the V3.13 snapshot); where the two disagree, the .tex governs. **Reading rule:** glosses are for *reading*, not
*reasoning* — never derive a conclusion from the metaphor; derive from the equation,
then check the metaphor survived. **Precision rule:** significant figures are sacred
(2.69σ never becomes "almost 3σ"). **Tag rule:** every claim keeps its
[Fact]/[Fact-theory]/[Hypothesis]/[Speculation]/[Design]/[Open]/[Dead-end] tag when restated in words.

*Style ancestry: Thompson, "Calculus Made Easy" (1910); ∫-as-summa: Leibniz;
intuition-before-formalism ordering: Reichenbach (1938), discovery vs. justification.*

---

## A. Numbers and scales

**log₁₀ x** — counts *digits*, not size. log₁₀ = 122 means "a 1 with 122 zeros."
The whole document breathes in log-space; differences of "a few" here are factors
of thousands.

**dex** — one step of ×10. The relic offset "+0.22 dex above M–σ" means the black
holes weigh ~1.7× more than the relation predicts — noticeable, not monstrous.

**e and e-folds (N)** — one e-fold multiplies the universe's size by e ≈ 2.718.
N = 100 e-folds is growth by ×10⁴³. "Budget of e-folds" = how many doublings-ish
the phase can afford.

**e⁻²ᴺ, e⁻³ᴺ, e⁻⁴ᴺ** — a leftover divided by the same factor at *every* step.
After N = 100 steps the e⁻²ᴺ channel keeps one part in 10⁸⁷. *Where the picture
matters:* exponential decay beats any polynomial growth — this single fact is the
entire crossover-cleanliness argument.

**σ (significance)** — how many error-bar widths the measurement sits from the
boring answer. 2σ = interesting, 3σ = serious hint, 5σ = discovery. *Caution:*
σ values are never rounded up; 2.69σ is 2.69σ.

**ρ(w₀, wₐ) = −0.894 (correlation)** — when the fit pushes w₀ up, wₐ must come
down. The uncertainty region is a tilted cigar, not a circle; distances to it must
be measured along the tilt — which is why the "joint locus distance" is the honest
number.

**Leave-one-out (LOO)** — pull one card out of the tower and see if the result
stands. When dropping UGC 2698 flips r = −0.72 to +0.24, the "correlation" *was*
that one card. [The R2 rule in statistical clothing.]

## B. The expansion bookkeeping

**a(t), the scale factor** — the universe's zoom level. a = 1 today; a = 2 means
every untethered distance has doubled.

**H = ȧ/a, the Hubble rate** — growth *per unit of itself*: "what fraction bigger
per second," not a speed. *Caution:* H falling does not mean expansion is ending;
H = constant is exponential growth in disguise.

**ä/a, the acceleration** — whether the zoom is speeding up or slowing down. The
A-field's signature is a *mountain*: ä/a climbs, peaks at a = 0.99 (≈ today), and
descends — versus ΛCDM's permanent plateau.

**Friedmann equation** — the budget sheet: (growth rate)² = sum of everything in
the box, each ingredient diluting at its own rate as the box grows. [Friedmann 1922]

**w = p/ρ, the equation of state** — a substance's character when space stretches.
Matter: w = 0, thins as the volume. Radiation: w = ⅓, thins faster (each photon
also redshifts). w = −1: does not thin at all — every new cubic meter arrives
pre-filled, paid by the work of negative pressure.

**Comoving vs. proper distance** — a grid painted on the rubber sheet vs. a tape
measure laid across it. Galaxies sit still on the painted grid while the grid
itself stretches.

**Horizon** — the farthest light can have come from (past horizon) or will ever
reach (event horizon). **Super-horizon mode** = a wave longer than the whole
visible patch: the diver inside the tsunami — too long to see, only an
all-ocean instrument (DESI as altimeter) can read it.

**Conformal time η** — a clock that ticks ever slower as the universe grows, tuned
so light always travels at 45° on the chart. It is the bookkeeping that lets
"before the bang" and "after the bang" sit on one page.

## C. The A-field machinery

**V(A), the potential** — the hill the field rolls on. V = ½m²A² is a parabolic
valley whose floor sits at exactly zero — and "exactly zero" is the entire item-(B)
wall.

**Klein–Gordon with 3HȦ friction** — a ball rolling downhill while expansion acts
as friction. **Thawing**: while H > m the friction pins the ball (frozen, acts like
a cosmological constant); when H drops below m the ball wakes and rolls — w lifts
off −1.

**Oscillation → ⟨w⟩ = 0** — once underdamped, the ball swings through the valley
floor; averaged over swings it behaves exactly like matter and dilutes as a⁻³
[Turner 1983]. The dark energy literally turns to dust.

**Shooting method** — adjust the launch (A_i or m) until the trajectory lands on
today's measured Ω_DE = 0.69. Two *different* launch strategies landing on the same
(w₀, wₐ) point is the cross-validation, not a coincidence.

**Radau / DOP853** — careful step-by-step walkers for differential equations.
"Integrated" in this document means *walked numerically, every step checked* — not
solved by a formula and trusted.

**CPL: w(a) = w₀ + wₐ(1−a)** — a straight-line stand-in for a curve, honest only
near today. *Caution:* extrapolated past a = 1 it predicts w > +1, which no
physical field here ever does; the stand-in fails, not the field.

## D. Calculus in one breath

**∫ (integral)** — Leibniz's elongated S for *summa*: slice the thing into
uncountably many slivers, add them back. The limit is *exact*, not an estimate.
*Where the picture breaks:* "adding small pieces" misleads the moment the integrand
goes negative — pieces cancel, totals can vanish.

**d/dt, dx** — "a little bit of": the instantaneous rate, the direction of the
next tiny step.

**Differential equation** — a purely local rule: *given where you are, here is
your next step.* Walk the rule forward and it draws the entire history. The
document's spine (KG + Friedmann) is two such rules holding hands.

## E. Geometry at the crossing

**Ω²g (conformal rescale)** — swap the ruler everywhere at once, keeping every
angle and every light-cone. Shapes survive, sizes don't. This is the Penrose move
that makes an infinite future and a next bang meet on one surface.

**C^k smoothness / "exactly C^{2,1}"** — how clean the weld is: value, slope, and
curvature all match across the junction (C²); the *next* derivative jolts (C³
log-periodically blocked). C² is precisely what Einstein's equations require —
the weld passes with zero margin.

**Weyl tensor (E and B parts)** — the part of gravity *not* pinned to local
matter: tides and gravitational waves, the part that travels. "Weyl cleanliness"
= the weld carries no inherited tidal scar above the e⁻²ᴺ leftover.

**Killing vector** — a direction in which you can slide the geometry and nothing
changes; each one purchases a conservation law [Noether 1918]. Expanding space has
no time-slide — which is why total energy is *legally* non-conserved there.

**Frobenius indices** — the short menu of behaviors a field is even *allowed* to
have at t = 0. At a radiation bang the menu has two entries, {0, −1/2}. The stiff
t^(−1/2) branch **is on the menu** — which is exactly why admissibility costs one
extra condition: its amplitude must be set to vanish on the surface. That is
condition G2-c, said in words.

**Nariai mass** — the largest black hole that fits inside a given cosmic horizon;
as H → 0 the ceiling rises without bound. Coefficient c³/(3√3·GH), not the naive
c³/(2GH).

## F. Statistics of the sky

**P(k), A_s, n_s** — the recipe of the initial lumps: how much lumpiness at each
size. A_s is the overall amplitude (~10⁻⁵ contrast), n_s the tilt (slightly more
power at large sizes, 0.9649).

**f_NL** — whether the lumps are pure coin-flip Gaussian or carry a correlated
signature. Measured consistent with zero (−0.9 ± 5.1) — a hard target any
imported generator must hit.

**Jeans length λ_J** — the tipping size between pressure and gravity: smaller
clouds bounce, larger clouds collapse. The item-(F) gate is the statement that
island-scale modes sit far above λ_J once the field oscillates.

---

*Every entry above is a reading aid for a quantity that lives, with its owner and
tag, in the .tex. If a gloss ever feels like it proves something the .tex does
not — the gloss is wrong.*
