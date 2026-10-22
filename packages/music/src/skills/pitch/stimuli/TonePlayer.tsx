import { useState } from 'react';
import { getAudioContext, getMasterBus, resumeAudio, playTone } from '@kata/audio';

interface TonePlayerProps {
  frequency: number;
  durationMs: number;
  waveform?: 'sine' | 'triangle' | 'sawtooth' | 'square';
  gain?: number;
  label?: string;
  onComplete?: () => void;
}

export function TonePlayer({ frequency, durationMs, waveform = 'sine', gain = 0.4, label = 'PLAY', onComplete }: TonePlayerProps) {
  const [playing, setPlaying] = useState(false);

  const handle = async () => {
    await resumeAudio();
    const ctx = getAudioContext();
    const start = ctx.currentTime + 0.05;
    playTone(frequency, start, durationMs / 1000, waveform, gain);
    setPlaying(true);
    setTimeout(() => { setPlaying(false); onComplete?.(); }, durationMs + 100);
  };

  return (
    <button onClick={handle} disabled={playing}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 rounded-lg font-semibold">
      {playing ? '♪ Playing...' : `♪ ${label}`}
    </button>
  );
}
