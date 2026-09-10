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
  t,
  useBreath,
} from './lib/chrome';
import {
  FOUR,
  ONE,
  RACE_FRAMES,
  ROUNDS,
  SIM_MINUTES,
  STATS,
  TROLLEY,
  YOU,
  type Body,
} from './data/queue';

/**
 * r009 · "One line isn't faster. It's fair."  (backlog I64)
 *
 * ── What is on screen ───────────────────────────────────────────────────────
 * A supermarket, twice. The same arrival stream and the same baskets are run
 * under two disciplines — four lines you choose between, and one snake feeding
 * all four tills — and one shopper is followed through both. Every position on
 * screen was computed by trace.py; the .tsx does no queue logic at all, so it
 * cannot disagree with the simulation.
 *
 * The shopper we follow (#527, a seven-second basket) was chosen by a rule
 * written down before the run: basket not trolley, four-line wait in the p70-p90
 * band, one-line wait under the median, at least one trolley ahead of them. If
 * nobody had matched, trace.py fails rather than relaxing a condition.
 *
 * ── The honest turn, and why it is the whole reel ──────────────────────────
 * The first pitch was "a shared line cuts everyone's wait several-fold". The
 * simulation says 16% on the mean. What actually moves is the tail — 24% off
 * the 95th percentile — and what does NOT move at all is throughput: 203.57
 * against 203.56 served per hour. So the reel never says the shop is faster. It
 * says the shop serves the same number either way and the bad day disappears,
 * which is both true and the more surprising claim.
 *
 * The x-ray row in beat 06 is the proof and the point: given perfect
 * information, four lines TIE one line exactly (2.131 vs 2.131). Separate lines
 * are not worse queueing, they are worse guessing.
 *
 * ── What is NOT claimed ────────────────────────────────────────────────────
 * The single-run MAXIMUM wait is the most dramatic pair in the data — 53 min
 * against 24 — and it swings by a factor of two with the seed, so it is barred
 * from the screen and from emit_ts.py's exports. Only the mean and the 95th
 * percentile survive a five-seed sweep, and only those appear.
 *
 * The 13 seconds of visible race are an EXCERPT of a long run, not proof of the
 * figures; the figures come from 300,000 shoppers and every beat that shows one
 * says so. In this particular window the four-line shop happens to serve 48 to
 * the one-line shop's 43 — throughput is identical and a 15-minute window is
 * noise — so there is deliberately no "served" counter anywhere in the reel.
 */

export const DURATION_SECONDS = 56;

// ── beats ───────────────────────────────────────────────────────────────────
const B1 = 6.0;      // trolleys fade in: what you could not see
const B2 = 12.0;     // the followed shopper reaches the till
const B3 = 18.0;     // sixteen rounds of "which lane frees first"
const B4 = 24.5;     // the race
const B5 = 37.5;     // same person, both shops
const B6 = 44.5;     // the turn: one line is not faster
const B7 = 50.5;     // the close

// ── geometry ────────────────────────────────────────────────────────────────
// Every shop is an 810-wide clipped box at x=60, so panel-local x maps the same
// way whatever the layout: px=1 is the till column, px>1 walks out of frame.
const PANEL_W = 810;
const SPAN_X = 710;
const TILL_PX = 1;
const FULL = { top: 620, h: 560, laneTop: 92, laneSpan: 378 };
const RACE_A = { top: 596, h: 344, laneTop: 64, laneSpan: 216 };
const RACE_B = { top: 962, h: 344, laneTop: 64, laneSpan: 216 };

const laneY = (g: typeof FULL, py: number) => g.laneTop + py * g.laneSpan;

/**
 * A camera over the lead section — the r007 fix, applied before it was needed.
 *
 * The audit measures mean change over the WHOLE frame, and a 30px shopper is a
 * 7px smudge once the frame is downscaled to 240 for measurement. Measured on
 * the first cut of this reel, the lead beats ran 8%, 29% and 12% event density
 * against the race's 67%: a shop full of people shuffling forward is, to the
 * audit and to a scrolling viewer, almost nothing happening.
 *
 * So the frame moves instead of the shoppers. It PANS rather than zooming: the
 * first cut opened at 2.15x and the still showed three people and no shop at
 * all, which fails the one thing the hook has to do — a stranger must be able to
 * name what is on screen with the sound off. Scale therefore stays inside
 * 1.0-1.35, where 560/1.35 = 415px of panel is visible against a 378px lane
 * span, so all four lanes are in frame at every moment of the reel. The motion
 * comes from travelling along the queues, not from magnifying them.
 *
 * Open on the tills with the queues running off frame left; pull back along the
 * lanes as the trolleys fade in — the reveal IS the beat; settle wide; then push
 * to the till as the followed shopper finally reaches it.
 */
