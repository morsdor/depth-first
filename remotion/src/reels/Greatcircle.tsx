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
  COAST,
  DEL,
  EXTRA_KM,
  GC,
  GC_KM,
  LON0,
  RHUMB,
  RHUMB_KM,
  SFO,
  STRETCH_AT_VERTEX,
  VERTEX_LAT,
} from './data/r006_geo';

/**
 * r006 · "Your flight path isn't curved. Your map is."  (backlog I17)
 *
 * ── What is on screen, and why it is that ───────────────────────────────────
 * A globe and a world map. Both are objects a stranger can name with the sound
 * off, which is the bar Gate 0 sets and the bar r005 could not clear: it opened
 * on two decks of cards and cut to a 13x13 matrix. Here the map IS the subject,
 * so the recognisable object never leaves the frame — non-negotiable 6, in its
 * widened form.
 *
 * The reel makes one claim and then charges the viewer for disbelieving it:
 * the arc over the Arctic is the straight line, and the line that looks
 * straight on the flat map costs 2,572 km.
 *
 * ── Why the projections are computed here and not in Python ─────────────────
 * Every coordinate comes from build_geo.py — real GSHHG coastlines, a real
 * slerp, a real constant-bearing track, distances cross-checked against pyproj.
 * What this file does is PROJECT them, twice, and blend. That has to happen per
 * frame because the reel morphs between the two projections; pre-projecting
 * would mean shipping 3,941 points once per morph step. The formulas below are
 * the textbook orthographic and Mercator, evaluated exactly — the shapes are
 * not eased approximations of a shape.
 *
 * ── The one thing that makes the globe beat work ────────────────────────────
 * A great circle projects to a straight line in an orthographic view only when
 * the view centre lies ON that great circle. So the globe is centred on a point
 * of the flight path and rolls ALONG it. Move the centre anywhere else and the
 * line quietly becomes an ellipse — which would make the reel's own headline
 * false on screen.
 */

export const DURATION_SECONDS = 32;

// Accent: DOMAIN_ACCENT.infrastructure #00D6F7 — backlog §2, maps and real
// geography. Written as a literal at every use site so Studio keeps the swatch
// click-editable (brand guide §11).

// ── the stage ───────────────────────────────────────────────────────────────
// Centred on SAFE_CX (465), not 540: wide elements have to clear Instagram's
// action rail, which starts at x = 870 below y = 1050.
const CX = 465;
const CY = 925;
const MAP_W = 810;
const LAT_N = 82;
const LAT_S = -58;
// 282, not 300: at 300 the globe's crown ran under the step label's second line.
const GLOBE_R = 282;

const D2R = Math.PI / 180;
const mercY = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (Math.max(-84, Math.min(84, lat)) * D2R) / 2));
const Y_N = mercY(LAT_N);
const Y_S = mercY(LAT_S);
/** Mercator is conformal, so the panel's aspect is fixed by the latitude crop. */
const MAP_H = (MAP_W * (Y_N - Y_S)) / (2 * Math.PI);

/** 2*pi*R / 360 for the IUGG mean radius. Used only for the scale bars. */
const KM_PER_DEG = 111.195;

type P = { x: number; y: number; a: number };

const projMerc = (lon: number, lat: number) => {
  const dl = ((((lon - LON0) % 360) + 540) % 360) - 180;
  return {
    x: CX + (dl / 360) * MAP_W,
    y: CY + ((Y_N - mercY(lat)) / (Y_N - Y_S) - 0.5) * MAP_H,
  };
};

/** Orthographic about (lat0, lon0). Far-side points are pinned to the limb so
 *  they collapse into the edge instead of folding back across the disc. */
const projOrtho = (lon: number, lat: number, lat0: number, lon0: number) => {
  const p = lat * D2R;
  const l = (lon - lon0) * D2R;
  const p0 = lat0 * D2R;
  const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  let x = Math.cos(p) * Math.sin(l);
  let y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
  if (cosc < 0) {
    const n = Math.hypot(x, y) || 1;
    x /= n;
    y /= n;
  }
  return { x: CX + x * GLOBE_R, y: CY - y * GLOBE_R, cosc };
};

