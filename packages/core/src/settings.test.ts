import { describe, it, expect } from 'vitest';
import { DRILL_VARIABLE_SETTING_FIELDS, resolveSettings } from './settings';
import type { DrillSettings } from './types';

describe('DRILL_VARIABLE_SETTING_FIELDS for P1 V6', () => {
  const fieldsFor = (sid: string, did: string) =>
    DRILL_VARIABLE_SETTING_FIELDS.filter((f) => !f.appliesTo || f.appliesTo(sid, did));

  it('applies the correctness-range field only to V6', () => {
    const forV6 = fieldsFor('p1-angle', 'V6');
    const notV6 = fieldsFor('p1-angle', 'V1');
    expect(forV6.some((f) => f.key === 'magnitudeTolerance')).toBe(true);
    expect(notV6.some((f) => f.key === 'magnitudeTolerance')).toBe(false);
  });

  it('models the correctness range as a numbered input (not buttons)', () => {
    const f = DRILL_VARIABLE_SETTING_FIELDS.find((x) => x.key === 'magnitudeTolerance')!;
    expect(f.type).toBe('number');
    expect(f.min).toBe(1);
    expect(f.max).toBe(30);
    expect(f.step).toBe(0.5);
    expect(f.default).toBe(5);
  });

  it('adds an opening-direction control for V6', () => {
    const f = DRILL_VARIABLE_SETTING_FIELDS.find((x) => x.key === 'magnitudeDirection')!;
    expect(f.type).toBe('select');
    expect(f.options?.map((o) => o.value)).toEqual(['above', 'below', 'random']);
    expect(f.default).toBe('random');
  });

  it('carries V6 fields through resolveSettings so renderers can read them', () => {
    const base: DrillSettings = { id: 'g', tier: 'global', difficultyMode: 'auto', range: 'moderate', tolerance: 'moderate', interaction: 'independent', variability: 'predictable', conditions: '1', taskCondition: 'none', backgroundCondition: 'none', trialsPerSession: 20, endless: false, streakThreshold: 5, answerDisplayDuration: 1500, autoContinue: true, feedbackDurationMs: 1500 };
    const perDrill = { magnitudeTolerance: 3, magnitudeDirection: 'below' } as Partial<DrillSettings>;
    const resolved = resolveSettings(base, undefined, perDrill);
    expect(resolved.magnitudeTolerance).toBe(3);
    expect(resolved.magnitudeDirection).toBe('below');
  });
});