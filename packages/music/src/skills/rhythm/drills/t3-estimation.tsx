import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createRhythmStimulus, type RhythmNote, type DrumSound } from '../stimuli/rhythm-helper';

export function T3Estimation({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const bpm = Number(variableParams.tempo) || 100;
  const drum = (stimulusParams.drumSound as DrumSound) || 'click';

  const [guess, setGuess] = useState(varId === 'V3' ? 100 : 1);

  let min = 0, max = 10, unit = '', question = '';
  let targetValue = 0;

  if (varId === 'V1') {
    question = 'Estimate the beat offset (in beats):';
    min = 0; max = 1; unit = 'beats'; targetValue = 0.5;
  } else if (varId === 'V2') {
    question = 'Estimate the duration (in beats):';
    min = 0; max = 4; unit = 'beats'; targetValue = 1.0;
  } else if (varId === 'V3') {
    question = 'Estimate the tempo (BPM):';
    min = 40; max = 240; unit = 'BPM'; targetValue = bpm;
    setGuess(100);
  } else if (varId === 'V4') {
    question = 'Estimate the beats per bar (meter numerator):';
    min = 2; max = 12; unit = 'beats'; targetValue = Number(stimulusParams.meterNumerator) || 4;
  } else {
    question = 'Estimate the rhythmic ratio A:B:';
    min = 1; max = 10; unit = ':1'; targetValue = 3;
  }

  const notes: RhythmNote[] = varId === 'V3'
    ? Array.from({ length: 8 }, (_, i) => ({ beat: i, drum, velocity: 0.7 }))
    : [
        { beat: 0, drum, velocity: 0.9 },
        { beat: 1, drum, velocity: 0.5 },
        { beat: 2, drum, velocity: 0.7 },
        { beat: 3, drum, velocity: 0.5 },
      ];

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createRhythmStimulus({ notes, bpm, meterNumerator: Number(stimulusParams.meterNumerator) || 4 }, ctx, dest).handle;

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const tolerance = (max - min) * 0.15;
    const correct = Math.abs(guess - targetValue) <= tolerance;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: guess,
      correctResponse: targetValue,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation="waveform" showVisualisation={taskConditions.showVisualisation} durationMs={4000} />
          <p className="text-lg mt-6 mb-4">{question}</p>
          <input type="range" min={min} max={max} step={varId === 'V3' ? 1 : 0.1} value={guess} onChange={(e) => setGuess(Number(e.target.value))} className="w-80" />
          <p className="text-sm text-neutral-400 mt-2 font-mono">{guess.toFixed(varId === 'V3' ? 0 : 1)} {unit}</p>
          <button onClick={handle} disabled={answered} className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">CONFIRM</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
