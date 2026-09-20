import { useEffect, useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip, ValueScale } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Phase = 'memorize' | 'delay' | 'recall' | 'feedback';

export function V10MemoryDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('memorize');
  const [countdown, setCountdown] = useState(3);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const targetL = useRef(30 + Math.random() * 40);
  const delaySeconds = Math.max(2, 5 - delta / 5);

  useEffect(() => {
    if (phase === 'memorize') {
      const timer = setTimeout(() => {
        setPhase('delay');
        setCountdown(3);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (phase === 'delay') {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            setPhase('recall');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleStepSelect = (step: number) => {
    setSelectedStep(step);
    const userL = (step / 9) * 100;
    const error = Math.abs(userL - targetL.current);
    const tolerance = Math.max(2, delta / 2);
    const correct = error <= tolerance;
    setWasCorrect(correct);
    setPhase('feedback');
  };

  const handleContinue = () => {
    const correct = wasCorrect ?? false;
    const responseTime = Date.now() - startTime.current;
    onAnswer(correct, responseTime);
    setPhase('memorize');
  };

  if (phase === 'memorize') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-neutral-200 mb-8">Memorize this value</p>
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <ValueChip lStar={calibratedLStar(targetL.current)} width={220} height={220} />
        </div>
        <p className="text-sm text-neutral-500 mt-8">Focus on the exact tone</p>
      </div>
    );
  }

  if (phase === 'delay') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-4xl text-neutral-200 mb-4">{countdown}</p>
        <p className="text-sm text-neutral-500">Hold the value in mind</p>
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <p className="text-lg text-neutral-200 mb-2">What was the value?</p>
        <p className="text-sm text-neutral-500 mb-8">
          Match to the scale
        </p>

        <div className="mb-12 w-[220px] h-[220px] border-2 border-dashed border-neutral-700 rounded-lg flex items-center justify-center text-neutral-600">
          Value hidden
        </div>

        <ValueScale
          steps={10}
          width={400}
          height={60}
          selectedStep={selectedStep}
          onSelect={handleStepSelect}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">What was the value?</p>
      <p className="text-sm text-neutral-500 mb-8">
        Match to the scale
      </p>

      <div className="mb-12 w-[220px] h-[220px] border-2 border-dashed border-neutral-700 rounded-lg flex items-center justify-center text-neutral-600">
        Value hidden
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
            True value: <strong>{targetL.current.toFixed(0)}</strong>.
            Your answer: <strong>{((selectedStep ?? 0) / 9 * 100).toFixed(0)}</strong>.
            Error: <strong>{formatDeltaL(Math.abs(targetL.current - (selectedStep ?? 0) / 9 * 100))}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}