const CAM_S = [0, 6, 11.5, 13.5, 18] as const;
const CAM = {
  scale: [1.32, 1.24, 1.0, 1.34, 1.12],
  ox: [610, 430, 405, 655, 500],
  oy: [300, 300, 280, 344, 300],
};

const useLeadCamera = (frame: number): string => {
  const keys = CAM_S.map((v) => t(v));
  const s = interpolate(frame, keys, CAM.scale, ease);
  const ox = interpolate(frame, keys, CAM.ox, ease);
  const oy = interpolate(frame, keys, CAM.oy, ease);
  return `translate(${(PANEL_W / 2 - ox * s).toFixed(2)}px, ${(
    FULL.h / 2 -
    oy * s
  ).toFixed(2)}px) scale(${s.toFixed(4)})`;
};

/** Playback. B0-B2 run the four-line shop alone at 0.72x from trace frame 60,
 *  so the followed shopper is on screen by 0.72s. The race replays both shops
 *  from frame 0 at 1.0x, and the trace runs out exactly on the last frame. */
const leadFrame = (f: number) => Math.min(RACE_FRAMES - 1, Math.round(60 + f * 0.72));
const raceFrame = (f: number) => Math.min(RACE_FRAMES - 1, Math.round(f - t(B4)));

const Person: React.FC<{
  b: Body;
  g: typeof FULL;
  trolleys: number;
  mine: boolean;
}> = ({ b, g, trolleys, mine }) => {
  const [id, px, py, state] = b;
  const x = px * SPAN_X;
  const y = laneY(g, py);
  const col = mine ? '#51A4FF' : '#E8E6E1';
  const out = state === 2 ? interpolate(px, [1.05, 1.28], [1, 0], ease) : 1;
  return (
    <div style={{ position: 'absolute', left: x - 18, top: y - 28, opacity: out }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          background: col,
          marginLeft: 5,
          marginBottom: 4,
        }}
      />
      <div style={{ width: 36, height: 32, borderRadius: 10, background: col }} />
      {TROLLEY.has(id) && (
        <div
          style={{
            position: 'absolute',
            left: 36,
            top: 22,
            width: 58,
            height: 36,
            border: '5px solid #81A2C4',
            borderRadius: 5,
            opacity: trolleys,
          }}
        />
      )}
      {mine && (
        <div
          style={{
            position: 'absolute',
            left: -32,
            top: 70,
            width: 94,
            textAlign: 'center',
            fontFamily: 'IBM Plex Mono',
            fontSize: 36,
            color: '#51A4FF',
          }}
        >
          YOU
        </div>
      )}
    </div>
  );
};

const Till: React.FC<{ g: typeof FULL; py: number; lit?: boolean }> = ({ g, py, lit }) => (
  <div
    style={{
      position: 'absolute',
      left: TILL_PX * SPAN_X - 38,
      top: laneY(g, py) - 32,
      width: 76,
      height: 64,
      borderRadius: 8,
      background: lit ? '#51A4FF' : '#274064',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 14,
        top: 12,
        width: 48,
        height: 18,
        borderRadius: 4,
        background: lit ? '#0E213E' : '#81A2C4',
      }}
    />
  </div>
);

