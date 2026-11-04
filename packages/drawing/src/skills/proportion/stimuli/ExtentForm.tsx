import { useEffect, useMemo, useRef, useState } from 'react';

export type MarkType =
  'two-dots' | 'three-dots' | 'four-dots' | 'line' | 'line-with-dots' | 'line-with-three-dots';

export type Relationship =
  | 'parallel-same-axis'
  | 'parallel-angled'
  | 'perpendicular'
  | 'end-to-end'
  | 'end-to-end-angled'
  | 'random';

export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type Contrast = 'low' | 'moderate' | 'high';
export type PositionType = 'centre' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type BackgroundValue = 'light' | 'mid' | 'dark' | 'grid' | 'transparent';

export interface ExtentFormProps {
  ratio: number;
  markType: MarkType;
  relationship: Relationship;
  angle: number;
  jointAngle: number;
  baseLength: number;
  dotSize: number;
  lineThickness: number;
  lineStyle: LineStyle;
  contrast: Contrast;
  position: PositionType;
  backgroundValue: BackgroundValue;
  scale: number;
  showLabels: boolean;
  showReferenceUnit: boolean;
}

const CONTRAST_COLOURS = {
  low: { fg: '#9a9a9a', grid: 'rgba(255,255,255,0.05)' },
  moderate: { fg: '#d0d0d0', grid: 'rgba(255,255,255,0.08)' },
  high: { fg: '#ffffff', grid: 'rgba(255,255,255,0.10)' },
};

// Minimal/clear backgrounds — no muddy grey fill.

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

