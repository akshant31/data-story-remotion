# Background footage

Drop video files (.mp4 / .webm / .mov) into `public/bg/` and reference them by
the path *relative to `public/`*, e.g. a file at `public/bg/city.mp4` is used as:

- In the spreadsheet **BG** column:  `bg/city.mp4`
- In `src/clips.ts`:                 `bg: "bg/city.mp4"`

You can also paste a direct video **URL** instead of a local path.

## Options (per clip)

| control     | sheet column | code field   | default | notes                          |
| ----------- | ------------ | ------------ | ------- | ------------------------------ |
| source      | `BG`         | `bg`         | —       | `bg/file.mp4` or an https URL  |
| opacity     | `BG Opacity` | `bgOpacity`  | `0.2`   | 0–1. Lower = subtler           |
| blur        | `BG Blur`    | `bgBlur`     | `0`     | px. Try 4–10 for a soft look   |
| fit         | (code only)  | `bgFit`      | `cover` | `cover` or `contain`           |
| grid on top | (code only)  | `bgGrid`     | off     | `true` keeps the dotted grid   |

Opacity presets that read well over the dark theme: **0.15** subtle · **0.22**
balanced · **0.32** bold. Add a little blur (`BG Blur` 6) if the footage is busy.

## Royalty-free sources (no attribution / free tiers)

- Pexels Videos — pexels.com/videos
- Pixabay — pixabay.com/videos
- Mixkit — mixkit.co/free-stock-video
- Coverr — coverr.co

Pick slow, low-contrast, loop-friendly clips (textures, abstract motion,
cityscapes, stadium crowds). Avoid busy footage with on-screen text.