/** One shop. The body list is whatever the simulation said at this frame. */
const Shop: React.FC<{
  bodies: readonly Body[];
  g: typeof FULL;
  trolleys: number;
  label?: string;
  tint: string;
  cam?: string;
}> = ({ bodies, g, trolleys, label, tint, cam }) => (
  <div
    style={{
      position: 'absolute',
      left: 60,
      top: g.top,
      width: PANEL_W,
      height: g.h,
      overflow: 'hidden',
      borderRadius: 14,
      background: '#0E213E',
      border: `3px solid ${tint}`,
    }}
  >
    {label && (
      <div
        style={{
          position: 'absolute',
          left: 22,
          top: 14,
          fontFamily: 'IBM Plex Sans',
          fontWeight: 600,
          fontSize: 38,
          color: tint,
        }}
      >
        {label}
      </div>
    )}
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: cam }}>
      {[0, 1, 2, 3].map((j) => (
        <Till key={j} g={g} py={j / 3} />
      ))}
      {bodies.map((b) => (
        <Person key={b[0]} b={b} g={g} trolleys={trolleys} mine={b[0] === YOU.id} />
      ))}
    </div>
  </div>
);

/**
 * Beat 03. Sixteen rounds of "which of four lanes frees first", raced from the
 * drawn service times: each bar empties at the rate its own baskets imply, so
 * the winner arrives exactly on the round boundary. Nothing here is authored.
 *
 * There is deliberately NO tally on screen. Sixteen rounds is far too small a
 * sample to print next to a 25% claim — the first draw of eight rounds returned
 * "0 of 8", and re-rolling until the count looked right is exactly the move this
 * repo calls p-hacking. The rounds illustrate the mechanism; the 200,000-round
 * figure in the readout carries the claim.
 */
const ROUND_F = 12;

