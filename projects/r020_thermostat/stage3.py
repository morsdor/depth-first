"""Stage 3 driver for I91 — runs ONLY what PREREG.md fixed, once, and prints every rule's verdict.

    python3 stage3.py            # ~1-2 minutes; writes results/stage3_results.json
"""
import itertools
import json
import os
import sys

import numpy as np

import house as H

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = {}


def banner(s):
    print("\n" + "=" * 100 + "\n" + s + "\n" + "=" * 100)


def year_run(wx, hs, kind, ts_home, ts_away, dt=3.0, **kw):
    """Continuous TMY year, 5 pre-roll days (360..364) discarded."""
    r = H.run(wx, hs, kind, ts_home, ts_away, dt_min=dt, start_day=360, n_days=370, **kw)
    return {k: (v[5:] if isinstance(v, np.ndarray) else v) for k, v in r.items()}


def median_day(wx, hold_E, months):
    """PREREG §1: the MEDIAN day by daily-mean temperature among the season's days that have demand."""
    cand = [d for d in range(365) if (wx.month[d * 24] in months) and hold_E[d] > 0]
    mean_T = wx.daily_mean_T()
    cand.sort(key=lambda d: mean_T[d])
    return cand[(len(cand) - 1) // 2], len(cand), mean_T


def day_pair(wx, hs, kind, ts_home, ts_away, md, away=(8.0, 17.0), dt=3.0, cap=None, pre=5):
    a = H.run(wx, hs, kind, ts_home, ts_home, away[0], away[1], dt, (md - pre) % 365, pre + 1, cap=cap)
    b = H.run(wx, hs, kind, ts_home, ts_away, away[0], away[1], dt, (md - pre) % 365, pre + 1, cap=cap)
    return a, b


def net(hs, r, kind, d=-1):
    """PREREG AMENDMENT 1: this day's energy with the heat its own two nodes gained/lost over the day removed."""
    ds = hs.ca * (r["Ta_end"][d] - r["Ta_st"][d]) + hs.cm * (r["Tm_end"][d] - r["Tm_st"][d])     # BTU stored
    if kind == "furnace":
        adj = -ds / 0.95
    elif kind == "hp":
        adj = -ds / (2.2 * H.BTU_KWH)
    else:
        adj = ds / (3.4 * H.BTU_KWH)
    return r["E"][d] + adj, abs(adj) / max(r["E"][d], 1e-9)


def like_for_like(hs, a, b, kind, idx=-1):
    """The ORIGINAL PREREG §4 rule (end-state difference). Kept only so its answer can be shown beside the amended one."""
    corr_btu = H.stored_correction(hs, (a["Ta_end"][idx], a["Tm_end"][idx]), (b["Ta_end"][idx], b["Tm_end"][idx]))
    if kind == "furnace":
        add = -corr_btu / 0.95
    elif kind == "hp":
        add = -corr_btu / (2.2 * H.BTU_KWH)
    else:
        add = corr_btu / (3.4 * H.BTU_KWH)
    return b["E"][idx] + add, abs(add) / max(a["E"][idx], 1e-9)


def compare(hs, a, b, kind, d=-1):
    """-> dict(raw, endstate, net, drift, ok).  Savings are 1 - E_b/E_a."""
    na, da = net(hs, a, kind, d); nb, db = net(hs, b, kind, d)
    eb, _ = like_for_like(hs, a, b, kind, d)
    return dict(raw=1 - b["E"][d] / a["E"][d], endstate=1 - eb / a["E"][d], net=1 - nb / na,
                drift=max(da, db), ok=max(da, db) <= 0.10)


def hours(r, key="flat", idx=-1):
    return float(r[key][idx])


# ---------------------------------------------------------------------------------------------
banner("0. THE MODEL CHECKS ITSELF (proves self-consistency only — NOT that it is unbiased)")
wxg, wxm = H.Weather("greensboro_tmy3"), H.Weather("miami_tmy2")
hs = H.House()
chk = year_run(wxg, hs, "furnace", 70.0, 62.0)
print(f"energy-balance closure, annual furnace/setback run: relative error {chk['closure']:.2e}")
assert chk["closure"] < 5e-3
OUT["closure"] = chk["closure"]

# ---------------------------------------------------------------------------------------------
banner("1. HEATING — Greensboro NC TMY3, gas furnace, 70 F held vs 62 F while away 8-17")
hold = year_run(wxg, hs, "furnace", 70.0, 70.0)
back = year_run(wxg, hs, "furnace", 70.0, 62.0)
th = lambda x: x / 1e5
print(f"annual gas, held every day            : {th(hold['E'].sum()):7.1f} therms")
print(f"annual gas, set back every day        : {th(back['E'].sum()):7.1f} therms   (saving {1 - back['E'].sum()/hold['E'].sum():.1%}, upper bound: occupants out all 365 days)")
E_year = 5 / 7 * back["E"].sum() + 2 / 7 * hold["E"].sum()
annual_save = 1 - E_year / hold["E"].sum()
print(f"annual gas, 5/7 weekdays set back     : {th(E_year):7.1f} therms   (saving {annual_save:.1%})   <- PREREG §4 annual figure")
md, ncand, mean_T = median_day(wxg, hold["E"], {12, 1, 2})
print(f"median Dec-Feb day with demand        : day {md} of 365, daily-mean {mean_T[md]:.1f} F ({ncand} candidate days)")
cmp1 = compare(hs, hold, back, "furnace", md)
sav_day = cmp1["net"]
print(f"  held {th(hold['E'][md]):.2f} therms  set back {th(back['E'][md]):.2f} therms")
print(f"  saving, (1) raw day                                   : {cmp1['raw']:.1%}")
print(f"          (2) ORIGINAL PREREG §4 end-state difference    : {cmp1['endstate']:.1%}   <- over-corrects: see AMENDMENT 1")
print(f"          (3) AMENDED: each day stored-heat-neutral      : {cmp1['net']:.1%}   <- K1/K2 are evaluated on this  (largest correction {cmp1['drift']:.1%} of a day's energy)")
print(f"  end of day: air {hold['Ta_end'][md]:.2f} vs {back['Ta_end'][md]:.2f} F | structure {hold['Tm_end'][md]:.2f} vs {back['Tm_end'][md]:.2f} F | "
      f"house low while away {back['extreme'][md]:.1f} F | furnace flat out after 5 pm {back['flat'][md]:.2f} h (held: {hold['flat'][md]:.2f} h)")
assert cmp1["ok"], "NON-STATIONARY day (AMENDMENT 1): a correction exceeds 10% of the day's energy"
K1 = sav_day > 0
K2 = sav_day >= 0.03
print(f"\nK1 (claim: setback day uses LESS gas, like for like) : {'PASS' if K1 else 'FAIL — KILL'}")
print(f"K2 (median-day saving >= 3%)                          : {'PASS' if K2 else 'FAIL — stop at G4, tell the owner'}  ({sav_day:.1%})")
print(f"K4 (annual 8F/9h saving in 3-15%)                     : {'PASS' if 0.03 <= annual_save <= 0.15 else 'FAIL — a bug until proven otherwise'}  ({annual_save:.1%})")

# time step check, and the headline day at 1 minute
n_to = (md - 360) % 365
st_h = H.run(wxg, hs, "furnace", 70.0, 70.0, dt_min=3.0, start_day=360, n_days=n_to)["final"] if n_to else None
st_b = H.run(wxg, hs, "furnace", 70.0, 62.0, dt_min=3.0, start_day=360, n_days=n_to)["final"] if n_to else None
a1 = H.run(wxg, hs, "furnace", 70.0, 70.0, 8.0, 17.0, 1.0, md, 1, init=st_h, trace_day=0)
b1 = H.run(wxg, hs, "furnace", 70.0, 62.0, 8.0, 17.0, 1.0, md, 1, init=st_b, trace_day=0)
sav1 = compare(hs, a1, b1, "furnace", 0)["net"]
print(f"\ndt check: median-day saving at dt=3 min {sav_day:.2%} vs dt=1 min {sav1:.2%}  (diff {abs(sav1 - sav_day)*100:.2f} pp; PREREG limit 0.3 pp)")
assert abs(sav1 - sav_day) < 0.003

# mechanism accounting from the 1-minute trace: where did the saving come from?
def accounting(r, hs_):
    tr = r["trace"]; dt = 1.0 / 60.0
    Ta, Tm, To, q = (np.array(tr[k]) for k in ("Ta", "Tm", "To", "q"))
    loss = float(((hs_.ua_inf * (Ta - To) + hs_.ua_env * (Tm - To)) * dt).sum())
    return dict(lost=loss, delivered=float((q * dt).sum()), peak_q=float(q.max()))
acc_h, acc_b = accounting(a1, hs), accounting(b1, hs)
print("\nMECHANISM — heat that leaked out through the walls and air changes that day (BTU):")
print(f"  held at 70 all day  : leaked {acc_h['lost']:9.0f}   furnace delivered {acc_h['delivered']:9.0f}")
print(f"  set back 8-5        : leaked {acc_b['lost']:9.0f}   furnace delivered {acc_b['delivered']:9.0f}")
print(f"  => the setback day leaked {1 - acc_b['lost']/acc_h['lost']:.1%} less; furnace delivered {1 - acc_b['delivered']/acc_h['delivered']:.1%} less")
OUT["heating"] = dict(annual_hold_therms=th(hold["E"].sum()), annual_save=annual_save, md=int(md), md_meanT=float(mean_T[md]),
                      day_hold=th(hold["E"][md]), day_back=th(back["E"][md]), day_save=sav_day, flat_out_h=float(back["flat"][md]),
                      house_low=float(back["extreme"][md]), dt1_save=sav1, accounting=dict(hold=acc_h, back=acc_b))
os.makedirs(os.path.join(HERE, "results"), exist_ok=True)
json.dump(dict(Ta=a1["trace"]["Ta"][::5], Tm=a1["trace"]["Tm"][::5], q=a1["trace"]["q"][::5], To=a1["trace"]["To"][::5], away=a1["trace"]["away"][::5]),
          open(os.path.join(HERE, "results", "median_day_heating_hold.json"), "w"))
json.dump(dict(Ta=b1["trace"]["Ta"][::5], Tm=b1["trace"]["Tm"][::5], q=b1["trace"]["q"][::5], To=b1["trace"]["To"][::5], away=b1["trace"]["away"][::5]),
          open(os.path.join(HERE, "results", "median_day_heating_setback.json"), "w"))

# ---------------------------------------------------------------------------------------------
banner("2. HEATING SWEEP — 243 houses on the median day (PREREG §5)")
combos = list(itertools.product([0.6, 1.0, 1.5], [0.5, 1.0, 2.0], [0.7, 1.0, 1.5], [0.2, 0.35, 0.6], [1.5, 3.0, 6.0]))
res = []
for ua_m, c_m, cap_m, ach, ap in combos:
    h2 = H.House(ua_env=520.0 * ua_m, ach=ach, ca=6000.0 * c_m, cm=14000.0 * c_m, aperture=ap)
    cap = 60000.0 * cap_m
    row = {}
    for name, away, back_t in [("base", (8.0, 17.0), 62.0), ("h4", (12.0, 16.0), 62.0), ("h2", (15.0, 17.0), 62.0),
                               ("d4", (8.0, 17.0), 66.0), ("d15", (8.0, 17.0), 55.0)]:
        a, b = day_pair(wxg, h2, "furnace", 70.0, back_t, md, away, cap=cap)
        c = compare(h2, a, b, "furnace")
        row[name] = (c["net"], c["ok"])
    res.append(row)
cmp_ok = [r for r in res if all(v[1] for v in r.values())]
sv = {k: np.array([r[k][0] for r in cmp_ok]) for k in ("base", "h4", "h2", "d4", "d15")}
print(f"houses where every day is stationary (AMENDMENT 1): {len(cmp_ok)} of {len(res)}  (the rest are excluded — counted, not hidden)")
k1 = int((sv['base'] > 0).sum()); k2 = int((sv['base'] >= 0.03).sum())
k3 = int(((sv['d15'] >= sv['base'] - 1e-9) & (sv['base'] >= sv['d4'] - 1e-9) & (sv['base'] >= sv['h4'] - 1e-9) & (sv['h4'] >= sv['h2'] - 1e-9)).sum())
print(f"K1 setback saves (>0)                      : {k1} of {len(cmp_ok)}")
print(f"K2 saving >= 3% on the median day          : {k2} of {len(cmp_ok)}")
print(f"K3 saving rises with depth and with length : {k3} of {len(cmp_ok)}")
for k, lab in [("d4", "4 F back, 9 h"), ("base", "8 F back, 9 h"), ("d15", "15 F back, 9 h"), ("h4", "8 F back, 4 h"), ("h2", "8 F back, 2 h")]:
    print(f"  {lab:16s}: min {sv[k].min():6.1%}  median {np.median(sv[k]):6.1%}  max {sv[k].max():6.1%}")
OUT["heating_sweep"] = dict(n=len(res), comparable=len(cmp_ok), K1=k1, K2=k2, K3=k3,
                            ranges={k: [float(sv[k].min()), float(np.median(sv[k])), float(sv[k].max())] for k in sv})

# ---------------------------------------------------------------------------------------------
banner("3. HEAT PUMP, HEATING — does a setback still save? (PREREG §3, K6)")
hp_hold = year_run(wxg, hs, "hp", 70.0, 70.0)
print(f"annual electricity, held      : {hp_hold['E'].sum():7.0f} kWh (of which aux strip {hp_hold['aux'].sum():.0f} kWh)")
hp_rows = []
for dep in (2, 4, 8):
    hb = year_run(wxg, hs, "hp", 70.0, 70.0 - dep)
    Ey = 5 / 7 * hb["E"].sum() + 2 / 7 * hp_hold["E"].sum()
    Ay = 5 / 7 * hb["aux"].sum() + 2 / 7 * hp_hold["aux"].sum()
    cold = int(np.argmin(wxg.daily_mean_T()[:59]))
    c_sav = 1 - hb["E"][cold] / hp_hold["E"][cold]
    d_sav = 1 - hb["E"][md] / hp_hold["E"][md]
    hp_rows.append((dep, 1 - Ey / hp_hold["E"].sum(), d_sav, c_sav, Ay))
    print(f"  setback {dep} F: annual saving {1 - Ey/hp_hold['E'].sum():6.1%} | median day {d_sav:6.1%} | coldest Jan-Feb day {c_sav:6.1%} "
          f"| annual aux strip {Ay:6.0f} kWh vs held {hp_hold['aux'].sum():.0f} kWh")
OUT["heat_pump"] = [dict(depth_F=d, annual=a, median_day=m, coldest_day=c, aux_kwh=x) for d, a, m, c, x in hp_rows]

# ---------------------------------------------------------------------------------------------
banner("4. COOLING MIRROR — Miami FL TMY2, AC off while away (PREREG K5: does the model reproduce CU Boulder's ordering?)")
holdc = year_run(wxm, hs, "ac_ss", 75.0, 75.0)
mdc, ncc, mean_Tm = median_day(wxm, holdc["E"], {6, 7, 8})
print(f"median Jun-Aug day with demand: day {mdc}, daily-mean {mean_Tm[mdc]:.1f} F ({ncc} candidate days)")
cool_rows = {}
for kind in ("ac_ss", "ac_vs"):
    for label, ts_away in (("OFF", None), ("83 F", 83.0)):
        a, b = day_pair(wxm, hs, kind, 75.0, ts_away, mdc, (8.0, 17.0))
        c = compare(hs, a, b, kind)
        cool_rows[(kind, label)] = c["net"]
        print(f"  {kind:5s} away 8-17, AC {label:5s}: held {a['E'][-1]:5.2f} kWh  vs {b['E'][-1]:5.2f} kWh -> saving raw {c['raw']:6.1%} | original rule {c['endstate']:6.1%} | AMENDED {c['net']:6.1%} "
              f"(correction {c['drift']:.1%}; unit flat out after 5 pm {b['flat'][-1]:.2f} h; house peaks {b['extreme'][-1]:.1f} F)")
sweep_c = []
for ua_m, c_m, cap_m, ach, ap in combos:
    h2 = H.House(ua_env=520.0 * ua_m, ach=ach, ca=6000.0 * c_m, cm=14000.0 * c_m, aperture=ap)
    for kind in ("ac_ss", "ac_vs"):
        row = {}
        for name, away in (("h8", (8.0, 16.0)), ("h4", (12.0, 16.0))):
            a, b = day_pair(wxm, h2, kind, 75.0, None, mdc, away, cap=36000.0 * cap_m)
            c = compare(h2, a, b, kind)
            row[name] = (c["net"], c["ok"])
        sweep_c.append((kind, row))
for kind in ("ac_ss", "ac_vs"):
    rows = [r for k, r in sweep_c if k == kind and r["h8"][1] and r["h4"][1]]
    n_all = sum(1 for k, _ in sweep_c if k == kind)
    s8 = np.array([r["h8"][0] for r in rows]); s4 = np.array([r["h4"][0] for r in rows])
    print(f"\n  {kind}: stationary houses {len(rows)} of {n_all}")
    print(f"    8 h off saves in {int((s8 > 0).sum())} of {len(rows)}   (min {s8.min():.1%}  median {np.median(s8):.1%}  max {s8.max():.1%})")
    print(f"    4 h off  <= 2% or negative in {int((s4 <= 0.02).sum())} of {len(rows)}   (min {s4.min():.1%}  median {np.median(s4):.1%}  max {s4.max():.1%})")
rows_all = [(k, r) for k, r in sweep_c if r["h8"][1] and r["h4"][1]]
K5i = all(r["h8"][0] > 0 for _, r in rows_all)
K5ii = any(r["h4"][0] <= 0.02 for _, r in rows_all)
print(f"\nK5(i)  AC off 8 h saves in EVERY configuration : {'PASS' if K5i else 'FAIL'}")
print(f"K5(ii) AC off 4 h is MIXED (<=2%/negative somewhere): {'PASS' if K5ii else 'FAIL — the model flatters; the AC clause is DROPPED'}")
OUT["cooling"] = dict(md=int(mdc), median_day={f"{k}|{l}": float(v) for (k, l), v in cool_rows.items()}, K5i=bool(K5i), K5ii=bool(K5ii),
                      sweep={kind: dict(h8=[float(r['h8'][0]) for k, r in rows_all if k == kind],
                                        h4=[float(r['h4'][0]) for k, r in rows_all if k == kind]) for kind in ("ac_ss", "ac_vs")})

json.dump(OUT, open(os.path.join(HERE, "results", "stage3_results.json"), "w"), indent=1)
print("\nwrote results/stage3_results.json")
