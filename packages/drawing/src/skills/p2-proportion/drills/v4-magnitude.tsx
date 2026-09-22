import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { DotPair } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import {
  resolveRatioRange,
  readStimulusColor,
  readTaskTolerance,
  scaledPairLayout,
  resolveOrientation,
} from '../p2-utils';

type Phase = 'judging' | 'feedback';

export function V4MagnitudeDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [guess, setGuess] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const rangeKey = (variableParams?.ratioRange as string) ?? 'extreme';
  const ratioMin = variableParams?.ratioMin as number | undefined;
  const ratioMax = variableParams?.ratioMax as number | undefined;
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';
  const tolerance = readTaskTolerance(variableParams, 1);

  const [lo, hi] = useMemo(
    () => resolveRatioRange(rangeKey, ratioMin, ratioMax),
    [rangeKey, ratioMin, ratioMax],
  );
  const trueB = useMemo(() => {
    const start = Math.max(lo, 4);
    const end = Math.max(start, Math.min(hi, 20));
    return start + Math.floor(Math.random() * (end - start + 1));
  }, [lo, hi]);

  const orientation = useMemo(() => resolveOrientation(variableParams), [variableParams]);
  const layout = useMemo(() => scaledPairLayout(trueB, orientation), [trueB, orientation]);
  const stim = readStimulusColor(variableParams);

  const correct = guess !== null && Math.abs(guess - trueB) <= tolerance;

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setGuess(null);
  };

  const anchorX = orientation === 'horizontal' ? 40 : layout.chipWidth / 2;
  const anchorY = orientation === 'horizontal' ? layout.chipHeight / 2 : 40;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-1">Estimate this extreme ratio</p>
      <p className="text-sm text-neutral-500 mb-2">
        The dim dot marks 1 unit from the anchor. The bright dot marks N units.
      </p>
      <p className="text-sm text-neutral-500 mb-8">
        Extreme ratios are typically underestimated — try to compensate.
      </p>

      <div className="mb-8" style={{ minHeight: layout.chipHeight + 40 }}>
        <DotPair
          width={layout.chipWidth}
          height={layout.chipHeight}
          distance={layout.unitPx * trueB}
          orientation={orientation}
          anchorX={anchorX}
          anchorY={anchorY}
          showLine={showLine}
          dotColor={stim.bar}
          unitColor="#8A8A8A"
          unitMarkerPx={layout.unitPx}
          backgroundColor={stim.bg}
        />
      </div>

      <div className="h-4" aria-hidden />

      <p className="text-sm font-mono text-neutral-400 mb-4">
        {guess !== null ? `your answer — 1 : ${guess}` : 'type a ratio'}
      </p>

      {phase === 'judging' && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-neutral-300 font-mono text-sm">1 :</span>
          <input
            type="number"
            min={1}
            max={20}
            value={guess ?? ''}
            onChange={(e) => setGuess(Number(e.target.value) || null)}
            className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
          />
          <button
            onClick={() => setPhase('feedback')}
            disabled={guess === null}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-semibold"
          >
            SUBMIT
          </button>
        </div>
      )}

      {phase === 'feedback' && guess !== null && (
        <div
          className={`p-6 rounded-lg border max-w-xl text-center ${
            correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            True ratio: <strong>1 : {trueB}</strong>. You said <strong>1 : {guess}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}