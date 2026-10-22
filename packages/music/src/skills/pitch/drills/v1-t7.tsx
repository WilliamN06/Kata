import { useMemo } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createPitchStimulus } from '../stimuli/pitch-stimuli';
import { frequencyToNote, NOTE_NAMES } from '@kata/music-shared';

export function V1_T7({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();

  const targetFreq = useMemo(() => {
    const lo = Math.max(65, ctx.frequency - ctx.frequencyRange / 2);
    const hi = Math.min(2000, ctx.frequency + ctx.frequencyRange / 2);
    const noteInfo = frequencyToNote(lo);
    const octaves = [noteInfo.octave, noteInfo.octave + 1, noteInfo.octave + 2];
    const oct = octaves[Math.floor(Math.random() * octaves.length)] ?? noteInfo.octave;
    const name = NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)] ?? 'C';
    const midi = (oct + 1) * 12 + NOTE_NAMES.indexOf(name);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }, [ctx.frequency, ctx.frequencyRange]);

  const noteInfo = frequencyToNote(targetFreq);
  const correct = `${noteInfo.note}${noteInfo.octave}`;

  const options = useMemo(() => {
    const opt: string[] = [correct];
    const others = NOTE_NAMES.filter((n) => n !== noteInfo.note);
    while (opt.length < 4) {
      const n = others[Math.floor(Math.random() * others.length)] ?? 'C';
      const o = `${n}${noteInfo.octave}`;
      if (!opt.includes(o)) opt.push(o);
    }
    return opt.sort(() => Math.random() - 0.5);
  }, [correct, noteInfo.note, noteInfo.octave]);

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createPitchStimulus({ rootFrequency: targetFreq, durationMs: ctx.durationMs, gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);

  const handle = (choice: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({ correct: choice === correct, responseTimeMs: Date.now() - startTime.current, userResponse: choice, correctResponse: correct }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={ctx.durationMs}
            readouts={[{ label: 'TARGET', value: `${targetFreq.toFixed(0)} Hz` }]}
          />
          <p className="text-lg mt-6 mb-4">Which note is this?</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((o) => (
              <button key={o} onClick={() => handle(o)} disabled={answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold font-mono">{o}</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

