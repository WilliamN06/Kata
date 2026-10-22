/**
 * SoundfontLoader Ã¢â‚¬â€ loads FluidR3Mono_GM.sf3 into spessasynth_lib's
 * WorkletSynthesizer, and exposes playInstrumentNote() for the drills.
 *
 * The synthesizer is created lazily on first play. Once created, all
 * subsequent plays go through the same synth instance and use the
 * soundfont's real samples.
 */

import { getAudioContext, getMasterBus } from '@kata/audio';


// =================================================================
// SYNTHETIC WAVEFORM HELPERS
// =================================================================
const SYNTH_WAVES = ['sine', 'triangle', 'sawtooth', 'square'] as const;
type Wave = typeof SYNTH_WAVES[number];
function isWave(name: string): name is Wave {
  return (SYNTH_WAVES as readonly string[]).includes(name);
}

function playOscillator(
  frequency: number,
  startTime: number,
  durationSeconds: number,
  wave: Wave,
  gain: number
): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = wave;
  osc.frequency.value = frequency;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gain * 0.7, startTime + 0.01);
  g.gain.setValueAtTime(gain * 0.7, startTime + durationSeconds - 0.05);
  g.gain.linearRampToValueAtTime(0, startTime + durationSeconds);
  osc.connect(g);
  g.connect(getMasterBus());
  osc.start(startTime);
  osc.stop(startTime + durationSeconds + 0.1);
}

const SOUNDFONT_URL = '/FluidR3Mono_GM.sf3';
const WORKLET_URL = '/spessasynth/spessasynth_processor.min.js';

// GM instrument Ã¢â€ â€™ program number (MIDI bank 0)
const INSTRUMENT_PROGRAMS: Record<string, number> = {
  // Piano
  piano_acoustic: 0,
  piano_bright: 1,
  piano_electric: 2,
  piano_honky: 3,
  rhodes: 4,
  harpsichord: 6,
  clavinet: 7,
  // Chromatic
  celesta: 8,
  glockenspiel: 9,
  music_box: 10,
  vibraphone: 11,
  marimba: 12,
  xylophone: 13,
  tubular_bells: 14,
  dulcimer: 15,
  // Organ
  organ_drawbar: 16,
  organ_percussive: 17,
  organ_rock: 18,
  organ_church: 19,
  organ_reed: 20,
  accordion: 21,
  harmonica: 22,
  // Guitar
  guitar_nylon: 24,
  guitar_steel: 25,
  guitar_jazz: 26,
  guitar_clean: 27,
  guitar_muted: 28,
  guitar_overdriven: 29,
  guitar_distortion: 30,
  // Bass
  bass_acoustic: 32,
  bass_finger: 33,
  bass_pick: 34,
  bass_slap: 36,
  bass_synth: 38,
  // Strings
  violin: 40,
  viola: 41,
  cello: 42,
  contrabass: 43,
  strings_ensemble: 48,
  strings_pizzicato: 45,
  harp: 46,
  // Brass
  trumpet: 56,
  trombone: 57,
  tuba: 58,
  french_horn: 60,
  brass_section: 61,
  // Reed
  sax_soprano: 64,
  sax_alto: 65,
  sax_tenor: 66,
  sax_baritone: 67,
  oboe: 68,
  english_horn: 69,
  bassoon: 70,
  clarinet: 71,
  // Pipe
  flute: 73,
  piccolo: 72,
  recorder: 74,
  pan_flute: 75,
  ocarina: 79,
  // Synth pad
  pad_warm: 89,
  pad_new_age: 88,
  pad_choir: 91,
  pad_metallic: 93,
  // Synth lead
  lead_square: 80,
  lead_saw: 81,
  lead_callia: 82,
  lead_voice: 85,
};

type SynthLike = {
  isReady: Promise<void> | boolean;
  connect?: (dest: AudioNode) => void;
  programChange?: (channel: number, program: number) => void;
  noteOn?: (channel: number, note: number, velocity: number) => void;
  noteOff?: (channel: number, note: number) => void;
  soundBankManager?: {
    addSoundBank: (buf: ArrayBuffer, id?: string) => Promise<void> | void;
  };
};

let synth: SynthLike | null = null;
// Track last program loaded per MIDI channel to avoid redundant programChange calls
// (each programChange can release currently-playing notes, causing a natural doubling)
const lastProgramByChannel: Record<number, number> = {};
let initPromise: Promise<void> | null = null;

