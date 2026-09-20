import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { IntervalPlayer, midiToFrequency, pickRootForInterval } from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo } from './helpers';

interface Pair { semis: number; a: string; b: string; }

const PAIRS: Pair[] = [
  { semis: 6, a: 'F#', b: 'Gb' },
  { semis: 1, a: 'C#', b: 'Db' },
  { semis: 8, a: 'G#', b: 'Ab' },
  { semis: 3, a: 'D#', b: 'Eb' },
  { semis: 10, a: 'A#', b: 'Bb' },
];

export function V11EnharmonicDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(-1);

  const tuningSystem = (variableParams?.tuningSystem as string) ?? 'equal-temperament';
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 84;
  const audio = readAudioSettings(variableParams);

  const trial = useMemo(() => {
    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)] ?? PAIRS[0]!;
    const samePitch = tuningSystem === 'equal-temperament' || tuningSystem === 'random';
    const { root } = pickRootForInterval(noteMin, noteMax, pair.semis);
    return { pair, samePitch, rootMidi: root };
  }, [tuningSystem, noteMin, noteMax]);

  const handlePick = (name: string) => {
    if (picked !== null) return;
    setPicked(name);
    const saidSame = name === 'Same';
    const correct = saidSame === trial.samePitch;
    const rt = Date.now() - startTime.current;
    if (task.autoContinue !== false) {
      setTimeout(() => onAnswer(correct, rt), task.feedbackDurationMs ?? 1500);
    }
  };

  const handleContinue = () => {
    const saidSame = picked === 'Same';
    onAnswer(saidSame === trial.samePitch, Date.now() - startTime.current);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 w-full">
      <h2 className="text-2xl font-bold mb-2">Enharmonic Equivalence</h2>
      <p className="text-neutral-400 mb-6">Do these two pitches sound the same?</p>

      <IntervalPlayer
        rootFrequency={midiToFrequency(trial.rootMidi)}
        intervalSemitones={trial.pair.semis}
        direction="ascending"
        noteDuration={durationAtTempo(0.6, variableParams)}
        gapDuration={0.2}
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
        {playKey < 0 ? '▶ PLAY PAIR' : '▶ PLAY AGAIN'}
      </button>

      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
        {['Same', 'Different'].map((name) => {
          const isSelected = picked === name;
          const isCorrect = (name === 'Same') === trial.samePitch;
          return (
            <button
              key={name}
              disabled={picked !== null}
              onClick={() => handlePick(name)}
              className={`px-6 py-4 rounded-lg border text-base font-semibold ${
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
        <div className={`mt-8 p-6 rounded-lg border max-w-xl text-center ${
          (picked === 'Same') === trial.samePitch
            ? 'bg-green-950/40 border-green-800'
            : 'bg-red-950/40 border-red-800'
        }`}>
          <p className={`text-lg font-semibold mb-2 ${
            (picked === 'Same') === trial.samePitch ? 'text-green-400' : 'text-red-400'
          }`}>
            {(picked === 'Same') === trial.samePitch ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            {trial.pair.a} and {trial.pair.b} are{' '}
            {trial.samePitch ? `the same pitch in ${tuningSystem}` : 'different'}.
          </p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}