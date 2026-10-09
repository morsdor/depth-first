# `I92` — Stage 3 research record · "keep the clocks forward all year"

Run 2026-10-09. Reproduce with `sunrise_check.py` (needs `ephem` and `geonamescache`; it asserts
every figure below and writes `figures.json`, which is the authority if this prose and the data ever
disagree). **No primary source could be read in this container** — `aa.usno.navy.mil`, `census.gov`,
`govinfo.gov`, `law.cornell.edu`, `rosap.ntl.bts.gov` and `webexhibits.org` are all refused or
unresolvable — so the history is graded at **search level**, and nothing on screen may say "a study
found". This is the same constraint `r020` hit, and it is the cleanest defence against shopping
for a source that fits.

## What the research did to the approved sentence

The approved Gate 0 sentence said **"…and Congress cancelled it after ten months."** Stage 3
falsifies the unit, not the story:

| | |
|:--|:--|
| **What happened** | P.L. 93-182 (signed 15 Dec 1973) put the country on year-round summer time from **Sun 6 Jan 1974**, a trial planned to run to the last Sunday of April 1975. **P.L. 93-434 (5 Oct 1974)** exempted **27 Oct 1974 – 23 Feb 1975**, so clocks went back on the normal date and **the second winter never happened**. Summer time then **resumed on 23 Feb 1975** and the 1975 summer ran long. Congress did not abolish the experiment; it **cancelled the second winter** |
| **Computed** (`sunrise_check.py` D) | 6 Jan → 27 Oct 1974 = 294 days = 9.7 months, but the winter actually **endured** on year-round summer time was 6 Jan → 28 Apr = **112 days (3.7 months)**; the winter **cancelled** was **119 days (3.9 months)**. All four boundary dates are Sundays, and 6 Jan is the 4th Sunday after 15 Dec 1973, as the Code notes say |
| **Therefore** | "ten months" counts the summer in the middle, when nobody had a dark morning. The true, and punchier, unit is **one winter**. **Proposed replacement (owner's yes needed at G4, per `r020`'s rule that a narrower claim needs the owner's yes, not the model's):** *"America tried keeping the clocks forward all winter in 1974. Parents worried about children walking to school in the dark, and after one winter Congress called off the second."* |

## Every figure, its source, its grade

| Figure | Source | Grade |
|:--|:--|:--|
| Sunrise and sun elevation, all cities | NOAA formulas (Gate 0 mock) **and** PyEphem 4.2.1 (VSOP87-based), upper limb with standard refraction | **Computed; the two agree to 0.23 min worst case** across 22 cities |
| **Washington, Mon 7 Jan 1974: sunrise 8:27 on year-round summer time (7:27 on standard)** | computed. Published figure: *"the sun rose at 8:27 AM on January 7, 1974"* — Washington Post, as quoted by The Washingtonian (15 Mar 2022) | **OUTSIDE NUMBER, matched to the minute, parameters fixed before the comparison, nothing fitted.** The published figure is read at search level through a secondary quote — the Post article itself is unread |
| Dark morning is a hour later in every city | the +1:00 is by construction | arithmetic, not a finding |
| **Most Americans wait past 8:00 on their darkest morning** | 3,304 US cities of 15,000+ (GeoNames, CC BY 4.0), standard offsets from the tz database, Arizona/Hawaii excluded (no summer time to keep): **86.6% of the 209 M people** in those cities (85.1–92.8% across ±3 min). Today: 4.6% | **Computed on a sample covering ~65% of residents.** **FLOOR: 53.7% of ALL US residents even if none of the uncovered 35% qualify and the sunrise is 3 min pessimistic** — so "most Americans" is true in the worst case. A number like "87%" is NOT sayable: the sample is cities, not the country |
| Median darkest-morning sunrise, population-weighted | same | **7:20 today, 8:20 kept forward.** The typical American is a Washington or a New York, not an Indianapolis |
| Indianapolis, Detroit, Boise, Marquette are 9:00–9:33 | same | **The extreme tail: 4.6% of the sample reaches 9:00.** The reel must never say "America wakes at 9" |
| 7:30 a.m. Washington, 7 Jan 1974, clocks forward: sun at **−11.0°** (nautical twilight); at 7:00 **−16.5°**; on standard time at 7:30 **−0.4°** (just risen) | computed | The hook at 7:30 is **twilight, not night**. Run the clock from 7:00 and let the sun arrive |
| Evening, Washington, 7 Dec: sunset 4:46 → 5:46 p.m.; at 5:00 p.m. the sun is **−3.3°** today, **+6.7°** kept forward | computed | The trade, on the same ruler (is the sun up at this clock time?) |
| 6 Jan 1974 start; 15 Dec 1973 signing; 5 Oct 1974 amendment; 27 Oct 1974 clocks back; 23 Feb 1975 resumption | U.S. Code notes to 15 U.S.C. §260a (via govinfo and Cornell, seen in search snippets), the UNT library catalogue entry for P.L. 93-434, the CRS summary (webexhibits.org copy) | **Corroborated by three independent summaries; statute text unread.** Sources disagree on the planned end of the trial (7 Apr vs the last Sunday of April 1975) — **not used** |
| Concern about children walking to school in the dark | CRS summary; Washington Post as quoted | Corroborated at search level. **Say "parents worried", never "children were harmed"** |
| NORC poll: 79% (Dec 1973) → 42% (Feb 1974) | Newsweek and National Geographic, both citing the National Opinion Research Center (Univ. of Chicago) | **NOT on screen.** It is NORC's, not Gallup's (my first draft said Gallup). A Washington Post figure puts February support nearer **30%**; a March Harris poll had 43% calling it a bad idea against 19% good. The sources disagree on the level and none was read. **Caption only, attributed, if at all** |
| Harm: did year-round summer time kill children in the morning? | NBS evaluation, as summarised by CRS: **statistically significant increase in school-age morning fatalities (Feb 1974 vs Feb 1973), impossible to attribute**, with an offsetting evening decrease; a National Safety Council study found morning darkness had little effect; DOT's 1975 report found small benefits it could not isolate | **MIXED, and not claimed either way.** Also unclaimed: energy saving (NBS found no significant saving) |

