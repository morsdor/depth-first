# SCRIPT — `I90`, "half the time, the car that looks closest isn't the quickest"

**Gate 4 — PASSED 2026-10-05.** The owner: *"Approve the new sentence, go with Version B, record the script."*
**The lead sentence (G2) is approved; Version B (spoken "H3" and "batch") is LOCKED and is what the table
below says.** Two items were not answered and are treated as the defaults written here, flagged so they can
still be changed before recording: the **next-reel line** (beat 7, "how a map app finds your route" → `I16`)
and the **reading pace** (see the runtime line).
Nothing is built: no `.tsx`, no data module, no `r018` claimed (that happens when the first `.tsx` is
written; this folder moves to `projects/` then). **The narration column below IS the recording script**
(split into takes in [`RECORDING.md`](RECORDING.md)); the aligner refuses any spoken word that is not in it,
so changing a word means changing this file first.

> ## G2 re-approved 2026-10-05 — the lead sentence
> **"Half the time, the car that looks closest on the map isn't the quickest — and Uber waits a few seconds
> to match everyone at once."**
> This replaced the batching-only sentence approved earlier, which is now the second half. Why it moved:
> [`GATE0.md`](gate0/GATE0.md) §1b.

**Runtime ≈ 91 s** — 222 spoken words: **83 s if you read briskly (165 wpm), 91 s at a natural pace
(150), 101 s if you read slowly (135).** Ceiling 120 s. Version B is a few seconds longer than the
75–90 s target at a natural pace and inside it when brisk — aim brisk. 9:16, safe area, word-timed captions
in a fixed band above y 1540. Format experiment, pre-registered: [`GATE0.md`](gate0/GATE0.md) §5.

## What the research changed about the plan — read this before the table

1. **The lead is the road, not the batching.** Trusting the map's straight-line "closest" picks the wrong
   car **48.6–50.2%** of the time (robust to a chord-geometry check; one-way streets alone are worth about 10 points of it). The first estimate of the cost, 34 s,
   was **inflated by a geometry artefact**; the defensible figure is **~24 s a ride on average** (the
   median wrong-car rider loses ~22 s, and 17% lose over a minute). So the script says "about twenty-five
   seconds a ride" — never "half a minute", and never "every wrong car costs…".
2. **It is mostly NOT rivers.** A river is between you and the map's pick in only **2.9%** of wrong-car
   cases; with every street two-way it is still **39.5%**. The cause is **the street grid and one-way
   streets**; rivers are rare and severe. The narration says "blocks, one-way streets, **now and then** a
   river".
3. **The batching result is real and small:** −1.6% at 5 s (interval excludes zero), −2.4% at best, **worse
   than not waiting at 60 s**, and it **loses when cars are plentiful** (9 of 27 settings). The script says
   "a little shorter" and spends its payoff on the **trade-off** (too little waiting buys nothing, too much
   backfires), not on a percentage.
4. **The Delft 11% never goes on screen** — it would sit beside our seconds as a second ruler, and our
   model reaches only 2–9%. The study backs the *shape* and stays in the caption and `NOTES.md`.

## One ruler

**Seconds a rider waits.** Every number on screen answers that. The other figures — 7%, 97.6%, half,
one in thirteen — are each stated **once, as a locked fact**, never beside a competing unit.

## The script

*On-screen from the first frame to the last: a small **SIMULATED · NEW YORK · SOUTH OF 96TH ST** tag and
**MAP © OPENSTREETMAP CONTRIBUTORS** — credits, not counted among the three text blocks.*

