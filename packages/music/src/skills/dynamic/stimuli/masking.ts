import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';

export interface MaskingParams {
  targetFreq: number;
  targetDb: number;
  maskerFreq: number;
  maskerDb: number;
  durationMs: number;
  direction?: 'simultaneous' | 'forward' | 'backward';
  gapMs?: number;
  useMasker?: boolean;
}

export interface MaskingPlayMethods {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playTarget: () => Promise<void>;
  playMasker: () => Promise<void>;
  playTogether: () => Promise<void>;
}

/**
 * Masking V3 — target tone + masker tone.
 * User judges whether target is audible.
 */
export function createMaskingStimulus(
  params: MaskingParams,
  ctx: AudioContext,
  destination: AudioNode
): MaskingPlayMethods {
  const dur = params.durationMs / 1000;
  const targetGain = Math.pow(10, params.targetDb / 20);
  const maskerGain = Math.pow(10, params.maskerDb / 20);

  const playTone = (freq: number, gain: number, when: number, duration: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(destination);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.02);
    g.gain.setValueAtTime(gain, when + duration - 0.02);
    g.gain.linearRampToValueAtTime(0, when + duration);
    osc.start(when);
    osc.stop(when + duration + 0.1);
  };

  return {
    handle: {
      play: async (start) => {
        const anchor = start;
        const gap = (params.gapMs ?? 20) / 1000;
        if (params.direction === 'forward') {
          playTone(params.maskerFreq, maskerGain, anchor, dur);
          playTone(params.targetFreq, targetGain, anchor + dur + gap, dur);
        } else if (params.direction === 'backward') {
          playTone(params.targetFreq, targetGain, anchor, dur);
          playTone(params.maskerFreq, maskerGain, anchor + dur + gap, dur);
        } else {
          // Simultaneous
          playTone(params.targetFreq, targetGain, anchor, dur);
          if (params.useMasker !== false) {
            playTone(params.maskerFreq, maskerGain, anchor, dur);
          }
        }
      },
      stop: () => {},
    },
    playTarget: async () => playTone(params.targetFreq, targetGain, ctx.currentTime + 0.1, dur),
    playMasker: async () => playTone(params.maskerFreq, maskerGain, ctx.currentTime + 0.1, dur),
    playTogether: async () => {
      const anchor = ctx.currentTime + 0.15;
      const gap = (params.gapMs ?? 20) / 1000;
      if (params.direction === 'forward') {
        playTone(params.maskerFreq, maskerGain, anchor, dur);
        playTone(params.targetFreq, targetGain, anchor + dur + gap, dur);
      } else if (params.direction === 'backward') {
        playTone(params.targetFreq, targetGain, anchor, dur);
        playTone(params.maskerFreq, maskerGain, anchor + dur + gap, dur);
      } else {
        playTone(params.targetFreq, targetGain, anchor, dur);
        playTone(params.maskerFreq, maskerGain, anchor, dur);
      }
    },
  };
}
