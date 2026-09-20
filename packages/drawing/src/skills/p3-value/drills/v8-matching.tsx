import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip, ValueScale } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Phase = 'judging' | 'feedback';

export function V8MatchingDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  // Random target value (mid-range to avoid extremes)
  const targetL = useMemo(() => 30 + Math.random() * 40, []);

  // The scale step that corresponds to targetL (0-9)
  const correctStep = Math.round((targetL / 100) * 9);

  const handleStepSelect = (step: number) => {
    setSelectedStep(step);
    const error = Math.abs(step - correctStep);
    // Tolerance: delta/10 converts to steps
    const tolerance = Math.max(0, delta / 10);
    const correct = error <= tolerance;
    setWasCorrect(correct);
    setPhase('feedback');
  };

  const handleContinue = () => {
    const correct = wasCorrect ?? false;
    const responseTime = Date.now() - startTime.current;
    onAnswer(correct, responseTime);
    setPhase('judging');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">Match this tone to the value scale</p>
      <p className="text-sm text-neutral-500 mb-8">
        Tap the step that best matches
      </p>

      <div className="mb-12 rounded-lg overflow-hidden border border-neutral-700">
        <ValueChip lStar={calibratedLStar(targetL)} width={180} height={180} />
      </div>

      <ValueScale
        steps={10}
        width={500}
        height={70}
        selectedStep={selectedStep}
        onSelect={handleStepSelect}
      />

      <div className="flex justify-between text-xs text-neutral-500 mt-2" style={{ width: 500 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="w-[50px] text-center">
            {i + 1}
          </span>
        ))}
      </div>

      {phase === 'feedback' && (
        <div
          className={`mt-8 p-6 rounded-lg border ${wasCorrect
            ? 'bg-green-950/40 border-green-800'
            : 'bg-red-950/40 border-red-800'}`}
        >
          <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            Target value: <strong>{targetL.toFixed(0)}</strong>. Your selection: step <strong>{(selectedStep ?? 0) + 1}</strong>.
            Error: <strong>{formatDeltaL(Math.abs(targetL - (selectedStep ?? 0) / 9 * 100))}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}