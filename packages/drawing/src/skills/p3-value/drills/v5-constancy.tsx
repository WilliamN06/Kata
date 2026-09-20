import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip, ValueScale } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Phase = 'judging' | 'feedback';

export function V5ConstancyDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('judging');
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  // The "paper" is white. In shadow it appears darker than it is.
  // The user must see through the illumination and identify its true value.
  const trueL = useMemo(() => 85 + Math.random() * 10, []);
  // Shadow makes it LOOK darker
  const shadowAmount = 30 + delta * 2;
  const shadowedL = Math.max(10, trueL - shadowAmount);
  const litL = trueL;

  const handleStepSelect = (step: number) => {
    setSelectedStep(step);
    const userL = (step / 9) * 100;
    const error = Math.abs(userL - trueL);
    const tolerance = Math.max(5, delta * 2);
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
      <p className="text-lg text-neutral-200 mb-2">
        What is the true value of the paper?
      </p>
      <p className="text-sm text-neutral-500 mb-8">
        Ignore the illumination — this is white paper
      </p>

      <div className="flex gap-6 mb-12">
        {/* Shadowed side */}
        <div>
          <div
            className="p-8 rounded-lg"
            style={{
              background: `rgb(${calibratedLStar(shadowedL - 20)}, ${calibratedLStar(shadowedL - 20)}, ${calibratedLStar(shadowedL - 20)})`,
            }}
          >
            <div className="rounded overflow-hidden">
              <ValueChip lStar={calibratedLStar(shadowedL)} width={140} height={140} />
            </div>
          </div>
          <p className="text-center text-xs text-neutral-500 mt-2">In shadow</p>
        </div>

        {/* Lit side */}
        <div>
          <div
            className="p-8 rounded-lg"
            style={{
              background: `rgb(${calibratedLStar(95)}, ${calibratedLStar(95)}, ${calibratedLStar(95)})`,
            }}
          >
            <div className="rounded overflow-hidden">
              <ValueChip lStar={calibratedLStar(litL)} width={140} height={140} />
            </div>
          </div>
          <p className="text-center text-xs text-neutral-500 mt-2">In light</p>
        </div>
      </div>

      <ValueScale
        steps={10}
        width={400}
        height={60}
        selectedStep={selectedStep}
        onSelect={handleStepSelect}
      />

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
            True value: <strong>L* {trueL.toFixed(0)}</strong>. Your answer: <strong>{((selectedStep ?? 0) / 9 * 100).toFixed(0)}</strong>.
            Error: <strong>{formatDeltaL(Math.abs(trueL - (selectedStep ?? 0) / 9 * 100))}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}