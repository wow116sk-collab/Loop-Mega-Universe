# รายการที่ยังต้องแก้ (Pending fixes) — LMU document review, PR #1

> สถานะหลัง adjudication R1–R16 และ commit `cf36919` · เลขบรรทัดอ้างอิง commit `c007d48` (ใน branch: .tex เลื่อน +6 หลัง L20; ไฟล์ .md บางไฟล์เลื่อนเล็กน้อยจาก fix ก่อนหน้า — ใช้ summary/quote เป็นตัวชี้)
>
> คงเหลือ **74 ข้อ**: major 9 · minor 44 · nit 21 — ทุกข้อผ่าน adversarial verify แล้ว (confirmed/adjusted) แต่ยังไม่ได้แก้

**หมวด A ต้องมี ruling ก่อนแก้** (เนื้อหาฟิสิกส์/การตัดสินใจของผู้เขียน) · **หมวด B แก้เชิงกลไกได้ทันทีเมื่อสั่ง** · **หมวด C คิวงานนอกรายการ findings**

---

## A) ต้องมี ruling — major 9 ข้อ + decision items

### [MAJOR] id13 — `CONNECTION_MAP.md:19`
- **Finding:** The tag-system note claims 'both use [Fact-eq] the same way', but the registry's own LMU legend (line 14) does not include [Fact-eq], and the repo's LMU source confirms the tag does not exist there (0 occurrences in LMU_V3_25_consolidated.tex; its tag macros define only [Fact], [Fact-theory], [Hypothesis], [Speculation], [Design], [Open]).
- **Suggested fix:** Correct line 19 to attribute [Fact-eq] to CoE only (as line 15 does), or add [Fact-eq] to the LMU legend on line 14 if the author's working legend actually includes it.
- **Note:** ญาติของ R11 ([Fact-eq] ไม่มีใน legend LMU) — น่าจะ rule ต่อได้ทันที

### [MAJOR] id12 — `CONNECTION_MAP.md:33`
- **Finding:** The file's own rule says [derived] links 'live in §4', but two [derived] connections (C7, C8) are presented in §2's master index and as full blocks in §3 alongside [declared] links, violating the quarantine discipline the header stakes out.
- **Suggested fix:** Either move C7/C8 into §4 with D1–D4, or amend lines 6 and 33 to say derived *results* live in §4 while derived *connections* (C7, C8) remain in §2–§3 but are flagged inline.

### [MAJOR] id57 — `LMU_V3_25_consolidated.tex:201`
- **Finding:** The \Fact-tagged claim that the non-spinning recoil "peaks at ~175 km/s" does not follow from the recoil formula the document itself states: as written (line 198), v_m peaks at ~215 km/s.
- **Suggested fix:** Either add the (1+Bη) factor to v_m or note that the displayed simplified form overestimates the peak (~215 km/s) and that 175 km/s is the full fitting-formula value.

### [MAJOR] id66 — `LMU_V3_25_consolidated.tex:376`
- **Finding:** The five-stage summary says acceleration ends 'near a≈2.9' while pairing it with w0≈-0.91 — but for the pinned m≈0.80 field acceleration ends at a≈5.5, as the pin record two sentences later (line 378) and Run 2 (line 516) both state; a≈2.9 belongs to the m=1.0 scan row.
- **Suggested fix:** In stage (4) write 'near a≈5.5' (or label a≈2.9 as the m=1.0 fiducial of the verification record, distinct from the pinned m≈0.80 model).
- **Note:** คลาสเดียวกับ R13 (run-attribution) — น่าจะ rule แนวเดียวกัน

### [MAJOR] id73 — `LMU_V3_25_consolidated.tex:701`
- **Finding:** The ledger says all three channels deposit into L0 "as radiation", contradicting channel 3 (line 654), which explicitly enters L0 as rest mass — the very 'material floor' the Boltzmann-brain closure (line 729) depends on.
- **Suggested fix:** Scope the phrase: channels 1-2 deposit as radiation, channel 3 as rest mass, e.g. "...into L0 (channels 1-2 as radiation, channel 3 as rest mass)".

### [MAJOR] id80 — `LMU_V3_25_consolidated.tex:933`
- **Finding:** The Part V fixed-band table still headlines the extreme-value scaling as 0.14 dex per decade, a figure the very next paragraph (line 935) declares derived from the wrong (stellar) slope and retired, replacing it with the owned range 0.15-0.27 dex.
- **Suggested fix:** Change the table entry to "extreme-value scaling ≈0.15-0.27 dex per decade of endowment (owned β)" to match lines 918 and 935.

### [MAJOR] id88 — `LMU_V3_25_consolidated.tex:991`
- **Finding:** The 2026-06 update note says M87 'now trends to high spin' and moves the claim's status to 'leaning-against', directly contradicting the unrevised body of the same part, which says the latest 2025 evidence disfavours high spin and keeps the status [Open].
- **Suggested fix:** Either propagate the 'leaning-against' status and the high-spin trend into \S5/\S6 and the part summary (revising the Wong et al. reading), or correct the update note; they cannot both stand.

