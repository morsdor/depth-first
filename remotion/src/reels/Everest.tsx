import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, ease, fmt, t, useBreath } from './lib/chrome';
import {
  BEAT,
  CLIMB_S,
  COPY_FOUR,
  EVEREST_LL,
  INDIA,
  OUTLINES,
  QUATS,
  RACE_KNOTS,
  SAMPLE_FT,
  SURVEY_FT,
  TERRAIN,
} from './data/everest';

/**
 * r017 · I86 — the top of Everest used to be seafloor.
 *
 * ── The spine ────────────────────────────────────────────────────────────
 * The summit is Ordovician limestone (~450 Ma) laid down in a warm shallow sea,
 * with fragments of trilobites, sea lilies, ostracods and brachiopods sampled
 * 6 m below the top (Sakai et al. 2005). India crossed an ocean and the collision
 * stacked that seafloor 29,032 ft above sea level. emit_ts.py asserts 12 claims.
 *
 * ── The one ruler ────────────────────────────────────────────────────────
 * Height above sea level, in feet — one readout. Ages only label when; speed is
 * only ever "x your fingernails".
 *
 * ── Computed, not drawn ──────────────────────────────────────────────────
 *  · the mountain is real elevation (AWS Terrain Tiles, z12), cut as a core of
 *    radius R_CORE around the summit and stood on sea level;
 *  · amber is exactly the terrain at or above the Qomolangma detachment (8,520 m);
 *  · India moves by Seton et al. 2012's rotations (plate 501, Eurasia fixed),
 *    slerped per frame; every other continent by its own plate's rotations.
 * The crash beat's thrust stacking and the fossil fragments are DIAGRAMS — see NOTES.
 *
 * Camera fixed; each scene's root group moves (pos = C - scale * R(focus)).
 */
export const DURATION_SECONDS = 43;

const ACCENT = '#00D6F7'; // DOMAIN_ACCENT.infrastructure — §2: the sea and sea level
const AMBER = '#FFB020'; // the seafloor rock, and nothing else
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

const R_CORE = 3.0; // km: the radius of the mountain core
const KM = 1; // mountain scene units are kilometres

const ramp = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], ease);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
const mixRGB = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const C_AMBER = hex(AMBER);
const C_ASH = hex(ASH);
const C_GRAPHITE = hex(GRAPHITE);
const C_SLATE = hex(SLATE);

const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

