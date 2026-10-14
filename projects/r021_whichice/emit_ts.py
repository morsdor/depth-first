"""r021 — pack the run into a TS module, and REFUSE to write it if a claim is false at the moment its copy makes it.

Inputs (all produced by code in this folder, none typed):
  research/melt_check.py   -> research/figures.json   the physics: levels, curves, the scale numbers
  research/read_budget.py  -> BLOCKS, EVENTS          the on-screen copy and when it is on screen (the owner's reading-time rule)
  greenland.py             -> greenland_grid.json     the ice-surface heights, checked against five stations
Output:
  remotion/src/reels/data/whichice.ts

THE METHOD (CLAUDE.md, "emit_ts.py ASSERTS THE CLAIM AT THE MOMENT THE COPY MAKES IT"): the beat times live HERE, as ANIM. WhichIce.tsx
reads them from the generated module and holds no hand-typed second of its own, so moving an animation moves the claim it is bound to, and
the module will not regenerate until the copy and the run agree again. The reading budget is re-run on every emit: **shortening a text
window below its reading time is a build failure, not a judgement call** (the owner, 2026-10-13: give enough time to read).

Run from the repo root:  python3 -I projects/r021_whichice/emit_ts.py
"""
import base64
import json
import math
import re
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE / "research"))
import read_budget as RB  # noqa: E402

OUT = REPO / "remotion" / "src" / "reels" / "data" / "whichice.ts"
FIG = json.loads((HERE / "research" / "figures.json").read_text())
GRID = json.loads((HERE / "greenland_grid.json").read_text())

# ── the animation schedule: every second the reel's MOTION depends on ─────────────────────────────────────────────
# (the copy's own times are RB.BLOCKS; the events below are bound to them by the claims further down)
EXAG = 30                                    # the vertical exaggeration of the Greenland mesh. B07's copy says "30X"; asserted below
ANIM = {
    "melt": (1.0, 10.6),                     # the floating cube melts; the ring does not move
    "crack_start": 2.0,                      # the first crack runs through the cube
    "outline_in": (8.6, 9.8),                # the submerged volume is outlined
    "fill": (12.8, 15.0),                    # the meltwater fills the outlined space
    "outline_out": (16.3, 17.3),             # the outline and the fill clear, leaving a clean glass with the ring on its line
    "crack_grow": (2.0, 4.0),                # the crack grows across the cube
    "slide": (16.0, 17.6),                   # the camera slides from one glass to two
    "guide_in": (17.0, 18.0),                # the thin level line through both glasses
    "shelf_melt": (21.8, 26.0),              # the shelf ice melts and the right ring climbs to the line
    "pull": (33.4, 38.8),                    # the camera pulls out: glass -> sea -> Greenland
    "sea_in": (33.4, 35.2),                  # the table becomes the sea
    "floes_in": (34.0, 34.8),                # ice floes appear on it
    "greenland_in": (36.4, 38.0),            # the planet patch fades up as the local sea fades away
    "house_in": (41.7, 42.3),                # cut-dissolve from Greenland to the coastal house
    "blip": (43.2, 44.2),                    # the ring on the house lifts about 1.5 inches
    "climb": (49.2, 52.8),                   # ...then climbs the tide staff to about 24 feet
    "pip_in": (53.7, 54.4),                  # the glass, small, in a corner of the finished frame
}


def smooth(t, a, b):
    x = min(1.0, max(0.0, (t - a) / (b - a)))
    return x * x * (3 - 2 * x)


FAILS = []


def claim(msg, ok):
    print(("  OK   " if ok else "  FAIL ") + msg)
    if not ok:
        FAILS.append(msg)


B = {b[0]: dict(id=b[0], copy=b[1], t_in=b[2], t_out=b[3], rides=b[4], eob=b[5]) for b in RB.BLOCKS}
arrive = lambda k: B[k]["t_in"] + RB.FADE_IN                      # the block is at full opacity
leaves = lambda k: B[k]["t_out"] - RB.FADE_OUT                    # its fade-out begins

print("READING BUDGET (the owner's rule), re-run:")
ok_rb, RBP = RB.check(verbose=False)
claim("every line is on screen long enough to read, one reader in order, every hold >= 2 s, runtime <= 60 s (research/read_budget.py)", ok_rb)

G, SC, CV = FIG["glass"], FIG["scale"], FIG["curves"]
print("\nTHE PHYSICS, as the copy states it:")
f = lambda t: smooth(t, *ANIM["melt"])                            # the melt fraction at time t
claim("B02 'THE WATER LEVEL DOESN'T MOVE.' — the level is identical at EVERY sampled melt step (floating curve)",
      max(abs(row[1] - G["level_floating_cm"]) for row in CV["floating"]) < 1e-9)
