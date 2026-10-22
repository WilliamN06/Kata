import { lStarToRgbString } from './lstar';

interface ValueChipProps {
  lStar: number;
  width: number;
  height: number;
  className?: string;
  border?: boolean;
}

export function ValueChip({ lStar, width, height, className, border }: ValueChipProps) {
  // Defensive: ensure we have a finite number in 0..100
  const safe = Number.isFinite(lStar) ? Math.max(0, Math.min(100, lStar)) : 50;
  const color = lStarToRgbString(safe);

  if (process.env.NODE_ENV === 'development') {
    if (!Number.isFinite(lStar) || lStar < 0 || lStar > 100) {
      console.warn('[ValueChip] Received invalid lStar:', lStar, 'using fallback:', safe);
    }
  }

  return (
    <div
      role="img"
      aria-label={`Value chip at L* ${safe.toFixed(1)}`}
      className={className}
      style={{
        width,
        height,
        backgroundColor: color,
        display: 'block',
        border: border ? '1px solid #404040' : 'none',
      }}
    />
  );
}