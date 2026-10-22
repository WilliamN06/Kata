import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MelodyPlayer, midiToFrequency, pickRootForInterval, filterPoolByInterval } from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo } from './helpers';

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10];

export function V3TonalCentreDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(-1);

  const tonalSet = (variableParams?.tonalSet as string) ?? 'major-only';
  const melodyLength = (variableParams?.melodyLength as number) ?? 8;
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 84;
  const intervalMin = (variableParams?.intervalMin as number) ?? 0;
  const intervalMax = (variableParams?.intervalMax as number) ?? 12;
  const baseStepDuration = 0.35;
  const audio = readAudioSettings(variableParams);

  const trial = useMemo(() => {
    const useMinor = tonalSet === 'minor-only';
    const steps = useMinor ? MINOR_STEPS : MAJOR_STEPS;
    const { root } = pickRootForInterval(noteMin, noteMax, 11);
    const allowedSemitones = filterPoolByInterval(steps, intervalMin, intervalMax);
    const notes = Array.from({ length: melodyLength }, (_, i) => {
      const step = allowedSemitones[i % allowedSemitones.length] ?? 0;
      const octave = Math.floor(i / allowedSemitones.length);
      const midi = root + step + octave * 12;
      return { frequency: midiToFrequency(midi), duration: durationAtTempo(baseStepDuration, variableParams) };
    });
    return { tonic: ((root % 12) + 12) % 12, notes };
  }, [tonalSet, melodyLength, noteMin, noteMax, intervalMin, intervalMax, variableParams]);

  const trueKey = KEY_NAMES[trial.tonic] ?? 'C';

  const handlePick = (name: string) => {
    if (picked !== null) return;
    setPicked(name);
    const correct = name === trueKey;
    const rt = Date.now() - startTime.current;
    if (task.autoContinue !== false) {
      setTimeout(() => onAnswer(correct, rt), task.feedbackDurationMs ?? 1500);
    }
  };

  const handleContinue = () =>
    onAnswer(picked === trueKey, Date.now() - startTime.current);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 w-full">
      <h2 className="text-2xl font-bold mb-2">Tonal Centre</h2>
      <p className="text-neutral-400 mb-6">Listen and pick the key.</p>

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
        {playKey < 0 ? '▶ PLAY MELODY' : '▶ PLAY AGAIN'}
      </button>

      <div className="grid grid-cols-4 gap-2 max-w-2xl w-full">
        {KEY_NAMES.map((name) => (
          <button
            key={name}
            disabled={picked !== null}
            onClick={() => handlePick(name)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              picked === name
                ? name === trueKey
                  ? 'bg-green-700 border-green-500'
                  : 'bg-red-800 border-red-500'
                : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 disabled:opacity-50'
            }`}
          >
            {name} major
          </button>
        ))}
      </div>

      {picked && (
        <div className={`mt-8 p-6 rounded-lg border max-w-xl text-center ${
          picked === trueKey ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
        }`}>
          <p className={`text-lg font-semibold mb-2 ${
            picked === trueKey ? 'text-green-400' : 'text-red-400'
          }`}>
            {picked === trueKey ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The key was <strong>{trueKey} major</strong>.
          </p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}