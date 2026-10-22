import { useEffect, useRef } from 'react';

interface AngleChipProps {
  angle: number;
  width: number;
  height: number;
  referenceAngle?: number;
  referenceType?: 'vertical' | 'horizontal' | 'another-line' | 'custom';
  showReference?: boolean;
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
  showReference = true,
  lineLength = 200,
  lineThickness = 3,
  lineContrast = 'high',
  lineStyle = 'solid',
  backgroundValue = 128,
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

    const contrastFactor = lineContrast === 'low' ? 0.4 : lineContrast === 'moderate' ? 0.7 : 1;
    const lineValue = Math.round(backgroundValue > 128 ? 0 : 255 * contrastFactor);
    ctx.strokeStyle = `rgb(${lineValue}, ${lineValue}, ${lineValue})`;

    const dashPattern =
      lineStyle === 'dashed' ? [lineThickness * 4, lineThickness * 2] :
      lineStyle === 'dotted' ? [lineThickness, lineThickness * 2] :
      [];
    ctx.setLineDash(dashPattern);

    const halfLength = lineLength / 2;

    if (showReference) {
      let refRad = 0;
      if (referenceType === 'vertical') refRad = Math.PI / 2;
      else if (referenceType === 'horizontal') refRad = 0;
      else refRad = (referenceAngle * Math.PI) / 180;

      const refDx = Math.cos(refRad) * halfLength;
      const refDy = -Math.sin(refRad) * halfLength;

      ctx.lineWidth = lineThickness;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(cx - refDx, cy - refDy);
      ctx.lineTo(cx + refDx, cy + refDy);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad) * halfLength;
    const dy = -Math.sin(rad) * halfLength;

    ctx.lineWidth = lineThickness;
    ctx.beginPath();
    ctx.moveTo(cx - dx, cy - dy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.stroke();

    ctx.setLineDash([]);
  }, [angle, width, height, referenceAngle, referenceType, showReference, lineLength, lineThickness, lineContrast, lineStyle, backgroundValue]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}
