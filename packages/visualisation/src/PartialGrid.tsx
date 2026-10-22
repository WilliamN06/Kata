import { useEffect, useRef } from 'react';

interface PartialGridProps {
  fundamental: number;
  partialCount: number;
  presentPartials: number[];
  width: number;
  height: number;
  oddColour?: string;
  evenColour?: string;
  absentColour?: string;
}

export function PartialGrid({
  fundamental,
  partialCount,
  presentPartials,
  width,
  height,
  oddColour = '#FF8B4A',
  evenColour = '#4A9EFF',
  absentColour = '#1a1a1a',
}: PartialGridProps) {
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

    const cellWidth = width / partialCount;
    const cellHeight = height * 0.7;
    const y = height * 0.15;

    for (let i = 1; i <= partialCount; i++) {
      const x = (i - 1) * cellWidth;
      const isPresent = presentPartials.includes(i);
      const isOdd = i % 2 === 1;

      ctx.fillStyle = !isPresent ? absentColour : isOdd ? oddColour : evenColour;
      ctx.fillRect(x + 1, y, cellWidth - 2, cellHeight);

      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${i}`, x + cellWidth / 2, height - 4);
    }
  }, [fundamental, partialCount, presentPartials, width, height, oddColour, evenColour, absentColour]);

  return <canvas ref={ref} style={{ display: 'block', width, height }} />;
}
