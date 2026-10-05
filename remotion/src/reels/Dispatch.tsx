import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, ReelGround, ease } from './lib/chrome';
import { Pose, Pt, dashedRibbon, fmtClock, groupTransform, makeProjector, pointAt, ribbon, slicePoly } from './lib/geo3d';
import { BOX, COAST, EPI, HEXES, ROADS, STATS, WATER } from './data/dispatch';
import { BEATS, CUES, DURATION_SECONDS, HOLD_S, HOOK_ETA_BY, LAST_WORD_END, VO_FILE, VO_TRIM_S, WORDS, Word } from './data/dispatchVo';

export { DURATION_SECONDS };

/**
 * r019 · I90 — half the time, the car that looks closest on the map isn't the quickest, and Uber waits a few seconds
 * to match everyone at once.
 *
 * The FIRST narrated reel: the voice is the master clock. Every second below is derived from the word timings
 * (data/dispatchVo.ts <- vo_words.json <- forced alignment of the approved script); nothing here is a hand-typed time.
 * The street network is OpenStreetMap; the fleet and riders are SIMULATED (no Uber data), episode seed 18 = the median
 * of 20 runs (PREREG.md §3). Script = SCRIPT.md, contract = emit_ts.py's claims.
 *
 * 3D is spent where it adds something a flat map cannot: the camera drops from the whole city to one street and its
 * one-way arrow, and the hexagon grid blooms outward across real ground. Beat 5 (the race) is flat on purpose — two
 * panels must be read side by side, and a tilted camera would cost legibility.
 */

const ACCENT = '#00D6F7'; // DOMAIN_ACCENT.infrastructure — §2 Maps and real geography
const INK = '#E8E6E1';
const DIM = '#81A2C4';
const AMBER = '#FFB020';
const SLATE = '#0E213E';
const GRAPHITE = '#274064';

const CAM_Z = 20;
const FOV = 30;
const PX_PER_KM = 1920 / (2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180));
// the map lives in a window inside Instagram's safe area (x 60-870, y 270-1300); the captions own y 1330-1470
const WIN = { x: 60, y: 270, w: 810, h: 1030 };
const STAGE = { x: WIN.x + WIN.w / 2 - 540, y: WIN.y + WIN.h / 2 - 960 };
const projectRaw = makeProjector(CAM_Z, FOV);
const px = (pose: Pose, x: number, y: number, z = 0) => {
  const p = projectRaw(pose, x, y, z);
  return { x: p.x + STAGE.x, y: p.y + STAGE.y };
};

const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], ease);
const win = (s: number, a: number, b: number, f = 0.35) => Math.min(ramp(s, a, a + f), 1 - ramp(s, b - f, b));
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// ── the instances (chosen by rule in showcase_instances.py) ────────────────────────────────────────────────────
const H = EPI.instances.hook;
const RV = EPI.instances.river;
const LW = EPI.instances.longWait;
const HB = EPI.instances.hookBatched;
const rider3 = EPI.riderXY[H.rider];
const looksXY = EPI.carXY[H.looks];
const quickXY = EPI.carXY[H.quick];
const riderB = EPI.riderXY[RV.rider];

const extent = (pts: Pt[]) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2, w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};
const fit = (pts: Pt[], tilt: number, wPx = 700, hPx = 880, minScale = 0.5, maxScale = 3.2) => {
  const e = extent(pts);
  const s = Math.min(wPx / (Math.max(e.w, 0.4) * PX_PER_KM), hPx / (Math.max(e.h, 0.4) * PX_PER_KM * Math.cos(tilt)));
  return { fx: e.cx, fy: e.cy, scale: Math.min(maxScale, Math.max(minScale, s)) };
};
const f1 = fit([rider3, looksXY, quickXY, ...H.routeLooks, ...H.routeQuick], 0.75, 640, 800);
const f2 = fit([riderB, EPI.carXY[RV.looks], EPI.carXY[RV.quick], ...RV.routeLooks, ...RV.routeQuick], 0.9, 700, 860);

