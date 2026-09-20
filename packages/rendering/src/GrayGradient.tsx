import { useEffect, useRef } from 'react';
import { lStarToSrgb } from './lstar';

interface GrayGradientProps {
  width: number;
  height: number;
  startL?: number;
  endL?: number;
  bands?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * A gradient with discrete bands — used for Mach band detection (V6).
 * Set bands to 1 for a smooth gradient. Set bands to 10+ for banded steps.
 */
export function GrayGradient({
  width,
  height,
  startL = 20,
  endL = 80,
  bands = 1,
  orientation = 'horizontal',
  className,
}: GrayGradientProps) {
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

    if (bands <= 1) {
      // Smooth gradient
      const gradient =
        orientation === 'horizontal'
          ? ctx.createLinearGradient(0, 0, width, 0)
          : ctx.createLinearGradient(0, 0, 0, height);

      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const l = startL + (endL - startL) * t;
        const byte = lStarToSrgb(l);
        gradient.addColorStop(t, `rgb(${byte}, ${byte}, ${byte})`);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Discrete bands
      const bandSize =
        orientation === 'horizontal' ? width / bands : height / bands;

      for (let i = 0; i < bands; i++) {
        const t = i / (bands - 1);
        const l = startL + (endL - startL) * t;
        const byte = lStarToSrgb(l);
        ctx.fillStyle = `rgb(${byte}, ${byte}, ${byte})`;

        if (orientation === 'horizontal') {
          ctx.fillRect(i * bandSize, 0, bandSize + 1, height);
        } else {
          ctx.fillRect(0, i * bandSize, width, bandSize + 1);
        }
      }
    }
  }, [width, height, startL, endL, bands, orientation]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ display: 'block', width, height }}
    />
  );
}