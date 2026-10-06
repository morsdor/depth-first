#!/usr/bin/env python3
"""r020 · I91 — the compute: the Stage 3 model's 1-minute run of the median winter day, dumped for the reel.

    python3 thermostat.py && python3 emit_ts.py

Nothing here is new physics: it is house.py (PREREG §2–§3, unchanged) run once per scenario on the
day stage3.py chose BY RULE (the median Dec–Feb day with demand). The reel plays these arrays back; it
draws nothing that is not in them.
"""
import json
import pathlib

import numpy as np

import house as H

HERE = pathlib.Path(__file__).resolve().parent
wx, hs = H.Weather("greensboro_tmy3"), H.House()

# the day, found by the PREREG §1 rule again and checked against what stage3.py recorded
hold_year = H.run(wx, hs, "furnace", 70.0, 70.0, dt_min=3.0, start_day=360, n_days=370)["E"][5:]
mean_T = wx.daily_mean_T()
cand = sorted((d for d in range(365) if wx.month[d * 24] in {12, 1, 2} and hold_year[d] > 0), key=lambda d: mean_T[d])
MD = cand[(len(cand) - 1) // 2]
S3 = json.loads((HERE / "results" / "stage3_results.json").read_text())
assert MD == S3["heating"]["md"], "median day drifted from what stage3.py recorded"


def start_state(kind, ts_away):
    n = (MD - 360) % 365
    return H.run(wx, hs, kind, 70.0, ts_away, dt_min=3.0, start_day=360, n_days=n)["final"] if n else None


def day(kind, ts_away):
    r = H.run(wx, hs, kind, 70.0, ts_away, 8.0, 17.0, 1.0, MD, 1, init=start_state(kind, ts_away), trace_day=0)
    tr = r["trace"]
    assert len(tr["Ta"]) == 1440
    Ta, Tm, q, To = (np.array(tr[k]) for k in ("Ta", "Tm", "q", "To"))
    leak = hs.ua_inf * (Ta - To) + hs.ua_env * (Tm - To)               # BTU/h through walls and air changes
    out = dict(Ta=Ta, Tm=Tm, q=q, To=To, leak=leak, E=float(r["E"][0]))
    if kind == "hp":
        cap = np.array([H.cap_hp(x) for x in To])
        out["aux"] = np.maximum(q - cap, 0.0)                          # BTU/h from the resistance strip
    return out


furn = {"hold": day("furnace", 70.0), "back": day("furnace", 62.0)}
hp = {"hold": day("hp", 70.0), "back": day("hp", 62.0)}

tot = float(np.cumsum(furn["hold"]["q"] / 60.0 / 0.95)[-1])
for k in furn:
    furn[k]["gas"] = np.cumsum(furn[k]["q"] / 60.0 / 0.95) / tot * 100.0   # % of the HELD house's whole day, end of minute

r = lambda a, n=3: [round(float(x), n) for x in a]
data = dict(
    md=int(MD), tot_btu=tot, cap=60000.0,
    outdoor=dict(mean=float(furn["hold"]["To"].mean()), min=float(furn["hold"]["To"].min()), max=float(furn["hold"]["To"].max())),
    furnace={k: dict(Ta=r(v["Ta"]), Tm=r(v["Tm"]), q=r(v["q"], 1), leak=r(v["leak"], 1), gas=r(v["gas"], 3)) for k, v in furn.items()},
    hp={k: dict(Ta=r(v["Ta"]), aux=r(v["aux"], 1), q=r(v["q"], 1)) for k, v in hp.items()},
    To=r(furn["hold"]["To"], 2),
    stage3=dict(annual_save=S3["heating"]["annual_save"], day_save=S3["heating"]["day_save"], hp=S3["heat_pump"], sweep=S3["heating_sweep"]),
)
(HERE / "thermostat_data.json").write_text(json.dumps(data))
g = furn["hold"]["gas"], furn["back"]["gas"]
print(f"median day {MD}: outdoor mean {data['outdoor']['mean']:.1f} F  ({data['outdoor']['min']:.1f}–{data['outdoor']['max']:.1f})")
print(f"meters at midnight: held {g[0][-1]:.2f}%  set back {g[1][-1]:.2f}%   (saving {100 - g[1][-1]:.2f}%)")
print(f"meters at 5 PM: held {g[0][1019]:.2f}%  set back {g[1][1019]:.2f}%   at 6 PM: {g[0][1079]:.2f}% / {g[1][1079]:.2f}%")
print(f"hp aux, 17:00–19:00 peak: held {hp['hold']['aux'][1020:1140].max():.0f}  set back {hp['back']['aux'][1020:1140].max():.0f} BTU/h")
print("wrote thermostat_data.json", round((HERE / "thermostat_data.json").stat().st_size / 1024), "KB")
