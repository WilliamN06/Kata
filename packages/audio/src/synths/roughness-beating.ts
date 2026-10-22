import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface RoughnessBeatingParams {
  fundamental: number;
  partialPair: number;
  detuneCents: number;
  beatingRateHz: number;
}

export function createRoughnessBeatingSynth(
  params: RoughnessBeatingParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();
  const oscillators: OscillatorNode[] = [];

  for (let i = 1; i <= 8; i++) {
    const freq = params.fundamental * i;
    if (freq > ctx.sampleRate / 2) break;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = Math.pow(0.85, i);
    osc.connect(gain);
    gain.connect(dest);
    oscillators.push(osc);
  }

  // Add close-frequency pair for beating
  const beatFreq = params.fundamental * params.partialPair;
  const detuneFactor = Math.pow(2, params.detuneCents / 1200);
  const beatOsc = ctx.createOscillator();
  beatOsc.frequency.value = beatFreq * detuneFactor;
  const beatGain = ctx.createGain();
  beatGain.gain.value = Math.pow(0.85, params.partialPair);
  beatOsc.connect(beatGain);
  beatGain.connect(dest);
  oscillators.push(beatOsc);

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
