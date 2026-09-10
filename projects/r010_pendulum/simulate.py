#!/usr/bin/env python3
"""I69 — integrate the fifteen pendulums and dump every frame of the cycle.

The real equation, theta'' = -(g/L) sin theta, RK4, no small-angle anywhere.
Lengths are solved against the EXACT nonlinear period so the row reforms at
t = TAU exactly rather than a quarter-second late (see design.py for that
falsification).

TAU is 30 s, not 60. The cycle length is the reel's runtime, so it is an
editorial decision as much as a physical one: at 60 s the payoff lands after
most of the audience has gone, and the 51..65 swing counts put only a 1.62x
spread between the longest and shortest string -- fifteen ropes that measurably
differ and visibly do not. 26..40 swings in 30 s gives 2.37x, which reads.

The run continues PAST the reform so the reel can hold on it and show the row
beginning to peel apart again, rather than freezing on the payoff frame.

Output: pendulum_data.json -- every frame x 15 angles, plus the beat instants
the reel cuts on, all of them MEASURED here rather than chosen by eye.
"""
import json
import numpy as np

G, TAU, N0, COUNT = 9.80665, 30.0, 26, 15
RUN = 34.0                      # seconds simulated: the cycle, plus a tail
THETA0 = np.radians(24.0)
FPS, SUB = 30, 20
NS = np.arange(N0, N0 + COUNT)


def agm_period_ratio(th0):
    """T_true / T_smallangle. Depends on amplitude only, never on length."""
    a, b = 1.0, np.cos(th0 / 2.0)
    for _ in range(60):
        a, b = (a + b) / 2.0, np.sqrt(a * b)
    return 1.0 / a


C0 = agm_period_ratio(THETA0)
LENGTHS = G * (TAU / NS) ** 2 / (4 * np.pi ** 2) / C0 ** 2

FRAMES = int(round(RUN * FPS))
REFORM_F = int(round(TAU * FPS))
dt = 1.0 / (FPS * SUB)
k = G / LENGTHS

th = np.full(COUNT, THETA0)
om = np.zeros(COUNT)
acc = lambda x: -k * np.sin(x)

rec = np.empty((FRAMES + 1, COUNT))
rec[0] = th
for f in range(FRAMES):
    for _ in range(SUB):
        a1, b1 = om, acc(th)
        a2, b2 = om + .5 * dt * b1, acc(th + .5 * dt * a1)
        a3, b3 = om + .5 * dt * b2, acc(th + .5 * dt * a2)
        a4, b4 = om + dt * b3, acc(th + dt * a3)
        th = th + dt / 6 * (a1 + 2 * a2 + 2 * a3 + a4)
        om = om + dt / 6 * (b1 + 2 * b2 + 2 * b3 + b4)
    rec[f + 1] = th

# ── the run has to prove it did what the sentence promises ──────────────────
# Checked at the REFORM, not at the last frame: the run deliberately continues
# past it, and asserting on rec[-1] would be asserting about the tail.
end = rec[REFORM_F]
assert np.abs(np.degrees(end - THETA0)).max() < 0.02, \
    f'the row did NOT come back: worst bob off by {np.degrees(np.abs(end-THETA0)).max():.4f}°'
assert np.ptp(rec[0]) < 1e-12, 'they did not start in a line'
assert np.ptp(rec[REFORM_F]) < 1e-6, 'the reformed row is not a straight line'

# How ragged is the row, measured on the INTEGRATED bobs rather than on the
# analytic phase. u is each bob's sideways displacement as a fraction of its own
# maximum, so all fifteen are comparable; the second difference along the row is
# ~0 for a smooth wave and maximal when neighbours alternate.
u = np.sin(rec) / np.sin(THETA0)
d2 = u[:, 2:] - 2 * u[:, 1:-1] + u[:, :-2]
disorder = np.abs(d2).mean(axis=1) / 4.0

