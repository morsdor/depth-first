import React, { useEffect, useMemo, useState } from 'react';
import { cancelRender, staticFile, useDelayRender } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { REEL_H, REEL_W } from './chrome';

/**
 * A real-imagery globe for `@remotion/three`, built from the GlobeProbe findings (scripts/globe_probe/README.md).
 * No API key: the imagery is photographs on a sphere, the borders are polylines draped on it.
 *
 * ── Camera ──────────────────────────────────────────────────────────────────
 * The camera never moves — `<ThreeCanvas>` takes it as a prop — so a wrapping <group> does (r015's lesson). The group
 * pivots about the surface point being looked at; `Pose.d` is the camera's distance to that point in Earth radii, and
 * the single zoom parameter. `shift` raises the looked-at point on screen by that many pixels, to leave room for a card.
 *
 * ── Why layers are separated by depth BIAS, not by radius ──────────────────────────────────────────────────────
 * GlobeProbe lifted each layer 0.0006-0.0013 R above the last. At orbit that is invisible; at a 130 km city frame it
 * floats an outline 4-8 km above the imagery, and with the camera tilted that is a visible slide (tens of pixels).
 * Here every layer sits at radius 1 and `polygonOffset` orders them, which is independent of scale. The camera's
 * near plane follows the zoom for the same reason: a fixed near plane either clips a close frame or starves the depth
 * buffer of a far one.
 *
 * ── One lon/lat -> xyz ─────────────────────────────────────────────────────────────────────────────────────────
 * `llv` builds the sphere, every patch, every fill and every outline, so registration is a single question.
 */

export const FOV = 40; // vertical, degrees
export const CAM_Z = 8;
export const R_KM = 6371;
export const D2R = Math.PI / 180;
const ASPECT = REEL_W / REEL_H;
/** Half of the horizontal field of view. */
export const HF = Math.atan(Math.tan((FOV * D2R) / 2) * ASPECT);
/** The distance at which the whole globe spans 75% of the frame width. */
export const D_GLOBE = 1 / Math.sin(0.75 * HF) - 1;
/** Camera distance (Earth radii) at which the frame is `km` wide at the looked-at point. */
export const dForWidthKm = (km: number) => km / R_KM / (2 * Math.tan(HF));

export interface Win {
  lon0: number;
  lon1: number;
  lat0: number;
  lat1: number;
}

export interface Pose {
  lon: number;
  lat: number;
  d: number; // Earth radii
  tilt: number; // degrees; 0 = looking straight down, positive tips the north edge away
  shift: number; // pixels the looked-at point is raised on screen
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (x: number) => {
  const a = clamp01(x);
  return a * a * (3 - 2 * a);
};

export const llv = (lon: number, lat: number, r = 1): THREE.Vector3 => {
  const L = lon * D2R;
  const P = lat * D2R;
  return new THREE.Vector3(r * Math.cos(P) * Math.sin(L), r * Math.sin(P), r * Math.cos(P) * Math.cos(L));
};

/** world = Rt * (Rf * p - ez) + (0, dy, CAM_Z - d). Rf brings the target to +z with north up; Rt tilts about the target. */
export const groupXform = (p: Pose) => {
  const rf = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(1, 0, 0), p.lat * D2R)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -p.lon * D2R));
  const rt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -p.tilt * D2R);
  const dy = (p.shift / (REEL_H / 2)) * p.d * Math.tan((FOV * D2R) / 2);
  const pos = new THREE.Vector3(0, dy, CAM_Z - p.d).sub(new THREE.Vector3(0, 0, 1).applyQuaternion(rt));
  return { q: rt.clone().multiply(rf), pos };
};

const projCam = (() => {
  const c = new THREE.PerspectiveCamera(FOV, ASPECT, 0.01, 20);
  c.position.set(0, 0, CAM_Z);
  c.lookAt(0, 0, 0);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
})();

/** Frame pixels of a lon/lat under a pose; `facing` is false on the far side of the globe. */
export const project = (p: Pose, lon: number, lat: number) => {
  const { q, pos } = groupXform(p);
  const normal = llv(lon, lat).applyQuaternion(q);
  const world = llv(lon, lat).applyQuaternion(q).add(pos);
  const facing = normal.dot(new THREE.Vector3().subVectors(projCam.position, world)) > 0;
  const v = world.project(projCam);
  return { x: (v.x * 0.5 + 0.5) * REEL_W, y: (-v.y * 0.5 + 0.5) * REEL_H, facing };
};

