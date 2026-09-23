import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: string;
}

export const Input = React.memo<InputProps>(({ className = '', error, ...props }) => {
  return (
    <div className="w-full">
      <input
        className={`w-full rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100/60 dark:bg-[#2C2C2E] px-4 py-2.5 text-[14px] text-apple-black dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-apple-red focus:ring-apple-red' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[12px] text-apple-red">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
