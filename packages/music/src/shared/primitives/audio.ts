import { getAudioContext, getMasterBus } from '@kata/audio';

/**
 * Sample-accurate scheduling for primitive drills.
 *
 * Every sound is placed on the AudioContext clock — never setTimeout —
 * so timing drills are not contaminated by JS timer jitter.
 */

export type SourceKind = 'sine' | 'triangle' | 'sawtooth' | 'square' | 'noise' | 'click' | 'custom';

/** Pre-rendered mono samples, cached by key (used by timbre). */
export interface CustomSource {
  key: string;
  render: (sampleRate: number) => Float32Array;
}

export interface SoundSpec {
  /** Seconds from the start of the sequence. */
  at: number;
  /** Onset to silence, including the release ramp. */
  durationMs: number;
  source: SourceKind;
  frequency: number;
  /** Peak level in dBFS. */
  levelDb: number;
  attackMs: number;
  releaseMs: number;
  /** Interaural level difference in dB. Positive = right louder. */
  ildDb?: number;
  /** Interaural time difference in µs. Positive = right ear leads. */
  itdUs?: number;
  /** Left/right correlation, 0..1. 1 = identical (mono). Noise sources only. */
  correlation?: number;
  /** Reverb level relative to the direct sound, in dB. Undefined = dry. */
  wetDb?: number;
  /** Room decay in seconds (used when wetDb is set). */
  roomDecaySec?: number;
  /** Seed for the room impulse, so both intervals of a trial share one room. */
  roomSeed?: number;
  /** Samples for source 'custom'. */
  custom?: CustomSource;
  /** Play in one ear only (headphone check). */
  channel?: 'left' | 'right';
  /** Flip the right channel's polarity (headphone check). */
  invertRight?: boolean;
}

export interface Sequence {
  sounds: SoundSpec[];
  lengthSec: number;
}

export const emptySequence = (): Sequence => ({ sounds: [], lengthSec: 0 });

/** Append b after a, separated by gapSec. */
export function concat(a: Sequence, b: Sequence, gapSec: number): Sequence {
  if (a.sounds.length === 0) return b;
  const offset = a.lengthSec + gapSec;
  return {
    sounds: [...a.sounds, ...b.sounds.map((s) => ({ ...s, at: s.at + offset }))],
    lengthSec: offset + b.lengthSec,
  };
}

export function single(spec: Omit<SoundSpec, 'at'>): Sequence {
  const tail = spec.wetDb !== undefined ? spec.roomDecaySec ?? 1.2 : 0;
  return { sounds: [{ ...spec, at: 0 }], lengthSec: spec.durationMs / 1000 + tail };
}

// ── Seeded randomness ───────────────────────────────────────────

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const dbToGain = (db: number) => Math.pow(10, db / 20);

// ── Buffers ─────────────────────────────────────────────────────

const roomCache = new Map<string, AudioBuffer>();

/** Stereo exponential-decay noise impulse, normalised to unit energy per channel. */
function roomImpulse(ctx: AudioContext, decaySec: number, seed: number): AudioBuffer {
  const key = `${decaySec}|${seed}|${ctx.sampleRate}`;
  const cached = roomCache.get(key);
  if (cached) return cached;
  const sr = ctx.sampleRate;
  const len = Math.max(1, Math.floor(sr * decaySec));
  const buf = ctx.createBuffer(2, len, sr);
  const rng = mulberry32(seed);
  // -60 dB at decaySec
  const k = Math.log(1000) / len;
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let energy = 0;
    for (let i = 0; i < len; i++) {
      const v = (rng() * 2 - 1) * Math.exp(-k * i);
      d[i] = v;
      energy += v * v;
    }
    const norm = 1 / Math.sqrt(energy || 1);
    for (let i = 0; i < len; i++) d[i] = d[i]! * norm;
  }
  if (roomCache.size > 16) roomCache.clear();
  roomCache.set(key, buf);
  return buf;
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  // Fresh noise every time: the listener must judge the variable, not a memorised token.
  // Scaled so RMS ≈ a full-scale sine's RMS (0.707) → comparable loudness to tones.
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 1.22;
  return buf;
}