// ── camera plan ───────────────────────────────────────────────────────────
type Shot = { focus: THREE.Vector3; scale: number; rx: number; ry: number };
const blend = (a: Shot, b: Shot, k: number): Shot => ({
  focus: a.focus.clone().lerp(b.focus, k),
  scale: Math.exp(lerp(Math.log(a.scale), Math.log(b.scale), k)),
  rx: lerp(a.rx, b.rx, k),
  ry: lerp(a.ry, b.ry, k),
});
const rootOf = (shot: Shot) => {
  const euler = new THREE.Euler(shot.rx, shot.ry, 0, 'XYZ');
  const pos = SCREEN_C.clone().sub(shot.focus.clone().applyEuler(euler).multiplyScalar(shot.scale));
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

const SUMMIT_Y = TERRAIN.demPeakM / 1000;
const MOUNTAIN_SCALE = 0.24;
/** The mountain shot for any second, including its slow orbit. */
function mountainShot(s: number): Shot {
  // the orbit speeds up through the close, so the last beat keeps moving to the cut
  const orbit = -0.6 + 0.09 * s + 0.6 * Math.max(0, s - BEAT.close[0]) ** 1.3 / 4;
  const whole: Shot = { focus: new THREE.Vector3(0, 4.4, 0), scale: MOUNTAIN_SCALE, rx: 0.3, ry: orbit };
  const [h0] = BEAT.hook;
  const [p0] = BEAT.proof;
  const [x0] = BEAT.sea;
  const [y0] = BEAT.payoff;
  if (s < p0) {
    // the hook: opens looking down on the summit, then tips level to show the drop to sea level
    const hi: Shot = { focus: new THREE.Vector3(0, 4.9, 0), scale: 0.235, rx: 0.5, ry: orbit };
    return blend(hi, whole, ramp(s, h0, h0 + 3.2));
  }
  if (s < x0) {
    const close: Shot = { focus: new THREE.Vector3(0, SUMMIT_Y - 0.4, 0), scale: 0.34, rx: 0.5, ry: orbit };
    return blend(whole, close, ramp(s, p0, p0 + 1.4));
  }
  if (s < y0) {
    // the sea: tip down to look at the seafloor forming
    const sea: Shot = { focus: new THREE.Vector3(0, 0.6, 0), scale: MOUNTAIN_SCALE, rx: 0.62, ry: orbit };
    return blend(whole, sea, ramp(s, x0 + 1.0, x0 + 3.4));
  }
  // payoff: from looking up the mountain to looking down from the top
  const up: Shot = { focus: new THREE.Vector3(0, 4.2, 0), scale: MOUNTAIN_SCALE, rx: -0.05, ry: orbit };
  const down: Shot = { focus: new THREE.Vector3(0, 4.4, 0), scale: MOUNTAIN_SCALE, rx: 0.36, ry: orbit };
  const low: Shot = { focus: new THREE.Vector3(0, 5.5, 0), scale: 0.22, rx: 0.42, ry: orbit };
  return blend(blend(up, down, ramp(s, y0 + 0.4, y0 + 4.8)), low, ramp(s, BEAT.close[0] - 0.4, BEAT.close[0] + 1.2));
}

// ── the mountain core: real heights, sampled on a polar mesh ──────────────
const G = TERRAIN.grid;
const CELL_KM = TERRAIN.spanKm / (G - 1);
const CAP = new Set(TERRAIN.cap);
const heightAt = (x: number, z: number): number => {
  // x east, z south, km from the summit (grid centre). Bilinear.
  const c = (G - 1) / 2;
  const gx = Math.max(0, Math.min(G - 1.001, c + x / CELL_KM));
  const gz = Math.max(0, Math.min(G - 1.001, c + z / CELL_KM));
  const i = Math.floor(gx);
  const j = Math.floor(gz);
  const fx = gx - i;
  const fz = gz - j;
  const h = (jj: number, ii: number) => TERRAIN.heights[jj * G + ii];
  return (
    (h(j, i) * (1 - fx) * (1 - fz) + h(j, i + 1) * fx * (1 - fz) + h(j + 1, i) * (1 - fx) * fz + h(j + 1, i + 1) * fx * fz) /
    1000
  );
};
const isCap = (x: number, z: number): boolean => {
  const c = (G - 1) / 2;
  const i = Math.round(c + x / CELL_KM);
  const j = Math.round(c + z / CELL_KM);
  return CAP.has(j * G + i) && heightAt(x, z) * 1000 >= TERRAIN.detachmentM;
};

const NR = 64;
const NS = 160;
const SEAFLOOR_Y = -0.35;

/** flat: 0 = the real mountain, 1 = flattened to the seafloor. */
function buildCore(flat: number) {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const v = (r: number, a: number) => {
    const x = r * Math.cos(a);
    const z = r * Math.sin(a);
    const h = heightAt(x, z);
    const y = lerp(h, SEAFLOOR_Y, flat);
    const up = clamp01((h - 5.0) / 3.6);
    let c = mixRGB(C_GRAPHITE, C_ASH, up * 0.85);
    if (isCap(x, z)) c = C_AMBER;
    c = mixRGB(c, C_GRAPHITE, flat);
    // fade the rim toward slate so the core reads as a cut sample, not a cliff
    c = mixRGB(c, C_SLATE, clamp01((r / R_CORE - 0.82) / 0.18) * 0.55);
    pos.push(x, y, z);
    col.push(...c);
  };
  v(0, 0);
  for (let ri = 1; ri <= NR; ri++) for (let si = 0; si < NS; si++) v((R_CORE * ri) / NR, (2 * Math.PI * si) / NS);
  const at = (ri: number, si: number) => (ri === 0 ? 0 : 1 + (ri - 1) * NS + (si % NS));
  for (let si = 0; si < NS; si++) idx.push(0, at(1, si + 1), at(1, si));
  for (let ri = 1; ri < NR; ri++)
    for (let si = 0; si < NS; si++) {
      idx.push(at(ri, si), at(ri, si + 1), at(ri + 1, si));
      idx.push(at(ri, si + 1), at(ri + 1, si + 1), at(ri + 1, si));
    }
  // the skirt: from the rim straight down to sea level
  const base = pos.length / 3;
  for (let si = 0; si <= NS; si++) {
    const a = (2 * Math.PI * si) / NS;
    const x = R_CORE * Math.cos(a);
    const z = R_CORE * Math.sin(a);
    const y = lerp(heightAt(x, z), SEAFLOOR_Y, flat);
    const shade = 0.55 + 0.45 * Math.max(0, Math.sin(a + 0.9));
    const c = mixRGB(C_SLATE, C_GRAPHITE, shade * 0.6);
    pos.push(x, y, z, x, Math.min(0, y) - 0.25 * flat, z);
    col.push(...c, ...c);
  }
  for (let si = 0; si < NS; si++) {
    const a = base + 2 * si;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Strata rings on the skirt: one every kilometre of height. */
const Strata: React.FC<{ opacity: number; flat: number }> = ({ opacity, flat }) => {
  const rings = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (let km = 1; km <= 8; km++) {
      const pts: THREE.Vector3[] = [];
      for (let si = 0; si <= NS; si++) {
        const a = (2 * Math.PI * si) / NS;
        const x = R_CORE * 1.002 * Math.cos(a);
        const z = R_CORE * 1.002 * Math.sin(a);
        if (heightAt(x / 1.002, z / 1.002) > km) pts.push(new THREE.Vector3(x, km, z));
        else if (pts.length) {
          out.push(new THREE.BufferGeometry().setFromPoints(pts.splice(0)));
        }
      }
      if (pts.length > 1) out.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
    return out;
  }, []);
  if (flat > 0.02) return null;
  return (
    <>
      {rings.map((g, i) => (
         
        <line key={i}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial color={ASH} transparent opacity={opacity * 0.3} />
        </line>
      ))}
    </>
  );
};

const Ring: React.FC<{ r: number; y: number; color: string; opacity: number; dashed?: boolean }> = ({
  r,
  y,
  color,
  opacity,
  dashed,
}) => {
  const g = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) pts.push(new THREE.Vector3(r * Math.cos((i / 160) * 2 * Math.PI), 0, r * Math.sin((i / 160) * 2 * Math.PI)));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [r]);
  if (dashed) {
    return (
      <lineSegments position={[0, y, 0]}>
        <primitive object={g} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </lineSegments>
    );
  }
  return (
    <group position={[0, y, 0]}>
      { }
      <line>
        <primitive object={g} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </line>
    </group>
  );
};

