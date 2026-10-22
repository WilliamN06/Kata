import { useEffect, useRef } from 'react';
import { useAudioContext } from './useAudioContext';
import type { AudioWaveform, HarmonicContent } from './waveforms';
import type { ReverbPreset, NoisePreset } from './effects';
import { InstrumentChain } from './InstrumentChain';
import { frequencyToMidi } from './pitch';
import { stopSampled } from './soundfont';

export interface IntervalPlayerProps {
  rootFrequency: number;
  rootMidi?: number;
  intervalSemitones: number;
  direction: 'ascending' | 'descending' | 'harmonic';
  noteDuration: number;
  gapDuration?: number;
  waveform?: AudioWaveform;
  reverb?: ReverbPreset;
  noise?: NoisePreset;
  harmonics?: HarmonicContent;
  repeats?: 1 | 2 | 3;
  playKey?: number;
  stopKey?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function IntervalPlayer({
  rootFrequency, rootMidi, intervalSemitones, direction, noteDuration,
  gapDuration = 0.1, waveform = 'sine', reverb = 'dry', noise = 'silent',
  harmonics = 'rich', repeats = 1,
  playKey = -1, stopKey = 0, autoPlay = true, onComplete,
}: IntervalPlayerProps) {
  const { ensureRunning } = useAudioContext();
  const chainRef = useRef<InstrumentChain | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!autoPlay || playKey < 0) return;

    cancelledRef.current = false;

    (async () => {
      const ctx = await ensureRunning();
      if (cancelledRef.current) return;

      const topFreq = rootFrequency * Math.pow(2, intervalSemitones / 12);
      const rootMidiValue = rootMidi ?? Math.round(frequencyToMidi(rootFrequency));
      const topMidiValue = rootMidiValue + intervalSemitones;

      const onePass = direction === 'harmonic'
        ? noteDuration
        : noteDuration * 2 + gapDuration;
      const gapBetweenRepeats = 0.2;
      const total = onePass * repeats + gapBetweenRepeats * (repeats - 1);

      chainRef.current = new InstrumentChain(ctx, ctx.destination, {
        waveform, reverb, noise, harmonics, duration: total,
      });
      chainRef.current.start(ctx.currentTime);

      const base = ctx.currentTime;
      for (let r = 0; r < repeats; r++) {
        const offset = r * (onePass + gapBetweenRepeats);
        if (direction === 'harmonic') {
          chainRef.current.playNote(rootMidiValue, rootFrequency, base + offset, noteDuration, 90);
          chainRef.current.playNote(topMidiValue, topFreq, base + offset, noteDuration, 90);
        } else {
          const firstMidi = direction === 'ascending' ? rootMidiValue : topMidiValue;
          const firstFreq = direction === 'ascending' ? rootFrequency : topFreq;
          const secondMidi = direction === 'ascending' ? topMidiValue : rootMidiValue;
          const secondFreq = direction === 'ascending' ? topFreq : rootFrequency;
          chainRef.current.playNote(firstMidi, firstFreq, base + offset, noteDuration, 90);
          chainRef.current.playNote(secondMidi, secondFreq, base + offset + noteDuration + gapDuration, noteDuration, 90);
        }
      }

      chainRef.current.onLastNoteEnd(() => {
        if (!cancelledRef.current) onComplete?.();
      });
    })();

    return () => {
      cancelledRef.current = true;
      chainRef.current?.teardown();
      chainRef.current = null;
    };
  }, [
    rootFrequency, rootMidi, intervalSemitones, direction, noteDuration, gapDuration,
    waveform, reverb, noise, harmonics, repeats,
    playKey, autoPlay, ensureRunning, onComplete,
  ]);

  // Cancel everything when stopKey changes.
  useEffect(() => {
    if (stopKey === 0) return;
    cancelledRef.current = true;
    chainRef.current?.teardown();
    chainRef.current = null;
    if (waveform && typeof waveform === 'string' && waveform !== 'sine' && waveform !== 'triangle' && waveform !== 'sawtooth' && waveform !== 'square') {
      stopSampled();
    }
  }, [stopKey, waveform]);

  return null;
}