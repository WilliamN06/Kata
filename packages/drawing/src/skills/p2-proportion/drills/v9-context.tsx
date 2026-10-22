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

export function V9ContextDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [guess, setGuess] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const rangeKey = (variableParams?.ratioRange as string) ?? 'moderate';
  const ratioMin = variableParams?.ratioMin as number | undefined;
  const ratioMax = variableParams?.ratioMax as number | undefined;
  const contextType = (variableParams?.contextType as string) ?? 'similar';
  const contextDensity = (variableParams?.contextDensity as number) ?? 5;
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

  const orientation = useMemo(() => resolveOrientation(variableParams), [variableParams]);
  const layout = useMemo(() => scaledPairLayout(trueB, orientation, 400), [trueB, orientation]);
  const stim = readStimulusColor(variableParams);

  const distractors = useMemo(() => {
    return Array.from({ length: contextDensity }, (_, i) => {
      if (contextType === 'conflicting') return Math.max(1, 11 - trueB);
      if (contextType === 'noisy') return 1 + Math.floor(Math.random() * 10);
      return Math.max(1, Math.min(12, trueB + (i % 2 === 0 ? 1 : -1)));
    });
  }, [trueB, contextDensity, contextType]);

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
      <p className="text-lg text-neutral-200 mb-1">Estimate the central pair's ratio</p>
      <p className="text-sm text-neutral-500 mb-6">
        Ignore the surrounding pairs — they may be misleading.
      </p>

      <div className="relative mb-8" style={{ width: 620, height: 420 }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
            dotSize={10}
          />
        </div>
        {distractors.map((d, i) => {
          const angle = (i / distractors.length) * Math.PI * 2;
          const x = 310 + Math.cos(angle) * 220;
          const y = 210 + Math.sin(angle) * 150;
          const smallLayout = scaledPairLayout(d, orientation, 140, 100);
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: x - 60, top: y - 30, opacity: 0.45 }}
            >
              <DotPair
                width={smallLayout.chipWidth}
                height={smallLayout.chipHeight}
                distance={smallLayout.unitPx * d}
                orientation={orientation}
                anchorX={orientation === 'horizontal' ? 20 : smallLayout.chipWidth / 2}
                anchorY={orientation === 'horizontal' ? smallLayout.chipHeight / 2 : 20}
                showLine={showLine}
                dotColor={stim.bar}
                unitColor="#8A8A8A"
                unitMarkerPx={smallLayout.unitPx}
                backgroundColor={stim.bg}
                dotSize={6}
              />
            </div>
          );
        })}
      </div>

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
            Target was <strong>1 : {trueB}</strong>. You said <strong>1 : {guess}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}