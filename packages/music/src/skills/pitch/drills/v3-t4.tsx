import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createChordStimulus, chordShortName } from '../stimuli/pitch-stimuli';

const FAMILY_POOLS: Record<string, string[]> = {
  triad: ['maj', 'min', 'dim', 'aug'],
  seventh: ['maj7', 'min7', '7', 'm7b5', 'dim7'],
  sus: ['sus2', 'sus4'],
  extended: ['9', 'maj9', 'min9'],
  altered: ['7b5', '7#5', '7b9', '7#9'],
  all: ['maj', 'min', 'dim', 'aug', 'maj7', 'min7', '7'],
};

export function V3_T4({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();
  const pool = FAMILY_POOLS[ctx.chordFamily] ?? FAMILY_POOLS.triad;

  const targetChord = useMemo(() => pool[Math.floor(Math.random() * pool.length)] ?? 'maj', [pool]);
  const options = useMemo(() => {
    const distractors = pool.filter((c) => c !== targetChord).sort(() => Math.random() - 0.5).slice(0, 3);
    return [targetChord, ...distractors].sort(() => Math.random() - 0.5);
  }, [pool, targetChord]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createChordStimulus({ rootFrequency: ctx.rootFreq * Math.pow(2, ctx.octaveShift / 12), durationMs: ctx.durationMs, gapMs: 0, soundSource: ctx.soundSource, chordSymbol: targetChord, voicing: ctx.voicing, inversion: ctx.inversion }, audioCtx, dest);

  const handle = (choice: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({ correct: choice === targetChord, responseTimeMs: Date.now() - startTime.current, userResponse: choice, correctResponse: targetChord }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs} label="♪ PLAY TARGET"
            readouts={[]}
          />
          <p className="text-lg mt-6 mb-4">Which chord matches the target?</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((c) => (
              <button key={c} onClick={() => handle(c)} disabled={answered} className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">{chordShortName(c)}</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}



