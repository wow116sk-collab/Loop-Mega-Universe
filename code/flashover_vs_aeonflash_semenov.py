#!/usr/bin/env python3
"""Flashover vs the aeon flash: the SAME mathematical class ("runaway past an
unstable equilibrium"), drawn side by side. Produces figs/flashover_vs_aeon_flash.png.

Run to reproduce. All ingredients owned:
  * Semenov thermal-explosion theory (Semenov 1928; Frank-Kamenetskii 1939):
    d(theta)/dt = delta*e^theta - theta ; criticality at delta_cr = 1/e (tangency).
    Flashover as a compartment thermal runaway: fire-safety literature (Thomas 1981;
    McCaffrey-Quintiere-Harkleroad 1981; flashover-as-bifurcation reviews).
  * Hawking emission P = hbar*c^6/(15360*pi*G^2*M^2) (Hawking 1974/75);
    negative heat capacity (T_H ~ 1/M) -> positive-feedback runaway;
    M(t) = M0*(1 - t/t_ev)^(1/3).
  * Gibbons-Hawking bath T_dS = hbar*H/(2*pi*k_B) (1977); capture cross-section
    for relativistic quanta sigma = 27*pi*G^2*M^2/c^4 -> absorption ~ M^2.
  * The unstable equilibrium (T_H = T_dS at M_eq ~ 3e22 Msun) = the document's
    "mortality window" (OPEN_PROBLEMS section 2), here shown to BE a Semenov
    diagram: two competing curves, one unstable crossing, two basins of fate.
STATUS: the pilot-side mapping (runaway + unstable equilibrium) is [Fact-th]
structure-for-structure; the "room ignition" half (field slow-roll onset) stays a
qualitative analogy -- the omega-field is kicked and rolls, it does not Arrhenius-
ignite. Greybody/species prefactors shift M_eq by O(1); slopes +-2 are robust.
"""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# ---------- constants (SI) ----------
G, hbar, c, kB = 6.674e-11, 1.055e-34, 2.998e8, 1.381e-23
a_rad, Msun = 7.566e-16, 1.989e30
H_inf = 1.83e-18                                 # s^-1  (H0*sqrt(Omega_L), matches endgame_anchored_desitter.py)
T_dS = hbar * H_inf / (2 * np.pi * kB)           # Gibbons-Hawking bath

# unstable equilibrium, two owned routes (agree up to greybody O(1)):
M_eq_TH = hbar * c**3 / (8 * np.pi * G * kB * T_dS)                     # T_H = T_dS
M_eq_flux = (hbar * c**9 / (15360 * 27 * np.pi**2 * G**4 * a_rad * T_dS**4)) ** 0.25
print(f"T_dS = {T_dS:.2e} K")
print(f"M_eq (T_H = T_dS)      = {M_eq_TH/Msun:.2e} Msun")
print(f"M_eq (flux balance)    = {M_eq_flux/Msun:.2e} Msun   (greybody O(1) apart)")
print(f"survivor band 1e10-1e12 Msun sits {np.log10(M_eq_TH/Msun/1e12):.1f}-"
      f"{np.log10(M_eq_TH/Msun/1e10):.1f} orders below the ceiling")

# ---------- palette (validated: Okabe-Ito pair + neutral inks) ----------
BLUE, ORANGE = "#0072B2", "#D55E00"       # loss/absorption vs generation/emission
INK, MUT, GRID = "#333333", "#777777", "#dddddd"
plt.rcParams.update({
    "font.size": 9.5, "axes.edgecolor": MUT, "axes.labelcolor": INK,
    "xtick.color": MUT, "ytick.color": MUT, "text.color": INK,
    "axes.titlesize": 10.5, "figure.facecolor": "white",
})

fig, axs = plt.subplots(2, 2, figsize=(11, 8.2))
fig.subplots_adjust(hspace=0.44, wspace=0.28, top=0.865, bottom=0.09)

# ================= (a) Semenov diagram -- room flashover =================
ax = axs[0, 0]
th = np.linspace(0, 3.2, 400)
loss = th
ax.plot(th, loss, color=BLUE, lw=2)
ax.text(2.62, 2.28, "heat loss ~ (T − T₀)", color=BLUE, fontsize=8, rotation=35)
curve_tags = [(0.22, ":", "small fire", 2.88), (np.e**-1, "--", "critical (tangent)", 2.28),
              (0.55, "-", "big fire", 1.92)]
for delta, ls, tag, xlab in curve_tags:
    ax.plot(th, delta * np.exp(th), color=ORANGE, lw=2, ls=ls)
    ax.text(xlab + 0.06, delta * np.exp(xlab), tag, color=ORANGE, fontsize=8, va="center")
# equilibria on the sub-critical curve: delta*e^th = th
sub = 0.22
roots = [t for t in np.linspace(0.01, 3.1, 40000) if abs(sub*np.exp(t) - t) < 2e-4]
stab, unst = roots[0], roots[-1]
ax.plot(stab, stab, "o", color=INK, ms=7, zorder=5)
ax.plot(unst, unst, "o", mfc="white", mec=INK, ms=7, zorder=5)
ax.annotate("stable\n(fire in a room)", (stab, stab), xytext=(0.75, 0.18), fontsize=8.5,
            arrowprops=dict(arrowstyle="-", color=MUT, lw=0.8))
ax.annotate("unstable", (unst, unst), xytext=(2.15, 1.15), fontsize=8.5,
            arrowprops=dict(arrowstyle="-", color=MUT, lw=0.8))
ax.annotate("no equilibrium left\n→ RUNAWAY = flashover", xy=(2.0, 0.55*np.exp(2.0)),
            xytext=(0.35, 3.35), fontsize=9, fontweight="bold", color=ORANGE,
            arrowprops=dict(arrowstyle="->", color=ORANGE, lw=1.4))
