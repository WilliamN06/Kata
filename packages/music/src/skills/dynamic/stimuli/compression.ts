import { getAudioContext } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';

export interface CompressionParams {
  frequency: number;
  durationMs: number;
  compressed: boolean;
  compressionRatio?: number;  // e.g., 4 for 4:1
  attackMs?: number;
  releaseMs?: number;
  soundSource?: string;
}

export interface CompressionPlayMethods {
  handle: Omit<MusicStimulusHandle, 'analyser'>;
  playCompressed: () => Promise<void>;
  playUncompressed: () => Promise<void>;
  hasBoth: boolean;
}

/**
 * Compression V5 — plays a source, optionally compressed.
 * Uses DynamicsCompressorNode when compressed=true.
 */
export function createCompressionStimulus(
  params: CompressionParams & { compareWithUncompressed?: boolean },
  ctx: AudioContext,
  destination: AudioNode
): CompressionPlayMethods {
  const dur = params.durationMs / 1000;
  const hasBoth = !!params.compareWithUncompressed;

  const playVariant = (compressed: boolean, when: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = params.frequency;

    const gainNode = ctx.createGain();

    // Add an amplitude envelope that varies — so compression can squash it
    const now = when;
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.linearRampToValueAtTime(0.05, now + dur * 0.3);
    gainNode.gain.linearRampToValueAtTime(0.9, now + dur * 0.6);
    gainNode.gain.linearRampToValueAtTime(0.1, now + dur * 0.9);

    osc.connect(gainNode);

    if (compressed) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.ratio.value = params.compressionRatio ?? 4;
      comp.attack.value = (params.attackMs ?? 10) / 1000;
      comp.release.value = (params.releaseMs ?? 150) / 1000;
      gainNode.connect(comp);
      comp.connect(destination);
    } else {
      gainNode.connect(destination);
    }

    osc.start(when);
    osc.stop(when + dur + 0.1);
  };

  return {
    handle: {
      play: async (start) => {
        playVariant(params.compressed, start);
        if (hasBoth) playVariant(!params.compressed, start + dur + 0.3);
      },
      stop: () => {},
    },
    playCompressed: async () => playVariant(true, ctx.currentTime + 0.1),
    playUncompressed: async () => playVariant(false, ctx.currentTime + 0.1),
    hasBoth,
  };
}
