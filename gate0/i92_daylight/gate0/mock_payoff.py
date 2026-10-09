"""Gate 0 artefact for I92 — the payoff frame, drawn once, before any build.

NOT the reel and NOT a Remotion render: the five-minute still Gate 0 demands, so the concept can
be killed for a rupee instead of a day.

What is drawn is the SENTENCE ("America tried keeping the clocks forward all year, in 1974 —
children were walking to school in the dark, and Congress cancelled it after ten months"). The
frame shows the one thing the sentence turns on: THE SAME BUS STOP AT THE SAME CLOCK TIME, with
the sky coloured from the sun's COMPUTED elevation at that moment — once on today's clocks, once
on clocks kept forward all year.

Everything numeric is computed below from the NOAA solar equations (Meeus-based, good to about a
minute or two) and asserted, not typed:
  * the date is the LATEST sunrise of the year at the chosen place, which is in early January, not
    the solstice — the equation of time pushes it past 21 December;
  * the sky colour is a function of solar elevation (civil twilight -6, nautical -12,
    astronomical -18 degrees) — so "dark" on the frame is a measured elevation, not a mood.

SKETCH, not the build: the place is Indianapolis only because it has the widest margin past nine
o'clock of the large cities in the table (the sentence must not rest on a one-minute margin — see
GATE0.md section 5). The silhouettes are polygons. Stage 3 replaces the single city with a
population-weighted map from Census centroids and cross-checks every sunrise against the US Naval
Observatory's own table.

Needs only numpy + Pillow (matplotlib is not installed in the cloud container).
"""
import math
import datetime as dt
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

HERE = Path(__file__).parent
FONTS = HERE.parents[2] / "assets" / "fonts"
W, H = 1080, 1920
SAFE = (60, 270, 870, 1540)                 # x0, y0, x1, y1 — CLAUDE.md non-negotiable 1
GROUND = np.array([4, 14, 31])
INK = (232, 230, 225)
DIM = (129, 162, 196)
ACCENT = (0, 214, 247)                      # DOMAIN_ACCENT.infrastructure — §2
AMBER = (255, 176, 32)                      # the ONE amber element: the bus
S = 2

# ── the astronomy, computed not typed ──────────────────────────────────────
PLACE = ("Indianapolis", 39.77, -86.16, -5)     # name, lat, lon (east +), standard-time UTC offset
YEAR = 2026


def solar(lat, lon, date, clock_min, tz):
    """Solar elevation (deg) at a local clock time, and sunrise (local clock minutes), same tz."""
    n = date.timetuple().tm_yday
    g = 2 * math.pi / 365 * (n - 1)
    eqt = 229.18 * (0.000075 + 0.001868 * math.cos(g) - 0.032077 * math.sin(g)
                    - 0.014615 * math.cos(2 * g) - 0.040849 * math.sin(2 * g))
    dec = (0.006918 - 0.399912 * math.cos(g) + 0.070257 * math.sin(g) - 0.006758 * math.cos(2 * g)
           + 0.000907 * math.sin(2 * g) - 0.002697 * math.cos(3 * g) + 0.00148 * math.sin(3 * g))
    la = math.radians(lat)
    tst = clock_min - 60 * tz + 4 * lon + eqt          # true solar time, minutes
    ha = math.radians(tst / 4 - 180)
    elev = math.degrees(math.asin(math.sin(la) * math.sin(dec) + math.cos(la) * math.cos(dec) * math.cos(ha)))
    cosha = math.cos(math.radians(90.833)) / (math.cos(la) * math.cos(dec)) - math.tan(la) * math.tan(dec)
    h0 = math.degrees(math.acos(max(-1, min(1, cosha))))
    sunrise = 720 - 4 * (lon + h0) - eqt + 60 * tz
    return elev, sunrise


name, LAT, LON, TZ = PLACE
latest = max((solar(LAT, LON, dt.date(YEAR, 1, 1) + dt.timedelta(days=d), 0, TZ)[1], dt.date(YEAR, 1, 1) + dt.timedelta(days=d))
             for d in range(365))
SUNRISE_STD, DATE = latest
assert DATE.month == 1 and DATE.day <= 8, DATE          # the latest sunrise is in early January
SUNRISE_DST = SUNRISE_STD + 60
CLOCK = 7 * 60 + 30                                     # 7:30 a.m. — a school bus
E_NOW, _ = solar(LAT, LON, DATE, CLOCK, TZ)             # today's clocks
E_DST, _ = solar(LAT, LON, DATE, CLOCK - 60, TZ)        # same clock reading, summer time all year = 6:30 solar-standard
assert abs(E_DST - solar(LAT, LON, DATE, CLOCK, TZ + 1)[0]) < 1e-9   # "clock 7:30 on UTC-4" == "6:30 on UTC-5": the two ways of saying it agree
assert -9 < E_NOW < -4, E_NOW                           # first light: civil twilight
assert E_DST < -14, E_DST                               # properly dark: past nautical twilight
assert 8 * 60 < SUNRISE_STD < 8 * 60 + 15, SUNRISE_STD
assert 9 * 60 + 2 < SUNRISE_DST < 9 * 60 + 15, SUNRISE_DST     # margin past nine o'clock, not a knife edge


