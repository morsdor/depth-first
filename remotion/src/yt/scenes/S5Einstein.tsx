import React from 'react';
import { COL, Chapter, Ground, H, Txt, W, lin, phraseAt, ramp, rgba, sceneWindow, useT } from '../lib/kit';
import { GPS } from '../data/gps';

const WIN = sceneWindow('einstein');
const N = GPS.numbers;
const SR = N.sr_us_day;                                  // negative
const GR = N.gr_us_day;
const NET = N.net_us_day;
const GH_C2 = (9.80665 * 22.5) / (299792458 ** 2);       // gh/c² for the Harvard tower

const LX = 3080;                                         // ledger axis
const PXUS = 12.2;                                       // px per µs/day

const Clock: React.FC<{ cx: number; cy: number; r: number; deg: number; label: string; sat?: boolean; t: number; at: number }> = ({ cx, cy, r, deg, label, sat, t, at }) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill={rgba(COL.slate, 0.9)} stroke={sat ? COL.cyan : COL.ash} strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <line key={i} x1={cx + Math.sin(a) * r * 0.86} y1={cy - Math.cos(a) * r * 0.86} x2={cx + Math.sin(a) * r * 0.97} y2={cy - Math.cos(a) * r * 0.97} stroke={COL.ash} strokeWidth={i % 3 === 0 ? 10 : 5} />;
    })}
    <line x1={cx} y1={cy} x2={cx + Math.sin((deg * Math.PI) / 180) * r * 0.78} y2={cy - Math.cos((deg * Math.PI) / 180) * r * 0.78} stroke={COL.bone} strokeWidth={12} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={16} fill={COL.bone} />
    {sat && (
      <g transform={`translate(${cx} ${cy - r - 70})`}>
        <rect x={-70} y={-16} width={50} height={32} fill={COL.blue} />
        <rect x={20} y={-16} width={50} height={32} fill={COL.blue} />
        <rect x={-16} y={-16} width={32} height={32} fill={COL.bone} />
      </g>
    )}
    <Txt x={cx} y={cy + r + 40} t={t} at={at} font="mono" size={56} color={sat ? COL.cyan : COL.ash} align="center">{label}</Txt>
  </>
);

