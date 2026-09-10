# Software thesis — the product hiding in this repo

*Written 2026-09-10, at 145 followers and eight posted reels. The premise, in the user's words: the
account alone will not become a million-dollar business; the durable thing being built is a
reusable set of assets, templates and process, pointing at **an AI-centric, agentic, creator-focused
video tool** — not a text-to-video generator like the InVideo class. This document reasons about
whether that is right, what the actual defensible asset is, what to build first, and what the
arithmetic demands. It is a thesis, not a plan of record. It contains the case against itself.*

---

## 1. The premise is right, and the named product is the wrong first move

Two separate claims are bundled in the premise. The first is right and the second is premature.

**Right:** this repo is accumulating something reusable and valuable, and it is not the reels.

**Premature:** that the reusable thing should first take the shape of an editor. An editor is a
surface with a timeline, tracks, transitions, captions, brand kits, collaboration, exports and a
mobile app. CapCut gives that away free, Descript does the AI-native version very well, and Canva
owns the template market. A solo engineer with a full-time job cannot win a feature race on that
surface, and "AI-centric" is not a differentiator in 2026 — it is the baseline everyone shipped
last year.

The valuable thing here is narrower and much harder to copy. Name it precisely before deciding
what to build.

---

## 2. What is actually defensible

An honest audit of the repo, separating the asset from the plumbing.

### 2.1 The real assets

**A method that makes animation true by construction.** Run the real algorithm or the real physics
in Python on real data → dump intermediate state to JSON → `emit_ts.py` **re-derives every claim and
refuses to write the module if one is false** → Remotion plays it back. On-screen numbers are correct
because the run produced them. Nobody in the creator-tool market has this, because everyone else
starts from pixels and works backwards. `r010_pendulum/emit_ts.py` carries 22 asserts, including one
that the equation printed on screen reproduces the fifteen lengths on screen to 0.005 cm.

**A falsification habit that changes designs, not just confidence.** `r010_pendulum/design.py`
integrated the real nonlinear pendulum and found the textbook lengths reform 0.33 s late — so the
reel prints a corrected equation. `I53` was killed by its own data after passing the human gate.
`r001` shipped a false mechanism sentence and that failure became rule 7. This is a *process*
that catches errors an LLM confidently generates, which is precisely the failure mode blocking
AI video in every serious domain.

**The gate pattern as an interaction design.** The agent writes a sentence, mocks the payoff frame,
and **stops** for a human yes. It builds, renders, audits, and **stops** for a human watch. Three
gates, about a minute each, each of which has already saved a day. That is a genuinely novel
interaction pattern for agentic creative tools, and this repo found it the expensive way — five
rebuilds of `r005`, each raising rigor and lowering watchability, before the conclusion was accepted.

**A judged corpus, which is the rarest item on this list.** Ten built reels with known outcomes,
eight posted with real engagement, three killed at a gate with written reasons, and
`brand_guide_software.md` §13 — about 1,200 lines of dated, measured lessons **including retracted
conclusions**. This is an evaluation set for the question "is this explainer any good?", grounded in
outcomes rather than taste. It cannot be scraped, because it does not exist anywhere else. If the
eventual product is an agent that makes explainers, this is its benchmark and its instruction data.

**Deterministic, offline, lint-enforced rendering.** Fonts vendored after a render failed on a
network dependency; palette and easing enforced by `npm run brand:check`; two mechanical audits
(`reel_motion_audit.py`, `reel_safe_audit.py`) with thresholds derived from measured feedback.
Renders reproduce from a clean checkout.

**A live account that is simultaneously the demo, the instrument and the marketing.**

### 2.2 What is not a moat, and should never be described as one

- **The plumbing.** Remotion plus Claude Code plus Manim plus ffmpeg is assemblable by any competent
  engineer in a weekend. Remotion publishes its own agent skills; this repo vendors them.
- **The components.** `Cables.tsx` and `Greatcircle.tsx` are excellent and specific. A globe morph
  is a week of work for anyone who wants one.
- **The rendered mp4s.** Output, not asset.
- **"AI-powered".** Table stakes.

**The asset is the method, the gates, and the judged corpus. Everything else is replaceable.**

---

## 3. Why "AI video editor for creators" is the wrong first product

Four reasons, in descending order of how much they should hurt.

