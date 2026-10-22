import { useMemo, useState } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createIntervalStimulus } from '../stimuli/pitch-stimuli';
import { getIntervalPool, semitoneLabel } from './_interval-pools';

/**
 * V2 T3 — Interval Estimation
 *
 * The slider's min/max matches the current subset's range. Within
 * "all" you can drag 0-24. Within "fifths" you can drag 7-19 (the
 * range covering the two fifth intervals). Correct = within ±1 semitone.
 */
export function V2_T3({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const pool = useMemo(() => getIntervalPool(ctx.intervalSubset, ctx.intervalSemitones), [ctx.intervalSubset, ctx.intervalSemitones]);

  const targetSemitones = useMemo(() => {
    return pool[Math.floor(Math.random() * pool.length)] ?? 7;
  }, [pool]);

  const sliderMin = Math.min(...pool);
  const sliderMax = Math.max(...pool);
  const sliderStep = 1;

  const [guess, setGuess] = useState(targetSemitones);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createIntervalStimulus({
      rootFrequency: ctx.rootFreq,
      durationMs: ctx.durationMs,
      gapMs: ctx.gapMs,
      soundSource: ctx.soundSource,
      intervalSemitones: targetSemitones,
      direction: ctx.direction,
      referencePresent: ctx.referencePresent,
    }, audioCtx, dest);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(guess - targetSemitones) <= 1;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: guess,
      correctResponse: targetSemitones,
    }), 700);
  };

  // If the subset is a single value, there's nothing to estimate. Show a note.
  if (sliderMin === sliderMax) {
    return (
      <MusicDrillWrapper createStimulus={createStimulus}>
        {(h) => (
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
            <MusicStimulusView
              handle={h}
              visualisation="both"
              showVisualisation={taskConditions.showVisualisation === true}
              durationMs={ctx.durationMs * 2 + ctx.gapMs}
              readouts={[{ label: 'TARGET', value: semitoneLabel(targetSemitones) }]}
            />
            <p className="text-lg mt-6 mb-2 text-center max-w-md">
              Estimation needs a range with multiple options.
            </p>
            <p className="text-sm text-neutral-400 text-center max-w-md">
              Your current interval subset "{ctx.intervalSubset}" only contains {sliderMin}. Change it in settings to "All intervals" or another subset with more than one interval to use Estimation.
            </p>
          </div>
        )}
      </MusicDrillWrapper>
    );
  }

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h}
            visualisation="both"
            showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs * 2 + ctx.gapMs}
            readouts={[
              { label: 'ANSWER', value: semitoneLabel(targetSemitones) },
              { label: 'RANGE', value: `${sliderMin}–${sliderMax} semitones` },
              { label: 'SOURCE', value: ctx.soundSource },
            ]}
          />
          <p className="text-lg mt-6 mb-3">Estimate the interval in semitones:</p>
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={guess}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="w-80"
          />
          <p className="text-sm text-neutral-400 mt-2 font-mono">{semitoneLabel(guess)}</p>
          <p className="text-xs text-neutral-600 mt-1">Tolerance: ±1 semitone</p>
          <button
            onClick={handle}
            disabled={answered}
            className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold"
          >
            CONFIRM
          </button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

