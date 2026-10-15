"""yt001 — every number and every animation datum in the GPS video comes from here.

  numbers.json   the figures the narration and on-screen readouts quote
  gps_data.json  the solver iterates, the 2D clock-bias demo, the visibility check

Nothing here is fitted. Constants are CODATA / IAU / IS-GPS-200 values; the relativistic offsets are
computed from them, then COMPARED with outside numbers (the published 10.22999999543 MHz and the
NTS-2 prediction of +446.5 parts per trillion) rather than tuned to match. The orbit is derived from
Kepler's third law with a half-sidereal-day period, then compared with gps.gov's "about 20,200 km".
"""
import json
import math
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
C = 299_792_458.0
GM = 3.986004418e14                  # m^3 s^-2
W0 = 62_636_856.0                    # IAU geoid potential, m^2 s^-2 (rotation included)
R_MEAN = 6_371_000.0
R_EQ = 6_378_137.0
OMEGA_E = 7.2921151467e-5            # rad/s
SIDEREAL_DAY = 86_164.0905
DAY = 86_400.0

out = {}

# ── the orbit, from Kepler, not typed in ───────────────────────────────────
T_ORB = SIDEREAL_DAY / 2
A = (GM * (T_ORB / (2 * math.pi)) ** 2) ** (1 / 3)
V = math.sqrt(GM / A)
ALT_MEAN = A - R_MEAN
out.update(a_km=A / 1e3, alt_km=ALT_MEAN / 1e3, v_kms=V / 1e3, period_h=T_ORB / 3600)
assert 20_100 < ALT_MEAN / 1e3 < 20_300, ALT_MEAN               # gps.gov: "approximately 20,200 km"
assert abs(V - 3874) < 15, V                                       # "nearly four kilometres a second"

# ── signal timing ──────────────────────────────────────────────────────────
overhead_s = ALT_MEAN / C
def slant(el_deg, r=R_MEAN):
    e = math.radians(el_deg)
    return math.sqrt(A ** 2 - (r * math.cos(e)) ** 2) - r * math.sin(e)
out.update(overhead_ms=overhead_s * 1e3, horizon5_ms=slant(5) / C * 1e3, ns_m=C * 1e-9, us_m=C * 1e-6)
assert 66 < out["overhead_ms"] < 69

# ── the clocks ─────────────────────────────────────────────────────────────
sr = -(V ** 2 / (2 * C ** 2)) * DAY * 1e6                         # µs/day, moving clock slow
gr = ((W0 - GM / A) / C ** 2) * DAY * 1e6                         # µs/day, weaker gravity -> faster
net = sr + gr
frac = net * 1e-6 / DAY
nominal = 10.23
set_mhz = nominal * (1 - frac)
out.update(sr_us_day=sr, gr_us_day=gr, net_us_day=net, net_km_day=net * 1e-6 * C / 1e3,
           frac_ppt=frac * 1e12, set_mhz_str=f"{set_mhz:.12f}")
assert abs(round(set_mhz, 11) - 10.22999999543) < 2e-11, set_mhz   # outside number: the published pre-launch setting
assert abs(frac * 1e12 - 446.5) < 1.0, frac * 1e12                 # outside number: NTS-2's relativistic prediction
assert 7.0 < -sr < 7.4 and 45.5 < gr < 46.1 and 38.3 < net < 38.9

# ── is "at least four above the horizon, almost anywhere" true? ────────────
def walker(total, planes, phasing, inc_deg, a):
    sats = []
    per = total // planes
    for p in range(planes):
        raan = math.radians(360 * p / planes)
        for s in range(per):
            u0 = math.radians(360 * s / per + 360 * phasing * p / total)
            sats.append((raan, u0))
    return sats

def sat_eci(raan, u0, inc, t):
    u = u0 + 2 * math.pi * t / T_ORB
    x = A * (math.cos(raan) * math.cos(u) - math.sin(raan) * math.sin(u) * math.cos(inc))
    y = A * (math.sin(raan) * math.cos(u) + math.cos(raan) * math.sin(u) * math.cos(inc))
    z = A * math.sin(u) * math.sin(inc)
    return np.array([x, y, z])