const WIDE: Pose = { fx: 0, fy: 0, scale: 0.55, tilt: 0.55, rot: 0 };
const KEYS: (Pose & { t: number })[] = [
  { t: 0, ...WIDE },
  { t: 0.45, ...WIDE },
  { t: 2.4, ...f1, tilt: 0.75, rot: 0.06 },
  { t: 7.0, ...f1, scale: f1.scale * 0.92, tilt: 0.78, rot: 0.1 },
  { t: 8.8, ...WIDE, scale: 0.56, rot: 0.04 },
  { t: 13.6, ...WIDE, scale: 0.58, tilt: 0.6, rot: 0.08 },
  { t: 15.2, fx: rider3[0], fy: rider3[1], scale: 1.35, tilt: 0.8, rot: 0.1 },
  { t: 19.9, fx: rider3[0], fy: rider3[1], scale: 1.45, tilt: 0.85, rot: 0.12 },
  { t: 22.4, ...f1, tilt: 1.0, rot: 0.16 },
  { t: 24.3, ...f1, scale: f1.scale * 1.05, tilt: 1.0, rot: 0.18 },
  { t: 26.5, ...f2, tilt: 0.9, rot: -0.1 },
  { t: 31.0, ...f2, scale: f2.scale * 0.96, tilt: 0.9, rot: -0.12 },
  { t: 33.4, ...WIDE, scale: 0.55, tilt: 0.3, rot: 0 },
  { t: 43.0, ...WIDE, scale: 0.55, tilt: 0.34, rot: 0.04 },
  { t: 63.0, ...WIDE, scale: 0.56, tilt: 0.5, rot: 0 },
  { t: 70.4, ...WIDE, scale: 0.58, tilt: 0.55, rot: 0.05 },
  { t: 73.0, fx: rider3[0], fy: rider3[1], scale: 1.1, tilt: 0.8, rot: 0.1 },
  { t: 75.8, ...WIDE, scale: 0.6, tilt: 0.5, rot: 0.12 },
  { t: 90, ...WIDE, scale: 0.62, tilt: 0.46, rot: 0.2 },
];
const poseAt = (s: number): Pose => {
  let i = 0;
  while (i < KEYS.length - 2 && s >= KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = (key: keyof Pose) => interpolate(s, [a.t, b.t], [a[key], b[key]], ease);
  return { fx: k('fx'), fy: k('fy'), scale: k('scale'), tilt: k('tilt'), rot: k('rot') + 0.022 * Math.sin((2 * Math.PI * s) / 19) };
};

// ── geometry built once ───────────────────────────────────────────────────────────────────────────────────────────
const roadsGeometry = (): THREE.BufferGeometry => {
  const { pts, offs } = ROADS;
  const seg: number[] = [];
  for (let k = 0; k < offs.length - 1; k++) {
    for (let i = offs[k]; i < offs[k + 1] - 1; i++) seg.push(pts[2 * i], pts[2 * i + 1], 0, pts[2 * i + 2], pts[2 * i + 3], 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(seg), 3));
  return g;
};

interface HexInfo { id: string; ring: Pt[]; cx: number; cy: number; outline: THREE.BufferGeometry; fill: THREE.BufferGeometry }
const hexInfo = (): HexInfo[] =>
  Object.entries(HEXES).map(([id, ring]) => {
    const cx = ring.reduce((a, p) => a + p[0], 0) / ring.length;
    const cy = ring.reduce((a, p) => a + p[1], 0) / ring.length;
    const closed = [...ring, ring[0]];
    return {
      id, ring, cx, cy,
      outline: ribbon(closed, 0.014, 0.002),
      fill: new THREE.ShapeGeometry(new THREE.Shape(ring.map((p) => new THREE.Vector2(p[0], p[1])))),
    };
  });

const polyOf = (xy: number[][]): Pt[] => xy;

const waterGeometries = (): THREE.BufferGeometry[] =>
  WATER.map((rings) => {
    const shape = new THREE.Shape(rings[0].map((p) => new THREE.Vector2(p[0], p[1])));
    rings.slice(1).forEach((h) => shape.holes.push(new THREE.Path(h.map((p) => new THREE.Vector2(p[0], p[1])))));
    return new THREE.ShapeGeometry(shape);
  });
const coastGeometries = (): THREE.BufferGeometry[] => COAST.map((c) => ribbon(c, 0.014, 0.0015));

// ── the scene ─────────────────────────────────────────────────────────────────────────────────────────────────────
const Scene: React.FC<{ s: number }> = ({ s }) => {
  const pose = poseAt(s);
  const T = groupTransform(pose);
  const roads = useMemo(roadsGeometry, []);
  const hexes = useMemo(hexInfo, []);
  const waterGeos = useMemo(waterGeometries, []);
  const coastGeos = useMemo(coastGeometries, []);
  const mats = useMemo(() => {
    const mk = (color: string) => new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
    return { ash: mk(DIM), bone: mk(INK), accent: mk(ACCENT), amber: mk(AMBER), dim: mk(GRAPHITE), slate: mk(GRAPHITE), roads: new THREE.LineBasicMaterial({ color: DIM, transparent: true, depthTest: false, depthWrite: false }) };
  }, []);
  const circle = useMemo(() => new THREE.CircleGeometry(1, 20), []);
  const ring = useMemo(() => new THREE.RingGeometry(0.8, 1, 36), []);
  const cyl = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 8), []);
  const sph = useMemo(() => new THREE.SphereGeometry(1, 14, 14), []);

  const homeHex = hexes.find((h) => h.id === EPI.h3.home);
  const hood = new Set(EPI.h3.hood);
  const inHood = new Set(EPI.h3.carsInHood);
  const maxD = Math.max(...hexes.map((h) => Math.hypot(h.cx - (homeHex?.cx ?? 0), h.cy - (homeHex?.cy ?? 0))));

  // ── what is on the map, by beat ───────────────────────────────────────────────────────────────────────────────
  const b2 = BEATS[1]; const b3 = BEATS[2]; const b4 = BEATS[3]; const b6 = BEATS[5];
  const canvasVis = 1 - ramp(s, BEATS[3].end + 0.2, BEATS[4].start) + ramp(s, BEATS[4].end, b6.start + 0.5);
  mats.roads.opacity = 0.5 * clamp01(canvasVis);
  mats.slate.opacity = 0.42 * clamp01(canvasVis); // the rivers: graphite, lighter than the ground so they read as water, not a hole

  // free pool for beats 1-3, then the river rider's pool
  const riverMix = ramp(s, CUES.b3_river - 0.6, CUES.b3_river + 0.5);
  const beat4 = s >= b4.start - 0.4 && s < BEATS[4].start;
  const poolH = useMemo(() => new Set(H.freeCars), []);
  const poolR = useMemo(() => new Set(RV.freeCars), []);

  const cars: { id: number; x: number; y: number; kind: 'free' | 'looks' | 'quick' | 'hood' | 'dim' | 'river-looks' | 'river-quick'; r: number }[] = [];
  const addCar = (id: number, kind: (typeof cars)[number]['kind'], r = 0.034) => cars.push({ id, x: EPI.carXY[id][0], y: EPI.carXY[id][1], kind, r });

  // beat 4's playback clock (sim seconds): first dispatch, one request at a time
  const simT = interpolate(s, [b4.start + 2.2, CUES.b4_stuck - 0.15], [0, 150], ease);
  const stuckPhase = s >= CUES.b4_stuck - 0.05;
  const stuckProg = ramp(s, CUES.b4_stuck, CUES.b4_stuck + 2.6);

  if (s < b4.start - 0.4) {
    const pool = riverMix > 0.5 && s >= b3.start ? poolR : poolH;
    pool.forEach((id) => {
      let kind: (typeof cars)[number]['kind'] = 'free';
      if (s >= CUES.b2_neighbours && s < b3.start && inHood.has(id)) kind = 'hood';
      addCar(id, kind);
    });
    if (s < b3.start || riverMix < 0.5) {
      addCar(H.looks, 'looks', 0.05);
      addCar(H.quick, 'quick', 0.05);
    } else {
      addCar(RV.looks, 'river-looks', 0.05);
      addCar(RV.quick, 'river-quick', 0.05);
    }
  } else if (beat4 || s < b6.start - 0.5) {
    const tNow = stuckPhase ? 583 : simT;
    const lastMatched = new Set<number>();
    EPI.runs['1'].matchT.forEach((m, i) => { if (m !== null && m <= tNow) lastMatched.add(EPI.runs['1'].car[i]); });
    EPI.avail.forEach((a, id) => { if (a <= tNow) addCar(id, lastMatched.has(id) ? 'dim' : 'free'); });
  } else {
    for (let id = 0; id < EPI.cars; id++) addCar(id, 'free', 0.03);
  }

  const twinkle = (id: number) => 1 + 0.18 * Math.sin((2 * Math.PI * s) / (2.1 + (id % 7) * 0.13) + id);
  const carMat = (k: string) => (k === 'looks' || k === 'river-looks' || k === 'hood' ? mats.bone : k === 'quick' || k === 'river-quick' ? mats.accent : k === 'dim' ? mats.dim : mats.ash);
  mats.ash.opacity = 0.95 * clamp01(canvasVis);
  mats.bone.opacity = 1 * clamp01(canvasVis);
  mats.accent.opacity = 1 * clamp01(canvasVis);
  mats.dim.opacity = 0.9 * clamp01(canvasVis);

  // ── the rider pin(s) ────────────────────────────────────────────────────────────────────────────────────────────
  const pulse = 0.5 - 0.5 * Math.cos((2 * Math.PI * s) / 1.4);

  // ── routes ────────────────────────────────────────────────────────────────────────────────────────────────────
  const looksP = ramp(s, 0.9, 2.2);
  const quickP = ramp(s, 1.5, 2.5);
  const routeLooks = useMemo(() => polyOf(H.routeLooks), []);
  const routeQuick = useMemo(() => polyOf(H.routeQuick), []);
  const rvLooks = useMemo(() => polyOf(RV.routeLooks), []);
  const rvQuick = useMemo(() => polyOf(RV.routeQuick), []);
  const stuckRoute = useMemo(() => polyOf(LW.route), []);
  const batchRoute = useMemo(() => polyOf(HB.route), []);
  // full in beat 1, faint behind the hexagons in beat 2, full again as the camera drops in beat 3, gone as the river rider arrives
  const hookRoutesVis =
    (1 - 0.82 * ramp(s, b2.start - 0.3, b2.start + 0.4) + 0.82 * ramp(s, b3.start - 0.2, b3.start + 0.6)) * (1 - ramp(s, CUES.b3_river - 0.5, CUES.b3_river + 0.1));
  const dashedVis = ramp(s, 0.55, 1.05) * (1 - ramp(s, b2.start - 0.3, b2.start + 0.4));
  const hookQuickMax = s < b2.start ? quickP : 1;
  const hookLooksMax = s < b2.start ? looksP : 1;
  const dashed = useMemo(() => dashedRibbon(rider3, looksXY, 0.06, 0.05, 0.016, 1, 0.003), []);

  const rvProg = ramp(s, CUES.b3_river + 0.2, CUES.b3_river + 1.8);
  const rvQuickProg = ramp(s, CUES.b3_river + 0.8, CUES.b3_river + 2.2);

  // ── hexagon layer: beat 2 (bloom, then the 7-cell neighbourhood) and beat 6 (requests per free car) ───────────
  const bloomAt = (h: HexInfo) => CUES.b2_honeycomb + (Math.hypot(h.cx - (homeHex?.cx ?? 0), h.cy - (homeHex?.cy ?? 0)) / maxD) * 1.9;
  const hexLayer2 = win(s, CUES.b2_honeycomb, b3.start - 0.3, 0.6) ;
  const surgeLayer = win(s, b6.start + 0.3, 80.6, 0.6);
  const surgeAt = (h: HexInfo) => CUES.b6_count + (Math.hypot(h.cx, h.cy) / (maxD || 1)) * 1.6;
  const hotId = EPI.surge.hot;
  const hotPulse = 0.5 - 0.5 * Math.cos((2 * Math.PI * (s - CUES.b6_surge)) / 1.2);

  const stuckLine = useMemo(() => slicePoly(stuckRoute, stuckProg), [stuckRoute, stuckProg]);
  const driven = ramp(s, CUES.b6_ride - 2.0, CUES.b6_ride);
  const batchDrawn = useMemo(() => slicePoly(batchRoute, driven), [batchRoute, driven]);

  // first-dispatch lines for beat 4 (rider -> car, fading after the match)
  const fdLines = useMemo(() => {
    const L = EPI.runs['1'];
    const segs: { a: Pt; b: Pt; m: number }[] = [];
    L.matchT.forEach((m, i) => { if (m !== null && m <= 150) segs.push({ a: EPI.riderXY[i], b: EPI.carXY[L.car[i]], m }); });
    return segs;
  }, []);
  const fdGeo = useMemo(() => {
    const live = fdLines.filter((l) => l.m <= simT);
    const pos: number[] = []; const idx: number[] = [];
    live.forEach((l) => {
      const dx = l.b[0] - l.a[0]; const dy = l.b[1] - l.a[1]; const m = Math.hypot(dx, dy) || 1;
      const nx = (-dy / m) * 0.007; const ny = (dx / m) * 0.007; const k = pos.length / 3;
      pos.push(l.a[0] + nx, l.a[1] + ny, 0.003, l.a[0] - nx, l.a[1] - ny, 0.003, l.b[0] + nx, l.b[1] + ny, 0.003, l.b[0] - nx, l.b[1] - ny, 0.003);
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos.length ? pos : [0, 0, 0]), 3));
    g.setIndex(idx);
    return g;
  }, [fdLines, Math.floor(simT * 2)]); // eslint-disable-line react-hooks/exhaustive-deps

  const gLooks = useMemo(() => ribbon(slicePoly(routeLooks, hookLooksMax), 0.034, 0.004), [routeLooks, hookLooksMax]);
  const gQuick = useMemo(() => ribbon(slicePoly(routeQuick, hookQuickMax), 0.04, 0.005), [routeQuick, hookQuickMax]);
  const gRvLooks = useMemo(() => ribbon(slicePoly(rvLooks, rvProg), 0.05, 0.004), [rvLooks, rvProg]);
  const gRvQuick = useMemo(() => ribbon(slicePoly(rvQuick, rvQuickProg), 0.05, 0.005), [rvQuick, rvQuickProg]);
  const gStuck = useMemo(() => ribbon(stuckLine, 0.045, 0.004), [stuckLine]);
  const gBatch = useMemo(() => ribbon(batchDrawn, 0.04, 0.004), [batchDrawn]);
  const pinOn = s >= 0.45 && !(s >= b4.start - 0.4 && s < b6.start);
  const onRiver = s >= CUES.b3_river - 0.2 && s < b4.start;
  const pinPos = onRiver ? riderB : rider3;
  const batchHead = pointAt(batchRoute, driven);

  return (
    <>
      <ambientLight intensity={1} />
      <group position={T.position} rotation={T.rotation} scale={T.scale}>
        {waterGeos.map((g, i) => (
          <mesh key={`w${i}`} geometry={g} material={mats.slate} renderOrder={0} />
        ))}
        {coastGeos.map((g, i) => (
          <mesh key={`k${i}`} geometry={g} material={mats.ash} renderOrder={1} />
        ))}
        <lineSegments geometry={roads} material={mats.roads} renderOrder={1} />

        {/* hexagon grid — beat 2 */}
        {hexLayer2 > 0.01 &&
          hexes.map((h) => {
            const on = ramp(s, bloomAt(h), bloomAt(h) + 0.5) * hexLayer2;
            const inHoodNow = hood.has(h.id) ? ramp(s, CUES.b2_neighbours, CUES.b2_neighbours + 0.9) : 0;
            return (
              <group key={h.id}>
                <mesh geometry={h.outline} renderOrder={2}>
                  <meshBasicMaterial color={ACCENT} transparent opacity={(0.32 + 0.5 * inHoodNow) * on} depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
                {inHoodNow > 0.01 && (
                  <mesh geometry={h.fill} renderOrder={1}>
                    <meshBasicMaterial color={ACCENT} transparent opacity={0.16 * inHoodNow * on} depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
                  </mesh>
                )}
              </group>
            );
          })}

        {/* requests per free car — beat 6 */}
        {surgeLayer > 0.01 &&
          hexes.map((h) => {
            const p = EPI.surge.pressure[h.id] ?? 1;
            const on = ramp(s, surgeAt(h), surgeAt(h) + 0.6) * surgeLayer;
            const heat = clamp01((p - 1) / 6);
            const isHot = h.id === hotId;
            return (
              <group key={`s${h.id}`}>
                <mesh geometry={h.outline} renderOrder={2}>
                  <meshBasicMaterial color={isHot ? AMBER : ACCENT} transparent opacity={(isHot ? 0.8 + 0.2 * hotPulse * ramp(s, CUES.b6_surge, CUES.b6_surge + 0.4) : 0.28) * on} depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
                <mesh geometry={h.fill} renderOrder={1}>
                  <meshBasicMaterial color={isHot ? AMBER : ACCENT} transparent opacity={(isHot ? 0.35 + 0.35 * hotPulse * ramp(s, CUES.b6_surge, CUES.b6_surge + 0.4) : 0.05 + 0.3 * heat) * on} depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
              </group>
            );
          })}

        {/* cars */}
        {cars.map((c) => (
          <mesh key={`c${c.id}`} geometry={circle} material={carMat(c.kind)} position={[c.x, c.y, 0.004]} scale={c.r * (c.kind === 'free' || c.kind === 'dim' ? twinkle(c.id) : 1)} renderOrder={4} />
        ))}

        {/* first dispatch, one request at a time — beat 4 */}
        {s >= b4.start && s < BEATS[4].start && !stuckPhase && <mesh geometry={fdGeo} material={mats.accent} renderOrder={3} />}
        {s >= b4.start && s < BEATS[4].start && !stuckPhase &&
          EPI.arrive.map((a, i) =>
            a <= simT && (EPI.runs['1'].matchT[i] ?? 1e9) > simT - 0.0 ? (
              <mesh key={`rq${i}`} geometry={ring} material={mats.bone} position={[EPI.riderXY[i][0], EPI.riderXY[i][1], 0.005]} scale={0.07 + 0.03 * pulse} renderOrder={5} />
            ) : null,
          )}

        {/* hook: the straight line to the car that LOOKS closest, and the two road routes */}
        {s < CUES.b3_river + 0.4 && (
          <>
            <mesh geometry={dashed} renderOrder={3}>
              <meshBasicMaterial color={INK} transparent opacity={0.8 * dashedVis} depthTest={false} depthWrite={false} />
            </mesh>
            <mesh geometry={gLooks} renderOrder={3}>
              <meshBasicMaterial color={INK} transparent opacity={0.75 * hookRoutesVis} depthTest={false} depthWrite={false} />
            </mesh>
            <mesh geometry={gQuick} renderOrder={3}>
              <meshBasicMaterial color={ACCENT} transparent opacity={0.95 * hookRoutesVis} depthTest={false} depthWrite={false} />
            </mesh>
          </>
        )}

        {/* the river rider — beat 3 */}
        {s >= CUES.b3_river - 0.2 && s < b4.start && (
          <>
            <mesh geometry={gRvLooks} renderOrder={3}>
              <meshBasicMaterial color={INK} transparent opacity={0.8} depthTest={false} depthWrite={false} />
            </mesh>
            <mesh geometry={gRvQuick} renderOrder={3}>
              <meshBasicMaterial color={ACCENT} transparent opacity={0.95} depthTest={false} depthWrite={false} />
            </mesh>
          </>
        )}

        {/* the one-way arrow — beat 3 */}
        {H.oneWay && s >= CUES.b3_oneway && s < CUES.b3_river + 0.4 && (
          <mesh position={[H.oneWay.x, H.oneWay.y, 0.01]} rotation={[0, 0, ((H.oneWay.heading - 90) * Math.PI) / 180]} scale={0.1 * ramp(s, CUES.b3_oneway, CUES.b3_oneway + 0.4)} renderOrder={6}>
            <coneGeometry args={[1, 1.8, 3]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={0.95} depthTest={false} depthWrite={false} />
          </mesh>
        )}

        {/* the stuck rider — beat 4 */}
        {stuckPhase && s < BEATS[4].start && (
          <>
            <mesh geometry={gStuck} renderOrder={3}>
              <meshBasicMaterial color={INK} transparent opacity={0.9} depthTest={false} depthWrite={false} />
            </mesh>
            <mesh geometry={ring} material={mats.bone} position={[EPI.riderXY[LW.rider][0], EPI.riderXY[LW.rider][1], 0.006]} scale={0.14 + 0.05 * pulse} renderOrder={6} />
            <mesh geometry={circle} material={mats.accent} position={[EPI.carXY[LW.car][0], EPI.carXY[LW.car][1], 0.006]} scale={0.08} renderOrder={6} />
          </>
        )}

        {/* beat 6: the car that was matched drives to the rider */}
        {s >= CUES.b6_ride - 2.2 && s < 90 && (
          <>
            <mesh geometry={gBatch} renderOrder={3}>
              <meshBasicMaterial color={ACCENT} transparent opacity={0.9} depthTest={false} depthWrite={false} />
            </mesh>
            <mesh geometry={circle} material={mats.accent} position={[batchHead[0], batchHead[1], 0.007]} scale={0.07} renderOrder={7} />
          </>
        )}

        {/* the rider's pin, beats 1-3 and 6-7 */}
        {pinOn && (
          <group position={[pinPos[0], pinPos[1], 0]}>
            <mesh geometry={cyl} material={mats.bone} position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} scale={[0.008, 0.2, 0.008]} renderOrder={6} />
            <mesh geometry={sph} material={mats.bone} position={[0, 0, 0.22]} scale={0.055} renderOrder={6} />
            <mesh geometry={ring} material={mats.accent} position={[0, 0, 0.004]} scale={0.1 + 0.18 * pulse} renderOrder={5} />
          </group>
        )}

        {/* a tick on the true nearest car — beat 2 */}
        {s >= CUES.b2_almost && s < b3.start - 0.2 && (
          <mesh geometry={ring} material={mats.accent} position={[quickXY[0], quickXY[1], 0.006]} scale={0.1 * ramp(s, CUES.b2_almost, CUES.b2_almost + 0.35)} renderOrder={6} />
        )}
      </group>
    </>
  );
};

