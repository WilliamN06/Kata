import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';

export interface DynamicSpanParams {
  frequency: number;
  loundDb: number;      // e.g., -6
  quietDb: number;      // e.g., -60
  durationMs: number;
  soundSource?: string;
}

export interface DynamicSpanPlayMethods {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playSpan: () => Promise<void>;
}

/**
 * Dynamic Span V4 — plays a sequence alternating loud and quiet tones.
 * The span between them is the "dynamic range".
 */
export function createDynamicSpanStimulus(
  params: DynamicSpanParams,
  ctx: AudioContext,
  destination: AudioNode
): DynamicSpanPlayMethods {
  const dur = params.durationMs / 1000;
  const loudGain = Math.pow(10, params.loundDb / 20);
  const quietGain = Math.pow(10, params.quietDb / 20);

  const playTone = (gain: number, when: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = params.frequency;
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(destination);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.02);
    g.gain.setValueAtTime(gain, when + dur - 0.02);
    g.gain.linearRampToValueAtTime(0, when + dur);
    osc.start(when);
    osc.stop(when + dur + 0.1);
  };

  return {
    handle: {
      play: async (start) => {
        // Pattern: loud, quiet, loud, quiet
        playTone(loudGain, start);
        playTone(quietGain, start + dur + 0.05);
        playTone(loudGain, start + (dur + 0.05) * 2);
        playTone(quietGain, start + (dur + 0.05) * 3);
      },
      stop: () => {},
    },
    playSpan: async () => {
      const anchor = ctx.currentTime + 0.15;
      playTone(loudGain, anchor);
      playTone(quietGain, anchor + dur + 0.05);
      playTone(loudGain, anchor + (dur + 0.05) * 2);
      playTone(quietGain, anchor + (dur + 0.05) * 3);
    },
  };
}
