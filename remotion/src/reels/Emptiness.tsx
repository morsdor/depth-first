import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import {
  FPS,
  Fade,
  Progress,
  REEL_H,
  REEL_W,
  ReelGround,
  ease,
  fmt,
  t,
  useBreath,
} from './lib/chrome';
import {
  AU_KM,
  BIGGEST,
  GAP,
  LADDER,
  NEIGHBOURS,
} from './data/emptiness';

/**
 * r009 · I70 — the biggest star in the universe is a speck.
 *
 * First 3D reel in the repo, and the first built on a topic that did not come
 * from content_backlog.md (the id was appended afterwards, so the logs resolve).
 *
 * ── The spine ───────────────────────────────────────────────────────────────
 * Every cosmic-scale video does SIZES and ends on "and this one is even bigger".
 * Sizes saturate: the five largest stars ever measured, found across two
 * galaxies, are all within 8.7% of each other. Distances do not saturate. So the
 * ladder BREAKS in the middle, and the break is the rung the genre skips.
 *
 * emit_ts.py asserts that break as a claim — `GAP.fits > LADDER[3].step` — and
 * refuses to write the data module if it ever stops being true.
 *
 * ── Why the camera never actually moves ─────────────────────────────────────
 * The reel spans ~14 orders of magnitude, from Earth's 6,371 km to the galaxy's
 * 9.5e17. A float32 depth buffer falls apart after about 7, so a scene that
 * really contained both would z-fight into noise long before the payoff.
 *
 * Nothing here is ever scaled or flown through. Instead ONE number moves —
 * `viewKm`, the height of the world the camera can see, log-interpolated across
 * the beats — and every object is placed at `km / viewKm * WORLD_H`. World
 * coordinates therefore stay O(1) at every rung, the depth buffer is never
 * stressed, and "zooming out" is a re-basing rather than a translation.
 *
 * Each beat also gets its OWN group with its own local origin (ladder / five /
 * gap / neighbourhood / galaxy), cross-faded on the shared `viewKm`. That is
 * what keeps a 4.2-light-year gap and a 6,371 km planet from having to agree on
 * a coordinate system.
 *
 * ── Why no colour in here is a taste decision ───────────────────────────────
 * Star colours arrive from the data module as computed `rgb()` strings: Planck's
 * law at each star's published effective temperature, integrated against the CIE
 * 1931 colour matching functions, XYZ -> sRGB (scale_ladder.py). Sirius comes out
 * blue-white because it is 9,940 K. The nebula is `HALPHA`, the sRGB of the
 * 656.28 nm line that makes emission nebulae red. brand:check bans hex literals
 * outside brand/ but accepts computed rgb(), which is exactly what a physical
 * ramp emits — so the honest path and the legal path are the same one.
 *
 * ── What is decoration, stated plainly ──────────────────────────────────────
 * GALAXY and NEBULA are seeded procedural point clouds, NOT measurements, and no
 * number on screen is derived from either. The one real quantity in the galaxy
 * rung is WIDE.sunR0Ly (GRAVITY Collaboration 2019), which the Sun marker is
 * pinned to. Everything else on screen came out of scale_ladder.py.
 */
export const DURATION_SECONDS = 40;

/** The instant the giant is gone. The hook promises this second, so it is a contract. */
const VANISH = 31.0;

/**
 * Beat boundaries, seconds. Non-negotiable 5 — read -> animate -> HOLD, ~6.5 s
 * an idea.
 *
 * ── v2, after the Gate 3 read ───────────────────────────────────────────────
 * The 53 s cut ran nine beats and the verdict was "I had a hard time
 * understanding what it had to convey. We don't know what we are comparing
 * against." Three structural changes, all of them cuts:
 *
 * 1. The HOOK opens on the giant itself, not on Earth. v1 promised "the biggest
 *    star ever measured" over a frame showing a planet, and the promised object
 *    did not arrive for 8.7 s — the same defect as r008's dead label, one step
 *    worse. The star is now on screen from frame 1 to VANISH, which is also the
 *    first time this reel actually satisfies non-negotiable 6.
 * 2. The ladder is CUT to at 5.0 s and climbed back, so the sizes beats are a
 *    flashback that pays off rather than a slideshow that eventually arrives.
 * 3. `hood`, `nebula` and `galaxy` are GONE. They opened three new scales after
 *    the payoff had already landed, in three more units, and they are the rungs
 *    the motion audit already blamed for the 31%. The code stays in git; the
 *    subject ("how empty is empty") is a reel of its own.
 */
const B = {
  /* The hook is 3.8 s and not 5.0. Measured at 240 px, a single shrinking disc
     carries about two seconds and then goes quiet whatever it does — the change
     it makes is an annulus, which scales with its radius, so the beat dies
     exactly as the star gets small. Five seconds of it read 0.27 median / 20%
     density with a 2.00 s dead spell; text arrivals are the only large-area
     events an almost-empty frame has, so the beat is shortened to the length its
     three arrivals can actually fill. */
  hook: [0.0, 3.8],
  earth: [3.8, 7.8],
  sun: [7.8, 11.3],
  giant: [11.3, 17.0],
  orbits: [17.0, 20.2],
  saturate: [21.2, 25.8],
  /* The tail was 5.5 s of near-empty gap after the payoff landed, and the audit
     read 31.8-34.05 as dead: the line is a 13 px rule across the frame, so
     neither the zoom nor the drain changes enough area to register. Text
     arrivals are the only large-area events available on an empty frame, so the
     tail is shorter and every line of it lands on its own beat. */
  break_: [25.8, 34.8],
  close: [34.8, DURATION_SECONDS],
} as const;

// ── the camera, and the one number that moves ───────────────────────────────
const FOV = 40;
const CAM_Z = 10;
/** World units visible vertically at z=0. Everything below is in these units. */
const WORLD_H = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180);

/**
 * The layout budget, in composition pixels, inside the 270-1540 safe band:
 *   title 300-480 · STAGE 520-1140 · names 1090 · ruler 1160-1270 ·
 *   caption 1300-1450 · countdown 1462
 * So the stage is 620 px tall centred on y=830, and every VIEW keyframe below is
 * chosen to keep its hero object inside that. The first cut had no budget: the
 * giant filled the frame corner to corner and the caption was unreadable on top
 * of it.
 */
const STAGE_CY_PX = 830;
const STAGE_H_PX = 620;
/** Shift of the whole 3D stage, so the frame centre is not the stage centre. */
const STAGE_Y = ((960 - STAGE_CY_PX) / 1920) * WORLD_H;
/** Largest fraction of viewKm a hero object may occupy. */
const HERO = (STAGE_H_PX / 1920) * 0.95;

