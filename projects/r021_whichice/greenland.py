"""Greenland for r021 — real elevation, a real ice mask, baked into one texture and one height grid.

The script (SCRIPT.md, beat B07) shows "Greenland's ice: on land" on a 3D patch of the planet. The container
cannot reach NASA's imagery or NSIDC's ice thickness (RESEARCH.md section 6), so this builds the beat from the two
sources it CAN reach, both free and both already used on this account (r017):

  * AWS Terrain Tiles (Terrarium encoding, **z4**) — elevation. **TRAP, found 2026-10-14 and measured:** over Greenland
    these tiles hold the ICE SURFACE at zoom <= 4 and again at zoom >= 10, but the BEDROCK UNDER THE ICE at zoom 5-9.
    At Summit Station (ice surface 3,216 m) the tiles say z4 3,207 m, z5-z9 about 260 m, z10 3,254 m; at NGRIP (2,917 m)
    z4 2,919 m, z5-z9 -128 m. A mesh built from z6 would have shown a BOWL, the opposite of the beat. z4 is used: it is
    ~3.3 km per pixel at 70 N, coarse for the coast (the texture carries the coast, from Natural Earth) and plenty for a
    smooth ice sheet. It says nothing about the bed, and the bed under the middle of the sheet is below sea level in
    places (which is why the published 7.42 m is "above floatation").
  * Natural Earth 1:10m glaciated areas and land (public domain, via GitHub raw) — the ice mask and the coast.

Outputs (run from the repo root):
  remotion/public/whichice/greenland_tex.jpg   baked colour: hillshaded ice, rock and sea
  projects/r021_whichice/greenland_grid.json   the height grid the mesh is built from (metres, clamped at the sea)

OUTSIDE NUMBERS, checked before anything is written (the r011 rule: be most suspicious when the data agrees with you):
  * the ice SURFACE at five ice-core and camp stations whose heights are published (Summit 3,216 m, EGRIP 2,708 m, NGRIP
    2,917 m, Dye-3 2,490 m, Camp Century 1,886 m), within 5 percent — none of them fitted;
  * the ice sheet is about 1.71 million km^2 and glaciers bring the glaciated area to about 1.8 million;
  * about 80 percent of Greenland's land is under ice.
None of these is fitted. If a bound fails, the script refuses to write.

Needs numpy + Pillow only. Tiles are cached in the scratchpad, not in the repo.
"""
import io
import json
import math
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).parent
REPO = HERE.parents[1]
CACHE = Path("/tmp/claude-0/greenland_tiles")
TEX_OUT = REPO / "remotion" / "public" / "whichice" / "greenland_tex.jpg"
GRID_OUT = HERE / "greenland_grid.json"

Z = 4
N = 2 ** Z
LON0, LON1 = -74.0, -10.0            # the patch
LAT0, LAT1 = 59.5, 83.8
TEX_W, TEX_H = 1600, 1216            # texture pixels: 0.04 deg lon (~1.5 km at 70 N) x 0.02 deg lat (~2.2 km)
GRID_LON_STEP, GRID_LAT_STEP = 0.2, 0.1
V_EXAG_SHADE = 8.0                   # for the hillshade only; the declared exaggeration of the mesh is in WhichIce.tsx
UA = {"User-Agent": "depth-first-r021/1.0 (terrain tiles for a reel; contact in repo)"}


def tile_xy(lon: float, lat: float):
    x = (lon + 180) / 360 * N
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * N
    return x, y


def fetch(xy):
    x, y = xy
    f = CACHE / f"{Z}_{x}_{y}.png"
    if not f.exists():
        url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png"
        for attempt in range(4):
            try:
                req = urllib.request.Request(url, headers=UA)
                f.write_bytes(urllib.request.urlopen(req, timeout=30).read())
                break
            except Exception as e:  # noqa: BLE001
                if attempt == 3:
                    raise
    return xy, np.asarray(Image.open(f).convert("RGB"), dtype=np.float32)


def mosaic():
    CACHE.mkdir(parents=True, exist_ok=True)
    xa, ya = tile_xy(LON0, LAT1)
    xb, yb = tile_xy(LON1, LAT0)
    xs, ys = range(int(xa), int(xb) + 1), range(int(ya), int(yb) + 1)
    print(f"tiles: x {xs.start}..{xs.stop - 1}, y {ys.start}..{ys.stop - 1} = {len(xs) * len(ys)}")
    out = np.zeros((len(ys) * 256, len(xs) * 256), dtype=np.float32)
    with ThreadPoolExecutor(8) as ex:
        for (x, y), rgb in ex.map(fetch, [(x, y) for y in ys for x in xs]):
            out[(y - ys.start) * 256:(y - ys.start + 1) * 256, (x - xs.start) * 256:(x - xs.start + 1) * 256] = \
                rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768          # Terrarium decode, metres
    return out, xs.start, ys.start


