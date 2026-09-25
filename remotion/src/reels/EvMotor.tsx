import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, ease, t, useBreath } from './lib/chrome';
import { BEAT, DOLLARS, FLEET, MOTOR, PARTICLES, TRAVEL, motorAt, type Particle } from './data/evmotor';

/**
 * r016 · I85 — of every $100 you pay for, how much reaches the wheels?
 *
 * ── The spine ────────────────────────────────────────────────────────────
 * Gas car (2016 Camry) $23, electric car (2017 Bolt) $64, on the EPA combined
 * cycle, run in NREL's FASTSim and validated against EPA's sticker figures
 * (projects/r016_evmotor/energy_budget.py). Both sit inside DOE's own published
 * figures, and across all 51 cars in the FASTSim database every EV beats every
 * gas car (fleet_sweep.py). emit_ts.py asserts 15 on-screen claims.
 *
 * ── The one ruler ────────────────────────────────────────────────────────
 * Dollars of every $100 you pay for that reach the wheels. Each car carries
 * exactly 100 particles, one per dollar; the ones bound for the wheels ARE the
 * figure, so every counter on screen is a literal count of particles arriving.
 *
 * ── The shot that only exists because this is 3D ─────────────────────────
 * One continuous move from a 3/4 view of two cars, through the floor of the
 * electric one, rotating round to look down the motor's own axle until the
 * motor fills the frame end-on. Camera fixed; the root group moves, and its
 * position is solved each frame (position = C - scale * R(focus)) so the
 * focus point stays on screen centre through any scale or rotation — the
 * r015 method, generalised to two rotation axes.
 *
 * ── The motor is computed, not drawn ─────────────────────────────────────
 * 12 slots, 2 poles, 60° phase belts, balanced three-phase currents. Each
 * frame's electrical angle and rotor angle come from motor.py; the coil glow
 * below is cos(wt - 2πp/3)·sign — the same currents the Python asserted sum to
 * zero and put the field at wt + axisA. The rotor lags the field (motoring)
 * everywhere except braking, where it leads (generating). Both are asserted.
 */
export const DURATION_SECONDS = 42;

const ACCENT = '#51A4FF'; // DOMAIN_ACCENT.languages — §3
const HEAT = '#FF4D4D'; // failure accent — ONLY on energy that is lost
const INK = '#E8E6E1';
const DIM = '#81A2C4';
const GRAPHITE = '#274064';
const SLATE = '#0E213E';
const GROUND_FILL = '#040E1F';

const CAM_Z = 8;
const FOV = 30;
/** Centre of the Instagram safe column (x 60-870, y 270-1540) in world units at z=0. */
const SCREEN_C = new THREE.Vector3(-0.148, 0.12, 0);

// ── layout (root space; cars are never rotated relative to the root) ──────
const GAS_POS = new THREE.Vector3(0, 0.46, 0);
const EV_POS = new THREE.Vector3(0, -0.66, 0);

// ── the car, in car-local units: length along X (front +X), width Z, up Y ─
const WHEEL_R = 0.14;
const WHEEL_X = 0.48;
const WHEEL_Z = 0.33;
const ENGINE_LOCAL = new THREE.Vector3(0.45, 0.28, 0);
const MOTOR_LOCAL = new THREE.Vector3(-WHEEL_X, WHEEL_R, 0);
const INLET_LOCAL = new THREE.Vector3(-0.55, 0.36, 0.31);
const BATTERY_LOCAL = new THREE.Vector3(0.02, 0.1, 0);

// ── the motor, motor-local units (axis along Z, so a side-on camera sees it end-on)
const STATOR_R = 0.098;
const COIL_R = 0.086;
const ROTOR_R = 0.066;

const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], ease);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const mix = (c1: [number, number, number], c2: [number, number, number], k: number) =>
  `rgb(${Math.round(lerp(c1[0], c2[0], k))},${Math.round(lerp(c1[1], c2[1], k))},${Math.round(lerp(c1[2], c2[2], k))})`;
const COPPER_RGB: [number, number, number] = [184, 115, 51];
const ACCENT_RGB: [number, number, number] = [81, 164, 255];
const ASH_RGB: [number, number, number] = [129, 162, 196];

