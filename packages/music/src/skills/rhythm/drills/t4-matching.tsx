import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { playADSRNote } from '../stimuli/rhythm-helper';
import { getAudioContext, getMasterBus } from '@kata/audio';

export function T4Matching({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
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
    targetValue = Math.floor(Math.random() * (durMax - durMin + 1)) + durMin;
    targetValue = Math.round(targetValue / Number(variableParams.durationGranularity || 10)) * Number(variableParams.durationGranularity);
    question = 'Which duration matches the target?';
  } else if (varId === 'V3') {
    const gapMin = Number(variableParams.gapMin) || 100;
    const gapMax = Number(variableParams.gapMax) || 500;
    targetValue = Math.floor(Math.random() * (gapMax - gapMin + 1)) + gapMin;
    targetValue = Math.round(targetValue / Number(variableParams.gapGranularity || 10)) * Number(variableParams.gapGranularity);
    question = 'Which gap matches the target?';
  } else {
    targetValue = 0;
    question = 'Which pattern matches the target?';
  }

  const options = useMemo(() => {
    const opts: number[] = [targetValue];
    while (opts.length < 4) {
      const jitter = targetValue * (0.5 + Math.random());
      const val = Math.max(10, Math.round(jitter / 10) * 10);
      if (!opts.includes(val)) opts.push(val);
    }
    return opts.sort(() => Math.random() - 0.5);
  }, [targetValue, varId]);

  const correctIdx = options.indexOf(targetValue);

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
                   varId === 'V3' ? (Number(variableParams.precedingDuration) || 200 + targetValue + 200) / 1000 + 1.5 : 4;

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

  const handle = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = idx === correctIdx;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: options[idx],
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
            label="♪ PLAY TARGET"
          />
          <p className="text-lg mt-6 mb-6">{question}</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((val, i) => (
              <button key={i} onClick={() => handle(i)} disabled={answered} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">
                {varId === 'V2' || varId === 'V3' ? val + '% of beat' : 'Pattern ' + String.fromCharCode(65 + i)}
              </button>
            ))}
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
