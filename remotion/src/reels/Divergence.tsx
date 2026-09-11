import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
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

/**
 * Beat boundaries, seconds.
 *
 * RE-CUT 2026-09-11 after the GATE 5 verdict on cut 1: *"what is the text on video
 * supposed to say?? i do not understand it"*. Cut 1 said "ONE OF THESE IS / A HAIR'S
 * WIDTH OFF." over what LOOKED like a single pendulum, then reported the measurement
 * three seconds after the split had already happened. Two failures, both mine:
 *
 *  - "ONE OF THESE" is a plural pointing at a singular. Cut 1 deliberately drew B in
 *    bone so the pair would read as one object, and then asked the viewer to pick one
 *    of two. A viewer looks for the second thing and there isn't one.
 *  - The sentence the reel is actually about was never on screen in any form: two were
 *    released from the same place, nothing touched either, they ended up unrelated.
 *    Cut 1 animated the consequence and never stated the cause.
 *
 * Cut 2 states the setup BEFORE the split and lets the split be the payoff.
 */
const B = {
  two: [0.6, 2.1],
  hair: [2.3, 4.1],
  none: [4.7, 10.2],
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
  /** Cylinder radius of both arms. */
  armR: number;
  /** Bob radius at the elbow and at the tip. */
  r1: number;
  r2: number;
  /**
   * Draw the bobs as flat RINGS instead of solid spheres, and how thick the ring is.
   *
   * This is not a style choice, it is the only thing that works. Two coincident
   * pendulums cannot be distinguished by drawing one bigger and one smaller in 3D:
   * concentric SOLIDS nest, and the depth test then hands the whole overlap to
   * whichever sphere bulges furthest toward the camera. A red sphere of r 0.132 sitting
   * BEHIND a bone sphere of r 0.100 wins at every screen radius, because
   * sqrt(0.132^2 - p^2) > 0.02 + sqrt(0.100^2 - p^2) for all p < 0.100 — so cut 2a
   * rendered as a solid red pendulum with the bone one erased inside it.
   *
   * Pushing A forward in z would fix the depth test and break the reel: at 0.09 m —
   * the least that wins — the parallax at full reach is 0.71 px, and this reel's claim
   * is that the two are identical to within ONE pixel. Buying legibility with 70% of
   * the entire accuracy budget is not a trade worth making.
   *
   * A flat ring has no such conflict. Its inner edge is set OUTSIDE the other
   * pendulum's silhouette, so the two never contend for the same pixel and both sit at
   * the same z: zero parallax, nothing occluded, and the coincident phase reads as a
   * bone pendulum wearing a red halo.
   */
  ring?: number;
}> = ({ t1, t2, arm, bob, z, armR, r1, r2, ring }) => {
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

  const s1 = seg([0, 0], e, armR);
  const s2 = seg(e, p, armR);

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
      {([[e, r1], [p, r2]] as [[number, number], number][]).map(([c, r], k) => (
        <mesh key={k} position={[c[0], c[1], z]}>
          {ring ? (
            <torusGeometry args={[r, ring, 10, 40]} />
          ) : (
            <sphereGeometry args={[r, 28, 28]} />
          )}
          <meshStandardMaterial
            color={bob}
            emissive={bob}
            emissiveIntensity={0.55}
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>
      ))}
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

      {/* The shared path is the WIDEST and the dimmest: a soft bone ghost of where the
          two were one object, wider than either live trail so neither can hide it. */}
      <Trace pts={shared} colour={BONE} width={0.055} opacity={0.30} z={-0.08} />
      <Trace pts={trailB} colour={FAIL} width={0.042} opacity={0.82} z={-0.05} />
      <Trace pts={trailA} colour={BONE} width={0.026} opacity={0.92} z={-0.04} />

      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.075, 18, 18]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.6} />
      </mesh>

      {/*
        TWO OBJECTS FROM FRAME 0, and this is the whole fix to cut 1.

        They are pixel-identical until 3.28 s, so "show two" cannot mean "show them
        apart" — that would be a lie about the physics. It means show them REGISTERED,
        in the same place, visibly two: A is the solid bone pendulum, B is a red ring
        around each of A's bobs, and every radius below is chosen so the ring's INNER
        edge clears A's silhouette (0.112 > 0.108 at the tip, 0.081 > 0.078 at the
        elbow). See the `ring` prop for why a rim of solid geometry cannot work.

        B's arm is 0.016 against A's 0.034, so while they coincide it is hidden inside
        A's arm and the frame is honest: there is one line there, because there IS one
        line there. After the split it emerges as B's own thin red arm.

        The outermost thing on screen is now the tip ring at 0.128 + 0.016 = 0.144 m,
        27.4 px from the tip centre against the 25.1 px of cut 1 — so the safe-width
        cap gets re-measured, not assumed. Red is on one object for the whole reel,
        which is the one element per frame tokens.ts allows, not a decorative wash.
      */}
      <Pendulum t1={a1} t2={a2} arm={ASH} bob={BONE} z={0} armR={0.034} r1={0.078} r2={0.108} />
      <Pendulum
        t1={b1}
        t2={b2}
        arm={FAIL}
        bob={FAIL}
        z={0}
        armR={0.016}
        r1={0.096}
        r2={0.128}
        ring={0.016}
      />
    </group>
  );
};

const Head: React.FC<{
  from: number;
  to: number;
  lines: string[];
  top?: number;
  size?: number;
}> = ({ from, to, lines, top = 1286, size = 58 }) => (
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

      {/* Copy sits BELOW the object. The motion box is 3.98 x 3.41 m and 9:16 is far
          taller than that, so ~300 px of frame under the pendulum is dead whatever the
          scale — text above it left the composition as two floating halves.

          All three moments sit at the same `top`. They are sequential with a real gap
          between them, never crossfading in place: two type blocks dissolving through
          each other in one spot reads as a double exposure (chrome.tsx, ReelHeader). */}

      {/* Beat 1 — the setup, and the antecedent. Named objects, plural, present before
          anything happens to them. */}
      <Head from={B.two[0]} to={B.two[1]} lines={['TWO PENDULUMS.', 'RELEASED TOGETHER.']} />

      {/* Beat 2 — the one difference. HIGHER, not lower: the perturbation adds
          +0.004011 deg to theta1, and at a release angle of 135 deg a larger theta is
          FURTHER FROM the downward vertical, so B's elbow starts at y = +0.707107645 m
          against A's +0.707106781 m. Checked against the integrator, not reasoned about
          from the sign of the constant. Non-negotiable 7 covers sentences, not just
          figures, and "lower" would have been a false one. */}
      <Head from={B.hair[0]} to={B.hair[1]} lines={['ONE STARTED', 'A HAIR HIGHER.']} />

      {/* Beat 3 — lands AFTER they are unmistakably two (20 px apart at 4.45 s), and it
          is the only claim the reel makes. True by construction: same equations, same
          solver, no random term anywhere, one nudge at t = 0. */}
      <Head from={B.none[0]} to={B.none[1]} lines={['NOTHING ELSE', 'CHANGED.']} />
    </AbsoluteFill>
  );
};
