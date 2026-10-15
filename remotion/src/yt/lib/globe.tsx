import React from 'react';
import { COL, rgba } from './kit';
import { LAND } from '../data/land';
import { GPS } from '../data/gps';

/**
 * An orthographic globe with real coastlines (Natural Earth, public domain) and real Kepler orbits.
 * Everything is in an Earth-centred INERTIAL frame: the Earth spins under fixed orbital planes, which
 * is how the constellation really behaves. Units: Earth radii, unless a name says km.
 */
const D2R = Math.PI / 180;
export type V3 = [number, number, number];
export type View = { lon: number; lat: number; R: number; cx: number; cy: number };

export const RE_KM = 6371;
export const RORB = GPS.orbit.a_m / 1000 / RE_KM;          // 4.169 Earth radii
export const T_ORB = GPS.orbit.period_s;
export const SPIN_DEG_PER_S = 360 / 86164.0905;              // sidereal rotation
export const INC = GPS.orbit.inc_deg;

export const YOU = { lon: GPS.fix.lon, lat: GPS.fix.lat };

export const vec = (lonDeg: number, latDeg: number, r = 1): V3 => [
  r * Math.cos(latDeg * D2R) * Math.cos(lonDeg * D2R),
  r * Math.cos(latDeg * D2R) * Math.sin(lonDeg * D2R),
  r * Math.sin(latDeg * D2R),
];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const norm = (a: V3) => Math.sqrt(dot(a, a));

/** Satellite on a circular orbit in plane (raan, INC) at argument of latitude u0 + n·t. */
export const satPos = (raanDeg: number, u0Deg: number, tSim: number): V3 => {
  const u = (u0Deg + (360 * tSim) / T_ORB) * D2R;
  const o = raanDeg * D2R;
  const i = INC * D2R;
  return [
    RORB * (Math.cos(o) * Math.cos(u) - Math.sin(o) * Math.sin(u) * Math.cos(i)),
    RORB * (Math.sin(o) * Math.cos(u) + Math.cos(o) * Math.sin(u) * Math.cos(i)),
    RORB * (Math.sin(u) * Math.sin(i)),
  ];
};

