import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { playADSRNote, playMetronomeClick } from '../stimuli/rhythm-helper';
import { getAudioContext, getMasterBus } from '@kata/audio';

export function T2Discrimination({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
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

  let isDiff: boolean;
  let targetVal: number;
  let altVal: number;
  let question: string;

  if (varId === 'V2') {
    const durMin = Number(variableParams.durationMin) || 100;
    const durMax = Number(variableParams.durationMax) || 500;
    const baseDur = Math.floor(Math.random() * (durMax - durMin + 1)) + durMin;
    targetVal = baseDur;
    isDiff = Math.random() > 0.5;
    altVal = isDiff ? Math.floor(Math.random() * (durMax - durMin + 1)) + durMin : baseDur;
    question = 'Are the two note durations the same?';
  } else if (varId === 'V3') {
    const gapMin = Number(variableParams.gapMin) || 100;
    const gapMax = Number(variableParams.gapMax) || 500;
    const baseGap = Math.floor(Math.random() * (gapMax - gapMin + 1)) + gapMin;
    targetVal = baseGap;
    isDiff = Math.random() > 0.5;
    altVal = isDiff ? Math.floor(Math.random() * (gapMax - gapMin + 1)) + gapMin : baseGap;
    question = 'Are the two silent gaps the same?';
  } else {
    isDiff = Math.random() > 0.5;
    targetVal = 0;
    altVal = 0;
    question = 'Are the two rhythms the same?';
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

  const totalSec = varId === 'V2' || varId === 'V3' ? Math.max(targetVal, altVal) / 1000 + 1.5 : 4;

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    return {
      play: async (start: number) => {
        scheduleMetro(start, Math.ceil(totalSec / spb) + 1);

        if (varId === 'V2') {
          scheduleNote(start, 440, targetVal / 1000);
          scheduleNote(start + targetVal / 1000 + 0.5, 440, targetVal / 1000);
        } else if (varId === 'V3') {
          const preDur = 0.4;
          scheduleNote(start, 440, preDur);
          scheduleNote(start + preDur + targetVal / 1000, 440, preDur);
        } else {
          const notes = [{ beat: 0, drum: 'click', velocity: 0.8 }, { beat: 1, drum: 'click', velocity: 0.6 }];
          for (const n of notes) {
            playADSRNote(440, start + n.beat * spb, 0.1, ADSR, 0.7);
          }
        }

        setTimeout(async () => {
          const startB = start + totalSec;
          scheduleMetro(startB, Math.ceil(totalSec / spb) + 1);

          if (varId === 'V2') {
            scheduleNote(startB, 440, altVal / 1000);
            scheduleNote(startB + altVal / 1000 + 0.5, 440, altVal / 1000);
          } else if (varId === 'V3') {
            const preDur = 0.4;
            scheduleNote(startB, 440, preDur);
            scheduleNote(startB + preDur + altVal / 1000, 440, preDur);
          } else {
            const notes = [{ beat: 0, drum: 'click', velocity: 0.8 }, { beat: 1, drum: 'click', velocity: 0.6 }];
            for (const n of notes) {
              playADSRNote(440, startB + n.beat * spb, 0.1, ADSR, 0.7);
            }
          }
        }, totalSec * 1000);
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
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId + '|' + isDiff}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView
            handle={h}
            visualisation="waveform"
            showVisualisation={taskConditions.showVisualisation}
            durationMs={totalSec * 2 * 1000}
            label="♪ PLAY"
            playButtons={[
              { label: '♪ PLAY A', variant: 'A' },
              { label: '♪ PLAY B', variant: 'B' },
              { label: '♪ PLAY BOTH', variant: 'target' },
            ]}
            onPlayAt={async (btn) => {
              const c = getAudioContext();
              const d = getMasterBus();
              if (btn.variant === 'A') {
                const s = createStimulus(c, d);
                await s.play(startTime.current + 0.1, 1);
              } else if (btn.variant === 'B') {
                const startB = ctx.currentTime + 0.1;
                scheduleMetro(startB, Math.ceil(totalSec / spb) + 1);
                if (varId === 'V2') {
                  scheduleNote(startB, 440, altVal / 1000);
                  scheduleNote(startB + altVal / 1000 + 0.5, 440, altVal / 1000);
                } else if (varId === 'V3') {
                  const preDur = 0.4;
                  scheduleNote(startB, 440, preDur);
                  scheduleNote(startB + preDur + altVal / 1000, 440, preDur);
                }
              } else {
                const s = createStimulus(c, d);
                await s.play(startTime.current + 0.1, 1);
              }
            }}
          />
          <p className="text-lg mt-6 mb-6">{question}</p>
          <div className="flex gap-4">
            <button onClick={() => handle(false)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">SAME</button>
            <button onClick={() => handle(true)} disabled={answered} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
          </div>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
