import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { DOMAIN_ACCENT } from '../brand/tokens';
import { CITY_WIN, HL, INDIA_WIN, MID_WIN, NEIGH, STATES, WORLD } from './data/globeindia';
import { ReelGround, REEL_H, REEL_W, ease, t } from './lib/chrome';
import {
  CAM_Z,
  D_GLOBE,
  FOV,
  GlobeScene,
  dForWidthKm,
  project,
  sharpness,
  useTextures,
  type HighlightSpec,
  type HighlightState,
  type Layer,
  type PatchSpec,
  type Pose,
} from './lib/globe';

/**
 * Globe probe, India edition — NOT a reel. Globe -> India -> Delhi -> Uttar Pradesh -> Karnataka -> Mumbai -> Indore ->
 * Madhya Pradesh, on real satellite imagery, with each border drawing itself and a fact over it. Built on lib/globe.tsx.
 * Prepared by scripts/globe_probe/prep_india.py; see scripts/globe_probe/README.md.
 *
 * ── Imagery ─────────────────────────────────────────────────────────────────
 *   globe    NASA Blue Marble NG, Dec 2004   5400x2700 whole Earth                 15 px/deg
 *   india    the same, 4x crop               lon 64..100, lat 4..38                60 px/deg   (state shots)
 *   mid      NASA GIBS MODIS Terra, 2025-03-05, lon 68..84, lat 19.5..32          150 px/deg  (fills the 150-800 km frames)
 *   cities   NASA GIBS MODIS Terra, 2025-03-05, 250 m, 3x3 degree windows        ~455 px/deg  (Delhi, Mumbai, Indore)
 * The city photos take their LOW-frequency colour from the Blue Marble beneath them (85%) and keep their own detail:
 * they are a different sensor, season and year, and an unmatched edge shows as a patch. (Per-channel mean/std matching
 * was tried first and turned Mumbai's land purple.)
 *
 * ── Borders ─────────────────────────────────────────────────────────────────
 * Country outlines are Natural Earth's INDIA-POINT-OF-VIEW set. Checked on the file (2026-10-06): Gilgit, Muzaffarabad,
 * Aksai Chin, Leh, Srinagar and Tawang all fall inside India's polygon and no other feature owns them; the two excluded
 * state names match the states file exactly. So India's outline carries India's claimed territory. The
 * de facto states file is used for states, and its Jammu & Kashmir and Ladakh units are not drawn. Delhi, Uttar Pradesh,
 * Karnataka, Madhya Pradesh: Natural Earth 1:10m admin-1. Mumbai (Mumbai City + Mumbai Suburban districts, merged) and
 * Indore (the DISTRICT — OpenStreetMap has no municipal-corporation boundary): OpenStreetMap, ODbL, so
 * "© OpenStreetMap contributors" is on the card. Natural Earth's Delhi polygon is 40 points, coarse at a 125 km frame.
 *
 * ── Facts on the cards (checked by search 2026-10-06; secondary sources — recheck the primary before a real reel) ──
 *   Delhi          16.78 M people, 11,320 per km² — Census of India 2011 (Delhi Planning Dept.)
 *   Uttar Pradesh  199,812,341 — Census of India 2011
 *   Karnataka      ~70% of India's coffee, 245,500 t in 2023-24 — Coffee Board of India
 *   Mumbai         BSE established 9 July 1875, Asia's oldest stock exchange — BSE / Wikipedia
 *   Indore         No. 1 in Swachh Survekshan every year 2017-2023 = 7 years (2023 shared with Surat). NOT "8 years": in
 *                  2024-25 the ministry moved Indore into a new Super Swachh League and named Ahmedabad the cleanest big
 *                  city, although much of the press still says "eighth year". The first draft of this card said eight.
 *   Madhya Pradesh 785 tigers, the most of any state (Karnataka 563) — NTCA, Status of Tigers 2022
 *
 * ── Findings (2026-10-06) ───────────────────────────────────────────────────
 *  WORKS  1500 frames at 1080x1920 render in ~48 s. No blank or flashed frame; motion audit 100% event density,
 *         longest dead spell 0.25 s. The raw mp4 is 99-116 MB (the detail defeats the default CRF); `ffmpeg -crf 26`
 *         takes it to ~26 MB.
 *  THE GAP  Two imagery tiers (60 and 455 px/deg) left frames 150-800 km wide with nothing sharp under them, and every
 *         zoom passed through a blur. A mid tier (150 px/deg) fixed it. Frame-wide stretch (screen px/deg over source)
 *         at the holds: Delhi x2.1 / worst x2.8, UP x0.8 / x1.8, Karnataka x2.7 / x3.2 (it stays on the Blue Marble so
 *         it is cloud-free), Mumbai x2.3 / x2.8, Indore x1.5 / x2.0, MP x0.7 / x2.2. Mid-travel the worst point at a
 *         frame edge reaches x4-4.5 for about half a second.
 *  COLOUR Per-channel mean/std matching of the satellite to the Blue Marble turned Mumbai's land PURPLE (the window is
 *         half sea, the reference is not). Taking only the LOW-frequency colour from the Blue Marble and keeping the
 *         satellite's own detail fixed it. A cloud band across Karnataka that day is why the mid tier stops at 19.5 N.
 *  COAST  Natural Earth's coast and state lines are 1:10m: at a 115 km frame they sit visibly off the real shore, so
 *         the context layers fade out below a 0.3 R camera distance (Layer.fade). Only the highlighted border is drawn
 *         at city scale, from data fine enough for it (OSM for Mumbai and Indore).
 *  DELHI  Natural Earth's Delhi is 40 points: right shape, right side of the Yamuna, crude edge. OSM relation for the
 *         NCT would be crisper — not fetched (outside the approved list).
 *  INDORE OSM has the district (3,902 km²) but no municipal-corporation boundary, so the border is the district and the
 *         card says so. The fact is about the city.
 *  NOT TESTED  Playback on a phone; whether Instagram's recompression keeps the 1-px context lines.
 *
 * The camera never moves; the group does. Poses are data (STOPS below); the border draw, fill and card times hang off
 * each place's arrive/depart time.
 */

