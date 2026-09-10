#!/usr/bin/env python3
"""Gate 0 payoff still for I33 — "A VPN moves your address. Not your clock."

Nothing here is drawn from imagination:

  * coastline  — the GSHHG polylines r006 already shipped, read straight back
                 out of remotion/src/reels/data/r006_geo.ts. Same licence path,
                 already cleared once.
  * zones      — /usr/share/zoneinfo/zone.tab, the real IANA database on this
                 machine (2026c). The zone names, their country codes and the
                 pin coordinates are its rows, not mine.
  * the count  — 418 canonical zones over 247 countries, and every zone name
                 maps to exactly one country. Computed in count_zones(), which
                 prints its working so the figure on the frame is falsifiable.

This is a five-minute mock for a human to say yes or no to. It is NOT a render.
"""
import io
import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, RAIL = 270, 1540, 60, 870

INK, SLATE, BONE, ASH, GRAPHITE, MESH = (
    '#040E1F', '#0E213E', '#E8E6E1', '#81A2C4', '#274064', '#0D1F3C')
ACCENT = '#51A4FF'    # languages — I33 sits in backlog section 3
FAILURE = '#FF4D4D'   # the leak, and only the leak

FONTS = Path('assets/fonts')
TZTAB = Path('/usr/share/zoneinfo/zone.tab')
GEO = Path('remotion/src/reels/data/r006_geo.ts')

# lat, lon straight out of zone.tab (+5222+00454 and +2232+08822)
AMS = (52.37, 4.90)
KOL = (22.53, 88.37)

MAP_X, MAP_Y, MAP_W = SIDE, 970, RAIL - SIDE
LON0, LON1, LAT0, LAT1 = -20.0, 100.0, 5.0, 60.0


def font(name, sz):
    return ImageFont.truetype(str(FONTS / name), sz)


def count_zones():
    """The only number on the frame. Printed so it can be checked by hand."""
    rows = [l.rstrip('\n').split('\t')
            for l in io.open(TZTAB, encoding='utf-8')
            if l.strip() and not l.startswith('#')]
    zones = {r[2] for r in rows}
    countries = {r[0] for r in rows}
    by_zone = {}
    for cc, _, zone, *_ in rows:
        by_zone.setdefault(zone, set()).add(cc)
    spanning = [z for z, c in by_zone.items() if len(c) > 1]
    version = Path('/usr/share/zoneinfo/+VERSION').read_text().strip()
    print(f'  tzdb {version}: {len(zones)} canonical zones, '
          f'{len(countries)} countries')
    print(f'  zones naming more than one country: {len(spanning)} {spanning}')
    # India and Sri Lanka run the identical clock and are named apart anyway.
    print('  Asia/Kolkata ->', by_zone['Asia/Kolkata'],
          ' Asia/Colombo ->', by_zone['Asia/Colombo'], ' (both UTC+05:30)')
    assert not spanning, 'a zone name no longer implies one country'
    return len(zones), len(countries)


def coastlines():
    """r006's GSHHG polylines, un-shifted back to real [-180, 180] longitude."""
    src = io.open(GEO, encoding='utf-8').read()
    body = re.search(r'export const COAST: number\[\]\[\] = \[(.*?)\n\];',
                     src, re.S).group(1)
    out = []
    for chunk in re.findall(r'\[([^\]]*)\]', body):
        f = [float(v) for v in chunk.replace('\n', ' ').split(',') if v.strip()]
        pts = [(((f[i] + 180.0) % 360.0) - 180.0, f[i + 1])
               for i in range(0, len(f), 2)]
        run = []
        for p in pts:                       # break the polyline at the seam
            if run and abs(p[0] - run[-1][0]) > 90.0:
                out.append(run)
                run = []
            run.append(p)
        if run:
            out.append(run)
    return out


def merc(lat):
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


MY0, MY1 = merc(LAT0), merc(LAT1)
MAP_H = int(MAP_W * (MY1 - MY0) / math.radians(LON1 - LON0))


def local(lat, lon):
    """Map-local pixels, so the coastline can be clipped by the canvas itself."""
    x = (lon - LON0) / (LON1 - LON0) * MAP_W
    y = MAP_H - (merc(lat) - MY0) / (MY1 - MY0) * MAP_H
    return x, y


