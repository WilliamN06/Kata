import { useEffect, useRef } from 'react';

interface SymmetryChipProps {
  asymmetry: number;
  width: number;
  height: number;
}

export function SymmetryChip({ asymmetry, width, height }: SymmetryChipProps) {
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

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 60);
    ctx.lineTo(cx - 60, cy);
    ctx.lineTo(cx, cy + 60);
    ctx.lineTo(cx - 20, cy);
    ctx.closePath();
    ctx.fill();

    const shift = asymmetry * 2;
    ctx.beginPath();
    ctx.moveTo(cx + shift, cy - 60);
    ctx.lineTo(cx + 60 + shift, cy);
    ctx.lineTo(cx + shift, cy + 60);
    ctx.lineTo(cx + 20 + shift, cy);
    ctx.closePath();
    ctx.fill();
  }, [asymmetry, width, height]);

  return <canvas ref={ref} role="img" aria-label={`Shape with asymmetry ${asymmetry}`} style={{ display: 'block', width, height }} />;
}