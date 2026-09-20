import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';

/**
 * Integration Group B (V6 + V11 + V12): analyze a "face" — the fraction the eye
 * region occupies, the vertical position of the eye, and whether it is symmetric.
 */
type Q = 1 | 2 | 3;

const FACE_H = 220;

export function GroupBDrill({ onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [q, setQ] = useState<Q>(1);
  const [answers, setAnswers] = useState<{ fraction?: string; position?: string; symmetric?: boolean }>({});
  const [phase, setPhase] = useState<'asking' | 'feedback'>('asking');

  const truthFraction = '1/3';
  const truthPosition = '1/3';
  const truthSymmetric = true;

  const allCorrect =
    answers.fraction === truthFraction &&
    answers.position === truthPosition &&
    answers.symmetric === truthSymmetric;

  const record = (key: keyof typeof answers, value: string | boolean, next: Q | null) => {
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
      <p className="text-lg text-neutral-200 mb-6">Analyze this face</p>

      {/* Face (eye region = top 1/3, eye center at 1/3 height, symmetric) */}
      <svg viewBox="0 0 140 220" width="168" height="264" className="mb-6">
        <ellipse cx="70" cy="110" rx="60" ry="110" fill="#E0E0E0" />
        <ellipse cx="70" cy="55" rx="20" ry="10" fill="#808080" />
        <circle cx="45" cy="75" r="8" fill="#404040" />
        <circle cx="95" cy="75" r="8" fill="#404040" />
        <path d="M 55 110 Q 70 125 85 110" stroke="#808080" strokeWidth="3" fill="none" />
      </svg>

      {phase === 'asking' && q === 1 && (
        <div className="text-center">
          <p className="mb-4">Q1 — What fraction of the face is the eye region?</p>
          <div className="flex gap-2 justify-center">
            {['1/2', '1/3', '1/4', '2/3'].map((f) => (
              <button key={f} onClick={() => record('fraction', f, 2)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-mono">
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'asking' && q === 2 && (
        <div className="text-center">
          <p className="mb-4">Q2 — Where is the eye vertically on the face?</p>
          <div className="flex gap-2 justify-center">
            {['1/3', '1/2', '3/4'].map((p) => (
              <button key={p} onClick={() => record('position', p, 3)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-mono">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'asking' && q === 3 && (
        <div className="text-center">
          <p className="mb-4">Q3 — Is the face symmetric?</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => record('symmetric', true, null)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg">
              SYMMETRIC
            </button>
            <button onClick={() => record('symmetric', false, null)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg">
              ASYMMETRIC
            </button>
          </div>
        </div>
      )}

      {phase === 'feedback' && (
        <div className={`p-6 rounded-lg border ${allCorrect ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${allCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {allCorrect ? '✓ ALL CORRECT' : '✗ NOT ALL CORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            Eye region: <strong>{truthFraction}</strong> · Position:{' '}
            <strong>{truthPosition}</strong> · Symmetric: <strong>{String(truthSymmetric)}</strong>
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}