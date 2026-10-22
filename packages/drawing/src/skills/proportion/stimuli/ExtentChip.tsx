import { useMemo } from 'react';

export type DisplayFormat = 'bar' | 'line' | 'dot-to-dot' | 'line-and-dot';
export type Orientation = 'horizontal' | 'vertical' | 'diagonal';
export type ExtentStyle = 'solid' | 'dashed' | 'dotted';
export type RatioType = 'length' | 'area' | 'volume';
export type Contrast = 'low' | 'moderate' | 'high';
export type Arrangement = 'side-by-side' | 'stacked' | 'overlapping';
export type BackgroundValue = 'light' | 'mid' | 'dark';

export interface ExtentChipProps {
  baseWidth: number;
  baseHeight: number;
  ratio: number;
  displayFormat: DisplayFormat;
  orientation: Orientation;
  style: ExtentStyle;
  lineThickness: number;
  dotSize: number;
  contrast: Contrast;
  arrangement: Arrangement;
  backgroundValue: BackgroundValue;
  ratioType?: RatioType;
  showReference?: boolean;
  showReferenceLabel?: boolean;
}

const CONTRAST_COLOURS = {
  low: { fg: '#888', bg: '#666' },
  moderate: { fg: '#ccc', bg: '#888' },
  high: { fg: '#f0f0f0', bg: '#202020' },
};

const BG_COLOURS = {
  light: '#d0d0d0',
  mid: '#808080',
  dark: '#1a1a1a',
};

