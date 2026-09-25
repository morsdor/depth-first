# I85 — SCRIPT (GATE 4) · "$100 in. Here's what reaches the wheels."

**Written 2026-09-25, before any `.tsx`, data module or build.** Proposed as `r016`; the number is
claimed when the first `.tsx` is written, not here. Accent `languages #51A4FF`, with `failure #FF4D4D`
for heat and lost energy only.

**The sentence (Gate 0, corrected and approved 2026-09-25):**

> "Of every $100 of gas you put in your car, about $77 never reaches the wheels. Of every $100 of
> electricity you put in an electric car, about $64 does."

**Runtime 42 s · 3D (`@remotion/three`) · 7 beats · US English, USD.**

---

## THE ONE RULER

**Every number on screen answers the same question: _of every $100 you pay for, how many dollars
reach the wheels?_** Dollars are the only unit. There are no percentages, kWh, mpg, joules or
horsepower anywhere on screen.

"Reaches the wheels" is DOE's own definition: energy delivered to the wheels, braking energy
included (`energy_budget.py`, the DOE-comparable ruler). The stricter drag-plus-rolling figure
($15 vs $62) is **not used**, for the reason in GATE0.md §9. It flatters the thesis beyond any
published number.

| Figure on screen | Value | Source |
|:--|:--|:--|
| gas car, reaches the wheels | **$23** (of $100) | FASTSim, 2016 Camry, EPA combined, 22.6%. Inside DOE's 12–30% |
| gas car, never reaches them | **$77** | 100 − 23 |
| electric car, reaches the wheels | **$64** | FASTSim, 2017 Bolt, wall → wheels, 64.0%. DOE Fact #884: about 65% |
| electric car, never reaches them | **$36** | 100 − 64 |
| cars run | **22 electric, 29 gas** | `fleet_sweep.py`. Worst EV 57.1% against best gas car 31.1%, no overlap |

---

## THE SCRIPT

`TITLE` = Archivo Black block, top of the safe area · `LABEL` = a tag that rides **on the object in
world space** · `COUNTER` = a live dollar readout on the object. **Never more than three text blocks
at once.**

| t | Narration: the on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| **0.0–4.5** · HOOK | **TITLE** `$100 GOES INTO EACH CAR.` · **COUNTER** on the gas car counts up to `$23 REACHES THE WHEELS` · **COUNTER** on the electric car counts up to `$64 REACHES THE WHEELS` | Two cars side by side at a ¾ angle, **already moving at frame 0**. `LABEL`s ride on them: `GAS CAR` and `ELECTRIC CAR`. Glowing energy particles stream into each car, $100's worth. In the gas car most of them vent upward as red heat shimmer from the hood. In the electric car most of them flow down into the wheels, which turn. **Both counters have landed by 3.0 s.** | **Shows the result instead of promising it.** Measured on r009, showing beat promising by +60% on watch time. The two cars are civilian objects, named on themselves. The payoff number is on screen inside 3 s, and every beat after this one explains it |
| **4.5–11.0** · GAS | **TITLE** `IN A GAS CAR, MOST OF IT` / `BECOMES HEAT IN THE ENGINE` · **COUNTER** on the engine `$77 NEVER REACHES THE WHEELS` | **The only-3D shot, part 1.** The camera dives through the gas car's hood into a 4-cylinder engine: pistons pumping, each firing flash lighting the block red. Heat shimmer pours off it and out the tailpipe, and the counter climbs to $77 as it goes. The car body stays ghosted around the engine (non-negotiable 6) | Where the $77 goes. The heat you can feel on a hood after a drive is the viewer's own evidence (GATE 3, condition 1) |
| **11.0–17.5** · MOTOR | **TITLE** `AN ELECTRIC MOTOR HAS NO FIRE.` / `IT HAS MAGNETS.` · **LABEL** on the motor `ELECTRIC MOTOR` | **The only-3D shot, part 2.** Hard cut to the electric car. The camera dives through its floor to the motor between the rear wheels, and the housing splits open in 3D. The copper coils around the ring glow and the rotor spins in the middle. Car body ghosted, wheels turning | The owner's reason for the reel: the visually impressive object. This is also where the viewer learns it is a motor, because it sits inside a car they have already seen |
| **17.5–25.0** · FIELD | **TITLE** `THREE SETS OF COILS SWITCH ON IN TURN.` · **TITLE** `THE MAGNETISM SPINS,` / `AND THE MIDDLE CHASES IT.` | Slow down: coil brightness is driven by the **computed** three-phase currents (the Gate 0 winding maths, animated). The glowing zone visibly travels round the ring, and a soft blue field arrow travels with it. The rotor follows, always a few degrees behind. **Nothing touches**: a visible air gap stays between rotor and ring the whole time | The mechanism, shown rather than explained. The glow travelling round the ring is the image no gas engine has |
| **25.0–31.0** · BRAKE | **TITLE** `HIT THE BRAKES, AND IT RUNS AS A GENERATOR —` / `PUTTING ENERGY BACK IN THE BATTERY` · **LABEL** on the battery `CHARGING` | Pull back to the whole electric car braking at a stop line. The rotor now **leads** the field instead of lagging it. The particle flow reverses, from the wheels back into the battery pack under the floor, and the pack's glow brightens | Part of why the $64 is so high: the energy a gas car throws away as hot brake pads comes back. It's the motor running backwards, visually the mirror of beat 4, and the second half of the mechanism |
| **31.0–38.0** · PAYOFF | **COUNTER** gas `$23` · **COUNTER** electric `$64` · **TITLE** `WE RAN 51 CARS THROUGH THE EPA'S TEST DRIVE.` / `EVERY ELECTRIC ONE BEAT EVERY GAS ONE.` | Back to the two cars of the hook, same angle, same particle streams, now read at a glance. A second row fades in behind them: 51 small cars, 29 gas and 22 electric, each with its own dollar figure. The two groups never mix: every electric figure sits above every gas one. Small provenance line under the counters: `2016 Camry · 2017 Bolt · US DOE model` | The repeatable number, and the proof that it isn't one cherry-picked pair. "Every one beat every one" is the line to carry into the argument (GATE 3, condition 3) |
| **38.0–42.0** · CLOSE | **TITLE** `THE US ENERGY DEPARTMENT'S OWN FIGURES AGREE.` · **TITLE** `FOLLOW — NEXT: [owner to choose]` | Hold on the two cars, still moving, particles still flowing, wheels still turning. Never still | Credibility close, the r011 shape: the claim isn't only ours. Then a reason to follow, performable on the phone (non-negotiable 9). **The follow line needs your choice of what the next reel is** |

