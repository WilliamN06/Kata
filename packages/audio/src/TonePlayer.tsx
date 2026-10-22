import { useEffect } from 'react';
import { useAudioContext } from './useAudioContext';
import type { AudioWaveform, HarmonicContent } from './waveforms';
import type { ReverbPreset, NoisePreset } from './effects';
import { InstrumentChain } from './InstrumentChain';
import { frequencyToMidi } from './pitch';

export interface TonePlayerProps {
  frequency: number;
  midi?: number;
  duration: number;
  waveform?: AudioWaveform;
  reverb?: ReverbPreset;
  noise?: NoisePreset;
  harmonics?: HarmonicContent;
  repeats?: 1 | 2 | 3;
  loop?: boolean;
  playKey?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function TonePlayer({
  frequency, midi, duration, waveform = 'sine',
  reverb = 'dry', noise = 'silent', harmonics = 'rich',
  repeats = 1, loop = false,
  playKey = -1, autoPlay = true, onComplete,
}: TonePlayerProps) {
  const { ensureRunning } = useAudioContext();

  useEffect(() => {
    if (!autoPlay || playKey < 0) return;
    let cancelled = false;
    let chain: InstrumentChain | null = null;

    (async () => {
      const ctx = await ensureRunning();
      if (cancelled) return;

      const now = ctx.currentTime;
      const noteMidi = midi ?? Math.round(frequencyToMidi(frequency));
      const gapBetweenRepeats = 0.2;
      const total = loop ? duration : duration * repeats + gapBetweenRepeats * (repeats - 1);

      chain = new InstrumentChain(ctx, ctx.destination, {
        waveform, reverb, noise, harmonics, duration: total,
      });
      chain.start(now);

      if (loop) {
        chain.playNote(noteMidi, frequency, now, duration, 90);
      } else {
        for (let i = 0; i < repeats; i++) {
          chain.playNote(noteMidi, frequency, now + i * (duration + gapBetweenRepeats), duration, 90);
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
  }, [
    frequency, midi, duration, waveform, reverb, noise, harmonics,
    repeats, loop, playKey, autoPlay, ensureRunning, onComplete,
  ]);

  return null;
}