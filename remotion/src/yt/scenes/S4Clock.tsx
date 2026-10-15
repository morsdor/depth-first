import React from 'react';
import { COL, Chapter, Ground, H, Txt, W, fmtInt, lin, ramp, rgba, sceneWindow, useT } from '../lib/kit';
import { GPS } from '../data/gps';

const WIN = sceneWindow('clock');
const D2 = GPS.demo2d;
const IT = GPS.fix.iters;
const SC = 100;                                         // px per toy-kilometre
const CX = 2650;
const CY = 1060;
const SAT_COL = [COL.cyan, COL.blue, COL.purple];
const sx = (x: number) => CX + SC * x;
const sy = (y: number) => CY - SC * y;

/** 04 — the quartz problem: three circles that do not meet, until the clock error is solved too. */
export const S4Clock: React.FC = () => {
  const t = useT();
  const [c0, c1, c2] = WIN.cue;
  const e2 = WIN.cueEnd[2];

  // iterate index, interpolated (toy iterates; the same step count as the real 3-D solve)
  const L = D2.iters.length;
  const u = lin(t, c2 + 3.2, e2 - 1.2) * (L - 1);
  const k = Math.min(L - 2, Math.floor(u));
  const f = ramp(u - k, 0, 1);
  const a = D2.iters[k];
  const b = D2.iters[Math.min(L - 1, k + 1)];
  const est = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, b: a.b + (b.b - a.b) * f };
  const solved = u >= L - 1.01;

  const showStage = ramp(t, c0 + 1.0, c0 + 2.0);
  const ringsOn = ramp(t, c0 + 1.6, c0 + 3.0);

  // the real solve, as a staircase of errors
  const logw = (m: number) => 1140 * Math.max(0.02, Math.log10(m + 1) / Math.log10(IT[0].pos_err_m + 1));
  const shown = Math.floor(lin(t, c2 + 3.2, e2 - 1.2) * (IT.length - 0.01)) ;

  return (
    <>
      <Ground t={t} cx={0.7} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s4-stage">
            <rect x={1500} y={160} width={2160} height={1760} rx={24} />
          </clipPath>
        </defs>
        <g opacity={showStage}>
          <rect x={1500} y={160} width={2160} height={1760} rx={24} fill={rgba(COL.slate, 0.55)} stroke={rgba(COL.ash, 0.4)} strokeWidth={3} />
          <g clipPath="url(#s4-stage)">
            {/* a toy grid, one line per kilometre */}
            {Array.from({ length: 25 }, (_, i) => i - 12).map((g) => (
              <React.Fragment key={g}>
                <line x1={sx(g)} y1={160} x2={sx(g)} y2={1920} stroke={rgba(COL.graphite, 0.55)} strokeWidth={2} />
                <line x1={1500} y1={sy(g)} x2={3660} y2={sy(g)} stroke={rgba(COL.graphite, 0.55)} strokeWidth={2} />
              </React.Fragment>
            ))}
            {D2.sats.map((s, i) => (
              <circle key={i} cx={sx(s[0])} cy={sy(s[1])} r={Math.max(0, (D2.rho[i] - est.b) * SC)} fill={rgba(SAT_COL[i], 0.04)} stroke={rgba(SAT_COL[i], 0.9 * ringsOn)} strokeWidth={6} />
            ))}
            {D2.sats.map((s, i) => {
              const r = Math.max(0, (D2.rho[i] - est.b) * SC);
              return <circle key={`m${i}`} cx={sx(s[0])} cy={sy(s[1])} r={r} fill="none" stroke={rgba(COL.bone, 0.55 * ringsOn)} strokeWidth={4} strokeDasharray="6 120" strokeDashoffset={-t * 160 - i * 90} />;
            })}
            {D2.sats.map((s, i) => {
              const ph = (t * 0.3 + i * 0.33) % 1;
              return <circle key={`r${i}`} cx={sx(s[0])} cy={sy(s[1])} r={ph * 700} fill="none" stroke={rgba(SAT_COL[i], 0.35 * (1 - ph) * ringsOn)} strokeWidth={4} />;
            })}
          </g>
          {D2.sats.map((s, i) => (
            <g key={i} transform={`translate(${sx(s[0])} ${sy(s[1])})`}>
              <rect x={-26} y={-16} width={52} height={32} fill={COL.bone} stroke={COL.ink} strokeWidth={3} />
              <rect x={-74} y={-12} width={44} height={24} fill={SAT_COL[i]} />
              <rect x={30} y={-12} width={44} height={24} fill={SAT_COL[i]} />
            </g>
          ))}
          {/* your estimate, and (once solved) where you really are */}
          <circle cx={sx(est.x)} cy={sy(est.y)} r={22 + 4 * Math.sin(t * 5)} fill={COL.blue} stroke={COL.bone} strokeWidth={6} opacity={ringsOn} />
        </g>
      </svg>

      {/* stage captions */}
      <Txt x={1560} y={190} t={t} at={c0 + 5.0} font="mono" size={44} color={COL.ash}>TOY VERSION · a flat map · 3 satellites · unknowns: x, y and the clock</Txt>
      <Txt x={1560} y={1830} t={t} at={c0 + 6.2} out={c2 + 3} font="mono" size={56} color={COL.bone}>every circle is too big by the same amount</Txt>
      <Txt x={1560} y={1830} t={t} at={c2 + 3.2} font="mono" size={56} color={COL.ash}>{`clock error found so far: ${est.b.toFixed(2)} km`}</Txt>
      {solved && <Txt x={sx(est.x) + 50} y={sy(est.y) - 110} t={t} at={e2 - 1.4} font="mono" size={64} color={COL.bone}>YOU</Txt>}

      {/* left column */}
      {/* c0 */}
      <Txt x={240} y={300} t={t} at={c0 + 0.3} out={c1 - 0.3} font="display" size={140} color={COL.bone} lh={1}>NEEDED</Txt>
      <Txt x={240} y={450} t={t} at={c0 + 0.6} out={c1 - 0.3} font="mono" size={104} color={COL.cyan} lh={1}>a few billionths</Txt>
      <Txt x={240} y={590} t={t} at={c0 + 0.8} out={c1 - 0.3} font="sans" size={72} color={COL.ash}>of a second</Txt>
      <Txt x={240} y={900} t={t} at={c0 + 2.6} out={c1 - 0.3} font="display" size={140} color={COL.bone} lh={1}>A PHONE HAS</Txt>
      <Txt x={240} y={1050} t={t} at={c0 + 2.9} out={c1 - 0.3} font="mono" size={104} color={COL.bone} lh={1}>a quartz crystal</Txt>
      <Txt x={240} y={1200} t={t} at={c0 + 3.4} out={c1 - 0.3} font="sans" size={72} color={COL.ash} maxW={1200}>cheap, and it can be off by a lot</Txt>

      {/* c1 */}
      <Txt x={240} y={300} t={t} at={c1 + 0.3} out={c2 - 0.3} font="mono" size={210} color={COL.bone} lh={1}>1 µs</Txt>
      <Txt x={240} y={540} t={t} at={c1 + 0.9} out={c2 - 0.3} font="mono" size={210} color={COL.cyan} lh={1}>= 300 m</Txt>
      <Txt x={240} y={860} t={t} at={c1 + 2.0} out={c2 - 0.3} font="mono" size={72} color={COL.ash}>a quartz error of 0.5 ms</Txt>
      <Txt x={240} y={960} t={t} at={c1 + 2.4} out={c2 - 0.3} font="mono" size={110} color={COL.bone} lh={1}>= 150 km</Txt>
      <Txt x={240} y={1290} t={t} at={c1 + 3.6} out={c2 - 0.3} font="sans" size={72} color={COL.ash}>four unknowns</Txt>
      <Txt x={240} y={1400} t={t} at={c1 + 4.0} out={c2 - 0.3} font="mono" size={150} color={COL.bone} lh={1}>x · y · z · b</Txt>
      <Txt x={240} y={1600} t={t} at={c1 + 4.8} out={c2 - 0.3} font="sans" size={64} color={COL.ash} maxW={1200}>where you are in 3-D, and how wrong your clock is</Txt>

      {/* c2 */}
      <Txt x={240} y={260} t={t} at={c2 + 0.3} font="display" size={140} color={COL.bone} lh={1}>4 UNKNOWNS</Txt>
      <Txt x={240} y={410} t={t} at={c2 + 0.9} font="display" size={140} color={COL.cyan} lh={1}>4 SATELLITES</Txt>
      <Txt x={240} y={680} t={t} at={c2 + 3.0} font="mono" size={48} color={COL.ash}>A REAL FIX · START: THE CENTRE OF THE EARTH</Txt>
      {IT.map((r, i) => {
        const y = 790 + i * 160;
        const on = i <= shown;
        const w = logw(r.pos_err_m);
        return (
          <React.Fragment key={i}>
            <Txt x={240} y={y} t={t} at={c2 + 3.2 + (i * (e2 - c2 - 4.4)) / IT.length} font="mono" size={48} color={COL.ash}>{`step ${r.k}`}</Txt>
            {on && (
              <div style={{ position: 'absolute', left: 240, top: y + 62, height: 26, borderRadius: 4, background: i === IT.length - 1 ? COL.cyan : COL.ash, width: w * ramp(t, c2 + 3.2 + (i * (e2 - c2 - 4.4)) / IT.length, c2 + 4.0 + (i * (e2 - c2 - 4.4)) / IT.length) }} />
            )}
            <Txt x={1380} y={y} t={t} at={c2 + 3.4 + (i * (e2 - c2 - 4.4)) / IT.length} align="right" font="mono" size={48} color={i === IT.length - 1 ? COL.cyan : COL.bone}>
              {r.pos_err_m >= 1000 ? `${fmtInt(r.pos_err_m)} m` : `${r.pos_err_m.toFixed(1)} m`}
            </Txt>
          </React.Fragment>
        );
      })}

      <Chapter n={4} name="THE FOURTH SATELLITE" t={t} dur={WIN.dur} />
    </>
  );
};
