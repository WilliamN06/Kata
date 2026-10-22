import { useEffect, useRef } from 'react';
import { lStarToSrgb } from './lstar';

interface AdaptationFieldProps {
  lStar: number;
  width: number;
  height: number;
  durationMs?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * A full-field colour used for adaptation (V4).
 * Renders a single L* value covering the whole area.
 */
export function AdaptationField({
  lStar,
  width,
  height,
  className,
}: AdaptationFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const byte = lStarToSrgb(lStar);
    ctx.fillStyle = `rgb(${byte}, ${byte}, ${byte})`;
    ctx.fillRect(0, 0, width, height);
  }, [lStar, width, height]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ display: 'block', width, height }}
    />
  );
}