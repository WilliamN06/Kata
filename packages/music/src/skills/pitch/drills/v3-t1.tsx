import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createChordStimulus, chordShortName } from '../stimuli/pitch-stimuli';

/**
 * V3 T1 — Chord Family Categorisation
 *
 * Picks a random chord from the user's selected family pool.
 * Family = 'all' → any of 32 types.
 * Family = 'triad' → one of {maj, min, dim, aug, 5}.
 * Family = 'seventh' → one of {maj7, min7, 7, m7b5, dim7, mMaj7, aug7, augMaj7}.
 * etc.
 */

const FAMILY_POOLS: Record<string, string[]> = {
  triad: ['maj', 'min', 'dim', 'aug', '5'],
  seventh: ['maj7', 'min7', '7', 'm7b5', 'dim7', 'mMaj7', 'aug7', 'augMaj7'],
  sus: ['sus2', 'sus4', '7sus4'],
  extended: ['6', 'm6', '6add9', 'add9', 'madd9', '9', 'maj9', 'min9', '11', 'm11', '13'],
  altered: ['7b5', '7#5', '7b9', '7#9', '7#11'],
  all: [
    'maj', 'min', 'dim', 'aug', '5',
    'sus2', 'sus4', '7sus4',
    '6', 'm6', '6add9',
    'maj7', 'min7', '7', 'm7b5', 'dim7', 'mMaj7', 'aug7', 'augMaj7',
    '9', 'maj9', 'min9', 'add9', 'madd9', '11', 'm11', '13',
    '7b5', '7#5', '7b9', '7#9', '7#11',
  ],
};

// Map a chord symbol → its family label (for the answer buttons)
function familyOf(symbol: string): string {
  if (['maj', 'min', 'dim', 'aug', '5'].includes(symbol)) return 'Triad';
  if (['sus2', 'sus4', '7sus4'].includes(symbol)) return 'Suspended';
  if (['6', 'm6', '6add9', 'add9', 'madd9', '9', 'maj9', 'min9', '11', 'm11', '13'].includes(symbol)) return 'Extended';
  if (['maj7', 'min7', '7', 'm7b5', 'dim7', 'mMaj7', 'aug7', 'augMaj7'].includes(symbol)) return 'Seventh';
  if (['7b5', '7#5', '7b9', '7#9', '7#11'].includes(symbol)) return 'Altered';
  return 'Other';
}

const ALL_FAMILIES = ['Triad', 'Seventh', 'Suspended', 'Extended', 'Altered'];

export function V3_T1({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  // Pick a random chord from the current family pool
  const chordType = useMemo(() => {
    const familyKey = ctx.chordFamily || 'all';
    const pool = FAMILY_POOLS[familyKey] ?? FAMILY_POOLS.all ?? ['maj'];
    return pool[Math.floor(Math.random() * pool.length)] ?? 'maj';
  }, [ctx.chordFamily]);

  const correct = familyOf(chordType);
  const chordName = chordShortName(chordType);
  const octaveShift = Number(variableParams.octaveShift) || 0;

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createChordStimulus({
      rootFrequency: ctx.rootFreq * Math.pow(2, octaveShift / 12),
      durationMs: ctx.durationMs,
      gapMs: 0,
      soundSource: ctx.soundSource,
      chordSymbol: chordType,
      voicing: ctx.voicing,
      inversion: ctx.inversion,
    }, audioCtx, dest);

  const handle = (family: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: family === correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: family,
      correctResponse: correct,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h}
            visualisation="both"
            showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs}
            readouts={[]}
          />
          <p className="text-lg mt-6 mb-4">Which chord family is this?</p>
          <div className="flex flex-col gap-2 max-w-sm w-full">
            {ALL_FAMILIES.map((fam) => (
              <button
                key={fam}
                onClick={() => handle(fam)}
                disabled={answered}
                className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
              >
                {fam}
              </button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
