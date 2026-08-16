// bricktop-intro/src/components/Vignette.tsx
// Subtle vignette with gentle pulse during hold

import { useCurrentFrame, interpolate } from 'remotion';
import { palette, paletteAlpha } from '../lib/palette';
import { timeline, easings } from '../lib/easing';

export const Vignette: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Pulse during hold phase (9.5s - 12s)
  const pulseProgress = interpolate(
    frame,
    [timeline.holdStart, timeline.end],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out in last 1.5s
  const fadeProgress = interpolate(
    frame,
    [timeline.fadeStart, timeline.end],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Gentle pulse
  const pulse = 1 + Math.sin(pulseProgress * Math.PI * 4) * 0.03;
  const intensity = 0.35 * pulse * fadeProgress;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1920px',
        height: '1080px',
        pointerEvents: 'none',
        boxShadow: `inset 0 0 ${600 * intensity}px ${300 * intensity}px ${palette.brick950}`,
        willChange: 'box-shadow',
        mixBlendMode: 'multiply',
      }}
    />
  );
};