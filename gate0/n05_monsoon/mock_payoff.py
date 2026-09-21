"""Gate 0 payoff-frame mock for N5 (monsoon). Five-minute sketch, not a render.

The India outline and the onset field are hand-approximated on purpose -- Gate 0 asks
whether the sentence CAN be shown, not whether this particular picture is correct.
Real IMD normal-onset isochrones replace both at build time.
"""

from PIL import Image, ImageDraw, ImageFont
import math

W, H = 1920, 1080
GROUND = (12, 14, 18)
WALL = (232, 226, 214)
DRY = (150, 120, 92)
TEXT = (238, 234, 226)
MUTED = (140, 146, 156)

# Rough India outline, clockwise from Kutch. Approximate by design.
INDIA = [
    (68.2, 23.7), (68.8, 22.3), (70.0, 20.8), (72.6, 21.5), (72.9, 19.1),
    (73.5, 15.9), (74.9, 12.9), (76.0, 10.0), (77.5, 8.1), (79.9, 10.3),
    (80.3, 13.1), (82.3, 16.9), (84.8, 19.1), (86.9, 20.9), (88.1, 21.7),
    (89.1, 22.0), (89.7, 25.3), (88.1, 26.5), (89.9, 26.9), (92.0, 26.9),
    (94.7, 27.5), (96.4, 27.7), (95.3, 29.0), (92.5, 28.1), (88.9, 27.3),
    (88.2, 26.8), (84.6, 27.4), (81.0, 30.1), (78.8, 31.4), (76.8, 32.8),
    (75.0, 34.6), (74.0, 34.3), (73.9, 32.8), (74.6, 31.0), (73.0, 29.8),
    (70.6, 27.9), (69.5, 24.3),
]

LON0, LON1, LAT0, LAT1 = 66.0, 98.0, 5.0, 37.5
PAD_X, PAD_Y = 560, 70
SCALE = min((W - 2 * PAD_X) / (LON1 - LON0), (H - 2 * PAD_Y) / (LAT1 - LAT0))


def project(lon, lat):
    x = PAD_X + (lon - LON0) * SCALE
    y = H - PAD_Y - (lat - LAT0) * SCALE
    return x, y


def onset_day(lon, lat):
    """Approximate days after 1 June. Two branches, as the real monsoon has."""
    arabian = 1.0 + (lat - 8.0) * 1.05 + max(0.0, lon - 76.0) * 0.55
    # the arid northwest is reached last, not first
    arabian += max(0.0, 74.0 - lon) * max(0.0, lat - 24.0) * 1.0
    bay = 5.0 + max(0.0, 95.0 - lon) * 1.15 + max(0.0, lat - 27.0) * 2.0
    if lat < 20.0:
        bay += 26.0
    return max(0.0, min(arabian, bay))


def ramp(day):
    """Deep monsoon blue -> pale exhausted green as the season runs out."""
    t = max(0.0, min(1.0, day / 38.0))
    r = int(26 + t * 168)
    g = int(104 + t * 92)
    b = int(168 - t * 52)
    return (r, g, b)


def font(size, bold=False):
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
        else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


img = Image.new("RGB", (W, H), GROUND)
d = ImageDraw.Draw(img)

poly = [project(lon, lat) for lon, lat in INDIA]

# Fill India by onset day, clipped to the outline via a mask.
mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(mask).polygon(poly, fill=255)
field = Image.new("RGB", (W, H), GROUND)
fd = ImageDraw.Draw(field)
xs = [p[0] for p in poly]
ys = [p[1] for p in poly]
STEP = 3
for py in range(int(min(ys)), int(max(ys)) + 1, STEP):
    for px in range(int(min(xs)), int(max(xs)) + 1, STEP):
        lon = LON0 + (px - PAD_X) / SCALE
        lat = LAT0 + (H - PAD_Y - py) / SCALE
        fd.rectangle([px, py, px + STEP, py + STEP], fill=ramp(onset_day(lon, lat)))
img.paste(field, (0, 0), mask)

d.polygon(poly, outline=(58, 66, 78))

# The Himalayan wall -- the thing the video is actually about.
wall = [(73.5, 33.9), (76.5, 32.4), (79.5, 30.9), (82.5, 29.6), (85.5, 28.4),
        (88.5, 27.6), (91.5, 27.4), (94.5, 27.8)]
wpts = [project(lon, lat) for lon, lat in wall]
for w, col in ((13, (40, 34, 28)), (7, WALL)):
    d.line(wpts, fill=col, width=w, joint="curve")

# Dry northern air, pressing down and getting nowhere.
for i in range(9):
    lon = 74.0 + i * 2.6
    x, y = project(lon, 36.4)
    d.line([(x, y), (x, y + 46)], fill=DRY, width=3)
    d.polygon([(x - 7, y + 46), (x + 7, y + 46), (x, y + 62)], fill=DRY)
d.text((project(74.0, 37.0)[0], project(74.0, 37.0)[1] - 34),
       "DRY  COLD  AIR  FROM  THE  NORTH", font=font(23, True), fill=DRY)

# Copy. Read this column alone -- it has to be a complete thought.
d.text((80, 300), "THE MONSOON ISN'T", font=font(60, True), fill=MUTED)
d.text((80, 372), "INDIA HEATING UP.", font=font(60, True), fill=MUTED)
d.text((80, 486), "IT'S THAT WALL", font=font(76, True), fill=TEXT)
d.text((80, 572), "HOLDING THE", font=font(76, True), fill=TEXT)
d.text((80, 658), "DRY AIR OUT.", font=font(76, True), fill=(228, 168, 64))

d.text((80, 810), "Colour = normal monsoon onset date", font=font(26), fill=MUTED)
d.text((80, 848), "1 June (Kerala)  ->  8 July (west Rajasthan)", font=font(26), fill=MUTED)
d.text((80, 928), "SKETCH -- outline and onset field approximated.", font=font(21), fill=(96, 102, 112))
d.text((80, 958), "Real IMD isochrones replace both at build.", font=font(21), fill=(96, 102, 112))

img.save("/Users/mritunjaymohitesh/dev/depth-first/gate0/n05_monsoon/payoff_frame.png")
print("wrote payoff_frame.png")
print(f"onset Kerala tip  (77.5, 8.5): {onset_day(77.5, 8.5):5.1f} days after 1 Jun")
print(f"onset Mumbai      (72.9, 19.1): {onset_day(72.9, 19.1):5.1f}")
print(f"onset Kolkata     (88.4, 22.6): {onset_day(88.4, 22.6):5.1f}")
print(f"onset Delhi       (77.2, 28.6): {onset_day(77.2, 28.6):5.1f}")
print(f"onset W Rajasthan (70.5, 27.5): {onset_day(70.5, 27.5):5.1f}")
