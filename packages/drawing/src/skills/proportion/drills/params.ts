import type { ExtentFormProps } from '../stimuli/ExtentForm';

export type RatioDirection = 'a-to-b' | 'b-to-a' | 'both';

export function readProportionParams(
  variableParams: Record<string, string | number>,
  stimulusParams: Record<string, string | number>
) {
  return {
    ratioDirection: (variableParams.ratioDirection as RatioDirection) || 'both',
    markType: (variableParams.markType as string) || 'line-with-dots',
    relationship:
      (variableParams.relationship as string) || 'parallel-same-axis',
    angle: Number(variableParams.angle) || 0,
    jointAngle: Number(variableParams.jointAngle) || 90,
    baseLength: Number(variableParams.baseLength) || 35,
    tolerance: Number(variableParams.tolerance) || 0.15,
    showLabels: String(variableParams.showLabels) === 'on',
    dotSize: Number(stimulusParams.dotSize) || 14,
    lineThickness: Number(stimulusParams.lineThickness) || 3,
    lineStyle: (stimulusParams.lineStyle as string) || 'solid',
    contrast: (stimulusParams.contrast as string) || 'high',
    backgroundValue: (stimulusParams.backgroundValue as string) || 'dark',
    position: (stimulusParams.position as string) || 'centre',
    scale: Number(stimulusParams.scale) || 1,
    referenceUnit: (stimulusParams.referenceUnit as string) || 'absent',
  };
}

export function resolveRatio(currentValue: number, fallback = 2): number {
  const value = Number(currentValue);
  const ratio = Number.isFinite(value) && value > 0 ? value : fallback;
  return Math.min(12, Math.max(1.05, ratio));
}

export function resolveExtentRatio(
  ratio: number,
  direction: RatioDirection,
  random: () => number = Math.random
): number {
  const bIsLonger =
    direction === 'a-to-b'
      ? true
      : direction === 'b-to-a'
        ? false
        : random() >= 0.5;
  return bIsLonger ? ratio : 1 / ratio;
}

export function ratioOptions(target: number, count = 4): number[] {
  const clamp = (value: number) => Math.min(12, Math.max(1.05, value));
  const candidates = [
    target,
    target - 0.35,
    target + 0.4,
    target * 0.7,
    target * 1.35,
    target - 0.9,
    target + 0.9,
    target * 0.5,
    target * 1.6,
    target - 1.8,
    target + 1.8,
  ];

  const unique: number[] = [];
  for (const candidate of candidates) {
    const value = Number(clamp(candidate).toFixed(2));
    if (!unique.includes(value)) unique.push(value);
    if (unique.length === count) break;
  }

  return unique.sort(() => Math.random() - 0.5);
}

export function formPropsFromParams(
  p: ReturnType<typeof readProportionParams>
): Omit<ExtentFormProps, 'ratio'> {
  return {
    markType: p.markType as ExtentFormProps['markType'],
    relationship: p.relationship as ExtentFormProps['relationship'],
    angle: p.angle,
    jointAngle: p.jointAngle,
    baseLength: p.baseLength,
    dotSize: p.dotSize,
    lineThickness: p.lineThickness,
    lineStyle: p.lineStyle as ExtentFormProps['lineStyle'],
    contrast: p.contrast as ExtentFormProps['contrast'],
    position: p.position as ExtentFormProps['position'],
    backgroundValue:
      p.backgroundValue as ExtentFormProps['backgroundValue'],
    scale: p.scale,
    showLabels: p.showLabels,
    showReferenceUnit: p.referenceUnit === 'present',
  };
}
