import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, t } from './lib/chrome';
import { FRAMES, META } from './data/divergence';

/**
 * r011 · I71 — the one that started a hair's width away.
 *
 * FIRST REEL IN THE LOOP FORMAT. 12 s, no narration, two text moments, built to be
 * rewatched rather than understood. The runtime IS the experiment: every reel this
 * account has posted has been 28-54 s, i.e. too long to watch twice by accident, and
 * a 12 s loop watched twice is 200% watch time. Pre-registered metric and the
 * reasoning: projects/r011_divergence/gate0/GATE0.md §4.
 *
 * ── Nothing here is animated by hand ────────────────────────────────────────
 * Both pendulums come out of data/divergence.ts: classic double-pendulum equations,
 * RK4 at dt = 1/2000 s, energy conserved to 3.5e-11 of MgL. There is no random term
 * anywhere — the ONLY difference between the two is 70 um of arc at t = 0, one human
 * hair. emit_ts.py asserts all twelve on-screen claims and refuses to write the data
 * module if one of them stops being true.
 *
 * ── Why this is 3D, and why the camera is nearly ORTHOGRAPHIC ───────────────
 * 3D is the default now (CLAUDE.md, 2026-09-11) but that rule carries a limit: it
 * must never cost legibility. A double pendulum swings in a PLANE, and the whole reel
 * rests on a separation measured in single screen pixels — so perspective is the one
 * thing that must not happen here. Foreshortening would distort the traces and quietly
 * corrupt the measurement the copy quotes.
 *
 * So the camera sits far away behind a narrow lens (FOV 12 at z = 48), which is
 * orthographic to well under a pixel across the scene's depth, and the third dimension
 * is spent entirely on MATERIAL: the bobs are lit spheres and the arms are cylinders,
 * so they read as objects rather than as circles and lines. Same awe, no distortion.
 *
 * ── The loop is a HARD CUT, and that is honest ──────────────────────────────
 * A chaotic system cannot loop seamlessly — by definition it never returns to its
 * initial state. At 12.0 s this cuts back to frame 0, where the two are one object
 * again, and the cut re-delivers the surprise. Nothing claims a seamless loop.
 */
export const DURATION_SECONDS = 12;

/** Beat boundaries, seconds. */
const B = {
  promise: [0.8, 3.2],
  reveal: [6.2, 11.0],
} as const;

// ── palette. Brand tokens only. ─────────────────────────────────────────────
const INK = '#040E1F';
const BONE = '#E8E6E1';
const ASH = '#81A2C4';
const GRAPHITE = '#274064';
const FAIL = '#FF4D4D'; // DOMAIN_ACCENT.failure — ONLY from the beat it breaks

const FOV = 12;
const CAM_Z = 48;
/** Metres per screen pixel, and it MUST match META.pxPerM or "one pixel of daylight"
 *  stops meaning what emit_ts.py asserted. */
const WORLD_W = (2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180) * REEL_W) / REEL_H;
const PX_PER_M = REEL_W / WORLD_W;

/** Pivot at the centre of the SAFE width (x 465), not of the raw frame. */
const PIVOT_X_M = (465 - REEL_W / 2) / PX_PER_M;
/**
 * 848, not the frame centre. Measured over the whole run, the tips visit
 * x -2.000..+1.977 and y -1.998..+1.414 — a box 3.98 x 3.41 m that is NOT centred on
 * the pivot, because the pendulum spends more time below it than above. Centring the
 * pivot instead of the motion left ~350 px of dead frame at the bottom.
 *
 * That measurement also settled the scale: 193.6 px/m would just fill the safe width,
 * and this build runs 190.3 — so the scene is already as large as the safe area
 * allows. The first cut LOOKED small for a different reason, and the fix was weight
 * and brightness rather than zoom.
 */
const PIVOT_Y_M = (REEL_H / 2 - 848) / PX_PER_M;

const TRAIL_S = 3.6; // rolling trail; the shared path is kept separately, forever

/**
 * Bob radius is capped by the SAFE WIDTH, not by taste. The tips reach x = -2.000 and
 * +1.977 m, which at 190.3 px/m lands 376 px from a pivot at x 465 — so the bob may add
 * at most ~29 px before the sphere's edge crosses into Instagram's action rail. At
 * r = 0.155 the audit found exactly two frames of 360 over the line, by 2 and 4 px.
 *
 * Shrinking the bob rather than widening the lens is deliberate: PX_PER_M must stay at
 * META.pxPerM, because "one pixel of daylight" is what emit_ts.py asserted the 3.3 s
 * against. Changing the scale to fix a layout problem would quietly move the number the
 * copy quotes.
 */

