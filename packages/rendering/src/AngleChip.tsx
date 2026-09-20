import { useEffect, useRef } from 'react';

export type AngleDisplayMode =
  | 'two-lines'      // Show both lines (default)
  | 'one-line'       // Show only the target line
  | 'two-dots'       // Show endpoints as dots (reference points)
  | 'both-lines-dots'; // Show lines AND endpoint dots

interface AngleChipProps {
  /** Interior angle in degrees */
  angle: number;
  /** Reference angle (e.g., 90 for vertical comparison) */
  referenceAngle?: number;
  /** Show the reference line */
  showReference?: boolean;
  /** Show angle annotation (arc + text) */
  showAnnotation?: boolean;
  /** Display mode */
  mode?: AngleDisplayMode;
  width: number;
  height: number;
  lineWidth?: number;
  dotRadius?: number;
  lineColor?: string;
  referenceColor?: string;
  annotationColor?: string;
  backgroundColor?: string;
}

export function AngleChip({
  angle,
  referenceAngle = 0,
  showReference = true,
  showAnnotation = false,
  mode = 'two-lines',
  width,
  height,
  lineWidth = 3,
  dotRadius = 6,
  lineColor = '#E0E0E0',
  referenceColor = '#666666',
  annotationColor = '#4A9EFF',
  backgroundColor = '#0a0a0a',
}: AngleChipProps) {
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

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Compute vertex and rays
    const cx = width / 2;
    const cy = height * 0.75;
    const radius = Math.min(width, height) * 0.6;

    const refRad = (referenceAngle * Math.PI) / 180;
    const targetRad = (angle * Math.PI) / 180;

    const refDx = Math.cos(refRad) * radius;
    const refDy = -Math.sin(refRad) * radius;
    const targetDx = Math.cos(targetRad) * radius;
    const targetDy = -Math.sin(targetRad) * radius;

    const refEnd = { x: cx + refDx, y: cy + refDy };
    const targetEnd = { x: cx + targetDx, y: cy + targetDy };

    // Reference line
    if (showReference && mode !== 'two-dots') {
      ctx.strokeStyle = referenceColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(refEnd.x, refEnd.y);
      ctx.stroke();
    }

    // Target line
    if (mode !== 'two-dots') {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(targetEnd.x, targetEnd.y);
      ctx.stroke();
    }

    // Dots (endpoints + vertex)
    if (mode === 'two-dots' || mode === 'both-lines-dots') {
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(targetEnd.x, targetEnd.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      if (showReference) {
        ctx.fillStyle = referenceColor;
        ctx.beginPath();
        ctx.arc(refEnd.x, refEnd.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vertex dot
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(cx, cy, dotRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Angle annotation
    if (showAnnotation) {
      const arcRadius = 40;
      ctx.strokeStyle = annotationColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const startAngle = -Math.min(refRad, targetRad);
      const endAngle = -Math.max(refRad, targetRad);

      ctx.arc(cx, cy, arcRadius, startAngle, endAngle);
      ctx.stroke();

      // Angle text
      const midAngle = (refRad + targetRad) / 2;
      const labelX = cx + Math.cos(midAngle) * (arcRadius + 20);
      const labelY = cy - Math.sin(midAngle) * (arcRadius + 20);

      ctx.fillStyle = annotationColor;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${angle.toFixed(1)}°`, labelX, labelY);
    }

    // True reference marker (small tick at exact angle, e.g., for vertical/horizontal)
    if (showAnnotation && showReference) {
      // Small crosshair at the exact reference position
      ctx.strokeStyle = referenceColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(refEnd.x, refEnd.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    angle,
    referenceAngle,
    showReference,
    showAnnotation,
    mode,
    width,
    height,
    lineWidth,
    dotRadius,
    lineColor,
    referenceColor,
    annotationColor,
    backgroundColor,
  ]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Angle chip: ${angle}° ${mode}`}
      style={{ display: 'block', width, height }}
    />
  );
}