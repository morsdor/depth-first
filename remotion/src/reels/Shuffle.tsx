import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Fade,
  Progress,
  ReelGround,
  ReelHeader,
  useBreath,
  ease,
  fmt,
  t,
} from "./lib/chrome";
import { EXACT_NAIVE, ORDERS, PATHS_NAIVE } from "./data/bias";
import {
  DEV_FY,
  DEV_NAIVE,
  HI,
  LO,
  MARKS,
  N,
  RUNS,
  SERIES_FY,
  SERIES_NAIVE,
} from "./data/heatmap";

/**
 * r005 · "One of these decks was shuffled wrong"  (backlog I51)
 *
 * ── Why this is the fifth cut ────────────────────────────────────────────────
 * Cuts 1-3 measured how often a CORRECT shuffle clumps — a statistics demo with
 * no mechanism in it. Cut 4 fixed that and put the right subject on screen: the
 * naive shuffle is measurably biased. It still failed, and the reason was not
 * pacing, which is why four rounds of retiming never touched it.
 *
 * Cut 4's claim was "these six orders are not equally likely" and its hero frame
 * was six bars of near-identical height, because the true spread at n=3 is 1.25x.
 * The payoff visual argued AGAINST its own caption. A viewer asked to trust text
 * over their own eyes does not.
 *
 * So this cut changes the demonstration, not the subject. Instead of comparing
 * six magnitudes, it asks where every card LANDS — an n x n table, drawn twice.
 * A correct shuffle is featureless. The naive one has a staircase in it. Nobody
 * has to compare anything: they only have to spot a pattern, which is the one
 * perceptual task humans are superhuman at.
 *
 * Three things carry the honesty:
 *   · Both tables are measured at the same sample size and drawn in the same
 *     colour and scale. The only variable is the algorithm. Different hues would
 *     let a viewer conclude the difference is the palette.
 *   · The Fisher-Yates table is a control, not decoration: it establishes that
 *     "flat" is what this measurement produces when the shuffle is right.
 *   · Both grids start as noise (36% deviation each at 60 runs) and only one
 *     settles. That is the real behaviour, replayed from checkpoints, and it is
 *     a better line than the one I set out to draw: more data kills noise, and
 *     it does not kill bias.
 *
 * The counting argument survives from cut 4, demoted from payoff to support and
 * re-staged. `27 / 6 = 4.5` read as one more number; dealing 27 dots into 6 piles
 * and watching three come out taller is the same fact as a thing you can see.
 * The pile heights are EXACT_NAIVE straight from the enumeration, not a drawing.
 *
 * Deliberately absent: any explanation of WHY the staircase has its shape. The
 * obvious sentence ("cards touched fewer times stay nearer home") is false —
 * measurement in projects/r005_shuffle/NOTES.md falsifies it — and gate #7 says a
 * plausible hand-written mechanism does not ship. The reel explains why a bias
 * must exist and stops there.
 */

export const DURATION_SECONDS = 39;

const ACCENT = "#AD88FF"; // DOMAIN_ACCENT.data — §1, things you touch every day
const CYAN = "#00D6F7";
const INK = "#E8E6E1";
const DIM = "#81A2C4";

const T = {
  /** Checkpoint playback. Front-loaded: the split is legible by 3.0s, then refines. */
  fill: [0.4, 3.0, 16.2] as [number, number, number],
  fillTo: [0, 15, MARKS.length - 1] as [number, number, number],
  hookVerdict: 4.8,
  titleOut: [8.3, 8.7] as [number, number],
  titleIn: [8.7, 9.1] as [number, number],
  hookOut: 9.0,

  b2In: 9.3,
  b2Scan: [10.8, 15.0] as [number, number],
  b2Callout: 12.8,
  b2Out: 16.2,

  b3In: 16.6,
  b3Range: [18.6, 22.0] as [number, number],
  b3Out: 25.2,

  b4In: 25.6,
  b4Deal: [27.0, 30.8] as [number, number],
  b4Verdict: 31.0,
  b4Out: 34.4,

  b5In: 34.8,
};