// ── the camera plan ───────────────────────────────────────────────────────
type Shot = { focus: THREE.Vector3; scale: number; rx: number; ry: number };
const WIDE: Shot = { focus: new THREE.Vector3(0, 0, 0), scale: 1, rx: 0.3, ry: -0.55 };
const ENGINE: Shot = { focus: GAS_POS.clone().add(ENGINE_LOCAL), scale: 2.5, rx: 0.42, ry: -0.95 };
const INTO_EV: Shot = { focus: EV_POS.clone().add(MOTOR_LOCAL), scale: 2.8, rx: 0.36, ry: -0.5 };
const END_ON: Shot = { focus: EV_POS.clone().add(MOTOR_LOCAL), scale: 7.2, rx: 0.0, ry: 0.0 };
const BRAKE: Shot = { focus: EV_POS.clone().add(new THREE.Vector3(0.0, 0.22, 0)), scale: 1.0, rx: 0.3, ry: -0.4 };

function blend(a: Shot, b: Shot, k: number): Shot {
  return {
    focus: a.focus.clone().lerp(b.focus, k),
    scale: Math.exp(lerp(Math.log(a.scale), Math.log(b.scale), k)),
    rx: lerp(a.rx, b.rx, k),
    ry: lerp(a.ry, b.ry, k),
  };
}

function shotAt(s: number): Shot {
  const [g0, g1] = BEAT.gas;
  const [m0] = BEAT.motor;
  const [f0] = BEAT.field;
  const [b0] = BEAT.brake;
  const [p0] = BEAT.payoff;
  if (s < g0) return WIDE;
  if (s < g1 - 0.6) return blend(WIDE, ENGINE, ramp(s, g0, g0 + 1.6));
  if (s < m0) return blend(ENGINE, WIDE, ramp(s, g1 - 0.6, m0));
  if (s < f0) return blend(WIDE, INTO_EV, ramp(s, m0, m0 + 2.4));
  if (s < b0) return blend(INTO_EV, END_ON, ramp(s, f0 - 0.6, f0 + 1.4));
  if (s < p0) return blend(END_ON, BRAKE, ramp(s, b0, b0 + 1.6));
  return blend(BRAKE, WIDE, ramp(s, p0, p0 + 1.6));
}

// ── the $100 of particles ─────────────────────────────────────────────────
/** Local-time replay of a car's 100 dollars. Returns car-local position, or null. */
function particlePos(p: Particle, sl: number, kind: 'gas' | 'ev'): { pos: THREE.Vector3; heat: boolean; a: number } | null {
  const u = (sl - p.t0) / TRAVEL;
  if (u < 0 || u > 1.25) return null;
  const hub = kind === 'gas' ? ENGINE_LOCAL : MOTOR_LOCAL;
  // enters from just above the car's rear, never from off-frame or up into the header band
  const start = INLET_LOCAL.clone().add(new THREE.Vector3(0.28 + 0.06 * p.jitter, 0.3, 0.08));
  const pos = new THREE.Vector3();
  if (u < 0.35) {
    pos.copy(start).lerp(INLET_LOCAL, u / 0.35);
    return { pos, heat: false, a: 1 };
  }
  if (u < 0.6) {
    pos.copy(INLET_LOCAL).lerp(hub, (u - 0.35) / 0.25);
    return { pos, heat: false, a: 1 };
  }
  const k = Math.min(1, (u - 0.6) / 0.4);
  if (p.wheel) {
    if (u > 1) return null; // absorbed by the wheel
    const wx = kind === 'gas' ? WHEEL_X : -WHEEL_X;
    const wheel = new THREE.Vector3(wx, WHEEL_R, p.wheelIdx ? WHEEL_Z : -WHEEL_Z);
    pos.copy(hub).lerp(wheel, k);
    return { pos, heat: false, a: 1 };
  }
  // lost as heat: rises and drifts out of the car, fading
  const kk = (u - 0.6) / 0.65;
  pos.set(hub.x + 0.18 * p.jitter * kk, hub.y + 0.45 * kk, hub.z + 0.12 * Math.sin(6 * kk + p.jitter * 3));
  return { pos, heat: true, a: Math.max(0, 1 - kk) };
}

