import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createSpatialPositionStimulus } from '../stimuli/spatial-helper';

export function T5Detection({ stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 500;
  const isLeft = useMemo(() => Math.random() > 0.5, []);
  const pan = isLeft ? -40 : 40;

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + isLeft;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createSpatialPositionStimulus({ pan, frequency: freq, durationMs: dur }, ctx, dest).handle;

  const handle = (saidLeft: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: saidLeft === isLeft,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: saidLeft,
      correctResponse: isLeft,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation="none" showVisualisation={false} durationMs={dur} />
          <p className="text-lg mt-6 mb-6">Is this on the left or right?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">LEFT</button>
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">RIGHT</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