// ── The tables ───────────────────────────────────────────────────────────────

const CELL = 26;
const GAP = 2;
const GRID = N * CELL + (N - 1) * GAP; // 362
const GRID_GAP = 54;
const GRID_X = 66; // 66 + 362 + 54 + 362 = 844, inside the 870 rail edge

/** Cross-fade between the two checkpoints the playhead sits between. */
const snapshotAt = (series: number[][], k: number): number[] => {
  const lo = Math.max(0, Math.min(series.length - 1, Math.floor(k)));
  const hi = Math.min(series.length - 1, lo + 1);
  const f = k - lo;
  return series[lo].map((v, i) => v * (1 - f) + series[hi][i] * f);
};

/**
 * 1.0 is exactly fair. The ramp is anchored to the naive table's own measured
 * range so the scale is identical for both grids — a per-grid autoscale would
 * stretch Fisher-Yates' noise up to look like a pattern, which is the one lie
 * this whole comparison exists to avoid.
 */
const cellColor = (v: number): string => {
  const raw = Math.max(0, Math.min(1, (v - LO) / (HI - LO)));
  // Most cells sit near 1.0, so a linear ramp spends its whole range on the
  // middle and the staircase never separates from the field. The gamma is a
  // contrast curve on an identical scale for both grids -- it cannot invent a
  // pattern, only make the measured one legible at phone size.
  const p = Math.pow(raw, 1.9);
  const r = Math.round(26 + (196 - 26) * p);
  const g = Math.round(30 + (162 - 30) * p);
  const b = Math.round(52 + (255 - 52) * p);
  return `rgb(${r}, ${g}, ${b})`;
};

const Table: React.FC<{
  cells: number[];
  x: number;
  y: number;
  scan: number;
}> = ({ cells, x, y, scan }) => (
  <div
    style={{ position: "absolute", left: x, top: y, width: GRID, height: GRID }}
  >
    {cells.map((v, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: (i % N) * (CELL + GAP),
          top: Math.floor(i / N) * (CELL + GAP),
          width: CELL,
          height: CELL,
          background: cellColor(v),
        }}
      />
    ))}
    {/* One band, not 13 outlines: outlining a row of dark cells read as a
        detached strip of empty boxes rather than a highlight inside the grid. */}
    {scan >= 0 && scan < N && (
      <div
        style={{
          position: "absolute",
          left: -6,
          top: scan * (CELL + GAP) - 4,
          width: GRID + 12,
          height: CELL + 8,
          border: `2px solid ${INK}`,
          borderRadius: 3,
        }}
      />
    )}
  </div>
);

const GridCaption: React.FC<{
  x: number;
  y: number;
  text: string;
  colour: string;
}> = ({ x, y, text, colour }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: GRID,
      textAlign: "center",
      fontFamily: "IBM Plex Mono",
      fontSize: 36,
      letterSpacing: 1,
      color: colour,
    }}
  >
    {text}
  </div>
);

// ── Beat 3: the range that shrinks ───────────────────────────────────────────

/**
 * Fisher-Yates in one picture. The broken rule always draws from all 13 slots;
 * the correct one draws only from the cards it has not dealt yet, so its range
 * closes one slot at a time. That shrinking bar IS the algorithm.
 */
const SlotRow: React.FC<{
  y: number;
  span: number;
  cursor: number;
  colour: string;
}> = ({ y, span, cursor, colour }) => {
  const w = 52;
  const g = 6;
  const total = N * w + (N - 1) * g; // 754
  const left = 66;
  return (
    <div
      style={{ position: "absolute", left, top: y, width: total, height: w }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -8,
          width: span * w + Math.max(0, span - 1) * g,
          height: w + 16,
          background: colour,
          opacity: 0.16,
          borderRadius: 6,
        }}
      />
      {Array.from({ length: N }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: i * (w + g),
            top: 0,
            width: w,
            height: w,
            background: i === cursor ? colour : "transparent",
            border: `2px solid ${i < span ? colour : "#274064"}`,
            borderRadius: 4,
          }}
        />
      ))}
    </div>
  );
};

