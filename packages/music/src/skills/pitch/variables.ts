import type { Variable } from '@kata/core';
import {
  concat,
  mulberry32,
  num,
  primitiveDimensions,
  single,
  sourceFrom,
  sourceParams,
  type Params,
  type PrimitiveModel,
  type Sequence,
} from '../../shared/primitives';

/**
 * Pitch has two isolatable primitives:
 *   - pitch height: where a single tone sits (cents re A4)
 *   - interval: the distance between two tones (cents, semitone categories)
 * Chords are intervals sounding together and belong in integration drills.
 * Tones are synthesised with a fixed waveform so timbre never varies, and
 * level is roved so loudness (which changes with frequency) is not a cue.
 */

const centsToHz = (c: number) => 440 * 2 ** (c / 1200);
const NOTES = ['A', 'A♯', 'B', 'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯'];

function noteName(cents: number): string {
  const semis = Math.round(cents / 100);
  const off = Math.round(cents - semis * 100);
  const idx = ((semis % 12) + 12) % 12;
  const octave = 4 + Math.floor((semis + 9) / 12);
  return `${NOTES[idx]}${octave}${off ? ` ${off > 0 ? '+' : ''}${off}¢` : ''}`;
}

const INTERVALS = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];
function intervalName(cents: number): string {
  const semis = Math.round(cents / 100);
  const off = Math.round(cents - semis * 100);
  const base = semis >= 0 && semis <= 12 ? INTERVALS[semis] : `${semis} st`;
  return `${base}${off ? ` ${off > 0 ? '+' : ''}${off}¢` : ''}`;
}

const tone = (p: Params, cents: number, at = 0): Sequence => {
  const s = single({
    durationMs: num(p, 'durationMs', 500),
    source: sourceFrom(p),
    frequency: centsToHz(cents),
    levelDb: num(p, 'levelDb', -14),
    attackMs: num(p, 'rampMs', 10),
    releaseMs: num(p, 'rampMs', 10),
  });
  return at ? { ...s, sounds: s.sounds.map((x) => ({ ...x, at: x.at + at })) } : s;
};

export const PITCH_HEIGHT: PrimitiveModel = {
  quantity: 'pitch',
  lowWord: 'lower',
  highWord: 'higher',
  scale: 'additive',
  unit: '¢',
  decimals: 0,
  defaultRange: [-1200, 1200],
  delta: { start: 50, min: 0.5, max: 400 },
  relativeMax: 1200,
  target: 8,
  levelRoveDb: 2,
  grid: 100,
  format: (v) => `${Math.round(centsToHz(v))} Hz (${noteName(v)})`,
  render: (v, p) => tone(p, v),
};

export const INTERVAL: PrimitiveModel = {
  quantity: 'interval',
  lowWord: 'smaller',
  highWord: 'larger',
  scale: 'additive',
  unit: '¢',
  decimals: 0,
  defaultRange: [0, 1200],
  delta: { start: 100, min: 1, max: 600 },
  relativeMax: 600,
  target: 15,
  levelRoveDb: 2,
  grid: 100,
  format: (v) => intervalName(v),
  render: (v, p, seed) => {
    const r = mulberry32(seed ^ 0x2545f491);
    const lo = num(p, 'rootMin', -900);
    const hi = num(p, 'rootMax', 0);
    const root = lo + r() * Math.max(0, hi - lo);
    const dir = p.direction === 'down' ? -1 : p.direction === 'random' ? (r() < 0.5 ? -1 : 1) : 1;
    const second = root + dir * v;
    if (p.harmonic === 'harmonic') {
      const a = tone(p, root);
      const b = tone(p, second);
      return { sounds: [...a.sounds, ...b.sounds], lengthSec: a.lengthSec };
    }
    return concat(tone(p, root), tone(p, second), num(p, 'noteGapMs', 150) / 1000);
  },
};

export const PITCH_VARIABLES: Variable[] = [
  {
    id: 'music:p1-pitch:V1' as any,
    name: 'Pitch Height',
    definition: 'Where a single tone sits in pitch, in cents relative to A4 (440 Hz).',
    unit: '¢',
    defaultValue: 50,
    variableDimensions: primitiveDimensions(PITCH_HEIGHT),
    stimulusParameters: [
      ...sourceParams({ source: 'triangle', frequency: 440, levelDb: -14, levelRoveDb: 2 }).filter((s) => s.id !== 'frequency'),
      { id: 'durationMs', label: 'Duration', kind: 'number', defaultValue: 500, range: { min: 50, max: 3000, step: 10, unit: 'ms', extendable: true } },
    ],
    visualisation: 'spectrum',
  },
  {
    id: 'music:p1-pitch:V2' as any,
    name: 'Interval',
    definition: 'The distance between two tones, in cents. The root changes every trial, so only the distance is informative.',
    unit: '¢',
    defaultValue: 100,
    variableDimensions: primitiveDimensions(INTERVAL, [
      {
        id: 'direction',
        label: 'Direction',
        kind: 'select',
        defaultValue: 'up',
        options: [
          { value: 'up', label: 'Ascending' },
          { value: 'down', label: 'Descending' },
          { value: 'random', label: 'Random' },
        ],
      },
      {
        id: 'harmonic',
        label: 'Presentation',
        kind: 'select',
        defaultValue: 'melodic',
        options: [
          { value: 'melodic', label: 'Melodic (one after the other)' },
          { value: 'harmonic', label: 'Harmonic (together)' },
        ],
      },
      { id: 'rootMin', label: 'Lowest root', kind: 'number', defaultValue: -900, range: { min: -4800, max: 2400, step: 50, unit: '¢ re A4', extendable: true } },
      { id: 'rootMax', label: 'Highest root', kind: 'number', defaultValue: 0, range: { min: -4800, max: 2400, step: 50, unit: '¢ re A4', extendable: true } },
    ]),
    stimulusParameters: [
      ...sourceParams({ source: 'triangle', frequency: 440, levelDb: -14, levelRoveDb: 2 }).filter((s) => s.id !== 'frequency'),
      { id: 'durationMs', label: 'Note duration', kind: 'number', defaultValue: 500, range: { min: 50, max: 3000, step: 10, unit: 'ms', extendable: true } },
      { id: 'noteGapMs', label: 'Gap between notes', kind: 'number', defaultValue: 150, range: { min: 0, max: 2000, step: 10, unit: 'ms', extendable: true } },
    ],
    visualisation: 'spectrum',
  },
];

export const PITCH_MODELS = [
  { variable: PITCH_VARIABLES[0]!, model: PITCH_HEIGHT },
  { variable: PITCH_VARIABLES[1]!, model: INTERVAL },
];
