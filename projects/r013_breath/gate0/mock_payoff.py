"""Gate 0 payoff still for I81 — "when you lose weight, you breathe it out."

NOT a render. A five-minute PIL still whose only job is to let a human answer:
does the sentence survive being shown, and is the object (a person breathing,
a bathroom scale) actually recognisable with the sound off?

The 84% / 16% split and the framing ("not sweat, not the toilet, not 'turned
into energy'") are the LEAD figures already sitting in backlog/open.md's I81
row, sourced to Meerman & Brown, BMJ 2014. NOT yet independently verified —
that is Stage 3's job. This mock exists to test the SENTENCE and the OBJECT,
not to ship a number.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, SAFE_W = 270, 1540, 60, 810
GROUND = "#040E1F"
GRID = "#0C1522"
INK, DIM, LINE = "#E8E6E1", "#7C93B8", "#274064"
ACCENT = "#51A4FF"   # DOMAIN_ACCENT.languages — §3 What actually happens when you...
SKIN = "#2A3B54"


def font(sz, bold=False):
    candidates = (
        ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if bold else
        ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    ) + [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, sz)
        except OSError:
            continue
    return ImageFont.load_default()


def mono(sz):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
              "/System/Library/Fonts/Menlo.ttc"):
        try:
            return ImageFont.truetype(p, sz)
        except OSError:
            continue
    return font(sz)


img = Image.new("RGB", (W, H), GROUND)
d = ImageDraw.Draw(img)
for gx in range(0, W, 54):
    d.line([(gx, 0), (gx, H)], fill=GRID)
for gy in range(0, H, 54):
    d.line([(0, gy), (W, gy)], fill=GRID)

# ── headline ─────────────────────────────────────────────────────────────
d.text((SIDE, SAFE_TOP + 10), "YOU DON'T SWEAT FAT OFF.", font=font(58, True), fill=INK)
d.text((SIDE, SAFE_TOP + 90), "YOU BREATHE IT OUT.", font=font(58, True), fill=ACCENT)

# ── a person, in profile, exhaling — the recognisable object ───────────────
cx, cy = SIDE + 200, 820   # head centre
head_r = 110
d.ellipse([cx - head_r, cy - head_r, cx + head_r, cy + head_r], fill=SKIN, outline=LINE, width=3)
# a simple nose + mouth on the right edge of the profile, facing right
d.polygon([(cx + head_r - 15, cy - 10), (cx + head_r + 34, cy + 6), (cx + head_r - 15, cy + 26)],
          fill=SKIN, outline=LINE)
d.line([(cx + head_r - 22, cy + 46), (cx + head_r + 6, cy + 50)], fill=LINE, width=4)
# shoulders
d.rounded_rectangle([cx - 190, cy + head_r - 10, cx + 190, cy + head_r + 260], radius=60,
                     fill=SKIN, outline=LINE, width=3)

# breath cloud drifting right out of the mouth — soft translucent puffs
cloud_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cd = ImageDraw.Draw(cloud_layer)
puffs = [
    (cx + 260, cy + 10, 70, 210), (cx + 360, cy - 30, 90, 190),
    (cx + 480, cy - 60, 110, 165), (cx + 620, cy - 90, 130, 140),
    (cx + 780, cy - 110, 150, 110),
]
for i, (px, py, r, alpha) in enumerate(puffs):
    cd.ellipse([px - r, py - r, px + r, py + r], fill=(81, 164, 255, alpha))
img.paste(Image.alpha_composite(img.convert("RGBA"), cloud_layer).convert("RGB"), (0, 0))
d = ImageDraw.Draw(img)

d.text((cx + 560, cy - 220), "84%", font=font(90, True), fill=ACCENT, anchor="mm")
d.text((cx + 560, cy - 150), "leaves as CO2,", font=font(30), fill=INK, anchor="mm")
d.text((cx + 560, cy - 112), "through your lungs", font=font(30), fill=INK, anchor="mm")

# ── a bathroom scale, the second recognisable object ────────────────────────
sc_x0, sc_y0, sc_x1, sc_y1 = SIDE + 20, 1220, SIDE + 380, 1360
d.rounded_rectangle([sc_x0, sc_y0, sc_x1, sc_y1], radius=24, fill="#0C1830", outline=LINE, width=3)
d.text(((sc_x0 + sc_x1) // 2, (sc_y0 + sc_y1) // 2 - 10), "142", font=font(64, True), fill=INK, anchor="mm")
d.text(((sc_x0 + sc_x1) // 2, sc_y1 + 34), "lbs, down from 158", font=mono(26), fill=DIM, anchor="ma")

# arrow from the scale up toward the breath cloud
d.line([(sc_x0 + 180, sc_y0 - 10), (cx + 60, cy + 140)], fill=ACCENT, width=4)
d.polygon([(cx + 40, cy + 150), (cx + 80, cy + 150), (cx + 60, cy + 110)], fill=ACCENT)

d.text((SIDE, 1440), "not sweat. not the toilet. not \"turned into energy.\"",
       font=font(30), fill=DIM)
d.text((SIDE, 1486), "the missing mass leaves through your breath.",
       font=font(34, True), fill=INK)

out = Path(__file__).parent / "payoff_frame.png"
img.save(out)
print(f"wrote {out}")
