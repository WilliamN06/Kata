import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface SpectralMomentsParams {
  fundamental: number;
  partialCount: number;
  centroid: number;
  spread: number;
  skewness: number;
  kurtosis: number;
}

export function createSpectralMomentsSynth(
  params: SpectralMomentsParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();
  const oscillators: OscillatorNode[] = [];

  for (let i = 1; i <= params.partialCount; i++) {
    const freq = params.fundamental * i;
    if (freq > ctx.sampleRate / 2) break;
    const distance = Math.abs(freq - params.centroid) / (params.spread || 1);
    const mag = Math.exp(-Math.pow(distance, 2));
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
