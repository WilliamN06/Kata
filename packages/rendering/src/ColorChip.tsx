import { useEffect, useRef } from 'react';

interface ColorChipProps {
  hue: number;
  chroma: number;
  lStar: number;
  width: number;
  height: number;
  shape?: 'circle' | 'square' | 'rounded';
  border?: boolean;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hh < 1) { r = c; g = x; }
  else if (hh < 2) { r = x; g = c; }
  else if (hh < 3) { g = c; b = x; }
  else if (hh < 4) { g = x; b = c; }
  else if (hh < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function ColorChip({
  hue,
  chroma,
  lStar,
  width,
  height,
  shape = 'circle',
  border = false,
}: ColorChipProps) {
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

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const safeL = Number.isFinite(lStar) ? Math.max(0, Math.min(100, lStar)) : 50;
    const safeChroma = Math.max(0, Math.min(100, chroma));
    const [r, g, b] = hslToRgb(hue, safeChroma / 100, safeL / 100);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'square') {
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    } else {
      const r2 = radius * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx - radius + r2, cy - radius);
      ctx.lineTo(cx + radius - r2, cy - radius);
      ctx.quadraticCurveTo(cx + radius, cy - radius, cx + radius, cy - radius + r2);
      ctx.lineTo(cx + radius, cy + radius - r2);
      ctx.quadraticCurveTo(cx + radius, cy + radius, cx + radius - r2, cy + radius);
      ctx.lineTo(cx - radius + r2, cy + radius);
      ctx.quadraticCurveTo(cx - radius, cy + radius, cx - radius, cy + radius - r2);
      ctx.lineTo(cx - radius, cy - radius + r2);
      ctx.quadraticCurveTo(cx - radius, cy - radius, cx - radius + r2, cy - radius);
      ctx.closePath();
      ctx.fill();
    }

    if (border) {
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, height);
    }
  }, [hue, chroma, lStar, width, height, shape, border]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}
