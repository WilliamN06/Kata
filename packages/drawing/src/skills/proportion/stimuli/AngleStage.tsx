import { useEffect, useRef, useState } from 'react';
import { AngleChip } from '@kata/rendering';

export interface AngleStageProps {
  angle: number;
  referenceType?: 'vertical' | 'horizontal' | 'another-line' | 'custom' | 'none';
  referenceAngle?: number;
  showReference?: boolean;
  showAnnotation?: boolean;
  lineLength?: number;
  lineThickness?: number;
  lineContrast?: 'low' | 'moderate' | 'high';
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  transparent?: boolean;
}

export function AngleStage({
  angle,
  referenceType = 'vertical',
  referenceAngle = 90,
  showReference = true,
  showAnnotation = false,
  lineLength = 70,
  lineThickness = 3,
  lineContrast = 'high',
  lineStyle = 'solid',
  transparent = true,
}: AngleStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 640, height: 480 });

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDims({
        width: Math.max(240, rect.width),
        height: Math.max(200, rect.height),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const shortSide = Math.min(dims.width, dims.height);
  const length = shortSide * (Math.min(90, Math.max(10, lineLength)) / 100);

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden bg-transparent">
      <AngleChip
        angle={angle}
        width={dims.width}
        height={dims.height}
        referenceType={referenceType}
        referenceAngle={referenceAngle}
        showReference={showReference}
        showAnnotation={showAnnotation}
        lineLength={length}
        lineThickness={lineThickness}
        lineContrast={lineContrast}
        lineStyle={lineStyle}
        transparent={transparent}
      />
    </div>
  );
}
