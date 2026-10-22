import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createPitchStimulus } from '../stimuli/pitch-stimuli';

export function V1_T4({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const options = useMemo(() => {
    const target = ctx.frequency;
    const opts = [target, target - ctx.frequencyRange, target + ctx.frequencyRange, target + ctx.frequencyRange * 1.5];
    return opts.sort(() => Math.random() - 0.5);
  }, [ctx.frequency, ctx.frequencyRange]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createPitchStimulus({ rootFrequency: ctx.frequency, durationMs: ctx.durationMs, gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);

  const handle = (choice: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(choice - ctx.frequency) < 1;
    setTimeout(() => onAnswer({ correct, responseTimeMs: Date.now() - startTime.current, userResponse: choice, correctResponse: ctx.frequency }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs} label="♪ PLAY TARGET"
            readouts={[{ label: 'TARGET', value: `${ctx.frequency} Hz` }]}
          />
          <p className="text-lg mt-6 mb-4">Which frequency matches the target?</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((o) => (
              <button key={o} onClick={() => handle(o)} disabled={answered} className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold font-mono">{o.toFixed(0)} Hz</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

