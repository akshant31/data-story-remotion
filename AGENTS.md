# AGENTS.md — Data Story Remotion

This file is written for AI coding agents who need to understand and modify this project. Read this before making changes. The project language is English; all code comments and documentation are in English.

## Project overview

`data-story-remotion` is a data-driven video template for vertical (9:16) social-media Reels / Shorts. The video is built programmatically with [Remotion](https://www.remotion.dev/): a React library that renders React components to MP4/WebM/etc.

The main idea: a video is just a list of typed data clips in `src/clips.ts`. Each clip has a `type`, a `durationInSeconds`, and type-specific data fields. The `Video` component sequences those clips in a `Series`, and `ClipRenderer` maps each `type` to a dedicated React component. The total duration is computed automatically from the clips.

There are two ways to author a video:

1. **Single-video, code-first** — edit `src/clips.ts` and preview/render one video at a time.
2. **Batch, spreadsheet-driven** — fill `reels.xlsx` (or `reels-2weeks.xlsx`) and run `npm run reels` to render every reel in the sheet.

The project also supports automated voiceover generation (cloud TTS or local Kokoro), background music that auto-ducks under narration, and optional dimmed background video (b-roll) per clip.

## Technology stack

- **Runtime / language:** Node.js 18+ (tested on Node 26.0.0 / npm 11.12.1). TypeScript 5.6.3.
- **UI framework:** React 18.3.1 + JSX (via `react-jsx` transform).
- **Video framework:** Remotion 4.0.272.
  - `@remotion/cli` — studio, render, and still commands.
  - `@remotion/google-fonts` — self-hosted Google Font loaders (Archivo, Inter, SpaceMono).
- **Spreadsheet parsing:** `xlsx` 0.18.5 (used by `scripts/from-sheet.mjs` and `scripts/voiceover.mjs`).
- **Audio metadata:** `music-metadata` 10.6.0 (used by `scripts/voiceover.mjs` to measure generated audio length).
- **Optional local TTS:** Python 3 + `kokoro`, `soundfile`, `openpyxl`, `numpy` (see `scripts/voiceover_kokoro.py`).
- **Build tooling:** Remotion's bundled webpack/Rspack setup (no custom Vite/Webpack config in this repo).
- **Config:**
  - `remotion.config.ts` — Remotion CLI / render settings.
  - `tsconfig.json` — TypeScript compiler options.
  - `package.json` — dependencies and npm scripts.

## Project structure

```
.
├── package.json
├── package-lock.json
├── remotion.config.ts      # Remotion CLI / render configuration
├── tsconfig.json           # TypeScript compiler options
├── README.md               # Human-facing quick-start and examples
├── AGENTS.md               # This file
├── reels.xlsx              # BLANK spreadsheet template for batch reels
├── reels-2weeks.xlsx       # FILLED spreadsheet — ready-made reels
├── scripts/
│   ├── from-sheet.mjs      # Turns a spreadsheet into rendered MP4s
│   ├── voiceover.mjs       # Cloud TTS: generates narration audio + timing.json
│   └── voiceover_kokoro.py # Free/local TTS alternative (Kokoro)
├── public/
│   ├── bg/                 # Drop background videos here
│   ├── music/              # Drop background music tracks here
│   ├── vo/                 # Generated voiceover audio lands here
│   └── README.md           # How to add background footage
└── src/
    ├── index.ts            # Entry point: registerRoot(RemotionRoot)
    ├── Root.tsx            # Declares the Remotion <Composition> and calculateMetadata
    ├── Video.tsx           # Sequences clips + renders persistent Background + music ducking
    ├── clips.ts            # EDIT THIS for single-video code-first authoring
    ├── theme.ts            # Brand tokens: colors, fonts, layout, palette
    ├── types.ts            # TypeScript shapes for every clip type
    └── components/
        ├── ClipRenderer.tsx            # switch on clip.type → component
        ├── clips/                      # one component per clip type
        │   ├── TitleClip.tsx
        │   ├── StatClip.tsx
        │   ├── BarsClip.tsx
        │   ├── PieClip.tsx
        │   ├── ComparisonClip.tsx
        │   ├── RankingClip.tsx
        │   └── OutroClip.tsx
        └── ui/                         # shared visual primitives
            ├── AnimatedNumber.tsx
            ├── Background.tsx
            └── reveal.ts
```

## Build, development, and render commands

All commands run from the project root.

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies. |
| `npm run dev` | Opens Remotion Studio in the browser for live preview and timeline scrubbing. |
| `npm run render` | Renders `src/Video.tsx` to `out/data-story.mp4`. |
| `npm run render:still` | Renders a thumbnail at frame 15 to `out/cover.png`. |
| `npm run reels` | Parses `reels.xlsx` and renders each reel group to `out/<slug>.mp4`. |
| `npm run reels:2weeks` | Same as above, using the filled `reels-2weeks.xlsx`. |
| `npm run reels:dry` | Parses `reels.xlsx` and writes `out/props/<slug>.json` + `out/scripts/<slug>.txt` without rendering video. |
| `npm run voiceover` | Generates cloud TTS audio from `reels-2weeks.xlsx` to `public/vo/<slug>/`. |
| `npm run voiceover:dry` | Prints the voiceover plan + character count without calling APIs. |
| `npm run upgrade` | Runs `remotion upgrade` to bump Remotion packages. |
| `npm run typecheck` | Runs `tsc --noEmit` to validate TypeScript without emitting files. |

### Direct script invocations

```bash
node scripts/from-sheet.mjs reels.xlsx
node scripts/from-sheet.mjs reels-2weeks.xlsx
node scripts/from-sheet.mjs reels.xlsx --dry
node scripts/from-sheet.mjs reels.xlsx --cover   # also render a cover.png thumbnail
node scripts/from-sheet.mjs reels.xlsx --no-fit  # ignore voiceover timing when fitting durations
node scripts/from-sheet.mjs reels.xlsx --concurrency=4  # render 4 reels in parallel (default: 2)

node scripts/voiceover.mjs reels-2weeks.xlsx
node scripts/voiceover.mjs reels-2weeks.xlsx --dry
node scripts/voiceover.mjs reels-2weeks.xlsx --force

python scripts/voiceover_kokoro.py reels-2weeks.xlsx
```

### Render configuration (`remotion.config.ts`)

- `Config.setVideoImageFormat("jpeg")` — each video frame is encoded from a JPEG.
- `Config.setOverwriteOutput(true)` — existing output files are overwritten without prompting.
- `Config.setConcurrency(null)` — lets Remotion auto-pick concurrency for crisp text/charts.

## How the video is assembled

1. `src/index.ts` calls `registerRoot(RemotionRoot)`.
2. `RemotionRoot` (in `src/Root.tsx`) declares a single Remotion `Composition` with id `"Video"`.
   - `defaultProps` loads the clips and brand from `src/clips.ts`.
   - `calculateMetadata` sums each clip's `durationInSeconds * fps` to set the final duration, width, height, and fps.
3. `Video.tsx` receives `{ clips, brand, music, musicVolume }` and renders:
   - A persistent `Background` (dotted grid + corner readout + optional b-roll) for every clip.
   - A `Series` of `Series.Sequence`, one per clip, with computed `durationInFrames`.
   - `ClipRenderer` inside each sequence to render the clip-specific layout.
   - Optional reel-wide background music that loops, fades in/out, and ducks to ~45% volume while any clip's voiceover is playing.
   - Per-clip voiceover audio (`clip.vo`) when a generated timing file is present.
4. `ClipRenderer.tsx` is a typed `switch` over `clip.type`. If a new type is added to the `Clip` union but not handled here, TypeScript reports an exhaustiveness error.

## Clip types

Clips are defined in `src/types.ts` and consumed from `src/clips.ts` or generated from spreadsheet rows.

| Type | Component | Use case |
|------|-----------|----------|
| `title` | `TitleClip` | Opening hook / section title with kicker, headline, subhead. |
| `stat` | `StatClip` | One large animated number with label, caption, and optional tone. |
| `bars` | `BarsClip` | Horizontal bar chart; bars grow in with stagger. |
| `pie` | `PieClip` | Pie / donut chart; uses the same data shape as `bars`. |
| `comparison` | `ComparisonClip` | Two values side by side (left vs right). |
| `ranking` | `RankingClip` | Numbered top-N list revealed one row at a time. |
| `outro` | `OutroClip` | Closing card with message, handle, and CTA. |

Every clip extends `BaseClip`, which requires `durationInSeconds` and optionally accepts:

- `eyebrow` — small label shown in the top-left readout.
- `bg` — background video path under `public/` (e.g. `bg/city.mp4`) or an `https://` URL.
- `bgOpacity` — 0–1 visibility of the background video (default 0.2).
- `bgBlur` — blur in px (default 0).
- `bgFit` — `"cover"` (default) or `"contain"`.
- `bgGrid` — keep the dotted grid on top of the video (default false when a video is set).
- `vo` — voiceover audio for this clip: a path under `public/` or a URL.

## Theme system

All brand tokens live in `src/theme.ts`:

- `display`, `body`, `mono` — font families loaded via `@remotion/google-fonts` (Archivo, Inter, SpaceMono).
- `color` — background, surface, text, muted, accent, positive, negative.
- `scale` — categorical palette used by bars, pie, rankings, and comparisons.
- `layout` — `width` (1080), `height` (1920), `fps` (30), and `margin` (96px safe-area side padding).

Default format is vertical 9:16 at 1080×1920, 30 fps. To change format, edit `layout` in `src/theme.ts` and `Root.tsx` / `calculateMetadata` will pick it up automatically.

## Code conventions

- **Language:** TypeScript, strict mode enabled (`strict: true`). JSX uses `react-jsx` transform.
- **File naming:** PascalCase for React components (`Video.tsx`, `StatClip.tsx`), camelCase for modules (`clips.ts`, `theme.ts`, `reveal.ts`).
- **Imports:** React is imported explicitly. Remotion hooks are imported from `remotion`.
- **Styling:** Inline `style` objects only; no CSS-in-JS library and no external CSS files.
- **Absolute positioning:** Most clip components use Remotion's `AbsoluteFill` and center content with flexbox.
- **Spacing values:** Sizes and padding are hardcoded in pixels to match the 1080×1920 canvas. `layout.margin` (96px) is the standard safe-area side padding.
- **Animation timing:** Animations are driven by `useCurrentFrame()` and Remotion helpers (`spring`, `interpolate`, `useVideoConfig`). A shared `useReveal` hook in `src/components/ui/reveal.ts` provides fade/rise enter and fade exit. `ENTER_SPRING` is the single knob for entrance snappiness.
- **Number formatting:** `AnimatedNumber.tsx` counts from 0 to the target value and exposes a `formatNumber` helper for comma-separated integers with optional prefix/suffix.

## Spreadsheet batch rendering

Instead of editing `src/clips.ts`, you can drive whole videos from `reels.xlsx`.

- One row = one clip.
- One `Reel` column value = one output video.
- Rows with the same `Reel` value are grouped, in order, into `out/<slug>.mp4`.
- The script reads the `Reels` sheet; row 1 is a colored band and row 2 is the header.

### Spreadsheet columns

| Column | Used by | Meaning |
|--------|---------|---------|
| `Reel` | all | Group name; becomes the output filename slug. |
| `Type` | all | Clip type: `title`, `stat`, `bars`, `pie`, `comparison`, `ranking`, `outro`. |
| `Duration (sec)` | all | Clip length in seconds. |
| `Eyebrow` | all except `title` | Small top-left label. For `title`, this becomes the `kicker`. |
| `Title` | all | Headline / chart title / stat label / outro message. |
| `Subtitle` | `title`, `stat`, `outro` | Subhead / caption / CTA. |
| `Value` | `stat` | The number to animate. |
| `Prefix` | `stat` | e.g. `₹`, `$`. |
| `Suffix` | `stat`, `comparison` | e.g. `%`, `x`, `M`. |
| `Decimals` | `stat` | Decimal places (default 0). |
| `Tone` | `stat` | `neutral`, `positive`, or `negative`. |
| `Unit` | `bars` | Appended to value labels. |
| `Data` | `bars`, `pie`, `comparison`, `ranking` | `Label=Value; Label=Value` pairs. |
| `Donut` | `pie` | `true`/`yes`/`1` (default) or `false`/`no`/`0`. |
| `Handle` | `outro` | e.g. `@_datastory`. |
| `Music` | all (reel-wide) | Background music path or URL; first non-empty cell per reel wins. |
| `Music Vol` | all (reel-wide) | Music volume 0–1 (default 0.18). |
| `BG` | all | Background video path or URL; `none` or `-` clears a previously set background. |
| `BG Opacity` | all | 0–1 (default 0.2). |
| `BG Blur` | all | px (default 0). |
| `Narration` | all | One voiceover line per clip; written to `out/scripts/<slug>.txt` with timecodes. |

### Background persistence in spreadsheets

Set `BG` once on a reel's first row and it carries down to following rows until you change it. Type `none` to clear.

### Batch render outputs

For each unique `Reel` name:

- `out/<slug>.mp4` — the rendered video.
- `out/props/<slug>.json` — the props passed to Remotion (useful for debugging).
- `out/scripts/<slug>.txt` — a voiceover script with `[M:SS]` timecodes.
- `out/<slug>.png` — cover thumbnail, only with `--cover`.

## Voiceover pipeline

The project can generate narration audio automatically and sync it to each clip.

### Cloud TTS (`scripts/voiceover.mjs`)

Supported providers (configured via environment variables; a local `.env` file is auto-loaded):

| Provider | Env vars | Notes |
|----------|----------|-------|
| Sarvam (default) | `VO_PROVIDER=sarvam`, `SARVAM_API_KEY=...` | Indian-accent English/Hinglish. Optional `VO_LANG`, `VO_VOICE` (e.g. `shubh`), `VO_PACE`, `VO_FORMAT` (`wav`/`mp3`). |
| OpenAI | `VO_PROVIDER=openai`, `OPENAI_API_KEY=...` | Optional `VO_VOICE` (default `alloy`), `VO_MODEL`. |
| ElevenLabs | `VO_PROVIDER=elevenlabs`, `ELEVENLABS_API_KEY=...` | Optional `VO_VOICE` (default Rachel voice ID), `VO_MODEL`. |

Outputs:

```
public/vo/<slug>/01.mp3
public/vo/<slug>/02.mp3
...
public/vo/<slug>/timing.json
```

### Free/local TTS (`scripts/voiceover_kokoro.py`)

Requires Python 3 and `kokoro`, `soundfile`, `openpyxl`, `numpy`. Also needs `espeak-ng` installed system-wide. No API key; runs on CPU. Set voice with `VO_VOICE` env var (default `af_heart`).

```bash
pip install kokoro soundfile openpyxl numpy
python scripts/voiceover_kokoro.py reels-2weeks.xlsx
```

### How audio affects render timing

`scripts/from-sheet.mjs` reads `public/vo/<slug>/timing.json` when it exists. For each clip that has a matching generated audio file:

- The clip's `vo` field is set to `vo/<slug>/<file>` so `Video.tsx` plays it.
- The clip duration is **lengthened** only if the audio runs longer than its spreadsheet duration; audio never shortens a clip.
- Pass `--no-fit` to ignore audio length entirely.

### Background music

Add a reel-wide music bed via the `Music` column (path under `public/` or URL). The track loops, fades in/out, and automatically ducks to ~45% volume while voiceover is playing. Control loudness with `Music Vol` (default 0.18). Drop tracks into `public/music/`; see `public/music/README.md` for sources and vibe suggestions.

In code, the same fields are `music` and `musicVolume` on `VideoProps`; the duck amount is the `DUCK` constant in `src/Video.tsx`.

## Background video (b-roll)

Any clip can play a video behind it at low opacity.

1. Drop footage into `public/bg/` (see `public/README.md` for free sources).
2. Reference it as `bg/yourfile.mp4` in the spreadsheet `BG` column or in `src/clips.ts` as `bg: "bg/yourfile.mp4"`.
3. You can also use a direct `https://` URL.

Recommended opacity presets over the dark theme: `0.15` subtle, `0.22` balanced, `0.32` bold. Add `BG Blur: 6` for busy footage.

## Testing and validation

There is no test runner (Jest/Vitest/Playwright) configured in this project. Validation is done via:

- `npm run typecheck` — TypeScript strict checking.
- `npm run dev` — visual preview in Remotion Studio.
- `npm run render` — full render to confirm the output file is produced.
- `npm run reels:dry` — spreadsheet parsing check without the cost of rendering.
- `npm run voiceover:dry` — voiceover plan check without calling APIs.

When modifying types or components, run `npm run typecheck` first. Then open the studio to verify timing and layout visually before rendering a final video.

## Output and deployment

- `npm run render` writes to `out/data-story.mp4`.
- `npm run render:still` writes to `out/cover.png`.
- `npm run reels` / `npm run reels:2weeks` write to `out/<slug>.mp4`.
- The `out/` directory is generated at render time and is not committed (there is currently no `.gitignore`; consider adding one if source control is introduced).

Deployment is outside the scope of this template. Typical usage is to render the video locally and upload the resulting MP4 to a social platform or CMS.

## How to add or change video content

### Code-first (single video)

Edit `src/clips.ts`. Add, remove, or reorder objects in the `clips` array. Each object must match one of the clip shapes in `src/types.ts`. The editor will autocomplete fields.

Example:

```ts
{
  type: "stat",
  durationInSeconds: 3,
  eyebrow: "SOURCE: RBI 2025",
  value: 12.8,
  suffix: "%",
  decimals: 1,
  label: "Retail inflation, May",
  tone: "negative",
}
```

The `BRAND` export in the same file is the default brand line shown in the corner readout.

### Spreadsheet-first (batch videos)

Open `reels.xlsx`, fill rows on the `Reels` sheet, and run `npm run reels`. See the `Guide` sheet inside the workbook for column explanations.

## How to add a new clip type

1. Add the new interface to `src/types.ts` and include it in the `Clip` union.
2. Create a new component at `src/components/clips/MyClip.tsx`.
3. Import it in `src/components/ClipRenderer.tsx` and add a `case` to the `switch`.
   - TypeScript's exhaustiveness check on the `default` branch will force this step.
4. Add handling for the new type in `scripts/from-sheet.mjs` if you want spreadsheet support.
5. Add one or more sample clips to `src/clips.ts` to preview it.

## Security considerations

- API keys for voiceover providers are read from environment variables or an optional local `.env` file. No secrets are committed in the repo.
- All video data is static TypeScript in `src/clips.ts` or static spreadsheet data in `reels.xlsx` / `reels-2weeks.xlsx`.
- Remotion renders execute Node.js locally; only install trusted dependencies.
- The render output path `out/` is relative to the project root.
- The spreadsheet script shells out to `npx remotion render`; do not run it on untrusted `.xlsx` files.
- Kokoro runs locally and writes audio to `public/vo/`. It does not transmit data to cloud services.
