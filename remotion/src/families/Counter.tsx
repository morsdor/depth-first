import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import type { Domain } from '../brand/tokens';

/**
 * Counter — a figure that counts up, lands, and stops (brand_guide_software.md §5).
 *
 * §5 is explicit: 600–900ms count-up on EASE.standard, then it STOPS. It never idles,
 * never loops, never ticks decoratively. The number is information arriving, not motion.
 * cinematography RHYTHM-3 then wants ~1s of near-stillness after it lands — which is why
 * the count occupies the first 24 frames of the scene and nothing moves afterwards.
 *
 * Numbers are ALWAYS mono (§4) — a metric in a proportional face reads as a generic
 * explainer, and that rule is the channel's most identity-defining typographic call.
 *
 * Tier: props-editor tunable.
 */

export type CounterProps = {
  /** The final figure, e.g. 835. Counts 0 → value over 24 frames. */
  value: number;
  /** Unit suffix, e.g. " MW". Kept separate so it does not animate. */
  unit?: string;
  /** Optional line under the figure, in sans per §4. */
  caption?: string;
  domain: Domain;
  /** Decimal places — 0.3 Wh needs one, 835 MW needs none. */
  decimals?: number;
};

const ACCENT: Record<Domain, string> = {
  infrastructure: '#00D6F7',
  security: '#3DDF7D',
  data: '#AD88FF',
  ai: '#FFB020',
  failure: '#FF4D4D',
  languages: '#51A4FF',
};

export const Counter: React.FC<CounterProps> = ({
  value,
  unit = '',
  caption,
  domain,
  decimals = 0,
}) => {
  const frame = useCurrentFrame();

  // §5: TIMING.counterFrames = 24 (~800ms), started after the 30-frame head handle.
  // Clamped at both ends — it lands and holds. Never idles, never loops.
  const shown = interpolate(frame, [30, 54], [0, value], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill
      name="Scene"
      style={{
        backgroundColor: '#040E1F',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 48,
      }}
    >
      <div
        style={{
          color: ACCENT[domain],
          fontFamily: 'IBM Plex Mono',
          fontSize: 168,
          letterSpacing: '0.02em',
        }}
      >
        {shown.toFixed(decimals)}
        {unit}
      </div>

      <div style={{ width: 520, height: 3, backgroundColor: '#274064' }} />

      {caption ? (
        <div
          style={{
            color: '#81A2C4',
            fontFamily: 'IBM Plex Sans',
            fontSize: 56,
            textAlign: 'center',
            maxWidth: 1800,
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
