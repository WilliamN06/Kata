import { useEffect, useRef } from 'react';

interface ExtentChipProps {
  base: number;
  target: number;
  width: number;
  height: number;
  orientation?: 'horizontal' | 'vertical' | 'diagonal';
  arrangement?: 'side-by-side' | 'stacked' | 'overlapping';
  isolation?: 'isolated' | 'surrounded';
  style?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  contrast?: number;
  backgroundValue?: number;
}

export function ExtentChip({
  base,
  target,
  width,
  height,
  orientation = 'horizontal',
  arrangement = 'side-by-side',
  isolation = 'isolated',
  style = 'solid',
  thickness = 4,
  contrast = 1,
  backgroundValue = 128,
}: ExtentChipProps) {
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

    const maxExtent = Math.min(width, height) * 0.8;
    const scale = maxExtent / Math.max(base, target);
    const baseSize = base * scale;
    const targetSize = target * scale;

    const lineValue = Math.round(backgroundValue > 128 ? 0 : 255 * contrast);
    ctx.strokeStyle = `rgb(${lineValue}, ${lineValue}, ${lineValue})`;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';

    const dashPattern =
      style === 'dashed' ? [thickness * 3, thickness * 2] :
      style === 'dotted' ? [thickness, thickness * 2] :
      [];
    ctx.setLineDash(dashPattern);

    const gap = 20;

    if (orientation === 'horizontal') {
      if (arrangement === 'side-by-side') {
        const totalWidth = baseSize + targetSize + gap;
        const startX = (width - totalWidth) / 2;
        const y = height / 2;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + baseSize, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(startX + baseSize + gap, y);
        ctx.lineTo(startX + baseSize + gap + targetSize, y);
        ctx.stroke();
      } else if (arrangement === 'stacked') {
        const y1 = height / 2 - gap;
        const y2 = height / 2 + gap;
        ctx.beginPath();
        ctx.moveTo((width - baseSize) / 2, y1);
        ctx.lineTo((width + baseSize) / 2, y1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo((width - targetSize) / 2, y2);
        ctx.lineTo((width + targetSize) / 2, y2);
        ctx.stroke();
      } else {
        const startX = (width - Math.max(baseSize, targetSize)) / 2;
        const y = height / 2;
        ctx.beginPath();
        ctx.moveTo(startX, y - 4);
        ctx.lineTo(startX + baseSize, y - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(startX, y + 4);
        ctx.lineTo(startX + targetSize, y + 4);
        ctx.stroke();
      }
    } else if (orientation === 'vertical') {
      if (arrangement === 'side-by-side') {
        const totalHeight = baseSize + targetSize + gap;
        const startY = (height - totalHeight) / 2;
        const x = width / 2;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + baseSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, startY + baseSize + gap);
        ctx.lineTo(x, startY + baseSize + gap + targetSize);
        ctx.stroke();
      } else if (arrangement === 'stacked') {
        const x1 = width / 2 - gap;
        const x2 = width / 2 + gap;
        ctx.beginPath();
        ctx.moveTo(x1, (height - baseSize) / 2);
        ctx.lineTo(x1, (height + baseSize) / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, (height - targetSize) / 2);
        ctx.lineTo(x2, (height + targetSize) / 2);
        ctx.stroke();
      }
    } else {
      const cx = width / 2;
      const cy = height / 2;
      const rad = Math.PI / 4;
      const dx = Math.cos(rad) * baseSize / 2;
      const dy = Math.sin(rad) * baseSize / 2;
      ctx.beginPath();
      ctx.moveTo(cx - dx, cy - dy);
      ctx.lineTo(cx + dx, cy + dy);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }, [base, target, width, height, orientation, arrangement, isolation, style, thickness, contrast, backgroundValue]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}
