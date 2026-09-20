import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';

/**
 * Integration Group C (V3 + V5 + V9): analyze a multi-part object — is A:B the
 * same as B:A, extract a distance, and judge a ratio despite context.
 */
type Q = 1 | 2 | 3;

export function GroupCDrill({ onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [q, setQ] = useState<Q>(1);
  const [answers, setAnswers] = useState<{ reciprocal?: boolean; far?: boolean; context?: string }>({});
  const [phase, setPhase] = useState<'asking' | 'feedback'>('asking');

  const truthReciprocal = true;
  const truthFar = true;
  const truthContext = '1:3';

  const allCorrect =
    answers.reciprocal === truthReciprocal &&
    answers.far === truthFar &&
    answers.context === truthContext;

  const record = (key: keyof typeof answers, value: boolean | string, next: Q | null) => {
    setAnswers((a) => {
      const nextA = { ...a, [key]: value };
      if (next === null) setPhase('feedback');
      else setQ(next);
      return nextA;
    });
  };

  const handleContinue = () => {
    onAnswer(allCorrect, Date.now() - startTime.current);
    setPhase('asking');
    setQ(1);
    setAnswers({});
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-6">Analyze this object</p>

      {/* Object: two parts + far distance + central ratio */}
      <div className="relative mb-8" style={{ width: 300, height: 120 }}>
        <div className="absolute left-0 top-10 w-10 h-10 bg-neutral-200" />
        <div className="absolute right-0 top-10 w-10 h-10 bg-neutral-300" />
        <div className="absolute left-0 top-0 text-xs text-neutral-500">A (small)</div>
        <div className="absolute right-0 top-0 text-xs text-neutral-500">B (large)</div>
      </div>

      {phase === 'asking' && q === 1 && (
        <div className="text-center">
          <p className="mb-4">Q1 — Is A:B (small:large) the same ratio as B:A (large:small)?</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => record('reciprocal', true, 2)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg">
              SAME RATIO
            </button>
            <button onClick={() => record('reciprocal', false, 2)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg">
              DIFFERENT
            </button>
          </div>
        </div>
      )}

      {phase === 'asking' && q === 2 && (
        <div className="text-center">
          <p className="mb-4">Q2 — Are the two parts far apart (a large distance) or close together?</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => record('far', true, 3)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg">
              FAR APART
            </button>
            <button onClick={() => record('far', false, 3)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg">
              CLOSE
            </button>
          </div>
        </div>
      )}

      {phase === 'asking' && q === 3 && (
        <div className="text-center">
          <p className="mb-4">Q3 — What is the ratio of A to B?</p>
          <div className="flex gap-2 justify-center">
            {['1:2', '1:3', '1:4', '1:5'].map((r) => (
              <button key={r} onClick={() => record('context', r, null)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-mono">
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'feedback' && (
        <div className={`p-6 rounded-lg border ${allCorrect ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${allCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {allCorrect ? '✓ ALL CORRECT' : '✗ NOT ALL CORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            Same ratio: <strong>{String(truthReciprocal)}</strong> · Far:{' '}
            <strong>{String(truthFar)}</strong> · Ratio: <strong>{truthContext}</strong>
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}