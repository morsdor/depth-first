import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, ease, t, useBreath } from './lib/chrome';
import {
  BEAM_TILT,
  BEAT,
  BUOY,
  BUOY_RUN,
  BUOY_TAIL,
  COAST,
  COPY_DROPPED,
  COPY_HALF,
  COPY_HERE,
  COPY_HOOK_B,
  COPY_OTHERS,
  COPY_PILES,
  COPY_SCATTER,
  NETS_PCT,
  PARTICLES,
  PART_RUN,
  PATCH,
  PATCH_ON,
  SURVEY_YEAR,
  WITNESSES,
} from './data/garbagepatch';

/**
 * r018 · I87 — almost half of the Great Pacific Garbage Patch, by weight, is fishing nets.
 *
 * ── The spine ────────────────────────────────────────────────────────────
 * Lebreton et al. 2018 (Sci. Rep. 8 4666): at least 46% of the patch's floating plastic MASS
 * is fishing nets (2015 survey). That figure is theirs; the reel's own contribution is WHY it all
 * gathers in one place, shown on real data. emit_ts.py asserts 18 claims.
 *
 * ── The one ruler ────────────────────────────────────────────────────────
 * Share of the patch's weight. One number on screen (46%), on the scale; "almost half" elsewhere.
 * Dates only label one real buoy's trip.
 *
 * ── Computed, not drawn ──────────────────────────────────────────────────
 *  · the globe's coast is Natural Earth 1:50m land;
 *  · the buoy is NOAA GDP 300234066410130's real track, deploy (off Taiwan, 2019) -> last fix;
 *  · the other tracks are real drifters that reached the patch from > 2,500 km away;
 *  · the particles are Markov chains on the transition model built from 48.9 M real drifter
 *    positions (van Sebille et al. 2012's method, re-run) — never told where the patch is;
 *  · the dashed circle is Lebreton's measured centre and area; its SHAPE is not claimed;
 *  · the beam's tilt is computed from 46 vs 54.
 * The sea, the net, the debris and the "island" are DIAGRAMS — see NOTES.
 *
 * Camera fixed; each scene's root group moves (pos = C - scale * R(focus)).
 */
export const DURATION_SECONDS = 42;

const ACCENT = '#00D6F7'; // DOMAIN_ACCENT.infrastructure — the ocean, the currents, the buoys
const AMBER = '#FFB020'; // the fishing nets, and nothing else
const BONE = '#E8E6E1';
const ASH = '#81A2C4';
const GRAPHITE = '#274064';
const SLATE = '#0E213E';
const INK = '#040E1F';

const CAM_Z = 8;
const FOV = 30;
const FOCAL_PX = REEL_H / 2 / Math.tan((FOV / 2) * (Math.PI / 180));
/** Centre of the Instagram safe column (x 60-870, y 270-1540) in world units at z=0. */
const SCREEN_C = new THREE.Vector3(-0.1675, 0.123, 0);

const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], ease);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

// ── camera plan ───────────────────────────────────────────────────────────
type Shot = { focus: THREE.Vector3; scale: number; rx: number; ry: number; dy?: number };
const blend = (a: Shot, b: Shot, k: number): Shot => ({
  focus: a.focus.clone().lerp(b.focus, k),
  scale: Math.exp(lerp(Math.log(a.scale), Math.log(b.scale), k)),
  rx: lerp(a.rx, b.rx, k),
  ry: lerp(a.ry, b.ry, k),
  dy: lerp(a.dy ?? 0, b.dy ?? 0, k),
});
const rootOf = (shot: Shot) => {
  const euler = new THREE.Euler(shot.rx, shot.ry, 0, 'XYZ');
  const c = SCREEN_C.clone().add(new THREE.Vector3(0, shot.dy ?? 0, 0));
  const pos = c.sub(shot.focus.clone().applyEuler(euler).multiplyScalar(shot.scale));
  return { pos, euler, scale: shot.scale };
};
/** World point -> screen pixels, for HTML labels that ride on 3D objects. */
const toScreen = (w: THREE.Vector3) => {
  const d = CAM_Z - w.z;
  return { x: REEL_W / 2 + (FOCAL_PX * w.x) / d, y: REEL_H / 2 - (FOCAL_PX * w.y) / d };
};
const localToScreen = (shot: Shot, local: THREE.Vector3) => {
  const { pos, euler, scale } = rootOf(shot);
  return toScreen(local.clone().multiplyScalar(scale).applyEuler(euler).add(pos));
};

// ══ THE SEA ══════════════════════════════════════════════════════════════
const SEA_SIZE = 16;
const SEA_SEG = 96;
const wave = (x: number, z: number, s: number) =>
  0.05 * Math.sin(1.3 * x + 0.9 * s) + 0.035 * Math.sin(1.7 * z - 1.1 * s + 0.5) + 0.02 * Math.sin(2.3 * (x + z) + 1.7 * s);

