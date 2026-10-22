import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createAmplitudeStimulus } from '../stimuli/amplitude';

export function T5Detection({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const refDb = Number(variableParams.referenceLevel) || -20;
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 800;
  const soundSource = String(stimulusParams.soundSource ?? 'sine');

  const isLouder = useMemo(() => Math.random() > 0.5, []);
  const playedDb = isLouder ? refDb + 6 : refDb - 6;

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + isLouder;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createAmplitudeStimulus({ frequency: freq, durationMs: dur, gainDb: playedDb, soundSource }, ctx, dest).handle;

  const handle = (saidLouder: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: saidLouder === isLouder,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: saidLouder,
      correctResponse: isLouder,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation="none" showVisualisation={false} durationMs={dur} />
          <p className="text-lg mt-6 mb-6">Is this louder or quieter than {refDb} dBFS?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">LOUDER</button>
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">QUIETER</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