const C_BONE = new THREE.Color(BONE);
const C_FAIL = new THREE.Color(FAIL);

const secs = (frame: number) => frame / FPS;

const tip = (t1: number, t2: number): [number, number] => [
  META.l1 * Math.sin(t1) + META.l2 * Math.sin(t2),
  -META.l1 * Math.cos(t1) - META.l2 * Math.cos(t2),
];

const elbow = (t1: number): [number, number] => [
  META.l1 * Math.sin(t1),
  -META.l1 * Math.cos(t1),
];

/** A flat ribbon through a path in the XY plane, so trace width is controllable —
 *  three.js ignores LineBasicMaterial.linewidth on every desktop WebGL driver. */
const ribbon = (pts: [number, number][], w: number) => {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const n = Math.hypot(dx, dy) || 1;
    dx /= n;
    dy /= n;
    pos.push(pts[i][0] - dy * w, pts[i][1] + dx * w, 0);
    pos.push(pts[i][0] + dy * w, pts[i][1] - dx * w, 0);
    if (i < pts.length - 1) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
};

const Trace: React.FC<{
  pts: [number, number][];
  colour: THREE.Color | string;
  width: number;
  opacity: number;
  z: number;
}> = ({ pts, colour, width, opacity, z }) => {
  const key = `${pts.length}:${pts[0]?.[0].toFixed(3)}:${pts[pts.length - 1]?.[0].toFixed(3)}`;
  const geo = useMemo(() => (pts.length > 1 ? ribbon(pts, width) : null), [key, width]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!geo || opacity <= 0.01) return null;
  return (
    <mesh geometry={geo} position={[0, 0, z]}>
      <meshBasicMaterial color={colour} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Pendulum: React.FC<{
  t1: number;
  t2: number;
  arm: THREE.Color | string;
  bob: THREE.Color | string;
  z: number;
}> = ({ t1, t2, arm, bob, z }) => {
  const e = elbow(t1);
  const p = tip(t1, t2);

  const seg = (a: [number, number], b: [number, number], r: number) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    return {
      position: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z] as [number, number, number],
      rotation: [0, 0, Math.atan2(dy, dx) - Math.PI / 2] as [number, number, number],
      args: [r, r, len, 12] as [number, number, number, number],
    };
  };

  const s1 = seg([0, 0], e, 0.040);
  const s2 = seg(e, p, 0.040);

  return (
    <>
      <mesh position={s1.position} rotation={s1.rotation}>
        <cylinderGeometry args={s1.args} />
        <meshStandardMaterial color={arm} emissive={arm} emissiveIntensity={0.5} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={s2.position} rotation={s2.rotation}>
        <cylinderGeometry args={s2.args} />
        <meshStandardMaterial color={arm} emissive={arm} emissiveIntensity={0.5} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[e[0], e[1], z]}>
        <sphereGeometry args={[0.100, 28, 28]} />
        <meshStandardMaterial color={bob} emissive={bob} emissiveIntensity={0.55} roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[p[0], p[1], z]}>
        <sphereGeometry args={[0.132, 28, 28]} />
        <meshStandardMaterial color={bob} emissive={bob} emissiveIntensity={0.55} roughness={0.35} metalness={0.05} />
      </mesh>
    </>
  );
};

