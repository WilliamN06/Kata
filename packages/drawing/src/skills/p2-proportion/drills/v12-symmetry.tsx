import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';

type Phase = 'judging' | 'feedback';

/**
 * Symmetry ratio detection: judge whether a shape is symmetric or asymmetric.
 * Asymmetry is shown by shifting a point along the chosen axis.
 * Uses dots and connecting lines rather than filled shapes.
 */
export function V12SymmetryDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const asymmetric = useMemo(() => Math.random() > 0.4, []);
  const axis = (settings?.axis as string) ?? 'vertical';
  const asymmetryRange = (settings?.asymmetryRange as string) ?? 'moderate';
  const offsetPx = asymmetryRange === 'subtle' ? 3 : asymmetryRange === 'obvious' ? 12 : 6;

  const truth = !asymmetric; // symmetric === true means it IS symmetric
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
      <p className="text-lg text-neutral-200 mb-2">Is this shape symmetric?</p>

      <svg
        viewBox="0 0 200 160"
        className="mb-8"
        width="240"
        height="192"
        role="img"
        aria-label={asymmetric ? 'Asymmetric shape' : 'Symmetric shape'}
        data-testid="symmetry-shape"
      >
        {/* Left pivot dot */}
        <circle cx="100" cy="10" r="4" fill="#E0E0E0" />
        {/* Right pivot dot (may shift) */}
        <circle cx={100 + (asymmetric ? offsetPx : 0)} cy={10} r="4" fill="#B0B0B0" />
        {/* Bottom-left dot */}
        <circle cx="50" cy="150" r="4" fill="#E0E0E0" />
        {/* Bottom-right dot (may shift) */}
        <circle cx={50 + (asymmetric ? offsetPx : 0)} cy={150} r="4" fill="#B0B0B0" />
        {/* Connecting line (top) */}
        <line x1="100" y1="10" x2={100 + (asymmetric ? offsetPx : 0)} y2={10} stroke="#4A9EFF" strokeWidth="2" />
        {/* Connecting line (bottom) */}
        <line x1="50" y1="150" x2={50 + (asymmetric ? offsetPx : 0)} y2={150} stroke="#4A9EFF" strokeWidth="2" />
        {/* Axis line with dash */}
        <line x1="100" y1="0" x2="100" y2="160" stroke="#4A9EFF" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      <p className="text-xs text-neutral-500 mb-6">
        {asymmetric
          ? `Right side shifted ${offsetPx}px along the ${axis} axis.`
          : 'Dots aligned — perfectly symmetric.'}
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handle(true)}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg"
        >
          SYMMETRIC
        </button>
        <button
          onClick={() => handle(false)}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg"
        >
          ASYMMETRIC
        </button>
      </div>

      {phase === 'feedback' && answer !== null && (
        <div className={`p-6 rounded-lg border ${correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The shape was {asymmetric ? `asymmetric by ${offsetPx}px` : 'symmetric'} along the{' '}
            {axis} axis.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}