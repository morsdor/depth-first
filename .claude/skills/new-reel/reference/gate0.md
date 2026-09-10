# Gate 0 — the friend test, the licence question, and how to fail well

Stage 2 of `new-reel`. **Nothing is built — no Python, no `.tsx`, no data module — until the two
artefacts exist and the human has said yes.** Cost of the gate: about twenty minutes and one
still. Cost of skipping it: a day.

---

## Why this gate is human and not mine

`r005` was rebuilt **five times**. Every rebuild raised rigor and lowered recognition: v1 drew 16
coloured bars, v5 drew a 13×13 landing-position matrix measured over 400,000 shuffles. v5 is the
more honest reel and the less watchable one, because no viewer has ever seen either object. The
verdict that ended it — *"anyone who sees that will not understand even a single word; nobody
knows what it is for"* — was given **five times before it was heard**, because each time it was
answered with a craft fix.

**Every other gate in this repo is machine-checkable, which is exactly why the one that decides
whether the reel works had to become a human gate.** Machine-checkable rigor is the thing the
model drifts toward if nothing stops it.

I cannot pass this gate myself: I wrote the sentence, so I already know what it means, and I
cannot un-know it to judge whether a stranger would.

---

## The two artefacts, in this order

### 1. The sentence — first, as plain text, before anything is drawn

One sentence, in a normal person's words, that a viewer would say to a friend after watching.
**Not a description of the reel. The thing they'd repeat at dinner.**

### 2. One still of the payoff frame — evidence, not decoration

Drawn by hand or in PIL/matplotlib, in five minutes. **Not a render.** It exists to prove the
sentence can be *shown*.

---

## Ask about the SENTENCE, not the picture

**This is the r008 lesson and it cost a full build.** r008 passed this gate on the question
*"does a stranger know that's a city and want to know why the blue spread everywhere?"* — and the
answer was an honest yes, because the picture was genuinely good. It was built, and the verdict on
watching it was **"I didn't understand the point. We are comparing 2 algos?"** — exactly right. Its
sentence was *"that one change is the difference between checking 17,000 junctions and checking
1,700"*: a fact about algorithmic efficiency that nobody would ever repeat to a friend.

**A beautiful payoff frame will carry a bad sentence straight through this gate.**

> The gate question is **"would you say this sentence to someone?"** — and the frame is only there
> to prove the sentence can be shown. Sentence first, frame as evidence for it.

---

## The three kill conditions

**Any one of them ends the concept — pick a different id, do not repair it.**

### 1. The sentence needs a CS word

"Shuffle bias", "hash", "index", "edit distance", "quantise". If the sentence cannot survive
without it, the idea has no civilian surface and never will.

### 2. The payoff frame shows an object the viewer has never seen

A matrix, a bar chart, a grid of abstract cells, a graph — these are pictures *of* an idea, not the
thing itself. A city map, a photograph, a keyboard, a song, a lock, a queue of people: those are
objects.

**The test: can a stranger name what is on screen, with the sound off and no labels?**

A *legible* shape is not a *recognisable* object (`brand_guide_software.md` §13). r005 v5's heatmap
was perfectly legible and nameable by nobody.

### 3. The amazement depends on understanding first

If the viewer has to follow an argument before the frame is impressive, it is a blog post.

The `equation.verse` reel at 131,000 likes is a real Berlin street map flooding with a pathfinding
search — **you are amazed first, and understanding is the reward for staying.** That order is not
optional and it is not reversible.

**This is the one that keeps killing concepts, and it is not bad luck.** `I52`, both cuts of
`r008`, and `I24` all died here. A software mechanism is *invisible by nature*, so it always needs
a sentence of setup before the picture means anything — precisely the order this condition forbids.
A physical system is visible by nature. **A subject whose defining property is that it is invisible
cannot pass this gate.**

---

## Also required at this gate

### The discriminating question — cheaper than building

**Who does the viewer send this to, and what are they proving?**

- r006: *your uncle, that the earth is round.* ~66,000 views.
- r007: *nobody, nothing.* ~1,800 views. Same format, better motion numbers, 36× less reach.

Three conditions, all required (`brand_guide_software.md` §13):

1. **The viewer has personally witnessed the evidence** — seen it themselves, repeatedly. The
   seatback map. The blue dot. The shuffle that repeats an artist. Not "has heard of".
2. **A dispute is already running.** Somebody is publicly wrong about this regularly and somebody
   else corrects them. If you cannot picture the argument, there isn't one. **And it has to be an
   argument a non-specialist is in** — `I24` died on this: Minecraft seed disputes are real and
   are had only by Minecraft players.
3. **It resolves to one repeatable thing** — one number, ratio or subtraction, carried into the
   argument without the reel.