function seaShot(s: number): Shot {
  const [i0] = BEAT.island;
  const [y0] = BEAT.payoff;
  const [c0, c1] = BEAT.close;
  const drift = 0.05 * s;
  // hook: low over the water, the net coming at us
  const low: Shot = { focus: new THREE.Vector3(0, 0.15, 0.4), scale: 0.62, rx: 0.2, ry: -0.25 + drift };
  // island: rise over the mound, then keep rising as it spreads
  const over: Shot = { focus: new THREE.Vector3(0, 0, 0), scale: 0.5, rx: 0.62, ry: -0.1 + drift };
  const high: Shot = { focus: new THREE.Vector3(0, 0, 0), scale: 0.2, rx: 1.15, ry: 0.1 + drift };
  // payoff: the scale, slow orbit
  const scaleShot: Shot = { focus: new THREE.Vector3(0, 0.6, 0), scale: 0.64, rx: 0.14, ry: -0.22 + 0.04 * (s - y0), dy: -0.22 };
  const wide: Shot = { focus: new THREE.Vector3(0, 0.2, 0.2), scale: 0.5, rx: 0.3, ry: -0.05 + 0.05 * (s - c0), dy: -0.25 };
  if (s < i0) return blend(low, { ...low, scale: 0.66, rx: 0.24 }, ramp(s, 0, i0));
  if (s < y0 - 1) return blend(blend(low, over, ramp(s, i0, i0 + 1.6)), high, ramp(s, i0 + 2.8, BEAT.island[1] + 0.2));
  if (s < c0) {
    const dive: Shot = { focus: new THREE.Vector3(0, 0.3, 0), scale: 0.3, rx: 0.9, ry: -0.35 };
    return blend(dive, scaleShot, ramp(s, y0 - 0.6, y0 + 1.6));
  }
  return blend(scaleShot, wide, ramp(s, c0, c0 + 2.5 + 0 * c1));
}

const Water: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const frameKey = Math.round(s * FPS);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SEA_SIZE, SEA_SIZE, SEA_SEG, SEA_SEG);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, wave(p.getX(i), p.getZ(i), frameKey / FPS));
    g.computeVertexNormals();
    return g;
  }, [frameKey]);
  return (
    <>
      <mesh geometry={geo}>
        <meshStandardMaterial color={SLATE} emissive={ACCENT} emissiveIntensity={0.07} roughness={0.55} metalness={0.1} flatShading transparent opacity={opacity} />
      </mesh>
      <mesh geometry={geo} position={[0, 0.003, 0]}>
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.09 * opacity} />
      </mesh>
    </>
  );
};

// ── the net: a deformed knotted grid, ropes and floats — the ONE amber element ────
function netGeometry(seed: number, w: number, h: number, nx: number, nz: number, fold: number) {
  const r = rng(seed);
  const ph = [r() * 6, r() * 6, r() * 6];
  const P = (i: number, j: number) => {
    const u = i / nx;
    const v = j / nz;
    const x = (u - 0.5) * w;
    const z = (v - 0.5) * h;
    const y = fold * (0.5 * Math.sin(3.1 * u + ph[0]) * Math.sin(2.3 * v + ph[1]) + 0.35 * Math.sin(7 * u * v + ph[2]));
    // bunch it: pull the far corners in, like a net balled on the water
    const k = 1 - 0.35 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    return new THREE.Vector3(x * k, y, z * k);
  };
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= nx; i++)
    for (let j = 0; j <= nz; j++) {
      if (i < nx) pts.push(P(i, j), P(i + 1, j));
      if (j < nz) pts.push(P(i, j), P(i, j + 1));
    }
  const grid = new THREE.BufferGeometry().setFromPoints(pts);
  const ropes: THREE.TubeGeometry[] = [];
  for (let k = 0; k < 3; k++) {
    const c: THREE.Vector3[] = [];
    for (let m = 0; m < 6; m++) c.push(new THREE.Vector3((r() - 0.5) * w * 0.9, fold * (r() - 0.2), (r() - 0.5) * h * 0.9));
    ropes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c), 48, 0.012 * w, 6, false));
  }
  const floats = Array.from({ length: 4 }, (_, k) => P(k % 2 === 0 ? 0 : nx, k < 2 ? 0 : nz));
  return { grid, ropes, floats };
}

