import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import {
  FPS,
  Fade,
  REEL_H,
  REEL_W,
  ReelGround,
  SAFE,
  SAFE_BOTTOM,
  SAFE_TOP,
  SAFE_W,
  ease,
  t,
  useBreath,
} from './lib/chrome';
import {
  COUNTER_LOCK,
  COUNTER_START,
  FRAGMENTS,
  MOLECULE,
  O2_INBOUND,
  PER_KG,
} from './data/breath';

/**
 * r013 · I81 — you don't sweat fat off, you breathe it out.
 *
 * ── Nothing here is animated by hand ────────────────────────────────────────
 * The molecule is a real C55H104O6 grown atom by atom from tetrahedral (sp3)
 * and trigonal (sp2) bond-angle constraints (projects/r013_breath/breath.py),
 * not an authored diagram. Combusted, it independently re-derives 84.25% of
 * the fat's own mass leaving as CO2 and 15.75% as H2O — published: 84% / 16%
 * (Meerman & Brown, BMJ 2014;349:g7257) — within 0.5 percentage points of both.
 * emit_ts.py asserts 22 on-screen claims, at the SCRIPT.md timestamp that
 * puts each on screen, and refuses to write the data module if one is false.
 *
 * ── One continuous camera push, no cut ──────────────────────────────────────
 * The wide shot (person, scale, breath) and the molecule are the SAME group,
 * never two scenes. pushAmount goes 0 -> 1 -> 0 across the whole reel and
 * both the group's SCALE and its ANCHOR (what point recentres under the
 * camera) are driven by it together, so the anchor is exactly centred at
 * every intermediate frame — not two independently-eased channels drifting
 * apart. CLOSE_SCALE itself is computed from the molecule's own measured
 * bounding-box diameter (breath_data.json), not a tuned magic number.
 *
 * ── Why the breath cloud, not the person, is what stays in frame ───────────
 * SCRIPT.md B7: "the person's silhouette stays faintly visible at the edge
 * of frame" while the push happens. The breath-cloud puffs are laid out
 * ALONG the same line the push travels (mouth -> MOL_ANCHOR), so the object
 * the reel is actually about (breath) is what the close-up is inside of —
 * non-negotiable 6 kept by construction, not by a late fade.
 */
export const DURATION_SECONDS = 37;

// ── palette. Brand tokens only (tokens.ts DOMAIN_ACCENT.languages). ────────
const INK = '#040E1F';
const SLATE = '#0E213E';
const BONE = '#E8E6E1';
const ASH = '#81A2C4';
const GRAPHITE = '#274064';
const ACCENT = '#51A4FF'; // DOMAIN_ACCENT.languages — marks the oxygen mechanism
const AMBER = '#FFB020'; // ONE element per frame (§3): the flame icon, alone
const FAIL = '#FF4D4D'; // ONLY on the beat something is proven wrong (the strike-throughs)

/** SCRIPT.md's 12 beats, verbatim timestamps. */
const BEAT = {
  b1: [0.0, 3.0],
  b2: [3.0, 6.5],
  b3: [6.5, 8.3],
  b4: [8.3, 10.1],
  b5: [10.1, 12.2],
  b6: [12.2, 14.0],
  b7: [14.0, 17.5],
  b8: [17.5, 22.0],
  b9: [22.0, 25.0],
  b10: [25.0, 28.0],
  b11: [28.0, 33.0],
  b12: [33.0, DURATION_SECONDS],
} as const;

// ── camera geometry ──────────────────────────────────────────────────────
// CAM_Z is chosen so the wide scene (person, breath cloud) sits COMFORTABLY
// inside the Instagram safe band (non-negotiable 1) with margin for the
// close-up's own spread, not just so the person "fits" — reel_safe_audit.py
// caught the first pass sitting flush against the top edge.
const FOV = 36;
const CAM_Z = 13.5;
const WORLD_H = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180); // ~8.77 world units tall