export const DURATION_SECONDS = 50;
const FPS = 30;
const AMBER = '#FFB020';
const ACCENT = DOMAIN_ACCENT.infrastructure;

const TEXTURES = [
  'globe_probe/globe_5400.jpg',
  'globe_probe/india_patch.jpg',
  'globe_probe/mid.jpg',
  'globe_probe/city_delhi.jpg',
  'globe_probe/city_mumbai.jpg',
  'globe_probe/city_indore.jpg',
] as const;

const PATCH_META = [
  { win: INDIA_WIN, ppd: 60, feather: 2.5, step: 0.25 },
  { win: MID_WIN, ppd: 150, feather: 1.2, step: 0.1 },
  { win: CITY_WIN.delhi, ppd: 455, feather: 0.45, step: 0.02 },
  { win: CITY_WIN.mumbai, ppd: 455, feather: 0.45, step: 0.02 },
  { win: CITY_WIN.indore, ppd: 455, feather: 0.45, step: 0.02 },
] as const;

const LAYERS: Layer[] = [
  { lines: WORLD, color: '#E8E6E1', width: 1.6, opacity: 0.5, fade: [0.12, 0.3] },
  { lines: STATES, color: '#E8E6E1', width: 1.4, opacity: 0.28, fade: [0.12, 0.3] },
  { lines: NEIGH, color: '#E8E6E1', width: 2.2, opacity: 0.6, fade: [0.12, 0.3] },
];

const PLACES = ['delhi', 'up', 'karnataka', 'mumbai', 'indore', 'mp'] as const;
type PlaceId = (typeof PLACES)[number];

const HIGHLIGHTS: HighlightSpec[] = PLACES.map((id) => ({ id, rings: HL[id], color: AMBER, width: 5, fillAlpha: 0.34 }));