/** The plumb line: the core's own axis, summit to sea level, drawn THROUGH the rock (an x-ray). */
const Plumb: React.FC<{ opacity: number; marker: number | null }> = ({ opacity, marker }) => {
  const g = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let y = 0; y < SUMMIT_Y; y += 0.36) pts.push(new THREE.Vector3(0, y, 0), new THREE.Vector3(0, Math.min(y + 0.18, SUMMIT_Y), 0));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  return (
    <group renderOrder={10}>
      <lineSegments renderOrder={10}>
        <primitive object={g} attach="geometry" />
        <lineBasicMaterial color={BONE} transparent opacity={opacity * 0.8} depthTest={false} />
      </lineSegments>
      {marker !== null && (
        <mesh position={[0, marker * SUMMIT_Y, 0]} renderOrder={11}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={opacity} depthTest={false} />
        </mesh>
      )}
    </group>
  );
};

const SED: [number, number, number][] = (() => {
  const r = rng(450);
  return Array.from({ length: 140 }, () => [r(), r(), r()] as [number, number, number]);
})();

/** The sea: a water column between the seafloor and sea level, and lime mud settling. */
const Sea: React.FC<{ s: number; opacity: number; layer: number }> = ({ s, opacity, layer }) => {
  const N = 140;
  const geo = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
  return (
    <>
      <mesh position={[0, SEAFLOOR_Y / 2, 0]}>
        <cylinderGeometry args={[R_CORE, R_CORE, -SEAFLOOR_Y, 96, 1, true]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.16 * opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R_CORE, 96]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.1 * opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[0.35, 0.6, 0.85].map((f, i) => (
        <Ring key={i} r={R_CORE * ((f + 0.08 * Math.sin(s * 1.3 + i)) % 1)} y={0.002} color={ACCENT} opacity={0.5 * opacity} />
      ))}
      {/* the deposited layer: amber, flat, growing */}
      <mesh position={[0, SEAFLOOR_Y + 0.005 + layer * 0.06, 0]}>
        <cylinderGeometry args={[R_CORE * 0.995, R_CORE * 0.995, Math.max(0.002, layer * 0.12), 96]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.35} transparent opacity={opacity} />
      </mesh>
      {Array.from({ length: N }, (_, i) => {
        const a = 2 * Math.PI * SED[i][0];
        const r = R_CORE * 0.92 * Math.sqrt(SED[i][1]);
        const u = ((s * 0.42 + SED[i][2]) % 1 + 1) % 1;
        const y = lerp(-0.01, SEAFLOOR_Y + layer * 0.12, u);
        return (
          <mesh key={i} geometry={geo} position={[r * Math.cos(a), y, r * Math.sin(a)]} scale={0.045}>
            <meshBasicMaterial color={BONE} transparent opacity={opacity * 0.85 * Math.sin(Math.PI * u)} />
          </mesh>
        );
      })}
    </>
  );
};

/** Close: chevrons on the sea-level plane, pressing north out of India (south, +z). */
const Push: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const g = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.55, 0, 0.3),
        new THREE.Vector3(0, 0, -0.1),
        new THREE.Vector3(0, 0, -0.1),
        new THREE.Vector3(0.55, 0, 0.3),
      ]),
    [],
  );
  return (
    <>
      {[0, 1, 2].map((i) => {
        const u = ((s * 0.5 + i / 3) % 1 + 1) % 1;
        return (
          <lineSegments key={i} position={[0, 0.01, R_CORE + 1.6 - 1.2 * u]}>
            <primitive object={g} attach="geometry" />
            <lineBasicMaterial color={ASH} transparent opacity={opacity * Math.sin(Math.PI * u)} />
          </lineSegments>
        );
      })}
    </>
  );
};

const Mountain: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const [x0, x1] = BEAT.sea;
  const [, c1] = BEAT.close;
  const [y0] = BEAT.payoff;
  const [c0] = BEAT.close;
  const flat = s >= x0 && s < x1 ? ramp(s, x0 + 0.6, x0 + 2.6) : 0;
  const flatKey = Math.round(flat * 40);
  const core = useMemo(() => buildCore(flatKey / 40), [flatKey]);
  const shot = mountainShot(s);
  const { pos, euler, scale } = rootOf(shot);
  const seaOn = s >= x0 && s < x1 ? ramp(s, x0 + 0.6, x0 + 1.6) : 0;
  const layer = s >= x0 && s < x1 ? ramp(s, x0 + 2.2, x1 - 0.6) : 0;
  const [p0] = BEAT.proof;
  // while the camera is close on the summit, sea level is below the frame: keep it out of the edge band
  const close = s >= p0 && s < x0 ? ramp(s, p0, p0 + 0.6) : 0;
  const seaLevel = 1 - close;
  const plumb = (s < x0 || s >= y0 ? 1 : 0) * seaLevel;
  const marker = s >= y0 && s < c0 ? ramp(s, y0 + 0.4, y0 + 4.8) : null;
  const push = s >= c0 ? ramp(s, c0, c0 + 1) * (1 - ramp(s, c1 - 0.4, c1)) : 0;
  if (opacity < 0.01) return null;
  return (
    <group position={pos.toArray()} rotation={euler} scale={scale * KM}>
      <mesh>
        <primitive object={core} attach="geometry" />
        <meshStandardMaterial vertexColors roughness={0.95} metalness={0} transparent opacity={opacity} />
      </mesh>
      <Strata opacity={opacity * seaLevel} flat={flat} />
      {/* sea level */}
      <Ring r={R_CORE * 1.12} y={0} color={ACCENT} opacity={opacity * 0.9 * seaLevel} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <ringGeometry args={[R_CORE, R_CORE * 1.12, 96]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.13 * opacity * seaLevel} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {seaOn > 0.01 && <Sea s={s} opacity={opacity * seaOn} layer={layer} />}
      {plumb > 0 && <Plumb opacity={opacity * plumb} marker={marker} />}
      {push > 0.01 && <Push s={s} opacity={opacity * push} />}
    </group>
  );
};