/** The lon/lat under a frame pixel, or null if the ray misses the globe. Inverse of `project`. */
export const unproject = (p: Pose, px: number, py: number): { lon: number; lat: number } | null => {
  const { q, pos } = groupXform(p);
  const o = projCam.position.clone();
  const dir = new THREE.Vector3((px / REEL_W) * 2 - 1, -((py / REEL_H) * 2 - 1), 0.5).unproject(projCam).sub(o).normalize();
  const qi = q.clone().invert();
  const o2 = o.sub(pos).applyQuaternion(qi);
  const d2 = dir.applyQuaternion(qi);
  const b = o2.dot(d2);
  const disc = b * b - (o2.dot(o2) - 1);
  if (disc < 0) return null;
  const tt = -b - Math.sqrt(disc);
  if (tt < 0) return null;
  const h = o2.add(d2.multiplyScalar(tt));
  return { lon: Math.atan2(h.x, h.z) / D2R, lat: Math.asin(Math.max(-1, Math.min(1, h.y))) / D2R };
};

/** Screen pixels per degree along each axis at a lon/lat. */
export const pxPerDegAt = (p: Pose, lon: number, lat: number) => {
  const a = project(p, lon - 0.05, lat);
  const b = project(p, lon + 0.05, lat);
  const c = project(p, lon, lat - 0.05);
  const d = project(p, lon, lat + 0.05);
  return { lon: Math.hypot(b.x - a.x, b.y - a.y) / 0.1, lat: Math.hypot(d.x - c.x, d.y - c.y) / 0.1 };
};

// ── textures ──────────────────────────────────────────────────────────────────────────────────────────────────

