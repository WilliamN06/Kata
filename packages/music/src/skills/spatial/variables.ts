import { SOUND_SOURCE_OPTIONS } from '../../shared/sound-source';
import type { Variable } from '@kata/core';

export const SPATIAL_VARIABLES: Variable[] = [
  {
    id: 'music:p5-spatial:V1' as any,
    name: 'Spatial Position',
    definition: 'The capacity to detect where a sound is located in space',
    unit: 'percent',
    defaultValue: 0,
    variableDimensions: [
      { id: 'axis', label: 'Axis', kind: 'select', options: [{ value: 'azimuth', label: 'Azimuth' }, { value: 'elevation', label: 'Elevation' }, { value: 'distance', label: 'Distance' }], defaultValue: 'azimuth' },
      { id: 'position', label: 'Position', kind: 'number', defaultValue: 0, range: { min: -100, max: 100, step: 1, unit: '%', extendable: false } },
    ],
    stimulusParameters: [
      { id: 'soundSource', label: 'Sound Source', kind: 'select' as const, defaultValue: 'sine', options: SOUND_SOURCE_OPTIONS },
      { id: 'soundType', label: 'Sound Type', kind: 'select', options: [{ value: 'click', label: 'Click' }, { value: 'tone', label: 'Tone' }, { value: 'noise', label: 'Noise' }], defaultValue: 'click' },
      { id: 'durationMs', label: 'Duration', kind: 'number', defaultValue: 500, range: { min: 20, max: 5000, step: 10, unit: 'ms', extendable: true } },
      { id: 'frequency', label: 'Frequency', kind: 'number', defaultValue: 1000, range: { min: 1, max: 20000, step: 1, unit: 'Hz', extendable: true } },
      { id: 'reverb', label: 'Reverb', kind: 'select', options: [{ value: 'none', label: 'None' }, { value: 'room', label: 'Room' }, { value: 'hall', label: 'Hall' }], defaultValue: 'none' },
    ],
    visualisation: 'goniometer',
  },
  {
    id: 'music:p5-spatial:V2' as any,
    name: 'Spatial Depth',
    definition: 'The capacity to detect how near or far a sound is',
    unit: 'ms',
    defaultValue: 30,
    variableDimensions: [
      { id: 'depthMs', label: 'Depth', kind: 'number', defaultValue: 30, range: { min: 0, max: 500, step: 1, unit: 'ms', extendable: true } },
      { id: 'type', label: 'Type', kind: 'select', options: [{ value: 'reverb', label: 'Reverb' }, { value: 'delay', label: 'Delay' }, { value: 'both', label: 'Both' }], defaultValue: 'reverb' },
      { id: 'damping', label: 'HF Damping', kind: 'number', defaultValue: 0.3, range: { min: 0, max: 1, step: 0.05, unit: '', extendable: false } },
    ],
    stimulusParameters: [
      { id: 'soundSource', label: 'Sound Source', kind: 'select' as const, defaultValue: 'sine', options: SOUND_SOURCE_OPTIONS },
      { id: 'reverbType', label: 'Reverb Type', kind: 'select', options: [{ value: 'room', label: 'Room' }, { value: 'hall', label: 'Hall' }, { value: 'plate', label: 'Plate' }, { value: 'spring', label: 'Spring' }], defaultValue: 'room' },
      { id: 'soundType', label: 'Sound Type', kind: 'select', options: [{ value: 'click', label: 'Click' }, { value: 'tone', label: 'Tone' }], defaultValue: 'click' },
      { id: 'directToReverb', label: 'Direct/Reverb Ratio', kind: 'number', defaultValue: 50, range: { min: 0, max: 100, step: 1, unit: '%', extendable: false } },
    ],
    visualisation: 'goniometer',
  },
];


