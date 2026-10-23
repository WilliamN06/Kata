import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import {
  formPropsFromParams,
  formRatio,
  ratioForParams,
  ratioOptions,
  readProportionParams,
} from './params';

export function T4Matching({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const p = readProportionParams(variableParams, stimulusParams);
  const formProps = formPropsFromParams(p);
  const targetRatio = ratioForParams(currentValue, p);
  const extentRatio = useMemo(
    () => formRatio(targetRatio, p),
    [targetRatio, p.markType, p.ratioDirection]
  );

  const options = useMemo(
    () =>
      ratioOptions(
        targetRatio,
        4,
        p.lowerBound,
        p.upperBound
      ),
    [targetRatio, p.lowerBound, p.upperBound]
  );

  const handle = (choice: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(choice - targetRatio) < 0.02;
    setTimeout(
      () =>
        onAnswer({
          correct,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: choice,
          correctResponse: targetRatio,
        }),
      700
    );
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col">
      <div className="flex-1 min-h-0 relative">
        <ExtentForm {...formProps} ratio={extentRatio} />
      </div>
      <div className="p-4 bg-neutral-950 border-t border-neutral-800">
        <p className="mb-3 text-center text-base">
          {p.markType === 'two-dots'
            ? 'Which horizontal-to-vertical ratio matches the unseen corner?'
            : 'Which ratio matches the target?'}
        </p>
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handle(option)}
              disabled={answered}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold font-mono text-sm"
            >
              {option.toFixed(2)} : 1
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
