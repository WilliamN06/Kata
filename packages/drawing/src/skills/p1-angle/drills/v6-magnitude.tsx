import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { AngleChip } from '@kata/rendering';
import { ContinueButton } from '@kata/ui';
import {
  classifyAngle,
  describeDirection,
  resolveMagnitudeAngle,
  resolveMagnitudeTolerance,
  type MagnitudeDirection,
} from '../angle-utils';

export function V6MagnitudeDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [entered, setEntered] = useState('');

  const autoContinue = settings?.autoContinue ?? true;
  const feedbackDurationMs = settings?.feedbackDurationMs ?? 1500;

  // Variable parameters (config-driven)
  const angleMin = Number.isFinite(Number(settings?.angleMin)) ? Number(settings?.angleMin) : 0;
  const angleMax = Number.isFinite(Number(settings?.angleMax)) ? Number(settings?.angleMax) : 180;
  const includeReflex = settings?.includeReflex === true;
  const showAnnotation = settings?.showAnnotation === true;
  const direction = (settings?.magnitudeDirection as MagnitudeDirection) ?? 'random';
  const tolerance = resolveMagnitudeTolerance(settings?.magnitudeTolerance, 5);

  // Reference ray follows the angleReferenceType setting (default vertical).
  const referenceType = (settings?.angleReferenceType as string) ?? 'vertical';
  const referenceAngle = referenceType === 'horizontal' ? 0 : 90;
  const showReference = referenceType !== 'none';

  const angle = useMemo(
    () => resolveMagnitudeAngle(angleMin, angleMax, includeReflex, direction),
    [angleMin, angleMax, includeReflex, direction]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answered) return;
    const value = parseFloat(entered);
    if (Number.isNaN(value)) return;

    setAnswered(true);
    const correct = Math.abs(value - angle) <= tolerance;
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

  const trueType = classifyAngle(angle);
  const displayAngle = angle > 180 ? angle - 360 : angle;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="mb-8">
        <AngleChip
          angle={displayAngle}
          width={300}
          height={280}
          mode={answered ? 'both-lines-dots' : 'two-lines'}
          showAnnotation={answered || showAnnotation}
          showReference={showReference}
          referenceAngle={referenceAngle}
        />
      </div>

      <p className="text-lg text-neutral-200 mb-1">
        Enter this angle's magnitude in degrees:
      </p>
      <p className="text-sm text-neutral-500 mb-2">
        {describeDirection(angle)}. Within {tolerance.toFixed(0)}° of the true angle.
      </p>
      <p className="text-xs text-neutral-600 mb-6">{trueType} angle</p>

      <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-8">
        <input
          type="number"
          step="1"
          min="0"
          max="360"
          value={entered}
          onChange={(e) => setEntered(e.target.value)}
          disabled={answered}
          autoFocus
          className="w-40 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-center text-2xl font-mono text-neutral-100 focus:outline-none focus:border-blue-500"
          placeholder="0–360"
        />
        <span className="text-neutral-400">°</span>
        <button
          type="submit"
          disabled={answered}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-semibold transition-colors"
        >
          SUBMIT
        </button>
      </form>

      {answered && wasCorrect !== null && (
        <div
          className={`mt-2 p-6 rounded-lg border ${
            wasCorrect
              ? 'bg-green-950/40 border-green-800'
              : 'bg-red-950/40 border-red-800'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </p>
          <p className="text-sm text-neutral-300">
            The angle was <strong>{angle.toFixed(0)}°</strong> —{' '}
            <strong>{trueType}</strong>, opening {describeDirection(angle)}. You entered{' '}
            <strong>{entered}°</strong>.
          </p>

          {!autoContinue && <ContinueButton onClick={handleContinue} />}
        </div>
      )}
    </div>
  );
}