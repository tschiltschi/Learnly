import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useStore } from '@/store/AppStore';

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[80] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:translate-x-0" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex animate-fade-up items-center gap-2.5 rounded-xl border border-white/10 bg-ink-800/95 px-4 py-3 text-sm text-fog-100 shadow-2xl backdrop-blur">
          {t.tone === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
          {t.tone === 'info' && <Info className="h-4 w-4 shrink-0 text-sky-400" />}
          {t.tone === 'error' && <XCircle className="h-4 w-4 shrink-0 text-rose-400" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}
