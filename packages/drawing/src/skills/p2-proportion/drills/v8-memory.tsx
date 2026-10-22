import { useEffect, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import { resolveRatio, ratioWithinTolerance } from '../p2-utils';

type Phase = 'memorize' | 'delay' | 'recall' | 'feedback';

const DELAYS: Record<string, number> = { short: 2000, moderate: 5000, long: 10000 };

/** Memory decay: memorize a ratio, hold it through a delay, then reconstruct it. */
export function V8MemoryDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('memorize');
  const [recalled, setRecalled] = useState<number | null>(null);

  const memorizeMs = (Number(settings?.memorizeDuration) || 3) * 1000;
  const delayMs = DELAYS[(settings?.delayRange as string) ?? 'moderate'] ?? 5000;
  const ratioRange = (settings?.ratioRange as string) ?? 'moderate';
  const trueB = useRef(resolveRatio(ratioRange));
  const b = trueB.current;

  useEffect(() => {
    if (phase !== 'memorize') return;
    const t = setTimeout(() => setPhase('delay'), memorizeMs);
    return () => clearTimeout(t);
  }, [phase, memorizeMs]);

  useEffect(() => {
    if (phase !== 'delay') return;
    const t = setTimeout(() => setPhase('recall'), delayMs);
    return () => clearTimeout(t);
  }, [phase, delayMs]);

  const correct = recalled !== null && ratioWithinTolerance(recalled, b, 1);

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('memorize');
    setRecalled(null);
    trueB.current = resolveRatio(ratioRange);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      {phase === 'memorize' && (
        <div className="text-center">
          <p className="text-lg text-neutral-200 mb-6">Memorize this ratio (A : B)</p>
          <div className="flex items-center gap-8 justify-center text-5xl font-mono text-neutral-100">
            <span>1</span>
            <span className="text-neutral-500">:</span>
            <span>{b}</span>
          </div>
        </div>
      )}

      {phase === 'delay' && (
        <p className="text-xl text-neutral-400">Recall the ratio after the delay…</p>
      )}

      {phase === 'recall' && (
        <div className="text-center">
          <p className="text-lg text-neutral-200 mb-6">What was the ratio?</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg">
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setRecalled(n);
                  setPhase('feedback');
                }}
                className="px-4 py-2 rounded-lg border bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700 font-mono"
              >
                1:{n}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'feedback' && recalled !== null && (
        <div className={`p-6 rounded-lg border ${correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            Original ratio: <strong>1:{b}</strong>. You recalled{' '}
            <strong>1:{recalled}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}