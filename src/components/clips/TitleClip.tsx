import React from "react";
import { AbsoluteFill } from "remotion";
import type { TitleClip as T } from "../../types";
import { color, display, mono, body, layout } from "../../theme";
import { useReveal } from "../ui/reveal";

export const TitleClip: React.FC<T> = ({ kicker, headline, subhead }) => {
  const k = useReveal(0);
  const h = useReveal(6);
  const s = useReveal(16);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: layout.margin,
        gap: 28,
      }}
    >
      {kicker && (
        <div
          style={{
            ...k,
            fontFamily: mono,
            fontSize: 30,
            letterSpacing: 4,
            color: color.accent,
          }}
        >
          {kicker}
        </div>
      )}
      <h1
        style={{
          ...h,
          margin: 0,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 132,
          lineHeight: 0.98,
          color: color.text,
          whiteSpace: "pre-line",
          letterSpacing: -2,
        }}
      >
        {headline}
      </h1>
      {subhead && (
        <p
          style={{
            ...s,
            margin: 0,
            fontFamily: body,
            fontSize: 40,
            lineHeight: 1.3,
            color: color.muted,
          }}
        >
          {subhead}
        </p>
      )}
    </AbsoluteFill>
  );
};
