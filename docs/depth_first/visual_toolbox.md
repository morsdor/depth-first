# Visual toolbox — everything a reel could be made of

*Organised by the object on screen, because Gate 0 is about objects. For each option: what it
gives, what it costs, what the licence demands, whether it is in the repo today, and which backlog
ids it fits. Licence statements marked ✔ were checked against the source on 2026-09-10 (links at
the end); everything else is well-established but still gets re-checked inside Gate 0, which is the
repo's own rule since r007.*

---

## 0. The one bridge that makes every renderer usable

r010 proved the pattern: **any external renderer → a transparent PNG sequence at the composition's
fps → `remotion/public/<dir>/0000.png …` → a layer inside the Remotion composition.** Remotion keeps
the chrome, the text, the camera, the safe area and the audits; the external tool only draws.

```
                       Python decides                          Remotion composes
 real algorithm / physics ──► <name>_data.json ──┬──► emit_ts.py ──► data/<name>.ts ──► <Reel>.tsx (chrome, text, camera)
                                                 │                                          ▲
                                                 └──► Manim | Blender | matplotlib | three.js offline ──► PNG seq ──► <FrameSequenceLayer/>
```

- `reels/lib/manim.tsx` is already a generic frame-sequence player; only its name says Manim.
  `module_packs.md` proposes renaming it `FrameSequenceLayer` and adding `scripts/blender_render.py`
  beside `scripts/manim_render.py`.
- Cost is disk, not money: ~150 KB per 1350×2400 frame, so a 40 s layer is ~180 MB, git-ignored and
  regenerated from the scripts. Render at 1.25× the composition when the Remotion camera will push in.
- **The state still lives in the JSON.** Whatever draws it, `emit_ts.py` still asserts the claims,
  and `layout.py` (r010) is the model for sharing geometry between the renderer and the annotations.
- The alternative is to render *inside* Remotion: `@remotion/three` runs WebGL in the composition
  (§3). Use the bridge when the tool has assets or materials Remotion lacks; use `@remotion/three`
  when the geometry is simple and you want one build.

---

## 1. Maps and geography — the Johnny Harris / Fern lane (20 ids in §2)

| Technique | What it gives | Cost / key | Licence & attribution | In repo? | Fits |
|:--|:--|:--|:--|:--|:--|
| **Own projection code** — Mercator, orthographic, globe↔map morph, graticule, great-circle sampling | exact geometry, brand style, deterministic | none | Natural Earth coastlines: public domain | **Yes** — r006, r007, r009 (`mercY`, `GRATICULE`, `tailPath`, `ringPaths` duplicated across `Cables.tsx` and `Greatcircle.tsx`) | I16 I18 I19 I21 I23 I56 I59 I60 I63 |
| **OSM street graphs** via Overpass | real streets, real node counts, the `equation.verse` flood | none; rate-limited, cache it | ODbL — "© OpenStreetMap contributors" on screen or in the caption; a rendered reel is a *produced work*, publishing the extracted graph JSON would be a *derived database* | **Yes** — r008; Paris, London, NYC, Delhi cached in `projects/i15_astar/` | I16 I20 I21 I53-class ideas |
| **Vector basemap in Remotion** — MapLibre (free, no key, no 3D buildings), MapTiler (key, free tier; borders, rivers, labels as filterable layers), Mapbox (key; globe view; 3D landmarks) | a real, styled map that pans and zooms, with annotations pinned to features | key for MapTiler/Mapbox; MapLibre none | provider terms + OSM attribution | No — but the vendored `remotion-maps` skill carries a technique file for each, with the traps (`delayRender` until `idle`, `preserveDrawingBuffer:true`, `jumpTo` per frame) | anything where streets/rivers/borders are the object |
| **3D terrain flyover** — CesiumJS technique: `landscape` mode on MapTiler terrain + satellite, `city` mode on Google Photorealistic 3D Tiles | the Fern flyover: a valley, a dam, a port from the air | MapTiler key (free tier); Google 3D Tiles need a **billing-enabled** key | provider attribution | No — `.agents/skills/remotion-maps/techniques/cesium/` has a `CesiumFlythrough.tsx` and path-prep script ready to copy | I57 I61 I62, any "the place is the object" reel |
| **Google Earth Studio** | keyframed satellite/3D camera, PNG sequence export with camera data | free, browser | ✔ "Google Earth" + imagery providers **on screen for the duration**; allowed for documentaries, education and recreational YouTube; **not** for ads or promotional content; Google offers no commercial licence | No | the same, when a Cesium key is not worth it |
| **Blender + BlenderGIS + a DEM** (SRTM, Copernicus 30 m) | terrain in your own style with your own camera and materials | free; the heaviest learning curve here | DEM: free with attribution (Copernicus) or public domain (SRTM) | No | stylised terrain, cutaway geology (I53-class) |
| **Satellite imagery** — NASA Worldview/GIBS, Landsat (USGS), Sentinel-2 (Copernicus) | real photographs of the place | free | NASA/USGS public domain; Sentinel free with attribution | No | the "look at it" beat of a physical reel |
| **Globe textures** — NASA Blue Marble | a photoreal sphere in three.js | free | public domain | No | I59 I60 I63 |

