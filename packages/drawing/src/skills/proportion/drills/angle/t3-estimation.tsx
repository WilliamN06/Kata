import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleStage } from '../../stimuli/AngleStage';
import { angleDifference, readAngleParams, referenceDegrees, resolveAngle } from './params';

export function AngleT3Estimation({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [guess, setGuess] = useState('90');

  const params = readAngleParams(variableParams, stimulusParams);
  const angle = resolveAngle(currentValue);
  const reference = referenceDegrees(params.referenceType, params.referenceAngle);
  const numericGuess = guess.trim() === '' ? null : Number(guess);
  const validGuess =
    numericGuess !== null &&
    Number.isFinite(numericGuess) &&
    numericGuess >= 0 &&
    numericGuess <= 360;
  const showInvalid = guess.trim() !== '' && !validGuess;

  const handle = () => {
    if (answered || numericGuess === null || !validGuess) return;
    setAnswered(true);
    setTimeout(
      () =>
        onAnswer({
          correct: angleDifference(numericGuess, angle) <= params.tolerance,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: numericGuess,
          correctResponse: angle,
        }),
      650
    );
  };

  return (
    <div className="flex h-full flex-col" style={{ minHeight: '70vh' }}>
      <div className="relative min-h-0 flex-1" style={{ minHeight: 220 }}>
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
      <div className="shrink-0 border-t border-neutral-800 bg-neutral-950 p-4">
        <p className="mb-3 text-center text-base">Estimate the angle in degrees.</p>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={360}
              step={1}
              autoComplete="off"
              aria-label="Angle estimate in degrees"
              placeholder="45"
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              className="w-28 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center font-mono text-lg"
            />
            <span className="font-mono text-xl text-neutral-500">°</span>
          </div>
          {showInvalid && (
            <p className="font-mono text-xs text-red-400">Enter an angle from 0 to 360.</p>
          )}
          <p className="font-mono text-xs text-neutral-600">Accepted error: ±{params.tolerance}°</p>
          <button
            onClick={handle}
            disabled={answered || !validGuess}
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-500 disabled:bg-neutral-800"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
