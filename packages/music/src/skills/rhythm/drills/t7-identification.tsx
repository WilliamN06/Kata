import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { playADSRNote, playMetronomeClick } from '../stimuli/rhythm-helper';
import { getAudioContext, getMasterBus } from '@kata/audio';

export function T7Identification({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

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

  if (varId === 'V2') {
    const durMin = Number(variableParams.durationMin) || 50;
    const durMax = Number(variableParams.durationMax) || 200;
    const granularity = Number(variableParams.durationGranularity) || 10;
    targetValue = Math.floor(Math.random() * (durMax - durMin + 1)) + durMin;
    targetValue = Math.round(targetValue / granularity) * granularity;
    question = 'Which duration matches the target?';
  } else if (varId === 'V3') {
    const gapMin = Number(variableParams.gapMin) || 100;
    const gapMax = Number(variableParams.gapMax) || 500;
    const granularity = Number(variableParams.gapGranularity) || 10;
    targetValue = Math.floor(Math.random() * (gapMax - gapMin + 1)) + gapMin;
    targetValue = Math.round(targetValue / granularity) * granularity;
    question = 'Which gap matches the target?';
  } else {
    targetValue = bpm;
    question = 'What tempo is this?';
  }

  const options = useMemo(() => {
    const pool: number[] = [targetValue];
    while (pool.length < 4) {
      const jitter = targetValue * (0.3 + Math.random() * 0.7);
      const val = Math.max(10, Math.round(jitter / 10) * 10);
      if (!pool.includes(val)) pool.push(val);
    }
    return pool.sort(() => Math.random() - 0.5).slice(0, 4);
  }, [targetValue, varId]);

  const correctOption = targetValue;

  const scheduleNote = (when: number, freq: number, durSec: number) => {
    playADSRNote(freq, when, durSec, ADSR, 0.6);
  };

  const scheduleMetro = (when: number, numBeats: number) => {
    if (!metronomeOn) return;
    for (let b = 0; b < numBeats; b++) {
      playMetronomeClick(when + b * spb, metronomeVol / 100, b % 4 === 0);
    }
  };

  const totalSec = varId === 'V2' ? targetValue / 1000 + 1.5 :
                   varId === 'V3' ? (Number(variableParams.precedingDuration) || 200 + targetValue + 200) / 1000 + 1.5 : 5;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    return {
      play: async (start: number) => {
        scheduleMetro(start, Math.ceil(totalSec / spb) + 1);

        if (varId === 'V2') {
          scheduleNote(start, 440, targetValue / 1000);
        } else if (varId === 'V3') {
          const preDur = Number(variableParams.precedingDuration) || 200;
          scheduleNote(start, 440, preDur / 1000);
          scheduleNote(start + preDur / 1000 + targetValue / 1000, 440, preDur / 1000);
        } else {
          const notes = Array.from({ length: 8 }, (_, i) => ({ beat: i, drum: 'click', velocity: 0.7 }));
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = 440;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.5, start);
          g.gain.linearRampToValueAtTime(0, start + 0.5);
          osc.connect(g);
          g.connect(dest);
          osc.start(start);
          osc.stop(start + 0.5);
        }
      },
      stop: () => {},
    };
  };

  const handle = (choice: number) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: choice === correctOption,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: choice,
      correctResponse: correctOption,
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
          <p className="text-lg mt-6 mb-6">{question}</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((o) => (
              <button key={o} onClick={() => handle(o)} disabled={answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold font-mono">
                {varId === 'V2' || varId === 'V3' ? o + '% of beat' : o + ' BPM'}
              </button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
