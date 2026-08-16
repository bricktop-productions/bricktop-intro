// bricktop-intro/src/components/ParticleField.tsx
// Ambient warm particles drifting up, coalescing into text positions

import { useCurrentFrame, interpolate } from 'remotion';
import { palette, paletteAlpha } from '../lib/palette';
import { timeline, springs, stagger } from '../lib/easing';
import { spring } from 'remotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  opacity: number;
  delay: number;
}

const PARTICLE_COUNT = 80;
const WIDTH = 1920;
const HEIGHT = 1080;

// Generate deterministic particle positions
const generateParticles = (): Particle[] => {
  const particles: Particle[] = [];
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2 + 50; // Slightly lower for "bricktop" baseline

  // "bricktop" letter positions (approximate, will be refined)
  const letterPositions = [
    { x: centerX - 280, y: centerY }, // b
    { x: centerX - 200, y: centerY }, // r
    { x: centerX - 120, y: centerY }, // i
    { x: centerX - 60, y: centerY },  // c
    { x: centerX + 10, y: centerY },  // k
    { x: centerX + 80, y: centerY },  // t
    { x: centerX + 150, y: centerY }, // o
    { x: centerX + 220, y: centerY }, // p
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const letterIndex = i % letterPositions.length;
    const spread = 400;
    particles.push({
      id: i,
      x: centerX + (Math.random() - 0.5) * spread,
      y: HEIGHT + 100 + Math.random() * 200, // Start below screen
      targetX: letterPositions[letterIndex].x + (Math.random() - 0.5) * 30,
      targetY: letterPositions[letterIndex].y + (Math.random() - 0.5) * 30,
      size: 2 + Math.random() * 3,
      color: Math.random() > 0.5 ? palette.brickGold : palette.brickAmber,
      opacity: 0.3 + Math.random() * 0.4,
      delay: Math.random() * 0.5,
    });
  }
  return particles;
};

const particles = generateParticles();

export const ParticleField: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const progress = frame / (fps * 12); // 0-1 over 12s

  // Phase 1: Particles rise and coalesce (0-1.5s)
  const coalesceProgress = interpolate(
    frame,
    [timeline.particlesStart, timeline.particlesCoalesce],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Phase 2: Particles lock into letters (1.5-5s)
  const lockProgress = interpolate(
    frame,
    [timeline.bricktopStart, timeline.bricktopEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out after letter lock complete
  const fadeProgress = interpolate(
    frame,
    [timeline.bricktopEnd, timeline.productionsStart],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <>
      {particles.map((p, i) => {
        const staggerDelay = i * stagger.particleBurst * fps;
        const effectiveFrame = frame - staggerDelay;
        const particleProgress = Math.max(0, effectiveFrame / (fps * 1.5)); // 1.5s to rise

        // Rise from bottom
        const riseY = interpolate(
          particleProgress,
          [0, 1],
          [p.y, p.targetY + 100], // Overshoot slightly before lock
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        // Horizontal drift
        const driftX = interpolate(
          particleProgress,
          [0, 1],
          [p.x, p.targetX],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        // Lock into position (spring)
        const lockSpring = spring({
          frame: effectiveFrame - timeline.particlesCoalesce,
          fps,
          config: springs.lock,
        });
        const lockedX = interpolate(lockSpring, [0, 1], [driftX, p.targetX]);
        const lockedY = interpolate(lockSpring, [0, 1], [riseY, p.targetY]);

        // Final position: use spring during lock phase, then locked position
        const finalX = lockProgress < 1 ? lockedX : p.targetX;
        const finalY = lockProgress < 1 ? lockedY : p.targetY;

        // Opacity: fade in during rise, full during lock, fade out after
        let opacity = p.opacity;
        if (coalesceProgress < 1) {
          opacity *= interpolate(coalesceProgress, [0, 0.3, 1], [0, 1, 1]);
        }
        if (fadeProgress < 1) {
          opacity *= fadeProgress;
        }

        // Size pulse on lock
        const sizeMultiplier = lockProgress > 0 && lockProgress < 1
          ? 1 + spring({ frame: effectiveFrame - timeline.particlesCoalesce, fps, config: springs.pop }) * 0.5
          : 1;

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${finalX}px`,
              top: `${finalY}px`,
              width: `${p.size * sizeMultiplier}px`,
              height: `${p.size * sizeMultiplier}px`,
              borderRadius: '50%',
              background: p.color,
              opacity,
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </>
  );
};