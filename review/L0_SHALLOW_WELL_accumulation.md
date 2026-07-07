# The L0 shallow-well accumulation picture — consolidated

> **หมายเหตุ (2026-07-07):** ภาพ accumulation ด้านล่าง (shallow well, flash=trigger, free lunch, +3 spread, trigger→plateau coupling) **ยังเป็นปัจจุบัน**. แก้จุดเดียว — วลี "always-open de-Sitter-stability question" (ท้ายไฟล์, §Net) = **superseded**: de Sitter stability = คำถาม field-wide ที่ LMU แชร์ ไม่ใช่ปมของ LMU (reset เป็น deterministic flash ไม่ต้องมี barrier). ปมเฉพาะ LMU = **2** (+3 spread [soft], wiring [Hypo]). SSOT = **`review/LMU_SYNTHESIS_2026-07-07.md`**.

**Date:** 2026-07-07 · **Reproduce:** `code/backcalc_from_cmb_floor.py` · **Doc-checked** (lines cited) · **Status:** the setup is doc-supported; one coupling + one soft exponent remain open.

Pitarn's picture, assembled across the session and consolidated here so it stops scattering. Every piece is doc-cited or borrowed; the wiring is the assembly.

## The picture (one line)

In infinite **L0**, dead remnants pile into a **broad, shallow, non-collapsing well** (calm because only cold matter accumulates); a **flash** from the survivor's evaporation is the **trigger** (not the energy); the **free lunch** supplies the GUT energy; and **inflation (N≈57)** dilutes the residual to the measured de Sitter floor. The "hilltop" is *built by accumulation* (self-organized criticality), not a pre-existing barrier — which is why the swampland/tunnelling apparatus does not apply.

## The chain, each step doc-cited

| step | claim | source |
|---|---|---|
| 1 | Accumulation forms a well, but it **does NOT collapse to a black hole**: black holes anti-concentrate, $\rho_{\rm BH}=3c^6/(32\pi G^3M^2)\propto1/M^2$; a $10^{11}M_\odot$ survivor is $\sim1.8\times10^{-3}$ kg/m³ — **less dense than air** — $\sim$99 orders below $\rho_c$. In infinite L0 it stays a shallow well. | **doc L1364** (anti-concentration); L1515, L1562 |
| 2 | **Only calm/cold matter accumulates** (hot/turbulent free-streams away), so the pile is thermally quiescent — and, being broad + less-dense-than-air, one **laminar clump of LOW Weyl**, not a sharp high-Weyl knot. | standard structure formation (cold clusters, hot doesn't) |
| 3 | The pile **does not self-ignite**; the survivor's terminal **flash is only a trigger, not the source**. | **doc L824, L828** ("not q0→q1, a spurious self-ignition of L0"; "flash needs only to be a sufficient trigger") |
| 4 | The GUT energy is the **inflationary free lunch** ($E=\rho V$ at no net cost), NOT the diffuse well (which is far below GUT density). $V^{1/4}\approx8\times10^{15}$ GeV. | **doc L824** (Guth 1981) |
| 5 | The remaining Weyl of the (already-gentle) pile is **diluted by inflation** $e^{-2N}$ per point $\to10^{-49}$, spread $\to$ the de Sitter floor. | seam `code/aeon_seam_construction.py` [B] |

## The reverse ledger, anchored on the two measured values (CMB + 10⁻¹²²)

`code/backcalc_from_cmb_floor.py` — take the CMB and the de Sitter floor as anchors, compute backward:

- **N from the CMB tilt:** $N=2/(1-n_s)=57$.
- **The floor pins the (previously soft) dilution exponent:** to take an O(1) residual down to $10^{-122}$ in $N=57$ e-folds needs $k=122\ln10/N=\mathbf{4.93}$. The hand-wave $k=2+3=5$ matches to **1%**; the rigorous $k=2+1.5=3.5$ would need $N=80$ and **misses**. So anchoring on both measured values *demands* $k\approx5$ — the framework is consistent **iff the "+3" spread is right**.
- **Pre-aeon inhomogeneity implied:** $\delta_{\rm init}=10^{-122}e^{+kN}\approx\mathbf{1}$ — i.e. the shallow well starts at O(1) inhomogeneity (not $\gg1$, precisely because it is calm and less-dense-than-air), and inflation dilutes it to the floor.

## What is closed vs open (honest)

**Closed / doc-supported (the setup):**
- No collapse to a black hole (anti-concentration, L1364) — the "shallow infinite well." ✓
- Calm/low-Weyl pile (only cold accumulates; broad + diffuse). ✓
- Flash = trigger, not energy (L824). ✓
- Energy = free lunch, not the well (L824). ✓
- The two measured anchors (N=57 from CMB, 10⁻¹²² floor) are mutually consistent at $k\approx5$. ✓

**Open (two items, sharp):**
1. **The exponent's "+3" spread is a hand-wave** — the anchors demand $k\approx4.93$; the physical spread gives $+3$ (→5) by hand-waving, but rigorous statistical averaging gives $+1.5$ (→3.5), which fails. Deriving the spread is the smoothness half of Problem A.
2. **The trigger→plateau coupling** — how the flash, acting on the cold diffuse well, lifts the $\omega$-inflaton onto the GUT plateau so the free lunch can fire. This is the single un-equationed link.

**Net:** the accumulation setup is essentially all doc-backed; the picture reduces the reset to two sharp, quantifiable open pieces (the +3 spread; the trigger→plateau coupling), plus the always-open de-Sitter-stability question dissolved into "does a self-built hilltop count" (it evades the pre-existing-barrier swampland form). No new equation; the wiring is the assembly.
