import { useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { Dot, Line } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { readStimulusColor } from '../p2-utils';

type Phase = 'watching' | 'reproducing' | 'feedback';

export function GroupBDrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('watching');

  const truthFraction = 1 / 3;
  const truthPosition = 33;
  const truthSymmetric = true;

  const stim = readStimulusColor(variableParams);
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';

  const [fractionGuess, setFractionGuess] = useState<number | null>(null);
  const [positionGuess, setPositionGuess] = useState<number | null>(null);
  const [symmetricGuess, setSymmetricGuess] = useState<boolean | null>(null);

  const fractionOk = fractionGuess !== null && Math.abs(fractionGuess - truthFraction * 100) <= 8;
  const positionOk = positionGuess !== null && Math.abs(positionGuess - truthPosition) <= 8;
  const symmetricOk = symmetricGuess === truthSymmetric;
  const allCorrect = fractionOk && positionOk && symmetricOk;

  const handleContinue = () => {
    onAnswer(allCorrect, Date.now() - startTime.current);
    setPhase('watching');
    setFractionGuess(null);
    setPositionGuess(null);
    setSymmetricGuess(null);
  };

  const W = 200;
  const H = 300;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-6">
        {phase === 'watching' ? 'Study this dot figure' : 'Reproduce your analysis'}
      </p>

      <div className="relative mb-8" style={{ width: W, height: H, backgroundColor: stim.bg }}>
        {/* Eye region boundary (horizontal) */}
        <Dot at={{ x: 20, y: H * truthFraction }} size={12} color={stim.bar} />
        <Dot at={{ x: W - 20, y: H * truthFraction }} size={12} color={stim.bar} />
        {showLine && (
          <Line
            a={{ x: 20, y: H * truthFraction }}
            b={{ x: W - 20, y: H * truthFraction }}
            color="#4A9EFF"
          />
        )}

        {/* Eyes */}
        <Dot at={{ x: W / 2 - 30, y: H * truthFraction / 2 }} size={14} color={stim.bar} />
        <Dot at={{ x: W / 2 + 30, y: H * truthFraction / 2 }} size={14} color={stim.bar} />

        {/* Vertical axis through the middle */}
        {showLine && <Line a={{ x: W / 2, y: 0 }} b={{ x: W / 2, y: H }} color="#4A9EFF" />}

        {/* Bottom anchor dot */}
        <Dot at={{ x: W / 2, y: H - 10 }} size={12} color={stim.bar} />
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
          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-300">Eye region fraction (% from top):</label>
            <input
              type="number"
              min={1}
              max={99}
              value={fractionGuess ?? ''}
              onChange={(e) => setFractionGuess(Number(e.target.value) || null)}
              className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-300">Eye vertical position (% from top):</label>
            <input
              type="number"
              min={0}
              max={100}
              value={positionGuess ?? ''}
              onChange={(e) => setPositionGuess(Number(e.target.value) || null)}
              className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-300">Symmetric?</label>
            <button
              onClick={() => setSymmetricGuess(true)}
              className={`px-4 py-2 rounded border ${
                symmetricGuess === true
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-neutral-800 border-neutral-700'
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setSymmetricGuess(false)}
              className={`px-4 py-2 rounded border ${
                symmetricGuess === false
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-neutral-800 border-neutral-700'
              }`}
            >
              NO
            </button>
          </div>

          <button
            onClick={() => setPhase('feedback')}
            disabled={fractionGuess === null || positionGuess === null || symmetricGuess === null}
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
            Fraction: <strong>{Math.round(truthFraction * 100)}%</strong> · Position:{' '}
            <strong>{truthPosition}%</strong> · Symmetric: <strong>{String(truthSymmetric)}</strong>
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}