def sample(dem, x0, y0, lons, lats):
    """Bilinear sample of the Mercator mosaic at (lons x lats). Returns [len(lats), len(lons)] metres."""
    px = (lons + 180) / 360 * N * 256 - x0 * 256
    py = (1 - np.arcsinh(np.tan(np.radians(lats))) / math.pi) / 2 * N * 256 - y0 * 256
    ix, iy = np.floor(px).astype(int), np.floor(py).astype(int)
    fx, fy = (px - ix)[None, :], (py - iy)[:, None]
    ix = np.clip(ix, 0, dem.shape[1] - 2)
    iy = np.clip(iy, 0, dem.shape[0] - 2)
    a = dem[np.ix_(iy, ix)]
    b = dem[np.ix_(iy, ix + 1)]
    c = dem[np.ix_(iy + 1, ix)]
    d = dem[np.ix_(iy + 1, ix + 1)]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def geojson(name):
    f = CACHE / name
    if not f.exists():
        url = f"https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/{name}"
        f.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read())
    return json.loads(f.read_text())


def raster(features, w, h, keep):
    """Paint polygons into a w x h lon/lat raster (equirectangular over the patch). keep(feature) filters. Holes are cut back out."""
    im = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(im)

    def pt(lon, lat):
        return ((lon - LON0) / (LON1 - LON0) * w, (LAT1 - lat) / (LAT1 - LAT0) * h)

    for ft in features:
        if not keep(ft):
            continue
        g = ft["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            ring = poly[0]
            if max(p[0] for p in ring) < LON0 - 1 or min(p[0] for p in ring) > LON1 + 1 or max(p[1] for p in ring) < LAT0 - 1 or min(p[1] for p in ring) > LAT1 + 1:
                continue
            d.polygon([pt(*p) for p in ring], fill=255)
            for hole in poly[1:]:
                d.polygon([pt(*p) for p in hole], fill=0)
    return np.asarray(im) > 127


def main():
    dem, x0, y0 = mosaic()
    print("mosaic", dem.shape, "elevation range (m):", float(dem.min()), float(dem.max()))
    assert dem.max() > 3000, 'the z4 mosaic must contain the ice surface'

    # ── the height grid the mesh is built from ──
    glon = np.arange(LON0, LON1 + 1e-9, GRID_LON_STEP)
    glat = np.arange(LAT1, LAT0 - 1e-9, -GRID_LAT_STEP)           # north first, like an image
    gh = sample(dem, x0, y0, glon, glat)

    # ── the texture, at its own resolution ──
    tlon = LON0 + (np.arange(TEX_W) + 0.5) / TEX_W * (LON1 - LON0)
    tlat = LAT1 - (np.arange(TEX_H) + 0.5) / TEX_H * (LAT1 - LAT0)
    th = sample(dem, x0, y0, tlon, tlat)

    land = raster(geojson("ne_10m_land.geojson")["features"], TEX_W, TEX_H, lambda f: True)
    ice = raster(geojson("ne_10m_glaciated_areas.geojson")["features"], TEX_W, TEX_H, lambda f: True) & land
    # Natural Earth land is drawn from the full world file, so Canada, Iceland and Svalbard are in it: keep Greenland's by longitude/latitude
    # window and by contiguity with the big island using elevation as a guard is not needed — the patch (-74..-10, 59.5..83.8) holds
    # Greenland, Ellesmere's east tip, Baffin's north-east and Iceland's west edge; the area checks below restrict to Greenland's box.

    # ── outside-number checks (BEFORE writing anything) ──
    kmlat = 111.32
    cell_km2 = (np.cos(np.radians(tlat))[:, None] * kmlat * (LON1 - LON0) / TEX_W) * (kmlat * (LAT1 - LAT0) / TEX_H)
    gl_box = (tlon[None, :] > -74) & (tlon[None, :] < -11) & (tlat[:, None] > 59.5) & (tlat[:, None] < 83.8)
    # exclude the Canadian side (Ellesmere/Baffin) and Iceland by a crude longitude/latitude rule: Greenland lies east of a line from (-73,78.5) to (-45,60)
    west_line = -73 + (78.5 - tlat) / (78.5 - 60.0) * (-45 + 73)
    not_canada = (tlon[None, :] > west_line[:, None] - 2.0) | (tlat[:, None] > 82.2)
    not_iceland = ~((tlon[None, :] > -25) & (tlat[:, None] < 67))
    gr = gl_box & not_canada & not_iceland
    land_km2 = float((cell_km2 * (land & gr)).sum())
    ice_km2 = float((cell_km2 * (ice & gr)).sum())
    max_m = float(th[land & gr].max())
    frac = ice_km2 / land_km2
    print(f"Greenland box: land {land_km2 / 1e6:.2f} M km^2, glaciated {ice_km2 / 1e6:.2f} M km^2 ({frac * 100:.0f} %), highest cell {max_m:.0f} m")
    stations = {"Summit": (72.58, -38.45, 3216), "EGRIP": (75.63, -35.97, 2708), "NGRIP": (75.10, -42.32, 2917),
                "Dye-3": (65.18, -43.83, 2490), "Camp Century": (77.17, -61.13, 1886)}
    st_rows = {}
    for nm, (la, lo, ref) in stations.items():
        v = float(sample(dem, x0, y0, np.array([lo]), np.array([la]))[0, 0])
        st_rows[nm] = {"published_m": ref, "tiles_m": round(v), "error_pct": round((v - ref) / ref * 100, 1)}
        print(f"  {nm:13s} published {ref} m   tiles {v:6.0f} m   {(v - ref) / ref * 100:+5.1f} %")
        assert abs(v - ref) / ref < 0.05, (nm, v, ref)         # the surface, not the bed (the bed would be -90 % or worse)
    assert 1.9e6 < land_km2 < 2.4e6, land_km2            # about 2.17 M km^2
    assert 1.55e6 < ice_km2 < 2.0e6, ice_km2             # ice sheet 1.71 M, plus glaciers: about 1.8 M
    assert 0.70 < frac < 0.90, frac                      # about 80 %
    ice_max = float(th[ice & gr].max())
    print(f"highest ICE surface cell: {ice_max:.0f} m (the sheet's summit is about 3,200 m)")
    assert 3000 < ice_max < 3500, ice_max

    # ── hillshade (light from the north-west, low), in metres on the ground ──
    dx = np.cos(np.radians(tlat))[:, None] * kmlat * 1000 * (LON1 - LON0) / TEX_W
    dy = kmlat * 1000 * (LAT1 - LAT0) / TEX_H
    z = np.maximum(th, 0) * V_EXAG_SHADE
    gy, gx = np.gradient(z, dy, axis=0)[0] if False else (np.gradient(z, axis=0) / dy, np.gradient(z, axis=1) / dx)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(315), math.radians(32)
    shade = np.clip(math.sin(alt) * np.cos(slope) + math.cos(alt) * np.sin(slope) * np.cos(az - aspect), 0, 1)
    shade = 0.35 + 0.65 * (shade - shade.min()) / (np.ptp(shade) + 1e-9)

    # ── colour ──
    img = np.zeros((TEX_H, TEX_W, 3), dtype=np.float32)
    depth = np.clip(-th, 0, 3500) / 3500
    sea = np.array([44, 122, 182], dtype=np.float32)[None, None, :] * (1 - depth[..., None]) + np.array([16, 52, 96], dtype=np.float32)[None, None, :] * depth[..., None]
    rock = np.array([108, 98, 90], dtype=np.float32) * shade[..., None]
    snow = (np.array([236, 244, 250], dtype=np.float32) * (0.62 + 0.38 * shade[..., None]))
    snow[..., 2] = np.minimum(255, snow[..., 2] * 1.04)
    img[:] = sea
    img[land] = rock[land]
    img[ice] = snow[ice]
    # a soft shore: darken a thin band of sea next to the coast so the island separates from the water
    edge = np.asarray(Image.fromarray((land * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.0)), dtype=np.float32) / 255
    shore = np.clip(edge * (1 - land), 0, 1)[..., None]
    img = img * (1 - 0.35 * shore) + np.array([150, 205, 235], dtype=np.float32) * 0.35 * shore
    TEX_OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(TEX_OUT, quality=88, optimize=True)

    # ── the height grid: metres, sea clamped at 0, rounded ──
    GRID_OUT.write_text(json.dumps({
        "lon0": LON0, "lon1": LON1, "lat0": LAT0, "lat1": LAT1,
        "n_lon": int(len(glon)), "n_lat": int(len(glat)),
        "lon_step": GRID_LON_STEP, "lat_step": GRID_LAT_STEP,
        "heights_m": np.round(np.maximum(gh, 0)).astype(int).flatten().tolist(),
        "checks": {"land_km2": land_km2, "glaciated_km2": ice_km2, "glaciated_fraction": frac, "highest_cell_m": max_m, "highest_ice_cell_m": ice_max, "stations": st_rows},
        "source": "AWS Terrain Tiles z6 (Terrarium); Natural Earth 1:10m land and glaciated areas (public domain)",
        "grade": "surface elevation only: over the ice sheet this is the ice surface, NOT the bed",
    }))
    print("wrote", TEX_OUT, f"({TEX_OUT.stat().st_size // 1024} KB)", "and", GRID_OUT, f"({GRID_OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    sys.exit(main())