// ── captions: word-timed, in a fixed band above y 1540 ────────────────────────────────────────────────────────────
interface Page { start: number; end: number; words: Word[] }
const PAGES: Page[] = (() => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  for (const w of WORDS) {
    cur.push(w);
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0);
    if (/[.?]$/.test(w.text) || (/[,:;]$/.test(w.text) && chars >= 22) || chars >= 44) {
      pages.push({ start: cur[0].start, end: w.end, words: cur });
      cur = [];
    }
  }
  if (cur.length) pages.push({ start: cur[0].start, end: cur[cur.length - 1].end, words: cur });
  return pages;
})();

const Captions: React.FC<{ s: number }> = ({ s }) => {
  const idx = PAGES.findIndex((p, i) => s >= p.start - 0.04 && s < (PAGES[i + 1]?.start ?? p.end + 0.5) - 0.01);
  if (idx < 0) return null;
  const p = PAGES[idx];
  if (s > p.end + 0.45 && !PAGES[idx + 1]) return null;
  const opacity = ramp(s, p.start - 0.04, p.start + 0.1);
  return (
    <div style={{ position: 'absolute', left: 60, top: 1322, width: 810, textAlign: 'center', opacity }}>
      {p.words.map((w, i) => {
        const nextStart = p.words[i + 1]?.start ?? w.end + 0.2;
        const state = s >= nextStart ? 'done' : s >= w.start ? 'now' : 'next';
        return (
          <span key={i} style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 56, lineHeight: 1.2, color: state === 'now' ? ACCENT : state === 'done' ? INK : DIM, opacity: state === 'next' ? 0.55 : 1 }}>
            {w.text}{' '}
          </span>
        );
      })}
    </div>
  );
};

