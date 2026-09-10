#!/usr/bin/env python3
"""I69 — fifteen pendulums, and whether the wave is real or an artefact.

THE DESIGN. Give pendulum n a length such that it completes exactly N_n swings
in a cycle of TAU seconds. Then at t=TAU every pendulum has returned to its
exact starting state at the same instant, and the row is a straight line again.
Between those instants the phases fan out and produce travelling waves, then
counter-rotating groups, then apparent chaos.

    T_n = TAU / N_n        and        L_n = g (T_n / 2pi)^2

THE PROBLEM WITH THAT. `T = 2pi sqrt(L/g)` is the SMALL-ANGLE approximation. A
real pendulum's period grows with amplitude:

    T(theta0) = 2pi sqrt(L/g) * (2/pi) K(sin^2(theta0/2))

So the design above is built on an idealisation, and this script's job is to
find out whether the wave survives the real equation. It integrates the actual
nonlinear system

    theta'' = -(g/L) sin(theta)

with RK4 and no approximation anywhere, under the two ways a real demonstration
can be released:

    ANGLE         every bob pulled to the same ANGLE
    DISPLACEMENT  every bob pulled to the same horizontal DISTANCE, which is
                  what a single lifting bar actually does

These are not the same experiment and they do not give the same answer.
"""
import numpy as np

G, TAU, N0, COUNT = 9.80665, 30.0, 26, 15
NS = np.arange(N0, N0 + COUNT)
LENGTHS = G * (TAU / NS) ** 2 / (4 * np.pi ** 2)


def true_period(L, th0):
    """Exact nonlinear period by the AGM, which converges in a few iterations."""
    a, b = 1.0, np.cos(th0 / 2.0)
    for _ in range(60):
        a, b = (a + b) / 2.0, np.sqrt(a * b)
    return 2 * np.pi * np.sqrt(L / G) / a


def integrate(L, th0, t_end, dt=2e-4):
    """RK4 on theta'' = -(g/L) sin theta. Returns (theta, omega) at t_end."""
    n = int(round(t_end / dt))
    th = np.array(th0, dtype=float)
    om = np.zeros_like(th)
    k = G / np.asarray(L, dtype=float)

    def acc(x):
        return -k * np.sin(x)

    for _ in range(n):
        a1, b1 = om, acc(th)
        a2, b2 = om + 0.5 * dt * b1, acc(th + 0.5 * dt * a1)
        a3, b3 = om + 0.5 * dt * b2, acc(th + 0.5 * dt * a2)
        a4, b4 = om + dt * b3, acc(th + dt * a3)
        th = th + dt / 6.0 * (a1 + 2 * a2 + 2 * a3 + a4)
        om = om + dt / 6.0 * (b1 + 2 * b2 + 2 * b3 + b4)
    return th, om


print(f'{COUNT} pendulums, {NS[0]}..{NS[-1]} swings in {TAU:.0f} s\n')
print(f'{"n":>3s} {"swings":>7s} {"length m":>9s} {"period s":>9s}')
for i in (0, 1, COUNT - 2, COUNT - 1):
    print(f'{i+1:3d} {NS[i]:7d} {LENGTHS[i]:9.4f} {TAU/NS[i]:9.4f}')
print(f'\nlongest {LENGTHS[0]*100:.1f} cm, shortest {LENGTHS[-1]*100:.1f} cm, '
      f'ratio {LENGTHS[0]/LENGTHS[-1]:.3f}')

# ── how far off is the textbook period at a realistic amplitude? ────────────
print('\nnonlinear period stretch C = T_true / T_smallangle:')
for deg in (5, 10, 15, 20, 30):
    th0 = np.radians(deg)
    C = true_period(LENGTHS[0], th0) / (TAU / NS[0])
    print(f'  {deg:2d} deg -> C = {C:.5f}   cycle becomes {TAU*C:6.2f} s')

# ── the two release modes ───────────────────────────────────────────────────
print('\nphase spread one cycle after release (0 = a perfect straight line):')
print(f'{"release":>26s} {f"at t={TAU:.2f}s":>12s} {f"at t={TAU:.0f}*C":>11s}   verdict')

