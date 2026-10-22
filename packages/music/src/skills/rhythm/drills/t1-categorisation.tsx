import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { createRhythmStimulus, type RhythmNote, type DrumSound } from '../stimuli/rhythm-helper';

export function T1Categorisation({ variable, variableParams, stimulusParams, taskConditions, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

  const varId = variable.id.split(':').pop() || 'V1';
  const bpm = Number(variableParams.tempo) || 100;
  const drum = (stimulusParams.drumSound as DrumSound) || 'click';
  const meterNum = Number(stimulusParams.meterNumerator) || 4;

  let categories: string[] = [];
  let correct = '';
  let notes: RhythmNote[] = [];

  if (varId === 'V1') {
    // Onset categorisation — when is the click relative to beat?
    const offsetBeat = Math.random() * 0.5;
    notes = [{ beat: offsetBeat, drum, velocity: 0.8 }];
    categories = ['On beat', 'Early (< 1/8 offset)', 'Late (< 1/8 offset)', 'Way off (> 1/4 offset)'];
    correct = offsetBeat < 0.05 ? 'On beat' : offsetBeat < 0.25 ? 'Early (< 1/8 offset)' : offsetBeat < 0.5 ? 'Late (< 1/8 offset)' : 'Way off (> 1/4 offset)';
  } else if (varId === 'V2') {
    // Duration categorisation — short vs long note
    const short = Math.random() > 0.5;
    const duration = short ? 0.1 : 1.5;
    notes = [
      { beat: 0, drum, velocity: 0.8 },
      { beat: duration, drum: 'click', velocity: 0.3 },
    ];
    categories = ['Short (< 0.25 beats)', 'Medium (0.25–1 beat)', 'Long (> 1 beat)'];
    correct = duration < 0.25 ? 'Short (< 0.25 beats)' : duration < 1 ? 'Medium (0.25–1 beat)' : 'Long (> 1 beat)';
  } else if (varId === 'V3') {
    // Tempo categorisation — BPM bands
    categories = ['< 60 BPM', '60–90 BPM', '90–120 BPM', '120–168 BPM', '> 168 BPM'];
    correct = bpm < 60 ? '< 60 BPM' : bpm < 90 ? '60–90 BPM' : bpm < 120 ? '90–120 BPM' : bpm <= 168 ? '120–168 BPM' : '> 168 BPM';
    notes = Array.from({ length: 8 }, (_, i) => ({ beat: i, drum, velocity: 0.7 }));
  } else if (varId === 'V4') {
    // Grouping — meter detection via accent pattern
    categories = ['2/4 (duple)', '3/4 (triple)', '4/4 (quadruple)', '5/4 or 7/4 (odd)'];
    correct = meterNum === 2 ? '2/4 (duple)' : meterNum === 3 ? '3/4 (triple)' : meterNum === 4 ? '4/4 (quadruple)' : '5/4 or 7/4 (odd)';
    notes = Array.from({ length: meterNum * 2 }, (_, i) => ({
      beat: i,
      drum,
      velocity: i % meterNum === 0 ? 0.9 : 0.5,
    }));
  } else {
    // V5 Rhythmic Relationship
    categories = ['Straight', 'Syncopated', 'Polyrhythm (3:2)', 'Polyrhythm (5:4)'];
    const type = (variableParams.type as string) || 'syncopation';
    correct =
      type === 'syncopation' ? 'Syncopated' :
      type === 'polyrhythm' ? 'Polyrhythm (3:2)' :
      'Straight';
    // Syncopated pattern
    notes = [
      { beat: 0, drum, velocity: 0.8 },
      { beat: 0.75, drum, velocity: 0.6 },
      { beat: 1.5, drum, velocity: 0.8 },
      { beat: 2.25, drum, velocity: 0.6 },
    ];
  }

  const dependencyKey = JSON.stringify(stimulusParams) + '|' + JSON.stringify(variableParams) + '|' + varId + '|' + notes.map(n => n.beat).join(',');

  const createStimulus = (ctx: AudioContext, dest: AudioNode) =>
    createRhythmStimulus({ notes, bpm, meterNumerator: meterNum, referenceClicks: false }, ctx, dest).handle;

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
