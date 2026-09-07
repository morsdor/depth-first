import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  Fade,
  Progress,
  ReelGround,
  ReelHeader,
  SAFE_W,
  StepLabel,
  useBreath,
  ease,
  t,
} from './lib/chrome';
import {
  CHECKPOINTS,
  ORDERS,
  PATHS_FY,
  PATHS_NAIVE,
  PCT_FY,
  PCT_HIGH,
  PCT_LOW,
  RATIO,
  SERIES_FY,
  SERIES_NAIVE,
  WORST_RATIO,
} from './data/bias';

/**
 * r005 · "The obvious way to shuffle is wrong"  (backlog I07, reframed)
 *
 * ── Why this is the fourth cut ───────────────────────────────────────────────
 * The first three measured how often a CORRECT shuffle clumps. Every figure was
 * real, and a viewer said it plainly: "it doesn't talk about any algorithm or
 * interesting knowledge, only fast repeated animations." They were right on both
 * counts, and the two faults were the same fault.
 *
 * r001 ran Shazam's fingerprinting, r003 ran Reed-Solomon, r004 ran the DCT.
 * This ran random.shuffle and counted pairs — a statistics demo with no
 * mechanism in it. And when an earlier cut read as static, the fix was a LOOPING
 * playhead, which raised the event-density metric to 68% while teaching nothing:
 * motion without information. The metric rewards change, and a loop is change.
 * That is a second blind spot, one layer above the first.
 *
 * So the algorithm is the subject now. The naive shuffle everyone writes first is
 * measurably biased, the proof is a counting argument a viewer can follow, and
 * the fix is one character. Every bar on screen fills from a real run — the
 * motion is the result arriving, and it never repeats.
 */

export const DURATION_SECONDS = 36;

const T = {
  // The run does not stop when the hook ends. Letting it keep going through
  // the proof is the honest way to fill that beat: the counter climbs, the
  // bars settle, and none of it repeats. Freezing the chart there left 1.75s
  // under the stillness floor; LOOPING it would have been the other failure.
  fillNaive: [0.4, 17.8] as [number, number],
  hookVerdict: 5.6,
  titleOut: [5.6, 6.0] as [number, number],
  titleIn: [6.0, 6.35] as [number, number],
  hookOut: 8.9,

  // 1. the proof, which is counting rather than measuring
  s1Label: [9.2, 18.0] as [number, number],
  paths: [10.2, 12.4] as [number, number],
  s1Read: 14.2,
  s1Out: 17.8,

  // 2. one character, and it goes flat
  s2Label: [18.3, 27.0] as [number, number],
  fillFy: [19.4, 36.0] as [number, number],
  s2Verdict: 23.4,
  s2Out: 27.0,

  answer: 27.4,
  answerOut: 31.4,
  next: 31.8,
};

// ── geometry ────────────────────────────────────────────────────────────────
// 620 centred on the frame is 230..850, clear of the 870 action rail.
const ROW_H = 62;
const GAP = 10;
const CHART_W = 620;
const CHART_H = ORDERS.length * ROW_H + (ORDERS.length - 1) * GAP;
const CHART_X = 540 - CHART_W / 2;
const CHART_Y = 690;
const LABEL_W = 150;

const ACCENT = '#AD88FF'; // DOMAIN_ACCENT.data — §1, things you touch every day
const CYAN = '#00D6F7';

/** Counts at a fractional checkpoint, so the bars grow smoothly between samples. */
const countsAt = (series: number[][], p: number): number[] => {
  const x = Math.max(0, Math.min(series.length - 1, p * (series.length - 1)));
  const lo = Math.floor(x);
  const hi = Math.min(series.length - 1, lo + 1);
  const f = x - lo;
  return series[lo].map((v, i) => v + (series[hi][i] - v) * f);
};

/**
 * Six bars, one per possible order. Length is the share of runs that produced
 * that order, scaled so the widest bar fills the track — which is what makes a
 * 18.52 / 14.81 split read as obviously uneven rather than as six similar bars.
 */
