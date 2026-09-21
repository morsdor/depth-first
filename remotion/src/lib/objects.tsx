import { isoBox, project } from './iso';

/**
 * Isometric object primitives — the parts bin for code-built scenes.
 *
 * ── Why these exist ─────────────────────────────────────────────────────────
 * The first pass at scene_24 drew a rack as a plain box with stripes, and it read as a
 * grey slab. An object only reads as ITSELF when it carries the two or three details a
 * viewer uses to identify it: a rack has rails, vents and status LEDs; a house has a roof
 * pitch and a lit window; a tower has a waist and a rim. Below ~120px on screen those
 * details vanish — but their SILHOUETTE and internal rhythm survive, which is what makes
 * a field of forty racks read as machines rather than as texture.
 *
 * Shading is fixed: top face lightest, left mid, right darkest (§ light from upper-left,
 * COMP-6). Every primitive takes `lit` 0–1 so a scene can bring objects to life in
 * sequence without each one owning a clock.
 */

const TOP = '#274064';
const LEFT = '#0E213E';
const RIGHT = '#040E1F';

export type IsoProps = {
  x: number;
  y: number;
  /** 0–1. Drives height reveal and how much of the accent detail is showing. */
  lit?: number;
  accent?: string;
};

/** A server rack: rails, a vented door, and a column of status LEDs. */
export const IsoRack: React.FC<
  IsoProps & { w?: number; d?: number; h?: number; leds?: number; ledProgress?: number }
> = ({
  x, y, lit = 1, accent = '#00D6F7', w = 90, d = 140, h = 200, leds = 7, ledProgress,
}) => {
  const hh = h * lit;
  const b = isoBox({ x, y, z: 0 }, w, d, hh);
  const rows = [];
  for (let i = 0; i < leds; i++) {
    // ledProgress 0–1 sweeps the LEDs on bottom-to-top, so a hero rack can boot up in
    // sequence. Omit it and the whole column simply follows `lit` — which is what a field
    // of forty racks needs, since forty independent boot sequences is noise, not motion.
    const on =
      ledProgress === undefined
        ? lit
        : Math.max(0, Math.min(1, (ledProgress * leds - i) * 1.6));
    const z = (hh / leds) * i + hh / (leds * 2);
    const [px, py] = project({ x: x + w * 0.14, y: y + d, z });
    // the LED strip, plus a dim vent line beneath it — the pair is what says "rack"
    rows.push(
      <g key={i}>
        <rect x={px} y={py - 8} width={w * 0.62} height={11} fill={accent} opacity={on * 0.92} />
        <rect x={px} y={py + 5} width={w * 0.62} height={3} fill={TOP} opacity={Math.max(on, 0.35) * 0.9} />
      </g>,
    );
  }
  const [rx, ry] = project({ x: x + w, y: y + d, z: hh });
  return (
    <g opacity={lit}>
      <polygon points={b.top} fill={TOP} />
      <polygon points={b.left} fill={LEFT} />
      <polygon points={b.right} fill={RIGHT} />
      {rows}
      {/* corner rail — reads as structure at any size */}
      <rect x={rx - 3} y={ry} width={4} height={hh * 0.98} fill={TOP} opacity={0.9 * lit} />
    </g>
  );
};

/** A house: pitched roof and one lit window. Reads at 40px. */
export const IsoHouse: React.FC<IsoProps & { w?: number; h?: number }> = ({
  x, y, lit = 1, accent = '#00D6F7', w = 165, h = 120,
}) => {
  const wall = h * 0.58;
  const b = isoBox({ x, y, z: 0 }, w, w, wall);
  const P = (px: number, py: number, pz: number) => {
    const [sx, sy] = project({ x: px, y: py, z: pz });
    return `${sx},${sy}`;
  };
  // Eave corners, then the ridge apex above the centre.
  const c1 = P(x, y, wall);           // back
  const c2 = P(x + w, y, wall);       // right-back
  const c3 = P(x + w, y + w, wall);   // front (largest x+y = nearest the viewer)
  const c4 = P(x, y + w, wall);       // left-front
  const ap = P(x + w / 2, y + w / 2, h);
  const [wx, wy] = project({ x: x + w * 0.3, y: y + w, z: wall * 0.42 });
  return (
    <g opacity={lit}>
      <polygon points={b.left} fill={LEFT} />
      <polygon points={b.right} fill={RIGHT} />
      {/* back slopes first, then the two the viewer actually sees — painter's order */}
      <polygon points={`${c1} ${c2} ${ap}`} fill={RIGHT} />
      <polygon points={`${c1} ${c4} ${ap}`} fill={RIGHT} />
      <polygon points={`${c4} ${c3} ${ap}`} fill={TOP} />
      <polygon points={`${c2} ${c3} ${ap}`} fill={LEFT} />
      <rect x={wx} y={wy - 5} width={w * 0.22} height={w * 0.15} fill={accent} opacity={lit * 0.85} />
    </g>
  );
};

/** A hyperbolic cooling tower: waisted profile, lit rim, optional vapour. */
export const IsoTower: React.FC<IsoProps & { r?: number; h?: number; vapour?: number }> = ({
  x, y, lit = 1, accent = '#00D6F7', r = 90, h = 260, vapour = 0,
}) => {
  const [bx, by] = project({ x, y, z: 0 });
  const waist = r * 0.62;
  const top = r * 0.78;
  const hh = h * lit;
  return (
    <g opacity={lit}>
      <path
        d={`M ${bx - r} ${by} C ${bx - waist} ${by - hh * 0.55}, ${bx - top} ${by - hh * 0.8}, ${bx - top} ${by - hh}
            L ${bx + top} ${by - hh} C ${bx + top} ${by - hh * 0.8}, ${bx + waist} ${by - hh * 0.55}, ${bx + r} ${by} Z`}
        fill={LEFT}
      />
      <ellipse cx={bx} cy={by - hh} rx={top} ry={top * 0.42} fill={RIGHT} stroke={accent} strokeWidth={5} opacity={lit} />
      <ellipse cx={bx} cy={by} rx={r} ry={r * 0.42} fill={RIGHT} opacity={0.55} />
      {vapour > 0 ? (
        <ellipse
          cx={bx + vapour * 26}
          cy={by - hh - top * 0.5 - vapour * 60}
          rx={top * (1 + vapour * 0.7)}
          ry={top * (0.5 + vapour * 0.45)}
          fill="#E8E6E1"
          opacity={0.16 * vapour}
        />
      ) : null}
    </g>
  );
};

/** A datacenter hall: long low block with a band of lit windows. */
export const IsoHall: React.FC<IsoProps & { w?: number; d?: number; h?: number; bays?: number }> = ({
  x, y, lit = 1, accent = '#00D6F7', w = 520, d = 260, h = 130, bays = 9,
}) => {
  const b = isoBox({ x, y, z: 0 }, w, d, h);
  const wins = [];
  for (let i = 0; i < bays; i++) {
    const [px, py] = project({ x: x + (w / bays) * i + w / (bays * 5), y: y + d, z: h * 0.34 });
    wins.push(<rect key={i} x={px} y={py} width={w / bays * 0.55} height={h * 0.26} fill={accent} opacity={lit * 0.85} />);
  }
  return (
    <g opacity={lit}>
      <polygon points={b.top} fill={TOP} />
      <polygon points={b.left} fill={LEFT} />
      <polygon points={b.right} fill={RIGHT} />
      {wins}
    </g>
  );
};