function midiFromFrequency(freq: number): number {
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

async function ensureSynth(): Promise<SynthLike | null> {
  if (synth) return synth;
  if (initPromise) { await initPromise; return synth; }

  initPromise = (async () => {
    try {
      const ctx = getAudioContext();

      // Load worklet first
      if (!ctx.audioWorklet) {
        console.warn('[Soundfont] AudioWorklet not supported Ã¢â‚¬â€ falling back to oscillators');
        return;
      }
      try {
        await ctx.audioWorklet.addModule(WORKLET_URL);
        console.log('[Soundfont] Worklet loaded');
      } catch (err) {
        console.warn('[Soundfont] Worklet load failed (falling back to oscillators):', err);
        return;
      }

      // Import spessasynth_lib
      let libMod: any;
      try {
        libMod = await import(/* @vite-ignore */ 'spessasynth_lib' as any);
      } catch (err) {
        console.warn('[Soundfont] spessasynth_lib not available:', err);
        return;
      }

      const WorkletSynth = libMod.WorkletSynthesizer ?? libMod.Synthesizer ?? libMod.default;
      if (!WorkletSynth) {
        console.warn('[Soundfont] No synthesizer class exported');
        return;
      }

      const s = new WorkletSynth(ctx);
      await (typeof s.isReady === 'object' ? s.isReady : Promise.resolve());
      console.log('[Soundfont] Synthesizer ready');

      // Fetch soundfont
      const res = await fetch(SOUNDFONT_URL);
      if (!res.ok) {
        console.warn('[Soundfont] Soundfont fetch failed:', res.status);
        return;
      }
      const buf = await res.arrayBuffer();
      console.log('[Soundfont] Soundfont fetched', (buf.byteLength / 1e6).toFixed(1), 'MB');

      // Load into synth
      if (s.soundBankManager?.addSoundBank) {
        await s.soundBankManager.addSoundBank(buf, 'main');
        console.log('[Soundfont] Loaded via soundBankManager.addSoundBank');
      } else if (typeof s.loadSoundfont === 'function') {
        await (s as any).loadSoundfont(buf);
        console.log('[Soundfont] Loaded via loadSoundfont');
      } else {
        console.warn('[Soundfont] No soundbank loader found on synth Ã¢â‚¬â€ using fallback');
        return;
      }

      // Connect to master bus
      if (typeof s.connect === 'function') s.connect(getMasterBus());

      synth = s;
      console.log('[Soundfont] Ready');
    } catch (err) {
      console.warn('[Soundfont] Init failed:', err);
      synth = null;
    } finally {
      initPromise = null;
    }
  })();

  await initPromise;
  return synth;
}

const SYNTHETIC_WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square'] as const;
type SyntheticWaveform = typeof SYNTHETIC_WAVEFORMS[number];
function isSynthetic(name: string): name is SyntheticWaveform {
  return (SYNTHETIC_WAVEFORMS as readonly string[]).includes(name);
}

/**
 * Play a note at `frequency` through the specified instrument.
 * If `instrument` is a raw waveform, plays an oscillator directly.
 * If it's a soundfont instrument name, tries the soundfont, falls back to sine.
 */
export async function playInstrumentNote(
  instrument: string,
  frequency: number,
  startTime: number,
  durationSeconds: number,
  gain: number = 0.5
): Promise<void> {
  // Raw waveform Ã¢â‚¬â€ use oscillator
  if (isSynthetic(instrument)) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    osc.type = instrument;
    osc.frequency.value = frequency;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gain * 0.7, startTime + 0.01);
    g.gain.setValueAtTime(gain * 0.7, startTime + durationSeconds - 0.05);
    g.gain.linearRampToValueAtTime(0, startTime + durationSeconds);
    osc.connect(g);
    g.connect(getMasterBus());
    osc.start(startTime);
    osc.stop(startTime + durationSeconds + 0.1);
    return;
  }

  // Instrument Ã¢â‚¬â€ try soundfont
  const s = await ensureSynth();
  if (s && s.noteOn && s.noteOff && s.programChange) {
    try {
      const program = INSTRUMENT_PROGRAMS[instrument] ?? 0;
      const channel = (playInstrumentNote as any)._counter = (((playInstrumentNote as any)._counter ?? 0) + 1) % 8;
      if (lastProgramByChannel[channel] !== program) {
        s.programChange(channel, program);
        lastProgramByChannel[channel] = program;
      }
      const midi = midiFromFrequency(frequency);
      const velocity = Math.round(127 * Math.max(0, Math.min(1, gain)));
      s.noteOn(channel, midi, velocity);
      setTimeout(() => {
        try { s.noteOff?.(channel, midi); } catch {}
      }, durationSeconds * 1000);
      return;
    } catch (err) {
      console.warn('[Soundfont] Play failed, falling back:', err);
    }
  }

  // Fallback Ã¢â‚¬â€ sine wave at correct frequency
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gain * 0.7, startTime + 0.01);
  g.gain.setValueAtTime(gain * 0.7, startTime + durationSeconds - 0.05);
  g.gain.linearRampToValueAtTime(0, startTime + durationSeconds);
  osc.connect(g);
  g.connect(getMasterBus());
  osc.start(startTime);
  osc.stop(startTime + durationSeconds + 0.1);
}

