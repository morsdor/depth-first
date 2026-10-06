"""Gate 0 sketch model for I91 — one house, one hot day, AC held vs AC off while out.

NOT the Stage 3 model. A one-zone lumped heat balance whose only job at Gate 0 is to
(a) give the payoff still honest-looking numbers and (b) show where the toy model
AGREES with the claim more strongly than the literature does (CLAUDE.md non-negotiable 7).

Every parameter below is fixed BEFORE the comparison is run, from ordinary building
values, and none is tuned to the result. They are placeholders, not measurements.

    C dT/dt = UA (T_out - T) + Q_gain(t) - Q_ac(t)

Q_ac holds the setpoint when the AC is on (ideal modulation: same average energy as a
cycling unit), capped at the unit's capacity. Energy = integral of Q_ac / (3412 * COP).
"""
import math

DT_MIN = 1.0                       # 1-minute steps
SET = 75.0                         # °F, a common summer setpoint
UA = 700.0                         # BTU/h·°F  envelope + infiltration, ~1,800 sq ft house
C = 15000.0                        # BTU/°F    air + furnishings + some structure
CAP = 36000.0                      # BTU/h     a 3-ton unit
COP = 3.2                          # constant; real units vary with outdoor temperature
RATE = 0.17                        # $/kWh     placeholder for the EIA US residential average


def t_out(h):                      # °F  hot day: 78 at 4 am, 98 at 4 pm
    return 88.0 + 10.0 * math.sin(2 * math.pi * (h - 10.0) / 24.0)


def q_gain(h, away):               # BTU/h  solar through windows + people and appliances
    sun = 6000.0 * max(0.0, math.sin(math.pi * (h - 7.0) / 12.0)) if 7 <= h <= 19 else 0.0
    people = 0.0 if away else 1500.0
    return sun + people + 800.0    # 800 = fridge etc., always on


def day(away_from=8.0, away_to=17.0, ac_off_while_away=True, ua=UA, c=C, cap=CAP, set_=SET):
    T, kwh, hist, ac_hist = set_, 0.0, [], []
    for i in range(int(24 * 60 / DT_MIN)):
        h = i * DT_MIN / 60.0
        away = away_from <= h < away_to
        off = ac_off_while_away and away
        need = ua * (t_out(h) - set_) + q_gain(h, away)      # heat to remove to hold T at set_
        if off:
            q_ac = 0.0
        elif T > set_ + 1e-9:                                # recovering: run flat out
            q_ac = cap
        else:                                                # holding: just match the leak
            q_ac = min(max(need, 0.0), cap)
        dT = (ua * (t_out(h) - T) + q_gain(h, away) - q_ac) / c * (DT_MIN / 60.0)
        T_new = T + dT
        if not off and T > set_ and T_new < set_:            # do not overshoot below the setpoint
            frac = (T - set_) / (T - T_new)
            q_ac *= frac
            T_new = set_
        T = T_new
        kwh += q_ac * (DT_MIN / 60.0) / (3412.0 * COP)
        hist.append((h, T)); ac_hist.append(q_ac)
    return dict(kwh=kwh, T_end=T, peak=max(t for _, t in hist), hist=hist, ac=ac_hist)


