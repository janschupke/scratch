import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-vscode-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full px-3 py-2 border border-vscode-border rounded-md shadow-sm',
            'bg-vscode-sidebar text-vscode-text placeholder-vscode-muted',
            'focus:outline-none focus:ring-2 focus:ring-vscode-accent focus:border-vscode-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-semantic-error focus:ring-semantic-error focus:border-semantic-error',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            error ? 'text-semantic-error' : 'text-vscode-muted'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 
