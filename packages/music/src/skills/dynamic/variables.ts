import type { Variable } from '@kata/core';
import { SOUND_SOURCE_OPTIONS } from '../../shared/sound-source';

export const DYNAMIC_VARIABLES: Variable[] = [
  {
    id: 'music:p2-dynamic:V1' as any,
    name: 'Amplitude',
    definition: 'The capacity to detect the amplitude of a sound',
    unit: 'dB',
    defaultValue: -20,
    variableDimensions: [
      { id: 'referenceLevel', label: 'Reference Level', kind: 'number', defaultValue: -20, range: { min: -200, max: 20, step: 0.5, unit: 'dB', extendable: true } },
      { id: 'offset', label: 'Offset', kind: 'number', defaultValue: 3, range: { min: -100, max: 100, step: 0.5, unit: 'dB', extendable: true } },
      { id: 'comparison', label: 'Comparison', kind: 'select', options: [{ value: 'same-timbre', label: 'Same timbre' }, { value: 'different-timbre', label: 'Different timbre' }], defaultValue: 'same-timbre' },
    ],
    stimulusParameters: [
        {
      id: 'soundSource',
      label: 'Sound Source',
      kind: 'select',
      options: SOUND_SOURCE_OPTIONS,
      defaultValue: 'guitar_nylon',
    },
      { id: 'frequency', label: 'Frequency', kind: 'number', defaultValue: 1000, range: { min: 1, max: 40000, step: 1, unit: 'Hz', extendable: true } },
      { id: 'durationMs', label: 'Duration', kind: 'number', defaultValue: 800, range: { min: 50, max: 10000, step: 10, unit: 'ms', extendable: true } },
      { id: 'gapMs', label: 'Gap Between Tones', kind: 'number', defaultValue: 300, range: { min: 0, max: 5000, step: 10, unit: 'ms', extendable: true } },
    ],
    visualisation: 'loudness-meter',
  },
  {
    id: 'music:p2-dynamic:V2' as any,
    name: 'Amplitude Envelope',
    definition: 'The capacity to detect the shape of amplitude over time (ADSR)',
    unit: 'ms',
    defaultValue: 50,
    variableDimensions: [
      { id: 'stage', label: 'Stage', kind: 'select', options: [{ value: 'attack', label: 'Attack' }, { value: 'decay', label: 'Decay' }, { value: 'sustain', label: 'Sustain' }, { value: 'release', label: 'Release' }, { value: 'all', label: 'All' }], defaultValue: 'attack' },
      { id: 'attackMs', label: 'Attack Time', kind: 'number', defaultValue: 5, range: { min: 0, max: 10000, step: 1, unit: 'ms', extendable: true } },
      { id: 'decayMs', label: 'Decay Time', kind: 'number', defaultValue: 100, range: { min: 0, max: 10000, step: 1, unit: 'ms', extendable: true } },
      { id: 'sustainLevel', label: 'Sustain Level', kind: 'number', defaultValue: 60, range: { min: 0, max: 100, step: 1, unit: '%', extendable: false } },
      { id: 'releaseMs', label: 'Release Time', kind: 'number', defaultValue: 50, range: { min: 0, max: 10000, step: 1, unit: 'ms', extendable: true } },
    ],
    stimulusParameters: [
        {
      id: 'soundSource',
      label: 'Sound Source',
      kind: 'select',
      options: SOUND_SOURCE_OPTIONS,
      defaultValue: 'guitar_nylon',
    },
      { id: 'carrierFrequency', label: 'Carrier Frequency', kind: 'number', defaultValue: 440, range: { min: 1, max: 40000, step: 1, unit: 'Hz', extendable: true } },
      { id: 'sustainDurationMs', label: 'Sustain Duration', kind: 'number', defaultValue: 500, range: { min: 0, max: 10000, step: 10, unit: 'ms', extendable: true } },
      { id: 'reverb', label: 'Reverb', kind: 'select', options: [{ value: 'none', label: 'None' }, { value: 'room', label: 'Room' }, { value: 'hall', label: 'Hall' }], defaultValue: 'none' },
    ],
    visualisation: 'waveform-envelope',
  },
  {
    id: 'music:p2-dynamic:V3' as any,
    name: 'Masking',
    definition: 'The capacity to detect when one sound obscures another',
    unit: 'dB',
    defaultValue: 10,
    variableDimensions: [
      { id: 'direction', label: 'Direction', kind: 'select', options: [{ value: 'forward', label: 'Forward' }, { value: 'backward', label: 'Backward' }, { value: 'simultaneous', label: 'Simultaneous' }], defaultValue: 'forward' },
      { id: 'targetFrequency', label: 'Target Frequency', kind: 'number', defaultValue: 1000, range: { min: 1, max: 40000, step: 1, unit: 'Hz', extendable: true } },
      { id: 'maskerFrequency', label: 'Masker Frequency', kind: 'number', defaultValue: 1200, range: { min: 1, max: 40000, step: 1, unit: 'Hz', extendable: true } },
      { id: 'timeGapMs', label: 'Time Gap', kind: 'number', defaultValue: 20, range: { min: 0, max: 1000, step: 1, unit: 'ms', extendable: true } },
    ],
    stimulusParameters: [
        {
      id: 'soundSource',
      label: 'Sound Source',
      kind: 'select',
      options: SOUND_SOURCE_OPTIONS,
      defaultValue: 'guitar_nylon',
    },
      { id: 'targetLevel', label: 'Target Level', kind: 'number', defaultValue: -20, range: { min: -100, max: 0, step: 0.5, unit: 'dB', extendable: true } },
      { id: 'maskerLevel', label: 'Masker Level', kind: 'number', defaultValue: -15, range: { min: -100, max: 0, step: 0.5, unit: 'dB', extendable: true } },
      { id: 'targetDurationMs', label: 'Target Duration', kind: 'number', defaultValue: 100, range: { min: 10, max: 5000, step: 10, unit: 'ms', extendable: true } },
    ],
    visualisation: 'spectrum',
  },
  {
    id: 'music:p2-dynamic:V4' as any,
    name: 'Dynamic Span',
    definition: 'The capacity to detect the range between loudest and quietest',
    unit: 'dB',
    defaultValue: 20,
    variableDimensions: [
      { id: 'rangeDb', label: 'Dynamic Range', kind: 'number', defaultValue: 20, range: { min: 0, max: 200, step: 0.5, unit: 'dB', extendable: true } },
      { id: 'type', label: 'Type', kind: 'select', options: [{ value: 'compressed', label: 'Compressed' }, { value: 'uncompressed', label: 'Uncompressed' }, { value: 'over-compressed', label: 'Over-compressed' }], defaultValue: 'uncompressed' },
    ],
    stimulusParameters: [
        {
      id: 'soundSource',
      label: 'Sound Source',
      kind: 'select',
      options: SOUND_SOURCE_OPTIONS,
      defaultValue: 'guitar_nylon',
    },
      { id: 'sourceType', label: 'Source Type', kind: 'select', options: [{ value: 'melody', label: 'Melody' }, { value: 'drum-loop', label: 'Drum loop' }, { value: 'pad', label: 'Pad' }], defaultValue: 'melody' },
      { id: 'durationMs', label: 'Duration', kind: 'number', defaultValue: 3000, range: { min: 100, max: 30000, step: 100, unit: 'ms', extendable: true } },
    ],
    visualisation: 'waveform',
  },
  {
    id: 'music:p2-dynamic:V5' as any,
    name: 'Compression',
    definition: 'The capacity to detect the reduction of dynamic span',
    unit: 'ratio',
    defaultValue: 4,
    variableDimensions: [
      { id: 'ratio', label: 'Ratio', kind: 'number', defaultValue: 4, range: { min: 1, max: 100, step: 0.1, unit: ':1', extendable: true } },
      { id: 'attackMs', label: 'Attack', kind: 'number', defaultValue: 10, range: { min: 0.1, max: 1000, step: 0.1, unit: 'ms', extendable: true } },
      { id: 'releaseMs', label: 'Release', kind: 'number', defaultValue: 150, range: { min: 1, max: 10000, step: 1, unit: 'ms', extendable: true } },
      { id: 'thresholdDb', label: 'Threshold', kind: 'number', defaultValue: -20, range: { min: -100, max: 0, step: 0.5, unit: 'dB', extendable: true } },
    ],
    stimulusParameters: [
        {
      id: 'soundSource',
      label: 'Sound Source',
      kind: 'select',
      options: SOUND_SOURCE_OPTIONS,
      defaultValue: 'guitar_nylon',
    },
      { id: 'sourceType', label: 'Source Type', kind: 'select', options: [{ value: 'drum-loop', label: 'Drum loop' }, { value: 'full-mix', label: 'Full mix' }, { value: 'vocal', label: 'Vocal' }], defaultValue: 'drum-loop' },
    ],
    visualisation: 'waveform',
  },
  {
    id: 'music:p2-dynamic:V6' as any,
    name: 'Frequency-Dependent Amplitude',
    definition: 'The capacity to detect amplitude variation across frequency',
    unit: 'dB SPL',
    defaultValue: 60,
    variableDimensions: [
      { id: 'frequency', label: 'Frequency', kind: 'number', defaultValue: 1000, range: { min: 1, max: 40000, step: 1, unit: 'Hz', extendable: true } },
      { id: 'spl', label: 'Sound Pressure Level', kind: 'number', defaultValue: 60, range: { min: 0, max: 140, step: 1, unit: 'dB SPL', extendable: true } },
    ],
    stimulusParameters: [
        {
      id: 'soundSource',
      label: 'Sound Source',
      kind: 'select',
      options: SOUND_SOURCE_OPTIONS,
      defaultValue: 'guitar_nylon',
    },
      { id: 'referenceSpl', label: 'Reference SPL', kind: 'number', defaultValue: 60, range: { min: 0, max: 140, step: 1, unit: 'dB SPL', extendable: true } },
      { id: 'durationMs', label: 'Duration', kind: 'number', defaultValue: 800, range: { min: 50, max: 10000, step: 10, unit: 'ms', extendable: true } },
    ],
    visualisation: 'spectrum',
  },
];




