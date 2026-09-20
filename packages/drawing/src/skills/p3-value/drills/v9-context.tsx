import { useEffect, useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ValueChip, ValueScale } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { formatDeltaL } from '../p3-utils';

type Phase = 'normal' | 'blurred' | 'judging' | 'feedback';

export function V9ContextDrill({ delta, onAnswer, calibratedLStar, task }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('normal');
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [firstJudgment, setFirstJudgment] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const targetL = useMemo(() => 45 + Math.random() * 20, []);

  // Interference: texture noise around the target
  const noise = useMemo(() => {
    return Array.from({ length: 200 }).map(() => ({
      x: Math.random() * 400,
      y: Math.random() * 300,
      size: 2 + Math.random() * 8,
      lStar: Math.random() * 100,
    }));
  }, []);

  useEffect(() => {
    if (phase !== 'normal') return;
    const timer = setTimeout(() => setPhase('blurred'), 800);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleStepSelect = (step: number) => {
    if (phase === 'blurred') {
      setFirstJudgment(step);
      setSelectedStep(null);
      setPhase('judging');
      return;
    }
    // Final judgment
    setSelectedStep(step);
    const userL = (step / 9) * 100;
    const error = Math.abs(userL - targetL);
    const tolerance = Math.max(1, delta / 2);
    const correct = error <= tolerance;
    setWasCorrect(correct);
    setPhase('feedback');
  };

  const handleContinue = () => {
    const correct = wasCorrect ?? false;
    const responseTime = Date.now() - startTime.current;
    onAnswer(correct, responseTime);
    setPhase('normal');
  };

  const showBlur = phase === 'blurred' || phase === 'judging';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-2">
        {phase === 'normal' && 'What value is the center square?'}
        {phase === 'blurred' && 'Now squint — re-judge the center square'}
        {phase === 'judging' && 'Final judgment — trust the blurred view'}
        {phase === 'feedback' && 'Results'}
      </p>
      <p className="text-sm text-neutral-500 mb-8">
        {phase === 'normal'
          ? 'Texture will interfere — get ready to squint'
          : 'Ignore the texture; see the pure value'}
      </p>

      <div
        className="relative rounded-lg overflow-hidden border border-neutral-700 mb-12"
        style={{ width: 400, height: 300 }}
      >
        {/* Texture background */}
        <div
          className="absolute inset-0"
          style={{
            background: '#1a1a1a',
            filter: showBlur ? 'blur(8px)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        >
          {noise.map((n, i) => (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: n.x,
                top: n.y,
                width: n.size,
                height: n.size,
                background: `rgb(${calibratedLStar(n.lStar)}, ${calibratedLStar(n.lStar)}, ${calibratedLStar(n.lStar)})`,
              }}
            />
          ))}
        </div>

        {/* Target square in center */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            filter: showBlur ? 'blur(8px)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        >
          <ValueChip lStar={calibratedLStar(targetL)} width={100} height={100} />
        </div>
      </div>

      <ValueScale
        steps={10}
        width={400}
        height={60}
        selectedStep={selectedStep}
        onSelect={handleStepSelect}
      />

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
            True value: <strong>{targetL.toFixed(0)}</strong>.
            First judgment (normal): step <strong>{(firstJudgment ?? 0) + 1}</strong>.
            Second judgment (blurred): step <strong>{(selectedStep ?? 0) + 1}</strong>.
            Final error: <strong>{formatDeltaL(Math.abs(targetL - (selectedStep ?? 0) / 9 * 100))}</strong>.
          </p>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}