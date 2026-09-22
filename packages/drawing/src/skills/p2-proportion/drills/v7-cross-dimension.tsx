import { useEffect, useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { Dot } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { readStimulusColor } from '../p2-utils';

type Phase = 'judging' | 'feedback';

const MIN_USABLE_RATIO = 2;

export function V7CrossDimensionDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [viewport, setViewport] = useState({ w: 900, h: 560 });
  const [guessA, setGuessA] = useState<number | null>(1);
  const [guessB, setGuessB] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('judging');

  const ratioMin = Math.max(MIN_USABLE_RATIO, (variableParams?.ratioMin as number) ?? 2);
  const ratioMax = Math.max(ratioMin + 1, (variableParams?.ratioMax as number) ?? 6);
  const figureScalePct = (variableParams?.figureScalePct as number) ?? 60;
  const tolerance = (variableParams?.task_tolerance as number) ?? 1;

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const trial = useMemo(() => {
    const truth = ratioMin + Math.floor(Math.random() * (ratioMax - ratioMin + 1));
    // Which dimension is the unit
    const direction: 'h-is-unit' | 'w-is-unit' =
      Math.random() > 0.5 ? 'h-is-unit' : 'w-is-unit';
    return { truth, direction };
  }, [ratioMin, ratioMax]);

  const { truth, direction } = trial;
  const stim = readStimulusColor(variableParams);

  const shorterSide = Math.min(viewport.w, viewport.h * 0.75);
  const baseSize = (figureScalePct / 100) * shorterSide;

  // Compute the pixel offsets between the two dots.
  const { dx, dy } = useMemo(() => {
    const base = Math.max(120, baseSize);
    let w = base;
    let h = base;

    if (direction === 'h-is-unit') {
      h = base;
      w = base * truth;
    } else {
      w = base;
      h = base * truth;
    }

    const MAX_W = viewport.w * 0.7;
    const MAX_H = viewport.h * 0.6;
    const overflow = Math.max(1, w / MAX_W, h / MAX_H);
    w = w / overflow;
    h = h / overflow;

    return { dx: w, dy: h };
  }, [truth, baseSize, direction, viewport]);

  const guessRatio = guessA && guessB ? guessB / guessA : null;
  const correct = guessRatio !== null && Math.abs(guessRatio - truth) <= tolerance;
  const canSubmit = guessA !== null && guessA > 0 && guessB !== null && guessB > 0;

  const handleContinue = () => {
    onAnswer(correct, Date.now() - startTime.current);
    setPhase('judging');
    setGuessA(1);
    setGuessB(null);
  };

  const handleFlip = () => {
    const a = guessA;
    setGuessA(guessB);
    setGuessB(a);
  };

  // Centre the two-dot figure in a bounded container so it never overflows.
  const pad = 60;
  const boxW = dx + pad * 2;
  const boxH = dy + pad * 2;

  // Randomly choose which corner the top-left dot sits in, so the pair is not
  // always arranged the same way.
  const layout = useMemo(() => {
    // 0 = dot A at top-left; 1 = top-right; 2 = bottom-left; 3 = bottom-right
    return Math.floor(Math.random() * 4);
  }, []);

  const aAt = useMemo(() => {
    switch (layout) {
      case 0: return { x: pad, y: pad };
      case 1: return { x: pad + dx, y: pad };
      case 2: return { x: pad, y: pad + dy };
      case 3: return { x: pad + dx, y: pad + dy };
      default: return { x: pad, y: pad };
    }
  }, [layout, dx, dy]);

  const bAt = useMemo(() => {
    switch (layout) {
      case 0: return { x: pad + dx, y: pad + dy };
      case 1: return { x: pad, y: pad + dy };
      case 2: return { x: pad + dx, y: pad };
      case 3: return { x: pad, y: pad };
      default: return { x: pad + dx, y: pad + dy };
    }
  }, [layout, dx, dy]);

  const ratioLabel = direction === 'h-is-unit' ? 'H : W' : 'W : H';

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-1">
        Two dots. What is their {ratioLabel} ratio?
      </p>
      <p className="text-sm text-neutral-500 mb-8">
        The vertical gap is H. The horizontal gap is W. Type the ratio in the
        two boxes. The default reference is 1.
      </p>

      <div
        className="relative mb-8"
        style={{
          width: boxW,
          height: boxH,
          backgroundColor: stim.bg,
          borderRadius: 8,
        }}
      >
        <Dot at={aAt} size={14} color={stim.bar} />
        <Dot at={bAt} size={14} color={stim.bar} />
      </div>

      <div className="h-4" aria-hidden />

      <p className="text-sm font-mono text-neutral-400 mb-4">
        {canSubmit ? `your answer — ${guessA} : ${guessB}` : 'type a ratio'}
      </p>

      {phase === 'judging' && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-neutral-300 font-mono text-sm">{ratioLabel} =</span>
          <input
            type="number"
            min={1}
            max={20}
            step={1}
            value={guessA ?? ''}
            onChange={(e) => setGuessA(Number(e.target.value) || null)}
            className="w-16 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
          />
          <button
            type="button"
            onClick={handleFlip}
            className="text-lg text-neutral-500 hover:text-neutral-200 px-1"
            title="Swap the two fields"
          >
            ⇄
          </button>
          <input
            type="number"
            min={1}
            max={200}
            step={1}
            value={guessB ?? ''}
            onChange={(e) => setGuessB(Number(e.target.value) || null)}
            placeholder="N"
            className="w-20 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
          />
          <button
            onClick={() => setPhase('feedback')}
            disabled={!canSubmit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-semibold"
          >
            SUBMIT
          </button>
        </div>
      )}

      {phase === 'feedback' && guessRatio !== null && (
        <div
          className={`p-6 rounded-lg border max-w-xl text-center ${
            correct ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            {ratioLabel} = <strong>1 : {truth}</strong>. You said{' '}
            <strong>{guessA} : {guessB}</strong> ({guessRatio.toFixed(2)} : 1).
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}