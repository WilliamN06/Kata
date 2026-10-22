import { getAudioContext } from '@kata/audio';
import { playDrum } from '@kata/audio';
import type { MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';

export interface PatternNote {
  time: number;
  drum: 'kick' | 'snare' | 'hat' | 'clap' | 'click' | 'tom' | 'rim';
  velocity?: number;
}

export interface RhythmStimulusParams {
  pattern: PatternNote[];
  tempo: number;
  swingPercent?: number;
  referenceClick?: boolean;
}

export function createRhythmStimulus(
  params: RhythmStimulusParams,
  ctx: AudioContext,
  destination: AudioNode
): Omit<MusicStimulusHandle, 'analyser'> {
  const spb = 60 / params.tempo;
  const swingOffset = ((params.swingPercent ?? 0) / 100) * 0.5;

  return {
    play: (start, _duration) => {
      if (params.referenceClick) {
        for (let i = 0; i < 4; i++) {
          playDrum('click', start + i * spb, 0.3);
        }
      }

      for (const note of params.pattern) {
        const swing = note.time % 1 === 0.5 ? swingOffset * spb : 0;
        playDrum(note.drum, start + note.time * spb + swing, note.velocity ?? 0.7);
      }
    },
    stop: () => {},
  };
}
