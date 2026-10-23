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
    createStaircase(config ? getInitialValue(config) : 1)
  );
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!config) return;
    setTrials([]);
    setComplete(false);
    setStaircase(createStaircase(getInitialValue(config)));
    startTimeRef.current = Date.now();
  }, [config?.id]);

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

      setStaircase((prev) => updateStaircase(prev, correct));

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
    setStaircase(createStaircase(config ? getInitialValue(config) : 1));
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

function getInitialValue(config: DrillConfiguration): number {
  const v = config.variableParams;
  if (typeof v.intervalValue === 'number') return v.intervalValue;
  if (typeof v.ratioValue === 'number') return v.ratioValue;
  if (typeof v.angleValue === 'number') return v.angleValue;
  if (typeof v.offset === 'number') return v.offset;
  if (typeof v.range === 'number') return v.range;
  return 1;
}