### [MAJOR] id89 — `LMU_V3_25_consolidated.tex:1097`
- **Finding:** The L1 endgame is quoted as lasting ~10^90 yr here, but elsewhere in this same range the identical 'terminal/evaporating' endgame runs on the Hawking clock of ~2.1x10^100 yr (10^11 Msun) / 2.1x10^103 yr (10^12 Msun) — a 10-order-of-magnitude discrepancy in the stated duration of the same named epoch.
- **Suggested fix:** If 10^90 yr is intentional, say what it measures (it is not the evaporation time of any survivor-mass hole); otherwise correct to ~10^100 yr.

### [MAJOR] id97 — `LMU_V3_25_consolidated.tex:1268`
- **Finding:** The headline observational-invisibility threshold epsilon_DESI is stated in bold as 3.0e-2, but Section 6 of the same part says that convention was retired in V3.8 and replaced by 4.6e-2, while text added after the retirement (V3.13 and V3.14) still computes with and quotes 3e-2.
- **Suggested fix:** Either update all epsilon_DESI occurrences (lines 1268, 1272, 1274 caption, 1298, 1319, 1328) to the chain-covariance value 4.6e-2, or explicitly label 3.0e-2 as the retired convention wherever it is still used.

### [decision] id46 — `CITATION.cff:3`
- **Finding:** 'type: dataset' mislabels the work — this is a scholarly text/framework document (tex/pdf/markdown plus figures), not a dataset; citation tooling will render it as '[Data set]'.
- **Note:** CFF 1.2.0 มีเฉพาะ `software`/`dataset` — เป็นการเลือกของผู้เขียน ไม่ใช่ bug ชัด ๆ

### [decision] id53 — `LMU_V3_25_consolidated.tex:67`
- **Finding:** Hawking evaporation is tagged [Fact] although the document's own tag key reserves [Fact] for 'measured/peer-reviewed' and provides [Fact-theory] specifically for 'established theory'; Hawking radiation has never been observed.
- **Note:** flag ไว้กับ adjudicator แล้ว (นอกสโคป R6 เพราะไม่ใช่ framework outcome) — ตาม key ของเอกสารเองควรเป็น [Fact-theory]

---

## B) minor / nit คงเหลือ — รายไฟล์

### ABOUT_AND_TAGS.md — 1 minor

- **[minor] id11 L142**: The self-search cheat sheet claims the exact signature phrase "one flash, one bubble, one aeon" appears in doc/README/Zenodo, but the Zenodo description in this very file (line 99) and the README render it as "One flash = one bubble = one aeon" (equals signs); the comma form exists only in the .tex, so an exact-quoted search does not literally match two of the three claimed locations.
  - fix: Either standardize the phrase punctuation across the Zenodo description/README to the comma form, or note in the cheat sheet that README/Zenodo use the '=' variant.

### CONNECTION_MAP.md — 3 minor, 1 nit

- **[minor] id18 L149**: The file defines [Fact-eq] as 'derived-from-Fact with the numbers shown' (line 19) but then applies the tag to purely definitional, number-free claims, contradicting its own definition.
  - fix: Retag definitional claims (e.g. [Fact] or a 'by-definition' label) or show the supporting numbers where [Fact-eq] is used.
- **[minor] id15 L176**: D3 cites a bare '§6.1' for the substrate's unfalsifiability, but this file's §6 ('Publishability slice') has no subsection 6.1 and is about a different topic; every other section reference in the file carries a doc prefix (CoE §…, LMU §…), so this reference is dangling/ambiguous.
  - fix: Prefix the reference with its source document (e.g. 'CoE §6.1') or point to the correct internal section.
- **[minor] id16 L232**: The appendix instructs readers to preserve anchors #f1..#f5 'so internal links survive', but no {#f1}–{#f5} anchors are defined anywhere in the file — the §5 firewall table rows carry no anchor IDs.
  - fix: Either add explicit anchors to the firewall entries (e.g. convert F1–F5 to anchored subsections) or drop the #f1..f5 line from the anchor table.
- **[nit] id19 L44**: The CoE tag is written [Speculative] (mixed case) in three places although the registry defines it as all-caps [SPECULATIVE] — sloppy given the file's own warning not to merge or alter the legends.
  - fix: Normalize to [SPECULATIVE] to match the CoE legend as printed in the registry.

### LMU_Companion_draft_v0.1.md — 4 minor, 1 nit

