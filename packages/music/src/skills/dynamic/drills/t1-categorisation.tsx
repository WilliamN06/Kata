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

export function T1Categorisation({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const soundSource = String(stimulusParams.soundSource ?? 'sine');
  const freq = Number(stimulusParams.frequency) || 1000;
  const dur = Number(stimulusParams.durationMs) || 800;

  // === Dispatch by variable ===
  let categories: string[] = [];
  let correct = '';
  let createStimulus: (ctx: AudioContext, dest: AudioNode) => any;
  let visualisation: 'spectrum' | 'waveform' | 'both' = 'waveform';
  let readouts: Array<{ label: string; value: string }> = [];

  if (varId === 'V1') {
    // Amplitude categorisation
    const db = Number(variableParams.referenceLevel) || -20;
    categories = ['< -40 dBFS', '-40 to -20 dBFS', '-20 to -6 dBFS', '-6 to 0 dBFS', '> 0 dBFS'];
    correct =
      db < -40 ? '< -40 dBFS' :
      db < -20 ? '-40 to -20 dBFS' :
      db < -6 ? '-20 to -6 dBFS' :
      db <= 0 ? '-6 to 0 dBFS' :
      '> 0 dBFS';
    createStimulus = (ctx, dest) => {
      const m = createAmplitudeStimulus({ frequency: freq, durationMs: dur, gainDb: db, soundSource }, ctx, dest);
      return m.handle;
    };
    visualisation = 'waveform';
    readouts = [{ label: 'LEVEL', value: db + ' dBFS' }];
  } else if (varId === 'V2') {
    // Envelope categorisation
    const attack = Number(variableParams.attackMs) || 5;
    const decay = Number(variableParams.decayMs) || 100;
    const sustain = Number(variableParams.sustainLevel) || 60;
    const release = Number(variableParams.releaseMs) || 50;
    categories = ['Percussive (fast attack, short decay)', 'Plucked (fast attack, medium decay)', 'Sustained (slow attack, long sustain)', 'Pad (very slow attack, long release)'];
    correct =
      attack < 20 && decay < 150 ? 'Percussive (fast attack, short decay)' :
      attack < 50 && sustain < 50 ? 'Plucked (fast attack, medium decay)' :
      attack < 200 && sustain > 60 ? 'Sustained (slow attack, long sustain)' :
      'Pad (very slow attack, long release)';
    createStimulus = (ctx, dest) => {
      const m = createEnvelopeStimulus({
        frequency: freq, attackMs: attack, decayMs: decay, sustainLevel: sustain,
        releaseMs: release, durationMs: 500, soundSource,
      }, ctx, dest);
      return m.handle;
    };
    visualisation = 'waveform';
    readouts = [
      { label: 'ATTACK', value: attack + 'ms' },
      { label: 'DECAY', value: decay + 'ms' },
      { label: 'SUSTAIN', value: sustain + '%' },
      { label: 'RELEASE', value: release + 'ms' },
    ];
  } else if (varId === 'V3') {
    // Masking categorisation
    const targetDb = Number(stimulusParams.targetLevel) || -20;
    const maskerDb = Number(stimulusParams.maskerLevel) || -15;
    const diff = maskerDb - targetDb;
    categories = ['Not masked', 'Partially masked', 'Fully masked'];
    correct = diff < 5 ? 'Not masked' : diff < 15 ? 'Partially masked' : 'Fully masked';
    createStimulus = (ctx, dest) => {
      const m = createMaskingStimulus({
        targetFreq: freq,
        targetDb,
        maskerFreq: Number(variableParams.maskerFrequency) || 1200,
        maskerDb,
        durationMs: dur,
        direction: (variableParams.direction as any) || 'simultaneous',
      }, ctx, dest);
      return m.handle;
    };
    visualisation = 'spectrum';
    readouts = [{ label: 'TARGET', value: targetDb + ' dB' }, { label: 'MASKER', value: maskerDb + ' dB' }];
  } else if (varId === 'V4') {
    // Dynamic span
    const span = Number(variableParams.rangeDb) || 20;
    categories = ['Compressed (< 10 dB)', 'Moderate (10–30 dB)', 'Wide (30–60 dB)', 'Full (> 60 dB)'];
    correct =
      span < 10 ? 'Compressed (< 10 dB)' :
      span < 30 ? 'Moderate (10–30 dB)' :
      span < 60 ? 'Wide (30–60 dB)' :
      'Full (> 60 dB)';
    createStimulus = (ctx, dest) => {
      const m = createDynamicSpanStimulus({
        frequency: freq, loundDb: -6, quietDb: -6 - span, durationMs: dur / 4, soundSource,
      }, ctx, dest);
      return m.handle;
    };
    visualisation = 'waveform';
    readouts = [{ label: 'SPAN', value: span + ' dB' }];
  } else if (varId === 'V5') {
    // Compression categorisation
    const compressed = Math.random() > 0.5;
    categories = ['Uncompressed', 'Compressed'];
    correct = compressed ? 'Compressed' : 'Uncompressed';
    createStimulus = (ctx, dest) => {
      const m = createCompressionStimulus({
        frequency: freq, durationMs: dur, compressed, soundSource,
      }, ctx, dest);
      return m.handle;
    };
    visualisation = 'waveform';
    readouts = [{ label: 'RATIO', value: (Number(variableParams.ratio) || 4) + ':1' }];
  } else {
    // V6 Freq-dependent
    const freqA = Number(variableParams.frequency) || 1000;
    const dbA = Number(variableParams.spl) || 60;
    categories = ['A louder', 'B louder', 'Same perceived loudness'];
    // Fletcher-Munson: midrange more sensitive
    const bFreq = freqA < 500 ? 3000 : 500;
    const bDb = dbA;
    const perceivedA = dbA + (freqA > 500 && freqA < 4000 ? 5 : 0);
    const perceivedB = bDb + (bFreq > 500 && bFreq < 4000 ? 5 : 0);
    correct =
      perceivedA > perceivedB + 2 ? 'A louder' :
      perceivedB > perceivedA + 2 ? 'B louder' :
      'Same perceived loudness';
    createStimulus = (ctx, dest) => {
      const m = createFreqDepStimulus({ freqA, dbA, freqB: bFreq, dbB: bDb, durationMs: dur }, ctx, dest);
      return m.handle;
    };
    visualisation = 'spectrum';
    readouts = [{ label: 'FREQ A', value: freqA + 'Hz @ ' + dbA + 'dB' }, { label: 'FREQ B', value: bFreq + 'Hz @ ' + bDb + 'dB' }];
  }

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId;

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
          <MusicStimulusView
            handle={h}
            visualisation={visualisation}
            showVisualisation={taskConditions.showVisualisation}
            durationMs={dur * 2}
            readouts={readouts.map((r) => ({ ...r, position: 'before' as const }))}
          />
          <p className="text-lg mt-6 mb-6">Categorise this {variable.name.toLowerCase()}:</p>
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
