import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-8px_rgba(124,58,237,0.7)] hover:bg-brand-500',
  secondary: 'bg-white/[0.06] text-fog-100 border border-white/10 hover:bg-white/10 hover:border-white/15',
  outline: 'border border-white/15 text-fog-100 hover:bg-white/[0.05]',
  ghost: 'text-fog-300 hover:text-fog-100 hover:bg-white/[0.06]',
  danger: 'bg-rose-500/10 text-rose-300 border border-rose-400/20 hover:bg-rose-500/20',
  premium:
    'text-ink-950 bg-gradient-to-r from-amber-300 via-amber-200 to-orange-300 shadow-[0_8px_24px_-8px_rgba(245,181,68,0.6)] hover:brightness-105',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});