// ── the wide scene, in world units, vertically centred on y=0 ───────────────
const PERSON_H = 3.0;
const FEET_Y = -PERSON_H / 2;
const HEAD_TOP_Y = PERSON_H / 2;
const TORSO_TOP_Y = HEAD_TOP_Y - 0.55;
const HEAD_CY = TORSO_TOP_Y + 0.32;
const MOUTH = new THREE.Vector3(0.16, HEAD_CY - 0.06, 0.3);
/** The direction breath actually travels: mostly to the side and forward,
 *  only a little up — kept LOW on purpose so the cloud/molecule never rises
 *  into the y 270-450 band the headline text occupies (reel_safe_audit.py
 *  caught the first pass, which sent BREATH_DIR mostly upward and put the
 *  molecule directly behind the hook's own words). */
const BREATH_DIR = new THREE.Vector3(0.82, 0.46, 0.32).normalize();
/** Where the push ends up centred — inside the cloud, not at the mouth itself,
 *  so puffs exist on BOTH sides of the anchor and the cloud reads as
 *  surrounding the molecule rather than the molecule replacing the cloud.
 *  1.05 keeps it inside the cloud's own reach range (below), which is what
 *  keeps the anchor itself inside the safe band before any push happens. */
const MOL_ANCHOR = MOUTH.clone().add(BREATH_DIR.clone().multiplyScalar(0.68));
const WIDE_ANCHOR = new THREE.Vector3(0, 0, 0);

/** breath_data.json's own world units -> this scene's world units. Chosen so
 *  the intact molecule (bbox diameter 15.25 of ITS units) sits at about half
 *  a person-height before any camera push — a plausible "small object hidden
 *  in a breath cloud" scale, not a magic number. */
const MOL_TO_WORLD = 0.075;
const molDiameterWorld = MOLECULE.bbox.diameter * MOL_TO_WORLD;
/** The close-up target size — about half the visible world height — drives
 *  how far the group must zoom, COMPUTED from the actual measured molecule
 *  size rather than tuned by eye. Left with headroom for the fragments'
 *  drift beyond the intact molecule's own bounding box (reel_safe_audit.py
 *  caught the first pass, which used 62% and no margin, bleeding past the
 *  top of the safe band during the split). */
const CLOSE_SCALE = (0.5 * WORLD_H) / molDiameterWorld;

const toWorld = (p: readonly [number, number, number]) =>
  new THREE.Vector3(
    MOL_ANCHOR.x + p[0] * MOL_TO_WORLD,
    MOL_ANCHOR.y + p[1] * MOL_TO_WORLD,
    MOL_ANCHOR.z + p[2] * MOL_TO_WORLD,
  );

/** 0 (wide) -> 1 (pushed into the molecule) -> 0 (back to wide). One curve,
 *  spent on the push at B7's open and the pull-back at B9's open — the
 *  single continuous move SCRIPT.md calls for, never a cut. */
const pushAmountAt = (s: number) =>
  interpolate(s, [13.6, 14.8, BEAT.b8[1] - 0.6, BEAT.b9[0] + 1.2], [0, 1, 1, 0], ease);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// ═══════════════════════════════════════════════════════════════════════
// The molecule: intact ball-and-stick, then the 55 CO2 / 52 H2O split.
// ═══════════════════════════════════════════════════════════════════════

type AtomTarget = { dest: THREE.Vector3; delay: number };

/** Every atom's post-split destination, computed ONCE from the same element
 *  ordering breath.py used (array order is preserved, so the k-th carbon in
 *  MOLECULE.atoms is exactly FRAGMENTS.co2[k]'s carbon, with no separate
 *  index table needed). */
