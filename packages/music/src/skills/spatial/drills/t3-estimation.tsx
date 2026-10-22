import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createSpatialPositionStimulus, createSpatialDepthStimulus } from '../stimuli/spatial-helper';

export function T3Estimation({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const varId = variable.id.split(':').pop() || 'V1';
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 500;
  const pan = Number(variableParams.position) || 0;
  const depth = Number(variableParams.depthMs) || 30;
  const [guess, setGuess] = useState(varId === 'V1' ? 0 : 30);

  const target = varId === 'V1' ? pan : depth;
  const min = varId === 'V1' ? -100 : 0;
  const max = varId === 'V1' ? 100 : 200;
  const unit = varId === 'V1' ? '% pan' : 'ms depth';

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    if (varId === 'V1') return createSpatialPositionStimulus({ pan, frequency: freq, durationMs: dur }, ctx, dest).handle;
    return createSpatialDepthStimulus({ depthMs: depth, frequency: freq, durationMs: dur }, ctx, dest).handle;
  };

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const tolerance = (max - min) * 0.15;
    const correct = Math.abs(guess - target) <= tolerance;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: guess,
      correctResponse: target,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation="waveform" showVisualisation={taskConditions.showVisualisation} durationMs={dur + 200} />
          <p className="text-lg mt-6 mb-4">Estimate the {varId === 'V1' ? 'pan position' : 'depth'} ({unit}):</p>
          <input type="range" min={min} max={max} step={1} value={guess} onChange={(e) => setGuess(Number(e.target.value))} className="w-80" />
          <p className="text-sm text-neutral-400 mt-2 font-mono">{guess} {unit}</p>
          <button onClick={handle} disabled={answered} className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">CONFIRM</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
