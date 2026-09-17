# Gate 0 — `I31`, "a typo once took a country off the internet"

Proposed as the next reel, 2026-09-14. Backlog id `I31` (§3 `languages` → accent `#51A4FF`).
Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module.

**The subject:** on 24 February 2008, Pakistan's government ordered domestic ISPs to block
YouTube. Pakistan Telecom implemented the block with a route meant to stay inside Pakistan; it
leaked to its upstream provider and propagated worldwide, and for roughly two hours most of the
world's YouTube traffic was misdirected into Pakistan and dropped. **The backlog's "typo" framing
is a popular simplification, not yet a verified mechanism — the real cause was a route
announcement that leaked outward, not a mistyped character. This is flagged as a Stage 3 item, not
resolved here.**

## 1. The sentence

> **"In 2008, Pakistan tried to block YouTube for itself — and by mistake, broke it for the whole
> world, for almost two hours."**

No mechanism word in it. A stranger can repeat this exactly as heard.

## 2. Who does the viewer send this to, and what are they proving?

**Honestly weak, and said plainly up front.** This is not a live dispute the way flat earth or
boarding order is — nobody is currently arguing "no, a single country cannot break the whole
internet." It reads as a "did you know" fact, not a correction of someone's stated wrong belief.

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Partial.** Everyone has hit "YouTube is down" at some point; nobody connects that memory to this specific event. |
| A dispute already running, that a non-specialist is in | **No.** Closest fit is the general, low-heat belief that "the internet is too big/decentralized for one small country to break" — real, but nobody is actively defending it out loud. |
| Resolves to one repeatable number | **Yes** — one country, one small address block, roughly two hours, global. |

**Carried into Stage 2b (GATE 3) as an open risk, not resolved here.** If GATE 3 cannot name a
real channel beyond "wow, TIL," this is the same failure shape as `I31`'s neighbours in the
2026-09-12 batch that were flagged weak on this axis (`I77`, `I80`) — high-arousal novelty is the
only channel left to argue for it, and `I76`/`r009` already showed a saturated genre turns awe into
recognition. This subject is *not* saturated the way "look how big space is" is, which is the
argument in its favour.

## 3. The payoff frame

`payoff_frame.png` — drawn in PIL/matplotlib, ~5 minutes, reusing r005's real GSHHG coastline
data (`remotion/src/reels/data/r005_geo.ts`) rather than inventing a coastline. A world map, dimmed;
bright traffic arcs from six named regions (São Paulo, London, Lagos, Mumbai, Tokyo, Sydney) all
bending toward and vanishing into a single point in Pakistan; a clock reading elapsed time; the six
origin points shown as extinguished (dark) once their arc lands. **Curve/arc placement is
illustrative for this mock only** — the real build will compute actual great-circle bearings from
real cities to Karachi, the same method r005 used for its flight arcs.

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** "block", "broke", "whole world" — no jargon. |
| The payoff frame shows an object the viewer has never seen | **No, on the same basis r005/r006 passed.** A world map with traffic arcs is a real object class this account has already shown works (r005: 94k views; r006: peaked lower but was never killed on this condition). The individual arc is thin (r006's "6px line" trap, `CLAUDE.md` non-negotiable 4) and will need the same fix r006 used: a camera that moves with the story rather than a static wide map. |
| The amazement depends on understanding first | **No.** The frame reads without any explanation: a map, lines from all over the world converging on one small country, the world's lights going out together. The *why* (how routing trust works) is the reward for staying, not a precondition for the "wait, what?" reaction. |

**The recognisable object (a world map with traffic on it) can stay on screen for the whole reel** —
non-negotiable 6 — the same way r005 and r006 never left their maps.

## 5. Numbers, and where they came from

**VERIFIED 2026-09-14** against RIPE NCC's own RIS case study, Google Research's published BGP
dynamics analysis of this exact event, and Renesys's contemporaneous incident writeup (the
network-operations firm that instrumented it in real time) plus its CircleID follow-up. All three
independent sources agree on the figures below.

| Fact | Value | Source |
|:--|:--|:--|
| Date, start | 24 Feb 2008, **18:47 UTC** — Pakistan Telecom (AS17557) begins announcing `208.65.153.0/24` to its upstream PCCW Global (AS3491) | RIPE NCC RIS case study |
| Propagation speed | First seen in Asia at 18:47:45 (45 s after the 18:47:00 announcement); **97 ASNs** (networks) worldwide carrying the route by 18:49:30 — **2 min 30 s from the announcement itself** (some write-ups quote "1 min 45 s," measuring from first-evidence-in-Asia rather than the announcement; the reel's clock starts at the announcement, so it must use 2:30, not the shorter figure) | Renesys / CircleID |
| Scope | Roughly **two-thirds of the internet** briefly routed YouTube traffic to Pakistan | Renesys / CircleID |
| YouTube's real route | `208.65.152.0/22` — Pakistan's `/24` was a **smaller, more specific slice of YouTube's own address block**, which is why routers preferred it | RIPE NCC, Google Research |
| Counter-measure | 20:07 UTC — YouTube (AS36561) announces the same `/24`; 20:18 UTC — YouTube announces two `/25`s, even more specific | RIPE NCC RIS case study |
| Resolution | **21:01 UTC** — PCCW Global withdraws all of Pakistan Telecom's prefixes, ending the hijack | RIPE NCC RIS case study |
| **Total duration** | **18:47 → 21:01 UTC = 2 hours 14 minutes.** Individual users came back online anywhere from ~30 minutes to just over 2 hours after 18:47, depending on which network's routing table updated first | Renesys / CircleID |

**Mechanism, verified and NOT a typo.** Pakistan Telecom's block was **intentional** — the
government had ordered YouTube blocked domestically, and PTCL's engineers configured a route meant
to swallow YouTube's traffic only inside Pakistan. The failure was a step downstream: **PCCW Global,
Pakistan Telecom's upstream provider, did not validate or filter the announcement before forwarding
it to the rest of the world.** Direct quote, Renesys's Martin Brown: *"PCCW (3491) did not validate
Pakistan Telecom's (17557) advertisement... By accepting this advertisement and readvertising to
its peers and providers PCCW was propagating the wrong route."* **The "mistake" is real and
on-screen-safe to say — it is just not a mistyped character. It is that nobody checked whether
Pakistan Telecom was allowed to claim YouTube's addresses before repeating the claim to the planet.**
The Gate 0 sentence's "by mistake" survives this correction (the leak past Pakistan's own border
genuinely was unintended); "typo" specifically must not appear on screen.

