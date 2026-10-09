# Gate 0 — `I92`, "keep the clocks forward all year"

Proposed 2026-10-09. Backlog id `I92` (§2 *Maps and real geography* → accent `infrastructure
#00D6F7`; the neighbour is `I89`, the other astronomy-from-geometry row). **Reasoned from scratch**
— not in the original sitting. Picked by the owner at Gate 1 from six candidates on 2026-10-09
("permanent daylight saving sounds good"); the other five (`NEW` roundabout safety, `I75`, `I78`,
`I74`, `I55`) stay where they were.

**No reel number is claimed.** The next free number is `r021`; whichever build writes its first
`.tsx` claims it.

Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module. `mock_payoff.py` is the five-minute still.

## 0. What the first draft got wrong, found by computing it before writing it down

The sentence offered to the owner at Gate 1 was *"if the clocks stayed forward all year, the sun
wouldn't rise until after 9 a.m. in [city] in December."* **Computed today, that is false twice:**

1. **Month.** The latest sunrise of the year is **early January (Jan 1–13 depending on latitude),
   not December.** The equation of time pushes it past the solstice. The mock asserts it.
2. **Margin.** "After 9" is true only on a knife edge. Latest sunrise under year-round summer time,
   NOAA solar equations (good to ~1–2 min), 2026:

| city | latest sunrise, standard | latest sunrise, clocks kept forward |
|:--|--:|--:|
| Marquette MI | 8:33 | **9:33** |
| Boise | 8:18 | **9:18** |
| Indianapolis · Fort Wayne | 8:06 | **9:06** |
| Detroit | 8:01 | **9:01** |
| Louisville | 8:00 | **9:00** |
| Seattle | 7:57 | 8:57 |
| Columbus | 7:54 | 8:54 |
| Minneapolis · Salt Lake City | 7:51–7:52 | 8:51–8:52 |
| Portland OR | 7:51 | 8:51 |
| Atlanta | 7:43 | 8:43 |
| Spokane | 7:38 | 8:38 |
| Dallas | 7:30 | 8:30 |
| New York | 7:20 | 8:20 |
| Chicago | 7:18 | 8:18 |
| Los Angeles | 6:59 | 7:59 |

**Detroit is 9:01 and Louisville exactly 9:00 — a one-minute margin on a method good to a minute or
two.** No headline may rest on "after 9". The shift is also **exactly +1:00 by construction**, so the
astronomy is *arithmetic with a place attached*, not a discovery: it is the **visualisation** that
the reel adds (how dark, where, at the hour the bus comes), not the number. That is why the sentence
below leads with the historical experiment instead.

*(**Stage 3, 2026-10-09: re-run on an independent implementation, PyEphem; the table above is now
its output.** The first version of this table, from the NOAA-formula sketch, was off by one minute
in six cells — Louisville was 8:59, Indianapolis 9:05, New York 8:19 — and the two implementations
agree to 0.23 min worst case. `research/figures.json` is the authority. Still not checked against
the US Naval Observatory's own table, which this container cannot reach.)*

## 1. The sentence

> **"America tried keeping the clocks forward all year, in 1974 — children were walking to school in
> the dark, and Congress cancelled it after ten months."**

No CS word. "Daylight saving" is the only term of art and every viewer owns it.

> **STAGE 3 AMENDMENT, 2026-10-09 — proposed, needs the owner's yes at G4.** The sentence above
> says Congress cancelled it **"after ten months"**, and that unit is wrong: P.L. 93-434 (5 Oct 1974)
> cancelled only the **second winter**; summer time came back on 23 Feb 1975. The winter actually
> endured was **112 days (6 Jan – 28 Apr 1974), 3.7 months**, not ten. Proposed wording:
>
> **"America tried keeping the clocks forward all winter in 1974. Parents worried about children
> walking to school in the dark, and after one winter Congress called off the second."**
>
> Also changed: **"children were walking to school in the dark" → "parents worried about"** — the
> sources agree on the worry and contradict each other on any harm (`research/RESEARCH.md`).
> `r016`'s rule applies: the copy uses the computed fact, and the owner approves the change.

**Supporting figure (not the sentence):** on the darkest morning of the year, at 7:30 a.m., the sun
is **about 18° below the horizon** at one stop in Indianapolis with the clocks forward all year
(night, past the end of nautical twilight), against **about 7° below** on today's clocks (first
light). Same bus stop, same clock reading. *(Computed in `mock_payoff.py`.)*

**Search-level facts behind "1974", all LEADS until Stage 3 reads a primary:** the Emergency Daylight
Saving Time Energy Conservation Act was signed in December 1973; year-round summer time began
**6 January 1974**; Congress acted in **October 1974** and clocks went back on 27 October (sources
differ by days); support in the polls fell from **79% to 42%** by February 1974. **Do NOT put "children
were killed" anywhere on screen:** one account says eight Florida schoolchildren died; another
says the National Safety Council could not link the deaths to the change and found no appreciable
change in early-morning accidents. The sentence says "walking to school in the dark" and nothing more.

