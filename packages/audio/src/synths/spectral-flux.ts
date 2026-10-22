import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface SpectralFluxParams {
  fundamental: number;
  partialCount: number;
  fluxRate: number;
  modulationDepth: number;
}

export function createSpectralFluxSynth(
  params: SpectralFluxParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();
  const oscillators: OscillatorNode[] = [];
  const filters: BiquadFilterNode[] = [];

  for (let i = 1; i <= params.partialCount; i++) {
    const freq = params.fundamental * i;
    if (freq > ctx.sampleRate / 2) break;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 5;
    const gain = ctx.createGain();
    gain.gain.value = Math.pow(0.85, i);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    oscillators.push(osc);
    filters.push(filter);
  }

  return {
    play: (startTime, duration) => {
      for (const osc of oscillators) {
        osc.start(startTime);
        osc.stop(startTime + duration);
      }
      // Modulate each filter's frequency
      for (let i = 0; i < filters.length; i++) {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = params.fluxRate * (1 + i * 0.1);
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = params.modulationDepth * (params.fundamental * (i + 1)) * 0.1;
        lfo.connect(lfoGain);
        lfoGain.connect(filters[i].frequency);
        lfo.start(startTime);
        lfo.stop(startTime + duration);
      }
    },
    stop: () => {
      for (const osc of oscillators) {
        try { osc.stop(); } catch {}
      }
    },
  };
}
