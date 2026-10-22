import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';

export interface FreqDepParams {
  freqA: number;
  dbA: number;
  freqB: number;
  dbB: number;
  durationMs: number;
}

export interface FreqDepPlayMethods {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playA: () => Promise<void>;
  playB: () => Promise<void>;
  playBoth: () => Promise<void>;
}

/**
 * Frequency-Dependent Amplitude V6 — two tones at different freq/dB.
 * Tests Fletcher-Munson effect: same physical dB sounds different
 * at different frequencies.
 */
export function createFreqDepStimulus(
  params: FreqDepParams,
  ctx: AudioContext,
  destination: AudioNode
): FreqDepPlayMethods {
  const dur = params.durationMs / 1000;

  const playTone = (freq: number, db: number, when: number) => {
    const gain = Math.pow(10, db / 20);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(destination);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.03);
    g.gain.setValueAtTime(gain, when + dur - 0.03);
    g.gain.linearRampToValueAtTime(0, when + dur);
    osc.start(when);
    osc.stop(when + dur + 0.1);
  };

  return {
    handle: {
      play: async (start) => {
        playTone(params.freqA, params.dbA, start);
        playTone(params.freqB, params.dbB, start + dur + 0.3);
      },
      stop: () => {},
    },
    playA: async () => playTone(params.freqA, params.dbA, ctx.currentTime + 0.1),
    playB: async () => playTone(params.freqB, params.dbB, ctx.currentTime + 0.1),
    playBoth: async () => {
      const anchor = ctx.currentTime + 0.15;
      playTone(params.freqA, params.dbA, anchor);
      playTone(params.freqB, params.dbB, anchor + dur + 0.3);
    },
  };
}
