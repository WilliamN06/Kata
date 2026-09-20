import { useEffect, useRef } from 'react';

interface AngleDotsProps {
  angle: number; // 0-180
  width: number;
  height: number;
  dotRadius?: number;
  color?: string;
  backgroundColor?: string;
}

export function AngleDots({
  angle,
  width,
  height,
  dotRadius = 8,
  color = '#E0E0E0',
  backgroundColor = '#0a0a0a',
}: AngleDotsProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height * 0.75;
    const radius = Math.min(width, height) * 0.6;

    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad) * radius;
    const dy = -Math.sin(rad) * radius;

    // Draw two dots: center (vertex) and endpoint of second ray
    ctx.fillStyle = color;
    // vertex dot
    ctx.beginPath();
    ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    // endpoint dot
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }, [angle, width, height, dotRadius, color, backgroundColor]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}