export function ExtentChip({
  baseWidth,
  baseHeight,
  ratio,
  displayFormat,
  orientation,
  style,
  lineThickness,
  dotSize,
  contrast,
  arrangement,
  backgroundValue,
  ratioType = 'length',
  showReference = true,
  showReferenceLabel = true,
}: ExtentChipProps) {
  const colours = CONTRAST_COLOURS[contrast];
  const bg = BG_COLOURS[backgroundValue];

  // For length: ratio scales one axis.
  // For area:   ratio scales both axes (area is scale² — so linear scale is √ratio).
  // For volume: ratio scales all three axes (linear scale is ∛ratio — rendered as 2D approximation).
  const linearScale = useMemo(() => {
    if (ratioType === 'area') return Math.sqrt(ratio);
    if (ratioType === 'volume') return Math.cbrt(ratio);
    return ratio;
  }, [ratio, ratioType]);

  const isHorizontal = orientation === 'horizontal';
  const isVertical = orientation === 'vertical';
  const isDiagonal = orientation === 'diagonal';

  // Base extent dimensions
  const baseLen = isHorizontal ? baseWidth : isVertical ? baseHeight : Math.sqrt(baseWidth ** 2 + baseHeight ** 2);

  // Target extent dimensions — for area, both dimensions scale; for length, only the length axis
  let targetWidth = baseWidth;
  let targetHeight = baseHeight;
  if (ratioType === 'area') {
    targetWidth = baseWidth * linearScale;
    targetHeight = baseHeight * linearScale;
  } else if (ratioType === 'volume') {
    targetWidth = baseWidth * linearScale;
    targetHeight = baseHeight * linearScale;
  }
  // For length, targetWidth/Height stay at base except along the length axis

  const targetLen = baseLen * linearScale;

  // Canvas dimensions
  const padding = 40;
  const maxWidth = Math.max(baseWidth, targetWidth);
  const maxHeight = Math.max(baseHeight, targetHeight);

  const canvasWidth = isVertical
    ? Math.max(maxWidth, maxHeight) + padding * 2 + 100
    : (ratioType === 'length' ? Math.max(baseLen, targetLen) : maxWidth) + padding * 2;
  const canvasHeight = isVertical
    ? (ratioType === 'length' ? Math.max(baseLen, targetLen) : maxHeight) + padding * 2
    : Math.max(baseHeight, maxHeight) + padding * 2 + 100;

  // Layout positions
  const positions = useMemo(() => {
    if (arrangement === 'side-by-side') {
      if (isHorizontal) {
        return {
          base: { x: padding, y: padding },
          target: { x: padding, y: padding + baseHeight + 40 },
        };
      }
      return {
        base: { x: padding, y: padding },
        target: { x: padding + maxWidth + 60, y: padding },
      };
    }
    if (arrangement === 'stacked') {
      return {
        base: { x: padding, y: padding },
        target: { x: padding, y: padding + maxHeight + 40 },
      };
    }
    // overlapping
    return {
      base: { x: padding, y: padding },
      target: { x: padding + 20, y: padding + 20 },
    };
  }, [arrangement, isHorizontal, baseHeight, maxWidth, maxHeight]);

  const renderExtent = (
    width: number,
    height: number,
    lengthForLine: number,
    origin: { x: number; y: number },
    key: string,
    label: string
  ) => {
    const isBar = displayFormat === 'bar';
    const isLine = displayFormat === 'line';
    const isDotToDot = displayFormat === 'dot-to-dot';
    const isLineAndDot = displayFormat === 'line-and-dot';

    const dx = isHorizontal ? 1 : isDiagonal ? 0.707 : 0;
    const dy = isVertical ? 1 : isDiagonal ? 0.707 : 0;

    const endX = origin.x + dx * lengthForLine;
    const endY = origin.y + dy * lengthForLine;

    if (isBar) {
      return (
        <g key={key}>
          <rect
            x={origin.x}
            y={origin.y}
            width={width}
            height={height}
            fill={colours.fg}
            rx={2}
          />
          {showReferenceLabel && (
            <text
              x={origin.x + width + 12}
              y={origin.y + height / 2 + 4}
              fill={colours.fg}
              fontSize={11}
              fontFamily="monospace"
              opacity={0.6}
            >
              {label}
            </text>
          )}
        </g>
      );
    }

    const dashArray =
      style === 'dashed' ? `${lineThickness * 3},${lineThickness * 2}`
      : style === 'dotted' ? `${lineThickness},${lineThickness * 2}`
      : undefined;

    return (
      <g key={key}>
        <line
          x1={origin.x}
          y1={origin.y}
          x2={endX}
          y2={endY}
          stroke={colours.fg}
          strokeWidth={lineThickness}
          strokeDasharray={dashArray}
          strokeLinecap={style === 'dotted' ? 'round' : 'butt'}
        />
        {(isDotToDot || isLineAndDot) && (
          <>
            <circle cx={origin.x} cy={origin.y} r={dotSize / 2} fill={colours.fg} />
            <circle cx={endX} cy={endY} r={dotSize / 2} fill={colours.fg} />
          </>
        )}
        {isLine && (
          <>
            <line x1={origin.x - 4} y1={origin.y - 6} x2={origin.x - 4} y2={origin.y + 6} stroke={colours.fg} strokeWidth={lineThickness * 0.7} />
            <line x1={endX + 4} y1={endY - 6} x2={endX + 4} y2={endY + 6} stroke={colours.fg} strokeWidth={lineThickness * 0.7} />
          </>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        width={canvasWidth}
        height={canvasHeight}
        style={{ background: bg, borderRadius: 8 }}
        role="img"
        aria-label={`Extent ratio 1:${ratio.toFixed(2)}, ${ratioType}, ${displayFormat}`}
      >
        {showReference &&
          renderExtent(
            baseWidth,
            baseHeight,
            baseLen,
            positions.base,
            'base',
            'BASE'
          )}

        {renderExtent(
          targetWidth,
          targetHeight,
          targetLen,
          positions.target,
          'target',
          ratioType === 'length' ? 'TARGET' : `TARGET (${ratioType})`
        )}
      </svg>

      <div className="mt-3 text-xs text-neutral-500 font-mono">
        {displayFormat} · 1:{ratio.toFixed(2)} ({ratioType}) ·{' '}
        {isHorizontal ? 'H' : isVertical ? 'V' : 'D'}
      </div>
    </div>
  );
}
