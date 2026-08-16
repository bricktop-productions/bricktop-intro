import { generateAudioSchedule } from "./audio";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to render procedural audio to a WAV file for use with Remotion
 * Run with: npx tsx src/render-audio.ts
 */

const SAMPLE_RATE = 48000;
const DURATION = 12; // seconds
const NUM_CHANNELS = 2;

async function main() {
  console.log("Rendering procedural audio stem...");

  const schedule = generateAudioSchedule();
  const channels = generateAudioBuffer(schedule, DURATION, SAMPLE_RATE);

  // Convert to WAV
  const wavBuffer = audioBufferToWav(channels, SAMPLE_RATE);

  const outputPath = path.join(__dirname, "..", "public", "bricktop-audio.wav");

  // Ensure public directory exists
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, wavBuffer);
  console.log(`Audio written to ${outputPath}`);
  console.log(`Duration: ${DURATION}s, Sample rate: ${SAMPLE_RATE}Hz, Channels: ${NUM_CHANNELS}`);
}

/**
 * Generate audio buffer directly in Node.js without Web Audio API
 */
function generateAudioBuffer(
  schedule: ReturnType<typeof generateAudioSchedule>,
  duration: number,
  sampleRate: number
): Float32Array[] {
  const numSamples = Math.ceil(duration * sampleRate);
  const channels: Float32Array[] = [
    new Float32Array(numSamples),
    new Float32Array(numSamples),
  ];

  // Master gain
  const masterGain = 0.7;

  // Helper to add signal to both channels
  const addToChannels = (signal: Float32Array, gain: number = 1) => {
    for (let i = 0; i < signal.length; i++) {
      channels[0][i] += signal[i] * gain;
      channels[1][i] += signal[i] * gain;
    }
  };

  // ============ SUB RUMBLE (40Hz sine, -30dB) ============
  const rumbleFreq = 40;
  const rumbleGain = 0.03 * masterGain; // -30dB
  const rumbleSignal = generateSineWave(rumbleFreq, duration, sampleRate, rumbleGain);
  // Apply lowpass filter at 80Hz
  const rumbleFiltered = biquadFilter(rumbleSignal, "lowpass", 80, sampleRate, 1);
  addToChannels(rumbleFiltered);

  // ============ FILM GRAIN (bandpass noise at 2kHz, -40dB) ============
  const grainGain = 0.01 * masterGain; // -40dB
  const grainSignal = generateBandpassNoise(duration, sampleRate, 2000, 0.5, grainGain);
  addToChannels(grainSignal);

  // ============ METALLIC CLINKS ============
  const clinkTimes = [3.2, 3.63, 4.06, 4.49, 4.92, 5.35, 5.78];
  clinkTimes.forEach((t, i) => {
    const freq = 800 + i * 150;
    const gain = 0.18 * masterGain; // -15dB
    const decay = 0.4;

    const clinkSignal = generateDecayingSine(freq, t, decay, duration, sampleRate, gain);
    // Bandpass filter at the frequency
    const clinkFiltered = biquadFilter(clinkSignal, "bandpass", freq, sampleRate, 10);
    addToChannels(clinkFiltered);
  });

  // ============ ETCH SCRATCHES ============
  const scratchTimes = Array.from({ length: 11 }, (_, i) => 6.2 + i * 0.25);
  scratchTimes.forEach((t) => {
    const freq = 3000 + Math.random() * 4000;
    const gain = (0.05 + Math.random() * 0.05) * masterGain; // -20 to -10dB
    const dur = 0.15;

    const scratchSignal = generateHighpassNoise(t, dur, freq, sampleRate, gain);
    addToChannels(scratchSignal);
  });

  // ============ SEAL THRUM ============
  const thrumTime = 9.2;
  const thrumFreqs = [220, 440, 660, 880];
  thrumFreqs.forEach((freq, i) => {
    const gain = (i === 0 ? 0.25 : 0.08 / i) * masterGain;
    const decay = 1.2;

    const thrumSignal = generateDecayingSine(freq, thrumTime, decay, duration, sampleRate, gain);
    const thrumFiltered = biquadFilter(thrumSignal, "bandpass", freq, sampleRate, 20);
    addToChannels(thrumFiltered);
  });

  // Clamp to [-1, 1]
  for (let ch = 0; ch < NUM_CHANNELS; ch++) {
    for (let i = 0; i < numSamples; i++) {
      channels[ch][i] = Math.max(-1, Math.min(1, channels[ch][i]));
    }
  }

  return channels;
}

