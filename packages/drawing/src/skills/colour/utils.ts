/**
 * Colour math utilities for the Colour subskill.
 *
 * Uses HSL internally for hue/chroma rendering, but converts
 * to CIE L* for value rendering to match P3 Value and ensure
 * perceptual accuracy.
 *
 * All functions are browser-safe (no Node dependencies).
 */

// -----------------------------------------------------------------
// CIE L* → sRGB (for value rendering)
// -----------------------------------------------------------------

export function lStarToSrgb(lStar: number): number {
  const L = Math.max(0, Math.min(100, lStar));
  let Y: number;
  if (L > 8) {
    Y = Math.pow((L + 16) / 116, 3);
  } else {
    Y = L / 903.3;
  }
  let srgb: number;
  if (Y > 0.0031308) {
    srgb = 1.055 * Math.pow(Y, 1 / 2.4) - 0.055;
  } else {
    srgb = 12.92 * Y;
  }
  return Math.round(Math.max(0, Math.min(255, srgb * 255)));
}

// -----------------------------------------------------------------
// HSL → RGB (for hue + chroma rendering)
// -----------------------------------------------------------------

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = ((h % 360) + 360) % 360 / 360;
  const ss = Math.max(0, Math.min(100, s)) / 100;
  const ll = Math.max(0, Math.min(100, l)) / 100;

  if (ss === 0) {
    const v = Math.round(ll * 255);
    return [v, v, v];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;

  return [
    Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, hh) * 255),
    Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  ];
}

// -----------------------------------------------------------------
// HSL → CSS rgb string
// -----------------------------------------------------------------

export function hslToCss(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return `rgb(${r}, ${g}, ${b})`;
}

// -----------------------------------------------------------------
// Render a colour from HUE + CHROMA + VALUE (L*)
// -----------------------------------------------------------------

/**
 * Render a colour with a specific hue, chroma, and value.
 * Uses HSL where L is derived from the desired CIE L*.
 *
 * This is the accurate way to render a colour at a specific
 * perceived lightness — the CIE L* maps to lightness, then
 * HSL lightness is scaled to match.
 */
export function colourToCss(hue: number, chroma: number, lStar: number): string {
  // HSL lightness that approximates the desired L* is roughly L*/100
  // but need to account for chroma reducing perceived lightness.
  // Approximate: HSL lightness = L*/100 * (1 - chroma/300)
  const hslL = Math.max(0, Math.min(100, (lStar / 100) * (1 - chroma / 400) * 100));
  return hslToCss(hue, chroma, hslL);
}

// -----------------------------------------------------------------
// Hue family classification
// -----------------------------------------------------------------

export type HueFamily = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'violet' | 'magenta';

export function hueToFamily(hue: number): HueFamily {
  const h = ((hue % 360) + 360) % 360;
  if (h < 15 || h >= 345) return 'red';
  if (h < 45) return 'orange';
  if (h < 75) return 'yellow';
  if (h < 165) return 'green';
  if (h < 195) return 'cyan';
  if (h < 255) return 'blue';
  if (h < 285) return 'violet';
  return 'magenta';
}

// -----------------------------------------------------------------
// Chroma buckets for categorical classification
// -----------------------------------------------------------------

export function chromaToCategory(chroma: number): 'grey' | 'muted' | 'moderate' | 'vivid' {
  if (chroma < 15) return 'grey';
  if (chroma < 40) return 'muted';
  if (chroma < 70) return 'moderate';
  return 'vivid';
}

// -----------------------------------------------------------------
// Value buckets (L*) for categorical classification
// -----------------------------------------------------------------

export function lStarToCategory(lStar: number): string {
  if (lStar < 10) return 'very dark (L* < 10)';
  if (lStar < 30) return 'dark (L* 10–30)';
  if (lStar < 50) return 'low mid (L* 30–50)';
  if (lStar < 70) return 'high mid (L* 50–70)';
  if (lStar < 90) return 'light (L* 70–90)';
  return 'very light (L* > 90)';
}

// -----------------------------------------------------------------
// Random helpers
// -----------------------------------------------------------------

export function randomHue(): number {
  return Math.floor(Math.random() * 360);
}

export function randomChroma(): number {
  return Math.floor(Math.random() * 100);
}

export function randomLStar(): number {
  return Math.floor(Math.random() * 100);
}
