import { useEffect, useRef } from 'react';

interface AngleChipProps {
  angle: number;
  width: number;
  height: number;
  referenceAngle?: number;
  referenceType?: 'vertical' | 'horizontal' | 'another-line' | 'custom' | 'none';
  mode?: 'two-lines' | 'both-lines-dots' | 'line' | 'line-with-dots';
  showReference?: boolean;
  showAnnotation?: boolean;
  lineLength?: number;
  lineThickness?: number;
  lineContrast?: 'low' | 'moderate' | 'high';
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  backgroundValue?: number;
}

export function AngleChip({
  angle,
  width,
  height,
  referenceAngle = 0,
  referenceType = 'vertical',
  mode = 'two-lines',
  showReference = true,
  showAnnotation = false,
  lineLength = 200,
  lineThickness = 3,
  lineContrast = 'high',
  lineStyle = 'solid',
  backgroundValue = 0,
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

    ctx.fillStyle = `rgb(${backgroundValue}, ${backgroundValue}, ${backgroundValue})`;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    const contrastFactor =
      lineContrast === 'low' ? 0.4 : lineContrast === 'moderate' ? 0.7 : 1;
    const lineValue = Math.round(
      backgroundValue > 128 ? 0 : 255 * contrastFactor
    );
    ctx.strokeStyle = `rgb(${lineValue}, ${lineValue}, ${lineValue})`;

    const dashPattern =
      lineStyle === 'dashed'
        ? [lineThickness * 4, lineThickness * 2]
        : lineStyle === 'dotted'
          ? [lineThickness, lineThickness * 2]
          : [];
    ctx.setLineDash(dashPattern);

    const halfLength = lineLength / 2;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const angleRad = (normalizedAngle * Math.PI) / 180;

    let refRad = Math.PI / 2;
    if (referenceType === 'horizontal') {
      refRad = 0;
    } else if (
      referenceType === 'another-line' ||
      referenceType === 'custom'
    ) {
      refRad = (referenceAngle * Math.PI) / 180;
    }

    if (showReference && referenceType !== 'none') {
      const refDx = Math.cos(refRad) * halfLength;
      const refDy = -Math.sin(refRad) * halfLength;

      ctx.lineWidth = lineThickness;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + refDx, cy + refDy);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const rad = refRad + angleRad;
    const dx = Math.cos(rad) * halfLength;
    const dy = -Math.sin(rad) * halfLength;

    ctx.lineWidth = lineThickness;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.stroke();

    const showDots = mode === 'both-lines-dots' || mode === 'line-with-dots';
    if (showDots) {
      ctx.fillStyle = `rgb(${lineValue}, ${lineValue}, ${lineValue})`;
      const dotRadius = Math.max(3, lineThickness * 1.8);
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      if (showReference && mode === 'both-lines-dots') {
        const refDx = Math.cos(refRad) * halfLength;
        const refDy = -Math.sin(refRad) * halfLength;
        ctx.beginPath();
        ctx.arc(cx + refDx, cy + refDy, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (showAnnotation) {
      const arcRadius = halfLength * 0.35;
      ctx.strokeStyle = '#4A9EFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, arcRadius, -refRad, -rad, true);
      ctx.stroke();

      const midRad = refRad + angleRad / 2;
      ctx.fillStyle = '#4A9EFF';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${normalizedAngle.toFixed(0)}°`,
        cx + Math.cos(midRad) * (arcRadius + 18),
        cy - Math.sin(midRad) * (arcRadius + 18)
      );
    }

    ctx.setLineDash([]);
  }, [
    angle,
    width,
    height,
    referenceAngle,
    referenceType,
    mode,
    showReference,
    showAnnotation,
    lineLength,
    lineThickness,
    lineContrast,
    lineStyle,
    backgroundValue,
  ]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}
