import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createIntervalStimulus } from '../stimuli/pitch-stimuli';
import { getIntervalPool, semitoneLabel } from './_interval-pools';

export function V2_T1({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const pool = useMemo(() => getIntervalPool(ctx.intervalSubset, ctx.intervalSemitones), [ctx.intervalSubset, ctx.intervalSemitones]);

  const intervalSemitones = useMemo(() => {
    return pool[Math.floor(Math.random() * pool.length)] ?? 7;
  }, [pool]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createIntervalStimulus({
      rootFrequency: ctx.rootFreq,
      durationMs: ctx.durationMs,
      gapMs: ctx.gapMs,
      soundSource: ctx.soundSource,
      intervalSemitones,
      direction: ctx.direction,
      referencePresent: ctx.referencePresent,
    }, audioCtx, dest);

  const handle = (semitones: number) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: semitones === intervalSemitones,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: semitones,
      correctResponse: intervalSemitones,
    }), 700);
  };

  // Use inline styles to guarantee grid layout regardless of Tailwind class presence
  const columns = pool.length <= 2 ? 2 : pool.length <= 8 ? 4 : 5;

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h}
            visualisation="both"
            showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs * 2 + ctx.gapMs}
            readouts={[]}
          />
          <p className="text-lg mt-6 mb-4">How many semitones is this interval?</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(60px, 1fr))`,
              gap: '8px',
              maxWidth: '600px',
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
                  padding: '10px 8px',
                  backgroundColor: '#262626',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#e5e5e5',
                  cursor: 'pointer',
                  opacity: answered ? 0.5 : 1,
                }}
              >
                {semis}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            {pool.length} {pool.length === 1 ? 'option' : 'options'} from "{ctx.intervalSubset}" subset
          </p>
        </div>
      )}
    </MusicDrillWrapper>
  );
}


