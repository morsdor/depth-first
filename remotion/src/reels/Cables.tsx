import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
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
} from "./lib/chrome";
import {
  BILBAO,
  CABLE_KM,
  CABLE_MS,
  COAST,
  GEO_ALT_KM,
  LAT_N,
  LAT_S,
  LEG_LAND,
  LEG_SEA_1,
  LEG_SEA_2,
  LON_W0,
  LON_W1,
  MARSEILLE,
  MUMBAI,
  RATIO,
  SAT_KM,
  SAT_MS,
  VIRGINIA,
  V_FIBRE,
  V_RADIO,
} from "./data/r006_geo";

/**
 * r006 · "Your message to a friend abroad goes underwater."  (backlog I22)
 *
 * ── What is on screen, and why it is that ───────────────────────────────────
 * A world map, two cities, and one line between them. The map is the subject and
 * it never leaves the frame — non-negotiable 6 in its widened form, the rule I51
 * broke and r005 was the first to keep.
 *
 * The reel corrects a belief rather than explaining a mechanism, which is the
 * r005 pattern under test (brand guide §13). The belief: a message to another
 * continent goes up to a satellite. It does not. It goes into the sea.
 *
 * ── What the day-1 numbers on r005 changed here ─────────────────────────────
 * Instagram's like-timing histogram said r005's most-liked frame by a wide
 * margin was its LAST one, and its least-liked stretch was the 10.8s race that
 * preceded it. So this reel is 28s rather than 32, and the race no longer
 * precedes the end card — it runs underneath it. The lap is timed so the reel
 * still ends on an arrival, which is the part of r005 that worked.
 *
 * ── The second surprise, and why the reel needs one ─────────────────────────
 * r005's retention was a linear bleed with no plateau: one surprise at 3s and
 * then twenty seconds elaborating it. The diagnosis was a missing re-commitment
 * beat. Here the second surprise lands at 14.4s and it is a real one — glass is
 * the SLOWER medium. Light gives up a third of its speed in fibre (204,288 km/s
 * against 299,792 in vacuum), so the cable ought to lose. It wins anyway,
 * because the satellite route is 4.5x longer.
 *
 * ── What is NOT claimed ─────────────────────────────────────────────────────
 * Every millisecond here is a speed-of-light FLOOR for the route: distance over
 * medium velocity. No switching, no queuing, no routing reality. The reel never
 * shows a figure as a measured ping, and the readout says "floor" where it
 * matters. See projects/r006_cables/NOTES.md.
 */

export const DURATION_SECONDS = 28;

// Accent: DOMAIN_ACCENT.infrastructure #00D6F7 — backlog §2, maps and real
// geography. Written as a literal at every use site so Studio keeps the swatch
// click-editable (brand guide §11).

// ── the stage ───────────────────────────────────────────────────────────────
// 800 wide from x=60 stops at x=860, clear of the action rail at x=870. r005's
// readout shipped 960 wide and had its payoff figures eaten by the rail; the
// map is the payoff here, so it gets the same treatment.
const MAP_X = 60;
const MAP_Y = 645;
const MAP_W = 800;

const D2R = Math.PI / 180;
const mercY = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * D2R) / 2));
const R_PX = MAP_W / ((LON_W1 - LON_W0) * D2R);
const Y_N = mercY(LAT_N);
const MAP_H = R_PX * (Y_N - mercY(LAT_S));

type P = { x: number; y: number };

const proj = (lon: number, lat: number): P => ({
  x: MAP_X + ((lon - LON_W0) / (LON_W1 - LON_W0)) * MAP_W,
  y: MAP_Y + (Y_N - mercY(lat)) * R_PX,
});

/**
 * A ring becomes one or more subpaths. A coastline that crosses the seam must be
 * BROKEN there: painting straight through it draws a chord across the whole map.
 * r005 hit this twice and it fails silently — it paints garbage rather than
 * throwing. The seam is at 180 deg, out in the Pacific, because this route
 * crosses the Atlantic.
 */