## What is NOT claimed, on screen or in the caption

- That anyone was killed, injured or saved. The sources contradict each other (an Alexandria child struck by a car, eight Florida deaths: anecdotes, rejected).
- That year-round summer time is bad. The claim is a **trade with a cost on the morning side**, and the evening gain is shown once.
- Any "America wakes at 9" line. 9:00 is reached by **4.6%** of the sampled population.
- Any percentage for "Americans" (it is a sample of cities; "most" is the only sayable word, and it is a floor).
- That the experiment "failed". It ended its second winter early; summer time itself came back and stayed.
- Anything about sleep, health, crime or energy.

## Negative and corrected results, kept

1. **The first Gate 0 sentence was false twice** (wrong month, one-minute margin). See `gate0/GATE0.md` §0.
2. **"Ten months" is the wrong unit** (above).
3. **The sketch table was off by one minute in places** against PyEphem — Louisville is **9:00**, not 8:59; Indianapolis 9:06, not 9:05; New York 8:20 — which is inside the stated tolerance and is exactly why no copy may rest on a minute.
4. **The latest-sunrise date differs by a day between implementations** (Indianapolis: 5 Jan on NOAA, 4 Jan on PyEphem) because the curve is flat in early January. **No date is printed beside "darkest morning"**; the still now says "darkest morning of the year".
5. **The poll figure was misattributed** in my own search query (Gallup) and sources disagree on its level.
6. **The hook city must not be Indianapolis.** It is among the worst 5%. The documented day is Washington, which sits at the median (8:27 against a median of 8:20).

## Licence

PyEphem (MIT) and geonamescache (MIT) are tooling. GeoNames data is **CC BY 4.0 — attribute** if cities are named in a caption or on a map. Statutes are public. NASA imagery and Natural Earth boundaries are public domain (the globe engine's README, commit `acb4820`). No OSM, no paid API. ₹0.

## Open items — for the Mac, because this container cannot reach them

1. **Read P.L. 93-182 and P.L. 93-434** at govinfo (88 Stat. 1209 and the 1974 amendment) and the Congressional Record for the stated reason Congress acted. Until then the history is search-level.
2. **Find the 7 Jan 1974 Washington Post article** (ProQuest or the paper's archive) to confirm "8:27" at the source.
3. **USNO's own sunrise table** (`aa.usno.navy.mil`) for the five cities that appear on screen. PyEphem is an independent implementation, not the USNO's.
4. **Census county population centroids** to replace the 15,000-city sample, so the map and the floor claim rest on all residents. Not needed for the "most" claim, needed for any number.
5. **Fetch the NASA globe imagery** (`scripts/globe_probe/README.md`); not tested from here.

## Traps worth keeping

- **PyEphem needs `pressure = 0` for geometric elevation and the default 1010 mb for official sunrise.** The two conventions differ by ~34 arcminutes; mixing them is a ~3 minute error.
- **Use `zoneinfo`, not a hand table, for the standard offset in January,** and test `dst(July) == 0` to find Arizona and Hawaii.
- **`next_rising` is relative to `Observer.date`**; set it to local midnight converted to UTC, or it returns the next day's.
- **The flat curve makes "the date of the latest sunrise" meaningless to a day.** Quote the minute, never the date.
