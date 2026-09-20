interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  color = '#4A9EFF',
  trackColor = '#333333',
  showPercentage = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      {showPercentage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.25,
            fontWeight: 600,
            color: '#E0E0E0',
          }}
        >
          {Math.round(progress * 100)}
        </div>
      )}
    </div>
  );
}