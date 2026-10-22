import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { DotPair } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { readStimulusColor } from '../p2-utils';

type Phase = 'watching' | 'reproducing' | 'feedback';

const UNIT = 24;

export function GroupADrill({ onAnswer, variableParams }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('watching');

  const units = useMemo(() => 4 + Math.floor(Math.random() * 5), []);
  const extremeRatio = useMemo(() => 6 + Math.floor(Math.random() * 5), []);
  const hw = useMemo(() => 2 + Math.floor(Math.random() * 4), []);

  const stim = readStimulusColor(variableParams);
  const showLine = String(variableParams?.stim_showLine ?? 'true') === 'true';

  const [unitsGuess, setUnitsGuess] = useState<number | null>(null);
  const [extremeGuess, setExtremeGuess] = useState<number | null>(null);
  const [hwGuess, setHwGuess] = useState<number | null>(null);

  const unitsOk = unitsGuess === units;
  const extremeOk = extremeGuess === extremeRatio;
  const hwOk = hwGuess === hw;
  const allCorrect = unitsOk && extremeOk && hwOk;

  const handleContinue = () => {
    onAnswer(allCorrect, Date.now() - startTime.current);
    setPhase('watching');
    setUnitsGuess(null);
    setExtremeGuess(null);
    setHwGuess(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 w-full">
      <p className="text-lg text-neutral-200 mb-6">
        {phase === 'watching' ? 'Study this pair cluster' : 'Reproduce your analysis'}
      </p>

      <div className="flex items-start gap-12 mb-8">
        {/* Unit pair */}
        <div className="flex flex-col items-center">
          <DotPair
            width={40}
            height={UNIT + 40}
            distance={UNIT}
            orientation="vertical"
            anchorX={20}
            anchorY={20}
            showLine={showLine}
            dotColor={stim.bar}
            backgroundColor={stim.bg}
          />
          <span className="text-xs text-neutral-500 mt-2">1 unit</span>
        </div>
        {/* Figure pair */}
        <div className="flex flex-col items-center">
          <DotPair
            width={40}
            height={UNIT * units + 40}
            distance={UNIT * units}
            orientation="vertical"
            anchorX={20}
            anchorY={20}
            showLine={showLine}
            dotColor={stim.bar}
            backgroundColor={stim.bg}
          />
          <span className="text-xs text-neutral-500 mt-2">figure</span>
        </div>
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
        <div className="flex flex-col items-center gap-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-300">Units tall:</label>
            <input
              type="number"
              min={1}
              max={20}
              value={unitsGuess ?? ''}
              onChange={(e) => setUnitsGuess(Number(e.target.value) || null)}
              className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-300">Extreme ratio 1 :</label>
            <input
              type="number"
              min={1}
              max={20}
              value={extremeGuess ?? ''}
              onChange={(e) => setExtremeGuess(Number(e.target.value) || null)}
              className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-300">H:W 1 :</label>
            <input
              type="number"
              min={1}
              max={20}
              value={hwGuess ?? ''}
              onChange={(e) => setHwGuess(Number(e.target.value) || null)}
              className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-center font-mono"
            />
          </div>
          <button
            onClick={() => setPhase('feedback')}
            disabled={unitsGuess === null || extremeGuess === null || hwGuess === null}
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
            Units: <strong>{units}</strong> · Extreme: <strong>1:{extremeRatio}</strong> ·
            H:W: <strong>1:{hw}</strong>
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}