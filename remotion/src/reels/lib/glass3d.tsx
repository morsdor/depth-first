import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useDelayRender } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BASE, DOMAIN_ACCENT } from '../../brand/tokens';

/**
 * A glass of water with a cube of ice — promoted out of GlassProbe (scripts/glass_probe/README.md) so the reel and the probe share
 * one set of solved problems:
 *
 *  - REFRACTION ON THE GLASS ONLY. The glass is the one transmissive body. The water, the ice, the outline and the ring are BLENDED
 *    volumes drawn after it (`transparent`, `depthWrite={false}`, `renderOrder`): nested transmissive objects cannot see each other
 *    in three.js' transmission texture and fight over the depth buffer.
 *  - `scene.environment` is lit by `scene.environmentIntensity`; `material.envMapIntensity` is ignored for it.
 *  - `LatheGeometry` leaves a visible seam; merge the seam and recompute normals.
 *
 * Everything is in CENTIMETRES, y up, origin at the centre of the glass's underside. The caller scales the group.
 * The numbers are the ones projects/r021_whichice/research/melt_check.py asserted: a 7 cm glass, a 4 cm cube riding 91.7 % under the line.
 */

export const R_IN = 3.5;
export const WALL = 0.35;
export const BASE_TH = 0.6;
export const GLASS_H = 16;
export const SIDE0 = 4.0;
export const RHO_ICE = 0.917;
export const SHELF_CM = 10.9; // top of the rock shelf above the glass's inner floor
export const CUBE_ROT: [number, number, number] = [0.05, 0.4, 0.04];

const AMBER = BASE.amber;
const CYAN = DOMAIN_ACCENT.infrastructure;