**The buyer is wrong.** `insta_strategy.md` §4.3 already recorded it: a short-form education account
run from India recruits an India-heavy, student-heavy audience — the lowest-monetising, lowest
purchasing-power segment available. That is a fine audience and the wrong customer list for a paid
tool. Building the account to sell software to the account's audience is a circle that does not
close.

**The market is the most crowded in software.** CapCut (free, owned by ByteDance), Descript,
Canva, Adobe Express, plus the entire InVideo/Pictory/HeyGen class. Creator tools also carry
brutal churn, because creators quit.

**Editors are wide, and you are one person.** An editor is judged on the hundred things it does
adequately, not the one thing it does uniquely. The one thing this repo does uniquely gets diluted
to nothing inside an editor.

**It abandons the moat.** The method's value is *correctness*. A general editor for "different types
of videos" cannot promise correctness about anything, because it does not know what the video is
about. The moment the product accepts arbitrary content, the asserts, the gates and the ledger stop
applying, and what remains is the plumbing from §2.2.

**The counter-argument, stated fairly:** editors own the workflow, and whoever owns the workflow
eventually owns everything upstream of it. That is true — and it is an argument for building an
editor *third*, once the upstream engine has customers who would follow it into one. It is not an
argument for building it first with one engineer.

---

## 4. The wedge: an explainer engine, not an editor

**Build the thing that makes the hardest, most valuable ten seconds of an explainer video: the
accurate, computed, animated map, simulation, diagram or data sequence — delivered as a clip the
customer drops into whatever editor they already use.**

Position: *the engine for explainers that are actually correct*. Not an editor. Not text-to-video.

Three reasons this is the right wedge:

1. **The space is empty.** Text-to-video generators are crowded; template libraries are crowded;
   *computed, verifiable animation* has essentially no vendor, because it requires exactly the
   discipline this repo spent three months acquiring.
2. **It is what the repo already does**, with no invention required — only packaging.
3. **The customers pay real money.** Not Instagram creators. Edtech and course companies,
   developer-relations teams (every infrastructure company needs "how our system works" animations),
   data journalists and newsrooms, scientific and medical communicators, agencies making explainers
   for enterprise clients. These buyers pay for accuracy because being wrong costs them something.

**The "moat sentence", already written and already true**, from the Instagram bio: *"Every animation
here is the real algorithm, actually run — not drawn."* That is the product's positioning statement.
It survives contact with a customer's legal team, which no competitor's claim does.

---

## 5. The arithmetic

Any path to ~$1M ARR reduces to a number of customers and a price. The assumptions are labelled;
the conclusion is robust to changing them.

| Path | Price | Customers needed | Feasible solo? |
|:--|--:|--:|:--|
| Prosumer creator subscriptions | ~$17/mo | ~5,000 paying, with creator churn | **No** — needs a marketing organisation |
| B2B / edu team seats | ~$1,400/mo | ~60 | **Yes** — sixty relationships is one person's job |
| Done-for-you computed explainers | ~$2,000/clip | ~500 clips, or ~40 retained clients | **Yes**, and it funds the product |
| Open-core kit + hosted rendering | metered | depends entirely on distribution | Later; needs the kit to be adopted first |

**The arithmetic makes the decision.** One engineer can reach sixty customers. Five thousand
subscribers is a different company with a different cost structure. So: **services and B2B first,
self-serve later, prosumer possibly never.**

Note that the third row is not a compromise. Selling the output before selling the tool is how you
discover what the tool must do, and it is revenue from month one rather than month eighteen.

---

## 6. The three-layer architecture

The repo maps onto the product with surprisingly little violence.

```
L3  EDITOR          timeline · brand kits · collaboration · multi-platform export
    (build third,  ─────────────────────────────────────────────────────────────
     only if L2 has paying users who ask for it)

L2  ENGINE          the product. Topic → Gate 0 (sentence + payoff still) → HUMAN YES
    (build second)  → research & verify → computed data with asserted claims
                    → composition from the Kit → render → audits → HUMAN WATCH → clip
                    ─────────────────────────────────────────────────────────────
                    this is `.claude/skills/new-reel/` with a UI and a job queue

L1  KIT             open source. camera · geo · layers · sim · annotate · chrome · audit
    (build first)   ─────────────────────────────────────────────────────────────
                    this is `docs/depth_first/module_packs.md`, published
```

