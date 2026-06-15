import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

export const formatNumber = (
  n: number,
  decimals = 0,
  prefix = "",
  suffix = ""
) => {
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${prefix}${withCommas}${decPart ? "." + decPart : ""}${suffix}`;
};

/**
 * Counts from 0 to `value` over the first ~70% of the clip, then holds.
 */
export const AnimatedNumber: React.FC<{
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ value, decimals = 0, prefix = "", suffix = "", style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [10, durationInFrames * 0.82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {formatNumber(value * progress, decimals, prefix, suffix)}
    </span>
  );
};
