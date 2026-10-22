import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createChordStimulus, chordShortName } from '../stimuli/pitch-stimuli';

const FAMILY_POOLS: Record<string, string[]> = {
  triad: ['maj', 'min', 'dim', 'aug'],
  seventh: ['maj7', 'min7', '7', 'm7b5', 'dim7', 'mMaj7'],
  sus: ['sus2', 'sus4'],
  extended: ['9', 'maj9', 'min9'],
  altered: ['7b5', '7#5', '7b9', '7#9'],
  all: ['maj', 'min', 'dim', 'aug', 'maj7', 'min7', '7'],
};

export function V3_T2({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const pool = FAMILY_POOLS[ctx.chordFamily] ?? FAMILY_POOLS.triad;
  const isDiff = useMemo(() => Math.random() > 0.5, []);

  const { chordA, chordB } = useMemo(() => {
    const a = (pool[Math.floor(Math.random() * pool.length)] ?? 7) ?? 'maj';
    if (!isDiff) return { chordA: a, chordB: a };
    const others = pool.filter((c) => c !== a);
    const b = others[Math.floor(Math.random() * others.length)] ?? a;
    return { chordA: a, chordB: b };
  }, [pool, isDiff]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) => {
    const a = createChordStimulus({ rootFrequency: ctx.rootFreq * Math.pow(2, ctx.octaveShift / 12), durationMs: ctx.durationMs, gapMs: 0, soundSource: ctx.soundSource, chordSymbol: chordA, voicing: ctx.voicing, inversion: ctx.inversion }, audioCtx, dest);
    const b = createChordStimulus({ rootFrequency: ctx.rootFreq * Math.pow(2, ctx.octaveShift / 12), durationMs: ctx.durationMs, gapMs: 0, soundSource: ctx.soundSource, chordSymbol: chordB, voicing: ctx.voicing, inversion: ctx.inversion }, audioCtx, dest);
    return {
      play: (start: number) => { a.play(start); b.play(start + ctx.durationMs / 1000 + 0.4); },
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
            readouts={[]}
            buttons={[
              { label: '♪ PLAY A', variant: 'A', handler: () => h?.playA?.() },
              { label: '♪ PLAY B', variant: 'B', handler: () => h?.playB?.() },
            ]}
          />
          <p className="text-lg mt-6 mb-4">Are the two chords the same type?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">SAME</button>
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}