/** Loads photographs, tags them sRGB (the repo's canvas textures never had to) and holds the render until they land. */
export const useTextures = (urls: readonly string[]) => {
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender('globe textures'));
  const [tex, setTex] = useState<THREE.Texture[] | null>(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    Promise.all(urls.map((u) => loader.loadAsync(staticFile(u))))
      .then((ts) => {
        for (const tx of ts) {
          tx.colorSpace = THREE.SRGBColorSpace;
          tx.anisotropy = 16; // three clamps this to the GPU's maximum
          tx.generateMipmaps = true;
          tx.minFilter = THREE.LinearMipmapLinearFilter;
        }
        setTex(ts);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [continueRender, handle, urls]);
  return tex;
};

/** A patch's edge fades into whatever is beneath it over `feather` degrees, so the sharper photo arrives without a rectangle. */
const featherTexture = (win: Win, feather: number) => {
  const W = 256;
  const H = Math.max(16, Math.round((W * (win.lat1 - win.lat0)) / (win.lon1 - win.lon0)));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dLon = Math.min(x, W - 1 - x) * ((win.lon1 - win.lon0) / (W - 1));
      const dLat = Math.min(y, H - 1 - y) * ((win.lat1 - win.lat0) / (H - 1));
      const s = Math.round(255 * smoothstep(Math.min(dLon, dLat) / feather));
      const k = (y * W + x) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = s;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
};

/** Rings (flat lon,lat) painted in lon/lat on a canvas covering `win` — exact, so no polygon is ever triangulated. */
const fillTexture = (rings: number[][], win: Win, color: string) => {
  const lonR = win.lon1 - win.lon0;
  const latR = win.lat1 - win.lat0;
  const ppd = Math.min(2048 / lonR, 2048 / latR);
  const W = Math.max(2, Math.round(lonR * ppd));
  const H = Math.max(2, Math.round(latR * ppd));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 2) {
      const x = ((ring[i] - win.lon0) / lonR) * W;
      const y = ((win.lat1 - ring[i + 1]) / latR) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const boundsOf = (rings: number[][], margin = 0.2): Win => {
  let lon0 = Infinity;
  let lon1 = -Infinity;
  let lat0 = Infinity;
  let lat1 = -Infinity;
  for (const r of rings) {
    for (let i = 0; i < r.length; i += 2) {
      lon0 = Math.min(lon0, r[i]);
      lon1 = Math.max(lon1, r[i]);
      lat0 = Math.min(lat0, r[i + 1]);
      lat1 = Math.max(lat1, r[i + 1]);
    }
  }
  const mx = (lon1 - lon0) * margin;
  const my = (lat1 - lat0) * margin;
  return { lon0: lon0 - mx, lon1: lon1 + mx, lat0: lat0 - my, lat1: lat1 + my };
};

// ── geometry ──────────────────────────────────────────────────────────────────────────────────────────────────

/** A lon/lat rectangle as an indexed grid on the unit sphere, with UVs linear in lon/lat (exact for equirectangular). */
function gridGeometry(win: Win, nLon: number, nLat: number) {
  const pos: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j <= nLat; j++) {
    for (let i = 0; i <= nLon; i++) {
      const u = i / nLon;
      const v = j / nLat;
      const p = llv(win.lon0 + (win.lon1 - win.lon0) * u, win.lat0 + (win.lat1 - win.lat0) * v);
      pos.push(p.x, p.y, p.z);
      uv.push(u, v);
    }
  }
  const idx: number[] = [];
  const row = nLon + 1;
  for (let j = 0; j < nLat; j++) {
    for (let i = 0; i < nLon; i++) {
      const a = j * row + i;
      idx.push(a, a + 1, a + row, a + 1, a + row + 1, a + row);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/** Polylines (flat lon,lat) -> segment geometry on the sphere, in draw order. Long segments are cut to 0.25 deg so a chord never dips under the surface. */
function outlineGeometry(lines: number[][]) {
  const out: number[] = [];
  for (const ln of lines) {
    for (let i = 0; i + 3 < ln.length; i += 2) {
      const [x0, y0, x1, y1] = [ln[i], ln[i + 1], ln[i + 2], ln[i + 3]];
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.25));
      let prev = llv(x0, y0);
      for (let k = 1; k <= n; k++) {
        const cur = llv(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n);
        out.push(prev.x, prev.y, prev.z, cur.x, cur.y, cur.z);
        prev = cur;
      }
    }
  }
  const g = new LineSegmentsGeometry();
  g.setPositions(out);
  return g;
}

const lineObject = (lines: number[][], color: string, widthPx: number, opacity: number, bias: number) => {
  const m = new LineMaterial({ color: new THREE.Color(color), linewidth: widthPx, transparent: true, opacity, depthWrite: false });
  m.resolution.set(REEL_W, REEL_H);
  m.polygonOffset = true;
  m.polygonOffsetFactor = -1;
  m.polygonOffsetUnits = -bias;
  const o = new LineSegments2(outlineGeometry(lines), m);
  o.frustumCulled = false;
  return o;
};

// ── scene ─────────────────────────────────────────────────────────────────────────────────────────────────────

export interface PatchSpec {
  tex: THREE.Texture;
  win: Win;
  /** Source resolution of this photo, pixels per degree — for the sharpness report. */
  ppd: number;
  /** Degrees over which the patch's edge fades. */
  feather: number;
  /** Mesh cell size in degrees. */
  step: number;
}

export interface Layer {
  lines: number[][];
  color: string;
  width: number;
  opacity: number;
  /** [gone, full]: the layer fades out as the camera distance d falls from `full` to `gone`. Coarse outlines lie at city scale. */
  fade?: [number, number];
}

export interface HighlightSpec {
  id: string;
  rings: number[][];
  color: string;
  width: number;
  /** Fill opacity at fill = 1. */
  fillAlpha: number;
}

/** draw: 0..1 of the outline drawn. fill: 0..1 of the fill. alpha: 0..1 multiplier on both (to fade a highlight out). */
export interface HighlightState {
  draw: number;
  fill: number;
  alpha: number;
}

const WORLD_WIN: Win = { lon0: -180, lon1: 180, lat0: -90, lat1: 90 };

const PatchMesh: React.FC<{ spec: PatchSpec; order: number }> = ({ spec, order }) => {
  const geo = useMemo(
    () => gridGeometry(spec.win, Math.ceil((spec.win.lon1 - spec.win.lon0) / spec.step), Math.ceil((spec.win.lat1 - spec.win.lat0) / spec.step)),
    [spec.win, spec.step],
  );
  const feather = useMemo(() => featherTexture(spec.win, spec.feather), [spec.win, spec.feather]);
  return (
    <mesh geometry={geo} renderOrder={1 + order}>
      <meshBasicMaterial map={spec.tex} alphaMap={feather} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-(1 + order) * 2} />
    </mesh>
  );
};

const HighlightMesh: React.FC<{ spec: HighlightSpec; state: HighlightState; order: number }> = ({ spec, state, order }) => {
  const built = useMemo(() => {
    const win = boundsOf(spec.rings, 0.2);
    const lonR = win.lon1 - win.lon0;
    const latR = win.lat1 - win.lat0;
    const line = lineObject(spec.rings, spec.color, spec.width, 1, 40 + order * 2);
    return {
      line,
      total: (line.geometry as LineSegmentsGeometry).instanceCount,
      geo: gridGeometry(win, Math.min(240, Math.max(8, Math.ceil(lonR / 0.02))), Math.min(240, Math.max(8, Math.ceil(latR / 0.02)))),
      tex: fillTexture(spec.rings, win, spec.color),
    };
  }, [spec, order]);

  const geo = built.line.geometry as LineSegmentsGeometry;
  geo.instanceCount = Math.floor(built.total * clamp01(state.draw));
  built.line.visible = geo.instanceCount > 0 && state.alpha > 0.001;
  (built.line.material as LineMaterial).opacity = clamp01(state.alpha);

  return (
    <>
      <mesh geometry={built.geo} renderOrder={20 + order} visible={state.fill * state.alpha > 0.001}>
        <meshBasicMaterial
          map={built.tex}
          transparent
          opacity={spec.fillAlpha * clamp01(state.fill) * clamp01(state.alpha)}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-20 - order * 2}
        />
      </mesh>
      <primitive object={built.line} renderOrder={40 + order} />
    </>
  );
};

