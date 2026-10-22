import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';
import {
  INSTRUMENTS_BY_ID,
  playInstrumentNote,
} from '../../../shared/SoundfontLoader';

export interface AmplitudeParams {
  frequency: number;
  durationMs: number;
  gainDb: number;
  soundSource?: string;
  attackMs?: number;
  decayMs?: number;
  sustainLevel?: number;
  releaseMs?: number;
}

export interface AmplitudePlayMethods {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playA: () => Promise<void>;
  playB: () => Promise<void>;
  playBoth: () => Promise<void>;
  hasSecondNote: boolean;
}

/**
 * Amplitude V1 — plays tones at specific dBFS levels.
 * Supports A/B comparison (two amplitudes).
 */
export function createAmplitudeStimulus(
  params: AmplitudeParams & { secondGainDb?: number },
  ctx: AudioContext,
  destination: AudioNode
): AmplitudePlayMethods {
  const source = params.soundSource ?? 'sine';
  const dur = params.durationMs / 1000;
  const freq = params.frequency;
  const gain1 = Math.pow(10, params.gainDb / 20);
  const gain2 = params.secondGainDb !== undefined ? Math.pow(10, params.secondGainDb / 20) : undefined;
  const hasSecond = gain2 !== undefined;

  const synth = (gain: number, when: number) => {
    if (source === 'sine' || source === 'triangle' || source === 'sawtooth' || source === 'square') {
      const osc = ctx.createOscillator();
      osc.type = source as OscillatorType;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(destination);

      const a = (params.attackMs ?? 5) / 1000;
      const d = (params.decayMs ?? 30) / 1000;
      const s = (params.sustainLevel ?? 80) / 100;
      const r = (params.releaseMs ?? 50) / 1000;
      const hold = Math.max(0.01, dur - a - d - r);

      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(gain, when + a);
      g.gain.linearRampToValueAtTime(gain * s, when + a + d);
      g.gain.setValueAtTime(gain * s, when + a + d + hold);
      g.gain.linearRampToValueAtTime(0, when + a + d + hold + r);

      osc.start(when);
      osc.stop(when + dur + 0.1);
    } else {
      // Instrument — scaled by gain
      playInstrumentNote(source, freq, when, dur, gain).catch((e) =>
        console.warn('[Amplitude] play failed:', e)
      );
    }
  };

  return {
    handle: {
      play: async (start) => {
        synth(gain1, start);
        if (hasSecond) synth(gain2!, start + dur + 0.3);
      },
      stop: () => {},
    },
    playA: async () => synth(gain1, ctx.currentTime + 0.1),
    playB: async () => {
      if (hasSecond) synth(gain2!, ctx.currentTime + 0.1);
    },
    playBoth: async () => {
      const anchor = ctx.currentTime + 0.15;
      synth(gain1, anchor);
      if (hasSecond) synth(gain2!, anchor + dur + 0.3);
    },
    hasSecondNote: hasSecond,
  };
}
