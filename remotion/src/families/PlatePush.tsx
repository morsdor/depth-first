import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Domain, PushPercent } from '../brand/tokens';
import { AmbientDrift } from '../components/AmbientDrift';
import { SceneText } from '../components/SceneText';
import type { SceneTextItem } from '../components/SceneText';

/**
 * PlatePush — the workhorse family (brand_guide_software.md §5).
 *
 * A validated still plate given ONE camera move for the scene's full duration, plus the
 * board's text choreography and (where the board asks for it) a single ambient element.
 * 36 of this video's 77 scenes are this component plus a props row.
 *
 * ── The three moves, all from §5 ────────────────────────────────────────────
 *   push-in    3–5%   default; direction 'in'
 *   pull-back  6–9%   direction 'out'; budget 2–3 per video — the scale-payoff move
 *   pan        40–70 px/s at 4K; wide compositions only, direction persists across cuts
 *   static     push 0 — mandatory on the hardest beat of every video
 * Every move rests 15 frames at BOTH ends so the trimmed clip starts and ends still.
 *
 * ── Interactivity tier ──────────────────────────────────────────────────────
 * Families take props, and Studio can only make a style CANVAS-interactive when every value
 * in `style` is an inline literal. Props here are tunable in the Props editor (which writes
 * back to Root.tsx when defaultProps is an inline object literal); the 5–10 hero scenes are
 * written standalone in src/scenes/ for full canvas tuning instead.
 */

export type PlatePushProps = {
  /** Path under public/, e.g. "plates/scene_04.png". Omit to render the ink ground. */
  plate?: string;
  /** Scene domain — selects the accent (§3). One accent per video. */
  domain: Domain;
  /** Push-in 3–5%, pull-back 6–9%, or 0 for a static beat / when panning. */
  push: PushPercent;
  /** `in` = push in (grows), `out` = pull back (shrinks to reveal). */
  direction?: 'in' | 'out';
  /** Pan speed at 4K in px/s (40–70). When set, this replaces the scale move. */
  panPxPerSecond?: number;
  /** Which way the frame travels. Must obey continuity_registry.sides. */
  panDirection?: 'left' | 'right';
  /** The board's texts[] for this scene, timed in seconds from content start. */
  texts?: SceneTextItem[];
  /** Ambient element drift, 3–10 px/s. Counts toward the moving-element budget. */
  ambientDriftPxPerS?: number;
};

const ACCENT: Record<Domain, string> = {
  infrastructure: '#00D6F7',
  security: '#3DDF7D',
  data: '#AD88FF',
  ai: '#FFB020',
  failure: '#FF4D4D',
  languages: '#51A4FF',
};

export const PlatePush: React.FC<PlatePushProps> = ({
  plate,
  domain,
  push,
  direction = 'in',
  panPxPerSecond,
  panDirection = 'right',
  texts,
  ambientDriftPxPerS,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // §5: CAMERA.holdFrames = 15 at both ends, so Premiere's trim lands on a still frame.
  const a = 15;
  const b = durationInFrames - 15;

  const panning = Boolean(panPxPerSecond);

  // A pan must overscale by AT LEAST its own travel, or the plate edge walks into shot.
  // A fixed 1.06 is not enough: scene_03 travels 55 px/s x 12.8s = 704px, while 6% of a
  // 3840px frame is only 230px of slack. Derive it from the travel and add 4% margin.
  const travelPx = (panPxPerSecond ?? 0) * (durationInFrames / 30);
  const panScale = panning ? 1 + travelPx / 3840 + 0.04 : 1;

  const from = panning ? panScale : direction === 'in' ? 1 : 1 + push / 100;
  const to = panning ? panScale : direction === 'in' ? 1 + push / 100 : 1;

  const scale = interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    output: 'perceptual-scale',
  });

  // Travel is centred: the frame starts half a pan behind and ends half a pan ahead, so the
  // composed subject stays centred on average rather than drifting off one side.
  //
  // SIGN: film grammar — a pan RIGHT moves the CAMERA right, so the content travels LEFT
  // across the frame. Getting this backwards silently inverts continuity_registry.sides
  // (demand travels right, power returns left), which is the axis the whole board rests on.
  const signed = travelPx * (panDirection === 'left' ? 1 : -1);
  const x = interpolate(frame, [a, b], [-signed / 2, signed / 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill name="Scene" style={{ backgroundColor: '#040E1F' }}>
      {plate ? (
        <Img
          name="Plate"
          src={staticFile(plate)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            scale,
            translate: `${x}px 0px`,
          }}
        />
      ) : (
        // Placeholder ground so the board previews before plates are generated — and so a
        // plate held back by the accuracy gate is visibly un-approved rather than silently blank.
        <AbsoluteFill
          name="Plate placeholder"
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

      {ambientDriftPxPerS ? <AmbientDrift pxPerSecond={ambientDriftPxPerS} /> : null}
      {texts?.length ? <SceneText texts={texts} accent={ACCENT[domain]} /> : null}
    </AbsoluteFill>
  );
};
