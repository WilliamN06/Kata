import { useEffect, useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ColorChip, ValueScale } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Mode = 'desaturate' | 'memory';

interface HuePreset {
  hue: number;
  saturation: number;
  inherentL: number; // true value (L*)
  name: string;
}

const HUE_PRESETS: HuePreset[] = [
  { hue: 60, saturation: 90, inherentL: 80, name: 'Yellow' },
  { hue: 0, saturation: 80, inherentL: 50, name: 'Red' },
  { hue: 220, saturation: 80, inherentL: 40, name: 'Blue' },
  { hue: 120, saturation: 70, inherentL: 55, name: 'Green' },
  { hue: 280, saturation: 70, inherentL: 35, name: 'Purple' },
  { hue: 30, saturation: 85, inherentL: 60, name: 'Orange' },
  { hue: 180, saturation: 70, inherentL: 55, name: 'Cyan' },
];

type Phase = 'desaturate' | 'memory' | 'feedback';

export function V12ColourDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [mode, setMode] = useState<Mode>('desaturate');
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [currentPreset, setCurrentPreset] = useState<HuePreset | null>(null);
  const [memoryPreset, setMemoryPreset] = useState<HuePreset | null>(null);
  const [phase, setPhase] = useState<Phase>('desaturate');
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const pickNewPreset = () => {
    const preset = HUE_PRESETS[Math.floor(Math.random() * HUE_PRESETS.length)]!;
    setCurrentPreset(preset);
    setSelectedStep(null);
  };

  useEffect(() => {
    pickNewPreset();
  }, [mode]);

  const handleStepSelect = (step: number) => {
    setSelectedStep(step);
    const userL = (step / 9) * 100;
    const targetL = mode === 'desaturate' ? currentPreset!.inherentL : memoryPreset!.inherentL;
    const error = Math.abs(userL - targetL);
    const tolerance = mode === 'desaturate' ? Math.max(5, delta) : 2;
    const correct = error <= tolerance;
    setWasCorrect(correct);
    setPhase('feedback');
  };

  const handleContinue = () => {
    const correct = wasCorrect ?? false;
    const responseTime = Date.now() - startTime.current;
    onAnswer(correct, responseTime);
    if (mode === 'desaturate') {
      setMode('memory');
    } else {
      setMode('desaturate');
      pickNewPreset();
    }
    setPhase(mode === 'desaturate' ? 'desaturate' : 'memory');
  };

  const switchToMemory = () => {
    if (!currentPreset) return;
    setMemoryPreset(currentPreset);
    setMode('memory');
    setPhase('memory');
  };

  const currentTarget = mode === 'desaturate' ? currentPreset : memoryPreset;

  if (!currentTarget) return null;

  if (mode === 'desaturate') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <p className="text-lg text-neutral-200 mb-2">
          What value is this colour?
        </p>
        <p className="text-sm text-neutral-500 mb-8">
          Squint to eliminate hue. Judge the underlying value.
        </p>

        <div className="mb-12 rounded-lg overflow-hidden border border-neutral-700">
          <ColorChip
            hue={currentTarget.hue}
            saturation={currentTarget.saturation}
            lStar={currentTarget.inherentL}
            width={200}
            height={200}
          />
        </div>

        <ValueScale
          steps={10}
          width={400}
          height={60}
          selectedStep={selectedStep}
          onSelect={handleStepSelect}
        />

        <div className="flex justify-between text-xs text-neutral-500 mt-2" style={{ width: 400 }}>
          <span>1 (dark)</span>
          <span>10 (light)</span>
        </div>

        {phase === 'feedback' && (
          <div
            className={`mt-8 p-6 rounded-lg border ${wasCorrect
              ? 'bg-green-950/40 border-green-800'
              : 'bg-red-950/40 border-red-800'}`}
          >
            <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
            </p>
            <p className="text-sm text-neutral-300">
              True inherent value: <strong>L* {currentTarget.inherentL}</strong>.
              Your answer: <strong>{((selectedStep ?? 0) / 9 * 100).toFixed(0)}</strong>.
              Error: <strong>{formatDeltaL(Math.abs(currentTarget.inherentL - (selectedStep ?? 0) / 9 * 100))}</strong>.
            </p>
            <button
              onClick={switchToMemory}
              className="mt-4 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors"
            >
              Next: Inherent Value Memory (12B)
            </button>
          </div>
        )}
      </div>
    );
  }

  // Memory mode
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">
        What is the inherent value of {currentTarget.name}?
      </p>
      <p className="text-sm text-neutral-500 mb-8">
        Recall from memory: Yellow=8, Red=5, Blue=4, Green=5, Purple=3
      </p>

      <div className="mb-12 w-[200px] h-[200px] border-2 border-dashed border-neutral-700 rounded-lg flex items-center justify-center text-neutral-600">
        Colour hidden
      </div>

      <ValueScale
        steps={10}
        width={400}
        height={60}
        selectedStep={selectedStep}
        onSelect={handleStepSelect}
      />

      <div className="flex justify-between text-xs text-neutral-500 mt-2" style={{ width: 400 }}>
        <span>1 (dark)</span>
        <span>10 (light)</span>
      </div>

      {phase === 'feedback' && (
        <div
          className={`mt-8 p-6 rounded-lg border ${wasCorrect
            ? 'bg-green-950/40 border-green-800'
            : 'bg-red-950/40 border-red-800'}`}
        >
          <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            True inherent value: <strong>L* {currentTarget.inherentL}</strong>.
            Your answer: <strong>{((selectedStep ?? 0) / 9 * 100).toFixed(0)}</strong>.
            Error: <strong>{formatDeltaL(Math.abs(currentTarget.inherentL - (selectedStep ?? 0) / 9 * 100))}</strong>.
          </p>
          <button
            onClick={pickNewPreset}
            className="mt-4 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors"
          >
            New Colour
          </button>
        </div>
      )}
    </div>
  );
}