import React from "react";
import { AbsoluteFill } from "remotion";
import type { ComparisonClip as T } from "../../types";
import { color, display, mono, layout } from "../../theme";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { useReveal } from "../ui/reveal";

const Side: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  accent: string;
  delay: number;
}> = ({ label, value, suffix, accent, delay }) => {
  const r = useReveal(delay, 50);
  return (
    <div
      style={{
        ...r,
        flex: 1,
        backgroundColor: color.surface,
        border: `2px solid ${color.surfaceLine}`,
        borderRadius: 32,
        padding: "56px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ fontFamily: mono, fontSize: 30, color: color.muted, letterSpacing: 1 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: 150,
          lineHeight: 0.9,
          color: accent,
          letterSpacing: -4,
        }}
      >
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
    </div>
  );
};

export const ComparisonClip: React.FC<T> = ({ title, left, right }) => {
  const head = useReveal(0);
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", padding: layout.margin, gap: 56 }}
    >
      <h2
        style={{
          ...head,
          margin: 0,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 68,
          color: color.text,
          letterSpacing: -1,
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", gap: 32, alignItems: "stretch" }}>
        <Side {...left} accent={color.negative} delay={8} />
        <Side {...right} accent={color.positive} delay={16} />
      </div>
    </AbsoluteFill>
  );
};
