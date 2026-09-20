import type { VariableParameters, VariableDimension } from '@kata/core';
import {
  TIMBRE_OPTIONS,
  NOTE_RANGE,
  INTERVAL_RANGE,
  STIMULUS_BASE,
  STIMULUS_WITH_HARMONICS,
  TASK_BASE,
  TASK_REFERENCE,
} from './musicParams';

const TASK_ASSESSMENT_V6: VariableDimension = {
  id: 'task_assessmentMode', label: 'Assessment Mode', kind: 'select', defaultValue: 'fused-unfused',
  options: [
    { value: 'fused-unfused', label: 'Fused vs unfused' },
    { value: 'identify-notes', label: 'Identify notes' },
    { value: 'describe-color', label: 'Describe colour' },
  ],
};

const TASK_ASSESSMENT_V7: VariableDimension = {
  id: 'task_assessmentMode', label: 'Assessment Mode', kind: 'select', defaultValue: 'detect-masked',
  options: [
    { value: 'detect-masked', label: 'Detect masked' },
    { value: 'identify-target', label: 'Identify target' },
    { value: 'rank-masking', label: 'Rank masking' },
  ],
};

const TASK_ASSESSMENT_V10: VariableDimension = {
  id: 'task_assessmentMode', label: 'Assessment Mode', kind: 'select', defaultValue: 'identify-as-inversion',
  options: [
    { value: 'name-inversion', label: 'Name the inversion' },
    { value: 'identify-as-inversion', label: 'Identify as inversion' },
    { value: 'match-root', label: 'Match root' },
  ],
};

const TASK_ASSESSMENT_V11: VariableDimension = {
  id: 'task_assessmentMode', label: 'Assessment Mode', kind: 'select', defaultValue: 'same-different',
  options: [
    { value: 'same-different', label: 'Same / different' },
    { value: 'name-both', label: 'Name both' },
    { value: 'choose-correct-name', label: 'Choose correct name' },
  ],
};

