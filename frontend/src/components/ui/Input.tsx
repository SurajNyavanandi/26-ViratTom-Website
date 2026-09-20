import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-lg border border-apple-gray-300 bg-white px-3 py-2 text-[16px] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-apple-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#38383A] dark:bg-[#1C1C1E] dark:text-white',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