// ── the rock face: fossil fragments in the summit limestone (a DIAGRAM) ─────
type Frag = { kind: 'ossicle' | 'stem' | 'shell' | 'tribit' | 'ostracod'; x: number; y: number; r: number; a: number; t0: number };

const FRAGS: Frag[] = (() => {
  const r = rng(86);
  const kinds: Frag['kind'][] = ['ossicle', 'stem', 'shell', 'tribit', 'ostracod'];
  const out: Frag[] = [];
  for (let i = 0; i < 18; i++) {
    out.push({
      kind: kinds[i % kinds.length],
      x: -0.72 + 1.44 * r(),
      y: -0.44 + 0.88 * r(),
      r: 0.075 + 0.045 * r(),
      a: 2 * Math.PI * r(),
      t0: 4.8 + 2.6 * (i / 17),
    });
  }
  // the named trilobite fragment, near the face's upper right, lit first
  out.push({ kind: 'tribit', x: 0.42, y: 0.18, r: 0.13, a: 0.2, t0: 4.75 });
  return out;
})();
const NAMED = FRAGS[FRAGS.length - 1];

function fragGeometry(f: Frag): THREE.BufferGeometry {
  const P: THREE.Vector3[] = [];
  const seg = (ax: number, ay: number, bx: number, by: number) => P.push(new THREE.Vector3(ax, ay, 0), new THREE.Vector3(bx, by, 0));
  const arc = (cx: number, cy: number, rr: number, a0: number, a1: number, n = 14) => {
    for (let i = 0; i < n; i++) {
      const u0 = a0 + ((a1 - a0) * i) / n;
      const u1 = a0 + ((a1 - a0) * (i + 1)) / n;
      seg(cx + rr * Math.cos(u0), cy + rr * Math.sin(u0), cx + rr * Math.cos(u1), cy + rr * Math.sin(u1));
    }
  };
  const r = f.r;
  if (f.kind === 'ossicle') {
    arc(0, 0, r * 0.6, 0, 2 * Math.PI);
    arc(0, 0, r * 0.15, 0, 2 * Math.PI, 8);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * 2 * Math.PI;
      seg(r * 0.2 * Math.cos(a), r * 0.2 * Math.sin(a), r * 0.5 * Math.cos(a), r * 0.5 * Math.sin(a));
    }
  } else if (f.kind === 'stem') {
    for (let k = 0; k < 5; k++) {
      const x0 = -r + (k * 2 * r) / 5;
      seg(x0, -r * 0.22, x0, r * 0.22);
    }
    seg(-r, -r * 0.22, r, -r * 0.22);
    seg(-r, r * 0.22, r, r * 0.22);
  } else if (f.kind === 'shell') {
    arc(0, 0, r, 0.15 * Math.PI, 0.85 * Math.PI);
    seg(r * Math.cos(0.15 * Math.PI), r * Math.sin(0.15 * Math.PI), -r * 0.6, -r * 0.1);
    for (let k = 1; k < 6; k++) {
      const a = (0.15 + (0.7 * k) / 6) * Math.PI;
      seg(0, -r * 0.05, r * Math.cos(a), r * Math.sin(a));
    }
  } else if (f.kind === 'tribit') {
    // a broken piece of a trilobite: part of the head shield and a few ribbed segments
    arc(0, r * 0.35, r * 0.75, 0.05 * Math.PI, 0.95 * Math.PI);
    seg(-r * 0.75, r * 0.35, r * 0.75, r * 0.35);
    for (let k = 0; k < 4; k++) {
      const y = r * 0.25 - k * r * 0.22;
      const w = r * (0.7 - k * 0.06);
      seg(-w, y, w, y);
    }
    seg(-r * 0.2, r * 0.35, -r * 0.2, -r * 0.45);
    seg(r * 0.2, r * 0.35, r * 0.2, -r * 0.45);
  } else {
    arc(0, 0, r * 0.4, 0, 2 * Math.PI, 12);
    seg(-r * 0.4, 0, r * 0.4, 0);
  }
  return new THREE.BufferGeometry().setFromPoints(P);
}

const FACE_W = 1.62;
const FACE_H = 1.04;
function rockShot(s: number): Shot {
  const k = s - BEAT.proof[0];
  return { focus: new THREE.Vector3(0, 0, 0), scale: 0.9 + 0.025 * k, rx: 0.12 + 0.03 * Math.sin(k * 0.9), ry: -0.42 + 0.11 * k };
}

