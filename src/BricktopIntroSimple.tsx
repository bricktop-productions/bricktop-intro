import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Audio } from "remotion";

/**
 * Bricktop Productions Intro — SIMPLE version (6s)
 * 1920x1080, 30fps, 6s (180 frames), transparent WebM/VP9
 */

// ============ COLOR PALETTE ============
const COLORS = {
  bg: "#1a1410",
  gold: "#ffb300",
  cream: "#fdf6e3",
} as const;

// ============ SIMPLE TIMING (frames @ 30fps = 6s) ============
// 0-30:    "bricktop" fade in (1s)
// 30-90:   hold "bricktop" (2s)
// 90-120:  "productions" fade in below (1s)
// 120-150: hold both (1s)
// 150-180: fade out (1s)

const PHASES = {
  bricktopIn: { start: 0, end: 30 },
  bricktopHold: { start: 30, end: 90 },
  productionsIn: { start: 90, end: 120 },
  holdBoth: { start: 120, end: 150 },
  fadeOut: { start: 150, end: 180 },
} as const;

/* ============================================================================
 * MAIN COMPOSITION
 * ============================================================================ */
export const BricktopIntroSimple: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // "bricktop" opacity: 0→1 (0-30), hold 1 (30-150), 1→0 (150-180)
  const bricktopOpacity = interpolate(
    frame,
    [0, 30, 150, 180],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "productions" opacity: 0 (0-90), 0→1 (90-120), hold 1 (120-150), 1→0 (150-180)
  const productionsOpacity = interpolate(
    frame,
    [0, 90, 120, 150, 180],
    [0, 0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      <Audio src="public/bricktop-audio.wav" />

      <svg
        width={width}
        height={height}
        style={{ background: "transparent" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* "bricktop" - centered, large */}
        <text
          x={960}
          y={480}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.gold}
          fontFamily="JetBrains Mono, Courier New, monospace"
          fontWeight="700"
          fontSize={140}
          letterSpacing="8"
          opacity={bricktopOpacity}
        >
          bricktop
        </text>

        {/* "productions" - centered below, smaller */}
        <text
          x={960}
          y={620}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.cream}
          fontFamily="JetBrains Mono, Courier New, monospace"
          fontWeight="400"
          fontSize={72}
          letterSpacing="6"
          opacity={productionsOpacity}
        >
          productions
        </text>
      </svg>
    </>
  );
};

export default BricktopIntroSimple;