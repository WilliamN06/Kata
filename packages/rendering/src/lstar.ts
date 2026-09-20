/**
 * CIE L* (0-100) to sRGB byte (0-255) conversion.
 * D65 illuminant, standard sRGB gamma curve.
 *
 * Guarantees an integer output in [0, 255]. Never returns NaN.
 */
export function lStarToSrgb(lStar: number): number {
  // Handle non-finite input
  if (!Number.isFinite(lStar)) return 128;

  // Clamp to 0-100
  const L = Math.max(0, Math.min(100, lStar));

  // L* → Y
  let Y: number;
  if (L > 8) {
    Y = Math.pow((L + 16) / 116, 3);
  } else {
    Y = L / 903.3;
  }

  // Y → sRGB (linear)
  const linear = Y;

  // Linear → sRGB (gamma)
  let srgb: number;
  if (linear > 0.0031308) {
    srgb = 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  } else {
    srgb = 12.92 * linear;
  }

  // Scale to 0-255, round, clamp
  const byte = Math.round(srgb * 255);
  if (!Number.isFinite(byte)) return 128;
  return Math.max(0, Math.min(255, byte));
}

/**
 * Returns a CSS-compatible rgb() string with integer byte values.
 * Never returns an invalid string.
 */
export function lStarToRgbString(lStar: number): string {
  const byte = lStarToSrgb(lStar);
  return `rgb(${byte}, ${byte}, ${byte})`;
}

export function lStarToHex(lStar: number): string {
  const byte = lStarToSrgb(lStar);
  const hex = byte.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

export function srgbToLStar(srgb: number): number {
  const s = Math.max(0, Math.min(255, srgb)) / 255;

  let linear: number;
  if (s > 0.04045) {
    linear = Math.pow((s + 0.055) / 1.055, 2.4);
  } else {
    linear = s / 12.92;
  }

  const Y = linear;

  let lStar: number;
  if (Y > 0.008856) {
    lStar = 116 * Math.pow(Y, 1 / 3) - 16;
  } else {
    lStar = 903.3 * Y;
  }

  return Math.max(0, Math.min(100, lStar));
}