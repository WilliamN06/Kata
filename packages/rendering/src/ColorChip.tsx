import { useEffect, useRef } from 'react';
import { lStarToSrgb } from './lstar';

interface ColorChipProps {
  hue: number; // 0-360
  saturation: number; // 0-100
  lStar: number; // 0-100
  width: number;
  height: number;
  className?: string;
}

/**
 * Renders a colour chip at a specific HSL-equivalent value.
 * Used for V12 Colour-to-Value translation.
 *
 * Note: this uses HSL, not L*a*b*. For precise hue-value matching,
 * we approximate by mapping L* to HSL lightness.
 */
export function ColorChip({
  hue,
  saturation,
  lStar,
  width,
  height,
  className,
}: ColorChipProps) {
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

    // Convert L* to HSL lightness (approximate)
    const lightness = lStar / 100;

    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness * 100}%)`;
    ctx.fillRect(0, 0, width, height);
  }, [hue, saturation, lStar, width, height]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ display: 'block', width, height }}
    />
  );
}