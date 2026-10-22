import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createAmplitudeStimulus } from '../stimuli/amplitude';

export function T4Matching({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const refDb = Number(variableParams.referenceLevel) || -20;
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 800;
  const soundSource = String(stimulusParams.soundSource ?? 'sine');

  const options = [
    { label: refDb + ' dBFS', value: refDb, correct: true },
    { label: (refDb + 5) + ' dBFS', value: refDb + 5, correct: false },
    { label: (refDb - 5) + ' dBFS', value: refDb - 5, correct: false },
    { label: (refDb + 10) + ' dBFS', value: refDb + 10, correct: false },
  ].sort(() => Math.random() - 0.5);

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams);

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createAmplitudeStimulus({ frequency: freq, durationMs: dur, gainDb: refDb, soundSource }, ctx, dest).handle;

  const handle = (choice: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(choice - refDb) < 0.5;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: choice,
      correctResponse: refDb,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView
            handle={h}
            visualisation="waveform"
            showVisualisation={taskConditions.showVisualisation}
            durationMs={dur}
            label="♪ PLAY TARGET"
          />
          <p className="text-lg mt-6 mb-6">Match the target amplitude:</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((o) => (
              <button key={o.label} onClick={() => handle(o.value)} disabled={answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold font-mono">{o.label}</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
