# yt001 — How GPS finds you, and why it needs Einstein

**4.94 min · 3840×2160 design, rendered 1920×1080 · 30 fps · 751 words · AI voice (Kokoro-82M, `af_heart`)**

Generated from `timeline.json` by `script_md.py` — every time below is a real sentence boundary in the audio.

| t | Narration (verbatim) | On screen | Why this beat exists / source |
|:--|:--|:--|:--|
| 0:01.2 | Right now, thirty-one satellites, twenty thousand kilometers above your head, are broadcasting the time. | Title 'HOW GPS FINDS YOU'. Real coastlines, 31 satellites on Kepler orbits, counter 31 · 20,191 km up | Show the claim before explaining it |
| 0:07.7 | Your phone listens, and from nothing but those timestamps, it works out where you are, to within a few meters. | Signal pulses run from every satellite above the horizon to the blue dot; '± 5 m from timestamps alone' | The mechanism is already running on screen |
| 0:14.2 | It's one of the most precise measurements most people make every day. And it only works because of Albert Einstein. | The line that matters: Δf/f = ΔΦ/c² − v²/2c² (how fast a clock ticks). EINSTEIN is the one amber word | Plants the payoff for scene 5 |
| 0:21.8 | GPS is thirty-one satellites in six orbital planes, tilted fifty-five degrees to the equator, at an altitude of about twenty thousand two hundred kilometers. | Six orbital planes draw on in six hues; cards: 6 planes · 55° · 20,191 km (computed from Kepler) | gps.gov + Navipedia; altitude is DERIVED and checked |
| 0:32.6 | Each one circles the Earth twice a day, and the pattern is arranged so that from almost anywhere on the surface, at least four are always above the horizon. | 2× orbits a day (11 h 58 min); live count of satellites above the horizon; never fewer than 6 anywhere (computed) | 'At least four' is verified on a global grid, not assumed |
| 0:42.1 | They carry atomic clocks, and they do one thing: they broadcast who they are, where they are, and exactly what time it is. | Each satellite 'broadcasts': WHO I AM · WHERE I AM · WHAT TIME IT IS | What a GPS signal contains |
| 0:49.2 | And notice what they don't do. Nothing travels from your phone to them. GPS is receive-only, so the satellites never know you exist, and any number of phones can use it at once. | RECEIVE ONLY: nothing travels up; any number of phones can listen | Corrects a common misconception |
| 1:01.2 | The signal travels at the speed of light, so the delay tells you the distance. | DELAY × SPEED OF LIGHT = DISTANCE. A signal front expands from a satellite to scale; timer slowed 50× | The one equation of the whole system |
| 1:05.6 | From a satellite straight overhead, the signal takes about sixty-seven milliseconds. Multiply by the speed of light, and you know you're somewhere on a sphere, centered on that satellite, with a radius of twenty thousand kilometers. | 67.3 ms × 299,792 km/s = 20,191 km; a sphere of possible places drawn to scale | Computed: altitude / c |
| 1:19.3 | A second satellite gives a second sphere. Where they overlap is a circle. A third narrows it to two points, and one of them is out in space. | Three spheres in 3-D: sphere, then circle, then two points; one mirror-point flagged OUT IN SPACE | Real geometry: the second point is the reflection across the satellites' plane |
| 1:29.1 | There's a catch. To measure that delay, your phone needs the time to within a few billionths of a second. But the clock in your phone is a cheap quartz crystal, and it can be off by a lot. | NEEDED: a few billionths of a second. A phone has a quartz crystal. Toy stage: three circles that do not meet | Why the clock is the hard part |
| 1:40.5 | One microsecond of error is three hundred meters. So your phone has four unknowns: where you are in three dimensions, and how wrong its own clock is. | 1 µs = 300 m; 0.5 ms = 150 km; unknowns x · y · z · b | Counts the unknowns |
| 1:50.0 | Four unknowns need four equations. That's why GPS needs a fourth satellite. Starting from a guess at the center of the Earth, the phone corrects its answer again and again, and in five steps it homes in on your position, and on your clock error. | 4 unknowns, 4 satellites. A real Gauss–Newton fix from the centre of the Earth: 6,375,870 m → 3.5 m in 5 steps; the toy circles close on one point | REAL solver on real satellite geometry, 2 m noise per range |
| 2:06.6 | Now, the satellites' clocks. Einstein says they can't agree with clocks on the ground. | Two clocks: GROUND ≠ SATELLITE | Setup |
| 2:11.9 | First, special relativity: a moving clock runs slow. The satellites move at nearly four kilometers a second, and that costs them about seven microseconds a day. | Orbit with velocity arrow, v = 3.874 km/s; ledger row: special relativity −7.21 µs/day | Computed from GM and the Kepler orbit |
| 2:22.9 | Second, general relativity: clocks run slower deeper in gravity. Up at twenty thousand kilometers, gravity is weaker, so the satellite clocks run faster, by about forty-six microseconds a day. | Gravity well; ledger row: general relativity +45.79 µs/day | Computed from the IAU geoid potential and GM/r |
| 2:36.0 | This isn't only theory. In nineteen fifty-nine, physicists at Harvard measured gravity's effect on time across a tower just twenty-two and a half meters tall. | Harvard tower: 22.5 m, 1959; predicted shift gh/c² = 2.46 × 10⁻¹⁵ | Pound–Rebka; the shift itself is computed, not quoted |
| 2:46.3 | The net result: the satellite clocks gain about thirty-eight and a half microseconds every day. In that time, light travels eleven and a half kilometers. | Net +38.58 µs/day; a ruler that fills to 11.56 km as the day passes | 38.58 µs × c = 11.56 km |
| 2:56.1 | When a test satellite, N T S two, launched in June nineteen seventy-seven, it carried a frequency synthesizer to cancel the effect. But engineers left it switched off, and let the atomic clock run for about twenty days. | NTS-2 · June 1977; ≈ 20 days running free; synthesizer switch OFF | Matters of Gravity (Ashby) via search; a secondary copy of the Living Review |
| 3:10.6 | It gained four hundred forty-two and a half parts per trillion. General relativity had predicted four hundred forty-six and a half. Then they switched the correction on. | MEASURED +442.5 vs PREDICTED +446.5 parts per trillion; OUR CALCULATION +446.5; switch flips to ON | Our unfitted calculation lands on the published prediction |
| 3:21.0 | Today, every GPS clock is set, before launch, to tick at ten point two, two, nine, nine, nine, nine, nine, nine, five, four, three megahertz, instead of ten point two three. So that in orbit, it ticks exactly right. | 10.23000000000 MHz vs 10.22999999543 MHz (the differing digits in cyan); −4.465 × 10⁻¹⁰ | Computed offset reproduces the published pre-launch setting |
| 3:36.6 | So how accurate is it? A smartphone under open sky is typically within about five meters. The signals in space are specified to about two. The rest comes from the atmosphere slowing the signal, and from buildings bouncing it. | Street grid with rings TO SCALE: phone ~4.9 m, signals ~2 m; a signal bounced off a building | gps.gov accuracy page |
| 3:51.4 | The ionosphere delays radio waves by an amount that depends on their frequency, so many modern phones listen on two frequencies at once, and use the difference to cancel the delay. | Two rays through the ionosphere (L1 1575.42, L5 1176.45 MHz); delay ∝ 1/f²; L5 is delayed 1.79× more | Physics; the ratio is computed |
| 4:02.9 | It used to be far worse, on purpose. Until May the second, two thousand, the US military deliberately degraded civilian GPS to about a hundred meters. A presidential order switched that off. | Zoom out: a 100 m ring, 'until 2 May 2000, on purpose', then it shrinks to ~5 m | gps.gov selective-availability pages |
| 4:17.4 | So every time a blue dot lands on your map, three ideas are working together. Distance from time. A fourth satellite, to fix your clock. And Einstein, to fix theirs. | Three cards appear as spoken: DISTANCE FROM TIME · A FOURTH SATELLITE · EINSTEIN | The recap |
| 4:28.3 | And it isn't just maps. Many cell networks, power grids and financial markets use GPS time as their reference, which is why getting the clocks right matters far beyond navigation. | GPS TIME hub: cell networks, power grids, financial markets | Reference-clock use of GPS time |
| 4:40.4 | Take away any one of those three ideas, and the system stops working. | TAKE ANY ONE AWAY — and the system stops working; then the sources | Close; credits for 12 s |

## Scene windows

| scene | start | end |
|:--|--:|--:|
| hook | 0:01.2 | 0:20.5 |
| satellites | 0:21.8 | 0:59.9 |
| ranging | 1:01.2 | 1:27.9 |
| clock | 1:29.1 | 2:05.4 |
| einstein | 2:06.6 | 3:35.4 |
| accuracy | 3:36.6 | 4:16.1 |
| close | 4:17.4 | 4:44.3 |
