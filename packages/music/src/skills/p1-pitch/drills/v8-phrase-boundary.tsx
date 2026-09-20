import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { MelodyPlayer, midiToFrequency, pickRootForInterval } from '@kata/audio';
import { ContinueButton } from '@kata/ui';
import { readAudioSettings, durationAtTempo } from './helpers';

export function V8PhraseBoundaryDrill({ variableParams, task, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [playKey, setPlayKey] = useState(-1);
  const [tapCount, setTapCount] = useState(0);
  const [done, setDone] = useState(false);

  const phraseCount = (variableParams?.phraseCount as number) ?? 3;
  const melodyLength = (variableParams?.melodyLength as number) ?? 12;
  const noteMin = (variableParams?.noteMin as number) ?? 48;
  const noteMax = (variableParams?.noteMax as number) ?? 84;
  const intervalMax = (variableParams?.intervalMax as number) ?? 7;
  const audio = readAudioSettings(variableParams);

  const trial = useMemo(() => {
    const { root } = pickRootForInterval(noteMin, noteMax, intervalMax);
    const notes = Array.from({ length: melodyLength }, (_, i) => {
      const step = (i % (intervalMax + 1));
      return {
        frequency: midiToFrequency(root + step),
        duration: durationAtTempo(0.35, variableParams),
      };
    });
    return { notes };
  }, [melodyLength, noteMin, noteMax, intervalMax, variableParams]);

  const expectedTaps = Math.max(1, phraseCount - 1);

  const handleTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= expectedTaps) {
      const elapsed = Date.now() - startTime.current;
      setDone(true);
      if (task.autoContinue !== false) {
        setTimeout(() => onAnswer(true, elapsed), task.feedbackDurationMs ?? 1500);
      }
    }
  };

  const handleContinue = () => onAnswer(true, Date.now() - startTime.current);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 w-full">
      <h2 className="text-2xl font-bold mb-2">Phrase Boundary</h2>
      <p className="text-neutral-400 mb-6">
        Tap the boundary between each phrase ({expectedTaps} boundaries expected).
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
        {playKey < 0 ? '▶ PLAY MELODY' : '▶ PLAY AGAIN'}
      </button>

      <button
        onClick={handleTap}
        disabled={done || playKey < 0}
        className="px-12 py-6 bg-amber-600 hover:bg-amber-500 rounded-full text-2xl font-bold disabled:opacity-40"
      >
        TAP BOUNDARY ({tapCount}/{expectedTaps})
      </button>

      {done && (
        <div className="mt-8 p-6 rounded-lg border max-w-xl text-center bg-green-950/40 border-green-800">
          <p className="text-lg font-semibold mb-2 text-green-400">✓ Boundaries recorded</p>
          {task.autoContinue === false && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}