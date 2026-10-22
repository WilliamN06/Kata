import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createPitchStimulus } from '../stimuli/pitch-stimuli';

export function V1_T2({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();
  const isDiff = useMemo(() => Math.random() > 0.5, []);
  const freqA = ctx.frequency;
  const freqB = isDiff ? ctx.frequency + ctx.frequencyRange : ctx.frequency;

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) => {
    const a = createPitchStimulus({ rootFrequency: freqA, durationMs: ctx.durationMs, gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);
    const b = createPitchStimulus({ rootFrequency: freqB, durationMs: ctx.durationMs, gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);
    return {
      play: (start: number) => { a.play(start); b.play(start + ctx.durationMs / 1000 + ctx.gapMs / 1000); },
      playA: () => a.playA(),
      playB: () => b.playB(),
      stop: () => { a.stop(); b.stop(); },
    };
  };

  const handle = (saidDiff: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({ correct: saidDiff === isDiff, responseTimeMs: Date.now() - startTime.current, userResponse: saidDiff, correctResponse: isDiff }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs}
            readouts={[{ label: 'BASE', value: `${ctx.frequency.toFixed(0)} Hz` }, { label: 'SOURCE', value: ctx.soundSource }]}
            buttons={[
              { label: '♪ PLAY A', variant: 'A', handler: () => h?.playA?.() },
              { label: '♪ PLAY B', variant: 'B', handler: () => h?.playB?.() },
            ]}
          />
          <p className="text-lg mt-6 mb-4">Are the two pitches the same?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">SAME</button>
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

