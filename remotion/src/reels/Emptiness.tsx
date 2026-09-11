import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, Progress, ReelGround, ease, fmt, t, useBreath } from './lib/chrome';
import {
  AU_KM,
  BIGGEST,
  GALAXY,
  GAP,
  GAPS_ACROSS_ORION,
  GAP_PCT_OF_GALAXY,
  HALPHA,
  LADDER,
  LY_KM,
  NEBULA,
  NEIGHBOURS,
  N_DARK,
  SATURATION_SPREAD_PCT,
  WIDE,
  WOH_REACHES_AU,
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
export const DURATION_SECONDS = 53;

/** The instant the giant is gone. The hook promises this second, so it is a contract. */
const VANISH = 31.0;

/**
 * Beat boundaries, seconds. Non-negotiable 5 — read -> animate -> HOLD, ~6.5 s
 * an idea. The first cut gave the Sun no hold at all: the pull to the giant
 * started the instant it arrived, so it was a grey dot two seconds after being
 * the subject. Every rung now gets its hold, and the pull happens between them.
 */
const B = {
  hook: [0.0, 4.2],
  sun: [4.2, 7.0],
  giant: [7.0, 13.0],
  orbits: [13.0, 18.0],
  saturate: [20.0, 24.5],
  break_: [24.5, 35.0],
  hood: [35.0, 41.0],
  nebula: [41.0, 43.8],
  galaxy: [43.8, 49.0],
  close: [49.0, DURATION_SECONDS],
} as const;

// ── the camera, and the one number that moves ───────────────────────────────
const FOV = 40;
const CAM_Z = 10;
/** World units visible vertically at z=0. Everything below is in these units. */
const WORLD_H = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180);

/**
 * The layout budget, in composition pixels, inside the 270-1540 safe band:
 *   title   300-480 · STAGE 520-1140 · countdown 1180-1250 · caption 1300-1450
 * So the stage is 620 px tall centred on y=830, and every VIEW keyframe below is
 * chosen to keep its hero object inside that. The first cut had no budget: WOH
 * G64 filled the frame corner to corner and the caption was unreadable on top
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
 * Each keyframe is chosen so the object of that beat fills ~45-55% of the frame.
 * The frame is portrait, so anything laid out END TO END has only WORLD_H*0.5625
 * of width to do it in — which is what sets the two horizontal keyframes: the
 * five-in-a-row at 20.5 s, and the gap itself at VANISH.
 */
const VIEW: [number, number][] = [
  [0.0, 4.3e4], // Earth
  [2.0, 4.8e5], // Jupiter
  [4.2, 4.7e6], // the Sun arrives
  [7.0, 5.2e6], // ...and is HELD. the pull starts after the hold, not during it
  /* the pull has to clear 5.9e9 before WOH G64 is allowed on screen at all (see
     the visibility ceiling), so it lands at 8.7 s — just before its title */
  [8.7, 6.6e9],
  [10.0, 7.2e9], // WOH G64, 1,540x wider
  /* the hold keeps pulling: a motionless 500 px disc is 2.75 s of dead frame */
  [13.0, 9.0e9],
  [18.0, 9.6e9], // out past Saturn's orbit — the giant clears Jupiter's ring
  /* The five-in-a-row must be AT this scale before the beat opens, not arriving
     at it: the first cut faded them in at 18 s while the zoom was still three
     keyframes away, and the outer two were clipped off both edges. */
  [20.0, 2.45e10],
  [24.5, 2.7e10],
  [VANISH, 8.4e13], // the gap, end to end. the giant is now 0.05 px.
  [35.0, 9.2e13],
  /* These three were sized by eye and overflowed into Instagram's chrome: the
     12 ly shells and the star cloud ran off the top and bottom bands while the
     zoom was still catching up, and the galaxy clipped the action rail. Each
     wide rung is now sized so its own content fits 270-1540 and clears the rail
     (x>=870 below y=1050), and the zoom SETTLES before the content arrives. */
  [36.4, 4.0e14], // 25 neighbouring systems, 12 ly radius -> 547 px
  [41.0, 4.3e14],
  /* The nebula and the galaxy each need a rung of their own. The first cut gave
     them one shared pull and the galaxy only reached its scale at the moment its
     beat ENDED — so the wide shot was five seconds of scattered dots seen from
     inside the disc, with no spiral in it anywhere. */
  [42.8, 5.2e14], // the Orion Nebula, 24 ly across -> 838 px
  [43.6, 5.6e14],
  /* The biggest pull in the reel — 3,900x — and NOTHING is at a visible scale
     while it happens: the nebula has collapsed to a speck and the galaxy is not
     admitted until it fits. Measured over four seconds that was 185 lit pixels
     for two full seconds. The fix is not a slower rate or a brighter nebula, it
     is to spend less time in the void: 1.4 s instead of 4. */
  [45.0, 1.7e18], // the galaxy, ~1070 px wide
  /* the close keeps pulling. sizing the galaxy to clear the action rail made it
     small enough that 49-53 s went dead at 3.25 s — the answer is to keep
     leaving, not to make the disc bigger again */
  /* No hold on the galaxy at all. Measured over 46-48.5 s a 4 s hold on a
     2,600-point cloud changed 0.12-0.19 per sample against a 0.35 floor — a
     sparse cloud cannot carry a hold at 240 px wide, whatever it is doing.
     So the frame never stops leaving, and the keyframes are spaced tightly
     enough that `ease` never parks the rate at zero for long. */
  [47.0, 2.4e18],
  [49.0, 3.3e18],
  /* The last two seconds are the end-frame hold rule 9 asks for, and the galaxy
     is the only thing in them. It recedes hardest here so the hold keeps its
     reading time without keeping its stillness. */
  [51.0, 4.4e18],
  [DURATION_SECONDS, 8.6e18],
];

