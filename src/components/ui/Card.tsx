import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, interactive, ...rest }: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div className={cn('surface', interactive && 'surface-hover cursor-pointer', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold text-fog-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-fog-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
