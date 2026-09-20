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
}

/**
 * Renders two parallel bars whose lengths are proportional to ratioA:ratioB.
 * - `horizontal`: bars sit side-by-side, widths are proportional.
 * - `vertical`: bars are stacked, heights are proportional.
 * role="img" + aria-label are set for accessibility.
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
}: RatioChipProps) {
  const a = Math.max(0, ratioA);
  const b = Math.max(0, ratioB);
  const total = a + b;
  const fracA = total > 0 ? a / total : 0.5;
  const fracB = total > 0 ? b / total : 0.5;

  const barStyle = (frac: number): React.CSSProperties =>
    orientation === 'horizontal'
      ? { flexGrow: frac, height: '100%' }
      : { flexGrow: frac, width: '100%' };

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
  };

  return (
    <div
      role="img"
      aria-label={`Ratio chip: ${formatRatio(a)} to ${formatRatio(b)}`}
      style={containerStyle}
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
        }}
      />
    </div>
  );
}

/** Format a ratio member for display, reducing 1:1 style values. */
export function formatRatio(n: number): string {
  const v = Math.round(n * 1000) / 1000;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}