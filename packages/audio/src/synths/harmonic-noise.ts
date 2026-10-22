import { getAudioContext, getMasterBus } from '../context';
import type { SynthHandle } from './partial-structure';

export interface HarmonicNoiseParams {
  fundamental: number;
  partialCount: number;
  tonalRatio: number;
  noiseColour: 'white' | 'pink' | 'brown';
  noiseBand: 'full' | 'low' | 'mid' | 'high';
}

export function createHarmonicNoiseSynth(
  params: HarmonicNoiseParams,
  destination?: AudioNode,
): SynthHandle {
  const ctx = getAudioContext();
  const dest = destination ?? getMasterBus();
  const oscillators: OscillatorNode[] = [];

  const tonalGain = params.tonalRatio / 100;
  const noiseGain = 1 - tonalGain;

  for (let i = 1; i <= params.partialCount; i++) {
    const freq = params.fundamental * i;
    if (freq > ctx.sampleRate / 2) break;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = Math.pow(0.85, i) * tonalGain;
    osc.connect(gain);
    gain.connect(dest);
    oscillators.push(osc);
  }

  let noiseSource: AudioBufferSourceNode | null = null;
  const noiseDuration = 10;
  const bufferSize = Math.floor(ctx.sampleRate * noiseDuration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (params.noiseColour === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (params.noiseColour === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }

  noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  if (params.noiseBand === 'low') {
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 500;
  } else if (params.noiseBand === 'mid') {
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2000;
    noiseFilter.Q.value = 1;
  } else if (params.noiseBand === 'high') {
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 4000;
  }

  const noiseGainNode = ctx.createGain();
  noiseGainNode.gain.value = noiseGain * 0.3;

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGainNode);
  noiseGainNode.connect(dest);

  return {
    play: (startTime, duration) => {
      for (const osc of oscillators) {
        osc.start(startTime);
        osc.stop(startTime + duration);
      }
      if (noiseSource) {
        noiseSource.start(startTime);
        noiseSource.stop(startTime + duration);
      }
    },
    stop: () => {
      for (const osc of oscillators) {
        try { osc.stop(); } catch {}
      }
      if (noiseSource) {
        try { noiseSource.stop(); } catch {}
      }
    },
  };
}