**L1 is distribution, not revenue.** Open-sourcing the packs is the Remotion playbook: the library
earns credibility and inbound, and the people who adopt it are the shortlist of first customers and
first hires. It costs nothing you were not already going to build, because `module_packs.md` already
argues for extracting these packs to make *your own* reels cheaper.

**L2 is the product, and its first screen is Gate 0.** The user types a topic; the agent returns
one sentence a viewer would repeat to a friend, plus a mocked payoff frame; the user says yes or no.
That loop — *judgment in, verified animation out* — is what this repo proved works, and it is what
no competitor can copy without the corpus in §2.1.

**L3 is optional and late.** If L2 works, customers will ask for a timeline. That request is the
signal to build one, and by then you can hire.

---

## 7. Sequence — the next six months, without stopping the account

**Phase 0 · Sell before you build (weeks 1–6).**
Take the pipeline exactly as it is and make five to ten computed explainers for people who pay.
No product, no landing page, no code beyond what a reel already needs. Target list: developer-relations
teams at infrastructure companies, edtech and course companies, data journalists. The pitch is one
sentence plus one reel — send `r006`.
**Kill criterion: if nobody pays for a true, computed animation of their system, the thesis is dead
and you have spent six weeks.** That is the cheapest possible test of the entire plan.

**Phase 1 · Publish the Kit (weeks 4–10, overlapping).**
Extract `camera` and `geo` first, exactly as `module_packs.md` orders them. Publish under a
permissive licence with the Instagram-safe chrome and the two audit scripts. Write the README as
"the parts behind these reels", linking the account. Measure: installs, and whether one stranger
ships something.

**Phase 2 · Productise the gates (months 3–5).**
The narrowest possible L2: topic in, Gate 0 artefacts out, human yes, one computed clip out. One
vertical only — maps and geography, because `geo` is the most mature pack and the domain where
"correct" is most obviously valuable. Sell it to the Phase 0 customers who already paid for the
manual version.

**Phase 3 · Decide (month 6).**
Three signals, three decisions: services revenue says whether the market is real; kit adoption says
whether distribution is possible; whether Phase 0 customers convert to Phase 2 says whether it is a
product or a consultancy. A consultancy is not a failure, but it is a different company and should
be chosen deliberately rather than drifted into.

**Throughout: the account keeps running, three reels a week, on `growth_strategy.md`'s terms.** It
is the R&D lab (every reel dogfoods a pack), the proof (case studies you own), and the marketing
(publish "how this was computed" as its own stream). **Never turn a reel into an advert for the
tool** — `r010` dropped `#manim` from its hashtags for exactly this reason, and that instinct is
correct.

---

## 8. Constraints that must be designed around, not discovered later

**Remotion's licence is the load-bearing one.** Checked 2026-09-10 in
`remotion/node_modules/remotion/LICENSE.md` and against Remotion's published pricing:

- Free for individuals and for-profit companies with **up to 3 employees**. A company licence is
  mandatory at **four or more** people operating the software.
- **Explicitly disallowed:** copying or modifying Remotion code "for the purpose of selling,
  renting, licensing, relicensing, or sublicensing your own derivative of Remotion". A hosted
  product that *uses* Remotion to render is fine; a product that *is* a repackaged Remotion is not.
  The L1/L2/L3 split above stays on the right side of that line — the Kit is components built *on*
  Remotion, not a fork of it.
- SaaS rendering is metered: the Automators plan is **$0.01 per render with a $100/month minimum**,
  Creators is **$25/seat/month**, Enterprise from **$500/month**. So per-render cost is a real line
  in the unit economics from day one, alongside compute.
- Before any product launch, confirm current terms directly with Remotion, and consider asking them
  what a partner arrangement looks like. They have an interest in this succeeding.

**Asset licences propagate to customers.** Google Earth Studio forbids promotional and advertising
use and requires on-screen attribution. Z-Anatomy and BodyParts3D are CC BY-SA, which carries
share-alike. OpenSky is research-and-education only. `visual_toolbox.md` §7 has the table. A
customer's clip must ship with a provenance record — which, usefully, is also a *feature*: "every
figure sourced, every asset licence recorded" is exactly what an enterprise buyer wants and what no
generative competitor can offer.

**Model cost per video is not ₹0.** The reels are ₹0 in *image generation*, which is a different
claim. An agentic engine spends tokens on research and code, and that becomes COGS. Measure it early.

