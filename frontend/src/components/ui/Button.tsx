import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.memo<ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none min-h-[44px] transition-colors';

  const variantStyles = {
    primary: 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)] hover:shadow-[0_6px_16px_rgba(0,113,227,0.35)]',
    secondary: 'bg-[#F5F5F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-apple-black dark:text-white shadow-xs hover:shadow-md',
    outline: 'border border-apple-gray-300 dark:border-[#38383A] bg-transparent hover:bg-apple-gray-100/70 dark:hover:bg-[#2C2C2E] text-apple-black dark:text-white hover:shadow-sm',
    danger: 'bg-[#FF3B30] hover:bg-[#FF453A] text-white shadow-xs hover:shadow-md',
    ghost: 'bg-transparent hover:bg-apple-gray-100/50 dark:hover:bg-[#2C2C2E]/50 text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white',
  };

  const sizeStyles = {
    sm: 'text-[13px] px-3.5 py-2 rounded-[10px] gap-1.5 min-h-[38px]',
    md: 'text-[15px] px-6 py-3 rounded-[12px] gap-2 min-h-[44px]',
    lg: 'text-[16px] px-8 py-3.5 rounded-[12px] gap-2.5 min-h-[48px]',
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.015, y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={isDisabled}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

