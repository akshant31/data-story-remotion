import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Video,
  staticFile,
} from "remotion";
import { color, mono, layout } from "../../theme";

export interface BgProps {
  /** Background video: a path under public/ ("bg/city.mp4") or a full https URL. */
  bg?: string;
  /** 0-1. How visible the video is over the dark base. Default 0.2. */
  bgOpacity?: number;
  /** Blur in px for a softer, less distracting look. Default 0. */
  bgBlur?: number;
  /** "cover" (default) fills the frame; "contain" fits the whole video. */
  bgFit?: "cover" | "contain";
  /** Keep the dotted grid on top of the video? Default false when a video is set. */
  bgGrid?: boolean;
}

/**
 * The signature element: a quiet dotted data-grid with a live readout in the
 * corner. Optionally plays a dimmed background video (b-roll) behind everything.
 */
export const Background: React.FC<
  { brand: string; index: number; total: number; eyebrow?: string } & BgProps
> = ({ brand, index, total, eyebrow, bg, bgOpacity = 0.2, bgBlur = 0, bgFit = "cover", bgGrid }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame % 240, [0, 240], [0, 24]);
  const src = bg ? (/^https?:\/\//.test(bg) ? bg : staticFile(bg)) : undefined;
  const showGrid = src ? bgGrid === true : true;

  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      {/* dimmed background video */}
      {src && (
        <>
          <AbsoluteFill style={{ opacity: bgOpacity }}>
            <Video
              src={src}
              muted
              loop
              style={{
                width: "100%",
                height: "100%",
                objectFit: bgFit,
                filter: bgBlur ? `blur(${bgBlur}px)` : undefined,
              }}
            />
          </AbsoluteFill>
          {/* scrim keeps foreground text readable over bright footage */}
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, ${color.bg}66 0%, ${color.bg}22 35%, ${color.bg}88 100%)`,
            }}
          />
        </>
      )}

      {/* dotted grid */}
      {showGrid && (
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(${color.bgGrid} 1.5px, transparent 1.5px)`,
            backgroundSize: "48px 48px",
            backgroundPosition: `${drift}px ${drift}px`,
            opacity: 0.6,
            maskImage:
              "radial-gradient(120% 80% at 50% 40%, black 55%, transparent 100%)",
          }}
        />
      )}

      {/* corner readout */}
      <div
        style={{
          position: "absolute",
          top: layout.margin * 0.55,
          left: layout.margin,
          right: layout.margin,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: mono,
          fontSize: 24,
          letterSpacing: 2,
          color: color.muted,
        }}
      >
        <span style={{ color: color.accent }}>● {brand}</span>
        <span>{eyebrow ?? `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}</span>
      </div>
    </AbsoluteFill>
  );
};
