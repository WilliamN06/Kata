import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { LineChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import { describeVerticalTilt } from '../angle-utils';

interface LineData {
  id: number;
  angle: number;
  isReference: boolean;
}

export function V5ReferenceDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [selectedLine, setSelectedLine] = useState<LineData | null>(null);

  const autoContinue = settings?.autoContinue ?? true;
  const feedbackDurationMs = settings?.feedbackDurationMs ?? 1500;
  const angleDisplayMode = settings?.angleDisplayMode ?? 'line';

  const lines = useMemo(() => {
    const refIndex = Math.floor(Math.random() * 5);
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      angle:
        i === refIndex
          ? 90
          : 90 + (Math.random() > 0.5 ? 1 : -1) * (delta / 2 + Math.random() * 5),
      isReference: i === refIndex,
    })) as LineData[];
  }, [delta]);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setAnswered(true);
    const line = lines[index];
    if (!line) return;
    setSelectedLine(line);

    const correct = line.isReference;
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-lg text-neutral-200 mb-8">
        Which line is the reference (vertical) line?
      </p>

      <div className="flex gap-4 mb-8">
        {lines.map((line, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={answered}
            className={`rounded-lg overflow-hidden border transition-colors disabled:opacity-50 ${
              answered
                ? line.isReference
                  ? 'border-green-500'
                  : selectedLine?.id === i
                  ? 'border-red-500'
                  : 'border-neutral-700'
                : 'border-neutral-700 hover:border-blue-500'
            }`}
          >
            <LineChip angle={line.angle} width={80} height={240} mode={angleDisplayMode} />
          </button>
        ))}
      </div>

      {answered && wasCorrect !== null && (
        <div
          className={`mt-8 p-6 rounded-lg border w-full max-w-md ${
            wasCorrect
              ? 'bg-green-950/40 border-green-800'
              : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300 mb-2">
            The reference line was perfectly vertical.
          </p>
          {!wasCorrect && selectedLine && (
            <p className="text-sm text-neutral-300">
              The line you selected was tilted{' '}
              <strong>
                {describeVerticalTilt(selectedLine.angle).degrees.toFixed(1)}°
              </strong>{' '}
              to the{' '}
              <strong>
                {describeVerticalTilt(selectedLine.angle).direction}
              </strong>{' '}
              from vertical.
            </p>
          )}

          {!autoContinue && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}