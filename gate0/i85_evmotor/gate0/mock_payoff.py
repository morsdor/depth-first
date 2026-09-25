"""Gate 0 artefact for I85 — the payoff frame, drawn once, before any build.

NOT the reel and NOT a render: the five-minute still CLAUDE.md demands so the
concept can be killed for a dollar instead of a day.

Two things on one frame, because the sentence has two halves:
  top    — an electric motor, end-on. The coil brightness and the field arrow are
           COMPUTED from real balanced three-phase currents at one instant, so the
           picture already obeys the physics the build will animate.
  bottom — the same $100 of energy fed to each car. The share that never reaches
           the wheels burns off the bill as heat.

Figures are Gate-0 LEADS (fueleconomy.gov ranges), printed to stdout; Stage 3
fixes one drive cycle and one base before any of them ship.
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
GROUND = (4, 14, 31)
INK = (232, 230, 225)
DIM = (129, 162, 196)
ACCENT = (0x51, 0xA4, 0xFF)   # DOMAIN_ACCENT.languages — §3 "What actually happens when you…"
HEAT = (0xFF, 0x4D, 0x4D)     # failure accent — the energy that is lost
COPPER = (184, 115, 51)
BILL = (156, 178, 140)
BILL_INK = (60, 84, 58)

FONT = "/home/user/depth-first/assets/fonts/"
f_head = ImageFont.truetype(FONT + "ArchivoBlack-Regular.ttf", 46)
f_big = ImageFont.truetype(FONT + "ArchivoBlack-Regular.ttf", 72)
f_lab = ImageFont.truetype(FONT + "IBMPlexSans-Bold.ttf", 38)
f_mono = ImageFont.truetype(FONT + "IBMPlexMono-Bold.ttf", 30)

# ---- figures (LEADS) -------------------------------------------------------
GAS_TO_WHEELS = 0.25   # fueleconomy.gov: 12–30% depending on drive cycle
EV_TO_WHEELS = 0.80    # fueleconomy.gov: ~77% grid-to-wheels, motor+inverter ~80%
print(f"LEAD gas to wheels  {GAS_TO_WHEELS:.0%}  (fueleconomy.gov range 12–30%)")
print(f"LEAD EV  to wheels  {EV_TO_WHEELS:.0%}  (fueleconomy.gov ~77–80%)")
print(f"=> of $100: gas ${100*GAS_TO_WHEELS:.0f} moves the car, ${100*(1-GAS_TO_WHEELS):.0f} is heat;"
      f" EV ${100*EV_TO_WHEELS:.0f} moves the car")

img = Image.new("RGB", (W, H), GROUND)
d = ImageDraw.Draw(img)


def ctext(y, s, font, fill):
    w = d.textlength(s, font=font)
    d.text((465 - w / 2, y), s, font=font, fill=fill)


# ---- the motor: real three-phase field at one instant ----------------------
CX, CY, R_OUT, R_IN, R_ROT = 465, 720, 250, 172, 142
N_SLOTS = 12                        # 12 slots, 3 phases, 2 poles, 60-degree phase belts
WT = math.radians(20)               # electrical angle of the instant drawn
coil_angle = [2 * math.pi * k / N_SLOTS for k in range(N_SLOTS)]
# Standard 60-degree phase-belt winding: belt b (60 deg wide) carries phase p with sign s,
# in the order A+, C-, B+, A-, C+, B-.
BELT = [(0, 1), (2, -1), (1, 1), (0, -1), (2, 1), (1, -1)]
belt = [k // 2 for k in range(N_SLOTS)]   # two slots per belt (integer index: degrees() of 60 is 59.999…)
AXIS_A = math.radians(15)           # phase A's axis is the centre of belt 0
phase = [BELT[bb][0] for bb in belt]
sign = [BELT[bb][1] for bb in belt]
current = [math.cos(WT - 2 * math.pi * p / 3) for p in phase]   # the three real phase currents
drive = [c * sg for c, sg in zip(current, sign)]
field = sum(np.array([math.cos(a), math.sin(a)]) * dv for a, dv in zip(coil_angle, drive))
field_ang = math.atan2(field[1], field[0])          # 2-pole: mechanical = electrical
assert abs(math.remainder(field_ang - WT - AXIS_A, 2 * math.pi)) < math.radians(1), \
    "a balanced 3-phase winding must put the field at wt (+ phase-A axis)"
check = sum(c for c in current)
assert abs(check) < 1e-9, "balanced three-phase currents must sum to zero"
print(f"three-phase currents sum to {check:.1e} (balanced); field points at {math.degrees(field_ang):.1f} deg")

glow = Image.new("RGB", (W, H), (0, 0, 0))
g = ImageDraw.Draw(glow)
# stator ring
d.ellipse([CX - R_OUT, CY - R_OUT, CX + R_OUT, CY + R_OUT], outline=DIM, width=6)
d.ellipse([CX - R_IN + 8, CY - R_IN + 8, CX + R_IN - 8, CY + R_IN - 8], outline=(40, 60, 90), width=3)
for a, c, s in zip(coil_angle, current, sign):
    lit = max(0.0, c * s)                       # coils pushing the field glow
    col = tuple(int(COPPER[i] * (1 - lit) + ACCENT[i] * lit) for i in range(3))
    r0, r1 = R_IN, R_OUT - 22
    half = math.radians(10)
    poly = [(CX + r * math.cos(a + e), CY + r * math.sin(a + e))
            for r, e in [(r0, -half), (r1, -half * 0.8), (r1, half * 0.8), (r0, half)]]
    d.polygon(poly, fill=col)
    if lit > 0.3:
        g.polygon(poly, fill=tuple(int(v * lit) for v in ACCENT))
glow = glow.filter(ImageFilter.GaussianBlur(28))
img = Image.fromarray(np.clip(np.asarray(img, int) + np.asarray(glow, int), 0, 255).astype("uint8"))
d = ImageDraw.Draw(img)

# rotor: one N/S magnet pair, lagging the field slightly (that lag is the torque)
LAG = math.radians(18)
d.ellipse([CX - R_ROT, CY - R_ROT, CX + R_ROT, CY + R_ROT], fill=(22, 36, 60), outline=DIM, width=3)
for k in range(2):
    a = field_ang - LAG + k * math.pi
    col = HEAT if k % 2 == 0 else ACCENT
    col = tuple(int(v * 0.8) for v in col) if k % 2 else (200, 200, 205)
    d.pieslice([CX - R_ROT + 10, CY - R_ROT + 10, CX + R_ROT - 10, CY + R_ROT - 10],
               math.degrees(a) - 70, math.degrees(a) + 70, fill=col)
d.ellipse([CX - 38, CY - 38, CX + 38, CY + 38], fill=(60, 70, 90), outline=INK, width=3)
# field arrow + rotation hint
ex, ey = CX + 120 * math.cos(field_ang), CY + 120 * math.sin(field_ang)
d.line([CX, CY, ex, ey], fill=ACCENT, width=8)
arc_r = R_OUT + 26
d.arc([CX - arc_r, CY - arc_r, CX + arc_r, CY + arc_r],
      math.degrees(field_ang) - 40, math.degrees(field_ang) + 40, fill=ACCENT, width=6)
tip = field_ang + math.radians(40)
tx, ty = CX + arc_r * math.cos(tip), CY + arc_r * math.sin(tip)
d.polygon([(tx + 22 * math.cos(tip + math.pi / 2), ty + 22 * math.sin(tip + math.pi / 2)),
           (tx + 16 * math.cos(tip), ty + 16 * math.sin(tip)),
           (tx - 16 * math.cos(tip), ty - 16 * math.sin(tip))], fill=ACCENT)

# ---- the two $100 bills ----------------------------------------------------
def bill(x0, y0, w, h, keep):
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], 10, fill=BILL, outline=BILL_INK, width=4)
    d.ellipse([x0 + w / 2 - 50, y0 + 20, x0 + w / 2 + 50, y0 + h - 20], outline=BILL_INK, width=4)
    d.text((x0 + 14, y0 + 8), "100", font=f_mono, fill=BILL_INK)
    # the lost share of the bill is gone — only heat rising where it was
    cut = x0 + w * keep
    d.rectangle([cut, y0 - 2, x0 + w + 6, y0 + h + 2], fill=GROUND)
    heat = Image.new("RGB", (W, H), (0, 0, 0))
    hd = ImageDraw.Draw(heat)
    n = max(2, int((1 - keep) * 16))
    for i in range(n):
        xx = cut + (x0 + w - cut) * (i + 0.5) / n
        hd.line([xx, y0 + h, xx + 18 * math.sin(i * 1.7), y0 - 30], fill=HEAT, width=12)
    return heat.filter(ImageFilter.GaussianBlur(12))


BW, BH = 700, 150
bx = 115
rows = [(1095, GAS_TO_WHEELS, "GAS CAR"), (1350, EV_TO_WHEELS, "ELECTRIC CAR")]
heats = [bill(bx, y, BW, BH, keep) for y, keep, _ in rows]   # draw the bills FIRST
arr = np.asarray(img, int)
for h in heats:
    arr = arr + np.asarray(h, int)
img = Image.fromarray(np.clip(arr, 0, 255).astype("uint8"))
d = ImageDraw.Draw(img)
for y, keep, lab in rows:
    d.text((bx, y - 52), lab, font=f_lab, fill=INK)
    kept, lost = f"${100 * keep:.0f}", f"${100 * (1 - keep):.0f}"
    cut = bx + BW * keep
    d.text((bx + 14, y + BH - 100), kept, font=f_big, fill=INK)
    d.text((bx + 14, y + BH + 6), "moves the car", font=f_mono, fill=DIM)
    lw = d.textlength(lost, font=f_big)
    d.text((min(cut + 14, bx + BW - lw), y + BH - 100), lost, font=f_big, fill=HEAT)
    d.text((bx + BW - d.textlength("heat", font=f_mono), y + BH + 6), "heat", font=f_mono, fill=HEAT)

# ---- headline, drawn last so nothing paints over it -------------------------
ctext(290, "$100 OF ENERGY.", f_head, INK)
ctext(352, "HOW MUCH MOVES THE CAR?", f_head, INK)
ctext(1592, "sketch · figures are Gate-0 leads", f_mono, (70, 95, 125))

# safe-area guide, faint
d.rectangle([60, 270, 870, 1540], outline=(30, 45, 70), width=1)
img.save("/home/user/depth-first/gate0/i85_evmotor/gate0/payoff_frame.png")
print("wrote payoff_frame.png")
