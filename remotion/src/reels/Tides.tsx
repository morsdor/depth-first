import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  Fade,
  Progress,
  Readout,
  ReelGround,
  ReelHeader,
  SAFE_W,
  StepLabel,
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
  [14.0, 0.57, 235, 0],
  [16.2, 1.0, 0, 60],
  [21.0, 0.96, 0, 65],
  [28.0, 0.9, 0, 70],
  [30.2, 0.6, 250, 0],
  [34.5, 0.57, 240, 0],
  // Beats 6 and 7 originally shrank the planet to 0.43x to clear room for the
  // panels, and both measured dead (14% and 32% density, a 4s dead spell). The
  // panels only need the BOTTOM of the frame, so the Earth is lifted instead of
  // shrunk, and beat 7 PUSHES IN rather than drifting out — the beat carrying
  // the reel's second surprise should not be its quietest.
  [36.6, 0.7, -300, 300],
  [41.5, 0.58, -265, 330],
  [43.6, 0.56, -300, 330],
  [48.5, 0.86, -180, 300],
  [50.2, 0.74, 0, 130],
  [54.0, 0.62, 0, 145],
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
      style={{
        fontFamily: 'IBM Plex Sans',
        fontWeight: 600,
        fontSize: 36,
        color: '#81A2C4',
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
  const spin = (frame / 30) * (360 / 10);

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

      {/* ── beat labels ──────────────────────────────────────────────────── */}
      <StepLabel
        n="01"
        title="One pull is enormous."
        sub="The other one wins."
        from={t(B.reversal[0])}
        to={t(B.reversal[1] - 0.4)}
      />
      <StepLabel
        n="02"
        title="The pull is not the same everywhere."
        sub="Near side hardest. Far side least."
        from={t(B.nearfar[0])}
        to={t(B.nearfar[1] - 0.4)}
      />
      <StepLabel
        n="03"
        title="The far side is left behind."
        sub="Take away the middle and both ends bulge out."
        from={t(B.behind[0])}
        to={t(B.behind[1] - 0.4)}
      />
      <StepLabel
        n="04"
        title="Distance counts three times."
        sub="Pull falls off as d squared. A tide falls off as d cubed."
        from={t(B.cube[0])}
        to={t(B.cube[1] - 0.4)}
      />
      <StepLabel
        n="05"
        title="The sea keeps the Moon's time."
        sub="Not the Sun's, and not the clock's."
        from={t(B.clock[0])}
        to={t(B.clock[1] - 0.4)}
      />
      <StepLabel
        n="06"
        title="So does it pull on you?"
        sub="You are 1.7 metres across, not 12,742 kilometres."
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

      <Readout
        from={t(16.6)}
        to={t(21.0)}
        top={1200}
        width={PANEL_W}
        rows={[
          ['near side', `${TIDES.bulges.aNear.toExponential(3)} m/s²`],
          ['centre', `${TIDES.bulges.aCentre.toExponential(3)} m/s²`],
          ['far side', `${TIDES.bulges.aFar.toExponential(3)} m/s²`],
        ]}
      />

      <Readout
        from={t(23.4)}
        to={t(28.0)}
        top={1200}
        width={PANEL_W}
        rows={[
          ['bulge toward the Moon', TIDES.bulges.near.toExponential(3)],
          ['bulge away from it', TIDES.bulges.far.toExponential(3)],
          ['the far one is weaker by', `${TIDES.bulges.asymPct}%`],
        ]}
      />

      <Readout
        from={t(30.4)}
        to={t(34.5)}
        top={1200}
        width={PANEL_W}
        rows={[
          ['the Sun pulls', `${TIDES.pull.ratio}x harder`],
          ['the Sun raises', `${TIDES.tide.sunOverMoon}x the tide`],
          ['so the Moon wins by', `${TIDES.tide.moonOverSun}x`],
        ]}
      />

      {/* ── beat 5: the Moon's own tide curve, computed over 48 h ────────── */}
      <Fade from={t(36.2)} to={t(41.5)} style={{ position: 'absolute', top: 1112, left: 60, width: PANEL_W }}>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
            fontSize: 36,
            color: '#81A2C4',
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          THE MOON&apos;S PART OF THE TIDE · {CURVE_HOURS} H
        </div>
        <svg width={PANEL_W} height={150} viewBox="0 0 780 150">
          <line x1={0} y1={75} x2={PANEL_W} y2={75} stroke="#274064" strokeWidth={2} />
          <path
            d={MOON_CURVE.map((v, i) => {
              const x = (i / (MOON_CURVE.length - 1)) * PANEL_W;
              const y = 75 - (v / TIDES.tide.moonM) * 52;
              return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
            }).join('')}
            fill="none"
            stroke="#00D6F7"
            strokeWidth={5}
            strokeDasharray={4000}
            strokeDashoffset={4000 * (1 - draw)}
          />
        </svg>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: '#E8E6E1', marginTop: 6 }}>
          {TIDES.rhythm.m2H.toFixed(2)} h apart · lunar day {TIDES.rhythm.lunarDayH.toFixed(2)} h
        </div>
        {/* The disclaimer earns its place over the arithmetic: this curve is the
            FORCE, and saying so is the difference between this reel and the one
            Gate 0 refused to build. */}
        <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 36, color: '#81A2C4', marginTop: 6 }}>
          the tide-raising force, not a gauge record
        </div>
      </Fade>

      {/* ── beat 6: the same law, applied to a person ─────────────────────── */}
      <Fade from={t(43.4)} to={t(48.5)} style={{ position: 'absolute', top: 1160, left: 60, width: PANEL_W }}>
        <Row label="THE MOON, ACROSS YOUR BODY">{bar(2, '#81A2C4')}</Row>
        <Row
          label="A PERSON STANDING ONE METRE AWAY"
          sub={`${fmt(TIDES.body.personOverMoon)}x stronger — same scale`}
        >
          {bar(720, '#00D6F7')}
        </Row>
      </Fade>

      {/* ── the end card ─────────────────────────────────────────────────── */}
      <Fade from={t(49.0)} style={{ position: 'absolute', top: 1220, left: 60, width: PANEL_W }}>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 46, color: '#E8E6E1' }}>
          A tide isn&apos;t how hard you&apos;re pulled.
          <br />
          It&apos;s how much harder your near side is.
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 36, color: '#81A2C4', marginTop: 16 }}>
          Open your tide table. Tomorrow&apos;s high is about{' '}
          {Math.round(TIDES.rhythm.driftMinPerDay)} minutes later.
        </div>
      </Fade>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
