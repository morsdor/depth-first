import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, ease, t, useBreath } from './lib/chrome';
import { CAP, CLOCK, COPY, DAY, DURATION, FACTS, HP } from './data/thermostat';

/**
 * r020 · I91 — if nobody's home all day, easing off the heat saves money, and the re-heat takes back
 * about three-quarters of the saving, not all of it.
 *
 * ── The spine ────────────────────────────────────────────────────────────
 * Two identical houses on one simulated winter day (the median Dec–Feb day of an NREL typical year,
 * Greensboro NC): one holds 70 °F, one is allowed to drop to 62 °F while nobody is home, 8 AM–5 PM.
 * A two-node RC house model (projects/r020_thermostat/house.py), 243-house sweep, a PREREG written
 * before the first run. emit_ts.py asserts 32 on-screen claims at the screen second their words appear.
 * Silent. No close — the owner waived non-negotiable 9 on 2026-10-06 (SCRIPT.md, change 1).
 *
 * ── The one ruler ────────────────────────────────────────────────────────
 * Gas used so far today, as a share of the HELD house's whole day (100% = what it burns midnight to
 * midnight). The meters count from midnight, so at 8 AM they already read 33% and 36% — the set-back
 * house is still re-warming from yesterday. The leak is drawn but never numbered.
 *
 * ── Everything on screen is the run ──────────────────────────────────────
 * The clock map and every copy time come from data/thermostat.ts (generated), so the words and the
 * data cannot drift. Air colour, furnace flame, smoke, meter needles, leak-arrow thickness and the heat
 * pump's backup-strip glow are all read per frame from the model's 1-minute trace.
 *
 * ── The shot that only exists because this is 3D ─────────────────────────
 * 14.0 s: the camera drops from the street into the right-hand cutaway and down to the furnace, in one
 * move. The camera is fixed; the root group moves, solved each frame so a focus point lands on a chosen
 * screen position (the r015/r016 method).
 */
export const DURATION_SECONDS = DURATION;

const ACCENT = '#AD88FF'; // DOMAIN_ACCENT.data — §1 "Things you touch every day"
const AMBER = '#FFB020'; // one element per frame
const HEAT = '#FF4D4D'; // failure accent — ONLY on the heat pump's backup strip, the beat something goes wrong
const INK = '#E8E6E1';
const DIM = '#81A2C4';
const GRAPHITE = '#274064';
const SLATE = '#0E213E';
const GROUND_FILL = '#040E1F';

const CAM_Z = 8;
const FOV = 30;

// ── helpers ───────────────────────────────────────────────────────────────
const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], ease);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
type RGB = [number, number, number];
const mix = (c1: RGB, c2: RGB, k: number) =>
  `rgb(${Math.round(lerp(c1[0], c2[0], k))},${Math.round(lerp(c1[1], c2[1], k))},${Math.round(lerp(c1[2], c2[2], k))})`;
const COOL_RGB: RGB = [81, 164, 255]; // 62 °F
const WARM_RGB: RGB = [184, 115, 51]; // 70 °F, copper
const FLAME_LO: RGB = [255, 236, 200];
const FLAME_HI: RGB = [255, 140, 40];

/** screen second -> simulated minute of the day, from the generated clock map (a 1 ms pair is a jump). */
const simMinute = (s: number): number => {
  if (s <= CLOCK[0][0]) return CLOCK[0][1];
  for (let i = 0; i < CLOCK.length - 1; i++) {
    const [s0, m0] = CLOCK[i];
    const [s1, m1] = CLOCK[i + 1];
    if (s >= s0 && s <= s1) return s1 > s0 ? m0 + (m1 - m0) * ((s - s0) / (s1 - s0)) : m1;
  }
  return CLOCK[CLOCK.length - 1][1];
};
/** linear sample of a 1,440-point per-minute series. */
const at = (a: number[], m: number) => {
  const x = Math.min(1439, Math.max(0, m));
  const i = Math.floor(x);
  return i >= 1439 ? a[1439] : a[i] + (a[i + 1] - a[i]) * (x - i);
};
/** gas meters are cumulative at the END of each minute. */
const gasAt = (a: number[], m: number) => at(a, m - 1);

