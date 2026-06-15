/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │  THIS IS THE ONLY FILE YOU NEED TO EDIT FOR A NEW VIDEO.     │
 * │  Add / remove / reorder objects in the `clips` array below.  │
 * │  The total video length adjusts automatically.              │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Each object's `type` decides how it looks. Your editor will
 * autocomplete the available fields. See src/types.ts for every option.
 */

import type { Clip } from "./types";

export const BRAND = "DATA STORY";

export const clips: Clip[] = [
  {
    type: "title",
    durationInSeconds: 4,
    kicker: "DATA STORY",
    headline: "India bought\n5.1M EVs\nin 2025",
    subhead: "Here's what that actually looks like →",
  },
  {
    type: "stat",
    durationInSeconds: 4,
    eyebrow: "SOURCE: SIAM 2025",
    // Optional dimmed background video. Drop a file in public/bg/ and uncomment:
    // bg: "bg/road.mp4", bgOpacity: 0.22, bgBlur: 6,
    value: 5.1,
    suffix: "M",
    decimals: 1,
    label: "Electric vehicles sold",
    caption: "Up from 1.5M just three years ago",
    tone: "positive",
  },
  {
    type: "bars",
    durationInSeconds: 6,
    eyebrow: "MARKET SHARE",
    title: "Who's winning the 2-wheeler EV race",
    unit: "%",
    data: [
      { label: "Ola Electric", value: 29 },
      { label: "TVS", value: 21 },
      { label: "Bajaj", value: 19 },
      { label: "Ather", value: 12 },
      { label: "Others", value: 19 },
    ],
  },
  {
    type: "comparison",
    durationInSeconds: 5,
    title: "Cost per 100 km",
    left: { label: "Petrol scooter", value: 210, suffix: "₹" },
    right: { label: "Electric scooter", value: 22, suffix: "₹" },
  },
  {
    // SAME data shape as the "bars" clip above — change `type` to "bars"
    // and you get a bar chart instead. That's the only edit needed.
    type: "pie",
    durationInSeconds: 6,
    eyebrow: "EV MIX 2025",
    title: "What kind of EVs Indians buy",
    donut: true,
    data: [
      { label: "2-wheelers", value: 56 },
      { label: "3-wheelers", value: 24 },
      { label: "Cars", value: 16 },
      { label: "Buses & other", value: 4 },
    ],
  },
  {
    type: "ranking",
    durationInSeconds: 8,
    eyebrow: "TOP 5 STATES",
    title: "Where EVs are selling fastest",
    items: [
      { label: "Maharashtra", value: "1.2L" },
      { label: "Karnataka", value: "98k" },
      { label: "Tamil Nadu", value: "91k" },
      { label: "Uttar Pradesh", value: "84k" },
      { label: "Delhi", value: "77k" },
    ],
  },
  {
    type: "outro",
    durationInSeconds: 4,
    message: "Save this for your next car conversation.",
    handle: "@_datastory",
    cta: "Follow for more data stories",
  },
];
