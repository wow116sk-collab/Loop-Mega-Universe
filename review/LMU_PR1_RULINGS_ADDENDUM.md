# LMU PR #1 — Adjudication rulings, ADDENDUM (R11–R16)

**Date:** 2026-07-04 · **Responds to:** agent counter-points after commit `ee06708` · **Base refs:** canonical tex @ c007d48 (branch lines +6 after L20)
All numbers below re-verified in the TeX-capable session; scripts/one-liners inline.

---

## R11 — R2 scope extension **+ correction of R2 itself** (adjudicator error, superseding)

The agent's scope flag is CONFIRMED and the original R2 legend was **incomplete**. The authority is the document's own legend line (tex **L54**), which defines **eight** tags:

> **[Fact]** measured/peer-reviewed · **[Fact-theory]** established theory · **[Hypothesis]** literature support / assumption · **[Speculation]** no equations yet · **[Design]** structural choice · **[Open]** unsolved · **[Dead]** failed · **[Auditor]** editor addition

(macros L27–40; note `\Hyp` and `\hyp` both render "[Hypothesis]", color-distinguished only.)

**Fixes ordered:**
1. **README + CITATION.cff legend** (already patched to a 4-tag list under old R2): extend to the full eight-tag list above, mirroring tex L54.
2. **ABOUT_AND_TAGS.md:108** (Zenodo description block): replace "[Fact] / [Fact-eq] / [Hypo]" phrase with: *"every load-bearing claim carries one of eight status tags ([Fact], [Fact-theory], [Hypothesis], [Speculation], [Design], [Open], [Dead], [Auditor])"*.
3. **Live GitHub About:** "Fact/Hypo-labelled" → **"Fact/Hypothesis-labelled"** (informal shorthand of two real tag names; acceptable in the 350-char box).
4. **Live Zenodo v3.25 record:** Zenodo permits metadata edits without a version bump — apply the same description fix there.

Root cause on record: the assistant wrote the publish pack from chat-workflow vocabulary ("Fact-eq/Hypo") instead of the document's rendered tag set. Same class as the two Thai errors; all mine.

## R12 — id24 (companion:313 "wₐ ≈ −1.5(1+w₀) = −0.14 **to 4%**"): **CONFIRMED.**

Re-verified: pinned pair (−0.91, −0.15): formula −0.135 vs −0.15 → **10.0%**; m=1.0 row (−0.857, −0.233): formula −0.215 vs −0.233 → **7.9%**. Agent's "7–11%" stands.
Origin of the false "4%": |−0.135 vs its own printed rounding −0.14| = **3.6%** — the formula compared against *its own rounded output*, not against any run.
**FIX (anchor `to 4%`, grep count=1):** `to 4%` → `to $\sim$10\% (against the pinned $w_a=-0.15$)`.

## R13 — id67 (tex Result 3, "our $(w_0,w_a)$"): **CONFIRMED — R1-class run-attribution defect. Fix attribution, do NOT recompute.**

Arithmetic verified both ways: pinned (−0.91, −0.15) → w(5) = **−0.31**, w(10) = **+0.44** (agent correct); m=1.0 scan row (−0.857, −0.233) → w(5) = **+0.075**, w(10) = **+1.240**.
Result 3's own caveat already states the mountain follows from *"choosing m to fit w₀"* → the quoted numbers legitimately belong to the **m=1.0 scan row**, and swapping in the pinned pair would change the demonstrated result (same reasoning that protected R1).
**FIX (anchor `our $(w_0,w_a)$`, grep count=1; adapt minimally if phrasing differs):**
`our $(w_0,w_a)$` → `the $m{=}1.0$ scan-row $(w_0,w_a)=(-0.857,-0.233)$ (the framework's pinned joint-fit pair is $(-0.91,-0.15)$; see the F1 pin record)`.

## R14 — id34 (`Robotic_Mining_Architecture_Notes.md:112`, dangling "§9.8"): **CONFIRMED — stale numbered cross-reference.**

No §9.8 exists in the current corpus; section numbers both *drifted across 22 versions* and *reset per part*, so bare §N.M cross-file references are ambiguous by construction. The referenced content is the tex **Reading rules** (L96): *"Every numbered equation in this document is established physics with a named owner."*
**FIX (anchor `§9.8`):** `the cosmology work's §9.8 spirit (compose existing tools` → `the cosmology work's Reading-rules spirit (every piece is established physics with a named owner --- compose existing tools`.
**Policy added:** cross-file references must be **name-based**, never section-numbered.

## R15 — R10 deferral: **APPROVED.** Agent's call is correct.

`\lmuver` bump, filename, README version line, and PDF must move **together** at the certified rebuild (TeX session, per R8 protocol). Deferring avoids a desynced V3_25/3.26 hybrid state.

## R16 — Process items: **APPROVED as proposed.**

1. Commit `LMU_PR1_RULINGS.md` + this addendum into the PR (suggest `review/` directory) — the adjudication record is provenance.
2. Append an **"Adjudication outcome (2026-07-04)"** section to `REVIEW_SUMMARY.md` (post-adjudication counts: **critical 0**; note commit `ee06708`); do **not** rewrite the historical body.
3. `findings_raw.md` stays pinned at c007d48, untouched. Correct instinct.

## Spot-check note — R6 application: **PASS.**

Prologue beats confirmed in base tex (L65 descent→lone survivor; L71 "empties into the pond… not by collapse"); branch offsets consistent (+6). Single-occurrence anchor discipline used. Final eyeball of the two `\Fact`→`\factth` diffs remains with the author in the PR.

---

**State after this addendum:** critical 0 · all four counter-points resolved · remaining before close: author eyeball (Attribution titles + R6 diffs) → merge → send merged tex to the TeX session → certified rebuild **V3.26** (R8+R15).
