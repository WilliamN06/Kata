import { SOUND_SOURCE_OPTIONS } from '../../shared/sound-source';
import type { Variable } from '@kata/core';

export const RHYTHM_VARIABLES: Variable[] = [
  {
    id: 'music:p4-time:V1' as any,
    name: 'Onset Time',
    definition: 'The capacity to detect when a sound begins relative to a reference.',
    unit: 'ms',
    defaultValue: 500,
    variableDimensions: [
      {
        id: 'barsCount',
        label: 'Bars in Pattern',
        kind: 'number',
        defaultValue: 2,
        range: { min: 1, max: 8, step: 1, unit: 'bars', extendable: true },
      },
      {
        id: 'subdivision',
        label: 'Subdivision',
        kind: 'select',
        options: [
          { value: '1/1', label: '1/1' },
          { value: '1/2', label: '1/2' },
          { value: '1/4', label: '1/4' },
          { value: '1/8', label: '1/8' },
          { value: '1/16', label: '1/16' },
          { value: 'custom', label: 'Custom' },
        ],
        defaultValue: '1/4',
      },
      {
        id: 'customSubdivision',
        label: 'Custom Subdivision',
        kind: 'number',
        defaultValue: 5,
        range: { min: 1, max: 512, step: 1, unit: '', extendable: true },
        appliesWhen: { dimension: 'subdivision', values: ['custom'] },
      },
      { id: 'tempo', label: 'Tempo', kind: 'number', defaultValue: 100, range: { min: 1, max: 1000, step: 1, unit: 'BPM', extendable: true } },
      { id: 'complexity', label: 'Complexity', kind: 'select', options: [{ value: 'simple', label: 'Simple' }, { value: 'syncopated', label: 'Syncopated' }, { value: 'complex', label: 'Complex' }], defaultValue: 'simple' },
    ],
    stimulusParameters: [
      { id: 'soundSource', label: 'Sound Source', kind: 'select' as const, defaultValue: 'sine', options: SOUND_SOURCE_OPTIONS },
      { id: 'drumSound', label: 'Drum Sound', kind: 'select', options: [
        { value: 'click', label: 'Click' },
        { value: 'kick', label: 'Kick' },
        { value: 'snare', label: 'Snare' },
        { value: 'hat', label: 'Hi-hat' },
        { value: 'clap', label: 'Clap' },
        { value: 'tom', label: 'Tom' },
        { value: 'rim', label: 'Rim' },
      ], defaultValue: 'click' },
      { id: 'meterNumerator', label: 'Meter Numerator', kind: 'number', defaultValue: 4, range: { min: 1, max: 32, step: 1, unit: '', extendable: true } },
      { id: 'meterDenominator', label: 'Meter Denominator', kind: 'select', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' }, { value: '16', label: '16' }, { value: '32', label: '32' }], defaultValue: '4' },
      { id: 'referenceClick', label: 'Reference Click', kind: 'select', options: [{ value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }], defaultValue: 'present' },
      { id: 'swing', label: 'Swing', kind: 'number', defaultValue: 0, range: { min: 0, max: 100, step: 1, unit: '%', extendable: false } },
    ],
    visualisation: 'waveform',
  },

  // ---------- V2: Onset Duration (singular note) ----------
  {
    id: 'music:p4-time:V2' as any,
    name: 'Onset Duration',
    definition: 'The capacity to detect how long a single note/sound lasts from its onset to its end.',
    unit: 'ms',
    defaultValue: 500,
    variableDimensions: [
      // ---------- Test Type ----------
      {
        id: 'testType',
        label: 'Test Type',
        kind: 'select',
        defaultValue: 'absoluteEstimation',
        options: [
          { value: 'absoluteEstimation', label: 'Absolute Estimation' },
          { value: 'absoluteDiscrimination', label: 'Absolute Discrimination' },
          { value: 'relativeRatioEstimation', label: 'Relative Ratio Estimation' },
          { value: 'relativeRatioDiscrimination', label: 'Relative Ratio Discrimination' },
        ],
      },
      // ---------- Duration Range (percentage of beat) ----------
      { id: 'durationMin', label: 'Duration Min (% of beat)', kind: 'number', defaultValue: 50, range: { min: 10, max: 500, step: 5, unit: '% of beat', extendable: true } },
      { id: 'durationMax', label: 'Duration Max (% of beat)', kind: 'number', defaultValue: 200, range: { min: 10, max: 500, step: 5, unit: '% of beat', extendable: true } },
      { id: 'durationGranularity', label: 'Answer Granularity', kind: 'select', options: [
        { value: '1', label: '1% of beat' },
        { value: '5', label: '5% of beat' },
        { value: '10', label: '10% of beat' },
        { value: '25', label: '25% of beat' },
      ], defaultValue: '10' },
      { id: 'tempo', label: 'Tempo', kind: 'number', defaultValue: 100, range: { min: 1, max: 1000, step: 1, unit: 'BPM', extendable: true } },
      { id: 'metronomeToggle', label: 'Metronome', kind: 'toggle', defaultValue: false },
      { id: 'metronomeVolume', label: 'Metronome Volume', kind: 'number', defaultValue: 50, range: { min: 0, max: 100, step: 5, unit: '%', extendable: true } },
      { id: 'articulation', label: 'Articulation', kind: 'select', options: [{ value: 'staccato', label: 'Staccato' }, { value: 'legato', label: 'Legato' }, { value: 'mixed', label: 'Mixed' }], defaultValue: 'legato' },
      { id: 'dynamics', label: 'Dynamics', kind: 'select', options: [{ value: 'pp', label: 'pp' }, { value: 'p', label: 'p' }, { value: 'mp', label: 'mp' }, { value: 'mf', label: 'mf' }, { value: 'f', label: 'f' }, { value: 'ff', label: 'ff' }], defaultValue: 'mf' },
      { id: 'attackTime', label: 'Attack', kind: 'number', defaultValue: 10, range: { min: 1, max: 500, step: 1, unit: 'ms', extendable: true } },
      { id: 'decayTime', label: 'Decay', kind: 'number', defaultValue: 100, range: { min: 1, max: 2000, step: 1, unit: 'ms', extendable: true } },
      { id: 'sustainLevel', label: 'Sustain', kind: 'number', defaultValue: 70, range: { min: 0, max: 100, step: 5, unit: '%', extendable: true } },
      { id: 'releaseTime', label: 'Release', kind: 'number', defaultValue: 100, range: { min: 1, max: 2000, step: 1, unit: 'ms', extendable: true } },
      { id: 'toneColor', label: 'Timbre / Tone', kind: 'select', options: [{ value: 'pure', label: 'Pure' }, { value: 'warm', label: 'Warm' }, { value: 'bright', label: 'Bright' }, { value: 'dark', label: 'Dark' }], defaultValue: 'pure' },
    ],
    stimulusParameters: [
      { id: 'soundSource', label: 'Sound Source', kind: 'select' as const, defaultValue: 'sine', options: SOUND_SOURCE_OPTIONS },
      { id: 'drumSound', label: 'Drum Sound', kind: 'select', options: [
        { value: 'click', label: 'Click' },
        { value: 'kick', label: 'Kick' },
        { value: 'snare', label: 'Snare' },
        { value: 'hat', label: 'Hi-hat' },
        { value: 'clap', label: 'Clap' },
        { value: 'tom', label: 'Tom' },
        { value: 'rim', label: 'Rim' },
      ], defaultValue: 'click' },
      { id: 'tempo', label: 'Tempo', kind: 'number', defaultValue: 100, range: { min: 1, max: 1000, step: 1, unit: 'BPM', extendable: true } },
    ],
    visualisation: 'waveform',
  },

  // ---------- V3: Absence Duration (silent gap between notes) ----------
  {
    id: 'music:p4-time:V3' as any,
    name: 'Absence Duration',
    definition: 'The capacity to detect the silent gap between the end of one note and the onset of the next.',
    unit: 'ms',
    defaultValue: 250,
    variableDimensions: [
      // ---------- Test Type ----------
      {
        id: 'testType',
        label: 'Test Type',
        kind: 'select',
        defaultValue: 'absoluteEstimation',
        options: [
          { value: 'absoluteEstimation', label: 'Absolute Estimation' },
          { value: 'absoluteDiscrimination', label: 'Absolute Discrimination' },
          { value: 'relativeRatioEstimation', label: 'Relative Ratio Estimation' },
          { value: 'relativeRatioDiscrimination', label: 'Relative Ratio Discrimination' },
        ],
      },
      // ---------- Absence Duration Range (% of beat) ----------
      { id: 'gapMin', label: 'Gap Min (% of beat)', kind: 'number', defaultValue: 50, range: { min: 10, max: 500, step: 5, unit: '% of beat', extendable: true } },
      { id: 'gapMax', label: 'Gap Max (% of beat)', kind: 'number', defaultValue: 200, range: { min: 10, max: 500, step: 5, unit: '% of beat', extendable: true } },
      { id: 'gapGranularity', label: 'Answer Granularity', kind: 'select', options: [
        { value: '1', label: '1% of beat' },
        { value: '5', label: '5% of beat' },
        { value: '10', label: '10% of beat' },
        { value: '25', label: '25% of beat' },
      ], defaultValue: '10' },
      { id: 'tempo', label: 'Tempo', kind: 'number', defaultValue: 100, range: { min: 1, max: 1000, step: 1, unit: 'BPM', extendable: true } },
      { id: 'metronomeToggle', label: 'Metronome', kind: 'toggle', defaultValue: false },
      { id: 'metronomeVolume', label: 'Metronome Volume', kind: 'number', defaultValue: 50, range: { min: 0, max: 100, step: 5, unit: '%', extendable: true } },
      { id: 'precedingDuration', label: 'Preceding Sound (% of beat)', kind: 'number', defaultValue: 50, range: { min: 10, max: 500, step: 5, unit: '% of beat', extendable: true } },
      { id: 'followingDuration', label: 'Following Sound (% of beat)', kind: 'number', defaultValue: 50, range: { min: 10, max: 500, step: 5, unit: '% of beat', extendable: true } },
      { id: 'articulation', label: 'Articulation', kind: 'select', options: [{ value: 'staccato', label: 'Staccato' }, { value: 'legato', label: 'Legato' }, { value: 'mixed', label: 'Mixed' }], defaultValue: 'legato' },
      { id: 'dynamics', label: 'Dynamics', kind: 'select', options: [{ value: 'pp', label: 'pp' }, { value: 'p', label: 'p' }, { value: 'mp', label: 'mp' }, { value: 'mf', label: 'mf' }, { value: 'f', label: 'f' }, { value: 'ff', label: 'ff' }], defaultValue: 'mf' },
      { id: 'attackTime', label: 'Attack', kind: 'number', defaultValue: 10, range: { min: 1, max: 500, step: 1, unit: 'ms', extendable: true } },
      { id: 'decayTime', label: 'Decay', kind: 'number', defaultValue: 100, range: { min: 1, max: 2000, step: 1, unit: 'ms', extendable: true } },
      { id: 'sustainLevel', label: 'Sustain', kind: 'number', defaultValue: 70, range: { min: 0, max: 100, step: 5, unit: '%', extendable: true } },
      { id: 'releaseTime', label: 'Release', kind: 'number', defaultValue: 100, range: { min: 1, max: 2000, step: 1, unit: 'ms', extendable: true } },
      { id: 'toneColor', label: 'Timbre / Tone', kind: 'select', options: [{ value: 'pure', label: 'Pure' }, { value: 'warm', label: 'Warm' }, { value: 'bright', label: 'Bright' }, { value: 'dark', label: 'Dark' }], defaultValue: 'pure' },
    ],
    stimulusParameters: [
      { id: 'soundSource', label: 'Sound Source', kind: 'select' as const, defaultValue: 'sine', options: SOUND_SOURCE_OPTIONS },
      { id: 'drumSound', label: 'Drum Sound', kind: 'select', options: [
        { value: 'click', label: 'Click' },
        { value: 'kick', label: 'Kick' },
        { value: 'snare', label: 'Snare' },
        { value: 'hat', label: 'Hi-hat' },
        { value: 'clap', label: 'Clap' },
        { value: 'tom', label: 'Tom' },
        { value: 'rim', label: 'Rim' },
      ], defaultValue: 'click' },
      { id: 'tempo', label: 'Tempo', kind: 'number', defaultValue: 100, range: { min: 1, max: 1000, step: 1, unit: 'BPM', extendable: true } },
    ],
    visualisation: 'waveform',
  },

  // ---------- V4: Tempo ----------
  {
    id: 'music:p4-time:V4' as any,
    name: 'Tempo',
    definition: 'The capacity to detect the speed of the sequence.',
    unit: 'BPM',
    defaultValue: 120,
    variableDimensions: [
      { id: 'barsCount', label: 'Bars in Pattern', kind: 'number', defaultValue: 2, range: { min: 1, max: 8, step: 1, unit: 'bars', extendable: true } },
      { id: 'tempo', label: 'Tempo', kind: 'number', defaultValue: 120, range: { min: 1, max: 1000, step: 1, unit: 'BPM', extendable: true } },
      { id: 'change', label: 'Change', kind: 'select', options: [{ value: 'stable', label: 'Stable' }, { value: 'accelerando', label: 'Accelerando' }, { value: 'ritardando', label: 'Ritardando' }], defaultValue: 'stable' },
    ],
    stimulusParameters: [
      { id: 'soundSource', label: 'Sound Source', kind: 'select' as const, defaultValue: 'sine', options: SOUND_SOURCE_OPTIONS },
      { id: 'drumSound', label: 'Drum Sound', kind: 'select', options: [
        { value: 'click', label: 'Click' },
        { value: 'kick', label: 'Kick' },
        { value: 'snare', label: 'Snare' },
        { value: 'hat', label: 'Hi-hat' },
        { value: 'clap', label: 'Clap' },
        { value: 'tom', label: 'Tom' },
        { value: 'rim', label: 'Rim' },
      ], defaultValue: 'click' },
      { id: 'meter', label: 'Meter', kind: 'number', defaultValue: 4, range: { min: 1, max: 32, step: 1, unit: '', extendable: true } },
    ],
    visualisation: 'waveform',
  },

  // ---------- V5: Grouping ----------
  {
    id: 'music:p4-time:V5' as any,
    name: 'Grouping',
    definition: 'The capacity to detect how sounds are grouped.',
    unit: 'beats',
    defaultValue: 4,
    variableDimensions: [
      { id: 'meterNumerator', label: 'Meter Numerator', kind: 'number', defaultValue: 4, range: { min: 1, max: 32, step: 1, unit: '', extendable: true } },
      { id: 'meterDenominator', label: 'Meter Denominator', kind: 'select', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' }, { value: '16', label: '16' }], defaultValue: '4' },
      { id: 'groupingCue', label: 'Grouping Cue', kind: 'select', options: [{ value: 'accent', label: 'Accent' }, { value: 'pitch', label: 'Pitch' }, { value: 'timbre', label: 'Timbre' }, { value: 'silence', label: 'Silence' }], defaultValue: 'accent' },
    ],
    stimulusParameters: [
      { id: 'soundSource', label: 'Sound Source', kind: 'select' as const, defaultValue: 'sine', options: SOUND_SOURCE_OPTIONS },
      { id: 'drumSound', label: 'Drum Sound', kind: 'select', options: [{ value: 'kick', label: 'Kick' }, { value: 'snare', label: 'Snare' }, { value: 'hat', label: 'Hat' }], defaultValue: 'kick' },
      { id: 'tempo', label: 'Tempo', kind: 'number', defaultValue: 100, range: { min: 1, max: 1000, step: 1, unit: 'BPM', extendable: true } },
    ],
    visualisation: 'waveform',
  },

  // ---------- V6: Rhythmic Relationship ----------
  {
    id: 'music:p4-time:V6' as any,
    name: 'Rhythmic Relationship',
    definition: 'The capacity to detect how sounds relate rhythmically.',
    unit: 'percent',
    defaultValue: 50,
    variableDimensions: [
      { id: 'type', label: 'Type', kind: 'select', options: [{ value: 'syncopation', label: 'Syncopation' }, { value: 'polyrhythm', label: 'Polyrhythm' }, { value: 'hemiola', label: 'Hemiola' }, { value: 'cross-rhythm', label: 'Cross-rhythm' }, { value: 'groove', label: 'Groove' }, { value: 'humanisation', label: 'Humanisation' }], defaultValue: 'syncopation' },
      { id: 'ratioA', label: 'Ratio A', kind: 'number', defaultValue: 3, range: { min: 1, max: 16, step: 1, unit: '', extendable: true } },
      { id: 'ratioB', label: 'Ratio B', kind: 'number', defaultValue: 2, range: { min: 1, max: 16, step: 1, unit: '', extendable: true } },
      { id: 'complexity', label: 'Complexity', kind: 'select', options: [{ value: 'simple', label: 'Simple' }, { value: 'complex', label: 'Complex' }], defaultValue: 'simple' },
    ],
    stimulusParameters: [
      { id: 'soundSource', label: 'Sound Source', kind: 'select' as const, defaultValue: 'sine', options: SOUND_SOURCE_OPTIONS },
      { id: 'drumA', label: 'Drum A', kind: 'select', options: [{ value: 'kick', label: 'Kick' }, { value: 'snare', label: 'Snare' }], defaultValue: 'kick' },
      { id: 'drumB', label: 'Drum B', kind: 'select', options: [{ value: 'hat', label: 'Hat' }, { value: 'snare', label: 'Snare' }], defaultValue: 'hat' },
      { id: 'tempo', label: 'Tempo', kind: 'number', defaultValue: 100, range: { min: 1, max: 1000, step: 1, unit: 'BPM', extendable: true } },
    ],
    visualisation: 'waveform',
  },
];
