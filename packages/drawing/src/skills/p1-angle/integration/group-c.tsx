import { useEffect, useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleChip, LineChip } from '@kata/rendering';

type Phase = 'context' | 'memory-memorize' | 'memory-delay' | 'memory-recall' | 'transfer';

export function GroupCDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('context');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [countdown, setCountdown] = useState(3);
  const angleDisplayMode = settings?.angleDisplayMode ?? 'line';

  const angles = useMemo(() => ({
    contextTarget: 30 + Math.random() * 90,
    memoryTarget: 20 + Math.random() * 140,
    transferBase: 20 + Math.random() * 100,
  }), []);

  const recordAnswer = (correct: boolean) => {
    setAnswers((prev) => [...prev, correct]);
  };

  const advance = () => {
    if (phase === 'context') setPhase('memory-memorize');
    else if (phase === 'memory-recall') setPhase('transfer');
  };

  useEffect(() => {
    if (phase === 'memory-memorize') {
      const t = setTimeout(() => setPhase('memory-delay'), 3000);
      return () => clearTimeout(t);
    }
    if (phase === 'memory-delay') {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            setPhase('memory-recall');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const finalize = () => {
    setTimeout(() => {
      const allCorrect = [...answers].every((a) => a);
      onAnswer(allCorrect, Date.now() - startTime.current);
    }, 200);
  };

  if (phase === 'context') {
    const matchAngle = angles.contextTarget + (Math.random() > 0.5 ? 5 : -5);
    const distractors = Array.from({ length: 3 }, () => ({
      angle: angles.contextTarget + (Math.random() - 0.5) * 20,
      x: 20 + Math.random() * 260,
      y: 20 + Math.random() * 220,
    }));

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <div className="relative rounded-lg overflow-hidden border border-neutral-700 mb-12" style={{ width: 300, height: 280 }}>
          {distractors.map((d, i) => (
            <div key={i} className="absolute opacity-30" style={{ left: d.x, top: d.y }}>
              <LineChip angle={d.angle} width={100} height={100} />
            </div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <AngleChip angle={angles.contextTarget} width={200} height={180} />
          </div>
        </div>
        <p className="text-lg text-neutral-200 mb-4">Does this match the reference angle?</p>
        <div className="rounded-lg overflow-hidden border border-neutral-700 mb-8">
          <AngleChip angle={matchAngle} width={200} height={180} />
        </div>
        <div className="flex gap-4">
          <button onClick={() => { recordAnswer(false); setPhase('memory-memorize'); }}>DIFFERENT</button>
          <button onClick={() => { recordAnswer(true); setPhase('memory-memorize'); }}>SAME</button>
        </div>
      </div>
    );
  }

  if (phase === 'memory-memorize') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-neutral-200 mb-8">Memorize this angle</p>
        <AngleChip angle={angles.memoryTarget} width={300} height={280} />
        <p className="text-sm text-neutral-500 mt-8">Focus on the exact angle</p>
      </div>
    );
  }

  if (phase === 'memory-delay') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-5xl text-neutral-200 mb-4">{countdown}</p>
        <p className="text-sm text-neutral-500">Hold the angle in mind</p>
      </div>
    );
  }

  if (phase === 'memory-recall') {
    const [angle, setAngle] = useState(90);
    const handleConfirm = () => {
      const error = Math.abs(angle - angles.memoryTarget);
      recordAnswer(error <= 10);
      advance();
    };
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <p className="text-lg text-neutral-200 mb-8">What was the angle?</p>
        <AngleChip angle={angle} width={300} height={280} />
        <input type="range" min={0} max={180} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-80" />
        <p className="text-sm text-neutral-500">{angle}°</p>
        <button onClick={handleConfirm} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold">CONFIRM</button>
      </div>
    );
  }

  const sameAngle = Math.random() > 0.5;
  const transferSecond = sameAngle ? angles.transferBase : angles.transferBase + 10;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-8">Do these two angles match?</p>
      <div className="flex gap-16 mb-12 items-end">
        <AngleChip angle={angles.transferBase} width={180} height={160} />
        <AngleChip angle={transferSecond} width={360} height={320} />
      </div>
      <div className="flex gap-4">
        <button onClick={() => { recordAnswer(sameAngle); finalize(); }}>SAME</button>
        <button onClick={() => { recordAnswer(!sameAngle); finalize(); }}>DIFFERENT</button>
      </div>
    </div>
  );
}