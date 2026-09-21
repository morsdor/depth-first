import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from 'remotion';

/**
 * Scene16 — "0.3 → 2.5 → 40 Wh". The energy climb.
 *
 * ── Why this is a hand-built scene and not the Diagram family ────────────────
 * The family draws flat rectangles on black. That reads as a placeholder, because it IS
 * one: correct data with no design. What makes a technical chart look authored rather than
 * generated is not the bars — it's everything AROUND them:
 *
 *   1. A LABELLED AXIS. Without one, a 0.3 bar next to a 40 bar looks like a rendering
 *      bug. With gridlines at 10/20/30/40 Wh, the same sliver reads as data, and the 133x
 *      gap becomes the point instead of looking broken. This single addition is the
 *      difference between "chart" and "two rectangles".
 *   2. DIMENSION. Isometric prisms (front / top / side faces) match the plate art's
 *      drafting-table language, so diagram scenes and photographic scenes feel like one
 *      film rather than two different videos cut together.
 *   3. HIERARCHY. One hero bar in accent with a glow; the rest graphite. The eye is told
 *      where to land (COMP-1).
 *   4. ANNOTATION. A ratio bracket that draws on last, stating the claim the VO makes.
 *
 * ── Motion (§5) ─────────────────────────────────────────────────────────────
 * Grid fades in → bars GROW from the baseline with 3f stagger → values count up and stop →
 * the bracket draws on. Everything lands and holds; nothing idles or loops.
 * Content starts at frame 30 (the head handle), so every cue below is offset by it.
 */

const H = 30; // head handle
const E: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Real figures. Heights are LINEAR in the value — the tiny bars are the truth, and the
// labelled axis is what makes that legible instead of looking like an error.
const DATA = [
  { value: 0.3, label: 'a short question', decimals: 1 },
  { value: 2.5, label: 'a long document', decimals: 1 },
  { value: 40, label: 'a reasoning model', decimals: 0 },
];
const MAX = 40;
const BASE_Y = 1740;
const MAX_H = 1240;
const BAR_W = 300;
const DEPTH = 120;
const XS = [1180, 1900, 2620];
const DX = DEPTH * 0.87;
const DY = DEPTH * 0.5;

