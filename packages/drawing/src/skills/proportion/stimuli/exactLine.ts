/**
 * Lines whose *visible* length equals the intended length, for every style.
 *
 * Proportion drills compare lengths, so what is drawn must be exactly that long:
 * - round caps stick out half a thickness at each end, so dotted lines are inset
 *   by half a thickness and their dots spaced to land on both ends;
 * - a dash pattern can end on a gap and look short, so dashed lines get a pattern
 *   scaled to start and end on a dash.
 */
export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface ExactLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeDasharray?: string;
  strokeLinecap: 'butt' | 'round';
}

export function exactLine(x1: number, y1: number, x2: number, y2: number, style: LineStyle, thickness: number): ExactLine {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (style === 'solid' || len <= 0) return { x1, y1, x2, y2, strokeLinecap: 'butt' };
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  if (style === 'dotted') {
    // Dots (zero-length dashes with round caps) of diameter = thickness, the first
    // and last centred half a thickness in, so the dotted line spans exactly `len`.
    const inner = Math.max(0, len - thickness);
    const n = Math.max(1, Math.round(inner / (thickness * 3)));
    const spacing = inner / n;
    const h = Math.min(thickness / 2, len / 2);
    return {
      x1: x1 + ux * h, y1: y1 + uy * h, x2: x2 - ux * h, y2: y2 - uy * h,
      strokeDasharray: spacing > 0 ? `0,${spacing}` : undefined,
      strokeLinecap: 'round',
    };
  }
  // Dashed: dash 3t, gap 2t, scaled so there are n gaps and n+1 dashes exactly.
  const d = thickness * 3, g = thickness * 2;
  const n = Math.max(1, Math.round((len - d) / (d + g)));
  const k = len / ((n + 1) * d + n * g);
  return { x1, y1, x2, y2, strokeDasharray: `${d * k},${g * k}`, strokeLinecap: 'butt' };
}
