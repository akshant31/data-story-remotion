# Data Story — Remotion Template

A data-driven video template for vertical (9:16) Reels / Shorts. You add
**data clips** by editing one file; the template animates and sequences them
into a finished video.

## Quick start

Requires Node 18+ ([nodejs.org](https://nodejs.org) → LTS).

```bash
npm install            # once
npm run dev            # live preview (Remotion Studio) of src/clips.ts
npm run reels:2weeks   # render the 11 ready-made reels in reels-2weeks.xlsx
```

## What's in this package

```
src/                 the video engine (one component per clip type)
reels.xlsx           BLANK template — fill it to make your own videos
reels-2weeks.xlsx    FILLED — 11 reels / 48 clips of real data, ready to render
scripts/from-sheet.mjs   turns a spreadsheet into rendered MP4s
```

Two ways to make videos: edit `src/clips.ts` by hand (great for one-offs, with
live preview), or fill a spreadsheet and batch-render (great for volume). Both
are covered below.

## What "data clips" means here

Your video is just a list of clips in [`src/clips.ts`](src/clips.ts). Each clip
is one object with a `type` and its data. The template ships with seven clip
types:

| type         | use it for                                  |
| ------------ | ------------------------------------------- |
| `title`      | opening hook / section title                |
| `stat`       | one hero number that counts up              |
| `bars`       | horizontal bar chart (top-N comparison)     |
| `pie`        | pie / donut chart (share of a whole)        |
| `comparison` | two values head to head                     |
| `ranking`    | numbered top-N list, revealed one by one    |
| `outro`      | closing card / call to action               |

The total video length is computed automatically from the clips — add or remove
clips and the timeline adjusts itself.

## Automate from a spreadsheet (batch render)

Instead of editing `src/clips.ts` by hand, you can drive whole videos from
`reels.xlsx` (included). **One row = one clip. One "Reel" name = one video.**

1. Open `reels.xlsx`, fill in rows on the **Reels** sheet (the **Guide** sheet
   explains every column; hover any header for a hint).
2. Render every reel in the sheet:

   ```bash
   npm run reels          # -> out/<reel>.mp4 for each Reel name in reels.xlsx
   npm run reels:2weeks   # same, for the ready-made reels-2weeks.xlsx
   npm run reels:dry      # parse only: writes out/props/<reel>.json, no render
   ```

Rows that share a `Reel` value are rendered, in order, into one MP4 named after
that reel. Add a `--cover` flag for thumbnails:

```bash
node scripts/from-sheet.mjs reels.xlsx --cover
```

Render multiple reels at once with `--concurrency=N` (default: 2):

```bash
node scripts/from-sheet.mjs reels-2weeks.xlsx --concurrency=4
```

### Voiceover

Each sheet has a **Narration** column — one voiceover line per clip. Every time
you run `reels` / `reels:2weeks` / `reels:dry`, a ready-to-record script is
written to `out/scripts/<reel>.txt` with timecodes, e.g.:

```
[0:00]  India just did what no cricket team ever has.
[0:03]  Their third T20 World Cup — the first nation to reach three.
```

**Auto-generate the audio** instead of recording it. The quickest path (and the
one set up by default) is **Sarvam AI** — Indian-accent voices, built for
English + Hinglish:

```bash
cp .env.example .env          # then paste your SARVAM_API_KEY into .env
npm run voiceover             # -> public/vo/<reel>/  (Bulbul v3)
npm run reels                 # audio is picked up automatically
```

`.env` is auto-loaded and gitignored. Pick a voice with `VO_VOICE` (male:
`shubh`, `aditya`, `anand`, `varun` … / female: `ritu`, `priya`, `neha`,
`simran` …), language with `VO_LANG` (`en-IN`, `hi-IN`, `ta-IN`, …), and speed
with `VO_PACE` (`0.5`–`2.0`). Lines cap at 2500 characters (yours are tiny).

**Other providers** — set `VO_PROVIDER` in `.env`: `openai` (`OPENAI_API_KEY`)
or `elevenlabs` (`ELEVENLABS_API_KEY`). Use `npm run voiceover:dry` to preview
the plan + character count without calling any API.

**Free / local route** (no key, runs on CPU):

```bash
pip install kokoro soundfile openpyxl numpy   # + espeak-ng
python scripts/voiceover_kokoro.py reels-2weeks.xlsx
npm run reels
```

How audio affects timing: generated clips carry their narration audio, and a
clip is **lengthened** only if its line runs longer than its set duration —
audio never shortens a clip, so your pacing stays. Pass `--no-fit` to ignore
audio length entirely. You can also drop a music bed into `public/` and add an
`<Audio>` in `Video.tsx` for background music.

### Background music

Add a reel-wide music bed in the **Music** column: `music/yourtrack.mp3` (one
cell per reel, or a URL). It **loops, fades in/out, and auto-ducks** to ~45%
volume while the voiceover speaks, swelling back in the gaps. Set loudness with
**Music Vol** (0.12 quiet … 0.25 present; default 0.18). Drop tracks into
`public/music/` — `public/music/README.md` lists royalty-free and AI sources and
a vibe per topic. In code the fields are `music` and `musicVolume` on the video
props; the duck amount is the `DUCK` constant in `src/Video.tsx`.

### Background video (dimmed b-roll)

Any clip can play a video behind it at low opacity — the classic Reels look.

1. Drop footage into `public/bg/` (see `public/README.md` for free sources).
2. In the sheet, set the **BG** column to `bg/yourfile.mp4` (or paste a video
   URL). Tune with **BG Opacity** (0–1) and **BG Blur** (px).

Set BG once on a reel's first row and it carries down the whole reel until you
change it (type `none` to clear). Opacity presets that read well on the dark
theme: `0.15` subtle · `0.22` balanced · `0.32` bold; add `BG Blur` 6 for busy
footage. In code, the same options are `bg`, `bgOpacity`, `bgBlur`, plus
`bgFit` (`cover`/`contain`) and `bgGrid` (keep the dotted grid on top).

The chart columns work the same as the code: `bars` and `pie` both read the
`Data` column (`Label=Value; Label=Value`), so switching a row between them is
just changing its `Type`.

## Run it in the browser preview (single video)

`npm run dev` previews whatever is in `src/clips.ts`. The spreadsheet path
(`npm run reels`) renders straight to file and doesn't use the Studio preview —
use `dev` for designing, `reels` for batch output.

## Setup

Requires Node 18+.

```bash
npm install
npm run dev        # opens Remotion Studio — live preview + scrubbing
```

Studio opens in your browser. Edit `src/clips.ts` and the preview hot-reloads.

## Render to a file

```bash
npm run render            # -> out/data-story.mp4
npm run render:still      # -> out/cover.png  (a thumbnail frame)
```

## Add your own clip

Open `src/clips.ts` and drop a new object into the `clips` array, e.g.:

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
},
```

Your editor autocompletes every field. All shapes live in
[`src/types.ts`](src/types.ts).

## Rebrand in one place

Colors, fonts, and the categorical chart palette are all in
[`src/theme.ts`](src/theme.ts). Change them once and the whole video updates.

## Change the format

In `src/theme.ts`, edit `layout`:

- Square (feed): `width: 1080, height: 1080`
- Landscape (YouTube): `width: 1920, height: 1080`
- fps: `30` (default) or `60`

## Pacing (how fast it feels)

Two knobs:

- **Clip length** — the `Duration (sec)` column (or `durationInSeconds` in
  code). Longer = more time to read. Defaults: title/stat 4s, bars/pie 6s,
  comparison 5s, ranking 8s, outro 4s.
- **Entrance feel** — `ENTER_SPRING` in `src/components/ui/reveal.ts`. Raise
  `mass` for slower, calmer settling; lower it for snappier motion.

## Project map

```
src/
  clips.ts          ← EDIT THIS to build a video
  theme.ts          ← brand tokens (colors / fonts / size)
  types.ts          ← clip data shapes
  Root.tsx          ← registers the composition, auto-computes duration
  Video.tsx         ← sequences clips + persistent background
  components/
    ClipRenderer.tsx ← maps clip.type → component
    clips/*          ← one component per clip type
    ui/*            ← shared animation + number helpers
```

## Add a brand-new clip type

1. Add its shape to `src/types.ts` and include it in the `Clip` union.
2. Create `src/components/clips/MyClip.tsx`.
3. Add a `case` for it in `src/components/ClipRenderer.tsx`
   (TypeScript will flag it as missing until you do).
