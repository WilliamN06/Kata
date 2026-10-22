import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createRhythmStimulus, type RhythmNote, type DrumSound } from '../stimuli/rhythm-helper';

export function T5Detection({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const bpm = Number(variableParams.tempo) || 100;
  const drum = (stimulusParams.drumSound as DrumSound) || 'click';
  const hasOffbeat = useMemo(() => Math.random() > 0.5, []);

  const notes: RhythmNote[] = hasOffbeat
    ? [
        { beat: 0, drum, velocity: 0.8 },
        { beat: 0.5, drum, velocity: 0.4 },
        { beat: 1, drum, velocity: 0.8 },
        { beat: 1.5, drum, velocity: 0.4 },
      ]
    : [
        { beat: 0, drum, velocity: 0.8 },
        { beat: 1, drum, velocity: 0.8 },
        { beat: 2, drum, velocity: 0.8 },
      ];

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + hasOffbeat;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createRhythmStimulus({ notes, bpm }, ctx, dest).handle;

  const handle = (saidYes: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: saidYes === hasOffbeat,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: saidYes,
      correctResponse: hasOffbeat,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation="none" showVisualisation={false} durationMs={3000} />
          <p className="text-lg mt-6 mb-6">Is there an offbeat / syncopation in this pattern?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">YES</button>
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">NO</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