const useAtomTargets = (): AtomTarget[] =>
  useMemo(() => {
    let ci = 0;
    let hi = 0;
    return MOLECULE.atoms.map((a) => {
      if (a.el === 'C') {
        const f = FRAGMENTS.co2[ci];
        ci += 1;
        return { dest: toWorld(f.dest), delay: f.delay };
      }
      if (a.el === 'H') {
        const f = FRAGMENTS.h2o[Math.floor(hi / 2)];
        hi += 1;
        return { dest: toWorld(f.dest), delay: f.delay };
      }
      // The 6 "own" oxygens: a generic upward drift with the CO2-bound
      // majority (110 of 162 product O atoms are CO2-bound) rather than a
      // per-atom destination — no on-screen claim names which specific
      // oxygen goes where, only the fragment COUNTS (asserted in emit_ts.py).
      // Kept in the SAME magnitude range as the real CO2/H2O fragment
      // destinations (norm 2.6-12.4 / 0.97-8.87 in breath_data.json) — the
      // original [0,46,4] was a 4-15x outlier that, scaled up by the
      // camera's own close-up zoom during the pull-back, sent these atoms
      // far enough to blow past the safe area (reel_safe_audit.py caught
      // it at s~22-23, the pull-back window).
      return { dest: toWorld([0, 9, 2]), delay: 0.42 };
    });
  }, []);

const ELEMENT_COLOR: Record<string, string> = { C: ASH, H: BONE, O: ACCENT };
const ELEMENT_R: Record<string, number> = { C: 0.062, H: 0.034, O: 0.058 };

