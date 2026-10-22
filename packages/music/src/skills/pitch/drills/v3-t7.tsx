import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createChordStimulus, chordShortName } from '../stimuli/pitch-stimuli';

/**
 * V3 T7 — Chord Identification
 *
 * Distractors are drawn from the SAME family as the correct answer,
 * so the drill tests "which chord in this family" not "is this a
 * triad or a ninth".
 *
 * Family rules:
 *   - Triad      → distractors from {maj, min, dim, aug, 5}
 *   - Seventh    → distractors from the 8 seventh types
 *   - Sus        → distractors from {sus2, sus4, 7sus4} + triads (pad to 4)
 *   - Extended   → distractors from the 11 extended types
 *   - Altered    → distractors from the 5 altered types + sevenths (pad to 4)
 *   - All        → mixed from all 32
 *
 * Padding rule: if a family has fewer than 4 members, distractors
 * extend to a related family before reaching into the full catalogue.
 */

const FAMILIES: Record<string, { pool: string[]; padWith: string[] }> = {
  triad: {
    pool: ['maj', 'min', 'dim', 'aug', '5'],
    padWith: [],   // 5 is enough for 4 answer buttons
  },
  seventh: {
    pool: ['maj7', 'min7', '7', 'm7b5', 'dim7', 'mMaj7', 'aug7', 'augMaj7'],
    padWith: [],
  },
  sus: {
    pool: ['sus2', 'sus4', '7sus4'],
    padWith: ['maj', 'min'],   // pad sus with plain triads
  },
  extended: {
    pool: ['6', 'm6', '6add9', 'add9', 'madd9', '9', 'maj9', 'min9', '11', 'm11', '13'],
    padWith: [],
  },
  altered: {
    pool: ['7b5', '7#5', '7b9', '7#9', '7#11'],
    padWith: ['7', 'maj7'],   // pad altered with vanilla sevenths
  },
  all: {
    pool: [
      'maj', 'min', 'dim', 'aug', '5',
      'sus2', 'sus4', '7sus4',
      '6', 'm6', '6add9',
      'maj7', 'min7', '7', 'm7b5', 'dim7', 'mMaj7', 'aug7', 'augMaj7',
      '9', 'maj9', 'min9', 'add9', 'madd9', '11', 'm11', '13',
      '7b5', '7#5', '7b9', '7#9', '7#11',
    ],
    padWith: [],
  },
};

function pickAnswerOptions(family: string, correct: string): string[] {
  const cfg = FAMILIES[family] ?? FAMILIES.all!;
  const distractors: string[] = [];

  // 1. Same-family distractors
  const sameFamily = cfg.pool.filter((c) => c !== correct);
  const shuffled = [...sameFamily].sort(() => Math.random() - 0.5);
  distractors.push(...shuffled);

  // 2. Pad with related family if needed
  if (distractors.length < 3) {
    const padPool = cfg.padWith.filter((c) => c !== correct && !distractors.includes(c));
    const shuffledPad = [...padPool].sort(() => Math.random() - 0.5);
    distractors.push(...shuffledPad);
  }

  // 3. Final pad with all (rare — only if family has 1-2 members and padWith is empty)
  if (distractors.length < 3) {
    const all = FAMILIES.all!.pool.filter((c) => c !== correct && !distractors.includes(c));
    const shuffledAll = [...all].sort(() => Math.random() - 0.5);
    distractors.push(...shuffledAll);
  }

  const top3 = distractors.slice(0, 3);
  return [correct, ...top3].sort(() => Math.random() - 0.5);
}

export function V3_T7({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const familyKey = ctx.chordFamily ?? 'all';
  const familyCfg = FAMILIES[familyKey] ?? FAMILIES.all!;
  const correct = useMemo(
    () => familyCfg.pool[Math.floor(Math.random() * familyCfg.pool.length)] ?? 'maj',
    [familyCfg.pool]
  );

  const options = useMemo(
    () => pickAnswerOptions(familyKey, correct),
    [familyKey, correct]
  );

  const octaveShift = Number(variableParams.octaveShift) || 0;

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createChordStimulus({
      rootFrequency: ctx.rootFreq * Math.pow(2, octaveShift / 12),
      durationMs: ctx.durationMs,
      gapMs: 0,
      soundSource: ctx.soundSource,
      chordSymbol: correct,
      voicing: ctx.voicing,
      inversion: ctx.inversion,
    }, audioCtx, dest);

  const handle = (choice: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: choice === correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: choice,
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
          <p className="text-lg mt-6 mb-4">Identify the chord type:</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
              gap: '12px',
              maxWidth: '600px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            {options.map((c) => (
              <button
                key={c}
                onClick={() => handle(c)}
                disabled={answered}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#262626',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#e5e5e5',
                  cursor: 'pointer',
                  opacity: answered ? 0.5 : 1,
                  textAlign: 'left',
                }}
              >
                {chordShortName(c)}
              </button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

