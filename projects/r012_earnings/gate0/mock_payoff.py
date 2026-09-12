"""Gate 0 payoff still for I84 — "most people's pay peaks in their late 40s,
and it doesn't come back."

NOT a render. A five-minute PIL still whose only job is to let a human answer:
does the sentence survive being shown, and is the self-relevant age-counter
mechanism (not a recognisable object) actually enough to carry it?

Honesty about what is real and what is not, per GATE0.md §5-7:
  * The CURVE SHAPE (rise through the 20s-40s, peak in the mid-to-late 40s,
    plateau, then decline) is the qualitative finding repeated across the
    longitudinal life-cycle-earnings literature (Guvenen 2021 Econometrica;
    Guvenen, Kaplan, Song & Weidner 2022 AEJ:Applied) — real research, not
    invented, but the exact numbers below are an ILLUSTRATIVE parametric
    curve calibrated to that shape, NOT yet the actual computed dataset.
  * Getting the real, individually-tracked (longitudinal) dataset — PSID or
    NLSY are the live candidates — is an OPEN ITEM for Stage 3, named in
    GATE0.md §7. This mock does not pretend otherwise: the peak age and the
    dollar figures on this frame are placeholders for a human judging the
    SENTENCE and the FORMAT, not a claim ready to ship.
  * This is the same "mock now, compute for real later" split r005's own
    mock_payoff.py used for the great-circle distance before the full build.
"""
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, SAFE_W = 270, 1540, 60, 810
GROUND = "#040E1F"
GRID = "#0C1522"
INK, DIM, LINE = "#E8E6E1", "#81A2C4", "#274064"
ACCENT = "#AD88FF"   # DOMAIN_ACCENT.data — §1 Things you touch every day


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


# ── the illustrative career curve — SEE DOCSTRING: shape is real, numbers are
# placeholders pending Stage 3's real longitudinal dataset. ──────────────────
AGE = np.arange(22, 66)
PEAK_AGE = 48
rise = 1 / (1 + np.exp(-(AGE - 32) / 5.5))          # climbs through 20s-30s
decline = np.where(AGE > PEAK_AGE, (AGE - PEAK_AGE) * 0.018, 0.0)  # slow fade after peak
EARN = np.clip(rise - decline, 0.02, None)
EARN = EARN / EARN.max()
PEAK_IDX = int(np.argmax(EARN))
END_LEVEL = EARN[-1]

img = Image.new("RGB", (W, H), GROUND)
d = ImageDraw.Draw(img)
for gx in range(0, W, 54):
    d.line([(gx, 0), (gx, H)], fill=GRID)
for gy in range(0, H, 54):
    d.line([(0, gy), (W, gy)], fill=GRID)

# ── headline ─────────────────────────────────────────────────────────────
d.text((SIDE, SAFE_TOP + 10), "Your pay peaks", font=font(66, True), fill=INK)
d.text((SIDE, SAFE_TOP + 96), "in your late 40s.", font=font(66, True), fill=ACCENT)

# ── the earnings line, one career, age on the x-axis ───────────────────────
PX0, PX1 = SIDE, SIDE + SAFE_W
PY0, PY1 = 720, 1180  # top / bottom of the plot, in canvas y
xs = PX0 + (PX1 - PX0) * (AGE - AGE[0]) / (AGE[-1] - AGE[0])
ys = PY1 - (PY1 - PY0) * EARN
d.line([(PX0, PY1), (PX1, PY1)], fill=LINE, width=2)  # baseline

pts = list(zip(xs.tolist(), ys.tolist()))
d.line(pts, fill=ACCENT, width=6, joint="curve")

# peak marker
pkx, pky = pts[PEAK_IDX]
d.ellipse([pkx - 9, pky - 9, pkx + 9, pky + 9], fill=INK)
d.text((pkx, pky - 34), f"age {PEAK_AGE}", font=mono(30), fill=INK, anchor="mb")

# faint horizontal line at peak height, running to the end, so the "never
# gets that high again" claim is visible rather than asserted
d.line([(pkx, pky), (PX1, pky)], fill="#3E3455", width=2)
endx, endy = pts[-1]
d.line([(endx, pky), (endx, endy)], fill=ACCENT, width=2)
d.text((PX1, pky - 34), "never again this high", font=font(28), fill=DIM, anchor="ra")

d.text((PX0, PY1 + 20), "age 22", font=mono(28), fill=DIM)
d.text((PX1, PY1 + 20), "age 65", font=mono(28), fill=DIM, anchor="ra")

# ── the age counter — the mechanism this concept is actually testing ───────
d.text((SIDE, 1290), "YOUR AGE", font=mono(30), fill=DIM)
d.text((SIDE, 1330), "41", font=font(120, True), fill=INK)
d.text(
    (SIDE + 260, 1400),
    "7 years from the peak.\nStill climbing, or already past it?",
    font=font(34), fill=DIM,
)

d.text(
    (SIDE, 1478),
    "one person, tracked over their career — not a snapshot of different people",
    font=font(23), fill=DIM,
)
d.line([(SIDE, SAFE_BOT), (SIDE + SAFE_W, SAFE_BOT)], fill=LINE, width=2)

out = Path(__file__).parent / "payoff_frame.png"
img.save(out)
print(f"""wrote {out}

  ILLUSTRATIVE curve only (see docstring) — peak placed at age {PEAK_AGE},
  ends at {END_LEVEL:.0%} of peak. Real numbers are a Stage 3 task: the
  actual peak age and post-peak shape must come from a genuinely
  longitudinal dataset (PSID / NLSY candidates), not this parametric mock.
""")
