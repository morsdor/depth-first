#!/usr/bin/env python3
"""Run the model and dump every frame the reel plays back.

    python3 projects/r010_phantom_jam/dump_data.py

The reel authors NOTHING about how the cars move. Two runs are dumped:

  FORM  22 cars from a 4-inch offset, no control -> the jam condenses (beats 3-5)
  FIX   the same ring already jammed, then ONE car stops closing its gap (beat 6)

Both are sampled on a fixed grid so the .tsx can index by reel time without
interpolating physics it does not own.
"""
import json
import pathlib

import numpy as np

import ring

HERE = pathlib.Path(__file__).resolve().parent
SAMPLE = 0.5                      # seconds of simulation per dumped frame
JITTER = 1.0                      # km/h of human driver jitter -- see GATE0 §7


def jam_window(x, v, thresh=8.0 / 3.6):
    """Where the jam IS: the LONGEST CONTIGUOUS RUN of slow cars.

    A circular mean over all slow cars is wrong and was the first thing tried. During
    formation there are transiently two separate slow clusters on opposite sides of the
    ring; their circular mean lands in the empty middle and the half-width comes out at
    103 m on a 230 m ring — reporting "the jam" as half the track. Cars are indexed in
    ring order, so the contiguous run is both correct and cheap.

    Returns (centre_m, half_width_m), or None when nothing is jammed.
    """
    n = len(x)
    slow = v < thresh
    if slow.sum() < 2 or slow.all():
        return None
    best_len, best_start = 0, None
    i = 0
    while i < 2 * n:                       # walk twice round to catch a run that wraps
        if slow[i % n]:
            j = i
            while j < i + n and slow[j % n]:
                j += 1
            if j - i > best_len:
                best_len, best_start = j - i, i % n
            i = j
        else:
            i += 1
    if best_len < 2:
        return None
    idx = [(best_start + k) % n for k in range(best_len)]
    ref = x[idx[0]]
    rel = (x[idx] - ref + ring.L_RING / 2) % ring.L_RING - ring.L_RING / 2
    centre_m = float((ref + (rel.min() + rel.max()) / 2) % ring.L_RING)
    return centre_m, float((rel.max() - rel.min()) / 2 + 4.0)


def pack(T, X, V, t0, t1):
    keep = [i for i, tt in enumerate(T) if t0 - 1e-9 <= tt <= t1 + 1e-9
            and abs((tt / SAMPLE) - round(tt / SAMPLE)) < 1e-6]
    out = []
    for i in keep:
        jw = jam_window(X[i], V[i])
        out.append({
            't': round(float(T[i] - t0), 2),
            'x': [round(float(a), 1) for a in X[i]],
            'v': [round(float(a), 3) for a in V[i]],
            'jam': None if jw is None else [round(jw[0], 1), round(jw[1], 1)],
        })
    return out


T, X, V = ring.simulate(noise=JITTER, seed=1, t_end=200.0)
FORM = pack(T, X, V, 0.0, 180.0)

# U_FACTOR: the controlled car targets 95% of the uniform-flow speed. Stern et al.
# command a speed at or just below the average flow -- that is what opens the gap in
# front of it. At u_factor 1.00 the controller cannot claw back an ALREADY JAMMED ring
# (measured: 20 mph of spread still there after 300 s). Disclosed in GATE0.md §5.
U_FACTOR = 0.95
Tf, Xf, Vf = ring.simulate(noise=JITTER, seed=1, t_end=470.0, control_car=11,
                           control_from=300.0, u_factor=U_FACTOR)
FIX = pack(Tf, Xf, Vf, 290.0, 450.0)

wave = ring.wave_speed(T, X, V, t_from=140.0)
formed = next(tt for tt, vv in zip(T, V) if vv.min() < 0.5 * ring.V_TARGET)

data = {
    'meta': {
        'ringM': ring.L_RING,
        'ringFt': round(ring.feet(ring.L_RING)),
        'nCars': ring.N_CARS,
        'targetMps': ring.V_TARGET,
        'targetMph': round(ring.mph(ring.V_TARGET)),
        'ceilingMph': round(ring.mph(ring.V_MAX)),
        'nudgeInches': round(ring.inch(0.10)),
        'waveMps': float(wave),
        'waveMphSim': round(abs(ring.mph(wave)), 1),
        'waveMphCited': 12,          # Sugiyama 2008, ~20 km/h
        'crawlMph': 2,
        'fuelPct': 40,               # Stern 2018, fleet-wide, vs the wave running
        'formedS': round(float(formed), 1),
        'controlCar': 11,
        'controlFromS': 10.0,          # seconds into the FIX clip
        'uFactor': U_FACTOR,
        'sampleS': SAMPLE,
        'jitterKmh': JITTER,
    },
    'form': FORM,
    'fix': FIX,
}

out = HERE / 'phantom_jam_data.json'
out.write_text(json.dumps(data), encoding='utf-8')

print(f"FORM  {len(FORM)} frames  0 -> 180 s")
print(f"FIX   {len(FIX)} frames  290 -> 380 s (control on at 300 s)")
print(f"jam forms at {data['meta']['formedS']} s")
print(f"wave {data['meta']['waveMphSim']} mph backwards (sim) | {data['meta']['waveMphCited']} mph cited")
print(f"ring {data['meta']['ringFt']} ft | target {data['meta']['targetMph']} mph | "
      f"ceiling {data['meta']['ceilingMph']} mph | nudge {data['meta']['nudgeInches']} in")
print(f"wrote {out}  ({out.stat().st_size/1024:.0f} KB)")
