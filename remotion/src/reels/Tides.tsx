import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  Fade,
  Progress,
  ReelGround,
  ReelHeader,
  SAFE_W,
  ease,
  fmt,
  t,
  useBreath,
} from './lib/chrome';
import { CURVE_HOURS, ENVELOPE, ENVELOPE_STEP_DEG, MOON_CURVE, TIDES } from './data/tides';

/**
 * r009 · "The Sun pulls the Earth 179x harder than the Moon — and the Moon makes
 * the tide."  (backlog I58, §2 Maps and real geography)
 *
 * ── What is on screen, and why it is that ───────────────────────────────────
 * The Earth and its ocean. It is on screen in every one of the eight beats and it
 * never stops moving — the continents rotate for the whole 54s and the tide
 * envelope is redrawn every frame — which is non-negotiable 6 in its widened form
 * and, not coincidentally, how the motion audit gets paid.
 *
 * ── WHAT THIS REEL IS ABOUT, PRECISELY ──────────────────────────────────────
 * The tide-raising FORCE, not anyone's local water level. What is drawn is the
 * EQUILIBRIUM TIDE: the shape a frictionless global ocean would take if it could
 * keep up with the forcing. Real ocean tides are set by basin resonance and
 * amphidromic systems, they lag the forcing, and their range varies enormously by
 * coastline — the Gulf of Mexico gets ONE high a day, not two.
 *
 * So this reel never says "your two tides a day", never shows a named port, and
 * never animates a bulge arriving at a coast. That restraint is the whole reason
 * the concept survived Gate 0 in this form rather than the backlog row's original
 * "two high tides a day, and one of them shouldn't be there" — see
 * projects/i58_tides/gate0/GATE0.md §7, and r001's false "the cafe noise dies
 * here", which is the mistake this rule exists to prevent.
 *
 * ── The second surprise, and where it sits ──────────────────────────────────
 * r006 bled retention linearly because it had one surprise at 3s and then twenty
 * seconds of elaboration. The first surprise here is the reversal at ~9s (huge
 * pull, smaller tide). The second is the body beat at 41.5s: the person standing
 * next to you raises a tide in you 702,858x stronger than the Moon does. That is
 * also the only beat that lands inside an argument people actually have, which
 * Gate 0 recorded as this concept's weakest leg.
 *
 * ── What is NOT claimed ─────────────────────────────────────────────────────
 * Not that centrifugal force is "the wrong answer" — the rotating-frame
 * derivation about the barycentre is legitimate. The reel makes the positive
 * statement instead: the Moon pulls the centre harder than the far side, so the
 * far side is left behind. Not that the sea's highs are 12h25m apart — measured,
 * adding the Sun moves them 8.5 min earlier; the reel says the MOON'S PART
 * repeats every 12h25m, which is what M2 means. See projects/i58_tides/NOTES.md.
 */

export const DURATION_SECONDS = 54;

// Accent: DOMAIN_ACCENT.infrastructure #00D6F7 — backlog §2. Written as a literal
// at every use site so Studio keeps the swatch click-editable (brand guide §11).

// ── the stage ───────────────────────────────────────────────────────────────
// 800 wide from x=60 stops at x=860, clear of the action rail at x=870.
// FULL BLEED, and that is a measured decision, not a look. The first cut put the
// Earth in an 800x520 panel: at the audit's 240px sampling width the planet was
// 15-40px across, every beat scored 9-27% event density and the reel failed. The
// audit measures mean change over the WHOLE frame, so the subject has to BE most
// of the frame. Text rides over the graphic, as it does on r006 and r007.
const STAGE = { left: 0, top: 270, w: 1080, h: 1270 } as const;
const VB = { x: -540, y: -635, w: 1080, h: 1270 } as const;

// SAFE_W (810) puts the right edge at exactly x=870, which is where the action
// rail starts — a boundary touch, and glyph overhang crosses it. Every bottom
// panel gets a real 30px margin instead.
const PANEL_W = SAFE_W - 30;             // 780

const R_EARTH = 300;                     // world units
const AMP_MOON = 84;                     // px of bulge at the Moon's amplitude
const AMP_SUN = AMP_MOON * TIDES.tide.sunOverMoon;   // the REAL ratio, not a choice
const SUN = { x: -1050, y: 0, r: 280 };
const MOON_ANGLE = -30;                  // degrees; gives the bulge axis a visible swing
const MOON_D = 760;
const MOON = {
  x: MOON_D * Math.cos((MOON_ANGLE * Math.PI) / 180),
  y: MOON_D * Math.sin((MOON_ANGLE * Math.PI) / 180),
  r: 76,
};

