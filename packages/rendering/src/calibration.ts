import type { CalibrationData } from '@kata/core';

export const DEFAULT_CALIBRATION: CalibrationData = {
  gamma: 1.0,
  blackPoint: 0.0,
  whitePoint: 100.0,
  date: new Date().toISOString(),
};

/**
 * Validate a calibration object.
 * Returns true if the calibration is safe to apply.
 */
export function isCalibrationValid(cal: CalibrationData | null | undefined): cal is CalibrationData {
  if (!cal) return false;
  if (!Number.isFinite(cal.gamma)) return false;
  if (cal.gamma < 0.5 || cal.gamma > 5) return false;
  if (!Number.isFinite(cal.blackPoint)) return false;
  if (!Number.isFinite(cal.whitePoint)) return false;
  if (cal.blackPoint < 0 || cal.blackPoint > 100) return false;
  if (cal.whitePoint < 0 || cal.whitePoint > 100) return false;
  if (cal.whitePoint <= cal.blackPoint) return false;
  if (cal.whitePoint - cal.blackPoint < 20) return false; // too narrow
  return true;
}

/**
 * Apply calibration to a target L* value.
 *
 * Maps [0, 100] to [blackPoint, whitePoint], then applies the gamma curve.
 * For identity calibration (gamma=1, black=0, white=100), returns input unchanged.
 *
 * If calibration is null or invalid, returns the input unchanged.
 */
export function applyCalibration(
  targetLStar: number,
  cal: CalibrationData | null | undefined
): number {
  // Sanitize input
  if (!Number.isFinite(targetLStar)) {
    return 50; // safe fallback
  }
  const input = Math.max(0, Math.min(100, targetLStar));

  // No calibration or invalid calibration → return input
  if (!isCalibrationValid(cal)) {
    return input;
  }

  // Normalize input to 0–1
  const normalized = input / 100;

  // Map to calibrated range (0–100 scale)
  const range = cal.whitePoint - cal.blackPoint;
  const mapped = cal.blackPoint + normalized * range;

  // Apply gamma on 0–100 scale. `Math.pow(0, n)` is well-defined (0) for the
  // validated gamma range, so no positive floor is applied — this keeps an
  // identity calibration (gamma=1, black=0, white=100) exact at 0.
  const safeMapped = Math.max(0, Math.min(100, mapped));
  const corrected = 100 * Math.pow(safeMapped / 100, 1 / cal.gamma);

  // Final clamp — must be in 0–100
  if (!Number.isFinite(corrected)) {
    console.warn('[applyCalibration] produced non-finite, returning input:', corrected);
    return input;
  }

  return Math.max(0, Math.min(100, corrected));
}