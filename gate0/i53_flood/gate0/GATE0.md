# Gate 0 — `I53`, "Your street is the bottom of a bowl you can't see" — **FAILED**

Proposed as **r007**, 2026-09-10. The first concept chosen under the widened remit (*how systems
work*, not computer science). **The sentence was approved by the human and then falsified by its
own data, before any reel code was written.**

## 1. The sentence

> **"Your street doesn't flood because the drains are blocked. It floods because it's the bottom
> of a bowl — and a satellite elevation map names the same three junctions every year, before it
> rains."**

It passed every gate that is not about truth: a real city map is the most nameable object this
account has shipped, the flood is legible with the sound off, the argument is live every monsoon
in Bengaluru, and it resolves to one carryable claim.

## 2. The experiment that could have falsified it, and did

Rule 7: any on-screen *X because Y* needs an experiment that could come out the other way.

**Data.** SRTM 1-arcsec (~30 m) from the AWS open-data skadi endpoint — NASA, public domain, no
key and no attribution gate. Window lon 77.45–77.80, lat 12.82–13.12: **1260 x 1080 cells**, no
voids. Priority-flood depression fill, then D8 flow accumulation. `build_flow.py`.

**Georeference verified before believing anything:**

| point | DEM | published |
|:--|--:|--:|
| Vidhana Soudha | 932 m | ~920 m |
| Bellandur Lake surface | 873 m | ~867 m |
| Hebbal Lake | 893 m | ~900 m |

Bellandur Lake sits at the **9.8th** percentile of elevation within 1 km, which is what a lake
must do if the grid is aligned. The DEM is fine.

**The test.** Eight junctions Bengaluru reports flooded by name every year, against 3,000 random
points in the built-up core (lat 12.88–13.06, lon 77.50–77.72) — matched statistics on both sides.

| | reported flood spots | random urban points |
|:--|--:|--:|
| elevation rank within 1 km | **57.4%** | 47.7% |
| height of the rim above it | **20.5 m** | 24.0 m |
| log10 flow accumulation | **1.23** | 1.34 |

**All three go the wrong way.** Bengaluru's famous flood junctions sit slightly *higher* in their
own neighbourhoods than a random city point, have *less* land looking down on them, and *less*
water converging on them. Only Silk Board (16.2th percentile) is genuinely in a dip. The sentence
is not weakly supported; it is contradicted.

*(A first version of this test scored window-max flow accumulation against a whole-window CDF and
returned 96–99 for everything, including the controls at 98.5. That was saturation, not a result —
most cells have accumulation 1, so any 150 m window maxes high. Recorded because the broken test
looked like a passing one.)*

## 3. Why it fails, honestly

- **30 m cannot see an underpass.** Silk Board and Sirsi Circle flood in dips a few metres across.
  SRTM also returns a *surface* model — buildings and canopy — which is noise at exactly this scale.
- **SRTM was flown in 2000** and this city has been regraded since.
- **The real mechanism is probably not terrain at all.** It is drainage capacity and built-over
  stormwater drains, which is what the local reporting has said all along. The data agrees with the
  explanation the sentence was written to contradict.

**Better data does not exist for free.** AW3D30 is also 30 m; municipal LiDAR is not public. So
this is a feasibility kill as much as a truth kill, and it will not get better by trying again.

## 4. What is NOT being done

**Not repaired, and no city shopping.** The obvious next move is to test Mumbai or Chennai until
one fits — and that is p-hacking when the causal claim *is* the reel. I15 could choose Paris on
measured grounds only because no causal claim about Paris reached the screen. Here it would.

`CLAUDE.md` is explicit: one kill condition ends the concept. The id stays permanent so this
record resolves.

**Cost of the gate: about twenty minutes and two scripts. No .tsx, no data module, no render.**
