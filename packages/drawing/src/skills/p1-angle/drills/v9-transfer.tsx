import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { angleDifference } from '../angle-utils';

export function V9TransferDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const autoContinue = settings?.autoContinue ?? true;
  const feedbackDurationMs = settings?.feedbackDurationMs ?? 1500;

  const baseAngle = useMemo(() => 20 + Math.random() * 100, []);
  const sameAngle = Math.random() > 0.5;
  const secondAngle = sameAngle ? baseAngle : baseAngle + delta;

  const handleAnswer = (saysSame: boolean) => {
    if (answered) return;
    setAnswered(true);

    const correct = saysSame === sameAngle;
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
        Do these two angles match?
      </p>

      <div className="flex gap-16 mb-8 items-end">
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <AngleChip
            angle={baseAngle}
            width={180}
            height={160}
            mode={answered ? 'both-lines-dots' : 'two-lines'}
            showAnnotation={answered}
            showReference={true}
            referenceAngle={90}
          />
        </div>
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <AngleChip
            angle={secondAngle}
            width={360}
            height={320}
            mode={answered ? 'both-lines-dots' : 'two-lines'}
            showAnnotation={answered}
            showReference={true}
            referenceAngle={90}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
        >
          SAME
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
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