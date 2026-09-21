import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import type { Domain } from '../brand/tokens';
import { SceneText } from '../components/SceneText';
import type { SceneTextItem } from '../components/SceneText';

/**
 * Diagram — schematic scenes, built to the same standard as the hero charts.
 *
 * ── What changed and why ────────────────────────────────────────────────────
 * The first version drew flat rectangles centred on black. It was correct and it looked
 * like a placeholder, because a chart is not its bars — it is everything around them:
 *
 *   GROUND PLANE   bars STAND on something instead of floating. This is most of the
 *                  difference between "a chart" and "a scene".
 *   AXIS           optional ticks + unit. Without one, a tiny bar beside a huge one reads
 *                  as a rendering bug; with one it reads as data and the gap becomes the
 *                  point. Pass axisMax when the values share a real scale.
 *   DIMENSION      isometric prisms (front/top/side) so schematic scenes speak the same
 *                  drafting-table language as the photographic plates (§3).
 *   HIERARCHY      the last element is the hero: accent + glow, everything else graphite,
 *                  so the eye is told where to land (COMP-1).
 *
 * Motion (§5): ground and axis fade in, elements GROW from the baseline with 3-frame
 * stagger, then stop. Nothing idles, nothing loops.
 */

export type DiagramProps = {
  labels: string[];
  domain: Domain;
  /** 'bars' for magnitudes, 'row' for chains and flows. */
  layout?: 'row' | 'bars';
  /**
   * Relative heights 0–1. REQUIRED for bars — omitting them draws every bar identical,
   * which is a chart that contradicts its own labels.
   */
  weights?: number[];
  /** Top of the axis in real units. Omit for comparisons with no shared scale. */
  axisMax?: number;
  axisUnit?: string;
  texts?: SceneTextItem[];
};

const ACCENT: Record<Domain, string> = {
  infrastructure: '#00D6F7',
  security: '#3DDF7D',
  data: '#AD88FF',
  ai: '#FFB020',
  failure: '#FF4D4D',
  languages: '#51A4FF',
};

const H = 30;
const E: [number, number, number, number] = [0.4, 0, 0.2, 1];
const BASE_Y = 1700;
const MAX_H = 1180;
const DEPTH = 110;
const DX = DEPTH * 0.87;
const DY = DEPTH * 0.5;

export const Diagram: React.FC<DiagramProps> = ({
  labels,
  domain,
  layout = 'row',
  weights,
  axisMax,
  axisUnit,
  texts,
}) => {
  const frame = useCurrentFrame();
  const accent = ACCENT[domain];
  const n = Math.max(labels.length, 1);

  const ground = interpolate(frame, [H, H + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...E),
  });

  // Lay the elements out across a generous span so the frame is used, not decorated.
  const span = 2280;
  const left = 900;
  const slot = span / n;
  const barW = Math.min(300, slot * 0.52);
  const ticks = axisMax ? [0, 0.25, 0.5, 0.75, 1].map((f) => f * axisMax) : [];

  return (
    <AbsoluteFill name="Scene" style={{ backgroundColor: '#040E1F' }}>
      <svg width="100%" height="100%" viewBox="0 0 3840 2160">
        <polygon
          points={`${left - 140},${BASE_Y} ${left + span + 140},${BASE_Y} ${left + span + 140 + DX},${BASE_Y - DY} ${left - 140 + DX},${BASE_Y - DY}`}
          fill="#0E213E"
          opacity={ground}
        />
        <line
          x1={left - 140}
          y1={BASE_Y}
          x2={left + span + 140}
          y2={BASE_Y}
          stroke="#274064"
          strokeWidth={4}
          opacity={ground}
        />

        {ticks.map((t, i) => {
          const y = BASE_Y - (i / (ticks.length - 1)) * MAX_H;
          if (i === 0) return null;
          return (
            <g key={t} opacity={ground}>
              <line x1={left - 140} y1={y} x2={left + span + 140} y2={y} stroke="#274064" strokeWidth={2} />
              <text x={left - 180} y={y + 16} textAnchor="end" fill="#81A2C4" fontFamily="IBM Plex Mono" fontSize={44}>
                {t >= 1000 ? `${Math.round(t / 1000)}k` : Number(t.toFixed(1))}
              </text>
            </g>
          );
        })}
        {axisUnit ? (
          <text x={left - 180} y={BASE_Y - MAX_H - 60} textAnchor="end" fill="#81A2C4" fontFamily="IBM Plex Mono" fontSize={40} opacity={ground}>
            {axisUnit}
          </text>
        ) : null}

        {labels.map((label, i) => {
          const start = H + 16 + i * 3;
          const grow = interpolate(frame, [start, start + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(...E),
          });
          const w = weights?.[i] ?? 1;
          const full = layout === 'bars' ? Math.max(w * MAX_H, 16) : 300;
          const h = full * grow;
          const x = left + i * slot + (slot - barW) / 2;
          const y = BASE_Y - h;
          const hero = i === labels.length - 1 && labels.length > 1;

          return (
            <g key={label}>
              {hero ? (
                <rect x={x - 36} y={y - 36} width={barW + DX + 72} height={h + 72} fill="rgba(34, 211, 238, 0.10)" opacity={grow} />
              ) : null}
              <polygon
                points={`${x + barW},${y} ${x + barW + DX},${y - DY} ${x + barW + DX},${y + h - DY} ${x + barW},${y + h}`}
                fill={hero ? accent : '#0E213E'}
                opacity={hero ? 0.55 : 1}
              />
              <polygon
                points={`${x},${y} ${x + barW},${y} ${x + barW + DX},${y - DY} ${x + DX},${y - DY}`}
                fill={hero ? accent : '#81A2C4'}
                opacity={hero ? 0.85 : 0.5}
              />
              <rect x={x} y={y} width={barW} height={h} fill={hero ? accent : '#274064'} />
              <text
                x={x + barW / 2 + DX / 2}
                y={BASE_Y + 84}
                textAnchor="middle"
                fill={hero ? '#E8E6E1' : '#81A2C4'}
                fontFamily="IBM Plex Sans"
                fontSize={46}
                opacity={grow}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {texts?.length ? <SceneText texts={texts} accent={accent} /> : null}
    </AbsoluteFill>
  );
};
