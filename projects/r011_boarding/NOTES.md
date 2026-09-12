# r011 · `I73` — your airline boards the plane worse than no method at all

**Built 2026-09-12. 45.0 s · 1350 frames.** Accent `#FF4D4D` (`failure`, §6). Teaching format.
**NOT POSTED — at GATE 5.**

- Gate 0, the send test, the research and the falsification conditions: [`gate0/GATE0.md`](gate0/GATE0.md)
- The approved script, and the two deviations from it: [`SCRIPT.md`](SCRIPT.md)
- The model: [`boarding.py`](boarding.py) → [`dump_data.py`](dump_data.py) → [`emit_ts.py`](emit_ts.py)
  → `remotion/src/reels/data/boarding.ts` → `remotion/src/reels/Boarding.tsx`

**This concept claimed no reel number until the build started.** It lived in `gate0/i73_boarding/`
through G2, G3, the research and G4, and moved here the moment the first `.tsx` was written — the
rule as written, obeyed to the letter because `I72` had just claimed `r012`, been parked, and cost
a repo-wide renumber the same day.

---

## The claim, and why it is not ours

**The headline is somebody else's measurement.** Steffen & Hotchkiss, *Journal of Air Transport
Management* 18 (2012) 64–67: a mock 757 fuselage on a Southern California soundstage, 12 rows of
six, single aisle, 72 real passengers, five methods, each run once.

| method | measured |
|:--|--:|
| Steffen order | 3:36 |
| window, middle, aisle | 4:13 |
| **no order at all** | **4:44** |
| **back to front** | **6:11** |
| blocks from the rear | 6:54 |

