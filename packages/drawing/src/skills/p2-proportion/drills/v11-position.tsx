import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import {
  POSITION_FRACTIONS,
  POSITION_KEYS,
  POSITION_LABELS,
  readStimulusColor,
} from '../p2-utils';

type Phase = 'judging' | 'feedback';

export function V11PositionDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const lineRef = useRef<HTMLDivElement>(null);
  const [tapPct, setTapPct] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const positionSet = (variableParams?.positionSet as string) ?? 'mixed';
  const lineLengthPct = (variableParams?.lineLengthPct as number) ?? 90;
  const showTicks = String(variableParams?.showTicks ?? 'false') === 'true';
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';
  const tolerance =
    (variableParams?.positionTolerancePct as number) ??
    (variableParams?.task_tolerance as number) ??
    3;

  const pool = useMemo(() => {
    if (positionSet === 'midpoint') return ['1/2'];
    if (positionSet === 'thirds') return ['1/3', '2/3'];
    if (positionSet === 'quarters') return ['1/4', '3/4'];
    if (positionSet === 'golden') return ['golden'];
    return [...POSITION_KEYS];
  }, [positionSet]);

  const truthKey = useMemo(
    () => pool[Math.floor(Math.random() * pool.length)] ?? '1/2',
    [pool],
  );
  const truthFrac = POSITION_FRACTIONS[truthKey] ?? 0.5;
  const target = POSITION_LABELS[truthKey] ?? 'midpoint';

  const stim = readStimulusColor(variableParams);
  const correct = tapPct !== null && Math.abs(tapPct - truthFrac * 100) <= tolerance;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase === 'feedback' || !lineRef.current) return;
    const rect = lineRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setTapPct(Math.max(0, Math.min(100, pct)));
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setTapPct(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-2">
        Tap the <strong>{target}</strong> on the line
      </p>

      <div
        ref={lineRef}
        onClick={handleClick}
        className="relative my-8 h-16 cursor-crosshair"
        style={{
          width: `${lineLengthPct}%`,
          maxWidth: 1200,
          backgroundColor: stim.bg,
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
          style={{ left: 0, width: 12, height: 12, backgroundColor: stim.bar }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
          style={{ left: '100%', width: 12, height: 12, backgroundColor: stim.bar }}
        />
        {showLine && (
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
            style={{ height: 1, backgroundColor: '#4A9EFF', opacity: 0.5 }}
          />
        )}
        {showTicks &&
          Object.entries(POSITION_FRACTIONS).map(([key, frac]) => (
            <div
              key={key}
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-neutral-600"
              style={{ left: `${frac * 100}%` }}
            />
          ))}
        {tapPct !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-red-400 bg-red-500/40"
            style={{ left: `${tapPct}%` }}
          />
        )}
      </div>

      {phase === 'feedback' && tapPct !== null && (
        <div
          className={`p-6 rounded-lg border max-w-xl text-center ${
            correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            You tapped at <strong>{tapPct.toFixed(1)}%</strong>. The {target} is at{' '}
            <strong>{(truthFrac * 100).toFixed(1)}%</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}