import { beforeEach, describe, expect, it } from 'vitest';
import type { TrialResult } from '@kata/core';
import { MemoryAdapter } from './adapters';
import { setDbAdapter } from './database';
import { getVariableState, logTrial } from './queries';

const trial = (over: Partial<TrialResult>): TrialResult => ({
  variableId: 'music:p2-dynamic:V1' as any,
  taskType: 'T2-discrimination',
  correct: true,
  responseTimeMs: 500,
  userResponse: 'First',
  correctResponse: 'First',
  stimulusParams: {},
  variableParams: {},
  taskConditions: {} as any,
  ...over,
});

describe('threshold logging', () => {
  beforeEach(() => {
    localStorage.clear();
    setDbAdapter(new MemoryAdapter());
  });

  it('keeps the latest threshold and one history entry per session', async () => {
    await logTrial(trial({ delta: 3, threshold: null, sessionId: 's1' }));
    await logTrial(trial({ delta: 2.4, threshold: 2.1, sessionId: 's1' }));
    await logTrial(trial({ delta: 1.9, threshold: 1.8, sessionId: 's1' }));
    await logTrial(trial({ delta: 1.5, threshold: 1.2, sessionId: 's2' }));

    const st = await getVariableState('music:p2-dynamic:V1');
    const rec = st?.thresholds?.['T2-discrimination'];
    expect(rec?.latest).toBe(1.2);
    expect(rec?.history.map((h) => [h.sessionId, h.value])).toEqual([
      ['s1', 1.8],
      ['s2', 1.2],
    ]);
    expect(st?.threshold).toBe(1.2);
    expect(st?.trialCount).toBe(4);
  });

  it('keeps thresholds separate per task type', async () => {
    await logTrial(trial({ threshold: 2, sessionId: 'a' }));
    await logTrial(trial({ taskType: 'T7-identification', threshold: 5, sessionId: 'b' }));
    const st = await getVariableState('music:p2-dynamic:V1');
    expect(st?.thresholds?.['T2-discrimination']?.latest).toBe(2);
    expect(st?.thresholds?.['T7-identification']?.latest).toBe(5);
  });

  it('logs the delta on each trial', async () => {
    await logTrial(trial({ delta: 4.2, sessionId: 'x' }));
    const raw = JSON.parse(localStorage.getItem('kata.memory-adapter.v1')!);
    expect(raw.trial_history[0].delta).toBe(4.2);
    expect(raw.trial_history[0].session_id).toBe('x');
  });
});
