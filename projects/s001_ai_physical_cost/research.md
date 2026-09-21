# s001 · The Physical Cost of AI — Research + Fact-Check

> **Research-stage deliverable** (`the-engineering-atlas-video` → *Research + Fact-Check*). Consumes the
> locked `packaging.md`; feeds the Script. Mirrors `projects/001_roman_aqueduct/research.md`, the house
> format precedent. Every headline number is grounded in a cited source below; contested figures are
> flagged **⚠ contested** and must be pinned (or phrased as a range) before the script gate.

| Field | Value |
|:--|:--|
| **Video #** | s001 (software channel — pilot) |
| **Locked title** | *Why AI Is So Expensive to Run* (F2) |
| **Concept** | The hidden industrial machine — power, water, chips — behind a single AI answer |
| **Status** | ✅ Research complete — hero-number gate cleared; **thumbnail unblocked** (with a recommended pivot, see below). One decision left for the user: which hero number the thumbnail carries. |
| **Date** | 2026-08-10 |

---

## The headline finding (read this first)

The video's spine is an **asymmetry that is *literally true*:** a single AI answer costs almost nothing —
about **0.3 watt-hours** of electricity and on the order of **10–15 mL of water** — yet the machine behind
it is one of the largest industrial build-outs on Earth, on track for **~3% of all global electricity by
2030**. **The per-query cost being tiny is not a problem for the story — it *is* the story.** The drama is
the multiplication: one trivial "hi," times a billion a day, times explosive year-on-year growth,
concentrated onto a handful of gigawatt campuses.

This has one sharp consequence for packaging, resolved at the bottom: **the water-number-bet runner-up
title fails the fact-check and must be killed or reframed**, and the **thumbnail hero number should move
from the (tiny, or contested) per-query figure to the (solid, visceral) aggregate/machine scale.**

---

## 1. The hero number — ENERGY per query ✅ solid

**~0.3 watt-hours (Wh) for a typical short text query.** This is now well-converged across three
independent 2025 sources:

| Source | Figure | Notes |
|:--|:--|:--|
| **Epoch AI** (2025) | **0.3 Wh** / typical GPT-4o query | The most transparent derivation (assumptions below) |
| **Google** (Aug 2025) | **0.24 Wh** / median Gemini text query | + 0.03 g CO₂e; claims 33× efficiency gain in 12 mo |
| **Sam Altman** (Jun 2025) | **0.34 Wh** / average ChatGPT query | First OpenAI datapoint; *not* peer-reviewed |
| ~~de Vries (2023)~~ | ~~~3 Wh~~ | **The old viral figure — now ~10× too high**, don't use it |

