# r011 · `I73` — your airline boards the plane worse than no method at all

**Built 2026-09-12. 45.0 s · 1350 frames · 13 MB. BOTH AUDITS PASS. GATE 5 PASSED
2026-09-12** — *"It is a great video and idk how it will perform but I absolutely love it."*
**Ready to post; not yet posted.**

| audit | result |
|:--|:--|
| motion | longest dead spell **0.50 s** (limit 1.5 s) · event density **33%** · median change 0.679 |
| safe area | worst bbox **x 60..868, y 296..1528** inside x 60..870, y 270..1540 · **no exemption claimed** |

**Event density 33% is below the teaching-reel benchmarks** (r004 42%, `I51` v5 53%) and that is
honest rather than fixable: the moving parts are a ~40 px-wide aisle strip in each cabin, and the
audit measures mean change over the whole frame, so small moving objects count for almost nothing —
the same shape of problem as r006's route-draw beat at 16%. **A drifting camera would lift the
number without adding an event**, which is the blind spot CLAUDE.md names and the `I51` mistake. If
it reads as static on a phone, the answer is more events, not more drift.
 Accent `#FF4D4D` (`failure`, §6). Teaching format.
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

**6 · The safe-area audit found the field-test list 68 px past the bottom, on 396 frames.**
Every row of it was sized by eye and nothing added up the total: five rows of 52 px mono with 16 px
padding, a header and a citation came to y 1608 against a limit of 1540. The follow ask was down
there too, at y 1400, fighting the same 44 px of frame. The list is now tighter and the **ask moved
into the copy slot**, which is where every other line of type in this reel already lives.
**A block of stacked type needs its height added up, not eyeballed** — and `reel_safe_audit.py`
could not tell me, because it crashed on a bare `FileNotFoundError`. There is no system ffmpeg in
this container and the bundled compositor has no rawvideo muxer, so that script cannot run here at
all; it now says so and names `reel_safe_frames.py`, which is the tool the `r010` lesson settled on.

**7 · `reel_safe_audit.py` COULD REPORT PASS HAVING MEASURED NOTHING, and that is now fixed.**
Its own sibling script documented it: with an ffmpeg that cannot decode h264 or mux rawvideo, the
frame generator yielded zero frames and the script printed **PASS with an inverted bounding box
(x 1080..-1)**. In this container it did not even get that far — no system ffmpeg at all, so a bare
`FileNotFoundError`. **A green tick over nothing measured is the one failure an audit must not
have**, and it was not container-specific: the same silent pass was available on any machine where
the decode produced nothing. Verified rather than assumed that the bundled compositor has no
rawvideo muxer (`Requested output format 'rawvideo' is not known`).

Both ffmpeg builds here will write PNGs, and so will any normal system ffmpeg, so the mp4 path now
decodes to PNGs and calls the measurement in `reel_safe_frames.py` — **one implementation, one
verdict, and it fails closed**: no frames, or every frame under the luminance floor, is a FAIL with
a non-zero exit. Cross-checked against the manual PNG path on this reel: identical bbox.

**8 · Four layout collisions, all found in stills and none by the typechecker.**
"BACK TO FRONT" ran into "NO ORDER AT ALL" in the middle of the frame — **the cabin gap is set by
the text, not by the picture**, and went from 0.9 to 2.6 units. The "Next:" line landed on top of
the counters. Copy at 46 px wrapped to four lines and pushed into the cabin headers. The dive zoom
had to come down twice because the block's bottom corners magnify ~7% under perspective and crossed
into the action rail. `whiteSpace: nowrap` is now on both header blocks so a wrap cannot happen
quietly.

---

## PRE-REGISTERED, BEFORE POSTING — what each reading would settle

**Written before the reel went up, because a prediction made afterwards is not one.** `r010` is the
precedent: its rewatch bet was written down in advance and then **missed its own number**, which is
the only reason that result taught anything instead of being re-narrated.

**This is a teaching reel and it is graded on sends per reach.** The benchmark is `r005` at
**1.203%**. Everything since is zero or near it; `r010`, the best of them, sent at **0.124%**.

| reading | what it would settle |
|:--|:--|
| **sends ≥ 1.0% of reach** | **argument ammunition GENERALISES.** `r005` would stop being one lucky arena and become a repeatable channel — which is the single most valuable thing this account could learn |
| **sends 0.4–1.0%** | the channel is real but **the arena is a multiplier.** Flat earth is identity-loaded; boarding is annoyance-loaded. Keep using the filter, expect less from low-stakes disputes |
| **sends < 0.2%, on a 3-of-3 GATE 3 score** | **the send test is not sufficient**, and that is a genuine falsification of the current thesis. `I73` scored as well as anything since `r005` on the filter CLAUDE.md calls the account's only evidence-backed lever. If it still does not travel, the lever is the ARENA, not the filter — and the next reel should be picked on how much somebody's identity is at stake, not on whether a dispute exists |
| **average watch < 11 s (25% of 45 s)** | **the runtime is wrong for this account regardless of content.** This is the longest teaching reel since `r007`. `r009` ran 12.5% at 40 s, then 19.8% after the hook re-cut. Under 25% here means 45 s cannot be earned and the ceiling is ~30 s |
| **double-digit follows** | second real signal in the account's history. `r005` has 157; every other reel combined has 3 |

**What would NOT settle anything:** views. `r010` took the account's second-best reach and returned
0.247% likes and no rewatch lift, and `r009` v3 won its pre-registered metric and posted the worst
reach on the account. **Reach is the thing sends cause, not the thing to read.**

**One confound to note in advance:** this is the first reel whose headline number is somebody
else's published measurement rather than our own simulation. If it travels, that may be the
citation doing the work — "they actually tested this" is its own kind of credibility — and not the
argument channel. Worth separating before concluding either way.

---

## Caption, proposed — not yet written to `reel_captions_log.md`

*(That log is updated on POSTING, along with the "Built so far" table, `brand_guide_software.md`
§13, and moving `I73` from `backlog/open.md` to `backlog/posted.md`. `r010`'s row in the captions
log still reads "not recorded — confirm what went out", which is the reason this one is drafted
before posting rather than after.)*

> **Back to front is slower than no system at all.**
>
> In 2011 somebody built a mock 757 on a soundstage, put 72 people through it five different ways,
> and timed it. Boarding people in a completely random order beat the airline's back-to-front order
> by a minute and a half — 4:44 against 6:11.
>
> The reason isn't walking speed. The aisle is the only way in, and only one person can use a
> stretch of it at a time, so what sets the pace is **how many people can stow a bag at once.** Back
> to front packs everyone who still has a bag into the same few feet of aisle: two at a time, and
> never more than two. Spread them out and it's seven.
>
> United switched to window-middle-aisle in 2023. Southwest did it in January.
>
> Simulation is a car-following-style agent model of a 12-row single-aisle cabin, run on the same
> 72 passengers in both orders. Nothing is fitted: it lands within 1% of the measured back-to-front
> time and 7% of the random one. Field test: Steffen & Hotchkiss, *J. Air Transport Management* 18
> (2012) 64–67.

**Hook line:** "Boarding in no order at all beats boarding back to front."
**The load-bearing phrasing:** *back to front* is always named as a **method**, never as "your
airline". Most carriers do something like it, United and Southwest do not, and boarding groups are
tied to fare and status — so the claim is about the order, which is what was actually measured.

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