if __name__ == "__main__":
    A = day(ac_off_while_away=False)
    B = day(ac_off_while_away=True)
    assert abs(A["T_end"] - SET) < 0.05 and abs(B["T_end"] - SET) < 0.05, "both days must end at the setpoint"
    sav = 1 - B["kwh"] / A["kwh"]
    print(f"AC held at {SET:.0f}°F all day : {A['kwh']:.1f} kWh  = ${A['kwh']*RATE:.2f}")
    print(f"AC off 8 am–5 pm, back on 5 pm : {B['kwh']:.1f} kWh  = ${B['kwh']*RATE:.2f}   "
          f"(house peaks {B['peak']:.0f}°F; saves {sav:.0%})")
    rec = sum(1 for (h, _), q in zip(B["hist"], B["ac"]) if h >= 17 and q >= CAP - 1) / 60.0
    print(f"   after 5 pm the unit runs flat out for {rec:.1f} h")

    print("\nsweep — does the ORDERING hold? (by construction it will: a constant-COP model with no humidity)")
    print(f"{'case':34s}{'held kWh':>10s}{'off kWh':>10s}{'saving':>9s}")
    cases = [("baseline, out 9 h", {}),
             ("out 4 h (12–4 pm)", dict(away_from=12.0, away_to=16.0)),
             ("out 2 h (3–5 pm)", dict(away_from=15.0, away_to=17.0)),
             ("leakier house UA x1.5", dict(ua=UA * 1.5)),
             ("tighter house UA x0.6", dict(ua=UA * 0.6)),
             ("heavy house C x2", dict(c=C * 2)),
             ("light house C x0.5", dict(c=C * 0.5)),
             ("small unit 2 tons", dict(cap=24000.0)),
             ("setpoint 72", dict(set_=72.0))]
    for name, kw in cases:
        a = day(ac_off_while_away=False, **kw); b = day(ac_off_while_away=True, **kw)
        s = 1 - b["kwh"] / a["kwh"]
        assert b["kwh"] <= a["kwh"] + 1e-6
        flag = ""
        if abs(b["T_end"] - kw.get("set_", SET)) > 0.3:      # an unrecovered house is not a like-for-like day
            flag = f"   <- NOT comparable: off-day ends at {b['T_end']:.0f}°F, never recovered"
        print(f"{name:34s}{a['kwh']:10.1f}{b['kwh']:10.1f}{s:9.1%}{flag}")
    print("\nNOTE: the 4 h and 2 h rows save here. Baker, Scheib & Pigott (CU Boulder, 2022) found a 4 h absence\n"
          "      MIXED. The toy model agrees with the claim MORE strongly than the literature does — that is the\n"
          "      shape of a missing physical effect (latent/humidity load, COP vs load), not of a discovery.")


# ====================================================================================
# HEATING MIRROR — added 2026-10-06 when the owner chose "thermostat" (heat OR AC).
#
# CHOSEN BEFORE THIS CASE WAS RUN, and on grounds that do not depend on its result: heating is the
# lead case because it is in season (6 Oct) and because DOE's published figure and the Canadian
# twin-house measurement are both for heating. A gas furnace has an efficiency that does not
# change with outdoor temperature, so this toy model is least wrong here. Parameters are the same
# house as above (UA, C); the rest are ordinary values fixed now.
#
# The drift is a SETBACK, not "off": in winter "off" risks frozen pipes, so the copy must never
# say off for heat. DOE's own rule of thumb is a 7–10 °F setback for 8 h/day.
# ====================================================================================
SET_H = 70.0               # °F  normal winter setpoint
BACK_H = 62.0              # °F  8 °F setback while out (inside DOE's 7–10 °F)
FURN_CAP = 60000.0         # BTU/h output of the furnace
AFUE = 0.95                # constant efficiency (placeholder)
PRICE_THERM = 1.60         # $/therm placeholder; 1 therm = 100,000 BTU of gas


def t_out_w(h):            # °F  cold day: 15 at 3 am, 35 at 3 pm
    return 25.0 + 10.0 * math.sin(2 * math.pi * (h - 9.0) / 24.0)


def q_gain_w(h, away):     # BTU/h  weak winter sun + people + always-on appliances
    sun = 3000.0 * max(0.0, math.sin(math.pi * (h - 8.0) / 8.0)) if 8 <= h <= 16 else 0.0
    return sun + (0.0 if away else 1500.0) + 800.0