const Chart: React.FC<{ counts: number[]; colour: string; flatAt?: number }> = ({
  counts,
  colour,
  flatAt,
}) => {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const max = Math.max(...counts, 1);
  const track = CHART_W - LABEL_W - 130;
  return (
    <div style={{ position: 'relative', width: CHART_W, height: CHART_H }}>
      {ORDERS.map((o, i) => {
        const pct = (100 * counts[i]) / total;
        const w = (counts[i] / max) * track;
        return (
          <div
            key={o}
            style={{
              position: 'absolute',
              top: i * (ROW_H + GAP),
              left: 0,
              width: CHART_W,
              height: ROW_H,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: LABEL_W,
                fontFamily: 'IBM Plex Mono',
                fontSize: 38,
                color: '#E8E6E1',
                letterSpacing: 4,
              }}
            >
              {o}
            </div>
            <div
              style={{
                width: track,
                height: 34,
                borderRadius: 6,
                background: '#0D1F3C',
                overflow: 'hidden',
              }}
            >
              <div style={{ width: w, height: 34, borderRadius: 6, background: colour }} />
            </div>
            <div
              style={{
                width: 130,
                textAlign: 'right',
                fontFamily: 'IBM Plex Mono',
                fontSize: 36,
                color: flatAt !== undefined ? colour : '#81A2C4',
              }}
            >
              {counts[i] > 0 ? `${pct.toFixed(1)}%` : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Shuffle: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();

  const showFy = frame >= t(T.fillFy[0]);
  const pNaive = interpolate(frame, [t(T.fillNaive[0]), t(T.fillNaive[1])], [0, 1], ease);
  const pFy = interpolate(frame, [t(T.fillFy[0]), t(T.fillFy[1])], [0, 1], ease);

  // The bars fill from a real 100,000-run series, not from a curve. Nothing here
  // loops: the run advances once, and the SHAPE arriving is the information.
  const counts = showFy ? countsAt(SERIES_FY, pFy) : countsAt(SERIES_NAIVE, pNaive);
  const runs = Math.round(
    (showFy ? pFy : pNaive) * CHECKPOINTS[CHECKPOINTS.length - 1],
  );

  return (
    <AbsoluteFill>
      <ReelGround accent={ACCENT} />

      <ReelHeader
        bigSize={68}
        big={
          <>
            The obvious way to
            <br />
            shuffle is <span style={{ color: ACCENT }}>wrong</span>
          </>
        }
        small={
          <>
            The obvious way to shuffle is <span style={{ color: ACCENT }}>wrong</span>
          </>
        }
        out={T.titleOut}
        in_={T.titleIn}
      />

      <div
        style={{
          position: 'absolute',
          top: CHART_Y,
          left: CHART_X,
          transform: breath,
          transformOrigin: 'center center',
        }}
      >
        <Chart
          counts={counts}
          colour={showFy ? CYAN : ACCENT}
          flatAt={showFy ? 1 : undefined}
        />
      </div>

      {/* The live run counter — a number that only ever goes up. Under the
          chart (which ends at 1112), and only while a fill is actually running:
          at y=620 it sat on top of every StepLabel's sub-line. */}
      {runs > 0 && frame < t(T.answer) ? (
        <div
          style={{
            position: 'absolute',
            top: 1140,
            left: 60,
            width: 960,
            textAlign: 'center',
            fontFamily: 'IBM Plex Mono',
            fontSize: 36,
            color: '#81A2C4',
          }}
        >
          {runs.toLocaleString('en-US')} shuffles of 3 songs
        </div>
      ) : null}

      {/* ── HOOK ──────────────────────────────────────────────────────────── */}
      <Fade
        from={t(T.hookVerdict)}
        to={t(T.hookOut)}
        style={{
          position: 'absolute',
          top: 1320,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 56, color: ACCENT }}>
          Some orders {WORST_RATIO}× likelier
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 38,
            color: '#81A2C4',
            marginTop: 10,
          }}
        >
          from the shuffle almost everyone writes first
        </div>
      </Fade>

      {/* ── 1. the proof is counting, not measuring ───────────────────────── */}
      <StepLabel
        n="STEP 1"
        title="Count the ways it can run"
        sub="Three swaps, three choices each."
        from={t(T.s1Label[0])}
        to={t(T.s1Label[1])}
      />
      <Fade
        from={t(T.s1Read)}
        to={t(T.s1Out)}
        style={{ position: 'absolute', top: 1200, left: 60, width: SAFE_W }}
      >
        {(
          [
            ['ways it can run', `${PATHS_NAIVE}`],
            ['possible orders', `${ORDERS.length}`],
            [`${PATHS_NAIVE} ÷ ${ORDERS.length}`, `${RATIO}`],
          ] as [string, string][]
        ).map(([k, v], i) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #274064',
              padding: '10px 4px',
              fontFamily: 'IBM Plex Mono',
              fontSize: 38,
              color: i === 2 ? ACCENT : '#81A2C4',
            }}
          >
            <span>{k}</span>
            <span style={{ color: i === 2 ? ACCENT : '#E8E6E1' }}>{v}</span>
          </div>
        ))}
        <div
          style={{
            marginTop: 14,
            textAlign: 'center',
            fontFamily: 'IBM Plex Sans',
            fontSize: 40,
            color: '#E8E6E1',
          }}
        >
          Not a whole number. It <span style={{ color: ACCENT }}>cannot</span> be fair.
        </div>
      </Fade>

      {/* ── 2. one character ──────────────────────────────────────────────── */}
      <StepLabel
        n="STEP 2"
        title="Shrink the range as you go"
        sub="Pick from what is left, not from everything."
        from={t(T.s2Label[0])}
        to={t(T.s2Label[1])}
      />
      <Fade
        from={t(T.s2Verdict)}
        to={t(T.s2Out)}
        style={{
          position: 'absolute',
          top: 1320,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 52, color: CYAN }}>
          {PATHS_FY} ways, {ORDERS.length} orders
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 38,
            color: '#81A2C4',
            marginTop: 10,
          }}
        >
          one each — {PCT_FY[0]}% every time
        </div>
      </Fade>

      {/* ── 3. the answer ────────────────────────────────────────────────── */}
      <Fade
        from={t(T.answer)}
        to={t(T.answerOut)}
        style={{
          position: 'absolute',
          top: 470,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ transform: breath, transformOrigin: 'center center' }}>
          <div style={{ fontFamily: 'Archivo Black', fontSize: 58, color: ACCENT }}>
            One character apart
          </div>
        </div>
      </Fade>
      <Fade
        from={t(T.answer + 0.5)}
        to={t(T.answerOut)}
        style={{
          position: 'absolute',
          top: 1310,
          left: 60,
          width: 960,
          textAlign: 'center',
          fontFamily: 'IBM Plex Sans',
          fontSize: 42,
          color: '#E8E6E1',
          lineHeight: 1.3,
        }}
      >
        {PCT_HIGH}% and {PCT_LOW}% — or
        <br />
        <span style={{ color: CYAN }}>{PCT_FY[0]}%, six times over.</span>
      </Fade>

      {/* ── 4. the reason to follow ──────────────────────────────────────── */}
      <Fade
        from={t(T.next)}
        style={{
          position: 'absolute',
          top: 1300,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ transform: breath, transformOrigin: 'center center' }}>
          <div
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 42,
              color: '#E8E6E1',
              lineHeight: 1.3,
            }}
          >
            Next: the six digits your phone
            <br />
            and a server <span style={{ color: ACCENT }}>both guess</span>, offline.
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: 38,
              color: ACCENT,
              marginTop: 12,
            }}
          >
            @thedepthfirst
          </div>
        </div>
      </Fade>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
