import { useCallback, useRef, useState } from 'react';

export interface DotPairProps {
  width: number;
  height: number;
  orientation?: 'horizontal' | 'vertical';
  distance: number;
  anchorX?: number;
  anchorY?: number;
  dotColor?: string;
  unitColor?: string;
  lineColor?: string;
  backgroundColor?: string;
  showLine?: boolean;
  dotSize?: number;
  draggable?: boolean;
  onDistanceChange?: (distancePx: number) => void;
  freeMode?: boolean;
  onPairPicked?: (a: { x: number; y: number }, b: { x: number; y: number }) => void;
  stimulusPair?: [{ x: number; y: number }, { x: number; y: number }];
  userPair?: [{ x: number; y: number }, { x: number; y: number }] | null;
  minDistance?: number;
  maxDistance?: number;
  className?: string;
  unitMarkerPx?: number;
  secondaryPair?: {
    distance: number;
    anchorX?: number;
    anchorY?: number;
    dotColor?: string;
    showLine?: boolean;
    orientation?: 'horizontal' | 'vertical';
  };
}

export function DotPair({
  width,
  height,
  orientation = 'horizontal',
  distance,
  anchorX = 60,
  anchorY = 80,
  dotColor = '#E0E0E0',
  unitColor = '#8A8A8A',
  lineColor = '#4A9EFF',
  backgroundColor = '#0a0a0a',
  showLine = false,
  dotSize = 10,
  draggable = false,
  onDistanceChange,
  freeMode = false,
  onPairPicked,
  stimulusPair,
  userPair = null,
  minDistance = 20,
  maxDistance = 600,
  className,
  unitMarkerPx,
  secondaryPair,
}: DotPairProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);

  const second = orientation === 'horizontal'
    ? { x: anchorX + distance, y: anchorY }
    : { x: anchorX, y: anchorY + distance };

  const unitPos = unitMarkerPx !== undefined && unitMarkerPx > 0
    ? orientation === 'horizontal'
      ? { x: anchorX + unitMarkerPx, y: anchorY }
      : { x: anchorX, y: anchorY + unitMarkerPx }
    : null;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable || !drag || !ref.current || !onDistanceChange) return;
      const rect = ref.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dist = orientation === 'horizontal'
        ? Math.abs(px - anchorX)
        : Math.abs(py - anchorY);
      const clamped = Math.max(minDistance, Math.min(maxDistance, dist));
      onDistanceChange(Math.round(clamped));
    },
    [draggable, drag, onDistanceChange, orientation, anchorX, anchorY, minDistance, maxDistance],
  );

  const handleFreeClick = (e: React.MouseEvent) => {
    if (!freeMode || !onPairPicked || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!userPair) {
      onPairPicked(p, p);
    } else {
      onPairPicked(userPair[0], p);
    }
  };

  const secOrientation = secondaryPair?.orientation ?? 'horizontal';
  const secAnchor = {
    x: secondaryPair?.anchorX ?? anchorX,
    y: secondaryPair?.anchorY ?? anchorY + 60,
  };
  const secSecond = secOrientation === 'horizontal'
    ? { x: secAnchor.x + (secondaryPair?.distance ?? 0), y: secAnchor.y }
    : { x: secAnchor.x, y: secAnchor.y + (secondaryPair?.distance ?? 0) };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setDrag(false)}
      onPointerLeave={() => setDrag(false)}
      onClick={freeMode ? handleFreeClick : undefined}
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor,
        borderRadius: 4,
        cursor: freeMode ? 'crosshair' : draggable ? (orientation === 'horizontal' ? 'ew-resize' : 'ns-resize') : 'default',
        touchAction: 'none',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {!freeMode && (
        <>
          {unitPos && (
            <>
              <Dot at={unitPos} size={dotSize * 0.7} color={unitColor} />
              {showLine && (
                <Line
                  a={{ x: anchorX, y: anchorY }}
                  b={unitPos}
                  color={unitColor}
                />
              )}
            </>
          )}
          <Dot at={{ x: anchorX, y: anchorY }} size={dotSize} color={dotColor} />
          <Dot at={second} size={dotSize} color={dotColor} />
          {showLine && <Line a={{ x: anchorX, y: anchorY }} b={second} color={lineColor} />}
          {draggable && (
            <div
              onPointerDown={(e) => {
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                setDrag(true);
              }}
              style={{
                position: 'absolute',
                left: second.x - (dotSize + 6),
                top: second.y - (dotSize + 6),
                width: (dotSize + 6) * 2,
                height: (dotSize + 6) * 2,
                borderRadius: '50%',
                cursor: orientation === 'horizontal' ? 'ew-resize' : 'ns-resize',
                background: 'transparent',
              }}
            />
          )}
        </>
      )}

      {!freeMode && secondaryPair && (
        <>
          <Dot at={secAnchor} size={dotSize} color={secondaryPair.dotColor ?? dotColor} />
          <Dot at={secSecond} size={dotSize} color={secondaryPair.dotColor ?? dotColor} />
          {(secondaryPair.showLine ?? showLine) && (
            <Line a={secAnchor} b={secSecond} color={lineColor} />
          )}
        </>
      )}

      {freeMode && stimulusPair && (
        <>
          <Dot at={stimulusPair[0]} size={dotSize} color={dotColor} />
          <Dot at={stimulusPair[1]} size={dotSize} color={dotColor} />
          {showLine && <Line a={stimulusPair[0]} b={stimulusPair[1]} color={lineColor} />}
        </>
      )}

      {freeMode && userPair && (
        <>
          <Dot at={userPair[0]} size={dotSize} color="#4A9EFF" />
          <Dot at={userPair[1]} size={dotSize} color="#4A9EFF" />
          {showLine && <Line a={userPair[0]} b={userPair[1]} color="#4A9EFF" />}
        </>
      )}
    </div>
  );
}

export function Dot({
  at,
  size = 10,
  color = '#E0E0E0',
}: {
  at: { x: number; y: number };
  size?: number;
  color?: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: at.x - size / 2,
        top: at.y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        pointerEvents: 'none',
      }}
    />
  );
}

export function Line({
  a,
  b,
  color = '#4A9EFF',
}: {
  a: { x: number; y: number };
  b: { x: number; y: number };
  color?: string;
}) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  return (
    <div
      style={{
        position: 'absolute',
        left: a.x,
        top: a.y,
        width: length,
        height: 0,
        borderTop: `2px dashed ${color}`,
        transformOrigin: '0 0',
        transform: `rotate(${angle}rad)`,
        pointerEvents: 'none',
        opacity: 0.5,
      }}
    />
  );
}