/** A vertical gradient with soft bokeh: something for the glass to refract. `horizon` is where a table plane will cut the picture. */
export const backdrop = (top: string, mid: string, bottom: string, midAt = 0.28): THREE.CanvasTexture => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, top);
  grad.addColorStop(midAt, mid);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 512);
  const discs: Array<[number, number, number, string]> = [
    [44, 62, 30, 'rgba(0, 214, 247, 0.30)'],
    [196, 44, 24, 'rgba(255, 255, 255, 0.22)'],
    [128, 92, 20, 'rgba(0, 214, 247, 0.20)'],
    [226, 100, 16, 'rgba(255, 176, 32, 0.20)'],
    [84, 20, 14, 'rgba(255, 255, 255, 0.16)'],
  ];
  for (const [x, y, r, col] of discs) {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(0.7, col);
    rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = rg;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/** The table is lit by its own texture: a pool of light under the glass fading into the horizon colour. */
export const poolTexture = (): THREE.CanvasTexture => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const rg = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  rg.addColorStop(0, 'rgba(30, 72, 124, 1)');
  rg.addColorStop(0.4, 'rgba(18, 46, 88, 0.85)');
  rg.addColorStop(1, 'rgba(12, 32, 62, 0)');
  g.clearRect(0, 0, 512, 512);
  g.fillStyle = rg;
  g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/** The sea seen from far: lighter near the glass, fading into the horizon colour so there is no edge. */
export const seaTexture = (): THREE.CanvasTexture => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const rg = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  rg.addColorStop(0, 'rgba(26, 92, 150, 1)');
  rg.addColorStop(0.35, 'rgba(18, 66, 112, 0.96)');
  rg.addColorStop(0.8, 'rgba(14, 44, 80, 0.6)');
  rg.addColorStop(1, 'rgba(12, 32, 62, 0)');
  g.clearRect(0, 0, 512, 512);
  g.fillStyle = rg;
  g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/** Specks of light on water: a tileable noise that the caller scrolls. */
export const sparkleTexture = (): THREE.CanvasTexture => {
  const n = 256;
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, n, n);
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const x = rnd() * n;
    const y = rnd() * n;
    const r = 0.8 + rnd() * 2.2;
    const a = 0.1 + rnd() * 0.4;
    for (const dx of [-n, 0, n]) {
      for (const dy of [-n, 0, n]) {
        const rg = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r * 3);
        rg.addColorStop(0, `rgba(190, 230, 255, ${a})`);
        rg.addColorStop(1, 'rgba(190, 230, 255, 0)');
        g.fillStyle = rg;
        g.fillRect(x + dx - r * 3, y + dy - r * 3, r * 6, r * 6);
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const iceBump = (): THREE.CanvasTexture => {
  const n = 256;
  const c = document.createElement('canvas');
  c.width = n;
  c.height = n;
  const g = c.getContext('2d')!;
  const img = g.createImageData(n, n);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const grid = Array.from({ length: 17 * 17 }, () => rnd());
  const at = (x: number, y: number) => grid[(y % 17) * 17 + (x % 17)];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const fx = (x / n) * 16;
      const fy = (y / n) * 16;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const v = (at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx) * (1 - ty) + (at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx) * ty;
      const k = Math.floor(80 + v * 120);
      const i = (y * n + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = k;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

/** The environment (reflections for the glass) and the scene background, ready before the first frame is captured. */
export const Env: React.FC<{ background: () => THREE.Texture | THREE.Color; intensity?: number }> = ({ background, intensity = 0.85 }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender('glass environment'));
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    scene.background = background();
    pmrem.dispose();
    continueRender(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, continueRender, handle]);
  return null;
};

/** The tumbler: a lathe of the real wall profile, thick base, rounded rim, seam merged. */
export const glassGeometry = (): THREE.BufferGeometry => {
  const ro = R_IN + WALL;
  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(ro - 0.35, 0));
  for (let i = 1; i <= 5; i++) {
    const a = (i / 5) * (Math.PI / 2);
    pts.push(new THREE.Vector2(ro - 0.35 + 0.35 * Math.sin(a), 0.35 - 0.35 * Math.cos(a)));
  }
  pts.push(new THREE.Vector2(ro, GLASS_H - 0.1));
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * Math.PI;
    pts.push(new THREE.Vector2(R_IN + WALL / 2 + (WALL / 2) * Math.cos(a), GLASS_H - 0.1 + (WALL / 2) * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(R_IN, BASE_TH + 0.05));
  pts.push(new THREE.Vector2(R_IN - 0.3, BASE_TH));
  pts.push(new THREE.Vector2(0, BASE_TH));
  const lathe = new THREE.LatheGeometry(pts, 96);
  lathe.deleteAttribute('uv');
  lathe.deleteAttribute('normal');
  const merged = mergeVertices(lathe, 1e-4);
  merged.computeVertexNormals();
  return merged;
};

/** The cube's cracks, hand-placed, revealed in order as `n` grows. */
const CRACKS: number[][] = [
  [-1.1, 0.4, 0.2], [-0.4, 0.1, 0.5],
  [-0.4, 0.1, 0.5], [0.3, -0.3, 0.1],
  [0.3, -0.3, 0.1], [0.9, -0.2, -0.4],
  [-0.4, 0.1, 0.5], [-0.2, 0.9, 0.7],
  [0.3, -0.3, 0.1], [0.5, -1.1, 0.3],
  [-0.9, -0.8, -0.2], [-0.3, -0.5, 0.0],
  [0.2, 0.9, -0.6], [0.7, 0.5, -0.1],
];

const crackGeometry = (n: number): THREE.BufferGeometry => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(CRACKS.slice(0, n * 2).flat(), 3));
  return g;
};

export type GlassState = {
  /** water depth above the inner floor, cm */
  levelCm: number;
  /** the amber ring's height above the inner floor, cm; null = no ring */
  ringCm: number | null;
  /** float: the cube floats and the level does not move. shelf: the cube sits on a rock shelf above the water. none: no ice */
  mode: 'float' | 'shelf' | 'none';
  /** 0..1 — how much of the cube has melted */
  melt: number;
  /** 0..1 — how much of the crack has grown */
  crack: number;
  /** 0..1 — opacity of the outline of the space the floating ice took up */
  outline: number;
  /** 0..1 — how full of meltwater that outline is */
  fill: number;
  /** a band of future water, [from, to] cm above the inner floor, or null */
  band: [number, number] | null;
  /** seconds, for the drips and ripples; null = none */
  dripT: number | null;
  /** the thin amber guide line height, cm above the inner floor; null = none */
  guideCm: number | null;
  /** the cube's side and draft for this melt, cm (from the run: FLOAT_CURVE) */
  side: number;
};

