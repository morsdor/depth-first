# Glass probe — can this renderer carry `I93`'s "amazing visuals"?

**Not a reel.** No backlog id, no reel number, no log entries. It is the smoke test for one question,
asked at Stage 3 of `I93` because the answer decides what the G4 script may promise: can
`@remotion/three` render a convincing glass of water with an ice cube in it, with the amber level ring
at the waterline, in this cloud container's headless renderer, at a cost a ~58 s reel can afford?

Composition id `glass-probe` (6 s, 1080x1920). Source: `remotion/src/reels/GlassProbe.tsx`.
Contact sheet: `glass_probe_sheet.png` — frames 10, 100, 170: the cube whole, the cube half melted with
the space it took up outlined, the cube gone and only that space left. **The ring does not move.**

```bash
cd remotion
npx remotion still glass-probe /tmp/x.png --frame=100 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Findings (2026-10-13, measured on this probe)

**WORKS**
- **Refractive glass.** A lathe tumbler with `MeshPhysicalMaterial` transmission bends the bokeh behind it, throws rim
  and edge highlights, and reads as glass at a glance. `RoomEnvironment` through `PMREMGenerator` gives it reflections
  with no file and no network.
- **The mechanism beat.** The submerged volume drawn as a cyan outline (the space the ice takes up) stays after the cube
  is gone; `melt_check.py` asserts the meltwater equals that volume. This is the picture the sentence needs.
- **The ring is legible edge-on** with the camera at the waterline (`camera.y` = water height). The ring is the one amber
  element and it never moves in the floating glass.
- **Cost.** 30 consecutive frames at 1080x1920 took **63 s including the bundle, about 1.7 s per frame** on this container's
  4 vCPUs with software GL (`angle`). A 58 s reel is ~1,740 frames, so this scene alone is **~50 minutes in the cloud**; a
  reel with the globe and a house on top will be more. **Do the real render on the Mac.**

**DOES NOT WORK (and why the probe is built the way it is)**
- **Nested transmissive objects.** A transmissive water body inside a transmissive glass, with a transmissive ice cube inside
  that, produced a dark floating rectangle and a sail-shaped glitch at the base. Transmissive objects cannot see each other in
  the transmission texture and they fight over the depth buffer (the water's front face hid everything behind it). **Fix:
  refraction on the glass only; the water and ice are BLENDED volumes drawn after it** (`transparent`, `depthWrite={false}`,
  `renderOrder`). The cost is that the ice does not refract through the water — nobody will notice.
- **`material.envMapIntensity` does nothing for `scene.environment`** in this three.js (it only applies to a material's own
  `envMap`; use `scene.environmentIntensity`). A standard-material table washed pale grey whatever colour it was given. The
  table is now a self-lit `MeshBasicMaterial`, `toneMapped={false}`.
- **`LatheGeometry` leaves a visible seam** (duplicated vertices, different UVs and normals) — a vertical line down the glass and a
  floor split in two shades. `deleteAttribute('uv'|'normal')` -> `mergeVertices` -> `computeVertexNormals`.
- **A tone-mapped flat plane is darker than an un-tone-mapped background** — the horizon showed as a hard band. Both are
  `toneMapped={false}` and the colours are matched at the horizon.

**NOT TRIED, and where the next step would go**
- **Caustics** (the bright refracted pattern on the table) and **condensation** on the glass: both are cheap textures, neither
  is in the probe.
- **A raymarched glass** (one fullscreen shader, correct nested refraction and total internal reflection) would look better
  and cost far more per frame; on this container's CPU renderer it is minutes per frame. **Only worth trying on the Mac's GPU,
  and only if the owner wants more than this.**
- **A phone.** Nothing here has been seen on a phone; the ring and the outline are thin and the first thing to check.

**LOOK.** Stylised and clean, not photographic. Good enough that the sentence is *legible* and the glass reads as a real
object; it is not a path-traced product shot, and it does not claim to be.
