/**
 * Interval helpers. Now driven by user-specified min/max semitones
 * (not preset subsets). The range determines the pool of possible
 * intervals, and also how many answer buttons appear.
 */

export const SEMITONE_NAMES: Record<number, string> = {
  0: 'Unison (P1)',
  1: 'Minor 2nd (m2)',
  2: 'Major 2nd (M2)',
  3: 'Minor 3rd (m3)',
  4: 'Major 3rd (M3)',
  5: 'Perfect 4th (P4)',
  6: 'Tritone (TT)',
  7: 'Perfect 5th (P5)',
  8: 'Minor 6th (m6)',
  9: 'Major 6th (M6)',
  10: 'Minor 7th (m7)',
  11: 'Major 7th (M7)',
  12: 'Octave (P8)',
  13: 'Minor 9th (m9)',
  14: 'Major 9th (M9)',
  15: 'Minor 10th (m10)',
  16: 'Major 10th (M10)',
  17: 'Perfect 11th (P11)',
  18: 'Augmented 11th (A11)',
  19: 'Perfect 12th (P12)',
  20: 'Minor 13th (m13)',
  21: 'Major 13th (M13)',
  22: 'Minor 14th (m14)',
  23: 'Major 14th (M14)',
  24: 'Double Octave (P15)',
};

/**
 * Returns the pool of possible semitone values given a min and max.
 * Every integer from min to max inclusive is a candidate.
 */
export function getIntervalPool(minSemitones: number, maxSemitones: number): number[] {
  const lo = Math.max(0, Math.min(24, Math.floor(minSemitones)));
  const hi = Math.max(lo, Math.min(24, Math.floor(maxSemitones)));
  const out: number[] = [];
  for (let s = lo; s <= hi; s++) out.push(s);
  return out;
}

/** Button label: "7 (Perfect 5th (P5))" */
export function semitoneFullLabel(n: number): string {
  const name = SEMITONE_NAMES[n];
  if (name) return `${n} (${name})`;
  return `${n} semitones`;
}

/** Short label: "7 (Perfect 5th)" */
export function semitoneLabel(n: number): string {
  const name = SEMITONE_NAMES[n];
  if (name) return `${n} (${name.split(' ')[0]})`;
  return `${n} semitones`;
}
