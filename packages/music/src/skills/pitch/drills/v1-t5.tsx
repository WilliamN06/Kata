import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createPitchStimulus } from '../stimuli/pitch-stimuli';

export function V1_T5({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const isInTune = useMemo(() => Math.random() > 0.5, []);
  const playedFreq = isInTune ? ctx.frequency : ctx.frequency + ctx.frequencyRange * 0.1;

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) => {
    const ref = createPitchStimulus({ rootFrequency: ctx.frequency, durationMs: ctx.durationMs, gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);
    const test = createPitchStimulus({ rootFrequency: playedFreq, durationMs: ctx.durationMs, gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);
    return {
      play: (start: number) => { ref.play(start); test.play(start + ctx.durationMs / 1000 + ctx.gapMs / 1000); },
      playA: () => ref.playA(),
      playB: () => test.playB(),
      stop: () => { ref.stop(); test.stop(); },
    };
  };

  const handle = (said: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({ correct: said === isInTune, responseTimeMs: Date.now() - startTime.current, userResponse: said, correctResponse: isInTune }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs}
            readouts={[{ label: 'REF', value: `${ctx.frequency} Hz` }]}
            buttons={[
              { label: '♪ PLAY REF', variant: 'A', handler: () => h?.playA?.() },
              { label: '♪ PLAY TEST', variant: 'B', handler: () => h?.playB?.() },
            ]}
          />
          <p className="text-lg mt-6 mb-4">Is the second tone in tune with the first?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">IN TUNE</button>
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DETUNED</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

