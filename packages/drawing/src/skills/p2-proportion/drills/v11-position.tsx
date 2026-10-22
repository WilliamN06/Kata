import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import { POSITION_FRACTIONS, POSITION_KEYS, POSITION_LABELS } from '../p2-utils';

type Phase = 'judging' | 'feedback';

const POSITION_KEYS_VISIBLE = ['1/2', '1/3', '2/3', '1/4', '3/4', 'golden'];

/** Position extraction: click the requested position (midpoint, third, quarter, golden). */
export function V11PositionDrill({ onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [click, setClick] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const truthKey = useMemo(() => {
    const idx = Math.floor(Math.random() * POSITION_KEYS.length);
    return POSITION_KEYS[idx] ?? '1/2';
  }, []);

  const truthFrac = POSITION_FRACTIONS[truthKey] ?? 0.5;
  const target = POSITION_LABELS[truthKey] ?? 'midpoint';

  const LINE_LENGTH = 420;
  const tolerancePx = LINE_LENGTH * 0.03; // 3% of the line

  const correct =
    click !== null && Math.abs(click - truthFrac * LINE_LENGTH) <= tolerancePx;
  const errPct =
    click !== null ? Math.abs(click / LINE_LENGTH - truthFrac) * 100 : null;

  const positionDots = useMemo(() => {
    const dots: Array<{ key: string; x: number; label: string }> = [];
    for (const key of POSITION_KEYS_VISIBLE) {
      const frac = POSITION_FRACTIONS[key];
      if (frac === undefined) continue;
      dots.push({
        key,
        x: frac * LINE_LENGTH,
        label: POSITION_LABELS[key] ?? key,
      });
    }
    return dots;
  }, [LINE_LENGTH]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase === 'feedback') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setClick(Math.max(0, Math.min(LINE_LENGTH, x)));
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setClick(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">
        Tap the <strong>{target}</strong> on the line
      </p>

      <div
        onClick={handleClick}
        className="relative my-8 h-10 w-[420px] cursor-crosshair"
        data-testid="position-line"
      >
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-neutral-300" />
        <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-neutral-500" />
        <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-neutral-500" />
        {positionDots.map((dot) => (
          <div
            key={dot.key}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2"
            style={{
              left: `${dot.x}px`,
              width: '12px',
              height: '12px',
              backgroundColor: dot.key === truthKey ? '#4A9EFF' : '#E0E0E0',
              borderColor: dot.key === truthKey ? '#2563EB' : '#A0A0A0',
            }}
            title={dot.label}
          />
        ))}
        {click !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2"
            style={{
              left: `${click}px`,
              width: '12px',
              height: '12px',
              backgroundColor: '#F87171',
              borderColor: '#EF4444',
            }}
          />
        )}
      </div>

      {phase === 'feedback' && click !== null && (
        <div
          className={`p-6 rounded-lg border ${
            correct
              ? 'bg-green-950/40 border-green-800'
              : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p
            className={`text-lg font-semibold mb-2 ${
              correct ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            You tapped at{' '}
            <strong>{((click / LINE_LENGTH) * 100).toFixed(1)}%</strong> along the line.
            The {target} is at <strong>{(truthFrac * 100).toFixed(1)}%</strong>.
            {errPct !== null && (
              <>
                {' '}
                Off by <strong>{errPct.toFixed(1)}%</strong>.
              </>
            )}
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}