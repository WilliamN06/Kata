import { getAudioContext, getMasterBus } from './context';
import { dbToLinear } from './db';

/**
 * Play a tone. All 4 OscillatorType values are respected.
 */
export function playTone(
  frequency: number,
  startTime: number,
  duration: number,
  waveform: OscillatorType = 'sine',
  gain = 0.5,
  destination?: AudioNode
): void {
  const ctx = getAudioContext();
  const bus = destination ?? getMasterBus();

  const osc = ctx.createOscillator();
  osc.type = waveform;
  osc.frequency.value = frequency;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gain, startTime + 0.005);
  g.gain.setValueAtTime(gain, Math.max(startTime + 0.006, startTime + duration - 0.02));
  g.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(g);
  g.connect(bus);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/**
 * Real drum synthesis — each drum has a distinct character.
 *
 * Kick:  sine sweep 150 → 40 Hz with sharp exponential decay
 * Snare: noise burst + sine at 180 Hz with 0.15s decay
 * Hat:   highpass-filtered noise burst, very short (30ms)
 * Clap:  3 short noise bursts in 10ms succession
 * Click: square wave at 1000 Hz, ultra-short (20ms)
 * Tom:   sine sweep 100 → 60 Hz, medium decay
 * Rim:   sine at 1700 Hz + noise, ultra-short
 */
export function playDrum(
  type:
    | 'kick'
    | 'snare'
    | 'hat'
    | 'clap'
    | 'click'
    | 'tom'
    | 'rim',
  startTime: number,
  gain = 0.7
): void {
  const ctx = getAudioContext();
  const bus = getMasterBus();

  if (type === 'click') {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 1200;
    const eg = ctx.createGain();
    eg.gain.setValueAtTime(gain, startTime);
    eg.gain.exponentialRampToValueAtTime(0.001, startTime + 0.015);
    osc.connect(eg);
    eg.connect(bus);
    osc.start(startTime);
    osc.stop(startTime + 0.02);
    return;
  }

  if (type === 'kick') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.12);
    const eg = ctx.createGain();
    eg.gain.setValueAtTime(gain * 1.2, startTime);
    eg.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
    osc.connect(eg);
    eg.connect(bus);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
    return;
  }

  if (type === 'tom') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, startTime);
    osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.2);
    const eg = ctx.createGain();
    eg.gain.setValueAtTime(gain, startTime);
    eg.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    osc.connect(eg);
    eg.connect(bus);
    osc.start(startTime);
    osc.stop(startTime + 0.35);
    return;
  }

  if (type === 'rim') {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 1700;
    const eg = ctx.createGain();
    eg.gain.setValueAtTime(gain * 0.8, startTime);
    eg.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);
    osc.connect(eg);
    eg.connect(bus);
    osc.start(startTime);
    osc.stop(startTime + 0.03);

    // Tiny noise snap
    const noise = makeNoiseBuffer(ctx, 0.02);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(gain * 0.3, startTime);
    ng.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);
    src.connect(ng);
    ng.connect(bus);
    src.start(startTime);
    src.stop(startTime + 0.03);
    return;
  }

  if (type === 'snare') {
    // 1) Body: sine at 180 Hz
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 180;
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(gain * 0.6, startTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
    osc.connect(oscGain);
    oscGain.connect(bus);
    osc.start(startTime);
    osc.stop(startTime + 0.12);

    // 2) Snap: highpass-filtered noise
    const noise = makeNoiseBuffer(ctx, 0.15);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 1800;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(gain * 0.9, startTime);
    ng.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
    src.connect(hpf);
    hpf.connect(ng);
    ng.connect(bus);
    src.start(startTime);
    src.stop(startTime + 0.16);
    return;
  }

  if (type === 'hat') {
    const noise = makeNoiseBuffer(ctx, 0.05);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 7000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(gain * 0.5, startTime);
    ng.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
    src.connect(hpf);
    hpf.connect(ng);
    ng.connect(bus);
    src.start(startTime);
    src.stop(startTime + 0.05);
    return;
  }

  if (type === 'clap') {
    // 3 short noise bursts 10ms apart
    const offsets = [0, 0.01, 0.02];
    for (const off of offsets) {
      const noise = makeNoiseBuffer(ctx, 0.02);
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 1200;
      bpf.Q.value = 1.5;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(gain * 0.7, startTime + off);
      ng.gain.exponentialRampToValueAtTime(0.001, startTime + off + 0.02);
      src.connect(bpf);
      bpf.connect(ng);
      ng.connect(bus);
      src.start(startTime + off);
      src.stop(startTime + off + 0.025);
    }
    return;
  }
}

/**
 * Pink noise — spectrally 1/f (warm, "breathy").
 */
export function playPinkNoise(
  startTime: number,
  duration: number,
  gain = 0.3,
  destination?: AudioNode
): void {
  const ctx = getAudioContext();
  const bus = destination ?? getMasterBus();
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(bus);
  src.start(startTime);
  src.stop(startTime + duration);
}

/**
 * White noise.
 */
export function playWhiteNoise(
  startTime: number,
  duration: number,
  gain = 0.3,
  destination?: AudioNode
): void {
  const ctx = getAudioContext();
  const bus = destination ?? getMasterBus();
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(bus);
  src.start(startTime);
  src.stop(startTime + duration);
}

/**
 * Brown noise — spectrally 1/f² (dark, rumble).
 */
export function playBrownNoise(
  startTime: number,
  duration: number,
  gain = 0.3,
  destination?: AudioNode
): void {
  const ctx = getAudioContext();
  const bus = destination ?? getMasterBus();
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    data[i] = last * 3.5;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(bus);
  src.start(startTime);
  src.stop(startTime + duration);
}

function makeNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