ax.set_xlim(0, 4.4); ax.set_ylim(0, 4.6)
ax.set_xlabel("room temperature  θ"); ax.set_ylabel("power")
ax.set_title("(a) Flashover — Semenov diagram\ngeneration (Arrhenius) vs loss (linear)")

# ================= (b) BH in the Gibbons-Hawking bath =================
ax = axs[0, 1]
M = np.logspace(8, 26, 400) * Msun
P_emit = hbar * c**6 / (15360 * np.pi * G**2 * M**2)
P_abs = (27 * np.pi * G**2 * M**2 / c**4) * c * a_rad * T_dS**4
ax.loglog(M / Msun, P_emit, color=ORANGE, lw=2)
ax.loglog(M / Msun, P_abs, color=BLUE, lw=2)
ax.set_ylim(1e-104, 1e-38)
ax.text(1.2e14, 2e-53, "Hawking emission ∝ M⁻²\n(hotter as it shrinks:\nnegative heat capacity)",
        color=ORANGE, fontsize=8.5)
ax.text(4e8, 3e-92, "absorption from the\nT_dS bath ∝ M²", color=BLUE, fontsize=8.5)
Meq = M_eq_flux / Msun
Peq = hbar * c**6 / (15360 * np.pi * G**2 * M_eq_flux**2)
ax.plot(Meq, Peq, "o", mfc="white", mec=INK, ms=8, zorder=5)
ax.annotate(f"unstable equilibrium\nT_H = T_dS,  M_eq ≈ {M_eq_TH/Msun:.0e} M☉",
            (Meq, Peq), xytext=(1.5e18, 1e-64), fontsize=8.5,
            arrowprops=dict(arrowstyle="-", color=MUT, lw=0.8))
ax.annotate("", xy=(1e10, 3e-42), xytext=(5e15, 3e-42),
            arrowprops=dict(arrowstyle="->", color=ORANGE, lw=1.6))
ax.text(2e10, 6e-41, "runaway evaporation → terminal FLASH", color=ORANGE,
        fontsize=9, fontweight="bold")
ax.annotate("", xy=(1e25, 1e-100), xytext=(2e22, 1e-100),
            arrowprops=dict(arrowstyle="->", color=BLUE, lw=1.6))
ax.text(6e18, 2e-99, "grows forever\n(immortal branch)", color=BLUE, fontsize=8.5)
ax.axvspan(1e10, 1e12, color=GRID, alpha=0.55, zorder=0)
ax.text(1e11, 4e-103, "real survivors\n10¹⁰–10¹² M☉", ha="center", fontsize=8, color=MUT)
ax.set_xlabel("black-hole mass  M  (M☉)"); ax.set_ylabel("power  (W)")
ax.set_title("(b) Aeon flash — the survivor in the bath\nemission vs absorption; the mortality window")

# ================= (c) room runaway T(t) =================
ax = axs[1, 0]
delta = 0.42                                   # just above delta_cr = 1/e
th_v, t_v, dt = 0.0, 0.0, 1e-4
TT, TH = [], []
while th_v < 6.0:
    TT.append(t_v); TH.append(th_v)
    th_v += (delta * np.exp(th_v) - th_v) * dt
    t_v += dt
TT, TH = np.array(TT), np.array(TH)
ax.plot(TT / TT[-1], TH, color=ORANGE, lw=2)
ax.axhline(3.0, color=MUT, lw=1, ls="--")
ax.text(0.04, 3.15, "flashover threshold", fontsize=8.5, color=MUT)
ax.set_xlabel("time  t / t_flashover"); ax.set_ylabel("room temperature  θ(t)")
ax.set_title("(c) Flashover clock: slow creep →\nfinite-time runaway (δ just above 1/e)")
ax.set_xlim(0, 1.02)

# ================= (d) BH runaway T_H(t) =================
ax = axs[1, 1]
x = np.linspace(0, 1 - 1e-9, 2000)
ax.semilogy(x, (1 - x) ** (-1.0 / 3.0), color=ORANGE, lw=2)
ax.set_xlabel("time  t / t_ev"); ax.set_ylabel("T_H(t) / T_H(0)")
ax.set_title("(d) Aeon-flash clock: T_H ∝ (1 − t/t_ev)^(−1/3)\nslow creep → finite-time crescendo")
ax.axvline(1.0, color=MUT, lw=1, ls="--")
ax.text(0.86, 30, "terminal\nFLASH", color=ORANGE, fontsize=9, fontweight="bold")
ax.set_xlim(0, 1.04); ax.set_ylim(1, 1e3)

fig.suptitle("Flashover and the aeon flash: the same class — runaway past an unstable equilibrium", fontsize=12, y=0.988)
fig.text(0.5, 0.922, "P1 two competing power curves · P2 one unstable crossing, two basins of fate\n"
         "P3 positive feedback (Arrhenius ↔ negative heat capacity) · P4 slow creep, finite-time finale",
         ha="center", fontsize=8.7, color=MUT)
fig.text(0.5, 0.012,
         "Owned: Semenov 1928 / Frank-Kamenetskii 1939 · Thomas 1981 / MQH 1981 · Hawking 1974 · Gibbons–Hawking 1977.\n"
         "Mapping covers the PILOT (match) only — the field's slow-roll onset is not an Arrhenius ignition (that half stays "
         "qualitative). Greybody O(1) shifts M_eq. [reading: Hypo]",
         ha="center", fontsize=7.3, color=MUT)

out = "figs/flashover_vs_aeon_flash.png"
fig.savefig(out, dpi=170)
print("wrote", out)
