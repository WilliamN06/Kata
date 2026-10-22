import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createAmplitudeStimulus } from '../stimuli/amplitude';
import { createEnvelopeStimulus } from '../stimuli/envelope';
import { createMaskingStimulus } from '../stimuli/masking';
import { createDynamicSpanStimulus } from '../stimuli/dynamic-span';
import { createCompressionStimulus } from '../stimuli/compression';
import { createFreqDepStimulus } from '../stimuli/freq-dep-amplitude';

export function T3Estimation({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [guess, setGuess] = useState(-20);

  const varId = variable.id.split(':').pop() || 'V1';
  const soundSource = String(stimulusParams.soundSource ?? 'sine');
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 800;

  let targetValue = 0;
  let minVal = 0;
  let maxVal = 100;
  let unit = '';
  let question = '';
  let visualisation: 'spectrum' | 'waveform' | 'both' = 'waveform';

  if (varId === 'V1') {
    targetValue = Number(variableParams.referenceLevel) || -20;
    minVal = -80; maxVal = 0; unit = 'dBFS';
    question = 'Estimate the amplitude in dBFS:';
  } else if (varId === 'V2') {
    targetValue = Number(variableParams.attackMs) || 10;
    minVal = 0; maxVal = 500; unit = 'ms';
    question = 'Estimate the attack time in ms:';
  } else if (varId === 'V3') {
    targetValue = Number(stimulusParams.maskerLevel) || -15;
    minVal = -80; maxVal = 0; unit = 'dB masker';
    question = 'Estimate the masker level in dB:';
    visualisation = 'spectrum';
  } else if (varId === 'V4') {
    targetValue = Number(variableParams.rangeDb) || 20;
    minVal = 0; maxVal = 80; unit = 'dB';
    question = 'Estimate the dynamic range in dB:';
  } else if (varId === 'V5') {
    targetValue = Number(variableParams.ratio) || 4;
    minVal = 1; maxVal = 20; unit = ':1 ratio';
    question = 'Estimate the compression ratio:';
  } else {
    targetValue = Number(variableParams.frequency) || 1000;
    minVal = 20; maxVal = 8000; unit = 'Hz';
    question = 'Estimate the higher-frequency tone in Hz:';
    visualisation = 'spectrum';
  }

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    if (varId === 'V1') return createAmplitudeStimulus({ frequency: freq, durationMs: dur, gainDb: targetValue, soundSource }, ctx, dest).handle;
    if (varId === 'V2') return createEnvelopeStimulus({
      frequency: freq, attackMs: targetValue, decayMs: Number(variableParams.decayMs) || 100,
      sustainLevel: Number(variableParams.sustainLevel) || 60, releaseMs: Number(variableParams.releaseMs) || 50,
      durationMs: 400, soundSource,
    }, ctx, dest).handle;
    if (varId === 'V3') return createMaskingStimulus({
      targetFreq: freq, targetDb: -20, maskerFreq: 1200, maskerDb: targetValue,
      durationMs: dur, direction: 'simultaneous',
    }, ctx, dest).handle;
    if (varId === 'V4') return createDynamicSpanStimulus({
      frequency: freq, loundDb: -6, quietDb: -6 - targetValue, durationMs: dur / 4, soundSource,
    }, ctx, dest).handle;
    if (varId === 'V5') return createCompressionStimulus({
      frequency: freq, durationMs: dur, compressed: true, compressionRatio: targetValue,
    }, ctx, dest).handle;
    return createFreqDepStimulus({ freqA: 1000, dbA: 60, freqB: targetValue, dbB: 60, durationMs: dur }, ctx, dest).handle;
  };

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const tolerance = (maxVal - minVal) * 0.15;
    const correct = Math.abs(guess - targetValue) <= tolerance;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: guess,
      correctResponse: targetValue,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView
            handle={h}
            visualisation={visualisation}
            showVisualisation={taskConditions.showVisualisation}
            durationMs={dur}
            readouts={[{ label: 'ACTUAL', value: targetValue + ' ' + unit }]}
          />
          <p className="text-lg mt-6 mb-4">{question}</p>
          <input type="range" min={minVal} max={maxVal} step={1} value={guess} onChange={(e) => setGuess(Number(e.target.value))} className="w-80" />
          <p className="text-sm text-neutral-400 mt-2 font-mono">{guess} {unit}</p>
          <button onClick={handle} disabled={answered} className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">CONFIRM</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
