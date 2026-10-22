import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ColourChip } from '../stimuli/ColourChip';

export function T6Ordering({ variable, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [order, setOrder] = useState<number[]>([]);

  const varId = variable.id.split(':').pop() || 'V1';
  const surfaceSize = Math.floor((Number(stimulusParams.surfaceSize) || 160) * 0.6);

  // Generate 5 chips with different values of the target variable
  const chips = useMemo(() => {
    const values: number[] = [];
    if (varId === 'V1') {
      // Hue values
      for (let i = 0; i < 5; i++) values.push(Math.floor(Math.random() * 360));
    } else if (varId === 'V2') {
      // Chroma values
      for (let i = 0; i < 5; i++) values.push(Math.floor(Math.random() * 100));
    } else {
      // L* values
      for (let i = 0; i < 5; i++) values.push(Math.floor(Math.random() * 100));
    }

    const baseHue = Number(stimulusParams.hue) || 30;
    const baseChroma = Number(stimulusParams.chroma) || 80;
    const baseL = Number(stimulusParams.lStar) || 55;

    const items = values.map((v) => ({
      hue: varId === 'V1' ? v : baseHue,
      chroma: varId === 'V2' ? v : baseChroma,
      lStar: varId === 'V3' ? v : baseL,
      value: v,
    }));
    return items.sort(() => Math.random() - 0.5);
  }, [varId, stimulusParams]);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const sorted = [...chips].sort((a, b) => a.value - b.value);
    const correct = order.every((idx, i) => chips[idx].value === sorted[i].value);
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: order.map((i) => chips[i].value),
      correctResponse: sorted.map((c) => c.value),
    }), 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg mb-6">Tap chips in ascending order ({varId === 'V1' ? 'hue 0→360' : varId === 'V2' ? 'chroma 0→100' : 'value 0→100'}):</p>
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {chips.map((c, i) => (
          <button key={i} onClick={() => setOrder([...order, i])} disabled={order.includes(i) || answered} className="p-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg">
            <ColourChip hue={c.hue} chroma={c.chroma} lStar={c.lStar} size={surfaceSize} showLabel={false} />
          </button>
        ))}
      </div>
      <p className="text-sm text-neutral-400 mb-4 font-mono">Order: {order.map((i) => chips[i].value).join(' → ') || '—'}</p>
      <button onClick={handle} disabled={order.length !== chips.length || answered} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">SUBMIT</button>
    </div>
  );
}