def day_heat(away_from=8.0, away_to=17.0, setback=True, back=BACK_H, ua=UA, c=C, cap=FURN_CAP, set_=SET_H):
    T, btu_in, hist, fur = set_, 0.0, [], []
    for i in range(int(24 * 60 / DT_MIN)):
        h = i * DT_MIN / 60.0
        away = away_from <= h < away_to
        ts = back if (setback and away) else set_
        need = ua * (ts - t_out_w(h)) - q_gain_w(h, away)       # heat to add to hold T at ts
        if T > ts + 1e-9:
            q = 0.0                                              # warmer than the target: coast, furnace OFF
        elif T < ts - 1e-9:
            q = cap                                              # colder than the target: run flat out
        else:
            q = min(max(need, 0.0), cap)                         # at the target: match the leak
        T_new = T + (ua * (t_out_w(h) - T) + q_gain_w(h, away) + q) / c * (DT_MIN / 60.0)
        if T > ts and T_new < ts:                                # coasted down to the target mid-step
            coast = (T - ts) / (T - T_new)
            q = (1.0 - coast) * min(max(need, 0.0), cap)
            T_new = ts
        elif T < ts and T_new > ts:                              # recovered up to the target mid-step
            q *= (ts - T) / (T_new - T)
            T_new = ts
        T = T_new
        btu_in += q * (DT_MIN / 60.0) / AFUE
        hist.append((h, T)); fur.append(q)
    return dict(therms=btu_in / 1e5, T_end=T, low=min(t for _, t in hist), hist=hist, fur=fur)


if __name__ == "__main__":
    print("\n" + "=" * 100 + "\nHEATING MIRROR — one cold day, thermostat held at 70 vs set back to 62 while out 8 am–5 pm")
    A = day_heat(setback=False)
    B = day_heat(setback=True)
    assert abs(A["T_end"] - SET_H) < 0.05 and abs(B["T_end"] - SET_H) < 0.05, "both days must end at the setpoint"
    sav = 1 - B["therms"] / A["therms"]
    flat = sum(1 for (h, _), q in zip(B["hist"], B["fur"]) if h >= 17 and q >= FURN_CAP - 1) / 60.0
    print(f"held at {SET_H:.0f}°F all day   : {A['therms']:.2f} therms = ${A['therms']*PRICE_THERM:.2f}")
    print(f"set back to {BACK_H:.0f}°F 8–5   : {B['therms']:.2f} therms = ${B['therms']*PRICE_THERM:.2f}   "
          f"(house falls to {B['low']:.0f}°F; saves {sav:.0%}; furnace flat out {flat:.1f} h after 5 pm)")
    print(f"\n{'case':38s}{'held':>8s}{'back':>8s}{'saving':>9s}")
    cases = [("baseline, out 9 h, 8°F back", {}),
             ("out 4 h (12–4 pm)", dict(away_from=12.0, away_to=16.0)),
             ("out 2 h (3–5 pm)", dict(away_from=15.0, away_to=17.0)),
             ("shallow 4°F back", dict(back=66.0)),
             ("deep 15°F back (55°F)", dict(back=55.0)),
             ("leakier house UA x1.5", dict(ua=UA * 1.5)),
             ("tighter house UA x0.6", dict(ua=UA * 0.6)),
             ("heavy house C x2", dict(c=C * 2)),
             ("small furnace 36 kBTU/h", dict(cap=36000.0))]
    for name, kw in cases:
        a = day_heat(setback=False, **{k: v for k, v in kw.items() if k != "back"})
        b = day_heat(setback=True, **kw)
        s = 1 - b["therms"] / a["therms"]
        assert b["therms"] <= a["therms"] + 1e-6
        flag = ""
        if abs(b["T_end"] - kw.get("set_", SET_H)) > 0.3:
            flag = f"   <- NOT comparable: back-day ends at {b['T_end']:.0f}°F, never recovered"
        print(f"{name:38s}{a['therms']:8.2f}{b['therms']:8.2f}{s:9.1%}{flag}")
    print("\nOUTSIDE NUMBERS this is NOT yet checked against (and the bases differ — read before use):\n"
          "  CCHT twin-house experiment (CMHC): 11°F setback, night + work hours -> 13% gas saved; up to 17–21% on the\n"
          "      COLDEST day, 10–13% over the whole season. One day's saving is expected to exceed the seasonal one.\n"
          "  DOE rule of thumb: ~1% per degree for 8 h/day, 'as much as 10%' a year. ANNUAL, not one cold day.\n"
          "  A 2,658-home US programmable-thermostat study: ~6%. Real behaviour, not an ideal schedule.\n"
          "  The toy model's constant-AFUE, ideal-modulation furnace and absent cycling/infiltration losses mean it should\n"
          "  read at or ABOVE the cold-day figure, and any ordering it cannot lose is not evidence (r011).")
