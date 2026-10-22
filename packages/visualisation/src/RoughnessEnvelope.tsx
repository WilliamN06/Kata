import { useEffect, useRef } from 'react';

interface RoughnessEnvelopeProps {
  beatingRateHz: number;
  width: number;
  height: number;
  colour?: string;
}

export function RoughnessEnvelope({
  beatingRateHz,
  width,
  height,
  colour = '#4A9EFF',
}: RoughnessEnvelopeProps) {
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

    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const period = width / beatingRateHz / 2;

    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin(x / period * Math.PI * 2) * height * 0.35;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  }, [beatingRateHz, width, height, colour]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}
