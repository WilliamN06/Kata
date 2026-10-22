import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createSpatialPositionStimulus, createSpatialDepthStimulus } from '../stimuli/spatial-helper';

export function T4Matching({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const varId = variable.id.split(':').pop() || 'V1';
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 500;
  const pan = Number(variableParams.position) || 0;
  const depth = Number(variableParams.depthMs) || 30;

  const options = useMemo(() => {
    if (varId === 'V1') {
      return [pan, pan + 20, pan - 20, pan + 40].map((p) => Math.max(-100, Math.min(100, p)));
    } else {
      return [depth, depth + 30, depth - 15, depth + 60].map((d) => Math.max(0, Math.min(200, d)));
    }
  }, [pan, depth, varId]);

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    if (varId === 'V1') return createSpatialPositionStimulus({ pan, frequency: freq, durationMs: dur }, ctx, dest).handle;
    return createSpatialDepthStimulus({ depthMs: depth, frequency: freq, durationMs: dur }, ctx, dest).handle;
  };

  const handle = (choice: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(choice - (varId === 'V1' ? pan : depth)) < 1;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: choice,
      correctResponse: varId === 'V1' ? pan : depth,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation="waveform" showVisualisation={taskConditions.showVisualisation} durationMs={dur + 200} label="♪ PLAY TARGET" />
          <p className="text-lg mt-6 mb-6">Match the target {varId === 'V1' ? 'position' : 'depth'}:</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((o) => (
              <button key={o} onClick={() => handle(o)} disabled={answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold font-mono">{o}{varId === 'V1' ? '%' : 'ms'}</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
