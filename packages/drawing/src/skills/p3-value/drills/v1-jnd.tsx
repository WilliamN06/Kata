import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

export function V1JNDDrill({ delta, onAnswer, calibratedLStar, settings, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const lighterIsLeft = useMemo(() => Math.random() > 0.5, []);
  
  // Use variable params for base range
  const baseRange = (settings?.variableParams?.baseRange as string) ?? 'full';
  
  // Pick baseL from the selected range
  const baseL = useMemo(() => {
    const ranges: Record<string, [number, number]> = {
      dark: [15, 35],
      mid: [35, 65],
      light: [65, 85],
      full: [15, 85],
      random: [10, 90],
    };
    const [min, max] = (ranges[baseRange] ?? ranges.full) as [number, number];
    return min + Math.random() * (max - min);
  }, [baseRange]);
  
  // Use step size range from settings to determine actual delta for this trial
  const stepMin = settings?.stepSizeMin ?? 1;
  const stepMax = settings?.stepSizeMax ?? 5;
  const actualDelta = stepMin + Math.random() * (stepMax - stepMin);
  
  // Ensure the difference stays inside 0-100
  const lighterL = Math.min(95, baseL + actualDelta);
  const darkerL = lighterL - actualDelta;

  const leftL = calibratedLStar(lighterIsLeft ? lighterL : darkerL);
  const rightL = calibratedLStar(lighterIsLeft ? darkerL : lighterL);

  const handleAnswer = (saidLeftLighter: boolean) => {
    if (answered) return;
    setAnswered(true);
    const correct = saidLeftLighter === lighterIsLeft;
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
      <div className="flex gap-12 mb-16">
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <ValueChip lStar={leftL} width={180} height={180} border />
        </div>
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <ValueChip lStar={rightL} width={180} height={180} border />
        </div>
      </div>

      <p className="text-lg text-neutral-200 mb-8">Which square is lighter?</p>

      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg text-neutral-100 font-semibold transition-colors"
        >
          LEFT
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg text-neutral-100 font-semibold transition-colors"
        >
          RIGHT
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
            The squares differed by <strong>{formatDeltaL(actualDelta)}</strong>.
            {!wasCorrect && ' Try a slightly larger difference next time.'}
          </p>
          {!task.autoContinue && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}