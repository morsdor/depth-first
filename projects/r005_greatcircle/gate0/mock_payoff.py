"""Gate 0 artefact for I17 — the payoff frame, drawn once, before any build.

This is NOT the reel and NOT a Remotion render. It is the five-minute still the
comprehension gate in CLAUDE.md demands: the frame the whole reel exists to
reach, put in front of a human so the concept can be killed for a rupee instead
of for a day.

Coastlines come from GSHHG, bundled offline in `basemap-data` — no network, no
OpenStreetMap, so nothing here is blocked by the container's egress proxy.
"""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
GROUND = (4, 14, 31)
ACCENT = "#00D6F7"          # DOMAIN_ACCENT.infrastructure — §2 Maps and geography
LAND = "#0D1F3C"
COAST = "#274064"
INK = (232, 230, 225)
DIM = (129, 162, 196)

DEL = (28.61, 77.21)        # Indira Gandhi Intl
SFO = (37.62, -122.38)      # San Francisco Intl


def great_circle(a, b, n=400):
    """Exact great-circle points via slerp on the unit sphere."""
    to_xyz = lambda p: np.array([
        np.cos(np.radians(p[0])) * np.cos(np.radians(p[1])),
        np.cos(np.radians(p[0])) * np.sin(np.radians(p[1])),
        np.sin(np.radians(p[0])),
    ])
    u, v = to_xyz(a), to_xyz(b)
    om = float(np.arccos(np.clip(u @ v, -1, 1)))
    t = np.linspace(0, 1, n)[:, None]
    pts = (np.sin((1 - t) * om) * u + np.sin(t * om) * v) / np.sin(om)
    lat = np.degrees(np.arcsin(pts[:, 2]))
    lon = np.degrees(np.arctan2(pts[:, 1], pts[:, 0]))
    # R = 6371.0088 km, the IUGG mean radius. WGS84 geodesic for the same
    # pair is 12,395 km (pyproj Geod); the 22 km gap is the sphere assumption
    # the reel is actually about, so the spherical figure is the honest one.
    return lat, lon, om * 6371.0088  # km


LAT, LON, KM = great_circle(DEL, SFO)
MID = (LAT[len(LAT) // 2], LON[len(LON) // 2])


def panel(kind, px, py):
    fig = plt.figure(figsize=(px / 100, py / 100), dpi=100)
    fig.patch.set_alpha(0)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.patch.set_alpha(0)
    if kind == "globe":
        m = Basemap(projection="ortho", lat_0=MID[0], lon_0=MID[1],
                    resolution="c", ax=ax)
        m.drawmapboundary(fill_color="#071427", linewidth=2.5, color=COAST)
    else:
        # Pacific-centred, northern hemisphere only. This is the seatback map:
        # centring on the dateline is what keeps DEL-SFO one unbroken arc instead
        # of two half-arcs sliced at the edge of an Atlantic-centred world map.
        m = Basemap(projection="merc", llcrnrlat=2, urcrnrlat=82,
                    llcrnrlon=0, urcrnrlon=360, resolution="c", ax=ax)
        m.drawmapboundary(fill_color="#071427", linewidth=0)
    m.fillcontinents(color=LAND, lake_color="#071427")
    m.drawcoastlines(linewidth=0.6, color=COAST)
    m.drawparallels(np.arange(-60, 90, 30), color="#16304f", linewidth=0.6)
    m.drawmeridians(np.arange(-180, 181, 30), color="#16304f", linewidth=0.6)

    # The route. On the globe it is straight; on Mercator the SAME points bow.
    x, y = m(LON % 360 if kind != "globe" else LON, LAT)
    if kind == "globe":                      # drop the hemisphere facing away
        ok = (np.array(x) < 1e29) & (np.array(y) < 1e29)
        x, y = np.array(x)[ok], np.array(y)[ok]
    else:                                    # cut the dateline wrap
        x, y = np.array(x), np.array(y)
        brk = np.where(np.abs(np.diff(x)) > m.xmax * 0.5)[0]
        if len(brk):
            x = np.insert(x.astype(float), brk + 1, np.nan)
            y = np.insert(y.astype(float), brk + 1, np.nan)
    ax.plot(x, y, color=ACCENT, lw=5, solid_capstyle="round", zorder=9)
    ax.plot(x, y, color=ACCENT, lw=14, alpha=0.18, zorder=8)
    for p in (DEL, SFO):
        ex, ey = m(p[1] % 360 if kind != "globe" else p[1], p[0])
        if ex < 1e29:
            ax.plot([ex], [ey], "o", ms=13, color=ACCENT, zorder=10)
    ax.set_axis_off()
    fig.canvas.draw()
    img = Image.frombuffer("RGBA", fig.canvas.get_width_height(),
                           fig.canvas.buffer_rgba(), "raw", "RGBA", 0, 1).copy()
    plt.close(fig)
    return img


def font(sz, bold=True):
    p = ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
         else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    try:
        return ImageFont.truetype(p, sz)
    except OSError:
        return ImageFont.load_default()


card = Image.new("RGB", (W, H), GROUND)
d = ImageDraw.Draw(card)
for gy in range(0, H, 90):
    d.line([(0, gy), (W, gy)], fill=(13, 31, 60))
for gx in range(0, W, 90):
    d.line([(gx, 0), (gx, H)], fill=(13, 31, 60))

d.text((60, 292), "Your flight path", font=font(74), fill=INK)
d.text((60, 372), "isn't curved.", font=font(74), fill=INK)
d.text((60, 452), "Your map is.", font=font(74), fill=ACCENT)

g = panel("globe", 460, 460)
card.paste(g, (135, 560), g)
d.text((640, 690), "ON A GLOBE", font=font(38), fill=DIM)
d.text((640, 742), "straight", font=font(58), fill=INK)
d.text((640, 830), f"{KM:,.0f} km", font=font(44), fill=ACCENT)

mm = panel("merc", 940, 374)
card.paste(mm, (70, 1105), mm)
d.text((70, 1040), "THE SAME LINE, FLATTENED", font=font(38), fill=DIM)
d.text((70, 1500), "DEL → SFO  ·  the line never moved. the paper did.",
       font=font(36, False), fill=DIM)

# Instagram safe area, for eyeballing only.
d.line([(0, 270), (W, 270)], fill=(255, 77, 77), width=3)
d.line([(0, 1540), (W, 1540)], fill=(255, 77, 77), width=3)

card.save("projects/r005_greatcircle/gate0/payoff_frame.png")
print(f"great circle DEL->SFO: {KM:,.0f} km, max latitude {LAT.max():.1f}N")
print("wrote projects/r005_greatcircle/gate0/payoff_frame.png")
