import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MusicDrillWrapper, type MusicStimulusHandle } from '../../../shared/MusicDrillWrapper';
import { MusicStimulusView } from '../../../shared/MusicStimulusView';
import { getAudioContext } from '@kata/audio';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Convert a note name like "A4" to frequency in Hz. */
export function noteToFrequency(note: string): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 440;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr!, 10);
  const pc = NOTE_NAMES.indexOf(name!);
  if (pc === -1) return 440;
  const midi = (octave + 1) * 12 + pc;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Pick a random note between two note names (inclusive). */
export function randomNoteInRange(minNote: string, maxNote: string): string {
  const minFreq = noteToFrequency(minNote);
  const maxFreq = noteToFrequency(maxNote);
  const lo = Math.min(minFreq, maxFreq);
  const hi = Math.max(minFreq, maxFreq);
  // Pick a random MIDI number in that range
  const minMidi = Math.round(69 + 12 * Math.log2(lo / 440));
  const maxMidi = Math.round(69 + 12 * Math.log2(hi / 440));
  const midi = minMidi + Math.floor(Math.random() * (maxMidi - minMidi + 1));
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pc]}${octave}`;
}

/**
 * Shared context extraction helper.
 * Returns all the params a drill needs, plus the wrapper props.
 */
export function usePitchDrillContext(variableParams: any, stimulusParams: any) {
  return useMemo(() => {
    // Root note: explicit OR random within range
    let rootNote: string = (stimulusParams.rootNote as string) || 'A4';
    if (stimulusParams.randomRoot === 'on') {
      const minNote = (stimulusParams.randomRootMin as string) || 'C3';
      const maxNote = (stimulusParams.randomRootMax as string) || 'C5';
      rootNote = randomNoteInRange(minNote, maxNote);
    }
    const rootFreq = noteToFrequency(rootNote);

    // Interval range
    const rawMin = variableParams.intervalMin ?? variableParams.intervalSubset ?? 1;
    const rawMax = variableParams.intervalMax ?? variableParams.intervalSemitones ?? 12;
    const intervalMin = Number.isFinite(Number(rawMin)) ? Number(rawMin) : 1;
    const intervalMax = Number.isFinite(Number(rawMax)) ? Number(rawMax) : 12;
    

    return {
      rootNote,
      rootFreq,
      intervalMin: Math.max(0, Math.min(24, intervalMin)),
      intervalMax: Math.max(intervalMin, Math.min(24, intervalMax)),
      durationMs: Number(stimulusParams.durationMs) || 800,
      soundSource: (stimulusParams.soundSource as string) || 'piano_acoustic',
      backgroundNoise: (stimulusParams.backgroundNoise as string) || 'silence',
      backgroundNoiseLevel: Number(stimulusParams.backgroundNoiseLevel) ?? 0.15,
      direction: (variableParams.direction === 'descending' || variableParams.direction === 'harmonic' || variableParams.direction === 'ascending') ? (variableParams.direction as 'ascending' | 'descending' | 'harmonic') : 'ascending',
      referencePresent: (variableParams.referencePresent as any) || 'present',
      intervalSemitones: Number(variableParams.intervalSemitones) ?? 7,
      chordFamily: (variableParams.chordFamily as any) || 'all',
      voicing: (variableParams.voicing as any) || 'close',
      inversion: (variableParams.inversion as any) || 'root',
      octaveShift: Number(variableParams.octaveShift) || 0,
      frequency: Number(variableParams.frequency) || 440,
      frequencyRange: Number(variableParams.frequencyRange) || 200,
    };
  }, [variableParams, stimulusParams]);
}

/** Common hook pattern — tracks time + answered state. */
export function useDrillState() {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const reset = () => {
    startTime.current = Date.now();
    setAnswered(false);
  };
  return { startTime, answered, setAnswered, reset };
}

export type { DrillProps, MusicStimulusHandle };
export { MusicDrillWrapper, MusicStimulusView, getAudioContext };


