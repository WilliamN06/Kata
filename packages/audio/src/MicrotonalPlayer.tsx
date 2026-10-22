import { useEffect } from 'react';
import { useAudioContext } from './useAudioContext';
import { detuneFrequency, frequencyToMidi } from './pitch';
import type { AudioWaveform, HarmonicContent } from './waveforms';
import type { ReverbPreset, NoisePreset } from './effects';
import { InstrumentChain } from './InstrumentChain';

export interface MicrotonalPlayerProps {
  referenceFrequency: number;
  referenceMidi?: number;
  detuneCents: number;
  duration: number;
  playReferenceFirst?: boolean;
  waveform?: AudioWaveform;
  reverb?: ReverbPreset;
  noise?: NoisePreset;
  harmonics?: HarmonicContent;
  repeats?: 1 | 2 | 3;
  playKey?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function MicrotonalPlayer({
  referenceFrequency, referenceMidi, detuneCents, duration, playReferenceFirst = true,
  waveform = 'sine', reverb = 'dry', noise = 'silent', harmonics = 'rich',
  repeats = 1, playKey = -1, autoPlay = true, onComplete,
}: MicrotonalPlayerProps) {
  const { ensureRunning } = useAudioContext();

  useEffect(() => {
    if (!autoPlay || playKey < 0) return;
    let cancelled = false;
    let chain: InstrumentChain | null = null;

    (async () => {
      const ctx = await ensureRunning();
      if (cancelled) return;

      const targetFreq = detuneFrequency(referenceFrequency, detuneCents);
      const targetMidi = (referenceMidi ?? Math.round(frequencyToMidi(referenceFrequency))) + detuneCents / 100;
      const rootMidi = referenceMidi ?? Math.round(frequencyToMidi(referenceFrequency));

      const onePass = playReferenceFirst ? duration * 2 + 0.15 : duration;
      const gapBetweenRepeats = 0.25;
      const total = onePass * repeats + gapBetweenRepeats * (repeats - 1);

      chain = new InstrumentChain(ctx, ctx.destination, {
        waveform, reverb, noise, harmonics, duration: total,
      });
      chain.start(ctx.currentTime);

      const base = ctx.currentTime;
      for (let r = 0; r < repeats; r++) {
        const offset = r * (onePass + gapBetweenRepeats);
        if (playReferenceFirst) {
          chain.playNote(rootMidi, referenceFrequency, base + offset, duration, 85);
          chain.playNote(targetMidi, targetFreq, base + offset + duration + 0.15, duration, 85);
        } else {
          chain.playNote(targetMidi, targetFreq, base + offset, duration, 85);
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
    referenceFrequency, referenceMidi, detuneCents, duration, playReferenceFirst,
    waveform, reverb, noise, harmonics, repeats,
    playKey, autoPlay, ensureRunning, onComplete,
  ]);

  return null;
}