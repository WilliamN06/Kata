import { getAudioContext, getMasterBus, playTone } from '@kata/audio';
import { generateImpulseResponse } from '@kata/music-shared';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';

export interface SpatialPositionParams {
  pan: number;
  frequency: number;
  durationMs: number;
}

export function createSpatialPositionStimulus(
  params: SpatialPositionParams,
  ctx: AudioContext,
  destination: AudioNode
): Omit<MusicStimulusHandle, 'analyser'> {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = params.frequency;

  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.max(-1, Math.min(1, params.pan / 100));

  const gain = ctx.createGain();
  const dur = params.durationMs / 1000;

  osc.connect(panner);
  panner.connect(gain);
  gain.connect(destination);

  return {
    play: (start, duration) => {
      gain.gain.setValueAtTime(0.4, start);
      gain.gain.linearRampToValueAtTime(0, start + Math.max(dur, duration));
      osc.start(start);
      osc.stop(start + Math.max(dur, duration) + 0.05);
    },
    stop: () => { try { osc.stop(); } catch {} },
  };
}

export interface SpatialDepthParams {
  depthMs: number;
  reverbType: 'room' | 'hall' | 'plate' | 'spring';
  damping: number;
  directToReverb: number;
  frequency: number;
}

export function createSpatialDepthStimulus(
  params: SpatialDepthParams,
  ctx: AudioContext,
  destination: AudioNode
): Omit<MusicStimulusHandle, 'analyser'> {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = params.frequency;

  const dryGain = ctx.createGain();
  const wetGain = ctx.createGain();
  const mix = params.directToReverb / 100;
  dryGain.gain.value = 1 - mix;
  wetGain.gain.value = mix;

  const convolver = ctx.createConvolver();
  const decayTime = params.reverbType === 'hall' ? 3.5 : params.reverbType === 'room' ? 1.2 : params.reverbType === 'plate' ? 2.0 : 1.8;
  const preDelay = params.depthMs / 1000;
  convolver.buffer = generateImpulseResponse(ctx, decayTime, preDelay, params.damping);

  osc.connect(dryGain);
  dryGain.connect(destination);
  osc.connect(convolver);
  convolver.connect(wetGain);
  wetGain.connect(destination);

  return {
    play: (start, duration) => {
      osc.start(start);
      osc.stop(start + duration + 0.05);
    },
    stop: () => { try { osc.stop(); } catch {} },
  };
}
