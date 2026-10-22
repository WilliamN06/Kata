import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { DotPair } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { readStimulusColor } from '../p2-utils';

type Phase = 'judging' | 'feedback';

const UNIT_PX = 30;

export function V2ReferenceUnitDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [guess, setGuess] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const countMin = (variableParams?.countMin as number) ?? 3;
  const countMax = (variableParams?.countMax as number) ?? 9;
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';
  const tolerance = (variableParams?.task_tolerance as number) ?? 1;

  const trueCount = useMemo(
    () => countMin + Math.floor(Math.random() * (countMax - countMin + 1)),
    [countMin, countMax],
  );

  const stim = readStimulusColor(variableParams);
  const correct = guess !== null && Math.abs(guess - trueCount) <= tolerance;

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setGuess(null);
  };

  const maxH = UNIT_PX * trueCount + 40;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-1">How many units tall is the figure?</p>
      <p className="text-sm text-neutral-500 mb-8">
        The shorter vertical pair is one unit. The taller pair is the figure.
      </p>

      <div className="flex items-start gap-16 mb-10" style={{ height: maxH }}>
        <div className="flex flex-col items-center">
          <DotPair
            width={40}
            height={UNIT_PX + 40}
            distance={UNIT_PX}
            orientation="vertical"
            anchorX={20}
            anchorY={20}
            showLine={showLine}
            dotColor={stim.bar}
            backgroundColor={stim.bg}
          />
          <span className="text-xs text-neutral-500 mt-2">1 unit</span>
        </div>

        <div className="flex flex-col items-center">
          <DotPair
            width={40}
            height={UNIT_PX * trueCount + 40}
            distance={UNIT_PX * trueCount}
            orientation="vertical"
            anchorX={20}
            anchorY={20}
            showLine={showLine}
            dotColor={stim.bar}
            backgroundColor={stim.bg}
          />
          <span className="text-xs text-neutral-500 mt-2">figure</span>
        </div>
      </div>

      <p className="text-sm font-mono text-neutral-400 mb-4">
        {guess !== null ? `your answer — ${guess} units` : 'type the count'}
      </p>

      {phase === 'judging' && (
        <div className="flex items-center gap-3 mb-6">
          <input
            type="number"
            min={1}
            max={20}
            value={guess ?? ''}
            onChange={(e) => setGuess(Number(e.target.value) || null)}
            className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
            placeholder="units"
          />
          <button
            onClick={() => setPhase('feedback')}
            disabled={guess === null}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-semibold"
          >
            SUBMIT
          </button>
        </div>
      )}

      {phase === 'feedback' && guess !== null && (
        <div
          className={`p-6 rounded-lg border max-w-xl text-center ${
            correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The figure was <strong>{trueCount} units</strong> tall. You said <strong>{guess}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}