# LMU PR #1 — Adjudication rulings

**Base:** V3.25 @ `c007d48` · **Adjudicator:** chat-session Claude (TeX-capable env) · **Date:** 2026-07-04
**Method:** independent reproduction, not opinion — every overturn below carries a rerun script or a compile artifact.
*(หมายเหตุ: ไฟล์นี้เขียนให้ agent ใน PR ทำตามได้ตรง ๆ — exact old/new strings แนบครบ; เลขบรรทัดอ้าง c007d48, ใน branch เลื่อน +6 หลังบรรทัด 20)*

---

## R1 — id65 (critical) `tex:418`: **OVERTURNED as critical** → reclassified *minor: missing run-spec*. Label [Fact] **STANDS**.

**Finding claimed:** endgame numbers at a=20.6 "match no actual run"; alleged to be naive a⁻³ extrapolation; proposed fixes: repin from verifier's run, or demote to [Hypo].

**Independent reproduction** (`code/lmu_endgame_repro.py`, KG+Friedmann, Ω_DE=0.69 shot at a=1, integrated a: 10⁻³→20.6):

| m (H₀) | env(a=1) | cycles 1→20.6 | ρ_DE(20.6) | ρ_m | H(20.6) | env(20.6) |
|---|---|---|---|---|---|---|
| 1.0 | 2.035 | 4.5 | 1.41×10⁻³ | 1.06×10⁻⁴ | 0.0225 | 0.0531 |
| 3.0 | 0.678 | 34.0 | 1.52×10⁻⁴ | 1.06×10⁻⁴ | 0.0093 | 0.0058 |
| **6.0** | **0.339** | **55.0** | **2.84×10⁻⁴** | **1.06×10⁻⁴** | **0.0114** | **0.0040** |
| **doc L418** | **0.34** | **57** | **2.6×10⁻⁴** | **10⁻⁴** | **0.011** | **0.004** |

- **m=6 reproduces all six quantities**: envelope start 0.339/0.34 (0.3%), envelope end **exact**, H 3.6%, ρ_DE 9% (endpoint oscillation phase), cycles 55 vs 57 (counting from a=1 vs from oscillation onset a≈0.3 — convention, not discrepancy).
- **m=1.0 reproduces the verifier's own numbers exactly** (1.41×10⁻³ vs their 1.4×10⁻³; H 0.0225 vs their 0.0225): the verifier ran a competent integration **with the wrong parameter** — R8-class error (wrong-population reproduction). "First A=0 crossing at a=9.4" belongs to the *pinned* run (yet another m); different runs, no contradiction.
- The near-coincidence with pure a⁻³ extrapolation (2.37×10⁻⁴) is *physics*, not fabrication: for m=6, H<m already at a≈0.3, so the field is matter-like throughout a≥1.

**REJECTED:** (a) repin numbers from the m=1/pinned run — replaces correct output of one run with output of a different run; (b) demote to [Hypo]-extrapolation — the numbers are genuine integration output.

**APPROVED FIX (minimal diff, one clause):**
- old: `Integrated to $a=20.6$: the oscillation envelope`
- new: `Integrated to $a=20.6$ (endgame demonstration run, $m=6\,H_0$, $\Omega_{\rm DE}{=}0.69$ shot at $a{=}1$ --- fast-oscillation regime, distinct from the DESI-fit $m\!\approx\!1$ scan of Result~1): the oscillation envelope`

Plus: add `lmu_endgame_repro.py` to `/code` as the standing provenance artifact.

---

## R2 — id110 (README/CITATION advertise `[Fact-eq]`): **CONFIRMED.**

