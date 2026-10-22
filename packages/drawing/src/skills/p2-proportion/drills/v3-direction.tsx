import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import { resolveRatio } from '../p2-utils';

type Phase = 'judging' | 'feedback';

/**
 * Comparison direction bias: judge whether a pair shown as A:B then B:A are the
 * same ratio (reciprocal orientation). Tests reciprocity consistency.
 */
export function V3DirectionDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const ratioRange = (settings?.ratioRange as string) ?? 'moderate';
  const b = useMemo(() => resolveRatio(ratioRange), [ratioRange]);

  // Always true in this drill: A:B and B:A are the same ratio, different orientation.
  const truth = true;
  const correct = answer === truth;

  const handle = (val: boolean) => {
    if (phase === 'feedback') return;
    setAnswer(val);
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setAnswer(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">
        Are the two pairs the <strong>same ratio</strong>, just reversed?
      </p>
      <p className="text-sm text-neutral-500 mb-6">
        Pair 1 is <strong>1:{b}</strong> (A longer). Pair 2 is <strong>{b}:1</strong> (B longer).
      </p>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => handle(true)}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg"
        >
          SAME RATIO
        </button>
        <button
          onClick={() => handle(false)}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg"
        >
          DIFFERENT
        </button>
      </div>

      {phase === 'feedback' && answer !== null && (
        <div className={`p-6 rounded-lg border ${correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            Both pairs are the same ratio. Pair 1 was <strong>1:{b}</strong>, Pair 2 was{' '}
            <strong>{b}:1</strong> — same ratio, different orientation.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}