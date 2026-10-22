import { useEffect, useRef } from 'react';

interface PhaseVectorPlotProps {
  phases: number[];
  magnitudes: number[];
  width: number;
  height: number;
  colour?: string;
}

export function PhaseVectorPlot({
  phases,
  magnitudes,
  width,
  height,
  colour = '#4A9EFF',
}: PhaseVectorPlotProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const maxMag = Math.max(...magnitudes, 1);
    const maxRadius = Math.min(width, height) * 0.4;

    ctx.strokeStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const mag = magnitudes[i] / maxMag;
      const r = mag * maxRadius;
      const x = cx + Math.cos(phase) * r;
      const y = cy + Math.sin(phase) * r;

      ctx.strokeStyle = colour;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [phases, magnitudes, width, height, colour]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}