const Net: React.FC<{ seed: number; w: number; h: number; opacity: number; fold?: number }> = ({ seed, w, h, opacity, fold = 0.08 }) => {
  const g = useMemo(() => netGeometry(seed, w, h, 16, 11, fold), [seed, w, h, fold]);
  return (
    <group>
      <lineSegments geometry={g.grid}>
        <lineBasicMaterial color={AMBER} transparent opacity={opacity} />
      </lineSegments>
      {g.ropes.map((rg, i) => (
        <mesh key={i} geometry={rg}>
          <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.45} roughness={0.8} transparent opacity={opacity} />
        </mesh>
      ))}
      {g.floats.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035 * w, 10, 8]} />
          <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.3} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
};

// ── everything else: crates, bottles, bags, fragments (ink, ash, bone — never amber) ────
type Kind = 'crate' | 'bottle' | 'bag' | 'shard';
type Piece = { kind: Kind; scatter: THREE.Vector3; mound: THREE.Vector3; wide: THREE.Vector3; rot: number; spin: number; size: number };
const KINDS: Kind[] = ['crate', 'bottle', 'bag', 'shard', 'bottle', 'shard'];
const PIECES: Piece[] = (() => {
  const r = rng(87);
  const out: Piece[] = [];
  const N = 260;
  for (let i = 0; i < N; i++) {
    const a = 2 * Math.PI * r();
    const rad = 0.9 + 4.6 * Math.sqrt(r());
    const scatter = new THREE.Vector3(rad * Math.cos(a), 0, rad * Math.sin(a) - 0.8);
    // the imagined island: a packed mound
    const ma = 2 * Math.PI * r();
    const mr = 1.25 * Math.sqrt(r());
    const mound = new THREE.Vector3(mr * Math.cos(ma), 0.04 + 0.45 * (1 - mr / 1.25) * r(), mr * Math.sin(ma));
    const wr = 2.2 + 5.2 * Math.sqrt(r());
    const wide = new THREE.Vector3(wr * Math.cos(ma), 0, wr * Math.sin(ma));
    out.push({ kind: KINDS[i % KINDS.length], scatter, mound, wide, rot: 2 * Math.PI * r(), spin: (r() - 0.5) * 0.6, size: 0.75 + 0.5 * r() });
  }
  return out;
})();

const PieceMesh: React.FC<{ kind: Kind; opacity: number }> = ({ kind, opacity }) => {
  if (kind === 'crate')
    return (
      <mesh>
        <boxGeometry args={[0.14, 0.08, 0.1]} />
        <meshStandardMaterial color={GRAPHITE} emissive={GRAPHITE} emissiveIntensity={0.6} roughness={0.9} transparent opacity={opacity} />
      </mesh>
    );
  if (kind === 'bottle')
    return (
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 0.14, 10]} />
        <meshStandardMaterial color={ASH} emissive={ASH} emissiveIntensity={0.25} roughness={0.4} transparent opacity={opacity} />
      </mesh>
    );
  if (kind === 'bag')
    return (
      <mesh scale={[1, 0.25, 0.8]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color={BONE} emissive={BONE} emissiveIntensity={0.15} roughness={1} transparent opacity={0.55 * opacity} />
      </mesh>
    );
  return (
    <mesh>
      <tetrahedronGeometry args={[0.045]} />
      <meshStandardMaterial color={BONE} emissive={BONE} emissiveIntensity={0.2} roughness={1} transparent opacity={opacity} />
    </mesh>
  );
};

/** where every piece is, by beat: sparse in the hook, an imagined island, then spread thin. */
function piecePos(p: Piece, s: number): THREE.Vector3 {
  const [i0, i1] = BEAT.island;
  const gather = s < i1 + 1 ? ramp(s, i0 + 0.2, i0 + 2.0) : 0;
  const spread = ramp(s, i0 + 2.8, i1 - 0.6);
  const base = p.scatter.clone().lerp(p.mound, gather * (1 - spread)).lerp(p.wide, spread);
  if (s >= BEAT.payoff[0] - 1) base.copy(p.wide);
  const bob = wave(base.x, base.z, s);
  return new THREE.Vector3(base.x, base.y * gather * (1 - spread) + bob + 0.02, base.z);
}

/** the hook's net: drifts toward the lens. In the close it drifts past again. */
function netPos(s: number): THREE.Vector3 {
  if (s < BEAT.island[0] + 1) {
    const k = s / (BEAT.island[0] + 1);
    return new THREE.Vector3(lerp(-0.1, 0.3, k), 0, lerp(-0.6, 2.0, k));
  }
  const k = clamp01((s - BEAT.close[0]) / (BEAT.close[1] - BEAT.close[0]));
  return new THREE.Vector3(lerp(-1.8, 0.4, k), 0, lerp(0.2, 1.4, k));
}

