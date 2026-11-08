import { getAudioContext, getMasterBus } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';
import { playDrumNote, playInstrumentNote } from '../../../shared/SoundfontLoader';

export type DrumSound = 'kick' | 'snare' | 'hat' | 'clap' | 'click' | 'tom' | 'rim';

export interface RhythmNote {
  /** Time in beats (0 = start) */
  beat: number;
  drum: DrumSound;
  velocity?: number;
}

export interface RhythmParams {
  notes: RhythmNote[];
  bpm: number;
  meterNumerator?: number;
  meterDenominator?: number;
  referenceClicks?: boolean;
}

export interface RhythmPlayMethods {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playPattern: () => Promise<void>;
  playWithClicks?: () => Promise<void>;
  hasClicks: boolean;
  tempo: number;
  totalDurationSeconds: number;
}

export interface ADSRSettings {
  attackTime: number;   // ms
  decayTime: number;    // ms
  sustainLevel: number; // 0-100 (%)
  releaseTime: number;  // ms
  toneColor: string;    // 'pure' | 'warm' | 'bright' | 'dark'
}

/**
 * Play a single note with full ADSR envelope using a raw oscillator waveform.
 * toneColor maps to oscillator wave type.
 */
export function playADSRNote(
  frequency: number,
  startTime: number,
  durationSeconds: number,
  adsr: ADSRSettings,
  gain: number = 0.5
): void {
  const ctx = getAudioContext();
  const wave: OscillatorType = (['sine', 'triangle', 'sawtooth', 'square'].includes(adsr.toneColor) ? adsr.toneColor : 'sine') as OscillatorType;
  const osc = ctx.createOscillator();
  osc.type = wave;
  osc.frequency.value = frequency;

  const g = ctx.createGain();
  const a = adsr.attackTime / 1000;
  const d = adsr.decayTime / 1000;
  const r = adsr.releaseTime / 1000;
  const s = adsr.sustainLevel / 100;

  const attackEnd = startTime + a;
  const decayEnd = attackEnd + d;
  const sustainStart = decayEnd;
  const sustainEnd = Math.max(sustainStart, startTime + durationSeconds - r);
  const releaseEnd = sustainEnd + r;

  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gain * 0.7, attackEnd);
  g.gain.linearRampToValueAtTime(gain * 0.7 * s, sustainStart);
  g.gain.setValueAtTime(gain * 0.7 * s, sustainEnd);
  g.gain.linearRampToValueAtTime(0, releaseEnd);

  osc.connect(g);
  g.connect(getMasterBus());
  osc.start(startTime);
  osc.stop(releaseEnd + 0.05);
}

/**
 * Play a metronome click at the given beat.
 */
export function playMetronomeClick(
  startTime: number,
  volume: number = 0.5,
  isDownbeat: boolean = false
): void {
  const ctx = getAudioContext();
  // Higher pitch for downbeat, lower for subdivision
  const freq = isDownbeat ? 1200 : 800;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = freq;
  const g = ctx.createGain();
  const clickLen = 0.05;
  g.gain.setValueAtTime(volume, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + clickLen);
  osc.connect(g);
  g.connect(getMasterBus());
  osc.start(startTime);
  osc.stop(startTime + clickLen);
}

/**
 * Rhythm stimulus using FluidR3 soundfont drums (GM percussion bank 128).
 * Drums are played through the same soundfont as instruments —
 * real samples, not oscillators.
 */
export function createRhythmStimulus(
  params: RhythmParams,
  ctx: AudioContext,
  destination: AudioNode
): RhythmPlayMethods {
  const spb = 60 / params.bpm;
  const maxBeat = params.notes.reduce((m, n) => Math.max(m, n.beat), 0);
  const totalDur = (maxBeat + 1) * spb;

  const schedulePattern = async (when: number, withClicks: boolean) => {
    // Reference clicks
    if (withClicks && params.referenceClicks) {
      for (let b = 0; b <= maxBeat + 1; b++) {
        const clickTime = when + b * spb;
        await playDrumNote('click', clickTime, 0.05, b === 0 ? 0.8 : 0.4);
      }
    }

    // Pattern hits
    for (const note of params.notes) {
      const hitTime = when + note.beat * spb;
      await playDrumNote(note.drum, hitTime, 0.1, note.velocity ?? 0.7);
    }
  };

  return {
    handle: {
      play: async (start) => {
        await schedulePattern(start, false);
      },
      stop: () => {},
    },
    playPattern: async () => schedulePattern(ctx.currentTime + 0.1, false),
    playWithClicks: async () => schedulePattern(ctx.currentTime + 0.1, true),
    hasClicks: !!params.referenceClicks,
    tempo: params.bpm,
    totalDurationSeconds: totalDur,
  };
}
