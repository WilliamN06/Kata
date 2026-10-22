import type { ReactNode } from 'react';

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function ToggleButton({ active, onClick, children }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
        active
          ? 'bg-blue-600 border-blue-500 text-white'
          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}

interface ToggleGroupProps {
  children: ReactNode;
}

export function ToggleGroup({ children }: ToggleGroupProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap justify-center">
      {children}
    </div>
  );
}