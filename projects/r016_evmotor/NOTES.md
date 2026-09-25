# NOTES — `r016`, `I85`, "of every $100 you pay for, how much reaches the wheels?"

Build record, 2026-09-25. Gate 0, GATE 3 and the Stage 3 research are in `gate0/GATE0.md`; the
approved script is `SCRIPT.md`. This file covers the build, the render and the audits.

**State: rendered, both audits passing, awaiting GATE 5 (the owner watches it end to end). NOT
POSTED.** Rendered in a cloud container (headless-shell Chromium, `angle`), not on the Mac. It
rendered cleanly, but the Mac is still the reference render.

## Pipeline

```bash
cd projects/r016_evmotor
pip install fastsim==2.1.5            # NREL FASTSim; ships the EPA UDDS/HWFET cycles and the vehicle db
python3 energy_budget.py              # Camry vs Bolt, validated against EPA sticker figures
python3 fleet_sweep.py                # all 51 light-duty gas + electric cars in the db
python3 motor.py                      # per-frame motor state + the 100-dollar particle schedules
python3 emit_ts.py                    # asserts 16 on-screen claims, writes remotion/src/reels/data/evmotor.ts
cd ../../remotion
npx remotion render r016-evmotor ../projects/r016_evmotor/r016_evmotor.mp4 --codec=h264
cd .. && python3 scripts/reel_motion_audit.py projects/r016_evmotor/r016_evmotor.mp4
python3 scripts/reel_safe_audit.py projects/r016_evmotor/r016_evmotor.mp4 --bleed 4.8-10.8,11.5-12.5,25.3-26.1
```

In the cloud container the render also needs
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`.

## Figures, with provenance

| On screen | Value | Source |
|:--|:--|:--|
| GAS CAR: $23 reaches the wheels | 22.6% | `energy_budget.py`: FASTSim 2016 Camry, EPA combined 55/45, energy to the wheels incl. braking / fuel energy. Model economy −2.4% vs EPA sticker |
| $77 never reaches the wheels | 100 − 23 | same |
| ELECTRIC CAR: $64 reaches the wheels | 64.0% | same, 2017 Bolt, wall → wheels (battery out ÷ charger efficiency). Model +8.8% vs EPA sticker |
| "most of it becomes heat in the engine" | engine loss 72.7% of fuel | `motor.py`, from the Camry's FASTSim energy audit (`fc_kj`), EPA combined |
| 51 cars · every electric beat every gas | 22 BEV 57.1–67.1% · 29 gas 21.5–31.1% | `fleet_sweep.py` |
| "the US Energy Department's own figures agree" | gas inside 12–30%; EV within 2 pts of ~65% | fueleconomy.gov (DOE/EPA, ORNL analysis) and DOE VTO Fact #884, **read via search excerpts**, because those hosts are blocked by the container's egress proxy. **Read them at the source before posting** |

## What the build does NOT claim

- **Nothing about emissions.** This is energy, not carbon, and no line says "cleaner".
- **The stricter ruler ($15 vs $62, drag + rolling only) is not used.** It flatters the thesis beyond
  any published number (see GATE0.md §9).
- DOE's 77–80% EV headline is **not used.** It counts regenerative-braking energy as a gain on top of
  what left the wall.
- The 51-car sweep is a **model run**. The copy says "we ran … through the EPA's test drive", not
  "measured".

## The computed layers

- **Motor:** 12 slots, 2 poles, 60° phase belts (A+ C− B+ A− C+ B−), balanced three-phase currents.
  Coil glow is `max(0, cos(ωt − 2πp/3)·sign)`. `motor.py` asserts on **every frame** that the
  currents sum to zero and that the field summed from the 12 coil vectors equals ωt + the phase-A
  axis. The rotor lags the field by 24° while motoring. It **leads** by 24° once braking has taken
  hold (the generator case), and both signs are asserted in `emit_ts.py`.
- **Dollars:** exactly 100 particles per car. The ones routed to the wheels are
  `round(100 × to_wheels)`, so each counter is a literal count of particles arriving. A fixed-seed
  shuffle (85 for gas, 16 for electric) chooses which ones.
- **Timeline claims (the r011 rule):** both hook counters have landed by 3.0 s. The gas beat's $77
  counter completes before the beat ends; its replay starts at 4.8 s at a rate of 0.55, and those
  constants are duplicated in `emit_ts.py`.

## Audits (final render)

| Audit | Result |
|:--|:--|
| `reel_motion_audit.py` (default width 240) | **PASS**: median change 1.78, longest dead spell 0.25 s, **event density 85%** |
| `reel_safe_audit.py` | **PASS** with three declared bleed ranges |

**Bleed ranges, justified:**
- **4.8–10.8 s**: the camera dives into the gas engine, so the car fills and overfills the frame
  by design.
- **11.5–12.5 s**: the dive into the electric car's floor.
- **25.3–26.1 s**: the pull-back out of the end-on motor.

The header band (y < 270) is clean on every frame, including these.

## Traps found in the build, in order

1. **Stage 3: a sticker figure compared with a raw test-cycle one.** The first validation read +26%
   because `val_udds_mpgge` is EPA's *adjusted* sticker number. FASTSim's label routine fixed the
   base; the assertion refused to pass until it did.
2. **Gate 0 sketch: `degrees()` of 60° is 59.999…**, which put a slot into the wrong phase belt. The
   field assertion caught it, and belts are now indexed by slot number.
3. **Field beat: the car's wheels sat in front of the motor.** Looking straight down the axle puts
   the near wheel between the camera and the motor, and the far wheel's glow showed through the
   gaps. All four wheels now fade out for the field beat.
4. **The electric car's lost dollars rose red out of the motor** during the beat whose copy says
   "burns nothing". That was honest (the $36 is lost as heat in charging and electronics), but it
   read as the motor burning. EV particles now run only in the hook and payoff, where the $36 is
   the claim.
5. **Coil glow halos and engine firing flashes were sized for the wide shot** and became blobs at
   7x and 2.5x scale. Both were shrunk.
6. **The safe-area audit failed 604 frames on the first render.** The particle stream entered from
   off-frame left, the gas car faded back in mid-camera-move while it still sat in the header band
   (never exempt), and the 51-car rows ran past the left edge. Fixed at the source: the stream now
   enters from above the car, the gas car returns only once the camera has settled, and the rows
   are narrower.
7. **Brake shot at scale 1.75 put the car half out of frame**, and at 1.05 it still ran 18 px past
   the right edge. It now sits at 1.0, centred.

## Known weaknesses to judge at GATE 5

- **Brake beat:** at the wide shot the rotor *leading* the field is too small to see. The claim is
  asserted in the data but not legible. The regen flow along the floor reads; the lead does not.
- **The cars are wireframe boxes with wheels.** Whether they read as "a car" with the sound off is
  the Gate 0 kill-condition-2 question, and only a human can answer it.
- **Payoff deviation from SCRIPT.md:** the 51 mini cars carry their figures as wheel-glow
  brightness, not as printed dollar amounts. Printing them would break the three-text-block rule.
  **This is a script deviation and is flagged to the owner.**
- **The follow line is a placeholder** and names no next reel (non-negotiable 9).
- The heat accent (`failure #FF4D4D`) is used for lost energy, not for a "break" beat. That's
  defensible, since the $77 is the failure the reel is about, but it stretches the brand rule.
