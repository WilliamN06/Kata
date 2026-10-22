import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createAmplitudeStimulus } from '../stimuli/amplitude';

export function T7Identification({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const refDb = Number(variableParams.referenceLevel) || -20;
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 800;
  const soundSource = String(stimulusParams.soundSource ?? 'sine');

  const correct = refDb + ' dBFS';
  const options = useMemo(() => {
    const pool = [refDb, refDb + 5, refDb - 5, refDb + 10].map((d) => d + ' dBFS');
    return [...new Set(pool)].sort(() => Math.random() - 0.5).slice(0, 4);
  }, [refDb]);

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + options.join(',');

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createAmplitudeStimulus({ frequency: freq, durationMs: dur, gainDb: refDb, soundSource }, ctx, dest).handle;

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
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation="waveform" showVisualisation={taskConditions.showVisualisation} durationMs={dur} />
          <p className="text-lg mt-6 mb-6">What is the amplitude of this tone?</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((o) => (
              <button key={o} onClick={() => handle(o)} disabled={answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold font-mono">{o}</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
