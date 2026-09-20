import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import { RATIO_OPTIONS, ratioWithinTolerance } from '../p2-utils';

type Phase = 'judging' | 'feedback';

/** H:W ratios available, as [h, w]. */
const RATIOS: Array<[number, number]> = [
  [1, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [1, 6],
  [1, 8],
  [1, 10],
];

/** Cross-dimension: judge the H:W ratio of a rectangle. */
export function V7CrossDimensionDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const truth = useMemo(() => RATIOS[Math.floor(Math.random() * RATIOS.length)]!, []);
  const [, w] = truth;
  const tolerance = 0.5;
  const correct = picked !== null && ratioWithinTolerance(parseInt(picked.split(':')[1] ?? '0', 10), w, tolerance);

  const handlePick = (label: string) => {
    if (phase === 'feedback') return;
    setPicked(label);
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setPicked(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">What is this rectangle's H : W ratio?</p>

      <div
        className="bg-neutral-200 border border-neutral-600 rounded mb-8"
        style={{ width: 260, height: 260 / w, minHeight: 30 }}
      />

      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {RATIO_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => handlePick(opt)}
            className={`px-4 py-2 rounded-lg border text-sm font-mono transition-colors ${
              phase === 'feedback' && picked === opt
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {phase === 'feedback' && picked !== null && (
        <div className={`mt-8 p-6 rounded-lg border ${correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The rectangle was <strong>1:{w}</strong> (H:W). You said{' '}
            <strong>{picked}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}