---

## THE COPY COLUMN, READ ALONE (the r010 check)

> $100 goes into each car. $23 reaches the wheels. $64 reaches the wheels. · In a gas car, most of
> it becomes heat in the engine. $77 never reaches the wheels. · An electric motor has no fire. It
> has magnets. · Three sets of coils switch on in turn. The magnetism spins, and the middle chases
> it. · Hit the brakes, and it runs as a generator, putting energy back in the battery. · $23. $64.
> We ran 51 cars through the EPA's test drive. Every electric one beat every gas one. · The US
> Energy Department's own figures agree.

**Where it reads incomplete without the picture:** in the hook, **"$23" and "$64" do not say which
car is which.** The `GAS CAR` / `ELECTRIC CAR` labels carry that, and they must sit on the same line
as each counter, not in a separate slot. **Fix, if the copy must stand fully alone:** make the
counters `GAS CAR: $23 REACHES THE WHEELS` and `ELECTRIC CAR: $64 REACHES THE WHEELS`. That is still
three text blocks. **Recommended.**

---

## CLAIMS `emit_ts.py` MUST ASSERT BEFORE IT WRITES THE DATA MODULE

Each claim is bound to the frame where its copy appears (the r011 rule).

1. gas to-wheels rounds to **$23**, and $100 − that = **$77**. EV to-wheels rounds to **$64**.
2. "Most of it becomes heat in the engine": the Camry's engine loss (`fc_kj`) is **> 50%** of fuel
   energy on the combined cycle. It is ~72%.
3. "Every electric one beat every gas one": min(BEV) > max(Conv) across the 51-car sweep, and the
   counts are exactly **22 and 29**.
4. "51 cars" = 22 + 29.
5. The gas counter reads `$23` and the electric `$64` **by 3.0 s** (the hook shows, it does not
   promise).
6. Field beat: coil glow is driven by currents summing to zero, and the rendered field angle equals
   ωt + the phase-A axis every frame. The rotor angle **lags** the field in beat 4 and **leads** it
   in beat 5, since a generator leads.
7. "The US Energy Department's own figures agree": the model gas figure lies inside DOE's 12–30%,
   and the model EV figure is within 2 points of DOE's pre-regen ~65%.

## WHAT THE REEL DOES NOT CLAIM (read before writing any extra line)

- **Nothing about emissions or "cleaner".** This is energy, not carbon.
- **Nothing about where the heat exits in dollars.** DOE's radiator-plus-tailpipe share was never read
  at the source.
- **"No fire" means no combustion in the motor.** It is not a claim that EVs cannot catch fire.
  ⚠ **This line invites a battery-fire rebuttal in the comments.** If that's unwelcome,
  `AN ELECTRIC MOTOR BURNS NOTHING. IT USES MAGNETS.` avoids the word.
- **"Nothing touches"** means the rotor and the coils. The bearings do touch, so the copy never
  says "no contact at all".
- The **51-car sweep is a model run**, validated for the 16 cars that have EPA sticker figures in
  the database. The copy says "we ran … through the EPA's test drive", which is literally what
  happened, and does not say "measured".

## OPEN FOR YOUR DECISION

1. **Approve or change the script.** You can cover the "On screen" and "Why" columns and read the
   copy column alone.
2. **Counters with or without car names in the hook.** I recommend with.
3. **"NO FIRE" or "BURNS NOTHING"** in beat 3.
4. **The follow line.** What does the next reel promise?
