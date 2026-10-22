import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', interactive = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-neutral-900 border border-neutral-800 rounded-lg p-5 ${
        interactive
          ? 'hover:bg-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}