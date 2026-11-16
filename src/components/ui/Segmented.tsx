import { cn } from '@/lib/utils';

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn('inline-flex rounded-xl border border-white/10 bg-ink-900/70 p-1', className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition',
            value === o.value ? 'bg-white/10 text-fog-100 shadow-sm' : 'text-fog-400 hover:text-fog-200',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
