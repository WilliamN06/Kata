import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createSpatialPositionStimulus, createSpatialDepthStimulus } from '../stimuli/spatial-helper';
import { getAudioContext, getMasterBus } from '@kata/audio';

export function T2Discrimination({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 500;
  const isDiff = useMemo(() => Math.random() > 0.5, []);

  // For spatial position: one side vs the other
  const panA = -50;
  const panB = isDiff ? 50 : -50;

  // For depth: near vs far
  const depthA = 10;
  const depthB = isDiff ? 100 : 10;

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId + '|' + isDiff;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    // The handle's `play` needs to play BOTH sequentially so the "PLAY BOTH" button works
    const playAt = (pan: number, when: number) => {
      if (varId === 'V1') {
        const m = createSpatialPositionStimulus({ pan, frequency: freq, durationMs: dur }, ctx, dest);
        // schedule at absolute time — need to use lower-level
        // For simplicity, just play immediately
        m.playA();
      } else {
        const m = createSpatialDepthStimulus({ depthMs: pan, frequency: freq, durationMs: dur }, ctx, dest);
        m.playA();
      }
    };

    return {
      play: async (start) => {
        if (varId === 'V1') {
          createSpatialPositionStimulus({ pan: panA, frequency: freq, durationMs: dur }, ctx, dest).playA();
          setTimeout(() => {
            createSpatialPositionStimulus({ pan: panB, frequency: freq, durationMs: dur }, ctx, dest).playA();
          }, dur + 300);
        } else {
          createSpatialDepthStimulus({ depthMs: depthA, frequency: freq, durationMs: dur }, ctx, dest).playA();
          setTimeout(() => {
            createSpatialDepthStimulus({ depthMs: depthB, frequency: freq, durationMs: dur }, ctx, dest).playA();
          }, dur + 300 + 500);
        }
      },
      stop: () => {},
    };
  };

  const handlePlayAt = async (btn: { variant?: string }) => {
    const ctx = getAudioContext();
    const bus = getMasterBus();
    if (varId === 'V1') {
      if (btn.variant === 'A') await createSpatialPositionStimulus({ pan: panA, frequency: freq, durationMs: dur }, ctx, bus).playA();
      else if (btn.variant === 'B') await createSpatialPositionStimulus({ pan: panB, frequency: freq, durationMs: dur }, ctx, bus).playA();
      else {
        // Play A, then B sequentially
        await createSpatialPositionStimulus({ pan: panA, frequency: freq, durationMs: dur }, ctx, bus).playA();
        setTimeout(() => {
          createSpatialPositionStimulus({ pan: panB, frequency: freq, durationMs: dur }, ctx, bus).playA();
        }, dur * 1000 + 300);
      }
    } else {
      if (btn.variant === 'A') await createSpatialDepthStimulus({ depthMs: depthA, frequency: freq, durationMs: dur }, ctx, bus).playA();
      else if (btn.variant === 'B') await createSpatialDepthStimulus({ depthMs: depthB, frequency: freq, durationMs: dur }, ctx, bus).playA();
      else {
        await createSpatialDepthStimulus({ depthMs: depthA, frequency: freq, durationMs: dur }, ctx, bus).playA();
        setTimeout(() => {
          createSpatialDepthStimulus({ depthMs: depthB, frequency: freq, durationMs: dur }, ctx, bus).playA();
        }, dur * 1000 + 500);
      }
    }
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
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView
            handle={h}
            visualisation="waveform"
            showVisualisation={taskConditions.showVisualisation}
            durationMs={dur * 2 + 800}
            playButtons={[
              { label: '♪ PLAY A', variant: 'A' },
              { label: '♪ PLAY B', variant: 'B' },
              { label: '♪ PLAY BOTH', variant: 'target' },
            ]}
            onPlayAt={handlePlayAt}
            readouts={[
              { label: 'A', value: varId === 'V1' ? (panA < 0 ? 'Left' : 'Right') : (depthA + 'ms'), position: 'before' as const },
              { label: 'B', value: varId === 'V1' ? (panB < 0 ? 'Left' : 'Right') : (depthB + 'ms'), position: 'after' as const },
            ]}
          />
          <p className="text-lg mt-6 mb-6">Are A and B the same?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">SAME</button>
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
