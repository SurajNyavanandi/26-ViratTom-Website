import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

/**
 * Reusable Button Atom
 * Supports multiple variants tailored for Apple/Nike-style minimalism.
 */
export const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    icon: Icon = null,
    iconPosition = 'left',
    id,
    ...props
  },
  ref
) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    // High contrast black button
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-transparent',
    // System Blue Accent
    'system-blue':
      'bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-sm border border-transparent',
    // Subtle Secondary
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200',
    // Minimalist Outline
    outline:
      'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-300',
    // Ghost
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-full gap-1.5',
    md: 'text-sm px-4 py-2 rounded-full gap-2',
    lg: 'text-base px-6 py-3 rounded-full gap-2.5',
  };

  return (
    <button
      ref={ref}
      id={id}
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
});

export default Button;