def project(lat, lon):
    x, y = local(lat, lon)
    return MAP_X + x, MAP_Y + y


print('Gate 0 mock — I33. Verifying the one figure on the frame:')
N_ZONES, N_COUNTRIES = count_zones()

img = Image.new('RGB', (W, H), INK)
d = ImageDraw.Draw(img, 'RGBA')

for gx in range(0, W, 45):
    d.line([(gx, 0), (gx, H)], fill=MESH, width=1)
for gy in range(0, H, 45):
    d.line([(0, gy), (W, gy)], fill=MESH, width=1)

big, mono, momo, lab = (font('ArchivoBlack-Regular.ttf', 72),
                        font('IBMPlexMono-Bold.ttf', 84),
                        font('IBMPlexMono-Bold.ttf', 38),
                        font('IBMPlexSans-Bold.ttf', 36))

d.text((SIDE, 300), 'A VPN moves', font=big, fill=BONE)
d.text((SIDE, 382), 'your address.', font=big, fill=BONE)
d.text((SIDE, 464), 'Not your clock.', font=big, fill=ACCENT)

# ── two clocks, one screen, disagreeing ─────────────────────────────────────
# Stacked, not side by side: "WHAT YOUR BROWSER SAYS" at the minimum legal
# 36px is 470px wide, and a half-width panel is 395.
PANEL_Y, PANEL_H, GAP = 600, 160, 16
for i, (t, zone, cap, col) in enumerate([
        ('17:44', 'Europe/Amsterdam', 'WHAT THE SITE SEES', ACCENT),
        ('21:14', 'Asia/Kolkata', 'WHAT YOUR BROWSER SAYS', FAILURE)]):
    y = PANEL_Y + i * (PANEL_H + GAP)
    d.rounded_rectangle([SIDE, y, RAIL, y + PANEL_H], 10,
                        fill=SLATE, outline=col, width=3)
    d.text((SIDE + 28, y + 30), t, font=mono, fill=BONE)
    d.text((SIDE + 320, y + 38), zone, font=momo, fill=col)
    d.text((SIDE + 320, y + 92), cap, font=lab, fill=ASH)

# ── the map, with the two pins that cannot both be true ─────────────────────
sea = Image.new('RGB', (MAP_W, MAP_H), SLATE)
sd = ImageDraw.Draw(sea)
for line in coastlines():
    pts = [local(la, lo) for lo, la in line]
    if len(pts) > 1:
        sd.line(pts, fill=GRAPHITE, width=2)   # clipped by the canvas edge
img.paste(sea, (MAP_X, MAP_Y))
d = ImageDraw.Draw(img, 'RGBA')

ax, ay = project(*AMS)
kx, ky = project(*KOL)
for r, a in ((46, 26), (30, 46), (17, 90)):
    d.ellipse([kx - r, ky - r, kx + r, ky + r],
              fill=(255, 77, 77, a))
d.ellipse([kx - 9, ky - 9, kx + 9, ky + 9], fill=FAILURE)
d.ellipse([ax - 9, ay - 9, ax + 9, ay + 9], fill=ACCENT)
d.ellipse([ax - 20, ay - 20, ax + 20, ay + 20], outline=ACCENT, width=3)
d.text((ax - 4, ay - 58), 'AMSTERDAM', font=lab, fill=ACCENT, anchor='mm')
d.text((kx, ky + 62), 'YOU', font=lab, fill=FAILURE, anchor='mm')

d.text((SIDE, MAP_Y + MAP_H + 30),
       f'{N_ZONES} time zones. Every one names exactly one country.',
       font=lab, fill=ASH)
d.text((SIDE, MAP_Y + MAP_H + 78),
       'India and Sri Lanka share a clock — and not a name.',
       font=lab, fill=ASH)

d.line([(0, SAFE_TOP), (W, SAFE_TOP)], fill=(255, 176, 32, 60), width=2)
d.line([(0, SAFE_BOT), (W, SAFE_BOT)], fill=(255, 176, 32, 60), width=2)
d.line([(RAIL, 1050), (RAIL, SAFE_BOT)], fill=(255, 176, 32, 60), width=2)

out = Path('projects/i33_vpn/gate0/payoff_frame.png')
img.save(out)
print(f'\nwrote {out}  ({MAP_W}x{MAP_H} map at y={MAP_Y})')
