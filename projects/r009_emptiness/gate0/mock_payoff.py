#!/usr/bin/env python3
"""Gate 0 mock for I70 — "the biggest star in the universe is a speck".

Five minutes of PIL. NOT a render, NOT the reel. This exists only to prove the
approved sentence can be SHOWN:

    "Everyone shows you how big stars get. Nobody shows you the emptiness --
     the biggest star anyone has found would still be a speck in the gap
     between two ordinary ones."

Every number on the frame is computed below and printed to stdout. Nothing is
typed into a label by hand. All five inputs are published measurements (facts,
citable) -- no catalogue is queried and no database is redistributed, so there
is no r006-style licence rebuild waiting.

    python3 gate0/i70_emptiness/gate0/mock_payoff.py
"""
import pathlib

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ── The five inputs. RESEARCH LEADS -- Stage 3 verifies each against a primary
#    source before any of this reaches a frame. ──────────────────────────────
R_SUN_KM = 695_700.0          # IAU 2015 nominal solar radius
LY_KM = 9_460_730_472_580.8   # exact, by definition of the light-year
D_PROXIMA_LY = 4.2465         # Proxima Centauri, Gaia parallax
R_BIGGEST_RSUN = 1540.0       # WOH G64 A, 1540 +/- 77 -- Ohnaka+ 2024, A&A 691 L15
R_BETELGEUSE_RSUN = 764.0     # Betelgeuse -- the conservative fallback, still 37,793x

GAP_KM = D_PROXIMA_LY * LY_KM
D_BIGGEST_KM = 2 * R_BIGGEST_RSUN * R_SUN_KM
D_SUN_KM = 2 * R_SUN_KM
FITS = GAP_KM / D_BIGGEST_KM              # how many biggest-stars fit in the gap
FITS_SUN = GAP_KM / D_SUN_KM

# ── Frame. Instagram safe area, not the raw canvas (CLAUDE.md non-negotiable 1).
W, H = 1080, 1920
SAFE_TOP, SAFE_BOTTOM, SIDE, RAIL = 270, 1540, 60, 210
SAFE_W = W - SIDE - RAIL                  # 810 -- clears the action rail
CX = SIDE + SAFE_W // 2                   # 465

ACCENT = (0, 214, 247)                    # DOMAIN_ACCENT.infrastructure
INK, BONE, ASH = (10, 12, 16), (240, 243, 247), (140, 150, 163)

# The whole gap is drawn across SAFE_W. Everything else follows from that.
PX_PER_KM = SAFE_W / GAP_KM
BIGGEST_PX = D_BIGGEST_KM * PX_PER_KM     # sub-pixel -- that IS the payoff
SUN_PX = D_SUN_KM * PX_PER_KM
MAG = 1000                                # magnifier power, chosen to make it visible

FONTS = pathlib.Path(__file__).resolve().parents[3] / 'assets' / 'fonts'
def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)

head = font('ArchivoBlack-Regular.ttf', 62)
sub = font('IBMPlexSans-Bold.ttf', 30)
mono = font('IBMPlexMono-Bold.ttf', 26)
mono_s = font('IBMPlexMono-Bold.ttf', 21)


def star(img, x, y, r, colour, power=2.2):
    """A soft radial glow, drawn once at size and blurred -- not a flat disc."""
    glow = Image.new('RGB', (r * 8, r * 8), INK)
    gd = ImageDraw.Draw(glow)
    c = r * 4
    for i in range(r * 3, 0, -1):
        f = (1 - i / (r * 3)) ** power
        gd.ellipse([c - i, c - i, c + i, c + i],
                   fill=tuple(int(INK[k] + (colour[k] - INK[k]) * f) for k in range(3)))
    glow = glow.filter(ImageFilter.GaussianBlur(r * 0.35))
    img.paste(glow, (int(x - c), int(y - c)))
    ImageDraw.Draw(img).ellipse([x - r, y - r, x + r, y + r], fill=BONE)


