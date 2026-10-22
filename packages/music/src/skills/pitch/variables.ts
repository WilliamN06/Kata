import type { Variable } from '@kata/core';
import { SOUND_SOURCE_OPTIONS } from '../../shared/sound-source';

/**
 * Pitch subskill — 3 variables:
 *   V1 Pitch Value  — detect a single frequency (Hz)
 *   V2 Interval     — detect interval size in SEMITONES (0-12)
 *   V3 Chord        — recognise chord type from simultaneous tones
 *
 * V2 and V3 never touch Hz. V1 is the only Hz variable.
 */

// -----------------------------------------------------------------
// NOTE CATALOGUE — dropdown options for root note
// -----------------------------------------------------------------
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function buildNoteOptions() {
  const options: Array<{ value: string; label: string }> = [];
  // Octaves 1 through 7 (C1 is ~32 Hz, C7 is ~2093 Hz)
  for (let octave = 1; octave <= 7; octave++) {
    for (const name of NOTE_NAMES) {
      const freq = 440 * Math.pow(2, ((octave + 1) * 12 + NOTE_NAMES.indexOf(name) - 69) / 12);
      if (freq >= 20 && freq <= 8000) {
        options.push({ value: `${name}${octave}`, label: `${name}${octave} (${freq.toFixed(0)} Hz)` });
      }
    }
  }
  return options;
}

const NOTE_OPTIONS = buildNoteOptions();

// -----------------------------------------------------------------
// COMMON STIMULUS PARAMETERS — shared by all 3 variables
// -----------------------------------------------------------------
const commonStimulusParams = [
  // Root note dropdown + random toggle + random range
  { id: 'rootNote', label: 'Root Note', kind: 'select' as const,
    defaultValue: 'A4',
    options: NOTE_OPTIONS,
    helpText: 'The base pitch. A4 = 440 Hz.' },
  { id: 'randomRoot', label: 'Randomise Root', kind: 'select' as const,
    defaultValue: 'off',
    options: [
      { value: 'off', label: 'Off (use root note above)' },
      { value: 'on', label: 'On (pick a random root each trial)' },
    ] },
  { id: 'randomRootMin', label: 'Random Root Min', kind: 'select' as const,
    defaultValue: 'C3',
    options: NOTE_OPTIONS,
    helpText: 'When Randomise Root = On, roots are picked from this range.' },
  { id: 'randomRootMax', label: 'Random Root Max', kind: 'select' as const,
    defaultValue: 'C5',
    options: NOTE_OPTIONS },

  // Note duration
  { id: 'durationMs', label: 'Note Duration', kind: 'number' as const,
    defaultValue: 800,
    range: { min: 100, max: 5000, step: 50, unit: 'ms', extendable: true } },

  // Sound source
  { id: 'soundSource', label: 'Sound Source', kind: 'select' as const,
    defaultValue: 'piano_acoustic',
    options: SOUND_SOURCE_OPTIONS,
    helpText: 'Instrument or waveform to play through.' },

  // Background noise — now actually implemented
  { id: 'backgroundNoise', label: 'Background Noise', kind: 'select' as const,
    defaultValue: 'silence',
    options: [
      { value: 'silence', label: 'Silence' },
      { value: 'white', label: 'White noise' },
      { value: 'pink', label: 'Pink noise' },
      { value: 'brown', label: 'Brown noise' },
    ],
    helpText: 'Continuous noise played in the background during trials.' },
  { id: 'backgroundNoiseLevel', label: 'Background Noise Level', kind: 'range',
    defaultValue: 0.15,
    range: { min: 0, max: 1, step: 0.05, unit: '× gain', extendable: false },
    helpText: 'Volume of the background noise relative to the tone (0 = silent, 1 = loud).' },
];

// -----------------------------------------------------------------
// V1 — Pitch Value (Hz)
// -----------------------------------------------------------------
const V1 = {
  id: 'music:p1-pitch:V1' as any,
  name: 'Pitch Value',
  definition: 'Detect the fundamental frequency of a single tone.',
  unit: 'Hz',
  defaultValue: 440,
  variableDimensions: [
    { id: 'frequency', label: 'Frequency', kind: 'range',
      defaultValue: 440,
      range: { min: 20, max: 8000, step: 1, unit: 'Hz', extendable: true } },
    { id: 'frequencyRange', label: 'Random Range (±Hz)', kind: 'range',
      defaultValue: 200,
      range: { min: 10, max: 2000, step: 10, unit: 'Hz', extendable: true } },
  ],
  stimulusParameters: commonStimulusParams,
  visualisation: 'both',
};

