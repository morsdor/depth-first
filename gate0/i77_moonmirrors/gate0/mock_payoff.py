#!/usr/bin/env python3
"""Gate 0 mock for I77 -- "there are mirrors on the Moon, and observatories
still bounce lasers off them".

Five minutes of PIL. NOT a render, NOT the reel. Exists only to prove the
approved sentence can be SHOWN:

    "There are actual mirrors sitting on the Moon from Apollo, and
     observatories still fire lasers at them and catch the bounce back --
     that's how we know the Moon is drifting away, 3.8 cm every year."

Geometry here is ILLUSTRATIVE, not physically scaled -- Earth-Moon distance
(384,400 km) and a sphere's own radius cannot share one linear scale on a
1080-wide frame without one of them vanishing (the r009 "speck" problem, but
here the point being made is the ROUND TRIP and the DIVERGENCE, not relative
size). The real build re-derives beam divergence from the actual half-angle
and distance in Stage 3 -- this frame only has to prove the shot is showable.

Every figure below is a RESEARCH LEAD -- Stage 3 verifies each against a
primary source (APOLLO/McDonald/OCA station literature, LLR data releases)
before it reaches a script or a frame.

    python3 gate0/i77_moonmirrors/gate0/mock_payoff.py
"""
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ── Research leads -- verify in Stage 3 ──────────────────────────────────────
D_EARTH_MOON_KM = 384_400          # mean distance -- well-established, still cited plainly
OUTGOING_SPOT_KM = 6.5             # beam spread on arrival at the Moon -- LEAD (APOLLO-class station)
RETURN_SPOT_KM = 15_000            # reflected beam spread back at Earth -- LEAD
PHOTONS_SENT = "10^17"             # per pulse train, order of magnitude -- LEAD
PHOTONS_BACK = 1                   # roughly one photon detected, per pulse -- LEAD
RECESSION_CM_YR = 3.8              # Moon's recession rate from decades of LLR -- LEAD

# ── Frame. Instagram safe area, not the raw canvas (CLAUDE.md non-negotiable 1).
W, H = 1080, 1920
SAFE_TOP, SAFE_BOTTOM, SIDE, RAIL = 270, 1540, 60, 210
SAFE_W = W - SIDE - RAIL

ACCENT = (61, 223, 125)            # DOMAIN_ACCENT.security -- §4 Secrets and proofs
INK, BONE, ASH, GRAPHITE = (4, 14, 31), (232, 230, 225), (129, 162, 196), (39, 64, 100)

FONTS = pathlib.Path(__file__).resolve().parents[3] / 'assets' / 'fonts'
def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)

sub = font('IBMPlexSans-Bold.ttf', 30)
mono = font('IBMPlexMono-Bold.ttf', 26)
mono_s = font('IBMPlexMono-Bold.ttf', 21)


def fit_font(text, max_w, start=60, floor=36):
    """ArchivoBlack is a heavy display face -- shrink until the line clears SAFE_W."""
    size = start
    f = font('ArchivoBlack-Regular.ttf', size)
    tmp = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    while tmp.textlength(text, font=f) > max_w and size > floor:
        size -= 2
        f = font('ArchivoBlack-Regular.ttf', size)
    return f


def glow_sphere(img, x, y, r, colour, power=2.0):
    """A soft-shaded disc -- recognisable as a planet/moon, not a flat circle."""
    patch = Image.new('RGB', (r * 6, r * 6), INK)
    gd = ImageDraw.Draw(patch)
    c = r * 3
    for i in range(r, 0, -1):
        f = (i / r) ** power
        shade = tuple(int(colour[k] * (0.35 + 0.65 * f)) for k in range(3))
        gd.ellipse([c - i, c - i, c + i, c + i], fill=shade)
    patch = patch.filter(ImageFilter.GaussianBlur(r * 0.02))
    img.paste(patch, (int(x - c), int(y - c)))


def craters(img, x, y, r, rng):
    d = ImageDraw.Draw(img, 'RGBA')
    for _ in range(14):
        ang = rng.uniform(-1.1, 1.1)
        rad = rng.uniform(0, r * 0.85)
        cx, cy = x + rad * np.cos(ang), y + rad * np.sin(ang) * 0.6
        cr = rng.uniform(4, 16)
        if (cx - x) ** 2 + (cy - y) ** 2 < (r * 0.95) ** 2:
            d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(0, 0, 0, 40))


