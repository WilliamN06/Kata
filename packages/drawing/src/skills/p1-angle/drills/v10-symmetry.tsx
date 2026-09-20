import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { SymmetryChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';

export function V10SymmetryDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const autoContinue = settings?.autoContinue ?? true;
  const feedbackDurationMs = settings?.feedbackDurationMs ?? 1500;

  const isSymmetric = useMemo(() => Math.random() > 0.5, []);
  const asymmetry = isSymmetric ? 0 : delta;

  const handleAnswer = (saysSymmetric: boolean) => {
    if (answered) return;
    setAnswered(true);

    const correct = saysSymmetric === isSymmetric;
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="mb-8 rounded-lg overflow-hidden border border-neutral-700">
        <SymmetryChip asymmetry={asymmetry} width={300} height={300} />
      </div>

      <p className="text-lg text-neutral-200 mb-8">
        Is this shape symmetric?
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
        >
          SYMMETRIC
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
        >
          ASYMMETRIC
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
            Asymmetry: <strong>{asymmetry.toFixed(1)}°</strong>.
          </p>

          {!autoContinue && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}