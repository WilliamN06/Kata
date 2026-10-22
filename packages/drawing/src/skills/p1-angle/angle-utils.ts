/**
 * Difference between two angles, normalized to 0-180.
 */
export function angleDifference(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Describe a tilt relative to vertical (90°).
 */
export function describeVerticalTilt(angle: number): {
  degrees: number;
  direction: 'left' | 'right' | 'none';
} {
  const diff = angle - 90;
  const degrees = Math.abs(diff);
  if (degrees < 0.05) return { degrees: 0, direction: 'none' };
  return {
    degrees,
    direction: diff > 0 ? 'right' : 'left',
  };
}

/**
 * Describe a tilt relative to horizontal (0°).
 */
export function describeHorizontalTilt(angle: number): {
  degrees: number;
  direction: 'up' | 'down' | 'none';
} {
  const diff = angle;
  const degrees = Math.abs(diff);
  if (degrees < 0.05) return { degrees: 0, direction: 'none' };
  return {
    degrees,
    direction: diff > 0 ? 'up' : 'down',
  };
}

/**
 * Classify angle type.
 */
export function classifyAngle(angle: number): 'acute' | 'right' | 'obtuse' | 'reflex' {
  if (angle < 90) return 'acute';
  if (angle === 90) return 'right';
  if (angle < 180) return 'obtuse';
  return 'reflex';
}

/**
 * The opening direction of an angle relative to its reference ray (horizontal,
 * pointing right). Used by the angle-magnitude drill so the direction the
 * angle opens is explicit and controllable.
 */
export type MagnitudeDirection = 'above' | 'below' | 'random';

export const MAGNITUDE_DIRECTIONS: MagnitudeDirection[] = ['above', 'below', 'random'];

/**
 * Describe which way an angle opens relative to the horizontal reference.
 * `deg` may be any real number; it is normalised to [0, 360).
 */
export function describeDirection(deg: number): string {
  const norm = ((deg % 360) + 360) % 360;
  if (norm === 0) return 'flat along the reference';
  if (norm < 90) return `opening counterclockwise above the reference (${norm.toFixed(0)}°)`;
  if (norm === 90) return 'opening straight up (90°)';
  if (norm < 180) return `opening clockwise, past vertical, above the reference (${norm.toFixed(0)}°)`;
  if (norm === 180) return 'straight (180°)';
  if (norm < 270) return `opening clockwise, below the reference (${norm.toFixed(0)}° interior)`;
  return `opening counterclockwise, below the reference (${(360 - norm).toFixed(0)}° reflex)`;
}

/**
 * Resolve a magnitude angle given a numeric min/max range, whether reflex angles
 * are allowed, and the requested opening direction. This is a pure, testable
 * core of the angle-magnitude drill's stimulus generation.
 *
 * - `min`/`max` are the numeric angle-range bounds from the drill settings.
 * - `direction === 'above'` keeps the interior angle in [0, 180].
 * - `direction === 'below'` keeps the interior angle in (180, 360).
 * - `direction === 'random'` leaves the generated angle untouched.
 * - `includeReflex === false` clamps any reflex angle back to [0, 180].
 */
export function resolveMagnitudeAngle(
  min: number,
  max: number,
  includeReflex: boolean,
  direction: MagnitudeDirection,
  rng: () => number = Math.random
): number {
  // Defensive: never let NaN/undefined bounds propagate.
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : 180;
  const lo = Math.max(0, Math.min(360, safeMin));
  const hi = Math.max(lo, Math.min(360, safeMax));

  let base: number;
  if (hi <= lo) {
    base = lo;
  } else {
    base = lo + rng() * (hi - lo);
  }

  if (direction === 'above' && base > 180) {
    base = 360 - base;
  } else if (direction === 'below' && base <= 180) {
    base = 360 - base;
  }

  if (!includeReflex && base > 180) {
    base = 360 - base;
  }

  // Final safety net — a finite angle in [0, 360).
  if (!Number.isFinite(base)) return 90;
  return base;
}

/**
 * Resolve the correctness tolerance in degrees from a user setting. The setting
 * is expected to be a number (from the numbered input). Any unparsable value
 * (e.g. a legacy 'tight'/'moderate'/'loose' string) falls back to `fallback`.
 */
export function resolveMagnitudeTolerance(
  setting: unknown,
  fallback = 5
): number {
  if (typeof setting === 'number' && Number.isFinite(setting)) return setting;
  if (typeof setting === 'string') {
    const parsed = parseFloat(setting);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}