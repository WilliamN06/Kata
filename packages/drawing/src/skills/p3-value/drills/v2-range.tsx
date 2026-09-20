// packages/drawing/src/skills/p3-value/drills/v2-range.tsx
import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip, ValueScale } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Phase = 'identify' | 'match-dark' | 'match-light' | 'feedback';

export function V2RangeDrill({
  delta,
  onAnswer,
  calibratedLStar,
  task,               // contains autoContinue, feedbackDurationMs
}: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('identify');
  const [selectedDark, setSelectedDark] = useState<number | null>(null);
  const [selectedLight, setSelectedLight] = useState<number | null>(null);
  const [darkError, setDarkError] = useState<number | null>(null);
  const [lightError, setLightError] = useState<number | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Scene generation (same as the original working version)           */
  /* ------------------------------------------------------------------ */
  const scene = useMemo(() => {
    const trueDark = 10;
    const trueLight = 90;
    const compressionFactor = 1 - Math.min(0.6, delta / 30);
    const perceivedDark = trueDark + (1 - compressionFactor) * 40;
    const perceivedLight = trueLight - (1 - compressionFactor) * 40;
    return { trueDark, trueLight, perceivedDark, perceivedLight };
  }, [delta]);

  const chips = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const t = (i * 5 + j) / 24;
        const l = scene.perceivedDark + (scene.perceivedLight - scene.perceivedDark) * t;
        result.push(l);
      }
    }
    return result.sort(() => Math.random() - 0.5);
  }, [scene]);

  /* ------------------------------------------------------------------ */
  /*  Interaction handlers                                               */
  /* ------------------------------------------------------------------ */
  const handleChipSelect = (l: number) => {
    if (phase !== 'identify') return;
    if (selectedDark === null) setSelectedDark(l);
    else if (selectedLight === null) {
      setSelectedLight(l);
      setPhase('match-dark');
    }
  };

  const handleScaleSelect = (step: number) => {
    const stepL = (step / 9) * 100;

    if (phase === 'match-dark') {
      const error = Math.abs(stepL - scene.trueDark);
      const correct = error <= Math.max(1, delta / 5);
      setDarkError(error);
      setPhase('match-light');
      return;
    }

    if (phase === 'match-light') {
      const error = Math.abs(stepL - scene.trueLight);
      const correct = error <= Math.max(1, delta / 5);
      setLightError(error);
      const darkCorrect = (darkError ?? Infinity) <= Math.max(1, delta / 5);
      const finalCorrect = correct && darkCorrect;

      const finish = (correct: boolean) => {
        const responseTime = Date.now() - startTime.current;
        if (task.autoContinue) {
          setTimeout(() => onAnswer(correct, responseTime), task.feedbackDurationMs);
        } else {
          onAnswer(correct, responseTime);
        }
        setPhase('feedback');
      };

      finish(finalCorrect);
    }
  };

  const handleContinue = () => {
    setPhase('identify');
    setSelectedDark(null);
    setSelectedLight(null);
    setDarkError(null);
    setLightError(null);
  };

  /* ------------------------------------------------------------------ */
  /*  Instruction text                                                   */
  /* ------------------------------------------------------------------ */
  const instruction =
    phase === 'identify' && selectedDark === null
      ? 'Tap the DARKEST patch in the scene'
      : phase === 'identify' && selectedLight === null
      ? 'Now tap the LIGHTEST patch'
      : phase === 'match-dark'
      ? 'Match the darkest patch to the scale'
      : phase === 'match-light'
      ? 'Match the lightest patch to the scale'
      : 'Results';

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">{instruction}</p>
      <p className="text-sm text-neutral-500 mb-8">
        {phase === 'identify'
          ? 'Find the true extremes, not the compressed perception'
          : phase === 'feedback'
          ? 'Results below'
          : 'Select the step that matches the value'}
      </p>

      {/* ---- identify phase ---- */}
      {phase === 'identify' && (
        <div className="grid grid-cols-5 gap-2 mb-12">
          {chips.map((l, i) => (
            <button
              key={i}
              onClick={() => handleChipSelect(l)}
              className={`rounded-lg overflow-hidden border border-neutral-700 transition-colors ${
                selectedDark === l || selectedLight === l
                  ? 'border-blue-500'
                  : 'hover:border-blue-500'
              }`}
            >
              <ValueChip
                lStar={calibratedLStar(l)}
                width={70}
                height={70}
              />
            </button>
          ))}
        </div>
      )}

      {/* ---- match-dark ---- */}
      {phase === 'match-dark' && (
        <ValueScale
          steps={10}
          width={500}
          height={70}
          selectedStep={
            selectedDark !== null
              ? Math.round((scene.trueDark / 100) * 9)
              : null
          }
          onSelect={handleScaleSelect}
        />
      )}

      {/* ---- match-light ---- */}
      {phase === 'match-light' && (
        <ValueScale
          steps={10}
          width={500}
          height={70}
          onSelect={handleScaleSelect}
        />
      )}

      <div className="flex justify-between text-xs text-neutral-500 mt-2" style={{ width: 500 }}>
        <span>1 (dark)</span>
        <span>10 (light)</span>
      </div>

      {/* ---- feedback ---- */}
      {phase === 'feedback' && (
        <div className="mt-8 p-6 rounded-lg border bg-green-950/40 border-green-800">
          <p className="text-lg font-semibold text-green-400 mb-2">✓ DONE</p>
          <p className="text-sm text-neutral-300">
            Darkest error: <strong>{formatDeltaL(darkError ?? 0)}</strong>
          </p>
          <p className="text-sm text-neutral-300">
            Lightest error: <strong>{formatDeltaL(lightError ?? 0)}</strong>
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}