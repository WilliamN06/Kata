import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { Dot } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { FRACTIONS, FRACTION_KEYS, readStimulusColor } from '../p2-utils';

type Phase = 'judging' | 'feedback';

const LINE_W = 500;

export function V6PartWholeDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const answerRef = useRef<HTMLDivElement>(null);
  const [guess, setGuess] = useState(0.5);
  const [phase, setPhase] = useState<Phase>('judging');

  const fractionSet = (variableParams?.fractionSet as string) ?? 'mixed';
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';
  const tolerance = ((variableParams?.fractionTolerancePct as number) ?? 5) / 100;

  const pool = useMemo(() => {
    if (fractionSet === 'halves') return ['1/2'];
    if (fractionSet === 'thirds') return ['1/3', '2/3'];
    if (fractionSet === 'quarters') return ['1/4', '3/4'];
    return [...FRACTION_KEYS];
  }, [fractionSet]);

  const truthKey = useMemo(
    () => pool[Math.floor(Math.random() * pool.length)] ?? '1/2',
    [pool],
  );
  const truth = FRACTIONS[truthKey] ?? 0.5;

  const stim = readStimulusColor(variableParams);
  const correct = Math.abs(guess - truth) <= tolerance;

  const handleDrag = (e: React.PointerEvent) => {
    if (phase === 'feedback' || e.buttons !== 1 || !answerRef.current) return;
    const rect = answerRef.current.getBoundingClientRect();
    const frac = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    setGuess(frac);
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setGuess(0.5);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-2">Where is the middle dot?</p>
      <p className="text-sm text-neutral-500 mb-10">
        The three dots define two segments. The middle dot sits at some fraction
        of the whole. Drag your own middle dot to match.
      </p>

      {/* Stimulus: three dots */}
      <div className="relative mb-12" style={{ width: LINE_W, height: 40 }}>
        {showLine && (
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
            style={{ height: 1, backgroundColor: '#4A9EFF', opacity: 0.4 }}
          />
        )}
        <Dot at={{ x: 0, y: 20 }} size={14} color={stim.bar} />
        <Dot at={{ x: LINE_W * truth, y: 20 }} size={14} color={stim.bar} />
        <Dot at={{ x: LINE_W, y: 20 }} size={14} color={stim.bar} />
      </div>

      {/* Answer: draggable middle dot */}
      <div
        ref={answerRef}
        onPointerMove={handleDrag}
        className="relative mb-6 cursor-ew-resize select-none"
        style={{ width: LINE_W, height: 40, backgroundColor: stim.bg }}
      >
        {showLine && (
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
            style={{ height: 1, backgroundColor: '#4A9EFF', opacity: 0.4 }}
          />
        )}
        <Dot at={{ x: 0, y: 20 }} size={14} color={stim.bar} />
        <Dot at={{ x: LINE_W * guess, y: 20 }} size={14} color="#4A9EFF" />
        <Dot at={{ x: LINE_W, y: 20 }} size={14} color={stim.bar} />
      </div>

      <p className="text-sm font-mono text-neutral-400 mb-6">
        current guess — {(guess * 100).toFixed(1)}%
      </p>

      {phase === 'judging' && (
        <button
          onClick={() => setPhase('feedback')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
        >
          SUBMIT
        </button>
      )}

      {phase === 'feedback' && (
        <div
          className={`mt-6 p-6 rounded-lg border max-w-xl text-center ${
            correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The middle dot was at <strong>{truthKey}</strong> ({(truth * 100).toFixed(1)}%).
            You placed at <strong>{(guess * 100).toFixed(1)}%</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}