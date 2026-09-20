import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { GrayGradient, ValueChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Phase = 'judging' | 'feedback';

export function V6MachDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  // A gradient from dark to light. The Mach band at the transition
  // creates an illusion of extra contrast. The user must judge values
  // AWAY from the edge.
  const startL = useMemo(() => 20 + Math.random() * 10, []);
  const endL = useMemo(() => 70 + Math.random() * 10, []);

  // Sample two values: one at the edge (appears exaggerated) and one in the middle
  const edgeL = startL + (endL - startL) * 0.5;
  const midL = startL + (endL - startL) * 0.75;

  // The correct answer: which value is actually lighter?
  // The midL is always lighter because it's further along the gradient.
  const handleAnswer = (saidMidLighter: boolean) => {
    if (answered) return;
    setAnswered(true);
    const correct = saidMidLighter;
    setWasCorrect(correct);
    setPhase('feedback');
  };

  const handleContinue = () => {
    const correct = wasCorrect ?? false;
    const responseTime = Date.now() - startTime.current;
    onAnswer(correct, responseTime);
    setPhase('judging');
  };

  const deltaL = Math.abs(midL - edgeL);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">
        Which sample is lighter?
      </p>
      <p className="text-sm text-neutral-500 mb-8">
        Ignore the edge effect — judge the values, not the transition
      </p>

      <div className="mb-12 rounded-lg overflow-hidden border border-neutral-700">
        <GrayGradient
          width={400}
          height={120}
          startL={calibratedLStar(startL)}
          endL={calibratedLStar(endL)}
          bands={1}
        />
      </div>

      <div className="flex gap-12 mb-12">
        <div className="text-center">
          <div className="rounded-lg overflow-hidden border border-neutral-700 mb-2">
            <ValueChip lStar={calibratedLStar(edgeL)} width={120} height={120} />
          </div>
          <p className="text-xs text-neutral-500">From the edge</p>
          <button
            onClick={() => handleAnswer(false)}
            disabled={answered}
            className="mt-3 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg text-sm font-semibold transition-colors"
          >
            THIS IS LIGHTER
          </button>
        </div>

        <div className="text-center">
          <div className="rounded-lg overflow-hidden border border-neutral-700 mb-2">
            <ValueChip lStar={calibratedLStar(midL)} width={120} height={120} />
          </div>
          <p className="text-xs text-neutral-500">From the middle</p>
          <button
            onClick={() => handleAnswer(true)}
            disabled={answered}
            className="mt-3 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg text-sm font-semibold transition-colors"
          >
            THIS IS LIGHTER
          </button>
        </div>
      </div>

      <p className="text-xs text-neutral-600 text-center max-w-md">
        Mach bands make edges appear more contrasty than they are. Judge the actual values, not the transition.
      </p>

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
            The middle was <strong>{formatDeltaL(deltaL)}</strong> lighter than the edge.
            Mach bands made the edge appear exaggerated.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}