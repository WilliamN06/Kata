import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createPitchStimulus } from '../stimuli/pitch-stimuli';

export function V1_T1({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const freq = useMemo(() => {
    const lo = Math.max(20, ctx.frequency - ctx.frequencyRange / 2);
    const hi = Math.min(8000, ctx.frequency + ctx.frequencyRange / 2);
    return lo + Math.random() * (hi - lo);
  }, [ctx.frequency, ctx.frequencyRange]);

  const correct = freq < 200 ? 'Low (sub-bass/bass)' : freq < 800 ? 'Mid (vocal)' : freq < 2000 ? 'Upper-mid (bright)' : 'High (top)';
  const categories = ['Low (sub-bass/bass)', 'Mid (vocal)', 'Upper-mid (bright)', 'High (top)'];

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createPitchStimulus({ rootFrequency: freq, durationMs: ctx.durationMs, gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);

  const handle = (c: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({ correct: c === correct, responseTimeMs: Date.now() - startTime.current, userResponse: c, correctResponse: correct }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs}
            readouts={[{ label: 'FREQ', value: `${freq.toFixed(0)} Hz` }, { label: 'SOURCE', value: ctx.soundSource }]}
          />
          <p className="text-lg mt-6 mb-4">Which register is this tone?</p>
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {categories.map((c) => (
              <button key={c} onClick={() => handle(c)} disabled={answered}
                className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold text-sm">{c}</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

