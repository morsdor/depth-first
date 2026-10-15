import React from 'react';
import { COL, Chapter, Ground, H, Txt, W, lin, phraseAt, ramp, rgba, sceneWindow, useT } from '../lib/kit';

const WIN = sceneWindow('accuracy');
const CX = 2580;
const CY = 1040;
const L1 = 1575.42;
const L5 = 1176.45;
const RATIO = (L1 / L5) ** 2;                            // ionospheric delay ∝ 1/f²

/** 06 — how accurate it is, what spoils it, and what used to be done to it on purpose. */
export const S6Accuracy: React.FC = () => {
  const t = useT();
  const [c0, c1, c2] = WIN.cue;
  const P = (i: number, f: string) => phraseAt('accuracy', i, f);
  const tCab = P(0, 'which side of it');
  const tBuild = P(0, 'And tall buildings');
  const tRiver = P(0, 'in a river');
  const tUntil = P(2, 'Until May');
  const tBlur = P(2, 'blurred it');
  const tHund = P(2, 'about a hundred');
  const tOffP = P(2, 'A presidential order');
  const tOff = P(2, 'switched that off');
  const tHappy = P(2, 'A government removing');
  const zoom = ramp(t, c2 + 0.4, c2 + 2.8);
  const Z = 20 + (5.5 - 20) * zoom;                      // px per metre
  const mapOn = ramp(t, c0 + 0.2, c0 + 1.2) * (1 - ramp(t, c1 - 0.5, c1 + 0.1, 0, 1, true)) + ramp(t, c2 - 0.3, c2 + 0.5);
  const mapA = Math.min(1, mapOn) * (1 - ramp(t, c1 - 0.5, c1 + 0.1) * (1 - ramp(t, c2 - 0.3, c2 + 0.5)));
  const ionOn = ramp(t, c1 - 0.2, c1 + 0.6) * (1 - ramp(t, c2 - 0.6, c2 - 0.1, 0, 1, true));

  const road = 80;                                       // metres between roads
  const lines = Array.from({ length: 41 }, (_, i) => i - 20);
  const sa = 1 - ramp(t, tOff, tOff + 1.0);            // the 100 m ring fades when the degradation ends

  return (
    <>
      <Ground t={t} cx={0.7} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s6-stage"><rect x={1500} y={160} width={2160} height={1760} rx={24} /></clipPath>
        </defs>
        <rect x={1500} y={160} width={2160} height={1760} rx={24} fill={rgba(COL.slate, 0.55)} stroke={rgba(COL.ash, 0.4)} strokeWidth={3} />

        {/* ── the street map, ringed to scale ── */}
        <g opacity={mapA} clipPath="url(#s6-stage)">
          {lines.map((i) => (
            <React.Fragment key={i}>
              <rect x={CX + i * road * Z - 7 * Z} y={160} width={14 * Z} height={1760} fill={rgba(COL.graphite, 0.55)} />
              <rect x={1500} y={CY + i * road * Z - 7 * Z} width={2160} height={14 * Z} fill={rgba(COL.graphite, 0.55)} />
            </React.Fragment>
          ))}
          {/* buildings */}
          {[-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => (
            <rect key={`${i}${j}`} x={CX + (i * road + 10) * Z} y={CY + (j * road + 10) * Z} width={(road - 20) * Z} height={(road - 20) * Z} fill={rgba(COL.slate, 0.95)} stroke={rgba(COL.ash, 0.25)} strokeWidth={2} />
          )))}
          {/* 100 m: how it was degraded on purpose */}
          <circle cx={CX} cy={CY} r={100 * Z} fill={rgba(COL.red, 0.05 * sa)} stroke={rgba(COL.red, (0.65 + 0.25 * Math.sin(t * 4)) * sa)} strokeWidth={6} opacity={ramp(t, c2 + 1.8, c2 + 2.8)} />
          {/* 4.9 m and 2 m */}
          <circle cx={CX} cy={CY} r={4.9 * Z} fill={rgba(COL.bone, 0.1)} stroke={COL.bone} strokeWidth={6} opacity={ramp(t, c0 + 0.8, c0 + 1.6)} />
          <circle cx={CX} cy={CY} r={2 * Z} fill={rgba(COL.cyan, 0.16)} stroke={COL.cyan} strokeWidth={6} opacity={ramp(t, c0 + 3.2, c0 + 4.0)} />
          {[0, 1].map((k) => {
            const ph = (t * 0.5 + k * 0.5) % 1;
            return <circle key={k} cx={CX} cy={CY} r={8 + ph * 9 * Z} fill="none" stroke={rgba(COL.blue, 0.7 * (1 - ph))} strokeWidth={4} />;
          })}
          <circle cx={CX} cy={CY} r={Math.max(7, 0.9 * Z * 0.5)} fill={COL.blue} stroke={COL.bone} strokeWidth={4} />
          {/* your cab, on the other side of the street */}
          <g opacity={ramp(t, tCab, tCab + 0.8)}>
            <rect x={CX + 10 * Z} y={CY + 3 * Z} width={4.6 * Z} height={2 * Z} rx={0.5 * Z} fill={COL.amber} stroke={COL.ink} strokeWidth={3} />
            <rect x={CX + 11.6 * Z} y={CY + 3.4 * Z} width={1.8 * Z} height={1.2 * Z} fill={COL.ink} />
          </g>
          {/* a building bouncing the signal: the long way round looks like a longer distance */}
          {(() => {
            const o = ramp(t, tBuild - 0.2, tBuild + 0.8) * (1 - ramp(t, c1 - 0.7, c1 - 0.2));
            return (
              <g opacity={o}>
                <line x1={3480} y1={260} x2={CX + 78 * Z} y2={CY - 40 * Z} stroke={rgba(COL.cyan, 0.9)} strokeWidth={6} strokeDasharray="14 14" strokeDashoffset={-t * 150} />
                <line x1={CX + 78 * Z} y1={CY - 40 * Z} x2={CX + 6} y2={CY - 6} stroke={rgba(COL.cyan, 0.9)} strokeWidth={6} strokeDasharray="14 14" strokeDashoffset={-t * 150} />
              </g>
            );
          })()}
        </g>

        {/* ── the ionosphere, two frequencies ── */}
        <g opacity={ionOn}>
          <rect x={1500} y={520} width={2160} height={420} fill={rgba(COL.purple, 0.16)} />
          <line x1={1500} y1={520} x2={3660} y2={520} stroke={rgba(COL.purple, 0.7)} strokeWidth={3} />
          <line x1={1500} y1={940} x2={3660} y2={940} stroke={rgba(COL.purple, 0.7)} strokeWidth={3} />
          <path d="M1500 1920 Q2580 1620 3660 1920 Z" fill={rgba(COL.slate, 0.95)} stroke={COL.ash} strokeWidth={5} />
          {/* straight line for reference */}
          <line x1={3500} y1={240} x2={1900} y2={1700} stroke={rgba(COL.ash, 0.35)} strokeWidth={4} strokeDasharray="10 14" />
          {/* L1: bent a little */}
          <polyline points="3500,240 2900,520 2800,940 1900,1700" fill="none" stroke={COL.cyan} strokeWidth={8} strokeDasharray={`${3600 * ramp(t, c1 + 1.0, c1 + 4.0)} 4000`} />
          {/* L5: bent more */}
          <polyline points="3500,240 2960,520 2640,940 1900,1700" fill="none" stroke={COL.blue} strokeWidth={8} strokeDasharray={`${3600 * ramp(t, c1 + 2.4, c1 + 5.4)} 4000`} />
          {(() => {
            const along = (pts: number[][], u: number) => {
              const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
              const tot = segs.reduce((a, b) => a + b, 0);
              let d = u * tot;
              for (let i = 0; i < segs.length; i++) {
                if (d <= segs[i] || i === segs.length - 1) {
                  const f = Math.min(1, d / segs[i]);
                  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
                }
                d -= segs[i];
              }
              return pts[pts.length - 1];
            };
            const l1 = [[3500, 240], [2900, 520], [2800, 940], [1900, 1700]];
            const l5 = [[3500, 240], [2960, 520], [2640, 940], [1900, 1700]];
            const u = (t * 0.22) % 1;
            const a = along(l1, u);
            const b = along(l5, Math.max(0, u - 0.05));
            const on = ramp(t, c1 + 4.2, c1 + 5.0);
            return (
              <g opacity={on}>
                <circle cx={a[0]} cy={a[1]} r={18} fill={COL.cyan} />
                <circle cx={b[0]} cy={b[1]} r={18} fill={COL.blue} />
              </g>
            );
          })()}
          <circle cx={1900} cy={1700} r={22} fill={COL.blue} stroke={COL.bone} strokeWidth={6} />
          <g transform="translate(3500 240)">
            <rect x={-70} y={-16} width={50} height={32} fill={COL.blue} />
            <rect x={20} y={-16} width={50} height={32} fill={COL.blue} />
            <rect x={-16} y={-16} width={32} height={32} fill={COL.bone} />
          </g>
        </g>
      </svg>

      {/* map labels */}
      <Txt x={CX + 6 * 20 + 40} y={CY - 4.9 * 20 - 120} t={t} at={c0 + 1.0} out={c1 - 0.6} font="mono" size={56} color={COL.bone}>a phone: ~4.9 m</Txt>
      <Txt x={CX + 6 * 20 + 40} y={CY + 4.9 * 20 + 30} t={t} at={c0 + 3.4} out={c1 - 0.6} font="mono" size={56} color={COL.cyan}>the signals: ~2 m</Txt>
      <Txt x={3480} y={300} t={t} at={tBuild + 0.3} out={c1 - 0.6} font="mono" size={48} color={COL.cyan} align="right">bounced off a building</Txt>
      <Txt x={CX} y={CY - 100 * 5.5 - 90} t={t} at={tUntil} out={tOff} font="mono" size={56} color={COL.red} align="center">until 2 May 2000: ~100 m, on purpose</Txt>
      <Txt x={CX + 7 * 5.5 + 60} y={CY + 20} t={t} at={tOff + 0.8} font="mono" size={56} color={COL.bone}>today: ~5 m</Txt>
      <Txt x={1560} y={190} t={t} at={c0 + 0.6} out={c1 - 0.6} font="mono" size={44} color={COL.ash}>ringed to scale on a city grid</Txt>

      {/* ionosphere labels */}
      <Txt x={1560} y={200} t={t} at={c1 + 0.8} out={c2 - 0.6} font="mono" size={44} color={COL.purple}>THE IONOSPHERE</Txt>
      <Txt x={3560} y={400} t={t} at={c1 + 1.4} out={c2 - 0.6} font="mono" size={52} color={COL.cyan} align="right">{`L1 · ${L1.toFixed(2)} MHz`}</Txt>
      <Txt x={3560} y={480} t={t} at={c1 + 2.8} out={c2 - 0.6} font="mono" size={52} color={COL.blue} align="right">{`L5 · ${L5.toFixed(2)} MHz`}</Txt>

      {/* left column */}
      <Txt x={240} y={290} t={t} at={c0 + 0.3} out={c1 - 0.4} font="mono" size={64} color={COL.ash}>TYPICAL PHONE, OPEN SKY</Txt>
      <Txt x={240} y={380} t={t} at={c0 + 0.6} out={c1 - 0.4} font="mono" size={230} color={COL.bone} lh={1}>~ 5 m</Txt>
      <Txt x={240} y={700} t={t} at={c0 + 3.0} out={c1 - 0.4} font="mono" size={64} color={COL.ash}>SIGNALS IN SPACE · SPECIFIED</Txt>
      <Txt x={240} y={790} t={t} at={c0 + 3.3} out={c1 - 0.4} font="mono" size={180} color={COL.cyan} lh={1}>~ 2 m</Txt>
      <Txt x={240} y={1100} t={t} at={tCab - 0.4} out={c1 - 0.4} font="display" size={110} color={COL.bone} lh={1}>THE FINE PRINT</Txt>
      <Txt x={240} y={1230} t={t} at={tCab} out={c1 - 0.4} font="sans" size={72} color={COL.ash} maxW={1160}>your cab is on the other side of the street</Txt>
      <Txt x={240} y={1420} t={t} at={tBuild} out={c1 - 0.4} font="sans" size={72} color={COL.ash} maxW={1160}>tall buildings bounce the signals…</Txt>
      <Txt x={240} y={1590} t={t} at={tRiver - 0.2} out={c1 - 0.4} font="sans" size={72} color={COL.bone} maxW={1160}>…so the blue dot ends up in a river</Txt>
      <Txt x={CX + 235} y={CY - 8} t={t} at={tCab + 0.3} out={c1 - 0.6} font="mono" size={52} color={COL.amber}>your cab</Txt>

      <Txt x={240} y={290} t={t} at={c1 + 0.3} out={c2 - 0.4} font="display" size={130} color={COL.bone} lh={1}>DELAY ∝ 1 / f²</Txt>
      <Txt x={240} y={460} t={t} at={c1 + 1.2} out={c2 - 0.4} font="sans" size={72} color={COL.ash} maxW={1160}>the delay depends on frequency, so two frequencies give it away</Txt>
      <Txt x={240} y={880} t={t} at={c1 + 5.0} out={c2 - 0.4} font="mono" size={72} color={COL.bone}>{`L5 is delayed ${RATIO.toFixed(2)}× more than L1`}</Txt>
      <Txt x={240} y={1010} t={t} at={c1 + 7.0} out={c2 - 0.4} font="sans" size={64} color={COL.ash} maxW={1160}>measure the gap, work out the delay, subtract it</Txt>

      <Txt x={240} y={290} t={t} at={c2 + 0.3} font="display" size={108} color={COL.bone} lh={1}>ONCE, ON PURPOSE</Txt>
      <Txt x={240} y={470} t={t} at={tHund - 0.3} font="mono" size={130} color={COL.red} lh={1}>~ 100 m</Txt>
      <Txt x={240} y={640} t={t} at={tBlur - 0.2} font="sans" size={64} color={COL.ash} maxW={1160}>civilian GPS, blurred by the US military</Txt>
      <Txt x={240} y={760} t={t} at={tBlur + 0.6} font="sans" size={64} color={COL.ash} maxW={1160}>in the name of security</Txt>
      <Txt x={240} y={1000} t={t} at={tUntil - 0.1} font="mono" size={130} color={COL.bone} lh={1}>2 MAY 2000</Txt>
      <Txt x={240} y={1170} t={t} at={tOffP} font="sans" size={64} color={COL.ash} maxW={1160}>a presidential order switched it off</Txt>
      <Txt x={240} y={1380} t={t} at={tHappy} font="display" size={84} color={COL.cyan} maxW={1200} lh={1.1}>a government removed a feature. everyone was happy.</Txt>

      <Chapter n={6} name="HOW ACCURATE" t={t} dur={WIN.dur} />
    </>
  );
};

void lin;
