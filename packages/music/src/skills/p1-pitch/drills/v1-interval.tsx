import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import {
  IntervalPlayer,
  INTERVAL_NAMES,
  pickRootForInterval,
  pickIntervalInRange,
  filterPoolByInterval,
  midiToFrequency,
} from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo, readTolerance } from './helpers';

const SET_POOLS: Record<string, number[]> = {
  consonant: [0, 3, 4, 7, 8, 9],
  dissonant: [1, 2, 6, 10, 11],
  perfect: [0, 5, 7, 12],
  all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  random: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

export function V1IntervalDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(-1);

  const intervalSet = (variableParams?.intervalSet as string) ?? 'consonant';
  const intervalMin = (variableParams?.intervalMin as number) ?? 0;
  const intervalMax = (variableParams?.intervalMax as number) ?? 12;
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 84;
  const direction = (variableParams?.direction as string) ?? 'ascending';
  const baseDuration = (variableParams?.noteDuration as number) ?? 0.8;
  const tolerance = readTolerance(variableParams);
  const audio = readAudioSettings(variableParams);

  const trial = useMemo(() => {
    let pool: number[];
    if (intervalSet === 'numeric') {
      pool = [pickIntervalInRange(intervalMin, intervalMax)];
    } else {
      const raw = SET_POOLS[intervalSet] ?? SET_POOLS['consonant'] ?? [7];
      pool = filterPoolByInterval(raw, intervalMin, intervalMax);
    }
    const semitones = pool[Math.floor(Math.random() * pool.length)] ?? 7;
    const { root } = pickRootForInterval(noteMin, noteMax, semitones);
    const dir: 'ascending' | 'descending' | 'harmonic' =
      direction === 'random'
        ? (['ascending', 'descending', 'harmonic'] as const)[Math.floor(Math.random() * 3)] ?? 'ascending'
        : direction === 'mixed'
        ? (['ascending', 'descending'] as const)[Math.floor(Math.random() * 2)] ?? 'ascending'
        : (direction as 'ascending' | 'descending' | 'harmonic');
    return { semitones, rootMidi: root, dir };
  }, [intervalSet, intervalMin, intervalMax, noteMin, noteMax, direction]);

  const trueLabel = INTERVAL_NAMES[trial.semitones] ?? 'Unknown';
  const options: string[] = Array.from(new Set<string>(INTERVAL_NAMES as readonly string[]));

  const handlePick = (name: string) => {
    if (picked !== null) return;
    setPicked(name);
    const pickedIndex = INTERVAL_NAMES.indexOf(name);
    const correct = Math.abs(pickedIndex - trial.semitones) <= tolerance;
    const rt = Date.now() - startTime.current;
    if (task.autoContinue !== false) {
      setTimeout(() => onAnswer(correct, rt), task.feedbackDurationMs ?? 1500);
    }
  };

  const handleContinue = () => {
    const pickedIndex = INTERVAL_NAMES.indexOf(picked ?? '');
    onAnswer(Math.abs(pickedIndex - trial.semitones) <= tolerance, Date.now() - startTime.current);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 w-full">
      <h2 className="text-2xl font-bold mb-2">Interval Discrimination</h2>
      <p className="text-neutral-400 mb-6">Listen and pick the interval.</p>

      <IntervalPlayer
  rootFrequency={midiToFrequency(trial.rootMidi)}
  rootMidi={trial.rootMidi}
  intervalSemitones={trial.semitones}
  direction={trial.dir}
  noteDuration={durationAtTempo(baseDuration, variableParams)}
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
        {playKey < 0 ? '▶ PLAY INTERVAL' : '▶ PLAY AGAIN'}
      </button>

      <div className="grid grid-cols-3 gap-2 max-w-2xl w-full">
        {options.map((name) => (
          <button
            key={name}
            disabled={picked !== null}
            onClick={() => handlePick(name)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
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
            The interval was <strong>{trueLabel}</strong> ({trial.semitones} semitones).
          </p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}