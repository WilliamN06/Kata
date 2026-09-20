import { useEffect } from 'react';
import { useAudioContext } from './useAudioContext';
import { InstrumentChain } from './InstrumentChain';
import { frequencyToMidi } from './pitch';

export interface MaskingPlayerProps {
  targetFrequency: number;
  targetMidi?: number;
  maskerFrequency: number;
  maskerMidi?: number;
  maskerLevelDb: number;
  targetLevelDb?: number;
  delayMs: number;
  duration: number;
  repeats?: 1 | 2 | 3;
  playKey?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function MaskingPlayer({
  targetFrequency, targetMidi, maskerFrequency, maskerMidi,
  maskerLevelDb, targetLevelDb = 0, delayMs, duration, repeats = 1,
  playKey = -1, autoPlay = true, onComplete,
}: MaskingPlayerProps) {
  const { ensureRunning } = useAudioContext();

  useEffect(() => {
    if (!autoPlay || playKey < 0) return;
    let cancelled = false;
    let chain: InstrumentChain | null = null;

    (async () => {
      const ctx = await ensureRunning();
      if (cancelled) return;

      const targetMidiValue = targetMidi ?? Math.round(frequencyToMidi(targetFrequency));
      const maskerMidiValue = maskerMidi ?? Math.round(frequencyToMidi(maskerFrequency));

      const onePass = duration + delayMs / 1000;
      const gapBetweenRepeats = 0.25;
      const total = onePass * repeats + gapBetweenRepeats * (repeats - 1);

      chain = new InstrumentChain(ctx, ctx.destination, {
        waveform: 'sine', reverb: 'dry', noise: 'silent', harmonics: 'simple', duration: total,
      });
      chain.start(ctx.currentTime);

      const targetVelocity = Math.max(10, Math.min(127, 90 + targetLevelDb));
      const maskerVelocity = Math.max(10, Math.min(127, 90 + maskerLevelDb));

      const base = ctx.currentTime;
      for (let r = 0; r < repeats; r++) {
        const offset = r * (onePass + gapBetweenRepeats);
        chain.playNote(targetMidiValue, targetFrequency, base + offset, duration, targetVelocity);
        chain.playNote(maskerMidiValue, maskerFrequency, base + offset + delayMs / 1000, duration, maskerVelocity);
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
    targetFrequency, targetMidi, maskerFrequency, maskerMidi,
    maskerLevelDb, targetLevelDb, delayMs, duration, repeats,
    playKey, autoPlay, ensureRunning, onComplete,
  ]);

  return null;
}