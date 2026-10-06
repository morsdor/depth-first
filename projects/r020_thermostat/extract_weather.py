"""Extract the two typical-year weather files that ship inside the `pvlib` wheel into small CSVs.

WHY THESE TWO AND NO OTHERS: in this container every weather host (NOAA, NREL, Open-Meteo, EIA,
energy.gov) is refused by the egress proxy and only PyPI is reachable. pvlib's wheel bundles three
typical-meteorological-year files — Greensboro NC (TMY3), Miami FL (TMY2) and Sand Point AK (TMY3).
Sand Point is a remote Alaskan station no US household resembles, so it is not used. The cities were
therefore FORCED BY AVAILABILITY, not chosen by looking at results (PREREG.md §1).

TMY3 / TMY2 are NREL typical-year products of US government station data; redistributable.
Output columns: month, day, hour (1-24, hour ENDING), tdb_F, dew_F, rh_pct, ghi_Wm2.
"""
import csv
import os

import pvlib

D = os.path.join(os.path.dirname(pvlib.__file__), "data")
HERE = os.path.dirname(os.path.abspath(__file__))


def f(c):
    return c * 9.0 / 5.0 + 32.0


g, _ = pvlib.iotools.read_tmy3(os.path.join(D, "723170TYA.CSV"), coerce_year=1999, map_variables=False)
with open(os.path.join(HERE, "data", "greensboro_tmy3.csv"), "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["month", "day", "hour", "tdb_F", "dew_F", "rh_pct", "ghi_Wm2"])
    for ts, r in g.iterrows():
        w.writerow([ts.month, ts.day, ts.hour if ts.hour else 24, round(f(r["Dry-bulb (C)"]), 2),
                    round(f(r["Dew-point (C)"]), 2), int(r["RHum (%)"]), int(r["GHI (W/m^2)"])])

m, _ = pvlib.iotools.read_tmy2(os.path.join(D, "12839.tm2"))
with open(os.path.join(HERE, "data", "miami_tmy2.csv"), "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["month", "day", "hour", "tdb_F", "dew_F", "rh_pct", "ghi_Wm2"])
    for ts, r in m.iterrows():
        w.writerow([ts.month, ts.day, ts.hour if ts.hour else 24, round(f(r["DryBulb"] / 10.0), 2),
                    round(f(r["DewPoint"] / 10.0), 2), int(r["RHum"]), int(r["GHI"])])
print("wrote", os.listdir(os.path.join(HERE, "data")))
