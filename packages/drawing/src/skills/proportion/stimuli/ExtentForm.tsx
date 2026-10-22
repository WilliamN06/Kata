import { useEffect, useMemo, useRef, useState } from 'react';

export type MarkType =
  | 'three-dots'
  | 'line'
  | 'line-with-three-dots';

export type Relationship =
  | 'parallel-same-axis'
  | 'parallel-angled'
  | 'perpendicular'
  | 'end-to-end'
  | 'end-to-end-angled'
  | 'random';

export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type Contrast = 'low' | 'moderate' | 'high';
export type PositionType =
  | 'centre'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
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
const BG_COLOURS: Record<BackgroundValue, string> = {
  light: '#f5f5f5',
  mid: '#1a1a1a',
  dark: '#0a0a0a',
  grid: '#0a0a0a',
  transparent: 'transparent',
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({
          width: Math.max(300, r.width),
          height: Math.max(200, r.height),
        });
      }
    };
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
  const bg = BG_COLOURS[backgroundValue];

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

  // ---- FIT-TO-WINDOW LAYOUT ----
  //
  // We compute the reference length `a` and target length `b` from the
  // baseLength × ratio, then scale both down so the whole form fits
  // inside the window with padding. This is the fix for the angle
  // going outside the space.
  const layout = useMemo(() => {
    const padding = Math.min(dims.width, dims.height) * 0.12;
    const usableW = dims.width - padding * 2;
    const usableH = dims.height - padding * 2;

    const rawA = baseLength * scale;
    const rawB = rawA * ratio;

    // Compute the bounding box each relationship needs, given rawA/rawB,
    // so we can scale everything to fit.
    const angleRad = (angle * Math.PI) / 180;
    const jointRad = (jointAngle * Math.PI) / 180;

    // Compute required W/H for the given relationship
    let requiredW = 0;
    let requiredH = 0;
    const gap = Math.max(rawA * 0.5, 20);

    switch (resolvedRelationship) {
      case 'parallel-same-axis': {
        requiredW = Math.max(rawA, rawB);
        requiredH = gap + Math.max(20, rawA * 0.2);
        break;
      }
      case 'parallel-angled': {
        // Both extents projected onto X and Y
        const totalH = gap;
        requiredW = Math.max(rawA, rawB) * Math.abs(Math.cos(angleRad)) + totalH * Math.abs(Math.sin(angleRad));
        requiredH = Math.max(rawA, rawB) * Math.abs(Math.sin(angleRad)) + totalH * Math.abs(Math.cos(angleRad));
        break;
      }
      case 'perpendicular': {
        requiredW = rawA;
        requiredH = rawB;
        break;
      }
      case 'end-to-end': {
        requiredW = rawA + rawB;
        requiredH = Math.max(40, rawA * 0.2);
        break;
      }
      case 'end-to-end-angled': {
        requiredW = rawA + rawB * Math.abs(Math.cos(jointRad));
        requiredH = rawB * Math.abs(Math.sin(jointRad));
        break;
      }
    }

    // Fit factor to scale everything inside the usable area
    const fit = Math.min(
      1,
      usableW / Math.max(requiredW, 1),
      usableH / Math.max(requiredH, 1)
    );

    const a = rawA * fit;
    const b = rawB * fit;
    const g = gap * fit;

    // Origin — where the form is anchored
    const ox = dims.width / 2;
    const oy = dims.height / 2;

    let centreX = ox;
    let centreY = oy;
    const offX = dims.width * 0.22;
    const offY = dims.height * 0.22;
    switch (position) {
      case 'top-left':    centreX -= offX; centreY -= offY; break;
      case 'top-right':   centreX += offX; centreY -= offY; break;
      case 'bottom-left': centreX -= offX; centreY += offY; break;
      case 'bottom-right':centreX += offX; centreY += offY; break;
      case 'centre':
      default: break;
    }

    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    switch (resolvedRelationship) {
      case 'parallel-same-axis': {
        // Two horizontal extents, one above the other, NOT connecting
        const ay = centreY - g / 2;
        const by = centreY + g / 2;
        return {
          a: { x1: centreX - a / 2, y1: ay, x2: centreX + a / 2, y2: ay },
          b: { x1: centreX - b / 2, y1: by, x2: centreX + b / 2, y2: by },
          shared: null as null | { x: number; y: number },
        };
      }
      case 'parallel-angled': {
        // Two extents, both tilted by angle, offset perpendicular to direction
        const offX = -sinA * (g / 2);
        const offY = cosA * (g / 2);
        return {
          a: {
            x1: centreX - offX - (cosA * a) / 2,
            y1: centreY - offY - (sinA * a) / 2,
            x2: centreX - offX + (cosA * a) / 2,
            y2: centreY - offY + (sinA * a) / 2,
          },
          b: {
            x1: centreX + offX - (cosA * b) / 2,
            y1: centreY + offY - (sinA * b) / 2,
            x2: centreX + offX + (cosA * b) / 2,
            y2: centreY + offY + (sinA * b) / 2,
          },
          shared: null as null | { x: number; y: number },
        };
      }
      case 'perpendicular': {
        // One horizontal (A) + one vertical (B), crossing at centre
        return {
          a: { x1: centreX - a / 2, y1: centreY, x2: centreX + a / 2, y2: centreY },
          b: { x1: centreX, y1: centreY - b / 2, x2: centreX, y2: centreY + b / 2 },
          shared: { x: centreX, y: centreY },
        };
      }
      case 'end-to-end': {
        // Both on one horizontal line, connecting at the joint
        return {
          a: { x1: centreX - a, y1: centreY, x2: centreX, y2: centreY },
          b: { x1: centreX, y1: centreY, x2: centreX + b, y2: centreY },
          shared: { x: centreX, y: centreY },
        };
      }
      case 'end-to-end-angled': {
        // A horizontal-left, B from the joint at jointAngle
        return {
          a: { x1: centreX - a, y1: centreY, x2: centreX, y2: centreY },
          b: {
            x1: centreX,
            y1: centreY,
            x2: centreX + Math.cos(jointRad) * b,
            y2: centreY - Math.sin(jointRad) * b,
          },
          shared: { x: centreX, y: centreY },
        };
      }
    }
  }, [dims, baseLength, scale, ratio, angle, jointAngle, position, resolvedRelationship]);

  const showDots = markType === 'three-dots' || markType === 'line-with-three-dots';
  const showLines = markType === 'line' || markType === 'line-with-three-dots';

  const dashArray =
    lineStyle === 'dashed' ? lineThickness * 3 + ',' + lineThickness * 2
    : lineStyle === 'dotted' ? lineThickness + ',' + lineThickness * 2
    : undefined;

  const referenceUnit = showReferenceUnit
    ? {
        x: 40,
        y: dims.height - 40,
        length: Math.min(baseLength * scale * 0.4, 100),
      }
    : null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{
        background: bg,
        minHeight: 400,
        borderRadius: 8,
      }}
    >
      <svg
        width={dims.width}
        height={dims.height}
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        role="img"
        aria-label={'Extent ratio 1:' + ratio.toFixed(2) + ', ' + resolvedRelationship}
      >
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
        {showDots && (
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
        {showLabels && (
          <>
            <text x={layout.a.x1 + 12} y={layout.a.y1 - 8} fill={colours.fg} fontSize={12} fontFamily="monospace" opacity={0.6}>A1</text>
            <text x={layout.a.x2 + 12} y={layout.a.y2 - 8} fill={colours.fg} fontSize={12} fontFamily="monospace" opacity={0.6}>A2</text>
            <text x={layout.b.x1 + 12} y={layout.b.y1 + 20} fill={colours.fg} fontSize={12} fontFamily="monospace" opacity={0.6}>B1</text>
            <text x={layout.b.x2 + 12} y={layout.b.y2 + 20} fill={colours.fg} fontSize={12} fontFamily="monospace" opacity={0.6}>B2</text>
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
            <text x={referenceUnit.x + referenceUnit.length + 8} y={referenceUnit.y + 4} fill={colours.fg} fontSize={11} fontFamily="monospace" opacity={0.5}>unit</text>
          </>
        )}
      </svg>

      <div
        className="absolute bottom-2 right-3 text-xs font-mono opacity-40 pointer-events-none"
        style={{ color: colours.fg }}
      >
        {markType + ' · ' + resolvedRelationship + ' · 1:' + ratio.toFixed(2)}
      </div>
    </div>
  );
}
