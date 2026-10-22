import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';

export function T3Estimation({ variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);
  const [guess, setGuess] = useState(2);
  const p = {
    ratioValue: Number(variableParams.ratioValue) || 2,
    ratioDirection: (variableParams.ratioDirection as any) || 'both',
    markType: (variableParams.markType as any) || 'two-dots',
    relationship: (variableParams.relationship as any) || 'parallel-same-axis',
    angle: Number(variableParams.angle) || 0,
    jointAngle: Number(variableParams.jointAngle) || 90,
    baseLength: Number(variableParams.baseLength) || 200,
    tolerance: Number(variableParams.tolerance) || 0.15,
    showLabels: (variableParams.showLabels as any) === 'on',
    dotSize: Number(stimulusParams.dotSize) || 14,
    lineThickness: Number(stimulusParams.lineThickness) || 3,
    lineStyle: (stimulusParams.lineStyle as any) || 'solid',
    contrast: (stimulusParams.contrast as any) || 'high',
    backgroundValue: (stimulusParams.backgroundValue as any) || 'mid',
    position: (stimulusParams.position as any) || 'centre',
    scale: Number(stimulusParams.scale) || 1,
    referenceUnit: (stimulusParams.referenceUnit as any) || 'absent',
  };

  const formProps = {
    markType: p.markType,
    relationship: p.relationship,
    angle: p.angle,
    jointAngle: p.jointAngle,
    baseLength: p.baseLength,
    dotSize: p.dotSize,
    lineThickness: p.lineThickness,
    lineStyle: p.lineStyle,
    contrast: p.contrast,
    position: p.position,
    backgroundValue: p.backgroundValue,
    scale: p.scale,
    showLabels: p.showLabels,
    showReferenceUnit: p.referenceUnit === 'present',
  };

  const ratio = useMemo(() => 1.2 + Math.random() * 4, []);

  const handle = () => {
    if (answered) return;
    setAnswered(true);
    const correct = Math.abs(guess - ratio) / ratio <= p.tolerance;
    setTimeout(() => onAnswer({
      correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: guess,
      correctResponse: ratio,
    }), 700);
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh]">
      <div className="flex-1 relative">
        <ExtentForm {...formProps} ratio={ratio} />
      </div>
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <p className="text-base mb-3 text-center">Estimate the ratio (target : reference)</p>
        <div className="flex flex-col items-center gap-3">
          <input
            type="range"
            min={1}
            max={8}
            step={0.05}
            value={guess}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="w-80"
          />
          <p className="text-sm text-neutral-400 font-mono">1 : {guess.toFixed(2)}</p>
          <p className="text-xs text-neutral-600 font-mono">Tolerance: ±{(p.tolerance * 100).toFixed(0)}%</p>
          <button onClick={handle} disabled={answered} className="mt-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 rounded-lg font-semibold">CONFIRM</button>
        </div>
      </div>
    </div>
  );
}
