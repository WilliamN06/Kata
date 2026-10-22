import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface SpectralEnvelopeParams {
  fundamental: number;
  partialCount: number;
  spectralTilt: number;
  envelopeShape: 'flat' | 'exponential' | 'gaussian' | 'formant';
  resonanceCount: number;
  resonanceFrequency: number;
  resonanceBandwidth: number;
  resonanceGain: number;
}

export function createSpectralEnvelopeSynth(
  params: SpectralEnvelopeParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();
  const oscillators: OscillatorNode[] = [];

  for (let i = 1; i <= params.partialCount; i++) {
    const freq = params.fundamental * i;
    if (freq > ctx.sampleRate / 2) break;

    let mag = 1;
    if (params.envelopeShape === 'exponential') mag = Math.pow(0.85, i);
    else if (params.envelopeShape === 'gaussian') mag = Math.exp(-Math.pow((i - params.partialCount / 2) / (params.partialCount / 4), 2));
    else if (params.envelopeShape === 'flat') mag = 1;

    // Apply tilt
    const octaves = Math.log2(freq / params.fundamental);
    mag *= Math.pow(10, (params.spectralTilt * octaves) / 20);

    // Apply resonances
    for (let r = 0; r < params.resonanceCount; r++) {
      const distance = Math.abs(freq - params.resonanceFrequency) / params.resonanceBandwidth;
      const resonanceBoost = Math.exp(-distance * distance);
      mag *= 1 + resonanceBoost * (Math.pow(10, params.resonanceGain / 20) - 1);
    }

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