const RockFace: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const geos = useMemo(() => FRAGS.map(fragGeometry), []);
  const { pos, euler, scale } = rootOf(rockShot(s));
  if (opacity < 0.01) return null;
  return (
    <group position={pos.toArray()} rotation={euler} scale={scale}>
      <mesh>
        <boxGeometry args={[FACE_W, FACE_H, 0.3]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.25} roughness={1} transparent opacity={opacity} />
      </mesh>
      {FRAGS.map((f, i) => {
        const on = ramp(s, f.t0, f.t0 + 0.5);
        return (
          <lineSegments key={i} position={[f.x, f.y, 0.152]} rotation={[0, 0, f.a]}>
            <primitive object={geos[i]} attach="geometry" />
            <lineBasicMaterial color={INK} transparent opacity={opacity * (0.25 + 0.75 * on)} />
          </lineSegments>
        );
      })}
    </group>
  );
};

// ── the globe ─────────────────────────────────────────────────────────────
const GLOBE_R = 0.84;
type Q = [number, number, number, number];
const qAt = (pid: number, age: number): Q => {
  const qs = QUATS[String(pid)];
  const a0 = Math.max(0, Math.min(79, Math.floor(age)));
  const k = clamp01(age - a0);
  const q0 = qs.slice(4 * a0, 4 * a0 + 4) as unknown as Q;
  const q1 = qs.slice(4 * a0 + 4, 4 * a0 + 8) as unknown as Q;
  // slerp
  let d = q0[0] * q1[0] + q0[1] * q1[1] + q0[2] * q1[2] + q0[3] * q1[3];
  const s1 = d < 0 ? -1 : 1;
  d = Math.abs(d);
  if (d > 0.9995) return q0.map((v, i) => lerp(v, s1 * q1[i], k)) as Q;
  const th = Math.acos(d);
  const w0 = Math.sin((1 - k) * th) / Math.sin(th);
  const w1 = (s1 * Math.sin(k * th)) / Math.sin(th);
  return q0.map((v, i) => w0 * v + w1 * q1[i]) as Q;
};
/** lat/lon -> rotated by q (pygplates frame) -> three.js (x = east-ish, y = north, z = toward lon 0). */
const place = (q: Q, lat: number, lon: number, r: number): [number, number, number] => {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  const v = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  const [w, x, y, z] = q;
  const u = [x, y, z];
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const c1 = cross(u, v).map((c, i) => c + w * v[i]);
  const c2 = cross(u, c1);
  const p = v.map((vi, i) => vi + 2 * c2[i]);
  return [p[1] * r, p[2] * r, p[0] * r];
};

function ageAt(s: number): number {
  const K = RACE_KNOTS;
  if (s <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) {
    const [s0, a0] = K[i];
    const [s1, a1] = K[i + 1];
    if (s <= s1) return a0 + ((a1 - a0) * (s - s0)) / (s1 - s0);
  }
  return K[K.length - 1][1];
}

