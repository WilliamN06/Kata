export interface StaircaseState {
  currentValue: number;
  correctStreak: number;
  reversals: number[];
  lastDirection: 'up' | 'down' | null;
  trialCount: number;
}

export function createStaircase(initialValue: number): StaircaseState {
  return { currentValue: initialValue, correctStreak: 0, reversals: [], lastDirection: null, trialCount: 0 };
}

export function updateStaircase(state: StaircaseState, correct: boolean, harderFactor = 0.8, easierFactor = 1.4, streakThreshold = 2): StaircaseState {
  const next = { ...state };
  next.trialCount++;
  if (correct) {
    next.correctStreak++;
    if (next.correctStreak >= streakThreshold) {
      next.currentValue *= harderFactor;
      next.correctStreak = 0;
      if (next.lastDirection === 'up') next.reversals = [...next.reversals, next.currentValue];
      next.lastDirection = 'down';
    }
  } else {
    next.correctStreak = 0;
    next.currentValue *= easierFactor;
    if (next.lastDirection === 'down') next.reversals = [...next.reversals, next.currentValue];
    next.lastDirection = 'up';
  }
  return next;
}

export function computeThreshold(state: StaircaseState): number | null {
  if (state.reversals.length < 4) return null;
  const recent = state.reversals.slice(-6);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}
