import React from 'react';
import { COL, Chapter, Ground, H, Txt, W, ramp, rgba, phraseAt, sceneWindow, useT } from '../lib/kit';

const WIN = sceneWindow('close');
const CARD = [COL.cyan, COL.blue, COL.amber];

const Card: React.FC<{ x: number; k: number; title: string; sub: string; at: number; t: number; dim: number; children: React.ReactNode }> = ({ x, k, title, sub, at, t, dim, children }) => {
  const on = ramp(t, at, at + 0.6) * dim;
  return (
    <g opacity={on} transform={`translate(${x} ${560 + (1 - ramp(t, at, at + 0.6)) * 40 + 10 * Math.sin(t * 1.3 + k * 2)})`}>
      <rect width={1040} height={900} rx={32} fill={rgba(COL.slate, 0.85)} stroke={rgba(CARD[k], 0.8)} strokeWidth={6} />
      <g transform="translate(520 330)">{children}</g>
      <text x={520} y={660} fontFamily="Archivo Black" fontSize={84} fill={COL.bone} textAnchor="middle">{title}</text>
      <text x={520} y={760} fontFamily="IBM Plex Sans" fontWeight={600} fontSize={56} fill={COL.ash} textAnchor="middle">{sub}</text>
    </g>
  );
};

/** 07 — the three ideas, what else runs on GPS time, and the sources. */
export const S7Close: React.FC = () => {
  const t = useT();
  const [, c1, c2] = WIN.cue;
  const a1 = phraseAt('close', 0, 'Distance from time');
  const a2 = phraseAt('close', 0, 'A fourth satellite');
  const a3 = phraseAt('close', 0, 'And Einstein');
  const cardsDim = 1 - ramp(t, c1 - 0.5, c1 + 0.1, 0, 1, true) * 1;
  const cardsBack = ramp(t, c2 - 0.2, c2 + 0.6);
  const dim = Math.max(cardsDim, cardsBack * 0.9);
  const infra = ramp(t, c1 + 0.3, c1 + 1.1) * (1 - ramp(t, c2 - 0.5, c2 + 0.1, 0, 1, true));
  const endAt = WIN.cueEnd[2] + 1.2;
  const credits = ramp(t, endAt, endAt + 1.2);
  const fade = 1 - credits;
  const pulse = (k: number) => 0.55 + 0.45 * Math.sin(t * 5 + k * 2);

  const sources = [
    'GPS.gov — Space Segment · GPS Accuracy · Selective Availability data',
    'N. Ashby, Relativity in the Global Positioning System, Living Reviews in Relativity 6 (2003)',
    'N. Ashby on the NTS-2 test, in Matters of Gravity (arXiv:gr-qc/9702010)',
    'GPS World — Inside the Box: GPS and Relativity',
    'Penn State GEOG 862 — The Satellite Clock · The Navigation Solution',
    'Pound & Rebka, Harvard, 1959–60 — the gravitational red shift in a 22.5 m tower',
    'Orbit, clock, solver and visibility figures: our own Python/NumPy simulations',
    'Coastlines: Natural Earth (public domain) · Narration: AI-generated voice (Kokoro-82M)',
  ];

  return (
    <>
      <Ground t={t} cx={0.5} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: fade }}>
        <Card x={240} k={0} title="DISTANCE FROM TIME" sub="delay × speed of light" at={a1} t={t} dim={dim}>
          <circle r={190} fill="none" stroke={COL.cyan} strokeWidth={8} opacity={0.35} />
          <circle r={120} fill="none" stroke={COL.cyan} strokeWidth={8} opacity={0.6} />
          <circle r={50} fill={COL.cyan} />
        </Card>
        <Card x={1400} k={1} title="A FOURTH SATELLITE" sub="fixes your clock" at={a2} t={t} dim={dim}>
          {[[-150, -140], [150, -140], [-150, 140], [150, 140]].map(([x, y], i) => (
            <g key={i}>
              <line x1={0} y1={0} x2={x} y2={y} stroke={COL.blue} strokeWidth={6} opacity={0.6} />
              <circle cx={x} cy={y} r={34} fill={i === 3 ? COL.bone : COL.blue} />
            </g>
          ))}
          <circle r={26} fill={COL.blue} stroke={COL.bone} strokeWidth={6} />
        </Card>
        <Card x={2560} k={2} title="EINSTEIN" sub="fixes theirs" at={a3} t={t} dim={dim}>
          <circle r={50} fill={COL.slate} stroke={COL.ash} strokeWidth={6} />
          <ellipse rx={190} ry={190} fill="none" stroke={COL.amber} strokeWidth={6} strokeDasharray="12 16" />
          <circle cx={190} cy={0} r={34} fill={COL.amber} />
          <text y={-230} fontFamily="IBM Plex Mono" fontWeight={600} fontSize={52} fill={COL.amber} textAnchor="middle">+38.6 µs/day</text>
        </Card>

        {/* what else runs on GPS time */}
        <g opacity={infra} transform="translate(0 0)">
          <circle cx={1920} cy={960} r={190 + 10 * Math.sin(t * 3)} fill={rgba(COL.cyan, 0.12)} stroke={COL.cyan} strokeWidth={8} />
          <text x={1920} y={980} fontFamily="Archivo Black" fontSize={58} fill={COL.bone} textAnchor="middle">GPS TIME</text>
          {[
            { x: 760, label: 'CELL NETWORKS' },
            { x: 1920, label: 'POWER GRIDS', y: 1500 },
            { x: 3080, label: 'FINANCIAL MARKETS' },
          ].map((n, i) => {
            const y = n.y ?? 960;
            return (
              <g key={i}>
                <line x1={1920} y1={960} x2={n.x} y2={y === 960 ? 960 : 1360} stroke={rgba(COL.cyan, 0.5)} strokeWidth={6} strokeDasharray="12 16" strokeDashoffset={-t * 90} />
                <circle cx={1920 + (n.x - 1920) * ((t * 0.35 + i * 0.3) % 1)} cy={960 + ((y === 960 ? 960 : 1360) - 960) * ((t * 0.35 + i * 0.3) % 1)} r={14} fill={COL.cyan} />
                <rect x={n.x - 320} y={y === 960 ? 860 : 1360} width={640} height={200} rx={28} fill={rgba(COL.slate, 0.9)} stroke={rgba(COL.ash, 0.5)} strokeWidth={4} />
                <text x={n.x} y={(y === 960 ? 860 : 1360) + 122} fontFamily="Archivo Black" fontSize={56} fill={COL.bone} textAnchor="middle">{n.label}</text>
              </g>
            );
          })}
        </g>
      </svg>

      <Txt x={W / 2} y={330} t={t} at={0.3} out={c1 - 0.6} font="display" size={150} color={COL.bone} align="center" lh={1}>THREE IDEAS</Txt>
      <Txt x={W / 2} y={330} t={t} at={c1 + 0.3} out={c2 - 0.6} font="display" size={150} color={COL.bone} align="center" lh={1}>NOT JUST MAPS</Txt>
      <Txt x={W / 2} y={330} t={t} at={c2 + 0.2} out={endAt - 0.1} font="display" size={150} color={COL.bone} align="center" lh={1}>TAKE ANY ONE AWAY</Txt>
      <Txt x={W / 2} y={1620} t={t} at={c2 + 3.0} out={endAt - 0.1} font="sans" size={84} color={COL.ash} align="center">and the system stops working</Txt>
      <Txt x={W / 2} y={1760} t={t} at={c1 + 5.0} out={c2 - 0.6} font="sans" size={64} color={COL.ash} align="center">many networks use GPS time as their reference</Txt>

      {/* sources */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: credits }}>
        <Txt x={W / 2} y={260} t={t} at={endAt} font="display" size={130} color={COL.bone} align="center">HOW GPS FINDS YOU</Txt>
        <Txt x={W / 2} y={430} t={t} at={endAt + 0.3} font="mono" size={56} color={COL.cyan} align="center">…AND WHY IT NEEDS EINSTEIN</Txt>
        {sources.map((s, i) => (
          <Txt key={i} x={W / 2} y={640 + i * 130} t={t} at={endAt + 0.8 + i * 0.35} font="sans" size={54} color={i < 6 ? COL.ash : COL.bone} align="center" weight={400}>{s}</Txt>
        ))}
      </div>

      <Chapter n={7} name="THE THREE IDEAS" t={t} dur={WIN.dur} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, opacity: pulse(0) * 0 }} />
    </>
  );
};
