// ─────────────────────────────────────────────────────────────
// P2 Proportion — shared utilities
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Ratio helpers (V1, V3, V4, V6, V7, V9, V10, V12)
// ─────────────────────────────────────────────────────────────

/** The ratio options shown to the user as "1:N". */
export const RATIO_OPTIONS: number[] = [1, 2, 3, 4, 5, 6, 8, 10];

/** Ratio ranges per range key. Values are the max B in "1:B". */
export const RATIO_RANGES: Record<string, [number, number]> = {
  narrow: [1, 3],
  moderate: [1, 6],
  wide: [1, 10],
  full: [1, 10],
  random: [1, 10],
};

/**
 * Pick a ratio (A:B) from a range key.
 * A is always 1; B is drawn from the selected range.
 */
export function resolveRatio(rangeKey: string): { a: number; b: number } {
  const entry = RATIO_RANGES[rangeKey] ?? RATIO_RANGES['moderate'] ?? [1, 6];
  const lo = entry[0] ?? 1;
  const hi = entry[1] ?? 6;
  const b = lo + Math.floor(Math.random() * (hi - lo + 1));
  return { a: 1, b };
}

/**
 * Is the picked ratio within tolerance of the true ratio?
 * Comparison is on the B value (A is always 1).
 */
export function ratioWithinTolerance(pickedB: number, trueB: number, tolerance = 0): boolean {
  return Math.abs(pickedB - trueB) <= tolerance;
}

// ─────────────────────────────────────────────────────────────
// Distance helpers (V5)
// ─────────────────────────────────────────────────────────────

export const DISTANCE_RANGES: Record<string, [number, number]> = {
  short: [50, 150],
  medium: [150, 350],
  long: [350, 500],
  full: [50, 500],
  random: [50, 500],
};

/**
 * Resolve a distance range key + staircase delta to a single pixel distance.
 * Higher delta → smaller distance → harder task.
 */
export function resolveDistance(rangeKey: string, delta = 0): number {
  const entry = DISTANCE_RANGES[rangeKey] ?? DISTANCE_RANGES['medium'] ?? [150, 350];
  const minPx = entry[0] ?? 150;
  const maxPx = entry[1] ?? 350;
  const t = Math.max(0, Math.min(1, delta / 50));
  return maxPx - t * (maxPx - minPx);
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