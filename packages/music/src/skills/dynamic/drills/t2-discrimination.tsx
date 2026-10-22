import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createAmplitudeStimulus } from '../stimuli/amplitude';
import { createEnvelopeStimulus } from '../stimuli/envelope';
import { createMaskingStimulus } from '../stimuli/masking';
import { createDynamicSpanStimulus } from '../stimuli/dynamic-span';
import { createCompressionStimulus } from '../stimuli/compression';
import { createFreqDepStimulus } from '../stimuli/freq-dep-amplitude';

export function T2Discrimination({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const soundSource = String(stimulusParams.soundSource ?? 'sine');
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 800;
  const offset = Number(variableParams.offset) || 3;
  const refDb = Number(variableParams.referenceLevel) || -20;

  const isDiff = useMemo(() => Math.random() > 0.5, []);

  let playMethodsRef: any = null;
  let visualisation: 'spectrum' | 'waveform' | 'both' = 'waveform';
  let readouts: Array<{ label: string; value: string }> = [];

  // Variable-specific setup
  if (varId === 'V1') {
    visualisation = 'waveform';
    readouts = [
      { label: 'A', value: refDb + ' dBFS' },
      { label: 'B', value: (isDiff ? refDb + offset : refDb) + ' dBFS' },
    ];
  } else if (varId === 'V2') {
    visualisation = 'waveform';
    readouts = [
      { label: 'A', value: 'ADSR 1' },
      { label: 'B', value: isDiff ? 'ADSR 2' : 'ADSR 1' },
    ];
  } else if (varId === 'V3') {
    visualisation = 'spectrum';
    readouts = [
      { label: 'TRIAL A', value: isDiff ? 'MASKED' : 'CLEAR' },
      { label: 'TRIAL B', value: 'COMPARE' },
    ];
  } else if (varId === 'V4') {
    visualisation = 'waveform';
    readouts = [{ label: 'SPAN', value: (isDiff ? 40 : 20) + ' dB' }];
  } else if (varId === 'V5') {
    visualisation = 'waveform';
    readouts = [{ label: 'TEST', value: isDiff ? 'DIFFERENT' : 'SAME' }];
  } else if (varId === 'V6') {
    visualisation = 'spectrum';
    readouts = [{ label: 'A/B', value: 'freq comparison' }];
  }

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId + '|' + isDiff;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    let methods: any;

    if (varId === 'V1') {
      methods = createAmplitudeStimulus({
        frequency: freq, durationMs: dur, gainDb: refDb, secondGainDb: isDiff ? refDb + offset : refDb, soundSource,
      }, ctx, dest);
    } else if (varId === 'V2') {
      methods = createEnvelopeStimulus({
        frequency: freq, attackMs: Number(variableParams.attackMs) || 10,
        decayMs: Number(variableParams.decayMs) || 100,
        sustainLevel: Number(variableParams.sustainLevel) || 60,
        releaseMs: Number(variableParams.releaseMs) || 50,
        durationMs: 400, soundSource,
        secondEnvelope: isDiff ? {
          frequency: freq, attackMs: 100, decayMs: 200, sustainLevel: 40, releaseMs: 100, durationMs: 400,
        } : undefined,
      }, ctx, dest);
    } else if (varId === 'V3') {
      methods = createMaskingStimulus({
        targetFreq: freq, targetDb: -20,
        maskerFreq: 1200, maskerDb: isDiff ? -5 : -20,
        durationMs: dur, direction: 'simultaneous',
      }, ctx, dest);
    } else if (varId === 'V4') {
      methods = createDynamicSpanStimulus({
        frequency: freq, loundDb: -6, quietDb: isDiff ? -46 : -26, durationMs: dur / 4, soundSource,
      }, ctx, dest);
    } else if (varId === 'V5') {
      methods = createCompressionStimulus({
        frequency: freq, durationMs: dur, compressed: isDiff, compareWithUncompressed: true,
      }, ctx, dest);
    } else {
      methods = createFreqDepStimulus({
        freqA: 1000, dbA: 60, freqB: 4000, dbB: isDiff ? 50 : 60, durationMs: dur,
      }, ctx, dest);
    }

    playMethodsRef = methods;
    return methods.handle;
  };

  const handlePlayAt = async (btn: { variant?: string }) => {
    if (!playMethodsRef) return;
    if (btn.variant === 'A' && playMethodsRef.playA) await playMethodsRef.playA();
    else if (btn.variant === 'B' && playMethodsRef.playB) await playMethodsRef.playB();
    else if (playMethodsRef.playBoth) await playMethodsRef.playBoth();
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

  const hasBoth = !!(playMethodsRef?.playA && playMethodsRef?.playB);

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView
            handle={h}
            visualisation={visualisation}
            showVisualisation={taskConditions.showVisualisation}
            durationMs={dur * 2 + 300}
            playButtons={[
              { label: '♪ PLAY A', variant: 'A' },
              { label: '♪ PLAY B', variant: 'B' },
              { label: '♪ PLAY BOTH', variant: 'target' },
            ]}
            onPlayAt={handlePlayAt}
            readouts={readouts.map((r) => ({ ...r, position: 'before' as const }))}
          />
          <p className="text-lg mt-6 mb-6">Are A and B the same {variable.name.toLowerCase()}?</p>
          <div className="flex gap-4">
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">SAME</button>
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