const Rule: React.FC<{
  y: number;
  label: string;
  colour: string;
  before: string;
  key_: string;
  after: string;
  span: number;
  cursor: number;
}> = ({ y, label, colour, before, key_, after, span, cursor }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 66,
        top: y,
        fontFamily: "IBM Plex Mono",
        fontSize: 36,
        letterSpacing: 2,
        color: colour,
      }}
    >
      {label}
    </div>
    <div
      style={{
        position: "absolute",
        left: 66,
        top: y + 48,
        width: 780,
        fontFamily: "IBM Plex Sans",
        fontSize: 46,
        lineHeight: 1.25,
        color: INK,
      }}
    >
      {before}
      <span style={{ color: colour, fontWeight: 600 }}>{key_}</span>
      {after}
    </div>
    <SlotRow y={y + 190} span={span} cursor={cursor} colour={colour} />
  </>
);

// ── Beat 4: 27 into 6 ────────────────────────────────────────────────────────

/**
 * Round-robin: four full passes put 24 dots down, then three are left over and
 * there is nowhere fair to put them. Heights land on EXACT_NAIVE — the real
 * enumeration, asserted in bias.py — rather than on anything drawn by hand.
 */
const dealSlot = (d: number): [number, number] =>
  d < 24 ? [d % 6, Math.floor(d / 6)] : [[1, 2, 3][d - 24], 4];

const Piles: React.FC<{ dealt: number; y: number }> = ({ dealt, y }) => {
  const colW = 128;
  const dot = 46;
  const rowH = 54;
  const left = 66;
  const base = y + 5 * rowH;
  return (
    <>
      {Array.from({ length: PATHS_NAIVE }, (_, d) => {
        if (d >= dealt) return null;
        const [pile, row] = dealSlot(d);
        const extra = d >= 24;
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: left + pile * colW + (colW - dot) / 2,
              top: base - row * rowH,
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              background: extra ? CYAN : ACCENT,
              opacity: extra ? 1 : 0.85,
            }}
          />
        );
      })}
      {ORDERS.map((o, i) => (
        <div
          key={o}
          style={{
            position: "absolute",
            left: left + i * colW,
            top: base + rowH + 4,
            width: colW,
            textAlign: "center",
            fontFamily: "IBM Plex Mono",
            fontSize: 36,
            color: dealt >= PATHS_NAIVE && EXACT_NAIVE[i] === 5 ? CYAN : DIM,
          }}
        >
          {o}
        </div>
      ))}
    </>
  );
};

// ── Reel ─────────────────────────────────────────────────────────────────────

