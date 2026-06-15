import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { BarsClip as T } from "../../types";
import { color, display, mono, scale, layout } from "../../theme";
import { useReveal } from "../ui/reveal";
import { ENTER_SPRING } from "../ui/reveal";
import { formatNumber } from "../ui/AnimatedNumber";

export const BarsClip: React.FC<T> = ({ title, unit = "", data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = useReveal(0);
  const max = Math.max(...data.map((d) => d.value));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: layout.margin,
        gap: 56,
      }}
    >
      <h2
        style={{
          ...head,
          margin: 0,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 64,
          color: color.text,
          lineHeight: 1.05,
          letterSpacing: -1,
        }}
      >
        {title}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {data.map((d, i) => {
          const delay = 10 + i * 8;
          const grow = spring({
            frame: frame - delay,
            fps,
            config: ENTER_SPRING,
          });
          const widthPct = (d.value / max) * 100 * grow;
          const labelOpacity = interpolate(grow, [0.2, 1], [0, 1], {
            extrapolateLeft: "clamp",
          });
          const c = d.color ?? scale[i % scale.length];

          return (
            <div key={d.label} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: mono,
                }}
              >
                <span style={{ fontSize: 34, color: color.text, letterSpacing: 0.5 }}>
                  {d.label}
                </span>
                <span
                  style={{
                    fontSize: 38,
                    fontWeight: 700,
                    color: c,
                    opacity: labelOpacity,
                  }}
                >
                  {formatNumber(d.value * grow, 0)}
                  {unit}
                </span>
              </div>
              <div
                style={{
                  height: 28,
                  width: "100%",
                  borderRadius: 14,
                  backgroundColor: color.surface,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${widthPct}%`,
                    borderRadius: 14,
                    background: `linear-gradient(90deg, ${c}AA, ${c})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
