"""Stage 3 for I92 — measure and cross-check before any script is approved.

Run with an interpreter that has `ephem` and `geonamescache`:
    python3 -m venv .v && .v/bin/pip install ephem geonamescache && .v/bin/python sunrise_check.py

What this settles, each as an assertion that can fail:
  A. The Gate 0 sketch's NOAA-formula sunrise agrees with an INDEPENDENT implementation (PyEphem,
     VSOP87-based, arcsecond-level) — so the mock's numbers are not self-confirming.
  B. THE OUTSIDE NUMBER. A contemporaneous report (Washington Post, quoted by The Washingtonian,
     2022) says the sun rose at 8:27 a.m. on 7 January 1974, the first Monday of year-round summer
     time. Computed here with parameters fixed before looking, NOT fitted.
  C. How the darkest morning is distributed over the US population (cities >= 15,000 from
     GeoNames, CC BY 4.0 — 65% of residents, a SKETCH of the country, not a census).
  D. The 1974 calendar: every date is a Sunday, and the lengths of the winter that was endured and
     the winter that was cancelled.
  E. The evening side — the same cities, the earliest sunset of the year — because a reel that
     shows only the morning is a hit piece.

Sunrise convention: upper limb, standard refraction (34'), i.e. the sun's centre 50' below the
horizon — the same as NOAA's 90.833 degrees and the convention of the US Naval Observatory.
"""
import datetime as dt
import json
import math
from pathlib import Path
from zoneinfo import ZoneInfo

import ephem
import geonamescache

HERE = Path(__file__).parent


# ── the independent implementation ─────────────────────────────────────────
def ephem_rise_set(lat, lon, date, tz_std_hours, kind="rise"):
    """Local clock minutes after midnight (at UTC offset tz_std_hours) of sunrise or sunset on `date`."""
    o = ephem.Observer()
    o.lat, o.lon, o.elevation = str(lat), str(lon), 0
    local_midnight_utc = dt.datetime(date.year, date.month, date.day) - dt.timedelta(hours=tz_std_hours)
    o.date = local_midnight_utc
    sun = ephem.Sun()
    t = (o.next_rising(sun) if kind == "rise" else o.next_setting(sun)).datetime()
    return (t - local_midnight_utc).total_seconds() / 60


# ── the Gate 0 sketch's formula, copied from mock_payoff.py so the comparison is like for like ──
def noaa_sunrise(lat, lon, date, tz):
    n = date.timetuple().tm_yday
    g = 2 * math.pi / 365 * (n - 1)
    eqt = 229.18 * (0.000075 + 0.001868 * math.cos(g) - 0.032077 * math.sin(g)
                    - 0.014615 * math.cos(2 * g) - 0.040849 * math.sin(2 * g))
    dec = (0.006918 - 0.399912 * math.cos(g) + 0.070257 * math.sin(g) - 0.006758 * math.cos(2 * g)
           + 0.000907 * math.sin(2 * g) - 0.002697 * math.cos(3 * g) + 0.00148 * math.sin(3 * g))
    la = math.radians(lat)
    cosha = math.cos(math.radians(90.833)) / (math.cos(la) * math.cos(dec)) - math.tan(la) * math.tan(dec)
    h0 = math.degrees(math.acos(max(-1, min(1, cosha))))
    return 720 - 4 * (lon + h0) - eqt + 60 * tz


def hhmm(m):
    m = round(m)
    return f"{m // 60}:{m % 60:02d}"


def latest_sunrise(lat, lon, tz, window=(dt.date(2025, 12, 26), dt.date(2026, 1, 16)), fn=None):
    best = None
    d = window[0]
    while d <= window[1]:
        v = fn(lat, lon, d, tz)
        if best is None or v > best[0]:
            best = (v, d)
        d += dt.timedelta(days=1)
    return best


OUT = {}

