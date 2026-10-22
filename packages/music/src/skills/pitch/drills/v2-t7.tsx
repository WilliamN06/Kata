import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createPitchStimulus } from '../stimuli/pitch-stimuli';
import { getIntervalPool, semitoneFullLabel } from './_interval-pools';

/**
 * V2 T7 — Interval Identification (A = reference, B = interval above/below)
 *
 * Settings:
 *   direction = 'up'     → B is interval semitones ABOVE A
 *   direction = 'down'   → B is interval semitones BELOW A
 *   direction = 'random' → coin-flip per trial
 *
 * PLAY A → ONE note at freqA (the reference pitch)
 * PLAY B → ONE note at freqB (above or below freqA depending on direction)
 *
 * The interval is always positive (the size of the gap).
 * Answer = intervalA (e.g. 7 semitones = Perfect 5th).
 */
export function V2_T7({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const pool = useMemo(
    () => getIntervalPool(ctx.intervalMin, ctx.intervalMax),
    [ctx.intervalMin, ctx.intervalMax]
  );

  const intervalA = useMemo(() => {
    return pool[Math.floor(Math.random() * pool.length)] ?? 7;
  }, [pool]);

  // Resolve 'random' to an actual direction for this trial
  const resolvedDirection = useMemo(() => {
    if (ctx.direction === 'ascending') return 'ascending';
    if (ctx.direction === 'descending') return 'descending';
    // random
    return Math.random() > 0.5 ? 'up' : 'down';
  }, [ctx.direction]);

  // Frequencies
  const freqA = ctx.rootFreq;
  const freqB = resolvedDirection === 'ascending'
    ? freqA * Math.pow(2, intervalA / 12)
    : freqA / Math.pow(2, intervalA / 12);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) => {
    console.log(
      '[V2 T7] Direction:', resolvedDirection,
      '| Interval:', intervalA, 'semitones',
      '| A =', freqA.toFixed(0), 'Hz',
      '| B =', freqB.toFixed(0), 'Hz'
    );

    const a = createPitchStimulus({
      rootFrequency: freqA,
      durationMs: ctx.durationMs,
      gapMs: ctx.gapMs,
      soundSource: ctx.soundSource,
    }, audioCtx, dest);

    const b = createPitchStimulus({
      rootFrequency: freqB,
      durationMs: ctx.durationMs,
      gapMs: ctx.gapMs,
      soundSource: ctx.soundSource,
    }, audioCtx, dest);

    return {
      play: (start: number) => a.play(start),
      playA: () => { if (ctx.direction === 'harmonic') { a.playA(); b.playA(); } else { a.playA(); } },
      playB: () => b.playB(),
      stop: () => { a.stop(); b.stop(); },
    };
  };

  const handle = (semitones: number) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: semitones === intervalA,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: semitones,
      correctResponse: intervalA,
    }), 700);
  };

  const columns = pool.length <= 2 ? 2 : pool.length <= 6 ? 3 : 4;

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h}
            visualisation="both"
            showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs + 200}
            readouts={[]}
            buttons={[
              { label: '♪ PLAY A', variant: 'A', handler: () => h?.playA?.() },
              { label: '♪ PLAY B', variant: 'B', handler: () => h?.playB?.() },
            ]}
          />
          <p className="text-lg mt-6 mb-4 text-center max-w-lg">
            What interval is between <span className="font-bold text-blue-400">A</span> and <span className="font-bold text-blue-400">B</span>?
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(180px, 1fr))`,
              gap: '10px',
              maxWidth: '800px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            {pool.map((semis) => (
              <button
                key={semis}
                onClick={() => handle(semis)}
                disabled={answered}
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#262626',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#e5e5e5',
                  cursor: 'pointer',
                  opacity: answered ? 0.5 : 1,
                  textAlign: 'left',
                }}
              >
                {semitoneFullLabel(semis)}
              </button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}