const ringPaths = (ring: number[]): string[] => {
  const out: string[] = [];
  let d = "";
  let n = 0;
  let prevLon: number | null = null;
  const flush = () => {
    if (n >= 2) out.push(d);
    d = "";
    n = 0;
  };
  for (let i = 0; i < ring.length; i += 2) {
    const lon = ring[i];
    const lat = ring[i + 1];
    if (prevLon !== null && Math.abs(lon - prevLon) > 180) flush();
    prevLon = lon;
    const p = proj(lon, lat);
    d += `${d ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    n += 1;
  }
  flush();
  return out;
};

const COAST_PATHS: string[] = COAST.flatMap(ringPaths);

/** Graticule, generated rather than stored: it is the same grid every frame. */
const GRATICULE: string[] = (() => {
  const g: string[] = [];
  for (let lat = -20; lat <= 60; lat += 20) {
    let d = "";
    for (let lon = LON_W0; lon <= LON_W1; lon += 5) {
      const p = proj(lon, lat);
      d += `${d ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }
    g.push(d);
  }
  for (let lon = -90; lon <= 90; lon += 30) {
    let d = "";
    for (let lat = LAT_S; lat <= LAT_N; lat += 4) {
      const p = proj(lon, lat);
      d += `${d ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }
    g.push(d);
  }
  return g;
})();

/** The three legs stitched into one track, so the race runs it as a single path. */
const ROUTE: number[] = [...LEG_SEA_1, ...LEG_LAND, ...LEG_SEA_2];
const ROUTE_N = ROUTE.length / 2;
/** Where the land leg sits in the stitched track — used to tint it differently. */
const LAND_FROM = LEG_SEA_1.length / 2;
const LAND_TO = (LEG_SEA_1.length + LEG_LAND.length) / 2;

const trackPath = (flatPts: number[], from: number, upto: number) => {
  const n = flatPts.length / 2;
  const a = Math.max(0, Math.floor(from * (n - 1)));
  const b = Math.min(n - 1, Math.ceil(upto * (n - 1)));
  let d = "";
  for (let i = a; i <= b; i += 1) {
    const p = proj(flatPts[i * 2], flatPts[i * 2 + 1]);
    d += `${d ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d;
};

const pointAt = (flatPts: number[], u: number): P => {
  const n = flatPts.length / 2;
  const i = Math.max(0, Math.min(n - 1, Math.round(u * (n - 1))));
  return proj(flatPts[i * 2], flatPts[i * 2 + 1]);
};

/**
 * A bright window of the track, used for the wavefront that sweeps the finished
 * cable. Index-based rather than fraction-based so its LENGTH stays constant as
 * it travels, which is what makes it read as one pulse moving rather than a
 * line growing.
 */
const segmentPath = (flatPts: number[], head: number, span: number) => {
  const n = flatPts.length / 2;
  const i = Math.round(head * (n - 1 + span)) - span;
  let d = "";
  for (let k = Math.max(0, i); k <= Math.min(n - 1, i + span); k += 1) {
    const p = proj(flatPts[k * 2], flatPts[k * 2 + 1]);
    d += `${d ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d;
};

/** Tail behind a marker: a moving mass reads, a moving dot does not. */
const tailPath = (flatPts: number[], u: number, span: number) => {
  const n = flatPts.length / 2;
  const i = Math.max(0, Math.min(n - 1, Math.round(u * (n - 1))));
  let d = "";
  for (let k = Math.max(0, i - span); k <= i; k += 1) {
    const p = proj(flatPts[k * 2], flatPts[k * 2 + 1]);
    d += `${d ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d;
};

// ── the satellite path ──────────────────────────────────────────────────────
// It runs off the top of the frame and is never brought back to scale, because
// it does not fit: 35,786 km against a map 800px wide. The fact that it leaves
// the frame IS the argument, so it is drawn rather than diagrammed.
const P_MUM = proj(MUMBAI[0], MUMBAI[1]);
const P_VAB = proj(VIRGINIA[0], VIRGINIA[1]);
const P_MRS = proj(MARSEILLE[0], MARSEILLE[1]);
const P_BIL = proj(BILBAO[0], BILBAO[1]);
const SKY_Y = 120;

/** u in [0,1] over the whole up-and-back trip. Off-frame for most of it. */
const satAt = (u: number): P => {
  if (u <= 0.5) {
    const f = u / 0.5;
    return { x: P_MUM.x, y: P_MUM.y + (SKY_Y - P_MUM.y) * f };
  }
  const f = (u - 0.5) / 0.5;
  return { x: P_VAB.x, y: SKY_Y + (P_VAB.y - SKY_Y) * f };
};

// ── the race ────────────────────────────────────────────────────────────────
// 5.25s x exactly two laps fills 17.5 -> 28.0, so the reel ENDS on an arrival.
// r005's most-liked frame was its last one, and its last frame was an arrival;
// that is the one structural thing carried over unchanged.
//
// The satellite is given its true handicap rather than a dramatic one: it is
// RATIO times slower, so one trip takes 5.25 x 3.06 = 16.1s and it cannot
// finish inside the reel. It never arrives. That is the honest result and it
// is also the better ending.
const RACE_FROM = 17.5;
const LAP = 5.25;
const SAT_TRIP = LAP * RATIO;

export const Cables: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();

  // Draw-on for the seabed route. Front-loaded: the first two seconds decide
  // everything, and a line that is 7% drawn at 0.5s is not "moving".
  const drawn = interpolate(
    frame,
    [t(6.4), t(7.4), t(11.0)],
    [0, 0.45, 1],
    ease,
  );

  // The opening: one amber dot leaves Mumbai and goes straight up, before any
  // title. Show before you tell.
  const hookU = interpolate(frame, [t(0.35), t(2.6)], [0, 0.42], ease);

  // Race clock.
  const raceT = Math.max(0, (frame - t(RACE_FROM)) / 30);
  const racing = frame >= t(RACE_FROM);
  const cableU = racing ? (raceT % LAP) / LAP : 0;
  const cableLap = racing ? Math.floor(raceT / LAP) : 0;
  const satU = racing ? Math.min(1, raceT / SAT_TRIP) : 0;
  const satKmSoFar = satU * SAT_KM;
  // The cable has arrived if it has completed a lap and is near the end of one.
  const cableArrived = racing && (cableLap >= 1 || cableU > 0.985);

  // ── continuous motion, and why it is not decoration ──────────────────────
  // The first cut of this reel measured 19% event density — below I51's first
  // cut at 26%, which a viewer called static. The map is still for three whole
  // beats: 01, the distance readout, and the speed bars. Rule 4's fix is not
  // more drift, it is to never pause the thing the reel is ABOUT.
  //
  // So light runs in the cable for the entire reel once the route exists. It is
  // also the only honest picture of what a cable does: the traffic never stops.
  const flow = -((frame * 3.2) % 44);
  const skyFlow = -((frame * 2.6) % 52);
  // A wavefront sweeps the finished cable end to end every 2.1s, from the moment
  // the route is complete until the race takes the job over. Small dashes were
  // not enough: they move too few pixels to count as an event, which the audit
  // caught at 20% density. This is a MASS in motion on the subject itself.
  const sweepU = ((frame - t(10.6)) / (2.1 * 30)) % 1;
  const sweeping = frame >= t(10.6) && frame < t(RACE_FROM);

  // Traffic climbing the amber column, three blobs on a 1.6s cycle. Per-beat
  // measurement put the opening at 15-17% event density, and the opening is the
  // stretch that decides reach — dashes alone move too few pixels to register.
  // The column and everything travelling it are one amber element (r005's
  // reading: a marker is part of its line, not a second element).
  const climbers = [0, 1, 2].map((k) => (frame / (1.6 * 30) + k / 3) % 1);

  // ── the camera ───────────────────────────────────────────────────────────
  // Per-beat measurement said the first 14s ran 15-17% event density against
  // r005's 38% overall. The cause is structural rather than fixable with more
  // dashes: a static map with a small marker on it cannot generate events,
  // because the audit measures mean change over the WHOLE frame. r005 cleared
  // the bar by morphing every coastline at once.
  //
  // So the view moves. It opens tight on Mumbai — your phone, one city — pulls
  // back at 3.4s to reveal the whole ocean between you and the other end, then
  // follows the cable as it is laid. All three are things a documentary camera
  // would do, and each is a large-area change because the entire map moves.
  const MAP_CX = MAP_X + MAP_W / 2;
  const MAP_CY = MAP_Y + MAP_H / 2;
  const camScale = interpolate(
    frame,
    [t(0), t(2.2), t(3.4), t(6.6), t(7.2), t(11.0), t(11.7)],
    [1.75, 1.75, 1.0, 1.0, 1.35, 1.35, 1.0],
    ease,
  );
  const openMix = interpolate(frame, [t(2.2), t(3.4)], [1, 0], ease);
  const followMix = interpolate(
    frame,
    [t(6.6), t(7.2), t(11.0), t(11.7)],
    [0, 1, 1, 0],
    ease,
  );
  const head = pointAt(ROUTE, Math.max(0.001, drawn));
  const camX =
    MAP_CX + (P_MUM.x - MAP_CX) * openMix + (head.x - MAP_CX) * followMix;
  const camY =
    MAP_CY + (P_MUM.y - MAP_CY) * openMix + (head.y - MAP_CY) * followMix;
  const cam =
    `translate(${(MAP_CX - camScale * camX).toFixed(1)}px, ` +
    `${(MAP_CY - camScale * camY).toFixed(1)}px) scale(${camScale.toFixed(3)})`;

  // A climber dims as it enters the headline band. This has to be measured in
  // SCREEN space, not map space: the opening is zoomed 1.75x, so a marker at map
  // y=653 is drawn at screen y=430 and a map-space threshold never fires.
  // Rule 3 wants the title riding OVER the action, not fighting it.
  const skyDim = (y: number) =>
    Math.max(0.16, Math.min(1, (camScale * (y - camY) + MAP_CY - 300) / 260));

  // Speed bars for the second surprise. Measured out rather than switched on:
  // a length that grows is an event.
  const barU = interpolate(frame, [t(14.6), t(16.4)], [0, 1], ease);
  const BAR_W = 620;

  // Satellite path is drawn on during beat 01, then stays.
  const satDrawn = interpolate(frame, [t(0.35), t(1.6)], [0, 1], ease);
  // ...except across beat 03, where the amber SPEED BAR is the amber element.
  // One amber element per frame (§3a), and a bar plus two sky lines is three.
  const satVis = interpolate(
    frame,
    [t(14.2), t(14.6), t(17.2), t(17.6)],
    [1, 0, 0, 1],
    ease,
  );
  // The hook dot hands the amber over to the race and leaves. Without this it
  // froze at 42% of the climb and sat there for fifteen seconds.
  const hookVis = interpolate(frame, [t(2.6), t(3.2)], [1, 0], ease);

  return (
    <AbsoluteFill>
      <ReelGround accent="#00D6F7" />

      <AbsoluteFill style={{ transform: breath }}>
        <AbsoluteFill style={{ transform: cam, transformOrigin: "0 0" }}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <defs>
              <linearGradient id="skyfade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB020" stopOpacity={0} />
                <stop offset="42%" stopColor="#FFB020" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#FFB020" stopOpacity={1} />
              </linearGradient>
            </defs>
            {/* graticule, then coast: the map has to be nameable with sound off */}
            <rect
              x={MAP_X}
              y={MAP_Y}
              width={MAP_W}
              height={MAP_H}
              fill="none"
              stroke="#0E213E"
              strokeWidth={2}
            />
            {GRATICULE.map((d, i) => (
              <path
                key={`g${i}`}
                d={d}
                fill="none"
                stroke="#0D1F3C"
                strokeWidth={2}
              />
            ))}
            {COAST_PATHS.map((d, i) => (
              <path
                key={`c${i}`}
                d={d}
                fill="none"
                stroke="#81A2C4"
                strokeWidth={2}
                opacity={0.42}
              />
            ))}

            {/* ── the belief, amber. One amber ELEMENT: the path and the marker
              travelling it are the same thing (r005's reading of §3a). ── */}
            <path
              d={`M${P_MUM.x} ${P_MUM.y}L${P_MUM.x} ${
                P_MUM.y + (SKY_Y - P_MUM.y) * satDrawn
              }`}
              fill="none"
              stroke="url(#skyfade)"
              strokeWidth={5}
              opacity={satVis}
            />
            {/* the same traffic, climbing. Same element, so still one amber. */}
            <path
              d={`M${P_MUM.x} ${P_MUM.y}L${P_MUM.x} ${
                P_MUM.y + (SKY_Y - P_MUM.y) * satDrawn
              }`}
              fill="none"
              stroke="url(#skyfade)"
              strokeWidth={20}
              strokeDasharray="18 44"
              strokeDashoffset={skyFlow}
              opacity={satVis * 0.9}
            />
            <path
              d={`M${P_VAB.x} ${P_VAB.y}L${P_VAB.x} ${
                P_VAB.y + (SKY_Y - P_VAB.y) * satDrawn
              }`}
              fill="none"
              stroke="url(#skyfade)"
              strokeWidth={5}
              opacity={
                satVis * interpolate(frame, [t(3.0), t(4.0)], [0, 1], ease)
              }
            />
            {/* the hook dot, before the race owns the amber marker */}
            {!racing &&
              satVis > 0.01 &&
              climbers.map((u, k) => {
                const p = satAt(u * 0.5);
                const fade = 1 - u * 2 > 0 ? Math.min(1, (1 - u * 2) * 2.4) : 0;
                return (
                  <g key={`cl${k}`} opacity={satVis * fade * skyDim(p.y)}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={30}
                      fill="#FFB020"
                      opacity={0.26}
                    />
                    <circle cx={p.x} cy={p.y} r={15} fill="#FFB020" />
                  </g>
                );
              })}
            {!racing && hookVis > 0.01 && (
              <circle
                cx={satAt(hookU).x}
                cy={satAt(hookU).y}
                r={15}
                fill="#FFB020"
                opacity={hookVis}
              />
            )}

            {/* ── the truth, cyan. Sea legs solid; the leg across France dashed,
              because it is the one part of the journey that is not underwater ── */}
            <path
              d={trackPath(ROUTE, 0, Math.min(drawn, LAND_FROM / ROUTE_N))}
              fill="none"
              stroke="#00D6F7"
              strokeWidth={6}
              strokeLinecap="round"
            />
            {drawn > LAND_FROM / ROUTE_N && (
              <path
                d={trackPath(
                  ROUTE,
                  LAND_FROM / ROUTE_N,
                  Math.min(drawn, LAND_TO / ROUTE_N),
                )}
                fill="none"
                stroke="#00D6F7"
                strokeWidth={6}
                strokeDasharray="10 12"
                opacity={0.75}
              />
            )}
            {drawn > LAND_TO / ROUTE_N && (
              <path
                d={trackPath(ROUTE, LAND_TO / ROUTE_N, drawn)}
                fill="none"
                stroke="#00D6F7"
                strokeWidth={6}
                strokeLinecap="round"
              />
            )}

            {sweeping && (
              <>
                <path
                  d={segmentPath(ROUTE, sweepU, 46)}
                  fill="none"
                  stroke="#00D6F7"
                  strokeWidth={26}
                  strokeLinecap="round"
                  opacity={0.22}
                />
                <path
                  d={segmentPath(ROUTE, sweepU, 26)}
                  fill="none"
                  stroke="#E8E6E1"
                  strokeWidth={9}
                  strokeLinecap="round"
                  opacity={0.9}
                />
              </>
            )}

            {/* Light in the glass. Drawn over the solid route, so the route reads
              as a cable and the pips read as the traffic on it. */}
            {drawn > 0.02 && (
              <path
                d={trackPath(ROUTE, 0, drawn)}
                fill="none"
                stroke="#E8E6E1"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray="7 37"
                strokeDashoffset={flow}
                opacity={0.85}
              />
            )}

            {drawn > 0.015 && drawn < 0.995 && (
              <>
                <path
                  d={tailPath(ROUTE, drawn, 64)}
                  fill="none"
                  stroke="#00D6F7"
                  strokeWidth={24}
                  strokeLinecap="round"
                  opacity={0.22}
                />
                <path
                  d={tailPath(ROUTE, drawn, 34)}
                  fill="none"
                  stroke="#E8E6E1"
                  strokeWidth={10}
                  strokeLinecap="round"
                  opacity={0.8}
                />
                <circle
                  cx={pointAt(ROUTE, drawn).x}
                  cy={pointAt(ROUTE, drawn).y}
                  r={30}
                  fill="#00D6F7"
                  opacity={0.28}
                />
                <circle
                  cx={pointAt(ROUTE, drawn).x}
                  cy={pointAt(ROUTE, drawn).y}
                  r={15}
                  fill="#00D6F7"
                />
              </>
            )}

            {/* landing points */}
            {[P_MUM, P_VAB].map((p, i) => (
              <circle key={`lp${i}`} cx={p.x} cy={p.y} r={10} fill="#00D6F7" />
            ))}
            {drawn > 0.55 &&
              [P_MRS, P_BIL].map((p, i) => (
                <circle
                  key={`mid${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  fill="#E8E6E1"
                  opacity={0.85}
                />
              ))}

            {/* ── the race ── */}
            {racing && (
              <>
                <path
                  d={tailPath(ROUTE, cableU, 72)}
                  fill="none"
                  stroke="#00D6F7"
                  strokeWidth={26}
                  strokeLinecap="round"
                  opacity={0.24}
                />
                <path
                  d={tailPath(ROUTE, cableU, 40)}
                  fill="none"
                  stroke="#E8E6E1"
                  strokeWidth={10}
                  strokeLinecap="round"
                  opacity={0.75}
                />
                <circle
                  cx={pointAt(ROUTE, cableU).x}
                  cy={pointAt(ROUTE, cableU).y}
                  r={30}
                  fill="#00D6F7"
                  opacity={0.25}
                />
                <circle
                  cx={pointAt(ROUTE, cableU).x}
                  cy={pointAt(ROUTE, cableU).y}
                  r={16}
                  fill="#00D6F7"
                />
                <circle
                  cx={satAt(satU).x}
                  cy={satAt(satU).y}
                  r={30}
                  fill="#FFB020"
                  opacity={0.25}
                />
                <circle
                  cx={satAt(satU).x}
                  cy={satAt(satU).y}
                  r={16}
                  fill="#FFB020"
                />
              </>
            )}
          </svg>

          {/* City labels grow INWARD from their dots, so neither can overflow its
            side of the frame. Virginia Beach at x=161 would clip on the left. */}
          <Fade
            from={t(0.6)}
            style={{ position: "absolute", top: P_MUM.y - 21, left: 0 }}
          >
            <div
              style={{
                position: "absolute",
                left: P_MUM.x - 232,
                width: 210,
                textAlign: "right",
                fontFamily: "IBM Plex Sans",
                fontWeight: 600,
                fontSize: 36,
                color: "#E8E6E1",
              }}
            >
              Mumbai
            </div>
          </Fade>
          <Fade
            from={t(0.6)}
            style={{ position: "absolute", top: P_VAB.y - 21, left: 0 }}
          >
            <div
              style={{
                position: "absolute",
                left: P_VAB.x + 24,
                width: 320,
                fontFamily: "IBM Plex Sans",
                fontWeight: 600,
                fontSize: 36,
                color: "#E8E6E1",
              }}
            >
              Virginia Beach
            </div>
          </Fade>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* ── the second surprise: glass is the slower medium ── */}
      <Fade
        from={t(14.6)}
        to={t(17.3)}
        style={{ position: "absolute", top: 1180, left: 60, width: SAFE_W }}
      >
        {[
          ["radio, through vacuum", V_RADIO, 1.0, "#FFB020"],
          ["light, through glass", V_FIBRE, V_FIBRE / V_RADIO, "#00D6F7"],
        ].map(([label, v, f, col]) => (
          <div key={label as string} style={{ marginBottom: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "IBM Plex Mono",
                fontSize: 36,
                color: "#81A2C4",
                marginBottom: 8,
              }}
            >
              <span>{label as string}</span>
              <span style={{ color: "#E8E6E1" }}>{fmt(v as number)} km/s</span>
            </div>
            <div style={{ height: 16, width: BAR_W, background: "#0E213E" }}>
              <div
                style={{
                  height: 16,
                  width: BAR_W * (f as number) * barU,
                  background: col as string,
                }}
              />
            </div>
          </div>
        ))}
      </Fade>

      {/* "Your message", not "It".
          The first cut opened on "It doesn't go up. It goes under." — a pronoun
          with no antecedent, over a map, for the six seconds before anything
          named the subject. That is rule 3's "never 'this'" failure wearing a
          different pronoun, and it threw away the reel's whole civilian anchor:
          the Gate 0 sentence is "when you MESSAGE someone in America", and the
          word never reached the screen. r005 had it right — "Your flight path
          isn't curved" names the object in the first three words.
          Line lengths are load-bearing: Archivo Black runs ~0.58em per character,
          so 960px holds about 22 characters at 72px. "Your message doesn't go up."
          is 27 and wraps, orphaning "up." onto the climbing marker. Split the way
          r005 does instead — object on line 1, correction on line 2 — and say
          "space" rather than "up", because space is the belief being corrected
          and it pays off on the end card. */}
      <ReelHeader
        big={
          <>
            Your message
            <br />
            doesn&apos;t go to space.
          </>
        }
        small="Your message goes underwater."
        out={[2.2, 3.0]}
        in_={[3.0, 3.8]}
        bigSize={72}
      />

      <StepLabel
        n="01"
        title="What you picture"
        sub={`Straight up ${fmt(GEO_ALT_KM)} km, then back down.`}
        from={t(3.0)}
        to={t(6.1)}
      />
      <StepLabel
        n="02"
        title="What actually happens"
        sub="Mumbai to Virginia Beach, along the seabed."
        from={t(6.3)}
        to={t(11.2)}
      />
      <StepLabel
        n="03"
        title="And glass is the slower one"
        sub="Light gives up a third of its speed in fibre."
        from={t(14.4)}
        to={t(17.3)}
      />
      <StepLabel
        n="04"
        title="Both leave Mumbai now"
        sub="Same instant. Each at its own true speed."
        from={t(17.6)}
        to={t(20.6)}
      />

      {/* SAFE_W, not the default 960: every value here is right-aligned, and the
          default width parks them under Instagram's action rail. */}
      <Readout
        from={t(11.4)}
        to={t(14.3)}
        top={1215}
        width={SAFE_W}
        rows={[
          ["up to orbit and back", `${fmt(SAT_KM)} km`],
          ["along the seabed", `${fmt(CABLE_KM)} km`],
          ["the wire is shorter by", `${fmt(SAT_KM - CABLE_KM)} km`],
        ]}
      />

      {/* The live counter. The backlog calls this reel MapRoute + Counter and the
          counter is what makes the satellite's absence legible: the amber marker
          is off the top of the frame for most of the race, so the only way to
          read "still going" is a number that keeps moving. */}
      {racing && (
        <Fade
          from={t(RACE_FROM)}
          style={{ position: "absolute", top: 1215, left: 60, width: SAFE_W }}
        >
          {[
            ["by satellite", `${fmt(Math.round(satKmSoFar))} km`, false],
            [
              "along the seabed",
              cableArrived
                ? "arrived"
                : `${fmt(Math.round(cableU * CABLE_KM))} km`,
              cableArrived,
            ],
          ].map(([k, v, done]) => (
            <div
              key={k as string}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "2px solid #274064",
                padding: "14px 4px",
                fontFamily: "IBM Plex Mono",
                fontSize: 40,
              }}
            >
              <span style={{ color: "#81A2C4" }}>{k as string}</span>
              <span style={{ color: done ? "#00D6F7" : "#E8E6E1" }}>
                {v as string}
              </span>
            </div>
          ))}
        </Fade>
      )}

      {/* The payoff, in the step-label slot the beats have finished with. It waits
          for the first arrival so the number lands ON the event rather than
          before it. "Floor" is doing real work: these are speed-of-light times
          for the route, not pings, and the reel is not allowed to imply otherwise. */}
      <Fade
        from={t(22.9)}
        style={{ position: "absolute", top: 486, left: 60, width: SAFE_W }}
      >
        <div
          style={{
            fontFamily: "IBM Plex Sans",
            fontWeight: 600,
            fontSize: 50,
            color: "#E8E6E1",
            lineHeight: 1.16,
          }}
        >
          {CABLE_MS} ms of glass. {SAT_MS} ms of sky.
        </div>
        <div
          style={{
            fontFamily: "IBM Plex Mono",
            fontSize: 36,
            color: "#81A2C4",
            marginTop: 12,
          }}
        >
          speed-of-light floor, not a ping
        </div>
      </Fade>

      {/* End card, over the still-running race. Earlier than r005's, because the
          day-1 like histogram said the closing frame is the strongest beat in a
          reel and the run-up to it is the weakest.

          Rule 9 wants a reason to follow that is PERFORMABLE on the phone in the
          viewer's hand — r003 failed it by asking people holding one phone to
          scan an on-screen QR code. r005 passed with "open a flight tracker" and
          its last frame became the most-liked in the reel. This is the same
          shape. It deliberately does NOT promise a specific next reel: r005's
          end card promised this one, and I15's promise was broken. */}
      <Fade
        from={t(21.8)}
        style={{ position: 'absolute', top: 1396, left: 60, width: SAFE_W }}
      >
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
            fontSize: 44,
            color: '#E8E6E1',
          }}
        >
          Nothing you send abroad goes to space.
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 36,
            color: '#81A2C4',
            marginTop: 14,
          }}
        >
          Open a submarine cable map. Find your ocean.
        </div>
      </Fade>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
