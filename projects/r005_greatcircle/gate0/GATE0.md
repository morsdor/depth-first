# Gate 0 — I17 · "Your flight path isn't curved. Your map is."

Backlog id `I17` (§2 Maps and real geography → accent `infrastructure #00D6F7`).
Nothing has been built. This file and `payoff_frame.png` are the two artefacts
CLAUDE.md requires **before** any Python, any `.tsx`, any data module.

## 1. The sentence

> **"Flights arc over the Arctic because that *is* the straight line — it's the
> flat map that's bent, not the plane."**

Said to a friend at dinner, in words a non-programmer already owns. No CS noun.

## 2. The payoff frame

`payoff_frame.png` — drawn in PIL + Basemap, not rendered, ~5 minutes.
Real GSHHG coastlines (offline, bundled in `basemap-data`; no OpenStreetMap, so
nothing here is blocked by the container's egress proxy).

Same two endpoints, same cyan line, twice:
a globe where it is a taut straight string, and the Pacific-centred world map
everyone has seen on a seatback screen, where the identical line bows to 75.5°N.

## 3. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **Pass.** "straight line", "flat map", "plane". |
| The payoff frame shows an object the viewer has never seen | **Pass.** A globe and a world map. Both are objects, not pictures of an idea. |
| The amazement depends on understanding first | **Pass.** The two lines land in one glance; the *why* (a projection has to stretch high latitudes) is the reward for staying, not the price of entry. |

Non-negotiable 6 (the recognisable object never leaves the frame) is satisfiable:
the map *is* the subject, so it is on screen for all 30-odd seconds. No beat needs
an abstraction to sit beside it.

## 4. Numbers, and where they came from

- **12,373 km** — great circle DEL→SFO, R = 6371.0088 km (IUGG mean radius).
- **12,395 km** — the WGS84 geodesic for the same pair (`pyproj.Geod`). The 22 km
  gap is the sphere assumption the reel is about, so the spherical figure is the
  one that goes on screen.
- **75.5°N** — the great circle's vertex latitude. North of Iceland's north coast.

Both are computed in `mock_payoff.py`, which the build will reuse rather than
re-derive.

## 5. Two accuracy risks the build must not skate past

1. **"Your flight path" is not exactly the great circle.** Real DEL–SFO routings
   bend for jet-stream winds, ETOPS and closed airspace. The on-screen claim has
   to be about the *shortest* path, not "the exact track your flight flew" — that
   is a rule-7 "X because Y" sentence and it would be false as written.
2. **Mercator is one projection, not "the map".** Seatback screens and Google Maps
   use it; a physical wall map may not. Say Mercator once, on screen, in the beat
   that shows the stretching, so the claim has a subject.

## 6. Awaiting

**A human yes.** Gate 0 is not mine to pass.
