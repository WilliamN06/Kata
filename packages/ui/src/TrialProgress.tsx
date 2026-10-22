interface TrialProgressProps {
  current: number;
  total: number;
  correctCount?: number;
}

export function TrialProgress({ current, total, correctCount }: TrialProgressProps) {
  const isInfinite = !Number.isFinite(total);
  const dotCount = isInfinite ? 0 : Math.max(0, Math.min(total, 200));
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {Array.from({ length: dotCount }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i < current ? 'bg-blue-500' : 'bg-neutral-700'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-500 font-mono">
        {current}/{isInfinite ? '∞' : total}
      </span>
      {correctCount !== undefined && (
        <span className="text-xs text-neutral-500 font-mono">
          · {Math.round((correctCount / Math.max(1, current)) * 100)}%
        </span>
      )}
    </div>
  );
}