import React from 'react';
import { COL, Chapter, Ground, H, Txt, W, fmtInt, lin, phraseAt, ramp, rgba, sceneWindow, useT } from '../lib/kit';
import { GPS } from '../data/gps';

const WIN = sceneWindow('ranging');
const N = GPS.numbers;
const C_KMS = 299792.458;

type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3) => Math.sqrt(dot(a, a));
const unit = (a: V3): V3 => mul(a, 1 / len(a));
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** A toy of the geometry (not to scale): three satellites above the ground, you at the origin. */
const SATS: V3[] = ([[-560, 300, 820], [600, 180, 900], [60, -560, 760]] as V3[]).map((v) => mul(v, 0.64));
const RAD = SATS.map(len);                                   // each sphere passes through you
const SPH_COL = [COL.cyan, COL.blue, COL.purple];

/** The mirror image of you across the plane of the three satellites: the other point all three spheres share. */
const mirror = (): V3 => {
  const n = unit(cross(sub(SATS[1], SATS[0]), sub(SATS[2], SATS[0])));
  const d = dot(n, sub([0, 0, 0], SATS[0]));
  return sub([0, 0, 0], mul(n, 2 * d));
};
const R2 = mirror();

/** The circle where sphere i meets sphere j. */
const circle = (i: number, j: number, n = 120): V3[] => {
  const a = SATS[i];
  const b = SATS[j];
  const d = len(sub(b, a));
  const u = unit(sub(b, a));
  const x = (RAD[i] ** 2 - RAD[j] ** 2 + d * d) / (2 * d);
  const rho = Math.sqrt(RAD[i] ** 2 - x * x);
  const c = add(a, mul(u, x));
  const e1 = unit(cross(u, [0, 0, 1]));
  const e2 = cross(u, e1);
  return Array.from({ length: n + 1 }, (_, k) => {
    const ph = (2 * Math.PI * k) / n;
    return add(c, add(mul(e1, rho * Math.cos(ph)), mul(e2, rho * Math.sin(ph))));
  });
};

