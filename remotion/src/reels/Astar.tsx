import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  Fade,
  Progress,
  ReelGround,
  ReelHeader,
  Readout,
  SAFE_W,
  StepLabel,
  ease,
  fmt,
  t,
  useBreath,
} from './lib/chrome';
import {
  ASTAR,
  ASTAR_N,
  CITY,
  DIJKSTRA,
  DIJKSTRA_N,
  FROM_NAME,
  MAP_H,
  MAP_W,
  MAP_X,
  MAP_Y,
  PATH,
  RATIO,
  ROUTE_KM,
  TO_NAME,
  WAYS,
} from './data/i15_geo';

/**
 * r008 · "One route across Paris. Two ways to find it."  (backlog I15)
 *
 * ── What is on screen ───────────────────────────────────────────────────────
 * A real street map of central Paris — 26,193 junctions from OpenStreetMap —
 * with two real searches replayed over it in the order they actually committed
 * to each junction. Dijkstra floods outward in every direction; A* adds one
 * term, the straight-line distance still to go, and collapses into a corridor
 * aimed at the goal. Both return the identical route, which is asserted in
 * emit_ts.py rather than hoped for.
 *
 * This is the reel CLAUDE.md's Gate 0 section describes as the ideal: a real
 * street map flooding with a pathfinding search, where you are amazed first and
 * understanding is the reward for staying. It is also the one concept in the
 * backlog where the spectacle IS the mechanism — nothing here is decoration.
 *
 * ── Why Paris ──────────────────────────────────────────────────────────────
 * Measured, not chosen. Four cities x twelve matched routes: Manhattan 3.5x
 * median, Delhi 4.4x, London 5.0x, Paris 6.5x. Manhattan was built first and
 * gave 3.6x on this pair, where A*'s "corridor" was nearly as wide as the
 * flood. The grid-weakens-the-heuristic theory was tested and failed — road ÷
 * straight-line is ~1.3 in all four — so no such claim appears on screen.
 *
 * ── What is NOT claimed ────────────────────────────────────────────────────
 * Google Maps does not run either of these at query time; production routing
 * pre-processes the network into shortcuts, which is backlog I16 and the last
 * beat here. And the 10.1x is THIS route: within Paris alone the ratio runs
 * 1.7x-10.1x depending on which way the goal lies, so the reel names its
 * endpoints on screen and never says "A* is ten times faster".
 *
 * ── Performance ────────────────────────────────────────────────────────────
 * 14,018 flood pixels and 6,554 streets are drawn as ONE <path> each, not as
 * elements. Remotion re-renders every frame; tens of thousands of DOM nodes per
 * frame is the difference between a render that finishes and one that does not.
 */

export const DURATION_SECONDS = 28;

// Accent: DOMAIN_ACCENT.infrastructure #00D6F7 — backlog §2, maps and real
// geography. The flood uses DOMAIN_ACCENT.languages #51A4FF so the two searches
// are separable at a glance. Both are literals at the use site so Studio keeps
// the swatches click-editable (brand guide §11).

// The data module pre-projected against this stage; a mismatch would silently
// draw the city in the wrong place, so fail loudly instead.
if (MAP_X !== 115 || MAP_Y !== 640 || MAP_W !== 700) {
  throw new Error(
    `i15_geo.ts was projected against a different stage (${MAP_X},${MAP_Y},${MAP_W}). ` +
      'Re-run projects/i15_astar/emit_ts.py after changing the stage.',
  );
}

/** Flat [x,y,...] -> one path of 2px dashes. One element, not N elements. */
const dots = (flat: number[], upto: number): string => {
  const n = Math.min(flat.length / 2, Math.floor(upto));
  let d = '';
  for (let i = 0; i < n; i += 1) d += `M${flat[i * 2]} ${flat[i * 2 + 1]}h1`;
  return d;
};

/** A window of the settle order, for the bright frontier band. */
const dotsRange = (flat: number[], from: number, to: number): string => {
  const n = flat.length / 2;
  let d = '';
  for (let i = Math.max(0, Math.floor(from)); i < Math.min(n, Math.floor(to)); i += 1) {
    d += `M${flat[i * 2]} ${flat[i * 2 + 1]}h1`;
  }
  return d;
};

/** A constant-length bright segment travelling a polyline. */
const segment = (flat: number[], head: number, span: number): string => {
  const n = flat.length / 2;
  const i = Math.round(head * (n - 1 + span)) - span;
  let d = '';
  for (let k = Math.max(0, i); k <= Math.min(n - 1, i + span); k += 1) {
    d += `${d ? 'L' : 'M'}${flat[k * 2]} ${flat[k * 2 + 1]}`;
  }
  return d;
};

