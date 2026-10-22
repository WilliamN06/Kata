import { getAudioContext, getMasterBus } from '../context';
import { getPartialFrequency, getPartialMagnitude } from './utils';

export interface PartialStructureParams {
  fundamental: number;
  partialCount: number;
  spacing: 'harmonic' | 'inharmonic' | 'stretched' | 'compressed';
  magnitudeDistribution: 'flat' | 'exponential' | 'gaussian' | 'random';
  density: number;
}

export interface SynthHandle {
  play: (startTime: number, duration: number) => void;
  stop: () => void;
}

export function createPartialStructureSynth(
  params: PartialStructureParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();
  const oscillators: OscillatorNode[] = [];

  const partialCount = Math.floor(params.partialCount);

  for (let i = 1; i <= partialCount; i++) {
    if (Math.random() > params.density / 100) continue;
    const freq = getPartialFrequency(params.fundamental, i, params.spacing);
    if (freq > ctx.sampleRate / 2) break;
    const mag = getPartialMagnitude(i, partialCount, params.magnitudeDistribution);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.value = mag;

    osc.connect(gain);
    gain.connect(dest);
    oscillators.push(osc);
  }

  return {
    play: (startTime, duration) => {
      for (const osc of oscillators) {
        osc.start(startTime);
        osc.stop(startTime + duration);
      }
    },
    stop: () => {
      for (const osc of oscillators) {
        try { osc.stop(); } catch {}
      }
    },
  };
}
