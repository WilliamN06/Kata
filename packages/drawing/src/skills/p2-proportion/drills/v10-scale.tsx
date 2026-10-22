import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { DotPair } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import {
  resolveRatioRange,
  readStimulusColor,
  scaledPairLayout,
  resolveOrientation,
} from '../p2-utils';

type Phase = 'judging' | 'feedback';

export function V10ScaleDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const rangeKey = (variableParams?.ratioRange as string) ?? 'moderate';
  const ratioMin = variableParams?.ratioMin as number | undefined;
  const ratioMax = variableParams?.ratioMax as number | undefined;
  const scaleRange = (variableParams?.scaleRange as string) ?? 'diverse';
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';

  const [lo, hi] = useMemo(
    () => resolveRatioRange(rangeKey, ratioMin, ratioMax),
    [rangeKey, ratioMin, ratioMax],
  );
  const b = useMemo(() => lo + Math.floor(Math.random() * (hi - lo + 1)), [lo, hi]);

  const scale = useMemo(() => {
    const pool =
      scaleRange === 'small' ? [0.25, 0.5] :
      scaleRange === 'moderate' ? [0.5, 1] :
      scaleRange === 'large' ? [1, 2] :
      [0.25, 0.5, 1, 2];
    return pool[Math.floor(Math.random() * pool.length)] ?? 1;
  }, [scaleRange]);

  const orientation = useMemo(() => resolveOrientation(variableParams), [variableParams]);

  // Base layout at scale 1, then multiply by the scale factor
  const baseLayout = useMemo(() => scaledPairLayout(b, orientation, 400, 200), [b, orientation]);
  const scaledLayout = useMemo(() => ({
    unitPx: baseLayout.unitPx * scale,
    chipWidth: baseLayout.chipWidth * scale,
    chipHeight: baseLayout.chipHeight * scale,
  }), [baseLayout, scale]);

  const stim = readStimulusColor(variableParams);
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

  const anchorBaseX = orientation === 'horizontal' ? 30 : baseLayout.chipWidth / 2;
  const anchorBaseY = orientation === 'horizontal' ? baseLayout.chipHeight / 2 : 30;
  const anchorScaledX = orientation === 'horizontal' ? 30 : scaledLayout.chipWidth / 2;
  const anchorScaledY = orientation === 'horizontal' ? scaledLayout.chipHeight / 2 : 30;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-2">
        Are these two dot pairs the same ratio, at different scales?
      </p>

      <div className="flex flex-col items-center gap-6 mb-10">
        <DotPair
          width={baseLayout.chipWidth}
          height={baseLayout.chipHeight}
          distance={baseLayout.unitPx * b}
          orientation={orientation}
          anchorX={anchorBaseX}
          anchorY={anchorBaseY}
          showLine={showLine}
          dotColor={stim.bar}
          unitColor="#8A8A8A"
          unitMarkerPx={baseLayout.unitPx}
          backgroundColor={stim.bg}
        />
        <p className="text-xs text-neutral-500">scale 1×</p>
        <div style={{ maxWidth: 900 }}>
          <DotPair
            width={Math.min(900, scaledLayout.chipWidth)}
            height={Math.min(400, scaledLayout.chipHeight)}
            distance={scaledLayout.unitPx * b}
            orientation={orientation}
            anchorX={anchorScaledX}
            anchorY={anchorScaledY}
            showLine={showLine}
            dotColor={stim.bar}
            unitColor="#8A8A8A"
            unitMarkerPx={scaledLayout.unitPx}
            backgroundColor={stim.bg}
          />
        </div>
        <p className="text-xs text-neutral-500">{scale}× scale</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handle(true)}
          className={`px-6 py-3 rounded-lg border ${
            answer === true
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          SAME RATIO
        </button>
        <button
          onClick={() => handle(false)}
          className={`px-6 py-3 rounded-lg border ${
            answer === false
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          DIFFERENT
        </button>
      </div>

      {phase === 'feedback' && answer !== null && (
        <div
          className={`p-6 rounded-lg border max-w-xl text-center ${
            correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            Both ratios are <strong>1 : {b}</strong>. The second was scaled {scale}×.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}