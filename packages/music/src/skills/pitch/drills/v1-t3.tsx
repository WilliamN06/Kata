import { useMemo, useState } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createPitchStimulus } from '../stimuli/pitch-stimuli';
import { frequencyToNote } from '@kata/music-shared';

export function V1_T3({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();
  const [guess, setGuess] = useState(440);

  const targetFreq = useMemo(() => {
    const lo = Math.max(20, ctx.frequency - ctx.frequencyRange / 2);
    const hi = Math.min(8000, ctx.frequency + ctx.frequencyRange / 2);
    return lo + Math.random() * (hi - lo);
  }, [ctx.frequency, ctx.frequencyRange]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createPitchStimulus({ rootFrequency: targetFreq, durationMs: ctx.durationMs, gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(guess - targetFreq) / targetFreq <= 0.08;
    setTimeout(() => onAnswer({ correct, responseTimeMs: Date.now() - startTime.current, userResponse: guess, correctResponse: Math.round(targetFreq) }), 700);
  };

  const note = frequencyToNote(targetFreq);
  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs}
            readouts={[{ label: 'TARGET', value: `${targetFreq.toFixed(0)} Hz (${note.note}${note.octave})` }]}
          />
          <p className="text-lg mt-6 mb-3">Estimate the frequency in Hz:</p>
          <input type="range" min={Math.max(20, ctx.frequency - ctx.frequencyRange)} max={Math.min(8000, ctx.frequency + ctx.frequencyRange)} step={1}
            value={guess} onChange={(e) => setGuess(Number(e.target.value))} className="w-80" />
          <p className="text-sm text-neutral-400 mt-2 font-mono">{guess} Hz ≈ {frequencyToNote(guess).note}{frequencyToNote(guess).octave}</p>
          <button onClick={handle} disabled={answered} className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">CONFIRM</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