// ─────────────────────────────────────────────────────────────
// V1 — Interval Discrimination
// ─────────────────────────────────────────────────────────────
const V1_VARIABLE: VariableDimension[] = [
  { id: 'intervalSet', label: 'Interval Set Preset', kind: 'select', defaultValue: 'consonant',
    description: 'Preset group. Numeric interval range below restricts the pool.',
    options: [
      { value: 'consonant', label: 'Consonant (P1, P5, M3, m3, M6, m6)' },
      { value: 'dissonant', label: 'Dissonant (M2, m2, M7, m7, TT)' },
      { value: 'perfect', label: 'Perfect (P1, P4, P5, P8)' },
      { value: 'all', label: 'All 12 intervals' },
      { value: 'random', label: 'Random' },
      { value: 'numeric', label: 'Numeric only (ignore preset)' },
    ] },
  ...INTERVAL_RANGE,
  ...NOTE_RANGE,
  { id: 'direction', label: 'Direction', kind: 'select', defaultValue: 'ascending',
    options: [
      { value: 'ascending', label: 'Ascending' },
      { value: 'descending', label: 'Descending' },
      { value: 'harmonic', label: 'Harmonic' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'noteDuration', label: 'Note Duration (s)', kind: 'range', defaultValue: 0.8,
    range: { min: 0.1, max: 5.0, step: 0.05 } },
];
export const V1_PARAMETERS: VariableParameters = {
  variableId: 'V1',
  summary: 'Identify the interval between two pitches.',
  dimensions: [...V1_VARIABLE, ...STIMULUS_WITH_HARMONICS, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V2 — Chord Quality Recognition
// ─────────────────────────────────────────────────────────────
const V2_VARIABLE: VariableDimension[] = [
  { id: 'chordSet', label: 'Chord Set', kind: 'select', defaultValue: 'triads',
    options: [
      { value: 'triads', label: 'Triads (M, m, dim, aug)' },
      { value: 'sevenths', label: 'Sevenths' },
      { value: 'extensions', label: 'Extensions (9ths)' },
      { value: 'sus', label: 'Suspended (sus2, sus4)' },
      { value: 'all', label: 'All supported chords' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'voicing', label: 'Voicing', kind: 'select', defaultValue: 'root-position',
    options: [
      { value: 'root-position', label: 'Root position' },
      { value: 'first-inversion', label: 'First inversion' },
      { value: 'second-inversion', label: 'Second inversion' },
      { value: 'spread', label: 'Spread' },
      { value: 'close', label: 'Close' },
      { value: 'mixed', label: 'Mixed' },
    ] },
  ...NOTE_RANGE,
  { id: 'duration', label: 'Chord Duration (s)', kind: 'range', defaultValue: 1.5,
    range: { min: 0.2, max: 5.0, step: 0.1 } },
];
export const V2_PARAMETERS: VariableParameters = {
  variableId: 'V2',
  summary: 'Identify chord qualities.',
  dimensions: [...V2_VARIABLE, ...STIMULUS_WITH_HARMONICS, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V3 — Tonal Centre
// ─────────────────────────────────────────────────────────────
const V3_VARIABLE: VariableDimension[] = [
  { id: 'tonalSet', label: 'Tonal Set', kind: 'select', defaultValue: 'major-only',
    options: [
      { value: 'major-only', label: 'Major only' },
      { value: 'minor-only', label: 'Minor only' },
      { value: 'modal', label: 'Modal' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'melodyLength', label: 'Melody Length (notes)', kind: 'range', defaultValue: 8,
    range: { min: 1, max: 32, step: 1 } },
  ...INTERVAL_RANGE,
  ...NOTE_RANGE,
  { id: 'harmonicSupport', label: 'Harmonic Support', kind: 'select', defaultValue: 'implied',
    options: [
      { value: 'none', label: 'None' },
      { value: 'implied', label: 'Implied (bass only)' },
      { value: 'full', label: 'Full (chord progression)' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'rhythmicCharacter', label: 'Rhythm', kind: 'select', defaultValue: 'even',
    options: [
      { value: 'even', label: 'Even' },
      { value: 'syncopated', label: 'Syncopated' },
      { value: 'varied', label: 'Varied' },
      { value: 'random', label: 'Random' },
    ] },
];
export const V3_PARAMETERS: VariableParameters = {
  variableId: 'V3',
  summary: 'Identify the tonal centre of a passage.',
  dimensions: [...V3_VARIABLE, ...STIMULUS_WITH_HARMONICS, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V4 — Pitch Class Recognition
// ─────────────────────────────────────────────────────────────
const V4_VARIABLE: VariableDimension[] = [
 { id: 'pitchSet', label: 'Pitch Set', kind: 'select', defaultValue: 'all',
    options: [
      { value: 'naturals', label: 'Naturals (C D E F G A B)' },
      { value: 'sharps', label: 'Naturals + sharps' },
      { value: 'flats', label: 'Naturals + flats' },
      { value: 'all', label: 'All 12' },
      { value: 'random', label: 'Random' },
    ] },
  ...NOTE_RANGE,
  { id: 'referenceGiven', label: 'Reference Given', kind: 'toggle', defaultValue: true },
  { id: 'referenceMidi', label: 'Reference Note', kind: 'select', defaultValue: 69,
    options: [
      { value: 57, label: 'A3' },
      { value: 60, label: 'C4' },
      { value: 69, label: 'A4 (440 Hz)' },
      { value: 72, label: 'C5' },
      { value: 81, label: 'A5' },
    ] },
  { id: 'noteDuration', label: 'Note Duration (s)', kind: 'range', defaultValue: 0.8,
    range: { min: 0.1, max: 5.0, step: 0.05 } },
];
export const V4_PARAMETERS: VariableParameters = {
  variableId: 'V4',
  summary: 'Identify individual pitch classes by name.',
  dimensions: [...V4_VARIABLE, ...STIMULUS_WITH_HARMONICS, ...TASK_BASE, TASK_REFERENCE],
};

// ─────────────────────────────────────────────────────────────
// V5 — Melodic Contour
// ─────────────────────────────────────────────────────────────
const V5_VARIABLE: VariableDimension[] = [
  { id: 'contourType', label: 'Contour Type', kind: 'select', defaultValue: 'mixed',
    options: [
      { value: 'rising', label: 'Rising' },
      { value: 'falling', label: 'Falling' },
      { value: 'arch', label: 'Arch' },
      { value: 'valley', label: 'Valley' },
      { value: 'wave', label: 'Wave' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'melodyLength', label: 'Melody Length (notes)', kind: 'range', defaultValue: 6,
    range: { min: 2, max: 16, step: 1 } },
  ...INTERVAL_RANGE,
  ...NOTE_RANGE,
  { id: 'rhythmPattern', label: 'Rhythm', kind: 'select', defaultValue: 'even',
    options: [
      { value: 'even', label: 'Even' },
      { value: 'dotted', label: 'Dotted' },
      { value: 'syncopated', label: 'Syncopated' },
      { value: 'varied', label: 'Varied' },
      { value: 'random', label: 'Random' },
    ] },
];
export const V5_PARAMETERS: VariableParameters = {
  variableId: 'V5',
  summary: 'Describe the shape of a melody.',
  dimensions: [...V5_VARIABLE, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V6 — Fusion
// ─────────────────────────────────────────────────────────────
const V6_VARIABLE: VariableDimension[] = [
  { id: 'chordSet', label: 'Chord Set', kind: 'select', defaultValue: 'triads',
    options: [
      { value: 'dyads', label: 'Dyads (2 notes)' },
      { value: 'triads', label: 'Triads (3 notes)' },
      { value: 'sevenths', label: 'Sevenths (4 notes)' },
      { value: 'extensions', label: 'Extensions (5+ notes)' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'harmonicity', label: 'Harmonicity', kind: 'select', defaultValue: 'moderate',
    options: [
      { value: 'consonant', label: 'Consonant' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'dissonant', label: 'Dissonant' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'random', label: 'Random' },
    ] },
  ...NOTE_RANGE,
  { id: 'duration', label: 'Chord Duration (s)', kind: 'range', defaultValue: 1.2,
    range: { min: 0.2, max: 5.0, step: 0.1 } },
];
export const V6_PARAMETERS: VariableParameters = {
  variableId: 'V6',
  summary: 'Perceive a chord as a unified colour vs separate pitches.',
  dimensions: [...V6_VARIABLE, ...STIMULUS_WITH_HARMONICS, ...TASK_BASE, TASK_ASSESSMENT_V6],
};

// ─────────────────────────────────────────────────────────────
// V7 — Masking
// ─────────────────────────────────────────────────────────────
const V7_VARIABLE: VariableDimension[] = [
  { id: 'maskingType', label: 'Masking Type', kind: 'select', defaultValue: 'simultaneous',
    options: [
      { value: 'simultaneous', label: 'Simultaneous' },
      { value: 'forward', label: 'Forward' },
      { value: 'backward', label: 'Backward' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'frequencySeparation', label: 'Frequency Separation', kind: 'select', defaultValue: 'close',
    options: [
      { value: 'adjacent', label: 'Adjacent (1 semitone)' },
      { value: 'close', label: 'Close (2–3 semitones)' },
      { value: 'moderate', label: 'Moderate (4–8 semitones)' },
      { value: 'far', label: 'Far (octave+)' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'targetMidi', label: 'Target Note', kind: 'select', defaultValue: 69,
    options: [
      { value: 57, label: 'A3' },
      { value: 69, label: 'A4 (440 Hz)' },
      { value: 81, label: 'A5' },
    ] },
  { id: 'maskerLevel', label: 'Masker Level (dB rel. target)', kind: 'range', defaultValue: 5,
    range: { min: -40, max: 40, step: 1 } },
  { id: 'targetDuration', label: 'Target Duration (s)', kind: 'range', defaultValue: 0.3,
    range: { min: 0.05, max: 2.0, step: 0.05 } },
  { id: 'gap', label: 'Gap (ms)', kind: 'range', defaultValue: 20,
    range: { min: 0, max: 1000, step: 10 } },
];
export const V7_PARAMETERS: VariableParameters = {
  variableId: 'V7',
  summary: 'Detect when one tone masks another.',
  dimensions: [...V7_VARIABLE, ...STIMULUS_BASE, ...TASK_BASE, TASK_ASSESSMENT_V7],
};

// ─────────────────────────────────────────────────────────────
// V8 — Phrase Boundary
// ─────────────────────────────────────────────────────────────
const V8_VARIABLE: VariableDimension[] = [
  { id: 'phraseCount', label: 'Phrase Count', kind: 'range', defaultValue: 3,
    range: { min: 2, max: 8, step: 1 } },
  { id: 'boundaryClarity', label: 'Boundary Clarity', kind: 'select', defaultValue: 'moderate',
    options: [
      { value: 'clear', label: 'Clear (long pause + cadence)' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'subtle', label: 'Subtle' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'melodyLength', label: 'Melody Length (notes)', kind: 'range', defaultValue: 12,
    range: { min: 4, max: 64, step: 1 } },
  ...INTERVAL_RANGE,
  ...NOTE_RANGE,
  { id: 'harmonicSupport', label: 'Harmonic Support', kind: 'select', defaultValue: 'implied',
    options: [
      { value: 'none', label: 'None' },
      { value: 'implied', label: 'Implied' },
      { value: 'full', label: 'Full' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'tapToleranceMs', label: 'Tap Tolerance (ms)', kind: 'range', defaultValue: 200,
    range: { min: 20, max: 1000, step: 10 },
    description: 'How close a tap must be to a phrase boundary.' },
];
export const V8_PARAMETERS: VariableParameters = {
  variableId: 'V8',
  summary: 'Identify phrase boundaries in a melodic passage.',
  dimensions: [...V8_VARIABLE, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V9 — Microtonal Deviation
// ─────────────────────────────────────────────────────────────
const V9_VARIABLE: VariableDimension[] = [
  { id: 'deviationRange', label: 'Deviation Range', kind: 'select', defaultValue: 'moderate',
    options: [
      { value: 'extreme', label: 'Extreme (±2–5¢)' },
      { value: 'subtle', label: 'Subtle (±5–20¢)' },
      { value: 'moderate', label: 'Moderate (±20–40¢)' },
      { value: 'large', label: 'Large (±40–50¢)' },
      { value: 'numeric', label: 'Numeric (use range below)' },
    ] },
  { id: 'deviationMinCents', label: 'Deviation Min (cents)', kind: 'range', defaultValue: 5,
    range: { min: 1, max: 50, step: 1 } },
  { id: 'deviationMaxCents', label: 'Deviation Max (cents)', kind: 'range', defaultValue: 40,
    range: { min: 1, max: 50, step: 1 } },
  { id: 'referencePresent', label: 'Reference Present', kind: 'toggle', defaultValue: true },
  { id: 'deviationDirection', label: 'Deviation Direction', kind: 'select', defaultValue: 'both',
    options: [
      { value: 'sharp', label: 'Sharp only' },
      { value: 'flat', label: 'Flat only' },
      { value: 'both', label: 'Both' },
      { value: 'random', label: 'Random' },
    ] },
  ...NOTE_RANGE,
];
export const V9_PARAMETERS: VariableParameters = {
  variableId: 'V9',
  summary: 'Detect small deviations from intended pitch.',
  dimensions: [...V9_VARIABLE, ...STIMULUS_BASE, ...TASK_BASE, TASK_REFERENCE],
};

// ─────────────────────────────────────────────────────────────
// V10 — Interval Inversion
// ─────────────────────────────────────────────────────────────
const V10_VARIABLE: VariableDimension[] = [
  { id: 'intervalSet', label: 'Interval Set', kind: 'select', defaultValue: 'imperfect',
    options: [
      { value: 'perfect', label: 'Perfect (P1↔P8, P4↔P5)' },
      { value: 'imperfect', label: 'Imperfect' },
      { value: 'all', label: 'All' },
      { value: 'numeric', label: 'Numeric only' },
      { value: 'random', label: 'Random' },
    ] },
  ...INTERVAL_RANGE,
  { id: 'direction', label: 'Direction', kind: 'select', defaultValue: 'ascending',
    options: [
      { value: 'ascending', label: 'Ascending' },
      { value: 'descending', label: 'Descending' },
      { value: 'harmonic', label: 'Harmonic' },
      { value: 'random', label: 'Random' },
    ] },
  ...NOTE_RANGE,
  { id: 'inversionDepth', label: 'Inversion Depth', kind: 'select', defaultValue: 'single',
    options: [
      { value: 'single', label: 'Single (one octave up)' },
      { value: 'double', label: 'Double (two octaves up)' },
      { value: 'random', label: 'Random' },
    ] },
];
export const V10_PARAMETERS: VariableParameters = {
  variableId: 'V10',
  summary: 'Identify an interval by its inversion.',
  dimensions: [...V10_VARIABLE, ...STIMULUS_BASE, ...TASK_BASE, TASK_ASSESSMENT_V10],
};

// ─────────────────────────────────────────────────────────────
// V11 — Enharmonic Equivalence
// ─────────────────────────────────────────────────────────────
const V11_VARIABLE: VariableDimension[] = [
  { id: 'pairSet', label: 'Pair Set', kind: 'select', defaultValue: 'common',
    options: [
      { value: 'common', label: 'Common pairs (F#/Gb, C#/Db, G#/Ab, D#/Eb, A#/Bb)' },
      { value: 'all', label: 'All enharmonic pairs' },
      { value: 'random', label: 'Random' },
    ] },
  { id: 'direction', label: 'Direction', kind: 'select', defaultValue: 'sequential',
    options: [
      { value: 'sequential', label: 'Sequential' },
      { value: 'harmonic', label: 'Harmonic' },
      { value: 'random', label: 'Random' },
    ] },
  ...NOTE_RANGE,
  { id: 'tuningSystem', label: 'Tuning System', kind: 'select', defaultValue: 'equal-temperament',
    options: [
      { value: 'equal-temperament', label: 'Equal temperament (identical)' },
      { value: 'just-intonation', label: 'Just intonation (slightly different)' },
      { value: 'random', label: 'Random' },
    ] },
];
export const V11_PARAMETERS: VariableParameters = {
  variableId: 'V11',
  summary: 'Recognize that two differently-named pitches sound identical.',
  dimensions: [...V11_VARIABLE, ...STIMULUS_BASE, ...TASK_BASE, TASK_ASSESSMENT_V11],
};

// ─────────────────────────────────────────────────────────────
// V12 — Absolute Pitch
// ─────────────────────────────────────────────────────────────
const V12_VARIABLE: VariableDimension[] = [
  { id: 'pitchSet', label: 'Pitch Set', kind: 'select', defaultValue: 'all',
    options: [
      { value: 'white-keys', label: 'White keys only (C D E F G A B)' },
      { value: 'all', label: 'All 12' },
      { value: 'random', label: 'Random' },
    ] },
  ...NOTE_RANGE,
  { id: 'referenceGiven', label: 'Reference Given', kind: 'toggle', defaultValue: false },
  { id: 'referenceMidi', label: 'Reference Note', kind: 'select', defaultValue: 69,
    options: [
      { value: 57, label: 'A3' },
      { value: 60, label: 'C4' },
      { value: 69, label: 'A4 (440 Hz)' },
      { value: 72, label: 'C5' },
    ] },
  { id: 'noteDuration', label: 'Note Duration (s)', kind: 'range', defaultValue: 1.0,
    range: { min: 0.1, max: 5.0, step: 0.05 } },
];
export const V12_PARAMETERS: VariableParameters = {
  variableId: 'V12',
  summary: 'Name a pitch class without a reference.',
  dimensions: [...V12_VARIABLE, ...STIMULUS_BASE, ...TASK_BASE, TASK_REFERENCE],
};

// ─────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────
export const MUSIC_P1_PARAMETERS: Record<string, VariableParameters> = {
  V1: V1_PARAMETERS,
  V2: V2_PARAMETERS,
  V3: V3_PARAMETERS,
  V4: V4_PARAMETERS,
  V5: V5_PARAMETERS,
  V6: V6_PARAMETERS,
  V7: V7_PARAMETERS,
  V8: V8_PARAMETERS,
  V9: V9_PARAMETERS,
  V10: V10_PARAMETERS,
  V11: V11_PARAMETERS,
  V12: V12_PARAMETERS,
};