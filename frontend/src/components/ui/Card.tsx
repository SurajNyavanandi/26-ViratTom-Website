import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hoverEffect = true,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-apple-gray-200 dark:border-[#2C2C2E] bg-white dark:bg-[#1C1C1E] text-apple-black dark:text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out',
        hoverEffect && 'hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