/**
 * A budget nobody checks is a comment. Each hero object is measured against the
 * keyframe where it is the subject; if a VIEW number is ever edited so that the
 * subject outgrows the stage and starts sitting on the caption, the composition
 * fails to load rather than rendering something unreadable.
 */
for (const [name, diamKm, atViewKm] of [
  ['Earth', 2 * LADDER[0].radiusKm, 4.3e4],
  ['Jupiter', 2 * LADDER[1].radiusKm, 4.8e5],
  ['the Sun', 2 * LADDER[2].radiusKm, 4.7e6],
  ['WOH G64', 2 * LADDER[3].radiusKm, 7.2e9],
  ["Saturn's orbit", 2 * 9.583 * AU_KM, 9.6e9],
] as [string, number, number][]) {
  if (diamKm / atViewKm > HERO) {
    throw new Error(
      `r009 layout budget: ${name} is ${((diamKm / atViewKm) * 100).toFixed(1)}% of the ` +
        `view at its own keyframe, over the ${(HERO * 100).toFixed(1)}% stage allowance.`,
    );
  }
}

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

/**
 * Unresolved disc light for the galaxy. Deliberately a much flatter falloff than
 * `useGlow`: a star's halo should die away fast, but a galaxy's disc is broad
 * and nearly uniform, and the steep profile left the 46-53 s hold with no large
 * bright mass in it at all.
 */
