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

export function T7Identification({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const p = readProportionParams(variableParams, stimulusParams);
  const formProps = formPropsFromParams(p);
  const ratio = ratioForParams(currentValue, p);
  const extentRatio = useMemo(
    () => formRatio(ratio, p),
    [ratio, p.markType, p.ratioDirection]
  );

  const options = useMemo(
    () =>
      ratioOptions(
        ratio,
        4,
        p.lowerBound,
        p.upperBound
      ),
    [ratio, p.lowerBound, p.upperBound]
  );

  const handle = (choice: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(choice - ratio) < 0.02;
    setTimeout(
      () =>
        onAnswer({
          correct,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: choice,
          correctResponse: ratio,
        }),
      700
    );
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col">
      <div className="relative min-h-0 flex-1">
        <ExtentForm {...formProps} ratio={extentRatio} />
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950 p-4">
        <p className="mb-3 text-center text-base">
          {p.markType === 'two-dots'
            ? 'What is the horizontal-to-vertical ratio at the unseen corner?'
            : 'What is the longer-to-shorter ratio?'}
        </p>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handle(option)}
              disabled={answered}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-5 py-2.5 font-mono text-sm font-semibold hover:bg-neutral-700 disabled:opacity-50"
            >
              {option.toFixed(2)} : 1
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
