import { Globe } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { LANGUAGE_OPTIONS, type Lang } from '@/i18n';
import { cn } from '@/lib/utils';
import { withSampleLanguage } from '@/data/seed';

/** Compact EN / DE switch. The choice is saved with the other settings. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { state, update } = useStore();
  const lang = state.settings.language;
  const set = (l: Lang) => update((s) => withSampleLanguage(s, l));
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl border border-white/10 bg-ink-900/70 p-1', className)} role="radiogroup" aria-label="Language / Sprache">
      <Globe className="ml-1.5 h-3.5 w-3.5 text-fog-500" />
      {LANGUAGE_OPTIONS.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={lang === o.value}
          onClick={() => set(o.value)}
          title={o.label}
          className={cn('rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition', lang === o.value ? 'bg-white/10 text-fog-100' : 'text-fog-500 hover:text-fog-200')}
        >
          {o.value}
        </button>
      ))}
    </div>
  );
}