def main():
    img = Image.new('RGB', (W, H), INK)
    d = ImageDraw.Draw(img)

    # faint starfield so the emptiness reads as space, not as a blank chart
    import numpy as np
    rng = np.random.default_rng(70)
    for sx, sy, sv in zip(rng.uniform(0, W, 320), rng.uniform(SAFE_TOP, SAFE_BOTTOM, 320),
                          rng.uniform(0.10, 0.42, 320)):
        v = int(255 * sv)
        d.point((sx, sy), fill=(v, v, v))

    # ── the gap, drawn at true scale across the rail-safe width ─────────────
    y = 760
    d.line([SIDE, y, SIDE + SAFE_W, y], fill=(46, 54, 66), width=2)
    star(img, SIDE, y, 9, (255, 236, 190))
    star(img, SIDE + SAFE_W, y, 7, (255, 176, 132))

    d.text((SIDE, y + 34), 'THE SUN', font=mono_s, fill=ASH)
    t = 'THE NEXT STAR'
    d.text((SIDE + SAFE_W - d.textlength(t, font=mono_s), y + 34), t, font=mono_s, fill=ASH)
    lab = f'{D_PROXIMA_LY} LIGHT-YEARS OF NOTHING'
    d.text((CX - d.textlength(lab, font=mono) / 2, y - 52), lab, font=mono, fill=ACCENT)

    # tick at the midpoint -- where the biggest star is about to be placed
    d.line([CX, y - 12, CX, y + 12], fill=ACCENT, width=3)

    # ── the magnifier: x1000, and the hypergiant only just becomes a disc ───
    mx, my, mr = CX, 1046, 205
    d.ellipse([mx - mr, my - mr, mx + mr, my + mr], outline=(46, 54, 66), width=3)
    d.line([CX, y + 14, mx, my - mr], fill=(46, 54, 66), width=2)

    big_r = BIGGEST_PX * MAG / 2
    star(img, mx, my, max(1, int(round(big_r))), (255, 138, 92), power=1.7)

    cap = f'x{MAG:,} MAGNIFICATION'
    d.text((mx - d.textlength(cap, font=mono_s) / 2, my + mr + 22), cap, font=mono_s, fill=ASH)
    n1 = 'THE LARGEST STAR EVER FOUND'
    d.text((mx - d.textlength(n1, font=mono) / 2, my - mr - 46), n1, font=mono, fill=(255, 138, 92))

    # the Sun at the SAME magnification -- still nothing. the second gut-punch.
    d.text((mx + 74, my - 12), f'the Sun, same zoom:  {SUN_PX * MAG:.4f} px',
           font=mono_s, fill=(90, 99, 112))

    # ── the line the whole frame exists for ────────────────────────────────
    d.text((SIDE, 1348), 'IT FITS IN THAT GAP', font=head, fill=BONE)
    d.text((SIDE, 1422), f'{FITS:,.0f} TIMES OVER', font=head, fill=ACCENT)
    d.text((SIDE, 1502), f'drawn to the same scale as the line above: {BIGGEST_PX:.3f} px wide',
           font=sub, fill=ASH)

    out = pathlib.Path(__file__).with_name('payoff_frame.png')
    img.save(out)

    print(f'gap  Sun -> Proxima      {GAP_KM:,.0f} km   ({D_PROXIMA_LY} ly)')
    print(f'diam largest known star  {D_BIGGEST_KM:,.0f} km   ({R_BIGGEST_RSUN:,.0f} R_sun)')
    print(f'diam Sun                 {D_SUN_KM:,.0f} km')
    print(f'largest star fits in the gap   {FITS:,.1f} x')
    print(f'Sun          fits in the gap   {FITS_SUN:,.1f} x')
    print(f'at {SAFE_W} px for the gap:  largest star = {BIGGEST_PX:.4f} px, '
          f'Sun = {SUN_PX:.7f} px')
    print(f'Betelgeuse fallback ({R_BETELGEUSE_RSUN:,.0f} R_sun) fits '
          f'{GAP_KM / (2 * R_BETELGEUSE_RSUN * R_SUN_KM):,.0f} x')
    print(f'wrote {out}')

    assert BIGGEST_PX < 1.0, 'if the biggest star is a visible pixel the sentence is wrong'
    assert FITS > 10_000, 'the claim is "a speck", not "a bit smaller"'


if __name__ == '__main__':
    main()
