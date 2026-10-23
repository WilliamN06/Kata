export type AngleReferenceType =
  | 'vertical'
  | 'horizontal'
  | 'another-line'
  | 'custom'
  | 'none';

export type AngleCategory = 'acute' | 'right' | 'obtuse' | 'reflex';

export interface AngleParams {
  referenceType: AngleReferenceType;
  referenceAngle: number;
  lineLength: number;
  tolerance: number;
  comparisonOffset: number;
  lineThickness: number;
  lineContrast: 'low' | 'moderate' | 'high';
  lineStyle: 'solid' | 'dashed' | 'dotted';
  referenceVisibility: 'clear' | 'faint' | 'implied';
}

export function readAngleParams(
  variableParams: Record<string, string | number>,
  stimulusParams: Record<string, string | number>
): AngleParams {
  return {
    referenceType:
      (variableParams.referenceType as AngleReferenceType) || 'vertical',
    referenceAngle: Number(variableParams.referenceAngle) || 90,
    lineLength: Number(variableParams.lineLength) || 55,
    tolerance: Number(variableParams.tolerance) || 8,
    comparisonOffset: Number(variableParams.comparisonOffset) || 8,
    lineThickness: Number(stimulusParams.lineThickness) || 3,
    lineContrast:
      (stimulusParams.lineContrast as AngleParams['lineContrast']) || 'high',
    lineStyle:
      (stimulusParams.lineStyle as AngleParams['lineStyle']) || 'solid',
    referenceVisibility:
      (stimulusParams.referenceVisibility as AngleParams['referenceVisibility']) ||
      'clear',
  };
}

export function resolveAngle(currentValue: number, fallback = 45): number {
  const value = Number(currentValue);
  const angle = Number.isFinite(value) ? value : fallback;
  return ((angle % 360) + 360) % 360;
}

export function referenceDegrees(
  type: AngleReferenceType,
  customAngle: number
): number {
  if (type === 'vertical') return 90;
  if (type === 'horizontal') return 0;
  if (type === 'none') return 0;
  return customAngle;
}

export function classifyAngle(angle: number): AngleCategory {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized < 90) return 'acute';
  if (normalized === 90) return 'right';
  if (normalized < 180) return 'obtuse';
  return 'reflex';
}

export function angleDifference(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return diff > 180 ? 360 - diff : diff;
}
