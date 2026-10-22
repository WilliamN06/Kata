import { useMemo, useRef, useState } from 'react';
import type { DrillProps } from '@kata/core';
import { ExtentForm } from '../stimuli/ExtentForm';

export function T5Detection({ variableParams, stimulusParams, onAnswer }: DrillProps) {
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

  const isEqual = useMemo(() => Math.random() > 0.5, []);
  const ratio = isEqual ? 1 : 1.2 + Math.random() * 3;

  const handle = (saidEqual: boolean) => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer({
      correct: saidEqual === isEqual,
      responseTimeMs: Date.now() - startTime.current,
      userResponse: saidEqual,
      correctResponse: isEqual,
    }), 700);
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh]">
      <div className="flex-1 relative">
        <ExtentForm {...formProps} ratio={ratio} />
      </div>
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <p className="text-base mb-3 text-center">Are the two extents equal length?</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => handle(true)} disabled={answered} className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">EQUAL</button>
          <button onClick={() => handle(false)} disabled={answered} className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700 rounded-lg font-semibold">DIFFERENT</button>
        </div>
      </div>
    </div>
  );
}
