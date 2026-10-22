import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MelodyPlayer, midiToFrequency, pickRootForInterval } from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo } from './helpers';

const CONTOURS = ['rising', 'falling', 'arch', 'valley', 'wave'] as const;
type Contour = (typeof CONTOURS)[number];

function buildContour(type: Contour, length: number, span: number): number[] {
  const semis: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = i / Math.max(1, length - 1);
    switch (type) {
      case 'rising': semis.push(t * span); break;
      case 'falling': semis.push((1 - t) * span); break;
      case 'arch': semis.push(Math.sin(t * Math.PI) * span); break;
      case 'valley': semis.push(-Math.sin(t * Math.PI) * span); break;
      case 'wave': semis.push(Math.sin(t * Math.PI * 2) * (span / 2)); break;
    }
  }
  return semis;
}

export function V5ContourDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(-1);

  const contourType = (variableParams?.contourType as string) ?? 'mixed';
  const melodyLength = (variableParams?.melodyLength as number) ?? 6;
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 84;
  const intervalMax = (variableParams?.intervalMax as number) ?? 12;
  const audio = readAudioSettings(variableParams);

  const trial = useMemo(() => {
    const type: Contour =
      contourType === 'random' || contourType === 'mixed'
        ? CONTOURS[Math.floor(Math.random() * CONTOURS.length)] ?? 'rising'
        : (contourType as Contour);
    const span = Math.max(2, Math.min(12, intervalMax));
    const shape = buildContour(type, melodyLength, span);
    const { root } = pickRootForInterval(noteMin, noteMax, span);
    const notes = shape.map((s) => ({
      frequency: midiToFrequency(root + Math.round(s)),
      duration: durationAtTempo(0.35, variableParams),
    }));
    return { type, notes };
  }, [contourType, melodyLength, noteMin, noteMax, intervalMax, variableParams]);

  const handlePick = (name: string) => {
    if (picked !== null) return;
    setPicked(name);
    const correct = name === trial.type;
    const rt = Date.now() - startTime.current;
    if (task.autoContinue !== false) {
      setTimeout(() => onAnswer(correct, rt), task.feedbackDurationMs ?? 1500);
    }
  };

  const handleContinue = () =>
    onAnswer(picked === trial.type, Date.now() - startTime.current);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 w-full">
      <h2 className="text-2xl font-bold mb-2">Melodic Contour</h2>
      <p className="text-neutral-400 mb-6">Listen and pick the shape.</p>

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

      <div className="grid grid-cols-5 gap-2 max-w-2xl w-full">
        {CONTOURS.map((name) => (
          <button
            key={name}
            disabled={picked !== null}
            onClick={() => handlePick(name)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize ${
              picked === name
                ? name === trial.type
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
          picked === trial.type ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
        }`}>
          <p className={`text-lg font-semibold mb-2 ${
            picked === trial.type ? 'text-green-400' : 'text-red-400'
          }`}>
            {picked === trial.type ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The contour was <strong>{trial.type}</strong>.
          </p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}