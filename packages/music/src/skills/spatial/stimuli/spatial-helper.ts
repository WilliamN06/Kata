import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';

export interface SpatialPositionParams {
  /** -100 (full left) to +100 (full right) */
  pan: number;
  frequency: number;
  durationMs: number;
  soundSource?: string;
}

export interface SpatialDepthParams {
  /** 0 = dry (near), 200 = wet (far) — predelay ms */
  depthMs: number;
  reverbType?: 'room' | 'hall' | 'plate' | 'spring';
  frequency: number;
  durationMs: number;
  /** 0-100 direct vs reverb ratio */
  directToReverb?: number;
  damping?: number;
}

export interface PlayMethodsA {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playA: () => Promise<void>;
  playB: () => Promise<void>;
  playBoth: () => Promise<void>;
}

/**
 * Simple impulse response generator for reverb.
 */
function generateImpulse(ctx: AudioContext, decayTime: number, predelayMs: number, damping: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const length = Math.floor(sr * (decayTime + predelayMs / 1000 + 0.05));
  const buf = ctx.createBuffer(2, length, sr);
  const preSamples = Math.floor((predelayMs / 1000) * sr);
  const decayLen = length - preSamples;

  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      if (i < preSamples) {
        data[i] = 0;
      } else {
        const t = (i - preSamples) / decayLen;
        const env = Math.pow(1 - t, damping > 0 ? 4 * damping : 2);
        data[i] = (Math.random() * 2 - 1) * env;
      }
    }
  }
  return buf;
}

/**
 * Plays a spatial position stimulus (pan only).
 */
export function createSpatialPositionStimulus(
  params: SpatialPositionParams,
  ctx: AudioContext,
  destination: AudioNode
): PlayMethodsA & { hasSecondNote: boolean } {
  const dur = params.durationMs / 1000;
  const pan = Math.max(-1, Math.min(1, params.pan / 100));

  const playTone = (when: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = params.frequency;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(panner);
    panner.connect(destination);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.35, when + 0.02);
    g.gain.setValueAtTime(0.35, when + dur - 0.02);
    g.gain.linearRampToValueAtTime(0, when + dur);
    osc.start(when);
    osc.stop(when + dur + 0.1);
  };

  return {
    handle: {
      play: async (start) => playTone(start),
      stop: () => {},
    },
    playA: async () => playTone(ctx.currentTime + 0.1),
    playB: async () => playTone(ctx.currentTime + 0.1),
    playBoth: async () => playTone(ctx.currentTime + 0.15),
    hasSecondNote: false,
  };
}

/**
 * Plays a spatial depth stimulus (reverb-based).
 */
export function createSpatialDepthStimulus(
  params: SpatialDepthParams,
  ctx: AudioContext,
  destination: AudioNode
): PlayMethodsA & { hasSecondNote: boolean } {
  const dur = params.durationMs / 1000;
  const mix = (params.directToReverb ?? 50) / 100;

  const playTone = (when: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = params.frequency;

    const dryGain = ctx.createGain();
    dryGain.gain.value = 1 - mix;

    const wetGain = ctx.createGain();
    wetGain.gain.value = mix;

    const convolver = ctx.createConvolver();
    const decay = params.reverbType === 'hall' ? 3.5
      : params.reverbType === 'plate' ? 2.0
      : params.reverbType === 'spring' ? 1.8
      : 1.2;
    convolver.buffer = generateImpulse(ctx, decay, params.depthMs, params.damping ?? 0.3);

    osc.connect(dryGain);
    dryGain.connect(destination);
    osc.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(destination);

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(0.35, when + 0.02);
    envelope.gain.setValueAtTime(0.35, when + dur - 0.02);
    envelope.gain.linearRampToValueAtTime(0, when + dur);

    // Insert envelope between osc and splits
    osc.disconnect();
    osc.connect(envelope);
    envelope.connect(dryGain);
    envelope.connect(convolver);

    osc.start(when);
    osc.stop(when + dur + decay + 0.2);
  };

  return {
    handle: {
      play: async (start) => playTone(start),
      stop: () => {},
    },
    playA: async () => playTone(ctx.currentTime + 0.1),
    playB: async () => playTone(ctx.currentTime + 0.1),
    playBoth: async () => playTone(ctx.currentTime + 0.15),
    hasSecondNote: false,
  };
}
