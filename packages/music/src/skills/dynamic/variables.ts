import type { Variable } from '@kata/core';
import {
  num,
  primitiveDimensions,
  single,
  sourceFrom,
  sourceParams,
  type PrimitiveModel,
} from '../../shared/primitives';

/**
 * Amplitude has two isolatable primitives:
 *   - level: how loud a steady sound is
 *   - envelope: how fast level changes (attack or release time)
 * Dynamic span is level in relative mode. Masking, compression and
 * frequency-dependent loudness combine amplitude with frequency and time,
 * so they belong in integration drills.
 */

export const LEVEL: PrimitiveModel = {
  quantity: 'level',
  lowWord: 'quieter',
  highWord: 'louder',
  scale: 'additive',
  unit: 'dB',
  decimals: 1,
  defaultRange: [-40, -6],
  delta: { start: 3, min: 0.1, max: 12 },
  relativeMax: 12,
  display: () => ({ unit: 'dBFS', to: (v) => v, from: (d) => d, decimals: 1 }),
  target: 1,
  levelRoveDb: 0,
  render: (v, p) =>
    single({
      durationMs: num(p, 'durationMs', 600),
      source: sourceFrom(p),
      frequency: num(p, 'frequency', 1000),
      levelDb: v,
      attackMs: num(p, 'rampMs', 10),
      releaseMs: num(p, 'rampMs', 10),
    }),
};

export const ENVELOPE: PrimitiveModel = {
  quantity: (p) => (p.stage === 'release' ? 'release time' : 'attack time'),
  lowWord: 'faster',
  highWord: 'slower',
  scale: 'ratio',
  unit: 'ms',
  decimals: 0,
  defaultRange: [5, 400],
  delta: { start: 40, min: 2, max: 300 },
  relativeMax: 3,
  target: 20,
  levelRoveDb: 2,
  render: (v, p) => {
    const hold = num(p, 'holdMs', 400);
    const ramp = num(p, 'rampMs', 5);
    const release = p.stage === 'release';
    return single({
      durationMs: hold + v + ramp,
      source: sourceFrom(p),
      frequency: num(p, 'frequency', 440),
      levelDb: num(p, 'levelDb', -12),
      attackMs: release ? ramp : v,
      releaseMs: release ? v : ramp,
    });
  },
};

export const DYNAMIC_VARIABLES: Variable[] = [
  {
    id: 'music:p2-dynamic:V1' as any,
    name: 'Level',
    definition: 'How loud a steady sound is. Relative mode trains level differences (dynamic span).',
    unit: 'dB',
    defaultValue: 3,
    variableDimensions: primitiveDimensions(LEVEL),
    stimulusParameters: [
      ...sourceParams({ source: 'sine', frequency: 1000 }),
      { id: 'durationMs', label: 'Duration', kind: 'number', defaultValue: 600, range: { min: 50, max: 5000, step: 10, unit: 'ms', extendable: true } },
    ],
    visualisation: 'waveform',
  },
  {
    id: 'music:p2-dynamic:V2' as any,
    name: 'Envelope',
    definition: 'How fast level rises at the onset (attack) or falls at the end (release).',
    unit: 'ms',
    defaultValue: 40,
    variableDimensions: primitiveDimensions(ENVELOPE, [
      {
        id: 'stage',
        label: 'Stage',
        kind: 'select',
        defaultValue: 'attack',
        options: [
          { value: 'attack', label: 'Attack' },
          { value: 'release', label: 'Release' },
        ],
      },
    ]),
    stimulusParameters: [
      ...sourceParams({ source: 'sawtooth', frequency: 220, levelDb: -14, levelRoveDb: 2 }),
      { id: 'holdMs', label: 'Steady part', kind: 'number', defaultValue: 400, range: { min: 0, max: 5000, step: 10, unit: 'ms', extendable: true } },
    ],
    visualisation: 'waveform-envelope',
  },
];

export const DYNAMIC_MODELS = [
  { variable: DYNAMIC_VARIABLES[0]!, model: LEVEL },
  { variable: DYNAMIC_VARIABLES[1]!, model: ENVELOPE },
];
