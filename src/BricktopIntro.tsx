import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, Easing, interpolate, Audio } from "remotion";

// Ease-out helpers since Remotion only provides ease-in variants
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const s = 1.70158;
  return 1 + s * Math.pow(t - 1, 3) + Math.pow(t - 1, 2);
};

/**
 * Bricktop Productions Intro — 12s production mark
 * 1920x1080, 30fps, 360 frames, transparent WebM/VP9
 */

// ============ COLOR PALETTE ============
const COLORS = {
  bg: "#1a1410",
  gold: "#ffb300",
  amber: "#ff8f00",
  orange: "#e65100",
  cream: "#fdf6e3",
} as const;

// ============ PHASE TIMING (frames) ============
// Phase 1: Particle Coalescence (0-90)       -> 0-3s
// Phase 2: "bricktop" Letter-Lock (90-180)   -> 3-6s
// Phase 3: "productions" Etch-Write (180-270)-> 6-9s
// Phase 4: Seal Underline (270-300)          -> 9-10s
// Phase 5: Hold + Slow Zoom (300-340)        -> 10-11.33s
// Phase 6: Fade to Transparent (340-360)     -> 11.33-12s

const PHASES = {
  particles: { start: 0, end: 90 },
  letterLock: { start: 90, end: 180 },
  etchWrite: { start: 180, end: 270 },
  seal: { start: 270, end: 300 },
  holdZoom: { start: 300, end: 340 },
  fadeOut: { start: 340, end: 360 },
} as const;

/* ============================================================================
 * MAIN COMPOSITION
 * ============================================================================ */
export const BricktopIntroComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // Global scale (Phase 5: slow zoom 1.0 -> 1.05)
  const scale = interpolate(
    frame,
    [PHASES.holdZoom.start, PHASES.holdZoom.end],
    [1, 1.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Global opacity (Phase 6: fade to transparent)
  const opacity = interpolate(
    frame,
    [PHASES.fadeOut.start, PHASES.fadeOut.end],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* Procedural audio stem */}
      <Audio src="public/bricktop-audio.wav" />

      {/* Visual composition */}
      <svg
        width={width}
        height={height}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          opacity,
          background: "transparent",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Phase 1: Particle Coalescence */}
        <ParticleField frame={frame} colors={COLORS} particleCount={120} />

        {/* Phase 2: "bricktop" Letter-Lock */}
        <BricktopLetterLock frame={frame} color={COLORS.gold} />

        {/* Phase 3: "productions" Etch-Write */}
        <ProductionsEtchWrite frame={frame} color={COLORS.cream} accentColor={COLORS.orange} />

        {/* Phase 4: Seal Underline */}
        <SealUnderline frame={frame} color={COLORS.gold} />
      </svg>
    </>
  );
};

/* ============================================================================
 * PHASE 1: PARTICLE COALESCENCE (0-90 frames)
 * ============================================================================ */
interface ParticleFieldProps {
  frame: number;
  colors: typeof COLORS;
  particleCount: number;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
  frame,
  colors,
  particleCount,
}) => {
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 600 + Math.random() * 400;
      const delay = Math.random() * 0.3;
      const speed = 0.8 + Math.random() * 0.4;
      const colorChoice = Math.random() < 0.5 ? colors.gold : colors.amber;
      arr.push({
        id: i,
        angle,
        radius,
        delay,
        speed,
        color: colorChoice,
        size: 2 + Math.random() * 4,
      });
    }
    return arr;
  }, [particleCount, colors.gold, colors.amber]);

  const progress = frame / PHASES.particles.end;
  if (progress <= 0 || progress >= 1) return null;

  return (
    <React.Fragment>
      {particles.map((p) => {
        const pProgress = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
        const eased = easeOutCubic(pProgress);
        const currentRadius = p.radius * (1 - eased) * p.speed;
        const x = 960 + Math.cos(p.angle) * currentRadius;
        const y = 540 + Math.sin(p.angle) * currentRadius;
        const opacity = 1 - eased;

        return (
          <circle
            key={p.id}
            cx={x}
            cy={y}
            r={p.size * (1 - eased * 0.5)}
            fill={p.color}
            opacity={opacity}
          />
        );
      })}
    </React.Fragment>
  );
};

/* ============================================================================
 * PHASE 2: "bricktop" LETTER-LOCK (90-180 frames)
 * ============================================================================ */
interface BricktopLetterLockProps {
  frame: number;
  color: string;
}

