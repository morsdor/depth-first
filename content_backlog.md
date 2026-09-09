# Short-Form Content Backlog — v1.0

*50 vertical post concepts for the Depth First short-form line. Written 2026-09-02 alongside
[`insta_strategy.md`](insta_strategy.md), which explains why this line exists and what it is for.
Sections map 1:1 onto the six `DOMAIN_ACCENT` values in `remotion/src/brand/tokens.ts`, so a post's
section determines its accent colour with no further decision.*

**Readable version:** https://claude.ai/code/artifact/05e8ada8-023a-4b75-beb1-80d276be6649

## Scope — widened 2026-09-10

**Every entry below is software, and that is an accident of when this file was written, not the
channel's remit.** The promise is *how systems work* — grids, water, tides, ports, railways,
orbits, cities are all in scope, and the evidence says they are the STRONGER half: three
consecutive Gate 0 failures (`I52`, `r008` twice, `I24`) all died on "the amazement depends on
understanding first", which is the default state of an invisible mechanism. See `CLAUDE.md`.

New non-software concepts get a permanent id here, with a section and therefore an accent, before
anything is built. Runtime is 30–60 s, not the 28–39 s the shipped reels happen to use.

## The rule every entry obeys

One move, applied fifty times: **take something the viewer already uses every day, then show the
mechanism underneath it running on real data.**

- The **surface** must be genuinely universal — no prerequisite, no jargon in the hook.
- The **reveal** must be something they have never seen, and would not have guessed.
- Both are required. `insta_strategy.md` §2.1 records the observed evidence: spectacle without
  utility gets watched and forgotten; utility without spectacle died at 639 likes against a 131,000
  sibling on the same account in the same month.

**Ids are permanent** — same rule as `formula_library.md`. Once `I07` is logged against a post's
engagement in `data/social_log.csv`, it is never reused for a different concept. Retire an entry by
appending "(retired — date, reason)" to its hook; the row stays so old logs keep resolving.

**Nothing here needs image generation.** Every frame is computed from real data by an existing
Remotion family — which is what keeps the numbers on screen correct, keeps marginal cost at render
time, and keeps the line clear of the inauthentic-content profile described in
`channel_strategy.md` §4a.

## Open with these eight

`I01` `I02` `I03` `I15` `I17` `I25` `I31` `I42`

Each pairs the widest available familiar surface with a mechanism that has a strong visual
signature, and together they cover all six sections — so the first month doubles as a pillar test
under `insta_strategy.md` §5. `I42` is the s001 warm-up and should not slip.

---

## §1 · Things you touch every day — accent `data #A78BFA`

*The widest possible familiar surface. Everyone in the audience has used all fourteen, and none of
them has seen the inside.*