const clockText = (m: number) => {
  if (m >= 1439.5) return 'MIDNIGHT';
  const h24 = Math.floor(m / 60) % 24;
  const mm = Math.floor(m % 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
};

// ── the houses (root space; a house's local origin is the centre of its floor) ─
const HW = 0.8; // width
const HD = 0.56; // depth
const WALL_H = 0.5;
const ROOF_H = 0.26;
const HOUSE_X = { hold: -0.45, back: 0.45 } as const;
type Side = 'hold' | 'back';
const FURN = new THREE.Vector3(-0.27, 0.11, -0.12);
const STAT = new THREE.Vector3(0.22, 0.3, -HD / 2 + 0.02);
const CAR_Z = HD / 2 + 0.28;

// ── the camera plan ───────────────────────────────────────────────────────
type Shot = { focus: THREE.Vector3; target: THREE.Vector3; scale: number; rx: number; ry: number };
const T_WIDE = new THREE.Vector3(-0.158, 0.43, 0);
// scale 0.93: at 1.0 the pair spans ~812 px before the orbit sway adds ±12, wider than the 810 px safe column
const WIDE: Shot = { focus: new THREE.Vector3(0, 0.37, 0), target: T_WIDE, scale: 0.93, rx: 0.22, ry: -0.1 };
const INTO: Shot = {
  focus: new THREE.Vector3(HOUSE_X.back, 0.3, 0),
  target: new THREE.Vector3(-0.168, 0.43, 0),
  scale: 1.5,
  rx: 0.26,
  ry: -0.2,
};
const LEAK: Shot = { focus: new THREE.Vector3(0, 0.4, 0), target: new THREE.Vector3(-0.168, 0.42, 0), scale: 0.78, rx: 0.16, ry: -0.2 };
// the heat-pump beat is house-scale on purpose: the backup strip is the whole point and it must be big enough to see
const PUMPS: Shot = { focus: new THREE.Vector3(HOUSE_X.back + 0.23, 0.3, 0), target: new THREE.Vector3(-0.168, 0.43, 0), scale: 1.2, rx: 0.22, ry: -0.2 };

function blend(a: Shot, b: Shot, k: number): Shot {
  return {
    focus: a.focus.clone().lerp(b.focus, k),
    target: a.target.clone().lerp(b.target, k),
    scale: Math.exp(lerp(Math.log(a.scale), Math.log(b.scale), k)),
    rx: lerp(a.rx, b.rx, k),
    ry: lerp(a.ry, b.ry, k),
  };
}

function shotAt(s: number): Shot {
  const [q0] = COPY.question;
  const [l0] = COPY.leak;
  const [p0] = COPY.hp;
  if (s < q0) return WIDE;
  if (s < q0 + 2.2) return blend(WIDE, INTO, ramp(s, q0, q0 + 2.2));
  if (s < 23.5) return INTO;
  if (s < 26.0) return blend(INTO, WIDE, ramp(s, 23.5, 26.0));
  if (s < l0) return WIDE;
  if (s < l0 + 1.0) return blend(WIDE, LEAK, ramp(s, l0, l0 + 1.0));
  if (s < p0 - 0.5) return LEAK;
  if (s < p0 + 0.7) return blend(LEAK, PUMPS, ramp(s, p0 - 0.5, p0 + 0.7));
  return PUMPS;
}

type Root = { pos: THREE.Vector3; euler: THREE.Euler; scale: number };
function rootAt(s: number): Root {
  const shot = shotAt(s);
  // never frozen (non-negotiable 4): a slow bounded orbit on top of every shot
  const sway = 0.07 * Math.sin((2 * Math.PI * s) / 9) + 0.03 * Math.sin((2 * Math.PI * s) / 4.3);
  const euler = new THREE.Euler(shot.rx, shot.ry + sway, 0, 'XYZ');
  const rf = shot.focus.clone().applyEuler(euler);
  const pos = shot.target.clone().sub(rf.multiplyScalar(shot.scale));
  return { pos, euler, scale: shot.scale };
}

const CAMERA = (() => {
  const c = new THREE.PerspectiveCamera(FOV, REEL_W / REEL_H, 0.1, 60);
  c.position.set(0, 0, CAM_Z);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
})();
/** a house-local point -> screen pixels, through the same root transform and camera the scene uses. */
function project(local: THREE.Vector3, side: Side, r: Root) {
  const p = local.clone().add(new THREE.Vector3(HOUSE_X[side], 0, 0));
  const m = new THREE.Matrix4().compose(r.pos, new THREE.Quaternion().setFromEuler(r.euler), new THREE.Vector3(r.scale, r.scale, r.scale));
  p.applyMatrix4(m).project(CAMERA);
  return { x: ((p.x + 1) / 2) * REEL_W, y: ((1 - p.y) / 2) * REEL_H };
}

// ── what is happening, per screen second ──────────────────────────────────
/** 0 = nobody home (car gone), 1 = home. Driven by screen time where the clock is static or replaying. */
function present(s: number, m: number): number {
  const [h0] = COPY.home;
  const [q0] = COPY.question;
  const [l0] = COPY.leak;
  const [p0] = COPY.hp;
  if (s < 5.0) return 1 - ramp(s, 0.3, 2.4);
  if (s < q0) return m < 1005 ? 0 : ramp(m, 1005, 1035);
  if (s < h0) return 0;
  if (s < COPY.flat1[0]) return ramp(s, h0 + 0.1, h0 + 2.0);
  if (s < l0) return 1;
  if (s < p0) return 0;
  return 1;
}

/** what the dial on the wall is SET to (the needle), not what the house measures. */
function setting(side: Side, s: number, m: number): number {
  if (side === 'hold') return 70;
  const [h0] = COPY.home;
  const [q0] = COPY.question;
  const [l0] = COPY.leak;
  if (s < 3.2) return 70;
  if (s < 4.2) return lerp(70, 62, ramp(s, 3.2, 4.2));
  if (s < q0) return m < 1019 ? 62 : lerp(62, 70, ramp(m, 1019, 1024));
  if (s < h0 + 0.7) return 62;
  if (s < h0 + 1.4) return lerp(62, 70, ramp(s, h0 + 0.7, h0 + 1.4));
  if (s < l0) return 70;
  if (s < COPY.hp[0]) return 62;
  return 70;
}

// ── the 3D pieces ─────────────────────────────────────────────────────────
const Edged: React.FC<{
  size: [number, number, number];
  pos: [number, number, number];
  opacity: number;
  fill?: string;
  rot?: [number, number, number];
  edge?: string;
}> = ({ size, pos, opacity, fill = SLATE, rot = [0, 0, 0], edge = DIM }) => {
  const box = useMemo(() => new THREE.BoxGeometry(...size), [size]);
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={box}>
        <meshStandardMaterial color={fill} transparent opacity={0.34 * opacity} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={edge} transparent opacity={0.9 * opacity} />
      </lineSegments>
    </group>
  );
};

