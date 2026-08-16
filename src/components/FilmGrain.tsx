// bricktop-intro/src/components/FilmGrain.tsx
// Animated film grain overlay for texture

import { useCurrentFrame, interpolate } from 'remotion';
import { timeline } from '../lib/easing';

const GRAIN_SIZE = 2; // Pixel size of grain
const GRAIN_DENSITY = 0.15; // Percentage of pixels
const WIDTH = 1920;
const HEIGHT = 1080;

// Pre-generate grain pattern positions for consistency
const generateGrain = (seed = 42): { x: number; y: number; opacity: number }[] => {
  const grains: { x: number; y: number; opacity: number }[] = [];
  const count = Math.floor(WIDTH * HEIGHT * GRAIN_DENSITY / (GRAIN_SIZE * GRAIN_SIZE));

  // Simple seeded random
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    grains.push({
      x: Math.floor(rand() * (WIDTH / GRAIN_SIZE)) * GRAIN_SIZE,
      y: Math.floor(rand() * (HEIGHT / GRAIN_SIZE)) * GRAIN_SIZE,
      opacity: 0.02 + rand() * 0.08,
    });
  }
  return grains;
}

const grainPattern = generateGrain();

export const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Subtle animation: shift grain slightly each frame
  const offsetX = Math.sin(frame * 0.01) * 2;
  const offsetY = Math.cos(frame * 0.013) * 2;

  // Fade out in last 1.5s
  const fadeProgress = interpolate(
    frame,
    [timeline.fadeStart, timeline.end],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = 0.15 * fadeProgress;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1920px',
        height: '1080px',
        pointerEvents: 'none',
        opacity,
        willChange: 'transform',
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            ${grainPattern.map(g => `<rect x="${g.x}" y="${g.y}" width="${GRAIN_SIZE}" height="${GRAIN_SIZE}" fill="white" opacity="${g.opacity}"/>`).join('')}
          </svg>
        `)}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        mixBlendMode: 'overlay',
      }}
    />
  );
};