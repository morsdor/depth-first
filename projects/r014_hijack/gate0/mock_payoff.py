"""
Gate 0 mock for I31 -- "A typo once took a country off the internet."

NOT a render. A five-minute PIL still whose only job is to let a human answer
one question: does a stranger, sound off, know what they are looking at and
want to know why?

Geography is real even in the mock: coastlines are reused from r005's
generated r005_geo.ts (real GSHHG data, already wrapped to a Pacific seam at
lon 150), not invented. The story is Asia-centred (Karachi), far from that
seam, so no reseaming is needed the way r006 needed for its Atlantic route.

The six origin cities and their positions are real; the "arc into Karachi"
paths are illustrative great-circle-ISH curves for this mock only -- the real
build computes actual great-circle bearings the way r005 did for its flight
path, not hand-drawn curves.
"""
import re
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / "payoff_frame.png"

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, SAFE_W = 270, 1540, 60, 810
GROUND = "#040E1F"
INK = "#E8E6E1"
DIM = "#5B7A99"
LAND = "#0D1F3C"
COAST = "#3A5878"
ACCENT = "#51A4FF"   # languages, this section's accent
DEAD = "#2A3444"      # extinguished-origin grey

LON0 = 150.0  # matches r005_geo.ts -- Pacific-centred, keeps Asia/Africa whole


def wrap(lon):
    return (lon - LON0 + 180) % 360 - 180


def project(lon, lat):
    x = SIDE + (wrap(lon) + 180) / 360 * SAFE_W
    y = SAFE_TOP + (90 - lat) / 180 * (SAFE_BOT - SAFE_TOP)
    return x, y


def coastlines():
    src = (ROOT / "remotion/src/reels/data/r005_geo.ts").read_text()
    block = src[src.index("export const COAST"):]
    block = block[: block.index("];") + 1]
    rings = []
    for row in re.findall(r"\[([-0-9.,\s]+)\]", block):
        vals = [float(t) for t in row.split(",") if t.strip()]
        pts = [(vals[i], vals[i + 1]) for i in range(0, len(vals) - 1, 2)]
        if len(pts) > 1:
            rings.append(pts)
    return rings


def bezier(p0, p1, p2, steps=40):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        pts.append((x, y))
    return pts


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for c in candidates:
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def main():
    img = Image.new("RGB", (W, H), GROUND)
    d = ImageDraw.Draw(img)

    # Crop to the story's latitude band. Full-polar rings (Arctic/Antarctic)
    # wrap nearly the whole width of an equirectangular frame and read as a
    # stray chord behind the headline -- not a bug in the seam handling, just
    # not needed for a mid-latitude story. r006 cropped the same way.
    for ring in coastlines():
        run = []
        for lon, lat in ring:
            if -58 <= lat <= 68:
                run.append(project(lon, lat))
            elif len(run) > 1:
                d.line(run, fill=COAST, width=2)
                run = []
            else:
                run = []
        if len(run) > 1:
            d.line(run, fill=COAST, width=2)

    # Karachi, the sink
    karachi = project(67.03, 24.86)

    # six real origin cities, traffic converging on Karachi
    origins = {
        "SAO PAULO": (-46.63, -23.55),
        "LONDON": (-0.13, 51.51),
        "LAGOS": (3.39, 6.45),
        "TOKYO": (139.69, 35.68),
        "SYDNEY": (151.21, -33.87),
        "MUMBAI": (72.88, 19.08),
    }

    for name, (lon, lat) in origins.items():
        p0 = project(lon, lat)
        mid_lon = (lon + 67.03) / 2
        mid_lat = max(lat, 24.86) + 18  # illustrative bow, not a real geodesic
        p1 = project(mid_lon, mid_lat)
        curve = bezier(p0, p1, karachi, steps=48)
        for i in range(len(curve) - 1):
            t = i / len(curve)
            w = 1 + int(3 * t)
            d.line([curve[i], curve[i + 1]], fill=ACCENT, width=w)
        # extinguished origin dot -- the "went dark" state
        r = 9
        d.ellipse([p0[0] - r, p0[1] - r, p0[0] + r, p0[1] + r], fill=DEAD, outline=DIM, width=2)
        f = font(22)
        tw = d.textlength(name, font=f)
        d.text((p0[0] - tw / 2, p0[1] + 14), name, fill=DIM, font=f)

    # Karachi -- the sink, lit bright
    r = 16
    d.ellipse(
        [karachi[0] - r, karachi[1] - r, karachi[0] + r, karachi[1] + r],
        fill=ACCENT,
        outline=INK,
        width=3,
    )
    f = font(24, bold=True)
    label = "KARACHI"
    tw = d.textlength(label, font=f)
    d.text((karachi[0] - tw / 2, karachi[1] + 20), label, fill=INK, font=f)

    # headline + clock, safe area
    f_head = font(58, bold=True)
    d.text((SIDE, SAFE_TOP + 20), "YOUTUBE: DOWN", fill=INK, font=f_head)
    f_sub = font(30)
    d.text((SIDE, SAFE_TOP + 100), "EVERYWHERE. FOR ALMOST TWO HOURS.", fill=DIM, font=f_sub)

    f_clock = font(64, bold=True)
    clock = "1:52:00"
    tw = d.textlength(clock, font=f_clock)
    d.text((W - SIDE - tw, SAFE_BOT - 80), clock, fill=ACCENT, font=f_clock)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