const Globe: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const age = ageAt(s);
  const qI = qAt(501, age);
  const outlineGeos = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (const o of OUTLINES) {
      const q = qAt(o.pid, age);
      const arr = new Float32Array(o.ll.length * 3);
      o.ll.forEach(([la, lo], i) => arr.set(place(q, la, lo, GLOBE_R * 1.003), 3 * i));
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      out.push(g);
    }
    return out;
  }, [age]);
  const india = useMemo(() => {
    const arr = new Float32Array(INDIA.ll.length * 3);
    INDIA.ll.forEach(([la, lo], i) => arr.set(place(qI, la, lo, GLOBE_R * 1.006), 3 * i));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    g.setIndex(INDIA.tris.flat());
    const ring = new Float32Array(INDIA.ring.length * 3);
    INDIA.ring.forEach(([la, lo], i) => ring.set(place(qI, la, lo, GLOBE_R * 1.008), 3 * i));
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.BufferAttribute(ring, 3));
    return { g, rg };
  }, [qI]);
  const dot = place(qI, EVEREST_LL[0], EVEREST_LL[1], GLOBE_R * 1.012);
  // the ocean ahead: a great-circle arc from the amber dot to Asia's edge south of Everest
  const arc = useMemo(() => {
    const a = new THREE.Vector3(...place(qI, EVEREST_LL[0], EVEREST_LL[1], 1)).normalize();
    const b = new THREE.Vector3(...place([1, 0, 0, 0], 29.3, 87.0, 1)).normalize();
    const pts: THREE.Vector3[] = [];
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const v = a.clone().lerp(b, i / n).normalize().multiplyScalar(GLOBE_R * 1.01);
      pts.push(v);
    }
    const seg: THREE.Vector3[] = [];
    for (let i = 0; i < n; i += 2) seg.push(pts[i], pts[i + 1]);
    return new THREE.BufferGeometry().setFromPoints(seg);
  }, [qI]);
  // view: centred between India and Asia, drifting north with India
  const sweep = clamp01((s - BEAT.race[0]) / (BEAT.race[1] - BEAT.race[0]));
  const lat = lerp(-14, 14, sweep);
  const lon = lerp(40, 92, sweep);
  const shot: Shot = {
    focus: new THREE.Vector3(0, 0, 0),
    scale: 1,
    rx: (lat * Math.PI) / 180,
    ry: (-lon * Math.PI) / 180,
  };
  const { pos, euler } = rootOf(shot);
  if (opacity < 0.01) return null;
  return (
    <group position={pos.toArray()} rotation={euler}>
      <mesh>
        <sphereGeometry args={[GLOBE_R, 72, 48]} />
        <meshStandardMaterial color={SLATE} emissive={ACCENT} emissiveIntensity={0.14} roughness={1} transparent opacity={opacity} />
      </mesh>
      {outlineGeos.map((g, i) => (
         
        <line key={i}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial color={ASH} transparent opacity={opacity * 0.55} />
        </line>
      ))}
      <mesh>
        <primitive object={india.g} attach="geometry" />
        <meshBasicMaterial color={ASH} transparent opacity={opacity * 0.85} side={THREE.DoubleSide} />
      </mesh>
      { }
      <line>
        <primitive object={india.rg} attach="geometry" />
        <lineBasicMaterial color={BONE} transparent opacity={opacity} />
      </line>
      <lineSegments>
        <primitive object={arc} attach="geometry" />
        <lineBasicMaterial color={ACCENT} transparent opacity={opacity * 0.9} />
      </lineSegments>
      <mesh position={dot}>
        <sphereGeometry args={[0.026, 16, 16]} />
        <meshBasicMaterial color={AMBER} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

// ── the crash: a cut-away block (a DIAGRAM of thrust stacking) ──────────────
const N_SHEETS = 7;
const SHEET_L = 0.34;
const SHEET_T = 0.055;
const INDIA_L = 1.2;
const CONTACT_X = -0.02;
const FRONT_END = 0.36;
/** India's front edge x (block-local), over the crash beat. */
const indiaFront = (s: number) => lerp(-0.42, FRONT_END, ramp(s, BEAT.crash[0] + 0.5, CLIMB_S[1]));
/** Sheets scraped off at the contact so far (fractional, 0..N_SHEETS). */
const scraped = (s: number) => clamp01((indiaFront(s) - CONTACT_X) / (FRONT_END - CONTACT_X)) * N_SHEETS;
const BLOCK_SCALE = 0.74;
const blockShot = (s: number): Shot => ({
  focus: new THREE.Vector3(-0.2, 0.12 + 0.03 * (s - BEAT.crash[0]), 0),
  scale: BLOCK_SCALE * (0.92 + 0.02 * (s - BEAT.crash[0])),
  rx: 0.32,
  ry: -0.75 + 0.13 * (s - BEAT.crash[0]),
});

const Slab: React.FC<{ p: [number, number, number]; size: [number, number, number]; color: string; rz?: number; o: number; edge?: string; sx?: number; glow?: number }> = ({
  p,
  size,
  color,
  rz = 0,
  o,
  edge = ASH,
  sx = 1,
  glow = 0.35,
}) => {
  const box = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);
  return (
    <group position={p} rotation={[0, 0, rz]} scale={[sx, 1, 1]}>
      <mesh geometry={box}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={1} transparent opacity={o} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={edge} transparent opacity={o * 0.8} />
      </lineSegments>
    </group>
  );
};

const Block: React.FC<{ s: number; opacity: number }> = ({ s, opacity }) => {
  const front = indiaFront(s);
  const n = scraped(s);
  const { pos, euler, scale } = rootOf(blockShot(s));
  if (opacity < 0.01) return null;
  // India's own amber layer runs from its back edge up to the contact; past the contact it has
  // been scraped off. In India-local x (India's front at 0):
  const layerEnd = Math.min(0, CONTACT_X - front);
  const layerLen = Math.max(0.001, layerEnd + INDIA_L);
  const sheets: React.ReactNode[] = [];
  for (let k = 0; k < Math.min(N_SHEETS, Math.ceil(n)); k++) {
    // imbrication: each newer sheet comes in at the bottom of the stack and lifts the older ones
    const grow = clamp01(n - k);
    const level = Math.max(0, n - 1 - k);
    sheets.push(
      <Slab
        key={k}
        p={[CONTACT_X - 0.1 - 0.05 * level, 0.04 + level * 0.1, 0]}
        size={[SHEET_L, SHEET_T, 0.56]}
        color={AMBER}
        rz={-0.32}
        o={opacity}
        edge={INK}
        sx={Math.max(0.05, grow)}
      />,
    );
  }
  return (
    <group position={pos.toArray()} rotation={euler} scale={scale}>
      {/* Asia: holds still */}
      <Slab p={[0.42, -0.18, 0]} size={[0.8, 0.36, 0.6]} color={GRAPHITE} o={opacity} glow={1.6} />
      {/* India: slides north, its front dipping under Asia */}
      <group position={[front, -0.2, 0]} rotation={[0, 0, -0.12]}>
        <Slab p={[-INDIA_L / 2, 0, 0]} size={[INDIA_L, 0.26, 0.58]} color={ASH} o={opacity} />
        <Slab p={[-INDIA_L + layerLen / 2, 0.13 + SHEET_T / 2, 0]} size={[layerLen, SHEET_T, 0.58]} color={AMBER} o={opacity} edge={INK} />
      </group>
      {sheets}
    </group>
  );
};

