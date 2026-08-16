// bricktop-intro/src/components/LetterLock.tsx
// "bricktop" letters locking in from particles, one by one

import { useCurrentFrame, interpolate, spring } from 'remotion';
import { palette, paletteAlpha } from '../lib/palette';
import { timeline, springs, stagger, frames } from '../lib/easing';

const LETTERS = ['b', 'r', 'i', 'c', 'k', 't', 'o', 'p'];
const FONT_SIZE = 140;
const LETTER_SPACING = -4; // Tight tracking
const BASELINE_Y = 590; // Center-ish

export const LetterLock: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Overall progress of bricktop phase (1.5s - 5s = 3.5s = 105 frames)
  const phaseProgress = interpolate(
    frame,
    [timeline.bricktopStart, timeline.bricktopEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (phaseProgress <= 0) return null;

  // Center position for "bricktop"
  const totalWidth = LETTERS.length * (FONT_SIZE * 0.6) + (LETTERS.length - 1) * LETTER_SPACING;
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
        const letterDelay = i * stagger.letterLock * fps;
        const letterStartFrame = timeline.bricktopStart + letterDelay;
        const letterEndFrame = letterStartFrame + frames(0.5, fps); // 0.5s per letter

        // Spring animation for lock-in
        const lockSpring = spring({
          frame: frame - letterStartFrame,
          fps,
          config: springs.lock,
        });

        // Scale pop
        const popSpring = spring({
          frame: frame - letterStartFrame,
          fps,
          config: springs.pop,
        });

        // Position
        const x = startX + i * (FONT_SIZE * 0.6 + LETTER_SPACING);

        // Opacity: fade in with lock
        const opacity = interpolate(lockSpring, [0, 0.3, 1], [0, 0.5, 1]);

        // Scale: pop then settle
        const scale = interpolate(popSpring, [0, 0.5, 1], [0.3, 1.15, 1]);

        // Y offset: slight drop on lock
        const yOffset = interpolate(lockSpring, [0, 1], [20, 0]);

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
              willChange: 'transform, opacity',
              color: palette.brickGold,
              fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
              fontSize: `${FONT_SIZE}px`,
              fontWeight: 700,
              letterSpacing: `${LETTER_SPACING}px`,
              lineHeight: 1,
              textTransform: 'lowercase',
              textShadow: `
                0 0 20px ${paletteAlpha.gold40},
                0 0 40px ${paletteAlpha.gold20},
                0 2px 4px rgba(0,0,0,0.5)
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