import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import {
  formPropsFromParams,
  readProportionParams,
  resolveExtentRatio,
  resolveRatio,
} from './params';

export function T3Estimation({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [guess, setGuess] = useState(2);

  const p = readProportionParams(variableParams, stimulusParams);
  const formProps = formPropsFromParams(p);
  const ratio = resolveRatio(currentValue);
  const extentRatio = useMemo(
    () => resolveExtentRatio(ratio, p.ratioDirection),
    [ratio, p.ratioDirection]
  );

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(guess - ratio) / ratio <= p.tolerance;
    setTimeout(
      () =>
        onAnswer({
          correct,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: guess,
          correctResponse: ratio,
        }),
      700
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh] bg-black">
      <div className="flex-1 min-h-0 relative">
        <ExtentForm {...formProps} ratio={extentRatio} />
      </div>
      <div className="p-4 bg-neutral-950 border-t border-neutral-800">
        <p className="text-base mb-3 text-center">
          Estimate the longer-to-shorter ratio
        </p>
        <div className="flex flex-col items-center gap-3">
          <input
            type="range"
            min={1}
            max={12}
            step={0.05}
            value={guess}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="w-80"
          />
          <p className="text-sm text-neutral-400 font-mono">
            {guess.toFixed(2)} : 1
          </p>
          <p className="text-xs text-neutral-600 font-mono">
            Tolerance: ±{(p.tolerance * 100).toFixed(0)}%
          </p>
          <button
            onClick={handle}
            disabled={answered}
            className="mt-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