// ── the scale ─────────────────────────────────────────────────────────────
const ARM = 0.95;
const HANG = 0.55;
const scaleRise = (s: number) => ramp(s, BEAT.payoff[0] + 0.6, BEAT.payoff[0] + 2.4) * (1 - ramp(s, BEAT.close[0] + 0.2, BEAT.close[0] + 2.2));
const tiltAt = (s: number) => BEAM_TILT * ramp(s, COPY_HALF[0] - 0.4, COPY_HALF[0] + 1.6);
const panPos = (side: -1 | 1, s: number) => {
  const a = tiltAt(s);
  const y0 = lerp(-1.6, 0.0, scaleRise(s));
  return new THREE.Vector3(side * ARM * Math.cos(a), y0 + 1.25 - side * ARM * Math.sin(a) - HANG, 0);
};
const RIGHT_LOAD: Piece[] = PIECES.filter((p) => p.kind !== 'crate').slice(0, 24);

const Scale: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const rise = scaleRise(s);
  const a = tiltAt(s);
  const y0 = lerp(-1.6, 0.0, rise);
  const strings = useMemo(() => new THREE.BufferGeometry(), []);
  const L = panPos(-1, s);
  const R = panPos(1, s);
  const endL = new THREE.Vector3(-ARM * Math.cos(a), y0 + 1.25 + ARM * Math.sin(a), 0);
  const endR = new THREE.Vector3(ARM * Math.cos(a), y0 + 1.25 - ARM * Math.sin(a), 0);
  strings.setFromPoints([
    endL, L.clone().add(new THREE.Vector3(-0.3, 0, 0)), endL, L.clone().add(new THREE.Vector3(0.3, 0, 0)),
    endR, R.clone().add(new THREE.Vector3(-0.3, 0, 0)), endR, R.clone().add(new THREE.Vector3(0.3, 0, 0)),
  ]);
  if (opacity < 0.01 || rise < 0.001) return null;
  return (
    <group>
      {/* the post */}
      <mesh position={[0, y0 + 0.55, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 1.4, 12]} />
        <meshStandardMaterial color={GRAPHITE} emissive={GRAPHITE} emissiveIntensity={0.9} transparent opacity={opacity} />
      </mesh>
      {/* the beam: tilt computed from 46 vs 54 */}
      <mesh position={[0, y0 + 1.25, 0]} rotation={[0, 0, -a]}>
        <boxGeometry args={[2 * ARM + 0.08, 0.05, 0.07]} />
        <meshStandardMaterial color={BONE} emissive={BONE} emissiveIntensity={0.25} transparent opacity={opacity} />
      </mesh>
      <lineSegments geometry={strings}>
        <lineBasicMaterial color={ASH} transparent opacity={0.9 * opacity} />
      </lineSegments>
      {[L, R].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.36, 0.3, 0.05, 32]} />
          <meshStandardMaterial color={SLATE} emissive={ASH} emissiveIntensity={0.25} transparent opacity={opacity} />
        </mesh>
      ))}
      {/* nets on the left pan */}
      <group position={[L.x, L.y + 0.1, L.z]} rotation={[0.25, 0.4, 0]}>
        <Net seed={46} w={0.62} h={0.5} opacity={opacity} fold={0.12} />
      </group>
      <group position={[L.x + 0.05, L.y + 0.17, L.z + 0.05]} rotation={[-0.3, 1.2, 0.2]}>
        <Net seed={47} w={0.5} h={0.4} opacity={opacity} fold={0.1} />
      </group>
      {/* everything else on the right pan */}
      {RIGHT_LOAD.map((p, i) => {
        const r = rng(i + 3);
        return (
          <group key={i} position={[R.x + (r() - 0.5) * 0.5, R.y + 0.08 + 0.06 * (i % 5), R.z + (r() - 0.5) * 0.4]} rotation={[r(), p.rot, r()]} scale={1.9}>
            <PieceMesh kind={p.kind} opacity={opacity} />
          </group>
        );
      })}
    </group>
  );
};

const Sea: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const shot = seaShot(s);
  const { pos, euler, scale } = rootOf(shot);
  const np = netPos(s);
  const netOn = s < BEAT.island[0] + 1 ? 1 - ramp(s, BEAT.island[0] + 0.2, BEAT.island[0] + 0.9) : ramp(s, BEAT.close[0], BEAT.close[0] + 0.8);
  if (opacity < 0.01) return null;
  return (
    <group position={pos.toArray()} rotation={euler} scale={scale}>
      <Water s={s} opacity={opacity} />
      {PIECES.map((p, i) => {
        const q = piecePos(p, s);
        return (
          <group key={i} position={q} rotation={[0.3 * Math.sin(s + i), p.rot + p.spin * s, 0.25 * Math.cos(1.3 * s + i)]} scale={p.size}>
            <PieceMesh kind={p.kind} opacity={opacity} />
          </group>
        );
      })}
      {netOn > 0.01 && (
        <group position={[np.x, wave(np.x, np.z, s) + 0.02, np.z]} rotation={[0.08 * Math.sin(1.1 * s), 0.35 + 0.1 * s, 0.06 * Math.cos(0.9 * s)]}>
          <Net seed={87} w={1.5} h={1.05} opacity={opacity * netOn} fold={0.12} />
        </group>
      )}
      <Scale s={s} opacity={opacity} />
    </group>
  );
};

