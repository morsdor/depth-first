#!/usr/bin/env python3
"""Run both pendulums and dump every frame the reel plays back.

    python3 projects/r010_divergence/dump_data.py

Played back 1:1 — 12 s of simulation in 12 s of reel. No time compression, so the
reel needs no clock and makes no claim about rate.
"""
import json
import pathlib

import numpy as np

import chaos

HERE = pathlib.Path(__file__).resolve().parent
THETA0 = 135.0
HAIR_UM = 70.0
NUDGE = np.degrees(HAIR_UM * 1e-6 / chaos.L1)
RUNTIME = 12.0
# chaos.run logs at 200 Hz, so only exact divisors of 200 are honest here. 120 gave a
# step of round(1.667) = 2 and therefore 100 Hz of real samples while META still said
# 120 — the metadata would have been a lie about its own file.
HZ = 100
PX_PER_M = 190.0               # the reel's own scale — divergence is judged in SCREEN PIXELS


def tip(t1, t2):
    return (chaos.L1 * np.sin(t1) + chaos.L2 * np.sin(t2),
            -chaos.L1 * np.cos(t1) - chaos.L2 * np.cos(t2))


T, sep, A, B, drift = chaos.run(THETA0, NUDGE, t_end=RUNTIME + 0.05)
log_hz = 1.0 / (T[1] - T[0])
assert abs(log_hz / HZ - round(log_hz / HZ)) < 1e-9, f"HZ must divide the {log_hz:.0f} Hz log rate"
step = int(round(log_hz / HZ))
idx = list(range(0, len(T), step))
idx = [i for i in idx if T[i] <= RUNTIME + 1e-9]

px = sep * PX_PER_M
first = lambda p: float(T[int(np.argmax(px > p))]) if (px > p).any() else None

# Lyapunov exponent on the CLEAN growth phase only. Fitting through the saturated
# tail gave 0.99 instead of 1.61 — separation sloshes once it fills the system.
SPAN = 2 * (chaos.L1 + chaos.L2)
i_end = int(np.argmax(sep > 0.10 * SPAN))
m = (T <= T[i_end]) & (sep > 3 * sep[0])
lam = float(np.polyfit(T[m], np.log(sep[m]), 1)[0])

data = {
    'meta': {
        'theta0Deg': THETA0,
        'hairUm': HAIR_UM,
        'nudgeDeg': NUDGE,
        'l1': chaos.L1, 'l2': chaos.L2,
        'runtime': RUNTIME,
        'hz': HZ,
        'pxPerM': PX_PER_M,
        'splitS': round(first(1.0), 2),          # one screen pixel of daylight
        'noticeS': round(first(4.0), 2),
        'twoS': round(first(20.0), 2),
        'unrelatedS': round(first(150.0), 2),
        'lambdaPerS': round(lam, 3),
        'doublingS': round(float(np.log(2) / lam), 3),
        'energyDrift': float(drift),
        'sepEndM': float(sep[idx[-1]]),
    },
    # [theta1_A, theta2_A, theta1_B, theta2_B] per sample, radians
    'frames': [[round(float(A[i][0]), 6), round(float(A[i][2]), 6),
                round(float(B[i][0]), 6), round(float(B[i][2]), 6)] for i in idx],
    'sepM': [round(float(sep[i]), 6) for i in idx],
}

out = HERE / 'divergence_data.json'
out.write_text(json.dumps(data), encoding='utf-8')
m_ = data['meta']
print(f"{len(idx)} samples at {HZ} Hz over {RUNTIME} s")
print(f"  one pixel of daylight at {m_['splitS']} s · unmistakably two {m_['twoS']} s · unrelated {m_['unrelatedS']} s")
print(f"  lambda {m_['lambdaPerS']} /s  ->  doubling every {m_['doublingS']} s")
print(f"  energy drift {m_['energyDrift']:.2e} of MgL")
print(f"wrote {out} ({out.stat().st_size/1024:.0f} KB)")