def hhmm(m):
    m = round(m)                              # round, not truncate: matches research/sunrise_check.py
    return f"{m // 60}:{m % 60:02d}"


# ── sky colour as a function of the sun's elevation ────────────────────────
HORIZON = [(-18, (6, 12, 30)), (-12, (18, 38, 82)), (-8, (62, 72, 122)), (-5, (150, 100, 112)),
           (-2, (228, 140, 84)), (0, (255, 176, 90))]
ZENITH = [(-18, (3, 8, 22)), (-12, (8, 18, 44)), (-6, (22, 44, 96)), (0, (60, 110, 190))]


def ramp(table, e):
    e = max(table[0][0], min(table[-1][0], e))
    for (e0, c0), (e1, c1) in zip(table, table[1:]):
        if e0 <= e <= e1:
            t = (e - e0) / (e1 - e0)
            return np.array([c0[i] + t * (c1[i] - c0[i]) for i in range(3)], float)
    return np.array(table[-1][1], float)


def sky(w, h, e):
    hz, zn = ramp(HORIZON, e), ramp(ZENITH, e)
    t = np.linspace(0, 1, h)[:, None] ** 0.55            # 0 at the horizon, 1 at the zenith
    col = hz[None, :] * (1 - t) + zn[None, :] * t
    img = np.repeat(col[:, None, :], w, axis=1)
    if e < -12:                                           # stars come out once it is properly dark
        rng = np.random.default_rng(92)
        for _ in range(int(40 * min(1, (-12 - e) / 6))):
            x, y = rng.integers(0, w), int(rng.random() ** 1.7 * h * 0.7)
            img[y:y + 2, x:x + 2] = 200
    return img


def panel(e, label, sunrise_txt):
    """One bus stop at the sky of elevation e. Returns an RGB PIL image 810 x 470."""
    pw, ph = SAFE[2] - SAFE[0], 470
    horizon_y = int(ph * 0.70)
    base = np.zeros((ph, pw, 3), float)
    base[:horizon_y] = sky(pw, horizon_y, e)
    base[horizon_y:] = np.array([10, 16, 28]) * (0.5 + 0.5 * max(0, (e + 18) / 18))
    # visibility of dark objects against the sky: lighter silhouettes when more light
    vis = float(np.clip((e + 18) / 14, 0.15, 1.0))
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
    lay = Image.new("RGBA", (pw * S, ph * S), (0, 0, 0, 0))
    g = ImageDraw.Draw(lay)

    def P(x, y):
        return (x * S, y * S)

    # tree line
    pts = [(0, horizon_y)]
    for x in range(0, pw + 10, 10):
        pts.append((x, horizon_y - 22 - 16 * (math.sin(x / 41.0) + 0.6 * math.sin(x / 17.0 + 1.0))))
    pts.append((pw, horizon_y))
    g.polygon([P(*p) for p in pts], fill=(int(8 + 14 * vis), int(12 + 18 * vis), int(20 + 26 * vis), 255))
    # road
    g.rectangle([P(0, horizon_y), P(pw, ph)], fill=(int(12 + 16 * vis), int(18 + 20 * vis), int(30 + 26 * vis), 255))
    g.rectangle([P(0, horizon_y + 70), P(pw, horizon_y + 76)], fill=(int(40 + 70 * vis),) * 2 + (int(48 + 60 * vis), 255))
    # street lamp with a glow — lit in both, because it is dark in both
    lx = 120
    g.line([P(lx, horizon_y + 40), P(lx, horizon_y - 150)], fill=(24, 30, 44, 255), width=7 * S)
    g.line([P(lx, horizon_y - 150), P(lx + 38, horizon_y - 158)], fill=(24, 30, 44, 255), width=6 * S)
    for r, a in ((60, 26), (36, 50), (18, 110)):
        g.ellipse([P(lx + 38 - r, horizon_y - 158 - r), P(lx + 38 + r, horizon_y - 158 + r)], fill=AMBER + (a,))
    # children at the stop — three small silhouettes with backpacks
    body = (int(10 + 26 * vis), int(14 + 30 * vis), int(24 + 40 * vis), 255)
    for i, (cx, hgt) in enumerate(((250, 62), (286, 70), (324, 56))):
        base_y = horizon_y + 44
        g.rounded_rectangle([P(cx - 12, base_y - hgt), P(cx + 12, base_y)], radius=7 * S, fill=body)
        g.ellipse([P(cx - 10, base_y - hgt - 22), P(cx + 10, base_y - hgt - 2)], fill=body)
        g.rounded_rectangle([P(cx + 5, base_y - hgt + 6), P(cx + 22, base_y - hgt + 34)], radius=4 * S, fill=body)
    # the bus — the one amber element; in the dark only its lights and stripe survive
    bx, by, bw, bh = 450, horizon_y - 82, 330, 128
    bus_a = int(70 + 185 * vis)
    g.rounded_rectangle([P(bx, by), P(bx + bw, by + bh)], radius=16 * S,
                        fill=(AMBER[0], int(AMBER[1] * (0.35 + 0.65 * vis)), int(AMBER[2] * (0.35 + 0.65 * vis)), bus_a))
    for k in range(6):
        wx = bx + 22 + k * 46
        g.rounded_rectangle([P(wx, by + 18), P(wx + 34, by + 56)], radius=5 * S, fill=(14, 20, 34, 255))
    g.rectangle([P(bx, by + 78), P(bx + bw, by + 84)], fill=(14, 20, 34, 255))
    for wx in (bx + 62, bx + bw - 76):
        g.ellipse([P(wx, by + bh - 24), P(wx + 48, by + bh + 24)], fill=(10, 14, 24, 255))
    for yoff, col in ((26, (255, 70, 60)), (40, AMBER)):                      # warning lights, always lit
        g.ellipse([P(bx + bw - 14, by + yoff - 5), P(bx + bw - 4, by + yoff + 5)], fill=col + (255,))
    g.ellipse([P(bx + 6, by + 92), P(bx + 22, by + 108)], fill=(255, 238, 190, 255))   # headlight
    lay = lay.resize((pw, ph), Image.LANCZOS)
    img = Image.alpha_composite(img, lay).convert("RGB")
    d = ImageDraw.Draw(img)
    f_lab = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 25)
    f_sun = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 23)
    d.text((24, 22), label, font=f_lab, fill=INK)
    d.text((pw - 24, ph - 22), sunrise_txt, font=f_sun, fill=INK, anchor="rd")
    return img


