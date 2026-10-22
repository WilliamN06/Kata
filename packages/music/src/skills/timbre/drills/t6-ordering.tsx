import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createTimbreSynth } from '../stimuli/timbre-synth';
import { buildTimbreParams } from './dispatcher';

export function T6Ordering({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [order, setOrder] = useState<number[]>([]);

  // Five different values of the variable param, presented one at a time
  const baseParams = buildTimbreParams(variable.id, variableParams, stimulusParams);
  const values = useMemo(() => {
    const varNum = variable.id.split(':').pop();
    if (varNum === 'V6') return [-30, -15, 0, 15, 30];
    if (varNum === 'V3') return [10, 30, 50, 70, 100];
    if (varNum === 'V10') return [10, 30, 50, 70, 90];
    if (varNum === 'V11') return [10, 30, 50, 70, 90];
    return [1, 2, 3, 4, 5];
  }, [variable.id]);
  const shuffled = useMemo(() => [...values].sort(() => Math.random() - 0.5), [values]);

  const [previewIndex, setPreviewIndex] = useState(0);
  const previewValue = shuffled[previewIndex];

  const params = { ...baseParams };
  const varNum = variable.id.split(':').pop();
  if (varNum === 'V6') params.spectralTilt = previewValue;
  else if (varNum === 'V3') params.partialDensity = previewValue;
  else if (varNum === 'V10') params.envelopeDeviation = previewValue;
  else if (varNum === 'V11') params.peakiness = previewValue;
  else if (varNum === 'V13') params.fineStructureDensity = previewValue;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    const synth = createTimbreSynth(params, ctx, dest);
    return { play: (start: number, _d: number) => synth.play(start), stop: () => synth.stop() };
  };

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
            handle={h}
            visualisation="both"
            durationMs={params.durationMs}
            readouts={[{ label: 'PREVIEW', value: `${previewValue}` }]}
          />
          <p className="text-base mt-4 mb-2 text-neutral-400">Preview each value, then order from smallest to largest</p>

          <div className="flex gap-2 mb-4">
            {shuffled.map((v, i) => (
              <button key={i} onClick={() => setPreviewIndex(i)}
                className={`px-3 py-1.5 text-xs rounded ${previewIndex === i ? 'bg-blue-600' : 'bg-neutral-800'}`}>
                {i + 1}
              </button>
            ))}
          </div>

          <p className="text-base mb-3">Tap the values in ascending order:</p>
          <div className="flex gap-3 mb-4">
            {shuffled.map((v) => (
              <button key={v} onClick={() => setOrder([...order, v])}
                disabled={order.includes(v) || answered}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg font-mono">
                {v}
              </button>
            ))}
          </div>
          <p className="text-sm text-neutral-400 mb-4">Order: {order.join(' → ')}</p>
          <button onClick={handle} disabled={order.length !== shuffled.length || answered}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">
            SUBMIT
          </button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
