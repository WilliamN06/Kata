import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface ModulationParams {
  carrierFrequency: number;
  modulationType: 'AM' | 'FM' | 'PM';
  modulationRate: number;
  modulationDepth: number;
  modulationWaveform: OscillatorType;
}

export function createModulationSynth(
  params: ModulationParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();

  const carrier = ctx.createOscillator();
  carrier.type = 'sine';
  carrier.frequency.value = params.carrierFrequency;

  const modulator = ctx.createOscillator();
  modulator.type = params.modulationWaveform;
  modulator.frequency.value = params.modulationRate;

  const modGain = ctx.createGain();

  if (params.modulationType === 'AM') {
    carrier.frequency.value = params.carrierFrequency;
    const carrierGain = ctx.createGain();
    carrierGain.gain.value = 1 - params.modulationDepth / 100 / 2;
    modGain.gain.value = params.modulationDepth / 100 / 2;
    modulator.connect(modGain);
    modGain.connect(carrierGain.gain);
    carrier.connect(carrierGain);
    carrierGain.connect(dest);
  } else {
    const deviation = params.modulationDepth;
    modGain.gain.value = deviation;
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(dest);
  }

  return {
    play: (startTime, duration) => {
      carrier.start(startTime);
      carrier.stop(startTime + duration);
      modulator.start(startTime);
      modulator.stop(startTime + duration);
    },
    stop: () => {
      try { carrier.stop(); } catch {}
      try { modulator.stop(); } catch {}
    },
  };
}