def main():
    img = Image.new('RGB', (W, H), INK)
    d = ImageDraw.Draw(img)
    rng = np.random.default_rng(77)

    # starfield
    for sx, sy, sv in zip(rng.uniform(0, W, 260), rng.uniform(SAFE_TOP, SAFE_BOTTOM, 260),
                          rng.uniform(0.08, 0.35, 260)):
        v = int(255 * sv)
        d.point((sx, sy), fill=(v, v, v))

    # ── Earth (bottom-left of the safe column) and Moon (upper-right) ──────
    ex, ey, er = SIDE + 70, 1180, 95
    mx, my, mr = SIDE + SAFE_W - 130, 640, 130
    glow_sphere(img, ex, ey, er, (100, 140, 200))
    glow_sphere(img, mx, my, mr, (150, 150, 150))
    craters(img, mx, my, mr, rng)

    # outgoing beam: a thin line widening into a cone at the Moon -- divergence
    ang = np.arctan2(my - ey, mx - ex)
    perp = ang + np.pi / 2
    half_out = 26   # px half-width of the illustrated spot at the Moon end
    ox0, oy0 = ex + er * np.cos(ang), ey + er * np.sin(ang)
    ox1, oy1 = mx - mr * np.cos(ang), my - mr * np.sin(ang)
    # drawn with alpha via an RGBA overlay so it reads as a beam, not a solid wedge
    beam = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beam)
    bd.polygon([
        (ox0, oy0),
        (ox1 + half_out * np.cos(perp), oy1 + half_out * np.sin(perp)),
        (ox1 - half_out * np.cos(perp), oy1 - half_out * np.sin(perp)),
    ], fill=ACCENT + (110,))
    # return beam: same path, much wider fan back at Earth -- almost nothing left
    half_ret = 150
    bd.polygon([
        (ox1, oy1),
        (ex + (er + half_ret) * np.cos(ang) + half_ret * np.cos(perp), ey + (er + half_ret) * np.sin(ang) + half_ret * np.sin(perp)),
        (ex + (er + half_ret) * np.cos(ang) - half_ret * np.cos(perp), ey + (er + half_ret) * np.sin(ang) - half_ret * np.sin(perp)),
    ], fill=ACCENT + (18,))
    img.paste(beam, (0, 0), beam)
    d = ImageDraw.Draw(img)
    d.line([ox0, oy0, ox1, oy1], fill=ACCENT, width=3)

    d.text((mx - mr, my - mr - 40), 'RETROREFLECTOR', font=mono_s, fill=ASH)
    d.text((ex - er, ey + er + 16), 'OBSERVATORY', font=mono_s, fill=ASH)

    # headline drawn LAST -- glow_sphere's opaque square patch (r*6 across, centred
    # at r*3,r*3) is far bigger than the circle it draws and paints over whatever
    # was already at those pixels; the Moon's patch (radius 130 -> a 780px box at
    # x 350-1130) reaches straight into the headline's y-band if drawn first.
    line1, line2 = 'THERE ARE MIRRORS', 'ON THE MOON.'
    f1, f2 = fit_font(line1, SAFE_W), fit_font(line2, SAFE_W)
    d.text((SIDE, 300), line1, font=f1, fill=BONE)
    d.text((SIDE, 300 + f1.size + 14), line2, font=f2, fill=BONE)

    dist = f'{D_EARTH_MOON_KM:,} KM'
    d.text((SIDE, 1336), 'ONE ROUND TRIP:', font=sub, fill=ASH)
    d.text((SIDE, 1378), dist, font=fit_font(dist, SAFE_W), fill=ACCENT)
    ret = f'~1 PHOTON BACK, PER {PHOTONS_SENT} SENT'
    d.text((SIDE, 1454), ret, font=mono, fill=ASH)
    pay = f'THE MOON IS LEAVING. {RECESSION_CM_YR} CM EVERY YEAR.'
    d.text((SIDE, 1492), pay, font=mono, fill=ACCENT)

    # Instagram safe area, for eyeballing only.
    d.line([(0, 270), (W, 270)], fill=(255, 77, 77), width=3)
    d.line([(0, 1540), (W, 1540)], fill=(255, 77, 77), width=3)

    out = pathlib.Path(__file__).with_name('payoff_frame.png')
    img.save(out)

    print(f'Earth-Moon distance          {D_EARTH_MOON_KM:,} km')
    print(f'outgoing spot at the Moon    ~{OUTGOING_SPOT_KM} km wide (LEAD)')
    print(f'return spot back at Earth    ~{RETURN_SPOT_KM:,} km wide (LEAD)')
    print(f'photons out -> back          {PHOTONS_SENT} -> ~{PHOTONS_BACK} (LEAD)')
    print(f'recession rate               {RECESSION_CM_YR} cm/yr (LEAD)')
    print(f'wrote {out}')


if __name__ == '__main__':
    main()
