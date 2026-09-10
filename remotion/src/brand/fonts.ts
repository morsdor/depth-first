/**
 * Depth First — font loading (brand_guide_software.md §4).
 *
 * The rule that defines the channel typographically: EVERY number, identifier,
 * timestamp and filename is set in `IBM Plex Mono`. A metric in a proportional
 * face instantly reads as a generic explainer.
 *
 * ── Why these are vendored rather than fetched (2026-09-10, r007) ───────────
 * This used to call @remotion/google-fonts, which makes the RENDERING BROWSER
 * fetch woff2 from fonts.gstatic.com. That is a network dependency inside the
 * render, and it failed hard the first time the pipeline ran somewhere with a
 * policy-controlled egress: the headless browser is not proxy-aware, so every
 * face failed to load and `remotion render` aborted with a NetworkError before
 * writing a frame.
 *
 * The five latin-subset files in public/fonts are the exact ones Google Fonts
 * was serving for these families and weights, downloaded once and committed —
 * the same "cache the network" rule the Python side of the pipeline already
 * follows. Renders are now offline and byte-identical run to run.
 *
 * The exported family NAMES are unchanged, and scene files go on hardcoding
 * 'Archivo Black' / 'IBM Plex Sans' / 'IBM Plex Mono' as style literals so
 * Studio keeps them click-editable (brand guide §11). Nothing downstream moved.
 */

import { staticFile } from 'remotion';

type Face = { family: string; weight: 400 | 600; file: string };

const FACES: Face[] = [
  // Archivo Black ships weight 400 only — its blackness is the design, not a weight.
  { family: 'Archivo Black', weight: 400, file: 'archivoblack-400.woff2' },
  { family: 'IBM Plex Sans', weight: 400, file: 'ibmplexsans-400.woff2' },
  { family: 'IBM Plex Sans', weight: 600, file: 'ibmplexsans-600.woff2' },
  { family: 'IBM Plex Mono', weight: 400, file: 'ibmplexmono-400.woff2' },
  { family: 'IBM Plex Mono', weight: 600, file: 'ibmplexmono-600.woff2' },
];

if (typeof document !== 'undefined' && !document.getElementById('df-fonts')) {
  const el = document.createElement('style');
  el.id = 'df-fonts';
  el.textContent = FACES.map(
    ({ family, weight, file }) => `@font-face{font-family:'${family}';font-style:normal;` +
      `font-weight:${weight};font-display:block;src:url('${staticFile(`fonts/${file}`)}') format('woff2');}`,
  ).join('');
  document.head.appendChild(el);
}

/** Display — wordmark, titles, thumbnail hero. */
export const displayFamily = 'Archivo Black';
/** Body/labels — 400 and 600 only. More weights is how a brand starts to blur. */
export const sansFamily = 'IBM Plex Sans';
/** Numbers, code, data. */
export const monoFamily = 'IBM Plex Mono';
