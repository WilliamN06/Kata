import { useEffect, useRef } from 'react';
import { lStarToSrgb } from './lstar';

interface ValueScaleProps {
  base?: number;
  range?: number;
  steps?: number;
  width: number;
  height: number;
  selectedStep?: number | null;
  onSelect?: (step: number) => void;
  showLabels?: boolean;
  className?: string;
}

export function ValueScale({
  base = 0,
  range = 100,
  steps = 10,
  width,
  height,
  selectedStep,
  onSelect,
  showLabels = false,
  className,
}: ValueScaleProps) {
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

    const stepWidth = width / steps;

    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0 : i / (steps - 1);
      const lStar = base + t * range;
      const byte = lStarToSrgb(lStar);
      ctx.fillStyle = `rgb(${byte}, ${byte}, ${byte})`;
      ctx.fillRect(i * stepWidth, 0, stepWidth + 1, height);
    }

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < steps; i++) {
      ctx.beginPath();
      ctx.moveTo(i * stepWidth, 0);
      ctx.lineTo(i * stepWidth, height);
      ctx.stroke();
    }

    if (selectedStep !== null && selectedStep !== undefined) {
      const x = selectedStep * stepWidth;
      ctx.strokeStyle = '#4A9EFF';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 2, 2, stepWidth - 4, height - 4);
    }
  }, [base, range, steps, width, height, selectedStep]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSelect) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const step = Math.floor((x / width) * steps);
    onSelect(Math.max(0, Math.min(steps - 1, step)));
  };

  return (
    <div className={className}>
      <canvas
        ref={ref}
        onClick={handleClick}
        style={{ display: 'block', cursor: onSelect ? 'pointer' : 'default' }}
      />
      {showLabels && (
        <div className="flex justify-between text-xs text-neutral-500 mt-1" style={{ width }}>
          <span>{base.toFixed(0)}</span>
          <span>{(base + range).toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}