// ── the shots ──────────────────────────────────────────────────────────────────────────────────────────────────

const SHIFT = 270; // raises the subject so the card, which owns y 1090-1540, never covers it
const pose = (lon: number, lat: number, widthKm: number, tilt: number): Pose => ({ lon, lat, d: dForWidthKm(widthKm), tilt, shift: SHIFT });

const GLOBE0: Pose = { lon: 20, lat: 20, d: D_GLOBE, tilt: 0, shift: 0 };
const INDIA: Pose = { lon: 79.5, lat: 22.5, d: dForWidthKm(3600), tilt: 0, shift: 0 };

/** Each place: where the camera lands, and where its slow Ken Burns drift ends. Widths are the frame width in km at the looked-at point. */
const SHOT: Record<PlaceId, { a: Pose; b: Pose; peak?: number }> = {
  delhi: { a: pose(77.2, 28.62, 125, 16), b: pose(77.225, 28.62, 108, 24) },
  up: { a: pose(80.6, 26.9, 1000, 18), b: pose(81.0, 26.7, 880, 28), peak: 2600 },
  karnataka: { a: pose(75.8, 14.9, 820, 18), b: pose(76.0, 14.8, 730, 28), peak: 3200 },
  mumbai: { a: pose(72.89, 19.05, 115, 16), b: pose(72.9, 19.06, 100, 24), peak: 2000 },
  indore: { a: pose(75.85, 22.72, 170, 16), b: pose(75.86, 22.72, 150, 24), peak: 1500 },
  mp: { a: pose(78.3, 23.7, 1180, 18), b: pose(78.5, 23.6, 1050, 28) },
};

/** [arrive, depart] seconds. Travel runs from the previous depart to this arrive; the hold between is the Ken Burns. */
const AT: Record<PlaceId, [number, number]> = {
  delhi: [6.2, 9.4],
  up: [12.6, 17.6],
  karnataka: [20.8, 25.8],
  mumbai: [29.0, 33.4],
  indore: [36.4, 40.8],
  mp: [44.0, 999],
};
const INDIA_AT = 3.4;

interface Seg {
  t0: number;
  t1: number;
  from: Pose;
  to: Pose;
  peak?: number;
  travel: boolean;
}

const SEGS: Seg[] = (() => {
  const out: Seg[] = [{ t0: 0, t1: INDIA_AT, from: GLOBE0, to: INDIA, travel: true }];
  let prevT = INDIA_AT;
  let prev = INDIA;
  for (const id of PLACES) {
    const [a, d] = AT[id];
    out.push({ t0: prevT, t1: a, from: prev, to: SHOT[id].a, peak: id === 'delhi' ? undefined : SHOT[id].peak, travel: true });
    if (d < 900) out.push({ t0: a, t1: d, from: SHOT[id].a, to: SHOT[id].b, travel: false });
    else out.push({ t0: a, t1: DURATION_SECONDS, from: SHOT[id].a, to: SHOT[id].b, travel: false });
    prevT = d;
    prev = SHOT[id].b;
  }
  return out;
})();

const lerp = (a: number, b: number, e: number) => a + (b - a) * e;

export const poseAt = (s: number): Pose => {
  let seg = SEGS[SEGS.length - 1];
  for (const g of SEGS) {
    if (s < g.t1) {
      seg = g;
      break;
    }
  }
  const p = Math.min(1, Math.max(0, (s - seg.t0) / (seg.t1 - seg.t0)));
  const e = seg.travel ? interpolate(p, [0, 1], [0, 1], ease) : p; // travel eases; the Ken Burns drift is linear
  const lnA = Math.log(seg.from.d);
  const lnB = Math.log(seg.to.d);
  let ln = lerp(lnA, lnB, e);
  // a zoom OUT on the way: the frame widens to `peak` mid-travel, so the move reads as pulling back, then landing
  if (seg.peak) ln += (Math.log(dForWidthKm(seg.peak)) - (lnA + lnB) / 2) * 4 * e * (1 - e);
  return {
    lon: lerp(seg.from.lon, seg.to.lon, e),
    lat: lerp(seg.from.lat, seg.to.lat, e),
    d: Math.exp(ln),
    tilt: lerp(seg.from.tilt, seg.to.tilt, e),
    shift: lerp(seg.from.shift, seg.to.shift, e),
  };
};

