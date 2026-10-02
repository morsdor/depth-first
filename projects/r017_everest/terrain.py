"""r017 · I86 — the mountain: real elevation around Everest's summit, for the 3D mesh.

    python3 terrain.py

Source: AWS Terrain Tiles ("terrarium" encoding, Mapzen/joerd; free, attribution to their
SRTM/GMTED/NED sources), zoom 12, a 3x3 block of tiles around the summit, cached in data/.
Output: a GRID x GRID height field in metres over a square SPAN_KM wide, centred on the summit.

What is asserted:
  * the DEM's highest point lies within 300 m (horizontal) of the surveyed summit coordinate;
  * the DEM summit is within 150 m of the 2020 survey (8,848.86 m) — a 30-m-class DEM always reads
    a sharp peak low; the number ON SCREEN is the survey, never this grid;
  * the summit limestone cap (cells at or above the Qomolangma detachment, 8,520 m) exists and is
    contiguous with the summit.
"""
import io
import json
import math
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
CACHE = HERE / "data" / "everest_z12.npy"
SUMMIT = (27.98817, 86.92502)            # lat, lon
SURVEY_M = 8848.86
DETACHMENT_M = 8520                      # Qomolangma detachment, base of the summit limestone (Sakai 2005)
Z = 12
SPAN_KM = 12.0
GRID = 161


def tile_xy(lat, lon, z):
    n = 2 ** z
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


fx, fy = tile_xy(*SUMMIT, Z)
ix, iy = int(fx), int(fy)
if CACHE.exists():
    block = np.load(CACHE).astype(float)
else:
    block = None
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            u = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{ix + dx}/{iy + dy}.png"
            im = np.asarray(Image.open(io.BytesIO(urllib.request.urlopen(u, timeout=30).read())).convert("RGB")).astype(float)
            h = im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768
            n = h.shape[0]
            if block is None:
                block = np.zeros((3 * n, 3 * n))
            block[(dy + 1) * n:(dy + 2) * n, (dx + 1) * n:(dx + 2) * n] = h
    np.save(CACHE, block.astype(np.float32))

npx = block.shape[0] // 3                               # pixels per tile
# pixel position of the surveyed summit inside the 3x3 block
sx, sy = (fx - ix + 1) * npx, (fy - iy + 1) * npx
tile_km = 40075.016686 * math.cos(math.radians(SUMMIT[0])) / 2 ** Z
km_per_px = tile_km / npx

# DEM peak near the survey point
r = int(1.0 / km_per_px)
win = block[int(sy) - r:int(sy) + r, int(sx) - r:int(sx) + r]
py, pxl = np.unravel_index(win.argmax(), win.shape)
peak_off_km = math.hypot(pxl + int(sx) - r - sx, py + int(sy) - r - sy) * km_per_px
dem_peak = float(win.max())

# resample a GRID x GRID field centred on the DEM peak (bilinear)
cy, cx = py + int(sy) - r, pxl + int(sx) - r
half = SPAN_KM / 2 / km_per_px
ys = np.linspace(cy - half, cy + half, GRID)
xs = np.linspace(cx - half, cx + half, GRID)
y0, x0 = np.floor(ys).astype(int), np.floor(xs).astype(int)
wy, wx = (ys - y0)[:, None], (xs - x0)[None, :]
B = block
H = (B[np.ix_(y0, x0)] * (1 - wy) * (1 - wx) + B[np.ix_(y0 + 1, x0)] * wy * (1 - wx)
     + B[np.ix_(y0, x0 + 1)] * (1 - wy) * wx + B[np.ix_(y0 + 1, x0 + 1)] * wy * wx)

checks = []


def check(text, cond):
    assert cond, f"TERRAIN CHECK FAILED: {text}"
    checks.append(text)


check(f"DEM peak sits {peak_off_km * 1000:.0f} m from the surveyed summit (≤ 300 m)", peak_off_km <= 0.3)
check(f"DEM summit {dem_peak:.0f} m is within 150 m of the survey's {SURVEY_M} m", SURVEY_M - 150 <= dem_peak <= SURVEY_M)
cap = H >= DETACHMENT_M
from scipy import ndimage
lab, n = ndimage.label(cap)
centre = lab[GRID // 2, GRID // 2]
check(f"the summit cell is inside the summit-limestone cap ({int(cap.sum())} cells ≥ {DETACHMENT_M} m)", centre > 0)
main = int((lab == centre).sum())
others = [int((lab == k).sum()) for k in range(1, n + 1) if k != centre]
# A second, smaller piece is expected: the DEM ridge dips below 8,520 m and rises again nearby.
# The reel paints amber only on the summit's own piece, so the claim is about that piece.
check(f"the summit's own piece holds {main} of {int(cap.sum())} cap cells (≥ 80%); other pieces {others}",
      main >= 0.8 * cap.sum())
cap_main = lab == centre

out = dict(source="AWS Terrain Tiles (terrarium), z12", span_km=SPAN_KM, grid=GRID,
           dem_peak_m=round(dem_peak, 1), survey_m=SURVEY_M, detachment_m=DETACHMENT_M,
           min_m=round(float(H.min()), 1), cap=[int(v) for v in cap_main.ravel().nonzero()[0]], heights=[int(round(v)) for v in H.ravel()])
(HERE / "terrain.json").write_text(json.dumps(out, separators=(",", ":")))
for c in checks:
    print("  ✓", c)
print(f"grid {GRID}x{GRID} over {SPAN_KM} km · {km_per_px * 1000:.1f} m/px source · min {H.min():.0f} m · cap pieces {n}")
