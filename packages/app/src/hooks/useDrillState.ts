import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { DrillConfiguration, TrialResult, PerceptualRating } from '@kata/core';
import { createStaircase, updateStaircase } from '@kata/core';
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

  useEffect(() => {
    if (!config) return;
    setTrials([]);
    setComplete(false);
    setStaircase(createConfiguredStaircase(config));
    startTimeRef.current = Date.now();
  }, [
    config?.id,
    config?.variableParams.intervalValue,
    config?.variableParams.angleValue,
    config?.variableParams.offset,
    config?.variableParams.range,
    config?.variableParams.lowerBound,
    config?.variableParams.upperBound,
  ]);

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

      setStaircase((prev) => {
        const next = updateStaircase(prev, correct);
        const bounds = getStaircaseBounds(config);
        if (!bounds) return next;
        return {
          ...next,
          currentValue: Math.min(
            Math.max(next.currentValue, bounds.minDelta),
            bounds.maxDelta
          ),
        };
      });

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
