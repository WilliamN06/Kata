import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import {
  formPropsFromParams,
  readProportionParams,
  resolveExtentRatio,
} from './params';

export function T6Ordering({
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [order, setOrder] = useState<number[]>([]);

  const p = readProportionParams(variableParams, stimulusParams);
  const formProps = formPropsFromParams(p);

  const stimuli = useMemo(() => {
    const ratios = [1.4, 2.1, 3.2, 5.5].sort(() => Math.random() - 0.5);
    return ratios.map((ratio) => ({
      ratio,
      extentRatio: resolveExtentRatio(ratio, p.ratioDirection),
    }));
  }, [p.ratioDirection]);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const sorted = [...stimuli.map((s) => s.ratio)].sort((a, b) => a - b);
    const correct = order.every((value, index) => value === sorted[index]);
    setTimeout(
      () =>
        onAnswer({
          correct,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: order,
          correctResponse: sorted,
        }),
      700
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh] bg-black p-4">
      <p className="text-base mb-3 text-center">
        Tap the pairs from smallest ratio to largest.
      </p>
      <div className="flex-1 grid grid-cols-2 gap-2">
        {stimuli.map((stimulus) => {
          const position = order.indexOf(stimulus.ratio);
          return (
            <button
              key={stimulus.ratio}
              onClick={() => setOrder([...order, stimulus.ratio])}
              disabled={position >= 0 || answered}
              className="relative min-h-36 overflow-hidden rounded-xl border border-neutral-800 disabled:opacity-70"
            >
              <ExtentForm
                {...formProps}
                baseLength={55}
                ratio={stimulus.extentRatio}
              />
              {position >= 0 && (
                <span className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
          disabled={order.length !== stimuli.length || answered}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold"
        >
          SUBMIT ORDER
        </button>
      </div>
    </div>
  );
}
