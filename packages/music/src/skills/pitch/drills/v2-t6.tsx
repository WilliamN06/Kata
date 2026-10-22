import { useMemo, useState } from 'react';
import { usePitchDrillContext, useDrillState, MusicDrillWrapper, MusicStimulusView } from './_shared';
import type { DrillProps } from '@kata/core';
import { createIntervalStimulus } from '../stimuli/pitch-stimuli';

export function V2_T6({ variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const ctx = usePitchDrillContext(variableParams, stimulusParams);
  const { startTime, answered, setAnswered } = useDrillState();
  const [order, setOrder] = useState<number[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);

  // 5 intervals: 2, 4, 6, 9, 12 semitones
  const semitones = useMemo(() => [2, 4, 6, 9, 12].sort(() => Math.random() - 0.5), []);
  const previewSemitones = semitones[previewIdx] ?? 7;

  const createStimulus = (audioCtx: AudioContext, dest: AudioNode) =>
    createIntervalStimulus({
      rootFrequency: ctx.rootFreq, durationMs: Math.min(500, ctx.durationMs), gapMs: ctx.gapMs,
      soundSource: ctx.soundSource, intervalSemitones: previewSemitones,
      direction: ctx.direction, referencePresent: ctx.referencePresent,
    }, audioCtx, dest);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const sorted = [...order].sort((a, b) => a - b);
    const correct = order.every((v, i) => v === sorted[i]);
    setTimeout(() => onAnswer({
      correct, responseTimeMs: Date.now() - startTime.current,
      userResponse: order, correctResponse: sorted,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h} visualisation="both"
            showVisualisation={taskConditions.showVisualisation === true}
            durationMs={Math.min(500, ctx.durationMs) * 2 + ctx.gapMs}
            readouts={[{ label: 'PREVIEW', value: `${previewSemitones} semitones` }]}
          />
          <p className="text-sm mt-3 mb-2 text-neutral-400">Preview each interval, then order small → large</p>
          <div className="flex gap-2 mb-4">
            {semitones.map((_, i) => (
              <button key={i} onClick={() => setPreviewIdx(i)}
                className={`px-3 py-1.5 text-xs rounded ${previewIdx === i ? 'bg-blue-600' : 'bg-neutral-800'}`}>{i + 1}</button>
            ))}
          </div>
          <p className="text-base mb-3">Tap intervals in ascending semitone order:</p>
          <div className="flex gap-3 mb-4">
            {semitones.map((s) => (
              <button key={s} onClick={() => setOrder([...order, s])} disabled={order.includes(s) || answered}
                className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg font-mono">{s}st</button>
            ))}
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Order: {order.length > 0 ? order.map((s) => `${s}st`).join(' → ') : '—'}
          </p>
          <button onClick={handle} disabled={order.length !== semitones.length || answered}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">SUBMIT</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

