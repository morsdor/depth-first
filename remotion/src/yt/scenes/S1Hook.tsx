import React from 'react';
import { COL, Chapter, FONT, Ground, H, Txt, W, fmtInt, lin, ramp, rgba, sceneWindow, useT } from '../lib/kit';
import {
  GlobeBody, OrbitRing, SatIcon, YOU, elevationDeg, makeProj, satScreen, vec, SPIN_DEG_PER_S, type View,
} from '../lib/globe';
import { GPS } from '../data/gps';

const WIN = sceneWindow('hook');

/** 01 — the hook. A real constellation over real coastlines, the blue dot, the claim. */
export const S1Hook: React.FC = () => {
  const t = useT();
  const [c0, c1, c2] = WIN.cue;
  const tSim = t * 600;                                   // 600x: an orbit in 72 s, a day in 144 s
  const spin = -57.9 + SPIN_DEG_PER_S * tSim;
  const R = lin(t, 0, WIN.dur, 285, 330);
  const view: View = { lon: 40, lat: 24, R, cx: 2500, cy: 1100 };
  const P = makeProj(view);

  const you = P(vec(YOU.lon + spin, YOU.lat));
  const youV = vec(YOU.lon + spin, YOU.lat);

  const sats = GPS.sats31.map(([raan, u0], i) => ({ i, ...satScreen(view, raan, u0, tSim) }));
  const inView = sats.filter((s) => elevationDeg(s.p3, youV) >= 5);
  const sigOn = ramp(t, c1 - 0.6, c1 + 0.4);

  return (
    <>
      <Ground t={t} cx={0.66} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {GPS.sats31.length > 0 && [0, 60, 120, 180, 240, 300].map((r) => (
          <OrbitRing key={r} view={view} raan={r} color={COL.cyan} width={3} alpha={0.34} />
        ))}
        <GlobeBody view={view} spin={spin} id="s1" />
        {sats.filter((s) => !s.hid).map((s) => (
          <SatIcon key={s.i} x={s.x} y={s.y} s={30} />
        ))}
        {/* the signals: dotted lines, a pulse running down each */}
        {inView.map((s, k) => {
          const f = (t * 0.7 + k * 0.173) % 1;
          const sx = s.x;
          const sy = s.y;
          return (
            <g key={s.i} opacity={sigOn}>
              <line x1={sx} y1={sy} x2={you.x} y2={you.y} stroke={rgba(COL.cyan, 0.5)} strokeWidth={3} strokeDasharray="10 14" />
              <circle cx={sx + (you.x - sx) * f} cy={sy + (you.y - sy) * f} r={9} fill={COL.cyan} />
            </g>
          );
        })}
        {/* the blue dot */}
        {you.z > 0 && (
          <g>
            {[0, 1].map((k) => {
              const p = ((t * 0.8 + k * 0.5) % 1);
              return <circle key={k} cx={you.x} cy={you.y} r={14 + p * 90} fill="none" stroke={rgba(COL.blue, 1 - p)} strokeWidth={5} />;
            })}
            <circle cx={you.x} cy={you.y} r={22} fill={COL.blue} stroke={COL.bone} strokeWidth={6} />
          </g>
        )}
      </svg>

      {you.z > 0 && (
        <Txt x={you.x + 50} y={you.y - 110} t={t} at={c1 - 0.2} font="mono" size={56} color={COL.bone}>YOU</Txt>
      )}

      {/* zone A — the title */}
      <Txt x={240} y={300} t={t} at={0.5} font="display" size={210} color={COL.bone} lh={0.95}>HOW GPS</Txt>
      <Txt x={240} y={510} t={t} at={0.8} font="display" size={210} color={COL.bone} lh={0.95}>FINDS YOU</Txt>
      <Txt x={240} y={790} t={t} at={1.3} font="sans" size={84} color={COL.ash}>{'…and why it needs '}<span style={{ color: COL.amber, fontFamily: FONT.display, fontWeight: 400 }}>EINSTEIN</span></Txt>

      {/* zone B — swaps with the sentence */}
      <Txt x={240} y={1130} t={t} at={c0 + 0.4} out={c1 - 0.2} font="mono" size={300} color={COL.bone} lh={1}>
        {`${Math.round(ramp(t, c0 + 0.4, c0 + 1.8) * 31)}`}
      </Txt>
      <Txt x={240} y={1450} t={t} at={c0 + 0.6} out={c1 - 0.2} font="sans" size={84} color={COL.ash}>SATELLITES</Txt>
      <Txt x={240} y={1590} t={t} at={c0 + 1.6} out={c1 - 0.2} font="mono" size={110} color={COL.cyan}>
        {`${fmtInt(GPS.numbers.alt_km)} km up`}
      </Txt>

      <Txt x={240} y={1130} t={t} at={c1 + 0.3} out={c2 - 0.2} font="mono" size={72} color={COL.ash}>
        {`${GPS.fix.lat.toFixed(3)}° N   ${GPS.fix.lon.toFixed(3)}° E`}
      </Txt>
      <Txt x={240} y={1260} t={t} at={c1 + 1.2} out={c2 - 0.2} font="mono" size={260} color={COL.bone} lh={1}>± 5 m</Txt>
      <Txt x={240} y={1560} t={t} at={c1 + 1.6} out={c2 - 0.2} font="sans" size={72} color={COL.ash}>from timestamps alone</Txt>

      <Txt x={240} y={1130} t={t} at={c2 + 0.5} font="sans" size={72} color={COL.ash}>the one thing that has to be right</Txt>
      <Txt x={240} y={1260} t={t} at={c2 + 1.5} font="mono" size={130} color={COL.cyan}>Δf/f = ΔΦ/c² − v²/2c²</Txt>
      <Txt x={240} y={1440} t={t} at={c2 + 2.2} font="sans" size={60} color={COL.ash}>how fast a clock ticks: gravity, minus speed</Txt>

      <Chapter n={1} name="THE CLAIM" t={t} dur={WIN.dur} />
    </>
  );
};
