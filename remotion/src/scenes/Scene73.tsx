import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { AmbientDrift } from '../components/AmbientDrift';

/**
 * Scene73 — hero scene, canvas-interactive tier (brand_guide_software.md §11).
 *
 * Pull-back 3 of 3, the widest move in the film: the whole chain in one continuous frame —
 * phone, datacenter, cooling towers, power station, fab, reactor — joined by glowing conductors.
 *
 * Every style value is a hardcoded literal so Studio can select, drag and keyframe each
 * element and write the edit straight back into this file. Validated by `npm run brand:check`.
 */

export const Scene73: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // §5: pull-back 9%, resting at both ends. This is a rationed move.
  const scale = interpolate(frame, [15, durationInFrames - 15], [1.09, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill name="Scene 73" style={{ backgroundColor: '#040E1F' }}>
      <Interactive.Div
        name="Plate"
        style={{
          width: '100%',
          height: '100%',
          scale,
        }}
      >
        <Img
          src={staticFile('plates/scene_73.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Interactive.Div>

      <AmbientDrift pxPerSecond={3} />
    </AbsoluteFill>
  );
};
