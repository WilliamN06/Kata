import type { Variable, StimulusParameter } from '@kata/core';
import {
  num,
  primitiveDimensions,
  single,
  sourceFrom,
  sourceParams,
  type Params,
  type PrimitiveModel,
} from '../../shared/primitives';

/**
 * Spatial has four isolatable primitives (headphones required):
 *   - interaural level difference (what a pan knob does)
 *   - interaural time difference
 *   - interaural correlation (heard as width)
 *   - direct-to-reverberant ratio (heard as wetness)
 * Lateral position (ILD + ITD) and distance (wetness + level + brightness)
 * are combinations and belong in integration drills.
 */

const burst = (p: Params, extra: Partial<Parameters<typeof single>[0]>) =>
  single({
    durationMs: num(p, 'durationMs', 300),
    source: sourceFrom(p),
    frequency: num(p, 'frequency', 500),
    levelDb: num(p, 'levelDb', -16),
    attackMs: num(p, 'rampMs', 5),
    releaseMs: num(p, 'rampMs', 5),
    ...extra,
  });

const side = (v: number, unit: string, decimals: number) =>
  Math.abs(v) < 10 ** -decimals / 2 ? 'centre' : `${v < 0 ? 'L' : 'R'} ${Math.abs(v).toFixed(decimals)} ${unit}`;

export const ILD: PrimitiveModel = {
  quantity: 'level difference between the ears',
  lowWord: 'further left',
  highWord: 'further right',
  scale: 'additive',
  unit: 'dB',
  decimals: 1,
  defaultRange: [-12, 12],
  delta: { start: 3, min: 0.1, max: 12 },
  relativeMax: 12,
  format: (v) => side(v, 'dB', 1),
  target: 1,
  headphones: true,
  levelRoveDb: 2,
  render: (v, p) => burst(p, { ildDb: v }),
};

export const ITD: PrimitiveModel = {
  quantity: 'time difference between the ears',
  lowWord: 'further left',
  highWord: 'further right',
  scale: 'additive',
  unit: 'µs',
  decimals: 0,
  defaultRange: [-600, 600],
  delta: { start: 200, min: 2, max: 600 },
  relativeMax: 600,
  format: (v) => side(v, 'µs', 0),
  target: 20,
  headphones: true,
  levelRoveDb: 2,
  render: (v, p) => burst(p, { itdUs: v }),
};

export const WIDTH: PrimitiveModel = {
  quantity: 'width',
  lowWord: 'narrower',
  highWord: 'wider',
  scale: 'additive',
  unit: '%',
  decimals: 0,
  defaultRange: [0, 100],
  delta: { start: 25, min: 1, max: 100 },
  relativeMax: 100,
  target: 10,
  headphones: true,
  levelRoveDb: 2,
  // Correlation needs independent left/right signals, so width always uses noise.
  render: (v, p) => burst(p, { source: 'noise', correlation: 1 - Math.min(100, Math.max(0, v)) / 100 }),
};

export const WETNESS: PrimitiveModel = {
  quantity: 'wetness',
  lowWord: 'drier',
  highWord: 'wetter',
  scale: 'additive',
  unit: 'dB',
  decimals: 1,
  defaultRange: [-24, 6],
  delta: { start: 6, min: 0.25, max: 24 },
  relativeMax: 18,
  format: (v) => `${v.toFixed(1)} dB reverb/direct`,
  target: 3,
  levelRoveDb: 2,
  render: (v, p) =>
    burst(p, {
      wetDb: v,
      roomDecaySec: num(p, 'roomDecaySec', 1.2),
      // One fixed room per setting, so only the wet/dry balance varies.
      roomSeed: num(p, 'roomSeed', 1),
    }),
};

const headphoneNote = ' Use headphones.';

const durationParam = (ms: number): StimulusParameter => ({
  id: 'durationMs',
  label: 'Duration',
  kind: 'number',
  defaultValue: ms,
  range: { min: 20, max: 5000, step: 10, unit: 'ms', extendable: true },
});

export const SPATIAL_VARIABLES: Variable[] = [
  {
    id: 'music:p5-spatial:V1' as any,
    name: 'Level Difference (ILD)',
    definition: 'How much louder the sound is in one ear than the other — what a pan knob changes.' + headphoneNote,
    unit: 'dB',
    defaultValue: 3,
    variableDimensions: primitiveDimensions(ILD),
    stimulusParameters: [...sourceParams({ source: 'noise', frequency: 2000, levelDb: -16, levelRoveDb: 2 }), durationParam(300)],
    visualisation: 'goniometer',
  },
  {
    id: 'music:p5-spatial:V2' as any,
    name: 'Wetness (Direct/Reverb)',
    definition: 'How much reverb there is relative to the direct sound. Overall loudness is held constant.' + headphoneNote,
    unit: 'dB',
    defaultValue: 6,
    variableDimensions: primitiveDimensions(WETNESS),
    stimulusParameters: [
      ...sourceParams({ source: 'noise', frequency: 1000, levelDb: -16, levelRoveDb: 2 }),
      durationParam(200),
      { id: 'roomDecaySec', label: 'Room decay (RT60)', kind: 'number', defaultValue: 1.2, range: { min: 0.1, max: 8, step: 0.1, unit: 's', extendable: true } },
      { id: 'roomSeed', label: 'Room', kind: 'number', defaultValue: 1, range: { min: 1, max: 99, step: 1, unit: '', extendable: true } },
    ],
    visualisation: 'goniometer',
  },
  {
    id: 'music:p5-spatial:V3' as any,
    name: 'Time Difference (ITD)',
    definition: 'How much earlier the sound reaches one ear than the other. Strongest below ~1.5 kHz or on broadband sounds.' + headphoneNote,
    unit: 'µs',
    defaultValue: 200,
    variableDimensions: primitiveDimensions(ITD),
    stimulusParameters: [...sourceParams({ source: 'noise', frequency: 500, levelDb: -16, levelRoveDb: 2 }), durationParam(300)],
    visualisation: 'goniometer',
  },
  {
    id: 'music:p5-spatial:V4' as any,
    name: 'Width (Correlation)',
    definition: 'How different the left and right signals are. 0% = identical (narrow, centred), 100% = unrelated (wide).' + headphoneNote,
    unit: '%',
    defaultValue: 25,
    variableDimensions: primitiveDimensions(WIDTH),
    stimulusParameters: [...sourceParams({ source: 'noise', frequency: 1000, levelDb: -16, levelRoveDb: 2 }).filter((s) => s.id !== 'source' && s.id !== 'frequency'), durationParam(500)],
    visualisation: 'goniometer',
  },
];

export const SPATIAL_MODELS = [
  { variable: SPATIAL_VARIABLES[0]!, model: ILD },
  { variable: SPATIAL_VARIABLES[1]!, model: WETNESS },
  { variable: SPATIAL_VARIABLES[2]!, model: ITD },
  { variable: SPATIAL_VARIABLES[3]!, model: WIDTH },
];