export const makeProj = (v: View) => {
  const lon = v.lon * D2R;
  const lat = v.lat * D2R;
  const f: V3 = [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
  const e: V3 = [-Math.sin(lon), Math.cos(lon), 0];
  const n: V3 = [-Math.sin(lat) * Math.cos(lon), -Math.sin(lat) * Math.sin(lon), Math.cos(lat)];
  return (p: V3) => ({ x: v.cx + v.R * dot(p, e), y: v.cy - v.R * dot(p, n), z: dot(p, f) });
};

export const elevationDeg = (sat: V3, rx: V3) => {
  const d = sub(sat, rx);
  const up: V3 = [rx[0] / norm(rx), rx[1] / norm(rx), rx[2] / norm(rx)];
  return Math.asin(dot(d, up) / norm(d)) / D2R;
};

const hidden = (p: { x: number; y: number; z: number }, v: View) =>
  p.z < 0 && (p.x - v.cx) ** 2 + (p.y - v.cy) ** 2 < v.R * v.R;

/** The sphere, graticule and coastlines. `spin` is the Earth's rotation in degrees since t=0. */
export const GlobeBody: React.FC<{ view: View; spin: number; id: string; land?: boolean; glow?: number }> = ({
  view, spin, id, land = true, glow = 1,
}) => {
  const P = makeProj(view);
  const { cx, cy, R } = view;

  let landD = '';
  if (land) {
    for (const ring of LAND) {
      let any = false;
      const pts: string[] = [];
      for (const [lo, la] of ring) {
        const p = P(vec(lo + spin, la));
        let x = p.x;
        let y = p.y;
        if (p.z >= 0) any = true;
        else {
          const dx = x - cx;
          const dy = y - cy;
          const m = Math.hypot(dx, dy) || 1;
          x = cx + (dx / m) * R;
          y = cy + (dy / m) * R;
        }
        pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      if (any) landD += `M${pts.join('L')}Z`;
    }
  }

  let gratD = '';
  const seg = (pts: { x: number; y: number; z: number }[]) => {
    let run: string[] = [];
    for (const p of pts) {
      if (p.z >= 0) run.push(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      else {
        if (run.length > 1) gratD += `M${run.join('L')}`;
        run = [];
      }
    }
    if (run.length > 1) gratD += `M${run.join('L')}`;
  };
  for (let la = -60; la <= 60; la += 30) {
    const pts = [];
    for (let lo = 0; lo <= 360; lo += 6) pts.push(P(vec(lo + spin, la)));
    seg(pts);
  }
  for (let lo = 0; lo < 360; lo += 30) {
    const pts = [];
    for (let la = -90; la <= 90; la += 6) pts.push(P(vec(lo + spin, la)));
    seg(pts);
  }

  return (
    <g>
      <defs>
        <radialGradient id={`${id}-sph`} cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor={COL.slate} />
          <stop offset="70%" stopColor="rgb(8, 23, 48)" />
          <stop offset="100%" stopColor={COL.ink} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={R * 0.035} />
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={R * 1.02} fill="none" stroke={rgba(COL.cyan, 0.55 * glow)} strokeWidth={R * 0.07} filter={`url(#${id}-blur)`} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#${id}-sph)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <path d={gratD} fill="none" stroke={rgba(COL.graphite, 0.9)} strokeWidth={Math.max(1.5, R * 0.004)} />
        {land && <path d={landD} fill={rgba(COL.ash, 0.30)} stroke={rgba(COL.ash, 0.75)} strokeWidth={Math.max(1.5, R * 0.004)} strokeLinejoin="round" />}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={rgba(COL.ink, 0.55)} strokeWidth={R * 0.35} />
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={rgba(COL.ash, 0.55)} strokeWidth={Math.max(2, R * 0.006)} />
    </g>
  );
};

/** One orbital plane as a ring, split into the part you can see and the part the Earth hides. */
export const OrbitRing: React.FC<{ view: View; raan: number; color: string; width?: number; alpha?: number; dashBack?: boolean }> = ({
  view, raan, color, width = 3, alpha = 0.8, dashBack = true,
}) => {
  const P = makeProj(view);
  const front: string[] = [];
  const back: string[] = [];
  let curF: string[] = [];
  let curB: string[] = [];
  const N = 180;
  for (let k = 0; k <= N; k++) {
    const p = P(satPos(raan, (360 * k) / N, 0));
    const s = `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    if (hidden(p, view)) {
      if (curF.length > 1) front.push(`M${curF.join('L')}`);
      if (curB.length > 1) back.push(`M${curB.join('L')}`);
      curF = []; curB = [];
    } else if (p.z >= 0) {
      if (curB.length > 1) back.push(`M${curB.join('L')}`);
      curB = [];
      curF.push(s);
    } else {
      if (curF.length > 1) front.push(`M${curF.join('L')}`);
      curF = [];
      curB.push(s);
    }
  }
  if (curF.length > 1) front.push(`M${curF.join('L')}`);
  if (curB.length > 1) back.push(`M${curB.join('L')}`);
  return (
    <g fill="none" strokeLinecap="round">
      <path d={back.join('')} stroke={rgba(color, alpha * 0.45)} strokeWidth={width} strokeDasharray={dashBack ? `${width * 3} ${width * 3}` : undefined} />
      <path d={front.join('')} stroke={rgba(color, alpha)} strokeWidth={width} />
    </g>
  );
};

/** A GPS satellite: bus, two panels, a glow. `s` is half the panel span in px. */
export const SatIcon: React.FC<{ x: number; y: number; s?: number; color?: string; angle?: number; glow?: boolean }> = ({
  x, y, s = 22, color = COL.bone, angle = 0, glow = true,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    {glow && <circle r={s * 1.8} fill={rgba(COL.cyan, 0.16)} />}
    <rect x={-s * 1.05} y={-s * 0.32} width={s * 0.78} height={s * 0.64} fill={COL.blue} stroke={COL.ink} strokeWidth={1.5} />
    <rect x={s * 0.27} y={-s * 0.32} width={s * 0.78} height={s * 0.64} fill={COL.blue} stroke={COL.ink} strokeWidth={1.5} />
    <rect x={-s * 0.3} y={-s * 0.3} width={s * 0.6} height={s * 0.6} fill={color} stroke={COL.ink} strokeWidth={1.5} />
  </g>
);

/** Where a satellite is on screen, and whether the Earth is in front of it. */
export const satScreen = (view: View, raan: number, u0: number, tSim: number) => {
  const P = makeProj(view);
  const p3 = satPos(raan, u0, tSim);
  const p = P(p3);
  return { ...p, p3, hid: hidden(p, view) };
};
