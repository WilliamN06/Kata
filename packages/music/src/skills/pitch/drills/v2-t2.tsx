import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createIntervalStimulus } from '../stimuli/pitch-stimuli';
import { intervalBySemitones } from '@kata/music-shared';

/**
 * V2 T2 — Interval Discrimination.
 *
 * Two intervals play (A then B). The user says if they're the SAME
 * interval or DIFFERENT. When different, B is 2 semitones away from A
 * (not 1), so the distinction is a genuine interval-size comparison
 * rather than a pitch-resolution test. The MIDI channel handling plays
 * A and B on separate channels so both are heard clearly.
 */
export function V2_T2({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const isDiff = useMemo(() => Math.random() > 0.5, []);

  // Pick the base interval from the current subset, and the alternate
  // interval that's 2 semitones away (still distinct as an interval,
  // not just a frequency shift).
  const { intervalA, intervalB } = useMemo(() => {
    const pools: Record<string, number[]> = {
      all: [0,1,2,3,4,5,6,7,8,9,10,11,12],
      'within-octave': [0,1,2,3,4,5,6,7,8,9,10,11,12],
      consonant: [3,4,5,7,8,9,12],
      dissonant: [1,2,6,10,11],
      thirds: [3,4],
      fifths: [7],
      sevenths: [10,11],
      custom: [ctx.intervalSemitones],
    };
    const pool = pools[ctx.intervalSubset] ?? pools.all;
    const a = (pool[Math.floor(Math.random() * pool.length)] ?? 7) ?? 7;
    let b = a;
    if (isDiff) {
      // Move by 2 semitones (up or down) to make a genuinely different interval
      const direction = Math.random() > 0.5 ? 1 : -1;
      b = Math.max(0, Math.min(24, a + direction * 2));
      if (b === a) b = a + 2; // fallback if clamped
    }
    return { intervalA: a, intervalB: b };
  }, [ctx.intervalSubset, ctx.intervalSemitones, isDiff]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) => {
    const a = createIntervalStimulus({
      rootFrequency: ctx.rootFreq,
      durationMs: ctx.durationMs,
      gapMs: ctx.gapMs,
      soundSource: ctx.soundSource,
      intervalSemitones: intervalA,
      direction: ctx.direction,
      referencePresent: ctx.referencePresent,
    }, audioCtx, dest);
    const b = createIntervalStimulus({
      rootFrequency: ctx.rootFreq,
      durationMs: ctx.durationMs,
      gapMs: ctx.gapMs,
      soundSource: ctx.soundSource,
      intervalSemitones: intervalB,
      direction: ctx.direction,
      referencePresent: ctx.referencePresent,
    }, audioCtx, dest);
    return {
      play: (start: number) => {
        a.play(start);
        b.play(start + (ctx.durationMs * 2 + ctx.gapMs) / 1000 + 0.4);
      },
      playA: () => a.playA(),
      playB: () => b.playB(),
      stop: () => { a.stop(); b.stop(); },
    };
  };

  const handle = (saidDiff: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: saidDiff === isDiff,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: saidDiff,
      correctResponse: isDiff,
    }), 700);
  };

  const ivA = intervalBySemitones(intervalA);
  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both"
            showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs * 2 + ctx.gapMs}
            readouts={[
              { label: 'BASE', value: `${ivA.name} (${intervalA} semitones)` },
              { label: 'SOURCE', value: ctx.soundSource },
            ]}
            buttons={[
              { label: '♪ PLAY A', variant: 'A', handler: () => h?.playA?.() },
              { label: '♪ PLAY B', variant: 'B', handler: () => h?.playB?.() },
            ]}
          />
          <p className="text-lg mt-6 mb-4">Are the two intervals the same?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">SAME</button>
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}