// ── text ──────────────────────────────────────────────────────────────────
const Head: React.FC<{ from: number; to: number; lines: string[]; size?: number; top?: number }> = ({
  from,
  to,
  lines,
  size = 46,
  top = 300,
}) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top, left: 70, width: 790, textAlign: 'center' }}>
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily: 'Archivo Black', fontSize: size, lineHeight: 1.16, letterSpacing: -1, color: BONE }}>
        {l}
      </div>
    ))}
  </Fade>
);

const Readout: React.FC<{ from: number; to: number; x: number; y: number; ft: number; align?: 'left' | 'right' }> = ({
  from,
  to,
  x,
  y,
  ft,
  align = 'left',
}) => (
  <Fade
    from={t(from)}
    to={t(to)}
    style={{
      position: 'absolute',
      top: y - 30,
      left: align === 'left' ? x : undefined,
      right: align === 'right' ? REEL_W - x : undefined,
      fontFamily: 'IBM Plex Mono',
      fontWeight: 600,
      fontSize: 44,
      letterSpacing: 1,
      color: BONE,
      whiteSpace: 'nowrap',
    }}
  >
    {fmt(ft)} FT
  </Fade>
);

const Tag: React.FC<{ from: number; to: number; x: number; y: number; text: string; color?: string }> = ({
  from,
  to,
  x,
  y,
  text,
  color = ASH,
}) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top: y - 22, left: x - 200, width: 400, textAlign: 'center' }}>
    <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 36, letterSpacing: 3, color }}>{text}</div>
  </Fade>
);

/** A whole trilobite, drawn: the labelled key for the fragments in the rock. */
const TrilobiteKey: React.FC<{ from: number; to: number; x: number; y: number; size?: number; label?: boolean }> = ({
  from,
  to,
  x,
  y,
  size = 150,
  label = true,
}) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', left: x - size / 2, top: y - size * 0.62 }}>
    <svg width={size} height={size * 1.25} viewBox="-60 -75 120 150">
      <g fill="none" stroke={BONE} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M -52 -18 A 52 52 0 0 1 52 -18 Z" />
        <path d="M -52 -18 L -60 22 M 52 -18 L 60 22" />
        <ellipse cx={0} cy={-42} rx={13} ry={17} />
        {Array.from({ length: 8 }, (_, k) => {
          const yy = -10 + k * 9;
          const w = 46 - k * 2.5;
          return <path key={k} d={`M ${-w} ${yy} L ${w} ${yy}`} />;
        })}
        <path d="M -14 -18 L -14 58 M 14 -18 L 14 58" />
        <path d="M -30 60 A 30 22 0 0 0 30 60 Z" />
      </g>
    </svg>
    {label && (
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 36, letterSpacing: 3, color: BONE, textAlign: 'center', width: size, marginLeft: 0 }}>
        TRILOBITE
      </div>
    )}
  </Fade>
);

/** A thin leader line in screen space. */
const Leader: React.FC<{ from: number; to: number; a: { x: number; y: number }; b: { x: number; y: number } }> = ({ from, to, a, b }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [t(from), t(from) + 8, t(to) - 5, t(to)], [0, 1, 1, 0], ease);
  return (
    <svg width={REEL_W} height={REEL_H} style={{ position: 'absolute', left: 0, top: 0, opacity: o }}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={BONE} strokeWidth={3} />
    </svg>
  );
};

