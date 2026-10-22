import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:border-neutral-800',
  secondary:
    'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:border-neutral-800',
  ghost:
    'bg-transparent hover:bg-neutral-800 text-neutral-200 border border-transparent disabled:text-neutral-600',
  danger:
    'bg-red-600 hover:bg-red-500 text-white border border-red-500 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:border-neutral-800',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}