const Rounds: React.FC = () => {
  const frame = useCurrentFrame();
  const into = frame - t(B3);
  const r = Math.min(ROUNDS.length - 1, Math.floor(into / ROUND_F));
  const a = (into % ROUND_F) / ROUND_F;
  const { win, fill } = ROUNDS[r];
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        top: FULL.top,
        width: PANEL_W,
        height: FULL.h,
        overflow: 'hidden',
        borderRadius: 14,
        background: '#0E213E',
        border: '3px solid #274064',
      }}
    >
      {[0, 1, 2, 3].map((j) => {
        const p = Math.min(1, a * fill[j]);
        const won = j === win && p >= 1;
        return (
          <div key={j}>
            <div
              style={{
                position: 'absolute',
                left: 40,
                top: laneY(FULL, j / 3) - 40,
                width: 710,
                height: 80,
                borderRadius: 10,
                background: '#0D1F3C',
                border: `3px solid ${j === 0 ? '#51A4FF' : '#274064'}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 40,
                top: laneY(FULL, j / 3) - 40,
                width: 710 * p,
                height: 80,
                borderRadius: 10,
                background: won ? '#51A4FF' : '#274064',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 62,
                top: laneY(FULL, j / 3) - 22,
                fontFamily: 'IBM Plex Mono',
                fontSize: 38,
                color: won ? '#040E1F' : '#81A2C4',
              }}
            >
              {j === 0 ? 'YOUR LINE' : `LINE ${j + 1}`}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: FULL.h - 72,
          fontFamily: 'IBM Plex Sans',
          fontSize: 40,
          color: '#81A2C4',
        }}
      >
        round {r + 1} of {ROUNDS.length} — the shortest line is not the fastest
      </div>
    </div>
  );
};

export const Queue: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();
  const lead = FOUR[leadFrame(frame)];
  const race = raceFrame(frame);
  const trolleys = interpolate(frame, [t(B1), t(B1 + 0.7)], [0, 1], ease);
  const cam = useLeadCamera(frame);

  // The clock is sim time inside the excerpt — the same clock for both shops,
  // because both are being fed the identical arrival stream.
  const mins = (race / (RACE_FRAMES - 1)) * SIM_MINUTES;
  const clock = `${Math.floor(mins)}:${String(Math.floor((mins % 1) * 60)).padStart(2, '0')}`;

  return (
    <AbsoluteFill>
      <ReelGround accent="#51A4FF" />

      <div style={{ transform: breath }}>
        {frame < t(B3) && (
          <Shop bodies={lead} g={FULL} trolleys={trolleys} tint="#274064" cam={cam} />
        )}
        {frame >= t(B3) && frame < t(B4) && <Rounds />}
        {frame >= t(B4) && (
          <Fade from={t(B4)}>
            <Shop
              bodies={FOUR[race]}
              g={RACE_A}
              trolleys={1}
              label="FOUR LINES"
              tint="#274064"
            />
            <Shop
              bodies={ONE[race]}
              g={RACE_B}
              trolleys={1}
              label="ONE LINE"
              tint="#51A4FF"
            />
          </Fade>
        )}
      </div>

      <ReelHeader
        big={
          <>
            You picked the
            <br />
            slow line.
          </>
        }
        small="Checkout queues, simulated"
        out={[B1 - 0.6, B1 + 0.2]}
        in_={[B1 + 0.3, B1 + 1.1]}
      />

      <StepLabel
        n="01"
        title="You can count heads."
        sub="You cannot count baskets."
        from={t(B1 + 0.2)}
        to={t(B2)}
      />
      <StepLabel
        n="02"
        title="4.2 minutes in the queue."
        sub={`Your basket takes ${YOU.basketSeconds} seconds.`}
        from={t(B2 + 0.3)}
        to={t(B3)}
      />
      <StepLabel
        n="03"
        title="Your line wins one time in four."
        sub="That is arithmetic, not luck."
        from={t(B3 + 0.3)}
        to={t(B4)}
      />
      <StepLabel
        n="04"
        title="Same shoppers. Same baskets."
        sub="One shop is told to form a single line."
        from={t(B4 + 0.3)}
        to={t(B5)}
      />
      <StepLabel
        n="05"
        title="Same person. Same basket."
        sub={`Out in ${Math.round(YOU.wait1 * 60)} seconds instead of ${YOU.wait4.toFixed(1)} minutes.`}
        from={t(B5 + 0.3)}
        to={t(B6)}
      />
      <StepLabel
        n="06"
        title="One line is not faster."
        sub={`The shop serves the same ${Math.round(STATS.oneThroughput)} an hour either way.`}
        from={t(B6 + 0.3)}
        to={t(B7)}
      />

      {frame >= t(B4) && frame < t(B6) && (
        <div
          style={{
            position: 'absolute',
            top: RACE_A.top - 62,
            left: 60,
            width: SAFE_W,
            textAlign: 'right',
            fontFamily: 'IBM Plex Mono',
            fontSize: 44,
            color: '#81A2C4',
          }}
        >
          {clock}
        </div>
      )}

      <Readout
        from={t(B3 + 0.6)}
        to={t(B4)}
        top={1250}
        width={SAFE_W}
        rows={[
          ['rounds simulated', '200,000'],
          ['your line finishes first', `${(STATS.fastestShare * 100).toFixed(1)}%`],
        ]}
      />
      <Readout
        from={t(B5 + 0.6)}
        to={t(B6)}
        top={1370}
        width={SAFE_W}
        rows={[
          ['four lines', `${YOU.wait4.toFixed(1)} min`],
          ['one line', `${YOU.wait1.toFixed(1)} min`],
        ]}
      />
      <Readout
        from={t(B6 + 0.6)}
        to={t(B7)}
        top={1310}
        width={SAFE_W}
        rows={[
          ['1 in 20 waits · four lines', `${STATS.fourPct95.toFixed(1)} min`],
          ['1 in 20 waits · one line', `${STATS.onePct95.toFixed(1)} min`],
          ['four lines, with x-ray vision', `${STATS.oracleMean.toFixed(1)} min avg`],
        ]}
      />

      {frame >= t(B7) && (
        <Fade from={t(B7)} style={{ position: 'absolute', top: 470, left: 60, width: SAFE_W }}>
          <div style={{ transform: breath }}>
            <div
              style={{
                fontFamily: 'Archivo Black',
                fontSize: 68,
                lineHeight: 1.12,
                color: '#E8E6E1',
                letterSpacing: -1,
              }}
            >
              You are in the wrong lane
              <br />
              three times out of four.
            </div>
            <div
              style={{
                fontFamily: 'IBM Plex Sans',
                fontWeight: 600,
                fontSize: 46,
                color: '#51A4FF',
                marginTop: 22,
              }}
            >
              It was never a pick.
            </div>
            <div
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 42,
                color: '#81A2C4',
                marginTop: 28,
              }}
            >
              Tonight, count the trolleys — not the people.
            </div>
          </div>
        </Fade>
      )}

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
