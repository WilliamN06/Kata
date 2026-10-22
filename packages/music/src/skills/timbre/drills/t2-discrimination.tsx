import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createTimbreSynth, type TimbreSynthParams } from '../stimuli/timbre-synth';
import { buildTimbreParams, getTimbreConfig } from './dispatcher';

export function T2Discrimination({ variable, variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const isDiff = useMemo(() => Math.random() > 0.5, []);
  const paramsA = buildTimbreParams(variable.id, variableParams, stimulusParams);
  const config = getTimbreConfig(variable.id, paramsA);

  // B differs on the numeric axis of the variable
  const paramsB: TimbreSynthParams = { ...paramsA };
  if (isDiff) {
    const varNum = variable.id.split(':').pop();
    if (varNum === 'V1') paramsB.inharmonicity = Math.min(1, (paramsA.inharmonicity ?? 0) + 0.6);
    else if (varNum === 'V2') paramsB.spacingIrregularity = Math.min(1, (paramsA.spacingIrregularity ?? 0) + 0.6);
    else if (varNum === 'V3') paramsB.partialDensity = Math.max(10, (paramsA.partialDensity ?? 100) - 50);
    else if (varNum === 'V4') paramsB.upperBalance = Math.max(-1, Math.min(1, (paramsA.upperBalance ?? 0) - 0.8));
    else if (varNum === 'V5') paramsB.envelopeShapeValue = Math.min(1, (paramsA.envelopeShapeValue ?? 0) + 0.6);
    else if (varNum === 'V6') paramsB.spectralTilt = (paramsA.spectralTilt ?? 0) + 12;
    else if (varNum === 'V7') paramsB.bandBalanceValue = Math.max(-1, Math.min(1, (paramsA.bandBalanceValue ?? 0) - 1.2));
    else if (varNum === 'V8') paramsB.resonanceCount = Math.max(0, (paramsA.resonanceCount ?? 0) - 2);
    else if (varNum === 'V9') paramsB.antiresonanceDepth = Math.min(100, (paramsA.antiresonanceDepth ?? 0) + 50);
    else if (varNum === 'V10') paramsB.formantPattern = paramsA.formantPattern === 'none' ? 'a' : 'none';
    else if (varNum === 'V11') paramsB.envelopeDeviation = Math.min(100, (paramsA.envelopeDeviation ?? 0) + 40);
    else if (varNum === 'V12') paramsB.peakiness = Math.min(100, (paramsA.peakiness ?? 0) + 40);
    else if (varNum === 'V13') paramsB.microStructureValue = Math.min(1, (paramsA.microStructureValue ?? 0) + 0.7);
    else if (varNum === 'V14') paramsB.fineStructureDensity = Math.min(8, (paramsA.fineStructureDensity ?? 0) + 4);
    else if (varNum === 'V15') paramsB.hnr = Math.max(0, (paramsA.hnr ?? 100) - 50);
    else if (varNum === 'V16') paramsB.noiseColourValue = Math.max(-1, Math.min(1, (paramsA.noiseColourValue ?? 1) - 1.6));
    else if (varNum === 'V17') paramsB.noiseBandValue = Math.max(-1, Math.min(1, (paramsA.noiseBandValue ?? 0) - 1.2));
    else if (varNum === 'V18') paramsB.noisinessFraction = Math.min(100, (paramsA.noisinessFraction ?? 0) + 50);
    else if (varNum === 'V19') paramsB.phaseCoherence = Math.max(-1, Math.min(1, (paramsA.phaseCoherence ?? 1) - 1.6));
  }

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    const a = createTimbreSynth(paramsA, ctx, dest);
    const b = createTimbreSynth(paramsB, ctx, dest);
    return {
      play: (start: number, _d: number) => {
        a.play(start);
        b.play(start + paramsA.durationMs / 1000 + 0.3);
      },
      stop: () => { a.stop(); b.stop(); },
    };
  };

  const handle = (saidDiff: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: saidDiff === isDiff,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: saidDiff,
      correctResponse: isDiff,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <MusicStimulusView
            handle={h}
            visualisation="both"
            durationMs={paramsA.durationMs * 2 + 300}
            label="♪ PLAY"
            readouts={config.readout(paramsA)}
          />
          <p className="text-lg mt-6 mb-4">Are the two timbres the same on this property?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(false)} disabled={answered}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">
              SAME
            </button>
            <button onClick={() => handle(true)} disabled={answered}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">
              DIFFERENT
            </button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

