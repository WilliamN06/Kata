import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { LineChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { describeHorizontalTilt } from '../angle-utils';

export function V2HorizontalDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const autoContinue = settings?.autoContinue ?? true;
  const feedbackDurationMs = settings?.feedbackDurationMs ?? 1500;
  const angleDisplayMode = settings?.angleDisplayMode ?? 'line';
  const angleShowReference = settings?.angleShowReference ?? true;
  const angleReferenceType = settings?.angleReferenceType ?? 'horizontal';

  const tiltsUp = useMemo(() => Math.random() > 0.5, []);
  const trueAngle = tiltsUp ? delta : -delta;

  const handleAnswer = (saysHorizontal: boolean) => {
    if (answered) return;
    setAnswered(true);

    const correct = !saysHorizontal; // line IS tilted
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

  const tilt = describeHorizontalTilt(trueAngle);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="mb-8">
        <LineChip
          angle={trueAngle}
          width={360}
          height={240}
          mode={angleDisplayMode}
          showAngleFromReference={answered && angleShowReference ? angleReferenceType : 'none'}
          showReferenceGuides={answered && angleShowReference}
        />
      </div>

      <p className="text-lg text-neutral-200 mb-8">
        Is this line perfectly horizontal?
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold transition-colors"
        >
          HORIZONTAL
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold transition-colors"
        >
          TILTED
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
            The line was tilted <strong>{tilt.degrees.toFixed(1)}°</strong> {' '}
            <strong>{tilt.direction}</strong> from horizontal.
          </p>

          {!autoContinue && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}