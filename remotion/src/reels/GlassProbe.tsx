import React, { useLayoutEffect, useMemo, useState } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useDelayRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BASE, DOMAIN_ACCENT } from '../brand/tokens';
import { REEL_H, REEL_W } from './lib/chrome';

/**
 * Glass probe — NOT a reel. No backlog id, no reel number, no log entries. It is the smoke test for the one
 * question that decides whether `I93`'s "amazing visuals" are possible at all: can `@remotion/three` render a
 * convincing glass of water with an ice cube in it, in this container's headless renderer, at a cost per frame
 * a 58 s reel can afford? See scripts/glass_probe/README.md for the findings and gate0/i93_whichice.
 *
 * Geometry is in CENTIMETRES (the research script's units) times CM. The glass, the water level (9.525 cm,
 * gate0/i93_whichice/research/melt_check.py) and the cube (4 cm, 91.7 % under the line) are the same numbers the
 * Gate 0 still drew, so the probe cannot disagree with the physics.
 *
 * The camera never moves — `<ThreeCanvas>` takes it as a prop — so a wrapping <group> does.
 */

export const DURATION_SECONDS = 6;

const CM = 0.4;
const R_IN = 3.5;
const WALL = 0.35;
const BASE_TH = 0.6;
const GLASS_H = 15;
const LEVEL = 9.525; // water depth with the cube in; unchanged by the melt — melt_check.py, asserted
const WATER_Y = BASE_TH + LEVEL;
const SIDE0 = 4.0;
const RHO_ICE = 0.917;

const AMBER = BASE.amber;
const CYAN = DOMAIN_ACCENT.infrastructure;

/** A canvas texture is the only way to hand three.js a gradient with soft bokeh in it without a file. */
const backdrop = (): THREE.CanvasTexture => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgb(22, 50, 92)');
  grad.addColorStop(0.28, 'rgb(12, 32, 62)');
  grad.addColorStop(1, 'rgb(4, 14, 31)');
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

/** The table is lit by its own texture, not by the environment: `material.envMapIntensity` is ignored for
 * `scene.environment` in this three.js, so a standard-material table washed pale grey whatever its colour. */
const tableTexture = (): THREE.CanvasTexture => {
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

/** Mottled noise for the ice's surface: a bump map, so the cube is not a perfect piece of glass. */
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

const Env: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender('glass environment'));
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.85;
    scene.background = backdrop();
    pmrem.dispose();
    continueRender(handle);
  }, [gl, scene, continueRender, handle]);
  return null;
};

