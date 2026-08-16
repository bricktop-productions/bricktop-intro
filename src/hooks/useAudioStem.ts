// bricktop-intro/src/hooks/useAudioStem.ts
// Procedural audio stem generation using Web Audio API
// Returns an AudioBuffer that can be used with Remotion's <Audio> component

import { timeline } from '@/lib/easing';

export interface AudioStemConfig {
  sampleRate: number;
  duration: number; // seconds
}

export interface AudioStemLayers {
  rumble: Float32Array;
  grain: Float32Array;
  clinks: Float32Array;
  scratches: Float32Array;
  thrum: Float32Array;
}

// Generate a single layer
const generateLayer = (
  sampleRate: number,
  duration: number,
  generator: (t: number, sampleRate: number) => number
): Float32Array => {
  const length = sampleRate * duration;
  const buffer = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = generator(i / sampleRate, sampleRate);
  }
  return buffer;
};

// Sub rumble: 20-35 Hz sine wave
export const generateRumble = (sampleRate: number, duration: number): Float32Array => {
  return generateLayer(sampleRate, duration, (t) => {
    const freq = 25 + Math.sin(t * 0.5) * 10; // Slowly modulating 15-35 Hz
    return Math.sin(2 * Math.PI * freq * t) * 0.06; // -24 dB
  });
};

// Film grain: band-limited noise
export const generateGrain = (sampleRate: number, duration: number): Float32Array => {
  return generateLayer(sampleRate, duration, () => {
    // Simple pseudo-random noise
    const x = Math.sin(Math.random() * 10000) * 10000;
    return (x - Math.floor(x)) * 2 - 1;
  }).map(v => v * 0.017); // -35 dB
};

// Letter clinks: metallic pings at specific times
export const generateClinks = (sampleRate: number, duration: number, clinkTimes: number[]): Float32Array => {
  const length = sampleRate * duration;
  const buffer = new Float32Array(length);

  clinkTimes.forEach(clinkTime => {
    const startSample = Math.floor(clinkTime * sampleRate);
    const decaySamples = Math.floor(0.8 * sampleRate); // 800ms decay

    for (let i = 0; i < decaySamples && startSample + i < length; i++) {
      const t = i / sampleRate;
      // Metallic ping: multiple harmonics with exponential decay
      const freq1 = 800 + Math.random() * 400; // 800-1200 Hz
      const freq2 = freq1 * 2.5;
      const freq3 = freq1 * 4.2;
      const decay = Math.exp(-t * 4);
      const sample = (
        Math.sin(2 * Math.PI * freq1 * t) * 0.6 +
        Math.sin(2 * Math.PI * freq2 * t) * 0.3 +
        Math.sin(2 * Math.PI * freq3 * t) * 0.1
      ) * decay * 0.12; // -18 dB

      buffer[startSample + i] += sample;
    }
  });

  return buffer;
};

// Etch scratches: filtered noise bursts
export const generateScratches = (sampleRate: number, duration: number, scratchTimes: number[]): Float32Array => {
  const length = sampleRate * duration;
  const buffer = new Float32Array(length);

  scratchTimes.forEach(scratchTime => {
    const startSample = Math.floor(scratchTime * sampleRate);
    const burstSamples = Math.floor(0.15 * sampleRate); // 150ms per letter

    for (let i = 0; i < burstSamples && startSample + i < length; i++) {
      const t = i / sampleRate;
      // Band-pass filtered noise (simulate with high-freq emphasis)
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 30);
      const hpf = noise - (buffer[startSample + i - 1] || 0); // Simple high-pass
      buffer[startSample + i] += hpf * 0.08; // -22 dB
    }
  });

  return buffer;
};

// Seal thrum: low resonant hit
export const generateThrum = (sampleRate: number, duration: number, thrumTime: number): Float32Array => {
  const length = sampleRate * duration;
  const buffer = new Float32Array(length);
  const startSample = Math.floor(thrumTime * sampleRate);
  const decaySamples = Math.floor(1.5 * sampleRate); // 1.5s decay

  for (let i = 0; i < decaySamples && startSample + i < length; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 2);
    const sample = (
      Math.sin(2 * Math.PI * 60 * t) * 0.7 +   // Fundamental
      Math.sin(2 * Math.PI * 120 * t) * 0.2 +  // 1st harmonic
      Math.sin(2 * Math.PI * 180 * t) * 0.1    // 2nd harmonic
    ) * decay * 0.16; // -16 dB

    buffer[startSample + i] += sample;
  }

  return buffer;
};

// Mix all layers with fade-out
export const mixAudioStem = (
  layers: AudioStemLayers,
  sampleRate: number,
  duration: number,
  fadeStart: number,
  fadeEnd: number
): Float32Array => {
  const length = sampleRate * duration;
  const mixed = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    let sample = 0;

    sample += layers.rumble[i] || 0;
    sample += layers.grain[i] || 0;
    sample += layers.clinks[i] || 0;
    sample += layers.scratches[i] || 0;
    sample += layers.thrum[i] || 0;

    // Fade out
    if (t > fadeStart) {
      const fadeProgress = (t - fadeStart) / (fadeEnd - fadeStart);
      sample *= Math.max(0, 1 - fadeProgress);
    }

    // Soft clip
    mixed[i] = Math.tanh(sample * 0.8);
  }

  return mixed;
};

// Main hook - generates complete stem
export const generateForgeStem = (config: AudioStemConfig): Float32Array => {
  const { sampleRate, duration } = config;
  const fps = 30;

  // Timeline in seconds
  const clinkTimes = [
    1.7, 2.0, 2.3, 2.6, 2.9, 3.2, 3.5, 3.8 // 8 letters of "bricktop"
  ];

  const scratchTimes: number[] = [];
  for (let i = 0; i < 11; i++) { // 11 letters of "productions"
    scratchTimes.push(5.2 + i * 0.3);
  }

  const thrumTime = 8.7; // Seal completion

  const layers: AudioStemLayers = {
    rumble: generateRumble(sampleRate, duration),
    grain: generateGrain(sampleRate, duration),
    clinks: generateClinks(sampleRate, duration, clinkTimes),
    scratches: generateScratches(sampleRate, duration, scratchTimes),
    thrum: generateThrum(sampleRate, duration, thrumTime),
  };

  return mixAudioStem(layers, sampleRate, duration, 10.5, 12.0);
};

// Export timing data for sync
export const forgeAudioTiming = {
  clinkTimes: [1.7, 2.0, 2.3, 2.6, 2.9, 3.2, 3.5, 3.8],
  scratchTimes: Array.from({ length: 11 }, (_, i) => 5.2 + i * 0.3),
  thrumTime: 8.7,
  fadeStart: 10.5,
  fadeEnd: 12.0,
  duration: 12.0,
} as const;