// ══ THE GLOBE ════════════════════════════════════════════════════════════
const GLOBE_R = 1.2;
const D2R = Math.PI / 180;
const sph = (lat: number, lon: number, r: number) =>
  new THREE.Vector3(Math.cos(lat * D2R) * Math.sin(lon * D2R) * r, Math.sin(lat * D2R) * r, Math.cos(lat * D2R) * Math.cos(lon * D2R) * r);

/** Buoy position at a given day since deployment (linear between its 2-day fixes). */
const BUOY_N = BUOY.pts.length / 3;
function buoyAt(day: number): { lat: number; lon: number; i: number } {
  const P = BUOY.pts;
  let i = 0;
  while (i < BUOY_N - 2 && P[3 * (i + 1)] < day) i++;
  const d0 = P[3 * i];
  const d1 = P[3 * (i + 1)];
  const k = clamp01((day - d0) / Math.max(1e-6, d1 - d0));
  return { lat: lerp(P[3 * i + 1], P[3 * i + 4], k), lon: lerp(P[3 * i + 2], P[3 * i + 5], k), i };
}
function buoyDayAt(s: number): number {
  if (s <= BUOY_RUN[0]) return 0;
  if (s <= BUOY_RUN[1]) return (BUOY.arriveDay * (s - BUOY_RUN[0])) / (BUOY_RUN[1] - BUOY_RUN[0]);
  const k = clamp01((s - BUOY_TAIL[0]) / (BUOY_TAIL[1] - BUOY_TAIL[0]));
  return BUOY.arriveDay + (BUOY.lastDay - BUOY.arriveDay) * k;
}

function globeShot(s: number): Shot {
  const [b0] = BEAT.buoy;
  const [p0, p1] = BEAT.pile;
  const run = ramp(s, BUOY_RUN[0], BUOY_TAIL[1]);
  const view = (lat: number, lon: number, scale: number, dy: number): Shot => ({
    focus: sph(lat, lon, GLOBE_R),
    scale,
    rx: lat * D2R,
    ry: -lon * D2R,
    dy,
  });
  const open = view(40, 160, 0.66, -0.08);
  const follow = view(30, lerp(176, 196, run), 0.92, -0.2);
  const basin = view(30, 192, 0.95, -0.2);
  const close = view(31, 210, 1.55, -0.25);
  const dive = view(32, 215, 4.2, -0.25);
  // after the buoy arrives, keep pushing toward the patch so the hold never goes still
  const pushed = blend(follow, view(31, 204, 1.12, -0.2), ramp(s, COPY_HERE[0] - 0.4, p0 + 1.0));
  if (s < b0 + 2.6) return blend(open, follow, ramp(s, b0 - 0.6, b0 + 2.6));
  if (s < p0) return pushed;
  if (s < PART_RUN[1] - 0.6) return blend(pushed, basin, ramp(s, p0 + 1.0, p0 + 2.4));
  if (s < p1 - 0.6) return blend(basin, close, ramp(s, PART_RUN[1] - 0.6, p1 - 0.8));
  return blend(close, dive, ramp(s, p1 - 0.6, p1 + 0.6));
}

const Line: React.FC<{ pts: THREE.Vector3[]; color: string; opacity: number; upto?: number }> = ({ pts, color, opacity, upto }) => {
  const g = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [pts]);
  g.setDrawRange(0, upto === undefined ? pts.length : Math.max(0, Math.floor(upto)));
  return (
    <line>
      <primitive object={g} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
};

const COAST_PTS: THREE.Vector3[][] = COAST.map((run) => run.map(([la, lo]) => sph(la, lo, GLOBE_R * 1.002)));
const WIT_PTS: THREE.Vector3[][] = WITNESSES.map((w) => {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < w.length; i += 2) out.push(sph(w[i], w[i + 1], GLOBE_R * 1.004));
  return out;
});
const BUOY_PTS: THREE.Vector3[] = Array.from({ length: BUOY_N }, (_, i) => sph(BUOY.pts[3 * i + 1], BUOY.pts[3 * i + 2], GLOBE_R * 1.006));
const PATCH_RING: THREE.Vector3[] = (() => {
  // a small circle of angular radius radiusDeg around the measured centre
  const c = sph(PATCH.lat, PATCH.lon, 1).normalize();
  const east = new THREE.Vector3(0, 1, 0).cross(c).normalize();
  const north = c.clone().cross(east).normalize();
  const a = PATCH.radiusDeg * D2R;
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < 64; i++) {
    for (const j of [i, i + 1]) {
      const th = (j / 64) * 2 * Math.PI;
      const v = c.clone().multiplyScalar(Math.cos(a)).add(east.clone().multiplyScalar(Math.sin(a) * Math.cos(th))).add(north.clone().multiplyScalar(Math.sin(a) * Math.sin(th)));
      if (i % 2 === 0) out.push(v.multiplyScalar(GLOBE_R * 1.008));
    }
  }
  return out;
})();

