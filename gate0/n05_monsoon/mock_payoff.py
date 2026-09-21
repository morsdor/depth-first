"""Gate 0 payoff-frame mock for N5 (monsoon). A sketch, not a render.

THE TEST THIS FRAME HAS TO PASS, which v1 failed: the picture must be EVIDENCE for the
sentence, not decoration beside it. So it shows the one thing the thesis claims -- the
same rain belt in two places, six months apart -- and nothing else. If the monsoon really
were a land-sea breeze, this picture would look different: the belt would appear over
India in July and simply not exist in January. It does exist. It is just somewhere else.

Coastlines are real (Natural Earth 110m, public domain). The ITCZ latitudes are
hand-approximated from the standard climatology and are replaced by computed positions
from GODL-licensed rainfall data at build time.
"""

import json
import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
GEOJSON = os.path.join(HERE, "ne_110m_land.geojson")
NE_URL = ("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
          "master/geojson/ne_110m_land.geojson")

W, H = 1920, 1080
# Southern limit is deliberately generous: extra ocean below pushes the January
# belt up into clear frame, away from the copy scrim. v2 buried it.
LON0, LON1 = 10.0, 165.0
LAT0, LAT1 = -48.0, 40.0

GROUND = (9, 11, 15)
SEA = (14, 18, 26)
LAND = (52, 57, 66)
LAND_EDGE = (78, 84, 94)
JULY = (74, 178, 235)
# Same hue as July, dimmer -- it has to read as THE SAME BELT, somewhere else.
JAN = (62, 124, 166)
TEXT = (240, 236, 228)
AMBER = (232, 170, 66)
MUTED = (146, 152, 162)


