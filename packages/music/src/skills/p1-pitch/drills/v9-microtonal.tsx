import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MicrotonalPlayer, midiToFrequency, pickMidiInRange } from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo } from './helpers';

const RANGES: Record<string, [number, number]> = {
  extreme: [2, 5],
  subtle: [5, 20],
  moderate: [20, 40],
  large: [40, 50],
};

export function V9MicrotonalDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(-1);

  const deviationRange = (variableParams?.deviationRange as string) ?? 'moderate';
  const deviationMinCents = (variableParams?.deviationMinCents as number) ?? 5;
  const deviationMaxCents = (variableParams?.deviationMaxCents as number) ?? 40;
  const deviationDirection = (variableParams?.deviationDirection as string) ?? 'both';
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 84;
  const audio = readAudioSettings(variableParams);

  const trial = useMemo(() => {
    const useNumeric = deviationRange === 'numeric';
    const entry = useNumeric
      ? [deviationMinCents, deviationMaxCents]
      : RANGES[deviationRange] ?? RANGES['moderate'] ?? [20, 40];
    const lo = entry[0] ?? 20;
    const hi = entry[1] ?? 40;
    const magnitude = lo + Math.random() * Math.max(1, hi - lo);
    const sign =
      deviationDirection === 'sharp' ? 1 :
      deviationDirection === 'flat' ? -1 :
      Math.random() > 0.5 ? 1 : -1;
    const cents = magnitude * sign;
    const expected = Math.abs(cents) < 5 ? 'in tune' : cents > 0 ? 'sharp' : 'flat';
    const midi = pickMidiInRange(noteMin, noteMax);
    return { cents, expected, referenceMidi: midi };
  }, [deviationRange, deviationMinCents, deviationMaxCents, deviationDirection, noteMin, noteMax]);

  const handlePick = (name: string) => {
    if (picked !== null) return;
    setPicked(name);
    const correct = name === trial.expected;
    const rt = Date.now() - startTime.current;
    if (task.autoContinue !== false) {
      setTimeout(() => onAnswer(correct, rt), task.feedbackDurationMs ?? 1500);
    }
  };

  const handleContinue = () =>
    onAnswer(picked === trial.expected, Date.now() - startTime.current);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 w-full">
      <h2 className="text-2xl font-bold mb-2">Microtonal Deviation</h2>
      <p className="text-neutral-400 mb-6">Listen and judge the tuning.</p>

      <MicrotonalPlayer
        referenceFrequency={midiToFrequency(trial.referenceMidi)}
        detuneCents={trial.cents}
        duration={durationAtTempo(0.8, variableParams)}
        waveform={audio.timbre}
        reverb={audio.reverb}
        noise={audio.noise}
        harmonics={audio.harmonics}
        repeats={audio.repeats}
        playReferenceFirst
        playKey={playKey}
      />

      <button
        onClick={() => setPlayKey((k) => k + 1)}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold mb-8"
      >
        {playKey < 0 ? '▶ PLAY' : '▶ PLAY AGAIN'}
      </button>

      <div className="grid grid-cols-3 gap-2 max-w-xl w-full">
        {['sharp', 'in tune', 'flat'].map((name) => (
          <button
            key={name}
            disabled={picked !== null}
            onClick={() => handlePick(name)}
            className={`px-4 py-3 rounded-lg border text-sm font-medium capitalize ${
              picked === name
                ? name === trial.expected
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
          picked === trial.expected ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
        }`}>
          <p className={`text-lg font-semibold mb-2 ${
            picked === trial.expected ? 'text-green-400' : 'text-red-400'
          }`}>
            {picked === trial.expected ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The target was <strong>{trial.cents.toFixed(0)} cents</strong> ({trial.expected}).
          </p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}