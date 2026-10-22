import { useEffect } from 'react';
import { useAudioContext } from './useAudioContext';
import type { AudioWaveform, HarmonicContent } from './waveforms';
import type { ReverbPreset, NoisePreset } from './effects';
import { InstrumentChain } from './InstrumentChain';
import { frequencyToMidi } from './pitch';

export interface MelodyNote {
  frequency: number;
  duration: number;
  midi?: number;
}

export interface MelodyPlayerProps {
  notes: MelodyNote[];
  waveform?: AudioWaveform;
  reverb?: ReverbPreset;
  noise?: NoisePreset;
  harmonics?: HarmonicContent;
  repeats?: 1 | 2 | 3;
  playKey?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function MelodyPlayer({
  notes, waveform = 'sine', reverb = 'dry', noise = 'silent',
  harmonics = 'rich', repeats = 1,
  playKey = -1, autoPlay = true, onComplete,
}: MelodyPlayerProps) {
  const { ensureRunning } = useAudioContext();

  useEffect(() => {
    if (!autoPlay || playKey < 0 || notes.length === 0) return;
    let cancelled = false;
    let chain: InstrumentChain | null = null;

    (async () => {
      const ctx = await ensureRunning();
      if (cancelled) return;

      const melodyDuration = notes.reduce((s, n) => s + n.duration, 0);
      const gapBetweenRepeats = 0.25;
      const total = melodyDuration * repeats + gapBetweenRepeats * (repeats - 1);

      chain = new InstrumentChain(ctx, ctx.destination, {
        waveform, reverb, noise, harmonics, duration: total,
      });
      chain.start(ctx.currentTime);

      const startBase = ctx.currentTime;
      for (let r = 0; r < repeats; r++) {
        let t = startBase + r * (melodyDuration + gapBetweenRepeats);
        for (const note of notes) {
          const midi = note.midi ?? Math.round(frequencyToMidi(note.frequency));
          chain.playNote(midi, note.frequency, t, note.duration, 85);
          t += note.duration;
        }
      }

      chain.onLastNoteEnd(() => {
        if (!cancelled) onComplete?.();
      });
    })();

    return () => {
      cancelled = true;
      chain?.teardown();
    };
  }, [notes, waveform, reverb, noise, harmonics, repeats, playKey, autoPlay, ensureRunning, onComplete]);

  return null;
}