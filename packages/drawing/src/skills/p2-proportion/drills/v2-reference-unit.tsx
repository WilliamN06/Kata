import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';

type Phase = 'judging' | 'feedback';

/** Establish a reference unit, then count how many units tall a figure is. */
export function V2ReferenceUnitDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [guess, setGuess] = useState('');
  const [phase, setPhase] = useState<Phase>('judging');

  const unitSize = (settings?.unitSize as string) ?? 'moderate';
  const sizePx = unitSize === 'small' ? 24 : unitSize === 'large' ? 64 : 40;

  const trueCount = useMemo(() => Math.floor(3 + Math.random() * 7), []); // 3–9 units
  const totalPx = trueCount * sizePx;
  const tolerance = 1;

  const parsed = parseInt(guess, 10);
  const valid = Number.isFinite(parsed);
  const correct = valid && Math.abs(parsed - trueCount) <= tolerance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === 'feedback') return;
    if (!valid) return;
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setGuess('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-1">How many units tall is the figure?</p>
      <p className="text-sm text-neutral-500 mb-6">
        One unit is the height of the <strong>reference block</strong> on the left.
      </p>

      <div className="flex items-end gap-6 mb-8">
        {/* Reference unit */}
        <div className="flex flex-col items-center">
          <div
            className="w-8 bg-neutral-500 border border-neutral-400"
            style={{ height: sizePx }}
          />
          <span className="text-xs text-neutral-500 mt-1">1 unit</span>
        </div>
        {/* Figure */}
        <div className="flex flex-col items-center">
          <div className="w-16 bg-neutral-200 border border-neutral-400" style={{ height: totalPx }} />
          <span className="text-xs text-neutral-500 mt-1">figure</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-6">
        <input
          type="number"
          min="0"
          max="20"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={phase === 'feedback'}
          className="w-24 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-center text-2xl font-mono text-neutral-100"
          placeholder="units"
        />
        <button
          type="submit"
          disabled={phase === 'feedback' || !valid}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-semibold"
        >
          SUBMIT
        </button>
      </form>

      {phase === 'feedback' && valid && (
        <div className={`p-6 rounded-lg border ${correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The figure was <strong>{trueCount} units</strong> tall. You said{' '}
            <strong>{parsed}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}