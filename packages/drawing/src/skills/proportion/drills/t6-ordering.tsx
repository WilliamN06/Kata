import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import {
  formPropsFromParams,
  formRatio,
  readProportionParams,
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
    const span = Math.max(0.1, p.upperBound - p.lowerBound);
    const ratios = [0.12, 0.36, 0.62, 0.9]
      .map((fraction) =>
        Number((p.lowerBound + span * fraction).toFixed(2))
      )
      .sort(() => Math.random() - 0.5);
    const direction =
      p.ratioDirection === 'both'
        ? Math.random() < 0.5
          ? 'a-to-b'
          : 'b-to-a'
        : p.ratioDirection;
    const oriented = { ...p, ratioDirection: direction };
    return ratios.map((ratio) => ({
      ratio,
      extentRatio: formRatio(ratio, oriented),
    }));
  }, [
    p.markType,
    p.ratioDirection,
    p.lowerBound,
    p.upperBound,
  ]);

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
    <div className="flex h-full min-h-[70vh] flex-col p-4">
      <p className="mb-3 text-center text-base">
        Tap the pairs from smallest ratio to largest.
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
        {stimuli.map((stimulus) => {
          const position = order.indexOf(stimulus.ratio);
          return (
            <button
              key={stimulus.ratio}
              onClick={() => setOrder([...order, stimulus.ratio])}
              disabled={position >= 0 || answered}
              className="relative min-h-0 overflow-hidden rounded-xl border border-neutral-800 bg-transparent disabled:opacity-70"
            >
              <ExtentForm
                {...formProps}
                ratio={stimulus.extentRatio}
              />
              {position >= 0 && (
                <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
          className="rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-500 disabled:bg-neutral-800"
        >
          SUBMIT ORDER
        </button>
      </div>
    </div>
  );
}
