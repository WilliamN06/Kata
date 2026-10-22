import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';

export function T6Ordering({ onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [order, setOrder] = useState<number[]>([]);

  const positions = useMemo(() => [-80, -40, 0, 40, 80].sort(() => Math.random() - 0.5), []);

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
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg mb-6">Tap positions from far left to far right:</p>
      <div className="flex gap-3 mb-6">
        {positions.map((p) => (
          <button key={p} onClick={() => setOrder([...order, p])} disabled={order.includes(p) || answered} className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg font-mono font-semibold">{p}</button>
        ))}
      </div>
      <p className="text-sm text-neutral-400 mb-6 font-mono">Order: {order.join(' → ') || '—'}</p>
      <button onClick={handle} disabled={order.length !== positions.length || answered} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">SUBMIT</button>
    </div>
  );
}