/** Particle i at a fractional step, Catmull-Rom through its 60-day positions. */
const PN = PARTICLES.n;
const pAt = (i: number, step: number) => {
  const lat = (k: number) => PARTICLES.lat[k * PN + i] / 100;
  const lon = (k: number) => PARTICLES.lon[k * PN + i] / 100 + 180;
  const S = PARTICLES.steps;
  const k1 = Math.min(S, Math.floor(step));
  const k2 = Math.min(S, k1 + 1);
  const k0 = Math.max(0, k1 - 1);
  const k3 = Math.min(S, k2 + 1);
  const u = step - k1;
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  // a jump across the dateline seam or a beaching is not interpolated
  const L = [lon(k0), lon(k1), lon(k2), lon(k3)];
  const jump = Math.max(Math.abs(L[1] - L[0]), Math.abs(L[2] - L[1]), Math.abs(L[3] - L[2])) > 40;
  if (jump) return { lat: lat(u < 0.5 ? k1 : k2), lon: L[u < 0.5 ? 1 : 2] };
  return { lat: cr(lat(k0), lat(k1), lat(k2), lat(k3)), lon: cr(L[0], L[1], L[2], L[3]) };
};

const Particles: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const step = clamp01((s - PART_RUN[0]) / (PART_RUN[1] - PART_RUN[0])) * PARTICLES.steps;
  const frameKey = Math.round(s * FPS);
  const geo = useMemo(() => {
    const pos = new Float32Array(PN * 3);
    const col = new Float32Array(PN * 3);
    const bone = new THREE.Color(BONE);
    for (let i = 0; i < PN; i++) {
      const d = PARTICLES.death[i];
      // beached: fades over the step after it leaves the water
      const fade = d === -1 ? 1 : clamp01(d - step);
      const p = pAt(i, step);
      const v = sph(p.lat, p.lon, GLOBE_R * 1.01);
      pos.set([v.x, v.y, v.z], 3 * i);
      col.set([bone.r * fade, bone.g * fade, bone.b * fade], 3 * i);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [frameKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.019} vertexColors transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  );
};

const Globe: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const shot = globeShot(s);
  const { pos, euler, scale } = rootOf(shot);
  const day = buoyDayAt(s);
  const b = buoyAt(day);
  const bp = sph(b.lat, b.lon, GLOBE_R * 1.012);
  const [p0] = BEAT.pile;
  const buoyTrackO = s < p0 ? 1 : 1 - 0.6 * ramp(s, p0, p0 + 1);
  const witO = ramp(s, COPY_OTHERS[0], COPY_OTHERS[0] + 0.5) * (1 - 0.9 * ramp(s, PART_RUN[0], PART_RUN[0] + 1));
  const partO = ramp(s, PART_RUN[0] - 0.2, PART_RUN[0] + 0.5);
  const patchO = ramp(s, PATCH_ON, PATCH_ON + 0.8);
  const buoyOn = ramp(s, BUOY_RUN[0] - 0.6, BUOY_RUN[0]) * (1 - ramp(s, PART_RUN[0], PART_RUN[0] + 0.6));
  if (opacity < 0.01) return null;
  return (
    <group position={pos.toArray()} rotation={euler} scale={scale}>
      <mesh>
        <sphereGeometry args={[GLOBE_R, 96, 64]} />
        <meshStandardMaterial color={SLATE} emissive={ACCENT} emissiveIntensity={0.13} roughness={1} transparent opacity={opacity} />
      </mesh>
      {COAST_PTS.map((p, i) => (
        <Line key={i} pts={p} color={ASH} opacity={opacity * 0.6} />
      ))}
      {WIT_PTS.map((p, i) => {
        const k = ramp(s, COPY_OTHERS[0] + 0.06 * i, COPY_OTHERS[0] + 1.4 + 0.06 * i);
        return witO > 0.01 ? <Line key={i} pts={p} color={BONE} opacity={opacity * witO * 0.75} upto={k * p.length} /> : null;
      })}
      {buoyOn > 0.01 && (
        <>
          <Line pts={BUOY_PTS} color={ACCENT} opacity={opacity * buoyTrackO * buoyOn} upto={b.i + 1} />
          <mesh position={bp}>
            <sphereGeometry args={[0.024, 16, 12]} />
            <meshBasicMaterial color={BONE} transparent opacity={opacity * buoyOn} />
          </mesh>
          <mesh position={bp}>
            <sphereGeometry args={[0.03 + 0.01 * Math.sin(6 * s), 16, 12]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={opacity * buoyOn * 0.35} depthWrite={false} />
          </mesh>
        </>
      )}
      {partO > 0.01 && <Particles s={s} opacity={opacity * partO} />}
      {patchO > 0.01 && (
        <lineSegments>
          <primitive object={new THREE.BufferGeometry().setFromPoints(PATCH_RING)} attach="geometry" />
          <lineBasicMaterial color={ACCENT} transparent opacity={opacity * patchO} />
        </lineSegments>
      )}
      {patchO > 0.01 && (
        <mesh position={sph(PATCH.lat, PATCH.lon, GLOBE_R * 1.003)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), sph(PATCH.lat, PATCH.lon, 1).normalize())}>
          <circleGeometry args={[GLOBE_R * Math.sin(PATCH.radiusDeg * D2R), 64]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.14 * opacity * patchO} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

// ── text ──────────────────────────────────────────────────────────────────
const Head: React.FC<{ from: number; to: number; lines: string[]; size?: number; top?: number }> = ({ from, to, lines, size = 46, top = 300 }) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top, left: 70, width: 790, textAlign: 'center' }}>
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily: 'Archivo Black', fontSize: size, lineHeight: 1.16, letterSpacing: -1, color: BONE }}>
        {l}
      </div>
    ))}
  </Fade>
);

