/**
 * Clip type definitions.
 * Every entry you add to src/clips.ts must match one of these shapes,
 * so your editor will autocomplete and catch mistakes.
 */

export type Eyebrow = string; // small label above a clip, e.g. "SOURCE: WHO 2025"

export interface BaseClip {
  /** How long this clip stays on screen, in seconds. */
  durationInSeconds: number;
  /** Optional small label shown in the top-left readout. */
  eyebrow?: Eyebrow;
  /** Optional dimmed background video: a path under public/ ("bg/city.mp4") or an https URL. */
  bg?: string;
  /** 0–1, how visible the bg video is. Default 0.2. */
  bgOpacity?: number;
  /** Blur the bg video, in px. Default 0. */
  bgBlur?: number;
  /** "cover" (default) or "contain". */
  bgFit?: "cover" | "contain";
  /** Keep the dotted grid over the video? Default false when bg is set. */
  bgGrid?: boolean;
  /** Voiceover audio for this clip: a path under public/ ("vo/reel/01.mp3") or a URL. */
  vo?: string;
}

/** Opening hook / section title. */
export interface TitleClip extends BaseClip {
  type: "title";
  kicker?: string; // tiny line above the headline
  headline: string; // the big line(s)
  subhead?: string; // supporting line below
}

/** One hero number with context. Counts up on screen. */
export interface StatClip extends BaseClip {
  type: "stat";
  value: number;
  prefix?: string; // e.g. "₹", "$"
  suffix?: string; // e.g. "%", "x", "B"
  decimals?: number; // decimal places while counting
  label: string; // what the number is
  caption?: string; // extra context under the label
  tone?: "neutral" | "positive" | "negative";
}

export interface BarDatum {
  label: string;
  value: number;
  /** Optional fixed color; otherwise pulled from the categorical scale. */
  color?: string;
}

/** Horizontal bar chart. Bars grow + stagger in. */
export interface BarsClip extends BaseClip {
  type: "bars";
  title: string;
  unit?: string; // appended to value labels, e.g. "%", "M"
  data: BarDatum[];
}

/**
 * Pie / donut chart. Uses the SAME data shape as `bars`, so you can switch
 * a clip between the two by changing only its `type` field.
 */
export interface PieClip extends BaseClip {
  type: "pie";
  title: string;
  data: BarDatum[];
  /** true (default) = donut with a hole; false = solid pie. */
  donut?: boolean;
}

/** Two values head to head. */
export interface ComparisonClip extends BaseClip {
  type: "comparison";
  title: string;
  left: { label: string; value: number; suffix?: string };
  right: { label: string; value: number; suffix?: string };
}

export interface RankingItem {
  label: string;
  value?: string; // free-form, e.g. "₹1.2L cr" or "98.4"
}

/** Numbered top-N list that reveals one item at a time. */
export interface RankingClip extends BaseClip {
  type: "ranking";
  title: string;
  items: RankingItem[]; // shown in given order, 01..0N
}

/** Closing card / call to action. */
export interface OutroClip extends BaseClip {
  type: "outro";
  message: string;
  handle?: string; // e.g. "@_datastory"
  cta?: string; // e.g. "Follow for more"
}

export type Clip =
  | TitleClip
  | StatClip
  | BarsClip
  | PieClip
  | ComparisonClip
  | RankingClip
  | OutroClip;

export type VideoProps = {
  clips: Clip[];
  /** Brand line shown in the persistent corner readout. */
  brand?: string;
  /** Reel-wide background music: a path under public/ ("music/bed.mp3") or a URL. Loops + auto-ducks under narration. */
  music?: string;
  /** Music volume 0–1 (before ducking/fades). Default 0.18. */
  musicVolume?: number;
  // Required so the props satisfy Remotion's Record<string, unknown> constraint.
  [key: string]: unknown;
};
