# r010 · `I65` — a traffic jam with no cause

**Built 2026-09-11. NOT POSTED — waiting at GATE 5.** 46.0 s · 1380 frames · 12.3 MB.
Accent `#51A4FF` (`languages`, §3). First reel built under the SCRIPT-FIRST gate sequence,
and the first under **3D by default**.

- Gate 0 and the send test: [`gate0/GATE0.md`](gate0/GATE0.md)
- The approved script — the contract this build serves: [`SCRIPT.md`](SCRIPT.md)
- The model: [`ring.py`](ring.py) → [`dump_data.py`](dump_data.py) → [`emit_ts.py`](emit_ts.py)
  → `remotion/src/reels/data/phantomJam.ts` → `remotion/src/reels/PhantomJam.tsx`

## Figures, with provenance

| On screen | Source | Grade |
|:--|:--|:--|
| 22 cars · 755 feet · 19 mph · no obstacle | Sugiyama et al., *New J. Phys.* **10** (2008) 033001 | STRONG — the experiment itself |
| the jam runs **backwards at 12 mph** | same (~20 km/h, and it matches real highways) | STRONG |
| one car of 22 breaks it up · **40% less gas** | Stern et al., *Transp. Res. C* **89** (2018) 205–221 | STRONG |
| CIRCLES, 100 cars on I-24 | university press release only | **MEDIUM — kept OFF screen** |

Displayed in feet and mph for a US audience (2026-09-11). **`ring.py` stays SI end to end**;
only the display converts, and `GATE0.md` §5 keeps the metric originals beside the computed
conversions, because both sources published in metric.

## What the model earns, and what it is given

Three parameters (`H_C`, `W_OVM`, `A_SENS`) are calibrated to three measured properties of the
experiment — target speed, free-flow escape, backward wave speed — so **those three numbers are
attributed to the experiment on screen, never claimed as ours.** Not calibrated, and therefore
what the animation legitimately demonstrates:

- a jam forms from a **10 cm** offset with no obstacle (t ≈ 46 s)
- it persists as a localised structure, 5–6 of 22 cars stopped
- **critical density: smooth at ≤20 cars, jams at ≥22** — the experiment's own threshold, and it
  was never fitted
- one car in 22 breaks it up

`emit_ts.py` asserts all 14 on-screen claims and refuses to write the data module if one fails.
It fired three times during this build and was right every time.

## Beats

| t | beat | sim window | rate |
|:--|:--|:--|:--|
| 0.0–3.2 | hook — crawl, then clear road | FORM 128→134 s | ×1.9 |
| 3.2–8.0 | the road bends into the ring | — | — |
| 8.0–17.0 | the jam condenses | FORM 0→110 s | ×12 |
| 17.0–25.0 | **the jam goes backwards** | FORM 110→150 s | ×5 |
| 25.0–31.0 | it drives through YOU | FORM 122→134 s | ×2 |
| 31.0–40.0 | one car breaks it up | FIX 0→130 s | ×14 |
| 40.0–46.0 | close | FIX 130→160 s | ×5 |

## Audits

```
motion   median change 1.206 · longest dead spell 0.25s (limit 1.5) · event density 61%   PASS
safe     1380 frames · declared bleed 0-5.7s, 24.8-32.3s · header band enforced           PASS
lint     eslint + tsc + brand:check                                                        PASS
```

Event density 61% against r004's 42%, r006's 49% and I51 v5's 53%. The 0.25 s dead spell is the
best on the account — there is no held frame anywhere, because the traffic never stops moving.

## Traps — every one of these passed tsc, eslint and brand:check

**Four were caught by looking at pictures. Two by assertions. None by the type checker.**

1. **`np.diff` on ring positions.** `headways()` is only correct while the position array stays
   sorted; one car wrapping past 230 m produced one huge negative gap and one near-whole-ring gap.
   **That artefact alone manufactured a "jam" at every density including 8 cars with 29 m of space
   each**, and printed a tidy plausible table doing it. Caught by the density sweep — the control
   that was supposed to be boring.