for label, th0 in (
        ('same ANGLE, 15 deg', np.full(COUNT, np.radians(15.0))),
        ('same ANGLE, 25 deg', np.full(COUNT, np.radians(25.0))),
        ('same DISPLACEMENT 6 cm', np.arcsin(np.clip(0.06 / LENGTHS, -1, 1))),
        ('same DISPLACEMENT 3 cm', np.arcsin(np.clip(0.03 / LENGTHS, -1, 1))),
):
    C = np.array([true_period(LENGTHS[i], th0[i]) / (TAU / NS[i])
                  for i in range(COUNT)])
    out = []
    for t_end in (TAU, TAU * C.mean()):
        th, om = integrate(LENGTHS, th0, t_end)
        # Phase of each bob within its own swing, measured against its own
        # start. 0 means "back exactly where it began" -> the row is a line.
        w = np.sqrt(G / LENGTHS)
        ph = np.arctan2(om / w, th) - np.arctan2(0.0, th0)
        ph = (ph + np.pi) % (2 * np.pi) - np.pi
        out.append(np.degrees(np.std(ph)))
    ok = 'LINE REFORMS' if out[1] < 6 else 'pattern degrades'
    print(f'{label:>26s} {out[0]:11.1f}° {out[1]:10.1f}°   {ok}')

print(f'\nC varies across the row by {"":s}')
for label, th0 in (('same ANGLE 15 deg', np.full(COUNT, np.radians(15.0))),
                   ('same DISPLACEMENT 6 cm', np.arcsin(np.clip(0.06 / LENGTHS, -1, 1)))):
    C = np.array([true_period(LENGTHS[i], th0[i]) / (TAU / NS[i]) for i in range(COUNT)])
    print(f'  {label:24s} C in [{C.min():.5f}, {C.max():.5f}]  '
          f'spread {1e6*(C.max()-C.min()):.0f} ppm')


# ── the corrected design ────────────────────────────────────────────────────
# The falsification above says the wave is real under the TRUE equation, but it
# reforms LATE because every length was cut from the small-angle period.
# Since C is identical across the row when the release angle is shared, that is
# a pure scale error and it is removable: solve each length so that the EXACT
# nonlinear period equals TAU/N_n at the amplitude we actually release from.
THETA0 = np.radians(24.0)     # the amplitude the reel actually releases from

# T_true(L) = T_small(L) * C(theta0), and C does not depend on L, so
#   L_exact = L_small / C^2
C0 = true_period(1.0, THETA0) / (2 * np.pi * np.sqrt(1.0 / G))
EXACT = LENGTHS / C0 ** 2

print(f'\ncorrected for a {np.degrees(THETA0):.0f}° release (C = {C0:.5f}):')
print(f'  longest  {LENGTHS[0]*100:7.3f} cm -> {EXACT[0]*100:7.3f} cm')
print(f'  shortest {LENGTHS[-1]*100:7.3f} cm -> {EXACT[-1]*100:7.3f} cm')

# what the UNCORRECTED row does at exactly t = TAU, for the comparison below
th_u, om_u = integrate(LENGTHS, np.full(COUNT, THETA0), TAU, dt=2e-4)
w_u = np.sqrt(G / LENGTHS)
ph_u = (np.arctan2(om_u / w_u, th_u) + np.pi) % (2 * np.pi) - np.pi

th, om = integrate(EXACT, np.full(COUNT, THETA0), TAU, dt=2e-4)
w = np.sqrt(G / EXACT)
ph = (np.arctan2(om / w, th) + np.pi) % (2 * np.pi) - np.pi
print(f'  phase spread at exactly t = {TAU:.3f} s: {np.degrees(np.std(ph)):.3f}°'
      f'   (was {np.degrees(np.std(ph_u)):.1f}° uncorrected, '
      f'and the cycle ran {TAU*(C0-1):.3f} s long)')
print(f'  every bob back within {np.degrees(np.abs(np.abs(th)-THETA0)).max():.4f}° '
      f'of its release angle, speed |max| {np.abs(om).max():.2e} rad/s')

np.save('projects/r010_pendulum/lengths.npy', EXACT)
print(f'\nlengths written to projects/r010_pendulum/lengths.npy')