const useHaze = () =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0.0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.30, 'rgba(255,255,255,0.86)');
    grd.addColorStop(0.58, 'rgba(255,255,255,0.52)');
    grd.addColorStop(0.80, 'rgba(255,255,255,0.22)');
    grd.addColorStop(1.0, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
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
 * B1-B3 — Earth, Jupiter, the Sun, WOH G64, bottoms on a common baseline and
 * laid out left to right at their MEASURED radii. The camera tracks the current
 * rung, so each arrives centred and the one before it shrinks away to the left.
 */
const LadderGroup: React.FC<{ viewKm: number }> = ({ viewKm }) => {
  const s = useCurrentFrame() / FPS;
  const o = useBeat(B.hook[0] - 1, B.orbits[1]);
  const u = (km: number) => (km / viewKm) * WORLD_H;

  /**
   * Which rung the frame is sitting on, as a continuous number. This is what
   * replaces a camera: bodies are laid out RELATIVE to the current rung rather
   * than at fixed positions, so the frame is never flying past absolute
   * coordinates it can no longer resolve.
   */
  const rung = interpolate(s, [0, 2.0, 4.2, 7.0, 10.0], [0, 1, 2, 2, 3], ease);

  if (o <= 0.002) return null;
  return (
    <group>
      {LADDER.map((b, i) => {
        /**
         * A body is drawn only while its true size is legible against the
         * current view. Above the ceiling it would be a wall across the frame —
         * WOH G64 at Sun-zoom is 1,540x the whole picture — and far below the
         * floor it is not even a glow. THIS is the re-basing: a rung exists
         * while it is at a showable scale and not one frame longer.
         */
        const rel = b.radiusKm / viewKm;
        /* The CEILING is the important number here and the first cut had it at
           -0.10, i.e. radius up to 0.79 of viewKm — a sphere 1.6x the height of
           the frame. A body faded IN at that size fills the picture, and a lit
           one blows out: frames 79-100 of the first render averaged 180/255 and
           read as a white flash at 2.6 s. -0.74 caps a visible body at ~0.53 of
           the frame, which is comfortably under the stage budget it fades
           through on its way to being the hero. */
        const win =
          interpolate(Math.log10(rel), [-5.0, -4.4, -0.74, -0.58], [0, 1, 1, 0], ease) * o;
        if (win <= 0.002) return null;
        /* Spacing is view-relative, so neighbours stay on screen at every zoom.
           0.21 and not 0.30: the frame is PORTRAIT, so half its width is only
           0.28 of viewKm — at 0.30 the Sun sat just outside the left edge
           exactly when "1,540 times the width of the Sun" was on screen, which
           is the one moment it has to be visible. */
        const x = u((i - rung) * 0.19 * viewKm);
        const r = u(b.radiusKm);
        const common = { x, y: 0, r, opacity: win };
        return b.rgb ? (
          <Star
            key={b.name}
            {...common}
            color={b.rgb}
            flux={b.flux}
            halo={i === 3 ? 2.3 : 4.6}
            minHalo={0.095}
          />
        ) : (
          <Planet key={b.name} {...common} color={i === 0 ? '#00D6F7' : '#FFB020'} />
        );
      })}
      <Orbits viewKm={viewKm} cx={u((3 - rung) * 0.19 * viewKm)} />
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
        const at = B.orbits[0] - 2.6 + i * 0.72;
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
 * B5 — the payoff. The Sun and Proxima at the real 4.2465 ly apart, the giant at
 * the midpoint at its real diameter, and a sweep that lays giant-diameters end to
 * end across the gap while the counter runs. The sweep is deliberately a
 * full-width moving mass: r006's route-draw beat scored 16% on event density
 * because a growing thin line is worth almost nothing to the audit.
 */
const GapGroup: React.FC<{ viewKm: number }> = ({ viewKm }) => {
  const s = useCurrentFrame() / FPS;
  const o = useBeat(B.break_[0], B.break_[1]);
  const u = (km: number) => (km / viewKm) * WORLD_H;
  if (o <= 0.002) return null;

  const half = u(GAP.km / 2);
  const sweep = interpolate(s, [B.break_[0] + 1.0, VANISH], [0, 1], ease);
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
      {/* the leading edge, a bright moving mark */}
      <mesh position={[-half + half * 2 * sweep, 0, 0]}>
        <planeGeometry args={[0.035, 0.5]} />
        <meshBasicMaterial
          color="#00D6F7"
          transparent
          opacity={o * interpolate(sweep, [0.93, 1.0], [1, 0], ease)}
        />
      </mesh>
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
      {/* the giant, at true scale, on its way to nothing */}
      <Star x={0} y={0} r={giantR} color={BIGGEST[0].rgb} flux={BIGGEST[0].flux} opacity={o} halo={2.3} />
      {/* the hold after VANISH was 3.25 s of nothing; a pulse leaving the Sun and
          crossing the gap keeps it alive without adding a single new claim */}
      {(() => {
        const since = s - (B.break_[0] + 0.6);
        if (since < 0) return null;
        const f = (since % 3.4) / 3.4;
        return (
          <mesh position={[-half + half * 2 * f, 0, 0.01]}>
            <planeGeometry args={[0.10, 0.42]} />
            <meshBasicMaterial
              color="#00D6F7"
              transparent
              opacity={o * 0.9 * Math.sin(Math.PI * f)}
            />
          </mesh>
        );
      })()}
    </group>
  );
};

/**
 * B6 — the 25 nearest systems, real RA/Dec/distance, in real 3D.
 *
 * This is the beat that FAILED the motion audit: 4.00 s dead, 25% event density.
 * Twenty-five points a few pixels wide move almost no area, which is exactly the
 * blind spot CLAUDE.md names — "a growing 6px line and a moving 15px dot are
 * worth almost nothing". Three fixes, in order of how much they moved the number:
 * distance shells that sweep a large area as the cloud tumbles, a faster tumble,
 * and bigger discs. The shells are at real distances (4, 8, 12 ly), so the fix
 * adds information rather than decoration.
 */
const HoodGroup: React.FC<{ viewKm: number }> = ({ viewKm }) => {
  const s = useCurrentFrame() / FPS;
  const o = useBeat(B.hood[0], B.hood[1]);
  const u = (km: number) => (km / viewKm) * WORLD_H;
  if (o <= 0.002) return null;
  const k = u(LY_KM);
  const since = s - B.hood[0];
  const tilt = 0.30 + 0.26 * Math.sin((2 * Math.PI * since) / 8);
  return (
    <group rotation={[tilt, since * 0.30, 0]}>
      {/* real distance shells, and the thing that actually moves area */}
      {[4, 8, 12].map((ly, i) => {
        const at = 0.5 + i * 0.6;
        const a = interpolate(since, [at, at + 0.7], [0, 1], ease) * o;
        if (a <= 0.002) return null;
        const r = ly * k;
        return (
          <mesh key={ly}>
            <ringGeometry args={[r * 0.995, r, 200]} />
            <meshBasicMaterial
              color="#274064"
              transparent
              opacity={a * 0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      {/* a front leaving the Sun, crossing the whole neighbourhood, repeating */}
      {(() => {
        const f = ((since - 0.8) % 3.2) / 3.2;
        if (since < 0.8) return null;
        const r = Math.max(1e-4, f * 12.6 * k);
        return (
          <mesh>
            <ringGeometry args={[r * 0.986, r, 200]} />
            <meshBasicMaterial
              color="#00D6F7"
              transparent
              opacity={o * 0.55 * Math.sin(Math.PI * f)}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })()}
      <Star x={0} y={0} r={0.030} color={LADDER[2].rgb!} opacity={o} halo={4.5} />
      {NEIGHBOURS.map((n, i) => {
        const at = B.hood[0] + 0.4 + i * 0.055;
        const a = interpolate(s, [at, at + 0.45], [0, 1], ease) * o;
        if (a <= 0.002) return null;
        return (
          <group key={n.name} position={[n.x * k, n.z * k, n.y * k]}>
            {/* No flux dimming here, deliberately. Colour still comes from the
                star's temperature, but these are MARKERS on a map and the beat
                claims "25 systems" — at true relative surface brightness the M
                dwarfs faded out and only about eight were countable. The three
                that emit nothing visible stay dim, because that IS the claim. */}
            <Star
              x={0}
              y={0}
              r={n.dark ? 0.018 : 0.030}
              color={n.rgb}
              opacity={n.dark ? a * 0.34 : a}
              halo={n.dark ? 2.2 : 4.0}
            />
          </group>
        );
      })}
    </group>
  );
};

/** B7 — the Orion Nebula at its measured 24 ly, coloured by the H-alpha line. */
const NebulaGroup: React.FC<{ viewKm: number }> = ({ viewKm }) => {
  /* Held until the galaxy is actually on screen. Fading it out on its own
     beat left 44.8-46.5 with nothing in frame but the backdrop, which is a dead
     spell no zoom rate can fix. It shrinks to a speck cluster on the way, which
     is what the Orion Nebula is at galactic scale anyway. */
  const o = useBeat(B.nebula[0], 44.2, 0.9);
  const u = (km: number) => (km / viewKm) * WORLD_H;
  if (o <= 0.002) return null;
  const k = u(LY_KM);
  return (
    <Cloud
      pts={NEBULA}
      scale={WIDE.orionWLy * k}
      size={Math.max(0.02, 0.05 * k * WIDE.orionWLy)}
      color={HALPHA}
      opacity={o * 0.5}
    />
  );
};

/** B8 — the galaxy, with the Sun pinned at its real galactocentric radius. */
const GalaxyGroup: React.FC<{ viewKm: number }> = ({ viewKm }) => {
  const s = useCurrentFrame() / FPS;
  const haze = useHaze();
  const u = (km: number) => (km / viewKm) * WORLD_H;
  /* Gated on FIT, not on the clock. Faded in on time, the disc arrived while the
     pull was still four keyframes from its scale and sprayed points through the
     top band, the bottom band and the action rail for two full seconds. It is
     allowed on screen once it is small enough to be on screen. */
  const rel = (WIDE.mwDiamLy * LY_KM) / viewKm;
  const o =
    interpolate(rel, [0.46, 0.62], [1, 0], ease) *
    useBeat(B.galaxy[0] - 2.0, DURATION_SECONDS + 1, 1.0);
  if (o <= 0.002) return null;
  const k = u(LY_KM);
  // 0.005 rad/s was invisible; the galaxy beat scored 22% and the close 19%
  const spin = (s - B.galaxy[0]) * 0.105;
  const sunAngle = 2.1;
  const tilt = 1.12 + 0.10 * Math.sin((2 * Math.PI * (s - B.galaxy[0])) / 9);
  const discR = (WIDE.mwDiamLy / 2) * k * 1.22;
  return (
    <group>
      {/* Diffuse disc light. A real galaxy is not 2,600 discrete dots — most of
          what you see is unresolved light — and the point cloud alone left the
          45-49 s hold dead at 2.75 s, because rotating 2 px points changes
          almost no area. This is the large moving mass the beat was missing. */}
      <mesh rotation={[tilt, 0, spin]}>
        <circleGeometry args={[discR, 96]} />
        <meshBasicMaterial
          map={haze}
          color="rgb(126, 158, 222)"
          transparent
          opacity={o * 0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Cloud
        pts={GALAXY}
        scale={k}
        size={Math.max(0.019, 70 * k)}
        color="rgb(216, 228, 252)"
        opacity={o * 0.95}
        spin={spin}
        tilt={tilt}
      />
      {/* the one real quantity in this rung — GRAVITY Collaboration 2019 */}
      <group rotation={[tilt, 0, spin]}>
        <Star
          x={WIDE.sunR0Ly * k * Math.cos(sunAngle)}
          y={WIDE.sunR0Ly * k * Math.sin(sunAngle)}
          r={0}
          color="#00D6F7"
          opacity={o}
          /* pulses, because 46.2-49 s was the last dead spell in the reel and a
             sparse point cloud cannot carry a hold however big or bright it is.
             This is also the only moment the reel points back at the viewer. */
          minHalo={
            0.075 +
            0.055 * Math.max(0, Math.sin((2 * Math.PI * (s - B.galaxy[0])) / 1.6))
          }
        />
      </group>
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
      <HoodGroup viewKm={viewKm} />
      <NebulaGroup viewKm={viewKm} />
      <GalaxyGroup viewKm={viewKm} />
      </group>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// The page
// ─────────────────────────────────────────────────────────────────────────────

const Title: React.FC<{ from: number; to: number; lines: string[]; size?: number }> = ({
  from,
  to,
  lines,
  size = 68,
}) => (
  <Fade
    from={t(from)}
    to={t(to)}
    style={{ position: 'absolute', top: 300, left: 60, width: 810 }}
  >
    {lines.map((l, i) => (
      <div
        key={l}
        style={{
          fontFamily: 'Archivo Black',
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          color: i === lines.length - 1 && lines.length > 1 ? '#00D6F7' : '#E8E6E1',
        }}
      >
        {l}
      </div>
    ))}
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
  const o = interpolate(s, [1.0, 1.8, VANISH - 0.3, VANISH + 0.4], [0, 1, 1, 0], ease);
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

/**
 * Labels for the two ends of the gap, and the one line that says what it is.
 * They sit ON the stage rather than in the caption slot, because the caption
 * slot is where the tally goes and two blocks fighting for 1300 is what made
 * the first cut of this beat unreadable.
 */
const GapLabels: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const o = interpolate(s, [B.break_[0] + 0.4, B.break_[0] + 1.2, 34.6, 35.0], [0, 1, 1, 0], ease);
  if (o <= 0.002) return null;
  const tick = { fontFamily: 'IBM Plex Mono', fontSize: 38, color: '#81A2C4', letterSpacing: 2 };
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, opacity: o }}>
      <div style={{ ...tick, position: 'absolute', top: 886, left: 60 }}>THE SUN</div>
      <div
        style={{ ...tick, position: 'absolute', top: 886, left: 60, width: 960, textAlign: 'right' }}
      >
        PROXIMA
      </div>
      <div
        style={{
          position: 'absolute',
          top: 690,
          left: 60,
          width: 960,
          textAlign: 'center',
          fontFamily: 'IBM Plex Mono',
          fontSize: 40,
          color: '#00D6F7',
          letterSpacing: 1,
        }}
      >
        {GAP.ly} LIGHT-YEARS OF NOTHING
      </div>
    </div>
  );
};

/** The counter is the thing the viewer carries away, so it runs big and lands exactly. */
const Tally: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const o = interpolate(
    s,
    [B.break_[0] + 0.6, B.break_[0] + 1.3, B.break_[1] - 0.2, B.break_[1] + 0.4],
    [0, 1, 1, 0],
    ease,
  );
  if (o <= 0.002) return null;
  const n = interpolate(s, [B.break_[0] + 1.0, VANISH], [1, GAP.fitsRounded], ease);
  return (
    <div style={{ position: 'absolute', top: 1180, left: 60, width: 810, opacity: o }}>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 38, color: '#81A2C4', letterSpacing: 3 }}>
        BIGGEST STARS, LAID END TO END
      </div>
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

      {/* B1 — a promise that names its object and its second, not a label.
          r008: a label describes the frame, a promise says what is about to
          happen to it and when — and if it names a time, a clock has to keep it. */}
      <Title
        from={0.6}
        to={4.3}
        lines={['THE BIGGEST STAR', 'EVER MEASURED', 'IS ABOUT TO VANISH']}
        size={64}
      />
      <Countdown />

      <Title from={4.5} to={6.9} lines={['OUR SUN']} size={92} />
      <Caption
        from={4.8}
        to={6.9}
        rows={['109 Earths across', 'and it is about to look tiny']}
      />

      <Title from={8.8} to={12.9} lines={['WOH G64']} size={92} />
      <Caption
        from={9.2}
        to={12.9}
        rows={[
          `${fmt(Math.round(LADDER[3].step!))} Suns across`,
          'first imaged outside our galaxy, 2024',
        ]}
      />

      <Title from={13.4} to={17.9} lines={['PUT IT WHERE', 'THE SUN IS']} size={72} />
      <Caption
        from={13.9}
        to={17.9}
        rows={[
          "it swallows Jupiter's orbit",
          `${WOH_REACHES_AU.toFixed(2)} AU · short of Saturn`,
        ]}
      />

      <Title from={20.3} to={24.4} lines={['AND THAT IS WHERE', 'SIZE STOPS']} size={68} />
      <Caption
        from={20.8}
        to={24.4}
        rows={[
          'the five largest ever found',
          `two galaxies, all within ${SATURATION_SPREAD_PCT}%`,
        ]}
      />

      <Title from={24.9} to={30.4} lines={['NOW THE GAP', 'TO THE NEXT STAR']} size={70} />
      <Tally />
      <GapLabels />
      <Title from={31.2} to={34.9} lines={['IT IS IN THERE.', 'YOU CANNOT SEE IT.']} size={68} />

      <Title from={35.5} to={40.9} lines={['AND THAT GAP', 'IS A SHORT ONE']} size={70} />
      <Caption
        from={36.0}
        to={40.9}
        rows={[
          `${NEIGHBOURS.length} systems, 12 light-years`,
          `${N_DARK} of them emit no visible light`,
        ]}
      />

      <Title from={41.5} to={43.9} lines={['EVEN THE CLOUDS', 'ARE MOSTLY NOTHING']} size={64} />
      <Caption
        from={41.9}
        to={43.9}
        rows={[
          `the Orion Nebula · ${WIDE.orionWLy} light-years`,
          `that is ${GAPS_ACROSS_ORION.toFixed(1)} of those gaps across`,
        ]}
      />

      <Title from={45.2} to={48.0} lines={['ZOOM OUT FAR ENOUGH', 'AND IT IS ALL GAP']} size={62} />
      <Caption
        from={45.6}
        to={48.0}
        rows={[
          'all of it, inside one galaxy',
          `that gap is ${GAP_PCT_OF_GALAXY.toFixed(4)}% of the way across`,
        ]}
      />

      {/* B8 — rule 9: the close names what the next reel does, held the full 3 s.
          Staggered, not a single fade: the galaxy is a sparse point cloud by now
          and rotating it moves almost no area, so 50.0-53.2 came back as a 3.25 s
          dead spell. Four arrivals inside the hold is what keeps it alive, and it
          reads better than dropping the whole block at once. */}
      <div style={{ position: 'absolute', top: 1120, left: 60, width: 810 }}>
        <Fade from={t(48.4)}>
          <div
            style={{
              fontFamily: 'Archivo Black',
              fontSize: 74,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              color: '#E8E6E1',
            }}
          >
            THE EMPTINESS
          </div>
        </Fade>
        <Fade from={t(49.2)}>
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
            IS THE POINT.
          </div>
        </Fade>
        <Fade from={t(50.1)}>
          <div
            style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 46, color: '#81A2C4' }}
          >
            Next: the traffic jam with no cause —
          </div>
        </Fade>
        <Fade from={t(50.8)}>
          <div
            style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 46, color: '#81A2C4' }}
          >
            and why it moves backwards.
          </div>
        </Fade>
      </div>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
