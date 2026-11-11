import { useState, useCallback, useMemo, useRef } from 'react';
import type { DrillConfiguration, TrialResult, PerceptualRating } from '@kata/core';
import { computeThreshold, createStaircase, updateStaircase } from '@kata/core';
import type { StaircaseState } from '@kata/core';
import { logTrial } from '@kata/db';

export interface DrillTrial {
  trialIndex: number;
  correct: boolean;
  userResponse: unknown;
  correctResponse: unknown;
  responseTimeMs: number;
  rating?: PerceptualRating;
}

export function useDrillState(config: DrillConfiguration | null) {
  const [trials, setTrials] = useState<DrillTrial[]>([]);
  const [complete, setComplete] = useState(false);
  const [staircase, setStaircase] = useState<StaircaseState>(() =>
    createConfiguredStaircase(config)
  );
  const startTimeRef = useRef(Date.now());
  // Mirrors `staircase` so recordTrial can read the Δ the trial ran at.
  const staircaseRef = useRef(staircase);
  staircaseRef.current = staircase;

  // Reset during render (not in an effect) so the first trial never mounts
  // with the placeholder staircase value from before settings loaded.
  const resetKey = config
    ? JSON.stringify([
        config.id,
        config.variableParams.intervalValue,
        config.variableParams.angleValue,
        config.variableParams.offset,
        config.variableParams.range,
        config.variableParams.lowerBound,
        config.variableParams.upperBound,
        config.variableParams.startDelta,
        config.variableParams.minDelta,
        config.variableParams.maxDelta,
        config.variableParams.mode,
      ])
    : null;
  const [appliedKey, setAppliedKey] = useState<string | null>(null);
  if (resetKey !== null && resetKey !== appliedKey) {
    setAppliedKey(resetKey);
    setTrials([]);
    setComplete(false);
    const fresh = createConfiguredStaircase(config);
    setStaircase(fresh);
    staircaseRef.current = fresh;
    startTimeRef.current = Date.now();
  }

  const recordTrial = useCallback(
    async (
      correct: boolean,
      userResponse: unknown,
      correctResponse: unknown,
      responseTimeMs: number,
      rating?: PerceptualRating
    ) => {
      if (!config) return;

      const trial: DrillTrial = {
        trialIndex: 0,
        correct,
        userResponse,
        correctResponse,
        responseTimeMs,
        rating,
      };

      setTrials((prev) => {
        const next = [...prev, { ...trial, trialIndex: prev.length }];
        return next;
      });

      const prev = staircaseRef.current;
      let next = updateStaircase(prev, correct);
      const bounds = getStaircaseBounds(config);
      if (bounds) {
        next = {
          ...next,
          currentValue: Math.min(Math.max(next.currentValue, bounds.minDelta), bounds.maxDelta),
        };
      }
      staircaseRef.current = next;
      setStaircase(next);

      const result: TrialResult = {
        variableId: config.variableId,
        taskType: config.taskType,
        correct,
        responseTimeMs,
        userResponse,
        correctResponse,
        stimulusParams: config.stimulusParams,
        variableParams: config.variableParams,
        taskConditions: config.taskConditions,
        rating,
        delta: prev.currentValue,
        threshold: computeThreshold(next),
        sessionId: String(startTimeRef.current),
      };

      try {
        await logTrial(result);
      } catch (e) {
        console.error('[useDrillState] Failed to log trial:', e);
      }

      const targetReps = config.taskConditions.repetitions;
      if (targetReps !== 'endless') {
        setTrials((prev) => {
          if (prev.length >= (targetReps as number)) {
            setComplete(true);
          }
          return prev;
        });
      }
    },
    [config]
  );

  const restart = useCallback(() => {
    setTrials([]);
    setComplete(false);
    setStaircase(createConfiguredStaircase(config));
    startTimeRef.current = Date.now();
  }, [config]);

  const endSession = useCallback(() => setComplete(true), []);

  const accuracy = useMemo(
    () => (trials.length === 0 ? 0 : trials.filter((t) => t.correct).length / trials.length),
    [trials]
  );

  // Stable return — same object identity as long as inputs are the same
  return useMemo(
    () => ({
      trials,
      staircase,
      complete,
      accuracy,
      recordTrial,
      restart,
      endSession,
    }),
    [trials, staircase, complete, accuracy, recordTrial, restart, endSession]
  );
}

function createConfiguredStaircase(
  config: DrillConfiguration | null
): StaircaseState {
  if (!config) return createStaircase(1);

  const bounds = getStaircaseBounds(config);
  const initial = getInitialValue(config);
  const min = bounds?.minDelta ?? initial;
  const max = bounds?.maxDelta ?? initial;
  const clamped = Math.min(Math.max(initial, min), max);
  return createStaircase(clamped);
}

function getStaircaseBounds(
  config: DrillConfiguration
): { minDelta: number; maxDelta: number } | undefined {
  // Primitive drills: the staircase value is the difference Δ itself.
  const minD = Number(config.variableParams.minDelta);
  const maxD = Number(config.variableParams.maxDelta);
  if (Number.isFinite(minD) && Number.isFinite(maxD) && minD >= 0 && maxD > 0) {
    return { minDelta: Math.min(minD, maxD), maxDelta: Math.max(minD, maxD) };
  }
  const lower = Number(config.variableParams.lowerBound);
  const upper = Number(config.variableParams.upperBound);
  if (!Number.isFinite(lower) || !Number.isFinite(upper)) return undefined;
  if (lower <= 0 || upper <= 0) return undefined;
  return {
    minDelta: Math.min(lower, upper),
    maxDelta: Math.max(lower, upper),
  };
}

function getInitialValue(config: DrillConfiguration): number {
  const v = config.variableParams;
  const start = Number(v.startDelta);
  if (v.startDelta !== undefined && v.startDelta !== '' && Number.isFinite(start) && start > 0) return start;
  if (typeof v.intervalValue === 'number') return v.intervalValue;
  if (typeof v.angleValue === 'number') return v.angleValue;
  if (typeof v.offset === 'number') return v.offset;
  if (typeof v.range === 'number') return v.range;

  // For proportion V1 without a fixed ratioValue, pick a random whole number
  // within the lower/upper bounds each time the drill starts.
  const lower = Number(v.lowerBound);
  const upper = Number(v.upperBound);
  if (Number.isFinite(lower) && Number.isFinite(upper) && lower > 0 && upper > 0) {
    const min = Math.min(lower, upper);
    const max = Math.max(lower, upper);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return 1;
}
