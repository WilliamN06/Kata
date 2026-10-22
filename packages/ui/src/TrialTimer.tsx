import { useEffect, useRef, useState } from 'react';

interface TrialTimerProps {
  seconds: number;
  onExpire: () => void;
  paused?: boolean;
}

export function TrialTimer({ seconds, onExpire, paused = false }: TrialTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const hasExpired = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    hasExpired.current = false;
  }, [seconds]);

  useEffect(() => {
    if (paused || hasExpired.current) return;

    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 0.1) {
          clearInterval(interval);
          if (!hasExpired.current) {
            hasExpired.current = true;
            onExpire();
          }
          return 0;
        }
        return r - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [paused, onExpire]);

  if (paused) return null;

  const percent = (remaining / seconds) * 100;
  const isLow = remaining <= seconds * 0.25;

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isLow ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className={`text-sm font-mono tabular-nums ${isLow ? 'text-red-400' : 'text-neutral-400'}`}
      >
        {remaining.toFixed(1)}s
      </span>
    </div>
  );
}