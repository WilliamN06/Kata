import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleStage } from '../../stimuli/AngleStage';
import { classifyAngle, readAngleParams, resolveAngle } from './params';

const CATEGORIES = ['acute', 'right', 'obtuse', 'reflex'] as const;

export function AngleT1Categorisation({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const params = readAngleParams(variableParams, stimulusParams);
  const angle = resolveAngle(currentValue);
  const correct = classifyAngle(angle);

  const handle = (choice: (typeof CATEGORIES)[number]) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(
      () =>
        onAnswer({
          correct: choice === correct,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: choice,
          correctResponse: correct,
        }),
      650
    );
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col bg-black">
      <div className="min-h-0 flex-1">
        <AngleStage
          angle={angle}
          referenceType="vertical"
          showReference
          showAnnotation={answered}
          lineLength={params.lineLength}
          lineThickness={params.lineThickness}
          lineContrast={params.lineContrast}
          lineStyle={params.lineStyle}
        />
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950 p-4">
        <p className="mb-3 text-center text-base">Classify this angle.</p>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handle(category)}
              disabled={answered}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-semibold uppercase hover:bg-neutral-700 disabled:opacity-50"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