function generateSineWave(freq: number, duration: number, sampleRate: number, gain: number): Float32Array {
  const numSamples = Math.ceil(duration * sampleRate);
  const signal = new Float32Array(numSamples);
  const omega = (2 * Math.PI * freq) / sampleRate;

  for (let i = 0; i < numSamples; i++) {
    signal[i] = Math.sin(omega * i) * gain;
  }

  return signal;
}

function generateDecayingSine(
  freq: number,
  startTime: number,
  decay: number,
  totalDuration: number,
  sampleRate: number,
  gain: number
): Float32Array {
  const numSamples = Math.ceil(totalDuration * sampleRate);
  const signal = new Float32Array(numSamples);
  const omega = (2 * Math.PI * freq) / sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const decaySamples = decay * sampleRate;

  for (let i = startSample; i < numSamples; i++) {
    const t = i - startSample;
    const envelope = Math.exp(-t / decaySamples);
    signal[i] = Math.sin(omega * i) * envelope * gain;
  }

  return signal;
}

function generateBandpassNoise(
  duration: number,
  sampleRate: number,
  centerFreq: number,
  q: number,
  gain: number
): Float32Array {
  const numSamples = Math.ceil(duration * sampleRate);
  const noise = new Float32Array(numSamples);

  // Generate white noise
  for (let i = 0; i < numSamples; i++) {
    noise[i] = (Math.random() * 2 - 1) * gain;
  }

  // Apply bandpass filter
  return biquadFilter(noise, "bandpass", centerFreq, sampleRate, q);
}

function generateHighpassNoise(
  startTime: number,
  duration: number,
  cutoffFreq: number,
  sampleRate: number,
  gain: number
): Float32Array {
  const totalSamples = Math.ceil(12 * sampleRate); // full duration
  const noise = new Float32Array(totalSamples);

  // Generate noise only for the scratch duration
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.min(totalSamples, startSample + Math.ceil(duration * sampleRate));

  for (let i = startSample; i < endSample; i++) {
    // Exponential decay envelope
    const t = i - startSample;
    const envelope = Math.exp(-t / (0.05 * sampleRate));
    noise[i] = (Math.random() * 2 - 1) * envelope * gain;
  }

  // Apply highpass filter
  return biquadFilter(noise, "highpass", cutoffFreq, sampleRate, 2);
}

// Biquad filter implementation (Direct Form I)
function biquadFilter(
  input: Float32Array,
  type: "lowpass" | "highpass" | "bandpass",
  freq: number,
  sampleRate: number,
  q: number
): Float32Array {
  const output = new Float32Array(input.length);
  const omega = (2 * Math.PI * freq) / sampleRate;
  const sin = Math.sin(omega);
  const cos = Math.cos(omega);
  const alpha = sin / (2 * q);

  let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;

  switch (type) {
    case "lowpass":
      b0 = (1 - cos) / 2;
      b1 = 1 - cos;
      b2 = (1 - cos) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case "highpass":
      b0 = (1 + cos) / 2;
      b1 = -(1 + cos);
      b2 = (1 + cos) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case "bandpass":
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
  }

  // Normalize
  b0 /= a0;
  b1 /= a0;
  b2 /= a0;
  a1 /= a0;
  a2 /= a0;

  // Direct Form I
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

  for (let i = 0; i < input.length; i++) {
    const x0 = input[i];
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

    output[i] = y0;

    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }

  return output;
}

function audioBufferToWav(channels: Float32Array[], sampleRate: number): Buffer {
  const numChannels = channels.length;
  const numSamples = channels[0].length;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = numSamples * blockAlign;
  const bufferLength = 44 + dataLength;

  const buffer = Buffer.alloc(bufferLength);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(bufferLength - 8, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  // Write interleaved audio data
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      buffer.writeInt16LE(Math.round(sample * 0x7fff), offset);
      offset += 2;
    }
  }

  return buffer;
}

main().catch(console.error);