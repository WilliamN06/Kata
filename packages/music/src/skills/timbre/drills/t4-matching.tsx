import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createTimbreSynth } from '../stimuli/timbre-synth';
import { getTimbreConfig, buildTimbreParams } from './dispatcher';

export function T4Matching({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const params = buildTimbreParams(variable.id, variableParams, stimulusParams);
  const config = getTimbreConfig(variable.id, params);
  const correct = config.correctAnswer(params);
  const options = useMemo(() => {
    const others = config.categories.filter((c) => c !== correct);
    return [correct, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
  }, [config.categories, correct]);

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    const synth = createTimbreSynth(params, ctx, dest);
    return { play: (start: number, _d: number) => synth.play(start), stop: () => synth.stop() };
  };

  const handle = (c: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: c === correct, responseTimeMs: Date.now() - startTime.current,
      userResponse: c, correctResponse: correct,
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
            label="♪ PLAY TARGET"
            readouts={config.readout(params)}
          />
          <p className="text-lg mt-6 mb-4">Which best matches this timbre?</p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {options.map((o) => (
              <button key={o} onClick={() => handle(o)} disabled={answered}
                className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold text-sm">
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