# ── A. cross-check the sketch against PyEphem on the named cities ──────────
CITIES = [
    ("New York", 40.71, -74.01, -5), ("Boston", 42.36, -71.06, -5), ("Washington", 38.91, -77.04, -5),
    ("Atlanta", 33.75, -84.39, -5), ("Detroit", 42.33, -83.05, -5), ("Indianapolis", 39.77, -86.16, -5),
    ("Fort Wayne", 41.08, -85.14, -5), ("Louisville", 38.25, -85.76, -5), ("Columbus", 39.96, -83.00, -5),
    ("Chicago", 41.88, -87.63, -6), ("Minneapolis", 44.98, -93.27, -6), ("Dallas", 32.78, -96.80, -6),
    ("Houston", 29.76, -95.37, -6), ("Denver", 39.74, -104.99, -7), ("Salt Lake City", 40.76, -111.89, -7),
    ("Boise", 43.62, -116.20, -7), ("Seattle", 47.61, -122.33, -8), ("Portland OR", 45.52, -122.68, -8),
    ("San Francisco", 37.77, -122.42, -8), ("Los Angeles", 34.05, -118.24, -8), ("Spokane", 47.66, -117.43, -8),
    ("Marquette MI", 46.54, -87.40, -5),
]
rows, worst = [], 0.0
for name, lat, lon, tz in CITIES:
    e_min, e_day = latest_sunrise(lat, lon, tz, fn=lambda a, b, c, d: ephem_rise_set(a, b, c, d))
    n_min, n_day = latest_sunrise(lat, lon, tz, fn=noaa_sunrise)
    diff = n_min - e_min
    worst = max(worst, abs(diff))
    rows.append(dict(city=name, date=e_day.isoformat(), std=hhmm(e_min), dst=hhmm(e_min + 60),
                     std_min=round(e_min, 1), noaa_minus_ephem_min=round(diff, 2)))
    print(f"{name:15s} latest {e_day:%b %d}  std {hhmm(e_min):>5s}  kept forward {hhmm(e_min + 60):>5s}  "
          f"(NOAA-sketch minus PyEphem {diff:+.2f} min)")
print(f"\nA. worst disagreement between the two implementations: {worst:.2f} min")
assert worst < 2.0, worst
OUT["cities"] = rows
OUT["A_worst_disagreement_min"] = round(worst, 2)

# ── B. the outside number, parameters fixed before the comparison ──────────
# Washington DC, Monday 7 January 1974, clocks at UTC-4 (year-round summer time). Published: 8:27.
dc = ephem_rise_set(38.91, -77.04, dt.date(1974, 1, 7), -4)
dc_std = ephem_rise_set(38.91, -77.04, dt.date(1974, 1, 7), -5)
print(f"\nB. Washington, 7 Jan 1974: computed sunrise on year-round summer time {hhmm(dc)} "
      f"(published: 8:27; same day on standard time {hhmm(dc_std)})")
assert abs(dc - (8 * 60 + 27)) <= 2, dc
OUT["B"] = dict(computed=hhmm(dc), published="8:27", standard_time=hhmm(dc_std))

# ── C. the darkest morning over the people who live in cities >= 15,000 ────
gc = geonamescache.GeonamesCache()
us = [c for c in gc.get_cities().values() if c["countrycode"] == "US"]
JAN, JUL = dt.datetime(2026, 1, 15, 12), dt.datetime(2026, 7, 1, 12)
obs, no_dst = [], 0
for c in us:
    z = ZoneInfo(c["timezone"])
    if z.dst(JUL) == dt.timedelta(0):          # Arizona, Hawaii: no summer time to keep, so no change
        no_dst += c["population"]
        continue
    tz = z.utcoffset(JAN).total_seconds() / 3600           # the standard-time offset in January
    best = max(ephem_rise_set(c["latitude"], c["longitude"], dt.date(2025, 12, 26) + dt.timedelta(days=k), tz)
               for k in range(22))
    obs.append((c["population"], best))
pop = sum(p for p, _ in obs)
COVER = 331.4e6                                 # 2020 Census resident population, ~331.4 M (LEAD, from memory)
print(f"\nC. {len(obs)} cities, {pop / 1e6:.1f} M people on summer time ({no_dst / 1e6:.1f} M in Arizona/Hawaii excluded); "
      f"~{(pop + no_dst) / COVER:.0%} of US residents")


def share(threshold_min, shift):
    return sum(p for p, m in obs if m + shift >= threshold_min) / pop


C = {}
for label, t in (("7:30", 450), ("8:00", 480), ("8:30", 510), ("9:00", 540)):
    C[label] = dict(today=round(share(t, 0), 4), kept_forward=round(share(t, 60), 4),
                    kept_forward_minus3=round(share(t, 57), 4), kept_forward_plus3=round(share(t, 63), 4))
    print(f"   sunrise on the darkest morning at {label} or later:  today {C[label]['today']:6.1%}   "
          f"kept forward {C[label]['kept_forward']:6.1%}   (+/-3 min: {C[label]['kept_forward_minus3']:.1%}..{C[label]['kept_forward_plus3']:.1%})")
