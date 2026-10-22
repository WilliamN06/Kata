import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip, ValueScale } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Phase = 'judging' | 'feedback';

export function V11BackgroundDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const targetL = useMemo(() => 40 + Math.random() * 30, []);
  const leftBgL = useMemo(() => 15 + Math.random() * 20, []);
  const rightBgL = useMemo(() => 70 + Math.random() * 20, []);

  const handleLeftSelect = (step: number) => {
    setSelectedLeft(step);
    if (selectedRight !== null) finalize(step, selectedRight);
  };

  const handleRightSelect = (step: number) => {
    setSelectedRight(step);
    if (selectedLeft !== null) finalize(selectedLeft, step);
  };

  const finalize = (leftStep: number, rightStep: number) => {
    const leftL = (leftStep / 9) * 100;
    const rightL = (rightStep / 9) * 100;
    const consistency = Math.abs(leftL - rightL);
    const tolerance = Math.max(5, delta * 1.5);
    const correct = consistency <= tolerance;
    setWasCorrect(correct);
    setPhase('feedback');
  };

  const handleContinue = () => {
    const correct = wasCorrect ?? false;
    const responseTime = Date.now() - startTime.current;
    onAnswer(correct, responseTime);
    setPhase('judging');
  };

  const leftError = selectedLeft !== null ? Math.abs((selectedLeft / 9) * 100 - targetL) : 0;
  const rightError = selectedRight !== null ? Math.abs((selectedRight / 9) * 100 - targetL) : 0;
  const consistency = Math.abs(leftError - rightError);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">Judge the value of each center square</p>
      <p className="text-sm text-neutral-500 mb-8">Judge each square on its own; don't be swayed by the background</p>

      <div className="flex gap-8 mb-12">
        <div>
          <div className="p-8 rounded-lg mb-4" style={{
            background: `rgb(${calibratedLStar(leftBgL)}, ${calibratedLStar(leftBgL)}, ${calibratedLStar(leftBgL)})`,
          }}>
            <div className="rounded-lg overflow-hidden border border-neutral-700">
              <ValueChip lStar={calibratedLStar(targetL)} width={120} height={120} />
            </div>
          </div>
          <ValueScale steps={10} width={220} height={45} selectedStep={selectedLeft} onSelect={handleLeftSelect} />
        </div>

        <div>
          <div className="p-8 rounded-lg mb-4" style={{
            background: `rgb(${calibratedLStar(rightBgL)}, ${calibratedLStar(rightBgL)}, ${calibratedLStar(rightBgL)})`,
          }}>
            <div className="rounded-lg overflow-hidden border border-neutral-700">
              <ValueChip lStar={calibratedLStar(targetL)} width={120} height={120} />
            </div>
          </div>
          <ValueScale steps={10} width={220} height={45} selectedStep={selectedRight} onSelect={handleRightSelect} />
        </div>
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
            True value: <strong>{targetL.toFixed(0)}</strong>.
            Left judgment: <strong>{formatDeltaL(selectedLeft !== null ? Math.abs((selectedLeft / 9) * 100 - targetL) : 0)}</strong> off.
            Right judgment: <strong>{formatDeltaL(selectedRight !== null ? Math.abs((selectedRight / 9) * 100 - targetL) : 0)}</strong> off.
            Consistency: <strong>{formatDeltaL(Math.abs((selectedLeft ?? 0) / 9 * 100 - (selectedRight ?? 0) / 9 * 100))}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}