import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

/**
 * Reusable Input Atom
 * Crisp monochrome aesthetics with subtle blue focus states
 */
export const Input = forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    error,
    helperText,
    className = '',
    required = false,
    rows,
    ...props
  },
  ref
) {
  const isTextarea = type === 'textarea';
  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium tracking-wider uppercase text-slate-500 mb-1.5"
        >
          {label} {required && <span className="text-[#0071e3]">*</span>}
        </label>
      )}

      <Component
        ref={ref}
        id={id}
        type={!isTextarea ? type : undefined}
        rows={isTextarea ? rows || 4 : undefined}
        className={cn(
          'w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors duration-150 outline-none',
          error
            ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-slate-200 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]',
          isTextarea ? 'resize-y' : '',
          className
        )}
        {...props}
      />

      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