// ── labels that ride on 3D objects ───────────────────────────────────────────────────────────────────────────────
const Tag: React.FC<{ x: number; y: number; text: string; color?: string; op: number; size?: number; bg?: boolean; weight?: number }> = ({ x, y, text, color = INK, op, size = 40, bg = true, weight = 700 }) => {
  if (op < 0.01) return null;
  const cx = Math.min(WIN.x + WIN.w - 70, Math.max(WIN.x + 70, x));
  const cy = Math.min(WIN.y + WIN.h - 40, Math.max(WIN.y + 40, y));
  return (
    <div style={{ position: 'absolute', left: cx, top: cy, transform: 'translate(-50%,-50%)', opacity: op, padding: bg ? '4px 16px' : 0, background: bg ? SLATE : 'transparent', border: bg ? `2px solid ${color}` : 'none', borderRadius: 10, fontFamily: 'IBM Plex Mono', fontWeight: weight, fontSize: size, color, letterSpacing: 1, whiteSpace: 'nowrap' }}>
      {text}
    </div>
  );
};

const Labels: React.FC<{ s: number }> = ({ s }) => {
  const pose = poseAt(s);
  const b2 = BEATS[1]; const b3 = BEATS[2]; const b6 = BEATS[5];
  const at = (xy: number[], z = 0.1) => px(pose, xy[0], xy[1], z);
  const out: React.ReactNode[] = [];

  // beat 1: the two ETAs ride on their cars (visible by HOOK_ETA_BY, before the words that explain them)
  const eta1 = win(s, 2.0, b2.start - 0.1, 0.4);
  if (eta1 > 0.01) {
    const a = at(looksXY, 0.12); const b = at(quickXY, 0.12);
    out.push(<Tag key="e1" x={a.x} y={a.y - 56} text={fmtClock(H.etaS.looks)} op={eta1 * ramp(s, 2.0, 2.3)} color={INK} />);
    out.push(<Tag key="e2" x={b.x} y={b.y - 56} text={fmtClock(H.etaS.quick)} op={eta1 * ramp(s, HOOK_ETA_BY - 0.3, HOOK_ETA_BY)} color={ACCENT} />);
  }
  // beat 2: H3, then 7%, then 97.6%
  const h3 = win(s, CUES.b2_h3, CUES.b2_neighbours - 0.1, 0.4);
  if (h3 > 0.01) out.push(<Tag key="h3" x={WIN.x + WIN.w / 2} y={WIN.y + 150} text="H3" color={ACCENT} op={h3} size={64} bg={false} />);
  const seven = win(s, CUES.b2_seven, b3.start - 0.2, 0.4);
  if (seven > 0.01) out.push(<Tag key="7" x={WIN.x + 250} y={WIN.y + 150} text={`≈ ${Math.round(STATS.hexShareOfFleet * 100)}% OF THE CARS`} color={INK} op={seven} size={38} />);
  const nearest = win(s, CUES.b2_almost, b3.start - 0.2, 0.4);
  if (nearest > 0.01) {
    const q = at(quickXY, 0.12);
    out.push(<Tag key="97" x={q.x} y={q.y - 58} text={`${(STATS.hexContainsNearest * 100).toFixed(1)}%`} color={ACCENT} op={nearest} />);
  }
  // beat 3: the river rider's two ETAs, then 49% and ≈ 25 s
  const rv = win(s, CUES.b3_river + 0.9, CUES.b3_half - 0.1, 0.4);
  if (rv > 0.01) {
    const a = at(EPI.carXY[RV.looks], 0.12); const b = at(EPI.carXY[RV.quick], 0.12);
    out.push(<Tag key="r1" x={a.x} y={a.y - 56} text={fmtClock(RV.etaS.looks)} op={rv} color={INK} />);
    out.push(<Tag key="r2" x={b.x} y={b.y - 56} text={fmtClock(RV.etaS.quick)} op={rv} color={ACCENT} />);
  }
  const half = win(s, CUES.b3_half, b3.end + 0.3, 0.4);
  if (half > 0.01) {
    const v = Math.round(STATS.wrongCarShare * 100 * ramp(s, CUES.b3_half, CUES.b3_half + 1.0));
    out.push(
      <div key="half" style={{ position: 'absolute', left: WIN.x + 20, top: WIN.y + 100, opacity: half }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 110, color: INK, lineHeight: 1 }}>{v}%</div>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 1 }}>WITH 300 CARS AROUND</div>
      </div>,
    );
  }
  const secs = win(s, CUES.b3_twentyfive, b3.end + 0.3, 0.4);
  if (secs > 0.01) {
    out.push(
      <div key="secs" style={{ position: 'absolute', right: 1080 - (WIN.x + WIN.w - 20), top: WIN.y + 100, opacity: secs, textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 110, color: AMBER, lineHeight: 1 }}>≈ 25 s</div>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 1 }}>PER RIDE</div>
      </div>,
    );
  }
  // beat 4: the stuck rider's clock and the 5 s ring
  const stuck = win(s, CUES.b4_stuck, BEATS[3].end - 0.1, 0.4);
  if (stuck > 0.01) {
    const p = ramp(s, CUES.b4_stuck, CUES.b4_stuck + 2.6);
    out.push(<Tag key="stuck" x={WIN.x + WIN.w / 2} y={WIN.y + 150} text={`WAIT ${fmtClock(LW.pickupS * p)}`} color={INK} op={stuck} size={56} />);
  }
  const five = win(s, CUES.b4_waits, BEATS[3].end + 0.2, 0.35);
  if (five > 0.01) out.push(<Tag key="five" x={WIN.x + WIN.w / 2} y={WIN.y + WIN.h - 70} text="WAIT 5 s" color={ACCENT} op={five} size={44} />);
  // beat 6: the matched rider's clock
  const clock = win(s, CUES.b6_ride - 2.1, 80.5, 0.35);
  if (clock > 0.01) {
    const p = ramp(s, CUES.b6_ride - 2.0, CUES.b6_ride);
    const total = HB.matchT - EPI.arrive[HB.rider] + HB.pickupS;
    out.push(<Tag key="clock" x={WIN.x + WIN.w / 2} y={WIN.y + 150} text={`WAIT ${fmtClock(total * p)}`} color={ACCENT} op={clock} size={56} />);
  }
  void b6;
  return <>{out}</>;
};

