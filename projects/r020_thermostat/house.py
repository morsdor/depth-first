"""Stage 3 model for I91 — a two-node RC house, real typical-year weather, three kinds of HVAC.

Everything in PREREG.md §2–§3 lives here; nothing is tuned. Two nodes:

    Ca dTa/dt = hA (Tm - Ta) + UA_inf (To - Ta) + q_solar + q_internal + q_hvac     (air + furnishings)
    Cm dTm/dt = hA (Ta - Tm) + UA_env (To - Tm)                                      (structure)

Control is IDEAL, and the same shape for heat and cool: COAST (equipment off) while the air is on
the wrong side of the target, RUN FLAT OUT while it is on the near side, and MATCH THE LEAK exactly
when it is at the target. Cycling losses are lumped into AFUE / COP.

check_closure() proves the integrator conserves energy; it does NOT prove the model is unbiased —
that is what the outside numbers are for (CLAUDE.md non-negotiable 7, r011).
"""
import csv
import os

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BTU_KWH = 3412.14
EPS = 1e-9
AUX_BTUH = 10.0 * BTU_KWH            # 10 kW resistance strip, COP 1
AUX_TRIGGER_F = 1.5                  # aux engages when the house is this far under target


class House:
    def __init__(self, ua_env=520.0, ach=0.35, vol=14400.0, ca=6000.0, cm=14000.0, ha=2000.0,
                 aperture=3.0, q_base=800.0, q_home=1500.0):
        self.ua_env, self.ach, self.vol = ua_env, ach, vol
        self.ca, self.cm, self.ha = ca, cm, ha
        self.aperture, self.q_base, self.q_home = aperture, q_base, q_home

    @property
    def ua_inf(self):
        return 0.018 * self.vol * self.ach


class Weather:
    def __init__(self, name):
        rows = list(csv.DictReader(open(os.path.join(HERE, "data", name + ".csv"))))
        assert len(rows) == 8760
        self.T = np.array([float(r["tdb_F"]) for r in rows])
        self.G = np.array([float(r["ghi_Wm2"]) for r in rows])
        self.month = np.array([int(r["month"]) for r in rows])
        self._cache = {}

    def grid(self, dt_min):
        if dt_min not in self._cache:
            n = 8760
            t = (np.arange(int(n * 60 / dt_min)) + 0.5) * dt_min / 60.0       # step midpoints, hours
            xp = np.arange(-1, n + 1) + 0.5                                   # records sit at mid-hour
            ext = lambda a: np.concatenate(([a[-1]], a, [a[0]]))
            self._cache[dt_min] = (np.interp(t, xp, ext(self.T)), np.interp(t, xp, ext(self.G)))
        return self._cache[dt_min]

    def daily_mean_T(self):
        return self.T.reshape(365, 24).mean(axis=1)


def cop_ac(to):
    return max(1.8, 3.95 - 0.043 * (to - 82.0))


def cop_hp(to):
    if to >= 47.0:
        return 3.0
    if to >= 17.0:
        return float(np.interp(to, [17.0, 30.0, 47.0], [1.7, 2.2, 3.0]))
    return max(1.0, 1.7 - 0.03 * (17.0 - to))


def cap_hp(to):
    return 36000.0 * max(0.3, 1.0 - 0.4 * min(max((47.0 - to) / 30.0, 0.0), 1.2))