- **[minor] id22 L239**: The upper end of "0.56–2.26 misaligned mergers" cannot be derived from the spin-walk formula quoted in the same sentence: with a = a0/sqrt(1+N) and a* >= 0.8, N <= (a0/0.8)^2 − 1 <= 0.5625 for any physical a0 <= 1; the companion drops the .tex's qualifier that the 2.26 assumes an accretion re-spin lift of ×1.45.
  - fix: Add the re-spin qualifier, e.g. "0.56 (pure walk from a0 = 0.998) to 2.26 (allowing accretion re-spin, lift ×1.45)".
- **[minor] id26 L344**: The tsunami gloss's own arithmetic is off by a factor of 2: 30 cm on 4 km of water is a relative ripple of 7.5×10⁻⁵, not "roughly 1.5×10⁻⁴".
  - fix: Either change the ratio to ~7.5×10⁻⁵ or the wave height to ~60 cm.
- **[minor] id23 L460**: The same "full program" residue tier is given as 3.1×10⁻¹⁸¹ in section (iv) but is said to "re-derive" at ε′_crit = 6.3×10⁻¹⁸¹ in section (v) — a factor-2 discrepancy presented as agreement, with no reconciliation.
  - fix: Either explain the factor-2 relation between |V_min|/ρ_DE and ε′_crit (e.g. a definitional factor) or stop describing the two numbers as re-derivations of the same tier.
- **[minor] id25 L684**: Section (vii) defines the acceleration window as "a ≈ 0.6 to a few–20", contradicting section (iv), which states acceleration ends at a ≈ 2.91 (fiducial) with the cross-validation bracket a ∈ (0.61, 5.5); per the governing .tex, "few–20" is the first A = 0 crossing of the field, not the acceleration window.
  - fix: Change the parenthetical to the stated window (a ≈ 0.6 to ~3–5.5), or rescope the isolation claim to the field's first zero-crossing if that is what is meant.
- **[nit] id28 L65**: The header reading rule lists six epistemic tags while the tag-system section says every claim carries "one of seven tags" (the header list omits [Auditor]).
  - fix: Add [Auditor] to the header list or say "one of six author tags plus the [Auditor] editor tag".

### LMU_V3_25_consolidated.tex — 27 minor, 16 nit

- **[minor] id112 L53**: The V3.25 title block is dated 2026-06-29, three days earlier than the document's own final revision entry (3.24→3.25, 2026-07-02) and the release date stated in README/CITATION/ABOUT.
  - fix: Update the title-block date to 2026-07-02.
- **[minor] id52 L124**: The header claims two of the four listed objects are '~120 orders apart', but in the energy units of the table's own 'scale' column the maximum separation is only ~28-31 orders; ~120 holds only for energy density (fourth power), which the table never states.
  - fix: Say '~120 orders apart in energy density' (or '~30 orders in energy scale') so the claim matches the units of the adjacent 'scale' column.
- **[minor] id58 L153**: "The honest accounting is gathered in \S9" points at the Falsifiers section; the accounting described (calibration vs prediction, no ΛCDM discrimination) is \S8 — same off-by-one pattern as the \S10 errors.
  - fix: Change \S9 to \S8, or replace hard-coded section numbers with \ref.
- **[minor] id60 L177**: σ₀ in the merger-rate law is never assigned a value anywhere in the document, yet the "coincide only at σ≈474 km/s" audit number (line 205) silently assumes σ₀=200 km/s.
  - fix: Add σ₀=200 km/s to the coefficient table or to the equation.
- **[minor] id59 L260**: The parenthesised observed offset "+0.24 dex" for the corrected NGC 1277 anchor is not reproducible with the McConnell–Ma M–σ relation the table itself uses.
  - fix: State which σ and which M–σ calibration produce +0.24, or recompute the residual consistently with the table's σ=300 / McConnell–Ma convention.
- **[minor] id56 L271**: Hard-coded cross-reference "(\S10)" points to the Attribution table, not the testable-prediction section; the observational tests live in \S9 (Falsifiers) — same defect recurs at line 318.
  - fix: Change both \S10 references to \S9 (or use \label/\ref instead of hard-coded numbers).
- **[minor] id62 L271**: The third structural-result bullet ("Over-massiveness is forced, not chosen") carries no \Fact/\Hyp tag, while its two sibling bullets are both tagged \Hyp.
  - fix: Append \Hyp to the third bullet.
- **[minor] id61 L295**: Reference to "the \S5.2 protection" targets a subsection that does not exist — \S5 has no numbered subsections, only an itemize list.
  - fix: Change to "the \S5 survivor-protection result" or number the bullets.
- **[minor] id68 L370**: The header box says '§9--11 carry the archived module's own PNGB cross-audit, honest status, and attribution', but in this part those items span §§9--13: Honest status is §12 and Attribution is §13.
  - fix: Change to \S\S9--13.