// ── beat 5: the race, flat and side by side ──────────────────────────────────────────────────────────────────────
const PW = 381; // inner width: + 2 x 2 px border = 385 outer, so the right-hand panel ends exactly on the safe edge (x 870)
const PH = Math.round((PW * BOX.h) / BOX.w);
const RACE_START = CUES.b5_same + 0.2; // cars and riders start appearing as soon as the beat opens (no dead spell)
const RACE_END = CUES.b5_shorter;
const kPanel = PW / BOX.w;
const roadPath = (() => {
  const { pts, offs } = ROADS;
  let d = '';
  for (let k = 0; k < offs.length - 1; k++) {
    for (let i = offs[k]; i < offs[k + 1]; i++) d += `${i === offs[k] ? 'M' : 'L'}${((pts[2 * i] + BOX.w / 2) * kPanel).toFixed(1)} ${((BOX.h / 2 - pts[2 * i + 1]) * kPanel).toFixed(1)}`;
  }
  return d;
})();
const pxy = (x: number, y: number): [number, number] => [(x + BOX.w / 2) * kPanel, (BOX.h / 2 - y) * kPanel];

const carTakenAt = (run: '1' | '5'): number[] => {
  const t = new Array(EPI.cars).fill(Infinity);
  EPI.runs[run].car.forEach((c, i) => { const m = EPI.runs[run].matchT[i]; if (c >= 0 && m !== null) t[c] = m; });
  return t;
};
const TAKEN: Record<'1' | '5', number[]> = { '1': carTakenAt('1'), '5': carTakenAt('5') };