export const Scene16: React.FC = () => {
  const frame = useCurrentFrame();

  const grid = interpolate(frame, [H, H + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...E),
  });

  const bracket = interpolate(frame, [H + 54, H + 74], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...E),
  });

  return (
    <AbsoluteFill name="Scene 16" style={{ backgroundColor: '#040E1F' }}>
      <svg width="100%" height="100%" viewBox="0 0 3840 2160">
        {/* An isometric ground plane. Without it the bars float; with it they STAND on
            something, which is the whole difference between a chart and a scene. */}
        <polygon
          points={`760,${BASE_Y} 3300,${BASE_Y} ${3300 + DX},${BASE_Y - DY} ${760 + DX},${BASE_Y - DY}`}
          fill="#0E213E"
          opacity={grid}
        />
        <line
          x1={760}
          y1={BASE_Y}
          x2={3300}
          y2={BASE_Y}
          stroke="#274064"
          strokeWidth={4}
          opacity={grid}
        />
        {/* ── the axis. Without this the small bars look like a bug ── */}
        <g opacity={grid}>
          {[0, 10, 20, 30, 40].map((tick) => {
            const y = BASE_Y - (tick / MAX) * MAX_H;
            return (
              <g key={tick}>
                <line
                  x1={900}
                  y1={y}
                  x2={3180}
                  y2={y}
                  stroke="#274064"
                  strokeWidth={tick === 0 ? 4 : 2}
                />
                <text
                  x={860}
                  y={y + 18}
                  textAnchor="end"
                  fill="#81A2C4"
                  fontFamily="IBM Plex Mono"
                  fontSize={48}
                >
                  {tick}
                </text>
              </g>
            );
          })}
          <text
            x={860}
            y={BASE_Y - MAX_H - 70}
            textAnchor="end"
            fill="#81A2C4"
            fontFamily="IBM Plex Mono"
            fontSize={44}
          >
            Wh
          </text>
        </g>

        {/* ── the bars, as isometric prisms so they share the plates' language ── */}
        {DATA.map((d, i) => {
          const start = H + 16 + i * 3;
          const grow = interpolate(frame, [start, start + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(...E),
          });
          const full = (d.value / MAX) * MAX_H;
          const h = Math.max(full, 14) * grow; // 14px floor so a sliver still has a face
          const x = XS[i];
          const y = BASE_Y - h;
          const hero = i === DATA.length - 1;
          const face = hero ? '#00D6F7' : '#274064';
          const top = hero ? '#00D6F7' : '#81A2C4';
          const side = hero ? '#00D6F7' : '#0E213E';

          const counted = interpolate(frame, [start + 6, start + 30], [0, d.value], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(...E),
          });

          return (
            <g key={d.label}>
              {hero ? (
                <rect
                  x={x - 40}
                  y={y - 40}
                  width={BAR_W + DX + 80}
                  height={h + 80}
                  fill="rgba(34, 211, 238, 0.10)"
                  opacity={grow}
                />
              ) : null}
              {/* side face */}
              <polygon
                points={`${x + BAR_W},${y} ${x + BAR_W + DX},${y - DY} ${x + BAR_W + DX},${y + h - DY} ${x + BAR_W},${y + h}`}
                fill={side}
                opacity={hero ? 0.55 : 1}
              />
              {/* top face */}
              <polygon
                points={`${x},${y} ${x + BAR_W},${y} ${x + BAR_W + DX},${y - DY} ${x + DX},${y - DY}`}
                fill={top}
                opacity={hero ? 0.85 : 0.5}
              />
              {/* front face */}
              <rect x={x} y={y} width={BAR_W} height={h} fill={face} />

              {/* the figure, in mono per §4 */}
              <text
                x={x + BAR_W / 2}
                y={y - DY - 46}
                textAnchor="middle"
                fill={hero ? '#00D6F7' : '#E8E6E1'}
                fontFamily="IBM Plex Mono"
                fontSize={hero ? 108 : 76}
                opacity={grow}
              >
                {counted.toFixed(d.decimals)}
              </text>
              <text
                x={x + BAR_W / 2 + DX / 2}
                y={BASE_Y + 76}
                textAnchor="middle"
                fill="#81A2C4"
                fontFamily="IBM Plex Sans"
                fontSize={44}
                opacity={grow}
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* ── the claim the VO makes, drawn as an annotation ── */}
        <g opacity={bracket}>
          <line x1={3260} y1={BASE_Y} x2={3260} y2={BASE_Y - MAX_H * bracket} stroke="#FFB020" strokeWidth={4} />
          <line x1={3236} y1={BASE_Y} x2={3284} y2={BASE_Y} stroke="#FFB020" strokeWidth={4} />
          <line
            x1={3236}
            y1={BASE_Y - MAX_H}
            x2={3284}
            y2={BASE_Y - MAX_H}
            stroke="#FFB020"
            strokeWidth={4}
            opacity={bracket > 0.9 ? 1 : 0}
          />
          <text
            x={3320}
            y={BASE_Y - MAX_H / 2}
            fill="#FFB020"
            fontFamily="IBM Plex Mono"
            fontSize={92}
          >
            ×133
          </text>
        </g>
      </svg>

      <Interactive.Div
        name="Caption"
        style={{
          position: 'absolute',
          left: 300,
          top: 300,
          color: '#E8E6E1',
          fontFamily: 'IBM Plex Sans',
          fontSize: 64,
          maxWidth: 1500,
          lineHeight: 1.3,
          opacity: interpolate(frame, [H + 66, H + 76], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(...E),
          }),
        }}
      >
        one hard question, on a model that thinks first
      </Interactive.Div>
    </AbsoluteFill>
  );
};
