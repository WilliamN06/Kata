import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createTimbreSynth } from '../stimuli/timbre-synth';
import { buildTimbreParams } from './dispatcher';

export function T5Detection({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const params = buildTimbreParams(variable.id, variableParams, stimulusParams);
  const hasFeature = useMemo(() => Math.random() > 0.5, []);

  // When hasFeature is false, modify the variable's parameter to the "absent" state
  const testParams = { ...params };
  const varNum = variable.id.split(':').pop();
  if (!hasFeature) {
    if (varNum === 'V14') testParams.hnr = 5;
    if (varNum === 'V9') testParams.antiresonanceDepth = 0;
    if (varNum === 'V8') testParams.resonanceCount = 0;
    if (varNum === 'V10') testParams.envelopeDeviation = 0;
    if (varNum === 'V11') testParams.peakiness = 0;
    if (varNum === 'V13') testParams.fineStructureDensity = 0;
  }

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    const synth = createTimbreSynth(testParams, ctx, dest);
    return { play: (start: number, _d: number) => synth.play(start), stop: () => synth.stop() };
  };

  const handle = (said: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: said === hasFeature, responseTimeMs: Date.now() - startTime.current,
      userResponse: said, correctResponse: hasFeature,
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
          />
          <p className="text-lg mt-6 mb-4">Is the feature present in this sound?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(true)} disabled={answered}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">
              YES
            </button>
            <button onClick={() => handle(false)} disabled={answered}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">
              NO
            </button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
