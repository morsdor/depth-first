# s001 · The Physical Cost of AI — Script (v2 — ✅ LOCKED 2026-08-20)

> **Script-stage deliverable** (`the-engineering-atlas-video` → *Script*). Consumes `research.md`;
> feeds the storyboard. Mirrors `projects/001_roman_aqueduct/script.md`, the house format precedent.
>
> ✅ **LOCKED by the user 2026-08-20.** Cleared for the studio board (`studio-director`) and the VO
> record. Any change from here is a re-lock, because scene timings are timestamped against it.
> Target: ~11–13 min · ~140–150 wpm · one jaw-drop beat / 60–90 s · dual units throughout.
>
> ⚠ **Voice — one open check.** Written in registers borrowed from The Engineering Atlas
> (`brand_guide.md` §6–7): **Witness** frames the human stakes · **Engineer** explains · wit seasons.
> The channel now has its own guide — **re-read against `brand_guide_software.md` §6 ("The Insider and
> the Translator"), which supersedes those registers.** Locking the words does not lock the register;
> you record the VO yourself and your voice is final at the mic.
>
> **Structure = the locked dazzle ladder** (`research.md` §7): the unit of scale zooms out every act —
> rack → power plant → fab → nation → reactor — climbing to the LOCKED climax (Three Mile Island).
>
> **v2 changes (2026-08-10), per note:** (1) **Rebalanced off water.** Electricity is the spine (it's the
> title + the climax); water is now ONE tight beat, and the chip beat leads with *silicon/manufacturing*,
> not the fab's water. Power = 3 of 5 tentpoles + climax. (2) **Cut the finger-pointing.** Removed the
> "what everyone got wrong / feel guilty / distraction" media-criticism; the reflection beat (⑨) is now
> *wonder about the hidden machine*, in the register of 001's "no monument to a gradient." No villains.

**Provisional sign-off (channel-level TBD):** *"The next time it answers in a second, remember what it's standing on. I'll see you in the next one."*

---

## ⓪ Cold hook · 0:00–0:22 · **Engineer (the trap + reactor tease)** · 🎙 personalize at the mic
*[Visual: a phone in the dark. A thumb types something trivial — "write me a haiku about my cat." Send. A three-line poem appears in about a second. Calm. Weightless.]*

That took about a second, and it felt like nothing — because it very nearly *was* nothing. That answer cost around a third of a watt-hour of electricity and a mouthful of water. Less than running your microwave for two seconds.

*[Visual: hard cut — a hyperscale datacenter at night, electric-blue, vast, humming, a cooling plume rising against a dark grid of power lines. Scale-shock against the phone.]* So here is the strange question this video is going to answer. If one AI answer costs almost nothing — why did answering *enough* of them lead one of the largest companies on Earth to **restart a nuclear reactor?**

---

## ① Cold-open vignette · 0:22–1:10 · **Witness (the everyday user)** · 🎙 personalize at the mic
*[Visual: pull back from the datacenter to a city at 11pm — thousands of lit windows. Push into one: an ordinary person on a couch, face lit by a screen.]*

Right now, somewhere, it's late, and someone can't sleep, and they ask a machine a question they'd be embarrassed to ask a person. Somewhere else a student pastes in an essay. A coder asks why their code won't run. A kid asks how big a blue whale really is.

*[Visual: a scatter of these moments across a dark globe — each a faint blue spark.]* None of them are thinking about electricity. Why would they? The whole promise of this technology is that it feels *free*, and *instant*, and *weightless* — a genie that costs you nothing but the typing.

*[Visual: the sparks multiply — hundreds, thousands, a rising tide across the map.]* And for any *one* of them, that's very nearly true. But there is no such thing as one. Right now this is happening about **a billion times a day** — and every one of those weightless little questions reaches back, through a wire, to something enormous, and physical, and hidden, that somebody had to build, and power, and feed.

*[Visual: the tide of sparks resolves into transmission lines converging on one blazing datacenter.]* So let's follow a single question all the way back — and see what it's actually standing on.

## ② Title sting · 1:10–1:15
*[Wordmark + title card: **Why AI Is So Expensive to Run**. 2–3 s sting.]*

---

## ③ The honest setup · 1:15–2:20 · **Engineer**
*[Visual: clean isometric — a single glowing "query" travelling from phone → a server. The 0.3 Wh figure appears, small.]*

Let's start with the small number, because it's real, and it matters.

A short, ordinary question to a chatbot uses only about **0.3 watt-hours** of electricity — what a good LED bulb burns in a couple of minutes. You may have heard that each query gulps ten times a Google search. That figure came from 2023, on older hardware — and it's roughly **ten times too high** for a typical question today. The engineers got fast.

*[Visual: the small query balloons — a longer prompt, then a "thinking" reasoning model — the number climbing 0.3 → 2.5 → 40.]* Ask it to read a long document, and that climbs to a few watt-hours. Switch on one of the new *reasoning* models that thinks before it answers, and a single hard question can burn **forty watt-hours or more** — over a hundred times the simple case.

*[Beat.]* So hold onto the friendly number — 0.3. Not because it's wrong, but because the story was never that one query is expensive. The story is what it takes to answer *a billion* of them a day, forever — and to keep making the machine hungrier. Follow the wire.

---

## ④ Tentpole 1 · The appetite · 2:20–4:00 · **Engineer** *(the electricity spine · scale: a rack eats like a town)*
*[Visual: the query arrives; we fly through the datacenter doors — aisle after aisle of racks, roaring with fans. Land on one server.]*

Your question doesn't land on "a computer." It lands here — in a building the size of several football fields, full of machines that never sleep.

*[Visual: hero reveal of a single GPU — an NVIDIA H100 — lifted out and lit like a jewel, then slotted back.]* The thing actually answering you is a chip like this — an **H100**. One of them, flat out, draws about **700 watts** — a microwave's worth of power, for one chip. But you're not answered by one.

*[Visual: the chip multiplies — a tray of eight, a rack, a hall.]* They run in trays of eight, and one tray pulls around **ten kilowatts** — the electricity of about **five homes** — to do arithmetic, fast, in the dark. Fill a rack with trays and a hall with racks, and a single building is running the power of a small town. That is the fundamental fact about artificial intelligence that the smooth little chat window is designed to hide: underneath, it is a *ferociously* hungry machine, and what it is hungry for is **electricity.**

*[Visual: the hall's heat shimmer; cooling kicks in — cold aisles, liquid lines.]* And there is a catch built into physics. Everything that much electricity does, it eventually turns into *heat* — and a hall like this would cook itself in minutes if nobody carried the heat away. Which is the second cost, the one nobody sees.

---

## ⑤ Tentpole 2 · The heat, and the water · 4:00–5:15 · **Engineer** *(scale: the datacenter → the power plant)*
*[Visual: the cooling towers outside, exhaling white vapour into the night.]*

The cheapest way to move a mountain of heat is water — so a big part of this machine exists just to evaporate it, the way sweat cools you down.

*[Visual: on-site — water through cooling loops, a little steam; a small figure: ~a few mL.]* At the datacenter itself, one answer evaporates only a few *millilitres* — a rushed sip. But that isn't where most of the water is.

*[Visual: pull back along the transmission lines to a power plant miles away, its own giant towers steaming.]* Because the electricity had to come from somewhere — and most of the world still makes power by boiling water into steam to spin a turbine, in plants that evaporate their own rivers to cool back down. So every watt your question borrowed from the grid had *already* spent a little water, miles away, before it ever reached the building.

*[Visual: the two sources add — the on-site sip + the plant's share — to ~15 mL.]* Add them up, and a single answer costs somewhere around **fifteen millilitres** of water — a real mouthful. The exact figure is genuinely hard to pin down; it depends on where the datacenter sits and how it's cooled. But a mouthful is the right order of magnitude — and, once again, there is no such thing as one. Now — where does a chip like that even come from?

---

## ⑥ Tentpole 3 · The chip was expensive before it thought · 5:15–6:45 · **Engineer** *(scale: a chip → a city-fab · the silicon/manufacturing dimension)*
*[Visual: rewind the H100 back to a blank silicon wafer, back to a factory. A cleanroom: white suits, EUV machines the size of buses.]*

Because before that chip ever answered a single question, it was one of the most difficult objects humanity knows how to make.

*[Visual: EUV lithography machine, hero-lit — the Veritasium "most important machine" energy; patterns finer than a virus.]* The features carved onto it are smaller than a virus, printed by firing light at silicon with a machine so complex that **only one company on Earth** can build it. Getting from sand to a working AI chip takes hundreds of steps, in a factory that has to be cleaner than an operating room and never, ever stops.

*[Visual: the fab's appetite — power lines in, purified-water lines in, materials in.]* And a factory like that is a monster of its own. One leading-edge chip fab runs on the electricity of a small city *and* the water of a small town — millions of gallons a day, purified past anything found in nature — just to keep printing silicon. The company that makes most of the world's AI chips gets through more power and water in a year than some entire countries.

*[wit:]* So your chatbot's brain was thirsty, and power-hungry, before it ever had a thought. Expensive to build. Expensive to cool. Expensive to make. Now do the one thing that turns all of this from a curiosity into a crisis — **multiply.**

---

## ⑦ Tentpole 4 · Where the power comes from · 6:45–8:30 · **Both** *(back to the electricity spine · scale: a fab → a nation)*
*[Visual: zoom out — one datacenter to a map studded with hundreds, glowing across the US, Europe, Ireland.]*

We followed the heat, and the water, and the silicon. Now follow the thing the whole machine actually runs on — electricity — and ask a simple question: where does *a billion queries' worth* of it come from?

*[Visual: the demand curve climbing steeply.]* One query is a sip. But a billion a day, and *climbing* — data-centre electricity is growing about **fifteen percent a year**, more than four times faster than everything else we plug in.

*[Visual: Ireland lighting up alarmingly on the map.]* Here's what that looks like when it lands on a real place. In Ireland, data centres now draw **twenty-three percent of the entire country's electricity** — nearly a quarter of a national grid, feeding server halls instead of homes. In a decade it grew more than *five hundred percent* — until the country started refusing to connect new ones.

*[Visual: the US map; the IEA projection bar climbing past heavy industry.]* And Ireland is just the sharpest edge of it. Today the world's data centres already use more electricity than most countries on Earth. By 2030 they're on track for around **three percent of all the power humanity generates** — and in the United States, they'll soon draw more than making *all* the country's aluminium, steel, cement, and chemicals — **combined.**

*[Visual: a quiet counter-beat — a "training" bar shrinking, a "running it" bar swelling.]* And it doesn't slow down, because of a quirk most people never hear. We picture the giant cost as *training* — building the model once. But the forever-cost is *answering* you, a billion times a day — and running the thing has quietly outgrown building it. Which is how you end up with a company doing something that would have sounded insane ten years ago.

---

## ⑧ CLIMAX · The reactor · 8:30–10:00 · **Engineer → Witness** *(scale: a nation → a dedicated reactor · pays off the cold hook)*
*[Visual: slow reveal — the twin cooling towers of Three Mile Island, silent, against a grey Pennsylvania sky.]*

This is Three Mile Island. If the name rings a bell, it should. In 1979, one of its two reactors suffered the worst nuclear accident in American history — a partial meltdown that helped freeze new nuclear construction in this country for a *generation.* Its surviving twin ran on quietly until **2019**, when it was switched off — simply too expensive to keep running. The lights went out. It was over.

*[Visual: 2024 — crews, trucks, the plant stirring; a "restart" chyron.]* Except in 2024, it came back. Not for a city. Not for a region. **Microsoft signed a twenty-year deal to buy the entire output of a restarted Three Mile Island reactor — 835 megawatts, every watt of it — to match the electricity its AI data centres burn.** Over a billion dollars, to wake a *nuclear reactor* from the dead.

*[Visual: 835 MW resolving into ~800,000 lit homes — then those homes greying out as the power re-routes to a single datacenter.]* Eight hundred and thirty-five megawatts is an entire power station — enough to light **three-quarters of a million homes** — and its whole output now has one customer, feeding one appetite.

*[Beat, hold on the towers.]* That is the real answer to the question we opened with. Your one question costs a sip. But all of them, all the time, growing every year — cost a reactor. That is why AI is so expensive to run. Not the query. The *machine* behind it.

---

## ⑨ What most people never see · 10:00–11:15 · **Engineer (first person)** · 🎙 personalize at the mic · *wonder, not scolding*
*[Visual: slow pull back from the datacenter to the phone we started on — the haiku still on screen.]*

Here's the thing I keep coming back to.

Any one of these questions really is almost nothing. Your own AI use is a rounding error on your life — the energy of a query is a few seconds of television. That's true, and it's worth saying plainly.

*[Visual: the tide of a billion sparks again, resolving into the reactor.]* But line them up — a billion a day, growing every year, all landing on the same few grids and rivers and towns at once — and "almost nothing," repeated at that scale, becomes a reactor. The weight was never in the question. It's in the machine that makes the question feel free.

*[Visual: the whole hidden chain, held for a moment — rack, cooling tower, power plant, fab, reactor.]* And that's the part I find genuinely remarkable. We built something so good at hiding its own weight that a civilisation-sized effort — power plants, cooling towers, a factory cleaner than a hospital, a reactor pulled back from the dead — collapses down to a blinking cursor and a one-second reply. There's no monument to a datacenter. The most impressive thing about this machine might be that you never have to see it.

*[Beat.]* It isn't weightless. It never was. It just feels that way — and that feeling might be the most expensive thing we've ever engineered.

---

## ⑩ Close + sign-off · 11:15–11:45 · **Engineer**
*[Visual: back to the phone. A thumb hovers, then types one more throwaway question. Send.]*

So the next time it answers you instantly, and it feels free, and weightless, and like magic —

*[Visual: pull the wire back one last time, one continuous move: phone → datacenter → power plant → the reactor.]* remember what "instant" is standing on. A rack that eats like a town. A power plant that drinks for it. A chip that took a small country's worth of power and water to carve. And, at the end of the line, a reactor somebody brought back from the dead to keep the whole thing fed.

It's the most impressive machine most people will never see — and it is anything but free.

*[Sign-off:]* The next time it answers in a second, remember what it's standing on. I'll see you in the next one.

## ⑪ Outro card · last 5–8 s
*[Subscribe prompt + next-video thumbnail. Title sting reprise.]*

---

## Fact-lock checklist (verify these are the on-screen wording before storyboard)
- [x] **Energy ≈ 0.3 Wh / short query** — solid; 3-source convergence (Epoch 0.3 / Google 0.24 / Altman 0.34). Old "3 Wh / 10× a Google search" flagged as **2023, ~10× too high** (`research.md` §1).
- [x] **Scales: ~2.5 Wh (long) → ~40 Wh (reasoning/heavy)** — Epoch. Script keeps "0.3 is the friendly floor," so the "expensive" thesis rests on fleet + heavy queries, not the cheap case (honesty guardrail).
- [⚠] **Water ≈ 15 mL all-in (~few mL on-site + ~10 mL grid)** — **contested / scope-dependent.** v2 scripts it plainly as two boundaries added, with an *honest humility* line ("hard to pin down… a mouthful is the right order of magnitude") — **no myth-busting / finger-pointing.** The "bottle of water" viral claim is simply **not repeated** (was 2023/GPT-3, retracted). Water is now ONE beat. `research.md` §2.
- [x] **H100 ≈ 700 W; 8-GPU tray ≈ 10 kW ≈ 5 homes; heat → cooling overhead (PUE ~1.1–1.2)** — solid (`research.md` §3).
- [x] **Chip fab: electricity of a small city + water of a small town (up to ~10 M gal/day ≈ 33,000 homes); TSMC > some countries in power+water/yr; EUV = only one maker (ASML)** — solid (WEF / IEEE Spectrum). ⚠ "only one company can build the machine" = **ASML (EUV lithography)** — accurate; keep it about the *machine*, not the whole chip. v2 leads this beat with *manufacturing/precision*, water as one paired input.
- [x] **Data-centre electricity ~15%/yr; ~1.5% world power (2024, 415 TWh) → ~3% by 2030 (~945 TWh); US > aluminium+steel+cement+chemicals combined by 2030** — solid (IEA), framed as projection.
- [x] **Ireland ≈ 23% of national electricity (2025); +518% in a decade; new-build restrictions** — solid (CSO Ireland).
- [x] **Inference now the majority of lifetime footprint (> one-time training)** — scripted as "running it > building it," as wonder not "you're wrong."
- [⚠] **Three Mile Island** — 1979 meltdown = **Unit 2**; the reactor **restarting is Unit 1, the undamaged twin** (shut 2019, economic). Script says "one of its two reactors" melted down and "its surviving twin" restarts — ✅ does NOT imply reviving the melted reactor. Microsoft = 20-yr PPA, **835 MW**, ~2027–28, matched to its datacenters.
- [⚠] **835 MW ≈ 750,000–800,000 homes** — rule-of-thumb; "three-quarters of a million" is conservative. Keep as "enough to light ~¾ million homes," not a precise claim.
- [x] **~1 billion ChatGPT queries/day** — Altman's figure; attribute as order-of-magnitude scale, not a census.

## Word count / runtime
**1,748 words of VO ≈ 12.1 min at 145 wpm** with the reveals breathing. *(Measured 2026-08-20 by
stripping all scene headings, stage directions and markdown from the spoken lines. The previous
"~1,950 words ≈ 11.8 min" was an estimate and internally inconsistent — 1,950 at 145 wpm is 13.4 min.
`script-analyzer` timestamps scenes off this figure, so it needs to be the real one.)* Both land
inside the 11–13 min target. Resource balance: **power = ④, ⑦, ⑧
(spine + climax)** · **water = ⑤ (one tight beat)** · **silicon/manufacturing = ⑥.** If it runs long, tighten
⑨→⑩ (they share a closing image); protect the five escalation beats (④–⑧). First-person beats (⓪, ①, ⑤ close,
⑦ close, ⑨, ⑩) are yours to re-voice at the mic.
