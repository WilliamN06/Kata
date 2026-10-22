import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createSpatialPositionStimulus } from '../stimuli/spatial-helper';

export function T1Categorisation({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 500;

  const pan = varId === 'V1' ? (Number(variableParams.position) || 0) : 0;
  const depth = varId === 'V2' ? (Number(variableParams.depthMs) || 30) : 30;

  let categories: string[] = [];
  let correct = '';
  let visualisation: 'waveform' | 'spectrum' | 'none' = 'waveform';

  if (varId === 'V1') {
    categories = ['Far left', 'Left', 'Centre', 'Right', 'Far right'];
    correct =
      pan < -60 ? 'Far left' :
      pan < -20 ? 'Left' :
      pan < 20 ? 'Centre' :
      pan < 60 ? 'Right' :
      'Far right';
  } else {
    categories = ['Near (dry)', 'Slightly far', 'Far (wet)', 'Very far (distant)'];
    correct =
      depth < 10 ? 'Near (dry)' :
      depth < 50 ? 'Slightly far' :
      depth < 150 ? 'Far (wet)' :
      'Very far (distant)';
  }

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    if (varId === 'V1') {
      return createSpatialPositionStimulus({ pan, frequency: freq, durationMs: dur }, ctx, dest).handle;
    } else {
      return createSpatialDepthStimulus({ depthMs: depth, reverbType: 'room', frequency: freq, durationMs: dur }, ctx, dest).handle;
    }
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
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView handle={h} visualisation={visualisation} showVisualisation={taskConditions.showVisualisation} durationMs={dur + 200} />
          <p className="text-lg mt-6 mb-6">Where is this sound?</p>
          <div className="flex flex-wrap gap-3 justify-center max-w-lg">
            {categories.map((c) => (
              <button key={c} onClick={() => handle(c)} disabled={answered} className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold text-sm">{c}</button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
