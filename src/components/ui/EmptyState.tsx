import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-fog-300" />
      </div>
      <h3 className="font-display text-base font-semibold text-fog-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-fog-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