- **[minor] id69 L582**: The Honest-status bullet discusses 'the z_aeon result' and cites '3.4's scoping', but no §3.4 exists in this part and the z_aeon apparatus is not carried here (it was relocated to the Operator B'/Part VII sections in V3.5), leaving a dangling reference from the archived module; line 614's bottom line likewise still claims this module 'shows ... z_aeon is undeterminable'.
  - fix: Drop or repoint the bullet (and the z_aeon clause in the line-614 summary) to the relocated section in the Operator B' part.
- **[minor] id74 L645**: Radiation dilution is quoted as a^3 ~ 10^180 per interlude, but radiation energy density dilutes as a^4 (~10^240 for the same a-growth); the document itself scopes the a^3 factor to matter one section later.
  - fix: Either quote a^4 ~ 10^240 for radiation energy, or state explicitly that a^3 tracks photon number density.
- **[minor] id75 L666**: "~8x10^56 m ≈ 10^26 island radii" is inconsistent with the module's own island radius R_isl = 1107 R_obs: the ratio is 1.6x10^27, an order of magnitude larger than stated.
  - fix: Change to ≈10^27 island radii, or correct the 8x10^56 m figure if the 10^26 count is the intended output.
- **[minor] id78 L706**: The boundary-injection sentence quotes two energies whose ratio is ~7x10^19, then concludes ("so") an injection factor of 10^26 to 10^43-47 — no arithmetic combination of the quoted numbers yields either stated factor, so the passage cannot be reconciled without external definitions.
  - fix: Decouple the two statements: give the energy shortfall (~10^20 in raw energy) separately from the temperature-rescale factor Omega, or state Omega's definition inline.
- **[minor] id77 L728**: "No remnant / full Mc^2 returned by unitary Hawking evaporation" is tagged [Fact], but unitarity does not by itself exclude remnants (remnant scenarios are themselves proposed unitary resolutions), and the information-paradox endgame is not an established experimental fact; the corresponding claim at line 656 carries no tag at all.
  - fix: Tag as [Fact-theory] or [Hypothesis] (mainstream expectation, e.g. from the island/replica-wormhole results), and tag line 656.
- **[minor] id83 L835**: The benchmark's gravity check uses the wrong control parameter: CDL gravitational corrections are governed by the bubble-radius-to-Hubble-radius ratio R0*H_F ∝ δ^(-1/2), not by ΔV/M_p^4, so the stated criterion would wrongly certify the flat-space value for arbitrarily shallow tilts — the very regime the same sentence admits can quench nucleation.
  - fix: Replace the criterion with the thin-wall CDL parameter, e.g. "R0/Λ = √3 S_1/(√ΔV M_p) ≈ 0.01/√δ ≪ 1 across the quoted tilts".
- **[minor] id82 L837**: The open condition characterizes the survivor's terminal flash as "a ~10^-20 K flash", but 6.17e-20 K is the initial Hawking temperature of a 1e12 Msun hole (line 878), the coldest point of the evaporation history, whereas line 835 locates the trigger at the post-evaporation Planck-scale sliver, which radiates at ~1e26 K.
  - fix: Rephrase, e.g. "whether the terminal flash of a hole that spent its life at ~10^-20 K can nucleate a ~10^16 GeV transition", or quote the endpoint temperature.
- **[minor] id81 L935**: The "live ceiling sits +11.8 dex away" figure does not follow from the sentence's own reference point: the live-phase Nariai ceiling M_Nariai(H~H0)=1.789e22 Msun (R6 record, line 982; eq. at line 649 gives 1.7e22) sits +11.25 dex above the stated band centre of 1e11 Msun.
  - fix: Either change to "+11.3 dex" (from the 1e11 reference used for the floor) or state the reference mass explicitly.
- **[minor] id84 L962**: The standing-tension paragraph carries multiple load-bearing quantitative claims (a_star~0.55 expectation, N_misaligned <= 0.56-2.26, tension factor 2.6-10.6, aligned fraction >= 62%) but ends with no [Fact]/[Hypothesis]/[Auditor] tag — the only untagged substantive paragraph in Parts IV-V.
  - fix: Append the appropriate tag (presumably \Auditor for the inversion arithmetic / \hyp for the walk model), matching the document's stated label discipline.
- **[minor] id90 L991**: The update note claims its two findings are 'folded into \S7 and the closing \S21 of this part', but neither section contains them: \S7 (line 1062) is the relic dynamical-mass confrontation with no spin-measurability content, and \S21 (line 1221) still presents the claim as falsifiable/[Open] with no mention of in-principle relic unmeasurability or an M87 high-spin trend.
  - fix: Point the fold-in at the sections that actually carry the material (\S5 and the unfalsifiability subsection after \S21), or actually fold the two findings into \S7 and \S21.
- **[minor] id94 L1030**: The measured-spin-trend paragraph makes load-bearing factual claims about published data (~50-hole X-ray reflection sample, high-spin-at-low-mass trend) but carries no [Fact]/[Hypo]/[Open] tag, unlike every other paragraph of \S5.
  - fix: Append the appropriate tag (presumably \Fact for the sample description plus \Auditor for the non-discrimination verdict).