# ── page ground: never a flat fill (non-negotiable 2) ──────────────────────
yy, xx = np.mgrid[0:H, 0:W]
glow = np.exp(-(((xx - 540) / 620.0) ** 2 + ((yy - 900) / 900.0) ** 2))
ground = GROUND[None, None, :] + glow[..., None] * (np.array(ACCENT) * 0.07)[None, None, :]
img = Image.fromarray(np.clip(ground, 0, 255).astype(np.uint8), "RGB")

PA_Y, PB_Y = 470, 1000
img.paste(panel(E_NOW, "TODAY'S CLOCKS", f"SUNRISE {hhmm(SUNRISE_STD)}"), (SAFE[0], PA_Y))
img.paste(panel(E_DST, "CLOCKS KEPT FORWARD ALL YEAR", f"SUNRISE {hhmm(SUNRISE_DST)}"), (SAFE[0], PB_Y))
d = ImageDraw.Draw(img)
f_head = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 54)
f_mid = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 28)
f_small = ImageFont.truetype(str(FONTS / "IBMPlexSans-Bold.ttf"), 27)

boxes = []
def text(xy, s, font, fill, anchor="la"):
    d.text(xy, s, font=font, fill=fill, anchor=anchor)
    boxes.append(d.textbbox(xy, s, font=font, anchor=anchor))

CX = (SAFE[0] + SAFE[2]) // 2
text((CX, 285), "SAME BUS STOP.", f_head, INK, "ma")
text((CX, 350), "SAME 7:30 A.M.", f_head, INK, "ma")
text((CX, 428), f"{name.upper()} · DARKEST MORNING OF THE YEAR", f_mid, DIM, "ma")   # a date here would be false precision: the curve is flat in early January
text((CX, 1480), "AMERICA TRIED IT IN 1974.", f_small, INK, "ma")
text((CX, 1508), "CONGRESS CANCELLED IT IN TEN MONTHS.", f_small, INK, "ma")

for b in boxes:
    assert b[0] >= SAFE[0] - 1 and b[2] <= SAFE[2] + 1, f"x outside safe area: {b}"
    assert b[1] >= SAFE[1] and b[3] <= SAFE[3], f"y outside safe area: {b}"

out = HERE / "payoff_frame.png"
img.save(out)
print(f"{name} {DATE}: sunrise today's clocks {hhmm(SUNRISE_STD)}, kept forward {hhmm(SUNRISE_DST)}")
print(f"7:30 a.m. sun elevation: today's clocks {E_NOW:.1f} deg, kept forward {E_DST:.1f} deg")
print("wrote", out)
