import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

interface Chip {
  id: number;
  lStar: number;
}

type Phase = 'sorting' | 'feedback';

export function V7OrderingDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [ordered, setOrdered] = useState<Chip[] | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('sorting');
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  // Generate 5 chips with values spanning a range controlled by delta
  const chips = useMemo<Chip[]>(() => {
    const spread = Math.max(15, delta * 3);
    const values: number[] = [];
    for (let i = 0; i < 5; i++) {
      values.push(15 + i * (spread / 5) + Math.random() * 5);
    }
    return values
      .map((lStar, i) => ({ id: i, lStar }))
      .sort(() => Math.random() - 0.5);
  }, [delta]);

  const [pool, setPool] = useState<Chip[]>(chips);
  const [slot, setSlot] = useState<Chip[]>([]);

  const handlePoolClick = (chip: Chip) => {
    setPool((p) => p.filter((c) => c.id !== chip.id));
    setSlot((s) => [...s, chip]);
  };

  const handleSlotClick = (chip: Chip) => {
    setSlot((s) => s.filter((c) => c.id !== chip.id));
    setPool((p) => [...p, chip]);
  };

  const handleSubmit = () => {
    if (slot.length !== chips.length) return;
    const sorted = [...slot].sort((a, b) => b.lStar - a.lStar);
    const correct = slot.every((chip, i) => chip.id === (sorted[i] as Chip).id);
    setOrdered(slot);
    setWasCorrect(correct);
    setPhase('feedback');
  };

  const handleContinue = () => {
    const correct = wasCorrect ?? false;
    const responseTime = Date.now() - startTime.current;
    onAnswer(correct, responseTime);
    setPhase('sorting');
    setOrdered(null);
    setPool(chips);
    setSlot([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">Sort from lightest to darkest</p>
      <p className="text-sm text-neutral-500 mb-8">Tap a chip below to place it in the next slot</p>

      <div className="flex gap-3 mb-12 p-4 bg-neutral-900 rounded-lg border border-neutral-800 min-h-[100px]">
        {slot.map((chip) => (
          <button
            key={chip.id}
            onClick={() => !ordered && handleSlotClick(chip)}
            disabled={!!ordered}
            className={`rounded-lg overflow-hidden border-2 transition-all ${
              phase === 'feedback'
                ? (slot.map((c) => c.id).indexOf(chip.id) === [...slot].sort((a, b) => b.lStar - a.lStar).map((c) => c.id).indexOf(chip.id)
                    ? 'border-green-500'
                    : 'border-red-500')
                : 'border-transparent'
            }`}
          >
            <ValueChip lStar={calibratedLStar(chip.lStar)} width={80} height={80} />
          </button>
        ))}
        {Array.from({ length: chips.length - slot.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-[80px] h-[80px] border-2 border-dashed border-neutral-700 rounded-lg flex items-center justify-center text-neutral-600 text-xs"
          >
            {slot.length + i + 1}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-12">
        {pool.map((chip) => (
          <button
            key={chip.id}
            onClick={() => handlePoolClick(chip)}
            disabled={!!ordered}
            className="rounded-lg overflow-hidden border border-neutral-700 hover:border-blue-500 transition-colors"
          >
            <ValueChip lStar={calibratedLStar(chip.lStar)} width={80} height={80} />
          </button>
        ))}
      </div>

      {phase === 'sorting' && (
        <button
          onClick={handleSubmit}
          disabled={slot.length !== chips.length || !!ordered}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-lg font-semibold transition-colors"
        >
          CHECK ORDER
        </button>
      )}

      {phase === 'feedback' && (
        <div
          className={`mt-8 p-6 rounded-lg border ${wasCorrect
            ? 'bg-green-950/40 border-green-800'
            : 'bg-red-950/40 border-red-800'}`}
        >
          <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            {wasCorrect
              ? 'Perfectly ordered!'
              : 'Some chips are out of order. The correct order is lightest to darkest.'}
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}