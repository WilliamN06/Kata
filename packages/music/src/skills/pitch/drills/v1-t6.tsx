import { useMemo, useState } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createPitchStimulus } from '../stimuli/pitch-stimuli';

export function V1_T6({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();
  const [order, setOrder] = useState<number[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);

  const freqs = useMemo(() => {
    return [ctx.frequency, ctx.frequency * 1.5, ctx.frequency * 2, ctx.frequency * 3, ctx.frequency * 4].sort(() => Math.random() - 0.5);
  }, [ctx.frequency]);

  const previewFreq = freqs[previewIdx] ?? ctx.frequency;

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createPitchStimulus({ rootFrequency: previewFreq, durationMs: Math.min(500, ctx.durationMs), gapMs: ctx.gapMs, soundSource: ctx.soundSource }, audioCtx, dest);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const sorted = [...order].sort((a, b) => a - b);
    const correct = order.every((v, i) => v === sorted[i]);
    setTimeout(() => onAnswer({ correct, responseTimeMs: Date.now() - startTime.current, userResponse: order, correctResponse: sorted }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both" showVisualisation={taskConditions.showVisualisation === true}
            durationMs={Math.min(500, ctx.durationMs)}
            readouts={[{ label: 'PREVIEW', value: `${previewFreq.toFixed(0)} Hz` }]}
          />
          <p className="text-base mt-3 mb-2 text-neutral-400">Preview each tone, then order low → high</p>
          <div className="flex gap-2 mb-4">
            {freqs.map((_, i) => (
              <button key={i} onClick={() => setPreviewIdx(i)} className={`px-3 py-1.5 text-xs rounded ${previewIdx === i ? 'bg-blue-600' : 'bg-neutral-800'}`}>{i + 1}</button>
            ))}
          </div>
          <div className="flex gap-3 mb-4">
            {freqs.map((f) => (
              <button key={f} onClick={() => setOrder([...order, f])} disabled={order.includes(f) || answered}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg font-mono text-sm">{f.toFixed(0)}</button>
            ))}
          </div>
          <p className="text-sm text-neutral-400 mb-4">Order: {order.map((f) => f.toFixed(0)).join(' → ')}</p>
          <button onClick={handle} disabled={order.length !== freqs.length || answered} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">SUBMIT</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

