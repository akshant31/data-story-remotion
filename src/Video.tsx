import React from "react";
import { AbsoluteFill, Series, Audio, staticFile, interpolate } from "remotion";
import type { VideoProps } from "./types";
import { layout } from "./theme";
import { Background } from "./components/ui/Background";
import { ClipRenderer } from "./components/ClipRenderer";

/** Music ducks to this fraction of its volume while narration is playing. */
const DUCK = 0.45;

export const Video: React.FC<VideoProps> = ({
  clips,
  brand = "DATA STORY",
  music,
  musicVolume = 0.18,
}) => {
  // Cumulative frame positions + the time ranges where voiceover is playing,
  // so the music can automatically duck under narration.
  let acc = 0;
  const voRanges: Array<[number, number]> = [];
  const frameLens = clips.map((clip) => {
    const f = Math.round(clip.durationInSeconds * layout.fps);
    if (clip.vo) voRanges.push([acc, acc + f]);
    acc += f;
    return f;
  });
  const total = acc;

  const musicSrc = music
    ? /^https?:\/\//.test(music)
      ? music
      : staticFile(music)
    : undefined;

  const musicVol = (f: number) => {
    const fadeIn = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [total - 30, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ducked = voRanges.some(([s, e]) => f >= s && f < e) ? DUCK : 1;
    return musicVolume * fadeIn * fadeOut * ducked;
  };

  return (
    <AbsoluteFill>
      {musicSrc && <Audio src={musicSrc} loop volume={musicVol} />}
      <Series>
        {clips.map((clip, i) => (
          <Series.Sequence key={i} durationInFrames={frameLens[i]}>
            <Background
              brand={brand}
              index={i}
              total={clips.length}
              eyebrow={clip.eyebrow}
              bg={clip.bg}
              bgOpacity={clip.bgOpacity}
              bgBlur={clip.bgBlur}
              bgFit={clip.bgFit}
              bgGrid={clip.bgGrid}
            />
            <ClipRenderer clip={clip} />
            {clip.vo && (
              <Audio src={/^https?:\/\//.test(clip.vo) ? clip.vo : staticFile(clip.vo)} />
            )}
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