srt = sorted(obs, key=lambda x: x[1])
acc, med = 0, None
for p, m in srt:
    acc += p
    if acc >= pop / 2:
        med = m
        break
print(f"   population-weighted median darkest-morning sunrise: today {hhmm(med)}, kept forward {hhmm(med + 60)}")
assert share(480, 60) > 0.5 > share(480, 0)       # kept forward, most people wait past 8:00; today, they do not
# THE FLOOR. The table covers ~65% of residents. Assume EVERY uncovered resident has an early sunrise (the
# worst case for the claim) and use the pessimistic -3 minute band: is "most Americans" still true?
floor = share(480, 57) * pop / COVER
print(f"   FLOOR on 'most Americans wait past 8:00': {floor:.1%} of ALL US residents, even if none of the uncovered 35% do")
assert floor > 0.5, floor
OUT["C_floor_most_americans"] = round(floor, 3)
OUT["C"] = dict(cities=len(obs), pop_millions=round(pop / 1e6, 1), excluded_no_dst_millions=round(no_dst / 1e6, 1),
                coverage_of_us=round((pop + no_dst) / COVER, 3), shares=C,
                median_today=hhmm(med), median_kept_forward=hhmm(med + 60))

# ── D. the 1974 calendar ───────────────────────────────────────────────────
D = dict(start=dt.date(1974, 1, 6), normal_dst_start=dt.date(1974, 4, 28), clocks_back=dt.date(1974, 10, 27),
         dst_resumes=dt.date(1975, 2, 23), law_signed=dt.date(1973, 12, 15), amended=dt.date(1974, 10, 5))
for k in ("start", "normal_dst_start", "clocks_back", "dst_resumes"):
    assert D[k].weekday() == 6, (k, D[k])                      # all four are Sundays
assert D["start"] == dt.date(1973, 12, 15) + dt.timedelta(days=22) + dt.timedelta(days=(6 - (dt.date(1973, 12, 15) + dt.timedelta(days=22)).weekday()) % 7) \
    or True                                                     # the statute says "4th Sunday after 15 Dec"; checked below
sundays = [dt.date(1973, 12, 15) + dt.timedelta(days=k) for k in range(1, 40) if (dt.date(1973, 12, 15) + dt.timedelta(days=k)).weekday() == 6]
assert sundays[3] == D["start"], sundays[:4]                    # the 4th Sunday after 15 Dec 1973 is 6 Jan 1974
endured = (D["normal_dst_start"] - D["start"]).days             # the winter days that were SPENT on year-round summer time
cancelled = (D["dst_resumes"] - D["clocks_back"]).days          # the winter days that were CANCELLED
total = (D["clocks_back"] - D["start"]).days
print(f"\nD. 6 Jan 1974 (a Sunday, the 4th after 15 Dec 1973) to 27 Oct 1974: {total} days = {total / 30.44:.1f} months.")
print(f"   Winter days actually spent on year-round summer time (6 Jan - 28 Apr): {endured} days = {endured / 30.44:.1f} months.")
print(f"   Winter days cancelled by P.L. 93-434 (27 Oct 1974 - 23 Feb 1975): {cancelled} days = {cancelled / 30.44:.1f} months.")
OUT["D"] = dict(start=str(D["start"]), total_days=total, total_months=round(total / 30.44, 1),
                endured_days=endured, cancelled_days=cancelled)
assert 9.5 < total / 30.44 < 10.0 and 3.5 < endured / 30.44 < 4.0

# ── E. the evening, for the same cities (the other side of the trade) ──────
print("\nE. Earliest sunset of the year (standard / kept forward) — the evening the clocks would give back:")
E = []
for name, lat, lon, tz in CITIES:
    s = min((ephem_rise_set(lat, lon, dt.date(2025, 11, 25) + dt.timedelta(days=k), tz, "set"), dt.date(2025, 11, 25) + dt.timedelta(days=k))
            for k in range(35))
    E.append(dict(city=name, date=s[1].isoformat(), std=hhmm(s[0]), dst=hhmm(s[0] + 60)))
    if name in ("New York", "Indianapolis", "Detroit", "Chicago", "Seattle", "Minneapolis"):
        print(f"   {name:13s} {s[1]:%b %d}  sunset {hhmm(s[0])} -> {hhmm(s[0] + 60)}")
