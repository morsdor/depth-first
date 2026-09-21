/**
 * Isometric projection helpers — the geometry layer for code-built scenes.
 *
 * Everything Depth First draws in code shares one projection with the AI plates: a true
 * isometric at 30°, so a hand-built scene and a generated one cut together without the
 * viewer feeling the seam.
 *
 *   sx = (x - y) * cos30
 *   sy = (x + y) * sin30 - z
 *
 * A box returns its three visible faces as polygon point strings. Faces are drawn
 * top / left / right and shaded by a fixed light from the upper left (COMP-6), which is
 * what makes a flat SVG polygon read as a solid object.
 */

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

export type Pt = { x: number; y: number; z: number };

export const project = (p: Pt, ox = 0, oy = 0): [number, number] => [
  ox + (p.x - p.y) * COS30,
  oy + (p.x + p.y) * SIN30 - p.z,
];

const pts = (list: [number, number][]) => list.map(([x, y]) => `${x},${y}`).join(' ');

/** The three visible faces of an axis-aligned box, ready for <polygon points={…}>. */
export const isoBox = (
  o: Pt,
  w: number,
  d: number,
  h: number,
  ox = 0,
  oy = 0,
): { top: string; left: string; right: string } => {
  const P = (x: number, y: number, z: number) => project({ x, y, z }, ox, oy);
  const { x, y, z } = o;
  return {
    top: pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]),
    left: pts([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)]),
    right: pts([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)]),
  };
};
