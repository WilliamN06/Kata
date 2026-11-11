import type { VariableDimension, StimulusParameter } from '@kata/core';
import { concat, mulberry32, type Sequence } from './audio';

/**
 * A primitive is one isolatable perceptual variable: a single number that
 * maps to a sound. Every task type (categorise, discriminate, estimate,
 * match, detect, order, identify) is built generically from it.
 *
 * The staircase drives ONE thing: the difference Δ between stimuli
 * (or the tolerance, for estimation/matching). The reference value is
 * roved every trial so the listener can't anchor on a memorised value.
 */

export type Params = Record<string, string | number>;

/** ratio → Weber-like (Δ in %), additive → Δ in the variable's unit. */
export type Scale = 'ratio' | 'additive';

export interface DisplayUnit {
  unit: string;
  to: (v: number) => number;
  from: (d: number) => number;
  decimals: number;
}

export interface PrimitiveModel {
  /** Lower-case noun, e.g. "sound duration". */
  quantity: string | ((p: Params) => string);
  lowWord: string;
  highWord: string;
  scale: Scale;
  unit: string;
  decimals: number;
  defaultRange: [number, number];
  /** Δ defaults. ratio scale: %, additive: unit. */
  delta: { start: number; min: number; max: number };
  /** Relative mode limit: max ratio (ratio scale) or max difference (additive). */
  relativeMax: number;
  /** Optional display conversion (e.g. ms → % of beat). */
  display?: (p: Params) => DisplayUnit;
  /** Optional absolute formatter (e.g. "L 3.0 dB"). */
  format?: (v: number, p: Params) => string;
  /** One stimulus at value v. */
  render: (v: number, p: Params, seed: number) => Sequence;
  /** Played once before each presentation (e.g. a count-in). */
  prelude?: (p: Params) => Sequence | null;
  /** Mastery target for T2 discrimination, in Δ units (≈ trained-listener threshold). */
  target: number;
  /** Requires headphones (shows the headphone check first). */
  headphones?: boolean;
  /** Default random level per presentation, so loudness is never a cue. 0 for level itself. */
  levelRoveDb: number;
  /** Optional value grid (e.g. 100 ¢) that identification options snap to, in absolute mode. */
  grid?: number;
}

// ── Number helpers ──────────────────────────────────────────────

export const num = (p: Params, key: string, fallback: number) => {
  const v = Number(p[key]);
  return Number.isFinite(v) ? v : fallback;
};

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function step(v: number, delta: number, dir: number, scale: Scale): number {
  return scale === 'ratio' ? v * Math.pow(1 + delta / 100, dir) : v + dir * delta;
}

/** Distance in Δ units (% for ratio, unit for additive). */
export function distance(a: number, b: number, scale: Scale): number {
  if (scale === 'ratio') {
    const hi = Math.max(a, b);
    const lo = Math.max(1e-9, Math.min(a, b));
    return (hi / lo - 1) * 100;
  }
  return Math.abs(a - b);
}

/** Position 0..1 within bounds (log for ratio) and back. */
export function toUnit(v: number, [lo, hi]: [number, number], scale: Scale) {
  if (scale === 'ratio') return (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo) || 1);
  return (v - lo) / (hi - lo || 1);
}
export function fromUnit(u: number, [lo, hi]: [number, number], scale: Scale) {
  if (scale === 'ratio') return Math.exp(Math.log(lo) + u * (Math.log(hi) - Math.log(lo)));
  return lo + u * (hi - lo);
}

/**
 * Random value inside bounds that leaves room for `below` Δ-steps
 * downward and `above` Δ-steps upward.
 */
