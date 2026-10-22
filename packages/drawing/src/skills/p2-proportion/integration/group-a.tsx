import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';

/**
 * Integration Group A (V2 + V4 + V7): draw a figure from reference — count its
 * units, judge its extreme ratio, and estimate its H:W ratio. All must be correct.
 */
type Q = 1 | 2 | 3;

const UNIT_H = 40;
const COUNT = 6;
const TOTAL_H = UNIT_H * COUNT;

export function GroupADrill({ onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [q, setQ] = useState<Q>(1);
  const [answers, setAnswers] = useState<{ units?: number; ratio?: string; hw?: string }>({});
  const [phase, setPhase] = useState<'asking' | 'feedback'>('asking');

  const truthUnits = COUNT;
  const truthRatio = 8; // extreme ratio 1:8
  const truthHW = 4; // H:W ratio 1:4

  const allCorrect =
    answers.units === truthUnits && answers.ratio === String(truthRatio) && answers.hw === String(truthHW);

  const record = (key: keyof typeof answers, value: string | number, next: Q | null) => {
    const a = { ...answers, [key]: value };
    setAnswers(a);
    if (next === null) {
      setPhase('feedback');
    } else {
      setQ(next);
    }
  };

  const handleContinue = () => {
    onAnswer(allCorrect, Date.now() - startTime.current);
    setPhase('asking');
    setQ(1);
    setAnswers({});
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">Analyze this figure from reference</p>

      {/* Figure */}
      <div className="flex items-end gap-6 mb-6">
        <div className="flex flex-col items-center">
          <div className="w-8 bg-neutral-500 border border-neutral-400" style={{ height: UNIT_H }} />
          <span className="text-xs text-neutral-500 mt-1">1 unit</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 bg-neutral-200 border border-neutral-400" style={{ height: TOTAL_H }} />
          <span className="text-xs text-neutral-500 mt-1">figure</span>
        </div>
      </div>

      {phase === 'asking' && q === 1 && (
        <div className="text-center">
          <p className="mb-4">Q1 — How many units tall is the figure?</p>
          <div className="flex gap-2 flex-wrap justify-center max-w-md">
            {[3, 4, 5, 6, 7, 8].map((n) => (
              <button key={n} onClick={() => record('units', n, 2)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-mono">
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'asking' && q === 2 && (
        <div className="text-center">
          <p className="mb-4">Q2 — What is the extreme ratio of the narrow column to the figure?</p>
          <div className="flex gap-2 flex-wrap justify-center max-w-md">
            {['2', '4', '6', '8', '10'].map((n) => (
              <button key={n} onClick={() => record('ratio', n, 3)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-mono">
                1:{n}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'asking' && q === 3 && (
        <div className="text-center">
          <p className="mb-4">Q3 — What is the H:W ratio of the figure?</p>
          <div className="flex gap-2 flex-wrap justify-center max-w-md">
            {['2', '3', '4', '5'].map((n) => (
              <button key={n} onClick={() => record('hw', n, null)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-mono">
                1:{n}
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
            Units: <strong>{truthUnits}</strong> · Ratio: <strong>1:{truthRatio}</strong> · H:W:{' '}
            <strong>1:{truthHW}</strong>
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}