const highlightStates = (s: number): Record<string, HighlightState> => {
  const out: Record<string, HighlightState> = {};
  for (const id of PLACES) {
    const [a, d] = AT[id];
    out[id] = {
      draw: interpolate(s, [a + 0.15, a + 1.7], [0, 1], ease),
      fill: interpolate(s, [a + 1.3, a + 2.5], [0, 1], ease),
      alpha: 1 - interpolate(s, [d, d + 0.9], [0, 1], ease),
    };
  }
  return out;
};

// ── the words ──────────────────────────────────────────────────────────────────────────────────────────────────

interface Card {
  tag: string;
  name: string;
  fact: string;
  source: string;
  credit?: string;
}

const OSM = '© OpenStreetMap contributors';
const CARDS: Record<PlaceId, Card> = {
  delhi: { tag: 'NATIONAL CAPITAL TERRITORY', name: 'DELHI', fact: '16.8 million people. 11,320\u00a0per\u00a0km², the densest state or territory.', source: 'Census of India 2011' },
  up: { tag: 'STATE', name: 'UTTAR PRADESH', fact: '199.8 million people, more than any other Indian state.', source: 'Census of India 2011' },
  karnataka: { tag: 'STATE', name: 'KARNATAKA', fact: 'About 70% of India’s coffee is grown here.', source: 'Coffee Board of India, 2023-24' },
  mumbai: { tag: 'CITY', name: 'MUMBAI', fact: 'Home of the BSE, Asia’s oldest stock exchange. Founded 1875.', source: 'BSE', credit: OSM },
  indore: { tag: 'CITY · DISTRICT BORDER', name: 'INDORE', fact: 'India’s cleanest city, seven years in a row.', source: 'Swachh Survekshan 2017–2023', credit: OSM },
  mp: { tag: 'STATE', name: 'MADHYA PRADESH', fact: '785 tigers, more than any other Indian state.', source: 'NTCA Status of Tigers 2022' },
};

const MARKERS: Partial<Record<PlaceId, [number, number]>> = { mumbai: [72.8777, 19.076], indore: [75.8577, 22.7196] };

const CardView: React.FC<{ card: Card; from: number; to: number }> = ({ card, from, to }) => {
  const frame = useCurrentFrame();
  const o = Math.min(interpolate(frame, [t(from), t(from + 0.6)], [0, 1], ease), interpolate(frame, [t(to - 0.5), t(to)], [1, 0], ease));
  const rise = interpolate(frame, [t(from), t(from + 0.6)], [24, 0], ease);
  if (o <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        width: 810,
        bottom: 380,
        boxSizing: 'border-box',
        padding: '22px 30px 22px 34px',
        background: 'rgba(4, 14, 31, 0.86)',
        borderLeft: '8px solid #FFB020',
        opacity: o,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: '#81A2C4', lineHeight: 1.2 }}>{card.tag}</div>
      <div style={{ fontFamily: 'Archivo Black', fontSize: card.name.length > 13 ? 64 : 76, color: '#E8E6E1', lineHeight: 1.05, letterSpacing: -1 }}>{card.name}</div>
      <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 44, color: '#E8E6E1', lineHeight: 1.25, marginTop: 8 }}>{card.fact}</div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: '#81A2C4', lineHeight: 1.3, marginTop: 14 }}>{card.source}</div>
      {card.credit && <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: '#81A2C4', lineHeight: 1.3 }}>{card.credit}</div>}
    </div>
  );
};

