import { cn } from '@/lib/utils';

export function ProgressBar({ value, className, color = 'bg-brand-500', height = 'h-1.5' }: { value: number; className?: string; color?: string; height?: string }) {
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-white/[0.07]', height, className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  color = '#8b5cf6',
  track = 'rgba(255,255,255,0.07)',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
