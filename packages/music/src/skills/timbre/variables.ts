import type { StimulusParameter, Variable } from '@kata/core';
import { mulberry32, num, primitiveDimensions, single, type Params, type PrimitiveModel } from '../../shared/primitives';
import { BASELINE, synthesize, type TimbreSpec } from './spectrum';

/**
 * Timbre as nine isolated spectral variables (steady-state only — no attack,
 * vibrato, spectral change over time or reverb). Each variable sets one field of
 * the baseline spectrum; centroid, spread and loudness are re-fitted so they
 * never act as side cues. Pitch, level, irregularity pattern and resonance
 * frequency are roved per sound.
 *
 * Descriptive words (warm, nasal, metallic…) are combinations → integration drills.
 */

type Field = keyof Omit<TimbreSpec, 'f0' | 'seed' | 'resFreq' | 'durationMs' | 'fmax' | 'roughRateHz' | 'resBwOct'>;

function spec(p: Params, seed: number, field: Field, value: number): TimbreSpec {
  const r = mulberry32(seed ^ 0x7f4a7c15);
  const rove = num(p, 'f0RoveSemis', 3);
  const base: TimbreSpec = {
    ...BASELINE,
    centroid: num(p, 'baseCentroid', BASELINE.centroid),
    f0: num(p, 'f0', 220) * 2 ** (((r() * 2 - 1) * rove) / 12),
    // Resonance roved within an octave either side of the centre.
    resFreq: num(p, 'baseCentroid', BASELINE.centroid) * 2 ** (r() * 2 - 1),
    seed,
    durationMs: num(p, 'durationMs', 500),
  };
  return { ...base, [field]: value };
}

function timbreModel(
  field: Field,
  m: Omit<PrimitiveModel, 'render' | 'levelRoveDb'>,
  toSpec: (v: number) => number = (v) => v
): PrimitiveModel {
  return {
    ...m,
    levelRoveDb: 2,
    render: (v, p, seed) => {
      const s = spec(p, seed, field, toSpec(v));
      return single({
        durationMs: s.durationMs,
        source: 'custom',
        custom: { key: JSON.stringify(s), render: (sr) => synthesize(s, sr) },
        frequency: 0,
        levelDb: num(p, 'levelDb', -16),
        attackMs: num(p, 'rampMs', 25),
        releaseMs: num(p, 'rampMs', 25),
      });
    },
  };
}

export const BRIGHTNESS = timbreModel('centroid', {
  quantity: 'brightness',
  lowWord: 'darker',
  highWord: 'brighter',
  scale: 'ratio',
  unit: 'Hz',
  decimals: 0,
  defaultRange: [400, 3000],
  delta: { start: 20, min: 0.5, max: 100 },
  relativeMax: 2,
  target: 5,
  format: (v) => `${Math.round(v)} Hz centroid`,
});

export const WIDTH = timbreModel('spreadOct', {
  quantity: 'spectral width',
  lowWord: 'narrower',
  highWord: 'fuller',
  scale: 'additive',
  unit: 'oct',
  decimals: 2,
  defaultRange: [0.3, 1.5],
  delta: { start: 0.25, min: 0.01, max: 1.2 },
  relativeMax: 1,
  target: 0.1,
  format: (v) => `${v.toFixed(2)} oct spread`,
});

export const SKEWNESS = timbreModel('skew', {
  quantity: 'spectral skew',
  lowWord: 'more weight below',
  highWord: 'more weight above',
  scale: 'additive',
  unit: 'skew',
  decimals: 2,
  defaultRange: [-0.5, 0.5],
  delta: { start: 0.3, min: 0.01, max: 1 },
  relativeMax: 0.5,
  target: 0.1,
});

export const ODD_EVEN = timbreModel('evenDb', {
  quantity: 'odd/even balance',
  lowWord: 'more hollow',
  highWord: 'fuller',
  scale: 'additive',
  unit: 'dB',
  decimals: 1,
  defaultRange: [-30, 0],
  delta: { start: 6, min: 0.25, max: 30 },
  relativeMax: 20,
  target: 2,
  format: (v) => `even partials ${v.toFixed(1)} dB`,
});

export const IRREGULARITY = timbreModel('irregDb', {
  quantity: 'irregularity',
  lowWord: 'smoother',
  highWord: 'more uneven',
  scale: 'additive',
  unit: 'dB',
  decimals: 1,
  defaultRange: [0, 6],
  delta: { start: 2, min: 0.1, max: 6 },
  relativeMax: 5,
  target: 1,
  format: (v) => `${v.toFixed(1)} dB partial deviation`,
});

export const INHARMONICITY = timbreModel(
  'inharm',
  {
    quantity: 'inharmonicity',
    lowWord: 'more harmonic',
    highWord: 'more stretched',
    scale: 'additive',
    unit: '×10⁻⁴ B',
    decimals: 1,
    defaultRange: [0, 40],
    delta: { start: 8, min: 0.05, max: 40 },
    relativeMax: 30,
    target: 1.5,
    format: (v) => `B = ${(v / 1e4).toFixed(5)}`,
  },
  (v) => Math.max(0, v) / 1e4
);

