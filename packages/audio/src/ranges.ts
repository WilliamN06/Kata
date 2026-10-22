import { PITCH_CLASSES } from './pitch';

/** Lowest and highest MIDI we allow in the drills. */
export const MIDI_MIN = 21;  // A0
export const MIDI_MAX = 108; // C8

export interface NoteOption {
  midi: number;
  label: string;
}

export function midiToNoteName(midi: number): string {
  const clamped = Math.max(MIDI_MIN, Math.min(MIDI_MAX, Math.round(midi)));
  const pc = ((clamped % 12) + 12) % 12;
  const octave = Math.floor(clamped / 12) - 1;
  return `${PITCH_CLASSES[pc] ?? 'C'}${octave}`;
}

export function clampMidi(midi: number): number {
  return Math.max(MIDI_MIN, Math.min(MIDI_MAX, Math.round(midi)));
}

/** Every possible note the panel can offer, labelled by name. */
export const ALL_NOTE_OPTIONS: NoteOption[] = Array.from(
  { length: MIDI_MAX - MIDI_MIN + 1 },
  (_, i) => {
    const midi = MIDI_MIN + i;
    return { midi, label: midiToNoteName(midi) };
  },
);

/**
 * Pick a root MIDI inside [noteMin, noteMax] such that root + semitones stays
 * inside the range. If the range is too narrow for the interval, the range is
 * expanded around its centre to fit.
 */
export function pickRootForInterval(
  noteMin: number,
  noteMax: number,
  semitones: number,
): { root: number; top: number } {
  const low = clampMidi(noteMin);
  const high = clampMidi(noteMax);
  const a = Math.min(low, high);
  const b = Math.max(low, high);
  const span = Math.abs(semitones);

  if (b - a < span) {
    const centre = Math.round((a + b) / 2);
    const root = clampMidi(centre - Math.floor(span / 2));
    return { root, top: clampMidi(root + span) };
  }
  const room = b - a - span;
  const root = a + Math.floor(Math.random() * (room + 1));
  return { root, top: root + span };
}

/** Random MIDI inside [noteMin, noteMax]. */
export function pickMidiInRange(noteMin: number, noteMax: number): number {
  const a = clampMidi(noteMin);
  const b = clampMidi(noteMax);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/** Random interval (semitones) inside [intervalMin, intervalMax]. */
export function pickIntervalInRange(intervalMin: number, intervalMax: number): number {
  const a = Math.max(0, Math.min(12, Math.round(intervalMin)));
  const b = Math.max(0, Math.min(12, Math.round(intervalMax)));
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/**
 * Intersect a preset pool of semitones with the numeric interval range. If the
 * intersection is empty, fall back to the numeric range.
 */
export function filterPoolByInterval(
  pool: number[],
  intervalMin: number,
  intervalMax: number,
): number[] {
  const a = Math.max(0, Math.min(12, Math.round(intervalMin)));
  const b = Math.max(0, Math.min(12, Math.round(intervalMax)));
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const filtered = pool.filter((v) => v >= lo && v <= hi);
  if (filtered.length > 0) return filtered;
  // Fall back to numeric
  const out: number[] = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out.length > 0 ? out : [lo];
}