import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { LineChip, AngleChip } from '@kata/rendering';

export function GroupBDrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<'direction' | 'reference' | 'magnitude'>('direction');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const angleDisplayMode = settings?.angleDisplayMode ?? 'line';

  const stimulus = useMemo(() => {
    const tiltsRight = Math.random() > 0.5;
    const refIndex = Math.floor(Math.random() * 5);
    const angleType = Math.floor(Math.random() * 4);
    const angle =
      angleType === 0 ? 15 + Math.random() * 70 :
      angleType === 1 ? 90 :
      angleType === 2 ? 95 + Math.random() * 75 :
      185 + Math.random() * 165;

    return {
      direction: { tiltsRight, angle: tiltsRight ? 90 + delta : 90 - delta },
      reference: {
        refIndex,
        lines: Array.from({ length: 5 }, (_, i) => ({
          angle: i === refIndex ? 90 : 90 + (Math.random() - 0.5) * delta * 3,
        })),
      },
      magnitude: { angle },
    };
  }, [delta]);

  const handleSubAnswer = (correct: boolean) => {
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (phase === 'direction') setPhase('reference');
    else if (phase === 'reference') setPhase('magnitude');
    else {
      const allCorrect = newAnswers.every((a) => a);
      onAnswer(allCorrect, Date.now() - startTime.current);
    }
  };

  if (phase === 'direction') {
    const saidRight = () => stimulus.direction.tiltsRight;
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <LineChip angle={stimulus.direction.angle} width={240} height={320} mode={angleDisplayMode} />
        <p className="text-lg mt-8 mb-4">Which way does this tilt?</p>
        <div className="flex gap-4">
          <button onClick={() => handleSubAnswer(!saidRight())}>← LEFT</button>
          <button onClick={() => handleSubAnswer(saidRight())}>RIGHT →</button>
        </div>
      </div>
    );
  }

  if (phase === 'reference') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <p className="text-lg mb-8">Which is vertical?</p>
        <div className="flex gap-4">
          {stimulus.reference.lines.map((line, i) => (
            <button
              key={i}
              onClick={() => handleSubAnswer(i === stimulus.reference.refIndex)}
            >
              <LineChip angle={line.angle} width={80} height={240} mode={angleDisplayMode} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const trueType =
    stimulus.magnitude.angle < 90 ? 'acute' :
    stimulus.magnitude.angle === 90 ? 'right' :
    stimulus.magnitude.angle < 180 ? 'obtuse' : 'reflex';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <AngleChip angle={stimulus.magnitude.angle > 180 ? stimulus.magnitude.angle - 360 : stimulus.magnitude.angle} width={300} height={280} />
      <p className="text-lg mt-8 mb-4">Classify:</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleSubAnswer(trueType === 'acute')}>ACUTE</button>
        <button onClick={() => handleSubAnswer(trueType === 'right')}>RIGHT</button>
        <button onClick={() => handleSubAnswer(trueType === 'obtuse')}>OBTUSE</button>
        <button onClick={() => handleSubAnswer(trueType === 'reflex')}>REFLEX</button>
      </div>
    </div>
  );
}