## 6. Licence and feasibility

**Published incident reports and route-announcement histories are facts and are citable** —
this is a historical network event, not a live database someone owns, so the r006 licence problem
(restricted route geometry) does not apply here. RIPE NCC's RIS raw BGP data and route-views
archives are public research infrastructure; a Stage 3 pull of the actual historical routing table
snapshots (if the build wants to show real announcement propagation rather than an illustrative
map) is technically demanding but not licence-restricted. **Feasibility is open**: whether the
build needs real historical BGP table dumps (heavier, more authentic) or can honestly rest on the
publicly reported timeline and geography alone (lighter, same shape as r006's "public geography
lands within 1.4%" fallback) is a Stage 3 decision.

## 7. Accuracy risks the build must not skate past — RESOLVED 2026-09-14

1. **"A typo" — RESOLVED, and dropped.** Verified as false-by-omission: the block was intentional;
   the leak past Pakistan's border was the accident, caused by PCCW's missing validation, not a
   mistyped value. The build must say "nobody checked" / "PCCW didn't verify," never "typo."
2. **"Took a country off the internet" (the backlog's own hook phrasing) inverts the direction of
   the real event** — Pakistan did not go offline; Pakistan's announcement took *the rest of the
   world's access to YouTube* offline. The Gate 0 sentence already corrects this; the build must
   not drift back toward the backlog's looser phrasing.
3. **Duration — RESOLVED.** The verified window is 18:47–21:01 UTC, **2h14m**, not "almost two
   hours." On-screen copy must say "just over two hours" or use the real clock, not round down.
4. **Scope — RESOLVED with a stated base.** "Two-thirds of the internet" (Renesys/CircleID) and
   "97 networks" (same sources, cross-checked against RIPE's independent RIS case study) are two
   different units — a traffic-share estimate and a network count — and must not be merged into one
   on-screen number. The build uses **97 networks in two and a half minutes** (measured from the 18:47:00
   announcement the reel's clock starts on, not the shorter "1:45" some sources quote from
   first-evidence-in-Asia) as the one hard, countable figure; "two-thirds of the internet" is
   scene-setting language only, not a counted claim.

## 8. Gate 0 — PASSED, 2026-09-14

Human yes on the sentence and the frame, both as written above, no repair.

## 9. GATE 3 — the send test, RESOLVED 2026-09-14, proceeding as a PRE-REGISTERED EXPERIMENT

**No argument-ammunition leg exists for this concept, and that is stated plainly rather than
stretched.** The channel is **high-arousal novelty**, not a correction of a live belief:

> Sent to a friend as "wait, did you know..." — proving that the internet's trust-based routing
> (nobody verifies who is allowed to announce what) is one honest mistake away from taking down a
> global service, not proving the friend wrong about anything they said.

**This is the account's first GATE 3 pass with a purely novelty channel and zero argument-
ammunition leg** — closer in shape to `r009` (which tried novelty alone and got zero sends,
because cosmic scale is a saturated genre) than to `r005`. Two things argue this is a better bet
than `r009` was, stated before the build rather than after:

1. **The genre is not saturated.** "The internet is held together by mutual trust, not
   verification" is not a video format this account's audience has seen a hundred times, unlike
   "space is unfathomably big."
2. **A genuine anxiety hook exists that `r009` did not have**: "this could happen again, right now,
   to something I use" is personally unsettling in a way "the universe is mostly empty" is not.

**Pre-registered success metric, stated before any build, matching `r010`/`r012`'s shape:**
Judged on likes/saves/watch-time relative to the account's teaching-reel baseline, NOT on sends —
sends are expected to be low to zero given the missing argument-ammunition leg, and that alone
does not falsify anything. **Failure looks like `r009`:** liked at a normal-or-lower rate, no lift
anywhere, indistinguishable from noise. **A genuinely new, useful reading would be**: engagement
measurably above `r009`'s despite the same missing channel, which would be evidence that genre
saturation (not the channel itself) was `r009`'s real problem.

**Decision: PROCEED, account owner's call, 2026-09-14** — explicitly as this experiment, not as
an argument-ammunition reel in disguise.

## 10. Stage 3 — COMPLETE, 2026-09-14

Every figure verified against three independent primary/near-primary sources (RIPE NCC's own RIS
case study, Google Research's published BGP-dynamics analysis of this exact event, Renesys's
contemporaneous incident writeup + CircleID follow-up). No figure killed the concept; the "typo"
claim was corrected rather than the concept dying, the same shape as r006's licence correction.
**Licence:** published incident reports and figures, no restricted database — clear.
**Feasibility decision:** build rests on the verified public timeline and real geography (city
locations, real elapsed time), not reconstructed historical BGP table dumps — same shape as r006's
"public geography lands within 1.4%" fallback, lighter and equally honest.

## 11. Awaiting

**GATE 4 — a human yes on the full script**, in `../SCRIPT.md`. Nothing is coded until then.