const Tag: React.FC<{ from: number; to: number; x: number; y: number; text: string; color?: string; size?: number }> = ({
  from,
  to,
  x,
  y,
  text,
  color = ASH,
  size = 36,
}) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top: y - size * 0.6, left: x - 380, width: 760, textAlign: 'center' }}>
    <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: size, letterSpacing: 3, color, whiteSpace: 'nowrap' }}>{text}</div>
  </Fade>
);

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const dateLabel = (day: number) => {
  const d = new Date(Date.parse(`${BUOY.deployed}T00:00:00Z`) + day * 86400000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

// keep a label inside the safe column
const clampX = (x: number) => Math.max(260, Math.min(670, x));

// ── the reel ──────────────────────────────────────────────────────────────
export const GarbagePatch: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const breath = useBreath();

  const [h0, h1] = BEAT.hook;
  const [i0, i1] = BEAT.island;
  const [b0, b1] = BEAT.buoy;
  const [, p1] = BEAT.pile;
  const [y0, y1] = BEAT.payoff;
  const [c0] = BEAT.close;

  // scene opacities (cross-fades)
  const seaO = s < i1 ? 1 - ramp(s, i1 - 0.5, i1 + 0.3) : s < y0 - 0.6 ? 0 : ramp(s, y0 - 0.6, y0 + 0.2);
  const globeO = s < y0 ? ramp(s, i1 - 0.6, i1 + 0.4) * (1 - ramp(s, y0 - 0.5, y0 + 0.1)) : 0;

  // the soft crop is on only while the globe is the only scene (the sea bleeds by design)
  const crop = clamp01(globeO - seaO);
  const edge = (1 - crop).toFixed(3);
  const edgeMask = `linear-gradient(90deg, rgba(0,0,0,${edge}) 0px, rgba(0,0,0,${edge}) 74px, rgba(0,0,0,1) 124px, rgba(0,0,0,1) 800px, rgba(0,0,0,${edge}) 856px, rgba(0,0,0,${edge}) 1080px)`;

  // labels that ride on objects
  const gs = globeShot(s);
  const taiwan = localToScreen(gs, sph(23.5, 121, GLOBE_R));
  const calif = localToScreen(gs, sph(37, 238.5, GLOBE_R));
  const hawaii = localToScreen(gs, sph(19.6, 204.5, GLOBE_R));
  const ss = seaShot(s);
  const lp = panPos(-1, s);
  const netsTag = localToScreen(ss, new THREE.Vector3(lp.x, lp.y - 0.25, lp.z));
  const day = buoyDayAt(s);

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <ReelGround accent={ACCENT} />
      <AbsoluteFill style={{ transform: breath }}>
        {/* during the globe beats the set is cropped softly to the safe column: the coastlines
            past x 60-870 sit under Instagram's rail and gutter, and nothing there is read */}
        <AbsoluteFill style={{ maskImage: edgeMask, WebkitMaskImage: edgeMask }}>
        <ThreeCanvas
          width={REEL_W}
          height={REEL_H}
          linear
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true }}
          style={{ backgroundColor: 'transparent' }}
        >
          <fog attach="fog" args={[INK, 7.5, 13]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[-3, 5, 6]} intensity={1.3} />
          <directionalLight position={[4, -2, 3]} intensity={0.25} />
          <Sea s={s} opacity={seaO} />
          <Globe s={s} opacity={globeO} />
        </ThreeCanvas>
        </AbsoluteFill>

        {/* names ride on the globe */}
        <Tag from={b0 + 0.3} to={COPY_HERE[0]} x={clampX(taiwan.x)} y={taiwan.y + 40} text="TAIWAN" />
        <Tag from={b0 + 0.3} to={p1 - 0.6} x={clampX(calif.x - 40)} y={calif.y - 34} text="CALIFORNIA" />
        <Tag from={b0 + 0.3} to={p1 - 0.6} x={clampX(hawaii.x)} y={hawaii.y + 38} text="HAWAII" />
        <Tag from={y0 + 2.4} to={c0} x={clampX(netsTag.x)} y={netsTag.y + 60} text={`${NETS_PCT}%`} color={AMBER} size={64} />
      </AbsoluteFill>

      {/* B1 · hook — shows the result */}
      <Head from={h0} to={h1} lines={['ALMOST HALF OF THE', 'GREAT PACIFIC', 'GARBAGE PATCH']} size={48} />
      <Head from={COPY_HOOK_B} to={h1} lines={['IS ONE THING:', 'FISHING NETS.']} size={58} top={480} />
      {/* B2 · the picture in your head */}
      <Head from={i0} to={i0 + 3.0} lines={['MOST PEOPLE PICTURE', 'A FLOATING ISLAND', 'OF BAGS AND BOTTLES.']} size={46} />
      <Head from={i0 + 3.0} to={i1} lines={["IT ISN'T AN ISLAND.", "IT'S SPREAD THIN", 'ACROSS THE OCEAN.']} size={46} />
      {/* B3 · one real buoy */}
      <Head from={b0} to={COPY_DROPPED[0]} lines={['WHY HERE?', 'FOLLOW ONE REAL BUOY.']} size={48} />
      <Head from={COPY_DROPPED[0]} to={COPY_DROPPED[1]} lines={['DROPPED OFF TAIWAN', 'IN 2019.']} size={50} />
      <Head from={COPY_HERE[0]} to={COPY_HERE[1]} lines={['4½ YEARS LATER,', 'IT WAS HERE.']} size={52} />
      <Fade from={t(BUOY_RUN[0] - 0.3)} to={t(b1 - 0.3)} style={{ position: 'absolute', top: 1430, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 40, letterSpacing: 3, color: ACCENT }}>{dateLabel(day)}</div>
      </Fade>
      {/* B4 · why it piles up */}
      <Head from={COPY_OTHERS[0]} to={COPY_OTHERS[1]} lines={['HUNDREDS OF OTHERS', 'DID THE SAME.']} size={50} />
      <Head from={COPY_SCATTER[0]} to={COPY_SCATTER[1]} lines={['SCATTER DEBRIS ACROSS', 'THE WHOLE OCEAN,', 'LET THE REAL CURRENTS', 'CARRY IT…']} size={44} />
      <Head from={COPY_PILES[0]} to={COPY_PILES[1]} lines={['…AND IT PILES UP', 'IN ONE PLACE.']} size={52} />
      <Tag from={PATCH_ON + 0.4} to={p1 - 0.5} x={465} y={1440} text="WHERE THE PATCH WAS MEASURED" color={ACCENT} />
      {/* B5 · payoff */}
      <Head from={y0} to={COPY_HALF[0]} lines={['SO WHAT IS IT MADE OF?']} size={50} />
      <Head from={COPY_HALF[0]} to={y1} lines={['ALMOST HALF OF IT,', 'BY WEIGHT,', 'IS FISHING NETS.']} size={52} />
      <Fade from={t(COPY_HALF[0] + 0.8)} to={t(y1)} style={{ position: 'absolute', top: 1470, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 36, letterSpacing: 2, color: ASH }}>
          MEASURED {SURVEY_YEAR} · LEBRETON ET AL.
        </div>
      </Fade>
      {/* B6 · close */}
      <Fade from={t(c0)} style={{ position: 'absolute', top: 300, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 44, lineHeight: 1.16, letterSpacing: -1, color: BONE }}>
          {"IT'S NOT JUST WHAT"}
          <br />
          WE THROW AWAY.
          <br />
          {"IT'S WHAT FISHING BOATS"}
          <br />
          LEAVE AT SEA.
        </div>
      </Fade>
      <Fade from={t(c0 + 2.2)} style={{ position: 'absolute', top: 1440, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, color: ASH }}>Follow for how the planet actually works.</div>
      </Fade>
    </AbsoluteFill>
  );
};
