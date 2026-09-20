import { cn } from '../../utils/helpers';

/**
 * Reusable Card Atom
 */
export function Card({
  children,
  className = '',
  hoverEffect = false,
  id,
  onClick,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      id={id}
      onClick={onClick}
      className={cn(
        'bg-white border border-slate-200/80 rounded-2xl p-6 text-slate-800 shadow-sm transition-all duration-200',
        hoverEffect && 'hover:border-slate-300 hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, subtitle, badge, action, className = '' }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        {badge && <div className="mb-2">{badge}</div>}
        {title && <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default Card;
