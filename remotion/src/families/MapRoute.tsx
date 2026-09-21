import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import type { Domain } from '../brand/tokens';
import { SceneText } from '../components/SceneText';
import type { SceneTextItem } from '../components/SceneText';

/**
 * MapRoute — a map plate with a route or flow drawn onto it (§5 "Connecting line / flow").
 *
 * §5: draw-on runs 400–700ms (12–21 frames) on EASE.standard. The terrain itself never
 * moves — only the line arrives. Per continuity_registry.maps the terrain is unlit
 * graphite and ONLY the active region carries the accent, so the eye has exactly one
 * place to go.
 *
 * Tier: props-editor tunable.
 */

export type MapRouteProps = {
  /** Optional map plate under public/. Omit for a pure code-drawn map. */
  plate?: string;
  domain: Domain;
  /** The board's texts[] for this scene, timed in seconds from content start. */
  texts?: SceneTextItem[];
  /** Draw-on length in frames, 12–21 per §5. */
  drawOnFrames?: number;
  /** Frame the draw-on begins. Default 38 = the 30-frame head handle + 8. */
  startFrame?: number;
};

const ACCENT: Record<Domain, string> = {
  infrastructure: '#00D6F7',
  security: '#3DDF7D',
  data: '#AD88FF',
  ai: '#FFB020',
  failure: '#FF4D4D',
  languages: '#51A4FF',
};

export const MapRoute: React.FC<MapRouteProps> = ({
  plate,
  domain,
  drawOnFrames = 16,
  startFrame = 38, // 30-frame head handle + 8
  texts,
}) => {
  const frame = useCurrentFrame();
  const accent = ACCENT[domain];

  // A stroke-dashoffset draw-on: the line arrives, then holds. Nothing loops.
  const progress = interpolate(frame, [startFrame, startFrame + drawOnFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill name="Scene" style={{ backgroundColor: '#040E1F' }}>
      {plate ? (
        <Img
          name="Map plate"
          src={staticFile(plate)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : null}

      <AbsoluteFill name="Route">
        <svg width="100%" height="100%" viewBox="0 0 3840 2160">
          <path
            d="M 480 1560 C 1200 1440, 1900 1180, 2560 880 S 3200 560, 3400 480"
            fill="none"
            stroke={accent}
            strokeWidth={14}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
          />
        </svg>
      </AbsoluteFill>

      {texts?.length ? <SceneText texts={texts} accent={accent} /> : null}
    </AbsoluteFill>
  );
};
