import { useEffect, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ContinueButton } from '@kata/ui';
import { resolveDistanceRangePct, pickDistancePct, readStimulusColor } from '../p2-utils';

type Phase = 'judging' | 'feedback';

export function V5DistanceDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });
  const [click, setClick] = useState<{ x: number; y: number } | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');
  const [truePct, setTruePct] = useState(30);

  const rangeKey = (variableParams?.distanceRange as string) ?? 'medium';
  const minPct = variableParams?.distanceMinPct as number | undefined;
  const maxPct = variableParams?.distanceMaxPct as number | undefined;
  const [loPct, hiPct] = resolveDistanceRangePct(rangeKey, minPct, maxPct);
  const stim = readStimulusColor(variableParams);

  useEffect(() => {
    setTruePct(pickDistancePct(loPct, hiPct));
  }, [loPct, hiPct]);

  useEffect(() => {
    const update = () => {
      if (!canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const shorter = Math.min(dims.w, dims.h);
  const anchor = { x: dims.w * 0.15, y: dims.h * 0.25 };
  const pairDistPx = (truePct / 100) * shorter;
  const referenceEnd = { x: anchor.x, y: anchor.y - pairDistPx };

  const tolerancePct = (variableParams?.task_tolerance as number) ?? 8;
  const tolerancePx = (tolerancePct / 100) * shorter;

  const userDistPx = click ? Math.hypot(click.x - anchor.x, click.y - anchor.y) : null;
  const correct = userDistPx !== null && Math.abs(userDistPx - pairDistPx) <= tolerancePx;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase === 'feedback' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setClick({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setPhase('feedback');
  };

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setClick(null);
    setTruePct(pickDistancePct(loPct, hiPct));
  };

  return (
    <div className="flex flex-col w-full" style={{ minHeight: '100vh' }}>
      <div className="p-4 text-center">
        <p className="text-lg text-neutral-200 mb-1">Reproduce the distance</p>
        <p className="text-sm text-neutral-500">
          The two dots at the top-left are separated by a distance. Click any point that is <strong>the same distance</strong> from the blue dot.
        </p>
      </div>

      <div
        ref={canvasRef}
        onClick={handleClick}
        className="relative flex-1 cursor-crosshair border border-neutral-700 m-4 rounded-lg overflow-hidden"
        style={{ backgroundColor: stim.bg, minHeight: 400 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            left: referenceEnd.x - 6,
            top: referenceEnd.y - 6,
            width: 12,
            height: 12,
            backgroundColor: stim.bar,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            left: anchor.x - 6,
            top: anchor.y - 6,
            width: 12,
            height: 12,
            backgroundColor: '#4A9EFF',
          }}
        />
        {click && (
          <div
            className="absolute rounded-full border-2 border-red-400"
            style={{ left: click.x - 8, top: click.y - 8, width: 16, height: 16 }}
          />
        )}
      </div>

      {phase === 'feedback' && click !== null && (
        <div
          className={`mx-4 mb-4 p-6 rounded-lg border ${
            correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            True distance: <strong>{truePct.toFixed(1)}%</strong> of canvas
            ({pairDistPx.toFixed(0)} px). Your distance:{' '}
            <strong>{userDistPx?.toFixed(0)} px</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}