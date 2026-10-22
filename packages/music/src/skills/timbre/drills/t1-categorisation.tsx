import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createTimbreSynth } from '../stimuli/timbre-synth';
import { getTimbreConfig, buildTimbreParams } from './dispatcher';

export function T1Categorisation({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const params = buildTimbreParams(variable.id, variableParams, stimulusParams);
  const config = getTimbreConfig(variable.id, params);
  const correct = config.correctAnswer(params);
  const dur = params.durationMs;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    const synth = createTimbreSynth(params, ctx, dest);
    return { play: (start: number, _d: number) => synth.play(start), stop: () => synth.stop() };
  };

  const handle = (c: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: c === correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: c,
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
            durationMs={dur}
            readouts={config.readout(params)}
          />
          <p className="text-lg mt-6 mb-4">{config.question}</p>
          <div className="flex flex-wrap gap-3 justify-center max-w-lg">
            {config.categories.map((c) => (
              <button key={c} onClick={() => handle(c)} disabled={answered}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold text-sm">
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