/** Preload on user gesture Ã¢â‚¬â€ optional, speeds up first play. */
export async function preloadSoundfont(): Promise<void> {
  await ensureSynth();
}

// =================================================================
// DRUMS Ã¢â‚¬â€ GM percussion (channel 9, bank 128)
// =================================================================

/**
 * General MIDI drum map Ã¢â‚¬â€ each drum name maps to its MIDI note number.
 * On channel 9 (percussion), the note number selects the drum, not the pitch.
 */
const DRUM_NOTES: Record<string, number> = {
  // Kick
  kick: 36,
  kick_acoustic: 35,
  // Snare
  snare: 38,
  snare_acoustic: 37,
  snare_rim: 40,
  // Hi-hat
  hat: 42,
  hat_closed: 42,
  hat_open: 46,
  hat_pedal: 44,
  // Toms
  tom: 45,
  tom_low: 41,
  tom_mid: 47,
  tom_high: 50,
  tom_floor: 43,
  // Cymbals
  crash: 49,
  ride: 51,
  splash: 55,
  china: 52,
  // Clap / rim
  clap: 39,
  rim: 37,
  click: 37,
  // Other
  cowbell: 56,
  tambourine: 54,
  triangle: 81,
  woodblock: 76,
};

/**
 * Play a drum sound through the soundfont's percussion channel.
 *
 * If the soundfont is loaded: uses real FluidR3 drum samples.
 * If not: falls back to synthesised kick/snare/hat/click.
 */
export async function playDrumNote(
  drumName: string,
  startTime: number,
  durationSeconds: number = 0.1,
  gain: number = 0.7
): Promise<void> {
  const s = await ensureSynth();

  if (s && s.noteOn && s.noteOff) {
    try {
      const midiNote = DRUM_NOTES[drumName] ?? 37;
      const channel = 9; // GM percussion channel
      const velocity = Math.round(127 * Math.max(0, Math.min(1, gain)));
      s.noteOn(channel, midiNote, velocity);
      setTimeout(() => {
        try { s.noteOff?.(channel, midiNote); } catch {}
      }, durationSeconds * 1000);
      return;
    } catch (err) {
      console.warn('[Soundfont] Drum play failed, falling back:', err);
    }
  }

  // Fallback Ã¢â‚¬â€ synthesise a drum
  const ctx = getAudioContext();
  const bus = getMasterBus();

  if (drumName === 'kick' || drumName === 'kick_acoustic') {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    osc.connect(g);
    g.connect(bus);
    osc.start(startTime);
    osc.stop(startTime + 0.35);
    return;
  }

  if (drumName === 'click' || drumName === 'rim') {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 1000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);
    osc.connect(g);
    g.connect(bus);
    osc.start(startTime);
    osc.stop(startTime + 0.05);
    return;
  }

  // Snare / hat / clap / tom Ã¢â‚¬â€ noise burst
  const bufferSize = Math.floor(ctx.sampleRate * 0.2);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = drumName === 'hat' || drumName === 'hat_closed' ? 8000
    : drumName === 'snare' ? 1500
    : drumName === 'clap' ? 1000
    : 500;

  const eg = ctx.createGain();
  const decay = drumName === 'hat' || drumName === 'hat_closed' ? 0.05
    : drumName === 'clap' ? 0.1
    : 0.15;
  eg.gain.setValueAtTime(gain, startTime);
  eg.gain.exponentialRampToValueAtTime(0.001, startTime + decay);

  src.connect(filter);
  filter.connect(eg);
  eg.connect(bus);
  src.start(startTime);
  src.stop(startTime + decay + 0.05);
}

