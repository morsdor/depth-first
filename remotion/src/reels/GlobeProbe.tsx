import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, cancelRender, interpolate, staticFile, useCurrentFrame, useDelayRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { DOMAIN_ACCENT } from '../brand/tokens';
import { FILL, FINE, PATCH, WORLD } from './data/globeprobe';
import { Fade, REEL_H, REEL_W, ReelGround, ReelHeader, ease, t } from './lib/chrome';

/**
 * Globe probe — NOT a reel. Orbit -> Europe -> the English Channel over real satellite imagery, with no API
 * key: NASA Blue Marble (public domain) on a three.js sphere, Natural Earth outlines draped on it.
 * Prepared by scripts/globe_probe/prep.py; see scripts/globe_probe/README.md.
 *
 * The camera never moves — `<ThreeCanvas>` takes it as a prop — so a wrapping <group> does (r015's lesson).
 * The group pivots about the surface point being looked at, so that point stays on the view axis whatever the
 * tilt, and `d` (the camera's distance to it, in Earth radii) is the single zoom parameter. It is
 * interpolated in LOG space: linear distance is dead for the first second and slams at the end.
 *
 * One lon/lat -> xyz function (`llv`) builds the sphere, the patch, the fills and the outlines, so the
 * registration check is a single question: does the coastline sit on the photo's coastline?
 *
 * Three layers of imagery, because no single texture survives the whole zoom:
 *   sphere   5400x2700   whole Earth                      15 px/deg
 *   patch    3600x2220   lon -40..20, lat 25..62 (4x crop) 60 px/deg, feathered into the sphere
 *   fills    2640x2040   the two highlighted units, painted in lon/lat on their own window (lon -10..12, lat 40..57)
 *                        so no polygon is ever triangulated
 *
 * ── Findings (2026-10-06, measured on this probe) ───────────────────────────
 *  WORKS  Headless render under `Config.setChromiumOpenGlRenderer("angle")`: 180 frames at 1080x1920 in ~9 s,
 *         ~14 MB. No key, no network at render time, no licence beyond a NASA / Natural Earth credit.
 *         All 180 encoded frames decode and none is blank or flashed (frame-to-frame change is one smooth
 *         bell, peak 1.5 s, during the fastest part of the zoom).
 *  COLOUR Measured. `flat` on the canvas plus `SRGBColorSpace` on each photograph reproduces the source: a
 *         North Sea pixel renders (26,72,129) against the JPEG's (26,71,128). The same pixel with `linear`
 *         instead of `flat` renders (0,13,63) — far too dark. Do NOT pass `linear` here as Dispatch does.
 *  REGISTRATION  The Natural Earth outline sits on the photo's coastline at Cornwall, Kent, the Cotentin and
 *         Brittany (stills at 4 s and 6 s; a 4-frame crop of the encoded mp4). One `llv` builds everything.
 *  SHARPNESS  The ceiling is the source, not the engine: 21600 px over 360 deg is 60 px/deg, 1.86 km/px. The
 *         numbers below come from `sharpnessAt()`, which samples a grid over the safe area and knows that
 *         outside the patch the sphere is only 15 px/deg (an earlier HUD assumed 60 everywhere and under-reported
 *         at 2 s; the patch was widened to lon -40..20 / lat 25..62 so the flight stays on it).
 *           t     altitude   centre   worst in frame
 *           1.4 s  13,726 km   x0.4     x1.4  (just past the patch edge, on the sphere)
 *           2.0 s   4,606 km   x1.1     x1.1
 *           2.6 s   2,622 km   x1.8     x2.0
 *           3.0 s   2,144 km   x2.0     x2.5
 *           4.0 s   1,768 km   x2.2     x3.1
 *           6.0 s   1,641 km   x2.4     x3.3  (bottom of the safe area, near Biscay)
 *         It reads as a soft painting under crisp outlines at x3. That is about the limit; past it needs a
 *         sharper source (Sentinel-2 / NASA GIBS tiles), not a bigger file.
 *  TILT   Costs sharpness: with tilt 36 the near (bottom) edge is x3.3 against x2.4 at the centre. Depth for blur.
 *  SEAMS  None at 1.6-2.4 s (frames 48-72, HUD off) — the window where the patch edge is in frame while the
 *         imagery is being stretched — checked on a contact sheet and a full-resolution crop across lat 25.
 *  EDGES  4 consecutive encoded frames: constant outline width, no flicker or breakage (Line2, depthWrite off,
 *         polygonOffset on the patch and fills).
 *  TEXT   The header is unreadable over imagery mid-zoom (1.4 s). Anything over the photo needs a scrim.
 *  SAFE   The imagery is full-bleed by design, so reel_safe_audit.py would flag it; text stays in the safe column.
 *  REGIONS  Imagery and borders are global; only Europe is cropped and traced finely. Another region is a
 *         different PATCH/FINE_UNITS in prep.py, not a rebuild. Natural Earth borders are de facto — check
 *         point-of-view variants before putting a disputed border on screen.
 *  NOT TESTED  Playback on a phone; the BMNG tile seam at 0 deg (this probe uses one crop, which avoids it);
 *         any city-scale zoom.
 */