**How to choose.** If the map's job is *context*, a static locator image is enough (the smallest
technique). If the *claim is geometry* — routes, distances, projections — the code you already have
is the right tool and is exact. If the claim needs real streets, rivers or borders, a vector basemap.
If **the place itself is the payoff** — a dam, a harbour, a mountain pass — that is the Fern move
and it needs a flyover. The 20 map ids in §2 split roughly 14 / 4 / 2 across those three.

---

## 2. Charts, graphs, instrumentation

| Tool | Have? | Use it for | Do not use it for |
|:--|:--|:--|:--|
| **Manim CE 0.18.1** (`.manimenv`) | yes | `Axes`, `Graph` (`projects/manim/probe.py` floods a shortest path), `NumberLine`, `ValueTracker`-driven plots, physics apparatus (r010) | equations — no LaTeX installed; typeset in HTML/CSS inside Remotion instead, where `emit_ts.py` can assert them (r010) |
| **matplotlib** (`.venv`) | yes | Gate 0 mocks, `design.py` sweeps, scientific plots as PNG sequences | anything that must match the brand tokens pixel-exactly |
| **d3** in Remotion (`d3-geo`, `d3-scale`, `d3-shape`, `d3-force`; ISC licence) | no | projections (it would replace the hand-written `mercY`), scales, arcs, force layouts — deterministic when seeded and driven from `useCurrentFrame()` | animating with d3 transitions (timers are forbidden in Remotion) |
| **A code panel with the executing line highlighted**, synced to the picture | no | §3/§4 software ids — the single strongest craft element on `equation.verse` per the teardown | reels whose object is physical |

**Gate 0 reminder that overrides all of this:** a chart is a picture *of* an idea. It is never the
payoff frame and never the opening object; it sits beside the object (rule 6, and the r005 lesson —
a 13×13 matrix measured over 400,000 shuffles was the most honest reel and the least watchable).

---

## 3. 3D

| Option | Licence | Have? | Best for | Cost |
|:--|:--|:--|:--|:--|
| **`@remotion/three`** — three.js + React Three Fiber inside the composition | MIT | no (`npx remotion add @remotion/three`) | globes with real textures, orbits and satellites (I59, I63), cutaways, simple mechanisms — the lift (I10), the tuned mass damper (I61), base isolators (I62), a code-controlled camera | a day to learn; must animate only from `useCurrentFrame()`, `useFrame` is forbidden, `<Sequence layout="none">` inside the canvas, gate model loads with `delayRender` |
| **Manim `ThreeDScene`** | MIT | yes | surfaces, rotating diagrams, brand-consistent 3D without materials | none extra; no PBR, no meshes |
| **Blender** — headless `blender -b scene.blend -P drive.py` → RGBA PNG sequence | GPL (the tool; your renders are yours) | **no** | anything that exists only as a mesh or needs materials: anatomy, spacecraft, buildings, photoreal terrain; EEVEE is fast, Cycles is slow | weeks to become fluent; the Python API can be driven from the same JSON the reel already produces |
| **Free models** — NASA 3D Resources (mostly public domain, check per item), Smithsonian 3D (many CC0), Poly Haven (CC0 HDRIs/textures/models), Sketchfab filtered to CC (attribution) | per item | no | spacecraft, landmarks, props | download + check |

**Boundary rule, to avoid tool sprawl:** geometry you can describe in fifty lines stays in code
(three.js or Manim). Blender is added the first time a *gated* id needs an asset that only exists as
a mesh — which today means the body (§4) — and not before.

