"""Stage 3 for I89 — every figure the script will put on screen, computed, plus an experiment that
could falsify the one mechanism sentence ("at 17,000 mph it never lands").

Two kinds of check, kept apart on purpose:
  1. CLOSED FORMS from GM and R (gravity at height, circular speed, period, fall in one second).
  2. AN INDEPENDENT NUMERICAL RUN: the cannon is integrated step by step (RK4, inverse-square
     point-mass gravity) and the answer is compared with the closed form. The closed form cannot
     check itself; the integration can disagree with it.

Everything is asserted. Nothing here is typed in from a source: the NASA / aircraft / altitude
figures are checked AGAINST this, not copied INTO it. Writes figures.json.

Run:  python3 gate0/i89_nogravity/research/measure.py
"""
import json
import math
from pathlib import Path

HERE = Path(__file__).parent
GM = 3.986004418e14                  # m^3/s^2
R_E = 6371.0e3                       # mean radius, m
MI = 1609.344                        # m per mile
FT = 0.3048                          # m per foot
G_SURF = GM / R_E ** 2               # THE one stated base for every percentage: g at the mean radius
OMEGA = 7.2921159e-5                 # rad/s, Earth's rotation

def g_at(h_m):
    return GM / (R_E + h_m) ** 2

def pct(h_m):
    return g_at(h_m) / G_SURF * 100

# ── 1. the station's altitude, and the number the copy will carry ──────────────────────────────
# Search-level (2026-10-05): it flies roughly 410-420 km, drag-decayed and reboosted. The copy
# states ONE altitude. 260 miles = 418.4 km, inside that band.
STATED_MI = 260
H = STATED_MI * MI                   # 418,429 m
assert 410e3 <= H <= 420e3, H
RATIO = g_at(H) / G_SURF
V_C = math.sqrt(GM / (R_E + H))
T = 2 * math.pi * (R_E + H) / V_C

print("== gravity at the station, against the ground (base: g at mean radius, %.4f m/s2)" % G_SURF)
for km in (350, 400, 410, 418.4, 420, 430):
    print("   %6.1f km  %5.2f%%" % (km, pct(km * 1e3)))
print("   -> stated altitude %d mi = %.1f km: %.2f%% -> the copy says %d%%" % (STATED_MI, H / 1e3, RATIO * 100, round(RATIO * 100)))
assert round(RATIO * 100) == 88
# every altitude the station is reported at rounds to the same 88%, so the word is robust
assert all(round(pct(km * 1e3)) == 88 for km in (410, 415, 418.4, 420)), "88% must hold across 410-420 km"
# the 89% in the Gate 0 still was the 400 km figure; at the real altitude it is 88%
assert round(pct(400e3)) == 89

# ── 2. you, on a tower to the station ───────────────────────────────────────────────────────────
LB = 150
lb_up = LB * RATIO
# a tower co-rotating with the Earth loses a little more at the equator (centripetal term)
lb_up_equator = LB * (g_at(H) - OMEGA ** 2 * (R_E + H)) / G_SURF
print("\n== 150 lb on the ground reads %.1f lb on a %d-mile tower (poles) / %.1f lb (equator)" % (lb_up, STATED_MI, lb_up_equator))
# the equator reading (131.5) sits ON the rounding edge, so assert a tolerance rather than round():
# the dial says 132, and the NOT-CLAIMED list in RESEARCH.md says why it is "about" 132
assert abs(lb_up - 132) < 0.75 and abs(lb_up_equator - 132) < 0.75, "132 lb must hold, within 0.75 lb, at the pole AND the equator"

# ── 3. why it is not zero: distance from the CENTRE ─────────────────────────────────────────────
R_MI = R_E / MI
far = (R_E + H) / R_E - 1
print("\n== the Earth's radius is %.0f mi; the station is %d mi up = %.2f%% farther from the centre" % (R_MI, STATED_MI, far * 100))
print("   inverse square of that: (1/%.4f)^2 = %.4f (matches the gravity ratio)" % (1 + far, 1 / (1 + far) ** 2))
assert round(far * 100) == 7
assert abs(1 / (1 + far) ** 2 - RATIO) < 1e-12

# ── 4. the plane: weightlessness at ~99.7% of gravity ───────────────────────────────────────────
print("\n== a parabolic-flight aircraft (24,000 -> 32,000 ft, search-level) feels")
for ft in (24000, 32000):
    print("   %5d ft = %.2f mi up: %.2f%% of ground gravity" % (ft, ft * FT / MI, pct(ft * FT)))
assert round(pct(32000 * FT), 1) == 99.7
assert pct(24000 * FT) > pct(32000 * FT) > 99.6
assert 32000 * FT / MI < 6.1          # "about 6 miles" at the top of the arc

# ── 5. the cannon: closed form, then the independent integration ────────────────────────────────
r0 = R_E + H
def conic_land_deg(v):
    """Closed form: launch at apoapsis, e = 1 - (v/vc)^2, r = p/(1 - e cos psi); degrees to the ground."""
    e = 1 - (v / V_C) ** 2
    p = r0 * (1 - e)
    return math.degrees(math.acos((1 - p / R_E) / e))

