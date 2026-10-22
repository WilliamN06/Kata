export const NOTE_NAMES: readonly string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function noteToFrequency(note: string, octave: number): number {
  const pc = NOTE_NAMES.indexOf(note);
  if (pc === -1) throw new Error(`Unknown note: ${note}`);
  const midi = (octave + 1) * 12 + pc;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToNote(freq: number): { note: string; octave: number; cents: number } {
  const midi = 69 + 12 * Math.log2(freq / 440);
  const rounded = Math.round(midi);
  const cents = Math.round((midi - rounded) * 100);
  const pc = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  return { note: NOTE_NAMES[pc] ?? 'C', octave, cents };
}

export function frequencyToNoteString(freq: number): string {
  const info = frequencyToNote(freq);
  return `${info.note}${info.octave}`;
}

export function intervalToFrequency(root: number, semitones: number): number {
  return root * Math.pow(2, semitones / 12);
}

export function centsToFrequency(root: number, cents: number): number {
  return root * Math.pow(2, cents / 1200);
}

export function centsToSemitones(cents: number): number {
  return cents / 100;
}

export function semitonesToCents(semitones: number): number {
  return semitones * 100;
}

export function applyInterval(baseHz: number, cents: number): number {
  return baseHz * Math.pow(2, cents / 1200);
}
