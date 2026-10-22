import { useMemo, useState } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createChordStimulus } from '../stimuli/pitch-stimuli';
import { chordIntervals } from '@kata/music-shared';

const FAMILY_POOLS: Record<string, string[]> = {
  triad: ['maj', 'min', 'dim', 'aug'],
  seventh: ['maj7', 'min7', '7', 'm7b5', 'dim7', 'mMaj7'],
  sus: ['sus2', 'sus4'],
  extended: ['9', 'maj9', 'min9'],
  altered: ['7b5', '7#5', '7b9', '7#9'],
  all: ['maj', 'min', 'dim', 'aug', 'maj7', 'min7', '7', '9', 'maj9'],
};

/**
 * V3 Chord — T3 Estimation
 *
 * The user hears a chord and estimates how many distinct tones are
 * playing. Triads = 3 tones, sevenths = 4, ninths = 5, etc. This
 * is a distinct perceptual task from identifying the chord TYPE.
 * No Hz anywhere.
 */
export function V3_T3({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();
  const [guess, setGuess] = useState(3);

  // Pick a chord from the current family (or all)
  const chordType = useMemo(() => {
    if (ctx.chordFamily === 'all') return 'maj';
    const pool = FAMILY_POOLS[ctx.chordFamily] ?? FAMILY_POOLS.triad;
    return pool[Math.floor(Math.random() * pool.length)] ?? 'maj';
  }, [ctx.chordFamily, 'maj']);

  // Number of tones = length of chord interval stack
  const targetTones = useMemo(() => {
    const intervals = chordIntervals(chordType);
    return intervals.length;
  }, [chordType]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createChordStimulus({
      rootFrequency: ctx.rootFreq * Math.pow(2, ctx.octaveShift / 12),
      durationMs: ctx.durationMs,
      gapMs: 0,
      soundSource: ctx.soundSource,
      chordSymbol: chordType,
      voicing: ctx.voicing,
      inversion: ctx.inversion,
    }, audioCtx, dest);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const correct = guess === targetTones;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: guess,
      correctResponse: targetTones,
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
          <p className="text-lg mt-6 mb-3">How many distinct tones are in this chord?</p>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={guess}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="w-80"
          />
          <p className="text-sm text-neutral-400 mt-2 font-mono">{guess} tones</p>
          <p className="text-xs text-neutral-600 mt-1">
            Triads = 3 · Sevenths = 4 · Ninths = 5
          </p>
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



