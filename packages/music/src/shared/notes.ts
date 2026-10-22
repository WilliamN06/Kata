/**
 * Musical note utilities — frequency ↔ note name conversion.
 * Uses A4 = 440 Hz, equal temperament.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function frequencyToNote(freq: number): { name: string; octave: number; cents: number } {
  if (!Number.isFinite(freq) || freq <= 0) return { name: '?', octave: 0, cents: 0 };
  const midi = 69 + 12 * Math.log2(freq / 440);
  const rounded = Math.round(midi);
  const cents = Math.round((midi - rounded) * 100);
  const pc = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  return { name: NOTE_NAMES[pc], octave, cents };
}

export function frequencyToNoteString(freq: number): string {
  const { name, octave, cents } = frequencyToNote(freq);
  const centsStr = cents === 0 ? '' : cents > 0 ? ` +${cents}¢` : ` ${cents}¢`;
  return `${name}${octave}${centsStr}`;
}

export function noteToFrequency(note: string, octave: number): number {
  const pc = NOTE_NAMES.indexOf(note);
  if (pc === -1) return 440;
  const midi = (octave + 1) * 12 + pc;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function intervalName(semitones: number): string {
  const names = [
    'Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd',
    'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th',
    'Minor 7th', 'Major 7th', 'Octave', 'Minor 9th', 'Major 9th',
  ];
  const idx = Math.round(semitones);
  if (idx >= 0 && idx < names.length) return names[idx];
  return idx + ' semitones';
}

export function semitonesBetween(freq1: number, freq2: number): number {
  return 12 * Math.log2(freq2 / freq1);
}

