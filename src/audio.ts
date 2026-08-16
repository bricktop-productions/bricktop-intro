import * as Tone from "tone";

/**
 * Procedural audio stem for Bricktop Productions intro
 * 12s duration, generated at render time
 * Layers: sub rumble, film grain, metallic clinks, etch scratches, seal thrum
 */

export interface AudioSchedule {
  time: number; // in seconds
  duration: number;
  type: "rumble" | "grain" | "clink" | "scratch" | "thrum";
  params: Record<string, unknown>;
}

export const generateAudioSchedule = (): AudioSchedule[] => {
  const schedule: AudioSchedule[] = [];

  // Sub rumble: 0-12s continuous low drone ~40Hz
  schedule.push({
    time: 0,
    duration: 12,
    type: "rumble",
    params: { frequency: 40, type: "sine", volume: -30 },
  });

  // Film grain: 0-12s subtle vinyl crackle
  schedule.push({
    time: 0,
    duration: 12,
    type: "grain",
    params: { density: 0.3, volume: -40 },
  });

  // Metallic clinks: 7 clinks for "b-r-i-c-k-t-o-p" at 3-6s (frames 90-180)
  // Each letter gets a clink, spaced ~0.43s apart
  const clinkTimes = [3.2, 3.63, 4.06, 4.49, 4.92, 5.35, 5.78];
  clinkTimes.forEach((t, i) => {
    schedule.push({
      time: t,
      duration: 0.8,
      type: "clink",
      params: {
        frequency: 800 + i * 150, // ascending pitch
        volume: -15,
        decay: 0.4,
      },
    });
  });

  // Etch scratches: 6-9s (frames 180-270) - 11 letters in "productions"
  const scratchTimes = Array.from({ length: 11 }, (_, i) => 6.2 + i * 0.25);
  scratchTimes.forEach((t, i) => {
    schedule.push({
      time: t,
      duration: 0.15,
      type: "scratch",
      params: {
        frequency: 2000 + Math.random() * 3000,
        volume: -20 + Math.random() * 10,
        filterFreq: 3000 + Math.random() * 4000,
      },
    });
  });

  // Seal thrum: 9-10s (frames 270-300)
  schedule.push({
    time: 9.2,
    duration: 1.5,
    type: "thrum",
    params: {
      frequency: 220, // A3
      volume: -12,
      decay: 1.2,
      harmonics: [440, 660, 880],
    },
  });

  return schedule;
};

/**
 * Render audio to buffer using OfflineAudioContext
 * Returns AudioBuffer ready for encoding
 */
export const renderAudioBuffer = async (
  duration: number = 12,
  sampleRate: number = 48000
): Promise<AudioBuffer> => {
  const offlineCtx = new OfflineAudioContext(2, duration * sampleRate, sampleRate);
  const schedule = generateAudioSchedule();

  // Master gain
  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = 0.7;
  masterGain.connect(offlineCtx.destination);

  // ============ SUB RUMBLE ============
  const rumbleOsc = offlineCtx.createOscillator();
  const rumbleGain = offlineCtx.createGain();
  const rumbleFilter = offlineCtx.createBiquadFilter();

  rumbleOsc.type = "sine";
  rumbleOsc.frequency.value = 40;
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.value = 80;
  rumbleGain.gain.value = 0.03; // -30dB

  rumbleOsc.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(masterGain);

  rumbleOsc.start(0);
  rumbleOsc.stop(duration);

  // ============ FILM GRAIN (noise) ============
  const grainBuffer = offlineCtx.createBuffer(
    2,
    duration * sampleRate,
    sampleRate
  );
  for (let channel = 0; channel < 2; channel++) {
    const data = grainBuffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.01; // -40dB
    }
  }
  const grainSource = offlineCtx.createBufferSource();
  const grainGain = offlineCtx.createGain();
  const grainFilter = offlineCtx.createBiquadFilter();

  grainSource.buffer = grainBuffer;
  grainSource.loop = true;
  grainFilter.type = "bandpass";
  grainFilter.frequency.value = 2000;
  grainFilter.Q.value = 0.5;
  grainGain.gain.value = 0.01;

  grainSource.connect(grainFilter);
  grainFilter.connect(grainGain);
  grainGain.connect(masterGain);

  grainSource.start(0);
  grainSource.stop(duration);

  // ============ METALLIC CLINKS ============
  const clinkTimes = [3.2, 3.63, 4.06, 4.49, 4.92, 5.35, 5.78];
  clinkTimes.forEach((t, i) => {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    const filter = offlineCtx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.value = 800 + i * 150;
    filter.type = "bandpass";
    filter.frequency.value = osc.frequency.value;
    filter.Q.value = 10;
    gain.gain.value = 0.18; // -15dB

    // Envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.8);
  });

  // ============ ETCH SCRATCHES ============
  const scratchTimes = Array.from({ length: 11 }, (_, i) => 6.2 + i * 0.25);
  scratchTimes.forEach((t) => {
    const scratchBuffer = offlineCtx.createBuffer(1, 0.15 * sampleRate, sampleRate);
    const data = scratchBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (0.05 * sampleRate));
    }

    const source = offlineCtx.createBufferSource();
    const gain = offlineCtx.createGain();
    const filter = offlineCtx.createBiquadFilter();

    source.buffer = scratchBuffer;
    filter.type = "highpass";
    filter.frequency.value = 3000 + Math.random() * 4000;
    filter.Q.value = 2;
    gain.gain.value = 0.05 + Math.random() * 0.05; // -20 to -10dB

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    source.start(t);
  });

  // ============ SEAL THRUM ============
  const thrumTime = 9.2;
  const thrumFreqs = [220, 440, 660, 880]; // fundamental + harmonics
  thrumFreqs.forEach((freq, i) => {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    const filter = offlineCtx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.value = freq;
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = 20;
    const vol = i === 0 ? 0.25 : 0.08 / i; // fundamental loudest
    gain.gain.value = vol;

    // Envelope
    gain.gain.setValueAtTime(0, thrumTime);
    gain.gain.linearRampToValueAtTime(vol, thrumTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, thrumTime + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(thrumTime);
    osc.stop(thrumTime + 1.5);
  });

  // Render
  return offlineCtx.startRendering();
};

/**
 * For use with Remotion's audio rendering - returns a function that generates
 * the audio data for a given frame range
 */
export const getAudioFrameData = (
  frame: number,
  fps: number = 30,
  sampleRate: number = 48000
): Float32Array => {
  // This would be used for real-time preview in Remotion Studio
  // For actual render, use renderAudioBuffer() and encode with video
  const samplesPerFrame = sampleRate / fps;
  return new Float32Array(Math.ceil(samplesPerFrame) * 2); // stereo
};

export default { generateAudioSchedule, renderAudioBuffer, getAudioFrameData };