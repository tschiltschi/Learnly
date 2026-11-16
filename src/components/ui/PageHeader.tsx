import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { navigate } from '@/lib/router';

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  back?: { label: string; to: string };
}) {
  return (
    <div className="mb-7 animate-fade-up">
      {back && (
        <button onClick={() => navigate(back.to)} className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-fog-400 transition hover:text-fog-100">
          <ChevronLeft className="h-3.5 w-3.5" />
          {back.label}
        </button>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <div className="mb-2">{eyebrow}</div>}
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fog-100 sm:text-[28px]">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-fog-400">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
