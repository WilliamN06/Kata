interface DeltaDisplayProps {
  delta: number;
  unit?: string;
  label?: string;
}

export function DeltaDisplay({ delta, unit = 'ΔL*', label }: DeltaDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {label && <span className="text-neutral-500">{label}</span>}
      <span className="font-mono text-neutral-300">
        {unit} {delta.toFixed(1)}
      </span>
    </div>
  );
}