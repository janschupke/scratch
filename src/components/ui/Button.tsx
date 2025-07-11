import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, onClick, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-vscode-accent text-white hover:bg-blue-600 focus:ring-blue-500',
      secondary: 'bg-vscode-sidebar text-vscode-text border border-vscode-border hover:bg-vscode-hover',
      danger: 'bg-semantic-error text-white hover:bg-red-600 focus:ring-red-500',
      ghost: 'text-vscode-text hover:bg-vscode-hover focus:ring-vscode-accent',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e as any);
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div 
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
            data-testid="loading-spinner"
          />
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button'; 
