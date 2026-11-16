import { useT } from '@/i18n';
import { useEffect, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Logo } from './Logo';
import { UpgradeModal } from '../premium/UpgradeModal';
import { Toaster } from '../ui/Toaster';

export function AppShell({ active, children }: { active: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { state, persisted } = useStore();
  const t = useT();

  useEffect(() => setOpen(false), [active]);

  return (
    <div className={cn('app-bg flex h-full', state.settings.reduceMotion && 'reduce-motion')}>
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.06] bg-ink-900/60 backdrop-blur-xl lg:block">
        <Sidebar active={active} />
      </aside>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div className={cn('absolute inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={() => setOpen(false)} />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-white/10 bg-ink-900 shadow-2xl transition-transform duration-300',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button onClick={() => setOpen(false)} className="absolute right-3 top-6 rounded-lg p-1.5 text-fog-400 hover:bg-white/10" aria-label={t('Close menu')}>
            <X className="h-4 w-4" />
          </button>
          <Sidebar active={active} onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/[0.06] bg-ink-900/70 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Logo />
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-fog-300 hover:bg-white/10" aria-label={t('Open menu')}>
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <main id="main-scroll" className="flex-1 overflow-y-auto">
          {!persisted && (
            <div className="border-b border-amber-300/20 bg-amber-300/10 px-4 py-2 text-center text-xs text-amber-100">
              {t('Your browser is blocking local storage, so changes will be lost when you close this tab.')}
            </div>
          )}
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</div>
        </main>
      </div>
      <UpgradeModal />
      <Toaster />
    </div>
  );
}
