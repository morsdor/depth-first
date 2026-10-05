# Gate 0 — `I85`, "the Uber you get isn't always the closest one"

Backlog id `I85`, `backlog/open.md` §2 → accent `infrastructure #00D6F7`. Reasoned from scratch,
2026-10-04, after the account owner asked for a narrated "how Uber works" video that a non-technical
viewer can follow at bird's-eye level and an engineer would enjoy, and explicitly asked for the
no-CS-words gate to be dropped for this one. **No reel number claimed** — it is claimed when the first
`.tsx` is written. Nothing has been built. This file and `payoff_frame.png` are the two artefacts
CLAUDE.md requires **before** any Python, any `.tsx`, any data module. Absorbs `I19` (the hexagon
grid) as one beat; `I19` stays an id and is not reused.

**This is a FORMAT experiment first and a topic second**, on the same footing as `I71`/`r010` (the
loop) and `I84`/`r012` (the data reel). Four things change at once against every reel before it:
**a spoken narration, a 75–90 s runtime, software-mechanism vocabulary, and the "how a company's
system works" genre.** The reference is `@rick.theengineer` (reviewed, not copied): per a third-party
breakdown, a faceless animated explainer under three minutes with word-timed captions, whose own
topics are software mechanisms (authenticator codes, rate limiting). I could not open his profile;
the follower and view figures in that source (108K; top reels 607K–954K) are its, not verified here.

## 1. The sentence — G2

> **"The Uber you get isn't always the closest one — it waits a few seconds and matches everyone at
> once, so the city's total wait comes out shorter."**

Two wording choices that matter, because the first draft was wrong:

- **"total", never "everybody waits less."** In the frame, *you* wait 3 minutes instead of 1 — one
  rider gets worse so the pair gets better. Uber's own page says the goal is to "reduce the average
  wait time for everyone, not just the closest pair": an average, not a promise to each person.
- **"a few seconds", never "two seconds."** Uber says "a few seconds". The 2-second figure appears
  only in secondary blog posts and is unverified.

### 1b. The sentence a viewer would now repeat — **APPROVED 2026-10-05**

Stage 3 found something the approved sentence did not know. Batching works but is small (−1.6% at 5 s,
and worse than not waiting at 60 s). **The larger and more visible effect is that the car that looks
closest on the map is not the quickest to reach you about half the time** (`../NOTES.md` §4, stress-tested).
So the thing a person would actually say at dinner has moved:

> **"Half the time, the car that looks closest on the map isn't the quickest — and Uber waits a few
> seconds to match everyone at once."**

The sentence approved at G2 (§1) is still true and is now the **second half**. **Approved by the account owner, 2026-10-05:** *"Approve the new sentence, go with Version B, record the
script."* It exists because of data that arrived after G2, and under this repo's law the sentence is the
human's to pass — it was put to them as a question and not assumed.

## 2. Who does the viewer send this to, and what are they proving?