/** 03 — distance from time: one sphere, then a circle, then two points. */
export const S3Ranging: React.FC = () => {
  const t = useT();
  const [c0, c1, c2] = WIN.cue;

  // ── A: the side view, to scale. Receiver at the top of the Earth, satellite 3.17 Earth-radii above. ──
  const ER = 420;
  const rxA = { x: 3050, y: 1700 };
  const satA = { x: rxA.x, y: rxA.y - ER * (N.alt_km / 6371) };
  const aOut = 1 - ramp(t, c2 - 0.5, c2 + 0.3, 0, 1, true);
  const travel = ramp(t, c0 + 1.2, c0 + 4.6) ;                 // wavefront progress, slowed
  const slow = 3.4 / (N.overhead_ms / 1000);                  // how many times slower than real time we are showing it
  const ms = N.overhead_ms * travel;

  // ── B: the three-sphere toy, rotating ──
  const yaw = 0.35 + 0.09 * t;
  const tilt = 1.0;
  const bx = 2650;
  const by = 1250;
  const proj = (p: V3) => {
    const x = p[0] * Math.cos(yaw) - p[1] * Math.sin(yaw);
    const y = p[0] * Math.sin(yaw) + p[1] * Math.cos(yaw);
    return { x: bx + x, y: by - (p[2] * Math.cos(tilt) - y * Math.sin(tilt)) * 1.0 };
  };
  const bIn = ramp(t, c2 - 0.2, c2 + 0.6);
  const s1At = c2 + 0.3;
  const s2At = phraseAt('ranging', 2, 'A second satellite') - 0.4;
  const s3At = phraseAt('ranging', 2, 'A third narrows') - 0.9;
  const youB = proj([0, 0, 0]);
  const r2B = proj(R2);

  const path = (pts: V3[], draw = 1) => {
    const n = Math.max(2, Math.floor(pts.length * draw));
    return pts.slice(0, n).map((p, k) => { const q = proj(p); return `${k ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }).join('');
  };

  return (
    <>
      <Ground t={t} cx={0.7} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* ── A ── */}
        <g opacity={aOut}>
          <circle cx={rxA.x} cy={rxA.y + ER} r={ER} fill={rgba(COL.slate, 0.9)} stroke={COL.ash} strokeWidth={5} />
          {/* the signal front: a circle of light expanding from the satellite */}
          {travel > 0 && travel < 1 && (
            <circle cx={satA.x} cy={satA.y} r={(rxA.y - satA.y) * travel} fill="none" stroke={rgba(COL.cyan, 0.9)} strokeWidth={8} />
          )}
          <line x1={satA.x} y1={satA.y} x2={rxA.x} y2={rxA.y} stroke={rgba(COL.cyan, 0.45)} strokeWidth={4} strokeDasharray="14 16" />
          {ramp(t, c1 - 0.2, c1 + 1.4) > 0 && (
            <circle cx={satA.x} cy={satA.y} r={(rxA.y - satA.y) * ramp(t, c1 - 0.2, c1 + 1.4)} fill={rgba(COL.cyan, 0.06)} stroke={rgba(COL.cyan, 0.9)} strokeWidth={6} />
          )}
          <circle cx={rxA.x} cy={rxA.y} r={22} fill={COL.blue} stroke={COL.bone} strokeWidth={6} />
          <g transform={`translate(${satA.x} ${satA.y})`}>
            <rect x={-70} y={-20} width={50} height={40} fill={COL.blue} stroke={COL.ink} strokeWidth={3} />
            <rect x={20} y={-20} width={50} height={40} fill={COL.blue} stroke={COL.ink} strokeWidth={3} />
            <rect x={-18} y={-18} width={36} height={36} fill={COL.bone} stroke={COL.ink} strokeWidth={3} />
          </g>
        </g>

        {/* ── B ── */}
        <g opacity={bIn}>
          {/* the ground */}
          <ellipse cx={bx} cy={by} rx={620} ry={620 * Math.sin(tilt)} fill={rgba(COL.slate, 0.8)} stroke={rgba(COL.ash, 0.5)} strokeWidth={4} />
          {SATS.map((s, k) => {
            const on = k === 0 ? ramp(t, s1At, s1At + 1.2) : k === 1 ? ramp(t, s2At, s2At + 1.2) : ramp(t, s3At, s3At + 1.2);
            if (on <= 0) return null;
            const q = proj(s);
            const g = proj([s[0], s[1], 0]);
            const rp = RAD[k] * on;
            return (
              <g key={k} opacity={Math.min(1, on * 1.2)}>
                <circle cx={q.x} cy={q.y} r={rp} fill={rgba(SPH_COL[k], 0.045)} stroke={rgba(SPH_COL[k], 0.55)} strokeWidth={4} />
                <line x1={q.x} y1={q.y} x2={g.x} y2={g.y} stroke={rgba(SPH_COL[k], 0.35)} strokeWidth={3} strokeDasharray="8 12" />
                <rect x={q.x - 30} y={q.y - 14} width={60} height={28} fill={COL.bone} stroke={COL.ink} strokeWidth={3} />
              </g>
            );
          })}
          {/* sphere 1 ∩ sphere 2: a circle */}
          <path d={path(circle(0, 1), ramp(t, s2At + 0.8, s2At + 2.6))} fill="none" stroke={COL.bone} strokeWidth={7} strokeLinecap="round" opacity={ramp(t, s2At + 0.6, s2At + 1)} />
          {/* …and the third sphere cuts it at two points */}
          <path d={path(circle(1, 2), ramp(t, s3At + 0.8, s3At + 2.4))} fill="none" stroke={rgba(COL.bone, 0.55)} strokeWidth={5} strokeLinecap="round" opacity={ramp(t, s3At + 0.6, s3At + 1)} />
          <circle cx={youB.x} cy={youB.y} r={24} fill={COL.blue} stroke={COL.bone} strokeWidth={7} opacity={ramp(t, s3At + 1.8, s3At + 2.4)} />
          <circle cx={r2B.x} cy={r2B.y} r={24} fill={COL.ink} stroke={COL.amber} strokeWidth={7} opacity={ramp(t, s3At + 2.4, s3At + 3.0)} />
        </g>
      </svg>

      {/* A — copy */}
      <Txt x={240} y={360} t={t} at={c0 + 0.2} out={c2 - 0.5} font="display" size={150} color={COL.bone} lh={1}>DELAY</Txt>
      <Txt x={240} y={500} t={t} at={c0 + 0.4} out={c2 - 0.5} font="display" size={150} color={COL.bone} lh={1}>× SPEED OF LIGHT</Txt>
      <Txt x={240} y={640} t={t} at={c0 + 0.6} out={c2 - 0.5} font="display" size={150} color={COL.cyan} lh={1}>= DISTANCE</Txt>
      <Txt x={240} y={1000} t={t} at={c0 + 1.2} out={c2 - 0.5} font="mono" size={64} color={COL.ash}>{`slowed ${fmtInt(slow)}×`}</Txt>
      <Txt x={240} y={1090} t={t} at={c0 + 1.2} out={c2 - 0.5} font="mono" size={190} color={COL.bone} lh={1}>{`${ms.toFixed(1)} ms`}</Txt>
      <Txt x={240} y={1360} t={t} at={c1 + 0.1} out={c2 - 0.5} font="mono" size={72} color={COL.ash}>{`${N.overhead_ms.toFixed(1)} ms × ${fmtInt(C_KMS)} km/s`}</Txt>
      <Txt x={240} y={1470} t={t} at={c1 + 0.6} out={c2 - 0.5} font="mono" size={150} color={COL.cyan} lh={1}>{`= ${fmtInt(N.alt_km)} km`}</Txt>
      <Txt x={1700} y={1700} t={t} at={c1 + 1.6} out={c2 - 0.5} font="sans" size={64} color={COL.ash} maxW={900}>{'a sphere of possible places, drawn to scale'}</Txt>
      <Txt x={3110} y={1710} t={t} at={c0 + 3.2} out={c2 - 0.5} font="mono" size={48} color={COL.bone}>YOU</Txt>

      {/* B — copy */}
      <Txt x={240} y={360} t={t} at={s1At + 0.3} font="display" size={150} color={COL.cyan} lh={1}>1 SATELLITE</Txt>
      <Txt x={240} y={500} t={t} at={s1At + 0.5} font="sans" size={84} color={COL.ash}>a sphere</Txt>
      <Txt x={240} y={700} t={t} at={s2At + 0.3} font="display" size={150} color={COL.blue} lh={1}>2 SATELLITES</Txt>
      <Txt x={240} y={840} t={t} at={s2At + 0.5} font="sans" size={84} color={COL.ash}>where they overlap: a circle</Txt>
      <Txt x={240} y={1040} t={t} at={s3At + 0.3} font="display" size={150} color={COL.purple} lh={1}>3 SATELLITES</Txt>
      <Txt x={240} y={1180} t={t} at={s3At + 0.5} font="sans" size={84} color={COL.ash}>two points…</Txt>
      <Txt x={youB.x + 60} y={youB.y + 30} t={t} at={s3At + 2.0} font="mono" size={56} color={COL.bone}>YOU</Txt>
      <Txt x={r2B.x + 60} y={r2B.y - 30} t={t} at={s3At + 2.8} font="mono" size={56} color={COL.amber}>OUT IN SPACE</Txt>
      <Txt x={240} y={1360} t={t} at={s3At + 3.2} font="sans" size={84} color={COL.ash}>…and one of them is out in space</Txt>

      <Chapter n={3} name="DISTANCE FROM TIME" t={t} dur={WIN.dur} />
    </>
  );
};

// keep lin referenced for tree-shaking parity with the other scenes
void lin;
void H;