## 2. Who does the viewer send this to, and what are they proving? (GATE 3, drafted)

**Sent to whoever says "just lock the clocks forward, I want light after work" — to prove that the
country has already run that experiment, and the bill came due in the morning.**

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Partly — and this is the weak leg.** Everyone has stood in a dark winter morning, and everyone has felt "fall back" at 4:30 p.m. Almost nobody has *lived* a year-round-summer-time winter: that was 1974, and only people over about 55 remember it. The reel's job is to make the unwitnessed morning visible by computation |
| A dispute already running, that a non-specialist is in | **Yes, and it is seasonal.** The Sunshine Protection Act (year-round summer time) has been reintroduced repeatedly (2026 coverage was found on the day); the argument peaks at each change — **Sun 25 Oct (EU) and Sun 1 Nov 2026 (US)**, then Sun 14 Mar 2027. Nobody needs to be a specialist. Note the dispute has **three** sides (lock summer time, lock standard time, keep changing), and sleep medicine's organisations back the second |
| Resolves to one repeatable thing | **Yes:** "they tried it in 1974 and cancelled it in ten months" |

**Heat: what the loser stands to lose.** The person who wants year-round summer time loses *"free
evening daylight"* and is cast as someone who would put children at a bus stop in the dark. That is a
**protective-parent sting, not a competence sting** — higher than `r011`'s boarding and `r020`'s
thermostat (both competence stings), well below `r005`'s flat earth (identity: "I do not understand
how the world works"). **Stated before building: expect `r016`/`r017`'s band, not `r005`'s.**

**What lifts it, and costs nothing.** (a) **Name the fight on screen** — the `r017` lesson: the copy
names "keep the clocks forward all year", the thing the viewer has an opinion on, rather than asking
a question nobody was arguing about. (b) **The seasonal tailwind**: the US changes clocks on 1 Nov.
(c) **Children**: an arousal channel (anxiety) the boarding and thermostat reels did not have.

**Saturation risk, stated up front and real.** Every November the news runs "why we change the clocks"
and "we tried this in 1974". For a viewer who has read one of them, the response is recognition, not
surprise — the `r009` failure shape. What the standard piece lacks: (1) **the darkness computed,
one place, one clock reading, one sky**; (2) **the real-imagery globe**: the day/night line sweeping
across real NASA imagery of the US at 7:30, then dropping to the stop (the globe-to-street engine
built 2026-10-08, commit `acb4820`, exists for exactly this move); (3) both sides' cost on one clock.

**Fairness risk, an owner decision at G4.** A reel that shows only the morning reads as a hit piece
and invites the most toxic comments. A reel that also shows the evening gain (sunset an hour later
in the same city on the same date) is a **trade, stated as a number** — less punchy, harder to
attack, and truer. Recommendation: show both once, keep the 1974 outcome as the close.

## 3. The payoff frame

`payoff_frame.png`, drawn by `mock_payoff.py` (Pillow + numpy). A sketch, not a render.

- **The same bus stop twice at the same clock reading, 7:30 a.m.**: a school bus, three children with
  backpacks, a street lamp, a tree line. Top: today's clocks. Bottom: clocks kept forward all year.
- **Both skies are computed**, not painted: each is a colour ramp over the sun's solar elevation at
  that moment (**−7.0°** and **−17.8°**) — civil, nautical and astronomical twilight set the
  gradient, and stars appear only past −12°. The bottom panel is dark because the sun is 17.8° below
  the horizon, not because a designer made it so.
- The headline is **SAME BUS STOP. SAME 7:30 A.M.** and the close line is the sentence's second half:
  **AMERICA TRIED IT IN 1974. CONGRESS CANCELLED IT IN TEN MONTHS.**
- **Sunrise 8:06 vs 9:06** (Indianapolis, the darkest morning of the year) is on the panels.
- The bus is the **one amber element**; in the dark panel it dims to a silhouette with its warning
  lights lit.

**What the still deliberately does not draw:** the map. The map beat — where in the country it bites
— is the 3D shot (the terminator across the globe), and a still cannot prove a camera move. It is a
G4 script question.

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** A school bus, a clock, Congress |
| The payoff frame shows an object the viewer has never seen | **No.** A school bus, children, a street lamp, a dark sky — all nameable with the sound off and no labels. The labels add the place and the time, not the objects |
| The amazement depends on understanding first | **Passes, narrowly, and this is the honest weak point.** The dark bus stop reads in a second with no argument to follow, so it is not a blog post. But the surprise is **mild** — "an hour later" is arithmetic any viewer can do — and the sentence's real surprise is the *history* ("we already tried this"), which has to land inside the first 3 s as text over the dark bus stop. If the owner reads the frame as "so what, it's an hour", the concept is spent |

