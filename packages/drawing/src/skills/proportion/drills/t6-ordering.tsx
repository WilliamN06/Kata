import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';

export function T6Ordering({ onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [order, setOrder] = useState<number[]>([]);

  const ratios = useMemo(() => [1.5, 2.5, 3.5, 5].sort(() => Math.random() - 0.5), []);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const sorted = [...order].sort((a, b) => a - b);
    const correct = order.every((v, i) => v === sorted[i]);
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: order,
      correctResponse: sorted,
    }), 700);
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh] p-6">
      <p className="text-base mb-4 text-center">Tap ratios in ascending order (smallest first):</p>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {ratios.map((r) => (
          <button
            key={r}
            onClick={() => setOrder([...order, r])}
            disabled={order.includes(r) || answered}
            className="px-5 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg font-mono text-lg font-semibold"
          >
            {'1:' + r.toFixed(1)}
          </button>
        ))}
      </div>
      <p className="text-sm text-neutral-400 text-center mb-4 font-mono">
        Order: {order.map((r) => '1:' + r.toFixed(1)).join(' -> ') || '—'}
      </p>
      <div className="text-center">
        <button onClick={handle} disabled={order.length !== ratios.length || answered} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">SUBMIT</button>
      </div>
    </div>
  );
}
