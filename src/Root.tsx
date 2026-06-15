import React from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { Video } from "./Video";
import { clips as demoClips, BRAND } from "./clips";
import type { VideoProps } from "./types";
import { layout } from "./theme";

/**
 * Auto-computes the total video length from the clips array, so the
 * timeline always matches your data — no manual duration bookkeeping.
 */
const calculateMetadata: CalculateMetadataFunction<VideoProps> = ({
  props,
}) => {
  const totalFrames = props.clips.reduce(
    (sum, c) => sum + Math.round(c.durationInSeconds * layout.fps),
    0
  );
  return {
    durationInFrames: Math.max(totalFrames, 1),
    fps: layout.fps,
    width: layout.width,
    height: layout.height,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Video"
      component={Video}
      durationInFrames={300}
      fps={layout.fps}
      width={layout.width}
      height={layout.height}
      defaultProps={{ clips: demoClips, brand: BRAND } satisfies VideoProps}
      // To preview music in Studio, add it to defaultProps above, e.g.:
      //   { clips: demoClips, brand: BRAND, music: "music/bed.mp3", musicVolume: 0.18 }
      calculateMetadata={calculateMetadata}
    />
  );
};