function clickBuffer(ctx: AudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * 0.004);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (i % 2 === 0 ? 1 : -1) * Math.exp(-i / (len / 5));
  return buf;
}

// ── Scheduling ──────────────────────────────────────────────────

export interface Playback {
  stop: () => void;
  /** AudioContext time at which the sequence ends. */
  endsAt: number;
}

const customCache = new Map<string, AudioBuffer>();

function customBuffer(ctx: AudioContext, c: CustomSource): AudioBuffer {
  const key = `${c.key}|${ctx.sampleRate}`;
  let buf = customCache.get(key);
  if (!buf) {
    const data = c.render(ctx.sampleRate);
    buf = ctx.createBuffer(1, Math.max(1, data.length), ctx.sampleRate);
    buf.getChannelData(0).set(data);
    if (customCache.size > 64) customCache.clear();
    customCache.set(key, buf);
  }
  return buf;
}

function makeSource(ctx: AudioContext, s: SoundSpec, durSec: number): AudioScheduledSourceNode {
  if (s.source === 'custom' && s.custom) {
    const b = ctx.createBufferSource();
    b.buffer = customBuffer(ctx, s.custom);
    return b;
  }
  if (s.source === 'noise') {
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(ctx, durSec + 0.05);
    return n;
  }
  if (s.source === 'click') {
    const c = ctx.createBufferSource();
    c.buffer = clickBuffer(ctx);
    return c;
  }
  const o = ctx.createOscillator();
  o.type = s.source;
  o.frequency.value = s.frequency;
  return o;
}

/** Linear attack → hold → linear release, fitted inside the duration. */
function applyEnvelope(param: AudioParam, start: number, durSec: number, s: SoundSpec, peak: number) {
  let a = Math.max(0.001, s.attackMs / 1000);
  let r = Math.max(0.001, s.releaseMs / 1000);
  if (a + r > durSec) {
    const scale = durSec / (a + r);
    a *= scale;
    r *= scale;
  }
  param.setValueAtTime(0, start);
  param.linearRampToValueAtTime(peak, start + a);
  param.setValueAtTime(peak, start + durSec - r);
  param.linearRampToValueAtTime(0, start + durSec);
}