/** Glass tumbler: a lathe of the real wall profile, thick base, rounded rim. */
const glassGeometry = (): THREE.BufferGeometry => {
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
    const a = (i / 6) * Math.PI; // rounded rim, over the top
    pts.push(new THREE.Vector2(R_IN + WALL / 2 + (WALL / 2) * Math.cos(a), GLASS_H - 0.1 + (WALL / 2) * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(R_IN, BASE_TH + 0.05));
  pts.push(new THREE.Vector2(R_IN - 0.3, BASE_TH));
  pts.push(new THREE.Vector2(0, BASE_TH));
  // LatheGeometry duplicates the seam, and its UVs and normals differ across it: the glass showed a vertical
  // line down the front and split the floor in two shades. Merge the seam and recompute the normals.
  const lathe = new THREE.LatheGeometry(pts, 96);
  lathe.deleteAttribute('uv');
  lathe.deleteAttribute('normal');
  const merged = mergeVertices(lathe, 1e-4);
  merged.computeVertexNormals();
  return merged;
};

const Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const glassGeo = useMemo(glassGeometry, []);
  const bump = useMemo(iceBump, []);
  const tableTex = useMemo(tableTexture, []);
  const ghostBox = useMemo(() => new THREE.BoxGeometry(SIDE0 * 0.98, RHO_ICE * SIDE0, SIDE0 * 0.98), []);
  const cubeGeo = useMemo(() => new RoundedBoxGeometry(SIDE0, SIDE0, SIDE0, 6, 0.35), []);
  const fractureGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    // short, branching cracks inside a 4 cm cube — a few hand-placed segments, not a pattern
    const seg: number[][] = [
      [-1.1, 0.4, 0.2], [-0.4, 0.1, 0.5], [-0.4, 0.1, 0.5], [0.3, -0.3, 0.1], [0.3, -0.3, 0.1], [0.9, -0.2, -0.4],
      [-0.4, 0.1, 0.5], [-0.2, 0.9, 0.7], [0.3, -0.3, 0.1], [0.5, -1.1, 0.3], [-0.9, -0.8, -0.2], [-0.3, -0.5, 0.0],
      [0.2, 0.9, -0.6], [0.7, 0.5, -0.1],
    ];
    g.setAttribute('position', new THREE.Float32BufferAttribute(seg.flat(), 3));
    return g;
  }, []);

  // the melt: frames 30-150, the cube shrinks as a cube; the level does not move (melt_check.py)
  const f = interpolate(frame, [30, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x) });
  const s = Math.max(0.001, Math.pow(1 - f, 1 / 3));
  const side = SIDE0 * s;
  const draft = RHO_ICE * side;
  const cubeY = WATER_Y - draft + side / 2;
  const bob = Math.sin(frame / 14) * 0.03;
  const ghost = interpolate(f, [0.25, 0.9], [0, 0.28], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // the root group is the camera: a slow orbit and a push-in
  const rotY = interpolate(frame, [0, 180], [-0.42, 0.28]);
  const push = interpolate(frame, [0, 180], [0, 1.4]);
  const rise = interpolate(frame, [0, 180], [0, -0.2]);

  return (
    <group position={[0, rise, push]} rotation={[0.05, rotY, 0]}>
      <group scale={CM}>
        {/* table */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
          <circleGeometry args={[900, 8]} />
          <meshBasicMaterial color="rgb(12, 32, 62)" toneMapped={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[34, 64]} />
          <meshBasicMaterial map={tableTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>

        {/* the glass */}
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

        {/* the water: a BLENDED volume drawn after the glass, not a second transmissive body.
            Nested transmissive objects cannot see each other and fought over the depth buffer (see README). */}
        <mesh position={[0, BASE_TH + LEVEL / 2, 0]} renderOrder={4}>
          <cylinderGeometry args={[R_IN - 0.02, R_IN - 0.02, LEVEL, 96, 1]} />
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
        <mesh position={[0, WATER_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
          <circleGeometry args={[R_IN - 0.02, 96]} />
          <meshBasicMaterial color="rgb(170, 225, 250)" transparent opacity={0.42} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* the ice, riding 91.7 % under the line: a cloudy body, a bright cap above the water, and fractures */}
        <group position={[0.2, cubeY + bob, 0.1]} rotation={[0.05, 0.4, 0.04]} scale={s}>
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
          <lineSegments renderOrder={7} geometry={fractureGeo}>
            <lineBasicMaterial color="rgb(240, 250, 255)" transparent opacity={0.85} depthWrite={false} />
          </lineSegments>
        </group>
        <mesh position={[0.2, WATER_Y + (side - draft) / 2, 0.1]} rotation={[0.05, 0.4, 0.04]} renderOrder={8}>
          <boxGeometry args={[side * 0.97, Math.max(0.001, side - draft), side * 0.97]} />
          <meshBasicMaterial color="rgb(240, 250, 255)" transparent opacity={0.7} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* the space the ice takes up: the submerged volume, as a ghost, once the ice is going */}
        <mesh position={[0.2, WATER_Y - (RHO_ICE * SIDE0) / 2, 0.1]} rotation={[0.05, 0.4, 0.04]} renderOrder={9}>
          <boxGeometry args={[SIDE0 * 0.98, RHO_ICE * SIDE0, SIDE0 * 0.98]} />
          <meshBasicMaterial color={CYAN} transparent opacity={ghost * 0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <lineSegments position={[0.2, WATER_Y - (RHO_ICE * SIDE0) / 2, 0.1]} rotation={[0.05, 0.4, 0.04]} renderOrder={10}>
          <edgesGeometry args={[ghostBox]} />
          <lineBasicMaterial color={CYAN} transparent opacity={Math.min(1, ghost * 3.2)} depthWrite={false} toneMapped={false} />
        </lineSegments>

        {/* the level ring — the one amber element */}
        <mesh position={[0, WATER_Y, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={5}>
          <torusGeometry args={[R_IN + WALL + 0.1, 0.05, 12, 128]} />
          <meshBasicMaterial color={AMBER} toneMapped={false} />
        </mesh>
        <mesh position={[0, WATER_Y, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={5}>
          <torusGeometry args={[R_IN + WALL + 0.1, 0.2, 12, 128]} />
          <meshBasicMaterial color={AMBER} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>

        {/* two tall strip lights, out of frame, so the glass has the long highlights glass has */}
        {[-1, 1].map((sgn) => (
          <mesh key={sgn} position={[sgn * 26, 14, -6]} rotation={[0, sgn * -0.6, 0]}>
            <planeGeometry args={[3, 38]} />
            <meshBasicMaterial color="rgb(255, 255, 255)" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const GlassProbe: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BASE.ink }}>
      <ThreeCanvas
        width={REEL_W}
        height={REEL_H}
        camera={{ fov: 30, position: [0, 5.0, 17], near: 0.5, far: 200 }}
        gl={{ antialias: true }}
        onCreated={({ camera }) => camera.lookAt(0, 3.2, 0)}
      >
        <Env />
        <directionalLight position={[-6, 12, 8]} intensity={1.6} color="rgb(255, 244, 230)" />
        <directionalLight position={[8, 6, -8]} intensity={1.2} color={CYAN} />
        <Scene frame={frame} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
