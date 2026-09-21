import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { isoBox, project } from '../lib/iso';
import { IsoHouse, IsoRack } from '../lib/objects';

/**
 * Scene24 — "Fill a rack with trays and a hall with racks, and a single building is
 * running the power of a small town."
 *
 * ── Why this is built, not painted ──────────────────────────────────────────
 * The scene's argument IS a transformation: one thing becomes many, and the many turn out
 * to weigh as much as a town. A baked plate can only show the END of that sentence. Every
 * rack, window and house here is a real object with its own clock, so the frame performs
 * the sentence instead of illustrating its conclusion.
 *
 * ── Beats (content starts at frame 30) ──────────────────────────────────────
 *   0.0–2.0s  ONE rack, close, filling the frame. Its slots light in sequence.
 *   2.0–5.0s  It replicates outward, staggered by DISTANCE from the origin rack, so the
 *             growth reads as spreading rather than a grid switching on.
 *   5.0–7.0s  The hall floor draws beneath; the group recedes and re-centres on the grid.
 *   7.0–9.1s  A town assembles alongside at matched scale, windows lighting to the same
 *             count. The comparison lands because both halves are built the same way.
 *
 * ── The camera ──────────────────────────────────────────────────────────────
 * There is no camera. The recession is the GROUP scaling about the frame centre, and the
 * re-centring is the local origin interpolating from "first rack centred" to "grid centred".
 * Doing it this way keeps the subject anchored while the world grows around it — a real
 * camera pull would slide the subject off-frame as the grid extends to one side.
 */

const H = 30;
const E: [number, number, number, number] = [0.4, 0, 0.2, 1];
const ease = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...E) } as const;

const COLS = 8;
const ROWS = 5;
const RW = 90;
const RD = 140;
const RH = 200;
const GX = 200;
const GY = 224;

const HCOLS = 5;
const HROWS = 3;
const HW = 165;
const HD = 165;
const HH = 120;
const HGX = 300;
const HGY = 300;

const FCX = 1920;
const FCY = 1080;

export const Scene24: React.FC = () => {
  const frame = useCurrentFrame();
  const t = (s: number) => H + s * 30;

  // Sized so the subject OWNS the frame at every beat: ~40% frame height on the single
  // rack, ~80% once the hall is full, then out to 0.72 only far enough to fit the town
  // beside it. Anything smaller and the composition reads as timid.
  const zoom = interpolate(frame, [t(0), t(1.9), t(4.2), t(6.2), t(9.1)], [4.6, 2.6, 1.2, 0.74, 0.72], ease);

  // Re-centre from the first rack onto the whole grid as it fills.
  const [r0x, r0y] = project({ x: RW / 2, y: RD / 2, z: RH / 2 });
  const [gcx, gcy] = project({ x: ((COLS - 1) * GX + RW) / 2, y: ((ROWS - 1) * GY + RD) / 2, z: RH / 3 });
  const ox = -interpolate(frame, [t(1.9), t(3.4)], [r0x, gcx], ease);
  const oy = -interpolate(frame, [t(1.9), t(3.4)], [r0y, gcy], ease);

  // Slide left in the final beat to open room for the town.
  const shiftX = interpolate(frame, [t(5.5), t(7.0)], [0, -640], ease);

  const hall = interpolate(frame, [t(4.4), t(5.8)], [0, 1], ease);
  const townIn = interpolate(frame, [t(5.9), t(7.0)], [0, 1], ease);

  const racks = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const first = r === 0 && c === 0;
      const at = first ? t(0.1) : t(2.0) + Math.hypot(c, r) * 5;
      const rise = interpolate(frame, [at, at + 12], [0, 1], ease);
      if (rise <= 0) continue;
      // Only the origin rack boots slot by slot — it is the one the viewer is watching.
      const boot = first ? interpolate(frame, [t(0.5), t(1.9)], [0, 1], ease) : undefined;

      racks.push(
        <IsoRack
          key={`${r}-${c}`}
          x={c * GX}
          y={r * GY}
          w={RW}
          d={RD}
          h={RH}
          lit={rise}
          ledProgress={boot}
        />,
      );
    }
  }

  const floor = isoBox({ x: -120, y: -120, z: -14 }, (COLS - 1) * GX + RW + 240, (ROWS - 1) * GY + RD + 240, 14);

  const houses = [];
  for (let i = 0; i < HCOLS * HROWS; i++) {
    const hx = (i % HCOLS) * HGX;
    const hy = Math.floor(i / HCOLS) * HGY;
    const at = t(6.1) + i * 3.4;
    const on = interpolate(frame, [at, at + 10], [0, 1], ease);
    if (on <= 0) continue;
    houses.push(<IsoHouse key={i} x={hx} y={hy} w={HW} h={HH} lit={on} />);
  }
  const tcx = (((HCOLS - 1) * HGX + HW) / 2 - ((HROWS - 1) * HGY + HD) / 2) * 0.866;
  const tcy = (((HCOLS - 1) * HGX + HW) / 2 + ((HROWS - 1) * HGY + HD) / 2) * 0.5;

  return (
    <AbsoluteFill name="Scene 24" style={{ backgroundColor: '#040E1F' }}>
      <svg width="100%" height="100%" viewBox="0 0 3840 2160">
        {/* scale about the frame centre, then place the local origin */}
        <g transform={`translate(${FCX + shiftX} ${FCY}) scale(${zoom}) translate(${ox} ${oy})`}>
          <g opacity={hall}>
            <polygon points={floor.top} fill="#0E213E" />
            <polygon points={floor.left} fill="#040E1F" />
            <polygon points={floor.right} fill="#040E1F" />
          </g>
          {racks}
        </g>

        <g
          opacity={townIn}
          transform={`translate(${FCX + 1120} ${FCY + 40}) scale(${zoom}) translate(${-tcx} ${-tcy})`}
        >
          {houses}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 260,
          bottom: 300,
          color: '#E8E6E1',
          fontFamily: 'IBM Plex Mono',
          fontSize: 96,
          opacity: interpolate(frame, [t(2.2), t(2.7)], [0, 1], ease),
        }}
      >
        {Math.round(interpolate(frame, [t(2.2), t(4.8)], [1, COLS * ROWS], ease))} racks
      </div>
      <div
        style={{
          position: 'absolute',
          left: 260,
          bottom: 210,
          color: '#81A2C4',
          fontFamily: 'IBM Plex Sans',
          fontSize: 56,
          opacity: interpolate(frame, [t(6.6), t(7.1)], [0, 1], ease),
        }}
      >
        the electricity of a small town
      </div>
    </AbsoluteFill>
  );
};
