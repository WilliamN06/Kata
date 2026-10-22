import { useCallback, useRef } from 'react';

interface RatioChipProps {
  width: number;
  height: number;
  ratioA: number;
  ratioB: number;
  orientation?: 'horizontal' | 'vertical';
  barColor?: string;
  backgroundColor?: string;
  barBorder?: boolean;
  gap?: number;
  /** If true, dot B becomes draggable; onRatioChange fires during drag. */
  draggable?: boolean;
  onRatioChange?: (ratioB: number) => void;
  /** Restrict the draggable range of dot B. */
  minB?: number;
  maxB?: number;
}

/**
 * Two parallel bars proportional to ratioA:ratioB.
 * In `draggable` mode the second bar can be resized by dragging a dot,
 * reporting the ratio B value continuously.
 */
export function RatioChip({
  width,
  height,
  ratioA,
  ratioB,
  orientation = 'horizontal',
  barColor = '#E0E0E0',
  backgroundColor = '#0a0a0a',
  barBorder = false,
  gap = 8,
  draggable = false,
  onRatioChange,
  minB = 1,
  maxB = 10,
}: RatioChipProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const a = Math.max(0, ratioA);
  const b = Math.max(0, ratioB);
  const total = a + b || 1;
  const fracA = a / total;
  const fracB = b / total;

  const barStyle = (frac: number): React.CSSProperties =>
    orientation === 'horizontal'
      ? { flexGrow: frac, height: '100%' }
      : { flexGrow: frac, width: '100%' };

  const handleDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable || !onRatioChange || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isH = orientation === 'horizontal';
      const raw = isH
        ? (e.clientX - rect.left) / rect.width
        : (e.clientY - rect.top) / rect.height;
      const clamped = Math.max(0.05, Math.min(0.95, raw));
      // Map the dragged fraction to a b value where a = 1.
      const fracB = 1 - clamped;
      const newB = Math.max(minB, Math.min(maxB, Math.round((fracB / clamped) * 10) / 10));
      onRatioChange(newB);
    },
    [draggable, onRatioChange, orientation, minB, maxB],
  );

  const containerStyle: React.CSSProperties = {
    width,
    height,
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap,
    backgroundColor,
    borderRadius: 4,
    padding: 4,
    boxSizing: 'border-box',
    position: 'relative',
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Ratio chip: ${formatRatio(a)} to ${formatRatio(b)}`}
      style={containerStyle}
      onPointerMove={draggable ? (e) => e.buttons === 1 && handleDrag(e) : undefined}
    >
      <div
        style={{
          ...barStyle(fracA),
          backgroundColor: barColor,
          border: barBorder ? '1px solid #ffffff66' : 'none',
          borderRadius: 2,
        }}
      />
      <div
        style={{
          ...barStyle(fracB),
          backgroundColor: barColor,
          border: barBorder ? '1px solid #ffffff66' : 'none',
          borderRadius: 2,
          opacity: 0.6,
          position: 'relative',
        }}
      >
        {draggable && (
          <div
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            style={{
              position: 'absolute',
              [orientation === 'horizontal' ? 'right' : 'bottom']: -8,
              [orientation === 'horizontal' ? 'top' : 'left']: '50%',
              transform:
                orientation === 'horizontal'
                  ? 'translateY(-50%)'
                  : 'translateX(-50%)',
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#4A9EFF',
              border: '2px solid #2563EB',
              cursor: orientation === 'horizontal' ? 'ew-resize' : 'ns-resize',
              touchAction: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}

export function formatRatio(n: number): string {
  const v = Math.round(n * 1000) / 1000;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}