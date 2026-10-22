import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createRhythmStimulus, type RhythmNote, type DrumSound } from '../stimuli/rhythm-helper';

export function T2Discrimination({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const bpm = Number(variableParams.tempo) || 100;
  const drum = (stimulusParams.drumSound as DrumSound) || 'click';
  const isDiff = useMemo(() => Math.random() > 0.5, []);

  const patternA: RhythmNote[] = [
    { beat: 0, drum, velocity: 0.8 },
    { beat: 1, drum, velocity: 0.6 },
    { beat: 2, drum, velocity: 0.8 },
  ];
  const patternB: RhythmNote[] = isDiff
    ? [
        { beat: 0, drum, velocity: 0.8 },
        { beat: 1.5, drum, velocity: 0.6 },
        { beat: 2.5, drum, velocity: 0.8 },
      ]
    : patternA;

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId + '|' + isDiff;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    const a = createRhythmStimulus({ notes: patternA, bpm }, ctx, dest);
    const b = createRhythmStimulus({ notes: patternB, bpm }, ctx, dest);
    return {
      play: async (start: number, _duration: number) => {
        await a.playPattern();
        setTimeout(() => b.playPattern(), 3000);
      },
      stop: () => {},
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
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView
            handle={h}
            visualisation="waveform"
            showVisualisation={taskConditions.showVisualisation}
            durationMs={6000}
            label="♪ PLAY"
            playButtons={[
              { label: '♪ PLAY A', variant: 'A' },
              { label: '♪ PLAY B', variant: 'B' },
              { label: '♪ PLAY BOTH', variant: 'target' },
            ]}
            onPlayAt={async (btn) => {
              if (btn.variant === 'A') await createRhythmStimulus({ notes: patternA, bpm }, (await import('@kata/audio')).getAudioContext(), (await import('@kata/audio')).getMasterBus()).playPattern();
              else if (btn.variant === 'B') await createRhythmStimulus({ notes: patternB, bpm }, (await import('@kata/audio')).getAudioContext(), (await import('@kata/audio')).getMasterBus()).playPattern();
              else {
                const a2 = createRhythmStimulus({ notes: patternA, bpm }, (await import('@kata/audio')).getAudioContext(), (await import('@kata/audio')).getMasterBus());
                const b2 = createRhythmStimulus({ notes: patternB, bpm }, (await import('@kata/audio')).getAudioContext(), (await import('@kata/audio')).getMasterBus());
                await a2.playPattern();
                setTimeout(() => b2.playPattern(), 3000);
              }
            }}
          />
          <p className="text-lg mt-6 mb-6">Are the two rhythms the same?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">SAME</button>
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}

