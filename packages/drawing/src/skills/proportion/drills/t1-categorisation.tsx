import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import {
  formPropsFromParams,
  readProportionParams,
  resolveExtentRatio,
  resolveRatio,
} from './params';

export function T1Categorisation({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const p = readProportionParams(variableParams, stimulusParams);
  const formProps = formPropsFromParams(p);
  const ratio = resolveRatio(currentValue);
  const extentRatio = useMemo(
    () => resolveExtentRatio(ratio, p.ratioDirection),
    [ratio, p.ratioDirection]
  );

  const categories = [
    '1.00-1.50',
    '1.50-2.50',
    '2.50-4.00',
    '4.00-8.00',
    '8.00+',
  ];
  const correct =
    ratio < 1.5
      ? '1.00-1.50'
      : ratio < 2.5
        ? '1.50-2.50'
        : ratio < 4.0
          ? '2.50-4.00'
          : ratio < 8.0
            ? '4.00-8.00'
            : '8.00+';

  const handle = (c: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: c === correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: c,
      correctResponse: correct,
    }), 700);
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh]">
      <div className="flex-1 relative">
        <ExtentForm {...formProps} ratio={extentRatio} />
      </div>
      <div className="p-4 bg-neutral-950 border-t border-neutral-800">
        <p className="text-base mb-3 text-center">
          What is the longer-to-shorter ratio?
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <button key={c} onClick={() => handle(c)} disabled={answered} className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold text-sm">{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