/**
 * Seconds -> how many km fit across the frame vertically. Log-interpolated, so a
 * constant rate here is a constant *rate of zoom*, which is what reads as smooth
 * over fourteen orders of magnitude.
 *
 * Every hero keyframe is now sized so the body is ~215 px in RADIUS, i.e. its
 * bottom edge lands at y=1045 — clear of the name row at 1090. In v1 a hero
 * filled 0.30 of the view and its bottom edge sat at 1115, which is why there
 * was nowhere to put a label on the body and the labels ended up in a caption
 * slot 470 px away from the thing they named.
 */
const VIEW: [number, number][] = [
  /* The cold open. v1 started on Earth at 4.3e4 while the title promised a star
     — the promise and the picture were about different objects. */
  /* A REAL pull, and DENSE. `ease` takes the rate to zero at every keyframe, so
     three widely-spaced ones gave a fast-slow-fast-slow crawl that read as three
     separate dead spells. Ten geometric steps at 0.42 s make it constant-rate in
     log space, which is what reads as one continuous recede. */
  [0.0, 7.4e9], // the giant, at the top of its stage budget
  [0.42, 8.22e9],
  [0.84, 9.13e9],
  [1.26, 1.013e10],
  [1.68, 1.125e10],
  [2.1, 1.25e10],
  [2.52, 1.388e10],
  [2.94, 1.541e10],
  [3.36, 1.712e10],
  [3.78, 1.9e10], // ...a third of the size it started, with 27 s still to run
  /* A CUT, not a pull: 1.9e10 -> 5.7e4 is 330,000x and no zoom rate survives it.
     The backdrop does not re-base with viewKm, so it carries across the cut and
     stops it reading as a jump — which is the job it was built for. */
  [3.8, 5.7e4], // Earth
  [5.6, 6.3e5], // Jupiter arrives beside it, and Earth STAYS
  [7.8, 6.9e5], // the pair holds, still pulling
  [9.4, 6.3e6], // the Sun, and Jupiter stays
  [11.3, 6.9e6], // ...and is HELD. the pull starts after the hold, not during it
  /* The pull has to clear 5.9e9 before the giant is allowed on screen at all
     (see the visibility ceiling), so it is admitted at 13.1 — just before its
     title, and while the Sun is still a labelled point beside it. */
  [13.1, 6.6e9],
  [14.4, 9.6e9], // the giant, x1,540, bigger than the hook left it
  /* The hold keeps pulling, and DENSELY — 9.6e9 -> 1.01e10 over 2.6 s is a 1.05x
     crawl, and the audit read 15.0-16.75 as dead: the title had landed, the
     ruler had landed, and the orbit rings were still a second away. */
  [15.3, 1.055e10],
  [16.2, 1.16e10],
  [17.0, 1.25e10],
  [18.6, 1.3e10],
  [20.2, 1.35e10], // out past Saturn's orbit — the giant clears Jupiter's ring
  /* The five-in-a-row must be AT this scale before the beat opens, not arriving
     at it: the first cut faded them in while the zoom was three keyframes away
     and the outer two were clipped off both edges. */
  [21.2, 2.45e10],
  [25.8, 2.7e10],
  [VANISH, 8.4e13], // the gap, end to end. the giant is now 0.05 px.
  /* The close STAYS on the gap. v1 pulled out to the neighbourhood, the Orion
     Nebula and the galaxy here — three new scales opened after the payoff had
     landed, and the three rungs the motion audit blamed for the 31%. */
  [34.8, 9.6e13],
  [DURATION_SECONDS, 1.15e14],
];

/**
 * A budget nobody checks is a comment. Each hero object is measured against the
 * keyframe where it is the subject; if a VIEW number is ever edited so that the
 * subject outgrows the stage and starts sitting on the caption, the composition
 * fails to load rather than rendering something unreadable.
 */
for (const [name, diamKm, atViewKm] of [
  ['Earth', 2 * LADDER[0].radiusKm, 5.7e4],
  ['Jupiter', 2 * LADDER[1].radiusKm, 6.3e5],
  ['the Sun', 2 * LADDER[2].radiusKm, 6.3e6],
  ['the giant', 2 * LADDER[3].radiusKm, 7.4e9], // its tightest keyframe, the hook
  ["Saturn's orbit", 2 * 9.583 * AU_KM, 1.35e10],
] as [string, number, number][]) {
  if (diamKm / atViewKm > HERO) {
    throw new Error(
      `r009 layout budget: ${name} is ${((diamKm / atViewKm) * 100).toFixed(1)}% of the ` +
        `view at its own keyframe, over the ${(HERO * 100).toFixed(1)}% stage allowance.`,
    );
  }
}

// ── world -> composition pixels ─────────────────────────────────────────────
/**
 * Bodies sit at z=0 and the camera at z=CAM_Z, so WORLD_H world units span
 * exactly 1920 px. That makes a DOM label over a 3D body two lines of algebra
 * rather than a projection matrix — which is what made it cheap enough to put a
 * name on every sphere, the thing the Gate 3 read actually asked for.
 */
const PX_PER_WORLD = REEL_H / WORLD_H;
const pxX = (wx: number) => REEL_W / 2 + wx * PX_PER_WORLD;

/** Horizontal spacing between ladder rungs, as a fraction of viewKm. */
const RUNG_GAP = 0.19;
/** The row every body name sits on, under the stage and above the ruler. */
const LABEL_Y = 1090;

/**
 * Which rung the frame is sitting on, as a continuous number. This replaces a
 * camera: bodies are laid out RELATIVE to the current rung rather than at fixed
 * coordinates, so the frame never flies past absolute positions it can no longer
 * resolve. Shared by the 3D group and the DOM labels, so the two cannot disagree
 * about where a body is.
 */
const useRung = () => {
  const s = useCurrentFrame() / FPS;
  /* Earth HOLDS centred from the cut to 4.7 — the extra stop is the beat the
     new frame gets to itself. Without it Earth started sliding left the instant
     it arrived, toward a Jupiter that is not admitted until ~5.0. */
  return interpolate(s, [0, 3.78, 3.8, 4.7, 5.6, 9.4, 11.3, 13.1], [3, 3, 0, 0, 1, 2, 2, 3], ease);
};

/**
 * How legible a rung is at the current view — also shared, for the same reason.
 *
 * The CEILING is the important number and the first cut had it at -0.10, i.e.
 * radius up to 0.79 of viewKm: a sphere 1.6x the height of the frame. A body
 * faded IN at that size fills the picture, and a lit one blows out — frames
 * 79-100 of the first render averaged 180/255 and read as a white flash.
 */
const rungWindow = (radiusKm: number, viewKm: number) =>
  interpolate(Math.log10(radiusKm / viewKm), [-5.0, -4.4, -0.74, -0.58], [0, 1, 1, 0], ease);