// ── the reel ──────────────────────────────────────────────────────────────
export const Everest: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const breath = useBreath();

  const [h0, h1] = BEAT.hook;
  const [p0, p1] = BEAT.proof;
  const [x0, x1] = BEAT.sea;
  const [r0, r1] = BEAT.race;
  const [k0, k1] = BEAT.crash;
  const [y0, y1] = BEAT.payoff;
  const [c0] = BEAT.close;

  // scene opacities (cross-fades)
  const mountainO =
    s < p0 + 1.0
      ? 1
      : s < x0
        ? 1 - ramp(s, p0 + 1.0, p0 + 1.6)
        : s < r0
          ? ramp(s, x0, x0 + 0.6) * (1 - ramp(s, r0 - 0.1, r0 + 0.5))
          : s < y0
            ? 0
            : ramp(s, y0, y0 + 0.7);
  const rockO = s >= p0 + 1.0 && s < x0 + 0.6 ? ramp(s, p0 + 1.0, p0 + 1.6) * (1 - ramp(s, x0, x0 + 0.6)) : 0;
  const globeO = s >= r0 && s < k0 + 0.6 ? ramp(s, r0, r0 + 0.6) * (1 - ramp(s, k0, k0 + 0.6)) : 0;
  const blockO = s >= k0 && s < y0 + 0.7 ? ramp(s, k0, k0 + 0.6) * (1 - ramp(s, y0, y0 + 0.7)) : 0;

  // labels that ride on objects
  const ms = mountainShot(s);
  const summitPx = localToScreen(ms, new THREE.Vector3(0, SUMMIT_Y, 0));
  const markerPx = localToScreen(ms, new THREE.Vector3(0, (Math.round(SURVEY_FT * ramp(s, y0 + 0.4, y0 + 4.8)) / SURVEY_FT) * SUMMIT_Y, 0));
  const namedPx = localToScreen(rockShot(s), new THREE.Vector3(NAMED.x, NAMED.y, 0.15));
  const age = Math.round(ageAt(s));
  // the height readout climbs WITH the stack, never against a clock (the uplift's timing is not known)
  const climbFt = s >= CLIMB_S[1] ? SURVEY_FT : Math.round((SURVEY_FT * scraped(s)) / N_SHEETS);
  const bs = blockShot(s);
  const indiaTag = localToScreen(bs, new THREE.Vector3(indiaFront(s) - 0.6, -0.5, 0.3));
  const asiaTag = localToScreen(bs, new THREE.Vector3(0.42, -0.5, 0.3));
  const markerFt = Math.round(SURVEY_FT * ramp(s, y0 + 0.4, y0 + 4.8));

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
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
          <ambientLight intensity={0.55} />
          <directionalLight position={[-3, 5, 6]} intensity={1.3} />
          <directionalLight position={[4, -2, 3]} intensity={0.25} />
          <Mountain s={s} opacity={mountainO} />
          <RockFace s={s} opacity={rockO} />
          <Globe s={s} opacity={globeO} />
          <Block s={s} opacity={blockO} />
        </ThreeCanvas>

        {/* labels on the 3D objects */}
        <Readout from={h0 + 0.3} to={p0 + 1.0} x={summitPx.x + 40} y={summitPx.y} ft={SURVEY_FT} />
        <TrilobiteKey from={h0 + 1.2} to={p0 + 1.0} x={summitPx.x - 250} y={summitPx.y + 150} size={120} label={false} />
        <Leader from={h0 + 1.4} to={p0 + 1.0} a={{ x: summitPx.x - 190, y: summitPx.y + 120 }} b={{ x: summitPx.x - 10, y: summitPx.y + 14 }} />

        <TrilobiteKey from={p0 + 2.0} to={x0} x={250} y={1300} size={150} />
        <Leader from={p0 + 2.2} to={x0} a={{ x: 330, y: 1250 }} b={{ x: namedPx.x - 10, y: namedPx.y + 10 }} />

        <Tag from={k0 + 0.4} to={k0 + 2.6} x={indiaTag.x} y={indiaTag.y} text="INDIA" />
        <Tag from={k0 + 0.4} to={k0 + 2.6} x={asiaTag.x} y={asiaTag.y} text="ASIA" />
        <Readout from={CLIMB_S[0]} to={k1} x={465} y={1440} ft={climbFt} align="left" />

        <Readout from={y0 + 0.4} to={c0} x={markerPx.x + 40} y={markerPx.y} ft={markerFt} />
        <TrilobiteKey from={y0 + 4.6} to={c0} x={summitPx.x - 250} y={summitPx.y + 150} size={120} label={false} />
        <Leader from={y0 + 4.7} to={c0} a={{ x: summitPx.x - 190, y: summitPx.y + 120 }} b={{ x: summitPx.x - 10, y: summitPx.y + 14 }} />
      </AbsoluteFill>

      {/* B1 · hook — shows the result */}
      <Head from={h0} to={h1} lines={['THE TOP OF EVEREST', 'USED TO BE SEAFLOOR.']} size={52} />
      {/* B2 · the proof */}
      <Head from={p0} to={p0 + 3.6} lines={['THE ROCK UP THERE IS FULL OF', 'FOSSIL SEA CREATURES.']} size={42} />
      <Head from={p0 + 3.6} to={p1} lines={[`COLLECTED ${SAMPLE_FT} FEET`, 'BELOW THE SUMMIT.']} size={46} />
      {/* B3 · where it formed */}
      <Head from={x0} to={x1} lines={['IT FORMED 450 MILLION YEARS AGO', 'ON THE FLOOR OF A WARM,', 'SHALLOW SEA.']} size={40} />
      {/* B4 · the race */}
      <Head from={r0} to={COPY_FOUR[0]} lines={['THEN INDIA BROKE AWAY', 'AND RACED NORTH ACROSS', 'AN OCEAN.']} size={44} />
      <Head from={COPY_FOUR[0]} to={COPY_FOUR[1]} lines={['FOUR TIMES FASTER THAN', 'YOUR FINGERNAILS GROW.']} size={46} />
      <Fade from={t(r0 + 0.4)} to={t(r1)} style={{ position: 'absolute', top: 1400, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 40, letterSpacing: 2, color: ASH }}>
          {age} MILLION YEARS AGO
        </div>
      </Fade>
      {/* B5 · the crash */}
      <Head from={k0} to={k1} lines={['50 MILLION YEARS AGO IT HIT ASIA,', 'AND THE SEAFLOOR WAS CRUMPLED', 'AND STACKED INTO MOUNTAINS.']} size={38} />
      {/* B6 · payoff */}
      <Head from={y0} to={y1} lines={['FROM THE SEAFLOOR', `TO ${fmt(SURVEY_FT)} FEET.`]} size={52} />
      {/* B7 · close */}
      <Fade from={t(c0)} style={{ position: 'absolute', top: 300, left: 70, width: 790, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 40, lineHeight: 1.16, letterSpacing: -1, color: BONE }}>
          INDIA IS STILL PUSHING INTO ASIA
          <br />
          AT ABOUT THE SPEED YOUR
          <br />
          FINGERNAILS GROW.
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, color: ASH, marginTop: 18 }}>
          Follow for how the planet actually works.
        </div>
      </Fade>
    </AbsoluteFill>
  );
};
