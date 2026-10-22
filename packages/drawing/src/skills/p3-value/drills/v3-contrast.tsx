import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip, lStarToSrgb } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

export function V3ContrastDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  // The center gray is the SAME on both sides. Backgrounds differ.
  // delta controls contrast strength - larger delta = stronger contrast (easier to detect illusion)
  const centerL = 50;
  const bgSpread = Math.min(40, 10 + delta * 2);

  const leftBgL = calibratedLStar(50 - bgSpread);
  const rightBgL = calibratedLStar(50 + bgSpread);
  const centerLCal = calibratedLStar(centerL);

  const leftBgByte = lStarToSrgb(leftBgL);
  const rightBgByte = lStarToSrgb(rightBgL);

  const contrastDelta = Math.abs(leftBgL - rightBgL);

  const handleAnswer = (saidSame: boolean) => {
    if (answered) return;
    setAnswered(true);
    // They ARE the same value. Correct answer is always "SAME".
    const correct = saidSame;
    setWasCorrect(correct);
    const responseTime = Date.now() - startTime.current;
    if (task.autoContinue) {
      setTimeout(() => {
        onAnswer(correct, responseTime);
      }, task.feedbackDurationMs);
    }
  };

  const handleContinue = () => {
    onAnswer(wasCorrect ?? false, Date.now() - startTime.current);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-8">
        Are the center squares the same value?
      </p>

      <div className="flex gap-4 mb-12">
        <div
          className="p-12 rounded-lg"
          style={{ background: `rgb(${leftBgByte}, ${leftBgByte}, ${leftBgByte})` }}
        >
          <div className="rounded-lg overflow-hidden">
            <ValueChip lStar={centerLCal} width={120} height={120} />
          </div>
        </div>

        <div
          className="p-12 rounded-lg"
          style={{ background: `rgb(${rightBgByte}, ${rightBgByte}, ${rightBgByte})` }}
        >
          <div className="rounded-lg overflow-hidden">
            <ValueChip lStar={centerLCal} width={120} height={120} />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold transition-colors"
        >
          SAME
        </button>
        <button
          onClick={() => handleAnswer(false)}
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
            The background contrast was <strong>{formatDeltaL(contrastDelta)}</strong>.
            The center squares were identical.
          </p>
          {!task.autoContinue && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}