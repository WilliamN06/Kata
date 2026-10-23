import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleStage } from '../../stimuli/AngleStage';
import {
  angleDifference,
  readAngleParams,
  referenceDegrees,
  resolveAngle,
} from './params';

export function AngleT3Estimation({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [guess, setGuess] = useState(90);

  const params = readAngleParams(variableParams, stimulusParams);
  const angle = resolveAngle(currentValue);
  const reference = referenceDegrees(
    params.referenceType,
    params.referenceAngle
  );

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    setTimeout(
      () =>
        onAnswer({
          correct: angleDifference(guess, angle) <= params.tolerance,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: guess,
          correctResponse: angle,
        }),
      650
    );
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col bg-black">
      <div className="min-h-0 flex-1">
        <AngleStage
          angle={angle}
          referenceType={params.referenceType}
          referenceAngle={reference}
          showReference
          showAnnotation={answered}
          lineLength={params.lineLength}
          lineThickness={params.lineThickness}
          lineContrast={params.lineContrast}
          lineStyle={params.lineStyle}
        />
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950 p-4">
        <p className="mb-3 text-center text-base">
          Estimate the angle in degrees.
        </p>
        <div className="flex flex-col items-center gap-3">
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={guess}
            onChange={(event) => setGuess(Number(event.target.value))}
            className="w-80"
          />
          <p className="font-mono text-sm text-neutral-300">{guess}°</p>
          <p className="font-mono text-xs text-neutral-600">
            Accepted error: ±{params.tolerance}°
          </p>
          <button
            onClick={handle}
            disabled={answered}
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-500 disabled:bg-neutral-800"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
