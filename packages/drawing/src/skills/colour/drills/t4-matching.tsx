import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ColourChip } from '../stimuli/ColourChip';
import { randomHue, randomChroma, randomLStar } from '../utils';

export function T4Matching({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const surfaceSize = Math.floor((Number(stimulusParams.surfaceSize) || 160) * 0.5);

  let targetHue = 0, targetChroma = 0, targetL = 50;
  let options: Array<{ hue: number; chroma: number; lStar: number; correct: boolean }> = [];

  if (varId === 'V1') {
    targetHue = randomHue();
    targetChroma = Number(stimulusParams.chroma) || 80;
    targetL = Number(stimulusParams.lStar) || 55;
    const offset = Number(variableParams.hueRange) || 30;
    const opts = [
      { hue: targetHue, chroma: targetChroma, lStar: targetL, correct: true },
      { hue: (targetHue + offset) % 360, chroma: targetChroma, lStar: targetL, correct: false },
      { hue: (targetHue - offset + 360) % 360, chroma: targetChroma, lStar: targetL, correct: false },
      { hue: (targetHue + offset * 2) % 360, chroma: targetChroma, lStar: targetL, correct: false },
    ];
    options = opts.sort(() => Math.random() - 0.5);
  } else if (varId === 'V2') {
    targetChroma = randomChroma();
    targetHue = Number(stimulusParams.hue) || 30;
    targetL = Number(stimulusParams.lStar) || 55;
    const offset = Number(variableParams.chromaRange) || 20;
    const opts = [
      { hue: targetHue, chroma: targetChroma, lStar: targetL, correct: true },
      { hue: targetHue, chroma: Math.max(0, Math.min(100, targetChroma + offset)), lStar: targetL, correct: false },
      { hue: targetHue, chroma: Math.max(0, Math.min(100, targetChroma - offset)), lStar: targetL, correct: false },
      { hue: targetHue, chroma: Math.max(0, Math.min(100, targetChroma + offset * 2)), lStar: targetL, correct: false },
    ];
    options = opts.sort(() => Math.random() - 0.5);
  } else {
    targetL = randomLStar();
    targetHue = Number(stimulusParams.hue) || 0;
    targetChroma = Number(stimulusParams.chroma) || 0;
    const offset = Number(variableParams.valueRange) || 5;
    const opts = [
      { hue: targetHue, chroma: targetChroma, lStar: targetL, correct: true },
      { hue: targetHue, chroma: targetChroma, lStar: Math.max(0, Math.min(100, targetL + offset)), correct: false },
      { hue: targetHue, chroma: targetChroma, lStar: Math.max(0, Math.min(100, targetL - offset)), correct: false },
      { hue: targetHue, chroma: targetChroma, lStar: Math.max(0, Math.min(100, targetL + offset * 2)), correct: false },
    ];
    options = opts.sort(() => Math.random() - 0.5);
  }

  const handle = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = options[idx].correct;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: idx,
      correctResponse: options.findIndex((o) => o.correct),
    }), 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-xs text-neutral-500 mb-2 font-mono">TARGET</p>
      <ColourChip hue={targetHue} chroma={targetChroma} lStar={targetL} size={surfaceSize * 1.5} showLabel={false} />
      <p className="text-lg mt-8 mb-6">Which chip matches the target?</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((o, i) => (
          <button key={i} onClick={() => handle(i)} disabled={answered} className="p-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg">
            <ColourChip hue={o.hue} chroma={o.chroma} lStar={o.lStar} size={surfaceSize} showLabel={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