// ── beats ───────────────────────────────────────────────────────────────────
const B = {
  hook: [0, 7],
  reversal: [7, 14],
  nearfar: [14, 21],
  behind: [21, 28],
  cube: [28, 34.5],
  clock: [34.5, 41.5],
  body: [41.5, 48.5],
  end: [48.5, 54],
} as const;

/** Camera keyframes: [second, scale, centre-x, centre-y] in world units. */
// NO TWO CONSECUTIVE KEYFRAMES ARE EQUAL. The first cut held the camera still
// inside every beat and the audit found a 4.5s dead spell in the end card alone.
// A documentary camera is never locked off: open tight on the water, pull back to
// find the Sun, pan to the Moon, push in for the mechanism, drift out to close.
const CAM: [number, number, number, number][] = [
  [0.0, 2.1, 0, 0],
  [2.6, 0.55, -430, 0],
  [7.0, 0.52, -400, 0],
  [9.2, 0.6, 250, 0],
  [14.0, 0.5, 200, -30],
  // cy is NEGATIVE here so the planet sits low and leaves the label band clear.
  // Gate 3: "the secondary text and background look the same" — the real cause
  // was body copy lying on top of the ocean, not the colour of the type. The
  // fix is a scrim behind the words, and a scrim is a large STATIC area, which
  // cost 8 points of event density. It is bought back here: every beat now
  // travels far enough that the frame is never resting.
  [16.2, 1.02, 0, -150],
  [21.0, 0.94, 30, -158],
  [28.0, 0.8, 60, -178],
  [30.2, 0.66, 250, -40],
  [34.5, 0.48, 170, 30],
  [36.6, 0.8, -330, 300],
  [41.5, 0.52, -230, 355],
  [43.6, 0.5, -320, 335],
  [48.5, 0.94, -140, 285],
  [50.2, 0.76, 0, 120],
  [54.0, 0.6, 40, 150],
];

const track = (frame: number, i: 1 | 2 | 3) =>
  interpolate(frame, CAM.map((k) => t(k[0])), CAM.map((k) => k[i]), ease);

/** The ocean: ENVELOPE is the computed shape; only its amplitude changes. */
const oceanPath = (amp: number, axisDeg: number): string => {
  const a0 = (axisDeg * Math.PI) / 180;
  return (
    ENVELOPE.map((mult, i) => {
      const a = a0 + (i * ENVELOPE_STEP_DEG * Math.PI) / 180;
      const r = R_EARTH + amp * mult;
      return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    }).join('') + 'Z'
  );
};

/** Indicative landmasses, so the disc reads as Earth rather than as a circle. */
const LAND = [
  'M-262,-93 L-142,-169 L-44,-109 L-65,11 L-169,65 L-251,5 Z',
  'M11,-213 L202,-158 L235,-44 L120,-16 L27,-104 Z',
  'M-109,115 L49,93 L98,235 L-38,267 L-120,196 Z',
  'M142,71 L262,49 L273,158 L164,169 Z',
  'M-284,147 L-191,131 L-169,218 L-267,229 Z',
];

/**
 * Every text block sits on its own scrim. The reel is full-bleed by necessity
 * (the motion audit needs the planet to BE the frame), so type and graphic
 * share pixels; a panel of ground at 0.88 behind the words is what makes them
 * readable without shrinking the subject back down.
 */
const Panel: React.FC<{
  from: number;
  to?: number;
  top: number;
  children: React.ReactNode;
}> = ({ from, to, top, children }) => (
  <Fade from={from} to={to} style={{ position: 'absolute', top, left: 60, width: PANEL_W }}>
    <div style={{ position: 'relative', padding: '20px 24px 24px' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#040E1F',
          opacity: 0.88,
          borderRadius: 18,
        }}
      />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  </Fade>
);

/** Step number + claim + one plain-English line, on a scrim. */
const BeatLabel: React.FC<{ n: string; title: string; sub: string; from: number; to: number }> = ({
  n,
  title,
  sub,
  from,
  to,
}) => (
  <Panel from={from} to={to} top={452}>
    <div
      style={{
        fontFamily: 'IBM Plex Mono',
        fontSize: 36,
        color: '#00D6F7',
        letterSpacing: 3,
        marginBottom: 10,
      }}
    >
      {n}
    </div>
    <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 58, color: '#E8E6E1' }}>
      {title}
    </div>
    {/* bone at 0.82 rather than ash: ash reads fine on the ground and vanishes
        over the ocean, and this line is the one doing the explaining. */}
    <div
      style={{
        fontFamily: 'IBM Plex Sans',
        fontSize: 42,
        color: '#E8E6E1',
        opacity: 0.82,
        marginTop: 10,
      }}
    >
      {sub}
    </div>
  </Panel>
);