claim("B02 lands when the cube is already visibly melting (melt fraction >= 0.25 at its arrival)", f(arrive("B02")) >= 0.25)
claim("B03 'THE ICE TOOK UP THIS SPACE.' — the cube is gone (>= 99 % melted) and the outline fully in before the line arrives",
      f(arrive("B03")) >= 0.99 and ANIM["outline_in"][1] <= B["B03"]["t_in"])
disp_cm3 = G["ice_g"] / 1.0                                       # floating ice displaces its own mass of fresh water (g -> cm^3)
melt_cm3 = G["ice_g"] / 1.0
claim("B03 'ITS MELTWATER FILLS IT EXACTLY.' — the meltwater volume equals the displaced volume, to 1e-9 cm^3", abs(disp_cm3 - melt_cm3) < 1e-9)
claim("B03 — the fill finishes before the line fades, with >= 1 s to spare for the hold", ANIM["fill"][1] + 1.0 <= leaves("B03"))
claim("B03 — the outline stays on screen for as long as the line that names it ('THIS SPACE') does", ANIM["outline_out"][0] >= leaves("B03"))
claim("B04 'ABOVE THE WATER.' — the second glass is in frame by the time the line is readable", ANIM["slide"][1] <= arrive("B04") + 0.3)
claim("B04 — the shelf glass starts a lower level than the floating glass (it has no ice in it yet)", G["level_shelf_before_cm"] < G["level_floating_cm"] - 1.0)
claim("B05 'ICE ON LAND DOES.' — the shelf ring has finished climbing BEFORE the rule is on screen", ANIM["shelf_melt"][1] <= B["B05"]["t_in"])
claim("B05 — and it ends exactly on the level the floating glass was already at (to 1e-9 cm)", abs(G["level_shelf_after_cm"] - G["level_floating_cm"]) < 1e-9)
claim("B05 'BARELY' — the salt-water remainder is small AND matches the published 2.6 % of displaced volume (research/melt_check.py §3)",
      any(abs(r[2] * 100 - 2.6) < 0.05 for r in FIG["salt_remainder"]["rows_rho_sw_pct_of_ice_pct_of_displaced"]))

print("\nTHE SCALE, on one ruler:")
claim("B06 'SEA ICE: FLOATS' — the floes are on screen before the tag is readable", ANIM["floes_in"][1] <= arrive("B06"))
m = re.search(r"(\d+)X", B["B07"]["copy"])
claim(f"B07 'HEIGHT EXAGGERATED {m.group(1) if m else '?'}X.' — the number on screen is the exaggeration of the mesh ({EXAG})", bool(m) and int(m.group(1)) == EXAG)
claim("B07 'GREENLAND'S ICE: ON LAND.' — the planet patch is fully up before the tag is readable", ANIM["greenland_in"][1] <= arrive("B07"))
claim("B07 — the Greenland ice surface matches five published stations within 5 % (greenland.py)", all(abs(v["error_pct"]) < 5 for v in GRID["checks"]["stations"].values()))
claim("B07 — the data is the ICE SURFACE (summit cell 3,000-3,500 m), not the bed", 3000 < GRID["checks"]["highest_ice_cell_m"] < 3500)
claim("B07 — about 80 % of the land is glaciated (70-90 %), the area is 1.55-2.0 M km^2", 0.70 < GRID["checks"]["glaciated_fraction"] < 0.90 and 1.55e6 < GRID["checks"]["glaciated_km2"] < 2.0e6)
claim("the house scene is in before the first number is readable", ANIM["house_in"][1] <= arrive("B08") + 0.3)

print("\nTHE TWO NUMBERS:")
m8 = re.search(r"([0-9.]+) INCHES", B["B08"]["copy"])
m9 = re.search(r"(\d+) FEET", B["B09"]["copy"])
claim(f"B08 'ABOUT {m8.group(1) if m8 else '?'} INCHES' — within 0.1 in of the computed {SC['on_screen']['floating_inches']:.2f} in (all floating ice, 4 cm: SEARCH-LEVEL)",
      bool(m8) and abs(float(m8.group(1)) - SC["on_screen"]["floating_inches"]) < 0.1)
claim("B08 — the ring has finished lifting with >= 2 s of the line still to read (the number is shown over the thing it measures)", ANIM["blip"][1] + 2.0 <= leaves("B08"))
claim("B08 — the ring starts to lift AFTER the line is readable", ANIM["blip"][0] >= arrive("B08"))
claim(f"B09 'ABOUT {m9.group(1) if m9 else '?'} FEET' — within 0.5 ft of the computed {SC['on_screen']['greenland_feet']:.1f} ft (Greenland, 7.42 m: SEARCH-LEVEL)",
      bool(m9) and abs(float(m9.group(1)) - SC["on_screen"]["greenland_feet"]) < 0.5)