**Non-negotiable 6 — can the object stay on screen all reel?** Yes: the bus stop is the home
position. The map and the globe are beats that start from it and return to it.

## 5. Numbers, and where they came from

| Figure | Source | Status |
|:--|:--|:--|
| Sunrise and elevation, every city | NOAA solar equations (Meeus-based), computed in `mock_payoff.py` and the Gate 0 sketch | **Computed, not cross-checked.** Stage 3: USNO tables, ±2 min |
| Latest sunrise is early January | computed (assertion in the mock) | Computed |
| 1974 start date, repeal month, "about ten months" | search-level: news and local-history write-ups; sources differ by days | **LEAD** — Stage 3 reads the statute and the Congressional Record |
| Poll support 79% → 42% by February 1974 | one local-news write-up | **LEAD** — find the poll |
| Children killed | contradictory secondary sources | **NOT CLAIMED** |
| Dates of the next changes: 25 Oct, 1 Nov 2026, 14 Mar 2027 | rule of the calendar (last Sun Oct, first Sun Nov, second Sun Mar) | Computed from the rule |

## 6. Licence and feasibility

**Licence: clear.** Astronomy is equations, not a database. Census population centroids are
public domain. The globe uses NASA imagery and Natural Earth (both public domain — the engine's own
README lists the sources and licences). Statutes are public. A poll's published figure is a citable
fact; the raw poll is not needed. No OSM, no street data, no paid API. ₹0.

**Feasibility: clear.** Sunrise at any latitude is exact to a minute or two with no resolution
problem. Population-weighting the map needs county centroids and a time-zone polygon file (Natural
Earth) — both public.

## 7. Accuracy risks the build must not skate past

- **"After 9" appears nowhere in the copy.** Any "after X o'clock" is checked against the USNO table
  and carries its margin. Prefer "9:05 in Indianapolis" over "after nine".
- **"Cancelled *because* children were walking in the dark" is a causal sentence** (non-negotiable
  7). The sources give dark mornings *and* disappointing energy savings. The honest phrasing is
  "after complaints about dark mornings" and the statute is the primary. This needs reading before
  it ships; if the record gives a different weighting, the copy changes.
- **"The whole country" is false.** The 1974 law exempted states that had opted out of summer time
  (Arizona; Hawaii never observes). The reel says "most of America" or names the cities it shows.
- **Do not claim anything about sleep, health or accidents.** That is separate evidence (the sleep
  societies' position statements; the Monday-after-spring-forward literature) and none of it is
  computed here.
- **A trade is a trade.** The evening gain is real (the sun sets an hour later). Showing only the
  cost is a choice the owner makes at G4, in writing, not a default.
- **This sketch's sunrise margins, flagged above.** Detroit 9:01 and Louisville 8:59 are in the
  noise of the method.

## 8. Pre-registered reading (proposed — owner to change before posting)

Measure shares and saves *per reach*, separately, and read comments as the heat test:

| shares / reach at day 2–4 | reading |
|:--|:--|
| **≥ 0.6%** (half of `r005`'s 1.203%) | a historical-experiment-plus-your-own-morning reel travels. The seasonal tailwind is real |
| **0.2% – 0.6%** | `r016`/`r017`'s band: moderate heat moves like moderate heat |
| **< 0.2%** | inside the band `r011` named as falsifying; the seasonal window did not rescue a mild-heat dispute |

**My prediction, written before the build: 0.15%–0.35%.** The comments are the cleaner read: `r016`
drew 32 at day 1 and `r017` drew 2; naming the fight on screen is the variable. Saves should stay
low (no utility channel). **The seasonal tailwind is confounded with the topic** — if it travels
only in the week of the change, that is the calendar, not the content, and the same reel is not a
template.

## 9. Gate record

**2026-10-09 — the owner moved on with "Go ahead with next step"**, in answer to a message that
asked for the Gate 2 yes on the sentence and offered a draft Gate 3 answer. **That is a general
go-ahead, not an explicit "yes, I would say that sentence" and not a named person.** It is recorded
as G2 and G3 passed on the draft as written, because the owner did not edit either, and Stage 3
(research, no build) proceeded on that basis. **If the sentence is a no, everything from
`research/` onwards stops and costs nothing but the research.** Stage 3 is done; the G4 script is
`../SCRIPT.md`.

**What the owner was asked at G2, kept for the record:**

> **Would you say that sentence to someone?**

And if yes, Gate 3 needs one more answer before Stage 3 starts: **who is the person, and what are
you proving to them?** The draft above is *whoever wants the clocks locked forward — that the
country already ran that experiment.*
