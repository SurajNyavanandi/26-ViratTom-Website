import { cn } from '../../utils/helpers';

/**
 * Reusable Badge Atom
 */
export function Badge({
  children,
  variant = 'neutral',
  dot = false,
  pulse = false,
  className = '',
  id,
}) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dotColors = {
    neutral: 'bg-slate-500',
    blue: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  return (
    <span
      id={id}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide whitespace-nowrap',
        variants[variant] || variants.neutral,
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant] || dotColors.neutral
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              dotColors[variant] || dotColors.neutral
            )}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
