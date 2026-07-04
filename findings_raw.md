# LMU Document Review — Raw Findings (unverified)

> **สถานะ:** findings ดิบจากตัวรีวิว 15 ชุด (จากที่วางแผนไว้ 19 ชุด) — workflow ถูกหยุดก่อนขั้น adversarial verification จะทำงาน ดังนั้น **ทุกข้อยังไม่ผ่านการตรวจทานซ้ำ** อาจมี false positive ปนอยู่
>
> Raw reviewer output from 15 of 19 planned review agents; the workflow was stopped before the adversarial-verification pass ran, so **every finding below is unverified** and may contain false positives.

- Generated: 2026-07-04, from workflow run `wf_39047644-174` journal
- Reviewed against: repository state at commit `c007d48` (V3.25)
- Findings: **115** total — 1 critical, 28 major, 62 minor, 24 nit
- **Coverage gaps** (agents not finished when stopped): repo-reality audit (README layout vs actual tree), glossary-vs-usage cross-check, independent physics recomputation (CODATA spine), LaTeX static integrity (\ref/\label, environment balance, figure paths)

## Contents / severity per section

1. README.md (per-file review) — 3 major, 4 minor, 1 nit
2. ABOUT_AND_TAGS.md (per-file review) — 1 major, 2 minor
3. CONNECTION_MAP.md (per-file review) — 3 major, 4 minor, 1 nit
4. LMU_companion_glossary.md (per-file review) — 2 major, 2 minor, 1 nit
5. LMU_Companion_draft_v0.1.md (per-file review) — 2 major, 5 minor, 2 nit
6. Metadata pack: CHANGELOG.md / CITATION.cff / LICENSE / LICENSE-docs — 2 major, 4 minor, 1 nit
7. Robotic_Mining_Architecture_Notes.md (per-file review) — 1 major, 6 minor, 2 nit
8. LMU_V3_25_consolidated.tex — lines 1-138 (front matter, state vector, three-layer reading) — 2 major, 2 minor, 2 nit
9. LMU_V3_25_consolidated.tex — lines 139-365 (Part: the matter ladder L4-L1) — 2 major, 5 minor, 2 nit
10. LMU_V3_25_consolidated.tex — lines 366-618 (Part: the dark-energy field A / DESI) — 1 critical, 1 major, 4 minor, 2 nit
11. LMU_V3_25_consolidated.tex — lines 619-802 (Part: closure of the loop, the L0 ledger) — 1 major, 5 minor, 1 nit
12. LMU_V3_25_consolidated.tex — lines 803-985 (Part: operator B-prime + composed-system results) — 1 major, 4 minor, 3 nit
13. LMU_V3_25_consolidated.tex — lines 986-1254 (Part: verification & empirical confrontation) — 2 major, 5 minor, 2 nit
14. LMU_V3_25_consolidated.tex — lines 1255-1562 (stress audit, open ledger, attribution, session digest) — 1 major, 5 minor, 4 nit
15. Cross-document consistency audit (README / CHANGELOG / CITATION.cff / ABOUT_AND_TAGS / .tex) — 4 major, 5 minor

---

## 1. README.md (per-file review)

**Reviewer's overall assessment:** The README's physics-facing content is in good shape: the F4 arithmetic (r = 16ε ≈ 0.009), the BICEP/Keck r < 0.036 bound, the GW231123 masses/spins, the 104-page and 22-figure counts, all five cited arXiv IDs, the ORCID checksum, and the DOI/OSF links were all independently verified and check out. The defects are concentrated in the README's claims about the repository itself: the 'Repository layout' section describes six directories none of which exist, the advertised /code verification scripts are absent, the License section contradicts the actual MIT LICENSE file and carries a stale pre-release placeholder, and the build notes contradict the tex source (pdfTeX/lmodern fallback, \graphicspath{{figs/}}, and an equation-count checksum of 26 where the source produces 33 numbered equations). The Thai abstract faithfully tracks the English content but transliterates 'aeon' as the Thai word for 'ion'.

### 1. [MAJOR] broken-reference — `README.md:61`

**Summary:** The entire 'Repository layout' section describes six directories (/tex, /pdf, /figures, /logs, /changesets, /code), none of which exist in the repo; the actual tree has the .tex and .pdf at the root and figures in figs/.

**Evidence:**

> Lines 61-66 claim: "/tex LaTeX source (LMU_V3_25_consolidated.tex and priors) / /pdf compiled PDFs / /figures the 22 PNG figures ... / /logs session handoff logs ... / /changesets ... / /code verification / stress-test scripts". `ls` of the repo root shows only: ABOUT_AND_TAGS.md, CHANGELOG.md, CITATION.cff, CONNECTION_MAP.md, LICENSE, LICENSE-docs, LMU_Companion_draft_v0.1.md, LMU_V3_25_consolidated.pdf, LMU_V3_25_consolidated.tex, LMU_companion_glossary.md, README.md, Robotic_Mining_Architecture_Notes.md, figs/. No /tex, /pdf, /figures, /logs, /changesets, or /code directory exists, and no prior .tex versions or log/changeset files are present anywhere.

**Suggested fix:** Rewrite the layout section to match the actual flat tree (root-level .tex/.pdf, figs/ for the 22 PNGs), or create and populate the six directories before pointing readers at them.

### 2. [MAJOR] broken-reference — `README.md:28`

**Summary:** The 'Verification culture' section claims the verification scripts live in /code, but no /code directory and no script files (.py/.sh/.ipynb) exist anywhere in the repository, so the section's reproducibility claim cannot be fulfilled by a reader.

**Evidence:**

> Line 28: "Verification scripts live in `/code`." — `ls /home/user/Loop-Mega-Universe` shows no code directory, and `find . -name '*.py' -o -name '*.ipynb' -o -name '*.sh'` returns nothing outside .git. The CODATA re-derivations, Klein–Gordon re-integration ("6/6 (w₀, wₐ) rows reproduced"), and 14/14 dimensional audits advertised in the same paragraph therefore have no checkable artifacts in the repo.

**Suggested fix:** Either add the scripts under /code or remove/soften the sentence (e.g. 'scripts available on request' or point to the Zenodo deposit if they live there).

### 3. [MAJOR] internal-inconsistency — `README.md:92`

**Summary:** The License section states only 'CC-BY-4.0' with a stale pre-release placeholder, but the repo's primary LICENSE file is MIT (CC-BY-4.0 applies only to documents via LICENSE-docs), and the work is already released (V3.25 with a resolving DOI), so '⚠ confirm/replace before first release' is stale.

**Evidence:**

> Line 92: "CC-BY-4.0 *(⚠ confirm/replace before first release — see ABOUT_AND_TAGS.md)*". /home/user/Loop-Mega-Universe/LICENSE line 1 reads "MIT License"; LICENSE-docs line 1 reads "Creative Commons Attribution 4.0 International (CC BY 4.0)". Meanwhile lines 3-5 of the README show a live DOI badge and "Current version: V3.25 (2026-07-02)", and https://doi.org/10.5281/zenodo.20692157 resolves (HTTP 200 to zenodo.org/records/21156459) — the first release has already happened.

**Suggested fix:** State the actual dual licensing (MIT for code, CC-BY-4.0 for documents/figures per LICENSE-docs) and delete the pre-release warning.

### 4. [minor] factual-error — `README.md:78`

**Summary:** The build checksum '26 numbered equations' undercounts: the source has 26 \begin{equation} environments plus 7 numbered align rows (33 numbered equations total), and the equation counter is reset to 0 ten times, so the number is unverifiable as stated.

**Evidence:**

> Line 78: "Expected: 0 errors, 104 pages, 26 numbered equations." grep of LMU_V3_25_consolidated.tex: 26 \begin{equation} environments (none commented, no \nonumber), plus \begin{align} at tex lines 196-200 (3 rows, one \notag → 2 numbered) and tex lines 383-390 (5 labeled rows, all numbered, \label{eq:p2kg}…\label{eq:p2cpl}) = 33 numbered equations. The tex also contains \setcounter{equation}{0} at 10 locations, so equation numbers restart per part and never reach (26). (Page count 104 was independently confirmed correct from the PDF pages tree.)

**Suggested fix:** Say '33 numbered equations' (or '26 equation environments plus 7 numbered align lines'), or drop the equation checksum.

### 5. [minor] factual-error — `README.md:71`

**Summary:** The build note's rationale is contradicted by the source: it says 'lmodern.sty is not assumed' and forbids pdflatex, but the .tex preamble contains an iftex pdfTeX branch that explicitly loads \usepackage{lmodern}.

**Evidence:**

> Line 71: "Requires `fontspec` + Latin Modern OpenType fonts (do **not** use pdflatex; `lmodern.sty` is not assumed)." LMU_V3_25_consolidated.tex lines 2-6: "\usepackage{iftex} ... \usepackage[T1]{fontenc}\usepackage[utf8]{inputenc}\usepackage{lmodern} ... \usepackage{fontspec}\setmainfont{Latin Modern Roman}..." — i.e. the source has a pdflatex-compatible fallback that assumes lmodern.sty.

**Suggested fix:** Either say the source auto-detects the engine (XeLaTeX preferred; pdflatex fallback requires lmodern.sty), or remove the fallback from the tex if pdflatex is truly unsupported.

### 6. [minor] factual-error — `README.md:63`

**Summary:** The claim that the build expects the figure PNGs 'beside the .tex' (repeated as an instruction on line 71) is wrong: the source sets \graphicspath{{figs/}} and the repo correctly ships the 22 PNGs in figs/, so no relocation is needed or expected.

**Evidence:**

> Line 63: "/figures     the 22 PNG figures the build expects beside the .tex" and line 71: "Place the figure PNGs in the same directory as the `.tex`." — but LMU_V3_25_consolidated.tex line 20 reads "\graphicspath{{figs/}}", and figs/ contains exactly the 22 PNGs the 22 \includegraphics calls reference. The directory is also named figs, not /figures.

**Suggested fix:** Change to: 'figures live in figs/ next to the .tex; the source sets \graphicspath{{figs/}}, so build from the repo root as-is.'

### 7. [minor] clarity — `README.md:88`

**Summary:** The Thai abstract transliterates 'aeon' as 'อิออน' (three occurrences), which is the standard Thai spelling of 'ion' — a Thai physics reader will parse 'อิออนจบที่สภาพเย็น' as 'the ion ends cold', diverging from the English.

**Evidence:**

> Line 88: "อิออนจบที่สภาพเย็น–เจือจาง–เป็นก้อน ... หนึ่งแฟลช หนึ่งฟอง หนึ่งอิออนใหม่ ... (งบเนเกนโทรปีของอิออน)" — 'อิออน' is an established Thai spelling for 'ion' (modern Royal Institute form 'ไอออน'); 'aeon' is conventionally rendered 'อีออน' or glossed. All three uses mean 'aeon' per the English ("An aeon ends cold, dilute, and clumpy", "One flash = one bubble = one aeon", "the aeon's fresh negentropy budget").

**Suggested fix:** Use 'อีออน' (or 'อีออน (aeon)' on first use) throughout the Thai abstract.

### 8. [nit] clarity — `README.md:88`

**Summary:** In the Thai abstract, 'ทุกข้อเรียกร้อง' means 'every demand' (as in negotiation demands), a mistranslation of the English 'claim/statement' that the [Fact]/[Fact-eq]/[Hypo] labels attach to.

**Evidence:**

> Line 88: "มีป้ายกำกับ [Fact]/[Fact-eq]/[Hypo] ทุกข้อเรียกร้อง" vs. English line 18: "Every load-bearing statement in the document carries a label". 'ข้อเรียกร้อง' = demand/petition; the scholarly sense of 'claim' is 'ข้อกล่าวอ้าง' or 'ข้อความ'.

**Suggested fix:** Replace 'ทุกข้อเรียกร้อง' with 'ทุกข้อกล่าวอ้าง' (or 'ทุกข้อความสำคัญ' to match 'every load-bearing statement').

---

## 2. ABOUT_AND_TAGS.md (per-file review)

**Reviewer's overall assessment:** ABOUT_AND_TAGS.md is a well-constructed copy-paste release pack whose quantitative claims almost all verify: the GitHub description is 314/350 chars, the topic list is exactly 20, the ORCID checksum is valid, the PDF really is 104 pages, the .tex really has 26/26 balanced equation environments, the GW231123 numbers match the LVK 2025 values, and the named release/Zenodo files exist in the repo. The three defects found are staleness/consistency issues rather than physics errors: the upload checklist references a directory layout that does not exist in the repository (the most material problem), the license 'decision pending' warning contradicts both the file's own new-version instructions and the already-committed MIT/CC-BY-4.0 licenses, and the signature-phrase search claim doesn't match the punctuation used in the file's own Zenodo description and the README.

### 9. [MAJOR] stale-content — `ABOUT_AND_TAGS.md:154`

**Summary:** Upload checklist step 1 instructs arranging files into a repo layout (/tex /pdf /figures /logs /changesets /code) that does not exist anywhere in the repository — the .tex and .pdf sit at the repo root and the 22 figure PNGs live in figs/, so the pointer is materially wrong for anyone following it.

**Evidence:**

> Line 154: "จัดไฟล์ตาม layout ใน README (`/tex /pdf /figures /logs /changesets /code`) → `git add` → commit". Verified with ls: none of tex/, pdf/, figures/, logs/, changesets/, code/ exist ('No such file or directory' for all six); actual contents are LMU_V3_25_consolidated.tex, LMU_V3_25_consolidated.pdf at root and figs/ (22 PNGs).

**Suggested fix:** Update step 1 (and the layout it quotes) to the actual flat layout with figs/, or actually create the described directories before pointing releases/Zenodo users at them.

### 10. [minor] internal-inconsistency — `ABOUT_AND_TAGS.md:3`

**Summary:** The 'one decision is yours before first release: license' warning is stale and internally contradicted — section 3 of the same file describes publishing a *new version* under an existing concept DOI (i.e., first release already happened), and the repo already contains a decided license pair (MIT in LICENSE, CC BY 4.0 in LICENSE-docs), so 'CC-BY-4.0 is suggested everywhere' also mismatches the MIT code license actually committed.

**Evidence:**

> Line 3: "⚠ One decision is yours before first release: **license** (CC-BY-4.0 is suggested everywhere...)" vs line 78: "(Zenodo → your record → **New version**; never a fresh deposit, so the concept DOI keeps resolving.)". Repo check: LICENSE begins "MIT License / Copyright (c) 2026 Pitarn Rungsiyapornratana"; LICENSE-docs begins "Creative Commons Attribution 4.0 International (CC BY 4.0)".

**Suggested fix:** Drop or reword the 'before first release' warning (and the '⚠ your call' marker on line 84) to state the already-made decision: MIT for code, CC BY 4.0 for documents/PDF.

### 11. [minor] internal-inconsistency — `ABOUT_AND_TAGS.md:142`

**Summary:** The self-search cheat sheet claims the exact signature phrase "one flash, one bubble, one aeon" appears in doc/README/Zenodo, but the Zenodo description in this very file (line 99) and the README render it as "One flash = one bubble = one aeon" (equals signs); the comma form exists only in the .tex, so an exact-quoted search does not literally match two of the three claimed locations.

**Evidence:**

