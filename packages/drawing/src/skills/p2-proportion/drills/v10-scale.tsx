import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import { resolveRatio } from '../p2-utils';

type Phase = 'judging' | 'feedback';

/** Scale invariance: judge whether two ratios shown at different scales match. */
export function V10ScaleDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const ratioRange = (settings?.ratioRange as string) ?? 'moderate';
  const scaleRange = (settings?.scaleRange as string) ?? 'diverse';
  const b = useMemo(() => resolveRatio(ratioRange), [ratioRange]);

  // Scale factor for the second chip; ratios are scale-invariant so truth is "same".
  const scale = useMemo(() => {
    switch (scaleRange) {
      case 'small':
        return 0.25;
      case 'large':
        return 1;
      case 'diverse':
        return Math.random() < 0.5 ? 0.5 : 2;
      default:
        return 0.5;
    }
  }, [scaleRange]);

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
        Are these two ratios the same, at different scales?
      </p>

      <div className="flex items-end gap-8 mb-8">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-end gap-2" style={{ height: 140 }}>
            <div className="w-4 bg-neutral-200" style={{ height: 60 }} />
            <div className="w-4 bg-neutral-500" style={{ height: 140 }} />
          </div>
          <span className="text-xs text-neutral-500">scale 1</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-end gap-2" style={{ height: 140 * scale }}>
            <div className="w-4 bg-neutral-200" style={{ height: 60 * scale }} />
            <div className="w-4 bg-neutral-500" style={{ height: 140 * scale }} />
          </div>
          <span className="text-xs text-neutral-500">{scale}x</span>
        </div>
      </div>

      <div className="text-sm text-neutral-500 mb-6">
        Both are <strong>1:{b}</strong>.
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handle(true)}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg"
        >
          SAME
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
            Both ratios are <strong>1:{b}</strong>. The second was {scale}x larger.
            Ratios are scale-invariant.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}