import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { DotPair } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { resolveRatioRange, readStimulusColor } from '../p2-utils';

type Phase = 'judging' | 'feedback';

const BASE = 40;

export function V3DirectionDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const rangeKey = (variableParams?.ratioRange as string) ?? 'moderate';
  const ratioMin = variableParams?.ratioMin as number | undefined;
  const ratioMax = variableParams?.ratioMax as number | undefined;
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';

  const [lo, hi] = useMemo(
    () => resolveRatioRange(rangeKey, ratioMin, ratioMax),
    [rangeKey, ratioMin, ratioMax],
  );
  const b = useMemo(() => lo + Math.floor(Math.random() * (hi - lo + 1)), [lo, hi]);
  const stim = readStimulusColor(variableParams);

  const truth = true;
  const correct = answer === truth;

  const handle = (val: boolean) => {
    if (phase === 'feedback') return;
    setAnswer(val);
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setAnswer(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-2">
        Are the two dot pairs the <strong>same ratio</strong>, just reversed?
      </p>
      <p className="text-sm text-neutral-500 mb-8">
        Pair 1 has the longer side on the right. Pair 2 has the longer side on the left.
      </p>

      <div className="flex flex-col items-center gap-8 mb-10">
        <div>
          <DotPair
            width={BASE * b + 80}
            height={50}
            distance={BASE * b}
            anchorX={20}
            anchorY={25}
            showLine={showLine}
            dotColor={stim.bar}
            backgroundColor={stim.bg}
          />
          <p className="text-xs text-neutral-500 text-center mt-1">pair 1</p>
        </div>
        <div>
          <DotPair
            width={BASE * b + 80}
            height={50}
            distance={BASE * b}
            anchorX={BASE * b}
            anchorY={25}
            showLine={showLine}
            dotColor={stim.bar}
            backgroundColor={stim.bg}
          />
          <p className="text-xs text-neutral-500 text-center mt-1">pair 2</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handle(true)}
          className={`px-6 py-3 rounded-lg border ${
            answer === true
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          SAME RATIO
        </button>
        <button
          onClick={() => handle(false)}
          className={`px-6 py-3 rounded-lg border ${
            answer === false
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          DIFFERENT
        </button>
      </div>

      {phase === 'feedback' && answer !== null && (
        <div
          className={`p-6 rounded-lg border max-w-xl text-center ${
            correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            Both pairs are the same ratio (1 : {b}), just reversed in orientation.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}