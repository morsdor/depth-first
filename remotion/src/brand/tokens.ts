/**
 * Depth First — brand tokens.  Source of truth for `brand_guide_software.md` §3/§4/§5.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE USING: these are the SPEC and the VALIDATOR, not runtime imports.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Remotion Studio can only make a style interactive — click-to-select, drag, editable
 * keyframes, edits written back to code — when every value in the `style` prop is an
 * INLINE LITERAL.  Referring to a constant (`color: COLORS.amber`) greys the control out
 * and silently costs us the exact capability the pipeline was chosen for
 * (`/remotion-interactivity`; brand guide §11; remotion-director Rule 7 — that skill was
 * archived to the `yt-longform-archive-DO_NOT_DELETE` branch on 2026-09-10; the doctrine still holds).
 *
 * So the doctrine is:
 *   • Scene + family files carry HARDCODED LITERALS in `style`.  Studio stays live.
 *   • This file is where those literals are DEFINED, documented and version-controlled.
 *   • `npm run brand:check` scans the scene files and fails on any colour or easing
 *     curve that isn't in here.
 *
 * Enforcement therefore happens at lint time rather than import time — which is strictly
 * better, because a lint catches drift that has already been written, while an import
 * only prevents it at the cost of interactivity.
 *
 * Import these tokens freely OUTSIDE of interactive `style` props: `<Composition>`
 * metadata, `defaultProps`, `calculateMetadata()`, plain non-interactive wrappers, and
 * the check script.
 */

// ── §3 Colour ───────────────────────────────────────────────────────────────

/**
 * Base palette. Ground is never pure #000 — it crushes on OLED and kills depth.
 *
 * Revised 2026-09-03. The neutrals used to be true greys (ash C=0.030, graphite
 * C=0.028, slate C=0.023 in OKLCH) which is what made short-form frames read as
 * pale: measured on real reel frames, ~90% of every frame was effectively
 * greyscale and under 2% was vivid. They now carry real chroma at the same
 * lightness, so the frame is coloured without a single element being added.
 */
export const BASE = {
  ink: '#040E1F', // ground
  slate: '#0E213E', // surfaces, panels, callout bars
  bone: '#E8E6E1', // primary text (warm off-white, never pure #FFF)
  ash: '#81A2C4', // secondary text, labels, axes
  graphite: '#274064', // rules, grid, schematic lines
  mesh: '#0D1F3C', // SHORT-FORM ONLY — the drafting grid on the reel ground (§3a)
  amber: '#FFB020', // BRAND ANCHOR — max ONE amber element per frame
} as const;

/** One accent per video, chosen by subject domain. Mirrors EA's per-civilization system. */
export const DOMAIN_ACCENT = {
  infrastructure: '#00D6F7',
  security: '#3DDF7D',
  data: '#AD88FF',
  ai: '#FFB020',
  failure: '#FF4D4D', // ONLY on the beat something breaks — decorative use destroys it
  languages: '#51A4FF',
} as const;

export type Domain = keyof typeof DOMAIN_ACCENT;

/** Every colour the brand check will accept in a scene file. */
export const ALLOWED_COLORS: readonly string[] = [
  ...Object.values(BASE),
  ...Object.values(DOMAIN_ACCENT),
  'transparent',
];

// ── §4 Typography ───────────────────────────────────────────────────────────

export const FONT = {
  display: 'Archivo Black', // wordmark, titles, thumbnail hero
  sans: 'IBM Plex Sans', // labels, callouts, body — weights 400/600 only
  mono: 'IBM Plex Mono', // EVERY number, identifier, timestamp, filename
} as const;

/** 4K sizes. Minimum on-screen text is 36px — below that it's decoration, cut it. */
export const TYPE_SCALE = {
  min: 36,
  label: 44,
  body: 56,
  callout: 72,
  headline: 168,
} as const;

// ── §5 Motion ───────────────────────────────────────────────────────────────

export const FPS = 30;
export const DIMENSIONS = { width: 3840, height: 2160 } as const;

/** Renders run 30 frames long at BOTH ends. Premiere conform is trim-only. */
export const HANDLE_FRAMES = 30;

/**
 * The only two easing curves in the brand, as cubic-bezier control points.
 * In markup write them inline: `easing: Easing.bezier(0.4, 0, 0.2, 1)`.
 * Springs are BANNED except a diagram node locking into place at damping >= 200.
 */
export const EASE = {
  standard: [0.4, 0, 0.2, 1] as const, // enters, moves, settles
  exit: [0.4, 0, 1, 1] as const, // leaves — accelerates away, never decelerates
} as const;

export const MIN_SPRING_DAMPING = 200;

/** Camera push amounts as a closed union — `number` would invite 40%. */
export type PushPercent = 0 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const CAMERA = {
  /** Default push-in, 3–5%. One move per scene, spanning its full duration. */
  push: [3, 4, 5] as const,
  /** Reveal pull-back, 6–9%. Budget 2–3 per video — it's the scale-payoff move. */
  pullBack: [6, 7, 8, 9] as const,
  /** Pan speed at 4K, px/s. Wide compositions only. */
  panPxPerSecond: { min: 40, max: 70 },
  /** Every camera move rests this long at both ends, inside the handles. */
  holdFrames: 15,
} as const;

/** Frames is the canonical unit — Remotion is frame-native. ms shown for reference. */
export const TIMING = {
  textInFrames: 8, // ~267ms fade + 12px rise
  textRisePx: 12,
  textOutFrames: 5, // ~167ms fade, no movement
  textMinOnScreenFrames: 75, // 2.5s minimum
  textClearBeforeCutFrames: 15, // 0.5s
  elementInFrames: 8, // diagram element build-on
  staggerFrames: 3, // ~100ms between siblings
  drawOnFrames: { min: 12, max: 21 }, // 400–700ms connecting lines
  counterFrames: 24, // ~800ms count-up, then STOPS — never idles
  dimOpacity: 0.35, // non-focus elements during a focus pull
  dipToBlackFrames: 9, // ~300ms, chapter boundaries only, <=4 per video
} as const;

/** Camera excluded. Enforced by review, flagged by the QA checklist. */
export const MAX_MOVING_ELEMENTS = 2;

// ── helpers (safe outside interactive style props) ───────────────────────────

/** Scene seconds → composition frames, including both handles. The ONE conversion. */
export const sceneDurationInFrames = (durationSeconds: number): number =>
  Math.round(durationSeconds * FPS) + HANDLE_FRAMES * 2;

export const secondsToFrames = (seconds: number): number => Math.round(seconds * FPS);
