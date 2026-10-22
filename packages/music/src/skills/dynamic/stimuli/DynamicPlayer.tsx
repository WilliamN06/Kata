import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';
import {
  INSTRUMENTS_BY_ID,
  playInstrumentNote,
} from '../../../shared/SoundfontLoader';

const SYNTHETIC_WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square'] as const;
type SyntheticWaveform = typeof SYNTHETIC_WAVEFORMS[number];

function isSynthetic(name: string): name is SyntheticWaveform {
  return (SYNTHETIC_WAVEFORMS as readonly string[]).includes(name);
}

export interface DynamicStimulusParams {
  frequency: number;
  durationMs: number;
  gainDb: number;
  attackMs?: number;
  decayMs?: number;
  sustainLevel?: number;
  releaseMs?: number;
  soundSource?: string;
}

export function createDynamicStimulus(
  params: DynamicStimulusParams,
  ctx: AudioContext,
  destination: AudioNode
): Omit<MusicStimulusHandle, 'analyser'> {
  const source = params.soundSource ?? 'guitar_nylon';
  console.log('[DynamicStimulus] soundSource =', source);

  const linearGain = Math.pow(10, params.gainDb / 20);
  const dur = params.durationMs / 1000;

  // Synthetic path
  if (isSynthetic(source)) {
    const osc = ctx.createOscillator();
    osc.type = source;
    osc.frequency.value = params.frequency;
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(destination);

    const a = (params.attackMs ?? 5) / 1000;
    const d = (params.decayMs ?? 100) / 1000;
    const s = (params.sustainLevel ?? 60) / 100;
    const r = (params.releaseMs ?? 50) / 1000;
    const sustainDur = Math.max(0, dur - (a + d + r));

    return {
      play: (start, _duration) => {
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(linearGain, start + a);
        gain.gain.linearRampToValueAtTime(linearGain * s, start + a + d);
        gain.gain.setValueAtTime(linearGain * s, start + a + d + sustainDur);
        gain.gain.linearRampToValueAtTime(0, start + a + d + sustainDur + r);
        osc.start(start);
        osc.stop(start + a + d + sustainDur + r + 0.1);
      },
      stop: () => { try { osc.stop(); } catch {} },
    };
  }

  // Instrument path
  const entry = INSTRUMENTS_BY_ID[source];
  if (!entry) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = params.frequency;
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(destination);
    return {
      play: (start, _duration) => {
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(linearGain, start + 0.01);
        gain.gain.linearRampToValueAtTime(0, start + dur);
        osc.start(start);
        osc.stop(start + dur + 0.1);
      },
      stop: () => { try { osc.stop(); } catch {} },
    };
  }

  return {
    play: async (start, duration) => {
      try {
        await playInstrumentNote(source, params.frequency, start, duration ?? dur, linearGain);
      } catch (e) {
        console.error('[DynamicStimulus] play failed:', e);
      }
    },
    stop: () => {},
  };
}