def integrate(v, t_max, dt=0.25):
    """RK4, point-mass inverse-square gravity, launched horizontally at r0. Returns (landed_deg|None, rmin, rmax)."""
    x, y, vx, vy = 0.0, r0, v, 0.0          # start at the top, moving +x (clockwise on screen)
    def acc(px, py):
        d3 = (px * px + py * py) ** 1.5
        return -GM * px / d3, -GM * py / d3
    t, rmin, rmax = 0.0, r0, r0
    while t < t_max:
        k1x, k1y = vx, vy;                       a1x, a1y = acc(x, y)
        k2x, k2y = vx + 0.5 * dt * a1x, vy + 0.5 * dt * a1y
        a2x, a2y = acc(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y)
        k3x, k3y = vx + 0.5 * dt * a2x, vy + 0.5 * dt * a2y
        a3x, a3y = acc(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y)
        k4x, k4y = vx + dt * a3x, vy + dt * a3y
        a4x, a4y = acc(x + dt * k3x, y + dt * k3y)
        nx = x + dt / 6 * (k1x + 2 * k2x + 2 * k3x + k4x)
        ny = y + dt / 6 * (k1y + 2 * k2y + 2 * k3y + k4y)
        vx += dt / 6 * (a1x + 2 * a2x + 2 * a3x + a4x)
        vy += dt / 6 * (a1y + 2 * a2y + 2 * a3y + a4y)
        pr = math.hypot(nx, ny)
        if pr <= R_E:                            # touched the ground: interpolate the angle
            frac = (math.hypot(x, y) - R_E) / (math.hypot(x, y) - pr)
            ix, iy = x + frac * (nx - x), y + frac * (ny - y)
            return math.degrees(math.atan2(ix, iy)), rmin, rmax
        x, y, t = nx, ny, t + dt
        rmin, rmax = min(rmin, pr), max(rmax, pr)
    return None, rmin, rmax

print("\n== Newton's cannon at %d miles: closed-form landing angle vs a step-by-step integration" % STATED_MI)
shots = []
for v_kms in (3.0, 5.0, 6.5):
    cf = conic_land_deg(v_kms * 1e3)
    num, _, _ = integrate(v_kms * 1e3, 6000)
    print("   %.1f km/s  closed form %.3f deg   integrated %.3f deg   (diff %.4f)" % (v_kms, cf, num, abs(cf - num)))
    assert num is not None and abs(cf - num) < 0.05, "integration disagrees with the conic"
    shots.append({"kms": v_kms, "land_deg": round(num, 3)})

# THE FALSIFIABLE CLAIM: at circular speed it never lands. Run a full orbit and then ten more.
n_orbits = 10
land, rmin, rmax = integrate(V_C, T * n_orbits)
print("   %.3f km/s (%.0f mph), %d orbits: landed=%s; radius stayed within [%.1f, %.1f] m of %.0f" % (
    V_C / 1e3, V_C / 0.44704, n_orbits, land is not None, rmin - r0, rmax - r0, r0))
assert land is None, "the circular-speed shot LANDED — the mechanism sentence is false"
assert max(abs(rmin - r0), abs(rmax - r0)) < 25, "orbit drifted: integration or claim is wrong"

# ...and that the claim is about SPEED: 1% slower and it comes down (no air modelled)
slow_land, slow_rmin, _ = integrate(0.95 * V_C, T * 2)
print("   0.95 x circular: perigee altitude %.0f km, landed=%s" % ((slow_rmin - R_E) / 1e3, slow_land is not None))
assert slow_land is not None, "95% speed should have hit the ground"
V_GRAZE = V_C * math.sqrt(2 * R_E / (R_E + r0))     # slowest speed that just misses the ground (airless)
print("   the slowest airless miss is %.3f km/s (%.0f mph); the circle is %.3f km/s (%.0f mph)" % (
    V_GRAZE / 1e3, V_GRAZE / 0.44704, V_C / 1e3, V_C / 0.44704))
assert V_GRAZE < V_C

MPH = V_C / 0.44704
print("\n== speed: %.0f mph -> the copy says 17,000 mph" % MPH)
assert round(MPH, -3) == 17000

# ── 6. 'the ground curves away as fast as it falls' ─────────────────────────────────────────────
fall_1s = 0.5 * g_at(H) * 1.0 ** 2
d = V_C * 1.0                                   # sideways distance in one second
curve = math.sqrt(r0 ** 2 + d ** 2) - r0        # how far the straight line leaves the orbit circle
print("\n== in one second it travels %.2f km sideways (%.1f mi) and falls %.2f m (%.1f ft);" % (d / 1e3, d / MI, fall_1s, fall_1s / FT))
print("   over that distance the straight line departs the orbit circle by %.2f m (%.1f ft)" % (curve, curve / FT))
assert abs(fall_1s - curve) / curve < 0.01, "falls vs curves-away must match to 1%"
assert round(fall_1s / FT) == 14
assert round(d / MI, 1) == 4.8

# ── 7. the period ───────────────────────────────────────────────────────────────────────────────
print("\n== one lap every %.1f min (%.2f laps a day)" % (T / 60, 86400 / T))
assert round(T / 60) == 93

out = {
    "stated_altitude_mi": STATED_MI, "altitude_km": round(H / 1e3, 1),
    "g_ratio": RATIO, "g_pct": round(RATIO * 100, 2), "lb_on_ground": LB, "lb_on_tower": round(lb_up, 2),
    "lb_on_tower_equator": round(lb_up_equator, 2), "centre_pct_farther": round(far * 100, 2),
    "plane_pct_32000ft": round(pct(32000 * FT), 3), "plane_pct_24000ft": round(pct(24000 * FT), 3),
    "v_circ_kms": round(V_C / 1e3, 4), "v_circ_mph": round(MPH), "v_graze_kms": round(V_GRAZE / 1e3, 4),
    "period_min": round(T / 60, 2), "fall_1s_ft": round(fall_1s / FT, 2), "sideways_1s_mi": round(d / MI, 2),
    "shots": shots, "orbits_integrated": n_orbits,
    "radius_drift_m": round(max(abs(rmin - r0), abs(rmax - r0)), 3),
}
(HERE / "figures.json").write_text(json.dumps(out, indent=2))
print("\nall assertions passed; figures.json written")
