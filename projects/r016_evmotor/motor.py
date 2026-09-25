"""r016 · I85 — the playback state for the reel: the motor, the dollars, the fleet.

    python3 energy_budget.py && python3 fleet_sweep.py && python3 motor.py && python3 emit_ts.py

Three things are computed here, all consumed frame-for-frame by EvMotor.tsx:

1. THE MOTOR. A standard 12-slot, 2-pole, 60-degree phase-belt winding (belts A+ C- B+ A- C+ B-)
   fed balanced three-phase currents. For every frame we store the electrical angle wt; the coil
   drives are cos(wt - 2*pi*p/3) * sign, and the resulting field direction is SUMMED from the 12
   coil vectors here (not assumed) and asserted to equal wt + the phase-A axis. The rotor angle is
   the field angle minus a load angle: positive (rotor lags, it is being pulled — MOTOR) everywhere
   except the braking beat, where it is negative (rotor leads, it is pushing — GENERATOR).

2. THE DOLLARS. 100 particles per car, one per dollar of the $100. The number that reach the wheels
   is round(100 * to_wheels) from energy_budget.json — nothing is typed in. Which particle goes where
   is a fixed-seed shuffle, so the stream looks organic and rebuilds identically.

3. THE FLEET. Every car in fleet_sweep.json, for the payoff beat's two rows.
"""
import json
import math
import random
from pathlib import Path

HERE = Path(__file__).resolve().parent
FPS = 30
DURATION = 42.0
N_FRAMES = int(DURATION * FPS)

# beat boundaries — MUST match EvMotor.tsx BEAT and emit_ts.py
BEAT = dict(hook=(0.0, 4.5), gas=(4.5, 11.0), motor=(11.0, 17.5), field=(17.5, 25.0),
            brake=(25.0, 31.0), payoff=(31.0, 38.0), close=(38.0, 42.0))

