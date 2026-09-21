import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Domain, PushPercent } from '../brand/tokens';
import { SceneText } from '../components/SceneText';
import type { SceneTextItem } from '../components/SceneText';

/**
 * PlateAnnotated — a plate scene with the drafting-table treatment.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * PlatePush gives a still a camera move and a caption. That is Rung 1, and
 * animation_upgrade.md is explicit that a bare push carries a scene for ~8 seconds and no
 * more — yet most scenes here run 9–12s. The result reads as a slideshow.
 *
 * This adds the three things that make a still feel authored, none of which need new art:
 *
 *   1. AN ANNOTATION THAT POINTS. A marker on the actual subject, a leader line that draws
 *      out to a label. It directs the eye (COMP-1) and turns a pretty picture into a
 *      technical claim about a specific thing in the frame.
 *   2. A LIGHT SWEEP. A soft raking pass that crosses once, mid-scene. It gives a flat
 *      baked image the impression of dimension and satisfies the 8-second law without a
 *      second camera move.
 *   3. FRAMING FURNITURE. A vignette to seat the subject, plus a small mono scene marker.
 *      §3 asks for "disciplined like a drafting table" — this is that discipline made
 *      visible, and it is what stops each plate reading as a stock illustration.
 *
 * All of it is free and re-renders in seconds. Tier: props-editor tunable.
 */

export type PlateAnnotatedProps = {
  plate?: string;
  domain: Domain;
  push: PushPercent;
  direction?: 'in' | 'out';
  /** Where the marker sits, as a fraction of the frame. 0,0 = top-left. */
  markerX?: number;
  markerY?: number;
  /** The claim the annotation makes about that point. */
  annotation?: string;
  /** Where the label sits relative to the marker. */
  labelSide?: 'left' | 'right';
  /** Small mono marker, bottom-left. The drafting-table stamp. */
  sceneMark?: string;
  /** How far the leader climbs before turning. Push it into the frame's empty band. */
  labelRise?: number;
  /** Set false on the mandatory static beat. */
  lightSweep?: boolean;
  /** Any remaining board callouts, beyond the one the leader line points at. */
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

export const PlateAnnotated: React.FC<PlateAnnotatedProps> = ({
  plate,
  domain,
  push,
  direction = 'in',
  markerX = 0.5,
  markerY = 0.5,
  annotation,
  labelSide = 'right',
  sceneMark,
  labelRise = 170,
  lightSweep = true,
  texts,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const accent = ACCENT[domain];

  const a = 15;
  const b = durationInFrames - 15;
  const from = direction === 'in' ? 1 : 1 + push / 100;
  const to = direction === 'in' ? 1 + push / 100 : 1;
  const scale = interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...E),
    output: 'perceptual-scale',
  });

  // The sweep crosses once, starting a beat after the scene settles. One pass only.
  const sweep = interpolate(frame, [H + 20, H + 20 + 90], [-40, 140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...E),
  });

  const dot = interpolate(frame, [H + 14, H + 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...E),
  });
  const line = interpolate(frame, [H + 20, H + 38], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...E),
  });
  const label = interpolate(frame, [H + 34, H + 42], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...E),
  });

  const mx = markerX * 3840;
  const my = markerY * 2160;
  const dir = labelSide === 'right' ? 1 : -1;
  // Clamp the leader inside the frame: a label that walks off the right edge is worse than
  // one on the less-dark side. Space beats contrast.
  const rawEnd = mx + dir * 520;
  const endX = Math.max(220, Math.min(3840 - 1240, rawEnd));
  const elbowX = mx + (endX - mx) * 0.46;
  const elbowY = my - labelRise;

  return (
    <AbsoluteFill name="Scene" style={{ backgroundColor: '#040E1F' }}>
      {plate ? (
        <Img
          name="Plate"
          src={staticFile(plate)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', scale }}
        />
      ) : (
        <AbsoluteFill
          style={{
            backgroundColor: '#0E213E',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#274064',
            fontFamily: 'IBM Plex Mono',
            fontSize: 56,
          }}
        >
          no plate
        </AbsoluteFill>
      )}

      {/* Seats the subject and stops the plate edges reading as a pasted rectangle. */}
      <AbsoluteFill
        name="Vignette"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 78% 78% at 50% 48%, rgba(11, 14, 20, 0), rgba(11, 14, 20, 0.72) 100%)',
        }}
      />

      {lightSweep ? (
        <AbsoluteFill
          name="Light sweep"
          style={{
            backgroundImage:
              'linear-gradient(102deg, rgba(232, 230, 225, 0) 42%, rgba(232, 230, 225, 0.055) 50%, rgba(232, 230, 225, 0) 58%)',
            backgroundSize: '260% 100%',
            backgroundPositionX: `${sweep}%`,
          }}
        />
      ) : null}

      {annotation ? (
        <AbsoluteFill name="Annotation">
          <svg width="100%" height="100%" viewBox="0 0 3840 2160">
            <circle cx={mx} cy={my} r={46 * dot} fill="none" stroke={accent} strokeWidth={4} opacity={0.5 * dot} />
            <circle cx={mx} cy={my} r={11 * dot} fill={accent} />
            <path
              d={`M ${mx} ${my} L ${elbowX} ${elbowY} L ${endX} ${elbowY}`}
              fill="none"
              stroke={accent}
              strokeWidth={4}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - line}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              left: labelSide === 'right' ? endX : undefined,
              right: labelSide === 'left' ? 3840 - endX : undefined,
              top: elbowY - 96,
              backgroundColor: '#0E213E',
              border: '1px solid #274064',
              borderBottom: `4px solid ${accent}`,
              borderRadius: 8,
              padding: '20px 34px',
              color: '#E8E6E1',
              fontFamily: 'IBM Plex Mono',
              fontSize: 58,
              maxWidth: 1080, // must stay under the 1240px reserved by the endX clamp
              lineHeight: 1.25,
              opacity: label,
              translate: `0px ${(1 - label) * 12}px`,
            }}
          >
            {annotation}
          </div>
        </AbsoluteFill>
      ) : null}

      {texts?.length ? <SceneText texts={texts} accent={accent} /> : null}

      {sceneMark ? (
        <AbsoluteFill style={{ alignItems: 'flex-start', justifyContent: 'flex-end', padding: 150 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: 0.75 }}>
            <div style={{ width: 60, height: 3, backgroundColor: accent }} />
            <div style={{ color: '#81A2C4', fontFamily: 'IBM Plex Mono', fontSize: 40, letterSpacing: '0.1em' }}>
              {sceneMark}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
