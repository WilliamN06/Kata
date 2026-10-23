import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleStage } from '../../stimuli/AngleStage';
import { readAngleParams } from './params';

export function AngleT6Ordering({
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const params = readAngleParams(variableParams, stimulusParams);

  const angles = useMemo(
    () => [20, 55, 100, 145].sort(() => Math.random() - 0.5),
    []
  );

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const sorted = [...angles].sort((a, b) => a - b);
    setTimeout(
      () =>
        onAnswer({
          correct: order.every((angle, index) => angle === sorted[index]),
          responseTimeMs: Date.now() - startTime.current,
          userResponse: order,
          correctResponse: sorted,
        }),
      650
    );
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col bg-black p-4">
      <p className="mb-3 text-center text-base">
        Tap the angles from smallest to largest.
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        {angles.map((angle) => {
          const position = order.indexOf(angle);
          return (
            <button
              key={angle}
              onClick={() => setOrder([...order, angle])}
              disabled={position >= 0 || answered}
              className="relative min-h-0 overflow-hidden rounded-xl border border-neutral-800 disabled:opacity-70"
            >
              <AngleStage
                angle={angle}
                referenceType="none"
                showReference={false}
                lineLength={Math.min(72, params.lineLength + 10)}
                lineThickness={params.lineThickness}
                lineContrast={params.lineContrast}
                lineStyle={params.lineStyle}
              />
              {position >= 0 && (
                <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {position + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-4 text-center">
        <button
          onClick={handle}
          disabled={order.length !== angles.length || answered}
          className="rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-500 disabled:bg-neutral-800"
        >
          SUBMIT ORDER
        </button>
      </div>
    </div>
  );
}