const Panel: React.FC<{ s: number; x0: number; run: '1' | '5'; label: string[]; simT: number; sliderDelta: number | null; textFade: number }> = ({ s, x0, run, label, simT, sliderDelta, textFade }) => {
  const L = EPI.runs[run];
  const series = EPI.series.values[run];
  const idx = Math.min(series.length - 1, Math.floor(simT / EPI.series.step));
  let counter = series[idx];
  if (sliderDelta !== null) {
    const ds = [5, 10, 15, 30, 60]; const vs = ds.map((d) => EPI.finals[String(d)]);
    let v = vs[0];
    for (let i = 0; i < ds.length - 1; i++) if (sliderDelta >= ds[i] && sliderDelta <= ds[i + 1]) v = vs[i] + ((sliderDelta - ds[i]) / (ds[i + 1] - ds[i])) * (vs[i + 1] - vs[i]);
    counter = v;
  }
  const notClosest = run === '5' ? new Set(EPI.notClosest5) : new Set<number>();
  const rings = ramp(s, CUES.b5_thirteen, CUES.b5_thirteen + 0.5);
  return (
    <div style={{ position: 'absolute', left: x0, top: 480, width: PW }}>
      <div style={{ position: 'absolute', left: 0, top: -110, width: PW, textAlign: 'center', fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 36, color: run === '5' ? ACCENT : INK, lineHeight: 1.1, opacity: textFade }}>
        {label[0]}<br />{label[1]}
      </div>
      <svg width={PW} height={PH} style={{ border: `2px solid ${GRAPHITE}`, background: SLATE, borderRadius: 8 }}>
        <path d={roadPath} stroke={DIM} strokeOpacity={0.3} strokeWidth={1} fill="none" />
        {EPI.avail.map((a, j) => {
          if (a > simT) return null;
          const m = TAKEN[run][j] <= simT ? 1 : -1;
          const [x, y] = pxy(EPI.carXY[j][0], EPI.carXY[j][1]);
          return <circle key={j} cx={x} cy={y} r={m >= 0 ? 2 : 3} fill={m >= 0 ? GRAPHITE : DIM} opacity={m >= 0 ? 1 : 0.9} />;
        })}
        {L.matchT.map((m, i) => {
          if (m === null || m > simT) return null;
          const [x1, y1] = pxy(EPI.riderXY[i][0], EPI.riderXY[i][1]);
          const [x2, y2] = pxy(EPI.carXY[L.car[i]][0], EPI.carXY[L.car[i]][1]);
          const off = notClosest.has(i);
          const age = Math.max(0, simT - m);
          const fade = 0.25 + 0.75 * Math.exp(-age / 25);
          const [nx, ny] = pxy(EPI.carXY[L.nearest[i]][0], EPI.carXY[L.nearest[i]][1]);
          return (
            <g key={i}>
              {off && <line x1={x1} y1={y1} x2={nx} y2={ny} stroke={DIM} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.8 * rings} />}
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ACCENT} strokeWidth={off ? 2.5 : 1.2} opacity={fade} />
              {off && <circle cx={x1} cy={y1} r={7} fill="none" stroke={INK} strokeWidth={2} opacity={rings} />}
            </g>
          );
        })}
        {EPI.arrive.map((a, i) => {
          if (a > simT || (L.matchT[i] !== null && (L.matchT[i] as number) <= simT)) return null;
          const [x, y] = pxy(EPI.riderXY[i][0], EPI.riderXY[i][1]);
          return <circle key={`w${i}`} cx={x} cy={y} r={4.5} fill="none" stroke={INK} strokeWidth={1.5} />;
        })}
      </svg>
      <div style={{ marginTop: 14, textAlign: 'center', fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 64, color: run === '5' ? ACCENT : INK, opacity: textFade }}>
        {counter === null ? '—' : `${counter.toFixed(1)} s`}
      </div>
    </div>
  );
};

