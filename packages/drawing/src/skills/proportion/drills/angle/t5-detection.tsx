import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleStage } from '../../stimuli/AngleStage';
import { readAngleParams, referenceDegrees } from './params';

export function AngleT5Detection({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const params = readAngleParams(variableParams, stimulusParams);
  const reference = referenceDegrees(
    params.referenceType,
    params.referenceAngle
  );

  const trial = useMemo(() => {
    const aligned = Math.random() > 0.5;
    const stairScale = Math.max(0.1, Math.min(2, Math.abs(currentValue) / 45));
    const offset = Math.max(
      0.75,
      Math.min(20, params.comparisonOffset * stairScale)
    );
    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = aligned ? 0 : direction * offset;
    return { aligned, angle };
  }, [currentValue, params.comparisonOffset]);

  const handle = (saidAligned: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(
      () =>
        onAnswer({
          correct: saidAligned === (Math.abs(trial.angle) < 0.5),
          responseTimeMs: Date.now() - startTime.current,
          userResponse: saidAligned,
          correctResponse: trial.aligned,
        }),
      650
    );
  };

  const referenceLabel =
    params.referenceType === 'horizontal'
      ? 'horizontal'
      : params.referenceType === 'vertical'
        ? 'vertical'
        : 'the reference';

  return (
    <div className="flex h-full min-h-[70vh] flex-col">
      <div className="min-h-0 flex-1">
        <AngleStage
          angle={trial.angle}
          referenceType={params.referenceType}
          referenceAngle={reference}
          showReference={answered}
          showAnnotation={answered}
          lineLength={params.lineLength}
          lineThickness={params.lineThickness}
          lineContrast={params.lineContrast}
          lineStyle={params.lineStyle}
        />
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950 p-4">
        <p className="mb-3 text-center text-base">
          Is this line perfectly {referenceLabel}?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handle(true)}
            disabled={answered}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-8 py-3 font-semibold hover:bg-neutral-700 disabled:opacity-50"
          >
            ALIGNED
          </button>
          <button
            onClick={() => handle(false)}
            disabled={answered}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-8 py-3 font-semibold hover:bg-neutral-700 disabled:opacity-50"
          >
            TILTED
          </button>
        </div>
      </div>
    </div>
  );
}
