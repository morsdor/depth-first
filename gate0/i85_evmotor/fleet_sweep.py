"""I85 Stage 3 — does the gas-vs-electric gap hold across the fleet, or only for Camry vs Bolt?

Runs every light-duty conventional (Conv) and battery-electric (BEV) car in FASTSim's bundled
vehicle database through the same audit as energy_budget.py (same ruler, same 55/45 EPA
combined weighting), and reports the spread. Trucks, motorcycles and the three-wheeler are
excluded up front by name, before any result is seen — the reel is about cars.

Cars whose model economy misses EPA's sticker figure by more than 10% are REPORTED, not dropped
silently, and the verdict is given both with and without them.
"""
import csv
import json
import math
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
import fastsim  # noqa: E402
from fastsim import simdrivelabel, vehicle  # noqa: E402
import logging  # noqa: E402

logging.disable(logging.WARNING)          # FASTSim trace-miss chatter (label accel legs)

import energy_budget as eb  # noqa: E402  — reuse run(), combined(), the ruler

EXCLUDE = ("Truck", "Class", "Line Haul", "Splendor", "Boxer", "Hero", "Bajaj")
DB = Path(fastsim.__file__).parent / "resources" / "FASTSim_py_veh_db.csv"
OUT = Path(__file__).with_name("fleet_sweep.json")

rows = list(csv.DictReader(open(DB)))
picked = [(i + 1, r["Scenario name"], r["veh_pt_type"]) for i, r in enumerate(rows)
          if r["veh_pt_type"] in ("Conv", "BEV") and not any(x in r["Scenario name"] for x in EXCLUDE)]

out = []
for vid, name, pt in picked:
    try:
        city, hwy = eb.run(vid, "udds"), eb.run(vid, "hwfet")
    except Exception as ex:                                     # report, never hide
        out.append(dict(vid=vid, name=name, type=pt, error=str(ex)[:120]))
        continue
    lab = simdrivelabel.get_label_fe(vehicle.Vehicle.from_vehdb(vid))
    lab = lab[0] if isinstance(lab, tuple) else lab
    model = float(lab["adjCombMpgge"] if pt == "Conv" else lab["adjCombKwhPerMile"])
    epa = city["val_comb"]
    err = (model / epa - 1) if epa and not math.isnan(epa) else None
    out.append(dict(vid=vid, name=name, type=pt, to_wheels=eb.combined(city, hwy, eb.to_wheels),
                    moves=eb.combined(city, hwy, eb.moves), validation_err=err))

print(f"{'car':<34}{'type':<6}{'to wheels':>10}{'  vs EPA':>10}")
for r in out:
    if "error" in r:
        print(f"{r['name']:<34}{r['type']:<6}  ERROR {r['error']}")
        continue
    v = "n/a" if r["validation_err"] is None else f"{r['validation_err']:+.1%}"
    print(f"{r['name']:<34}{r['type']:<6}{r['to_wheels']:>9.1%}{v:>10}")


def spread(rs, label):
    for pt in ("Conv", "BEV"):
        xs = sorted(r["to_wheels"] for r in rs if r["type"] == pt)
        if xs:
            med = xs[len(xs) // 2] if len(xs) % 2 else (xs[len(xs) // 2 - 1] + xs[len(xs) // 2]) / 2
            print(f"  {label:<22} {pt:<5} n={len(xs):<2} min {xs[0]:.1%}  median {med:.1%}  max {xs[-1]:.1%}")


ok = [r for r in out if "error" not in r]
valid = [r for r in ok if r["validation_err"] is not None and abs(r["validation_err"]) <= 0.10]
print()
spread(ok, "all cars")
spread(valid, "validated within 10%")

conv_max = max(r["to_wheels"] for r in ok if r["type"] == "Conv")
bev_min = min(r["to_wheels"] for r in ok if r["type"] == "BEV")
print(f"\nbest gas car {conv_max:.1%}  vs  worst EV {bev_min:.1%}  -> ranges overlap: {conv_max >= bev_min}")
assert conv_max < bev_min, "some gas car beats some EV — the reel's claim would need scoping"
OUT.write_text(json.dumps(out, indent=1))
print(f"wrote {OUT.name}")
