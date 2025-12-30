'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  suffix?: string;
  onMax?: () => void;
  showMax?: boolean;
  onChange?: (value: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, suffix, onMax, showMax, onChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'w-full h-14 px-4 pr-24 bg-aztec-card border border-aztec-border rounded-xl',
              'text-white text-xl placeholder:text-gray-500',
              'focus:outline-none focus:border-aztec-purple focus:ring-1 focus:ring-aztec-purple',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-aztec-error focus:border-aztec-error focus:ring-aztec-error',
              className
            )}
            disabled={disabled}
            onChange={handleChange}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {showMax && onMax && (
              <button
                type="button"
                onClick={onMax}
                disabled={disabled}
                className="px-2 py-1 text-xs font-medium text-aztec-purple hover:text-aztec-purple-light transition-colors disabled:opacity-50"
              >
                MAX
              </button>
            )}
            {suffix && (
              <span className="text-gray-400 font-medium">{suffix}</span>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-aztec-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