This is n=1 against n=1 and is not a law. It is the cheapest available filter and costs one
sentence to apply. **It does not license chasing conspiracy content** — the engine is "settles a
live argument", and flat earth is one arena among many, most of them cheaper and less toxic.

### The licence question — beside the friend test, not after it

**Before building, check that the data source may actually be used.**

r007's route was first measured out of TeleGeography's submarine-cable API. Their policy permits
screenshots of the published maps under CC BY-SA 4.0 but restricts *"the underlying databases"* to
paying subscribers — so the whole build had to be re-sourced **after Gate 0 had already passed**.
It survived only because a route rebuilt from public geography alone landed within 1.4% of it.

> **Published figures are facts and are citable. Route geometry is a database.**

That distinction is what let r007 keep naming MAREA and IMEWE and quoting their lengths.

Known-good sources: OpenStreetMap via Overpass (attribute ODbL; identify a real User-Agent — the
default urllib UA gets **HTTP 406** — and fall back across mirrors, as `i15_astar/fetch_graph.py`
does), GSHHG coastlines bundled offline in `basemap-data`, SRTM 1-arcsec from the AWS open-data
skadi endpoint (NASA, public domain, no key), public TLEs, published incident reports.

### The feasibility question

Does data at the needed resolution exist *at all*? `I53` failed partly here: 30 m SRTM cannot see
an underpass, AW3D30 is also 30 m, and municipal LiDAR is not public. **A feasibility kill does not
improve by trying again.**

---

## The GATE0.md template

Write to `projects/<id>_<slug>/gate0/GATE0.md`. Models: `r006_greatcircle` (passed),
`i53_flood` (failed by measurement), `i24`/`i52` notes in the backlog (failed on the sentence).

```markdown
# Gate 0 — `I<NN>`, "<the hook>"

Proposed as **rNNN**, <date>. Backlog id `I<NN>` (§<N> <section> → accent `<name> <hex>`).
Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md
requires **before** any Python, any `.tsx`, any data module.

## 1. The sentence

> **"<one sentence, a normal person's words, the thing they repeat at dinner>"**

## 2. Who does the viewer send this to, and what are they proving?

<a specific person and a specific claim, or the concept is weak — say so>

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | |
| A dispute already running, that a non-specialist is in | |
| Resolves to one repeatable number | |

## 3. The payoff frame

`payoff_frame.png` — drawn in <PIL / matplotlib>, not rendered, ~5 minutes. <what is in it,
and where the geometry/data came from>

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | |
| The payoff frame shows an object the viewer has never seen | |
| The amazement depends on understanding first | |

<plus: can the recognisable object stay on screen for the whole reel? (non-negotiable 6)>

## 5. Numbers, and where they came from

<every figure, its source, and which are still research leads>

## 6. Licence and feasibility

<may the data be used? does data at the needed resolution exist? cite the policy>

## 7. Accuracy risks the build must not skate past

<the "X because Y" sentences that need an experiment; the claims that would be false as written>

## 8. Awaiting

**A human yes.** Gate 0 is not mine to pass.
```

---

## The payoff-frame script

`projects/<id>_<slug>/gate0/mock_payoff.py` — model: `r006_greatcircle/gate0/mock_payoff.py`.

- **1080×1920**, composed inside the safe area (`y` 270–1540, `x` 60–870). The gate frame should
  be honest about the real canvas.
- Ground `#040E1F`, ink `#E8E6E1`, dim `#81A2C4`, land `#0D1F3C`, coast `#81A2C4`. **Accent comes
  from the section**, via `DOMAIN_ACCENT` in `remotion/src/brand/tokens.ts` — not from the hex in
  the backlog heading, which is stale.
- `matplotlib.use("Agg")`. Prefer offline data at this stage; a gate should not be blocked on a
  network.
- **Compute the real figures here.** The build reuses this script rather than re-deriving —
  `i17`'s great-circle and vertex-latitude numbers went straight from `mock_payoff.py` into the reel.

---

## How to fail well

A kill is a success at this stage. When one lands:

1. **Write the GATE0 file up as a failure record** — title it `— **FAILED**`, keep the sentence,
   state exactly which condition it died on and what the evidence was. `i53_flood/gate0/GATE0.md`
   is the model, including its note that a *broken* test first looked like a passing one.
2. **Append the verdict to the backlog row** as an italic note under it, with the date, and mark
   the hook `❌ **FAILED Gate 0, <date>**`. The id is permanent and stays.
3. **Do not repair, and do not go shopping.** Testing Mumbai, then Chennai, until one supports the
   claim is p-hacking when the causal claim *is* the reel. Pick a different id.
4. Fix anything true you learned on the way — `I24`'s note corrected the backlog's description of
   Minecraft terrain generation even though the concept died.
