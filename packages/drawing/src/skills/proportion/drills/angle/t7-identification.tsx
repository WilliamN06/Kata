import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleStage } from '../../stimuli/AngleStage';
import {
  angleDifference,
  readAngleParams,
  resolveAngle,
} from './params';

export function AngleT7Identification({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const params = readAngleParams(variableParams, stimulusParams);
  const target = resolveAngle(currentValue);

  const options = useMemo(() => {
    const angles = [
      target,
      resolveAngle(target - 25),
      resolveAngle(target + 35),
      resolveAngle(target + 70),
    ];
    return angles.sort(() => Math.random() - 0.5);
  }, [target]);

  const handle = (choice: number) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(
      () =>
        onAnswer({
          correct: angleDifference(choice, target) < 0.01,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: choice,
          correctResponse: target,
        }),
      650
    );
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col p-4">
      <p className="mb-3 text-center text-base">
        Which angle is closest to{' '}
        <span className="font-mono font-semibold text-neutral-100">
          {Math.round(target)}°
        </span>
        ?
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handle(option)}
            disabled={answered}
            className="min-h-0 overflow-hidden rounded-xl border border-neutral-800 hover:border-blue-500 disabled:opacity-70"
          >
            <AngleStage
              angle={option}
              referenceType="vertical"
              showReference
              lineLength={Math.min(72, params.lineLength + 10)}
              lineThickness={params.lineThickness}
              lineContrast={params.lineContrast}
              lineStyle={params.lineStyle}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