**Honest answer, and it is a weak one:** to whoever asked *"why did the app send the car that's far
away when I could see one right there?"* — proving that it isn't random or unfair, there is a reason.

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Yes** — every rider has watched the little cars on the map and then been assigned one that is not the nearest dot. (Scoped: we do **not** claim batching is the cause of any one person's ride — see §8.) |
| A dispute already running, that a non-specialist is in | **UNVERIFIED.** Plausible — rider and driver grumbling about "why this driver" — but nothing here has confirmed a live argument non-specialists are in. Stage 3 must find one or this leg stays empty. `I24` and `r012` both died or bent on exactly this leg. |
| Resolves to one repeatable number | **To be computed** — one ratio from our own run ("the same riders wait X% less in total"). Nothing is assumed in this file. |

**This does not clear GATE 3 and is not claimed to.** It is bent, in writing, as an experiment — §5.
`r011` has already shown that a *named* send channel is necessary, not sufficient, and that
annoyance-loaded topics (nobody's identity is at stake in how a taxi app dispatches) do not travel.
Expect sends to be low.

## 3. The payoff frame

`payoff_frame.png` — from `mock_payoff.py`, PIL, ~5 minutes, **not a render**. A street map with a
river and two avenues, two riders and two cars. Dashed grey: first-come-first-served — you take the
closest car (1 min), the other rider is left with the far one (9 min), total **10**. Solid cyan: both
requests looked at together — you get the far car (3), they get the near one (2), total **5**.

**The minutes are illustrative and say so on the frame** ("NOT TO SCALE, NOT MEASURED"). They are a
hand-built case chosen to make the effect visible; the reel's numbers come from a real run (§6).
The map here is a generic grid, not a real city — the build must be a real one.

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| **The sentence needs a CS word** | **WAIVED by the account owner, 2026-10-04** ("we don't want to use any computer science term — remove it for this video"). The sentence itself needs none (closest, car, wait, city). The waiver is for the narration body. **Scope, narrowly:** a technical word may be *spoken*, but only **after** its picture and **attached to an object on screen**, and the sentence above may never depend on one. |
| **The payoff frame shows an object the viewer has never seen** | **No — passes.** A street map with cars and pins is nameable with the sound off and no labels; it is what the app looks like. Caveat: only a **real** city map passes this at build time, not the generic grid in the mock. |
| **The amazement depends on understanding first** | **AT RISK — and this is precisely what is being tested.** The frame needs one beat of setup (two riders, one nearest car) before "your closest car goes to someone else" lands. A software mechanism is invisible by nature (the explanation for `I52`, `I15`, `I24`). The bet is that a **voice delivers that setup at the same moment the picture shows it**, removing the order problem the gate was built around. |

Non-negotiable 6 (the recognisable object never leaves): **the whole reel is one city map.** Every
stage is an overlay *on* it — dots, a honeycomb, a request flaring, matching lines, road routes,
colour per cell. There is no boxes-and-arrows diagram, because that is a picture of an idea.

## 5. THE WAIVER, THE EXPERIMENT, THE CONFOUND — written before any build

**What is waived:** kill condition 1, for this concept only. **What is NOT waived:** kill conditions
2 and 3 (above), GATE 3 (answered badly, in §2), every gate G1–G5, "compute the animation, don't
author it", the ₹0 rule, and the nine non-negotiables.

**What this single post can and cannot test.** It changes narration, length, vocabulary and genre
together, so it **cannot** separate them. It tests one thing: **does a narrated, longer,
software-mechanism reel hold viewers on THIS account at all?** *(Vocabulary is exercised only if the owner
chooses script Version B — two spoken terms, "H3" and "batch", each after its picture. Under Version A no
technical word is spoken and the variables are narration, length and genre.)* A good result does not show the
narration was the cause; a bad one does not retire narration — the genre may be saturated, the
topic may be annoyance-loaded, or the audience may not be ours.

**Pre-registered, proposed here and adjustable by the account owner at G3 — never after posting:**

**The verdict is decided by ONE metric — average watch time — read two ways, because the reel under
test is about twice as long as the baseline and a percentage alone punishes exactly the variable
being changed** (50% of 85 s is ≈ 42 s, against `r014`'s 16 s).

| Primary — average watch time | Baseline: `r014` (44 s) | Success | Failure |
|:--|:--|:--|:--|
| **as % of runtime** | **36%** | **≥ 50%** (≈ 42 s of 85 s) | — (see verdict rule) |
| **in seconds** | **16 s** | — | **≤ 16 s** — no more attention in absolute terms than a reel half its length, so the voice and the length bought nothing |

**Verdict rule, fixed now:** the format **HOLDS** if average watch is **≥ 50% of runtime**. It **FAILS**
if average watch is **≤ 16 s**, whatever the percentage. **Anything between is INCONCLUSIVE, and the
reading says which kind:** e.g. "≤ 36% but > 16 s" means *the longer format held more total attention
than `r014` yet a smaller share of itself* — reported in exactly those words, never as a pass or a fail,
and never as evidence that narration was the cause.

**Secondary — reported, NOT part of the verdict.** They are read for what they add, and a low send
rate alone falsifies nothing here (sends are expected to be low).

| Metric | Baseline (the account's own) | Reading |
|:--|:--|:--|
| Skip rate at the hook | `r014`: 33.5%, flagged "Lower" | "Lower" = the opening held |
| Sends per reach | `r010`: 0.124%; `r011`: 0.041%; benchmark `r005`: 1.203% | **≥ 0.2%** is above everything since `r005`; **≤ 0.124%** is no better than `r010` |
| Saves per reach | `r011` flagged "Higher" while shares were "Lower" | "Higher" = practical utility travelled |
| Follows per reach | `r005`: 157 follows; `r001`–`r010` combined, without it: 3 | any lift is new |

Two readings, as for every reel: ~8 h and day 4.

## 6. Numbers — what is known, what is a lead, what is cut

**VERIFIED VERBATIM 2026-10-04.** The first look came through a fetch tool that summarises, so every
claim below was then re-checked against the raw page text (`curl` + tag-stripping, phrase search).
Both pages are server-rendered and readable.

| Claim | Source | Status |
|:--|:--|:--|
| "In the early days, a rider was immediately matched with the closest available driver" — which "sometimes led to long wait times for others", and "across a whole city, those longer wait times really added up". The batched alternative: "if we wait just a few seconds after a request", a batch of matches accumulates and "everyone's collective wait time is shorter". The stated aim is to cut the average wait "for everyone, not just the closest pair". **Uber's own page describes our race — first-to-request against batched — in its own words.** | `uber.com/us/en/marketplace/matching/` | **verified verbatim** |
| "closest doesn't always mean quickest" — "traffic, overpasses, rivers, and other geographical factors add complexity" | same page | **verified verbatim** |
| H3 is "our grid system for efficiently optimizing ride pricing and dispatch" | `uber.com/blog/h3` | **verified verbatim** |
| Hexagons have "only one distance between a hexagon centerpoint and its neighbors'", against **two** distances for squares and **three** for triangles | same post | **verified verbatim** |
| Surge: "we calculate surge pricing by measuring supply and demand in hexagons in each city that we serve" | same post | **verified verbatim** |
| 122 base cells; 16 resolutions; each finer resolution's cells have one seventh the area | same post | **verified verbatim** |
| H3 is open source under the Apache 2 licence | `h3geo.org/docs` | **verified verbatim** |

**Not claimed from Uber's page:** that "first to request" is what Uber does *today* — the page puts it
in "the early days". The reel compares the two methods; it never says which one any given ride used.

**Leads from secondary posts, NOT usable on screen until a primary source says so:** drivers' phones
report position "every ~4 seconds"; a 2-second batching window; DISCO / Google S2 / Ringpop as the
named internals; "1 million requests per second". Those blog results contradict each other
(H3 vs S2 for the same job), which is the warning. **Cut:** Uber's "saves 10 years of people's time
every day" — a marketing figure with no method behind it.

**Where the reel's own numbers come from:** the batching race is **ours**, run for real in Stage 3 — a
simulated fleet and riders on a real road graph, "nearest first" against "match everyone at once"
(`scipy` assignment), and every cell on screen drawn from the real `h3` library. **There is no real
Uber data in this reel and the fleet must be labelled SIMULATED on screen.**

## 7. Licence and feasibility

- **Road graph — OpenStreetMap, ODbL.** Attribute "© OpenStreetMap contributors" on screen and in
  the caption. We publish a video, not a database; if a derived graph file is ever published, the
  share-alike clause applies to it. Fetch with a real User-Agent (the default `urllib` UA gets
  HTTP 406) — `osmnx` sets its own — and fall back across mirrors if one refuses.
- **H3 — Apache 2.0** (the `h3` Python package). Uber's published *statements* are facts and citable.
- **Do not use Uber's logo, wordmark or brand colours.** The video is *about* the company and
  names it; nothing on screen may look like Uber's own material.
- **Feasibility:** a dispatch simulation on a city-scale road graph is well within a laptop's reach
  (the deleted `I15` build ran 26,000-junction Paris). The unknown is not feasibility — see §8.
- **City: OPEN, and it must be chosen before anything is run.** Trying cities until one flatters the
  claim is p-hacking when the computed result *is* the reel (`I53`'s rule). Needs a recognisable one
  with sound off; a city with a river or bay makes "straight-line nearest ≠ road-nearest" visible.
  **A constraint from Uber's own page:** it states that some of the features it describes "do not
  apply or are not available in California and in markets outside of the US". So Uber's matching
  wording is on firmest ground for a **US city outside California** — and Uber's own H3 post uses
  New York City (Manhattan) as its worked example. **Recommended: New York.** Its water makes the
  nearest-by-straight-line car and the nearest-by-road car visibly different, and a stranger can
  name it with the sound off. The alternative is an Indian city, which is closer to the account's
  audience but sits under that "markets outside of the US" caveat — workable only if the narration
  says "Uber says" and never "in your city".

## 8. Accuracy risks the build must not skate past

1. **A model that flatters its own claim — the `r011` / `I72` trap.** Batching beats first-come-first-
   served in a toy case by construction; in a realistic fleet the gain may be small, or negative at
   some densities. **The reel says what the run says.** If batching does not win, the beat dies or is
   rewritten, exactly as `I72`'s zipper did.
   Defences, all written before the run: **parameters chosen from ordinary values *before* the
   comparison; a sweep over every free one with the count reported; and an outside number** — find
   published dispatch/batching research and check the *size and ordering* of the effect against it
   before trusting ours. Be most suspicious if ours agrees with the story more strongly than the
   literature does.
2. **"Why was *my* driver far" — never claimed.** Many things send a farther car (the cars shown are
   not all assignable, availability changes, drivers decline). The reel states the mechanism and what
   Uber says it optimises, never that this is why any rider's last trip went the way it did.
3. **Uber's exact algorithm is not public.** The reel says what Uber states — it batches, it optimises
   the average — and shows *a* matching on a simulated fleet. It never says Uber's batch window, solver
   or parameters are what the simulation used.
4. **Surge and drivers.** If surge is a beat, it states only the published mechanism (price by cell
   from supply and demand). No claim about anyone's motives or about drivers "causing" a surge.
5. **Every "X happens because Y" sentence in the narration needs an experiment that could falsify it**
   (non-negotiable 7), and `emit_ts.py` must assert it at the moment the voice says it (§9).

## 9. Voice and word-sync — settled in the conversation, recorded here

- **The voice is the account owner's own**, recorded on an iPhone 15 (Voice Memos, Lossless), AirDropped
  over. Nothing is recorded until **G4 (the script) passes**; a 20-second test clip comes first.
- **Audio is the master clock.** Order: script approved → recorded → word-timed → build. The
  animation is anchored to *words*, not seconds, and `emit_ts.py` refuses to write a data module in
  which a number appears on screen before the voice says it, or in which a recorded word is missing
  from the approved script. Re-recording a line re-flows the whole reel with no hand-retiming.
- **Tooling is installed and proven** (2026-10-04): `whisper.cpp` 1.5.5 + `small.en` under
  `remotion/whisper.cpp/` (git-ignored; `node scripts/whisper-setup.mjs` rebuilds it), driven by
  `@remotion/install-whisper-cpp` with token-level timestamps; smoke-tested on a throwaway clip to
  millisecond word starts. **Three wrinkles, found by hitting them (all also noted in
  `whisper-setup.mjs`):** whisper writes "two" as "2", so the script aligner must treat digits and
  number-words as equal; `transcribe()` crashes unless `whisperCppVersion: '1.5.5'` is passed
  explicitly; and it drops a `tmp.json` into the **current directory** — run it from a scratch
  folder or delete it, never commit it. A word's *end* time includes the pause after it, so anchor
  animation to word **starts**.
- **The aligner is built and proven (2026-10-05):** `scripts/vo_align.py` + `remotion/scripts/vo-transcribe.mjs`.
  Tested on a stand-in read of the real script — **all 7 takes align, and it refuses a take with a skipped word,
  a changed claim or filler** (exit 1, no output file). Lessons from building it, all in the code: whisper.cpp's
  word **END** times are unreliable (the last word's end ran across the silence), so everything anchors on word
  **STARTS** and ends are derived; **padding the head scrambles the first words' times**, so leading silence is
  trimmed and only the tail padded (it clips abrupt endings); "7%" and "H3" are normalised; a one-for-one mishearing
  is a *confirm-by-ear* warning, a missing content word is a fail unless the owner confirms it with `--accept`.
- **Word TIMING comes from forced alignment, not the recogniser (measured 2026-10-05).** `scripts/vo_force_align.py`
  puts each word of the *approved script* onto the audio (torchaudio wav2vec2 CTC) and returns a time and an acoustic
  confidence per word. Tested against real speech onsets on the owner's recording: forced-alignment word starts land
  on energy onsets (strength 14.7), whisper's word starts score 11.4 — barely above a control with the SAME times
  shifted randomly by ±400 ms (9.8); where the two disagree (90 of 222 words) forced is 49 ms from a real onset,
  whisper 124 ms. Whisper stays as the independent check on **which words were said**; the two flagged the same weak
  spots. A bigger model (`medium.en`, 1.43 GB) fixed several recogniser misses but not the timing. **One continuous
  take is supported and preferred** (`vo_align.py --single`); seven takes was only a safety net.
- **Both channels must stand alone:** the audio must make sense as a podcast, and the picture with its
  captions must make sense with the sound off. Captions sit in a fixed band above y 1540 and count
  toward the three-text-blocks rule.
- **Length 75–90 s** (≈190–225 words at 150 wpm), hard ceiling 120 s. Guo, Kim & Rubin (2014) found
  shorter is more engaging, so every stage has to earn its seconds. 9:16 first; a 16:9 render is a
  composition change later.

## 10. Verdict

**G2 PASSED — 2026-10-05.** The account owner, after reading the sentence (§1), the waiver (§4–5) and
the pre-registered bands (§5) in full: *"Go with New York and proceed with next steps."* I am reading
that as a yes to the sentence, to the kill-condition-1 waiver, to the bands as written, and to GATE 3
being bent and run as an experiment (§2) — and as the answer to the city question: **New York.**
Gate 0 was not mine to pass; it is recorded here as theirs. **The city is now fixed and is not to be
revisited after any result is seen** — see `PREREG.md`.

**Stage 3 (research and measurement) is done — 2026-10-05.** Record: [`../NOTES.md`](../NOTES.md);
rules fixed in advance: [`../PREREG.md`](../PREREG.md); the G4 script awaiting approval:
[`../SCRIPT.md`](../SCRIPT.md). **The sentence held under the pre-registered test, but the effect is small
(−1.6% at 5 s) and reverses with plentiful cars; the largest effect measured is the straight-line-vs-road
error (50%, ~34 s).** Nothing in §5's bands has been read yet — they need a posted reel.

**G4 PASSED — 2026-10-05**, with the script's Version B (spoken "H3" and "batch") locked: [`../SCRIPT.md`](../SCRIPT.md). Next: the voice-over, then word timing, then the build.