export const DURATION_SECONDS = 6;
const FPS = 30;
const ACCENT = DOMAIN_ACCENT.infrastructure;

const FOV = 40; // vertical, degrees
const CAM_Z = 8;
const R_KM = 6371;
const D2R = Math.PI / 180;
const ASPECT = REEL_W / REEL_H;
const HF = Math.atan(Math.tan((FOV * D2R) / 2) * ASPECT); // half of the horizontal field of view

/** Source resolution: the patch is 21600 px over 360 degrees; the global sphere is 5400 over 360. */
const SRC_PX_PER_DEG = 21600 / 360;
const GLOBE_PX_PER_DEG = 5400 / 360;
/** Degrees over which the patch fades into the sphere at its edge. */
const FEATHER = 3;

/** How far the north edge tips away by the last frame. Tilt buys depth and costs sharpness at the near edge. */
const TILT_END = 36;

/** Camera distance to the looked-at surface point, in Earth radii. Start: the globe spans 75% of the frame width. */
const D0 = 1 / Math.sin(0.75 * HF) - 1;
/** End: the frame is 10 degrees of longitude wide at 49.6 N — England above the Channel, Brittany below. */
const D1 = (10 * D2R * Math.cos(49.6 * D2R)) / (2 * Math.tan(HF));

const llv = (lon: number, lat: number, r = 1): THREE.Vector3 => {
  const L = lon * D2R;
  const P = lat * D2R;
  return new THREE.Vector3(r * Math.cos(P) * Math.sin(L), r * Math.sin(P), r * Math.cos(P) * Math.cos(L));
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, s: number) => interpolate(s, [a, b], [0, 1], ease);

interface Pose {
  lon: number;
  lat: number;
  d: number; // Earth radii
  tilt: number; // degrees, 0 = looking straight down; positive tips the north edge away
}

const poseAt = (s: number): Pose => {
  const pc = smooth(0, 3.4, s); // where we look
  const pz = smooth(0.3, 4.2, s); // how close
  const pt = smooth(1.8, 4.2, s); // how oblique
  const x = clamp01((s - 4.2) / 1.8); // after arrival: a slow creep, so the hold is never a still
  const creep = x * x;
  return {
    lon: -35 + (-1.4 + 35) * pc + 0.35 * creep,
    lat: 28 + (49.6 - 28) * pc,
    d: Math.exp(Math.log(D0) + (Math.log(D1) - Math.log(D0)) * pz) * (1 - 0.07 * creep),
    tilt: TILT_END * pt,
  };
};

/** The group transform: world = Rt * (Rf * p - ez) + (0, 0, CAM_Z - d). Rf brings the target to +z with north up. */
const groupXform = (p: Pose) => {
  const rf = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(1, 0, 0), p.lat * D2R)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -p.lon * D2R));
  const rt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -p.tilt * D2R);
  const q = rt.clone().multiply(rf);
  const pos = new THREE.Vector3(0, 0, CAM_Z - p.d).sub(new THREE.Vector3(0, 0, 1).applyQuaternion(rt));
  return { q, pos };
};

const projCam = (() => {
  const c = new THREE.PerspectiveCamera(FOV, ASPECT, 0.05, 20);
  c.position.set(0, 0, CAM_Z);
  c.lookAt(0, 0, 0);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
})();

