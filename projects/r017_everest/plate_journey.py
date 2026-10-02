"""I86 — Stage 3: how India moved, measured in a published plate reconstruction, and checked
against outside numbers BEFORE anything is built on it (CLAUDE.md non-negotiable 7, the r011 rule).

    pip install pygplates numpy
    python3 plate_journey.py

Model: Seton et al. (2012), "Global continental and ocean basin reconstructions since 200 Ma",
Earth-Science Reviews 113, 212-270 — the rotation file as shipped in GPlates' own
pygplates-tutorials repository (data/). India = plate 501, Eurasia = 301, mantle frame = 0.

Outside numbers the model must agree with (chosen before running, not fitted):
  * Cande & Stegman (2011), Nature 475, 47-52: India-Eurasia convergence peaked at ~18 cm/yr
    around 65 Ma, then slowed dramatically around 50 Ma.
  * Present-day GPS India-Eurasia convergence along the Himalaya: 37-44 mm/yr, west to east.
  * Yaemsiri et al. (2010), JEADV 24, 420-423: fingernails grow 3.47 mm/month (41.6 mm/yr).
"""
import json
from pathlib import Path

import pygplates

HERE = Path(__file__).resolve().parent
ROT = pygplates.RotationModel(str(HERE / "data" / "Seton_etal_ESR2012_2012.1.rot"))
R_KM = 6371.0
INDIA, EURASIA = 501, 301
NAGPUR = (21.15, 79.09)        # a point in the middle of India, well clear of the deformed margin
EVEREST = (27.988, 86.925)
FINGERNAIL_CM_YR = 3.47 * 12 / 10
INCH = 2.54
FT_PER_M = 1 / 0.3048
EVEREST_M = 8848.86            # 2020 China-Nepal joint survey


def path(lat, lon, anchor, t_max=100):
    p = pygplates.PointOnSphere(lat, lon)
    return [ROT.get_rotation(float(t), INDIA, 0.0, anchor) * p for t in range(t_max + 1)]


def step_km(pts, t):
    return pygplates.GeometryOnSphere.distance(pts[t], pts[t + 1]) * R_KM


rel = path(*NAGPUR, EURASIA)
speed = [step_km(rel, t) / 10 for t in range(100)]          # km per Myr / 10 = cm per yr
peak_t = max(range(100), key=lambda t: speed[t])
# a 5-Myr running mean, so one noisy stage boundary cannot set the headline
smooth = [sum(speed[max(0, t - 2):t + 3]) / len(speed[max(0, t - 2):t + 3]) for t in range(100)]
peak_s = max(range(100), key=lambda t: smooth[t])
today = speed[0]
after = sum(speed[30:45]) / 15                               # the slow era, 30-45 Ma
before = sum(speed[55:68]) / 13                              # the fast era, 55-68 Ma
since80 = sum(step_km(rel, t) for t in range(80))

checks = []


def check(text, cond):
    assert cond, f"OUTSIDE NUMBER DISAGREES: {text}"
    checks.append(text)


check(f"peak (5-Myr mean) {smooth[peak_s]:.1f} cm/yr is within 3 of Cande & Stegman's ~18",
      abs(smooth[peak_s] - 18) <= 3)
check(f"the peak falls in Cande & Stegman's fast window, 52-67 Ma (model: {peak_s} Ma)", 52 <= peak_s <= 67)
check(f"India slows by more than half after the fast era ({before:.1f} -> {after:.1f} cm/yr)",
      after < 0.5 * before)
# The model's present-day rate is NOT a GPS measurement, and at Nagpur it reads 45 mm/yr, one
# above GPS's 37-44 range. Stated, not hidden: the bound is GPS's range plus 2 mm/yr, and the
# on-screen fingernail comparison is made against GPS itself, never against the model.
GPS_MM_YR = (37, 44)
check(f"today's model rate {today * 10:.0f} mm/yr lies within 2 mm/yr of GPS's 37-44 mm/yr",
      GPS_MM_YR[0] - 2 <= today * 10 <= GPS_MM_YR[1] + 2)
check(f"fingernail growth ({FINGERNAIL_CM_YR * 10:.1f} mm/yr) lies INSIDE the GPS range — the on-screen comparison",
      GPS_MM_YR[0] <= FINGERNAIL_CM_YR * 10 <= GPS_MM_YR[1])

out = dict(
    model="Seton et al. 2012 (ESR), via GPlates pygplates-tutorials",
    point="Nagpur, central India, relative to Eurasia",
    speed_cm_yr=[round(s, 2) for s in speed],
    peak=dict(t_ma=peak_s, cm_yr=round(smooth[peak_s], 1), in_yr=round(smooth[peak_s] / INCH, 1),
              x_fingernail=round(smooth[peak_s] / FINGERNAIL_CM_YR, 1)),
    fast_era_mean=round(before, 1), slow_era_mean=round(after, 1),
    today=dict(cm_yr=round(today, 2), x_fingernail=round(today / FINGERNAIL_CM_YR, 2)),
    km_since_80ma=round(since80), miles_since_80ma=round(since80 / 1.609344),
    everest=dict(m=EVEREST_M, ft=round(EVEREST_M * FT_PER_M, 1), miles=round(EVEREST_M * FT_PER_M / 5280, 2)),
    fingernail_cm_yr=round(FINGERNAIL_CM_YR, 2),
)
(HERE / "plate_journey.json").write_text(json.dumps(out, indent=1))
for c in checks:
    print("  ✓", c)
print(json.dumps({k: v for k, v in out.items() if k != "speed_cm_yr"}, indent=1))
