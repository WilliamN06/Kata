import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ChordPlayer, pickMidiInRange, type ChordType } from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo } from './helpers';

const POOLS: Record<string, ChordType[]> = {
  dyads: ['major', 'minor'],
  triads: ['major', 'minor', 'diminished', 'augmented'],
  sevenths: ['maj7', 'min7', 'dom7'],
  extensions: ['maj9', 'min9', 'dom9'],
  mixed: ['major', 'minor', 'maj7', 'min7'],
  random: ['major', 'minor', 'diminished', 'augmented', 'maj7'],
};

export function V6FusionDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(-1);

  const chordSet = (variableParams?.chordSet as string) ?? 'triads';
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 72;
  const baseDuration = (variableParams?.duration as number) ?? 1.2;
  const assessmentMode = (variableParams?.task_assessmentMode as string) ?? 'fused-unfused';
  const audio = readAudioSettings(variableParams);

  const trial = useMemo(() => {
    const pool = POOLS[chordSet] ?? POOLS['triads'] ?? ['major'];
    const type = pool[Math.floor(Math.random() * pool.length)] ?? 'major';
    const midi = pickMidiInRange(noteMin, noteMax);
    const rootPitchClass = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    return { type, rootPitchClass, octave };
  }, [chordSet, noteMin, noteMax]);

  const options =
    assessmentMode === 'fused-unfused'
      ? ['Fused (one colour)', 'Unfused (separate notes)']
      : assessmentMode === 'identify-notes'
      ? ['2 notes', '3 notes', '4 notes', '5+ notes']
      : ['Bright', 'Warm', 'Dark', 'Hollow'];

  const trueLabel = options[0] ?? 'Fused (one colour)';

  const handlePick = (name: string) => {
    if (picked !== null) return;
    setPicked(name);
    const correct = name === trueLabel;
    const rt = Date.now() - startTime.current;
    if (task.autoContinue !== false) {
      setTimeout(() => onAnswer(correct, rt), task.feedbackDurationMs ?? 1500);
    }
  };

  const handleContinue = () =>
    onAnswer(picked === trueLabel, Date.now() - startTime.current);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 w-full">
      <h2 className="text-2xl font-bold mb-2">Pitch Fusion</h2>
      <p className="text-neutral-400 mb-6">Listen and judge.</p>

      <ChordPlayer
        rootPitchClass={trial.rootPitchClass}
        chordType={trial.type as ChordType}
        octave={trial.octave}
        duration={durationAtTempo(baseDuration, variableParams)}
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
        {playKey < 0 ? '▶ PLAY CHORD' : '▶ PLAY AGAIN'}
      </button>

      <div className="grid grid-cols-2 gap-2 max-w-2xl w-full">
        {options.map((name) => (
          <button
            key={name}
            disabled={picked !== null}
            onClick={() => handlePick(name)}
            className={`px-4 py-3 rounded-lg border text-sm font-medium ${
              picked === name
                ? name === trueLabel
                  ? 'bg-green-700 border-green-500'
                  : 'bg-red-800 border-red-500'
                : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 disabled:opacity-50'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {picked && (
        <div className={`mt-8 p-6 rounded-lg border max-w-xl text-center ${
          picked === trueLabel ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
        }`}>
          <p className={`text-lg font-semibold mb-2 ${
            picked === trueLabel ? 'text-green-400' : 'text-red-400'
          }`}>
            {picked === trueLabel ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The chord was a <strong>{trial.type}</strong>.
          </p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}