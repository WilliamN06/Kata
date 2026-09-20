import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import { RATIO_OPTIONS, resolveRatio, ratioWithinTolerance } from '../p2-utils';

type Phase = 'judging' | 'feedback';

/** Context interference: estimate a target ratio amid distracting ratios. */
export function V9ContextDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const ratioRange = (settings?.ratioRange as string) ?? 'moderate';
  const contextType = (settings?.contextType as string) ?? 'similar';
  const contextDensity = (settings?.contextDensity as string) ?? 'moderate';

  const trueB = useMemo(() => resolveRatio(ratioRange), [ratioRange]);

  const distractorCount = contextDensity === 'sparse' ? 2 : contextDensity === 'dense' ? 6 : 4;
  const distractors = useMemo(() => {
    const base = trueB;
    return Array.from({ length: distractorCount }, () => {
      if (contextType === 'conflicting') return base === 1 ? 10 : Math.max(1, base - 1);
      if (contextType === 'noisy') return 1 + Math.floor(Math.random() * 10);
      return base === 10 ? 8 : Math.min(10, base + 1); // similar
    });
  }, [trueB, distractorCount, contextType]);

  const tolerance = 0.5;
  const correct = picked !== null && ratioWithinTolerance(picked, trueB, tolerance);

  const handlePick = (n: number) => {
    if (phase === 'feedback') return;
    setPicked(n);
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setPicked(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-1">Estimate the ratio in the center</p>
      <p className="text-sm text-neutral-500 mb-6">
        Ignore the surrounding ratios — they may be misleading.
      </p>

      <div className="relative mb-8" style={{ width: 420, height: 260 }}>
        {/* Target in center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-mono text-2xl text-neutral-100">
          1:{trueB}
        </div>
        {/* Distractors around */}
        {distractors.map((d, i) => {
          const angle = (i / distractors.length) * Math.PI * 2;
          const x = 210 + Math.cos(angle) * 90;
          const y = 130 + Math.sin(angle) * 80;
          return (
            <div
              key={i}
              className="absolute text-sm font-mono text-neutral-500"
              style={{ left: x - 12, top: y - 10 }}
            >
              1:{d}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {RATIO_OPTIONS.map((opt) => {
          const n = parseInt(opt.split(':')[1] ?? '0', 10);
          return (
            <button
              key={opt}
              onClick={() => handlePick(n)}
              className={`px-4 py-2 rounded-lg border text-sm font-mono transition-colors ${
                phase === 'feedback' && picked === n
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
            Target was <strong>1:{trueB}</strong>. Surrounding ratios distorted
            your judgment.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}