import { useT } from '@/i18n';
import type { ReactNode } from 'react';
import { Crown, Lock } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { Button } from '../ui/Button';
import { PremiumBadge } from '../ui/Badge';
import { cn } from '@/lib/utils';

/** Full-page preview for a Premium page opened by a Free user: content stays visible but blurred. */
export function PremiumPageGate({ feature, description, children }: { feature: string; description: string; children: ReactNode }) {
  const { openUpgrade } = useStore();
  const t = useT();
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-60 blur-[3px]" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center pt-24">
        <div className="surface w-full max-w-md animate-scale-in p-7 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-300/10 ring-1 ring-amber-300/30">
            <Lock className="h-5 w-5 text-amber-200" />
          </div>
          <PremiumBadge className="mb-3" />
          <h2 className="font-display text-xl font-semibold text-fog-100">{t(feature)}</h2>
          <p className="mt-2 text-sm text-fog-400">{t(description)}</p>
          <Button variant="premium" className="mt-6 w-full" onClick={() => openUpgrade(feature)} icon={<Crown className="h-4 w-4" />}>
            {t('Unlock with Premium · €7.99/mo')}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** A card-sized locked feature tile used inside Free pages. */
export function LockedFeature({
  title,
  description,
  icon,
  className,
  onUnlocked,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  onUnlocked?: () => void;
}) {
  const { isPremium, openUpgrade } = useStore();
  const t = useT();
  return (
    <button
      onClick={() => (isPremium ? onUnlocked?.() : openUpgrade(title))}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition',
        isPremium
          ? 'border-white/[0.08] bg-ink-850/70 hover:border-amber-300/30 hover:bg-ink-800/80'
          : 'border-amber-300/15 bg-gradient-to-br from-amber-300/[0.06] to-transparent hover:border-amber-300/30',
        className,
      )}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/20">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fog-100">{t(title)}</span>
          <PremiumBadge compact={isPremium} />
        </div>
        <p className="mt-0.5 text-xs text-fog-400">{t(description)}</p>
      </div>
      {!isPremium && <Lock className="h-4 w-4 shrink-0 text-amber-200/60 transition group-hover:text-amber-200" />}
    </button>
  );
}
