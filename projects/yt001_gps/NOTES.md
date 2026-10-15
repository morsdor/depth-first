# yt001 — build notes

**"How GPS finds you, and why it needs Einstein"** · ~4:56 · 1080p · a motion-graphics test, built outside
the reel gates at the owner's direction (2026-10-15: "leave Gate 0 and all restrictions"). No backlog id,
no reel number. Turbulence was picked first and dropped; GPS was chosen from four options.

## How it was made

```
sims/gps_sims.py   → sims/numbers.json, sims/gps_data.json   (orbit, clocks, visibility, solver, 2-D toy)
narration.py       → remotion/public/yt_gps/audio/narration.wav + timeline.json   (Kokoro-82M, one file per sentence)
emit_ts.py         → remotion/src/yt/data/{gps,land}.ts + captions.srt            (REFUSES to write if a claim is false)
script_md.py       → SCRIPT.md                                                     (table built from the real timings)
remotion/src/yt/   → Gps.tsx + scenes/S1..S7 + lib/{kit,globe}.tsx                 (3840×2160 design, --scale=0.5)
```

Every animated quantity is computed, not keyed: satellites sit on Kepler orbits propagated per frame;
the globe is a real orthographic projection of Natural Earth coastlines; the position fix on screen is a
real Gauss–Newton solve on the real satellite geometry above Mumbai; the relativity ledger is computed from
GM, the IAU geoid potential and the orbit. The voice is the master clock: each beat is placed on a real
sentence boundary, and character-share inside a sentence for phrase-level cues (`phraseAt`).

## Figures and where they come from

| Figure on screen | Source | Status |
|:--|:--|:--|
| 31 operational satellites, ≥ 24 committed, ~20,200 km, 2 orbits a day, 6 planes × 4 slots | gps.gov Space Segment | search-level |
| 55° inclination | Navipedia, TU Delft lecture | search-level |
| Altitude **20,191 km**, period **11 h 58 min**, speed **3.874 km/s** | **computed** from a half-sidereal-day period (Kepler's third law) | agrees with gps.gov's "about 20,200 km" — not tuned |
| 67.3 ms overhead delay | **computed** (altitude / c) | exact |
| "At least four above the horizon" — never fewer than **6** | **computed** on a global lat/lon grid over a sidereal day, 24-slot Walker 6/1 at 55°, 5° mask | stylised constellation; the 6 is for the baseline only |
| SR **−7.21**, GR **+45.79**, net **+38.58 µs/day**, **11.56 km** | **computed** (GM, IAU W₀, Kepler orbit) | published values are "about 7 / 45 / 38 µs" |
| Pre-launch setting **10.22999999543 MHz** | **computed** 10.23 × (1 − 4.465×10⁻¹⁰) = 10.229999995433 | **matches the published figure (GPS World, Penn State) — nothing fitted** |
| NTS-2 (June 1977): measured **+442.5**, predicted **+446.5** ppt | Ashby, via the *Matters of Gravity* newsletter (arXiv:gr-qc/9702010) | search-level, secondary copy; our computed 446.47 matches the prediction |
| Fix: **6,375,870 m → 3.5 m in 5 steps**, PDOP 2.1, clock error recovered | **computed**: 4 best-placed of the 10 satellites above 10°, 0.5 ms quartz error, 2 m noise per range | 2 m is the SPS user-range-error spec |
| Phone ~**4.9 m**, signals ~**2 m** | gps.gov accuracy page | search-level |
| SA off **2 May 2000**, ~100 m before | gps.gov SA data page | search-level; "about 100 m, 95%" |
| L1 1575.42 / L5 1176.45 MHz; delay ∝ 1/f² (**1.79×**) | standard GNSS physics; ratio **computed** | frequencies from memory |
| Pound–Rebka, Harvard 1959, **22.5 m**, predicted shift **2.46×10⁻¹⁵** | the shift is **computed** (gh/c²); the tower height is from memory | **not searched — verify before publishing** |
| "Cell networks, power grids and financial markets use GPS time" | general knowledge | **not searched — verify wording** |

## Things deliberately NOT claimed

* **"Uncorrected, GPS would drift ~10 km a day."** It is widely repeated (Ashby; GPS World says up to ~11 km
  between daily uploads) and probably right as a statement about the system's time reference, but the
  video says only what the arithmetic supports: *38.6 µs a day, and light travels 11.56 km in that time*.
  A common-mode clock rate error is, in a pure position solve, absorbed by the receiver's own clock term, so
  the position-error framing is subtler than the slogan.
* No claim that the 2-D toy *is* GPS — it is captioned as a toy (3 unknowns, flat map).
* No claim about the size of any real thing that is not to scale. The sphere in scene 3A is to scale; the
  three-sphere toy is labelled as a sketch by its framing, not by a number.

## The render

`npx remotion render yt001-gps … --scale=0.5 --codec=h264 --crf=20 --concurrency=4` (about 7–20 min on 4 cores, cloud
container, headless-shell Chromium), then mastered with ffmpeg: a light compressor, `loudnorm` to **−16 LUFS /
−1.5 dBTP** (the raw narration measured −24.8 LUFS, too quiet for YouTube, which never boosts), x264 crf 23.
**1920×1080 · 4:57 · 45 MB** → `yt001_gps.mp4`. v1 had long static stretches; v2 (commit `9e577d7`) added motion to
every beat: a living ground, signal fronts that keep travelling, marching dashes, two clocks beside the gravity
well (ground slower, satellite faster, exaggerated and labelled), photons climbing the Harvard tower, a day counter,
the 11 digits typed on one by one, L1/L5 pulses with L5 lagging.

## Known weaknesses

* **The voice was chosen by Kokoro's published quality grade (`af_heart`), not by ear** — nobody has listened to it in
  this session. Check pacing and pronunciation ("N T S two", the 11-digit frequency, "Kelvin"-free script).
* The constellation is **stylised**: 31 satellites in six 55° planes, evenly spread. The real slots are not.
* Scenes 5 and 6 are still text-forward: a left-weighted stage beside a ledger, with real empty space in the lower
  third. Scene 3B's reveal is timed by character share inside the sentence, so it can sit a beat early or late.
* Nothing here has been read at a primary source (no Ashby review PDF, no gps.gov PDF, no IS-GPS-200). Every
  external number is search-level.
* **Upload note:** the narration is AI-generated — disclose it. Captions are in `captions.srt`.

## Licences

Natural Earth (public domain) · Kokoro-82M (Apache-2.0) · fonts as vendored by the repo · simulations are ours.
