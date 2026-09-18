#!/usr/bin/env python3
"""r015 / I77 -- the real physics and the verified lunar-laser-ranging figures
behind "there are mirrors on the Moon, and observatories still bounce lasers
off them."

Two things are computed here, neither authored:

1. The REAL round-trip light-travel time for a beam crossing the Earth-Moon
   distance twice -- exact physics (distance / c), not a research lead.

2. The illustrative 3D placement of an observatory point on Earth, a
   reflector point on the Moon, and the five real, still-used retroreflector
   arrays on the Moon's near side. Earth-Moon SEPARATION in this scene is
   NOT to physical scale (60 Earth radii would put one body off-frame at any
   legible size -- the same problem r009 solved by explicitly re-basing);
   the real distance is stated as text, not implied by the geometry. Mirror
   site positions are representative near-side placements for FIVE REAL,
   NAMED, historically landed arrays, not claimed to arc-second precision.

Every cited figure (photon counts, spot sizes, recession rate) is VERIFIED
against lunar-laser-ranging literature -- see gate0/GATE0.md Sec5 for the
full source table. This script does not re-derive those; it asserts them
and binds them to the beat schedule the same way emit_ts.py binds copy to
data on r014.

Run:
    python3 projects/r015_moonmirrors/llr.py
"""
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent

# ── exact physics ─────────────────────────────────────────────────────────
C_KM_S = 299_792.458                 # exact, by definition of the metre
EARTH_MOON_KM = 384_400               # mean distance -- gate0/GATE0.md Sec5
ONE_WAY_S = EARTH_MOON_KM / C_KM_S
ROUND_TRIP_S = 2 * ONE_WAY_S

assert abs(ROUND_TRIP_S - 2.5644) < 0.001, "round trip must be ~2.56s"

# ── verified LLR figures (gate0/GATE0.md Sec5) ──────────────────────────────
PHOTONS_SENT = 3.1e17                 # APOLLO, 115 mJ @ 532 nm, one pulse
PHOTONS_RETURNED_MIN = 5              # APOLLO's typical per-pulse detection
PHOTONS_RETURNED_MAX = 10             # range, per its own instrument papers
PHOTONS_RETURNED_DISPLAY = 7          # midpoint of the verified range, for one locked on-screen number
SPOT_AT_MOON_KM = 7                   # outgoing beam divergence -> spot diameter on arrival
SPOT_AT_EARTH_KM = 30                 # return spot back at the observatory -- "a few tens of km"
RANGING_PRECISION_MM = 1              # APOLLO's stated ranging precision
RECESSION_CM_YR = 3.83                # 50+ years of LLR data, Eos.org / IFLScience / ScienceBlog
RECESSION_UNCERTAINTY_MM_YR = 0.09

FIRST_YEAR = 1969                     # Apollo 11 places the first array, 21 Jul 1969
CURRENT_YEAR = 2026
YEARS_OF_DATA = CURRENT_YEAR - FIRST_YEAR
assert YEARS_OF_DATA >= 50, 'the script says "over fifty years" -- must stay true'

RETURN_RATIO_APOLLO = PHOTONS_RETURNED_DISPLAY / PHOTONS_SENT      # ~1:4.4e16
RETURN_RATIO_TYPICAL_STATION = 1 / 1e18                            # most other stations

# ── the five real, still-used arrays, illustrative near-side placement ─────
# Selenographic coordinates are representative (near side, roughly matching
# each mission's real general landing region) -- placed for visual spread
# and correct near/far relationships, not asserted to survey precision.
MIRRORS = [
    {"name": "APOLLO 11", "year": 1969, "lon": 23.5, "lat": 0.7},
    {"name": "APOLLO 14", "year": 1971, "lon": -17.5, "lat": -3.6},
    {"name": "APOLLO 15", "year": 1971, "lon": 3.6, "lat": 26.1},
    {"name": "LUNOKHOD 1", "year": 1970, "lon": -35.0, "lat": 38.2},
    {"name": "LUNOKHOD 2", "year": 1973, "lon": 30.4, "lat": 25.8},
]
assert len(MIRRORS) == 5

# Observatory on Earth (illustrative -- a mid-latitude northern-hemisphere
# site, the same general region APOLLO/McDonald-class stations sit in).
OBSERVATORY = {"lon": -105.8, "lat": 32.8}   # roughly Apache Point, NM
REFLECTOR = MIRRORS[2]                        # Apollo 15 -- strongest signal, named on screen

# ── the round-trip clock, the ONE ruler for beats 2-5 (screenSecond, realSecond
# elapsed of THIS beam's own trip, 0 -> ROUND_TRIP_S) ───────────────────────
CLOCK_KEYFRAMES = [
    (3.0, 0.0),                 # beat 2 start -- beam fires, clock at 0.00s
    (9.0, ONE_WAY_S),           # beat 2 end / beat 3 start -- arrives at the Moon
    (14.0, ONE_WAY_S),          # beat 3 end / beat 4 start -- holds at one-way while dilution is shown
    (20.0, ROUND_TRIP_S),       # beat 4 end / beat 5 start -- return complete
    (26.0, ROUND_TRIP_S),       # beat 5 end -- locked
]

# ── the time-lapse year counter, beat 6 (26.0 - 30.0s) ──────────────────────
YEAR_KEYFRAMES = [(26.0, FIRST_YEAR), (30.0, CURRENT_YEAR)]

data = {
    "meta": {
        "earthMoonKm": EARTH_MOON_KM,
        "oneWaySeconds": ONE_WAY_S,
        "roundTripSeconds": ROUND_TRIP_S,
        "photonsSent": PHOTONS_SENT,
        "photonsReturnedMin": PHOTONS_RETURNED_MIN,
        "photonsReturnedMax": PHOTONS_RETURNED_MAX,
        "photonsReturnedDisplay": PHOTONS_RETURNED_DISPLAY,
        "spotAtMoonKm": SPOT_AT_MOON_KM,
        "spotAtEarthKm": SPOT_AT_EARTH_KM,
        "rangingPrecisionMm": RANGING_PRECISION_MM,
        "recessionCmYr": RECESSION_CM_YR,
        "firstYear": FIRST_YEAR,
        "currentYear": CURRENT_YEAR,
        "yearsOfData": YEARS_OF_DATA,
    },
    "clockKeyframes": CLOCK_KEYFRAMES,
    "yearKeyframes": YEAR_KEYFRAMES,
    "observatory": OBSERVATORY,
    "reflector": REFLECTOR,
    "mirrors": MIRRORS,
}

out = HERE / "llr_data.json"
out.write_text(json.dumps(data))
print(f"wrote {out} ({out.stat().st_size / 1024:.1f} KB)")
print(f"one-way light time:  {ONE_WAY_S:.4f} s")
print(f"round-trip time:     {ROUND_TRIP_S:.4f} s")
print(f"photon return ratio, APOLLO:          1 : {PHOTONS_SENT / PHOTONS_RETURNED_DISPLAY:.3e}")
print(f"photon return ratio, typical station: 1 : {1 / RETURN_RATIO_TYPICAL_STATION:.0e}")
print(f"years of LLR data: {YEARS_OF_DATA} (since {FIRST_YEAR})")
print(f"mirrors: {[m['name'] for m in MIRRORS]}")