const BricktopLetterLock: React.FC<BricktopLetterLockProps> = ({
  frame,
  color,
}) => {
  const letters = "bricktop".split("");
  const letterWidth = 120;
  const totalWidth = letters.length * letterWidth;
  const startX = 960 - totalWidth / 2;

  const progress = (frame - PHASES.letterLock.start) / (PHASES.letterLock.end - PHASES.letterLock.start);
  if (progress <= 0) return null;

  return (
    <React.Fragment>
      {letters.map((letter, i) => {
        const letterDelay = i * 0.1;
        const letterProgress = Math.max(0, Math.min(1, (progress - letterDelay) / (1 - letterDelay * letters.length)));
        const eased = easeOutBack(letterProgress);
        const yOffset = (1 - eased) * 200;
        const rotation = (1 - eased) * 15;
        const scale = 0.3 + eased * 0.7;
        const opacity = eased;

        return (
          <React.Fragment key={i}>
            <text
              x={startX + i * letterWidth + letterWidth / 2}
              y={540 - yOffset}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="700"
              fontSize={110}
              opacity={opacity}
              transform={`rotate(${rotation}deg) scale(${scale})`}
              transformOrigin="center center"
            >
              {letter}
            </text>
            {/* Metallic glint */}
            {letterProgress > 0.5 && letterProgress < 0.7 && (
              <rect
                x={startX + i * letterWidth}
                y={440}
                width={letterWidth}
                height={140}
                fill="transparent"
                stroke={color}
                strokeWidth={2}
                opacity={(letterProgress - 0.5) * 5}
              />
            )}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

/* ============================================================================
 * PHASE 3: "productions" ETCH-WRITE (180-270 frames)
 * ============================================================================ */
interface ProductionsEtchWriteProps {
  frame: number;
  color: string;
  accentColor: string;
}

const ProductionsEtchWrite: React.FC<ProductionsEtchWriteProps> = ({
  frame,
  color,
  accentColor,
}) => {
  const text = "productions";
  const phaseStart = PHASES.etchWrite.start;
  const phaseEnd = PHASES.etchWrite.end;
  const progress = (frame - phaseStart) / (phaseEnd - phaseStart);
  if (progress <= 0) return null;

  const charsRevealed = Math.floor(progress * text.length);
  const currentCharProgress = (progress * text.length) % 1;

  return (
    <React.Fragment>
      {/* Etched letters */}
      <text
        x={960}
        y={680}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="400"
        fontSize={64}
        letterSpacing="4"
        opacity={Math.min(1, progress * 1.5)}
      >
        {text.slice(0, charsRevealed)}
        {charsRevealed < text.length && (
          <tspan opacity={currentCharProgress}>
            {text[charsRevealed]}
          </tspan>
        )}
      </text>

      {/* Scratch lines for etch effect */}
      {Array.from({ length: 8 }, (_, i) => {
        const scratchProgress = Math.max(0, Math.min(1, progress - i * 0.12));
        if (scratchProgress <= 0) return null;
        const y = 680 + (i - 3.5) * 8;
        const xStart = 960 - 300;
        const xEnd = 960 - 300 + scratchProgress * 600;

        return (
          <React.Fragment key={`scratch-${i}`}>
            <line
              x1={xStart}
              y1={y}
              x2={xEnd}
              y2={y}
              stroke={accentColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={scratchProgress * (1 - scratchProgress) * 4}
            />
            {/* Scratch particles */}
            <circle
              cx={xEnd}
              cy={y}
              r={2}
              fill={accentColor}
              opacity={scratchProgress * (1 - scratchProgress) * 4}
            />
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

/* ============================================================================
 * PHASE 4: SEAL UNDERLINE (270-300 frames)
 * ============================================================================ */
interface SealUnderlineProps {
  frame: number;
  color: string;
}

const SealUnderline: React.FC<SealUnderlineProps> = ({
  frame,
  color,
}) => {
  const phaseStart = PHASES.seal.start;
  const phaseEnd = PHASES.seal.end;
  const progress = (frame - phaseStart) / (phaseEnd - phaseStart);
  if (progress <= 0) return null;

  const width = 800;
  const drawnWidth = progress * width;
  const pulseProgress = Math.sin(progress * Math.PI * 4) * 0.15 + 1;

  return (
    <React.Fragment>
      {/* Main underline */}
      <line
        x1={960 - width / 2}
        y1={760}
        x2={960 - width / 2 + drawnWidth}
        y2={760}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={Math.min(1, progress * 2)}
      />

      {/* Pulse glow */}
      <line
        x1={960 - width / 2}
        y1={760}
        x2={960 - width / 2 + drawnWidth}
        y2={760}
        stroke={color}
        strokeWidth={12 * pulseProgress}
        strokeLinecap="round"
        opacity={0.15 * progress}
        filter="blur(8px)"
      />

      {/* End caps */}
      {progress > 0.9 && (
        <>
          <circle
            cx={960 - width / 2}
            cy={760}
            r={6}
            fill={color}
            opacity={progress}
          />
          <circle
            cx={960 + width / 2}
            cy={760}
            r={6}
            fill={color}
            opacity={progress}
          />
        </>
      )}
    </React.Fragment>
  );
};

export default BricktopIntroComposition;