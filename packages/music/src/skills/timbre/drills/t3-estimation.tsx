import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createTimbreSynth } from '../stimuli/timbre-synth';
import { buildTimbreParams } from './dispatcher';

export function T3Estimation({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const params = buildTimbreParams(variable.id, variableParams, stimulusParams);

  const varNum = variable.id.split(':').pop();
  let target = 50, min = 0, max = 100, unit = '%', question = 'Estimate:';
  if (varNum === 'V3') { target = params.partialDensity ?? 100; question = 'Estimate partial density:'; }
  else if (varNum === 'V6') { target = params.spectralTilt ?? 0; min = -60; max = 30; unit = 'dB/oct'; question = 'Estimate spectral tilt:'; }
  else if (varNum === 'V9') { target = params.antiresonanceDepth ?? 0; question = 'Estimate notch depth:'; }
  else if (varNum === 'V10') { target = params.envelopeDeviation ?? 0; question = 'Estimate envelope deviation:'; }
  else if (varNum === 'V11') { target = params.peakiness ?? 0; question = 'Estimate peakiness:'; }
  else if (varNum === 'V13') { target = params.fineStructureDensity ?? 0; min = 0; max = 8; unit = ''; question = 'Estimate sub-partials:'; }
  else if (varNum === 'V14') { target = params.hnr ?? 100; question = 'Estimate tonal content (HNR):'; }
  else if (varNum === 'V8') { target = params.resonanceCount ?? 0; min = 0; max = 8; unit = ''; question = 'Estimate resonance count:'; }

  const [guess, setGuess] = useState(min);

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    const synth = createTimbreSynth(params, ctx, dest);
    return { play: (start: number, _d: number) => synth.play(start), stop: () => synth.stop() };
  };

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const tolerance = (max - min) * 0.15;
    const correct = Math.abs(guess - target) <= tolerance;
    setTimeout(() => onAnswer({
      correct, responseTimeMs: Date.now() - startTime.current,
      userResponse: guess, correctResponse: target,
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
            readouts={[{ label: 'TARGET', value: `${target} ${unit}` }]}
          />
          <p className="text-lg mt-6 mb-3">{question}</p>
          <input type="range" min={min} max={max} step={1} value={guess}
            onChange={(e) => setGuess(Number(e.target.value))} className="w-80" />
          <p className="text-sm text-neutral-400 mt-2 font-mono">{guess} {unit}</p>
          <button onClick={handle} disabled={answered}
            className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">
            CONFIRM
          </button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
