#!/usr/bin/env python3
"""I53 — where the water was always going to end up. Bengaluru.

Real terrain, real hydrology, no illustration:

  * DEM  — SRTM 1-arcsec (~30 m) from the AWS open-data skadi endpoint. NASA
           SRTM is US Government work and public domain: no key, no attribution
           gate, nothing to re-source later the way r007 had to.
  * fill — priority-flood depression filling (Barnes et al.), so water is not
           trapped in one-pixel pits that are really DEM noise.
  * flow — D8 steepest descent, diagonals weighted by 1/sqrt(2).
  * acc  — flow accumulation by draining cells in descending filled elevation.

Then the only thing that matters at Gate 0: do Bengaluru's REPORTED flood spots
sit where this says the water goes? Answered against random city points, so the
comparison can come out the wrong way.
"""
import gzip, heapq, os, urllib.request
import numpy as np

LON0, LON1, LAT0, LAT1 = 77.45, 77.80, 12.82, 13.12
S = 3600                                   # samples per degree, SRTM 1-arcsec
CACHE = '/tmp/srtm'


def hgt(name):
    p = f'{CACHE}/{name}.hgt'
    if not os.path.exists(p):
        os.makedirs(CACHE, exist_ok=True)
        url = ('https://s3.amazonaws.com/elevation-tiles-prod/skadi/'
               f'{name[:3]}/{name}.hgt.gz')
        req = urllib.request.Request(url, headers={
            'User-Agent': 'depthfirst-reel-research/1.0'})
        open(p, 'wb').write(gzip.decompress(
            urllib.request.urlopen(req, timeout=120).read()))
    a = np.frombuffer(open(p, 'rb').read(), dtype='>i2').astype(np.float32)
    n = int(round(len(a) ** 0.5))
    return a.reshape(n, n)


def sample(lat, lon):
    """Row/col into the mosaic below, for a real-world coordinate."""
    return int(round((LAT1 - lat) * S)), int(round((lon - LON0) * S))


# ── mosaic: row 0 is the NORTH edge of the window ───────────────────────────
rows = []
for band_lat in range(int(LAT1), int(LAT0) - 1, -1):
    t = hgt(f'N{band_lat:02d}E{int(LON0):03d}')       # covers band_lat..+1
    top = max(0, int(round((band_lat + 1 - LAT1) * S)))
    bot = min(S, int(round((band_lat + 1 - LAT0) * S)))
    rows.append(t[top:bot, :])
dem = np.vstack(rows)
c0 = int(round((LON0 - int(LON0)) * S))
dem = dem[:, c0:c0 + int(round((LON1 - LON0) * S))]
H, W = dem.shape
print(f'DEM {W}x{H} cells  ({dem.min():.0f}..{dem.max():.0f} m, '
      f'relief {dem.max()-dem.min():.0f} m)')

# ── priority-flood depression fill ──────────────────────────────────────────
filled = np.full((H, W), np.inf, dtype=np.float32)
q = []
for r in range(H):
    for c in (0, W - 1):
        filled[r, c] = dem[r, c]; heapq.heappush(q, (dem[r, c], r, c))
for c in range(W):
    for r in (0, H - 1):
        if filled[r, c] == np.inf:
            filled[r, c] = dem[r, c]; heapq.heappush(q, (dem[r, c], r, c))
N8 = ((-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1))
while q:
    e, r, c = heapq.heappop(q)
    if e > filled[r, c]:
        continue
    for dr, dc in N8:
        rr, cc = r + dr, c + dc
        if 0 <= rr < H and 0 <= cc < W and filled[rr, cc] == np.inf:
            v = max(dem[rr, cc], e)
            filled[rr, cc] = v
            heapq.heappush(q, (v, rr, cc))
sunk = filled - dem
print(f'filled {int((sunk > 0.5).sum()):,} cells; deepest bowl '
      f'{sunk.max():.1f} m below its own rim')

# ── D8 direction, then accumulation in descending filled elevation ──────────
acc = np.ones((H, W), dtype=np.float64)
order = np.argsort(filled, axis=None)[::-1]
INV = 1.0 / np.sqrt(2.0)
for idx in order:
    r, c = divmod(int(idx), W)
    best, br, bc = 0.0, -1, -1
    for dr, dc in N8:
        rr, cc = r + dr, c + dc
        if not (0 <= rr < H and 0 <= cc < W):
            continue
        drop = (filled[r, c] - filled[rr, cc]) * (INV if dr and dc else 1.0)
        if drop > best:
            best, br, bc = drop, rr, cc
    if br >= 0:
        acc[br, bc] += acc[r, c]

np.save('/tmp/blr_acc.npy', acc)
np.save('/tmp/blr_dem.npy', dem)
np.save('/tmp/blr_sunk.npy', sunk)

# ── THE GATE TEST ───────────────────────────────────────────────────────────
# Places Bengaluru reports flooded, every monsoon, by name. Coordinates typed
# by hand from the junction each headline names.
SPOTS = {
    'Silk Board junction':      (12.9172, 77.6229),
    'Bellandur':                (12.9304, 77.6784),
    'Koramangala (Ejipura)':    (12.9352, 77.6245),
    'Marathahalli bridge':      (12.9591, 77.6974),
    'Hebbal flyover':           (13.0358, 77.5970),
    'Yemalur':                  (12.9430, 77.6690),
    'KR Market':                (12.9634, 77.5760),
    'Sirsi Circle underpass':   (12.9612, 77.5713),
}
la = np.log10(acc)
pct = lambda v: float((la < v).mean() * 100.0)
print('\nflow-accumulation percentile at each REPORTED flood spot')
print('(100 = more water converges here than anywhere else in the window)')
vals = []
for name, (lat, lon) in SPOTS.items():
    r, c = sample(lat, lon)
    win = la[max(0,r-5):r+6, max(0,c-5):c+6].max()   # ~150 m, DEM georef slop
    vals.append(pct(win))
    print(f'  {name:26s} {pct(win):5.1f}')
rng = np.random.default_rng(20260910)
rr = rng.integers(0, H, 4000); rc = rng.integers(0, W, 4000)
ctrl = [pct(la[max(0,r-5):r+6, max(0,c-5):c+6].max()) for r, c in
        zip(rr[:400], rc[:400])]
print(f'\n  reported flood spots  median percentile {np.median(vals):5.1f}  '
      f'(n={len(vals)})')
print(f'  random city points    median percentile {np.median(ctrl):5.1f}  '
      f'(n={len(ctrl)})')
print(f'\n  VERDICT: {"terrain predicts them" if np.median(vals) > np.median(ctrl) + 15 else "IT DOES NOT — kill the idea"}')
