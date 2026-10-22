import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface DistortionParams {
  fundamental: number;
  distortionType: 'soft' | 'hard' | 'fuzz' | 'quantisation' | 'aliasing';
  amount: number;
}

export function createDistortionSynth(
  params: DistortionParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = params.fundamental;

  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(1024);
  const k = params.amount / 100 * 50;

  for (let i = 0; i < 1024; i++) {
    const x = (i * 2) / 1024 - 1;
    if (params.distortionType === 'soft') curve[i] = Math.tanh(k * x);
    else if (params.distortionType === 'hard') curve[i] = Math.max(-1, Math.min(1, k * x));
    else if (params.distortionType === 'fuzz') curve[i] = Math.sin(k * x) * Math.sign(x);
    else if (params.distortionType === 'quantisation') {
      const steps = Math.max(2, Math.floor(256 / (params.amount / 10 + 1)));
      curve[i] = Math.round(x * steps) / steps;
    } else curve[i] = Math.sin(k * x);
  }
  shaper.curve = curve;

  osc.connect(shaper);
  shaper.connect(dest);

  return {
    play: (startTime, duration) => {
      osc.start(startTime);
      osc.stop(startTime + duration);
    },
    stop: () => {
      try { osc.stop(); } catch {}
    },
  };
}