def ecef(r_eci, t):
    th = OMEGA_E * t
    c_, s_ = math.cos(th), math.sin(th)
    return np.array([c_ * r_eci[0] + s_ * r_eci[1], -s_ * r_eci[0] + c_ * r_eci[1], r_eci[2]])

def site(lat, lon, h=0.0):
    la, lo = math.radians(lat), math.radians(lon)
    e2 = 0.00669437999014
    N = R_EQ / math.sqrt(1 - e2 * math.sin(la) ** 2)
    return np.array([(N + h) * math.cos(la) * math.cos(lo), (N + h) * math.cos(la) * math.sin(lo),
                     (N * (1 - e2) + h) * math.sin(la)])

def elevation(sat, rx, lat, lon):
    la, lo = math.radians(lat), math.radians(lon)
    up = np.array([math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la)])
    d = sat - rx
    return math.degrees(math.asin(float(d @ up) / np.linalg.norm(d)))

INC = math.radians(55.0)
vis = {}
for name, total, planes in (("baseline24", 24, 6),):
    sats = walker(total, planes, 1, 55.0, A)
    counts = []
    for lat in range(-80, 81, 10):
        for lon in range(0, 360, 20):
            rx = site(lat, lon)
            for t in range(0, int(SIDEREAL_DAY), 900):
                n = sum(1 for (raan, u0) in sats
                        if elevation(ecef(sat_eci(raan, u0, INC, t), t), rx, lat, lon) >= 5.0)
                counts.append(n)
    counts = np.array(counts)
    vis[name] = {"min": int(counts.min()), "p1": float(np.percentile(counts, 1)), "mean": float(counts.mean()),
                 "frac_ge4": float((counts >= 4).mean())}
out["visibility_24_walker_5deg"] = vis["baseline24"]

# ── the position fix: real Gauss-Newton on real geometry ───────────────────
rng = np.random.default_rng(11)
LAT, LON = 19.076, 72.878                                           # the viewer's blue dot
rx_true = site(LAT, LON)
T0 = 3600.0 * 5.0
sats31 = []
sizes = [6, 5, 5, 5, 5, 5]
for p, nsat in enumerate(sizes):
    raan = math.radians(60 * p)
    for s in range(nsat):
        sats31.append((raan, math.radians(360 * s / nsat + 17 * p)))
assert len(sats31) == 31
vis_idx = [(i, elevation(ecef(sat_eci(r, u, INC, T0), T0), rx_true, LAT, LON))
           for i, (r, u) in enumerate(sats31)]
vis_idx = [(i, e) for i, e in vis_idx if e >= 10.0]
vis_idx.sort(key=lambda t: -t[1])
import itertools
def pdop_of(idx_list):
    Sx = np.array([ecef(sat_eci(*sats31[i], INC, T0), T0) for i in idx_list])
    dd = np.linalg.norm(Sx - rx_true, axis=1)
    Jx = np.hstack([-(Sx - rx_true) / dd[:, None], np.ones((len(idx_list), 1))])
    Gx = np.linalg.inv(Jx.T @ Jx)
    return math.sqrt(Gx[0, 0] + Gx[1, 1] + Gx[2, 2])
cands = [i for i, _ in vis_idx]
assert len(cands) >= 4, vis_idx
use = list(min(itertools.combinations(cands, 4), key=pdop_of))     # the four best-placed satellites in view
out["n_visible_10deg"] = len(cands)
S = np.array([ecef(sat_eci(*sats31[i], INC, T0), T0) for i in use])
B_TRUE = 0.0005                                                     # 0.5 ms quartz error = 150 km
SIGMA = 2.0                                                         # m — the SPS user-range-error spec
rho = np.linalg.norm(S - rx_true, axis=1) + C * B_TRUE + rng.normal(0, SIGMA, 4)
x = np.zeros(4)                                                     # guess: Earth's centre, clock right
iters = []
def err_pos(x_): return float(np.linalg.norm(x_[:3] - rx_true))
iters.append({"k": 0, "pos_err_m": err_pos(x), "b_err_s": float(x[3] / C - B_TRUE), "resid_m": float(np.linalg.norm(rho - (np.linalg.norm(S - x[:3], axis=1) + x[3])))})
for k in range(1, 20):
    d = np.linalg.norm(S - x[:3], axis=1)
    pred = d + x[3]
    J = np.hstack([-(S - x[:3]) / d[:, None], np.ones((4, 1))])
    dx = np.linalg.solve(J, rho - pred)
    x = x + dx
    iters.append({"k": k, "pos_err_m": err_pos(x), "b_err_s": float(x[3] / C - B_TRUE),
                  "resid_m": float(np.linalg.norm(rho - (np.linalg.norm(S - x[:3], axis=1) + x[3]))),
                  "step_m": float(np.linalg.norm(dx[:3]))})
    if np.linalg.norm(dx) < 1e-4:
        break