const ATMOSPHERE = {
  uniforms: { uK: { value: 1 } },
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform float uK; varying vec3 vN; varying vec3 vV;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.2); gl_FragColor = vec4(0.32, 0.64, 1.0, 1.0) * f * 0.9 * uK; }`,
};

export const GlobeScene: React.FC<{
  globe: THREE.Texture;
  patches: PatchSpec[];
  pose: Pose;
  layers: Layer[];
  highlights: HighlightSpec[];
  states: Record<string, HighlightState>;
}> = ({ globe, patches, pose, layers, highlights, states }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.near = Math.max(0.002, pose.d * 0.12);
  camera.far = pose.d + 3.5;
  camera.updateProjectionMatrix();

  const sphere = useMemo(() => gridGeometry(WORLD_WIN, 360, 180), []);
  const objs = useMemo(() => layers.map((l, i) => lineObject(l.lines, l.color, l.width, l.opacity, 30 + i * 2)), [layers]);
  const atm = useMemo(() => new THREE.ShaderMaterial({ ...ATMOSPHERE, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  atm.uniforms.uK.value = smoothstep((pose.d - 0.3) / 1.2); // a shell 178 km up is in the way of a city frame, so it fades out as we land

  layers.forEach((l, i) => {
    const k = l.fade ? smoothstep((pose.d - l.fade[0]) / (l.fade[1] - l.fade[0])) : 1;
    (objs[i].material as LineMaterial).opacity = l.opacity * k;
    objs[i].visible = k > 0.001;
  });

  const { q, pos } = groupXform(pose);
  return (
    <group position={pos.toArray()} quaternion={q.toArray() as [number, number, number, number]}>
      <mesh geometry={sphere} renderOrder={0}>
        <meshBasicMaterial map={globe} />
      </mesh>
      {patches.map((p, i) => (
        <PatchMesh key={i} spec={p} order={i} />
      ))}
      {objs.map((o, i) => (
        <primitive key={i} object={o} renderOrder={10 + i} />
      ))}
      {highlights.map((h, i) => (
        <HighlightMesh key={h.id} spec={h} state={states[h.id] ?? { draw: 0, fill: 0, alpha: 0 }} order={i} />
      ))}
      <mesh renderOrder={100}>
        <sphereGeometry args={[1.028, 96, 64]} />
        <primitive object={atm} attach="material" />
      </mesh>
    </group>
  );
};

/** Source px/deg where a lon/lat lands: the base globe, or the finest patch there, blended across each patch's feather. */
export const srcDensity = (basePpd: number, patches: PatchSpec[], lon: number, lat: number) => {
  let ppd = basePpd;
  for (const p of patches) {
    const d = Math.min(lon - p.win.lon0, p.win.lon1 - lon, lat - p.win.lat0, p.win.lat1 - lat);
    const a = smoothstep(d / p.feather);
    if (p.ppd > ppd) ppd += (p.ppd - ppd) * a;
  }
  return ppd;
};

/** How far the imagery is stretched at the centre and at its worst point over the safe area (screen px/deg over source px/deg). */
export const sharpness = (basePpd: number, patches: PatchSpec[], pose: Pose) => {
  const up = (lon: number, lat: number) => {
    const v = pxPerDegAt(pose, lon, lat);
    return Math.max(v.lon, v.lat) / srcDensity(basePpd, patches, lon, lat);
  };
  let worst = { up: 0, lon: pose.lon, lat: pose.lat };
  for (let gy = 0; gy <= 12; gy++) {
    for (let gx = 0; gx <= 8; gx++) {
      const hit = unproject(pose, 60 + (810 * gx) / 8, 270 + (1270 * gy) / 12);
      if (!hit) continue;
      const u = up(hit.lon, hit.lat);
      if (u > worst.up) worst = { up: u, ...hit };
    }
  }
  return { centre: up(pose.lon, pose.lat), worst };
};
