import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none capitalize';
    
    const sizes = {
      sm: 'px-3.5 py-1.5 text-[13px]',
      md: 'px-6 py-3 text-[14px]',
      lg: 'px-8 py-3.5 text-[16px]',
    };

    const variants = {
      primary: 'bg-apple-blue text-white hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-lg',
      secondary: 'bg-apple-gray-100 text-apple-black hover:bg-apple-gray-200 dark:bg-[#2C2C2E] dark:text-white dark:hover:bg-[#3A3A3C] hover:-translate-y-[2px]',
      outline: 'border border-apple-gray-300 text-apple-black hover:bg-apple-gray-100 dark:border-[#38383A] dark:text-white dark:hover:bg-[#2C2C2E] hover:-translate-y-[2px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
