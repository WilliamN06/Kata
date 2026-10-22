import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface AmplitudeEnvelopeParams {
  carrierFrequency: number;
  carrierWaveform: OscillatorType;
  attackMs: number;
  decayMs: number;
  sustainLevel: number;
  releaseMs: number;
  sustainDurationMs: number;
}

export function createAmplitudeEnvelopeSynth(
  params: AmplitudeEnvelopeParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();
  const osc = ctx.createOscillator();
  osc.type = params.carrierWaveform;
  osc.frequency.value = params.carrierFrequency;

  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(dest);

  return {
    play: (startTime, duration) => {
      const attack = params.attackMs / 1000;
      const decay = params.decayMs / 1000;
      const sustain = params.sustainLevel / 100;
      const release = params.releaseMs / 1000;
      const sustainDuration = params.sustainDurationMs / 1000;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(1, startTime + attack);
      gain.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
      gain.gain.setValueAtTime(sustain, startTime + attack + decay + sustainDuration);
      gain.gain.linearRampToValueAtTime(0, startTime + attack + decay + sustainDuration + release);

      osc.start(startTime);
      osc.stop(startTime + attack + decay + sustainDuration + release + 0.05);
    },
    stop: () => {
      try { osc.stop(); } catch {}
    },
  };
}
