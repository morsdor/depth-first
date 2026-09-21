import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Scene44 — hero scene, canvas-interactive tier (brand_guide_software.md §11).
 *
 * Pull-back 2 of 3. Ladder rung 4: one datacenter becomes a continent studded with hundreds.
 *
 * Every style value is a hardcoded literal so Studio can select, drag and keyframe each
 * element and write the edit straight back into this file. Validated by `npm run brand:check`.
 */

export const Scene44: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // §5: pull-back 8%, resting at both ends. This is a rationed move.
  const scale = interpolate(frame, [15, durationInFrames - 15], [1.08, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill name="Scene 44" style={{ backgroundColor: '#040E1F' }}>
      <Interactive.Div
        name="Plate"
        style={{
          width: '100%',
          height: '100%',
          scale,
        }}
      >
        <Img
          src={staticFile('plates/scene_44.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Interactive.Div>
    </AbsoluteFill>
  );
};
