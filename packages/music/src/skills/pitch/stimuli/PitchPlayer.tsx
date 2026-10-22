import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';
import { frequencyToNoteString } from '../../../shared/notes';

const SYNTHETIC_WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square'] as const;
type SyntheticWaveform = typeof SYNTHETIC_WAVEFORMS[number];

function isSynthetic(name: string): name is SyntheticWaveform {
  return (SYNTHETIC_WAVEFORMS as readonly string[]).includes(name);
}

export interface PitchStimulusParams {
  frequency: number;
  durationMs: number;
  soundSource?: string;
  gapMs?: number;
  secondFrequency?: number;
}

export interface PitchPlayMethods {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playA: () => Promise<void>;
  playB: () => Promise<void>;
  playBoth: () => Promise<void>;
  hasSecondNote: boolean;
  noteA: string;
  noteB: string | null;
}

export function createPitchStimulus(
  params: PitchStimulusParams,
  ctx: AudioContext,
  destination: AudioNode
): PitchPlayMethods {
  const source = params.soundSource ?? 'sine';
  const dur = params.durationMs / 1000;
  const gap = (params.gapMs ?? 300) / 1000;
  const freq1 = params.frequency;
  const freq2 = params.secondFrequency;
  const hasSecond = freq2 !== undefined;

  const scheduleNote = async (freq: number, when: number): Promise<void> => {
    if (isSynthetic(source)) {
      const osc = ctx.createOscillator();
      osc.type = source;
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(destination);
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(0.35, when + 0.005);
      gain.gain.setValueAtTime(0.35, when + dur - 0.02);
      gain.gain.linearRampToValueAtTime(0, when + dur);
      osc.start(when);
      osc.stop(when + dur + 0.05);
    } else {
      const { playInstrumentNote } = await import('../../../shared/SoundfontLoader');
      await playInstrumentNote(source, freq, when, dur, 0.5);
    }
  };

  const playA = async () => {
    const when = ctx.currentTime + 0.1;
    await scheduleNote(freq1, when);
  };

  const playB = async () => {
    if (!hasSecond) return;
    const when = ctx.currentTime + 0.1;
    await scheduleNote(freq2!, when);
  };

  const playBoth = async () => {
    const anchor = ctx.currentTime + 0.15;
    await scheduleNote(freq1, anchor);
    if (hasSecond) {
      const bTime = anchor + dur + gap;
      await scheduleNote(freq2!, bTime);
    }
  };

  return {
    handle: {
      play: async (start, duration) => {
        await scheduleNote(freq1, start);
        if (hasSecond) {
          await scheduleNote(freq2!, start + (duration ?? dur) + gap);
        }
      },
      stop: () => {},
    },
    playA,
    playB,
    playBoth,
    hasSecondNote: hasSecond,
    noteA: frequencyToNoteString(freq1),
    noteB: hasSecond ? frequencyToNoteString(freq2!) : null,
  };
}