| ID | Hook (on-screen title) | They already know | They have never seen | On screen | Family |
|:--|:--|:--|:--|:--|:--|
| **I01** ★ | A QR code you've destroyed still scans — ✅ **produced as r003, 2026-09-03** | Every menu, every UPI payment | A stain over **24%** of the code still reads; the same damage as confetti dies at 4%; and nine modules in a finder corner — 0.7% — kill it outright | Real QR stained, speckled, then corner-hit, with OpenCV's verdict at every step; one Reed–Solomon block lit up to show it smeared across the whole square | Diagram |
| **I02** ★ | Shazam names a song from three seconds of noise | You've held your phone up in a café | It never hears music. Spectrogram → loudest peaks only → match the *constellation of gaps* between them, which is why chatter doesn't break it | Audio → spectrogram → peaks igniting as stars → constellation locking onto a match | Diagram + Counter |
| **I03** ★ | Watch a photograph assemble from 64 patterns | Every JPEG you've opened | A JPEG stores no pixels. It stores how much of each of 64 fixed wave patterns to mix — and discards the ones the eye can't resolve | The 8×8 DCT basis grid, then a real photo rebuilding coefficient by coefficient | PlateAnnotated |
| **I04** | Ctrl+F across 10,000 pages, instantly | You do it every day | It doesn't read every letter. Boyer–Moore compares the *last* character first and skips by the whole pattern on a mismatch — often under a quarter of the text | Comparison window leaping in big jumps; counter of characters examined vs total | Diagram + Counter |
| **I05** | Ten million rows. Three hops. | Every app is querying a database right now | A B-tree finds one row in ten million in ~3 reads — each node fans out to hundreds of children, so depth grows logarithmically while the table grows exponentially | Descent through a real B-tree, key range narrowing per level, hop counter 1→2→3 | Diagram + Counter |
| **I06** | How Google finishes your sentence | The dropdown under every search box | A trie. Every prefix is a path down a tree, so three letters reach their top completions without scanning the other billion queries | Letters typed, path lighting down the tree, completion subtree blooming then pruning | Diagram |
| **I07** | True random felt broken, so Spotify faked it | You've complained shuffle repeats artists | Real randomness clusters. They replaced it with an algorithm that deliberately *spaces* each artist and then jitters — less random, far more random-feeling | Two rows of 100 tracks: true random with visible clumps vs the spread version | Diagram |
| **I51** | The obvious way to shuffle is wrong | Every shuffle button you have pressed | `for i: swap(a[i], a[random 0..n-1])` has n^n equally likely runs over n! orders. For n=3 that is 27/6 = 4.5 — not a whole number, so some order MUST be likelier. Fisher–Yates shrinks the range and gives exactly n! runs, one per order | Two landing-position maps side by side from a real 400,000-run trial — where every card starts (row) vs where it ends (column). The naive map grows a bright staircase and a dark wedge; Fisher–Yates stays featureless. Deviation from fair: 8.34% vs 0.46% | Heatmap + Counter |
*(Visual rewritten 2026-09-07 after the v4 build failed: six bars at n=3 differ by only 1.25x, so the payoff frame visually argued against its own caption. The counting argument `27 ÷ 6 = 4.5` is still the reel's proof — it is now beat 4, supporting a pattern the viewer has already seen, not the thing they are asked to read off a chart.)*
*(Added 2026-09-07 as r005. NOT a rename of `I07` — that entry is about clumping in a CORRECT shuffle and remains unbuilt. Ids are permanent, so a different concept gets a different id.)*
| **I08** | Your keyboard is measuring distance between words | Autocorrect fixes your typo daily | It scores candidates by single-character edits, weighted by which keys physically sit next to each other | Real typo, edit-distance matrix filling cell by cell, winning path traced back | Diagram |
| **I09** | Two people, one word, nothing overwritten | Google Docs when you both type in the same spot | Every character gets an *identity*, not a position — so independent edits merge to the identical result on both machines, in any order | Two cursors on one line, characters carrying ids, merge resolving the same both sides | Diagram |
| **I10** | Why the lift goes up when you pressed down | Everyone has been annoyed by this | The elevator algorithm sweeps to one end before reversing — the same scan a disk head uses. Serving you first makes the average wait worse for everyone | Building cutaway, calls queuing, car sweeping; average-wait counter, sweep vs nearest-first | Diagram + Counter |
| **I11** | Noise cancelling is just arithmetic | You've switched it on in a plane | Mic hears the noise, chip inverts the waveform, the sum is silence — with microseconds to finish before the sound reaches your eardrum | Two waveforms overlaying, sum flattening to a line; latency budget in µs | Diagram + Counter |
| **I12** | Your screen cannot see your finger | You touch one a thousand times a day | It measures capacitance at every wire crossing; your finger steals charge, and the position is *interpolated between* wires — which is exactly why gloves fail | The grid, capacitance heatmap blooming, interpolated centre landing between wires | PlateAnnotated |
| **I13** | MP3 deletes the sound you cannot hear | Half your music library | A loud tone makes nearby quieter tones inaudible for milliseconds. The encoder computes that masking curve and doesn't store what falls beneath it | Live spectrum with masking curve over it, discarded region greying, bytes-saved counter | Diagram + Counter |
| **I14** | Most video frames are not pictures | Every video you've streamed | Roughly one frame every two seconds is a real image. The rest are instructions: *move this block eight pixels left* | Clip playing normally, then stripped to motion vectors alone — still readable as arrows | PlateAnnotated |

## §2 · Maps and real geography — accent `infrastructure #22D3EE`

*The proven spectacle mechanic. Real OSM graphs, real coordinates, real cable routes — the reach
engine of the account.*

| ID | Hook (on-screen title) | They already know | They have never seen | On screen | Family |
|:--|:--|:--|:--|:--|:--|
| **I15** ★ | One route across Paris. Two ways to find it. | Every route your phone has given you | Dijkstra expands in all directions. A\* adds one term — straight-line distance still to go — and the search collapses into a beam at the destination | Split screen on one real city graph, both frontiers expanding, node counters diverging violently | MapRoute + Counter |
*(Hook corrected 2026-09-10. "Dijkstra checks 300,000 roads. A* checks 300" was a figure from memory and no real graph supports it. Measured on central Paris (26,193 junctions from OSM), Arc de Triomphe to Notre-Dame: Dijkstra expands **17,092**, A* expands **1,700** — **10.1x**, identical route. Manhattan was tried first and gave only 3.6x. Four cities x 12 matched routes: Manhattan 3.5x median, Delhi 4.4x, London 5.0x, Paris 6.5x. The grid-weakens-the-heuristic theory was tested and FAILED — detour factors are ~1.3 everywhere; what moves is graph size, which is just Dijkstra filling an area (r^2) against A* following a corridor (r). The ratio is also strongly route-dependent — 1.7x to 10.1x within Paris alone — so the reel names its route and never generalises. Measured by `projects/i15_astar/`.)*
| **I16** | Google Maps doesn't run Dijkstra at all | Routes appear in <200 ms across a continent | The network is pre-processed into shortcut edges; at query time it skips entire cities in one hop. The real work was done months earlier | Same route twice: raw graph crawl vs contraction-hierarchy leaps | MapRoute + Counter |
| **I17** ★ | Your flight path isn't curved. Your map is. | The arc on the seatback screen | The shortest path on a sphere is a great circle. Mercator stretches high latitudes, so a straight line *becomes* an arc — Delhi–SF really does go near the Arctic | Globe with the straight great circle, then unrolling to Mercator as the line bends | MapRoute |
| **I18** | Twelve stops. 479 million routes. 40 milliseconds. | The order your delivery driver visits | Checking every route is factorial and hopeless. Nearest-neighbour + 2-opt lands within a few percent of optimal almost instantly | Real addresses, tangled route untangling as 2-opt uncrosses pairs, distance falling per swap | MapRoute + Counter |
| **I19** | The planet is cut into hexagons | Every cab you've booked | Squares have two neighbour distances; hexagons have one. Ride-matching indexes the world as nested hexes, so "who's near me" is a set lookup, not a distance calc over every driver | Real city tiling into hexes, resolution stepping down, drivers resolving in one cell | MapRoute |
| **I20** | Where in your city you'd wait longest for an ambulance | Everyone knows their nearest hospital | The boundary where each station is closest is a Voronoi diagram — and the *corners* of those cells are the worst places to have an emergency | Real station coordinates, cells growing until they meet, worst interior point pinned with drive time | MapRoute + Counter |
| **I21** | The metro route that's shorter and slower | You've picked the wrong line before | Shortest path counted in stations is wrong. Add a 4-minute interchange penalty and the optimal route changes completely | Real metro graph, two routes highlighted, the fewer-stops one losing on total time | MapRoute + Counter |
| **I22** | Your message to a friend abroad goes underwater | It feels instant, and it feels wireless | Almost none of it is satellite. It's glass on the seabed — and you can name the cable, the landing station, and the milliseconds each leg costs | Mumbai→Virginia traced cable by cable, latency accumulating against the speed-of-light floor | MapRoute + Counter |
| **I23** | The internet is 75,000 networks gossiping | You think of it as one thing | There is no map of the internet. Each network only tells its neighbours what it can reach, and every path emerges from that gossip | Real AS-graph, a path assembling hop by hop between two countries | MapRoute |
| **I24** | Minecraft's infinite world is one number | Everyone has typed in a seed | Terrain is never stored. Layered noise turns coordinates into height deterministically — so the same seed rebuilds the identical world on any machine, forever | Noise octaves stacking into terrain, then the same seed regenerating it identically | PlateAnnotated |
*(FAILED Gate 0 on the sentence, 2026-09-10 — proposed as r009 and rejected before any build. Three sentences were offered and none was one a viewer would repeat: the rebuilt-world framing has no dispute running behind it, and the two that do — text seeds reaching 1 world in 4.3 billion (`String.hashCode` is 32-bit against a 64-bit seed), and the pre-Beta-1.8 Far Lands at 12,550,824 blocks where noise x 171.103 overflows a 32-bit int — are arguments only Minecraft players are having. **The fight has to be one a non-specialist is already in**; r006 landed inside flat earth, and a seed-sharing dispute is not that. Not repaired, per `CLAUDE.md`. Also corrected while here: "layered noise turns coordinates into height" is the PRE-1.18 generator; since 1.18 the overworld is 3D density functions and splines. Licence was clear — own noise code in brand colours, no Mojang assets, and [Cubiomes](https://github.com/Cubitect/cubiomes) is MIT if real seeds are ever wanted.)*

| **I53** | Your street is the bottom of a bowl you can't see — ❌ **FAILED Gate 0, 2026-09-10** | Every monsoon, the same junctions under water | *(claim falsified — see below)* | Real SRTM terrain, water routing downhill, the junctions the news names | MapRoute + Counter |
*(Added and killed the same day — the first concept under the widened "how systems work" remit, and the first killed by measurement rather than judgement. Proposed sentence: "your street floods because it's the bottom of a bowl, and a satellite names the same three junctions every year." Tested on real SRTM 1-arcsec over Bengaluru (1260x1080 cells, georeference verified against published elevations) against eight junctions the city reports flooded by name, controlled on 3,000 random points in the built-up core. **All three metrics went the wrong way**: flood spots sit at the 57.4th elevation percentile of their own 1 km neighbourhood vs 47.7 for random points, have a 20.5 m rim above them vs 24.0, and LESS flow accumulation (1.23 vs 1.34 log10). Only Silk Board is genuinely in a dip. 30 m SRTM cannot see an underpass and better data is not free, so this does not improve by retrying. NOT repaired and no city shopping — testing Mumbai and Chennai until one fits is p-hacking when the causal claim is the reel. Full record in `projects/i53_flood/gate0/GATE0.md`.)*
## §3 · What actually happens when you… — accent `languages #60A5FA`

*The highest send ratios in the reference account came from this shape. One everyday action, traced
end to end with a running clock.*

| ID | Hook (on-screen title) | They already know | They have never seen | On screen | Family |
|:--|:--|:--|:--|:--|:--|
| **I25** ★ | Everything that happens before the page appears | You do this a hundred times a day | DNS, TCP, TLS, HTTP — and the first byte arrives only after roughly six round trips you never see | Full trace with a running millisecond clock, each phase claiming its slice | Diagram + Counter |
| **I26** | Two strangers agree a secret while everyone watches | The padlock in your address bar | They exchange numbers completely in the open that let each compute the same secret — which an eavesdropper who saw every message cannot | Diffie–Hellman with numbers small enough to verify, eavesdropper's column visibly stuck | Diagram |
| **I27** | What the second blue tick actually proves | Everyone reads them; nobody agrees | One tick is the server, two the recipient's *device*, blue the app being opened — and the message was encrypted before any of the three | Message travelling the real path, each tick firing at the exact hop that produces it | Diagram |
| **I28** | One address, fifty devices | Everyone's home wifi | The router rewrites the source port of every outgoing packet and keeps a table to route replies back — which is precisely why incoming connections fail by default | Translation table filling and rewriting live as devices talk over each other | Diagram |
| **I29** | The same IP address, answered from forty countries | A site that loads fast everywhere | Many machines announce the *identical* address and routing delivers you to the nearest. The network itself does the load balancing | World map, one address, requests from different continents resolving to different cities | MapRoute |
| **I30** | The sawtooth behind every buffering wheel | You've watched the spinner | TCP has no idea how fast the network is. It accelerates until packets drop, halves, climbs again — forever. Your throughput graph is a saw blade by design | Congestion window climbing and collapsing, real loss events marked at each cliff | Diagram + Counter |
| **I52** | Your phone is listening for exactly one word | The ad you got right after saying it out loud | Nothing leaves the phone. A rolling on-device buffer is overwritten continuously and only a ~3 s clip (12 KB) is ever sent, and only after the wake word — while streaming *everything* at 16 kbps would be 5.2 GB/month. Both platforms light a status-bar indicator whenever any app touches the mic, wake-word detection included | Real speech envelope pouring into a phone, rolling buffer overwriting itself, "heard today 24 h" against "left your phone 0 bytes", indicator dark until the word fires | Diagram + Counter |
*(Added 2026-09-10 as the first entry chosen under the "live argument" test — see `brand_guide_software.md` §13. NOT a duplicate of `I33` (VPN) or `I41` (tokenisation); this one is about the microphone and the ad, which is the most-argued belief in consumer tech. Platform claims verified against Apple Support 108331 and AOSP privacy-indicators, both cited in `projects/i52_listening/gate0/`.)*
| **I31** ★ | A typo once took a country off the internet | Everyone's heard "the internet went down" | Routing between networks runs on trust. In 2008 one network announced it owned YouTube's addresses, and the world believed it for two hours | Real path flipping, global traffic redirecting, then the withdrawal propagating outward | MapRoute + Counter |
| **I32** | Thirteen root servers. Four hops. Twenty milliseconds. | You type names; machines need numbers | Nobody holds a list of every domain. The lookup walks a hierarchy — root, .com, the domain's own server — and caches nearly all of it | Four queries firing in sequence, TTL counters running, instant cache hit on the repeat | Diagram + Counter |
| **I33** | What a VPN hides, and four things it doesn't | Half the internet advertises them | It hides destination from your network and address from the site. Not from a site you log into, browser fingerprinting, DNS leaks, or the VPN operator | Connection drawn with everything it covers, then four leak paths in the failure accent | Diagram |
| **I34** | Your phone corrects for Einstein, or you'd be 10 km off | The blue dot | Satellite clocks run faster in weaker gravity and slower from orbital speed. Uncorrected that's ~38 µs/day — roughly 11 km of position error | Trilateration spheres intersecting; toggle showing the fix drifting once relativity is removed | Diagram + Counter |

## §4 · Secrets and proofs — accent `security #4ADE80`

*Cryptography survives the feed only when the numbers are small enough to follow on screen. Every
one of these is verifiable by eye.*

| ID | Hook (on-screen title) | They already know | They have never seen | On screen | Family |
|:--|:--|:--|:--|:--|:--|
| **I35** | Why a stolen password database is often useless | Everyone has seen a breach headline | Hashes alone fall to a lookup table. One random salt per user forces the attacker to crack every password separately — the same work, multiplied by millions | Two databases attacked side by side: one collapsing instantly, the other's counter barely moving | Diagram + Counter |
| **I36** | Change one letter, change everything | You've seen hashes without knowing what they were | A single-bit change flips about half the output bits — and that avalanche is exactly what makes a hash usable as a fingerprint | A sentence, one character edited, the 256-bit output as a grid with every changed bit igniting | PlateAnnotated |
| **I37** | Public-key encryption, with numbers you can follow | It secures everything; almost nobody has watched it run | With small primes the whole of RSA fits on one screen — encryption, decryption, and why factoring the product stays hard | Real arithmetic step by step, at a size where the viewer can check each line | Diagram |
| **I38** | Two devices, six digits, no internet | Every 2FA code you've typed | Both sides hold the same secret and hash it with the current 30-second window. Nothing is transmitted — they just agree on the clock | Two devices side by side, window ticking down, both codes rolling over in lockstep | Diagram + Counter |
| **I39** | Proving one line without showing the ledger | "Blockchain" as a word everyone's heard | A Merkle tree proves one transaction sits in a block of a million using ~20 hashes — and nobody has to send you the block | The tree drawn out, proof path lighting up, hash count set against block size | Diagram + Counter |
| **I40** | Mining is a slot machine with one rule | Everyone's heard it "solves complex mathematics" | It doesn't. It changes one number and re-hashes, billions of times a second, hoping the output starts with enough zeros. That is the entire puzzle | Nonce incrementing, hashes streaming, target zeros highlighted until one lands | Counter + Diagram |

## §5 · AI, made physical — accent `ai #FFB020`

*The strongest vein in `data/outliers_software.csv`, and the direct warm-up for s001 — every post
here tests demand for the video that is already boarded.*

| ID | Hook (on-screen title) | They already know | They have never seen | On screen | Family |
|:--|:--|:--|:--|:--|:--|
| **I41** | What your sentence becomes before the model sees it | You've typed into a chat box | Your words are cut into tokens that ignore word boundaries, mapped into vectors, and the model never sees a letter at any point | Real sentence splitting into tokens with ids, then dissolving into an embedding grid | Diagram |
| **I42** ★ | The reactor behind the chat box | The box you type into | One query is a fraction of a watt-hour. The fleet is measured in restarted nuclear reactors — and the number on screen is 835 MW | The s001 dazzle ladder — query, rack, hall, plant, reactor — each rung a real sourced figure | Counter + PlatePush |
| **I43** | Watch an image emerge from pure noise | Everyone has generated one by now | The model never draws anything. It predicts what noise to remove, fifty times over, and the picture is whatever is left behind | Denoising steps running, with the predicted noise shown beside the result at each step | PlateAnnotated |
| **I44** | Which words the model was actually looking at | It feels like it understands you | Every output token weights every input token. Draw those weights and you watch it resolve a pronoun to the noun it belongs to | Real attention heatmap over one sentence, the pronoun's row lighting its referent | PlateAnnotated |
| **I45** | Where your photo physically is | You uploaded it in about a second | It's inside at least three buildings on two continents before the upload spinner finishes turning | Phone → edge → region → replicas on a real map, write acknowledged partway | MapRoute + Counter |
| **I46** | 0.4 seconds, and what it cost | The timing under every search result | That number is a thousand machines answering in parallel — and the single slowest one sets the time you actually experience | Fan-out to shards, each returning at its own pace, tail latency isolated and labelled | Diagram + Counter |
| **I47** | Training is the mountain. Inference is the river. | "AI uses a lot of power" as a claim nobody can picture | Training is enormous and happens once. Inference is tiny and happens a billion times a day — and overtakes training's entire total within months | Two accumulating areas on one axis, crossover marked where the river passes the mountain | Counter |

## §6 · Failure autopsies — accent `failure #FF4D4D`

*Highest shareability per post and the most documentary-adjacent shape in the backlog — the pilot #2
lane (`projects/s001_ai_physical_cost/README.md`), tested cheaply.*

| ID | Hook (on-screen title) | They already know | They have never seen | On screen | Family |
|:--|:--|:--|:--|:--|:--|
| **I48** | $440 million in 45 minutes | Everyone who writes software has shipped a bad deploy | An old flag was reused for a new feature, and one server out of eight never got the update. The dead code woke up and started trading | Eight servers, seven green and one red, loss counter running against the wall clock | Counter + Diagram |
| **I49** | Thirty-nine seconds, one number too big | A rocket exploding is legible to everyone | A 64-bit velocity was converted into 16 bits. It didn't fit. The guidance computer's error output was then read as flight data | Register overflowing at the exact value, conversion failing, trajectory diverging frame by frame | Counter + Diagram |
| **I50** | The index that lost half its value to rounding | Everyone trusts a number on a screen | Truncating instead of rounding, thousands of times a day, walked a stock index from 1,000 to 520 over 22 months — while nothing was wrong with the market | Real index line drifting from the correctly-rounded line, gap widening month by month | Counter |

---

## Accuracy gate — non-negotiable

Every entry above states a mechanism as fact. `insta_strategy.md` §6 makes accuracy the
differentiator in a lane full of approximately-right content, and that only holds if it is enforced
rather than intended.

### Verified corrections log

- **`I01` — checked 2026-09-03, two claims were wrong.** "Up to 30%" is the *spec capacity* of error
  level **H**, the highest of four, and only for codeword recovery. Measured with a real stain on a
  real code and OpenCV as the decoder: **24%** of the data area. The failure point is exactly the
  Reed–Solomon bound — at 24% the worst block has 11 corrupted codewords of a maximum 11; at 26% it
  hits 13 and dies — so this is the math running out, not a decoder giving up. Separately, **"no
  region is essential" is false**: nine modules inside a finder corner (0.7% of the code) kill it,
  because finders, timing and format info are not Reed–Solomon protected at all. Also worth stating
  on screen: most menu and UPI codes are level **L or M** (7% / 15%), not H.

**Before any post ships, its claim, its figures and its complexity bounds are verified against a
primary source, and the source is recorded** — the short-form equivalent of what
`visual-accuracy-gate` does for plates. The historical entries (`I31`, `I48`, `I49`, `I50`) carry
dates and dollar figures from memory in this draft and **must** be checked against primary incident
reports before production. Treat every number in this file as a research lead, not a verified fact.
