import * as THREE from 'three';

/**
 * Geometry helpers for map reels: polylines drawn as flat ribbons (a 1px GL line is a hairline at 1080 wide, and the
 * brand look needs routes with weight), partial-polyline reveals, and a camera-to-screen projector so HTML labels can
 * ride on 3D objects.
 *
 * The camera never moves — a wrapping <group> does (r015's lesson) — so projecting a map point to the screen is the
 * group matrix followed by the fixed camera, reproduced here with the same three.js maths the renderer uses.
 */

export type Pt = number[]; // [x, y] in km

export const polyLen = (p: Pt[]): number => {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  return L;
};

/** The first `f` (0..1) of a polyline, by length. */
export function slicePoly(p: Pt[], f: number): Pt[] {
  if (f >= 1) return p;
  if (f <= 0 || p.length < 2) return [p[0], p[0]];
  const target = f * polyLen(p);
  const out: Pt[] = [p[0]];
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const seg = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + seg >= target) {
      const t = seg === 0 ? 0 : (target - acc) / seg;
      out.push([p[i - 1][0] + t * (p[i][0] - p[i - 1][0]), p[i - 1][1] + t * (p[i][1] - p[i - 1][1])]);
      return out;
    }
    out.push(p[i]);
    acc += seg;
  }
  return out;
}

export const pointAt = (p: Pt[], f: number): Pt => {
  const s = slicePoly(p, Math.max(0.0001, f));
  return s[s.length - 1];
};

/** A polyline as a triangle strip `width` km wide, lying in the z = `z` plane. */
export function ribbon(pts: Pt[], width: number, z = 0): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const n = pts.length;
  if (n < 2) return g;
  const pos = new Float32Array(n * 2 * 3);
  const idx: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    const nx = (-dy * width) / 2;
    const ny = (dx * width) / 2;
    pos.set([pts[i][0] + nx, pts[i][1] + ny, z, pts[i][0] - nx, pts[i][1] - ny, z], i * 6);
    if (i < n - 1) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** A straight dashed line a -> b as ONE geometry (alternating short ribbons). `f` reveals it from a toward b. */
export function dashedRibbon(a: Pt, b: Pt, dash: number, gap: number, width: number, f = 1, z = 0): THREE.BufferGeometry {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const end = L * Math.min(1, Math.max(0, f));
  const dx = (b[0] - a[0]) / (L || 1);
  const dy = (b[1] - a[1]) / (L || 1);
  const nx = (-dy * width) / 2;
  const ny = (dx * width) / 2;
  const pos: number[] = [];
  const idx: number[] = [];
  let s = 0;
  while (s < end) {
    const e = Math.min(s + dash, end);
    const x0 = a[0] + dx * s;
    const y0 = a[1] + dy * s;
    const x1 = a[0] + dx * e;
    const y1 = a[1] + dy * e;
    const k = pos.length / 3;
    pos.push(x0 + nx, y0 + ny, z, x0 - nx, y0 - ny, z, x1 + nx, y1 + ny, z, x1 - nx, y1 - ny, z);
    idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    s += dash + gap;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos.length ? pos : [0, 0, 0]), 3));
  g.setIndex(idx);
  return g;
}

export interface Pose {
  fx: number; // km — the map point held at the screen centre
  fy: number;
  scale: number;
  tilt: number; // rad about X: 0 = straight down, ~1 = oblique
  rot: number; // rad about Z
}

/** The group transform that puts (fx, fy) at the world origin whatever the tilt/rotation (r015's trick). */
export function groupTransform(p: Pose) {
  const e = new THREE.Euler(p.tilt, 0, p.rot, 'XYZ');
  const f = new THREE.Vector3(p.fx, p.fy, 0).multiplyScalar(p.scale).applyEuler(e);
  return { position: [-f.x, -f.y, -f.z] as [number, number, number], rotation: [p.tilt, 0, p.rot] as [number, number, number], scale: p.scale };
}

/** Screen pixels (in the 1080x1920 frame, BEFORE any stage offset) of a map point at height z. */
export function makeProjector(camZ: number, fov: number, w = 1080, h = 1920) {
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.1, 200);
  cam.position.set(0, 0, camZ);
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const m = new THREE.Matrix4();
  const v = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const eu = new THREE.Euler();
  return (pose: Pose, x: number, y: number, z = 0): { x: number; y: number } => {
    const gt = groupTransform(pose);
    eu.set(gt.rotation[0], gt.rotation[1], gt.rotation[2], 'XYZ');
    q.setFromEuler(eu);
    m.compose(new THREE.Vector3(...gt.position), q, new THREE.Vector3(gt.scale, gt.scale, gt.scale));
    v.set(x, y, z).applyMatrix4(m).project(cam);
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
  };
}

export const fmtClock = (sec: number): string => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
