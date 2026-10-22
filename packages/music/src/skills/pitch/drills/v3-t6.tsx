import { useMemo, useState } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createChordStimulus, chordShortName } from '../stimuli/pitch-stimuli';

const CONSONANCE_RANK: Record<string, number> = {
  maj: 1, min: 2, sus4: 3, sus2: 4, maj7: 5, min7: 6, '7': 7, dim: 8, aug: 9, m7b5: 10, dim7: 11,
};

export function V3_T6({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();
  const [order, setOrder] = useState<string[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);

  const chords = useMemo(() => {
    const pool = ['maj', 'min', 'maj7', '7', 'dim', 'aug'];
    return pool.slice(0, 5).sort(() => Math.random() - 0.5);
  }, []);

  const previewChord = chords[previewIdx] ?? 'maj';

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createChordStimulus({ rootFrequency: ctx.rootFreq, durationMs: Math.min(800, ctx.durationMs), gapMs: 0, soundSource: ctx.soundSource, chordSymbol: previewChord, voicing: ctx.voicing, inversion: ctx.inversion }, audioCtx, dest);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const sorted = [...order].sort((a, b) => (CONSONANCE_RANK[a] ?? 99) - (CONSONANCE_RANK[b] ?? 99));
    const correct = order.every((v, i) => v === sorted[i]);
    setTimeout(() => onAnswer({ correct, responseTimeMs: Date.now() - startTime.current, userResponse: order, correctResponse: sorted }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={Math.min(800, ctx.durationMs)}
            readouts={[]}
          />
          <p className="text-sm mt-3 mb-2 text-neutral-400">Preview, then order most consonant → most dissonant</p>
          <div className="flex gap-2 mb-4">
            {chords.map((_, i) => (
              <button key={i} onClick={() => setPreviewIdx(i)} className={`px-3 py-1.5 text-xs rounded ${previewIdx === i ? 'bg-blue-600' : 'bg-neutral-800'}`}>{i + 1}</button>
            ))}
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {chords.map((c) => (
              <button key={c} onClick={() => setOrder([...order, c])} disabled={order.includes(c) || answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg font-semibold">{chordShortName(c)}</button>
            ))}
          </div>
          <p className="text-sm text-neutral-400 mb-4">Order: {order.map((c) => chordShortName(c)).join(' → ')}</p>
          <button onClick={handle} disabled={order.length !== chords.length || answered} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">SUBMIT</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}