interface Point {
  x: number;
  y: number;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface FormLayout {
  a: Segment;
  b: Segment;
  shared: Point | null;
}

function targetCentre(width: number, height: number, position: PositionType): Point {
  const x = width / 2;
  const y = height / 2;
  const offsetX = width * 0.22;
  const offsetY = height * 0.22;

  switch (position) {
    case 'top-left':
      return { x: x - offsetX, y: y - offsetY };
    case 'top-right':
      return { x: x + offsetX, y: y - offsetY };
    case 'bottom-left':
      return { x: x - offsetX, y: y + offsetY };
    case 'bottom-right':
      return { x: x + offsetX, y: y + offsetY };
    case 'centre':
    default:
      return { x, y };
  }
}

function contentBounds(layout: FormLayout) {
  const points = [
    { x: layout.a.x1, y: layout.a.y1 },
    { x: layout.a.x2, y: layout.a.y2 },
    { x: layout.b.x1, y: layout.b.y1 },
    { x: layout.b.x2, y: layout.b.y2 },
  ];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function fitFactor(
  width: number,
  height: number,
  position: PositionType,
  padding: number,
  contentWidth: number,
  contentHeight: number
) {
  const centre = targetCentre(width, height, position);
  const availableWidth = Math.max(1, 2 * Math.min(centre.x - padding, width - padding - centre.x));
  const availableHeight = Math.max(
    1,
    2 * Math.min(centre.y - padding, height - padding - centre.y)
  );

  return Math.min(
    1,
    availableWidth / Math.max(contentWidth, 1),
    availableHeight / Math.max(contentHeight, 1)
  );
}

function translateLayout(layout: FormLayout, dx: number, dy: number): FormLayout {
  const translate = (segment: Segment): Segment => ({
    x1: segment.x1 + dx,
    y1: segment.y1 + dy,
    x2: segment.x2 + dx,
    y2: segment.y2 + dy,
  });

  return {
    a: translate(layout.a),
    b: translate(layout.b),
    shared: layout.shared ? { x: layout.shared.x + dx, y: layout.shared.y + dy } : null,
  };
}

function scaleLayout(layout: FormLayout, factor: number): FormLayout {
  const scale = (segment: Segment): Segment => ({
    x1: segment.x1 * factor,
    y1: segment.y1 * factor,
    x2: segment.x2 * factor,
    y2: segment.y2 * factor,
  });

  return {
    a: scale(layout.a),
    b: scale(layout.b),
    shared: layout.shared ? { x: layout.shared.x * factor, y: layout.shared.y * factor } : null,
  };
}

function buildLayout(
  relationship: Exclude<Relationship, 'random'>,
  a: number,
  b: number,
  gap: number,
  angleRad: number,
  jointRad: number
): FormLayout {
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  switch (relationship) {
    case 'parallel-same-axis':
      return {
        a: { x1: -a / 2, y1: -gap / 2, x2: a / 2, y2: -gap / 2 },
        b: { x1: -b / 2, y1: gap / 2, x2: b / 2, y2: gap / 2 },
        shared: null,
      };
    case 'parallel-angled': {
      const offsetX = (sinA * gap) / 2;
      const offsetY = (cosA * gap) / 2;
      return {
        a: {
          x1: offsetX - (cosA * a) / 2,
          y1: -offsetY - (sinA * a) / 2,
          x2: offsetX + (cosA * a) / 2,
          y2: -offsetY + (sinA * a) / 2,
        },
        b: {
          x1: -offsetX - (cosA * b) / 2,
          y1: offsetY - (sinA * b) / 2,
          x2: -offsetX + (cosA * b) / 2,
          y2: offsetY + (sinA * b) / 2,
        },
        shared: null,
      };
    }
    case 'perpendicular':
      return {
        a: { x1: -a / 2, y1: 0, x2: a / 2, y2: 0 },
        b: { x1: 0, y1: -b / 2, x2: 0, y2: b / 2 },
        shared: { x: 0, y: 0 },
      };
    case 'end-to-end':
      return {
        a: { x1: -a, y1: 0, x2: 0, y2: 0 },
        b: { x1: 0, y1: 0, x2: b, y2: 0 },
        shared: { x: 0, y: 0 },
      };
    case 'end-to-end-angled':
      return {
        a: { x1: -a, y1: 0, x2: 0, y2: 0 },
        b: {
          x1: 0,
          y1: 0,
          x2: Math.cos(jointRad) * b,
          y2: -Math.sin(jointRad) * b,
        },
        shared: { x: 0, y: 0 },
      };
  }
}

export function ExtentForm(props: ExtentFormProps) {
  const {
    ratio,
    markType,
    relationship,
    angle,
    jointAngle,
    baseLength,
    dotSize,
    lineThickness,
    lineStyle,
    contrast,
    position,
    backgroundValue,
    scale,
    showLabels,
    showReferenceUnit,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  const measure = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    setDims((previous) =>
      previous.width === width && previous.height === height ? previous : { width, height }
    );
  };

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const colours = CONTRAST_COLOURS[contrast];

  // Small gap between the limit box and the window/settings/question edges.
  const limitGap = Math.max(lineThickness, dotSize);

  const resolvedRelationship: Exclude<Relationship, 'random'> = useMemo(() => {
    if (relationship !== 'random') return relationship;
    return pickRandom<Exclude<Relationship, 'random'>>([
      'parallel-same-axis',
      'parallel-angled',
      'perpendicular',
      'end-to-end',
      'end-to-end-angled',
    ]);
  }, [relationship]);

  const layout = useMemo(() => {
    const usableW = dims.width - limitGap * 2;
    const usableH = dims.height - limitGap * 2;
    const shortSide = Math.min(usableW, usableH);
    const referenceFraction = Math.min(0.99, Math.max(0.05, baseLength / 100));
    const rawB = usableW * referenceFraction * scale;
    const rawA = rawB / Math.max(0.01, ratio);
    const gap = Math.max(rawA * 0.5, 20);
    const angleRad = (angle * Math.PI) / 180;
    const jointRad = (jointAngle * Math.PI) / 180;

    const raw = buildLayout(resolvedRelationship, rawA, rawB, gap, angleRad, jointRad);
    const rawBounds = contentBounds(raw);
    const fit = fitFactor(
      dims.width,
      dims.height,
      position,
      limitGap,
      rawBounds.maxX - rawBounds.minX,
      rawBounds.maxY - rawBounds.minY
    );
    const scaled = scaleLayout(raw, fit);
    const scaledBounds = contentBounds(scaled);
    const centre = targetCentre(dims.width, dims.height, position);

    return translateLayout(
      scaled,
      centre.x - (scaledBounds.minX + scaledBounds.maxX) / 2,
      centre.y - (scaledBounds.minY + scaledBounds.maxY) / 2
    );
  }, [dims, limitGap, baseLength, scale, ratio, angle, jointAngle, position, resolvedRelationship]);

  const twoDots = useMemo(() => {
    if (markType !== 'two-dots') return null;

    const usableW = dims.width - limitGap * 2;
    const referenceFraction = Math.min(0.99, Math.max(0.05, baseLength / 100));
    const rawH = usableW * referenceFraction * scale;
    const rawV = rawH / Math.max(0.01, ratio);
    const fit = fitFactor(dims.width, dims.height, position, limitGap, rawH, rawV);
    const horizontal = rawH * fit;
    const vertical = rawV * fit;
    const centre = targetCentre(dims.width, dims.height, position);

    return {
      x1: centre.x - horizontal / 2,
      y1: centre.y + vertical / 2,
      x2: centre.x + horizontal / 2,
      y2: centre.y - vertical / 2,
    };
  }, [markType, dims, limitGap, baseLength, scale, ratio, position]);

  const fourDots = useMemo(() => {
    if (markType !== 'four-dots') return null;

    const usableW = dims.width - limitGap * 2;
    const usableH = dims.height - limitGap * 2;
    const centre = targetCentre(dims.width, dims.height, position);

    // Width based on baseLength % of window width
    const width = usableW * (baseLength / 100) * scale;
    // Height derived from ratio (width / height = ratio)
    const height = width / Math.max(0.01, ratio);

    // Clamp to fit within bounds
    const actualW = Math.min(width, usableW);
    const actualH = Math.min(height, usableH);

    // Small jitter around corners so dots aren't perfectly aligned
    const jitter = Math.min(actualW, actualH) * 0.12;
    const randomOffset = () => (Math.random() - 0.5) * jitter;

    const cx = centre.x;
    const cy = centre.y;
    const leftX = cx - actualW / 2;
    const rightX = cx + actualW / 2;
    const topY = cy - actualH / 2;
    const bottomY = cy + actualH / 2;

    const clampX = (x: number) => Math.min(Math.max(x, limitGap), dims.width - limitGap);
    const clampY = (y: number) => Math.min(Math.max(y, limitGap), dims.height - limitGap);

    return {
      dots: [
        { x: clampX(leftX + randomOffset()), y: clampY(topY + randomOffset()) },
        { x: clampX(rightX + randomOffset()), y: clampY(topY + randomOffset()) },
        { x: clampX(leftX + randomOffset()), y: clampY(bottomY + randomOffset()) },
        { x: clampX(rightX + randomOffset()), y: clampY(bottomY + randomOffset()) },
      ],
    };
  }, [markType, dims, limitGap, baseLength, scale, ratio]);

  const threeDots = useMemo(() => {
    if (markType !== 'three-dots') return null;

    // Three dots: start of extent A, shared point (or end of A if no shared),
    // end of extent B. Respects relationship/angle/jointAngle via layout.
    const shared = layout.shared ?? {
      x: layout.a.x2,
      y: layout.a.y2,
    };

    return {
      a1: { x: layout.a.x1, y: layout.a.y1 },
      shared,
      b2: { x: layout.b.x2, y: layout.b.y2 },
    };
  }, [markType, layout]);

  const showDots =
    markType === 'line-with-dots' ||
    markType === 'line-with-three-dots';
  const showLines =
    markType === 'line' || markType === 'line-with-dots' || markType === 'line-with-three-dots';

  const dashArray =
    lineStyle === 'dashed'
      ? lineThickness * 3 + ',' + lineThickness * 2
      : lineStyle === 'dotted'
        ? lineThickness + ',' + lineThickness * 2
        : undefined;

  const referenceUnit =
    showReferenceUnit && !twoDots
      ? {
          x: 40,
          y: dims.height - 40,
          length: Math.min(
            Math.hypot(layout.a.x2 - layout.a.x1, layout.a.y2 - layout.a.y1) * 0.4,
            120
          ),
        }
      : null;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-transparent">
      <svg
        width={dims.width}
        height={dims.height}
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        role="img"
        aria-label={
          markType === 'four-dots'
            ? 'Four dots at extreme corners for width-to-height comparison'
            : twoDots
              ? 'Two dots at opposite corners of an unseen rectangle'
              : 'Two extents to compare'
        }
      >
        {/* Limit box — light dark blue boundary, inset by a small gap */}
        <rect
          x={limitGap}
          y={limitGap}
          width={dims.width - limitGap * 2}
          height={dims.height - limitGap * 2}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          pointerEvents="none"
        />
        {/* Minimal grid */}
        {backgroundValue === 'grid' && (
          <>
            {Array.from({ length: Math.floor(dims.width / 60) + 1 }).map((_, i) => (
              <line
                key={'vx-' + i}
                x1={i * 60}
                y1={0}
                x2={i * 60}
                y2={dims.height}
                stroke={colours.grid}
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: Math.floor(dims.height / 60) + 1 }).map((_, i) => (
              <line
                key={'hy-' + i}
                x1={0}
                y1={i * 60}
                x2={dims.width}
                y2={i * 60}
                stroke={colours.grid}
                strokeWidth={1}
              />
            ))}
          </>
        )}

        {/* Extent A (reference) */}
        {showLines && (
          <line
            x1={layout.a.x1}
            y1={layout.a.y1}
            x2={layout.a.x2}
            y2={layout.a.y2}
            stroke={colours.fg}
            strokeWidth={lineThickness}
            strokeDasharray={dashArray}
            strokeLinecap={lineStyle === 'dotted' ? 'round' : 'butt'}
          />
        )}
        {/* Extent B (target) */}
        {showLines && (
          <line
            x1={layout.b.x1}
            y1={layout.b.y1}
            x2={layout.b.x2}
            y2={layout.b.y2}
            stroke={colours.fg}
            strokeWidth={lineThickness}
            strokeDasharray={dashArray}
            strokeLinecap={lineStyle === 'dotted' ? 'round' : 'butt'}
          />
        )}

        {/* 3 dots only: A1, shared (if any), B2 — but also A2/B1 which equal shared */}
        {twoDots && (
          <>
            <circle cx={twoDots.x1} cy={twoDots.y1} r={dotSize / 2} fill={colours.fg} />
            <circle cx={twoDots.x2} cy={twoDots.y2} r={dotSize / 2} fill={colours.fg} />
          </>
        )}
        {markType === 'four-dots' && fourDots && (
          <>
            {fourDots.dots.map((dot, i) => (
              <circle key={i} cx={dot.x} cy={dot.y} r={dotSize / 2} fill={colours.fg} />
            ))}
          </>
        )}
        {markType === 'three-dots' && threeDots && (
          <>
            <circle cx={threeDots.a1.x} cy={threeDots.a1.y} r={dotSize / 2} fill={colours.fg} />
            <circle cx={threeDots.shared.x} cy={threeDots.shared.y} r={dotSize / 2} fill={colours.fg} />
            <circle cx={threeDots.b2.x} cy={threeDots.b2.y} r={dotSize / 2} fill={colours.fg} />
          </>
        )}

        {!twoDots && showDots && (
          <>
            {/* Reference extent endpoints */}
            <circle cx={layout.a.x1} cy={layout.a.y1} r={dotSize / 2} fill={colours.fg} />
            <circle cx={layout.a.x2} cy={layout.a.y2} r={dotSize / 2} fill={colours.fg} />
            {/* Target extent endpoints */}
            <circle cx={layout.b.x1} cy={layout.b.y1} r={dotSize / 2} fill={colours.fg} />
            <circle cx={layout.b.x2} cy={layout.b.y2} r={dotSize / 2} fill={colours.fg} />
          </>
        )}

        {/* Labels for clarity */}
        {showLabels && !twoDots && markType !== 'three-dots' && markType !== 'four-dots' && (
          <>
            <text
              x={layout.a.x1 + 12}
              y={layout.a.y1 - 8}
              fill={colours.fg}
              fontSize={12}
              fontFamily="monospace"
              opacity={0.6}
            >
              A1
            </text>
            <text
              x={layout.a.x2 + 12}
              y={layout.a.y2 - 8}
              fill={colours.fg}
              fontSize={12}
              fontFamily="monospace"
              opacity={0.6}
            >
              A2
            </text>
            <text
              x={layout.b.x1 + 12}
              y={layout.b.y1 + 20}
              fill={colours.fg}
              fontSize={12}
              fontFamily="monospace"
              opacity={0.6}
            >
              B1
            </text>
            <text
              x={layout.b.x2 + 12}
              y={layout.b.y2 + 20}
              fill={colours.fg}
              fontSize={12}
              fontFamily="monospace"
              opacity={0.6}
            >
              B2
            </text>
          </>
        )}

        {/* Reference unit mark */}
        {referenceUnit && (
          <>
            <line
              x1={referenceUnit.x}
              y1={referenceUnit.y}
              x2={referenceUnit.x + referenceUnit.length}
              y2={referenceUnit.y}
              stroke={colours.fg}
              strokeWidth={lineThickness}
              opacity={0.5}
            />
            <text
              x={referenceUnit.x + referenceUnit.length + 8}
              y={referenceUnit.y + 4}
              fill={colours.fg}
              fontSize={11}
              fontFamily="monospace"
              opacity={0.5}
            >
              unit
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