- **[minor] id92 L1032**: NGC 1277's velocity dispersion is sigma≈333 km/s in \S2 but 'the adopted sigma=317 km/s' in \S5 of the same part; the headline +0.24 dex M–sigma offset only follows from 317 (at 333 it is +0.12 dex), and the switch is unexplained.
  - fix: State one adopted sigma for NGC 1277 (with source) and use it in both sections, or note the sensitivity (+0.24 -> +0.12 dex between the two literature dispersions).
- **[minor] id91 L1178**: The Part VI stress-test table misquotes the document's own spin-decoupling numbers: it lists the document's median Delta-a* as 0.45 (the document says 0.49 median / +0.48 fiducial) and the document's fiducial cluster spin as ~0.55 (the document's table says 0.522).
  - fix: Quote 0.49 (median) / 0.48 (fiducial) and 0.52 (fiducial cluster spin) as the document values; the ~2x magnitude-gap conclusion is unaffected.
- **[minor] id102 L1340**: The scale check claims molecular-cloud (pc to 100 pc) matter energy density exceeds Lambda by ~10^10-10^14, but at typical GMC densities of 10^2-10^3 cm^-3 the ratio is only ~10^8-10^9; the stated range requires n ~ 10^4-10^8 cm^-3, i.e. dense clumps/cores well below pc scale.
  - fix: Change to ~10^8-10^11 (clouds to dense cores), or re-scope the quoted range to core densities; the argument's conclusion (DE dynamically irrelevant) is unaffected.
- **[minor] id98 L1356**: Dead-end C4 twice states the survivor-to-child energy deficit as "~20 orders" while the same two numbers are called a "~10^22 gap" at line 1348 and "~22 orders short" at line 1360; the correct value is 22 orders.
  - fix: Change both "~20 orders" instances in C4 (and the matching "~20 orders" in the 3.16 revision note, line 1505) to "~22 orders".
- **[minor] id101 L1356**: C4's virial-ceiling clause equates kT_vir ~ (1/2) m_p c^2 with T_vir = m_p c^2/(10 k_B) via "i.e.", but the two expressions differ by a factor of 5 (the (1/2) m_p c^2 form gives 5.4e12 K, not 1.09e12 K).
  - fix: Write kT_vir ~ (1/10) m_p c^2 (virial convention T = GMm_p/(5 k_B R) at R = R_s), or drop the (1/2) clause.
