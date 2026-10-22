import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createRhythmStimulus, type DrumSound } from '../stimuli/rhythm-helper';

export function T7Identification({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const bpm = Number(variableParams.tempo) || 100;
  const drum = (stimulusParams.drumSound as DrumSound) || 'click';

  const correct = bpm + ' BPM';
  const options = useMemo(() => {
    const pool = [bpm, bpm + 20, bpm - 20, bpm + 40].map((b) => b + ' BPM');
    return [...new Set(pool)].sort(() => Math.random() - 0.5).slice(0, 4);
  }, [bpm]);

  const notes = Array.from({ length: 8 }, (_, i) => ({ beat: i, drum, velocity: 0.7 }));

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + options.join(',');

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createRhythmStimulus({ notes, bpm }, ctx, dest).handle;

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
          <MusicStimulusView handle={h} visualisation="waveform" showVisualisation={taskConditions.showVisualisation} durationMs={5000} />
          <p className="text-lg mt-6 mb-6">What tempo is this?</p>
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