/** Frame pixels of a lon/lat under a pose; `facing` is false on the far side of the globe. */
const project = (p: Pose, lon: number, lat: number) => {
  const { q, pos } = groupXform(p);
  const world = llv(lon, lat).applyQuaternion(q).add(pos);
  const normal = llv(lon, lat).applyQuaternion(q);
  const facing = normal.dot(new THREE.Vector3().subVectors(projCam.position, world)) > 0;
  const v = world.clone().project(projCam);
  return { x: (v.x * 0.5 + 0.5) * REEL_W, y: (-v.y * 0.5 + 0.5) * REEL_H, facing };
};

/** Screen pixels per degree along each axis at a lon/lat — the probe's sharpness number. */
const pxPerDegAt = (p: Pose, lon: number, lat: number) => {
  const a = project(p, lon - 0.5, lat);
  const b = project(p, lon + 0.5, lat);
  const c = project(p, lon, lat - 0.5);
  const d = project(p, lon, lat + 0.5);
  return { lon: Math.hypot(b.x - a.x, b.y - a.y), lat: Math.hypot(d.x - c.x, d.y - c.y) };
};

/** Source px/deg where a lon/lat lands: the patch's 60 inside it, the globe's 15 outside, blended across the feather. */
const srcDensity = (lon: number, lat: number) => {
  const d = Math.min(lon - PATCH.lon0, PATCH.lon1 - lon, lat - PATCH.lat0, PATCH.lat1 - lat);
  const a = clamp01(d / FEATHER);
  return GLOBE_PX_PER_DEG + (SRC_PX_PER_DEG - GLOBE_PX_PER_DEG) * a * a * (3 - 2 * a);
};

