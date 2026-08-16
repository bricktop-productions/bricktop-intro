// bricktop-intro/src/components/SealLine.tsx
// Underline seal drawing under "bricktop" - left to right

import { useCurrentFrame, interpolate, spring } from 'remotion';
import { palette } from '../lib/palette';
import { timeline, springs, frames } from '../lib/easing';

export const SealLine: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Seal phase (8.5s - 9.5s = 1s = 30 frames)
  const sealProgress = interpolate(
    frame,
    [timeline.sealStart, timeline.sealEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (sealProgress <= 0) return null;

  // Spring for deliberate draw
  const drawSpring = spring({
    frame: frame - timeline.sealStart,
    fps,
    config: springs.seal,
  });

  // Line dimensions (matches "bricktop" width)
  const lineWidth = 520; // Approximate width of "bricktop" at 140px font
  const lineHeight = 3;
  const startX = 960 - lineWidth / 2;
  const y = 660; // Below "bricktop", above "productions"

  // Draw progress with easing
  const drawProgress = interpolate(drawSpring, [0, 1], [0, 1]);
  const currentWidth = lineWidth * drawProgress;

  // Glow intensity follows draw
  const glowOpacity = interpolate(drawProgress, [0, 0.5, 1], [0, 0.6, 0.3]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${startX}px`,
        top: `${y}px`,
        width: `${currentWidth}px`,
        height: `${lineHeight}px`,
        background: `linear-gradient(90deg, ${palette.brickOrange}, ${palette.brickGold})`,
        borderRadius: '2px',
        boxShadow: `
          0 0 ${10 * glowOpacity}px ${2 * glowOpacity}px ${palette.brickOrange},
          0 0 ${20 * glowOpacity}px ${4 * glowOpacity}px ${palette.brickAmber}
        `,
        willChange: 'width, box-shadow',
        transformOrigin: 'left center',
      }}
    />
  );
};