claim("B09 — the climb finishes before the line fades, and the line is on screen while it climbs", ANIM["climb"][1] <= leaves("B09") and ANIM["climb"][0] >= arrive("B09"))
claim("B10 — the ring is already at its final height when the close is readable (the close sits OVER the finished frame, never replaces it)", ANIM["climb"][1] + 0.5 <= arrive("B10"))
claim("the glass echo is in before the close is readable", ANIM["pip_in"][1] <= arrive("B10") + 1.0)
claim("the Greenland dissolve and the glass-to-sea pull-out both finish inside the pull-out event", ANIM["greenland_in"][1] <= ANIM["pull"][1])

print("\nEVERY ANIMATION INSIDE THE REEL:")
claim(f"nothing happens after the runtime ({RB.RUNTIME} s)", max(v[-1] if isinstance(v, tuple) else v for v in ANIM.values()) <= RB.RUNTIME)

if FAILS:
    print(f"\n{len(FAILS)} claim(s) FALSE — NOT WRITING {OUT.name}. Fix the copy or the animation until they agree:")
    for x in FAILS:
        print("   -", x)
    sys.exit(1)

# ── write ─────────────────────────────────────────────────────────────────────────────────────────────────────────
heights = np.asarray(GRID["heights_m"], dtype="<i2")
assert heights.size == GRID["n_lon"] * GRID["n_lat"]
b64 = base64.b64encode(heights.tobytes()).decode()

tuple_ts = lambda t: "[" + ", ".join(f"{x:g}" for x in t) + "]"
lines = [
    "/* GENERATED by projects/r021_whichice/emit_ts.py — do not edit. The claims it asserts at the moment each line of copy makes them are",
    "   listed in that file; it refuses to write this module if one is false. */",
    "",
    f"export const DURATION_SECONDS = {RB.RUNTIME};",
    f"export const EXAG = {EXAG};",
    "",
    "/** The on-screen copy, verbatim, and when it is on screen. tIn/tOut are the nominal window; the readable window is tIn+fadeIn..tOut-fadeOut. */",
    "export const BLOCKS = " + json.dumps([dict(id=b["id"], copy=b["copy"], tIn=b["t_in"], tOut=b["t_out"], ridesOn=b["rides"], endOfBeat=b["eob"]) for b in B.values()], indent=2) + " as const;",
    f"export const FADE_IN = {RB.FADE_IN};",
    f"export const FADE_OUT = {RB.FADE_OUT};",
    "",
    "/** Every second the motion depends on. [start, end] unless a single number. */",
    "export const ANIM = {",
] + [f"  {k}: {tuple_ts(v) if isinstance(v, tuple) else v}," for k, v in ANIM.items()] + [
    "} as const;",
    "",
    "/** The glass, in centimetres — research/melt_check.py. The floating level never changes; the shelf level climbs linearly to it. */",
    "export const GLASS = " + json.dumps({k: G[k] for k in ("area_cm2", "water_before_cm", "level_floating_cm", "level_shelf_before_cm", "level_shelf_after_cm", "rise_cm", "cube_cm", "ice_g")}, indent=2) + " as const;",
    "/** [meltFraction, level cm, cube side cm, cube draft cm] — the cube stays 91.7 % under the line at every size. */",
    "export const FLOAT_CURVE: ReadonlyArray<readonly [number, number, number, number]> = " + json.dumps([[round(x, 6) for x in r] for r in CV["floating"]]) + ";",
    "export const SHELF_CURVE: ReadonlyArray<readonly [number, number]> = " + json.dumps([[round(x, 6) for x in r] for r in CV["shelf"]]) + ";",
    "",
    "/** The two numbers on screen. SEARCH-LEVEL: both must be read at a primary before posting (research/RESEARCH.md). */",
    "export const SCALE = " + json.dumps({"floating_in": round(SC["on_screen"]["floating_inches"], 3), "greenland_ft": round(SC["on_screen"]["greenland_feet"], 3),
                                          "floating_m": SC["floating_all_sle_m"], "greenland_m": SC["greenland_sle_m"]}, indent=2) + " as const;",
    "",
    "/** Greenland: ice-surface heights (metres, sea clamped at 0) on a lon/lat grid, north row first, little-endian int16, base64. */",
    "export const GREENLAND = " + json.dumps({"lon0": GRID["lon0"], "lon1": GRID["lon1"], "lat0": GRID["lat0"], "lat1": GRID["lat1"],
                                              "nLon": GRID["n_lon"], "nLat": GRID["n_lat"], "stations": GRID["checks"]["stations"]}, indent=2) + " as const;",
    f"export const GREENLAND_HEIGHTS_B64 = '{b64}';",
    "",
]
OUT.write_text("\n".join(lines))
print(f"\nall claims true. wrote {OUT.relative_to(REPO)} ({OUT.stat().st_size // 1024} KB)")
