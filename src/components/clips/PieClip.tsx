import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import type { PieClip as T, BarDatum } from "../../types";
import { color, display, mono, scale, layout } from "../../theme";
import { useReveal } from "../ui/reveal";
import { ENTER_SPRING } from "../ui/reveal";

type Seg = BarDatum & { frac: number; start: number; color: string };

const LegendRow: React.FC<{ seg: Seg; pct: number; delay: number }> = ({
  seg,
  pct,
  delay,
}) => {
  const r = useReveal(delay, 24);
  return (
    <div style={{ ...r, display: "flex", alignItems: "center", gap: 20 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: seg.color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          flex: 1,
          fontFamily: display,
          fontWeight: 700,
          fontSize: 40,
          color: color.text,
        }}
      >
        {seg.label}
      </span>
      <span style={{ fontFamily: mono, fontSize: 36, color: color.muted }}>
        {pct}%
      </span>
    </div>
  );
};

export const PieClip: React.FC<T> = ({ title, data, donut = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = useReveal(0);

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const sweep = spring({
    frame: frame - 10,
    fps,
    config: ENTER_SPRING,
  });

  const size = 620;
  const outerR = size / 2 - 6;
  const thickness = donut ? outerR * 0.42 : outerR;
  const rPath = donut ? outerR - thickness / 2 : outerR / 2;
  const C = 2 * Math.PI * rPath;
  const center = size / 2;

  let acc = 0;
  const segs: Seg[] = data.map((d, i) => {
    const frac = d.value / total;
    const seg = {
      ...d,
      frac,
      start: acc,
      color: d.color ?? scale[i % scale.length],
    };
    acc += frac;
    return seg;
  });

  const leading = segs.reduce((a, b) => (b.value > a.value ? b : a), segs[0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: layout.margin,
        gap: 44,
      }}
    >
      <h2
        style={{
          ...head,
          margin: 0,
          alignSelf: "flex-start",
          fontFamily: display,
          fontWeight: 800,
          fontSize: 64,
          color: color.text,
          letterSpacing: -1,
        }}
      >
        {title}
      </h2>

      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {segs.map((seg, i) => {
            const visible = Math.min(
              Math.max((sweep - seg.start) / Math.max(seg.frac, 0.0001), 0),
              1
            );
            const drawn = seg.frac * C * visible;
            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={rPath}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${drawn} ${C}`}
                strokeDashoffset={-seg.start * C}
              />
            );
          })}
        </svg>

        {donut && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: 120,
                lineHeight: 0.9,
                color: leading.color,
              }}
            >
              {Math.round((leading.value / total) * 100 * Math.min(sweep, 1))}%
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 26,
                color: color.muted,
                letterSpacing: 1,
                maxWidth: 300,
                textAlign: "center",
              }}
            >
              {leading.label}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
        {segs.map((seg, i) => (
          <LegendRow
            key={i}
            seg={seg}
            pct={Math.round((seg.value / total) * 100)}
            delay={16 + i * 6}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