/** 05 — Einstein: two corrections pulling opposite ways, a test that settled it, and a number set before launch. */
export const S5Einstein: React.FC = () => {
  const t = useT();
  const c = WIN.cue;
  const g = (i: number) => {
    const a = ramp(t, c[i] - 0.15, c[i] + 0.5);
    const o = i < c.length - 1 ? 1 - ramp(t, c[i + 1] - 0.6, c[i + 1] - 0.1, 0, 1, true) : 1;
    return a * o;
  };
  const P = (i: number, f: string) => phraseAt('einstein', i, f);
  const tSR = P(1, 'so they lose');
  const tGR = P(2, 'so the satellite clocks');
  const tNet = P(4, 'the satellite clocks gain');
  const tLight = P(4, 'Except light');
  const tPred = P(6, 'Einstein predicted');
  const tPct = P(6, 'Less than one percent');
  const tFlip = P(6, 'Then they flipped');
  const OUT = (i: number) => (i < c.length - 1 ? c[i + 1] - 0.6 : undefined);

  // ledger bars grow as their sentence speaks
  const b1 = ramp(t, tSR, tSR + 1.2);
  const b2 = ramp(t, tGR, tGR + 1.4);
  const b3 = ramp(t, tNet + 0.6, tNet + 2.2);

  // the two clocks
  const hGround = (t * 24) % 360;
  const hSat = (t * 24 * (1 + 0.012)) % 360;

  // satellite on its orbit (s1)
  const ang = (t * 38) % 360;
  const ox = 1330;
  const oy = 1340;

  // the light ruler (s4)
  const rulerT = ramp(t, tLight, tLight + 3.4);
  const kmShown = N.net_km_day * rulerT;

  // NTS-2 switch (s5/s6)
  const flip = ramp(t, tFlip + 0.2, tFlip + 1.0);

  return (
    <>
      <Ground t={t} cx={0.4} />

      {/* ───────── ledger (persistent) ───────── */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <rect x={2480} y={250} width={1200} height={1010} rx={24} fill={rgba(COL.slate, 0.7)} stroke={rgba(COL.ash, 0.35)} strokeWidth={3} opacity={ramp(t, tSR - 1.4, tSR - 0.4)} />
        <line x1={LX} y1={300} x2={LX} y2={1200} stroke={COL.graphite} strokeWidth={4} opacity={ramp(t, tSR - 1.4, tSR - 0.4)} />
        <rect x={LX + SR * PXUS * b1} y={395} width={-SR * PXUS * b1} height={36} fill={COL.blue} />
        <rect x={LX} y={655} width={GR * PXUS * b2} height={36} fill={COL.cyan} />
        <rect x={LX} y={915} width={NET * PXUS * b3} height={36} fill={COL.amber} />
      </svg>
      <Txt x={2540} y={290} t={t} at={tSR - 1.2} font="sans" size={52} color={COL.ash}>SPECIAL RELATIVITY · speed</Txt>
      <Txt x={2540} y={440} t={t} at={tSR} font="mono" size={92} color={COL.bone}>{`−${Math.abs(SR).toFixed(2)} µs/day`}</Txt>
      <Txt x={2540} y={550} t={t} at={tGR - 1.2} font="sans" size={52} color={COL.ash}>GENERAL RELATIVITY · gravity</Txt>
      <Txt x={2540} y={700} t={t} at={tGR} font="mono" size={92} color={COL.bone}>{`+${GR.toFixed(2)} µs/day`}</Txt>
      <Txt x={2540} y={810} t={t} at={tNet - 0.3} font="sans" size={52} color={COL.ash}>NET · satellite clocks gain</Txt>
      <Txt x={2540} y={960} t={t} at={tNet + 0.6} font="mono" size={92} color={COL.amber}>{`+${NET.toFixed(2)} µs/day`}</Txt>
      <Txt x={2540} y={1090} t={t} at={tNet + 3.0} font="mono" size={52} color={COL.ash}>{`= ${(NET / 24).toFixed(2)} µs every hour`}</Txt>

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* s0 — two clocks that cannot agree */}
        <g opacity={g(0)}>
          <Clock cx={840} cy={1200} r={360} deg={hGround} label="GROUND" t={t} at={c[0] + 1.2} />
          <Clock cx={1840} cy={1200} r={360} deg={hSat} label="SATELLITE" sat t={t} at={c[0] + 1.6} />
          <text x={1340} y={1230} fontFamily="IBM Plex Mono" fontWeight={600} fontSize={140} fill={COL.amber} textAnchor="middle">≠</text>
        </g>

        {/* s1 — a moving clock runs slow */}
        <g opacity={g(1)}>
          <circle cx={ox} cy={oy} r={190} fill={rgba(COL.slate, 0.95)} stroke={COL.ash} strokeWidth={5} />
          <ellipse cx={ox} cy={oy} rx={660} ry={660} fill="none" stroke={rgba(COL.cyan, 0.5)} strokeWidth={4} strokeDasharray="14 16" />
          {(() => {
            const a = (ang * Math.PI) / 180;
            const px = ox + 660 * Math.cos(a);
            const py = oy - 660 * Math.sin(a);
            const tx = Math.sin(a);
            const ty = Math.cos(a);
            return (
              <g>
                <line x1={px} y1={py} x2={px + tx * 220} y2={py + ty * 220} stroke={COL.bone} strokeWidth={9} />
                <polygon points={`${px + tx * 250},${py + ty * 250} ${px + tx * 200 - ty * 28},${py + ty * 200 + tx * 28} ${px + tx * 200 + ty * 28},${py + ty * 200 - tx * 28}`} fill={COL.bone} />
                <rect x={px - 26} y={py - 16} width={52} height={32} fill={COL.bone} stroke={COL.ink} strokeWidth={3} />
                <rect x={px - 74} y={py - 12} width={44} height={24} fill={COL.blue} />
                <rect x={px + 30} y={py - 12} width={44} height={24} fill={COL.blue} />
              </g>
            );
          })()}
        </g>

        {/* s2 — gravity: a well */}
        <g opacity={g(2)}>
          {(() => {
            const wx = 1350;
            const pts = Array.from({ length: 61 }, (_, i) => {
              const x = -900 + i * 30;
              return `${i ? 'L' : 'M'}${wx + x} ${760 + 560 / (1 + (x / 330) ** 2)}`;
            });
            return (
              <g>
                <path d={pts.join('')} fill="none" stroke={rgba(COL.ash, 0.8)} strokeWidth={7} />
                <circle cx={wx} cy={1330} r={110} fill={rgba(COL.slate, 0.95)} stroke={COL.ash} strokeWidth={5} />
                <circle cx={wx} cy={1210} r={26} fill={COL.blue} stroke={COL.bone} strokeWidth={6} />
                <g transform={`translate(${wx - 640} ${830})`}>
                  <rect x={-70} y={-16} width={50} height={32} fill={COL.blue} />
                  <rect x={20} y={-16} width={50} height={32} fill={COL.blue} />
                  <rect x={-16} y={-16} width={32} height={32} fill={COL.bone} />
                </g>
                <line x1={wx - 640} y1={870} x2={wx - 640} y2={1130} stroke={rgba(COL.cyan, 0.7)} strokeWidth={5} strokeDasharray="10 14" strokeDashoffset={-t * 60} />
                {[0, 1, 2].map((k) => {
                  const ph = (t * 0.22 + k / 3) % 1;
                  return <ellipse key={k} cx={wx} cy={1330} rx={110 + ph * 700} ry={36 + ph * 230} fill="none" stroke={rgba(COL.cyan, 0.4 * (1 - ph))} strokeWidth={5} />;
                })}
                <Clock cx={wx + 560} cy={1380} r={110} deg={(t * 18) % 360} label="slower" t={t} at={c[2] + 3.0} />
                <Clock cx={wx - 960} cy={1000} r={110} deg={(t * 18 * 1.6) % 360} label="faster (exaggerated)" sat t={t} at={c[2] + 3.4} />
              </g>
            );
          })()}
        </g>

        {/* s3 — the Harvard tower */}
        <g opacity={g(3)}>
          <rect x={1250} y={560} width={170} height={760} fill={rgba(COL.slate, 0.95)} stroke={COL.ash} strokeWidth={6} />
          {[0, 1].map((k) => (
            <g key={k}>
              <circle cx={1335} cy={k === 0 ? 640 : 1240} r={52} fill={COL.ink} stroke={k === 0 ? COL.cyan : COL.ash} strokeWidth={8} />
              <line x1={1335} y1={k === 0 ? 640 : 1240} x2={1335} y2={k === 0 ? 600 : 1200} stroke={COL.bone} strokeWidth={7} />
            </g>
          ))}
          {[0, 1, 2, 3].map((k) => {
            const ph = (t * 0.45 + k * 0.25) % 1;
            return <circle key={k} cx={1335 + 14 * Math.sin(ph * 18)} cy={1240 - ph * 600} r={14} fill={rgba(COL.cyan, 0.9 * (1 - 0.5 * ph))} />;
          })}
          <line x1={1150} y1={640} x2={1150} y2={1240} stroke={COL.amber} strokeWidth={6} />
          <line x1={1130} y1={640} x2={1170} y2={640} stroke={COL.amber} strokeWidth={6} />
          <line x1={1130} y1={1240} x2={1170} y2={1240} stroke={COL.amber} strokeWidth={6} />
        </g>

        {/* s4 — the light ruler */}
        <g opacity={g(4)}>
          <line x1={240} y1={1250} x2={2240} y2={1250} stroke={COL.graphite} strokeWidth={8} />
          <line x1={240} y1={1250} x2={240 + 2000 * rulerT} y2={1250} stroke={COL.cyan} strokeWidth={14} strokeLinecap="round" />
          {rulerT >= 1 && <circle cx={240 + 2000 * ((t * 0.28) % 1)} cy={1250} r={22} fill={COL.bone} />}
          {Array.from({ length: 25 }, (_, i) => (
            <line key={i} x1={240 + (2000 * i) / 24} y1={1220} x2={240 + (2000 * i) / 24} y2={1280} stroke={i % 6 === 0 ? COL.ash : COL.graphite} strokeWidth={i % 6 === 0 ? 6 : 3} />
          ))}
        </g>

        {/* s5 — NTS-2: twenty days, switch off */}
        <g opacity={g(5)}>
          <g transform={`translate(1250 640) scale(3.4) rotate(${Math.sin(t * 0.6) * 4})`}>
            <rect x={-70} y={-16} width={50} height={32} fill={COL.blue} stroke={COL.ink} strokeWidth={2} />
            <rect x={20} y={-16} width={50} height={32} fill={COL.blue} stroke={COL.ink} strokeWidth={2} />
            <rect x={-16} y={-16} width={32} height={32} fill={COL.bone} stroke={COL.ink} strokeWidth={2} />
          </g>
          <line x1={300} y1={1180} x2={2200} y2={1180} stroke={COL.graphite} strokeWidth={8} />
          <circle cx={300} cy={1180} r={24} fill={COL.bone} />
          <circle cx={300 + 1600 * lin(t, c[5] + 1.0, c[5] + 9.0)} cy={1180} r={24} fill={COL.cyan} />
          <line x1={300} y1={1100} x2={2200 * 0 + 1900} y2={1100} stroke={COL.cyan} strokeWidth={8} strokeDasharray={`${1600 * lin(t, c[5] + 1.0, c[5] + 6.5)} 3000`} />
          <rect x={300} y={1000} width={1600} height={200} fill="none" />
          <rect x={300} y={1400} width={300} height={130} rx={65} fill={rgba(COL.slate, 0.9)} stroke={COL.ash} strokeWidth={6} />
          <circle cx={370} cy={1465} r={46} fill={COL.ash} />
        </g>

        {/* s6 — measured vs predicted */}
        <g opacity={g(6)}>
          {[{ y: 760, v: 442.5, col: COL.cyan }, { y: 960, v: 446.5, col: COL.bone }].map((r, i) => (
            <rect key={i} x={240} y={r.y} width={1900 * (r.v / 446.5) * ramp(t, (i === 0 ? c[6] + 1.0 : tPred - 0.1), (i === 0 ? c[6] + 2.6 : tPred + 1.4))} height={90} fill={r.col} />
          ))}
          <line x1={240 + 1900 * (N.frac_ppt / 446.5)} y1={720} x2={240 + 1900 * (N.frac_ppt / 446.5)} y2={1120} stroke={COL.amber} strokeWidth={6} opacity={ramp(t, tPct, tPct + 0.6)} />
          <rect x={300} y={1400} width={300} height={130} rx={65} fill={flip > 0.5 ? rgba(COL.cyan, 0.25) : rgba(COL.slate, 0.9)} stroke={flip > 0.5 ? COL.cyan : COL.ash} strokeWidth={6} />
          <circle cx={370 + 160 * flip} cy={1465} r={46} fill={flip > 0.5 ? COL.cyan : COL.ash} />
        </g>
      </svg>

      {/* ───────── stage copy ───────── */}
      <Txt x={240} y={290} t={t} at={c[0] + 0.2} out={OUT(0)} font="display" size={150} color={COL.bone} lh={1}>THEY CAN'T</Txt>
      <Txt x={240} y={440} t={t} at={c[0] + 0.5} out={OUT(0)} font="display" size={150} color={COL.bone} lh={1}>AGREE</Txt>

      <Txt x={240} y={290} t={t} at={c[1] + 0.2} out={OUT(1)} font="display" size={130} color={COL.bone} lh={1}>MOVING CLOCKS</Txt>
      <Txt x={240} y={430} t={t} at={c[1] + 0.4} out={OUT(1)} font="display" size={130} color={COL.blue} lh={1}>RUN SLOW</Txt>
      <Txt x={240} y={640} t={t} at={c[1] + 1.6} out={OUT(1)} font="mono" size={64} color={COL.ash}>{`v = ${N.v_kms.toFixed(3)} km/s`}</Txt>
      <Txt x={240} y={740} t={t} at={c[1] + 2.2} out={OUT(1)} font="mono" size={96} color={COL.cyan}>− v² / 2c²</Txt>

      <Txt x={240} y={290} t={t} at={c[2] + 0.2} out={OUT(2)} font="display" size={130} color={COL.bone} lh={1}>DEEPER IN GRAVITY</Txt>
      <Txt x={240} y={430} t={t} at={c[2] + 0.4} out={OUT(2)} font="display" size={130} color={COL.cyan} lh={1}>RUNS SLOWER</Txt>
      <Txt x={240} y={560} t={t} at={c[2] + 2.0} out={OUT(2)} font="mono" size={96} color={COL.cyan}>+ ΔΦ / c²</Txt>
      <Txt x={240} y={690} t={t} at={c[2] + 3.0} out={OUT(2)} font="sans" size={60} color={COL.ash}>satellite: weaker gravity, so faster</Txt>
      <Txt x={240} y={800} t={t} at={P(2, 'A time glow-up')} out={OUT(2)} font="display" size={84} color={COL.cyan}>a time glow-up</Txt>

      <Txt x={240} y={290} t={t} at={c[3] + 0.2} out={OUT(3)} font="display" size={130} color={COL.bone} lh={1}>NOT JUST THEORY</Txt>
      <Txt x={1480} y={690} t={t} at={c[3] + 1.4} out={OUT(3)} font="mono" size={64} color={COL.ash}>top clock</Txt>
      <Txt x={1480} y={1230} t={t} at={c[3] + 1.8} out={OUT(3)} font="mono" size={64} color={COL.ash}>bottom clock</Txt>
      <Txt x={780} y={900} t={t} at={c[3] + 2.4} out={OUT(3)} font="mono" size={64} color={COL.amber}>22.5 m</Txt>
      <Txt x={240} y={450} t={t} at={c[3] + 0.6} out={OUT(3)} font="mono" size={64} color={COL.cyan}>HARVARD · 1959</Txt>
      <Txt x={240} y={600} t={t} at={P(3, 'You could climb it')} out={OUT(3)} font="display" size={84} color={COL.bone}>you could climb it</Txt>
      <Txt x={1480} y={940} t={t} at={c[3] + 3.6} out={OUT(3)} font="mono" size={60} color={COL.bone}>{`predicted: ${(GH_C2 * 1e15).toFixed(2)} × 10⁻¹⁵`}</Txt>

      <Txt x={240} y={290} t={t} at={c[4] + 0.2} out={OUT(4)} font="display" size={130} color={COL.bone} lh={1}>NET GAIN</Txt>
      <Txt x={240} y={430} t={t} at={c[4] + 0.4} out={OUT(4)} font="display" size={130} color={COL.amber} lh={1}>EVERY DAY</Txt>
      <Txt x={240} y={660} t={t} at={tLight - 0.2} out={OUT(4)} font="mono" size={64} color={COL.ash}>{`light travels in that time:`}</Txt>
      <Txt x={240} y={1020} t={t} at={tLight} out={OUT(4)} font="mono" size={190} color={COL.bone} lh={1}>{`${kmShown.toFixed(2)} km`}</Txt>
      <Txt x={240} y={1360} t={t} at={tLight + 1.0} out={OUT(4)} font="mono" size={48} color={COL.ash}>each tick = 1 hour</Txt>

      <Txt x={240} y={290} t={t} at={c[5] + 0.2} out={OUT(5)} font="display" size={130} color={COL.bone} lh={1}>NTS-2 · JUNE 1977</Txt>
      <Txt x={300} y={1210} t={t} at={c[5] + 0.8} out={OUT(5)} font="mono" size={56} color={COL.ash}>launch</Txt>
      <Txt x={780} y={960} t={t} at={c[5] + 3.2} out={OUT(5)} font="mono" size={72} color={COL.cyan}>≈ 20 days, running free</Txt>
      <Txt x={660} y={1420} t={t} at={c[5] + 1.0} out={OUT(5)} font="mono" size={64} color={COL.ash}>correction: OFF</Txt>
      <Txt x={1700} y={1450} t={t} at={P(5, 'No pressure')} out={OUT(5)} font="display" size={84} color={COL.ash}>no pressure</Txt>
      <Txt x={1700} y={1250} t={t} at={c[5] + 1.0} out={OUT(5)} font="mono" size={120} color={COL.cyan}>{`day ${Math.round(20 * lin(t, c[5] + 1.0, c[5] + 9.0))}`}</Txt>

      <Txt x={240} y={290} t={t} at={c[6] + 0.2} out={OUT(6)} font="display" size={130} color={COL.bone} lh={1}>MEASURED VS PREDICTED</Txt>
      <Txt x={240} y={670} t={t} at={c[6] + 1.2} out={OUT(6)} font="mono" size={56} color={COL.cyan}>MEASURED   +442.5 parts per trillion</Txt>
      <Txt x={240} y={870} t={t} at={tPred - 0.1} out={OUT(6)} font="mono" size={56} color={COL.bone}>PREDICTED  +446.5</Txt>
      <Txt x={240} y={1170} t={t} at={tPct} out={OUT(6)} font="mono" size={56} color={COL.amber}>{`our calculation  +${N.frac_ppt.toFixed(1)}`}</Txt>
      <Txt x={660} y={1420} t={t} at={tFlip} out={OUT(6)} font="mono" size={64} color={flip > 0.5 ? COL.cyan : COL.ash}>{flip > 0.5 ? 'correction: ON' : 'correction: OFF'}</Txt>

      {/* s7 — the number set before launch */}
      <Txt x={240} y={290} t={t} at={c[7] + 0.2} font="display" size={130} color={COL.bone} lh={1}>SET BEFORE LAUNCH</Txt>
      <Txt x={240} y={620} t={t} at={c[7] + 0.4} font="mono" size={56} color={COL.ash}>WHAT THE CLOCK IS BUILT TO TICK AT</Txt>
      <Txt x={240} y={700} t={t} at={c[7] + 0.6} font="mono" size={150} color={COL.ash} lh={1}>10.23000000000 MHz</Txt>
      <Txt x={240} y={960} t={t} at={c[7] + 2.0} font="mono" size={56} color={COL.ash}>WHAT IT IS SET TO ON THE GROUND</Txt>
      <Txt x={240} y={1040} t={t} at={c[7] + 2.2} font="mono" size={150} color={COL.ash} lh={1}>
        {'10.22'}
        <span style={{ color: COL.cyan }}>
          {N.set_mhz_str.slice(5, 5 + Math.floor(lin(t, c[7] + 2.4, c[7] + 5.6) * 9.999)) + '\u00A0'.repeat(9 - Math.floor(lin(t, c[7] + 2.4, c[7] + 5.6) * 9.999))}
        </span>
        {' MHz'}
      </Txt>
      <Txt x={240} y={1300} t={t} at={c[7] + 6.2} font="mono" size={96} color={COL.bone}>{`− ${(N.frac_ppt / 1e12 * 1e10).toFixed(3)} × 10⁻¹⁰`}</Txt>
      <Txt x={240} y={1430} t={t} at={P(7, 'Wrong on the ground')} font="sans" size={64} color={COL.ash}>so that in orbit it ticks exactly 10.23 MHz</Txt>
      <Txt x={240} y={1620} t={t} at={c[7] + 9.2} font="mono" size={64} color={COL.amber}>the offset we computed matches the published setting</Txt>

      <Txt x={240} y={1760} t={t} at={P(7, 'Relatable')} font="display" size={100} color={COL.cyan}>relatable.</Txt>

      <Chapter n={5} name="EINSTEIN" t={t} dur={WIN.dur} />
    </>
  );
};
