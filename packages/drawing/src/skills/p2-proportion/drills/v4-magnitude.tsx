import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { RatioChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { RATIO_OPTIONS, ratioWithinTolerance } from '../p2-utils';

type Phase = 'judging' | 'feedback';

const EXTREME_RATIOS = [6, 8, 10];

/** Magnitude effect: extreme ratios are typically underestimated. */
export function V4MagnitudeDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const trueB = useMemo(
    () => EXTREME_RATIOS[Math.floor(Math.random() * EXTREME_RATIOS.length)]!,
    []
  );
  const tolerance = 1;
  const correct = picked !== null && ratioWithinTolerance(picked, trueB, tolerance);

  const handlePick = (b: number) => {
    if (phase === 'feedback') return;
    setPicked(b);
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setPicked(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-1">Estimate this extreme ratio</p>
      <p className="text-sm text-neutral-500 mb-8">
        The ratio is 1 : ? (the small bar is the unit).
      </p>

      <div className="mb-8 rounded-lg overflow-hidden border border-neutral-700">
        <RatioChip width={340} height={140} ratioA={1} ratioB={trueB} />
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {RATIO_OPTIONS.map((opt) => {
          const b = parseInt(opt.split(':')[1] ?? '0', 10);
          const active = phase === 'feedback' && picked === b;
          return (
            <button
              key={opt}
              onClick={() => handlePick(b)}
              className={`px-4 py-2 rounded-lg border text-sm font-mono transition-colors ${
                active
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {phase === 'feedback' && picked !== null && (
        <div className={`mt-8 p-6 rounded-lg border ${correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            True ratio: <strong>1:{trueB}</strong>. Extreme ratios are commonly
            underestimated.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}