export function rove(
  bounds: [number, number],
  rng: () => number,
  delta: number,
  scale: Scale,
  below = 0,
  above = below
): number {
  const lo = step(bounds[0], delta, below, scale);
  const hi = step(bounds[1], delta, -above, scale);
  if (lo >= hi) return fromUnit(0.5, bounds, scale);
  return fromUnit(rng(), [lo, hi], scale);
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ── Mode-aware view ─────────────────────────────────────────────

export interface Judged {
  relative: boolean;
  quantity: string;
  lowWord: string;
  highWord: string;
  scale: Scale;
  bounds: [number, number];
  display: DisplayUnit;
  deltaUnit: string;
  delta: { min: number; max: number };
  format: (v: number) => string;
  formatDelta: (d: number) => string;
  /** Full presentation of value v (prelude included). */
  present: (v: number, seed: number) => Sequence;
  /** Snap grid for identification options (absolute additive mode only). */
  grid?: number;
  pairGapSec: number;
  intervalGapSec: number;
}

export function judge(model: PrimitiveModel, p: Params): Judged {
  const relative = p.mode === 'relative';
  const quantity = typeof model.quantity === 'function' ? model.quantity(p) : model.quantity;
  const absBounds: [number, number] = [
    num(p, 'rangeMin', model.defaultRange[0]),
    num(p, 'rangeMax', model.defaultRange[1]),
  ];
  if (absBounds[0] > absBounds[1]) absBounds.reverse();
  if (model.scale === 'ratio') absBounds[0] = Math.max(absBounds[0], 1e-3);

  const disp: DisplayUnit = model.display?.(p) ?? {
    unit: model.unit,
    to: (v) => v,
    from: (d) => d,
    decimals: model.decimals,
  };
  const pairGapSec = num(p, 'pairGapMs', 600) / 1000;
  const intervalGapSec = num(p, 'intervalGapMs', 900) / 1000;
  // Random level per presentation: only the trained variable is informative.
  const levelRove = num(p, 'levelRoveDb', model.levelRoveDb);
  const render = (v: number, seed: number): Sequence => {
    const seq = model.render(v, p, seed);
    if (!levelRove) return seq;
    const shift = (mulberry32(seed ^ 0x51ed270b)() * 2 - 1) * levelRove;
    return { ...seq, sounds: seq.sounds.map((s) => ({ ...s, levelDb: s.levelDb + shift })) };
  };
  const prelude = (seq: Sequence) => {
    const pre = model.prelude?.(p);
    return pre ? concat(pre, seq, 0) : seq;
  };
  const deltaUnit = model.scale === 'ratio' ? '%' : model.unit;
  const delta = {
    min: num(p, 'minDelta', model.delta.min),
    max: num(p, 'maxDelta', model.delta.max),
  };
  const formatDelta = (d: number) =>
    model.scale === 'ratio' ? `${d.toFixed(d < 10 ? 1 : 0)}%` : `${d.toFixed(model.decimals || 1)} ${model.unit}`;

  if (!relative) {
    return {
      relative,
      quantity,
      lowWord: model.lowWord,
      highWord: model.highWord,
      scale: model.scale,
      bounds: absBounds,
      display: disp,
      deltaUnit,
      delta,
      format: (v) => model.format?.(v, p) ?? `${disp.to(v).toFixed(disp.decimals)} ${disp.unit}`,
      formatDelta,
      present: (v, seed) => prelude(render(v, seed)),
      grid: model.scale === 'additive' ? model.grid : undefined,
      pairGapSec,
      intervalGapSec,
    };
  }

  // Relative: the judged value is the relation between a roved anchor and a target.
  const relMax = num(p, 'relativeMax', model.relativeMax);
  const bounds: [number, number] =
    model.scale === 'ratio' ? [1 / Math.max(1.0001, relMax), Math.max(1.0001, relMax)] : [-relMax, relMax];
  const apply = (a: number, v: number) => (model.scale === 'ratio' ? a * v : a + v);

  return {
    relative,
    quantity: `${quantity} relationship`,
    lowWord: `${model.lowWord} vs its anchor`,
    highWord: `${model.highWord} vs its anchor`,
    scale: model.scale,
    bounds,
    display:
      model.scale === 'ratio'
        ? { unit: '×', to: (v) => v, from: (d) => d, decimals: 2 }
        : { unit: model.unit, to: (v) => v, from: (d) => d, decimals: model.decimals || 1 },
    deltaUnit,
    delta,
    format: (v) =>
      model.scale === 'ratio'
        ? `×${v.toFixed(2)}`
        : `${v >= 0 ? '+' : ''}${v.toFixed(model.decimals || 1)} ${model.unit}`,
    formatDelta,
    present: (v, seed) => {
      const rng = mulberry32(seed ^ 0x9e3779b9);
      let lo: number;
      let hi: number;
      if (model.scale === 'ratio') {
        lo = Math.max(absBounds[0], absBounds[0] / v);
        hi = Math.min(absBounds[1], absBounds[1] / v);
      } else {
        lo = Math.max(absBounds[0], absBounds[0] - v);
        hi = Math.min(absBounds[1], absBounds[1] - v);
      }
      const anchor = lo <= hi ? fromUnit(rng(), [lo, hi], model.scale) : fromUnit(0.5, absBounds, model.scale);
      const pair = concat(render(anchor, seed), render(apply(anchor, v), seed + 101), pairGapSec);
      return prelude(pair);
    },
    pairGapSec,
    intervalGapSec,
  };
}

// ── Settings builders ───────────────────────────────────────────

export function primitiveDimensions(model: PrimitiveModel, extra: VariableDimension[] = []): VariableDimension[] {
  const dUnit = model.scale === 'ratio' ? '%' : model.unit;
  return [
    {
      id: 'mode',
      label: 'Judge',
      kind: 'select',
      defaultValue: 'absolute',
      options: [
        { value: 'absolute', label: 'Absolute value' },
        { value: 'relative', label: 'Relative to an anchor' },
      ],
      helpText: 'Relative plays an anchor then a target; the anchor is roved so only the relationship is informative.',
    },
    { id: 'rangeMin', label: `Range min`, kind: 'number', defaultValue: model.defaultRange[0], range: { min: -100000, max: 100000, step: 1, unit: model.unit, extendable: true } },
    { id: 'rangeMax', label: `Range max`, kind: 'number', defaultValue: model.defaultRange[1], range: { min: -100000, max: 100000, step: 1, unit: model.unit, extendable: true } },
    {
      id: 'relativeMax',
      label: model.scale === 'ratio' ? 'Max ratio (relative)' : 'Max difference (relative)',
      kind: 'number',
      defaultValue: model.relativeMax,
      range: { min: 0, max: 1000, step: model.scale === 'ratio' ? 0.05 : 0.5, unit: model.scale === 'ratio' ? '×' : model.unit, extendable: true },
      appliesWhen: { dimension: 'mode', values: ['relative'] },
    },
    { id: 'startDelta', label: 'Starting difference', kind: 'number', defaultValue: model.delta.start, range: { min: 0, max: 100000, step: 0.1, unit: dUnit, extendable: true }, helpText: 'Staircase start. Also the tolerance for estimation and matching.' },
    { id: 'minDelta', label: 'Smallest difference', kind: 'number', defaultValue: model.delta.min, range: { min: 0, max: 100000, step: 0.1, unit: dUnit, extendable: true } },
    { id: 'maxDelta', label: 'Largest difference', kind: 'number', defaultValue: model.delta.max, range: { min: 0, max: 100000, step: 0.1, unit: dUnit, extendable: true } },
    { id: 'categories', label: 'Categories (T1)', kind: 'number', defaultValue: 3, range: { min: 2, max: 7, step: 1, unit: '', extendable: false } },
    ...extra,
  ];
}

export const SOURCE_OPTIONS = [
  { value: 'sine', label: 'Sine' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'sawtooth', label: 'Sawtooth' },
  { value: 'square', label: 'Square' },
  { value: 'noise', label: 'Noise' },
];

export function sourceParams(defaults: { source: string; frequency: number; levelDb?: number; levelRoveDb?: number }): StimulusParameter[] {
  const out: StimulusParameter[] = [
    { id: 'source', label: 'Source', kind: 'select', defaultValue: defaults.source, options: SOURCE_OPTIONS },
    { id: 'frequency', label: 'Frequency', kind: 'number', defaultValue: defaults.frequency, range: { min: 20, max: 20000, step: 1, unit: 'Hz', extendable: true } },
    { id: 'rampMs', label: 'Onset/offset ramp', kind: 'number', defaultValue: 5, range: { min: 1, max: 100, step: 1, unit: 'ms', extendable: true } },
    { id: 'pairGapMs', label: 'Gap between anchor and target', kind: 'number', defaultValue: 600, range: { min: 100, max: 5000, step: 50, unit: 'ms', extendable: true } },
    { id: 'intervalGapMs', label: 'Gap between intervals', kind: 'number', defaultValue: 900, range: { min: 200, max: 5000, step: 50, unit: 'ms', extendable: true } },
  ];
  if (defaults.levelRoveDb !== undefined) {
    out.push({ id: 'levelRoveDb', label: 'Random level ±', kind: 'number', defaultValue: defaults.levelRoveDb, range: { min: 0, max: 12, step: 0.5, unit: 'dB', extendable: true }, helpText: 'Random level per sound so loudness is never a clue.' });
  }
  if (defaults.levelDb !== undefined) {
    out.splice(2, 0, { id: 'levelDb', label: 'Level', kind: 'number', defaultValue: defaults.levelDb, range: { min: -80, max: 0, step: 0.5, unit: 'dBFS', extendable: true } });
  }
  return out;
}

export function sourceFrom(p: Params): 'sine' | 'triangle' | 'sawtooth' | 'square' | 'noise' {
  const s = String(p.source ?? 'sine');
  return (['sine', 'triangle', 'sawtooth', 'square', 'noise'].includes(s) ? s : 'sine') as any;
}

// ── Registry ────────────────────────────────────────────────────

const MODELS = new Map<string, PrimitiveModel>();
export function registerPrimitive(variableId: string, model: PrimitiveModel) {
  MODELS.set(variableId, model);
}
export function getPrimitive(variableId: string): PrimitiveModel | undefined {
  return MODELS.get(variableId);
}
