import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';

type Phase = 'judging' | 'feedback';

const FRACTIONS: Record<string, number> = {
  '1/4': 0.25,
  '1/3': 1 / 3,
  '1/2': 0.5,
  '2/3': 2 / 3,
  '3/4': 0.75,
};

const FRACTION_KEYS = Object.keys(FRACTIONS);

/** Part-whole: judge what fraction of the whole is shaded. */
export function V6PartWholeDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const truthKey = useMemo(
    () => FRACTION_KEYS[Math.floor(Math.random() * FRACTION_KEYS.length)]!,
    []
  );
  const truth = FRACTIONS[truthKey]!;
  const correct = picked === truthKey;

  const handlePick = (k: string) => {
    if (phase === 'feedback') return;
    setPicked(k);
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setPicked(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">What fraction of the whole is shaded?</p>

      <div
        className="relative rounded-lg overflow-hidden border border-neutral-700 mb-8"
        style={{ width: 260, height: 200 }}
      >
        {/* Whole */}
        <div className="absolute inset-0 bg-neutral-200" />
        {/* Shaded part: a horizontal band of height truth*200 from the top */}
        <div className="absolute left-0 right-0 bg-neutral-600" style={{ height: truth * 200 }} />
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {FRACTION_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => handlePick(k)}
            className={`px-4 py-2 rounded-lg border text-sm font-mono transition-colors ${
              phase === 'feedback' && picked === k
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {phase === 'feedback' && picked !== null && (
        <div className={`mt-8 p-6 rounded-lg border ${correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The shaded part was <strong>{truthKey}</strong> of the whole.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}