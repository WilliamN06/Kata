import { useEffect, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AdaptationField, ValueChip, ValueScale } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Phase = 'adapting' | 'judging' | 'feedback';

export function V4AdaptationDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('adapting');
  const [adaptSeconds, setAdaptSeconds] = useState(5);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  // Randomly choose bright or dark adaptation field
  const adaptL = useRef(Math.random() > 0.5 ? 95 : 5);
  // Target gray - always midrange
  const targetL = useRef(50);

  useEffect(() => {
    if (phase !== 'adapting') return;
    startTime.current = Date.now();

    const interval = setInterval(() => {
      setAdaptSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setPhase('judging');
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const handleStepSelect = (step: number) => {
    setSelectedStep(step);
    const userL = (step / 9) * 100;
    const error = Math.abs(userL - targetL.current);
    const tolerance = Math.max(2, delta);
    const correct = error <= tolerance;
    setWasCorrect(correct);
    setPhase('feedback');
  };

  const handleContinue = () => {
    const correct = wasCorrect ?? false;
    const responseTime = Date.now() - startTime.current;
    onAnswer(correct, responseTime);
    setPhase('adapting');
  };

  if (phase === 'adapting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AdaptationField
          lStar={calibratedLStar(adaptL.current)}
          width={window.innerWidth}
          height={window.innerHeight}
          className="fixed inset-0"
        />
        <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl text-white/80 mb-4">Adapting to {adaptL.current > 50 ? 'bright' : 'dark'} field...</p>
          <p className="text-5xl font-bold text-white/90">{adaptSeconds}</p>
          <p className="text-sm text-white/60 mt-8">Keep your eyes on the field</p>
        </div>
      </div>
    );
  }

  if (phase === 'judging') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <p className="text-lg text-neutral-200 mb-2">
          What value is this gray after adaptation?
        </p>
        <p className="text-sm text-neutral-500 mb-8">
          Judge relative to the 10-step scale
        </p>

        <div className="mb-12 rounded-lg overflow-hidden border border-neutral-700">
          <ValueChip lStar={calibratedLStar(targetL.current)} width={180} height={180} />
        </div>

        <ValueScale
          steps={10}
          width={400}
          height={60}
          selectedStep={selectedStep}
          onSelect={handleStepSelect}
        />

        <div className="flex justify-between text-xs text-neutral-500 mt-2" style={{ width: 400 }}>
          <span>1 (dark)</span>
          <span>10 (light)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">
        What value is this gray after adaptation?
      </p>

      <div className="mb-12 rounded-lg overflow-hidden border border-neutral-700">
        <ValueChip lStar={calibratedLStar(targetL.current)} width={180} height={180} />
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
            True value: <strong>L* 50</strong>. Your answer was <strong>{((selectedStep ?? 0) / 9 * 100).toFixed(0)}</strong>.
            Error: <strong>{formatDeltaL(Math.abs(targetL.current - (selectedStep ?? 0) / 9 * 100))}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}