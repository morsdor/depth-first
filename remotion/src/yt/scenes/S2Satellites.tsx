import React from 'react';
import { COL, Chapter, Ground, H, Txt, W, fmtInt, phraseAt, ramp, rgba, sceneWindow, useT } from '../lib/kit';
import {
  GlobeBody, OrbitRing, SatIcon, YOU, elevationDeg, makeProj, satScreen, vec, SPIN_DEG_PER_S, type View,
} from '../lib/globe';
import { GPS } from '../data/gps';

const WIN = sceneWindow('satellites');
const PLANE_COL = [COL.cyan, COL.blue, COL.purple, COL.green, COL.ash, COL.bone];
const N = GPS.numbers;

/** 02 — the constellation: six planes, 55 degrees, 20,191 km, and what a satellite says. */
export const S2Satellites: React.FC = () => {
  const t = useT();
  const [c0, c1, c2, c3] = WIN.cue;
  const tSim = 300 + t * 500;
  const spin = -20 + SPIN_DEG_PER_S * tSim;
  const view: View = { lon: 30 + t * 2.2, lat: 22, R: 255, cx: 2560, cy: 1080 };
  const P = makeProj(view);
  const youV = vec(YOU.lon + spin, YOU.lat);
  const you = P(youV);
  const sats = GPS.sats31.map(([raan, u0], i) => ({ i, plane: Math.round(raan / 60), ...satScreen(view, raan, u0, tSim) }));
  const inView = sats.filter((s) => elevationDeg(s.p3, youV) >= 5);
  const tFour = phraseAt('satellites', 1, 'at least four');
  const linesOn = ramp(t, tFour - 0.2, tFour + 1.0);
  const tSix = phraseAt('satellites', 0, 'in six orbits');
  const tFifty = phraseAt('satellites', 0, 'about fifty times');

  // the plane highlighted by the narration (plane k lights up as it is drawn on)
  const drawOn = (k: number) => ramp(t, c0 + 0.2 + k * 0.55, c0 + 0.9 + k * 0.55);

  const Row: React.FC<{ y: number; at: number; out?: number; big: string; small: string; color?: string }> = ({ y, at, out, big, small, color = COL.bone }) => (
    <>
      <Txt x={240} y={y} t={t} at={at} out={out} font="mono" size={170} color={color} lh={1}>{big}</Txt>
      <Txt x={240} y={y + 190} t={t} at={at + 0.15} out={out} font="sans" size={64} color={COL.ash}>{small}</Txt>
    </>
  );

  return (
    <>
      <Ground t={t} cx={0.66} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <OrbitRing key={k} view={view} raan={k * 60} color={PLANE_COL[k]} width={4} alpha={0.22 + 0.7 * drawOn(k) * (0.6 + 0.4 * ramp(t, c1, c1 + 1))} />
        ))}
        <GlobeBody view={view} spin={spin} id="s2" />
        {sats.filter((s) => !s.hid).map((s) => (
          <SatIcon key={s.i} x={s.x} y={s.y} s={30} color={PLANE_COL[s.plane]} glow={false} />
        ))}
        {/* the satellites above your horizon, joined to you */}
        {inView.filter((s) => !s.hid).map((s) => (
          <line key={s.i} x1={s.x} y1={s.y} x2={you.x} y2={you.y} stroke={rgba(COL.cyan, 0.55 * linesOn)} strokeWidth={4} />
        ))}
        {you.z > 0 && <circle cx={you.x} cy={you.y} r={20} fill={COL.blue} stroke={COL.bone} strokeWidth={6} />}
      </svg>

      {/* the 55 degrees: an arc between the equator and one plane, drawn on the globe's side */}

      {/* zone B — specification cards */}
      <Row y={240} at={tSix - 0.3} out={c2 - 0.3} big="6" small="ORBITAL PLANES" color={COL.cyan} />
      <Row y={550} at={tSix + 1.2} out={c2 - 0.3} big="55°" small="TILT TO THE EQUATOR" />
      <Row y={860} at={tFifty - 0.4} out={c2 - 0.3} big={`${fmtInt(N.alt_km)} km`} small="ALTITUDE · about 50× the space station" />
      <Row y={1170} at={c1 + 0.2} out={c2 - 0.3} big="2×" small={`ORBITS A DAY · ${Math.floor(N.period_h)} h ${Math.round((N.period_h % 1) * 60)} min each`} color={COL.cyan} />

      {/* zone B2 — how many you can see, live */}
      <Txt x={240} y={1500} t={t} at={tFour - 0.3} out={c2 - 0.3} font="sans" size={64} color={COL.ash}>ABOVE YOUR HORIZON, RIGHT NOW</Txt>
      <Txt x={240} y={1570} t={t} at={tFour + 0.1} out={c2 - 0.3} font="mono" size={170} color={COL.bone} lh={1}>{`${inView.length} of 31`}</Txt>
      <Txt x={240} y={1790} t={t} at={tFour + 2.8} out={c2 - 0.3} font="mono" size={44} color={COL.ash}>{`24-satellite baseline: never fewer than ${N.visibility_24_walker_5deg.min}, anywhere (computed)`}</Txt>

      {/* zone C — what a satellite says */}
      <Txt x={240} y={300} t={t} at={c2 + 0.3} out={c3 - 0.3} font="display" size={130} color={COL.bone} lh={1}>EACH SATELLITE</Txt>
      <Txt x={240} y={440} t={t} at={c2 + 0.5} out={c3 - 0.3} font="display" size={130} color={COL.bone} lh={1}>BROADCASTS</Txt>
      {[
        { y: 720, at: phraseAt('satellites', 2, 'who I am') - 0.2, a: 'WHO I AM', b: 'SV 14 · PRN 14' },
        { y: 960, at: phraseAt('satellites', 2, 'where I am') - 0.2, a: 'WHERE I AM', b: 'orbit parameters' },
        { y: 1200, at: phraseAt('satellites', 2, 'and what time') - 0.2, a: 'WHAT TIME IT IS', b: '12:00:00.000000 GPST' },
      ].map((r) => (
        <React.Fragment key={r.a}>
          <Txt x={240} y={r.y} t={t} at={r.at} out={c3 - 0.3} font="mono" size={76} color={COL.cyan}>{r.a}</Txt>
          <Txt x={240} y={r.y + 96} t={t} at={r.at + 0.15} out={c3 - 0.3} font="mono" size={56} color={COL.ash}>{r.b}</Txt>
        </React.Fragment>
      ))}

      {/* zone D — receive-only */}
      <Txt x={240} y={330} t={t} at={c3 + 0.4} font="display" size={190} color={COL.bone} lh={0.95}>RECEIVE</Txt>
      <Txt x={240} y={520} t={t} at={c3 + 0.6} font="display" size={190} color={COL.bone} lh={0.95}>ONLY</Txt>
      <Txt x={240} y={820} t={t} at={c3 + 1.8} font="sans" size={72} color={COL.ash} maxW={1240}>nothing travels up from your phone: the satellites never know you exist</Txt>
      <Txt x={240} y={1220} t={t} at={phraseAt('satellites', 3, "It's the world") - 0.1} font="mono" size={96} color={COL.cyan}>the world's most successful</Txt>
      <Txt x={240} y={1340} t={t} at={phraseAt('satellites', 3, "It's the world") + 0.6} font="mono" size={96} color={COL.cyan}>one-way relationship</Txt>

      <Chapter n={2} name="THE SATELLITES" t={t} dur={WIN.dur} />
    </>
  );
};