/**
 * A retiring rung fades out at the page margin instead of sliding off the edge.
 * Measured on the mp4: Earth's halo reached x=6 at 7.5 s and its name crossed
 * x=60 at 7.0 s, both while it was mid-retirement between the Jupiter and Sun
 * beats. The window closes at 150 px so even the widest name ("JUPITER", 165 px
 * at the 36 px type floor) is invisible before its box can cross the margin.
 */
const edgeFade = (xPx: number) => {
  const clamp = { ...ease, extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  return Math.min(
    interpolate(xPx, [90, 190], [0, 1], clamp),
    interpolate(xPx, [REEL_W - 190, REEL_W - 90], [1, 0], clamp),
  );
};

const useViewKm = () => {
  const frame = useCurrentFrame();
  return Math.exp(
    interpolate(
      frame / FPS,
      VIEW.map((v) => v[0]),
      VIEW.map((v) => Math.log(v[1])),
      ease,
    ),
  );
};

/** Fade a group in and out on seconds, with a 0.6 s cross. */
const useBeat = (from: number, to: number, cross = 0.6) => {
  const s = useCurrentFrame() / FPS;
  return interpolate(
    s,
    [from - cross, from, to, to + cross],
    [0, 1, 1, 0],
    { ...ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
};

/**
 * The stellar disc, with limb darkening.
 *
 * Drawn as a billboarded sprite rather than a sphere on purpose: a star is only
 * ever seen as a disc, and a UV-mapped sphere cannot limb-darken toward the edge
 * you are actually looking at. The first cut used a sphere with a flat basic
 * material and WOH G64 came out as a plain orange circle — the texture below is
 * what makes it read as a body with an edge.
 */
const useDisc = () =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0.0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.5, 'rgba(252,252,252,1)');
    grd.addColorStop(0.78, 'rgba(236,236,236,1)');
    grd.addColorStop(0.92, 'rgba(202,202,202,1)');
    grd.addColorStop(0.975, 'rgba(170,170,170,0.98)');
    grd.addColorStop(1.0, 'rgba(150,150,150,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

/**
 * Stefan-Boltzmann, applied. Emitted power per unit area goes as T^4, so a
 * 3,400 K supergiant's surface is ~12% as bright as the Sun's — which is why a
 * red supergiant is DEEP amber and not the pale peach that normalised colour
 * alone produces. Gamma-compressed for display, the same thing any astrophoto
 * does, and clamped so a hot star does not blow out to white.
 */
const shade = (rgb: string, flux: number | null) =>
  new THREE.Color(rgb).multiplyScalar(
    flux === null ? 1 : Math.min(1, Math.max(0.30, Math.pow(flux, 1 / 2.2))),
  );

/**
 * A soft round dot for point clouds. Without a map, THREE renders every point as
 * a hard SQUARE — at nebula sizes that read as red confetti rather than gas.
 */
const useDot = () =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0.0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.42)');
    grd.addColorStop(0.75, 'rgba(255,255,255,0.08)');
    grd.addColorStop(1.0, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

/** A soft additive halo, so a star is a light source and not a flat disc. */
const useGlow = () =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0.0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.10, 'rgba(255,255,255,0.92)');
    grd.addColorStop(0.22, 'rgba(255,255,255,0.46)');
    grd.addColorStop(0.38, 'rgba(255,255,255,0.17)');
    grd.addColorStop(0.62, 'rgba(255,255,255,0.05)');
    grd.addColorStop(1.0, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

/**
 * A self-luminous body: the disc, plus a halo.
 *
 * The DISC is always at true scale — that is the whole claim of the reel and it
 * is never fudged. The HALO has a floor (`minHalo`), so a star whose disc has
 * shrunk below a pixel still reads as a point of light instead of disappearing
 * silently. That is not a cheat: a real star IS a sub-pixel disc wearing a glow
 * far larger than itself, which is exactly why you can see one at night. Without
 * the floor the Sun would vanish the instant WOH G64 arrives beside it and the
 * comparison the beat exists for would go with it.
 */
const Star: React.FC<{
  x: number;
  y: number;
  r: number;
  color: string;
  opacity: number;
  halo?: number;
  minHalo?: number;
  flux?: number | null;
}> = ({ x, y, r, color, opacity, halo = 4.6, minHalo = 0, flux = null }) => {
  const glow = useGlow();
  const disc = useDisc();
  const tint = useMemo(() => shade(color, flux), [color, flux]);
  if (r < 0 || opacity <= 0.002) return null;
  const h = Math.max(r * halo, minHalo);
  return (
    <group position={[x, y, 0]}>
      <sprite scale={[h, h, 1]}>
        <spriteMaterial
          map={glow}
          color={tint}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {r > 0.0015 ? (
        <sprite scale={[r * 2, r * 2, 1]}>
          <spriteMaterial map={disc} color={tint} transparent opacity={opacity} depthWrite={false} />
        </sprite>
      ) : null}
    </group>
  );
};

/** A reflective body — lit, so it has a terminator and reads as a planet. */
const Planet: React.FC<{
  x: number;
  y: number;
  r: number;
  color: string;
  opacity: number;
}> = ({ x, y, r, color, opacity }) => {
  const frame = useCurrentFrame();
  if (r <= 0 || opacity <= 0.002) return null;
  return (
    <mesh position={[x, y, 0]} rotation={[0, (frame / FPS) * 0.28, 0.41]}>
      <sphereGeometry args={[r, 64, 40]} />
      <meshStandardMaterial color={color} roughness={1} metalness={0} transparent opacity={opacity} />
    </mesh>
  );
};

const Cloud: React.FC<{
  pts: [number, number, number][];
  scale: number;
  size: number;
  color: string;
  opacity: number;
  spin?: number;
  tilt?: number;
}> = ({ pts, scale, size, color, opacity, spin = 0, tilt = 1.12 }) => {
  const dot = useDot();
  const arr = useMemo(() => {
    const f = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      f[i * 3] = p[0];
      f[i * 3 + 1] = p[1];
      f[i * 3 + 2] = p[2];
    });
    return f;
  }, [pts]);
  if (opacity <= 0.002 || size <= 0) return null;
  return (
    <points scale={[scale, scale, scale]} rotation={[tilt, 0, spin]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[arr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={dot}
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/**
 * The backdrop. Present at every rung, very slowly rotating — this is what stops
 * a re-base reading as a cut, and it is the only thing on screen during the long
 * pull of the break beat (non-negotiable 4: nothing is ever perfectly still).
 */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const pts = useMemo<[number, number, number][]>(() => {
    // mulberry32 — deterministic, so every render is identical
    let a = 0x6d2b79f5;
    const rnd = () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    return Array.from({ length: 900 }, () => {
      const th = rnd() * Math.PI * 2;
      const ph = Math.acos(rnd() * 2 - 1);
      const r = 26 + rnd() * 10;
      return [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)];
    });
  }, []);
  return (
    <Cloud
      pts={pts}
      scale={1}
      size={0.055}
      color="rgb(196, 214, 240)"
      opacity={0.5}
      spin={(frame / FPS) * 0.032}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Beat groups. Each owns its local origin; all share viewKm.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The ladder — Earth, Jupiter, the Sun, the giant — bottoms on a common baseline
 * and laid out left to right at their MEASURED radii.
 *
 * The rule the Gate 3 read forced: A RUNG DOES NOT LEAVE UNTIL THE NEXT ONE IS
 * AT FULL SIZE. Earth stays while Jupiter grows, Jupiter stays while the Sun
 * grows, and the Sun stays — labelled — through the whole giant beat. A
 * comparison needs both of its terms in the frame at once, and v1 had the giant
 * arriving beside an unlabelled 0.2 px dot.
 */
const LadderGroup: React.FC<{ viewKm: number }> = ({ viewKm }) => {
  const s = useCurrentFrame() / FPS;
  const o = useBeat(B.hook[0] - 1, B.orbits[1]);
  const rung = useRung();
  const u = (km: number) => (km / viewKm) * WORLD_H;

  if (o <= 0.002) return null;
  return (
    <group>
      {LADDER.map((b, i) => {
        /* A body is drawn only while its true size is legible against the
           current view. Above the ceiling it would be a wall across the frame —
           the giant at Sun-zoom is 1,540x the whole picture — and far below the
           floor it is not even a glow. THIS is the re-basing: a rung exists
           while it is at a showable scale and not one frame longer. */
        const win = rungWindow(b.radiusKm, viewKm) * o * edgeFade(pxX((i - rung) * RUNG_GAP * WORLD_H));
        if (win <= 0.002) return null;
        /* Spacing is view-relative, so neighbours stay on screen at every zoom.
           0.19 and not 0.30: the frame is PORTRAIT, so half its width is only
           0.28 of viewKm — at 0.30 the Sun sat just outside the left edge
           exactly when "1,540 times the width of the Sun" was on screen, which
           is the one moment it has to be visible. */
        const x = u((i - rung) * RUNG_GAP * viewKm);
        const r = u(b.radiusKm);
        const common = { x, y: 0, r, opacity: win };
        return b.rgb ? (
          <Star
            key={b.name}
            {...common}
            color={b.rgb}
            flux={b.flux}
            /* The giant's corona breathes. Rule 4's blind spot, stated in
               CLAUDE.md, is that "a slow push changes pixels without anything
               HAPPENING" — and the inverse bites here: a shrinking disc only
               ever changes a thin annulus, so the hook scored 0.23 against a
               0.35 floor even while the star was visibly going. The halo is
               ~2.3x the disc and covers most of the frame, so modulating IT is
               the cheapest large-area motion available — worth about 0.15 here,
               as it turned out, so the beat had to be shortened as well. WOH G64
               is a pulsating
               red supergiant, so this is at least the right gesture — but it is
               a breath, not a measurement, and nothing on screen reads off it.
               The PERIOD matters as much as the amplitude: at 2.6 s the pulse
               stalls at its turning points for long enough that the audit found
               a 2.00 s dead spell sitting on one of them. */
            halo={i === 3 ? 2.3 + 0.55 * Math.sin((2 * Math.PI * s) / 1.7 + 1.1) : 4.6}
            minHalo={0.095}
          />
        ) : (
          <Planet key={b.name} {...common} color={i === 0 ? '#00D6F7' : '#FFB020'} />
        );
      })}
      <Orbits viewKm={viewKm} cx={u((3 - rung) * RUNG_GAP * viewKm)} />
    </group>
  );
};

/**
 * B3 — real orbital radii drawn round the giant's seat: does it swallow them?
 *
 * The orbital PLANE tilts back and forth on a 7 s cycle. A ring spun about its
 * own axis is visually motionless, so the first cut of this beat scored 15% on
 * event density with a 3.25 s dead spell — the tilt is what actually moves a
 * large area of the frame. The planet markers ride at their real relative
 * periods (1, 11.862, 29.457 years), so Saturn barely creeps while Earth laps it.
 */
const Orbits: React.FC<{ viewKm: number; cx: number }> = ({ viewKm, cx }) => {
  const s = useCurrentFrame() / FPS;
  const u = (km: number) => (km / viewKm) * WORLD_H;
  const rings: [string, number, number][] = [
    ['Saturn', 9.583, 29.457],
    ['Jupiter', 5.204, 11.862],
    ['Earth', 1.0, 1.0],
  ];
  /* Tilt only. A yaw term was tried and removed: euler XYZ applies it AFTER the
     tilt, which swings an already-tipped ring edge-on to the camera and made all
     three disappear for most of the beat. Rotating a circle about its own normal
     is invisible anyway — the tilt is the only rotation that does anything. */
  const tilt = 0.62 + 0.30 * Math.sin((2 * Math.PI * s) / 7);
  return (
    <group position={[cx, 0, 0]} rotation={[tilt, 0, 0]}>
      {rings.map(([name, au, periodYr], i) => {
        /* The orbits are DRAWN OUTWARD from the star's seat rather than fading in
           on the spot. Three circles sweeping open is large-area motion; three
           circles appearing is not, and this beat scored 15% with a 3.25 s dead
           spell when it was the latter.
           An earlier attempt grew the STAR from the Sun's radius instead — that
           worked on the audit and was wrong on the screen, because the giant
           snapped from full size down to Sun size the instant the beat opened. */
        const at = B.orbits[0] - 0.6 + i * 0.55;
        const a = interpolate(s, [at, at + 0.5], [0, 1], ease);
        const r = u(au * AU_KM) * interpolate(s, [at, at + 1.5], [0, 1], ease);
        if (a <= 0.002 || r <= 0.004) return null;
        const th = (2 * Math.PI * (s - B.orbits[0]) * 1.5) / periodYr;
        return (
          <group key={name}>
            <mesh position={[0, 0, -0.01]}>
              {/* thickness in WORLD units, not a fraction of r: at r*0.997 the
                  ring was 0.9 px wide and never rendered at any zoom */}
              <ringGeometry args={[Math.max(r - 0.014, r * 0.55), r, 260]} />
              <meshBasicMaterial
                color={name === 'Jupiter' ? '#FFB020' : '#81A2C4'}
                transparent
                /* a ring flares as it completes, so each arrival is an event */
                opacity={
                  a *
                  (name === 'Jupiter' ? 0.95 : 0.45) *
                  (1 +
                    1.8 *
                      Math.max(
                        0,
                        Math.sin(Math.PI * interpolate(s, [at + 0.9, at + 2.1], [0, 1], ease)),
                      ))
                }
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[r * Math.cos(th), r * Math.sin(th), 0]}>
              <circleGeometry args={[0.055, 28]} />
              {/* bone, not amber: the amber Jupiter RING is already this frame's
                  one amber element and the brand guide allows exactly one */}
              <meshBasicMaterial color="#E8E6E1" transparent opacity={a} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** B4 — the five largest ever measured, in a row, at their measured radii. */
const FiveGroup: React.FC<{ viewKm: number }> = ({ viewKm }) => {
  const s = useCurrentFrame() / FPS;
  const o = useBeat(B.saturate[0], B.saturate[1]);
  const u = (km: number) => (km / viewKm) * WORLD_H;
  if (o <= 0.002) return null;
  const pitch = 2.3 * BIGGEST[0].rSun * 695700;
  // the whole row rocks on a long period — a static line of five discs read as
  // a freeze frame and scored 17% with a 2.75 s dead spell
  return (
    <group>
      {BIGGEST.map((b, i) => {
        const at = B.saturate[0] + 0.15 + i * 0.28;
        const a = interpolate(s, [at, at + 0.5], [0, 1], ease) * o;
        /* a travelling wave, phase-shifted per star: five discs rocking together
           barely move any area (17%, 1.25 s dead), five moving against each
           other read as five separate objects, which is also the beat's point */
        const bob =
          0.17 * Math.sin((2 * Math.PI * (s - B.saturate[0])) / 4.4 - i * 0.85) * o;
        return (
          <Star
            key={b.name}
            x={u((i - 2) * pitch)}
            y={bob}
            r={u(b.rSun * 695700)}
            color={b.rgb}
            flux={b.flux}
            opacity={a}
            halo={2.2}
            minHalo={0.05}
          />
        );
      })}
    </group>
  );
};

/**
 * The payoff. The Sun and the next star along at the real 4.2465 ly apart, the
 * giant at the midpoint at its real diameter, and a sweep that lays giant-
 * diameters end to end across the gap while the counter runs. The sweep is
 * deliberately a full-width moving mass: r006's route-draw beat scored 16% on
 * event density because a growing thin line is worth almost nothing to the audit.
 *
 * It now runs to the end of the reel rather than handing off to a wider rung,
 * and the accent fill DRAINS back to dark under the close — "space isn't big,
 * space is empty" over a line emptying is the message and the large-area motion
 * in the same gesture, which is what the galaxy rung was failing to provide.
 */
const GapGroup: React.FC<{ viewKm: number }> = ({ viewKm }) => {
  const s = useCurrentFrame() / FPS;
  const o = useBeat(B.break_[0], DURATION_SECONDS + 1);
  const u = (km: number) => (km / viewKm) * WORLD_H;
  if (o <= 0.002) return null;

  const half = u(GAP.km / 2);
  const sweep = interpolate(
    s,
    [B.break_[0] + 1.0, VANISH, B.close[0] + 0.6, B.close[0] + 4.4],
    [0, 1, 1, 0],
    ease,
  );
  const giantR = u(GAP.biggestDiamKm / 2);

  return (
    <group>
      {/* the gap itself */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[half * 2, 0.012]} />
        <meshBasicMaterial color="#274064" transparent opacity={o} />
      </mesh>
      {/* the sweep: how much of the gap the tally has covered */}
      <mesh position={[-half + half * sweep, 0, -0.01]}>
        <planeGeometry args={[Math.max(1e-5, half * 2 * sweep), 0.05]} />
        <meshBasicMaterial color="#00D6F7" transparent opacity={o * 0.55} />
      </mesh>
      {/* the leading edge, a bright moving mark. Gated on the clock and not on
          `sweep`, or it reappears when the fill drains under the close. */}
      {s < VANISH + 0.3 ? (
        <mesh position={[-half + half * 2 * sweep, 0, 0]}>
          <planeGeometry args={[0.035, 0.5]} />
          <meshBasicMaterial
            color="#00D6F7"
            transparent
            opacity={o * interpolate(sweep, [0.93, 1.0], [1, 0], ease)}
          />
        </mesh>
      ) : null}
      <Star x={-half} y={0} r={u(GAP.sunDiamKm / 2)} color={LADDER[2].rgb!} opacity={o} minHalo={0.075} />
      <Star
        x={half}
        y={0}
        r={0}
        color={NEIGHBOURS[0].rgb}
        flux={NEIGHBOURS[0].flux}
        opacity={o}
        minHalo={0.10}
      />
      {/* The giant, at true scale, on its way to nothing.
          The DISC is never fudged — that is the claim of the reel. The HALO gets
          a floor that decays to exactly zero at VANISH, because without it the
          glow shrank with the disc and the star was already gone by ~28.5 s
          while the clock still promised 2.5 more seconds of it. A hook that
          names a second is a contract, so the light has to last until that
          second and not one frame longer. (The floor is the same device the Sun
          uses in the giant beat, and for the same reason: a real star IS a
          sub-pixel disc wearing a glow far larger than itself.) */}
      <Star
        x={0}
        y={0}
        r={giantR}
        color={BIGGEST[0].rgb}
        flux={BIGGEST[0].flux}
        opacity={o}
        halo={2.3}
        minHalo={interpolate(s, [B.break_[0], VANISH], [0.062, 0], {
          ...ease,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />
      {/* the hold after VANISH was 3.25 s of nothing; a pulse leaving the Sun and
          crossing the gap keeps it alive without adding a single new claim */}
      {(() => {
        const since = s - (B.break_[0] + 0.6);
        if (since < 0) return null;
        const f = (since % 3.4) / 3.4;
        /* ...but it stands DOWN across the vanish. At 31.0 the pulse was a 26 px
           bar sitting a third of the way along the gap, on the one frame where
           the centre has to read as empty — close enough to the middle to be
           mistaken for the star that just went. */
        const clear = interpolate(
          s,
          [VANISH - 1.2, VANISH - 0.6, VANISH + 0.8, VANISH + 1.4],
          [1, 0, 0, 1],
          ease,
        );
        return (
          <mesh position={[-half + half * 2 * f, 0, 0.01]}>
            <planeGeometry args={[0.062, 0.34]} />
            <meshBasicMaterial
              color="#00D6F7"
              transparent
              opacity={o * clear * 0.8 * Math.sin(Math.PI * f)}
            />
          </mesh>
        );
      })()}
    </group>
  );
};

const Scene: React.FC = () => {
  const viewKm = useViewKm();
  return (
    <>
      {/* 3.2 clipped the diffuse term: with `linear` there is no tone mapping, so
          Jupiter's lit face saturated to white and the planet read grey. */}
      <ambientLight intensity={0.26} />
      <directionalLight position={[4, 3, 6]} intensity={2.45} />
      <Backdrop />
      <group position={[0, STAGE_Y, 0]}>
      <LadderGroup viewKm={viewKm} />
      <FiveGroup viewKm={viewKm} />
      <GapGroup viewKm={viewKm} />
      </group>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// The page
//
// v2 division of labour, and it is the whole fix for the Gate 3 read:
//   TITLE       carries the ARGUMENT, never a name        (y 300)
//   BODY LABEL  names the object, riding on the object    (y 1080)
//   RULER       answers ONE question all reel             (y 1160)
//   CAPTION     the one fact the other three cannot hold  (y 1300)
// In v1 the titles carried names ("OUR SUN", "WOH G64"), nothing named the
// spheres, and every beat invented a new unit for its caption.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `lines` may contain '' as a SPACER, so a staggered title can drop its later
 * line into the row it will finally occupy. Two things that breaks if you do it
 * naively, both of which shipped in the first v2 render:
 *   - an empty <div> creates no line box and collapses to zero height, so the
 *     second half of the hook title landed on top of the first half;
 *   - "accent the last line" then paints the wrong line, because the last line
 *     of the FIRST half is not the last line of the title.
 */
const Title: React.FC<{
  from: number;
  to: number;
  lines: string[];
  size?: number;
  accent?: number;
}> = ({ from, to, lines, size = 68, accent }) => (
  <Fade
    from={t(from)}
    to={t(to)}
    style={{ position: 'absolute', top: 300, left: 60, width: 810 }}
  >
    {lines.map((l, i) =>
      l === '' ? (
        /* index, not the string: two '' keys would collapse into one row */
        <div key={`${i}-spacer`} style={{ height: size * 1.08 }} />
      ) : (
        <div
          key={`${i}-${l}`}
          style={{
            fontFamily: 'Archivo Black',
            fontSize: size,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            color:
              i === (accent ?? (lines.length > 1 ? lines.length - 1 : -1))
                ? '#00D6F7'
                : '#E8E6E1',
          }}
        >
          {l}
        </div>
      ),
    )}
  </Fade>
);

const Caption: React.FC<{ from: number; to: number; rows: string[]; top?: number }> = ({
  from,
  to,
  rows,
  top = 1300,
}) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top, left: 60, width: 810 }}>
    {rows.map((r, i) => (
      <div
        key={r}
        style={{
          fontFamily: i === 0 ? 'IBM Plex Sans' : 'IBM Plex Mono',
          fontWeight: i === 0 ? 600 : 400,
          fontSize: i === 0 ? 52 : 38,
          color: i === 0 ? '#E8E6E1' : '#81A2C4',
          marginTop: i === 0 ? 0 : 12,
          lineHeight: 1.25,
        }}
      >
        {r}
      </div>
    ))}
  </Fade>
);

/** The promise made at t=0 has a clock keeping it. r008: a promise that names a
 *  time needs the countdown on screen, or it is just a claim. */
const Countdown: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const o = interpolate(s, [1.5, 2.1, VANISH - 0.3, VANISH + 0.4], [0, 1, 1, 0], ease);
  if (o <= 0.002) return null;
  const left = Math.max(0, VANISH - s);
  return (
    <div
      style={{
        position: 'absolute',
        top: 1462,
        left: 60,
        width: 810,
        opacity: o,
        display: 'flex',
        alignItems: 'baseline',
        gap: 16,
      }}
    >
      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 38, color: '#81A2C4', letterSpacing: 2 }}>
        GONE IN
      </span>
      <span
        style={{
          fontFamily: 'Archivo Black',
          fontSize: 46,
          color: '#00D6F7',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {left.toFixed(1)}s
      </span>
    </div>
  );
};

/** What each rung is, in a normal person's words. Never the catalogue name —
 *  `WOH G64` ran at 92 px in v1, which is non-negotiable 6 broken as squarely
 *  as "Reed-Solomon" in a hook would break it. The designation is not on screen
 *  at all now; it is in NOTES.md with its paper, where a source belongs.
 *
 *  Kept SHORT on purpose: at 36 px (the brand type floor) "BIGGEST STAR EVER
 *  MEASURED" is 562 px wide, and centred on the giant it ran straight through
 *  "OUR SUN" sitting 365 px to its left. The hook has already said "ever
 *  measured" in 62 px type, so the body only has to say which one this is. */
const BODY_NAMES = ['EARTH', 'JUPITER', 'OUR SUN', 'THE BIGGEST STAR'];

/**
 * The Gate 3 verdict, answered: *"the sphere can also tell us what it
 * represents."*
 *
 * Titles live at y=300 and captions at y=1300; the sphere is at y=830. So in v1
 * nothing on screen ever said which circle was which, and "1,540 times wider"
 * was a claim about two unlabelled discs 470 px from the words describing them.
 *
 * These are DOM, but they read the same `rung`, `viewKm` and visibility window
 * as the 3D bodies, so a name cannot outlive, precede or drift off the thing it
 * names. A label is suppressed while its own body is big enough to sit on the
 * name row — during the pull into the giant beat, mostly — because a caption
 * printed across a lit disc is worse than none.
 */
const BodyLabels: React.FC = () => {
  const viewKm = useViewKm();
  const rung = useRung();
  /* NOT during the hook, and not one frame of lead-in either. `useBeat` crosses
     in 0.6 s EARLY, which put "OUR SUN" and "THE BIGGEST STAR" — names that
     belong to a beat ten seconds later — at 83% opacity on the hook's star, 0.1 s
     before it cut away. Two beats' worth of text in one second is what made the
     transition unreadable. These ramp AFTER the cut has landed. */
  const o = interpolate(
    useCurrentFrame() / FPS,
    [B.earth[0] + 0.1, B.earth[0] + 0.7, B.giant[1], B.giant[1] + 0.6],
    [0, 1, 1, 0],
    { ...ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (o <= 0.002) return null;
  return (
    <>
      {LADDER.map((b, i) => {
        const x = pxX((i - rung) * RUNG_GAP * WORLD_H);
        const win = rungWindow(b.radiusKm, viewKm) * o * edgeFade(x);
        const rPx = (b.radiusKm / viewKm) * REEL_H;
        if (win <= 0.01 || STAGE_CY_PX + rPx > LABEL_Y - 18) return null;
        /* A leader from the body down to its name, so a 25 px point of light at
           the left edge is unmistakably the thing being called OUR SUN. Skipped
           when the body already reaches the row on its own. */
        const leadTop = STAGE_CY_PX + rPx + 16;
        const leadH = LABEL_Y - 14 - leadTop;
        return (
          <div key={b.name} style={{ position: 'absolute', top: 0, left: x, opacity: win }}>
            {leadH > 12 ? (
              <div
                style={{
                  position: 'absolute',
                  top: leadTop,
                  left: -1,
                  width: 2,
                  height: leadH,
                  background: '#274064',
                }}
              />
            ) : null}
            <div
              style={{
                position: 'absolute',
                top: LABEL_Y,
                left: 0,
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontFamily: 'IBM Plex Mono',
                fontSize: 36,
                letterSpacing: 2,
                color: '#81A2C4',
              }}
            >
              {BODY_NAMES[i]}
            </div>
          </div>
        );
      })}
    </>
  );
};

/**
 * THE RULER — the fix for *"we don't know what we are comparing against"*.
 *
 * v1 changed yardstick eight times in nine beats: Earths, Suns, astronomical
 * units, a percentage spread, stars laid end to end, systems per light-year,
 * gaps per nebula width, percent of a galaxy. Seven units, none surviving into
 * the next beat — so when 18,749 landed, the viewer had nothing in hand to feel
 * it against, because the unit it was measured in had been invented four
 * seconds earlier and was never used again.
 *
 * This slot asks ONE question for the whole reel — how many of the last thing
 * fit across the next — and it sits exactly where the tally later lands, so by
 * the time 18,749 arrives the eye already knows what that row of the frame
 * means. The tally is then not a new object: it is this row finally breaking.
 */
const RULER_STEPS: [number, string][] = [
  [5.8, `×${LADDER[1].step!.toFixed(1)}`],
  [9.7, `×${LADDER[2].step!.toFixed(1)}`],
  [14.6, `×${fmt(LADDER[3].step!)}`],
];

const Ruler: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const o = interpolate(s, [5.5, 6.1, 25.0, 25.5], [0, 1, 1, 0], ease);
  if (o <= 0.002) return null;
  let idx = 0;
  for (let i = 0; i < RULER_STEPS.length; i++) if (s >= RULER_STEPS[i][0]) idx = i;
  /* Every arrival sweeps the rule open, so a changing number is an EVENT and not
     a quiet swap — three of them, at 5.8, 9.7 and 14.6 s. */
  const sweep = interpolate(s - RULER_STEPS[idx][0], [0, 0.45], [0, 1], {
    ...ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{ position: 'absolute', top: 1160, left: 60, width: 810, opacity: o }}>
      <div
        style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: 36,
          letterSpacing: 3,
          color: '#81A2C4',
        }}
      >
        {s >= B.saturate[0] ? 'WIDER THAN THE LAST — STILL' : 'WIDER THAN THE LAST'}
      </div>
      <div style={{ width: 810 * sweep, height: 3, background: '#00D6F7', marginTop: 8 }} />
      <div
        style={{
          fontFamily: 'Archivo Black',
          fontSize: 66,
          lineHeight: 1.05,
          letterSpacing: -2,
          color: '#00D6F7',
          fontVariantNumeric: 'tabular-nums',
          marginTop: 6,
        }}
      >
        {RULER_STEPS[idx][1]}
      </div>
    </div>
  );
};

/**
 * The two ends of the gap, and the one line that says what it is. They sit ON
 * the stage rather than in a caption slot, because the caption slot is where the
 * tally goes and two blocks fighting for it is what made v1's payoff beat
 * unreadable.
 *
 * `PROXIMA` is gone: its name is not the claim, and it costs a beat of
 * recognition at the exact moment nothing can be spared. So is `4.2465` — five
 * significant figures is a research artefact, not a script, and the measured
 * value is in NOTES.md where it belongs.
 */
const GapLabels: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const viewKm = useViewKm();
  /* NOT from the top of the beat. The gap is wider than the frame until the pull
     catches up at ~30.6, so for the first five seconds these two ticks pointed at
     ends that were off screen — a label naming something the viewer cannot see,
     which is the whole defect this rewrite exists to fix. */
  const o = interpolate(s, [30.4, 31.0, 34.0, 34.4], [0, 1, 1, 0], ease);
  /* And the span line lands AFTER the verdict, as the last thing before the
     close, so the beat never carries more than three text blocks at once. */
  const span = interpolate(s, [33.6, 34.1, 34.6, 35.0], [0, 1, 1, 0], ease);
  /* BOTH, not just the ticks. The span line outlives them by 0.6 s on purpose —
     it is the last thing before the close — and guarding on `o` alone returned
     null straight through it, leaving 34.4-35.1 as a frame with nothing in it
     but the rule. */
  if (o <= 0.002 && span <= 0.002) return null;
  const tick = {
    fontFamily: 'IBM Plex Mono',
    fontSize: 38,
    color: '#81A2C4',
    letterSpacing: 2,
    whiteSpace: 'nowrap' as const,
  };
  /* Pinned to the ends rather than to x=60 and x=1020. The frame keeps pulling
     through the hold, so a fixed tick drifts off the star it names — the same
     "label 470 px from its object" failure this rewrite exists to remove, just
     smaller. Each tick hugs its end from the INSIDE (left one left-aligned,
     right one right-aligned) rather than being centred on it: "THE NEXT STAR"
     centred on an end 80 px from the frame edge runs off the page. */
  /* half the gap, in composition px. The 3D group places its ends at
     u(GAP.km/2) world units and PX_PER_WORLD converts, which cancels to this —
     an extra /2 here put both ticks a quarter of the way in and printed
     "OUR SUNHE NEXT STAR" across the middle of the payoff. */
  const end = (GAP.km / 2 / viewKm) * REEL_H;
  const leftX = Math.max(60, REEL_W / 2 - end - 20);
  const rightX = Math.min(REEL_W - 60, REEL_W / 2 + end + 20);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1080 }}>
      <div style={{ ...tick, position: 'absolute', top: 886, left: leftX, opacity: o }}>
        OUR SUN
      </div>
      <div
        style={{
          ...tick,
          position: 'absolute',
          top: 886,
          left: 0,
          width: rightX,
          textAlign: 'right',
          opacity: o,
        }}
      >
        THE NEXT STAR
      </div>
      <div
        style={{
          position: 'absolute',
          top: 690,
          left: 60,
          width: 960,
          textAlign: 'center',
          opacity: span,
          fontFamily: 'IBM Plex Mono',
          fontSize: 40,
          color: '#00D6F7',
          letterSpacing: 1,
        }}
      >
        FOUR LIGHT-YEARS OF NOTHING
      </div>
    </div>
  );
};

/**
 * The counter is the thing the viewer carries away, so it runs big and lands
 * exactly on VANISH.
 *
 * v1 labelled it `BIGGEST STARS, LAID END TO END`, which never says *across
 * what* — the yardstick problem arriving at the worst possible moment. "That
 * star" points back at the object the viewer has been watching for 31 seconds.
 */
const Tally: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const o = interpolate(s, [B.break_[0] + 0.5, B.break_[0] + 1.2, 34.0, 34.4], [0, 1, 1, 0], ease);
  if (o <= 0.002) return null;
  const n = interpolate(s, [B.break_[0] + 1.0, VANISH], [1, GAP.fitsRounded], ease);
  return (
    <div style={{ position: 'absolute', top: 1180, left: 60, width: 810, opacity: o }}>
      {['THAT STAR, SIDE BY SIDE,', 'TO REACH THE NEXT ONE'].map((r) => (
        <div
          key={r}
          style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: '#81A2C4', letterSpacing: 3 }}
        >
          {r}
        </div>
      ))}
      <div
        style={{
          fontFamily: 'Archivo Black',
          fontSize: 132,
          color: '#00D6F7',
          letterSpacing: -3,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.05,
        }}
      >
        {fmt(Math.round(n))}
      </div>
    </div>
  );
};

export const Emptiness: React.FC = () => {
  const breath = useBreath();
  return (
    <AbsoluteFill>
      <ReelGround accent="#00D6F7" />

      <AbsoluteFill style={{ transform: breath }}>
        <ThreeCanvas
          width={1080}
          height={1920}
          linear
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.01, far: 200 }}
          gl={{ antialias: true, alpha: true }}
          style={{ backgroundColor: 'transparent' }}
        >
          <Scene />
        </ThreeCanvas>
      </AbsoluteFill>

      <BodyLabels />
      <Ruler />

      {/* B1 — the promise, ON the object it promises. v1 ran these exact words
          over a frame showing Earth: a good promise attached to the wrong
          picture, which is worse than r008's dead label, because r008 at least
          described what was there. */}
      {/* Split into two arrivals at 0.6 and 2.4, with the clock landing at 1.5
          between them. On an almost-empty frame a block of 62 px type is the
          single biggest event available — measured at 3.7 against a 1.0 event
          threshold — so the promise is spent as three events rather than one. */}
      <Title from={0.6} to={3.75} lines={['THE BIGGEST STAR', 'EVER MEASURED']} size={62} accent={-1} />
      <Title from={2.4} to={3.75} lines={['', '', 'IS ABOUT TO VANISH']} size={62} />
      <Countdown />

      {/* B2 — the cut to Earth. The title says why we just left the star, but not
          immediately: the promise holds to 3.75 and goes with the cut at 3.8, then
          Earth has 1.1 s on its own — its name at 4.5, its title at 4.9 — before
          Jupiter starts growing at 5.6. The first v2 cut ran the hook title out at
          3.6 and the new title in at 4.2, so three text states changed inside one
          second across a hard cut. */}
      <Title from={4.9} to={7.5} lines={['TO SEE HOW BIG,', 'START HERE']} size={76} />

      {/* B3 — the ruler, said out loud. This is the sentence v1 never had, and
          without it every number afterwards is an unanchored figure. */}
      <Title from={8.2} to={12.4} lines={['EACH ONE ABOUT', 'TEN TIMES THE LAST']} size={68} />

      {/* B4 — the jump, stated in the ruler the viewer now owns. */}
      {/* No caption. With the two body names and the ruler this beat is already
          carrying four text blocks against the countdown, and a fifth is what
          made the first v2 still unreadable. The ESO provenance moved to
          NOTES.md, which is where a source belongs. */}
      <Title from={13.4} to={16.7} lines={['NOT TEN TIMES.', 'FIFTEEN HUNDRED.']} size={72} />

      {/* B5 — one wordless beat for what 1,540 FEELS like. No number: the ruler
          holds at ×1,540 and the rings do the talking. v1 spent this beat on
          "7.16 AU · short of Saturn", which is the purest jargon in the reel and
          makes the giant sound small at the moment it should feel huge. */}
      <Title from={17.4} to={19.9} lines={['PUT IT WHERE', 'OUR SUN SITS']} size={72} />
      <Caption from={17.9} to={19.9} rows={['it reaches out past Jupiter']} />

      {/* B6 — sizes stop. The ruler visibly refuses to climb; that is the beat. */}
      <Title from={21.4} to={25.3} lines={['AND THAT IS WHERE', 'SIZE STOPS']} size={68} />
      <Caption
        from={21.9}
        to={25.3}
        rows={['the five biggest ever found', 'two galaxies, none of them bigger']}
      />

      {/* B7 — the payoff. Never more than three text blocks at once: the title
          hands over to the span line at 28.8, which hands over to the verdict at
          31.4. v1 ran four blocks in three type scales through all of it. */}
      <Title from={25.9} to={28.4} lines={['AND NOW THE GAP', 'TO THE NEXT STAR']} size={70} />
      <Tally />
      <GapLabels />
      {/* One line at a time. A two-line block is ONE event to the audit and the
          hold behind it read 2.25 s dead; split, it is two. */}
      <Title from={31.2} to={33.4} lines={['IT IS IN THERE.']} size={68} accent={-1} />
      <Title from={32.1} to={33.4} lines={['', 'YOU CANNOT SEE IT.']} size={68} />

      {/* B8 — rule 9: the close names what the next reel does, held the full 3 s,
          and it STAYS on the gap. The one thing GATE0 §4 said could make this
          sendable is that it settles "space is mostly empty", so the close states
          that claim in the form it actually gets argued in. Staggered, not a
          single fade: four arrivals inside the hold is what keeps it alive while
          the accent fill drains out of the gap behind it. */}
      <div style={{ position: 'absolute', top: 1080, left: 60, width: 810 }}>
        <Fade from={t(35.1)}>
          <div
            style={{
              fontFamily: 'Archivo Black',
              fontSize: 74,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              color: '#E8E6E1',
            }}
          >
            SPACE ISN&apos;T BIG.
          </div>
        </Fade>
        <Fade from={t(35.9)}>
          <div
            style={{
              fontFamily: 'Archivo Black',
              fontSize: 74,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              color: '#00D6F7',
              marginBottom: 26,
            }}
          >
            SPACE IS EMPTY.
          </div>
        </Fade>
        {[
          [36.9, "The biggest star we've ever found —"],
          [37.7, `${fmt(GAP.fitsRounded)} of them to cross that gap.`],
        ].map(([at, line]) => (
          <Fade key={line as string} from={t(at as number)}>
            <div
              style={{
                fontFamily: 'IBM Plex Sans',
                fontWeight: 600,
                fontSize: 44,
                lineHeight: 1.25,
                color: '#E8E6E1',
              }}
            >
              {line}
            </div>
          </Fade>
        ))}
        <Fade from={t(38.8)}>
          {['Next: the traffic jam with no cause —', 'and why it moves backwards.'].map((r) => (
            <div
              key={r}
              style={{
                fontFamily: 'IBM Plex Sans',
                fontWeight: 600,
                fontSize: 40,
                lineHeight: 1.25,
                color: '#81A2C4',
                marginTop: r.startsWith('Next') ? 20 : 0,
              }}
            >
              {r}
            </div>
          ))}
        </Fade>
      </div>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
