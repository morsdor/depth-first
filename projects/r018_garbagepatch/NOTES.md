# r018 · I87 — "Almost half of the Great Pacific Garbage Patch, by weight, is fishing nets."

**State: BUILT and RENDERED 2026-10-04 (42 s, 3D), awaiting GATE 5.** Rendered in a cloud container
(headless-shell Chromium, `angle`). Script approved at GATE 4: [`SCRIPT.md`](SCRIPT.md).
Research record: [`research/RESEARCH.md`](research/RESEARCH.md).

## Pipeline

```bash
cd projects/r018_garbagepatch
python3 research/fetch_drifters.py       # NOAA GDP 6-hourly, AWS open data, ~20 s, cached outside the repo
curl -sO --output-dir data https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson
python3 pacific.py                       # coast, the buoy, the witnesses, the particles -> pacific.json
python3 emit_ts.py                       # 18 claims asserted -> remotion/src/reels/data/garbagepatch.ts
cd ../../remotion
npx remotion render r018-garbagepatch ../projects/r018_garbagepatch/r018_garbagepatch.mp4 --codec=h264 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

`research/measure_patch.py` (the 216-run sweep) and `research/real_tracks.py` are the Stage 3
measurements. `pacific.py` imports the sweep's model and uses its reference setting.

## Figures, with provenance

| On screen | Value | Source | Script |
|:--|:--|:--|:--|
| ALMOST HALF … BY WEIGHT · 46% | "at least 46%" of floating plastic mass is fishing nets | Lebreton et al., *Sci. Rep.* 8, 4666 (2018) — **read at search level only; PDF blocked from the cloud container** | constant in `emit_ts.py` |
| MEASURED 2015 | vessel survey 2015 (aerial 2016) | same | constant |
| DROPPED OFF TAIWAN IN 2019 | buoy 300234066410130, deployed 2019-09-07 at 22.13°N 121.34°E by "Taiwan (China)", 56 km from Taiwan's southern tip | NOAA GDP 6-hourly, May 2025 release, doi:10.25921/7ntx-z961 | `pacific.py` |
| 4½ YEARS LATER, IT WAS HERE | first fix within 500 km of 32°N 145°W on 2024-03-05: 4.49 years | same | `pacific.py` |
| HUNDREDS OF OTHERS | 424 other drifters came within 500 km; 170 started > 2,500 km away (134 on the Asian side). 26 drawn, chosen evenly by start longitude | same | `pacific.py` |
| the pile | 2,400 particles seeded evenly over the North Pacific, 42 steps × 60 days on the transition model: Lebreton's box holds 14% at the start, **46% when "PILES UP" appears**, 56% at the end (box area share 13.8%); densest 2°×2° window 220 km from the measured centre; 2,005 still afloat | van Sebille et al. 2012's method re-run on 48.9 M drifter positions | `pacific.py` |
| the dashed circle | Lebreton's measured centre (32°N 145°W) and area (1.6 M km² → radius 714 km) | Lebreton 2018 | `pacific.py` |

## Beats (must match `emit_ts.py`)

| t (s) | Beat | What moves |
|:--|:--|:--|
| 0–5 | hook | camera low over the water; the amber net drifts toward the lens. Copy complete at 2.0 s |
| 5–11 | island | debris gathers into a mound (5.2–7.0), then spreads thin (7.8–10.4) while the camera rises |
| 11–20 | buoy | globe; the buoy runs its real track 13.4–16.4 s (deploy → arrival), then to its last fix by 19.6 s; date clock |
| 20–28 | pile | 26 real witness tracks draw in; particles run 22.4–26.8 s; patch circle at 26.2 s; camera closes on the patch |
| 28–36 | payoff | dive to sea level; the scale rises; beam tilts by the computed 0.048 rad; 46% on the nets' pan |
| 36–42 | close | scale sinks; the net drifts past; follow line at 38.2 s |

## Traps found during the build

1. **`NpzFile` re-reads the whole array on every `D[key]`.** `pacific.py` first ran for 10+ minutes
   because a per-drifter loop indexed `D["lon"]` (48.9 M rows, decompressed each time). Load each
   array once.
2. **The first run of the model put the patch in the Sea of Okhotsk.** Cells with no outgoing data
   kept their debris and became traps. Fixed by treating drift into an unsampled cell as beaching;
   the threshold is swept, and the bad run is recorded in `RESEARCH.md`.
3. **The hook headline wrapped to three lines at 46 px** and collided with "IS ONE THING:". Set
   as three deliberate lines at 48 px, second block moved to y 480.
4. **The scale's left pan reached x ≈ 10 px** at shot scale 0.78, outside the safe column.
   Pulled to 0.64.
5. **"Everything else" read as a dark blob** — crates are graphite on a dark sea. The right pan
   now carries bottles, bags and fragments only.

## What is NOT claimed

- **The patch's shape.** The circle has Lebreton's centre and area; the real outline is not in hand.
- **That the buoy stayed.** It went silent 28 days after arriving (24.8 of those days inside).
- **Why the currents converge** (wind-driven convergence). The reel shows that they do.
- **Any tonnage, area or piece count**, and nothing about straws (owner, 2026-10-04).
- **Today's share.** 46% is the 2015 survey; fragments rose 2.9 → 14.2 kg/km² by 2022 (ERL 2024),
  so the share of nets has likely moved. The source line says 2015.
- **The sea, net, debris, "island" and scale are diagrams.** The globe, tracks, particles and circle
  are data.

## Audits (final render, 2026-10-04, `--crf 23`, 21.6 MB)

| Check | Result |
|:--|:--|
| `reel_motion_audit.py` (default width 240) | **PASS** — event density **79%**, median change 2.37, longest dead spell 0.75 s at 12.8 s |
| `reel_safe_audit.py --bleed 0-11.4,27.5-42.5` | **PASS** — header band clear in every frame |
| `npm run lint` (eslint + tsc + brand:check) | clean |
| `emit_ts.py` | 18 claims hold |
| filmstrip, every 1.5 s | hook claim complete by 3.0 s; buoy reaches the patch at 16.4 s, "IT WAS HERE" at 16.6 s; pile visible on the patch before "PILES UP"; 46% on the nets pan through the payoff |

**Bleed ranges, justified.** 0–11.4 s and 27.5–42.5 s are the two SEA scenes: the camera is down on
the water and the sea surface is the set, edge to edge, like the ground. No copy, label or the net
leaves the safe column in them. **The globe beats (11.4–27.5 s) are NOT exempt**: their coastlines ran
under the rail once the camera pushed in, so the 3D layer is cropped softly to the safe column
(a CSS mask, x 74–856) only while the globe is the sole scene.

**Render history.** Cut 1 (crf 18, 53 MB): motion FAIL, 1.75 s dead spell at 18.2 s (the globe held
still after the buoy arrived) → a push toward the patch through the hold. Cut 2: safe FAIL, globe
coastlines under the rail 16.1–27.5 s → the soft crop. Cut 3: motion FAIL, 1.75 s at 11.8 s (the
globe's opening barely moved) → a wider opening that turns and pushes in. Cut 4: both PASS.

## Open at GATE 5

- The follow line is the placeholder "Follow for how the planet actually works."
- The Lebreton PDFs (2018, 2022, ERL 2024) were never read in full from this container. Read them
  before posting, on the Mac, and confirm the 46% definition.