2. **Driver jitter that was not jitter.** Added per step without `1/√dt` scaling, so it damped to
   0.017 km/h and every seed returned the same answer. Uncorrected it would have supported "one
   car fixes traffic perfectly". Corrected: **−88%, and only −46% once drivers get sloppy.**
3. **A jam width of half the track.** Locating the jam by circular mean over all slow cars is
   undefined when there are transiently two clusters on opposite sides — it reported a 103 m
   half-width on a 230 m ring. Caught by an `emit_ts.py` assertion, fixed to the longest
   *contiguous run* of slow cars.
4. **"One car fixes it" was too strong.** Engaged on an already-jammed ring the controller breaks
   the jam up and nobody stops again, but the ring never returns to uniform speed. The script was
   rewritten to claim **"nobody stops any more"** (17.5% of car-samples under 5 mph → 0.0%), and
   `emit_ts.py` now asserts the weaker claim.
5. **The ring was sized to the frame's HEIGHT.** 9:16 is only 0.5625 as wide as it is tall, so a
   73 m ring inside 95 m of visible height still burst out of frame sideways. The binding
   constraint is the 810 px safe width, not the height.
6. **The hook was 150 m from the camera.** Leaving the scene group at z = 0 for the driver's-eye
   beats put the near lane 254 m away; the hook rendered as an abstract black wedge. The road has
   to come to the camera, and a true 13 m driver's eye then fills the lower third with one car's
   roof and shows no queue — it needed a chase camera 44 m back.
7. **Stopped cars were the darkest thing on screen.** The speed ramp ran to `GRAPHITE`, nearly the
   colour of the asphalt, so the jam rendered as an *absence* — the one thing the reel is about was
   the hardest thing to see. Stopped is now **bone**, moving is accent, and the jam is a bright clot.
8. **Lane dashes were indistinguishable from cars from above.** Same size, same spacing, similar
   colour; the ring read as a necklace of identical blue dashes. Dashes now fade out with the
   camera — present at road level where they make it read as a road, gone by the time the claim is
   being made.
9. **The clock lied.** Simulation time was interpolated with the brand ease, which varies the
   playback rate inside every beat: at 13.3 s the clock read 1:35 where a true ×12 is 1:05. The
   clock states a rate on screen, so the rate must be constant. **Easing belongs on the camera,
   never on the physics.**
10. **A 280 px label centred on a marker at x = 119** put its left edge at −21 and its glyphs at
    x = 37, inside Instagram's left cut. 78 pixels, and it is still text under the chrome.

## `reel_safe_audit.py` FAILS OPEN on this container — use `reel_safe_frames.py`

Neither available ffmpeg will do `-f rawvideo` on h264: the Remotion build has no rawvideo muxer
and the Playwright build is compiled `--disable-everything`. `reel_safe_audit.py` therefore decodes
**zero frames, prints PASS, and reports an inverted bounding box (`x 1080..-1`)**. A green tick from
it here means nothing was measured.

`scripts/reel_safe_frames.py` (added with this reel) reads decoded PNGs instead. Decode with the
one ffmpeg here that reads h264:

```bash
remotion/node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg \
    -loglevel error -i projects/r010_phantom_jam/r010_phantom_jam.mp4 \
    -vf scale=270:480 /tmp/fr/%04d.png
python3 scripts/reel_safe_frames.py /tmp/fr --scale 4 --bleed 0-5.7,24.8-32.3
```

**On `--bleed`:** the two ranges are where the camera is down on the road (pitch < 46°) and the set
leaves the frame by design, the way `ReelGround` does. They are declared explicitly and justified
here rather than bought by nudging the brightness threshold until the number goes green — which was
the first thing I tried and is exactly the `I51` mistake in a new costume. **The header band is
never exempt**, whatever the camera is doing: that is r001's bug and the reason the rule exists.

## Render

```bash
cd remotion && npx remotion render r010-phantom-jam \
  ../projects/r010_phantom_jam/r010_phantom_jam.mp4 --codec=h264 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

Remotion cannot download Chrome here (remotion.media is refused by the egress proxy), and the plain
`chromium` binary fails because old headless mode was removed — it must be `headless_shell`.