# The row spans exactly m wavelengths at t = m * TAU / (COUNT - 1).
wave1 = TAU / (COUNT - 1)
chaos_f = int(np.argmax(disorder[:REFORM_F + 1]))
beats = {
    'oneWave': round(wave1, 3),
    'twoWave': round(2 * wave1, 3),
    'chaos': round(chaos_f / FPS, 3),
    'reform': TAU,
}
# The phase is linear in n, so the row is ALWAYS a sampled sinusoid -- there is
# never real chaos here, only spatial aliasing once the wavelength drops below
# two pendulums. Peak "disorder" is therefore t=30 s, where neighbours are exactly
# antiphase: a perfect comb, which is ordered, not scrambled. The scrambled-looking
# window is the one either side of it, where the wavelength is a non-integer 2-3
# pendulums, so take the beat from there.
lo, hi = int(0.30 * TAU * FPS), int(0.45 * TAU * FPS)
scramble_f = lo + int(np.argmax(disorder[lo:hi]))
beats['scramble'] = round(scramble_f / FPS, 3)
beats['comb'] = round(chaos_f / FPS, 3)
assert disorder[int(wave1 * FPS)] < 0.10, 'the "one wave" beat is not smooth'
assert disorder[scramble_f] > 0.35, f'nothing looks scrambled ({disorder[scramble_f]:.3f})'
# wavelength of the row in pendulum-spacings, which is what the eye actually reads
beats['lambdaAtScramble'] = round(TAU / beats['scramble'], 3)

data = {
    'fps': FPS,
    'frames': FRAMES + 1,
    'runS': RUN,
    'reformFrame': REFORM_F,
    'count': COUNT,
    'tau': TAU,
    'theta0Deg': round(float(np.degrees(THETA0)), 3),
    'swingCounts': NS.tolist(),
    'lengthsCm': [round(float(L * 100), 3) for L in LENGTHS],
    'periodS': [round(float(TAU / n), 5) for n in NS],
    'perMinute': [int(round(n * 60.0 / TAU)) for n in NS],
    'nonlinearC': round(float(C0), 6),
    'beats': beats,
    # centi-degrees: 0.01 deg is 0.05 px on a 300 px string, below one pixel
    'thetaCentiDeg': [[int(round(np.degrees(a) * 100)) for a in row] for row in rec],
    'disorder': [round(float(x), 4) for x in disorder],
    'finalErrorDeg': round(float(np.abs(np.degrees(end - THETA0)).max()), 6),
}
with open('projects/r010_pendulum/pendulum_data.json', 'w') as fh:
    json.dump(data, fh, separators=(',', ':'))

print(f'{COUNT} pendulums, {FRAMES + 1} frames at {FPS} fps '
      f'({RUN:.0f} s run, reform at frame {REFORM_F})')
print(f'lengths  {LENGTHS[0]*100:.2f} cm .. {LENGTHS[-1]*100:.2f} cm   (C = {C0:.6f})')
print(f'swings   {NS[0]} .. {NS[-1]} in {TAU:.0f} s  '
      f'({NS[0]*60/TAU:.0f} .. {NS[-1]*60/TAU:.0f} per minute)')
print(f'spread   longest / shortest = {LENGTHS[0]/LENGTHS[-1]:.2f}x, '
      f'neighbours differ by {(LENGTHS[0]-LENGTHS[1])*100:.2f} cm .. '
      f'{(LENGTHS[-2]-LENGTHS[-1])*100:.2f} cm')
print(f'reform   worst bob {data["finalErrorDeg"]:.6f}° off its release angle')
print(f'beats    one wave {beats["oneWave"]:.2f}s · two {beats["twoWave"]:.2f}s · '
      f'most scattered {beats["chaos"]:.2f}s · line {beats["reform"]:.0f}s')
print(f'ragged   one-wave {disorder[int(wave1*FPS)]:.3f} · scrambled '
      f'{disorder[scramble_f]:.3f} at {beats["scramble"]:.2f}s '
      f'(lambda {beats["lambdaAtScramble"]:.2f} pendulums) · '
      f'comb {beats["comb"]:.0f}s · reform {disorder[-1]:.3f}')