n_it = iters[-1]["k"]
G = np.linalg.inv(J.T @ J)
pdop = math.sqrt(G[0, 0] + G[1, 1] + G[2, 2])
out.update(iters=n_it, final_pos_err_m=iters[-1]["pos_err_m"], pdop=pdop, b_true_ms=B_TRUE * 1e3,
           b_est_ms=float(x[3] / C * 1e3), sigma_m=SIGMA)
assert abs(x[3] / C - B_TRUE) < 5e-8, "clock bias must be recovered to ~15 m of range"
assert iters[-1]["pos_err_m"] < 40, iters[-1]

# ── the clock-bias picture in 2D: why three circles never meet (3 unknowns, 3 satellites) ──
sat2 = np.array([[-6.0, 7.0], [7.5, 6.0], [1.0, -8.5]])             # km (a toy plane, not to scale)
p_true = np.array([1.2, 0.6])
b2 = 2.2                                                            # km of range bias from the user's clock
rho2 = np.linalg.norm(sat2 - p_true, axis=1) + b2
z = np.array([0.0, 0.0, 0.0])
it2 = [{"x": z[0], "y": z[1], "b": z[2]}]
for _ in range(10):
    d = np.linalg.norm(sat2 - z[:2], axis=1)
    J2 = np.hstack([-(sat2 - z[:2]) / d[:, None], np.ones((3, 1))])
    z = z + np.linalg.solve(J2, rho2 - (d + z[2]))
    it2.append({"x": float(z[0]), "y": float(z[1]), "b": float(z[2])})
    if np.linalg.norm(it2[-1]["x"] - it2[-2]["x"]) < 1e-9: break
assert abs(z[0] - p_true[0]) < 1e-6 and abs(z[2] - b2) < 1e-6
data2d = {"sats": sat2.tolist(), "truth": p_true.tolist(), "bias": b2, "rho": rho2.tolist(), "iters": it2}

# ── on-screen / narration strings ──────────────────────────────────────────
WORDS = {7: "seven", 38: "thirty-eight", 46: "forty-six", 67: "sixty-seven"}
out["overhead_ms_words"] = {67: "sixty-seven"}.get(round(out["overhead_ms"]), str(round(out["overhead_ms"])))
out["sr_words"] = {7: "seven"}[round(-sr)]
out["gr_words"] = {46: "forty-six"}[round(gr)]
out["net_words"] = "thirty-eight and a half" if 38.3 <= net <= 38.8 else None
out["km_words"] = "eleven and a half" if 11.3 <= out["net_km_day"] <= 11.7 else None
out["iters_words"] = {4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight"}[n_it]
assert out["net_words"] and out["km_words"]

for k_, v_ in list(out.items()):
    if isinstance(v_, float):
        out[k_] = float(f"{v_:.10g}")
(HERE / "numbers.json").write_text(json.dumps(out, indent=1))
(HERE / "gps_data.json").write_text(json.dumps({
    "orbit": {"a_m": A, "v_ms": V, "period_s": T_ORB, "inc_deg": 55.0, "R_mean": R_MEAN},
    "sats31": [[math.degrees(r), math.degrees(u)] for (r, u) in sats31],
    "fix": {"lat": LAT, "lon": LON, "t0": T0, "used": use, "iters": iters, "rho_m": rho.tolist(),
            "sat_ecef": S.tolist(), "rx_ecef": rx_true.tolist(), "b_true_s": B_TRUE},
    "demo2d": data2d,
}, indent=1))
print(json.dumps(out, indent=1))
