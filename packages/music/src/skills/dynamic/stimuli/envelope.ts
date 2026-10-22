import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';

export interface EnvelopeParams {
  frequency: number;
  attackMs: number;
  decayMs: number;
  sustainLevel: number;  // 0-100
  releaseMs: number;
  durationMs: number;    // sustain duration
  soundSource?: string;
}

export interface EnvelopePlayMethods {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playADSR: () => Promise<void>;
  playAlternative?: () => Promise<void>;
  hasSecond: boolean;
  adsr: { a: number; d: number; s: number; r: number };
}

/**
 * Envelope V2 — plays a tone with the given ADSR envelope.
 * The visualiser should show the ADSR curve alongside playback.
 */
export function createEnvelopeStimulus(
  params: EnvelopeParams & { secondEnvelope?: EnvelopeParams },
  ctx: AudioContext,
  destination: AudioNode
): EnvelopePlayMethods {
  const playOne = (env: EnvelopeParams, when: number) => {
    const osc = ctx.createOscillator();
    osc.type = (params.soundSource as OscillatorType) || 'sine';
    osc.frequency.value = env.frequency;
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(destination);

    const a = env.attackMs / 1000;
    const d = env.decayMs / 1000;
    const s = env.sustainLevel / 100;
    const r = env.releaseMs / 1000;
    const sustainDur = env.durationMs / 1000;

    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.4, when + a);
    g.gain.linearRampToValueAtTime(0.4 * s, when + a + d);
    g.gain.setValueAtTime(0.4 * s, when + a + d + sustainDur);
    g.gain.linearRampToValueAtTime(0, when + a + d + sustainDur + r);

    osc.start(when);
    osc.stop(when + a + d + sustainDur + r + 0.1);
  };

  const env1 = {
    frequency: params.frequency,
    attackMs: params.attackMs,
    decayMs: params.decayMs,
    sustainLevel: params.sustainLevel,
    releaseMs: params.releaseMs,
    durationMs: params.durationMs,
  };
  const env2 = params.secondEnvelope;
  const hasSecond = env2 !== undefined;

  return {
    handle: {
      play: async (start) => {
        playOne(env1, start);
        if (hasSecond) playOne(env2!, start + (params.durationMs + params.attackMs + params.decayMs + params.releaseMs) / 1000 + 0.3);
      },
      stop: () => {},
    },
    playADSR: async () => playOne(env1, ctx.currentTime + 0.1),
    playAlternative: hasSecond ? async () => playOne(env2!, ctx.currentTime + 0.1) : undefined,
    hasSecond,
    adsr: {
      a: params.attackMs,
      d: params.decayMs,
      s: params.sustainLevel,
      r: params.releaseMs,
    },
  };
}
