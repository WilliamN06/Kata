import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { LineChip } from '@kata/rendering';

export function GroupADrill({ delta, onAnswer, settings }: DrillProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<'vertical' | 'horizontal' | 'angled'>('vertical');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const angleDisplayMode = settings?.angleDisplayMode ?? 'line';

  const stimulus = useMemo(() => {
    return {
      verticalAngle: 90 + (Math.random() > 0.5 ? 1 : -1) * delta,
      horizontalAngle: (Math.random() > 0.5 ? 1 : -1) * delta,
      angledPair: {
        a: 30 + Math.random() * 60,
        b: 30 + Math.random() * 60,
      },
    };
  }, [delta]);

  const handleSubAnswer = (correct: boolean) => {
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (phase === 'vertical') setPhase('horizontal');
    else if (phase === 'horizontal') setPhase('angled');
    else {
      const allCorrect = newAnswers.every((a) => a);
      onAnswer(allCorrect, Date.now() - startTime.current);
    }
  };

  const renderStimulus = () => {
    if (phase === 'vertical') {
      return <LineChip angle={stimulus.verticalAngle} width={240} height={320} mode={angleDisplayMode} />;
    }
    if (phase === 'horizontal') {
      return <LineChip angle={stimulus.horizontalAngle} width={360} height={240} mode={angleDisplayMode} />;
    }
    return (
      <div className="flex gap-12">
        <LineChip angle={stimulus.angledPair.a} width={200} height={200} mode={angleDisplayMode} />
        <LineChip angle={stimulus.angledPair.b} width={200} height={200} mode={angleDisplayMode} />
      </div>
    );
  };

  const renderQuestion = () => {
    if (phase === 'vertical') {
      return (
        <>
          <p className="text-lg mb-4">Is this line vertical?</p>
          <div className="flex gap-4">
            <button onClick={() => handleSubAnswer(false)}>TILTED</button>
            <button onClick={() => handleSubAnswer(true)}>VERTICAL</button>
          </div>
        </>
      );
    }
    if (phase === 'horizontal') {
      return (
        <>
          <p className="text-lg mb-4">Is this line horizontal?</p>
          <div className="flex gap-4">
            <button onClick={() => handleSubAnswer(false)}>TILTED</button>
            <button onClick={() => handleSubAnswer(true)}>HORIZONTAL</button>
          </div>
        </>
      );
    }
    return (
      <>
        <p className="text-lg mb-4">Do these two lines match?</p>
        <div className="flex gap-4">
          <button onClick={() => handleSubAnswer(false)}>DIFFERENT</button>
          <button onClick={() => handleSubAnswer(true)}>SAME</button>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <p className="text-sm text-neutral-500 mb-4">
        Sub-question {answers.length + 1} of 3
      </p>
      <div className="mb-12">{renderStimulus()}</div>
      {renderQuestion()}
    </div>
  );
}