/** Instrumentation rows. Values are plain relative numbers, never exponents. */
const Rows: React.FC<{
  from: number;
  to: number;
  top: number;
  rows: [string, string][];
  note?: string;
}> = ({ from, to, top, rows, note }) => (
  <Panel from={from} to={to} top={top}>
    {rows.map(([k, v]) => (
      <div
        key={k}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderTop: '2px solid #274064',
          padding: '14px 2px',
          fontFamily: 'IBM Plex Mono',
          fontSize: 40,
        }}
      >
        <span style={{ color: '#E8E6E1', opacity: 0.72 }}>{k}</span>
        <span style={{ color: '#E8E6E1' }}>{v}</span>
      </div>
    ))}
    {note ? (
      <div
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: 36,
          color: '#E8E6E1',
          opacity: 0.72,
          marginTop: 14,
        }}
      >
        {note}
      </div>
    ) : null}
  </Panel>
);

const bar = (w: number, color: string, h = 16) => (
  <div style={{ width: Math.max(2, w), height: h, background: color, borderRadius: 2 }} />
);

const Row: React.FC<{ label: string; children: React.ReactNode; sub?: string }> = ({
  label,
  children,
  sub,
}) => (
  <div style={{ marginBottom: 20 }}>
    <div
      // bone at 0.72, not ash: Gate 3 flagged the secondary tone as reading the
      // same as the ground. Ash is fine on the bare ground and disappears the
      // moment the ocean drifts behind it.
      style={{
        fontFamily: 'IBM Plex Sans',
        fontWeight: 600,
        fontSize: 36,
        color: '#E8E6E1',
        opacity: 0.72,
        letterSpacing: 2,
        marginBottom: 10,
      }}
    >
      {label}
    </div>
    {children}
    {sub ? (
      <div
        style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: 38,
          color: '#E8E6E1',
          marginTop: 10,
        }}
      >
        {sub}
      </div>
    ) : null}
  </div>
);