# ── 1 · the motor ───────────────────────────────────────────────────────────────────────────
N_SLOTS = 12
BELT = [(0, 1), (2, -1), (1, 1), (0, -1), (2, 1), (1, -1)]      # A+ C- B+ A- C+ B-
SLOT_PHASE = [BELT[k // 2][0] for k in range(N_SLOTS)]
SLOT_SIGN = [BELT[k // 2][1] for k in range(N_SLOTS)]
SLOT_ANGLE = [2 * math.pi * k / N_SLOTS for k in range(N_SLOTS)]
AXIS_A = math.radians(15)                                        # centre of belt 0 (slots 0, 30 deg)
LOAD_ANGLE = math.radians(24)                                    # |rotor - field|, drawn size


def field_speed(s):
    """Field speed, revolutions per second of screen time. Slow in the field beat so the eye can
    follow one lobe round the ring; brisk elsewhere; decelerating through the braking beat."""
    f0, f1 = BEAT["field"]
    b0, b1 = BEAT["brake"]
    if s < f0 - 1.0:
        return 1.6
    if s < f0:
        return 1.6 - 1.25 * (s - (f0 - 1.0))          # ease down to 0.35 rev/s over one second
    if s < f1:
        return 0.35
    if s < b0:
        return 0.35
    if s < b1:
        return max(0.12, 0.9 - 0.13 * (s - b0))         # braking: the car and the field slow
    return 0.9


def coil_drive(wt):
    return [math.cos(wt - 2 * math.pi * SLOT_PHASE[k] / 3) * SLOT_SIGN[k] for k in range(N_SLOTS)]


def field_angle(drive):
    x = sum(d * math.cos(a) for d, a in zip(drive, SLOT_ANGLE))
    y = sum(d * math.sin(a) for d, a in zip(drive, SLOT_ANGLE))
    return math.atan2(y, x)


def is_generator(s):
    return BEAT["brake"][0] + 0.8 <= s < BEAT["brake"][1]


wt = 0.0
frames = []
for f in range(N_FRAMES):
    s = f / FPS
    drive = coil_drive(wt)
    phase_i = [math.cos(wt - 2 * math.pi * p / 3) for p in range(3)]
    assert abs(sum(phase_i)) < 1e-9, "balanced three-phase currents must sum to zero"
    fa = field_angle(drive)
    assert abs(math.remainder(fa - wt - AXIS_A, 2 * math.pi)) < 1e-9, "field != wt + phase-A axis"
    # the load angle swaps sign smoothly over 0.8 s at the start of braking
    b0 = BEAT["brake"][0]
    k = min(1.0, max(0.0, (s - b0) / 0.8)) if s < BEAT["brake"][1] else 0.0
    if s >= BEAT["brake"][1]:
        k = max(0.0, 1.0 - (s - BEAT["brake"][1]) / 0.6)   # back to motoring for the payoff
    lag = LOAD_ANGLE * (1 - 2 * k) if s >= b0 else LOAD_ANGLE
    frames.append([round(wt % (2 * math.pi), 5), round((fa - lag) % (2 * math.pi), 5)])
    wt += 2 * math.pi * field_speed(s) / FPS

# ── 2 · the dollars ─────────────────────────────────────────────────────────────────────────
budget = json.loads((HERE / "energy_budget.json").read_text())["results"]
DOLLARS = {n: round(100 * budget[n]["to_wheels"]) for n in ("gas", "ev")}

EMIT_FROM, EMIT_TO = 0.15, 2.0          # screen seconds over which the $100 enters each car
TRAVEL = 0.75                           # inlet -> engine/motor -> wheels or out as heat


def schedule(n_wheels, seed):
    rnd = random.Random(seed)
    order = list(range(100))
    rnd.shuffle(order)
    wheel = set(order[:n_wheels])
    out = []
    for i in range(100):
        t0 = EMIT_FROM + (EMIT_TO - EMIT_FROM) * i / 99 + rnd.uniform(-0.02, 0.02)
        out.append(dict(t0=round(t0, 3), wheel=i in wheel, jitter=round(rnd.uniform(-1, 1), 3),
                        wheelIdx=rnd.randrange(2)))
    return out


PARTICLES = {"gas": schedule(DOLLARS["gas"], 85), "ev": schedule(DOLLARS["ev"], 16)}


def count_at(car, s, wheel=True):
    return sum(1 for p in PARTICLES[car] if p["wheel"] == wheel and p["t0"] + TRAVEL <= s)


# ── 3 · the fleet ───────────────────────────────────────────────────────────────────────────
fleet = [dict(name=r["name"], type=r["type"], toWheels=round(r["to_wheels"], 4))
         for r in json.loads((HERE / "fleet_sweep.json").read_text()) if "error" not in r]

out = dict(fps=FPS, duration=DURATION, beat=BEAT,
           motor=dict(nSlots=N_SLOTS, slotPhase=SLOT_PHASE, slotSign=SLOT_SIGN,
                      axisA=AXIS_A, loadAngle=LOAD_ANGLE, frames=frames),
           dollars=DOLLARS, emit=[EMIT_FROM, EMIT_TO], travel=TRAVEL, particles=PARTICLES,
           fleet=fleet, cars=dict(gas=budget["gas"]["city"]["veh"], ev=budget["ev"]["city"]["veh"]),
           engineLossShare=(0.55 * budget["gas"]["city"]["audit"]["fc_kj"] / budget["gas"]["city"]["miles"]
                            + 0.45 * budget["gas"]["hwy"]["audit"]["fc_kj"] / budget["gas"]["hwy"]["miles"])
           / (0.55 * budget["gas"]["city"]["bought_kj"] / budget["gas"]["city"]["miles"]
              + 0.45 * budget["gas"]["hwy"]["bought_kj"] / budget["gas"]["hwy"]["miles"]))
(HERE / "evmotor_data.json").write_text(json.dumps(out, separators=(",", ":")))

print(f"frames {N_FRAMES} · field asserted = wt + axis_A on every frame")
print(f"dollars to the wheels: gas ${DOLLARS['gas']}  ev ${DOLLARS['ev']}")
print(f"counters at 3.0 s: gas {count_at('gas', 3.0)}  ev {count_at('ev', 3.0)}")
print(f"engine loss share of fuel (combined): {out['engineLossShare']:.1%}")
print(f"fleet: {sum(r['type'] == 'Conv' for r in fleet)} gas · {sum(r['type'] == 'BEV' for r in fleet)} electric")
print("wrote evmotor_data.json")