// =================================================================
// CHORD PLAYBACK
// =================================================================
/**
 * Play a chord Ã¢â‚¬â€ multiple MIDI notes at the same time.
 *
 * Unlike calling playInstrumentNote in a loop, this:
 *   - Assigns each note its OWN MIDI channel (0..N)
 *     so no note releases another
 *   - Triggers all noteOn calls on the same startTime
 *     so they sound together, not staggered
 *   - Waits for the synth to be ready before any note fires
 *
 * `midiNotes` are absolute MIDI note numbers (60 = middle C).
 */
export async function playChord(
  instrument: string,
  midiNotes: number[],
  startTime: number,
  durationSeconds: number,
  gain: number = 0.5
): Promise<void> {
  // If the source is a raw waveform (sine/triangle/etc.), use oscillators
  if (isWave(instrument)) {
    for (const midi of midiNotes) {
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      playOscillator(freq, startTime, durationSeconds, instrument, gain * 0.6);
    }
    return;
  }

  // Instrument Ã¢â‚¬â€ use soundfont with per-note channels
  const s = await ensureSynth();
  if (!s || !s.noteOn || !s.noteOff) {
    // Fallback Ã¢â‚¬â€ oscillators
    for (const midi of midiNotes) {
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      playOscillator(freq, startTime, durationSeconds, 'sine', gain * 0.5);
    }
    return;
  }

  const program = INSTRUMENT_PROGRAMS[instrument] ?? 0;
  const velocity = Math.round(127 * Math.max(0, Math.min(1, gain)));

  // Assign each note to a distinct channel (0..N-1).
  // This is the fix for "only one tone plays" Ã¢â‚¬â€ with multiple notes on the
  // SAME channel, many synth implementations release previous notes.
  for (let i = 0; i < midiNotes.length; i++) {
    const channel = i % 16;   // wrap to 16 channels
    const midi = midiNotes[i];
    if (midi === undefined) continue;
    try {
      s.programChange?.(channel, program);
      s.noteOn(channel, midi, velocity);
    } catch (err) {
      console.warn('[Soundfont] chord noteOn failed:', err);
    }
  }

  // Schedule noteOff for all channels after the duration
  setTimeout(() => {
    for (let i = 0; i < midiNotes.length; i++) {
      const channel = i % 16;
      const midi = midiNotes[i];
      if (midi === undefined) continue;
      try { s.noteOff?.(channel, midi); } catch {}
    }
  }, durationSeconds * 1000);
}


// =================================================================
// INSTRUMENTS_BY_ID â€” legacy export used by Dynamic drills
// =================================================================
export const INSTRUMENTS_BY_ID: Record<string, { program: number; name: string }> = Object.fromEntries(
  Object.entries(INSTRUMENT_PROGRAMS).map(([id, program]) => [id, { program, name: id }])
);

// =================================================================
// BACKGROUND NOISE — continuous noise generator
// =================================================================
let noiseSource: AudioBufferSourceNode | null = null;
let noiseGain: GainNode | null = null;

function makeNoiseBuffer(
  ctx: AudioContext,
  colour: 'white' | 'pink' | 'brown',
  durationSec: number = 10
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  if (colour === 'white') {
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  } else if (colour === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
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
  } else {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

export function startBackgroundNoise(
  colour: 'white' | 'pink' | 'brown',
  level: number = 0.15
): void {
  const ctx = getAudioContext();
  const bus = getMasterBus();
  stopBackgroundNoise();

  const buffer = makeNoiseBuffer(ctx, colour, 10);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const gain = ctx.createGain();
  gain.gain.value = level;

  src.connect(gain);
  gain.connect(bus);
  src.start();

  noiseSource = src;
  noiseGain = gain;
}

export function stopBackgroundNoise(): void {
  if (noiseSource) {
    try { noiseSource.stop(); } catch {}
    try { noiseSource.disconnect(); } catch {}
    noiseSource = null;
  }
  if (noiseGain) {
    try { noiseGain.disconnect(); } catch {}
    noiseGain = null;
  }
}

export function setBackgroundNoiseLevel(level: number): void {
  if (noiseGain) {
    const ctx = getAudioContext();
    noiseGain.gain.setTargetAtTime(level, ctx.currentTime, 0.05);
  }
}
