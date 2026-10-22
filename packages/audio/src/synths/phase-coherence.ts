import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface PhaseCoherenceParams {
  fundamental: number;
  partialCount: number;
  phaseSpread: number;
}

export function createPhaseCoherenceSynth(
  params: PhaseCoherenceParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();
  const oscillators: OscillatorNode[] = [];

  for (let i = 1; i <= params.partialCount; i++) {
    const freq = params.fundamental * i;
    if (freq > ctx.sampleRate / 2) break;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const randomPhase = (Math.random() - 0.5) * params.phaseSpread * Math.PI / 180;
    // Phase can't be set directly; simulate with delay
    const delay = ctx.createDelay(1);
    delay.delayTime.value = randomPhase / (2 * Math.PI * freq);
    const gain = ctx.createGain();
    gain.gain.value = Math.pow(0.85, i);
    osc.connect(delay);
    delay.connect(gain);
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
