import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createRhythmStimulus, type RhythmNote, type DrumSound } from '../stimuli/rhythm-helper';

export function T4Matching({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const bpm = Number(variableParams.tempo) || 100;
  const drum = (stimulusParams.drumSound as DrumSound) || 'click';
  const target: RhythmNote[] = [
    { beat: 0, drum, velocity: 0.8 },
    { beat: 1, drum, velocity: 0.6 },
    { beat: 2, drum, velocity: 0.8 },
  ];
  const options = useMemo(() => {
    const op1 = target;
    const op2: RhythmNote[] = [
      { beat: 0, drum, velocity: 0.8 },
      { beat: 0.5, drum, velocity: 0.6 },
      { beat: 1, drum, velocity: 0.8 },
    ];
    const op3: RhythmNote[] = [
      { beat: 0, drum, velocity: 0.8 },
      { beat: 1.5, drum, velocity: 0.6 },
    ];
    const op4: RhythmNote[] = [
      { beat: 0, drum, velocity: 0.8 },
      { beat: 0.75, drum, velocity: 0.6 },
      { beat: 1.75, drum, velocity: 0.8 },
    ];
    return [op1, op2, op3, op4].sort(() => Math.random() - 0.5);
  }, [bpm, drum]);

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams);

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createRhythmStimulus({ notes: target, bpm }, ctx, dest).handle;

  const handle = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = options[idx] === target;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: idx,
      correctResponse: options.indexOf(target),
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation="waveform" showVisualisation={taskConditions.showVisualisation} durationMs={4000} label="♪ PLAY TARGET" />
          <p className="text-lg mt-6 mb-6">Which pattern matches the target?</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((_, i) => (
              <button key={i} onClick={() => handle(i)} disabled={answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">Pattern {String.fromCharCode(65 + i)}</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
