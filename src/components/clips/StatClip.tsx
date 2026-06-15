import React from "react";
import { AbsoluteFill } from "remotion";
import type { StatClip as T } from "../../types";
import { color, display, body, mono, layout } from "../../theme";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { useReveal } from "../ui/reveal";

export const StatClip: React.FC<T> = ({
  value,
  prefix,
  suffix,
  decimals = 0,
  label,
  caption,
  tone = "neutral",
}) => {
  const accent =
    tone === "positive"
      ? color.positive
      : tone === "negative"
        ? color.negative
        : color.accent;

  const num = useReveal(0, 60);
  const lbl = useReveal(10);
  const cap = useReveal(18);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        padding: layout.margin,
        gap: 12,
      }}
    >
      <div
        style={{
          ...num,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 280,
          lineHeight: 0.9,
          color: accent,
          letterSpacing: -6,
        }}
      >
        <AnimatedNumber
          value={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
        />
      </div>
      <div
        style={{
          ...lbl,
          fontFamily: display,
          fontWeight: 700,
          fontSize: 56,
          color: color.text,
          maxWidth: "90%",
          lineHeight: 1.05,
        }}
      >
        {label}
      </div>
      {caption && (
        <div
          style={{
            ...cap,
            fontFamily: mono,
            fontSize: 28,
            color: color.muted,
            marginTop: 12,
            letterSpacing: 1,
          }}
        >
          {caption}
        </div>
      )}
    </AbsoluteFill>
  );
};
