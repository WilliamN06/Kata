import type { Variable } from '@kata/core';
import {
  num,
  primitiveDimensions,
  single,
  concat,
  sourceFrom,
  sourceParams,
  type Params,
  type PrimitiveModel,
  type Sequence,
} from '../../shared/primitives';

/**
 * Time has two isolatable primitives:
 *   - how long a sound lasts (onset → offset)
 *   - how long a silence lasts (offset → next onset)
 * Onset timing, tempo, grouping and syncopation are combinations of these
 * (plus accents, which are amplitude) and belong in integration drills.
 */

const beatMs = (p: Params) => 60000 / Math.max(1, num(p, 'tempo', 100));

const beatDisplay = (p: Params) =>
  p.units === 'beats'
    ? { unit: '% beat', to: (v: number) => (v / beatMs(p)) * 100, from: (d: number) => (d / 100) * beatMs(p), decimals: 0 }
    : { unit: 'ms', to: (v: number) => v, from: (d: number) => d, decimals: 0 };

const tone = (p: Params, durationMs: number): Sequence =>
  single({
    durationMs,
    source: sourceFrom(p),
    frequency: num(p, 'frequency', 440),
    levelDb: num(p, 'levelDb', -12),
    attackMs: num(p, 'rampMs', 5),
    releaseMs: num(p, 'rampMs', 5),
  });

/** Four count-in clicks, so the stimulus starts on the next beat. */
const countIn = (p: Params): Sequence | null => {
  if (p.units !== 'beats' || p.countIn !== 'on') return null;
  const b = beatMs(p) / 1000;
  return {
    sounds: [0, 1, 2, 3].map((i) => ({
      at: i * b,
      durationMs: 4,
      source: 'click' as const,
      frequency: 0,
      levelDb: i === 0 ? -10 : -16,
      attackMs: 0,
      releaseMs: 0,
    })),
    lengthSec: 4 * b,
  };
};

export const SOUND_DURATION: PrimitiveModel = {
  quantity: 'sound duration',
  lowWord: 'shorter',
  highWord: 'longer',
  scale: 'ratio',
  unit: 'ms',
  decimals: 0,
  defaultRange: [100, 800],
  delta: { start: 30, min: 1, max: 100 },
  relativeMax: 2,
  display: beatDisplay,
  render: (v, p) => tone(p, v),
  prelude: countIn,
};

export const SILENCE_DURATION: PrimitiveModel = {
  quantity: 'silence duration',
  lowWord: 'shorter',
  highWord: 'longer',
  scale: 'ratio',
  unit: 'ms',
  decimals: 0,
  defaultRange: [50, 600],
  delta: { start: 30, min: 1, max: 100 },
  relativeMax: 2,
  display: beatDisplay,
  render: (v, p) => {
    const marker = num(p, 'markerMs', 120);
    return concat(tone(p, marker), tone(p, marker), v / 1000);
  },
  prelude: countIn,
};

const timeDims = [
  {
    id: 'units',
    label: 'Units',
    kind: 'select' as const,
    defaultValue: 'ms',
    options: [
      { value: 'ms', label: 'Milliseconds' },
      { value: 'beats', label: '% of beat' },
    ],
  },
  { id: 'tempo', label: 'Tempo', kind: 'number' as const, defaultValue: 100, range: { min: 20, max: 400, step: 1, unit: 'BPM', extendable: true }, appliesWhen: { dimension: 'units', values: ['beats'] } },
  {
    id: 'countIn',
    label: 'Count-in clicks',
    kind: 'select' as const,
    defaultValue: 'off',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On (4 beats)' },
    ],
    appliesWhen: { dimension: 'units', values: ['beats'] },
  },
];

export const RHYTHM_VARIABLES: Variable[] = [
  {
    id: 'music:p4-time:V2' as any,
    name: 'Sound Duration',
    definition: 'How long a sound lasts, from onset to offset.',
    unit: 'ms',
    defaultValue: 30,
    variableDimensions: primitiveDimensions(SOUND_DURATION, timeDims),
    stimulusParameters: sourceParams({ source: 'sine', frequency: 440, levelDb: -12 }),
    visualisation: 'waveform',
  },
  {
    id: 'music:p4-time:V3' as any,
    name: 'Silence Duration',
    definition: 'How long a silence lasts, from one sound’s offset to the next onset.',
    unit: 'ms',
    defaultValue: 30,
    variableDimensions: primitiveDimensions(SILENCE_DURATION, [
      ...timeDims,
      { id: 'markerMs', label: 'Marker sound length', kind: 'number', defaultValue: 120, range: { min: 10, max: 1000, step: 5, unit: 'ms', extendable: true } },
    ]),
    stimulusParameters: sourceParams({ source: 'sine', frequency: 440, levelDb: -12 }),
    visualisation: 'waveform',
  },
];

export const RHYTHM_MODELS = [
  { variable: RHYTHM_VARIABLES[0]!, model: SOUND_DURATION },
  { variable: RHYTHM_VARIABLES[1]!, model: SILENCE_DURATION },
];
