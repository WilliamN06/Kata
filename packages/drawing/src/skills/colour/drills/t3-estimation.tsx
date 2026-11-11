import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ColourChip } from '../stimuli/ColourChip';
import { randomHue, randomChroma, randomLStar } from '../utils';

export function T3Estimation({ variable, variableParams, currentValue, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  // Fixed per trial: re-rendering (e.g. after answering) must not change the stimulus.
  const rnd = useMemo(() => ({ hue: randomHue(), chroma: randomChroma(), l: randomLStar(), order: [0, 1, 2, 3].sort(() => Math.random() - 0.5) }), []);
  const [guess, setGuess] = useState(50);

  const varId = variable.id.split(':').pop() || 'V1';
  const surfaceSize = Number(stimulusParams.surfaceSize) || 160;

  let hue = 0, chroma = 0, lStar = 50;
  let min = 0, max = 100, unit = '', question = '';
  let tolerance = 0;

  if (varId === 'V1') {
    hue = rnd.hue;
    chroma = Number(stimulusParams.chroma) || 80;
    lStar = Number(stimulusParams.lStar) || 55;
    min = 0; max = 360; unit = '°'; question = 'Estimate the hue in degrees:';
    tolerance = (Number(currentValue) || Number(variableParams.hueRange) || 30);
  } else if (varId === 'V2') {
    chroma = rnd.chroma;
    hue = Number(stimulusParams.hue) || 30;
    lStar = Number(stimulusParams.lStar) || 55;
    min = 0; max = 100; unit = '%'; question = 'Estimate the chroma (%):';
    tolerance = (Number(currentValue) || Number(variableParams.chromaRange) || 20);
  } else {
    lStar = rnd.l;
    hue = Number(stimulusParams.hue) || 0;
    chroma = Number(stimulusParams.chroma) || 0;
    min = 0; max = 100; unit = 'L*'; question = 'Estimate the value (L*):';
    tolerance = (Number(currentValue) || Number(variableParams.valueRange) || 5);
  }

  const target = varId === 'V1' ? hue : varId === 'V2' ? chroma : lStar;

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    let correct = false;
    if (varId === 'V1') {
      // Handle hue wraparound
      const diff = Math.abs(((guess - hue + 540) % 360) - 180);
      correct = 180 - diff <= tolerance;
    } else {
      correct = Math.abs(guess - target) <= tolerance;
    }
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: guess,
      correctResponse: target,
    }), 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <ColourChip hue={hue} chroma={chroma} lStar={lStar} size={surfaceSize} showLabel={false} />
      <p className="text-lg mt-8 mb-4">{question}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={guess}
        onChange={(e) => setGuess(Number(e.target.value))}
        className="w-80"
      />
      <p className="text-sm text-neutral-400 mt-2 font-mono">{guess} {unit}</p>
      <button onClick={handle} disabled={answered} className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">CONFIRM</button>
    </div>
  );
}
