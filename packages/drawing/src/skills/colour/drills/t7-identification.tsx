import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ColourChip } from '../stimuli/ColourChip';
import { randomHue, randomChroma, randomLStar, hueToFamily } from '../utils';

export function T7Identification({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const surfaceSize = Number(stimulusParams.surfaceSize) || 160;

  let hue = 0, chroma = 0, lStar = 50;
  let correct = '';
  let options: string[] = [];

  if (varId === 'V1') {
    hue = randomHue();
    chroma = Number(stimulusParams.chroma) || 80;
    lStar = Number(stimulusParams.lStar) || 55;
    correct = hueToFamily(hue);
    options = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta'];
  } else if (varId === 'V2') {
    chroma = randomChroma();
    hue = Number(stimulusParams.hue) || 30;
    lStar = Number(stimulusParams.lStar) || 55;
    const bucket = chroma < 15 ? '0–15%' : chroma < 40 ? '15–40%' : chroma < 70 ? '40–70%' : '70–100%';
    correct = bucket;
    options = ['0–15%', '15–40%', '40–70%', '70–100%'];
  } else {
    lStar = randomLStar();
    hue = Number(stimulusParams.hue) || 0;
    chroma = Number(stimulusParams.chroma) || 0;
    const bucket = lStar < 10 ? '0–10' : lStar < 30 ? '10–30' : lStar < 50 ? '30–50' : lStar < 70 ? '50–70' : lStar < 90 ? '70–90' : '90–100';
    correct = 'L* ' + bucket;
    options = ['L* 0–10', 'L* 10–30', 'L* 30–50', 'L* 50–70', 'L* 70–90', 'L* 90–100'];
  }

  const shuffledOptions = useMemo(() => [...options].sort(() => Math.random() - 0.5), [options.join(',')]);

  const handle = (choice: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: choice === correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: choice,
      correctResponse: correct,
    }), 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <ColourChip hue={hue} chroma={chroma} lStar={lStar} size={surfaceSize} showLabel={false} />
      <p className="text-lg mt-8 mb-6">Identify this {variable.name.toLowerCase()}:</p>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {shuffledOptions.map((o) => (
          <button key={o} onClick={() => handle(o)} disabled={answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold text-sm">{o}</button>
        ))}
      </div>
    </div>
  );
}
