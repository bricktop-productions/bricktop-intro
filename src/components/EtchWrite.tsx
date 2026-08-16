// bricktop-intro/src/components/EtchWrite.tsx
// "productions" writing out letter by letter with etch/burn effect

import { useCurrentFrame, interpolate, spring } from 'remotion';
import { palette, paletteAlpha } from '../lib/palette';
import { timeline, springs, stagger, frames } from '../lib/easing';

const LETTERS = ['p', 'r', 'o', 'd', 'u', 'c', 't', 'i', 'o', 'n', 's'];
const FONT_SIZE = 56;
const LETTER_SPACING = 3; // Wide tracking for "productions"
const BASELINE_Y = 700; // Below "bricktop"

export const EtchWrite: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Overall progress of productions phase (5s - 8.5s = 3.5s = 105 frames)
  const phaseProgress = interpolate(
    frame,
    [timeline.productionsStart, timeline.productionsEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (phaseProgress <= 0) return null;

  // Center position for "productions"
  const totalWidth = LETTERS.length * (FONT_SIZE * 0.5) + (LETTERS.length - 1) * LETTER_SPACING;
  const startX = 960 - totalWidth / 2;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1920px',
        height: '1080px',
        pointerEvents: 'none',
      }}
    >
      {LETTERS.map((letter, i) => {
        const letterDelay = i * stagger.letterWrite * fps;
        const letterStartFrame = timeline.productionsStart + letterDelay;
        const letterDuration = frames(0.35, fps); // 0.35s per letter

        // Write-on progress (0 to 1)
        const writeProgress = interpolate(
          frame,
          [letterStartFrame, letterStartFrame + letterDuration],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        // Spring for organic feel
        const writeSpring = spring({
          frame: frame - letterStartFrame,
          fps,
          config: springs.write,
        });

        // Position
        const x = startX + i * (FONT_SIZE * 0.5 + LETTER_SPACING);

        // Opacity: write-on
        const opacity = interpolate(writeSpring, [0, 0.15, 1], [0, 0.3, 1]);

        // Scale: slight pop on appearance
        const scale = interpolate(writeSpring, [0, 0.3, 1], [0.8, 1.05, 1]);

        // Y offset: settle down
        const yOffset = interpolate(writeSpring, [0, 1], [8, 0]);

        // Clip path for write-on effect (left to right reveal)
        const clipWidth = `${writeProgress * 100}%`;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${BASELINE_Y + yOffset}px`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center bottom',
              opacity,
              willChange: 'transform, opacity, clip-path',
              clipPath: `inset(0 ${100 - writeProgress * 100}% 0 0)`,
              color: palette.brickCream,
              fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
              fontSize: `${FONT_SIZE}px`,
              fontWeight: 500,
              letterSpacing: `${LETTER_SPACING}px`,
              lineHeight: 1,
              textTransform: 'lowercase',
              textShadow: `
                0 0 10px ${paletteAlpha.cream10},
                0 1px 2px rgba(0,0,0,0.8)
              `,
            }}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
};