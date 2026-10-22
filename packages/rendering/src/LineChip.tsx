import { useEffect, useRef } from 'react';

export type LineDisplayMode =
  | 'line'            // Full line (default)
  | 'line-with-dots'  // Line + endpoint dots
  | 'dots-only'       // Just the endpoints (no line)
  | 'line-with-ticks'; // Line + small perpendicular ticks at endpoints

interface LineChipProps {
  /** Angle in degrees, 0 = horizontal, 90 = vertical */
  angle: number;
  width: number;
  height: number;
  mode?: LineDisplayMode;
  showAngleFromReference?: 'horizontal' | 'vertical' | 'none';
  lineWidth?: number;
  dotRadius?: number;
  tickLength?: number;
  lineColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  /** Show the horizontal/vertical reference guides */
  showReferenceGuides?: boolean;
}

export function LineChip({
  angle,
  width,
  height,
  mode = 'line',
  showAngleFromReference = 'none',
  lineWidth = 3,
  dotRadius = 6,
  tickLength = 10,
  lineColor = '#E0E0E0',
  accentColor = '#4A9EFF',
  backgroundColor = '#0a0a0a',
  showReferenceGuides = false,
}: LineChipProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const length = Math.min(width, height) * 0.8;
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad) * (length / 2);
    const dy = -Math.sin(rad) * (length / 2);

    const start = { x: cx - dx, y: cy - dy };
    const end = { x: cx + dx, y: cy + dy };

    // Reference guides
    if (showReferenceGuides) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      // Horizontal guide
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      // Vertical guide
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Line
    if (mode === 'line' || mode === 'line-with-dots' || mode === 'line-with-ticks') {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Endpoint dots
    if (mode === 'dots-only' || mode === 'line-with-dots') {
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(start.x, start.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(end.x, end.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Perpendicular ticks
    if (mode === 'line-with-ticks') {
      const perpRad = rad + Math.PI / 2;
      const tickDx = Math.cos(perpRad) * (tickLength / 2);
      const tickDy = -Math.sin(perpRad) * (tickLength / 2);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(start.x - tickDx, start.y - tickDy);
      ctx.lineTo(start.x + tickDx, start.y + tickDy);
      ctx.moveTo(end.x - tickDx, end.y - tickDy);
      ctx.lineTo(end.x + tickDx, end.y + tickDy);
      ctx.stroke();
    }

    // Angle annotation from reference
    if (showAngleFromReference !== 'none') {
      const refAngle =
        showAngleFromReference === 'vertical' ? 90 : 0;
      const refRad = (refAngle * Math.PI) / 180;
      const refDx = Math.cos(refRad) * (length / 2);
      const refDy = -Math.sin(refRad) * (length / 2);

      // Reference line (faint)
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - refDx, cy - refDy);
      ctx.lineTo(cx + refDx, cy + refDy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arc between reference and actual
      const arcRadius = length * 0.25;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const startA = -Math.min(rad, refRad);
      const endA = -Math.max(rad, refRad);
      ctx.arc(cx, cy, arcRadius, startA, endA);
      ctx.stroke();

      // Delta label
      const delta = Math.abs(angle - refAngle);
      const midA = (rad + refRad) / 2;
      const labelX = cx + Math.cos(midA) * (arcRadius + 16);
      const labelY = cy - Math.sin(midA) * (arcRadius + 16);

      ctx.fillStyle = accentColor;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${delta.toFixed(1)}°`, labelX, labelY);
    }
  }, [
    angle,
    width,
    height,
    mode,
    showAngleFromReference,
    lineWidth,
    dotRadius,
    tickLength,
    lineColor,
    accentColor,
    backgroundColor,
    showReferenceGuides,
  ]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Line chip: angle ${angle}°, mode ${mode}`}
      style={{ display: 'block', width, height }}
    />
  );
}