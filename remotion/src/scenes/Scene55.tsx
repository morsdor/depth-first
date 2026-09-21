import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Scene55 — hero scene, canvas-interactive tier (brand_guide_software.md §11).
 *
 * THE REVEAL. Three Mile Island, dead and plumeless under flat grey — the only non-night
 * plate in the video, deliberately. Pan RIGHT at the slowest sanctioned speed (§5 floor, 40 px/s):
 * the frame should feel like it barely moves.
 *
 * Every style value is a hardcoded literal so Studio can select, drag and keyframe each
 * element and write the edit straight back into this file. Validated by `npm run brand:check`.
 */

export const Scene55: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // §5: pan 40 px/s at 4K, right — direction set by continuity_registry.sides.
  const travelPx = 40 * (durationInFrames / 30);
  // Overscale must cover the travel or the plate edge enters frame (see PlatePush).
  // Sign is inverted deliberately: a pan RIGHT moves the camera right, content LEFT.
  const PAN_SCALE = 1 + Math.abs(travelPx) / 3840 + 0.04;
  const x = interpolate(frame, [15, durationInFrames - 15], [travelPx / 2, -travelPx / 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill name="Scene 55" style={{ backgroundColor: '#040E1F' }}>
      <Interactive.Div
        name="Plate"
        style={{
          width: '100%',
          height: '100%',
          scale: PAN_SCALE,
          translate: `${x}px 0px`,
        }}
      >
        <Img
          src={staticFile('plates/scene_55.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Interactive.Div>
    </AbsoluteFill>
  );
};
