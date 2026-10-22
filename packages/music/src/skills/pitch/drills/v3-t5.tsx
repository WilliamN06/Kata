import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createChordStimulus } from '../stimuli/pitch-stimuli';

export function V3_T5({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const isMajor = useMemo(() => Math.random() > 0.5, []);
  const chordType = isMajor ? 'maj' : ['min', 'dim', 'aug'][Math.floor(Math.random() * 3)] ?? 'min';

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createChordStimulus({ rootFrequency: ctx.rootFreq * Math.pow(2, ctx.octaveShift / 12), durationMs: ctx.durationMs, gapMs: 0, soundSource: ctx.soundSource, chordSymbol: chordType, voicing: ctx.voicing, inversion: ctx.inversion }, audioCtx, dest);

  const handle = (said: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({ correct: said === isMajor, responseTimeMs: Date.now() - startTime.current, userResponse: said, correctResponse: isMajor }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs}
            readouts={[]}
          />
          <p className="text-lg mt-6 mb-4">Is this a major triad?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">YES</button>
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">NO</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}


