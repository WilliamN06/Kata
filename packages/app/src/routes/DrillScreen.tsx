import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { PerceptualRating, DrillProps } from '@kata/core';
import { getSubskill, getVariable } from '../registry';
import { useSettings } from '../hooks/useSettings';
import { useDrillState } from '../hooks/useDrillState';
import { SettingsPanel } from './SettingsPanel';
import { RatingPanel } from './RatingPanel';

export function DrillScreen() {
  const { domainId, subskillId, variableId, taskType } = useParams<{
    domainId?: string;
    subskillId: string;
    variableId: string;
    taskType: string;
  }>();
  const navigate = useNavigate();

  const subskill = subskillId ? getSubskill((domainId ?? subskillId.split(':')[0]) ?? '', subskillId) : undefined;
  const variable = variableId ? getVariable(variableId) : undefined;

  const {
    config,
    loading,
    updateTaskConditions,
    updateVariableParams,
    updateStimulusParams,
    reset,
  } = useSettings(subskillId ?? '', variableId ?? '', taskType ?? '');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingRating, setPendingRating] = useState<null | {
    correct: boolean;
    userResponse: unknown;
    correctResponse: unknown;
    responseTimeMs: number;
  }>(null);
  const [feedback, setFeedback] = useState<null | {
    correct: boolean;
    userResponse: unknown;
    correctResponse: unknown;
  }>(null);

  const {
    trials,
    staircase,
    complete,
    accuracy,
    recordTrial,
    restart,
    endSession,
  } = useDrillState(config);

  const [trialKey, setTrialKey] = useState(0);
  const [sessionStart, setSessionStart] = useState(() => Date.now());
  const advanceRef = useRef<NodeJS.Timeout | null>(null);
  const answerRef = useRef<
    (result: {
      correct: boolean;
      responseTimeMs: number;
      userResponse: unknown;
      correctResponse: unknown;
    }) => void
  >(() => {});

  useEffect(() => {
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  useEffect(() => {
    setSessionStart(Date.now());
  }, [config?.id]);

  useEffect(() => {
    if (!config || loading || complete) return;
    const limit = config.taskConditions.sessionLengthMinutes;
    if (limit === 'endless') return;

    const id = setInterval(() => {
      if (Date.now() - sessionStart >= limit * 60 * 1000) {
        endSession();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [config, loading, complete, sessionStart, endSession]);

  useEffect(() => {
    if (!config || loading || complete || feedback || pendingRating) return;
    const deadline = config.taskConditions.responseDeadlineSeconds;
    if (deadline === 'none') return;

    const id = setTimeout(() => {
      answerRef.current({
        correct: false,
        responseTimeMs: deadline * 1000,
        userResponse: 'timeout',
        correctResponse: 'no response',
      });
    }, deadline * 1000);
    return () => clearTimeout(id);
  }, [trialKey, config, loading, complete, feedback, pendingRating]);

  const goBack = () => {
    const domain = domainId ?? subskillId?.split(':')[0] ?? 'music';
    navigate(`/drill-picker/${domain}`);
  };

  if (loading || !subskill || !variable || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">Loading drill…</p>
          <p className="text-xs text-neutral-600 font-mono">
            {subskillId} / {variableId} / {taskType}
          </p>
          <p className="text-xs text-neutral-600 mt-2">
            loading: {String(loading)} · subskill: {String(!!subskill)} · variable: {String(!!variable)} · config: {String(!!config)}
          </p>
          <button onClick={goBack} className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const safeTaskType = taskType ?? '';
  const drill =
    subskill.drillsByVariable?.[variableId ?? '']?.[
      safeTaskType as keyof typeof subskill.drills
    ] ?? subskill.drills[safeTaskType as keyof typeof subskill.drills];

  if (!drill) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-400">Drill not registered for this task type.</p>
        <p className="text-xs text-neutral-600 font-mono">taskType: {safeTaskType}</p>
        <p className="text-xs text-neutral-600 font-mono">
          registered: {Object.keys(subskill.drills).join(', ')}
        </p>
        <button onClick={goBack} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm">
          ← Back
        </button>
      </div>
    );
  }

  const DrillRenderer = drill.renderer as React.ComponentType<DrillProps>;

  const handleAnswer = async (result: {
    correct: boolean;
    responseTimeMs: number;
    userResponse: unknown;
    correctResponse: unknown;
  }) => {
    if (feedback || pendingRating) return;

    const showFeedback =
      config.taskConditions.feedbackTiming !== 'session-end';

    if (showFeedback) {
      setFeedback({
        correct: result.correct,
        userResponse: result.userResponse,
        correctResponse: result.correctResponse,
      });
    }

    if (config.taskConditions.enableRatings) {
      setPendingRating({
        correct: result.correct,
        userResponse: result.userResponse,
        correctResponse: result.correctResponse,
        responseTimeMs: result.responseTimeMs,
      });
      return;
    }

    await recordTrial(result.correct, result.userResponse, result.correctResponse, result.responseTimeMs);

    const intervalMs =
      Math.max(0, config.taskConditions.interTrialIntervalSeconds) * 1000;
    const feedbackMs = showFeedback
      ? (config.taskConditions.feedbackTiming === 'delayed'
          ? Math.max(500, config.taskConditions.feedbackDelaySeconds * 1000)
          : 900) + intervalMs
      : Math.max(150, intervalMs);

    advanceRef.current = setTimeout(() => {
      setFeedback(null);
      setTrialKey((k) => k + 1);
    }, feedbackMs);
  };

  answerRef.current = handleAnswer;

  const advanceAfterRating = async (rating?: PerceptualRating) => {
    if (!pendingRating) return;
    await recordTrial(
      pendingRating.correct,
      pendingRating.userResponse,
      pendingRating.correctResponse,
      pendingRating.responseTimeMs,
      rating
    );
    setPendingRating(null);
    const intervalMs =
      Math.max(0, config.taskConditions.interTrialIntervalSeconds) * 1000;
    advanceRef.current = setTimeout(() => {
      setFeedback(null);
      setTrialKey((k) => k + 1);
    }, 300 + intervalMs);
  };

  if (complete) {
    const correctCount = trials.filter((t) => t.correct).length;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <h1 className="text-3xl font-bold mb-2">Session Complete</h1>
          <p className="text-neutral-400 mb-8">
            {variable.name} · {safeTaskType.replace(/^T\d-/, '')}
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Accuracy</div>
                <div className="text-3xl font-bold">{Math.round(accuracy * 100)}%</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Correct</div>
                <div className="text-3xl font-bold">{correctCount}/{trials.length}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Threshold</div>
                <div className="text-3xl font-bold font-mono">{staircase.currentValue.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                restart();
                setSessionStart(Date.now());
                setTrialKey((k) => k + 1);
              }}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
            >
              Drill Again
            </button>
            <button
              onClick={goBack}
              className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold"
            >
              Back to Picker
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-neutral-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="text-neutral-400 hover:text-neutral-200 text-sm">
              ← Back
            </button>
            <span className="text-sm text-neutral-400">
              {variable.id.split(':').slice(-1)[0]} · {variable.name}
            </span>
            <span className="text-xs text-neutral-600 font-mono">
              Trial {trials.length + 1}
              {config.taskConditions.repetitions !== 'endless' ? `/${config.taskConditions.repetitions}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-mono">Δ {staircase.currentValue.toFixed(2)}</span>
            {config.taskConditions.repetitions === 'endless' && (
              <button onClick={endSession} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-semibold">
                End
              </button>
            )}
            <button onClick={() => setSettingsOpen(true)} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs">
              ⚙
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <DrillRenderer
          key={trialKey}
          trialKey={trialKey}
          variable={variable}
          taskType={config.taskType}
          taskConditions={config.taskConditions}
          variableParams={config.variableParams}
          stimulusParams={config.stimulusParams}
          currentValue={staircase.currentValue}
          onAnswer={handleAnswer}
        />
      </div>

      {pendingRating && (
        <RatingPanel
          onSubmit={(rating) => {
            void advanceAfterRating(rating);
          }}
          onSkip={() => {
            void advanceAfterRating();
          }}
        />
      )}

      {feedback && !pendingRating && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div
            className={`px-10 py-6 rounded-2xl text-center shadow-2xl ${feedback.correct ? 'bg-green-600' : 'bg-red-600'}`}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {feedback.correct ? '✓ CORRECT' : '✗ INCORRECT'}
            </div>
            <div className="text-white/80 text-sm">Correct answer: {String(feedback.correctResponse)}</div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <SettingsPanel
          variable={variable}
          config={config}
          onUpdateTaskConditions={updateTaskConditions}
          onUpdateVariableParams={updateVariableParams}
          onUpdateStimulusParams={updateStimulusParams}
          onReset={reset}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}



