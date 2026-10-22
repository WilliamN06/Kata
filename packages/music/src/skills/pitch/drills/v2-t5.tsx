import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createIntervalStimulus } from '../stimuli/pitch-stimuli';

export function V2_T5({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const isFifth = useMemo(() => Math.random() > 0.5, []);
  const playedSemitones = isFifth ? 7 : [3, 4, 5, 9, 12][Math.floor(Math.random() * 5)] ?? 3;

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createIntervalStimulus({
      rootFrequency: ctx.rootFreq, durationMs: ctx.durationMs, gapMs: ctx.gapMs,
      soundSource: ctx.soundSource, intervalSemitones: playedSemitones,
      direction: ctx.direction, referencePresent: ctx.referencePresent,
    }, audioCtx, dest);

  const handle = (said: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: said === isFifth,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: said, correctResponse: isFifth,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both"
            showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs * 2 + ctx.gapMs}
            readouts={[{ label: 'DETECT', value: 'Perfect 5th (7 semitones)?' }]}
          />
          <p className="text-lg mt-6 mb-4">Is this a perfect fifth (7 semitones)?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(true)} disabled={answered}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">YES</button>
            <button onClick={() => handle(false)} disabled={answered}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">NO</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

