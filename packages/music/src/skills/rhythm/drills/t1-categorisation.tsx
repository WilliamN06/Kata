import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createRhythmStimulus, type RhythmNote, type DrumSound, playADSRNote } from '../stimuli/rhythm-helper';

export function T1Categorisation({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const bpm = Number(variableParams.tempo) || 100;
  const spb = 60 / bpm;
  const drum = (stimulusParams.drumSound as DrumSound) || 'click';
  const meterNum = Number(variableParams.meterNumerator) || 4;
  const metronomeOn = variableParams.metronomeToggle === true;
  const metronomeVol = Number(variableParams.metronomeVolume) || 50;

  const ADSR = {
    attackTime: Number(variableParams.attackTime) || 10,
    decayTime: Number(variableParams.decayTime) || 100,
    sustainLevel: Number(variableParams.sustainLevel) || 70,
    releaseTime: Number(variableParams.releaseTime) || 100,
    toneColor: (variableParams.toneColor as string) || 'pure',
  };

  let categories: string[] = [];
  let correct = '';
  let notes: RhythmNote[] = [];
  let extraNote: RhythmNote | null = null;

  if (varId === 'V1') {
    const offsetBeat = Math.random() * 0.5;
    notes = [{ beat: offsetBeat, drum, velocity: 0.8 }];
    categories = ['On beat', 'Early (< 1/8 offset)', 'Late (< 1/8 offset)', 'Way off (> 1/4 offset)'];
    correct = offsetBeat < 0.05 ? 'On beat' : offsetBeat < 0.25 ? 'Early (< 1/8 offset)' : offsetBeat < 0.5 ? 'Late (< 1/8 offset)' : 'Way off (> 1/4 offset)';
  } else if (varId === 'V2') {
    const durMin = Number(variableParams.durationMin) || 50;
    const durMax = Number(variableParams.durationMax) || 200;
    const durPercent = Math.floor(Math.random() * (durMax - durMin + 1)) + durMin;
    const durMs = (durPercent / 100) * spb * 1000;
    notes = [{ beat: 0, drum, velocity: 0.8 }];
    extraNote = { beat: durMs / 1000 / spb, drum: 'click', velocity: 0.3 };
    categories = ['Short', 'Medium', 'Long'];
    correct = durMs < durMin + (durMax - durMin) / 3 ? 'Short' : durMs < durMax - (durMax - durMin) / 3 ? 'Medium' : 'Long';
  } else if (varId === 'V3') {
    const gapMin = Number(variableParams.gapMin) || 100;
    const gapMax = Number(variableParams.gapMax) || 500;
    const gapPercent = Math.floor(Math.random() * (gapMax - gapMin + 1)) + gapMin;
    const gapMs = (gapPercent / 100) * spb * 1000;
    const preSec = Number(variableParams.precedingDuration) || 50;
    notes = [
      { beat: 0, drum, velocity: 0.8 },
      { beat: preSec / spb, drum: 'click', velocity: 0.3 },
      { beat: (preSec + gapMs) / spb, drum: 'click', velocity: 0.3 },
    ];
    categories = ['Short', 'Medium', 'Long'];
    correct = gapMs < gapMin + (gapMax - gapMin) / 3 ? 'Short' : gapMs < gapMax - (gapMax - gapMin) / 3 ? 'Medium' : 'Long';
  } else if (varId === 'V4') {
    categories = ['2/4 (duple)', '3/4 (triple)', '4/4 (quadruple)', '5/4 or 7/4 (odd)'];
    correct = meterNum === 2 ? '2/4 (duple)' : meterNum === 3 ? '3/4 (triple)' : meterNum === 4 ? '4/4 (quadruple)' : '5/4 or 7/4 (odd)';
    notes = Array.from({ length: meterNum * 2 }, (_, i) => ({
      beat: i,
      drum,
      velocity: i % meterNum === 0 ? 0.9 : 0.5,
    }));
  } else {
    categories = ['Straight', 'Syncopated', 'Polyrhythm (3:2)', 'Polyrhythm (5:4)'];
    const type = (variableParams.type as string) || 'syncopation';
    correct =
      type === 'syncopation' ? 'Syncopated' :
      type === 'polyrhythm' ? 'Polyrhythm (3:2)' :
      'Straight';
    notes = [
      { beat: 0, drum, velocity: 0.8 },
      { beat: 0.75, drum, velocity: 0.6 },
      { beat: 1.5, drum, velocity: 0.8 },
      { beat: 2.25, drum, velocity: 0.6 },
    ];
  }

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId + '|' + notes.map(n => n.beat).join(',');

  const createStimulus = (ctx: AudioContext, dest: AudioNode) => {
    const spb = 60 / bpm;

    const schedule = async (when: number) => {
      if (metronomeOn) {
        const maxBeat = Math.max(...notes.map(n => n.beat), extraNote ? extraNote.beat : 0) + 1;
        for (let b = 0; b <= maxBeat; b++) {
          const isDownbeat = b % meterNum === 0;
          const clickTime = when + b * spb;
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.value = isDownbeat ? 1200 : 800;
          const g = ctx.createGain();
          g.gain.setValueAtTime(metronomeVol / 100, clickTime);
          g.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.05);
          osc.connect(g);
          g.connect(dest);
          osc.start(clickTime);
          osc.stop(clickTime + 0.05);
        }
      }

      for (const note of notes) {
        const hitTime = when + note.beat * spb;
        const wave = (['sine', 'triangle', 'sawtooth', 'square'].includes(ADSR.toneColor) ? ADSR.toneColor : 'sine') as OscillatorType;
        const osc = ctx.createOscillator();
        osc.type = wave;
        osc.frequency.value = 440;
        const g = ctx.createGain();
        const a = ADSR.attackTime / 1000;
        const d = ADSR.decayTime / 1000;
        const r = ADSR.releaseTime / 1000;
        const s = ADSR.sustainLevel / 100;
        const noteDurSec = 0.4;
        const attackEnd = hitTime + a;
        const decayEnd = attackEnd + d;
        const sustainStart = decayEnd;
        const sustainEnd = Math.max(sustainStart, hitTime + noteDurSec - r);
        const releaseEnd = sustainEnd + r;
        g.gain.setValueAtTime(0, hitTime);
        g.gain.linearRampToValueAtTime(ADSR.sustainLevel / 100 * 0.7, attackEnd);
        g.gain.linearRampToValueAtTime(ADSR.sustainLevel / 100 * 0.7, sustainStart);
        g.gain.setValueAtTime(gain * 0.7 * s, sustainEnd);
        g.gain.linearRampToValueAtTime(0, releaseEnd);
        osc.connect(g);
        g.connect(dest);
        osc.start(hitTime);
        osc.stop(releaseEnd + 0.05);
      }

      if (extraNote) {
        const hitTime = when + extraNote.beat * spb;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 440;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.3, hitTime);
        g.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.1);
        osc.connect(g);
        g.connect(dest);
        osc.start(hitTime);
        osc.stop(hitTime + 0.1);
      }
    };

    return {
      play: async (start: number) => {
        await schedule(start);
      },
      stop: () => {},
    };
  };

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
            visualisation="waveform"
            showVisualisation={taskConditions.showVisualisation}
            durationMs={4000}
            readouts={[{ label: 'BPM', value: bpm.toString() }, { label: 'DRUM', value: drum }]}
          />
          <p className="text-lg mt-6 mb-6">Categorise this rhythm:</p>
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
