import { STAIRCASE } from './constants';
import type { StaircaseState } from './types';

export function createStaircase(
  initialDelta?: number,
  bounds?: { minDelta?: number; maxDelta?: number }
): StaircaseState {
  return {
    currentDelta: initialDelta ?? STAIRCASE.INITIAL_DELTA,
    correctStreak: 0,
    reversals: [],
    lastDirection: null,
    trialCount: 0,
    history: [],
    minDelta: bounds?.minDelta ?? STAIRCASE.MIN_DELTA,
    maxDelta: bounds?.maxDelta ?? STAIRCASE.MAX_DELTA,
  };
}

export function updateStaircase(state: StaircaseState, correct: boolean): StaircaseState {
  const next: StaircaseState = {
    ...state,
    history: [...state.history, { delta: state.currentDelta, correct }],
    trialCount: state.trialCount + 1,
  };

  if (correct) {
    next.correctStreak = state.correctStreak + 1;

    if (next.correctStreak >= STAIRCASE.STREAK_THRESHOLD) {
      next.currentDelta = state.currentDelta * STAIRCASE.HARDER_FACTOR;
      next.correctStreak = 0;

      if (state.lastDirection === 'up') {
        next.reversals = [...state.reversals, next.currentDelta];
      }
      next.lastDirection = 'down';
    }
  } else {
    next.correctStreak = 0;
    next.currentDelta = state.currentDelta * STAIRCASE.EASIER_FACTOR;

    if (state.lastDirection === 'down') {
      next.reversals = [...state.reversals, next.currentDelta];
    }
    next.lastDirection = 'up';
  }

  const minDelta = state.minDelta ?? STAIRCASE.MIN_DELTA;
  const maxDelta = state.maxDelta ?? STAIRCASE.MAX_DELTA;
  next.currentDelta = Math.max(minDelta, Math.min(maxDelta, next.currentDelta));

  return next;
}

export function computeThreshold(state: StaircaseState): number | null {
  if (state.reversals.length < 4) return null;
  const recent = state.reversals.slice(-STAIRCASE.REVERSALS_FOR_THRESHOLD);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

export function getProgress(state: StaircaseState): number {
  return Math.min(1, state.trialCount / STAIRCASE.TRIALS_PER_SESSION);
}

export function isComplete(state: StaircaseState): boolean {
  return state.trialCount >= STAIRCASE.TRIALS_PER_SESSION;
}

export function resetStaircase(state: StaircaseState): StaircaseState {
  return createStaircase(state.currentDelta, {
    minDelta: state.minDelta,
    maxDelta: state.maxDelta,
  });
}