function scheduleSound(ctx: AudioContext, dest: AudioNode, s: SoundSpec, t0: number, live: AudioNode[]) {
  const start = t0 + s.at;
  const isClick = s.source === 'click';
  const durSec = isClick ? 0.004 : Math.max(0.002, s.durationMs / 1000);
  const peak = dbToGain(s.levelDb);
  const sources: AudioScheduledSourceNode[] = [];

  // Build the left and right signals.
  let left: AudioNode;
  let right: AudioNode;
  const rho = s.correlation ?? 1;

  if (s.source === 'noise' && rho < 1) {
    // L = √ρ·C + √(1-ρ)·N₁,  R = √ρ·C + √(1-ρ)·N₂  → correlation exactly ρ, power constant.
    const a = Math.sqrt(Math.max(0, rho));
    const b = Math.sqrt(Math.max(0, 1 - rho));
    const common = makeSource(ctx, s, durSec);
    const nl = makeSource(ctx, s, durSec);
    const nr = makeSource(ctx, s, durSec);
    sources.push(common, nl, nr);
    const sumL = ctx.createGain();
    const sumR = ctx.createGain();
    const ga = ctx.createGain();
    ga.gain.value = a;
    const gl = ctx.createGain();
    gl.gain.value = b;
    const gr = ctx.createGain();
    gr.gain.value = b;
    common.connect(ga);
    ga.connect(sumL);
    ga.connect(sumR);
    nl.connect(gl).connect(sumL);
    nr.connect(gr).connect(sumR);
    const envL = ctx.createGain();
    const envR = ctx.createGain();
    applyEnvelope(envL.gain, start, durSec, s, peak);
    applyEnvelope(envR.gain, start, durSec, s, peak);
    sumL.connect(envL);
    sumR.connect(envR);
    left = envL;
    right = envR;
    live.push(sumL, sumR, ga, gl, gr, envL, envR);
  } else {
    const src = makeSource(ctx, s, durSec);
    sources.push(src);
    const env = ctx.createGain();
    if (isClick) env.gain.value = peak;
    else applyEnvelope(env.gain, start, durSec, s, peak);
    src.connect(env);
    left = env;
    right = env;
    live.push(env);
  }

  // Interaural level difference, split symmetrically so overall level is unchanged.
  const ild = s.ildDb ?? 0;
  const lg = ctx.createGain();
  lg.gain.value = s.channel === 'right' ? 0 : dbToGain(-ild / 2);
  const rg = ctx.createGain();
  rg.gain.value = (s.channel === 'left' ? 0 : dbToGain(ild / 2)) * (s.invertRight ? -1 : 1);
  left.connect(lg);
  right.connect(rg);
  live.push(lg, rg);

  // Interaural time difference: delay the lagging ear.
  let lOut: AudioNode = lg;
  let rOut: AudioNode = rg;
  const itdSec = (s.itdUs ?? 0) / 1e6;
  if (itdSec !== 0) {
    const d = ctx.createDelay(0.01);
    d.delayTime.value = Math.abs(itdSec);
    if (itdSec > 0) {
      lg.connect(d);
      lOut = d;
    } else {
      rg.connect(d);
      rOut = d;
    }
    live.push(d);
  }

  const merger = ctx.createChannelMerger(2);
  lOut.connect(merger, 0, 0);
  rOut.connect(merger, 0, 1);
  live.push(merger);

  if (s.wetDb !== undefined) {
    // Direct and reverb gains with constant total power, so wetness is not a loudness cue.
    const ratio = dbToGain(s.wetDb);
    const norm = 1 / Math.sqrt(1 + ratio * ratio);
    const dry = ctx.createGain();
    dry.gain.value = norm;
    const wet = ctx.createGain();
    wet.gain.value = ratio * norm;
    const conv = ctx.createConvolver();
    conv.normalize = false;
    conv.buffer = roomImpulse(ctx, s.roomDecaySec ?? 1.2, s.roomSeed ?? 1);
    merger.connect(dry).connect(dest);
    merger.connect(conv).connect(wet).connect(dest);
    live.push(dry, wet, conv);
  } else {
    merger.connect(dest);
  }

  for (const src of sources) {
    src.start(start);
    src.stop(start + durSec + 0.02);
    live.push(src);
  }
}

let current: Playback | null = null;

/** Play a sequence now. Stops anything already playing from this module. */
export function playSequence(seq: Sequence, leadSec = 0.08): Playback {
  current?.stop();
  const ctx = getAudioContext();
  const dest = getMasterBus();
  // Render custom buffers first so slow synthesis can't push the start late.
  for (const s of seq.sounds) if (s.source === 'custom' && s.custom) customBuffer(ctx, s.custom);
  const t0 = ctx.currentTime + leadSec;
  const live: AudioNode[] = [];
  for (const s of seq.sounds) scheduleSound(ctx, dest, s, t0, live);
  const pb: Playback = {
    endsAt: t0 + seq.lengthSec,
    stop: () => {
      for (const n of live) {
        try {
          if (n instanceof AudioScheduledSourceNode) n.stop();
          n.disconnect();
        } catch {
          /* already stopped */
        }
      }
      if (current === pb) current = null;
    },
  };
  current = pb;
  return pb;
}

export function stopAll() {
  current?.stop();
}

let analyser: AnalyserNode | null = null;
export function getPrimitiveAnalyser(): AnalyserNode {
  if (!analyser) {
    const ctx = getAudioContext();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    getMasterBus().connect(analyser);
  }
  return analyser;
}
