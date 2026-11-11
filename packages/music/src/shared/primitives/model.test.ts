import { describe, expect, it } from 'vitest';
import { distance, judge, rove, step, type PrimitiveModel } from './model';
import { mulberry32 } from './audio';
import { SOUND_DURATION, SILENCE_DURATION } from '../../skills/rhythm/variables';
import { LEVEL } from '../../skills/dynamic/variables';
import { WIDTH, WETNESS } from '../../skills/spatial/variables';

describe('step / distance', () => {
  it('ratio scale: Δ is a percentage and distance inverts it', () => {
    expect(step(200, 25, 1, 'ratio')).toBeCloseTo(250);
    expect(distance(200, 250, 'ratio')).toBeCloseTo(25);
    expect(distance(250, 200, 'ratio')).toBeCloseTo(25);
  });
  it('additive scale: Δ is in units', () => {
    expect(step(-20, 3, -1, 'additive')).toBe(-23);
    expect(distance(-20, -23, 'additive')).toBe(3);
  });
});

describe('rove', () => {
  it('leaves room for the requested steps on both sides', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 500; i++) {
      const v = rove([100, 800], rng, 30, 'ratio', 1.5, 1.5);
      expect(step(v, 30, -1.5, 'ratio')).toBeGreaterThanOrEqual(100 - 1e-6);
      expect(step(v, 30, 1.5, 'ratio')).toBeLessThanOrEqual(800 + 1e-6);
    }
  });
});

const params = (model: PrimitiveModel, extra: Record<string, string | number> = {}) => ({
  rangeMin: model.defaultRange[0],
  rangeMax: model.defaultRange[1],
  ...extra,
});

describe('rendering', () => {
  it('sound duration renders one sound of exactly that length', () => {
    const seq = judge(SOUND_DURATION, params(SOUND_DURATION)).present(320, 1);
    expect(seq.sounds).toHaveLength(1);
    expect(seq.sounds[0]!.durationMs).toBe(320);
  });

  it('silence duration puts exactly the gap between marker offset and next onset', () => {
    const seq = judge(SILENCE_DURATION, params(SILENCE_DURATION, { markerMs: 100 })).present(250, 1);
    const [a, b] = seq.sounds;
    expect(b!.at - (a!.at + a!.durationMs / 1000)).toBeCloseTo(0.25);
  });

  it('count-in puts the stimulus on the beat after four clicks', () => {
    const seq = judge(SOUND_DURATION, params(SOUND_DURATION, { units: 'beats', countIn: 'on', tempo: 120 })).present(300, 1);
    expect(seq.sounds.filter((s) => s.source === 'click')).toHaveLength(4);
    expect(seq.sounds[4]!.at).toBeCloseTo(2.0);
  });

  it('% of beat display converts both ways', () => {
    const J = judge(SOUND_DURATION, params(SOUND_DURATION, { units: 'beats', tempo: 120 }));
    expect(J.display.to(250)).toBeCloseTo(50);
    expect(J.display.from(50)).toBeCloseTo(250);
  });

  it('level is applied as dBFS', () => {
    const seq = judge(LEVEL, params(LEVEL)).present(-18, 1);
    expect(seq.sounds[0]!.levelDb).toBe(-18);
  });

  it('width maps 0% → correlation 1 and 100% → 0, always noise', () => {
    const p = params(WIDTH, { source: 'sine' });
    expect(judge(WIDTH, p).present(0, 1).sounds[0]!.correlation).toBe(1);
    const wide = judge(WIDTH, p).present(100, 1).sounds[0]!;
    expect(wide.correlation).toBe(0);
    expect(wide.source).toBe('noise');
  });

  it('wetness uses the same room regardless of trial seed', () => {
    const J = judge(WETNESS, params(WETNESS));
    expect(J.present(-6, 1).sounds[0]!.roomSeed).toBe(J.present(0, 999).sounds[0]!.roomSeed);
  });
});

describe('relative mode', () => {
  it('ratio: target = anchor × value, anchor inside range', () => {
    const J = judge(SOUND_DURATION, params(SOUND_DURATION, { mode: 'relative' }));
    for (let seed = 1; seed < 50; seed++) {
      const [a, b] = J.present(1.5, seed).sounds;
      expect(b!.durationMs / a!.durationMs).toBeCloseTo(1.5);
      expect(a!.durationMs).toBeGreaterThanOrEqual(100);
      expect(b!.durationMs).toBeLessThanOrEqual(800 + 1e-6);
    }
  });

  it('additive: target = anchor + value', () => {
    const J = judge(LEVEL, params(LEVEL, { mode: 'relative' }));
    const [a, b] = J.present(-4, 7).sounds;
    expect(b!.levelDb - a!.levelDb).toBeCloseTo(-4);
  });

  it('anchor roves between trials', () => {
    const J = judge(LEVEL, params(LEVEL, { mode: 'relative' }));
    const anchors = new Set([1, 2, 3, 4, 5].map((s) => J.present(3, s).sounds[0]!.levelDb.toFixed(2)));
    expect(anchors.size).toBeGreaterThan(1);
  });
});
