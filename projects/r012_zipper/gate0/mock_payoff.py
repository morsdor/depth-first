"""Gate 0 payoff still for I72 — five minutes in PIL, not a render.

Draws the two jams at the SAME SCALE from the real measured numbers, because the whole
claim is a length comparison and a mock that fudged the scale would prove nothing.
"""
from PIL import Image, ImageDraw

W, H = 1080, 1920
INK, BONE, ASH, FAIL, GRAPHITE = '#040E1F', '#E8E6E1', '#81A2C4', '#FF4D4D', '#274064'

EARLY_M, ZIPPER_M = 1494.0, 477.0      # measured, projects/r012_zipper/merge.py
SCALE = 760.0 / EARLY_M                # px per metre, the SAME for both panels

im = Image.new('RGB', (W, H), INK)
d = ImageDraw.Draw(im)


def panel(y0, label, length_m, two_lane, cars):
    d.text((60, y0 - 46), label, fill=BONE)
    x_cone = 60 + 760
    for k in range(2):
        ly = y0 + k * 46
        d.rectangle([60, ly, x_cone, ly + 38], outline=GRAPHITE)
    d.line([x_cone, y0, x_cone, y0 + 84], fill=FAIL, width=6)
    n = int(cars)
    span = length_m * SCALE
    lanes = (0, 1) if two_lane else (0,)
    for i in range(n):
        lane = lanes[i % len(lanes)]
        cx = x_cone - (i // len(lanes)) * (span / max(n / len(lanes), 1))
        if cx < 60:
            break
        d.rectangle([cx - 11, y0 + lane * 46 + 7, cx - 2, y0 + lane * 46 + 31], fill=BONE)
    d.line([x_cone - span, y0 + 100, x_cone, y0 + 100], fill=FAIL, width=4)
    d.text((x_cone - span, y0 + 112), f'{length_m:,.0f} m of jam', fill=FAIL)


d.text((60, 300), 'SAME TRAFFIC.', fill=BONE)
d.text((60, 340), 'SAME CONE. SAME HOUR.', fill=ASH)
panel(700, 'EVERYONE MERGES EARLY', EARLY_M, False, 177)
panel(1100, 'EVERYONE USES BOTH LANES', ZIPPER_M, True, 152)
d.text((60, 1420), '1,400 CARS AN HOUR EITHER WAY.', fill=BONE)
d.text((60, 1460), 'THE CONE DECIDES HOW FAST.', fill=ASH)
d.text((60, 1490), 'YOU DECIDE HOW LONG.', fill=ASH)

im.save('gate0/payoff_frame.png')
print('gate0/payoff_frame.png')
