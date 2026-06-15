/**
 * DATA STORY — brand tokens.
 * Rebrand the whole video by editing this one file.
 */

import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";

// Display face for headlines + big numbers (editorial, data-report feel).
export const display = loadArchivo().fontFamily;
// Body face for supporting copy.
export const body = loadInter().fontFamily;
// Mono utility face for labels, units, captions, the readout ticker.
export const mono = loadSpaceMono().fontFamily;

export const color = {
  bg: "#0E1116", // near-ink base
  bgGrid: "#1A1F2A", // dotted grid lines
  surface: "#171B22", // raised cards / reveal panels
  surfaceLine: "#272E3A",
  text: "#F2F4F7",
  muted: "#7C8699",
  // Signal accents. `accent` leads; the categorical scale colors chart series.
  accent: "#FF6A3D", // signal orange
  positive: "#2DD4BF", // teal — "up / good"
  negative: "#F2566F", // rose — "down / bad"
} as const;

// Categorical scale for bars, rankings, comparisons.
export const scale = [
  "#FF6A3D",
  "#5B8DEF",
  "#2DD4BF",
  "#F4B740",
  "#C084FC",
  "#F2566F",
] as const;

export const layout = {
  width: 1080,
  height: 1920,
  fps: 30,
  margin: 96, // safe-area side padding
} as const;
