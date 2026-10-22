import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ColourChip } from '../stimuli/ColourChip';
import { randomHue, randomChroma, randomLStar } from '../utils';

export function T5Detection({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const surfaceSize = Number(stimulusParams.surfaceSize) || 160;

  const isTargetPresent = useMemo(() => Math.random() > 0.5, []);

  let hue = 0, chroma = 0, lStar = 50;
  let question = '';

  if (varId === 'V1') {
    hue = randomHue();
    chroma = Number(stimulusParams.chroma) || 80;
    lStar = Number(stimulusParams.lStar) || 55;
    question = 'Is the hue a warm colour (red/orange/yellow)?';
  } else if (varId === 'V2') {
    chroma = randomChroma();
    hue = Number(stimulusParams.hue) || 30;
    lStar = Number(stimulusParams.lStar) || 55;
    question = 'Is this colour highly saturated (chroma > 70)?';
  } else {
    lStar = randomLStar();
    hue = Number(stimulusParams.hue) || 0;
    chroma = Number(stimulusParams.chroma) || 0;
    question = 'Is this colour light (L* > 50)?';
  }

  let correct = false;
  if (varId === 'V1') {
    correct = (hue < 75 || hue > 345);
  } else if (varId === 'V2') {
    correct = chroma > 70;
  } else {
    correct = lStar > 50;
  }

  const handle = (saidYes: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: saidYes === correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: saidYes,
      correctResponse: correct,
    }), 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <ColourChip hue={hue} chroma={chroma} lStar={lStar} size={surfaceSize} showLabel={false} />
      <p className="text-lg mt-8 mb-6">{question}</p>
      <div className="flex gap-4">
        <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">YES</button>
        <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">NO</button>
      </div>
    </div>
  );
}
