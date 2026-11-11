import { describe as suite, expect, it } from 'vitest';
import { BASELINE, aWeight, describe, synthesize, type TimbreSpec } from './spectrum';

/**
 * Isolation tests: sweeping one variable must leave the measured centroid,
 * spread, tonal-to-noise ratio and A-weighted loudness of the output fixed.
 */

const base = (seed = 1): TimbreSpec => ({ ...BASELINE, f0: 220, seed, resFreq: 1500 });

type Sweep = { field: keyof TimbreSpec; values: number[]; changes: Array<'centroid' | 'spread' | 'hnr'> };

const SWEEPS: Sweep[] = [
  { field: 'centroid', values: [400, 800, 1600, 3000], changes: ['centroid'] },
  { field: 'spreadOct', values: [0.3, 0.8, 1.2, 1.5], changes: ['spread'] },
  { field: 'skew', values: [-0.5, -0.2, 0.2, 0.5], changes: [] },
  { field: 'evenDb', values: [0, -10, -20, -30], changes: [] },
  { field: 'irregDb', values: [0, 2, 4, 6], changes: [] },
  { field: 'inharm', values: [0, 0.0005, 0.002, 0.004], changes: [] },
  { field: 'resGainDb', values: [0, 5, 10, 15], changes: [] },
  { field: 'noiseDb', values: [-40, -20, 0, 10], changes: ['hnr'] },
  { field: 'roughDepth', values: [0, 0.3, 0.6, 1], changes: [] },
];

suite('timbre isolation', () => {
  for (const sw of SWEEPS) {
    it(`${String(sw.field)} leaves the other descriptors fixed`, () => {
      for (const seed of [1, 2, 3]) {
        for (const value of sw.values) {
          const d = describe({ ...base(seed), [sw.field]: value });
          if (!sw.changes.includes('centroid')) expect(Math.abs(d.centroid / BASELINE.centroid - 1)).toBeLessThan(0.02);
          if (!sw.changes.includes('spread')) expect(Math.abs(d.spread - BASELINE.spreadOct)).toBeLessThan(0.03);
          if (!sw.changes.includes('hnr')) expect(Math.abs(d.hnr + BASELINE.noiseDb)).toBeLessThan(0.5);
        }
      }
    });
  }

  it('the trained descriptor actually moves', () => {
    expect(describe({ ...base(), centroid: 2000 }).centroid).toBeCloseTo(2000, -2);
    expect(Math.abs(describe({ ...base(), spreadOct: 1.4 }).spread - 1.4)).toBeLessThan(0.03);
    expect(describe({ ...base(), noiseDb: 0 }).hnr).toBeCloseTo(0, 1);
    expect(describe({ ...base(), skew: 0.5 }).skewness).toBeGreaterThan(describe({ ...base(), skew: -0.5 }).skewness);
  });

  it('resonance at the edges of its roved range still holds brightness and width', () => {
    for (const resFreq of [500, 707, 1414, 2000]) {
      const d = describe({ ...base(), resFreq, resGainDb: 15 });
      expect(Math.abs(d.centroid / BASELINE.centroid - 1)).toBeLessThan(0.02);
      expect(Math.abs(d.spread - BASELINE.spreadOct)).toBeLessThan(0.03);
    }
  });

  it('pitch roving does not move brightness', () => {
    for (const f0 of [150, 220, 330]) {
      expect(Math.abs(describe({ ...base(), f0 }).centroid / BASELINE.centroid - 1)).toBeLessThan(0.02);
    }
  });
});

/** A-weighted power of rendered samples via a direct DFT on a coarse grid. */
function aWeightedPowerDb(x: Float32Array, sr: number): number {
  const n = 4096;
  const seg = x.subarray(2000, 2000 + n);
  let total = 0;
  for (let k = 1; k < n / 2; k++) {
    let re = 0;
    let im = 0;
    const w = (2 * Math.PI * k) / n;
    for (let i = 0; i < n; i++) {
      re += seg[i]! * Math.cos(w * i);
      im -= seg[i]! * Math.sin(w * i);
    }
    const p = (2 * (re * re + im * im)) / (n * n);
    total += p * aWeight((k * sr) / n) ** 2;
  }
  return 10 * Math.log10(total);
}

suite('timbre loudness', () => {
  it('rendered sounds have matched A-weighted power across variables', () => {
    const sr = 16000;
    const variants: Array<Partial<TimbreSpec>> = [
      {},
      { centroid: 400 },
      { centroid: 3000 },
      { spreadOct: 1.5 },
      { evenDb: -30 },
      { noiseDb: 10 },
      { resGainDb: 15 },
    ];
    const levels = variants.map((v) => aWeightedPowerDb(synthesize({ ...base(), ...v, fmax: 7000 }, sr), sr));
    const ref = levels[0]!;
    for (const l of levels) expect(Math.abs(l - ref)).toBeLessThan(1.5);
  }, 60000);
});