const SLOPE = Math.atan2(ROOF_H, HW / 2);
const SLAB = Math.hypot(HW / 2, ROOF_H) + 0.05;
const GABLE = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(-HW / 2, WALL_H);
  sh.lineTo(HW / 2, WALL_H);
  sh.lineTo(0, WALL_H + ROOF_H);
  sh.closePath();
  return sh;
})();

/** Snow falls in CAMERA space, in a column that projects inside x 60–870 / y 270–1540 at any shot. */
const Flake: React.FC<{ i: number; s: number }> = ({ i, s }) => {
  const r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  const r2 = Math.abs(Math.sin(i * 78.233) * 12345.678) % 1;
  const r3 = Math.abs(Math.sin(i * 3.1) * 999.5) % 1;
  const u = (s / (5.5 + 2 * r3) + r2) % 1;
  return (
    <mesh position={[-0.78 + 1.56 * r1 + 0.04 * Math.sin(s * 1.3 + i), 1.2 - 2.1 * u, -0.5 + 0.9 * r3]} scale={0.008 + 0.005 * r2}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={INK} transparent opacity={0.55} />
    </mesh>
  );
};

const Smoke: React.FC<{ s: number; q: number }> = ({ s, q }) => {
  const k = clamp01(q / CAP);
  if (k < 0.02) return null;
  const base = new THREE.Vector3(FURN.x, WALL_H + ROOF_H * 0.62 + 0.12, FURN.z);
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => {
        const u = (s * 0.7 + i / 9) % 1;
        return (
          <mesh key={i} position={[base.x + 0.04 * u + 0.012 * Math.sin(i * 2 + s * 2), base.y + 0.3 * u, base.z]} scale={0.013 + 0.03 * u * (0.4 + k)}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={DIM} transparent opacity={(1 - u) * 0.42 * (0.25 + 0.75 * k)} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

const Furnace: React.FC<{ q: number; s: number; opacity: number }> = ({ q, s, opacity }) => {
  const k = clamp01(q / CAP);
  const flick = 0.88 + 0.12 * Math.sin(s * 31) * Math.sin(s * 17 + 1);
  return (
    <group position={FURN.toArray()}>
      <Edged size={[0.17, 0.2, 0.14]} pos={[0, 0, 0]} opacity={opacity} fill={GRAPHITE} />
      {/* the pilot light is always on, so the furnace reads as a furnace even when idle */}
      <mesh position={[0, 0.115, 0.075]} scale={0.011}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={mix(FLAME_LO, FLAME_HI, 0.3)} transparent opacity={opacity * 0.9} />
      </mesh>
      {k > 0.01 && (
        <group position={[0, 0.15 + 0.07 * k * flick, 0.02]} scale={[0.04 + 0.03 * k, 0.04 + 0.2 * k * flick, 0.04 + 0.03 * k]}>
          <mesh>
            <coneGeometry args={[1, 1, 14]} />
            <meshBasicMaterial color={mix(FLAME_LO, FLAME_HI, 0.35 + 0.5 * k)} transparent opacity={opacity * (0.5 + 0.5 * k)} depthWrite={false} />
          </mesh>
        </group>
      )}
      {k > 0.01 && (
        <group position={[0, 0.14 + 0.05 * k * flick, 0.03]} scale={[0.022 + 0.015 * k, 0.03 + 0.12 * k * flick, 0.022 + 0.015 * k]}>
          <mesh>
            <coneGeometry args={[1, 1, 12]} />
            <meshBasicMaterial color={mix(FLAME_LO, FLAME_LO, 0)} transparent opacity={opacity * (0.35 + 0.55 * k)} depthWrite={false} />
          </mesh>
        </group>
      )}
      {k > 0.01 && (
        <mesh position={[0, 0.17, 0.02]} scale={0.07 + 0.11 * k}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshBasicMaterial color={mix(FLAME_LO, FLAME_HI, 0.7)} transparent opacity={opacity * 0.16 * k} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

const Dial: React.FC<{ temp: number; opacity: number }> = ({ temp, opacity }) => {
  const a = lerp(0.95, -0.95, clamp01((temp - 62) / 8));
  return (
    <group position={STAT.toArray()}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.014, 28]} />
        <meshStandardMaterial color={SLATE} emissive={ACCENT} emissiveIntensity={0.55} transparent opacity={opacity} />
      </mesh>
      <group position={[0, 0, 0.012]} rotation={[0, 0, a]}>
        <mesh position={[0, 0.026, 0]}>
          <boxGeometry args={[0.008, 0.052, 0.006]} />
          <meshBasicMaterial color={INK} transparent opacity={opacity} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.014]} scale={0.007}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={INK} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

const Person: React.FC<{ x: number; z: number; opacity: number }> = ({ x, z, opacity }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.045, 0]}>
      <cylinderGeometry args={[0.016, 0.019, 0.08, 10]} />
      <meshBasicMaterial color={INK} transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, 0.1, 0]} scale={0.02}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color={INK} transparent opacity={opacity} />
    </mesh>
  </group>
);

const FamilyCar: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) => (
  <group position={[x, 0, CAR_Z]}>
    <Edged size={[0.24, 0.06, 0.11]} pos={[0, 0.045, 0]} opacity={opacity} />
    <Edged size={[0.13, 0.05, 0.095]} pos={[-0.01, 0.1, 0]} opacity={opacity} />
    {[0.08, -0.08].map((wx) =>
      [0.058, -0.058].map((wz) => (
        <mesh key={`${wx}${wz}`} position={[wx, 0.022, wz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
          <meshBasicMaterial color={GRAPHITE} transparent opacity={opacity} />
        </mesh>
      )),
    )}
  </group>
);

const House: React.FC<{
  side: Side;
  s: number;
  m: number;
  Ta: number;
  q: number;
  here: number;
  opacity: number;
  furnace: boolean;
  hp: { aux: number; vis: number };
  carFade: number;
}> = ({ side, s, m, Ta, q, here, opacity, furnace, hp, carFade }) => {
  const air = mix(COOL_RGB, WARM_RGB, clamp01((Ta - 62) / 8));
  const carIn = ramp(here, 0.0, 0.4);
  const walk = ramp(here, 0.4, 0.85);
  const personOp = ramp(here, 0.35, 0.5) * opacity;
  const carX = -0.15 + 0.55 * (1 - carIn);
  return (
    <group position={[HOUSE_X[side], 0, 0]}>
      <mesh position={[0, -0.012, 0.06]}>
        <boxGeometry args={[HW + 0.14, 0.012, HD + 0.52]} />
        <meshStandardMaterial color={INK} transparent opacity={0.13} depthWrite={false} />
      </mesh>
      {/* the air itself, coloured by the model's temperature */}
      <mesh position={[0, WALL_H / 2 + 0.01, 0]}>
        <boxGeometry args={[HW - 0.05, WALL_H - 0.03, HD - 0.05]} />
        <meshBasicMaterial color={air} transparent opacity={0.4 * opacity} depthWrite={false} />
      </mesh>
      {/* shell: floor, back, two sides — the front is cut away */}
      <Edged size={[HW, 0.02, HD]} pos={[0, 0, 0]} opacity={opacity} />
      <Edged size={[HW, WALL_H, 0.02]} pos={[0, WALL_H / 2, -HD / 2]} opacity={opacity} />
      <Edged size={[0.02, WALL_H, HD]} pos={[-HW / 2, WALL_H / 2, 0]} opacity={opacity} />
      <Edged size={[0.02, WALL_H, HD]} pos={[HW / 2, WALL_H / 2, 0]} opacity={opacity} />
      {/* roof, snow, back gable */}
      <Edged size={[SLAB, 0.02, HD + 0.08]} pos={[-HW / 4, WALL_H + ROOF_H / 2, 0]} rot={[0, 0, SLOPE]} opacity={opacity} fill={GRAPHITE} />
      <Edged size={[SLAB, 0.02, HD + 0.08]} pos={[HW / 4, WALL_H + ROOF_H / 2, 0]} rot={[0, 0, -SLOPE]} opacity={opacity} fill={GRAPHITE} />
      {[SLOPE, -SLOPE].map((r, i) => (
        <mesh key={i} position={[(i ? 1 : -1) * (HW / 4 - 0.005), WALL_H + ROOF_H / 2 + 0.016, 0]} rotation={[0, 0, r]}>
          <boxGeometry args={[SLAB - 0.04, 0.012, HD + 0.06]} />
          <meshBasicMaterial color={INK} transparent opacity={0.85 * opacity} />
        </mesh>
      ))}
      <mesh position={[0, 0, -HD / 2 + 0.002]}>
        <shapeGeometry args={[GABLE]} />
        <meshStandardMaterial color={SLATE} transparent opacity={0.34 * opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* chimney */}
      <Edged size={[0.05, 0.16, 0.05]} pos={[FURN.x, WALL_H + ROOF_H * 0.62 + 0.04, FURN.z]} opacity={opacity} fill={GRAPHITE} />
      {furnace && <Furnace q={q} s={s} opacity={opacity} />}
      {furnace && <Smoke s={s} q={q} />}
      <AirHandler aux={hp.aux} vis={hp.vis} />
      <OutdoorUnit side={side} s={s} vis={ramp(s, COPY.hp[0] + 0.9, COPY.hp[0] + 1.3) * hp.vis} />
      <Dial temp={setting(side, s, m)} opacity={opacity} />
      {/* the family */}
      {carIn > 0.02 && carFade > 0.01 && <FamilyCar x={carX} opacity={opacity * carFade * carIn} />}
      {personOp > 0.01 &&
        [0, 1].map((i) => (
          <Person key={i} x={lerp(carX - 0.04 + i * 0.05, -0.02 + i * 0.07, walk)} z={lerp(CAR_Z - 0.08, 0.16, walk)} opacity={personOp} />
        ))}
    </group>
  );
};

/** The leak, drawn as arrows through the walls and roof. Thickness is the model's heat flow at that minute. */
const MAX_LEAK = 17500;
const ROOF_NORMAL = [Math.sin(SLOPE), Math.cos(SLOPE)];
const arrowsFor = (side: Side): { o: [number, number, number]; rotZ: number }[] => [
  { o: [side === 'hold' ? -(HW / 2 + 0.03) : HW / 2 + 0.03, WALL_H * 0.55, 0], rotZ: side === 'hold' ? Math.PI / 2 : -Math.PI / 2 },
  { o: [-HW / 4 - 0.05 * ROOF_NORMAL[0], WALL_H + ROOF_H / 2 + 0.05 * ROOF_NORMAL[1], 0], rotZ: SLOPE },
  { o: [HW / 4 + 0.05 * ROOF_NORMAL[0], WALL_H + ROOF_H / 2 + 0.05 * ROOF_NORMAL[1], 0], rotZ: -SLOPE },
];
const Leak: React.FC<{ side: Side; s: number; leak: number; refLeak: number; vis: number }> = ({ side, s, leak, refLeak, vis }) => {
  if (vis < 0.01) return null;
  const R = (v: number) => 0.006 + 0.058 * (v / MAX_LEAK);
  const r = R(leak);
  return (
    <group position={[HOUSE_X[side], 0, 0]}>
      {arrowsFor(side).map(({ o, rotZ }, i) => {
        return (
          <group key={i} position={o} rotation={[0, 0, rotZ]}>
            {/* shaft + head, pointing along local +Y which has been rotated to the outward direction */}
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[r, r, 0.14, 14]} />
              <meshBasicMaterial color={mix(WARM_RGB, FLAME_HI, 0.5)} transparent opacity={0.55 * vis} depthWrite={false} />
            </mesh>
            <mesh position={[0, 0.17, 0]}>
              <coneGeometry args={[r * 1.7, 0.06, 14]} />
              <meshBasicMaterial color={mix(WARM_RGB, FLAME_HI, 0.5)} transparent opacity={0.7 * vis} depthWrite={false} />
            </mesh>
            {/* a reference ring at the HELD house's thickness, so the shrink reads against something fixed */}
            {side === 'back' && (
              <mesh position={[0, 0.07, 0]}>
                <cylinderGeometry args={[R(refLeak), R(refLeak), 0.14, 14]} />
                <meshBasicMaterial color={INK} wireframe transparent opacity={0.28 * vis} />
              </mesh>
            )}
            {/* parcels of heat moving out */}
            {Array.from({ length: 4 }, (_, k) => {
              const u = (s * 0.55 + k / 4 + i * 0.13) % 1;
              return (
                <mesh key={k} position={[0, 0.02 + 0.2 * u, 0]} scale={r * 0.9}>
                  <sphereGeometry args={[1, 8, 8]} />
                  <meshBasicMaterial color={INK} transparent opacity={(1 - u) * 0.8 * vis} depthWrite={false} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

/** The heat pump's indoor air handler: where the backup resistance strip actually lives. Dark until recovery asks for it. */
const AirHandler: React.FC<{ aux: number; vis: number }> = ({ aux, vis }) => {
  if (vis < 0.01) return null;
  const k = clamp01(aux / 34121);
  return (
    <group position={FURN.toArray()}>
      <Edged size={[0.17, 0.2, 0.14]} pos={[0, 0, 0]} opacity={vis} fill={GRAPHITE} />
      {[-0.055, 0, 0.055].map((y) => (
        <mesh key={y} position={[0, y, 0.075]}>
          <boxGeometry args={[0.13, 0.016, 0.01]} />
          <meshStandardMaterial
            color={mix([70, 50, 55], [255, 77, 77], k)}
            emissive={HEAT}
            emissiveIntensity={2.6 * k}
            transparent
            opacity={vis * (0.45 + 0.55 * k)}
          />
        </mesh>
      ))}
      {k > 0.02 && (
        <mesh position={[0, 0, 0.09]} scale={0.1 + 0.16 * k}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={HEAT} transparent opacity={0.2 * k * vis} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

const OutdoorUnit: React.FC<{ side: Side; s: number; vis: number }> = ({ side, s, vis }) => {
  if (vis < 0.01) return null;
  const x = side === 'hold' ? -(HW / 2 + 0.36) : HW / 2 + 0.36;
  return (
    <group position={[x, 0, 0]}>
      <Edged size={[0.26, 0.22, 0.22]} pos={[0, 0.12, 0]} opacity={vis} fill={GRAPHITE} />
      <mesh position={[0, 0.13, 0.112]}>
        <ringGeometry args={[0.062, 0.074, 28]} />
        <meshBasicMaterial color={DIM} transparent opacity={vis} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 0.13, 0.115]} rotation={[0, 0, -s * 12]}>
        {[0, 1, 2, 3].map((b) => (
          <mesh key={b} rotation={[0, 0, (b * Math.PI) / 2]} position={[0, 0.034, 0]}>
            <boxGeometry args={[0.016, 0.066, 0.004]} />
            <meshBasicMaterial color={INK} transparent opacity={0.85 * vis} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Scene: React.FC<{ s: number }> = ({ s }) => {
  const rt = rootAt(s);
  const m = simMinute(s);
  const [l0] = COPY.leak;
  const [p0] = COPY.hp;
  const here = present(s, m);
  const inHp = s >= p0;
  const furnaceOn = inHp ? 0 : 1; // the furnace and the air handler swap at the same instant
  const pumpVis = ramp(s, p0, p0 + 0.5);
  const carFade = 1 - ramp(rt.scale, 1.12, 1.3);
  // the held house leaves just as each close-up move begins and returns once the pull-back has settled:
  // mid-move its left wall sits under x = 60, and a half-faded house still draws bright edges there
  const [q0] = COPY.question;
  const holdOp = s < q0 ? 1 : s < 25.6 ? 1 - ramp(s, q0, q0 + 0.25) : s < p0 - 0.7 ? ramp(s, 25.6, 26.0) * (1 - ramp(s, p0 - 0.7, p0 - 0.4)) : 0;
  const leakVis = ramp(s, l0 + 0.3, l0 + 1.1) * (1 - ramp(s, p0 - 1.1, p0 - 0.6));
  const Tahold = inHp ? at(HP.hold.Ta, m) : at(DAY.hold.Ta, m);
  const Taback = inHp ? at(HP.back.Ta, m) : at(DAY.back.Ta, m);
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 8]} intensity={0.8} />
      <directionalLight position={[-6, -2, 4]} intensity={0.3} />
      <group position={[-0.168, 0.12, 0]}>
        {Array.from({ length: 60 }, (_, i) => (
          <Flake key={i} i={i} s={s} />
        ))}
      </group>
      <group position={rt.pos.toArray()} rotation={rt.euler} scale={rt.scale}>
        {/* snow-covered ground, and snow that never stops falling */}
        <House side="hold" s={s} m={m} Ta={Tahold} q={at(DAY.hold.q, m)} here={here} opacity={holdOp} furnace={furnaceOn > 0.5 && holdOp > 0.05} hp={{ aux: at(HP.hold.aux, m), vis: pumpVis * holdOp }} carFade={carFade} />
        <House side="back" s={s} m={m} Ta={Taback} q={at(DAY.back.q, m)} here={here} opacity={1} furnace={furnaceOn > 0.5} hp={{ aux: at(HP.back.aux, m), vis: pumpVis }} carFade={carFade} />
        <Leak side="hold" s={s} leak={at(DAY.hold.leak, m)} refLeak={at(DAY.hold.leak, m)} vis={leakVis} />
        <Leak side="back" s={s} leak={at(DAY.back.leak, m)} refLeak={at(DAY.hold.leak, m)} vis={leakVis} />
      </group>
    </>
  );
};

// ── text and instruments (HTML overlay) ───────────────────────────────────
const Head: React.FC<{ win: [number, number]; lines: string[]; size?: number; top?: number }> = ({ win, lines, size = 44, top = 300 }) => (
  <Fade from={t(win[0])} to={t(win[1])} style={{ position: 'absolute', top, left: 70, width: 790, textAlign: 'center' }}>
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily: 'Archivo Black', fontSize: size, lineHeight: 1.16, letterSpacing: -1, color: INK }}>
        {l}
      </div>
    ))}
  </Fade>
);

const Tag: React.FC<{ win: [number, number]; top: number; text: string; color?: string; size?: number }> = ({ win, top, text, color = DIM, size = 36 }) => (
  <Fade from={t(win[0])} to={t(win[1])} style={{ position: 'absolute', top, left: 70, width: 790, textAlign: 'center' }}>
    <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: size, letterSpacing: 3, color }}>{text}</div>
  </Fade>
);

const Meter: React.FC<{ cx: number; top: number; pct: number; color: string; opacity: number }> = ({ cx, top, pct, color, opacity }) => {
  const angle = -130 + 260 * (clamp01(pct / 100));
  const ticks = Array.from({ length: 11 }, (_, i) => -130 + 26 * i);
  return (
    <div style={{ position: 'absolute', left: cx - 190, top, width: 380, opacity, textAlign: 'center' }}>
      <svg width={260} height={230} viewBox="0 0 260 230" style={{ display: 'block', margin: '0 auto' }}>
        <circle cx={130} cy={118} r={104} fill={SLATE} fillOpacity={0.7} stroke={DIM} strokeWidth={3} />
        {ticks.map((a, i) => (
          <line
            key={i}
            x1={130}
            y1={118 - 104}
            x2={130}
            y2={118 - (i % 5 === 0 ? 80 : 90)}
            stroke={DIM}
            strokeWidth={i % 5 === 0 ? 4 : 2}
            transform={`rotate(${a} 130 118)`}
          />
        ))}
        <line x1={130} y1={118} x2={130} y2={118 - 82} stroke={color} strokeWidth={6} strokeLinecap="round" transform={`rotate(${angle} 130 118)`} />
        <circle cx={130} cy={118} r={9} fill={color} />
      </svg>
      <div style={{ fontFamily: 'Archivo Black', fontSize: 58, letterSpacing: -1, color: INK, marginTop: -8 }}>{Math.round(pct)}%</div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 36, letterSpacing: 1, color: DIM }}>GAS USED TODAY</div>
    </div>
  );
};

export const Thermostat: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const breath = useBreath();
  const m = simMinute(s);
  const rt = rootAt(s);

  const pctHold = gasAt(DAY.hold.gas, m);
  const pctBack = gasAt(DAY.back.gas, m);
  const meterOp = ramp(s, 1.4, 2.0) * (1 - ramp(s, COPY.leak[0] - 0.4, COPY.leak[0]));
  const win = (w: [number, number], f = 0.3) => ramp(s, w[0], w[0] + f) * (1 - ramp(s, w[1] - f, w[1]));
  // the labels hand over to the verdict at 11 s; they would sit on top of it
  const labelOp = ramp(s, COPY.labels[0], COPY.labels[0] + 0.5) * (1 - ramp(s, COPY.verdict[0] - 0.6, COPY.verdict[0]));
  // the label rides on its own house, above the roof — a label centred on the dial ran past the safe edge
  const lblHold = project(new THREE.Vector3(0, WALL_H + ROOF_H + 0.16, 0), 'hold', rt);
  const lblBack = project(new THREE.Vector3(0, WALL_H + ROOF_H + 0.16, 0), 'back', rt);
  const clockOp = ramp(s, 4.6, 5.2) * (1 - ramp(s, COPY.leak[0] - 0.4, COPY.leak[0])) * (1 - win(COPY.verdict)) * (1 - win(COPY.threeq));
  const leadOp = ramp(s, COPY.threeq[0] + 0.3, COPY.threeq[0] + 0.9) * (1 - ramp(s, COPY.threeq[1] - 0.4, COPY.threeq[1]));
  const lead = pctHold - pctBack;

  return (
    <AbsoluteFill style={{ backgroundColor: GROUND_FILL }}>
      <ReelGround accent={ACCENT} />
      <AbsoluteFill style={{ transform: breath }}>
        <ThreeCanvas
          width={REEL_W}
          height={REEL_H}
          linear
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true }}
          style={{ backgroundColor: 'transparent' }}
        >
          <Scene s={s} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* labels that ride on the thermostats */}
      <div style={{ position: 'absolute', left: lblHold.x, top: lblHold.y, transform: 'translate(-50%,-100%)', opacity: labelOp }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 36, letterSpacing: -0.5, color: INK, whiteSpace: 'nowrap' }}>HOLDS 70°</div>
      </div>
      <div style={{ position: 'absolute', left: lblBack.x, top: lblBack.y, transform: 'translate(-50%,-100%)', opacity: labelOp }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 36, letterSpacing: -0.5, color: ACCENT, whiteSpace: 'nowrap' }}>DROPS TO 62°</div>
      </div>

      {/* the clock */}
      <div style={{ position: 'absolute', top: 1026, left: 70, width: 790, textAlign: 'center', opacity: clockOp }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 46, letterSpacing: 4, color: DIM }}>{clockText(m)}</div>
      </div>

      {/* the two gas meters — one ruler: % of the HELD house's whole day */}
      <Meter cx={262} top={1072} pct={pctHold} color={INK} opacity={meterOp} />
      <Meter cx={667} top={1072} pct={pctBack} color={ACCENT} opacity={meterOp} />

      {/* the lead, on the same ruler */}
      <Fade from={t(COPY.threeq[0] + 0.3)} to={t(COPY.threeq[1])} style={{ position: 'absolute', top: 1026, left: 70, width: 790, textAlign: 'center', opacity: leadOp }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 36, letterSpacing: 2, color: DIM }}>
          LEAD AT 5 PM: {FACTS.lead5} · NOW: <span style={{ color: AMBER }}>{Math.round(lead)}</span>
        </div>
      </Fade>

      {/* B1 · the belief */}
      <Head win={COPY.hook} lines={['“IT COSTS MORE TO HEAT', 'THE HOUSE BACK UP.”']} size={46} />
      {/* B2 · the setup */}
      <Head win={COPY.same} lines={['SAME HOUSE.', `SAME ${FACTS.outdoor}° OUTSIDE.`]} size={46} />
      {/* B3/B4 · the verdict */}
      <Fade from={t(COPY.verdict[0])} to={t(COPY.verdict[1])} style={{ position: 'absolute', top: 300, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 44, lineHeight: 1.16, letterSpacing: -1, color: INK }}>THE 62° HOUSE USED</div>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 64, lineHeight: 1.1, letterSpacing: -1, color: AMBER }}>{FACTS.verdictPct}% LESS GAS.</div>
      </Fade>
      <Tag win={COPY.verdict} top={1026} text="SIMULATED · ONE WINTER DAY" />
      {/* B5 · the question */}
      <Head win={COPY.question} lines={['SO WHAT HAPPENS', 'AT 5 PM?']} size={52} />
      {/* B6 · home */}
      <Head win={COPY.home} lines={["5 PM. THEY'RE HOME.", 'THE HOUSE IS 62°.']} size={46} />
      {/* B7 · the roar, in two stages */}
      <Head win={COPY.flat1} lines={['THE FURNACE GOES FLAT OUT']} size={46} />
      <Fade from={t(COPY.flat2[0])} to={t(COPY.flat2[1])} style={{ position: 'absolute', top: 370, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 58, lineHeight: 1.1, letterSpacing: -1, color: INK }}>FOR 1 HOUR.</div>
      </Fade>
      {/* B8 · the give-back */}
      <Head win={COPY.threeq} lines={['THE RE-HEAT TAKES BACK', 'ABOUT ¾ OF WHAT IT SAVED —', 'NOT ALL.']} size={40} />
      {/* B9 · the reason */}
      <Head win={COPY.leak} lines={['A COOLER HOUSE', 'LEAKS LESS HEAT.']} size={50} />
      {/* B10 · scope */}
      {/* no close (owner's waiver): the last caption holds to the final frame instead of fading out in the last 5 */}
      <Head win={[COPY.hp[0], COPY.hp[1] + 1]} lines={['HEAT PUMP? A BIG DROP', 'CAN COST MORE.']} size={46} />
      <Tag win={[COPY.hp[0] + 0.4, COPY.hp[1] + 1]} top={1180} text="SIMULATED" />

      {/* the credit, throughout */}
      <div style={{ position: 'absolute', top: 1456, left: 70, width: 790, textAlign: 'center', opacity: 0.8 }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 400, fontSize: 36, lineHeight: 1.08, letterSpacing: 0, color: DIM }}>WEATHER · NREL TYPICAL YEAR</div>
        <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 400, fontSize: 36, lineHeight: 1.08, letterSpacing: 0, color: DIM }}>GREENSBORO NC · SIMULATED</div>
      </div>
    </AbsoluteFill>
  );
};