def fetch_land():
    if not os.path.exists(GEOJSON):
        print("fetching Natural Earth 110m land (public domain)...")
        req = urllib.request.Request(NE_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            open(GEOJSON, "wb").write(r.read())
    return json.load(open(GEOJSON))


def project(lon, lat):
    x = (lon - LON0) / (LON1 - LON0) * W
    y = (1.0 - (lat - LAT0) / (LAT1 - LAT0)) * H
    return x, y


def lerp_lat(lon, table):
    """Piecewise-linear ITCZ latitude for a given longitude."""
    pts = sorted(table)
    if lon <= pts[0][0]:
        return pts[0][1]
    if lon >= pts[-1][0]:
        return pts[-1][1]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x0 <= lon <= x1:
            t = (lon - x0) / (x1 - x0)
            return y0 + t * (y1 - y0)
    return pts[-1][1]


# Standard climatology. July peaks over the monsoon trough; January sits in the
# southern hemisphere. The swing is widest over India -- that IS the video.
JULY_TABLE = [(10, 12), (30, 14), (50, 17), (70, 23), (80, 25.5), (90, 24),
              (105, 21), (120, 17), (155, 14)]
JAN_TABLE = [(10, -12), (30, -15), (50, -8), (70, -6), (85, -6), (100, -10),
             (120, -14), (155, -13)]


def font(size, bold=False):
    for p in ("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
              else "/System/Library/Fonts/Supplemental/Arial.ttf",
              "/System/Library/Fonts/Helvetica.ttc"):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_band(layer, table, colour, half_width_deg, core_alpha):
    """A soft latitude band: wide dim halo, bright core."""
    d = ImageDraw.Draw(layer, "RGBA")
    steps = 12
    for i in range(steps, 0, -1):
        frac = i / steps
        alpha = int(core_alpha * (1.0 - frac) ** 1.7) + 4
        pts = []
        for lon in range(int(LON0), int(LON1) + 1, 2):
            lat = lerp_lat(lon, table)
            pts.append(project(lon, lat))
        width = max(2, int(half_width_deg * frac * 2 * H / (LAT1 - LAT0)))
        d.line(pts, fill=colour + (alpha,), width=width, joint="curve")


img = Image.new("RGB", (W, H), SEA)
d = ImageDraw.Draw(img)

# --- land ---------------------------------------------------------------
for feat in fetch_land()["features"]:
    geom = feat["geometry"]
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    for poly in polys:
        ring = [project(lon, lat) for lon, lat in poly[0]]
        if len(ring) > 2:
            d.polygon(ring, fill=LAND, outline=LAND_EDGE)

# --- the two rain belts -------------------------------------------------
jan_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw_band(jan_layer, JAN_TABLE, JAN, 5.5, 205)
img.paste(Image.alpha_composite(img.convert("RGBA"), jan_layer).convert("RGB"), (0, 0))

jul_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw_band(jul_layer, JULY_TABLE, JULY, 6.0, 235)
jul_layer = jul_layer.filter(ImageFilter.GaussianBlur(1.6))
img = Image.alpha_composite(img.convert("RGBA"), jul_layer).convert("RGB")
d = ImageDraw.Draw(img)

# --- the swing over India, which is the widest on Earth -----------------
LON_INDIA = 80.0
xj, yj = project(LON_INDIA, lerp_lat(LON_INDIA, JULY_TABLE))
xa, ya = project(LON_INDIA, lerp_lat(LON_INDIA, JAN_TABLE))
for off in (-1, 0, 1):
    d.line([(xj + off, yj), (xa + off, ya)], fill=AMBER, width=2)
for (px, py), up in (((xj, yj), True), ((xa, ya), False)):
    tip = py - 13 if up else py + 13
    d.polygon([(px - 10, py), (px + 10, py), (px, tip)], fill=AMBER)
d.text((xj + 26, (yj + ya) / 2 - 30), "31° OF", font=font(34, True), fill=AMBER)
d.text((xj + 26, (yj + ya) / 2 + 6), "LATITUDE", font=font(34, True), fill=AMBER)

# --- band labels --------------------------------------------------------
lx, ly = project(30.0, lerp_lat(30.0, JULY_TABLE))
d.text((lx - 6, ly - 58), "JULY", font=font(40, True), fill=JULY)
lx, ly = project(26.0, lerp_lat(26.0, JAN_TABLE))
d.text((lx - 6, ly - 60), "JANUARY", font=font(40, True), fill=(118, 172, 208))

# --- copy. Read this column alone: it must be a complete thought. -------
scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(scrim).rectangle([0, H - 300, W, H], fill=(6, 8, 12, 232))
img = Image.alpha_composite(img.convert("RGBA"), scrim).convert("RGB")
d = ImageDraw.Draw(img)

d.text((84, H - 254), "IN JANUARY, THE RAIN IS DOWN THERE.", font=font(54, True), fill=MUTED)
d.text((84, H - 186), "IN JULY, IT'S OVER INDIA.", font=font(54, True), fill=TEXT)
d.text((84, H - 106), "THAT MOVE IS THE MONSOON.", font=font(66, True), fill=AMBER)

d.text((84, 40), "SKETCH — coastlines real (Natural Earth, public domain).",
       font=font(22), fill=(104, 110, 120))
d.text((84, 72), "Rain-belt latitudes approximated; computed from rainfall data at build.",
       font=font(22), fill=(104, 110, 120))

out = os.path.join(HERE, "payoff_frame.png")
img.save(out)
print(f"wrote {out}")
print(f"July ITCZ over India (80E): {lerp_lat(80.0, JULY_TABLE):+.1f}°")
print(f"Jan  ITCZ over India (80E): {lerp_lat(80.0, JAN_TABLE):+.1f}°")
print(f"swing over India          : {lerp_lat(80.0, JULY_TABLE) - lerp_lat(80.0, JAN_TABLE):.1f}°")
print(f"swing over Africa   (30E) : {lerp_lat(30.0, JULY_TABLE) - lerp_lat(30.0, JAN_TABLE):.1f}°")
print(f"swing over W Pacific(150E): {lerp_lat(150.0, JULY_TABLE) - lerp_lat(150.0, JAN_TABLE):.1f}°")
