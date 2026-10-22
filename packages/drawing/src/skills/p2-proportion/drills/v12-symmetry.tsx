import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { Dot, Line } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { readStimulusColor } from '../p2-utils';

type Phase = 'judging' | 'feedback';

function resolveAsymmetryPx(
  rangeKey: string,
  minPx: number | undefined,
  maxPx: number | undefined,
): number {
  if (typeof minPx === 'number' && typeof maxPx === 'number' && minPx <= maxPx) {
    return minPx + Math.random() * (maxPx - minPx);
  }
  const preset: Record<string, [number, number]> = {
    subtle: [1, 3],
    moderate: [3, 8],
    obvious: [8, 15],
    random: [1, 15],
  };
  const [lo, hi] = preset[rangeKey] ?? preset['moderate']!;
  return lo + Math.random() * (hi - lo);
}

export function V12SymmetryDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const axis = (variableParams?.axis as string) ?? 'vertical';
  const asymmetryRange = (variableParams?.asymmetryRange as string) ?? 'moderate';
  const minPx = variableParams?.asymmetryMinPx as number | undefined;
  const maxPx = variableParams?.asymmetryMaxPx as number | undefined;
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';

  const asymmetric = useMemo(() => Math.random() > 0.4, []);
  const offsetPx = useMemo(
    () => resolveAsymmetryPx(asymmetryRange, minPx, maxPx),
    [asymmetryRange, minPx, maxPx],
  );

  const stim = readStimulusColor(variableParams);
  const truth = !asymmetric;
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

  const shift = asymmetric ? offsetPx : 0;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-2">Is this dot pattern symmetric?</p>
      <p className="text-sm text-neutral-500 mb-8">
        Compare the two paired dots against the dashed axis.
      </p>

      <div
        className="relative mb-8"
        style={{ width: 300, height: 220, backgroundColor: stim.bg }}
      >
        {/* Top pair */}
        <Dot at={{ x: 120, y: 30 }} size={14} color={stim.bar} />
        <Dot at={{ x: 120 + shift, y: 30 }} size={14} color={stim.bar} />
        {showLine && <Line a={{ x: 120, y: 30 }} b={{ x: 120 + shift, y: 30 }} color="#4A9EFF" />}

        {/* Bottom pair */}
        <Dot at={{ x: 80, y: 190 }} size={14} color={stim.bar} />
        <Dot at={{ x: 80 + shift, y: 190 }} size={14} color={stim.bar} />
        {showLine && <Line a={{ x: 80, y: 190 }} b={{ x: 80 + shift, y: 190 }} color="#4A9EFF" />}

        {/* Axis line */}
        {showLine && (
          <Line a={{ x: 100, y: 0 }} b={{ x: 100, y: 220 }} color="#4A9EFF" />
        )}
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
          SYMMETRIC
        </button>
        <button
          onClick={() => handle(false)}
          className={`px-6 py-3 rounded-lg border ${
            answer === false
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          ASYMMETRIC
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
            The shape was {asymmetric ? `asymmetric by ${offsetPx.toFixed(1)}px` : 'symmetric'} along
            the {axis} axis.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}