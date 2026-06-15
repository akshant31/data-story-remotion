import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import type { RankingClip as T } from "../../types";
import { color, display, mono, scale, layout } from "../../theme";
import { useReveal } from "../ui/reveal";

const Row: React.FC<{
  rank: number;
  label: string;
  value?: string;
  delay: number;
}> = ({ rank, label, value, delay }) => {
  const r = useReveal(delay, 36);
  const c = scale[(rank - 1) % scale.length];
  return (
    <div
      style={{
        ...r,
        display: "flex",
        alignItems: "center",
        gap: 28,
        borderBottom: `2px solid ${color.surfaceLine}`,
        paddingBottom: 22,
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 40,
          fontWeight: 700,
          color: c,
          width: 64,
        }}
      >
        {String(rank).padStart(2, "0")}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: display,
          fontWeight: 700,
          fontSize: 52,
          color: color.text,
        }}
      >
        {label}
      </span>
      {value && (
        <span style={{ fontFamily: mono, fontSize: 38, color: color.muted }}>
          {value}
        </span>
      )}
    </div>
  );
};

export const RankingClip: React.FC<T> = ({ title, items }) => {
  const head = useReveal(0);
  const { durationInFrames } = useVideoConfig();
  // Spread the reveals across the available time so items land one by one.
  const window = Math.max(durationInFrames - 30, 30);
  const step = window / Math.max(items.length, 1) / 2;

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", padding: layout.margin, gap: 48 }}
    >
      <h2
        style={{
          ...head,
          margin: 0,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 64,
          color: color.text,
          letterSpacing: -1,
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {items.map((item, i) => (
          <Row
            key={item.label}
            rank={i + 1}
            label={item.label}
            value={item.value}
            delay={10 + i * step}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
