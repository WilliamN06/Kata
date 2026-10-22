import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ColourChip } from '../stimuli/ColourChip';
import { randomHue, randomChroma, randomLStar } from '../utils';

export function T2Discrimination({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const surfaceSize = Math.floor((Number(stimulusParams.surfaceSize) || 160) * 0.6);

  const isDiff = useMemo(() => Math.random() > 0.5, []);

  let hueA = 0, chromaA = 0, lA = 50;
  let hueB = 0, chromaB = 0, lB = 50;

  if (varId === 'V1') {
    const hue = randomHue();
    const chroma = Number(stimulusParams.chroma) || 80;
    const lStar = Number(stimulusParams.lStar) || 55;
    const offset = Number(variableParams.hueRange) || 30;
    hueA = hue;
    hueB = isDiff ? (hue + offset) % 360 : hue;
    chromaA = chromaB = chroma;
    lA = lB = lStar;
  } else if (varId === 'V2') {
    const hue = Number(stimulusParams.hue) || 30;
    const lStar = Number(stimulusParams.lStar) || 55;
    const chroma = randomChroma();
    const offset = Number(variableParams.chromaRange) || 20;
    chromaA = chroma;
    chromaB = isDiff ? Math.max(0, Math.min(100, chroma + offset)) : chroma;
    hueA = hueB = hue;
    lA = lB = lStar;
  } else {
    const hue = Number(stimulusParams.hue) || 0;
    const chroma = Number(stimulusParams.chroma) || 0;
    const lStar = randomLStar();
    const offset = Number(variableParams.valueRange) || 5;
    lA = lStar;
    lB = isDiff ? Math.max(0, Math.min(100, lStar + offset)) : lStar;
    hueA = hueB = hue;
    chromaA = chromaB = chroma;
  }

  const handle = (saidDiff: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: saidDiff === isDiff,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: saidDiff,
      correctResponse: isDiff,
    }), 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="flex gap-8 mb-8">
        <div>
          <p className="text-xs text-neutral-500 mb-2 text-center font-mono">A</p>
          <ColourChip hue={hueA} chroma={chromaA} lStar={lA} size={surfaceSize} showLabel={false} />
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-2 text-center font-mono">B</p>
          <ColourChip hue={hueB} chroma={chromaB} lStar={lB} size={surfaceSize} showLabel={false} />
        </div>
      </div>
      <p className="text-lg mb-6">Are A and B the same {variable.name.toLowerCase()}?</p>
      <div className="flex gap-4">
        <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">SAME</button>
        <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
      </div>
    </div>
  );
}
