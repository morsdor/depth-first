#!/usr/bin/env python3
"""
Globe probe — prepares everything the `globe-probe` composition reads. NOT a reel.

    python3 scripts/globe_probe/prep.py

Inputs (fetched, never committed — see README.md for the curl lines):
    data/world.topo.bathy.200412.3x5400x2700.jpg    NASA Blue Marble NG, December 2004 (global texture)
    data/world.topo.bathy.200412.3x21600x10800.jpg  the same image at 4x (source of the Europe patch)
    data/ne_10m_admin_0_map_units.geojson           Natural Earth 1:10m map units (England is its own unit)

Outputs:
    remotion/public/globe_probe/globe_5400.jpg      the global texture, copied as is
    remotion/public/globe_probe/europe_patch.jpg    a 3600x2220 crop, lon -40..20 / lat 25..62 (60 px/deg)
    remotion/src/reels/data/globeprobe.ts           simplified outlines — GENERATED, never hand-edited

The 21600x10800 image is ~233 Mpx and must never reach the browser: it is past the 16384 maximum
texture size on most GPUs and decodes to ~930 MB. It is cropped here, in Pillow, and only the crop ships.
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None  # the 21600x10800 source trips Pillow's decompression-bomb guard

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
REPO = HERE.parents[1]
PUBLIC = REPO / "remotion" / "public" / "globe_probe"
OUT_TS = REPO / "remotion" / "src" / "reels" / "data" / "globeprobe.ts"

SRC_SMALL = DATA / "world.topo.bathy.200412.3x5400x2700.jpg"
SRC_BIG = DATA / "world.topo.bathy.200412.3x21600x10800.jpg"
SRC_UNITS = DATA / "ne_10m_admin_0_map_units.geojson"

# The patch window, in degrees. The Blue Marble image is equirectangular and its edges are the
# antimeridian and the poles, so pixel = (lon + 180) / 360 * W and (90 - lat) / 180 * H exactly.
# Wide enough that the whole orbit-to-Channel flight stays inside it once the frame is smaller than the patch:
# at 2 s the frame spans about lon -22..+2 / lat 29..59, and anything outside the patch is the 15 px/deg globe.
PATCH = dict(lon0=-40, lon1=20, lat0=25, lat1=62)
# The highlighted units are painted on their own, smaller window so their canvas keeps 120 px/deg.
FILL = dict(lon0=-10, lon1=12, lat0=40, lat1=57)

# Units drawn at fine tolerance: everything the final Channel frame can see, plus the neighbours that
# frame the argument. Everything else is drawn from the coarse world set.
FINE_UNITS = [
    "England", "Scotland", "Wales", "N. Ireland", "Ireland", "France", "Flemish", "Walloon", "Brussels", "Netherlands",
    "Luxembourg", "Germany", "Switzerland", "Spain", "Portugal", "Andorra", "Denmark", "Italy",
    "Monaco", "Jersey", "Guernsey", "Isle of Man",
]
FINE_TOL = 0.010   # degrees, ~1 km — below the 1.86 km/px of the source imagery
WORLD_TOL = 0.060  # ~6 km; the world set is only ever seen from far enough away to hide it
FINE_MIN_EXTENT = 0.03
WORLD_MIN_EXTENT = 0.5


def crop_patch() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SRC_SMALL, PUBLIC / "globe_5400.jpg")
    with Image.open(SRC_BIG) as im:
        W, H = im.size
        assert (W, H) == (21600, 10800), (W, H)
        x0 = round((PATCH["lon0"] + 180) / 360 * W)
        x1 = round((PATCH["lon1"] + 180) / 360 * W)
        y0 = round((90 - PATCH["lat1"]) / 180 * H)
        y1 = round((90 - PATCH["lat0"]) / 180 * H)
        crop = im.crop((x0, y0, x1, y1)).convert("RGB")
    crop.save(PUBLIC / "europe_patch.jpg", quality=92)
    print(f"patch  {crop.size[0]}x{crop.size[1]} px  <- x {x0}:{x1}  y {y0}:{y1}  "
          f"({crop.size[0] / (PATCH['lon1'] - PATCH['lon0']):.0f} px/deg)")


def dp(points: list[tuple[float, float]], tol: float) -> list[tuple[float, float]]:
    """Douglas-Peucker, iterative so a 50,000-point coastline cannot blow the stack."""
    n = len(points)
    if n < 3:
        return points
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        (ax, ay), (bx, by) = points[a], points[b]
        dx, dy = bx - ax, by - ay
        L2 = dx * dx + dy * dy
        best, bi = -1.0, -1
        for i in range(a + 1, b):
            px, py = points[i]
            if L2 == 0:
                d = ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
            else:
                t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / L2))
                d = ((px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2) ** 0.5
            if d > best:
                best, bi = d, i
        if best > tol:
            keep[bi] = True
            stack.append((a, bi))
            stack.append((bi, b))
    return [p for p, k in zip(points, keep) if k]


def rings_of(geom: dict) -> list[list[tuple[float, float]]]:
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    return [[(x, y) for x, y in ring] for poly in polys for ring in poly]


def split_antimeridian(ring: list[tuple[float, float]]) -> list[list[tuple[float, float]]]:
    """Natural Earth cuts polygons at +/-180 and runs the ring along the cut. Drawn on a globe that is a
    visible meridian that is not a border, so break the ring at any segment lying on the cut."""
    runs: list[list[tuple[float, float]]] = [[ring[0]]]
    for a, b in zip(ring, ring[1:]):
        if abs(a[0]) > 179.99 and abs(b[0]) > 179.99 and (a[0] > 0) == (b[0] > 0):
            runs.append([b])
        else:
            runs[-1].append(b)
    return [r for r in runs if len(r) >= 2]


def extent(p: list[tuple[float, float]]) -> float:
    xs, ys = [q[0] for q in p], [q[1] for q in p]
    return max(max(xs) - min(xs), max(ys) - min(ys))


def flat(p: list[tuple[float, float]], nd: int) -> list[float]:
    out: list[float] = []
    for x, y in p:
        out += [round(x, nd), round(y, nd)]
    return out


def build_outlines() -> None:
    feats = json.loads(SRC_UNITS.read_text())["features"]
    by_name = {f["properties"]["NAME"]: f for f in feats}
    missing = [n for n in FINE_UNITS if n not in by_name]
    if missing:
        print("not in the file (skipped):", missing)

    fine: dict[str, list[list[float]]] = {}
    for name in FINE_UNITS:
        if name not in by_name:
            continue
        runs: list[list[float]] = []
        for ring in rings_of(by_name[name]["geometry"]):
            s = dp(ring, FINE_TOL)
            if len(s) >= 4 and extent(s) >= FINE_MIN_EXTENT:
                runs.append(flat(s, 3))
        fine[name] = runs

    world: list[list[float]] = []
    for f in feats:
        name = f["properties"]["NAME"]
        if name in FINE_UNITS or name == "Antarctica":
            continue
        for ring in rings_of(f["geometry"]):
            for run in split_antimeridian(ring):
                s = dp(run, WORLD_TOL)
                if len(s) >= 3 and extent(s) >= WORLD_MIN_EXTENT:
                    world.append(flat(s, 2))

    n_fine = sum(len(r) // 2 for runs in fine.values() for r in runs)
    n_world = sum(len(r) // 2 for r in world)
    print(f"fine   {len(fine)} units, {n_fine} points   world {len(world)} polylines, {n_world} points")

    def js(o) -> str:
        return json.dumps(o, separators=(",", ":"))

    OUT_TS.write_text(
        "// GENERATED by scripts/globe_probe/prep.py — do not edit.\n"
        "// Natural Earth 1:10m map units (public domain), Douglas-Peucker simplified. Flat [lon, lat, lon, lat, ...].\n"
        f"export const PATCH = {js(PATCH)} as const;\n"
        f"export const FILL = {js(FILL)} as const;\n"
        f"/** Fine outlines (tolerance {FINE_TOL} deg) of the units the Channel frame can see. */\n"
        f"export const FINE: Record<string, number[][]> = {js(fine)};\n"
        f"/** Every other unit, coarse (tolerance {WORLD_TOL} deg). Antimeridian cut segments removed. */\n"
        f"export const WORLD: number[][] = {js(world)};\n"
    )
    print(f"wrote  {OUT_TS.relative_to(REPO)}  ({OUT_TS.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    for p in (SRC_SMALL, SRC_BIG, SRC_UNITS):
        assert p.exists(), f"missing {p} — see scripts/globe_probe/README.md"
    crop_patch()
    build_outlines()
