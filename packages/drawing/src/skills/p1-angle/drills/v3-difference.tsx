import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { LineChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { angleDifference } from '../angle-utils';

export function V3DifferenceDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const autoContinue = settings?.autoContinue ?? true;
  const feedbackDurationMs = settings?.feedbackDurationMs ?? 1500;
  const angleDisplayMode = settings?.angleDisplayMode ?? 'line';

  const baseAngle = useMemo(() => 30 + Math.random() * 60, []);
  const angleDiff = delta * 2;
  const secondAngle = baseAngle + angleDiff;

  const handleAnswer = (saysDifferent: boolean) => {
    if (answered) return;
    setAnswered(true);

    const correct = saysDifferent; // they ARE different
    setWasCorrect(correct);

    const responseTime = Date.now() - startTime.current;

    if (autoContinue) {
      setTimeout(() => {
        onAnswer(correct, responseTime);
      }, feedbackDurationMs);
    }
  };

  const handleContinue = () => {
    const responseTime = Date.now() - startTime.current;
    onAnswer(wasCorrect ?? false, responseTime);
  };

  const diff = angleDifference(baseAngle, secondAngle);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-8">
        Do these lines have the same angle?
      </p>

      <div className="flex gap-12 mb-16">
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <LineChip angle={baseAngle} width={220} height={220} mode={angleDisplayMode} />
        </div>
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <LineChip angle={secondAngle} width={220} height={220} mode={angleDisplayMode} />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(false)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold transition-colors"
        >
          SAME
        </button>
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold transition-colors"
        >
          DIFFERENT
        </button>
      </div>

      {answered && wasCorrect !== null && (
        <div
          className={`mt-8 p-6 rounded-lg border ${wasCorrect
            ? 'bg-green-950/40 border-green-800'
            : 'bg-red-950/40 border-red-800'}`}
        >
          <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The angle difference was <strong>{diff.toFixed(1)}°</strong>.
          </p>

          {!autoContinue && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}