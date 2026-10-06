"""Beat-timing numbers for the I91 script, from the 1-minute median-day run (not eyeballed).
The G4 script binds every on-screen claim to a time computed here; emit_ts.py will assert them later."""
import json
import numpy as np
import house as H

wx, hs = H.Weather("greensboro_tmy3"), H.House()
md = 364                                     # PREREG §1 median Dec-Feb day with demand (stage3.py finds it by rule)
def start_state(ts_away):
    n = (md - 360) % 365
    return H.run(wx, hs, "furnace", 70.0, ts_away, dt_min=3.0, start_day=360, n_days=n)["final"] if n else None
runs = {}
for name, ts_away in (("held", 70.0), ("setback", 62.0)):
    r = H.run(wx, hs, "furnace", 70.0, ts_away, 8.0, 17.0, 1.0, md, 1, init=start_state(ts_away), trace_day=0)
    tr = r["trace"]; q = np.array(tr["q"]); Ta = np.array(tr["Ta"]); To = np.array(tr["To"])
    gas = np.cumsum(q / 60.0 / 0.95)                         # BTU of gas burned so far, per minute
    runs[name] = dict(q=q, Ta=Ta, To=To, gas=gas, total=float(gas[-1]))
out = {}
g = lambda n, hh: float(runs[n]["gas"][int(hh * 60) - 1])
for hh in (8, 12, 16, 17, 18, 20, 24):
    out[f"gas_at_{hh}"] = {n: g(n, hh) for n in runs}
    out[f"pct_of_held_day_at_{hh}"] = {n: g(n, hh) / runs["held"]["total"] * 100 for n in runs}
Ta = runs["setback"]["Ta"]
t_62 = next((i / 60 for i in range(8 * 60, 17 * 60) if Ta[i] <= 62.0 + 1e-6), None)
t_back70 = next((i / 60 for i in range(17 * 60, 1440) if Ta[i] >= 70.0 - 1e-6), None)
qs = runs["setback"]["q"]
flat = [i / 60 for i in range(17 * 60, 1440) if qs[i] >= 60000 * 0.999]
out["setback_air_reaches_62_at_h"] = t_62
out["setback_air_back_to_70_at_h"] = t_back70
out["setback_flat_out_after_5pm_h"] = len(flat) / 60.0
out["held_furnace_duty_mean_pct_of_cap"] = float(runs["held"]["q"].mean() / 600.0)
out["setback_duty_8_to_17_pct"] = float(qs[8 * 60:17 * 60].mean() / 600.0)
out["setback_duty_17_to_20_pct"] = float(qs[17 * 60:20 * 60].mean() / 600.0)
out["held_duty_17_to_20_pct"] = float(runs["held"]["q"][17 * 60:20 * 60].mean() / 600.0)
out["totals_btu_gas"] = {n: runs[n]["total"] for n in runs}
out["saving_pct_raw"] = (1 - runs["setback"]["total"] / runs["held"]["total"]) * 100
out["outdoor_F_at_8"] = float(runs["held"]["To"][8 * 60]); out["outdoor_F_at_17"] = float(runs["held"]["To"][17 * 60])
out["outdoor_min_F"] = float(runs["held"]["To"].min()); out["outdoor_max_F"] = float(runs["held"]["To"].max())
# where the gas goes in the 3 hours after 5 pm vs the 9 hours while away
out["gas_saved_while_away_btu"] = float(runs["held"]["gas"][17 * 60 - 1] - runs["held"]["gas"][8 * 60 - 1]) - float(runs["setback"]["gas"][17 * 60 - 1] - runs["setback"]["gas"][8 * 60 - 1])
out["gas_spent_extra_after_5pm_btu"] = float(runs["setback"]["gas"][-1] - runs["setback"]["gas"][17 * 60 - 1]) - float(runs["held"]["gas"][-1] - runs["held"]["gas"][17 * 60 - 1])
json.dump(out, open("results/moments.json", "w"), indent=1)
for k, v in out.items():
    print(f"{k:42s} {json.dumps(v) if not isinstance(v, float) else round(v, 3)}")
