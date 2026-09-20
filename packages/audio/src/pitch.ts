export const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const INTERVAL_NAMES = [
  'Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd',
  'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th',
  'Minor 7th', 'Major 7th', 'Octave',
];

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

export function noteToFrequency(note: string, octave: number): number {
  const pc = PITCH_CLASSES.indexOf(note);
  if (pc === -1) throw new Error(`Unknown note: ${note}`);
  const midi = (octave + 1) * 12 + pc;
  return midiToFrequency(midi);
}

export function pitchClassToFrequency(pitchClass: number, octave: number): number {
  const midi = (octave + 1) * 12 + pitchClass;
  return midiToFrequency(midi);
}

export function semitonesToCents(semitones: number): number {
  return semitones * 100;
}

export function detuneFrequency(freq: number, cents: number): number {
  return freq * Math.pow(2, cents / 1200);
}

export function buildChord(rootPitchClass: number, chordType: string, octave = 4): number[] {
  const intervals: Record<string, number[]> = {
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
  const rootFreq = pitchClassToFrequency(rootPitchClass, octave);
  return (intervals[chordType] ?? [0, 4, 7]).map((semi) => rootFreq * Math.pow(2, semi / 12));
}

export function buildChordMidi(rootMidi: number, chordType: string): number[] {
  const intervals: Record<string, number[]> = {
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
  return (intervals[chordType] ?? [0, 4, 7]).map((semi) => rootMidi + semi);
}

export function getEnharmonic(pitchClass: number): string {
  const enharmonics: Record<number, string> = {
    0: 'B#/C', 1: 'C#/Db', 2: 'D', 3: 'D#/Eb', 4: 'E/Fb', 5: 'E#/F',
    6: 'F#/Gb', 7: 'G', 8: 'G#/Ab', 9: 'A', 10: 'A#/Bb', 11: 'B/Cb',
  };
  return enharmonics[pitchClass] ?? '';
}

export function scaleDeltaToRange(
  delta: number,
  range: string,
  ranges: Record<string, [number, number]>,
): number {
  const entry = ranges[range] ?? Object.values(ranges)[0] ?? [0, 1];
  const [min, max] = entry;
  const t = Math.max(0, Math.min(1, delta));
  return min + t * (max - min);
}