**Back to front took 31% longer than no order at all** (base: the random order's 284 s).

## What our model adds, and what it cost to trust it

`boarding.py` is a discrete-event agent model: the aisle is sub-slots of a row pitch, one person per
sub-slot, nobody overtakes, a bag blocks the aisle while it is stowed, and a passenger climbing past
a seated neighbour blocks it too. **Parameters were chosen from ordinary walking and stowing times
before any comparison was run and were never tuned toward the published table.**

| | ours | measured | error |
|:--|--:|--:|--:|
| no order at all | 4:21 | 4:44 | **−8%** |
| back to front | 6:08 | 6:11 | **−1%** |

Four of the five ordering positions reproduce. **Ours puts block boarding ahead of strict
back-to-front and the field test has them the other way round** — a 43 s gap, from a single trial
per arm, against our own 15–21 s seed-to-seed spread, and against every simulation study, since
block boarding has strictly more spread. Steffen and WilMA come out optimistic here because the
model grants perfect compliance, no bin contention and no families, which is exactly what makes
Steffen impractical in life. None of that touches the comparison the reel makes.

**144 of 144 sweep points keep back to front slower than random** — four stow times (3–20 s), four
carry-on rates (40–95%), three shuffle penalties, three walking speeds. Penalty min 22%, median
47%, max 99%; the measured 31% sits inside it. **The result does not depend on any guess about how
long a bag takes. Only on the order.**

## The mechanism, which is the whole reel

**The back-to-front cabin never gets more than TWO people stowing at once.** Not in any seed, not at
any parameter setting, and not at bin-reach 1, 2 or 3 — because the binding constraint is the
pipeline, not the bin: by the time a third passenger has walked up the aisle, the first has finished.
The random cabin reaches seven.

| | random | back to front |
|:--|--:|--:|
| mean stowing at once | 1.27 | 0.91 |
| peak, this run | **7** | **2** |
| peak, mean of 20 seeds | 5.0 | 2.0 |
| share of boarding with ≥ 4 stowing | 5.7% | **0.0%** |

## The animated run

**Seed 12, declared in `gate0/GATE0.md` §13 as the seed closest to the 20-seed median on BOTH arms**
— before its other numbers were looked at.

| | |
|:--|:--|
| no order at all | **4:24** (median 4:22) |
| back to front | **6:08** (median 6:08) |
| the gap | **+1:44, 39% longer** (base: random) |
| at 4:24, when the random cabin is full | back to front has **6 people still standing** and needs **another 1:44** |

**One caveat kept in the open: this run's random peak of 7 is above the 20-seed average of 5.0.**
The counter on screen is the run's own, so the copy is true of what is shown — but the claim that
holds everywhere is the **2-person ceiling on back to front**, and that is the one the reel leans on.

## Beats

| # | t | copy |
|:--|:--|:--|
| 1 | 0.25–2.75 | BOARDING IN NO ORDER AT ALL BEATS BOARDING **BACK TO FRONT.** |
| 2 | 3.45–7.7 | SAME 72 PEOPLE. SAME CABIN. ONLY THE ORDER CHANGES. |
| 3 | 8.0–12.9 | BACK TO FRONT PUTS EVERY BAG **IN THE SAME FEW FEET OF AISLE.** |
| 4 | 13.2–17.7 | SPREAD THEM OUT AND SEVEN STOW AT ONCE. |
| 5 | 21.0–24.7 | NO ORDER AT ALL: EVERYONE SEATED AT 4:24. |
| 6 | 27.9–31.1 | BACK TO FRONT NEEDED **ANOTHER 1:44.** |
| 7 | 31.7–37.6 | THEY RAN THIS FOR REAL. 6:11 AGAINST 4:44. |
| 8 | 37.9–44.7 | UNITED WENT WINDOW-MIDDLE-AISLE IN 2023. SOUTHWEST IN JANUARY. → Next: stand still on the escalator and more people get up it. |

**The opening beat plays the END of the race**, from sim 264 s, so the result is on screen at frame 0
and something is moving by 0.1 s — r009's one transferable finding, measured at +60% watch time:
show the result, do not promise it. It rewinds at 2.9 s behind a six-frame dip.

**One rate, everywhere: ×15, printed on screen.** No easing is applied to simulation time anywhere
in the file. The parked `I65` traffic build is why that is a rule and not a preference — it eased
the physics with the brand curve and printed **1:35 where a true ×12 said 1:05**.

**The 3D is spent on one move.** A race between two cabins reads from directly above and nowhere
else, so the reel opens and closes in plan view; at 7.6 s the cabin block tips to −1.0 rad, the two
cabins slide to 0.62 of their separation, and the whole thing grows 1.40× — the overhead bins exist,
the queue has height, and a bag goes up. It tips back at 18 s for the finish, which is a plan-view
fact. The camera never moves: `<ThreeCanvas>` takes it as a prop, so the root group is what rotates.

## Why red means "stowing"

`tokens.ts` says the failure accent is for the beat something breaks, and that decorative use
destroys it. **Here red marks exactly one quantity: who is currently blocking the aisle with a bag.**
That turns the claim into a colour you can count — one red figure on the left, five to seven on the
right — rather than a sentence you have to trust. `ReelGround` takes ASH, not FAIL, because passing
the accent to the ground washes the whole frame (the `r010` lesson). The `hot` flag on the copy is
off for the four beats that are not about back-to-front being slow.

---

## Traps

**1 · The no-overtaking invariant was asserted backwards, and fired on the first run.**
Whoever boards first ends up *furthest down* the aisle, so reading the slots front-to-back must give
queue positions in reverse. Caught by `check_invariants` immediately, which is the entire point of
having it.

**2 · `seat_class` was inverted on both sides, and nothing crashed.**
Seat 0 — the port window — reported as an aisle seat, so **WilMA boarded aisle seats first**, the
worst order there is, and **Steffen was charged 384 s of the seat interference it is defined not to
have.** No assertion fired. The only symptom was WilMA coming out slower than random, which is the
opposite of the published result. Found by printing the queue and reading the seat numbers.
**A silent inversion inside a helper is worse than a crash, and the only thing that catches it is
comparing against an outside measurement.**

**3 · One aisle slot per row over-predicted the effect the reel is about, by a factor of two.**
A standing passenger owned the whole 0.79 m pitch, so only one person in the cabin could ever stow
at a given row. That made back-to-front almost perfectly serial and reported it **66% slower than
random against the 31% measured.** A standing person is ~0.4 m wide in a 0.79 m pitch, so two fit
and both reach the same bin — two sub-slots per pitch brought it to −1%. **The direction of the
error is the lesson: a model that exaggerates your own claim will not be caught by any invariant,
only by the number somebody else measured.**

**4 · The motion audit failed the first render: 4.50 s dead spell at 33.0 s.**
The closing beats dimmed the cabins to 0.2 behind a 0.55 scrim so the field-test list could be read
over them. At 11% effective opacity the replay running behind it registered as **nothing at all**.
The fix was to move the object rather than hide it: the cabin block shrinks to 0.55 and lifts into
the top half, the list gets clean ground underneath, and the replay stays fully visible.
**Dimming the only moving thing on screen is the same mistake as freezing it.**

**5 · A seat filling is an event, and it was rendering as nothing.**
144 passengers sit down over the reel and each was a 44 × 36 px square quietly changing colour. The
audit measures mean change over the whole frame, so a small moving object is worth almost nothing
(r006's route-draw beat, 16%). Each seat now flashes brighter and larger for the half-second after
its passenger sits. **This is not a craft fix to a measurement — every flash marks a real event in
the run, and the audit was right that the events were invisible.**

**6 · Four layout collisions, all found in stills and none by the typechecker.**
"BACK TO FRONT" ran into "NO ORDER AT ALL" in the middle of the frame — **the cabin gap is set by
the text, not by the picture**, and went from 0.9 to 2.6 units. The "Next:" line landed on top of
the counters. Copy at 46 px wrapped to four lines and pushed into the cabin headers. The dive zoom
had to come down twice because the block's bottom corners magnify ~7% under perspective and crossed
into the action rail. `whiteSpace: nowrap` is now on both header blocks so a wrap cannot happen
quietly.

---

## Commands

```bash
python3 projects/r011_boarding/boarding.py --sweep      # the research, and the 144-point sweep
python3 projects/r011_boarding/dump_data.py             # the run the reel animates
python3 projects/r011_boarding/emit_ts.py               # 30 on-screen claims, or it refuses to write

cd remotion && npx remotion render r011-boarding \
  ../projects/r011_boarding/r011_boarding.mp4 --codec=h264 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell

python3 scripts/reel_motion_audit.py projects/r011_boarding/r011_boarding.mp4
python3 scripts/reel_safe_audit.py projects/r011_boarding/r011_boarding.mp4
```

**The render needs `--browser-executable`** in this container: Remotion's own Chrome download is
refused by the egress proxy (`403 Host not in allowlist: remotion.media`), and the pre-installed
headless shell works.