tex macros (L27, 36–40) define exactly: **[Fact], [Fact-theory], [Hypothesis], [Open]** — no `[Fact-eq]` anywhere in the tex (it is the author's chat-workflow alias, introduced into README by the assistant).
**FIX:** README + CITATION.cff legend → `[Fact] / [Fact-theory] / [Hypothesis] / [Open]`, optionally appending: *"(working alias in session logs: Fact-eq ≡ Fact-theory with the checkable numbers shown)"*. No tex change.

## R3 — id126 (glossary "Frobenius indices" reversed): **CONFIRMED.**

tex (L1486) derives indices **{0, −1/2}** at a radiation bang: the stiff t^(−1/2) branch **is on the Frobenius menu** — which is precisely *why* admissibility costs **one extra condition** (its amplitude set to zero on Σ). The glossary says the branch *"has no slot on the menu"* — if that were true, G2-c would cost zero conditions. Logic reversed.
**APPROVED gloss replacement:**
> **Frobenius indices** — the short menu of behaviors a field is *allowed* to have at t = 0. At a radiation bang the menu has two entries, {0, −1/2}. The stiff t^(−1/2) branch **is on the menu** — which is exactly why admissibility costs one extra condition: its amplitude must be set to vanish on the surface. That is condition G2-c, said in words.

## R4 — id130–132 (small numerics): **NO NUMERIC CHANGES.**

- **Nariai 1.7×10²² vs 1.789×10²²:** body uses "~, H~H₀" (honest rounding); spine is exact-at-H₀. Not a defect. Optional cosmetic 1.7→1.79; ruling: leave.
- **"+11.8 dex" (L935):** ⇔ reference mass 10^(22.253−11.8) = 2.8×10¹⁰ M☉ = the Gumbel band ceiling (M_max ≈ 5–7 M★) — self-consistent. Optional clarity: append *"above the ≈3×10¹⁰ M☉ band ceiling"*; no number change.
- **"T_H ~ 6×10⁻²⁰ K" (L645):** temperature of the 10¹² M☉ *upper illustration* body — correct (CODATA: T_H = 6.169×10⁻²⁰ K at 10¹² M☉). It is not a "flash temperature" claim. No change.

## R5 — id21 (companion "w = +1.24 at a = 10"): **REFUTED as defect.**

Value = the CPL thawing line extrapolated: w₀ − 9wₐ with unrounded fit (−0.862, −0.2336) → **+1.240**; the rounded printed pair gives +1.22. The sentence's own point is that this is an *unphysical artifact of the straight line* (the file flags it itself). Optional: "+1.24" → "+1.2" to match printed rounding; no physics fix required.

## R6 — id50 cluster (prologue [Fact] on no-collapse / single-survivor): **APPROVED IN PRINCIPLE.**

Model-consequence statements take `\factth` **[Fact-theory]**, not bare **[Fact]**. Apply relabel where flagged lines assert framework outcomes; need the findings_raw line list to apply precisely.

## R7 — Already-pushed commits: **KEEP ALL. Nothing to revert.** One eyeball.

- `16896f3`, `14567ce`, `7e050d7`: keep — including the two Thai corrections (อีออน, ข้อกล่าวอ้าง; both errors were introduced by the chat assistant in README, fixes legitimate) and the equation-count fix 26→33 (26 `equation` envs + numbered rows from 2 `align` envs). **Guard:** the internal integrity metric "`\begin{equation}` = 26" counts *environments* and remains valid — do not "fix" it in stress scripts.
- `bb5993f` (tex plumbing): direction **verified correct by compile** (see R8). **Eyeball point:** the four "Attribution" section renames alter canonical headings — author should read the four new titles in the PR diff before merge.

## R8 — Link-collision bug + fix: **CONFIRMED and CERTIFIED.**

- Structure: `\setcounter{section}{0}` ×10 with hyperref's default `\theHsection` ⇒ colliding destination names.
- Measured in the shipped V3.25 PDF: **only 21 distinct `section.*` destination names for 75 sections** (54 collisions absorbed by the name tree — TOC clicks across parts land in Part I).
- Certification compile in this env (XeLaTeX ×2, `\theH*` part-prefix + `hidelinks` removal): **0 errors · 104 pages unchanged · 75/75 distinct section destinations · 0 duplicates.**
- Protocol: merge PR → send merged tex back to the TeX-capable session → certified rebuild (the agent env has no TeX).

## R9 — Unresolved (need findings_raw excerpts):

id24, id67, exact id50 line list, and "Robotic notes §9.8" — `grep -i robotic` over the canonical tex returns **0 hits**; the reference is to a file/section not in this session's mirror. Paste the finding texts (or adjudicate post-merge).

## R10 — Version protocol.

Bundle into **one rebuild → V3.26** (bump `\lmuver`), single revision-history block listing: PR#1 plumbing (`\theH*`, hidelinks, Attribution titles), L418 run-spec provenance (R1), README/CITATION tag legend (R2), glossary Frobenius direction (R3), optional R4/R5 cosmetics. No spine change; no label demotions.
