import { useT } from '@/i18n';
import { Crown, LogOut } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import { overview } from '@/lib/stats';
import { Logo } from './Logo';
import { NAV_FOOTER, NAV_MAIN, NAV_PREMIUM, PREMIUM_FEATURE_NAMES, type NavItem } from './nav';
import { PremiumBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/Progress';

export function Sidebar({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  const { state, isPremium, openUpgrade, signOut } = useStore();
  const t = useT();
  const ov = overview(state);
  const goalPct = Math.min(100, Math.round((ov.todayMinutes / state.settings.dailyGoal) * 100));

  const go = (item: NavItem) => {
    if (item.premium && !isPremium) {
      openUpgrade(PREMIUM_FEATURE_NAMES[item.route]);
      onNavigate?.();
      return;
    }
    navigate(item.route);
    onNavigate?.();
  };

  const renderItem = (item: NavItem) => {
    const isActive = active === item.route;
    const locked = item.premium && !isPremium;
    return (
      <button
        key={item.route}
        onClick={() => go(item)}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition',
          isActive ? 'bg-white/[0.07] text-fog-100' : 'text-fog-400 hover:bg-white/[0.04] hover:text-fog-100',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {isActive && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand-400" />}
        <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-brand-300' : 'text-fog-500 group-hover:text-fog-300')} />
        <span className="truncate">{t(item.label)}</span>
        {item.premium && <PremiumBadge className={cn('ml-auto', !locked && 'opacity-50')} compact />}
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <button onClick={() => navigate('dashboard')} className="px-5 pb-5 pt-6 text-left">
        <Logo />
      </button>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div className="space-y-0.5">{NAV_MAIN.map(renderItem)}</div>
        <div>
          <div className="eyebrow mb-2 px-3">{t('Premium')}</div>
          <div className="space-y-0.5">{NAV_PREMIUM.map(renderItem)}</div>
        </div>
        <div className="space-y-0.5">
          {NAV_FOOTER.filter((i) => !(i.route === 'pricing' && isPremium)).map((item) =>
            item.route === 'pricing' ? (
              <button
                key={item.route}
                onClick={() => {
                  navigate('pricing');
                  onNavigate?.();
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium text-amber-200 transition hover:bg-amber-300/10',
                  active === 'pricing' && 'bg-amber-300/10',
                )}
              >
                <Crown className="h-[18px] w-[18px]" />
                {t('Upgrade to Premium')}
              </button>
            ) : (
              renderItem(item)
            ),
          )}
        </div>
      </nav>

      <div className="space-y-3 border-t border-white/[0.06] p-3">
        <div className="rounded-xl bg-white/[0.03] px-3 py-3 ring-1 ring-white/[0.05]">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-fog-400">{t("Today's goal")}</span>
            <span className="font-medium tabular-nums text-fog-200">
              {ov.todayMinutes}/{state.settings.dailyGoal} {t('min')}
            </span>
          </div>
          <ProgressBar value={goalPct} color="bg-gradient-to-r from-brand-500 to-sky-400" />
        </div>
        <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-indigo-600 text-xs font-semibold text-white">
            {(state.user?.name ?? 'S').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-fog-100">{state.user?.name ?? t('Student')}</div>
            <div className="text-[11px] text-fog-500">{isPremium ? t('Premium plan') : t('Free plan')}</div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate('login');
            }}
            className="rounded-lg p-1.5 text-fog-500 transition hover:bg-white/5 hover:text-fog-200"
            title={t('Sign out')}
            aria-label={t('Sign out')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