const polyline = (flat: number[], upto = 1): string => {
  const n = Math.max(2, Math.floor((flat.length / 2) * Math.min(1, Math.max(0, upto))));
  let d = '';
  for (let i = 0; i < n; i += 1) {
    d += `${i ? 'L' : 'M'}${flat[i * 2]} ${flat[i * 2 + 1]}`;
  }
  return d;
};

/** Every street, as a single path. Built once at module load, never per frame. */
const STREETS: string = WAYS.map((w) => polyline(w)).join('');

const FROM: [number, number] = [PATH[0], PATH[1]];
const TO: [number, number] = [PATH[PATH.length - 2], PATH[PATH.length - 1]];

// ── the beats ───────────────────────────────────────────────────────────────
const FLOOD_FROM = 0.6;
const FLOOD_TO = 6.6;
const AIM_FROM = 9.2;
const AIM_TO = 13.2;
const ROUTE_FROM = 15.6;
const ROUTE_TO = 17.8;

export const Astar: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();

  // The streets arrive fast: the object has to be a city before anything else
  // happens, and the first surprising result has to land by ~3s.
  const cityIn = interpolate(frame, [t(0), t(0.7)], [0, 1], ease);

  // Both floods are replayed in SETTLE ORDER, which is the order the real run
  // committed to each junction — not a radial wipe that imitates one.
  const dijN = interpolate(
    frame,
    [t(FLOOD_FROM), t(FLOOD_TO)],
    [0, DIJKSTRA.length / 2],
    ease,
  );
  const astN = interpolate(frame, [t(AIM_FROM), t(AIM_TO)], [0, ASTAR.length / 2], ease);

  // Once A* starts, Dijkstra's flood drops to a wash. The comparison only reads
  // if both are on screen at once — that is the whole frame.
  const dijFade = interpolate(frame, [t(8.4), t(9.2)], [1, 0.42], ease);

  const routeU = interpolate(frame, [t(ROUTE_FROM), t(ROUTE_TO)], [0, 1], ease);

  // Per-beat measurement: the flood scored 91% event density and A*'s corridor
  // 20%, because 1,420 pixels appearing is a far smaller change than 14,018.
  // A bright frontier band — the junctions each search has just committed to —
  // gives the beat a moving MASS, which is what the audit measures. It is also
  // the truest thing to draw: that band IS the search's frontier.
  const frontier = 150;
  // A pulse runs the finished route from 18.2s so the last ten seconds are not
  // a still frame. It is the route being driven, not decoration.
  const pulseU = ((frame - t(ROUTE_TO)) / (2.4 * 30)) % 1;
  const pulsing = frame >= t(ROUTE_TO);

  return (
    <AbsoluteFill>
      <ReelGround accent="#00D6F7" />

      <AbsoluteFill style={{ transform: breath }}>
        <svg width={1080} height={1920} style={{ position: 'absolute' }}>
          {/* the window the graph was cut from. Faint, but it tells the viewer
              the flood stopped because the data stopped, not because the search
              chose to. */}
          <rect
            x={MAP_X}
            y={MAP_Y}
            width={MAP_W}
            height={MAP_H}
            fill="none"
            stroke="#0E213E"
            strokeWidth={2}
            opacity={cityIn}
          />

          {/* the city. One path for 6,554 streets. */}
          <path
            d={STREETS}
            fill="none"
            stroke="#274064"
            strokeWidth={2}
            opacity={cityIn}
          />

          {/* what Dijkstra looked at: everything, in every direction */}
          <path
            d={dots(DIJKSTRA, dijN)}
            fill="none"
            stroke="#51A4FF"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={dijFade}
          />
          {frame < t(8.4) && (
            <path
              d={dotsRange(DIJKSTRA, dijN - frontier, dijN)}
              fill="none"
              stroke="#E8E6E1"
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.85}
            />
          )}

          {/* what A* looked at: a corridor aimed at the goal */}
          {frame >= t(AIM_FROM) && (
            <>
              <path
                d={dots(ASTAR, astN)}
                fill="none"
                stroke="#00D6F7"
                strokeWidth={6}
                strokeLinecap="round"
              />
              {frame < t(AIM_TO) && (
                <path
                  d={dotsRange(ASTAR, astN - frontier, astN)}
                  fill="none"
                  stroke="#E8E6E1"
                  strokeWidth={9}
                  strokeLinecap="round"
                  opacity={0.9}
                />
              )}
            </>
          )}

          {/* the route both of them returned */}
          {frame >= t(ROUTE_FROM) && (
            <path
              d={polyline(PATH, routeU)}
              fill="none"
              stroke="#E8E6E1"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {pulsing && (
            <path
              d={segment(PATH, pulseU, 26)}
              fill="none"
              stroke="#00D6F7"
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          )}

          <circle cx={FROM[0]} cy={FROM[1]} r={13} fill="#E8E6E1" opacity={cityIn} />
          <circle cx={TO[0]} cy={TO[1]} r={13} fill="#FFB020" opacity={cityIn} />
        </svg>

        {/* Endpoint labels. Naming them is what keeps "10x" honest — it is 10x
            on THIS route, and within Paris the ratio runs 1.7x to 10.1x. */}
        <Fade from={t(0.9)} style={{ position: 'absolute', top: FROM[1] + 20, left: 0 }}>
          <div
            style={{
              position: 'absolute',
              left: FROM[0] + 22,
              width: 420,
              fontFamily: 'IBM Plex Sans',
              fontWeight: 600,
              fontSize: 36,
              color: '#E8E6E1',
            }}
          >
            {FROM_NAME}
          </div>
        </Fade>
        <Fade from={t(0.9)} style={{ position: 'absolute', top: TO[1] + 22, left: 0 }}>
          <div
            style={{
              position: 'absolute',
              left: TO[0] - 300,
              width: 288,
              textAlign: 'right',
              fontFamily: 'IBM Plex Sans',
              fontWeight: 600,
              fontSize: 36,
              color: '#FFB020',
            }}
          >
            {TO_NAME}
          </div>
        </Fade>
      </AbsoluteFill>

      <ReelHeader
        big={
          <>
            One route across Paris.
            <br />
            Two ways to find it.
          </>
        }
        small="Same answer. Ten times the work."
        out={[2.0, 2.8]}
        in_={[2.8, 3.6]}
        bigSize={62}
      />

      <StepLabel
        n="01"
        title="Check every direction"
        sub="Outward, until it stumbles on the answer."
        from={t(2.9)}
        to={t(8.4)}
      />
      <StepLabel
        n="02"
        title="Or aim at the goal"
        sub="Add one term: how far is left to go."
        from={t(9.0)}
        to={t(15.4)}
      />
      <StepLabel
        n="03"
        title="Your phone does neither"
        sub="It worked the shortcuts out months ago."
        from={t(18.4)}
        to={t(22.0)}
      />

      {/* SAFE_W, not the default 960: these are the payoff figures and the
          default width parks them under Instagram's action rail (the r006 bug). */}
      <Readout
        from={t(6.9)}
        to={t(8.6)}
        top={1290}
        width={SAFE_W}
        rows={[['junctions checked', fmt(DIJKSTRA_N)]]}
      />
      <Readout
        from={t(13.4)}
        to={t(18.2)}
        top={1256}
        width={SAFE_W}
        rows={[
          ['checked every direction', fmt(DIJKSTRA_N)],
          ['aimed at the goal', fmt(ASTAR_N)],
        ]}
      />

      <Fade
        from={t(15.9)}
        to={t(18.2)}
        style={{ position: 'absolute', top: 486, left: 60, width: SAFE_W }}
      >
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
            fontSize: 50,
            color: '#00D6F7',
          }}
        >
          {RATIO}× less of the city.
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 40,
            color: '#81A2C4',
            marginTop: 10,
          }}
        >
          The same {ROUTE_KM} km route, either way.
        </div>
      </Fade>

      {/* End card. Performable on the phone in the viewer's hand, in the shape
          that worked on r006 ("open a flight tracker") rather than the one that
          failed on r003 (scan an on-screen QR code while holding one phone). */}
      <Fade
        from={t(22.3)}
        style={{ position: 'absolute', top: 1300, left: 60, width: SAFE_W }}
      >
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
            fontSize: 46,
            color: '#E8E6E1',
            lineHeight: 1.2,
          }}
        >
          Ask your maps app for a route.
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 38,
            color: '#81A2C4',
            marginTop: 14,
          }}
        >
          It answers before you lift your thumb.
        </div>
      </Fade>

      {/* ODbL: a Produced Work may be distributed under any terms, but the
          credit is not optional. On screen for the whole reel. */}
      <div
        style={{
          position: 'absolute',
          top: 1440,
          left: 60,
          width: SAFE_W,
          fontFamily: 'IBM Plex Mono',
          fontSize: 36,
          color: '#274064',
        }}
      >
        {CITY} · © OpenStreetMap
      </div>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