const Race: React.FC<{ s: number; card: number }> = ({ s, card }) => {
  const b5 = BEATS[4];
  const vis = win(s, b5.start - 0.4, b5.end + 1.2, 0.5);
  if (vis < 0.01) return null;
  const simT = interpolate(s, [RACE_START, RACE_END], [0, 640], ease);
  const sweep = ramp(s, CUES.b5_minute, CUES.b5_worse + 1.2);
  const delta = sweep > 0 ? 5 + 55 * sweep : null;
  const textFade = 1 - card;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: vis }}>
      <Panel s={s} x0={60} run="1" label={['ONE AT A', 'TIME']} simT={simT} sliderDelta={null} textFade={textFade} />
      <Panel s={s} x0={485} run="5" label={['WAIT 5 s,', 'MATCH TOGETHER']} simT={simT} sliderDelta={delta} textFade={textFade} />
      {delta !== null && (
        <div style={{ position: 'absolute', left: 70, top: 1235, width: 790, textAlign: 'center', fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 40, color: DIM, opacity: textFade }}>
          WAIT: {Math.round(delta)} s
          <div style={{ marginTop: 6, height: 8, background: GRAPHITE, borderRadius: 4 }}>
            <div style={{ width: `${((delta - 5) / 55) * 100}%`, height: 8, background: ACCENT, borderRadius: 4 }} />
          </div>
        </div>
      )}
    </div>
  );
};

