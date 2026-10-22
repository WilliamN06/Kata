import { useState } from 'react';
import { getAudioContext, resumeAudio, playTone } from '@kata/audio';

interface IntervalPlayerProps {
  rootFrequency: number;
  intervalSemitones: number;
  direction: 'ascending' | 'descending' | 'harmonic';
  noteDurationMs: number;
  gapMs: number;
  label?: string;
  onComplete?: () => void;
}

export function IntervalPlayer({ rootFrequency, intervalSemitones, direction, noteDurationMs, gapMs, label = 'PLAY', onComplete }: IntervalPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const handle = async () => {
    await resumeAudio();
    const ctx = getAudioContext();
    const t0 = ctx.currentTime + 0.05;
    const secondFreq = rootFrequency * Math.pow(2, intervalSemitones / 12);
    const noteDur = noteDurationMs / 1000;
    const gap = gapMs / 1000;

    if (direction === 'harmonic') {
      playTone(rootFrequency, t0, noteDur, 'sine', 0.3);
      playTone(secondFreq, t0, noteDur, 'sine', 0.3);
    } else if (direction === 'ascending') {
      playTone(rootFrequency, t0, noteDur, 'sine', 0.5);
      playTone(secondFreq, t0 + noteDur + gap, noteDur, 'sine', 0.5);
    } else {
      playTone(secondFreq, t0, noteDur, 'sine', 0.5);
      playTone(rootFrequency, t0 + noteDur + gap, noteDur, 'sine', 0.5);
    }

    setPlaying(true);
    const total = direction === 'harmonic' ? noteDur : noteDur * 2 + gap;
    setTimeout(() => { setPlaying(false); onComplete?.(); }, total * 1000 + 100);
  };

  return (
    <button onClick={handle} disabled={playing}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 rounded-lg font-semibold">
      {playing ? '♪ Playing...' : `♪ ${label}`}
    </button>
  );
}
