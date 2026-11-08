import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { playADSRNote, playMetronomeClick } from '../stimuli/rhythm-helper';
import { getAudioContext, getMasterBus } from '@kata/audio';

export function T3Estimation({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [guess, setGuess] = useState('');

  const varId = variable.id.split(':').pop() || 'V1';
  const bpm = Number(variableParams.tempo) || 100;
  const spb = 60 / bpm;
  const metronomeOn = variableParams.metronomeToggle === true;
  const metronomeVol = Number(variableParams.metronomeVolume) || 50;

  const ADSR = {
    attackTime: Number(variableParams.attackTime) || 10,
    decayTime: Number(variableParams.decayTime) || 100,
    sustainLevel: Number(variableParams.sustainLevel) || 70,
    releaseTime: Number(variableParams.releaseTime) || 100,
    toneColor: (variableParams.toneColor as string) || 'pure',
  };

  const ctx = getAudioContext();
  const bus = getMasterBus();

  let targetValue: number;
  let question: string;
  let unitLabel: string;
  let preDur: number;
  let tolerance: number;

  if (varId === 'V1') {
    question = 'Estimate the beat offset (in beats):';
    targetValue = 0.5;
    unitLabel = 'beats';
    tolerance = 0.05;
  } else if (varId === 'V2') {
    const durMin = Number(variableParams.durationMin) || 50;
    const durMax = Number(variableParams.durationMax) || 200;
    const granularity = Number(variableParams.durationGranularity) || 10;
    targetValue = Math.floor(Math.random() * (durMax - durMin + 1)) + durMin;
    targetValue = Math.round(targetValue / granularity) * granularity;
    question = 'Estimate the note duration (% of beat):';
    unitLabel = '% of beat';
    tolerance = granularity;
    preDur = 0;
  } else if (varId === 'V3') {
    const gapMin = Number(variableParams.gapMin) || 100;
    const gapMax = Number(variableParams.gapMax) || 500;
    const granularity = Number(variableParams.gapGranularity) || 10;
    targetValue = Math.floor(Math.random() * (gapMax - gapMin + 1)) + gapMin;
    targetValue = Math.round(targetValue / granularity) * granularity;
    question = 'Estimate the silent gap (% of beat):';
    unitLabel = '% of beat';
    tolerance = granularity;
    preDur = Number(variableParams.precedingDuration) || 50;
  } else {
    question = 'Estimate the tempo (BPM):';
    targetValue = bpm;
    unitLabel = 'BPM';
    tolerance = bpm * 0.15;
  }

  const scheduleNote = (when: number, freq: number, durSec: number) => {
    playADSRNote(freq, when, durSec, ADSR, 0.6);
  };

  const scheduleMetro = (when: number, numBeats: number) => {
    if (!metronomeOn) return;
    for (let b = 0; b < numBeats; b++) {
      playMetronomeClick(when + b * spb, metronomeVol / 100, b % 4 === 0);
    }
  };

  const totalSec = varId === 'V2' ? (targetValue / 100) * spb + 1.5 :
                   varId === 'V3' ? (preDur + targetValue + 200) / 1000 + 1.5 : 4;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    return {
      play: async (start: number) => {
        scheduleMetro(start, Math.ceil(totalSec / spb) + 1);

        if (varId === 'V2') {
          scheduleNote(start, 440, targetValue / 1000);
        } else if (varId === 'V3') {
          scheduleNote(start, 440, preDur / 1000);
          scheduleNote(start + preDur / 1000 + targetValue / 1000, 440, preDur / 1000);
        } else {
          const notes = [{ beat: 0, drum: 'click', velocity: 0.8 }, { beat: 1, drum: 'click', velocity: 0.6 }];
          for (const n of notes) {
            playADSRNote(440, start + n.beat * spb, 0.1, ADSR, 0.7);
          }
        }
      },
      stop: () => {},
    };
  };

  const handle = () => {
    if (answered) return;
    const g = Number(guess);
    if (isNaN(g) || g <= 0) return;
    setAnswered(true);
    const correct = Math.abs(g - targetValue) <= tolerance;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: g,
      correctResponse: targetValue,
    }), 700);
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId + '|' + targetValue}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView
            handle={h}
            visualisation="waveform"
            showVisualisation={taskConditions.showVisualisation}
            durationMs={totalSec * 1000}
          />
          <p className="text-lg mt-6 mb-4">{question}</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="w-32 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center font-mono text-lg"
            />
            <span className="font-mono text-xl text-neutral-500">{unitLabel}</span>
          </div>
          <button onClick={handle} disabled={answered || !guess} className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">CONFIRM</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
