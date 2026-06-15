# Voiceover audio

`npm run voiceover` (cloud TTS) or `python scripts/voiceover_kokoro.py` (free,
local) write generated narration here, one folder per reel:

```
public/vo/<reel>/01.mp3   02.mp3 ...   timing.json
```

`timing.json` records each clip's audio length. `npm run reels` reads it to (a)
play the right audio under each clip and (b) lengthen a clip only if its line
runs longer than its set duration — your pacing is never shortened.

Delete a reel's folder to regenerate it from scratch, or pass `--force`.