const Scene: React.FC<{ s: number }> = ({ s }) => {
  const i = Math.min(FRAMES.length - 1, Math.max(0, Math.round(s * META.hz)));
  const [a1, a2, b1, b2] = FRAMES[i];

  const iSplit = Math.round(META.splitS * META.hz);
  const iTrail = Math.max(0, i - Math.round(TRAIL_S * META.hz));

  // The shared path is kept for the whole reel: it is the evidence that the two were
  // one object, and a rolling trail alone would erase the reel's own premise.
  const shared = useMemo(
    () => FRAMES.slice(0, Math.min(iSplit, i) + 1).map((f) => tip(f[0], f[1])),
    [Math.min(iSplit, i)], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const trailA = useMemo(
    () => FRAMES.slice(iTrail, i + 1).map((f) => tip(f[0], f[1])),
    [iTrail, i],
  );
  const trailB = useMemo(
    () => FRAMES.slice(iTrail, i + 1).map((f) => tip(f[2], f[3])),
    [iTrail, i],
  );

  /** B is bone until the split, so before it the pair reads as ONE pendulum. Turning
   *  it red from frame 0 would have given away the entire reel in the first second. */
  const split = interpolate(s, [META.splitS, META.splitS + 0.9], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bobB = C_BONE.clone().lerp(C_FAIL, split);
  const armB = new THREE.Color(ASH).lerp(C_FAIL.clone().multiplyScalar(0.62), split);

  // NOT -PIVOT_X_M. PIVOT_X_M is already the offset FROM frame centre TO the safe
  // centre (negative, because x 465 is left of 540); negating it pushed the pivot to
  // x = 615 and the traces ran into the action rail. Caught by the frame audit, which
  // is the only thing that would have caught it.
  return (
    <group position={[PIVOT_X_M, PIVOT_Y_M, 0]}>
      {/* Enough ambient that the brand hue survives, with one directional light for
          the highlight that makes a sphere read as a sphere. That highlight is the
          entire reason this reel is 3D. */}
      <ambientLight intensity={0.95} />
      <directionalLight position={[-4, 6, 9]} intensity={0.85} />
      <pointLight position={[3, -2, 5]} intensity={0.35} />

      <Trace pts={shared} colour={BONE} width={0.034} opacity={0.46} z={-0.06} />
      <Trace pts={trailA} colour={BONE} width={0.029} opacity={0.85} z={-0.04} />
      <Trace pts={trailB} colour={bobB} width={0.029} opacity={0.34 + 0.66 * split} z={-0.02} />

      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.075, 18, 18]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.6} />
      </mesh>

      <Pendulum t1={a1} t2={a2} arm={ASH} bob={BONE} z={0} />
      <Pendulum t1={b1} t2={b2} arm={armB} bob={bobB} z={0.02} />
    </group>
  );
};

const Head: React.FC<{
  from: number;
  to: number;
  lines: string[];
  top?: number;
  size?: number;
}> = ({ from, to, lines, top = 1256, size = 62 }) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top, left: 60, width: 810 }}>
    {lines.map((l) => (
      <div
        key={l}
        style={{
          fontFamily: 'Archivo Black',
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: -1,
          color: BONE,
        }}
      >
        {l}
      </div>
    ))}
  </Fade>
);

export const Divergence: React.FC = () => {
  const s = secs(useCurrentFrame());

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* ASH, not FAIL. Passing the failure accent to ReelGround washes the WHOLE
          frame red for the whole reel — exactly the decorative use tokens.ts says
          destroys the accent. Red exists in this reel on one object, from one beat. */}
      <ReelGround accent={ASH} />

      <AbsoluteFill>
        <ThreeCanvas
          width={REEL_W}
          height={REEL_H}
          linear
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 1, far: 200 }}
          gl={{ antialias: true, alpha: true }}
          style={{ backgroundColor: 'transparent' }}
        >
          <Scene s={s} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* The promise. "These" points at the only thing on screen — not r006's bare
          pronoun with no antecedent. It is the only reason the first three seconds
          are tense rather than merely pretty. */}
      {/* Copy sits BELOW the object. The motion box is 3.98 x 3.41 m and 9:16 is far
          taller than that, so ~300 px of frame under the pendulum is dead whatever the
          scale — text above it left the composition as two floating halves. */}
      <Head
        from={B.promise[0]}
        to={B.promise[1] + 0.3}
        lines={['ONE OF THESE IS', "A HAIR'S WIDTH OFF."]}
        top={1300}
      />

      {/* The one piece of information, and it lands AFTER the amazement.
          NOT "identical" — they differed by 70 um from t=0, and 3.3 s is when the gap
          crosses one screen pixel. Non-negotiable 7 caught that before the build. */}
      <Head
        from={B.reveal[0]}
        to={B.reveal[1]}
        lines={["YOU COULDN'T TELL", 'THEM APART FOR', `${META.splitS.toFixed(1)} SECONDS.`]}
        size={54}
        top={1252}
      />
      <Head from={B.reveal[0] + 1.4} to={B.reveal[1]} lines={['NOTHING WAS RANDOM.']} top={1444} size={40} />
    </AbsoluteFill>
  );
};
