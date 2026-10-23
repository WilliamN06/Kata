import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import {
  formPropsFromParams,
  formRatio,
  ratioForParams,
  readProportionParams,
} from './params';

export function T5Detection({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const p = readProportionParams(variableParams, stimulusParams);
  const formProps = formPropsFromParams(p);
  const difference = ratioForParams(currentValue, p, 1.2);
  const canBeEqual = p.lowerBound <= 1;
  const equal = useMemo(
    () => canBeEqual && Math.random() > 0.5,
    [canBeEqual]
  );
  const ratio = equal
    ? 1
    : Math.max(Math.max(1.1, p.lowerBound), difference);
  const extentRatio = useMemo(
    () => formRatio(ratio, p),
    [ratio, p.markType, p.ratioDirection]
  );

  const handle = (saidEqual: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(
      () =>
        onAnswer({
          correct: saidEqual === equal,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: saidEqual,
          correctResponse: equal,
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
            ? 'Are the horizontal and vertical extents equal?'
            : 'Are the two extents equal in length?'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handle(true)}
            disabled={answered}
            className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
          >
            EQUAL
          </button>
          <button
            onClick={() => handle(false)}
            disabled={answered}
            className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
          >
            DIFFERENT
          </button>
        </div>
      </div>
    </div>
  );
}