| t (est. at 150 wpm) | Narration — spoken = captions, verbatim | On screen | Anchor words (events fire on the word's START) | Why this beat exists · source |
|:--|:--|:--|:--|:--|
| **1 · 0.0–8.0** | **"The car that looks closest on your map? In our simulated New York, half the time it isn't the quickest."** | A real road map, 3D, alive from **0.5 s regardless of the words**: ~300 car dots drifting, a rider's pin pulsing **REQUEST**. By **~2.5 s** the payoff is already visible without a word: a dashed straight line to the car that looks closest (**2:20** by road) and a second car's route lighting beside it (**2:02**) — the two ETAs ride on the cars. | *closest* → the dashed line sharpens · *half the time* → both routes hold · *quickest* → the 2:02 car pulses | The hook SHOWS the result inside the first 3 s and names a recognisable object. "Closest doesn't always mean quickest" is Uber's own wording. **The example is not hand-picked:** rider 3 of the median episode (rule in `NOTES.md` §4); the gap, 18.5 s, is deliberately a typical one, not a dramatic one. |
| **2 · 8.4–22.4** | **"Uber built a honeycomb for dispatch. It's called H3. Cut a city into hexagons and nearby can mean your hexagon and its six neighbours: in our simulation, seven percent of the cars, and almost always the closest one."** | The real H3 grid (resolution 8, 112 cells) blooms outward from the rider's cell, a small **H3** label on it; the 7-cell cluster lights; cars inside it brighten; a counter reads **20 OF 300 CARS (AVERAGE)**; a tick lands on the true nearest car with **97.6%**. | *honeycomb* → grid blooms · *H3* → the label pulses · *neighbours* → 7 cells light · *seven percent* → counter · *almost always* → tick | Uber built H3 "for… pricing and dispatch" (verbatim). 6.7% and 97.6% are ours. **The spoken words are scoped:** "can mean", and "in our simulation" — they do **not** say Uber's matching searches cells this way (nothing verified says so). |
| **3 · 22.8–37.6** | **"But close on the map isn't close on the road: blocks, one-way streets, now and then a river. Trust the straight line and you pick the wrong car half the time, costing about twenty-five seconds a ride."** | Camera drops to rider 3: the route from the map's pick threads around blocks and a **one-way arrow** forces the loop. At *a river*, a second rider (**rider 102**: 664 m by straight line, **8:30** by road, against **4:50** for the quickest car) shows a route to a bridge. Then **49%** counts up (label *WITH 300 CARS AROUND*) and **≈ 25 s PER RIDE** lands beside it. | *blocks* → grid detour · *one-way* → arrow · *a river* → rider 102's bridge · *half the time* → 49% · *twenty-five seconds* → ≈ 25 s | Our largest measured effect, stress-tested (`NOTES.md` §4): **48.6%** and **23.7 s** on near-straight edges (50.2% / 34.4 s before the chord fix). Rivers shown because they are vivid and **said to be rare**; 13 of the episode's 360 riders are in that position. |
| **4 · 38.0–50.8** | **"Uber's first idea: send the closest available driver, one request at a time. Some riders got stuck waiting, and across a city it added up. So now it waits a few seconds."** | The median seed's episode plays one request at a time: each pin snaps to its closest free car with a line. One rider — **the longest pickup in that episode, by rule (rider 355, a 14-minute pickup)** — is left with a very long line and a clock counting their wait. At *waits* a small **5 s** ring appears over the map. | *one request at a time* → pins snap in sequence · *stuck waiting* → long-line rider + clock · *waits* → 5 s ring | Uber's own account, near verbatim: "In the early days… the closest available driver… sometimes led to long wait times for others… across a whole city… really added up." **"So now" is ours** — the page says "early days" and then the batch; it does not say the first method was dropped everywhere. |
| **5 · 51.2–72.4** | **"Same riders, same cars. One side matches them one at a time. The other waits five seconds, then matches everyone together, as one batch. One rider in thirteen gets a car that isn't their closest, and the total wait comes out a little shorter. Wait a whole minute and it's worse than not waiting at all."** | Split screen, the same episode. Left **ONE AT A TIME**, right **WAIT 5 s, MATCH TOGETHER**, each with a live **average wait** counter. On the right, riders who did not get their closest car show a line to the car they got and a ghost line to the closest. The counters settle with the right a touch lower (**138.8 s → 137.2 s**, this episode). Then a slider sweeps the right panel's wait from 5 s up to 60 s and its counter **climbs past the left (141.6 s)**. Final card: **AVERAGE OF 20 RUNS — 143.7 s · 141.4 s · 149.1 s**. | *same* → split · *one at a time* → left runs · *five seconds* → right's ring · *one batch* → the right panel's matches outline as a single group · *one rider in thirteen* → highlight 7.8% · *shorter* → counters settle · *whole minute* → slider to 60 s · *worse* → right passes left | **The approved sentence, measured:** −2.3 s, 95% interval [−3.5, −1.0], 7.8% not given the closest car, **+5.4 s worse at 60 s** (`NOTES.md` §3). The U-shape is the engineer's payoff and matches the Delft study's shape. Live counters are **this episode's**; the card is the **20-run** mean, labelled as such. |
| **6 · 72.8–84.0** | **"The same hexagons count who wants a ride and who's free. That's how Uber says it sets surge prices. A few seconds of patience, and there's your ride."** | The hexagon layer returns, coloured by requests ÷ free cars per cell, from the same episode; one hot cell pulses (**no price shown**). The matched car reaches the rider's pin; the wait clock stops. | *count* → cells colour · *surge* → hot cell pulses · *ride* → car arrives, clock stops | Verbatim: "we calculate surge pricing by measuring supply and demand in hexagons". **No price, multiplier or claim about anyone's motives.** |
| **7 · 84.4–88.8** | **"Next: how a map app finds your route. Follow for more."** | The finished map held for the full 3 s; the closing line over it. | — | Non-negotiable 9: end on a reason to follow, performable on the phone in hand. **The next-reel line is the owner's to choose — see below.** |

## Version B — LOCKED 2026-10-05 *(the table above already says it)*

You asked for technical terms to be allowed, so two are spoken — each **after** its picture and attached to an
object on it. **This post therefore exercises all four variables**: narration, length, vocabulary and genre.

- beat 2: *"Uber built a honeycomb for dispatch. **It's called H3.** Cut a city into hexagons…"* (+3 words)
- beat 5: *"…then matches everyone together, **as one batch**."* (+3 words)

For engineers they are the wink; for everyone else they cost three words each and are explained by the picture.

## The checks this table must pass before it goes to you

- **The copy column, read alone, is a complete story** — *the car that looks closest often isn't the
  quickest; Uber's honeycomb is how "nearby" can be found; the road, not the map, decides — blocks, one-way
  streets, now and then a river; the first method left some riders waiting; so now it waits a few seconds and
  matches everyone together; that helps a little, until it doesn't; the same honeycomb prices surge; there's
  your ride.* No pronoun without an antecedent ("it" in beat 4 follows "Uber"; "it's worse" in beat 5 follows
  "wait a whole minute"). Listened to as audio only it makes sense; with the sound off the map and captions
  carry it.
- **The disclaimers are IN the words, not only in the why-column** (non-negotiable 7): beat 1 says "in our
  simulated New York"; beat 2 says "can mean" and "in our simulation"; nothing spoken says how Uber finds
  nearby cars.
- **One ruler:** seconds waited. ✔
- **The hook shows the result inside 3 s and names a recognisable object** (a road map, a car, a rider). ✔
- **Names ride on the objects**; never more than **three text blocks** at once (caption + at most two labels,
  e.g. the two ETAs). ✔
- **Jargon:** Version A speaks none; Version B speaks two, after their pictures.
- **Every claim traced** to a primary source or our own run (`NOTES.md` §1), every "because" measured —
  including the one that turned out to be the minor cause.

## Contract for the build — `emit_ts.py` refuses to write the data module unless ALL hold

| Claim | Asserted as | Result it must match |
|:--|:--|:--|
| "half the time" (beats 1, 3) | wrong-car share, 300 cars, **both** the as-run and the near-straight-edge run within 45–55% | 50.2% · **48.6%** |
| "about twenty-five seconds a ride" | the **near-straight-edge** mean extra pickup within 20–30 s (the 34.4 s as-run figure is documented as inflated and is **not** used) | **23.7 s** |
| "now and then a river" | share of wrong-car cases with a river between rider and the map's pick **≤ 10%** | 2.9% |
| "seven percent of the cars" | cars in 7 cells within 5–9% of the fleet | 6.7% |
| "almost always the closest" | true nearest inside the 7 cells ≥ 95% | 97.6% |
| "one rider in thirteen" | not-closest share at 5 s within 7.0–8.5% | 7.8% |
| "a little shorter" | paired 95% interval for 5 s entirely below 0 **and** the cut under 5% | −1.6% |
| "worse than not waiting" | paired 95% interval for 60 s entirely above 0 | +3.8% |
| "five seconds" / "a whole minute" | the intervals run are 5 s and 60 s | — |
| **the episode itself** | seed 18 is the median-gain seed of the 20; **its own** every-5-s total is below its own FD, and its own every-60-s total is above it, so the animation never contradicts the claim it illustrates | 137.2 < 138.8 < 141.6 |
| **the on-screen instances** | each is the result of its rule (`showcase_instances.py`), pool = cars still free under FD at the rider's request time, near-straight edges only | rider 3 (2:20 vs 2:02) · rider 102 (8:30 vs 4:50) · rider 355 (14:00) |
| **timeline-bound** | no number appears on screen before its anchor word is spoken, and no counter reads a value its sentence has not yet reached | checked per beat against the aligned word times |

## What is NOT claimed

Not that batching is why *your* last car was far. Not Uber's batch window or solver — "a few seconds" is
Uber's phrase and **five seconds is ours**. Not that "first to request" is current practice. Not the 11% as
ours. **Not that Uber's matching searches hexagon cells.** Not any surge price. Not that rivers are the main
reason a straight-line pick is wrong. Not that the fleet is Uber data — **it is simulated and says so from
the first frame.** Not the whole city: the box is New York south of 96th St, about 55% Manhattan.

## Decisions — resolved 2026-10-05

1. **G2, the lead sentence — APPROVED.**
2. **Version B — CHOSEN** (spoken "H3" and "batch"). The post exercises narration, length, vocabulary and genre.
3. **The next-reel line (beat 7) — NOT ANSWERED; the default stands:** "how a map app finds your route"
   (`I16`). It is a promise to the audience, so it can still be changed **before recording** by editing the
   beat 7 row here — after that it means re-recording one 4-second take.
4. **Reading pace — NOT ANSWERED; aim brisk, ~150–165 wpm.** Version B is ≈ 91 s at a natural pace.
5. **The table — APPROVED as G4.** From here it is a contract: a beat that cannot be animated as scripted
   comes BACK here as a script change; it is never improvised at build time.

**Watch item for the build:** beat 5 carries two panel labels, two counters, the caption and a BATCH outline —
the densest frame. Sequence them (labels fade as the counters arrive) so no more than three text blocks are
ever on screen together.

## Build amendments — where building forced a change to the approved table (2026-10-05)

The script is a contract, so each deviation is written down here and reported to the owner, not absorbed silently.
**No spoken word changed.** Every item is on-screen only.

| # | Beat | The table said | The build does | Why |
|:--|:--|:--|:--|:--|
| 1 | 1 | a pin pulsing **REQUEST** | the pin pulses with no text | the three-text-blocks rule: caption + two ETAs already make three |
| 2 | 2 | a counter **"20 OF 300 CARS (AVERAGE)"** | the counter reads **"≈ 7% OF THE CARS"** | the cluster drawn for this rider holds 7 cars; "20 of 300" next to 7 highlighted dots would contradict the picture. 7% is the 20-run average, as spoken |
| 3 | 3 | the river "lights" | the **rivers are drawn** from OpenStreetMap coastline (a tinted water layer + shoreline), so the viewer can see the East River the car is across | without water the beat had no river to show — found in the first stills |
| 4 | 3 | "−25 s PER RIDE" | **"≈ 25 s PER RIDE"** | the measured figure is 23.7 s; the copy says "about twenty-five", so the label says approximately |
| 5 | 4 | "the longest pickup, rider 355, a 14-minute pickup" | the label reads **WAIT 14:00**, counting up as the route draws | the pickup is 840.5 s; the first-dispatch playback shows the first 150 s of the episode, then the stuck rider is the episode's own longest, drawn at its late-episode state |
| 6 | 5 | a "BATCH" outline | the right panel's matches are drawn together; **no extra BATCH tag** | text-block budget; the panel label already says "MATCH TOGETHER" |
| 7 | 5 | "one rider in thirteen" highlighted | the **18 riders (5.0%) in this episode** who did not get their closest car are ringed, and the copy's "thirteen" is the **20-run average (7.8%)** | the episode is the median-gain seed, not the median not-closest share; the two are different statistics and the screen does not put a number on the 18 |
| 8 | 6 | the clock "stops" | **WAIT 1:52** — rider 3's own wait under the 5-second policy, from the episode | the matched car drives the real route; the clock counts to the real number |
| 9 | 7 | the finished map held 3 s | held from the last word (77.3 s) to 80.5 s, with the closing line replacing the captions | non-negotiable 9 |
| 10 | all | the voice begins at its first word | the build **skips the first 0.85 s of the voice file** so the first word lands at 0.27 s | the recording has ~1.1 s of lead-in; the hook cannot afford it |
| 11 | 5 | the 20-run averages shown beside the race | a **card above the caption** with three labelled columns (**AT ONCE 143.7 s / 5 s WAIT 141.4 s / 60 s WAIT 149.1 s**); the episode's own counters fade while it is up | two rulers at once was a real defect: the episode (138.8 vs 141.6) and the 20-run mean (143.7 vs 141.4) are different statistics; the screen shows one at a time |
| 12 | all | the voice file as recorded | **light-cleaned** (high-pass, denoise, gate, loudness -16 LUFS), word starts re-measured by forced alignment against this script | the horns in the room; the owner chose the light clean and will add music |
