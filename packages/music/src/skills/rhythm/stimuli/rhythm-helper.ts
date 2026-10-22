import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';
import { playDrumNote } from '../../../shared/SoundfontLoader';

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
