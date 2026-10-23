import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleStage } from '../../stimuli/AngleStage';
import { readAngleParams } from './params';

export function AngleT2Discrimination({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const params = readAngleParams(variableParams, stimulusParams);

  const trial = useMemo(() => {
    const isSame = Math.random() > 0.5;
    const base = 30 + Math.random() * 100;
    const stairScale = Math.max(0.1, Math.min(2, Math.abs(currentValue) / 45));
    const offset = Math.max(
      1,
      Math.min(25, params.comparisonOffset * stairScale)
    );
    const direction = Math.random() > 0.5 ? 1 : -1;
    const second = isSame
      ? base
      : Math.max(5, Math.min(175, base + direction * offset));
    return { isSame, base, second };
  }, [currentValue, params.comparisonOffset]);

  const handle = (saidSame: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(
      () =>
        onAnswer({
          correct: saidSame === trial.isSame,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: saidSame,
          correctResponse: trial.isSame,
        }),
      650
    );
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        <AngleStage
          angle={trial.base}
          referenceType="none"
          showReference={false}
          showAnnotation={answered}
          lineLength={params.lineLength}
          lineThickness={params.lineThickness}
          lineContrast={params.lineContrast}
          lineStyle={params.lineStyle}
        />
        <AngleStage
          angle={trial.second}
          referenceType="none"
          showReference={false}
          showAnnotation={answered}
          lineLength={params.lineLength}
          lineThickness={params.lineThickness}
          lineContrast={params.lineContrast}
          lineStyle={params.lineStyle}
        />
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950 p-4">
        <p className="mb-3 text-center text-base">
          Do these two angles match?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handle(true)}
            disabled={answered}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-8 py-3 font-semibold hover:bg-neutral-700 disabled:opacity-50"
          >
            SAME
          </button>
          <button
            onClick={() => handle(false)}
            disabled={answered}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-8 py-3 font-semibold hover:bg-neutral-700 disabled:opacity-50"
          >
            DIFFERENT
          </button>
        </div>
      </div>
    </div>
  );
}