/** The lon/lat under a frame pixel, or null if the ray misses the globe. Inverse of `project`. */
const unproject = (p: Pose, px: number, py: number): { lon: number; lat: number } | null => {
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

/**
 * The probe's sharpness answer for one instant: how far the imagery is stretched, as screen px/deg over source
 * px/deg on the worse axis. Sampled on a grid over Instagram's safe area, because with tilt the bottom of the
 * frame is nearer than the centre and a single centre sample hides it.
 */
export const sharpnessAt = (s: number) => {
  const p = poseAt(s);
  const up = (lon: number, lat: number) => {
    const v = pxPerDegAt(p, lon, lat);
    return Math.max(v.lon, v.lat) / srcDensity(lon, lat);
  };
  let worst = { up: 0, lon: p.lon, lat: p.lat };
  for (let gy = 0; gy <= 12; gy++) {
    for (let gx = 0; gx <= 8; gx++) {
      const hit = unproject(p, 60 + (810 * gx) / 8, 270 + (1270 * gy) / 12);
      if (!hit) continue;
      const u = up(hit.lon, hit.lat);
      if (u > worst.up) worst = { up: u, ...hit };
    }
  }
  return { alt: p.d * R_KM, centre: up(p.lon, p.lat), centreSrc: srcDensity(p.lon, p.lat), worst };
};

/** A lon/lat rectangle as an indexed grid on a sphere of radius r, with UVs linear in lon/lat (exact for equirectangular). */
function gridGeometry(lon0: number, lon1: number, lat0: number, lat1: number, nLon: number, nLat: number, r: number) {
  const pos: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j <= nLat; j++) {
    for (let i = 0; i <= nLon; i++) {
      const u = i / nLon;
      const v = j / nLat;
      const p = llv(lon0 + (lon1 - lon0) * u, lat0 + (lat1 - lat0) * v, r);
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

/** Polylines (flat lon,lat) -> segment geometry on the sphere. Long segments are cut to 0.25 deg so the chord never dips under the surface. */
function outlineGeometry(lines: number[][], r: number) {
  const out: number[] = [];
  for (const ln of lines) {
    for (let i = 0; i + 3 < ln.length; i += 2) {
      const [x0, y0, x1, y1] = [ln[i], ln[i + 1], ln[i + 2], ln[i + 3]];
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.25));
      let prev = llv(x0, y0, r);
      for (let k = 1; k <= n; k++) {
        const cur = llv(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, r);
        out.push(prev.x, prev.y, prev.z, cur.x, cur.y, cur.z);
        prev = cur;
      }
    }
  }
  const g = new LineSegmentsGeometry();
  g.setPositions(out);
  return g;
}

const lineObject = (lines: number[][], r: number, color: string, widthPx: number, opacity: number) => {
  const m = new LineMaterial({ color: new THREE.Color(color), linewidth: widthPx, transparent: true, opacity, depthWrite: false });
  m.resolution.set(REEL_W, REEL_H);
  const o = new LineSegments2(outlineGeometry(lines, r), m);
  o.frustumCulled = false;
  return o;
};

/** The photo's edge fades into the global sphere over FEATHER degrees, so the sharper patch arrives without a visible rectangle. */
function featherTexture() {
  const W = 256;
  const H = Math.round((W * (PATCH.lat1 - PATCH.lat0)) / (PATCH.lon1 - PATCH.lon0));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dLon = Math.min(x, W - 1 - x) * ((PATCH.lon1 - PATCH.lon0) / (W - 1));
      const dLat = Math.min(y, H - 1 - y) * ((PATCH.lat1 - PATCH.lat0) / (H - 1));
      const a = clamp01(Math.min(dLon, dLat) / FEATHER);
      const s = Math.round(255 * a * a * (3 - 2 * a));
      const k = (y * W + x) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = s;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

/** England and France painted in lon/lat on a canvas covering the FILL window — exact, no triangulation. */
function fillTexture() {
  const W = 2640;
  const H = 2040;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const X = (lon: number) => ((lon - FILL.lon0) / (FILL.lon1 - FILL.lon0)) * W;
  const Y = (lat: number) => ((FILL.lat1 - lat) / (FILL.lat1 - FILL.lat0)) * H;
  const paint = (name: string, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const ring of FINE[name]) {
      for (let i = 0; i < ring.length; i += 2) (i === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, X(ring[i]), Y(ring[i + 1]));
      ctx.closePath();
    }
    ctx.fill('evenodd');
  };
  paint('England', '#FFB020');
  paint('France', '#00D6F7');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const ATMOSPHERE = {
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying vec3 vN; varying vec3 vV;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.2); gl_FragColor = vec4(0.32, 0.64, 1.0, 1.0) * f * 0.9; }`,
};

const useGlobeAssets = () => {
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender('globe-probe textures'));
  const [assets, setAssets] = useState<{ globe: THREE.Texture; patch: THREE.Texture } | null>(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    Promise.all([loader.loadAsync(staticFile('globe_probe/globe_5400.jpg')), loader.loadAsync(staticFile('globe_probe/europe_patch.jpg'))])
      .then(([globe, patch]) => {
        for (const tx of [globe, patch]) {
          tx.colorSpace = THREE.SRGBColorSpace; // photographs are sRGB; the repo's canvas textures never had to say so
          tx.anisotropy = 16; // three clamps this to the GPU's maximum
          tx.generateMipmaps = true;
          tx.minFilter = THREE.LinearMipmapLinearFilter;
        }
        setAssets({ globe, patch });
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [continueRender, handle]);
  return assets;
};

const Scene: React.FC<{ globe: THREE.Texture; patch: THREE.Texture; pose: Pose; s: number }> = ({ globe, patch, pose, s }) => {
  const geo = useMemo(
    () => ({
      sphere: gridGeometry(-180, 180, -90, 90, 360, 180, 1),
      patch: gridGeometry(PATCH.lon0, PATCH.lon1, PATCH.lat0, PATCH.lat1, 240, 148, 1.0006),
      fills: gridGeometry(FILL.lon0, FILL.lon1, FILL.lat0, FILL.lat1, 88, 68, 1.0009),
    }),
    [],
  );
  const feather = useMemo(featherTexture, []);
  const fills = useMemo(fillTexture, []);
  const lines = useMemo(() => {
    const neighbours = Object.entries(FINE)
      .filter(([n]) => n !== 'England' && n !== 'France')
      .flatMap(([, v]) => v);
    return {
      world: lineObject(WORLD, 1.0011, '#E8E6E1', 1.6, 0.5),
      fine: lineObject(neighbours, 1.0011, '#E8E6E1', 2, 0.55),
      england: lineObject(FINE.England, 1.0013, '#FFB020', 5, 1),
      france: lineObject(FINE.France, 1.0013, '#00D6F7', 5, 1),
    };
  }, []);

  const outline = smooth(3.2, 4.0, s);
  lines.england.material.opacity = outline;
  lines.france.material.opacity = outline;

  const { q, pos } = groupXform(pose);
  return (
    <>
      <group position={pos.toArray()} quaternion={q.toArray() as [number, number, number, number]}>
        <mesh geometry={geo.sphere} renderOrder={0}>
          <meshBasicMaterial map={globe} />
        </mesh>
        <mesh geometry={geo.patch} renderOrder={1}>
          <meshBasicMaterial map={patch} alphaMap={feather} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
        </mesh>
        <mesh geometry={geo.fills} renderOrder={2}>
          <meshBasicMaterial map={fills} transparent opacity={0.34 * smooth(3.4, 4.4, s)} depthWrite={false} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
        <primitive object={lines.world} renderOrder={3} />
        <primitive object={lines.fine} renderOrder={3} />
        <primitive object={lines.england} renderOrder={4} />
        <primitive object={lines.france} renderOrder={4} />
        <mesh renderOrder={5}>
          <sphereGeometry args={[1.028, 96, 64]} />
          <shaderMaterial args={[ATMOSPHERE]} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
};

const Tag: React.FC<{ pose: Pose; lon: number; lat: number; text: string; color: string; from: number }> = ({ pose, lon, lat, text, color, from }) => {
  const frame = useCurrentFrame();
  const p = project(pose, lon, lat);
  const o = interpolate(frame, [t(from), t(from + 0.5)], [0, 1], ease);
  if (!p.facing) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - 300,
        top: p.y - 40,
        width: 600,
        textAlign: 'center',
        opacity: o,
        fontFamily: 'Archivo Black',
        fontSize: 64,
        letterSpacing: 4,
        color,
        textShadow: '0 2px 18px #040E1F, 0 0 6px #040E1F',
      }}
    >
      {text}
    </div>
  );
};

const Hud: React.FC<{ rows: [string, string][] }> = ({ rows }) => (
  <Fade from={t(0.2)} style={{ position: 'absolute', top: 1190, left: 60, width: 960, background: 'rgba(4, 14, 31, 0.82)', padding: '6px 20px' }}>
    {rows.map(([k, v]) => (
      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: 'IBM Plex Mono', fontSize: 36 }}>
        <span style={{ color: '#81A2C4' }}>{k}</span>
        <span style={{ color: '#E8E6E1' }}>{v}</span>
      </div>
    ))}
  </Fade>
);

export const GlobeProbe: React.FC<{ hud?: boolean }> = ({ hud = true }) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const assets = useGlobeAssets();
  const pose = poseAt(s);
  const sharp = sharpnessAt(s);

  return (
    <AbsoluteFill>
      <ReelGround accent={ACCENT} />
      <AbsoluteFill>
        {assets && (
          <ThreeCanvas
            width={REEL_W}
            height={REEL_H}
            flat
            camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.05, far: 20 }}
            gl={{ antialias: true, alpha: true }}
            style={{ backgroundColor: 'transparent' }}
          >
            <Scene globe={assets.globe} patch={assets.patch} pose={pose} s={s} />
          </ThreeCanvas>
        )}
      </AbsoluteFill>

      <Tag pose={pose} lon={-1.2} lat={52.6} text="ENGLAND" color="#FFB020" from={4.2} />
      <Tag pose={pose} lon={0.5} lat={48.5} text="FRANCE" color="#00D6F7" from={4.2} />

      <ReelHeader
        big="From orbit to the English Channel."
        small="Real imagery. Real borders."
        out={[3.4, 3.8]}
        in_={[3.8, 4.2]}
        bigSize={64}
      />
      {hud && (
        <Hud
          rows={[
            ['altitude', `${Math.round(sharp.alt).toLocaleString('en-US')} km`],
            ['source px/deg · centre', `${sharp.centreSrc.toFixed(0)}`],
            ['upscale · centre', `×${sharp.centre.toFixed(1)}`],
            ['upscale · worst in frame', `×${sharp.worst.up.toFixed(1)}`],
          ]}
        />
      )}
    </AbsoluteFill>
  );
};