const Particles: React.FC<{ kind: 'gas' | 'ev'; sl: number; opacity: number }> = ({ kind, sl, opacity }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  if (opacity < 0.01) return null;
  return (
    <>
      {PARTICLES[kind].map((p, i) => {
        const r = particlePos(p, sl, kind);
        if (!r) return null;
        return (
          <mesh key={i} geometry={geo} position={r.pos.toArray()} scale={r.heat ? 0.022 : 0.018}>
            <meshBasicMaterial color={r.heat ? HEAT : ACCENT} transparent opacity={opacity * r.a} />
          </mesh>
        );
      })}
    </>
  );
};

/** Count of dollars that have finished their path by local time sl. */
const arrived = (kind: 'gas' | 'ev', sl: number, wheel: boolean) =>
  PARTICLES[kind].filter((p) => p.wheel === wheel && p.t0 + TRAVEL <= sl).length;

// ── the car body ──────────────────────────────────────────────────────────
const Edged: React.FC<{
  size: [number, number, number];
  pos: [number, number, number];
  opacity: number;
  fill?: string;
}> = ({ size, pos, opacity, fill = SLATE }) => {
  const box = useMemo(() => new THREE.BoxGeometry(...size), [size]);
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);
  return (
    <group position={pos}>
      <mesh geometry={box}>
        <meshStandardMaterial color={fill} transparent opacity={0.38 * opacity} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={DIM} transparent opacity={0.9 * opacity} />
      </lineSegments>
    </group>
  );
};

const Wheel: React.FC<{ x: number; z: number; spin: number; opacity: number; glow: number }> = ({
  x,
  z,
  spin,
  opacity,
  glow,
}) => (
  <group position={[x, WHEEL_R, z]} rotation={[Math.PI / 2, spin, 0]}>
    <mesh>
      <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.1, 28]} />
      <meshStandardMaterial
        color={GRAPHITE}
        emissive={ACCENT}
        emissiveIntensity={0.9 * glow}
        transparent
        opacity={opacity}
      />
    </mesh>
    {/* spokes, so the turn reads */}
    {[0, 1, 2].map((k) => (
      <mesh key={k} position={[0, 0.052, 0]} rotation={[0, (k * Math.PI) / 3, 0]}>
        <boxGeometry args={[WHEEL_R * 1.7, 0.006, 0.018]} />
        <meshBasicMaterial color={DIM} transparent opacity={opacity} />
      </mesh>
    ))}
  </group>
);

const CarBody: React.FC<{
  opacity: number;
  nearFade: number;
  wheels?: number;
  spin: number;
  glowFront: number;
  glowRear: number;
}> = ({
  opacity,
  nearFade,
  wheels = 1,
  spin,
  glowFront,
  glowRear,
}) => (
  <>
    <Edged size={[1.5, 0.28, 0.62]} pos={[0, 0.25, 0]} opacity={opacity * nearFade} />
    <Edged size={[0.76, 0.22, 0.56]} pos={[-0.1, 0.5, 0]} opacity={opacity * nearFade} />
    {[WHEEL_X, -WHEEL_X].map((x) =>
      [WHEEL_Z, -WHEEL_Z].map((z) => (
        <Wheel
          key={`${x}${z}`}
          x={x}
          z={z}
          spin={spin}
          opacity={opacity * wheels * (z > 0 ? nearFade : 1)}
          glow={x > 0 ? glowFront : glowRear}
        />
      )),
    )}
  </>
);

