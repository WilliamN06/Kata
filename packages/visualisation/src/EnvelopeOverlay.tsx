import { useEffect, useRef } from 'react';

interface EnvelopeOverlayProps {
  attackMs: number;
  decayMs: number;
  sustainLevel: number;
  releaseMs: number;
  sustainDurationMs: number;
  width: number;
  height: number;
  colour?: string;
}

export function EnvelopeOverlay({
  attackMs,
  decayMs,
  sustainLevel,
  releaseMs,
  sustainDurationMs,
  width,
  height,
  colour = '#4A9EFF',
}: EnvelopeOverlayProps) {
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

    const totalMs = attackMs + decayMs + sustainDurationMs + releaseMs;
    const xScale = width / totalMs;
    const yScale = height;

    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const aX = attackMs * xScale;
    const dX = (attackMs + decayMs) * xScale;
    const sX = (attackMs + decayMs + sustainDurationMs) * xScale;
    const rX = (attackMs + decayMs + sustainDurationMs + releaseMs) * xScale;

    ctx.moveTo(0, height);
    ctx.lineTo(aX, 0);
    ctx.lineTo(dX, height * (1 - sustainLevel / 100));
    ctx.lineTo(sX, height * (1 - sustainLevel / 100));
    ctx.lineTo(rX, height);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A', aX / 2, height - 4);
    ctx.fillText('D', (aX + dX) / 2, height - 4);
    ctx.fillText('S', (dX + sX) / 2, height - 4);
    ctx.fillText('R', (sX + rX) / 2, height - 4);
  }, [attackMs, decayMs, sustainLevel, releaseMs, sustainDurationMs, width, height, colour]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}
