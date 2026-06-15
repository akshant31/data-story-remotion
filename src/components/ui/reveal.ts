import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Shared "how snappy do entrances feel" knob. Higher mass = slower, calmer
 * settle. Tune this one object to re-pace every clip's entrance at once.
 */
export const ENTER_SPRING = { damping: 200, mass: 1.1 } as const;

/**
 * Fade + rise on enter, fade on exit. Pass a frame delay to stagger items.
 */
export const useReveal = (delay = 0, riseFrom = 40) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: ENTER_SPRING,
  });

  const exit = interpolate(
    frame,
    [durationInFrames - 16, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = enter * exit;
  const translateY = interpolate(enter, [0, 1], [riseFrom, 0]);

  return { opacity, transform: `translateY(${translateY}px)` };
};