export const GlassOfWater: React.FC<{ s: GlassState; x?: number; glassGeo: THREE.BufferGeometry }> = ({ s, x = 0, glassGeo }) => {
  const bump = useMemo(iceBump, []);
  const cubeGeo = useMemo(() => new RoundedBoxGeometry(SIDE0, SIDE0, SIDE0, 6, 0.35), []);
  const ghostBox = useMemo(() => new THREE.BoxGeometry(SIDE0 * 0.98, RHO_ICE * SIDE0, SIDE0 * 0.98), []);
  const nCracks = Math.min(7, Math.ceil(s.crack * 7));
  const cracks = useMemo(() => (nCracks > 0 ? crackGeometry(nCracks) : null), [nCracks]);

  const surfaceY = BASE_TH + s.levelCm;
  const scale = s.side / SIDE0;
  const draft = RHO_ICE * s.side;
  const floatY = surfaceY - draft + s.side / 2;
  const shelfTop = BASE_TH + SHELF_CM;
  const cubeY = s.mode === 'float' ? floatY : shelfTop + s.side / 2;
  const cubeX = s.mode === 'float' ? 0.2 : -0.9;
  const ghostY = BASE_TH + 9.525 - (RHO_ICE * SIDE0) / 2; // the submerged volume at melt = 0 (the glass's floating level never changes)
  const showCube = s.mode !== 'none' && s.melt < 0.999;

  const drips: Array<{ y: number; a: number }> = [];
  const ripples: Array<{ r: number; a: number }> = [];
  if (s.dripT !== null && s.mode === 'shelf' && showCube) {
    for (let i = 0; i < 3; i++) {
      const period = 0.95;
      const ph = ((s.dripT + i * period / 3) % period) / period;       // 0..1 within one drop's life
      const fall = Math.min(1, ph / 0.55);
      const yTop = shelfTop + 0.1;
      const y = yTop - (yTop - surfaceY) * fall * fall;
      if (ph < 0.55) drips.push({ y, a: 1 });
      else ripples.push({ r: 0.2 + (ph - 0.55) / 0.45 * 1.4, a: 1 - (ph - 0.55) / 0.45 });
    }
  }

  return (
    <group position={[x, 0, 0]}>
      {/* the glass — the one transmissive body */}
      <mesh geometry={glassGeo} renderOrder={3}>
        <meshPhysicalMaterial
          color="rgb(255, 255, 255)"
          transmission={1}
          thickness={0.6}
          ior={1.5}
          roughness={0.02}
          attenuationColor="rgb(190, 255, 235)"
          attenuationDistance={10}
          envMapIntensity={1.3}
          specularIntensity={1}
          depthWrite={false}
        />
      </mesh>

      {/* the water: a blended volume, drawn after the glass */}
      <mesh position={[0, BASE_TH + s.levelCm / 2, 0]} scale={[1, Math.max(0.001, s.levelCm), 1]} renderOrder={4}>
        <cylinderGeometry args={[R_IN - 0.02, R_IN - 0.02, 1, 96, 1]} />
        <meshPhysicalMaterial
          color="rgb(60, 150, 210)"
          transparent
          opacity={0.34}
          roughness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh position={[0, surfaceY, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
        <circleGeometry args={[R_IN - 0.02, 96]} />
        <meshBasicMaterial color="rgb(170, 225, 250)" transparent opacity={0.42} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* the future water: the band the right-hand ring is about to climb through */}
      {s.band && s.band[1] > s.band[0] + 0.001 ? (
        <mesh position={[0, BASE_TH + (s.band[0] + s.band[1]) / 2, 0]} scale={[1, s.band[1] - s.band[0], 1]} renderOrder={5}>
          <cylinderGeometry args={[R_IN - 0.02, R_IN - 0.02, 1, 96, 1]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ) : null}

      {/* the rock shelf, bracketed to the wall, entirely above the water */}
      {s.mode === 'shelf' ? (
        <mesh position={[-R_IN + 2.5, shelfTop - 0.45, 0]} renderOrder={4}>
          <boxGeometry args={[5.4, 0.9, 4.6]} />
          <meshStandardMaterial color="rgb(86, 76, 70)" roughness={0.95} metalness={0} />
        </mesh>
      ) : null}

      {/* the ice */}
      {showCube ? (
        <>
          <group position={[cubeX, cubeY, 0.1]} rotation={CUBE_ROT} scale={Math.max(0.001, scale)}>
            <mesh geometry={cubeGeo} renderOrder={6}>
              <meshPhysicalMaterial
                color="rgb(190, 230, 252)"
                transparent
                opacity={0.5}
                roughness={0.2}
                clearcoat={1}
                clearcoatRoughness={0.1}
                bumpMap={bump}
                bumpScale={1.4}
                emissive="rgb(10, 36, 60)"
                envMapIntensity={1.5}
                depthWrite={false}
              />
            </mesh>
            {cracks ? (
              <lineSegments renderOrder={7} geometry={cracks}>
                <lineBasicMaterial color="rgb(240, 250, 255)" transparent opacity={0.85} depthWrite={false} />
              </lineSegments>
            ) : null}
          </group>
          {s.mode === 'float' ? (
            <mesh position={[cubeX, surfaceY + (s.side - draft) / 2, 0.1]} rotation={CUBE_ROT} renderOrder={8}>
              <boxGeometry args={[s.side * 0.97, Math.max(0.001, s.side - draft), s.side * 0.97]} />
              <meshBasicMaterial color="rgb(240, 250, 255)" transparent opacity={0.7} depthWrite={false} toneMapped={false} />
            </mesh>
          ) : null}
        </>
      ) : null}

      {/* the space the ice took up — the outline stays after the ice is gone — and the meltwater filling it */}
      {s.outline > 0.001 ? (
        <>
          <lineSegments position={[0.2, ghostY, 0.1]} rotation={CUBE_ROT} renderOrder={10}>
            <edgesGeometry args={[ghostBox]} />
            <lineBasicMaterial color={CYAN} transparent opacity={s.outline} depthWrite={false} toneMapped={false} />
          </lineSegments>
          <mesh position={[0.2, ghostY, 0.1]} rotation={CUBE_ROT} renderOrder={9}>
            <boxGeometry args={[SIDE0 * 0.98, RHO_ICE * SIDE0, SIDE0 * 0.98]} />
            <meshBasicMaterial color={CYAN} transparent opacity={s.outline * 0.1} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </>
      ) : null}
      {s.fill > 0.001 && s.outline > 0.001 ? (
        <mesh
          position={[0.2, ghostY - (RHO_ICE * SIDE0) / 2 + (RHO_ICE * SIDE0 * s.fill) / 2, 0.1]}
          rotation={CUBE_ROT}
          scale={[0.97, Math.max(0.001, s.fill), 0.97]}
          renderOrder={9}
        >
          <boxGeometry args={[SIDE0 * 0.98, RHO_ICE * SIDE0, SIDE0 * 0.98]} />
          <meshBasicMaterial color="rgb(70, 160, 220)" transparent opacity={s.outline * 0.16} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ) : null}

      {/* drips from the shelf ice, and the rings they leave on the water */}
      {drips.map((d, i) => (
        <mesh key={`d${i}`} position={[-0.9 + (i - 1) * 0.55, d.y, 0.1]} renderOrder={8}>
          <sphereGeometry args={[0.2, 14, 12]} />
          <meshBasicMaterial color="rgb(200, 235, 255)" transparent opacity={0.92} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {ripples.map((r, i) => (
        <mesh key={`r${i}`} position={[-0.9 + (i - 1) * 0.55, surfaceY + 0.01, 0.1]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={8}>
          <ringGeometry args={[r.r, r.r + 0.07, 40]} />
          <meshBasicMaterial color="rgb(210, 240, 255)" transparent opacity={0.6 * r.a} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}

      {/* the level ring — the one amber element — and the thin guide line that runs through both glasses */}
      {s.ringCm !== null ? (
        <>
          <mesh position={[0, BASE_TH + s.ringCm, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={11}>
            <torusGeometry args={[R_IN + WALL + 0.1, 0.05, 12, 128]} />
            <meshBasicMaterial color={AMBER} toneMapped={false} />
          </mesh>
          <mesh position={[0, BASE_TH + s.ringCm, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={11}>
            <torusGeometry args={[R_IN + WALL + 0.1, 0.2, 12, 128]} />
            <meshBasicMaterial color={AMBER} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};

/** The thin level line that runs through BOTH glasses, drawn in the world rather than on a glass. */
export const GuideLine: React.FC<{ yCm: number; x0: number; x1: number; opacity: number }> = ({ yCm, x0, x1, opacity }) => (
  <mesh position={[(x0 + x1) / 2, BASE_TH + yCm, R_IN + WALL + 0.3]} renderOrder={12}>
    <boxGeometry args={[x1 - x0, 0.045, 0.02]} />
    <meshBasicMaterial color="rgb(232, 230, 225)" transparent opacity={0.55 * opacity} depthWrite={false} toneMapped={false} />
  </mesh>
);
