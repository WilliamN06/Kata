import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import {
  MelodyPlayer,
  PITCH_CLASSES,
  midiToFrequency,
  midiToNoteName,
  pickMidiInRange,
} from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo } from './helpers';

/**
 * Enharmonic map — every spelling maps to its MIDI pitch class 0–11.
 * So C# and Db both grade as pitch class 1.
 */
const ENHARMONIC: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

/** Every option offered, with both sharps and flats. */
const ALL_OPTIONS = [
  'C', 'C#', 'Db',
  'D', 'D#', 'Eb',
  'E',
  'F', 'F#', 'Gb',
  'G', 'G#', 'Ab',
  'A', 'A#', 'Bb',
  'B',
];

const NATURAL_OPTIONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function V4PitchClassDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(-1);
  const [stopKey, setStopKey] = useState(0);

  const pitchSet = (variableParams?.pitchSet as string) ?? 'all';
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 84;

  const rawRef = variableParams?.referenceGiven as unknown;
  const referenceGiven: boolean =
    rawRef === undefined || rawRef === true || rawRef === 'true' || rawRef === 1;
  const referenceMidi = (variableParams?.referenceMidi as number) ?? 69;

  const audio = readAudioSettings(variableParams);

  const trial = useMemo(() => {
    const midi = pickMidiInRange(noteMin, noteMax);
    const pitchClass = ((midi % 12) + 12) % 12;
    const sharpName = PITCH_CLASSES[pitchClass] ?? 'C';
    const sharpFreq = midiToFrequency(midi);

    const notes = referenceGiven
      ? [
          {
            frequency: midiToFrequency(referenceMidi),
            duration: durationAtTempo(0.6, variableParams),
            midi: referenceMidi,
          },
          {
            frequency: sharpFreq,
            duration: durationAtTempo(0.9, variableParams),
            midi,
          },
        ]
      : [
          {
            frequency: sharpFreq,
            duration: durationAtTempo(0.9, variableParams),
            midi,
          },
        ];

    return { midi, pitchClass, sharpName, notes };
  }, [noteMin, noteMax, referenceGiven, referenceMidi, variableParams]);

  const options = useMemo(() => {
    if (pitchSet === 'naturals') return NATURAL_OPTIONS;
    return ALL_OPTIONS;
  }, [pitchSet]);

  const gradeAnswer = (name: string): boolean => {
    return ENHARMONIC[name] === trial.pitchClass;
  };

  const handlePick = (name: string) => {
    if (picked !== null) return;
    setPicked(name);
    setStopKey((k) => k + 1);
    const correct = gradeAnswer(name);
    const rt = Date.now() - startTime.current;
    if (task.autoContinue !== false) {
      setTimeout(() => onAnswer(correct, rt), task.feedbackDurationMs ?? 1500);
    }
  };

  const handleContinue = () =>
    onAnswer(picked !== null && gradeAnswer(picked), Date.now() - startTime.current);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 w-full">
      <h2 className="text-2xl font-bold mb-2">Pitch Class</h2>
      <p className="text-neutral-400 mb-6">
        {referenceGiven
          ? `Listen to the reference (${midiToNoteName(referenceMidi)}), then the target.`
          : 'Listen and name the pitch class.'}
      </p>

      <MelodyPlayer
        notes={trial.notes}
        waveform={audio.timbre}
        reverb={audio.reverb}
        noise={audio.noise}
        harmonics={audio.harmonics}
        repeats={audio.repeats}
        playKey={playKey}
      />

      <button
        onClick={() => setPlayKey((k) => k + 1)}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold mb-8"
      >
        {playKey < 0 ? '▶ PLAY TONE' : '▶ PLAY AGAIN'}
      </button>

      <div className="grid grid-cols-4 gap-2 max-w-2xl w-full">
        {options.map((name) => {
          const isSelected = picked === name;
          const isCorrect = ENHARMONIC[name] === trial.pitchClass;
          return (
            <button
              key={name}
              disabled={picked !== null}
              onClick={() => handlePick(name)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                isSelected
                  ? isCorrect
                    ? 'bg-green-700 border-green-500'
                    : 'bg-red-800 border-red-500'
                  : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 disabled:opacity-50'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {picked && (
        <div
          className={`mt-8 p-6 rounded-lg border max-w-xl text-center ${
            gradeAnswer(picked)
              ? 'bg-green-950/40 border-green-800'
              : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p
            className={`text-lg font-semibold mb-2 ${
              gradeAnswer(picked) ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {gradeAnswer(picked) ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The pitch was <strong>{trial.sharpName}</strong> ({midiToNoteName(trial.midi)},{' '}
            {midiToFrequency(trial.midi).toFixed(1)} Hz).
          </p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}