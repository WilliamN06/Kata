import type { ExtentFormProps } from '../stimuli/ExtentForm';

export type RatioDirection = 'a-to-b' | 'b-to-a' | 'both';

export function readProportionParams(
  variableParams: Record<string, string | number>,
  stimulusParams: Record<string, string | number>
) {
  const rawLower = Number(variableParams.lowerBound);
  const rawUpper = Number(variableParams.upperBound);
  const lowerBound = Number.isFinite(rawLower) && rawLower > 0 ? rawLower : 1;
  const upperBound = Number.isFinite(rawUpper) && rawUpper > 0 ? Math.max(lowerBound, rawUpper) : 10;

  return {
    lowerBound,
    upperBound,
    ratioDirection: (variableParams.ratioDirection as RatioDirection) ?? 'both',
    markType: (variableParams.markType as string) ?? 'line-with-dots',
    relationship:
      (variableParams.relationship as string) ?? 'parallel-same-axis',
    angle: Number.isFinite(Number(variableParams.angle)) ? Number(variableParams.angle) : 0,
    jointAngle: Number.isFinite(Number(variableParams.jointAngle)) ? Number(variableParams.jointAngle) : 90,
    baseLength: Number.isFinite(Number(variableParams.baseLength)) ? Number(variableParams.baseLength) : 80,
    tolerance: Number.isFinite(Number(variableParams.tolerance)) ? Number(variableParams.tolerance) : 0.15,
    showLabels: String(variableParams.showLabels) === 'on',
    dotSize: Number.isFinite(Number(stimulusParams.dotSize)) ? Number(stimulusParams.dotSize) : 14,
    lineThickness: Number.isFinite(Number(stimulusParams.lineThickness)) ? Number(stimulusParams.lineThickness) : 3,
    lineStyle: (stimulusParams.lineStyle as string) ?? 'solid',
    contrast: (stimulusParams.contrast as string) ?? 'high',
    backgroundValue: (stimulusParams.backgroundValue as string) ?? 'dark',
    position: (stimulusParams.position as string) ?? 'centre',
    scale: Number.isFinite(Number(stimulusParams.scale)) ? Number(stimulusParams.scale) : 1,
    referenceUnit: (stimulusParams.referenceUnit as string) ?? 'absent',
  };
}

export function resolveRatio(
  currentValue: number,
  fallback = 2,
  lowerBound = 1,
  upperBound = 10
): number {
  const value = Number(currentValue);
  const ratio = Number.isFinite(value) && value > 0 ? value : fallback;
  const whole = Math.round(ratio);
  const lower = Math.max(1, Math.round(lowerBound));
  const upper = Math.max(lower, Math.round(upperBound));
  return Math.min(upper, Math.max(lower, whole));
}

export function ratioForParams(
  currentValue: number,
  p: ReturnType<typeof readProportionParams>,
  fallback = 2
): number {
  return resolveRatio(
    currentValue,
    fallback,
    p.lowerBound,
    p.upperBound
  );
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
  // Keep the ratio a whole number; direction only decides which side is longer.
  return bIsLonger ? ratio : ratio;
}

export function formRatio(
  ratio: number,
  p: ReturnType<typeof readProportionParams>
): number {
  return p.markType === 'two-dots'
    ? ratio
    : resolveExtentRatio(ratio, p.ratioDirection);
}

export function ratioOptions(
  target: number,
  count = 4,
  lowerBound = 1,
  upperBound = 10
): number[] {
  const clamp = (value: number) =>
    Math.min(
      Math.max(lowerBound, upperBound),
      Math.max(Math.max(0.01, lowerBound), value)
    );
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