/** A pulsing ring pinned to a lon/lat — the city itself, inside its border. */
const Marker: React.FC<{ pose: Pose; lon: number; lat: number; from: number; to: number }> = ({ pose: p, lon, lat, from, to }) => {
  const frame = useCurrentFrame();
  const at = project(p, lon, lat);
  const o = Math.min(interpolate(frame, [t(from), t(from + 0.5)], [0, 1], ease), interpolate(frame, [t(to - 0.5), t(to)], [1, 0], ease));
  if (o <= 0.001 || !at.facing) return null;
  const ring = (phase: number) => {
    const k = ((frame / FPS) / 1.8 + phase) % 1;
    return { size: 26 + k * 110, alpha: (1 - k) * 0.9 };
  };
  return (
    <div style={{ position: 'absolute', left: at.x, top: at.y, opacity: o }}>
      {[0, 0.5].map((ph) => {
        const r = ring(ph);
        return (
          <div
            key={ph}
            style={{ position: 'absolute', width: r.size, height: r.size, left: -r.size / 2, top: -r.size / 2, borderRadius: '50%', border: '4px solid #FFB020', opacity: r.alpha, boxSizing: 'border-box' }}
          />
        );
      })}
      <div style={{ position: 'absolute', width: 26, height: 26, left: -13, top: -13, borderRadius: '50%', background: '#E8E6E1', border: '5px solid #FFB020', boxSizing: 'border-box' }} />
    </div>
  );
};

/** Sharpness at an instant, for the probe's report: screen px/deg over the source's, centre and worst over the safe area. */
export const sharpnessAt = (s: number) => sharpness(15, PATCH_META as unknown as PatchSpec[], poseAt(s));

export const GlobeIndia: React.FC<{ hud?: boolean }> = ({ hud = false }) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const tex = useTextures(TEXTURES);
  const p = poseAt(s);
  const states = highlightStates(s);
  const patches = useMemo<PatchSpec[] | null>(() => (tex ? PATCH_META.map((m, i) => ({ ...m, tex: tex[i + 1] })) : null), [tex]);

  const titleO = Math.min(interpolate(s, [0.2, 0.7], [0, 1], ease), interpolate(s, [1.3, 1.8], [1, 0], ease));
  const sh = hud ? sharpnessAt(s) : null;

  return (
    <AbsoluteFill>
      <ReelGround accent={ACCENT} />
      <AbsoluteFill>
        {tex && patches && (
          <ThreeCanvas
            width={REEL_W}
            height={REEL_H}
            flat
            camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.01, far: 20 }}
            gl={{ antialias: true, alpha: true }}
            style={{ backgroundColor: 'transparent' }}
          >
            <GlobeScene globe={tex[0]} patches={patches} pose={p} layers={LAYERS} highlights={HIGHLIGHTS} states={states} />
          </ThreeCanvas>
        )}
      </AbsoluteFill>

      {(Object.keys(MARKERS) as PlaceId[]).map((id) => (
        <Marker key={id} pose={p} lon={MARKERS[id]![0]} lat={MARKERS[id]![1]} from={AT[id][0] + 0.3} to={AT[id][1]} />
      ))}

      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 60,
          width: 960,
          textAlign: 'center',
          opacity: titleO,
          fontFamily: 'Archivo Black',
          fontSize: 72,
          lineHeight: 1.1,
          color: '#E8E6E1',
          letterSpacing: -1,
          textShadow: '0 2px 24px #040E1F, 0 0 8px #040E1F',
        }}
      >
        Six places in India.
        <br />
        One border at a time.
      </div>

      {PLACES.map((id) => (
        <CardView key={id} card={CARDS[id]} from={AT[id][0] + 0.5} to={AT[id][1]} />
      ))}

      {sh && (
        <div style={{ position: 'absolute', top: 280, left: 60, fontFamily: 'IBM Plex Mono', fontSize: 36, color: '#E8E6E1', background: 'rgba(4, 14, 31, 0.82)', padding: '6px 14px' }}>
          ×{sh.centre.toFixed(1)} centre · ×{sh.worst.up.toFixed(1)} worst
        </div>
      )}
    </AbsoluteFill>
  );
};
