import { useT } from '@/i18n';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

export function Flashcard({
  card,
  flipped,
  onFlip,
  frontLabel,
  backLabel,
  accent = 'violet',
}: {
  card: FlashcardData;
  flipped: boolean;
  onFlip: () => void;
  frontLabel: string;
  backLabel: string;
  accent?: 'violet' | 'emerald' | 'sky';
}) {
  const accents = {
    violet: { glow: 'from-violet-500/20', chip: 'text-violet-300 bg-violet-500/10', back: 'from-violet-600/30 via-ink-800 to-ink-850' },
    emerald: { glow: 'from-emerald-500/20', chip: 'text-emerald-300 bg-emerald-500/10', back: 'from-emerald-600/25 via-ink-800 to-ink-850' },
    sky: { glow: 'from-sky-500/20', chip: 'text-sky-300 bg-sky-500/10', back: 'from-sky-600/25 via-ink-800 to-ink-850' },
  }[accent];
  const t = useT();
  const long = Math.max(card.front.length, card.back.length) > 80;

  return (
    <div className="flip-scene w-full">
      <button
        type="button"
        onClick={onFlip}
        className={cn('flip-card block h-[300px] w-full sm:h-[340px]', flipped && 'is-flipped')}
        aria-label={flipped ? t('Show front of card') : t('Reveal answer')}
      >
        {/* Front */}
        <div className={cn('flip-face flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-850 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]')}>
          <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent', accents.glow)} />
          <div className="relative flex items-center justify-between px-6 pt-5">
            <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider', accents.chip)}>{frontLabel}</span>
            <span className="text-[11px] text-fog-500">{t('Tap or press Space to flip')}</span>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-8 text-center">
            <p className={cn('font-display font-semibold text-fog-100', long ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}>{card.front}</p>
          </div>
        </div>
        {/* Back */}
        <div className={cn('flip-face flip-back flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]', accents.back)}>
          <div className="relative flex items-center justify-between px-6 pt-5">
            <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider', accents.chip)}>{backLabel}</span>
            <RotateCcw className="h-3.5 w-3.5 text-fog-500" />
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className={cn('font-display font-semibold text-white', long ? 'text-lg sm:text-xl' : 'text-3xl sm:text-4xl')}>{card.back}</p>
            {card.hint && <p className="text-sm text-fog-300">{card.hint}</p>}
          </div>
        </div>
      </button>
    </div>
  );
}
