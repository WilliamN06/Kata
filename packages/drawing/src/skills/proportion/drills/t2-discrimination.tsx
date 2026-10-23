import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import {
  formPropsFromParams,
  readProportionParams,
  resolveExtentRatio,
  resolveRatio,
} from './params';

export function T2Discrimination({
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

  const pair = useMemo(() => {
    const isDiff = Math.random() > 0.5;
    const delta = Math.max(0.35, ratio * 0.25);
    const ratioB = isDiff
      ? Math.min(12, ratio + delta) === ratio
        ? Math.max(1.05, ratio - delta)
        : Math.min(12, ratio + delta)
      : ratio;
    return {
      isDiff,
      a: resolveExtentRatio(ratio, p.ratioDirection),
      b: resolveExtentRatio(ratioB, p.ratioDirection),
    };
  }, [ratio, p.ratioDirection]);

  const handle = (saidDiff: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(
      () =>
        onAnswer({
          correct: saidDiff === pair.isDiff,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: saidDiff,
          correctResponse: pair.isDiff,
        }),
      700
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh] bg-black">
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-px bg-neutral-800">
        <ExtentForm {...formProps} ratio={pair.a} />
        <ExtentForm {...formProps} ratio={pair.b} />
      </div>
      <div className="p-4 bg-neutral-950 border-t border-neutral-800">
        <p className="text-base mb-3 text-center">
          Do these two pairs have the same ratio?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handle(false)}
            disabled={answered}
            className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
          >
            SAME
          </button>
          <button
            onClick={() => handle(true)}
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
