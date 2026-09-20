import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleChip, LineChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { angleDifference } from '../angle-utils';

export function V7ContextDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const autoContinue = settings?.autoContinue ?? true;
  const feedbackDurationMs = settings?.feedbackDurationMs ?? 1500;
  const angleDisplayMode = settings?.angleDisplayMode ?? 'line';

  const targetAngle = useMemo(() => 30 + Math.random() * 90, []);

  const distractors = useMemo(() => {
    return Array.from({ length: 3 }, () => ({
      angle: targetAngle + (Math.random() - 0.5) * delta * 6,
      x: 20 + Math.random() * 260,
      y: 20 + Math.random() * 220,
    }));
  }, [targetAngle, delta]);

  const matchAngle = targetAngle + (Math.random() > 0.5 ? delta : -delta);
  const areSame = Math.abs(matchAngle - targetAngle) < 0.1;

  const handleAnswer = (saysSame: boolean) => {
    if (answered) return;
    setAnswered(true);

    const correct = saysSame === areSame;
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

  const diff = angleDifference(targetAngle, matchAngle);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="relative rounded-lg overflow-hidden border border-neutral-700 mb-8" style={{ width: 300, height: 280 }}>
        {distractors.map((d, i) => (
          <div
            key={i}
            className="absolute opacity-30"
            style={{ left: d.x, top: d.y }}
          >
            <LineChip angle={d.angle} width={100} height={100} mode={angleDisplayMode} />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <AngleChip
            angle={targetAngle}
            width={200}
            height={180}
            mode={answered ? 'both-lines-dots' : 'two-lines'}
            showAnnotation={answered}
            showReference={true}
            referenceAngle={90}
          />
        </div>
      </div>

      <p className="text-lg text-neutral-200 mb-4">
        Does this match the reference angle?
      </p>

      <div className="rounded-lg overflow-hidden border border-neutral-700 mb-8">
        <AngleChip
          angle={matchAngle}
          width={200}
          height={180}
          mode={answered ? 'both-lines-dots' : 'two-lines'}
          showAnnotation={answered}
          showReference={true}
          referenceAngle={90}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
        >
          SAME
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={answered}
          className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold"
        >
          DIFFERENT
        </button>
      </div>

      {answered && wasCorrect !== null && (
        <div
          className={`mt-8 p-6 rounded-lg border ${wasCorrect
            ? 'bg-green-950/40 border-green-800'
            : 'bg-red-950/40 border-red-800'}`}
        >
          <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The angle difference was <strong>{diff.toFixed(1)}°</strong>.
          </p>

          {!autoContinue && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}