export const Shuffle: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();

  const k = interpolate(
    frame,
    T.fill.map(t) as number[],
    T.fillTo as unknown as number[],
    ease,
  );
  const naive = snapshotAt(SERIES_NAIVE, k);
  const fy = snapshotAt(SERIES_FY, k);
  // Read off the same playhead as the pixels. A separate interpolate for the
  // caption drifted to 393,881 over a picture drawn from ~340,000 runs.
  const kLo = Math.max(0, Math.min(MARKS.length - 1, Math.floor(k)));
  const kHi = Math.min(MARKS.length - 1, kLo + 1);
  const runs = Math.round(MARKS[kLo] + (MARKS[kHi] - MARKS[kLo]) * (k - kLo));

  // The grids are the argument, so they hold the stage for the hook, the reading
  // beat and the close. Beats 3 and 4 explain the bug and get the stage to
  // themselves rather than competing with a 362px table for the same 800px.
  const gridsUp = interpolate(
    frame,
    [t(T.b2In - 0.6), t(T.b2In)],
    [0, 1],
    ease,
  );
  const gridTop = 570 + 170 * gridsUp;
  const gridsOn = interpolate(
    frame,
    [t(T.b3In - 0.5), t(T.b3In), t(T.b5In - 0.4), t(T.b5In)],
    [1, 0, 0, 1],
    ease,
  );

  // One slow pass down the rows, once — it teaches "a row is one card" and is
  // never a loop. A loop would raise the event-density metric and teach nothing;
  // that mistake is what cut 4's playhead was.
  const counterOn = interpolate(
    frame,
    [t(T.b3In - 0.5), t(T.b3In)],
    [1, 0],
    ease,
  );

  const scan =
    frame >= t(T.b2Scan[0]) && frame < t(T.b2Scan[1])
      ? Math.floor(
          interpolate(frame, T.b2Scan.map(t) as number[], [0, N], ease),
        )
      : -1;

  const span = Math.max(
    2,
    Math.round(interpolate(frame, T.b3Range.map(t) as number[], [N, 2], ease)),
  );
  const cursor = span - 1;
  const dealt = Math.floor(
    interpolate(frame, T.b4Deal.map(t) as number[], [0, PATHS_NAIVE], ease),
  );

  return (
    <AbsoluteFill>
      <ReelGround accent={ACCENT} />

      <ReelHeader
        big={
          <>
            One of these decks was
            <br />
            shuffled <span style={{ color: ACCENT }}>wrong</span>
          </>
        }
        small={
          <>
            Shuffled <span style={{ color: ACCENT }}>wrong</span>
          </>
        }
        out={T.titleOut}
        in_={T.titleIn}
        bigSize={70}
      />

      {/* ── The two tables ── */}
      <div style={{ opacity: gridsOn, transform: breath }}>
        <GridCaption
          x={GRID_X}
          y={gridTop - 52}
          text="THE OBVIOUS WAY"
          colour={ACCENT}
        />
        <GridCaption
          x={GRID_X + GRID + GRID_GAP}
          y={gridTop - 52}
          text="THE CORRECT WAY"
          colour={CYAN}
        />
        <Table cells={naive} x={GRID_X} y={gridTop} scan={scan} />
        <Table
          cells={fy}
          x={GRID_X + GRID + GRID_GAP}
          y={gridTop}
          scan={scan}
        />
      </div>

      {/* Real, climbing, and the reason the picture changes. */}
      <div
        style={{
          position: "absolute",
          left: 66,
          top: gridTop + GRID + 34,
          width: GRID * 2 + GRID_GAP,
          textAlign: "center",
          fontFamily: "IBM Plex Mono",
          fontSize: 40,
          color: DIM,
          opacity: Math.min(gridsOn, counterOn),
        }}
      >
        {fmt(runs)} shuffles
      </div>

      {/* ── Beat 1 verdict ── */}
      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade
          from={t(T.hookVerdict)}
          to={t(T.hookOut)}
          style={{
            position: "absolute",
            top: 1140,
            left: 60,
            width: 810,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontWeight: 600,
              fontSize: 54,
              color: INK,
            }}
          >
            Same number of shuffles.
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontSize: 46,
              color: DIM,
              marginTop: 12,
            }}
          >
            Only one of them settled down.
          </div>
        </Fade>
      </div>

      {/* ── Beat 2: what you are looking at ── */}
      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade
          from={t(T.b2In)}
          to={t(T.b2Out)}
          style={{ position: "absolute", top: 430, left: 60, width: 810 }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 38,
              color: DIM,
              letterSpacing: 3,
              marginBottom: 10,
            }}
          >
            01 · WHAT YOU ARE LOOKING AT
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontWeight: 600,
              fontSize: 56,
              color: INK,
            }}
          >
            Where every card ends up
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontSize: 40,
              color: DIM,
              marginTop: 8,
            }}
          >
            Row: where it started. Column: where it ended.
          </div>
        </Fade>
      </div>

      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade
          from={t(T.b2Callout)}
          to={t(T.b2Out)}
          style={{
            position: "absolute",
            top: 1210,
            left: 60,
            width: 810,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontWeight: 600,
              fontSize: 52,
              color: INK,
            }}
          >
            Fair means <span style={{ color: CYAN }}>featureless</span>.
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 40,
              color: DIM,
              marginTop: 16,
              display: "flex",
              justifyContent: "center",
              gap: 40,
            }}
          >
            <span>
              off by <span style={{ color: ACCENT }}>{DEV_NAIVE}%</span>
            </span>
            <span>
              off by <span style={{ color: CYAN }}>{DEV_FY}%</span>
            </span>
          </div>
        </Fade>
      </div>

      {/* ── Beat 3: the bug is one word ── */}
      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade
          from={t(T.b3In)}
          to={t(T.b3Out)}
          style={{ position: "absolute", top: 430, left: 60, width: 810 }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 38,
              color: DIM,
              letterSpacing: 3,
              marginBottom: 10,
            }}
          >
            02 · THE BUG
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontWeight: 600,
              fontSize: 56,
              color: INK,
            }}
          >
            The difference is one word
          </div>
        </Fade>
      </div>

      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade from={t(T.b3In + 0.3)} to={t(T.b3Out)}>
          <Rule
            y={620}
            label="THE OBVIOUS WAY"
            colour={ACCENT}
            before="Take each card. Swap it with "
            key_="any card"
            after=" in the deck."
            span={N}
            cursor={-1}
          />
          <Rule
            y={1000}
            label="THE CORRECT WAY"
            colour={CYAN}
            before="Take each card. Swap it with one you "
            key_="haven't dealt yet"
            after="."
            span={span}
            cursor={cursor}
          />
        </Fade>
      </div>

      {/* ── Beat 4: it cannot be fair ── */}
      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade
          from={t(T.b4In)}
          to={t(T.b4Out)}
          style={{ position: "absolute", top: 430, left: 60, width: 810 }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 38,
              color: DIM,
              letterSpacing: 3,
              marginBottom: 10,
            }}
          >
            03 · WHY IT CAN NEVER BE FAIR
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontWeight: 600,
              fontSize: 56,
              color: INK,
            }}
          >
            3 cards. {PATHS_NAIVE} ways to run it.
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontSize: 42,
              color: DIM,
              marginTop: 8,
            }}
          >
            All equally likely — but only {ORDERS.length} orders to land in.
          </div>
        </Fade>
      </div>

      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade from={t(T.b4In + 0.4)} to={t(T.b4Out)}>
          <Piles dealt={dealt} y={700} />
        </Fade>
      </div>

      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade
          from={t(T.b4Verdict)}
          to={t(T.b4Out)}
          style={{
            position: "absolute",
            top: 1180,
            left: 60,
            width: 810,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontWeight: 600,
              fontSize: 52,
              color: INK,
            }}
          >
            {PATHS_NAIVE} doesn&rsquo;t split into {ORDERS.length}.
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontSize: 44,
              color: DIM,
              marginTop: 12,
            }}
          >
            Three orders come up <span style={{ color: CYAN }}>more often</span>
            . Always.
          </div>
        </Fade>
      </div>

      {/* ── Beat 5: the reason to follow ── */}
      <div style={{ transform: breath, transformOrigin: "center center" }}>
        <Fade
          from={t(T.b5In)}
          style={{
            position: "absolute",
            top: 1150,
            left: 60,
            width: 810,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontWeight: 600,
              fontSize: 48,
              color: INK,
            }}
          >
            Every shuffle it makes looks fine.
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Sans",
              fontSize: 42,
              color: DIM,
              marginTop: 14,
            }}
          >
            It took {fmt(RUNS)} of them to see the bug —
            <br />a test would never have caught it.
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 38,
              color: ACCENT,
              marginTop: 26,
            }}
          >
            @thedepthfirst
          </div>
        </Fade>
      </div>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