**Determinism** is the thing every 3D tool gets wrong by default for Remotion: fixed seeds, fixed
fps, no time-based animation, no motion blur from wall-clock, and a middle-frame still rendered before
the full sequence (the Cesium technique's own rule).

---

## 4. The body — the TheBrainMaze lane

`@thebrainmaze` is a ~1M-follower science account ("Making science fun for everyone", Instagram and
TikTok) whose reels are largely 3D science and body animation. *What tools they use is not
established; do not assume.* What transfers is the lane: **the body as a system whose mechanism
can be shown running on data**, which is exactly the channel promise, not anatomy labels.

### Free anatomy assets

| Asset | Licence | What it is | Attribution required |
|:--|:--|:--|:--|
| **Z-Anatomy** | ✔ CC BY-SA 4.0 | An open 3D atlas: a Blender file (and app) with 5,000+ structures and 3,500 definitions, in layers — skeleton, muscles, vessels, nerves. A modified, organised descendant of BodyParts3D. GitHub `Z-Anatomy/Models-of-human-anatomy`. | yes, and share-alike |
| **BodyParts3D** (Database Center for Life Science, Japan) | ✔ CC BY-SA 2.1 Japan | The upstream OBJ set, ~136 MB zipped | the exact line: *"BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan"*, and share-alike |
| **MakeHuman** | ✔ app AGPL3; **exports from the official, unmodified binary are CC0** | a parametric whole-body figure — skin, not organs | none for exports |
| **NIH 3D** | per model | organs, cells, devices | check each |

**The share-alike question, settled now rather than after a build.** Whether a reel that composites
a CC BY-SA mesh is an "adaptation" is contested; the safe position is to attribute in the caption
and on the end frame, treat the reel as SA-compatible (nothing is sold, nothing is locked), and
record that decision in `GATE0.md` under the licence question. The day a reel is sponsored, this is
re-decided — the same trigger that would end Google Earth Studio use.

### What "how systems work" means for the body

Every one of these needs a Gate 0 sentence and an answer to *who do you send it to*. None has a
backlog id yet; the rule is to add the id first. They would sit in §1 (things you touch every day)
or in a new **§7 · The body** — a seventh section needs a seventh accent, which is a `tokens.ts`
and brand decision, not a one-line edit.

- The heart is a pump: a pressure–volume loop drawn from published curves, the valve as the object.
- The ear is a frequency analyser: the basilar membrane resolving a chord — the r001 spectrogram, in flesh.
- Walking is an inverted pendulum: leg length sets cadence the way string length set r010's — the same equation.
- The eye projects the world upside down: real optics, a real lens, the retina as the screen.
- Reflex latency is nerve length divided by conduction speed: why the knee-jerk is faster than a decision.
- Blood pressure against height: the giraffe, the fainting soldier, the astronaut.

Each is an argument people already have, out loud, about their own body — which is the reach
condition r009 and r010 lacked.

### Toolchain for it

Z-Anatomy in Blender → isolate the structure → **either** export glTF and rotate/cut it in
`@remotion/three` (light: one mesh, brand lighting, code camera) **or** render in Blender to a PNG
sequence and layer it (heavy: materials, depth, interior views). Physiological data: PhysioNet hosts
open ECG/pressure/gait signals (licences vary per dataset, commonly ODC-BY — check each).

---

## 5. Real footage and photographs

The most under-used lane, and the cheapest. The argument test's first condition — *the viewer has
personally witnessed the evidence* — is met literally when the reel **shows** the seatback map, the
blue dot, the supermarket queue, the pendulum rig.

- **Your own phone.** r004's payoff was a photo the user took at a museum. Zero licence, zero cost,
  and the object is unarguably real. A reel that opens on real footage and draws the computed
  mechanism over it ("the route your flight actually took, on the screen you actually looked at")
  is a format this account has not tried.
- **Wikimedia Commons** (per-file CC, attribution), **NASA galleries** (public domain), stock sites
  (Pexels/Pixabay have their own licences and editorial limits — read them).
- Never someone else's viral footage. The pendulum-wave rigs on the platform are other people's
  videos; r010 was computed for exactly that reason, and its caption says "Not filmed".

---

## 6. Audio

Every reel so far ships on original audio (silence or its own sounds). Options, each an experiment:
CC0 / CC-BY music (Pixabay Music, Free Music Archive — check the licence per track and that it is
cleared for **both** Instagram and Shorts), or Instagram's own library (reach on Instagram, unusable on
Shorts, and the reel then cannot be re-posted elsewhere). Narration is a separate decision — the
long-form brand guide (now on the `yt-longform-archive-DO_NOT_DELETE` branch) made it the
differentiator, and no reel has any.

---

## 7. Data sources by system, with the licence each carries

*Every row is a Gate 0 licence question, not an answer.*

