import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';
import { formPropsFromParams, formRatio, ratioForParams, readProportionParams } from './params';

function parseRatioTerm(value: string): number | null {
  const cleaned = value.trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function T3Estimation({
  currentValue,
  variableParams,
  stimulusParams,
  onAnswer,
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [firstTerm, setFirstTerm] = useState('1');
  const [secondTerm, setSecondTerm] = useState('1');

  const p = readProportionParams(variableParams, stimulusParams);
  const formProps = formPropsFromParams(p);
  const ratio = ratioForParams(currentValue, p);
  const extentRatio = useMemo(() => formRatio(ratio, p), [ratio, p.markType, p.ratioDirection]);
  const numerator = parseRatioTerm(firstTerm);
  const denominator = parseRatioTerm(secondTerm);
  const numericGuess = numerator !== null && denominator !== null ? numerator / denominator : null;
  const validGuess = numericGuess !== null;
  const showInvalid =
    (firstTerm.trim() !== '' && numerator === null) ||
    (secondTerm.trim() !== '' && denominator === null);

  const handle = () => {
    if (answered || numericGuess === null) return;
    setAnswered(true);
    const correct = Math.abs(numericGuess - ratio) / ratio <= p.tolerance;
    setTimeout(
      () =>
        onAnswer({
          correct,
          responseTimeMs: Date.now() - startTime.current,
          userResponse: `${firstTerm.trim()}:${secondTerm.trim()}`,
          correctResponse: ratio,
        }),
      700
    );
  };

  return (
    <div className="grid h-full min-h-[70vh] grid-rows-[minmax(220px,1fr)_auto]">
      <div className="relative min-h-0">
        <ExtentForm {...formProps} ratio={extentRatio} />
      </div>
      <div className="shrink-0 border-t border-neutral-800 bg-neutral-950 p-4">
        <p className="mb-3 text-center text-base">
          {p.markType === 'two-dots'
            ? 'Type the horizontal-to-vertical ratio at the unseen corner.'
            : 'Type the longer-to-shorter ratio.'}
        </p>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              autoComplete="off"
              aria-label="First ratio term"
              placeholder="2"
              value={firstTerm}
              onChange={(event) => setFirstTerm(event.target.value)}
              className="w-24 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center font-mono text-lg"
            />
            <span className="font-mono text-xl text-neutral-500">:</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              autoComplete="off"
              aria-label="Second ratio term"
              placeholder="1"
              value={secondTerm}
              onChange={(event) => setSecondTerm(event.target.value)}
              className="w-24 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center font-mono text-lg"
            />
          </div>
          <p className="font-mono text-xs text-neutral-500">
            Enter each side of the ratio separately.
          </p>
          {showInvalid && (
            <p className="font-mono text-xs text-red-400">
              Both ratio terms must be positive numbers.
            </p>
          )}
          <p className="font-mono text-xs text-neutral-600">
            Accepted error: ±{(p.tolerance * 100).toFixed(0)}%
          </p>
          <button
            onClick={handle}
            disabled={answered || !validGuess}
            className="mt-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-500 disabled:bg-neutral-800"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
