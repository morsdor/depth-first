/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

/**
 * Required by r009 (the first 3D reel) and harmless for the 2D ones.
 *
 * Chromium's default renderer has no WebGL2 context in headless, so any
 * composition containing a <ThreeCanvas> dies with "THREE.WebGLRenderer: Error
 * creating WebGL context" and renders 0 frames. Set here rather than as a
 * `--gl=angle` flag on the render command, so a 3D reel cannot be rendered
 * wrongly by someone who copied the command out of NOTES.md.
 * https://www.remotion.dev/docs/three
 */
Config.setChromiumOpenGlRenderer("angle");