// -----------------------------------------------------------------
// V2 — Interval (semitones) — now with min/max range
// -----------------------------------------------------------------
const V2 = {
  id: 'music:p1-pitch:V2' as any,
  name: 'Interval',
  definition: 'Detect the distance between two pitches as a musical interval, measured in semitones.',
  unit: 'semitones',
  defaultValue: 7,
  variableDimensions: [
    { id: 'intervalMin', label: 'Interval Min (semitones)', kind: 'number',
      defaultValue: 1,
      range: { min: 0, max: 12, step: 1, unit: 'semitones', extendable: true },
      helpText: 'Smallest interval in semitones. 0 = unison, 12 = octave.' },
    { id: 'intervalMax', label: 'Interval Max (semitones)', kind: 'number',
      defaultValue: 12,
      range: { min: 0, max: 24, step: 1, unit: 'semitones', extendable: true },
      helpText: 'Largest interval in semitones. Must be >= Interval Min.' },
    { id: 'direction', label: 'Direction', kind: 'select',
      defaultValue: 'ascending',
      options: [
        { value: 'ascending', label: 'Ascending (lower note → higher)' },
        { value: 'descending', label: 'Descending (higher → lower)' },
        { value: 'harmonic', label: 'Harmonic (both played together)' },
      ] },
    { id: 'referencePresent', label: 'Reference Tone', kind: 'select',
      defaultValue: 'present',
      options: [
        { value: 'present', label: 'Present (A plays the lower note)' },
        { value: 'absent', label: 'Absent (A and B both random)' },
      ] },
  ],
  stimulusParameters: commonStimulusParams,
  visualisation: 'both',
};

// -----------------------------------------------------------------
// V3 — Chord Perception
// -----------------------------------------------------------------
const V3 = {
  id: 'music:p1-pitch:V3' as any,
  name: 'Chord Perception',
  definition: 'Recognise the type of chord when multiple tones are played simultaneously.',
  unit: 'chord type',
  defaultValue: 0,
  variableDimensions: [
    { id: 'chordFamily', label: 'Chord Family', kind: 'select',
      defaultValue: 'all',
      options: [
        { value: 'triad', label: 'Triads (maj, min, dim, aug, 5)' },
        { value: 'seventh', label: 'Sevenths (maj7, min7, dom7, m7b5, dim7, mMaj7, aug7, augMaj7)' },
        { value: 'sus', label: 'Suspended (sus2, sus4, 7sus4)' },
        { value: 'extended', label: 'Extended (6, m6, 6add9, add9, madd9, 9, maj9, min9, 11, m11, 13)' },
        { value: 'altered', label: 'Altered (7b5, 7#5, 7b9, 7#9, 7#11)' },
        { value: 'all', label: 'All chord types (32 total)' },
      ],
      helpText: 'The drill picks a random chord from this family each trial.' },
    { id: 'voicing', label: 'Voicing', kind: 'select',
      defaultValue: 'close',
      options: [
        { value: 'close', label: 'Close (compact)' },
        { value: 'open', label: 'Open (spread)' },
        { value: 'spread', label: 'Spread (across octaves)' },
      ] },
    { id: 'inversion', label: 'Inversion', kind: 'select',
      defaultValue: 'root',
      options: [
        { value: 'root', label: 'Root position' },
        { value: 'first', label: '1st inversion' },
        { value: 'second', label: '2nd inversion' },
        { value: 'third', label: '3rd inversion' },
        { value: 'random', label: 'Random per trial' },
      ] },
    { id: 'octaveShift', label: 'Register Shift', kind: 'range',
      defaultValue: 0,
      range: { min: -24, max: 24, step: 12, unit: 'semitones', extendable: true } },
  ],
  stimulusParameters: commonStimulusParams,
  visualisation: 'both',
};

export const PITCH_VARIABLES: Variable[] = [V1, V2, V3];

