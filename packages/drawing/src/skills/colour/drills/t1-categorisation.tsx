import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ColourChip } from '../stimuli/ColourChip';
import { hueToFamily, chromaToCategory, lStarToCategory, randomHue, randomChroma, randomLStar } from '../utils';

export function T1Categorisation({ variable, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const surfaceSize = Number(stimulusParams.surfaceSize) || 160;
  const bgValue = String(stimulusParams.backgroundValue || 'mid');

  const bgColor =
    bgValue === 'light' ? '#D0D0D0' :
    bgValue === 'dark' ? '#202020' :
    '#808080';

  let categories: string[] = [];
  let correct = '';
  let hue = 0;
  let chroma = 0;
  let lStar = 50;

  if (varId === 'V1') {
    // Hue categorisation
    hue = randomHue();
    chroma = Number(stimulusParams.chroma) || 80;
    lStar = Number(stimulusParams.lStar) || 55;
    categories = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta'];
    correct = hueToFamily(hue);
  } else if (varId === 'V2') {
    // Chroma categorisation
    chroma = randomChroma();
    hue = Number(stimulusParams.hue) || 30;
    lStar = Number(stimulusParams.lStar) || 55;
    categories = ['grey', 'muted', 'moderate', 'vivid'];
    correct = chromaToCategory(chroma);
  } else {
    // Value categorisation
    lStar = randomLStar();
    hue = Number(stimulusParams.hue) || 0;
    chroma = Number(stimulusParams.chroma) || 0;
    categories = ['very dark (L* < 10)', 'dark (L* 10–30)', 'low mid (L* 30–50)', 'high mid (L* 50–70)', 'light (L* 70–90)', 'very light (L* > 90)'];
    correct = lStarToCategory(lStar);
  }

  const handle = (c: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: c === correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: c,
      correctResponse: correct,
    }), 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8" style={{ background: bgColor }}>
      <ColourChip
        hue={hue}
        chroma={chroma}
        lStar={lStar}
        size={surfaceSize}
        label={`H=${hue} C=${chroma} L=${lStar}`}
      />
      <p className="text-lg mt-8 mb-6 text-neutral-100">What category is this colour?</p>
      <div className="flex flex-wrap gap-3 justify-center max-w-lg">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => handle(c)}
            disabled={answered}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold text-sm"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