export const RESONANCE = timbreModel('resGainDb', {
  quantity: 'resonance',
  lowWord: 'flatter',
  highWord: 'more resonant',
  scale: 'additive',
  unit: 'dB',
  decimals: 1,
  defaultRange: [0, 15],
  delta: { start: 5, min: 0.25, max: 15 },
  relativeMax: 12,
  target: 2,
  format: (v) => `peak +${v.toFixed(1)} dB`,
});

export const NOISINESS = timbreModel('noiseDb', {
  quantity: 'noisiness',
  lowWord: 'cleaner',
  highWord: 'noisier',
  scale: 'additive',
  unit: 'dB',
  decimals: 1,
  defaultRange: [-40, 10],
  delta: { start: 6, min: 0.25, max: 30 },
  relativeMax: 20,
  target: 3,
  format: (v) => `noise ${v >= 0 ? '+' : ''}${v.toFixed(1)} dB re tone`,
});

export const ROUGHNESS = timbreModel(
  'roughDepth',
  {
    quantity: 'roughness',
    lowWord: 'smoother',
    highWord: 'rougher',
    scale: 'additive',
    unit: '%',
    decimals: 0,
    defaultRange: [0, 100],
    delta: { start: 25, min: 1, max: 100 },
    relativeMax: 80,
    target: 10,
    format: (v) => `${Math.round(v)}% fluctuation at 70 Hz`,
  },
  (v) => Math.min(1, Math.max(0, v / 100))
);

const timbreStimulus: StimulusParameter[] = [
  { id: 'f0', label: 'Pitch', kind: 'number', defaultValue: 220, range: { min: 40, max: 1000, step: 1, unit: 'Hz', extendable: true } },
  { id: 'f0RoveSemis', label: 'Random pitch ±', kind: 'number', defaultValue: 3, range: { min: 0, max: 12, step: 0.5, unit: 'semitones', extendable: true }, helpText: 'Pitch varies per sound so you judge the spectrum, not one memorised tone.' },
  { id: 'baseCentroid', label: 'Baseline brightness', kind: 'number', defaultValue: 1000, range: { min: 200, max: 5000, step: 10, unit: 'Hz', extendable: true } },
  { id: 'levelDb', label: 'Level', kind: 'number', defaultValue: -16, range: { min: -60, max: 0, step: 0.5, unit: 'dBFS', extendable: true } },
  { id: 'levelRoveDb', label: 'Random level ±', kind: 'number', defaultValue: 2, range: { min: 0, max: 12, step: 0.5, unit: 'dB', extendable: true } },
  { id: 'durationMs', label: 'Duration', kind: 'number', defaultValue: 500, range: { min: 100, max: 3000, step: 10, unit: 'ms', extendable: true } },
  { id: 'rampMs', label: 'Fade in/out', kind: 'number', defaultValue: 25, range: { min: 5, max: 200, step: 1, unit: 'ms', extendable: true } },
  { id: 'pairGapMs', label: 'Gap between anchor and target', kind: 'number', defaultValue: 600, range: { min: 100, max: 5000, step: 50, unit: 'ms', extendable: true } },
  { id: 'intervalGapMs', label: 'Gap between intervals', kind: 'number', defaultValue: 900, range: { min: 200, max: 5000, step: 50, unit: 'ms', extendable: true } },
];

const DEFS: Array<{ n: number; name: string; definition: string; model: PrimitiveModel }> = [
  { n: 1, name: 'Brightness', definition: 'Where spectral energy is centred (centroid). Dark ↔ bright.', model: BRIGHTNESS },
  { n: 2, name: 'Spectral Width', definition: 'How widely energy spreads around the centre, with brightness held. Narrow/thin ↔ full.', model: WIDTH },
  { n: 3, name: 'Spectral Skew', definition: 'Whether energy leans below or above the centre, with brightness and width held. Advanced; weaker evidence.', model: SKEWNESS },
  { n: 4, name: 'Odd/Even Balance', definition: 'Level of even partials relative to odd ones. Full ↔ hollow (clarinet-like).', model: ODD_EVEN },
  { n: 5, name: 'Irregularity', definition: 'How unevenly partial levels deviate from a smooth curve. The pattern changes every sound.', model: IRREGULARITY },
  { n: 6, name: 'Inharmonicity', definition: 'How far partials are stretched away from whole-number multiples. Fused ↔ bell/metallic.', model: INHARMONICITY },
  { n: 7, name: 'Resonance', definition: 'How far one resonant peak stands above the curve. Its frequency changes every sound. Neutral ↔ nasal/honky.', model: RESONANCE },
  { n: 8, name: 'Noisiness', definition: 'Noise power relative to the tone, noise shaped like the tone. Clean ↔ breathy.', model: NOISINESS },
  { n: 9, name: 'Roughness', definition: 'Depth of fast (70 Hz) amplitude fluctuation, heard as texture not rhythm. Smooth ↔ rough.', model: ROUGHNESS },
];

export const TIMBRE_VARIABLES: Variable[] = DEFS.map((d) => ({
  id: `music:p3-timbre:S${d.n}` as any,
  name: d.name,
  definition: d.definition,
  unit: d.model.unit,
  defaultValue: d.model.delta.start,
  variableDimensions: primitiveDimensions(d.model),
  stimulusParameters: timbreStimulus,
  visualisation: 'spectrum',
}));

export const TIMBRE_MODELS = DEFS.map((d, i) => ({ variable: TIMBRE_VARIABLES[i]!, model: d.model }));
