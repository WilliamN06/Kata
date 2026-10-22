import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { Dot, Line } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { readStimulusColor } from '../p2-utils';

type Phase = 'watching' | 'reproducing' | 'feedback';

export function GroupCDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('watching');

  const truthReciprocal = true;
  const truthDistancePct = 60;
  const truthRatio = 3;

  const stim = readStimulusColor(variableParams);
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';

  const [reciprocalGuess, setReciprocalGuess] = useState<boolean | null>(null);
  const [distanceGuess, setDistanceGuess] = useState<number | null>(null);
  const [ratioGuess, setRatioGuess] = useState<number | null>(null);

  const reciprocalOk = reciprocalGuess === truthReciprocal;
  const distanceOk = distanceGuess !== null && Math.abs(distanceGuess - truthDistancePct) <= 10;
  const ratioOk = ratioGuess === truthRatio;
  const allCorrect = reciprocalOk && distanceOk && ratioOk;

  const handleContinue = () => {
    onAnswer(allCorrect, Date.now() - startTime.current);
    setPhase('watching');
    setReciprocalGuess(null);
    setDistanceGuess(null);
    setRatioGuess(null);
  };

  const W = 560;
  const H = 200;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-6">
        {phase === 'watching' ? 'Study this dot scene' : 'Reproduce your analysis'}
      </p>

      <div className="relative mb-8" style={{ width: W, height: H, backgroundColor: stim.bg }}>
        {/* Small dot pair (part A) */}
        <Dot at={{ x: 40, y: H / 2 }} size={14} color={stim.bar} />
        <Dot at={{ x: 70, y: H / 2 }} size={14} color={stim.bar} />
        {showLine && <Line a={{ x: 40, y: H / 2 }} b={{ x: 70, y: H / 2 }} color="#4A9EFF" />}

        {/* Large dot pair (part B) */}
        <Dot at={{ x: W * 0.6, y: H / 2 }} size={14} color={stim.bar} />
        <Dot at={{ x: W * 0.6 + 90, y: H / 2 }} size={14} color={stim.bar} />
        {showLine && (
          <Line a={{ x: W * 0.6, y: H / 2 }} b={{ x: W * 0.6 + 90, y: H / 2 }} color="#4A9EFF" />
        )}

        {/* Cross-distance guide (from small dot to large dot) */}
        {showLine && <Line a={{ x: 40, y: H / 2 }} b={{ x: W * 0.6, y: H / 2 }} color="#4A9EFF" />}
      </div>

      {phase === 'watching' && (
        <button
          onClick={() => setPhase('reproducing')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
        >
          I'VE STUDIED IT
        </button>
      )}

      {phase === 'reproducing' && (
        <div className="flex flex-col items-center gap-6 max-w-2xl">
          <div>
            <p className="text-sm text-neutral-300 mb-2">Is A:B the same ratio as B:A?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setReciprocalGuess(true)}
                className={`px-4 py-2 rounded border ${
                  reciprocalGuess === true
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-neutral-800 border-neutral-700'
                }`}
              >
                SAME
              </button>
              <button
                onClick={() => setReciprocalGuess(false)}
                className={`px-4 py-2 rounded border ${
                  reciprocalGuess === false
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-neutral-800 border-neutral-700'
                }`}
              >
                DIFFERENT
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-300">Distance between parts (% of panel):</label>
            <input
              type="number"
              min={0}
              max={100}
              value={distanceGuess ?? ''}
              onChange={(e) => setDistanceGuess(Number(e.target.value) || null)}
              className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-300">Ratio A to B — 1 :</label>
            <input
              type="number"
              min={1}
              max={20}
              value={ratioGuess ?? ''}
              onChange={(e) => setRatioGuess(Number(e.target.value) || null)}
              className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
            />
          </div>

          <button
            onClick={() => setPhase('feedback')}
            disabled={reciprocalGuess === null || distanceGuess === null || ratioGuess === null}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-semibold"
          >
            SUBMIT
          </button>
        </div>
      )}

      {phase === 'feedback' && (
        <div
          className={`p-6 rounded-lg border max-w-xl text-center ${
            allCorrect ? 'bg-green-950/40 border-green-800' : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${allCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {allCorrect ? '✓ ALL CORRECT' : '✗ NOT ALL CORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            Same ratio: <strong>{String(truthReciprocal)}</strong> · Distance:{' '}
            <strong>{truthDistancePct}%</strong> · Ratio: <strong>1:{truthRatio}</strong>
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}