export const Dispatch: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const canvasVis = clamp01(1 - ramp(s, BEATS[3].end + 0.2, BEATS[4].start) + ramp(s, BEATS[4].end + 0.2, BEATS[5].start + 0.4));
  const endCard = win(s, LAST_WORD_END + 0.15, DURATION_SECONDS + 1, 0.5);
  // the 20-run averages: the ONLY numbers on screen while it shows (the episode's own counters fade out), above the caption
  const card = win(s, CUES.b5_worse + 1.5, BEATS[5].start + 1.8, 0.4);
  const edge = 'linear-gradient(to right, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%), linear-gradient(to bottom, transparent 0, #000 50px, #000 calc(100% - 50px), transparent 100%)';

  return (
    <AbsoluteFill style={{ backgroundColor: '#040E1F' }}>
      <ReelGround accent={ACCENT} />
      <Audio src={staticFile(VO_FILE)} startFrom={Math.round(VO_TRIM_S * FPS)} />

      <div style={{ position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: 'hidden', opacity: canvasVis, WebkitMaskImage: edge, maskImage: edge, WebkitMaskComposite: 'source-in', maskComposite: 'intersect' }}>
        <div style={{ position: 'absolute', left: -WIN.x + STAGE.x, top: -WIN.y + STAGE.y }}>
          <ThreeCanvas width={1080} height={1920} linear camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 80 }} gl={{ antialias: true, alpha: true }} style={{ backgroundColor: 'transparent' }}>
            <Scene s={s} />
          </ThreeCanvas>
        </div>
      </div>

      <Labels s={s} />
      <Race s={s} card={card} />
      {card > 0.01 && (
        <div style={{ position: 'absolute', left: 70, top: 1136, width: 790, textAlign: 'center', opacity: card, background: SLATE, borderRadius: 10, padding: '6px 0 8px' }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 1 }}>AVERAGE OF 20 RUNS</div>
          <div style={{ display: 'flex' }}>
            {[
              ['AT ONCE', STATS.runMeans.fd, INK],
              ['5 s WAIT', STATS.runMeans.b5, ACCENT],
              ['60 s WAIT', STATS.runMeans.b60, INK],
            ].map(([label, v, color]) => (
              <div key={label as string} style={{ flex: 1 }}>
                <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 44, color: color as string }}>{v} s</div>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Captions s={s} />

      <div style={{ position: 'absolute', left: 60, top: 285, fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 36, color: DIM, letterSpacing: 1, lineHeight: 1.15, opacity: 1 - endCard }}>
        SIMULATED · NEW YORK<br />SOUTH OF 96TH ST
      </div>
      <div style={{ position: 'absolute', left: 60, top: 1486, width: 810, fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 0, whiteSpace: 'nowrap', opacity: 0.85 }}>
        MAP © OPENSTREETMAP CONTRIBUTORS
      </div>

      {endCard > 0.01 && (
        <div style={{ position: 'absolute', left: 60, top: 1322, width: 810, textAlign: 'center', opacity: endCard }}>
          <div style={{ fontFamily: 'Archivo Black', fontSize: 52, color: INK, lineHeight: 1.12 }}>NEXT: HOW A MAP APP<br />FINDS YOUR ROUTE</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

void HOLD_S;
