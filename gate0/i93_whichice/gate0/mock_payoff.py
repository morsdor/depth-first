"""Gate 0 artefact for I93 — the payoff frame, drawn once, before any build.

NOT the reel and NOT a Remotion render: the five-minute still Gate 0 demands, so the concept can be
killed for a rupee instead of a day.

What is drawn is the SENTENCE ("When the ice in your drink melts the glass doesn't overflow — so
melting sea ice barely raises the sea. It's the ice sitting on land that does."): the same ice, the
same water, the same glass, melted twice — once FLOATING in the water and once SITTING ABOVE IT on a
shelf, which is what ice on land is. The two water levels are COMPUTED below from Archimedes'
principle, not painted:

  * floating ice displaces exactly its own weight of water, so when it melts it fills exactly the
    hole it was occupying. The level before and after are the same number (asserted, to 1e-12);
  * ice resting on a shelf displaces nothing, so its meltwater is new water and the level climbs by
    melt volume / glass area;
  * and the level the floating glass already sits at IS the level the shelf glass reaches after the
    melt. The floating ice had already "raised" the water; there is nothing left to add.

It also computes the one correction that stops the first half of the sentence being false as worded:
fresh ice floating in SALT water displaces a little less than it melts into, so the unqualified
"doesn't raise the sea" is wrong by about 2 percent of the ice's volume. Hence "barely" in the
sentence (GATE0.md section 1). That is asserted here so it cannot drift.

SKETCH, not the build. The glass, the cube and the rock shelf are polygons; the ocean strip at the
bottom is a diagram of the same rule at planet scale and carries NO number. Stage 3 replaces it with
real ice-sheet geometry and real imagery (GATE0.md section 6). Needs only numpy + Pillow.
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
FONTS = HERE.parents[2] / "assets" / "fonts"
W, H = 1080, 1920
SAFE = (60, 270, 870, 1540)                      # x0, y0, x1, y1 — CLAUDE.md non-negotiable 1
S = 2                                            # supersample, downscaled at the end
GROUND = np.array([4, 14, 31])                   # BASE.ink
INK = (232, 230, 225)
DIM = (129, 162, 196)
ACCENT = (0, 214, 247)                           # DOMAIN_ACCENT.infrastructure — section 2
AMBER = (255, 176, 32)                           # the ONE amber element: the level that climbs

# ── the physics, computed not typed ────────────────────────────────────────
RHO_ICE, RHO_FRESH, RHO_SEA = 0.917, 1.000, 1.025          # g/cm^3
R_IN = 3.5                                                 # inner radius of the glass, cm
A = math.pi * R_IN ** 2                                    # cm^2
V_WATER = A * 8.0                                          # cm^3 — 8 cm of water, ice not yet in
SIDE = 4.0                                                 # the cube, cm
V_ICE = SIDE ** 3
MASS = RHO_ICE * V_ICE                                     # g

# floating in fresh water
V_DISPLACED = MASS / RHO_FRESH
H_FLOAT = (V_WATER + V_DISPLACED) / A                      # level with the cube floating
SUBMERGED = V_DISPLACED / SIDE ** 2                        # cm of the cube below the line
V_MELT = MASS / RHO_FRESH                                  # fresh meltwater from this ice
H_FLOAT_AFTER = (V_WATER + V_MELT) / A
assert abs(H_FLOAT_AFTER - H_FLOAT) < 1e-12, "floating ice must not move the level"
assert abs(SUBMERGED / SIDE - RHO_ICE / RHO_FRESH) < 1e-12  # 91.7% of it is under

# the same ice sitting on a shelf above the water
H_SHELF_BEFORE = V_WATER / A
H_SHELF_AFTER = (V_WATER + V_MELT) / A
RISE = H_SHELF_AFTER - H_SHELF_BEFORE
assert RISE > 0.5, RISE
assert abs(H_SHELF_AFTER - H_FLOAT) < 1e-12, "the shelf glass ends where the floating glass already was"

# the correction that makes "doesn't raise the sea" false as worded: fresh ice floating in SALT water
V_DISP_SEA = MASS / RHO_SEA
EXTRA = V_MELT - V_DISP_SEA                                # cm^3 of net new volume
EXTRA_FRAC = EXTRA / V_ICE
assert 0.015 < EXTRA_FRAC < 0.03, EXTRA_FRAC               # about 2 percent of the ice's volume

print(f"glass: inner radius {R_IN} cm, area {A:.2f} cm^2; water {V_WATER:.1f} cm^3 (8.00 cm); ice {SIDE:g} cm cube, {MASS:.2f} g")
print(f"floating:  level {H_FLOAT:.3f} cm with the cube in; {SUBMERGED:.3f} cm of the cube under, {SIDE - SUBMERGED:.3f} cm above; after melt {H_FLOAT_AFTER:.3f} cm  (change 0.000)")
print(f"on a shelf: level {H_SHELF_BEFORE:.3f} cm -> {H_SHELF_AFTER:.3f} cm after melt  (+{RISE:.3f} cm)")
print(f"fresh ice floating in SALT water ({RHO_SEA} g/cm^3): net +{EXTRA:.2f} cm^3 = {EXTRA_FRAC * 100:.2f}% of the ice's volume")

# ── drawing ────────────────────────────────────────────────────────────────
PXCM = 32                                                  # pixels per cm, 1x
CX = (240, 640)                                            # glass centres (left: floating, right: on a shelf)
Y_TABLE = 1020
BASE_TH = int(0.6 * PXCM)
Y_BOT = Y_TABLE - BASE_TH                                  # inside bottom of the glass
GLASS_CM = 15.0
IW = int(2 * R_IN * PXCM)                                  # inner width, px
SHELF_CM = 10.9                                            # top of the shelf, above the final level


def F(name, size):
    return ImageFont.truetype(str(FONTS / name), size * S)


def level_y(cm):
    return Y_BOT - cm * PXCM


def lin(w, h, top, bottom):
    t = np.linspace(0, 1, h)[:, None, None]
    return np.broadcast_to(np.array(top)[None, None, :] * (1 - t) + np.array(bottom)[None, None, :] * t, (h, w, len(top))).astype(np.uint8)


def new():
    return Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))


def sc(v):
    return [int(round(x * S)) for x in v]


def ground():
    yy, xx = np.mgrid[0:H * S, 0:W * S]
    d = np.hypot((xx - 0.45 * W * S) / (W * S), (yy - 0.52 * H * S) / (H * S) * 0.9)
    k = np.clip(1 - d * 1.5, 0, 1)[..., None]
    rgb = GROUND[None, None, :] * (1 - 0.0) + np.array([14, 40, 78])[None, None, :] * k * 0.55
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def text(img, xy, s, font, fill, anchor="la", spacing=0):
    d = ImageDraw.Draw(img)
    d.text((xy[0] * S, xy[1] * S), s, font=font, fill=fill, anchor=anchor, spacing=spacing * S)


def cube_layer(side_px, tint):
    """An ice cube: translucent, bevelled, with internal fractures. tint (0..1) shifts it toward water blue."""
    n = int(side_px * S)
    im = Image.new("RGBA", (n + 8 * S, n + 8 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = int(0.13 * n)
    c0 = (222, 241, 252)
    c1 = (120, 190, 226)
    col = tuple(int(c0[i] * (1 - tint) + c1[i] * tint) for i in range(3))
    d.rounded_rectangle((4 * S, 4 * S, 4 * S + n, 4 * S + n), r, fill=col + (int(170 - 20 * tint),))
    hl = Image.new("RGBA", im.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    hd.rounded_rectangle((4 * S + 10 * S, 4 * S + 10 * S, 4 * S + n - 10 * S, 4 * S + n - 10 * S), int(0.1 * n), outline=(255, 255, 255, 150), width=2 * S)
    hd.polygon([(4 * S + 0.16 * n, 4 * S + 0.12 * n), (4 * S + 0.5 * n, 4 * S + 0.12 * n), (4 * S + 0.12 * n, 4 * S + 0.55 * n)], fill=(255, 255, 255, 70))
    for (a, b, c, e) in [(0.30, 0.45, 0.62, 0.78), (0.58, 0.20, 0.80, 0.42), (0.20, 0.66, 0.42, 0.90)]:
        hd.line([(4 * S + a * n, 4 * S + b * n), (4 * S + c * n, 4 * S + e * n)], fill=(255, 255, 255, 80), width=2 * S)
    for (a, b, rr) in [(0.7, 0.7, 0.025), (0.28, 0.3, 0.02), (0.55, 0.52, 0.015)]:
        hd.ellipse((4 * S + (a - rr) * n, 4 * S + (b - rr) * n, 4 * S + (a + rr) * n, 4 * S + (b + rr) * n), fill=(255, 255, 255, 140))
    im.alpha_composite(hl)
    return im


def rock(w, h, seed=3):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, 1, (h, w))
    n = np.asarray(Image.fromarray(((n - n.min()) / (np.ptp(n)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), dtype=float)
    base = lin(w, h, (96, 84, 76), (52, 46, 44)).astype(float)
    base += (n[..., None] - 128) * 0.35
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def glass(cx, on_shelf):
    """One tumbler. Returns (layer, markers). All geometry in 1x pixels, drawn at S x."""
    L = new()
    d = ImageDraw.Draw(L)
    x0, x1 = cx - IW // 2, cx + IW // 2
    y_top = Y_BOT - int(GLASS_CM * PXCM)
    level_now = H_SHELF_BEFORE if on_shelf else H_FLOAT
    yw = level_y(level_now)

    # ghost of where the water will be once the shelf ice has melted
    if on_shelf:
        ya = level_y(H_SHELF_AFTER)
        d.rectangle(sc((x0, ya, x1, yw)), fill=(0, 214, 247, 46))

    # water body
    wat = Image.fromarray(lin(int(IW * S), int((Y_BOT - yw) * S), (92, 176, 222, 150), (22, 74, 128, 190)), "RGBA")
    L.alpha_composite(wat, (int(x0 * S), int(yw * S)))
    d.ellipse(sc((x0, yw - 7, x1, yw + 7)), fill=(176, 226, 248, 120))           # the surface, seen a little from above
    d.ellipse(sc((x0 + 6, yw - 5, x1 - 6, yw + 5)), outline=(255, 255, 255, 90), width=S)

    side = SIDE * PXCM
    if not on_shelf:
        # floating: 91.7% under the line. The cube is drawn once bright, once water-tinted, clipped either side of the surface.
        top = yw - (SIDE - SUBMERGED) * PXCM
        cxl = cx - side / 2 + 6
        for tint, (ya, yb) in ((0.0, (0, yw)), (0.55, (yw, H))):
            cl = cube_layer(side, tint)
            m = Image.new("L", cl.size, 0)
            ImageDraw.Draw(m).rectangle((0, int((ya - top) * S + 4 * S), cl.size[0], int((yb - top) * S + 4 * S)), fill=255)
            cl.putalpha(ImageChops.multiply(cl.getchannel("A"), m))
            L.alpha_composite(cl, (int((cxl - 4) * S), int((top - 4) * S)))
        # the submerged volume, outlined: the hole the meltwater will fill
        d.rounded_rectangle(sc((cxl, yw, cxl + side, top + side)), int(0.12 * side * S), outline=(255, 255, 255, 120), width=S)
    else:
        # ice on a rock shelf bracketed to the wall, entirely above the water
        sy = level_y(SHELF_CM)
        sh = rock(int((IW // 2 + 44) * S), int(26 * S))
        mask = Image.new("L", sh.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, sh.size[0], sh.size[1]), 8 * S, fill=255)
        sh.putalpha(mask)
        L.alpha_composite(sh, (int(x0 * S), int(sy * S)))
        cl = cube_layer(side, 0.0)
        L.alpha_composite(cl, (int((cx - side / 2 - 18 - 4) * S), int((sy - side - 4) * S + 2 * S)))

    # glass walls, rim, base and a specular strip
    wall = 7
    for xa, xb in ((x0 - wall, x0), (x1, x1 + wall)):
        g = Image.fromarray(lin(wall * S, int((Y_TABLE - y_top) * S), (255, 255, 255, 110), (210, 236, 250, 150)), "RGBA")
        L.alpha_composite(g, (int(xa * S), int(y_top * S)))
    d.rectangle(sc((x0 - wall, Y_BOT, x1 + wall, Y_TABLE)), fill=(200, 232, 248, 120))
    d.line(sc((x0 - wall, Y_BOT, x1 + wall, Y_BOT)), fill=(255, 255, 255, 140), width=S)
    d.ellipse(sc((x0 - wall, y_top - 8, x1 + wall, y_top + 8)), outline=(255, 255, 255, 190), width=2 * S)
    spec = Image.fromarray(lin(9 * S, int((Y_BOT - y_top - 40) * S), (255, 255, 255, 120), (255, 255, 255, 12)), "RGBA")
    L.alpha_composite(spec, (int((x0 + 18) * S), int((y_top + 20) * S)))
    return L


def reflect(layer, y_axis, strength=0.34, fade_px=130):
    """Mirror a layer about the table edge, faded and softened."""
    flip = layer.transpose(Image.FLIP_TOP_BOTTOM)
    # flip maps y -> H*S - y; shift so the axis lands where it should
    dy = int((2 * y_axis - H) * S)
    out = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    out.alpha_composite(flip, (0, dy))
    yy = np.arange(H * S)[:, None]
    fade = np.clip(1 - (yy - y_axis * S) / (fade_px * S), 0, 1) * strength
    fade[yy < y_axis * S] = 0
    a = np.asarray(out.getchannel("A"), dtype=float) * fade
    out.putalpha(Image.fromarray(a.astype(np.uint8), "L"))
    return out.filter(ImageFilter.GaussianBlur(2 * S))


def planet_band(img):
    """Same rule at planet scale — a diagram, no numbers. Sea ice floats; the ice sheet sits on land."""
    d = ImageDraw.Draw(img)
    x0, x1, ys, yb = 60, 870, 1355, 1508
    # sea
    sea = Image.fromarray(lin((x1 - x0) * S, (yb - ys) * S, (40, 120, 176, 255), (10, 40, 84, 255)), "RGBA")
    img.alpha_composite(sea, (x0 * S, ys * S))
    d.line(sc((x0, ys, x1, ys)), fill=(176, 226, 248, 230), width=2 * S)
    # land and the ice sheet on it
    land = [(430, yb), (492, 1448), (536, 1388), (566, 1318), (610, 1290), (870, 1284), (870, yb)]
    lm = Image.new("L", img.size, 0)
    ImageDraw.Draw(lm).polygon([(x * S, y * S) for x, y in land], fill=255)
    rk_full = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rk_full.paste(rock(img.size[0], int((yb - 1270) * S)), (0, 1270 * S))
    rk_full.putalpha(ImageChops.multiply(rk_full.getchannel("A"), lm))
    img.alpha_composite(rk_full)
    dome = []
    for i in range(0, 41):
        t = i / 40
        x = 548 + t * (870 - 548)
        y = 1296 - (1296 - 1196) * math.sin(min(1, t * 1.35) * math.pi / 2) ** 0.8
        dome.append((x, y))
    poly = dome + [(870, 1290), (574, 1296)]
    dm = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(dm).polygon([(x * S, y * S) for x, y in poly], fill=(236, 246, 252, 255))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).polygon([(x * S, y * S) for x, y in dome[:20]] + [(574 * S, 1296 * S)], fill=(150, 196, 226, 110))
    dm.alpha_composite(sh)
    img.alpha_composite(dm)
    # floating sea ice: three slabs, 92% under the surface
    for (xa, w) in ((92, 150), (264, 120), (396, 38)):
        th = 42
        top = ys - 0.083 * th
        sl = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(sl)
        sd.rounded_rectangle(sc((xa, top, xa + w, top + th)), 8 * S, fill=(214, 238, 250, 190))
        m = Image.new("L", img.size, 0)
        ImageDraw.Draw(m).rectangle(sc((0, ys, W, H)), fill=255)
        under = ImageChops.multiply(sl.getchannel("A"), m)
        over = ImageChops.subtract(sl.getchannel("A"), under)
        a = Image.merge("RGBA", (*sl.convert("RGB").split(), ImageChops.add(over, under.point(lambda v: int(v * 0.62)))))
        img.alpha_composite(a)
    # meltwater from the ice sheet into the sea — cyan arrows, amber is spent on the rising level above
    for ax in (556, 600):
        d.line(sc((ax, 1316, ax - 22, 1352)), fill=ACCENT + (255,), width=3 * S)
    d.polygon(sc((534, 1354, 548, 1349, 544, 1338)), fill=ACCENT + (255,))
    return img


def main():
    img = ground()

    # table
    tb = Image.fromarray(lin(W * S, (1120 - Y_TABLE) * S, (22, 46, 84, 255), (4, 14, 31, 0)), "RGBA")
    img.alpha_composite(tb, (0, Y_TABLE * S))
    ImageDraw.Draw(img).line(sc((SAFE[0], Y_TABLE, SAFE[2], Y_TABLE)), fill=(120, 168, 210, 150), width=S)

    glasses = [glass(CX[0], False), glass(CX[1], True)]
    for g in glasses:
        img.alpha_composite(reflect(g, Y_TABLE))
    for g in glasses:
        img.alpha_composite(g)

    d = ImageDraw.Draw(img)
    f_mono = F("IBMPlexMono-Bold.ttf", 25)
    f_mono_s = F("IBMPlexMono-Bold.ttf", 22)
    f_head = F("ArchivoBlack-Regular.ttf", 56)
    f_lab = F("IBMPlexSans-Bold.ttf", 28)

    # the level that does not move, and the level that does
    xl_in = CX[0] + IW // 2 + 12
    yl = level_y(H_FLOAT)
    d.line(sc((xl_in, yl, CX[1] - IW // 2 - 12, yl)), fill=INK + (120,), width=S)       # one line through both glasses
    d.line(sc((CX[1] - IW // 2 - 12, level_y(H_SHELF_AFTER), CX[1] + IW // 2 + 12, level_y(H_SHELF_AFTER))), fill=AMBER + (255,), width=4 * S)
    yb = level_y(H_SHELF_BEFORE)
    for xx in range(CX[1] - IW // 2 - 12, CX[1] + IW // 2 + 12, 14):
        d.line(sc((xx, yb, xx + 7, yb)), fill=(255, 255, 255, 190), width=2 * S)
    text(img, (CX[1] + IW // 2 + 18, level_y(H_SHELF_AFTER) - 14), "AFTER", f_mono, AMBER)
    text(img, (CX[1] + IW // 2 + 18, yb - 12), "BEFORE", f_mono_s, (214, 232, 244))
    d.line(sc((CX[0] - IW // 2 - 12, yl, CX[0] + IW // 2 + 12, yl)), fill=INK + (255,), width=3 * S)
    gap = (CX[0] + IW // 2 + CX[1] - IW // 2) // 2
    text(img, (gap, yl - 62), "BEFORE", f_mono_s, (214, 232, 244), anchor="ma")
    text(img, (gap, yl - 36), "= AFTER", f_mono, INK, anchor="ma")

    # labels
    text(img, (465, 292), "DOES MELTING ICE", f_head, INK, "ma")
    text(img, (465, 360), "RAISE THE SEA?", f_head, INK, "ma")
    text(img, (465, 436), "IT DEPENDS WHERE THE ICE IS SITTING", f_mono, DIM, "ma")
    text(img, (CX[0], 478), "ICE IN THE WATER", f_lab, INK, "ma")
    text(img, (CX[1], 478), "ICE ON A SHELF", f_lab, INK, "ma")

    # readouts under the table
    text(img, (CX[0], 1062), "LEVEL AFTER MELT:", f_mono_s, DIM, "ma")
    text(img, (CX[0], 1090), "THE SAME", f_lab, INK, "ma")
    text(img, (CX[1], 1062), "LEVEL AFTER MELT:", f_mono_s, DIM, "ma")
    text(img, (CX[1], 1090), f"UP {RISE:.1f} CM", f_lab, AMBER, "ma")

    # planet-scale band
    text(img, (465, 1186 - 14), "THE SAME RULE, AT PLANET SCALE", f_mono, DIM, "ma")
    planet_band(img)
    text(img, (92, 1388), "SEA ICE", f_lab, INK)
    text(img, (92, 1424), "FLOATS: ALREADY IN THE LEVEL", f_mono_s, (214, 232, 244))
    text(img, (640, 1326), "ICE ON LAND", f_lab, INK)
    text(img, (640, 1362), "ADDS NEW WATER", f_mono_s, ACCENT)

    text(img, (465, 1520), f"SKETCH: 7 CM GLASS, ONE {SIDE:g} CM CUBE, FRESH WATER. LEVELS COMPUTED, NOT PAINTED.", F("IBMPlexMono-Bold.ttf", 17), (104, 134, 166), "ma")

    out = img.convert("RGB").resize((W, H), Image.LANCZOS)
    out.save(HERE / "payoff_frame.png")
    print("wrote", HERE / "payoff_frame.png")


if __name__ == "__main__":
    main()
