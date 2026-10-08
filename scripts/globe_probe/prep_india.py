#!/usr/bin/env python3
"""
Globe probe, India edition — prepares everything the `globe-india` composition reads. NOT a reel.

    python3 scripts/globe_probe/prep_india.py

Inputs (fetched, never committed — see README.md):
    data/world.topo.bathy.200412.3x21600x10800.jpg   NASA Blue Marble NG (India crop, 60 px/deg)
    data/gibs/{delhi,mumbai,indore}_2025-03-05.jpg   NASA GIBS MODIS Terra true colour, 250 m, 3x3 degree windows
    data/gibs/mid_2025-03-05.jpg                     the same layer, lon 68..84 / lat 8..32 at 150 px/deg — the MID tier
    data/ne_10m_admin_1_states_provinces.geojson     Natural Earth states (Delhi, UP, Karnataka, MP + faint context)
    data/ne_10m_admin_0_countries_ind.geojson        Natural Earth countries, INDIA'S POINT OF VIEW
    data/osm/cities_geom.json                        OpenStreetMap relations (ODbL): Mumbai's two districts, Indore district

Outputs:
    remotion/public/globe_probe/india_patch.jpg      2160x2040, lon 64..100 / lat 4..38
    remotion/public/globe_probe/mid.jpg              2400x1875, lon 68..84 / lat 19.5..32 (the cloud band south of 19 N is cropped off)
    remotion/public/globe_probe/city_{delhi,mumbai,indore}.jpg   low-frequency colour taken from the Blue Marble underneath
    remotion/src/reels/data/globeindia.ts            outlines — GENERATED, never hand-edited

Borders. The country outlines are Natural Earth's India point-of-view set (checked 2026-10-06: Gilgit, Muzaffarabad,
Aksai Chin, Leh, Srinagar and Tawang all fall inside India's polygon and no other feature owns them). The states file is de facto: its Jammu & Kashmir and Ladakh units are NOT drawn (they would put a
second, conflicting line inside India's outline). Everything else in it is.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
from prep import dp, extent, flat, rings_of, split_antimeridian  # noqa: E402

Image.MAX_IMAGE_PIXELS = None

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
REPO = HERE.parents[1]
PUBLIC = REPO / "remotion" / "public" / "globe_probe"
OUT_TS = REPO / "remotion" / "src" / "reels" / "data" / "globeindia.ts"

SRC_BIG = DATA / "world.topo.bathy.200412.3x21600x10800.jpg"
STATES = DATA / "ne_10m_admin_1_states_provinces.geojson"
COUNTRIES_IND = DATA / "ne_10m_admin_0_countries_ind.geojson"
OSM = DATA / "osm" / "cities_geom.json"
GIBS_DATE = "2025-03-05"

INDIA_WIN = dict(lon0=64, lon1=100, lat0=4, lat1=38)
CITY_WIN = {  # the bounding boxes requested from GIBS, so a pixel is a known lon/lat
    "delhi": dict(lon0=75.7, lon1=78.7, lat0=27.1, lat1=30.1),
    "mumbai": dict(lon0=71.4, lon1=74.4, lat0=17.6, lat1=20.6),
    "indore": dict(lon0=74.4, lon1=77.4, lat0=21.2, lat1=24.2),
}
# The MID tier sits between the Blue Marble (60 px/deg) and the city windows (455): without it, a frame 150-800 km wide has
# nothing sharp under it and the zooms pass through a blur. The request covered lat 8..32; the part south of 19.5 N is
# cropped off because the day's cloud band lies across Karnataka and the state shot should be cloud-free.
MID_REQ = dict(lon0=68, lon1=84, lat0=8, lat1=32)
MID_WIN = dict(lon0=68, lon1=84, lat0=19.5, lat1=32)
MID_BLUR_PX = 40

# The satellite windows are a different sensor, season and year from the Blue Marble they sit on. Matching per-channel
# mean/std looked fine on paper and turned Mumbai's land purple (the window is half sea, the Blue Marble's is not).
# Instead the LOW-frequency colour is taken from the Blue Marble and the satellite keeps its own detail:
#   out = sat - blur(sat) + blur(blue_marble),  blended by TRANSFER.
BLUR_PX = 30  # of 1366 px per 3 degrees, ~6 km: structure finer than this is the satellite's, broader colour is the Blue Marble's
TRANSFER = 0.85

NEIGHBOURS = ["India", "Pakistan", "Nepal", "Bhutan", "Bangladesh", "Sri Lanka", "Myanmar", "China", "Afghanistan"]
NEIGH_BOX = (60, -2, 106, 42)  # lon0, lat0, lon1, lat1 — China and Afghanistan are drawn only inside this
NOT_DRAWN_STATES = {"Jammu and Kashmir", "Ladakh"}  # de facto units; the India-POV outline already carries the boundary
HL_STATES = {"delhi": "Delhi", "up": "Uttar Pradesh", "karnataka": "Karnataka", "mp": "Madhya Pradesh"}


def crop_imagery() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    with Image.open(SRC_BIG) as im:
        W, H = im.size

        def box(w):
            return (
                round((w["lon0"] + 180) / 360 * W), round((90 - w["lat1"]) / 180 * H),
                round((w["lon1"] + 180) / 360 * W), round((90 - w["lat0"]) / 180 * H),
            )

        india = im.crop(box(INDIA_WIN)).convert("RGB")
        india.save(PUBLIC / "india_patch.jpg", quality=92)
        print(f"india   {india.size[0]}x{india.size[1]} px")
        under = {k: im.crop(box(w)).convert("RGB") for k, w in CITY_WIN.items()}
        under_mid = im.crop(box(MID_WIN)).convert("RGB")

    for k in CITY_WIN:
        sat = Image.open(DATA / "gibs" / f"{k}_{GIBS_DATE}.jpg").convert("RGB")
        base = under[k].resize(sat.size, Image.BICUBIC)
        full = np.asarray(sat, dtype=np.float32)
        low_sat = np.asarray(sat.filter(ImageFilter.GaussianBlur(BLUR_PX)), dtype=np.float32)
        low_base = np.asarray(base.filter(ImageFilter.GaussianBlur(BLUR_PX)), dtype=np.float32)
        out = full + TRANSFER * (low_base - low_sat)
        Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(PUBLIC / f"city_{k}.jpg", quality=92)
        print(f"city    {k}: {sat.size[0]}x{sat.size[1]} px, low-frequency colour from the Blue Marble x{TRANSFER}")


    mid = Image.open(DATA / "gibs" / f"mid_{GIBS_DATE}.jpg").convert("RGB")
    rows = round((MID_REQ["lat1"] - MID_WIN["lat0"]) / (MID_REQ["lat1"] - MID_REQ["lat0"]) * mid.size[1])
    mid = mid.crop((0, 0, mid.size[0], rows))
    base = under_mid.resize(mid.size, Image.BICUBIC)
    full = np.asarray(mid, dtype=np.float32)
    low_s = np.asarray(mid.filter(ImageFilter.GaussianBlur(MID_BLUR_PX)), dtype=np.float32)
    low_b = np.asarray(base.filter(ImageFilter.GaussianBlur(MID_BLUR_PX)), dtype=np.float32)
    Image.fromarray(np.clip(full + TRANSFER * (low_b - low_s), 0, 255).astype(np.uint8)).save(PUBLIC / "mid.jpg", quality=92)
    print(f"mid     {mid.size[0]}x{mid.size[1]} px ({mid.size[0] / (MID_WIN['lon1'] - MID_WIN['lon0']):.0f} px/deg)")


def clip_runs(pts: list[tuple[float, float]], b) -> list[list[tuple[float, float]]]:
    runs: list[list[tuple[float, float]]] = []
    cur: list[tuple[float, float]] = []
    for p in pts:
        if b[0] <= p[0] <= b[2] and b[1] <= p[1] <= b[3]:
            cur.append(p)
        elif cur:
            runs.append(cur)
            cur = []
    if cur:
        runs.append(cur)
    return [r for r in runs if len(r) >= 2]


def stitch(ways: list[list[tuple[float, float]]]) -> list[list[tuple[float, float]]]:
    pool = [w[:] for w in ways]
    rings = []
    while pool:
        cur = pool.pop(0)
        grew = True
        while grew and cur[0] != cur[-1]:
            grew = False
            for i, w in enumerate(pool):
                if w[0] == cur[-1]:
                    cur += w[1:]
                elif w[-1] == cur[-1]:
                    cur += w[::-1][1:]
                elif w[-1] == cur[0]:
                    cur = w[:-1] + cur
                elif w[0] == cur[0]:
                    cur = w[::-1][:-1] + cur
                else:
                    continue
                pool.pop(i)
                grew = True
                break
        rings.append(cur)
    return rings


def osm_outline(rel_ids: list[int], drop_shared: bool) -> list[list[tuple[float, float]]]:
    rels = {r["id"]: r for r in json.loads(OSM.read_text())["elements"]}
    members = {i: [m for m in rels[i]["members"] if m["type"] == "way" and m.get("geometry") and m.get("role") in ("outer", "")] for i in rel_ids}
    shared: set[int] = set()
    if drop_shared and len(rel_ids) > 1:
        seen: set[int] = set()
        for i in rel_ids:
            refs = {m["ref"] for m in members[i]}
            shared |= seen & refs
            seen |= refs
    ways = []
    for i in rel_ids:
        for m in members[i]:
            if m["ref"] not in shared:
                ways.append([(p["lon"], p["lat"]) for p in m["geometry"]])
    rings = stitch(ways)
    closed = [r for r in rings if r[0] == r[-1]]
    print(f"  osm {rel_ids}: {len(ways)} ways ({len(shared)} shared dropped) -> {len(rings)} rings, {len(closed)} closed")
    return closed


def build() -> None:
    states = json.loads(STATES.read_text())["features"]
    indian = [f for f in states if f["properties"].get("admin") == "India"]
    by_name = {f["properties"]["name"]: f for f in indian}

    hl: dict[str, list[list[float]]] = {}
    for k, name in HL_STATES.items():
        hl[k] = [flat(dp(r, 0.004), 4) for r in rings_of(by_name[name]["geometry"])]
    hl["mumbai"] = [flat(dp(r, 0.0003), 5) for r in osm_outline([7964375, 7964376], drop_shared=True)]
    hl["indore"] = [flat(dp(r, 0.0005), 5) for r in osm_outline([1976160], drop_shared=False)]
    for k, v in hl.items():
        print(f"  highlight {k:9s} {len(v)} ring(s), {sum(len(r) // 2 for r in v)} pts")

    faint: list[list[float]] = []
    for f in indian:
        if f["properties"]["name"] in NOT_DRAWN_STATES:
            continue
        for r in rings_of(f["geometry"]):
            s = dp(r, 0.015)
            if len(s) >= 4 and extent(s) >= 0.1:
                faint.append(flat(s, 3))

    countries = json.loads(COUNTRIES_IND.read_text())["features"]
    neigh: list[list[float]] = []
    world: list[list[float]] = []
    for f in countries:
        name = f["properties"]["NAME"]
        for ring in rings_of(f["geometry"]):
            for run in split_antimeridian(ring):
                if name in NEIGHBOURS:
                    for piece in clip_runs(run, NEIGH_BOX):
                        s = dp(piece, 0.012 if name == "India" else 0.03)
                        if len(s) >= 3 and extent(s) >= 0.05:
                            neigh.append(flat(s, 3))
                elif name != "Antarctica":
                    s = dp(run, 0.06)
                    if len(s) >= 3 and extent(s) >= 0.5:
                        world.append(flat(s, 2))

    def n(ls):
        return sum(len(r) // 2 for r in ls)

    print(f"faint states {len(faint)} polylines / {n(faint)} pts   neighbours {len(neigh)} / {n(neigh)}   world {len(world)} / {n(world)}")

    def js(o):
        return json.dumps(o, separators=(",", ":"))

    OUT_TS.write_text(
        "// GENERATED by scripts/globe_probe/prep_india.py — do not edit.\n"
        "// Natural Earth 1:10m (public domain; country outlines from INDIA'S point of view), and OpenStreetMap relations\n"
        "// for Mumbai and Indore (ODbL — '© OpenStreetMap contributors' must be on screen with them).\n"
        f"export const INDIA_WIN = {js(INDIA_WIN)} as const;\n"
        f"export const MID_WIN = {js(MID_WIN)} as const;\n"
        f"export const CITY_WIN = {js(CITY_WIN)} as const;\n"
        f"export const HL: Record<'delhi' | 'up' | 'karnataka' | 'mp' | 'mumbai' | 'indore', number[][]> = {js(hl)};\n"
        f"/** Every Indian state except J&K and Ladakh, drawn faintly for context. */\nexport const STATES: number[][] = {js(faint)};\n"
        f"/** India and its neighbours (India POV), clipped to lon 60..106 / lat -2..42. */\nexport const NEIGH: number[][] = {js(neigh)};\n"
        f"/** All other countries, coarse. */\nexport const WORLD: number[][] = {js(world)};\n"
    )
    print(f"wrote {OUT_TS.relative_to(REPO)} ({OUT_TS.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    for p in (SRC_BIG, STATES, COUNTRIES_IND, OSM):
        assert p.exists(), f"missing {p} — see scripts/globe_probe/README.md"
    crop_imagery()
    build()
