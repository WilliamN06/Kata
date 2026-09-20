import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import {
  IntervalPlayer,
  INTERVAL_NAMES,
  midiToFrequency,
  pickRootForInterval,
  pickIntervalInRange,
  filterPoolByInterval,
} from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo } from './helpers';

function invert(semis: number): number {
  return 12 - semis;
}

const POOL_PERFECT = [5, 7];
const POOL_IMPERFECT = [2, 3, 4, 8, 9, 10];
const POOL_ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function V10InversionDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(-1);

  const intervalSet = (variableParams?.intervalSet as string) ?? 'imperfect';
  const intervalMin = (variableParams?.intervalMin as number) ?? 1;
  const intervalMax = (variableParams?.intervalMax as number) ?? 11;
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 84;
  const direction = (variableParams?.direction as string) ?? 'ascending';
  const audio = readAudioSettings(variableParams);

  const dir: 'ascending' | 'descending' | 'harmonic' =
    direction === 'descending' ? 'descending' :
    direction === 'harmonic' ? 'harmonic' : 'ascending';

  const trial = useMemo(() => {
    let pool: number[];
    if (intervalSet === 'numeric') {
      pool = [pickIntervalInRange(intervalMin, intervalMax)];
    } else {
      const raw =
        intervalSet === 'perfect' ? POOL_PERFECT :
        intervalSet === 'imperfect' ? POOL_IMPERFECT : POOL_ALL;
      pool = filterPoolByInterval(raw, intervalMin, intervalMax);
    }
    const semis = pool[Math.floor(Math.random() * pool.length)] ?? 5;
    const { root } = pickRootForInterval(noteMin, noteMax, semis);
    return { semis, inverted: invert(semis), rootMidi: root };
  }, [intervalSet, intervalMin, intervalMax, noteMin, noteMax]);

  const trueLabel = INTERVAL_NAMES[trial.inverted] ?? 'Unknown';
  const options: string[] = Array.from(new Set<string>(INTERVAL_NAMES as readonly string[]));

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
      <h2 className="text-2xl font-bold mb-2">Interval Inversion</h2>
      <p className="text-neutral-400 mb-6">Name the inverted interval.</p>

      <IntervalPlayer
        rootFrequency={midiToFrequency(trial.rootMidi)}
        intervalSemitones={trial.semis}
        direction={dir}
        noteDuration={durationAtTempo(0.8, variableParams)}
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
        {playKey < 0 ? '▶ PLAY' : '▶ PLAY AGAIN'}
      </button>

      <div className="grid grid-cols-4 gap-2 max-w-2xl w-full">
        {options.map((name) => (
          <button
            key={name}
            disabled={picked !== null}
            onClick={() => handlePick(name)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium ${
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
            Played: <strong>{INTERVAL_NAMES[trial.semis]}</strong>. Inverted: <strong>{trueLabel}</strong>.
          </p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}