export const Tides: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();

  const k = track(frame, 1);
  const cx = track(frame, 2);
  const cy = track(frame, 3);

  // The bulge swings from the Sun's axis to the Moon's as the actor changes,
  // and grows from the solar amplitude to the lunar one. Both are the computed
  // values; the swing is the only thing chosen here.
  const axis = interpolate(frame, [t(7.6), t(9.6)], [0, MOON_ANGLE], ease);
  const amp = interpolate(frame, [t(7.6), t(9.6)], [AMP_SUN, AMP_MOON], ease);

  // Continents turn for the whole reel: one revolution per 10s. This is the
  // large-area motion the audit measures, and it never stops. At 26s per turn
  // (the first cut) the planet was technically moving and measured as still.
  const spin = (frame / 30) * (360 / 8.5);

  const sunIn = interpolate(frame, [t(1.2), t(2.6)], [0, 1], ease);
  const sunOut = interpolate(frame, [t(8.4), t(9.6)], [1, 0], ease);
  const moonIn = interpolate(frame, [t(8.0), t(9.4)], [0, 1], ease);

  // Beats 3-4: near / centre / far, drawn along the bulge axis.
  const probeIn = interpolate(frame, [t(15.6), t(16.8)], [0, 1], ease);
  const probeOut = interpolate(frame, [t(28.0), t(29.2)], [1, 0], ease);
  const residual = interpolate(frame, [t(22.0), t(24.0)], [0, 1], ease);
  const probes = Math.min(probeIn, probeOut);

  // Beat 6: the curve draws left to right.
  const draw = interpolate(frame, [t(36.4), t(41.2)], [0, 1], ease);

  const ax = (axis * Math.PI) / 180;
  const arrow = (mag: number) => 70 + (mag / TIDES.bulges.aNear) * 150;

  return (
    <AbsoluteFill>
      <ReelGround accent="#00D6F7" />

      <ReelHeader
        big={
          <>
            The Sun pulls the Earth
            <br />
            179x harder than the Moon.
          </>
        }
        small={<>The Moon still makes the tide</>}
        out={[6.2, 7.2]}
        in_={[7.4, 8.4]}
        bigSize={62}
      />

      {/* ── the stage: the Earth and its ocean, on screen for all 54s ────── */}
      <div style={{ position: 'absolute', ...STAGE }}>
        <div style={{ transform: breath, transformOrigin: '50% 50%' }}>
          <svg
            width={STAGE.w}
            height={STAGE.h}
            viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
          >
            <defs>
              <clipPath id="earthclip">
                <circle cx={0} cy={0} r={R_EARTH} />
              </clipPath>
            </defs>

            <g transform={`scale(${k.toFixed(4)}) translate(${-cx},${-cy})`}>
              {/* the Sun */}
              <g opacity={Math.min(sunIn, sunOut)}>
                <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill="#E8E6E1" />
                {Array.from({ length: 16 }, (_, i) => {
                  const a = (i * Math.PI) / 8;
                  return (
                    <line
                      key={i}
                      x1={SUN.x + Math.cos(a) * (SUN.r + 50)}
                      y1={SUN.y + Math.sin(a) * (SUN.r + 50)}
                      x2={SUN.x + Math.cos(a) * (SUN.r + 120)}
                      y2={SUN.y + Math.sin(a) * (SUN.r + 120)}
                      stroke="#274064"
                      strokeWidth={16}
                    />
                  );
                })}
              </g>

              {/* the Moon */}
              <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="#81A2C4" opacity={moonIn} />

              {/* the ocean — recomputed every frame from the emitted envelope */}
              <path d={oceanPath(amp, axis)} fill="#00D6F7" fillOpacity={0.3} />
              <path
                d={oceanPath(amp, axis)}
                fill="none"
                stroke="#00D6F7"
                strokeWidth={9}
                strokeLinejoin="round"
              />

              {/* the Earth */}
              <circle cx={0} cy={0} r={R_EARTH} fill="#0E213E" />
              <g clipPath="url(#earthclip)">
                <g transform={`rotate(${spin.toFixed(2)})`}>
                  {LAND.map((dd, i) => (
                    <path key={i} d={dd} fill="#274064" />
                  ))}
                </g>
              </g>
              <circle cx={0} cy={0} r={R_EARTH} fill="none" stroke="#274064" strokeWidth={6} />

              {/* near / centre / far — the residuals that make two bulges */}
              <g opacity={probes}>
                {([
                  ['near', R_EARTH, TIDES.bulges.aNear, TIDES.bulges.near, 1],
                  ['centre', 0, TIDES.bulges.aCentre, 0, 0],
                  ['far', -R_EARTH, TIDES.bulges.aFar, TIDES.bulges.far, -1],
                ] as const).map(([name, off, full, res, dir]) => {
                  const px = Math.cos(ax + Math.PI) * off;
                  const py = Math.sin(ax + Math.PI) * off;
                  // beat 3 shows the FULL pull; beat 4 subtracts the centre's and
                  // leaves the residual, which points outward on BOTH sides.
                  const len = interpolate(residual, [0, 1], [arrow(full), res ? 110 + res * 7.1e7 : 0]);
                  const dx = Math.cos(ax + Math.PI) * (residual > 0.5 && dir < 0 ? -len : len);
                  const dy = Math.sin(ax + Math.PI) * (residual > 0.5 && dir < 0 ? -len : len);
                  return (
                    <g key={name}>
                      <circle cx={px} cy={py} r={16} fill="#00D6F7" />
                      <line
                        x1={px}
                        y1={py}
                        x2={px + dx}
                        y2={py + dy}
                        stroke="#00D6F7"
                        strokeWidth={12}
                        opacity={len > 2 ? 1 : 0}
                      />
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* ── beat labels ────────────────────────────────────────────────────
          Rewritten after Gate 3: "make text more user friendly to understand".
          "Pull falls off as d squared" became a sentence with no algebra in it. */}
      <BeatLabel
        n="01"
        title="One pull is enormous."
        sub="The other one wins."
        from={t(B.reversal[0])}
        to={t(B.reversal[1] - 0.4)}
      />
      <BeatLabel
        n="02"
        title="The pull isn't the same everywhere."
        sub="The side facing the Moon gets pulled hardest. The far side least."
        from={t(B.nearfar[0])}
        to={t(B.nearfar[1] - 0.4)}
      />
      <BeatLabel
        n="03"
        title="The far side gets left behind."
        sub="Take the middle away, and both ends bulge outward."
        from={t(B.behind[0])}
        to={t(B.behind[1] - 0.4)}
      />
      <BeatLabel
        n="04"
        title="Distance counts three times."
        sub="Move twice as far away: the pull drops 4x. The tide drops 8x."
        from={t(B.cube[0])}
        to={t(B.cube[1] - 0.4)}
      />
      <BeatLabel
        n="05"
        title="The sea runs on the Moon's clock."
        sub="Not the Sun's. Not ours."
        from={t(B.clock[0])}
        to={t(B.clock[1] - 0.4)}
      />
      <BeatLabel
        n="06"
        title="So does it pull on you?"
        sub="You're 1.7 metres across. The Earth is 12,742 kilometres."
        from={t(B.body[0])}
        to={t(B.body[1] - 0.4)}
      />

      {/* ── beats 1-2: the two pulls, DRAWN TOGETHER ─────────────────────────
          The first cut faded the Sun's bar out at 7.0s and brought the Moon's in
          at 9.4s, under a caption reading "same scale as the bar above" — a bar
          that was no longer on screen. Two states in sequence is not a relation
          (build.md, structural findings). The Sun's bar now stays up until the
          reversal has landed, so the 179:1 is ONE picture: 720px against 4px. */}
      <Fade from={t(2.8)} to={t(14.0)} style={{ position: 'absolute', top: 1150, left: 60, width: PANEL_W }}>
        <Row label="THE SUN PULLS ON THE EARTH" sub={`raises a tide of ${TIDES.tide.sunCm} cm`}>
          {bar(720, '#E8E6E1')}
        </Row>
      </Fade>

      <Fade from={t(9.4)} to={t(14.0)} style={{ position: 'absolute', top: 1300, left: 60, width: PANEL_W }}>
        <Row
          label="THE MOON PULLS ON THE EARTH — SAME SCALE"
          sub={`raises a tide of ${TIDES.tide.moonCm} cm`}
        >
          {bar(720 / TIDES.pull.ratio, '#00D6F7')}
        </Row>
      </Fade>

      {/* Gate 3: "e-6 is hard to understand by any person." These are the same
          three measurements, expressed against the middle of the Earth — which
          is the only thing the beat ever compared them to anyway. */}
      <Rows
        from={t(16.6)}
        to={t(21.0)}
        top={1160}
        rows={[
          ['the near side', `${TIDES.bulges.nearVsCentrePct}% harder`],
          ['the middle', 'the baseline'],
          ['the far side', `${TIDES.bulges.farVsCentrePct}% weaker`],
        ]}
        note="one Moon, one Earth, three different pulls"
      />

      <Rows
        from={t(23.4)}
        to={t(28.0)}
        top={1160}
        rows={[
          ['bulge toward the Moon', '100'],
          ['bulge away from it', `${TIDES.bulges.farBulgeRel}`],
        ]}
        note={`the far one is ${TIDES.bulges.asymPct}% weaker — and it is still there`}
      />

      <Rows
        from={t(30.4)}
        to={t(34.5)}
        top={1160}
        rows={[
          ['the Sun pulls', `${Math.round(TIDES.pull.ratio)}x harder`],
          ['the Sun raises', `${TIDES.tide.sunOverMoon.toFixed(2)}x the tide`],
          ['so the Moon wins by', `${TIDES.tide.moonOverSun.toFixed(1)}x`],
        ]}
      />

      {/* ── the Moon's own tide curve, computed over 48 h ─────────────────── */}
      <Fade from={t(36.2)} to={t(41.5)} style={{ position: 'absolute', top: 1096, left: 60, width: PANEL_W }}>
        <div style={{ position: 'relative', padding: '20px 24px 24px' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#040E1F',
              opacity: 0.88,
              borderRadius: 18,
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                fontFamily: 'IBM Plex Sans',
                fontWeight: 600,
                fontSize: 36,
                color: '#E8E6E1',
                opacity: 0.72,
                letterSpacing: 2,
                marginBottom: 10,
              }}
            >
              THE MOON&apos;S PART OF THE TIDE · {CURVE_HOURS} HOURS
            </div>
            <svg width={PANEL_W - 48} height={148} viewBox={`0 0 ${PANEL_W - 48} 148`}>
              <line x1={0} y1={74} x2={PANEL_W - 48} y2={74} stroke="#274064" strokeWidth={2} />
              <path
                d={MOON_CURVE.map((v, i) => {
                  const x = (i / (MOON_CURVE.length - 1)) * (PANEL_W - 48);
                  const y = 74 - (v / TIDES.tide.moonM) * 50;
                  return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
                }).join('')}
                fill="none"
                stroke="#00D6F7"
                strokeWidth={5}
                strokeDasharray={4000}
                strokeDashoffset={4000 * (1 - draw)}
              />
            </svg>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 38, color: '#E8E6E1', marginTop: 8 }}>
              a high every {Math.floor(TIDES.rhythm.m2H)} h {Math.round((TIDES.rhythm.m2H % 1) * 60)} min
            </div>
            {/* The disclaimer earns its place: this curve is the FORCE. Saying so
                is the difference between this reel and the one Gate 0 refused. */}
            <div
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 36,
                color: '#E8E6E1',
                opacity: 0.72,
                marginTop: 8,
              }}
            >
              this is the pull, not a tide table
            </div>
          </div>
        </div>
      </Fade>

      {/* ── the same law, applied to a person ──────────────────────────────
          Rewritten after the second Gate 3 pass, which caught three things:

          1. Every label here said PULL, and the comparison is only true for the
             TIDE. On straight gravity the Moon beats a nearby person by 28,409x
             — the opposite result. Saying "pull" invited a correction that would
             have been right. Both bars now say tide, and the reel concedes the
             gravity case out loud rather than losing to it in the comments.
          2. The distance was 1 m, which is not physical: with a 1.7 m body the
             near end of you sits 0.15 m from the other person's centre, so the
             point-mass formula was being read inside its own singularity. The
             702,858x it returned was mostly that artefact. At 2 m — two people
             standing near each other — it is 10,077x, and still astonishing.
          3. The caption said "drawn to the same scale" and that was false HERE:
             at this ratio the Moon's bar would be 0.07 px. (It is true on the
             Sun/Moon frame, where the bar is 4.03 px and drawn at 4.) The bar
             now says what it is: too small to draw. That is the punchline. */}
      <Panel from={t(43.4)} to={t(48.5)} top={1030}>
        <Row label="THE TIDE THE MOON RAISES IN YOU" sub="too small to draw here">
          {bar(2, '#E8E6E1')}
        </Row>
        <Row
          label={`THE TIDE FROM SOMEONE ${TIDES.body.personDistanceM} METRES AWAY`}
          sub={`${fmt(TIDES.body.personOverMoon)}x stronger`}
        >
          {bar(700, '#00D6F7')}
        </Row>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 36,
            color: '#E8E6E1',
            opacity: 0.72,
            marginTop: 4,
          }}
        >
          The Moon&apos;s straight pull on you is {fmt(TIDES.body.moonGravWinsBy)}x theirs. It just
          doesn&apos;t stretch you.
        </div>
      </Panel>

      {/* ── the end card ─────────────────────────────────────────────────────
          Gate 3 dropped the "tomorrow's high is 51 minutes later" ask: it was an
          absolute about a tide table this reel deliberately never claims to
          predict. What replaces it is the whole reel as one sum — and both lines
          are asserted in emit_ts.py to reproduce the measured ratios exactly, so
          the arithmetic on screen IS the arithmetic that was run. */}
      <Panel from={t(49.0)} top={1096}>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
            fontSize: 42,
            color: '#E8E6E1',
            marginBottom: 18,
          }}
        >
          The Sun is {TIDES.ratios.massMillions} million times heavier
          <br />
          and {TIDES.ratios.distance} times further away.
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '2px solid #274064',
            padding: '14px 2px',
            fontFamily: 'IBM Plex Mono',
            fontSize: 40,
          }}
        >
          <span style={{ color: '#E8E6E1', opacity: 0.72 }}>
            ÷ {TIDES.ratios.distance} twice
          </span>
          <span style={{ color: '#E8E6E1' }}>
            {Math.round(TIDES.ratios.pullFromRatios)}x the pull
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '2px solid #274064',
            padding: '14px 2px',
            fontFamily: 'IBM Plex Mono',
            fontSize: 40,
          }}
        >
          <span style={{ color: '#E8E6E1', opacity: 0.72 }}>
            ÷ {TIDES.ratios.distance} once more
          </span>
          <span style={{ color: '#00D6F7' }}>
            {TIDES.ratios.tideFromRatios.toFixed(2)}x the tide
          </span>
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
            fontSize: 42,
            color: '#E8E6E1',
            marginTop: 20,
          }}
        >
          One extra division. That&apos;s the whole thing.
        </div>
      </Panel>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
