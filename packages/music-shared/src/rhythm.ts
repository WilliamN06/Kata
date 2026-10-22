export function bpmToSecondsPerBeat(bpm: number): number {
  return 60 / bpm;
}

export function bpmToSecondsPerBar(bpm: number, beatsPerBar = 4): number {
  return (60 / bpm) * beatsPerBar;
}

export function subdivisionToMs(subdivision: string, bpm: number): number {
  const parts = subdivision.split('/').map(Number);
  const num = parts[0];
  const den = parts[1];
  if (num === undefined || den === undefined || !num || !den) {
    return bpmToSecondsPerBeat(bpm) * 1000;
  }
  return (60 / bpm) * 1000 * (num / den);
}

export function applySwing(onsets: number[], swingPercent: number): number[] {
  const offset = (swingPercent / 100) * 0.5;
  return onsets.map((t, i) => (i % 2 === 1 ? t + offset : t));
}

export function estimateTempoFromTaps(timestamps: number[]): number | null {
  if (timestamps.length < 2) return null;
  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    const prev = timestamps[i - 1];
    const cur = timestamps[i];
    if (prev !== undefined && cur !== undefined) intervals.push(cur - prev);
  }
  intervals.sort((a, b) => a - b);
  const trimmed = intervals.slice(1, -1);
  if (trimmed.length === 0) return null;
  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  return 60 / (avg / 1000);
}

export function polyrhythmOnsets(ratioA: number, ratioB: number, durationSeconds: number) {
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < ratioA; i++) a.push((i / ratioA) * durationSeconds);
  for (let i = 0; i < ratioB; i++) b.push((i / ratioB) * durationSeconds);
  return { a, b };
}
