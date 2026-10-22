import { useEffect, useMemo, useRef, useState } from 'react';
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

type Phase = 'memorize' | 'delay' | 'recall' | 'feedback';

export function V8MemoryDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('memorize');
  const [guess, setGuess] = useState<number | null>(null);

  const memorizeMs = ((variableParams?.memorizeDuration as number) ?? 3) * 1000;
  const delayMin = (variableParams?.delayMinMs as number) ?? 2000;
  const delayMax = (variableParams?.delayMaxMs as number) ?? 8000;
  const rangeKey = (variableParams?.ratioRange as string) ?? 'moderate';
  const ratioMin = variableParams?.ratioMin as number | undefined;
  const ratioMax = variableParams?.ratioMax as number | undefined;
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';
  const tolerance = readTaskTolerance(variableParams, 1);

  const [lo, hi] = useMemo(
    () => resolveRatioRange(rangeKey, ratioMin, ratioMax),
    [rangeKey, ratioMin, ratioMax],
  );
  const trueB = useMemo(
    () => lo + Math.floor(Math.random() * (hi - lo + 1)),
    [lo, hi],
  );
  const delayMs = useMemo(
    () => delayMin + Math.random() * Math.max(0, delayMax - delayMin),
    [delayMin, delayMax],
  );

  const orientation = useMemo(() => resolveOrientation(variableParams), [variableParams]);
  const layout = useMemo(() => scaledPairLayout(trueB, orientation), [trueB, orientation]);
  const stim = readStimulusColor(variableParams);

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

  const correct = guess !== null && Math.abs(guess - trueB) <= tolerance;

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('memorize');
    setGuess(null);
  };

  const anchorX = orientation === 'horizontal' ? 40 : layout.chipWidth / 2;
  const anchorY = orientation === 'horizontal' ? layout.chipHeight / 2 : 40;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      {phase === 'memorize' && (
        <div className="text-center">
          <p className="text-lg text-neutral-200 mb-2">Memorize this pair</p>
          <p className="text-sm text-neutral-500 mb-8">
            The dim dot marks 1 unit. The bright dot marks N units.
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
        </div>
      )}

      {phase === 'delay' && (
        <p className="text-xl text-neutral-400 mt-20">
          Recall the pair after the delay…
        </p>
      )}

      {phase === 'recall' && (
        <div className="flex flex-col items-center">
          <p className="text-lg text-neutral-200 mb-10">What was the ratio 1 : N?</p>
          <div className="flex items-center gap-3">
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
            Original ratio: <strong>1 : {trueB}</strong>. You recalled{' '}
            <strong>1 : {guess}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}