const BondMesh: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; order: number; opacity: number }> = ({
  a,
  b,
  order,
  opacity,
}) => {
  if (opacity <= 0.005) return null;
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const radius = (order === 2 ? 0.026 : 0.016) * (0.6 + 0.4 * (1 - MOL_TO_WORLD)); // world-scale radius
  return (
    <mesh position={mid.toArray()} quaternion={[quat.x, quat.y, quat.z, quat.w]}>
      <cylinderGeometry args={[radius, radius, len, 7]} />
      <meshStandardMaterial
        color={GRAPHITE}
        emissive={GRAPHITE}
        emissiveIntensity={0.5}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

/** The molecule, intact then breaking into 55 CO2 + 52 H2O. `s` is screen
 *  seconds; all motion is a pure function of it (no local state), the same
 *  discipline Boarding.tsx uses for its simulation clock.
 *
 *  VISIBLE ONLY during the push-in window (B7-B9's pull-back) — it used to
 *  render for the full 37s, which put a fully-formed ball-and-stick
 *  structure directly behind the hook's text (B1-B2) and behind the closing
 *  restatement (B11-B12). `envelope` fades it in exactly as the camera
 *  arrives and out exactly as it leaves, matching pushAmountAt's own ramps
 *  so the molecule is only ever on screen while the camera is inside it. */
const Molecule: React.FC<{ s: number }> = ({ s }) => {
  const targets = useAtomTargets();
  const splitFrac = clamp01((s - BEAT.b8[0]) / (BEAT.b8[1] - BEAT.b8[0]));
  const bondOpacity = interpolate(splitFrac, [0, 0.22], [1, 0], ease);
  // EXACTLY pushAmountAt's own keyframes, not a faster/independent ramp —
  // a mismatch (envelope reaching full brightness before the camera push
  // catches up to center it) put the molecule at its brightest during the
  // anchor's worst off-center moment, which is what overflowed the safe
  // area at s~14.0-14.3 (reel_safe_audit.py).
  const envelope = pushAmountAt(s);
  // Nothing is ever perfectly still (non-negotiable 4), including the intact
  // hold — a slow molecular tumble, on a period long enough never to repeat
  // inside the reel.
  const tumble = s * 0.22;

  // envelope <= 0 is handled by opacity alone (below), never an early
  // `return null` — that would skip the useMemo below on some frames and
  // not others, a conditionally-called hook (Stage 3c's own warning).
  const positions = useMemo(
    () =>
      MOLECULE.atoms.map((a, i) => {
        const origin = toWorld([a.x, a.y, a.z]);
        const tgt = targets[i];
        const local = clamp01((splitFrac - tgt.delay * 0.5) / (1 - tgt.delay * 0.5));
        const eased = interpolate(local, [0, 1], [0, 1], ease);
        return origin.clone().lerp(tgt.dest, eased);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [splitFrac],
  );

  return (
    <group rotation={[0, tumble, 0]}>
      {MOLECULE.bonds.map(([i, j, order]) => (
        <BondMesh key={`${i}-${j}`} a={positions[i]} b={positions[j]} order={order} opacity={bondOpacity * envelope} />
      ))}
      {MOLECULE.atoms.map((a, i) => {
        const p = positions[i];
        const color = ELEMENT_COLOR[a.el];
        return (
          <mesh key={i} position={p.toArray()}>
            <sphereGeometry args={[ELEMENT_R[a.el], 10, 10]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              roughness={0.5}
              transparent
              opacity={envelope}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/** Decorative inbound O2 — flavour for "meets the oxygen you breathe in",
 *  no count is claimed on screen so none is asserted. Fades out on the same
 *  pull-back schedule as Molecule's envelope — it used to hold at full
 *  opacity from B8 all the way to the end of the reel, cluttering B9-B12's
 *  wide shots and their text. */
const O2Cloud: React.FC<{ s: number }> = ({ s }) => {
  const frac = clamp01((s - (BEAT.b7[0] - 0.6)) / (BEAT.b8[0] - (BEAT.b7[0] - 0.6)));
  const envelope = pushAmountAt(s);
  if (frac <= 0.01 || envelope <= 0.005) return null;
  return (
    <>
      {O2_INBOUND.map((o, i) => {
        const raw = toWorld(o.dest).clone().lerp(toWorld(o.origin), 1 - interpolate(frac, [o.delay * 0.5, 1], [0, 1], ease));
        // breath_data.json places "inbound" O2 up to ~0.77 world units from
        // MOL_ANCHOR before this scales up with the camera push — enough to
        // clear the safe area's right edge at low push (reel_safe_audit.py
        // caught frames ~405-450). Purely decorative (no count is claimed
        // on screen), so clamped to a radius that stays in-bounds rather
        // than re-deriving the data.
        const off = raw.clone().sub(MOL_ANCHOR);
        const len = off.length();
        const p = len > 0.32 ? MOL_ANCHOR.clone().add(off.multiplyScalar(0.32 / len)) : raw;
        return (
          <group key={i}>
            <mesh position={[p.x - 0.05, p.y, p.z]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.55} transparent opacity={0.85 * envelope} />
            </mesh>
            <mesh position={[p.x + 0.05, p.y, p.z]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.55} transparent opacity={0.85 * envelope} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// The wide scene: person, scale, breath cloud.
// ═══════════════════════════════════════════════════════════════════════

/** A visible chest rise/fall — real breathing, not just useBreath's px-scale
 *  jitter — so the wide shot keeps moving even when nothing else on screen
 *  is (non-negotiable 4; the B2 dead spell reel_motion_audit.py caught). */
const Person: React.FC<{ opacity: number; s: number }> = ({ opacity, s }) => {
  const chest = 1 + 0.075 * Math.sin((2 * Math.PI * s) / 2.6);
  return (
    <group>
      <mesh position={[0, (FEET_Y + TORSO_TOP_Y) / 2, 0]} scale={[chest, 1, chest]}>
        <capsuleGeometry args={[0.38, TORSO_TOP_Y - FEET_Y - 0.76, 6, 12]} />
        <meshStandardMaterial color={ASH} emissive={ASH} emissiveIntensity={0.28} roughness={0.75} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, HEAD_CY, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color={ASH} emissive={ASH} emissiveIntensity={0.28} roughness={0.7} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

const Scale: React.FC<{ dropFrac: number; opacity: number }> = ({ dropFrac, opacity }) => (
  <group position={[0, FEET_Y - 0.09, 0]}>
    <mesh>
      <boxGeometry args={[1.15, 0.16, 0.78]} />
      <meshStandardMaterial color={SLATE} emissive={SLATE} emissiveIntensity={0.3} roughness={0.6} transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, 0.085, 0.31]}>
      <boxGeometry args={[0.6, 0.02, 0.14]} />
      <meshStandardMaterial
        color={dropFrac > 0.5 ? ACCENT : GRAPHITE}
        emissive={dropFrac > 0.5 ? ACCENT : GRAPHITE}
        emissiveIntensity={0.7}
        transparent
        opacity={opacity}
      />
    </mesh>
  </group>
);

/** Breath puffs laid out ALONG the mouth -> MOL_ANCHOR line, so the push
 *  travels INSIDE the cloud rather than past it.
 *
 *  Each puff's `along` now CYCLES (mouth -> reach -> respawns at the mouth)
 *  instead of sitting at a fixed point with only a small wobble — a real
 *  breath is a continuous outward flow, and a static cluster with a
 *  5-hundredths-of-a-unit wiggle read as almost-frozen to
 *  reel_motion_audit.py (a 3.0s dead spell at B2, non-negotiable 4). The
 *  loop period is deliberately NOT a clean divisor of the reel length, so
 *  it never appears to repeat inside 37s. */
const BreathCloud: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const N = 9;
  const PERIOD = 3.4;
  return (
    <>
      {Array.from({ length: N }).map((_, i) => {
        const phase = ((s / PERIOD + i / N) % 1 + 1) % 1; // 0 at mouth .. 1 at (and past) MOL_ANCHOR
        // Reach capped at 0.85 (was 1.25) — the wider range put the
        // farthest puffs' bright pixels at screen x~880-900, past the
        // safe area's x<=870 (reel_safe_audit.py). The cycling itself
        // (phase over time, not the reach distance) is what fixed the
        // motion audit's dead spell, so this can shrink back down.
        const reach = 0.5 + phase * 0.35;
        const base = MOUTH.clone().add(BREATH_DIR.clone().multiplyScalar(reach));
        const wob = 0.04 * Math.sin(s * 1.3 + i * 2.1);
        const p = base.add(new THREE.Vector3(wob, 0.04 * Math.cos(s * 1.1 + i), wob));
        const r = 0.05 + phase * 0.1;
        // fades in leaving the mouth and out approaching full reach, so the
        // respawn at phase=0 is invisible rather than a visible pop
        const lifeFade = Math.sin(Math.PI * phase);
        return (
          <mesh key={i} position={p.toArray()}>
            <sphereGeometry args={[r, 10, 10]} />
            <meshStandardMaterial
              color={BONE}
              emissive={ACCENT}
              emissiveIntensity={0.18}
              transparent
              opacity={opacity * lifeFade * (0.55 - phase * 0.2)}
            />
          </mesh>
        );
      })}
    </>
  );
};

/** The 1 kg block (B9) and its two flows (B10): breath up, water down.
 *  A SEPARATE, schematic object from the molecule — the script deliberately
 *  changes ruler here (kilograms, not atoms), so this is not drawn from
 *  per-atom data, only from PER_KG's own two numbers. */
const KgBlock: React.FC<{ s: number }> = ({ s }) => {
  const appear = interpolate(s, [BEAT.b9[0], BEAT.b9[0] + 0.8], [0, 1], ease);
  if (appear <= 0.01) return null;
  const splitT = interpolate(s, [BEAT.b10[0], BEAT.b10[0] + 2.2], [0, 1], ease);
  const pos = new THREE.Vector3(-1.15, FEET_Y + 0.35, 0.55);
  const upLen = 0.15 + 1.5 * splitT;
  const downLen = 0.1 + 0.42 * splitT;
  return (
    <group position={pos.toArray()}>
      <mesh scale={appear}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color={SLATE} emissive={SLATE} emissiveIntensity={0.35} transparent opacity={0.55 + 0.45 * appear} />
      </mesh>
      {splitT > 0.01 && (
        <mesh position={[0.05, 0.21 + upLen / 2, 0]}>
          <cylinderGeometry args={[0.05, 0.09, upLen, 8]} />
          <meshStandardMaterial color={ASH} emissive={ASH} emissiveIntensity={0.55} transparent opacity={0.85} />
        </mesh>
      )}
      {splitT > 0.01 && (
        <mesh position={[-0.03, -0.21 - downLen / 2, 0]}>
          <cylinderGeometry args={[0.05, 0.03, downLen, 8]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.55} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
};

const Scene: React.FC<{ s: number }> = ({ s }) => {
  const push = pushAmountAt(s);
  const anchor = WIDE_ANCHOR.clone().lerp(MOL_ANCHOR, push);
  const scale = 1 + (CLOSE_SCALE - 1) * push;
  // Nothing ever perfectly still, applied to the ROOT group itself (a CSS
  // transform cannot touch a three.js group — the same idea, restated).
  const bx = 0.03 * Math.sin((2 * Math.PI * s) / 13);
  const by = 0.035 * Math.sin((2 * Math.PI * s) / 17);
  const position: [number, number, number] = [
    -anchor.x * scale + bx,
    -anchor.y * scale + by,
    -anchor.z * scale,
  ];
  const dropFrac = clamp01((s - BEAT.b1[0]) / 2.2);
  const cloudOpacity = interpolate(s, [0.1, 0.9], [0, 1], ease);
  // The push magnifies the whole group, so at full push the person (built
  // for the wide shot) would otherwise become an oversized, fully-opaque
  // fragment bleeding past the canvas edge — reel_safe_audit.py caught this
  // at full opacity. Faded low (never to 0, per SCRIPT.md B7's "silhouette
  // stays faintly visible") keeps it under the audit's luminance floor.
  // Steeper than the first pass: at push=0.3-0.5 the old curve still
  // composited to just above THRESH=55 in reel_safe_audit.py's luminance
  // check (0.31 opacity x ASH's ~157 luminance + background ~ 58), which is
  // why the person's faint edge sliver still failed mid-transition, not
  // just at full zoom.
  const wideOpacity = interpolate(push, [0, 0.15, 1], [1, 0.15, 0.05], ease);

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[-4, 6, 8]} intensity={0.85} />
      <directionalLight position={[5, -3, 5]} intensity={0.3} />
      <group position={position} scale={scale}>
        <Person opacity={wideOpacity} s={s} />
        <Scale dropFrac={dropFrac} opacity={wideOpacity} />
        <BreathCloud s={s} opacity={cloudOpacity} />
        <O2Cloud s={s} />
        <Molecule s={s} />
        <KgBlock s={s} />
      </group>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// 2D copy — one slot, sequential, never crossfading in place (chrome.tsx).
// ═══════════════════════════════════════════════════════════════════════

const Head: React.FC<{ from: number; to: number; lines: string[]; size?: number; hot?: boolean }> = ({
  from,
  to,
  lines,
  size = 58,
  hot = false,
}) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top: 300, left: 60, width: 810, textAlign: 'center' }}>
    {lines.map((l, i) => (
      <div
        key={i}
        style={{
          fontFamily: 'Archivo Black',
          fontSize: size,
          lineHeight: 1.14,
          letterSpacing: -1,
          color: hot ? ACCENT : BONE,
        }}
      >
        {l}
      </div>
    ))}
  </Fade>
);

/** A wrong-answer icon: shape, then a strike drawn across it in the failure
 *  accent — used ONLY here (the beat something is proven wrong), never
 *  decoratively (tokens.ts). */
const WrongIcon: React.FC<{
  x: number;
  shape: 'drop' | 'toilet' | 'flame';
  label: string;
  appearAt: number;
  strikeAt: number;
}> = ({ x, shape, label, appearAt, strikeAt }) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const appear = interpolate(s, [appearAt, appearAt + 0.35], [0, 1], ease);
  const strike = interpolate(s, [strikeAt, strikeAt + 0.35], [0, 1], ease);
  const color = shape === 'flame' ? AMBER : ASH;
  return (
    <div style={{ position: 'absolute', top: 640, left: x - 70, width: 140, opacity: appear, textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto' }}>
        {shape === 'drop' && (
          <div
            style={{
              position: 'absolute',
              inset: 8,
              background: color,
              borderRadius: '0% 50% 50% 50%',
              transform: 'rotate(45deg)',
            }}
          />
        )}
        {shape === 'flame' && (
          <div
            style={{
              position: 'absolute',
              inset: 8,
              background: color,
              borderRadius: '50% 50% 50% 0%',
              transform: 'rotate(-45deg)',
            }}
          />
        )}
        {shape === 'toilet' && (
          <>
            <div style={{ position: 'absolute', top: 14, left: 24, width: 48, height: 26, background: color, borderRadius: 6 }} />
            <div style={{ position: 'absolute', top: 40, left: 8, width: 80, height: 48, background: color, borderRadius: '10px 10px 40px 40px' }} />
          </>
        )}
        {/* the strike — drawn on, not appearing instantly, so the "wrong
            answer" reads as a beat rather than a static label */}
        <div
          style={{
            position: 'absolute',
            top: 46,
            left: -6,
            width: 108 * strike,
            height: 8,
            background: FAIL,
            borderRadius: 4,
            transform: 'rotate(-18deg)',
            transformOrigin: 'left center',
          }}
        />
      </div>
      <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, color: ASH, marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
};

/** Counter — animates 0 -> target between COUNTER_START and COUNTER_LOCK,
 *  matching emit_ts.py exactly (it asserts these bounds against the copy's
 *  own on-screen window). */
const GramsCounter: React.FC<{ x: number; target: number; label: string; color: string }> = ({
  x,
  target,
  label,
  color,
}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const v = Math.round(interpolate(s, [COUNTER_START, COUNTER_LOCK], [0, target], ease));
  const on = interpolate(s, [BEAT.b10[0], BEAT.b10[0] + 8 / FPS], [0, 1], ease);
  return (
    <div style={{ position: 'absolute', top: 1160, left: x - 100, width: 200, textAlign: 'center', opacity: on }}>
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 62, color }}>{v}</div>
      <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, lineHeight: 1.08, color: ASH, marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════

export const Breath: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const breath = useBreath();

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <ReelGround accent={ACCENT} />

      {/* The camera push (B7-B9) has a brief anchor/scale "lag" during its
          ramp — a point near MOL_ANCHOR overshoots past where either the
          wide or the fully-pushed-in state would put it, for about 0.3s
          each way. Tuning the push curve to remove that lag analytically
          proved fragile (reel_safe_audit.py kept catching a new overshoot
          after each constant change), so the 3D layer is hard-clipped to
          the safe box here — belt-and-suspenders on top of the tuning,
          not instead of it. ReelGround stays outside this clip and is
          still full-bleed (non-negotiable 2). */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.side + 4,
          top: SAFE_TOP + 4,
          width: SAFE_W - 8,
          height: SAFE_BOTTOM - SAFE_TOP - 8,
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: -(SAFE.side + 4), top: -(SAFE_TOP + 4), width: REEL_W, height: REEL_H }}>
          <ThreeCanvas
            width={REEL_W}
            height={REEL_H}
            linear
            camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.05, far: 200 }}
            gl={{ antialias: true, alpha: true }}
            style={{ backgroundColor: 'transparent' }}
          >
            <Scene s={s} />
          </ThreeCanvas>
        </div>
      </div>

      {/* Nothing is ever perfectly still, on the 2D layer too (non-negotiable
          4) — every text beat below carries the same imperceptible drift as
          an inner wrapper (Fade sets its OWN transform, so breath goes on
          the div that WRAPS all the Fades, never passed into one). */}
      <div style={{ position: 'absolute', inset: 0, transform: breath }}>
      {/* B1 0.0-3.0 — the payoff object (breath, scale) is already moving
          before the title settles; title rides OVER the action. */}
      <Head from={BEAT.b1[0]} to={BEAT.b1[1]} lines={["YOU DON'T", 'SWEAT FAT OFF.']} size={64} />

      {/* B2 3.0-6.5 — completes the hook sentence, accent colour. */}
      <Head from={BEAT.b2[0]} to={BEAT.b2[1]} lines={['YOU BREATHE', 'IT OUT.']} size={64} hot />

      {/* B3-B5 — the three wrong folk theories, crossed out one at a time,
          all three staying in frame together through B6 (non-negotiable 6:
          the icons are civilian objects the reel keeps returning to), then
          fading as B6 turns the correction into a question. Each icon's OWN
          appear-fade multiplies with this wrapper's fade-out — nested CSS
          opacity composites, it does not need a second Fade. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: interpolate(s, [BEAT.b6[0], BEAT.b6[1]], [1, 0], ease),
        }}
      >
        <WrongIcon x={230} shape="drop" label="NOT SWEAT." appearAt={BEAT.b3[0]} strikeAt={BEAT.b3[0] + 0.5} />
        <WrongIcon x={465} shape="toilet" label="NOT THE TOILET." appearAt={BEAT.b4[0]} strikeAt={BEAT.b4[0] + 0.5} />
        <WrongIcon
          x={700}
          shape="flame"
          label={'NOT "BURNED INTO ENERGY."'}
          appearAt={BEAT.b5[0]}
          strikeAt={BEAT.b5[0] + 0.5}
        />
      </div>

      {/* B6 12.2-14.0 — the question the molecule beat answers. */}
      <Head from={BEAT.b6[0]} to={BEAT.b6[1]} lines={['SO WHERE DOES', 'IT ACTUALLY GO?']} size={58} />

      {/* B7 14.0-17.5 — continuous push into the breath cloud; the real
          molecule, meeting the inbound oxygen. */}
      <Head
        from={BEAT.b7[0]}
        to={BEAT.b7[1]}
        lines={['A MOLECULE OF YOUR FAT MEETS', 'THE OXYGEN YOU BREATHE IN.']}
        size={40}
      />

      {/* B8 17.5-22.0 — the split: the falsifiable "X because Y" beat. */}
      <Head
        from={BEAT.b8[0]}
        to={BEAT.b8[1]}
        lines={['IT BREAKS APART. THE CARBON', 'LEAVES AS THE CO2 YOU BREATHE OUT.']}
        size={38}
        hot
      />

      {/* B9 22.0-25.0 — the ruler, stated once before any number lands. */}
      <Head from={BEAT.b9[0]} to={BEAT.b9[1]} lines={['FOR EVERY KILOGRAM', 'YOU LOSE —']} size={56} />

      {/* B10 25.0-28.0 — the payoff number. Counters tick, not a title card. */}
      <Head from={BEAT.b10[0]} to={BEAT.b10[1]} lines={['840 GRAMS LEAVES AS BREATH.', '160 GRAMS LEAVES AS WATER.']} size={36} />
      <GramsCounter x={190} target={PER_KG.co2Grams} label="LEAVES AS BREATH" color={ASH} />
      <GramsCounter x={750} target={PER_KG.h2oGrams} label="LEAVES AS WATER" color={ACCENT} />

      {/* B11 28.0-33.0 — the 2s+ hold (non-negotiable 5), restated claim. */}
      <Head
        from={BEAT.b11[0]}
        to={BEAT.b11[1]}
        lines={['MOST OF THE WEIGHT YOU LOSE,', 'YOU LITERALLY BREATHE OUT.']}
        size={42}
      />

      {/* B12 33.0-37.0 — the send-channel ask, phone-performable, over the
          same finished visual (no new cut). */}
      <Fade
        from={t(BEAT.b12[0])}
        style={{ position: 'absolute', top: 300, left: 66, width: 798, textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 46, letterSpacing: -1, color: BONE }}>
          SEND THIS TO WHOEVER
        </div>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 46, letterSpacing: -1, color: BONE }}>
          TOLD YOU TO SWEAT IT OFF.
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, color: ASH, marginTop: 18 }}>
          follow — the rest of your body works like this too
        </div>
      </Fade>

      {/* The one-line source credit, low and quiet, present once the number
          the reel is built on has actually landed. */}
      <Fade
        from={t(BEAT.b10[0])}
        style={{ position: 'absolute', top: 1478, left: 60, width: 810, textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: GRAPHITE }}>
          Meerman &amp; Brown, BMJ 2014
        </div>
      </Fade>
      </div>
    </AbsoluteFill>
  );
};
