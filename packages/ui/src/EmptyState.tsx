import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <h3 className="text-lg font-semibold text-neutral-300 mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-500 text-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}