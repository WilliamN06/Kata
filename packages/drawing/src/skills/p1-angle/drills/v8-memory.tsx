import { useEffect, useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { angleDifference } from '../angle-utils';

type Phase = 'memorize' | 'delay' | 'recall' | 'feedback';

export function V8MemoryDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('memorize');
  const [countdown, setCountdown] = useState(3);
  const [recalledAngle, setRecalledAngle] = useState(90);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const autoContinue = settings?.autoContinue ?? true;
  const feedbackDurationMs = settings?.feedbackDurationMs ?? 1500;

  const targetAngle = useMemo(() => 20 + Math.random() * 140, []);
  const delaySeconds = Math.max(2, 8 - delta / 2);

  useEffect(() => {
    if (phase === 'memorize') {
      const t = setTimeout(() => setPhase('delay'), 3000);
      return () => clearTimeout(t);
    }
    if (phase === 'delay') {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            setPhase('recall');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleRecall = (drawnAngle: number) => {
    setRecalledAngle(drawnAngle);
    setPhase('feedback');

    const error = Math.abs(drawnAngle - targetAngle);
    const tolerance = Math.max(5, delta);
    const correct = error <= tolerance;
    setWasCorrect(correct);

    const responseTime = Date.now() - startTime.current;

    if (autoContinue) {
      setTimeout(() => {
        onAnswer(correct, responseTime);
      }, feedbackDurationMs);
    }
  };

  const handleContinue = () => {
    const responseTime = Date.now() - startTime.current;
    onAnswer(wasCorrect ?? false, responseTime);
  };

  const error = angleDifference(targetAngle, recalledAngle);

  if (phase === 'memorize') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-neutral-200 mb-8">Memorize this angle</p>
        <AngleChip angle={targetAngle} width={300} height={280} />
        <p className="text-sm text-neutral-500 mt-8">Focus on the exact angle</p>
      </div>
    );
  }

  if (phase === 'delay') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-5xl text-neutral-200 mb-4">{countdown}</p>
        <p className="text-sm text-neutral-500">Hold the angle in mind</p>
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <p className="text-lg text-neutral-200 mb-8">
          What was the angle?
        </p>

        <AngleRecallSlider onAngleChange={handleRecall} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="mb-8">
        <AngleChip
          angle={targetAngle}
          width={300}
          height={280}
          mode="both-lines-dots"
          showAnnotation={true}
          showReference={true}
          referenceAngle={90}
        />
      </div>

      <div
        className={`mt-8 p-6 rounded-lg border ${wasCorrect
          ? 'bg-green-950/40 border-green-800'
          : 'bg-red-950/40 border-red-800'}`}
      >
        <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
        </p>
        <p className="text-sm text-neutral-300">
          Target angle: <strong>{targetAngle.toFixed(1)}°</strong>
        </p>
        <p className="text-sm text-neutral-300">
          Your angle: <strong>{recalledAngle.toFixed(1)}°</strong>
        </p>
        <p className="text-sm text-neutral-300">
          Error: <strong>{error.toFixed(1)}°</strong>
        </p>

        {!autoContinue && <ContinueButton onClick={handleContinue} />}
      </div>
    </div>
  );
}

function AngleRecallSlider({ onAngleChange }: { onAngleChange: (angle: number) => void }) {
  const [angle, setAngle] = useState(90);

  return (
    <div className="flex flex-col items-center gap-8">
      <AngleChip angle={angle} width={300} height={280} />

      <input
        type="range"
        min={0}
        max={180}
        value={angle}
        onChange={(e) => setAngle(Number(e.target.value))}
        className="w-80"
      />

      <p className="text-sm text-neutral-500">{angle}°</p>

      <button
        onClick={() => onAngleChange(angle)}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
      >
        CONFIRM
      </button>
    </div>
  );
}