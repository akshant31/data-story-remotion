import React from "react";
import { AbsoluteFill } from "remotion";
import type { OutroClip as T } from "../../types";
import { color, display, body, mono, layout } from "../../theme";
import { useReveal } from "../ui/reveal";

export const OutroClip: React.FC<T> = ({ message, handle, cta }) => {
  const m = useReveal(0);
  const c = useReveal(12);
  const h = useReveal(20);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: layout.margin,
        gap: 36,
      }}
    >
      <div
        style={{
          ...m,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 88,
          lineHeight: 1.0,
          color: color.text,
          letterSpacing: -2,
          maxWidth: "90%",
        }}
      >
        {message}
      </div>
      {cta && (
        <div
          style={{
            ...c,
            fontFamily: body,
            fontSize: 40,
            color: color.muted,
          }}
        >
          {cta}
        </div>
      )}
      {handle && (
        <div
          style={{
            ...h,
            fontFamily: mono,
            fontSize: 44,
            fontWeight: 700,
            color: color.accent,
            padding: "18px 40px",
            border: `2px solid ${color.accent}`,
            borderRadius: 999,
            letterSpacing: 1,
          }}
        >
          {handle}
        </div>
      )}
    </AbsoluteFill>
  );
};
