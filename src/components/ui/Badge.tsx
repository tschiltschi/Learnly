import { useT } from '@/i18n';
import type { ReactNode } from 'react';
import { Crown, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Badge({ children, className, tone = 'neutral' }: { children: ReactNode; className?: string; tone?: 'neutral' | 'purple' | 'blue' | 'green' | 'amber' | 'rose' }) {
  const tones = {
    neutral: 'bg-white/[0.06] text-fog-300 border-white/10',
    purple: 'bg-violet-500/10 text-violet-300 border-violet-400/20',
    blue: 'bg-sky-500/10 text-sky-300 border-sky-400/20',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
    amber: 'bg-amber-400/10 text-amber-200 border-amber-300/25',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-400/20',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

export function PremiumBadge({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300/20 to-orange-300/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200 ring-1 ring-amber-300/30',
        className,
      )}
    >
      <Crown className="h-3 w-3" />
      {!compact && 'Pro'}
    </span>
  );
}

/** Marks content that comes from the demo layer instead of a real AI model. */
export function DemoBadge({ className, label = 'Demo' }: { className?: string; label?: string }) {
  const t = useT();
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-sky-300/40 bg-sky-400/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-200', className)}>
      <FlaskConical className="h-3 w-3" />
      {t(label)}
    </span>
  );
}