**Data acquisition is the hidden hard part.** Half the work in every reel here was getting real data
and verifying it. A product that hands the user a blank topic box inherits that problem. This is an
argument for going vertical: pre-built, licence-cleared data connectors per domain.

---

## 9. Risks, stated at full strength

| Risk | Severity | Response |
|:--|:--|:--|
| **The platforms ship the generic version.** Anthropic, OpenAI, Google and Remotion are all moving toward agentic video | High | Defence is depth, not breadth: be the tool that is *never wrong* about a mechanism. Generic tools will not carry a falsification step, because it makes demos slower and worse |
| **Solo founder with a full-time job** | High | Keep the surface tiny. Services first, so revenue arrives before scale is needed. The kill criteria exist to stop sunk-cost drift |
| **The market may not pay for correctness** | High | This is what Phase 0 tests, in six weeks, for free |
| **Services capture the founder** and the product never ships | Medium | Cap services at a fixed number of clients; every clip must produce a reusable pack |
| **Vertical too narrow** (maps and physics only) | Medium | Correct at first; the corpus and the packs generalise one domain at a time |
| **The account and the product compete for the same hours** | Medium | The account is capped at three reels a week and is explicitly R&D and marketing, not a second job |
| **Over-reading n=1** — this repo's documented failure mode | Medium | Written kill criteria, not vibes. Same discipline as the experiment register |

---

## 10. What changes today, and what does not

**Does not change:** the account's strategy, the three human gates, the ₹0 rule, the accuracy
discipline, the cadence target. Every one of those is what makes the software thesis possible; the
product *is* that discipline, productised.

**Changes, in priority order:**

1. **Extract the packs as if they were a public library from the start** — proper names, README per
   pack, no repo-specific paths baked in. `module_packs.md` already argues for this on cadence
   grounds alone; the thesis raises its priority from "nice" to "first".
2. **Start the outreach list now.** Ten names, one sentence each, sent alongside `r006`. It costs an
   evening and it is the highest-information action available.
3. **Instrument model cost per reel**, so COGS is known before it matters.
4. **Keep every failure record.** `i53_flood/gate0/GATE0.md` and the shelved queue build are not
   clutter — they are the evaluation set. `repo_audit.md` already says keep; this is the reason why.
5. **Record provenance in a machine-readable form**, not only in `NOTES.md` prose. A per-clip
   `provenance.json` (figure → script → run → source → licence) is a day's work now and is the
   enterprise feature later.

---

## 11. The decision gates

| When | Signal | If yes | If no |
|:--|:--|:--|:--|
| Week 6 | ≥ 1 customer paid for a computed explainer | Continue to Phase 1 | Stop. The account is still fine and nothing is lost |
| Week 10 | Kit published; ≥ 1 stranger ships something with it | Distribution is possible | Kit stays an internal accelerator; revisit later |
| Month 5 | ≥ 3 paying, ≥ 1 converted from manual to the L2 engine | It is a product | It is a consultancy — choose deliberately |
| Month 6 | Services revenue ≥ the cost of the time it consumes | Fund the product from services | Reconsider the whole thesis |

---

## 12. The honest summary

The premise is right: the account will not reach a million dollars, and the durable asset is the
process rather than the videos. The correction is to the shape of the product. **The asset is not a
library of motion-graphics templates and it is not an editor — it is a method for making animation
that is true, a human-gated interaction pattern that makes an agent usable for creative work, and a
judged corpus of what works.** The first product is therefore an *explainer engine sold to people
who need to be right*, not an editor sold to creators who need to be fast.

Build the Kit because you need it anyway. Sell the output before you sell the tool. Let the account
prove the method in public. Build the editor only when customers demand it and you can afford help.

**The cheapest next action is not code. It is ten emails.**

---

## Sources checked 2026-09-10

- Remotion licence: `remotion/node_modules/remotion/LICENSE.md` (v4.0.512, in this repo), and
  [remotion.dev licence FAQ](https://www.remotion.dev/docs/license/faq),
  [pricing](https://www.remotion.dev/docs/license/pricing),
  [remotion.pro company licensing](https://www.remotion.pro/license)
- Asset and data licences: `visual_toolbox.md` §7, with its own checked sources
- Account and engine evidence: `state_of_the_account.md`, `brand_guide_software.md` §13