**Why 0.3 Wh, not 3 Wh (Epoch's assumptions — these are the ones the script must be honest about):**
GPT-4o ≈ 100B *active* params (of ~200B total) · **500 output tokens** assumed (~400 words, a realistic
short answer, *not* the old estimate's 2,000) · NVIDIA **H100 at ~1,500 W including datacenter overhead** ·
only **~10% compute utilization** in practice · **~70% of peak power** on average → **~1×10¹⁴ FLOP/query**.
The old 3 Wh number assumed 2,000 tokens, older A100 hardware, and peak power with no utilization
discount — all three wrong for typical chat.

**⚠ The honest caveat the script MUST carry — this number is for a *short* query.** Cost scales hard with
length and "thinking":
- ~10,000 input tokens → **~2.5 Wh** · ~100,000 tokens → **~40 Wh** (Epoch).
- **Reasoning models** (o1-style) emit ~2.5× more tokens → multiply accordingly.
So "0.3 Wh" is the floor case. A long document analysis or an agentic session is 10–100× that. The title
"expensive to run" is cashed by *the fleet and the heavy queries*, not the cheap one — say so.

**Human-scale equivalents (for the script, all defensible):** ~2 minutes of a 10 W LED bulb (Altman's
"high-efficiency bulb for a couple of minutes") · ~9 seconds of television · roughly one second of a
microwave (Google/Ritchie).

---

## 2. The hero number — WATER per query ⚠ contested (this is the honesty crux)

There is **no single honest water number** — it swings ~50× depending on *what you count* and *where the
datacenter is*. This is the single most important thing to get right, because the catchy "bottle of water"
framing is where this video could lose the expert audience.

**The estimate depends entirely on scope:**

| Scope | Figure | Source |
|:--|:--|:--|
| **On-site only** (direct evaporative cooling) | Altman **0.32 mL** (0.000085 gal) · Ren **~5 mL** | Altman 2025; Ren 2026 |
| **All-in** (on-site **+** the water the power plant evaporates to make the electricity) | **~15 mL** for a modern GPT-4 prompt (≈5 mL on-site + ~10 mL grid) | Ren (UC Riverside), revised 2026 |
| ~~Original 2023 "Making AI Less Thirsty"~~ | ~~500 mL per **10–50** queries~~ (≈10–50 mL each, GPT-3) | **Ren himself now calls this outdated/high** |

**Why the two scopes differ so much:** most of the "water cost of AI" is *not* at the datacenter — it's at
the **power plant**. Thermoelectric generation (gas, coal, nuclear) evaporates water to cool its
condensers, so every kWh a datacenter pulls from the grid drags an *indirect* water footprint behind it.
That off-site grid water is the ~10 mL that turns Altman's ~0.3 mL into Ren's ~15 mL. **Same query, both
numbers true — they're measuring different boundaries.** The script must state the boundary out loud.

**And it's wildly location/design dependent (Water Usage Effectiveness, L/kWh):**
- AWS **0.15** · Microsoft **0.30** (down from 0.49 in 2021) · Google **0.84** · **industry average ~1.8–1.9**.
- Microsoft's newest (Aug 2024+) datacenter design uses **zero water for cooling** (closed-loop) — saving
  >125 M L/yr per facility. So "AI drinks water" is already partly an *old-design* story; the frontier is
  trading water for electricity (closed-loop costs more power).

**Verdict for the hero number:** the defensible modern figure is **~10–15 mL all-in per short query**, but
it is soft, contested, and scope-dependent — **not** a number to bet a thumbnail on without heavy framing.

**🚫 The "bottle of water per query" claim is FALSE at modern per-query scale.** 500 mL was *10–50 queries*
in 2023 on GPT-3, and the author has since walked it down. Using "a bottle of water to answer one AI
question" as a literal per-query title would be an **overclaim that burns the exact expert audience this
channel is for** — the F1/F2 failure mode `packaging.md` explicitly warns against. (A defensible *bottle*
framing exists only at the aggregate — see §5 — or loosely for a whole *conversation* of ~30–50 turns,
which is soft and I'd avoid.)

---

## 3. The industrial chain to render — the scenes ✅

Each link is a plate/scene, following the query downstream. This is the visual spine and it's rich:

1. **The prompt.** A phone, one throwaway message ("hi" / "write me a haiku"). The asymmetry's small end.
2. **The GPU cluster — the engine.** NVIDIA **H100: ~700 W peak, ~500 W average** per card. An **8-GPU
   HGX/DGX node ≈ 10 kW**. Racks of them; hot aisles; **liquid cooling** (20–30% more efficient than air).
   *This is the literal machine that "runs" the answer — the Branch Education GPU precedent lives here.*
3. **Datacenter overhead (PUE).** Modern hyperscale **PUE ≈ 1.1–1.2** — for every watt into the chips,
   ~0.1–0.2 W more for cooling/power delivery. The building as a machine.
4. **Cooling — where the on-site water goes.** Evaporative cooling towers (the plume in the thumbnail) vs.
   the new **closed-loop / zero-water** designs. The visible "breath" of the datacenter.
5. **Grid + substation.** Transmission lines, a substation stepping down a city-scale load into one campus.
6. **Generation — the power source, and the news hook.** AI is so hungry that Microsoft signed a **20-year
   PPA to restart Three Mile Island** (**835 MW**, targeted ~2027–28) — a *shut-down nuclear reactor being
   brought back to life for one company's datacenters.* Plus new gas plants and real grid strain. **This is
   the most cinematic, most defensible beat in the whole video.**
7. **The hidden water (indirect).** Back at that power plant: the condenser cooling that evaporates the
   ~10 mL of "grid water" per query. Closes the loop on §2's two numbers.
8. **Upstream — the silicon (the Veritasium/Branch precedent).** Making the chip is its own industrial
   epic: **TSMC used ~101 billion litres of water in 2023**; a single leading-edge fab can consume up to
   **~10 million gallons of ultra-pure water/day (≈ 33,000 US homes)** and **30–50 MW** of power; ultra-pure
   water itself takes ~1,400–1,600 gal of municipal water per 1,000 gal produced; **EUV lithography** is the
   "most important machine" beat. The chip is expensive *before it ever runs a query.*

---

## 4. The aggregate scale — the real story ✅ solid (IEA is the anchor)

The per-query numbers are tiny; **these are not.** This is where the title cashes, and the macro figures
are rock-solid (IEA), unlike the contested per-query water:

| Fact | Figure | Source |
|:--|:--|:--|
| Datacenters, share of world electricity (2024) | **~1.5%** = **415 TWh** | IEA |
| Datacenters, projected 2030 | **~945 TWh ≈ 3%** of world electricity (doubles) | IEA |
| Growth rate | **~15%/yr** — 4× faster than all other electricity demand | IEA |
| AI-optimized datacenter demand by 2030 | **more than quadruples** | IEA |
| US datacenters, share of US demand *growth* to 2030 | **~half** | IEA |
| US datacenters by 2030 | more electricity than **aluminium + steel + cement + all energy-intensive manufacturing combined** | IEA |
| **Ireland** (the vivid one) | datacenters = **23% of national electricity** (2025), up **518%** in a decade — more than all urban homes combined | CSO Ireland |
| One AI query fleet | **~1 billion** ChatGPT queries/day | Altman |
| Training vs. inference | GPT-4 training ≈ **50 GWh one-time** (~15,000 t CO₂, ~3,200 cars/yr) — but **inference now ~60–80% of lifetime footprint** | leaked/derived estimates |

The Ireland number is the single best "whole country" beat; the Three Mile Island restart is the single
best "one company, one reactor" beat; the IEA "more than all heavy industry combined" line is the best
"this is civilization-scale" beat.

---

## 5. The honest counter-framing — the thesis that keeps the video credible

This is the discipline `packaging.md`'s Phase-0 handoff #3 demanded. The video must **not** moralize about
your one prompt. The most credible voices (Hannah Ritchie, Google, even the critics) agree the individual
query is negligible:

- **A single query is a rounding error on a person's footprint.** 10 queries/day ≈ **0.03%** of a typical
  person's daily electricity; the energy of a query ≈ **9 seconds of TV** (Ritchie). Blaming the individual
  prompt is, in Ritchie's framing, a *distraction*.
- **So the honest thesis is: it's an *aggregate + concentration + velocity* problem, not a per-prompt guilt
  problem.** Billions of queries × ~15%/yr growth × geographic concentration = gigawatt loads landing on
  single towns and grids (Ireland 23%; US half of all load growth; a reactor restarted for one campus).
  The issue is **load growth and local water/grid strain**, not your haiku.
- **This makes the asymmetry the honest hook, not a cheat.** The thumbnail's tiny "hi" against the vast
  datacenter is *true*: the query really is trivial, the machine really is enormous. The video earns the
  gap by walking the chain (§3) and then multiplying it up (§4) — never by pretending one query boils a
  lake.

Get this right and the video is both a banger and unimpeachable to the dev audience. Get it wrong (imply
one query = a coal plant) and it's just another AI-doom clickbait the experts screenshot to dunk on.

---

## 6. Consequences for packaging — what research changes

### Titles
- **✅ Locked — *Why AI Is So Expensive to Run* (F2):** SAFE and honest. "Expensive to run" is cashed at
  aggregate + heavy-query scale; no per-query overclaim required. **Keep.**
- **✅ Runner-up — *AI's Enormous Power Problem* (F5):** SAFE and the *most* documented angle (grid strain,
  Ireland 23%, Three Mile Island, IEA). The purest engineering frame. **Keep as the safe alternate.**
- **🚫 Runner-up — *It Takes a Bottle of Water to Answer One AI Question*:** **KILL as a literal per-query
  title.** Research says the modern figure is ~15 mL, not 500 mL; the 500 mL figure was 10–50 queries and
  its own author retracted it. As written it's the overclaim that burns the expert audience. *If* a
  water-shock title is still wanted, it must move to the aggregate ("How Much Water AI Really Drinks") and
  even then water is the softest, most-contested lane — I'd bench it behind the two power lanes.

### Thumbnail hero number — ⚠ recommendation (needs user lock), mirrors 001's `2.5 cm` decision
`packaging.md` deferred the thumbnail number to this stage. **Research says: don't put a per-query number
on it.** Per-query energy (0.3 Wh) is *true but not visceral* (a tiny number doesn't shock), and per-query
water is *visceral but not solid*. The honest + shocking number lives on the **machine/aggregate** side of
the asymmetry:

| Option | Thumbnail number / phrase | Read |
|:--|:--|:--|
| **A (recommended) — the reactor** | **image:** phone "hi" → datacenter wired to a **nuclear plant**; word/number *"a nuclear reactor"* or **835 MW** | Honest + jaw-dropping + *documented* (Three Mile Island). The asymmetry at its sharpest: one "hi" vs. a restarted reactor. |
| **B — the fleet multiplier** | **`1,000,000,000 / day`** (queries) over the datacenter | Turns the tiny-but-true query into the machine via honest multiplication — the exact thesis of §5 |
| **C — the civilization number** | **`3% of Earth's power`** (by 2030) | Biggest, most authoritative (IEA), but abstract at 120 px |
| D — per-query (original plan) | `~0.3 Wh` or `~15 mL` | ⚠ **not recommended** — energy too small to shock; water contested/overclaim-prone |

→ **User to lock the thumbnail number/direction** (A recommended). The **Phase-0 blocker is cleared either
way** — the hero-number question is answered; we're now choosing *which* solid number carries the frame, not
hunting for one that exists.

---

## 7. The dazzle spine — the tentpole beats (PROPOSED, feeds the script)

A 10–13 min video needs **4+ escalating jaw-drops**, not one climax. These are the tentpoles, ordered so
**the unit of scale zooms out at every beat** — house → power plant → city → nation → reactor. Each is
already fact-checked above; the cold hook is the honest small number that sets the trap.

**Cold hook — "it costs basically nothing" (the trap).** One answer ≈ 0.3 Wh + a sip of water (§1–2). It
*feels* like the video is over. That's the setup — the whole video is the reveal of what's behind the "sip."

| # | Tentpole (the dazzle) | The unit of scale | The defensible fact (§ref) |
|:--|:--|:--|:--|
| **1** | **The invisible factory** — your one "hi" lights up a rack of GPUs pulling as much power as a street of houses, breathing through cooling towers | **a house → a rack** | H100 ~700 W; 8-GPU node ~10 kW ≈ 5+ homes; PUE ~1.15 (§3) |
| **2** | **The water you can't see** — most of AI's water isn't at the datacenter; it evaporates at a power plant *miles away* making the electricity | **datacenter → power plant** | ~5 mL on-site vs ~15 mL all-in; the ~10 mL grid water (§2) — the twist/reveal beat |
| **3** | **The chip was an epic before it ran anything** — one fab drinks ~10 M gallons of ultra-pure water/day (33,000 homes); TSMC used 101 B litres in 2023; EUV = the most complex machine humans mass-produce | **a chip → a city-scale fab** | §3 beat 8 (ties to the Veritasium/Branch precedent) |
| **4** | **AI is eating whole countries** — Ireland now sends **23% of its entire national grid** to datacenters; by 2030 US datacenters out-consume aluminium + steel + cement + all heavy industry combined | **a fab → a nation** | IEA + CSO Ireland (§4) |
| **★ CLIMAX** | **The reactor** — so Microsoft restarted **Three Mile Island**, America's most infamous nuclear site, **835 MW, 100% for its AI** | **a nation → a dedicated reactor** | §3 beat 6 / §6 (LOCKED thumbnail) |

**Optional bench beat (if a 5th is wanted / for retention mid-Act-2):** *inference dwarfs training* — people
assume the one-time training is the big cost, but running the model for users is **~60–80% of its lifetime
footprint** (§4). Counterintuitive reveal; good pace-changer.

**Why this order works:** it's honest (starts by admitting one query is trivial), it escalates the unit of
measure at every beat so the viewer never plateaus, and every rung climbs *toward* the locked reactor payoff
— the thumbnail promise the whole video is walking to. Status: **proposed** — lock/reorder at the script gate.

## Phase-0 handoff questions — answered

1. **The hero number (energy/water per query)?** → **Energy: ~0.3 Wh** for a short query (solid, 3-source
   convergence; scales to 2.5–40 Wh for long/reasoning). **Water: ~10–15 mL all-in but contested** (0.3 mL
   on-site → ~15 mL with grid water; wildly location-dependent). **The "500 mL bottle per query" claim is
   false — kill it.**
2. **The industrial chain to render?** → §3: prompt → GPU cluster (H100 ~700 W) → datacenter (PUE ~1.15) →
   cooling (towers vs. closed-loop) → grid/substation → generation (nuclear PPA / gas) → indirect grid
   water → upstream silicon fab (TSMC, ultra-pure water, EUV). Eight renderable beats.
3. **The honest counter-framing?** → §5: individual query = negligible ("rounding error," ~9 s of TV); the
   real story is aggregate + concentration + growth velocity (IEA ~3% by 2030; Ireland 23%; TMI restart).
   Frame it as a *load-growth/local-resource* problem, never a per-prompt morality tale.

---

## Open items — for the script gate
- [x] **Thumbnail direction — ✅ LOCKED A (the reactor), 2026-08-10.** Hero = phone "hi" → datacenter wired
      to a nuclear reactor; number = **835 MW** / "a nuclear reactor" (Three Mile Island restart). B/C kept as
      A/B-test alternates. → next: generate Stage-4 typography.
- [ ] **Decide the water beat's framing** — recommend presenting *both* boundaries (on-site vs. grid)
      explicitly rather than asserting one number; turns the dispute into a teaching beat (same move 001 made
      with the contested 12–17 m fall).
- [ ] **Confirm "0.3 Wh" phrasing carries the "short query" caveat** in the script so the "expensive"
      thesis rests on fleet + heavy queries, not the cheap case (the honesty guardrail).
- [ ] Reference images (datacenter isometrics, H100, cooling towers, EUV, substation) pulled to
      `references/` — *manual, pre-storyboard.*

---

## Sources
- [Epoch AI — *How much energy does ChatGPT use?*](https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use) — 0.3 Wh/GPT-4o query; assumptions (100B active params, 500 tokens, H100 @1,500 W, 10% util, 70% power); scaling to 2.5 Wh @10k / 40 Wh @100k tokens; reasoning ~2.5×
- [Hannah Ritchie — *AI footprint, Aug 2025*](https://hannahritchie.substack.com/p/ai-footprint-august-2025) — Google Gemini 0.24 Wh / 0.03 g CO₂e median query; "rounding error" / 0.03% of daily electricity; ~9 s of TV; individual vs. systemic framing
- [DatacenterDynamics — Altman's 0.34 Wh / 0.000085 gal](https://www.datacenterdynamics.com/en/news/sam-altman-chatgpt-queries-consume-034-watt-hours-of-electricity-and-0000085-gallons-of-water/) — OpenAI's first datapoint; not peer-reviewed; ~1B queries/day → ~85,000 gal/day
- [Li, Ren et al. — *Making AI Less "Thirsty"* (arXiv:2304.03271)](https://arxiv.org/abs/2304.03271) — original 500 mL / 10–50 GPT-3 responses; GPT-3 training ≈ 5.4 M L (700k L on-site)
- [AI Weekly — *UC Riverside walks back the water-per-prompt figure*](https://aiweekly.co/alerts/uc-riverside-walks-back-ais-viral-water-per-prompt-figure) & [Fortune](https://fortune.com/article/how-much-water-does-ai-use/) — Ren's revised ~15 mL all-in (≈5 mL on-site + ~10 mL grid); original figure "outdated"
- [Microsoft Datacenters — efficiency / WUE](https://datacenters.microsoft.com/sustainability/efficiency/) & [zero-water design](https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/12/09/sustainable-by-design-next-generation-datacenters-consume-zero-water-for-cooling/) — MSFT WUE 0.30 L/kWh (was 0.49); AWS 0.15; Google 0.84; industry avg ~1.8–1.9; new closed-loop = zero water
- [IEA — *Energy demand from AI* (Energy and AI)](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai) & [Executive summary](https://www.iea.org/reports/energy-and-ai/executive-summary) — datacenters 415 TWh (1.5%) 2024 → ~945 TWh (~3%) 2030; ~15%/yr; AI demand >4×; US ≈ half of demand growth, > all heavy industry combined by 2030
- [CSO Ireland via Tom's Hardware](https://www.tomshardware.com/tech-industry/data-centers/irelands-data-centers-consumed-nearly-as-much-electricity-as-every-home-in-the-country-combined-in-2025-server-farms-gulped-23-percent-of-national-power-despite-years-of-grid-restrictions) — Irish datacenters 23% of national electricity (2025), 7,663 GWh, +518% in a decade
- [DatacenterDynamics — Microsoft / Three Mile Island PPA](https://www.datacenterdynamics.com/en/news/three-mile-island-nuclear-power-plant-to-return-as-microsoft-signs-20-year-835mw-ai-data-center-ppa/) & [MIT Tech Review](https://www.technologyreview.com/2024/09/26/1104516/three-mile-island-microsoft/) — 20-yr, 835 MW, Constellation restart ~2027–28, 100% to Microsoft
- [TRG Datacenters — H100 power](https://www.trgdatacenters.com/resource/nvidia-h100-power-consumption/) & [Tom's Hardware](https://www.tomshardware.com/tech-industry/nvidias-h100-gpus-will-consume-more-power-than-some-countries-each-gpu-consumes-700w-of-power-35-million-are-expected-to-be-sold-in-the-coming-year) — H100 ~700 W peak / ~500 W avg; DGX 8-GPU ≈ 10 kW; 2M H100s ≈ 1.4 GW
- [World Economic Forum — semiconductor water](https://www.weforum.org/stories/2024/07/the-water-challenge-for-semiconductor-manufacturing-and-big-tech-what-needs-to-be-done/) & [IEEE Spectrum — fabs cut water](https://spectrum.ieee.org/fabs-cut-back-water-use) — TSMC ~101 B L water (2023); fab up to ~10 M gal ultra-pure water/day (≈33,000 homes); 30–50 MW/fab; UPW ratio 1,400–1,600:1,000
- [Medium/TDS — GPT-4 carbon footprint](https://medium.com/data-science/the-carbon-footprint-of-gpt-4-d6c676eb21ae) — training ~50 GWh / ~15,000 t CO₂; inference dominates lifetime footprint (~60–80%)