def run(wx, house, kind, ts_home, ts_away, away_from=8.0, away_to=17.0, dt_min=3.0,
        start_day=0, n_days=365, init=None, cap=None, trace_day=None):
    """kind: 'furnace' | 'ac_ss' | 'ac_vs' | 'hp'.  ts_away=None means AC/equipment OFF while away.

    Returns dict of per-day arrays: E (BTU gas input for furnace, kWh for the rest), aux (kWh, hp),
    flat (h at full output after away_to), Ta_end, Tm_end, extreme (house low/high while away),
    plus 'closure' (relative energy-balance error) and the final state."""
    To_a, G_a = wx.grid(dt_min)
    dt = dt_min / 60.0
    spd = int(round(24.0 / dt))
    heating = kind in ("furnace", "hp")
    if cap is None:
        cap = 60000.0 if kind == "furnace" else (36000.0 if kind in ("ac_ss", "ac_vs") else None)
    ca, cm, ha, uai, uae = house.ca, house.cm, house.ha, house.ua_inf, house.ua_env
    Ta, Tm = init if init is not None else (ts_home, ts_home)
    E = np.zeros(n_days); AUX = np.zeros(n_days); FLAT = np.zeros(n_days)
    TA_END = np.zeros(n_days); TM_END = np.zeros(n_days); EXT = np.zeros(n_days)
    TA_ST = np.zeros(n_days); TM_ST = np.zeros(n_days)
    trace = None
    gains_sum = hv_sum = ex_sum = 0.0
    Ta0, Tm0 = Ta, Tm
    for d in range(n_days):
        day = (start_day + d) % 365
        k0 = day * spd
        e = aux = flat = 0.0
        TA_ST[d], TM_ST[d] = Ta, Tm
        ext = 1e9 if heating else -1e9
        if trace_day == d:
            trace = {k: [] for k in ("Ta", "Tm", "q", "To", "away", "ts")}
        for j in range(spd):
            k = k0 + j
            hod = j * dt
            away = away_from <= hod < away_to
            if not away:
                ts = ts_home
            elif ts_away is None:
                assert not heating, "heating setback must be a temperature, never OFF"
                ts = 1e9                                   # cooling OFF while away: never runs
            else:
                ts = ts_away
            To = To_a[k]
            qin = house.q_base + (0.0 if away else house.q_home) + 3.412 * house.aperture * G_a[k]
            f_air = ha * (Tm - Ta) + uai * (To - Ta) + qin
            Tm_n = Tm + (ha * (Ta - Tm) + uae * (To - Tm)) / cm * dt
            q = 0.0
            if heating:
                capn = cap if kind == "furnace" else cap_hp(To)
                top = capn if kind == "furnace" else capn + (AUX_BTUH if Ta < ts - AUX_TRIGGER_F else 0.0)
                if Ta > ts + EPS:                                             # warmer than target: coast
                    Tn = Ta + f_air / ca * dt
                    if Tn < ts:
                        frac = (Ta - ts) / (Ta - Tn)
                        fh = ha * (Tm - ts) + uai * (To - ts) + qin
                        q = (1.0 - frac) * min(max(-fh, 0.0), top); Tn = ts
                elif Ta < ts - EPS:                                           # colder than target: flat out
                    q = top
                    Tn = Ta + (f_air + q) / ca * dt
                    if Tn > ts:
                        frac = (ts - Ta) / (Tn - Ta)
                        fh = ha * (Tm - ts) + uai * (To - ts) + qin
                        q = q * frac + (1.0 - frac) * min(max(-fh, 0.0), top); Tn = ts
                else:                                                         # at target: match the leak
                    q = min(max(-f_air, 0.0), top)
                    Tn = Ta + (f_air + q) / ca * dt
                if kind == "furnace":
                    e += q * dt / 0.95
                else:
                    comp = min(q, capn)
                    ax = q - comp
                    e += comp * dt / (cop_hp(To) * BTU_KWH) + ax * dt / BTU_KWH
                    aux += ax * dt / BTU_KWH
                hv = q
                if q >= top * 0.999 and hod >= away_to:
                    flat += dt
                if away:
                    ext = min(ext, Ta)
            else:
                if Ta > ts + EPS:                                             # warmer than target: flat out
                    q = cap
                    Tn = Ta + (f_air - q) / ca * dt
                    if Tn < ts:
                        frac = (Ta - ts) / (Ta - Tn)
                        fh = ha * (Tm - ts) + uai * (To - ts) + qin
                        q = q * frac + (1.0 - frac) * min(max(fh, 0.0), cap); Tn = ts
                elif Ta < ts - EPS:                                           # cooler than target: coast
                    Tn = Ta + f_air / ca * dt
                    if Tn > ts:
                        frac = (ts - Ta) / (Tn - Ta)
                        fh = ha * (Tm - ts) + uai * (To - ts) + qin
                        q = (1.0 - frac) * min(max(fh, 0.0), cap); Tn = ts
                else:
                    q = min(max(f_air, 0.0), cap)
                    Tn = Ta + (f_air - q) / ca * dt
                cp = cop_ac(To)
                if kind == "ac_vs" and q > 0.0:
                    plr = max(q / cap, 0.4)
                    cp = cp * (1.0 + 0.30 * (1.0 - plr))
                e += q * dt / (cp * BTU_KWH) + 0.4 * dt * (q / cap)
                hv = -q
                if q >= cap * 0.999 and hod >= away_to:
                    flat += dt
                if away:
                    ext = max(ext, Ta)
            gains_sum += qin * dt
            hv_sum += hv * dt
            ex_sum += (uai * (To - Ta) + uae * (To - Tm)) * dt
            if trace is not None and trace_day == d:
                trace["Ta"].append(Ta); trace["Tm"].append(Tm); trace["q"].append(q)
                trace["To"].append(To); trace["away"].append(away); trace["ts"].append(ts if ts < 1e8 else None)
            Ta, Tm = Tn, Tm_n
        E[d], AUX[d], FLAT[d], TA_END[d], TM_END[d], EXT[d] = e, aux, flat, Ta, Tm, ext
    stored = ca * (Ta - Ta0) + cm * (Tm - Tm0)
    flows = gains_sum + hv_sum + ex_sum
    scale = max(abs(gains_sum), abs(hv_sum), abs(ex_sum), 1.0)
    return dict(E=E, aux=AUX, flat=FLAT, Ta_end=TA_END, Tm_end=TM_END, Ta_st=TA_ST, Tm_st=TM_ST, extreme=EXT, trace=trace,
                closure=abs(stored - flows) / scale, final=(Ta, Tm))


def stored_correction(house, a_end, b_end):
    """BTU of stored heat by which run b's end state differs from run a's (b minus a)."""
    return house.ca * (b_end[0] - a_end[0]) + house.cm * (b_end[1] - a_end[1])