- **[minor] id99 L1500**: A stray closing brace at the end of the 3.14-continuation entry prematurely closes the {\small group opened at line 1473, so every revision-history entry from 3.14->3.15 (line 1503) to 3.16->3.17 (line 1535) silently renders at normal size instead of \small.
  - fix: Delete the trailing "}" on line 1500 and close the {\small group after the last revision entry (before the Session-record digest \part at line 1537).
- **[minor] id115 L1535**: The revision history is out of chronological order: the 3.16→3.17 entry and three other 3.16-dated entries (2026-06-24) are placed after the 3.24→3.25 entry (2026-07-02), so the printed chain jumps from '3.16 continuation' straight to '3.17→3.18'.
  - fix: Move the four displaced 3.16-era entries to their chronological position between lines 1507 and 1509, or add a note explaining the appended placement.
- **[nit] id63 L187**: The spin random walk is written a₀/√N here but a₀/√(1+N) in the Falsifiers section (line 330); only the √(1+N) form is consistent with the Γ/(1+N) term in eq. (5) and the C_mrg=1/2 derivation.
  - fix: Write a₀/√(1+N) at line 187 as well.
- **[nit] id64 L199**: Starvation quenching is attributed to Bullock et al. (2000), whose paper is about reionization suppression of galactic satellites; the canonical starvation/strangulation references are Larson, Tinsley & Caldwell (1980) or Balogh, Navarro & Morris (2000).
  - fix: Cite Larson et al. (1980) and/or Balogh et al. (2000) for starvation, or keep Bullock et al. (2000) only for the dwarf-suppression context.
- **[nit] id72 L437**: The honest caveat quantifies the acceleration hump as 'a ~5% variation in ä/a across a=0.85--1.2', but for the run whose numbers Result 3 quotes (m=1.0) the variation is ~6.5-7% (and ~13% for the pinned m=0.804 run).
  - fix: Say ~7% (m=1.0 run) or recompute for the pinned run.
- **[nit] id70 L465**: The invariance claim 'every potential lands in w0∈[-0.81,-0.99]' is contradicted by the table's own first row (w0=-0.806, outside the stated interval), and the interval endpoints are written in reversed order.
  - fix: Write $w_0\in[-0.99,-0.81]$ and round the bound to $-0.80$, or restate as $w_0\in[-0.99,-0.80]$.
- **[nit] id71 L516**: Run 2 calls the first-crossing epoch 'μ-dependent', but the field mass is denoted m throughout this part; μ is never defined in it.
  - fix: Change $\mu$-dependent to $m$-dependent.
- **[nit] id79 L654**: Naming collision: channel 3 is labeled "the cold source", but channel 1 (the survivor) was already described in bold as a "cold source" nine lines earlier, blurring the channel taxonomy (slow/fast/cold).
  - fix: Rename channel 1's description (e.g. "slow, cold bleed") or channel 3's label (e.g. "the drift source").
- **[nit] id76 L748**: The fiducial entropy growth factor is given as 4.1x10^14 here but as 4.0x10^14 at line 722 in the same module (and the file's own reproduction pass, line 1263, computes 4.01x10^14), so the bolded 4.1 appears stale.
  - fix: Use one value consistently (4.0x10^14 per the reproduction run).
- **[nit] id87 L822**: The slow-roll relations r=16eps, A_s=V/(24 pi^2 eps M_p^4) and n_s=1-6eps+2eta are attributed wholesale to "Mukhanov--Chibisov 1981", which computed only the scalar spectrum; the tensor consistency relation and the n_s slow-roll expansion are later results (Starobinsky 1979 for tensors; Liddle--Lyth-era slow-roll formalism).
  - fix: Cite e.g. "Starobinsky 1979; Mukhanov--Chibisov 1981; Liddle--Lyth 1992" for the three relations.
- **[nit] id86 L857**: The g-floor table row writes the mass cut as "n >= 10^9 Msun holes", comparing the symbol n (used as a number density, 10^-5 Mpc^-3, in the same cell) to a mass.
  - fix: Change to "only $M\ge10^{9}M_\odot$ holes".
- **[nit] id85 L906**: The baryon number density from the same fresh R6 run is quoted as 0.2505 m^-3 in B4' but 0.2504 m^-3 in the R6 recomputation record (line 982).
  - fix: Reconcile the two to whichever the R6 script actually produced.
- **[nit] id96 L1203**: 'The live falsifier of \S9' resolves, in this part's continuous numbering, to \S9 'The dwarf empty-centre axes' (line 1089), which contains no super-Eddington/M–sigma self-regulation falsifier; the intended target is Part I \S9 'Falsifiers' (line 329), but the part qualifier is missing.
  - fix: Write 'Part I \S9' (or use a \label/\ref pair) to disambiguate.
- **[nit] id93 L1244**: Two entries in 'References added in this audit' — Inayoshi & Ichikawa (2024) and Reynolds (2024) — are cited nowhere in the audit text (or anywhere else in the file), contradicting the list's closing claim 'All used as owned results'.
  - fix: Either cite the two works where their results are used in the audit sections, or drop them from the added-references list.
- **[nit] id105 L1358**: The anti-concentration parenthetical mixes mass-orders and density-orders in one arithmetic-looking chain: "survivors ~50 orders too massive; torsion's lower ceiling eases ~39, leaving ~60" reads as 50-39=60; the 39/60 are density orders (99-39=60), while in mass orders torsion eases only ~19.5, leaving ~30.
  - fix: State the units of each step, e.g. "(99 density orders below rho_c; torsion's ceiling eases ~39 of them, leaving ~60 — in mass, survivors remain ~30 orders too heavy)".
- **[nit] id106 L1409**: In the master attribution table the owner cell "Emsellem et al. 2011; Cappellari" cites Cappellari without a year, unlike every other row.
  - fix: Add the year (presumably Cappellari 2016, ARA&A review).
- **[nit] id104 L1476**: The Jeans margin is quoted as 2895 in the V3.5->3.6 revision entry but as 2896 in the stress audit (line 1263) and the V3.14 note (line 1497); the computed value is 2895.8, so 2895 is a truncation inconsistent with the live figure.
  - fix: Use 2896 consistently.
- **[nit] id103 L1495**: The 3.12->3.13 revision entry is truncated mid-sentence: it ends "V4.0 remains reserved" with no period and without the "for a physics verdict" tail every other entry carries.
  - fix: Complete the sentence: "V4.0 remains reserved for a physics verdict."

### LMU_companion_glossary.md — 1 minor, 1 nit

- **[minor] id32 L151**: The P(k) entry glosses A_s as "the overall amplitude (~10⁻⁵ contrast)", inviting the misreading A_s ≈ 10⁻⁵ when the governing document's target is A_s = 2.1×10⁻⁹; the ~10⁻⁵ figure is the density contrast δ ≈ √A_s ≈ 4.6×10⁻⁵, a 4-orders-of-magnitude conflation in a document whose own header declares "significant figures are sacred".
  - fix: Reword: "A_s is the overall power amplitude (2.1×10⁻⁹, corresponding to ~10⁻⁵ density contrast)".
- **[nit] id33 L17**: The log₁₀ entry drops the argument ("log₁₀ = 122" should be "log₁₀ x = 122"), and the lead-in "counts *digits*" is off by one (a number with log₁₀ x = 122, i.e. 1 followed by 122 zeros, has 123 digits).
  - fix: Write "log₁₀ x = 122" and gloss as "counts zeros" or "counts orders of magnitude" rather than digits.

### README.md — 1 minor

- **[minor] id111 L28** ⚡แก้ได้ทันที (README ให้ตรงเอกสาร: 14/14 → 13/13): README claims 'dimensional audits pass 14/14' but the document records the audit as 13/13 in both places it is stated, and 14/14 appears nowhere in the .tex.
  - fix: Change to 13/13 (or update the .tex audit record if a 14th check was actually added).

### Robotic_Mining_Architecture_Notes.md — 5 minor, 2 nit

- **[minor] id35 L32**: Mars is stated as "~100× farther" than the Moon, but even at closest approach the ratio is ~142×, and ~585× at average distance.
  - fix: Change to "~150–600× farther depending on orbital positions" or "hundreds of times farther".
- **[minor] id36 L45**: The document consistently uses the one-way light delay (1.3 s) as the operative teleoperation/ask-Earth delay, but the operator's control loop is the round trip, ~2.6 s; the [Fact] tag masks this conflation.
  - fix: State "1.3 s one-way / ~2.6 s round trip" once and use the round-trip figure for the teleoperation and fallback-loop claims.
- **[minor] id39 L77**: "Remote surgery" is cited as a demonstrated example of teleoperation at 1–2 s latency, but actual remote surgeries have operated at sub-second (typically sub-300 ms) latency; 1–2 s surgical teleoperation is experimental, not demonstrated practice.
  - fix: Drop 'remote surgery' or reword to an example genuinely demonstrated at 1–2 s (e.g., satellite-linked ROV/rover supervised teleoperation).
- **[minor] id37 L99**: The [unverified] tag is used with the opposite meaning of its own legend definition.
  - fix: Either redefine [unverified] in the legend ("no supporting source found") or introduce a distinct tag such as [not-found] for checked-but-unsupported claims.
- **[minor] id40 L123**: Mars is called a "depot" here, contradicting the role assignment in §1 where Moon = depot and Mars = stockpile; and "Mars can't hold an atmosphere" is loose (Mars holds a thin ~6 mbar atmosphere; the loss argument is about a thick/terraformed one).
  - fix: Change 'depot' to 'stockpile/staging point' and qualify to 'can't retain a thickened atmosphere long-term'.
- **[nit] id41 L110**: The [Design] tag is used twice but is not declared in the epistemic-tag legend.
  - fix: Add [Design] to the legend on line 5.
- **[nit] id42 L126**: The horizontal rule directly abuts the preceding paragraph with no blank line, so CommonMark/GitHub parses the dashes as a setext underline and renders the closing sentence as a large H2 heading instead of a paragraph followed by a rule.
  - fix: Insert a blank line between lines 125 and 126.

> หมายเหตุ id39 (`Robotic_Mining_Architecture_Notes.md:77`, remote surgery latency) เป็นข้อเดียวที่ verifier ไม่ได้ตรวจ (unchecked) — สถานะอ่อนกว่าข้ออื่น

---

## C) คิวงานนอกรายการ findings

1. **R11.3 — GitHub About (ทำมือ):** แก้ "Fact/Hypo-labelled" → "Fact/Hypothesis-labelled" ใน repo Settings → About
2. **R11.4 — Zenodo v3.25 record (ทำมือ):** แก้ description block เป็นข้อความ eight-tag ชุดเดียวกับ ABOUT_AND_TAGS.md:107 ฉบับปัจจุบัน (Zenodo แก้ metadata ได้โดยไม่ bump version)
3. **Author eyeball ก่อน merge (ตาม addendum):** ชื่อ section Attribution ใหม่ 4 อัน + diff `\Fact`→`\factth` 2 จุด (ดูใน PR diff)
4. **หลัง merge — V3.26 bundle (R10/R15):** bump `\lmuver` → 3.26, เขียน revision-history block, rename `LMU_V3_26_consolidated.*`, อัปเดต README/CITATION/CHANGELOG/ABOUT_AND_TAGS, rebuild + certify (เซสชันนี้มี TeX แล้ว — ทำได้ในนี้)
5. **สคริปต์ตรวจที่ README สัญญาไว้:** CODATA spine / KG re-integration / dimensional audit ยังไม่มีใน `/code` (ตอนนี้มีเฉพาะ `lmu_endgame_repro.py`)


---

## Application record — Addendum 2 (R17–R29), 2026-07-04

**Applied (60 items):** A-majors id13, id57, id66, id73, id80, id88+id90 (default arm — รอคำตอบผู้เขียนเรื่องแหล่ง 2026), id89, id97 (×4 จุดค่า retired), R26 (id46 preferred-citation), R27 (id53) · B-batch ทุกข้อรวม overrides: id81 (+11.3), id82, id115 (placement note, ไม่ resort), id93 (ตัด 2 อ้างอิง), id23 (arm 2), id92+id59 (σ=317 ทั้งสองจุด) · id39 [unverified→reworded]

**Partial / skipped (แจ้ง adjudicator):**
- id77: retag ประโยค no-remnant แล้ว (`\factth`) แต่ "tag line 656" หาประโยคเป้าหมายที่บรรทัดนั้นไม่พบ — ขอ pointer
- id94: เพิ่ม `\Fact` ที่ sample claim แล้ว; ตำแหน่ง `\Auditor` ของ verdict clause ยังไม่ชี้ชัด
- id92: ใช้ "(the adopted value, \S5)" เป็น source pointer — วรรณกรรมต้นทางของ σ=317 ต้องให้ผู้เขียนระบุ (ruling สั่ง "with source")

**Certification (R29-C.4):** XeLaTeX ×2 · 0 errors · **103 pages** (ลดจาก 104 — การปิดกลุ่ม `{\small` ที่แตก (id99) ทำให้ revision history กลับไปตัวเล็กตามที่ตั้งใจ) · section destinations **75/75 distinct, 0 duplicates** (pypdf Names-tree walk)

**เหลือ (human):** id12 (เลือกโครงสร้าง), id88 (มีแหล่ง 2026 จริงไหม — yes/no), C.1/C.2 (GitHub About / Zenodo, ทำมือ), C.3 eyeball (Attribution ×4 + `\Fact`→`\factth` ×3), V3.26 bundle + R25 stage-2 (ε 4.6e-2 recompute pass) + C.5 (`code/verify_all.py` — adjudicator ค้างส่ง)

## Application record — Addendum 3, 2026-07-04

- **R23-REVISED (id88):** สถานะ M87* spin → `[Open]` (contested, method-split) — Drew et al. 2025, ApJL 984 L31 (Doppler beaming, a*≳0.8 lower limit; **ยืนยันรายชื่อผู้เขียน/ผลจากหน้า DOI แล้ว**: Drew, Stanway, Patterson, Walton, Ward-Thompson) vs Wong et al. 2025 (polarimetry) · update note เขียนใหม่ตามถ้อยคำ ruling + fold-in ชี้ \S5 rows + [Open] line (id90) · เพิ่มแถว Drew ใน \S5 (prose + estimates row) · ตัดภาษา leaning-against ทุกจุด live (เหลือ 1 จุดใน revision history — append-only)
- **R18-RESOLVED (id12, Option A):** ย้าย C7/C8 blocks (พร้อม anchor {#c7}/{#c8}) ไป §4 ต่อจาก D4; ทิ้ง stub `[derived → §4]` ที่ตำแหน่งเดิมใน §3 และ annotate แถว index §2
- **Certification:** XeLaTeX ×2 · 0 errors · 103 pages · dests 75/75 distinct, 0 duplicates
- **เหลือ (human):** eyeball (Attribution ×4 + \Fact→\factth ×3) → merge → V3.26 bundle (R25 stage-2 ε=4.6e-2 pass, C.5 verify_all.py, page-count 104→103 propagation ใน README/ABOUT)

---

## Application record — V3.26 assembly, 2026-07-04

- **STOP-check ผ่าน:** entry 3.7→3.8 บันทึกค่า 4.6×10⁻² (joint chain covariance, ρ=−0.894) ตรงกับ changeset — ไม่มีข้อขัดแย้ง
- **ε changeset E1–E5 applied** + ลบป้าย "(retired V3.8 convention)" ครบ 4 จุด · residual audit: ค่าเก่าเหลือเฉพาะใน provenance clause ของ E1 · ΔA look-alike (4.6×10⁻³) count ไม่เปลี่ยน (1→1) · changeset เก็บเป็น `review/LMU_V3_26_EPSILON_CHANGESET.md`
- **verify_all.py: ALL PASS 30/30** (CODATA spine 12, KG m-scan 6/6 rows, relic stats 6, N_Q both tiers + retired anchor, tex integrity) — log ใน commit
- **V3.26 bundle:** \lmuver bump, revision entry 3.25→3.26, rename `LMU_V3_26_consolidated.{tex,pdf}`, README/CITATION/CHANGELOG/ABOUT/LICENSE-docs/companions/CONNECTION_MAP อัปเดตครบ, PDF ทางการ build ในเซสชันนี้
- **Certification (C.4):** XeLaTeX ×2 · 0 errors · 103 pages · dests 75/75 distinct, 0 duplicates
- **ปิดคิว:** ทุก ruling R1–R29 + R25 stage-2 + C.5 มี disposition แล้ว — เหลือเฉพาะงานเว็บทำมือ (GitHub About/Release, Zenodo new version, OSF) ตามลำดับใน ABOUT_AND_TAGS §5
