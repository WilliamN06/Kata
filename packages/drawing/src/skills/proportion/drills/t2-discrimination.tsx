import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import {
  formPropsFromParams,
  formRatio,
  ratioForParams,
  readProportionParams,
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
  const ratio = ratioForParams(currentValue, p);

  const pair = useMemo(() => {
    const canDiffer = p.upperBound > p.lowerBound;
    const isDiff = canDiffer && Math.random() > 0.5;
    const delta = Math.max(0.35, ratio * 0.25);
    const upper = p.upperBound;
    const lower = p.lowerBound;
    const higher = Math.min(upper, ratio + delta);
    const ratioB = isDiff
      ? higher === ratio
        ? Math.max(lower, ratio - delta)
        : higher
      : ratio;
    const direction =
      p.ratioDirection === 'both'
        ? Math.random() < 0.5
          ? 'a-to-b'
          : 'b-to-a'
        : p.ratioDirection;
    const oriented = { ...p, ratioDirection: direction };
    return {
      isDiff,
      a: formRatio(ratio, oriented),
      b: formRatio(ratioB, oriented),
    };
  }, [ratio, p.markType, p.ratioDirection, p.lowerBound, p.upperBound]);

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
    <div className="flex h-full min-h-[70vh] flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        <div className="relative min-h-0">
          <ExtentForm {...formProps} ratio={pair.a} />
        </div>
        <div className="relative min-h-0">
          <ExtentForm {...formProps} ratio={pair.b} />
        </div>
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