// ── the gas engine: 4 cylinders, firing order 1-3-4-2 ─────────────────────
const FIRE_DEG = [0, 540, 180, 360];
const Engine: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const crank = (s * 2.2 * 360) % 720; // degrees, 2.2 rev/s of screen time
  return (
    <group position={ENGINE_LOCAL.toArray()}>
      <Edged size={[0.34, 0.2, 0.3]} pos={[0, 0, 0]} opacity={opacity} fill={GRAPHITE} />
      {FIRE_DEG.map((fd, i) => {
        const up = Math.cos(((crank - fd) * Math.PI) / 180);
        const since = (crank - fd + 720) % 720;
        const flash = Math.exp(-since / 50);
        return (
          <group key={i} position={[-0.12 + i * 0.08, 0, 0]}>
            <mesh position={[0, 0.03 + 0.045 * up, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.05, 16]} />
              <meshStandardMaterial color={DIM} transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.13, 0]} scale={0.012 + 0.022 * flash}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshBasicMaterial color={HEAT} transparent opacity={opacity * (0.15 + 0.85 * flash)} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ── the electric motor, computed per frame ────────────────────────────────
const Motor: React.FC<{ frame: number; opacity: number; open: number; generator: number }> = ({
  frame,
  opacity,
  open,
  generator,
}) => {
  const [wt, rotor] = motorAt(frame);
  const field = wt + MOTOR.axisA;
  return (
    <group position={MOTOR_LOCAL.toArray()}>
      {/* back iron */}
      <mesh position={[0, 0, -0.03]}>
        <ringGeometry args={[COIL_R - 0.014, STATOR_R + 0.008, 64]} />
        <meshStandardMaterial color={GRAPHITE} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      {/* 12 coils — brightness is the computed three-phase drive */}
      {Array.from({ length: MOTOR.nSlots }, (_, k) => {
        const a = (2 * Math.PI * k) / MOTOR.nSlots;
        const drive = Math.cos(wt - (2 * Math.PI * MOTOR.slotPhase[k]) / 3) * MOTOR.slotSign[k];
        const lit = Math.max(0, drive);
        return (
          <group key={k} rotation={[0, 0, a]}>
            <mesh position={[COIL_R, 0, 0]}>
              <boxGeometry args={[0.02, 0.03, 0.06]} />
              <meshStandardMaterial
                color={mix(COPPER_RGB, ACCENT_RGB, lit)}
                emissive={ACCENT}
                emissiveIntensity={1.4 * lit}
                transparent
                opacity={opacity}
              />
            </mesh>
            <mesh position={[COIL_R, 0, 0.032]} scale={0.011 + 0.014 * lit}>
              <circleGeometry args={[1, 20]} />
              <meshBasicMaterial color={ACCENT} transparent opacity={opacity * 0.55 * lit} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
      {/* the rotor — one N/S magnet pair, spinning at the computed angle */}
      <group rotation={[0, 0, rotor]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[ROTOR_R, ROTOR_R, 0.055, 40]} />
          <meshStandardMaterial color={SLATE} transparent opacity={opacity} />
        </mesh>
        {/* N and S halves of one magnet pair: circleGeometry lies in the motor plane, facing the camera */}
        <mesh position={[0, 0, 0.029]}>
          <circleGeometry args={[ROTOR_R * 0.9, 40, -Math.PI / 2, Math.PI]} />
          <meshBasicMaterial color={INK} transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, 0, 0.029]}>
          <circleGeometry args={[ROTOR_R * 0.9, 40, Math.PI / 2, Math.PI]} />
          <meshBasicMaterial color={mix(ASH_RGB, ACCENT_RGB, 0.25)} transparent opacity={opacity * 0.85} />
        </mesh>
        <mesh position={[0, 0, 0.034]}>
          <circleGeometry args={[0.012, 20]} />
          <meshBasicMaterial color={GRAPHITE} transparent opacity={opacity} />
        </mesh>
      </group>
      {/* the field direction */}
      <group rotation={[0, 0, field]}>
        <mesh position={[0.04, 0, 0.04]}>
          <boxGeometry args={[0.07, 0.006, 0.002]} />
          <meshBasicMaterial color={generator > 0.5 ? DIM : ACCENT} transparent opacity={opacity * 0.9} depthTest={false} />
        </mesh>
      </group>
      {/* the housing, which splits open along the axle */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[0, 0, side * (0.05 + 0.16 * open)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[STATOR_R + 0.014, STATOR_R + 0.014, 0.03, 48, 1, true]} />
          <meshStandardMaterial
            color={DIM}
            transparent
            opacity={opacity * Math.max(0, 0.85 - 0.85 * open)}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

const FleetRow: React.FC<{ type: 'Conv' | 'BEV'; opacity: number; s: number }> = ({ type, opacity, s }) => {
  const cars = FLEET.filter((c) => c.type === type)
    .slice()
    .sort((a, b) => a.toWheels - b.toWheels);
  const [p0] = BEAT.payoff;
  const cols = 15;
  return (
    <group position={[0.12, 0, 0.62]}>
      {cars.map((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = -0.55 + (1.1 * col) / (cols - 1);
        const pop = ramp(s, p0 + 1.0 + i * 0.04, p0 + 1.4 + i * 0.04);
        // each mini car's wheel-glow is its own measured figure
        return (
          <group key={c.name} position={[x, 0, 0.16 * row]} scale={0.06 * pop}>
            <mesh position={[0, 0.9, 0]}>
              <boxGeometry args={[1.5, 0.55, 0.7]} />
              <meshStandardMaterial color={SLATE} transparent opacity={opacity * pop} />
            </mesh>
            <mesh position={[-0.1, 1.35, 0]}>
              <boxGeometry args={[0.8, 0.4, 0.62]} />
              <meshStandardMaterial color={SLATE} transparent opacity={opacity * pop} />
            </mesh>
            {[0.5, -0.5].map((wx) => (
              <mesh key={wx} position={[wx, 0.32, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.32, 0.32, 0.12, 14]} />
                <meshBasicMaterial
                  color={type === 'BEV' ? ACCENT : DIM}
                  transparent
                  opacity={opacity * pop * (0.25 + c.toWheels)}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};

const Scene: React.FC<{ s: number; frame: number }> = ({ s, frame }) => {
  const shot = shotAt(s);
  // never frozen (non-negotiable 4): a small bounded sway on top of every shot
  const sway = 0.05 * Math.sin((2 * Math.PI * s) / 7);
  const euler = new THREE.Euler(shot.rx, shot.ry + sway, 0, 'XYZ');
  const rf = shot.focus.clone().applyEuler(euler);
  const pos = SCREEN_C.clone().sub(rf.multiplyScalar(shot.scale));

  const [h0] = BEAT.hook;
  const [g0, g1] = BEAT.gas;
  const [m0] = BEAT.motor;
  const [f0] = BEAT.field;
  const [b0, b1] = BEAT.brake;
  const [p0] = BEAT.payoff;

  // visibility of each car per beat
  const gasOn = s < g1 ? 1 : 1 - ramp(s, g1 - 0.4, m0 + 0.4);
  // only once the pull-back has settled: mid-move the gas car sits up in the header band
  const gasBack = ramp(s, p0 + 1.3, p0 + 2.2);
  const gasOpacity = Math.max(gasOn, gasBack);
  const evOpacity = s < g0 ? 1 : s < g1 ? 1 - ramp(s, g0, g0 + 1.0) : ramp(s, g1 - 0.6, m0 + 0.2);
  const evNear = s < m0 + 0.8 ? 1 : s < b0 ? 1 - ramp(s, m0 + 0.8, m0 + 2.2) : ramp(s, b0, b0 + 1.2);
  const evBody = s < m0 ? 1 : s < b0 ? 1 - 0.7 * ramp(s, m0 + 1.0, m0 + 2.6) : lerp(0.3, 1, ramp(s, b0, b0 + 1.4));
  // the field beat looks straight down the axle, so every wheel is in the way: clear them all
  const evWheels = s < f0 - 0.8 ? 1 : s < b0 ? 1 - ramp(s, f0 - 0.8, f0 + 0.2) : ramp(s, b0, b0 + 1.0);

  // particle clocks (local replay time)
  const hookSl = s - h0;
  const ambient = (s - p0) % 2.6;
  const gasSl = s < g0 ? hookSl : s < m0 ? (s - GAS_REPLAY_START) * GAS_REPLAY_RATE : s >= p0 ? ambient : -9;
  const evSl = s < g0 ? hookSl : s >= p0 ? ambient : -9;

  const spin = -s * 5; // wheels always turning
  const open = ramp(s, m0 + 1.2, m0 + 3.0) * (1 - ramp(s, b0, b0 + 1.2));
  const generator = s >= b0 + 0.8 && s < b1 ? 1 : 0;
  const chargeGlow = ramp(s, b0 + 0.8, b0 + 2.5) * (1 - ramp(s, b1 - 0.4, b1));

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 8]} intensity={0.8} />
      <directionalLight position={[-6, -2, 4]} intensity={0.3} />
      <group position={pos.toArray()} rotation={euler} scale={shot.scale}>
        {/* ─── the gas car ─── */}
        {gasOpacity > 0.01 && (
          <group position={GAS_POS.toArray()}>
            <CarBody opacity={gasOpacity} nearFade={1} spin={spin} glowFront={0.5} glowRear={0} />
            <Engine s={s} opacity={gasOpacity} />
            <Particles kind="gas" sl={gasSl} opacity={gasOpacity} />
            {s >= p0 && <FleetRow type="Conv" opacity={gasOpacity} s={s} />}
          </group>
        )}
        {/* ─── the electric car ─── */}
        {evOpacity > 0.01 && (
          <group position={EV_POS.toArray()}>
            <CarBody opacity={evOpacity * evBody} nearFade={evNear} wheels={evWheels} spin={spin} glowFront={0} glowRear={0.8} />
            <Edged
              size={[0.9, 0.05, 0.5]}
              pos={BATTERY_LOCAL.toArray()}
              opacity={evOpacity * Math.max(evBody, 0.6 + 1.2 * chargeGlow)}
              fill={chargeGlow > 0.05 ? ACCENT : SLATE}
            />
            <Motor frame={frame} opacity={evOpacity} open={open} generator={generator} />
            <Particles kind="ev" sl={evSl} opacity={evOpacity} />
            {generator > 0 && <BrakeFlow s={s} />}
            {s >= p0 && <FleetRow type="BEV" opacity={evOpacity} s={s} />}
          </group>
        )}
      </group>
    </>
  );
};

/** Braking: energy runs backwards, wheels -> motor -> battery. */
const BrakeFlow: React.FC<{ s: number }> = ({ s }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const N = 30;
  return (
    <>
      {Array.from({ length: N }, (_, i) => {
        const u = ((s * 0.9 + i / N) % 1 + 1) % 1;
        const wheel = new THREE.Vector3(-WHEEL_X, WHEEL_R, i % 2 ? WHEEL_Z : -WHEEL_Z);
        const p = new THREE.Vector3();
        if (u < 0.45) p.copy(wheel).lerp(MOTOR_LOCAL, u / 0.45);
        else p.copy(MOTOR_LOCAL).lerp(BATTERY_LOCAL.clone().add(new THREE.Vector3(0.3 * ((i % 5) - 2) / 2, 0, 0)), (u - 0.45) / 0.55);
        return (
          <mesh key={i} geometry={geo} position={p.toArray()} scale={0.02}>
            <meshBasicMaterial color={ACCENT} transparent opacity={0.9} />
          </mesh>
        );
      })}
    </>
  );
};

// the gas beat replays the gas car's $100 slower, so the $77 can be watched leaving
const GAS_REPLAY_START = 4.8; // must match emit_ts.py
const GAS_REPLAY_RATE = 0.55;

// ── text ──────────────────────────────────────────────────────────────────
const Head: React.FC<{ from: number; to: number; lines: string[]; size?: number; top?: number }> = ({
  from,
  to,
  lines,
  size = 44,
  top = 300,
}) => (
  <Fade
    from={t(from)}
    to={t(to)}
    style={{ position: 'absolute', top, left: 70, width: 790, textAlign: 'center' }}
  >
    {lines.map((l, i) => (
      <div
        key={i}
        style={{ fontFamily: 'Archivo Black', fontSize: size, lineHeight: 1.16, letterSpacing: -1, color: INK }}
      >
        {l}
      </div>
    ))}
  </Fade>
);

const Counter: React.FC<{
  from: number;
  to: number;
  top: number;
  label: string;
  value: number;
  sub: string;
  color: string;
}> = ({ from, to, top, label, value, sub, color }) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top, left: 70, width: 790, textAlign: 'center' }}>
    <div style={{ fontFamily: 'Archivo Black', fontSize: 58, letterSpacing: -1, color: INK }}>
      {label}
      <span style={{ color }}>${value}</span>
    </div>
    <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 36, letterSpacing: 2, color: DIM }}>
      {sub}
    </div>
  </Fade>
);

const Tag: React.FC<{ from: number; to: number; top: number; text: string; color?: string }> = ({
  from,
  to,
  top,
  text,
  color = ACCENT,
}) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top, left: 70, width: 790, textAlign: 'center' }}>
    <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 38, letterSpacing: 4, color }}>{text}</div>
  </Fade>
);

export const EvMotor: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const breath = useBreath();

  const [h0, h1] = BEAT.hook;
  const [g0, g1] = BEAT.gas;
  const [m0, m1] = BEAT.motor;
  const [f0, f1] = BEAT.field;
  const [b0, b1] = BEAT.brake;
  const [p0, p1] = BEAT.payoff;
  const [c0, c1] = BEAT.close;

  const hookGas = arrived('gas', s - h0, true);
  const hookEv = arrived('ev', s - h0, true);
  const gasLost = arrived('gas', (s - GAS_REPLAY_START) * GAS_REPLAY_RATE, false);

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
          <Scene s={s} frame={frame} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* B1 · hook — the result, shown */}
      <Head from={h0} to={h1} lines={['$100 GOES INTO EACH CAR.']} size={48} />
      <Counter from={h0 + 0.2} to={h1} top={860} label="GAS CAR: " value={hookGas} sub="REACHES THE WHEELS" color={INK} />
      <Counter from={h0 + 0.2} to={h1} top={1370} label="ELECTRIC CAR: " value={hookEv} sub="REACHES THE WHEELS" color={ACCENT} />

      {/* B2 · gas */}
      <Head from={g0} to={g1} lines={['IN A GAS CAR, MOST OF IT', 'BECOMES HEAT IN THE ENGINE']} size={44} />
      <Counter from={g0 + 0.3} to={g1} top={1330} label="" value={gasLost} sub="NEVER REACHES THE WHEELS" color={HEAT} />

      {/* B3 · motor */}
      <Head from={m0} to={m1} lines={['AN ELECTRIC MOTOR BURNS NOTHING.', 'IT USES MAGNETS.']} size={40} />
      <Tag from={m0 + 2.2} to={m1} top={1130} text="ELECTRIC MOTOR" />

      {/* B4 · field */}
      <Head from={f0} to={f0 + 3.6} lines={['THREE SETS OF COILS', 'SWITCH ON IN TURN.']} size={46} />
      <Head from={f0 + 3.6} to={f1} lines={['THE MAGNETISM SPINS,', 'AND THE MIDDLE CHASES IT.']} size={46} />

      {/* B5 · brake */}
      <Head from={b0} to={b1} lines={['HIT THE BRAKES, AND IT RUNS', 'AS A GENERATOR — PUTTING', 'ENERGY BACK IN THE BATTERY']} size={40} />
      <Tag from={b0 + 1.4} to={b1} top={1330} text="CHARGING" />

      {/* B6 · payoff */}
      <Head
        from={p0}
        to={p1}
        lines={['WE RAN 51 CARS THROUGH', "THE EPA'S TEST DRIVE.", 'EVERY ELECTRIC ONE BEAT', 'EVERY GAS ONE.']}
        size={38}
        top={290}
      />
      <Counter from={p0 + 0.6} to={c1} top={860} label="GAS CAR: " value={DOLLARS.gas} sub="REACHES THE WHEELS" color={INK} />
      <Counter from={p0 + 0.6} to={c1} top={1370} label="ELECTRIC CAR: " value={DOLLARS.ev} sub="REACHES THE WHEELS" color={ACCENT} />

      {/* B7 · close */}
      <Fade from={t(c0)} style={{ position: 'absolute', top: 300, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 40, lineHeight: 1.16, letterSpacing: -1, color: INK }}>
          THE US ENERGY DEPARTMENT&apos;S
          <br />
          OWN FIGURES AGREE.
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, color: DIM, marginTop: 18 }}>
          Follow for how the things you use actually work.
        </div>
      </Fade>
    </AbsoluteFill>
  );
};
