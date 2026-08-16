// bricktop-intro/src/lib/easing.ts
// Custom springs and interpolation curves for the Forge animation

import { spring, interpolate, type SpringConfig } from 'remotion';

// Spring configurations matching BRICKTOP_BRAND.md motion tokens
export const springs = {
  // Letter particle → text lock (stiff, quick settle)
  lock: {
    stiffness: 280,
    damping: 22,
    mass: 1.2,
  } satisfies SpringConfig,

  // Etch write-on per letter (slightly softer, more organic)
  write: {
    stiffness: 180,
    damping: 18,
    mass: 0.9,
  } satisfies SpringConfig,

  // Underline seal draw (heavier, deliberate)
  seal: {
    stiffness: 220,
    damping: 25,
    mass: 1.5,
  } satisfies SpringConfig,

  // Particle drift (gentle, continuous)
  drift: {
    stiffness: 60,
    damping: 12,
    mass: 0.5,
  } satisfies SpringConfig,

  // Scale pop on letter lock
  pop: {
    stiffness: 320,
    damping: 20,
    mass: 0.7,
  } satisfies SpringConfig,
} as const;

// Slow zoom during hold phase (2.5s to 12s = 300 frames @ 30fps after 1.5s mark)
// frame 0-45: particle coalesce
// frame 45-150: letter lock
// frame 150-250: etch write
// frame 250-300: seal + begin hold
// frame 300-360: hold + zoom
export const zoomHold = (frame: number, fps = 30): number => {
  const holdStartFrame = 5 * fps; // 5s = 150 frames (actually 2.5s in, but we start zoom at 5s)
  const holdEndFrame = 12 * fps; // 12s = 360 frames
  return interpolate(frame, [holdStartFrame, holdEndFrame], [1, 1.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

// Stagger delays for sequential letter animations
export const stagger = {
  letterLock: 0.06,    // 60ms between each "bricktop" letter
  letterWrite: 0.05,   // 50ms between each "productions" letter
  particleBurst: 0.02, // 20ms between particle spawns
} as const;

// Easing curves for non-spring animations
export const easings = {
  // Slow ease-out for seal line draw
  sealDraw: (t: number) => 1 - Math.pow(1 - t, 3),
  // Quick ease-in-out for particle fade
  particleFade: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  // Gentle pulse for vignette
  vignettePulse: (t: number) => Math.sin(t * Math.PI * 2) * 0.05 + 1,
} as const;

// Frame helpers
export const frames = (seconds: number, fps = 30): number => Math.round(seconds * fps);
export const seconds = (frames: number, fps = 30): number => frames / fps;

// Key timestamps in frames @ 30fps
export const timeline = {
  // Phase 1: Particle coalescence (0-1.5s)
  particlesStart: 0,
  particlesPeak: frames(0.5),
  particlesCoalesce: frames(1.5),

  // Phase 2: "bricktop" letter lock (1.5-5s)
  bricktopStart: frames(1.5),
  bricktopEnd: frames(5.0),

  // Phase 3: "productions" etch write (5.1-8.5s) - start slightly after bricktop ends
  productionsStart: frames(5.1),
  productionsEnd: frames(8.5),

  // Phase 4: Seal underline (8.5-9.5s)
  sealStart: frames(8.5),
  sealEnd: frames(9.5),

  // Phase 5: Hold + zoom (9.5-12s)
  holdStart: frames(9.5),
  fadeStart: frames(10.5),
  end: frames(12.0),
} as const;

export type TimelineKey = keyof typeof timeline;