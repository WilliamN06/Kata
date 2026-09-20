import type { VariableDimension } from '@kata/core';
import { ALL_NOTE_OPTIONS } from '@kata/audio';

export const TIMBRE_OPTIONS = [
  // Synthesised (oscillator)
  { value: 'sine', label: 'Sine (pure)' },
  { value: 'triangle', label: 'Triangle (soft)' },
  { value: 'sawtooth', label: 'Sawtooth (bright)' },
  { value: 'square', label: 'Square (hollow)' },

  // Sampled (SF3)
  { value: 'acoustic_grand_piano', label: 'Piano' },
  { value: 'acoustic_guitar_nylon', label: 'Guitar (nylon)' },
  { value: 'string_ensemble_1', label: 'Strings' },
  { value: 'violin', label: 'Violin' },
  { value: 'cello', label: 'Cello' },
  { value: 'pizzicato_strings', label: 'Pizzicato' },
  { value: 'orchestral_harp', label: 'Harp' },
  { value: 'drawbar_organ', label: 'Organ' },
  { value: 'clarinet', label: 'Clarinet' },
  { value: 'flute', label: 'Flute' },
  { value: 'trumpet', label: 'Trumpet' },
  { value: 'french_horn', label: 'French horn' },
  { value: 'brass_section', label: 'Brass section' },
  { value: 'tubular_bells', label: 'Tubular bells' },
  { value: 'glockenspiel', label: 'Glockenspiel' },
  { value: 'marimba', label: 'Marimba' },
  { value: 'celesta', label: 'Celesta' },
  { value: 'sitar', label: 'Sitar' },
  { value: 'kalimba', label: 'Kalimba' },
];
export const REVERB_OPTIONS = [
  { value: 'dry', label: 'Dry' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hall', label: 'Hall' },
];

export const NOISE_OPTIONS = [
  { value: 'silent', label: 'Silent' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'moderate', label: 'Moderate' },
];

export const HARMONICS_OPTIONS = [
  { value: 'simple', label: 'Simple (fundamental only)' },
  { value: 'moderate', label: 'Moderate (2–3 harmonics)' },
  { value: 'rich', label: 'Rich (full spectrum)' },
];

export const PLAYBACK_OPTIONS = [
  { value: 'once', label: 'Play once' },
  { value: 'repeat-twice', label: 'Repeat ×2' },
  { value: 'repeat-thrice', label: 'Repeat ×3' },
  { value: 'loop', label: 'Loop' },
];

/**
 * Note range as dropdowns of note names. Values are MIDI numbers.
 */
export const NOTE_RANGE: VariableDimension[] = [
  {
    id: 'noteMin',
    label: 'Lowest Note',
    kind: 'select',
    defaultValue: 48,
    description: 'Lowest note the drill may use.',
    options: ALL_NOTE_OPTIONS.map((o) => ({ value: o.midi, label: o.label })),
  },
  {
    id: 'noteMax',
    label: 'Highest Note',
    kind: 'select',
    defaultValue: 84,
    description: 'Highest note the drill may use.',
    options: ALL_NOTE_OPTIONS.map((o) => ({ value: o.midi, label: o.label })),
  },
];

export const INTERVAL_RANGE: VariableDimension[] = [
  {
    id: 'intervalMin',
    label: 'Interval Min (semitones)',
    kind: 'range',
    defaultValue: 0,
    range: { min: 0, max: 12, step: 1 },
  },
  {
    id: 'intervalMax',
    label: 'Interval Max (semitones)',
    kind: 'range',
    defaultValue: 12,
    range: { min: 0, max: 12, step: 1 },
  },
];

export const STIMULUS_BASE: VariableDimension[] = [
  {
    id: 'stim_timbre',
    label: 'Timbre',
    kind: 'select',
    defaultValue: 'sine',
    description: 'Tone character.',
    options: TIMBRE_OPTIONS,
  },
  { id: 'stim_reverb', label: 'Reverb', kind: 'select', defaultValue: 'dry', options: REVERB_OPTIONS },
  { id: 'stim_noise', label: 'Background Noise', kind: 'select', defaultValue: 'silent', options: NOISE_OPTIONS },
];

export const STIMULUS_WITH_HARMONICS: VariableDimension[] = [
  ...STIMULUS_BASE,
  { id: 'stim_harmonics', label: 'Harmonic Content', kind: 'select', defaultValue: 'rich', options: HARMONICS_OPTIONS },
];

export const TASK_BASE: VariableDimension[] = [
  { id: 'task_playbackStyle', label: 'Playback', kind: 'select', defaultValue: 'once', options: PLAYBACK_OPTIONS },
  { id: 'task_tempo', label: 'Tempo (BPM)', kind: 'range', defaultValue: 80, range: { min: 20, max: 300, step: 5 },
    description: 'Scales note durations. Lower BPM = slower playback.' },
  { id: 'task_tolerance', label: 'Tolerance (steps)', kind: 'range', defaultValue: 0, range: { min: 0, max: 4, step: 1 },
    description: 'How far off the user may be for the answer to count. 0 = exact.' },
];

export const TASK_REFERENCE: VariableDimension = {
  id: 'task_referencePlayback',
  label: 'Reference Playback',
  kind: 'select',
  defaultValue: 'before',
  options: [
    { value: 'before', label: 'Before target' },
    { value: 'after', label: 'After target' },
    { value: 'both', label: 'Before & after' },
    { value: 'never', label: 'No reference' },
  ],
};

export const TASK_ASSESSMENT: VariableDimension = {
  id: 'task_assessmentMode',
  label: 'Assessment Mode',
  kind: 'select',
  defaultValue: 'standard',
  options: [{ value: 'standard', label: 'Standard' }],
};

/**
 * Map task_playbackStyle to the player's repeats / loop props.
 */
export function parsePlayback(style: string | undefined): { repeats: 1 | 2 | 3; loop: boolean } {
  switch (style) {
    case 'repeat-twice': return { repeats: 2, loop: false };
    case 'repeat-thrice': return { repeats: 3, loop: false };
    case 'loop': return { repeats: 1, loop: true };
    default: return { repeats: 1, loop: false };
  }
}

/**
 * Scale a base duration (in seconds, at the reference tempo of 80 BPM) by
 * the user's tempo.
 */
export function scaleDuration(baseSeconds: number, tempo: number | undefined): number {
  const t = tempo ?? 80;
  if (t <= 0) return baseSeconds;
  return baseSeconds * (80 / t);
}