| System | Source | Licence / terms | Ids |
|:--|:--|:--|:--|
| Streets, rail, power lines, pipelines | OpenStreetMap (Overpass; OpenInfraMap for power) | ODbL, attribution | I16 I20 I21 I57 I67 |
| Coastlines, borders, rivers | Natural Earth | public domain | §2 |
| Elevation | SRTM (NASA), Copernicus DEM | public domain / free with attribution | I53-class |
| Bathymetry | GEBCO | free with attribution | I22-class |
| Tides | NOAA CO-OPS (US stations) | US government, public domain | I58 follow-ups |
| Earthquakes | USGS feeds | public domain | §6 |
| Satellites in orbit | CelesTrak TLEs; `skyfield` to propagate | free, cite | I59 |
| Flights | **OpenSky Network** | ✔ **non-profit research and education only**; operational use needs a written agreement; commercial use needs a licence — treat as unusable for a channel | I56 |
| Airports and routes | OurAirports | public domain | I56 |
| Weather / climate | Copernicus ERA5 | free with attribution and registration | I57 I65 |
| Grid | ENTSO-E Transparency (EU), EIA (US) | free with registration / public domain | I67 |
| Transit | GTFS feeds per agency | per agency, mostly open | I21 |
| Physiology | PhysioNet | per dataset | §7 candidates |
| Everything factual | Wikidata (CC0), World Bank (CC BY 4.0), Our World in Data (CC BY) | as stated | §5 §6 |

---

## 8. Deliberately not used

Image models (₹0 per reel is a rule and the credibility moat — *"the real algorithm, actually run,
not drawn"*), Kling or any generative video, After Effects (installed, never touched by a reel;
keeping every frame in code is what makes a reel reproducible from a clean checkout), stock
animation packs, AI narration.

---

## 9. Decision matrix — object on screen → first tool

| The payoff frame shows… | Reach for | Have it today? |
|:--|:--|:--|
| a map with geometry on it | own projection code + Natural Earth | yes |
| real streets | OSM graph + own renderer | yes |
| a place from the air | Cesium technique or Google Earth Studio | no — copy from the vendored skill |
| an apparatus, a mechanism in 2D | Manim layer or plain SVG in Remotion | yes |
| a planet, a satellite, a globe | `@remotion/three` + NASA texture | no — one `npx remotion add` |
| an organ, a body | Z-Anatomy → glTF → `@remotion/three`, or Blender → PNG layer | no — Blender not installed |
| a chart | Manim / matplotlib beside the object, never alone | yes |
| a photograph or footage | your phone | yes |

---

## Sources checked on 2026-09-10

- Z-Anatomy licence and scope: [CG Channel](https://www.cgchannel.com/2022/05/check-out-amazing-free-3d-anatomy-reference-z-anatomy/), [Blender Conference 2022](https://conference.blender.org/2022/presentations/1365/), [GitHub Z-Anatomy/Models-of-human-anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy), [AnatomyTOOL on its BodyParts3D origin](https://anatomytool.org/open3dmodel-about)
- BodyParts3D licence and download: [README](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html), [download page](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)
- MakeHuman CC0 export exception: [licence explanation](http://www.makehumancommunity.org/content/license_explanation.html), [licence](http://www.makehumancommunity.org/content/license.html)
- Google Earth Studio terms: [FAQ](https://www.google.com/earth/studio/faq/), [Geo guidelines](https://about.google/brand-resource-center/products-and-services/geo-guidelines/), [monetised YouTube thread](https://groups.google.com/g/earthstudio-discuss/c/HCbGuv_Kqfk)
- OpenSky terms: [General Terms of Use & Data License Agreement](https://opensky-network.org/about/terms-of-use), [API docs](https://openskynetwork.github.io/opensky-api/)
- TheBrainMaze: [Instagram reels](https://www.instagram.com/thebrainmaze/reels/?hl=en), [TikTok](https://www.tiktok.com/@thebrainmaze?lang=en)
- Remotion 3D and maps: the vendored skills in `.agents/skills/remotion-markup/3d.md` and `.agents/skills/remotion-maps/`
- Fern: [Plugged In review](https://www.pluggedin.com/youtube-reviews/fern/) — a 2020 documentary channel by three amateur filmmakers, 3D reenactments, 4M+ subscribers; its exact toolchain is not published. The Google Earth Studio + After Effects workflow attributed to the Johnny Harris style comes from the tutorial ecosystem ([Skillshare](https://www.skillshare.com/en/classes/create-documentary-style-map-animation-with-google-earth-studio-and-adobe-after-effects/1671406834)), not from Harris.
