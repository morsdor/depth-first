# SCRIPT — `I73` · aeroplane boarding · **GATE 4, awaiting approval**

**Written 2026-09-12, after the research and before any `.tsx`, data module or render.**
45 s · 7 beats · 1350 frames at 30 fps · teaching format, not the loop.
Accent **`failure` `#FF4D4D`** (§6) — spent only on the back-to-front queue, never on the ground.

---

## READ THIS COLUMN FIRST, WITH THE TABLE COVERED

> **BOARDING IN NO ORDER AT ALL BEATS BOARDING BACK TO FRONT.**
> → SAME 72 PEOPLE. SAME CABIN. ONLY THE ORDER CHANGES.
> → NO ORDER AT ALL: EVERYONE SEATED, 4:24.
> → BACK TO FRONT PUTS EVERY BAG IN THE SAME FEW FEET OF AISLE. TWO PEOPLE CAN STOW AT ONCE.
> → SPREAD THEM OUT AND SEVEN STOW AT ONCE. THAT IS THE WHOLE DIFFERENCE.
> → THEY RAN THIS FOR REAL IN 2011. 72 PEOPLE, A MOCK 757. **6:11 AGAINST 4:44.**
> → UNITED WENT WINDOW-MIDDLE-AISLE IN 2023. SOUTHWEST IN JANUARY.

**That is the whole reel with the pictures taken away, and it is a complete thought.** The check
exists because `r010` cut 1 passed this gate with copy that meant nothing without the column
beside it.

---

## The beats

| t | Copy — the on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| **1** · 0.0–3.2 | **BOARDING IN NO ORDER AT ALL**<br>**BEATS BOARDING BACK TO FRONT.** | **THE RESULT, FIRST.** Near-top-down on two 12-row cabins side by side, already at the end state: right cabin every seat full, aisle empty; left cabin front three rows empty with a red queue standing in the aisle. One clock between them: **4:24**. Breath only — nothing else moves | r009's one transferable finding, measured at +60% watch time: **show the result in the first two seconds, do not promise it.** A stranger sees two seat maps and an obvious winner before a word is explained, which is the Gate 0 order |
| **2** · 3.2–10.0 | SAME 72 PEOPLE.<br>SAME CABIN.<br>**ONLY THE ORDER CHANGES.**<br><br><sub>most airlines still board roughly back to front</sub> | Both cabins wipe empty and the race **runs from t=0**, seats lighting as people sit, both clocks counting. Rate label **×15** on screen | Establishes that nothing differs but the queue — the one-parameter discipline `I72` was rebuilt around. The rate is printed because a reel that states a rate must be **linear in playback**: easing on the physics is what made the parked traffic build's clock lie |
| **3** · 10.0–17.0 | **NO ORDER AT ALL:**<br>**EVERYONE SEATED, 4:24.**<br><br><sub>back to front still has six people standing</sub> | Right cabin's last seat lights, its clock **stops at 4:24** and goes bone. Left cabin keeps running: front rows still empty, six figures in the aisle, its clock ticking past 4:24 in red | The race resolves on the viewer's side of the argument. The frozen clock against the running one is the whole claim in one picture, and it is the frame they screenshot |
| **4** · 17.0–24.0 | BACK TO FRONT PUTS EVERY BAG<br>**IN THE SAME FEW FEET OF AISLE.**<br><br>**STOWING NOW: 1** | **The camera drops out of plan view into the left aisle at eye level** — overhead bins overhead, one passenger reaching up, eight standing behind them doing nothing. Live counter, from the run | The mechanism, and **the shot that only exists because the scene is 3D.** The counter is the physics: not walking speed, not politeness — how many people can use the aisle at once |
| **5** · 24.0–31.0 | SPREAD THEM OUT AND<br>**SEVEN STOW AT ONCE.**<br>THAT IS THE WHOLE DIFFERENCE.<br><br>**STOWING NOW: 7** | Same eye-level move in the right aisle: bins open the length of the cabin, arms up at seven of them. Then the camera rises back to plan view and the two counters sit side by side, **2 against 7** | The payoff of beat 4. **Back-to-front never exceeds two in any seed or any parameter setting** — that ceiling is the measured result, and seven is this run's own live count |
| **6** · 31.0–38.0 | THEY RAN THIS FOR REAL IN 2011.<br>72 PEOPLE, A MOCK 757.<br>**6:11 AGAINST 4:44.** | Plan view holds; the five measured field-test times slide in as a small ranked list, **back to front** and **random** lit, Steffen and WilMA dim. Citation line small and permanent | **The claim stops being our simulation and becomes an experiment somebody ran with real people.** This is the beat that makes the reel sendable: one subtraction the viewer carries into the argument without us |
| **7** · 38.0–45.0 | UNITED WENT WINDOW-MIDDLE-AISLE IN 2023.<br>**SOUTHWEST IN JANUARY.**<br><br>**NEXT: STAND STILL ON THE ESCALATOR<br>AND MORE PEOPLE GET UP IT.** | Both cabins re-board one last time in the window-middle-aisle order, fast, finishing together. Close held the full 3 s | Non-negotiable 9 — end on a reason to follow, over the finished visual, performable on the phone in their hand. And the reel lands somewhere: **two airlines already changed**, which is news rather than a grumble |

---

## Every figure, and where it comes from

| On screen | Value | Source |
|:--|:--|:--|
| random, our run | **4:24** | `boarding.py` seed 12 — the median seed on both arms, chosen before the numbers were read |
| back to front, our run | **6:08** | same run |
| the gap | **+1:44, 39% longer** (base: random) | same run |
| people stowing at once | **2** against **7** | same run's live counter; the 2-ceiling holds in all 20 seeds and all 144 sweep points |
| field test | **6:11** back to front, **4:44** random | Steffen & Hotchkiss, *J. Air Transport Management* 18 (2012) 64–67 |
| passengers, cabin | **72**, 12 rows × 6, single aisle | the same field test — we animate its cabin |
| United | window-middle-aisle from **26 Oct 2023** | airline announcement, widely reported |
| Southwest | assigned seats and WilMA from **27 Jan 2026** | Southwest's own customer-enhancements notice |

**Nothing on screen is hand-authored.** Every seat, figure, clock and counter value is read from
`boarding_data.json`, and `emit_ts.py` will refuse to write the module if any of the claims above
disagrees with the run.

## What is deliberately NOT in this reel

- **"Your airline boards back to front."** Most do something like it, but United and Southwest do
  not, and boarding groups are tied to fare and status. The copy names the **method**, never the
  viewer's airline. This was the top falsification risk in Gate 0 §7 and it is retired by wording.
- **Our 180-seat extrapolation.** The model says back-to-front costs **76%** on a 30-row A320. It is
  probably directionally right and it is **outside what we have validated**, so it stays in the
  notes.
- **The Steffen method as the answer.** It is the fastest thing in the table and it requires
  splitting up families and perfect compliance, which is why no airline uses it. Naming it as the
  fix would be the reel's one dishonest sentence.
- **Four arms racing.** Two cabins and one comparison. Four clocks is the temptation and nobody can
  track them.

## Falsification, still live after approval

**Non-negotiable 7 outranks this gate.** `r010`'s re-cut copy was approved with the word "lower"
where the integrator said higher. **After approval, every line above gets checked against
`boarding_data.json` again**, and the word changes rather than the data.

---

## GATE 4 — approve, or send a beat back

Once approved this table is the contract: if a beat cannot be animated as written it comes **back
here** as a script change, never improvised at build time.
