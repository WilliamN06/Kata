import { useEffect } from 'react';
import { useAudioContext } from './useAudioContext';
import { buildChord, pitchClassToFrequency } from './pitch';
import type { AudioWaveform, HarmonicContent } from './waveforms';
import type { ReverbPreset, NoisePreset } from './effects';
import { InstrumentChain } from './InstrumentChain';

export type ChordType =
  | 'major' | 'minor' | 'diminished' | 'augmented'
  | 'maj7' | 'min7' | 'dom7' | 'm7b5' | 'dim7'
  | 'maj9' | 'min9' | 'dom9' | 'sus2' | 'sus4';

export interface ChordPlayerProps {
  rootPitchClass: number;
  chordType: ChordType;
  octave?: number;
  duration: number;
  waveform?: AudioWaveform;
  reverb?: ReverbPreset;
  noise?: NoisePreset;
  harmonics?: HarmonicContent;
  repeats?: 1 | 2 | 3;
  playKey?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

const CHORD_INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  maj9: [0, 4, 7, 11, 14],
  min9: [0, 3, 7, 10, 14],
  dom9: [0, 4, 7, 10, 14],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

export function ChordPlayer({
  rootPitchClass, chordType, octave = 4, duration,
  waveform = 'sine', reverb = 'dry', noise = 'silent', harmonics = 'rich',
  repeats = 1, playKey = -1, autoPlay = true, onComplete,
}: ChordPlayerProps) {
  const { ensureRunning } = useAudioContext();

  useEffect(() => {
    if (!autoPlay || playKey < 0) return;
    let cancelled = false;
    let chain: InstrumentChain | null = null;

    (async () => {
      const ctx = await ensureRunning();
      if (cancelled) return;

      const rootMidi = (octave + 1) * 12 + rootPitchClass;
      const intervals = CHORD_INTERVALS[chordType] ?? CHORD_INTERVALS.major;
      const midis = intervals.map((semi) => rootMidi + semi);
      const freqs = midis.map((m) => 440 * Math.pow(2, (m - 69) / 12));

      const gapBetweenRepeats = 0.2;
      const total = duration * repeats + gapBetweenRepeats * (repeats - 1);

      chain = new InstrumentChain(ctx, ctx.destination, {
        waveform, reverb, noise, harmonics, duration: total,
      });
      chain.start(ctx.currentTime);

      const base = ctx.currentTime;
      for (let r = 0; r < repeats; r++) {
        const offset = r * (duration + gapBetweenRepeats);
        midis.forEach((m, i) => {
          chain!.playNote(m, freqs[i] ?? 440, base + offset, duration, 75);
        });
      }

      chain.onLastNoteEnd(() => {
        if (!cancelled) onComplete?.();
      });
    })();

    return () => {
      cancelled = true;
      chain?.teardown();
    };
  }, [
    rootPitchClass, chordType, octave, duration, waveform, reverb, noise, harmonics,
    repeats, playKey, autoPlay, ensureRunning, onComplete,
  ]);

  return null;
}