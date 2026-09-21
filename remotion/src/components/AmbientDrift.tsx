import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * AmbientDrift — slow atmospheric movement over a still plate (§5 "Ambient drift", 3–10 px/s).
 *
 * ⚠ Read this before assuming more than it does. The plate is a single baked image, so the
 * vapour plume in it CANNOT be displaced independently — those pixels are welded to the
 * building behind them. This adds a soft light-veil that drifts across the upper frame, which
 * reads as air moving through the scene. It is atmosphere, not plume simulation.
 *
 * It counts as the scene's ONE secondary moving element (§5 budget: <=2 including camera),
 * which is why only the seven tower/heat scenes carry it.
 */

export type AmbientDriftProps = {
  /** 3–10 px/s per §5. Above that it stops reading as air and starts reading as a slide. */
  pxPerSecond: number;
};

export const AmbientDrift: React.FC<AmbientDriftProps> = ({ pxPerSecond }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const x = interpolate(frame, [0, durationInFrames], [0, pxPerSecond * (durationInFrames / 30)], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      name="Ambient drift"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 45% 30% at 55% 22%, rgba(232, 230, 225, 0.07), rgba(232, 230, 225, 0) 70%)',
        translate: `${x}px 0px`,
      }}
    />
  );
};
