import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createIntervalStimulus } from '../stimuli/pitch-stimuli';
import { intervalBySemitones } from '@kata/music-shared';

export function V2_T4({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const targetSemitones = ctx.intervalSemitones;

  const options = useMemo(() => {
    const pool = [0, 2, 4, 5, 7, 9, 12];
    const distractors = pool.filter((s) => s !== targetSemitones).sort(() => Math.random() - 0.5).slice(0, 3);
    return [targetSemitones, ...distractors].sort(() => Math.random() - 0.5);
  }, [targetSemitones]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createIntervalStimulus({
      rootFrequency: ctx.rootFreq, durationMs: ctx.durationMs, gapMs: ctx.gapMs,
      soundSource: ctx.soundSource, intervalSemitones: targetSemitones,
      direction: ctx.direction, referencePresent: ctx.referencePresent,
    }, audioCtx, dest);

  const handle = (choice: number) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: choice === targetSemitones,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: choice, correctResponse: targetSemitones,
    }), 700);
  };

  const targetIv = intervalBySemitones(targetSemitones);
  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both"
            showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs * 2 + ctx.gapMs} label="♪ PLAY TARGET"
            readouts={[]}
          />
          <p className="text-lg mt-6 mb-4">Which interval matches the target?</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((s) => {
              const iv = intervalBySemitones(s);
              return (
                <button key={s} onClick={() => handle(s)} disabled={answered}
                  className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">
                  {iv.name} ({s} semitones)
                </button>
              );
            })}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}


