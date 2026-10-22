import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';

export function T7Identification({ variableParams, stimulusParams, onAnswer }: DrillProps) {
  const startTime = useRef(Date.now());
  const [answered, setAnswered] = useState(false);

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

  const ratio = useMemo(() => {
    const pool = [1.5, 2, 2.5, 3, 4, 5];
    return pool[Math.floor(Math.random() * pool.length)] as number;
  }, []);

  const correct = '1:' + ratio.toFixed(2);

  const options = useMemo(() => {
    const pool = [ratio, ratio + 0.5, ratio - 0.5, ratio + 1];
    const formatted = pool.map((r) => '1:' + r.toFixed(2));
    return [...new Set(formatted)].sort(() => Math.random() - 0.5).slice(0, 4);
  }, [ratio]);

  const handle = (choice: string) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: choice === correct,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: choice,
      correctResponse: correct,
    }), 700);
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh]">
      <div className="flex-1 relative">
        <ExtentForm {...formProps} ratio={ratio} />
      </div>
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <p className="text-base mb-3 text-center">What is the ratio?</p>
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          {options.map((o) => (
            <button key={o} onClick={() => handle(o)} disabled={answered} className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold font-mono text-sm">{o}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
