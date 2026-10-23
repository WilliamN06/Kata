import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleStage } from '../../stimuli/AngleStage';
import {
  angleDifference,
  readAngleParams,
  resolveAngle,
} from './params';

export function AngleT4Matching({
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
      resolveAngle(target + 14),
      resolveAngle(target - 20),
      resolveAngle(target + 33),
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
    <div className="flex h-full min-h-[70vh] flex-col">
      <div className="grid min-h-0 flex-1 grid-rows-2">
        <AngleStage
          angle={target}
          referenceType="none"
          showReference={false}
          lineLength={params.lineLength}
          lineThickness={params.lineThickness}
          lineContrast={params.lineContrast}
          lineStyle={params.lineStyle}
        />
        <div className="grid grid-cols-4 gap-2 border-t border-neutral-800">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handle(option)}
              disabled={answered}
              className="relative min-h-0 overflow-hidden bg-transparent hover:ring-2 hover:ring-blue-500 disabled:opacity-70"
            >
              <AngleStage
                angle={option}
                referenceType="none"
                showReference={false}
                lineLength={params.lineLength}
                lineThickness={params.lineThickness}
                lineContrast={params.lineContrast}
                lineStyle={params.lineStyle}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950 p-4 text-center">
        <p className="text-base">Which angle matches the target above?</p>
      </div>
    </div>
  );
}
