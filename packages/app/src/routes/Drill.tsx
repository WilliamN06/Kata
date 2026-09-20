import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createStaircase,
  updateStaircase,
  isComplete,
  computeThreshold,
  STAIRCASE,
  resolveSettings,
} from '@kata/core';
import { useStore } from '@kata/db';
import { FeedbackOverlay, TrialProgress, DeltaDisplay, TrialTimer, ContinueButton } from '@kata/ui';
import { getSubskill } from '../registry';
import { useCalibratedLStar } from '../hooks/useCalibration';

export function Drill() {
  const { domainId, subskillId, drillId } = useParams<{
    domainId: string;
    subskillId: string;
    drillId: string;
  }>();
  const navigate = useNavigate();
  const recordTrial = useStore((s) => s.recordTrial);
  const ensureState = useStore((s) => s.ensureState);
  const settings = useStore((s) => s.settings);
  const getDrillConfig = useStore((s) => s.getDrillConfig);
  const calibrate = useCalibratedLStar();

  const subskill = useMemo(
    () => (domainId && subskillId ? getSubskill(domainId, subskillId) : undefined),
    [domainId, subskillId]
  );
  const variable = subskill?.variables.find((v) => v.id === drillId);
  const drill = subskill && drillId ? subskill.drills[drillId] : undefined;

  // Resolve settings: global + perSubskill + perDrill
  const resolvedSettings = useMemo(() => {
    const global = settings;
    const perSub = settings.perSubskill?.[subskillId ?? ''] ?? {};
    const perDr = settings.perDrill?.[drillId ?? ''] ?? {};
    return resolveSettings(global, perSub, perDr);
  }, [settings, subskillId, drillId]);

  // Staircase delta bounds derive from the step-size settings so the
  // "step size difference" actually controls difficulty.
  const staircaseBounds = useMemo(() => {
    const min = Number(resolvedSettings.stepSizeMin) || STAIRCASE.MIN_DELTA;
    const max = Number(resolvedSettings.stepSizeMax) || 5;
    return { minDelta: min, maxDelta: max * 10 };
  }, [resolvedSettings.stepSizeMin, resolvedSettings.stepSizeMax]);

  const [staircase, setStaircase] = useState(() => createStaircase(undefined, staircaseBounds));
  const [feedback, setFeedback] = useState<{ correct: boolean; reason: 'user' | 'timeout'; delta: number } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showThresholdAlert, setShowThresholdAlert] = useState(false);
  const [drillConfig, setDrillConfig] = useState<any>(null);
  const sessionStart = useRef(Date.now());
  const ensureDone = useRef(false);

  const stateId = domainId && subskillId && drillId
    ? `${domainId}:${subskillId}:${drillId}`
    : '';

  const isEndless = drillConfig?.task?.endless ?? resolvedSettings.endless ?? false;
  const isTimed = drillConfig?.task?.timed ?? resolvedSettings.timed ?? false;
  const secondsPerTrial = drillConfig?.task?.secondsPerTrial ?? resolvedSettings.secondsPerTrial ?? 15;
  const autoContinue = drillConfig?.task?.autoContinue ?? resolvedSettings.autoContinue ?? true;
  const feedbackDurationMs = drillConfig?.task?.feedbackDurationMs ?? resolvedSettings.feedbackDurationMs ?? 1500;

  // Merge variableParams from drillConfig into resolvedSettings for things like angleDisplayMode
  const variableParams = {
    ...(resolvedSettings.variableParams || {}),
    ...(drillConfig?.variable || {}),
  };
  const mergedSettings: typeof resolvedSettings = {
    ...resolvedSettings,
    // Per-drill overrides at top level so renderers can read e.g.
    // settings.angleDisplayMode / settings.autoContinue directly.
    ...(drillConfig?.task || {}),
    ...(resolvedSettings.variableParams || {}),
    ...(drillConfig?.variable || {}),
    variableParams,
  };

  useEffect(() => {
    if (!stateId || !domainId || !subskillId || !drillId || ensureDone.current) return;
    ensureDone.current = true;
    ensureState(stateId, domainId, subskillId, drillId);
  }, [stateId, domainId, subskillId, drillId, ensureState]);

  useEffect(() => {
    if (subskillId && drillId) {
      getDrillConfig(subskillId, drillId).then(setDrillConfig);
    }
  }, [subskillId, drillId, getDrillConfig]);

  useEffect(() => {
    setStaircase(createStaircase(undefined, staircaseBounds));
    setFeedback(null);
    setCorrectCount(0);
    setAnsweredCount(0);
    setStreak(0);
    setCompleted(false);
    setShowThresholdAlert(false);
    sessionStart.current = Date.now();
    ensureDone.current = false;
  }, [drillId]);

  if (!subskill || !variable || !drill || !domainId || !subskillId || !drillId) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-neutral-400 mb-4">Drill not found.</p>
        <Link to="/" className="text-blue-400 hover:underline">
          ← Home
        </Link>
      </div>
    );
  }

  const DrillRenderer = drill.renderer;

  const finalizeAnswer = (correct: boolean, reason: 'user' | 'timeout' = 'user') => {
    if (completed) return;

    const responseTime = Date.now() - sessionStart.current;
    recordTrial(stateId, correct, staircase.currentDelta, responseTime);

    setFeedback({ correct, reason, delta: staircase.currentDelta });
    if (correct) {
      setCorrectCount((c) => c + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (resolvedSettings.streakThreshold && newStreak >= resolvedSettings.streakThreshold) {
        setShowThresholdAlert(true);
        setTimeout(() => setShowThresholdAlert(false), 3000);
      }
    } else {
      setStreak(0);
    }
    setAnsweredCount((c) => c + 1);

    const next = updateStaircase(staircase, correct);
    setStaircase(next);

    const advanceDelay = resolvedSettings.feedbackDurationMs ?? 1500;
    setTimeout(() => {
      setFeedback(null);

      const trialDone = isComplete(next);
      if (trialDone && !isEndless) {
        const threshold = computeThreshold(next);
        if (threshold !== null) {
          console.log('Session complete. Threshold:', threshold.toFixed(2));
        }
        setCompleted(true);
      }
    }, advanceDelay);
  };

  const handleTimeout = () => {
    finalizeAnswer(false, 'timeout');
  };

  const handleEndSession = () => {
    setCompleted(true);
  };

  if (completed) {
    const accuracy = staircase.trialCount > 0 ? correctCount / staircase.trialCount : 0;
    const threshold = computeThreshold(staircase);
    const duration = Math.round((Date.now() - sessionStart.current) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">{isEndless ? 'Session Ended' : 'Session Complete'}</h1>
        <p className="text-neutral-400 mb-8">
          {variable.name} · {isEndless ? 'Endless' : `${drill.defaultTrials} trials`}
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Accuracy</div>
              <div className="text-3xl font-bold">{Math.round(accuracy * 100)}%</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Correct</div>
              <div className="text-3xl font-bold">
                {correctCount}/{staircase.trialCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Threshold</div>
              <div className="text-3xl font-bold">
                {threshold !== null ? threshold.toFixed(1) : '—'}
              </div>
            </div>
          </div>
          {isEndless && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xs text-neutral-500">Total Trials</div>
                <div className="text-2xl font-bold">{staircase.trialCount}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Duration</div>
                <div className="text-2xl font-bold">{minutes}m {seconds}s</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setStaircase(createStaircase(undefined, staircaseBounds));
              setFeedback(null);
              setCorrectCount(0);
              setAnsweredCount(0);
              setStreak(0);
              setCompleted(false);
              sessionStart.current = Date.now();
            }}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
          >
            DRILL AGAIN
          </button>
          <Link
            to={`/${domainId}/${subskillId}`}
            className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold text-center transition-colors"
          >
            BACK TO {subskill.name.toUpperCase()}
          </Link>
        </div>

        <div className="text-center mt-4">
          <Link
            to={`/${domainId}/${subskillId}`}
            className="text-neutral-400 hover:text-neutral-200 text-sm"
          >
            ← Back to {subskill.name}
          </Link>
        </div>
      </div>
    );
  }

  const capitalizedDomain = domainId.charAt(0).toUpperCase() + domainId.slice(1);

  const handleDrillAnswer = (correct: boolean, responseTimeMs: number) => {
    finalizeAnswer(correct, 'user');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/${domainId}/${subskillId}`}
            className="text-neutral-400 hover:text-neutral-200 text-sm"
          >
            ← {capitalizedDomain}
          </Link>
          <Link
            to={`/${domainId}/${subskillId}/${drillId}/settings`}
            className="text-neutral-400 hover:text-neutral-200 text-xl"
            title="Drill settings"
          >
            ⚙️
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400">
            {variable.id} · {variable.name}
          </span>
          <DeltaDisplay delta={staircase.currentDelta} />
        </div>
      </div>

      {/* Timer (when timed) */}
      {isTimed && !completed && (
        <div className="max-w-4xl mx-auto p-4">
          <TrialTimer
            key={answeredCount}
            seconds={secondsPerTrial}
            onExpire={handleTimeout}
          />
        </div>
      )}

      {/* Stimulus */}
      <div className="flex-1 flex items-center justify-center">
        <DrillRenderer
  key={answeredCount}
  variable={variable}
  delta={staircase.currentDelta}
  onAnswer={handleDrillAnswer}
  calibratedLStar={calibrate}
  settings={mergedSettings}
  stimulus={drillConfig?.stimulus}
  task={drillConfig?.task ?? resolvedSettings}
  variableParams={variableParams}
/>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex justify-center">
            <TrialProgress
              current={answeredCount}
              total={isEndless ? Infinity : Math.max(drill.defaultTrials, resolvedSettings.trialsPerSession ?? 20)}
              correctCount={correctCount}
            />
          </div>
          {isEndless && !completed && (
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium"
            >
              END SESSION
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <FeedbackOverlay
          correct={feedback.correct}
          message={
            feedback.reason === 'timeout'
              ? `Time ran out. ${feedback.correct ? '' : 'The difference was '}${feedback.delta.toFixed(1)}%.`
              : feedback.correct
                ? `You detected a ${feedback.delta.toFixed(1)}% difference.`
                : `The difference was ${feedback.delta.toFixed(1)}%.`
          }
        />
      )}

      {/* Manual continue when autoContinue is off */}
      {!resolvedSettings.autoContinue && feedback && (
        <ContinueButton onClick={() => finalizeAnswer(feedback.correct, feedback.reason)} />
      )}

      {/* Threshold Alert */}
      {showThresholdAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl animate-in fade-in">
          🎉 Streak threshold reached! Keep going!
        </div>
      )}
    </div>
  );
}