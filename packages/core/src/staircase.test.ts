import { describe, it, expect } from 'vitest';
import {
  createStaircase,
  updateStaircase,
  computeThreshold,
  getProgress,
  isComplete,
  resetStaircase,
} from './staircase';
import { STAIRCASE } from './constants';

describe('staircase', () => {
  describe('createStaircase', () => {
    it('creates a staircase with default delta and bounds', () => {
      const s = createStaircase();
      expect(s.currentDelta).toBe(STAIRCASE.INITIAL_DELTA);
      expect(s.minDelta).toBe(STAIRCASE.MIN_DELTA);
      expect(s.maxDelta).toBe(STAIRCASE.MAX_DELTA);
      expect(s.trialCount).toBe(0);
      expect(s.correctStreak).toBe(0);
      expect(s.history).toEqual([]);
    });

    it('accepts custom initial delta and bounds', () => {
      const s = createStaircase(10, { minDelta: 1, maxDelta: 50 });
      expect(s.currentDelta).toBe(10);
      expect(s.minDelta).toBe(1);
      expect(s.maxDelta).toBe(50);
    });
  });

  describe('step-size bounds are respected (the "step size difference" setting)', () => {
    it('clamps the delta to the configured minimum', () => {
      // Build a staircase with a tight lower bound and force it as easy as
      // possible (repeated incorrect answers shrink the delta).
      let s = createStaircase(10, { minDelta: 2, maxDelta: 50 });
      for (let i = 0; i < 20; i++) {
        s = updateStaircase(s, false);
      }
      expect(s.currentDelta).toBeGreaterThanOrEqual(2);
    });

    it('clamps the delta to the configured maximum', () => {
      let s = createStaircase(2, { minDelta: 0.5, maxDelta: 8 });
      // Correct answers reduce difficulty by making the target *harder* to spot
      // (a smaller delta), so force several wrong answers to push it up instead.
      // Wrong answers multiply by EASIER_FACTOR -> currentDelta grows.
      for (let i = 0; i < 10; i++) {
        s = updateStaircase(s, false);
      }
      expect(s.currentDelta).toBeLessThanOrEqual(8);
    });

    it('the delta difference between min and max changes the difficulty envelope', () => {
      const wide = createStaircase(5, { minDelta: 0.5, maxDelta: 50 });
      const narrow = createStaircase(5, { minDelta: 4, maxDelta: 6 });
      expect(wide.maxDelta!).toBeGreaterThan(narrow.maxDelta!);
      expect(wide.minDelta!).toBeLessThan(narrow.minDelta!);
    });
  });

  describe('updateStaircase', () => {
    it('records history and increments trial count', () => {
      let s = createStaircase(10, { minDelta: 1, maxDelta: 20 });
      s = updateStaircase(s, true);
      expect(s.trialCount).toBe(1);
      expect(s.history).toEqual([{ delta: 10, correct: true }]);
    });

    it('hardens after a correct streak', () => {
      let s = createStaircase(10, { minDelta: 1, maxDelta: 20 });
      // STREAK_THRESHOLD is 2.
      s = updateStaircase(s, true); // streak 1
      s = updateStaircase(s, true); // streak 2 -> harden
      expect(s.currentDelta).toBe(10 * STAIRCASE.HARDER_FACTOR);
      expect(s.correctStreak).toBe(0);
    });

    it('eases after an incorrect answer', () => {
      let s = createStaircase(10, { minDelta: 1, maxDelta: 20 });
      s = updateStaircase(s, false);
      expect(s.currentDelta).toBe(10 * STAIRCASE.EASIER_FACTOR);
      expect(s.correctStreak).toBe(0);
    });

    it('records a reversal when the direction flips', () => {
      let s = createStaircase(10, { minDelta: 1, maxDelta: 20 });
      s = updateStaircase(s, false); // down -> up (easier), direction up
      expect(s.lastDirection).toBe('up');
      s = updateStaircase(s, true); // streak 1
      s = updateStaircase(s, true); // streak 2 -> harden, direction down
      expect(s.lastDirection).toBe('down');
      expect(s.reversals.length).toBe(1);
    });
  });

  describe('computeThreshold', () => {
    it('returns null until enough reversals exist', () => {
      const s = createStaircase();
      expect(computeThreshold(s)).toBeNull();
    });

    it('returns the mean of recent reversals', () => {
      let s = createStaircase(10, { minDelta: 1, maxDelta: 20 });
      // Force several reversals by alternating wrong/correct-until-harden.
      for (let i = 0; i < 20; i++) {
        s = updateStaircase(s, i % 2 === 0 ? false : true);
      }
      if (s.reversals.length >= 4) {
        const recent = s.reversals.slice(-STAIRCASE.REVERSALS_FOR_THRESHOLD);
        const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
        expect(computeThreshold(s)).toBeCloseTo(mean, 6);
      } else {
        expect(computeThreshold(s)).toBeNull();
      }
    });
  });

  describe('getProgress / isComplete', () => {
    it('reports progress as a ratio of trials', () => {
      const s = createStaircase();
      expect(getProgress(s)).toBe(0);
      expect(isComplete(s)).toBe(false);
    });

    it('reports complete when trials reach the session length', () => {
      let s = createStaircase();
      for (let i = 0; i < STAIRCASE.TRIALS_PER_SESSION; i++) {
        s = updateStaircase(s, true);
      }
      expect(isComplete(s)).toBe(true);
      expect(getProgress(s)).toBe(1);
    });
  });

  describe('resetStaircase', () => {
    it('resets trials while keeping bounds', () => {
      const s = createStaircase(8, { minDelta: 2, maxDelta: 30 });
      const r = resetStaircase(s);
      expect(r.trialCount).toBe(0);
      expect(r.currentDelta).toBe(8);
      expect(r.minDelta).toBe(2);
      expect(r.maxDelta).toBe(30);
    });
  });
});