> Line 142: "`LMU \"one flash, one bubble, one aeon\"`  ← วลีลายเซ็น อยู่ทั้งใน doc/README/Zenodo" vs line 99 of the same file: "One flash = one bubble = one aeon". grep confirms README.md line 12 also uses "One flash = one bubble = one aeon" and the comma form matches only LMU_V3_25_consolidated.tex line 1523.

**Suggested fix:** Either standardize the phrase punctuation across the Zenodo description/README to the comma form, or note in the cheat sheet that README/Zenodo use the '=' variant.

---

## 3. CONNECTION_MAP.md (per-file review)

**Reviewer's overall assessment:** CONNECTION_MAP.md is an unusually disciplined index: every quote I could verify against in-repo sources checks out verbatim (RM's "route around or exploit it, never smash it", the 1.3 s lunar delay, the Mars-depot line), and its quantitative claims recompute correctly against LMU_V3_25_consolidated.tex (fork-5 bound 10^14.6 per generation; Egan–Lineweaver SMBH entropy ~10^104 k_B; no-hair's 3 parameters). The real defects are self-consistency ones: the file breaks its own [derived]-quarantine rule with C7/C8, its tag-system note contradicts both its own registry and the LMU source about [Fact-eq], and its registry points to an RM filename that does not exist in the repo; the remainder are dangling anchors/references and a leftover conversational fragment.

### 12. [MAJOR] internal-inconsistency — `CONNECTION_MAP.md:33`

**Summary:** The file's own rule says [derived] links 'live in §4', but two [derived] connections (C7, C8) are presented in §2's master index and as full blocks in §3 alongside [declared] links, violating the quarantine discipline the header stakes out.

**Evidence:**

> Line 33: "`[derived]` — the connection was worked out in analysis; not in any doc. → lives in §4." Line 6: "Links derived in analysis (not stated in any doc) are quarantined in §4 and marked as such". Yet line 134 (§3): "### C7 — substrate = root of L0 ... **Status:** `[derived]` (worked out in analysis — **not** stated this way in the docs)" and line 144: "### C8 ... **Status:** `[derived]` (this-analysis)".

**Suggested fix:** Either move C7/C8 into §4 with D1–D4, or amend lines 6 and 33 to say derived *results* live in §4 while derived *connections* (C7, C8) remain in §2–§3 but are flagged inline.

### 13. [MAJOR] internal-inconsistency — `CONNECTION_MAP.md:19`

**Summary:** The tag-system note claims 'both use [Fact-eq] the same way', but the registry's own LMU legend (line 14) does not include [Fact-eq], and the repo's LMU source confirms the tag does not exist there (0 occurrences in LMU_V3_25_consolidated.tex; its tag macros define only [Fact], [Fact-theory], [Hypothesis], [Speculation], [Design], [Open]).

**Evidence:**

> Line 19: "both use `[Fact-eq]` the same way (derived-from-Fact with the numbers shown)" vs line 14 LMU legend: "`[Fact] [Fact-theory] [Hypothesis] [Speculation] [Design] [Open] [Dead-end] [Auditor]`" — no [Fact-eq]; grep -c 'Fact-eq' LMU_V3_25_consolidated.tex returns 0.

**Suggested fix:** Correct line 19 to attribute [Fact-eq] to CoE only (as line 15 does), or add [Fact-eq] to the LMU legend on line 14 if the author's working legend actually includes it.

### 14. [MAJOR] broken-reference — `CONNECTION_MAP.md:17`

**Summary:** The document registry's File column points RM to `Robotic_Mining_Architecture_Notes_2`, but the file in this repo is `Robotic_Mining_Architecture_Notes.md` (no '_2'), so the registry's canonical pointer does not resolve.

**Evidence:**

> Line 17: "| **RM** | `Robotic_Mining_Architecture_Notes_2` | Off-world robotic-mining architecture |" — `ls /home/user/Loop-Mega-Universe/` shows only `Robotic_Mining_Architecture_Notes.md`; no file matching `*Notes_2*` exists.

**Suggested fix:** Update the File cell to `Robotic_Mining_Architecture_Notes.md` (the doc's content matches the map's quotes verbatim, e.g. its line 118 principle and line 123 Mars-depot line, so it is the intended source).

### 15. [minor] broken-reference — `CONNECTION_MAP.md:176`

**Summary:** D3 cites a bare '§6.1' for the substrate's unfalsifiability, but this file's §6 ('Publishability slice') has no subsection 6.1 and is about a different topic; every other section reference in the file carries a doc prefix (CoE §…, LMU §…), so this reference is dangling/ambiguous.

**Evidence:**

> Line 176: "`[Speculative]` pre-geometric substrate (deeper, unfalsifiable, §6.1)" — grep shows the only '§6.1' in the file and no '6.1' heading; §6 (line 202) is "## 6. Publishability slice" with no subsections.

**Suggested fix:** Prefix the reference with its source document (e.g. 'CoE §6.1') or point to the correct internal section.

### 16. [minor] broken-reference — `CONNECTION_MAP.md:232`

**Summary:** The appendix instructs readers to preserve anchors #f1..#f5 'so internal links survive', but no {#f1}–{#f5} anchors are defined anywhere in the file — the §5 firewall table rows carry no anchor IDs.

**Evidence:**

> Line 232: "#f1..f5  firewalls (do-not-connect)" under "If you split each block into its own file, preserve these IDs so internal links survive" — grep for '{#f' finds only {#c1}–{#c8} and {#d1}–{#d4}; the §5 table (lines 192–198) defines no anchors.

**Suggested fix:** Either add explicit anchors to the firewall entries (e.g. convert F1–F5 to anchored subsections) or drop the #f1..f5 line from the anchor table.

### 17. [minor] stale-content — `CONNECTION_MAP.md:126`

**Summary:** C6 addresses 'your opening question' — a leftover second-person reference to a chat conversation that exists nowhere in the document or repo, breaking the file's framing as a standalone index.

**Evidence:**

> Line 126: "This is what your opening question (\"besides time-entropy, what connects?\") sits on top of — time-entropy is the *foundational* link" — no such question appears anywhere in the file or repo.

**Suggested fix:** Rewrite impersonally, e.g. "time-entropy is the foundational link; the others (C1–C5, C7–C8) are layered above it."

### 18. [minor] internal-inconsistency — `CONNECTION_MAP.md:149`

**Summary:** The file defines [Fact-eq] as 'derived-from-Fact with the numbers shown' (line 19) but then applies the tag to purely definitional, number-free claims, contradicting its own definition.

**Evidence:**

> Line 149: "**Strength:** `[Fact-eq]` by definition of `ream`" (no numbers shown); similarly line 84: "the **divergence** of the bioprinted twin is `[Fact-eq]` (MZ-twin data)" cites no numbers — vs line 19's definition "derived-from-Fact with the numbers shown".

**Suggested fix:** Retag definitional claims (e.g. [Fact] or a 'by-definition' label) or show the supporting numbers where [Fact-eq] is used.

### 19. [nit] typo — `CONNECTION_MAP.md:44`

**Summary:** The CoE tag is written [Speculative] (mixed case) in three places although the registry defines it as all-caps [SPECULATIVE] — sloppy given the file's own warning not to merge or alter the legends.

**Evidence:**

> Line 44: "posit `[Speculative]`" (also lines 71 and 176) vs line 15's legend "`[SPECULATIVE]`" and line 94's correct "`[SPECULATIVE]`".

**Suggested fix:** Normalize to [SPECULATIVE] to match the CoE legend as printed in the registry.

---

## 4. LMU_companion_glossary.md (per-file review)

**Reviewer's overall assessment:** The glossary is substantively accurate: every piece of [Fact-eq]-style arithmetic recomputes correctly (e^100 ≈ 10^43.4, e^-200 ≈ one part in 10^87, 10^0.22 ≈ 1.7×, the Nariai coefficient c³/(3√3·GH) vs the naive c³/(2GH), f_NL = −0.9 ± 5.1, n_s = 0.9649, ρ(w₀,wₐ) = −0.894, the UGC 2698 leave-one-out flip), and the physics glosses (thawing, Turner-1983 oscillation-to-dust, CPL caution, Jeans gate direction, Killing-vector energy non-conservation) faithfully track the governing .tex. The two material defects are structural: the glossary is version-pinned to a V3.13 .tex that no longer exists in the repo (the repo is at V3.25), and the Frobenius-indices entry logically inverts the G2-c derivation it summarizes. Remaining issues are a tag-vocabulary mismatch and two small precision slips.

### 20. [MAJOR] broken-reference — `LMU_companion_glossary.md:3`

**Summary:** The glossary's governance rule points to LMU_V3_13_consolidated.tex, a file that does not exist in the repository (only LMU_V3_25_consolidated.tex is present), so the document's entire authority chain is broken and the glossary is 12 revisions stale.

**Evidence:**

> Line 3: "this glossary *describes* `LMU_V3_13_consolidated.tex`; where the two disagree, the .tex governs." Line 1 title: "a plain-language glossary for LMU V3.13". `ls /home/user/Loop-Mega-Universe` shows only LMU_V3_25_consolidated.tex / .pdf; no V3_13 file exists anywhere in the repo. The repo is at V3.25 (2026-07-02), and the .tex contains post-V3.13 errata (e.g. "Erratum 3.16", "V3.14 reproduction") that the glossary cannot reflect.

**Suggested fix:** Retitle for V3.25 and repoint the governance rule at LMU_V3_25_consolidated.tex, or explicitly state the glossary is version-pinned to a retired revision and where that revision can be obtained.

### 21. [MAJOR] internal-inconsistency — `LMU_companion_glossary.md:142`

**Summary:** The Frobenius-indices entry is self-contradictory and inverts the derivation it glosses: it claims the stiff t^(-1/2) branch "has no slot on the menu" of allowed Frobenius behaviors, but if a branch were not an allowed local solution no vanishing-amplitude condition would be needed — the governing .tex says the Frobenius index menu at a radiation bang is {0, -1/2}, i.e. the stiff branch IS on the menu, which is exactly why condition G2-c must be imposed by hand.

**Evidence:**

> Lines 141-143: "**Frobenius indices** — the short menu of behaviors a field is even *allowed* to have at t = 0. The stiff t^(−1/2) branch has no slot on the menu, so its amplitude must vanish on the surface — that is condition G2-c". The .tex (LMU_V3_25_consolidated.tex line 1486) states: "the scalar's Frobenius indices at a radiation bang are $\{0,-1/2\}$, so admissibility costs exactly one extra condition (the $t^{-1/2}$ stiff-branch amplitude vanishes on $\Sigma$...)". The "no slot" language belongs to the separate Gover–Kopinski–Waldron trace-slot argument (.tex line 1488: "the stiff branch ($\sim t^{-6}$) has no slot"), a different derivation the gloss conflates with Frobenius.

**Suggested fix:** Rewrite as: the Frobenius menu at t=0 has exactly two slots, {0, -1/2}; the stiff -1/2 slot is allowed by the local analysis, so admissibility must add one condition — its amplitude is set to zero on the surface (G2-c). The independent 'no slot' (GKW) argument is what makes G2-c 'doubly derived'.

### 22. [minor] internal-inconsistency — `LMU_companion_glossary.md:8`

**Summary:** The Tag rule enumerates a tag vocabulary ([Fact]/[Hyp]/[Design]/[Open]/[Dead]) that matches neither the governing .tex's declared tag menu nor the repo's metadata, omitting [Fact-theory], [Spec], and [Auditor] — and the glossary's own flagship example (2.69σ) is an [Auditor]-tagged claim in the .tex, a tag with no slot in the glossary's list; the glossary also restates tagged claims (2.69σ, ρ=−0.894, a=0.99 peak, +0.22 dex) with no tag attached, violating its own rule.

**Evidence:**

> Lines 7-8: "every claim keeps its [Fact]/[Hyp]/[Design]/[Open]/[Dead] tag when restated in words." The .tex tag legend (line 54) declares: "Tags: \Fact measured/peer-reviewed \factth established theory \Hyp literature support \Spec no equations yet \Design structural choice \Open unsolved \Dead failed \Auditor editor addition" (rendered [Fact], [Fact-theory], [Hypothesis], [Spec], [Design], [Open], [Dead], [Auditor]); ABOUT_AND_TAGS.md line 108 uses "[Fact-eq] / [Hypo]". grep finds zero occurrences of a rendered "[Hyp]" tag in the .tex; the 2.69σ figure the glossary quotes (lines 7, 35) is tagged \Auditor in the .tex (line 494). No glossary entry carries any tag.

**Suggested fix:** Align the enumerated tag set with the .tex legend (add [Fact-theory], [Spec], [Auditor]; spell [Hypothesis] or [Hypo] consistently), and either tag the restated claims in the entries or reword the rule to defer tagging to the .tex as the closing note (lines 164-165) does.

### 23. [minor] clarity — `LMU_companion_glossary.md:151`

**Summary:** The P(k) entry glosses A_s as "the overall amplitude (~10⁻⁵ contrast)", inviting the misreading A_s ≈ 10⁻⁵ when the governing document's target is A_s = 2.1×10⁻⁹; the ~10⁻⁵ figure is the density contrast δ ≈ √A_s ≈ 4.6×10⁻⁵, a 4-orders-of-magnitude conflation in a document whose own header declares "significant figures are sacred".

**Evidence:**

> Line 151: "A_s is the overall amplitude (~10⁻⁵ contrast)". The .tex (line 1300) gives the target as "$A_s=2.1\times10^{-9}$"; sqrt(2.1e-9) = 4.58×10⁻⁵ is the contrast level. The parenthetical attaches the contrast number directly to A_s.

**Suggested fix:** Reword: "A_s is the overall power amplitude (2.1×10⁻⁹, corresponding to ~10⁻⁵ density contrast)".

### 24. [nit] typo — `LMU_companion_glossary.md:17`

**Summary:** The log₁₀ entry drops the argument ("log₁₀ = 122" should be "log₁₀ x = 122"), and the lead-in "counts *digits*" is off by one (a number with log₁₀ x = 122, i.e. 1 followed by 122 zeros, has 123 digits).

**Evidence:**

> Line 17: "**log₁₀ x** — counts *digits*, not size. log₁₀ = 122 means \"a 1 with 122 zeros.\""

**Suggested fix:** Write "log₁₀ x = 122" and gloss as "counts zeros" or "counts orders of magnitude" rather than digits.

---

## 5. LMU_Companion_draft_v0.1.md (per-file review)

**Reviewer's overall assessment:** A carefully constructed, unusually self-consistent document for its size: nearly all recomputable arithmetic checks out (Hawking lifetime 2.10×10^100 yr, m = 0.804 H0 = 1.16×10^-33 eV, the 10^14.6 entropy rate, e-fold conversions, Nariai coefficient ratio, dex conversions, quantum-breaking budget scaling, M87 tension factors), the section structure matches the contents listing, and the appendix's "carried verbatim" claim is diff-verified true. The two material defects are structural staleness — the repeatedly declared "sole authoritative source" LMU_V3_13_consolidated.tex does not exist in the repo (which holds V3.25) — and one unreproducible headline number (the CPL w = +1.24 at a = 10, which follows from neither parameter set the file prints); the remaining findings are factor-2-level arithmetic slips and small internal inconsistencies that matter mainly because the document's own stated standard is that every number be recomputable.

### 25. [MAJOR] broken-reference — `LMU_Companion_draft_v0.1.md:10`

**Summary:** The declared sole authoritative source, LMU_V3_13_consolidated.tex, does not exist in the repository (which contains LMU_V3_25_consolidated.tex), so the companion's entire governance rule points at a missing file.

**Evidence:**

> Line 10: "`LMU_V3_13_consolidated.tex`. That file is the **sole authoritative source**." Repeated at lines 3, 773, and 940. `ls /home/user/Loop-Mega-Universe/` shows only `LMU_V3_25_consolidated.tex` and `LMU_V3_25_consolidated.pdf`; `find -iname "*3_13*"` returns nothing.

**Suggested fix:** Repoint the authority references (lines 3, 10, 773, 940 and the V3.13 mentions at lines 463, 771) to LMU_V3_25_consolidated.tex, or state explicitly that the companion describes the frozen V3.13 pass and where that file can be obtained.

### 26. [MAJOR] math-error — `LMU_Companion_draft_v0.1.md:337`

**Summary:** The CPL extrapolation "w = +1.24 at a = 10" is not reproducible from either (w0, wa) pair given in the file: the DESI central values give w(10) = +4.74 and the framework's fitted point gives w(10) = +0.44 (which is not even unphysical).

**Evidence:**

> Line 337: "past a = 1 it gives w = +1.24 at a = 10, which is unphysical". Recomputed with w(a) = w0 + wa(1−a): DESI central (w0 = −0.838, wa = −0.62, lines 318–319) gives −0.838 + (−0.62)(−9) = +4.742; the framework point (w0 = −0.91, wa = −0.15, lines 312–313) gives +0.44. +1.24 at a = 10 implies (w0, wa) ≈ (−0.848, −0.232), a pair printed nowhere in the document.

**Suggested fix:** Recompute and state which (w0, wa) the extrapolation uses; with the framework's own CPL point the "unphysical" claim (w > +1) is first reached only near a ≈ 14, so the sentence needs both the number and the parameter set fixed.

### 27. [minor] math-error — `LMU_Companion_draft_v0.1.md:239`

**Summary:** The upper end of "0.56–2.26 misaligned mergers" cannot be derived from the spin-walk formula quoted in the same sentence: with a = a0/sqrt(1+N) and a* >= 0.8, N <= (a0/0.8)^2 − 1 <= 0.5625 for any physical a0 <= 1; the companion drops the .tex's qualifier that the 2.26 assumes an accretion re-spin lift of ×1.45.

**Evidence:**

> Lines 238–241: "Run the spin walk backwards (a = a₀/√(1+N), Hughes & Blandford 2003) and a★ ≥ 0.8 allows at most **0.56–2.26 misaligned mergers...". Recomputed: a0 = 0.998 (Thorne) gives N_max = 0.556; N = 2.26 requires a0 ≈ 1.44 (super-extremal). The governing .tex (LMU_V3_25_consolidated.tex line 330) states "upper: walk allowing accretion re-spin, lift ×1.45" — (0.998×1.45/0.8)² − 1 = 2.27 — a condition this file omits.

**Suggested fix:** Add the re-spin qualifier, e.g. "0.56 (pure walk from a0 = 0.998) to 2.26 (allowing accretion re-spin, lift ×1.45)".

### 28. [minor] internal-inconsistency — `LMU_Companion_draft_v0.1.md:460`

**Summary:** The same "full program" residue tier is given as 3.1×10⁻¹⁸¹ in section (iv) but is said to "re-derive" at ε′_crit = 6.3×10⁻¹⁸¹ in section (v) — a factor-2 discrepancy presented as agreement, with no reconciliation.

**Evidence:**

> Line 376–377: "the full program tolerates a residue no larger than |V_min|/ρ_DE ≈ 3.1×10⁻¹⁸¹"; line 459–460: "the program tier re-derives at ε′_crit = 6.3×10⁻¹⁸¹". 6.3/3.1 ≈ 2.03. The .tex carries both numbers with the same "re-derives the full-program tier... the same arithmetic, inverted" language, so the factor 2 is unexplained there too, but the companion asserts the match without flagging it.

**Suggested fix:** Either explain the factor-2 relation between |V_min|/ρ_DE and ε′_crit (e.g. a definitional factor) or stop describing the two numbers as re-derivations of the same tier.

### 29. [minor] math-error — `LMU_Companion_draft_v0.1.md:313`

**Summary:** The claim that wₐ = −0.15 matches the thawing relation "to 4%" is not reproducible: −1.5(1+(−0.91)) = −0.135, giving a 10–11% discrepancy from −0.15 (7% even against the rounded −0.14).

**Evidence:**

> Lines 312–314: "w₀ = −0.91, wₐ = −0.15, matching the thawing-class relation wₐ ≈ −1.5(1+w₀) = −0.14 to 4%". Recomputed: |−0.15 − (−0.135)|/0.135 = 11.1%; |−0.15 − (−0.14)|/0.14 = 7.1%. No reading of the printed significant figures yields 4%, in a document whose stated rule is "Numbers are exact. Significant figures are sacred."

**Suggested fix:** Recompute the percentage from the unrounded run values, or restate as "to ~10%".

### 30. [minor] internal-inconsistency — `LMU_Companion_draft_v0.1.md:684`

**Summary:** Section (vii) defines the acceleration window as "a ≈ 0.6 to a few–20", contradicting section (iv), which states acceleration ends at a ≈ 2.91 (fiducial) with the cross-validation bracket a ∈ (0.61, 5.5); per the governing .tex, "few–20" is the first A = 0 crossing of the field, not the acceleration window.

**Evidence:**

> Line 684: "scoped to the acceleration window only (a ≈ 0.6 to a few–20)" versus lines 296–297: "acceleration ends at a ≈ 2.91... brackets the accelerating window at a ∈ (0.61, 5.5)". LMU_V3_25_consolidated.tex line 516: "acceleration window a∈(0.61, 5.5); first A=0 crossing at a=9.4 (μ-dependent, ``few--20'' across the verified band)".

**Suggested fix:** Change the parenthetical to the stated window (a ≈ 0.6 to ~3–5.5), or rescope the isolation claim to the field's first zero-crossing if that is what is meant.

### 31. [minor] math-error — `LMU_Companion_draft_v0.1.md:344`

**Summary:** The tsunami gloss's own arithmetic is off by a factor of 2: 30 cm on 4 km of water is a relative ripple of 7.5×10⁻⁵, not "roughly 1.5×10⁻⁴".

**Evidence:**

> Lines 343–344: "about 30 cm tall on water 4 km deep — a relative ripple of roughly 1.5×10⁻⁴". Recomputed: 0.3 m / 4000 m = 7.5×10⁻⁵.

**Suggested fix:** Either change the ratio to ~7.5×10⁻⁵ or the wave height to ~60 cm.

### 32. [nit] internal-inconsistency — `LMU_Companion_draft_v0.1.md:778`

**Summary:** The appendix's tag rule uses tag names ([Hyp], [Dead]) that differ from the seven official tags defined at lines 68–77 ([Hypothesis], [Dead-end]) and omits [Fact-theory] and [Auditor], despite the document's "Tags travel" rule.

**Evidence:**

> Line 778: "[Fact]/[Hyp]/[Design]/[Open]/[Dead] tag when restated in words" versus the tag table (lines 68–77) defining [Fact], [Fact-theory], [Hypothesis], [Design], [Open], [Dead-end], [Auditor].

**Suggested fix:** Harmonize the appendix tag names with the table (the appendix is carried verbatim from LMU_companion_glossary.md, so the fix belongs in both).

### 33. [nit] internal-inconsistency — `LMU_Companion_draft_v0.1.md:65`

**Summary:** The header reading rule lists six epistemic tags while the tag-system section says every claim carries "one of seven tags" (the header list omits [Auditor]).

**Evidence:**

> Line 65: "Every claim in the framework carries one of seven tags" versus lines 15–16: "its epistemic tag — [Fact], [Fact-theory], [Hypothesis], [Design], [Open], [Dead-end] — even in plain prose" (six tags listed).

**Suggested fix:** Add [Auditor] to the header list or say "one of six author tags plus the [Auditor] editor tag".

---

## 6. Metadata pack: CHANGELOG.md / CITATION.cff / LICENSE / LICENSE-docs

**Reviewer's overall assessment:** The metadata files are structurally sound — CITATION.cff is valid YAML that satisfies CFF 1.2.0 required fields (the inline '# <-- confirm' comment is legally placed and leaves license parsing as exactly 'CC-BY-4.0'), the MIT and CC BY 4.0 license texts are standard and correct, and the DOI pair (concept 20692157 / version 20692158) is internally consistent. The real problems are staleness and phantom content: the changelog stops at v3.17 despite a v3.25 deposit dated 2026-07-02 (violating its own 'records deposit events' rule), both license documents and the changelog footer assert MIT-licensed Python code that does not exist anywhere in the repository (leaving a root MIT LICENSE that covers nothing and will mislabel the repo on GitHub), and the figure count (21) and named tex file (V3_13) no longer match the 22-figure V3.25 repository state.

### 34. [MAJOR] stale-content — `CHANGELOG.md:10`

**Summary:** Changelog violates its own stated rule ('records deposit events'): the latest entry is v3.17 (2026-06-24), but the repo is at V3.25, deposited/released 2026-07-02 per CITATION.cff, so at least one deposit event (and an implied v3.21 milestone, cf. figs/lmu_v321_loop_cascade.png) is unrecorded.

**Evidence:**

> Latest entry header: '## v3.17 — 2026-06-24'. Header rule (lines 4-6): 'this file records deposit events'. CITATION.cff declares version: "3.25", date-released: "2026-07-02" with the same Zenodo concept DOI, and the repo contains only LMU_V3_25_consolidated.tex/.pdf — no v3.25 (or v3.18–v3.24) entry exists.

**Suggested fix:** Add a v3.25 — 2026-07-02 entry (and any intermediate deposits, e.g. v3.21) recording the new version DOI and the updated 22-figure set.

### 35. [MAJOR] factual-error — `LICENSE-docs:34`

**Summary:** Claims the repository contains MIT-licensed Python scripts, but the repo contains no code files of any kind (no .py, .sh, .ipynb — only .md, .tex, .pdf, .png, .cff), so the root MIT LICENSE covers nothing and GitHub's license detection will badge this CC-BY-4.0 documents repo as 'MIT'.

**Evidence:**

> 'The code in this repository (Python scripts) is licensed separately under the MIT License; see the LICENSE file.' — verified with find: zero non-document files exist outside .git. CHANGELOG.md:50 repeats the claim ('Documents CC-BY-4.0; code MIT.').

**Suggested fix:** Either remove the MIT LICENSE and the 'code MIT' claims until code actually exists, or reword to 'any code added to this repository will be MIT-licensed'; consider making LICENSE the CC-BY-4.0 grant so GitHub badges the repo correctly.

### 36. [minor] stale-content — `CITATION.cff:19`

**Summary:** The license line carries a leftover pre-release TODO comment ('confirm or replace before first tagged release') even though multiple releases/deposits have shipped (v3.13 on 2026-06-14 through v3.25 on 2026-07-02); the comment is valid YAML and does not corrupt the field.

**Evidence:**

> 'license: CC-BY-4.0   # <-- confirm or replace before first tagged release' — yaml.safe_load returns license == 'CC-BY-4.0' exactly (whitespace before '#' in a plain scalar starts a comment per YAML spec), so the value is intact but the editorial placeholder is stale in published citation metadata.

**Suggested fix:** Delete the trailing comment; the license value itself is fine and SPDX-valid.

### 37. [minor] metadata — `CITATION.cff:3`

**Summary:** 'type: dataset' mislabels the work — this is a scholarly text/framework document (tex/pdf/markdown plus figures), not a dataset; citation tooling will render it as '[Data set]'.

**Evidence:**

> 'type: dataset' — CFF 1.2.0 only permits 'software' or 'dataset' at top level; the repo's actual content is LMU_V3_25_consolidated.tex/.pdf and companion markdown documents, with no data files.

**Suggested fix:** Keep a top-level type but add a preferred-citation block with type: report (or generic/article) so citers get the correct work type.

### 38. [minor] stale-content — `CHANGELOG.md:28`

**Summary:** The changelog's only figure-count statement ('21 figures, unchanged set') no longer matches the repository: figs/ contains 22 PNGs and the current V3.25 tex \includegraphics all 22 of them.

**Evidence:**

> 'Files: `LMU_V3_17_consolidated.tex`, `LMU_V3_17_consolidated.pdf` (21 figures, unchanged set).' — ls figs | wc -l = 22; grep of LMU_V3_25_consolidated.tex shows 22 unique includegraphics targets, including lmu_v321_loop_cascade.png added after v3.17.

**Suggested fix:** Record the figure-set change (21 -> 22) in the missing v3.21/v3.25 changelog entries.

### 39. [minor] broken-reference — `LICENSE-docs:4`

**Summary:** The license grant names 'LMU_V3_13_consolidated.tex' as the covered document, but that file no longer exists in the repo (current file is LMU_V3_25_consolidated.tex).

**Evidence:**

> 'The documents in this repository — including LMU_V3_13_consolidated.tex, the companion, the glossary, and all figures —' ; ls of repo root shows only LMU_V3_25_consolidated.tex/.pdf.

**Suggested fix:** Use version-neutral wording, e.g. 'including the consolidated LMU .tex/.pdf, the companion, the glossary, and all figures'.

### 40. [nit] internal-inconsistency — `CHANGELOG.md:50`

**Summary:** Footer asserts 'code MIT' although the repository contains no code, echoing the same unfounded claim as LICENSE-docs lines 33-35.

**Evidence:**

> 'Documents CC-BY-4.0; code MIT.' — verified via find: no .py or other code files exist anywhere in the repo.

**Suggested fix:** Drop 'code MIT' (or qualify it as prospective) until code is actually present.

---

## 7. Robotic_Mining_Architecture_Notes.md (per-file review)

**Reviewer's overall assessment:** The file explicitly declares itself standalone from the LMU cosmology framework (line 3), so its presence in the repo is self-explained, and it is unusually disciplined for informal notes: epistemic tags, an append-only progress log, and a watch list with fold-triggers. Core physics numbers check out (escape velocities 11.2/2.4/5.0 km/s, 0.16g/0.38g, ~26-month synodic windows, 1.3 s one-way lunar light time) and the mission/industry claims I could check against the record (VIPER cancellation, IM-2 tip-over, CADRE/IM-3 Reiner Gamma, Queqiao relay, Interlune DOE 3 L He-3 deal) are consistent. The real defects are a dangling reference to a nonexistent "§9.8" of the cosmology work, an understated Mars distance ratio ("~100×" vs an actual ≥142×), systematic use of the one-way delay where the round-trip control loop applies, and several tag-discipline inconsistencies that matter mainly because the document's credibility rests on its tagging system.

### 41. [MAJOR] broken-reference — `Robotic_Mining_Architecture_Notes.md:112`

**Summary:** References "the cosmology work's §9.8", but no section 9.8 exists anywhere in the repository, so a reader cannot follow the citation.

**Evidence:**

> "consistent with the author’s rule and with the cosmology work’s §9.8 spirit (compose existing tools; a step demanding a brand-new primitive is a red flag)" — grep for "9.8" across all repo .md files matches only this line; LMU_V3_25_consolidated.tex contains only 7 \subsection commands in the entire document (max 3 consecutive within one section), so no compiled section can be numbered 9.8, and the quoted "red flag / brand-new primitive" phrasing appears nowhere in the tex.

**Suggested fix:** Fix the section number to the actual LMU section intended, or replace with a section title so the pointer is resolvable.

### 42. [minor] factual-error — `Robotic_Mining_Architecture_Notes.md:32`

**Summary:** Mars is stated as "~100× farther" than the Moon, but even at closest approach the ratio is ~142×, and ~585× at average distance.

**Evidence:**

> "**Mars** = stockpile + next rung (near asteroid belt). Deeper well, ~100× farther" — computed: Moon mean distance 384,400 km; Mars closest ~54.6M km → 142×; Mars mean ~225M km → 585×. "~100×" understates even the best-case ratio by ~40% and the typical ratio by ~5×.

**Suggested fix:** Change to "~150–600× farther depending on orbital positions" or "hundreds of times farther".

### 43. [minor] factual-error — `Robotic_Mining_Architecture_Notes.md:45`

**Summary:** The document consistently uses the one-way light delay (1.3 s) as the operative teleoperation/ask-Earth delay, but the operator's control loop is the round trip, ~2.6 s; the [Fact] tag masks this conflation.

**Evidence:**

> "Teleoperation at 1.3 s works (supervised). [Fact]" (also lines 31, 54, 121: "comms delay only 1.3 s", "1.3 s is fine for non-emergency mining"). Computed: one-way Earth–Moon light time = 384,400 km / c = 1.28 s; command + telemetry round trip = 2.56 s. The teleoperator and the "stop and ask Earth" loop experience ≥2.6 s, not 1.3 s. The design conclusion survives, but the number as stated for teleoperation is the wrong quantity.

**Suggested fix:** State "1.3 s one-way / ~2.6 s round trip" once and use the round-trip figure for the teleoperation and fallback-loop claims.

### 44. [minor] internal-inconsistency — `Robotic_Mining_Architecture_Notes.md:99`

**Summary:** The [unverified] tag is used with the opposite meaning of its own legend definition.

**Evidence:**

> Legend (line 5): "[unverified] claim not source-checked." Ledger heading (line 99): "**[unverified — source-checked, not found]:**" — the legend defines the tag as 'not yet checked against sources', while the ledger applies it to a claim that WAS source-checked and failed to verify.

**Suggested fix:** Either redefine [unverified] in the legend ("no supporting source found") or introduce a distinct tag such as [not-found] for checked-but-unsupported claims.

### 45. [minor] internal-inconsistency — `Robotic_Mining_Architecture_Notes.md:82`

**Summary:** An item described as "in development" is listed under the "[Fact] demonstrated" header, contradicting the header's own criterion.

**Evidence:**

> Header (line 73): "**[Fact] demonstrated:**" contains "Grok + Tesla Optimus integration is real and in development" (line 82). "In development" is by definition not "demonstrated", and the document's own R6 note two lines later (line 86) concedes Optimus units are "not doing useful work".

**Suggested fix:** Move the Grok+Optimus item out of the 'demonstrated' list (e.g., into the [Hypothesis] or the R6 counter-expectation block).

### 46. [minor] factual-error — `Robotic_Mining_Architecture_Notes.md:77`

**Summary:** "Remote surgery" is cited as a demonstrated example of teleoperation at 1–2 s latency, but actual remote surgeries have operated at sub-second (typically sub-300 ms) latency; 1–2 s surgical teleoperation is experimental, not demonstrated practice.

**Evidence:**

> "Teleoperation at 1–2 s latency (undersea, remote surgery)" listed under "**[Fact] demonstrated:**". The landmark transatlantic 'Lindbergh operation' (2001) ran at ~155 ms round trip, and modern 5G telesurgery operates at tens of ms; surgical performance is documented to degrade sharply above ~300–700 ms.

**Suggested fix:** Drop 'remote surgery' or reword to an example genuinely demonstrated at 1–2 s (e.g., satellite-linked ROV/rover supervised teleoperation).

### 47. [minor] internal-inconsistency — `Robotic_Mining_Architecture_Notes.md:123`

**Summary:** Mars is called a "depot" here, contradicting the role assignment in §1 where Moon = depot and Mars = stockpile; and "Mars can't hold an atmosphere" is loose (Mars holds a thin ~6 mbar atmosphere; the loss argument is about a thick/terraformed one).

**Evidence:**

> "Mars can’t hold an atmosphere → use it as a *depot*, don’t terraform" vs. line 31 "**Moon** = depot + robotic mine" and line 32 "**Mars** = stockpile + next rung".

**Suggested fix:** Change 'depot' to 'stockpile/staging point' and qualify to 'can't retain a thickened atmosphere long-term'.

### 48. [nit] metadata — `Robotic_Mining_Architecture_Notes.md:110`

**Summary:** The [Design] tag is used twice but is not declared in the epistemic-tag legend.

**Evidence:**

> Legend (line 5) declares only "[Fact] … [Hypothesis] … [Speculation] … [unverified]", yet line 54 uses "[Design — exploits the short delay]" and line 110 uses "**Pitarn’s contribution [Design / hybrid]:**".

**Suggested fix:** Add [Design] to the legend on line 5.

### 49. [nit] broken-reference — `Robotic_Mining_Architecture_Notes.md:126`

**Summary:** The horizontal rule directly abuts the preceding paragraph with no blank line, so CommonMark/GitHub parses the dashes as a setext underline and renders the closing sentence as a large H2 heading instead of a paragraph followed by a rule.

**Evidence:**

> Line 125: "Consistent from entropy to excavators. That consistency is the “core” the author was after." immediately followed by line 126: "-----" (every other rule in the file is preceded by a blank line).

**Suggested fix:** Insert a blank line between lines 125 and 126.

---

## 8. LMU_V3_25_consolidated.tex — lines 1-138 (front matter, state vector, three-layer reading)

**Reviewer's overall assessment:** Lines 1-138 are carefully constructed front matter: the literature citations in range (Hawking 1975, Borde-Guth-Vilenkin 2003, Israel 1967, Carter 1971, Wald 1983, Coleman-De Luccia) are all correct, the fig:wiring reference resolves and figs/fig1_wiring.png exists, and the two-tier epistemic tagging system is applied with unusual discipline for a single-author document. The real defects are concentrated in the prologue, where two narrative physics claims carry [Fact] tags they do not earn (the 'never a fireball' no-collapse point and the forced single-survivor merger endpoint) despite line 62's assertion that the prologue's tags carry through unchanged; the only checkable number in range (the '~120 orders' separation) is stated in units inconsistent with its own table. No [Fact-eq]-style arithmetic (Hawking temperatures, evaporation times, w0/wa, etc.) appears in this range.

### 50. [MAJOR] factual-error — `LMU_V3_25_consolidated.tex:71`

**Summary:** The claim that cold matter compressed to reignition 'only collapses into a fresh black hole, never a fireball' is tagged [Fact] but is contradicted by established astrophysics.

**Evidence:**

> "Not by crushing --- cold matter squeezed dense enough to reignite only collapses into a fresh black hole, never a fireball." ... tagged "\Hyp\ / \Fact\ (the no-collapse point)". Counterexamples: a Type Ia supernova is precisely cold degenerate matter compressed to thermonuclear ignition, producing a fireball and no black hole; and in a contracting universe radiation blueshifts as T ∝ 1/a (the standard Tolman reheating of a Big Crunch), so compression does generically reheat.

**Suggested fix:** Downgrade the 'no-collapse point' tag from [Fact] to [Hypothesis], or restrict the claim explicitly to the cosmological-horizon-scale regime with an argument for why compressive reheating is excluded there.

### 51. [MAJOR] factual-error — `LMU_V3_25_consolidated.tex:65`

**Summary:** The single-survivor merging endpoint ('the hole that wins every contest') is tagged [Fact] and called 'not a matter of taste', but standard far-future cosmology gives neither a forced single survivor nor merging as the dominant channel.

**Evidence:**

> "The answer is not a matter of taste. Merging has an endpoint, and the endpoint is a single survivor: the hole that wins every contest and is finally left alone. \Fact". In LCDM's accelerating future, bound structures beyond the local group are causally isolated (no global single survivor), and within a bound system dynamical relaxation ejects the large majority of remnants to infinity rather than feeding them to the central hole (Adams & Laughlin 1997), so 'wins every contest' is not a forced endpoint.

**Suggested fix:** Tag this [Hypothesis] (or qualify: one dominant hole per bound zone, with most remnants ejected), since line 62 asserts the prologue's epistemic tags 'carry through unchanged'.

### 52. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:124`

**Summary:** The header claims two of the four listed objects are '~120 orders apart', but in the energy units of the table's own 'scale' column the maximum separation is only ~28-31 orders; ~120 holds only for energy density (fourth power), which the table never states.

**Evidence:**

> "(do not conflate; two are $\sim$120 orders apart)" versus the table scales "$\sim10^{-3}$\,eV", "trans-Planckian", "$\sim10^{16}$\,GeV": recomputed, Planck/meV = 10^31.1 and GUT/meV = 10^28.0 in energy; only the density ratios reach 10^124 (Planck^4) or 10^112 (GUT^4).

**Suggested fix:** Say '~120 orders apart in energy density' (or '~30 orders in energy scale') so the claim matches the units of the adjacent 'scale' column.

### 53. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:67`

**Summary:** Hawking evaporation is tagged [Fact] although the document's own tag key reserves [Fact] for 'measured/peer-reviewed' and provides [Fact-theory] specifically for 'established theory'; Hawking radiation has never been observed.

**Evidence:**

> Line 67: "It evaporates --- unimaginably slowly, but it goes (Hawking 1975). ... \Fact" versus the key on line 54: "\Fact\ measured/peer-reviewed \quad \factth\ established theory".

**Suggested fix:** Tag the evaporation paragraph \factth (Fact-theory), consistent with the key's own distinction.

### 54. [nit] stale-content — `LMU_V3_25_consolidated.tex:26`

**Summary:** Source comment labels the tag set 'V3.4' in a document whose version is V3.25 and whose release sequence (3.13, 3.17, 3.21, 3.25 per the repo CHANGELOG) contains no V3.4.

**Evidence:**

> "% --- V3.4 consolidated-pass tag set (capitalised) ---" while line 25 defines "\newcommand{\lmuver}{3.25}".

**Suggested fix:** Change the comment to V3.25 (or the version in which the tag set was actually introduced).

### 55. [nit] metadata — `LMU_V3_25_consolidated.tex:19`

**Summary:** Contradictory hyperref options: 'hidelinks' (suppress all link decoration) is combined with 'colorlinks=true'; the latter silently overrides the former, so 'hidelinks' is dead code.

**Evidence:**

> "\usepackage[hidelinks,colorlinks=true,linkcolor=blue!45!black,urlcolor=teal!60!black]{hyperref}"

**Suggested fix:** Drop 'hidelinks' (the colorlinks settings are what take effect).

---

## 9. LMU_V3_25_consolidated.tex — lines 139-365 (Part: the matter ladder L4-L1)

**Reviewer's overall assessment:** The matter-ladder part (lines 139-365) is in good shape overall: nearly all checkable arithmetic reproduces exactly (slow-roll epsilon=0.27 and w0=-0.82; the V3.7 spin-walk inversion N=0.56-2.27, tension factors 2.6-10.6, aligned fraction 62%; the sigma=474 km/s crossover; the M-sigma offsets for the FIELD and CLUSTER table rows; Delta a*=0.45; v_esc=600 km/s), the equation labels resolve, the four referenced ladder figures exist in figs/, and the self-auditing (unit flags, superseded-anchor footnote, provenance census) is unusually disciplined. The real defects are a systematic off-by-one in hard-coded section references (two broken \S10 pointers to the Attribution table, plus a likely \S9-for-\S8), an internally inconsistent recoil pair (the displayed v_m formula peaks at ~215 km/s, not the \Fact-tagged ~175 km/s, because the (1+B*eta) factor was dropped), a non-reproducible +0.24 dex NGC 1277 residual, and a never-defined sigma_0 on which a quoted audit number silently depends.

### 56. [MAJOR] broken-reference — `LMU_V3_25_consolidated.tex:271`

**Summary:** Hard-coded cross-reference "(\S10)" points to the Attribution table, not the testable-prediction section; the observational tests live in \S9 (Falsifiers) — same defect recurs at line 318.

**Evidence:**

> Line 271: "which makes it a testable prediction (\S10), not a fudge"; line 318: "a use with a concrete observational target (\S10)". In this part \S10 is "\section{Attribution}" (line 338), which contains only a source table; the relic-spin test referred to is in \S9 "\section{Falsifiers}" (line 329).

**Suggested fix:** Change both \S10 references to \S9 (or use \label/\ref instead of hard-coded numbers).

### 57. [MAJOR] internal-inconsistency — `LMU_V3_25_consolidated.tex:201`

**Summary:** The \Fact-tagged claim that the non-spinning recoil "peaks at ~175 km/s" does not follow from the recoil formula the document itself states: as written (line 198), v_m peaks at ~215 km/s.

**Evidence:**

> Line 198 gives v_m = A_kick η² (1−q)/(1+q) with A_kick = 1.2×10⁴ km/s (line 201); maximizing over q gives 214.7 km/s at q≈0.38 (computed). The literature value 175.2 km/s (González et al. 2007) requires the omitted factor (1+Bη), B≈−0.93, which restores the peak to 175.2 km/s at q≈0.36. The text asserts "the non-spinning recoil peaks at $\sim$175 km\,s$^{-1}$" under a \Fact tag while displaying the truncated formula.

**Suggested fix:** Either add the (1+Bη) factor to v_m or note that the displayed simplified form overestimates the peak (~215 km/s) and that 175 km/s is the full fitting-formula value.

### 58. [minor] broken-reference — `LMU_V3_25_consolidated.tex:153`

**Summary:** "The honest accounting is gathered in \S9" points at the Falsifiers section; the accounting described (calibration vs prediction, no ΛCDM discrimination) is \S8 — same off-by-one pattern as the \S10 errors.

**Evidence:**

> Line 153: "The honest accounting is gathered in \S9." \S9 is "Falsifiers" (line 329); the content matching the sentence — "It does not beat $\Lambda$CDM... It does not predict absolute masses... circular" — is \S8 "What this model is for --- and what it cannot do" (line 317).

**Suggested fix:** Change \S9 to \S8, or replace hard-coded section numbers with \ref.

### 59. [minor] math-error — `LMU_V3_25_consolidated.tex:260`

**Summary:** The parenthesised observed offset "+0.24 dex" for the corrected NGC 1277 anchor is not reproducible with the McConnell–Ma M–σ relation the table itself uses.

**Evidence:**

> Footnote: "The parenthesised observed offset ($+0.24$~dex) is the corrected anchor's M--$\sigma$ residual." With McConnell–Ma 2013 (log M = 8.32 + 5.64 log(σ/200), the document's declared \Msig source, lines 174/216), the residual of 4.9×10⁹ M_sun is +0.38 dex at the row's own σ=300 (the σ that reproduces the same row's model offset +0.99) and +0.12 dex at the published σ≈333; +0.24 requires σ≈317 or a different calibration (e.g. Kormendy–Ho).

**Suggested fix:** State which σ and which M–σ calibration produce +0.24, or recompute the residual consistently with the table's σ=300 / McConnell–Ma convention.

### 60. [minor] clarity — `LMU_V3_25_consolidated.tex:177`

**Summary:** σ₀ in the merger-rate law is never assigned a value anywhere in the document, yet the "coincide only at σ≈474 km/s" audit number (line 205) silently assumes σ₀=200 km/s.

**Evidence:**

> Line 177: "\Gamma_{\rm mrg}=K_{\rm mrg}\,n_{\rm gal}\,\Big(\frac{\sigma}{\sigma_0}\Big)^{-1}"; grep shows σ₀ appears only at lines 177, 205, 1183 with no numeric definition. Line 205's crossover reproduces exactly as 200×√(0.45/0.08)=474.3 km/s, so σ₀=200 km/s is implied but nowhere stated.

**Suggested fix:** Add σ₀=200 km/s to the coefficient table or to the equation.

### 61. [minor] broken-reference — `LMU_V3_25_consolidated.tex:295`

**Summary:** Reference to "the \S5.2 protection" targets a subsection that does not exist — \S5 has no numbered subsections, only an itemize list.

**Evidence:**

> Line 295: "the recoil sink acting only on low-mass merger products (the \S5.2 protection, applied at the population level)". Section 5 ("What emerges", line 266) contains a three-bullet itemize with no \subsection commands; the protection result is its second bullet (line 270).

**Suggested fix:** Change to "the \S5 survivor-protection result" or number the bullets.

### 62. [minor] label-discipline — `LMU_V3_25_consolidated.tex:271`

**Summary:** The third structural-result bullet ("Over-massiveness is forced, not chosen") carries no \Fact/\Hyp tag, while its two sibling bullets are both tagged \Hyp.

**Evidence:**

> Bullets at lines 269 and 270 end "...its carry-through/C5 signature). \Hyp" and "...the survivor argument otherwise only asserts. \Hyp"; the bullet at line 271 ends "...a testable prediction (\S10), not a fudge." with no tag, despite making the same class of load-bearing claim.

**Suggested fix:** Append \Hyp to the third bullet.

### 63. [nit] internal-inconsistency — `LMU_V3_25_consolidated.tex:187`

**Summary:** The spin random walk is written a₀/√N here but a₀/√(1+N) in the Falsifiers section (line 330); only the √(1+N) form is consistent with the Γ/(1+N) term in eq. (5) and the C_mrg=1/2 derivation.

**Evidence:**

> Line 187: "random-walk it down as $a_\ast\!\approx\!a_0/\sqrt N$"; line 330: "the spin walk $a=a_0/\sqrt{1+N}$ (Hughes \& Blandford 2003)". The line-330 inversion arithmetic (N ≤ 0.56–2.26, tension 2.6–10.6, aligned fraction ≥62%) reproduces only with the 1+N form.

**Suggested fix:** Write a₀/√(1+N) at line 187 as well.

### 64. [nit] citation — `LMU_V3_25_consolidated.tex:199`

**Summary:** Starvation quenching is attributed to Bullock et al. (2000), whose paper is about reionization suppression of galactic satellites; the canonical starvation/strangulation references are Larson, Tinsley & Caldwell (1980) or Balogh, Navarro & Morris (2000).

**Evidence:**

> Line 199: "quench $\iff M_g\to0\ \Rightarrow\ \dot\Mbh^{\rm acc}\to0$ (starvation; Bullock et al.\ 2000)"; repeated in the Attribution table (line 351): "Starvation quenching & Bullock et al.\ (2000)". Bullock, Kravtsov & Weinberg (2000) is "Reionization and the Abundance of Galactic Satellites", a satellite-suppression paper, not the origin of starvation quenching.

**Suggested fix:** Cite Larson et al. (1980) and/or Balogh et al. (2000) for starvation, or keep Bullock et al. (2000) only for the dwarf-suppression context.

---

## 10. LMU_V3_25_consolidated.tex — lines 366-618 (Part: the dark-energy field A / DESI)

**Reviewer's overall assessment:** The numerics in this part are unusually reproducible for a self-published framework: independent re-integration of the Klein-Gordon+Friedmann system reproduced the entire m-scan table (all six rows to the quoted 3 decimals), the six-potential Result 4 table, Run 2's shooting values (m=0.804, w0=-0.907, wa=-0.146, window 0.61-5.5, first crossing a=9.39), and the chain-Gaussian statistics (LambdaCDM 3.04 sigma, thawing minimum 2.68 sigma at m=0.62, matching the stated 2.69 sigma at m~0.61); referenced figures all exist and the label discipline is generally careful. The two substantive defects are Result 2's [Fact]-tagged endgame numbers at a=20.6, which match no run in the part and equal a naive matter-dilution extrapolation from a=1 (off by 25x in rho_DE and 4x in H versus the pinned field), and an unlabeled mixing of the m=1.0 fiducial with the pinned m~0.80 model that produces a direct contradiction on when acceleration ends (a~2.9 vs the pinned window ending at 5.5). Remaining findings are structural pointer errors and small slips.

### 65. [CRITICAL] factual-error — `LMU_V3_25_consolidated.tex:418`

**Summary:** Result 2's [Fact]-tagged endgame numbers at a=20.6 are not the output of the model's own integration for any mass used in this part; they are exactly the naive a^{-3/2}/a^{-3} extrapolations of the a=1 values, and they contradict Run 2's own 'first A=0 crossing at a=9.4'.

**Evidence:**

> Quoted: "Integrated to $a=20.6$: the oscillation envelope decays $0.34\to0.004$; $\rho_{\rm DE}\!:2.07\to2.6\times10^{-4}$; $\rho_m\to10^{-4}$; $H\!:1.0\to0.011$. Power laws $\rho\propto a^{-3.00}$... \Fact". Re-integration (Radau, rtol 1e-10) of the pinned field (m=0.804, A_i=2.70, line 378/516) gives at a=20.6: rho_DE=6.6e-3 (25x the quoted 2.6e-4), H=0.047 (4.3x the quoted 0.011), |A| envelope ~0.14-0.20 (~40x the quoted 0.004), local rho_A slope -2.74 (not -3.00). The m=1.0 scan run gives rho_DE=1.4e-3, H=0.023, envelope ~0.03-0.08 — still far off. The quoted triple equals matter-like dilution from a=1 (0.34*20.6^{-1.5}=0.0036; 2.07*20.6^{-3}=2.37e-4; 20.6^{-1.5}=0.0107), impossible for a field that only starts oscillating at a≈9.4 (line 516, verified: first crossing a=9.39; envelope max 0.33 at a≈10-13).

**Suggested fix:** Re-run the endgame integration with the pinned parameters and quote the actual a=20.6 state (or extend the integration until matter-like dilution genuinely sets in and quote that epoch), or state explicitly which run these numbers came from.

### 66. [MAJOR] internal-inconsistency — `LMU_V3_25_consolidated.tex:376`

**Summary:** The five-stage summary says acceleration ends 'near a≈2.9' while pairing it with w0≈-0.91 — but for the pinned m≈0.80 field acceleration ends at a≈5.5, as the pin record two sentences later (line 378) and Run 2 (line 516) both state; a≈2.9 belongs to the m=1.0 scan row.

**Evidence:**

> Line 376: "(3) Today ... $w_0\approx-0.91$ ... (4) Crest and descent. $w$ rises through $-1/3$ and the acceleration ends (near $a\approx2.9$)". Line 378: "Pinned values (R6, none inherited): $m\approx0.80\,H_0$ ... $w_0\approx-0.91$ ... acceleration window $a\in(0.61,5.5)$". Verified by integration: m=0.804, A_i=2.70 gives w0=-0.907 and acceleration ending at a=5.49; m=1.0 (w0=-0.857) gives a=2.92.

**Suggested fix:** In stage (4) write 'near a≈5.5' (or label a≈2.9 as the m=1.0 fiducial of the verification record, distinct from the pinned m≈0.80 model).

### 67. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:439`

**Summary:** Result 3's CPL-extrapolation figures are computed from the m=1.0 row's (w0,wa)=(-0.857,-0.233) but are attributed to 'our (w0,wa)', which the part's pin record defines as (-0.91,-0.15); with the pinned pair the numbers are wrong.

**Evidence:**

> Quoted: "with our $(w_0,w_a)$ it gives $w(a{=}5)=+0.08$, $w(a{=}10)=+1.24$". Recomputed: with (-0.857,-0.233) [m=1.0 row]: w(5)=-0.857+0.932=+0.075, w(10)=+1.24 (matches); with the pinned (-0.91,-0.15) [lines 378, 516]: w(5)=-0.31, w(10)=+0.44. Result 3's other values (a=0.3:-4.90 ... peak a=0.99, end a=2.91) likewise reproduce only for m=1.0, which the section never states.

**Suggested fix:** State that Result 3 uses the m=1.0 fiducial, or recompute with the pinned (w0,wa).

### 68. [minor] broken-reference — `LMU_V3_25_consolidated.tex:370`

**Summary:** The header box says '§9--11 carry the archived module's own PNGB cross-audit, honest status, and attribution', but in this part those items span §§9--13: Honest status is §12 and Attribution is §13.

**Evidence:**

> Quoted: "\S9--11 carry the archived module's own PNGB cross-audit, honest status, and attribution." Actual \section sequence after \setcounter{section}{0} (line 367): §9 line 527 (PNGB cross-audit), §10 line 531, §11 line 539 (Computation), §12 line 578 (Honest status), §13 line 590 (Attribution). Line 378's "follow in \S\S1--13" confirms 13 sections.

**Suggested fix:** Change to \S\S9--13.

### 69. [minor] stale-content — `LMU_V3_25_consolidated.tex:582`

**Summary:** The Honest-status bullet discusses 'the z_aeon result' and cites '3.4's scoping', but no §3.4 exists in this part and the z_aeon apparatus is not carried here (it was relocated to the Operator B'/Part VII sections in V3.5), leaving a dangling reference from the archived module; line 614's bottom line likewise still claims this module 'shows ... z_aeon is undeterminable'.

**Evidence:**

> Quoted: "The $z_{\rm aeon}$ result is an impossibility argument, not a calculation; it rests on ... 3.4's scoping of the boundary to the massless channel." This part has only top-level §§1--13 with no subsection 3.4 and no z_aeon computation; line 528 says only "its Part II \S\S1--2" of the archived module is carried, and line 866 states the entropy/boundary section was "Relocated from the archive's dark-energy module in V3.5".

**Suggested fix:** Drop or repoint the bullet (and the z_aeon clause in the line-614 summary) to the relocated section in the Operator B' part.

### 70. [minor] math-error — `LMU_V3_25_consolidated.tex:465`

**Summary:** The invariance claim 'every potential lands in w0∈[-0.81,-0.99]' is contradicted by the table's own first row (w0=-0.806, outside the stated interval), and the interval endpoints are written in reversed order.

**Evidence:**

> Quoted: "every potential lands in $w_0\in[-0.81,-0.99]$"; table line 458: "Quadratic $\tfrac12 m^2A^2$, $m{=}1$, $A_i{=}2$ & $-0.806$" (verified by re-integration: w0=-0.8057, so -0.806 > -0.81 lies outside [-0.99,-0.81]).

**Suggested fix:** Write $w_0\in[-0.99,-0.81]$ and round the bound to $-0.80$, or restate as $w_0\in[-0.99,-0.80]$.

### 71. [nit] typo — `LMU_V3_25_consolidated.tex:516`

**Summary:** Run 2 calls the first-crossing epoch 'μ-dependent', but the field mass is denoted m throughout this part; μ is never defined in it.

**Evidence:**

> Quoted: "first $A=0$ crossing at $a=9.4$ ($\mu$-dependent, ``few--20'' across the verified band)" — the same sentence uses $m=0.804\,H_0$ for the mass, and grep finds no other $\mu$ in lines 366--618.

**Suggested fix:** Change $\mu$-dependent to $m$-dependent.

### 72. [nit] factual-error — `LMU_V3_25_consolidated.tex:437`

**Summary:** The honest caveat quantifies the acceleration hump as 'a ~5% variation in ä/a across a=0.85--1.2', but for the run whose numbers Result 3 quotes (m=1.0) the variation is ~6.5-7% (and ~13% for the pinned m=0.804 run).

**Evidence:**

> Quoted: "(a $\sim$5\% variation in $\ddot a/a$ across $a=0.85$--$1.2$)". Recomputed for m=1.0: ä/a ranges 0.3614--0.3867 over a∈[0.85,1.2], i.e. 6.5% of the peak; for m=0.804: 0.388--0.445, 12.8%.

**Suggested fix:** Say ~7% (m=1.0 run) or recompute for the pinned run.

---

## 11. LMU_V3_25_consolidated.tex — lines 619-802 (Part: closure of the loop, the L0 ledger)

**Reviewer's overall assessment:** The L0 ledger module (lines 619-802) has strong quantitative hygiene: every headline [Fact-eq]-style number I could recompute checks out to the quoted precision (Hawking tau = 2.1x10^67 (M/Msun)^3 yr, S_BH(10^11 Msun) = 1.05x10^99 k_B, T_H(10^12 Msun) = 6.2x10^-20 K, M_Nariai = 1.7x10^22 Msun with the sqrt(27)/2 coefficient correction, p(f=0.016) = 0.044 with growth x443 per interlude, pair threshold 1.19x10^10 K, the X/14.6 exhaustion counts, and the 10^85-10^89 collapse-vs-evaporation race), and the cited references (Page 1976, Zurek 1982, Antonov/Lynden-Bell-Wood, GW250114 in PRL 135, 111403) are apt. Defects found are internal inconsistencies rather than wrong physics at the core: the most consequential is the ledger sentence claiming all three channels deposit "as radiation" while channel 3 explicitly enters as rest mass (the material floor the Boltzmann-brain closure relies on), plus a radiation-dilution factor quoted as a^3 instead of a^4, an order-of-magnitude slip in the "island radii" count, and a stale 4.1 vs 4.0 x10^14 value of g within the same module.

### 73. [MAJOR] internal-inconsistency — `LMU_V3_25_consolidated.tex:701`

**Summary:** The ledger says all three channels deposit into L0 "as radiation", contradicting channel 3 (line 654), which explicitly enters L0 as rest mass — the very 'material floor' the Boltzmann-brain closure (line 729) depends on.

**Evidence:**

> Line 701: "Summing the three channels, each zone deposits its rest energy $E_{\rm zone}\simeq\sum_i M_i c^2$ into $L0$ as radiation". Line 654: "is left adrift as the zone relaxes to Minkowski, and drifts into $L0$ carrying its rest mass. This is the \emph{material} that seeds later rounds". Line 729 then relies on channel 3 being matter: "The seeds of a new round are \emph{real debris with a past} (channel 3), not vacuum fluctuations."

**Suggested fix:** Scope the phrase: channels 1-2 deposit as radiation, channel 3 as rest mass, e.g. "...into L0 (channels 1-2 as radiation, channel 3 as rest mass)".

### 74. [minor] factual-error — `LMU_V3_25_consolidated.tex:645`

**Summary:** Radiation dilution is quoted as a^3 ~ 10^180 per interlude, but radiation energy density dilutes as a^4 (~10^240 for the same a-growth); the document itself scopes the a^3 factor to matter one section later.

**Evidence:**

> Line 645: "radiation not yet re-gathered dilutes only power-law ($a^3\sim10^{180}$ per interlude) while matter \emph{clusters} on a far faster clock". Line 666 correctly restricts a^3 to matter: "mean densities dilute by $a^3\sim10^{180}$ (matter)". With a growing by 10^60 per interlude, radiation energy density falls by a^4 = 10^240; a^3 is only the photon number-density factor, while the sentence is about the survivor's rest energy Mc^2 bled into L0.

**Suggested fix:** Either quote a^4 ~ 10^240 for radiation energy, or state explicitly that a^3 tracks photon number density.

### 75. [minor] math-error — `LMU_V3_25_consolidated.tex:666`

**Summary:** "~8x10^56 m ≈ 10^26 island radii" is inconsistent with the module's own island radius R_isl = 1107 R_obs: the ratio is 1.6x10^27, an order of magnitude larger than stated.

**Evidence:**

> Line 666: "the comoving causal reach is $\sim8\times10^{56}$\,m $\approx10^{26}$ island radii". Line 688 (same part) fixes the island radius: "$R_{\rm isl}=1107\,R_{\rm obs}$" with $\lambda_J=1.68\times10^{26}$ m $=0.38\,R_{\rm obs}$ (line 674), giving R_obs = 4.42x10^26 m and R_isl = 4.89x10^29 m; 8x10^56 / 4.89x10^29 = 1.6x10^27, not ~10^26.

**Suggested fix:** Change to ≈10^27 island radii, or correct the 8x10^56 m figure if the 10^26 count is the intended output.

### 76. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:748`

**Summary:** The fiducial entropy growth factor is given as 4.1x10^14 here but as 4.0x10^14 at line 722 in the same module (and the file's own reproduction pass, line 1263, computes 4.01x10^14), so the bolded 4.1 appears stale.

**Evidence:**

> Line 748: "fiducial $\mathbf{4.1\times10^{14}}$ (Egan \& Lineweaver 2010 budget)". Line 722: "with the measured $g=4.0\times10^{14}$". Line 1263 (reproduction run): "$g$ floor/fiducial/post $=1.65\times10^{13}/4.01\times10^{14}/7.4\times10^{16}$". 4.01x10^14 rounds to 4.0, not 4.1.

**Suggested fix:** Use one value consistently (4.0x10^14 per the reproduction run).

### 77. [minor] label-discipline — `LMU_V3_25_consolidated.tex:728`

**Summary:** "No remnant / full Mc^2 returned by unitary Hawking evaporation" is tagged [Fact], but unitarity does not by itself exclude remnants (remnant scenarios are themselves proposed unitary resolutions), and the information-paradox endgame is not an established experimental fact; the corresponding claim at line 656 carries no tag at all.

**Evidence:**

> Line 728: "\textbf{Energy loss --- closed.} Unitary Hawking evaporation returns the full $\Mbh c^2$; no remnant, no hole swallows energy permanently; ... Energy in$=$out. \Fact". Line 656: "Crucially, by unitarity the evaporation leaves \emph{no} remnant: the entire $\Mbh c^2$ is returned to the exterior as radiation." (untagged).

**Suggested fix:** Tag as [Fact-theory] or [Hypothesis] (mainstream expectation, e.g. from the island/replica-wormhole results), and tag line 656.

### 78. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:706`

**Summary:** The boundary-injection sentence quotes two energies whose ratio is ~7x10^19, then concludes ("so") an injection factor of 10^26 to 10^43-47 — no arithmetic combination of the quoted numbers yields either stated factor, so the passage cannot be reconciled without external definitions.

**Evidence:**

> Line 706: "the pre-rescale flash share is $\sim3\times10^{60}$\,J against a child matter content $\sim2\times10^{80}$\,J today, so every crossing injects a factor $\Omega\sim10^{26}$ (pair threshold) to $10^{43\text{--}47}$ (GUT gluing)". Computed: 2x10^80 / 3x10^60 = 6.7x10^19, matching neither 10^26 nor 10^43-47 (Omega is a temperature/blueshift rescale defined only in Part IV S2).

**Suggested fix:** Decouple the two statements: give the energy shortfall (~10^20 in raw energy) separately from the temperature-rescale factor Omega, or state Omega's definition inline.

### 79. [nit] clarity — `LMU_V3_25_consolidated.tex:654`

**Summary:** Naming collision: channel 3 is labeled "the cold source", but channel 1 (the survivor) was already described in bold as a "cold source" nine lines earlier, blurring the channel taxonomy (slow/fast/cold).

**Evidence:**

> Line 654: "\textbf{(3) Debris escapes as $A\!\to\!0$ (the cold source).}" vs line 645 (channel 1): "the survivor is not a one-off blast but a \textbf{cold source that bleeds its full rest energy $\Mbh c^2$ into $L0$ over an enormous time}".

**Suggested fix:** Rename channel 1's description (e.g. "slow, cold bleed") or channel 3's label (e.g. "the drift source").

---

## 12. LMU_V3_25_consolidated.tex — lines 803-985 (Part: operator B-prime + composed-system results)

**Reviewer's overall assessment:** Lines 803-985 are numerically very solid: essentially every [Fact]-class number recomputes correctly (g floor 1.65e13 and fiducial 4.01e14 with log10=14.60 from the Egan-Lineweaver 3.1e104/1.03e90 budget; S_BH(1e11 Msun)=1.049e99 k_B; S_rad=(4/3)S_BH values at 1e11/1e12; T_H(1e12)=6e-20 K; tau_evap 2.1e100/2.1e103 yr; M_Nariai(H0=67.4)=1.789e22 Msun; the inflation benchmark eps=5.7e-4, r=0.009, n_s=0.965; the thin-wall S_E=6.7e3/delta^3; the 1.5 g = 7e4 M_Pl seed and the 1e44 R_s/R_bubble ratio; M_b=2.04e32 and M_DM=5.36 M_b=1.09e33 Msun; the 1107/1395 R_obs island bounds differing by exactly S_fix/S_rad=2.0; and the spin-walk inversion arithmetic). The defects found are mostly version-churn residue, the most significant being the Part V fixed-band table still headlining the 0.14 dex/decade scaling that the adjacent text explicitly retires (item E), plus a handful of small internal-consistency and attribution slips; nothing found undermines the range's core quantitative claims.

### 80. [MAJOR] internal-inconsistency — `LMU_V3_25_consolidated.tex:933`

**Summary:** The Part V fixed-band table still headlines the extreme-value scaling as 0.14 dex per decade, a figure the very next paragraph (line 935) declares derived from the wrong (stellar) slope and retired, replacing it with the owned range 0.15-0.27 dex.

**Evidence:**

> Line 933 (table): "$M_{L1}$ & $10^{10}$--$10^{11}\,M_\odot$ \textbf{band}, extreme-value scaling $\approx0.14$ dex per decade of endowment". Line 935: "giving $\approx0.15$--$0.27$ dex per decade of endowment ... The previously quoted $0.14$ used an unowned $\beta\approx0.7$ ... the derivation is corrected and the orphan retired (item E, resolved 2026-06-10)". Part IV \S6 (line 918) likewise uses "$d\log_{10}M_{L1}\approx0.15$--$0.27$ dex per decade". The document's own retired-numbers rule (line 966) states "Any later document citing one of these as current is in error", yet its headline table presents the retired value as current.

**Suggested fix:** Change the table entry to "extreme-value scaling ≈0.15-0.27 dex per decade of endowment (owned β)" to match lines 918 and 935.

### 81. [minor] math-error — `LMU_V3_25_consolidated.tex:935`

**Summary:** The "live ceiling sits +11.8 dex away" figure does not follow from the sentence's own reference point: the live-phase Nariai ceiling M_Nariai(H~H0)=1.789e22 Msun (R6 record, line 982; eq. at line 649 gives 1.7e22) sits +11.25 dex above the stated band centre of 1e11 Msun.

**Evidence:**

> Line 935: "$M_{\rm floor}\approx6.4\times10^{5}\,\msun$, $\approx5.19$ dex below the band centre ($10^{11}\,\msun$) ... the live ceiling sits $+11.8$ dex away". Computed: log10(1.789e22/1e11) = 11.25 dex (the floor's 5.19 dex does check out from the same 1e11 reference: log10(1e11/6.4e5)=5.19). The quoted +11.8 is reproduced only if the ceiling is measured from 10^10.5, i.e. a different reference mass than the floor in the same sentence; note also line 878 calls 1e11 the "band top", not the centre.

**Suggested fix:** Either change to "+11.3 dex" (from the 1e11 reference used for the floor) or state the reference mass explicitly.

### 82. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:837`

**Summary:** The open condition characterizes the survivor's terminal flash as "a ~10^-20 K flash", but 6.17e-20 K is the initial Hawking temperature of a 1e12 Msun hole (line 878), the coldest point of the evaporation history, whereas line 835 locates the trigger at the post-evaporation Planck-scale sliver, which radiates at ~1e26 K.

**Evidence:**

> Line 837: "whether a $\sim\!10^{-20}$\,K flash can nucleate a $\sim\!10^{16}$\,GeV transition". Line 835: catalysis operates at "the post-evaporation Planck-scale sliver at $r_h\approx R_{\rm bubble}$ (the $\sim\!1.5$\,g ... optimal seed), \emph{not} the $\sim\!10^{11}M_\odot$ body". Computed: T_H(1.5 g) = 8.2e25 K; T_H diverges as M->0 at the flash, so the flash itself is ultra-hot, not 1e-20 K (and the canonical band-top survivor is 1e11 Msun, T_H = 6.2e-19 K, not 1e-20 K).

**Suggested fix:** Rephrase, e.g. "whether the terminal flash of a hole that spent its life at ~10^-20 K can nucleate a ~10^16 GeV transition", or quote the endpoint temperature.

### 83. [minor] factual-error — `LMU_V3_25_consolidated.tex:835`

**Summary:** The benchmark's gravity check uses the wrong control parameter: CDL gravitational corrections are governed by the bubble-radius-to-Hubble-radius ratio R0*H_F ∝ δ^(-1/2), not by ΔV/M_p^4, so the stated criterion would wrongly certify the flat-space value for arbitrarily shallow tilts — the very regime the same sentence admits can quench nucleation.

**Evidence:**

> Line 835: "gravity is negligible since $\Delta V/M_p^4\!\sim\!10^{-12}\!\ll\!1$ (the flat-space Coleman value needs no CDL gravitational correction)", after stating earlier in the same paragraph that "for a shallow enough gap, [gravity] can suppress nucleation outright --- Coleman--De~Luccia 1980". Computed with the paragraph's own quartic double-well: R0*H_F = 0.024 (δ=0.3), 0.134 (δ=0.01), 1.34 (δ=1e-4), while ΔV/M_p^4 falls from 2e-11 to 7e-15 — the two parameters run in opposite directions, so ΔV/M_p^4 ≪ 1 does not control the correction. The conclusion happens to hold at the quoted δ=0.3-0.01 range (corrections ≲ few %), but the reason given does not.

**Suggested fix:** Replace the criterion with the thin-wall CDL parameter, e.g. "R0/Λ = √3 S_1/(√ΔV M_p) ≈ 0.01/√δ ≪ 1 across the quoted tilts".

### 84. [minor] metadata — `LMU_V3_25_consolidated.tex:962`

**Summary:** The standing-tension paragraph carries multiple load-bearing quantitative claims (a_star~0.55 expectation, N_misaligned <= 0.56-2.26, tension factor 2.6-10.6, aligned fraction >= 62%) but ends with no [Fact]/[Hypothesis]/[Auditor] tag — the only untagged substantive paragraph in Parts IV-V.

**Evidence:**

> Line 962: "\textbf{V3.7 inversion:} the spin walk $a=a_0/\sqrt{1+N}$ (Hughes \& Blandford 2003) turns $a_\star\ge0.8$ into $N_{\rm misaligned}\le0.56$--$2.26$ ... tension factor $2.6$--$10.6$ ... Watch for new measurements (ngEHT/BHEX, $\sim$2030s)." — the paragraph terminates with no epistemic tag, unlike the neighbouring \hyp-tagged predictions paragraph (line 960). (The arithmetic itself checks out: (0.998/0.8)^2-1=0.556; with the x1.45 lift, (0.998x1.45/0.8)^2-1=2.27; 5.9/2.26=2.6, 5.9/0.556=10.6; (5.9-2.26)/5.9=62%.)

**Suggested fix:** Append the appropriate tag (presumably \Auditor for the inversion arithmetic / \hyp for the walk model), matching the document's stated label discipline.

### 85. [nit] internal-inconsistency — `LMU_V3_25_consolidated.tex:906`

**Summary:** The baryon number density from the same fresh R6 run is quoted as 0.2505 m^-3 in B4' but 0.2504 m^-3 in the R6 recomputation record (line 982).

**Evidence:**

> Line 906: "recomputed constants (R6, fresh for this assembly): $f_\gamma=0.5116$, $s/n_\gamma=3.6016\,k_B$, $n_b=0.2505$\,m$^{-3}$". Line 982: "$n_b=0.2504$\,m$^{-3}$" — same constant, same assembly's R6 record, differing last digit.

**Suggested fix:** Reconcile the two to whichever the R6 script actually produced.

### 86. [nit] typo — `LMU_V3_25_consolidated.tex:857`

**Summary:** The g-floor table row writes the mass cut as "n >= 10^9 Msun holes", comparing the symbol n (used as a number density, 10^-5 Mpc^-3, in the same cell) to a mass.

**Evidence:**

> Line 857: "$g$ floor (only $n\,{\ge}\,10^9M_\odot$ holes, $10^{-5}\,$Mpc$^{-3}$)" — the condition should read $M\ge10^9M_\odot$. (The value itself recomputes correctly: (4/3) x 3.4e-73 m^-3 x 1.049e95 k_B / 2.89e9 k_B m^-3 = 1.65e13.)

**Suggested fix:** Change to "only $M\ge10^{9}M_\odot$ holes".

### 87. [nit] broken-reference — `LMU_V3_25_consolidated.tex:822`

**Summary:** The slow-roll relations r=16eps, A_s=V/(24 pi^2 eps M_p^4) and n_s=1-6eps+2eta are attributed wholesale to "Mukhanov--Chibisov 1981", which computed only the scalar spectrum; the tensor consistency relation and the n_s slow-roll expansion are later results (Starobinsky 1979 for tensors; Liddle--Lyth-era slow-roll formalism).

**Evidence:**

> Line 822: "\factth\ (single-field slow-roll relations $r=16\epsilon$, $A_s=V/24\pi^2\epsilon M_p^4$, $n_s=1-6\epsilon+2\eta$; Mukhanov--Chibisov 1981)" — none of these three formulas appears in Mukhanov & Chibisov (1981), which predates the tensor-to-scalar consistency relation. (The arithmetic built on them is correct: eps = 1e64/(24 pi^2 x 2.1e-9 x (2.435e18)^4) = 5.72e-4, r = 16 eps = 0.0091, n_s = 1 - 6(5.7e-4) + 2(-0.016) = 0.965.)

**Suggested fix:** Cite e.g. "Starobinsky 1979; Mukhanov--Chibisov 1981; Liddle--Lyth 1992" for the three relations.

---

## 13. LMU_V3_25_consolidated.tex — lines 986-1254 (Part: verification & empirical confrontation)

**Reviewer's overall assessment:** The numerical core of lines 986-1254 is very solid: every recomputable [Fact-eq]-style number reproduces (Nariai mass 1.788e22 Msun and the sqrt(27)/2 ratio, Hawking T/tau/S values, the 4/3 entropy ratios at both masses, pair-production temperature, pi^2/4, the NGC 384 +0.296 dex offset, the relic-six mean +0.227+/-0.099, the Pearson r=-0.724/p=0.104 and drop-one r=+0.242 statistics, and even the thawing w0-wa table is internally consistent with wa≈-1.58(1+w0)), and the self-critical [Fact]/[Hypo]/[Open] labeling is generally disciplined. The significant defects are consistency, not arithmetic: a restored 2026-06 update note that flatly contradicts the unrevised body on the M87 spin trend and the claim's status (leaning-against vs Open), a 10-order-of-magnitude clash between the '~10^90 yr' L1-endgame duration and the ~2.1e100-2.1e103 yr Hawking clocks quoted in the same range, plus several stale or wrong internal section pointers and self-misquotes in the stress-test table.

### 88. [MAJOR] internal-inconsistency — `LMU_V3_25_consolidated.tex:991`

**Summary:** The 2026-06 update note says M87 'now trends to high spin' and moves the claim's status to 'leaning-against', directly contradicting the unrevised body of the same part, which says the latest 2025 evidence disfavours high spin and keeps the status [Open].

**Evidence:**

> Line 991: "the testable cluster side --- M87 --- now trends to high spin... The claim's status moves from ``blocked-but-sharp'' to \textbf{leaning-against}". But line 989 (the immediately preceding paragraph) says "correctly \Open, neither confirmed nor dead"; line 1034 says "a 2025 EHT-polarimetry analysis \emph{disfavours high spin} for M87* (Wong et al. 2025...), pulling toward the moderate-to-low side... \Open"; line 1036 repeats "Correct status: \Open"; and the part summary (line 1055) says "unconstrained for M87 ($a_\ast$ spans 0.1--0.98). Correctly \Open". The update and the body assert opposite directions for the same-epoch M87 evidence and opposite statuses.

**Suggested fix:** Either propagate the 'leaning-against' status and the high-spin trend into \S5/\S6 and the part summary (revising the Wong et al. reading), or correct the update note; they cannot both stand.

### 89. [MAJOR] internal-inconsistency — `LMU_V3_25_consolidated.tex:1097`

**Summary:** The L1 endgame is quoted as lasting ~10^90 yr here, but elsewhere in this same range the identical 'terminal/evaporating' endgame runs on the Hawking clock of ~2.1x10^100 yr (10^11 Msun) / 2.1x10^103 yr (10^12 Msun) — a 10-order-of-magnitude discrepancy in the stated duration of the same named epoch.

**Evidence:**

> Line 1097: "terminal/evaporating (the L1 endgame, $\sim10^{90}$\,yr, unobservable)". Line 1236: "The survivor's endgame --- win every merger, then evaporate... runs on the Hawking clock: $\tau_{\rm evap}\!\sim\!2.1\times10^{100}$\,yr for a $10^{11}\,\msun$ survivor"; line 1144 table: "$\tau_{\rm evap}$ & $2.10\times10^{103}$\,yr" (10^12 Msun). Recomputation confirms 2.1e100–2.1e103 yr; 10^90 yr corresponds to a ~4x10^7 Msun hole, not a survivor. (A scope note at line 978 asserts the 10^90 yr figure is a distinct live quantity, but line 1097 explicitly attaches it to 'terminal/evaporating'.)

**Suggested fix:** If 10^90 yr is intentional, say what it measures (it is not the evaporation time of any survivor-mass hole); otherwise correct to ~10^100 yr.

### 90. [minor] broken-reference — `LMU_V3_25_consolidated.tex:991`

**Summary:** The update note claims its two findings are 'folded into \S7 and the closing \S21 of this part', but neither section contains them: \S7 (line 1062) is the relic dynamical-mass confrontation with no spin-measurability content, and \S21 (line 1221) still presents the claim as falsifiable/[Open] with no mention of in-principle relic unmeasurability or an M87 high-spin trend.

**Evidence:**

> Line 991: "Two findings, folded into \S7 and the closing \S21 of this part". Section numbering in this \part runs \S1–\S21 (counter reset only at line 987): \S7 = "The relic over-massiveness against the 2025 dynamical-mass set" (line 1062) — no spin-probe discussion; \S21 = "Audit verdict --- one distinctive claim on a three-link conditional chain" (line 1221) — says "genuinely \emph{non-circular and falsifiable} (NewAthena, late 2030s)" with no 'leaning-against' or unmeasurability-in-principle material. The relic-quiescence argument actually sits in \S5 (line 1032).

**Suggested fix:** Point the fold-in at the sections that actually carry the material (\S5 and the unfalsifiability subsection after \S21), or actually fold the two findings into \S7 and \S21.

### 91. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:1178`

**Summary:** The Part VI stress-test table misquotes the document's own spin-decoupling numbers: it lists the document's median Delta-a* as 0.45 (the document says 0.49 median / +0.48 fiducial) and the document's fiducial cluster spin as ~0.55 (the document's table says 0.522).

**Evidence:**

> Line 1178: "median $\Delta a_\ast$ & $0.246$ & $0.45$\ \ (\textbf{differs})" and line 1179: "fiducial cluster $a_\ast$ & $0.751$ & $\sim0.55$". But line 1000 (Fig. 1 caption) states "positive in 100\% of a 160-draw coefficient sweep (median 0.49)" and the \S3 table (line 1012) gives at seed x1: "0.998 & 0.522 & $+0.48$" (0.45 is the x0.1 row, line 1011). Line 1183 then argues against "$\Delta a_\ast=0.45$".

**Suggested fix:** Quote 0.49 (median) / 0.48 (fiducial) and 0.52 (fiducial cluster spin) as the document values; the ~2x magnitude-gap conclusion is unaffected.

### 92. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:1032`

**Summary:** NGC 1277's velocity dispersion is sigma≈333 km/s in \S2 but 'the adopted sigma=317 km/s' in \S5 of the same part; the headline +0.24 dex M–sigma offset only follows from 317 (at 333 it is +0.12 dex), and the switch is unexplained.

**Evidence:**

> Line 1002: "near-identical dispersion ($\sigma\!\approx\!324$ vs $333$)" (M87 vs NGC 1277); line 1032: "At the adopted $\sigma=317\,\mathrm{km\,s^{-1}}$ the Walsh mass sits $\mathbf{+0.24}$~\textbf{dex above} the McConnell--Ma $M$--$\sigma$ relation". Recomputed: pred(317)=9.448, 9.69-9.448=+0.242; pred(333)=9.569, 9.69-9.569=+0.121.

**Suggested fix:** State one adopted sigma for NGC 1277 (with source) and use it in both sections, or note the sensitivity (+0.24 -> +0.12 dex between the two literature dispersions).

### 93. [minor] metadata — `LMU_V3_25_consolidated.tex:1244`

**Summary:** Two entries in 'References added in this audit' — Inayoshi & Ichikawa (2024) and Reynolds (2024) — are cited nowhere in the audit text (or anywhere else in the file), contradicting the list's closing claim 'All used as owned results'.

**Evidence:**

> Line 1244: "Inayoshi \& Ichikawa (2024, LRD density $\to$ high spin); ... Reynolds (2024, coherent-accretion preference); ... All used as owned results". grep over the whole file: 'Ichikawa' occurs only on line 1244; 'Reynolds' occurs only as "Reynolds 2013/2021 and the 2025 compilation" (lines 1030, 1047, 1413) — no Reynolds 2024 usage anywhere.

**Suggested fix:** Either cite the two works where their results are used in the audit sections, or drop them from the added-references list.

### 94. [minor] clarity — `LMU_V3_25_consolidated.tex:1030`

**Summary:** The measured-spin-trend paragraph makes load-bearing factual claims about published data (~50-hole X-ray reflection sample, high-spin-at-low-mass trend) but carries no [Fact]/[Hypo]/[Open] tag, unlike every other paragraph of \S5.

**Evidence:**

> Line 1030: "\textbf{The measured-spin trend} (X-ray reflection sample, $\sim$50 holes; Reynolds 2013/2021 and the 2025 compilation) does show high spin at low mass and lower spin at high mass... \textbf{Consistent, non-discriminating.}" — ends with no tag, while the sibling paragraphs end "\Fact\ / \Auditor" (line 1032), "\Open" (line 1034), and "\Auditor" (line 1036).

**Suggested fix:** Append the appropriate tag (presumably \Fact for the sample description plus \Auditor for the non-discrimination verdict).

### 95. [nit] broken-reference — `LMU_V3_25_consolidated.tex:1236`

**Summary:** The evaporation-time citation '(Part IV \S2 / Module C)' points to the wrong section: Part IV \S2 is 'The ladder as a single forward map' and contains no tau_evap; the Hawking numbers are in Part IV \S1 (line 994) and the Part VI stress-test table (line 1144).

**Evidence:**

> Line 1236: "$\tau_{\rm evap}\!\sim\!2.1\times10^{100}$\,yr for a $10^{11}\,\msun$ survivor (Part~IV \S2 / Module~C)". Part IV \S2 begins at line 996 ("The ladder as a single forward map") and discusses only the environment-plane classifier; Hawking $T_H,L,\tau_{\rm evap}$ appear in \S1 (line 994).

**Suggested fix:** Change to Part IV \S1 (or the Part VI \S13 stress-test table).

### 96. [nit] broken-reference — `LMU_V3_25_consolidated.tex:1203`

**Summary:** 'The live falsifier of \S9' resolves, in this part's continuous numbering, to \S9 'The dwarf empty-centre axes' (line 1089), which contains no super-Eddington/M–sigma self-regulation falsifier; the intended target is Part I \S9 'Falsifiers' (line 329), but the part qualifier is missing.

**Evidence:**

> Line 1203: "The open question --- the live falsifier of \S9 --- is whether that wind shuts off the hole's \emph{own} accretion ($M$--$\sigma$ self-regulation)". Within the current \part (section counter reset at line 987), \S9 is "The dwarf empty-centre axes (position/occupation, mass-free)" at line 1089; the M–sigma self-regulation falsifier material lives in Part I (\S9 "Falsifiers", line 329; cf. line 174).

**Suggested fix:** Write 'Part I \S9' (or use a \label/\ref pair) to disambiguate.

---

## 14. LMU_V3_25_consolidated.tex — lines 1255-1562 (stress audit, open ledger, attribution, session digest)

**Reviewer's overall assessment:** Lines 1255-1562 (stress audit + DR-Vmin, open ledger, dead-end pointers, master attribution table, session-record digest) are numerically impressive: I independently recomputed roughly 30 [Fact-eq]-grade values (sigma_crit = 5.80e16 J/m^2 = (24 MeV)^3, M_Nariai = 1.789e22 Msun, tau_evap(1e11 Msun) = 2.097e100 yr, N_Q = 1.39e122 and 6.60e300, rho_cross = 6e-104 kg/m^3, rho_BH = 1.8e-3 kg/m^3, the 0.27 M_Pl and 12 kg thresholds, T(rho_c) = 1.3e32 K, R*/R_isl = 1.6e10, the 68 and 11.2 e-fold counts, the 3.1e-181 tier and its 6.3e-181 inversion, T_vir = 1.09e12 K/918x, the 5.19 dex floor depth) and essentially all reproduce exactly from CODATA/Planck inputs, with the tag discipline ([Fact]/[Fact-theory]/[Hypo]/[Open]/[Dead-end]) applied consistently. The surviving defects are bookkeeping rather than physics: the most consequential is that the headline threshold epsilon_DESI is still bolded and reused as 3.0e-2 (including in text added after V3.8) even though the same part records that convention as retired in favor of 4.6e-2; the rest are a stray brace that silently ends the \small revision-history block early, a ~20-vs-22-orders inconsistency for the same energy gap, an unexplained 7.4e16-vs-2e16 post-ladder g discrepancy, a factor-5 slip in the virial-ceiling prose, and an overstated molecular-cloud/Lambda density ratio.

### 97. [MAJOR] internal-inconsistency — `LMU_V3_25_consolidated.tex:1268`

**Summary:** The headline observational-invisibility threshold epsilon_DESI is stated in bold as 3.0e-2, but Section 6 of the same part says that convention was retired in V3.8 and replaced by 4.6e-2, while text added after the retirement (V3.13 and V3.14) still computes with and quotes 3e-2.

**Evidence:**

> Line 1268: "\textbf{$\epsilon_{\rm DESI}=3.0\times10^{-2}$} at the $0.1\sigma_{w_0}$ convention"; line 1292: "$\epsilon_{\rm DESI}$ is now computed on the chain covariance ($4.6\times10^{-2}\,\rho_{\rm DE}$, joint $0.1\sigma$; the $0.1\sigma$-on-$w_0$ convention retired in V3.8)"; yet the V3.13-added caveat at line 1298 uses "$1.39\times10^{122}$ at $\epsilon'=\epsilon_{\rm DESI}=3\times10^{-2}$" (recomputation confirms 1.39e122 requires eps=3e-2, not 4.6e-2), and the V3.14 J2 guard at line 1328 still says "below $\epsilon_{\rm DESI}=3\times10^{-2}$".

**Suggested fix:** Either update all epsilon_DESI occurrences (lines 1268, 1272, 1274 caption, 1298, 1319, 1328) to the chain-covariance value 4.6e-2, or explicitly label 3.0e-2 as the retired convention wherever it is still used.

### 98. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:1356`

**Summary:** Dead-end C4 twice states the survivor-to-child energy deficit as "~20 orders" while the same two numbers are called a "~10^22 gap" at line 1348 and "~22 orders short" at line 1360; the correct value is 22 orders.

**Evidence:**

> Line 1356: "one survivor carries $M_{L1}c^2\approx1.8\times10^{58}$\,J ($10^{11}\,\msun$) against a child matter content $\sim2\times10^{80}$\,J, short by $\sim$20 orders" (and again "sits $\sim$20 orders below"). Computed: log10(2e80/1.788e58) = 22.05. Line 1348: "the $\sim\!10^{22}$ gap"; line 1360: "$\approx1.8\times10^{58}$\,J vs the $\sim2\times10^{80}$\,J needed ($\sim$22 orders short)".

**Suggested fix:** Change both "~20 orders" instances in C4 (and the matching "~20 orders" in the 3.16 revision note, line 1505) to "~22 orders".

### 99. [minor] broken-reference — `LMU_V3_25_consolidated.tex:1500`

**Summary:** A stray closing brace at the end of the 3.14-continuation entry prematurely closes the {\small group opened at line 1473, so every revision-history entry from 3.14->3.15 (line 1503) to 3.16->3.17 (line 1535) silently renders at normal size instead of \small.

**Evidence:**

> Line 1500 ends "...Axioms unchanged; V4.0 remains reserved for a physics verdict.}" — no other revision entry ends with "}". Brace count: balance = 1 after the "{\small" at line 1473, drops to 0 at end of line 1500, and stays 0 to \end{document}, confirming this "}" is the group's actual closer.

**Suggested fix:** Delete the trailing "}" on line 1500 and close the {\small group after the last revision entry (before the Session-record digest \part at line 1537).

### 100. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:1263`

**Summary:** The post-ladder Tolman rate g is reported as 7.4e16 in the stress-audit reproduction but as ~2e16 in the V3.5 revision history, a factor-3.7 discrepancy with no recorded correction bridging the two (the floor and fiducial values match between the same two lines).

**Evidence:**

> Line 1263: "$g$ floor/fiducial/post $=1.65\times10^{13}/4.01\times10^{14}/7.4\times10^{16}$"; line 1474: "the Tolman rate $g$ is now \emph{measured}, not bounded (floor $1.7\times10^{13}$, fiducial $4.1\times10^{14}$, post-ladder $\sim$$2\times10^{16}$)". The "$\times4500$ spread" at lines 1265 and 1287 is consistent only with 7.4e16 (7.4e16/1.65e13 = 4485).

**Suggested fix:** If 7.4e16 superseded ~2e16, note the correction in the revision history or annotate line 1474 as superseded.

### 101. [minor] math-error — `LMU_V3_25_consolidated.tex:1356`

**Summary:** C4's virial-ceiling clause equates kT_vir ~ (1/2) m_p c^2 with T_vir = m_p c^2/(10 k_B) via "i.e.", but the two expressions differ by a factor of 5 (the (1/2) m_p c^2 form gives 5.4e12 K, not 1.09e12 K).

**Evidence:**

> Line 1356: "gives a virial ceiling $kT_{\rm vir}\sim\tfrac12 m_pc^2$ (escape speed $=c$ at $R_s$ for \emph{any} $M$), i.e.\ $T_{\rm vir}=m_pc^2/10k_B\approx1.09\times10^{12}$\,K". Computed: (1/2)m_p c^2/k_B = 5.44e12 K vs m_p c^2/(10 k_B) = 1.089e12 K. The 1.09e12 K figure and the "918x" shortfall are correct; the kT_vir ~ (1/2)m_p c^2 statement is the slip.

**Suggested fix:** Write kT_vir ~ (1/10) m_p c^2 (virial convention T = GMm_p/(5 k_B R) at R = R_s), or drop the (1/2) clause.

### 102. [minor] factual-error — `LMU_V3_25_consolidated.tex:1340`

**Summary:** The scale check claims molecular-cloud (pc to 100 pc) matter energy density exceeds Lambda by ~10^10-10^14, but at typical GMC densities of 10^2-10^3 cm^-3 the ratio is only ~10^8-10^9; the stated range requires n ~ 10^4-10^8 cm^-3, i.e. dense clumps/cores well below pc scale.

**Evidence:**

> Line 1340: "At star-forming (ISM) scales --- molecular clouds, $\sim$pc to $\sim$100\,pc --- the matter energy density exceeds $\Lambda$ by $\sim\!10^{10}$--$10^{14}$". Computed: rho_Lambda = 5.8e-27 kg/m^3; n(H2) = 100 cm^-3 with mu = 2.33 gives rho = 3.9e-19 kg/m^3, ratio 6.6e7; even n = 10^3 cm^-3 gives ~7e8. Reaching 10^10 needs n ~ 1.5e4 cm^-3.

**Suggested fix:** Change to ~10^8-10^11 (clouds to dense cores), or re-scope the quoted range to core densities; the argument's conclusion (DE dynamically irrelevant) is unaffected.

### 103. [nit] typo — `LMU_V3_25_consolidated.tex:1495`

**Summary:** The 3.12->3.13 revision entry is truncated mid-sentence: it ends "V4.0 remains reserved" with no period and without the "for a physics verdict" tail every other entry carries.

**Evidence:**

> Line 1495 ends: "...this pass adds owners, the quantum route, and the eternity caveat only. V4.0 remains reserved" — compare every other entry's closer, e.g. line 1490: "Axioms unchanged; V4.0 remains reserved for a physics verdict."

**Suggested fix:** Complete the sentence: "V4.0 remains reserved for a physics verdict."

### 104. [nit] internal-inconsistency — `LMU_V3_25_consolidated.tex:1476`

**Summary:** The Jeans margin is quoted as 2895 in the V3.5->3.6 revision entry but as 2896 in the stress audit (line 1263) and the V3.14 note (line 1497); the computed value is 2895.8, so 2895 is a truncation inconsistent with the live figure.

**Evidence:**

> Line 1476: "island scales are super-Jeans from oscillation onset ($R_{\rm isl}/\lambda_J=2895$ at the live point)"; line 1263: "$\lambda_J=1.682\times10^{26}$\,m (margin 2896)"; line 1497: "the live margin $R_{\rm isl}/\lambda_J=2896$". Computed: 1107 x 4.4e26 / 1.682e26 = 2895.8.

**Suggested fix:** Use 2896 consistently.

### 105. [nit] clarity — `LMU_V3_25_consolidated.tex:1358`

**Summary:** The anti-concentration parenthetical mixes mass-orders and density-orders in one arithmetic-looking chain: "survivors ~50 orders too massive; torsion's lower ceiling eases ~39, leaving ~60" reads as 50-39=60; the 39/60 are density orders (99-39=60), while in mass orders torsion eases only ~19.5, leaving ~30.

**Evidence:**

> Line 1358: "$\sim$99 orders below $\rho_c$, and only sub-Planck-mass holes ($M\lesssim0.27\,M_{\rm Pl}$) ever reach $\rho_c$ (survivors $\sim$50 orders too massive; torsion's lower ceiling eases $\sim$39, leaving $\sim$60)". Computed: mass threshold at rho_c is 5.9e-9 kg (0.27 M_Pl, confirmed); survivor/threshold = 3.4e49 (~50 mass orders); since M proportional to rho^{-1/2}, a 39-density-order lower ceiling raises the threshold mass by 10^19.5, leaving ~30 mass orders — "~60" is only correct against the 99 density orders.

**Suggested fix:** State the units of each step, e.g. "(99 density orders below rho_c; torsion's ceiling eases ~39 of them, leaving ~60 — in mass, survivors remain ~30 orders too heavy)".

### 106. [nit] metadata — `LMU_V3_25_consolidated.tex:1409`

**Summary:** In the master attribution table the owner cell "Emsellem et al. 2011; Cappellari" cites Cappellari without a year, unlike every other row.

**Evidence:**

> Line 1409: "Fast/slow rotators ($\lambda_R$) & Emsellem et al.\ 2011; Cappellari & galaxy-spin contrast\\"

**Suggested fix:** Add the year (presumably Cappellari 2016, ARA&A review).

---

## 15. Cross-document consistency audit (README / CHANGELOG / CITATION.cff / ABOUT_AND_TAGS / .tex)

**Reviewer's overall assessment:** The scholarly spine is remarkably self-consistent across files: version 3.25, release date 2026-07-02, DOI, ORCID (checksum-valid), OSF link, 104 pages (verified in the PDF), 26 equations, 22 figures (tex references match figs/ exactly), the F1–F4 falsifier wordings, the two-axiom claim, and the recomputable F4 numbers (ε≈5.7×10⁻⁴ → r≈0.009, nₛ≈0.965) all check out against the .tex. The real defects are in repository metadata and README claims about the repo itself: a fictional six-directory layout and a /code verification-scripts claim that fail against the actual flat repo, a CHANGELOG frozen at v3.17 despite its own record-every-deposit rule, an advertised [Fact-eq] label that never occurs in the shipped document, plus several stale placeholders (pre-release license warnings, a v3.13 filename in LICENSE-docs, a 2026-06-29 title-block date) and one audit-count mismatch (14/14 vs the document's 13/13).

### 107. [MAJOR] broken-reference — `README.md:28`

**Summary:** README claims verification scripts live in /code, but the repo contains no /code directory and not a single script file, despite the .tex naming specific scripts.

**Evidence:**

> README.md:28 "Verification scripts live in `/code`." — `find /home/user/Loop-Mega-Universe -name "*.py"` returns nothing and the only directory is `figs/`. The .tex explicitly references scripts (line 509: "Scripts \texttt{kg\_recompute.py}, \texttt{chain\_pin.py}, \texttt{stress2.py}"; fig caption line 688: "Reproduced by \texttt{lmu\_itemF\_jeans\_gate.py}") that are nowhere in the repository.

**Suggested fix:** Either add the verification scripts under /code or remove/soften the claim that they live in the repository.

### 108. [MAJOR] broken-reference — `README.md:60`

**Summary:** The 'Repository layout' block describes six directories (/tex /pdf /figures /logs /changesets /code), none of which exist; the repo is flat with figures in figs/, not /figures.

**Evidence:**

> README.md:60-67 lists "/tex LaTeX source ... /pdf compiled PDFs ... /figures the 22 PNG figures ... /logs ... /changesets ... /code". `ls` shows only root-level files plus a single `figs/` directory; `ls tex pdf figures logs changesets code` → "No such file or directory" for all six. The .tex expects `\graphicspath{{figs/}}` (tex line 20), not /figures.

**Suggested fix:** Replace the layout block with the actual flat layout (root-level .tex/.pdf/.md files + figs/), or reorganize the repo to match (ABOUT_AND_TAGS.md §5 step 1 shows this reorganization was planned but never done).

### 109. [MAJOR] stale-content — `CHANGELOG.md:10`

**Summary:** CHANGELOG's most recent entry is v3.17 (2026-06-24) although the repo ships and cites a V3.25 Zenodo deposit (2026-07-02), violating the file's own stated rule of recording deposit events.

**Evidence:**

> CHANGELOG.md:10 "## v3.17 — 2026-06-24" is the newest entry, while CHANGELOG.md:4-6 states "this file records deposit events". README.md:5 says "Current version: V3.25 (2026-07-02)", CITATION.cff:6 "date-released: \"2026-07-02\"", and README.md:84 instructs citing "(V3.25). Zenodo." — a deposit event missing from the changelog (as are any 3.18–3.24 deposits).

**Suggested fix:** Add a v3.25 (2026-07-02) deposit entry (and any intermediate deposits) to CHANGELOG.md.

### 110. [MAJOR] internal-inconsistency — `README.md:21`

**Summary:** README and CITATION.cff advertise a '[Fact-eq]' label as one of the document's three mandatory tags, but that tag never appears in the shipped .tex, whose second tag is '[Fact-theory]' with different stated semantics.

**Evidence:**

> README.md:21 "**[Fact-eq]** — derived from Fact with the checkable numbers shown" (also README.md:88 Thai abstract and CITATION.cff:27 "mandatory Fact / Fact-eq / Hypo labelling"). `grep -c "Fact-eq" LMU_V3_25_consolidated.tex` = 0; the tex legend (line 54) defines "\factth\ established theory" which prints "[Fact-theory]" (defined tex line 37), and the doc's tag set is [Fact]/[Fact-theory]/[Hypothesis]/[Speculation]/[Design]/[Open]/[Dead-end]/[Auditor] — a reader searching the PDF for the advertised [Fact-eq] label finds nothing.

**Suggested fix:** Either rename the README/CITATION label description to [Fact-theory] (matching the document) or state the actual tag legend used in V3.25.

### 111. [minor] factual-error — `README.md:28`

**Summary:** README claims 'dimensional audits pass 14/14' but the document records the audit as 13/13 in both places it is stated, and 14/14 appears nowhere in the .tex.

**Evidence:**

> README.md:28 "dimensional audits pass 14/14" vs LMU_V3_25_consolidated.tex:1492 "Unit audit (R6, this date): 13/13 numeric spot-checks reproduced by independent SI recomputation" and tex:228 "the mint chain (13/13 reproduced from constants)". grep finds no "14/14" anywhere in the repository except this README line.

**Suggested fix:** Change to 13/13 (or update the .tex audit record if a 14th check was actually added).

### 112. [minor] metadata — `LMU_V3_25_consolidated.tex:53`

**Summary:** The V3.25 title block is dated 2026-06-29, three days earlier than the document's own final revision entry (3.24→3.25, 2026-07-02) and the release date stated in README/CITATION/ABOUT.

**Evidence:**

> tex:53 "assembled under the R6 protocol (all numbers recomputed, none inherited). 2026-06-29." while tex:1525 reads "Revision history (3.24 $\to$ 3.25, 2026-07-02)" and README.md:5 / CITATION.cff:6 / ABOUT_AND_TAGS.md:1 all give 2026-07-02 for V3.25.

**Suggested fix:** Update the title-block date to 2026-07-02.

### 113. [minor] stale-content — `README.md:92`

**Summary:** The license line still carries a pre-release placeholder warning although the first release/deposit happened 2026-06-14 under CC BY 4.0 and both LICENSE files are committed.

**Evidence:**

> README.md:92 "CC-BY-4.0 *(⚠ confirm/replace before first release — see ABOUT_AND_TAGS.md)*"; same stale placeholder in CITATION.cff:19 "license: CC-BY-4.0   # <-- confirm or replace before first tagged release" and ABOUT_AND_TAGS.md:3 "One decision is yours before first release: **license**". CHANGELOG.md:40 records the v3.13 first public deposit "(CC BY 4.0)" on 2026-06-14, and LICENSE (MIT) + LICENSE-docs (CC BY 4.0) already exist in the repo.

**Suggested fix:** Remove the placeholder warnings; the license decision (docs CC-BY-4.0, code MIT) was made and published.

### 114. [minor] stale-content — `LICENSE-docs:4`

**Summary:** The docs license enumerates LMU_V3_13_consolidated.tex as the covered document, but that file was deleted; the repo ships LMU_V3_25_consolidated.tex. It also licenses 'Python scripts' that do not exist.

**Evidence:**

> LICENSE-docs:4 "including LMU_V3_13_consolidated.tex, the companion, the glossary, and all figures" — git log shows "Delete LMU_V3_13_consolidated.tex" and the only .tex present is LMU_V3_25_consolidated.tex. LICENSE-docs:33-34 "The code in this repository (Python scripts) is licensed separately under the MIT License" — no .py files exist anywhere in the repo.

**Suggested fix:** Reword to cover the current consolidated document (or 'all .tex/.md/figure files') and drop or qualify the Python-scripts sentence until code is actually committed.

### 115. [minor] internal-inconsistency — `LMU_V3_25_consolidated.tex:1535`

**Summary:** The revision history is out of chronological order: the 3.16→3.17 entry and three other 3.16-dated entries (2026-06-24) are placed after the 3.24→3.25 entry (2026-07-02), so the printed chain jumps from '3.16 continuation' straight to '3.17→3.18'.

**Evidence:**

> Entry sequence by line: 1505 "(3.15 $\to$ 3.16)", 1507 "(3.16 continuation, 2026-06-24)", 1509 "(3.17 $\to$ 3.18, 2026-06-26)" ... 1525 "(3.24 $\to$ 3.25, 2026-07-02)", then 1527 "(3.16 erratum, 2026-06-24)", 1531 "(3.16 reference pins, 2026-06-24)", 1533 "(3.16 G2 literature consolidation, 2026-06-24)", 1535 "Revision history (3.16 $\to$ 3.17)" — the 3.16→3.17 step is missing from its chronological slot and appears after 3.25 with no 'late-filed' note.

**Suggested fix:** Move the four displaced 3.16-era entries to their chronological position between lines 1507 and 1509, or add a note explaining the appended placement.

---

