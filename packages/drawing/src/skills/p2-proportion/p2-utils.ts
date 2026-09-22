// ─────────────────────────────────────────────────────────────
// P2 Proportion — shared utilities
// ─────────────────────────────────────────────────────────────

export const RATIO_OPTIONS: number[] = [1, 2, 3, 4, 5, 6, 8, 10];

export const RATIO_RANGES: Record<string, [number, number]> = {
  narrow: [1, 3],
  moderate: [1, 6],
  wide: [1, 10],
  full: [1, 10],
  random: [1, 10],
};

export function resolveRatioRange(
  rangeKey: string | undefined,
  ratioMin: number | undefined,
  ratioMax: number | undefined,
): [number, number] {
  if (
    typeof ratioMin === 'number' &&
    typeof ratioMax === 'number' &&
    ratioMin <= ratioMax
  ) {
    return [Math.max(1, ratioMin), Math.min(20, ratioMax)];
  }
  const preset = RATIO_RANGES[rangeKey ?? 'moderate'] ?? RATIO_RANGES['moderate'] ?? [1, 6];
  return [preset[0], preset[1]];
}

export function resolveRatio(rangeKey: string): { a: number; b: number } {
  const [lo, hi] = RATIO_RANGES[rangeKey] ?? RATIO_RANGES['moderate'] ?? [1, 6];
  const b = lo + Math.floor(Math.random() * (hi - lo + 1));
  return { a: 1, b };
}

export function ratioWithinTolerance(
  pickedB: number,
  trueB: number,
  tolerance = 0,
): boolean {
  return Math.abs(pickedB - trueB) <= tolerance;
}

// ─────────────────────────────────────────────────────────────
// Distance helpers (V5)
// ─────────────────────────────────────────────────────────────

export const DISTANCE_RANGES_PCT: Record<string, [number, number]> = {
  short: [5, 20],
  medium: [15, 45],
  long: [35, 70],
  full: [5, 70],
  random: [5, 70],
};

export function resolveDistanceRangePct(
  rangeKey: string | undefined,
  minPct: number | undefined,
  maxPct: number | undefined,
): [number, number] {
  if (
    typeof minPct === 'number' &&
    typeof maxPct === 'number' &&
    minPct <= maxPct
  ) {
    return [Math.max(2, minPct), Math.min(95, maxPct)];
  }
  return DISTANCE_RANGES_PCT[rangeKey ?? 'medium'] ?? [15, 45];
}

export function pickDistancePct(minPct: number, maxPct: number): number {
  return minPct + Math.random() * (maxPct - minPct);
}

// ─────────────────────────────────────────────────────────────
// Position helpers (V11)
// ─────────────────────────────────────────────────────────────

export const POSITION_KEYS = [
  '1/2',
  '1/3',
  '2/3',
  '1/4',
  '3/4',
  'golden',
] as const;

export type PositionKey = (typeof POSITION_KEYS)[number];

export const POSITION_FRACTIONS: Record<string, number> = {
  '1/2': 0.5,
  '1/3': 1 / 3,
  '2/3': 2 / 3,
  '1/4': 0.25,
  '3/4': 0.75,
  golden: 0.618,
};

export const POSITION_LABELS: Record<string, string> = {
  '1/2': 'midpoint',
  '1/3': 'one-third point',
  '2/3': 'two-thirds point',
  '1/4': 'one-quarter point',
  '3/4': 'three-quarters point',
  golden: 'golden section',
};

// ─────────────────────────────────────────────────────────────
// Fraction helpers (V6)
// ─────────────────────────────────────────────────────────────

export const FRACTION_KEYS = ['1/4', '1/3', '1/2', '2/3', '3/4'] as const;
export type FractionKey = (typeof FRACTION_KEYS)[number];

export const FRACTIONS: Record<string, number> = {
  '1/4': 0.25,
  '1/3': 1 / 3,
  '1/2': 0.5,
  '2/3': 2 / 3,
  '3/4': 0.75,
};

// ─────────────────────────────────────────────────────────────
// Shared chip sizing constants
// ─────────────────────────────────────────────────────────────

export const CHIP_MAX_W = 900;
export const CHIP_HEIGHT = 70;
export const UNIT_BASE = 40;

/**
 * Compute the pixel size of a unit and the total chip dimensions given a
 * true ratio and orientation. Guarantees the chip never exceeds the
 * max dimension, and keeps the input visible below.
 */
export function scaledPairLayout(
  ratio: number,
  orientation: 'horizontal' | 'vertical',
  maxW = CHIP_MAX_W,
  maxH = 320,
): { unitPx: number; chipWidth: number; chipHeight: number } {
  const rawTotal = UNIT_BASE * ratio;
  if (orientation === 'horizontal') {
    const avail = maxW - 80;
    const scale = rawTotal > avail ? avail / rawTotal : 1;
    const u = Math.max(6, UNIT_BASE * scale);
    return {
      unitPx: u,
      chipWidth: Math.min(maxW, u * ratio + 80),
      chipHeight: CHIP_HEIGHT,
    };
  }
  const avail = maxH - 80;
  const scale = rawTotal > avail ? avail / rawTotal : 1;
  const u = Math.max(6, UNIT_BASE * scale);
  return {
    unitPx: u,
    chipWidth: CHIP_HEIGHT,
    chipHeight: Math.min(maxH, u * ratio + 80),
  };
}

// ─────────────────────────────────────────────────────────────
// Shared task/stimulus defaults
// ─────────────────────────────────────────────────────────────

export function readTaskTolerance(
  variableParams: Record<string, string | number> | undefined,
  fallback = 0,
): number {
  const v = variableParams?.task_tolerance;
  if (typeof v === 'number') return v;
  return fallback;
}

export function readStimulusColor(
  variableParams: Record<string, string | number> | undefined,
): { bg: string; bar: string } {
  const bgVal = (variableParams?.stim_backgroundValue as string) ?? 'dark';
  const contrast = (variableParams?.stim_contrast as string) ?? 'moderate';
  const bg = bgVal === 'light' ? '#D0D0D0' : bgVal === 'mid' ? '#808080' : '#1a1a1a';
  const bar = contrast === 'low' ? '#909090' : contrast === 'high' ? '#F5F5F5' : '#E0E0E0';
  return { bg, bar };
}

/**
 * Resolve the orientation for a trial.
 * Reads `variableParams.orientation`, defaulting to 'horizontal'.
 */
export function resolveOrientation(
  variableParams: Record<string, string | number> | undefined,
): 'horizontal' | 'vertical' {
  const raw = (variableParams?.orientation as string) ?? 'horizontal';
  if (raw === 'random') {
    return Math.random() > 0.5 ? 'horizontal' : 'vertical';
  }
  return raw === 'vertical' ? 'vertical' : 'horizontal';
}