OUT["E_evening"] = E

# ── F. the bus stop at 7:30, Indianapolis, the darkest morning ─────────────
o = ephem.Observer()
o.lat, o.lon, o.elevation, o.pressure = "39.77", "-86.16", 0, 0
sun = ephem.Sun()
day = [r for r in OUT["cities"] if r["city"] == "Indianapolis"][0]["date"]
y, m_, d_ = map(int, day.split("-"))
F = {}
for label, tz in (("today", -5), ("kept_forward", -4)):
    o.date = dt.datetime(y, m_, d_, 7, 30) - dt.timedelta(hours=tz)
    sun.compute(o)
    F[label] = round(math.degrees(sun.alt), 1)
print(f"\nF. Indianapolis {day}, 7:30 a.m. on the clock: sun at {F['today']} deg today, {F['kept_forward']} deg kept forward "
      f"(civil twilight is -6, nautical -12, astronomical -18)")
assert -8.5 < F["today"] < -5.5 and F["kept_forward"] < -16, F
OUT["F"] = F

# ── G. Washington, the documented morning, and the same stop in the evening ─
WLAT, WLON = "38.91", "-77.04"
def elev(lat, lon, when_local, tz):
    o = ephem.Observer(); o.lat, o.lon, o.elevation, o.pressure = lat, lon, 0, 0
    o.date = when_local - dt.timedelta(hours=tz)
    s_ = ephem.Sun(); s_.compute(o)
    return round(math.degrees(s_.alt), 1)
mon = dt.date(1974, 1, 7)
assert mon.weekday() == 0                                       # the first working day of the experiment
G = dict(monday=str(mon), sunrise_kept_forward=hhmm(dc), sunrise_standard=hhmm(dc_std),
         elev_kept_forward={t: elev(WLAT, WLON, dt.datetime(1974, 1, 7, h, m_), -4) for t, (h, m_) in
                            {"7:00": (7, 0), "7:30": (7, 30), "8:00": (8, 0), "8:30": (8, 30)}.items()},
         elev_standard_7_30=elev(WLAT, WLON, dt.datetime(1974, 1, 7, 7, 30), -5))
sunset_min = min((ephem_rise_set(38.91, -77.04, dt.date(2025, 11, 25) + dt.timedelta(days=k), -5, "set"),
                  dt.date(2025, 11, 25) + dt.timedelta(days=k)) for k in range(35))
dday = sunset_min[1]
G["evening"] = dict(date=str(dday), sunset_standard=hhmm(sunset_min[0]), sunset_kept_forward=hhmm(sunset_min[0] + 60),
                    elev_5pm_standard=elev(WLAT, WLON, dt.datetime(dday.year, dday.month, dday.day, 17, 0), -5),
                    elev_5pm_kept_forward=elev(WLAT, WLON, dt.datetime(dday.year, dday.month, dday.day, 17, 0), -4))
print(f"\nG. Washington {mon} (Monday), sun elevation by the clock (UTC-4, year-round summer time): {G['elev_kept_forward']}")
print(f"   same clock reading 7:30 on standard time: {G['elev_standard_7_30']} deg   (-6 = civil twilight ends, -12 nautical, -18 astronomical)")
print(f"   evening, Washington {dday}: sunset {G['evening']['sunset_standard']} -> {G['evening']['sunset_kept_forward']}; "
      f"sun at 5:00 p.m.: {G['evening']['elev_5pm_standard']} deg today vs {G['evening']['elev_5pm_kept_forward']} deg kept forward")
assert G["elev_kept_forward"]["7:00"] < -12 and G["elev_kept_forward"]["7:30"] < -6   # the hook is twilight, not noon
assert G["elev_standard_7_30"] > -2                                                  # on standard time the sun has just come up
assert G["evening"]["elev_5pm_standard"] < 0 < G["evening"]["elev_5pm_kept_forward"]
OUT["G_washington"] = G

(HERE / "figures.json").write_text(json.dumps(OUT, indent=1, default=str))
print("\nwrote", HERE / "figures.json")
