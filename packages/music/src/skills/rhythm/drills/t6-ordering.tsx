import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { playADSRNote, playMetronomeClick } from '../stimuli/rhythm-helper';
import { getAudioContext, getMasterBus } from '@kata/audio';

export function T6Ordering({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [order, setOrder] = useState<number[]>([]);

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

  let values: number[];
  let question: string;

  if (varId === 'V2') {
    const durMin = Number(variableParams.durationMin) || 50;
    const durMax = Number(variableParams.durationMax) || 200;
    const granularity = Number(variableParams.durationGranularity) || 10;
    values = [];
    for (let v = durMin; v <= durMax; v += granularity) values.push(v);
    values.sort(() => Math.random() - 0.5);
    values = values.slice(0, 5);
    question = 'Order the note durations from shortest to longest:';
  } else if (varId === 'V3') {
    const gapMin = Number(variableParams.gapMin) || 100;
    const gapMax = Number(variableParams.gapMax) || 500;
    const granularity = Number(variableParams.gapGranularity) || 10;
    values = [];
    for (let v = gapMin; v <= gapMax; v += granularity) values.push(v);
    values.sort(() => Math.random() - 0.5);
    values = values.slice(0, 5);
    question = 'Order the silent gaps from shortest to longest:';
  } else {
    const tempos = [60, 90, 120, 150, 180].sort(() => Math.random() - 0.5);
    const handle = () => {
      if (answered) return;
      setAnswered(true);
      const sorted = [...order].sort((a, b) => a - b);
      const correct = order.every((v, i) => v === sorted[i]);
      setTimeout(() => onAnswer({
        correct,
        responseTimeMs: Date.now() - startTime.current,
        userResponse: order,
        correctResponse: sorted,
      }), 700);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <p className="text-lg mb-6">Order tempos from slowest to fastest:</p>
        <div className="flex gap-3 mb-6">
          {tempos.map((t) => (
            <button key={t} onClick={() => setOrder([...order, t])} disabled={order.includes(t) || answered} className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg font-mono font-semibold">{t} BPM</button>
          ))}
        </div>
        <p className="text-sm text-neutral-400 mb-6 font-mono">Order: {order.map((t) => t + ' BPM').join(' → ') || '—'}</p>
        <button onClick={handle} disabled={order.length !== tempos.length || answered} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">SUBMIT</button>
      </div>
    );
  }

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const sorted = [...order].sort((a, b) => a - b);
    const correct = order.every((v, i) => v === sorted[i]);
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: order,
      correctResponse: sorted,
    }), 700);
  };

  const allNotes: { value: number; notes: { beat: number; drum: string; velocity: number }[] }[] = values.map((val, i) => {
    const notes: { beat: number; drum: string; velocity: number }[] = [];
    if (varId === 'V2') {
      notes.push({ beat: 0, drum: 'click', velocity: 0.8 });
    } else if (varId === 'V3') {
      const preDur = 0.3;
      notes.push({ beat: 0, drum: 'click', velocity: 0.8 });
      notes.push({ beat: (preDur + val / 1000) / spb, drum: 'click', velocity: 0.8 });
    }
    return { value: val, notes };
  });

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId + '|' + values.join(',');

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    return {
      play: async (start: number) => {
        let offset = 0;
        for (const { notes } of allNotes) {
          for (const n of notes) {
            playADSRNote(440, start + offset + n.beat * spb, 0.1, ADSR, 0.6);
          }
          offset += varId === 'V2' ? values[allNotes.indexOf(notes)] / 1000 + 0.8 :
                        varId === 'V3' ? (Number(variableParams.precedingDuration) || 200 + values[allNotes.indexOf(notes)]) / 1000 + 0.8 : 1;
        }
      },
      stop: () => {},
    };
  };

  return (
    <MusicDrillWrapper createStimulus={createStimulus} dependencyKey={dependencyKey}>
      {(h) => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <MusicStimulusView
            handle={h}
            visualisation="waveform"
            showVisualisation={taskConditions.showVisualisation}
            durationMs={totalSec * 1000}
          />
          <p className="text-lg mt-6 mb-6">{question}</p>
          <div className="flex gap-3 mb-6 flex-wrap justify-center">
            {values.map((v) => (
              <button key={v} onClick={() => setOrder([...order, v])} disabled={order.includes(v) || answered} className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded-lg font-mono font-semibold">{v}%</button>
            ))}
          </div>
          <p className="text-sm text-neutral-400 mb-6 font-mono">Order: {order.map((o) => o + '%').join(' → ') || '—'}</p>
          <button onClick={handle} disabled={order.length !== values.length || answered} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">SUBMIT</button>
        </div>
      )}
    </MusicDrillWrapper>
  );
}