const smooth = (v: number, a: number, b: number) => {
  const u = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

/**
 * The blend. `m` is 0 for the globe and 1 for the flat map.
 *
 * Alpha is what sells the unwrap: on the globe the far hemisphere is simply not
 * there, and as the map flattens the hidden half fades up. Without it the back
 * of the world smears along the limb.
 */
const blend = (lon: number, lat: number, m: number, lat0: number, lon0: number): P => {
  const o = projOrtho(lon, lat, lat0, lon0);
  const mc = projMerc(lon, lat);
  const front = smooth(o.cosc, -0.02, 0.14);
  return {
    x: o.x + (mc.x - o.x) * m,
    y: o.y + (mc.y - o.y) * m,
    a: Math.max(front, smooth(m, 0.4, 0.95)),
  };
};

/**
 * Turn a flat [lon, lat, ...] ring into SVG subpaths.
 *
 * Two things force a break. A pair whose Mercator x jumps more than half the
 * map has wrapped the seam — joining it would draw a stripe across the world.
 * A pair either side of the terminator is half-hidden, so runs of invisible
 * points are dropped rather than drawn at low alpha, which is what keeps the
 * globe from having a ghost of Africa smeared on its rim.
 */
const ringPaths = (
  ring: number[],
  m: number,
  lat0: number,
  lon0: number,
): { d: string; a: number }[] => {
  const out: { d: string; a: number }[] = [];
  let d = '';
  let sum = 0;
  let n = 0;
  let prevX: number | null = null;
  const flush = () => {
    if (n >= 2) out.push({ d, a: sum / n });
    d = '';
    sum = 0;
    n = 0;
  };
  for (let i = 0; i < ring.length; i += 2) {
    const lon = ring[i];
    const lat = ring[i + 1];
    const p = blend(lon, lat, m, lat0, lon0);
    const mx = projMerc(lon, lat).x;
    const wrapped = prevX !== null && Math.abs(mx - prevX) > MAP_W / 2;
    prevX = mx;
    if (p.a < 0.06 || wrapped) {
      flush();
      if (p.a < 0.06) continue;
    }
    d += `${d ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    sum += p.a;
    n += 1;
  }
  flush();
  return out;
};

/** A polyline that never wraps the seam — both flight tracks, by construction. */
const linePath = (flat: number[], upto: number, m: number, lat0: number, lon0: number) => {
  const n = Math.floor((flat.length / 2) * Math.max(0, Math.min(1, upto)));
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const p = blend(flat[i * 2], flat[i * 2 + 1], m, lat0, lon0);
    d += `${d ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d;
};

/** Point at fraction `u` along a stored track, blended into the current state. */
const markerAt = (flat: number[], u: number, m: number, lat0: number, lon0: number) => {
  const n = flat.length / 2;
  const i = Math.max(0, Math.min(n - 1, Math.round(u * (n - 1))));
  return blend(flat[i * 2], flat[i * 2 + 1], m, lat0, lon0);
};

/** The tail behind a marker. Long enough to be a moving mass, not a moving dot. */
const tailPath = (
  flat: number[],
  u: number,
  span: number,
  m: number,
  lat0: number,
  lon0: number,
) => {
  const n = flat.length / 2;
  const i = Math.max(0, Math.min(n - 1, Math.round(u * (n - 1))));
  const from = Math.max(0, i - span);
  let d = '';
  for (let k = from; k <= i; k += 1) {
    const p = blend(flat[k * 2], flat[k * 2 + 1], m, lat0, lon0);
    d += `${d ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d;
};

/** Graticule, generated rather than stored: it is the same grid in both states. */
const GRATICULE: number[][] = (() => {
  const g: number[][] = [];
  for (let lat = -60; lat <= 80; lat += 20) {
    const r: number[] = [];
    for (let lon = -180; lon <= 180; lon += 3) r.push(LON0 + lon, lat);
    g.push(r);
  }
  for (let k = 0; k < 12; k += 1) {
    const r: number[] = [];
    for (let lat = -80; lat <= 84; lat += 4) r.push(LON0 - 180 + k * 30, lat);
    g.push(r);
  }
  return g;
})();

export const Greatcircle: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();

  // The morph. Flat -> globe -> flat, so the reel opens on the map the viewer
  // already owns, earns the globe, and then pays the globe back out.
  const m = interpolate(
    frame,
    [t(2.8), t(5.4), t(12.0), t(15.2)],
    [1, 0, 0, 1],
    ease,
  );

  // The globe rolls along the flight path. Centring anywhere else would bend
  // the straight line — see the header comment.
  const nGc = GC.length / 2;
  const rollIdx =
    Math.round(nGc / 2) + Math.round(42 * Math.sin((2 * Math.PI * frame) / (30 * 13)));
  const lon0 = GC[rollIdx * 2];
  const lat0 = GC[rollIdx * 2 + 1];

  // Draw-on progress for the two tracks.
  // Front-loaded: half the arc is down by 0.9s, because the first two seconds
  // decide everything and a line that is 7% drawn at 0.5s is not "moving".
  const gcDraw = interpolate(frame, [t(0.15), t(0.9), t(2.4)], [0, 0.5, 1], ease);
  const rhDraw = interpolate(frame, [t(19.0), t(21.4)], [0, 1], ease);
  const rhAlpha = interpolate(frame, [t(19.0), t(20.0)], [0, 1], ease);

  /**
   * The aircraft, and then the race.
   *
   * Nothing here is decoration. The first cut of this reel measured 28% event
   * density and a 1.75s dead spell in the end beat — inside the range a viewer
   * called static on r005. The fix rule 4 prescribes is not more drift, it is
   * never pausing the thing the reel is about, so the thing the reel is about
   * moves continuously: a marker runs the route in every beat, and from the
   * moment the second line exists there are two of them.
   *
   * The race is also the argument, told as motion instead of as a number. Both
   * markers leave together and travel at the SAME GROUND SPEED, so when the
   * great-circle one has covered fraction u of its route, the constant-bearing
   * one has covered the same distance — which is only u * GC_KM / RHUMB_KM of
   * its own, longer road. It arrives 20.8% later because it flew 2,572 km more.
   */
  const RACE_FROM = 21.2;
  // 5.4s x exactly two laps fills the 10.8s from RACE_FROM to the last frame,
  // so the reel ENDS on the arrival: the great-circle marker is at San
  // Francisco and the constant-bearing one is still out over the Pacific. The
  // end frame is the most-watched dead space in the format, and this makes it
  // carry the argument instead of catching both markers bunched at Delhi.
  const LAP = 5.4;
  const racing = frame >= t(RACE_FROM);
  const u = racing
    ? (((frame / 30 - RACE_FROM) % LAP) / LAP)
    : ((frame / 30) % 6) / 6;
  const uSlow = (u * GC_KM) / RHUMB_KM;
  // Fade IN only. Fading out at the end of a lap would blank the arrival, which
  // is the one moment of the race worth watching.
  const lapFade = smooth(u, 0, 0.06);

  const plane = markerAt(GC, u, m, lat0, lon0);
  const trail = tailPath(GC, u, 48, m, lat0, lon0);
  const slow = markerAt(RHUMB, uSlow, m, lat0, lon0);
  const slowTrail = tailPath(RHUMB, uSlow, 30, m, lat0, lon0);

  const del = blend(DEL[0], DEL[1], m, lat0, lon0);
  const sfo = blend(SFO[0], SFO[1], m, lat0, lon0);

  // The two scale bars: identical true distances, drawn where the map puts them.
  const barKm = 2000;
  const barPx = (lat: number) =>
    ((barKm / (KM_PER_DEG * Math.cos(lat * D2R))) / 360) * MAP_W;
  // The bars leave before beat 03 arrives: their number and the arc's number
  // would otherwise sit on top of each other in the same corner.
  const barsOn = interpolate(
    frame,
    [t(15.4), t(16.2), t(18.2), t(18.8)],
    [0, 1, 1, 0],
    ease,
  );
  // The bars are measured out rather than switched on: a length that grows is
  // an event, and 2,000 km taking four times as long to draw at 75.5 N is the
  // beat's whole argument.
  const barGrow = interpolate(frame, [t(15.4), t(17.0)], [0, 1], ease);
  const eqY = projMerc(0, 0).y;
  const hiY = projMerc(0, VERTEX_LAT).y;

  const land = smooth(m, 0.82, 1);
  // Anchors for the two on-line labels, taken from the geometry rather than
  // eyeballed: the arc's own vertex, and the halfway point of the rhumb.
  const apex = projMerc(GC[Math.round(GC.length / 4) * 2], VERTEX_LAT);
  const apexX = apex.x;
  const apexY = apex.y;
  const midI = Math.floor(RHUMB.length / 4);
  const mid = projMerc(RHUMB[midI * 2], RHUMB[midI * 2 + 1]);
  const midX = mid.x;
  const midY = mid.y;

  const coastPaths = COAST.flatMap((r) => ringPaths(r, m, lat0, lon0));
  const gratPaths = GRATICULE.flatMap((r) => ringPaths(r, m, lat0, lon0));

  return (
    <AbsoluteFill style={{ backgroundColor: '#040E1F' }}>
      <ReelGround accent="#00D6F7" />

      <div style={{ position: 'absolute', inset: 0, transform: breath }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {/* The globe's body. Fades out as the world flattens. */}
          <circle
            cx={CX}
            cy={CY}
            r={GLOBE_R}
            fill="#0E213E"
            stroke="#274064"
            strokeWidth={3}
            opacity={1 - m}
          />

          {gratPaths.map((p, i) => (
            <path
              key={`g${i}`}
              d={p.d}
              fill="none"
              stroke="#274064"
              strokeWidth={2}
              opacity={p.a * 0.55}
            />
          ))}

          {/* Land is filled only once the world is nearly flat. Mid-morph the
              rings are cut at the terminator, and filling a cut ring paints a
              chord straight across the ocean. */}
          {land > 0.01 &&
            coastPaths.map((p, i) => (
              <path key={`f${i}`} d={p.d} fill="#0E213E" stroke="none" opacity={p.a * land} />
            ))}

          {coastPaths.map((p, i) => (
            <path
              key={`c${i}`}
              d={p.d}
              fill="none"
              stroke="#81A2C4"
              strokeWidth={2}
              opacity={p.a * 0.5}
            />
          ))}

          {/* The constant-bearing track — the line that only looks straight.
              Amber, and it is the single amber element in every frame it is in. */}
          <path
            d={linePath(RHUMB, rhDraw, m, lat0, lon0)}
            fill="none"
            stroke="#FFB020"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="14 22"
            strokeDashoffset={-frame * 5}
            opacity={rhAlpha}
          />

          {/* The shortest path. Glow first, so the line reads over coastline. */}
          <path
            d={linePath(GC, gcDraw, m, lat0, lon0)}
            fill="none"
            stroke="#00D6F7"
            strokeWidth={16}
            strokeLinecap="round"
            opacity={0.18}
          />
          <path
            d={linePath(GC, gcDraw, m, lat0, lon0)}
            fill="none"
            stroke="#00D6F7"
            strokeWidth={5}
            strokeLinecap="round"
          />
          {/* Dash flow. The whole route is in motion at every frame, which is
              what keeps a hold from reading as a frozen frame. */}
          <path
            d={linePath(GC, gcDraw, m, lat0, lon0)}
            fill="none"
            stroke="#E8E6E1"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="46 120"
            strokeDashoffset={-frame * 11}
            opacity={0.9}
          />

          <path
            d={slowTrail}
            fill="none"
            stroke="#FFB020"
            strokeWidth={7}
            strokeLinecap="round"
            opacity={racing ? lapFade : 0}
          />
          <circle
            cx={slow.x}
            cy={slow.y}
            r={13}
            fill="#FFB020"
            opacity={racing ? lapFade : 0}
          />

          <path
            d={trail}
            fill="none"
            stroke="#E8E6E1"
            strokeWidth={7}
            strokeLinecap="round"
            opacity={racing ? lapFade : 1}
          />
          <circle cx={plane.x} cy={plane.y} r={14} fill="#E8E6E1" opacity={racing ? lapFade : 1} />

          <circle cx={del.x} cy={del.y} r={11} fill="#00D6F7" opacity={del.a} />
          <circle cx={sfo.x} cy={sfo.y} r={11} fill="#00D6F7" opacity={sfo.a} />

          {/* Two bars, both exactly 2,000 km on the ground. */}
          <g opacity={barsOn * m}>
            <rect
              x={CX - MAP_W / 2 + 24}
              y={eqY - 4}
              width={barPx(0) * barGrow}
              height={8}
              fill="#E8E6E1"
            />
            <rect
              x={CX - MAP_W / 2 + 24}
              y={hiY - 4}
              width={barPx(VERTEX_LAT) * barGrow}
              height={8}
              fill="#E8E6E1"
            />
          </g>
        </svg>

        <div style={{ opacity: barsOn * m }}>
          <div
            style={{
              position: 'absolute',
              left: CX - MAP_W / 2 + 24,
              top: eqY + 14,
              fontFamily: 'IBM Plex Mono',
              fontSize: 36,
              color: '#E8E6E1',
            }}
          >
            {fmt(barKm)} km
          </div>
          <div
            style={{
              position: 'absolute',
              left: CX - MAP_W / 2 + 24,
              top: hiY + 14,
              fontFamily: 'IBM Plex Mono',
              fontSize: 36,
              color: '#E8E6E1',
            }}
          >
            {fmt(barKm)} km
          </div>
        </div>
      </div>

      <ReelHeader
        big={
          <>
            Your flight path
            <br />
            isn&apos;t curved.
          </>
        }
        small="The map is bent, not the flight"
        out={[2.1, 2.9]}
        in_={[3.1, 3.9]}
        bigSize={82}
      />

      <StepLabel
        n="01"
        title="Pull a thread tight"
        sub="On a ball, the shortest path is the taut line."
        from={t(6.6)}
        to={t(11.6)}
      />
      <StepLabel
        n="02"
        title="Flat maps stretch the top"
        sub={`Both bars are ${fmt(2000)} km. The top one is at ${VERTEX_LAT}° N.`}
        from={t(12.4)}
        to={t(18.2)}
      />
      <StepLabel
        n="03"
        title="The line that looks straight"
        sub="Same two airports. One constant compass bearing."
        from={t(18.8)}
        to={t(24.8)}
      />

      {/* SAFE_W, not the default 960: every value here is right-aligned, and the
          default width parks them under Instagram's action rail. */}
      <Readout
        from={t(7.4)}
        to={t(11.8)}
        width={SAFE_W}
        rows={[
          ['DEL → SFO', `${fmt(GC_KM)} km`],
          ['highest latitude reached', `${VERTEX_LAT}° N`],
        ]}
      />
      <Readout
        from={t(15.8)}
        to={t(18.4)}
        width={SAFE_W}
        rows={[['map scale at the top of the arc', `${STRETCH_AT_VERTEX.toFixed(2)}x`]]}
      />
      <Readout
        from={t(21.6)}
        to={t(25.0)}
        width={SAFE_W}
        rows={[
          ['looks straight', `${fmt(RHUMB_KM)} km`],
          ['is straight', `${fmt(GC_KM)} km`],
          ['cost of the illusion', `+${fmt(EXTRA_KM)} km`],
        ]}
      />

      {/* The race animates a claim about TIME, so the assumption it rests on is
          stated on screen rather than left to the viewer to supply. */}
      <Fade
        from={t(21.6)}
        to={t(25.2)}
        style={{ position: 'absolute', top: 1168, left: 60, width: SAFE_W }}
      >
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: '#81A2C4' }}>
          both leave together, same speed
        </div>
      </Fade>

      {/* The number sits on the line it measures, and stays there through the end
          card. The end frame is the most-watched dead space in the format, so it
          has to be readable by someone who arrived at second 30. */}
      <Fade from={t(21.6)} style={{ position: 'absolute', inset: 0 }}>
        <div
          style={{
            position: 'absolute',
            left: apexX - 96,
            top: apexY + 40,
            fontFamily: 'IBM Plex Mono',
            fontSize: 40,
            color: '#00D6F7',
          }}
        >
          {fmt(GC_KM)} km
        </div>
        <div
          style={{
            position: 'absolute',
            left: midX - 96,
            top: midY + 18,
            fontFamily: 'IBM Plex Mono',
            fontSize: 40,
            color: '#E8E6E1',
          }}
        >
          {fmt(RHUMB_KM)} km
        </div>
      </Fade>

      {/* The end beat holds the full 3s over the finished visual, and the ask is
          performable on the phone already in the viewer's hand (rule 9). */}
      <Fade from={t(25.6)} style={{ position: 'absolute', top: 1230, left: 60, width: SAFE_W }}>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
            fontSize: 56,
            color: '#E8E6E1',
            lineHeight: 1.15,
          }}
        >
          Open a flight tracker.
          <br />
          Those arcs aren&apos;t detours.
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 40,
            color: '#81A2C4',
            marginTop: 26,
          }}
        >
          Next — the cable on the seabed your messages actually take.
        </div>
      </Fade>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
