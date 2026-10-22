import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import { resolveDistance } from '../p2-utils';

type Phase = 'judging' | 'feedback';

/**
 * Distance extraction: two dots are shown separated by a true distance D. A
 * reference dot sits elsewhere. The user clicks a point that is the same
 * distance D from the reference dot.
 * Enhanced with additional point markers between the dots.
 */
export function V5DistanceDrill({ onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [click, setClick] = useState<{ x: number; y: number } | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const distanceRange = (settings?.distanceRange as string) ?? 'medium';
  const trueDistance = useMemo(() => resolveDistance(distanceRange), [distanceRange]);

  const REF = { x: 80, y: 180 }; // reference dot (left)
  const A = { x: 80, y: 180 - trueDistance }; // first endpoint directly above ref
  const B = { x: 80, y: 180 }; // second endpoint == reference dot (same point pair)

  const tolerancePx = trueDistance * 0.08; // 8% tolerance
  const actualDist = click ? Math.abs(click.y - REF.y) : null;
  const correct = actualDist !== null && Math.abs(actualDist - trueDistance) <= tolerancePx;
  const errRatio = actualDist !== null ? Math.abs(actualDist - trueDistance) / trueDistance : null;

  // Add intermediate markers at quarter, half, three-quarters of the distance
  const intermediatePoints = useMemo(() => {
    const points = [];
    for (let t = 0.25; t <= 0.75; t += 0.25) {
      points.push({ x: REF.x, y: REF.y - trueDistance * t });
    }
    return points;
  }, [trueDistance]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase === 'feedback') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setClick({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setClick(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-1">Reproduce the distance</p>
      <p className="text-sm text-neutral-500 mb-6">
        The two dots on the left are separated by a distance. Click a point in
        the grid that is <strong>the same distance</strong> below the reference dot.
      </p>

      <div
        onClick={handleClick}
        className="relative rounded-lg overflow-hidden border border-neutral-700 cursor-crosshair"
        style={{ width: 420, height: 340, backgroundColor: '#111' }}
        data-testid="distance-canvas"
      >
        {/* Reference pair (top-left) */}
        <div className="absolute w-3 h-3 rounded-full bg-neutral-200" style={{ left: A.x - 6, top: A.y - 6 }} />
        <div className="absolute w-3 h-3 rounded-full bg-neutral-200" style={{ left: B.x - 6, top: B.y - 6 }} />
        {/* Reference dot (the click target's origin) */}
        <div className="absolute w-3 h-3 rounded-full bg-blue-400" style={{ left: REF.x - 6, top: REF.y - 6 }} />
        {intermediatePoints.map((pt, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-neutral-300"
            style={{ left: pt.x - 6, top: pt.y - 6 }}
          />
        ))}
        {click && (
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-red-400"
            style={{ left: click.x - 8, top: click.y - 8 }}
          />
        )}
      </div>

      {phase === 'feedback' && click !== null && (
        <div className={`mt-6 p-6 rounded-lg border ${correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'}`}>
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            True distance: <strong>{trueDistance.toFixed(0)}px</strong>. Your
            error: <strong>{errRatio !== null ? `${(errRatio * 100).toFixed(1)}%` : '—'}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}